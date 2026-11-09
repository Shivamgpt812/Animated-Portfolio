const CACHE_NAME = 'shivamweb-cache-v1';

const STATIC_SHELL = [
  '/',
  '/index.html',
  '/work.html',
  '/blog.html',
  '/404.html',
  '/index.css',
  '/manifest.json',
  '/head/favion-32x32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/head/apple-touch-icon.png'
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for navigation/HTML, Stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests for our own origin (or CDNs)
  if (req.method !== 'GET') return;

  // For HTML / Navigation requests: Network First, Fallback to Cache
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedRes = await caches.match(req);
          if (cachedRes) return cachedRes;
          return caches.match('/404.html');
        })
    );
    return;
  }

  // For CSS, JS, Fonts, and Images: Stale-While-Revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.match(/\.(css|js|woff2|woff|ttf|png|webp|svg|jpg|jpeg|ico)$/) ||
     url.pathname.startsWith('/images/') ||
     url.pathname.startsWith('/icons/') ||
     url.pathname.startsWith('/head/'))
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const copy = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return networkRes;
          })
          .catch(() => cachedRes);

        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // Default fetch fallback
  event.respondWith(
    caches.match(req).then((cachedRes) => cachedRes || fetch(req))
  );
});

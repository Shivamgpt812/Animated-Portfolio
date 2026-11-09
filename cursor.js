/**
 * Exact Custom Cursor Implementation matching index.html
 * Handles mouse tracking, smooth GSAP interpolation, and state transitions:
 *  - Default: 14px solid orange dot (#FF923E)
 *  - Pointer (links, logo): 28px hollow orange ring (#FF923E)
 *  - Pointer (buttons, cards): 28px hollow navy ring (#091434)
 *  - Circle (menu items): 55px solid orange circle (#FF923E) with centered white arrow
 */
(function initCustomCursor() {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.customCursorInitialized) return;
    window.customCursorInitialized = true;

    function run() {
        const hoverIcon = document.getElementById('hover-icon');
        const hoverContent = document.getElementById('hover-content');
        if (!hoverIcon) return;

        // Hide on touch/mobile devices
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
        if (isTouch) {
            hoverIcon.style.display = 'none';
            return;
        }

        let currentIcon = '';
        const currentBaseColor = '#FF923E';
        let cursorRevealed = false;

        // Apply critical base styling
        hoverIcon.style.position = 'fixed';
        hoverIcon.style.top = '0';
        hoverIcon.style.left = '0';
        hoverIcon.style.pointerEvents = 'none';
        hoverIcon.style.zIndex = '99999';
        hoverIcon.style.borderRadius = '50%';
        hoverIcon.style.display = 'flex';
        hoverIcon.style.justifyContent = 'center';
        hoverIcon.style.alignItems = 'center';
        hoverIcon.style.boxSizing = 'content-box';
        hoverIcon.style.transition = 'height 0.2s ease, width 0.2s ease, border-color 0.2s ease, border-width 0.2s ease, background-color 0.2s ease';

        if (hoverContent) {
            hoverContent.style.width = '30px';
            hoverContent.style.height = '30px';
            hoverContent.style.maxWidth = '30px';
            hoverContent.style.maxHeight = '30px';
            hoverContent.classList.add('hide');
        }

        if (window.gsap) {
            gsap.set(hoverIcon, { xPercent: -50, yPercent: -50, scale: 0 });
        } else {
            hoverIcon.style.transform = 'translate(-50%, -50%) scale(0)';
        }

        function setupDefault() {
            if (currentIcon === 'default') return;
            currentIcon = 'default';
            hoverIcon.style.borderWidth = '7px';
            hoverIcon.style.borderStyle = 'solid';
            hoverIcon.style.borderColor = currentBaseColor;
            hoverIcon.style.height = '0px';
            hoverIcon.style.width = '0px';
            hoverIcon.style.backgroundColor = 'transparent';
            if (hoverContent) {
                hoverContent.classList.add('hide');
                hoverContent.style.display = 'none';
            }
            document.body.style.cursor = '';
        }

        function setupPointer(color) {
            const targetColor = color || '#091434';
            if (currentIcon === 'pointer' && hoverIcon.style.borderColor === targetColor) return;
            currentIcon = 'pointer';
            hoverIcon.style.borderWidth = '5px';
            hoverIcon.style.borderStyle = 'solid';
            hoverIcon.style.borderColor = targetColor;
            hoverIcon.style.height = '18px';
            hoverIcon.style.width = '18px';
            hoverIcon.style.backgroundColor = 'transparent';
            if (hoverContent) {
                hoverContent.classList.add('hide');
                hoverContent.style.display = 'none';
            }
            document.body.style.cursor = 'pointer';
        }

        function setupCircle(color) {
            if (currentIcon === 'circle') return;
            currentIcon = 'circle';
            hoverIcon.style.borderWidth = '0px';
            hoverIcon.style.borderStyle = 'none';
            hoverIcon.style.height = '55px';
            hoverIcon.style.width = '55px';
            hoverIcon.style.backgroundColor = color || currentBaseColor;
            if (hoverContent) {
                hoverContent.classList.remove('hide');
                hoverContent.style.display = 'block';
            }
            document.body.style.cursor = '';
        }

        setupDefault();

        function revealCursor() {
            if (cursorRevealed) return;
            cursorRevealed = true;
            hoverIcon.style.opacity = '1';
            if (window.gsap) {
                gsap.to(hoverIcon, { scale: 1, duration: 0.3, ease: 'power2.out' });
            } else {
                hoverIcon.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }

        // Wait for preloader intro to hide if present
        const intro = document.getElementById('intro-container');
        if (intro && !intro.classList.contains('hide')) {
            const observer = new MutationObserver(() => {
                if (intro.classList.contains('hide') || intro.style.display === 'none') {
                    observer.disconnect();
                    setTimeout(revealCursor, 200);
                }
            });
            observer.observe(intro, { attributes: true, attributeFilter: ['class', 'style'] });
            setTimeout(revealCursor, 2800);
        } else {
            revealCursor();
        }

        // Track mouse position with GSAP Power3.easeOut duration 0.4 matching index.js
        window.addEventListener('mousemove', (e) => {
            revealCursor();
            if (window.gsap) {
                gsap.to(hoverIcon, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.4,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });
            } else {
                hoverIcon.style.left = e.clientX + 'px';
                hoverIcon.style.top = e.clientY + 'px';
            }
        });

        // Window boundary fading
        document.addEventListener('mouseleave', () => {
            if (window.gsap) gsap.to(hoverIcon, { opacity: 0, duration: 0.2 });
            else hoverIcon.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            if (window.gsap) gsap.to(hoverIcon, { opacity: 1, duration: 0.2 });
            else hoverIcon.style.opacity = '1';
        });

        // Interactive hover selectors
        const cardOrBtnSelector = 'button, .overlay-button, .small-button, .project-card, .blog-card, .featured-card, .rel-card, .cat-btn, .filter-btn, input, textarea, .contact-input, .cta-button, .cta-btn';
        const orangeLinkSelector = 'a, #logo-click-container, .legal-link, .back-link';
        const allInteractiveSelector = `.menu-item, ${cardOrBtnSelector}, ${orangeLinkSelector}`;

        document.addEventListener('mouseover', (e) => {
            // 1. Menu Items: circle with SVG arrow unless it's active page
            const menuItem = e.target.closest('.menu-item');
            if (menuItem) {
                if (!menuItem.classList.contains('active-menu-item')) {
                    setupCircle('#FF923E');
                    return;
                }
            }

            // 2. Buttons, Cards, Inputs: navy ring
            const navyBtn = e.target.closest(cardOrBtnSelector);
            if (navyBtn) {
                setupPointer('#091434');
                return;
            }

            // 3. Links and logo: orange ring
            const orangeLink = e.target.closest(orangeLinkSelector);
            if (orangeLink) {
                setupPointer('#FF923E');
                return;
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest(allInteractiveSelector);
            if (target) {
                const nextEl = e.relatedTarget ? e.relatedTarget.closest(allInteractiveSelector) : null;
                if (!nextEl) {
                    setupDefault();
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();

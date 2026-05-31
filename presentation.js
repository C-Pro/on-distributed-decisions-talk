// Presentation Framework Configuration & Engine
(async function() {
    // Dynamically load presentation settings from pages/index.js
    let slides = [];
    let presentationTitle = '';

    try {
        const config = await import('./pages/index.js');
        slides = config.slides || [];
        presentationTitle = config.presentationTitle || '';
    } catch (error) {
        console.error('Failed to load presentation configuration from pages/index.js:', error);
    }

    // Dynamically update page title
    if (presentationTitle) {
        document.title = presentationTitle;
    }

    let currentSlideIndex = 0;
    const container = document.getElementById('presentation-container');

    // Parse URL hash to load correct slide on page refresh/direct link
    function getSlideIndexFromHash() {
        const hash = window.location.hash;
        if (hash) {
            const index = parseInt(hash.replace('#', ''), 10) - 1;
            if (!isNaN(index) && index >= 0 && index < slides.length) {
                return index;
            }
        }
        return 0;
    }

    // Update URL hash without causing a page reload
    function updateHash(index) {
        window.location.hash = index + 1;
    }

    // Fetch and load slide content into the DOM, handling dependencies
    async function loadSlide(index) {
        if (index < 0 || index >= slides.length) return;

        const url = slides[index];
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch slide: ${url} (Status: ${response.status})`);
            }
            const htmlContent = await response.text();

            // Parse the HTML content to extract dependencies
            const parser = new DOMParser();
            const parsedDoc = parser.parseFromString(htmlContent, 'text/html');

            // Extract script dependency manifest links (<link rel="preload" as="script">)
            const preloads = parsedDoc.querySelectorAll('link[rel="preload"][as="script"]');
            const scriptLoads = Array.from(preloads).map(link => {
                const src = link.getAttribute('href');
                return new Promise((resolve) => {
                    // Check if script is already present in document.head
                    if (document.querySelector(`script[src="${src}"]`)) {
                        resolve();
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => resolve();
                    script.onerror = () => {
                        console.error(`Failed to load slide dependency: ${src}`);
                        resolve(); // Resolve to prevent hanging the page render
                    };
                    document.head.appendChild(script);
                });
            });

            // Extract style dependency manifest links (<link rel="preload" as="style">)
            const stylePreloads = parsedDoc.querySelectorAll('link[rel="preload"][as="style"]');
            const styleLoads = Array.from(stylePreloads).map(link => {
                const href = link.getAttribute('href');
                return new Promise((resolve) => {
                    // Check if stylesheet is already present in document.head
                    if (document.querySelector(`link[href="${href}"][rel="stylesheet"]`)) {
                        resolve();
                        return;
                    }
                    const styleLink = document.createElement('link');
                    styleLink.rel = 'stylesheet';
                    styleLink.href = href;
                    styleLink.onload = () => resolve();
                    styleLink.onerror = () => {
                        console.error(`Failed to load slide style dependency: ${href}`);
                        resolve(); // Resolve to prevent hanging
                    };
                    document.head.appendChild(styleLink);
                });
            });

            // Await all scripts and styles to be fetched and executed before rendering the page content
            await Promise.all([...scriptLoads, ...styleLoads]);

            // To prevent flicker, overwrite the DOM in a single synchronous operation
            // We use parsedDoc.body.innerHTML so we only inject the main slide elements
            container.innerHTML = parsedDoc.body.innerHTML;

            currentSlideIndex = index;
            updateHash(currentSlideIndex);

            // Lifecycle hook: check if slide has an init function designated by data-init attribute
            const slideElement = container.querySelector('.slide');
            if (slideElement) {
                const initCallbackName = slideElement.getAttribute('data-init');
                if (initCallbackName && typeof window[initCallbackName] === 'function') {
                    window[initCallbackName]();
                }
            }
        } catch (error) {
            console.error('Error loading slide:', error);
            container.innerHTML = `
                <div class="slide center">
                    <div class="content-wrapper">
                        <h2>Error Loading Slide</h2>
                        <p>${error.message}</p>
                    </div>
                </div>
            `;
        }
    }

    // Keyboard handlers (Strictly Page Up and Page Down only)
    function handleKeyDown(event) {
        if (event.key === 'PageDown') {
            event.preventDefault(); // Prevent page scroll behavior
            if (currentSlideIndex < slides.length - 1) {
                loadSlide(currentSlideIndex + 1);
            }
        } else if (event.key === 'PageUp') {
            event.preventDefault(); // Prevent page scroll behavior
            if (currentSlideIndex > 0) {
                loadSlide(currentSlideIndex - 1);
            }
        }
    }

    // Initialize Presentation
    function init() {
        // Load initial slide based on current hash or default to first
        const initialIndex = getSlideIndexFromHash();
        loadSlide(initialIndex);

        // Bind global key listener
        window.addEventListener('keydown', handleKeyDown);

        // Bind global touch listeners for swipe gestures (both horizontal and vertical)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        window.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].clientX;
            touchStartY = event.changedTouches[0].clientY;
            touchStartTime = Date.now();
            console.log('touchstart:', { x: touchStartX, y: touchStartY });
        }, { passive: true });

        window.addEventListener('touchend', (event) => {
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            const touchEndTime = Date.now();

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const elapsedTime = touchEndTime - touchStartTime;

            console.log('touchend:', {
                endX: touchEndX,
                endY: touchEndY,
                diffX: diffX,
                diffY: diffY,
                elapsedTime: elapsedTime
            });

            // Thresholds for swipe:
            // - Elapsed time must be quick (< 800ms to allow emulators to drag-and-swipe successfully)
            // - Horizontal distance is >= 50px (and horizontal > vertical to ignore vertical scrolling)
            if (elapsedTime <= 800) {
                const absDiffX = Math.abs(diffX);
                const absDiffY = Math.abs(diffY);

                if (absDiffX >= 50 && absDiffX > absDiffY) {
                    // Horizontal swipe
                    if (diffX < 0) {
                        // Swipe Left -> Next Slide
                        if (currentSlideIndex < slides.length - 1) {
                            loadSlide(currentSlideIndex + 1);
                        }
                    } else {
                        // Swipe Right -> Prev Slide
                        if (currentSlideIndex > 0) {
                            loadSlide(currentSlideIndex - 1);
                        }
                    }
                }
            }
        }, { passive: true });

        // Respond to browser back/forward buttons (popstate / hashchange)
        window.addEventListener('hashchange', () => {
            const hashIndex = getSlideIndexFromHash();
            if (hashIndex !== currentSlideIndex) {
                loadSlide(hashIndex);
            }
        });

        // Theme Toggle Handler
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('presentation-theme', newTheme);
            });
        }
    }

    // Start on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

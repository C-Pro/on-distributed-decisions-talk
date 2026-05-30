// Presentation Framework Configuration & Engine
(function() {
    // List of page URLs representing each slide in the presentation
    const slides = [
        'pages/01-intro.html',
        'pages/02-importance-of-decisions.html'
    ];

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
            
            // Await all scripts to be fetched and executed before rendering the page content
            await Promise.all(scriptLoads);
            
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

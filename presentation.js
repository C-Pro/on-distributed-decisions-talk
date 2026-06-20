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
    let currentSlideNotes = null;
    let controlsTimeout = null;

    // Lightweight, robust Markdown-to-HTML parser
    function parseMarkdown(md) {
        if (!md) return '';
        const lines = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        
        let html = [];
        let inList = null; // 'ul', 'ol', or null
        let inCodeBlock = false;
        let inBlockquote = false;
        let paragraphBuffer = [];

        function flushParagraph() {
            if (paragraphBuffer.length > 0) {
                html.push(`<p>${parseInlineMarkdown(paragraphBuffer.join(' '))}</p>`);
                paragraphBuffer = [];
            }
        }

        function flushList() {
            if (inList) {
                html.push(`</${inList}>`);
                inList = null;
            }
        }

        function flushBlockquote() {
            if (inBlockquote) {
                html.push('</blockquote>');
                inBlockquote = false;
            }
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // 1. Handle Code Blocks
            if (trimmed.startsWith('```')) {
                flushParagraph();
                flushList();
                flushBlockquote();
                if (inCodeBlock) {
                    html.push('</code></pre>');
                    inCodeBlock = false;
                } else {
                    // Extract optional language name
                    const lang = trimmed.slice(3).trim();
                    html.push(`<pre><code class="${lang ? 'language-' + lang : ''}">`);
                    inCodeBlock = true;
                }
                continue;
            }

            if (inCodeBlock) {
                // Escape HTML in code block
                html.push(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                continue;
            }

            // 2. Handle Horizontal Rule
            if (/^---+$|^___+$|^\*\*\*+$/.test(trimmed)) {
                flushParagraph();
                flushList();
                flushBlockquote();
                html.push('<hr>');
                continue;
            }

            // 3. Handle Headers
            if (trimmed.startsWith('#')) {
                const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
                if (headerMatch) {
                    flushParagraph();
                    flushList();
                    flushBlockquote();
                    const level = headerMatch[1].length;
                    html.push(`<h${level}>${parseInlineMarkdown(headerMatch[2])}</h${level}>`);
                    continue;
                }
            }

            // 4. Handle Blockquotes
            if (trimmed.startsWith('>')) {
                flushParagraph();
                flushList();
                if (!inBlockquote) {
                    html.push('<blockquote>');
                    inBlockquote = true;
                }
                const quoteContent = line.replace(/^\s*>\s*/, '');
                html.push(parseInlineMarkdown(quoteContent) + '<br>');
                continue;
            } else if (inBlockquote && trimmed !== '') {
                html.push(parseInlineMarkdown(trimmed) + '<br>');
                continue;
            } else {
                flushBlockquote();
            }

            // 5. Handle Unordered Lists
            const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
            if (ulMatch) {
                flushParagraph();
                if (inList !== 'ul') {
                    flushList();
                    html.push('<ul>');
                    inList = 'ul';
                }
                html.push(`<li>${parseInlineMarkdown(ulMatch[1])}</li>`);
                continue;
            }

            // 6. Handle Ordered Lists
            const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
            if (olMatch) {
                flushParagraph();
                if (inList !== 'ol') {
                    flushList();
                    html.push('<ol>');
                    inList = 'ol';
                }
                html.push(`<li>${parseInlineMarkdown(olMatch[1])}</li>`);
                continue;
            }

            // 7. Handle Paragraphs & Blank Lines
            if (trimmed === '') {
                flushParagraph();
                flushList();
            } else {
                flushList(); // end list block if we hit normal text
                paragraphBuffer.push(trimmed);
            }
        }

        // Flush any remaining buffers
        flushParagraph();
        flushList();
        flushBlockquote();

        return html.join('\n');
    }

    function parseInlineMarkdown(text) {
        let html = text;
        // Escape HTML characters to prevent XSS/rendering issues
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Inline Code: `code`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold: **bold** or __bold__
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Italic: *italic* or _italic_
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Link: [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        return html;
    }

    // Manage controls visibility using CSS animations and reflow
    function showControls() {
        const modal = document.getElementById('notes-modal');
        const modalIsOpen = modal && modal.classList.contains('open');
        
        if (modalIsOpen) {
            document.body.classList.add('modal-open');
            document.body.classList.remove('controls-visible');
        } else {
            document.body.classList.remove('modal-open');
            document.body.classList.remove('controls-visible');
            void document.body.offsetWidth; // Trigger reflow to restart CSS keyframe animations
            document.body.classList.add('controls-visible');
        }
    }

    // Modal helpers
    function openNotesModal() {
        const modal = document.getElementById('notes-modal');
        const content = document.getElementById('notes-content');
        if (modal && content && currentSlideNotes) {
            content.innerHTML = currentSlideNotes;
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            showControls();
        }
    }

    // Close notes modal helper
    function closeNotesModal() {
        const modal = document.getElementById('notes-modal');
        if (modal && modal.classList.contains('open')) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            showControls();
        }
    }

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

        // Hide notes button and close notes modal when changing slides
        const notesToggle = document.getElementById('notes-toggle');
        if (notesToggle) {
            notesToggle.style.display = 'none';
        }
        closeNotesModal();
        currentSlideNotes = null;

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
            container.innerHTML = parsedDoc.body.innerHTML;

            currentSlideIndex = index;
            updateHash(currentSlideIndex);

            // Fetch and parse slide notes if they exist
            const notesUrl = url.replace(/\.html$/, '.md');
            try {
                const notesResponse = await fetch(notesUrl);
                if (notesResponse.ok) {
                    const notesMd = await notesResponse.text();
                    currentSlideNotes = parseMarkdown(notesMd);
                    if (notesToggle && currentSlideNotes.trim()) {
                        notesToggle.style.display = 'flex';
                    }
                }
            } catch (err) {
                // Ignore errors fetching notes
            }

            // Lifecycle hook: check if slide has an init function designated by data-init attribute
            const slideElement = container.querySelector('.slide');
            if (slideElement) {
                const initCallbackName = slideElement.getAttribute('data-init');
                if (initCallbackName && typeof window[initCallbackName] === 'function') {
                    window[initCallbackName]();
                }
            }

            // Trigger controls visibility refresh on slide load
            showControls();
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

    // Keyboard handlers
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
        } else if (event.key === 'Escape') {
            const modal = document.getElementById('notes-modal');
            if (modal && modal.classList.contains('open')) {
                event.preventDefault();
                closeNotesModal();
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

        // Bind global touch listeners for swipe gestures
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        window.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].clientX;
            touchStartY = event.changedTouches[0].clientY;
            touchStartTime = Date.now();
            showControls();
        }, { passive: true });

        window.addEventListener('touchend', (event) => {
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            const touchEndTime = Date.now();

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const elapsedTime = touchEndTime - touchStartTime;

            if (elapsedTime <= 800) {
                const absDiffX = Math.abs(diffX);
                const absDiffY = Math.abs(diffY);

                if (absDiffX >= 50 && absDiffX > absDiffY) {
                    if (diffX < 0) {
                        if (currentSlideIndex < slides.length - 1) {
                            loadSlide(currentSlideIndex + 1);
                        }
                    } else {
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
                showControls();
            });
        }

        // Notes Toggle Handler
        const notesToggle = document.getElementById('notes-toggle');
        if (notesToggle) {
            notesToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const modal = document.getElementById('notes-modal');
                if (modal && modal.classList.contains('open')) {
                    closeNotesModal();
                } else {
                    openNotesModal();
                }
            });
        }

        // Modal Close and Backdrop Handlers
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeNotesModal();
            });
        }

        const notesModal = document.getElementById('notes-modal');
        if (notesModal) {
            notesModal.addEventListener('click', (e) => {
                if (e.target === notesModal) {
                    closeNotesModal();
                }
            });
        }

        // Register visual controls fade triggers
        let lastMouseX = 0;
        let lastMouseY = 0;
        window.addEventListener('mousemove', (e) => {
            if (e.clientX === lastMouseX && e.clientY === lastMouseY) return;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            showControls();
        });
        
        // Trigger initial controls fade sequence
        showControls();
    }

    // Start on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

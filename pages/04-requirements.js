(function() {
    // Keep track of active timeouts globally to prevent leaks when changing pages
    window.requirementsTimeouts = window.requirementsTimeouts || [];

    window.initRequirementsSlide = function() {
        // Clear all pending timeouts from previous slide loads
        window.requirementsTimeouts.forEach(clearTimeout);
        window.requirementsTimeouts = [];

        // Select all requirement elements
        const reqItems = [
            document.getElementById('req-availability'),
            document.getElementById('req-consistency'),
            document.getElementById('req-throughput'),
            document.getElementById('req-latency'),
            document.getElementById('req-scalability')
        ];

        // Ensure all elements are clean/hidden initially
        reqItems.forEach(item => {
            if (item) item.classList.remove('visible');
        });

        // Set up transition schedule
        // Slide loaded -> Title centered (Default)
        // 10 seconds -> First item appears
        // +5 seconds -> Next item appears
        const delayFirst = 3000;
        const delayInterval = 5000;

        reqItems.forEach((item, index) => {
            if (!item) return;

            const delay = delayFirst + (index * delayInterval);
            
            const timeoutId = setTimeout(() => {
                // Defensive check to ensure the element is still present in active DOM
                if (document.body.contains(item)) {
                    item.classList.add('visible');
                }
            }, delay);

            window.requirementsTimeouts.push(timeoutId);
        });
    };
})();

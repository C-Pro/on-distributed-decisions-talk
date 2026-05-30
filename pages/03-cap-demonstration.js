(function() {
    window.initCapSlide = function() {
        const board = document.getElementById('cap-board');
        const nodeA = document.getElementById('cap-node-a');
        const nodeB = document.getElementById('cap-node-b');
        const valA = document.getElementById('val-a');
        const valB = document.getElementById('val-b');
        const pulseA = document.getElementById('pulse-a');
        const pulseB = document.getElementById('pulse-b');
        
        const networkLink = document.getElementById('network-link');
        const hoverAction = document.getElementById('hover-action');
        
        const badgeC = document.getElementById('badge-c');
        const badgeA = document.getElementById('badge-a');
        const badgeP = document.getElementById('badge-p');

        // Robust guard to prevent addEventListener of null errors
        if (!board || !nodeA || !nodeB || !networkLink) {
            console.warn('CAP Demonstration elements not fully loaded in DOM.');
            return;
        }

        let state = {
            vA: 1,
            vB: 1,
            partitioned: false
        };

        function updateDOM() {
            // Update node values
            valA.textContent = `V = ${state.vA}`;
            valB.textContent = `V = ${state.vB}`;

            // Update partition visual states
            if (state.partitioned) {
                board.classList.add('partitioned');
                if (hoverAction) hoverAction.textContent = 'Click to Heal';
            } else {
                board.classList.remove('partitioned');
                if (hoverAction) hoverAction.textContent = 'Click to Partition';
            }

            // Evaluate CAP Badges
            // 1. Consistency: V on Node A must equal V on Node B
            if (badgeC) {
                if (state.vA === state.vB) {
                    badgeC.className = 'cap-badge ok';
                } else {
                    badgeC.className = 'cap-badge fail';
                }
            }

            // 2. Availability: Always green because nodes always accept clicks/writes
            if (badgeA) badgeA.className = 'cap-badge ok';

            // 3. Partition Tolerance: Always green since the whiteboard is partition-tolerant
            if (badgeP) badgeP.className = 'cap-badge ok';
        }

        function triggerPulse(nodeId) {
            const pulse = nodeId === 'a' ? pulseA : pulseB;
            if (!pulse) return;
            pulse.classList.remove('active');
            void pulse.offsetWidth; // Trigger reflow to restart animation
            pulse.classList.add('active');
        }

        // Event listener for Node A click
        nodeA.addEventListener('click', () => {
            triggerPulse('a');
            if (state.partitioned) {
                state.vA += 1;
            } else {
                state.vA += 1;
                state.vB = state.vA; // Synchronized instantly
            }
            updateDOM();
        });

        // Event listener for Node B click
        nodeB.addEventListener('click', () => {
            triggerPulse('b');
            if (state.partitioned) {
                state.vB += 1;
            } else {
                state.vB += 1;
                state.vA = state.vB; // Synchronized instantly
            }
            updateDOM();
        });

        // Event listener for partition toggle
        networkLink.addEventListener('click', (e) => {
            state.partitioned = !state.partitioned;
            if (!state.partitioned) {
                // When network is healed (clicked second time), sync nodes to max value of V
                const maxVal = Math.max(state.vA, state.vB);
                state.vA = maxVal;
                state.vB = maxVal;
            }
            updateDOM();
        });

        // Initial update
        updateDOM();
    };
})();

(function() {
    window.toolboxTimeouts = window.toolboxTimeouts || [];

    window.initToolboxSlide = function() {
        // Clear all active timeouts from previous runs
        window.toolboxTimeouts.forEach(clearTimeout);
        window.toolboxTimeouts = [];

        const stage = document.getElementById('cloud-stage');
        if (!stage) return;

        // Clear stage content
        stage.innerHTML = '';

        const terms = [
            { text: 'consensus', weight: 3 },
            { text: 'replication', weight: 3 },
            { text: 'sharding', weight: 3 },
            { text: 'caching', weight: 3 },
            
            { text: 'RAFT', weight: 2 },
            { text: 'ACID', weight: 2 },
            { text: 'leader election', weight: 2 },
            { text: 'conflict resolution', weight: 2 },
            { text: 'transactions', weight: 2 },
            { text: 'eventual consistency', weight: 2},
            { text: 'idempotency', weight: 2 },
            { text: 'retries', weight: 2 },
            { text: 'consistent hashing', weight: 2 },
            
            { text: 'active-passive', weight: 1 },
            { text: 'in-memory', weight: 1 },
            { text: 'persistence', weight: 1 },
            { text: 'WAL', weight: 1 },
            { text: 'split-brain', weight: 1 },
            { text: 'gossip', weight: 1 },
            { text: '2PC', weight: 1 },
            { text: 'saga', weight: 1 },
            { text: 'CRDT', weight: 1 },
            { text: 'sequencing', weight: 1 },
            { text: 'merkle trees', weight: 2 }
        ];

        // Shuffle terms to randomize the entry sequence
        const shuffled = [...terms].sort(() => Math.random() - 0.5);

        const placedBoxes = [];
        const wordDelay = 900; // Entry rate: one word every 900ms

        shuffled.forEach((term, index) => {
            const wordEl = document.createElement('span');
            wordEl.className = `cloud-word w-${term.weight === 3 ? 'large' : (term.weight === 2 ? 'medium' : 'small')}`;
            wordEl.textContent = term.text;
            
            // Set random rotation (-15deg to +15deg)
            const rotation = Math.floor(Math.random() * 30) - 15;
            wordEl.style.transform = `scale(0.3) rotate(${rotation}deg)`;
            
            // Temporarily append element to measure it
            stage.appendChild(wordEl);

            const timeoutId = setTimeout(() => {
                if (!document.body.contains(stage)) return;

                // Position the element dynamically without overlaps
                positionWord(wordEl, stage, placedBoxes, rotation);
                
                // Trigger transition animation in next frame
                requestAnimationFrame(() => {
                    wordEl.classList.add('visible');
                    wordEl.style.transform = `scale(1) rotate(${rotation}deg)`;
                });
            }, index * wordDelay);

            window.toolboxTimeouts.push(timeoutId);
        });

        function positionWord(wordEl, stageEl, placed, rot) {
            const parentWidth = stageEl.clientWidth;
            const parentHeight = stageEl.clientHeight;
            const w = wordEl.offsetWidth;
            const h = wordEl.offsetHeight;

            let bestX = parentWidth / 2 - w / 2;
            let bestY = parentHeight / 2 - h / 2;
            let success = false;

            // Spiral/Radial search outward from the center
            const maxAttempts = 150;
            for (let i = 0; i < maxAttempts; i++) {
                // Radial coordinate generation
                // Outward step size increases with attempts
                const angle = i * 0.4;
                const radius = 6 + (i * 2.2); 
                
                const x = parentWidth / 2 + Math.cos(angle) * radius - w / 2;
                const y = parentHeight / 2 + Math.sin(angle) * radius - h / 2;

                // Ensure it stays safely inside the container bounds
                if (x < 15 || x + w > parentWidth - 15 || y < 15 || y + h > parentHeight - 15) {
                    continue;
                }

                // Check overlap (add safety padding of 8px around each box)
                const padding = 8;
                const box = {
                    x1: x - padding,
                    y1: y - padding,
                    x2: x + w + padding,
                    y2: y + h + padding
                };

                let hasOverlap = false;
                for (const pb of placed) {
                    if (!(box.x2 < pb.x1 || box.x1 > pb.x2 || box.y2 < pb.y1 || box.y1 > pb.y2)) {
                        hasOverlap = true;
                        break;
                    }
                }

                if (!hasOverlap) {
                    bestX = x;
                    bestY = y;
                    success = true;
                    break;
                }
            }

            // Fallback to random positioning if spiral search gets packed
            if (!success) {
                bestX = Math.random() * (parentWidth - w - 40) + 20;
                bestY = Math.random() * (parentHeight - h - 40) + 20;
            }

            wordEl.style.left = `${bestX}px`;
            wordEl.style.top = `${bestY}px`;

            placed.push({
                x1: bestX,
                y1: bestY,
                x2: bestX + w,
                y2: bestY + h
            });
        }
    };
})();

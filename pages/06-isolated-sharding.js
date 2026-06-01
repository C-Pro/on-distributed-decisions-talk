(function() {
    window.isolatedTimeouts = window.isolatedTimeouts || [];

    window.initIsolatedSharding = function() {
        // Clear previous timeouts
        window.isolatedTimeouts.forEach(clearTimeout);
        window.isolatedTimeouts = [];

        const svg = document.getElementById('isolated-svg');
        const particlesGroup = document.getElementById('particles-group');
        
        if (!svg || !particlesGroup) return;

        // Keep track of failed shards
        const failedShards = new Set();
        // Keep track of active requests
        const activeRequests = new Set();

        const userNodes = svg.querySelectorAll('.user-node');
        const shardNodes = svg.querySelectorAll('.shard-node');

        // 1. Shard Click Handler (Toggle Failure)
        shardNodes.forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(node.getAttribute('data-index'), 10);
                
                if (failedShards.has(index)) {
                    failedShards.delete(index);
                    node.classList.remove('failed');
                    const textLabel = node.querySelector('.node-label');
                    textLabel.textContent = `Shard ${index}`;
                } else {
                    failedShards.add(index);
                    node.classList.add('failed');
                    const textLabel = node.querySelector('.node-label');
                    textLabel.textContent = `Shard ${index} (DOWN)`;
                }
            });
        });

        // 2. User Click Handler (Trigger Request)
        userNodes.forEach(node => {
            node.addEventListener('click', () => {
                const index = parseInt(node.getAttribute('data-index'), 10);
                
                // Prevent concurrent requests
                if (activeRequests.has(index)) return;
                activeRequests.add(index);

                // Target coordinates
                const startX = 200 + (index - 1) * 200;
                const startY = 80;
                const endY = 240;

                const isFailed = failedShards.has(index);

                // Visual line feedback
                const line = document.getElementById(`path-${index}`);
                if (line) {
                    line.classList.add('active');
                    if (isFailed) line.classList.add('failed');
                }

                // Create particle
                const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                particle.setAttribute('cx', startX);
                particle.setAttribute('cy', startY);
                particle.setAttribute('r', '6');
                particle.setAttribute('class', isFailed ? 'query-particle error-particle' : 'query-particle');
                particlesGroup.appendChild(particle);

                // Run request animation
                const duration = 600; // ms
                const startTime = performance.now();

                function animateRequest(timestamp) {
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const currentY = startY + (endY - startY) * progress;
                    
                    particle.setAttribute('cy', currentY);

                    if (progress < 1) {
                        requestAnimationFrame(animateRequest);
                    } else {
                        // Animation complete
                        particle.remove();
                        activeRequests.delete(index);
                        
                        if (line) {
                            line.classList.remove('active', 'failed');
                        }

                        if (isFailed) {
                            // Request failed
                            node.classList.add('error');
                            
                            // Clear error state after a brief delay
                            const timeoutId = setTimeout(() => {
                                node.classList.remove('error');
                            }, 2000);
                            window.isolatedTimeouts.push(timeoutId);
                        } else {
                            // Request succeeded
                            node.style.transform = 'scale(1.05)';
                            node.style.transformOrigin = `${startX}px ${startY}px`;
                            const timeoutId = setTimeout(() => {
                                node.style.transform = 'none';
                            }, 2000);
                            window.isolatedTimeouts.push(timeoutId);
                        }
                    }
                }

                requestAnimationFrame(animateRequest);
            });
        });
    };
})();

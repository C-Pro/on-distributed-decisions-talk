(function() {
    window.crossTimeouts = window.crossTimeouts || [];

    window.initCrossShardAccess = function() {
        // Clear previous timeouts
        window.crossTimeouts.forEach(clearTimeout);
        window.crossTimeouts = [];

        const svg = document.getElementById('cross-svg');
        const particlesGroup = document.getElementById('particles-group-cross');
        
        if (!svg || !particlesGroup) return;

        // Keep track of failed shards
        const failedShards = new Set();
        // Keep track of active user requests
        const activeRequests = new Set();

        const userNodes = svg.querySelectorAll('.user-node');
        const shardNodes = svg.querySelectorAll('.shard-node');

        // 1. Shard Click Handler (Toggle Failure)
        shardNodes.forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const shardIndex = parseInt(node.getAttribute('data-index'), 10);
                
                if (failedShards.has(shardIndex)) {
                    failedShards.delete(shardIndex);
                    node.classList.remove('failed');
                    node.querySelector('.node-label').textContent = `Shard ${shardIndex}`;
                } else {
                    failedShards.add(shardIndex);
                    node.classList.add('failed');
                    node.querySelector('.node-label').textContent = `Shard ${shardIndex} (DOWN)`;
                }
            });
        });

        // 2. User Click Handler (Trigger Parallel Queries)
        userNodes.forEach(node => {
            node.addEventListener('click', () => {
                const userIndex = parseInt(node.getAttribute('data-index'), 10);
                
                if (activeRequests.has(userIndex)) return;
                activeRequests.add(userIndex);

                // Get all paths for this user
                const paths = svg.querySelectorAll(`path[data-user="${userIndex}"]`);
                const queries = [];
                let overallFailure = false;

                paths.forEach(path => {
                    const shardIndex = parseInt(path.getAttribute('data-shard'), 10);
                    const isShardFailed = failedShards.has(shardIndex);
                    
                    queries.push({
                        path: path,
                        shardIndex: shardIndex,
                        isFailed: isShardFailed
                    });

                    if (isShardFailed) {
                        overallFailure = true;
                    }
                });

                // User coordinates
                const startX = 200 + (userIndex - 1) * 200;
                const startY = 80;

                // Mark connection lines and spawn particles
                const activeParticles = [];
                queries.forEach(q => {
                    q.path.classList.add('active');
                    if (q.isFailed) q.path.classList.add('failed');

                    const endX = 200 + (q.shardIndex - 1) * 200;
                    const endY = 240;

                    // Create particle
                    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    particle.setAttribute('cx', startX);
                    particle.setAttribute('cy', startY);
                    particle.setAttribute('r', '5');
                    particle.setAttribute('class', q.isFailed ? 'query-particle error-particle' : 'query-particle');
                    particlesGroup.appendChild(particle);

                    activeParticles.push({
                        element: particle,
                        startX: startX,
                        startY: startY,
                        endX: endX,
                        endY: endY,
                        query: q
                    });
                });

                // Animate particles
                const duration = 750; // ms
                const startTime = performance.now();

                function animateCrossRequests(timestamp) {
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    activeParticles.forEach(p => {
                        const currentX = p.startX + (p.endX - p.startX) * progress;
                        const currentY = p.startY + (p.endY - p.startY) * progress;
                        p.element.setAttribute('cx', currentX);
                        p.element.setAttribute('cy', currentY);
                    });

                    if (progress < 1) {
                        requestAnimationFrame(animateCrossRequests);
                    } else {
                        // Animation complete
                        activeParticles.forEach(p => {
                            p.element.remove();
                            p.query.path.classList.remove('active', 'failed');
                        });
                        activeRequests.delete(userIndex);

                        if (overallFailure) {
                            node.classList.add('error');
                            const timeoutId = setTimeout(() => {
                                node.classList.remove('error');
                            }, 2000);
                            window.crossTimeouts.push(timeoutId);
                        } else {
                            node.style.transform = 'scale(1.05)';
                            node.style.transformOrigin = `${startX}px ${startY}px`;
                            const timeoutId = setTimeout(() => {
                                node.style.transform = 'none';
                            }, 2000);
                            window.crossTimeouts.push(timeoutId);
                        }
                    }
                }

                requestAnimationFrame(animateCrossRequests);
            });
        });
    };
})();

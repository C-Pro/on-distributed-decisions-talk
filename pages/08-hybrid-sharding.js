(function() {
    window.hybridTimeouts = window.hybridTimeouts || [];

    window.initHybridSharding = function() {
        // Clear previous timeouts
        window.hybridTimeouts.forEach(clearTimeout);
        window.hybridTimeouts = [];

        const svg = document.getElementById('hybrid-svg');
        const particlesGroup = document.getElementById('particles-group-hybrid');

        if (!svg || !particlesGroup) return;

        // Keep track of failed partitions
        const failedWallets = new Set();
        const failedBooks = new Set();
        const activeRequests = new Set();

        const userNodes = svg.querySelectorAll('.user-node');
        const walletNodes = svg.querySelectorAll('.wallet-node');
        const bookNodes = svg.querySelectorAll('.book-node');

        // Wallet mapping to orderbooks
        const walletRouting = {
            1: [1, 2],
            2: [2],
            3: [2, 3]
        };

        const bookNames = {
            1: 'BTC',
            2: 'ETH',
            3: 'SOL'
        };

        // 1. Wallet Node Click Handler
        walletNodes.forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(node.getAttribute('data-index'), 10);
                
                if (failedWallets.has(index)) {
                    failedWallets.delete(index);
                    node.classList.remove('failed');
                    node.querySelector('.node-label-xs').textContent = `Wallet ${index}`;
                } else {
                    failedWallets.add(index);
                    node.classList.add('failed');
                    node.querySelector('.node-label-xs').textContent = `Wallet ${index} (DOWN)`;
                }
            });
        });

        // 2. Orderbook Node Click Handler
        bookNodes.forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(node.getAttribute('data-index'), 10);
                const bookName = bookNames[index];
                
                if (failedBooks.has(index)) {
                    failedBooks.delete(index);
                    node.classList.remove('failed');
                    node.querySelector('.node-label-xs').textContent = `Book ${bookName}`;
                } else {
                    failedBooks.add(index);
                    node.classList.add('failed');
                    node.querySelector('.node-label-xs').textContent = `Book ${bookName} (DOWN)`;
                }
            });
        });

        // 3. User Click Handler (Run Chained Transaction Simulation)
        userNodes.forEach(node => {
            node.addEventListener('click', () => {
                const userIndex = parseInt(node.getAttribute('data-index'), 10);

                if (activeRequests.has(userIndex)) return;
                activeRequests.add(userIndex);

                const walletIndex = userIndex;
                const targetBooks = walletRouting[userIndex];
                const isWalletFailed = failedWallets.has(walletIndex);

                // Coordinates
                const xPos = 200 + (userIndex - 1) * 200;
                
                // Active user connection line
                const lineWallet = document.getElementById(`path-u-${userIndex}`);
                if (lineWallet) {
                    lineWallet.classList.add('active');
                    if (isWalletFailed) lineWallet.classList.add('failed');
                }

                // Create Phase 1 Particle
                const particle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                particle1.setAttribute('cx', xPos);
                particle1.setAttribute('cy', '40');
                particle1.setAttribute('r', '5');
                particle1.setAttribute('class', isWalletFailed ? 'query-particle error-particle' : 'query-particle');
                particlesGroup.appendChild(particle1);

                // Animate Phase 1 (User -> Wallet)
                const duration1 = 400; // ms
                const startTime1 = performance.now();

                function animatePhase1(timestamp) {
                    const elapsed = timestamp - startTime1;
                    const progress = Math.min(elapsed / duration1, 1);
                    const currentY = 40 + (135 - 40) * progress;
                    
                    particle1.setAttribute('cy', currentY);

                    if (progress < 1) {
                        requestAnimationFrame(animatePhase1);
                    } else {
                        // Particle reaches Wallet node
                        particle1.remove();
                        if (lineWallet) lineWallet.classList.remove('active', 'failed');

                        if (isWalletFailed) {
                            // Fails at wallet tier
                            node.classList.add('error');
                            const walletNode = document.getElementById(`wallet-${walletIndex}`);
                            if (walletNode) walletNode.classList.add('error');

                            const tId = setTimeout(() => {
                                node.classList.remove('error');
                                if (walletNode) walletNode.classList.remove('error');
                            }, 2000);
                            window.hybridTimeouts.push(tId);
                            activeRequests.delete(userIndex);
                        } else {
                            // Wallet checks out! Start Phase 2 (Wallet -> Orderbooks)
                            runPhase2();
                        }
                    }
                }

                function runPhase2() {
                    // Collect target book states
                    const subQueries = targetBooks.map(bookIdx => {
                        const isBookFailed = failedBooks.has(bookIdx);
                        const path = document.getElementById(`path-w-${walletIndex}-${bookIdx}`);
                        return {
                            bookIndex: bookIdx,
                            isFailed: isBookFailed,
                            path: path
                        };
                    });

                    let overallFailure = false;

                    subQueries.forEach(sq => {
                        if (sq.path) {
                            sq.path.classList.add('active');
                            if (sq.isFailed) sq.path.classList.add('failed');
                        }

                        if (sq.isFailed) {
                            overallFailure = true;
                        }
                    });

                    // Spawn orderbook particles
                    const activeParticles = [];
                    subQueries.forEach(sq => {
                        const destX = 200 + (sq.bookIndex - 1) * 200;
                        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        particle.setAttribute('cx', xPos);
                        particle.setAttribute('cy', '165');
                        particle.setAttribute('r', '5');
                        particle.setAttribute('class', sq.isFailed ? 'query-particle error-particle' : 'query-particle');
                        particlesGroup.appendChild(particle);

                        activeParticles.push({
                            element: particle,
                            startX: xPos,
                            startY: 165,
                            endX: destX,
                            endY: 245,
                            query: sq
                        });
                    });

                    const duration2 = 500; // ms
                    const startTime2 = performance.now();

                    function animatePhase2(timestamp) {
                        const elapsed = timestamp - startTime2;
                        const progress = Math.min(elapsed / duration2, 1);

                        activeParticles.forEach(p => {
                            const currentX = p.startX + (p.endX - p.startX) * progress;
                            const currentY = p.startY + (p.endY - p.startY) * progress;
                            p.element.setAttribute('cx', currentX);
                            p.element.setAttribute('cy', currentY);
                        });

                        if (progress < 1) {
                            requestAnimationFrame(animatePhase2);
                        } else {
                            // Phase 2 complete
                            activeParticles.forEach(p => {
                                p.element.remove();
                                if (p.query.path) p.query.path.classList.remove('active', 'failed');
                            });
                            activeRequests.delete(userIndex);

                            if (overallFailure) {
                                node.classList.add('error');

                                const tId = setTimeout(() => {
                                    node.classList.remove('error');
                                }, 2000);
                                window.hybridTimeouts.push(tId);
                            } else {
                                node.style.transform = 'scale(1.05)';
                                node.style.transformOrigin = `${xPos}px 40px`;
                                const tId = setTimeout(() => {
                                    node.style.transform = 'none';
                                }, 2000);
                                window.hybridTimeouts.push(tId);
                            }
                        }
                    }

                    requestAnimationFrame(animatePhase2);
                }

                requestAnimationFrame(animatePhase1);
            });
        });
    };
})();

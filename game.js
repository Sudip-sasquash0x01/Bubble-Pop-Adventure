        class BubblePopGamePro {
            constructor() {
                this.initializeGameState();
                this.initializeSettings();
                this.initializeSoundSystem();
                this.loadData();
                this.setupEventListeners();
                this.initializeAI();
            }

            initializeGameState() {
                this.score = 0;
                this.level = 1;
                this.timeLeft = 60;
                this.gameActive = false;
                this.bubbles = [];
                this.balloons = [];
                this.gameArea = document.getElementById('gameArea');
                this.combo = 0;
                this.streak = 0;
                this.lastColor = null;
                this.totalBubblesPopped = 0;
                this.totalBalloonsPoppedAccidentally = 0;
                this.bestCombo = 0;
                this.powerUps = {
                    timeBoost: 0,
                    freeze: 0,
                    shield: 0,
                    rainbow: 0,
                    doublePoints: 0,
                    magnet: 0
                };
                this.upgrades = {
                    bubbleSize: 0,
                    coinMultiplier: 0,
                    startingTime: 0,
                    balloonShield: 0
                };
                this.cosmetics = {
                    oceanTheme: false,
                    spaceTheme: false,
                    forestTheme: false,
                    neonTheme: false
                };
                this.activeEffects = new Set();
                this.coins = 0;
                this.energy = 100;
                this.gameMode = 'classic';
                this.difficulty = 'normal';
                this.totalTaps = 0;
                this.perfectStreak = 0;
                this.achievements = [];
                this.soundEnabled = true;
            }

            initializeSoundSystem() {
                // Initialize Web Audio API for professional sound system
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.sounds = {};
                    this.createSounds();
                } catch (e) {
                    console.log('Web Audio API not supported');
                    this.audioContext = null;
                }
            }

            createSounds() {
                if (!this.audioContext) return;

                // Create different sound effects using oscillators
                this.sounds = {
                    pop: this.createPopSound,
                    balloon: this.createBalloonSound,
                    powerup: this.createPowerUpSound,
                    combo: this.createComboSound,
                    levelup: this.createLevelUpSound,
                    warning: this.createWarningSound,
                    coin: this.createCoinSound,
                    achievement: this.createAchievementSound
                };
            }

            playSound(soundName, frequency = 440, duration = 0.2) {
                if (!this.soundEnabled || !this.audioContext) return;

                try {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    // Different sound configurations
                    switch (soundName) {
                        case 'pop':
                            oscillator.frequency.setValueAtTime(frequency + Math.random() * 200, this.audioContext.currentTime);
                            oscillator.type = 'triangle';
                            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                            break;
                        case 'balloon':
                            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                            oscillator.type = 'sawtooth';
                            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                            break;
                        case 'powerup':
                            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
                            oscillator.type = 'sine';
                            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                            break;
                        case 'combo':
                            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
                            oscillator.type = 'square';
                            gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                            break;
                        case 'levelup':
                            // Play a sequence of notes for level up
                            const notes = [523, 659, 784, 1047]; // C, E, G, C
                            notes.forEach((note, index) => {
                                setTimeout(() => {
                                    if (this.soundEnabled) {
                                        this.playSound('achievement', note, 0.15);
                                    }
                                }, index * 100);
                            });
                            return;
                        case 'warning':
                            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                            oscillator.type = 'triangle';
                            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                            break;
                        case 'coin':
                            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
                            oscillator.type = 'sine';
                            gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                            break;
                        case 'achievement':
                            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                            oscillator.type = 'sine';
                            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                            break;
                    }
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                } catch (e) {
                    console.log('Sound playback failed:', e);
                }
            }

            toggleSound() {
                this.soundEnabled = !this.soundEnabled;
                this.updateSoundToggleButtons();
                this.saveData();
                
                if (this.soundEnabled) {
                    this.playSound('achievement', 800, 0.1);
                }
            }

            updateSoundToggleButtons() {
                const buttons = document.querySelectorAll('.sound-toggle');
                buttons.forEach(button => {
                    button.textContent = this.soundEnabled ? '🔊' : '🔇';
                    button.classList.toggle('muted', !this.soundEnabled);
                });
            }

            initializeSettings() {
                this.colors = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
                    '#FF8A80', '#82B1FF', '#B9F6CA', '#FFD54F'
                ];
                
                this.difficultySettings = {
                    easy: { balloonChance: 0.05, balloonDamage: 10, timeSubtraction: 2, bubbleSpeed: 1 },
                    normal: { balloonChance: 0.15, balloonDamage: 25, timeSubtraction: 5, bubbleSpeed: 1.2 },
                    hard: { balloonChance: 0.25, balloonDamage: 50, timeSubtraction: 8, bubbleSpeed: 1.5 },
                    nightmare: { balloonChance: 0.4, balloonDamage: 100, timeSubtraction: 15, bubbleSpeed: 2 }
                };
                
                this.gameTimer = null;
                this.bubbleSpawnTimer = null;
                this.aiHintTimer = null;
            }

            initializeAI() {
                this.aiSystem = {
                    hintCooldown: 0,
                    adaptiveDifficulty: true,
                    playerSkillLevel: 1,
                    suggestedMoves: [],
                    performanceHistory: []
                };
            }

            loadData() {
                // Load saved data
                const savedData = this.getSavedData();
                if (savedData) {
                    this.coins = savedData.coins || 0;
                    this.powerUps = { ...this.powerUps, ...savedData.powerUps };
                    this.achievements = savedData.achievements || [];
                    this.difficulty = savedData.lastDifficulty || 'normal';
                    this.gameMode = savedData.lastGameMode || 'classic';
                }
                
                // Initialize leaderboard with sample data if empty
                if (!this.getLeaderboard().length) {
                    this.initializeLeaderboard();
                }
                
                this.updateMenuSelections();
            }

            setupEventListeners() {
                // Prevent context menu and zoom
                document.addEventListener('contextmenu', e => e.preventDefault());
                document.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
                
                // Handle visibility change
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden && this.gameActive) {
                        // Simple pause - just stop timers
                        clearInterval(this.gameTimer);
                        clearInterval(this.bubbleSpawnTimer);
                    }
                });

                // Mode and difficulty selectors
                document.querySelectorAll('.mode-card').forEach(card => {
                    card.addEventListener('click', () => this.selectGameMode(card.dataset.mode));
                });

                document.querySelectorAll('.difficulty-option').forEach(option => {
                    option.addEventListener('click', () => this.selectDifficulty(option.dataset.difficulty));
                });

                // Shop items - Updated to handle all shop items
                document.querySelectorAll('.shop-item').forEach(item => {
                    const button = item.querySelector('button');
                    button.addEventListener('click', () => this.buyPowerUp(item.dataset.item, parseInt(item.dataset.cost)));
                });

                // Window resize
                window.addEventListener('resize', () => this.handleResize());
            }

            selectGameMode(mode) {
                this.gameMode = mode;
                document.querySelectorAll('.mode-card').forEach(card => {
                    card.classList.toggle('selected', card.dataset.mode === mode);
                });
                this.saveData();
            }

            selectDifficulty(difficulty) {
                this.difficulty = difficulty;
                document.querySelectorAll('.difficulty-option').forEach(option => {
                    option.classList.toggle('selected', option.dataset.difficulty === difficulty);
                });
                this.saveData();
            }

            updateMenuSelections() {
                // Update mode selection
                document.querySelectorAll('.mode-card').forEach(card => {
                    card.classList.toggle('selected', card.dataset.mode === this.gameMode);
                });
                
                // Update difficulty selection
                document.querySelectorAll('.difficulty-option').forEach(option => {
                    option.classList.toggle('selected', option.dataset.difficulty === this.difficulty);
                });
            }

            startGame() {
                document.getElementById('startMenu').classList.add('hidden');
                this.resetGame();
                this.gameActive = true;
                this.startTimers();
                this.spawnBubbles();
                this.updateDisplay();
                
                if (this.gameMode === 'challenge') {
                    this.setupDailyChallenge();
                }
                
                this.showAIHint("Game started! Pop bubbles and avoid red balloons!");
            }

            resetGame() {
                this.score = 0;
                this.level = 1;
                // Apply starting time upgrade
                const baseTime = this.gameMode === 'zen' ? 999 : 60;
                const timeBonus = this.upgrades.startingTime * 15;
                this.timeLeft = baseTime + timeBonus;
                this.combo = 0;
                this.streak = 0;
                this.lastColor = null;
                this.totalBubblesPopped = 0;
                this.totalBalloonsPoppedAccidentally = 0;
                this.bestCombo = 0;
                this.totalTaps = 0;
                this.perfectStreak = 0;
                this.activeEffects.clear();
                this.energy = 100;
                this.clearGameArea();
                
                // Remove any active effects
                document.getElementById('gameContainer').className = 'game-container';
            }

            startTimers() {
                if (this.gameMode !== 'zen') {
                    this.gameTimer = setInterval(() => {
                        this.timeLeft--;
                        if (this.timeLeft <= 0) {
                            this.endGame();
                        }
                        this.updateDisplay();
                        this.checkTimeWarnings();
                    }, 1000);
                }

                const spawnRate = this.calculateSpawnRate();
                this.bubbleSpawnTimer = setInterval(() => {
                    if (this.gameActive) {
                        this.spawnBubbles();
                        this.spawnBalloons();
                        this.updateAI();
                    }
                }, spawnRate);
            }

            calculateSpawnRate() {
                const baseRate = 1500;
                const difficultyMultiplier = this.difficultySettings[this.difficulty].bubbleSpeed;
                const levelMultiplier = Math.max(0.3, 1 - (this.level * 0.1));
                return Math.max(300, baseRate * levelMultiplier / difficultyMultiplier);
            }

            spawnBubbles() {
                const numBubbles = Math.min(2 + this.level, this.gameMode === 'zen' ? 4 : 8);
                
                for (let i = 0; i < numBubbles; i++) {
                    setTimeout(() => {
                        if (this.gameActive) {
                            this.createBubble();
                        }
                    }, i * 150);
                }

                // Spawn power-ups
                if (Math.random() < 0.1) {
                    setTimeout(() => {
                        if (this.gameActive) {
                            this.createPowerUp();
                        }
                    }, 500);
                }
            }

            spawnBalloons() {
                if (this.gameMode === 'zen') return;
                
                const settings = this.difficultySettings[this.difficulty];
                const balloonChance = settings.balloonChance * (1 + this.level * 0.1);
                
                if (Math.random() < balloonChance) {
                    setTimeout(() => {
                        if (this.gameActive) {
                            this.createBalloon();
                        }
                    }, Math.random() * 1000);
                }
            }

            createBubble() {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                
                // Apply bubble size upgrade
                const baseSize = 40 + Math.random() * 50;
                const sizeBonus = this.upgrades.bubbleSize * 5;
                const size = baseSize + sizeBonus;
                
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                const points = Math.ceil(size / 8);
                
                // Special bubble chance
                const isSpecial = Math.random() < 0.1;
                if (isSpecial) {
                    bubble.classList.add('special');
                    bubble.dataset.special = 'true';
                }
                
                bubble.style.width = size + 'px';
                bubble.style.height = size + 'px';
                bubble.style.backgroundColor = color;
                bubble.style.left = Math.random() * (window.innerWidth - size) + 'px';
                bubble.style.top = (120 + Math.random() * (window.innerHeight - size - 250)) + 'px';
                bubble.textContent = isSpecial ? '★' : points;
                
                bubble.dataset.color = color;
                bubble.dataset.points = isSpecial ? points * 3 : points;
                
                bubble.addEventListener('click', (e) => this.popBubble(e, bubble));
                bubble.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.popBubble(e, bubble);
                });
                
                this.gameArea.appendChild(bubble);
                this.bubbles.push(bubble);
                
                // Auto-remove bubble
                const lifetime = this.gameMode === 'zen' ? 8000 : 4000 + Math.random() * 3000;
                setTimeout(() => {
                    if (bubble.parentNode) {
                        this.removeBubble(bubble);
                    }
                }, lifetime);
            }

            createBalloon() {
                const balloon = document.createElement('div');
                balloon.className = 'balloon';
                
                const balloonBody = document.createElement('div');
                balloonBody.className = 'balloon-body';
                balloon.appendChild(balloonBody);
                
                balloon.style.left = Math.random() * (window.innerWidth - 50) + 'px';
                balloon.style.top = (120 + Math.random() * (window.innerHeight - 300)) + 'px';
                
                const settings = this.difficultySettings[this.difficulty];
                balloon.dataset.damage = settings.balloonDamage;
                balloon.dataset.timeSubtraction = settings.timeSubtraction;
                
                balloon.addEventListener('click', (e) => this.popBalloon(e, balloon));
                balloon.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.popBalloon(e, balloon);
                });
                
                this.gameArea.appendChild(balloon);
                this.balloons.push(balloon);
                
                // Auto-remove balloon
                setTimeout(() => {
                    if (balloon.parentNode) {
                        this.removeBalloon(balloon);
                    }
                }, 6000 + Math.random() * 4000);
            }

            createPowerUp() {
                const powerUpTypes = ['⏰', '❄️', '🛡️', '🌈', '💎'];
                const powerUp = document.createElement('div');
                powerUp.className = 'power-up';
                
                const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                powerUp.textContent = type;
                powerUp.dataset.type = type;
                
                powerUp.style.left = Math.random() * (window.innerWidth - 45) + 'px';
                powerUp.style.top = (120 + Math.random() * (window.innerHeight - 280)) + 'px';
                
                powerUp.addEventListener('click', (e) => this.collectPowerUp(e, powerUp));
                powerUp.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.collectPowerUp(e, powerUp);
                });
                
                this.gameArea.appendChild(powerUp);
                
                setTimeout(() => {
                    if (powerUp.parentNode) {
                        powerUp.remove();
                    }
                }, 8000);
            }

            popBubble(e, bubble) {
                e.stopPropagation();
                
                // Prevent multiple clicks on the same bubble
                if (bubble.dataset.popped === 'true') {
                    return;
                }
                
                // Mark bubble as popped to prevent multiple scores
                bubble.dataset.popped = 'true';
                
                this.totalTaps++;
                
                const points = parseInt(bubble.dataset.points);
                const color = bubble.dataset.color;
                const isSpecial = bubble.dataset.special === 'true';
                
                let multiplier = 1;
                if (this.activeEffects.has('rainbow')) multiplier *= 2;
                
                // Play pop sound with pitch based on bubble size
                const pitch = 400 + (parseInt(bubble.style.width) * 5);
                this.playSound('pop', pitch, 0.15);
                
                // Combo system
                if (this.lastColor === color) {
                    this.combo++;
                    this.streak++;
                    const comboBonus = Math.min(this.combo * 15, 150);
                    this.score += (points + comboBonus) * multiplier;
                    
                    if (this.combo > this.bestCombo) {
                        this.bestCombo = this.combo;
                    }
                    
                    if (this.combo >= 3) {
                        this.showComboIndicator(this.combo);
                        this.playSound('combo', 600 + (this.combo * 50), 0.2);
                    }
                    
                    this.showFloatingScore(`+${(points + comboBonus) * multiplier}`, e.clientX || e.touches?.[0]?.clientX, e.clientY || e.touches?.[0]?.clientY);
                } else {
                    this.combo = 1;
                    this.streak++;
                    this.score += points * multiplier;
                    this.showFloatingScore(`+${points * multiplier}`, e.clientX || e.touches?.[0]?.clientX, e.clientY || e.touches?.[0]?.clientY);
                }
                
                this.lastColor = color;
                this.totalBubblesPopped++;
                this.perfectStreak++;
                
                // Special bubble effects
                if (isSpecial) {
                    const coinReward = 5 * (1 + this.upgrades.coinMultiplier * 0.5);
                    this.coins += coinReward;
                    this.energy = Math.min(100, this.energy + 10);
                    this.showAchievement(`Special bubble! +${coinReward} coins, +10 energy!`);
                    this.playSound('coin', 900, 0.2);
                }
                
                // Visual effects
                bubble.classList.add('popping');
                this.createParticles(
                    e.clientX || e.touches?.[0]?.clientX || window.innerWidth / 2, 
                    e.clientY || e.touches?.[0]?.clientY || window.innerHeight / 2, 
                    color
                );
                
                setTimeout(() => {
                    this.removeBubble(bubble);
                }, 400);
                
                // Level progression
                if (this.score >= this.level * 750) {
                    this.levelUp();
                }
                
                this.checkAchievements();
                this.updateDisplay();
            }

            popBalloon(e, balloon) {
                e.stopPropagation();
                
                // Prevent multiple clicks on the same balloon
                if (balloon.dataset.popped === 'true') {
                    return;
                }
                
                // Mark balloon as popped to prevent multiple damage
                balloon.dataset.popped = 'true';
                
                this.totalTaps++;
                this.totalBalloonsPoppedAccidentally++;
                this.perfectStreak = 0;
                
                // Play balloon explosion sound
                this.playSound('balloon', 150, 0.4);
                
                // Check for shield protection
                if (this.activeEffects.has('shield')) {
                    this.activeEffects.delete('shield');
                    this.showWarning('Shield Protected You!');
                    this.playSound('powerup', 1000, 0.3);
                    balloon.classList.add('popping');
                    setTimeout(() => this.removeBalloon(balloon), 400);
                    return;
                }
                
                const damage = parseInt(balloon.dataset.damage);
                const timeSubtraction = parseInt(balloon.dataset.timeSubtraction);
                
                // Apply balloon shield upgrade (reduces damage)
                const actualDamage = Math.max(1, damage - (this.upgrades.balloonShield * 10));
                const actualTimeSubtraction = Math.max(1, timeSubtraction - (this.upgrades.balloonShield * 2));
                
                this.score = Math.max(0, this.score - actualDamage);
                this.timeLeft = Math.max(0, this.timeLeft - actualTimeSubtraction);
                this.combo = 0;
                this.streak = 0;
                this.energy = Math.max(0, this.energy - 20);
                
                this.showFloatingScore(`-${actualDamage}`, e.clientX || e.touches?.[0]?.clientX, e.clientY || e.touches?.[0]?.clientY, '#FF4757');
                this.showWarning(`-${actualDamage} points, -${actualTimeSubtraction}s time!`);
                this.playSound('warning', 200, 0.5);
                this.triggerScreenShake();
                
                // Visual effects
                balloon.classList.add('popping');
                this.createParticles(
                    e.clientX || e.touches?.[0]?.clientX || window.innerWidth / 2, 
                    e.clientY || e.touches?.[0]?.clientY || window.innerHeight / 2, 
                    '#FF4757'
                );
                
                setTimeout(() => this.removeBalloon(balloon), 400);
                this.updateDisplay();
            }

            collectPowerUp(e, powerUp) {
                e.stopPropagation();
                
                const type = powerUp.dataset.type;
                this.activatePowerUp(type);
                
                this.playSound('powerup', 800, 0.3);
                
                this.createParticles(
                    e.clientX || e.touches?.[0]?.clientX || window.innerWidth / 2, 
                    e.clientY || e.touches?.[0]?.clientY || window.innerHeight / 2, 
                    '#FFD700'
                );
                this.showFloatingScore('POWER UP!', e.clientX || e.touches?.[0]?.clientX, e.clientY || e.touches?.[0]?.clientY, '#FFD700');
                
                powerUp.remove();
            }

            activatePowerUp(type) {
                switch (type) {
                    case '⏰':
                        this.timeLeft = Math.min(this.timeLeft + 15, 120);
                        this.showAchievement('Time Boost! +15 seconds');
                        break;
                    case '❄️':
                        this.activateFreeze();
                        break;
                    case '🛡️':
                        this.activeEffects.add('shield');
                        this.showAchievement('Shield Active! Next balloon won\'t hurt you');
                        break;
                    case '🌈':
                        this.activateRainbow();
                        break;
                    case '💎':
                        this.coins += 10;
                        this.showAchievement('Bonus coins! +10 coins');
                        break;
                }
            }

            activateFreeze() {
                this.activeEffects.add('freeze');
                document.getElementById('gameContainer').classList.add('freeze-effect');
                
                // Freeze all bubbles and balloons
                [...this.bubbles, ...this.balloons].forEach(element => {
                    element.style.animationPlayState = 'paused';
                });
                
                this.showAchievement('Freeze activated! Everything stopped for 3 seconds');
                
                setTimeout(() => {
                    this.activeEffects.delete('freeze');
                    document.getElementById('gameContainer').classList.remove('freeze-effect');
                    [...this.bubbles, ...this.balloons].forEach(element => {
                        element.style.animationPlayState = 'running';
                    });
                }, 3000);
            }

            activateRainbow() {
                this.activeEffects.add('rainbow');
                document.getElementById('gameContainer').classList.add('rainbow-mode');
                
                this.showAchievement('Rainbow mode! Double points for 5 seconds');
                
                setTimeout(() => {
                    this.activeEffects.delete('rainbow');
                    document.getElementById('gameContainer').classList.remove('rainbow-mode');
                }, 5000);
            }

            createParticles(x, y, color) {
                for (let i = 0; i < 12; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.backgroundColor = color;
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.width = (4 + Math.random() * 6) + 'px';
                    particle.style.height = particle.style.width;
                    
                    const angle = (i / 12) * Math.PI * 2;
                    const distance = 40 + Math.random() * 30;
                    const dx = Math.cos(angle) * distance;
                    const dy = Math.sin(angle) * distance;
                    
                    particle.style.setProperty('--dx', dx + 'px');
                    particle.style.setProperty('--dy', dy + 'px');
                    
                    document.body.appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 1200);
                }
            }

            showFloatingScore(text, x, y, color = '#FFD700') {
                const floatingScore = document.createElement('div');
                floatingScore.className = 'floating-score';
                floatingScore.textContent = text;
                floatingScore.style.left = x + 'px';
                floatingScore.style.top = y + 'px';
                floatingScore.style.color = color;
                
                document.body.appendChild(floatingScore);
                
                setTimeout(() => floatingScore.remove(), 1500);
            }

            showComboIndicator(combo) {
                const indicator = document.createElement('div');
                indicator.className = 'combo-indicator';
                indicator.textContent = `${combo}x COMBO!`;
                
                document.body.appendChild(indicator);
                
                setTimeout(() => indicator.remove(), 2000);
            }

            showAchievement(text) {
                const achievement = document.createElement('div');
                achievement.className = 'achievements-toast';
                achievement.innerHTML = `<strong>🎉 Achievement!</strong><br>${text}`;
                
                document.body.appendChild(achievement);
                
                setTimeout(() => achievement.remove(), 4000);
            }

            showWarning(text) {
                const warning = document.createElement('div');
                warning.className = 'warning-indicator';
                warning.textContent = text;
                
                document.body.appendChild(warning);
                
                setTimeout(() => warning.remove(), 2000);
            }

            showAIHint(text) {
                // Remove existing hint
                const existingHint = document.querySelector('.ai-hint');
                if (existingHint) existingHint.remove();
                
                const hint = document.createElement('div');
                hint.className = 'ai-hint';
                hint.textContent = `🤖 AI: ${text}`;
                
                document.body.appendChild(hint);
                
                setTimeout(() => hint.remove(), 5000);
            }

            triggerScreenShake() {
                document.getElementById('gameContainer').classList.add('screen-shake');
                setTimeout(() => {
                    document.getElementById('gameContainer').classList.remove('screen-shake');
                }, 500);
            }

            updateAI() {
                // AI system for hints and adaptive difficulty
                this.aiSystem.hintCooldown--;
                
                if (this.aiSystem.hintCooldown <= 0 && this.gameActive) {
                    this.generateAIHint();
                    this.aiSystem.hintCooldown = 10; // 10 seconds cooldown
                }
                
                // Track player performance
                const currentPerformance = {
                    score: this.score,
                    level: this.level,
                    accuracy: this.totalTaps > 0 ? (this.totalBubblesPopped / this.totalTaps) * 100 : 100,
                    timestamp: Date.now()
                };
                
                this.aiSystem.performanceHistory.push(currentPerformance);
                if (this.aiSystem.performanceHistory.length > 10) {
                    this.aiSystem.performanceHistory.shift();
                }
            }

            generateAIHint() {
                const hints = [
                    "Focus on same-colored bubbles for combo bonuses!",
                    "Avoid the red balloons - they're dangerous!",
                    "Larger bubbles give more points!",
                    "Look for golden power-ups for special abilities!",
                    "Your accuracy affects your final score!",
                    "Special bubbles with stars give bonus coins!",
                    "Use the shield power-up before popping balloons!",
                    "Time boost power-ups can save you in tight situations!",
                    "Rainbow mode doubles your points temporarily!",
                    "Perfect streaks unlock bonus achievements!"
                ];
                
                // Adaptive hints based on game state
                if (this.streak < 5) {
                    this.showAIHint("Try to build a longer streak for bonus points!");
                } else if (this.balloons.length > 3) {
                    this.showAIHint("Warning: Many dangerous balloons on screen!");
                } else if (this.timeLeft < 15) {
                    this.showAIHint("Time running low! Look for time boost power-ups!");
                } else {
                    const randomHint = hints[Math.floor(Math.random() * hints.length)];
                    this.showAIHint(randomHint);
                }
            }

            checkAchievements() {
                const newAchievements = [];
                
                // Score-based achievements
                if (this.score >= 1000 && !this.achievements.includes('scorer_1k')) {
                    this.achievements.push('scorer_1k');
                    newAchievements.push('Score Master - 1,000 points reached!');
                }
                
                if (this.score >= 5000 && !this.achievements.includes('scorer_5k')) {
                    this.achievements.push('scorer_5k');
                    newAchievements.push('Score Legend - 5,000 points reached!');
                }
                
                if (this.score >= 10000 && !this.achievements.includes('scorer_10k')) {
                    this.achievements.push('scorer_10k');
                    newAchievements.push('Score God - 10,000 points reached!');
                }
                
                // Bubble-based achievements
                if (this.totalBubblesPopped >= 50 && !this.achievements.includes('bubbler_50')) {
                    this.achievements.push('bubbler_50');
                    newAchievements.push('Bubble Novice - 50 bubbles popped!');
                }
                
                if (this.totalBubblesPopped >= 200 && !this.achievements.includes('bubbler_200')) {
                    this.achievements.push('bubbler_200');
                    newAchievements.push('Bubble Expert - 200 bubbles popped!');
                }
                
                if (this.totalBubblesPopped >= 500 && !this.achievements.includes('bubbler_500')) {
                    this.achievements.push('bubbler_500');
                    newAchievements.push('Bubble Master - 500 bubbles popped!');
                }
                
                // Combo achievements
                if (this.bestCombo >= 5 && !this.achievements.includes('combo_5')) {
                    this.achievements.push('combo_5');
                    newAchievements.push('Combo Starter - 5x combo achieved!');
                }
                
                if (this.bestCombo >= 10 && !this.achievements.includes('combo_10')) {
                    this.achievements.push('combo_10');
                    newAchievements.push('Combo King - 10x combo achieved!');
                }
                
                if (this.bestCombo >= 15 && !this.achievements.includes('combo_15')) {
                    this.achievements.push('combo_15');
                    newAchievements.push('Combo God - 15x combo achieved!');
                }
                
                // Perfect streak achievements
                if (this.perfectStreak >= 20 && !this.achievements.includes('perfect_20')) {
                    this.achievements.push('perfect_20');
                    newAchievements.push('Perfectionist - 20 perfect hits in a row!');
                }
                
                // Level achievements
                if (this.level >= 5 && !this.achievements.includes('level_5')) {
                    this.achievements.push('level_5');
                    newAchievements.push('Level Explorer - Reached level 5!');
                }
                
                if (this.level >= 10 && !this.achievements.includes('level_10')) {
                    this.achievements.push('level_10');
                    newAchievements.push('Level Master - Reached level 10!');
                }
                
                // Special achievements
                if (this.totalBalloonsPoppedAccidentally === 0 && this.totalBubblesPopped >= 30 && !this.achievements.includes('no_mistakes')) {
                    this.achievements.push('no_mistakes');
                    newAchievements.push('Flawless - No balloons hit in a full game!');
                }
                
                // Show new achievements
                newAchievements.forEach(achievement => {
                    this.showAchievement(achievement);
                    this.coins += 25; // Bonus coins for achievements
                });
                
                if (newAchievements.length > 0) {
                    this.saveData();
                }
            }

            levelUp() {
                this.level++;
                this.timeLeft += 20;
                this.coins += this.level * 5;
                this.energy = 100;
                this.showAchievement(`Level ${this.level} Reached! +20 seconds, +${this.level * 5} coins!`);
                
                // Clear existing timers and restart with new difficulty
                clearInterval(this.bubbleSpawnTimer);
                const spawnRate = this.calculateSpawnRate();
                this.bubbleSpawnTimer = setInterval(() => {
                    if (this.gameActive) {
                        this.spawnBubbles();
                        this.spawnBalloons();
                        this.updateAI();
                    }
                }, spawnRate);
            }

            checkTimeWarnings() {
                if (this.timeLeft === 30) {
                    this.showWarning('⚠️ 30 seconds remaining!');
                } else if (this.timeLeft === 10) {
                    this.showWarning('🚨 10 seconds left!');
                } else if (this.timeLeft <= 5 && this.timeLeft > 0) {
                    this.showWarning(`${this.timeLeft}!`);
                }
            }

            setupDailyChallenge() {
                // Generate daily challenge based on date
                const today = new Date().toDateString();
                const challengeType = ['accuracy', 'speed', 'survival', 'combo'][new Date().getDate() % 4];
                
                switch (challengeType) {
                    case 'accuracy':
                        this.showAchievement('Daily Challenge: Accuracy Master - Maintain 90%+ accuracy!');
                        break;
                    case 'speed':
                        this.showAchievement('Daily Challenge: Speed Demon - Pop 100 bubbles in 60 seconds!');
                        break;
                    case 'survival':
                        this.showAchievement('Daily Challenge: Survivor - Avoid all balloons!');
                        break;
                    case 'combo':
                        this.showAchievement('Daily Challenge: Combo Master - Achieve a 20x combo!');
                        break;
                }
            }

            pauseGame() {
                this.gameActive = false;
                clearInterval(this.gameTimer);
                clearInterval(this.bubbleSpawnTimer);
                this.showWarning('Game Paused');
            }

            endGame() {
                this.gameActive = false;
                clearInterval(this.gameTimer);
                clearInterval(this.bubbleSpawnTimer);
                
                // Calculate final stats
                const accuracy = this.totalTaps > 0 ? Math.round((this.totalBubblesPopped / this.totalTaps) * 100) : 100;
                const coinsEarned = Math.floor(this.score / 100) + (this.level * 10);
                this.coins += coinsEarned;
                
                // Save high score
                const isNewRecord = this.saveHighScore();
                
                // Update final stats display
                document.getElementById('finalScore').textContent = this.score.toLocaleString();
                document.getElementById('finalLevel').textContent = this.level;
                document.getElementById('bubblesPopped').textContent = this.totalBubblesPopped;
                document.getElementById('bestCombo').textContent = this.bestCombo;
                document.getElementById('coinsEarned').textContent = coinsEarned;
                document.getElementById('accuracy').textContent = accuracy + '%';
                
                // Show new record indicator
                document.getElementById('newRecord').classList.toggle('hidden', !isNewRecord);
                
                this.saveData();
                this.showGameOverMenu();
            }

            saveHighScore() {
                const highScores = this.getLeaderboard();
                const accuracy = this.totalTaps > 0 ? Math.round((this.totalBubblesPopped / this.totalTaps) * 100) : 100;
                
                const newScore = {
                    score: this.score,
                    level: this.level,
                    bubbles: this.totalBubblesPopped,
                    combo: this.bestCombo,
                    accuracy: accuracy,
                    mode: this.gameMode,
                    difficulty: this.difficulty,
                    date: new Date().toLocaleDateString(),
                    playerName: 'You'
                };
                
                highScores.push(newScore);
                highScores.sort((a, b) => b.score - a.score);
                highScores.splice(20); // Keep top 20
                
                localStorage.setItem('bubblePopLeaderboard', JSON.stringify(highScores));
                
                // Check if new record
                return highScores[0].score === this.score;
            }

            getLeaderboard() {
                try {
                    return JSON.parse(localStorage.getItem('bubblePopLeaderboard')) || [];
                } catch {
                    return [];
                }
            }

            initializeLeaderboard() {
                const sampleScores = [
                    { score: 8750, level: 8, bubbles: 145, combo: 12, accuracy: 94, mode: 'classic', difficulty: 'hard', date: new Date().toLocaleDateString(), playerName: 'Alex Pro' },
                    { score: 6420, level: 6, bubbles: 98, combo: 8, accuracy: 89, mode: 'survival', difficulty: 'normal', date: new Date().toLocaleDateString(), playerName: 'BubbleMaster' },
                    { score: 5230, level: 5, bubbles: 87, combo: 15, accuracy: 96, mode: 'classic', difficulty: 'normal', date: new Date().toLocaleDateString(), playerName: 'PopQueen' },
                    { score: 4150, level: 4, bubbles: 76, combo: 6, accuracy: 82, mode: 'classic', difficulty: 'easy', date: new Date().toLocaleDateString(), playerName: 'GameFan99' },
                    { score: 3890, level: 4, bubbles: 68, combo: 9, accuracy: 91, mode: 'survival', difficulty: 'normal', date: new Date().toLocaleDateString(), playerName: 'ChillGamer' },
                    { score: 2760, level: 3, bubbles: 52, combo: 7, accuracy: 85, mode: 'zen', difficulty: 'easy', date: new Date().toLocaleDateString(), playerName: 'Relaxed' },
                    { score: 1950, level: 2, bubbles: 38, combo: 4, accuracy: 79, mode: 'classic', difficulty: 'easy', date: new Date().toLocaleDateString(), playerName: 'Newbie' }
                ];
                localStorage.setItem('bubblePopLeaderboard', JSON.stringify(sampleScores));
            }

            getSavedData() {
                try {
                    return JSON.parse(localStorage.getItem('bubblePopSaveData')) || {};
                } catch {
                    return {};
                }
            }

            saveData() {
                const saveData = {
                    coins: this.coins,
                    powerUps: this.powerUps,
                    achievements: this.achievements,
                    lastDifficulty: this.difficulty,
                    lastGameMode: this.gameMode,
                    totalGamesPlayed: (this.getSavedData().totalGamesPlayed || 0) + (this.gameActive ? 0 : 1),
                    totalTimePlayed: (this.getSavedData().totalTimePlayed || 0) + (this.gameActive ? 0 : (60 - this.timeLeft))
                };
                localStorage.setItem('bubblePopSaveData', JSON.stringify(saveData));
            }

            buyPowerUp(item, cost) {
                if (this.coins >= cost) {
                    this.coins -= cost;
                    this.powerUps[item] = (this.powerUps[item] || 0) + 1;
                    this.saveData();
                    this.updateShopDisplay();
                    this.showAchievement(`Purchased ${item}! You now have ${this.powerUps[item]}`);
                } else {
                    this.showWarning('Not enough coins!');
                }
            }

            removeBubble(bubble) {
                const index = this.bubbles.indexOf(bubble);
                if (index > -1) {
                    this.bubbles.splice(index, 1);
                }
                if (bubble.parentNode) {
                    bubble.remove();
                }
            }

            removeBalloon(balloon) {
                const index = this.balloons.indexOf(balloon);
                if (index > -1) {
                    this.balloons.splice(index, 1);
                }
                if (balloon.parentNode) {
                    balloon.remove();
                }
            }

            clearGameArea() {
                this.bubbles.forEach(bubble => bubble.remove());
                this.balloons.forEach(balloon => balloon.remove());
                this.bubbles = [];
                this.balloons = [];
                
                // Clear power-ups and particles
                document.querySelectorAll('.power-up, .particle, .floating-score, .combo-indicator, .ai-hint').forEach(el => el.remove());
            }

            updateDisplay() {
                document.getElementById('score').textContent = this.score.toLocaleString();
                document.getElementById('timer').textContent = this.timeLeft;
                document.getElementById('level').textContent = this.level;
                document.getElementById('streak').textContent = this.streak;
                document.getElementById('coins').textContent = this.coins;
                document.getElementById('energy').textContent = this.energy;
                
                // Update progress bar
                const progress = (this.score % 750) / 750 * 100;
                document.getElementById('progressFill').style.width = progress + '%';
            }

            updateShopDisplay() {
                document.getElementById('shopCoins').textContent = this.coins;
            }

            handleResize() {
                if (this.gameActive) {
                    // Reposition elements that might be off-screen
                    [...this.bubbles, ...this.balloons].forEach(element => {
                        const rect = element.getBoundingClientRect();
                        if (rect.right > window.innerWidth) {
                            element.style.left = (window.innerWidth - rect.width - 10) + 'px';
                        }
                        if (rect.bottom > window.innerHeight) {
                            element.style.top = (window.innerHeight - rect.height - 100) + 'px';
                        }
                    });
                }
            }

            showGameOverMenu() {
                document.getElementById('gameOverMenu').classList.remove('hidden');
            }

            restartGame() {
                document.getElementById('gameOverMenu').classList.add('hidden');
                this.startGame();
            }

            showMenu() {
                document.getElementById('gameOverMenu').classList.add('hidden');
                document.getElementById('startMenu').classList.remove('hidden');
                this.clearGameArea();
            }
        }

        // Global game instance
        let game = new BubblePopGamePro();

        // Menu functions
        function startGame() {
            game.startGame();
        }

        function restartGame() {
            game.restartGame();
        }

        function showMenu() {
            game.showMenu();
        }

        function showInstructions() {
            document.getElementById('startMenu').classList.add('hidden');
            document.getElementById('instructionsMenu').classList.remove('hidden');
        }

        function hideInstructions() {
            document.getElementById('instructionsMenu').classList.add('hidden');
            document.getElementById('startMenu').classList.remove('hidden');
        }

        function showLeaderboard() {
            const leaderboard = game.getLeaderboard();
            const leaderboardList = document.getElementById('leaderboardList');
            
            if (leaderboard.length === 0) {
                leaderboardList.innerHTML = '<p style="color: #666; text-align: center;">No scores yet! Be the first to play!</p>';
            } else {
                leaderboardList.innerHTML = leaderboard.map((entry, index) => {
                    const isCurrentPlayer = entry.playerName && entry.playerName.includes('You');
                    const isTopRank = index < 3;
                    const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                    
                    let entryClass = 'leaderboard-entry';
                    if (isCurrentPlayer) entryClass += ' current-player';
                    else if (isTopRank) entryClass += ' top-rank';
                    
                    return `
                        <div class="${entryClass}">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="font-weight: bold; width: 35px; font-size: 14px;">${rankEmoji}</span>
                                <span style="flex: 1; font-weight: 600;">${entry.playerName || 'Anonymous'}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
                                <span style="color: ${isCurrentPlayer ? 'white' : '#4A90E2'}; font-weight: bold;">${(entry.score || 0).toLocaleString()}</span>
                                <span style="color: ${isCurrentPlayer ? 'rgba(255,255,255,0.8)' : '#666'};">L${entry.level || 1}</span>
                                <span style="color: ${isCurrentPlayer ? 'rgba(255,255,255,0.8)' : '#50C878'};">${entry.accuracy || 0}%</span>
                                <span style="color: ${isCurrentPlayer ? 'rgba(255,255,255,0.8)' : '#8B5CF6'}; text-transform: capitalize;">${entry.mode || 'classic'}</span>
                                <span style="color: ${isCurrentPlayer ? 'rgba(255,255,255,0.6)' : '#FFA502'}; font-size: 11px;">${entry.date || 'Today'}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            document.getElementById('startMenu').classList.add('hidden');
            document.getElementById('leaderboardMenu').classList.remove('hidden');
        }

        function hideLeaderboard() {
            document.getElementById('leaderboardMenu').classList.add('hidden');
            document.getElementById('startMenu').classList.remove('hidden');
        }

        function showShop() {
            game.updateShopDisplay();
            document.getElementById('startMenu').classList.add('hidden');
            document.getElementById('shopMenu').classList.remove('hidden');
        }

        function hideShop() {
            document.getElementById('shopMenu').classList.add('hidden');
            document.getElementById('startMenu').classList.remove('hidden');
        }

        function showStats() {
            const savedData = game.getSavedData();
            const statsDisplay = document.getElementById('statsDisplay');
            
            const stats = [
                { label: 'Total Games', value: savedData.totalGamesPlayed || 0 },
                { label: 'Time Played', value: `${Math.floor((savedData.totalTimePlayed || 0) / 60)}m ${(savedData.totalTimePlayed || 0) % 60}s` },
                { label: 'Total Coins', value: game.coins },
                { label: 'Achievements', value: game.achievements.length },
                { label: 'Favorite Mode', value: game.gameMode },
                { label: 'Preferred Difficulty', value: game.difficulty }
            ];
            
            statsDisplay.innerHTML = stats.map(stat => `
                <div class="stat-card">
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');
            
            document.getElementById('startMenu').classList.add('hidden');
            document.getElementById('statsMenu').classList.remove('hidden');
        }

        function hideStats() {
            document.getElementById('statsMenu').classList.add('hidden');
            document.getElementById('startMenu').classList.remove('hidden');
        }

        function shareScore() {
            const shareText = `🫧 Just scored ${game.score.toLocaleString()} points in Bubble Pop Adventure Pro! 🎮 Level ${game.level} reached with ${game.bestCombo}x best combo! Can you beat my score?`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Bubble Pop Adventure Pro',
                    text: shareText,
                    url: window.location.href
                }).catch(console.error);
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => {
                    game.showAchievement('Score copied to clipboard!');
                }).catch(() => {
                    game.showWarning('Could not copy to clipboard');
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                game.showAchievement('Score copied to clipboard!');
            }
        }

        function toggleSound() {
            game.toggleSound();
        }

        // Initialize audio context on first user interaction
        function initAudioContext() {
            if (game.audioContext && game.audioContext.state === 'suspended') {
                game.audioContext.resume().then(() => {
                    console.log('Audio context resumed');
                });
            }
        }

        // Service Worker registration for PWA functionality
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('data:text/javascript,console.log("SW registered");')
                    .then(registration => console.log('SW registered:', registration.scope))
                    .catch(error => console.log('SW registration failed:', error));
            });
        }

        // Handle device orientation and resize
        window.addEventListener('resize', () => game.handleResize());

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Initialize audio context on first user interaction
        document.addEventListener('click', initAudioContext, { once: true });
        document.addEventListener('touchstart', initAudioContext, { once: true });

        // Performance optimization
        window.addEventListener('beforeunload', () => {
            if (game.gameActive) {
                game.saveData();
            }
        });

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🫧 Bubble Pop Adventure Pro loaded successfully!');
            
            // Initialize touch events for better mobile performance
            document.addEventListener('touchstart', function() {}, { passive: true });
            
            // Set up proper viewport handling
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }

            // Add some initial UI feedback
            setTimeout(() => {
                if (game.soundEnabled) {
                    game.playSound('achievement', 600, 0.2);
                }
            }, 500);
        });

        // Analytics placeholder for enterprise features
        function trackEvent(eventName, parameters = {}) {
            // Placeholder for analytics tracking
            console.log(`📊 Analytics: ${eventName}`, parameters);
            
            // In production, this would connect to analytics services like:
            // - Google Analytics
            // - Firebase Analytics
            // - Custom enterprise analytics
        }

        // Error handling for production
        window.addEventListener('error', (event) => {
            console.error('Game Error:', event.error);
            trackEvent('game_error', {
                error: event.error.message,
                stack: event.error.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    trackEvent('performance_metrics', {
                        loadTime: perfData.loadEventEnd - perfData.fetchStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                        timestamp: new Date().toISOString()
                    });
                }, 1000);
            });
        }
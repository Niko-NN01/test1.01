// --- ASETUKSET ---
const symbols = [
    { icon: "W", name: "Wild", value: 0, weight: 3, image: "images/wild.png", isWild: true }, // WILD - substitutes all
    { icon: "⭐", name: "Scatter", value: 0, weight: 2, image: "images/scatter.png", isScatter: true }, // SCATTER - free spins
    { icon: "⚡", name: "Zeus", value: 100, weight: 1, image: "images/zeus.png" },        // Zeus - rarest
    { icon: "💀", name: "Hades", value: 75, weight: 1.5, image: "images/hades.png" },    // Hades
    { icon: "🔱", name: "Poseidon", value: 50, weight: 2, image: "images/poseidon.png" }, // Poseidon
    { icon: "🦉", name: "Athena", value: 25, weight: 4, image: "images/athena.png" },     // Athena
    { icon: "⚔️", name: "Ares", value: 15, weight: 6, image: "images/ares.png" },         // Ares
    { icon: "👑", name: "Crown", value: 10, weight: 8, image: "images/crown.png" },       // Crown
    { icon: "🏛️", name: "Temple", value: 8, weight: 10, image: "images/temple.png" },    // Temple
    { icon: "🏺", name: "Vase", value: 5, weight: 15, image: "images/vase.png" },         // Vase
    { icon: "🍇", name: "Grapes", value: 3, weight: 20, image: "images/grapes.png" }      // Grapes - common
];
let balance = 100;
let useImages = false; // Set to true when you have images added
let spinSpeed = 1000; // Default spin speed (normal) - slower for better experience

// Allowed bet values
const allowedBets = [0.2, 0.5, 1, 2, 5, 10, 25, 50, 100, 200];

// Free spins state
let freeSpinsRemaining = 0;
let isSuperBonus = false;
let currentBet = 1;

// Audio Context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let spinningOscillator = null;
let spinningGain = null;

// Play sound effect
function playSound(type) {
    try {
        // Try to play HTML audio element first
        const audio = document.getElementById(type + 'Sound');
        if (audio && audio.src) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } else {
            // Fallback to Web Audio API beeps
            playBeep(type);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Generate beep sounds using Web Audio API
function playBeep(type) {
    switch(type) {
        case 'win':
            const winOsc = audioContext.createOscillator();
            const winGain = audioContext.createGain();
            winOsc.connect(winGain);
            winGain.connect(audioContext.destination);
            winOsc.frequency.value = 800;
            winGain.gain.setValueAtTime(0.3, audioContext.currentTime);
            winGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            winOsc.start(audioContext.currentTime);
            winOsc.stop(audioContext.currentTime + 0.3);
            break;
        case 'bigWin':
            // Play ascending tones
            [600, 800, 1000].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.2);
                osc.start(audioContext.currentTime + i * 0.15);
                osc.stop(audioContext.currentTime + i * 0.15 + 0.2);
            });
            break;
        case 'scatter':
            // Play multiple quick beeps
            [1000, 1200, 1400, 1600].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.1);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.1);
            });
            break;
        case 'spin':
            // Continuous spinning sound
            stopSpinSound(); // Stop any existing spin sound
            
            spinningOscillator = audioContext.createOscillator();
            spinningGain = audioContext.createGain();
            
            spinningOscillator.connect(spinningGain);
            spinningGain.connect(audioContext.destination);
            
            spinningOscillator.type = 'sawtooth';
            spinningOscillator.frequency.value = 80;
            
            // Create a pulsing effect
            const lfo = audioContext.createOscillator();
            const lfoGain = audioContext.createGain();
            lfo.frequency.value = 8; // 8 Hz pulsing
            lfoGain.gain.value = 20;
            lfo.connect(lfoGain);
            lfoGain.connect(spinningOscillator.frequency);
            
            spinningGain.gain.setValueAtTime(0, audioContext.currentTime);
            spinningGain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.1);
            
            lfo.start(audioContext.currentTime);
            spinningOscillator.start(audioContext.currentTime);
            
            // Store LFO for cleanup
            spinningOscillator.lfo = lfo;
            break;
    }
}

function stopSpinSound() {
    if (spinningOscillator && spinningGain) {
        spinningGain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        spinningOscillator.stop(audioContext.currentTime + 0.15);
        if (spinningOscillator.lfo) {
            spinningOscillator.lfo.stop(audioContext.currentTime + 0.15);
        }
        spinningOscillator = null;
        spinningGain = null;
    }
}

// Define 10 paylines (row indices for each of 5 reels)
const paylines = [
    [1, 1, 1, 1, 1], // Line 1: Middle row
    [0, 0, 0, 0, 0], // Line 2: Top row
    [2, 2, 2, 2, 2], // Line 3: Bottom row
    [0, 1, 2, 1, 0], // Line 4: V shape
    [2, 1, 0, 1, 2], // Line 5: Inverted V
    [1, 0, 0, 0, 1], // Line 6: Top middle
    [1, 2, 2, 2, 1], // Line 7: Bottom middle
    [0, 0, 1, 2, 2], // Line 8: Ascending
    [2, 2, 1, 0, 0], // Line 9: Descending
    [1, 0, 1, 2, 1]  // Line 10: Zig-zag
];

// --- PELILOGIIKKA ---
function getWeightedSymbol() {
    let availableSymbols = symbols;
    
    // In superbonus mode, exclude low-value symbols (Vase and Grapes)
    if (isSuperBonus) {
        availableSymbols = symbols.filter(s => !['Vase', 'Grapes'].includes(s.name));
    }
    
    const totalWeight = availableSymbols.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let symbol of availableSymbols) {
        random -= symbol.weight;
        if (random <= 0) {
            return symbol;
        }
    }
    return availableSymbols[availableSymbols.length - 1];
}

function spin() {
    // Return 5x5 grid (5 symbols per reel, 5 reels)
    return [
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()]
    ];
}

function play() {
    const betInput = document.getElementById('bet');
    const bet = parseFloat(betInput.value);
    const resultLabel = document.getElementById('result');
    const balanceLabel = document.getElementById('balance');
    const spinBtn = document.getElementById('spinBtn');

    // Check if we're in free spins mode
    if (freeSpinsRemaining > 0) {
        // Use stored bet from when free spins were triggered
        playWithBet(currentBet);
        return;
    }

    // Tarkista panos
    if (isNaN(bet) || bet < 0.2) {
        resultLabel.textContent = "⚠️ Minimum bet is €0.20!";
        resultLabel.style.color = "#ff6b6b";
        return;
    }

    if (bet > balance) {
        resultLabel.textContent = "⚠️ Insufficient Balance!";
        resultLabel.style.color = "#ff6b6b";
        return;
    }

    // Store current bet for potential free spins
    currentBet = bet;
    playWithBet(bet);
}

function playWithBet(bet) {
    const resultLabel = document.getElementById('result');
    const balanceLabel = document.getElementById('balance');
    const spinBtn = document.getElementById('spinBtn');

    // Estä nappi kesken pyörityksen
    spinBtn.disabled = true;

    // Vähennä panos only if not in free spins
    if (freeSpinsRemaining === 0) {
        balance -= bet;
        balanceLabel.textContent = balance.toFixed(2);
    }

    // Get all reel elements (3 symbols x 5 reels = 15 elements)
    const allReels = document.querySelectorAll('.reel');

    // Clear any existing spinning states and intervals first
    allReels.forEach((reel) => {
        if (reel.dataset.spinInterval) {
            clearInterval(parseInt(reel.dataset.spinInterval));
        }
        reel.classList.remove('spin', 'stop', 'winning', 'potential-win');
    });

    // Play spin sound
    playSound('spin');
    
    // Start spinning all reels
    allReels.forEach((reel) => {
        reel.classList.add('spin');
        let spinInterval = setInterval(() => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            displaySymbol(reel, randomSymbol);
        }, 100);
        reel.dataset.spinInterval = spinInterval;
    });

    // Spin and get results
    const reels = spin();
    
    // Stop reels column by column with delay
    for (let col = 0; col < 5; col++) {
        setTimeout(() => {
            for (let row = 0; row < 5; row++) {
                const reel = document.querySelector(`[data-reel="${col}"][data-row="${row}"]`);
                clearInterval(parseInt(reel.dataset.spinInterval));
                displaySymbol(reel, reels[col][row]);
                reel.classList.remove('spin');
                reel.classList.add('stop');
                setTimeout(() => reel.classList.remove('stop'), 200);
            }
            
            // Check for potential big wins and highlight
            if (col >= 2) {
                highlightPotentialWin(reels, col, bet);
            }
            
            // Check win after last column stops
            if (col === 4) {
                stopSpinSound(); // Stop spinning sound
                setTimeout(() => checkWin(reels, bet), 300);
            }
        }, 500 + (col * spinSpeed));
    }
}

function checkWin(reels, bet) {
    const resultLabel = document.getElementById('result');
    const balanceLabel = document.getElementById('balance');
    const spinBtn = document.getElementById('spinBtn');

    let totalWin = 0;
    let winningLines = [];
    let winningPositions = new Set(); // Track winning reel positions

    // Check each payline
    paylines.forEach((payline, lineIndex) => {
        // Get symbols on this payline
        const lineSymbols = payline.map((row, col) => reels[col][row]);
        
        // Count wilds
        const wildCount = lineSymbols.filter(s => s.isWild).length;
        
        // All wilds on a line = special win
        if (wildCount === 5) {
            const lineWin = bet * 200;
            totalWin += lineWin;
            winningLines.push({ line: lineIndex + 1, symbol: symbols.find(s => s.isWild), count: 5, win: lineWin, payline: payline });
            // Mark all positions as winning
            payline.forEach((row, col) => winningPositions.add(`${col}-${row}`));
            return;
        }

        // Count each non-wild symbol from left to right
        const firstSymbol = lineSymbols[0];
        let matchCount = 1;
        let matchingSymbol = firstSymbol.isWild ? null : firstSymbol;

        for (let i = 1; i < 5; i++) {
            const current = lineSymbols[i];
            
            if (current.isWild) {
                matchCount++;
                continue;
            }
            
            if (matchingSymbol === null) {
                matchingSymbol = current;
                matchCount++;
            } else if (current.icon === matchingSymbol.icon) {
                matchCount++;
            } else {
                break; // Stop on first non-match
            }
        }

        // Calculate win if 3+ matches
        if (matchCount >= 3 && matchingSymbol) {
            let lineWin = 0;
            if (matchCount === 5) {
                lineWin = bet * matchingSymbol.value;
            } else if (matchCount === 4) {
                lineWin = bet * Math.floor(matchingSymbol.value * 0.5);
            } else if (matchCount === 3) {
                lineWin = bet * Math.floor(matchingSymbol.value * 0.2);
            }
            
            if (lineWin > 0) {
                totalWin += lineWin;
                winningLines.push({ line: lineIndex + 1, symbol: matchingSymbol, count: matchCount, win: lineWin, payline: payline });
                // Mark winning positions
                for (let i = 0; i < matchCount; i++) {
                    winningPositions.add(`${i}-${payline[i]}`);
                }
            }
        }
    });

    // Highlight winning symbols
    highlightWinningSymbols(winningPositions);

    // Display results
    if (totalWin > 0) {
        const bestWin = winningLines.reduce((max, w) => w.win > max.win ? w : max);
        const wildBonus = winningLines.some(w => w.symbol.isWild) ? " 🌟" : "";
        
        let winType = 'normal';
        
        // Play appropriate win sound
        if (totalWin >= bet * 20) {
            playSound('bigWin');
        } else {
            playSound('win');
        }
        
        if (bestWin.count === 5 && bestWin.symbol.isWild) {
            resultLabel.textContent = `🌟 WILD OLYMPUS! Line ${bestWin.line} = +€${totalWin.toFixed(2)} (${winningLines.length} lines!)`;
            resultLabel.style.color = "#ff00ff";
            winType = 'mega';
        } else if (bestWin.count === 5) {
            resultLabel.textContent = `🏛️ JACKPOT! ${bestWin.symbol.icon} x5 on Line ${bestWin.line} = +€${totalWin.toFixed(2)} (${winningLines.length} lines!)${wildBonus}`;
            resultLabel.style.color = "#ffd700";
            winType = 'mega';
        } else if (totalWin >= bet * 20) {
            resultLabel.textContent = `⚡ BIG WIN! +€${totalWin.toFixed(2)} on ${winningLines.length} line(s!)${wildBonus}`;
            resultLabel.style.color = "#ffed4e";
            winType = 'big';
        } else {
            resultLabel.textContent = `⚜️ WIN! +€${totalWin.toFixed(2)} on ${winningLines.length} line(s)${wildBonus}`;
            resultLabel.style.color = "#d4af37";
        }
        
        // Show win animation overlay for big wins
        if (totalWin >= bet * 20) {
            showBigWinAnimation(totalWin, winType);
        }
    } else {
        resultLabel.textContent = "⚔️ The Fates Have Spoken";
        resultLabel.style.color = "#ff6b6b";
    }

    balance += totalWin;
    balanceLabel.textContent = balance.toFixed(2);

    // Handle free spins countdown first
    if (freeSpinsRemaining > 0) {
        freeSpinsRemaining--;
        updateFreeSpinsCounter();
        
        if (freeSpinsRemaining > 0) {
            // Auto-spin next free spin after delay - call playWithBet directly
            setTimeout(() => {
                playWithBet(currentBet);
            }, 2000);
        } else {
            // End of free spins
            isSuperBonus = false;
            spinBtn.disabled = false;
            showFreeSpinsEndSummary();
        }
        return; // Don't continue to scatter check or manual button enable
    }

    // Count scatter symbols across all positions (only in normal play)
    let scatterCount = 0;
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 5; row++) {
            if (reels[col][row].isScatter) {
                scatterCount++;
            }
        }
    }

    // Check for scatter bonus (only trigger in normal play, not during free spins)
    if (scatterCount >= 3) {
        // Trigger free spins based on scatter count
        let newFreeSpins = 0;
        let isSuperBonusMode = false;
        
        if (scatterCount === 3) {
            newFreeSpins = 10;
        } else if (scatterCount === 4) {
            newFreeSpins = 10;
            isSuperBonusMode = true;
        } else if (scatterCount >= 5) {
            newFreeSpins = 20;
            isSuperBonusMode = true;
        }
        
        // Re-enable button before showing animation
        spinBtn.disabled = false;
        
        // Play scatter sound
        playSound('scatter');
        
        // Show free spins won animation, then offer gamble
        showFreeSpinsAnimation(scatterCount, newFreeSpins, isSuperBonusMode);
        return;
    }

    // Check if balance is zero
    if (balance < 0.2) {
        resultLabel.textContent = "⚰️ Hades Claims Your Fortune!";
        resultLabel.style.color = "#ff6b6b";
    }

    spinBtn.disabled = false;
}

// Highlight potential big wins as reels stop
function highlightPotentialWin(reels, stoppedCol, bet) {
    // Check each payline for potential wins
    paylines.forEach((payline) => {
        // Only check the stopped columns
        const stoppedSymbols = [];
        for (let col = 0; col <= stoppedCol; col++) {
            stoppedSymbols.push(reels[col][payline[col]]);
        }
        
        // Check if we have matching symbols or wilds
        let matchCount = 1;
        let matchingSymbol = stoppedSymbols[0].isWild ? null : stoppedSymbols[0];
        
        for (let i = 1; i < stoppedSymbols.length; i++) {
            const current = stoppedSymbols[i];
            
            if (current.isWild) {
                matchCount++;
                continue;
            }
            
            if (matchingSymbol === null) {
                matchingSymbol = current;
                matchCount++;
            } else if (current.icon === matchingSymbol.icon) {
                matchCount++;
            } else {
                break;
            }
        }
        
        // If we have 3+ matching symbols and potential for big win
        if (matchCount >= 3 && matchingSymbol) {
            const potentialWin = bet * matchingSymbol.value;
            
            // Highlight if it's a high-value symbol or potential big win
            if (potentialWin >= bet * 15 || matchingSymbol.value >= 25) {
                for (let col = 0; col < matchCount; col++) {
                    const reel = document.querySelector(`[data-reel="${col}"][data-row="${payline[col]}"]`);
                    if (reel) {
                        reel.classList.add('potential-win');
                        setTimeout(() => reel.classList.remove('potential-win'), 800);
                    }
                }
            }
        }
    });
}

// Highlight winning symbols
function highlightWinningSymbols(winningPositions) {
    // Clear all previous highlights
    document.querySelectorAll('.reel').forEach(reel => {
        reel.classList.remove('winning', 'winning-pulse');
    });

    // Add highlight to winning positions
    winningPositions.forEach(pos => {
        const [col, row] = pos.split('-');
        const reel = document.querySelector(`[data-reel="${col}"][data-row="${row}"]`);
        if (reel) {
            reel.classList.add('winning');
            setTimeout(() => reel.classList.add('winning-pulse'), 50);
        }
    });

    // Remove highlights after animation
    setTimeout(() => {
        document.querySelectorAll('.reel').forEach(reel => {
            reel.classList.remove('winning', 'winning-pulse');
        });
    }, 3000);
}

// Show big win animation
function showBigWinAnimation(amount, type) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'win-overlay';
    overlay.innerHTML = `
        <div class="win-animation ${type}">
            <div class="win-text">${type === 'mega' ? 'LEGENDARY WIN!' : 'BIG WIN!'}</div>
            <div class="win-amount">+€${amount.toFixed(2)}</div>
            <div class="win-subtitle">Euros</div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Remove after animation
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}
// Display symbol (emoji or image)
function displaySymbol(element, symbol) {
    if (useImages) {
        element.innerHTML = `<img src="${symbol.image}" alt="${symbol.name}" class="symbol-img">`;
    } else {
        element.textContent = symbol.icon;
    }
}

// Bet adjustment functions
function adjustBet(amount) {
    const betInput = document.getElementById('bet');
    let currentBet = parseFloat(betInput.value) || 1;
    let newBet = currentBet + amount;
    
    // Ensure bet is at least 0.2 and not more than balance
    newBet = Math.max(0.2, Math.min(newBet, balance));
    betInput.value = newBet.toFixed(2);
    updateBetDisplay();
}

function setBet(amount) {
    const betInput = document.getElementById('bet');
    let newBet = Math.max(0.2, Math.min(amount, balance));
    betInput.value = newBet;
    updateBetDisplay();
}

// Toggle bet dropdown menu
function toggleBetMenu() {
    const dropdown = document.getElementById('betDropdown');
    dropdown.classList.toggle('show');
}

// Show free spins won animation
function showFreeSpinsAnimation(scatterCount, spinsWon, isSuperBonusMode) {
    const overlay = document.createElement('div');
    overlay.className = 'free-spins-overlay';
    overlay.innerHTML = `
        <div class="free-spins-content">
            <div class="scatter-stars">⭐ ⭐ ⭐${scatterCount >= 4 ? ' ⭐' : ''}${scatterCount >= 5 ? ' ⭐' : ''}</div>
            <h2>${isSuperBonusMode ? '🏆 SUPERBONUS!' : '🎰 FREE SPINS!'}</h2>
            <p class="free-spins-count">${spinsWon} FREE SPINS</p>
            ${isSuperBonusMode ? '<p class="bonus-info">Low symbols removed!</p>' : ''}
            <button class="gamble-btn" onclick="showGambleWheel(${spinsWon}, ${isSuperBonusMode})">🎲 GAMBLE</button>
            <button class="collect-btn" onclick="startFreeSpins(${spinsWon}, ${isSuperBonusMode})">✓ COLLECT</button>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
}

// Show gamble wheel
function showGambleWheel(currentSpins, isSuperBonusMode) {
    // Remove free spins animation
    const oldOverlay = document.querySelector('.free-spins-overlay');
    if (oldOverlay) oldOverlay.remove();
    
    // Wheel options - if already superbonus, don't include superbonus option
    const normalOptions = [5, 7, 5, 7, 15, 20];
    const normalWithSuperOptions = [5, 7, 5, 7, 15, 20, 'SUPERBONUS'];
    const options = isSuperBonusMode ? normalOptions : normalWithSuperOptions;
    
    const overlay = document.createElement('div');
    overlay.className = 'gamble-overlay';
    overlay.innerHTML = `
        <div class="gamble-content">
            <h2>🎰 GAMBLE YOUR FREE SPINS</h2>
            <p class="current-spins">Current: ${currentSpins} spins${isSuperBonusMode ? ' (SUPERBONUS)' : ''}</p>
            <div class="wheel-container">
                <div class="wheel-pointer">▼</div>
                <div class="wheel" id="gambleWheel">
                    ${options.map((opt, i) => `
                        <div class="wheel-segment" data-value="${opt}" style="transform: rotate(${(360 / options.length) * i}deg)">
                            ${opt === 'SUPERBONUS' ? '<span class="superbonus-text">SUPER<br>BONUS</span>' : opt}
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="spin-wheel-btn" onclick="spinGambleWheel(${currentSpins}, ${isSuperBonusMode})">SPIN WHEEL</button>
            <button class="decline-btn" onclick="startFreeSpins(${currentSpins}, ${isSuperBonusMode})">DECLINE</button>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
}

// Spin gamble wheel
function spinGambleWheel(currentSpins, wasSuperBonus) {
    const wheel = document.getElementById('gambleWheel');
    const spinBtn = document.querySelector('.spin-wheel-btn');
    const declineBtn = document.querySelector('.decline-btn');
    
    spinBtn.disabled = true;
    declineBtn.disabled = true;
    
    // Get options based on mode
    const normalOptions = [5, 7, 5, 7, 15, 20];
    const normalWithSuperOptions = [5, 7, 5, 7, 15, 20, 'SUPERBONUS'];
    const options = wasSuperBonus ? normalOptions : normalWithSuperOptions;
    
    // Random result
    const resultIndex = Math.floor(Math.random() * options.length);
    const result = options[resultIndex];
    
    // Calculate rotation (multiple full spins + landing position)
    const segmentAngle = 360 / options.length;
    const baseRotation = 360 * 5; // 5 full spins
    const targetRotation = baseRotation + (resultIndex * segmentAngle) + (segmentAngle / 2);
    
    wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheel.style.transform = `rotate(${targetRotation}deg)`;
    
    setTimeout(() => {
        let newSpins;
        let newSuperBonus = wasSuperBonus;
        
        if (result === 'SUPERBONUS') {
            newSpins = 10;
            newSuperBonus = true;
            showGambleResult('🏆 SUPERBONUS!', newSpins, newSuperBonus);
        } else {
            newSpins = result;
            showGambleResult(result > currentSpins ? '🎉 UPGRADE!' : '😔 DOWNGRADE', newSpins, newSuperBonus);
        }
    }, 4000);
}

// Show gamble result
function showGambleResult(message, spins, isSuperBonusMode) {
    const overlay = document.querySelector('.gamble-overlay');
    overlay.innerHTML = `
        <div class="gamble-content">
            <h2>${message}</h2>
            <p class="free-spins-count">${spins} FREE SPINS</p>
            ${isSuperBonusMode ? '<p class="bonus-info">🏆 SUPERBONUS MODE</p>' : ''}
            <button class="collect-btn" onclick="startFreeSpins(${spins}, ${isSuperBonusMode})">START FREE SPINS</button>
        </div>
    `;
}

// Start free spins
function startFreeSpins(spins, isSuperBonusMode) {
    // Remove overlays
    document.querySelectorAll('.free-spins-overlay, .gamble-overlay').forEach(el => el.remove());
    
    freeSpinsRemaining = spins;
    isSuperBonus = isSuperBonusMode;
    
    // Show free spins counter
    updateFreeSpinsCounter();
    
    // Start first free spin
    setTimeout(() => play(), 1000);
}

// Update free spins counter display
function updateFreeSpinsCounter() {
    let counter = document.getElementById('freeSpinsCounter');
    
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'freeSpinsCounter';
        counter.className = 'free-spins-counter';
        document.querySelector('.slot-machine').appendChild(counter);
    }
    
    if (freeSpinsRemaining > 0) {
        counter.innerHTML = `
            <div class="counter-content">
                <span class="counter-label">${isSuperBonus ? '🏆 SUPERBONUS' : '🎰 FREE SPINS'}</span>
                <span class="counter-value">${freeSpinsRemaining}</span>
            </div>
        `;
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
    }
}

// Show free spins end summary
function showFreeSpinsEndSummary() {
    const overlay = document.createElement('div');
    overlay.className = 'free-spins-overlay';
    overlay.innerHTML = `
        <div class="free-spins-content">
            <h2>🎊 FREE SPINS COMPLETE!</h2>
            <p class="summary-text">Return to normal play</p>
            <button class="collect-btn" onclick="this.parentElement.parentElement.remove()">CONTINUE</button>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
}

// Update bet display
function updateBetDisplay() {
    const betInput = document.getElementById('bet');
    const display = document.getElementById('currentBetDisplay');
    if (display) {
        const value = parseFloat(betInput.value) || 1;
        display.textContent = value.toFixed(2);
    }
}

// Turbo mode toggle
function toggleTurbo() {
    const toggle = document.getElementById('turboToggle');
    if (toggle.checked) {
        spinSpeed = 600; // Turbo (faster but still reasonable)
    } else {
        spinSpeed = 1000; // Normal (slower)
    }
}

// Toggle info modal
function toggleInfo() {
    const modal = document.getElementById('infoModal');
    modal.classList.toggle('show');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('infoModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
    
    // Close bet dropdown when clicking outside
    const dropdown = document.getElementById('betDropdown');
    const betLabel = document.querySelector('.bet-label');
    if (dropdown && !dropdown.contains(e.target) && e.target !== betLabel) {
        dropdown.classList.remove('show');
    }
});

// Enter-näppäin toimii myös
document.getElementById('bet').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        play();
    }
});
// Toggle buy bonus dropdown menu
function toggleBuyBonusMenu() {
    const dropdown = document.getElementById('buyBonusDropdown');
    const betInput = document.getElementById('bet');
    const currentBet = parseFloat(betInput.value) || 1;
    
    // Calculate costs for each option
    const scatter3Cost = currentBet * 50;   // 10 free spins (normal)
    const scatter4Cost = currentBet * 75;   // 10 free spins (superbonus)
    const scatter5Cost = currentBet * 100;  // 20 free spins (superbonus)
    
    // Populate dropdown with options
    dropdown.innerHTML = `
        <div class="bonus-buy-option ${balance < scatter3Cost ? 'disabled' : ''}" onclick="buyBonusFromDropdown(10, false, ${scatter3Cost})">
            <div class="bonus-buy-info">
                <div class="bonus-buy-title">⭐⭐⭐ 3 Scatters</div>
                <div class="bonus-buy-desc">10 Free Spins</div>
            </div>
            <div class="bonus-buy-cost">€${scatter3Cost.toFixed(2)}</div>
        </div>
        <div class="bonus-buy-option superbonus ${balance < scatter4Cost ? 'disabled' : ''}" onclick="buyBonusFromDropdown(10, true, ${scatter4Cost})">
            <div class="bonus-buy-info">
                <div class="bonus-buy-title">⭐⭐⭐⭐ 4 Scatters</div>
                <div class="bonus-buy-desc">10 Spins (Superbonus)</div>
            </div>
            <div class="bonus-buy-cost">€${scatter4Cost.toFixed(2)}</div>
        </div>
        <div class="bonus-buy-option superbonus ${balance < scatter5Cost ? 'disabled' : ''}" onclick="buyBonusFromDropdown(20, true, ${scatter5Cost})">
            <div class="bonus-buy-info">
                <div class="bonus-buy-title">⭐⭐⭐⭐⭐ 5 Scatters</div>
                <div class="bonus-buy-desc">20 Spins (Superbonus)</div>
            </div>
            <div class="bonus-buy-cost">€${scatter5Cost.toFixed(2)}</div>
        </div>
    `;
    
    dropdown.classList.toggle('show');
}

// Buy bonus from dropdown
function buyBonusFromDropdown(spins, isSuperBonusMode, cost) {
    // Check if player can afford
    if (balance < cost) {
        return;
    }
    
    // Close dropdown
    const dropdown = document.getElementById('buyBonusDropdown');
    dropdown.classList.remove('show');
    
    // Deduct cost from balance
    balance -= cost;
    const balanceLabel = document.getElementById('balance');
    balanceLabel.textContent = balance.toFixed(2);
    
    // Show bought bonus animation with gamble option
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'free-spins-overlay';
    confirmOverlay.innerHTML = `
        <div class="free-spins-content">
            <h2>🎊 BONUS PURCHASED!</h2>
            <p class="free-spins-count">${spins} FREE SPINS</p>
            ${isSuperBonusMode ? '<p class="bonus-info">🏆 SUPERBONUS MODE</p>' : ''}
            <button class="gamble-btn" onclick="showGambleWheel(${spins}, ${isSuperBonusMode})">🎲 GAMBLE</button>
            <button class="collect-btn" onclick="startFreeSpins(${spins}, ${isSuperBonusMode})">✓ COLLECT</button>
        </div>
    `;
    document.body.appendChild(confirmOverlay);
    setTimeout(() => confirmOverlay.classList.add('show'), 10);
}

// Buy bonus and start free spins
function buyBonus(spins, isSuperBonusMode, cost) {
    // Check if player can afford
    if (balance < cost) {
        return;
    }
    
    // Deduct cost from balance
    balance -= cost;
    const balanceLabel = document.getElementById('balance');
    balanceLabel.textContent = balance.toFixed(2);
    
    // Remove buy menu
    const overlay = document.querySelector('.buy-bonus-overlay');
    if (overlay) overlay.remove();
    
    // Show bought bonus animation
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'free-spins-overlay';
    confirmOverlay.innerHTML = `
        <div class="free-spins-content">
            <h2>🎊 BONUS PURCHASED!</h2>
            <p class="free-spins-count">${spins} FREE SPINS</p>
            ${isSuperBonusMode ? '<p class="bonus-info">🏆 SUPERBONUS MODE</p>' : ''}
            <button class="collect-btn" onclick="startFreeSpins(${spins}, ${isSuperBonusMode})">START FREE SPINS</button>
        </div>
    `;
    document.body.appendChild(confirmOverlay);
    setTimeout(() => confirmOverlay.classList.add('show'), 10);
}
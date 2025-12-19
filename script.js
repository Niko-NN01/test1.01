// --- ASETUKSET ---
const symbols = [
    { icon: "🌟", name: "Wild", value: 0, weight: 3, image: "images/wild.png", isWild: true }, // WILD - substitutes all
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
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let symbol of symbols) {
        random -= symbol.weight;
        if (random <= 0) {
            return symbol;
        }
    }
    return symbols[symbols.length - 1];
}

function spin() {
    // Return 3x5 grid (3 symbols per reel, 5 reels)
    return [
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()],
        [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()]
    ];
}

function play() {
    const betInput = document.getElementById('bet');
    const bet = parseInt(betInput.value);
    const resultLabel = document.getElementById('result');
    const balanceLabel = document.getElementById('balance');
    const spinBtn = document.getElementById('spinBtn');

    // Tarkista panos
    if (isNaN(bet) || bet <= 0) {
        resultLabel.textContent = "⚠️ Enter a valid number!";
        resultLabel.style.color = "#ff6b6b";
        return;
    }

    if (bet > balance) {
        resultLabel.textContent = "⚠️ Insufficient Drachmas!";
        resultLabel.style.color = "#ff6b6b";
        return;
    }

    // Estä nappi kesken pyörityksen
    spinBtn.disabled = true;

    // Vähennä panos
    balance -= bet;
    balanceLabel.textContent = balance;

    // Get all reel elements (3 symbols x 5 reels = 15 elements)
    const allReels = document.querySelectorAll('.reel');

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
            for (let row = 0; row < 3; row++) {
                const reel = document.querySelector(`[data-reel="${col}"][data-row="${row}"]`);
                clearInterval(parseInt(reel.dataset.spinInterval));
                displaySymbol(reel, reels[col][row]);
                reel.classList.remove('spin');
                reel.classList.add('stop');
                setTimeout(() => reel.classList.remove('stop'), 200);
            }
            
            // Check win after last column stops
            if (col === 4) {
                setTimeout(() => checkWin(reels, bet), 300);
            }
        }, 500 + (col * 300));
            }
        }, 500 + (index * 300));
    });
}

function checkWin(reels, bet) {
    const resultLabel = document.getElementById('result');
    const balanceLabel = document.getElementById('balance');
    const spinBtn = document.getElementById('spinBtn');

    let totalWin = 0;
    let winningLines = [];

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
            winningLines.push({ line: lineIndex + 1, symbol: symbols.find(s => s.isWild), count: 5, win: lineWin });
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
                winningLines.push({ line: lineIndex + 1, symbol: matchingSymbol, count: matchCount, win: lineWin });
            }
        }
    });

    // Display results
    if (totalWin > 0) {
        const bestWin = winningLines.reduce((max, w) => w.win > max.win ? w : max);
        const wildBonus = winningLines.some(w => w.symbol.isWild) ? " 🌟" : "";
        
        if (bestWin.count === 5 && bestWin.symbol.isWild) {
            resultLabel.textContent = `🌟 WILD OLYMPUS! Line ${bestWin.line} = +${totalWin} (${winningLines.length} lines!)`;
            resultLabel.style.color = "#ff00ff";
        } else if (bestWin.count === 5) {
            resultLabel.textContent = `🏛️ JACKPOT! ${bestWin.symbol.icon} x5 on Line ${bestWin.line} = +${totalWin} (${winningLines.length} lines!)${wildBonus}`;
            resultLabel.style.color = "#ffd700";
        } else if (totalWin >= bet * 20) {
            resultLabel.textContent = `⚡ BIG WIN! +${totalWin} on ${winningLines.length} line(s!)${wildBonus}`;
            resultLabel.style.color = "#ffed4e";
        } else {
            resultLabel.textContent = `⚜️ WIN! +${totalWin} Drachmas on ${winningLines.length} line(s)${wildBonus}`;
            resultLabel.style.color = "#87ceeb";
        }
        
        if (totalWin >= bet * 50) {
            resultLabel.classList.add('big-win');
            setTimeout(() => resultLabel.classList.remove('big-win'), 2000);
        }
    } else {
        resultLabel.textContent = "⚔️ The Fates Have Spoken";
        resultLabel.style.color = "#ff6b6b";
    }

    balance += totalWin;
    balanceLabel.textContent = balance;

    // Check if balance is zero
    if (balance === 0) {
        resultLabel.textContent = "⚰️ Hades Claims Your Fortune!";
        resultLabel.style.color = "#ff6b6b";
    }

    spinBtn.disabled = false;
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
    let currentBet = parseInt(betInput.value) || 10;
    let newBet = currentBet + amount;
    
    // Ensure bet is at least 1 and not more than balance
    newBet = Math.max(1, Math.min(newBet, balance));
    betInput.value = newBet;
}

function setBet(amount) {
    const betInput = document.getElementById('bet');
    let newBet = Math.max(1, Math.min(amount, balance));
    betInput.value = newBet;
}

// Enter-näppäin toimii myös
document.getElementById('bet').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        play();
    }
});

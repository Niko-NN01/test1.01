// --- ASETUKSET ---
const symbols = [
    { icon: "⚡", value: 100, weight: 1 },    // Zeus - rarest
    { icon: "🔱", value: 50, weight: 2 },     // Poseidon
    { icon: "👑", value: 25, weight: 3 },     // Crown
    { icon: "🦉", value: 15, weight: 5 },     // Athena
    { icon: "⚔️", value: 10, weight: 7 },     // Ares
    { icon: "🏛️", value: 8, weight: 10 },     // Temple
    { icon: "🏺", value: 5, weight: 15 },     // Vase
    { icon: "🍇", value: 3, weight: 20 }      // Grapes - common
];
let balance = 100;

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
    return [
        getWeightedSymbol(),
        getWeightedSymbol(),
        getWeightedSymbol(),
        getWeightedSymbol(),
        getWeightedSymbol()
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

    // Animaatio
    const reelElements = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3'),
        document.getElementById('reel4'),
        document.getElementById('reel5')
    ];

    // Start spinning all reels
    reelElements.forEach((reel, index) => {
        reel.classList.add('spin');
        // Randomize display during spin
        let spinInterval = setInterval(() => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].icon;
        }, 100);
        reel.dataset.spinInterval = spinInterval;
    });

    // Stop reels one by one with delay
    const reels = spin();
    reelElements.forEach((reel, index) => {
        setTimeout(() => {
            clearInterval(parseInt(reel.dataset.spinInterval));
            reel.textContent = reels[index].icon;
            reel.classList.remove('spin');
            reel.classList.add('stop');
            setTimeout(() => reel.classList.remove('stop'), 200);
            
            // Check win after last reel stops
            if (index === 4) {
                setTimeout(() => checkWin(reels, bet), 300);
            }
        }, 500 + (index * 300));
    });
}

function checkWin(reels, bet) {
    const resultLabel = document.getElementById('result');
    const balanceLabel = document.getElementById('balance');
    const spinBtn = document.getElementById('spinBtn');

    // Count matching symbols
    const symbolCounts = {};
    reels.forEach(symbol => {
        const icon = symbol.icon;
        symbolCounts[icon] = (symbolCounts[icon] || 0) + 1;
    });

    let win = 0;
    let maxMatch = 0;
    let winningSymbol = null;

    // Find best match
    for (let icon in symbolCounts) {
        if (symbolCounts[icon] > maxMatch) {
            maxMatch = symbolCounts[icon];
            winningSymbol = symbols.find(s => s.icon === icon);
        }
    }

    // Calculate win based on matches
    if (maxMatch === 5) {
        win = bet * winningSymbol.value;
        resultLabel.textContent = `🏛️ DIVINE JACKPOT! ${winningSymbol.icon} x5 = +${win}`;
        resultLabel.style.color = "#ffd700";
        resultLabel.classList.add('big-win');
        setTimeout(() => resultLabel.classList.remove('big-win'), 2000);
    } else if (maxMatch === 4) {
        win = bet * Math.floor(winningSymbol.value * 0.5);
        resultLabel.textContent = `⚡ MIGHTY WIN! ${winningSymbol.icon} x4 = +${win}`;
        resultLabel.style.color = "#ffed4e";
    } else if (maxMatch === 3) {
        win = bet * Math.floor(winningSymbol.value * 0.2);
        resultLabel.textContent = `⚜️ DIVINE FAVOR! ${winningSymbol.icon} x3 = +${win}`;
        resultLabel.style.color = "#87ceeb";
    } else {
        resultLabel.textContent = "⚔️ The Fates Have Spoken";
        resultLabel.style.color = "#ff6b6b";
    }

    balance += win;
    balanceLabel.textContent = balance;

    // Check if balance is zero
    if (balance === 0) {
        resultLabel.textContent = "⚰️ Hades Claims Your Fortune!";
        resultLabel.style.color = "#ff6b6b";
    }

    spinBtn.disabled = false;
}

// Enter-näppäin toimii myös
document.getElementById('bet').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        play();
    }
});

// --- ASETUKSET ---
const symbols = ["⚡", "🔱", "🦉", "⚔️", "👑"];
let balance = 100;

// --- PELILOGIIKKA ---
function spin() {
    return [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
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
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');

    reel1.classList.add('spin');
    reel2.classList.add('spin');
    reel3.classList.add('spin');

    // Pyöritä rullat
    setTimeout(() => {
        const reels = spin();
        
        reel1.textContent = reels[0];
        reel2.textContent = reels[1];
        reel3.textContent = reels[2];

        reel1.classList.remove('spin');
        reel2.classList.remove('spin');
        reel3.classList.remove('spin');

        // Tarkista voitto
        let win = 0;
        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            win = bet * 5;
            resultLabel.textContent = "�️ BLESSING OF THE GODS! +" + win;
            resultLabel.style.color = "#ffd700";
        } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
            win = bet * 2;
            resultLabel.textContent = "⚜️ DIVINE FAVOR! +" + win;
            resultLabel.style.color = "#87ceeb";
        } else {
            resultLabel.textContent = "⚔️ The Fates Have Spoken";
            resultLabel.style.color = "#ff6b6b";
        }

        balance += win;
        balanceLabel.textContent = balance;

        // Tarkiska onko saldo loppu
        if (balance === 0) {
            resultLabel.textContent = "⚰️ Hades Claims Your Fortune!";
            resultLabel.style.color = "#ff6b6b";
        }

        spinBtn.disabled = false;
    }, 500);
}

// Enter-näppäin toimii myös
document.getElementById('bet').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        play();
    }
});

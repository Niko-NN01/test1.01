import tkinter as tk
import random

# --- ASETUKSET ---
symbols = ["🍒", "🍋", "🔔", "⭐", "7️⃣"]
balance = 100

# --- PELILOGIIKKA ---
def spin():
    return [random.choice(symbols) for _ in range(3)]

def play():
    global balance
    try:
        bet = int(bet_entry.get())
    except ValueError:
        result_label.config(text="Syötä numero!")
        return

    if bet <= 0 or bet > balance:
        result_label.config(text="Virheellinen panos")
        return

    balance -= bet
    reels = spin()

    reel1.config(text=reels[0])
    reel2.config(text=reels[1])
    reel3.config(text=reels[2])

    win = 0
    if reels[0] == reels[1] == reels[2]:
        win = bet * 5
        result_label.config(text="🎉 ISO VOITTO!")
    elif reels[0] == reels[1] or reels[1] == reels[2]:
        win = bet * 2
        result_label.config(text="🙂 Voitto!")
    else:
        result_label.config(text="❌ Ei voittoa")

    balance += win
    balance_label.config(text=f"Saldo: {balance}")

# --- UI ---
root = tk.Tk()
root.title("🎰 Casino Slot Machine")
root.geometry("400x300")
root.configure(bg="#1b1b1b")

balance_label = tk.Label(root, text=f"Saldo: {balance}", fg="white", bg="#1b1b1b", font=("Arial", 14))
balance_label.pack(pady=10)

frame = tk.Frame(root, bg="#1b1b1b")
frame.pack(pady=10)

reel1 = tk.Label(frame, text="❔", font=("Arial", 40), bg="#1b1b1b", fg="gold")
reel1.grid(row=0, column=0, padx=10)

reel2 = tk.Label(frame, text="❔", font=("Arial", 40), bg="#1b1b1b", fg="gold")
reel2.grid(row=0, column=1, padx=10)

reel3 = tk.Label(frame, text="❔", font=("Arial", 40), bg="#1b1b1b", fg="gold")
reel3.grid(row=0, column=2, padx=10)

bet_entry = tk.Entry(root, font=("Arial", 12), justify="center")
bet_entry.pack(pady=5)
bet_entry.insert(0, "10")

spin_button = tk.Button(root, text="SPIN 🎰", command=play, font=("Arial", 14), bg="gold")
spin_button.pack(pady=10)

result_label = tk.Label(root, text="", fg="white", bg="#1b1b1b", font=("Arial", 12))
result_label.pack()

root.mainloop()

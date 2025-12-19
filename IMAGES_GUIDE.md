# Adding God Images to Your Slot Machine

## ✅ What's Already Done
- **Hades symbol added** (💀) with 75x value (second rarest!)
- Code updated to support custom images for all symbols
- CSS styling for images ready

## 📁 Folder Structure
Create an `images` folder in your project:
```
d:\test1.01\
├── images/
│   ├── zeus.png
│   ├── hades.png
│   ├── poseidon.png
│   ├── athena.png
│   ├── ares.png
│   ├── crown.png
│   ├── temple.png
│   ├── vase.png
│   └── grapes.png
├── index.html
├── script.js
└── style.css
```

## 🎨 How to Add Images

### Option 1: Use AI Image Generator (Recommended)
1. Go to **Bing Image Creator** (bing.com/create)
2. Generate images with prompts like:
   - "Zeus Greek god portrait, golden lightning, digital art"
   - "Hades Greek god of underworld, skull crown, dark flames"
   - "Poseidon Greek god with trident, ocean waves"
   - "Athena Greek goddess with owl and wisdom"
   - "Ares Greek god of war with sword and armor"

3. Download each image
4. Rename to match the filenames above
5. Save in the `images` folder

### Option 2: Use Stock Images
Download free images from:
- Pixabay.com
- Pexels.com
- Unsplash.com

Search for: "Greek mythology Zeus", "Poseidon artwork", etc.

## 🚀 Activate Images
Once you have the images:
1. Open `script.js`
2. Find line 12: `let useImages = false;`
3. Change it to: `let useImages = true;`
4. Save and refresh the game!

## 📐 Image Requirements
- **Format**: PNG (transparent background recommended) or JPG
- **Size**: 256x256px or 512x512px recommended
- **Style**: Keep consistent art style across all symbols

## 🎮 Current Symbol Values
- ⚡ **Zeus** - 100x (rarest)
- 💀 **Hades** - 75x (NEW! second rarest)
- 🔱 **Poseidon** - 50x
- 🦉 **Athena** - 25x
- ⚔️ **Ares** - 15x
- 👑 **Crown** - 10x
- 🏛️ **Temple** - 8x
- 🏺 **Vase** - 5x
- 🍇 **Grapes** - 3x (common)

## 🎯 Need Help?
The game works with emojis right now. Images are optional but make it look more professional!

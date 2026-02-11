# Whisk Automation Chrome Extension

Google Whisk ke liye automatic image generator - text prompts se images banao aur download karo.

## Features

✅ .txt file se prompts upload karo (ek line = ek prompt)
✅ Automatic paste aur generate
✅ Pause/Resume automation
✅ Auto-retry agar fail ho
✅ Duplicate prompts skip karo
✅ Progress tracking with percentage
✅ Sab images ek ZIP file me download

## Installation (Kaise Install Karein)

1. **Chrome kholo** aur address bar me type karo: `chrome://extensions/`
2. **Developer mode ON karo** (top right corner me toggle button)
3. **"Load unpacked"** button pe click karo
4. Is folder ko select karo (`Youtube-video-maker`)
5. Extension install ho jayega! ✓

## Usage (Kaise Use Karein)

### Step 1: Prompts File Banao
Ek `.txt` file banao jisme har line me ek prompt ho:

```
a cat wearing sunglasses
a futuristic city at sunset
abstract art with blue and gold
mountain landscape at sunrise
```

### Step 2: Whisk Open Karo
Browser me jao: https://labs.google/fx/tools/whisk/project

### Step 3: Extension Use Karo
1. **Extension icon** pe click karo (browser toolbar me)
2. **"Choose File"** pe click karke apni `.txt` file upload karo
3. **Settings adjust karo:**
   - Wait Time: 15 seconds (default) - agar slow internet hai to badha do
   - ✓ Auto-retry on failure - fail hone pe retry karega
   - ✓ Skip if image exists - duplicate skip karega

4. **"Start Automation"** pe click karo
5. Extension automatically:
   - Har prompt paste karega
   - Generate button click karega
   - Image save karega
   - Progress dikhayega (e.g., [50%] 5/10)

### Step 4: Controls
- **Pause** - Beech me rokna ho to
- **Resume** - Wapas continue karne ke liye
- **Stop** - Completely band karne ke liye

### Step 5: Download
Jab sab images generate ho jayein:
- **"Download ZIP"** pe click karo
- Sab images ek ZIP file me mil jayengi
- Har image ka naam uska prompt hoga

## Tips

💡 **Wait Time**: Agar images generate hone me zyada time lagta hai, wait time badha do (20-30 seconds)

💡 **Auto-retry**: Agar kabhi-kabhi fail hota hai, ye option ON rakho - 3 baar retry karega

💡 **Internet**: Stable internet connection chahiye

💡 **Tab Active**: Whisk wala tab active/visible rakho automation ke time

## Troubleshooting

❌ **"Input field not found"**: Page refresh karo aur phir se try karo

❌ **"Generated image not found"**: Wait time badha do (25-30 seconds)

❌ **Extension icon nahi dikh raha**: Extensions icon (puzzle piece) pe click karo, phir pin karo

## Example Output

Agar aapki file me ye prompts hain:
```
sunset beach
mountain view
city lights
```

To aapko milega:
- `sunset_beach.png`
- `mountain_view.png`
- `city_lights.png`

Sab ek `whisk_images.zip` file me!

# Quick Start Guide

Get started with Todd Image Dashboard in 5 minutes!

## Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Click "API keys" in the sidebar
4. Click "Create new secret key"
5. Copy your key (starts with `sk-proj-...`)

## Step 2: Install Dependencies

Open your terminal in this directory and run:

```bash
npm install
cd client && npm install && cd ..
```

## Step 3: Add Your API Key

1. Create a file named `.env` in the project root
2. Add this line (replace with your actual key):

```
OPENAI_API_KEY=sk-proj-your-key-here
```

Or simply copy the example file and edit it:

```bash
cp .env.example .env
# Then edit .env with your actual API key
```

## Step 4: Start the Application

```bash
npm start
```

## Step 5: Open Your Browser

Go to: **http://localhost:5173**

## You're Ready!

### Try Your First Generation

1. Leave DALL-E 3 selected (best quality for the price)
2. Type a prompt: "Simple friendly icon of a child brushing teeth, clean background"
3. Leave settings as default
4. Click "Generate"
5. Wait 10-30 seconds
6. Your image appears in the gallery!

### Try a Preset

1. Click "Load Preset"
2. Choose "Morning Routine Item" under "Visual Schedule"
3. Replace `[ITEM]` with "eating breakfast"
4. Click "Generate"

### Save Your Own Preset

1. Create a prompt you like
2. Click "Save Preset"
3. Give it a name like "Classroom Activities"
4. Choose a category
5. It's saved for next time!

## Cost Tracking

- Check the top panel for session costs
- Click "View All Stats" for detailed breakdown
- Export to CSV for records

## Need Help?

See the full [README.md](README.md) for:
- Detailed feature descriptions
- Troubleshooting guide
- Cost management tips
- Example prompts

## Tips for Special Needs Education

### Visual Schedules
- Use simple, clear icons
- White or plain backgrounds
- Consistent style across items
- Square format (1024×1024)

### Emotion Cards
- Simple cartoon faces
- Clear expressions
- No distracting backgrounds
- Save as preset for consistency

### Social Stories
- Keep character style consistent
- Clear, encouraging scenes
- Minimal backgrounds
- Use presets for each character

---

**Happy Creating!** 🎨

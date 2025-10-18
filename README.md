# Todd Image Dashboard

> AI-Powered Educational Image Generation for Special Needs Education

A comprehensive web application that helps educators create high-quality visual materials for students with special needs using OpenAI's image generation models (GPT Image 1, DALL-E 3, and DALL-E 2).

## 🌟 Overview

Todd Image Dashboard is designed specifically for teachers working with children with special needs. It provides an intuitive interface for generating educational visual aids, social stories, emotion cards, visual schedules, and more using cutting-edge AI technology.

### Why This Project?

Creating visual materials for special education can be time-consuming and expensive. This dashboard:
- **Saves Time** - Generate custom images in seconds instead of hours
- **Reduces Costs** - No need for expensive stock photo subscriptions
- **Increases Customization** - Create exactly what you need for your students
- **Improves Accessibility** - Beginner-friendly interface with comprehensive guidance
- **Tracks Spending** - Monitor your API usage and costs in real-time

## ✨ Key Features

### 🎯 Easy Installation (Windows)

**New!** Automated PowerShell installation script for Windows users:

- **One-Click Setup** - Right-click `install.ps1` and run
- **Automatic Node.js Installation** - Script checks and installs if needed
- **No Command Line Required** - All setup done automatically
- **Easy Launcher** - Double-click `start.ps1` to run the dashboard
- **Desktop Shortcut Support** - Create a shortcut for quick access
- **Beginner-Friendly** - Perfect for teachers with no technical background

### 🚀 Interactive Welcome Wizard

A comprehensive 6-step onboarding experience for first-time users:

1. **Welcome & Introduction** - Overview of dashboard capabilities
2. **API Key Setup** - Step-by-step guide to obtaining an OpenAI API key
3. **Interface Tour** - Detailed explanation of the control panel and gallery
4. **Preset System** - Learn how to use pre-configured templates
5. **Prompt Writing Tips** - Master the art of effective image prompts
6. **Getting Started** - Final checklist and suggested first steps

**Features:**
- Auto-launches for new users
- Can be reopened anytime via "Quick Start" button
- Skip-friendly with progress tracking
- Includes real examples and best practices

### 📦 32 Educational Presets

Pre-configured templates across **15 specialized categories**:

#### Visual Supports
- **Visual Schedule** - Morning routines, transitions
- **Emotion Cards** - Basic emotions, intensity scales
- **Social Stories** - Character scenes, social situations
- **Choice Boards** - Activity options, First-Then boards

#### Academic Content
- **Science** - Labeled diagrams, experiments
- **Math** - Number visuals, shapes, operations
- **Reading & Literacy** - Letter cards, sight words, vocabulary

#### Behavioral & Social-Emotional
- **Rewards & Motivation** - Stars, badges, certificates
- **Calming & Coping** - Breathing exercises, feelings thermometers
- **Safety & Rules** - Classroom rules, safety visuals

#### Daily Living
- **Life Skills** - Step-by-step guides (handwashing, dressing)
- **Calendar & Weather** - Days of week, seasons, weather icons
- **Sensory Activities** - Activity visuals

#### Characters & People
- **Inclusive Characters** - Diverse representations
- **Community Helpers** - Teachers, doctors, firefighters

Each preset includes:
- Optimized prompt templates with [PLACEHOLDERS]
- Appropriate model selection
- Size and quality recommendations
- Usage notes and examples

### 💡 Interactive Tips Panel

An intelligent tips system with **26 helpful tips** covering:

- **Prompt Writing (5 tips)** - How to write effective descriptions
- **Model Selection (5 tips)** - When to use each AI model
- **Best Practices (6 tips)** - Workflow optimization
- **Accessibility (3 tips)** - Creating inclusive content
- **Cost Management (3 tips)** - Budget-friendly strategies
- **Educational Strategies (4 tips)** - Classroom-specific guidance

**Features:**
- Auto-rotates every 15 seconds
- Collapsible to save space
- Filter by category (Prompts, Models, Best Practices, All)
- Includes practical examples
- Saves user preferences

### 🤖 Detailed Model Information

Comprehensive guides for each AI model:

#### GPT Image 1 (🚀)
- **Best For:** Diagrams, labeled content, editing
- **Pricing:** $0.04-$0.12 per image
- **Features:** Advanced editing, text rendering, background control
- **Use Cases:** Science diagrams, educational posters, labeled materials

#### DALL-E 3 (🎨)
- **Best For:** Creative illustrations, characters, artistic content
- **Pricing:** $0.04-$0.08 per image
- **Features:** Natural/Vivid styles, excellent prompt understanding
- **Use Cases:** Emotion cards, social stories, character designs

#### DALL-E 2 (💰)
- **Best For:** Budget projects, testing prompts, simple images
- **Pricing:** $0.016-$0.02 per image (4-5x cheaper)
- **Features:** Multiple images at once, variations support
- **Use Cases:** Visual schedules, simple icons, bulk generation

### 🎨 Advanced Generation Controls

**For GPT Image 1:**
- Background transparency (Auto/Transparent/Opaque)
- Output format (PNG/JPEG)
- Compression quality control
- Input fidelity for editing

**For DALL-E 3:**
- Style selection (Natural/Vivid)
- Quality levels (Standard/HD)
- Size options

**For DALL-E 2:**
- Multiple images per generation (1-10)
- Various size options
- Budget-friendly pricing

### 🖼️ Image Management

- **Gallery View** - See all generated images in a responsive grid
- **Download Images** - Save images individually
- **View Metadata** - See generation details (prompt, model, cost)
- **Local Storage** - All images saved with JSON metadata
- **Organized by Date** - Easy to find recent generations

### 🔄 Image Editing Tools

- **Inpainting** - Edit specific parts of images with masks
- **Variations** - Generate multiple versions of an image (DALL-E 2)
- **Batch Processing** - Generate multiple images at once

### 📊 Cost Tracking

Real-time monitoring of your API usage:
- **Session Cost** - Track spending in current session
- **Image Count** - Number of images generated
- **Cost Estimation** - Preview cost before generating
- **Per-Image Breakdown** - See cost for each generation
- **Reset Stats** - Clear session data when needed

### ⚙️ Comprehensive Settings

User-friendly settings panel for:
- **API Key Management** - Secure storage in browser localStorage
- **Key Validation** - Format checking (must start with 'sk-')
- **Show/Hide API Key** - Toggle visibility for security
- **Usage Statistics** - View session cost and image count
- **Reset Session Stats** - Start fresh tracking

### 🎯 Preset Management

Advanced preset system with:
- **Save Custom Presets** - Store your favorite settings
- **Edit Presets** - Update names, categories, and notes
- **Delete Presets** - Remove unused templates
- **Duplicate Presets** - Copy and modify existing presets
- **Export/Import** - Share presets with colleagues (JSON format)
- **Search & Filter** - Find presets quickly by name or content
- **Sort Options** - By name, recent, popular, newest
- **Custom Categories** - Organize presets your way
- **Usage Tracking** - See most-used presets
- **Recent Presets** - Quick access to recently used

### ⌨️ Keyboard Shortcuts

Efficient workflow with keyboard commands:
- `Ctrl/Cmd + F` - Focus search in preset manager
- `Ctrl/Cmd + E` - Export presets
- `Ctrl/Cmd + I` - Import presets
- `Ctrl/Cmd + ?` - Show keyboard shortcuts help
- `Escape` - Close modals and panels

## 🛠️ Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API requests
- **Modern CSS** - Custom properties, Grid, Flexbox

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Multer** - File upload handling for image editing
- **FormData** - Multipart form data processing
- **Axios Retry** - Automatic retry logic for API resilience

### APIs
- **OpenAI API** - Image generation and editing
  - GPT Image 1
  - DALL-E 3
  - DALL-E 2

### Data Storage
- **LocalStorage** - API key, presets, user preferences
- **File System** - Generated images and metadata (JSON)
- **JSON Files** - Preset configurations and settings

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## 🚀 Quick Start

### Windows Users - Automated Installation (Recommended!)

We've created an automated PowerShell script that does everything for you:

1. **Right-click** `install.ps1` and select **"Run with PowerShell"**
2. **Follow the prompts** - the script will:
   - Check for Node.js (install if missing)
   - Create all required directories
   - Install all dependencies
   - Create a `start.ps1` launcher
3. **Double-click** `start.ps1` to launch the dashboard anytime!

**That's it!** No command line experience needed.

### Mac/Linux Users - Manual Installation

#### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

#### 2. Create Required Directories

```bash
mkdir Images uploads
```

#### 3. Start the Application

```bash
npm start
```

This starts both the server (port 3000) and client (port 5173) concurrently.

#### 4. Open in Browser

Navigate to `http://localhost:5173`

The Welcome Wizard will guide you through initial setup!

**For detailed installation instructions, see [INSTALL.md](INSTALL.md) or open [INSTALL.html](INSTALL.html) in your browser for a visual guide.**

## 📖 Usage Guide

### First Time Setup

1. **Launch the Application** - The Welcome Wizard will auto-launch
2. **Configure API Key** - Click Settings (⚙️) and enter your OpenAI API key
3. **Explore Presets** - Browse the 32 pre-made educational templates
4. **Generate Your First Image** - Try a preset or write a custom prompt
5. **Save Favorites** - Save successful prompts as custom presets

### Generating Images

1. **Select a Model**
   - Click "ℹ️ Model Info" to see detailed comparison
   - Choose based on your needs (quality vs. cost)

2. **Write a Prompt**
   - Be specific and descriptive
   - Or load a preset and customize it
   - Check the Tips Panel for guidance

3. **Configure Settings**
   - Set size, quality, and other options
   - Preview estimated cost

4. **Generate**
   - Click "Generate Image(s)"
   - Wait 10-30 seconds
   - Download from the gallery

### Using Presets

#### Loading a Preset

1. Click **"📦 Load Preset"** button
2. **Search or Filter** by category
3. **Sort** by name, recent, popular, or newest
4. **Click** a preset to load its settings
5. **Replace** [PLACEHOLDERS] with your content
6. **Generate** your custom image

#### Saving a Preset

1. Configure your desired settings
2. Click **"💾 Save as Preset"**
3. Enter a name and optional notes
4. Choose category (or create custom category)
5. Click **Save**

#### Managing Presets

- **Edit** - Update preset details
- **Duplicate** - Copy and modify
- **Delete** - Remove unused presets
- **Export** - Save presets to JSON file (Ctrl/Cmd + E)
- **Import** - Load presets from file (Ctrl/Cmd + I)

### Example Use Cases

#### Visual Schedule
Create a morning routine visual schedule:
- Load "Morning Routine Item" preset
- Generate icons for each activity (brushing teeth, breakfast, etc.)
- Download and print for lamination

#### Emotion Recognition
Build an emotion identification board:
- Use "Emotion Face - Basic" preset
- Generate cards for happy, sad, angry, surprised
- Create matching or identification activities

#### Social Stories
Develop a social story about sharing:
- Use "Social Situation Scene" preset
- Generate 4-6 sequential images
- Add text to create complete story

#### Science Education
Make a labeled plant diagram:
- Use "Science Diagram" preset (GPT Image 1)
- Include labels: roots, stem, leaves, flower
- Print as poster for classroom display

#### Math Concepts
Create counting cards:
- Use "Math Number Visual" preset
- Generate cards for numbers 1-20
- Use for counting and number recognition

## 💰 Pricing Reference

| Model | Standard Quality | HD Quality | Notes |
|-------|-----------------|------------|-------|
| GPT Image 1 | $0.04/image | $0.12/image | Best for diagrams & text |
| DALL-E 3 | $0.04/image | $0.08/image | Best for creative work |
| DALL-E 2 | $0.016-$0.02/image | N/A | Most affordable |

**Cost-Saving Tips:**
- Use DALL-E 2 for testing prompts (4-5x cheaper)
- Start with Standard quality before using HD
- Use 1024x1024 size for most purposes
- Generate multiple with DALL-E 2, then regenerate best with DALL-E 3
- Check the Tips Panel "Cost Management" category

*Prices subject to change by OpenAI. Check [OpenAI Pricing](https://openai.com/pricing) for current rates.*

## 🎓 Best Practices

### Prompt Writing Tips

1. **Be Specific** - "friendly golden retriever puppy" vs "dog"
2. **Include Audience** - "suitable for kindergarten students"
3. **Specify Style** - "simple cartoon illustration" or "photorealistic"
4. **Add Context** - "for visual schedule card" or "classroom poster"
5. **Use Placeholders** - [EMOTION], [ACTIVITY] for reusable presets

### For Special Education

1. **Keep it Simple** - Reduce visual clutter, white backgrounds
2. **Be Consistent** - Use same style across related materials
3. **High Contrast** - Clear subjects, easy to identify
4. **Label When Needed** - Use GPT Image 1 for labeled diagrams
5. **Test with Students** - Observe what resonates best

### Accessibility Considerations

- Request "diverse" or "inclusive" in prompts
- Use "simple and clear" for various learning needs
- Specify "minimal background" to reduce distractions
- Consider "high contrast" for visual impairments
- Use "large clear text" for labels

## 🔐 Security & Privacy

- **API Keys** - Stored locally in browser only, never transmitted to our servers
- **Images** - Saved locally on your machine, not uploaded anywhere
- **No Tracking** - No analytics, no data collection, no third-party services
- **OpenAI Terms** - All API usage subject to OpenAI's terms of service
- **Local First** - Everything runs on your computer

## 🐛 Troubleshooting

### Common Issues

**"No API key configured"**
- Go to Settings (⚙️) and enter your OpenAI API key
- Key must start with 'sk-'
- Follow the Welcome Wizard API Key Setup step

**Images not generating**
- Verify API key is valid
- Check you have OpenAI credits available
- Review browser console (F12) for errors
- Ensure server is running on port 3000

**High costs**
- Review Model Info panel for pricing
- Use DALL-E 2 for testing ($0.016-$0.02)
- Start with Standard quality ($0.04 vs $0.08-$0.12)
- Check Tips Panel → Cost Management

**Port conflicts**
- Change PORT in .env file
- Or stop other applications using ports 3000/5173

See [INSTALL.md](INSTALL.md) for detailed troubleshooting.

## 📁 Project Structure

```
todd-image-dashboard/
├── server/                 # Backend Express server
│   ├── routes/
│   │   ├── generate.js    # Image generation endpoint
│   │   ├── edit.js        # Image editing endpoints
│   │   └── presets.js     # Preset management
│   ├── utils/
│   │   ├── costCalculator.js
│   │   ├── usageTracker.js
│   │   └── presetManager.js
│   └── server.js          # Main server file
├── client/                # Vue 3 frontend
│   └── src/
│       ├── components/    # Vue components
│       │   ├── GeneratePanel.vue
│       │   ├── ImageGallery.vue
│       │   ├── PresetManager.vue
│       │   ├── TipsPanel.vue
│       │   ├── WelcomeWizard.vue
│       │   └── SettingsModal.vue
│       ├── composables/   # Reusable composition functions
│       └── App.vue        # Main application
├── Images/                # Generated images storage
├── data/                  # Presets and configuration
│   └── presets.json      # 32 educational presets
├── uploads/               # Temporary file uploads
├── install.ps1           # 🆕 Windows automated installer
├── start.ps1             # 🆕 Easy launcher (created by install.ps1)
├── .env                   # Environment variables (optional)
├── INSTALL.md            # Detailed installation guide
├── INSTALL.html          # Visual installation guide
├── README.md             # This file
└── package.json          # Project dependencies
```

## 🤝 Contributing

This project was created to help educators. Contributions are welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions

- Add more educational presets
- Improve prompt templates for specific subjects
- Add multi-language support
- Create video tutorials
- Enhance accessibility features
- Add new preset categories
- Improve documentation
- Add unit tests

## 📊 Project Stats

- **Automated Installation** - PowerShell script for Windows (no technical skills needed)
- **32 Educational Presets** across 15 categories
- **26 Helpful Tips** with examples
- **3 AI Models** supported (GPT Image 1, DALL-E 3, DALL-E 2)
- **15+ Features** including wizard, tips, model info, editing
- **6-Step Welcome Wizard** for onboarding
- **3 Installation Guides** - INSTALL.md, INSTALL.html, and automated script
- **100% Open Source** for educational use
- **Privacy-First** - all data stays local
- **Teacher-Friendly** - designed for non-technical users

## 🗺️ Roadmap

Potential future features:
- [ ] Multi-language support (Spanish, French, etc.)
- [ ] Batch image processing workflows
- [ ] Collaborative preset sharing platform
- [ ] Mobile-responsive improvements
- [ ] Print layout templates
- [ ] Integration with classroom management tools
- [ ] Image history search and filtering
- [ ] Custom style training
- [ ] Offline mode for viewing generated images

## 🙏 Acknowledgments

- **OpenAI** - For providing the image generation APIs
- **Special Education Community** - For inspiration and feedback
- **Teachers** - Who work tirelessly to support students with special needs
- **Vue.js Team** - For the excellent framework
- **Open Source Community** - For tools and libraries used

## 📞 Support

For issues, questions, or suggestions:
- Review the **Welcome Wizard** (click Quick Start button)
- Check the **Tips Panel** in the application
- Read the [INSTALL.md](INSTALL.md) troubleshooting section
- Open an issue on GitHub

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Vue 3 Documentation](https://vuejs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

## 📝 License

This project is provided as-is for educational purposes. OpenAI API usage is subject to OpenAI's terms of service and pricing.

---

**Built with ❤️ for educators supporting students with special needs**

*Making visual communication accessible, one image at a time.* 🎨

**Version 1.0** | [Report Bug](https://github.com) | [Request Feature](https://github.com)

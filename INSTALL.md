# Installation Guide

This guide will help you set up the Todd Image Dashboard on your local machine. Instructions are provided for **Windows**, **macOS**, and **Linux**.

## 🚀 Quick Install (Windows Only - Recommended)

**For Windows users, we have an automated installation script that does everything for you!**

### Automated Installation with PowerShell

1. **Download or extract** the project to your desired location
2. **Navigate to the project folder** in File Explorer
3. **Right-click on `install.ps1`** and select **"Run with PowerShell"**
4. **Follow the prompts** - the script will:
   - Check for Node.js (install if missing)
   - Create all required directories
   - Install all dependencies
   - Create a `start.ps1` launcher

5. **To start the dashboard**, simply double-click `start.ps1`

That's it! The script handles everything automatically.

### Creating a Desktop Shortcut (Optional)

For even easier access:
1. Right-click `start.ps1`
2. Select **"Create shortcut"**
3. Drag the shortcut to your Desktop
4. Double-click the shortcut anytime to launch the dashboard

---

## Manual Installation

If you prefer to install manually or are using macOS/Linux, follow the steps below.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

**Note:** If you used the automated PowerShell installation above, you can skip all manual steps below.

## Step 1: Clone or Download the Project

### Windows

If you have the project as a ZIP file:
```cmd
:: Extract the ZIP file using File Explorer (right-click > Extract All)
:: Open Command Prompt or PowerShell and navigate to the directory
cd C:\Users\YourUsername\Desktop\todd\image
```

If you're cloning from a repository:
```cmd
git clone <repository-url>
cd todd\image
```

### macOS / Linux

If you have the project as a ZIP file:
```bash
# Extract the ZIP file and navigate to the directory
cd todd/image
```

If you're cloning from a repository:
```bash
git clone <repository-url>
cd todd/image
```

## Step 2: Install Dependencies

The project uses npm for both the server and client. Install all dependencies:

### Windows (Command Prompt or PowerShell)

```cmd
:: Install root dependencies (including concurrently for running both server and client)
npm install

:: Install server dependencies
cd server
npm install
cd ..

:: Install client dependencies
cd client
npm install
cd ..
```

### macOS / Linux

```bash
# Install root dependencies (including concurrently for running both server and client)
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory (optional - you can also configure the API key through the dashboard):

### Windows

```cmd
:: Create .env file using Command Prompt
echo. > .env

:: Or create it using PowerShell
New-Item .env -ItemType File

:: Or create it manually using Notepad
notepad .env
```

### macOS / Linux

```bash
# Create .env file
touch .env
```

Add your OpenAI API key to the `.env` file:

```env
OPENAI_API_KEY=sk-your-api-key-here
PORT=3000
```

**Note:** You can skip this step and configure your API key through the Settings modal in the dashboard instead.

## Step 4: Create Required Directories

The application needs an `Images` directory to store generated images:

### Windows

```cmd
:: Create Images directory in the root
mkdir Images

:: Create data directory for presets (if it doesn't exist)
mkdir data

:: Create uploads directory for temporary file uploads
mkdir uploads
```

### macOS / Linux

```bash
# Create Images directory in the root
mkdir Images

# Create data directory for presets (if it doesn't exist)
mkdir -p data

# Create uploads directory for temporary file uploads
mkdir -p uploads
```

## Step 5: Start the Application

From the root directory, run:

### Windows / macOS / Linux

```bash
npm start
```

This command will start both the server and client concurrently:
- **Server** will run on `http://localhost:3000`
- **Client** will run on `http://localhost:5173`

You should see output similar to:

```
✓ Todd Image Dashboard Server Started
✓ Server running on http://localhost:3000
✓ API Key configured: Yes/No

Ready to generate images! 🎨

VITE v5.4.20 ready in 118 ms
➜  Local:   http://localhost:5173/
```

## Step 6: Open the Dashboard

Open your web browser and navigate to:

```
http://localhost:5173
```

## Step 7: Configure Your API Key (First Time)

On first launch, the Welcome Wizard will guide you through:

1. **Welcome & Features** - Overview of the dashboard
2. **API Key Setup** - Instructions to get and configure your OpenAI API key
3. **Interface Tour** - Learn about the control panel and gallery
4. **Using Presets** - Understand preset templates
5. **Prompt Writing** - Tips for effective prompts
6. **Ready to Start** - Final checklist

If you skipped the wizard or want to add your API key later:

1. Click the **⚙️ Settings** button in the header
2. Enter your OpenAI API key (starts with `sk-`)
3. Click **Save Settings**

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

**Windows:**
```cmd
:: Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5173

:: Kill the process (replace PID with the process ID from above)
taskkill /PID <PID> /F

:: Or change the port in server/server.js or set PORT in .env file
```

**macOS / Linux:**
```bash
# Find what's using the port
lsof -i :3000
lsof -i :5173

# Kill the process (replace PID with the process ID from above)
kill -9 <PID>

# Or change the port in server/server.js or set PORT in .env file
```

### Missing Dependencies

If you encounter module errors:

**Windows:**
```cmd
:: Clean install all dependencies
rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

**macOS / Linux:**
```bash
# Clean install all dependencies
rm -rf node_modules server/node_modules client/node_modules
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### API Key Not Working

1. Verify your API key is correct (should start with `sk-`)
2. Check that your OpenAI account has credits
3. Make sure the API key has appropriate permissions
4. Try entering it again in Settings

### Images Not Saving

**Windows:**
Ensure the `Images` directory exists:
```cmd
:: Create directory if it doesn't exist
if not exist Images mkdir Images
```

**macOS / Linux:**
Ensure the `Images` directory exists and has write permissions:
```bash
mkdir -p Images
chmod 755 Images
```

### Build Errors

If Vite fails to build the client:

**Windows / macOS / Linux:**
```bash
cd client
npm run build
cd ..
```

### Windows-Specific Issues

**PowerShell Execution Policy Error:**
If you see an error about running scripts, run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Path Issues:**
If you get "command not found" errors for npm or node:
1. Verify Node.js is installed: `node --version`
2. Verify npm is installed: `npm --version`
3. Restart your Command Prompt/PowerShell after installing Node.js
4. Add Node.js to your PATH environment variable if needed

**Firewall Warning:**
Windows Firewall may prompt you to allow Node.js network access. Click "Allow access" to permit the server to run.

## Running in Production

For production deployment:

### Windows

```cmd
:: Build the client
cd client
npm run build
cd ..

:: Serve the built files
set NODE_ENV=production
node server\server.js

:: Or use a process manager like PM2
npm install -g pm2
pm2 start server\server.js --name todd-image-dashboard
```

### macOS / Linux

```bash
# Build the client
cd client
npm run build
cd ..

# Serve the built files
NODE_ENV=production node server/server.js

# Or use a process manager like PM2
npm install -g pm2
pm2 start server/server.js --name todd-image-dashboard
```

## Updating the Application

To update to a new version:

### Windows

```cmd
:: Pull latest changes (if using git)
git pull

:: Install any new dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

:: Restart the application
npm start
```

### macOS / Linux

```bash
# Pull latest changes (if using git)
git pull

# Install any new dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Restart the application
npm start
```

## Alternative: Running Server and Client Separately

If you prefer to run them separately:

### Windows

**Command Prompt/PowerShell 1 (Server):**
```cmd
npm run server
```

**Command Prompt/PowerShell 2 (Client):**
```cmd
npm run client
```

### macOS / Linux

**Terminal 1 (Server):**
```bash
npm run server
```

**Terminal 2 (Client):**
```bash
npm run client
```

## System Requirements

- **OS:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+, Debian 10+, etc.)
- **RAM:** 2GB minimum, 4GB recommended
- **Disk Space:** 500MB for application + space for generated images
- **Internet:** Required for API calls to OpenAI
- **Browser:** Modern web browser (Chrome, Firefox, Edge, Safari)

## Getting Help

If you encounter issues:

1. Check the Troubleshooting section above for your operating system
2. Review the server console output for error messages
3. Check the browser console (F12) for client-side errors
4. Ensure all prerequisites are installed correctly
5. Verify your OpenAI API key is valid and has credits
6. Try restarting your computer and running the installation steps again

## Next Steps

After installation:

1. Complete the Welcome Wizard
2. Configure your API key in Settings
3. Browse the pre-made educational presets
4. Try generating your first image
5. Explore the Tips Panel for guidance
6. Save your favorite settings as custom presets

Happy creating! 🎨

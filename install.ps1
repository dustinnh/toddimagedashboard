# Todd Image Dashboard - Windows Installation Script
# This script will set up everything you need to run the dashboard

# Set colors for output
$host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Header {
    Clear-Host
    Write-ColorOutput "Cyan" "=========================================="
    Write-ColorOutput "Cyan" "  Todd Image Dashboard - Installation"
    Write-ColorOutput "Cyan" "  AI-Powered Educational Image Generation"
    Write-ColorOutput "Cyan" "=========================================="
    Write-Output ""
}

function Test-Administrator {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Display header
Write-Header

# Check current directory
$currentDir = Get-Location
Write-ColorOutput "Yellow" "Current directory: $currentDir"
Write-Output ""
Write-ColorOutput "White" "This script will:"
Write-Output "  1. Check for Node.js (install if missing)"
Write-Output "  2. Create required folders (Images, data, uploads)"
Write-Output "  3. Install all dependencies"
Write-Output "  4. Create a start.ps1 script for easy launching"
Write-Output ""

# Confirmation prompt
$confirmation = Read-Host "Are you in the correct project folder? (Y/N)"
if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-ColorOutput "Red" "Installation cancelled. Please navigate to the correct folder and run again."
    Write-Output ""
    Write-Output "To navigate to the correct folder:"
    Write-Output "  cd C:\Path\To\todd\image"
    Write-Output ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Output ""
Write-ColorOutput "Green" "✓ Starting installation..."
Write-Output ""

# Check for Node.js
Write-ColorOutput "Cyan" "[1/5] Checking for Node.js..."
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-ColorOutput "Green" "✓ Node.js is already installed: $nodeVersion"

        # Check if version is sufficient (v16+)
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($versionNumber -lt 16) {
            Write-ColorOutput "Yellow" "⚠ Warning: Node.js version is below v16. Recommend updating."
            Write-Output "  Download latest LTS from: https://nodejs.org/"
        }
    }
} catch {
    Write-ColorOutput "Yellow" "⚠ Node.js is not installed."
    Write-Output ""
    Write-Output "Attempting to install Node.js LTS..."

    # Check if running as administrator
    if (Test-Administrator) {
        # Try to install using winget (Windows 10+ with winget installed)
        try {
            Write-Output "Installing Node.js using Windows Package Manager..."
            winget install OpenJS.NodeJS.LTS --silent
            Write-ColorOutput "Green" "✓ Node.js installed successfully!"
            Write-Output ""
            Write-ColorOutput "Yellow" "⚠ IMPORTANT: Please close this PowerShell window and run the script again."
            Read-Host "Press Enter to exit"
            exit
        } catch {
            Write-ColorOutput "Red" "✗ Could not install Node.js automatically."
            Write-Output ""
            Write-ColorOutput "Yellow" "Please install Node.js manually:"
            Write-Output "  1. Visit: https://nodejs.org/"
            Write-Output "  2. Download the LTS version"
            Write-Output "  3. Run the installer"
            Write-Output "  4. Restart this script"
            Write-Output ""
            Read-Host "Press Enter to exit"
            exit
        }
    } else {
        Write-ColorOutput "Red" "✗ Node.js is not installed and script is not running as Administrator."
        Write-Output ""
        Write-ColorOutput "Yellow" "Please do ONE of the following:"
        Write-Output ""
        Write-Output "Option 1 (Manual Install - Recommended):"
        Write-Output "  1. Visit: https://nodejs.org/"
        Write-Output "  2. Download the LTS version"
        Write-Output "  3. Run the installer"
        Write-Output "  4. Restart this script"
        Write-Output ""
        Write-Output "Option 2 (Automatic Install):"
        Write-Output "  1. Right-click this script"
        Write-Output "  2. Select 'Run with PowerShell as Administrator'"
        Write-Output ""
        Read-Host "Press Enter to exit"
        exit
    }
}

Write-Output ""

# Check npm
Write-ColorOutput "Cyan" "[2/5] Checking for npm..."
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-ColorOutput "Green" "✓ npm is installed: v$npmVersion"
    }
} catch {
    Write-ColorOutput "Red" "✗ npm is not available. Please restart PowerShell and try again."
    Read-Host "Press Enter to exit"
    exit
}

Write-Output ""

# Create required directories
Write-ColorOutput "Cyan" "[3/5] Creating required directories..."

$directories = @("Images", "data", "uploads")
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-ColorOutput "Yellow" "  ⚠ $dir already exists (skipping)"
    } else {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-ColorOutput "Green" "  ✓ Created $dir folder"
    }
}

Write-Output ""

# Install dependencies
Write-ColorOutput "Cyan" "[4/5] Installing dependencies..."
Write-Output "This may take 3-5 minutes. Please wait..."
Write-Output ""

try {
    # Install root dependencies
    Write-Output "Installing root dependencies..."
    npm install --loglevel=error
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Green" "  ✓ Root dependencies installed"
    } else {
        throw "Root npm install failed"
    }

    # Install server dependencies
    Write-Output "Installing server dependencies..."
    Set-Location server
    npm install --loglevel=error
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Green" "  ✓ Server dependencies installed"
    } else {
        Set-Location ..
        throw "Server npm install failed"
    }
    Set-Location ..

    # Install client dependencies
    Write-Output "Installing client dependencies..."
    Set-Location client
    npm install --loglevel=error
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Green" "  ✓ Client dependencies installed"
    } else {
        Set-Location ..
        throw "Client npm install failed"
    }
    Set-Location ..

} catch {
    Write-ColorOutput "Red" "✗ Error installing dependencies: $_"
    Write-Output ""
    Write-Output "Please try running these commands manually:"
    Write-Output "  npm install"
    Write-Output "  cd server && npm install && cd .."
    Write-Output "  cd client && npm install && cd .."
    Write-Output ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Output ""

# Create start.ps1 script
Write-ColorOutput "Cyan" "[5/5] Creating start.ps1 launcher..."

$startScript = @'
# Todd Image Dashboard - Start Script
# Double-click this file to start the application

$host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

Clear-Host
Write-ColorOutput "Cyan" "=========================================="
Write-ColorOutput "Cyan" "  Todd Image Dashboard"
Write-ColorOutput "Cyan" "  Starting Application..."
Write-ColorOutput "Cyan" "=========================================="
Write-Output ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-ColorOutput "Red" "✗ Error: Cannot find package.json"
    Write-Output "Please make sure you're running this from the project directory."
    Write-Output ""
    Read-Host "Press Enter to exit"
    exit
}

# Start the application
Write-ColorOutput "Green" "✓ Starting server and client..."
Write-Output ""
Write-ColorOutput "Yellow" "The dashboard will open automatically in your browser."
Write-ColorOutput "Yellow" "Server: http://localhost:3000"
Write-ColorOutput "Yellow" "Client: http://localhost:5173"
Write-Output ""
Write-ColorOutput "Cyan" "⚠ IMPORTANT: Keep this window open while using the dashboard!"
Write-ColorOutput "Cyan" "To stop the application, press Ctrl+C in this window."
Write-Output ""
Write-Output "----------------------------------------"
Write-Output ""

# Start npm
npm start

# If npm exits, pause before closing
Write-Output ""
Write-ColorOutput "Yellow" "Application stopped."
Read-Host "Press Enter to exit"
'@

Set-Content -Path "start.ps1" -Value $startScript -Force
Write-ColorOutput "Green" "  ✓ Created start.ps1"

Write-Output ""
Write-Output ""

# Installation complete
Write-ColorOutput "Green" "=========================================="
Write-ColorOutput "Green" "  Installation Complete! 🎉"
Write-ColorOutput "Green" "=========================================="
Write-Output ""
Write-Output "Next steps:"
Write-Output ""
Write-ColorOutput "Cyan" "1. To start the dashboard:"
Write-Output "   • Double-click 'start.ps1' file"
Write-Output "   • Or run: .\start.ps1"
Write-Output "   • Or run: npm start"
Write-Output ""
Write-ColorOutput "Cyan" "2. The dashboard will open at:"
Write-Output "   http://localhost:5173"
Write-Output ""
Write-ColorOutput "Cyan" "3. On first launch:"
Write-Output "   • Follow the Welcome Wizard"
Write-Output "   • Add your OpenAI API key in Settings"
Write-Output "   • Start generating images!"
Write-Output ""
Write-ColorOutput "Yellow" "💡 Tip: Create a desktop shortcut to start.ps1 for quick access!"
Write-Output ""
Write-ColorOutput "Yellow" "📖 For help, open INSTALL.html in your browser"
Write-Output ""

# Ask if user wants to start now
$startNow = Read-Host "Would you like to start the dashboard now? (Y/N)"
if ($startNow -eq 'Y' -or $startNow -eq 'y') {
    Write-Output ""
    Write-ColorOutput "Green" "Starting dashboard..."
    Start-Sleep -Seconds 2
    .\start.ps1
} else {
    Write-Output ""
    Write-ColorOutput "Cyan" "You can start the dashboard anytime by double-clicking start.ps1"
    Write-Output ""
    Read-Host "Press Enter to exit"
}
'@

Set-Content -Path "start.ps1" -Value $startScript -Force
Write-ColorOutput "Green" "  ✓ Created start.ps1"

Write-Output ""
Write-Output ""

# Installation complete
Write-ColorOutput "Green" "=========================================="
Write-ColorOutput "Green" "  Installation Complete! 🎉"
Write-ColorOutput "Green" "=========================================="
Write-Output ""
Write-Output "Next steps:"
Write-Output ""
Write-ColorOutput "Cyan" "1. To start the dashboard:"
Write-Output "   • Double-click 'start.ps1' file"
Write-Output "   • Or right-click start.ps1 → Run with PowerShell"
Write-Output "   • Or run: .\start.ps1"
Write-Output ""
Write-ColorOutput "Cyan" "2. The dashboard will open at:"
Write-Output "   http://localhost:5173"
Write-Output ""
Write-ColorOutput "Cyan" "3. On first launch:"
Write-Output "   • Follow the Welcome Wizard"
Write-Output "   • Add your OpenAI API key in Settings"
Write-Output "   • Start generating images!"
Write-Output ""
Write-ColorOutput "Yellow" "💡 Tip: Create a desktop shortcut to start.ps1 for quick access!"
Write-Output ""
Write-ColorOutput "Yellow" "📖 For help, open INSTALL.html in your browser"
Write-Output ""

# Ask if user wants to start now
$startNow = Read-Host "Would you like to start the dashboard now? (Y/N)"
if ($startNow -eq 'Y' -or $startNow -eq 'y') {
    Write-Output ""
    Write-ColorOutput "Green" "Starting dashboard..."
    Start-Sleep -Seconds 2
    .\start.ps1
} else {
    Write-Output ""
    Write-ColorOutput "Cyan" "You can start the dashboard anytime by double-clicking start.ps1"
    Write-Output ""
    Read-Host "Press Enter to exit"
}

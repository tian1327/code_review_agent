#!/bin/bash

echo "🚀 Setting up Code Review Agent Frontend"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "📦 Installing Node.js..."
    
    # Check if Homebrew is available
    if command -v brew &> /dev/null; then
        echo "🍺 Using Homebrew to install Node.js..."
        brew install node
    else
        echo "⚠️  Homebrew not found. Please install Node.js manually:"
        echo "   Visit: https://nodejs.org/"
        echo "   Or install Homebrew first: https://brew.sh/"
        exit 1
    fi
else
    echo "✅ Node.js is already installed: $(node --version)"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available."
    exit 1
else
    echo "✅ npm is available: $(npm --version)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete! You can now start the development server:"
    echo "   npm start"
    echo ""
    echo "📱 The app will be available at: http://localhost:3000"
else
    echo "❌ Failed to install dependencies."
    exit 1
fi 
#!/bin/bash
# install-and-start.sh - Quick installation and startup script for Linux/Mac

echo "🚀 Sizzling Hot Products Frontend Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed successfully"
echo ""

# Run type check
echo "🔍 Checking TypeScript types..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript check failed. Please fix errors before running."
    exit 1
fi

echo "✓ TypeScript check passed"
echo ""

# Start development server
echo "🎯 Starting development server..."
echo "📍 Open your browser to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

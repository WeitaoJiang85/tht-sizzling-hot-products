@echo off
REM install-and-start.bat - Quick installation and startup script for Windows

echo.
echo 🚀 Sizzling Hot Products Frontend Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✓ Node.js version:
node --version

echo ✓ npm version:
npm --version

echo.
echo 📦 Installing dependencies...
echo (This may take 2-3 minutes)
echo.

call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully
echo.

echo 🔍 Checking TypeScript types...
call npm run type-check

if %errorlevel% neq 0 (
    echo ⚠️  TypeScript check failed. Please fix errors before running.
    pause
    exit /b 1
)

echo ✓ TypeScript check passed
echo.

echo 🎯 Starting development server...
echo 📍 Open your browser to: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause

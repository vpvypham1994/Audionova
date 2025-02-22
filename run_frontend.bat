@echo off
REM auto_setup.bat
REM This script sets up and launches both the Vite+React frontend and FastAPI backend on Windows.
SET "FRONTEND_DIR=%~dp0frontend"

REM Check for required commands (npm and python)
where npm >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install Node.js and npm.
    pause
    exit /B 1
)

REM ----------------------------------------
REM Setup and launch Vite+React frontend
REM ----------------------------------------
cd frontend

REM Installing Node.js dependencies...
call npm install

REM Launch the frontend in a new command window.
npm run dev

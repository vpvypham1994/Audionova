@echo off
REM auto_setup.bat
REM This script sets up and launches both the Vite+React frontend and FastAPI backend on Windows.

REM Check for required commands (npm and python)
where npm >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install Node.js and npm.
    pause
    exit /B 1
)

where python >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo python is not installed. Please install Python.
    pause
    exit /B 1
)

REM Set directory variables (adjust these if necessary)
SET "FRONTEND_DIR=%~dp0frontend"
SET "BACKEND_DIR=%~dp0backend"

REM ----------------------------------------
REM Setup and launch FastAPI backend
REM ----------------------------------------
echo Setting up FastAPI backend...
cd /d "%BACKEND_DIR%"

REM Create a virtual environment if it doesn't exist.
IF NOT EXIST "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate the virtual environment.
call venv\Scripts\activate.bat

REM Install Qualcomm AI Hub 
pip install "qai-hub-models[whisper-small-en]"
pip install qai-hub
pip install -U openai-whisper

REM Install backend dependencies if requirements.txt exists.
IF EXIST "requirements.txt" (
    echo Installing Python dependencies...
    pip install -r requirements.txt
) ELSE (
    echo requirements.txt not found in backend directory. Skipping dependency installation.
)

REM Launch the backend in a new command window.
REM Assumes your FastAPI app instance is in main.py and is named 'app'.
start "FastAPI Backend" cmd /k "cd /d \"%BACKEND_DIR%\" && uvicorn main:app --reload"

REM Return to the project root.
cd /d "%~dp0"

REM ----------------------------------------
REM Setup and launch Vite+React frontend
REM ----------------------------------------
echo Setting up Vite+React frontend...
cd /d "%FRONTEND_DIR%"

echo Installing Node.js dependencies...
npm install

REM Launch the frontend in a new command window.
start "Vite+React Frontend" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm run dev"

REM Return to the project root.
cd /d "%~dp0"

echo Both backend and frontend are running.
echo Press any key to exit this script.
pause

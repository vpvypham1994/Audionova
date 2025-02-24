@echo off
REM auto_setup.bat
REM This script sets up and launches both the Vite+React frontend and FastAPI backend on Windows.

where python >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo python is not installed. Please install Python.
    pause
    exit /B 1
)

REM Set directory variables (adjust these if necessary)
SET "BACKEND_DIR=%~dp0vall"

REM ----------------------------------------
REM Setup and launch FastAPI backend
REM ----------------------------------------

winget install ffmpeg

REM Create a virtual environment if it doesn't exist.
IF NOT EXIST "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate the virtual environment.
call venv\Scripts\activate.bat

echo Setting up FastAPI backend...
cd /d "%BACKEND_DIR%"
REM Install Qualcomm AI Hub whisper
pip install "qai-hub-models[whisper-small-en]"
pip install "uvicorn[standard]"


REM Install backend dependencies if requirements.txt exists.
IF EXIST "requirements.txt" (
    echo Installing Python dependencies...
    pip install -r requirements.txt
) ELSE (
    echo requirements.txt not found in backend directory. Skipping dependency installation.
)
cd /d "%~dp0"
python -m uvicorn app:app --reload


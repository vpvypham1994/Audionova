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

REM Create the checkpoints folder in C:\ if it does not already exist
IF NOT EXIST "C:\checkpoints" (
    mkdir "C:\checkpoints"
    echo "Created C:\checkpoints folder."
) ELSE (
    echo "C:\checkpoints folder already exists."
)

REM  Download the file from GitHub.
REM    Replace the URL with the direct link to the checkpoint file you want.
REM    The current link points to the readme-ov-file tab (likely HTML content).
REM    Also update the output filename if needed.

echo "Downloading checkpoint file from GitHub..."
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/Plachtaa/VALL-E-X?tab=readme-ov-file' -OutFile 'C:\checkpoints\valle_x_checkpoint.bin'"

REM Check if the file was downloaded successfully
IF EXIST "C:\checkpoints\valle_x_checkpoint.bin" (
    echo "Download successful. File saved to C:\checkpoints\valle_x_checkpoint.bin"
) ELSE (
    echo "Download failed or URL invalid. Please check the direct download link."
)

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


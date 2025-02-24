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

REM ----------------------------------------------
REM Create a folder named "checkpoints" in the same 
REM directory as this .bat file (i.e., repo root)
REM ----------------------------------------------

IF NOT EXIST "%~dp0checkpoints" (
    mkdir "%~dp0checkpoints"
    echo "Created '%~dp0checkpoints' folder."
) ELSE (
    echo "Folder '%~dp0checkpoints' already exists."
)

REM ----------------------------------------------
REM Download the file from GitHub into checkpoints
REM Update the URL to the actual raw file link
REM ----------------------------------------------
echo "Downloading checkpoint file from GitHub..."
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/Plachtaa/VALL-E-X?tab=readme-ov-file' -OutFile '%~dp0checkpoints\valle_x_checkpoint.bin'"

REM ----------------------------------------------
REM Check if the file was downloaded successfully
REM ----------------------------------------------
IF EXIST "%~dp0checkpoints\valle_x_checkpoint.bin" (
    echo "Download successful. File saved to '%~dp0checkpoints\valle_x_checkpoint.bin'."
) ELSE (
    echo "Download failed or URL invalid. Please ensure you have a direct download link."
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


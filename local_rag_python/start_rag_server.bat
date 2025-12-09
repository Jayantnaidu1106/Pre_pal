@echo off
echo [INFO] Starting Local RAG API using venv Python...
if exist "venv2\Scripts\python.exe" (
    "venv2\Scripts\python.exe" api.py
) else (
    echo [ERROR] Virtual environment not found in venv2\Scripts\python.exe
    pause
    exit /b 1
)
pause

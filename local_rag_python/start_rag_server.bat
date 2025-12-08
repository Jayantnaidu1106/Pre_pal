@echo off
echo [INFO] Starting Local RAG API using venv Python...
if exist "venv\Scripts\python.exe" (
    "venv\Scripts\python.exe" api.py
) else (
    echo [ERROR] Virtual environment not found in venv\Scripts\python.exe
    pause
    exit /b 1
)
pause

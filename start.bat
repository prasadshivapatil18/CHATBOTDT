@echo off
echo ============================================================
echo   STARTING SIDEKICK AI RETAIL PLATFORM
echo ============================================================

echo [1/2] Starting Python FastAPI Backend on port 8000...
start "Sidekick AI - Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React + Vite Frontend on port 5173...
start "Sidekick AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ============================================================
echo   SIDEKICK AI IS RUNNING!
echo   Frontend: http://127.0.0.1:5173/
echo   Backend API Docs: http://127.0.0.1:8000/docs
echo ============================================================
echo.
pause

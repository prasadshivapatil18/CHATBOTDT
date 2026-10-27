@echo off
echo ============================================================
echo   STOPPING SIDEKICK AI RETAIL PLATFORM
echo ============================================================

echo Stopping processes on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping processes on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ============================================================
echo   ALL SIDEKICK AI SERVERS STOPPED!
echo ============================================================
pause

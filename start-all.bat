@echo off
echo ========================================================
echo   Starting MediMinder - Full-Stack Medicine Reminder System
echo ========================================================
set "PATH=C:\Users\palle\nodejs\node-v20.18.0-win-x64;%PATH%"

echo [1/2] Starting Backend Server on port 5000...
start "MediMinder Backend" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend App on port 5173...
start "MediMinder Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   Both Servers are running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ========================================================
start http://localhost:5173

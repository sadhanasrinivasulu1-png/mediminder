@echo off
set "PATH=C:\Users\palle\nodejs\node-v20.18.0-win-x64;%PATH%"
echo Testing Health Check...
curl.exe -s http://localhost:5000/api/health
echo.
echo.
echo Testing Demo Login...
curl.exe -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"sarah@example.com\",\"password\":\"Password123!\"}"
echo.
pause

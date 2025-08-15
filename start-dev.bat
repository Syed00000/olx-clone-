@echo off
echo Starting OLX Clone development environment...

echo.
echo 1. Starting backend server in a new window...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo 2. Starting frontend development server...
cd frontend
npm run dev
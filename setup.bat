@echo off
echo ======================================
echo Resignation Management System Setup
echo ======================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js v14 or higher.
    pause
    exit /b 1
)

node --version
echo.

REM Setup backend
echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed successfully
cd ..

echo.

REM Setup frontend
echo Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully
cd ..

echo.
echo ======================================
echo Setup completed successfully!
echo ======================================
echo.
echo IMPORTANT: Before running the application:
echo.
echo 1. Get a Calendarific API key from https://calendarific.com/
echo 2. Update backend\.env file with your API key and email settings
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm start
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo Default login credentials:
echo   HR:       admin / admin
echo   Employee: john.doe / password123
echo.
pause

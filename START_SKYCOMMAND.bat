@echo off
REM SkyCommand - One-Click Startup Script
REM This batch file starts all required services for the drone control dashboard

title SkyCommand - Dashboard & Services
color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                     SKYCOMMAND STARTUP SCRIPT                      ║
echo ║              Drone Control Dashboard & Simulator                   ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

REM Set the project directory
cd /d "%~dp0"

echo [1/3] Starting MAVSDK Simulator on port 5000...
echo.
start "MAVSDK Simulator" cmd /k python mavsdk_simulator.py
timeout /t 3 /nobreak

echo.
echo [2/3] Starting Next.js Dev Server on port 9002...
echo.
start "SkyCommand Dashboard" cmd /k npm run dev
timeout /t 5 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                    ALL SERVICES STARTED                            ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  🚁 MAVSDK Simulator:  http://127.0.0.1:5000                      ║
echo ║  📊 Dashboard:          http://localhost:9002                      ║
echo ║                                                                    ║
echo ║  Status: Ready to use                                             ║
echo ║                                                                    ║
echo ║  Press any key to open dashboard in browser...                    ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

timeout /t 3 /nobreak

REM Open dashboard in default browser
echo Opening dashboard in browser...
start http://localhost:9002

echo.
echo ✓ All services running!
echo ✓ Dashboard opened in browser
echo.
echo To stop services:
echo   - Close the MAVSDK Simulator window
echo   - Close the SkyCommand Dashboard window
echo.
pause

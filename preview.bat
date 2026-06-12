@echo off
title Blog Preview Tool
cls

:MENU
cls
echo ===================================================
echo             Blog Local Preview and Dev Tool
echo ===================================================
echo.
echo Please select option:
echo   [1] Start Dev Server (with hot reload)
echo   [2] Build and Preview Production
echo   [3] Exit
echo.
set /p choice="Enter choice (1/2/3): "

if "%choice%"=="1" goto DEV
if "%choice%"=="2" goto PREVIEW
if "%choice%"=="3" goto END
goto INVALID

:DEV
cls
echo Starting local development server...
echo URL: http://localhost:4321
echo.
call npm run dev
pause
goto MENU

:PREVIEW
cls
echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed.
    pause
    goto MENU
)
echo.
echo Starting production preview...
echo URL: http://localhost:4321
echo.
call npm run preview
pause
goto MENU

:INVALID
echo.
echo Invalid choice. Press any key to return...
pause >nul
goto MENU

:END
echo Goodbye!
timeout /t 2 >nul
exit

@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm i
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)
echo.
echo Starting dev server...
call npm run dev
pause

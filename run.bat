@echo off
REM Re-launch in a persistent cmd window so the window stays open
if not "%~1"=="run" (
  start "Trading Dev" cmd /k "%~f0" run
  exit /b 0
)

pushd "%~dp0"

if not exist "node_modules" (
  call npm i
)

REM Launcher keeps dev server running (fixes exit in PowerShell / Cursor terminal and batch)
npm run dev

popd
if errorlevel 1 (
  echo.
  echo Server stopped with an error. Press any key to close...
) else (
  echo.
  echo Server stopped. Press any key to close this window...
)
pause >nul

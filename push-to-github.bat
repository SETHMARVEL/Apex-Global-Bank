@echo off
title Push Unity Capital Bank to GitHub
echo ========================================================
echo   Pushing Unity Capital Bank to GitHub...
echo ========================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
echo ========================================================
echo   Done! If you see any prompt above, follow its steps.
echo ========================================================
pause

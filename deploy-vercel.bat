@echo off
set PATH=C:\Users\smrit\AppData\Roaming\npm;C:\Users\smrit\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;%PATH%
cd /d "%~dp0"
echo ==============================================
echo    POKE-PORTFOLIO VERCEL DEPLOYMENT
echo ==============================================
echo.
vercel --prod
echo.
pause

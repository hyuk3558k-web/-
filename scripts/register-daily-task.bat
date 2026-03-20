@echo off
REM Register daily Telegram briefing task at 19:00
REM Run this file as Administrator to register the scheduled task

set PROJECT_DIR=%~dp0..
set NODE_PATH=node

schtasks /create /tn "SeossineDaily Briefing" /tr "cmd /c cd /d \"%PROJECT_DIR%\" && %NODE_PATH% scripts/daily-briefing.js >> scripts/briefing.log 2>&1" /sc daily /st 19:00 /f

if %errorlevel%==0 (
    echo [OK] Scheduled task registered: daily at 19:00
    echo Task name: SeossineDaily Briefing
    echo To delete: schtasks /delete /tn "SeossineDaily Briefing" /f
) else (
    echo [ERROR] Failed to register. Try running as Administrator.
)
pause

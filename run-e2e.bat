@echo off
cd /d C:\Users\Admin\Projects\active\mahi-spiritual\frontend
start /b python -m http.server 8000 > nul 2>&1
timeout /t 2 /nobreak > nul
cd /d C:\Users\Admin\Projects\active\mahi-spiritual
npx playwright test --reporter=list
taskkill /f /im python.exe > nul 2>&1

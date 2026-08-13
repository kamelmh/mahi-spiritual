# Recreate Desktop Shortcut for MAHI AstroDashboard
$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$Desktop\MAHI AstroDashboard.lnk")
$Shortcut.TargetPath = "C:\Users\Admin\AstroDashboard\launch.bat"
$Shortcut.WorkingDirectory = "C:\Users\Admin\AstroDashboard"
$Shortcut.Description = "MAHI Spiritual System - AstroDashboard"
$Shortcut.WindowStyle = 7
$Shortcut.IconLocation = "shell32.dll,13"
$Shortcut.Save()

Write-Host "Desktop shortcut created: MAHI AstroDashboard.lnk" -ForegroundColor Green
Write-Host "Location: $Desktop" -ForegroundColor Yellow
Write-Host "Double-click to launch the dashboard!" -ForegroundColor Cyan

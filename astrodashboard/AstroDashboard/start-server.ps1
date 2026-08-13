# Start AstroDashboard Server
Write-Host "Starting MAHI AstroDashboard on http://localhost:8080 ..." -ForegroundColor Cyan
$proc = Start-Process python -ArgumentList "-m","http.server","8080" -WorkingDirectory "C:\Users\Admin\AstroDashboard" -PassThru
Write-Host "Server started! PID: $($proc.Id)" -ForegroundColor Green
Write-Host "Open browser: http://localhost:8080" -ForegroundColor Yellow
Write-Host "Press Enter to stop the server..."
Read-Host
Stop-Process -Id $proc.Id -Force
Write-Host "Server stopped." -ForegroundColor Red

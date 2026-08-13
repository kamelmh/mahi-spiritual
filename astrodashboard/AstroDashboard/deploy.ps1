# MAHI Spiritual System - Deployment Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MAHI Spiritual System - Deployment   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonAvailable = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonAvailable) {
    Write-Host "Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Python from https://python.org" -ForegroundColor Yellow
    exit 1
}

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Starting server in: $scriptDir" -ForegroundColor Green
Write-Host ""
Write-Host "Dashboard will be available at:" -ForegroundColor Yellow
Write-Host "  http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Python HTTP server
python -m http.server 8000

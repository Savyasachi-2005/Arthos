# Quick Start Script for Arthos UPI Spend Analyzer
# Run this script to set up and start the application

Write-Host "=== Arthos UPI Spend Analyzer - Quick Start ===" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python is not installed or not in PATH. Please install Python 3.9+ first." -ForegroundColor Red
    exit 1
}

# Create virtual environment if it doesn't exist
if (-Not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Run tests
Write-Host ""
Write-Host "Running tests..." -ForegroundColor Yellow
pytest -v

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Starting the FastAPI server..." -ForegroundColor Cyan
Write-Host "API will be available at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
uvicorn app.main:app --reload

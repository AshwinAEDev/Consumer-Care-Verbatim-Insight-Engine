# Bootstrap script for CCVIE local development on Windows PowerShell
# Usage: .\bootstrap.ps1

Write-Host "=== CCVIE Bootstrap ===" -ForegroundColor Green

# 1. Install backend dependencies
Write-Host "`n[1/3] Installing backend dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "backend")) {
    Write-Host "ERROR: backend folder not found" -ForegroundColor Red
    exit 1
}

Push-Location backend
try {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -m pip install -e .
    } else {
        Write-Host "ERROR: Python is not installed. Please install Python 3.11+" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

# 2. Install frontend dependencies
Write-Host "`n[2/3] Installing frontend dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "frontend")) {
    Write-Host "ERROR: frontend folder not found" -ForegroundColor Red
    exit 1
}

Push-Location frontend
try {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install
    } else {
        Write-Host "ERROR: npm is not installed. Please install Node.js" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

# 3. Copy env vars to frontend/.env.local
Write-Host "`n[3/3] Setting up frontend environment..." -ForegroundColor Cyan
$envContent = Get-Content ".env"
$nextPublicApiUrl = ($envContent | Select-String "NEXT_PUBLIC_API_BASE_URL" | ForEach-Object { $_.Line })
if ($nextPublicApiUrl) {
    $nextPublicApiUrl | Out-File "frontend/.env.local" -Encoding utf8
    Write-Host "Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "WARNING: NEXT_PUBLIC_API_BASE_URL not found in .env" -ForegroundColor Yellow
}

Write-Host "`n=== Bootstrap Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. docker compose up -d db    (start Postgres + pgvector)"
Write-Host "2. npm run dev                (start frontend on port 3000)"

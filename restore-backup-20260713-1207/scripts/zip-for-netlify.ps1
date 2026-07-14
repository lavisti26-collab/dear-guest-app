# Builds production app and creates netlify-deploy.zip (contents of dist at zip root).
# Run from dear-guest-app:  .\scripts\zip-for-netlify.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local missing. Copy .env.local.example and add Supabase keys." -ForegroundColor Red
    exit 1
}

Write-Host "Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$zipPath = Join-Path $root "netlify-deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Write-Host "Creating zip..." -ForegroundColor Cyan
Compress-Archive -Path "dist\*" -DestinationPath $zipPath -CompressionLevel Optimal

$mb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Done: $zipPath ($mb MB)" -ForegroundColor Green
Write-Host "Upload this file at https://app.netlify.com/drop" -ForegroundColor Yellow

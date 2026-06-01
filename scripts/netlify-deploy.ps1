# Run from dear-guest-app: .\scripts\netlify-deploy.ps1
# Requires Netlify CLI and environment variables:
#   NETLIFY_AUTH_TOKEN
#   NETLIFY_SITE_ID

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $env:NETLIFY_AUTH_TOKEN) {
    Write-Host "ERROR: NETLIFY_AUTH_TOKEN is required. Set it in your shell or CI environment." -ForegroundColor Red
    exit 1
}

if (-not $env:NETLIFY_SITE_ID) {
    Write-Host "ERROR: NETLIFY_SITE_ID is required. Set it in your shell or CI environment." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".env.local")) {
    Write-Host "WARNING: .env.local missing. Local build may still work if Netlify env vars are configured." -ForegroundColor Yellow
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Building production bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploying to Netlify site $env:NETLIFY_SITE_ID..." -ForegroundColor Cyan
npx netlify deploy --prod --dir "dist" --site $env:NETLIFY_SITE_ID
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deployment complete." -ForegroundColor Green

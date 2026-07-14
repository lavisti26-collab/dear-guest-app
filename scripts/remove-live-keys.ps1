<#
Backs up `.env.local` to `.env.local.bak` and writes an `.env.example` with placeholders.
Run this to avoid committing or exposing live keys accidentally.
#>
Set-StrictMode -Version Latest
$base = (Resolve-Path -Path .).Path
Push-Location $base

$envFile = Join-Path $base '.env.local'
if (-not (Test-Path $envFile)) {
  Write-Host "No .env.local found at $envFile"
  Pop-Location
  exit 0
}

$bak = Join-Path $base '.env.local.bak'
Copy-Item -Path $envFile -Destination $bak -Force
Write-Host "Backed up .env.local to .env.local.bak"

$example = @()
$example += "VITE_SUPABASE_URL=https://your-project.supabase.co"
$example += "VITE_SUPABASE_ANON_KEY=sb_publishable_xxx_replace_me"
$example += "SUPABASE_SERVICE_ROLE_KEY=service_role_xxx_replace_me"
$example += "# Add any other env keys here"

$examplePath = Join-Path $base '.env.example'
$example -join "`n" | Out-File -FilePath $examplePath -Encoding UTF8
Write-Host "Wrote .env.example with placeholder values."

Remove-Item -Path $envFile -Force
Write-Host ".env.local removed from project directory. Backup retained as .env.local.bak"

Pop-Location

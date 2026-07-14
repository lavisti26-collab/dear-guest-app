<#
Apply SQL migrations from ./migrations in lexical order using the Supabase CLI.
Place ordered SQL files into `dear-guest-app/migrations/` (prefix them with numbers, e.g. 0001_init.sql).
Requires: the Supabase CLI installed and either authenticated or using SUPABASE_ACCESS_TOKEN.
#>
Set-StrictMode -Version Latest
$base = (Resolve-Path -Path .).Path
Push-Location $base

function Fail($message) {
  Write-Error $message
  Pop-Location
  exit 1
}

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Fail 'Supabase CLI is required but not found on PATH. Install it from https://supabase.com/docs/guides/cli'
}

$configPath = Join-Path $base 'supabase/config.toml'
if (-not (Test-Path $configPath)) {
  Fail "Missing Supabase config at $configPath"
}

$projectRef = Select-String -Path $configPath -Pattern '^project_id\s*=\s*"(.*)"' | ForEach-Object { $_.Matches[0].Groups[1].Value }
if (-not $projectRef) {
  Fail 'Unable to read project_id from supabase/config.toml.'
}

$linkFile = Join-Path $base 'supabase/.temp/linked-project.json'
if (-not (Test-Path $linkFile)) {
  Write-Host "Linking Supabase project $projectRef ..."
  supabase link --project-ref $projectRef
  if ($LASTEXITCODE -ne 0) { Fail 'Failed to link Supabase project with the Supabase CLI.' }
}

$migrationsDir = Join-Path $base 'migrations'
if (-not (Test-Path $migrationsDir)) {
  Write-Host "No migrations directory found at $migrationsDir. Create it and add .sql files before running."
  Pop-Location
  exit 1
}

$files = Get-ChildItem -Path $migrationsDir -Filter '*.sql' -File | Sort-Object Name
if ($files.Count -eq 0) {
  Write-Host "No .sql migration files found in $migrationsDir."
  Pop-Location
  exit 1
}

foreach ($f in $files) {
  Write-Host "Applying migration: $($f.Name)"
  supabase db query --linked --file $f.FullName
  if ($LASTEXITCODE -ne 0) { Fail "Migration failed: $($f.Name)" }
}

Write-Host "All migrations applied successfully."
Pop-Location

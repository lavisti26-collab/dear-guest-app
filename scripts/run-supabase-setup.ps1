# Run the main Supabase SQL setup files in order, then apply any migration SQL.
# Requires the Supabase CLI installed and either authenticated or using SUPABASE_ACCESS_TOKEN.
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

$scripts = @(
  'supabase/scripts/FULL-SETUP.sql',
  'supabase/scripts/FIX-PROFILES-RLS-RECURSION.sql',
  'supabase/scripts/SETUP-STORAGE-BUCKETS.sql',
  'supabase/scripts/ADD-APPEARANCE-AND-FONTS.sql'
)

foreach ($script in $scripts) {
  if (Test-Path $script) {
    Write-Host "Running $script ..."
    supabase db query --linked --file $script
    if ($LASTEXITCODE -ne 0) { Fail "Command failed for $script" }
  } else {
    Write-Host "Skipping missing script: $script"
  }
}

$migrationsDir = Join-Path $base 'migrations'
if (Test-Path $migrationsDir) {
  $files = Get-ChildItem -Path $migrationsDir -Filter '*.sql' -File | Sort-Object Name
  foreach ($file in $files) {
    Write-Host "Applying migration: $($file.Name)"
    supabase db query --linked --file $file.FullName
    if ($LASTEXITCODE -ne 0) { Fail "Migration failed: $($file.Name)" }
  }
} else {
  Write-Host "No migrations directory found at $migrationsDir. Skipping migration step."
}

Write-Host 'Supabase setup sequence complete.'
Pop-Location

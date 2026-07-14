Param(
  [string]$SourcePath = "fonts\Battambang-Regular.ttf"
)

Set-StrictMode -Version Latest
$base = (Resolve-Path -Path .).Path
Push-Location $base

$envFile = Join-Path $base '.env.local'
if (-not (Test-Path $envFile)) { Write-Host '.env.local not found'; Pop-Location; exit 1 }

Get-Content $envFile | ForEach-Object {
  $pair = $_ -split '=',2
  if ($pair.Length -eq 2) { $name = $pair[0].Trim(); $value = $pair[1].Trim(); Set-Item -Path env:$name -Value $value }
}

$file = Join-Path $base $SourcePath
if (-not (Test-Path $file)) { Write-Host "Source file not found: $file"; Pop-Location; exit 1 }

$supUrl = $env:VITE_SUPABASE_URL
$key = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $supUrl -or -not $key) { Write-Host 'Missing SUPABASE vars'; Pop-Location; exit 1 }

$uri = "$supUrl/storage/v1/object/fonts"
Write-Host "Uploading $file to $uri ..."
try {
  Invoke-RestMethod -Uri $uri -Method Post -Headers @{ Authorization = "Bearer $key" } -ContentType 'multipart/form-data' -Form @{ file = Get-Item $file } -ErrorAction Stop
  Write-Host 'Upload successful'
} catch {
  Write-Warning "Upload failed: $_"
}

Pop-Location

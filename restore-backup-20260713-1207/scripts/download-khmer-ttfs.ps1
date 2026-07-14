Set-StrictMode -Version Latest
$base = (Resolve-Path -Path .).Path
Push-Location $base

$fontsDir = Join-Path $base 'fonts'
if (-not (Test-Path $fontsDir)) { New-Item -ItemType Directory -Path $fontsDir | Out-Null }

$urls = @(
  'https://github.com/google/fonts/raw/main/ofl/notoserifkhmer/NotoSerifKhmer-Regular.ttf',
  'https://github.com/google/fonts/raw/main/ofl/notoserifkhmer/NotoSerifKhmer-Bold.ttf',
  'https://github.com/google/fonts/raw/main/ofl/notosanskhmer/NotoSansKhmer-Regular.ttf',
  'https://github.com/google/fonts/raw/main/ofl/hanuman/Hanuman-Regular.ttf',
  'https://github.com/google/fonts/raw/main/ofl/battambang/Battambang-Regular.ttf',
  'https://github.com/google/fonts/raw/main/ofl/kantumruy/Kantumruy-Regular.ttf'
)

foreach ($u in $urls) {
  $name = Split-Path $u -Leaf
  $target = Join-Path $fontsDir $name
  if (Test-Path $target) { Write-Host "$name already exists, skipping"; continue }
  Write-Host "Downloading $name..."
  try { Invoke-WebRequest -Uri $u -OutFile $target -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' } -ErrorAction Stop } catch { Write-Warning "Failed to download $u"; continue }
}

Write-Host "Uploading fonts to Supabase storage 'fonts'..."
& powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\upload-fonts.ps1

Pop-Location

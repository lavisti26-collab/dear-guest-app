<#
Download common Khmer fonts from Google Fonts, save to ./fonts, and upload to Supabase Storage `fonts`.
This attempts to fetch woff2 files for families: Noto Serif Khmer, Noto Sans Khmer, Hanuman, Battambang.
Requires: internet access, `supabase` CLI logged in and linked to project.
#>
Set-StrictMode -Version Latest
$base = (Resolve-Path -Path .).Path
Push-Location $base

$fontsDir = Join-Path $base 'fonts'
if (-not (Test-Path $fontsDir)) { New-Item -ItemType Directory -Path $fontsDir | Out-Null }

$families = @(
  @{ name = 'Noto Serif Khmer'; weights = '400;700' },
  @{ name = 'Noto Sans Khmer'; weights = '400;700' },
  @{ name = 'Hanuman'; weights = '400' },
  @{ name = 'Battambang'; weights = '400' }
)

function SafeName($s) { return ($s -replace '\s+','-').Replace('--','-').Trim('-') }

foreach ($fam in $families) {
  $family = $fam.name
  $weights = $fam.weights
  $qname = $family -replace ' ','+'
  $cssUrl = "https://fonts.googleapis.com/css2?family=$qname:wght@$weights&display=swap"
  Write-Host "Fetching CSS for $family ..."
  try {
    $resp = Invoke-WebRequest -Uri $cssUrl -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' } -ErrorAction Stop
  } catch {
    Write-Warning ("Failed to fetch CSS for {0}: {1}" -f $family, $_)
    continue
  }
  $css = $resp.Content
  $matches = ([regex]"url\((https?://[^)]+)\)").Matches($css)
  if ($matches.Count -eq 0) { Write-Warning "No font URLs found for $family"; continue }
  foreach ($m in $matches) {
    $url = $m.Groups[1].Value
    # attempt to extract weight from the nearby text
    $contextIndex = $css.IndexOf($m.Value)
    $slice = $css.Substring([Math]::Max(0, $contextIndex-120), [Math]::Min(240, $css.Length - [Math]::Max(0, $contextIndex-120)))
    $wMatch = ([regex]"font-weight:\s*(\d+)").Match($slice)
    $weight = if ($wMatch.Success) { $wMatch.Groups[1].Value } else { '400' }
    $suffix = switch ($weight) { '400' { 'Regular' } '700' { 'Bold' } default { "W$weight" } }
    $fname = "$(SafeName $family)-$suffix.woff2"
    $target = Join-Path $fontsDir $fname
    if (Test-Path $target) { Write-Host "Already have $fname, skipping download."; continue }
    Write-Host "Downloading $fname from $url ..."
    try { Invoke-WebRequest -Uri $url -OutFile $target -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' } -ErrorAction Stop } catch { Write-Warning ("Failed to download {0}: {1}" -f $url, $_); continue }
    Write-Host "Uploading $fname to Supabase storage 'fonts'..."
    supabase storage upload fonts $target --non-interactive
    if ($LASTEXITCODE -ne 0) { Write-Warning "Upload failed for $fname" }
  }
}

Write-Host "Font download+upload sequence complete. Files in $fontsDir"
Pop-Location

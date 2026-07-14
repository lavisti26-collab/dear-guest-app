<#
Uploads all .woff2 files from ./fonts to the Supabase Storage `fonts` bucket.
Place your `.woff2` files into `dear-guest-app/fonts/` and run this script from the project root.
Requires: `supabase` CLI authenticated and linked to your project.
#>
Set-StrictMode -Version Latest
$base = (Resolve-Path -Path .).Path
Push-Location $base

$fontDir = Join-Path $base 'fonts'
if (-not (Test-Path $fontDir)) {
  Write-Host "No fonts directory found at $fontDir. Create it and add .woff2 files before running."
  Pop-Location
  exit 1
}

$files = Get-ChildItem -Path $fontDir -Include '*.woff2','*.ttf' -File -Recurse
if ($files.Count -eq 0) {
  Write-Host "No .woff2 or .ttf files found in $fontDir. Add font files and retry."
  Pop-Location
  exit 1
}

foreach ($f in $files) {
  $relativeSource = '.' + $f.FullName.Substring($base.Length)
  $remotePath = "ss:///fonts/$($f.Name)"
  $contentType = switch ($f.Extension.ToLower()) {
    '.woff2' { 'font/woff2' }
    '.ttf'   { 'font/ttf' }
    default  { 'application/octet-stream' }
  }

  Write-Host "Uploading $relativeSource to Supabase storage as $remotePath..."
  supabase storage cp $relativeSource $remotePath --content-type $contentType --experimental --linked --yes
  if ($LASTEXITCODE -ne 0) { Write-Error "Upload failed for $($f.Name)"; Pop-Location; exit 1 }
}

Write-Host "All fonts uploaded successfully."
Pop-Location

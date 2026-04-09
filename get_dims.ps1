Add-Type -AssemblyName System.Drawing
$publicDir = "c:\Users\USER\OneDrive\Desktop\Radar project 1.0\Frontend\public"
Get-ChildItem -Path $publicDir -Filter *.png | ForEach-Object {
    try {
        $img = [System.Drawing.Image]::FromFile($_.FullName)
        Write-Host "$($_.Name): $($img.Width)x$($img.Height)"
        $img.Dispose()
    } catch {
        Write-Host "Failed to read $($_.Name)"
    }
}

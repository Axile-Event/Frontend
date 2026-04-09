Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\USER\OneDrive\Desktop\Radar project 1.0\Frontend\public\axile-logo.png"
$outputPath = "c:\Users\USER\OneDrive\Desktop\Radar project 1.0\Frontend\public\axile-logo-cropped.png"

function Get-IconBoundingBox {
    param($bmp)
    $minX = $bmp.Width
    $minY = $bmp.Height
    $maxX = 0
    $maxY = 0
    $threshold = 40 

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $pixel = $bmp.GetPixel($x, $y)
            if ($pixel.R -gt $threshold -or $pixel.G -gt $threshold -or $pixel.B -gt $threshold) {
                if ($x -lt $minX) { $minX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    $currentX = $minX
    $gapCount = 0
    $maxGap = 20 
    
    while ($currentX -lt $bmp.Width) {
        $hasContent = $false
        for ($y = $minY; $y -le $maxY; $y++) {
            $pixel = $bmp.GetPixel($currentX, $y)
            if ($pixel.R -gt $threshold -or $pixel.G -gt $threshold -or $pixel.B -gt $threshold) {
                $hasContent = $true
                break
            }
        }
        
        if ($hasContent) {
            $maxX = $currentX
            $gapCount = 0
        } else {
            $gapCount++
            if ($gapCount -gt $maxGap -and $maxX -gt $minX) {
                break
            }
        }
        $currentX++
    }

    if ($maxX -le $minX) { return $null }
    return @{ X = $minX; Y = $minY; Width = ($maxX - $minX + 1); Height = ($maxY - $minY + 1) }
}

try {
    Write-Host "Loading image: $sourcePath"
    $original = [System.Drawing.Bitmap]::FromFile($sourcePath)
    
    $box = Get-IconBoundingBox $original
    if ($box -eq $null) {
        Write-Error "Could not isolate icon."
        $original.Dispose()
        return
    }

    Write-Host "Isolating icon region..."
    $cropBmp = New-Object System.Drawing.Bitmap($box.Width, $box.Height)
    $gCrop = [System.Drawing.Graphics]::FromImage($cropBmp)
    $srcRect = New-Object System.Drawing.Rectangle($box.X, $box.Y, $box.Width, $box.Height)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $box.Width, $box.Height)
    $gCrop.DrawImage($original, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $gCrop.Dispose()

    Write-Host "Applying smart transparency (Flood Fill background)..."
    # Create a mask to identify background pixels
    $visited = New-Object "bool[,]" $box.Width, $box.Height
    $queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]
    
    # Add all edge pixels to queue if they are black
    $threshold = 50
    for ($x = 0; $x -lt $box.Width; $x++) {
        foreach ($y in @(0, ($box.Height - 1))) {
            $p = $cropBmp.GetPixel($x, $y)
            if ($p.R -lt $threshold -and $p.G -lt $threshold -and $p.B -lt $threshold) {
                $queue.Enqueue((New-Object System.Drawing.Point($x, $y)))
                $visited[$x, $y] = $true
            }
        }
    }
    for ($y = 0; $y -lt $box.Height; $y++) {
        foreach ($x in @(0, ($box.Width - 1))) {
            $p = $cropBmp.GetPixel($x, $y)
            if ($p.R -lt $threshold -and $p.G -lt $threshold -and $p.B -lt $threshold -and -not $visited[$x, $y]) {
                $queue.Enqueue((New-Object System.Drawing.Point($x, $y)))
                $visited[$x, $y] = $true
            }
        }
    }

    # BFS Flood Fill
    while ($queue.Count -gt 0) {
        $curr = $queue.Dequeue()
        $cropBmp.SetPixel($curr.X, $curr.Y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        
        foreach ($dx in @(-1, 0, 1)) {
            foreach ($dy in @(-1, 0, 1)) {
                if ($dx -eq 0 -and $dy -eq 0) { continue }
                $nx = $curr.X + $dx
                $ny = $curr.Y + $dy
                if ($nx -ge 0 -and $nx -lt $box.Width -and $ny -ge 0 -and $ny -lt $box.Height -and -not $visited[$nx, $ny]) {
                    $p = $cropBmp.GetPixel($nx, $ny)
                    if ($p.R -lt $threshold -and $p.G -lt $threshold -and $p.B -lt $threshold) {
                        $visited[$nx, $ny] = $true
                        $queue.Enqueue((New-Object System.Drawing.Point($nx, $ny)))
                    }
                }
            }
        }
    }

    Write-Host "Creating final square favicon..."
    $size = [Math]::Max($box.Width, $box.Height)
    $finalBmp = New-Object System.Drawing.Bitmap($size, $size)
    $gFinal = [System.Drawing.Graphics]::FromImage($finalBmp)
    $gFinal.Clear([System.Drawing.Color]::Transparent)
    
    $destX = ($size - $box.Width) / 2
    $destY = ($size - $box.Height) / 2
    $gFinal.DrawImage($cropBmp, $destX, $destY)
    
    Write-Host "Saving to: $outputPath"
    $finalBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $gFinal.Dispose()
    $finalBmp.Dispose()
    $cropBmp.Dispose()
    $original.Dispose()
    Write-Host "Successfully processed logo with internal black preserved!"
} catch {
    Write-Error "Failed: $_"
}

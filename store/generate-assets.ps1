Add-Type -AssemblyName System.Drawing

$root = 'c:\Users\vicky\rajesh\SPKS-frontend'
$outDir = Join-Path $root 'store'
$srcPath = Join-Path $root 'assets\images\icon.png'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Save-Png([System.Drawing.Bitmap]$bitmap, [string]$path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

# High-res Play icon: 512 x 512
$icon = New-Object System.Drawing.Bitmap 512, 512
$g = [System.Drawing.Graphics]::FromImage($icon)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.Clear([System.Drawing.Color]::FromArgb(255, 238, 242, 255))
$g.DrawImage($srcImg, 0, 0, 512, 512)
$iconPath = Join-Path $outDir 'play-icon-512.png'
Save-Png $icon $iconPath
$g.Dispose()
$icon.Dispose()

# Feature graphic: 1024 x 500
$banner = New-Object System.Drawing.Bitmap 1024, 500
$bg = [System.Drawing.Graphics]::FromImage($banner)
$bg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$bg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$bg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$bg.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$rect = New-Object System.Drawing.Rectangle 0, 0, 1024, 500
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
  $rect,
  [System.Drawing.Color]::FromArgb(255, 30, 27, 75),
  [System.Drawing.Color]::FromArgb(255, 67, 56, 202),
  [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
)
$bg.FillRectangle($brush, $rect)

$glow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(36, 255, 255, 255))
$bg.FillEllipse($glow, 690, -90, 460, 460)
$bg.FillEllipse($glow, -120, 280, 280, 280)

$card = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$cardRect = New-Object System.Drawing.Rectangle 56, 90, 320, 320
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 36
$path.AddArc($cardRect.X, $cardRect.Y, $radius, $radius, 180, 90)
$path.AddArc($cardRect.Right - $radius, $cardRect.Y, $radius, $radius, 270, 90)
$path.AddArc($cardRect.Right - $radius, $cardRect.Bottom - $radius, $radius, $radius, 0, 90)
$path.AddArc($cardRect.X, $cardRect.Bottom - $radius, $radius, $radius, 90, 90)
$path.CloseFigure()
$bg.FillPath($card, $path)
$bg.DrawImage($srcImg, 76, 110, 280, 280)

$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 199, 210, 254))
$bold = [System.Drawing.FontStyle]::Bold
$regular = [System.Drawing.FontStyle]::Regular
$titleFont = [System.Drawing.Font]::new('Segoe UI', 34, $bold)
$subFont = [System.Drawing.Font]::new('Segoe UI', 16, $bold)
$smallFont = [System.Drawing.Font]::new('Segoe UI', 14, $regular)

$bg.DrawString('SPKS EXAM ACADEMY', $titleFont, $white, 420, 155)
$bg.DrawString('TNPSC  |  RRB  |  TNUSRB', $subFont, $muted, 420, 230)
$bg.DrawString('Learn  |  Practice  |  Succeed', $smallFont, $white, 420, 280)

$featPath = Join-Path $outDir 'feature-graphic-1024x500.png'
Save-Png $banner $featPath

$srcImg.Dispose()
$bg.Dispose()
$banner.Dispose()
$brush.Dispose()
$glow.Dispose()
$card.Dispose()
$path.Dispose()
$white.Dispose()
$muted.Dispose()
$titleFont.Dispose()
$subFont.Dispose()
$smallFont.Dispose()

$iconInfo = Get-Item $iconPath
$featInfo = Get-Item $featPath
Write-Output "icon $($iconInfo.Length) bytes -> $iconPath"
Write-Output "feature $($featInfo.Length) bytes -> $featPath"

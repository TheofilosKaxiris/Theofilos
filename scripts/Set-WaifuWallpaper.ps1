<#!
.SYNOPSIS
    Fetches an image from waifu.im and sets it as the Windows desktop wallpaper.

.DESCRIPTION
    Calls the waifu.im API to retrieve a SFW (by default) image, downloads it to disk,
    and applies it as the desktop wallpaper. Supports orientation and tag filters,
    and common Windows wallpaper styles (Fill, Fit, Stretch, Center, Tile, Span).

.PARAMETER NSFW
    Include NSFW images. Off by default.

.PARAMETER Orientation
    Preferred image orientation: LANDSCAPE (default), PORTRAIT, or SQUARE.

.PARAMETER Tags
    One or more waifu.im included tags (e.g., waifu, maid). Comma-joined for API.

.PARAMETER Style
    Wallpaper style: Fill (default), Fit, Stretch, Center, Tile, Span.

.PARAMETER OutputPath
    Where to save the downloaded image. Default is a unique file in the TEMP folder.

.EXAMPLE
    # Set a random safe-for-work landscape wallpaper with Fill style
    # .\Set-WaifuWallpaper.ps1

.EXAMPLE
    # With tags and Fit style
    # .\Set-WaifuWallpaper.ps1 -Tags waifu,maid -Style Fit

.NOTES
    - Applies the same wallpaper to all monitors via SystemParametersInfo.
    - For per-monitor control, use the DesktopWallpaper COM API (can be added on request).
#>

[CmdletBinding()]
Param(
    [switch] $NSFW,
    [ValidateSet('LANDSCAPE','PORTRAIT','SQUARE')]
    [string] $Orientation = 'LANDSCAPE',

    [string[]] $Tags = @(),

    [ValidateSet('Fill','Fit','Stretch','Center','Tile','Span')]
    [string] $Style = 'Fill',

    [string] $OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
#[Net.ServicePointManager] TLS to avoid HTTPS/TLS negotiation issues on older stacks
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
# Suppress verbose progress records that can severely slow web requests in Windows PowerShell 5.1
$ProgressPreference = 'SilentlyContinue'
Write-Verbose ("PS {0} on {1} (TLS={2})" -f $PSVersionTable.PSVersion, $PSVersionTable.PSEdition, [Net.ServicePointManager]::SecurityProtocol)

function Invoke-JsonRequest {
    Param(
        [Parameter(Mandatory)] [string] $Uri,
        [int] $TimeoutSec = 20,
        [switch] $NoProxy
    )
    # Use external curl.exe to fetch JSON to avoid PowerShell web cmdlet quirks
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if (-not $curl) { throw "curl.exe not found in PATH." }
    Write-Verbose "HTTP GET (curl): $Uri"
    $args = @('-sS','-L','--max-time', [string]$TimeoutSec)
    if ($NoProxy) { $args += '--noproxy'; $args += '*' }
    $args += @('-H','Accept: application/json','-H','User-Agent: Mozilla/5.0 (Windows NT; PowerShell Script)', $Uri)
    $output = & $curl.Source @args 2>&1
    $exit = $LASTEXITCODE
    if ($exit -ne 0) {
        throw "curl.exe failed (exit $exit): $output"
    }
    try {
        return ($output | ConvertFrom-Json)
    } catch {
        throw "Failed to parse JSON from response: $output"
    }
}

function New-WaifuApiUri {
    Param(
        [bool] $IsNsfw,
        [string] $Orientation,
        [string[]] $Tags
    )
    $base = 'https://api.waifu.im/search'
    $params = @{
        'is_nsfw'    = $IsNsfw.ToString().ToLower()
        'orientation' = $Orientation
    }
    $query = ($params.GetEnumerator() | ForEach-Object { "{0}={1}" -f [System.Net.WebUtility]::UrlEncode($_.Key), [System.Net.WebUtility]::UrlEncode([string]$_.Value) }) -join '&'

    if ($Tags -and $Tags.Count -gt 0) {
        $tagsJoined = ($Tags -join ',')
        $query += '&included_tags=' + [System.Net.WebUtility]::UrlEncode($tagsJoined)
    }

    return "${base}?$query"
}

function Get-WallpaperStyleValues {
    Param([string] $Style)
    switch ($Style) {
        'Center' { return @{ WallpaperStyle = 0;  TileWallpaper = 0 } }
        'Tile'   { return @{ WallpaperStyle = 0;  TileWallpaper = 1 } }
        'Stretch'{ return @{ WallpaperStyle = 2;  TileWallpaper = 0 } }
        'Fit'    { return @{ WallpaperStyle = 6;  TileWallpaper = 0 } }
        'Fill'   { return @{ WallpaperStyle = 10; TileWallpaper = 0 } }
        'Span'   { return @{ WallpaperStyle = 22; TileWallpaper = 0 } }
        default  { return @{ WallpaperStyle = 10; TileWallpaper = 0 } }
    }
}

function Set-DesktopWallpaper {
    Param(
        [Parameter(Mandatory)] [string] $Path,
        [Parameter(Mandatory)] [string] $Style
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Image not found at '$Path'"
    }

    $vals = Get-WallpaperStyleValues -Style $Style
    $desktopRegPath = 'HKCU:\Control Panel\Desktop'

    Set-ItemProperty -Path $desktopRegPath -Name WallpaperStyle -Value $($vals.WallpaperStyle) | Out-Null
    Set-ItemProperty -Path $desktopRegPath -Name TileWallpaper  -Value $($vals.TileWallpaper)  | Out-Null

    $code = @"
using System.Runtime.InteropServices;
public class WallpaperSetter {
  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
    try { Add-Type $code -ErrorAction Stop | Out-Null } catch { }

    $SPI_SETDESKWALLPAPER = 20
    $SPIF_UPDATEINIFILE   = 0x01
    $SPIF_SENDCHANGE      = 0x02

    $ok = [WallpaperSetter]::SystemParametersInfo($SPI_SETDESKWALLPAPER, 0, $Path, ($SPIF_UPDATEINIFILE -bor $SPIF_SENDCHANGE))
    if (-not $ok) {
        $err = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
        throw "Failed to set wallpaper. Win32Error=$err"
    }
}

function Resolve-OutputPath {
    Param(
        [string] $OutputPath,
        [string] $ImageUrl
    )
    $ext = [System.IO.Path]::GetExtension(([Uri]$ImageUrl).AbsolutePath)
    if ([string]::IsNullOrWhiteSpace($ext)) { $ext = '.jpg' }

    if ([string]::IsNullOrWhiteSpace($OutputPath)) {
        $file = 'waifu-wallpaper-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + $ext
        return Join-Path $env:TEMP $file
    }

    # Ensure chosen path has the correct extension
    if (-not $OutputPath.EndsWith($ext, [System.StringComparison]::OrdinalIgnoreCase)) {
        $OutputPath += $ext
    }
    return $OutputPath
}

try {
    $uri = New-WaifuApiUri -IsNsfw:$NSFW.IsPresent -Orientation $Orientation -Tags $Tags
    Write-Verbose "Querying: $uri"

    $response = Invoke-JsonRequest -Uri $uri -TimeoutSec 20

    if (-not $response -or -not $response.images -or $response.images.Count -eq 0) {
        throw 'waifu.im returned no images.'
    }

    $imageUrl = [string]$response.images[0].url
    Write-Verbose "Image: $imageUrl"

    $dest = Resolve-OutputPath -OutputPath $OutputPath -ImageUrl $imageUrl
    $destDir = Split-Path -Parent $dest
    if (-not (Test-Path -LiteralPath $destDir)) { throw "Destination directory does not exist: '$destDir'" }

    Write-Verbose "Downloading to: $dest (curl)"
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if (-not $curl) { throw "curl.exe not found in PATH." }
    $dlArgs = @('-sS','-L','--max-time','60','-A','Mozilla/5.0 (Windows NT; PowerShell Script)','-o', $dest, $imageUrl)
    $dlOut = & $curl.Source @dlArgs 2>&1
    $exit = $LASTEXITCODE
    if ($exit -ne 0) { throw "curl.exe download failed (exit $exit): $dlOut" }
    Write-Verbose "Download complete"

    Write-Verbose "Applying wallpaper with style '$Style'"
    Set-DesktopWallpaper -Path $dest -Style $Style
    Write-Verbose "Wallpaper applied"

    Write-Host "Wallpaper set successfully." -ForegroundColor Green
    Write-Host "Saved to: $dest" -ForegroundColor DarkGray
}
catch {
    Write-Error $_
    exit 1
}

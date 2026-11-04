# Apex Bank - Lightweight Local HTTP Server (Zero Dependencies)
# Powered by .NET HttpListener built into Windows PowerShell

param(
    [int]$Port = 8080
)

$HostName = 'localhost'
$Prefix = "http://${HostName}:${Port}/"
$Folder = $PSScriptRoot

Write-Host '==========================================================' -ForegroundColor Cyan
Write-Host '  APEX GLOBAL BANK - Local Development Web Server' -ForegroundColor Green
Write-Host '==========================================================' -ForegroundColor Cyan
Write-Host " Serving:  $Folder" -ForegroundColor Gray
Write-Host " Server:   $Prefix" -ForegroundColor White
Write-Host ' Opening default browser automatically...' -ForegroundColor Yellow
Write-Host ' Press [Ctrl+C] in this terminal to stop the server.' -ForegroundColor Gray
Write-Host '==========================================================' -ForegroundColor Cyan

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Prefix)

try {
    $Listener.Start()
} catch {
    Write-Warning "Port $Port is in use. Trying port 8081..."
    $Port = 8081
    $Prefix = "http://${HostName}:${Port}/"
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add($Prefix)
    $Listener.Start()
}

Start-Process $Prefix

$MimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($UrlPath) -or $UrlPath -eq '/') {
            $UrlPath = 'index.html'
        }

        $FilePath = Join-Path $Folder $UrlPath

        if (Test-Path $FilePath -PathType Leaf) {
            $Extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = $MimeTypes[$Extension]
            if (-not $ContentType) { $ContentType = 'application/octet-stream' }

            $Response.ContentType = $ContentType
            $Response.AddHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
            $Response.AddHeader('Access-Control-Allow-Origin', '*')

            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
            $Response.StatusCode = 200
        } else {
            $Response.StatusCode = 404
            $NotFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $UrlPath")
            $Response.OutputStream.Write($NotFoundMsg, 0, $NotFoundMsg.Length)
        }

        $Response.Close()
    }
} finally {
    $Listener.Stop()
    $Listener.Close()
    Write-Host 'Apex Bank server stopped.' -ForegroundColor Red
}

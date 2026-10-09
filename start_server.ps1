# PlanGuard Lightweight Local Server (Zero external dependencies)
param(
    [int]$Port = 3000,
    [switch]$NoOpen
)

$localPathRoot = $PSScriptRoot
if (-not $localPathRoot) { $localPathRoot = Get-Location }

$listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback), $Port
$listener.Start()

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " PlanGuard AI Architectural CAD Server Running!" -ForegroundColor Green
Write-Host " URL: http://localhost:$Port" -ForegroundColor Yellow
Write-Host " Press Ctrl+C in this terminal to stop the server." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# Automatically launch default browser if requested
if (-not $NoOpen) {
    try { Start-Process "http://localhost:$Port" } catch {}
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $line = $reader.ReadLine()
        
        if ($line) {
            $tokens = $line.Split(" ")
            if ($tokens.Length -ge 2) {
                $reqPath = $tokens[1]
                if ($reqPath -eq "/" -or [string]::IsNullOrWhiteSpace($reqPath)) {
                    $reqPath = "/index.html"
                }
                
                # Strip query strings
                if ($reqPath.Contains("?")) {
                    $reqPath = $reqPath.Substring(0, $reqPath.IndexOf("?"))
                }
                
                $filePath = Join-Path $localPathRoot ($reqPath.TrimStart('/').Replace('/', '\'))
                
                if (Test-Path $filePath -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $contentType = switch ($ext) {
                        ".html" { "text/html; charset=utf-8" }
                        ".css"  { "text/css; charset=utf-8" }
                        ".js"   { "application/javascript; charset=utf-8" }
                        ".json" { "application/json; charset=utf-8" }
                        ".svg"  { "image/svg+xml" }
                        ".png"  { "image/png" }
                        ".jpg"  { "image/jpeg" }
                        Default { "application/octet-stream" }
                    }
                    
                    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                    $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($fileBytes.Length)`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($fileBytes, 0, $fileBytes.Length)
                } else {
                    $notFoundBody = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $reqPath")
                    $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($notFoundBody.Length)`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($notFoundBody, 0, $notFoundBody.Length)
                }
            }
        }
        
        $stream.Flush()
        $client.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Red
}

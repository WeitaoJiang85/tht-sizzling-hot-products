param(
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 5000,
    [switch]$FrontendOnly
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root 'frontend'
$backendProject = Join-Path $root 'backend\SizzlingHotProducts.Api\SizzlingHotProducts.Api.csproj'

function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq 'Listen' -and $_.OwningProcess -gt 0 } |
    Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($procId in $connections) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "Stopped process $procId on port $Port"
        }
        catch {
            Write-Warning "Could not stop process $procId on port ${Port}: $($_.Exception.Message)"
        }
    }
}

Write-Host 'Preparing development environment...'
Stop-PortProcess -Port $FrontendPort

if (-not $FrontendOnly) {
    Stop-PortProcess -Port $BackendPort

    Write-Host 'Starting backend with hot reload (dotnet watch run)...'
    Start-Process powershell -ArgumentList @(
        '-NoExit',
        '-Command',
        "dotnet watch --project `"$backendProject`" run"
    ) | Out-Null
}
else {
    Write-Host "Skipping backend startup and keeping existing service on http://localhost:$BackendPort"
}

Write-Host 'Starting frontend with hot reload (next dev)...'
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "npm --prefix `"$frontend`" run dev"
) | Out-Null

Write-Host "Backend: http://localhost:$BackendPort"
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host 'Done.'

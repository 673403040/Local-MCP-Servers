# PowerShell script for Windows
Write-Host "========================================" -ForegroundColor Green
Write-Host "    MCP Servers Startup (PowerShell)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Updating dependencies to latest versions..." -ForegroundColor Yellow
Write-Host

Write-Host "Updating time-local..." -ForegroundColor Cyan
Set-Location "time-local"
npm update
Set-Location ".."

Write-Host "Updating memory-local..." -ForegroundColor Cyan
Set-Location "memory-local"
npm update
Set-Location ".."

Write-Host "Updating fetch-local..." -ForegroundColor Cyan
Set-Location "fetch-local"
npm update
Set-Location ".."

Write-Host "Updating filesystem-local..." -ForegroundColor Cyan
Set-Location "filesystem-local"
npm update
Set-Location ".."

Write-Host "Updating sequential-thinking-local..." -ForegroundColor Cyan
Set-Location "sequential-thinking-local"
npm update
Set-Location ".."

Write-Host "Updating context7-local..." -ForegroundColor Cyan
Set-Location "context7-local"
npm update
Set-Location ".."

Write-Host "Updating moondream-general..." -ForegroundColor Cyan
Set-Location "moondream-minimal\moondream-mcp-optimized\ultra-minimal"
npm update
Set-Location "..\..\..\"

Write-Host
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Dependencies Updated Successfully" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host

Write-Host "Generating configuration..." -ForegroundColor Yellow

# Create configuration with Windows-style paths
$Config = @{
    mcpServers = @{
        "time-local" = @{
            command = "node"
            args = @("$ScriptDir\time-local\server.js")
        }
        "memory-local" = @{
            command = "node"
            args = @("$ScriptDir\memory-local\server.js")
        }
        "fetch-local" = @{
            command = "node"
            args = @("$ScriptDir\fetch-local\server.js")
        }
        "filesystem-local" = @{
            command = "node"
            args = @("$ScriptDir\filesystem-local\server.js")
        }
        "sequential-thinking-local" = @{
            command = "node"
            args = @("$ScriptDir\sequential-thinking-local\server.js")
        }
        "context7-local" = @{
            command = "node"
            args = @("$ScriptDir\context7-local\server.js")
        }
        "moondream-general" = @{
            command = "node"
            args = @("$ScriptDir\moondream-minimal\moondream-mcp-optimized\ultra-minimal\server.js")
        }
    }
}

$ConfigJson = $Config | ConvertTo-Json -Depth 3
$ConfigJson | Out-File -FilePath "mcp-config.json" -Encoding UTF8

Write-Host "Configuration saved to mcp-config.json" -ForegroundColor Green
Write-Host
Write-Host "Copy this configuration to Augment Agent/Cursor:" -ForegroundColor Yellow
Write-Host
Write-Host $ConfigJson -ForegroundColor White
Write-Host
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Ready for Augment Agent/Cursor" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy the JSON above to Augment Agent/Cursor settings" -ForegroundColor White
Write-Host "2. Save and restart Augment Agent/Cursor" -ForegroundColor White
Write-Host "3. All servers will auto-start when needed" -ForegroundColor White
Write-Host
Write-Host "All dependencies updated with latest versions!" -ForegroundColor Green
Write-Host

Read-Host "Press Enter to continue"

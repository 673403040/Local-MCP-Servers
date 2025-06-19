@echo off
echo ========================================
echo    MCP Servers Startup
echo ========================================
echo.

cd /d "D:\local-mcp-servers"

echo Updating dependencies to latest versions...
echo.

echo Updating time-local...
cd time-local && npm update && cd ..

echo Updating memory-local...
cd memory-local && npm update && cd ..

echo Updating fetch-local...
cd fetch-local && npm update && cd ..

echo Updating filesystem-local...
cd filesystem-local && npm update && cd ..

echo Updating sequential-thinking-local...
cd sequential-thinking-local && npm update && cd ..

echo Updating context7-local...
cd context7-local && npm update && cd ..

echo Updating moondream-general...
cd moondream-minimal\moondream-mcp-optimized\ultra-minimal && npm update && cd ..\..\..

echo.
echo ========================================
echo    Dependencies Updated Successfully
echo ========================================
echo.

echo Copy this configuration to Augment Agent:
echo.

echo { > mcp-config.json
echo   "mcpServers": { >> mcp-config.json
echo     "time-local": { >> mcp-config.json
echo       "command": "node", >> mcp-config.json
echo       "args": ["D:/local-mcp-servers/time-local/server.js"] >> mcp-config.json
echo     }, >> mcp-config.json
echo     "memory-local": { >> mcp-config.json
echo       "command": "node", >> mcp-config.json
echo       "args": ["D:/local-mcp-servers/memory-local/server.js"] >> mcp-config.json
echo     }, >> mcp-config.json
echo     "fetch-local": { >> mcp-config.json
echo       "command": "node", >> mcp-config.json
echo       "args": ["D:/local-mcp-servers/fetch-local/server.js"] >> mcp-config.json
echo     }, >> mcp-config.json
echo     "filesystem-local": { >> mcp-config.json
echo       "command": "node", >> mcp-config.json
echo       "args": ["D:/local-mcp-servers/filesystem-local/server.js"] >> mcp-config.json
echo     }, >> mcp-config.json
echo     "sequential-thinking-local": { >> mcp-config.json
echo       "command": "node", >> mcp-config.json
echo       "args": ["D:/local-mcp-servers/sequential-thinking-local/server.js"] >> mcp-config.json
echo     }, >> mcp-config.json
echo     "context7-local": { >> mcp-config.json
echo       "command": "node", >> mcp-config.json
echo       "args": ["D:/local-mcp-servers/context7-local/server.js"] >> mcp-config.json
echo     }, >> mcp-config.json
echo     "moondream-general": { >> mcp-config.json
echo       "command": "node", >> mcp-config.json
echo       "args": ["D:/local-mcp-servers/moondream-minimal/moondream-mcp-optimized/ultra-minimal/server.js"] >> mcp-config.json
echo     } >> mcp-config.json
echo   } >> mcp-config.json
echo } >> mcp-config.json

echo Configuration saved to mcp-config.json
echo.
type mcp-config.json
echo.
echo ========================================
echo    Ready for Augment Agent
echo ========================================
echo.
echo Next steps:
echo 1. Copy the JSON above to Augment Agent settings
echo 2. Save and restart Augment Agent
echo 3. All servers will auto-start when needed
echo.
echo All dependencies updated with latest versions!
echo.
pause

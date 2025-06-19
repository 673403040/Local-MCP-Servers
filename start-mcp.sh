#!/bin/bash

echo "========================================"
echo "    MCP Servers Startup (Unix/Linux/macOS)"
echo "========================================"
echo

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Updating dependencies to latest versions..."
echo

echo "Updating time-local..."
cd time-local && npm update && cd ..

echo "Updating memory-local..."
cd memory-local && npm update && cd ..

echo "Updating fetch-local..."
cd fetch-local && npm update && cd ..

echo "Updating filesystem-local..."
cd filesystem-local && npm update && cd ..

echo "Updating sequential-thinking-local..."
cd sequential-thinking-local && npm update && cd ..

echo "Updating context7-local..."
cd context7-local && npm update && cd ..

echo "Updating moondream-general..."
cd moondream-minimal/moondream-mcp-optimized/ultra-minimal && npm update && cd ../../..

echo
echo "========================================"
echo "    Dependencies Updated Successfully"
echo "========================================"
echo

echo "Generating configuration..."

# Create configuration with Unix-style paths
cat > mcp-config.json << EOF
{
  "mcpServers": {
    "time-local": {
      "command": "node",
      "args": ["$SCRIPT_DIR/time-local/server.js"]
    },
    "memory-local": {
      "command": "node",
      "args": ["$SCRIPT_DIR/memory-local/server.js"]
    },
    "fetch-local": {
      "command": "node",
      "args": ["$SCRIPT_DIR/fetch-local/server.js"]
    },
    "filesystem-local": {
      "command": "node",
      "args": ["$SCRIPT_DIR/filesystem-local/server.js"]
    },
    "sequential-thinking-local": {
      "command": "node",
      "args": ["$SCRIPT_DIR/sequential-thinking-local/server.js"]
    },
    "context7-local": {
      "command": "node",
      "args": ["$SCRIPT_DIR/context7-local/server.js"]
    },
    "moondream-general": {
      "command": "node",
      "args": ["$SCRIPT_DIR/moondream-minimal/moondream-mcp-optimized/ultra-minimal/server.js"]
    }
  }
}
EOF

echo "Configuration saved to mcp-config.json"
echo
echo "Copy this configuration to Augment Agent/Cursor:"
echo
cat mcp-config.json
echo
echo "========================================"
echo "    Ready for Augment Agent/Cursor"
echo "========================================"
echo
echo "Next steps:"
echo "1. Copy the JSON above to Augment Agent/Cursor settings"
echo "2. Save and restart Augment Agent/Cursor"
echo "3. All servers will auto-start when needed"
echo
echo "All dependencies updated with latest versions!"
echo

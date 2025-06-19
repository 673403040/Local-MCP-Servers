const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

// Lightweight Memory MCP Server
class MemoryLocalServer {
  constructor() {
    this.server = new Server({
      name: 'memory-local',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    this.memory = new Map();
    this.memoryFile = path.join(__dirname, 'memory.json');
    this.loadMemory();
    this.setupTools();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, 'utf8');
        const memoryData = JSON.parse(data);
        this.memory = new Map(Object.entries(memoryData));
      }
    } catch (error) {
      console.log('Starting with empty memory');
    }
  }

  saveMemory() {
    try {
      const memoryData = Object.fromEntries(this.memory);
      fs.writeFileSync(this.memoryFile, JSON.stringify(memoryData, null, 2));
    } catch (error) {
      console.error('Failed to save memory:', error.message);
    }
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'store_memory',
        description: 'Store data in memory with a key',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Memory key' },
            value: { type: 'string', description: 'Value to store' },
            persistent: { type: 'boolean', default: true, description: 'Save to disk' }
          },
          required: ['key', 'value']
        }
      }, {
        name: 'retrieve_memory',
        description: 'Retrieve data from memory by key',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Memory key to retrieve' }
          },
          required: ['key']
        }
      }, {
        name: 'list_memory',
        description: 'List all memory keys',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: { type: 'string', description: 'Optional pattern to filter keys' }
          }
        }
      }, {
        name: 'delete_memory',
        description: 'Delete memory by key',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Memory key to delete' }
          },
          required: ['key']
        }
      }, {
        name: 'clear_memory',
        description: 'Clear all memory',
        inputSchema: {
          type: 'object',
          properties: {
            confirm: { type: 'boolean', default: false, description: 'Confirm deletion' }
          }
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'store_memory') {
        return this.storeMemory(request.params.arguments);
      }
      if (request.params.name === 'retrieve_memory') {
        return this.retrieveMemory(request.params.arguments);
      }
      if (request.params.name === 'list_memory') {
        return this.listMemory(request.params.arguments);
      }
      if (request.params.name === 'delete_memory') {
        return this.deleteMemory(request.params.arguments);
      }
      if (request.params.name === 'clear_memory') {
        return this.clearMemory(request.params.arguments);
      }
    });
  }

  async storeMemory(args) {
    const { key, value, persistent = true } = args;
    
    this.memory.set(key, {
      value,
      timestamp: new Date().toISOString(),
      persistent
    });

    if (persistent) {
      this.saveMemory();
    }

    return {
      content: [{
        type: 'text',
        text: `Memory stored successfully\nKey: ${key}\nValue: ${value}\nPersistent: ${persistent}\nTimestamp: ${new Date().toISOString()}`
      }]
    };
  }

  async retrieveMemory(args) {
    const { key } = args;
    
    if (this.memory.has(key)) {
      const data = this.memory.get(key);
      return {
        content: [{
          type: 'text',
          text: `Memory retrieved\nKey: ${key}\nValue: ${data.value}\nStored: ${data.timestamp}`
        }]
      };
    } else {
      return {
        content: [{
          type: 'text',
          text: `Memory not found for key: ${key}`
        }]
      };
    }
  }

  async listMemory(args) {
    const { pattern } = args || {};
    
    let keys = Array.from(this.memory.keys());
    
    if (pattern) {
      const regex = new RegExp(pattern, 'i');
      keys = keys.filter(key => regex.test(key));
    }

    const memoryList = keys.map(key => {
      const data = this.memory.get(key);
      return `${key}: ${data.value.substring(0, 50)}${data.value.length > 50 ? '...' : ''} (${data.timestamp})`;
    });

    return {
      content: [{
        type: 'text',
        text: `Memory keys (${keys.length} total):\n${memoryList.join('\n') || 'No memories found'}`
      }]
    };
  }

  async deleteMemory(args) {
    const { key } = args;
    
    if (this.memory.has(key)) {
      this.memory.delete(key);
      this.saveMemory();
      return {
        content: [{
          type: 'text',
          text: `Memory deleted successfully: ${key}`
        }]
      };
    } else {
      return {
        content: [{
          type: 'text',
          text: `Memory not found for key: ${key}`
        }]
      };
    }
  }

  async clearMemory(args) {
    const { confirm = false } = args || {};
    
    if (!confirm) {
      return {
        content: [{
          type: 'text',
          text: 'Please confirm memory clearing by setting confirm=true'
        }]
      };
    }

    const count = this.memory.size;
    this.memory.clear();
    this.saveMemory();

    return {
      content: [{
        type: 'text',
        text: `All memory cleared successfully. Deleted ${count} entries.`
      }]
    };
  }

  async start() {
    console.log('Starting Memory Local MCP Server...');
    console.log('Tools: store_memory, retrieve_memory, list_memory, delete_memory, clear_memory');
    console.log('Lightweight local memory management with persistence');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new MemoryLocalServer();
server.start().catch(console.error);
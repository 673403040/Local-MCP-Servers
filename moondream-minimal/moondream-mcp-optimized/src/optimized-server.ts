import { Server } from '@modelcontextprotocol/sdk/server/index.js'; 
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'; 
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'; 
import * as fs from 'fs'; 
import * as path from 'path'; 
 
// Optimized Moondream MCP Server - Cursor-style implementation 
class OptimizedMoondreamServer { 
  private server: Server; 
  private modelPath: string; 
 
  constructor() { 
    this.server = new Server({ name: 'moondream-optimized', version: '1.0.0' }, { capabilities: { tools: {} } }); 
    this.modelPath = path.join(__dirname, '..', 'models', 'moondream-quantized.onnx'); 
    this.setupTools(); 
  } 
 
  private setupTools() { 
    this.server.setRequestHandler(ListToolsRequestSchema, async () =
      tools: [{ 
        name: 'analyze_image', 
        description: 'Analyze image with optimized Moondream model', 
        inputSchema: { type: 'object', properties: { image_path: { type: 'string' }, prompt: { type: 'string' } } } 
      }] 
    })); 
  } 
} 

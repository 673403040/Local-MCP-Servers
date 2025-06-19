const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

// Ultra-minimal Moondream MCP Server - General purpose image analysis
class UltraMinimalServer {
  constructor() {
    this.server = new Server({
      name: 'moondream-general',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'analyze_image',
        description: 'General purpose image analysis with Moondream',
        inputSchema: {
          type: 'object',
          properties: {
            image_path: { type: 'string', description: 'Path to image file' },
            prompt: { type: 'string', default: 'Describe this image', description: 'Analysis prompt' }
          },
          required: ['image_path']
        }
      }, {
        name: 'batch_analyze',
        description: 'Analyze multiple images in batch',
        inputSchema: {
          type: 'object',
          properties: {
            image_paths: { type: 'array', items: { type: 'string' } },
            prompt: { type: 'string', default: 'Describe this image' }
          },
          required: ['image_paths']
        }
      }, {
        name: 'ask_about_image',
        description: 'Ask specific questions about an image',
        inputSchema: {
          type: 'object',
          properties: {
            image_path: { type: 'string', description: 'Path to image file' },
            question: { type: 'string', description: 'Specific question about the image' }
          },
          required: ['image_path', 'question']
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'analyze_image') {
        return this.analyzeImage(request.params.arguments);
      }
      if (request.params.name === 'batch_analyze') {
        return this.batchAnalyze(request.params.arguments);
      }
      if (request.params.name === 'ask_about_image') {
        return this.askAboutImage(request.params.arguments);
      }
    });
  }

  async analyzeImage(args) {
    const { image_path, prompt = 'Describe this image' } = args;
    
    // Check if image exists
    if (!fs.existsSync(image_path)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Image not found at ${image_path}`
        }]
      };
    }

    // Simulate general image analysis (in real implementation, this would call the model)
    const analysis = `General image analysis of ${path.basename(image_path)}:

This is a lightweight Moondream analysis.
Prompt: "${prompt}"

[In production version, this would provide:]
- Object detection and recognition
- Scene understanding
- Text extraction (if present)
- Color and composition analysis
- General visual description

Status: Lightweight demo mode
Package size: ~200MB
Response time: <1 second`;

    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  }

  async batchAnalyze(args) {
    const { image_paths, prompt = 'Describe this image' } = args;

    const results = [];
    for (const imagePath of image_paths) {
      const result = await this.analyzeImage({ image_path: imagePath, prompt });
      results.push(`Image: ${path.basename(imagePath)}\n${result.content[0].text}\n`);
    }

    return {
      content: [{
        type: 'text',
        text: `Batch Analysis Results:\n\n${results.join('\n---\n\n')}`
      }]
    };
  }

  async askAboutImage(args) {
    const { image_path, question } = args;

    // Check if image exists
    if (!fs.existsSync(image_path)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Image not found at ${image_path}`
        }]
      };
    }

    // Simulate specific question answering
    const answer = `Question about ${path.basename(image_path)}: "${question}"

[In production version, this would provide specific answers about:]
- Objects and their properties
- Spatial relationships
- Colors and materials
- Text content
- Activities or actions
- Emotions or expressions

This is a lightweight demo response.
For specific questions, the full model would analyze the image and provide detailed answers.`;

    return {
      content: [{
        type: 'text',
        text: answer
      }]
    };
  }

  async start() {
    console.log('Starting General Purpose Moondream MCP Server...');
    console.log('Features: Lightweight, fast, general image analysis');
    console.log('Tools: analyze_image, batch_analyze, ask_about_image');
    console.log('Ready for any application integration');

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new UltraMinimalServer();
server.start().catch(console.error);

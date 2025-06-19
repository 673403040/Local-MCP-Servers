#!/usr/bin/env node

/**
 * Windows-compatible MCP server for Moondream image analysis
 * Simplified version that works without complex Python setup
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Request,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import { spawn } from "child_process";
import { join } from "path";

interface ListToolsRequest extends Request {
  method: "tools/list";
}

interface CallToolRequest extends Request {
  method: "tools/call";
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

class WindowsMoondreamServer {
  private server: Server;
  private pythonProcess: any = null;
  private serverReady = false;

  constructor() {
    this.server = new Server(
      {
        name: "moondream-windows-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {
            test: {
              description: "Test tool to verify server functionality",
              inputSchema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "Test message to echo back"
                  }
                },
                required: ["message"]
              }
            },
            analyze_image: {
              description: "Analyze an image using Moondream model",
              inputSchema: {
                type: "object",
                properties: {
                  image_path: {
                    type: "string",
                    description: "Path to the image file to analyze"
                  },
                  prompt: {
                    type: "string",
                    description: "Analysis prompt: 'caption' for description, 'detect: [object]' for detection, or any question"
                  }
                },
                required: ["image_path", "prompt"]
              }
            }
          },
        },
      }
    );

    this.setupToolHandlers();
    this.server.onerror = (error) => console.error("[MCP Error]", error);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async (request: ListToolsRequest) => {
      return {
        tools: [
          {
            name: "test",
            description: "Test tool to verify server functionality",
            inputSchema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Test message to echo back"
                }
              },
              required: ["message"]
            }
          },
          {
            name: "analyze_image",
            description: "Analyze an image using Moondream model",
            inputSchema: {
              type: "object",
              properties: {
                image_path: {
                  type: "string",
                  description: "Path to the image file to analyze"
                },
                prompt: {
                  type: "string",
                  description: "Analysis prompt: 'caption' for description, 'detect: [object]' for detection, or any question"
                }
              },
              required: ["image_path", "prompt"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      switch (request.params.name) {
        case "test": {
          const message = String(request.params.arguments?.message);
          if (!message) {
            throw new Error("Message is required");
          }

          return {
            content: [{
              type: "text",
              text: `✅ Moondream MCP Server Test Successful! Message: ${message}`
            }]
          };
        }

        case "analyze_image": {
          const imagePath = String(request.params.arguments?.image_path);
          const prompt = String(request.params.arguments?.prompt);

          if (!imagePath || !prompt) {
            throw new Error("Image path and prompt are required");
          }

          try {
            // Verify image exists
            await fs.access(imagePath);

            // For now, return a mock response since we're having dependency issues
            // In a full implementation, this would call the actual Moondream model
            let mockResponse = "";
            
            if (prompt.toLowerCase() === "caption" || prompt.toLowerCase() === "generate caption") {
              mockResponse = "🖼️ Mock Caption: This appears to be an image that would be analyzed by the Moondream vision model. The actual analysis would provide detailed descriptions of objects, scenes, and activities visible in the image.";
            } else if (prompt.toLowerCase().startsWith("detect:")) {
              const object = prompt.slice(7).trim();
              mockResponse = `🔍 Mock Detection: Searching for '${object}' in the image. The actual model would return coordinates and confidence scores for detected objects.`;
            } else {
              mockResponse = `💭 Mock Analysis: Question: "${prompt}"\nAnswer: The Moondream model would analyze the image content and provide a detailed response based on what it observes in the image.`;
            }

            return {
              content: [{
                type: "text",
                text: `${mockResponse}\n\n📝 Note: This is a mock response. The server is ready for integration with the actual Moondream model.`
              }]
            };
          } catch (error: unknown) {
            console.error("Error analyzing image:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to analyze image: ${errorMessage}`);
          }
        }

        default: {
          throw new Error("Unknown tool");
        }
      }
    });
  }

  async run() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("🌙 Moondream Windows MCP server running on stdio");
      console.error("✅ Server ready for image analysis requests");

      // Handle cleanup on exit
      process.on('SIGINT', async () => {
        await this.cleanup();
        await this.server.close();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        await this.cleanup();
        await this.server.close();
        process.exit(0);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  async cleanup() {
    if (this.pythonProcess) {
      this.pythonProcess.kill();
    }
  }
}

const server = new WindowsMoondreamServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

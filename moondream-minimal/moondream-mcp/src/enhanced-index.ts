#!/usr/bin/env node

/**
 * Enhanced Moondream MCP Server with real model integration and batch processing
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Request,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import { WindowsPythonSetup } from "./utils/windows-python-setup.js";
import { join, extname } from "path";

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

class EnhancedMoondreamServer {
  private server: Server;
  private pythonSetup: WindowsPythonSetup;
  private serverReady = false;

  constructor() {
    this.pythonSetup = new WindowsPythonSetup();
    this.server = new Server(
      {
        name: "enhanced-moondream-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {
            test: {
              description: "Test server functionality",
              inputSchema: {
                type: "object",
                properties: {
                  message: { type: "string", description: "Test message" }
                },
                required: ["message"]
              }
            },
            analyze_image: {
              description: "Analyze a single image using Moondream model",
              inputSchema: {
                type: "object",
                properties: {
                  image_path: { type: "string", description: "Path to image file" },
                  prompt: { type: "string", description: "Analysis prompt" }
                },
                required: ["image_path", "prompt"]
              }
            },
            batch_analyze_images: {
              description: "Analyze multiple images in batch",
              inputSchema: {
                type: "object",
                properties: {
                  directory_path: { type: "string", description: "Directory containing images" },
                  prompt: { type: "string", description: "Analysis prompt for all images" },
                  file_pattern: { type: "string", description: "File pattern (e.g., '*.jpg')", default: "*" },
                  max_images: { type: "number", description: "Maximum number of images to process", default: 10 }
                },
                required: ["directory_path", "prompt"]
              }
            },
            analyze_comfyui_outputs: {
              description: "Analyze ComfyUI output images with detailed reporting",
              inputSchema: {
                type: "object",
                properties: {
                  output_directory: { type: "string", description: "ComfyUI output directory path" },
                  analysis_type: { 
                    type: "string", 
                    description: "Type of analysis: 'quality', 'content', 'comparison'",
                    default: "content"
                  }
                },
                required: ["output_directory"]
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
            description: "Test server functionality",
            inputSchema: {
              type: "object",
              properties: {
                message: { type: "string", description: "Test message" }
              },
              required: ["message"]
            }
          },
          {
            name: "analyze_image",
            description: "Analyze a single image using Moondream model",
            inputSchema: {
              type: "object",
              properties: {
                image_path: { type: "string", description: "Path to image file" },
                prompt: { type: "string", description: "Analysis prompt" }
              },
              required: ["image_path", "prompt"]
            }
          },
          {
            name: "batch_analyze_images",
            description: "Analyze multiple images in batch",
            inputSchema: {
              type: "object",
              properties: {
                directory_path: { type: "string", description: "Directory containing images" },
                prompt: { type: "string", description: "Analysis prompt for all images" },
                file_pattern: { type: "string", description: "File pattern (e.g., '*.jpg')" },
                max_images: { type: "number", description: "Maximum number of images to process" }
              },
              required: ["directory_path", "prompt"]
            }
          },
          {
            name: "analyze_comfyui_outputs",
            description: "Analyze ComfyUI output images with detailed reporting",
            inputSchema: {
              type: "object",
              properties: {
                output_directory: { type: "string", description: "ComfyUI output directory path" },
                analysis_type: { type: "string", description: "Type of analysis: 'quality', 'content', 'comparison'" }
              },
              required: ["output_directory"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      switch (request.params.name) {
        case "test": {
          const message = String(request.params.arguments?.message);
          return {
            content: [{
              type: "text",
              text: `✅ Enhanced Moondream Server Test Successful! Message: ${message}\n🔥 Real model integration: ${this.serverReady ? 'Ready' : 'Loading...'}`
            }]
          };
        }

        case "analyze_image": {
          return await this.handleSingleImageAnalysis(request.params.arguments);
        }

        case "batch_analyze_images": {
          return await this.handleBatchImageAnalysis(request.params.arguments);
        }

        case "analyze_comfyui_outputs": {
          return await this.handleComfyUIAnalysis(request.params.arguments);
        }

        default: {
          throw new Error("Unknown tool");
        }
      }
    });
  }

  private async handleSingleImageAnalysis(args: any) {
    const imagePath = String(args?.image_path);
    const prompt = String(args?.prompt);

    if (!imagePath || !prompt) {
      throw new Error("Image path and prompt are required");
    }

    try {
      await fs.access(imagePath);
      
      if (!this.serverReady) {
        return {
          content: [{
            type: "text",
            text: "⏳ Moondream model is still loading. Please try again in a moment."
          }]
        };
      }

      const result = await this.analyzeImage(imagePath, prompt);
      
      return {
        content: [{
          type: "text",
          text: `🖼️ **Image Analysis Result**\n\n📁 **File:** ${imagePath}\n❓ **Prompt:** ${prompt}\n\n🤖 **Analysis:**\n${result}`
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to analyze image: ${errorMessage}`);
    }
  }

  private async handleBatchImageAnalysis(args: any) {
    const directoryPath = String(args?.directory_path);
    const prompt = String(args?.prompt);
    const filePattern = String(args?.file_pattern || "*");
    const maxImages = Number(args?.max_images || 10);

    try {
      const imageFiles = await this.findImageFiles(directoryPath, filePattern, maxImages);
      
      if (imageFiles.length === 0) {
        return {
          content: [{
            type: "text",
            text: `📁 No images found in directory: ${directoryPath}`
          }]
        };
      }

      let results = `🔄 **Batch Image Analysis**\n\n📁 **Directory:** ${directoryPath}\n📊 **Found ${imageFiles.length} images**\n❓ **Prompt:** ${prompt}\n\n`;

      for (let i = 0; i < imageFiles.length; i++) {
        const imagePath = imageFiles[i];
        try {
          const result = await this.analyzeImage(imagePath, prompt);
          results += `\n---\n\n🖼️ **Image ${i + 1}:** ${imagePath}\n🤖 **Result:** ${result}\n`;
        } catch (error) {
          results += `\n---\n\n🖼️ **Image ${i + 1}:** ${imagePath}\n❌ **Error:** ${error}\n`;
        }
      }

      return {
        content: [{
          type: "text",
          text: results
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Batch analysis failed: ${errorMessage}`);
    }
  }

  private async handleComfyUIAnalysis(args: any) {
    const outputDirectory = String(args?.output_directory);
    const analysisType = String(args?.analysis_type || "content");

    try {
      const imageFiles = await this.findImageFiles(outputDirectory, "*.{png,jpg,jpeg}", 20);
      
      if (imageFiles.length === 0) {
        return {
          content: [{
            type: "text",
            text: `📁 No output images found in: ${outputDirectory}`
          }]
        };
      }

      let prompt = "";
      switch (analysisType) {
        case "quality":
          prompt = "Evaluate the image quality, sharpness, and overall visual appeal. Rate from 1-10.";
          break;
        case "content":
          prompt = "Describe what you see in this image. Focus on characters, objects, and scene composition.";
          break;
        case "comparison":
          prompt = "Analyze this image for consistency with other generated images. Note style, lighting, and character features.";
          break;
        default:
          prompt = "Describe this image in detail.";
      }

      let report = `🎨 **ComfyUI Output Analysis Report**\n\n📁 **Directory:** ${outputDirectory}\n📊 **Analysis Type:** ${analysisType}\n🖼️ **Images Analyzed:** ${imageFiles.length}\n\n`;

      for (let i = 0; i < imageFiles.length; i++) {
        const imagePath = imageFiles[i];
        try {
          const result = await this.analyzeImage(imagePath, prompt);
          report += `\n### 🖼️ Image ${i + 1}: ${imagePath.split('\\').pop()}\n${result}\n\n`;
        } catch (error) {
          report += `\n### ❌ Image ${i + 1}: ${imagePath.split('\\').pop()}\nAnalysis failed: ${error}\n\n`;
        }
      }

      return {
        content: [{
          type: "text",
          text: report
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`ComfyUI analysis failed: ${errorMessage}`);
    }
  }

  private async findImageFiles(directory: string, pattern: string, maxFiles: number): Promise<string[]> {
    try {
      const files = await fs.readdir(directory);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'];
      
      const imageFiles = files
        .filter(file => imageExtensions.includes(extname(file).toLowerCase()))
        .slice(0, maxFiles)
        .map(file => join(directory, file));
      
      return imageFiles;
    } catch (error) {
      throw new Error(`Failed to read directory ${directory}: ${error}`);
    }
  }

  private async analyzeImage(imagePath: string, prompt: string): Promise<string> {
    try {
      // Read and encode image
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");

      // Determine endpoint based on prompt
      let endpoint = "query";
      let body: any = {
        image_url: `data:image/jpeg;base64,${base64Image}`,
        question: prompt
      };

      if (prompt.toLowerCase() === "caption" || prompt.toLowerCase() === "generate caption") {
        endpoint = "caption";
        body = { image_url: `data:image/jpeg;base64,${base64Image}` };
      } else if (prompt.toLowerCase().startsWith("detect:")) {
        endpoint = "detect";
        body = {
          image_url: `data:image/jpeg;base64,${base64Image}`,
          object: prompt.slice(7).trim()
        };
      }

      // Query the model server
      const response = await fetch(`http://127.0.0.1:3475/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Model server error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (endpoint === "caption") {
        return result.caption;
      } else if (endpoint === "detect") {
        return `Detection results: ${JSON.stringify(result.objects)}`;
      } else {
        return result.answer;
      }
    } catch (error) {
      throw new Error(`Image analysis failed: ${error}`);
    }
  }

  async run() {
    try {
      console.error("🚀 Starting Enhanced Moondream MCP Server...");
      
      // Start Python setup in background
      this.pythonSetup.setup()
        .then(() => {
          this.serverReady = true;
          console.error("✅ Moondream model loaded and ready!");
        })
        .catch((error) => {
          console.error("❌ Failed to setup Moondream model:", error);
        });

      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("🌙 Enhanced Moondream MCP server running on stdio");

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
    this.pythonSetup.cleanup();
  }
}

const server = new EnhancedMoondreamServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

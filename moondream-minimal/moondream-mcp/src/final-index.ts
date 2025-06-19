#!/usr/bin/env node

/**
 * Final Moondream MCP Server with real model and batch processing
 * Optimized for Windows with fallback to mock responses
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Request,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import { SimplePythonSetup } from "./utils/simple-python-setup.js";
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

class FinalMoondreamServer {
  private server: Server;
  private pythonSetup: SimplePythonSetup;
  private modelMode: 'loading' | 'ready' | 'mock' = 'loading';

  constructor() {
    this.pythonSetup = new SimplePythonSetup();
    this.server = new Server(
      {
        name: "final-moondream-server",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {
            test: {
              description: "Test server functionality and model status",
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
                  max_images: { type: "number", description: "Maximum images to process (default: 10)" }
                },
                required: ["directory_path", "prompt"]
              }
            },
            analyze_comfyui_batch: {
              description: "Specialized batch analysis for ComfyUI generated images",
              inputSchema: {
                type: "object",
                properties: {
                  output_directory: { type: "string", description: "ComfyUI output directory" },
                  analysis_type: { 
                    type: "string", 
                    description: "Analysis type: 'quality', 'content', 'character_consistency'",
                    default: "content"
                  },
                  max_images: { type: "number", description: "Maximum images to analyze (default: 20)" }
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
            description: "Test server functionality and model status",
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
                max_images: { type: "number", description: "Maximum images to process" }
              },
              required: ["directory_path", "prompt"]
            }
          },
          {
            name: "analyze_comfyui_batch",
            description: "Specialized batch analysis for ComfyUI generated images",
            inputSchema: {
              type: "object",
              properties: {
                output_directory: { type: "string", description: "ComfyUI output directory" },
                analysis_type: { type: "string", description: "Analysis type: 'quality', 'content', 'character_consistency'" },
                max_images: { type: "number", description: "Maximum images to analyze" }
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
          const statusEmoji = this.modelMode === 'ready' ? '🔥' : this.modelMode === 'loading' ? '⏳' : '🤖';
          const statusText = this.modelMode === 'ready' ? 'Real Model Ready' : 
                           this.modelMode === 'loading' ? 'Model Loading...' : 'Mock Mode';
          
          return {
            content: [{
              type: "text",
              text: `✅ Final Moondream Server Test Successful!\n📨 Message: ${message}\n${statusEmoji} Status: ${statusText}\n🚀 Batch processing: Available\n🎨 ComfyUI integration: Ready`
            }]
          };
        }

        case "analyze_image": {
          return await this.handleSingleImageAnalysis(request.params.arguments);
        }

        case "batch_analyze_images": {
          return await this.handleBatchImageAnalysis(request.params.arguments);
        }

        case "analyze_comfyui_batch": {
          return await this.handleComfyUIBatchAnalysis(request.params.arguments);
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
      
      const result = await this.analyzeImage(imagePath, prompt);
      
      return {
        content: [{
          type: "text",
          text: `🖼️ **Image Analysis Result**\n\n📁 **File:** ${imagePath}\n❓ **Prompt:** ${prompt}\n🤖 **Mode:** ${this.modelMode}\n\n**Analysis:**\n${result}`
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
    const maxImages = Number(args?.max_images || 10);

    try {
      const imageFiles = await this.findImageFiles(directoryPath, maxImages);
      
      if (imageFiles.length === 0) {
        return {
          content: [{
            type: "text",
            text: `📁 No images found in directory: ${directoryPath}`
          }]
        };
      }

      let results = `🔄 **Batch Image Analysis Report**\n\n📁 **Directory:** ${directoryPath}\n📊 **Images Found:** ${imageFiles.length}\n❓ **Prompt:** ${prompt}\n🤖 **Mode:** ${this.modelMode}\n\n`;

      for (let i = 0; i < imageFiles.length; i++) {
        const imagePath = imageFiles[i];
        const fileName = imagePath.split('\\').pop() || imagePath.split('/').pop();
        
        try {
          const result = await this.analyzeImage(imagePath, prompt);
          results += `### 🖼️ Image ${i + 1}: ${fileName}\n${result}\n\n---\n\n`;
        } catch (error) {
          results += `### ❌ Image ${i + 1}: ${fileName}\n**Error:** ${error}\n\n---\n\n`;
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

  private async handleComfyUIBatchAnalysis(args: any) {
    const outputDirectory = String(args?.output_directory);
    const analysisType = String(args?.analysis_type || "content");
    const maxImages = Number(args?.max_images || 20);

    try {
      const imageFiles = await this.findImageFiles(outputDirectory, maxImages);
      
      if (imageFiles.length === 0) {
        return {
          content: [{
            type: "text",
            text: `📁 No images found in ComfyUI output directory: ${outputDirectory}`
          }]
        };
      }

      // Generate specialized prompts for ComfyUI analysis
      let prompt = "";
      switch (analysisType) {
        case "quality":
          prompt = "Evaluate this generated image's quality, sharpness, artifacts, and overall visual appeal. Rate the technical quality from 1-10 and explain your assessment.";
          break;
        case "content":
          prompt = "Describe what you see in this generated image. Focus on characters, objects, scene composition, style, and artistic elements.";
          break;
        case "character_consistency":
          prompt = "Analyze this character image for consistency in features, proportions, style, and quality. Note any inconsistencies or artifacts.";
          break;
        default:
          prompt = "Analyze this generated image and provide detailed feedback.";
      }

      let report = `🎨 **ComfyUI Batch Analysis Report**\n\n📁 **Output Directory:** ${outputDirectory}\n📊 **Analysis Type:** ${analysisType}\n🖼️ **Images Analyzed:** ${imageFiles.length}\n🤖 **Mode:** ${this.modelMode}\n\n`;

      let qualityScores = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const imagePath = imageFiles[i];
        const fileName = imagePath.split('\\').pop() || imagePath.split('/').pop();
        
        try {
          const result = await this.analyzeImage(imagePath, prompt);
          
          // Extract quality score if doing quality analysis
          if (analysisType === "quality") {
            const scoreMatch = result.match(/(\d+)\/10/);
            if (scoreMatch) {
              qualityScores.push(parseInt(scoreMatch[1]));
            }
          }
          
          report += `### 🖼️ ${fileName}\n${result}\n\n---\n\n`;
        } catch (error) {
          report += `### ❌ ${fileName}\n**Analysis failed:** ${error}\n\n---\n\n`;
        }
      }

      // Add summary for quality analysis
      if (analysisType === "quality" && qualityScores.length > 0) {
        const avgScore = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
        const maxScore = Math.max(...qualityScores);
        const minScore = Math.min(...qualityScores);
        
        report += `## 📊 **Quality Summary**\n\n- **Average Score:** ${avgScore.toFixed(1)}/10\n- **Best Score:** ${maxScore}/10\n- **Lowest Score:** ${minScore}/10\n- **Total Images:** ${qualityScores.length}\n\n`;
      }

      return {
        content: [{
          type: "text",
          text: report
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`ComfyUI batch analysis failed: ${errorMessage}`);
    }
  }

  private async findImageFiles(directory: string, maxFiles: number): Promise<string[]> {
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
    if (this.modelMode === 'ready') {
      return await this.analyzeWithRealModel(imagePath, prompt);
    } else {
      return await this.analyzeWithMockModel(imagePath, prompt);
    }
  }

  private async analyzeWithRealModel(imagePath: string, prompt: string): Promise<string> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString("base64");

      let endpoint = "query";
      let body: any = {
        image_url: `data:image/jpeg;base64,${base64Image}`,
        question: prompt
      };

      if (prompt.toLowerCase().includes("caption") || prompt.toLowerCase().includes("describe")) {
        endpoint = "caption";
        body = { image_url: `data:image/jpeg;base64,${base64Image}` };
      } else if (prompt.toLowerCase().startsWith("detect")) {
        endpoint = "detect";
        body = {
          image_url: `data:image/jpeg;base64,${base64Image}`,
          object: prompt.slice(7).trim()
        };
      }

      const response = await fetch(`http://127.0.0.1:3475/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Model server error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (endpoint === "caption") {
        return result.caption;
      } else if (endpoint === "detect") {
        return `Detection: ${JSON.stringify(result.objects)}`;
      } else {
        return result.answer;
      }
    } catch (error) {
      // Fallback to mock if real model fails
      this.modelMode = 'mock';
      return await this.analyzeWithMockModel(imagePath, prompt);
    }
  }

  private async analyzeWithMockModel(imagePath: string, prompt: string): Promise<string> {
    const fileName = imagePath.split('\\').pop() || imagePath.split('/').pop();
    
    if (prompt.toLowerCase().includes("quality")) {
      const score = Math.floor(Math.random() * 3) + 7; // 7-9 range
      return `**Quality Assessment:** This generated image shows good technical quality with a score of ${score}/10. The image appears to have good composition and clarity. Note: This is a mock analysis - real model will provide detailed quality assessment.`;
    } else if (prompt.toLowerCase().includes("character")) {
      return `**Character Analysis:** This appears to be a character image with consistent features and proportions. The style is coherent and the character design shows good attention to detail. Note: This is a mock analysis - real model will provide detailed character assessment.`;
    } else if (prompt.toLowerCase().includes("detect")) {
      const object = prompt.slice(7).trim();
      return `**Detection Result:** Searching for '${object}' in the image. Mock detection indicates potential presence with moderate confidence. Real model will provide precise detection with coordinates.`;
    } else {
      return `**Image Analysis:** This image (${fileName}) contains visual elements that would be analyzed in detail by the Moondream model. The analysis would include object identification, scene description, and contextual understanding. Note: This is a mock response - real model integration in progress.`;
    }
  }

  async run() {
    try {
      console.error("🚀 Starting Final Moondream MCP Server...");
      
      // Start Python setup in background
      this.pythonSetup.setup()
        .then(() => {
          if (this.pythonSetup.isReady()) {
            this.modelMode = 'ready';
            console.error("✅ Real Moondream model loaded and ready!");
          } else {
            this.modelMode = 'mock';
            console.error("⚠️ Running in mock mode - real model setup failed");
          }
        })
        .catch((error) => {
          this.modelMode = 'mock';
          console.error("⚠️ Running in mock mode due to setup error:", error.message);
        });

      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("🌙 Final Moondream MCP server running on stdio");
      console.error("🎯 Features: Single analysis, Batch processing, ComfyUI integration");

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

const server = new FinalMoondreamServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

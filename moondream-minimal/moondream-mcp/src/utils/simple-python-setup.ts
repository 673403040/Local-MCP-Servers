import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { access, mkdir, writeFile } from 'fs/promises';

const execAsync = promisify(exec);

export class SimplePythonSetup {
  private modelPath: string;
  private moondreamProcess: any = null;
  private serverPort = 3475;
  private serverReady = false;

  constructor() {
    // Use relative path structure: moondream-mcp-windows-augment/moondream-mcp/
    const projectRoot = process.cwd();
    this.modelPath = join(projectRoot, 'models');

    console.error('[Setup] Simple Python Setup initialized');
    console.error(`[Setup] Project root: ${projectRoot}`);
    console.error(`[Setup] Model path: ${this.modelPath}`);
    console.error('[Setup] Configured for pre-downloaded model support');
  }

  async checkPythonAndPip(): Promise<boolean> {
    try {
      const { stdout: pythonVersion } = await execAsync('python --version');
      console.error(`[Setup] Found Python: ${pythonVersion.trim()}`);
      
      const { stdout: pipVersion } = await execAsync('pip --version');
      console.error(`[Setup] Found pip: ${pipVersion.trim()}`);
      
      return true;
    } catch (error) {
      console.error('[Setup] Python or pip not found');
      return false;
    }
  }

  async installRequiredPackages(): Promise<void> {
    try {
      console.error('[Setup] Installing required packages...');
      
      // Install packages one by one to handle potential issues
      const packages = [
        'torch --index-url https://download.pytorch.org/whl/cpu',
        'transformers',
        'pillow',
        'requests',
        'flask',
        'flask-cors'
      ];
      
      for (const pkg of packages) {
        try {
          console.error(`[Setup] Installing ${pkg.split(' ')[0]}...`);
          await execAsync(`pip install ${pkg}`, { timeout: 300000 }); // 5 minute timeout
        } catch (error) {
          console.error(`[Setup] Warning: Failed to install ${pkg}, continuing...`);
        }
      }
      
      console.error('[Setup] Package installation completed');
    } catch (error) {
      console.error(`[Setup] Package installation failed: ${error}`);
      // Don't throw error, continue with existing packages
    }
  }

  async createSimpleMoondreamServer(): Promise<void> {
    try {
      await mkdir(this.modelPath, { recursive: true });
      
      // Create a simplified Flask server
      const serverCode = `
import os
import sys
import base64
import io
import json
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global model variables
model = None
tokenizer = None
model_loaded = False

def load_model():
    global model, tokenizer, model_loaded
    try:
        print("Loading Moondream model...")
        
        # Try to import required packages
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        model_id = "vikhyatk/moondream2"
        revision = "2024-04-02"
        local_model_path = "./models/moondream2"

        # Check for local pre-downloaded model first
        if os.path.exists(local_model_path) and os.path.exists(local_model_path + "/config.json"):
            print("Using pre-downloaded local model...")
            model = AutoModelForCausalLM.from_pretrained(
                local_model_path,
                trust_remote_code=True,
                torch_dtype=torch.float32,
                device_map="cpu",
                local_files_only=True
            )
            tokenizer = AutoTokenizer.from_pretrained(
                local_model_path,
                local_files_only=True
            )
        else:
            print("Downloading model (this may take a while on first run)...")
            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                trust_remote_code=True,
                revision=revision,
                torch_dtype=torch.float32,  # Use float32 for CPU compatibility
                device_map="cpu"  # Force CPU usage for compatibility
            )
            tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision)
        
        model_loaded = True
        print("Model loaded successfully!")
        return True
    except ImportError as e:
        print(f"Missing required packages: {e}")
        print("Please install: pip install torch transformers pillow")
        return False
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def process_image(image_data):
    try:
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return image
    except Exception as e:
        raise ValueError(f"Failed to process image: {e}")

@app.route('/caption', methods=['POST'])
def caption():
    try:
        if not model_loaded:
            return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500
            
        data = request.json
        image_url = data.get('image_url', '')
        
        if not image_url:
            return jsonify({'error': 'No image_url provided'}), 400
            
        image = process_image(image_url)
        
        # Generate caption
        enc_image = model.encode_image(image)
        caption = model.answer_question(enc_image, "Describe this image.", tokenizer)
        
        return jsonify({'caption': caption})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def query():
    try:
        if not model_loaded:
            return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500
            
        data = request.json
        image_url = data.get('image_url', '')
        question = data.get('question', '')
        
        if not image_url or not question:
            return jsonify({'error': 'Both image_url and question are required'}), 400
            
        image = process_image(image_url)
        
        # Answer question
        enc_image = model.encode_image(image)
        answer = model.answer_question(enc_image, question, tokenizer)
        
        return jsonify({'answer': answer})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/detect', methods=['POST'])
def detect():
    try:
        if not model_loaded:
            return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500
            
        data = request.json
        image_url = data.get('image_url', '')
        object_name = data.get('object', '')
        
        if not image_url or not object_name:
            return jsonify({'error': 'Both image_url and object are required'}), 400
            
        image = process_image(image_url)
        
        # Detection query
        question = f"Is there a {object_name} in this image? If yes, describe where it is located."
        enc_image = model.encode_image(image)
        answer = model.answer_question(enc_image, question, tokenizer)
        
        # Simple detection result
        detected = "yes" in answer.lower() or object_name.lower() in answer.lower()
        
        return jsonify({
            'objects': [{'name': object_name, 'detected': detected, 'description': answer}]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy', 
        'model_loaded': model_loaded,
        'message': 'Moondream server is running'
    })

if __name__ == '__main__':
    print("Starting Moondream server...")
    print("Loading model (this may take several minutes on first run)...")

    if load_model():
        print(f"Server starting on port ${this.serverPort}")
        app.run(host='127.0.0.1', port=${this.serverPort}, debug=False, threaded=True)
    else:
        print("Failed to load model. Server will run in error mode.")
        print("You can still test the API endpoints, but they will return errors.")
        app.run(host='127.0.0.1', port=${this.serverPort}, debug=False, threaded=True)
`;

      const serverPath = join(this.modelPath, 'simple_moondream_server.py');
      await writeFile(serverPath, serverCode);
      
      console.error('[Setup] Simple Moondream server script created');
    } catch (error) {
      throw new Error(`Failed to create server script: ${error}`);
    }
  }

  async startMoondreamServer(): Promise<void> {
    try {
      const serverPath = join(this.modelPath, 'simple_moondream_server.py');
      
      console.error('[Setup] Starting Simple Moondream server...');
      console.error('[Setup] This may take several minutes on first run (downloading model)...');
      
      this.moondreamProcess = spawn('python', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.modelPath
      });

      this.moondreamProcess.stdout.on('data', (data: Buffer) => {
        console.error(`[Moondream] ${data.toString()}`);
      });

      this.moondreamProcess.stderr.on('data', (data: Buffer) => {
        console.error(`[Moondream] ${data.toString()}`);
      });

      this.moondreamProcess.on('error', (error: Error) => {
        console.error(`[Moondream] Process error: ${error}`);
      });

      // Wait for server to start (longer timeout for model loading)
      await this.waitForServer();
      
    } catch (error) {
      console.error(`[Setup] Failed to start server: ${error}`);
      // Don't throw error, let the server run in mock mode
    }
  }

  private async waitForServer(): Promise<void> {
    const maxAttempts = 180; // 3 minutes
    let attempts = 0;
    
    console.error('[Setup] Waiting for server to start...');
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://127.0.0.1:${this.serverPort}/health`);
        if (response.ok) {
          const result = await response.json();
          console.error(`[Setup] Server health check: ${JSON.stringify(result)}`);
          this.serverReady = true;
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      attempts++;
      if (attempts % 30 === 0) {
        console.error(`[Setup] Still waiting... (${attempts}/180 attempts)`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.error('[Setup] Server did not respond within timeout, but continuing...');
  }

  async setup(): Promise<void> {
    if (!await this.checkPythonAndPip()) {
      throw new Error('Python and pip are required');
    }
    
    await this.installRequiredPackages();
    await this.createSimpleMoondreamServer();
    await this.startMoondreamServer();
  }

  isReady(): boolean {
    return this.serverReady;
  }

  cleanup(): void {
    if (this.moondreamProcess) {
      this.moondreamProcess.kill();
      this.moondreamProcess = null;
    }
  }
}

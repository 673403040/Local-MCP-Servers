import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { access, mkdir, writeFile } from 'fs/promises';
import { constants } from 'fs';

const execAsync = promisify(exec);

export class WindowsPythonSetup {
  private venvPath: string;
  private modelPath: string;
  private pythonCommand: string;
  private pipCommand: string;
  private moondreamProcess: any = null;
  private serverPort = 3475;

  constructor() {
    // Use project directory for better Windows compatibility
    const projectRoot = process.cwd();
    this.venvPath = join(projectRoot, 'python-env');
    this.modelPath = join(projectRoot, 'models');
    
    this.pythonCommand = join(this.venvPath, 'Scripts', 'python.exe');
    this.pipCommand = join(this.venvPath, 'Scripts', 'pip.exe');
    
    console.error('[Setup] Windows Python Setup initialized');
    console.error(`[Setup] Project root: ${projectRoot}`);
    console.error(`[Setup] Venv path: ${this.venvPath}`);
    console.error(`[Setup] Model path: ${this.modelPath}`);
  }

  async checkPythonInstallation(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('python --version');
      console.error(`[Setup] Found Python: ${stdout.trim()}`);
      return true;
    } catch (error) {
      console.error('[Setup] Python not found in PATH');
      return false;
    }
  }

  async setupVirtualEnvironment(): Promise<void> {
    try {
      // Check if venv already exists and is valid
      const pythonExists = await access(this.pythonCommand)
        .then(() => true)
        .catch(() => false);
      
      if (pythonExists) {
        console.error('[Setup] Using existing virtual environment');
        return;
      }

      console.error('[Setup] Creating virtual environment...');
      
      // Create virtual environment using built-in venv module
      await execAsync(`python -m venv "${this.venvPath}"`);
      
      console.error('[Setup] Virtual environment created successfully');
    } catch (error) {
      throw new Error(`Failed to setup virtual environment: ${error}`);
    }
  }

  async installDependencies(): Promise<void> {
    try {
      console.error('[Setup] Installing Python dependencies...');
      
      // Upgrade pip first
      await execAsync(`"${this.pipCommand}" install --upgrade pip`);
      
      // Install required packages
      const packages = [
        'torch',
        'torchvision', 
        'transformers',
        'pillow',
        'requests',
        'flask',
        'flask-cors'
      ];
      
      for (const pkg of packages) {
        console.error(`[Setup] Installing ${pkg}...`);
        await execAsync(`"${this.pipCommand}" install ${pkg}`);
      }
      
      console.error('[Setup] All dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error}`);
    }
  }

  async createMoondreamServer(): Promise<void> {
    try {
      // Ensure models directory exists
      await mkdir(this.modelPath, { recursive: true });
      
      // Create a simple Flask server for Moondream
      const serverCode = `
import os
import sys
import base64
import io
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)
CORS(app)

# Global model variables
model = None
tokenizer = None

def load_model():
    global model, tokenizer
    try:
        print("Loading Moondream model...")
        model_id = "vikhyatk/moondream2"
        revision = "2024-04-02"
        
        model = AutoModelForCausalLM.from_pretrained(
            model_id, 
            trust_remote_code=True, 
            revision=revision,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else "cpu"
        )
        tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision)
        
        print("Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def process_image(image_data):
    try:
        # Decode base64 image
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return image
    except Exception as e:
        raise ValueError(f"Failed to process image: {e}")

@app.route('/caption', methods=['POST'])
def caption():
    try:
        data = request.json
        image_url = data.get('image_url', '')
        
        if not image_url:
            return jsonify({'error': 'No image_url provided'}), 400
            
        image = process_image(image_url)
        
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
        # Generate caption
        enc_image = model.encode_image(image)
        caption = model.answer_question(enc_image, "Describe this image.", tokenizer)
        
        return jsonify({'caption': caption})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def query():
    try:
        data = request.json
        image_url = data.get('image_url', '')
        question = data.get('question', '')
        
        if not image_url or not question:
            return jsonify({'error': 'Both image_url and question are required'}), 400
            
        image = process_image(image_url)
        
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
        # Answer question
        enc_image = model.encode_image(image)
        answer = model.answer_question(enc_image, question, tokenizer)
        
        return jsonify({'answer': answer})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.json
        image_url = data.get('image_url', '')
        object_name = data.get('object', '')
        
        if not image_url or not object_name:
            return jsonify({'error': 'Both image_url and object are required'}), 400
            
        image = process_image(image_url)
        
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
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
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

if __name__ == '__main__':
    print("Starting Moondream server...")
    if load_model():
        print(f"Server starting on port ${this.serverPort}")
        app.run(host='127.0.0.1', port=${this.serverPort}, debug=False)
    else:
        print("Failed to load model, exiting...")
        sys.exit(1)
`;

      const serverPath = join(this.modelPath, 'moondream_server.py');
      await writeFile(serverPath, serverCode);
      
      console.error('[Setup] Moondream server script created');
    } catch (error) {
      throw new Error(`Failed to create Moondream server: ${error}`);
    }
  }

  async startMoondreamServer(): Promise<void> {
    try {
      const serverPath = join(this.modelPath, 'moondream_server.py');
      
      console.error('[Setup] Starting Moondream server...');
      
      this.moondreamProcess = spawn(this.pythonCommand, [serverPath], {
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

      // Wait for server to start
      await this.waitForServer();
      
    } catch (error) {
      throw new Error(`Failed to start Moondream server: ${error}`);
    }
  }

  private async waitForServer(): Promise<void> {
    const maxAttempts = 60; // 60 seconds
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://127.0.0.1:${this.serverPort}/health`);
        if (response.ok) {
          console.error('[Setup] Moondream server is ready!');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Moondream server failed to start within 60 seconds');
  }

  async setup(): Promise<void> {
    if (!await this.checkPythonInstallation()) {
      throw new Error('Python is not installed or not in PATH');
    }
    
    await this.setupVirtualEnvironment();
    await this.installDependencies();
    await this.createMoondreamServer();
    await this.startMoondreamServer();
  }

  cleanup(): void {
    if (this.moondreamProcess) {
      this.moondreamProcess.kill();
      this.moondreamProcess = null;
    }
  }
}

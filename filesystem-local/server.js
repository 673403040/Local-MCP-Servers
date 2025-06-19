const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

// Lightweight Filesystem MCP Server
class FilesystemLocalServer {
  constructor() {
    this.server = new Server({
      name: 'filesystem-local',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    this.allowedPaths = ['C:\\', 'D:\\', 'E:\\', 'F:\\'];
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'read_file',
        description: 'Read content from a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path to read' },
            encoding: { type: 'string', default: 'utf8', description: 'File encoding' }
          },
          required: ['path']
        }
      }, {
        name: 'write_file',
        description: 'Write content to a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path to write' },
            content: { type: 'string', description: 'Content to write' },
            encoding: { type: 'string', default: 'utf8', description: 'File encoding' }
          },
          required: ['path', 'content']
        }
      }, {
        name: 'list_directory',
        description: 'List files and directories',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Directory path to list' },
            recursive: { type: 'boolean', default: false, description: 'List recursively' }
          },
          required: ['path']
        }
      }, {
        name: 'create_directory',
        description: 'Create a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Directory path to create' }
          },
          required: ['path']
        }
      }, {
        name: 'delete_file',
        description: 'Delete a file or directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to delete' },
            recursive: { type: 'boolean', default: false, description: 'Delete recursively for directories' }
          },
          required: ['path']
        }
      }, {
        name: 'file_info',
        description: 'Get file or directory information',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to get info for' }
          },
          required: ['path']
        }
      }, {
        name: 'search_files',
        description: 'Search for files by pattern',
        inputSchema: {
          type: 'object',
          properties: {
            directory: { type: 'string', description: 'Directory to search in' },
            pattern: { type: 'string', description: 'Search pattern (glob or regex)' },
            recursive: { type: 'boolean', default: true, description: 'Search recursively' }
          },
          required: ['directory', 'pattern']
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'read_file') {
        return this.readFile(request.params.arguments);
      }
      if (request.params.name === 'write_file') {
        return this.writeFile(request.params.arguments);
      }
      if (request.params.name === 'list_directory') {
        return this.listDirectory(request.params.arguments);
      }
      if (request.params.name === 'create_directory') {
        return this.createDirectory(request.params.arguments);
      }
      if (request.params.name === 'delete_file') {
        return this.deleteFile(request.params.arguments);
      }
      if (request.params.name === 'file_info') {
        return this.fileInfo(request.params.arguments);
      }
      if (request.params.name === 'search_files') {
        return this.searchFiles(request.params.arguments);
      }
    });
  }

  isPathAllowed(filePath) {
    const normalizedPath = path.resolve(filePath);
    return this.allowedPaths.some(allowedPath => 
      normalizedPath.startsWith(path.resolve(allowedPath))
    );
  }

  async readFile(args) {
    const { path: filePath, encoding = 'utf8' } = args;
    
    if (!this.isPathAllowed(filePath)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Path not allowed: ${filePath}`
        }]
      };
    }

    try {
      const content = fs.readFileSync(filePath, encoding);
      return {
        content: [{
          type: 'text',
          text: `File: ${filePath}\nSize: ${content.length} characters\n\nContent:\n${content}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error reading file: ${error.message}`
        }]
      };
    }
  }

  async writeFile(args) {
    const { path: filePath, content, encoding = 'utf8' } = args;
    
    if (!this.isPathAllowed(filePath)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Path not allowed: ${filePath}`
        }]
      };
    }

    try {
      fs.writeFileSync(filePath, content, encoding);
      return {
        content: [{
          type: 'text',
          text: `File written successfully: ${filePath}\nSize: ${content.length} characters`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error writing file: ${error.message}`
        }]
      };
    }
  }

  async listDirectory(args) {
    const { path: dirPath, recursive = false } = args;
    
    if (!this.isPathAllowed(dirPath)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Path not allowed: ${dirPath}`
        }]
      };
    }

    try {
      const items = this.listDirectoryRecursive(dirPath, recursive);
      return {
        content: [{
          type: 'text',
          text: `Directory: ${dirPath}\n\n${items.join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error listing directory: ${error.message}`
        }]
      };
    }
  }

  listDirectoryRecursive(dirPath, recursive, depth = 0) {
    const items = [];
    const indent = '  '.repeat(depth);
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const type = entry.isDirectory() ? '[DIR]' : '[FILE]';
        items.push(`${indent}${type} ${entry.name}`);
        
        if (recursive && entry.isDirectory() && depth < 3) {
          try {
            items.push(...this.listDirectoryRecursive(fullPath, true, depth + 1));
          } catch (e) {
            items.push(`${indent}  [ERROR] ${e.message}`);
          }
        }
      }
    } catch (error) {
      items.push(`${indent}[ERROR] ${error.message}`);
    }
    
    return items;
  }

  async createDirectory(args) {
    const { path: dirPath } = args;
    
    if (!this.isPathAllowed(dirPath)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Path not allowed: ${dirPath}`
        }]
      };
    }

    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return {
        content: [{
          type: 'text',
          text: `Directory created successfully: ${dirPath}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error creating directory: ${error.message}`
        }]
      };
    }
  }

  async deleteFile(args) {
    const { path: filePath, recursive = false } = args;
    
    if (!this.isPathAllowed(filePath)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Path not allowed: ${filePath}`
        }]
      };
    }

    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive, force: true });
        return {
          content: [{
            type: 'text',
            text: `Directory deleted successfully: ${filePath}`
          }]
        };
      } else {
        fs.unlinkSync(filePath);
        return {
          content: [{
            type: 'text',
            text: `File deleted successfully: ${filePath}`
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error deleting: ${error.message}`
        }]
      };
    }
  }

  async fileInfo(args) {
    const { path: filePath } = args;
    
    if (!this.isPathAllowed(filePath)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Path not allowed: ${filePath}`
        }]
      };
    }

    try {
      const stats = fs.statSync(filePath);
      const info = {
        path: filePath,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8)
      };

      return {
        content: [{
          type: 'text',
          text: `File Info: ${filePath}\n${JSON.stringify(info, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error getting file info: ${error.message}`
        }]
      };
    }
  }

  async searchFiles(args) {
    const { directory, pattern, recursive = true } = args;
    
    if (!this.isPathAllowed(directory)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Path not allowed: ${directory}`
        }]
      };
    }

    try {
      const results = this.searchFilesRecursive(directory, pattern, recursive);
      return {
        content: [{
          type: 'text',
          text: `Search results for "${pattern}" in ${directory}:\n\n${results.join('\n') || 'No files found'}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error searching files: ${error.message}`
        }]
      };
    }
  }

  searchFilesRecursive(directory, pattern, recursive, depth = 0) {
    const results = [];
    if (depth > 5) return results;

    try {
      const entries = fs.readdirSync(directory, { withFileTypes: true });
      const regex = new RegExp(pattern, 'i');

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (regex.test(entry.name)) {
          const type = entry.isDirectory() ? '[DIR]' : '[FILE]';
          results.push(`${type} ${fullPath}`);
        }

        if (recursive && entry.isDirectory()) {
          try {
            results.push(...this.searchFilesRecursive(fullPath, pattern, true, depth + 1));
          } catch (e) {
            // Skip inaccessible directories
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }

    return results;
  }

  async start() {
    console.log('Starting Filesystem Local MCP Server...');
    console.log('Tools: read_file, write_file, list_directory, create_directory, delete_file, file_info, search_files');
    console.log('Allowed paths:', this.allowedPaths.join(', '));
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new FilesystemLocalServer();
server.start().catch(console.error);
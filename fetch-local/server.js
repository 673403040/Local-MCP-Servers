const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Lightweight Fetch MCP Server
class FetchLocalServer {
  constructor() {
    this.server = new Server({
      name: 'fetch-local',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'fetch_url',
        description: 'Fetch content from a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to fetch' },
            method: { type: 'string', default: 'GET', description: 'HTTP method' },
            headers: { type: 'object', description: 'HTTP headers' },
            body: { type: 'string', description: 'Request body for POST/PUT' },
            timeout: { type: 'number', default: 10000, description: 'Timeout in milliseconds' }
          },
          required: ['url']
        }
      }, {
        name: 'fetch_json',
        description: 'Fetch and parse JSON from a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to fetch JSON from' },
            headers: { type: 'object', description: 'HTTP headers' }
          },
          required: ['url']
        }
      }, {
        name: 'post_data',
        description: 'POST data to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to POST to' },
            data: { type: 'object', description: 'Data to POST' },
            headers: { type: 'object', description: 'HTTP headers' }
          },
          required: ['url', 'data']
        }
      }, {
        name: 'check_url_status',
        description: 'Check if a URL is accessible',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to check' }
          },
          required: ['url']
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'fetch_url') {
        return this.fetchUrl(request.params.arguments);
      }
      if (request.params.name === 'fetch_json') {
        return this.fetchJson(request.params.arguments);
      }
      if (request.params.name === 'post_data') {
        return this.postData(request.params.arguments);
      }
      if (request.params.name === 'check_url_status') {
        return this.checkUrlStatus(request.params.arguments);
      }
    });
  }

  async fetchUrl(args) {
    const { url, method = 'GET', headers = {}, body, timeout = 10000 } = args;
    
    try {
      const response = await this.makeRequest(url, method, headers, body, timeout);
      return {
        content: [{
          type: 'text',
          text: `URL: ${url}\nStatus: ${response.statusCode}\nHeaders: ${JSON.stringify(response.headers, null, 2)}\n\nContent:\n${response.body}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching URL: ${error.message}`
        }]
      };
    }
  }

  async fetchJson(args) {
    const { url, headers = {} } = args;
    
    try {
      const response = await this.makeRequest(url, 'GET', headers, null, 10000);
      const jsonData = JSON.parse(response.body);
      return {
        content: [{
          type: 'text',
          text: `JSON from ${url}:\n${JSON.stringify(jsonData, null, 2)}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching JSON: ${error.message}`
        }]
      };
    }
  }

  async postData(args) {
    const { url, data, headers = {} } = args;
    
    try {
      const postHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };
      const body = JSON.stringify(data);
      const response = await this.makeRequest(url, 'POST', postHeaders, body, 10000);
      
      return {
        content: [{
          type: 'text',
          text: `POST to ${url}\nStatus: ${response.statusCode}\nResponse:\n${response.body}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error posting data: ${error.message}`
        }]
      };
    }
  }

  async checkUrlStatus(args) {
    const { url } = args;
    
    try {
      const response = await this.makeRequest(url, 'HEAD', {}, null, 5000);
      return {
        content: [{
          type: 'text',
          text: `URL Status Check: ${url}\nStatus: ${response.statusCode}\nAccessible: ${response.statusCode < 400 ? 'Yes' : 'No'}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `URL Status Check: ${url}\nAccessible: No\nError: ${error.message}`
        }]
      };
    }
  }

  makeRequest(url, method, headers, body, timeout) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: headers,
        timeout: timeout
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  async start() {
    console.log('Starting Fetch Local MCP Server...');
    console.log('Tools: fetch_url, fetch_json, post_data, check_url_status');
    console.log('Lightweight local HTTP client');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new FetchLocalServer();
server.start().catch(console.error);
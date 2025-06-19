const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Lightweight Time MCP Server
class TimeLocalServer {
  constructor() {
    this.server = new Server({
      name: 'time-local',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'get_current_time',
        description: 'Get current date and time',
        inputSchema: {
          type: 'object',
          properties: {
            format: { type: 'string', default: 'iso', description: 'Time format: iso, local, utc, timestamp' },
            timezone: { type: 'string', default: 'local', description: 'Timezone (local, utc, or specific timezone)' }
          }
        }
      }, {
        name: 'format_time',
        description: 'Format a timestamp or date string',
        inputSchema: {
          type: 'object',
          properties: {
            time: { type: 'string', description: 'Time to format (timestamp or date string)' },
            format: { type: 'string', default: 'iso', description: 'Output format' }
          },
          required: ['time']
        }
      }, {
        name: 'time_difference',
        description: 'Calculate difference between two times',
        inputSchema: {
          type: 'object',
          properties: {
            start_time: { type: 'string', description: 'Start time' },
            end_time: { type: 'string', description: 'End time' },
            unit: { type: 'string', default: 'seconds', description: 'Unit: seconds, minutes, hours, days' }
          },
          required: ['start_time', 'end_time']
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'get_current_time') {
        return this.getCurrentTime(request.params.arguments);
      }
      if (request.params.name === 'format_time') {
        return this.formatTime(request.params.arguments);
      }
      if (request.params.name === 'time_difference') {
        return this.timeDifference(request.params.arguments);
      }
    });
  }

  async getCurrentTime(args) {
    const { format = 'iso', timezone = 'local' } = args || {};
    const now = new Date();
    
    let result;
    switch (format.toLowerCase()) {
      case 'iso':
        result = now.toISOString();
        break;
      case 'local':
        result = now.toLocaleString();
        break;
      case 'utc':
        result = now.toUTCString();
        break;
      case 'timestamp':
        result = now.getTime().toString();
        break;
      default:
        result = now.toISOString();
    }

    return {
      content: [{
        type: 'text',
        text: `Current time: ${result}\nFormat: ${format}\nTimezone: ${timezone}`
      }]
    };
  }

  async formatTime(args) {
    const { time, format = 'iso' } = args;
    
    try {
      const date = new Date(time);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }

      let result;
      switch (format.toLowerCase()) {
        case 'iso':
          result = date.toISOString();
          break;
        case 'local':
          result = date.toLocaleString();
          break;
        case 'utc':
          result = date.toUTCString();
          break;
        case 'timestamp':
          result = date.getTime().toString();
          break;
        default:
          result = date.toISOString();
      }

      return {
        content: [{
          type: 'text',
          text: `Formatted time: ${result}\nOriginal: ${time}\nFormat: ${format}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error formatting time: ${error.message}`
        }]
      };
    }
  }

  async timeDifference(args) {
    const { start_time, end_time, unit = 'seconds' } = args;
    
    try {
      const start = new Date(start_time);
      const end = new Date(end_time);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      const diffMs = end.getTime() - start.getTime();
      let result;
      
      switch (unit.toLowerCase()) {
        case 'seconds':
          result = Math.round(diffMs / 1000);
          break;
        case 'minutes':
          result = Math.round(diffMs / (1000 * 60));
          break;
        case 'hours':
          result = Math.round(diffMs / (1000 * 60 * 60));
          break;
        case 'days':
          result = Math.round(diffMs / (1000 * 60 * 60 * 24));
          break;
        default:
          result = Math.round(diffMs / 1000);
      }

      return {
        content: [{
          type: 'text',
          text: `Time difference: ${result} ${unit}\nStart: ${start_time}\nEnd: ${end_time}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error calculating time difference: ${error.message}`
        }]
      };
    }
  }

  async start() {
    console.log('Starting Time Local MCP Server...');
    console.log('Tools: get_current_time, format_time, time_difference');
    console.log('Lightweight local time processing');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new TimeLocalServer();
server.start().catch(console.error);
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

// Lightweight Context7 MCP Server
class Context7LocalServer {
  constructor() {
    this.server = new Server({
      name: 'context7-local',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    this.contexts = new Map();
    this.contextFile = path.join(__dirname, 'contexts.json');
    this.loadContexts();
    this.setupTools();
  }

  loadContexts() {
    try {
      if (fs.existsSync(this.contextFile)) {
        const data = fs.readFileSync(this.contextFile, 'utf8');
        const contextData = JSON.parse(data);
        this.contexts = new Map(Object.entries(contextData));
      }
    } catch (error) {
      console.log('Starting with empty contexts');
    }
  }

  saveContexts() {
    try {
      const contextData = Object.fromEntries(this.contexts);
      fs.writeFileSync(this.contextFile, JSON.stringify(contextData, null, 2));
    } catch (error) {
      console.error('Failed to save contexts:', error.message);
    }
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'create_context',
        description: 'Create a new context for organizing information',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Context name' },
            description: { type: 'string', description: 'Context description' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Context tags' }
          },
          required: ['name']
        }
      }, {
        name: 'add_to_context',
        description: 'Add information to a context',
        inputSchema: {
          type: 'object',
          properties: {
            context_name: { type: 'string', description: 'Context name' },
            content: { type: 'string', description: 'Content to add' },
            content_type: { type: 'string', default: 'text', description: 'Type of content' },
            metadata: { type: 'object', description: 'Additional metadata' }
          },
          required: ['context_name', 'content']
        }
      }, {
        name: 'search_context',
        description: 'Search within contexts',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            context_name: { type: 'string', description: 'Specific context to search (optional)' },
            limit: { type: 'number', default: 10, description: 'Maximum results' }
          },
          required: ['query']
        }
      }, {
        name: 'get_context',
        description: 'Get all information from a context',
        inputSchema: {
          type: 'object',
          properties: {
            context_name: { type: 'string', description: 'Context name' }
          },
          required: ['context_name']
        }
      }, {
        name: 'list_contexts',
        description: 'List all available contexts',
        inputSchema: {
          type: 'object',
          properties: {
            include_stats: { type: 'boolean', default: true, description: 'Include context statistics' }
          }
        }
      }, {
        name: 'update_context',
        description: 'Update context metadata',
        inputSchema: {
          type: 'object',
          properties: {
            context_name: { type: 'string', description: 'Context name' },
            description: { type: 'string', description: 'New description' },
            tags: { type: 'array', items: { type: 'string' }, description: 'New tags' }
          },
          required: ['context_name']
        }
      }, {
        name: 'delete_context',
        description: 'Delete a context',
        inputSchema: {
          type: 'object',
          properties: {
            context_name: { type: 'string', description: 'Context name to delete' },
            confirm: { type: 'boolean', default: false, description: 'Confirm deletion' }
          },
          required: ['context_name']
        }
      }, {
        name: 'merge_contexts',
        description: 'Merge two contexts',
        inputSchema: {
          type: 'object',
          properties: {
            source_context: { type: 'string', description: 'Source context name' },
            target_context: { type: 'string', description: 'Target context name' },
            delete_source: { type: 'boolean', default: false, description: 'Delete source after merge' }
          },
          required: ['source_context', 'target_context']
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'create_context') {
        return this.createContext(request.params.arguments);
      }
      if (request.params.name === 'add_to_context') {
        return this.addToContext(request.params.arguments);
      }
      if (request.params.name === 'search_context') {
        return this.searchContext(request.params.arguments);
      }
      if (request.params.name === 'get_context') {
        return this.getContext(request.params.arguments);
      }
      if (request.params.name === 'list_contexts') {
        return this.listContexts(request.params.arguments);
      }
      if (request.params.name === 'update_context') {
        return this.updateContext(request.params.arguments);
      }
      if (request.params.name === 'delete_context') {
        return this.deleteContext(request.params.arguments);
      }
      if (request.params.name === 'merge_contexts') {
        return this.mergeContexts(request.params.arguments);
      }
    });
  }

  async createContext(args) {
    const { name, description = '', tags = [] } = args;
    
    if (this.contexts.has(name)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Context '${name}' already exists`
        }]
      };
    }

    const context = {
      name: name,
      description: description,
      tags: tags,
      items: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    this.contexts.set(name, context);
    this.saveContexts();

    return {
      content: [{
        type: 'text',
        text: `Context created successfully
Name: ${name}
Description: ${description}
Tags: ${tags.join(', ') || 'None'}
Created: ${context.created}`
      }]
    };
  }

  async addToContext(args) {
    const { context_name, content, content_type = 'text', metadata = {} } = args;
    
    if (!this.contexts.has(context_name)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Context '${context_name}' not found`
        }]
      };
    }

    const context = this.contexts.get(context_name);
    const item = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      content: content,
      content_type: content_type,
      metadata: metadata,
      added: new Date().toISOString()
    };

    context.items.push(item);
    context.updated = new Date().toISOString();
    this.saveContexts();

    return {
      content: [{
        type: 'text',
        text: `Content added to context '${context_name}'
Item ID: ${item.id}
Content Type: ${content_type}
Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}
Total items in context: ${context.items.length}`
      }]
    };
  }

  async searchContext(args) {
    const { query, context_name, limit = 10 } = args;
    
    let contextsToSearch = [];
    if (context_name) {
      if (!this.contexts.has(context_name)) {
        return {
          content: [{
            type: 'text',
            text: `Error: Context '${context_name}' not found`
          }]
        };
      }
      contextsToSearch = [this.contexts.get(context_name)];
    } else {
      contextsToSearch = Array.from(this.contexts.values());
    }

    const results = [];
    const queryLower = query.toLowerCase();

    for (const context of contextsToSearch) {
      for (const item of context.items) {
        if (item.content.toLowerCase().includes(queryLower) ||
            (item.metadata && JSON.stringify(item.metadata).toLowerCase().includes(queryLower))) {
          results.push({
            context: context.name,
            item: item,
            relevance: this.calculateRelevance(item.content, query)
          });
        }
      }
    }

    results.sort((a, b) => b.relevance - a.relevance);
    const limitedResults = results.slice(0, limit);

    if (limitedResults.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No results found for query: "${query}"`
        }]
      };
    }

    let searchResults = `Search Results for "${query}" (${limitedResults.length}/${results.length}):

`;

    limitedResults.forEach((result, index) => {
      searchResults += `${index + 1}. Context: ${result.context}
   Content: ${result.item.content.substring(0, 200)}${result.item.content.length > 200 ? '...' : ''}
   Added: ${result.item.added}
   Relevance: ${result.relevance.toFixed(2)}

`;
    });

    return {
      content: [{
        type: 'text',
        text: searchResults
      }]
    };
  }

  calculateRelevance(content, query) {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ');
    
    let score = 0;
    
    // Exact match bonus
    if (contentLower.includes(queryLower)) {
      score += 10;
    }
    
    // Word match scoring
    queryWords.forEach(word => {
      const wordCount = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += wordCount * 2;
    });
    
    // Length penalty (shorter content with matches is more relevant)
    score = score / Math.log(content.length + 1);
    
    return score;
  }

  async getContext(args) {
    const { context_name } = args;
    
    if (!this.contexts.has(context_name)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Context '${context_name}' not found`
        }]
      };
    }

    const context = this.contexts.get(context_name);
    
    let contextInfo = `Context: ${context.name}
Description: ${context.description}
Tags: ${context.tags.join(', ') || 'None'}
Items: ${context.items.length}
Created: ${context.created}
Updated: ${context.updated}

Content:
`;

    context.items.forEach((item, index) => {
      contextInfo += `
${index + 1}. [${item.content_type}] ${item.content}
   Added: ${item.added}
   ID: ${item.id}
`;
      if (Object.keys(item.metadata).length > 0) {
        contextInfo += `   Metadata: ${JSON.stringify(item.metadata)}
`;
      }
    });

    return {
      content: [{
        type: 'text',
        text: contextInfo
      }]
    };
  }

  async listContexts(args) {
    const { include_stats = true } = args || {};
    
    if (this.contexts.size === 0) {
      return {
        content: [{
          type: 'text',
          text: 'No contexts found. Use create_context to create your first context.'
        }]
      };
    }

    let contextList = `Available Contexts (${this.contexts.size}):

`;

    Array.from(this.contexts.values()).forEach(context => {
      contextList += `${context.name}`;
      if (context.description) {
        contextList += ` - ${context.description}`;
      }
      contextList += `
`;
      
      if (include_stats) {
        contextList += `  Items: ${context.items.length}, Tags: ${context.tags.join(', ') || 'None'}
  Created: ${context.created}, Updated: ${context.updated}
`;
      }
      contextList += `
`;
    });

    return {
      content: [{
        type: 'text',
        text: contextList
      }]
    };
  }

  async updateContext(args) {
    const { context_name, description, tags } = args;
    
    if (!this.contexts.has(context_name)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Context '${context_name}' not found`
        }]
      };
    }

    const context = this.contexts.get(context_name);
    
    if (description !== undefined) {
      context.description = description;
    }
    if (tags !== undefined) {
      context.tags = tags;
    }
    
    context.updated = new Date().toISOString();
    this.saveContexts();

    return {
      content: [{
        type: 'text',
        text: `Context '${context_name}' updated successfully
Description: ${context.description}
Tags: ${context.tags.join(', ') || 'None'}
Updated: ${context.updated}`
      }]
    };
  }

  async deleteContext(args) {
    const { context_name, confirm = false } = args;
    
    if (!this.contexts.has(context_name)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Context '${context_name}' not found`
        }]
      };
    }

    if (!confirm) {
      const context = this.contexts.get(context_name);
      return {
        content: [{
          type: 'text',
          text: `Warning: This will delete context '${context_name}' with ${context.items.length} items.
Set confirm=true to proceed with deletion.`
        }]
      };
    }

    const context = this.contexts.get(context_name);
    const itemCount = context.items.length;
    this.contexts.delete(context_name);
    this.saveContexts();

    return {
      content: [{
        type: 'text',
        text: `Context '${context_name}' deleted successfully. Removed ${itemCount} items.`
      }]
    };
  }

  async mergeContexts(args) {
    const { source_context, target_context, delete_source = false } = args;
    
    if (!this.contexts.has(source_context)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Source context '${source_context}' not found`
        }]
      };
    }

    if (!this.contexts.has(target_context)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Target context '${target_context}' not found`
        }]
      };
    }

    const sourceCtx = this.contexts.get(source_context);
    const targetCtx = this.contexts.get(target_context);
    
    const itemCount = sourceCtx.items.length;
    targetCtx.items.push(...sourceCtx.items);
    targetCtx.updated = new Date().toISOString();
    
    // Merge tags
    const combinedTags = [...new Set([...targetCtx.tags, ...sourceCtx.tags])];
    targetCtx.tags = combinedTags;

    if (delete_source) {
      this.contexts.delete(source_context);
    }

    this.saveContexts();

    return {
      content: [{
        type: 'text',
        text: `Contexts merged successfully
Moved ${itemCount} items from '${source_context}' to '${target_context}'
Combined tags: ${combinedTags.join(', ') || 'None'}
Source context ${delete_source ? 'deleted' : 'preserved'}
Target context now has ${targetCtx.items.length} items`
      }]
    };
  }

  async start() {
    console.log('Starting Context7 Local MCP Server...');
    console.log('Tools: create_context, add_to_context, search_context, get_context, list_contexts, update_context, delete_context, merge_contexts');
    console.log('Lightweight local context management with persistence');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new Context7LocalServer();
server.start().catch(console.error);
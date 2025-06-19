const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Lightweight Sequential Thinking MCP Server
class SequentialThinkingLocalServer {
  constructor() {
    this.server = new Server({
      name: 'sequential-thinking-local',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
    this.thinkingSessions = new Map();
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'start_thinking',
        description: 'Start a new sequential thinking session',
        inputSchema: {
          type: 'object',
          properties: {
            problem: { type: 'string', description: 'Problem or question to think about' },
            session_id: { type: 'string', description: 'Optional session ID' },
            max_thoughts: { type: 'number', default: 10, description: 'Maximum number of thoughts' }
          },
          required: ['problem']
        }
      }, {
        name: 'add_thought',
        description: 'Add a thought to an existing session',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: { type: 'string', description: 'Session ID' },
            thought: { type: 'string', description: 'The thought to add' },
            builds_on: { type: 'number', description: 'Which thought number this builds on' }
          },
          required: ['session_id', 'thought']
        }
      }, {
        name: 'review_thinking',
        description: 'Review all thoughts in a session',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: { type: 'string', description: 'Session ID to review' }
          },
          required: ['session_id']
        }
      }, {
        name: 'conclude_thinking',
        description: 'Conclude a thinking session with a final answer',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: { type: 'string', description: 'Session ID' },
            conclusion: { type: 'string', description: 'Final conclusion or answer' }
          },
          required: ['session_id', 'conclusion']
        }
      }, {
        name: 'list_sessions',
        description: 'List all thinking sessions',
        inputSchema: {
          type: 'object',
          properties: {
            active_only: { type: 'boolean', default: true, description: 'Show only active sessions' }
          }
        }
      }, {
        name: 'branch_thinking',
        description: 'Create a branch from an existing thought',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: { type: 'string', description: 'Original session ID' },
            thought_number: { type: 'number', description: 'Thought to branch from' },
            new_direction: { type: 'string', description: 'New thinking direction' }
          },
          required: ['session_id', 'thought_number', 'new_direction']
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'start_thinking') {
        return this.startThinking(request.params.arguments);
      }
      if (request.params.name === 'add_thought') {
        return this.addThought(request.params.arguments);
      }
      if (request.params.name === 'review_thinking') {
        return this.reviewThinking(request.params.arguments);
      }
      if (request.params.name === 'conclude_thinking') {
        return this.concludeThinking(request.params.arguments);
      }
      if (request.params.name === 'list_sessions') {
        return this.listSessions(request.params.arguments);
      }
      if (request.params.name === 'branch_thinking') {
        return this.branchThinking(request.params.arguments);
      }
    });
  }

  generateSessionId() {
    return 'thinking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async startThinking(args) {
    const { problem, session_id, max_thoughts = 10 } = args;
    const sessionId = session_id || this.generateSessionId();
    
    const session = {
      id: sessionId,
      problem: problem,
      thoughts: [],
      branches: [],
      status: 'active',
      created: new Date().toISOString(),
      max_thoughts: max_thoughts
    };

    this.thinkingSessions.set(sessionId, session);

    return {
      content: [{
        type: 'text',
        text: `Sequential Thinking Session Started
Session ID: ${sessionId}
Problem: ${problem}
Max Thoughts: ${max_thoughts}

Ready to add thoughts. Use add_thought to continue the thinking process.`
      }]
    };
  }

  async addThought(args) {
    const { session_id, thought, builds_on } = args;
    
    if (!this.thinkingSessions.has(session_id)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Session not found: ${session_id}`
        }]
      };
    }

    const session = this.thinkingSessions.get(session_id);
    
    if (session.status !== 'active') {
      return {
        content: [{
          type: 'text',
          text: `Error: Session is not active: ${session_id}`
        }]
      };
    }

    if (session.thoughts.length >= session.max_thoughts) {
      return {
        content: [{
          type: 'text',
          text: `Error: Maximum thoughts reached (${session.max_thoughts})`
        }]
      };
    }

    const thoughtNumber = session.thoughts.length + 1;
    const newThought = {
      number: thoughtNumber,
      content: thought,
      builds_on: builds_on,
      timestamp: new Date().toISOString()
    };

    session.thoughts.push(newThought);

    return {
      content: [{
        type: 'text',
        text: `Thought ${thoughtNumber} added to session ${session_id}

Thought: ${thought}
${builds_on ? `Builds on thought #${builds_on}` : 'Independent thought'}

Progress: ${thoughtNumber}/${session.max_thoughts} thoughts
Use add_thought to continue or conclude_thinking to finish.`
      }]
    };
  }

  async reviewThinking(args) {
    const { session_id } = args;
    
    if (!this.thinkingSessions.has(session_id)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Session not found: ${session_id}`
        }]
      };
    }

    const session = this.thinkingSessions.get(session_id);
    
    let review = `Sequential Thinking Review
Session: ${session_id}
Problem: ${session.problem}
Status: ${session.status}
Created: ${session.created}

Thoughts (${session.thoughts.length}/${session.max_thoughts}):
`;

    session.thoughts.forEach(thought => {
      review += `
${thought.number}. ${thought.content}`;
      if (thought.builds_on) {
        review += ` (builds on #${thought.builds_on})`;
      }
      review += `
   Time: ${thought.timestamp}
`;
    });

    if (session.branches.length > 0) {
      review += `\nBranches: ${session.branches.length}`;
    }

    return {
      content: [{
        type: 'text',
        text: review
      }]
    };
  }

  async concludeThinking(args) {
    const { session_id, conclusion } = args;
    
    if (!this.thinkingSessions.has(session_id)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Session not found: ${session_id}`
        }]
      };
    }

    const session = this.thinkingSessions.get(session_id);
    session.status = 'concluded';
    session.conclusion = conclusion;
    session.concluded_at = new Date().toISOString();

    return {
      content: [{
        type: 'text',
        text: `Sequential Thinking Session Concluded
Session: ${session_id}
Problem: ${session.problem}

Final Conclusion: ${conclusion}

Total thoughts: ${session.thoughts.length}
Session completed at: ${session.concluded_at}`
      }]
    };
  }

  async listSessions(args) {
    const { active_only = true } = args || {};
    
    const sessions = Array.from(this.thinkingSessions.values());
    const filteredSessions = active_only ? 
      sessions.filter(s => s.status === 'active') : 
      sessions;

    if (filteredSessions.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No ${active_only ? 'active ' : ''}thinking sessions found.`
        }]
      };
    }

    let list = `${active_only ? 'Active ' : ''}Thinking Sessions (${filteredSessions.length}):

`;

    filteredSessions.forEach(session => {
      list += `${session.id}
  Problem: ${session.problem}
  Status: ${session.status}
  Thoughts: ${session.thoughts.length}/${session.max_thoughts}
  Created: ${session.created}

`;
    });

    return {
      content: [{
        type: 'text',
        text: list
      }]
    };
  }

  async branchThinking(args) {
    const { session_id, thought_number, new_direction } = args;
    
    if (!this.thinkingSessions.has(session_id)) {
      return {
        content: [{
          type: 'text',
          text: `Error: Session not found: ${session_id}`
        }]
      };
    }

    const originalSession = this.thinkingSessions.get(session_id);
    
    if (thought_number > originalSession.thoughts.length) {
      return {
        content: [{
          type: 'text',
          text: `Error: Thought #${thought_number} does not exist`
        }]
      };
    }

    const branchId = this.generateSessionId();
    const branchSession = {
      id: branchId,
      problem: originalSession.problem,
      thoughts: originalSession.thoughts.slice(0, thought_number),
      branches: [],
      status: 'active',
      created: new Date().toISOString(),
      max_thoughts: originalSession.max_thoughts,
      branched_from: session_id,
      branch_point: thought_number
    };

    // Add the new direction as the next thought
    branchSession.thoughts.push({
      number: thought_number + 1,
      content: new_direction,
      builds_on: thought_number,
      timestamp: new Date().toISOString()
    });

    this.thinkingSessions.set(branchId, branchSession);
    originalSession.branches.push(branchId);

    return {
      content: [{
        type: 'text',
        text: `Thinking Branch Created
New Session: ${branchId}
Branched from: ${session_id} at thought #${thought_number}
New Direction: ${new_direction}

The branch continues from thought #${thought_number} with a new direction.
Use add_thought with session_id ${branchId} to continue this branch.`
      }]
    };
  }

  async start() {
    console.log('Starting Sequential Thinking Local MCP Server...');
    console.log('Tools: start_thinking, add_thought, review_thinking, conclude_thinking, list_sessions, branch_thinking');
    console.log('Lightweight local sequential thinking processor');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new SequentialThinkingLocalServer();
server.start().catch(console.error);
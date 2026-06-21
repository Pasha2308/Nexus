#!/usr/bin/env node

/**
 * Nexus MCP Server
 * This script runs a Model Context Protocol (MCP) stdio server.
 * It allows external agents (like Claude Desktop or Cursor) to read the user's
 * Valkey Network Graph and use Nexus as a true CRM backend.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Redis from "ioredis";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Initialize Valkey connection
const valkey = new Redis(process.env.REDIS_URL || "");

const server = new Server(
  {
    name: "nexus-crm",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_network_graph",
        description: "Retrieves the user's entire network graph and contacts from the Nexus Valkey database.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_recent_memories",
        description: "Retrieves the most recent conversational memory logs from the Nexus Valkey database.",
        inputSchema: {
          type: "object",
          properties: {
            count: {
              type: "number",
              description: "Number of recent memories to retrieve (default 10)",
            }
          },
        },
      },
      {
        name: "add_contact",
        description: "Adds a new entity, person, or company to the user's Valkey Network Graph.",
        inputSchema: {
          type: "object",
          properties: {
            entity: {
              type: "string",
              description: "The name of the entity to add (e.g. 'John Doe (Investor)')",
            }
          },
          required: ["entity"],
        },
      },
      {
        name: "add_memory",
        description: "Adds a new interaction or thought to the user's session memory.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The text content of the memory or interaction to save.",
            }
          },
          required: ["content"],
        },
      },
      {
        name: "semantic_search",
        description: "Semantically searches the user's Nexus brain (network graph + recent memory) to answer a specific question.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The question to ask the Nexus Brain.",
            }
          },
          required: ["query"],
        },
      }
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get_network_graph": {
      try {
        const contacts = await valkey.smembers("network_connections");
        return {
          content: [{
            type: "text",
            text: JSON.stringify(contacts, null, 2)
          }]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Database error: ${error.message}` }], isError: true };
      }
    }

    case "get_recent_memories": {
      try {
        const count = Number(request.params.arguments?.count) || 10;
        const memoriesRaw = await valkey.lrange("session_memory", 0, count - 1);
        
        const formatted = memoriesRaw.map(m => {
          try {
            return JSON.parse(m);
          } catch (e) {
            return { raw: m };
          }
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify(formatted, null, 2)
          }]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Database error: ${error.message}` }], isError: true };
      }
    }

    case "add_contact": {
      try {
        const entity = String(request.params.arguments?.entity);
        if (!entity) throw new Error("Entity is required.");
        
        await valkey.sadd("network_connections", entity);
        return {
          content: [{ type: "text", text: `Successfully added ${entity} to the Valkey Network Graph.` }]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Database error: ${error.message}` }], isError: true };
      }
    }

    case "add_memory": {
      try {
        const content = String(request.params.arguments?.content);
        if (!content) throw new Error("Content is required.");
        
        const memoryEntry = JSON.stringify({ role: "assistant", content: `[External Agent Injection]: ${content}` });
        await valkey.lpush("session_memory", memoryEntry);
        await valkey.ltrim("session_memory", 0, 50);

        return {
          content: [{ type: "text", text: `Successfully pushed memory to Valkey.` }]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Database error: ${error.message}` }], isError: true };
      }
    }

    case "semantic_search": {
      try {
        const query = String(request.params.arguments?.query);
        if (!query) throw new Error("Query is required.");

        const networkContext = await valkey.smembers('network_connections');
        const recentMemoriesRaw = await valkey.lrange('session_memory', 0, 50);
        
        const recentMemories = recentMemoriesRaw.map(m => {
          try { return JSON.parse(m).content; } catch (e) { return m; }
        });

        const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : new GoogleGenAI({
          project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
          location: process.env.GCP_REGION || 'us-central1',
          vertexai: true
        });

        const systemPrompt = `You are the Semantic Search Engine for Nexus.
Search the provided Valkey Network Graph and Session Memories to answer the user's query.
Only answer based on the provided data. If you don't know, say "I couldn't find that in the memory graph."

VALKEY NETWORK GRAPH:
${networkContext.length > 0 ? networkContext.map(c => `- ${c}`).join('\\n') : "No entities extracted yet."}

VALKEY SESSION MEMORY:
${recentMemories.length > 0 ? recentMemories.join('\\n---\\n') : "No recent conversations."}
`;

        const response = await ai.models.generateContent({
          model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\\n\\nUSER QUERY: ' + query }] }
          ],
        });

        return {
          content: [{ type: "text", text: response.text }]
        };
      } catch (error) {
        return { content: [{ type: "text", text: `Semantic Search Error: ${error.message}` }], isError: true };
      }
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nexus MCP Server (v2) running on stdio");
}

main().catch(console.error);

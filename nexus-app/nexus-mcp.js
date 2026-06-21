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

// Load environment variables for Valkey
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Initialize Valkey connection
const valkey = new Redis(process.env.REDIS_URL || "");

const server = new Server(
  {
    name: "nexus-crm",
    version: "1.0.0",
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
        return {
          content: [{ type: "text", text: `Database error: ${error.message}` }],
          isError: true,
        };
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
        return {
          content: [{ type: "text", text: `Database error: ${error.message}` }],
          isError: true,
        };
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
  console.error("Nexus MCP Server running on stdio");
}

main().catch(console.error);

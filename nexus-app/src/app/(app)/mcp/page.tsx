"use client";

import { useState } from "react";
import { Terminal, Copy, CheckCircle2, Server, Plug } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MCPIntegration() {
  const [copied, setCopied] = useState(false);

  const configJson = {
    "mcpServers": {
      "nexus-crm": {
        "command": "node",
        "args": [
          "C:/Absolute/Path/To/nexus-app/nexus-mcp.js"
        ],
        "env": {
          "REDIS_URL": "rediss://your-valkey-url"
        }
      }
    }
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(configJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full font-sans relative overflow-hidden">
      <div className="flex flex-col flex-1 relative z-10 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 glass-panel sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              MCP Server Integration
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8 pt-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 neon-glow mb-6">
              <Server className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Connect Nexus to Any Agent</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Nexus comes with a built-in Model Context Protocol (MCP) server. You can plug your Nexus Brain into Claude Desktop, Cursor, or any MCP-compatible agent.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Plug className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">How it works</h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">1.</span>
                  Find your absolute path to the <code className="text-blue-300 bg-blue-900/30 px-1 rounded">nexus-mcp.js</code> file.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">2.</span>
                  Open your Claude Desktop config (<code className="text-blue-300 bg-blue-900/30 px-1 rounded">claude_desktop_config.json</code>).
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">3.</span>
                  Paste the JSON configuration.
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">4.</span>
                  Restart Claude Desktop. Claude can now search your network graph and read your memories!
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 rounded-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Config Snippet</h3>
                </div>
                <button 
                  onClick={copyConfig}
                  className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg text-gray-300"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-black/60 p-4 rounded-xl overflow-x-auto text-sm text-gray-300 border border-white/5">
                {JSON.stringify(configJson, null, 2)}
              </pre>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6 rounded-2xl text-center border border-purple-500/20"
          >
            <h3 className="text-lg font-bold text-white mb-2">Available MCP Tools</h3>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-sm border border-purple-500/30">get_network_graph</span>
              <span className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-sm border border-purple-500/30">get_recent_memories</span>
              <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm border border-blue-500/30 animate-pulse">semantic_search (new)</span>
              <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm border border-blue-500/30 animate-pulse">add_memory (new)</span>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

# 🧠 Nexus: The 10x Multimodal AI Executive Assistant

Nexus is an Enterprise-grade Personal CRM and AI Executive Assistant built for founders. It solves the problem of **context fragmentation** by intercepting unstructured data (voice memos, images, and casual chat) and building a persistent, graph-based memory of your entire network.

![Nexus Dashboard Concept](https://upload.wikimedia.org/wikipedia/commons/e/e4/Nexus_concept_art_placeholder.png)

---

## 🚀 The Hackathon Pitch

**Problem Statement:** 
Founders and executives suffer from context loss. Traditional CRMs require manual data entry, and modern AI chatbots forget everything when the session ends. 

**The Solution:** 
Nexus is a "second brain" that lives wherever the founder lives. Using **Vertex AI (Gemini 1.5 Pro)**, Nexus natively processes multimodal inputs (images of business cards, audio voice memos) and permanently logs the extracted relationships and action items into **Upstash Valkey**. It acts as an omnipresent context engine that automatically builds your network graph.

### ✨ The 10x "Wow Factor" Features

1. **True Multimodal Processing:** Upload a photo of a whiteboard or a `.ogg` voice memo. Nexus passes the raw bytes directly to Vertex AI, which extracts the intent natively without needing separate OCR or Speech-to-Text APIs.
2. **Persistent Context Graph:** Memory isn't lost in a chat window. Every interaction is parsed, categorized, and saved into a high-performance Valkey database.
3. **Framer Motion Glassmorphism UI:** An ultra-premium, buttery smooth frontend interface that visualizes your "Live Context" with glowing, cyberpunk-inspired visual feedback.
4. **Agentic MCP Integration:** Nexus comes with a built-in **Model Context Protocol (MCP)** server. You can plug your Nexus brain directly into Claude Desktop or Cursor. Other agents can actively query your network graph, read your memories, and push new interactions into your Valkey database!

---

## 🏗️ Architecture

Nexus uses a modern, hybrid AI architecture:

1. **Frontend (Next.js 14 App Router):** Provides a secure Web Chat UI (`/chat`), a beautiful Landing Page (`/`), the Memory Dashboard (`/dashboard`), and the MCP configuration page (`/mcp`).
2. **The Core Engine (Vertex AI / Gemini 1.5 Pro):** We use the `@google/genai` SDK over Vertex AI. Gemini acts as an OCR engine, transcriber, and reasoning agent.
3. **The Memory Layer (Upstash Valkey):** We use Valkey (Redis-compatible) for ultra-fast, in-memory state management. It stores:
   - `session_memory`: The raw timeline of interactions.
   - `network_connections`: A Set of unique entities extracted by the AI.
4. **MCP Server (`nexus-mcp.js`):** A standalone Node.js stdio server that exposes `semantic_search`, `get_network_graph`, `add_contact`, and `add_memory` tools to external agents via the Model Context Protocol.

---

## 💻 Local Testing & Usage

If you are running this locally, follow these steps to test the full Nexus experience:

### 1. Web Application (`npm run dev`)
1. Navigate to `http://localhost:3000`
2. Click "Open Nexus Chat". 
   - **MASTER PASSWORD:** `nexus10x`
3. Test the Multimodal Chat: 
   - Type: *"I just met Sarah from Microsoft, she wants to partner on AI."*
   - Upload an image using the paperclip icon.
4. View your Live Context Brain update in real-time, or navigate to `/dashboard`.

### 2. Connect the MCP Server to Claude Desktop
1. Go to `http://localhost:3000/mcp`
2. Copy the generated `claude_desktop_config.json` snippet.
3. Paste it into your Claude Desktop configuration and restart Claude.
4. Ask Claude: *"Search my Nexus memory to see if I met anyone from Microsoft recently."*

---

## 🛠️ Environment Setup

Ensure your `.env` file contains:
\`\`\`env
# Valkey Database
REDIS_URL="..."

# Vertex AI Settings
GCP_PROJECT_ID="..."
GCP_REGION="..."

# Optional Services
BREETH_AI_API_KEY="..."

# Auth
MASTER_PASSWORD="nexus10x"
\`\`\`

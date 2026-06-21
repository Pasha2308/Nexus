# 🧠 Nexus: The 10x Multimodal Executive Assistant

Nexus is an Enterprise-grade Personal CRM and AI Executive Assistant built for founders. It solves the problem of **context fragmentation** by intercepting unstructured data (voice memos, images, and casual chat) and building a persistent, graph-based memory of your entire network.

---

## 🚀 The Hackathon Pitch

**Problem Statement:** 
Founders and executives suffer from context loss. Traditional CRMs require manual data entry, and modern AI chatbots forget everything when the session ends. 

**The Solution:** 
Nexus is a "second brain" that lives wherever the founder lives. Using **Vertex AI (Gemini 3.0 Pro)**, Nexus natively processes multimodal inputs (images of business cards, audio voice memos) and permanently logs the extracted relationships and action items into **Upstash Valkey**. It acts as an omnipresent context engine that automatically builds your network graph.

### The 10x "Wow Factor" Features
1. **True Multimodal Processing:** Upload a photo of a whiteboard or a `.ogg` voice memo. Nexus passes the raw bytes directly to Vertex AI, which extracts the intent natively without needing separate OCR or Speech-to-Text APIs.
2. **Persistent Context Graph:** Memory isn't lost in a chat window. Every interaction is parsed, categorized, and saved into Valkey.
3. **Omnipresent Access:** Nexus can be accessed via a secure Next.js Web App OR via a Discord Bot integration.
4. **Real-time Memory Dashboard:** A stunning UI that visualizes your raw memory stream and the AI-extracted network graph.

---

## 🏗️ How the Integration Works (Architecture)

Nexus uses a modern, hybrid AI architecture:

1. **Frontend (Next.js 14 App Router):** Provides a secure Web Chat UI (`/chat`), a beautiful Landing Page (`/`), and the Memory Dashboard (`/dashboard`).
2. **Authentication Middleware:** Uses Next.js Edge Middleware to secure the `/chat` and `/dashboard` routes with a Master Password, ensuring personal CRM data stays private.
3. **The Core Engine (Vertex AI / Gemini 3.0 Pro):** The brain of Nexus. We use the `@google/genai` SDK. When you send a message or an image, it is passed to Gemini along with your historical Valkey context. Gemini acts as an OCR engine, a transcriber, and a conversational agent all at once.
4. **The Memory Layer (Upstash Valkey):** Instead of a heavy Postgres database, we use Valkey (Redis-compatible) for ultra-fast, in-memory state management. It stores two things:
   - `session_memory`: The raw timeline of interactions.
   - `network_connections`: A Set of unique entities (people, companies) extracted by the AI.
5. **Discord Integration (Optional/Headless):** A lightweight Node.js bot (`discord-bot/bot.js`) that intercepts Discord DMs, converts attachments to Base64, and proxies them to the Next.js `/api/chat` route.

---

## 💻 Local Testing & Usage

If you are running this locally (`npm run dev`), follow these steps to test the Web Application:

1. **Open the Web App:** Navigate to `http://localhost:3000`
2. **Log In:** Click "Open Nexus Chat". You will be redirected to the secure login page.
   - **MASTER PASSWORD:** `nexus10x`
3. **Test the Chat:** 
   - Type: *"I just met Sarah from Microsoft, she wants to partner on AI."*
   - Upload: Click the paperclip icon to upload an image of a handwritten note.
4. **View the Dashboard:** Navigate to `http://localhost:3000/dashboard` to see your Valkey database update in real-time with the new entities!

---

## 🛠️ Environment Variables Setup

Ensure your `.env` file contains:
\`\`\`env
# Valkey Database
REDIS_URL="..."

# AI Providers
GEMINI_API_KEY="..."
BREETH_AI_API_KEY="..."
GCP_PROJECT_ID="..."
GCP_REGION="..."

# Auth
MASTER_PASSWORD="nexus10x"

# Discord (Optional)
DISCORD_BOT_TOKEN="..."
DISCORD_CLIENT_ID="..."
DISCORD_GUILD_ID="..."
\`\`\`

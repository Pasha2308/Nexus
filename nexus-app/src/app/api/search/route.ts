import { NextResponse } from 'next/server';
import valkey from '@/lib/valkey';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ reply: 'Query is required.' }, { status: 400 });
    }

    // 1. Fetch entire brain from Valkey
    // In a production app, we would use Upstash Vector for cosine similarity search.
    // For this hackathon, since the data fits in context window, we feed the graph to Gemini.
    const networkContext = await valkey.smembers('network_connections');
    
    // Get recent memories to help with semantic resolution
    const recentMemoriesRaw = await valkey.lrange('session_memory', 0, 50);
    const recentMemories = recentMemoriesRaw.map(m => {
      try {
        return JSON.parse(m).content;
      } catch (e) {
        return m;
      }
    });

    // 2. Vertex AI Semantic Search
    const ai = new GoogleGenAI({
      project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
      location: process.env.GCP_REGION || 'us-central1',
      vertexai: true
    });

    const systemPrompt = `You are the Semantic Search Engine for Nexus, an elite personal CRM.
Your job is to search the provided Valkey Network Graph and Session Memories to answer the user's query.

CRITICAL RULES:
1. Only answer based on the provided data. If you don't know, say "I couldn't find that in your memory graph."
2. Be concise and professional.
3. If the user asks for someone specific, try to deduce who they mean based on hints (e.g. "the tennis guy" -> look for mentions of tennis in the memories).

VALKEY NETWORK GRAPH (Entities):
${networkContext.length > 0 ? networkContext.map(c => `- ${c}`).join('\\n') : "No entities extracted yet."}

VALKEY SESSION MEMORY (Context):
${recentMemories.length > 0 ? recentMemories.join('\\n---\\n') : "No recent conversations."}
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\\n\\nUSER QUERY: ' + query }] }
      ],
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ reply: `[Search Error] ${error.message}` }, { status: 500 });
  }
}

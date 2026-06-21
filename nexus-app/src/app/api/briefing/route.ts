import { NextResponse } from 'next/server';
import valkey from '@/lib/valkey';
import { GoogleGenAI } from '@google/genai';

export async function GET(req: Request) {
  try {
    // 1. Fetch entire brain from Valkey
    const networkContext = await valkey.smembers('network_connections');
    
    // Get recent memories (last 20 interactions)
    const recentMemoriesRaw = await valkey.lrange('session_memory', 0, 20);
    const recentMemories = recentMemoriesRaw.map(m => {
      try {
        return JSON.parse(m).content;
      } catch (e) {
        return m;
      }
    });

    // 2. Vertex AI Briefing Generation
    const ai = new GoogleGenAI({
      vertexai: {
        project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
        location: process.env.GCP_REGION || 'us-central1',
      }
    });

    const systemPrompt = `You are Nexus, an elite proactive CRM AI. 
Your job is to read the founder's recent memories and network graph, and generate a highly actionable "Daily Briefing".

FORMAT YOUR RESPONSE IN MARKDOWN WITH THESE SECTIONS:
1. **Summary of Yesterday:** Very brief 1-sentence recap.
2. **Action Items:** Bullet points of things the founder explicitly needs to do (based on their memories).
3. **Network Nudges:** Suggest 1-2 people from the network graph they should follow up with today, and why.
4. **Insights:** One deep insight about their network or recent conversations.

VALKEY NETWORK GRAPH (Entities):
${networkContext.length > 0 ? networkContext.map(c => `- ${c}`).join('\\n') : "No entities extracted yet."}

VALKEY RECENT MEMORIES (Context):
${recentMemories.length > 0 ? recentMemories.join('\\n---\\n') : "No recent conversations."}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.0-pro',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ],
    });

    return NextResponse.json({ briefing: response.text });
  } catch (error: any) {
    console.error("Briefing API Error:", error);
    return NextResponse.json({ briefing: `[Briefing Error] ${error.message}` }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import valkey from '@/lib/valkey';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

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
      project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
      location: process.env.GCP_REGION || 'us-central1',
      vertexai: true
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

    let responseText = "";
    if (!process.env.GEMINI_API_KEY && process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const groqResponse = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt }
        ],
        model: "llama-3.3-70b-versatile",
      });
      responseText = groqResponse.choices[0]?.message?.content || "";
    } else {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] }
        ],
      });
      responseText = response.text || "";
    }

    return NextResponse.json({ briefing: responseText });
  } catch (error: any) {
    console.error("Briefing API Error:", error);
    return NextResponse.json({ briefing: `[Briefing Error] ${error.message}` }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import valkey from '@/lib/valkey';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const breethApiKey = process.env.BREETH_AI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Valkey Session Memory
    const memoryKey = `session_memory`;
    await valkey.lpush(memoryKey, JSON.stringify({ role: 'user', content: message }));
    await valkey.ltrim(memoryKey, 0, 50);

    // 2. Simple fallback network extraction
    if (message.toLowerCase().includes('met ') || message.toLowerCase().includes('connected with') || message.toLowerCase().includes('know')) {
      await valkey.sadd('network_connections', message);
    }

    // 3. Breeth AI Integration (Memory/Intent Extraction)
    let breethStatus = "Skipped";
    if (breethApiKey) {
      try {
        const breethResponse = await fetch('https://api.thebreeth.com/v1/episodes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${breethApiKey}`
          },
          body: JSON.stringify({
            content: message,
            extract_intent: true
          })
        });

        if (breethResponse.ok) {
          breethStatus = "Memory graphed by Breeth AI.";
        } else {
          breethStatus = `Breeth Error: ${breethResponse.statusText}`;
        }
      } catch (err: any) {
        breethStatus = `Breeth Request Failed: ${err.message}`;
      }
    }

    // 4. Fetch past network context from Valkey
    const networkContext = await valkey.smembers('network_connections');

    // 5. 10x Intelligent Generation using Gemini (Vertex AI)
    let reply = '';
    
    try {
      // Initialize Vertex AI using Application Default Credentials
      // Ensure you run `gcloud auth application-default login` if running locally
      const ai = new GoogleGenAI({
        vertexai: {
          project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
          location: process.env.GCP_REGION || 'us-central1',
        }
      });
      
      const systemPrompt = `You are Nexus, an elite executive assistant and context engine for a startup founder. 
Your tone is sharp, professional, and highly intelligent. 

CRITICAL CONTEXT FROM THE FOUNDER'S NETWORK MEMORY (Loaded from Valkey + Breeth AI):
${networkContext.length > 0 ? networkContext.map(c => `- ${c}`).join('\n') : "No connections found yet."}

INSTRUCTIONS:
1. When the founder asks a question (like "who is alex"), analyze the CONTEXT above to give a precise, confident answer. Do not say "Based on the context...", just give the answer naturally as if you remember it.
2. If the founder tells you about a new meeting (e.g. "I met John..."), acknowledge that you have permanently saved this connection to their memory graph and analyze how this person could be useful for their startup.
3. If they ask a general question, answer brilliantly.`;

      // Add the system instructions and the latest message
      const response = await ai.models.generateContent({
        model: 'gemini-3.0-pro',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + message }] }
        ],
      });

      reply = response.text + `\n\n*(⚡ ${breethStatus} | Model: Vertex AI Gemini 3.0 Pro)*`;
    } catch (err: any) {
      console.error("Gemini Error:", err);
      reply = `[Vertex AI Error] Make sure your Application Default Credentials are set up. Error: ${err.message}`;
    }

    // Save assistant reply to Valkey
    await valkey.lpush(memoryKey, JSON.stringify({ role: 'assistant', content: reply }));

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import valkey from '@/lib/valkey';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    // 1. Accept optional mediaFiles (array of { mimeType, base64Data })
    const { message, history, mediaFiles } = await req.json();
    const breethApiKey = process.env.BREETH_AI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Valkey Session Memory
    const memoryKey = `session_memory`;
    await valkey.lpush(memoryKey, JSON.stringify({ role: 'user', content: message }));
    await valkey.ltrim(memoryKey, 0, 50);

    // Note: Crude fallback extraction removed. 
    // We now use Vertex AI for intelligent entity extraction below.
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
1. When the founder asks a question, analyze the CONTEXT above to give a precise, confident answer. Do not say "Based on the context...", just answer naturally.
2. EXTRACT ENTITIES: Always look for new people, companies, or key relationships mentioned in the user's message (or in uploaded business cards/audio). 
3. JSON FORMAT: You MUST return a JSON object with exactly two keys:
   - "reply": Your conversational response to the founder.
   - "extracted_contacts": An array of strings representing new people/companies found (e.g., ["Sam Altman (OpenAI)", "Sarah (Designer)"]). If none, return an empty array [].`;

      // Construct the parts array
      const parts: any[] = [{ text: systemPrompt + '\n\n' + message }];

      // Attach any media files (images/audio) for Gemini to process natively
      if (mediaFiles && Array.isArray(mediaFiles)) {
        mediaFiles.forEach((file) => {
          parts.push({
            inlineData: {
              data: file.base64Data,
              mimeType: file.mimeType
            }
          });
        });
      }

      // 10x Intelligent Generation using Gemini (Vertex AI) with Multimodal support
      const response = await ai.models.generateContent({
        model: 'gemini-3.0-pro',
        contents: [
          { role: 'user', parts: parts }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      // Parse the JSON response from Gemini
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.text || "{}");
      } catch (e) {
        parsedResponse = { reply: response.text, extracted_contacts: [] };
      }

      // 6. Save cleanly extracted entities to Valkey Network Graph
      if (parsedResponse.extracted_contacts && Array.isArray(parsedResponse.extracted_contacts) && parsedResponse.extracted_contacts.length > 0) {
        for (const contact of parsedResponse.extracted_contacts) {
          await valkey.sadd('network_connections', contact);
        }
      }

      reply = (parsedResponse.reply || "Done.") + `\n\n*(⚡ ${breethStatus} | Model: Vertex AI Gemini 3.0 Pro | 👁️ Multimodal)*`;
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

import { GoogleGenAI } from '@google/genai';

async function run() {
  const ai = new GoogleGenAI({
    vertexai: {
      project: 'gen-lang-client-0121009752',
      location: 'us-central1',
    }
  });

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3.0-pro',
        contents: [
          { role: 'user', parts: [{ text: "Hello" }] }
        ],
      });
      console.log("gemini-3.0-pro worked:", response.text);
  } catch(e) {
    console.error("gemini-3.0-pro failed:", e);
  }
}
run();

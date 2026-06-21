import os

def patch_file(fpath, is_search=False):
    if not os.path.exists(fpath):
        return

    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Add groq import at the top
    if "import Groq from 'groq-sdk';" not in content:
        content = content.replace("import { GoogleGenAI } from '@google/genai';", "import { GoogleGenAI } from '@google/genai';\nimport Groq from 'groq-sdk';")

    # The AI init is already updated from earlier patch, we just need to replace the generateContent part
    old_block = """    const response = await ai.models.generateContent({
      model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt"""

    if is_search:
        old_block_full = """    const response = await ai.models.generateContent({
      model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\\n\\nUSER QUERY: ' + query }] }
      ],
    });

    return NextResponse.json({ reply: response.text });"""
    
        new_block_full = """    let responseText = "";
    if (!process.env.GEMINI_API_KEY && process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const groqResponse = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        model: "llama-3.3-70b-versatile",
      });
      responseText = groqResponse.choices[0]?.message?.content || "";
    } else {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\\n\\nUSER QUERY: ' + query }] }
        ],
      });
      responseText = response.text || "";
    }

    return NextResponse.json({ reply: responseText });"""
    else:
        # briefing
        old_block_full = """    const response = await ai.models.generateContent({
      model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ],
    });

    return NextResponse.json({ briefing: response.text });"""
    
        new_block_full = """    let responseText = "";
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

    return NextResponse.json({ briefing: responseText });"""

    if old_block_full in content:
        content = content.replace(old_block_full, new_block_full)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully patched {fpath} for Groq fallback.")
    else:
        print(f"Could not find the target block in {fpath}.")

patch_file(r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\briefing\route.ts", is_search=False)
patch_file(r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\search\route.ts", is_search=True)

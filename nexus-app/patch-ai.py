import os

files = [
    r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\briefing\route.ts",
    r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\chat\route.ts",
    r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\search\route.ts",
    r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\nexus-mcp.js"
]

for fpath in files:
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace Vertex AI initialization with fallback
        old_init = """const ai = new GoogleGenAI({
        project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
        location: process.env.GCP_REGION || 'us-central1',
        vertexai: true
      });"""
        
        new_init = """const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : new GoogleGenAI({
        project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
        location: process.env.GCP_REGION || 'us-central1',
        vertexai: true
      });"""
        
        content = content.replace(old_init, new_init)
        
        # Also handle nexus-mcp.js which has different indentation
        old_init_mcp = """const ai = new GoogleGenAI({
          project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
          location: process.env.GCP_REGION || 'us-central1',
          vertexai: true
        });"""
        
        new_init_mcp = """const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : new GoogleGenAI({
          project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
          location: process.env.GCP_REGION || 'us-central1',
          vertexai: true
        });"""
        
        content = content.replace(old_init_mcp, new_init_mcp)

        # Replace model usage to dynamically pick model based on auth type
        content = content.replace("model: 'gemini-1.5-pro-002',", "model: process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'gemini-1.5-pro-002',")
        
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched {fpath}")

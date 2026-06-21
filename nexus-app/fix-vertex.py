import os

files = [
    r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\briefing\route.ts",
    r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\chat\route.ts",
    r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\src\app\api\search\route.ts",
]

for fpath in files:
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # The replacement string
        old_str = """    const ai = new GoogleGenAI({
      vertexai: {
        project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
        location: process.env.GCP_REGION || 'us-central1',
      }
    });"""
        
        new_str = """    const ai = new GoogleGenAI({
      project: process.env.GCP_PROJECT_ID || 'gen-lang-client-0121009752',
      location: process.env.GCP_REGION || 'us-central1',
      vertexai: true
    });"""
        
        content = content.replace(old_str, new_str)
        
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed Vertex AI typing in {fpath}")

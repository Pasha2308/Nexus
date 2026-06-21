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
        
        # Change model to gemini-1.5-pro-002 which is the correct Vertex identifier
        content = content.replace("'gemini-1.5-pro'", "'gemini-1.5-pro-002'")
        
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated model in {fpath}")

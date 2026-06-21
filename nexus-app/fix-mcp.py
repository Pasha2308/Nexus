import os

fpath = r"c:\Users\coole\Downloads\AI App\pasha projects\react-hyde\nexus-app\nexus-mcp.js"

if os.path.exists(fpath):
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove backslash before backtick
    content = content.replace("\\`", "`")
    # Remove backslash before dollar sign
    content = content.replace("\\$", "$")
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed {fpath}")

import subprocess
import json
import urllib.request
import urllib.error

try:
    token_bytes = subprocess.check_output(["gcloud.cmd", "auth", "print-access-token"], shell=True)
    token = token_bytes.decode('utf-8').strip()

    # The user asked about gemini 3.5, gemini 1.5 pro, etc.
    # We will test access to gemini-1.5-pro, gemini-1.5-pro-002, and gemini-1.5-flash
    models_to_test = [
        "gemini-1.5-pro",
        "gemini-1.5-pro-001",
        "gemini-1.5-pro-002",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.0-pro"
    ]
    
    project_id = "gen-lang-client-0121009752"
    location = "us-central1"
    
    for model_id in models_to_test:
        url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{model_id}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        
        try:
            with urllib.request.urlopen(req) as response:
                print(f"[SUCCESS] {model_id} exists and is accessible.")
        except urllib.error.HTTPError as e:
            print(f"[FAILED]  {model_id} - HTTP {e.code}: {e.reason}")
            
except Exception as e:
    print("Error:", e)

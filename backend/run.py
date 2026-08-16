import uvicorn
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv(Path(__file__).parent / ".env")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Launching KrishiSetu Backend on http://127.0.0.1:{port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

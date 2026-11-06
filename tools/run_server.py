import os
import sys
import pathlib

root_dir = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

# Load .env locally if present
try:
    import dotenv
    env_file = root_dir / ".env"
    if env_file.exists():
        dotenv.load_dotenv(env_file)
except Exception:
    pass

from fastapi.staticfiles import StaticFiles
import api.index as api_module
import uvicorn

# Mount static assets mirroring Vercel's routing for local development
assets_dir = root_dir / "frontend" / "assets"
if assets_dir.exists():
    api_module.app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

if __name__ == "__main__":
    port = 8000
    print(f"Server local berjalan di http://localhost:{port}")
    uvicorn.run(api_module.app, host="127.0.0.1", port=port, log_level="info")


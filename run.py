"""
PlanGuard Universal Production Launcher
Boots the FastAPI + Uvicorn engine with automatic fallback.
"""

import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FASTAPI_SCRIPT = ROOT_DIR / "backend" / "main_fastapi.py"
FALLBACK_SCRIPT = ROOT_DIR / "backend" / "server.py"

if __name__ == "__main__":
    print("\n========================================================")
    print("  Launching PlanGuard Enterprise FastAPI + Uvicorn...")
    print(f"  Root: {ROOT_DIR}")
    print("========================================================\n")
    
    try:
        import uvicorn
        import fastapi
        subprocess.run([sys.executable, str(FASTAPI_SCRIPT)] + sys.argv[1:])
    except ImportError:
        print("[Notice] FastAPI/Uvicorn not found, running via Python Standard Async Server...")
        subprocess.run([sys.executable, str(FALLBACK_SCRIPT)] + sys.argv[1:])

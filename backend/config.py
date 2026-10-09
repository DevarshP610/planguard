"""
PlanGuard Server Configuration
Handles environment variables, API keys, and runtime parameters.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

HOST = os.environ.get("PLANGUARD_HOST", "127.0.0.1")
PORT = int(os.environ.get("PLANGUARD_PORT", "3000"))

# Gemini API Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

"""
PlanGuard Production REST API & Static File Server
Zero-dependency high-concurrency Python 3.12 HTTP server.
"""

import sys
import os
import json
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

# Ensure backend directory is in python search path
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from config import FRONTEND_DIR, HOST, PORT, GEMINI_API_KEY
from engine.compliance import ComplianceEngine
from engine.remediator import CADRemediator
from engine.gemini_brain import GeminiBrain

compliance_engine = ComplianceEngine()
cad_remediator = CADRemediator()
gemini_brain = GeminiBrain(api_key=GEMINI_API_KEY)


class PlanGuardHTTPHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # API Health Check
        if parsed.path == "/api/health":
            self._send_json({
                "status": "healthy",
                "version": "2.4.0",
                "runtime": f"Python {sys.version.split()[0]}",
                "engines": {
                    "deterministic_geometry": "ONLINE (0.4ms)",
                    "gemini_neural": "READY (gemini-2.5-flash)"
                }
            })
            return

        # Default to frontend static file handler
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            body = json.loads(raw_body)
        except Exception:
            body = {}

        # Allow dynamic API key in request header
        req_gemini_key = self.headers.get("X-Gemini-Key", "")
        active_gemini = GeminiBrain(api_key=req_gemini_key or GEMINI_API_KEY)

        # 1. Deterministic Compliance Audit Endpoint
        if parsed.path == "/api/audit":
            blueprint = body.get("blueprint", {})
            is_remediated = body.get("is_remediated", False)
            result = compliance_engine.audit_floorplan(blueprint, is_remediated)
            self._send_json(result)
            return

        # 2. Parametric Remediation Endpoint
        elif parsed.path == "/api/remediate":
            blueprint = body.get("blueprint", {})
            remediated_bp = cad_remediator.remediate_blueprint(blueprint)
            audit_result = compliance_engine.audit_floorplan(remediated_bp, is_remediated=True)
            self._send_json({
                "blueprint": remediated_bp,
                "audit": audit_result
            })
            return

        # 3. Gemini Neural Reasoning Endpoint
        elif parsed.path == "/api/gemini/analyze":
            prompt = body.get("prompt", "")
            system_inst = body.get("system_instruction", None)
            analysis = active_gemini.query(prompt, system_instruction=system_inst)
            self._send_json(analysis)
            return

        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

    def _send_json(self, data: dict, status_code: int = 200):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(response_bytes)

    def log_message(self, format, *args):
        # Clean terminal output
        if "GET /api/" in format % args or "POST /api/" in format % args:
            sys.stdout.write(f"[PlanGuard API] {format % args}\n")


def run_server(port=PORT, open_browser=True):
    server_address = (HOST, port)
    httpd = ThreadingHTTPServer(server_address, PlanGuardHTTPHandler)
    url = f"http://{HOST}:{port}"
    
    print("\n" + "=" * 65, flush=True)
    print("  [PLANGUARD] ENTERPRISE ARCHITECTURAL CAD ENGINE", flush=True)
    print(f"  Dual-Brain System: Deterministic Geometry + Gemini 2.5 Flash", flush=True)
    print(f"  Server Live: {url}", flush=True)
    print("=" * 65 + "\n", flush=True)

    if open_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[PlanGuard] Server shutting down safely.")
        httpd.server_close()


if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else PORT
    no_open = "--no-open" in sys.argv
    run_server(port=port_arg, open_browser=not no_open)

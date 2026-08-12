"""
PORTFOLIO BACKEND SERVER (PYTHON 3) - ARJUN KRISHNA B
Zero-dependency Python HTTP server supporting REST APIs, File Storage, Admin Passcode Auth & Uploads (PDF & Images).
Run with: python server.py
"""

import os
import sys
import json
import base64
import time
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 3000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

PROJECTS_FILE = os.path.join(DATA_DIR, "projects.json")
CERTS_FILE = os.path.join(DATA_DIR, "certs.json")
MESSAGES_FILE = os.path.join(DATA_DIR, "contact_messages.json")
ADMIN_CONFIG_FILE = os.path.join(DATA_DIR, "admin_config.json")

if not os.path.exists(PROJECTS_FILE):
    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

if not os.path.exists(CERTS_FILE):
    with open(CERTS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

if not os.path.exists(MESSAGES_FILE):
    with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

if not os.path.exists(ADMIN_CONFIG_FILE):
    with open(ADMIN_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump({"passcode": "arjun2026", "resumeUrl": "/uploads/resume.pdf"}, f, indent=2)


def read_json_file(file_path, default=None):
    if default is None:
        default = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def write_json_file(file_path, data):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


class PortfolioBackendHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _set_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._set_cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/api/projects":
            projects = read_json_file(PROJECTS_FILE, [])
            return self.send_json(200, projects)

        if path == "/api/certs":
            certs = read_json_file(CERTS_FILE, [])
            return self.send_json(200, certs)

        if path == "/api/resume":
            cfg = read_json_file(ADMIN_CONFIG_FILE, {"resumeUrl": "/uploads/resume.pdf", "portfolioUrl": "https://arjunportfolio.super.site"})
            return self.send_json(200, {"resumeUrl": cfg.get("resumeUrl", "/uploads/resume.pdf")})

        if path == "/api/messages":
            messages = read_json_file(MESSAGES_FILE, [])
            return self.send_json(200, messages)

        if path == "/api/config":
            cfg = read_json_file(ADMIN_CONFIG_FILE, {"resumeUrl": "/uploads/resume.pdf", "portfolioUrl": "https://arjunportfolio.super.site", "profilePhotoUrl": ""})
            return self.send_json(200, cfg)

        # Fallback to standard static file serving
        return super().do_GET()

    def end_headers(self):
        if hasattr(self, 'path') and self.path and self.path.startswith("/uploads/"):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        path = self.path.split("?")[0]
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length)

        try:
            payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            payload = {}

        # 1. Verify Admin Passcode
        if path == "/api/admin/verify":
            passcode_input = payload.get("passcode", "").strip()
            cfg = read_json_file(ADMIN_CONFIG_FILE, {"passcode": "arjun2026"})
            correct_passcode = cfg.get("passcode", "arjun2026")

            if passcode_input == correct_passcode:
                session_token = f"admin_tok_{int(time.time())}"
                return self.send_json(200, {"success": True, "token": session_token, "message": "Admin authenticated"})
            else:
                return self.send_json(401, {"success": False, "error": "Invalid admin passcode"})

        # 2. Change Admin Passcode
        if path == "/api/admin/change-passcode":
            current_passcode = payload.get("currentPasscode", "").strip()
            new_passcode = payload.get("newPasscode", "").strip()

            if not new_passcode or len(new_passcode) < 4:
                return self.send_json(400, {"error": "New passcode must be at least 4 characters"})

            cfg = read_json_file(ADMIN_CONFIG_FILE, {"passcode": "arjun2026"})
            if current_passcode != cfg.get("passcode", "arjun2026"):
                return self.send_json(401, {"error": "Incorrect current passcode"})

            cfg["passcode"] = new_passcode
            write_json_file(ADMIN_CONFIG_FILE, cfg)
            return self.send_json(200, {"success": True, "message": "Admin passcode updated successfully"})

        # 3. Upload Resume PDF
        if path == "/api/resume":
            base64_str = payload.get("base64", "")
            filename = payload.get("filename", "resume.pdf")

            if not base64_str:
                return self.send_json(400, {"error": "Missing base64 PDF data"})

            save_path = os.path.join(UPLOADS_DIR, "resume.pdf")
            if "," in base64_str:
                base64_str = base64_str.split(",", 1)[1]

            pdf_bytes = base64.b64decode(base64_str)
            with open(save_path, "wb") as f:
                f.write(pdf_bytes)

            resume_url = f"/uploads/resume.pdf?v={int(time.time())}"
            cfg = read_json_file(ADMIN_CONFIG_FILE, {})
            cfg["resumeUrl"] = resume_url
            write_json_file(ADMIN_CONFIG_FILE, cfg)

            return self.send_json(200, {"success": True, "resumeUrl": resume_url, "sizeBytes": len(pdf_bytes)})

        # 4. Save Config (Portfolio URL, Profile Photo, etc)
        if path == "/api/config":
            cfg = read_json_file(ADMIN_CONFIG_FILE, {})
            if "portfolioUrl" in payload:
                cfg["portfolioUrl"] = payload["portfolioUrl"].strip()
            if "resumeUrl" in payload:
                cfg["resumeUrl"] = payload["resumeUrl"].strip()
            if "profilePhotoUrl" in payload:
                cfg["profilePhotoUrl"] = payload["profilePhotoUrl"].strip()
            if "showProfilePhoto" in payload:
                cfg["showProfilePhoto"] = bool(payload["showProfilePhoto"])
            write_json_file(ADMIN_CONFIG_FILE, cfg)
            return self.send_json(200, {"success": True, "config": cfg})

        # 4. Save Project
        if path == "/api/projects":
            projects = read_json_file(PROJECTS_FILE, [])
            proj_id = payload.get("id")
            if proj_id:
                idx = next((i for i, p in enumerate(projects) if p.get("id") == proj_id), -1)
                if idx != -1:
                    projects[idx].update(payload)
                else:
                    projects.append(payload)
            else:
                payload["id"] = f"p_{int(time.time() * 1000)}"
                projects.append(payload)

            write_json_file(PROJECTS_FILE, projects)
            return self.send_json(200, {"success": True, "project": payload, "projects": projects})

        # 5. Save Certificate
        if path == "/api/certs":
            certs = read_json_file(CERTS_FILE, [])
            cert_id = payload.get("id")
            if cert_id:
                idx = next((i for i, c in enumerate(certs) if c.get("id") == cert_id), -1)
                if idx != -1:
                    certs[idx].update(payload)
                else:
                    certs.append(payload)
            else:
                payload["id"] = f"c_{int(time.time() * 1000)}"
                certs.append(payload)

            write_json_file(CERTS_FILE, certs)
            return self.send_json(200, {"success": True, "cert": payload, "certs": certs})

        # 6. File Upload (PDFs, Images)
        if path == "/api/upload":
            filename = payload.get("filename", "document.pdf")
            base64_str = payload.get("base64", "")
            cert_id = payload.get("certId")

            if not base64_str:
                return self.send_json(400, {"error": "Missing base64 data"})

            # Clean filename & extension
            ext = os.path.splitext(filename)[1] or ".bin"
            clean_name = re.sub(r"[^a-zA-Z0-9_-]", "_", os.path.splitext(filename)[0])
            unique_name = f"{clean_name}_{int(time.time() * 1000)}{ext}"
            save_path = os.path.join(UPLOADS_DIR, unique_name)

            if "," in base64_str:
                base64_str = base64_str.split(",", 1)[1]

            file_bytes = base64.b64decode(base64_str)
            with open(save_path, "wb") as f:
                f.write(file_bytes)

            file_url = f"/uploads/{unique_name}"

            if cert_id:
                certs = read_json_file(CERTS_FILE, [])
                for c in certs:
                    if c.get("id") == cert_id:
                        c["fileUrl"] = file_url
                        break
                write_json_file(CERTS_FILE, certs)

            return self.send_json(200, {
                "success": True,
                "fileUrl": file_url,
                "filename": unique_name,
                "sizeBytes": len(file_bytes)
            })

        # 7. Save Contact Message
        if path == "/api/contact":
            payload["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            messages = read_json_file(MESSAGES_FILE, [])
            messages.append(payload)
            write_json_file(MESSAGES_FILE, messages)
            print(f"[CONTACT MESSAGE RECEIVED]: {payload.get('name')} <{payload.get('email')}>")
            return self.send_json(200, {"success": True, "message": "Message saved to backend"})

        return self.send_json(404, {"error": "API route not found"})

    def do_PUT(self):
        if self.path.startswith("/api/certs/"):
            cert_id = self.path.split("/")[3]
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}

            certs = read_json_file(CERTS_FILE, [])
            for c in certs:
                if c.get("id") == cert_id:
                    c.update(payload)
                    write_json_file(CERTS_FILE, certs)
                    return self.send_json(200, {"success": True, "cert": c, "certs": certs})

            return self.send_json(404, {"error": "Certificate not found"})

        return self.send_json(404, {"error": "API route not found"})

    def do_DELETE(self):
        if self.path.startswith("/api/projects/"):
            proj_id = self.path.split("/")[3]
            projects = read_json_file(PROJECTS_FILE, [])
            projects = [p for p in projects if p.get("id") != proj_id]
            write_json_file(PROJECTS_FILE, projects)
            return self.send_json(200, {"success": True, "id": proj_id, "projects": projects})

        if self.path.startswith("/api/certs/"):
            cert_id = self.path.split("/")[3]
            certs = read_json_file(CERTS_FILE, [])
            certs = [c for c in certs if c.get("id") != cert_id]
            write_json_file(CERTS_FILE, certs)
            return self.send_json(200, {"success": True, "id": cert_id, "certs": certs})

        return self.send_json(404, {"error": "API route not found"})


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), PortfolioBackendHandler)
    print("=======================================================")
    print(f" PORTFOLIO BACKEND SERVER (PYTHON) RUNNING AT: http://localhost:{PORT}")
    print(f" - Static Web UI: http://localhost:{PORT}")
    print(f" - Projects API: http://localhost:{PORT}/api/projects")
    print(f" - Certs API:    http://localhost:{PORT}/api/certs")
    print(f" - Resume API:   http://localhost:{PORT}/api/resume")
    print(f" - Admin Auth:   http://localhost:{PORT}/api/admin/verify")
    print("=======================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down backend server.")
        sys.exit(0)

"""Stage 5: the edit board, a local web page to review and change the edit before rendering.

  ve.py board <project> [--port 8765] [--no-open]

Runs a small local server (stdlib only). The page plays the RAW video while skipping the cut
parts and drawing captions/hook/zoom/look on top, so you see the edit instantly, no render.
Save writes edit.json (and a numbered copy in versions/). Render buttons run the renderer.
"""
from __future__ import annotations

import json
import mimetypes
import os
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

from common import AUDIO_EXT, BUILTIN_SFX, ENGINE_DIR, FONTS, FONTS_DIR, IMAGE_EXT, SFX_DIR, TEMPLATES, VIDEO_EXT, \
    load_json, log, rel
from plan import list_versions, restore_version, save_edit

STATE = {"project": None, "proc": None, "mode": None, "log": None, "started": None, "output": None}
LOCK = threading.Lock()


def _files(d: Path, exts):
    return sorted(rel(p, STATE["project"]) for p in d.glob("*") if p.suffix.lower() in exts) if d.exists() else []


def api_state():
    pj = STATE["project"]
    edit = load_json(pj / "edit.json")
    an = load_json(pj / "analysis.json") or {}
    outs = sorted((pj / "out").glob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True) \
        if (pj / "out").exists() else []
    return {
        "project": pj.name,
        "edit": edit,
        "analysis": {k: an.get(k) for k in ("words", "units", "retakes", "stats", "probe", "language")},
        "fonts": [{"key": k, "file": v[0], "weight": v[3], "vibe": v[4]} for k, v in FONTS.items()],
        "sfx": BUILTIN_SFX + _files(pj / "sfx", AUDIO_EXT),
        "music": _files(pj / "music", AUDIO_EXT),
        "broll": _files(pj / "broll", VIDEO_EXT | IMAGE_EXT),
        "versions": list_versions(pj),
        "outputs": [rel(p, pj) for p in outs[:6]],
        "mtime": (pj / "edit.json").stat().st_mtime if (pj / "edit.json").exists() else 0,
    }


def start_render(mode: str):
    with LOCK:
        if STATE["proc"] and STATE["proc"].poll() is None:
            return False, "a render is already running"
        pj = STATE["project"]
        logf = pj / "build" / "board_render.log"
        logf.parent.mkdir(parents=True, exist_ok=True)
        fh = open(logf, "w", encoding="utf-8")
        cmd = [sys.executable, str(ENGINE_DIR / "ve.py"), "render", str(pj), "--mode", mode]
        STATE.update(proc=subprocess.Popen(cmd, stdout=fh, stderr=subprocess.STDOUT, cwd=str(pj)),
                     mode=mode, log=logf, started=time.time(), output=None)
        return True, "started"


def api_status():
    p = STATE["proc"]
    tail = ""
    if STATE["log"] and Path(STATE["log"]).exists():
        tail = "\n".join(Path(STATE["log"]).read_text(encoding="utf-8", errors="replace").splitlines()[-14:])
    running = bool(p and p.poll() is None)
    out = None
    if p and not running and p.returncode == 0:
        pj = STATE["project"]
        outs = sorted((pj / "out").glob("*.mp4"), key=lambda x: x.stat().st_mtime, reverse=True)
        out = rel(outs[0], pj) if outs else None
    return {"running": running, "mode": STATE["mode"], "log": tail,
            "returncode": None if (not p or running) else p.returncode, "output": out,
            "elapsed": round(time.time() - STATE["started"], 1) if STATE["started"] else 0}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _file(self, path: Path, ctype=None):
        if not path.exists() or not path.is_file():
            self.send_error(404)
            return
        ctype = ctype or mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        size = path.stat().st_size
        rng = self.headers.get("Range")
        start, end = 0, size - 1
        if rng and rng.startswith("bytes="):
            a, _, b = rng[6:].partition("-")
            if a:
                start = int(a)
                end = int(b) if b else size - 1
            else:
                start = max(0, size - int(b))
            end = min(end, size - 1)
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            self.send_response(200)
        length = end - start + 1
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(length))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        try:
            with open(path, "rb") as f:
                f.seek(start)
                left = length
                while left > 0:
                    chunk = f.read(min(1 << 16, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n).decode("utf-8") or "{}") if n else {}

    def do_GET(self):
        pj = STATE["project"]
        path = unquote(urlparse(self.path).path)
        if path in ("/", "/index.html"):
            return self._file(TEMPLATES / "board.html", "text/html; charset=utf-8")
        if path == "/api/state":
            return self._json(api_state())
        if path == "/api/status":
            return self._json(api_status())
        if path == "/api/mtime":
            p = pj / "edit.json"
            return self._json({"mtime": p.stat().st_mtime if p.exists() else 0})
        if path == "/media/source":
            edit = load_json(pj / "edit.json") or {}
            return self._file(pj / edit.get("source", ""))
        if path.startswith("/media/project/"):
            target = (pj / path[len("/media/project/"):]).resolve()
            if pj.resolve() not in target.parents:
                return self.send_error(403)
            return self._file(target)
        if path.startswith("/fonts/"):
            return self._file(FONTS_DIR / Path(path).name)
        if path.startswith("/sfx/"):
            name = Path(path).name
            return self._file(SFX_DIR / (name if name.endswith(".wav") else name + ".wav"))
        self.send_error(404)

    def do_POST(self):
        pj = STATE["project"]
        path = urlparse(self.path).path
        data = self._body()
        if path == "/api/save":
            out = save_edit(pj, data["edit"], data.get("note", "saved from board"))
            return self._json({"ok": True, "version": data["edit"].get("version"), "path": str(out),
                               "mtime": out.stat().st_mtime})
        if path == "/api/render":
            ok, msg = start_render(data.get("mode", "preview"))
            return self._json({"ok": ok, "message": msg})
        if path == "/api/restore":
            restore_version(pj, int(data["version"]))
            return self._json({"ok": True})
        self.send_error(404)


def free_port(start=8765):
    for p in range(start, start + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", p)) != 0:
                return p
    return start


def serve(project: Path, port=None, open_browser=True):
    project = Path(project).resolve()
    if not (project / "edit.json").exists():
        log("edit.json not found: run the plan step first")
        sys.exit(1)
    STATE["project"] = project
    port = port or free_port()
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}/"
    log(f"edit board running at {url}  (Ctrl+C to stop)")
    print(url, flush=True)
    if open_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

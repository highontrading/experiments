"""Shared helpers for the Vibe Editing engine: paths, ffmpeg, JSON, time maps."""
from __future__ import annotations

import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

ENGINE_DIR = Path(__file__).resolve().parent
SKILL_DIR = ENGINE_DIR.parent
ASSETS = SKILL_DIR / "assets"
FONTS_DIR = ASSETS / "fonts"
SFX_DIR = ASSETS / "sfx"
TEMPLATES = SKILL_DIR / "templates"
HOME_DIR = Path.home() / ".vibe-editing"

VIDEO_EXT = {".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi", ".mts"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
AUDIO_EXT = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"}

# Fonts shipped with the plugin. key -> (file, ASS family name, ASS bold flag, CSS weight, vibe, em_ratio)
# em_ratio = unitsPerEm / (winAscent + winDescent). Style sizes are EM sizes (like CSS px on a 1080x1920
# frame); libass sizes fonts by full line height, so ASS size = em size / em_ratio.
FONTS = {
    "Poppins Black":      ("Poppins-Black.ttf", "Poppins Black", 0, 900, "geometric heavy sans, the classic bold reel caption", 0.568),
    "Poppins ExtraBold":  ("Poppins-ExtraBold.ttf", "Poppins ExtraBold", 0, 800, "geometric bold sans, a little softer", 0.568),
    "Poppins Bold":       ("Poppins-Bold.ttf", "Poppins", 1, 700, "geometric sans, clean", 0.568),
    "Anton":              ("Anton-Regular.ttf", "Anton", 0, 400, "tall condensed impact-style, news/podcast clips", 0.577),
    "Bebas Neue":         ("BebasNeue-Regular.ttf", "Bebas Neue", 0, 400, "tall condensed caps, cinematic titles", 0.769),
    "Archivo Black":      ("ArchivoBlack-Regular.ttf", "Archivo Black", 0, 400, "wide heavy grotesk, bold editorial", 0.742),
    "Archivo Expanded":   ("Archivo-Expanded-800.ttf", "Archivo Expanded ExtraBold", 0, 800, "very wide, modern brand look", 0.662),
    "Luckiest Guy":       ("LuckiestGuy-Regular.ttf", "Luckiest Guy", 0, 400, "chunky playful comic, YouTuber energy", 0.816),
    "Bangers":            ("Bangers-Regular.ttf", "Bangers", 0, 400, "comic book, loud and slanted", 0.569),
    "Lilita One":         ("LilitaOne-Regular.ttf", "Lilita One", 0, 400, "rounded heavy, friendly", 0.875),
    "Permanent Marker":   ("PermanentMarker-Regular.ttf", "Permanent Marker", 0, 400, "marker handwriting", 0.701),
    "Caveat":             ("Caveat-600.ttf", "Caveat SemiBold", 0, 600, "casual handwriting notes", 0.776),
    "DM Serif Display":   ("DMSerifDisplay-Regular.ttf", "DM Serif Display", 0, 400, "elegant high-contrast serif, luxury/editorial", 0.729),
    "Inter Bold":         ("Inter-Bold.otf", "Inter", 1, 700, "neutral UI sans, clean and minimal", 0.826),
    "Inter ExtraBold":    ("Inter-ExtraBold.otf", "Inter ExtraBold", 0, 800, "neutral heavy sans, minimal", 0.826),
}
DEFAULT_FONT = "Poppins Black"

PRESETS = {
    "reels":    {"width": 1080, "height": 1920, "fps": 30},
    "shorts":   {"width": 1080, "height": 1920, "fps": 30},
    "tiktok":   {"width": 1080, "height": 1920, "fps": 30},
    "portrait": {"width": 1080, "height": 1350, "fps": 30},
    "square":   {"width": 1080, "height": 1080, "fps": 30},
    "youtube":  {"width": 1920, "height": 1080, "fps": 30},
    "lesson":   {"width": 1920, "height": 1080, "fps": 30},
}

BUILTIN_SFX = ["whoosh", "swoosh", "pop", "click", "ding", "riser", "impact", "boom", "tick", "swipe", "glitch", "shutter"]


# ---------------------------------------------------------------- output
def log(msg: str) -> None:
    print(f"[vibe] {msg}", file=sys.stderr, flush=True)


def die(msg: str, code: int = 1) -> None:
    print(f"[vibe] ERROR: {msg}", file=sys.stderr, flush=True)
    sys.exit(code)


def load_json(path, default=None):
    p = Path(path)
    if not p.exists():
        return default
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(p.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, p)


def rel(path, base) -> str:
    """Forward-slash relative path (stable in JSON on Windows too)."""
    try:
        return Path(os.path.relpath(Path(path).resolve(), Path(base).resolve())).as_posix()
    except ValueError:  # different drive on Windows
        return Path(path).resolve().as_posix()


# ---------------------------------------------------------------- ffmpeg
def which(name: str) -> str | None:
    return shutil.which(name)


def run(cmd, cwd=None, check=True, quiet=True):
    """Run a command; return CompletedProcess with text stdout/stderr."""
    cmd = [str(c) for c in cmd]
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if check and r.returncode != 0:
        tail = "\n".join(r.stderr.strip().splitlines()[-25:])
        die(f"command failed ({cmd[0]}):\n{' '.join(cmd[:12])}{' ...' if len(cmd) > 12 else ''}\n{tail}")
    return r


def ffmpeg_major() -> int:
    r = run(["ffmpeg", "-version"], check=False)
    m = re.search(r"ffmpeg version n?(\d+)", r.stdout)
    return int(m.group(1)) if m else 6


def probe(path) -> dict:
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)])
    data = json.loads(r.stdout or "{}")
    v = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
    a = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
    dur = float(data.get("format", {}).get("duration") or 0)
    info = {"duration": dur, "has_video": v is not None, "has_audio": a is not None}
    if v:
        w, h = int(v.get("width", 0)), int(v.get("height", 0))
        rot = 0
        for sd in v.get("side_data_list", []) or []:
            if "rotation" in sd:
                rot = int(float(sd["rotation"]))
        if "rotate" in (v.get("tags") or {}):
            rot = int(v["tags"]["rotate"])
        if abs(rot) % 180 == 90:
            w, h = h, w
        fr = v.get("avg_frame_rate") or v.get("r_frame_rate") or "30/1"
        try:
            n, d = fr.split("/")
            fps = float(n) / float(d) if float(d) else 30.0
        except Exception:
            fps = 30.0
        if not (1 < fps < 241):
            fps = 30.0
        info.update(width=w, height=h, fps=round(fps, 3), codec=v.get("codec_name"))
        if not dur:
            info["duration"] = float(v.get("duration") or 0)
    if a:
        info["sample_rate"] = int(a.get("sample_rate", 48000))
    return info


def filter_script_args(script_path: str) -> list[str]:
    """ffmpeg 7+ prefers -/filter_complex <file>; older builds use -filter_complex_script."""
    if ffmpeg_major() >= 7:
        return ["-/filter_complex", script_path]
    return ["-filter_complex_script", script_path]


def run_ffmpeg_progress(cmd, total_seconds: float, cwd=None, label="render"):
    """Run ffmpeg printing a percentage line now and then. Returns returncode, stderr tail."""
    cmd = [str(c) for c in cmd]
    cmd = cmd[:1] + ["-hide_banner", "-nostats", "-progress", "pipe:1", "-loglevel", "error"] + cmd[1:]
    p = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                         encoding="utf-8", errors="replace")
    last = -10.0
    t0 = time.time()
    for line in p.stdout:
        if line.startswith("out_time_us=") or line.startswith("out_time_ms="):
            try:
                us = int(line.split("=")[1])
            except ValueError:
                continue
            pct = min(100.0, us / 1e6 / max(total_seconds, 0.01) * 100)
            if pct - last >= 10:
                last = pct
                log(f"{label}: {pct:5.1f}%  ({time.time() - t0:.0f}s)")
    err = p.stderr.read()
    p.wait()
    return p.returncode, err


def extract_frames_rgb(path, times, width=128):
    """Return a list of HxWx3 uint8 numpy arrays sampled at the given times."""
    import numpy as np
    out = []
    for t in times:
        r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(0, t):.3f}", "-i", str(path), "-frames:v", "1",
                            "-vf", f"scale={width}:-2", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                           capture_output=True)
        if r.returncode != 0 or not r.stdout:
            continue
        n = len(r.stdout) // 3
        h = n // width
        if h <= 0:
            continue
        out.append(np.frombuffer(r.stdout[: width * h * 3], dtype=np.uint8).reshape(h, width, 3))
    return out


def image_rgb(path, width=160):
    return extract_frames_rgb(path, [0], width)


def tile_frames(src, times, out_path, cols=4, width=360, label=True):
    """Make a contact sheet of frames at `times` (seconds) from a video."""
    tmpdir = Path(out_path).parent / f".tiles_{Path(out_path).stem}"
    tmpdir.mkdir(parents=True, exist_ok=True)
    files = []
    for i, t in enumerate(times):
        f = tmpdir / f"f{i:03d}.jpg"
        vf = f"scale={width}:-2"
        if label:
            vf += (f",drawbox=x=0:y=0:w=iw:h=28:color=black@0.6:t=fill,"
                   f"drawtext=text='{t:.2f}s':x=8:y=6:fontsize=18:fontcolor=white")
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, t):.3f}", "-i", str(src), "-frames:v", "1",
                            "-vf", vf, "-q:v", "3", str(f)], capture_output=True)
        if r.returncode != 0 and label:  # drawtext may be missing: retry without label
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, t):.3f}", "-i", str(src), "-frames:v",
                            "1", "-vf", f"scale={width}:-2", "-q:v", "3", str(f)], capture_output=True)
        if f.exists():
            files.append(f)
    if not files:
        return None
    rows = math.ceil(len(files) / cols)
    pattern = tmpdir / "f%03d.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-start_number", "0", "-i", str(pattern),
                    "-vf", f"tile={cols}x{rows}:padding=6:color=white", "-frames:v", "1", "-q:v", "3",
                    str(out_path)], capture_output=True)
    shutil.rmtree(tmpdir, ignore_errors=True)
    return out_path if Path(out_path).exists() else None


# ---------------------------------------------------------------- colours
def hex_rgb(hx: str):
    hx = (hx or "#ffffff").lstrip("#")
    if len(hx) == 3:
        hx = "".join(c * 2 for c in hx)
    return int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16)


def ass_color(hx: str, alpha: float = 0.0) -> str:
    """'#RRGGBB' + transparency 0..1 -> ASS &HAABBGGRR"""
    r, g, b = hex_rgb(hx)
    a = int(round(max(0.0, min(1.0, alpha)) * 255))
    return f"&H{a:02X}{b:02X}{g:02X}{r:02X}"


def ass_c(hx: str) -> str:
    """Inline override colour form &HBBGGRR&"""
    r, g, b = hex_rgb(hx)
    return f"&H{b:02X}{g:02X}{r:02X}&"


def font_info(key: str):
    if key in FONTS:
        return key, FONTS[key]
    low = (key or "").lower()
    for k, v in FONTS.items():
        if low and (low in k.lower() or k.lower() in low):
            return k, v
    return DEFAULT_FONT, FONTS[DEFAULT_FONT]


# ---------------------------------------------------------------- project
def find_workspace(project_dir: Path) -> Path:
    return Path(project_dir).resolve().parent


def styles_dir(project_dir: Path | None = None, workspace: Path | None = None) -> Path:
    ws = Path(workspace) if workspace else find_workspace(project_dir)
    return ws / "styles"


def resolve_style(name_or_path, project_dir=None, workspace=None):
    """Return (style_dict, style_dir) for a style name in the library or a path to style.json/dir."""
    if not name_or_path or name_or_path in ("none", "default"):
        return None, None
    p = Path(name_or_path)
    cands = []
    if p.suffix == ".json":
        cands.append(p)
    cands += [p / "style.json", styles_dir(project_dir, workspace) / str(name_or_path) / "style.json"]
    if project_dir:
        cands.append(Path(project_dir) / str(name_or_path))
    for c in cands:
        if c.exists() and c.is_file():
            return load_json(c), c.parent
    return None, None


class TimeMap:
    """Maps source-video time to output time for a list of kept (start, end) ranges."""

    def __init__(self, kept):
        self.kept = sorted([(float(s), float(e)) for s, e in kept if e - s > 0.001])
        self.offsets = []
        acc = 0.0
        for s, e in self.kept:
            self.offsets.append(acc)
            acc += e - s
        self.total = acc

    def inside(self, t: float) -> bool:
        return any(s <= t < e for s, e in self.kept)

    def to_out(self, t: float, snap: str = "next"):
        for (s, e), off in zip(self.kept, self.offsets):
            if s <= t < e:
                return off + (t - s)
            if t < s:
                if snap == "next":
                    return off
                if snap == "prev":
                    return off  # start of next == end of previous in output time
                return None
        return self.total if snap in ("next", "prev") else None


def kept_ranges(edit: dict):
    segs = [s for s in edit.get("segments", []) if s.get("keep", True)]
    segs.sort(key=lambda s: s["start"])
    return segs


def fmt_time(t: float) -> str:
    t = max(0.0, t)
    m, s = divmod(t, 60)
    return f"{int(m)}:{s:05.2f}"

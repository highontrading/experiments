#!/usr/bin/env python3
"""Vibe Editor engine.

Claude drives this script. The heavy lifting (transcription, cutting, motion
graphics, captions, sound, rendering) happens here so Claude only has to write
a small edit plan (edit.json) and give notes.

Commands (run `python3 vibe.py <command> -h` for options):
  install     Install Python packages + ffmpeg, pre-download the speech model
  doctor      Check that everything works and print fixes
  init        Create a Vibe Editor workspace folder
  prep        Transcribe a raw video, auto-cut pauses, write a starter edit plan
  fix         Correct / transliterate transcript words (spellings, Hinglish)
  timeline    Show the transcript on the edited (output) timeline
  render      Render the final reel (or a fast --preview)
  stills      Grab frames from a render into a contact sheet to review
  cover       Make a reel cover image
  peek        Contact sheet of any video (study a reference reel's style)
  list        Show the effects library (captions, looks, sfx, fonts, effects)
"""
import argparse
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL_DIR = os.path.dirname(HERE)
LIB = os.path.join(SKILL_DIR, "library")
VERSION = "1.0.0"

FPS = 30
SR = 48000


# --------------------------------------------------------------------------- utils

def die(msg, code=1):
    print(f"\n❌ {msg}", file=sys.stderr)
    sys.exit(code)


def info(msg):
    print(msg, flush=True)


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def lib(name):
    return load_json(os.path.join(LIB, name), {})


def slug(s):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "reel"


def fmt_ts(t):
    t = max(0.0, t)
    m = int(t // 60)
    return f"{m:02d}:{t - m * 60:05.2f}"


# --------------------------------------------------------------------------- ffmpeg

_FF = None


def _has_libass(exe):
    try:
        out = subprocess.run([exe, "-hide_banner", "-filters"], capture_output=True, text=True, timeout=30).stdout
        return " ass " in out and " zoompan " in out
    except Exception:
        return False


def ffmpeg():
    global _FF
    if _FF:
        return _FF
    cands = [os.environ.get("VIBE_FFMPEG"), shutil.which("ffmpeg")]
    try:
        import imageio_ffmpeg  # noqa
        cands.append(imageio_ffmpeg.get_ffmpeg_exe())
    except Exception:
        pass
    for c in cands:
        if c and os.path.exists(c) and _has_libass(c):
            _FF = c
            return c
    die("ffmpeg (with libass) not found. Run:  python3 vibe.py install")


def run_ff(args, cwd=None, desc="ffmpeg"):
    cmd = [ffmpeg(), "-hide_banner", "-y", "-loglevel", "error", "-stats"] + args
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if p.returncode != 0:
        tail = "\n".join(p.stderr.strip().splitlines()[-25:])
        die(f"{desc} failed:\n{tail}")
    return p


def probe(path):
    """Duration, fps, audio presence and *displayed* size (rotation applied)."""
    p = subprocess.run([ffmpeg(), "-hide_banner", "-i", path], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    err = p.stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    if not m:
        die(f"Could not read video: {path}")
    dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    fm = re.search(r"Video:.*?([\d.]+) fps", err)
    fps = float(fm.group(1)) if fm else 30.0
    has_audio = bool(re.search(r"Stream #.*Audio:", err))
    has_video = bool(re.search(r"Stream #.*Video:", err))
    w = h = 0
    if has_video:
        q = subprocess.run([ffmpeg(), "-hide_banner", "-loglevel", "error", "-i", path, "-frames:v", "1",
                            "-f", "image2pipe", "-c:v", "png", "-"], capture_output=True)
        b = q.stdout
        if len(b) > 24 and b[:8] == b"\x89PNG\r\n\x1a\n":
            w, h = struct.unpack(">II", b[16:24])
    return {"duration": dur, "fps": fps, "has_audio": has_audio, "has_video": has_video, "width": w, "height": h}


# --------------------------------------------------------------------------- workspace

WS_DIRS = ["inbox", "output", "brand", "broll", "music", "references"]


def find_ws(start=None):
    d = os.path.abspath(start or os.getcwd())
    cur = d
    while True:
        if os.path.exists(os.path.join(cur, "vibe.json")):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            return d
        cur = parent


def ws_paths(ws):
    return {
        "ws": ws,
        "vibe": os.path.join(ws, ".vibe"),
        "jobs": os.path.join(ws, ".vibe", "jobs"),
        "fonts": os.path.join(ws, ".vibe", "fonts"),
        "brand": os.path.join(ws, "brand", "brand.json"),
        "output": os.path.join(ws, "output"),
    }


def ensure_fonts(ws):
    dst = ws_paths(ws)["fonts"]
    os.makedirs(dst, exist_ok=True)
    src = os.path.join(LIB, "fonts")
    for f in os.listdir(src):
        if f.lower().endswith((".ttf", ".otf")) and not os.path.exists(os.path.join(dst, f)):
            shutil.copy2(os.path.join(src, f), os.path.join(dst, f))
    # user's own brand fonts
    bdir = os.path.join(ws, "brand")
    if os.path.isdir(bdir):
        for f in os.listdir(bdir):
            if f.lower().endswith((".ttf", ".otf")):
                shutil.copy2(os.path.join(bdir, f), os.path.join(dst, f))
    return dst


DEFAULT_BRAND = {
    "name": "",
    "handle": "",
    "niche": "",
    "vibe": "energetic, clean, modern",
    "language": "auto",
    "caption_script": "roman",
    "colors": {"accent": "#FFD400", "accent2": "#8B5CF6", "text": "#FFFFFF", "dark": "#111111", "card": "#FFFFFF"},
    "fonts": {"title": "poppins-black", "body": "inter-extrabold"},
    "caption_style": "bold-pop",
    "look": "punchy",
    "cta": "Follow for more",
    "logo": "",
    "notes": [],
}


def cmd_init(a):
    ws = os.path.abspath(a.path)
    os.makedirs(ws, exist_ok=True)
    for d in WS_DIRS:
        os.makedirs(os.path.join(ws, d), exist_ok=True)
    if not os.path.exists(os.path.join(ws, "vibe.json")):
        save_json(os.path.join(ws, "vibe.json"), {"vibe_editor": VERSION, "created": time.strftime("%Y-%m-%d")})
    bp = ws_paths(ws)["brand"]
    if not os.path.exists(bp):
        save_json(bp, DEFAULT_BRAND)
    ensure_fonts(ws)
    readme = os.path.join(ws, "START HERE.txt")
    if not os.path.exists(readme):
        with open(readme, "w", encoding="utf-8") as f:
            f.write(
                "VIBE EDITOR\n===========\n\n"
                "inbox/       Put your raw videos here.\n"
                "output/      Your finished reels, covers and captions appear here.\n"
                "brand/       Your logo, brand fonts (.ttf/.otf) and brand.json (colours, style).\n"
                "broll/       Extra clips or images to cut away to.\n"
                "music/       Background music you have the rights to use.\n"
                "references/  Reels you love, so Claude can match the style.\n\n"
                "Then just tell Claude:  /vibe-editor:edit  make my latest video a reel\n")
    info(f"✅ Workspace ready: {ws}")
    for d in WS_DIRS:
        info(f"   {d}/")


# --------------------------------------------------------------------------- install / doctor

PIP_PKGS = ["faster-whisper", "imageio-ffmpeg"]


def pip_install(pkgs):
    base = [sys.executable, "-m", "pip", "install", "--upgrade", "--disable-pip-version-check"]
    for extra in ([], ["--user"], ["--break-system-packages"], ["--user", "--break-system-packages"]):
        p = subprocess.run(base + extra + pkgs, capture_output=True, text=True)
        if p.returncode == 0:
            return True, ""
        last = p.stderr[-800:]
    return False, last


def cmd_install(a):
    info(f"Python {sys.version.split()[0]} at {sys.executable}")
    if sys.version_info < (3, 9):
        die("Python 3.9 or newer is needed.")
    info("Installing speech engine + ffmpeg (one time, a few minutes)…")
    ok, err = pip_install(PIP_PKGS)
    if not ok:
        die("pip install failed:\n" + err)
    info("✅ Python packages installed")
    global _FF
    _FF = None
    info(f"✅ ffmpeg: {ffmpeg()}")
    if not a.skip_model:
        info(f"Downloading speech model '{a.model}' (one time)…")
        from faster_whisper import WhisperModel
        WhisperModel(a.model, device="cpu", compute_type="int8")
        info("✅ Speech model ready")
    info("\n🎉 Vibe Editor is installed. Run `doctor` to double-check.")


def cmd_doctor(a):
    ok = True

    def row(good, label, fix=""):
        nonlocal ok
        ok = ok and good
        info(f"{'✅' if good else '❌'} {label}" + ("" if good else f"\n     fix: {fix}"))

    row(sys.version_info >= (3, 9), f"Python {sys.version.split()[0]}", "Install Python 3.10+ from python.org")
    try:
        import faster_whisper  # noqa
        row(True, f"Speech engine (faster-whisper {faster_whisper.__version__})")
    except Exception:
        row(False, "Speech engine missing", "python3 vibe.py install")
    ff = None
    try:
        global _FF
        _FF = None
        cands = [os.environ.get("VIBE_FFMPEG"), shutil.which("ffmpeg")]
        try:
            import imageio_ffmpeg
            cands.append(imageio_ffmpeg.get_ffmpeg_exe())
        except Exception:
            pass
        ff = next((c for c in cands if c and os.path.exists(c) and _has_libass(c)), None)
    except Exception:
        pass
    row(bool(ff), f"ffmpeg with subtitles/motion support: {ff or 'missing'}", "python3 vibe.py install")
    fonts = [f for f in os.listdir(os.path.join(LIB, "fonts")) if f.endswith((".ttf", ".otf"))]
    sfx = [f for f in os.listdir(os.path.join(LIB, "sfx")) if f.endswith(".wav")]
    row(len(fonts) > 10, f"Library: {len(fonts)} fonts, {len(sfx)} sound effects, "
        f"{len(lib('captions.json'))} caption styles, {len(lib('looks.json'))} looks")
    ws = find_ws(a.ws)
    row(os.path.exists(os.path.join(ws, "vibe.json")), f"Workspace: {ws}",
        "python3 vibe.py init \"<folder>\"  (creates inbox/, output/, brand/ …)")
    try:
        tf = os.path.join(ws, ".vibe_write_test")
        open(tf, "w").close()
        os.remove(tf)
        row(True, "Workspace is writable")
    except Exception as e:
        row(False, f"Workspace not writable ({e})", "Choose a folder you own, e.g. Documents/Vibe Editor")
    if ff and a.render_test:
        t0 = time.time()
        tmp = os.path.join(ws, ".vibe", "doctor")
        os.makedirs(tmp, exist_ok=True)
        with open(os.path.join(tmp, "t.ass"), "w", encoding="utf-8") as f:
            f.write(ass_header(1080, 1920, [("T", "Poppins Black", 90, "&H00FFFFFF", "&H00000000", 6, 0, 0, 0)])
                    + "Dialogue: 0,0:00:00.00,0:00:01.00,T,,0,0,0,,{\\an5\\pos(540,960)}Vibe ✓\n")
        _FF = ff
        try:
            fdir = os.path.relpath(ensure_fonts(ws), tmp).replace("\\", "/")
            run_ff(["-f", "lavfi", "-i", "color=c=0x222222:s=1080x1920:d=1:r=30", "-vf",
                    f"ass=t.ass:fontsdir={fdir}", "-c:v", "libx264", "-preset", "ultrafast", "t.mp4"],
                   cwd=tmp, desc="render test")
            row(True, f"Test render OK ({time.time() - t0:.1f}s)")
        except SystemExit:
            row(False, "Test render failed", "see error above")
    info("\nAll good! 🎬" if ok else "\nSome checks failed — apply the fixes above.")
    sys.exit(0 if ok else 1)


# --------------------------------------------------------------------------- transcription

FILLERS = {"um", "umm", "uh", "uhh", "uhm", "erm", "hmm", "hm", "mm", "mmm", "ah", "aah", "eh"}


def transcribe(src, job, lang=None, model_size="small"):
    try:
        from faster_whisper import WhisperModel
    except Exception:
        die("Speech engine not installed. Run:  python3 vibe.py install")
    import numpy as np
    # Decode with our own ffmpeg (avoids PyAV version clashes) and pass raw samples.
    p = subprocess.run([ffmpeg(), "-hide_banner", "-loglevel", "error", "-i", src, "-vn", "-ac", "1", "-ar", "16000",
                        "-f", "s16le", "-"], capture_output=True)
    if p.returncode != 0:
        die("Could not read the audio track:\n" + p.stderr.decode(errors="replace")[-600:])
    audio = np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768.0
    info(f"🎙  Transcribing with '{model_size}' model (language: {lang or 'auto'})…")
    t0 = time.time()
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    kw = dict(word_timestamps=True, beam_size=5, vad_filter=False, condition_on_previous_text=False)
    if lang and lang != "auto":
        kw["language"] = lang
    segs, inf = model.transcribe(audio, **kw)
    words = []
    for s in segs:
        for w in (s.words or []):
            txt = w.word.strip()
            if not txt:
                continue
            words.append({"i": len(words), "text": txt, "start": round(w.start, 3), "end": round(w.end, 3),
                          "p": round(w.probability, 2)})
    info(f"   {len(words)} words, language={inf.language} ({time.time() - t0:.0f}s)")
    return words, inf.language


# --------------------------------------------------------------------------- cutting

def snap(t):
    return round(t * FPS) / FPS


def norm_word(s):
    return re.sub(r"[^\w]+", "", s.lower(), flags=re.UNICODE)


def build_segments(words, duration, cuts):
    """Return frame-aligned keep segments [(a, b), …] in source time."""
    cuts = cuts or {}
    drop_idx = set()
    for rng_ in cuts.get("drop_words", []) or []:
        if isinstance(rng_, int):
            rng_ = [rng_, rng_]
        lo, hi = int(rng_[0]), int(rng_[-1])
        drop_idx.update(range(lo, hi + 1))
    if cuts.get("remove_fillers", True):
        for w in words:
            if norm_word(w["text"]) in FILLERS:
                drop_idx.add(w["i"])
    drops = [(float(d[0]), float(d[1])) for d in (cuts.get("drop") or [])]

    keep_words = [w for w in words if w["i"] not in drop_idx
                  and not any(w["start"] >= a - 0.01 and w["end"] <= b + 0.01 for a, b in drops)]

    start = cuts.get("start")
    end = cuts.get("end")
    pre, post = float(cuts.get("pad_before", 0.08)), float(cuts.get("pad_after", 0.14))
    max_pause = float(cuts.get("max_pause", 0.45))

    if not cuts.get("remove_pauses", True) or not keep_words:
        segs = [(0.0, duration)]
        if keep_words and cuts.get("trim_ends", True):
            segs = [(max(0, keep_words[0]["start"] - 0.25), min(duration, keep_words[-1]["end"] + 0.4))]
        # carve out dropped words / ranges
        holes = drops + [(w["start"], w["end"]) for w in words if w["i"] in drop_idx]
        for ha, hb in sorted(holes):
            nxt = []
            for a, b in segs:
                if hb <= a or ha >= b:
                    nxt.append((a, b))
                else:
                    if ha > a:
                        nxt.append((a, ha))
                    if hb < b:
                        nxt.append((hb, b))
            segs = nxt
    else:
        segs = []
        cur = None
        prev_i = None
        for w in keep_words:
            a, b = w["start"] - pre, w["end"] + post
            gap_ok = prev_i is not None and w["i"] == prev_i + 1
            if cur and (a - cur[1] <= max_pause - pre - post) and (gap_ok or a <= cur[1]):
                cur[1] = max(cur[1], b)
            else:
                if cur:
                    segs.append(tuple(cur))
                cur = [a, b]
            prev_i = w["i"]
        if cur:
            segs.append(tuple(cur))
        # resolve overlaps from padding
        fixed = []
        for a, b in segs:
            a = max(0.0, a)
            b = min(duration, b)
            if fixed and a < fixed[-1][1]:
                mid = (a + fixed[-1][1]) / 2
                fixed[-1] = (fixed[-1][0], mid)
                a = mid
            fixed.append((a, b))
        segs = fixed

    if start is not None:
        segs = [(max(a, float(start)), b) for a, b in segs if b > float(start)]
    if end is not None:
        segs = [(a, min(b, float(end))) for a, b in segs if a < float(end)]

    out = []
    for a, b in segs:
        a, b = snap(a), snap(b)
        if b - a >= 2.0 / FPS:
            if out and a <= out[-1][1]:
                out[-1] = (out[-1][0], max(out[-1][1], b))
            else:
                out.append((a, b))
    return out or [(0.0, snap(duration))]


class TimeMap:
    def __init__(self, segs):
        self.segs = segs
        self.offs = []
        acc = 0.0
        for a, b in segs:
            self.offs.append(acc)
            acc += b - a
        self.duration = acc

    def to_out(self, t):
        for (a, b), o in zip(self.segs, self.offs):
            if a - 1e-6 <= t <= b + 1e-6:
                return o + (t - a)
        return None

    def to_src(self, t):
        for (a, b), o in zip(self.segs, self.offs):
            if o - 1e-6 <= t <= o + (b - a) + 1e-6:
                return a + (t - o)
        return self.segs[-1][1]

    def words(self, words):
        out = []
        for w in words:
            s = self.to_out(w["start"])
            e = self.to_out(w["end"])
            if s is None and e is None:
                mid = self.to_out((w["start"] + w["end"]) / 2)
                if mid is None:
                    continue
                s = e = mid
            s = s if s is not None else e - 0.05
            e = e if e is not None else s + 0.05
            out.append(dict(w, start=round(s, 3), end=round(max(e, s + 0.04), 3)))
        return out


def timeline_text(owords, gap=0.6, max_words=9):
    lines, cur = [], []
    for w in owords:
        if cur and (w["start"] - cur[-1]["end"] > gap or len(cur) >= max_words
                    or re.search(r"[.?!।]$", cur[-1]["text"])):
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    return "\n".join(f"[{fmt_ts(c[0]['start'])}] (#{c[0]['i']}-{c[-1]['i']}) " + " ".join(x["text"] for x in c)
                     for c in lines)


# --------------------------------------------------------------------------- job

def job_dir(ws, name):
    return os.path.join(ws_paths(ws)["jobs"], name)


def resolve_job(a):
    ws = find_ws(getattr(a, "ws", None))
    name = a.job
    jd = job_dir(ws, name)
    if not os.path.exists(os.path.join(jd, "job.json")):
        jobs = sorted(os.listdir(ws_paths(ws)["jobs"])) if os.path.isdir(ws_paths(ws)["jobs"]) else []
        die(f"No job '{name}' in {ws}. Existing jobs: {', '.join(jobs) or 'none'}")
    return ws, jd


def cmd_prep(a):
    src = os.path.abspath(a.video)
    if not os.path.exists(src):
        die(f"Video not found: {src}")
    ws = find_ws(a.ws or os.path.dirname(src))
    if not os.path.exists(os.path.join(ws, "vibe.json")):
        info(f"(No workspace found — creating one at {ws})")
        cmd_init(argparse.Namespace(path=ws))
    name = slug(a.name or os.path.splitext(os.path.basename(src))[0])
    jd = job_dir(ws, name)
    os.makedirs(jd, exist_ok=True)
    pr = probe(src)
    info(f"🎬 {os.path.basename(src)}: {pr['width']}x{pr['height']}, {pr['duration']:.1f}s, "
         f"audio={'yes' if pr['has_audio'] else 'no'}")
    brand = load_json(ws_paths(ws)["brand"], DEFAULT_BRAND)
    lang = a.lang or (brand.get("language") if brand.get("language") not in (None, "", "auto") else None)
    words, det = ([], None)
    if pr["has_audio"] and not a.no_transcribe:
        words, det = transcribe(src, jd, lang, a.model)
    save_json(os.path.join(jd, "words.json"), words)
    save_json(os.path.join(jd, "job.json"), {"name": name, "source": src, "probe": pr, "language": det,
                                             "created": time.strftime("%Y-%m-%d %H:%M")})
    edit_path = os.path.join(jd, "edit.json")
    if not os.path.exists(edit_path) or a.reset:
        fmt = a.format or "9:16"
        save_json(edit_path, {
            "format": fmt,
            "reframe": {"mode": "crop", "x": 0.5, "y": 0.5},
            "look": brand.get("look", "punchy"),
            "cuts": {"remove_pauses": True, "max_pause": 0.45, "remove_fillers": True, "drop_words": [], "drop": []},
            "captions": {"enabled": True, "style": brand.get("caption_style", "bold-pop"), "emphasis": []},
            "audio": {"denoise": False, "loudness": -14},
            "events": [],
        })
    with open(os.path.join(jd, "transcript.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(f"#{w['i']:<4} {fmt_ts(w['start'])}  {w['text']}" + ("  (?)" if w["p"] < 0.5 else "")
                          for w in words))
    edit = load_json(edit_path)
    segs = build_segments(words, pr["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    tl = timeline_text(tm.words(words))
    with open(os.path.join(jd, "timeline.txt"), "w", encoding="utf-8") as f:
        f.write(tl)
    info(f"\n✂️  Auto-cut: {pr['duration']:.1f}s → {tm.duration:.1f}s ({len(segs)} pieces kept)")
    info(f"📁 Job: {name}  ({jd})")
    info("\n--- Edited timeline (output time) ---")
    info(tl if tl else "(no speech detected)")


def cmd_fix(a):
    ws, jd = resolve_job(a)
    words = load_json(os.path.join(jd, "words.json"), [])
    fixes = load_json(a.fixes) if os.path.exists(a.fixes) else json.loads(a.fixes)
    by_i = {w["i"]: w for w in words}
    removed = set()
    for k, v in fixes.items():
        if "-" in str(k):
            lo, hi = map(int, str(k).split("-"))
        else:
            lo = hi = int(k)
        if lo not in by_i or hi not in by_i:
            die(f"Word index {k} not found")
        by_i[lo]["text"] = v
        by_i[lo]["end"] = by_i[hi]["end"]
        removed.update(range(lo + 1, hi + 1))
    words = [w for w in words if w["i"] not in removed]
    save_json(os.path.join(jd, "words.json"), words)
    info(f"✅ Applied {len(fixes)} fixes")
    cmd_timeline(a)


def cmd_timeline(a):
    ws, jd = resolve_job(a)
    job = load_json(os.path.join(jd, "job.json"))
    words = load_json(os.path.join(jd, "words.json"), [])
    edit = load_json(os.path.join(jd, "edit.json"), {})
    segs = build_segments(words, job["probe"]["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    tl = timeline_text(tm.words(words))
    with open(os.path.join(jd, "timeline.txt"), "w", encoding="utf-8") as f:
        f.write(tl)
    info(f"Output length: {tm.duration:.1f}s  ({len(segs)} pieces)\n")
    info(tl)


# --------------------------------------------------------------------------- ASS helpers

def ass_color(hexstr, alpha=0):
    h = (hexstr or "#FFFFFF").lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper().replace("&H", "&H")


def c_tag(hexstr):
    h = (hexstr or "#FFFFFF").lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return f"&H{h[4:6]}{h[2:4]}{h[0:2]}&".upper()


def ass_time(t):
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def ass_header(W, H, styles):
    out = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
           "WrapStyle: 2", "ScaledBorderAndShadow: yes", "YCbCr Matrix: TV.709", "",
           "[V4+ Styles]",
           "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
           "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, "
           "MarginR, MarginV, Encoding"]
    for name, font, size, prim, outc, bord, shad, bold, italic, *rest in styles:
        border_style = rest[0] if rest else 1
        back = rest[1] if len(rest) > 1 else "&H96000000"
        out.append(f"Style: {name},{font},{size},{prim},{prim},{outc},{back},{-1 if bold else 0},{-1 if italic else 0},"
                   f"0,0,100,100,0,0,{border_style},{bord},{shad},5,0,0,0,1")
    out += ["", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text", ""]
    return "\n".join(out)


def esc(text):
    return text.replace("\\", "/").replace("{", "(").replace("}", ")")


def rrect(w, h, r):
    """ASS drawing path for a rounded rectangle with top-left at 0,0."""
    r = max(0, min(r, w / 2, h / 2))
    k = r * 0.4477
    w, h = round(w), round(h)
    p = [f"m {r:.0f} 0", f"l {w - r:.0f} 0", f"b {w - k:.0f} 0 {w} {k:.0f} {w} {r:.0f}",
         f"l {w} {h - r:.0f}", f"b {w} {h - k:.0f} {w - k:.0f} {h} {w - r:.0f} {h}",
         f"l {r:.0f} {h}", f"b {k:.0f} {h} 0 {h - k:.0f} 0 {h - r:.0f}",
         f"l 0 {r:.0f}", f"b 0 {k:.0f} {k:.0f} 0 {r:.0f} 0"]
    return " ".join(p)


def check_path(s):
    """A tick mark drawing inside an s x s box."""
    pts = [(0.18, 0.52), (0.40, 0.74), (0.82, 0.28), (0.74, 0.20), (0.40, 0.58), (0.26, 0.44)]
    xy = [(round(x * s), round(y * s)) for x, y in pts]
    return f"m {xy[0][0]} {xy[0][1]} " + " ".join(f"l {x} {y}" for x, y in xy[1:])


# --------------------------------------------------------------------------- render context

class Ctx:
    def __init__(self, W, H, brand, fonts, owords, duration):
        self.W, self.H = W, H
        self.u = min(W, H) / 1080.0  # unit scale
        self.brand = brand
        self.fonts = fonts
        self.words = owords
        self.dur = duration
        self.lines = []
        self.styles = {}
        self.extra_sfx = []  # (time, name, vol)

    def col(self, key, fallback):
        c = self.brand.get("colors", {})
        return c.get(key) or fallback

    @property
    def accent(self):
        return self.col("accent", "#FFD400")

    def font(self, key):
        f = self.fonts.get(key) or self.fonts.get("poppins-black")
        return f

    def style(self, font_key, size=60, color="#FFFFFF", outline="#000000", bord=0, shad=0, box=False, back=None):
        f = self.font(font_key)
        size = max(8, round(size * f.get("norm", 1.0)))  # same visual size across fonts
        name = f"S{len(self.styles)}"
        key = (f["family"], size, color, outline, bord, shad, box, back)
        for n, k in self.styles.items():
            if k[0] == key:
                return n
        back_c = ass_color(back or "#000000", 0x78)
        self.styles[name] = (key, (name, f["family"], size, ass_color(color), ass_color(outline), bord, shad,
                                   f.get("bold", False), f.get("italic", False), 3 if box else 1, back_c))
        return name

    def add(self, start, end, style, text, layer=1):
        if end <= start:
            return
        self.lines.append(f"Dialogue: {layer},{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{text}")

    def width_of(self, text, font_key, size):
        f = self.font(font_key)
        return len(text) * f.get("width", 0.5) * size * f.get("norm", 1.0)

    def wrap(self, text, font_key, size, max_w, max_lines=4):
        """Wrap text into lines; shrink size until it fits. Returns (lines, size)."""
        size = float(size)
        # *several accent words* -> *several* *accent* *words* so accents survive wrapping
        text = re.sub(r"\*([^*]+)\*", lambda m: " ".join(f"*{w}*" for w in m.group(1).split()), text)
        raw_lines = [ln for ln in re.split(r"\\n|\n|\|", text)]
        for _ in range(30):
            lines = []
            for rl in raw_lines:
                cur = ""
                for wd in rl.split():
                    cand = (cur + " " + wd).strip()
                    if cur and self.width_of(re.sub(r"\*", "", cand), font_key, size) > max_w:
                        lines.append(cur)
                        cur = wd
                    else:
                        cur = cand
                lines.append(cur)
            widest = max(self.width_of(re.sub(r"\*", "", ln), font_key, size) for ln in lines)
            if widest <= max_w and len(lines) <= max_lines:
                return lines, int(size)
            size *= 0.92
        return lines, int(size)

    def markup(self, line, color, accent):
        """*word* -> accent colour."""
        parts = re.split(r"(\*[^*]+\*)", esc(line))
        out = ""
        for p in parts:
            if p.startswith("*") and p.endswith("*") and len(p) > 2:
                out += "{\\c" + c_tag(accent) + "}" + p[1:-1] + "{\\c" + c_tag(color) + "}"
            else:
                out += p
        return out

    def find_phrase(self, phrase, occurrence=1, end=False):
        target = [norm_word(x) for x in phrase.split() if norm_word(x)]
        if not target:
            return None
        ws = [norm_word(w["text"]) for w in self.words]
        hits = 0
        for i in range(len(ws) - len(target) + 1):
            if all(ws[i + k].startswith(target[k]) or target[k].startswith(ws[i + k]) and ws[i + k]
                   for k in range(len(target))):
                hits += 1
                if hits == occurrence:
                    return self.words[i + len(target) - 1]["end"] if end else self.words[i]["start"]
        return None

    def t(self, v, default=0.0, end=False):
        """Resolve a time: number (s), negative (from end), 'mm:ss.s', or a spoken phrase."""
        if v is None:
            return default
        if isinstance(v, (int, float)):
            return self.dur + v if v < 0 else float(v)
        s = str(v).strip()
        m = re.fullmatch(r"(-?)(?:(\d+):)?(\d+(?:\.\d+)?)", s)
        if m:
            val = int(m.group(2) or 0) * 60 + float(m.group(3))
            return self.dur - val if m.group(1) else val
        occ = 1
        mm = re.match(r"(.*)#(\d+)$", s)
        if mm:
            s, occ = mm.group(1).strip(), int(mm.group(2))
        r = self.find_phrase(s, occ, end)
        if r is None:
            info(f"⚠️  Phrase not found in speech: '{s}' — using {default:.1f}s")
            return default
        return r


POS_Y = {"top": 0.16, "upper": 0.27, "center": 0.45, "middle": 0.45, "lower": 0.62, "bottom": 0.80}


def ypos(ctx, v, default):
    if v is None:
        v = default
    if isinstance(v, (int, float)):
        return ctx.H * float(v)
    return ctx.H * POS_Y.get(str(v), POS_Y.get(default, 0.45) if isinstance(default, str) else default)


# --------------------------------------------------------------------------- captions

def build_captions(ctx, cfg, hide_ranges):
    if not cfg.get("enabled", True) or not ctx.words:
        return
    styles = lib("captions.json")
    st = dict(styles.get(cfg.get("style") or "bold-pop") or styles["bold-pop"])
    for k in ("font", "size", "color", "highlight", "outline", "outline_w", "shadow", "anim", "uppercase",
              "max_words", "position", "blob"):
        if k in cfg:
            st[k] = cfg[k]
    if cfg.get("highlight") is None and ctx.brand.get("colors", {}).get("accent") and st.get("highlight") not in (
            st.get("color"), "#111111") and cfg.get("use_brand_color", True):
        st["highlight"] = ctx.accent
    u = ctx.u
    size = round(st["size"] * u)
    y = ypos(ctx, cfg.get("position", st.get("position")), 0.70)
    color, hl = st["color"], st["highlight"]
    emph = {norm_word(e) for e in cfg.get("emphasis", [])}
    emph_c = cfg.get("emphasis_color") or ctx.accent
    sname = ctx.style(st["font"], size, color, st["outline"], round(st["outline_w"] * u), round(st["shadow"] * u),
                      box=st.get("box", False), back="#000000")
    max_w = ctx.W * 0.86
    maxw = int(cfg.get("max_words", st["max_words"]))
    anim = st["anim"]

    # chunk words
    groups, cur = [], []
    for w in ctx.words:
        txt = w["text"].upper() if st["uppercase"] else w["text"]
        ww = dict(w, disp=esc(txt))
        if cur:
            line = " ".join(x["disp"] for x in cur + [ww])
            gap = w["start"] - cur[-1]["end"]
            if (len(cur) >= maxw or gap > 0.55 or ctx.width_of(line, st["font"], size) > max_w * 1.9
                    or re.search(r"[.?!,।]$", cur[-1]["text"])):
                groups.append(cur)
                cur = []
        cur.append(ww)
    if cur:
        groups.append(cur)

    def hidden(a, b):
        return any(a < hb and b > ha for ha, hb in hide_ranges)

    for gi, g in enumerate(groups):
        g_start = g[0]["start"]
        nxt = groups[gi + 1][0]["start"] if gi + 1 < len(groups) else ctx.dur
        g_end = min(max(g[-1]["end"] + 0.25, g_start + 0.4), nxt)
        if hidden(g_start, g_end):
            continue
        # break into max 2 lines
        words_disp = [x["disp"] for x in g]
        line_break = None
        if ctx.width_of(" ".join(words_disp), st["font"], size) > max_w and len(g) > 1:
            line_break = len(g) // 2 + len(g) % 2
        for wi, w in enumerate(g):
            a = g_start if wi == 0 else w["start"]
            b = g[wi + 1]["start"] if wi + 1 < len(g) else g_end
            if b <= a:
                continue
            parts = []
            for k, x in enumerate(g):
                if line_break and k == line_break:
                    parts.append("\\N")
                is_e = norm_word(x["text"]) in emph
                base = emph_c if is_e else color
                if anim == "single":
                    if k != wi:
                        continue
                    parts.append("{\\c" + c_tag(base) + "\\fscx70\\fscy70\\t(0,90,\\fscx108\\fscy108)\\t(90,160,\\fscx100\\fscy100)}" + x["disp"])
                    continue
                if anim == "typewriter" and k > wi:
                    continue
                if anim == "fade":
                    parts.append("{\\c" + c_tag(base) + "}" + x["disp"])
                elif anim == "karaoke":
                    c = hl if k <= wi else base
                    parts.append("{\\c" + c_tag(c) + "}" + x["disp"])
                elif anim == "blob":
                    if k == wi:
                        parts.append("{\\c" + c_tag(hl) + "\\3c" + c_tag(st.get("blob", ctx.accent)) +
                                     f"\\bord{round(14 * u)}" + "}" + x["disp"] +
                                     "{\\3c" + c_tag(st["outline"]) + f"\\bord{round(st['outline_w'] * u)}" + "}")
                    else:
                        parts.append("{\\c" + c_tag(base) + "}" + x["disp"])
                elif anim in ("pop", "typewriter"):
                    if k == wi:
                        pop = "\\fscx88\\fscy88\\t(0,80,\\fscx112\\fscy112)\\t(80,150,\\fscx104\\fscy104)" if anim == "pop" else ""
                        parts.append("{\\c" + c_tag(hl) + pop + "}" + x["disp"] + "{\\fscx100\\fscy100\\c" + c_tag(color) + "}")
                    else:
                        parts.append("{\\c" + c_tag(base) + "}" + x["disp"])
                else:
                    parts.append(x["disp"])
            body = " ".join(p for p in parts).replace(" \\N ", "\\N")
            lead = "{\\an5\\pos(" + f"{ctx.W / 2:.0f},{y:.0f}" + ")"
            if anim in ("fade",) and wi == 0:
                lead += "\\fad(120,0)"
            if anim == "pop" and wi == 0:
                lead += "\\fad(60,0)"
            if st.get("glow"):
                ctx.add(a, b, sname, lead + f"\\blur{round(10 * u)}\\3c" + c_tag(hl) + f"\\bord{round(8 * u)}" + "}" + body, layer=2)
            ctx.add(a, b, sname, lead + "}" + body, layer=3)


# --------------------------------------------------------------------------- overlay events (ASS)

def ev_window(ctx, e, default_dur):
    a = ctx.t(e.get("at"), 0.0)
    if e.get("until") is not None:
        b = ctx.t(e.get("until"), a + default_dur, end=True)
    else:
        b = a + float(e.get("dur", default_dur))
    b = min(b, ctx.dur)
    return a, max(b, a + 0.2)


def title_anim(style, x, y, u, dur_ms):
    out_fade = 160
    if style == "pop":
        return f"\\an5\\pos({x:.0f},{y:.0f})\\fscx20\\fscy20\\t(0,170,\\fscx112\\fscy112)\\t(170,260,\\fscx100\\fscy100)\\fad(0,{out_fade})"
    if style == "slide":
        return f"\\an5\\move({x:.0f},{y + 90 * u:.0f},{x:.0f},{y:.0f},0,260)\\fad(180,{out_fade})"
    if style == "drop":
        return (f"\\an5\\move({x:.0f},{y - 260 * u:.0f},{x:.0f},{y:.0f},0,240)\\t(240,320,\\fscy92\\fscx106)"
                f"\\t(320,400,\\fscy100\\fscx100)\\fad(0,{out_fade})")
    if style == "punch":
        return f"\\an5\\pos({x:.0f},{y:.0f})\\fscx170\\fscy170\\alpha&HFF&\\t(0,150,\\fscx100\\fscy100\\alpha&H00&)\\fad(0,{out_fade})"
    if style == "stamp":
        return (f"\\an5\\pos({x:.0f},{y:.0f})\\frz-7\\fscx240\\fscy240\\alpha&H80&"
                f"\\t(0,120,\\fscx92\\fscy92\\alpha&H00&)\\t(120,190,\\fscx100\\fscy100)\\fad(0,{out_fade})")
    if style == "zoom-out":
        return f"\\an5\\pos({x:.0f},{y:.0f})\\fscx100\\fscy100\\t(0,{dur_ms},\\fscx115\\fscy115)\\fad(150,{out_fade})"
    return f"\\an5\\pos({x:.0f},{y:.0f})\\fad(220,{out_fade})"  # fade


def block_anim(kind, x, y, u):
    if kind == "slide":
        return f"\\an5\\move({x:.0f},{y + 120 * u:.0f},{x:.0f},{y:.0f},0,240)\\fad(120,160)"
    if kind == "fade":
        return f"\\an5\\pos({x:.0f},{y:.0f})\\fad(150,160)"
    return f"\\an5\\pos({x:.0f},{y:.0f})\\fscx60\\fscy60\\t(0,140,\\fscx104\\fscy104)\\t(140,220,\\fscx100\\fscy100)\\fad(80,160)"


def draw_lines(ctx, a, b, st, lines, x, yc, lh, tagfn, color, accent, layer, stagger=0.0, extra=""):
    """Place each line ourselves so line spacing is tight and identical for every font."""
    y0 = yc - lh * (len(lines) - 1) / 2
    for i, ln in enumerate(lines):
        yy = y0 + i * lh
        ctx.add(a + i * stagger, b, st, "{" + tagfn(x, yy) + extra + "}" + ctx.markup(ln, color, accent), layer=layer)


def ev_title(ctx, e, size_default=96, pos_default="top"):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    style = e.get("style", "pop")
    font = e.get("font") or ctx.brand.get("fonts", {}).get("title", "poppins-black")
    color = e.get("color") or ctx.col("text", "#FFFFFF")
    accent = e.get("accent") or ctx.accent
    sizes = {"s": 64, "m": 88, "l": 118, "xl": 148, "xxl": 190}
    size = e.get("size", size_default)
    size = sizes.get(size, size) if isinstance(size, str) else size
    size = size * u
    text = e.get("text", "")
    if e.get("uppercase", True):
        text = text.upper()
    lines, fsize = ctx.wrap(text, font, size, ctx.W * float(e.get("width", 0.86)))
    x = ctx.W * float(e.get("x", 0.5))
    y = ypos(ctx, e.get("position", e.get("y")), pos_default)
    box = style == "highlight" or e.get("box")
    st = ctx.style(font, fsize, color, e.get("outline_color", "#000000"),
                   round((18 if box else e.get("outline", 6)) * u), round(e.get("shadow", 4) * u),
                   box=bool(box), back=accent if box else "#000000")
    dur_ms = int((b - a) * 1000)
    lh = fsize * 1.12
    if style == "highlight":
        dark = e.get("color", ctx.col("dark", "#111111"))
        draw_lines(ctx, a, b, st, lines, x, y, fsize * 1.45, lambda xx, yy: title_anim("pop", xx, yy, u, dur_ms),
                   dark, "#FFFFFF", 6, 0.06, "\\3c" + c_tag(accent) + "\\c" + c_tag(dark))
        return a, b
    if style == "typewriter":
        full = " ".join(lines)
        n = len(full)
        step = min(0.06, (b - a) * 0.5 / max(n, 1))
        for i in range(1, n + 1):
            t0 = a + (i - 1) * step
            t1 = a + i * step if i < n else b
            part = full[:i] + ("*" if full[:i].count("*") % 2 else "")
            ctx.add(t0, t1, st, "{" + f"\\an5\\pos({x:.0f},{y:.0f})" + "}" +
                    ctx.markup(part, color, accent), layer=6)
        return a, b
    if style == "split" and len(lines) >= 1:
        if len(lines) == 1 and " " in lines[0]:
            ws_ = lines[0].split()
            lines = [" ".join(ws_[:len(ws_) // 2]), " ".join(ws_[len(ws_) // 2:])]
        y0 = y - lh * (len(lines) - 1) / 2
        for i, ln in enumerate(lines):
            yy = y0 + i * lh
            sx = -ctx.W * 0.6 if i % 2 == 0 else ctx.W * 1.6
            ctx.add(a + i * 0.08, b, st, "{" + f"\\an5\\move({sx:.0f},{yy:.0f},{x:.0f},{yy:.0f},0,260)\\fad(0,160)" + "}" +
                    ctx.markup(ln, color, accent), layer=6)
        return a, b
    if style == "glow":
        draw_lines(ctx, a, b, st, lines, x, y, lh, lambda xx, yy: title_anim("pop", xx, yy, u, dur_ms), color, accent,
                   5, 0.06, f"\\blur{round(14 * u)}\\bord{round(10 * u)}\\3c" + c_tag(accent))
        style = "pop"
    draw_lines(ctx, a, b, st, lines, x, y, lh, lambda xx, yy: title_anim(style, xx, yy, u, dur_ms), color, accent,
               6, 0.06 if style in ("pop", "slide", "drop", "punch") else 0.0)
    return a, b


def card_shape(ctx, a, b, cx, cy, w, h, fill, alpha=0, radius=36, layer=4, shadow=True, anim="pop"):
    u = ctx.u
    st = ctx.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)
    path = rrect(w, h, radius * u)
    if anim == "pop":
        mv = f"\\an5\\pos({cx:.0f},{cy:.0f})\\fscx60\\fscy60\\t(0,140,\\fscx104\\fscy104)\\t(140,220,\\fscx100\\fscy100)\\fad(80,160)"
    elif anim == "slide":
        mv = f"\\an5\\move({cx:.0f},{cy + 120 * u:.0f},{cx:.0f},{cy:.0f},0,240)\\fad(120,160)"
    else:
        mv = f"\\an5\\pos({cx:.0f},{cy:.0f})\\fad(150,160)"
    if shadow:
        sh = mv.replace(f"({cx:.0f},{cy:.0f}", f"({cx:.0f},{cy + 14 * u:.0f}").replace(
            f"{cy + 120 * u:.0f},{cx:.0f},{cy:.0f}", f"{cy + 134 * u:.0f},{cx:.0f},{cy + 14 * u:.0f}")
        ctx.add(a, b, st, "{" + sh + f"\\bord0\\shad0\\blur{round(18 * u)}\\1c&H000000&\\1a&H90&\\p1" + "}" + path, layer=layer)
    ctx.add(a, b, st, "{" + mv + f"\\bord0\\shad0\\1c{c_tag(fill)}\\1a&H{alpha:02X}&\\p1" + "}" + path, layer=layer + 1)
    return mv


CARD_THEMES = {
    "note": {"fill": "card", "text": "dark", "label_bg": "accent", "label_text": "dark"},
    "dark": {"fill": "#111111", "text": "#FFFFFF", "label_bg": "accent", "label_text": "dark"},
    "accent": {"fill": "accent", "text": "dark", "label_bg": "dark", "label_text": "#FFFFFF"},
    "myth": {"fill": "card", "text": "dark", "label_bg": "#FF3B30", "label_text": "#FFFFFF", "label": "MYTH"},
    "fact": {"fill": "card", "text": "dark", "label_bg": "#22C55E", "label_text": "#FFFFFF", "label": "FACT"},
    "tip": {"fill": "card", "text": "dark", "label_bg": "accent", "label_text": "dark", "label": "TIP"},
    "quote": {"fill": "#111111", "text": "#FFFFFF", "label_bg": "accent", "label_text": "dark", "font": "serif-italic"},
    "glass": {"fill": "#FFFFFF", "alpha": 0x40, "text": "#FFFFFF", "label_bg": "accent", "label_text": "dark"},
}


def theme_color(ctx, v):
    if v in ("card", "accent", "dark", "text", "accent2"):
        return ctx.col(v, {"card": "#FFFFFF", "accent": "#FFD400", "dark": "#111111", "text": "#FFFFFF",
                           "accent2": "#8B5CF6"}[v])
    return v


def ev_card(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    u = ctx.u
    th = dict(CARD_THEMES.get(e.get("style", "note"), CARD_THEMES["note"]))
    fill = theme_color(ctx, e.get("fill", th["fill"]))
    tcol = theme_color(ctx, e.get("color", th["text"]))
    accent = ctx.accent
    font = e.get("font") or th.get("font") or ctx.brand.get("fonts", {}).get("title", "poppins-black")
    body_font = ctx.brand.get("fonts", {}).get("body", "inter-extrabold")
    w = ctx.W * float(e.get("width", 0.82))
    pad = 52 * u
    text = e.get("text", "")
    if e.get("style") == "quote":
        text = f"“{text}”"
    lines, fs = ctx.wrap(text, font, float(e.get("size", 86)) * u, w - 2 * pad, max_lines=5)
    sub_lines, sfs = ([], 0)
    if e.get("sub"):
        sub_lines, sfs = ctx.wrap(e["sub"], body_font, 50 * u, w - 2 * pad, max_lines=4)
    lh, slh = fs * 1.14, sfs * 1.25
    h = pad * 2 + len(lines) * lh + (len(sub_lines) * slh + 20 * u if sub_lines else 0)
    cx = ctx.W * float(e.get("x", 0.5))
    cy = ypos(ctx, e.get("position", e.get("y")), "center")
    anim = e.get("anim", "pop")
    card_shape(ctx, a, b, cx, cy, w, h, fill, th.get("alpha", 0), layer=4, anim=anim)
    top = cy - h / 2 + pad
    st = ctx.style(font, fs, tcol, "#000000", 0, 0)
    ty = top + len(lines) * lh / 2
    tagfn = lambda xx, yy: block_anim(anim, xx, yy, u)  # noqa: E731
    draw_lines(ctx, a, b, st, lines, cx, ty, lh, tagfn, tcol, accent if fill != accent else "#FFFFFF", 7)
    if sub_lines:
        sst = ctx.style(body_font, sfs, tcol, "#000000", 0, 0)
        sy = top + len(lines) * lh + 20 * u + len(sub_lines) * slh / 2
        draw_lines(ctx, a, b, sst, sub_lines, cx, sy, slh, tagfn, tcol, accent, 7, extra="\\alpha&H30&")
    label = e.get("label", th.get("label"))
    if label:
        lfs = 46 * u
        lw = ctx.width_of(label.upper(), "poppins-black", lfs) + 56 * u
        lh = lfs * 1.7
        lcx = cx - w / 2 + lw / 2 + 28 * u
        lcy = cy - h / 2
        card_shape(ctx, a + 0.08, b, lcx, lcy, lw, lh, theme_color(ctx, th["label_bg"]), radius=lh / 2, layer=8,
                   shadow=False, anim="pop")
        lst = ctx.style("poppins-black", round(lfs), theme_color(ctx, th["label_text"]), "#000000", 0, 0)
        ctx.add(a + 0.08, b, lst, "{" + f"\\an5\\pos({lcx:.0f},{lcy + 2 * u:.0f})\\fscx60\\fscy60\\t(0,140,\\fscx100\\fscy100)\\fad(80,160)" + "}" +
                esc(label.upper()), layer=9)
    return a, b


def ev_checklist(ctx, e):
    items = e.get("items", [])
    if not items:
        return None
    a, b = ev_window(ctx, e, max(3.0, 1.2 * len(items)))
    u = ctx.u
    w = ctx.W * float(e.get("width", 0.84))
    pad = 46 * u
    fs = float(e.get("size", 66)) * u
    font = ctx.brand.get("fonts", {}).get("title", "poppins-black")
    row_h = fs * 1.75
    title = e.get("title")
    tfs = fs * 0.8
    h = pad * 2 + len(items) * row_h + (tfs * 1.6 if title else 0)
    cx = ctx.W * 0.5
    cy = ypos(ctx, e.get("position"), "center")
    card_shape(ctx, a, b, cx, cy, w, h, theme_color(ctx, e.get("fill", "card")), layer=4, anim="slide")
    dark = theme_color(ctx, e.get("color", "dark"))
    top = cy - h / 2 + pad
    if title:
        tst = ctx.style(font, round(tfs), ctx.accent if e.get("fill") == "dark" else dark, "#000000", 0, 0)
        ctx.add(a + 0.15, b, tst, "{" + f"\\an4\\pos({cx - w / 2 + pad:.0f},{top + tfs * 0.6:.0f})\\fad(150,160)\\alpha&H40&" + "}" +
                esc(title.upper()), layer=7)
        top += tfs * 1.6
    times = e.get("times")
    step = (b - a - 0.4) / max(len(items), 1)
    box = fs * 1.05
    shp = ctx.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)
    for i, it in enumerate(items):
        ta = ctx.t(times[i]) if times and i < len(times) else a + 0.25 + i * step
        ry = top + i * row_h + row_h / 2
        bx = cx - w / 2 + pad
        ctx.add(ta, b, shp, "{" + f"\\an4\\pos({bx:.0f},{ry:.0f})\\bord{round(5 * u)}\\3c{c_tag(dark)}\\1a&HFF&\\shad0\\fad(100,160)\\p1" + "}" +
                rrect(box, box, 12 * u), layer=7)
        ctx.add(ta + 0.12, b, shp, "{" + f"\\an4\\pos({bx:.0f},{ry:.0f})\\bord0\\shad0\\1c{c_tag(ctx.accent)}\\fscx30\\fscy30"
                f"\\t(0,120,\\fscx115\\fscy115)\\t(120,200,\\fscx100\\fscy100)\\fad(0,160)\\p1" + "}" + rrect(box, box, 12 * u), layer=8)
        ctx.add(ta + 0.12, b, shp, "{" + f"\\an4\\pos({bx:.0f},{ry:.0f})\\bord0\\shad0\\1c{c_tag(dark)}\\fad(60,160)\\p1" + "}" +
                check_path(box), layer=9)
        lines, ifs = ctx.wrap(it, font, fs, w - 2 * pad - box - 30 * u, max_lines=1)
        ist = ctx.style(font, ifs, dark, "#000000", 0, 0)
        ctx.add(ta, b, ist, "{" + f"\\an4\\move({bx + box + 60 * u:.0f},{ry:.0f},{bx + box + 28 * u:.0f},{ry:.0f},0,200)\\fad(140,160)" + "}" +
                ctx.markup(lines[0], dark, ctx.accent), layer=8)
        if e.get("sfx", "pop"):
            ctx.extra_sfx.append((ta + 0.1, e.get("sfx", "pop"), 0.5))
    return a, b


def fmt_num(v, decimals=0, indian=False):
    if decimals:
        s = f"{v:,.{decimals}f}"
    else:
        s = f"{int(round(v)):,}"
    if indian and not decimals:
        n = str(int(round(abs(v))))
        if len(n) > 3:
            head, tail = n[:-3], n[-3:]
            head = re.sub(r"(\d)(?=(\d\d)+$)", r"\1,", head)
            s = ("-" if v < 0 else "") + head + "," + tail
        else:
            s = ("-" if v < 0 else "") + n
    return s


def ev_counter(ctx, e):
    a, b = ev_window(ctx, e, 2.5)
    u = ctx.u
    frm, to = float(e.get("from", 0)), float(e.get("to", 100))
    dec = int(e.get("decimals", 0))
    pre, suf = e.get("prefix", ""), e.get("suffix", "")
    font = e.get("font", "noto-black")
    size = float(e.get("size", 150)) * u
    color = e.get("color") or ctx.col("text", "#FFFFFF")
    x = ctx.W * float(e.get("x", 0.5))
    y = ypos(ctx, e.get("position"), "upper")
    st = ctx.style(font, round(size), color, "#000000", round(7 * u), round(5 * u))
    run = min(float(e.get("run", (b - a) * 0.7)), b - a)
    n = max(2, int(run * FPS))
    for i in range(n + 1):
        p = i / n
        p = 1 - (1 - p) ** 3
        v = frm + (to - frm) * p
        t0 = a + i / FPS
        t1 = a + (i + 1) / FPS if i < n else b
        tag = f"\\an5\\pos({x:.0f},{y:.0f})"
        if i == 0:
            tag += "\\fad(120,0)"
        if i == n:
            tag += "\\fscx112\\fscy112\\t(0,160,\\fscx100\\fscy100)\\fad(0,180)\\c" + c_tag(e.get("end_color", ctx.accent))
        ctx.add(t0, t1, st, "{" + tag + "}" + esc(pre + fmt_num(v, dec, e.get("indian", "₹" in pre)) + suf), layer=6)
    if e.get("label"):
        lst = ctx.style(ctx.brand.get("fonts", {}).get("body", "inter-extrabold"), round(52 * u), color, "#000000",
                        round(4 * u), round(3 * u))
        ctx.add(a + 0.1, b, lst, "{" + f"\\an5\\pos({x:.0f},{y + size * 0.78:.0f})\\fad(200,180)" + "}" + esc(e["label"].upper()), layer=6)
    if e.get("sfx", "cash") and to != frm:
        ctx.extra_sfx.append((a + run, e.get("sfx", "cash"), 0.45))
    return a, b


def ev_pill(ctx, e, default_text, default_pos, default_at=None, default_dur=2.8):
    if e.get("at") is None and default_at is not None:
        e = dict(e, at=default_at)
    a, b = ev_window(ctx, e, default_dur)
    u = ctx.u
    text = e.get("text") or default_text
    style = e.get("style", "pill")
    fs = float(e.get("size", 68)) * u
    font = ctx.brand.get("fonts", {}).get("title", "poppins-black")
    fill = theme_color(ctx, e.get("fill", "accent" if style == "pill" else "dark" if style == "dark" else "card"))
    tcol = theme_color(ctx, e.get("color", "dark" if style in ("pill", "light") else "#FFFFFF"))
    lines, fs2 = ctx.wrap(text, font, fs, ctx.W * 0.74, max_lines=2)
    tw = max(ctx.width_of(l, font, fs2) for l in lines)
    w = tw + 90 * u
    h = fs2 * 1.15 * len(lines) + 56 * u
    cx = ctx.W * float(e.get("x", 0.5))
    cy = ypos(ctx, e.get("position"), default_pos)
    card_shape(ctx, a, b, cx, cy, w, h, fill, radius=min(h / 2, 60 * u), layer=10, anim="pop")
    st = ctx.style(font, fs2, tcol, "#000000", 0, 0)
    draw_lines(ctx, a, b, st, lines, cx, cy + 3 * u, fs2 * 1.15, lambda xx, yy: block_anim("pop", xx, yy, u), tcol,
               "#FFFFFF" if fill == ctx.accent else ctx.accent, 12)
    if e.get("sfx", "pop"):
        ctx.extra_sfx.append((a, e.get("sfx", "pop"), 0.5))
    return a, b


def ev_lower_third(ctx, e):
    a, b = ev_window(ctx, e, 3.5)
    u = ctx.u
    name = e.get("text") or ctx.brand.get("name") or ""
    sub = e.get("sub") or (("@" + ctx.brand["handle"].lstrip("@")) if ctx.brand.get("handle") else "")
    font = ctx.brand.get("fonts", {}).get("title", "poppins-black")
    body = ctx.brand.get("fonts", {}).get("body", "inter-extrabold")
    fs, sfs = 56 * u, 38 * u
    w = max(ctx.width_of(name.upper(), font, fs), ctx.width_of(sub, body, sfs)) + 90 * u
    h = fs * 1.3 + (sfs * 1.4 if sub else 0) + 40 * u
    x0 = ctx.W * 0.07
    cy = ypos(ctx, e.get("position"), 0.58)
    shp = ctx.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)
    ctx.add(a, b, shp, "{" + f"\\an4\\move({-w:.0f},{cy:.0f},{x0:.0f},{cy:.0f},0,280)\\bord0\\shad0\\1c{c_tag(ctx.col('dark', '#111111'))}\\1a&H18&\\fad(0,200)\\p1" + "}" +
            rrect(w, h, 18 * u), layer=10)
    ctx.add(a, b, shp, "{" + f"\\an4\\move({-w:.0f},{cy:.0f},{x0:.0f},{cy:.0f},0,280)\\bord0\\shad0\\1c{c_tag(ctx.accent)}\\fad(0,200)\\p1" + "}" +
            rrect(12 * u, h, 6 * u), layer=11)
    nst = ctx.style(font, round(fs), "#FFFFFF", "#000000", 0, 0)
    ty = cy - h / 2 + 20 * u + fs * 0.65
    ctx.add(a + 0.12, b, nst, "{" + f"\\an4\\move({x0 + 10 * u:.0f},{ty:.0f},{x0 + 40 * u:.0f},{ty:.0f},0,250)\\fad(150,200)" + "}" + esc(name.upper()), layer=12)
    if sub:
        sst = ctx.style(body, round(sfs), ctx.accent, "#000000", 0, 0)
        sy = ty + fs * 0.55 + sfs * 0.75
        ctx.add(a + 0.2, b, sst, "{" + f"\\an4\\move({x0 + 10 * u:.0f},{sy:.0f},{x0 + 40 * u:.0f},{sy:.0f},0,250)\\fad(150,200)" + "}" + esc(sub), layer=12)
    if e.get("sfx", "whoosh-fast"):
        ctx.extra_sfx.append((a, e.get("sfx", "whoosh-fast"), 0.4))
    return a, b


def ev_progress(ctx, e):
    u = ctx.u
    a = ctx.t(e.get("at"), 0.0)
    b = ctx.t(e.get("end"), ctx.dur) if e.get("end") is not None else ctx.dur
    hgt = float(e.get("height", 12)) * u
    y = 0 if e.get("position", "top") == "top" else ctx.H - hgt
    shp = ctx.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)
    ms = int((b - a) * 1000)
    ctx.add(a, b, shp, "{" + f"\\an7\\pos(0,{y:.0f})\\bord0\\shad0\\1c&HFFFFFF&\\1a&HB0&\\p1" + "}" + f"m 0 0 l {ctx.W} 0 {ctx.W} {hgt:.0f} 0 {hgt:.0f}", layer=20)
    ctx.add(a, b, shp, "{" + f"\\an7\\pos(0,{y:.0f})\\bord0\\shad0\\1c{c_tag(e.get('color', ctx.accent))}\\clip(0,0,1,{ctx.H})"
            f"\\t(0,{ms},\\clip(0,0,{ctx.W},{ctx.H}))\\p1" + "}" + f"m 0 0 l {ctx.W} 0 {ctx.W} {hgt:.0f} 0 {hgt:.0f}", layer=21)
    return None


def ev_flash(ctx, e):
    a = ctx.t(e.get("at"), 0.0)
    d = float(e.get("dur", 0.3))
    shp = ctx.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)
    ctx.add(a, a + d, shp, "{" + f"\\an7\\pos(0,0)\\bord0\\shad0\\1c{c_tag(e.get('color', '#FFFFFF'))}\\fad(0,{int(d * 1000)})\\p1" + "}" +
            f"m 0 0 l {ctx.W} 0 {ctx.W} {ctx.H} 0 {ctx.H}", layer=30)
    return None


def ev_letterbox(ctx, e):
    a, b = ev_window(ctx, e, 3.0)
    bh = ctx.H * float(e.get("size", 0.1))
    shp = ctx.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)
    rect = f"m 0 0 l {ctx.W} 0 {ctx.W} {bh:.0f} 0 {bh:.0f}"
    ctx.add(a, b, shp, "{" + f"\\an7\\move(0,{-bh:.0f},0,0,0,300)\\bord0\\shad0\\1c&H000000&\\fad(0,250)\\p1" + "}" + rect, layer=25)
    ctx.add(a, b, shp, "{" + f"\\an7\\move(0,{ctx.H:.0f},0,{ctx.H - bh:.0f},0,300)\\bord0\\shad0\\1c&H000000&\\fad(0,250)\\p1" + "}" + rect, layer=25)
    return None


def ev_countdown(ctx, e):
    n = int(e.get("from", 3))
    a, b = ev_window(ctx, e, float(n))
    step = (b - a) / n
    u = ctx.u
    st = ctx.style(e.get("font", "anton"), round(float(e.get("size", 320)) * u), e.get("color", "#FFFFFF"), "#000000",
                   round(10 * u), round(6 * u))
    y = ypos(ctx, e.get("position"), "center")
    for i in range(n):
        t0 = a + i * step
        ctx.add(t0, t0 + step, st, "{" + f"\\an5\\pos({ctx.W / 2:.0f},{y:.0f})\\fscx40\\fscy40\\t(0,150,\\fscx110\\fscy110)\\t(150,240,\\fscx100\\fscy100)\\fad(0,120)" + "}" + str(n - i), layer=14)
        ctx.extra_sfx.append((t0, e.get("sfx", "tick"), 0.6))
    return a, b


def ev_image_label(e):
    return e.get("file")


ASS_EVENTS = {
    "title": lambda c, e: ev_title(c, e, 118, "top"),
    "text": lambda c, e: ev_title(c, dict({"style": "fade", "size": 64}, **e), 64, "center"),
    "stamp": lambda c, e: ev_title(c, dict({"style": "stamp", "size": 110, "position": "center"}, **e), 110, "center"),
    "card": ev_card,
    "checklist": ev_checklist,
    "counter": ev_counter,
    "cta": lambda c, e: ev_pill(c, e, c.brand.get("cta") or "Follow for more", "lower", default_at=-2.8),
    "tag": lambda c, e: ev_pill(c, dict({"style": "light", "size": 50}, **e), "", "upper", default_dur=2.5),
    "lower_third": ev_lower_third,
    "progress_bar": ev_progress,
    "flash": ev_flash,
    "letterbox": ev_letterbox,
    "countdown": ev_countdown,
}

VIDEO_EVENTS = {"zoom", "shake", "glitch", "bw", "blur", "darken", "broll", "image", "speed"}
AUDIO_EVENTS = {"sfx"}


# --------------------------------------------------------------------------- render

FORMATS = {"9:16": (1080, 1920), "16:9": (1920, 1080), "1:1": (1080, 1080), "4:5": (1080, 1350)}


def zoom_expr(ctx, zooms, shake):
    """zoompan z/x/y expressions from zoom + shake events (times in output seconds)."""
    terms = []
    focus = None
    for z in zooms:
        a, b = z["_a"], z["_b"]
        amt = float(z.get("amount", 1.25 if z.get("style", "punch") == "punch" else 1.15)) - 1.0
        st = z.get("style", "punch")
        if st == "punch":
            ri, ro = 0.12, 0.08
        elif st in ("push", "slow"):
            ri, ro = max(b - a, 0.2), 0.04
        elif st == "pulse":
            ri, ro = (b - a) / 2, (b - a) / 2
        elif st == "pull":  # start zoomed, ease out
            ri, ro = 0.01, max(b - a, 0.2)
        else:
            ri, ro = 0.12, 0.08
        T = "(in/30)"
        up = f"min(1,max(0,({T}-{a:.3f})/{ri:.3f}))"
        dn = f"min(1,max(0,({b:.3f}-{T})/{ro:.3f}))"
        e = f"{amt:.4f}*(({up})*({up})*(3-2*({up})))*(({dn})*({dn})*(3-2*({dn})))"
        terms.append(e)
        if z.get("focus"):
            focus = z["focus"]
    for s in shake:
        terms.append(f"0.06*between(in/30,{s['_a']:.3f},{s['_b']:.3f})")
    z = "1+" + "+".join(terms) if terms else "1"
    fx, fy = (focus or [0.5, 0.42])
    sx = "+".join(f"{float(s.get('amount', 14)) * ctx.u:.1f}*sin(in*2.1)*between(in/30,{s['_a']:.3f},{s['_b']:.3f})" for s in shake) or "0"
    sy = "+".join(f"{float(s.get('amount', 14)) * ctx.u:.1f}*cos(in*2.7)*between(in/30,{s['_a']:.3f},{s['_b']:.3f})" for s in shake) or "0"
    x = f"max(0,min(iw-iw/zoom,(iw-iw/zoom)*{fx}+({sx})))"
    y = f"max(0,min(ih-ih/zoom,(ih-ih/zoom)*{fy}+({sy})))"
    return z, x, y


def reframe_filter(pr, W, H, rf):
    mode = (rf or {}).get("mode", "crop")
    fx, fy = float((rf or {}).get("x", 0.5)), float((rf or {}).get("y", 0.5))
    if mode == "fit-blur" or mode == "blur":
        return (f"split[rf_bg][rf_fg];[rf_bg]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                f"boxblur=luma_radius=40:luma_power=2,eq=brightness=-0.08[rf_bg2];"
                f"[rf_fg]scale={W}:{H}:force_original_aspect_ratio=decrease[rf_fg2];"
                f"[rf_bg2][rf_fg2]overlay=(W-w)/2:(H-h)/2,setsar=1")
    if mode == "fit":
        return f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1"
    zoom = float((rf or {}).get("zoom", 1.0))
    return (f"scale={int(W * zoom)}:{int(H * zoom)}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H}:(iw-{W})*{fx}:(ih-{H})*{fy},setsar=1")


def find_media(ws, rel, kind):
    if not rel:
        return None
    for base in ("", ws, os.path.join(ws, kind), os.path.join(ws, "brand"), os.path.join(ws, "inbox")):
        p = os.path.join(base, rel) if base else rel
        if os.path.exists(p):
            return os.path.abspath(p)
    die(f"File not found: {rel}  (looked in {ws}/{kind})")


def sfx_path(name):
    p = os.path.join(LIB, "sfx", f"{name}.wav")
    if not os.path.exists(p):
        names = sorted(f[:-4] for f in os.listdir(os.path.join(LIB, "sfx")) if f.endswith(".wav"))
        die(f"Unknown sound effect '{name}'. Available: {', '.join(names)}")
    return p


def cmd_render(a):
    ws, jd = resolve_job(a)
    job = load_json(os.path.join(jd, "job.json"))
    words = load_json(os.path.join(jd, "words.json"), [])
    edit = load_json(os.path.join(jd, "edit.json"), {})
    if a.edit:
        edit = load_json(a.edit)
    brand = load_json(ws_paths(ws)["brand"], DEFAULT_BRAND)
    brand = dict(DEFAULT_BRAND, **brand)
    brand["colors"] = dict(DEFAULT_BRAND["colors"], **(brand.get("colors") or {}))
    if edit.get("brand_override"):
        for k, v in edit["brand_override"].items():
            if isinstance(v, dict):
                brand[k] = dict(brand.get(k, {}), **v)
            else:
                brand[k] = v
    src = job["source"]
    if not os.path.exists(src):
        die(f"Source video moved or deleted: {src}")
    pr = job["probe"]
    fmt = a.format or edit.get("format", "9:16")
    if fmt not in FORMATS:
        die(f"Unknown format {fmt}. Use one of {list(FORMATS)}")
    W, H = FORMATS[fmt]
    preview = a.preview
    RW, RH = (W // 2 // 2 * 2, H // 2 // 2 * 2) if preview else (W, H)

    segs = build_segments(words, pr["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    owords = tm.words(words)
    fonts = lib("fonts.json")
    ctx = Ctx(W, H, brand, fonts, owords, tm.duration)
    events = [dict(e) for e in edit.get("events", []) if not e.get("disabled")]

    # ---- ASS overlays
    hide = []
    for e in events:
        typ = e.get("type")
        if typ in ASS_EVENTS:
            r = ASS_EVENTS[typ](ctx, e)
            if r and e.get("hide_captions", typ in ("card", "checklist", "counter", "countdown", "cta")):
                hide.append(r)
            if e.get("sfx") and typ not in ("checklist", "counter", "countdown", "cta", "tag", "lower_third"):
                ctx.extra_sfx.append((r[0] if r else ctx.t(e.get("at"), 0.0), e["sfx"], float(e.get("sfx_volume", 0.55))))
        elif typ not in VIDEO_EVENTS and typ not in AUDIO_EVENTS:
            die(f"Unknown event type '{typ}'. Run `vibe.py list effects` to see all.")
    build_captions(ctx, edit.get("captions", {}), hide)
    styles = [v[1] for v in ctx.styles.values()]
    if not styles:
        styles = [("S0", "Poppins Black", 40, "&H00FFFFFF", "&H00000000", 0, 0, False, False, 1, "&H96000000")]
    ass = ass_header(W, H, styles) + "\n".join(ctx.lines) + "\n"
    with open(os.path.join(jd, "overlay.ass"), "w", encoding="utf-8") as f:
        f.write(ass)
    fontsdir = os.path.relpath(ensure_fonts(ws), jd).replace("\\", "/")

    # ---- inputs
    inputs = ["-i", src]
    n_in = 1
    graph = []
    sel = "+".join(f"between(t,{x:.4f},{y - 0.5 / FPS:.4f})" for x, y in segs)
    graph.append(f"[0:v]setpts=PTS-STARTPTS,fps={FPS},select='{sel}',setpts=N/{FPS}/TB,"
                 + reframe_filter(pr, RW, RH, edit.get("reframe")) + "[v0]")
    cur = "v0"

    # zoom / shake
    zooms, shakes = [], []
    for e in events:
        if e.get("type") in ("zoom", "shake"):
            a_, b_ = ev_window(ctx, e, 1.5 if e["type"] == "zoom" else 0.4)
            e["_a"], e["_b"] = a_, b_
            (zooms if e["type"] == "zoom" else shakes).append(e)
            if e.get("sfx"):
                ctx.extra_sfx.append((a_, e["sfx"], float(e.get("sfx_volume", 0.5))))
    if zooms or shakes:
        z, x, y = zoom_expr(ctx, zooms, shakes)
        graph.append(f"[{cur}]zoompan=z='{z}':x='{x}':y='{y}':d=1:s={RW}x{RH}:fps={FPS}[vz]")
        cur = "vz"

    # b-roll / images
    k = 0
    for e in events:
        if e.get("type") == "broll":
            a_, b_ = ev_window(ctx, e, 3.0)
            p = find_media(ws, e.get("file"), "broll")
            is_img = p.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
            dur = b_ - a_
            if is_img:
                inputs += ["-loop", "1", "-t", f"{dur + 0.5:.3f}", "-i", p]
            else:
                inputs += ["-ss", f"{float(e.get('from', 0)):.3f}", "-t", f"{dur + 0.5:.3f}", "-i", p]
            mode = e.get("mode", "full")
            if mode == "full":
                sc = f"scale={RW}:{RH}:force_original_aspect_ratio=increase,crop={RW}:{RH},setsar=1"
                pos = "0:0"
            else:
                pw = int(RW * float(e.get("size", 0.86))) // 2 * 2
                sc = f"scale={pw}:-2,setsar=1"
                pos = f"(W-w)/2:{RH * float(e.get('y', 0.12)):.0f}"
            kb = ""
            if is_img and e.get("kenburns", True):
                kb = f",zoompan=z='1+0.0015*on':d=1:s={RW}x{RH}:fps={FPS}" if mode == "full" else ""
            graph.append(f"[{n_in}:v]{sc}{kb},fps={FPS},format=yuva420p,fade=t=in:st=0:d=0.15:alpha=1,"
                         f"setpts=PTS-STARTPTS+{a_:.3f}/TB[b{k}]")
            graph.append(f"[{cur}][b{k}]overlay={pos}:enable='between(t,{a_:.3f},{b_:.3f})':eof_action=pass[vb{k}]")
            cur = f"vb{k}"
            n_in += 1
            k += 1
            if e.get("sfx"):
                ctx.extra_sfx.append((a_, e["sfx"], float(e.get("sfx_volume", 0.45))))
        elif e.get("type") == "image":
            a_, b_ = ev_window(ctx, e, 3.0)
            p = find_media(ws, e.get("file") or brand.get("logo"), "brand")
            inputs += ["-loop", "1", "-t", f"{b_ - a_ + 0.5:.3f}", "-i", p]
            iw = int(RW * float(e.get("size", 0.22))) // 2 * 2
            posmap = {"top-right": f"W-w-{RW * 0.05:.0f}:{RH * 0.06:.0f}", "top-left": f"{RW * 0.05:.0f}:{RH * 0.06:.0f}",
                      "center": "(W-w)/2:(H-h)/2", "bottom-right": f"W-w-{RW * 0.05:.0f}:H-h-{RH * 0.06:.0f}",
                      "top": f"(W-w)/2:{RH * 0.08:.0f}", "bottom-left": f"{RW * 0.05:.0f}:H-h-{RH * 0.06:.0f}"}
            pos = posmap.get(e.get("position", "top-right"), posmap["top-right"])
            graph.append(f"[{n_in}:v]scale={iw}:-2,format=yuva420p,fade=t=in:st=0:d=0.25:alpha=1,"
                         f"setpts=PTS-STARTPTS+{a_:.3f}/TB[i{k}]")
            graph.append(f"[{cur}][i{k}]overlay={pos}:enable='between(t,{a_:.3f},{b_:.3f})':eof_action=pass[vi{k}]")
            cur = f"vi{k}"
            n_in += 1
            k += 1

    # look
    looks = lib("looks.json")
    look = edit.get("look", brand.get("look", "punchy"))
    chain = []
    if look and look != "none":
        if look not in looks:
            die(f"Unknown look '{look}'. Available: {', '.join(looks)}")
        chain.append(looks[look]["filter"])
    # window fx
    for e in events:
        typ = e.get("type")
        if typ in ("glitch", "bw", "blur", "darken"):
            a_, b_ = ev_window(ctx, e, 0.35 if typ == "glitch" else 1.5)
            en = f"enable='between(t,{a_:.3f},{b_:.3f})'"
            if typ == "glitch":
                s = int(float(e.get("amount", 18)) * ctx.u * (0.5 if preview else 1))
                chain.append(f"rgbashift=rh={s}:bh=-{s}:gv={s // 2}:{en}")
                chain.append(f"noise=alls=30:allf=t:{en}")
                if e.get("sfx", "glitch"):
                    ctx.extra_sfx.append((a_, e.get("sfx", "glitch"), 0.5))
            elif typ == "bw":
                chain.append(f"hue=s=0:{en}")
            elif typ == "blur":
                chain.append(f"gblur=sigma={float(e.get('amount', 18)) * (0.5 if preview else 1):.1f}:{en}")
            elif typ == "darken":
                chain.append(f"eq=brightness=-{float(e.get('amount', 0.25)):.2f}:{en}")
    chain.append(f"ass=overlay.ass:fontsdir={fontsdir}")
    chain.append("format=yuv420p")
    graph.append(f"[{cur}]" + ",".join(chain) + "[vout]")

    # ---- audio
    au = edit.get("audio", {}) or {}
    if pr["has_audio"]:
        asel = "+".join(f"between(t,{x:.4f},{y - 0.5 / SR:.5f})" for x, y in segs)
        vchain = (f"[0:a]asetpts=PTS-STARTPTS,aresample={SR},aselect='{asel}',asetpts=N/SR/TB,"
                  f"aformat=sample_fmts=fltp:channel_layouts=stereo,highpass=f=70")
        if au.get("denoise"):
            vchain += ",afftdn=nr=12:nf=-30"
        vchain += f",acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=2"
        vchain += f",loudnorm=I={float(au.get('loudness', -14))}:TP=-1.5:LRA=11,aresample={SR}"
        vchain += f",atrim=0:{tm.duration:.3f}[voice]"
        graph.append(vchain)
    else:
        graph.append(f"anullsrc=r={SR}:cl=stereo,atrim=0:{tm.duration:.3f}[voice]")
    mix = ["voice"]
    music = au.get("music")
    if music and music.get("file"):
        mp = find_media(ws, music["file"], "music")
        inputs += ["-stream_loop", "-1", "-i", mp]
        vol = float(music.get("volume", 0.14))
        graph.append(f"[{n_in}:a]aresample={SR},aformat=sample_fmts=fltp:channel_layouts=stereo,"
                     f"atrim=0:{tm.duration:.3f},volume={vol},afade=t=in:d=0.6,"
                     f"afade=t=out:st={max(0, tm.duration - 1.5):.3f}:d=1.5[mus]")
        n_in += 1
        if music.get("duck", True) and pr["has_audio"]:
            graph[-2] = graph[-2]  # keep
            # split voice for sidechain
            graph = [g.replace("[voice]", "[voice_pre]") if g.endswith("[voice]") else g for g in graph]
            graph.append("[voice_pre]asplit[voice][vsc]")
            graph.append("[mus][vsc]sidechaincompress=threshold=0.04:ratio=6:attack=30:release=350[musd]")
            mix.append("musd")
        else:
            mix.append("mus")
    sfx_list = []
    for e in events:
        if e.get("type") == "sfx":
            sfx_list.append((ctx.t(e.get("at"), 0.0), e.get("name", "whoosh"), float(e.get("volume", 0.55))))
    sfx_list += ctx.extra_sfx
    if not edit.get("auto_sfx", True):
        sfx_list = [s for s in sfx_list if s in [(ctx.t(e.get("at"), 0.0), e.get("name"), float(e.get("volume", 0.55)))
                                                  for e in events if e.get("type") == "sfx"]]
    for i, (t0, name, vol) in enumerate(sorted(sfx_list)):
        if t0 >= tm.duration:
            continue
        inputs += ["-i", sfx_path(name)]
        ms = int(max(0, t0) * 1000)
        graph.append(f"[{n_in}:a]aresample={SR},aformat=sample_fmts=fltp:channel_layouts=stereo,"
                     f"volume={vol},adelay={ms}|{ms}[sx{i}]")
        mix.append(f"sx{i}")
        n_in += 1
    if len(mix) > 1:
        graph.append("".join(f"[{m}]" for m in mix) +
                     f"amix=inputs={len(mix)}:duration=first:normalize=0,alimiter=limit=0.95,atrim=0:{tm.duration:.3f}[aout]")
    else:
        graph.append("[voice]anull[aout]")

    out_name = slug(edit.get("output", {}).get("name") or job["name"])
    suffix = "" if fmt == "9:16" else "-" + fmt.replace(":", "x")
    if preview:
        out = os.path.join(jd, f"preview{suffix}.mp4")
        venc = ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "28"]
    else:
        os.makedirs(ws_paths(ws)["output"], exist_ok=True)
        out = os.path.join(ws_paths(ws)["output"], f"{out_name}{suffix}.mp4")
        venc = ["-c:v", "libx264", "-preset", a.preset, "-crf", str(a.crf), "-profile:v", "high"]
    with open(os.path.join(jd, "graph.txt"), "w", encoding="utf-8") as f:
        f.write(";\n".join(graph))
    info(f"🎞  Rendering {'preview' if preview else 'final'} {fmt} ({RW}x{RH}), {tm.duration:.1f}s, "
         f"{len(events)} effects, {len(sfx_list)} sounds…")
    t0 = time.time()
    run_ff(inputs + ["-filter_complex", ";".join(graph), "-map", "[vout]", "-map", "[aout]"] + venc +
           ["-r", str(FPS), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            "-t", f"{tm.duration:.3f}", out], cwd=jd, desc="render")
    info(f"✅ Done in {time.time() - t0:.0f}s → {out}")
    save_json(os.path.join(jd, "last_render.json"), {"file": out, "duration": tm.duration, "preview": preview,
                                                      "events": [{"type": e.get("type"),
                                                                  "at": round(ctx.t(e.get("at"), 0.0), 2)}
                                                                 for e in events]})


# --------------------------------------------------------------------------- stills / cover

def cmd_stills(a):
    ws, jd = resolve_job(a)
    lr = load_json(os.path.join(jd, "last_render.json"))
    if not lr:
        die("Render first (use --preview for speed).")
    src = a.file or lr["file"]
    dur = lr["duration"]
    if a.times:
        times = [float(x) for x in a.times.split(",")]
    else:
        ev = sorted({e["at"] for e in lr.get("events", [])})
        times = [min(dur - 0.1, t + 0.6) for t in ev][:11]
        if len(times) < 6:
            n = 8
            times = sorted(set(times + [dur * (i + 0.5) / n for i in range(n)]))[:12]
    tmp = os.path.join(jd, "stills")
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    for i, t in enumerate(times):
        run_ff(["-ss", f"{max(0, t):.3f}", "-i", src, "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "3",
                os.path.join(tmp, f"f{i:02d}.jpg")], desc="still")
    cols = min(6, len(times))
    rows = math.ceil(len(times) / cols)
    out = os.path.join(jd, "storyboard.jpg")
    run_ff(["-framerate", "1", "-i", os.path.join(tmp, "f%02d.jpg"), "-vf",
            f"tile={cols}x{rows}:padding=8:margin=8:color=0x202020", "-frames:v", "1", "-q:v", "3", out], desc="tile")
    info(f"🖼  Storyboard ({len(times)} frames at {', '.join(f'{t:.1f}s' for t in times)}) → {out}")


def cmd_peek(a):
    """Contact sheet of any video (e.g. a reference reel) so Claude can study its style."""
    src = os.path.abspath(a.video)
    if not os.path.exists(src):
        die(f"Video not found: {src}")
    pr = probe(src)
    n = max(2, min(int(a.n), 24))
    ws = find_ws(a.ws or os.path.dirname(src))
    tmp = os.path.join(ws, ".vibe", "peek", slug(os.path.splitext(os.path.basename(src))[0]))
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    times = [pr["duration"] * (i + 0.5) / n for i in range(n)]
    for i, t in enumerate(times):
        run_ff(["-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "3",
                os.path.join(tmp, f"f{i:02d}.jpg")], desc="peek")
    cols = min(6, n)
    rows = math.ceil(n / cols)
    out = a.out or os.path.join(tmp, "contact.jpg")
    run_ff(["-framerate", "1", "-i", os.path.join(tmp, "f%02d.jpg"), "-vf",
            f"tile={cols}x{rows}:padding=8:margin=8:color=0x202020", "-frames:v", "1", "-q:v", "3", out], desc="tile")
    info(f"🖼  {os.path.basename(src)}: {pr['width']}x{pr['height']}, {pr['duration']:.1f}s — {n} frames at "
         f"{', '.join(f'{t:.1f}s' for t in times)}\n→ {out}")


def cmd_cover(a):
    ws, jd = resolve_job(a)
    job = load_json(os.path.join(jd, "job.json"))
    words = load_json(os.path.join(jd, "words.json"), [])
    edit = load_json(os.path.join(jd, "edit.json"), {})
    brand = dict(DEFAULT_BRAND, **load_json(ws_paths(ws)["brand"], {}))
    brand["colors"] = dict(DEFAULT_BRAND["colors"], **(brand.get("colors") or {}))
    pr = job["probe"]
    fmt = a.format or edit.get("format", "9:16")
    W, H = FORMATS[fmt]
    segs = build_segments(words, pr["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    ctx = Ctx(W, H, brand, lib("fonts.json"), tm.words(words), tm.duration)
    t_out = ctx.t(a.at, min(1.0, tm.duration / 3))
    t_src = tm.to_src(t_out)
    u = ctx.u
    pos = a.position
    y = {"top": H * 0.20, "center": H * 0.45, "bottom": H * 0.74}[pos]
    shp = ctx.style("poppins-bold", 20, "#FFFFFF", "#000000", 0, 0)
    band_y = 0 if pos == "top" else H * 0.5 if pos == "bottom" else H * 0.25
    ctx.add(0, 5, shp, "{" + f"\\an7\\pos(0,{band_y:.0f})\\bord0\\shad0\\1c&H000000&\\1a&H70&\\blur{round(60 * u)}\\p1" + "}" +
            f"m 0 0 l {W} 0 {W} {H * 0.5:.0f} 0 {H * 0.5:.0f}", layer=1)
    font = a.font or brand.get("fonts", {}).get("title", "poppins-black")
    lines, fs = ctx.wrap(a.title.upper(), font, 132 * u, W * 0.88, max_lines=4)
    st = ctx.style(font, fs, "#FFFFFF", "#000000", round(8 * u), round(6 * u))
    lh = fs * 1.1
    draw_lines(ctx, 0, 5, st, lines, W / 2, y, lh, lambda xx, yy: f"\\an5\\pos({xx:.0f},{yy:.0f})", "#FFFFFF",
               brand["colors"]["accent"], 5)
    if a.sub:
        sst = ctx.style("inter-extrabold", round(56 * u), brand["colors"]["accent"], "#000000", round(5 * u), round(3 * u))
        ctx.add(0, 5, sst, "{" + f"\\an5\\pos({W / 2:.0f},{y + lh * len(lines) / 2 + 50 * u:.0f})" + "}" + esc(a.sub.upper()), layer=5)
    with open(os.path.join(jd, "cover.ass"), "w", encoding="utf-8") as f:
        f.write(ass_header(W, H, [v[1] for v in ctx.styles.values()]) + "\n".join(ctx.lines) + "\n")
    fontsdir = os.path.relpath(ensure_fonts(ws), jd).replace("\\", "/")
    looks = lib("looks.json")
    look = edit.get("look", brand.get("look", "punchy"))
    lf = (looks.get(look, {}).get("filter", "") + ",") if look and look != "none" else ""
    out_name = slug(edit.get("output", {}).get("name") or job["name"])
    os.makedirs(ws_paths(ws)["output"], exist_ok=True)
    out = os.path.join(ws_paths(ws)["output"], f"{out_name}-cover.jpg")
    rf = reframe_filter(pr, W, H, edit.get("reframe"))
    if rf.startswith("split"):
        rf = rf.replace("[rf_bg2][rf_fg2]overlay", "[rf_bg2][rf_fg2]overlay")
        vf = f"[0:v]{rf}[r];[r]{lf}ass=cover.ass:fontsdir={fontsdir}[o]"
        run_ff(["-ss", f"{t_src:.3f}", "-i", job["source"], "-frames:v", "1", "-filter_complex", vf, "-map", "[o]",
                "-q:v", "2", out], cwd=jd, desc="cover")
    else:
        run_ff(["-ss", f"{t_src:.3f}", "-i", job["source"], "-frames:v", "1", "-vf",
                f"{rf},{lf}ass=cover.ass:fontsdir={fontsdir}", "-q:v", "2", out], cwd=jd, desc="cover")
    info(f"✅ Cover (frame at {t_out:.1f}s) → {out}")


# --------------------------------------------------------------------------- list

EFFECTS_DOC = {
    "title": "Big animated headline. text (use *word* for accent colour, | for new line), style: pop|slide|drop|punch|stamp|fade|typewriter|split|glow|highlight|zoom-out, position: top|upper|center|lower|bottom|0-1, size: s|m|l|xl|xxl",
    "text": "Smaller on-screen text (same options as title, default fade, centre).",
    "stamp": "Rotated slam-in word like 'SAVED!' or 'WRONG'.",
    "card": "Rounded info card. text, sub, label, style: note|dark|accent|myth|fact|tip|quote|glass, position, anim: pop|slide|fade",
    "checklist": "Card whose items tick on one by one. items: [..], title, times: [phrases or seconds]",
    "counter": "Animated number count-up. from, to, prefix (e.g. ₹), suffix (e.g. K, %), label, decimals",
    "cta": "Call-to-action pill (defaults to the last 2.8s). text, style: pill|dark|light",
    "tag": "Small pill label, e.g. a location or app name. text, position",
    "lower_third": "Name bar that slides in. text (name), sub (handle/title)",
    "progress_bar": "Thin bar that fills across the whole video. position: top|bottom",
    "countdown": "3-2-1 big numbers with ticks. from: 3",
    "flash": "White (or colour) flash, great on hard cuts. dur, color",
    "letterbox": "Cinematic black bars slide in. dur, size",
    "zoom": "Camera zoom on the speaker. style: punch|push|pulse|pull, amount (1.1–1.5), focus [x,y]",
    "shake": "Camera shake for impact. dur, amount",
    "glitch": "RGB-split digital glitch (auto glitch sound).",
    "bw": "Black & white for a moment (flashback / 'before').",
    "blur": "Blur the video (e.g. behind a card).",
    "darken": "Dim the video (e.g. behind a big title).",
    "broll": "Cut away to a clip or image from broll/. file, from, mode: full|pip, size, y",
    "image": "Logo / sticker image overlay. file (default brand logo), position: top-right|top-left|top|center|bottom-right|bottom-left, size",
    "sfx": "Sound effect. name, volume",
}


def cmd_list(a):
    what = a.what
    if what in ("captions", "all"):
        info("CAPTION STYLES")
        for k, v in lib("captions.json").items():
            info(f"  {k:14s} {v['desc']}")
    if what in ("looks", "all"):
        info("\nLOOKS (colour grades)")
        for k, v in lib("looks.json").items():
            info(f"  {k:14s} {v['desc']}")
    if what in ("sfx", "all"):
        info("\nSOUND EFFECTS")
        for k, v in lib("sfx/sfx.json").items():
            info(f"  {k:14s} {v['desc']}")
    if what in ("fonts", "all"):
        info("\nFONTS")
        for k, v in lib("fonts.json").items():
            info(f"  {k:18s} {v['desc']}")
    if what in ("effects", "all"):
        info("\nEFFECTS (event types for edit.json)")
        for k, v in EFFECTS_DOC.items():
            info(f"  {k:13s} {v}")


# --------------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(prog="vibe.py", description="Vibe Editor engine")
    ap.add_argument("--version", action="version", version=VERSION)
    sp = ap.add_subparsers(dest="cmd", required=True)

    p = sp.add_parser("install")
    p.add_argument("--model", default="small")
    p.add_argument("--skip-model", action="store_true")
    p.set_defaults(fn=cmd_install)

    p = sp.add_parser("doctor")
    p.add_argument("--ws")
    p.add_argument("--no-render-test", dest="render_test", action="store_false")
    p.set_defaults(fn=cmd_doctor)

    p = sp.add_parser("init")
    p.add_argument("path")
    p.set_defaults(fn=cmd_init)

    p = sp.add_parser("prep")
    p.add_argument("video")
    p.add_argument("--name")
    p.add_argument("--ws")
    p.add_argument("--lang", help="e.g. en, hi, ta, te, bn, mr, gu, kn, ml, pa (default auto)")
    p.add_argument("--model", default="small", help="tiny|base|small|medium|large-v3")
    p.add_argument("--format", choices=list(FORMATS))
    p.add_argument("--reset", action="store_true", help="overwrite existing edit.json")
    p.add_argument("--no-transcribe", action="store_true")
    p.set_defaults(fn=cmd_prep)

    p = sp.add_parser("fix")
    p.add_argument("job")
    p.add_argument("fixes", help='JSON file or inline JSON like {"12":"Claude","30-31":"ChatGPT"}')
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_fix)

    p = sp.add_parser("timeline")
    p.add_argument("job")
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_timeline)

    p = sp.add_parser("render")
    p.add_argument("job")
    p.add_argument("--ws")
    p.add_argument("--preview", action="store_true")
    p.add_argument("--format", choices=list(FORMATS))
    p.add_argument("--edit", help="use a different edit json")
    p.add_argument("--preset", default="medium")
    p.add_argument("--crf", type=int, default=18)
    p.set_defaults(fn=cmd_render)

    p = sp.add_parser("stills")
    p.add_argument("job")
    p.add_argument("--ws")
    p.add_argument("--times", help="comma-separated seconds")
    p.add_argument("--file")
    p.set_defaults(fn=cmd_stills)

    p = sp.add_parser("peek")
    p.add_argument("video")
    p.add_argument("--n", default=12)
    p.add_argument("--out")
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_peek)

    p = sp.add_parser("cover")
    p.add_argument("job")
    p.add_argument("--title", required=True)
    p.add_argument("--sub")
    p.add_argument("--at", help="seconds or a spoken phrase")
    p.add_argument("--position", choices=["top", "center", "bottom"], default="top")
    p.add_argument("--font")
    p.add_argument("--format", choices=list(FORMATS))
    p.add_argument("--ws")
    p.set_defaults(fn=cmd_cover)

    p = sp.add_parser("list")
    p.add_argument("what", nargs="?", default="all", choices=["all", "captions", "looks", "sfx", "fonts", "effects"])
    p.set_defaults(fn=cmd_list)

    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()

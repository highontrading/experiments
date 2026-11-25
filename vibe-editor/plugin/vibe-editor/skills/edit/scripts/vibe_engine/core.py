"""Core: utilities, ffmpeg, workspace, style registry, transcription, cutting."""
import glob
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.dirname(HERE)
SKILL_DIR = os.path.dirname(SCRIPTS)
LIB = os.path.join(SKILL_DIR, "library")
VERSION = "2.0.0"

FPS = 30
SR = 48000

WARNINGS = []


# --------------------------------------------------------------------------- utils

class VibeError(Exception):
    pass


def die(msg, code=1):
    raise VibeError(msg)


def info(msg):
    print(msg, flush=True)


def warn(msg):
    if msg not in WARNINGS:
        WARNINGS.append(msg)
        print(f"⚠️  {msg}", flush=True)


def load_json(path, default=None):
    if not path or not os.path.exists(path):
        return default
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        die(f"{os.path.basename(path)} is not valid JSON (line {e.lineno}: {e.msg}). Fix the file and retry.")


def save_json(path, data):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def slug(s):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", str(s)).strip("-").lower()
    return s or "reel"


def fmt_ts(t):
    t = max(0.0, t)
    m = int(t // 60)
    return f"{m:02d}:{t - m * 60:05.2f}"


def user_cache():
    base = os.environ.get("VIBE_CACHE") or os.path.join(os.path.expanduser("~"), ".cache", "vibe-editor")
    os.makedirs(base, exist_ok=True)
    return base


# --------------------------------------------------------------------------- ffmpeg

_FF = None


def has_libass(exe):
    try:
        out = subprocess.run([exe, "-hide_banner", "-filters"], capture_output=True, text=True, timeout=30).stdout
        return " ass " in out and " zoompan " in out
    except Exception:
        return False


def ffmpeg_candidates():
    cands = [os.environ.get("VIBE_FFMPEG"), shutil.which("ffmpeg")]
    try:
        import imageio_ffmpeg  # noqa
        cands.append(imageio_ffmpeg.get_ffmpeg_exe())
    except Exception:
        pass
    return [c for c in cands if c and os.path.exists(c)]


def ffmpeg():
    global _FF
    if _FF:
        return _FF
    for c in ffmpeg_candidates():
        if has_libass(c):
            _FF = c
            return c
    die("ffmpeg (with libass) not found. Run:  python3 vibe.py install")


def reset_ffmpeg():
    global _FF
    _FF = None


def run_ff(args, cwd=None, desc="ffmpeg", check=True):
    cmd = [ffmpeg(), "-hide_banner", "-y", "-loglevel", "error"] + args
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if p.returncode != 0 and check:
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

WS_DIRS = ["inbox", "output", "brand", "broll", "music", "references", "sounds", "fonts", "looks", "styles"]
CUR = {"ws": None}


def find_ws(start=None):
    d = os.path.abspath(start or os.getcwd())
    if os.path.isfile(d):
        d = os.path.dirname(d)
    cur = d
    while True:
        if os.path.exists(os.path.join(cur, "vibe.json")):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            return d
        cur = parent


def set_ws(ws):
    CUR["ws"] = ws
    _REG_CACHE.clear()


def ws_paths(ws=None):
    ws = ws or CUR["ws"] or os.getcwd()
    return {
        "ws": ws,
        "vibe": os.path.join(ws, ".vibe"),
        "jobs": os.path.join(ws, ".vibe", "jobs"),
        "fonts": os.path.join(ws, ".vibe", "fonts"),
        "brand": os.path.join(ws, "brand", "brand.json"),
        "output": os.path.join(ws, "output"),
        "styles": os.path.join(ws, "styles"),
    }


DEFAULT_BRAND = {
    "name": "",
    "handle": "",
    "niche": "",
    "vibe": "clean, modern",
    "language": "auto",
    "caption_script": "roman",
    "colors": {"accent": "#FFD400", "accent2": "#8B5CF6", "text": "#FFFFFF", "dark": "#161616", "card": "#FFFFFF"},
    "fonts": {"title": "poppins-black", "body": "inter-extrabold", "serif": "instrument-serif"},
    "caption_style": "bold-pop",
    "look": "punchy",
    "cta": "Follow for more",
    "logo": "",
    "notes": [],
}


def load_brand(ws=None):
    b = load_json(ws_paths(ws)["brand"], {}) or {}
    brand = dict(DEFAULT_BRAND, **b)
    brand["colors"] = dict(DEFAULT_BRAND["colors"], **(b.get("colors") or {}))
    brand["fonts"] = dict(DEFAULT_BRAND["fonts"], **(b.get("fonts") or {}))
    return brand


def ensure_fonts(ws):
    dst = ws_paths(ws)["fonts"]
    os.makedirs(dst, exist_ok=True)
    src = os.path.join(LIB, "fonts")
    for f in os.listdir(src):
        if f.lower().endswith((".ttf", ".otf")) and not os.path.exists(os.path.join(dst, f)):
            shutil.copy2(os.path.join(src, f), os.path.join(dst, f))
    for path in user_font_files(ws):
        target = os.path.join(dst, os.path.basename(path))
        if not os.path.exists(target) or os.path.getmtime(target) < os.path.getmtime(path):
            shutil.copy2(path, target)
    return dst


# --------------------------------------------------------------------------- registry

_REG_CACHE = {}


def lib(name):
    key = ("lib", name)
    if key not in _REG_CACHE:
        _REG_CACHE[key] = load_json(os.path.join(LIB, name), {}) or {}
    return _REG_CACHE[key]


def user_json(name):
    ws = CUR["ws"]
    if not ws:
        return {}
    return load_json(os.path.join(ws, "styles", name), {}) or {}


def captions_reg():
    d = dict(lib("captions.json"))
    for k, v in user_json("captions.json").items():
        v = dict(v)
        v.setdefault("desc", "Your saved caption style")
        v["_user"] = True
        d[k] = v
    return d


def looks_reg():
    d = dict(lib("looks.json"))
    for k, v in user_json("looks.json").items():
        v = dict(v)
        v["_user"] = True
        d[k] = v
    ws = CUR["ws"]
    if ws:
        for folder in ("looks", "brand"):
            for f in sorted(glob.glob(os.path.join(ws, folder, "*"))):
                if f.lower().endswith((".cube", ".3dl")):
                    d[slug(os.path.splitext(os.path.basename(f))[0])] = {"lut": f, "desc": "Your LUT colour grade", "_user": True}
    return d


AUDIO_EXT = (".wav", ".mp3", ".m4a", ".aac", ".ogg", ".flac")


def sounds_reg():
    d = {}
    for k, v in lib("sfx/sfx.json").items():
        d[k] = dict(v, path=os.path.join(LIB, "sfx", v["file"]))
    ws = CUR["ws"]
    if ws:
        for f in sorted(glob.glob(os.path.join(ws, "sounds", "*"))):
            if f.lower().endswith(AUDIO_EXT):
                d[slug(os.path.splitext(os.path.basename(f))[0])] = {"path": f, "desc": "Your sound", "_user": True}
    return d


def sound_path(name):
    if not name:
        return None
    reg = sounds_reg()
    key = slug(os.path.splitext(os.path.basename(str(name)))[0])
    if key in reg:
        return reg[key]["path"]
    ws = CUR["ws"]
    for base in ([ws, os.path.join(ws, "sounds")] if ws else []) + [""]:
        p = os.path.join(base, str(name)) if base else str(name)
        if os.path.isfile(p):
            return os.path.abspath(p)
    warn(f"Sound '{name}' not found — skipped. (Built-in: {', '.join(sorted(lib('sfx/sfx.json'))[:12])}… or put files in sounds/)")
    return None


def presets_reg():
    d = {}
    for k, v in lib("presets.json").items():
        d[k] = v
    ws = CUR["ws"]
    if ws:
        for f in sorted(glob.glob(os.path.join(ws, "styles", "effects", "*.json"))):
            try:
                v = load_json(f, {})
                d[slug(os.path.splitext(os.path.basename(f))[0])] = dict(v, _user=True)
            except VibeError as e:
                warn(str(e))
    return d


# --------------------------------------------------------------------------- fonts

def user_font_files(ws=None):
    ws = ws or CUR["ws"]
    if not ws:
        return []
    out = []
    for folder in ("fonts", "brand"):
        out += [f for f in sorted(glob.glob(os.path.join(ws, folder, "*"))) if f.lower().endswith((".ttf", ".otf"))]
    return out


def font_metrics_from_file(path):
    """Exact metrics with fontTools (pip install fonttools)."""
    from fontTools.ttLib import TTFont
    t = TTFont(path, lazy=True, fontNumber=0)
    os2 = t["OS/2"]
    upm = t["head"].unitsPerEm
    den = (os2.usWinAscent + os2.usWinDescent) or (t["hhea"].ascent - t["hhea"].descent) or upm
    cap = getattr(os2, "sCapHeight", 0) or int(upm * 0.7)
    cmap = t.getBestCmap() or {}
    hm = t["hmtx"]
    adv = {}
    for cp in list(range(32, 127)) + list(range(160, 256)) + [0x20B9, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D,
                                                              0x2026, 0x2022, 0x2713, 0x2192, 0x20AC, 0x2605]:
        g = cmap.get(cp)
        if g:
            adv[chr(cp)] = hm[g][0]
    vals = [v for v in adv.values() if v]
    avg = sum(vals) / len(vals) if vals else upm * 0.55
    name = t["name"]

    def nm(i):
        r = name.getName(i, 3, 1, 0x409) or name.getName(i, 1, 0, 0)
        return str(r) if r else None
    full = nm(4) or nm(1) or os.path.splitext(os.path.basename(path))[0]
    return {"den": den, "cap": cap, "asc": os2.usWinAscent, "upm": upm, "avg": avg, "adv": adv,
            "family": full, "family1": nm(1), "style": nm(2)}


def fonts_reg():
    if "fonts" in _REG_CACHE:
        return _REG_CACHE["fonts"]
    base = lib("fonts.json")
    metrics = lib("fontmetrics.json")
    d = {}
    for k, v in base.items():
        f = dict(v)
        if k in metrics:
            f.update({kk: vv for kk, vv in metrics[k].items() if kk != "family"})
        d[k] = f
    ws = CUR["ws"]
    files = user_font_files(ws)
    if files:
        cache_path = os.path.join(ws, ".vibe", "fontcache.json")
        cache = load_json(cache_path, {}) or {}
        changed = False
        for path in files:
            key = slug(os.path.splitext(os.path.basename(path))[0])
            stamp = f"{os.path.getsize(path)}-{int(os.path.getmtime(path))}"
            ent = cache.get(path)
            if not ent or ent.get("stamp") != stamp:
                try:
                    m = font_metrics_from_file(path)
                    ent = dict(m, stamp=stamp, file=os.path.basename(path))
                except ImportError:
                    ent = {"stamp": stamp, "file": os.path.basename(path), "family": os.path.splitext(os.path.basename(path))[0],
                           "width": 0.55, "norm": 1.0, "_nometrics": True}
                    warn("Install fonttools (`python3 vibe.py install`) so your own fonts are measured exactly.")
                except Exception as e:
                    warn(f"Could not read font {os.path.basename(path)}: {e}")
                    continue
                cache[path] = ent
                changed = True
            f = {"file": ent["file"], "family": ent["family"], "bold": False, "desc": f"Your font ({ent['family']})",
                 "_user": True}
            f.update({kk: vv for kk, vv in ent.items() if kk in ("den", "cap", "asc", "upm", "avg", "adv", "width", "norm")})
            d[key] = f
        if changed:
            save_json(cache_path, cache)
    # normalisation: same cap height as Inter ExtraBold at the same nominal size
    ref = d.get("inter-extrabold")
    ref_ratio = (ref["cap"] / ref["den"]) if ref and "cap" in ref else 0.53
    for k, f in d.items():
        if "cap" in f and "den" in f and f["cap"]:
            f["norm"] = round(ref_ratio / (f["cap"] / f["den"]), 4)
        f.setdefault("norm", 1.0)
    _REG_CACHE["fonts"] = d
    return d


def resolve_font(key):
    """Accept a library key, a user font key, a family name or a file name."""
    reg = fonts_reg()
    if not key:
        return "poppins-black"
    if key in reg:
        return key
    k = slug(os.path.splitext(os.path.basename(str(key)))[0])
    if k in reg:
        return k
    def squash(x):
        return re.sub(r"[^a-z0-9]", "", str(x).lower())
    low = squash(key)
    for kk, f in reg.items():
        if low in (squash(kk), squash(f.get("family", "")), squash(f.get("family1") or ""),
                   squash(os.path.splitext(f.get("file", ""))[0])):
            return kk
    for kk in reg:  # e.g. "rubik glitch" -> rubikglitch-regular
        if squash(kk).startswith(low) and len(low) >= 4:
            return kk
    warn(f"Font '{key}' not found — using Poppins Black. Put .ttf/.otf files in fonts/ to use your own.")
    return "poppins-black"


# --------------------------------------------------------------------------- transcription

FILLERS = {"um", "umm", "uh", "uhh", "uhm", "erm", "hmm", "hm", "mm", "mmm", "ah", "aah", "eh"}


def transcribe(src, lang=None, model_size="small"):
    try:
        from faster_whisper import WhisperModel
    except Exception:
        die("Speech engine not installed. Run:  python3 vibe.py install")
    import numpy as np
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
    return re.sub(r"[^\w%₹$]+", "", s.lower(), flags=re.UNICODE)


def build_segments(words, duration, cuts):
    """Return frame-aligned keep segments [(a, b), …] in source time."""
    cuts = cuts or {}
    drop_idx = set()
    for rng_ in cuts.get("drop_words", []) or []:
        try:
            if isinstance(rng_, int):
                rng_ = [rng_, rng_]
            lo, hi = int(rng_[0]), int(rng_[-1])
            drop_idx.update(range(min(lo, hi), max(lo, hi) + 1))
        except (TypeError, ValueError, IndexError):
            warn(f"Ignoring bad drop_words entry {rng_!r}")
    if cuts.get("remove_fillers", True):
        for w in words:
            if norm_word(w["text"]) in FILLERS:
                drop_idx.add(w["i"])
    drops = []
    for d in (cuts.get("drop") or []):
        try:
            drops.append((float(d[0]), float(d[1])))
        except (TypeError, ValueError, IndexError):
            warn(f"Ignoring bad drop entry {d!r}")

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


# --------------------------------------------------------------------------- jobs

def job_dir(ws, name):
    return os.path.join(ws_paths(ws)["jobs"], name)


def resolve_job(a):
    ws = find_ws(getattr(a, "ws", None))
    set_ws(ws)
    name = a.job
    jd = job_dir(ws, name)
    if not os.path.exists(os.path.join(jd, "job.json")):
        jobs = sorted(os.listdir(ws_paths(ws)["jobs"])) if os.path.isdir(ws_paths(ws)["jobs"]) else []
        if name == "latest" and jobs:
            name = max(jobs, key=lambda j: os.path.getmtime(os.path.join(ws_paths(ws)["jobs"], j)))
            jd = job_dir(ws, name)
        else:
            die(f"No job '{name}' in {ws}. Existing jobs: {', '.join(jobs) or 'none'}")
    return ws, jd


def find_media(ws, rel, kind, required=False):
    if not rel:
        return None
    for base in ("", ws, os.path.join(ws, kind), os.path.join(ws, "brand"), os.path.join(ws, "inbox"),
                 os.path.join(ws, "broll"), os.path.join(ws, "references")):
        p = os.path.join(base, rel) if base else rel
        if os.path.isfile(p):
            return os.path.abspath(p)
    if required:
        die(f"File not found: {rel}  (looked in {ws}/{kind})")
    warn(f"File not found: {rel} (put it in {kind}/) — that effect was skipped.")
    return None


def python_cmd():
    return os.path.basename(sys.executable) or "python3"

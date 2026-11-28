"""Shared helpers for building Vibe Editor edit plans: timing, text metrics, ASS tags, sound placement."""
import json
import os
import sys

WS = "/home/user/experiments/Vibe Editor"
ENGINE_DIR = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/scripts"
sys.path.insert(0, ENGINE_DIR)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vibe_engine import core  # noqa: E402

core.CUR["ws"] = WS
from vibe_engine.text import Ctx  # noqa: E402
from owords import owords  # noqa: E402

_CTX = Ctx(1080, 1920, {}, [], 10)
PEAKS = json.load(open(os.path.join(WS, "tools", "sfx_peaks.json")))
W, H = 1080, 1920


# --------------------------------------------------------------------- colour / text
def c(hexstr):
    h = hexstr.lstrip("#")
    return f"&H{h[4:6]}{h[2:4]}{h[0:2]}&".upper()


def a(alpha):
    return f"&H{int(alpha):02X}&"


def tw(text, font, size, fsp=0):
    """Rendered width (px) of text in a font at nominal size (+ letter spacing)."""
    return _CTX.text_w(text, font, size) + fsp * max(0, len(text) - 1) * _CTX.font(font).get("norm", 1.0)


def px(font, size):
    return _CTX.size_px(font, size)


def capshift(font, size):
    return _CTX.cap_shift(font, size)


def esc(t):
    return t.replace("{", "(").replace("}", ")")


# --------------------------------------------------------------------- words / chunks
class Words:
    def __init__(self, job, cuts=None):
        ws, self.dur, self.segs = owords(job, cuts=cuts)
        self.by = {w["i"]: w for w in ws}
        self.list = ws

    def s(self, i):
        return self.by[i]["start"]

    def e(self, i):
        return self.by[i]["end"]

    def t(self, i):
        return self.by[i]["text"]


# --------------------------------------------------------------------- plan
class Plan:
    def __init__(self, job, name, look="natural", music=None, music_vol=0.2, fmt="9:16", reframe=None):
        self.job = job
        self.w = Words(job)
        self.events = []
        self.name = name
        self.look = look
        self.music = music
        self.music_vol = music_vol
        self.fmt = fmt
        self.reframe = reframe or {"mode": "crop", "x": 0.5, "y": 0.5}
        self.captions = {"enabled": False}

    @property
    def dur(self):
        return self.w.dur

    def ev(self, **kw):
        self.events.append(kw)
        return kw

    def sfx(self, name, t_peak, vol=0.5):
        """Place a sound so its loudest moment lands on t_peak."""
        t0 = max(0.0, t_peak - PEAKS.get(name, 0.0))
        self.events.append({"type": "sfx", "at": round(t0, 3), "name": name + ".wav", "volume": vol})

    def ass(self, at, dur, layers, behind=False, box=None, **kw):
        if at < 0:  # events cannot start before 0: shift layers instead
            for ly in layers:
                ly["start"] = round(max(0.0, ly["start"] + at), 3)
                ly["end"] = round(ly["end"] + at, 3)
            dur, at = dur + at, 0.0
        e = {"type": "ass", "at": round(at, 3), "dur": round(dur, 3), "layers": layers}
        if behind:
            e["behind"] = True
        if box:
            e["box"] = box
        e.update(kw)
        self.events.append(e)
        return e

    def json(self):
        jd = os.path.join(WS, ".vibe", "jobs", self.job)
        base = json.load(open(os.path.join(jd, "edit.json")))
        audio = {"denoise": False, "loudness": -14}
        if self.music:
            audio["music"] = {"file": self.music, "volume": self.music_vol, "duck": True}
        return {"format": self.fmt, "reframe": self.reframe, "look": self.look, "cuts": base["cuts"],
                "captions": self.captions, "audio": audio, "auto_sfx": True, "events": self.events,
                "output": {"name": self.name}}

    def save(self, path=None):
        path = path or os.path.join(WS, "plans", self.name + ".json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        json.dump(self.json(), open(path, "w"), indent=1, ensure_ascii=False)
        return path


# --------------------------------------------------------------------- layer builders
def L(start, end, text, font="inter-extrabold", size=80, color="#FFFFFF", layer=8, bord=0, shad=0, outline="#000000"):
    return {"start": round(start, 3), "end": round(end, 3), "layer": layer, "font": font, "size": size,
            "color": color, "outline": outline, "bord": bord, "shad": shad, "text": text}


def S(start, end, text, color="#FFFFFF", layer=6):
    return {"start": round(start, 3), "end": round(end, 3), "layer": layer, "shape": True, "color": color, "text": text}


def ms(x):
    return int(round(x * 1000))


def fade_io(t_in, d_in, t_out, d_out=160):
    return f"\\alpha&HFF&\\t({ms(t_in)},{ms(t_in + d_in)},\\alpha&H00&)\\t({ms(t_out)},{ms(t_out + d_out)},\\alpha&HFF&)"


def rect(x, y, w, h):
    return f"m {x:.0f} {y:.0f} l {x + w:.0f} {y:.0f} {x + w:.0f} {y + h:.0f} {x:.0f} {y + h:.0f}"


def rrect(x, y, w, h, r):
    k = 0.5523 * r
    x1, y1 = x + w, y + h
    return (f"m {x + r:.0f} {y:.0f} l {x1 - r:.0f} {y:.0f} b {x1 - r + k:.0f} {y:.0f} {x1:.0f} {y + r - k:.0f} {x1:.0f} {y + r:.0f} "
            f"l {x1:.0f} {y1 - r:.0f} b {x1:.0f} {y1 - r + k:.0f} {x1 - r + k:.0f} {y1:.0f} {x1 - r:.0f} {y1:.0f} "
            f"l {x + r:.0f} {y1:.0f} b {x + r - k:.0f} {y1:.0f} {x:.0f} {y1 - r + k:.0f} {x:.0f} {y1 - r:.0f} "
            f"l {x:.0f} {y + r:.0f} b {x:.0f} {y + r - k:.0f} {x + r - k:.0f} {y:.0f} {x + r:.0f} {y:.0f}")


def circle(cx, cy, r):
    k = 0.5523 * r
    return (f"m {cx:.1f} {cy - r:.1f} b {cx + k:.1f} {cy - r:.1f} {cx + r:.1f} {cy - k:.1f} {cx + r:.1f} {cy:.1f} "
            f"b {cx + r:.1f} {cy + k:.1f} {cx + k:.1f} {cy + r:.1f} {cx:.1f} {cy + r:.1f} "
            f"b {cx - k:.1f} {cy + r:.1f} {cx - r:.1f} {cy + k:.1f} {cx - r:.1f} {cy:.1f} "
            f"b {cx - r:.1f} {cy - k:.1f} {cx - k:.1f} {cy - r:.1f} {cx:.1f} {cy - r:.1f}")


def ring(cx, cy, r, w):
    """Annulus (outer clockwise, inner counter-clockwise)."""
    ri = r - w
    k, ki = 0.5523 * r, 0.5523 * ri
    outer = circle(cx, cy, r)
    inner = (f"m {cx:.1f} {cy - ri:.1f} b {cx - ki:.1f} {cy - ri:.1f} {cx - ri:.1f} {cy - ki:.1f} {cx - ri:.1f} {cy:.1f} "
             f"b {cx - ri:.1f} {cy + ki:.1f} {cx - ki:.1f} {cy + ri:.1f} {cx:.1f} {cy + ri:.1f} "
             f"b {cx + ki:.1f} {cy + ri:.1f} {cx + ri:.1f} {cy + ki:.1f} {cx + ri:.1f} {cy:.1f} "
             f"b {cx + ri:.1f} {cy - ki:.1f} {cx + ki:.1f} {cy - ri:.1f} {cx:.1f} {cy - ri:.1f}")
    return outer + " " + inner


def outline_rect(x, y, w, h, t):
    """Rectangle frame of thickness t."""
    return (f"m {x:.0f} {y:.0f} l {x + w:.0f} {y:.0f} {x + w:.0f} {y + h:.0f} {x:.0f} {y + h:.0f} "
            f"m {x + t:.0f} {y + t:.0f} l {x + t:.0f} {y + h - t:.0f} {x + w - t:.0f} {y + h - t:.0f} {x + w - t:.0f} {y + t:.0f}")


def outline_rrect(x, y, w, h, r, t):
    k = 0.5523
    o = rrect(x, y, w, h, r)
    xi, yi, wi, hi, ri = x + t, y + t, w - 2 * t, h - 2 * t, max(1, r - t)
    x1, y1 = xi + wi, yi + hi
    kk = k * ri
    inner = (f"m {xi + ri:.0f} {yi:.0f} b {xi + ri - kk:.0f} {yi:.0f} {xi:.0f} {yi + ri - kk:.0f} {xi:.0f} {yi + ri:.0f} "
             f"l {xi:.0f} {y1 - ri:.0f} b {xi:.0f} {y1 - ri + kk:.0f} {xi + ri - kk:.0f} {y1:.0f} {xi + ri:.0f} {y1:.0f} "
             f"l {x1 - ri:.0f} {y1:.0f} b {x1 - ri + kk:.0f} {y1:.0f} {x1:.0f} {y1 - ri + kk:.0f} {x1:.0f} {y1 - ri:.0f} "
             f"l {x1:.0f} {yi + ri:.0f} b {x1:.0f} {yi + ri - kk:.0f} {x1 - ri + kk:.0f} {yi:.0f} {x1 - ri:.0f} {yi:.0f}")
    return o + " " + inner

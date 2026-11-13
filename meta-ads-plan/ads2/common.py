"""shared helpers for the 20-ad batch (ads2/)."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
import numpy as np, cv2
from PIL import Image, ImageDraw
import adkit2 as A2
from adkit2 import *  # noqa

R = A2.ROOT
OUT = os.path.join(R, "out2"); os.makedirs(OUT, exist_ok=True)
S = A2.STUDIO
D = lambda n: A2.A("drive", n)
ST = lambda i: A2.A("stock", f"{i}.mp4")
MU = lambda n: A2.A("music", n) if os.path.exists(A2.A("music", n)) else A2.MUSIC(n)
SF = lambda n: A2.A("sfx", n) if os.path.exists(A2.A("sfx", n)) else os.path.join(A2.TR, "sfx", n)
VO_DIR = os.path.join(R, "build", "vo2")
BEATS = json.load(open(A2.A("music", "beats.json")))


def VO(name, hl=(), offset=0.0):
    disp = json.load(open(os.path.join(VO_DIR, name + ".display.json")))
    return A2.vo_words(os.path.join(VO_DIR, name + ".json"), offset, disp, hl)


def vo_path(name): return os.path.join(VO_DIR, name + ".mp3")


def vo_len(name): return json.load(open(os.path.join(VO_DIR, name + ".json")))["character_end_times_seconds"][-1]


def C(src, t, fx=0.5, **kw):
    """segment factory: clip(src, t, dur, W, H, fx, ...)"""
    def make(dur, W=1080, H=1920): return A2.clip(src, t, dur, W, H, fx=fx, **kw)
    return make


def CW(src, t, fx=0.5, W=1080, H=1350, **kw):
    def make(dur): return A2.clip(src, t, dur, W, H, fx=fx, **kw)
    return make


def seq(t0, items, fx_default="punch"):
    """items: (dur, make[, fx[, post]]) -> list of Seg laid end to end from t0"""
    segs = []; t = t0
    for it in items:
        dur, make = it[0], it[1]; fx = it[2] if len(it) > 2 else fx_default; post = it[3] if len(it) > 3 else None
        segs.append(A2.Seg(t, t + dur, make, fx, post)); t += dur
    return segs, t


def cap_ov(caps, until, scrim_b=0.42, strength=0.5, badge="white", badge_y=110, cap_until=None):
    """overlay: bottom scrim + captions + top badge, active until `until` (end card start)"""
    def f(frame, t):
        if t >= until: return frame
        if scrim_b: frame = A2.scrim(frame, top=0.16, bottom=scrim_b, strength=strength)
        if badge: frame = A2.put_badge(frame, badge, badge_y, 56)
        if caps is not None and t < (cap_until or until): frame = A2.over(frame, caps.layer(t))
        return frame
    return f


def end_seg(t0, dur, fn):
    def make(d):
        for i in range(int(round(d * FPS))): yield fn(i / FPS)
    return A2.Seg(t0, t0 + dur, make, "flash")


def beat_grid(track, offset=0.0):
    return [b - offset for b in BEATS[track]["beats"] if b - offset >= 0]


def sheet(path, n=16):
    import subprocess
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)
    A2.contact_sheet(path, path.replace(".mp4", "_sheet.jpg"), [dur * (i + 0.5) / n for i in range(n)], 240)


# safe scroll ranges on the course page capture (mobile, page px). Skips the 'Ads, reimagined' gallery (real client brands)
SAFE_SCROLL = [(0, 2300), (6140, 8400), (15605, 17600), (17657, 19800), (19987, 22400), (22600, 26700), (29260, 31800)]


def phone_scroll(ranges, bg_src=None, bg_t=3.0, scale=0.70, cy=0.42, W=1080, H=1920, bg=None):
    """segment factory: phone mockup scrolling through page ranges [(y0,y1),...] split evenly over the duration"""
    def make(dur):
        b = bg if bg is not None else (cv2.GaussianBlur(frame_at(bg_src, bg_t, W, H), (0, 0), 18) * 0.5).astype(np.uint8)
        n = int(round(dur * FPS)); per = n / len(ranges)
        for i in range(n):
            k = min(len(ranges) - 1, int(i / per)); p = (i - k * per) / max(1, per - 1); y0, y1 = ranges[k]
            yield phone_frame(W, H, y0 + (y1 - y0) * (0.5 - 0.5 * np.cos(np.pi * min(1, p))), b, scale=scale, cy=cy)
    return make


# ------------------------------------------------------------------ more segment factories
def grid(tiles, W=1080, H=1920, cols=2, rows=2, gap=10, bg=(10, 10, 10), stagger=0.0):
    """tiles: [(src, t, fx)] -> streaming grid of clips"""
    def make(dur):
        tw, th = (W - gap * (cols - 1)) // cols, (H - gap * (rows - 1)) // rows
        gens = [A2.clip(s, t, dur, tw, th, fx=fx, z=(1.0, 1.08)) for s, t, fx in tiles]
        n = int(round(dur * FPS))
        for i in range(n):
            f = np.empty((H, W, 3), np.uint8); f[:] = bg
            for k, g in enumerate(gens):
                r, c = divmod(k, cols); fr = next(g)
                if i / FPS + 1e-6 < k * stagger: continue
                f[r * (th + gap):r * (th + gap) + th, c * (tw + gap):c * (tw + gap) + tw] = fr
            yield f
    return make


def polaroid(src, t, fx=0.5, label="product_photo.jpg", W=1080, H=1920, bg_col=(236, 233, 224), tilt=-4):
    """a plain 'product photo' on a desk-like background, as a still segment with a slow push"""
    def make(dur):
        ph = frame_at(src, t, 640, 760, fx); card = Image.new("RGBA", (700, 900), (255, 255, 255, 255))
        card.paste(Image.fromarray(ph), (30, 30)); d = ImageDraw.Draw(card)
        d.text((36, 812), label, font=F("JetBrainsMono", 34, 600), fill=(90, 90, 90, 255))
        card = card.rotate(tilt, expand=True, resample=Image.BICUBIC)
        base = K.paper(W, H) if bg_col is None else Image.new("RGB", (W, H), bg_col)
        base = base.convert("RGBA"); sh = shadow_of(card, 26, 0.45, (0, 0))
        x, y = (W - card.width) // 2, (H - card.height) // 2 - 160
        base.alpha_composite(sh, (x + 10, y + 26)); base.alpha_composite(card, (x, y))
        yield from A2.still(np.asarray(base.convert("RGB")), dur, (1.0, 1.06))
    return make


def screen_blend(make_a, src_b, t_b, amt=0.75, W=1080, H=1920, warm=0.08):
    """festive look: screen-blend a bokeh/candle clip over another segment"""
    def make(dur):
        ga = make_a(dur); gb = A2.clip(src_b, t_b, dur, W, H, z=(1.1, 1.0))
        for a, b in zip(ga, gb):
            a = (a.astype(np.float32) / 255) ** 1.25 * 0.8; b = ((b.astype(np.float32) / 255) ** 1.6) * amt   # darken base, keep only bright bokeh
            o = 1 - (1 - a) * (1 - b); o[..., 0] *= 1 + warm; o[..., 2] *= 1 - warm
            yield np.clip(o * 255, 0, 255).astype(np.uint8)
    return make


def notif(title, body, app="Brief · now", W=1080):
    """iOS-style notification card RGBA"""
    w, h = W - 100, 210; im = Image.new("RGBA", (w + 20, h + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w, h], 42, fill=(245, 245, 247, 242))
    d.rounded_rectangle([34, 40, 110, 116], 20, fill=INK + (255,)); im.alpha_composite(logo_img("white", 44), (52, 56))
    d.text((136, 38), app.upper(), font=F("Inter", 26, 600), fill=(120, 120, 125, 255))
    d.text((136, 76), title, font=F("Inter", 40, 700), fill=INK + (255,))
    d.text((136, 128), body, font=F("Inter", 34, 450), fill=(60, 60, 64, 255))
    return im


def same_wall(src, t, W=1080, H=1920, n=4):
    """'every AI ad looks the same' wall: a grid of near-identical desaturated tiles"""
    def make(dur):
        tw, th = W // 3, H // n; base = frame_at(src, t, tw, th)
        g = base.mean(axis=2, keepdims=True); base = (g * 0.75 + base * 0.25).astype(np.uint8)
        wall = np.zeros((H, W, 3), np.uint8)
        for r in range(n):
            for c in range(3):
                wall[r * th:(r + 1) * th, c * tw:(c + 1) * tw] = base
        wall = cv2.addWeighted(wall, 0.85, np.zeros_like(wall), 0, 0)
        for i in range(int(round(dur * FPS))): yield zoom_frame(wall, 1.0 + 0.04 * i / max(1, dur * FPS), 0.5, 0.5)
    return make


def wt_of(words):
    def wt(word, after=0.0):
        return next(w["s"] for w in words if w["w"].lower().strip(".,!?") == word.lower() and w["s"] >= after - 1e-6)
    return wt

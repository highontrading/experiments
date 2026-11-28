"""2.5D compositor for the Vibe Editor ads: Blender plates + our edits playing on CRT screens + camera moves,
type and film finish. Plates come from ads/blender/<scene>/plate (beauty, screens.json, ids.png)."""
import json
import math
import os
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ADS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WS = os.path.dirname(ADS)
OUT = os.path.join(WS, "output")
FPS = 30
W, H = 1080, 1920
LIBF = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/library/fonts/"
FONTS = {
    "display": os.path.join(WS, "fonts", "VE-Inter-Display-Bold.ttf"),
    "display_xb": os.path.join(WS, "fonts", "VE-Inter-Display-ExtraBold.ttf"),
    "grotesk": os.path.join(WS, "fonts", "VE-Grotesk-Black.ttf"),
    "serif_i": LIBF + "InstrumentSerif-Italic.ttf",
    "mono": LIBF + "VT323-Regular.ttf",
    "inter": os.path.join(WS, "fonts", "VE-Inter-Medium.ttf"),
}
EDITS = {
    "kinetic": "style1-kinetic-en.mp4", "editorial": "style2-editorial-en.mp4", "split": "style3-split-en.mp4",
    "neon": "style4-neon-en.mp4", "docu": "style5-docu-en.mp4", "optimized": "optimized-en.mp4",
    "kinetic_hi": "style1-kinetic-hi.mp4", "editorial_hi": "style2-editorial-hi.mp4", "split_hi": "style3-split-hi.mp4",
    "neon_hi": "style4-neon-hi.mp4", "docu_hi": "style5-docu-hi.mp4", "optimized_hi": "optimized-hi.mp4",
}
RAW = os.path.join(WS, "inbox", "raw-a.mp4")


def edit_path(key):
    return RAW if key == "raw" else os.path.join(OUT, EDITS[key])


def font(key, size):
    return ImageFont.truetype(FONTS.get(key, key), int(size))


# ------------------------------------------------------------------ plates
class Plate:
    def __init__(self, scene, beauty="beauty_0001.png"):
        d = os.path.join(ADS, "blender", scene, "plate")
        img = cv2.imread(os.path.join(d, beauty), cv2.IMREAD_UNCHANGED)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB if img.shape[2] == 3 else cv2.COLOR_BGRA2RGBA)
        self.img = np.ascontiguousarray(img[..., :3]).astype(np.float32) / (65535.0 if img.dtype == np.uint16 else 255.0)
        self.h, self.w = self.img.shape[:2]
        meta = json.load(open(os.path.join(d, "screens.json")))
        ids = json.load(open(os.path.join(d, "ids_ids.json")))
        idimg = np.asarray(Image.open(os.path.join(d, "ids.png")).convert("RGB")).astype(np.int16)
        self.screens = {}
        for name, s in meta["screens"].items():
            if name not in ids:
                continue
            col = np.array(ids[name], np.int16)
            m = (np.abs(idimg - col).sum(axis=2) <= 6).astype(np.float32)
            if m.sum() < 20:
                continue
            m = cv2.GaussianBlur(m, (3, 3), 0.8)
            ys, xs = np.nonzero(m > 0.02)
            box = (max(0, xs.min() - 2), max(0, ys.min() - 2), min(self.w, xs.max() + 3), min(self.h, ys.max() + 3))
            x0, y0, x1, y1 = box
            self.screens[name] = dict(corners=np.array(s["corners"], np.float32), mask=m[y0:y1, x0:x1], box=box, on=s["on"],
                                      center=s["center"], area=float(m.sum()))


# ------------------------------------------------------------------ video sources
def _fit_filter(w, h, fit, focus=0.4):
    if fit == "pillar":
        return (f"split[a][b];[a]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},boxblur=20:2,"
                f"eq=brightness=-0.12:saturation=0.8[bg];[b]scale={w}:{h}:force_original_aspect_ratio=decrease[fg];"
                f"[bg][fg]overlay=(W-w)/2:(H-h)/2")
    return f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}:(iw-{w})/2:(ih-{h})*{focus}"


class Clip:
    """A source decoded once into memory at a fixed size; frames looked up by time (loops)."""
    _cache = {}

    def __init__(self, key, w, h, fit="crop", focus=0.4, start=0.0, dur=None):
        ck = (key, w, h, fit, focus, start, dur)
        if ck not in Clip._cache:
            cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}"] + (["-t", f"{dur:.3f}"] if dur else []) + \
                  ["-i", edit_path(key), "-vf", f"fps={FPS}," + _fit_filter(w, h, fit, focus), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
            raw = subprocess.run(cmd, capture_output=True, check=True).stdout
            n = len(raw) // (w * h * 3)
            Clip._cache[ck] = np.frombuffer(raw, np.uint8)[: n * w * h * 3].reshape(n, h, w, 3)
        self.frames = Clip._cache[ck]
        self.n = len(self.frames)

    def at(self, t, loop=True):
        k = int(round(t * FPS))
        k = k % self.n if loop else min(max(k, 0), self.n - 1)
        return self.frames[k]


# ------------------------------------------------------------------ CRT look + placement
_SCAN = {}


def crt(frame, gain=1.0, scan=0.16, blur=0.6, tint=(0.97, 1.0, 1.05)):
    """CRT treatment on an RGB uint8 frame -> float32 0..1."""
    f = frame.astype(np.float32) / 255.0
    if blur:
        f = cv2.GaussianBlur(f, (0, 0), blur)
    h, w = f.shape[:2]
    key = (h, w, scan)
    if key not in _SCAN:
        rows = np.ones((h, 1, 1), np.float32)
        period = max(2, int(round(h / 160)))
        rows[::period] = 1 - scan
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        vig = 1 - 0.38 * (((xx - w / 2) / (w / 2)) ** 2 * 0.7 + ((yy - h / 2) / (h / 2)) ** 2 * 0.7)
        _SCAN[key] = rows * np.clip(vig, 0.45, 1)[..., None]
    f = f * _SCAN[key] * np.array(tint, np.float32) * gain
    # slight RGB convergence error
    f[..., 0] = np.roll(f[..., 0], 1, axis=1)
    f[..., 2] = np.roll(f[..., 2], -1, axis=1)
    return np.clip(f, 0, 1.2)


def place(canvas, scr, img, reflect=0.22, glow=None):
    """Warp img (float RGB) onto the screen quad of the plate canvas (float RGB, same space as plate)."""
    x0, y0, x1, y1 = scr["box"]
    h, w = img.shape[:2]
    src = np.array([[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]], np.float32)
    dst = scr["corners"] - np.array([x0, y0], np.float32)
    M = cv2.getPerspectiveTransform(src, dst)
    warped = cv2.warpPerspective(img, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    m = scr["mask"][..., None]
    base = canvas[y0:y1, x0:x1]
    # keep the glass reflections of the plate (highlights above the screen's own glow level)
    spec = np.clip(base - 0.55, 0, 1) * reflect
    canvas[y0:y1, x0:x1] = base * (1 - m) + (warped + spec) * m
    if glow is not None:
        glow[y0:y1, x0:x1] += warped * m


def static_noise(h, w, seed):
    rng = np.random.default_rng(seed)
    n = rng.random((h // 2 + 1, w // 2 + 1), dtype=np.float32)
    n = cv2.resize(n, (w, h), interpolation=cv2.INTER_NEAREST)
    bands = (np.sin(np.linspace(0, 6 * math.pi, h) + seed) * 0.15 + 0.85)[:, None]
    return np.repeat((n * bands)[..., None], 3, axis=2) * 0.9


# ------------------------------------------------------------------ camera, finish, output
def camera(canvas, zoom=1.0, cx=0.5, cy=0.5, rot=0.0):
    """Crop a 9:16 window out of the plate canvas (zoom 1 = full plate width) and resize to 1080x1920."""
    ph, pw = canvas.shape[:2]
    cw = pw / zoom
    ch = cw * 16 / 9
    if ch > ph:
        ch = ph / zoom
        cw = ch * 9 / 16
    x = min(max(cx * pw - cw / 2, 0), pw - cw)
    y = min(max(cy * ph - ch / 2, 0), ph - ch)
    M = np.array([[W / cw, 0, -x * W / cw], [0, H / ch, -y * H / ch]], np.float32)
    if rot:
        R = cv2.getRotationMatrix2D((W / 2, H / 2), rot, 1.0)
        M = R @ np.vstack([M, [0, 0, 1]])
    return cv2.warpAffine(canvas, M, (W, H), flags=cv2.INTER_AREA if zoom < 1.2 else cv2.INTER_LINEAR)


_GRAIN = {}


def finish(img, t, grain=0.035, vignette=0.22, bloom=0.0, glowimg=None):
    out = img
    if glowimg is not None and bloom > 0:
        g = cv2.GaussianBlur(glowimg, (0, 0), 28)
        out = out + g * bloom
    if vignette:
        if "v" not in _GRAIN:
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            _GRAIN["v"] = (1 - vignette * (((xx - W / 2) / (W / 2)) ** 2 * 0.6 + ((yy - H / 2) / (H / 2)) ** 2 * 0.6))[..., None]
        out = out * _GRAIN["v"]
    if grain:
        k = int(t * FPS) % 24
        if k not in _GRAIN:
            rng = np.random.default_rng(k)
            gr = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
            _GRAIN[k] = cv2.resize(gr, (W, H))[..., None]
        out = out + _GRAIN[k] * grain
    return np.clip(out, 0, 1)


class Writer:
    def __init__(self, path, fps=FPS):
        self.path = path
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                                   "-r", str(fps), "-i", "-", "-c:v", "libx264", "-crf", "15", "-preset", "medium",
                                   "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)

    def write(self, img):
        self.p.stdin.write((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())

    def close(self):
        self.p.stdin.close()
        self.p.wait()


# ------------------------------------------------------------------ type
def text_layer(draw_fn, size=(W, H)):
    """Render a PIL drawing into a float RGBA layer."""
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(im), im)
    return np.asarray(im).astype(np.float32) / 255.0


def over(img, layer, alpha=1.0, dx=0, dy=0):
    """Alpha-composite an RGBA float layer over an RGB float image."""
    if alpha <= 0:
        return img
    if dx or dy:
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        layer = cv2.warpAffine(layer, M, (layer.shape[1], layer.shape[0]))
    a = layer[..., 3:4] * alpha
    return img * (1 - a) + layer[..., :3] * a


def justify(draw, text, x0, x1, y, f, fill):
    """Justified single line (spaces stretched), like the reference poster's caption."""
    words = text.split()
    if len(words) == 1:
        draw.text(((x0 + x1) / 2, y), text, font=f, fill=fill, anchor="mm")
        return
    widths = [draw.textlength(w_, font=f) for w_ in words]
    gap = (x1 - x0 - sum(widths)) / (len(words) - 1)
    x = x0
    for w_, ww in zip(words, widths):
        draw.text((x, y), w_, font=f, fill=fill, anchor="lm")
        x += ww + gap


def ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def vo_words(name):
    """Word timings from the ElevenLabs alignment json."""
    import re
    a = json.load(open(os.path.join(ADS, "audio", f"vo-{name}.json")))
    text = "".join(a["characters"])
    st, en = a["character_start_times_seconds"], a["character_end_times_seconds"]
    return [(m.group(), st[m.start()], en[m.end() - 1]) for m in re.finditer(r"\S+", text)]

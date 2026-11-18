import numpy as np, cv2, subprocess, sys, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WORK = sys.argv[1]
OUT = sys.argv[2]
SCALE = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0   # 0.5 for preview
SRC = f"{WORK}/src.mp4"
FPS = 30
W, H = int(1920 * SCALE) // 2 * 2, int(1080 * SCALE) // 2 * 2
TOTAL = 15.0
NF = int(TOTAL * FPS)
rng = np.random.default_rng(7)
random.seed(7)
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf"
FONT2 = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"

# ---------------------------------------------------------------- timeline
DROP = 7.024
LOGO = 12.643
segs = []
def seg(t0, t1, src, span=None, speed=1.0, ease="lin", z0=1.06, z1=1.14, fx=(), **kw):
    if span is None:
        span = (t1 - t0) * speed
    segs.append(dict(t0=t0, t1=t1, src=src, span=span, ease=ease, z0=z0, z1=z1, fx=set(fx), **kw))

# intro (cinematic but punchy, cuts on every beat)
seg(0.000, 0.952, 6.30, speed=0.85, z0=1.04, z1=1.30, fx=("fadein",))
seg(0.952, 1.440, 8.30, z0=1.18, z1=1.06, fx=("whip",))
seg(1.440, 1.881, 11.70, speed=1.2)
seg(1.881, 2.380, 19.00, z0=1.20, z1=1.08, fx=("whip",))
seg(2.380, 2.821, 28.00, speed=1.3)
seg(2.821, 3.309, 35.20, speed=2.2, ease="ramp", fx=("whip", "glitch_in"))
seg(3.309, 3.762, 38.60, z0=1.05, z1=1.22)
seg(3.762, 4.249, 46.00, speed=2.0, fx=("whip",))
seg(4.249, 4.690, 50.00, z0=1.25, z1=1.08)
seg(4.690, 5.166, 63.30, fx=("glitch_in",))
seg(5.166, 5.631, 74.95, speed=1.4, fx=("whip",))
seg(5.631, 6.107, 83.30, speed=1.5, z0=1.05, z1=1.25)
seg(6.107, 6.571, 85.20, z0=1.10, z1=1.35, fx=("glitch_in",))
# build-up strobe: 2-frame micro cuts
st = 6.571
for s in [104.2, 118.3, 101.0, 75.2, 128.3, 140.4]:
    seg(st, st + 2 / FPS, s, speed=1.0, z0=1.25, z1=1.35, fx=("strobe",))
    st += 2 / FPS
segs.append(dict(t0=st, t1=DROP, black=True, fx=set()))

# DROP: half-beat cuts
drop = [
    (7.024, 7.488, 118.00, dict(span=0.78, ease="ramp", z0=1.30, z1=1.05, fx=("zoomblur",))),
    (7.488, 7.721, 140.20, dict(speed=1.5, fx=("whip",))),
    (7.721, 7.953, 142.00, dict()),
    (7.953, 8.185, 147.40, dict(speed=1.5, fx=("whip",))),
    (8.185, 8.417, 148.30, dict(speed=1.5)),
    (8.417, 8.661, 121.00, dict(speed=1.5, fx=("glitch_in",))),
    (8.661, 8.893, 101.00, dict()),
    (8.893, 9.125, 138.30, dict(fx=("whip",))),
    (9.125, 9.358, None, dict(tri=[140.6, 142.4, 147.6])),
    (9.358, 9.601, 125.90, dict(fx=("whip",))),
    (9.601, 9.834, 106.15, dict(fx=("glitch_in",))),
    (9.834, 10.066, 144.60, dict(speed=1.5, fx=("whip",))),
    (10.066, 10.298, 149.50, dict(speed=0.5, z0=1.05, z1=1.15)),
    (10.298, 10.530, 111.40, dict(z0=1.30, z1=1.10, fx=("zoomblur",))),
    (10.530, 10.762, 112.80, dict(fx=("whip",))),
    (10.762, 10.995, 115.00, dict()),
    (10.995, 11.238, 118.90, dict(fx=("whip",))),
    (11.238, 11.471, 119.70, dict(speed=1.6, z0=1.35, z1=1.08, fx=("zoomblur",))),
    (11.471, 11.703, 94.40, dict(fx=("whip",))),
    (11.703, 11.935, 139.20, dict(speed=1.5, fx=("glitch_in",))),
    (11.935, 12.167, 108.00, dict(fx=("whip",))),
    (12.167, 12.411, 103.20, dict(z0=1.08, z1=1.25)),
    (12.411, LOGO, 128.00, dict(speed=2.0, fx=("glitch_in", "strobewhite"))),
]
for t0, t1, s, kw in drop:
    if "tri" in kw:
        segs.append(dict(t0=t0, t1=t1, tri=kw["tri"], span=(t1 - t0), ease="lin", z0=1.1, z1=1.2, fx=set(), src=None))
    else:
        seg(t0, t1, s, **kw)
# logo end card
seg(LOGO, TOTAL, 153.00, speed=0.45, z0=1.10, z1=1.28, fx=("logo",))

# ---------------------------------------------------------------- events
beats_intro = [0.035, 0.499, 0.952, 1.44, 1.881, 2.38, 2.821, 3.309, 3.762, 4.249, 4.69, 5.166, 5.631, 6.107, 6.571]
halfs = [7.024, 7.256, 7.488, 7.721, 7.953, 8.185, 8.417, 8.661, 8.893, 9.125, 9.358, 9.601, 9.834, 10.066,
         10.298, 10.53, 10.762, 10.995, 11.238, 11.471, 11.703, 11.935, 12.167, 12.411, 12.643, 12.875, 13.108]
kicks = [7.024, 7.488, 7.953, 8.417, 8.893, 9.358, 9.834, 10.298, 10.774, 11.238, 11.703, 12.167, 12.643, 13.108]
big = {7.024: 1.6, 10.298: 1.1, 11.238: 1.3, 12.643: 1.8, 13.108: 0.8, 8.893: 0.7, 9.358: 0.6, 9.834: 0.6, 7.488: 0.6}

punch = [(t, 0.55) for t in beats_intro] + [(t, 1.0) for t in kicks] + [(t, 0.45) for t in halfs if t not in kicks]
shake = [(t, 0.25) for t in beats_intro[2:]] + [(t, 0.8) for t in kicks] + [(t, s) for t, s in big.items()]
rgb = [(t, 0.35) for t in beats_intro] + [(t, 0.6) for t in halfs] + [(t, s) for t, s in big.items()]
flash = [(t, 0.35, (1, 1, 1)) for t in beats_intro[2::2]] + \
        [(t, min(1.0, s), (1, 1, 1)) for t, s in big.items()] + \
        [(t, 0.45, (0.6, 0.35, 1.0)) for t in [7.721, 8.661, 9.601, 10.53, 11.471]] + \
        [(t, 0.45, (0.3, 0.6, 1.0)) for t in [8.185, 9.125, 10.066, 10.995, 11.935]]
invert_frames = set(int(round(t * FPS)) for t in [7.488, 8.893, 9.834, 11.703]) | {int(round(10.298 * FPS)) + 1}

def env(t, evs, tau):
    v = 0.0
    for te, s, *_ in evs:
        d = t - te
        if 0 <= d < tau * 6:
            v += s * math.exp(-d / tau)
    return v

def flash_env(t):
    c = np.zeros(3)
    for te, s, col in flash:
        d = t - te
        if 0 <= d < 0.3:
            c += s * math.exp(-d / 0.055) * np.array(col)[::-1]  # BGR
    return np.clip(c, 0, 1.2)

# text overlays: (t0, t1, text, size, kind)
texts = [
    (0.20, 0.952, "A NEW STORY BEGINS", 64, "subtle"),
    (1.440, 1.881, "NO RULES", 210, "slam"),
    (2.380, 2.821, "NO LIMITS", 210, "slam"),
    (3.309, 3.762, "ONE STATE", 210, "slam"),
    (4.249, 4.690, "ZERO MERCY", 200, "slam"),
    (5.166, 5.631, "ALL GAS", 230, "slam"),
    (6.107, 6.571, "GET READY", 240, "slam"),
    (10.298, 10.298 + 5 / FPS, "GTS", 420, "flash"),
    (11.238, 11.238 + 5 / FPS, "X", 700, "flash"),
]

# ---------------------------------------------------------------- assets
def text_rgba(txt, size, fill=(255, 255, 255), glow=(255, 60, 160), tracking=0.02, font=FONT, stroke=0):
    f = ImageFont.truetype(font, int(size))
    tw = sum(f.getlength(c) for c in txt) + tracking * size * (len(txt) - 1)
    pad = int(size * 0.6)
    w, h = int(tw + pad * 2), int(size * 1.4 + pad * 2)
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    x = pad
    for c in txt:
        d.text((x, pad), c, font=f, fill=255, stroke_width=stroke, stroke_fill=255)
        x += f.getlength(c) + tracking * size
    m = np.asarray(mask).astype(np.float32) / 255
    g1 = np.asarray(mask.filter(ImageFilter.GaussianBlur(size * 0.12))).astype(np.float32) / 255
    g2 = np.asarray(mask.filter(ImageFilter.GaussianBlur(size * 0.35))).astype(np.float32) / 255
    glowa = np.clip(g1 * 1.2 + g2 * 0.9, 0, 1)
    rgb = np.zeros((h, w, 3), np.float32)
    gcol = np.array(glow[::-1], np.float32) / 255
    fcol = np.array(fill[::-1], np.float32) / 255
    # premultiplied composite of glow under fill
    rgb = glowa[..., None] * gcol * (1 - m[..., None]) + m[..., None] * fcol
    a = np.clip(glowa * (1 - m) + m, 0, 1)
    ys, xs = np.where(a > 0.01)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return rgb[y0:y1, x0:x1], a[y0:y1, x0:x1]

def logo_rgba(scale):
    """Original 'GTS X' mark: gradient italic GTS + giant chrome X with neon glow."""
    S = scale
    W0, H0 = int(1800 * S), int(900 * S)
    fG = ImageFont.truetype(FONT, int(300 * S))
    fX = ImageFont.truetype(FONT, int(620 * S))
    mG = Image.new("L", (W0, H0), 0); dG = ImageDraw.Draw(mG)
    mX = Image.new("L", (W0, H0), 0); dX = ImageDraw.Draw(mX)
    gx, gy = int(170 * S), int(250 * S)
    x = gx
    for c in "GTS":
        dG.text((x, gy), c, font=fG, fill=255)
        x += fG.getlength(c) - 12 * S
    dX.text((x + int(10 * S), int(20 * S)), "X", font=fX, fill=255)
    stroke_G = mG.filter(ImageFilter.MaxFilter(int(15 * S) | 1))
    stroke_X = mX.filter(ImageFilter.MaxFilter(int(17 * S) | 1))
    mg = np.asarray(mG).astype(np.float32) / 255
    mx = np.asarray(mX).astype(np.float32) / 255
    sg = np.asarray(stroke_G).astype(np.float32) / 255
    sx = np.asarray(stroke_X).astype(np.float32) / 255
    yy = np.linspace(0, 1, H0)[:, None]
    xx = np.linspace(0, 1, W0)[None, :]
    # sunset gradient for GTS (BGR)
    top = np.array([150, 40, 255]); mid = np.array([60, 120, 255]); bot = np.array([40, 220, 255])
    tt = np.clip((yy - 0.28) / 0.38, 0, 1)
    gradG = np.where(tt[..., None] < 0.5, top + (mid - top) * (tt[..., None] * 2), mid + (bot - mid) * ((tt[..., None] - 0.5) * 2))
    gradG = np.broadcast_to(gradG, (H0, W0, 3)) / 255
    # chrome X: banded metallic
    band = 0.55 + 0.45 * np.cos((yy * 9 + xx * 2.5) * math.pi)
    chrome = np.stack([band * 1.0, band * 0.95, band * 0.92], -1)
    chrome = np.clip(chrome + (yy < 0.48)[..., None] * 0.25, 0, 1)
    chrome = np.broadcast_to(chrome, (H0, W0, 3))
    allm = np.maximum(sg, sx)
    glow1 = cv2.GaussianBlur(allm, (0, 0), 25 * S)
    glow2 = cv2.GaussianBlur(allm, (0, 0), 70 * S)
    glowcol = np.zeros((H0, W0, 3), np.float32)
    glowcol += glow1[..., None] * np.array([255, 60, 255]) / 255 * 1.1
    glowcol += glow2[..., None] * np.array([255, 170, 40]) / 255 * 0.9
    ga = np.clip(glow1 * 1.1 + glow2 * 0.8, 0, 1)
    rgb = glowcol.copy()
    a = ga.copy()
    # X layer (behind): dark stroke then chrome fill
    dark = np.array([40, 10, 30]) / 255
    for strokem, fillm, fillc in [(sx, mx, chrome), (sg, mg, gradG)]:
        rgb = rgb * (1 - strokem[..., None]) + strokem[..., None] * dark
        a = np.maximum(a, strokem)
        rgb = rgb * (1 - fillm[..., None]) + fillm[..., None] * fillc
    ys, xs = np.where(a > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return rgb[y0:y1, x0:x1].astype(np.float32), a[y0:y1, x0:x1].astype(np.float32)

print("building assets", flush=True)
TXT = {}
for t0, t1, s, size, kind in texts:
    if kind == "subtle":
        TXT[s] = text_rgba(s, size * SCALE, glow=(255, 150, 60), tracking=0.35, font=FONT2)
    elif kind == "flash":
        TXT[s] = text_rgba(s, size * SCALE, fill=(255, 255, 255), glow=(255, 40, 200))
    else:
        TXT[s] = text_rgba(s, size * SCALE, glow=(255, 40, 150))
LOGO_RGB, LOGO_A = logo_rgba(SCALE)
TAG = text_rgba("COMING SOON", 60 * SCALE, fill=(255, 255, 255), glow=(255, 120, 40), tracking=0.45, font=FONT2)

def comp(frame, rgb, a, cx, cy, scale=1.0, alpha=1.0):
    if scale != 1.0:
        nw, nh = max(2, int(rgb.shape[1] * scale)), max(2, int(rgb.shape[0] * scale))
        rgb = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_LINEAR)
        a = cv2.resize(a, (nw, nh), interpolation=cv2.INTER_LINEAR)
    h, w = a.shape
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    fx0, fy0 = max(0, x0), max(0, y0)
    fx1, fy1 = min(W, x0 + w), min(H, y0 + h)
    if fx1 <= fx0 or fy1 <= fy0:
        return
    sub_rgb = rgb[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0]
    sub_a = a[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0][..., None] * alpha
    region = frame[fy0:fy1, fx0:fx1]
    # glow is additive-ish (screen), fill is over
    frame[fy0:fy1, fx0:fx1] = region * (1 - sub_a) + sub_rgb * alpha + region * sub_a * 0.0

# vignette, grain, leak
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VIG = np.clip(1 - 0.55 * np.clip(r - 0.45, 0, 1) ** 1.6, 0, 1)[..., None].astype(np.float32)
GRAIN = [cv2.resize(rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32), (W, H)) for _ in range(8)]
leak = np.zeros((H, W * 2, 3), np.float32)
for _ in range(7):
    cx, cy = rng.uniform(0, W * 2), rng.uniform(-H * 0.2, H * 1.2)
    rad = rng.uniform(H * 0.3, H * 0.8)
    col = [np.array([40, 120, 255]), np.array([160, 40, 255]), np.array([30, 200, 255])][rng.integers(0, 3)] / 255
    m = np.exp(-(((np.mgrid[0:H, 0:W * 2][1] - cx) ** 2 + (np.mgrid[0:H, 0:W * 2][0] - cy) ** 2) / (2 * rad ** 2)))
    leak += m[..., None].astype(np.float32) * col
leak = np.clip(leak, 0, 1)
leak_events = [(0.952, 0.8), (2.821, 0.8), (4.69, 0.8), (6.107, 0.9), (7.024, 1.0), (9.125, 0.7), (10.298, 0.8), (11.238, 0.9), (12.643, 1.0)]

# grade LUT (teal-orange, punchy contrast)
x = np.arange(256) / 255.0
sc = x + 0.35 * (0.5 - 0.5 * np.cos(np.pi * x) - x) * 2
sc = np.clip(sc, 0, 1)
lut_b = np.clip(sc * 0.95 + 0.07 * (1 - x) ** 2, 0, 1)
lut_g = np.clip(sc * 1.0, 0, 1)
lut_r = np.clip(sc * 1.04 + 0.03 * x, 0, 1)
LUT = np.stack([lut_b, lut_g, lut_r], -1)[:, None, :]
LUT = (LUT * 255).astype(np.uint8).reshape(256, 1, 3)

def grade(img8, sat=1.35):
    img8 = cv2.LUT(img8, LUT)
    hsv = cv2.cvtColor(img8, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255)
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

# ---------------------------------------------------------------- source loading
cache = {}
def load_clip(src, dur):
    key = (round(src, 3), round(dur, 3))
    if key in cache:
        return cache[key]
    cmd = ["ffmpeg", "-loglevel", "error", "-ss", f"{src:.3f}", "-i", SRC, "-t", f"{dur + 0.15:.3f}",
           "-vf", f"scale={W}:{H}:flags=lanczos,fps={FPS}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    arr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    if len(cache) > 6:
        cache.pop(next(iter(cache)))
    cache[key] = arr
    return arr

def ease(u, kind):
    if kind == "ramp":   # slow start, explode at end
        return u ** 2.4
    if kind == "out":
        return 1 - (1 - u) ** 2
    return u

def get_src_frame(sg, t):
    u = (t - sg["t0"]) / (sg["t1"] - sg["t0"])
    off = sg["span"] * ease(min(max(u, 0), 1), sg["ease"])
    clip = load_clip(sg["src"], sg["span"])
    i = min(int(round(off * FPS)), len(clip) - 1)
    return clip[i], u

def transform(img, zoom, dx, dy, rot):
    M = cv2.getRotationMatrix2D((W / 2, H / 2), rot, zoom)
    M[0, 2] += dx; M[1, 2] += dy
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def zoom_blur(img, amt):
    acc = img.astype(np.float32)
    n = 5
    for k in range(1, n):
        z = 1 + amt * 0.035 * k
        acc += transform(img, z, 0, 0, 0).astype(np.float32)
    return np.clip(acc / n, 0, 255).astype(np.uint8)

def motion_blur_h(img, length):
    length = int(length) | 1
    if length < 3:
        return img
    k = np.ones((1, length), np.float32) / length
    return cv2.filter2D(img, -1, k)

def rgb_split(f, px, vertical=0):
    px = int(px)
    if px < 1:
        return f
    out = f.copy()
    out[..., 2] = np.roll(f[..., 2], px, axis=1)
    out[..., 0] = np.roll(f[..., 0], -px, axis=1)
    if vertical:
        out[..., 2] = np.roll(out[..., 2], int(vertical), axis=0)
    return out

def glitch(f, strength):
    out = f.copy()
    nb = int(6 + 10 * strength)
    for _ in range(nb):
        y0 = rng.integers(0, H - 10)
        hh = int(rng.integers(6, int(H * 0.09)))
        sh = int(rng.normal(0, W * 0.06 * strength))
        out[y0:y0 + hh] = np.roll(out[y0:y0 + hh], sh, axis=1)
        if rng.random() < 0.35:
            tint = [np.array([255, 40, 255]), np.array([255, 255, 40]), np.array([80, 40, 255])][rng.integers(0, 3)]
            out[y0:y0 + hh] = (out[y0:y0 + hh] * 0.55 + tint * 0.45).astype(np.uint8)
    # blocky pixelate patch
    if rng.random() < 0.7:
        bw, bh = int(W * rng.uniform(0.15, 0.4)), int(H * rng.uniform(0.08, 0.25))
        x0, y0 = rng.integers(0, W - bw), rng.integers(0, H - bh)
        patch = out[y0:y0 + bh, x0:x0 + bw]
        small = cv2.resize(patch, (max(1, bw // 24), max(1, bh // 24)), interpolation=cv2.INTER_AREA)
        out[y0:y0 + bh, x0:x0 + bw] = cv2.resize(small, (bw, bh), interpolation=cv2.INTER_NEAREST)
    return out

def tri_frame(sg, t):
    u = (t - sg["t0"]) / (sg["t1"] - sg["t0"])
    out = np.zeros((H, W, 3), np.uint8)
    pw = W // 3
    for k, s in enumerate(sg["tri"]):
        clip = load_clip(s, sg["span"] * 1.3)
        i = min(int(u * sg["span"] * 1.3 * FPS), len(clip) - 1)
        img = transform(clip[i], 1.25 + 0.1 * u, 0, (k - 1) * (1 - u) * H * 0.25 * (1 if k % 2 else -1), 0)
        out[:, k * pw:(k + 1) * pw] = img[:, W // 2 - pw // 2: W // 2 - pw // 2 + pw]
    # skewed white dividers
    for k in (1, 2):
        x = k * pw
        cv2.line(out, (x + int(H * 0.04), 0), (x - int(H * 0.04), H), (255, 255, 255), max(2, int(8 * SCALE)))
    return out

# ---------------------------------------------------------------- render
enc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                        "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow" if SCALE == 1 else "veryfast",
                        "-crf", "16", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)

def seg_at(t):
    for s in segs:
        if s["t0"] <= t < s["t1"]:
            return s
    return segs[-1]

prev = None
for n in range(NF):
    t = n / FPS
    sg = seg_at(t)
    first = n == int(math.ceil(sg["t0"] * FPS - 1e-6))
    if sg.get("black"):
        img = np.zeros((H, W, 3), np.uint8)
        u = 0
    elif sg.get("tri"):
        img = tri_frame(sg, t); u = (t - sg["t0"]) / (sg["t1"] - sg["t0"])
    else:
        img, u = get_src_frame(sg, t)
    fx = sg["fx"]
    # --- camera
    pz = env(t, punch, 0.085)
    sh = env(t, shake, 0.11)
    zoom = (sg.get("z0", 1.1) + (sg.get("z1", 1.1) - sg.get("z0", 1.1)) * ease(u, "out")) * (1 + 0.17 * min(pz, 1.6))
    dx = rng.normal(0, 1) * sh * 30 * SCALE
    dy = rng.normal(0, 1) * sh * 22 * SCALE
    rot = rng.normal(0, 1) * sh * 1.2
    whip = 0.0
    if "whip" in fx:
        age = t - sg["t0"]
        if age < 3 / FPS:
            whip = 1 - age / (3 / FPS)
            dx += whip * W * 0.22 * (1 if n % 2 else -1) * 0 + whip * W * 0.18
    if not sg.get("black"):
        img = transform(img, zoom, dx, dy, rot)
        if whip > 0:
            img = motion_blur_h(img, whip * 140 * SCALE)
        # outgoing whip: blur last 2 frames of segment if next seg whips
        nxt = seg_at(sg["t1"] + 1e-4)
        if "whip" in nxt["fx"] and sg["t1"] - t < 2.5 / FPS:
            img = motion_blur_h(img, 90 * SCALE)
        zb = 0
        if "zoomblur" in fx:
            zb = max(0, 1 - (t - sg["t0"]) / 0.18)
        if t >= LOGO and t - LOGO < 0.15:
            zb = 1 - (t - LOGO) / 0.15
        if zb > 0.05:
            img = zoom_blur(img, zb * 2.5)
        img = grade(img)
    f = img.astype(np.float32) / 255
    # --- fade-in / logo bg dim
    if "fadein" in fx:
        f *= min(1, t / 0.25)
    if "logo" in fx:
        f = cv2.GaussianBlur(f, (0, 0), 6 * SCALE) * 0.42 + f * 0.12
    # --- light leaks
    for te, s in leak_events:
        d = t - te
        if 0 <= d < 0.45:
            a = s * (1 - d / 0.45) ** 1.5 * 0.85
            off = int((d / 0.45) * W * 0.9 + te * 100) % W
            L = leak[:, off:off + W]
            f = 1 - (1 - f) * (1 - L * a)
    # --- texts
    for t0, t1, s, size, kind in texts:
        if t0 <= t < t1:
            rgb_, a_ = TXT[s]
            age = t - t0
            if kind == "subtle":
                al = min(1, age / 0.2) * min(1, (t1 - t) / 0.1)
                comp(f, rgb_, a_, W / 2, H * 0.80, 1 + 0.06 * age, al)
            elif kind == "slam":
                sc_ = 1 + 0.9 * math.exp(-age / 0.035)
                al = min(1, age / 0.02 + 0.3) * (1 if (t1 - t) > 2 / FPS else 0.5)
                jx = rng.normal(0, 1) * 6 * SCALE
                comp(f, rgb_, a_, W / 2 + jx, H / 2, sc_ * (1 + 0.08 * age), al)
            else:
                comp(f, rgb_, a_, W / 2, H / 2, 1.0 + 0.4 * age, 1.0)
    # --- logo
    if t >= LOGO:
        age = t - LOGO
        if age < 0.12:
            sc_ = 3.2 - 2.2 * (age / 0.12) ** 0.6
        else:
            sc_ = 1.0 + 0.03 * math.sin(age * 4) + 0.06 * math.exp(-(age - 0.12) / 0.05) * -1 + 0.045 * age
        if t >= 13.108:
            sc_ *= 1 + 0.08 * math.exp(-(t - 13.108) / 0.07)
        jit = env(t, shake, 0.09) * 12 * SCALE
        comp(f, LOGO_RGB, LOGO_A, W / 2 + rng.normal(0, 1) * jit, H * 0.46 + rng.normal(0, 1) * jit, sc_ * 1.18, min(1, age / 0.04))
        if t >= 13.30:
            a2 = min(1, (t - 13.30) / 0.25)
            ntxt = "COMING SOON"
            comp(f, TAG[0], TAG[1], W / 2, H * 0.80, 1 + 0.02 * (t - 13.3), a2)
    f = np.clip(f, 0, 1)
    out8 = (f * 255).astype(np.uint8)
    # --- glitches
    age = t - sg["t0"]
    gl = 0
    if "glitch_in" in fx and age < 3 / FPS:
        gl = 1.0
    if "strobe" in fx:
        gl = 0.6
    if t >= LOGO and (age_l := t - LOGO) < 0.1:
        gl = 1.0
    if 14.15 <= t < 14.32 or 13.108 <= t < 13.108 + 2 / FPS:
        gl = 1.2
    if gl:
        out8 = glitch(out8, gl)
    # --- rgb split
    rs = env(t, rgb, 0.09)
    px = (2 + 26 * min(rs, 1.8)) * SCALE + gl * 20 * SCALE
    out8 = rgb_split(out8, px, vertical=rng.normal(0, 1) * rs * 4 * SCALE)
    f = out8.astype(np.float32) / 255
    # --- invert hits
    if n in invert_frames:
        f = 1 - f
    # --- white strobe at end of drop
    if "strobewhite" in fx and (n % 2 == 0):
        f = 1 - (1 - f) * 0.25
    # --- flash
    fl = flash_env(t)
    if fl.max() > 0.01:
        f = f + (1 - f) * np.clip(fl, 0, 1)
    # --- vignette + grain
    f = f * VIG
    f = f + GRAIN[n % 8][..., None] * 0.028
    # --- letterbox
    if t < 6.571:
        bar = 0.125
    elif t < DROP:
        bar = 0.125 + 0.13 * ((t - 6.571) / (DROP - 6.571)) ** 2
    elif t < DROP + 3 / FPS:
        bar = 0.255 * (1 - (t - DROP) / (3 / FPS))
    elif t >= LOGO:
        bar = 0.10 * min(1, (t - LOGO) / 0.3)
    else:
        bar = 0
    bh = int(H * bar / 2) * 2 // 2
    if bh > 0:
        f[:bh] = 0; f[H - bh:] = 0
    # --- end fade
    if t > 14.55:
        f *= max(0, 1 - (t - 14.55) / 0.42)
    out8 = (np.clip(f, 0, 1) * 255).astype(np.uint8)
    enc.stdin.write(out8.tobytes())
    if n % 30 == 0:
        print(f"frame {n}/{NF}", flush=True)
enc.stdin.close()
enc.wait()
print("done")

"""GTA VI fan hype trailer renderer (v4 - chrome graffiti text slams, official end-card reveal).
usage: python render2.py WORKDIR OUT.mp4 [scale]
WORKDIR must contain src.mp4 (source footage)."""
import numpy as np, cv2, subprocess, sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logo3d import build_logo, build_bg
LOGO_FONT = os.environ.get("LOGO_FONT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "MetalMania-Regular.ttf"))

WORK, OUT = sys.argv[1], sys.argv[2]
SCALE = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
SRC = f"{WORK}/src.mp4"
FPS = 30
W, H = int(1920 * SCALE) // 2 * 2, int(1080 * SCALE) // 2 * 2
TOTAL = 15.0
NF = int(TOTAL * FPS)
rng = np.random.default_rng(7)
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf"
FONT2 = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"

# ---------------------------------------------------------------- timeline
DROP, LOGO = 7.024, 12.643
segs = []
def seg(t0, t1, src, span=None, speed=1.0, ease="lin", z0=1.06, z1=1.14, fx=(), **kw):
    if span is None:
        span = (t1 - t0) * speed
    segs.append(dict(t0=t0, t1=t1, src=src, span=span, ease=ease, z0=z0, z1=z1, fx=set(fx), **kw))

seg(0.000, 0.952, 6.30, speed=0.85, z0=1.04, z1=1.32, fx=("fadein", "trail"))
seg(0.952, 1.440, 8.30, z0=1.18, z1=1.06, fx=("whip",))
seg(1.440, 1.881, 11.70, speed=1.2, fx=("slices",))
seg(1.881, 2.380, 19.00, z0=1.20, z1=1.08, fx=("whip",))
seg(2.380, 2.821, 28.00, speed=1.3, fx=("spin",))
seg(2.821, 3.309, 35.20, speed=2.2, ease="ramp", fx=("whip", "glitch_in"))
seg(3.309, 3.762, 38.60, z0=1.05, z1=1.22, fx=("slices",))
seg(3.762, 4.249, 46.00, speed=2.0, fx=("whip",))
seg(4.249, 4.690, 50.00, z0=1.25, z1=1.08, fx=("spin",))
seg(4.690, 5.166, 63.30, fx=("glitch_in",))
seg(5.166, 5.631, 74.95, speed=1.4, fx=("whip", "lag"))
seg(5.631, 6.107, 83.30, speed=1.5, z0=1.05, z1=1.25, fx=("trail",))
seg(6.107, 6.571, 85.20, z0=1.10, z1=1.35, fx=("glitch_in", "stutter"))
st = 6.571
for s in [104.2, 118.3, 101.0, 75.2, 128.3, 140.4]:
    seg(st, st + 2 / FPS, s, z0=1.25, z1=1.35, fx=("strobe", "huecycle"))
    st += 2 / FPS
segs.append(dict(t0=st, t1=DROP, black=True, fx=set()))

drop = [
    (7.024, 7.488, 118.00, dict(span=0.78, ease="ramp", z0=1.30, z1=1.05, fx=("zoomblur",))),
    (7.488, 7.721, 140.20, dict(speed=1.5, fx=("whip",))),
    (7.721, 7.953, 142.00, dict(fx=("spin",))),
    (7.953, 8.185, 147.40, dict(speed=1.5, fx=("whip",))),
    (8.185, 8.417, 148.30, dict(speed=1.5, fx=("slices",))),
    (8.417, 8.661, 121.00, dict(speed=1.5, fx=("glitch_in", "lag"))),
    (8.661, 8.893, 101.00, dict(fx=("lag",))),
    (8.893, 9.125, 138.30, dict(fx=("whip",))),
    (9.125, 9.358, None, dict(tri=[140.6, 142.4, 147.6])),
    (9.358, 9.601, 125.90, dict(fx=("whip",))),
    (9.601, 9.834, 106.15, dict(fx=("glitch_in", "spin"))),
    (9.834, 10.066, 144.60, dict(speed=1.5, fx=("whip", "lag"))),
    (10.066, 10.298, 149.50, dict(speed=0.5, z0=1.05, z1=1.15, fx=("trail",))),
    (10.298, 10.530, 111.40, dict(z0=1.30, z1=1.10, fx=("zoomblur", "speedlines"))),
    (10.530, 10.762, 112.80, dict(fx=("whip", "lag"))),
    (10.762, 10.995, 115.00, dict(fx=("slices",))),
    (10.995, 11.238, 118.90, dict(fx=("whip",))),
    (11.238, 11.471, 119.70, dict(speed=1.6, z0=1.35, z1=1.08, fx=("zoomblur", "speedlines"))),
    (11.471, 11.703, 94.40, dict(fx=("whip",))),
    (11.703, 11.935, 139.20, dict(speed=1.5, fx=("glitch_in",))),
    (11.935, 12.167, 108.00, dict(fx=("spin",))),
    (12.167, 12.411, 103.20, dict(z0=1.08, z1=1.25, fx=("stutter",))),
    (12.411, 12.543, 128.00, dict(speed=2.0, fx=("glitch_in", "huecycle"))),
]
segs_black_before_card = (12.543, LOGO)
for t0, t1, s, kw in drop:
    if "tri" in kw:
        segs.append(dict(t0=t0, t1=t1, tri=kw["tri"], span=t1 - t0, ease="lin", z0=1.1, z1=1.2, fx={"slices"}, src=None))
    else:
        seg(t0, t1, s, **kw)
segs.append(dict(t0=12.543, t1=LOGO, black=True, fx=set()))
seg(LOGO, TOTAL, 153.00, speed=0.45, z0=1.0, z1=1.06, fx=("logo",))

# ---------------------------------------------------------------- events
beats_intro = [0.035, 0.499, 0.952, 1.44, 1.881, 2.38, 2.821, 3.309, 3.762, 4.249, 4.69, 5.166, 5.631, 6.107, 6.571]
halfs = [7.024, 7.256, 7.488, 7.721, 7.953, 8.185, 8.417, 8.661, 8.893, 9.125, 9.358, 9.601, 9.834, 10.066,
         10.298, 10.53, 10.762, 10.995, 11.238, 11.471, 11.703, 11.935, 12.167, 12.411, 12.643, 12.875, 13.108]
kicks = [7.024, 7.488, 7.953, 8.417, 8.893, 9.358, 9.834, 10.298, 10.774, 11.238, 11.703, 12.167, 12.643, 13.108]
big = {7.024: 1.6, 10.298: 1.1, 11.238: 1.3, 12.643: 1.8, 13.108: 0.8, 8.893: 0.7, 9.358: 0.6, 9.834: 0.6, 7.488: 0.6}

punch = [(t, 0.6) for t in beats_intro] + [(t, 1.1) for t in kicks] + [(t, 0.5) for t in halfs if t not in kicks]
shake = [(t, 0.3) for t in beats_intro[2:]] + [(t, 0.9) for t in kicks] + [(t, s) for t, s in big.items()]
rgb = [(t, 0.4) for t in beats_intro] + [(t, 0.7) for t in halfs] + [(t, s) for t, s in big.items()]
bulge = [(t, 0.5) for t in beats_intro[2:]] + [(t, 1.0) for t in kicks]
shocks = [7.024, 11.238, 12.643]
lines_ev = [(7.024, 0.8), (11.238, 0.6)]
flash = [(t, 0.15, (1, 1, 1)) for t in beats_intro[2::2]] + \
        [(t, min(0.5, s * 0.4), (1, 1, 1)) for t, s in big.items()] + \
        [(t, 0.18, (0.6, 0.35, 1.0)) for t in [7.721, 8.661, 9.601, 10.53, 11.471]] + \
        [(t, 0.18, (0.3, 0.6, 1.0)) for t in [8.185, 9.125, 10.066, 10.995, 11.935]]
fr = lambda t: int(round(t * FPS))
invert_frames = set()
duo_frames = set()

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
            c += s * math.exp(-d / 0.055) * np.array(col)[::-1]
    return np.clip(c, 0, 1.2)

texts = [
    (0.20, 0.952, "WELCOME TO LEONIDA", 64, "subtle"),
    (1.440, 1.881, "NO RULES", 190, "slam"),
    (2.380, 2.821, "NO LIMITS", 180, "slam"),
    (3.309, 3.762, "ONE STATE", 180, "slam"),
    (4.249, 4.690, "ZERO MERCY", 165, "slam"),
    (5.166, 5.631, "ALL GAS", 200, "slam"),
    (6.107, 6.571, "GET READY", 180, "slam"),
]

# ---------------------------------------------------------------- assets
def text_rgba(txt, size, fill=(255, 255, 255), glow=(255, 60, 160), tracking=0.02, font=FONT):
    f = ImageFont.truetype(font, int(size))
    tw = sum(f.getlength(c) for c in txt) + tracking * size * (len(txt) - 1)
    pad = int(size * 0.6)
    w, h = int(tw + pad * 2), int(size * 1.4 + pad * 2)
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    x = pad
    for c in txt:
        d.text((x, pad), c, font=f, fill=255)
        x += f.getlength(c) + tracking * size
    m = np.asarray(mask).astype(np.float32) / 255
    g1 = np.asarray(mask.filter(ImageFilter.GaussianBlur(size * 0.12))).astype(np.float32) / 255
    g2 = np.asarray(mask.filter(ImageFilter.GaussianBlur(size * 0.35))).astype(np.float32) / 255
    glowa = np.clip(g1 * 1.2 + g2 * 0.9, 0, 1)
    gcol = np.array(glow[::-1], np.float32) / 255
    fcol = np.array(fill[::-1], np.float32) / 255
    rgb = glowa[..., None] * gcol * (1 - m[..., None]) + m[..., None] * fcol
    a = np.clip(glowa * (1 - m) + m, 0, 1)
    # outline-only version for echo copies
    edge = np.asarray(mask.filter(ImageFilter.MaxFilter(max(3, int(size * 0.04)) | 1))).astype(np.float32) / 255 - m
    edge = np.clip(edge, 0, 1)
    ergb = edge[..., None] * gcol
    ys, xs = np.where(a > 0.01)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return rgb[y0:y1, x0:x1], a[y0:y1, x0:x1], ergb[y0:y1, x0:x1], edge[y0:y1, x0:x1]

def logo_rgba(S):
    """Fan-made 'GTA VI' title: sunset-gradient italic GTA + giant chrome VI with neon glow."""
    W0, H0 = int(1900 * S), int(900 * S)
    fG = ImageFont.truetype(FONT, int(300 * S))
    fX = ImageFont.truetype(FONT, int(600 * S))
    mG = Image.new("L", (W0, H0), 0); dG = ImageDraw.Draw(mG)
    mX = Image.new("L", (W0, H0), 0); dX = ImageDraw.Draw(mX)
    x = int(150 * S)
    for c in "GTA":
        dG.text((x, int(250 * S)), c, font=fG, fill=255)
        x += fG.getlength(c) - 12 * S
    x += int(25 * S)
    for c in "VI":
        dX.text((x, int(30 * S)), c, font=fX, fill=255)
        x += fX.getlength(c) - 30 * S
    sG = np.asarray(mG.filter(ImageFilter.MaxFilter(int(15 * S) | 1))).astype(np.float32) / 255
    sX = np.asarray(mX.filter(ImageFilter.MaxFilter(int(17 * S) | 1))).astype(np.float32) / 255
    mg = np.asarray(mG).astype(np.float32) / 255
    mx = np.asarray(mX).astype(np.float32) / 255
    yy = np.linspace(0, 1, H0)[:, None]
    xx = np.linspace(0, 1, W0)[None, :]
    top, mid, bot = np.array([150, 40, 255]), np.array([60, 120, 255]), np.array([40, 220, 255])
    tt = np.clip((yy - 0.30) / 0.36, 0, 1)[..., None]
    gradG = np.where(tt < 0.5, top + (mid - top) * (tt * 2), mid + (bot - mid) * ((tt - 0.5) * 2))
    gradG = np.broadcast_to(gradG, (H0, W0, 3)) / 255
    band = 0.55 + 0.45 * np.cos((yy * 9 + xx * 2.5) * math.pi)
    chrome = np.stack([band, band * 0.95, band * 0.92], -1)
    chrome = np.clip(chrome + (yy < 0.48)[..., None] * 0.25, 0, 1)
    # hot pink->orange rim tint on chrome
    chrome = np.clip(chrome * 0.85 + np.array([0.25, 0.05, 0.3]) * (1 - band[..., None]), 0, 1)
    chrome = np.broadcast_to(chrome, (H0, W0, 3))
    allm = np.maximum(sG, sX)
    glow1 = cv2.GaussianBlur(allm, (0, 0), 25 * S)
    glow2 = cv2.GaussianBlur(allm, (0, 0), 70 * S)
    rgb = glow1[..., None] * np.array([255, 60, 255]) / 255 * 1.1 + glow2[..., None] * np.array([255, 170, 40]) / 255 * 0.9
    a = np.clip(glow1 * 1.1 + glow2 * 0.8, 0, 1)
    dark = np.array([40, 10, 30]) / 255
    for strokem, fillm, fillc in [(sX, mx, chrome), (sG, mg, gradG)]:
        rgb = rgb * (1 - strokem[..., None]) + strokem[..., None] * dark
        a = np.maximum(a, strokem)
        rgb = rgb * (1 - fillm[..., None]) + fillm[..., None] * fillc
    ys, xs = np.where(a > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    edge = np.clip(allm - np.maximum(mg, mx), 0, 1)[y0:y1, x0:x1]
    return (rgb[y0:y1, x0:x1].astype(np.float32), a[y0:y1, x0:x1].astype(np.float32),
            (edge[..., None] * np.array([255, 80, 255]) / 255).astype(np.float32), edge.astype(np.float32))

print("building assets", flush=True)
TXT = {}
for t0, t1, s, size, kind in texts:
    if kind == "subtle":
        TXT[s] = text_rgba(s, size * SCALE, glow=(255, 150, 60), tracking=0.35, font=FONT2)
    elif kind == "flash":
        TXT[s] = text_rgba(s, size * SCALE, glow=(255, 40, 200))
    elif kind == "slam":
        r_, a_, _ = build_logo(SCALE, text=s, font=LOGO_FONT, size=size)
        TXT[s] = (r_, a_, r_ * 0.6, a_)
    else:
        TXT[s] = text_rgba(s, size * SCALE, glow=(255, 40, 150))
CARD8 = cv2.resize(cv2.imread(f"{WORK}/endcard_1080.png"), (W, H), interpolation=cv2.INTER_AREA)

def comp(frame, rgb, a, cx, cy, scale=1.0, alpha=1.0, add=False):
    if scale != 1.0:
        nw, nh = max(2, int(rgb.shape[1] * scale)), max(2, int(rgb.shape[0] * scale))
        rgb = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_LINEAR)
        a = cv2.resize(a, (nw, nh), interpolation=cv2.INTER_LINEAR)
    h, w = a.shape
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    fx0, fy0, fx1, fy1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if fx1 <= fx0 or fy1 <= fy0:
        return
    sr = rgb[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0]
    sa = a[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0][..., None] * alpha
    if add:
        frame[fy0:fy1, fx0:fx1] += sr * alpha
    else:
        frame[fy0:fy1, fx0:fx1] = frame[fy0:fy1, fx0:fx1] * (1 - sa) + sr * alpha

# static layers
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
NX, NY = (xx - W / 2) / (W / 2), (yy - H / 2) / (W / 2)
RR = np.sqrt(NX ** 2 + NY ** 2) + 1e-6
r_v = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VIG = np.clip(1 - 0.55 * np.clip(r_v - 0.45, 0, 1) ** 1.6, 0, 1)[..., None].astype(np.float32)
GRAIN = [cv2.resize(rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32), (W, H)) for _ in range(8)]
SCAN = ((np.arange(H) % 4) < 2).astype(np.float32)[:, None, None] * 0.12
leak = np.zeros((H, W * 2, 3), np.float32)
gy, gx = np.mgrid[0:H, 0:W * 2].astype(np.float32)
for _ in range(7):
    cx, cy = rng.uniform(0, W * 2), rng.uniform(-H * 0.2, H * 1.2)
    rad = rng.uniform(H * 0.3, H * 0.8)
    col = [np.array([40, 120, 255]), np.array([160, 40, 255]), np.array([30, 200, 255])][rng.integers(0, 3)] / 255
    leak += np.exp(-(((gx - cx) ** 2 + (gy - cy) ** 2) / (2 * rad ** 2)))[..., None].astype(np.float32) * col
leak = np.clip(leak, 0, 1)
del gx, gy
leak_events = [(0.952, 0.8), (2.821, 0.8), (4.69, 0.8), (6.107, 0.9), (7.024, 1.0), (9.125, 0.7), (10.298, 0.8), (11.238, 0.9), (12.643, 0.6)]
# speed-line overlay (radial streaks, clear centre)
D = int(math.hypot(W, H)) + 4
sl = np.zeros((D, D), np.float32)
for _ in range(140):
    ang = rng.uniform(0, 2 * math.pi); wd = rng.uniform(0.002, 0.012)
    r0 = rng.uniform(0.22, 0.45) * D / 2
    p = [(D / 2 + math.cos(ang) * r0, D / 2 + math.sin(ang) * r0),
         (D / 2 + math.cos(ang - wd) * D, D / 2 + math.sin(ang - wd) * D),
         (D / 2 + math.cos(ang + wd) * D, D / 2 + math.sin(ang + wd) * D)]
    cv2.fillConvexPoly(sl, np.array(p, np.int32), float(rng.uniform(0.5, 1.0)), lineType=cv2.LINE_AA)
SPEEDL = cv2.GaussianBlur(sl, (0, 0), 1.2 * SCALE + 0.5)
# god rays
gr = np.zeros((D, D), np.float32)
for k in range(28):
    ang = k / 28 * 2 * math.pi; wd = 0.045 if k % 2 else 0.02
    p = [(D / 2, D / 2), (D / 2 + math.cos(ang - wd) * D, D / 2 + math.sin(ang - wd) * D),
         (D / 2 + math.cos(ang + wd) * D, D / 2 + math.sin(ang + wd) * D)]
    cv2.fillConvexPoly(gr, np.array(p, np.int32), 1.0, lineType=cv2.LINE_AA)
gr = cv2.GaussianBlur(gr, (0, 0), 6 * SCALE + 1)
ry, rx = np.mgrid[0:D, 0:D].astype(np.float32)
gr *= np.exp(-((rx - D / 2) ** 2 + (ry - D / 2) ** 2) / (2 * (D * 0.22) ** 2))
RAYS = gr
del ry, rx

def rotated_crop(img2d, ang, cx=None, cy=None):
    M = cv2.getRotationMatrix2D((D / 2, D / 2), ang, 1.0)
    cx = W / 2 if cx is None else cx; cy = H / 2 if cy is None else cy
    M[0, 2] += cx - D / 2; M[1, 2] += cy - D / 2
    return cv2.warpAffine(img2d, M, (W, H), flags=cv2.INTER_LINEAR)

# grade LUT
x = np.arange(256) / 255.0
sc = np.clip(x + 0.35 * (0.5 - 0.5 * np.cos(np.pi * x) - x) * 2, 0, 1)
LUT = (np.stack([np.clip(sc * 0.95 + 0.07 * (1 - x) ** 2, 0, 1), sc, np.clip(sc * 1.04 + 0.03 * x, 0, 1)], -1) * 255
       ).astype(np.uint8).reshape(256, 1, 3)

GAMMA = np.clip(((np.arange(256) / 255.0) ** 0.85) * 255 * 1.04, 0, 255).astype(np.uint8)
def grade(img8, sat=1.3, hue=0):
    img8 = cv2.LUT(img8, LUT)
    img8 = cv2.LUT(img8, GAMMA)
    hsv = cv2.cvtColor(img8, cv2.COLOR_BGR2HSV)
    if hue:
        hsv[..., 0] = ((hsv[..., 0].astype(np.int32) + int(hue)) % 180).astype(np.uint8)
    s = hsv[..., 1].astype(np.float32) * sat
    hsv[..., 1] = np.clip(s, 0, 255).astype(np.uint8)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

# ---------------------------------------------------------------- source
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
    return u ** 2.4 if kind == "ramp" else (1 - (1 - u) ** 2 if kind == "out" else u)

def get_src_frame(sg, t):
    u = min(max((t - sg["t0"]) / (sg["t1"] - sg["t0"]), 0), 1)
    if "stutter" in sg["fx"]:
        age = t - sg["t0"]
        rep = int(age / 0.1)
        off = (age - rep * 0.1) + min(rep, 2) * 0.05
    else:
        off = sg["span"] * ease(u, sg["ease"])
    clip = load_clip(sg["src"], sg["span"])
    return clip[min(int(round(off * FPS)), len(clip) - 1)], u

def transform(img, zoom, dx, dy, rot):
    M = cv2.getRotationMatrix2D((W / 2, H / 2), rot, zoom)
    M[0, 2] += dx; M[1, 2] += dy
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def distort(img, k_bulge, shock_list):
    """fisheye bulge + expanding shockwave rings via remap."""
    scale = 1 - k_bulge * np.clip(1 - RR ** 2, 0, 1)
    sx, sy = NX * scale, NY * scale
    for R, A in shock_list:
        ring = A * np.exp(-((RR - R) / 0.07) ** 2)
        sx = sx - NX / RR * ring
        sy = sy - NY / RR * ring
    mx = (sx * (W / 2) + W / 2).astype(np.float32)
    my = (sy * (W / 2) + H / 2).astype(np.float32)
    return cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def zoom_blur(img, amt):
    acc = img.astype(np.float32)
    for k in range(1, 5):
        acc += transform(img, 1 + amt * 0.035 * k, 0, 0, 0).astype(np.float32)
    return np.clip(acc / 5, 0, 255).astype(np.uint8)

def motion_blur_h(img, length):
    length = int(length) | 1
    return img if length < 3 else cv2.filter2D(img, -1, np.ones((1, length), np.float32) / length)

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
    for _ in range(int(6 + 12 * strength)):
        y0 = rng.integers(0, H - 10)
        hh = int(rng.integers(6, int(H * 0.09)))
        out[y0:y0 + hh] = np.roll(out[y0:y0 + hh], int(rng.normal(0, W * 0.07 * strength)), axis=1)
        if rng.random() < 0.35:
            tint = [np.array([255, 40, 255]), np.array([255, 255, 40]), np.array([80, 40, 255])][rng.integers(0, 3)]
            out[y0:y0 + hh] = (out[y0:y0 + hh] * 0.55 + tint * 0.45).astype(np.uint8)
    for _ in range(2):
        if rng.random() < 0.7:
            bw, bh = int(W * rng.uniform(0.15, 0.4)), int(H * rng.uniform(0.08, 0.25))
            x0, y0 = rng.integers(0, W - bw), rng.integers(0, H - bh)
            small = cv2.resize(out[y0:y0 + bh, x0:x0 + bw], (max(1, bw // 24), max(1, bh // 24)), interpolation=cv2.INTER_AREA)
            out[y0:y0 + bh, x0:x0 + bw] = cv2.resize(small, (bw, bh), interpolation=cv2.INTER_NEAREST)
    # pixel-sort-ish vertical drip streak
    if rng.random() < 0.6:
        x0 = rng.integers(0, W - 40); bw = int(rng.integers(20, int(W * 0.12)))
        y0 = rng.integers(0, H // 2)
        out[y0:, x0:x0 + bw] = out[y0:y0 + 1, x0:x0 + bw]
    return out

def tri_frame(sg, t):
    u = (t - sg["t0"]) / (sg["t1"] - sg["t0"])
    out = np.zeros((H, W, 3), np.uint8)
    pw = W // 3
    for k, s in enumerate(sg["tri"]):
        clip = load_clip(s, sg["span"] * 1.3)
        i = min(int(u * sg["span"] * 1.3 * FPS), len(clip) - 1)
        img = transform(clip[i], 1.25 + 0.1 * u, 0, (1 - u) * H * 0.3 * (1 if k % 2 else -1), 0)
        out[:, k * pw:(k + 1) * pw] = img[:, W // 2 - pw // 2: W // 2 - pw // 2 + pw]
    for k in (1, 2):
        cv2.line(out, (k * pw + int(H * 0.04), 0), (k * pw - int(H * 0.04), H), (255, 255, 255), max(2, int(8 * SCALE)))
    return out

def mirror(img):
    out = img.copy()
    out[:, W // 2:] = img[:, :W // 2][:, ::-1][:, :W - W // 2]
    return out

def quad(img, u):
    small = cv2.resize(transform(img, 1.0 + 0.2 * u, 0, 0, 0), (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    top = np.concatenate([small, small[:, ::-1]], 1)
    out = np.concatenate([top, top[::-1]], 0)
    return cv2.resize(out, (W, H)) if out.shape[:2] != (H, W) else out

def slices(img, p, n=14):
    out = img.copy()
    hh = H // n
    off = int(W * 0.6 * (1 - p) ** 2)
    for i in range(n):
        out[i * hh:(i + 1) * hh] = np.roll(img[i * hh:(i + 1) * hh], off if i % 2 else -off, axis=1)
    return out

def duotone(f):
    l = cv2.cvtColor((np.clip(f, 0, 1) * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None] / 255
    a, b = np.array([0.45, 0.05, 0.10]), np.array([0.75, 0.25, 1.0])  # deep blue -> hot pink (BGR)
    return a * (1 - l) + b * l

# particles
P = dict(pos=np.zeros((0, 2)), vel=np.zeros((0, 2)), life=np.zeros(0), col=np.zeros((0, 3)), size=np.zeros(0))
def spawn(n, burst=False):
    if burst:
        ang = rng.uniform(0, 2 * math.pi, n); spd = rng.uniform(400, 2200, n) * SCALE
        pos = np.tile([W / 2, H / 2], (n, 1)) + rng.normal(0, 30 * SCALE, (n, 2))
        vel = np.stack([np.cos(ang) * spd, np.sin(ang) * spd], 1)
        life = rng.uniform(0.3, 0.8, n)
    else:
        pos = np.stack([rng.uniform(0, W, n), np.full(n, H + 10.0)], 1)
        vel = np.stack([rng.normal(0, 60, n), -rng.uniform(150, 520, n)], 1) * SCALE
        life = rng.uniform(1.0, 2.4, n)
    cols = np.array([[60, 170, 255], [200, 80, 255], [120, 220, 255], [255, 255, 255]]) / 255
    for k, v in (("pos", pos), ("vel", vel), ("life", life), ("col", cols[rng.integers(0, 4, n)]),
                 ("size", rng.uniform(1.5, 4.5, n) * SCALE)):
        P[k] = np.concatenate([P[k], v])

def particles_layer(dt):
    if len(P["life"]) == 0:
        return None
    P["pos"] += P["vel"] * dt
    P["vel"] *= 0.93
    P["life"] -= dt
    keep = P["life"] > 0
    for k in P:
        P[k] = P[k][keep]
    layer = np.zeros((H, W, 3), np.float32)
    for (px, py), c, s, lf in zip(P["pos"], P["col"], P["size"], P["life"]):
        if 0 <= px < W and 0 <= py < H:
            cv2.circle(layer, (int(px), int(py)), max(1, int(s)), tuple(float(v) * min(1, lf * 2) for v in c), -1, cv2.LINE_AA)
    return layer + cv2.GaussianBlur(layer, (0, 0), 6 * SCALE + 1) * 2.0

# ---------------------------------------------------------------- render
enc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                        "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow" if SCALE == 1 else "veryfast",
                        "-crf", "17", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)

def seg_at(t):
    for s in segs:
        if s["t0"] <= t < s["t1"]:
            return s
    return segs[-1]

trail = None
spin_sign = 1
for n in range(NF):
    t = n / FPS
    sg = seg_at(t)
    fx = sg["fx"]
    age = t - sg["t0"]
    seg_first = age < 1 / FPS - 1e-6
    if seg_first and "spin" in fx:
        spin_sign *= -1
    if sg.get("black"):
        img, u = np.zeros((H, W, 3), np.uint8), 0
    elif sg.get("tri"):
        img, u = tri_frame(sg, t), (t - sg["t0"]) / (sg["t1"] - sg["t0"])
    elif "logo" in fx:
        img, u = CARD8, (t - sg["t0"]) / (sg["t1"] - sg["t0"])
    else:
        img, u = get_src_frame(sg, t)
    # --- camera
    pz = env(t, punch, 0.085)
    sh = env(t, shake, 0.11)
    zoom = (sg.get("z0", 1.1) + (sg.get("z1", 1.1) - sg.get("z0", 1.1)) * ease(u, "out")) * (1 + 0.2 * min(pz, 1.6))
    if "stutter" in fx:
        zoom *= 1 + 0.07 * int(age / 0.1)
    if "logo" in fx:   # reveal: punch in from 1.18 and settle; keep the whole card in frame afterwards
        zoom = (1.0 + 0.04 * ease(u, "out")) * (1 + 0.04 * min(pz, 1.6)) * (1 + 0.18 * (1 - min(1, age / 0.28)) ** 3)
    dx = rng.normal(0, 1) * sh * 22 * SCALE
    dy = rng.normal(0, 1) * sh * 16 * SCALE
    rot = rng.normal(0, 1) * sh * 1.5
    if "spin" in fx:
        rot += spin_sign * 28 * max(0, 1 - age / 0.17) ** 3
        zoom *= 1 + 0.25 * max(0, 1 - age / 0.17) ** 2
    whip = max(0, 1 - age / (3 / FPS)) if "whip" in fx else 0
    dx += whip * W * 0.18
    if not sg.get("black"):
        img = transform(img, zoom, dx, dy, rot)
        if "mirror" in fx:
            img = mirror(img)
        if "quad" in fx:
            img = quad(img, u)
        if "slices" in fx and age < 4 / FPS:
            img = slices(img, age / (4 / FPS))
        # fisheye + shockwaves
        kb = 0.12 * min(env(t, bulge, 0.07), 1.5)
        sw = [(0.05 + (t - ts) * 3.2, 0.07 * (1 - (t - ts) / 0.45)) for ts in shocks if 0 <= t - ts < 0.45]
        if kb > 0.01 or sw:
            img = distort(img, kb, sw)
        if whip > 0:
            img = motion_blur_h(img, whip * 100 * SCALE)
        nxt = seg_at(sg["t1"] + 1e-4)
        if "whip" in nxt["fx"] and sg["t1"] - t < 2.5 / FPS:
            img = motion_blur_h(img, 50 * SCALE)
        zb = max(0, 1 - age / 0.12) if "zoomblur" in fx else 0
        if LOGO <= t < LOGO + 0.15:
            zb = 1 - (t - LOGO) / 0.15
        if zb > 0.05:
            img = zoom_blur(img, zb * 1.8)
        hue = (n * 11) % 180 if "huecycle" in fx else 0
        if "logo" not in fx:
            img = grade(img, hue=hue)
    f = img.astype(np.float32) / 255
    if "fadein" in fx:
        f *= min(1, t / 0.25)
    # --- echo trails
    if "lag" in fx and trail is not None and trail.shape == f.shape:
        f = np.maximum(f, trail * 0.6)
    elif "trail" in fx and trail is not None:
        f = f * 0.72 + trail * 0.28
    trail = f.copy()
    # --- light leaks
    for te, s in leak_events:
        d = t - te
        if 0 <= d < 0.45:
            a = s * (1 - d / 0.45) ** 1.5 * 0.4
            off = int((d / 0.45) * W * 0.9 + te * 100) % W
            f = 1 - (1 - f) * (1 - leak[:, off:off + W] * a)
    # --- speed lines
    lv = env(t, lines_ev, 0.12) + (0.8 * max(0, 1 - age / 0.25) if "speedlines" in fx else 0)
    if lv > 0.03:
        L = rotated_crop(SPEEDL, rng.uniform(0, 360))
        f = 1 - (1 - f) * (1 - L[..., None] * min(1, lv) * 0.35)
    # --- texts
    for t0, t1, s, size, kind in texts:
        if t0 <= t < t1:
            rgb_, a_, ergb, ea = TXT[s]
            ta = t - t0
            if kind == "subtle":
                comp(f, rgb_, a_, W / 2, H * 0.80, 1 + 0.06 * ta, min(1, ta / 0.2) * min(1, (t1 - t) / 0.1))
            elif kind == "slam":
                sc_ = 1 + 0.7 * math.exp(-ta / 0.035)
                al = min(1, ta / 0.02 + 0.3) * (1 if (t1 - t) > 2 / FPS else 0.5)
                for k in (3, 2, 1):  # expanding outline echoes
                    comp(f, ergb, ea, W / 2, H / 2, sc_ * (1 + 0.10 * k + ta * 0.8 * k), 0.22 / k, add=True)
                comp(f, rgb_, a_, W / 2 + rng.normal(0, 1) * 7 * SCALE, H / 2, sc_ * (1 + 0.08 * ta), al)
            else:
                for k in (2, 1):
                    comp(f, ergb, ea, W / 2, H / 2, 1.0 + 0.4 * ta + 0.2 * k, 0.6 / k, add=True)
                comp(f, rgb_, a_, W / 2, H / 2, 1.0 + 0.4 * ta, 1.0)
    # --- end card: soft light sweep across the card after the reveal
    if t >= LOGO:
        for s0 in (13.2, 14.05):
            sp = (t - s0) / 0.55
            if 0 <= sp <= 1:
                pos = (xx / W + (yy / H) * 0.35) - (sp * 1.7 - 0.35)
                band = np.exp(-(pos / 0.04) ** 2)[..., None]
                f = 1 - (1 - f) * (1 - band * 0.35)
    # --- particles
    if n == fr(DROP):
        spawn(int(220 * max(SCALE, 0.5)), burst=True)
    pl = particles_layer(1 / FPS)
    if pl is not None:
        f = 1 - (1 - np.clip(f, 0, 1)) * (1 - np.clip(pl, 0, 1))
    f = np.clip(f, 0, 1)
    out8 = (f * 255).astype(np.uint8)
    # --- glitches
    gl = 0
    if "glitch_in" in fx and age < 3 / FPS: gl = 1.0
    if "strobe" in fx: gl = 0.7
    if LOGO <= t < LOGO + 2 / FPS: gl = 0.8
    if gl:
        out8 = glitch(out8, gl)
    rs = env(t, rgb, 0.09)
    px = (1.5 + 13 * min(rs, 1.8)) * SCALE + gl * 14 * SCALE
    out8 = rgb_split(out8, px, vertical=rng.normal(0, 1) * rs * 5 * SCALE)
    f = out8.astype(np.float32) / 255
    if gl:
        f = f * (1 - SCAN)
    if n in invert_frames:
        f = 1 - f
    if n in duo_frames:
        f = duotone(f)
    if "strobewhite" in fx and n % 2 == 0:
        f = 1 - (1 - f) * 0.25
    fl = flash_env(t)
    if fl.max() > 0.01:
        f = f + (1 - f) * np.clip(fl, 0, 1)
    f = f * (0.5 + 0.5 * VIG) + GRAIN[n % 8][..., None] * 0.014 if t < LOGO else f * (0.85 + 0.15 * VIG) + GRAIN[n % 8][..., None] * 0.008
    # --- letterbox
    if t < 6.571: bar = 0.08
    elif t < DROP: bar = 0.08 + 0.10 * ((t - 6.571) / (DROP - 6.571)) ** 2
    elif t < DROP + 3 / FPS: bar = 0.18 * (1 - (t - DROP) / (3 / FPS))
    else: bar = 0
    bh = int(H * bar / 2)
    if bh > 0:
        f[:bh] = 0; f[H - bh:] = 0
    if t > 14.55:
        f *= max(0, 1 - (t - 14.55) / 0.42)
    enc.stdin.write((np.clip(f, 0, 1) * 255).astype(np.uint8).tobytes())
    if n % 30 == 0:
        print(f"frame {n}/{NF}", flush=True)
enc.stdin.close()
enc.wait()
print("done")

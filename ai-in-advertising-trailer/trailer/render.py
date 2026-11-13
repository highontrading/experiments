"""Frame renderer for the AI in Advertising trailer.
usage:
  python3 render.py stills 60 300 ...      -> build/stills/f00060.jpg ...
  python3 render.py video [workers]        -> build/picture.mp4 (no audio)
"""
import os, sys, math, random, subprocess, functools
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
from timeline import *

rng_global = np.random.default_rng(7)
FONT = os.path.join(A, "fonts", "Jersey10-Regular.ttf")
FONT_THIN = os.path.join(A, "fonts", "Manrope.ttf")
BLACK = (5, 5, 5)
CHAR = (29, 31, 31)            # charcoal (RGB)
WHITE = (240, 240, 236)


@functools.lru_cache(None)
def font(px):
    return ImageFont.truetype(FONT, px)


@functools.lru_cache(None)
def font_thin(px):
    f = ImageFont.truetype(FONT_THIN, px)
    try: f.set_variation_by_axes([300])
    except Exception: pass
    return f


def ease(x):  # smooth in/out
    x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)


def lerp(a, b, x): return a + (b - a) * x


# =============================================================== footage sources
class Footage:
    """Decodes a whole shot (with margin) into memory, caches the last few shots."""
    cache = {}

    @classmethod
    def frames(cls, src, t_in, n, size=(2112, 953), speed=1.0, bw=False):
        key = (src, t_in, n, size, speed)
        if key in cls.cache: return cls.cache[key]
        if len(cls.cache) > 6: cls.cache.pop(next(iter(cls.cache)))
        w, h = size
        vf = f"setpts=PTS/{speed},fps={FPS},scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h}"
        cmd = ["ffmpeg", "-v", "error", "-ss", f"{t_in:.3f}", "-i", src, "-frames:v", str(n), "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
        raw = subprocess.run(cmd, capture_output=True, check=True).stdout
        arr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
        if len(arr) < n: arr = np.concatenate([arr, np.repeat(arr[-1:], n - len(arr), 0)])
        cls.cache[key] = arr
        return arr


@functools.lru_cache(16)
def load_png(path):
    im = cv2.imread(path, cv2.IMREAD_COLOR)
    return cv2.cvtColor(im, cv2.COLOR_BGR2RGB)


def crop_rect(img, cx, cy, w, out=(W, PH)):
    """Crop a 2.217:1 rect centred at (cx,cy) with width w from img (clamped), resize to out."""
    ih, iw = img.shape[:2]; ar = out[0] / out[1]
    w = min(w, iw, ih * ar); h = w / ar
    x0 = min(max(cx - w / 2, 0), iw - w); y0 = min(max(cy - h / 2, 0), ih - h)
    M = np.array([[out[0] / w, 0, -x0 * out[0] / w], [0, out[1] / h, -y0 * out[1] / h]], np.float32)
    return cv2.warpAffine(img, M, out, flags=cv2.INTER_AREA if w > out[0] else cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def zoom_frame(img, z, dx=0.0, dy=0.0):
    """img is a margin plate; output W x PH with zoom z relative to 'cover' fit."""
    ih, iw = img.shape[:2]
    cw = (iw / 1.1) / z  # plate has 10% margin; z=1 shows the 'cover' region
    cx = iw / 2 + dx * iw; cy = ih / 2 + dy * ih
    return crop_rect(img, cx, cy, cw)


def grade(img):
    x = img.astype(np.float32) / 255.0
    x = np.clip((x - 0.035) / 0.95, 0, 1)
    x = x * x * (3 - 2 * x) * 0.55 + x * 0.45          # contrast S-curve
    g = x.mean(axis=2, keepdims=True)
    x = g + (x - g) * 1.08                               # saturation
    x = x * np.array([1.03, 1.0, 0.96], np.float32)      # slightly warm
    return np.clip(x * 255, 0, 255).astype(np.uint8)


def shot_plate(fi, shot):
    t0, t1, kind, p = shot
    i = fi - F(t0); n = F(t1) - F(t0); x = i / max(1, n - 1)
    if kind == "video":
        fr = Footage.frames(p["src"], p["t"], n, speed=p.get("speed", 1.0))[i]
        z0, z1 = p.get("z", (1.0, 1.05))
        img = zoom_frame(fr, lerp(z0, z1, x), *p.get("d", (0, 0)))
        return grade(img)
    if kind == "still":
        im = load_png(p["png"]); r0, r1 = p["r0"], p["r1"]; e = ease(x) * 0.6 + x * 0.4
        return grade(crop_rect(im, lerp(r0[0], r1[0], e), lerp(r0[1], r1[1], e), lerp(r0[2], r1[2], e)))
    if kind == "seqv":
        files = sorted(os.listdir(p["dir"])); k = int(round(lerp(p["i0"], min(p["i1"], len(files) - 1), x)))
        im = load_png(os.path.join(p["dir"], files[k])); cx, cy, w = p["rect"]
        return grade(crop_rect(im, cx, cy, w * lerp(1.0, 0.92, x)))
    raise ValueError(kind)


# =============================================================== effects
def chroma(img, s):
    if s <= 0: return img
    out = img.copy(); s = int(s)
    out[:, s:, 0] = img[:, :-s, 0]; out[:, :-s, 2] = img[:, s:, 2]
    return out


def slice_glitch(img, seed, n=26):
    r = random.Random(seed); out = np.zeros_like(img); h, w = img.shape[:2]
    xs = sorted(r.sample(range(40, w - 40), n - 1)); xs = [0] + xs + [w]
    for a, b in zip(xs[:-1], xs[1:]):
        dy = r.randint(-h // 3, h // 3) if r.random() < 0.7 else 0
        col = np.roll(img[:, a:b], dy, axis=0)
        if dy > 0: col[:dy] = 0
        elif dy < 0: col[dy:] = 0
        out[:, a:b] = col
    return out


def mosh(img, prev, seed, k):
    r = np.random.default_rng(seed); h, w = img.shape[:2]; bs = 24
    small = cv2.resize(img, (w // bs, h // bs), interpolation=cv2.INTER_AREA)
    blocky = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
    mask = (r.random((h // bs + 1, w // bs + 1)) < 0.55 - 0.1 * k).repeat(bs, 0).repeat(bs, 1)[:h, :w]
    src = prev if prev is not None else blocky
    out = np.where(mask[..., None], src, blocky)
    return chroma(out, 8)


def hsmear(img, k):
    """k: 0..1 progress of horizontal smear exit"""
    L = int(10 + 380 * k * k)
    kern = np.zeros((1, L), np.float32); kern[0, :] = 1.0 / L
    out = cv2.filter2D(img, -1, kern)
    shift = int(-900 * k * k)
    out = np.roll(out, shift, axis=1)
    if shift < 0: out[:, shift:] = 0
    return (out.astype(np.float32) * (1 - 0.6 * k)).astype(np.uint8)


_noise = [rng_global.normal(0, 1, (PH, W)).astype(np.float32) for _ in range(6)]


def vhs(pic, fi, amount=1.0, grain=4.0):
    """VHS dropout streaks + grain on the picture area (uint8 RGB)."""
    r = random.Random(fi * 7919); x = pic.astype(np.float32)
    x += _noise[fi % 6][..., None] * grain
    nl = r.randint(3, 9)
    for _ in range(nl):
        y = r.randint(4, PH - 5); th = r.choice([1, 1, 2]); a = r.uniform(25, 110) * amount
        xs = r.randint(-200, W // 2); xe = xs + r.randint(300, W)
        seg = np.zeros(W, np.float32); pos = max(0, xs)
        while pos < min(W, xe):
            l = r.randint(4, 60);
            if r.random() < 0.55: seg[pos:pos + l] = a * r.uniform(0.4, 1.0)
            pos += l + r.randint(2, 30)
        x[y:y + th] += seg[None, :, None]
    return np.clip(x, 0, 255).astype(np.uint8)


_vig = None


def vignette(pic, s=0.25):
    global _vig
    if _vig is None:
        yy, xx = np.mgrid[0:PH, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - PH / 2) / (PH / 2)) ** 2)
        _vig = (1 - s * np.clip(d - 0.35, 0, 1) ** 1.5)[..., None]
    return (pic.astype(np.float32) * _vig).astype(np.uint8)


# =============================================================== text
class Line:
    """A typed line of pixel text. reveal: list of per-char reveal times."""

    def __init__(self, text, px=78):
        self.text = text; self.f = font(px)
        self.x = [self.f.getlength(text[:i]) for i in range(len(text) + 1)]
        self.width = self.x[-1]
        bb = self.f.getbbox("H"); self.cap = bb[3] - bb[1]; self.top = bb[1]

    def char_box(self, i, ox):
        return ox + self.x[i], ox + self.x[i + 1]


def typed_times(segments):
    """segments: list of (TEXT, t_start, t_end) -> list of reveal times for 'TEXT TEXT ...' joined by spaces"""
    times = []
    for k, (txt, s, e) in enumerate(segments):
        if k: times.append(s)  # the space appears with the next word
        n = len(txt); dur = max(e - s, n / FPS)
        times += [s + dur * (j / n) * 0.85 for j in range(n)]
    return times


def draw_text(layer, line, ox, cy, upto=None, color=255, chars=None, alpha=None):
    """Draw line onto a PIL 'L' layer. chars: optional set of char indices to draw; alpha: per-char intensity list"""
    d = ImageDraw.Draw(layer); y = cy - line.cap / 2 - line.top
    n = len(line.text) if upto is None else upto
    for i in range(n):
        if chars is not None and i not in chars: continue
        c = line.text[i]
        if c == " ": continue
        a = color if alpha is None else int(color * alpha[i])
        if a <= 0: continue
        d.text((ox + line.x[i], y), c, font=line.f, fill=a)


def count_revealed(times, t):
    return sum(1 for x in times if x <= t)


def composite_text(pic, layer_l, color=WHITE, fringe=2):
    m = np.asarray(layer_l, np.float32)[..., None] / 255.0
    if fringe:
        mr = np.roll(m, fringe, axis=1); mb = np.roll(m, -fringe, axis=1)
        col = np.concatenate([mr * color[0], m * color[1], mb * color[2]], axis=2)
        mm = np.maximum(np.maximum(m, mr), mb)
    else:
        col = m * np.array(color, np.float32); mm = m
    out = pic.astype(np.float32) * (1 - mm) + col
    return np.clip(out, 0, 255).astype(np.uint8)


def new_layer():
    return Image.new("L", (W, PH), 0)


# ---- pixel brackets (cell size 34): top-left "7" and bottom-right step
CELL = 34
TL_CELLS = [(0, 0), (1, 0), (1, 1)]
BR_CELLS = [(1, 0), (2, 0), (0, 1), (1, 1)]


def draw_brackets(pic, x0, y0, x1, y1, fi, glitch=0.0, alpha=1.0, color=(236, 236, 232)):
    r = random.Random(fi * 31)
    out = pic.astype(np.float32)
    for (cells, bx, by) in [(TL_CELLS, x0, y0), (BR_CELLS, x1, y1)]:
        for (cx, cy) in cells:
            if glitch and r.random() < glitch * 0.5: continue
            ox = bx + cx * CELL + (r.randint(-14, 14) if glitch else 0); oy = by + cy * CELL
            xa, ya = int(ox), int(oy)
            if xa < 0 or ya < 0 or xa + CELL > W or ya + CELL > PH: continue
            blk = np.ones((CELL, CELL, 1), np.float32)
            blk[1::3] *= 0.86  # faint scanline texture
            c = np.array(color, np.float32) * alpha
            out[ya:ya + CELL, xa:xa + CELL] = out[ya:ya + CELL, xa:xa + CELL] * (1 - alpha) + blk * c
            if glitch:  # RGB fringe
                out[ya:ya + CELL, max(0, xa - 4):xa, 0] += 120 * alpha
                out[ya:ya + CELL, xa + CELL:min(W, xa + CELL + 4), 2] += 120 * alpha
    return np.clip(out, 0, 255).astype(np.uint8)


# =============================================================== cards
WL = {k: vo_words(k) for k in VO_START}


def wt(k, i, which=1):  # word time
    return WL[k][i][which]


CY = PH // 2  # text centre line in picture coordinates


def card_L1(fi, t):
    pic = np.full((PH, W, 3), BLACK, np.uint8)
    base = "THEY SAID ADVERTISING WAS RULED BY "
    words = ["THEY", "SAID", "ADVERTISING", "WAS", "RULED", "BY"]
    segs = [(w, wt("l1", i, 1), wt("l1", i, 2)) for i, w in enumerate(words)]
    segs.append(("INSTINCT", wt("l1", 6, 1), wt("l1", 6, 2)))
    times = typed_times(segs)
    swaps = [("GUT", wt("l1", 8, 1)), ("BUDGET", wt("l1", 9, 1)), ("LUCK", wt("l1", 11, 1))]
    last, prev, t_sw = "INSTINCT", None, None
    for wd, ts in swaps:
        if t >= ts - 0.04: prev, last, t_sw = last, wd, ts
    ox = 203
    luck_t = swaps[-1][1]
    line = Line(base + last, 84)
    layer = new_layer()
    if last == "INSTINCT":
        n = count_revealed(times, t); draw_text(layer, line, ox, CY, upto=n)
    else:
        draw_text(layer, Line(base, 84), ox, CY)
        k = (t - t_sw) / 0.30
        if k < 1 and last != "LUCK":  # scramble swap
            scramble(layer, Line(base + prev, 84), line, len(base), ox, CY, fi)
        elif last == "LUCK" and t < luck_t + 0.12:
            scramble(layer, Line(base + prev, 84), line, len(base), ox, CY, fi)
        else:
            draw_text(layer, line, ox, CY, chars=set(range(len(base), len(line.text))))
    arr = np.asarray(layer)
    # defocus right before LUCK, punch-in on LUCK
    if luck_t - 0.14 <= t < luck_t + 0.04:
        arr = cv2.GaussianBlur(arr, (0, 0), 6)
    if t >= luck_t + 0.04:
        s = 2.05 + 0.08 * (t - luck_t)
        end_x = ox + line.width
        tx = 1720 - end_x * s
        M = np.array([[s, 0, tx], [0, s, CY - CY * s]], np.float32)
        arr = cv2.warpAffine(arr, M, (W, PH), flags=cv2.INTER_NEAREST)
        tl = t - (luck_t + 0.55)
        if 0 <= tl < 0.16:  # skew glitch on LUCK
            sh = np.array([[1, -0.35, 0.35 * CY], [0, 1, 0]], np.float32)
            right = cv2.warpAffine(arr, sh, (W, PH)); arr = arr.copy(); arr[:, 1100:] = right[:, 1100:]
    return composite_text(pic, Image.fromarray(arr)), dict(grain=3.5)


def scramble(layer, old, new, start, ox, cy, fi):
    """glitchy swap of the tail word: horizontal bands alternately from old/new, offset and flipped."""
    r = random.Random(fi * 13)
    a = new_layer(); b = new_layer()
    draw_text(a, old, ox, cy, chars=set(range(start, len(old.text))))
    draw_text(b, new, ox, cy, chars=set(range(start, len(new.text))))
    A_, B_ = np.asarray(a), np.asarray(b); out = np.asarray(layer).copy()
    y0 = int(cy - 60); y = y0
    while y < cy + 60:
        hgt = r.randint(4, 14); src = A_ if r.random() < 0.5 else B_
        band = src[y:y + hgt]
        if r.random() < 0.35: band = band[::-1]
        dx = r.randint(-22, 22); dy = r.randint(-18, 18)
        tgt = np.roll(band, dx, axis=1)
        yy = min(max(y + dy, 0), PH - hgt)
        out[yy:yy + len(tgt)] = np.maximum(out[yy:yy + len(tgt)], tgt)
        y += hgt
    layer.paste(Image.fromarray(out))


def tiles_layer(pic, t, t_on, dim=0.55, green=0.0):
    r = random.Random(5)
    for k, (dx, dy, src, tin) in enumerate(TILES):
        ton = t_on + 0.10 * k
        if t < ton: continue
        tw, th = 210, 176
        if src.endswith(".png"):
            im = cv2.resize(crop_rect(load_png(src), 1100, 560, 900, out=(tw, th)), (tw, th))
        else:
            fr = Footage.frames(src, tin, 140, size=(tw, th))
            im = fr[min(139, int((t - ton) * FPS))]
        im = grade(im).astype(np.float32) * dim
        if green:
            g = im.mean(axis=2, keepdims=True)
            im = im * (1 - green) + g * np.array([0.25, 1.15, 0.45]) * green
        x0 = int(W / 2 + dx - tw / 2); y0 = int(CY + dy - th / 2)
        pic[y0:y0 + th, x0:x0 + tw] = np.clip(im, 0, 255).astype(np.uint8)
        if t - ton < 0.08:  # pop-in flash outline
            cv2.rectangle(pic, (x0, y0), (x0 + tw, y0 + th), (230, 230, 230), 2)
    return pic


_rain_cols = None


def code_rain(t, alpha):
    global _rain_cols
    layer = new_layer(); d = ImageDraw.Draw(layer); f = font(26)
    if _rain_cols is None:
        r = random.Random(3)
        _rain_cols = [(x, r.uniform(80, 260), r.uniform(0, 900), r.randint(8, 26)) for x in range(10, W, 30) if r.random() < 0.75]
    chars = "01ABCDEF<>/{}[]=+*#$%@&ADGRMXZ"
    for (x, speed, off, ln) in _rain_cols:
        head = (off + speed * t * 3) % (PH + ln * 26) - ln * 26
        for j in range(ln):
            y = head - j * 26
            if 0 <= y < PH:
                c = chars[(int(x * 7 + j * 13 + t * 12)) % len(chars)]
                d.text((x, y), c, font=f, fill=int(255 * alpha * (1 - j / ln) ** 1.4))
    return np.asarray(layer, np.float32)[..., None] / 255.0


def card_machines(fi, t):
    pic = np.full((PH, W, 3), CHAR, np.uint8)
    t_l2 = wt("l2", 0, 1); t_l3 = wt("l3", 0, 1)
    if t < 13.50:  # rainbow "T" blink
        layer = new_layer(); ln = Line("T", 72); draw_text(layer, ln, 760, CY)
        return composite_text(pic, layer, color=(255, 120, 220), fringe=7), dict(grain=4)
    algo = t >= t_l3 - 0.05
    green = ease((t - (t_l3 - 0.05)) / 0.2) if algo else 0.0
    pic = tiles_layer(pic, t, 13.56, dim=0.55, green=green)
    # brackets
    l2 = Line("THEN CAME THE MACHINES", 72); ox = (W - l2.width) / 2
    bx0, by0 = ox - 2.6 * CELL, CY - 2.4 * CELL; bx1, by1 = ox + l2.width + 0.6 * CELL, CY + 0.6 * CELL
    gl = 1.0 if t < 13.62 else 0.0
    pic = draw_brackets(pic, bx0, by0, bx1, by1, fi, glitch=gl)
    layer = new_layer()
    if not algo:
        segs = [(w, wt("l2", i, 1), wt("l2", i, 2)) for i, w in enumerate(["THEN", "CAME", "THE", "MACHINES"])]
        n = count_revealed(typed_times(segs), t); draw_text(layer, l2, ox, CY, upto=n)
        arr = np.asarray(layer)
        if t >= t_l3 - 0.30:  # slice + skew glitch before swap
            arr = slice_h(arr, fi)
        layer = Image.fromarray(arr)
    else:
        la = Line("ALGORITHMS", 72); oxa = (W - la.width) / 2
        times = typed_times([("ALGORITHMS", wt("l3", 0, 1), wt("l3", 0, 2))])
        draw_text(layer, la, oxa, CY, upto=max(3, count_revealed(times, t)))
    if algo:
        k = (t - (t_l3 - 0.05)) / 0.18
        if k < 1:  # green pixel-mosaic dissolve
            bs = 28; sm = cv2.resize(pic, (W // bs, PH // bs), interpolation=cv2.INTER_AREA)
            mos = cv2.resize(sm, (W, PH), interpolation=cv2.INTER_NEAREST).astype(np.float32)
            mos *= np.array([0.3, 1.3, 0.4]); r = np.random.default_rng(fi)
            m = (r.random((PH // bs + 1, W // bs + 1)) < (1 - k)).repeat(bs, 0).repeat(bs, 1)[:PH, :W, None]
            pic = np.where(m, np.clip(mos, 0, 255), pic).astype(np.uint8)
        rain = code_rain(t, 0.45 * green)
        pic = np.clip(pic.astype(np.float32) * (1 - rain * 0.2) + rain * np.array([60, 230, 90]), 0, 255).astype(np.uint8)
    out = composite_text(pic, layer)
    if t >= 18.40:  # horizontal smear exit
        out = hsmear(out, (t - 18.40) / 0.32)
    return out, dict(grain=4)


def slice_h(arr, fi):
    r = random.Random(fi); out = arr.copy(); y = 0
    while y < PH:
        h = r.randint(3, 12)
        if r.random() < 0.5: out[y:y + h] = np.roll(arr[y:y + h], r.randint(-40, 40), axis=1)
        y += h
    sh = np.array([[1, -0.25, 0.25 * CY], [0, 1, 0]], np.float32)
    if r.random() < 0.5: out = cv2.warpAffine(out, sh, (W, PH))
    return out


def card_models(fi, t):
    pic = np.full((PH, W, 3), CHAR, np.uint8)
    t0 = wt("l4", 0, 1); tc = wt("l4", 2, 1)
    full = Line("MODELS CREATE", 72); ox = (W - full.width) / 2
    layer = new_layer()
    if t < t0: return pic, dict(grain=4)
    if t < tc:
        draw_text(layer, Line("MODELS", 72), ox, CY)
        k = (t - t0) / 0.24
        arr = np.asarray(layer)
        if k < 1:  # resolve from pixel noise
            bs = max(1, int(16 * (1 - k)))
            sm = cv2.resize(arr, (W // max(bs, 1), PH // max(bs, 1)), interpolation=cv2.INTER_AREA)
            arr = cv2.resize(sm, (W, PH), interpolation=cv2.INTER_NEAREST)
            arr = (arr.astype(np.float32) * (0.45 + 0.55 * k)).astype(np.uint8)
        return composite_text(pic, Image.fromarray(arr)), dict(grain=4)
    draw_text(layer, full, ox, CY)
    arr = np.asarray(layer)
    if t < tc + 0.2:  # overlap glitch
        ghost = np.roll(arr, -int(140 * (1 - (t - tc) / 0.2)), axis=1)
        arr = np.maximum(arr, (ghost * 0.6).astype(np.uint8))
        arr = slice_h(arr, fi)
    return composite_text(pic, Image.fromarray(arr)), dict(grain=4)


def strobe_pattern(i):
    pat = "WWDDWWDWDDWWDWDDWD"
    return pat[i % len(pat)]


def card_L5(fi, t):
    pic = np.full((PH, W, 3), CHAR, np.uint8)
    la = Line("FROM MAD MEN TO MIDJOURNEY", 72); lb = Line("FROM BRIEFS TO PROMPTS", 72)
    wmax = max(la.width, lb.width); ox = (W - wmax) / 2
    bx0, by0 = ox - 2.6 * CELL, CY - 2.4 * CELL; bx1, by1 = ox + wmax + 0.6 * CELL, CY + 0.6 * CELL
    t_b = wt("l5", 5, 1)
    strobe0 = 32.88
    if t >= strobe0:  # strobe decoder
        i = int(round((t - strobe0) * FPS)); white = strobe_pattern(i) == "W"
        pic = np.full((PH, W, 3), (236, 236, 232) if white else (16, 18, 20), np.uint8)
        pic = draw_brackets(pic, bx0, by0, bx1, by1, fi, color=(150, 150, 150) if white else (110, 110, 110))
        layer = new_layer(); draw_text(layer, lb, ox, CY, color=150 if not white else 255)
        hi = [k for k, c in enumerate(lb.text) if c != " "][min(i, len(lb.text.replace(" ", "")) - 1)]
        m = np.asarray(layer, np.float32)[..., None] / 255.0
        if white:
            out = pic.astype(np.float32) * (1 - m * 0.45)
        else:
            out = pic.astype(np.float32) * (1 - m) + m * 150
        hl = new_layer(); draw_text(hl, lb, ox, CY, chars={hi})
        hm = np.asarray(hl, np.float32)[..., None] / 255.0
        glow = cv2.GaussianBlur(np.asarray(hl, np.float32), (0, 0), 22)[..., None] / 255.0
        if white:
            out = out * (1 - hm) + hm * 10; out = out * (1 - np.clip(glow * 2.2, 0, 0.8))
        else:
            out = out * (1 - hm) + hm * 255 + glow * np.array([90, 170, 255]) * 3.0
        return np.clip(out, 0, 255).astype(np.uint8), dict(grain=5)
    pic = draw_brackets(pic, bx0, by0, bx1, by1, fi, glitch=1.0 if t < 27.52 else 0.0)
    layer = new_layer()
    if t < t_b - 0.5:
        segs = [(w, wt("l5", i, 1), wt("l5", i, 2)) for i, w in enumerate(["FROM", "MAD", "MEN", "TO", "MIDJOURNEY"])]
        n = count_revealed(typed_times(segs), t); draw_text(layer, la, ox, CY, upto=n)
        out = composite_text(pic, layer)
        if t >= t_b - 1.0:  # heavy glitch-out
            k = (t - (t_b - 1.0)) / 0.5
            out = glitch_out(out, fi, k)
        return out, dict(grain=4)
    if t < t_b:
        return np.full((PH, W, 3), (12, 13, 13), np.uint8), dict(grain=5)
    segs = [(w, wt("l5", 5 + i, 1), wt("l5", 5 + i, 2)) for i, w in enumerate(["FROM", "BRIEFS", "TO", "PROMPTS"])]
    n = count_revealed(typed_times(segs), t); draw_text(layer, lb, ox, CY, upto=n)
    return composite_text(pic, layer), dict(grain=4)


def glitch_out(img, fi, k):
    r = random.Random(fi * 3); out = img.copy()
    for _ in range(int(6 + 14 * k)):
        y = r.randint(0, PH - 40); h = r.randint(10, 70); dx = r.randint(-120, 120)
        out[y:y + h] = np.roll(out[y:y + h], dx, axis=1)
    out = chroma(out, int(6 + 18 * k))
    dup = np.roll(out, (r.randint(-8, 8), r.randint(-40, 40)), axis=(0, 1))
    out = np.maximum(out, (dup * 0.5).astype(np.uint8))
    out[::3] = (out[::3] * 0.6).astype(np.uint8)  # dithered scanlines
    return (out.astype(np.float32) * (1 - 0.85 * max(0, k - 0.5) * 2)).astype(np.uint8)


_logos = None


def logos():
    global _logos
    if _logos is None:
        _logos = []
        for n in LOGOS:
            im = cv2.imread(os.path.join(A, "logos_png", n + ".png"), cv2.IMREAD_UNCHANGED)
            im = cv2.resize(im, (150, 150), interpolation=cv2.INTER_AREA)
            _logos.append((cv2.cvtColor(im[..., :3], cv2.COLOR_BGR2RGB).astype(np.float32), im[..., 3:4].astype(np.float32) / 255.0))
    return _logos


def card_L6(fi, t):
    pic = np.full((PH, W, 3), CHAR, np.uint8)
    la = Line("NOW A NEW CREATIVE DEPARTMENT EMERGES", 72); lb = Line("BUILT NOT BY AGENCIES", 72)
    ox = (W - la.width) / 2; oxb = ox
    spacing = 215; xs = [W / 2 + (i - 2.5) * spacing for i in range(6)]
    bx0, by0 = xs[0] - 110, CY - 2.4 * CELL; bx1, by1 = xs[-1] + 40, CY + 0.6 * CELL
    t_built = wt("l6", 6, 1); t_but = wt("l6", 10, 1); t_ai = wt("l6", 12, 1)
    del0 = wt("l6", 5, 2) + 0.15
    pic = draw_brackets(pic, bx0, by0, bx1, by1, fi, glitch=1.0 if t < 39.50 else 0.0)
    layer = new_layer()
    if t < del0:
        segs = [(w, wt("l6", i, 1), wt("l6", i, 2)) for i, w in enumerate(["NOW", "A", "NEW", "CREATIVE", "DEPARTMENT", "EMERGES"])]
        draw_text(layer, la, ox, CY, upto=count_revealed(typed_times(segs), t))
    elif t < t_built:  # backspace
        n = max(0, len(la.text) - int((t - del0) * FPS * 4))
        draw_text(layer, la, ox, CY, upto=n)
    elif t < t_but - 0.25:
        segs = [(w, wt("l6", 6 + i, 1), wt("l6", 6 + i, 2)) for i, w in enumerate(["BUILT", "NOT", "BY", "AGENCIES"])]
        draw_text(layer, lb, oxb, CY, upto=count_revealed(typed_times(segs), t))
    else:  # dissolve to grey from the right, logos stutter in
        k = (t - (t_but - 0.25)) / 0.35
        n = len(lb.text); alpha = [max(0.0, min(1.0, 1 - (k * 1.6 - (n - i) / n))) * 0.6 for i in range(n)]
        draw_text(layer, lb, oxb, CY, alpha=alpha)
    out = composite_text(pic, layer)
    t_log0 = t_but - 0.05
    if t >= t_log0:
        i = int((t - t_log0) * FPS)
        n_on = 1 if t < t_log0 + 0.30 else min(6, 1 + int((t - t_log0 - 0.30) / ((t_ai - t_log0 - 0.30) / 5)))
        if t >= t_ai: n_on = 6
        blank = (t < t_ai) and (i % 3 == 2) and t > t_log0 + 0.3
        if not blank:
            out = draw_logos(out, xs, n_on, fi, fade=min(1.0, (t - t_log0) / 0.25))
        if t >= t_ai: out = draw_brackets(out, bx0, by0, bx1, by1, fi)
    return out, dict(grain=4)


def draw_logos(pic, xs, n_on, fi, fade=1.0):
    L = logos(); acc = np.zeros((PH, W, 3), np.float32); am = np.zeros((PH, W, 1), np.float32)
    r = random.Random(fi)
    for i in range(n_on):
        rgb, a = L[i]; x0 = int(xs[i] - 75); y0 = int(CY - 75 - 6)
        fl = 1.0 if r.random() > 0.08 else 0.6
        acc[y0:y0 + 150, x0:x0 + 150] += rgb * a * fl; am[y0:y0 + 150, x0:x0 + 150] = np.maximum(am[y0:y0 + 150, x0:x0 + 150], a * fl)
    glow = cv2.GaussianBlur(acc, (0, 0), 26)
    out = pic.astype(np.float32) * (1 - am * fade) + acc * fade + glow * 0.9 * fade
    out = out + cv2.GaussianBlur(acc, (0, 0), 70) * 0.35 * fade
    return chroma(np.clip(out, 0, 255).astype(np.uint8), 2)


def card_title(fi, t):
    pic = np.full((PH, W, 3), BLACK, np.uint8)
    t0 = 51.60; t_lock = 52.08; t_fade = 58.0
    if t < t0: return pic, dict(grain=3)
    big = Line("AI IN ADVERTISING", 168); ox = (W - big.width) / 2; cy = CY + 30
    layer = new_layer(); draw_text(layer, big, ox, cy)
    d = ImageDraw.Draw(layer); ft = font_thin(64); pw = ft.getlength("Presenting")
    d.text(((W - pw) / 2, cy - big.cap / 2 - 112), "Presenting", font=ft, fill=225)
    arr = np.asarray(layer).astype(np.float32)
    if t < t_lock:  # light-streak wipe, revealing right-to-left with horizontal pixel stretch
        k = (t - t0) / (t_lock - t0)
        reveal_x = W - (W + 300) * ease(k)
        a2 = arr.copy(); a2[:, :int(max(0, reveal_x))] = 0
        stretch = cv2.resize(arr[:, int(W * 0.25):int(W * 0.75)], (W, PH), interpolation=cv2.INTER_NEAREST)
        a2 = np.maximum(a2, stretch * (1 - k) * 0.5 * (np.arange(W)[None, :] < reveal_x))
        bar = np.zeros_like(arr); yb = int(cy - 14)
        bx_end = int(max(0, reveal_x)); bar[yb - 10:yb + 40, max(0, bx_end - 900):bx_end] = 255
        arr = np.maximum(a2, bar * (1 - k))
    elif t >= t_fade:
        arr *= max(0.0, 1 - (t - t_fade) / 0.8) * 0.75 + 0.0
    else:
        arr *= 0.93 + 0.07 * random.Random(fi).random()
    return composite_text(pic, Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))), dict(grain=3)


CARDS = [  # (start, end, fn)
    (2.40, 11.04, card_L1), (13.44, 18.72, card_machines), (18.72, 19.68, None), (19.68, 21.60, card_models),
    (27.36, 33.60, card_L5), (39.36, 48.96, card_L6), (51.36, 58.80, card_title),
]


# =============================================================== frame assembly
def find(lst, t):
    for it in lst:
        if it[0] <= t < it[1]: return it
    return None


_prev = {}


def render_frame(fi):
    t = fi / FPS
    out = np.zeros((H, W, 3), np.uint8)
    card = find(CARDS, t); shot = find(SHOTS, t)
    look = dict(grain=5.5, vhs=0.8, chroma=3)
    if card is not None:
        if card[2] is None: pic = np.zeros((PH, W, 3), np.uint8); look = dict(grain=2, vhs=0.0, chroma=0)
        else:
            pic, lk = card[2](fi, t); look.update(lk); look.update(vhs=1.0, chroma=0)
    elif shot is not None:
        pic = shot_plate(fi, shot); pic = vignette(pic)
    elif t >= 58.80:
        pic = np.full((PH, W, 3), CHAR, np.uint8); look = dict(grain=4, vhs=1.2, chroma=0)
    else:
        pic = np.full((PH, W, 3), BLACK, np.uint8); look = dict(grain=3, vhs=0.6, chroma=0)
    fx = find(FX, t)
    if fx is not None and card is None:
        kind = fx[2]; k = (t - fx[0]) / (fx[1] - fx[0])
        if kind == "black": pic = np.full((PH, W, 3), BLACK, np.uint8)
        elif kind == "slice": pic = slice_glitch(pic, fi)
        elif kind == "mosh": pic = mosh(pic, _prev.get("pic"), fi, k)
        elif kind == "rgbhit": look["chroma"] = 14
    pic = chroma(pic, look.get("chroma", 0))
    pic = vhs(pic, fi, look.get("vhs", 1.0), look.get("grain", 4))
    _prev["pic"] = pic
    out[PY0:PY0 + PH] = pic
    return out


def render_range(a, b, path):
    for fi in range(max(0, a - 3), a): render_frame(fi)  # warm prev-frame state
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                          "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
    for fi in range(a, b):
        p.stdin.write(render_frame(fi).tobytes())
    p.stdin.close(); p.wait()
    return path


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "stills":
        os.makedirs(os.path.join(B, "stills"), exist_ok=True)
        for s in sys.argv[2:]:
            fi = int(s); img = render_frame(fi)
            cv2.imwrite(os.path.join(B, "stills", f"f{fi:05d}.jpg"), cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
            print("still", fi)
    elif mode == "video":
        import multiprocessing as mp
        nw = int(sys.argv[2]) if len(sys.argv) > 2 else 4
        a = int(sys.argv[3]) if len(sys.argv) > 3 else 0; b = int(sys.argv[4]) if len(sys.argv) > 4 else NF
        cuts = [a + (b - a) * i // nw for i in range(nw + 1)]
        parts = [os.path.join(B, f"part{i}.mp4") for i in range(nw)]
        with mp.Pool(nw) as pool:
            pool.starmap(render_range, [(cuts[i], cuts[i + 1], parts[i]) for i in range(nw)])
        lst = os.path.join(B, "parts.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", os.path.join(B, "picture.mp4")], check=True)
        print("picture.mp4 done")

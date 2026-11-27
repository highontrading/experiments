"""Blue Glow pre-rendered assets (PIL -> PNG-in-MOV with alpha).

scene(path, dur)      navy grid "graphic scene" that pushes in from the top and leaves upward (vertical motion blur)
icon_row(path, ...)   glowing line icons + labels popping in on cue, fading out together
glass_cards(path,...) two frosted tilted cards + neon light-trail arc, slide out with motion blur
"""
import math
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FPS = 30
W, H = 1080, 1920
FONT_DIR = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/library/fonts"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


def ease_io(p):
    p = max(0.0, min(1.0, p))
    return 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2


def ease_out(p):
    p = max(0.0, min(1.0, p))
    return 1 - (1 - p) ** 3


def back_out(p, s=1.6):
    p = max(0.0, min(1.0, p)) - 1
    return 1 + (s + 1) * p ** 3 + s * p ** 2


class Writer:
    def __init__(self, path, w, h):
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}",
                                   "-r", str(FPS), "-i", "-", "-c:v", "png", "-pix_fmt", "rgba", path],
                                  stdin=subprocess.PIPE)

    def write(self, im):
        self.p.stdin.write(im.tobytes())

    def close(self):
        self.p.stdin.close()
        self.p.wait()


def comp(dst, src, x, y):
    """alpha_composite that tolerates negative / out-of-frame positions."""
    x, y = int(x), int(y)
    sx0, sy0 = max(0, -x), max(0, -y)
    dx0, dy0 = max(0, x), max(0, y)
    w = min(src.width - sx0, dst.width - dx0)
    h = min(src.height - sy0, dst.height - dy0)
    if w <= 0 or h <= 0:
        return
    dst.alpha_composite(src.crop((sx0, sy0, sx0 + w, sy0 + h)), (dx0, dy0))


def vblur(arr, r):
    """Vertical box blur on an HxWx4 uint8 array (motion blur)."""
    if r < 1:
        return arr
    r = int(r)
    a = arr.astype(np.float32)
    c = np.cumsum(np.pad(a, ((r + 1, r), (0, 0), (0, 0)), mode="edge"), axis=0)
    out = (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)
    return out[:arr.shape[0]].clip(0, 255).astype(np.uint8)


def hblur(arr, r):
    return vblur(arr.transpose(1, 0, 2), r).transpose(1, 0, 2)


# ----------------------------------------------------------------------------- scene background

def _petal_shape(size, c1=(70, 175, 255), c2=(20, 80, 200)):
    """Glossy 6-petal 3D-ish asterisk sprite (RGBA)."""
    S = size
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    for k in range(6):
        petal = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(petal)
        pw, ph = S * 0.30, S * 0.46
        cx = S / 2
        # vertical gradient petal
        for i in range(int(ph)):
            t = i / ph
            col = tuple(int(c1[j] * (1 - t) + c2[j] * t) for j in range(3)) + (255,)
            half = pw / 2 * (0.75 + 0.25 * math.sin(math.pi * min(1, t * 1.2)))
            d.line([(cx - half, S / 2 - ph + i), (cx + half, S / 2 - ph + i)], fill=col)
        petal = petal.filter(ImageFilter.GaussianBlur(S * 0.012))
        im.alpha_composite(petal.rotate(k * 60, resample=Image.BICUBIC))
    hl = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(hl).ellipse([S * 0.38, S * 0.2, S * 0.52, S * 0.34], fill=(200, 240, 255, 120))
    im.alpha_composite(hl.filter(ImageFilter.GaussianBlur(S * 0.03)))
    return im


def scene_bg():
    y = np.linspace(0, 1, H)[:, None]
    top = np.array([3, 62, 133]); mid = np.array([5, 39, 93]); bot = np.array([4, 12, 34])
    col = np.zeros((H, W, 3), np.float32)
    yy = np.linspace(0, 1, H)
    for i, t in enumerate(yy):
        if t < 0.45:
            c = top + (mid - top) * (t / 0.45)
        else:
            c = mid + (bot - mid) * ((t - 0.45) / 0.55)
        col[i, :, :] = c
    # light cone from top centre
    xs = np.linspace(-1, 1, W)[None, :]
    ys = np.linspace(0, 1, H)[:, None]
    cone = np.exp(-((xs * 1.1) ** 2) / (0.08 + 0.5 * ys)) * np.exp(-ys * 2.2)
    col += cone[..., None] * np.array([40, 90, 160])
    im = Image.fromarray(col.clip(0, 255).astype(np.uint8), "RGB").convert("RGBA")
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(grid)
    step = 54
    for x in range(0, W, step):
        d.line([(x, 0), (x, H)], fill=(160, 200, 255, 16), width=1)
    for yv in range(0, H, step):
        d.line([(0, yv), (W, yv)], fill=(160, 200, 255, 16), width=1)
    im.alpha_composite(grid)
    return im


def smooth(p):
    p = max(0.0, min(1.0, p))
    return p * p * (3 - 2 * p)


def scene(path, dur, push=0.3, exit_push=True, lead=0.3):
    """lead: seconds of fully transparent frames first (absorbs the overlay's alpha fade-in)."""
    bg = scene_bg()
    s1 = _petal_shape(520).filter(ImageFilter.GaussianBlur(10))
    s2 = _petal_shape(360).filter(ImageFilter.GaussianBlur(16))
    n = int(round(dur * FPS))
    wr = Writer(path, W, H)
    blank = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for _ in range(int(round(lead * FPS))):
        wr.write(blank)
    for f in range(n):
        t = f / FPS
        fr = bg.copy()
        a1 = s1.rotate(-12 * t, resample=Image.BICUBIC)
        a2 = s2.rotate(9 * t + 20, resample=Image.BICUBIC)
        comp(fr, a1, *(int(W * 0.80 - 260 + 14 * math.sin(t * 0.7)), int(H * 0.70 - 260 - 10 * t)))
        comp(fr, a2, *(int(-W * 0.08 + 8 * math.sin(t)), int(H * 0.16 - 180 + 6 * t)))
        off, blur = 0, 0
        if t < push:
            p = smooth(t / push)
            off = -H * (1 - p)
            blur = 60 * math.sin(math.pi * p)
        elif exit_push and t > dur - push:
            p = smooth((t - (dur - push)) / push)
            off = -H * p
            blur = 60 * math.sin(math.pi * p)
        if off or blur:
            canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            comp(canvas, fr, 0, off)
            arr = vblur(np.asarray(canvas), blur)
            fr = Image.fromarray(arr, "RGBA")
        wr.write(fr)
    wr.close()


# ----------------------------------------------------------------------------- icons

def _glow(layer, radius, strength=1.6):
    g = layer.filter(ImageFilter.GaussianBlur(radius))
    a = np.asarray(g).copy()
    a[..., 3] = (a[..., 3].astype(np.float32) * strength).clip(0, 255).astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def draw_icon(kind, color, S=160):
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    w = max(4, S // 22)
    c = color + (255,)
    if kind == "wood":  # plank with grain
        d.rounded_rectangle([S * .16, S * .28, S * .84, S * .72], radius=S * .08, outline=c, width=w)
        for k, yy in enumerate((0.40, 0.50, 0.60)):
            pts = [(S * (0.24 + i * 0.04), S * (yy + 0.025 * math.sin(i * 0.9 + k))) for i in range(14)]
            d.line(pts, fill=c, width=max(2, w // 2))
        d.ellipse([S * .58, S * .44, S * .70, S * .56], outline=c, width=max(2, w // 2))
    elif kind == "leaf":
        pts = []
        for i in range(41):
            t = i / 40
            pts.append((t, 0.36 * math.sin(math.pi * t) ** 0.85))
        outline = pts + [(x, -y) for (x, y) in reversed(pts)]
        ang = math.radians(-45)
        def tr(x, y):
            x, y = (x - 0.5) * 0.78, y * 0.78
            return (S * (0.5 + x * math.cos(ang) - y * math.sin(ang)), S * (0.5 + x * math.sin(ang) + y * math.cos(ang)))
        d.line([tr(x, y) for x, y in outline], fill=c, width=w, joint="curve")
        d.line([tr(-0.12, 0), tr(0.85, 0)], fill=c, width=w)
        for k in (0.3, 0.5, 0.7):
            d.line([tr(k, 0), tr(k + 0.12, 0.17)], fill=c, width=max(2, w // 2))
            d.line([tr(k, 0), tr(k + 0.12, -0.17)], fill=c, width=max(2, w // 2))
    elif kind == "logs":
        for (x, y) in ((.33, .62), (.67, .62), (.5, .34)):
            r = S * .17
            d.ellipse([S * x - r, S * y - r, S * x + r, S * y + r], outline=c, width=w)
            r2 = r * .45
            d.ellipse([S * x - r2, S * y - r2, S * x + r2, S * y + r2], outline=c, width=max(2, w // 2))
    elif kind == "cube":
        cx, cy, r = S * .5, S * .5, S * .32
        top = [(cx, cy - r), (cx + r * .87, cy - r * .5), (cx, cy), (cx - r * .87, cy - r * .5)]
        d.polygon(top, outline=c, width=w)
        d.line([(cx - r * .87, cy - r * .5), (cx - r * .87, cy + r * .5), (cx, cy + r), (cx + r * .87, cy + r * .5),
                (cx + r * .87, cy - r * .5)], fill=c, width=w, joint="curve")
        d.line([(cx, cy), (cx, cy + r)], fill=c, width=w)
        for k in range(5):  # speckles (micro cement)
            px, py = cx - r * .45 + k * r * .22, cy + r * .2 + (k % 2) * r * .22
            d.ellipse([px - 3, py - 3, px + 3, py + 3], fill=c)
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    out.alpha_composite(_glow(im, S * .07, 2.2))
    out.alpha_composite(im)
    return out


def icon_row(path, items, dur, strip_h=480, fade_out=0.25):
    """items: [{"kind","color"(rgb),"label","t"(s rel)}] laid out evenly across the frame width."""
    n = len(items)
    S = 190
    lab_font = font("Poppins-SemiBold.ttf", 40)
    xs = [W * (0.5 + (i - (n - 1) / 2) * 0.19) for i in range(n)]
    sprites = []
    for it in items:
        ic = draw_icon(it["kind"], it["color"], S)
        lab = Image.new("RGBA", (360, 80), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lab)
        tw = ld.textlength(it["label"], font=lab_font)
        ld.text((180 - tw / 2, 10), it["label"], font=lab_font, fill=(255, 255, 255, 255))
        lab_g = Image.new("RGBA", lab.size, (0, 0, 0, 0))
        lab_g.alpha_composite(_glow(lab, 6, 1.3))
        lab_g.alpha_composite(lab)
        sp = Image.new("RGBA", (360, S + 90), (0, 0, 0, 0))
        sp.alpha_composite(ic, (180 - S // 2, 0))
        sp.alpha_composite(lab_g, (0, S + 4))
        sprites.append(sp)
    nf = int(round(dur * FPS))
    wr = Writer(path, W, strip_h)
    for f in range(nf):
        t = f / FPS
        fr = Image.new("RGBA", (W, strip_h), (0, 0, 0, 0))
        fo = 1.0
        if t > dur - fade_out:
            fo = max(0.0, (dur - t) / fade_out)
        for i, it in enumerate(items):
            lt = t - it["t"]
            if lt < 0:
                continue
            p = min(1.0, lt / 0.16)
            sc = max(0.05, back_out(p))
            sp = sprites[i]
            w_, h_ = max(2, int(sp.width * sc)), max(2, int(sp.height * sc))
            s2 = sp.resize((w_, h_), Image.BICUBIC)
            if p < 1:
                s2 = s2.filter(ImageFilter.GaussianBlur(6 * (1 - p)))
            a = np.asarray(s2).copy()
            a[..., 3] = (a[..., 3] * min(1.0, p * 1.5) * fo).astype(np.uint8)
            s2 = Image.fromarray(a, "RGBA")
            bob = 4 * math.sin(t * 2.2 + i)
            comp(fr, s2, xs[i] - w_ / 2, strip_h / 2 - h_ / 2 + bob)
        wr.write(fr)
    wr.close()


# ----------------------------------------------------------------------------- glass cards

def _card(title, sub, chip, w=470, h=300):
    S = 2
    w = max(w, int(ImageDraw.Draw(Image.new("RGB", (8, 8))).textlength(title, font=font("DMSerifDisplay-Regular.ttf", 82))) + 80)
    im = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i in range(h * S):  # vertical white->ice gradient
        t = i / (h * S)
        c = (int(250 - 18 * t), int(252 - 12 * t), 255, 232)
        d.line([(0, i), (w * S, i)], fill=c)
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w * S - 1, h * S - 1], radius=38 * S, fill=255)
    im.putalpha(Image.fromarray((np.asarray(mask) * (232 / 255)).astype(np.uint8)))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([1, 1, w * S - 2, h * S - 2], radius=38 * S, outline=(255, 255, 255, 255), width=3 * S)
    f_chip = font("Poppins-SemiBold.ttf", 26 * S)
    d.rounded_rectangle([34 * S, 30 * S, 34 * S + 74 * S, 30 * S + 40 * S], radius=20 * S, fill=(58, 142, 240, 255))
    tw = d.textlength(chip, font=f_chip)
    d.text((34 * S + 37 * S - tw / 2, 33 * S), chip, font=f_chip, fill=(255, 255, 255, 255))
    f_t = font("DMSerifDisplay-Regular.ttf", 82 * S)
    d.text((34 * S, 86 * S), title, font=f_t, fill=(11, 58, 107, 255))
    f_s = font("Poppins-SemiBold.ttf", 30 * S)
    d.text((38 * S, 200 * S), sub, font=f_s, fill=(110, 130, 150, 255))
    # mini accent bars
    for k in range(6):
        bh = (18 + 9 * ((k * 7) % 5)) * S
        x0 = (w - 200 + k * 26) * S
        d.rounded_rectangle([x0, (h - 40) * S - bh, x0 + 14 * S, (h - 40) * S], radius=7 * S, fill=(58, 142, 240, 230))
    im = im.resize((w, h), Image.LANCZOS)
    sh = Image.new("RGBA", (w + 120, h + 120), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([60, 76, 60 + w, 76 + h], radius=38, fill=(0, 20, 50, 110))
    sh = sh.filter(ImageFilter.GaussianBlur(22))
    gl = Image.new("RGBA", sh.size, (0, 0, 0, 0))
    ImageDraw.Draw(gl).rounded_rectangle([60, 60, 60 + w, 60 + h], radius=38, outline=(150, 220, 255, 200), width=8)
    sh.alpha_composite(gl.filter(ImageFilter.GaussianBlur(14)))
    sh.alpha_composite(im, (60, 60))
    return sh


def _bezier(p0, p1, p2, p3, n=60):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t ** 2 * p2[0] + t ** 3 * p3[0]
        y = (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t ** 2 * p2[1] + t ** 3 * p3[1]
        pts.append((x, y))
    return pts


def glass_cards(path, cards, dur, arc_t, exit_t):
    """cards: [{"title","sub","chip","x","y"(centre frac),"tilt"(deg),"t"(rel s),"side"(-1 left/+1 right)}]."""
    sprites = [_card(c["title"], c["sub"], c["chip"]) for c in cards]
    nf = int(round(dur * FPS))
    wr = Writer(path, W, H)
    c0, c1 = cards[0], cards[1]
    arc = _bezier((W * c0["x"] - 60, H * c0["y"] - 170), (W * 1.02, H * 0.55), (W * 0.98, H * 0.40),
                  (W * c1["x"] + 60, H * c1["y"] + 170))
    for f in range(nf):
        t = f / FPS
        fr = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ex = max(0.0, (t - exit_t) / 0.22) if t > exit_t else 0.0
        exe = ease_io(ex)
        # light trail arc
        if t > arc_t:
            pa = ease_out((t - arc_t) / 0.45)
            k = max(2, int(len(arc) * pa))
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(layer).line(arc[:k], fill=(70, 160, 255, int(255 * (1 - exe))), width=6, joint="curve")
            fr.alpha_composite(_glow(layer, 10, 2.0))
            fr.alpha_composite(layer)
        for i, c in enumerate(cards):
            lt = t - c["t"]
            if lt < 0:
                continue
            p = ease_out(min(1.0, lt / 0.22))
            sc = 0.86 + 0.14 * p
            ang = c["tilt"] + c["side"] * 14 * (1 - p) + 1.2 * math.sin(t * 1.6 + i)
            sp = sprites[i]
            s2 = sp.resize((int(sp.width * sc), int(sp.height * sc)), Image.BICUBIC).rotate(ang, expand=True,
                                                                                            resample=Image.BICUBIC)
            if p < 1:
                s2 = s2.filter(ImageFilter.GaussianBlur(10 * (1 - p)))
            a = np.asarray(s2).copy()
            a[..., 3] = (a[..., 3] * p).astype(np.uint8)
            dx = c["side"] * W * 0.9 * exe
            cx, cy = W * c["x"] + dx, H * c["y"] + 6 * math.sin(t * 1.3 + i * 2)
            if exe > 0:
                pad = np.zeros((a.shape[0], a.shape[1] + 200, 4), np.uint8)
                pad[:, 100:100 + a.shape[1]] = a
                a = hblur(pad, 50 * math.sin(math.pi * min(1, ex)))
            s2 = Image.fromarray(a, "RGBA")
            comp(fr, s2, cx - s2.width / 2, cy - s2.height / 2)
        wr.write(fr)
    wr.close()

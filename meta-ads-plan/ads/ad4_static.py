"""Ad 4 · AIA_OLDNEW_IMG_v1 · "The shoot is optional now." · static 4:5 + 9:16 (site style)"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import numpy as np, cv2
from PIL import Image, ImageDraw
import adkit as K

R = os.path.join(os.path.dirname(__file__), "..")
A = lambda *p: os.path.join(R, "assets", *p)
OUT = os.path.join(R, "out"); os.makedirs(OUT, exist_ok=True)

ROWS = [("Studio, photographer, stylist", "One product photo"),
        ("Cast and pay models per day", "Consistent AI models"),
        ("Crew, location, edit suite", "Image-to-video + voiceover"),
        ("Days to weeks", "The same day")]


def photo(src, t, w, h, fx=0.5, gray=False):
    f = K.decode(src, t, 0.05, w, h, fx)[0].astype(np.float32)
    if gray:   # muted, cinematic "old way" grade: mostly desaturated, warm, gentle vignette
        g = f.mean(axis=2, keepdims=True); f = g * 0.72 + f * 0.28
        f = (f - 128) * 1.12 + 128; f *= np.array([1.04, 1.0, 0.93])
        yy, xx = np.mgrid[0:h, 0:w]; v = 1 - 0.35 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) ** 1.2 / 2
        f *= v[..., None]
    return Image.fromarray(np.clip(f, 0, 255).astype(np.uint8))


def ai_grid(w, h, gap=6):
    """2x2 grid of studio AI outputs on an ink background"""
    S = {l.split()[0]: A(l.split()[1]) for l in open(A("studio", "index.txt"))}
    tiles = [(S["V13"], 0.4, 0.5), (S["V09"], 14.6, 0.62), (S["V11"], 9.4, 0.5), (A("drive", "O_BAka.mp4"), 13.6, 0.5)]
    tw, th = (w - gap) // 2, (h - gap) // 2
    im = Image.new("RGB", (w, h), K.INK)
    for k, (src, t, fx) in enumerate(tiles):
        r, c = divmod(k, 2)
        im.paste(Image.fromarray(K.decode(src, t, 0.05, tw, th, fx)[0]), (c * (tw + gap), r * (th + gap)))
    return im


def chips(im, x, y, w, h, words, bg):
    d = ImageDraw.Draw(im); f = K.mono(24); cx = x + 18; cy = y + h - 18 - 44
    for wd in words:
        tw = d.textlength(wd, font=f)
        if cx + tw + 24 > x + w - 12: break
        d.rectangle([cx, cy, cx + tw + 24, cy + 44], fill=bg, outline=K.INK, width=2)
        d.text((cx + 12, cy + 8), wd, font=f, fill=K.INK if bg != K.INK else K.WHITE); cx += tw + 24 + 8


def card(im, img, x, y, w, h, label, lab_bg):
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([x + 8, y + 8, x + w + 8, y + h + 8], 22, fill=(80, 70, 140))
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], 20, fill=255)
    im.paste(img, (x, y), m); d.rounded_rectangle([x, y, x + w, y + h], 20, outline=K.INK, width=3)
    f = K.mono(30); tw = d.textlength(label, font=f)
    d.rectangle([x + 18, y + 18, x + 18 + tw + 28, y + 18 + 52], fill=lab_bg, outline=K.INK, width=2)
    d.text((x + 32, y + 26), label, font=f, fill=K.INK if lab_bg != K.INK else K.WHITE)


def build(W, H, path):
    im = K.paper(W, H).convert("RGB"); d = ImageDraw.Draw(im)
    tall = H > W * 1.5
    y = int(H * (0.10 if tall else 0.04))
    f = K.mono(32); t = "IDEABRO STUDIO  ·  AI & ADVERTISING"; d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=K.INK); y += 70
    fs = 140 if tall else 116
    f = K.serif(fs); t = "The shoot is"; d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=K.INK); y += int(fs * 0.98)
    t = "optional now."; w = d.textlength(t, font=f); asc, desc = f.getmetrics(); x = (W - w) / 2
    d.rectangle([x - 20, y + 8, x + w + 20, y + asc + desc * 0.55], fill=K.PINK); d.text((x, y), t, font=f, fill=K.INK); y += int(fs * 1.22)
    # two photo cards
    cw = (W - 3 * 60) // 2; ch = int(cw * (1.32 if tall else 0.86))
    old = photo(A("stock", "50639.mp4"), 1.0, cw, ch, 0.46, gray=True)
    new = ai_grid(cw, ch)
    card(im, old, 60, y, cw, ch, "THE OLD WAY", K.WHITE); card(im, new, 120 + cw, y, cw, ch, "THE AI WAY", K.LIME)
    chips(im, 60, y, cw, ch, ["STUDIO", "CREW", "MODEL"], K.WHITE)
    chips(im, 120 + cw, y, cw, ch, ["1 PHOTO", "1 LAPTOP"], K.LIME)
    d = ImageDraw.Draw(im); y += ch + (56 if tall else 40)
    # comparison rows
    f1, f2 = K.mono(27 if tall else 25), K.mono(27 if tall else 25)
    rh = 74 if tall else 58
    for i, (a, b) in enumerate(ROWS):
        yy = y + i * rh
        d.line([(60, yy - 12), (W - 60, yy - 12)], fill=(200, 196, 182), width=2)
        d.text((60, yy), a, font=f1, fill=(130, 126, 118)); aw = d.textlength(a, font=f1)
        d.line([(60, yy + 18), (60 + aw, yy + 18)], fill=(150, 146, 138), width=2)          # struck through
        d.text((120 + cw, yy), "→ " + b, font=f2, fill=K.INK)
    y += len(ROWS) * rh + (30 if tall else 16)
    # CTA
    f = K.mono(46); cta = "Learn the AI way · ₹2,999  →"; w = K.tlen(d, cta, f); bw, bh = w + 90, 112; bx = (W - bw) / 2
    d.rounded_rectangle([bx + 8, y + 8, bx + bw + 8, y + bh + 8], 14, fill=(80, 70, 140))
    d.rounded_rectangle([bx, y, bx + bw, y + bh], 14, fill=K.LIME, outline=K.INK, width=3)
    K.draw_text(d, (bx + 45, y + (bh - 58) / 2), cta, f, K.INK); y += bh + 40
    f = K.mono(30); t = "11 modules · 41 lessons · lifetime access"; d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=K.INK)
    im.save(path, quality=95)
    return path


if __name__ == "__main__":
    print(build(1080, 1350, os.path.join(OUT, "AIA_OLDNEW_IMG_v1_4x5.jpg")))
    print(build(1080, 1920, os.path.join(OUT, "AIA_OLDNEW_IMG_v1_9x16.jpg")))

"""Before / After comparison reel for Ad 7 (layout after the user's reference; Studio Lime theme).
Before = the raw take on the same cut (no grade, no edit); After = the finished Ad 7 frames. Both in sync.
usage: python3 compare7.py AFTER_FRAMES_DIR OUT_DIR [--frames a,b] [--workers 4]"""
import sys, os, math, numpy as np
from functools import lru_cache
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFilter
import common as C
from kit7 import *
AFTER = sys.argv[1]; OUT = sys.argv[2]
BG = (247, 247, 244)
TITLE_Y, CTA_Y = 300, 1585
AW = 560; AH = int(AW * 16 / 9); AX0 = 404; AY0 = int(1000 - AH / 2)          # After card: big, centred in frame (as in the reference)
BW = 296; BH = int(BW * 16 / 9); BX0 = AX0 - BW + 6; BY0 = int(AY0 + AH / 2 - BH / 2 + 30)   # Before card: tucked against After's left edge, centred on it
@lru_cache(None)
def base_bg():
    yy, xx = K._grid(); a = np.zeros((H, W, 3), np.float32) + np.array(BG, np.float32)
    d = np.sqrt(((xx - W * .55) / (W * .9)) ** 2 + ((yy - H * .45) / (H * .8)) ** 2); a = a * (1.02 - .06 * np.clip(d, 0, 1.3) ** 2)[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def blob(im, cx, cy, R, t, seed, col=LIME):
    r = np.random.default_rng(seed); ph = r.uniform(0, 6.28, 4); th = np.linspace(0, 2 * np.pi, 220)
    rad = R * (1 + .13 * np.sin(2 * th + ph[0] + t * .35) + .08 * np.sin(3 * th + ph[1] - t * .27) + .05 * np.sin(5 * th + ph[2] + t * .4))
    rot = ph[3] + t * .05; pts = [(cx + q * math.cos(a + rot), cy + q * math.sin(a + rot)) for q, a in zip(rad, th)]
    S = 2; m = Image.new('L', (W * S, H * S), 0); ImageDraw.Draw(m).polygon([(x * S, y * S) for x, y in pts], fill=255); m = m.resize((W, H), Image.LANCZOS)
    im.paste(col, (0, 0), m)
@lru_cache(maxsize=4)
def card_mask(w, h, r): return K.rounded_mask(w, h, r)
def card(im, frame, x0, y0, w, h, r, p=1.):
    if p <= 0: return
    c = frame.resize((w, h), Image.LANCZOS).convert('RGBA'); m = card_mask(w, h, r)
    if p < 1: m = m.point(lambda v: int(v * cl(p * 1.6)))
    c.putalpha(m); s = lerp(.92, 1, eo(p)); c = K.scaled(c, s, 1) if s != 1 else c
    shadowed(im, c, (x0 + (w - c.size[0]) / 2, y0 + (h - c.size[1]) / 2 + (1 - eo(p)) * 60), 34, .22 * cl(p * 1.5), (0, 24))
def label(im, x, y, s, size, p=1.):
    if p <= 0: return
    a = eo(cl(p)); d = ImageDraw.Draw(im); r = size * .2; d.ellipse((x - r, y - r + (1 - a) * 16, x + r, y + r + (1 - a) * 16), fill=LIME_D)
    K.put_text(im, (x + r + 14, y + (1 - a) * 16), s, FX('iblack', size), INK, 'l', -1, a)
def title(im, t):
    p = eo(cl((t - .1) / .5)); f1 = FX('iblack', 84); s1 = 'Fully Edited by '; w1 = f1.getlength(s1); w2 = f1.getlength('AI'); x = W / 2 - (w1 + w2 + 6) / 2
    K.put_text(im, (x, TITLE_Y + (1 - p) * 24), s1.strip(), f1, INK, 'l', -2, p)
    q = eo(cl((t - .35) / .4))
    if q > 0:
        hl = Image.new('RGBA', (int((w2 + 40) * q) + 1, 104)); ImageDraw.Draw(hl).rounded_rectangle((0, 0, hl.size[0] - 1, 103), 20, fill=LIME + (255,))
        hl = hl.rotate(-2, expand=True, resample=Image.BICUBIC); place(im, hl, x + w1 - 14 + (w2 + 40) * q / 2, TITLE_Y + 4, 12, .18, (0, 8))
    K.put_text(im, (x + w1 + 6, TITLE_Y + (1 - p) * 24), 'AI', f1, INK, 'l', -2, p)
def cta(im, t):
    p = cl((t - .55) / .6)
    if p <= 0: return
    s = tag('Learn the Workflow  →', FX('ibold', 40), INK, LIME, (44, 20)); place(im, K.scaled(s, lerp(.7, 1, spring(p)), cl(p * 2)), W / 2, CTA_Y, 22, .25, (0, 14))
@lru_cache(maxsize=6)
def before_frame(i_src): return Image.fromarray(C.raw_src(i_src))
def frame(i):
    t = i / 30; im = base_bg().copy()
    blob(im, -40, 60, 300, t, 3); blob(im, W + 70, H + 30, 300, t, 7)
    title(im, t); cta(im, t)
    label(im, AX0 + 150, AY0 - 52, 'After', 74, cl((t - .3) / .5)); label(im, BX0 + 40, BY0 - 40, 'Before', 50, cl((t - .2) / .5))
    card(im, before_frame(C.src_index(t)), BX0, BY0, BW, BH, 30, cl((t - .05) / .55))
    card(im, Image.open(f'{AFTER}/f{min(i, C.N - 1):05d}.jpg'), AX0, AY0, AW, AH, 40, cl((t - .15) / .6))
    K.grain(im, 2, i).save(f'{OUT}/f{i:05d}.jpg', quality=93); return i
if __name__ == '__main__':
    import time
    os.makedirs(OUT, exist_ok=True); a = sys.argv[3:]
    frames = [int(x) for x in a[a.index('--frames') + 1].split(',')] if '--frames' in a else list(range(C.N))
    nw = int(a[a.index('--workers') + 1]) if '--workers' in a else 4; t0 = time.time()
    with Pool(nw) as p:
        for j, i in enumerate(p.imap_unordered(frame, frames, chunksize=4)):
            if j % 300 == 0: print(j, '/', len(frames), round((time.time() - t0) / (j + 1), 3), 's/f', flush=True)
    print('done', len(frames), round(time.time() - t0), 's', flush=True)

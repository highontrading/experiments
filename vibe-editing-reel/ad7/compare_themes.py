"""Before / After comparison reel — same layout as compare7.py, three alternate card themes, CTA "Comment VIBE".
usage: python3 compare_themes.py THEME AFTER_FRAMES_DIR OUT_DIR [--frames a,b] [--workers 4]     THEME = noir | paper | cobalt"""
import sys, os, math, numpy as np, cv2
from functools import lru_cache
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFilter
import common as C
from kit7 import *
THEME, AFTER, OUT = sys.argv[1:4]
# ---- layout: identical to the approved compare7 layout ----
TITLE_Y, CTA_Y = 300, 1585
AW = 560; AH = int(AW * 16 / 9); AX0 = 404; AY0 = int(1000 - AH / 2)
BW = 296; BH = int(BW * 16 / 9); BX0 = AX0 - BW + 6; BY0 = int(AY0 + AH / 2 - BH / 2 + 30)
GOLD = (214, 184, 126); GOLD_HI = (242, 222, 172); TERRA = (214, 98, 64); ESP = (44, 32, 26); CREAM = (243, 236, 224); COB = (36, 62, 255)
T = {
 'noir':   dict(bg=(12, 12, 14), glow=(52, 42, 26), ink=WHITE, sub=(150, 146, 138), accent=GOLD, ai_fill=GOLD, ai_ink=INK, dot=GOLD,
                title_font='iblack', ai_font='iblack', label_font='iblack', border=None, edge=(GOLD, 2), shadow=.55,
                cta_fill=GOLD, cta_ink=INK, cta_acc=INK, grain=2.6),
 'paper':  dict(bg=CREAM, glow=None, ink=ESP, sub=(130, 112, 98), accent=TERRA, ai_fill=None, ai_ink=TERRA, dot=TERRA,
                title_font='inst', ai_font='insti', label_font='insti', border=(WHITE, 9), edge=None, shadow=.26,
                cta_fill=ESP, cta_ink=CREAM, cta_acc=(240, 150, 110), grain=3.2),
 'cobalt': dict(bg=COB, glow=None, ink=WHITE, sub=(200, 210, 255), accent=WHITE, ai_fill=WHITE, ai_ink=COB, dot=WHITE,
                title_font='iblack', ai_font='iblack', label_font='iblack', border=(WHITE, 7), edge=None, shadow=.35,
                cta_fill=WHITE, cta_ink=INK, cta_acc=COB, grain=1.8),
}[THEME]
# ---------------- backgrounds + corner decoration ----------------
@lru_cache(None)
def base_bg():
    yy, xx = K._grid(); a = np.zeros((H, W, 3), np.float32) + np.array(T['bg'], np.float32)
    if THEME == 'noir':
        g = np.exp(-(((xx - W * .55) / 620) ** 2 + ((yy - H * .52) / 820) ** 2)); a = a + g[..., None] * np.array(T['glow'], np.float32)
    elif THEME == 'paper':
        a = a + (K.noise(H, W, 240, 4) * 2.4 + K.noise(H, W, 2, 5) * 2.0)[..., None]
        d = np.sqrt(((xx - W / 2) / (W * .8)) ** 2 + ((yy - H * .5) / (H * .75)) ** 2); a = a * (1 - .08 * np.clip(d - .3, 0, 1))[..., None]
    else:
        g = np.exp(-(((xx - W * .5) / 700) ** 2 + ((yy - H * .5) / 900) ** 2)); a = a * (.86 + .2 * g)[..., None]
        grid = (((xx % 54) < 1.2) | ((yy % 54) < 1.2)).astype(np.float32); a = a + grid[..., None] * 18
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def blob_mask(cx, cy, R, t, seed):
    r = np.random.default_rng(seed); ph = r.uniform(0, 6.28, 4); th = np.linspace(0, 2 * np.pi, 220)
    rad = R * (1 + .13 * np.sin(2 * th + ph[0] + t * .35) + .08 * np.sin(3 * th + ph[1] - t * .27) + .05 * np.sin(5 * th + ph[2] + t * .4))
    rot = ph[3] + t * .05; pts = [(cx + q * math.cos(a + rot), cy + q * math.sin(a + rot)) for q, a in zip(rad, th)]
    S = 2; m = Image.new('L', (W * S, H * S), 0); ImageDraw.Draw(m).polygon([(x * S, y * S) for x, y in pts], fill=255); return m.resize((W, H), Image.LANCZOS)
def sparkle(im, cx, cy, r, col, a=255):
    L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    d.polygon([(cx, cy - r), (cx + r * .18, cy - r * .18), (cx + r, cy), (cx + r * .18, cy + r * .18), (cx, cy + r), (cx - r * .18, cy + r * .18), (cx - r, cy), (cx - r * .18, cy - r * .18)], fill=a)
    im.paste(col, (0, 0), L)
def decor(im, t):
    if THEME == 'noir':          # soft gold glow orbs, slowly breathing, + fine gold ring
        for (cx, cy, R, sd) in [(-30, 80, 300, 3), (W + 60, H + 20, 320, 7)]:
            m = blob_mask(cx, cy, R, t, sd).filter(ImageFilter.GaussianBlur(70)); im.paste(GOLD, (0, 0), m.point(lambda v: int(v * .55)))
        L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L); a0 = t * 12
        d.arc((-260, -200, 420, 480), a0, a0 + 250, fill=150, width=2); d.arc((W - 360, H - 420, W + 300, H + 240), -a0, -a0 + 230, fill=150, width=2); im.paste(GOLD, (0, 0), L)
    elif THEME == 'paper':       # terracotta organic blobs + a small sparkle
        im.paste(TERRA, (0, 0), blob_mask(-40, 60, 290, t, 3)); im.paste(TERRA, (0, 0), blob_mask(W + 70, H + 30, 290, t, 7))
        sparkle(im, 930, 260, 26 + 4 * math.sin(t * 2), TERRA); sparkle(im, 150, 1680, 20 + 3 * math.sin(t * 2 + 1), TERRA)
    else:                        # outline rings + white sparkles
        L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
        for k, (cx, cy, R) in enumerate([(30, 90, 250), (30, 90, 170), (W - 20, H - 60, 270), (W - 20, H - 60, 185)]):
            d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=210 if k % 2 == 0 else 120, width=3)
        im.paste(WHITE, (0, 0), L)
        for (x, y, r, ph) in [(250, 120 + 0, 30, 0), (900, 1700, 34, 1.5), (110, 1500, 18, 3)]: sparkle(im, x, y, r * (1 + .15 * math.sin(t * 2.2 + ph)), WHITE)
# ---------------- cards ----------------
@lru_cache(maxsize=4)
def card_mask(w, h, r): return K.rounded_mask(w, h, r)
def card(im, frame, x0, y0, w, h, r, p=1.):
    if p <= 0: return
    b = T['border']; bw = b[1] if b else 0; W2, H2 = w + bw * 2, h + bw * 2
    c = Image.new('RGBA', (W2, H2), (0, 0, 0, 0))
    if b: c.paste(b[0] + (255,), (0, 0), card_mask(W2, H2, r + bw))
    f = frame.resize((w, h), Image.LANCZOS).convert('RGBA'); f.putalpha(card_mask(w, h, r)); c.alpha_composite(f, (bw, bw))
    if T['edge']:
        e = Image.new('L', (W2 * 2, H2 * 2), 0); ImageDraw.Draw(e).rounded_rectangle((1, 1, W2 * 2 - 2, H2 * 2 - 2), (r + bw) * 2, outline=255, width=T['edge'][1] * 2)
        c.paste(T['edge'][0] + (255,), (0, 0), e.resize((W2, H2), Image.LANCZOS).point(lambda v: int(v * .8)))
    if p < 1: c.putalpha(c.split()[3].point(lambda v: int(v * cl(p * 1.6))))
    s = lerp(.92, 1, eo(p)); c = K.scaled(c, s, 1) if s != 1 else c
    shadowed(im, c, (x0 - bw + (W2 - c.size[0]) / 2, y0 - bw + (H2 - c.size[1]) / 2 + (1 - eo(p)) * 60), 36, T['shadow'] * cl(p * 1.5), (0, 26))
# ---------------- type ----------------
def label(im, x, y, s, size, p=1.):
    if p <= 0: return
    a = eo(cl(p)); d = ImageDraw.Draw(im); r = size * .2; dy = (1 - a) * 16
    d.ellipse((x - r, y - r + dy, x + r, y + r + dy), fill=T['dot'])
    f = FX(T['label_font'], int(size * (1.12 if T['label_font'].startswith('ins') else 1)))
    K.put_text(im, (x + r + 14, y + dy), s, f, T['ink'], 'l', 0 if T['label_font'].startswith('ins') else -1, a)
def title(im, t):
    p = eo(cl((t - .1) / .5)); serif = THEME == 'paper'
    f1 = FX(T['title_font'], 104 if serif else 84); f2 = FX(T['ai_font'], 112 if serif else 84); s1 = 'Fully Edited by'
    w1 = f1.getlength(s1 + ' '); w2 = f2.getlength('AI'); x = W / 2 - (w1 + w2 + (6 if not serif else 14)) / 2; dy = (1 - p) * 24
    K.put_text(im, (x, TITLE_Y + dy), s1, f1, T['ink'], 'l', 0 if serif else -2, p)
    ax = x + w1 + (6 if not serif else 14)
    if T['ai_fill']:
        q = eo(cl((t - .35) / .4))
        if q > 0:
            hl = Image.new('RGBA', (int((w2 + 40) * q) + 1, 104)); ImageDraw.Draw(hl).rounded_rectangle((0, 0, hl.size[0] - 1, 103), 20, fill=T['ai_fill'] + (255,))
            hl = hl.rotate(-2, expand=True, resample=Image.BICUBIC); place(im, hl, ax - 20 + (w2 + 40) * q / 2, TITLE_Y + 4, 12, .25, (0, 8))
    else:   # serif: hand-drawn terracotta underline under the italic AI
        q = eo(cl((t - .4) / .5))
        if q > 0: K.stroke(im, [(ax - 4 + (w2 + 18) * u, TITLE_Y + 52 + math.sin(u * 3) * 4) for u in np.linspace(0, 1, 24)], q, 10, TERRA, 5, 3, 250)
    K.put_text(im, (ax, TITLE_Y + dy - (4 if serif else 0)), 'AI', f2, T['ai_ink'], 'l', 0 if serif else -2, p)
def bubble_icon(size, col):
    s = size; ic = Image.new('RGBA', (s * 2, s * 2)); d = ImageDraw.Draw(ic)
    d.rounded_rectangle((4, 4, s * 2 - 4, s * 1.5), s * .45, outline=col + (255,), width=max(5, s // 7))
    d.polygon([(s * .5, s * 1.45), (s * .4, s * 1.95), (s * .95, s * 1.45)], fill=col + (255,))
    for k in range(3): cx = s * (.62 + k * .38); d.ellipse((cx - s * .09, s * .77 - s * .09, cx + s * .09, s * .77 + s * .09), fill=col + (255,))
    return ic.resize((s, s), Image.LANCZOS)
def cta(im, t):
    p = cl((t - .55) / .6)
    if p <= 0: return
    f1 = FX('isemi', 44); f2 = FX('iblack', 48); ic = bubble_icon(48, T['cta_acc'] if THEME != 'noir' else INK)
    w = int(48 + 16 + f1.getlength('Comment') + 18 + f2.getlength('VIBE') + 96); h = 112
    c = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(c); d.rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=T['cta_fill'] + (255,))
    x = 48; c.alpha_composite(ic, (x, (h - 48) // 2)); x += 48 + 16
    d.text((x, h / 2), 'Comment', font=f1, fill=T['cta_ink'], anchor='lm'); x += f1.getlength('Comment') + 18
    d.text((x, h / 2), 'VIBE', font=f2, fill=T['cta_acc'], anchor='lm')
    place(im, K.scaled(c, lerp(.7, 1, spring(p)), cl(p * 2)), W / 2, CTA_Y, 24, .3, (0, 14))
# ---------------- frame ----------------
@lru_cache(maxsize=6)
def before_frame(i_src): return Image.fromarray(C.raw_src(i_src))
def frame(i):
    t = i / 30; im = base_bg().copy(); decor(im, t); title(im, t); cta(im, t)
    label(im, AX0 + 150, AY0 - 52 - (T['border'][1] if T['border'] else 0), 'After', 74, cl((t - .3) / .5))
    label(im, BX0 + 40, BY0 - 40 - (T['border'][1] if T['border'] else 0), 'Before', 50, cl((t - .2) / .5))
    card(im, before_frame(C.src_index(t)), BX0, BY0, BW, BH, 30, cl((t - .05) / .55))
    card(im, Image.open(f'{AFTER}/f{min(i, C.N - 1):05d}.jpg'), AX0, AY0, AW, AH, 40, cl((t - .15) / .6))
    K.grain(im, T['grain'], i).save(f'{OUT}/f{i:05d}.jpg', quality=93); return i
if __name__ == '__main__':
    import time
    os.makedirs(OUT, exist_ok=True); a = sys.argv[4:]
    frames = [int(x) for x in a[a.index('--frames') + 1].split(',')] if '--frames' in a else list(range(C.N))
    nw = int(a[a.index('--workers') + 1]) if '--workers' in a else 4; t0 = time.time()
    with Pool(nw) as p:
        for j, i in enumerate(p.imap_unordered(frame, frames, chunksize=4)):
            if j % 400 == 0: print(j, '/', len(frames), round((time.time() - t0) / (j + 1), 3), 's/f', flush=True)
    print('done', len(frames), round(time.time() - t0), 's', flush=True)

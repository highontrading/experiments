"""Ad 7 design system — STUDIO LIME.
From the refs: light-grey studio sweep + paper grain (ref video 1 / 2), ONE acid-lime accent, black ink, Helvetica-style grotesk with
mixed sizes + micro-typography, cut-outs with a lime sticker edge (ref 2 / F1 poster), halftone B&W collage (Zuckerberg poster), lime sphere,
text behind the head ("crisp" ref). Recurring motif: every instruction to Claude appears as a black command chip with lime mono type."""
import os, sys, math, numpy as np, cv2
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(ROOT, 'v3kit')); sys.path.insert(0, os.path.join(ROOT, 'ad4v2'))
import vkit as K, mg
W, H = 1080, 1920
LIME = (214, 240, 58); LIME_D = (170, 196, 20); INK = (17, 17, 17); WHITE = (255, 255, 255); GREY = (130, 128, 124); STUDIO = (232, 231, 227)
F = K.F
_X = {'outfit9': 'outfit-latin-900-normal', 'outfit8': 'outfit-latin-800-normal', 'apple': 'homemade-apple-latin-400-normal', 'sign': 'mrs-saint-delafield-latin-400-normal',
      'syne': 'syne-latin-800-normal', 'nothing': 'nothing-you-could-do-latin-400-normal'}
@lru_cache(None)
def FX(name, size):
    if name in _X: return ImageFont.truetype(f'{K.F3}/{_X[name]}.woff', size)
    return F(name, size)
cl, inv, eo, eo5, eio, spring, lerp = K.cl, K.inv, K.eo, K.eo5, K.eio, K.spring, K.lerp
# ---------------- surfaces ----------------
@lru_cache(None)
def studio(seed=1, cx=.5, cy=.42):
    yy, xx = K._grid(); d = np.sqrt(((xx - W * cx) / (W * .9)) ** 2 + ((yy - H * cy) / (H * .75)) ** 2)
    a = np.zeros((H, W, 3), np.float32) + np.array(STUDIO, np.float32) * (1.04 - .2 * np.clip(d, 0, 1.4) ** 1.6)[..., None]
    a = a + (K.noise(H, W, 260, seed) * 2.0 + K.noise(H, W, 2, seed + 1) * 2.4)[..., None]          # paper grain
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def grade(img, seed=0, face=(540, 600)): return Image.fromarray(K.grade(img, seed=seed, look='clean', face=face))
# ---------------- cut-outs ----------------
def soft_alpha(a):
    a = a.astype(np.float32) / 255; a = np.clip((a - .18) / .72, 0, 1) ** 1.2; return cv2.GaussianBlur(a, (0, 0), .9)
def decontam(rgb, a):
    g = np.asarray(rgb).astype(np.float32); core = cv2.erode((a > .93).astype(np.float32), np.ones((5, 5), np.uint8))
    num = cv2.GaussianBlur(g * core[..., None], (0, 0), 7); den = cv2.GaussianBlur(core, (0, 0), 7)[..., None]; fg = num / np.maximum(den, 1e-3)
    m = np.clip((a - .55) / .4, 0, 1)[..., None]; return np.where(den > .02, g * m + fg * (1 - m), g * .6)
def cutout(rgb, alpha8, edge=LIME, ew=14, halftone=False):
    """RGBA cut-out with a sticker edge (lime) — colour decontaminated so no wall halo."""
    a = soft_alpha(alpha8); g = decontam(rgb, a)
    if halftone:
        l = g @ np.array([.299, .587, .114], np.float32); l = np.clip((l - 128) * 1.5 + 128, 0, 255); g = np.repeat(l[..., None], 3, 2)
    out = np.zeros((H, W, 4), np.float32)
    if ew:
        ring = cv2.dilate((a > .5).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ew * 2 + 1, ew * 2 + 1))).astype(np.float32)
        ring = cv2.GaussianBlur(ring, (0, 0), 1.2); out[..., :3] = np.array(edge, np.float32); out[..., 3] = ring
    out[..., :3] = out[..., :3] * (1 - a[..., None]) + g * a[..., None]; out[..., 3] = np.maximum(out[..., 3], a)
    return Image.fromarray(np.clip(out * [1, 1, 1, 255], 0, 255).astype(np.uint8))
def person_over(base, rgb, alpha8):
    """put the person back on top of a modified frame (text behind head)."""
    a = soft_alpha(alpha8)[..., None]; g = decontam(rgb, a[..., 0]); b = np.asarray(base).astype(np.float32)
    return Image.fromarray(np.clip(b * (1 - a) + g * a, 0, 255).astype(np.uint8))
def head_top(alpha8, x0=300, x1=780): r = np.nonzero(alpha8[:, x0:x1].max(1) > 128)[0]; return int(r.min()) if len(r) else 400
# ---------------- parts ----------------
def shadowed(im, layer, xy, blur=22, alpha=.28, off=(0, 18)): mg.paste_shadow(im, layer, (int(xy[0]), int(xy[1])), blur, alpha, off)
def place(im, layer, cx, cy, blur=26, alpha=.26, off=(0, 20)): shadowed(im, layer, (cx - layer.size[0] / 2, cy - layer.size[1] / 2), blur, alpha, off)
def chip(text_, typed=1., cursor=True, label='DIRECTING CLAUDE', w=None):
    """the recurring command chip: black card, lime mono '›' prompt, typed in."""
    sz = 40
    while sz > 26 and FX('jb7', sz).getlength('›  ' + text_) + 120 > 940: sz -= 2
    f = FX('jb7', sz); n = int(len(text_) * cl(typed)); s = '›  ' + text_[:n]; w = w or int(f.getlength('›  ' + text_) + 120); h = 132
    c = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(c); d.rounded_rectangle((0, 0, w - 1, h - 1), 30, fill=INK + (255,))
    d.text((44, 46), label, font=FX('jb4', 20), fill=(120, 120, 116), anchor='lm'); d.text((44, 92), s, font=f, fill=LIME, anchor='lm')
    if cursor: x = 44 + f.getlength(s) + 6; d.rectangle((x, 92 - sz // 2, x + 20, 92 + sz // 2), fill=LIME)
    return c
def sphere(r, col=LIME):
    s = r * 2 + 4; yy, xx = np.mgrid[0:s, 0:s].astype(np.float32); d = np.sqrt((xx - r) ** 2 + (yy - r) ** 2) / r
    hl = np.exp(-(((xx - r * .62) ** 2 + (yy - r * .55) ** 2) / (r * r * .18))); sh = np.clip((xx + yy) / (2 * s), 0, 1)
    c = np.array(col, np.float32) * (1.06 - .32 * sh[..., None]) + hl[..., None] * 60
    a = np.clip((1 - d) * r / 1.5, 0, 1); out = np.dstack([np.clip(c, 0, 255), a * 255]).astype(np.uint8); return Image.fromarray(out, 'RGBA')
def tag(text_, f, fill=WHITE, ink=INK, pad=(34, 18), r=None, outline=None):
    w = int(f.getlength(text_) + pad[0] * 2); h = int(f.size * 1.25 + pad[1] * 2); r = h // 2 if r is None else r
    c = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(c); d.rounded_rectangle((0, 0, w - 1, h - 1), r, fill=fill + (255,), outline=outline, width=3 if outline else 0)
    d.text((w / 2, h / 2), text_, font=f, fill=ink, anchor='mm'); return c
def micro(im, x, y, lines, f=None, col=GREY):
    f = f or FX('imed', 20)
    for k, l in enumerate(lines): ImageDraw.Draw(im).text((x, y + k * 26), l, font=f, fill=col)
def bracket(im, x, y, w, h, col=INK, wd=3):
    d = ImageDraw.Draw(im); d.line([(x, y + h), (x, y), (x + w, y)], fill=col, width=wd)
def text(im, xy, s, f, fill, anchor='mm', track=0, shadow=0., rot=0, alpha=1.):
    K.put_text(im, xy, s, f, fill, {'mm': 'm', 'lm': 'l', 'rm': 'r'}[anchor], track, alpha, shadow, rot=rot)
def hand_line(im, pts, w=10, col=LIME, seed=1, p=1.):
    K.stroke(im, pts, p, w, col, seed, 3, 250)

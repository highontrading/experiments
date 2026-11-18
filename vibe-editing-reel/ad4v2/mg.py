"""Ad 4 v3 motion-graphics kit (stills for the board; the final render follows the same recipes).
Editorial poster language from the references: halftone B&W cut-out with a white sticker edge, torn paper,
giant condensed type, chalk + marker strokes, red/black/white, plus glossy 3D UI cards and a tilted 3D phone."""
import os, math, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
FD = os.path.join(ROOT, 'build', 'fonts'); CF = '/home/user/experiments/vibe-editing-carousels/assets/fonts'; ID = '/usr/share/fonts/opentype/inter'
W, H = 1080, 1920
RED = (226, 38, 32); DRED = (150, 18, 16); BLACK = (14, 13, 13); WHITE = (250, 248, 244); CREAM = (238, 232, 222); GREY = (150, 146, 140)
def F(name, size):
    p = {'anton': f'{FD}/Anton.ttf', 'disp': f'{ID}/InterDisplay-ExtraBold.otf', 'black': f'{ID}/InterDisplay-Black.otf', 'semi': f'{ID}/InterDisplay-SemiBold.otf',
         'med': f'{ID}/InterDisplay-Medium.otf', 'hand': f'{CF}/Caveat-600.ttf', 'mono': f'{FD}/JetBrainsMono-Medium.ttf', 'monob': f'{FD}/JetBrainsMono-Bold.ttf',
         'wide': f'{CF}/Archivo-Expanded-900.ttf', 'gen': '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'}[name]
    return ImageFont.truetype(p, size)
R = lambda s: np.random.default_rng(s)
# ---------------- surfaces ----------------
def noise(h, w, scale, seed):
    n = R(seed).normal(0, 1, (max(2, h // scale), max(2, w // scale))).astype(np.float32)
    return cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC)
def paper(color=CREAM, seed=1, folds=True):
    c = np.array(color, np.float32)[None, None] / 255
    n = noise(H, W, 6, seed) * .03 + noise(H, W, 60, seed + 1) * .04
    a = c * (1 + n[..., None])
    if folds:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); f = np.zeros((H, W), np.float32); r = R(seed + 2)
        for _ in range(10):
            ang = r.uniform(0, np.pi); off = r.uniform(-900, 900); d = np.abs(np.cos(ang) * (xx - W / 2) + np.sin(ang) * (yy - H / 2) - off)
            f += np.exp(-d / r.uniform(6, 22)) * r.uniform(-.06, .05)
        a = a * (1 + f[..., None])
    g = R(seed + 3).normal(0, 6, (H, W, 1)).astype(np.float32) / 255
    return Image.fromarray((np.clip(a + g, 0, 1) * 255).astype(np.uint8))
def dark_set(seed=4, glow=(190, 30, 24), gx=.5, gy=.42, grid=True):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.ones((H, W, 3), np.float32) * np.array([12, 11, 11], np.float32) / 255
    g = np.exp(-(((xx - W * gx) / 620.) ** 2 + ((yy - H * gy) / 760.) ** 2))[..., None]
    a = a + g * np.array(glow, np.float32) / 255 * .55
    if grid:
        gl = ((xx % 90) < 1.4) | ((yy % 90) < 1.4); a = a + gl[..., None] * .022
    a = a + R(seed).normal(0, 5, (H, W, 1)) / 255
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
def light_set(seed=5):
    """clean white set with soft red curved light (the reference video's white/lavender scenes, in red)."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.ones((H, W, 3), np.float32) * np.array([247, 244, 241], np.float32) / 255
    for cx, cy, rx, ry, k in [(1250, 300, 700, 900, .2), (-200, 1700, 800, 700, .16)]:
        g = np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2))[..., None]; a = a * (1 - g * k) + g * k * np.array([240, 120, 105], np.float32) / 255
    ring = np.abs(np.sqrt((xx - 1350) ** 2 + (yy - 250) ** 2) - 900); a = a - np.exp(-ring / 3)[..., None] * .04
    return Image.fromarray((np.clip(a + R(seed).normal(0, 2.5, (H, W, 1)) / 255, 0, 1) * 255).astype(np.uint8))
def red_paper(seed=6): return paper((206, 34, 28), seed)
def vignette(im, k=.45):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); d = np.sqrt(((xx - W / 2) / (W * .75)) ** 2 + ((yy - H * .47) / (H * .62)) ** 2)
    return Image.fromarray((np.asarray(im).astype(np.float32) * (1 - k * np.clip(d - .4, 0, 1) ** 1.4)[..., None]).clip(0, 255).astype(np.uint8))
def grain(im, s=5, seed=9):
    a = np.asarray(im).astype(np.float32) + R(seed).normal(0, s, (im.size[1], im.size[0], 1)); return Image.fromarray(a.clip(0, 255).astype(np.uint8))
# ---------------- text ----------------
def text(im, xy, s, f, fill, anchor='mm', track=0, stroke=0, stroke_fill=None, shadow=0, rot=0, alpha=255):
    L = Image.new('L', im.size, 0); d = ImageDraw.Draw(L); x, y = xy
    w = f.getlength(s) + track * (len(s) - 1)
    if anchor[0] == 'm': x -= w / 2
    elif anchor[0] == 'r': x -= w
    cx = x
    for ch in s: d.text((cx, y), ch, font=f, fill=alpha, anchor='l' + anchor[1], stroke_width=stroke, stroke_fill=alpha); cx += f.getlength(ch) + track
    if rot: L = L.rotate(rot, center=xy, resample=Image.BICUBIC)
    if shadow: sh = L.filter(ImageFilter.GaussianBlur(f.size * .1)); im.paste((0, 0, 0), (0, 0), ImageChops.offset(sh, 0, int(f.size * .05)).point(lambda v: int(v * shadow)))
    if stroke and stroke_fill is None:
        I = Image.new('L', im.size, 0); d2 = ImageDraw.Draw(I); cx = x
        for ch in s: d2.text((cx, y), ch, font=f, fill=255, anchor='l' + anchor[1]); cx += f.getlength(ch) + track
        if rot: I = I.rotate(rot, center=xy, resample=Image.BICUBIC)
        L = ImageChops.subtract(L, I)
    im.paste(fill, (0, 0), L); return w
# ---------------- strokes ----------------
def chalk(im, pts, width=7, color=WHITE, seed=1, passes=3, alpha=230):
    L = Image.new('L', im.size, 0); d = ImageDraw.Draw(L); r = R(seed); pts = np.array(pts, np.float32)
    for p in range(passes):
        j = pts + r.normal(0, 1.6, pts.shape); d.line([tuple(q) for q in j], fill=int(alpha * (1 - p * .18)), width=max(2, width - p * 2), joint='curve')
    tex = (R(seed + 5).random((im.size[1], im.size[0])) > .28).astype(np.uint8) * 255
    L = ImageChops.multiply(L, Image.fromarray(tex)).filter(ImageFilter.GaussianBlur(.7)); im.paste(color, (0, 0), L)
def ellipse_pts(cx, cy, rx, ry, start=-1.9, turns=1.12, n=90, wob=.05, seed=3):
    r = R(seed); out = []
    for k in range(n):
        t = start + turns * 2 * np.pi * k / (n - 1); f = 1 + wob * np.sin(t * 3 + r.uniform(0, 6)) + .04 * k / n
        out.append((cx + rx * f * np.cos(t), cy + ry * f * np.sin(t)))
    return out
def arrow(im, p0, p1, bend=.25, color=WHITE, width=7, seed=2, head=34):
    (x0, y0), (x1, y1) = p0, p1; mx, my = (x0 + x1) / 2 - (y1 - y0) * bend, (y0 + y1) / 2 + (x1 - x0) * bend
    pts = [((1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1) for t in np.linspace(0, 1, 40)]
    chalk(im, pts, width, color, seed)
    a = math.atan2(y1 - pts[-4][1], x1 - pts[-4][0])
    for s in (-.55, .55): chalk(im, [(x1, y1), (x1 - head * math.cos(a + s), y1 - head * math.sin(a + s))], width, color, seed + 7)
def scribble_x(im, cx, cy, s, color=RED, seed=4):
    chalk(im, [(cx - s, cy - s), (cx + s, cy + s)], 9, color, seed); chalk(im, [(cx + s, cy - s), (cx - s, cy + s)], 9, color, seed + 1)
# ---------------- cut-outs ----------------
def halftone_cutout(rgb, alpha, contrast=1.5, border=16, seed=7, dot=7, color=False):
    """B&W (or colour) poster cut-out: punchy levels + fine halftone screen + grain, white sticker edge with a rough cut."""
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    g = np.clip((g - .5) * contrast + .47, 0, 1)
    yy, xx = np.mgrid[0:g.shape[0], 0:g.shape[1]].astype(np.float32)
    c, s = np.cos(.785), np.sin(.785); u, v = (xx * c - yy * s) / dot, (xx * s + yy * c) / dot
    screen = (np.sin(u * np.pi) * np.sin(v * np.pi) + 1) / 2
    ht = (g > screen * .9 + .05).astype(np.float32); g = g * .72 + ht * .28
    g = np.clip(g + R(seed).normal(0, .035, g.shape), 0, 1)
    body = (np.dstack([g] * 3) * 255).astype(np.uint8) if not color else np.clip(rgb.astype(np.float32) * (.6 + .4 * g[..., None]), 0, 255).astype(np.uint8)
    a = alpha.astype(np.float32) / 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (border * 2 + 1, border * 2 + 1)); ab = cv2.dilate((a > .5).astype(np.uint8), k).astype(np.float32)
    rough = noise(a.shape[0], a.shape[1], 9, seed) * .6; ab = np.clip(cv2.GaussianBlur(ab, (0, 0), 3) + rough * .25, 0, 1); ab = (ab > .5).astype(np.float32)
    out = np.zeros((a.shape[0], a.shape[1], 4), np.uint8); paperc = np.array([246, 243, 236], np.float32)
    rgbm = body.astype(np.float32) * a[..., None] + paperc * (1 - a[..., None]); out[..., :3] = rgbm.astype(np.uint8); out[..., 3] = (np.maximum(a, ab) * 255).astype(np.uint8)
    return Image.fromarray(out)
def paste_shadow(canvas, layer, xy, blur=22, alpha=.45, off=(10, 18)):
    sh = Image.new('L', canvas.size, 0); sh.paste(layer.split()[3], (xy[0] + off[0], xy[1] + off[1]))
    canvas.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * alpha))); canvas.paste(layer, xy, layer)
def torn_strip(w, h, color=WHITE, seed=8, edges='tb', tex=True):
    r = R(seed); m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); top, bot = [], []
    for x in range(0, w + 12, 12):
        top.append((x, (r.uniform(0, 16) if 't' in edges else 0))); bot.append((x, h - (r.uniform(0, 16) if 'b' in edges else 0)))
    d.polygon(top + bot[::-1], fill=255)
    base = Image.new('RGB', (w, h), color)
    if tex: base = Image.fromarray(np.clip(np.asarray(base).astype(np.float32) * (1 + noise(h, w, 5, seed)[..., None] * .04), 0, 255).astype(np.uint8))
    out = base.convert('RGBA'); out.putalpha(m); return out
# ---------------- 3D UI ----------------
def rrect_img(w, h, r, fill, top=None, outline=None):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    if top:   # vertical gradient fill
        g = np.linspace(0, 1, h)[:, None, None]; arr = (np.array(top, np.float32) * (1 - g) + np.array(fill, np.float32) * g); col = Image.fromarray(np.repeat(arr, w, 1).astype(np.uint8))
    else: col = Image.new('RGB', (w, h), fill)
    im.paste(col, (0, 0), m)
    if outline: ImageDraw.Draw(im).rounded_rectangle((1, 1, w - 2, h - 2), r, outline=outline, width=2)
    hl = Image.new('L', (w, h), 0); ImageDraw.Draw(hl).rounded_rectangle((3, 3, w - 4, h // 2), r, fill=38); im.paste((255, 255, 255), (0, 0), ImageChops.multiply(hl, m).filter(ImageFilter.GaussianBlur(4)))
    return im
def tilt(img, rx=0., ry=0., rz=0., f=1600.):
    """Perspective-rotate an RGBA image (degrees) like a 3D card."""
    w, h = img.size; pad = int(max(w, h) * .35); src = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); src.paste(img, (pad, pad)); W2, H2 = src.size
    ax, ay, az = np.radians([rx, ry, rz]); Rx = np.array([[1, 0, 0], [0, np.cos(ax), -np.sin(ax)], [0, np.sin(ax), np.cos(ax)]]); Ry = np.array([[np.cos(ay), 0, np.sin(ay)], [0, 1, 0], [-np.sin(ay), 0, np.cos(ay)]])
    Rz = np.array([[np.cos(az), -np.sin(az), 0], [np.sin(az), np.cos(az), 0], [0, 0, 1]]); M = Rz @ Ry @ Rx
    c = np.array([[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]]) @ M.T
    dst = np.float32([[W2 / 2 + p[0] * f / (f + p[2]), H2 / 2 + p[1] * f / (f + p[2])] for p in c]); srcq = np.float32([[pad, pad], [pad + w, pad], [pad + w, pad + h], [pad, pad + h]])
    P = cv2.getPerspectiveTransform(srcq, dst); out = cv2.warpPerspective(np.asarray(src), P, (W2, H2), flags=cv2.INTER_LANCZOS4)
    return Image.fromarray(out)
def place(canvas, layer, cx, cy, shadow=.5, blur=40, off=(0, 40)):
    x, y = int(cx - layer.size[0] / 2), int(cy - layer.size[1] / 2); paste_shadow(canvas, layer, (x, y), blur, shadow, off)
def phone(content, ph=1240):
    pw = int(ph * .484); scr = content.resize((pw - 36, ph - 36), Image.LANCZOS).convert('RGBA'); d = ImageDraw.Draw(scr)
    for k, y in enumerate([int(ph * .52), int(ph * .61), int(ph * .70)]):
        x = pw - 90
        if k == 0: d.polygon([(x, y + 14), (x - 22, y - 6), (x - 12, y - 18), (x, y - 8), (x + 12, y - 18), (x + 22, y - 6)], outline=WHITE, width=4)
        if k == 1: d.ellipse((x - 22, y - 22, x + 22, y + 18), outline=WHITE, width=4)
        if k == 2: d.polygon([(x - 22, y - 4), (x + 22, y - 22), (x + 6, y + 22)], outline=WHITE, width=4)
    d.ellipse((24, ph - 230, 74, ph - 180), fill=(200, 190, 180)); d.text((88, ph - 196), '@creator', font=F('semi', 28), fill=WHITE, anchor='ls'); d.rectangle((0, ph - 44, (pw - 36) * .42, ph - 40), fill=WHITE)
    body = rrect_img(pw, ph, 70, (22, 22, 24), top=(58, 58, 62)); m = Image.new('L', scr.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, scr.size[0] - 1, scr.size[1] - 1), 52, fill=255)
    body.paste(scr, (18, 18), m); ImageDraw.Draw(body).rounded_rectangle((pw // 2 - 70, 36, pw // 2 + 70, 74), 19, fill=(0, 0, 0)); return body
def cheap_caps(im, words, hi, y, size=78):
    d = ImageDraw.Draw(im); fs = [F('gen', size + (12 if i == hi else 0)) for i in range(len(words))]; ws = [f.getlength(w) for f, w in zip(fs, words)]; x = im.size[0] / 2 - (sum(ws) + 20 * (len(ws) - 1)) / 2
    for i, (w, f) in enumerate(zip(words, fs)): d.text((x, y), w, font=f, fill=(255, 225, 40) if i == hi else WHITE, anchor='ls', stroke_width=8, stroke_fill=(0, 0, 0)); x += ws[i] + 20
def chip(text_, size=34, fill=WHITE, ink=BLACK, icon=None, pad=30):
    f = F('semi', size); w = int(f.getlength(text_) + pad * 2 + (size + 16 if icon else 0)); h = size + 34
    im = rrect_img(w, h, h // 2, fill, top=tuple(min(255, c + 18) for c in fill)); d = ImageDraw.Draw(im); x = pad
    if icon: d.ellipse((x - 6, h / 2 - size / 2 + 2, x + size - 6, h / 2 + size / 2 + 2), fill=icon); x += size + 10
    d.text((x, h / 2 + size * .36), text_, font=f, fill=ink, anchor='ls'); return im

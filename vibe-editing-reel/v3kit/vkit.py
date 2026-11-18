"""Shared v3 animation engine (generalised from ad4v2/animate.py): timing on word times, easing, text animators,
per-theme real-room grades, transitions and a multiprocess frame runner. Each ad's scenes live in adN.py."""
import sys, os, json, math, numpy as np, cv2
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); sys.path.insert(0, os.path.join(ROOT, 'ad4v2'))
import mg
from mg import W, H, paste_shadow, rrect_img, tilt, phone, cheap_caps, chip, ellipse_pts, torn_strip, noise
F3 = os.path.join(ROOT, 'assets', 'fonts3'); FPS = 30
SC = os.environ.get('ADS_SCRATCH', '/tmp/claude-0/-home-user-experiments/67b3db71-a2b5-52d4-baa7-e442b86ff3f9/scratchpad/ads')
_F3 = {'inst': 'instrument-serif-latin-400-normal', 'insti': 'instrument-serif-latin-400-italic', 'play': 'playfair-display-latin-400-normal', 'playi': 'playfair-display-latin-400-italic',
       'play6': 'playfair-display-latin-600-normal', 'play6i': 'playfair-display-latin-600-italic', 'play8': 'playfair-display-latin-800-normal', 'play8i': 'playfair-display-latin-800-italic',
       'corm3': 'cormorant-garamond-latin-300-normal', 'corm3i': 'cormorant-garamond-latin-300-italic', 'corm5': 'cormorant-garamond-latin-500-normal', 'corm5i': 'cormorant-garamond-latin-500-italic',
       'corm6': 'cormorant-garamond-latin-600-normal', 'corm6i': 'cormorant-garamond-latin-600-italic', 'dms': 'dm-serif-display-latin-400-normal', 'dmsi': 'dm-serif-display-latin-400-italic',
       'sg4': 'space-grotesk-latin-400-normal', 'sg5': 'space-grotesk-latin-500-normal', 'sg7': 'space-grotesk-latin-700-normal', 'jb4': 'jetbrains-mono-latin-400-normal', 'jb7': 'jetbrains-mono-latin-700-normal'}
_ID = '/usr/share/fonts/opentype/inter'
_INTER = {'ithin': 'InterDisplay-Thin', 'ilight': 'InterDisplay-Light', 'ireg': 'InterDisplay-Regular', 'imed': 'InterDisplay-Medium', 'isemi': 'InterDisplay-SemiBold', 'ibold': 'InterDisplay-Bold',
          'ixb': 'InterDisplay-ExtraBold', 'iblack': 'InterDisplay-Black', 'ilighti': 'InterDisplay-LightItalic', 'iblacki': 'InterDisplay-BlackItalic'}
@lru_cache(None)
def F(name, size):
    if name in _F3: return ImageFont.truetype(f'{F3}/{_F3[name]}.woff', size)
    if name in _INTER: return ImageFont.truetype(f'{_ID}/{_INTER[name]}.otf', size)
    return mg.F(name, size)
# ---------------- easing ----------------
cl = lambda v, a=0., b=1.: max(a, min(b, v)); inv = lambda a, b, v: cl((v - a) / (b - a)) if b != a else float(v >= a)
eo = lambda t: 1 - (1 - t) ** 3; eo5 = lambda t: 1 - (1 - t) ** 5; eio = lambda t: 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
ei = lambda t: t ** 3
def spring(t, k=7, w=9): return 1. if t >= 1 else 1 - math.exp(-k * t) * math.cos(w * t)
def backo(t, c=1.5): return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
lerp = lambda a, b, t: a + (b - a) * t
def mixc(a, b, t): return tuple(int(lerp(x, y, t)) for x, y in zip(a, b))
# ---------------- ad context ----------------
class C: pass
def setup(ad, look, face=(540, 800), frame_cx=.5):
    C.ad = ad; C.E = json.load(open(f'{ROOT}/{ad}/edl.json')); C.WD = C.E['words']; C.N = C.E['nframes']; C.SPEECH = C.E['speech']
    C.look = look; C.face = face; C.cx = frame_cx; C.src_id = open(f'{ROOT}/{ad}/SOURCE_ID').read().strip()
def OS(i): return C.WD[i]['os'] - .03
def OE(i): return C.WD[i]['oe']
def src(t):
    t = min(t, C.SPEECH - 1 / FPS); return C.E['frames'][min(C.N - 1, max(0, int(round(t * FPS))))]
def raw(t):
    s = src(t); p = f"{SC}/bake/{C.ad}/raw/{s:05d}.jpg"
    while not os.path.exists(p) and s > 0: s -= 2; p = f"{SC}/bake/{C.ad}/raw/{s:05d}.jpg"
    return np.asarray(Image.open(p).convert('RGB'))
# ---------------- grades (real room, per theme) ----------------
@lru_cache(None)
def _grid(): return np.mgrid[0:H, 0:W].astype(np.float32)
LOOKS = {  # win: face-light strength, top: top-of-frame darkening, k: filmic shoulder, con: contrast, hi/sh: split tone, lift: black lift, sat, vig
 'warm':  dict(win=(.46, .46), top=.62, k=1.55, con=1.18, hi=(.07, .015, -.07), sh=(-.01, 0, .018), lift=0, sat=1.02, vig=.45),
 'glass': dict(win=(.50, .44), top=.55, k=1.5, con=1.16, hi=(-.05, -.005, .06), sh=(-.03, .01, .07), lift=.0, sat=.92, vig=.5),
 'film':  dict(win=(.62, .34), top=.30, k=1.3, con=1.02, hi=(.06, .03, -.03), sh=(.03, .015, -.01), lift=.07, sat=.86, vig=.28),
 'lux':   dict(win=(.30, .58), top=.82, k=1.7, con=1.24, hi=(.09, .04, -.06), sh=(.0, -.005, -.01), lift=0, sat=.95, vig=.6),
 'clean': dict(win=(.80, .22), top=.14, k=1.25, con=1.08, hi=(.015, .01, 0), sh=(-.01, 0, .02), lift=.01, sat=1.0, vig=.16),
}
def grade(img, seed=0, look=None, face=None):
    L = LOOKS[look or C.look]; fx, fy = face or C.face
    a = img.astype(np.float32) / 255; yy, xx = _grid()
    win = np.exp(-(((xx - fx) / (W * .55)) ** 2 + ((yy - fy - 120) / (H * .36)) ** 2))[..., None]
    top = np.clip(1 - (yy / (H * .55)), 0, 1)[..., None] ** 1.6
    a = a * (L['win'][0] + L['win'][1] * win) * (1 - L['top'] * top)
    k = L['k']; a = 1 - np.exp(-a * k); a = a / (1 - np.exp(-k))
    a = np.clip((a - .45) * L['con'] + .45, 0, 1)
    l = (a @ np.array([.299, .587, .114], np.float32))[..., None]
    a = a * (1 + np.array(L['hi'], np.float32) * l) + (1 - l) ** 3 * np.array(L['sh'], np.float32)
    l = (a @ np.array([.299, .587, .114], np.float32))[..., None]; a = l + (a - l) * L['sat']
    a = L['lift'] + a * (1 - L['lift'])
    d = np.sqrt(((xx - W / 2) / (W * .7)) ** 2 + ((yy - H * .48) / (H * .6)) ** 2); a = a * (1 - L['vig'] * np.clip(d - .35, 0, 1) ** 1.4)[..., None]
    out = np.clip(a, 0, 1) * 255 + np.random.default_rng(seed).normal(0, 3.0, (H, W))[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)
def zoom(im, z, cx=.5, cy=.42):
    if z == 1 and cx == .5: return im
    w, h = int(W * z), int(H * z); im = im.resize((w, h), Image.LANCZOS); x0 = int(np.clip((w - W) * cx, 0, w - W)); y0 = int(np.clip((h - H) * cy, 0, h - H))
    return im.crop((x0, y0, x0 + W, y0 + H))
def graded(t, z=1.0, cy=0., cx=None, look=None):
    return zoom(Image.fromarray(grade(raw(t), seed=int(t * 30), look=look)), z, C.cx if cx is None else cx, .42 + cy)
def alpha(t, d='alpha'):
    """RVM alpha for the source frame (precomputed by mattes.py into SC/v3k/<ad>/<d>/)."""
    s = src(t); p = f'{SC}/v3k/{C.ad}/{d}/{s:05d}.png'
    if not os.path.exists(p):
        for k in range(1, 12):
            for q in (s - k, s + k):
                pp = f'{SC}/v3k/{C.ad}/{d}/{q:05d}.png'
                if os.path.exists(pp): return np.asarray(Image.open(pp))
    return np.asarray(Image.open(p))
@lru_cache(None)
def _faces(ad):
    d = json.load(open(f'{SC}/bake/{ad}/faces.json')); return {int(k): v for k, v in d.items()}
def face_at(t):
    """tracked face centre (output px, 1080x1920) for the source frame at t; falls back to the ad default."""
    try:
        fc = _faces(C.ad); s = src(t); k = min(fc, key=lambda q: abs(q - s)); x, y, r = fc[k]; return x * 1.5, y * 1.5, r * 1.5
    except Exception: return C.face[0], C.face[1], 250
def block(t, w, h, zoom_k=1.0, look=None):
    """the graded take cropped into a w x h image block, framed on the tracked face."""
    g = Image.fromarray(grade(raw(t), seed=int(t * 30), look=look)); fx, fy, fr = face_at(t); s = max(w / W, h / H) * zoom_k
    im = g.resize((int(W * s), int(H * s)), Image.LANCZOS); ox = int(np.clip(fx * s - w / 2, 0, im.size[0] - w)); oy = int(np.clip(fy * s - h * .4, 0, im.size[1] - h))
    return im.crop((ox, oy, ox + w, oy + h))
# ---------------- strokes ----------------
@lru_cache(None)
def chalk_tex(): return Image.fromarray(((np.random.default_rng(77).random((H, W)) > .28) * 255).astype(np.uint8))
def stroke(im, pts, p=1., width=7, color=(255, 255, 255), seed=1, passes=3, alpha=230, rough=True):
    """hand-drawn line drawn progressively (p 0..1). rough=False gives a clean vector line."""
    if p <= 0: return
    n = max(2, int(len(pts) * cl(p))); pts = np.array(pts[:n], np.float32); L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    if not rough:
        d.line([tuple(q) for q in pts], fill=alpha, width=width, joint='curve'); L = L.filter(ImageFilter.GaussianBlur(.6)); im.paste(color, (0, 0), L); return
    r = np.random.default_rng(seed)
    for k in range(passes):
        j = pts + r.normal(0, 1.6, pts.shape); d.line([tuple(q) for q in j], fill=int(alpha * (1 - k * .18)), width=max(2, width - k * 2), joint='curve')
    L = ImageChops.multiply(L, chalk_tex()).filter(ImageFilter.GaussianBlur(.7)); im.paste(color, (0, 0), L)
def curve_pts(p0, p1, bend, n=40):
    (x0, y0), (x1, y1) = p0, p1; mx, my = (x0 + x1) / 2 - (y1 - y0) * bend, (y0 + y1) / 2 + (x1 - x0) * bend
    return [((1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1) for t in np.linspace(0, 1, n)]
def arrow(im, p0, p1, bend, p, color=(255, 255, 255), width=7, seed=2, head=34, rough=True):
    pts = curve_pts(p0, p1, bend); stroke(im, pts, eo(cl(p / .8)), width, color, seed, rough=rough)
    if p > .8:
        x1, y1 = p1; a = math.atan2(y1 - pts[-4][1], x1 - pts[-4][0]); q = inv(.8, 1, p)
        for s in (-.55, .55): stroke(im, [(x1, y1), (x1 - head * q * math.cos(a + s), y1 - head * q * math.sin(a + s))], 1, width, color, seed + 7, rough=rough)
# ---------------- text ----------------
def layer_text(s, f, track=0):
    w = int(f.getlength(s) + track * max(0, len(s) - 1)) + 40; h = int(f.size * 1.6); L = Image.new('L', (w, h), 0); d = ImageDraw.Draw(L); x = 20
    if track == 0: d.text((x, h * .5), s, font=f, fill=255, anchor='lm')
    else:
        for ch in s: d.text((x, h * .5), ch, font=f, fill=255, anchor='lm'); x += f.getlength(ch) + track
    return L, w, h
def text_w(s, f, track=0): return f.getlength(s) + track * max(0, len(s) - 1)
def put_text(im, xy, s, f, fill, anchor='m', track=0, alpha=1., shadow=0., shadow_blur=None, shadow_col=(0, 0, 0), dy=0, rot=0, scale=1.):
    if alpha <= 0: return
    L, w, h = layer_text(s, f, track)
    if rot: L = L.rotate(rot, expand=True, resample=Image.BICUBIC); w, h = L.size
    if scale != 1: L = L.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.BICUBIC); w, h = L.size
    if alpha < 1: L = L.point(lambda v: int(v * alpha))
    x = int(xy[0] - (w / 2 if anchor == 'm' else 20 * scale if anchor == 'l' else w - 20 * scale)); y = int(xy[1] - h / 2 + dy)
    if shadow: im.paste(shadow_col, (x, y + int(f.size * .04)), L.filter(ImageFilter.GaussianBlur(shadow_blur or f.size * .12)).point(lambda v: int(v * shadow)))
    im.paste(fill, (x, y), L)
def stamp(im, xy, s, f, fill, t0, t, track=0, from_scale=1.35, dur=.28, shadow=0., anchor='m', shadow_col=(0, 0, 0)):
    if t < t0: return
    p = eo5(cl((t - t0) / dur)); put_text(im, xy, s, f, fill, anchor, track, cl(p * 1.4), shadow, scale=lerp(from_scale, 1, p), shadow_col=shadow_col)
def rise(im, xy, s, f, fill, t0, t, track=0, dur=.45, dist=40, anchor='m', shadow=0., blur_in=True, shadow_col=(0, 0, 0)):
    """soft editorial reveal: rise + fade (+ slight blur clearing)."""
    if t < t0: return
    p = eo(cl((t - t0) / dur)); L, w, h = layer_text(s, f, track)
    if blur_in and p < 1: L = L.filter(ImageFilter.GaussianBlur((1 - p) * 8))
    L = L.point(lambda v: int(v * p)); x = int(xy[0] - (w / 2 if anchor == 'm' else 20 if anchor == 'l' else w - 20)); y = int(xy[1] - h / 2 + (1 - p) * dist)
    if shadow: im.paste(shadow_col, (x, y + 4), L.filter(ImageFilter.GaussianBlur(f.size * .12)).point(lambda v: int(v * shadow)))
    im.paste(fill, (x, y), L)
def write_on(im, xy, s, f, fill, t0, t, dur=None, anchor='m', shadow=0.):
    if t < t0: return
    L, w, h = layer_text(s, f); dur = dur or max(.25, len(s) * .03); q = eo(cl((t - t0) / dur)); m = np.zeros((h, w), np.uint8); m[:, :int(w * q)] = 255
    L = ImageChops.multiply(L, Image.fromarray(m)); x = int(xy[0] - (w / 2 if anchor == 'm' else 20)); y = int(xy[1] - h / 2)
    if shadow: im.paste((0, 0, 0), (x, y + 4), L.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * shadow)))
    im.paste(fill, (x, y), L)
def cap_words(im, t, lines, style, exit_at=1e9):
    """captions that build word-by-word on the spoken word times.
    lines: [(y, font, [(word, word_index, accent?), ...]), ...]; style: dict(c, acc, shadow, acc_font, track, gap, mode)"""
    q = 1 - eo(cl((t - exit_at) / .18))
    for y, f, words in lines:
        tr = style.get('track', 0); fa = style.get('acc_font') or f
        ws = [text_w(s, fa if a else f, tr) for s, _, a in words]; gap = style.get('gap', f.size * .26); x = W / 2 - (sum(ws) + gap * (len(ws) - 1)) / 2
        for (s, wi, a), w in zip(words, ws):
            if t >= OS(wi) - .02:
                p = eo(cl((t - OS(wi) + .02) / style.get('dur', .22))) * q
                if p > 0:
                    ff = fa if a else f; L, lw, lh = layer_text(s, ff, tr)
                    if style.get('mode') == 'blur' and p < 1: L = L.filter(ImageFilter.GaussianBlur((1 - p) * 7))
                    L = L.point(lambda v: int(v * p)); px, py = int(x - 20), int(y + (1 - p) * style.get('dist', 22) - lh / 2)
                    if style.get('shadow'): im.paste(style.get('shadow_col', (0, 0, 0)), (px, py + 5), L.filter(ImageFilter.GaussianBlur(ff.size * .13)).point(lambda v: int(v * style['shadow'])))
                    im.paste(style['acc'] if a else style['c'], (px, py), L)
            x += w + gap
def place(im, layer, cx, cy, shadow=.5, blur=40, off=(0, 40)):
    paste_shadow(im, layer, (int(cx - layer.size[0] / 2), int(cy - layer.size[1] / 2)), blur, shadow, off)
def scaled(layer, s, a=1.):
    if s != 1: layer = layer.resize((max(1, int(layer.size[0] * s)), max(1, int(layer.size[1] * s))), Image.BICUBIC)
    if a < 1: layer = layer.copy(); layer.putalpha(layer.split()[3].point(lambda v: int(v * a)))
    return layer
def rounded_mask(w, h, r):
    m = Image.new('L', (w * 2, h * 2), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w * 2 - 1, h * 2 - 1), r * 2, fill=255); return m.resize((w, h), Image.LANCZOS)
def grain(im, s=4, seed=0):
    a = np.asarray(im).astype(np.int16) + np.random.default_rng(seed).normal(0, s, (H, W, 1)).astype(np.int16); return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def vignette(im, k=.45): return mg.vignette(im, k)
# ---------------- glass ----------------
def glass(bg, box, r=44, blur=34, tint=(255, 255, 255), tint_a=.10, edge=(255, 255, 255), edge_a=.55, sheen=.16):
    """frosted glass panel over bg at box (x0,y0,x1,y1): returns RGBA layer the size of the box (blur of what's behind + tint + rim light + diagonal sheen)."""
    x0, y0, x1, y1 = [int(v) for v in box]; w, h = x1 - x0, y1 - y0; pad = blur * 2
    crop = bg.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad)).filter(ImageFilter.GaussianBlur(blur)).crop((pad, pad, pad + w, pad + h))
    a = np.asarray(crop).astype(np.float32); a = a * (1 - tint_a) + np.array(tint, np.float32) * tint_a
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); sh = np.clip(1 - (xx / w + yy / h) * .9, 0, 1) ** 2 * sheen * 255; a = np.clip(a + sh[..., None], 0, 255)
    lay = Image.fromarray(a.astype(np.uint8)).convert('RGBA'); m = rounded_mask(w, h, r); lay.putalpha(m)
    e = Image.new('L', (w * 2, h * 2), 0); ImageDraw.Draw(e).rounded_rectangle((1, 1, w * 2 - 2, h * 2 - 2), r * 2, outline=255, width=4); e = e.resize((w, h), Image.LANCZOS)
    g = np.clip(1.2 - (yy / h) * 1.1, .25, 1); e = Image.fromarray((np.asarray(e) * g * edge_a).astype(np.uint8)); lay.paste(edge + (255,), (0, 0), e); lay.putalpha(m)
    return lay
# ---------------- runner ----------------
def push(prev, cur, p, d):
    dx, dy = {'up': (0, -1), 'down': (0, 1), 'left': (-1, 0), 'right': (1, 0)}[d]; out = Image.new('RGB', (W, H))
    ox, oy = int(dx * p * W), int(dy * p * H); out.paste(prev, (ox, oy)); out.paste(cur, (ox - dx * W, oy - dy * H))
    if .05 < p < .95:
        k_ = int(28 * math.sin(p * math.pi)); a = np.asarray(out).astype(np.float32)
        kern = np.zeros((k_ * 2 + 1, 1) if dy else (1, k_ * 2 + 1), np.float32) + 1 / (k_ * 2 + 1); out = Image.fromarray(cv2.filter2D(a, -1, kern).clip(0, 255).astype(np.uint8))
    return out
def blend_tr(prev, cur, p, kind):
    if kind in ('up', 'down', 'left', 'right'): return push(prev, cur, p, kind)
    if kind == 'fade': return Image.blend(prev, cur, p)
    if kind == 'blur':      # dreamy blur dissolve
        b = math.sin(p * math.pi) * 18; a = prev.filter(ImageFilter.GaussianBlur(b)) if b > .5 else prev; c = cur.filter(ImageFilter.GaussianBlur(b)) if b > .5 else cur; return Image.blend(a, c, eio(p))
    if kind == 'zoom':      # scale-through: outgoing scales up + fades, incoming settles from 1.08
        a = zoom(prev, 1 + .25 * p); c = zoom(cur, 1 + .08 * (1 - p)); return Image.blend(a, c, eio(p))
    if kind == 'flash':
        out = Image.blend(prev, cur, eio(p)); f = math.sin(p * math.pi) ** 2 * .85; return Image.blend(out, Image.new('RGB', (W, H), (255, 255, 255)), f)
    if kind == 'leak':      # warm film light-leak dissolve
        out = Image.blend(prev, cur, eio(p)); f = math.sin(p * math.pi); yy, xx = _grid(); g = np.exp(-(((xx - W * (.2 + .6 * p)) / 700) ** 2 + ((yy - H * .35) / 900) ** 2))
        a = np.asarray(out).astype(np.float32); a = a * (1 - .12 * f) + g[..., None] * np.array([255, 160, 96], np.float32) * f * .38; a = a * (1 + .06 * f)
        return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if kind == 'wipe':      # solid colour panel sweeps across (Swiss)
        col = globals().get('WIPE_COL', (40, 64, 255)); out = (prev if p < .5 else cur).copy(); d = ImageDraw.Draw(out)
        if p < .5: d.rectangle((0, 0, int(W * eo5(p * 2)), H), fill=col)
        else: d.rectangle((int(W * eio((p - .5) * 2)), 0, W, H), fill=col)
        return out
    if kind == 'iris':      # circle reveal from centre
        m = Image.new('L', (W, H), 0); r = eio(p) * 1200; ImageDraw.Draw(m).ellipse((W / 2 - r, H * .48 - r, W / 2 + r, H * .48 + r), fill=255); out = prev.copy(); out.paste(cur, (0, 0), m.filter(ImageFilter.GaussianBlur(4))); return out
    return cur
def make_frame(SCENES, TR=.36):
    def frame(i, out_dir):
        t = i / FPS; k = max(j for j, s in enumerate(SCENES) if t >= s[0]); t0, fn, tr = SCENES[k][:3]; dur = SCENES[k][3] if len(SCENES[k]) > 3 else TR
        cur = fn(t)
        if tr and k > 0 and t < t0 + dur:
            p = cl((t - t0) / dur); prev = SCENES[k - 1][1](min(t, t0 - 1e-3)); cur = blend_tr(prev, cur, eio(p) if tr in ('up', 'down', 'left', 'right') else p, tr)
        cur.save(f'{out_dir}/f{i:05d}.jpg', quality=93); return i
    return frame
_FR = None
def _work(a): return _FR(*a)
def run(frame_fn):
    global _FR
    from multiprocessing import Pool
    import time
    out = sys.argv[1]; os.makedirs(out, exist_ok=True); args = sys.argv[2:]
    frames = [int(x) for x in args[args.index('--frames') + 1].split(',')] if '--frames' in args else list(range(C.N))
    nw = int(args[args.index('--workers') + 1]) if '--workers' in args else 4
    _FR = frame_fn; t0 = time.time()
    with Pool(nw) as p:
        for j, i in enumerate(p.imap_unordered(_work, [(i, out) for i in frames], chunksize=3)):
            if j % 90 == 0: print(j, '/', len(frames), round((time.time() - t0) / (j + 1), 2), 's/frame', flush=True)
    print('done', len(frames), round(time.time() - t0), 's')

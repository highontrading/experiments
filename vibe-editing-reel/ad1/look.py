"""Ad 1 premium look library: theme, typography, grading and compositing (PIL + numpy).
Used both for the storyboard frames and as the spec the final renderer follows."""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(HERE, '..', 'build', 'fonts'); ID = '/usr/share/fonts/opentype/inter'
W, H = 1080, 1920
# ---------------- theme ----------------
INK = (17, 15, 14); PAPER = (236, 231, 223); EMBER = (242, 100, 30); GOLD = (255, 196, 92)
CREAM = (246, 240, 230); MUTED = (140, 131, 123); CARD = (24, 22, 21)
def font(name, size):
    p = {'disp': f'{ID}/InterDisplay-ExtraBold.otf', 'black': f'{ID}/InterDisplay-Black.otf', 'semi': f'{ID}/InterDisplay-SemiBold.otf',
         'med': f'{ID}/InterDisplay-Medium.otf', 'blackit': f'{ID}/InterDisplay-BlackItalic.otf',
         'serif': f'{FD}/InstrumentSerif-Italic.ttf', 'mono': f'{FD}/JetBrainsMono-Medium.ttf', 'monob': f'{FD}/JetBrainsMono-Bold.ttf',
         'generic': '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'}[name]
    return ImageFont.truetype(p, size)
# ---------------- text ----------------
def text_w(s, f, track=0): return f.getlength(s) + track * max(0, len(s) - 1)
def draw_text(img, xy, s, f, fill, track=0, anchor='ms', glow=None, shadow=.35, stroke=0, stroke_fill=None):
    """Tracked text with optional soft glow and soft drop shadow. anchor: m=centre/l=left x, s=baseline."""
    w = text_w(s, f, track); x, y = xy
    if anchor[0] == 'm': x -= w / 2
    elif anchor[0] == 'r': x -= w
    layer = Image.new('L', img.size, 0); d = ImageDraw.Draw(layer)
    for i, ch in enumerate(s):
        cx = x + f.getlength(s[:i]) + track * i
        d.text((cx, y), ch, font=f, fill=255, anchor='ls', stroke_width=stroke, stroke_fill=255)
    if shadow:
        sh = layer.filter(ImageFilter.GaussianBlur(f.size * .12)); sh = ImageChops.offset(sh, 0, int(f.size * .05))
        img.paste(Image.new('RGB', img.size, (0, 0, 0)), (0, 0), sh.point(lambda v: int(v * shadow)))
    if glow:
        gcol, ga, gr = glow
        g = layer.filter(ImageFilter.GaussianBlur(gr)); img.paste(Image.new('RGB', img.size, gcol), (0, 0), g.point(lambda v: int(min(255, v * ga))))
    if stroke_fill is not None:
        ol = Image.new('L', img.size, 0); od = ImageDraw.Draw(ol)
        for i, ch in enumerate(s):
            od.text((x + f.getlength(s[:i]) + track * i, y), ch, font=f, fill=255, anchor='ls', stroke_width=stroke + 6, stroke_fill=255)
        img.paste(Image.new('RGB', img.size, stroke_fill), (0, 0), ol)
    if isinstance(fill, Image.Image): img.paste(fill, (0, 0), layer)
    else: img.paste(Image.new('RGB', img.size, fill), (0, 0), layer)
    return w
def caption(img, lines, cx=W // 2):
    """lines: [(text, fontname, size, colour, y, track, glow)]"""
    for s, fn, sz, col, y, tr, gl in lines: draw_text(img, (cx, y), s, font(fn, sz), col, tr, glow=gl)
# ---------------- grading / compositing ----------------
def grain(img, amt=.045, seed=1):
    r = np.random.default_rng(seed).normal(0, 255 * amt, (img.size[1], img.size[0], 1))
    a = np.asarray(img).astype(np.float32) + r; return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def vignette(img, strength=.55, cy=.45):
    yy, xx = np.mgrid[0:img.size[1], 0:img.size[0]].astype(np.float32)
    d = np.sqrt(((xx - img.size[0] / 2) / (img.size[0] * .75)) ** 2 + ((yy - img.size[1] * cy) / (img.size[1] * .62)) ** 2)
    m = 1 - strength * np.clip(d - .35, 0, 1) ** 1.6
    return Image.fromarray((np.asarray(img).astype(np.float32) * m[..., None]).clip(0, 255).astype(np.uint8))
def cinematic_set(room_path, cam):
    """Dark, low-key, out-of-focus set from an AI room: no colour wash, just exposure, softness and depth."""
    im = Image.open(room_path).convert('RGB'); s = max(W / im.width, H / im.height) * (1.12 + (cam['z'] - 1) * .25)
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    ox = (im.width - W) // 2 + int(cam.get('px', 0)); oy = (im.height - H) // 2 + int(cam.get('py', 0))
    im = im.crop((ox, oy, ox + W, oy + H)).filter(ImageFilter.GaussianBlur(16 + cam['z'] * 4))
    a = np.asarray(im).astype(np.float32) / 255
    lum = a @ np.array([.299, .587, .114])
    a = a * .5; a = a + (lum[..., None] ** 2.5) * np.array([.6, .4, .2]) * .7       # keep practicals glowing, crush the rest
    a = a * (1 - .45 * np.linspace(0, 1, H)[:, None, None] ** 2)                     # floor falls into shadow
    return Image.fromarray((a.clip(0, 1) * 255).astype(np.uint8))
def place_subject(bg, fg_rgba, cam, rim=True, rim_side='right', expo=.9):
    """Scale/position the matted subject, relight (key on face, falloff on body, warm rim, light wrap) and composite."""
    z, fx, fy = cam['z'], cam['fx'], cam['fy']; k = 1.5 * z
    sub = fg_rgba.resize((int(720 * k), int(1280 * k)), Image.LANCZOS)
    ox, oy = int(cam['sx'] - fx * k), int(cam['sy'] - fy * k)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lay.paste(sub, (ox, oy))
    a = np.asarray(lay).astype(np.float32) / 255; rgb, al = a[..., :3], a[..., 3:]
    lum = rgb @ np.array([.299, .587, .114])
    rgb = np.clip((rgb - .5) * 1.1 + .48, 0, 1)                                         # gentle S
    rgb = rgb * (1 + np.array([.05, .012, -.05]) * lum[..., None]) * expo                      # warm highlights only
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    fcx, fcy = cam['sx'] + (cam.get('face_dx', 0)) * k, cam['sy'] + cam.get('face_dy', 0) * k
    key = np.exp(-(((xx - fcx) / (420 * k / 1.5)) ** 2 + ((yy - fcy) / (520 * k / 1.5)) ** 2))
    rgb = rgb * (.62 + .44 * key[..., None])                                            # key on face, body falls off
    if rim:
        A = (al[..., 0] * 255).astype(np.uint8); Ai = Image.fromarray(A)
        er = np.asarray(Ai.filter(ImageFilter.MinFilter(9))).astype(np.float32) / 255
        edge = np.clip(al[..., 0] - er, 0, 1); edge = np.asarray(Image.fromarray((edge * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
        side = (np.clip((xx / W) * 1.3 - .3, 0, 1) if rim_side == 'right' else np.clip(1 - (xx / W) * 1.3, 0, 1)) * np.clip(1.2 - yy / (H * .9), 0, 1)
        rgb = rgb + edge[..., None] * side[..., None] * np.array([1.0, .74, .45]) * .55
        b = np.asarray(bg.filter(ImageFilter.GaussianBlur(24))).astype(np.float32) / 255
        rgb = rgb * (1 - edge[..., None] * .35) + b * edge[..., None] * .35             # light wrap
    out = np.asarray(bg).astype(np.float32) / 255 * (1 - al) + np.clip(rgb, 0, 1) * al
    return Image.fromarray((out * 255).astype(np.uint8)), lay.split()[3]
def raw_frame(raw_path, z=1.0, cx=360, cy=640):
    im = Image.open(raw_path).convert('RGB'); k = 1.5 * z
    im = im.resize((int(720 * k), int(1280 * k)), Image.LANCZOS)
    ox = int(cx * k - W / 2); oy = int(cy * k - H / 2); ox = max(0, min(ox, im.width - W)); oy = max(0, min(oy, im.height - H))
    return im.crop((ox, oy, ox + W, oy + H))
def paper_bg(seed=3, ember=True):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, 1, (H // 8, W // 8)); n = np.asarray(Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(10))).astype(np.float32) / 255
    folds = np.zeros((H, W), np.float32); yy, xx = np.mgrid[0:H, 0:W]
    for _ in range(14):
        a = rng.uniform(0, np.pi); c = rng.uniform(-800, 800); d = np.abs(np.cos(a) * (xx - W / 2) + np.sin(a) * (yy - H / 2) - c)
        folds += np.exp(-d / rng.uniform(8, 30)) * rng.uniform(-.05, .07)
    base = np.array(PAPER, np.float32) / 255
    a = base[None, None] * (0.94 + .08 * n[..., None] + folds[..., None])
    if ember:
        g = np.exp(-(((xx - W * .85) / 700.) ** 2 + ((yy - H * .12) / 600.) ** 2)) + .7 * np.exp(-(((xx - W * .05) / 600.) ** 2 + ((yy - H * .95) / 500.) ** 2))
        a = a * (1 - .22 * g[..., None]) + np.array(EMBER, np.float32)[None, None] / 255 * .22 * g[..., None]
    return grain(Image.fromarray((a.clip(0, 1) * 255).astype(np.uint8)), .02, seed)
def rounded(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), r, fill=255); return m
def card_shadow(canvas, box, r=44, blur=40, a=.38, dy=24):
    sh = Image.new('L', canvas.size, 0); ImageDraw.Draw(sh).rounded_rectangle((box[0], box[1] + dy, box[2], box[3] + dy), r, fill=int(255 * a))
    canvas.paste(Image.new('RGB', canvas.size, (40, 25, 15)), (0, 0), sh.filter(ImageFilter.GaussianBlur(blur)))
def paste_card(canvas, im, xy, r=44, shadow=True):
    if shadow: card_shadow(canvas, (xy[0], xy[1], xy[0] + im.size[0], xy[1] + im.size[1]), r)
    canvas.paste(im, xy, rounded(im, r))

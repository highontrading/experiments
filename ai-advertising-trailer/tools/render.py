"""Frame-accurate renderer. ORIENT=H -> 1920x1080 (YouTube), ORIENT=V -> 1080x1920 (Instagram Reels)."""
import os, sys, json, subprocess, functools, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edl import *

ORIENT = os.environ.get('ORIENT', 'H')
W, H = (1920, 1080) if ORIENT == 'H' else (1080, 1920)
OUT = f'{SP}/render'; os.makedirs(OUT, exist_ok=True)
INTER = '/usr/share/fonts/opentype/inter/Inter-{}.otf'
F_MONO = f'{SP}/fonts/JetBrains_Mono_wght_500.ttf'
F_ST8 = f'{SP}/fonts/Big_Shoulders_Stencil_wght_800.ttf'
rng = np.random.default_rng(47)

@functools.lru_cache(None)
def dims(src):
    o = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                                   '-of', 'json', src], stdout=subprocess.PIPE).stdout)['streams'][0]
    return o['width'], o['height']

def best_source(src):
    # for 9:16 crops of horizontal footage, use the 4K original when it exists
    if ORIENT == 'V' and '/px/' in src:
        orig = src.replace('/px/', '/drive/')
        if os.path.exists(orig):
            w, h = dims(orig)
            if w > h and h >= 1440: return orig
    return src

def run(cmd, n):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    buf = np.frombuffer(p.stdout, np.uint8); k = len(buf) // (W * H * 3)
    if k == 0: raise RuntimeError(' '.join(cmd) + '\n' + p.stderr.decode()[-800:])
    fr = buf[:k * W * H * 3].reshape(k, H, W, 3)
    if k < n: fr = np.concatenate([fr, np.repeat(fr[-1:], n - k, 0)])
    return fr[:n]

def cover(z=1.0, cy=0.5, cx=0.5):
    return (f"scale={int(W*z)}:{int(H*z)}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={W}:{H}:(iw-{W})*{cx}:(ih-{H})*{cy}")
def blurfit():
    return (f"split[a][b];[a]{cover()},boxblur=40:3,eq=brightness=-0.2:saturation=0.85[bg];"
            f"[b]scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2")

def framing(src, o):
    w, h = dims(src); vert = h > w
    if ORIENT == 'H':
        mode = o.get('hmode') or ('blurfit' if vert else 'fill')
        return mode, o.get('zoom', 1.0), o.get('cy', 0.5), o.get('cx', 0.5)
    if vert: return 'fill', 1.0, o.get('vcy', 0.5), 0.5
    return o.get('vmode', 'fill'), o.get('vzoom', 1.0), o.get('vcy', 0.5), o.get('vcx', 0.5)

def vid(src, t, o, n):
    src = best_source(src)
    mode, z, cy, cx = framing(src, o)
    sp = o.get('speed', 1.0)
    pre = f"setpts=PTS/{sp}," if sp != 1 else ""
    if sp < 1: pre += "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,"
    pre += "fps=24,"
    vf = pre + (cover(z, cy, cx) if mode == 'fill' else blurfit())
    fr = run(['ffmpeg', '-v', 'error', '-ss', str(t), '-t', str(n / 24 * sp + 2), '-i', src, '-filter_complex', vf,
              '-frames:v', str(n), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], n)
    if o.get('push'): fr = push(fr, o['push'])
    return fr

def push(fr, amt):
    out = []
    for k, f in enumerate(fr):
        z = 1 + amt * k / max(1, len(fr) - 1); im = Image.fromarray(f); cw, ch = W / z, H / z
        out.append(np.asarray(im.resize((W, H), Image.BILINEAR, box=((W - cw) / 2, (H - ch) / 2, (W + cw) / 2, (H + ch) / 2))))
    return np.stack(out)

def still(path, o, n):
    im = Image.open(path).convert('RGB')
    mode = o.get('vmode', 'fill') if ORIENT == 'V' else o.get('hmode', 'fill')
    cy = o.get('cy', 0.5) if ORIENT == 'H' else o.get('vcy', 0.5)
    amt = o.get('push', 0.0)
    if mode == 'blurfit':
        s = max(W / im.width, H / im.height)
        bg = im.resize((int(im.width * s), int(im.height * s))).crop((0, 0, W, H)).filter(ImageFilter.GaussianBlur(40))
        bg = Image.eval(bg, lambda v: int(v * 0.7))
        f = min(W / im.width, H / im.height); fg = im.resize((int(im.width * f), int(im.height * f)), Image.LANCZOS)
        bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2)); base = np.asarray(bg)
        fr = np.repeat(base[None], n, 0)
        return push(fr, amt) if amt else fr
    s = max(W / im.width, H / im.height); bw, bh = im.width * s, im.height * s
    ox, oy = (bw - W) * 0.5, (bh - H) * cy
    out = []
    for k in range(n):
        z = 1 + amt * k / max(1, n - 1); cw, ch = W / z, H / z
        x0 = (ox + (W - cw) / 2) / s; y0 = (oy + (H - ch) / 2) / s
        out.append(np.asarray(im.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + cw / s, y0 + ch / s))))
    return np.stack(out)

# ---------------- text ----------------
def font(p, s): return ImageFont.truetype(p, s)
def text_layer(txt, fnt, fill=(255, 255, 255), tracking=0, shadow=True, alpha=1.0):
    d = ImageDraw.Draw(Image.new('L', (1, 1)))
    widths = [d.textlength(c, font=fnt) for c in txt]
    tw = int(sum(widths) + tracking * (len(txt) - 1)) + 40
    asc, desc = fnt.getmetrics(); th = asc + desc + 40
    a = Image.new('L', (tw, th), 0); dd = ImageDraw.Draw(a); x = 20
    for c, w_ in zip(txt, widths): dd.text((x, 20), c, font=fnt, fill=255); x += w_ + tracking
    if alpha < 1: a = a.point(lambda v: int(v * alpha))
    rgba = Image.new('RGBA', (tw, th), fill + (0,)); rgba.putalpha(a)
    if not shadow: return rgba
    sh = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); sh.putalpha(a.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.8)))
    base = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); base.alpha_composite(sh, (0, 3)); base.alpha_composite(rgba)
    return base

SUBF = font(INTER.format('Bold'), 52 if ORIENT == 'H' else 58)
SUB_Y = 1008 if ORIENT == 'H' else 1390
_sub_cache = {}
def sub_img(t):
    if t in _sub_cache: return _sub_cache[t]
    one = text_layer(t, SUBF, tracking=1)
    if one.width <= W - 100: _sub_cache[t] = one; return one
    words = t.split(); best = None
    for k in range(1, len(words)):
        a, b = ' '.join(words[:k]), ' '.join(words[k:]); m = max(SUBF.getlength(a), SUBF.getlength(b))
        if best is None or m < best[0]: best = (m, a, b)
    la, lb = text_layer(best[1], SUBF, tracking=1), text_layer(best[2], SUBF, tracking=1)
    out = Image.new('RGBA', (max(la.width, lb.width), la.height + lb.height - 46), (0, 0, 0, 0))
    out.alpha_composite(la, ((out.width - la.width) // 2, 0)); out.alpha_composite(lb, ((out.width - lb.width) // 2, la.height - 46))
    _sub_cache[t] = out; return out
WM = text_layer('IDEABRO STUDIO', font(F_ST8, 34 if ORIENT == 'H' else 38), tracking=3, shadow=False, alpha=0.72)
WM_XY = (W - WM.width - 34, 34) if ORIENT == 'H' else (W - WM.width - 40, 150)

def composite(frame, layers):
    im = Image.fromarray(frame).convert('RGBA')
    for lay, xy in layers: im.alpha_composite(lay, xy)
    return np.asarray(im.convert('RGB'))

# ---------------- glitch toolkit ----------------
def rgb_split(f, d):
    o = f.copy(); o[..., 0] = np.roll(f[..., 0], -d, 1); o[..., 2] = np.roll(f[..., 2], d, 1); return o
def slices(f, k, amp):
    o = f.copy()
    for _ in range(k):
        y = rng.integers(0, H - 10); h = rng.integers(6, 90); o[y:y + h] = np.roll(o[y:y + h], rng.integers(-amp, amp), 1)
    return o
def blocks(f, k, tint=True):
    o = f.copy()
    for _ in range(k):
        bw_, bh_ = rng.integers(120, min(700, W - 10)), rng.integers(40, 260); x = rng.integers(0, W - bw_); y = rng.integers(0, H - bh_)
        reg = o[y:y + bh_, x:x + bw_]; b = 24
        reg = np.repeat(np.repeat(reg[::b, ::b], b, 0), b, 1)[:bh_, :bw_]
        if tint: reg = np.clip(reg * np.array(rng.choice([[0.4, 1.3, 0.5], [1.3, 0.4, 1.2], [0.7, 0.7, 0.7]])), 0, 255)
        o[y:y + bh_, x:x + bw_] = reg
    return o
COLS = np.array([[255, 0, 160], [255, 220, 0], [0, 230, 255], [0, 255, 90], [255, 255, 255], [255, 60, 0]], np.float32)
def bars(f, k, alpha=0.85):
    o = f.astype(np.float32)
    for _ in range(k):
        y = rng.integers(0, H); h = rng.integers(2, 40); o[y:y + h] = o[y:y + h] * (1 - alpha) + COLS[rng.integers(0, 6)] * alpha
    return o.astype(np.uint8)
def pixelate(f, b): return np.repeat(np.repeat(f[::b, ::b], b, 0), b, 1)[:H, :W]
def noise_frame():
    out = np.zeros((H, W, 3), np.uint8); y = 0
    cols = np.array([[255, 0, 160], [255, 220, 0], [0, 230, 255], [0, 255, 90], [255, 255, 255], [20, 20, 20], [120, 0, 255]])
    while y < H:
        h = int(rng.integers(4, 60)); out[y:y + h] = cols[rng.integers(0, 7)]; y += h
    return np.clip(out.astype(np.int16) - rng.integers(0, 80, (H, W, 1)), 0, 255).astype(np.uint8)
ERR = text_layer('ERROR_404 // SHOOT_NOT_FOUND 0101 0110', font(F_MONO, 44 if ORIENT == 'H' else 30), shadow=False)

def glitch(f, style, k, n):
    p = k / max(1, n - 1)
    if style == 'open':
        if k < 3: return noise_frame()
        amt = 1 - p
        f = slices(rgb_split(f, int(30 * amt)), int(14 * amt) + 1, int(260 * amt) + 2)
        if k in (3, 4, 8): f = blocks(f, 8)
        if k in (4, 5, 6): f = bars(f, 10)
        if k in (5, 6): f = composite(f, [(ERR, ((W - ERR.width) // 2, H // 2 - 60))])
        return f
    if style == 'out':
        f = blocks(rgb_split(f, 20), 6); return pixelate(f, 36) if k == n - 1 else f
    if style == 'pixel':
        return [blocks(f, 10), pixelate(f, 60), pixelate(blocks(f, 4), 30)][k]
    if style == 'melt':
        f = slices(rgb_split(f, 24), 16, 300)
        if k > 2: f = blocks(f, 8, tint=False)
        f = (f.astype(np.float32) * np.array([0.7, 0.8, 1.0]) * 0.8).astype(np.uint8)
        if ORIENT == 'H': f[:, :150] = 0; f[:, -150:] = 0
        else: f[:150] = 0; f[-150:] = 0
        return f
    return f

# ---------------- end card: clean, high-contrast, readable ----------------
def build_card():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    logo = Image.open(i(32)).convert('L'); logo = logo.crop(logo.point(lambda v: 255 if v > 128 else 0).getbbox())
    lh = 120 if ORIENT == 'H' else 150
    logo = logo.resize((int(logo.width * lh / logo.height), lh), Image.LANCZOS)
    la = Image.new('RGBA', logo.size, (255, 255, 255, 0)); la.putalpha(logo)
    black = INTER.format('Black'); med = INTER.format('Medium'); semi = INTER.format('SemiBold')
    if ORIENT == 'H':
        items = [(la, 54),
                 (text_layer('AI IN ADVERTISING', font(black, 150), shadow=False), 22),
                 (text_layer('Shoot-quality ads, without the shoot.', font(med, 52), shadow=False), 46),
                 ('rule', 40),
                 (text_layer('IDEABRO STUDIO   ·   ENROLL NOW', font(semi, 32), tracking=6, shadow=False, alpha=0.9), 0)]
    else:
        items = [(la, 70),
                 (text_layer('AI IN', font(black, 138), shadow=False), -44),
                 (text_layer('ADVERTISING', font(black, 132), shadow=False), 40),
                 (text_layer('Shoot-quality ads,', font(med, 58), shadow=False), 4),
                 (text_layer('without the shoot.', font(med, 58), shadow=False), 50),
                 ('rule', 46),
                 (text_layer('IDEABRO STUDIO  ·  ENROLL NOW', font(semi, 34), tracking=5, shadow=False, alpha=0.9), 0)]
    RULE_H = 3
    def hgt(it): return RULE_H if it == 'rule' else (it.height - (40 if it is not la else 0))
    total = sum(hgt(it) + gap for it, gap in items)
    y = (H - total) // 2 - (0 if ORIENT == 'H' else 60)
    dr = ImageDraw.Draw(im)
    for it, gap in items:
        if it == 'rule':
            dr.rectangle([W // 2 - 60, y, W // 2 + 60, y + RULE_H], fill=(255, 255, 255, 140)); y += RULE_H + gap; continue
        off = 0 if it is la else 20
        im.alpha_composite(it, ((W - it.width) // 2, y - off)); y += hgt(it) + gap
    return np.asarray(im.convert('RGB'))
CARD = build_card()

def logo_glitch(prev, k):
    if k == 0: return slices(np.repeat(prev[::8], 8, 0)[:H], 20, 200)
    if k in (1, 2):
        o = (prev * 0.35).astype(np.uint8); return bars(slices(o, 20, 400), 8, 0.6)
    if k in (3, 4):
        o = bars((prev * 0.2).astype(np.uint8), 18, 1.0)
        if k == 4: o[int(H * 0.45):int(H * 0.45) + 60] = 255
        return o
    b = [28, 14, 7, 3][min(k - 5, 3)] if k < 9 else 1
    o = CARD.copy() if b == 1 else pixelate(CARD, b)
    if k < 9:
        o = rgb_split(o, 12 - 3 * (k - 5))
        for yy in (int(H * 0.18), int(H * 0.82)):
            for j in range(6): o[yy + j * 4: yy + j * 4 + 3] = [[255, 0, 160], [255, 220, 0], [0, 230, 255], [0, 255, 90], [255, 255, 255], [120, 0, 255]][j]
    return o

def frames_for(shot, n):
    k = shot[0]
    if k == 'vid': return vid(shot[1], shot[2], shot[3], n)
    if k == 'still': return still(shot[1], shot[2], n)
    if k == 'black': return np.zeros((n, H, W, 3), np.uint8)
    if k == 'noise': return np.stack([noise_frame() for _ in range(n)])
    if k == 'card': return np.repeat(CARD[None], n, 0)

def main(lo=0, hi=TOTAL, out=None):
    out = out or f'{OUT}/video_{ORIENT}.mp4'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24',
                            '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    subs = SUBS + LABELS; prev = None
    for s, e, shot in S:
        if e <= lo or s >= hi: continue
        fr = frames_for(shot, e - s)
        print(f'{s:5d}-{e:5d} {shot[0]} {os.path.basename(str(shot[1]))[:28] if len(shot) > 1 else ""}', flush=True)
        for j, f in enumerate(fr):
            g = s + j
            if g < lo or g >= hi: continue
            for gs, ge, st in GLITCH:
                if gs <= g < ge and st != 'logo': f = glitch(f, st, g - gs, ge - gs)
            if 1690 <= g < 1701: f = logo_glitch(prev if prev is not None else f, g - 1690)
            layers = []
            if g < 1690: layers.append((WM, WM_XY))
            for ss, se, t in subs:
                if ss <= g < se:
                    L = sub_img(t); layers.append((L, ((W - L.width) // 2, SUB_Y - L.height // 2)))
            if layers: f = composite(np.ascontiguousarray(f), layers)
            if FADE[0] <= g:
                a = max(0.0, 1 - (g - FADE[0]) / (FADE[1] - FADE[0])); f = (f * a).astype(np.uint8)
            if g < 1690: prev = f
            enc.stdin.write(np.ascontiguousarray(f, np.uint8).tobytes())
    enc.stdin.close(); enc.wait()

if __name__ == '__main__':
    a = sys.argv[1:]
    if a: main(int(a[0]), int(a[1]), a[2])
    else: main()

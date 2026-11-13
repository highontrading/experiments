import os, sys, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edl import *

W, H = 1920, 1080
OUT = f'{SP}/render'; os.makedirs(OUT, exist_ok=True)
F_SUB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
F_MED = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
F_ST8 = f'{SP}/fonts/Big_Shoulders_Stencil_wght_800.ttf'
F_ST6 = f'{SP}/fonts/Big_Shoulders_Stencil_wght_600.ttf'
F_MONO = f'{SP}/fonts/JetBrains_Mono_wght_500.ttf'
rng = np.random.default_rng(47)

def run(cmd, n):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    buf = np.frombuffer(p.stdout, np.uint8)
    k = len(buf) // (W * H * 3)
    if k == 0: raise RuntimeError(p.stderr.decode()[-800:])
    fr = buf[:k * W * H * 3].reshape(k, H, W, 3)
    if k < n: fr = np.concatenate([fr, np.repeat(fr[-1:], n - k, 0)])
    return fr[:n]

def cover(z=1.0, cy=0.5, cx=0.5):
    return (f"scale={int(W*z)}:{int(H*z)}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={W}:{H}:(iw-{W})*{cx}:(ih-{H})*{cy}")

def vid(src, t, mode, o, n):
    sp = o.get('speed', 1.0)
    pre = f"setpts=PTS/{sp}," if sp != 1 else ""
    if sp < 1: pre += "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,"
    pre += "fps=24,"
    if mode == 'fill':
        vf = pre + cover(o.get('zoom', 1.0), o.get('cy', 0.5), o.get('cx', 0.5))
    elif mode == 'pill':
        vf = pre + f"scale=-2:{H}:flags=lanczos,pad={W}:{H}:(ow-iw)/2:0:black"
    else:  # pillblur
        vf = (pre + f"split[a][b];[a]{cover()},boxblur=40:3,eq=brightness=-0.18:saturation=0.8[bg];"
              f"[b]scale=-2:{H}:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:0")
    need = n / 24 * 1.0 / 1 * sp + 1.0
    fr = run(['ffmpeg', '-v', 'error', '-ss', str(t), '-t', str(need + 1), '-i', src, '-filter_complex', vf,
              '-frames:v', str(n), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], n)
    if o.get('push'): fr = push(fr, o['push'])
    return fr

def push(fr, amt):
    out = []
    for k, f in enumerate(fr):
        z = 1 + amt * k / max(1, len(fr) - 1)
        im = Image.fromarray(f); cw, ch = W / z, H / z
        im = im.resize((W, H), Image.BILINEAR, box=((W - cw) / 2, (H - ch) / 2, (W + cw) / 2, (H + ch) / 2))
        out.append(np.asarray(im))
    return np.stack(out)

def tri(items, n):
    cols = []
    for src, t in items:
        vf = f"fps=24,scale=640:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=640:1080,pad={W}:{H}:0:0"
        cols.append(run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', src, '-vf', vf, '-frames:v', str(n),
                         '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], n)[:, :, :640])
    fr = np.concatenate(cols, 2).copy()
    fr[:, :, 637:643] = 0; fr[:, :, 1277:1283] = 0
    return fr

_still_cache = {}
def still(path, mode, o, n):
    im = Image.open(path).convert('RGB')
    cy = o.get('cy', 0.5); amt = o.get('push', 0.0)
    s = max(W / im.width, H / im.height)
    bw, bh = im.width * s, im.height * s
    ox, oy = (bw - W) * 0.5, (bh - H) * cy
    out = []
    for k in range(n):
        z = 1 + amt * k / max(1, n - 1)
        cw, ch = W / z, H / z
        x0 = (ox + (W - cw) / 2) / s; y0 = (oy + (H - ch) / 2) / s
        out.append(np.asarray(im.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + cw / s, y0 + ch / s))))
    return np.stack(out)

# ---------------- text ----------------
def font(p, s): return ImageFont.truetype(p, s)
def text_layer(txt, fnt, fill=(255, 255, 255), tracking=0, shadow=True):
    d = ImageDraw.Draw(Image.new('L', (1, 1)))
    widths = [d.textlength(c, font=fnt) for c in txt]
    tw = int(sum(widths) + tracking * (len(txt) - 1)) + 40
    asc, desc = fnt.getmetrics(); th = asc + desc + 40
    a = Image.new('L', (tw, th), 0); dd = ImageDraw.Draw(a); x = 20
    for c, w_ in zip(txt, widths): dd.text((x, 20), c, font=fnt, fill=255); x += w_ + tracking
    rgba = Image.new('RGBA', (tw, th), fill + (0,)); rgba.putalpha(a)
    if shadow:
        sh = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); sh.putalpha(a.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.75)))
        base = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); base.alpha_composite(sh, (0, 3)); base.alpha_composite(rgba)
        return base
    return rgba

SUBF = font(F_SUB, 52)
_sub_cache = {}
def sub_img(t):
    if t not in _sub_cache: _sub_cache[t] = text_layer(t, SUBF, tracking=1)
    return _sub_cache[t]
WM = text_layer('IDEABRO STUDIO', font(F_ST8, 34), tracking=3, shadow=False)
WM.putalpha(WM.getchannel('A').point(lambda v: int(v * 0.72)))

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
        bw_, bh_ = rng.integers(120, 700), rng.integers(40, 260); x = rng.integers(0, W - bw_); y = rng.integers(0, H - bh_)
        reg = o[y:y + bh_, x:x + bw_]; b = 24
        sm = reg[::b, ::b]; reg = np.repeat(np.repeat(sm, b, 0), b, 1)[:bh_, :bw_]
        if tint: reg = np.clip(reg * np.array(rng.choice([[0.4, 1.3, 0.5], [1.3, 0.4, 1.2], [0.7, 0.7, 0.7]])), 0, 255)
        o[y:y + bh_, x:x + bw_] = reg
    return o
def bars(f, k, alpha=0.85):
    o = f.astype(np.float32)
    cols = np.array([[255, 0, 160], [255, 220, 0], [0, 230, 255], [0, 255, 90], [255, 255, 255], [255, 60, 0]], np.float32)
    for _ in range(k):
        y = rng.integers(0, H); h = rng.integers(2, 40); c = cols[rng.integers(0, len(cols))]
        o[y:y + h] = o[y:y + h] * (1 - alpha) + c * alpha
    return o.astype(np.uint8)
def pixelate(f, b):
    sm = f[::b, ::b]; return np.repeat(np.repeat(sm, b, 0), b, 1)[:H, :W]
def noise_frame():
    rows = rng.integers(8, 40); out = np.zeros((H, W, 3), np.uint8); y = 0
    cols = np.array([[255, 0, 160], [255, 220, 0], [0, 230, 255], [0, 255, 90], [255, 255, 255], [20, 20, 20], [120, 0, 255]])
    while y < H:
        h = int(rng.integers(4, 60)); out[y:y + h] = cols[rng.integers(0, len(cols))]; y += h
    n = rng.integers(0, 80, (H, W, 1), dtype=np.uint8)
    return np.clip(out.astype(np.int16) - n, 0, 255).astype(np.uint8)
ERR = text_layer('ERROR_404 // SHOOT_NOT_FOUND 0101 0110 PROMPT_OVERRIDE', font(F_MONO, 44), fill=(255, 255, 255), shadow=False)

def glitch(f, style, k, n):
    p = k / max(1, n - 1)
    if style == 'open':
        if k < 3: return noise_frame()
        amt = 1 - p
        f = rgb_split(f, int(30 * amt)); f = slices(f, int(14 * amt) + 1, int(260 * amt) + 2)
        if k in (3, 4, 8): f = blocks(f, 8)
        if k in (4, 5, 6): f = bars(f, 10)
        if k in (5, 6): f = composite(f, [(ERR, (140, 470))])
        return f
    if style == 'out':
        f = blocks(rgb_split(f, 20), 6)
        return pixelate(f, 36) if k == n - 1 else f
    if style == 'pixel':
        return [blocks(f, 10), pixelate(f, 60), pixelate(blocks(f, 4), 30)][k]
    if style == 'melt':
        f = slices(rgb_split(f, 24), 16, 300)
        if k > 2: f = blocks(f, 8, tint=False)
        f = (f.astype(np.float32) * np.array([0.7, 0.8, 1.0]) * 0.8).astype(np.uint8)
        f[:, :150] = 0; f[:, -150:] = 0
        return f
    return f

# ---------------- end card ----------------
def build_card():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    logo = Image.open(i(32)).convert('L')
    bbox = logo.point(lambda v: 255 if v > 128 else 0).getbbox(); logo = logo.crop(bbox)
    lh = 120; logo = logo.resize((int(logo.width * lh / logo.height), lh), Image.LANCZOS)
    la = Image.new('RGBA', logo.size, (255, 255, 255, 0)); la.putalpha(logo)
    t1 = text_layer('AI & ADVERTISING', font(F_ST8, 170), tracking=10, shadow=False)
    t2 = text_layer('SHOOT-QUALITY ADS,', font(F_ST8, 60), tracking=5, shadow=False)
    t3 = text_layer('WITHOUT THE SHOOT.', font(F_ST8, 60), tracking=5, shadow=False)
    t4 = text_layer('IDEABRO STUDIO   ·   ENROLL NOW', font(F_MED, 26), fill=(170, 170, 170), tracking=4, shadow=False)
    y = 250
    im.alpha_composite(la, ((W - la.width) // 2, y)); y += lh + 30
    im.alpha_composite(t1, ((W - t1.width) // 2, y)); y += t1.height - 40
    im.alpha_composite(t2, ((W - t2.width) // 2, y)); y += t2.height - 32
    im.alpha_composite(t3, ((W - t3.width) // 2, y)); y += t3.height + 10
    im.alpha_composite(t4, ((W - t4.width) // 2, y))
    return np.asarray(im.convert('RGB'))
CARD = build_card()

def logo_glitch(prev, k):
    # frames 1690..1700 : smear -> tracking stripes -> pixelated logo in noise box -> sharpen
    if k == 0: return slices(np.repeat(prev[::8], 8, 0)[:H], 20, 200)
    if k in (1, 2):
        o = (prev * 0.35).astype(np.uint8); o[:140] = 0; o[-140:] = 0; return bars(slices(o, 20, 400), 8, 0.6)
    if k in (3, 4, 5):
        o = bars((prev * 0.2).astype(np.uint8), 18, 1.0)
        if k == 4: o[int(H * 0.45):int(H * 0.45) + 60] = 255
        return o
    o = CARD.copy()
    b = [40, 24, 14, 8, 4][min(k - 6, 4)]
    o = pixelate(o, b)
    y0, y1 = 220, 860
    box = o[y0:y1].astype(np.int16) + rng.integers(0, 60 - (k - 6) * 10, (y1 - y0, W, 3))
    o[y0:y1] = np.clip(box, 0, 255).astype(np.uint8)
    o = rgb_split(o, 14 - 2 * (k - 6))
    for yy in (180, 900):
        for j in range(6): o[yy + j * 4: yy + j * 4 + 3] = [[255, 0, 160], [255, 220, 0], [0, 230, 255], [0, 255, 90], [255, 255, 255], [120, 0, 255]][j]
    return o

# ---------------- main loop ----------------
def frames_for(shot, n):
    k = shot[0]
    if k == 'vid': return vid(shot[1], shot[2], shot[3], shot[4], n)
    if k == 'tri': return tri(shot[1], n)
    if k == 'still': return still(shot[1], shot[2], shot[3], n)
    if k == 'black': return np.zeros((n, H, W, 3), np.uint8)
    if k == 'noise': return np.stack([noise_frame() for _ in range(n)])
    if k == 'card': return np.repeat(CARD[None], n, 0)

def main(lo=0, hi=TOTAL, out=f'{OUT}/video.mp4'):
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24',
                            '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    subs = SUBS + LABELS
    prev = None
    for s, e, shot in S:
        if e <= lo or s >= hi: continue
        fr = frames_for(shot, e - s)
        print(f'{s:5d}-{e:5d} {shot[0]} {os.path.basename(str(shot[1]))[:30] if len(shot) > 1 else ""}', flush=True)
        for j, f in enumerate(fr):
            g = s + j
            if g < lo or g >= hi: continue
            for gs, ge, st in GLITCH:
                if gs <= g < ge and st != 'logo': f = glitch(f, st, g - gs, ge - gs)
            if 1690 <= g < 1701: f = logo_glitch(prev if prev is not None else f, g - 1690)
            layers = []
            if g < CARD_START:
                layers.append((WM, (W - WM.width - 34, 34)))
            for ss, se, t in subs:
                if ss <= g < se:
                    L = sub_img(t); layers.append((L, ((W - L.width) // 2, 1008 - L.height // 2)))
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

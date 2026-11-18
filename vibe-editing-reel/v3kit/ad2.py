"""Ad 2 — "Let's play a game"  ·  THEME: GLASS  ·  midnight navy + ice cyan + white
Frosted glass UI over slow light orbs; the take lives in a glass window during the game, then goes full-frame."""
import math, numpy as np, cv2
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFilter
import vkit as K
from vkit import W, H, F, OS, cl, inv, eo, eo5, eio, spring, backo, lerp, mixc, glass, place, scaled, put_text, stamp, rise, cap_words, rounded_mask
K.setup('ad2', 'glass', face=(600, 960))
NAVY = (6, 9, 24); INDIGO = (30, 38, 92); ICE = (130, 218, 255); WHITE = (246, 249, 255); MUTE = (150, 165, 200)
SP = K.C.SPEECH
# ---------------- background: drifting orbs ----------------
def orbs(t, dim=1.0):
    h, w = 240, 135; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32) / h
    a = np.zeros((h, w, 3), np.float32) + np.array(NAVY, np.float32) / 255
    for (cx, cy, r, col, ph) in [(.18, .22, .30, (26, 60, 170), 0), (.52, .62, .34, (10, 105, 170), 2.1), (.30, .92, .28, (52, 40, 150), 4.2), (.48, .05, .22, (60, 150, 210), 1.3)]:
        x = cx + .06 * math.sin(t * .35 + ph); y = cy + .05 * math.cos(t * .28 + ph)
        g = np.exp(-(((xx - x * w / h) ** 2 + (yy - y) ** 2) / (r * r)))[..., None]; a = a + g * np.array(col, np.float32) / 255 * .40 * dim
    a = cv2.resize(np.clip(a, 0, 1), (W, H), interpolation=cv2.INTER_CUBIC)
    return K.grain(Image.fromarray((a * 255).astype(np.uint8)), 3, int(t * 30))
# ---------------- glass UI parts ----------------
def gpanel(im, box, p=1., r=44, tint_a=.10, edge_a=.55, shadow=.35, blur=30, dark=False):
    """glass panel that scales in from its centre by p."""
    if p <= 0: return
    x0, y0, x1, y1 = box; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; s = lerp(.86, 1, p)
    bx = (cx - (x1 - x0) * s / 2, cy - (y1 - y0) * s / 2, cx + (x1 - x0) * s / 2, cy + (y1 - y0) * s / 2)
    lay = glass(im, bx, r, blur, tint=(10, 16, 40) if dark else (200, 225, 255), tint_a=.58 if dark else tint_a, edge=(220, 240, 255), edge_a=edge_a)
    if p < 1: lay.putalpha(lay.split()[3].point(lambda v: int(v * cl(p * 1.5))))
    K.paste_shadow(im, lay, (int(bx[0]), int(bx[1])), blur * .8, shadow * cl(p), (0, 20))
    return bx
def gchip(im, cx, cy, label, f, p=1., ink=WHITE, pad=34, h=None, icon=None, icon_col=ICE, dark=False):
    if p <= 0: return
    w = int(K.text_w(label, f) + pad * 2 + (54 if icon else 0)); h = h or int(f.size * 2.1)
    gpanel(im, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), p, h // 2, .14, .65, .3, 22, dark)
    a = cl(p * 1.4); x = cx - w / 2 + pad
    if icon == 'dot': ImageDraw.Draw(im).ellipse((x, cy - 9, x + 18, cy + 9), fill=icon_col); x += 40
    elif icon: put_text(im, (x + 14, cy), icon, F('gen', int(f.size * 1.05)), icon_col, 'm', alpha=a); x += 54
    put_text(im, (x, cy), label, f, ink, 'l', alpha=a)
def glow_line(im, pts, p, col=ICE, w=5):
    if p <= 0: return
    n = max(2, int(len(pts) * p)); L = Image.new('L', (W, H), 0); ImageDraw.Draw(L).line([tuple(q) for q in pts[:n]], fill=255, width=w, joint='curve')
    im.paste(col, (0, 0), L.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * .8))); im.paste(col, (0, 0), L.filter(ImageFilter.GaussianBlur(.8)))
def check(im, cx, cy, r, p, col=ICE):
    if p <= 0: return
    rr = r * backo(cl(p * 1.6)); ImageDraw.Draw(im).ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=col)
    q = cl(p * 2 - .6)
    if q > 0:
        pts = [(cx - r * .45, cy + r * .02), (cx - r * .1, cy + r * .36), (cx + r * .5, cy - r * .34)]; seg = pts[:2] if q < .5 else pts
        if q < .5: seg = [pts[0], tuple(np.array(pts[0]) + (np.array(pts[1]) - pts[0]) * q * 2)]
        else: seg = [pts[0], pts[1], tuple(np.array(pts[1]) + (np.array(pts[2]) - pts[1]) * (q - .5) * 2)]
        ImageDraw.Draw(im).line(seg, fill=NAVY, width=max(4, int(r * .2)), joint='curve')
def title(im, t, l1, l2, t1, t2, y1=300, y2=402, exit_at=1e9):
    q = 1 - eo(cl((t - exit_at) / .2))
    if q <= 0: return
    if t >= t1: p = eo(cl((t - t1) / .4)); put_text(im, (W / 2, y1), l1, F('isemi', 64), WHITE, alpha=p * q, dy=(1 - p) * 24, shadow=.35)
    if t >= t2: p = eo(cl((t - t2) / .4)); put_text(im, (W / 2, y2), l2, F('insti', 112), ICE, alpha=p * q, dy=(1 - p) * 30, shadow=.3)
CAP = dict(c=WHITE, acc=ICE, shadow=.75, mode='blur', dist=26)
def caps(im, t, small, big, y=430, exit_at=1e9):
    lines = []
    if small: lines.append((y, F('isemi', 58), small))
    if big: lines.append((y + 116, F('ibold', 100), big))
    st = dict(CAP); st['acc_font'] = F('insti', 118); cap_words(im, t, lines, st, exit_at)
# ---------------- the take inside a glass window that can expand to full frame ----------------
WIN = (110, 470, 970, 1215)
def take_window(base, t, p_full, bg, dy=0.):
    """base: full graded frame; p_full 0 = framed glass window, 1 = full screen."""
    x0, y0, x1, y1 = [lerp(a, b, p_full) for a, b in zip(WIN, (0, 0, W, H))]; y0 += dy; y1 += dy; w, h = int(x1 - x0), int(y1 - y0)
    s = max(w / W, h / H) * lerp(1.06, 1, p_full); fx, fy = K.C.face; im = base.resize((int(W * s), int(H * s)), Image.LANCZOS)
    ox = int(np.clip(fx * s - w * .5, 0, im.size[0] - w)); oy = int(np.clip(fy * s - h * lerp(.52, .5, p_full), 0, im.size[1] - h)); crop = im.crop((ox, oy, ox + w, oy + h))
    out = bg.copy(); r = int(lerp(56, 0, p_full))
    if p_full < 1:
        rim = glass(bg, (x0 - 14, y0 - 14, x1 + 14, y1 + 14), r + 14, 28, (200, 225, 255), .12, (220, 240, 255), .7); K.paste_shadow(out, rim, (int(x0 - 14), int(y0 - 14)), 40, .5, (0, 30))
    out.paste(crop, (int(x0), int(y0)), rounded_mask(w, h, max(1, r)))
    if p_full < .02:   # glass-floor reflection
        rh = min(H - int(y1) - 30, 420); ref = crop.transpose(Image.FLIP_TOP_BOTTOM).crop((0, 0, w, rh)).filter(ImageFilter.GaussianBlur(6))
        g = np.linspace(.32, 0, rh)[:, None] * np.ones((1, w)); m = Image.fromarray((g * 255).astype(np.uint8)); out.paste(ref, (int(x0), int(y1) + 26), m)
    return out
# ================================ SCENES ================================
def s_game(t):
    bg = orbs(t); base = K.graded(t)
    a = spring(cl((t - .05) / .7)); tw = take_window(base, t, 0, bg, dy=(1 - a) * 160)
    im = Image.blend(bg, tw, cl(a * 1.4)) if a < .72 else tw
    # chip + title
    gchip(im, W / 2, 190 + 0, 'ROUND 01  ·  SPOT THE AI', F('jb7', 26), cl((t - .1) / .5), ink=WHITE, icon='dot')
    title(im, t, "Let's play", 'a game.', OS(0), OS(2), exit_at=OS(4) - .2)
    title(im, t, 'Which part of this', 'did AI edit?', OS(4) + .05, OS(9), exit_at=OS(12))
    # answer options as real glass over the video
    for k, (lab, wi) in enumerate([('A  captions', 5), ('B  cuts', 7), ('C  the room', 10)]):
        p = spring(cl((t - OS(wi)) / .55)); gchip(im, 250 + k * 290, 1110, lab, F('sg5', 38), p, pad=28)
    return im
def s_watch(t):
    bg = orbs(t); base = K.graded(t, 1 + .05 * inv(OS(12), OS(14), t)); p = eio(cl((t - OS(12) + .1) / .55)); im = take_window(base, t, p, bg)
    caps(im, t, [('Watch', 12, False)], [('closely.', 13, True)])
    # focus brackets around the face + live timer
    q = eo(cl((t - OS(12) - .3) / .4))
    if q > 0:
        fx, fy = 600, 900; s = lerp(420, 300, q); d = ImageDraw.Draw(im); L = 60
        for sx, sy in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
            x, y = fx + sx * s / 2, fy + sy * s * .62; d.line([(x, y), (x - sx * L, y)], fill=ICE, width=5); d.line([(x, y), (x, y - sy * L)], fill=ICE, width=5)
        gchip(im, 860, 300, f'0:0{max(0, 3 - int((t - OS(12)) / .45))}', F('jb7', 30), q, icon='dot', dark=True)
    return im
def frosted(t, z=1.0):
    b = K.graded(t, z).filter(ImageFilter.GaussianBlur(40)); return Image.blend(b, Image.new('RGB', (W, H), NAVY), .45)
def s_wrong(t):
    p = eo5(cl((t - OS(14) + .05) / .3)); bgs = frosted(t)
    shake = math.sin((t - OS(14)) * 60) * 14 * (1 - cl((t - OS(14)) / .35)); im = bgs.copy()
    put_text(im, (W / 2 + shake, 720), 'Wrong.', F('insti', 260), WHITE, alpha=p, scale=lerp(1.25, 1, p), shadow=.4)
    gchip(im, W / 2, 900, 'it was all of it', F('isemi', 40), cl((t - OS(14) - .25) / .4), ink=ICE)
    return im
def s_whole(t):
    im = frosted(t); title(im, t, 'The whole video is', 'edited by AI.', OS(15), OS(19))
    for k, (lab, wi) in enumerate([('captions', 16), ('cuts', 18), ('the room', 20)]):
        y = 700 + k * 170; p = spring(cl((t - OS(15) - .05 - k * .08) / .6)); bx = gpanel(im, (180, y - 66, 900, y + 66), p, 66)
        if p > 0:
            put_text(im, (250, y), 'ABC'[k], F('sg7', 44), MUTE, 'm', alpha=cl(p * 1.4)); put_text(im, (310, y), lab, F('isemi', 52), WHITE, 'l', alpha=cl(p * 1.4))
            check(im, 830, y, 34, cl((t - OS(wi)) / .35))
    return im
def s_every(t):
    # every caption / every cut / even the room — the real take, with glass annotations
    zc = 1.0 if t < OS(25) else 1.13; zc = lerp(1.0, 1.13, eo5(cl((t - OS(25)) / .12)))
    base = K.graded(t, zc + .015 * inv(OS(22), OS(31), t), -.02 * (zc > 1.0))
    im = base
    if t >= OS(26) - .1:   # room: before/after wipe (left = untouched footage, right = graded)
        rawim = K.zoom(Image.fromarray(K.raw(t)), zc + .015 * inv(OS(22), OS(31), t), .5, .42 - .02); p = eio(cl((t - OS(28) + .05) / .9)); xw = int(lerp(W, 0, p))
        if xw > 0:
            im = base.copy(); im.paste(rawim.crop((0, 0, xw, H)), (0, 0))
            if 0 < xw < W:
                L = Image.new('L', (W, H), 0); ImageDraw.Draw(L).line([(xw, 0), (xw, H)], fill=255, width=4); im.paste(ICE, (0, 0), L.filter(ImageFilter.GaussianBlur(8))); im.paste(WHITE, (0, 0), L)
                gchip(im, xw, 1500, '◂ ▸', F('gen', 30), 1, pad=22, dark=True)
        gchip(im, W / 2, 660, 'room · relit by AI', F('sg5', 34), cl((t - OS(28)) / .4), icon='dot', dark=True)
    caps(im, t, [('every', 22, False), ('caption,', 23, True)] if t < OS(24) else ([('every', 24, False), ('cut,', 25, True)] if t < OS(26) else [('even', 26, False), ('the', 27, False), ('room', 28, True)]),
         None if t < OS(26) else [('behind', 29, False), ('me.', 30, False)])
    if t < OS(24):
        gchip(im, W / 2, 620, 'caption · designed per phrase', F('sg5', 32), cl((t - OS(23)) / .4), icon='dot', dark=True)
    elif t < OS(26):   # cut marker on a mini glass timeline
        q = cl((t - OS(24)) / .35); bx = gpanel(im, (140, 1160, 940, 1250), q, 30, dark=True)
        if q > 0:
            d = ImageDraw.Draw(im)
            for j, (a_, b_) in enumerate([(170, 480), (500, 700), (720, 910)]): d.rounded_rectangle((a_, 1184, b_, 1226), 12, fill=(70, 110, 190) if j != 1 else ICE)
            ph = lerp(170, 910, cl((t - OS(24)) / 1.1)); d.line([(ph, 1170), (ph, 1240)], fill=WHITE, width=4)
            gchip(im, W / 2, 640, 'cut · on the beat', F('sg5', 32), q, icon='dot', dark=True)
    return im
def reel_card(k, t):
    c = Image.fromarray(K.raw(OS(31) + k * .37)).copy(); K.cheap_caps(c, ['EASY', 'TO SPOT'], k % 2, 1150, 96); c = c.resize((300, 533), Image.LANCZOS)
    card = Image.new('RGBA', (300, 533)); card.paste(c, (0, 0)); card.putalpha(rounded_mask(300, 533, 30)); return card
def s_spot(t):
    im = orbs(t); title(im, t, 'Most AI edits are', 'easy to spot.', OS(31), OS(35))
    scan = inv(OS(35), OS(37) + .4, t); sy = lerp(560, 1420, scan)
    for k in range(6):
        cx, cy = 210 + (k % 3) * 330, 760 + (k // 3) * 590; p = spring(cl((t - OS(31) - .05 - k * .06) / .6))
        if p <= 0: continue
        c = scaled(reel_card(k, t), lerp(.8, 1, p), cl(p * 1.5)); place(im, c, cx, cy + (1 - p) * 120, .45, 30, (0, 24))
        if sy > cy - 200 and scan > 0:     # detection box once the scanner passed
            q = cl((sy - (cy - 200)) / 120); d = ImageDraw.Draw(im); bw, bh = 260 * lerp(1.15, 1, q), 470 * lerp(1.15, 1, q)
            d.rounded_rectangle((cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2), 22, outline=ICE, width=4)
            gchip(im, cx, cy - 210, 'AI', F('sg7', 30), q, ink=NAVY if False else WHITE, pad=24)
    if 0 < scan < 1: glow_line(im, [(60, sy), (1020, sy)], 1, ICE, 4)
    return im
def s_mine(t):
    im = K.graded(t, lerp(1.04, 1.08, inv(OS(38), OS(40), t)))
    sc = inv(OS(38) + .05, OS(39) + .3, t); sy = lerp(300, 1500, eio(sc))
    if 0 < sc < 1: glow_line(im, [(0, sy), (W, sy)], 1, ICE, 4)
    caps(im, t, None, [('Mine', 38, False), ("aren't.", 39, True)], y=310)
    if sc >= 1: gchip(im, W / 2, 560, '0 signs found', F('sg5', 40), cl((t - OS(39) - .3) / .4), icon='✓', dark=True)
    return im
ICONS = [('✂', 'cuts'), ('Aa', 'captions'), ('♪', 'music'), ('✦', 'AI')]
def s_tools(t):
    im = orbs(t); title(im, t, 'Everyone has', 'the same tools.', OS(40), OS(43))
    for c_, (lab, x) in enumerate([('everyone', 300), ('me', 780)]):
        p = spring(cl((t - OS(40) - .1 - c_ * .12) / .7)); bx = gpanel(im, (x - 200, 560, x + 200, 1220), p, 50)
        if p <= 0: continue
        put_text(im, (x, 630), lab, F('insti', 60), ICE, alpha=cl(p * 1.4))
        for k, (ic, nm) in enumerate(ICONS):
            q = spring(cl((t - OS(41) - k * .1 - c_ * .05) / .5)); y = 760 + k * 118
            if q <= 0: continue
            gpanel(im, (x - 160, y - 46, x + 160, y + 46), q, 46, .16, .6, .2, 18)
            put_text(im, (x - 110, y), ic, F('gen', 40) if ic != 'Aa' else F('ibold', 38), WHITE, alpha=cl(q * 1.5)); put_text(im, (x - 60, y), nm, F('imed', 36), WHITE, 'l', alpha=cl(q * 1.5))
    q = eo(cl((t - OS(43)) / .3))
    if q > 0: d = ImageDraw.Draw(im); [d.rounded_rectangle((510, y_ - 6, 510 + 60 * q, y_ + 6), 6, fill=ICE) for y_ in (870, 910)]
    return im
NODES = [('script', 260, 620), ('captions', 760, 760), ('camera', 300, 900), ('grade', 780, 1040), ('sound', 320, 1180)]
def s_flow(t):
    im = orbs(t); title(im, t, 'Not everyone has', 'the workflow.', OS(45), OS(49))
    for k in range(4):
        (_, x0, y0), (_, x1, y1) = NODES[k], NODES[k + 1]; glow_line(im, K.curve_pts((x0, y0), (x1, y1), .18 * (-1) ** k), inv(OS(46) + .25 + k * .22, OS(46) + .5 + k * .22, t), ICE, 5)
    for k, (nm, x, y) in enumerate(NODES):
        p = spring(cl((t - OS(46) - k * .22) / .5)); gchip(im, x, y, nm, F('isemi', 44), p, icon='dot', pad=34)
    return im
def s_want(t):
    im = K.graded(t, lerp(1.06, 1.09, inv(OS(50), OS(54), t)))
    p = spring(cl((t - OS(50) + .15) / .6)); box = (120, 300, 960, 450); bx = gpanel(im, box, p, 80, .16, .7, .3, 26, True)
    if p > 0:
        s = 'I want my workflow.'; n = int(len(s) * cl((t - OS(50)) / (OS(53) + .5 - OS(50)))); put_text(im, (180, 375), s[:n] + ('|' if int(t * 4) % 2 and n < len(s) else ''), F('imed', 46), WHITE, 'l', alpha=cl(p * 1.4))
        sent = cl((t - OS(53) - .4) / .3); d = ImageDraw.Draw(im); col = mixc((70, 90, 140), ICE, sent); d.ellipse((860, 337, 936, 413), fill=col); put_text(im, (898, 375), '↑', F('gen', 44), NAVY if sent > .5 else WHITE)
    caps(im, t, [('say', 50, False), ('it:', 50, False)] if False else None, None)
    return im
def gbutton(im, cx, cy, p, label='Learn the workflow  →', dark=True):
    if p <= 0: return
    s = lerp(.7, 1, spring(p)); w, h = 660 * s, 116 * s
    halo = Image.new('L', (W, H), 0); ImageDraw.Draw(halo).rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), int(h / 2), fill=255); im.paste(ICE, (0, 0), halo.filter(ImageFilter.GaussianBlur(40)).point(lambda v: int(v * .55 * cl(p * 1.5))))
    gpanel(im, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), cl(p * 2), int(h / 2), .28, .9, .3, 22, dark)
    put_text(im, (cx, cy), label, F('ibold', int(44 * s)), WHITE, alpha=cl(p * 1.6))
def s_link(t):
    im = K.graded(t, lerp(1.08, 1.11, inv(OS(54), SP, t))); caps(im, t, [('The', 54, False), ('link', 55, False), ('is', 56, False), ('below', 57, True)], None, y=330)
    gbutton(im, W / 2, 500, cl((t - OS(57)) / .6)); K.arrow(im, (W / 2 + 300, 570), (W / 2 + 380, 760), .3, inv(OS(57) + .35, OS(57) + .85, t), ICE, 6, 51, rough=False); return im
def s_end(t):
    e0 = SP; im = orbs(t, 1.15); p = spring(cl((t - e0 - .05) / .8)); gpanel(im, (110, 380, 970, 1180), p, 64, .1, .7, .4, 36)
    if p > 0:
        gchip(im, W / 2, 470, 'ROUND 01  ·  RESULT', F('jb7', 24), cl((t - e0 - .2) / .4), icon='dot')
        rise(im, (W / 2, 610), 'VIBE', F('iblack', 190), WHITE, e0 + .15, t, track=8); rise(im, (W / 2, 770), 'EDITING', F('iblack', 128), WHITE, e0 + .25, t, track=6)
        rise(im, (W / 2, 900), 'edits nobody can spot.', F('insti', 70), ICE, e0 + .4, t)
        gbutton(im, W / 2, 1030, cl((t - e0 - .65) / .6), dark=False); rise(im, (W / 2, 1135), '[your-url.com]', F('jb4', 30), MUTE, e0 + .85, t)
    return im
SCENES = [
 (0.0, s_game, None),
 (OS(12) - .1, s_watch, None),
 (OS(14) - .04, s_wrong, 'flash', .22),
 (OS(15) - .12, s_whole, 'blur', .3),
 (OS(22) - .12, s_every, 'zoom', .35),
 (OS(31) - .12, s_spot, 'up'),
 (OS(38) - .1, s_mine, 'zoom', .3),
 (OS(40) - .12, s_tools, 'blur', .32),
 (OS(45) - .12, s_flow, 'left'),
 (OS(50) - .12, s_want, 'zoom', .32),
 (OS(54) - .04, s_link, None),
 (SP, s_end, 'blur', .4),
]
MUSIC = 'music_glass'; LIFT = OS(15)
def CUES():
    return [('hud', .1, .08), ('pop', OS(2), .14), ('pop', OS(5), .12, -.4), ('pop', OS(7), .12), ('pop', OS(10), .12, .4), ('hud', OS(12) + .3, .08), ('hud', OS(12) + .75, .08), ('hud', OS(12) + 1.2, .08),
            ('impact', OS(14) - .05, .32), ('glitch', OS(14), .12), ('whoosh_b', OS(15) - .3, .2), ('pop', OS(16), .12), ('pop', OS(18), .12), ('pop', OS(20), .14),
            ('whoosh_a', OS(22) - .25, .2), ('whip', OS(25) - .05, .2), ('shimmer', OS(28), .14), ('whoosh_b', OS(31) - .3, .2), ('neon', OS(35), .12), ('shimmer', OS(39) + .3, .12),
            ('whoosh_b', OS(40) - .3, .2), ('pop', OS(41), .1), ('pop', OS(41) + .3, .1), ('whoosh_a', OS(45) - .25, .2), ('pop', OS(46), .1), ('pop', OS(46) + .44, .1), ('pop', OS(46) + .88, .1),
            ('typing', OS(50), .14), ('pop', OS(53) + .4, .14), ('pop', OS(57), .18), ('whoosh_b', SP - .25, .2), ('shimmer', SP + .3, .14), ('pop', SP + .7, .14)]
if __name__ == '__main__':
    K.run(K.make_frame(SCENES))

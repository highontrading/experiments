"""Ad 7 animator — renders the approved Studio Lime board as motion.  usage: python3 animate7.py OUT_DIR [--frames a,b] [--workers 4]"""
import sys, os, math, numpy as np, cv2
from functools import lru_cache
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFilter
import common as C
from kit7 import *
f = C.find; OS = C.OS; OE = C.OE; SP = C.SPEECH; NF = C.N
def mmss(t): return f'0:{int(t):02d}'
# ---------------- base layers ----------------
@lru_cache(maxsize=8)
def G(i_src):          # graded frame by source index
    return grade(C.raw_src(i_src), i_src)
def gframe(t): return G(C.src_index(t))
def alpha8(t): return C.alpha(t)
def aroll(t, z=1.0, cy=0.): return K.zoom(gframe(t), z, .5, .42 + cy) if z != 1 else gframe(t).copy()
@lru_cache(maxsize=None)
def top_at(t): return head_top(alpha8(t))
def behind(t, draw_under, z=1.0, cy=0.):
    g = gframe(t); b = g.copy(); draw_under(b); out = person_over(b, g, alpha8(t)); return K.zoom(out, z, .5, .42 + cy) if z != 1 else out
def chip_at(im, t, text_, t0, t1, t_out, label='DIRECTING CLAUDE', y=300):
    """command chip: slides in just before the words, types in sync with them, leaves at t_out."""
    if t < t0 - .2 or t > t_out + .25: return
    a = eo(cl((t - t0 + .2) / .25)) * (1 - eo(cl((t - t_out) / .25))); c = chip(text_, inv(t0, t1, t), int(t * 3) % 2 == 0 or t < t1, label)
    if a < 1: c = K.scaled(c, 1, a)
    place(im, c, W / 2, y - (1 - a) * 24, 30, .25 * a)
def sweep(im, t, t0, col=LIME):
    """the 'Claude applied it' signal: a soft lime scan line passes down the frame."""
    p = (t - t0) / .45
    if not 0 <= p <= 1: return
    y = int(eio(p) * H); L = Image.new('L', (W, H), 0); ImageDraw.Draw(L).rectangle((0, y - 3, W, y + 3), fill=255)
    im.paste(col, (0, 0), L.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * .8))); im.paste(col, (0, 0), L.filter(ImageFilter.GaussianBlur(1)))
def hand(im, t, lines, y0=330, size=70, col=INK, gap=None, rot=2, shadow=0.):
    """handwritten caption lines that write themselves on in sync with their words: lines = [(text, first_word, last_word)]."""
    gap = gap or size * 1.5
    for k, (s, a, b) in enumerate(lines):
        if t < OS(a) - .05: continue
        dur = max(.4, OE(b) - OS(a) + .1); L, w, h = K.layer_text(s, FX('apple', size)); q = eo(cl((t - OS(a) + .05) / dur))
        m = np.zeros((h, w), np.uint8); m[:, :int(w * q)] = 255; L = Image.fromarray(np.minimum(np.asarray(L), m)).rotate(rot, expand=True, resample=Image.BICUBIC)
        x, y = int(W / 2 - L.size[0] / 2 + k * 18), int(y0 + k * gap - L.size[1] / 2)
        if shadow: im.paste((0, 0, 0), (x, y + 3), L.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * shadow)))
        im.paste(col, (x, y), L)
def lime_swipe(im, x0, x1, y, p, w=22, seed=3):
    if p > 0: hand_line(im, [(x0 + (x1 - x0) * u, y + math.sin(u * 3 + seed) * 6) for u in np.linspace(0, 1, 30)], w, LIME, seed, eo(cl(p)))
# ================================ 1. OPEN: hook + music + sfx ================================
T_MUS = OE(19) + .1; T_SFX = OE(24) + .1; T_NA = OS(30) - .32
def s_open(t):
    z = lerp(1.0, 1.06, eio(inv(0, T_NA, t))); top = top_at(OS(7) + .3)
    def under(b):
        if t >= OS(7) - .05:      # CLAUDE IS. behind the head
            p = eo5(cl((t - OS(7) + .05) / .35)) * (1 - eo(cl((t - OS(16) + .3) / .3)))
            if p > 0: K.put_text(b, (W / 2, top - 40), 'CLAUDE IS.', FX('outfit9', 196), INK, 'm', -6, p, scale=lerp(1.12, 1, p))
        if t >= T_MUS - .05:      # waveform behind
            q = eo(cl((t - T_MUS) / .6)) * (1 - .35 * eo(cl((t - OS(20)) / .6))); d = ImageDraw.Draw(b); beat = .55 + .45 * math.exp(-((t - T_MUS) % .652) * 5)
            for k in range(70):
                c = abs(k - 35) / 35; grow = cl(q * 1.6 - c * .6); hh = (16 + 150 * abs(math.sin(k * .37 + t * 3.1)) * (.35 + .65 * abs(math.sin(k * .11 + t * .7)))) * beat * grow
                if hh > 2: x = 40 + k * 14.4; d.rounded_rectangle((x, 760 - hh / 2, x + 7, 760 + hh / 2), 4, fill=LIME)
    im = behind(t, under, z)
    if t < OS(3) + .2: K.put_text(im, (W / 2, 330), 'This whole video…', FX('isemi', 50), INK, 'm', 0, eo(cl(t / .25)) * (1 - eo(cl((t - OS(3) + .05) / .25))))
    if t >= OS(3) - .05 and t < OS(16): K.put_text(im, (W / 2, 330), "I'm not editing this video.", FX('isemi', 50), INK, 'm', 0, eo(cl((t - OS(3)) / .35)) * (1 - eo(cl((t - OS(16) + .4) / .3))))
    if OS(9) <= t < OS(16): micro(im, 70, 1180, ['DIRECTED BY ME', 'EDITED BY CLAUDE'], FX('jb7', 22), INK)
    chip_at(im, t, 'put some music', OS(17), OE(19), OS(20) - .3)
    if t >= T_MUS + .25 and t < OS(20): place(im, K.scaled(tag('♪  background music · on', FX('imed', 30), LIME, INK), lerp(.8, 1, spring(cl((t - T_MUS - .25) / .5))), 1), W / 2, 1180)
    chip_at(im, t, 'add some sound effects also', OS(20), OE(24), T_NA - .3)
    for k, (lab, x, y, r) in enumerate([('whoosh', 230, 720, -8), ('pop', 860, 640, 6), ('click', 870, 980, -4), ('swipe', 200, 1050, 5)]):
        t0 = T_SFX + k * .3
        if t < t0: continue
        p = spring(cl((t - t0) / .45)); out = eo(cl((t - T_NA + .25) / .25)); s = tag(lab, FX('outfit8', 44), LIME, INK).rotate(r, expand=True, resample=Image.BICUBIC)
        place(im, K.scaled(s, lerp(.4, 1, p) * (1 - .3 * out), cl(p * 2) * (1 - out)), x, y + math.sin(t * 2 + k) * 6 - out * 30, 18, .22)
    return im
# ================================ 2. NO APPS (MG) ================================
APPS = [('Premiere Pro', 30, 32, 470), ('DaVinci', 33, 34, 600), ('Higgsfield', 35, 36, 730), ('</> coding', 40, 41, 860)]
def s_noapps(t):
    im = studio(4).copy(); K.put_text(im, (70, 330), "didn't open:", FX('jb7', 34), GREY, 'l', 0, eo(cl((t - T_NA) / .4)))
    for k, (nm, w_in, w_x, y) in enumerate(APPS):
        if t < OS(w_in) - .1: continue
        p = spring(cl((t - OS(w_in) + .1) / .5)); s = tag(nm, FX('ibold', 58), WHITE, INK, (44, 20)); x = 70 + s.size[0] / 2
        place(im, K.scaled(s, 1, cl(p * 2)), x, y - (1 - p) * 70, 18, .18)
        q = inv(OE(w_x) - .15, OE(w_x) + .2, t) if k < 3 else inv(OE(41) - .1, OE(41) + .25, t)
        if q > 0: hand_line(im, [(50, y + 6), (110 + s.size[0], y - 4)], 9, INK, 10 + k, q); K.put_text(im, (s.size[0] + 170, y), 'no.', FX('apple', 52), INK, 'l', 0, cl(q * 2 - .6), rot=4)
    if t >= OS(36) - .05:
        p = eo5(cl((t - OS(36) + .05) / .3)); K.put_text(im, (W / 2, 1110), 'nothing.', FX('outfit9', 210), INK, 'm', 0, cl(p * 1.5), scale=lerp(1.3, 1, p))
        lime_swipe(im, 170, 910, 1215, inv(OS(36) + .2, OS(36) + .6, t), 26, 7)
    return im
# ================================ 3. THE FIVE CAPTION STYLES ================================
A1, A2, A3, A4, A5 = OE(45) + .08, OE(53) + .08, OE(60) + .08, OE(67) + .08, OE(70) + .08      # moments Claude applies each style
def st_basic(im, t):
    for ph in ([46, 47, 48], [49, 50, 51, 52, 53]):
        if OS(ph[0]) - .05 <= t < (OS(ph[-1] + 1) - .05 if ph[-1] < 53 else A2):
            s = ' '.join(C.WD[i]['w'] for i in ph if OS(i) <= t + .05).lower().strip(',.')
            K.put_text(im, (W / 2, 1150), s, FX('imed', 46), WHITE, 'm', 0, 1, .9)
def st_highlight(im, t, phrases=(([54], None), ([55, 56, 57], [58, 59, 60])), end=None):
    for l1, l2 in phrases:
        last = (l2 or l1)[-1]
        if not (OS(l1[0]) - .05 <= t < (end if last == 60 else OS(last + 1) - .05)): continue
        lines = [(1085, l1)] + ([(1192, l2)] if l2 else []); fnt = FX('iblack', 92)
        cur = max([i for i in l1 + (l2 or []) if OS(i) <= t + .02], default=l1[0]); boxes = {}
        for y, ws in lines:
            txt = [C.WD[i]['w'].upper().strip(',') for i in ws]; widths = [fnt.getlength(s) for s in txt]; x = W / 2 - (sum(widths) + 28 * (len(ws) - 1)) / 2
            for i, s, w in zip(ws, txt, widths): boxes[i] = (x, y, w, s); x += w + 28
        x, y, w, s = boxes[cur]; prev = boxes.get(cur - 1, boxes[cur]); q = eo(cl((t - OS(cur)) / .12)); px = lerp(prev[0], x, q) if prev[1] == y else x; pw = lerp(prev[2], w, q) if prev[1] == y else w
        pill = Image.new('RGBA', (int(pw + 34), 108)); ImageDraw.Draw(pill).rounded_rectangle((0, 0, pill.size[0] - 1, 107), 22, fill=LIME + (255,)); place(im, pill.rotate(-2, expand=True, resample=Image.BICUBIC), px + pw / 2, y + 4, 14, .25, (0, 8))
        for i, (bx, by, bw, s) in boxes.items():
            if OS(i) > t + .02: continue
            a = eo(cl((t - OS(i) + .02) / .12)); K.put_text(im, (bx + bw / 2, by - (1 - a) * 14), s, fnt, INK if i == cur else WHITE, 'm', 0, a, 0 if i == cur else .7, scale=1.06 if i == cur else 1)
MAG_WORDS = [(['okay,', 'put'], [61, 62]), (['the', 'words'], [63, 64]), (['behind', 'my'], [65, 66]), (['head.'], [67])]
def st_magazine(im, t, under):
    pass
def mag_under(b, t, top):
    p = eo(cl((t - A3) / .5)); K.put_text(b, (W / 2, top - 10 + (1 - p) * 60), 'VIBE', FX('play8', 330), INK, 'm', -8, p)
def mag_over(im, t):
    p = cl((t - A3 - .1) / .5); d = ImageDraw.Draw(im)
    if p > 0:
        s = 'ISSUE 01  ·  THE DIRECTING ISSUE  ·  NOV 2026'; n = int(len(s) * eo(p)); K.put_text(im, (W / 2, 410), s[:n], FX('jb7', 22), INK, 'm', 2)
        d.line([(60, 438), (60 + (W - 120) * eo(p), 438)], fill=INK, width=2)
    q = eo(cl((t - A3 - .3) / .5))
    if q > 0:
        K.put_text(im, (W - 70, 900), '05', FX('play8', 120), WHITE, 'r', 0, q, .6); K.put_text(im, (W - 70, 985), 'caption styles', FX('isemi', 30), WHITE, 'r', 0, q, .7); K.put_text(im, (W - 70, 1020), 'inside', FX('isemi', 30), WHITE, 'r', 0, q, .7)
        for k in range(28):
            if k / 28 < q: x = 70 + k * 7 + (k % 3) * 2; d.rectangle((x, 1150, x + (2 if k % 4 else 4), 1215), fill=WHITE)
    for li, (ws, idx) in enumerate(MAG_WORDS):
        x = 70; y = 820 + li * 88
        for w, i in zip(ws, idx):
            if t < OS(i) - .03: break
            a = eo(cl((t - OS(i) + .03) / .25)); fnt = FX('play8i' if i == 67 else 'play6i', 78)
            if i == 67: s = tag('head.', FX('play8i', 82), LIME, INK, (24, 4), 6); place(im, K.scaled(s, 1, a), x + s.size[0] / 2, y + (1 - a) * 20, 12, .2)
            else: K.put_text(im, (x, y + (1 - a) * 20), w, fnt, INK, 'l', 0, a)
            x += fnt.getlength(w) + 22
def behind_word(b, t, top):
    cur = max([i for i in (68, 69, 70) if OS(i) <= t + .03], default=None)
    if cur is None: return
    s = C.WD[cur]['w'].lower().strip(',.'); fnt = FX('outfit9', 250); sz = 250 if fnt.getlength(s) < 980 else int(250 * 980 / fnt.getlength(s)); fnt = FX('outfit9', sz)
    p = eo5(cl((t - OS(cur) + .03) / .25)); K.put_text(b, (W / 2, top - sz * .12), s, fnt, LIME_D, 'm', -8, p, scale=lerp(1.15, 1, p))
def s_caps(t):
    z = 1.0 + .04 * eio(cl((t - max(a for a in (OS(42), A1, A2, A3, A4, A5) if a <= t)) / 1.2)) if t > OS(42) else 1.0
    if A3 <= t < A4:
        top = top_at(A3 + .4); im = behind(t, lambda b: mag_under(b, t, top), z); mag_over(im, t)
    elif A4 <= t < A5:
        top = top_at(A4 + .3); im = behind(t, lambda b: behind_word(b, t, top), z)
    else: im = aroll(t, z)
    if A1 <= t < A2: st_basic(im, t)
    elif A2 <= t < A3: st_highlight(im, t, end=A3)
    elif t >= A5:
        hand(im, t, [('yeah, this one.', 71, 73)], 340, 76)
        K.stroke(im, K.ellipse_pts(W / 2, 342, 360, 92, seed=6), inv(OE(73), OE(73) + .45, t), 7, LIME, 6)
    chip_at(im, t, 'add captions', OS(43), OE(45), A1 + .5, 'STYLE 01 · BASIC')
    chip_at(im, t, "highlight the word I'm saying", OS(49), OE(53), A2 + .45, 'STYLE 02 · HIGHLIGHT')
    chip_at(im, t, 'make it look like a magazine', OS(55), OE(60), A3 + .1, 'STYLE 03 · MAGAZINE')
    chip_at(im, t, 'put the words behind my head', OS(62), OE(67), A4 + .45, 'STYLE 04 · DEPTH')
    chip_at(im, t, 'try handwritten', OS(69), OE(70), A5 + .3, 'STYLE 05 · HANDWRITTEN')
    for a in (A1, A2, A3, A4, A5): sweep(im, t, a)
    return im
# ================================ 4. RECAP ================================
@lru_cache(maxsize=None)
def thumb(k):
    t = [OE(48) - .05, OE(59), OE(66), OS(70) + .25, OE(73) + .5][k]; th = s_caps(t).resize((300, 533), Image.LANCZOS).convert('RGBA'); th.putalpha(K.rounded_mask(300, 533, 26)); return th
def s_recap(t):
    im = studio(10).copy(); K.rise(im, (70, 330), 'five caption styles.', FX('iblack', 82), INK, OS(74), t, anchor='l'); K.rise(im, (70, 430), "and I didn't touch anything.", FX('isemi', 44), GREY, OS(79), t, anchor='l')
    for k, rot in enumerate([-9, -4, 0, 4, 9]):
        t0 = OS(74) + .15 + k * .14
        if t < t0: continue
        p = spring(cl((t - t0) / .6)); th = thumb(k).rotate(rot * p, expand=True, resample=Image.BICUBIC); x = lerp(W / 2, 175 + k * 182, p); y = 860 + abs(k - 2) * 40 * p + (1 - cl(p * 1.3)) * 500
        place(im, th, x, y, 24, .3); K.put_text(im, (x, 1170 + abs(k - 2) * 20), f'0{k + 1}', FX('jb7', 30), INK, 'm', 0, cl(p))
    return im
# ================================ 5. CUT ME OUT → WHITEBOARD ================================
T_WB = OE(92) + .12
def me_cut(t, ew=14):
    return cutout(np.asarray(gframe(t)), alpha8(t), LIME, ew)
def place_me(im, t, s, cx, ew=14, dy=0.):
    c = me_cut(t, ew)
    if s != 1: c = c.resize((int(W * s), int(H * s)), Image.LANCZOS)
    shadowed(im, c, (cx - c.size[0] / 2, H - c.size[1] + 60 * (s < 1) * min(1, (1 - s) / .45) + dy), 30, .25)
def wb_title(im, t):
    if t < OS(100) + .2: K.put_text(im, (70, 300), 'this is what I call', FX('isemi', 48), GREY, 'l', 0, eo(cl((t - OS(95) + .05) / .35)) * (1 - eo(cl((t - OS(100)) / .25))))
    p = eo(cl((t - OS(94)) / .9)); place(im, sphere(210), lerp(-300, 300, p), 520, 40, .25 * p, (10, 30))
    K.rise(im, (70, 470), 'Vibe', FX('iblack', 250), INK, OS(100), t, track=-8, anchor='l'); K.rise(im, (110, 680), 'Editing', FX('iblack', 200), INK, OS(101), t, track=-6, anchor='l')
    hand(im, t, [("it's actually simple.", 102, 105)], 820, 48, rot=1) if False else None
    if t >= OS(102): write = eo(cl((t - OS(102)) / 1.0)); L, w, h = K.layer_text("it's actually simple.", FX('apple', 46)); m = np.zeros((h, w), np.uint8); m[:, :int(w * write)] = 255; im.paste(INK, (100, 800 - h // 2), Image.fromarray(np.minimum(np.asarray(L), m)))
    if t >= OS(95): micro(im, 760, 300, ['A WORKFLOW BY', 'DIRECTING CLAUDE', '—— 3 STEPS'][:1 + int(cl((t - OS(95)) / .6) * 2.99)], FX('jb7', 20), INK)
def wb_step1(im, t):
    K.rise(im, (70, 330), '01', FX('jb7', 40), LIME_D, OS(106), t, anchor='l'); K.rise(im, (150, 330), 'record yourself.', FX('iblack', 72), INK, OS(106) + .15, t, anchor='l')
    if t >= OS(113): w_ = eo(cl((t - OS(113)) / .9)); L, w, h = K.layer_text('your phone is enough.', FX('apple', 44)); m = np.zeros((h, w), np.uint8); m[:, :int(w * w_)] = 255; im.paste(INK, (130, 410 - h // 2), Image.fromarray(np.minimum(np.asarray(L), m)))
    p = spring(cl((t - OS(107)) / .8))
    if p > 0:
        place(im, sphere(250), 400, 860 + (1 - eo(cl(p))) * 500, 40, .18)
        ph = mg.tilt(mg.phone(gframe(t), 780), rx=4, ry=lerp(-50, -14, p), rz=-4); place(im, ph, 380, 930 + (1 - p) * 260, 40, .35, (-20, 40))
def wb_step2(im, t):
    K.rise(im, (70, 330), '02', FX('jb7', 40), LIME_D, OS(117), t, anchor='l'); K.rise(im, (150, 330), 'tell Claude what you want.', FX('iblack', 60), INK, OS(117) + .1, t, anchor='l')
    if t >= OS(124): w_ = eo(cl((t - OS(124)) / 1.0)); L, w, h = K.layer_text("like you're talking to an editor.", FX('apple', 40)); m = np.zeros((h, w), np.uint8); m[:, :int(w * w_)] = 255; im.paste(INK, (130, 405 - h // 2), Image.fromarray(np.minimum(np.asarray(L), m)))
    for k, (s, wi, y) in enumerate([('make it look like a magazine', 55, 620), ('put the words behind my head', 62, 800), ('cut me out', 84, 980)]):
        t0 = OS(120) + k * .35
        if t < t0: continue
        p = spring(cl((t - t0) / .5)); c_ = chip(s, label=f'YOU · {mmss(OS(wi))}', cursor=False); place(im, K.scaled(c_, 1, cl(p * 2)), 70 + c_.size[0] / 2 + k * 30 - (1 - p) * 300, y, 26, .22)
RULES = [('captions', 'designed per phrase'), ('camera', 'slow, motivated'), ('grade', 'real room, cinematic'), ('motion', 'explain, never decorate'), ('sound', 'soft, premium')]
def wb_step3(im, t):
    K.rise(im, (70, 330), '03', FX('jb7', 40), LIME_D, OS(130), t, anchor='l'); K.rise(im, (150, 330), 'the workflow.', FX('iblack', 80), INK, OS(135), t, anchor='l')
    if t < OS(135) + .1 and t >= OS(130): w_ = eo(cl((t - OS(130) - .1) / .8)) * (1 - eo(cl((t - OS(135) + .1) / .2))); K.put_text(im, (150, 330), 'the main thing:', FX('apple', 56), INK, 'l', 0, w_, rot=1)
    p = spring(cl((t - OS(133)) / .8))
    if p > 0:
        place(im, sphere(150), 700, 560 + (1 - eo(cl(p))) * 300, 30, .22)
        doc = Image.new('RGBA', (700, 640)); d = ImageDraw.Draw(doc); d.rounded_rectangle((0, 0, 699, 639), 36, fill=WHITE + (255,)); d.rounded_rectangle((0, 0, 699, 90), 36, fill=INK + (255,)); d.rectangle((0, 50, 699, 90), fill=INK)
        d.text((40, 48), 'vibe-editing.skill', font=FX('jb7', 30), fill=LIME, anchor='lm')
        for k, (a_, b_) in enumerate(RULES):
            y = 150 + k * 96; on = cl((t - OS(140) - k * ((OE(150) - OS(140)) / 5)) / .2)
            if on > 0: r = 18 * K.backo(on); d.ellipse((58 - r, y - r, 58 + r, y + r), fill=LIME)
            else: d.ellipse((40, y - 18, 76, y + 18), outline=(210, 208, 204), width=3)
            d.text((100, y), a_, font=FX('ibold', 34), fill=INK if on > 0 else (180, 178, 174), anchor='lm'); d.text((300, y), b_, font=FX('imed', 30), fill=GREY if on > 0 else (205, 203, 199), anchor='lm')
        place(im, mg.tilt(doc, rx=lerp(50, 10, p), ry=-12, rz=-3), 400, 830 + (1 - cl(p * 1.2)) * 300, 40, .3)
    if t >= OS(143): w_ = eo(cl((t - OS(143)) / 1.2)); L, w, h = K.layer_text('tells Claude what premium looks like.', FX('apple', 38)); m = np.zeros((h, w), np.uint8); m[:, :int(w * w_)] = 255; im.paste(INK, (130, 1180 - h // 2), Image.fromarray(np.minimum(np.asarray(L), m)))
WB = [(T_WB, wb_title), (OS(106) - .2, wb_step1), (OS(117) - .2, wb_step2), (OS(130) - .2, wb_step3)]
def board_layer(t):
    k = max(j for j, (s, _) in enumerate(WB) if t >= s); s0, fn = WB[k]; im = studio(12).copy(); fn(im, t)
    if k > 0 and t < s0 + .45:     # soft push-up between steps
        p = eio(cl((t - s0) / .45)); prev = studio(12).copy(); WB[k - 1][1](prev, s0 - .01); out = studio(12).copy()
        a = np.asarray(prev).astype(np.float32); b = np.asarray(im).astype(np.float32); base = np.asarray(out).astype(np.float32)
        a = np.roll(a, -int(140 * p), 0); b = np.roll(b, int(140 * (1 - p)), 0); m = base + (a - base) * (1 - p) + (b - base) * p
        im = Image.fromarray(np.clip(m, 0, 255).astype(np.uint8))
    return im
def s_cut(t):
    if t < T_WB:
        im = aroll(t, lerp(1.0, 1.04, eio(inv(OS(83), T_WB, t)))); chip_at(im, t, 'cut me out and put me on a whiteboard', OS(84), OE(92), T_WB + .1); return im
    p = eio(cl((t - T_WB) / .5)); q = eio(cl((t - T_WB - .5) / .8))
    bg = board_layer(t) if t > T_WB + .2 else studio(12).copy()
    room = gframe(t); base = Image.blend(room, bg, p) if p < 1 else bg
    place_me(base, t, lerp(1.0, .55, q), lerp(W / 2, 820, q), int(14 * cl(p * 1.5)))
    if t < T_WB + .5: chip_at(base, t, 'cut me out and put me on a whiteboard', OS(84), OE(92), T_WB + .1)
    sweep(base, t, T_WB)
    return base
# ================================ 6. SAME TOOL (MG) ================================
@lru_cache(maxsize=None)
def grey_reel(k):
    c = Image.fromarray(np.asarray(G(C.src_index(T_MUS + k * 3)))).copy(); mg.cheap_caps(c, ['SAME', 'EDIT'], k % 2, 1150, 100); c = c.resize((290, 516)).convert('RGBA'); c.putalpha(K.rounded_mask(290, 516, 24))
    a = np.asarray(c).astype(np.float32); a[..., :3] = a[..., :3].mean(2, keepdims=True) * .85 + 20; return Image.fromarray(a.astype(np.uint8))
def s_same(t):
    im = studio(16).copy(); K.rise(im, (W / 2, 330), 'everyone uses Claude.', FX('iblack', 70), INK, OS(153), t)
    if t < OS(153) + .1: K.put_text(im, (W / 2, 330), 'honestly,', FX('apple', 64), INK, 'm', 0, eo(cl((t - OS(151) + .1) / .5)) * (1 - eo(cl((t - OS(153) + .05) / .2))), rot=2)
    for k in range(3):
        t0 = OS(152) + k * .15
        if t < t0: continue
        p = spring(cl((t - t0) / .6)); place(im, K.scaled(grey_reel(k).rotate((k - 1) * -4 * p, expand=True, resample=Image.BICUBIC), 1, cl(p * 2)), 220 + k * 320, 720 + (1 - p) * 200, 18, .2)
    if t >= OS(162): K.put_text(im, (860, 1000), 'look cheap.', FX('apple', 50), INK, 'm', 0, eo(cl((t - OS(162)) / .4)), rot=-5)
    if t >= OS(165) - .05:
        a = eo(cl((t - OS(165) + .05) / .3)); K.put_text(im, (W / 2, 1080), 'not the tool.', FX('iblack', 100), (150, 148, 144), 'm', 0, a); hand_line(im, [(190, 1080), (890, 1072)], 10, INK, 4, inv(OE(167) - .1, OE(167) + .2, t))
    if t >= OS(168) - .05:
        p = spring(cl((t - OS(168) + .05) / .5)); s = tag("it's how you use it.", FX('iblack', 84), LIME, INK, (30, 10), 14); place(im, K.scaled(s, lerp(.7, 1, p), cl(p * 2)), W / 2, 1210, 18, .25)
    return im
# ================================ 7. PUT ME BACK ================================
T_BACK = OE(176) + .06
def s_back(t):
    if t < T_BACK:
        im = studio(12).copy(); p = eo(cl((t - OS(173) + .1) / .5)); place_me(im, t, .55, lerp(1200, 820, p)); chip_at(im, t, 'put me back', OS(174), OE(176), T_BACK + .2); return im
    q = eio(cl((t - T_BACK) / .5)); p = eio(cl((t - T_BACK - .45) / .4)); room = gframe(t)
    base = Image.blend(studio(12), room, p) if p > 0 else studio(12).copy()
    if p < 1: place_me(base, t, lerp(.55, 1.0, q), lerp(820, W / 2, q), int(14 * (1 - p)))
    else: base = room.copy()
    chip_at(base, t, 'put me back', OS(174), OE(176), T_BACK + .2); sweep(base, t, T_BACK); return base
# ================================ 8. THE COURSE (MG) ================================
def course_cover():
    box = Image.new('RGBA', (560, 700)); d = ImageDraw.Draw(box); d.rounded_rectangle((0, 0, 559, 699), 34, fill=LIME + (255,))
    d.text((64, 100), 'VIBE', font=FX('iblack', 124), fill=INK, anchor='lm'); d.text((64, 215), 'EDITING', font=FX('iblack', 96), fill=INK, anchor='lm')
    d.text((64, 300), 'the complete workflow', font=FX('isemi', 34), fill=INK, anchor='lm'); d.line([(64, 600), (496, 600)], fill=INK, width=3); d.text((64, 640), 'DIRECTED BY YOU · EDITED BY CLAUDE', font=FX('jb7', 20), fill=INK, anchor='lm'); return box
COVER = None
def s_course(t):
    global COVER
    COVER = COVER or course_cover(); im = studio(18).copy(); K.rise(im, (W / 2, 330), 'everything, in one course.', FX('iblack', 66), INK, OS(181), t)
    lands = [OS(186) + .5, OS(188) + .5, OS(191) + .5]; pulse = sum(math.exp(-((t - l) / .12) ** 2) * (t > l - .3) for l in lands) * .04
    p = spring(cl((t - OS(182)) / .8))
    if p > 0: place(im, K.scaled(mg.tilt(COVER, rx=8, ry=lerp(-60, -16, p), rz=-3), 1 + pulse, cl(p * 2)), 560, 870 + (1 - cl(p * 1.2)) * 400, 50, .35, (-20, 40))
    for k, (lab, wi, x, y, r, sx, sy) in enumerate([('my prompts', 186, 230, 560, -6, -300, 300), ('my skill files', 188, 840, 640, 5, 1300, 500), ('the whole workflow', 191, 260, 1180, -3, -400, 1400)]):
        if t < OS(wi) - .05: continue
        q = eo5(cl((t - OS(wi) + .05) / .5)); s = tag(lab, FX('ibold', 44), WHITE, INK, (34, 16)).rotate(r, expand=True, resample=Image.BICUBIC); place(im, K.scaled(s, 1, cl(q * 2)), lerp(sx, x, q), lerp(sy, y, q), 18, .2)
    return im
# ================================ 9. CTA ================================
def s_cta(t):
    im = aroll(t, lerp(1.02, 1.06, eio(inv(OS(193), SP, t))))
    hand(im, t, [('want your videos', 196, 198), ('to look like this?', 199, 202)], 330, 60, gap=100)
    p = cl((t - OS(204) + .1) / .6)
    if p > 0: s = tag('Learn the workflow  →', FX('ibold', 46), LIME, INK, (50, 26)); place(im, K.scaled(s, lerp(.6, 1, spring(p)), cl(p * 2)), W / 2, 1150, 30, .3)
    K.arrow(im, (W / 2 + 330, 1000), (W / 2 + 300, 1100), .3, inv(OS(206), OS(206) + .6, t), INK, 6, 51)
    return im
# ================================ 10. END CARD ================================
T_ENDCUT = OE(207) - .4
@lru_cache(maxsize=None)
def end_cut():
    c = cutout(np.asarray(gframe(T_ENDCUT)), alpha8(T_ENDCUT), LIME, 14); c = c.resize((int(W * .78), int(H * .78)), Image.LANCZOS); return c, head_top(np.asarray(c.split()[3]), 200, 640)
def s_end(t):
    e0 = SP; im = studio(20).copy(); p = spring(cl((t - e0 - .05) / .9)); place(im, sphere(300), W / 2, 1180 + (1 - eo(cl(p))) * 600, 50, .2)
    c, tp = end_cut(); q = spring(cl((t - e0 - .15) / .9)); shadowed(im, c, ((W - c.size[0]) / 2, 860 - tp + (1 - q) * 800), 40, .3)
    K.rise(im, (W / 2, 330), 'VIBE EDITING', FX('iblack', 128), INK, e0 + .1, t, track=-3)
    if t >= e0 + .4: w_ = eo(cl((t - e0 - .4) / 1.1)); L, w, h = K.layer_text('directed by me, edited by Claude', FX('sign', 74)); m = np.zeros((h, w), np.uint8); m[:, :int(w * w_)] = 255; im.paste(INK, (int(W / 2 - w / 2), 455 - h // 2), Image.fromarray(np.minimum(np.asarray(L), m)))
    b = cl((t - e0 - .7) / .6)
    if b > 0: s = tag('Learn the workflow  →', FX('ibold', 44), INK, LIME, (48, 24)); place(im, K.scaled(s, lerp(.7, 1, spring(b)), cl(b * 2)), W / 2, 610, 26, .3)
    K.rise(im, (W / 2, 705), '[your-url.com]', FX('jb4', 28), GREY, e0 + .9, t)
    return im
# ================================ timeline ================================
SCENES = [
 (0.0, s_open, None, 0),
 (T_NA, s_noapps, 'blur', .42),
 (OS(42) - .15, s_caps, 'blur', .42),
 (OS(74) - .12, s_recap, 'zoom', .42),
 (OS(83) - .15, s_cut, 'zoom', .42),
 (OS(151) - .12, s_same, 'left', .45),
 (OS(173) - .15, s_back, 'right', .45),
 (OS(181) - .25, s_course, 'blur', .42),
 (OS(193) - .15, s_cta, 'blur', .42),
 (SP, s_end, 'blur', .45),
]
def frame(i, out):
    t = i / 30; k = max(j for j, s in enumerate(SCENES) if t >= s[0]); t0, fn, tr, dur = SCENES[k]; cur = fn(t)
    if tr and t < t0 + dur:
        p = cl((t - t0) / dur); prev = SCENES[k - 1][1](min(t, t0 - 1e-3)); cur = K.blend_tr(prev, cur, eio(p) if tr in ('left', 'right', 'up', 'down') else p, tr)
    cur = K.grain(cur, 2.2, i); cur.convert('RGB').save(f'{out}/f{i:05d}.jpg', quality=93); return i
def _w(a): return frame(*a)
if __name__ == '__main__':
    import time
    out = sys.argv[1]; os.makedirs(out, exist_ok=True); a = sys.argv[2:]
    frames = [int(x) for x in a[a.index('--frames') + 1].split(',')] if '--frames' in a else list(range(NF))
    nw = int(a[a.index('--workers') + 1]) if '--workers' in a else 4; t0 = time.time()
    with Pool(nw) as p:
        for j, i in enumerate(p.imap_unordered(_w, [(i, out) for i in frames], chunksize=2)):
            if j % 120 == 0: print(j, '/', len(frames), round((time.time() - t0) / (j + 1), 2), 's/f', flush=True)
    print('done', len(frames), round(time.time() - t0), 's', flush=True)

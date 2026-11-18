"""Ad 6 — "Who edits your videos?"  ·  THEME: SWISS MODERN  ·  paper white + ink + electric cobalt
International-style grid, Inter Black, mono index labels, sharp cards, left-aligned asymmetric type, snappy cobalt wipes.
He stands on the right of frame, so A-roll captions sit big and left-aligned on the left."""
import math, numpy as np
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFilter
import vkit as K
from vkit import W, H, F, OS, cl, inv, eo, eo5, eio, spring, backo, lerp, mixc, place, scaled, put_text, rounded_mask
K.setup('ad6', 'clean', face=(585, 700)); K.WIPE_COL = (38, 64, 255)
PAPER = (244, 243, 239); INK = (17, 17, 17); COB = (38, 64, 255); GRID = (226, 225, 219); MUTE = (128, 128, 124); WHITE = (255, 255, 255)
SP = K.C.SPEECH; LX = 72
@lru_cache(None)
def paper():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for k in range(1, 6): d.line([(k * W / 6, 0), (k * W / 6, H)], fill=GRID, width=1)
    for y in range(0, H, 120): d.line([(0, y), (W, y)], fill=(236, 235, 230), width=1)
    return im
def bg(t): return K.grain(paper().copy(), 2, int(t * 30))
def meta(im, t, s, t0, x=LX, y=230, col=MUTE, anchor='l'):
    if t >= t0: put_text(im, (x, y), s, F('jb7', 26), col, anchor, alpha=eo(cl((t - t0) / .25)))
def snap(im, t, s, t0, x, y, f, col, dur=.32, anchor='l', track=-2, dist=60):
    """Swiss kinetic type: slides up from a hard mask line, no fade."""
    if t < t0: return
    p = eo5(cl((t - t0) / dur)); L, w, h = K.layer_text(s, f, track); off = int((1 - p) * h * .9)
    m = np.zeros((h, w), np.uint8); m[:, :] = 255; L2 = Image.new('L', (w, h), 0); L2.paste(L.crop((0, 0, w, h - off)), (0, off)) if off < h else None
    xx = int(x - 20 if anchor == 'l' else x - w / 2); im.paste(col, (xx, int(y - h / 2)), L2)
def lcap(im, t, lines, exit_at=1e9):
    """left-aligned captions on the A-roll; words snap in on their word times. lines: [(y, font, [(word, wi, accent)])]"""
    if t >= exit_at: return
    for y, f, words in lines:
        x = LX
        for s, wi, acc in words:
            snap(im, t, s, OS(wi) - .02, x, y, f, COB if acc else INK, .26)
            x += K.text_w(s, f, -2) + f.size * .24
def card(w, h, fill=WHITE, outline=(220, 219, 214), r=10):
    c = Image.new('RGBA', (w, h)); ImageDraw.Draw(c).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=fill + (255,), outline=outline, width=2); return c
def slide_in(im, layer, x, y, p, dx=0, dy=80, shadow=.12):
    if p <= 0: return
    q = eo5(cl(p)); place(im, scaled(layer, 1, cl(p * 3)), x + (1 - q) * dx, y + (1 - q) * dy, shadow, 18, (0, 10))
def cbutton(im, cx, cy, p, label='Learn the workflow  →', fill=COB, ink=WHITE, w=660):
    if p <= 0: return
    q = eo5(cl(p)); h = 112; ww = int(w * q)
    if ww < 4: return
    b = Image.new('RGBA', (ww, h)); ImageDraw.Draw(b).rounded_rectangle((0, 0, ww - 1, h - 1), 14, fill=fill + (255,)); im.paste(b, (int(cx - w / 2), int(cy - h / 2)), b)
    if q > .7: put_text(im, (cx, cy), label, F('ibold', 44), ink, alpha=cl((q - .7) / .3))
# ================================ SCENES ================================
def bubble(text_, w=760):
    f = F('imed', 40); c = card(w, 110, WHITE, (214, 213, 208), 55); d = ImageDraw.Draw(c); d.ellipse((28, 31, 76, 79), fill=(206, 205, 200)); d.text((100, 56), text_, font=f, fill=INK, anchor='lm'); return c
def s_inbox(t):
    im = bg(t); meta(im, t, '[01]  INBOX', 0)
    snap(im, t, 'I get the same', OS(0), LX, 330, F('ibold', 64), INK); snap(im, t, 'message', OS(3), LX, 450, F('iblack', 176), COB, .34)
    snap(im, t, 'every day.', OS(5), LX, 580, F('ibold', 64), INK)
    n = int(cl((t - OS(1)) / (OS(7) - OS(1))) * 7) + (1 if t >= OS(1) else 0); n = min(n, 8)
    for k in range(n):          # bubbles stack from the bottom, older ones rise and fade
        age = n - 1 - k; y = 1180 - age * 128; p = cl((t - (OS(1) + k * (OS(7) - OS(1)) / 7)) / .25)
        if y < 680: continue
        b = bubble('who edits your videos?'); a = cl(1 - (1180 - y) / 620) * .9 + .1
        slide_in(im, scaled(b, 1, a), LX - 30 + 380 + (k % 2) * 40, y, p, 0, 60)
    if t >= OS(7):              # the question lands big
        p = eo5(cl((t - OS(7)) / .3)); d = ImageDraw.Draw(im); d.rectangle((0, 660, W, 660 + int(600 * p)), fill=PAPER)
        snap(im, t, 'who edits', OS(7), LX, 820, F('iblack', 150), INK); snap(im, t, 'your videos?', OS(9), LX, 980, F('iblack', 150), COB)
    return im
def s_noeditor(t):
    im = bg(t); meta(im, t, '[02]  TEAM', OS(11))
    snap(im, t, 'there is', OS(12), LX, 330, F('ibold', 64), INK); snap(im, t, 'no', OS(14), LX, 470, F('iblack', 190), COB, .3); snap(im, t, 'editor.', OS(15) - .05, LX + 280, 470, F('iblack', 190), INK, .3)
    p = eo5(cl((t - OS(12)) / .4)); x0, y0, x1, y1 = 240, 640, 840, 1180
    if p > 0:
        d = ImageDraw.Draw(im); L = Image.new('L', (W, H), 0); dl = ImageDraw.Draw(L)
        for i in range(int(x0), int(x0 + (x1 - x0) * p), 28): dl.line([(i, y0), (min(i + 14, x1), y0)], fill=255, width=3); dl.line([(i, y1), (min(i + 14, x1), y1)], fill=255, width=3)
        for j in range(int(y0), int(y0 + (y1 - y0) * p), 28): dl.line([(x0, j), (x0, min(j + 14, y1))], fill=255, width=3); dl.line([(x1, j), (x1, min(j + 14, y1))], fill=255, width=3)
        im.paste(INK, (0, 0), L); put_text(im, (540, 910), 'EDITOR', F('sg7', 64), MUTE, track=10, alpha=p)
        meta(im, t, 'POSITION  ·  UNFILLED', OS(12) + .2, 540, 1000, MUTE, 'm')
    q = eo5(cl((t - OS(14) - .05) / .25))
    if q > 0:
        d = ImageDraw.Draw(im); d.line([(x0, y0), (x0 + (x1 - x0) * q, y0 + (y1 - y0) * q)], fill=COB, width=14); q2 = eo5(cl((t - OS(14) - .15) / .25))
        if q2 > 0: d.line([(x1, y0), (x1 - (x1 - x0) * q2, y0 + (y1 - y0) * q2)], fill=COB, width=14)
    return im
def s_build(t):
    im = bg(t); meta(im, t, '[03]  PROCESS', OS(16))
    snap(im, t, 'I talk,', OS(16), LX, 330, F('iblack', 110), INK); snap(im, t, 'Claude builds', OS(19), LX, 450, F('iblack', 110), COB); snap(im, t, 'the edit.', OS(21), LX, 570, F('iblack', 110), INK)
    p = cl((t - OS(16) - .05) / .35)
    if p > 0:   # input: live voice
        c = card(936, 210); d = ImageDraw.Draw(c); d.text((32, 44), 'INPUT  ·  VOICE', font=F('jb7', 24), fill=MUTE, anchor='lm')
        act = max([0.] + [math.exp(-((t - (OS(i) + .1)) / .18) ** 2) for i in range(16, 23)])
        for b in range(48): hh = 10 + (40 + 60 * act) * abs(math.sin(b * .7 + t * 9)) * (.4 + .6 * abs(math.sin(b * .23 + 1))); d.rounded_rectangle((40 + b * 18, 130 - hh / 2, 50 + b * 18, 130 + hh / 2), 4, fill=COB)
        slide_in(im, c, W / 2, 780, p)
    q = eo5(cl((t - OS(19)) / .3))
    if q > 0: d = ImageDraw.Draw(im); d.line([(W / 2, 900), (W / 2, 900 + 70 * q)], fill=INK, width=4); d.polygon([(W / 2 - 14, 900 + 70 * q - 4), (W / 2 + 14, 900 + 70 * q - 4), (W / 2, 900 + 70 * q + 14)], fill=INK) if q > .9 else None
    r = cl((t - OS(19) - .1) / .35)
    if r > 0:   # output: an edit assembling
        c = card(936, 260); d = ImageDraw.Draw(c); d.text((32, 44), 'OUTPUT  ·  EDIT', font=F('jb7', 24), fill=MUTE, anchor='lm')
        blocks = [(0, 40, 300, COB), (0, 320, 560, INK), (0, 580, 896, COB), (1, 40, 420, (180, 180, 176)), (1, 440, 896, (180, 180, 176)), (2, 40, 896, (210, 210, 206))]
        for k, (row, a_, b_, col) in enumerate(blocks):
            u = eo5(cl((t - OS(20) - k * .1) / .3))
            if u <= 0: continue
            off = (1 - u) * 300; d.rounded_rectangle((a_ + off, 84 + row * 54, b_ + off, 124 + row * 54), 6, fill=col)
        ph = 40 + 856 * cl((t - OS(20)) / 1.4); d.line([(ph, 74), (ph, 240)], fill=INK, width=3)
        slide_in(im, c, W / 2, 1110, r)
    return im
def s_sameclaude(t):
    im = K.graded(t, lerp(1.0, 1.03, inv(OS(23), OS(28), t)))
    lcap(im, t, [(300, F('ibold', 60), [('It', 23, False), ('is', 24, False), ('the', 25, False)]), (412, F('iblack', 120), [('same', 26, True), ('Claude.', 27, False)])])
    return im
@lru_cache(None)
def cheap_phone(k):
    c = Image.fromarray(K.raw(1.0 + k * 2.3)).copy(); K.cheap_caps(c, [['LOOK', 'CHEAP'], ['SO', 'CHEAP'], ['SAME', 'EDIT']][k], k % 2, 1150, 100); return K.phone(c, 760)
def s_cheap(t):
    im = bg(t); meta(im, t, "[04]  OTHER PEOPLE'S VIDEOS", OS(28))
    snap(im, t, "that makes other", OS(28), LX, 330, F('ibold', 64), INK); snap(im, t, "people's videos", OS(30), LX, 420, F('ibold', 64), INK)
    for k in range(3):
        p = cl((t - OS(30) - k * .12) / .45); ph = cheap_phone(k).rotate(0, expand=True); slide_in(im, ph, 220 + k * 320, 900, p, 0, 140, .2)
    if t >= OS(33) - .05:
        p = eo5(cl((t - OS(33) + .05) / .22)); d = ImageDraw.Draw(im); y = 1180; d.rectangle((0, y - 110, int(W * p), y + 110), fill=COB)
        if p > .6: put_text(im, (W / 2, y), 'LOOK CHEAP.', F('iblack', 150), WHITE, track=-2, alpha=cl((p - .6) / .4))
    return im
RULES = ['captions - one phrase at a time', 'camera   - slow, motivated moves', 'grade    - the real room, cinematic', 'sound    - quiet, designed']
def s_taught(t):
    im = bg(t); meta(im, t, '[05]  SAME TOOL', OS(35))
    snap(im, t, 'Same tool.', OS(35), LX, 380, F('iblack', 170), INK, .34)
    snap(im, t, 'I just taught it what', OS(37), LX, 540, F('ibold', 62), INK); snap(im, t, 'premium looks like.', OS(41), LX, 625, F('ibold', 62), COB)
    p = cl((t - OS(38)) / .4)
    if p > 0:
        c = card(936, 480); d = ImageDraw.Draw(c); d.rectangle((0, 0, 935, 70), fill=INK); d.text((32, 36), 'premium.md', font=F('jb7', 28), fill=WHITE, anchor='lm'); d.text((904, 36), '●  ●  ●', font=F('gen', 18), fill=(120, 120, 120), anchor='rm')
        chars = int((t - OS(39)) * 70) if t > OS(39) else 0
        for k, r_ in enumerate(RULES):
            n = cl(chars - sum(len(x) + 6 for x in RULES[:k]), 0, len(r_))
            if n <= 0: break
            s_ = r_[:int(n)]; d.text((40, 130 + k * 84), s_, font=F('jb4', 32), fill=INK, anchor='lm')
            if n < len(r_) and int(t * 4) % 2: d.rectangle((40 + F('jb4', 32).getlength(s_) + 4, 112 + k * 84, 58 + F('jb4', 32).getlength(s_) + 4, 150 + k * 84), fill=COB)
        slide_in(im, c, W / 2, 970, p)
    return im
ITEMS = [('01', 'PROMPTS', 48), ('02', 'SKILL', 50), ('03', 'WORKFLOW', 53)]
def s_course(t):
    im = bg(t); meta(im, t, '[06]  WHAT YOU GET', OS(45))
    snap(im, t, 'All of it is in', OS(46), LX, 330, F('ibold', 64), INK); snap(im, t, 'this course.', OS(55), LX, 460, F('iblack', 150), COB, .34)
    merge = eo5(cl((t - OS(56)) / .4))
    for k, (num, name, wi) in enumerate(ITEMS):
        p = cl((t - OS(wi) + .05) / .3)
        if p <= 0: continue
        y = lerp(680 + k * 170, 900, merge); c = card(936, 150, WHITE if merge < .5 else COB, (214, 213, 208) if merge < .5 else COB); d = ImageDraw.Draw(c)
        ink = INK if merge < .5 else WHITE; d.text((40, 75), num, font=F('jb7', 34), fill=COB if merge < .5 else WHITE, anchor='lm'); d.text((150, 78), name, font=F('iblack', 76), fill=ink, anchor='lm')
        d.text((896, 75), '✓', font=F('gen', 44), fill=COB if merge < .5 else WHITE, anchor='rm'); slide_in(im, c, W / 2, y, p, 400, 0)
    if merge > .9: put_text(im, (W / 2, 1060), 'THE VIBE EDITING COURSE', F('jb7', 30), INK, alpha=cl((merge - .9) * 10))
    return im
def s_tap(t):
    im = bg(t); meta(im, t, '[07]  NEXT STEP', OS(58) - .1)
    snap(im, t, 'So just tap', OS(58), LX, 320, F('ibold', 64), INK); snap(im, t, 'the link below.', OS(61), LX, 440, F('iblack', 116), COB, .3)
    p = eo5(cl((t - OS(58) + .14) / .4)); bw, bh = 936, 560
    if p > 0:
        blk = K.block(t, bw, int(bh * p) if p < 1 else bh, lerp(1.25, 1.18, inv(OS(58), SP, t))); im.paste(blk, (LX, 560))
    cbutton(im, W / 2, 1196, cl((t - OS(63)) / .3), w=660)
    return im
def s_end(t):
    e0 = SP; im = bg(t); meta(im, t, '[07]  VIBE EDITING', e0)
    snap(im, t, 'VIBE', e0 + .05, LX, 430, F('iblack', 260), INK, .3); snap(im, t, 'EDITING', e0 + .15, LX, 650, F('iblack', 196), COB, .3)
    snap(im, t, 'No editor. Just the workflow.', e0 + .35, LX, 800, F('sg5', 52), INK)
    cbutton(im, LX + 330, 950, cl((t - e0 - .55) / .35)); meta(im, t, '[your-url.com]', e0 + .8, LX, 1060, MUTE)
    q = eo5(cl((t - e0 - .1) / .4))
    if q > 0: ImageDraw.Draw(im).rectangle((W - 72 - 120 * q, 330, W - 72, 450), fill=COB)
    return im
SCENES = [
 (0.0, s_inbox, None),
 (OS(11) - .14, s_noeditor, 'wipe', .4),
 (OS(16) - .14, s_build, 'left', .32),
 (OS(23) - .14, s_sameclaude, 'wipe', .4),
 (OS(28) - .1, s_cheap, 'up', .3),
 (OS(35) - .14, s_taught, 'wipe', .4),
 (OS(45) - .12, s_course, 'left', .32),
 (OS(58) - .14, s_tap, 'wipe', .4),
 (SP, s_end, 'wipe', .4),
]
MUSIC = 'music_glass'; LIFT = OS(16); MUSIC_OFS = 9.0; MUSIC_BRIGHT = .35; MUSIC_LVL = .18
def CUES():
    return [('typing', .1, .1)] + [('pop', OS(1) + k * (OS(7) - OS(1)) / 7, .1, (-1) ** k * .2) for k in range(8)] + \
           [('thud', OS(7), .22), ('whip', OS(11) - .3, .18), ('thud', OS(14), .26), ('whip', OS(16) - .3, .16), ('hud', OS(17), .08), ('hud', OS(20), .08), ('hud', OS(20) + .2, .08), ('hud', OS(20) + .4, .08),
            ('whip', OS(23) - .3, .16), ('whoosh_b', OS(28) - .25, .16), ('impact', OS(33), .26), ('whip', OS(35) - .3, .16), ('thud', OS(35), .2), ('typing', OS(39), .14),
            ('whoosh_b', OS(45) - .25, .16), ('pop', OS(48), .14), ('pop', OS(50), .14), ('pop', OS(53), .14), ('thud', OS(56), .2), ('whip', OS(58) - .3, .16), ('pop', OS(63), .16),
            ('whip', SP - .3, .16), ('thud', SP + .1, .2), ('pop', SP + .6, .14)]
if __name__ == '__main__':
    K.run(K.make_frame(SCENES))

"""Ad 3 — "The first time I edited with AI"  ·  THEME: PINTEREST EDITORIAL  ·  oat paper + espresso + clay
Journal / scrapbook language: Instrument Serif, Caveat handwriting, polaroids with washi tape, warm film grade, light-leak dissolves."""
import math, numpy as np
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFilter
import vkit as K
import mg
from vkit import W, H, F, OS, cl, inv, eo, eo5, eio, spring, backo, lerp, mixc, place, scaled, put_text, stamp, rise, cap_words, rounded_mask, write_on
K.setup('ad3', 'film', face=(600, 880))
OAT = (236, 227, 212); LINEN = (247, 242, 233); ESP = (50, 37, 30); CLAY = (176, 96, 60); MUTE = (140, 122, 106); TAPE = (226, 210, 180)
SP = K.C.SPEECH
@lru_cache(None)
def paper(seed=3):
    a = np.zeros((H, W, 3), np.float32) + np.array(OAT, np.float32); yy, xx = K._grid()
    a = a + (K.noise(H, W, 220, seed) * 2.2 + K.noise(H, W, 3, seed + 1) * 1.6)[..., None]
    g = np.exp(-(((xx - 120) / 700) ** 2 + ((yy - 200) / 800) ** 2)); a = a + g[..., None] * np.array([18, 6, -6], np.float32)      # soft window light
    d = np.sqrt(((xx - W / 2) / (W * .75)) ** 2 + ((yy - H * .5) / (H * .7)) ** 2); a = a * (1 - .18 * np.clip(d - .4, 0, 1))[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def bg(t, seed=3): return K.grain(paper(seed).copy(), 3, int(t * 24))
def tape(w=190, h=54, seed=1, rot=0):
    r = np.random.default_rng(seed); im = Image.new('RGBA', (w, h), TAPE + (178,)); d = ImageDraw.Draw(im)
    for x in range(0, w, 3): d.line([(x, 0), (x, h)], fill=TAPE + (int(160 + r.integers(0, 40)),))
    m = Image.new('L', (w, h), 255); dm = ImageDraw.Draw(m)
    for side in (0, w - 1):
        for y in range(0, h, 6): o = int(r.integers(0, 8)); dm.rectangle((side - o if side else 0, y, side if side else o, y + 6), fill=0)
    im.putalpha(Image.fromarray(np.minimum(np.asarray(im.split()[3]), np.asarray(m)))); return im.rotate(rot, expand=True, resample=Image.BICUBIC)
def polaroid(photo, pw=600, ph=640, caption=None, cap_p=1., seed=1, tapes=True):
    fw, fh = pw + 56, ph + 150; fr = Image.new('RGBA', (fw, fh), (250, 248, 243, 255)); d = ImageDraw.Draw(fr)
    fr.paste(photo.resize((pw, ph), Image.LANCZOS) if photo.size != (pw, ph) else photo, (28, 28)); d.rectangle((28, 28, 28 + pw, 28 + ph), outline=(225, 220, 212), width=1)
    if caption and cap_p > 0:
        L, lw, lh = K.layer_text(caption, F('hand', 58)); q = eo(cl(cap_p)); m = np.zeros((lh, lw), np.uint8); m[:, :int(lw * q)] = 255; L = Image.fromarray(np.minimum(np.asarray(L), m))
        fr.paste(ESP, (int(fw / 2 - lw / 2), int(ph + 28 + 62 - lh / 2)), L)
    if tapes:
        t1 = tape(200, 56, seed, -8); fr2 = Image.new('RGBA', (fw + 60, fh + 60)); fr2.paste(fr, (30, 40)); fr2.alpha_composite(t1, (fw // 2 - t1.size[0] // 2 + 30, 6)); return fr2
    return fr
def take_crop(t, w, h, z=1.0):
    g = K.graded(t, z); fx, fy = K.C.face; s = max(w / W, h / H) * 1.25; im = g.resize((int(W * s), int(H * s)), Image.LANCZOS)
    ox = int(np.clip(fx * s - w / 2, 0, im.size[0] - w)); oy = int(np.clip(fy * s - h * .46, 0, im.size[1] - h)); return im.crop((ox, oy, ox + w, oy + h))
def drop(im, layer, cx, cy, p, rot=0, shadow=.32):
    if p <= 0: return
    a = spring(p, 6, 8); L = layer.rotate(rot + (1 - a) * 8, expand=True, resample=Image.BICUBIC); L = scaled(L, lerp(1.12, 1, a), cl(p * 2))
    place(im, L, cx, cy - (1 - a) * 60, shadow, 26, (8, 22))
def serif_title(im, t, l1, l2, t1, t2, y1=330, y2=450, s1=112, s2=104, c2=CLAY, exit_at=1e9):
    q = 1 - eo(cl((t - exit_at) / .25))
    if q <= 0: return
    if l1 and t >= t1: p = eo(cl((t - t1) / .6)); put_text(im, (W / 2, y1), l1, F('inst', s1), ESP, alpha=p * q, dy=(1 - p) * 26)
    if l2 and t >= t2: p = eo(cl((t - t2) / .6)); put_text(im, (W / 2, y2), l2, F('insti', s2), c2, alpha=p * q, dy=(1 - p) * 26)
def label(im, t, s, t0, y=230):
    if t >= t0: put_text(im, (W / 2, y), s, F('ilight', 28), MUTE, track=8, alpha=eo(cl((t - t0) / .5)))
CAP = dict(c=ESP, acc=CLAY, shadow=.35, shadow_col=(250, 244, 232), mode='blur', dist=20, dur=.32)
def caps(im, t, small, big, y=410, exit_at=1e9):
    lines = []
    if small: lines.append((y, F('inst', 76), small))
    if big: lines.append((y + 118, F('insti', 112), big))
    st = dict(CAP); cap_words(im, t, lines, st, exit_at)
def strike(im, x0, x1, y, p, col=CLAY, w=7, seed=3):
    K.stroke(im, [(x0 + (x1 - x0) * u, y + math.sin(u * 9 + seed) * 4) for u in np.linspace(0, 1, 30)], eo(p), w, col, seed, 2, 245)
# ================================ SCENES ================================
def s_hook(t):
    im = bg(t); label(im, t, 'JOURNAL  ·  ENTRY 01', 0.05)
    serif_title(im, t, 'The first time', 'I edited with AI', OS(0), OS(3), 340, 462)
    pol = polaroid(take_crop(t, 560, 600), 560, 600, 'my first AI edit', inv(OS(6), OS(8) + .3, t), 5)
    drop(im, pol, W / 2 - 10, 930, cl((t - .25) / .9), -3)
    if t >= OS(9) - .1:   # the comment
        p = spring(cl((t - OS(9) + .1) / .6), 6, 8); card = Image.new('RGBA', (760, 150), (0, 0, 0, 0)); d = ImageDraw.Draw(card)
        d.rounded_rectangle((0, 0, 759, 149), 40, fill=LINEN + (255,), outline=(222, 212, 196))
        d.ellipse((30, 39, 102, 111), fill=(214, 196, 172)); d.rounded_rectangle((128, 34, 300, 52), 9, fill=(222, 210, 192))
        n = int(len('this is AI, right?') * cl((t - OS(11)) / .9)); d.text((128, 104), 'this is AI, right?'[:n], font=F('imed', 42), fill=ESP, anchor='ls')
        place(im, scaled(card, lerp(.9, 1, p), cl(p * 2)), W / 2 + 30, 1210 - (1 - p) * 80, .28, 24, (0, 16))
        put_text(im, (250, 1080), 'someone commented', F('hand', 50), CLAY, alpha=eo(cl((t - OS(9)) / .4)), rot=4)
    return im
def s_hurt(t):
    im = K.graded(t, lerp(1.02, 1.07, inv(OS(15), OS(21), t)))
    caps(im, t, [('It', 15, False), ('hurt,', 16, True)], [('but', 17, False), ('they', 18, False), ('were', 19, False), ('right.', 20, True)])
    return K.grain(im, 3, int(t * 24))
@lru_cache(None)
def old_edit(k):
    c = Image.fromarray(K.raw(1.5 + k * 2.1)).copy(); K.cheap_caps(c, [['LOOKED', 'CHEAP'], ['SO', 'CHEAP'], ['AI', 'EDIT']][k], k % 2, 1150, 100)
    c = c.crop((0, 260, 1080, 1660)); a = np.asarray(c).astype(np.float32); l = a.mean(2, keepdims=True); a = l + (a - l) * .55; a = a * .9 + 18      # faded print
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def s_cheap(t):
    im = bg(t, 7); label(im, t, 'BACK THEN', OS(21))
    serif_title(im, t, 'the videos looked', 'cheap.', OS(21), OS(24), 340, 470, 100, 140)
    for k, (cx, cy, rot) in enumerate([(300, 900, -7), (780, 960, 6), (540, 1180, -2)]):
        p = cl((t - OS(22) - k * .22) / .8)
        drop(im, polaroid(old_edit(k), 330, 420, None, 0, 11 + k), cx, cy, p, rot)
    K.stroke(im, K.ellipse_pts(540, 1150, 230, 150, seed=4), inv(OS(24), OS(24) + .6, t), 7, CLAY, 4, 2, 240)
    put_text(im, (840, 1340), 'looked cheap.', F('hand', 62), CLAY, alpha=eo(cl((t - OS(25)) / .4)), rot=-5)
    return im
TOOLS = [('✂', 'cut app'), ('Aa', 'captions'), ('♪', 'music'), ('✦', 'AI tool')]
RULES = [('captions', 'one phrase at a time'), ('camera', 'slow, motivated'), ('colour', 'real, warm, filmic'), ('sound', 'quiet, designed')]
def s_tools(t):
    im = bg(t, 9); label(im, t, 'WHAT CHANGED', OS(28))
    serif_title(im, t, 'I stopped changing tools.', None, OS(29), 0, 340, 0, 76)
    for k, (ic, nm) in enumerate(TOOLS):
        x = 175 + k * 243; p = cl((t - OS(30) - k * .12) / .6)
        if p <= 0: continue
        card = Image.new('RGBA', (210, 200), (0, 0, 0, 0)); d = ImageDraw.Draw(card); d.rounded_rectangle((0, 0, 209, 199), 26, fill=LINEN + (255,), outline=(222, 212, 196))
        d.text((105, 80), ic, font=F('gen', 56) if ic != 'Aa' else F('inst', 70), fill=ESP, anchor='mm'); d.text((105, 158), nm, font=F('ireg', 28), fill=MUTE, anchor='mm')
        drop(im, card, x, 560, p, (k - 1.5) * 2, .2)
    strike(im, 70, 1010, 560, inv(OS(31) + .1, OS(32) + .3, t), CLAY, 8, 2)
    serif_title(im, t, None, 'I changed how I use them.', 0, OS(33), 0, 740, 0, 80)
    # journal page with handwritten rules
    p = cl((t - OS(34) + .2) / .7)
    if p > 0:
        pg = Image.new('RGBA', (820, 470), (0, 0, 0, 0)); d = ImageDraw.Draw(pg); d.rounded_rectangle((0, 0, 819, 469), 18, fill=LINEN + (255,))
        for y in range(70, 470, 80): d.line([(40, y + 34), (780, y + 34)], fill=(226, 216, 200), width=2)
        d.line([(96, 0), (96, 469)], fill=(228, 186, 166), width=2); drop(im, pg, W / 2, 1040, p, 1.2, .22)
        for k, (a_, b_) in enumerate(RULES):
            t0 = OS(35) + k * .45; y = 870 + k * 80 + 36
            write_on(im, (200, y), f'{a_} — {b_}', F('hand', 52), ESP, t0, t, .5, anchor='l')
            if t > t0 + .45: K.stroke(im, [(142, y), (156, y + 14), (182, y - 16)], cl((t - t0 - .45) / .2), 6, CLAY, 30 + k, 2, 245)
    return im
def s_watch(t):
    im = K.graded(t, lerp(1.0, 1.06, inv(OS(39), OS(47), t)))
    if t < OS(42): caps(im, t, [('Now', 39, False), ('watch', 40, False)], [('this.', 41, True)])
    else: caps(im, t, [('nobody', 42, False), ('says', 43, False)], [('this', 44, False), ('is', 45, False), ('AI.', 46, True)])
    return K.grain(im, 3, int(t * 24))
def note(im, t, s, t0, cx, cy, rot=-4):
    if t < t0: return
    p = cl((t - t0) / .6); card = Image.new('RGBA', (560, 170), (0, 0, 0, 0)); d = ImageDraw.Draw(card); d.rectangle((0, 0, 559, 169), fill=(250, 244, 228, 255))
    d.text((280, 92), s, font=F('hand', 64), fill=ESP, anchor='mm'); card.alpha_composite(tape(150, 46, 7, 4), (205, 0)) if False else None
    c2 = Image.new('RGBA', (600, 220)); c2.paste(card, (20, 40)); t_ = tape(160, 48, 9, -6); c2.alpha_composite(t_, (300 - t_.size[0] // 2, 6)); drop(im, c2, cx, cy, p, rot, .22)
def s_editor(t):
    im = K.graded(t, lerp(1.04, 1.08, inv(OS(47), OS(57), t)))
    if t < OS(54): caps(im, t, [('people', 47, False), ('ask', 48, False), ('me', 49, False)], [('who', 50, False), ('my', 51, False), ('editor', 52, True), ('is.', 53, False)])
    else: caps(im, t, [('so...', 54, False)], [('I', 55, False), ('am.', 56, True)])
    if t < OS(54): note(im, t, "who's your editor?", OS(50), 760, 730, 5)
    return K.grain(im, 3, int(t * 24))
def s_timeline(t):
    im = bg(t, 13); label(im, t, 'THE OLD WAY', OS(57))
    serif_title(im, t, "I just don't sit", 'on a timeline.', OS(57), OS(61), 340, 462, 104, 104)
    p = cl((t - OS(58)) / .8)
    if p > 0:
        tl = Image.new('RGBA', (880, 420), (0, 0, 0, 0)); d = ImageDraw.Draw(tl); d.rounded_rectangle((0, 0, 879, 419), 30, fill=LINEN + (255,), outline=(222, 212, 196))
        d.text((40, 58), 'timeline_final_v12.prproj'.replace('.prproj', ''), font=F('jb4', 26), fill=MUTE, anchor='ls')
        cols = [(214, 196, 172), (196, 170, 140), (230, 214, 192), (186, 150, 120)]
        for r in range(4):
            x = 40
            for j in range(7):
                w = 60 + ((r * 7 + j * 13) % 5) * 26; d.rounded_rectangle((x, 100 + r * 74, min(840, x + w), 150 + r * 74), 10, fill=cols[(r + j) % 4]); x += w + 10
                if x > 820: break
        drop(im, tl, W / 2, 900, p, -1.5, .22)
    strike(im, 120, 960, 900, inv(OS(62), OS(63) + .2, t), CLAY, 10, 5); strike(im, 140, 940, 930, inv(OS(62) + .15, OS(63) + .35, t), CLAY, 8, 6)
    put_text(im, (780, 1170), 'not me.', F('hand', 72), CLAY, alpha=eo(cl((t - OS(63)) / .4)), rot=-6)
    return im
def pbutton(im, cx, cy, p, label='Learn the workflow  →', fill=CLAY, ink=LINEN):
    if p <= 0: return
    s = lerp(.75, 1, spring(p, 6, 8)); w, h = int(640 * s), int(110 * s); b = Image.new('RGBA', (w, h)); ImageDraw.Draw(b).rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=fill + (255,))
    ImageDraw.Draw(b).text((w // 2, h // 2), label, font=F('isemi', int(42 * s)), fill=ink, anchor='mm'); place(im, scaled(b, 1, cl(p * 2)), cx, cy, .3, 24, (0, 14))
def s_teach(t):
    im = K.graded(t, lerp(1.05, 1.09, inv(OS(64), SP, t)))
    if t < OS(71): caps(im, t, [('this', 65, False), ('is', 66, False), ('exactly', 67, False)], [('what', 68, False), ('I', 69, False), ('teach.', 70, True)])
    else:
        caps(im, t, [('the', 72, False), ('link', 73, False), ('is', 74, False), ('below', 75, False)], None, y=340)
        pbutton(im, W / 2, 500, cl((t - OS(75)) / .6))
    return K.grain(im, 3, int(t * 24))
END_T = None
def s_end(t):
    e0 = SP; im = bg(t, 17); label(im, t, 'THE METHOD', e0 + .05, 250)
    rise(im, (W / 2, 380), 'Vibe', F('inst', 170), ESP, e0 + .1, t, dur=.6); rise(im, (W / 2, 530), 'Editing', F('insti', 170), CLAY, e0 + .22, t, dur=.6)
    write_on(im, (W / 2, 660), 'edits that feel like you, not like AI', F('hand', 56), ESP, e0 + .45, t, .9)
    pbutton(im, W / 2, 790, cl((t - e0 - .7) / .6)); rise(im, (W / 2, 892), '[your-url.com]', F('jb4', 30), MUTE, e0 + .9, t)
    pol = polaroid(take_crop(OS(70) + .12, 420, 440), 420, 440, 'vibe editing', 1, 21); drop(im, pol, W / 2 + 20, 1300, cl((t - e0 - .2) / .9), 4)
    return im
SCENES = [
 (0.0, s_hook, None),
 (OS(15) - .1, s_hurt, 'zoom', .34),
 (OS(21) - .1, s_cheap, 'leak', .4),
 (OS(28) - .12, s_tools, 'blur', .35),
 (OS(39) - .1, s_watch, 'leak', .45),
 (OS(47) - .06, s_editor, None),
 (OS(57) - .12, s_timeline, 'blur', .35),
 (OS(64) - .1, s_teach, 'leak', .4),
 (SP, s_end, 'blur', .45),
]
MUSIC = 'music_pin'; LIFT = OS(39); MUSIC_LVL = .2
def CUES():
    return [('paperslide', .2, .18), ('camera', .35, .12), ('pop', OS(9), .14), ('typing', OS(11), .12), ('thud', OS(15) - .05, .16), ('paperslide', OS(21) - .15, .2),
            ('camera', OS(22) + .1, .1), ('camera', OS(22) + .32, .1), ('camera', OS(22) + .54, .1), ('chalk', OS(24), .14), ('paperslide', OS(28) - .2, .18), ('chalk', OS(31) + .1, .2),
            ('paperslide', OS(34) - .2, .16), ('chalk', OS(35), .1), ('chalk', OS(35) + .9, .1), ('shimmer', OS(39), .14), ('paperslide', OS(50), .14), ('pop', OS(56), .12),
            ('paperslide', OS(57) - .2, .18), ('chalk', OS(62), .2), ('shimmer', OS(64), .12), ('pop', OS(75), .16), ('paperslide', SP - .1, .18), ('camera', SP + .3, .12), ('pop', SP + .75, .14)]
if __name__ == '__main__':
    K.run(K.make_frame(SCENES))

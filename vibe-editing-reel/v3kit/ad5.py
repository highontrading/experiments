"""Ad 5 — "AI can't make premium edits"  ·  THEME: LUXURY  ·  onyx + champagne gold + ivory
Cormorant / Playfair serifs, letter-spaced small caps, thin gold rules, gold dust, foil-shimmer type.
Signature beats: the words really go behind the head (matte), and a gold line-drawn room appears behind him on "this room doesn't exist"."""
import math, numpy as np, cv2
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFilter
import vkit as K
from vkit import W, H, F, OS, cl, inv, eo, eo5, eio, spring, backo, lerp, mixc, place, scaled, put_text, rise, cap_words, rounded_mask
K.setup('ad5', 'lux', face=(690, 780), frame_cx=.58)
ONYX = (10, 10, 11); GOLD = (212, 182, 124); GOLD_HI = (244, 226, 180); GOLD_LO = (150, 116, 64); IVORY = (240, 234, 222); MUTE = (128, 120, 108)
SP = K.C.SPEECH
# ---------------- surfaces ----------------
@lru_cache(None)
def onyx_plate(gx=.5, gy=.38):
    yy, xx = K._grid(); a = np.zeros((H, W, 3), np.float32) + np.array(ONYX, np.float32)
    g = np.exp(-(((xx - W * gx) / 640) ** 2 + ((yy - H * gy) / 820) ** 2)); a = a + g[..., None] * np.array([44, 36, 24], np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
@lru_cache(None)
def _dust(seed=5, n=70):
    r = np.random.default_rng(seed); return r.uniform(0, W, n), r.uniform(0, H, n), r.uniform(1.2, 3.4, n), r.uniform(8, 26, n), r.uniform(0, 6.28, n)
def dust(im, t, k=1., seed=5):
    xs, ys, sz, sp, ph = _dust(seed); L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    for x, y, s, v, p in zip(xs, ys, sz, sp, ph):
        yy = (y - t * v) % H; xx = x + 14 * math.sin(t * .4 + p); a = (.5 + .5 * math.sin(t * 2.2 + p)) * 255 * k; d.ellipse((xx - s, yy - s, xx + s, yy + s), fill=int(a))
    im.paste(GOLD_HI, (0, 0), L.filter(ImageFilter.GaussianBlur(1.6)))
def bg(t, gx=.5, gy=.38, dk=1.): im = onyx_plate(gx, gy).copy(); dust(im, t, .55 * dk); return K.grain(im, 3, int(t * 30))
def frame_rule(im, t0, t, inset=56, col=GOLD, w=2):
    """thin gold inset frame drawing itself clockwise from top-centre."""
    p = eo(cl((t - t0) / 1.1))
    if p <= 0: return
    x0, y0, x1, y1 = inset, inset, W - inset, H - inset; per = 2 * ((x1 - x0) + (y1 - y0)); pts = [(W / 2, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0), (W / 2, y0)]
    L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L); left = per * p; cur = pts[0]
    for nxt in pts[1:]:
        seg = math.dist(cur, nxt)
        if left <= 0: break
        f = min(1, left / seg); end = (cur[0] + (nxt[0] - cur[0]) * f, cur[1] + (nxt[1] - cur[1]) * f); d.line([cur, end], fill=210, width=w); left -= seg; cur = nxt
    im.paste(col, (0, 0), L)
# ---------------- gold foil type ----------------
def gold_text(im, xy, s, f, t, alpha=1., shimmer_t0=None, track=0, anchor='m', dy=0, blur=0, scale=1.):
    if alpha <= 0: return
    L, w, h = K.layer_text(s, f, track)
    if scale != 1: L = L.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.BICUBIC); w, h = L.size
    if blur > .3: L = L.filter(ImageFilter.GaussianBlur(blur))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); g = (yy / h)[..., None]
    col = np.array(GOLD_HI, np.float32) * (1 - g) + np.array(GOLD_LO, np.float32) * g; col = col + (np.sin(yy / h * 9) * 6)[..., None]
    if shimmer_t0 is not None:
        sx = (t - shimmer_t0) / 1.0 * (w + h) - h; band = np.exp(-(((xx + yy * .5) - sx) / (w * .06)) ** 2); col = col + band[..., None] * 90
    fill = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)); m = L.point(lambda v: int(v * alpha))
    x = int(xy[0] - (w / 2 if anchor == 'm' else 20)); y = int(xy[1] - h / 2 + dy); im.paste(fill, (x, y), m)
def caps_small(im, t, s, t0, y, col=GOLD):
    if t >= t0: put_text(im, (W / 2, y), s, F('ilight', 26), col, track=12, alpha=eo(cl((t - t0) / .6)))
CAP = dict(c=IVORY, acc=GOLD_HI, shadow=.55, mode='blur', dist=18, dur=.34)
@lru_cache(None)
def _scrim():
    g = np.clip(1 - np.abs(np.arange(H) - 470) / 330, 0, 1) ** 1.4 * 150; return Image.fromarray(np.repeat(g[:, None], W, 1).astype(np.uint8))
def caps(im, t, small, big, y=400, exit_at=1e9):
    if t < exit_at: im.paste((6, 5, 4), (0, 0), _scrim())
    lines = []
    if small: lines.append((y, F('corm5', 74), small))
    if big: lines.append((y + 112, F('play6i', 100), big))
    st = dict(CAP); st['acc_font'] = F('play6i', 100); cap_words(im, t, lines, st, exit_at)
# ---------------- person compositing (matte) ----------------
def person_over(t, under, z=1.0, cx=None, cy=0.):
    """grade the take, draw `under(img)` onto a copy (text/room), then put the person back on top with the RVM alpha; zoom last so matte stays aligned."""
    G = Image.fromarray(K.grade(K.raw(t), seed=int(t * 30))); A0 = K.alpha(t).astype(np.float32) / 255
    B = under(G.copy()); g = np.asarray(G).astype(np.float32); b = np.asarray(B).astype(np.float32)
    core = (A0 > .93).astype(np.float32); core = cv2.erode(core, np.ones((5, 5), np.uint8))       # colour decontamination: rebuild edge colours from inner foreground
    num = cv2.GaussianBlur(g * core[..., None], (0, 0), 7); den = cv2.GaussianBlur(core, (0, 0), 7)[..., None]; fg_est = num / np.maximum(den, 1e-3)
    m = np.clip((A0 - .55) / .4, 0, 1)[..., None]; g = np.where(den > .02, g * m + fg_est * (1 - m), g * .6)
    A = np.clip((A0 - .2) / .72, 0, 1) ** 1.25; A = cv2.GaussianBlur(A, (0, 0), .9)[..., None]
    out = Image.fromarray(np.clip(b * (1 - A) + g * A, 0, 255).astype(np.uint8))
    return K.zoom(out, z, K.C.cx if cx is None else cx, .42 + cy)
def room_lines(im, t, t0):
    """gold line-drawn architectural room: perspective floor, arch doorway, two columns, drawn in sequence."""
    p = lambda a, b: inv(t0 + a, t0 + b, t); col = GOLD; L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    vx, vy = W / 2, 1020
    for k, x in enumerate(np.linspace(-900, W + 900, 13)):     # floor rays
        q = p(.0 + k * .03, .5 + k * .03)
        if q > 0: d.line([(vx, vy), (vx + (x - vx) * q, vy + (H - vy) * q)], fill=120, width=2)
    for k, y in enumerate([1080, 1160, 1280, 1460, 1720]):
        q = p(.3 + k * .06, .7 + k * .06)
        if q > 0: hw = (y - vy) / (H - vy) * 1500; d.line([(vx - hw * q, y), (vx + hw * q, y)], fill=110, width=2)
    q = p(.35, 1.1)          # arch
    if q > 0:
        ax0, ax1, top, base = 250, 830, 300, 1020; r = (ax1 - ax0) / 2; pts = [(ax0, base), (ax0, top + r)] + [(W / 2 - r * math.cos(a), top + r - r * math.sin(a)) for a in np.linspace(0, math.pi, 40)] + [(ax1, top + r), (ax1, base)]
        n = max(2, int(len(pts) * q)); d.line(pts[:n], fill=230, width=3, joint='curve')
        pts2 = [(x + (W / 2 - x) * .09, y + (y - base) * -.0 + 40 * (y < base)) for x, y in pts]; d.line(pts2[:n], fill=120, width=2, joint='curve')
    for cxl in (120, 960):   # columns
        q = p(.6, 1.2)
        if q > 0: d.line([(cxl - 34, 1020), (cxl - 34, 1020 - 760 * q)], fill=200, width=3); d.line([(cxl + 34, 1020), (cxl + 34, 1020 - 760 * q)], fill=200, width=3)
        if q >= 1: d.line([(cxl - 54, 250), (cxl + 54, 250)], fill=200, width=3); d.line([(cxl - 54, 1020), (cxl + 54, 1020)], fill=200, width=3)
    glow = L.filter(ImageFilter.GaussianBlur(9)); im.paste(col, (0, 0), glow.point(lambda v: int(v * .6))); im.paste(col, (0, 0), L)
# ================================ SCENES ================================
def s_statement(t):
    im = bg(t); frame_rule(im, .05, t); caps_small(im, t, 'A  COMMON  BELIEF', .15, 330)
    rise(im, (W / 2, 640), "AI can't make", F('corm3i', 116), IVORY, OS(0), t, dur=.5)
    if t >= OS(3): p = eo(cl((t - OS(3)) / .5)); gold_text(im, (W / 2, 830), 'premium', F('play6i', 236), t, p, OS(3) + .25, dy=(1 - p) * 30, blur=(1 - p) * 6)
    rise(im, (W / 2, 1010), 'edits.', F('corm3i', 116), IVORY, OS(4), t, dur=.5)
    return im
def s_usedto(t):
    im = K.graded(t, lerp(1.03, 1.06, inv(OS(5), OS(11), t)))
    caps(im, t, [('I', 5, False), ('used', 6, False), ('to', 7, False), ('say', 8, False)], [('that', 9, False), ('too.', 10, True)])
    return im
def s_made(t):
    im = K.graded(t, lerp(1.06, 1.1, eio(inv(OS(11), OS(15), t)))); frame_rule(im, OS(13), t, 56, GOLD, 2)
    caps(im, t, [('Then', 11, False), ('I', 12, False), ('made', 13, False)], [('this.', 14, True)])
    return im
def s_behind(t):
    def under(G):
        if t < OS(19) - .1: caps_small(G, t, 'THE  WORDS  GO', OS(15) + .05, 330, IVORY)
        else: caps_small(G, t, 'BEHIND  MY  HEAD.', OS(19) - .1, 330, IVORY)
        if t >= OS(18) - .05: p = eo(cl((t - OS(18) + .05) / .55)); gold_text(G, (W / 2 + 20, 700), 'behind', F('play8i', 250), t, p, OS(18) + .4, dy=(1 - p) * 40, blur=(1 - p) * 8)
        return G
    im = person_over(t, under, lerp(1.0, 1.03, inv(OS(15), OS(21), t)))
    caps(im, t, None, [('my', 19, False), ('head.', 20, True)], y=1000 - 112) if False else None
    return im
def s_room(t):
    def under(G):
        a = np.asarray(G).astype(np.float32); bgp = np.asarray(bg(t, .5, .45, .6)).astype(np.float32); q = eio(cl((t - OS(21) + .05) / .55))
        G2 = Image.fromarray(np.clip(a * (1 - q) + bgp * q, 0, 255).astype(np.uint8)); room_lines(G2, t, OS(21) + .2); return G2
    im = person_over(t, under, lerp(1.0, 1.04, inv(OS(21), OS(25), t)))
    caps(im, t, [('This', 21, False), ('room', 22, False)], [("doesn't", 23, False), ('exist.', 24, True)], y=330)
    return im
@lru_cache(None)
def film_frame(k):
    c = Image.fromarray(K.raw(2.6 + k * .9)).crop((0, 300, 1080, 1650)).resize((240, 300), Image.LANCZOS); return c
def s_frames(t):
    im = bg(t, .5, .5); caps_small(im, t, 'UNTOUCHED', OS(25), 330)
    rise(im, (W / 2, 450), "I didn't touch", F('corm3i', 100), IVORY, OS(26), t)
    if t >= OS(29): p = eo(cl((t - OS(29)) / .5)); gold_text(im, (W / 2, 590), 'a single frame.', F('play6i', 104), t, p, OS(30) + .2, dy=(1 - p) * 26)
    off = (t - OS(25)) * 70; d = ImageDraw.Draw(im); y0, y1 = 780, 1160
    q = eo(cl((t - OS(25) - .1) / .6))
    if q > 0:
        d.rectangle((0, y0, W, y1), fill=(16, 15, 14)); [d.line([(0, y), (W, y)], fill=GOLD_LO, width=2) for y in (y0, y1)]
        for j in range(-1, 6):
            x = int(j * 270 - off % 270 + 20)
            for yy_ in (y0 + 14, y1 - 30): [d.rounded_rectangle((x + s, yy_, x + s + 22, yy_ + 16), 4, fill=(40, 38, 34)) for s in range(10, 250, 44)]
            im.paste(film_frame((j + int(off // 270)) % 8), (x + 5, y0 + 40))
        g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).rectangle((0, y0, W, y1), fill=int(255 * (1 - q))); im.paste((10, 10, 11), (0, 0), g)
    if t >= OS(31): p = eo(cl((t - OS(31)) / .45)); put_text(im, (W / 2, 1230), '0 frames edited by hand', F('ilight', 30), GOLD, track=6, alpha=p)
    return im
def s_problem(t):
    im = K.graded(t, lerp(1.04, 1.07, inv(OS(32), OS(36), t)))
    caps(im, t, [('AI', 32, False), ("isn't", 33, False)], [('the', 34, False), ('problem.', 35, True)]); return im
@lru_cache(None)
def same_tile():
    c = Image.fromarray(K.raw(12.5)).copy(); K.cheap_caps(c, ['SAME', 'EDIT'], 0, 1150, 110); c = c.resize((200, 356), Image.LANCZOS)
    a = np.asarray(c).astype(np.float32); l = a.mean(2, keepdims=True); a = l + (a - l) * .25; c = Image.fromarray(np.clip(a * .85, 0, 255).astype(np.uint8))
    t_ = Image.new('RGBA', (200, 356)); t_.paste(c); t_.putalpha(rounded_mask(200, 356, 18)); return t_
def s_same(t):
    im = bg(t, .5, .55, .5)
    if t < OS(42) - .1:
        caps_small(im, t, 'THE  PROBLEM', OS(36), 300); rise(im, (W / 2, 410), 'everyone uses it', F('corm3i', 92), IVORY, OS(36), t)
        if t >= OS(39): p = eo(cl((t - OS(39)) / .5)); gold_text(im, (W / 2, 535), 'the same way.', F('play6i', 100), t, p, OS(40), dy=(1 - p) * 26)
    else:
        rise(im, (W / 2, 410), 'so every video', F('corm3i', 92), IVORY, OS(42), t)
        if t >= OS(45): p = eo(cl((t - OS(45)) / .5)); gold_text(im, (W / 2, 535), 'looks the same.', F('play6i', 100), t, p, OS(46), dy=(1 - p) * 26)
    n = int(cl((t - OS(36) - .2) / (OS(42) - OS(36) - .4)) * 16 + .999) if t > OS(36) + .2 else 0; dim = 1 - .45 * eo(cl((t - OS(42)) / .5))
    for k in range(n):
        cx, cy = 225 + (k % 4) * 210, 760 + (k // 4) * 120 + (k % 4) * 0; cy = 720 + (k // 4) * 160
        tl = scaled(same_tile(), .62 if True else 1, dim); x = 120 + (k % 4) * 230 + 40; y = 680 + (k // 4) * 230
        place(im, tl, x + 30, y + 100, .5, 14, (0, 10))
    return im
def s_built(t):
    im = K.graded(t, lerp(1.05, 1.08, inv(OS(48), OS(54), t)))
    caps(im, t, [('I', 48, False), ('built', 49, False)], [('my', 50, False), ('own', 51, False), ('way.', 52, True)]); return im
def monogram(im, t, t0, cx=W / 2, cy=640, r=150):
    q = eo(cl((t - t0) / .9))
    if q <= 0: return
    L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L); d.arc((cx - r, cy - r, cx + r, cy + r), -90, -90 + 360 * q, fill=230, width=3); d.arc((cx - r + 14, cy - r + 14, cx + r - 14, cy + r - 14), -90, -90 + 360 * q, fill=110, width=2)
    im.paste(GOLD, (0, 0), L.filter(ImageFilter.GaussianBlur(5)).point(lambda v: int(v * .5))); im.paste(GOLD, (0, 0), L)
    p = eo(cl((t - t0 - .35) / .6))
    if p > 0: gold_text(im, (cx, cy + 4), 'VE', F('play6i', int(r * 1.05)), t, p, t0 + .8, blur=(1 - p) * 6)
def s_name(t):
    im = bg(t, .5, .4, 1.3); frame_rule(im, OS(54) - .2, t)
    rise(im, (W / 2, 330), 'and I call it', F('corm3i', 80), IVORY, OS(54), t)
    monogram(im, t, OS(54) + .1, W / 2, 620, 150)
    if t >= OS(57) - .05: p = eo(cl((t - OS(57) + .05) / .55)); gold_text(im, (W / 2, 930), 'Vibe Editing', F('play6i', 150), t, p, OS(58) + .1, dy=(1 - p) * 30, blur=(1 - p) * 8)
    caps_small(im, t, 'THE  METHOD', OS(58) + .2, 1060)
    return im
def gbutton(im, cx, cy, p, t, label='Learn the workflow  →'):
    if p <= 0: return
    w, h = 660, 112; q = eo(cl(p)); L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L); d.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), h // 2, outline=255, width=3)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((cx - w / 2 - 5, 0, cx - w / 2 - 5 + (w + 10) * q, H), fill=255); L = Image.fromarray(np.minimum(np.asarray(L), np.asarray(m)))
    f = cl((p - .5) * 2)
    if f > 0: fl = Image.new('L', (W, H), 0); ImageDraw.Draw(fl).rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), h // 2, fill=int(255 * f * .92)); im.paste(GOLD, (0, 0), fl)
    im.paste(GOLD_HI, (0, 0), L); put_text(im, (cx, cy), label, F('isemi', 42), mixc(GOLD_HI, ONYX, f), alpha=cl(p * 1.6))
def s_learn(t):
    im = K.graded(t, lerp(1.07, 1.1, inv(OS(59), SP, t)))
    if t < OS(66) - .05: caps(im, t, [('if', 60, False), ('you', 61, False), ('want', 62, False)], [('to', 63, False), ('learn', 64, False), ('it,', 65, True)])
    else: caps(im, t, [('the', 66, False), ('link', 67, False), ('is', 68, False), ('below', 69, False)], None, y=330); gbutton(im, W / 2, 490, cl((t - OS(69)) / .7), t)
    return im
def s_end(t):
    e0 = SP; im = bg(t, .5, .4, 1.2); frame_rule(im, e0, t); monogram(im, t, e0 + .05, W / 2, 470, 110)
    if t >= e0 + .3: p = eo(cl((t - e0 - .3) / .55)); gold_text(im, (W / 2, 720), 'Vibe Editing', F('play6i', 140), t, p, e0 + .8, dy=(1 - p) * 26, blur=(1 - p) * 6)
    rise(im, (W / 2, 850), 'premium edits, made with AI.', F('corm3i', 64), IVORY, e0 + .5, t)
    gbutton(im, W / 2, 1000, cl((t - e0 - .7) / .8), t); rise(im, (W / 2, 1110), '[your-url.com]', F('jb4', 30), MUTE, e0 + .9, t)
    return im
SCENES = [
 (0.0, s_statement, None),
 (OS(5) - .12, s_usedto, 'blur', .4),
 (OS(11) - .04, s_made, None),
 (OS(15) - .06, s_behind, 'fade', .25),
 (OS(21) - .04, s_room, None),
 (OS(25) - .12, s_frames, 'blur', .38),
 (OS(32) - .12, s_problem, 'blur', .35),
 (OS(36) - .12, s_same, 'blur', .35),
 (OS(48) - .12, s_built, 'blur', .35),
 (OS(54) - .12, s_name, 'fade', .35),
 (OS(59) - .1, s_learn, 'blur', .35),
 (SP, s_end, 'fade', .45),
]
MUSIC = 'music_a'; LIFT = OS(11); MUSIC_LVL = .18; MUSIC_OFS = 0.0
def CUES():
    return [('shimmer', OS(3) + .2, .14), ('thud', OS(3), .18), ('whoosh_a', OS(5) - .3, .14), ('riser', OS(11) - 1.0, .12), ('impact', OS(14), .2), ('shimmer', OS(13) + .2, .1),
            ('shimmer', OS(18) + .3, .14), ('thud', OS(18), .16), ('neon', OS(21) + .2, .08), ('shimmer', OS(22), .1), ('whoosh_a', OS(25) - .3, .14), ('camera', OS(29), .1),
            ('whoosh_a', OS(32) - .3, .12), ('whoosh_a', OS(36) - .3, .12)] + [('pop', OS(36) + .2 + k * .3, .05) for k in range(12)] + \
           [('thud', OS(42), .14), ('whoosh_a', OS(48) - .3, .12), ('riser', OS(54) - .6, .1), ('shimmer', OS(57), .18), ('impact', OS(57) + .02, .14), ('whoosh_a', OS(59) - .3, .12),
            ('shimmer', OS(69), .14), ('whoosh_a', SP - .2, .14), ('shimmer', SP + .5, .14)]
if __name__ == '__main__':
    K.run(K.make_frame(SCENES))

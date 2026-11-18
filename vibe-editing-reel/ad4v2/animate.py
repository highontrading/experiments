"""Ad 4 v3 animator: renders every frame of the approved board as motion (PIL/numpy, multiprocess).
usage: python3 animate.py ADS_SCRATCH OUT_FRAMES_DIR [--frames a,b,c] [--workers 4]"""
import sys, os, json, math, numpy as np, cv2
from functools import lru_cache
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFilter, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); sys.path.insert(0, HERE)
from grade import grade
import mg
from mg import W, H, RED, BLACK, WHITE, CREAM, GREY, F, text, paste_shadow, torn_strip, rrect_img, tilt, phone, cheap_caps, chip, ellipse_pts, halftone_cutout
SC = sys.argv[1]; OUT = sys.argv[2]; FPS = 30
E = json.load(open(f'{ROOT}/ad4/edl.json')); WD = E['words']; N = E['nframes']; SPEECH = E['speech']
OS = lambda i: WD[i]['os'] - .03; OE = lambda i: WD[i]['oe']
# ---------------- easing ----------------
cl = lambda v, a=0., b=1.: max(a, min(b, v)); inv = lambda a, b, v: cl((v - a) / (b - a)) if b != a else float(v >= a)
eo = lambda t: 1 - (1 - t) ** 3; eo5 = lambda t: 1 - (1 - t) ** 5; eio = lambda t: 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
def spring(t): return 1. if t >= 1 else 1 - math.exp(-7 * t) * math.cos(9 * t)
def backo(t, c=1.5): return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
lerp = lambda a, b, t: a + (b - a) * t
# ---------------- sources ----------------
src = lambda t: E['frames'][min(N - 1, max(0, int(round(t * FPS))))]
def raw(t): return np.asarray(Image.open(f"{SC}/bake/ad4/raw/{src(t):05d}.jpg").convert('RGB'))
def graded(t, z=1.0, cy=0.):
    im = Image.fromarray(grade(raw(t), seed=int(t * 30)))
    if z != 1: w, h = int(W * z), int(H * z); im = im.resize((w, h), Image.LANCZOS); x0 = (w - W) // 2; y0 = int((h - H) * (.42 + cy)); im = im.crop((x0, y0, x0 + W, y0 + H))
    return im
# ---------------- fast chalk (shared texture, partial draw) ----------------
@lru_cache(None)
def chalk_tex(): return Image.fromarray(((np.random.default_rng(77).random((H, W)) > .28) * 255).astype(np.uint8))
def chalk(im, pts, p=1., width=7, color=WHITE, seed=1, passes=3, alpha=230):
    n = max(2, int(len(pts) * cl(p)));
    if p <= 0: return
    pts = np.array(pts[:n], np.float32); L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L); r = np.random.default_rng(seed)
    for k in range(passes):
        j = pts + r.normal(0, 1.6, pts.shape); d.line([tuple(q) for q in j], fill=int(alpha * (1 - k * .18)), width=max(2, width - k * 2), joint='curve')
    L = ImageChops.multiply(L, chalk_tex()).filter(ImageFilter.GaussianBlur(.7)); im.paste(color, (0, 0), L)
def arrow_pts(p0, p1, bend):
    (x0, y0), (x1, y1) = p0, p1; mx, my = (x0 + x1) / 2 - (y1 - y0) * bend, (y0 + y1) / 2 + (x1 - x0) * bend
    return [((1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1) for t in np.linspace(0, 1, 40)]
def arrow(im, p0, p1, bend, p, color=WHITE, width=7, seed=2, head=34):
    pts = arrow_pts(p0, p1, bend); chalk(im, pts, eo(cl(p / .8)), width, color, seed)
    if p > .8:
        x1, y1 = p1; a = math.atan2(y1 - pts[-4][1], x1 - pts[-4][0]); q = inv(.8, 1, p)
        for s in (-.55, .55): chalk(im, [(x1, y1), (x1 - head * q * math.cos(a + s), y1 - head * q * math.sin(a + s))], 1, width, color, seed + 7)
# ---------------- animated text ----------------
def layer_text(s, f, fill, track=0):
    w = int(f.getlength(s) + track * max(0, len(s) - 1)) + 40; h = int(f.size * 1.5); L = Image.new('L', (w, h), 0); d = ImageDraw.Draw(L); x = 20
    for ch in s: d.text((x, h * .5), ch, font=f, fill=255, anchor='lm'); x += f.getlength(ch) + track
    return L, w, h
def stamp(im, xy, s, f, fill, t0, t, track=0, from_scale=1.35, dur=.28, shadow=0., reveal=None):
    """text that lands: scale down + fade in (eased), optional left-to-right write-on reveal."""
    if t < t0: return
    p = eo5(cl((t - t0) / dur)); L, w, h = layer_text(s, f, fill, track)
    if reveal is not None:
        q = eo(cl((t - t0) / reveal)); m = np.zeros((h, w), np.uint8); m[:, :int(w * q)] = 255; L = ImageChops.multiply(L, Image.fromarray(m)); p = 1
    sc = lerp(from_scale, 1, p); L2 = L.resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.BICUBIC) if sc != 1 else L
    L2 = L2.point(lambda v: int(v * cl(p * 1.4)))
    x, y = int(xy[0] - L2.size[0] / 2), int(xy[1] - L2.size[1] / 2)
    if shadow: sh = L2.filter(ImageFilter.GaussianBlur(f.size * .1)).point(lambda v: int(v * shadow)); im.paste((0, 0, 0), (x, y + int(f.size * .05)), sh)
    im.paste(fill, (x, y), L2)
def write_on(im, xy, s, f, fill, t0, t, dur=None, anchor='m', shadow=0.):
    if t < t0: return
    L, w, h = layer_text(s, f, fill); dur = dur or max(.25, len(s) * .03); q = eo(cl((t - t0) / dur)); m = np.zeros((h, w), np.uint8); m[:, :int(w * q)] = 255
    L = ImageChops.multiply(L, Image.fromarray(m)); x = int(xy[0] - (w / 2 if anchor == 'm' else 20)); y = int(xy[1] - h / 2)
    if shadow: im.paste((0, 0, 0), (x, y + 4), L.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * shadow)))
    im.paste(fill, (x, y), L)
def cap_words(im, t, small, big, y=430, exit_at=1e9):
    """A-roll caption: lead-in + payoff line, each word rises + fades in on its own word time; one word may be red."""
    q = 1 - eo(cl((t - exit_at) / .15))
    for line, f, yy, tr in [(small, F('semi', 58), y, -1), (big, F('disp', 104), y + 118, -3)]:
        if not line: continue
        ws = [f.getlength(s) + tr * len(s) for s, _, _ in line]; gap = 18 if f.size < 80 else 26; x = W / 2 - (sum(ws) + gap * (len(ws) - 1)) / 2
        for (s, wi, red), w in zip(line, ws):
            if t >= OS(wi) - .02:
                p = eo(cl((t - OS(wi) + .02) / .2)) * q
                if p > 0:
                    L, lw, lh = layer_text(s, f, None, tr); L = L.point(lambda v: int(v * p)); px, py = int(x - 20), int(yy + (1 - p) * 22 - lh / 2)
                    im.paste((0, 0, 0), (px, py + 5), L.filter(ImageFilter.GaussianBlur(f.size * .12)).point(lambda v: int(v * (.35 if red else .85))))
                    im.paste(RED if red else WHITE, (px, py), L)
            x += w + gap
def place(im, layer, cx, cy, shadow=.5, blur=40, off=(0, 40)):
    paste_shadow(im, layer, (int(cx - layer.size[0] / 2), int(cy - layer.size[1] / 2)), blur, shadow, off)
def button(im, cx, cy, p, fill=RED, ink=WHITE, label='Learn the workflow  →'):
    if p <= 0: return
    b = rrect_img(640, 108, 54, fill, top=tuple(min(255, c + 30) for c in fill)); ImageDraw.Draw(b).text((320, 70), label, font=F('disp', 44), fill=ink, anchor='ms')
    s = lerp(.6, 1, spring(p)); b = b.resize((int(640 * s), int(108 * s)), Image.BICUBIC); a = b.split()[3].point(lambda v: int(v * cl(p * 1.6))); b.putalpha(a); place(im, b, cx, cy, .45, 30, (0, 18))
# ---------------- static plates (cached per worker) ----------------
@lru_cache(None)
def plate(name):
    if name == 'red': return mg.vignette(mg.red_paper(11), .5)
    if name.startswith('dark'): k = int(name[4:]); return mg.dark_set(4 + k, glow=(170, 26, 22) if k == 3 else (190, 30, 24), gy=.5 if k == 3 else .42)
    if name == 'cream13': return mg.paper(CREAM, 13)
    if name == 'cream21': return mg.paper(CREAM, 21)
    if name.startswith('light'): return mg.light_set(int(name[5:]))
@lru_cache(None)
def ghost(word): im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).text((W / 2, 760 if word != 'STOCK' else 800), word, font=F('anton', 380), fill=255, anchor='mm'); return im
@lru_cache(None)
def strip(w, h, color, seed): return torn_strip(w, h, color, seed)
@lru_cache(None)
def music_card():
    card = rrect_img(560, 760, 46, (26, 25, 26), top=(48, 46, 48), outline=(70, 66, 64)); d = ImageDraw.Draw(card)
    art = rrect_img(480, 420, 30, (150, 18, 16), top=(236, 64, 50)); ImageDraw.Draw(art).text((240, 250), '♪', font=F('gen', 200), fill=(255, 255, 255, 220), anchor='mm'); card.paste(art, (40, 40), art)
    d.text((40, 520), 'stock_beat_04.mp3', font=F('disp', 40), fill=WHITE, anchor='ls'); d.text((40, 566), 'royalty-free library', font=F('med', 28), fill=GREY, anchor='ls'); return card
def music_card_at(prog):
    c = music_card().copy(); d = ImageDraw.Draw(c)
    for i in range(44): hg = 10 + 34 * abs(np.sin(i * .6)); d.rounded_rectangle((40 + i * 11, 630 - hg / 2, 46 + i * 11, 630 + hg / 2), 3, fill=WHITE if i / 44 < prog else (90, 86, 84))
    d.ellipse((240, 676, 320, 756), fill=WHITE); d.rectangle((268, 698, 278, 734), fill=BLACK); d.rectangle((284, 698, 294, 734), fill=BLACK); return c
@lru_cache(None)
def reel_thumb(k):
    c = Image.fromarray(raw(OS(36 + k % 4))).copy(); cheap_caps(c, ['SAME', 'EDIT'], k % 2, 1150, 90); c = c.resize((270, 480)); card = Image.new('RGBA', (290, 500), (20, 20, 22, 255)); card.paste(c, (10, 10))
    m = Image.new('L', card.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 289, 499), 28, fill=255); card.putalpha(m); return card
@lru_cache(None)
def ai_tile(lab):
    tile = rrect_img(380, 460, 50, (255, 255, 255), top=(255, 255, 255), outline=(225, 220, 214)); d = ImageDraw.Draw(tile)
    d.rounded_rectangle((110, 90, 270, 250), 40, fill=RED); d.text((190, 182), 'AI', font=F('black', 84), fill=WHITE, anchor='mm'); d.text((190, 360), lab, font=F('hand', 64), fill=BLACK, anchor='mm'); return tile
RULES = [('captions', 'designed per phrase'), ('camera', 'eased, motivated'), ('grade', 'real room, cinematic'), ('graphics', 'explain, not decorate'), ('never', 'templates')]
def skill_doc(n_on):
    doc = rrect_img(760, 700, 44, (255, 255, 255), top=(255, 255, 255), outline=(226, 220, 214)); d = ImageDraw.Draw(doc); d.text((50, 80), 'vibe-editing.skill', font=F('monob', 34), fill=RED, anchor='ls')
    for k, (a_, b_) in enumerate(RULES):
        y = 160 + k * 104; on = cl(n_on - k); d.rounded_rectangle((40, y - 50, 720, y + 40), 22, fill=(246, 243, 240))
        if on > 0:
            r = 22 * backo(on); d.ellipse((82 - r, y - r, 82 + r, y + r), fill=RED)
            if on > .5: d.line([(72, y), (80, y + 9), (94, y - 9)], fill=WHITE, width=5)
        else: d.ellipse((60, y - 22, 104, y + 22), outline=(210, 204, 198), width=3)
        d.text((124, y + 12), a_, font=F('disp', 34), fill=BLACK if on > 0 else (170, 164, 158), anchor='ls'); d.text((330, y + 12), b_, font=F('med', 30), fill=GREY if on > 0 else (205, 200, 195), anchor='ls')
    return doc
def timeline(ph, fill):
    tl = rrect_img(900, 250, 36, (24, 23, 24), top=(44, 42, 44)); d = ImageDraw.Draw(tl); d.text((36, 52), 'ad4_final.mp4', font=F('mono', 26), fill=GREY, anchor='ls'); d.text((864, 52), '00:28', font=F('mono', 26), fill=RED, anchor='rs')
    for r_, (x0, x1, c_) in enumerate([(36, 520, RED), (560, 864, (230, 225, 220)), (36, 300, (90, 86, 84)), (340, 864, (230, 225, 220)), (36, 864, (70, 66, 64))]):
        p = cl(fill * 5 - r_);
        if p <= 0: continue
        y = 82 + (r_ % 3) * 52; d.rounded_rectangle((x0, y, x0 + max(20, (x1 - x0) * eo(p)), y + 34), 10, fill=c_)
    x = 36 + 828 * ph; d.line([(x, 70), (x, 236)], fill=WHITE, width=4); d.polygon([(x - 12, 64), (x + 12, 64), (x, 80)], fill=WHITE); return tl
# ---------------- hook cut-out (live) ----------------
HOOK_ALPHA = f'{SC}/v3alpha'
@lru_cache(None)
def hook_offset():
    s0 = src(0.0); a = np.asarray(Image.open(f'{HOOK_ALPHA}/{s0:05d}.png')); rows = np.nonzero(a[:, 300:780].max(1) > 128)[0]; return int(rows.min())
def hook_cut(t):
    s = src(t); a = np.asarray(Image.open(f'{HOOK_ALPHA}/{s:05d}.png')); rgb = raw(t)
    return halftone_cutout(rgb, a, 1.6, 26, 3 + (int(t * 12) % 3), dot=10)
@lru_cache(None)
def end_cut():
    s = int(round(31.8 * 60)); p = f'{SC}/v3m'; fg = np.asarray(Image.open(f'{p}/fg_31.8.png')); rw = np.asarray(Image.open(f'{p}/raw_31.8.png').convert('RGB'))
    c = halftone_cutout(rw, fg[..., 3], 1.55, 18, 9); sc = 1.3; c = c.resize((int(c.size[0] * sc), int(c.size[1] * sc)), Image.LANCZOS)
    rows = np.nonzero(np.asarray(c.split()[3])[:, 250:700].max(1) > 128)[0]; return c, int(rows.min())
# ================================ SCENES ================================
def s_hook(t):
    im = plate('red').copy(); z = 1 + .03 * inv(0, OS(11), t)
    stamp(im, (W / 2, 350), 'I CAN TELL IN', F('anton', 92), WHITE, OS(0), t, 4, 1.15)
    stamp(im, (W / 2, 600), '3 SECONDS', F('anton', 250), BLACK, OS(4), t, -2, 1.4, .3)
    chalk(im, ellipse_pts(158, 600, 92, 135, seed=5), inv(OS(5), OS(5) + .45, t), 8, WHITE, 5)
    a = spring(cl(t / .6)); cut = hook_cut(t); y = int(710 - hook_offset() + (1 - a) * 700)
    paste_shadow(im, cut, ((W - cut.size[0]) // 2 + 10, y), 24, .5)
    if t >= OS(6) - .1:
        p = eo(cl((t - OS(6) + .1) / .35)); s_ = strip(820, 124, BLACK, 4); paste_shadow(im, s_, (int(lerp(-900, 130, p)), 1110), 12, .4)
        write_on(im, (W / 2, 1174), 'if AI edited your video', F('hand', 76), WHITE, OS(6) + .15, t, .7)
    arrow(im, (965, 820), (840, 960), -.3, inv(OS(8), OS(8) + .5, t), WHITE, 7, 9)
    im = mg.grain(im, 4, int(t * 30))
    if z != 1: w, h = int(W * z), int(H * z); im = im.resize((w, h), Image.BICUBIC).crop(((w - W) // 2, (h - H) // 2, (w - W) // 2 + W, (h - H) // 2 + H))
    return im
def cheap_pair(t, first, last):
    cur = first
    for i in range(first, last + 1):
        if t >= OS(i): cur = i
    s0 = cur - (cur - first) % 2; ws = [i for i in (s0, s0 + 1) if i <= last]
    return [WD[i]['w'].upper().strip(',.?!') for i in ws], ws.index(cur)
def s_tells(t):
    tell2 = t >= OS(21) - .05; k = 2 if tell2 else 1
    im = plate('dark1').copy(); g = ghost('ZOOM' if tell2 else 'CAPS').point(lambda v: int(v * .22)); im.paste((150, 30, 26), (0, 0), g)
    c = Image.fromarray(raw(t)).copy()
    zz = 1.25 if tell2 and t >= OS(22) else 1.0
    if zz != 1: w, h = int(W * zz), int(H * zz); c = c.resize((w, h)); c = c.crop(((w - W) // 2, int((h - H) * .4), (w - W) // 2 + W, int((h - H) * .4) + H))
    words, hi = cheap_pair(t, 11, 25); cheap_caps(c, words, hi, 1150); pop = 1 + .06 * (1 - eo(cl((t - max(OS(i) for i in range(11, 26) if OS(i) <= t)) / .12))) if t >= OS(11) else 1
    a = spring(cl((t - OS(11) + .1) / .7)); ph = tilt(phone(c, 1000), rx=6, ry=lerp(-55, -16, a), rz=-3)
    place(im, ph, 620 + (1 - a) * 300, 1060 + (1 - a) * 200, .6, 50, (-30, 50))
    t0 = OS(11) if not tell2 else OS(21)
    stamp(im, (190, 330), f'0{k}', F('anton', 150), RED, t0, t, 0, 1.6, .25)
    write_on(im, (270, 335), 'zoom on every line' if tell2 else 'captions jumping', F('hand', 70), WHITE, t0 + .2, t, .6, anchor='l')
    if not tell2:
        chalk(im, ellipse_pts(625, 1185, 225, 66, seed=8), inv(OS(16), OS(16) + .5, t), 7, WHITE, 8); arrow(im, (330, 420), (420, 1120), .3, inv(OS(14), OS(14) + .5, t), WHITE, 6, 3)
    else:
        for j, a_ in enumerate(np.linspace(-2.6, -.5, 6)):
            chalk(im, [(620 + 300 * np.cos(a_), 1060 + 300 * np.sin(a_)), (620 + 400 * np.cos(a_), 1060 + 400 * np.sin(a_))], inv(OS(22) + j * .03, OS(22) + j * .03 + .15, t), 6, WHITE, j + 40)
    im = mg.grain(mg.vignette(im, .5), 4, int(t * 30))
    if tell2 and t >= OS(22):                        # camera snap-push on the zoom
        z = 1 + .08 * eo5(cl((t - OS(22)) / .25)); w, h = int(W * z), int(H * z); im = im.resize((w, h), Image.BICUBIC).crop(((w - W) // 2, (h - H) // 2, (w - W) // 2 + W, (h - H) // 2 + H))
    return im
def s_music(t):
    im = plate('dark3').copy(); im.paste((150, 30, 26), (0, 0), ghost('STOCK').point(lambda v: int(v * .22)))
    a = spring(cl((t - OS(26)) / .8)); prog = cl((t - OS(26)) / 3)
    for k, (dx, rz) in enumerate([(-170, -9), (170, 9), (0, 0)]):
        card = music_card_at(prog if k == 2 else .4); ly = tilt(card, rx=8, ry=-12 + k * 6, rz=rz * a)
        place(im, ly, W / 2 + dx * a, 960 - (k == 2) * 20 + (1 - cl(a * 1.3)) * 900, .5 + .1 * (k == 2), 46, (0, 46))
    stamp(im, (190, 330), '03', F('anton', 150), RED, OS(26), t, 0, 1.6, .25); write_on(im, (270, 335), 'same stock music', F('hand', 70), WHITE, OS(26) + .2, t, .6, anchor='l')
    if t >= OS(29):
        p = spring(cl((t - OS(29)) / .5)); pill = chip('used in every other reel', 30, (240, 236, 230), BLACK, icon=RED); pl = tilt(pill, ry=-14, rz=-4)
        pl = pl.resize((max(1, int(pl.size[0] * lerp(.5, 1, p))), max(1, int(pl.size[1] * lerp(.5, 1, p))))); place(im, pl, 700, 1400, .5, 20, (0, 16))
    return mg.grain(mg.vignette(im, .5), 4, int(t * 30))
def s_wall(t):
    im = plate('cream13').copy()
    FL0 = max(OS(42), OS(44) - .12 - .42); fl = cl((t - FL0) / .42); fly = (fl ** 2.2) * 2400
    for k in range(9):
        a = spring(cl((t - OS(33) - .1 - k * .07) / .6));
        if a <= 0: continue
        card = reel_thumb(k).rotate((k % 3 - 1) * 4 + (k // 3 - 1) * 2, expand=True, resample=Image.BICUBIC)
        place(im, card, 230 + (k % 3) * 310, 720 + (k // 3) * 420 - (1 - a) * 260 - fly, .35, 16, (6, 12))
    if fly < 300:
        for k in range(9): chalk(im, ellipse_pts(230 + (k % 3) * 310, 820 + (k // 3) * 420 - fly, 120, 40, seed=20 + k), inv(OS(35) + k * .09, OS(35) + k * .09 + .35, t), 6, RED, 20 + k)
    stamp(im, (W / 2, 360 - fly), 'SOUND FAMILIAR?', F('anton', 132), BLACK, OS(33), t, 1, 1.3)
    if t >= OS(36) - .1:
        p = eo(cl((t - OS(36) + .1) / .35)); paste_shadow(im, strip(900, 150, RED, 12), (int(lerp(1100, 90, p)), int(1520 - fly)), 14, .4)
        write_on(im, (W / 2, 1597 - fly), 'people can tell. they scroll.', F('hand', 78), WHITE, OS(36) + .2, t, .9)
    return mg.grain(im, 3, int(t * 30))
def s_switch(t):
    T0 = OS(44) - .12; base = graded(t, lerp(1.02, 1.05, inv(T0, OS(47), t)))
    cap_words(base, t, [('now', 44, False), ('watch', 45, False)], [('this.', 46, True)])
    p = eio(cl((t - T0 - .12) / .5))
    if p < 1:
        im = base.copy(); top = strip(1080, 1000, (206, 34, 28), 30); bot = strip(1080, 1000, (206, 34, 28), 31)
        paste_shadow(im, top, (0, int(-40 - p * 1100)), 20, .55, (0, 0)); paste_shadow(im, bot, (0, int(960 + p * 1100)), 20, .55, (0, 0)); return im
    return base
def s_aroll(z0, z1, t0, t1, small, big, cy=0.):
    def f(t):
        im = graded(t, lerp(z0, z1, eio(inv(t0, t1, t))), cy); cap_words(im, t, small, big); return im
    return f
def s_sign(t):
    p = eo5(cl((t - OS(53) + .05) / .35)); im = graded(t, lerp(1.06, 1.14, p) + .02 * inv(OS(53), OS(58), t), -.06 * p)
    cap_words(im, t, [('try', 53, False), ('to', 54, False), ('find', 55, False)], [('one', 56, True), ('sign.', 57, False)])
    for k, (cx, cy, rx, ry, sd) in enumerate([(380, 860, 90, 110, 31), (720, 1090, 110, 80, 32), (560, 1500, 150, 90, 33)]): chalk(im, ellipse_pts(cx, cy, rx, ry, seed=sd), inv(OS(54) + k * .3, OS(54) + k * .3 + .4, t), 6, WHITE, sd)
    if t >= OS(57):
        L, w, h = layer_text('0 signs', F('hand', 80), None); q = eo5(cl((t - OS(57)) / .25)); L = L.rotate(6, expand=True, resample=Image.BICUBIC); L = L.resize((int(L.size[0] * lerp(1.5, 1, q)), int(L.size[1] * lerp(1.5, 1, q)))).point(lambda v: int(v * q))
        im.paste(RED, (870 - L.size[0] // 2, 1480 - L.size[1] // 2), L)
    return im
def s_same(t):
    im = plate('light15').copy(); stamp(im, (W / 2, 420), 'SAME AI.', F('anton', 210), BLACK, OS(58), t, 2, 1.3)
    for k, lab in enumerate(['everyone', 'me']):
        a = spring(cl((t - OS(58) - .1 - k * .15) / .7));
        if a <= 0: continue
        ly = tilt(ai_tile(lab), rx=10, ry=(-1) ** (k + 1) * lerp(70, 18, a)); place(im, ly, 290 + k * 500 + (1 - a) * (-1) ** (k + 1) * 400, 950, .25, 50, (0, 40))
    chalk(im, [(492, 915), (588, 912)], inv(OS(60), OS(60) + .2, t), 14, RED, 41, 4, 255); chalk(im, [(492, 985), (588, 982)], inv(OS(60) + .15, OS(60) + .35, t), 14, RED, 42, 4, 255)
    stamp(im, (W / 2, 1360), 'same tool as everyone', F('semi', 44), GREY, OS(61), t, 0, 1.05)
    return im
def s_skill(t):
    im = plate('light16').copy(); stamp(im, (W / 2, 330), 'the difference is', F('semi', 62), BLACK, OS(62), t, 0, 1.1); stamp(im, (W / 2, 450), 'what I taught it.', F('disp', 104), BLACK, OS(65), t, -3, 1.2)
    a = spring(cl((t - OS(62) - .1) / .8)); n_on = cl((t - OS(64)) / .32, 0, 5)
    ly = tilt(skill_doc(n_on), rx=lerp(50, 14, a), ry=-10, rz=-2); place(im, ly, W / 2, 930 + (1 - cl(a * 1.2)) * 400, .3, 50, (0, 40))
    b = spring(cl((t - OS(65)) / .7))
    if b > 0: tl = tilt(timeline(cl((t - OS(65)) / 2.2) % 1, cl((t - OS(65)) / .8)), rx=18, rz=1); place(im, tl, W / 2, 1420 + (1 - cl(b * 1.2)) * 500, .4, 40, (0, 36))
    return im
def s_cta(t):
    im = graded(t, lerp(1.07, 1.1, inv(OS(75), SPEECH, t))); cap_words(im, t, [('the', 75, False), ('link', 76, False), ('is', 77, False), ('below', 78, False)], None)
    button(im, W / 2, 590, cl((t - OS(78)) / .55)); arrow(im, (W / 2 + 260, 660), (W / 2 + 200, 820), .3, inv(OS(78) + .3, OS(78) + .8, t), WHITE, 6, 51); return im
def s_end(t):
    e0 = SPEECH; im = plate('cream21').copy()
    stamp(im, (W / 2, 420), 'VIBE', F('anton', 280), RED, e0 + .05, t, 6, 1.35); stamp(im, (W / 2, 630), 'EDITING', F('anton', 190), BLACK, e0 + .18, t, 4, 1.35)
    if t >= e0 + .3:
        p = eo(cl((t - e0 - .3) / .35)); paste_shadow(im, strip(900, 120, RED, 22), (int(lerp(-950, 90, p)), 730), 14, .45); write_on(im, (W / 2, 792), 'make videos nobody can tell are AI', F('hand', 62), WHITE, e0 + .45, t, .8)
    button(im, W / 2, 930, cl((t - e0 - .7) / .55), fill=BLACK); stamp(im, (W / 2, 1030), '[your-url.com]', F('mono', 32), (120, 116, 110), e0 + .9, t, 0, 1.05)
    c, top = end_cut(); a = spring(cl((t - e0 - .1) / .7)); drift = 1 + .015 * inv(e0, e0 + 2.2, t); c2 = c.resize((int(c.size[0] * drift), int(c.size[1] * drift)), Image.BICUBIC) if drift != 1 else c
    paste_shadow(im, c2, ((W - c2.size[0]) // 2, int(860 - top + (1 - a) * 700)), 24, .45)
    return mg.grain(im, 3, int(t * 30))
# ---------------- timeline ----------------
SCENES = [
 (0.0, s_hook, None),
 (OS(11) - .12, s_tells, 'up'),
 (OS(26) - .12, s_music, 'left'),
 (OS(33) - .12, s_wall, 'up'),
 (OS(44) - .12, s_switch, None),
 (OS(47) - .03, s_aroll(1.05, 1.08, OS(47), OS(53), [('this', 47, False), ('is', 48, False), ('an', 49, False)], [('AI', 50, True), ('edit', 51, False), ('too.', 52, False)]), None),
 (OS(53) - .03, s_sign, None),
 (OS(58) - .12, s_same, 'left'),
 (OS(62) - .12, s_skill, 'up'),
 (OS(69) - .12, s_aroll(1.06, 1.09, OS(69), OS(75), [("that's", 69, False), ('what', 70, False)], [("I'll", 71, False), ('teach', 73, False), ('you.', 74, True)]), 'down'),
 (OS(75) - .03, s_cta, None),
 (SPEECH, s_end, 'up'),
]
TR = .36
def frame(i):
    t = i / FPS; k = max(j for j, s in enumerate(SCENES) if t >= s[0]); t0, fn, tr = SCENES[k]
    cur = fn(t)
    if tr and k > 0 and t < t0 + TR:
        p = eio(cl((t - t0) / TR)); prev = SCENES[k - 1][1](min(t, t0 - 1e-3)); out = Image.new('RGB', (W, H))
        dx, dy = {'up': (0, -1), 'down': (0, 1), 'left': (-1, 0)}[tr]
        ox, oy = int(dx * p * W), int(dy * p * H); out.paste(prev, (ox, oy)); out.paste(cur, (ox - dx * W, oy - dy * H))
        if .05 < p < .95:     # motion blur along the push
            k_ = int(28 * math.sin(p * math.pi)); a = np.asarray(out).astype(np.float32)
            kern = np.zeros((k_ * 2 + 1, 1) if dy else (1, k_ * 2 + 1), np.float32) + 1 / (k_ * 2 + 1); out = Image.fromarray(cv2.filter2D(a, -1, kern).clip(0, 255).astype(np.uint8))
        cur = out
    cur.save(f'{OUT}/f{i:05d}.jpg', quality=93); return i
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); args = sys.argv[3:]
    frames = [int(x) for x in args[args.index('--frames') + 1].split(',')] if '--frames' in args else list(range(N))
    nw = int(args[args.index('--workers') + 1]) if '--workers' in args else 4
    import time; t0 = time.time()
    with Pool(nw) as p:
        for j, i in enumerate(p.imap_unordered(frame, frames, chunksize=4)):
            if j % 60 == 0: print(j, '/', len(frames), round((time.time() - t0) / (j + 1), 2), 's/frame', flush=True)
    print('done', len(frames), round(time.time() - t0), 's')

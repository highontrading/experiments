"""Ad 4 v3 edit board: explanation beats become full-screen motion-graphic scenes (poster / 3D UI), A-roll is the
real graded room. usage: python3 board3.py ADS_SCRATCH OUT_PREFIX"""
import sys, os, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); sys.path.insert(0, HERE)
from grade import grade
from mg import *
SC, OUT = sys.argv[1:3]
e = json.load(open(f'{ROOT}/ad4/edl.json')); wd = e['words']; OS = lambda i: wd[i]['os']
src = lambda t: e['frames'][min(len(e['frames']) - 1, int(round(t * 30)))]
raw = lambda t: np.asarray(Image.open(f"{SC}/bake/ad4/raw/{src(t):05d}.jpg").convert('RGB'))
def graded(t, z=1.0, cy=0.):
    im = Image.fromarray(grade(raw(t)))
    if z != 1: w, h = int(W * z), int(H * z); im = im.resize((w, h), Image.LANCZOS); x0 = (w - W) // 2; y0 = int((h - H) * (.42 + cy)); im = im.crop((x0, y0, x0 + W, y0 + H))
    return im
def matte(t_src):
    fg = np.asarray(Image.open(f'{SC}/v3m/fg_{t_src}.png')); rw = np.asarray(Image.open(f'{SC}/v3m/raw_{t_src}.png').convert('RGB'))
    return rw, fg[..., 3]
def cap(im, small, big, red=None, y=430):
    if small: text(im, (W / 2, y), small, F('semi', 58), WHITE, track=-1, shadow=.85)
    if big:
        f = F('disp', 104); parts = big.split(' '); ws = [f.getlength(p) - 3 * len(p) for p in parts]; x = W / 2 - (sum(ws) + 26 * (len(ws) - 1)) / 2
        for p, w in zip(parts, ws): isr = red and p.strip('.,?') == red; text(im, (x, y + 118), p, f, RED if isr else WHITE, anchor='lm', track=-3, shadow=.35 if isr else .85); x += w + 26
def button(im, y, label='Learn the workflow  →', fill=RED, ink=WHITE):
    b = rrect_img(640, 108, 54, fill, top=tuple(min(255, c + 30) for c in fill)); d = ImageDraw.Draw(b); d.text((320, 70), label, font=F('disp', 44), fill=ink, anchor='ms'); place(im, b, W / 2, y, .45, 30, (0, 18))
P = []
# 01 HOOK: poster
im = red_paper(11); im = vignette(im, .5)
text(im, (W / 2, 350), 'I CAN TELL IN', F('anton', 92), WHITE, track=4)
text(im, (W / 2, 600), '3 SECONDS', F('anton', 250), BLACK, track=-2)
rw, a = matte(3.68); cut = halftone_cutout(rw, a, 1.6, 18, 3); sc = 1.5; cut = cut.resize((int(cut.size[0] * sc), int(cut.size[1] * sc)), Image.LANCZOS)
rows = np.nonzero(np.asarray(cut.split()[3])[:, 300:800].max(1) > 128)[0]; top = rows.min()
paste_shadow(im, cut, ((W - cut.size[0]) // 2 + 10, 600 - top), 24, .5)
chalk(im, ellipse_pts(158, 600, 92, 135, seed=5), 8, WHITE, 5)
arrow(im, (930, 880), (790, 1000), -.3, WHITE, 7, 9)
strip = torn_strip(820, 124, BLACK, 4); paste_shadow(im, strip, (130, 770), 12, .4)
text(im, (W / 2, 834), 'if AI edited your video', F('hand', 76), WHITE)
im = grain(im, 4)
P.append((0, 'MOTION GRAPHIC · POSTER HOOK', 'I can tell in 3 seconds if AI edited your video,',
  'Editorial poster (refs: "SOMETHING TO FIGHT", "MULTI MILLIONAIRE"): red paper, giant black condensed "3 SECONDS", you as a live B&W halftone cut-out with a white sticker edge in front, chalk circle on the "3", chalk arrow, torn black strip with a handwritten line. Elements stamp in on each word.', im))
# 02–04 the three tells: dark 3D set, tilted phone + annotations
def tell_scene(t, words, hi, num, word, note, z=1.0, extra=None):
    im = dark_set(4 + num); text(im, (W / 2, 760), word, F('anton', 380), (64, 20, 18), track=0)
    c = Image.fromarray(raw(t)).copy()
    if z != 1: w, h = int(W * z), int(H * z); c = c.resize((w, h)); c = c.crop(((w - W) // 2, int((h - H) * .4), (w - W) // 2 + W, int((h - H) * .4) + H))
    cheap_caps(c, words, hi, 1150); ph = tilt(phone(c, 1000), rx=6, ry=-16, rz=-3)
    place(im, ph, 620, 1060, .6, 50, (-30, 50))
    text(im, (110, 330), f'{num:02d}', F('anton', 150), RED, anchor='lm')
    text(im, (270, 335), note, F('hand', 70), WHITE, anchor='lm')
    if extra: extra(im)
    return grain(vignette(im, .5), 4)
def ann1(im): chalk(im, ellipse_pts(625, 1185, 225, 66, seed=8), 7, WHITE, 8); arrow(im, (330, 420), (420, 1120), .3, WHITE, 6, 3)
P.append((11, 'MOTION GRAPHIC · TELL 01', 'captions in the middle of the screen, jumping on every word,',
  'You leave the screen. A dark studio set with a soft red glow and a faint grid; a glossy 3D phone floats in at an angle playing "the usual AI edit" (your raw take + bouncing yellow captions). Red "01", a handwritten note and a chalk circle drawing itself around the caption. Ghost word "CAPTIONS" huge behind.',
  tell_scene(OS(17), ['JUMPING', 'ON'], 0, 1, 'CAPS', 'captions jumping', extra=ann1)))
def ann2(im):
    for a_ in np.linspace(-2.6, -.5, 6): chalk(im, [(620 + 300 * np.cos(a_), 1060 + 300 * np.sin(a_)), (620 + 400 * np.cos(a_), 1060 + 400 * np.sin(a_))], 6, WHITE, int(a_ * 10) + 40)
P.append((21, 'MOTION GRAPHIC · TELL 02', 'a zoom on every line,', 'Same set, the phone snaps into the cheap auto-zoom while the camera itself whips closer; chalk speed-lines burst around the phone; "02 · zoom on every line"; ghost word "ZOOM".',
  tell_scene(OS(22), ['ZOOM', 'ON'], 0, 2, 'ZOOM', 'zoom on every line', 1.25, ann2)))
im = dark_set(9, glow=(170, 26, 22), gy=.5)
text(im, (W / 2, 800), 'STOCK', F('anton', 380), (64, 20, 18))
for k, (dx, rz, sh) in enumerate([(-170, -9, .5), (170, 9, .5), (0, 0, .6)]):
    card = rrect_img(560, 760, 46, (26, 25, 26), top=(48, 46, 48), outline=(70, 66, 64)); d = ImageDraw.Draw(card)
    art = rrect_img(480, 420, 30, (150, 18, 16), top=(236, 64, 50)); da = ImageDraw.Draw(art); da.text((240, 250), '♪', font=F('gen', 200), fill=(255, 255, 255, 220), anchor='mm'); card.paste(art, (40, 40), art)
    d.text((40, 520), 'stock_beat_04.mp3', font=F('disp', 40), fill=WHITE, anchor='ls'); d.text((40, 566), 'royalty-free library', font=F('med', 28), fill=GREY, anchor='ls')
    for i in range(44): hgt = 10 + 34 * abs(np.sin(i * .6)); d.rounded_rectangle((40 + i * 11, 630 - hgt / 2, 46 + i * 11, 630 + hgt / 2), 3, fill=WHITE if i < 18 else (90, 86, 84))
    d.ellipse((240, 676, 320, 756), fill=WHITE); d.polygon([(268, 696), (268, 736), (300, 716)], fill=BLACK)
    place(im, tilt(card, rx=8, ry=-12 + k * 6, rz=rz), W / 2 + dx, 960 - (k == 2) * 20, sh, 46, (0, 46))
text(im, (110, 330), '03', F('anton', 150), RED, anchor='lm'); text(im, (270, 335), 'same stock music', F('hand', 70), WHITE, anchor='lm')
pill = chip('used in every other reel', 30, (240, 236, 230), BLACK, icon=RED); place(im, tilt(pill, ry=-14, rz=-4), 700, 1400, .5, 20, (0, 16))
P.append((26, 'MOTION GRAPHIC · TELL 03', 'the same stock music at the end,', 'Glossy 3D music-player cards (ref: the Spotify-style cards) fan out: the same "stock_beat_04.mp3" three times, a live waveform, a play button. Chip: "used in every other reel". "03" + handwritten note.', grain(vignette(im, .5), 4)))
# 05 wall of sameness
im = paper(CREAM, 13); text(im, (W / 2, 360), 'SOUND FAMILIAR?', F('anton', 132), BLACK, track=1)
for k in range(9):
    c = Image.fromarray(raw(OS(36 + k % 4))).copy(); cheap_caps(c, ['SAME', 'EDIT'], k % 2, 1150, 90); c = c.resize((270, 480)); card = Image.new('RGBA', (290, 500), (20, 20, 22, 255)); card.paste(c, (10, 10))
    m = Image.new('L', card.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 289, 499), 28, fill=255); card.putalpha(m)
    place(im, card.rotate((k % 3 - 1) * 4 + (k // 3 - 1) * 2, expand=True, resample=Image.BICUBIC), 230 + (k % 3) * 310, 720 + (k // 3) * 420, .35, 16, (6, 12))
for k in range(9): chalk(im, ellipse_pts(230 + (k % 3) * 310, 820 + (k // 3) * 420, 120, 40, seed=20 + k), 6, RED, 20 + k)
strip = torn_strip(900, 150, RED, 12); paste_shadow(im, strip, (90, 1520), 14, .4); text(im, (W / 2, 1597), 'people can tell. they scroll.', F('hand', 78), WHITE)
P.append((33, 'MOTION GRAPHIC · SAMENESS', 'Sound familiar? Then people can tell your video is AI too.', 'Paper poster: "SOUND FAMILIAR?" in black condensed; a 3×3 wall of identical reels (all with the same yellow captions) drops in; red marker circles scribble on each tell; on "AI too" the whole wall is flicked up like a scroll. Torn red strip: "people can tell."', grain(im, 3)))
# 06 the switch: red paper tears open on the graded A-roll
base = graded(OS(45), 1.04); cap(base, 'now watch', 'this.', 'this'); im = base.copy()
for side in (0, 1):
    s = torn_strip(1080, 900, (206, 34, 28), 30 + side, edges='b' if side == 0 else 't'); s = s.rotate(0)
    paste_shadow(im, s, (0, -560) if side == 0 else (0, 1580), 20, .55, (0, 0))
P.append((44, 'THE SWITCH', 'Now watch this,', 'The red paper tears open top and bottom to reveal you, full screen, in the real graded room. The music starts here (calm premium bed).', im))
im = graded(OS(50), 1.06); cap(im, 'this is an', 'AI edit too.', 'AI'); P.append((47, 'A-ROLL', 'This is an AI edit too.', 'You, real room, warm moody grade, slow push. Clean bold sans, "AI" in red.', im))
im = graded(OS(56), 1.14, -.06); cap(im, 'try to find', 'one sign.', 'one')
for (cx, cy, rx, ry, sd) in [(380, 860, 90, 110, 31), (720, 1090, 110, 80, 32), (560, 1500, 150, 90, 33)]: chalk(im, ellipse_pts(cx, cy, rx, ry, seed=sd), 6, WHITE, sd)
text(im, (870, 1480), '0 signs', F('hand', 80), RED, rot=6)
P.append((53, 'A-ROLL + DRAWN OVERLAY', 'Try to find one sign.', 'Punch-in on you. White chalk circles draw around the places AI usually gives itself away (hair edge, hands, skin), each comes up empty, then a red handwritten "0 signs".', im))
im = light_set(15); text(im, (W / 2, 420), 'SAME AI.', F('anton', 210), BLACK, track=2)
for k, lab in enumerate(['everyone', 'me']):
    tile = rrect_img(380, 460, 50, (255, 255, 255), top=(255, 255, 255), outline=(225, 220, 214)); d = ImageDraw.Draw(tile)
    d.rounded_rectangle((110, 90, 270, 250), 40, fill=RED); d.text((190, 182), 'AI', font=F('black', 84), fill=WHITE, anchor='mm'); d.text((190, 360), lab, font=F('hand', 64), fill=BLACK, anchor='mm')
    place(im, tilt(tile, rx=10, ry=(-1) ** (k + 1) * 18), 290 + k * 500, 950, .25, 50, (0, 40))
chalk(im, [(492, 915), (588, 912)], 14, RED, 41, passes=4, alpha=255); chalk(im, [(492, 985), (588, 982)], 14, RED, 42, passes=4, alpha=255)
text(im, (W / 2, 1360), 'same tool as everyone', F('semi', 44), GREY)
P.append((58, 'MOTION GRAPHIC · 3D', "It's the same AI.", 'Clean white set with soft red light (the reference video\'s white UI scenes, in your colours): two glossy 3D "AI" tiles, "everyone" and "me", tilt in from both sides; a red marker "=" draws between them. "SAME AI." in black condensed.', im))
im = light_set(16)
text(im, (W / 2, 330), 'the difference is', F('semi', 62), BLACK)
text(im, (W / 2, 450), 'what I taught it.', F('disp', 104), BLACK, track=-3)
doc = rrect_img(760, 700, 44, (255, 255, 255), top=(255, 255, 255), outline=(226, 220, 214)); d = ImageDraw.Draw(doc)
d.text((50, 80), 'vibe-editing.skill', font=F('monob', 34), fill=RED, anchor='ls')
for k, (a_, b_) in enumerate([('captions', 'designed per phrase'), ('camera', 'eased, motivated'), ('grade', 'real room, cinematic'), ('graphics', 'explain, not decorate'), ('never', 'templates')]):
    y = 160 + k * 104; d.rounded_rectangle((40, y - 50, 720, y + 40), 22, fill=(246, 243, 240)); d.ellipse((60, y - 22, 104, y + 22), fill=RED); d.line([(72, y), (80, y + 9), (94, y - 9)], fill=WHITE, width=5)
    d.text((124, y + 12), a_, font=F('disp', 34), fill=BLACK, anchor='ls'); d.text((330, y + 12), b_, font=F('med', 30), fill=GREY, anchor='ls')
place(im, tilt(doc, rx=14, ry=-10, rz=-2), W / 2, 930, .3, 50, (0, 40))
tl = rrect_img(900, 250, 36, (24, 23, 24), top=(44, 42, 44)); d = ImageDraw.Draw(tl); d.text((36, 52), 'ad4_final.mp4', font=F('mono', 26), fill=GREY, anchor='ls'); d.text((864, 52), '00:28', font=F('mono', 26), fill=RED, anchor='rs')
for r_, (x0, x1, c_) in enumerate([(36, 520, RED), (560, 864, (230, 225, 220)), (36, 300, (90, 86, 84)), (340, 864, (230, 225, 220)), (36, 864, (70, 66, 64))]):
    y = 82 + (r_ % 3) * 52 + (r_ >= 3) * 0; d.rounded_rectangle((x0, y, x1, y + 34), 10, fill=c_)
d.line([(610, 70), (610, 236)], fill=WHITE, width=4); d.polygon([(598, 64), (622, 64), (610, 80)], fill=WHITE)
place(im, tilt(tl, rx=18, rz=1), W / 2, 1420, .4, 40, (0, 36))
P.append((62, 'MOTION GRAPHIC · 3D UI', 'The difference is what I taught it.', 'White set: a glossy 3D "vibe-editing.skill" card tilts in; five rules tick on one by one in red; below, a 3D timeline (ref: "motion_reel.mp4") with clips sliding into place and a playhead running. This is the "skill" made visible.', im))
im = graded(OS(72), 1.08); cap(im, "that's what", "I'll teach you.", 'you'); P.append((69, 'A-ROLL', "That's what I will teach you.", 'Back to you for trust. Slight push, "you" in red.', im))
im = graded(OS(77), 1.08); cap(im, 'the link is below', None); button(im, 590); arrow(im, (W / 2 + 260, 660), (W / 2 + 200, 820), .3, WHITE, 6, 51)
P.append((75, 'CTA', 'The link is below.', 'Red glossy button springs in under the caption; a chalk arrow draws down toward Meta\'s button.', im))
im = paper(CREAM, 21); text(im, (W / 2, 420), 'VIBE', F('anton', 280), RED, track=6); text(im, (W / 2, 630), 'EDITING', F('anton', 190), BLACK, track=4)
rw, a = matte(31.8); cut = halftone_cutout(rw, a, 1.55, 18, 9); sc = 1.3; cut = cut.resize((int(cut.size[0] * sc), int(cut.size[1] * sc)), Image.LANCZOS)
rows = np.nonzero(np.asarray(cut.split()[3])[:, 250:700].max(1) > 128)[0]; paste_shadow(im, cut, ((W - cut.size[0]) // 2, 860 - rows.min()), 24, .45)
strip = torn_strip(900, 120, RED, 22); paste_shadow(im, strip, (90, 730), 14, .45); text(im, (W / 2, 792), 'make videos nobody can tell are AI', F('hand', 62), WHITE)
button(im, 930, fill=BLACK); text(im, (W / 2, 1030), '[your-url.com]', F('mono', 32), (120, 116, 110))
P.append((None, 'END CARD · POSTER', '(music resolves)', 'Poster end card in the hook\'s language: "VIBE" red / "EDITING" black condensed, you as a halftone cut-out in front, torn red strip with the promise, black button + URL.', grain(im, 3)))
# ---------------- sheets ----------------
BG = (14, 13, 12); tot = e['nframes'] / 30; starts = [wd[p[0]]['os'] if p[0] is not None else e['speech'] for p in P]
def wrap(d, txt, f, w):
    out, line = [], ''
    for word in txt.split():
        t = (line + ' ' + word).strip()
        if d.textlength(t, font=f) > w and line: out.append(line); line = word
        else: line = t
    return out + [line]
SEC = {'MOTION': RED, 'THE SWITCH': WHITE, 'A-ROLL': (200, 196, 190), 'CTA': RED, 'END': RED}
PW, PH, CW, CH, PAD = 360, 640, 1060, 720, 40
for s in range(0, len(P), 6):
    ch = list(range(s, min(s + 6, len(P)))); rows = (len(ch) + 1) // 2
    S = Image.new('RGB', (2 * CW + PAD, rows * CH + 170), BG); d = ImageDraw.Draw(S)
    text(S, (PAD, 90), 'AD 4 v3  ·  I can tell in 3 seconds', F('disp', 64), WHITE, anchor='lm', track=-2)
    text(S, (PAD + 1300, 90), f'panels {ch[0] + 1}–{ch[-1] + 1} of {len(P)}  ·  ~{tot:.0f} s', F('mono', 26), GREY, anchor='lm')
    for j, i in enumerate(ch):
        _, sec, vo, desc, img = P[i]; x = PAD + (j % 2) * CW; y = 160 + (j // 2) * CH
        img = img.resize((PW, PH), Image.LANCZOS); m = Image.new('L', img.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, PW - 1, PH - 1), 24, fill=255); S.paste(img, (x, y), m)
        c = next(v for k, v in SEC.items() if sec.startswith(k)); end = starts[i + 1] if i + 1 < len(P) else tot; tx = x + PW + 36
        text(S, (tx, y + 30), f'{i + 1:02d}', F('disp', 56), c, anchor='lm'); text(S, (tx + 100, y + 30), f'{starts[i]:.1f} – {end:.1f} s', F('mono', 28), (200, 190, 180), anchor='lm')
        text(S, (tx, y + 92), sec, F('disp', 26), c, anchor='lm', track=1); yy = y + 150
        for ln in wrap(d, '“' + vo + '”', F('semi', 36), 600): text(S, (tx, yy), ln, F('semi', 36), WHITE, anchor='ls'); yy += 46
        yy += 16
        for ln in wrap(d, desc, F('med', 27), 610): text(S, (tx, yy), ln, F('med', 27), (190, 182, 174), anchor='ls'); yy += 37
    S.save(f'{OUT}_{s // 6 + 1}.png'); print('sheet', s // 6 + 1)
for k, p in enumerate(P): p[4].save(f'{OUT}_panel{k + 1:02d}.jpg', quality=90)

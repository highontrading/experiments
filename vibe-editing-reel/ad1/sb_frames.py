"""Render the 17 storyboard key frames for Ad 1 (real composites, final look) + output timings.
usage: python3 sb_frames.py MATTE_DIR ROOM_PNG WORDS_JSON OUT_DIR"""
import sys, os, json, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from look import *
MD, ROOM, WJ, OUT = sys.argv[1:5]; os.makedirs(OUT, exist_ok=True)
fg = lambda t: Image.open(f'{MD}/fg_{t}.png'); rawp = lambda t: f'{MD}/raw_{t}.png'
def cam(z, sy, sx=540, fy=600): return dict(z=z, fx=360, fy=fy, sx=sx, sy=max(sy, H - (1280 - fy) * 1.5 * z), face_dy=-40)
def premium(t, c, behind=None, rim=True):
    bg = cinematic_set(ROOM, c)
    if behind: behind(bg, c)
    im, a = place_subject(bg, fg(t), c, rim=rim); return im
def finish(im, g=.035): return vignette(grain(im, g, 5), .5)
def head_top(c, top_raw=432): return c['sy'] + (top_raw - c['fy']) * 1.5 * c['z']
def generic_caption(im, words, hi, y=1150, size=92):
    """The 'normal AI edit' caption: centred, uppercase, white with heavy black stroke, active word yellow & bigger."""
    d = ImageDraw.Draw(im); fs = [font('generic', size + (14 if i == hi else 0)) for i in range(len(words))]
    ws = [f.getlength(w) for f, w in zip(fs, words)]; tot = sum(ws) + 26 * (len(words) - 1); x = W / 2 - tot / 2
    for i, (w, f) in enumerate(zip(words, fs)):
        d.text((x, y), w, font=f, fill=(255, 225, 40) if i == hi else (255, 255, 255), anchor='ls', stroke_width=8, stroke_fill=(0, 0, 0)); x += ws[i] + 26
    return im
def two_tone(im, parts, y, cx=W // 2):
    """One line made of several styled runs: [(text, fontname, size, colour, track, glow)] centred."""
    fs = [(s, font(fn, sz), col, tr, gl) for s, fn, sz, col, tr, gl in parts]
    gap = 18; tot = sum(text_w(s, f, tr) for s, f, _, tr, _ in fs) + gap * (len(fs) - 1); x = cx - tot / 2
    for s, f, col, tr, gl in fs: x += draw_text(im, (x, y), s, f, col, tr, anchor='ls', glow=gl) + gap
GOLDGLOW = (GOLD, .55, 18)
F = {}
# ---------- PART 1: the normal edit ----------
F[1] = generic_caption(raw_frame(rawp(0.9)), ['BE', 'HONEST?'], 1)
F[2] = generic_caption(raw_frame(rawp(4.6), z=1.22, cy=600), ['JUMPING', 'ON'], 0)
F[3] = generic_caption(raw_frame(rawp(8.4)), ['OLD', 'WHOOSH'], 1)
im = Image.new('RGB', (W, H), (10, 10, 11)); cw, ch = 560, 996
for k, (t, y, dim) in enumerate([(4.6, -720, .45), (11.9, 470, 1), (8.4, 1520, .45)]):
    c = raw_frame(rawp(t)).resize((cw, ch)); c = Image.fromarray((np.asarray(c) * dim).astype(np.uint8))
    if k == 1:  # the card being flicked up: vertical motion trail
        acc = np.zeros((ch + 260, cw, 3), np.float32)
        for j in range(8): acc[j * 14:j * 14 + ch] += np.asarray(c, np.float32) * (.5 if j == 0 else .5 / 7)
        trail = Image.fromarray(acc.clip(0, 255).astype(np.uint8)); paste_card(im, trail.crop((0, 0, cw, ch + 120)), ((W - cw) // 2, y - 140), 40)
    else: paste_card(im, c, ((W - cw) // 2, y), 40, shadow=False)
draw_text(im, (W / 2, 1590), 'swipe.', font('serif', 64), (120, 118, 115), anchor='ms', shadow=0)
F[4] = finish(im, .02)
# ---------- THE SWITCH: before / after ----------
im = paper_bg(7); c13 = cam(1.0, 900)
after = finish(premium(13.2, c13)); before = ImageOps.grayscale(raw_frame(rawp(13.2))).convert('RGB')
bw, bh, aw, ah = 380, 676, 590, 1049
paste_card(im, before.resize((bw, bh)), (60, 700), 36); paste_card(im, after.resize((aw, ah)), (430, 470), 44)
draw_text(im, (64, 676), 'before', font('semi', 46), MUTED, -1, anchor='ls', shadow=0)
d = ImageDraw.Draw(im); d.ellipse((434, 404, 452, 422), fill=EMBER)
draw_text(im, (466, 440), 'after', font('disp', 86), INK, -3, anchor='ls', shadow=0)
two_tone(im, [('now watch', 'disp', 50, CREAM, -1, None), ('this.', 'serif', 84, GOLD, 0, (GOLD, .5, 12))], 1440, cx=430 + aw // 2)
F[5] = im
# ---------- PART 2: premium ----------
im = premium(14.6, cam(1.08, 860)); im = finish(im)
draw_text(im, (W / 2, 1125), 'AI edited', font('disp', 108), CREAM, -4)
two_tone(im, [('this one', 'serif', 118, CREAM, 0, None), ('too.', 'serif', 118, GOLD, 0, GOLDGLOW)], 1240)
F[6] = im
c = cam(1.45, 690); im = finish(premium(16.2, c)); d = ImageDraw.Draw(im)
fx, fy, s = c['sx'], c['sy'] - 30, 330
for sx_, sy_ in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    x0, y0 = fx + sx_ * s / 2, fy + sy_ * s * .62
    d.line([(x0, y0), (x0 - sx_ * 44, y0)], fill=GOLD, width=3); d.line([(x0, y0), (x0, y0 - sy_ * 44)], fill=GOLD, width=3)
draw_text(im, (W / 2, 1100), 'could you', font('disp', 64), CREAM, -2)
draw_text(im, (W / 2, 1245), 'tell?', font('serif', 200), GOLD, glow=GOLDGLOW)
F[7] = im
c = cam(1.1, 920)
def nobody(bg, c): draw_text(bg, (W / 2, head_top(c) + 120), 'nobody', font('black', 290), CREAM, -12, shadow=.25)
im = finish(premium(17.3, c, nobody)); draw_text(im, (W / 2, 1215), 'can.', font('serif', 230), GOLD, glow=GOLDGLOW)
F[8] = im
# ---------- motion graphics on paper ----------
def mg_card(heading1, heading2, h=860, y=600):
    im = paper_bg(11)
    draw_text(im, (W / 2, 400), heading1, font('disp', 82), INK, -3, shadow=0)
    draw_text(im, (W / 2, 520), heading2, font('serif', 128), EMBER, 0, shadow=0)
    card = Image.new('RGB', (900, h), CARD); paste_card(im, card, (90, y), 48)
    return im, ImageDraw.Draw(im), (90, y, 990, y + h)
im, d, (x0, y0, x1, y1) = mg_card("i don't just tell AI", '“edit my video”', 760)
draw_text(im, (x0 + 60, y0 + 90), 'PROMPT', font('monob', 24), MUTED, 4, anchor='ls', shadow=0)
d.rounded_rectangle((x0 + 50, y0 + 120, x1 - 50, y0 + 250), 30, fill=(38, 35, 33), outline=(64, 59, 55), width=2)
w = draw_text(im, (x0 + 90, y0 + 205), 'edit my video', font('med', 58), CREAM, -1, anchor='ls', shadow=0)
d.line([(x0 + 84, y0 + 186), (x0 + 96 + w, y0 + 186)], fill=EMBER, width=6)
d.rectangle((x0 + 110 + w, y0 + 150, x0 + 116 + w, y0 + 222), fill=GOLD)
for k in range(3):
    tx = x0 + 60 + k * 270; d.rounded_rectangle((tx, y0 + 320, tx + 240, y0 + 640), 22, fill=(46, 43, 41))
    d.rounded_rectangle((tx + 40, y0 + 540, tx + 200, y0 + 572), 8, fill=(255, 225, 40))
draw_text(im, (W / 2, y0 + 710), 'same captions · same zoom · same whoosh', font('mono', 26), MUTED, 0, shadow=0)
F[9] = im
im, d, (x0, y0, x1, y1) = mg_card('i built my own', 'workflow.', 900)
nodes = ['Transcript', 'Cut', 'Matte', 'Type', 'Camera', 'Grade', 'Sound']; pts = []
for i, n in enumerate(nodes):
    nx = x0 + (110 if i % 2 == 0 else 430); ny = y0 + 70 + i * 116; pts.append((nx, ny))
glow = Image.new('L', (W, H), 0); gd = ImageDraw.Draw(glow)
for i in range(len(pts) - 1):
    (ax, ay), (bx, by) = pts[i], pts[i + 1]; ax += 180; bx += 180; ay += 34; by += 34
    seg = [(ax + (bx - ax) * u, ay + (by - ay) * (3 * u * u - 2 * u * u * u)) for u in np.linspace(0, 1, 30)]
    gd.line(seg, fill=255, width=4); d.line(seg, fill=EMBER, width=3)
im.paste(Image.new('RGB', (W, H), EMBER), (0, 0), glow.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * .8)))
d = ImageDraw.Draw(im)
for i, (n, (nx, ny)) in enumerate(zip(nodes, pts)):
    d.rounded_rectangle((nx, ny, nx + 360, ny + 70), 35, fill=(40, 37, 35), outline=(72, 66, 61), width=2)
    draw_text(im, (nx + 30, ny + 47), f'{i + 1:02d}', font('monob', 24), EMBER, 0, anchor='ls', shadow=0)
    draw_text(im, (nx + 86, ny + 48), n, font('semi', 34), CREAM, -1, anchor='ls', shadow=0)
px, py = pts[3][0] + 180, pts[3][1] + 104
for r, a in [(30, 60), (16, 140), (8, 255)]: d.ellipse((px - r, py - r, px + r, py + r), fill=tuple(int(v * a / 255 + 24 * (1 - a / 255)) for v in GOLD))
F[10] = im
c = cam(1.15, 830); im = finish(premium(24.7, c))
draw_text(im, (W / 2, 1075), 'how every', font('disp', 62), CREAM, -2)
draw_text(im, (W / 2, 1205), 'word', font('serif', 170), GOLD, glow=GOLDGLOW)
x_ = W / 2 - 300
for j, lab in enumerate(['SERIF', 'BOLD', 'MONO', 'OUTLINE']):
    col = GOLD if j == 0 else (150, 142, 134); x_ += draw_text(im, (x_, 1250), lab, font('monob', 22), col, 3, anchor='ls', shadow=.4) + 40
F[11] = im
c = cam(1.35, 760, sx=560); im = finish(premium(26.3, c)); d = ImageDraw.Draw(im)
m, L = 80, 70
for (cx_, cy_, sx_, sy_) in [(m, 300, 1, 1), (W - m, 300, -1, 1), (m, 1300, 1, -1), (W - m, 1300, -1, -1)]:
    d.line([(cx_, cy_), (cx_ + sx_ * L, cy_)], fill=(255, 255, 255), width=3); d.line([(cx_, cy_), (cx_, cy_ + sy_ * L)], fill=(255, 255, 255), width=3)
draw_text(im, (m + 6, 290), 'PUSH IN  ·  EASE 0.65', font('mono', 24), (230, 225, 215), 2, anchor='ls', shadow=.4)
draw_text(im, (W / 2, 1090), 'when the camera', font('disp', 62), CREAM, -2)
for k in range(5, 0, -1):
    lay = im.copy(); draw_text(lay, (W / 2 - k * 34, 1235), 'moves.', font('blackit', 160), CREAM, -6, shadow=0); im = Image.blend(im, lay, .1)
draw_text(im, (W / 2, 1235), 'moves.', font('blackit', 160), CREAM, -6)
F[12] = im
im, d, (x0, y0, x1, y1) = mg_card("it's all set", 'before I start.', 820)
rows = [('Captions', 'kinetic · per phrase'), ('Camera', 'smooth push · ease'), ('Grade', 'cinematic · low-key'), ('Background', 'AI room · matched light'), ('Sound', 'minimal · ducked')]
for i, (k_, v) in enumerate(rows):
    ry = y0 + 70 + i * 128
    draw_text(im, (x0 + 60, ry + 40), k_, font('semi', 40), CREAM, -1, anchor='ls', shadow=0)
    draw_text(im, (x0 + 60, ry + 82), v, font('mono', 24), MUTED, 0, anchor='ls', shadow=0)
    d.rounded_rectangle((x1 - 160, ry + 18, x1 - 60, ry + 72), 27, fill=EMBER); d.ellipse((x1 - 108, ry + 22, x1 - 64, ry + 68), fill=(255, 255, 255))
    if i < 4: d.line([(x0 + 60, ry + 112), (x1 - 60, ry + 112)], fill=(48, 45, 42), width=2)
d.rounded_rectangle((x0 + 60, y1 - 90, x1 - 60, y1 - 78), 6, fill=EMBER)
draw_text(im, (x0 + 60, y1 - 36), 'READY  ·  RENDER 00:32', font('monob', 22), MUTED, 3, anchor='ls', shadow=0)
F[13] = im
c = cam(1.05, 860)
def vibe(bg, c):
    draw_text(bg, (W / 2, 560), 'VIBE', font('black', 330), CREAM, -10, shadow=.2)
    draw_text(bg, (W / 2, head_top(c) + 110), 'EDITING', font('black', 168), CREAM, 2, shadow=.2)
im = finish(premium(31.2, c, vibe))
draw_text(im, (W / 2, 1115), "that's the workflow", font('disp', 60), CREAM, -2)
draw_text(im, (W / 2, 1240), 'I teach.', font('serif', 150), GOLD, glow=GOLDGLOW)
F[14] = im
c = cam(1.05, 850); im = finish(premium(33.3, c)); d = ImageDraw.Draw(im)
draw_text(im, (W / 2, 1060), 'the link is below', font('disp', 60), CREAM, -2)
sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).rounded_rectangle((210, 1098, 870, 1210), 56, fill=200)
im.paste(Image.new('RGB', (W, H), EMBER), (0, 0), sh.filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v * .5)))
d = ImageDraw.Draw(im); d.rounded_rectangle((210, 1090, 870, 1202), 56, fill=EMBER)
draw_text(im, (W / 2, 1163), 'Learn the workflow  →', font('disp', 46), INK, -1, shadow=0)
for k in range(2): d.line([(520, 1222 + k * 18), (540, 1236 + k * 18), (560, 1222 + k * 18)], fill=(240, 232, 220), width=4)
F[15] = im
c = cam(1.25, 770); im = finish(premium(35.6, c))
draw_text(im, (W / 2, 1045), 'make videos that', font('disp', 60), CREAM, -2)
draw_text(im, (W / 2, 1160), 'nobody can tell', font('serif', 140), GOLD, glow=GOLDGLOW)
draw_text(im, (W / 2, 1242), 'are AI.', font('disp', 64), CREAM, -3)
F[16] = im
im = paper_bg(21)
def tilt(img, deg):
    img = img.convert('RGBA'); img.putalpha(rounded(img, 30)); return img.rotate(deg, expand=True, resample=Image.BICUBIC)
for img, deg, xy in [(ImageOps.grayscale(raw_frame(rawp(13.2))).convert('RGB').resize((330, 587)), 6, (120, 650)), (after.resize((380, 676)), -5, (560, 600))]:
    t_ = tilt(img, deg); sh = Image.new('L', im.size, 0); sh.paste(t_.split()[3], (xy[0] + 10, xy[1] + 26))
    im.paste(Image.new('RGB', im.size, (40, 25, 15)), (0, 0), sh.filter(ImageFilter.GaussianBlur(30)).point(lambda v: int(v * .4))); im.paste(t_, xy, t_)
two_tone(im, [('Vibe', 'serif', 170, EMBER, 0, None), ('Editing', 'disp', 140, INK, -6, None)], 520)
d = ImageDraw.Draw(im); d.rounded_rectangle((210, 1380, 870, 1492), 56, fill=EMBER)
draw_text(im, (W / 2, 1453), 'Learn the workflow  →', font('disp', 46), INK, -1, shadow=0)
draw_text(im, (W / 2, 1560), '[your-url.com]', font('mono', 32), MUTED, 0, shadow=0)
F[17] = im
for k, v in F.items(): v.save(f'{OUT}/p{k:02d}.jpg', quality=92)
# ---------- timings (gaps capped at 0.18 s, 1.1x, take 1 of the last line) ----------
ws = [w for w in json.load(open(WJ)) if w['s'] < 37.5]; acc = 0; prev = None; out = []
for w in ws:
    if prev is not None: acc += min(w['s'] - prev, .18)
    out.append((w['w'], acc / 1.1)); acc += w['e'] - w['s']; prev = w['e']
json.dump(dict(words=out, total=round(acc / 1.1 + 1.4, 2)), open(f'{OUT}/timing.json', 'w'))
print('frames', len(F), 'duration ~', round(acc / 1.1 + 1.4, 1), 's')

"""Draw the Ad 1 storyboard: one panel per beat (mock frame + timing + VO + what happens).
usage: python3 storyboard.py THUMBS_DIR FONTS_DIR OUT_PREFIX"""
import sys, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
TH, FD, OUT = sys.argv[1:4]
F = lambda n, s: ImageFont.truetype(f'{FD}/{n}.ttf', s)
PW, PH = 270, 480
def raw(t): return Image.open(f'{TH}/r_{t}.jpg').convert('RGB').resize((PW, PH))
def warm(im, dark=.55):
    """Fake the premium look for the mock: matte-ish warm grade + vignette."""
    im = im.copy(); ov = Image.new('RGB', im.size, (70, 36, 16)); im = Image.blend(im, ov, dark)
    v = Image.new('L', im.size, 0); ImageDraw.Draw(v).ellipse((-80, -40, PW + 80, PH + 60), fill=255)
    return Image.composite(im, Image.new('RGB', im.size, (12, 7, 4)), v.filter(ImageFilter.GaussianBlur(60)))
def grad(c1, c2):
    im = Image.new('RGB', (PW, PH)); d = ImageDraw.Draw(im)
    for y in range(PH):
        k = y / PH; d.line([(0, y), (PW, y)], fill=tuple(int(c1[i] * (1 - k) + c2[i] * k) for i in range(3)))
    return im
def chip(d, x, y, w, txt, f=None, fill=(255, 255, 255, 235), ink=(25, 25, 40)):
    d.rounded_rectangle((x, y, x + w, y + 30), 10, fill=fill); d.text((x + w / 2, y + 15), txt, font=f or F('Inter-Bold', 13), fill=ink, anchor='mm')
def cheap_cap(d, txt, y=300):
    f = F('Archivo-Black', 34)
    for dx in (-3, 3):
        for dy in (-3, 3): d.text((PW / 2 + dx, y + dy), txt, font=f, fill='black', anchor='mm')
    d.text((PW / 2, y), txt, font=f, fill=(255, 226, 0), anchor='mm')
def tell(d, x, y, r, label):
    d.ellipse((x - r, y - r * .6, x + r, y + r * .6), outline=(255, 50, 50), width=4)
    d.text((x, y - r * .6 - 14), label, font=F('Inter-ExtraBold', 13), fill=(255, 60, 60), anchor='mm')

P = []  # (time, section, vo, desc, image)
# ---------- PART 1: the "cheap AI edit" (deliberate) ----------
im = raw('1.0'); d = ImageDraw.Draw(im); cheap_cap(d, 'HONEST?'); P.append(('0.0–2.9', 'PART 1 · CHEAP AI LOOK', 'Can I be honest? I can tell your video was edited with AI.',
  'Your raw frame, flat. Deliberately "typical AI edit": big yellow word-by-word captions with black outline, bouncing in the centre.', im))
im = raw('5.0').resize((int(PW * 1.18), int(PH * 1.18))).crop((24, 30, 24 + PW, 30 + PH)); d = ImageDraw.Draw(im)
cheap_cap(d, 'JUMPING'); tell(d, PW / 2, 300, 105, 'TELL #1')
P.append(('2.9–5.3', 'PART 1 · CHEAP AI LOOK', 'Captions jumping on every word, a zoom every 2 seconds…',
  'We DO exactly what you say: the caption jumps, a cheap auto-zoom punches in on "zoom". A red hand-drawn circle labels each tell: TELL #1, TELL #2.', im))
im = raw('6.2'); d = ImageDraw.Draw(im); cheap_cap(d, 'WHOOSH'); tell(d, 70, 120, 45, 'TELL #3')
d.polygon([(58, 112), (66, 112), (76, 104), (76, 136), (66, 128), (58, 128)], fill='white'); d.arc((72, 108, 92, 132), -60, 60, fill='white', width=3)
P.append(('5.3–6.9', 'PART 1 · CHEAP AI LOOK', '…the same old whoosh.',
  'A cheesy stock whoosh plays exactly on "whoosh" (the joke lands). TELL #3 circles a speaker icon.', im))
im = Image.new('RGB', (PW, PH), (12, 12, 14)); d = ImageDraw.Draw(im)
for k, yy in enumerate([-120, 95, 310]):
    card = raw('10.0').resize((180, 320)); im.paste(card, (45, yy)); d.rounded_rectangle((45, yy, 225, yy + 320), 14, outline=(60, 60, 60), width=2)
d.text((PW / 2, 455), '↑ swipe', font=F('Inter-Bold', 16), fill=(180, 180, 180), anchor='mm')
P.append(('6.9–10.2', 'PART 1 → FEED', 'People see it in one second, they know it\'s AI and they scroll.',
  'Your frame shrinks into a phone-feed card (Reels-style). On "scroll" it is flicked up and away, with other cards flying past. Smooth spring motion.', im))
# ---------- THE SWITCH ----------
im = Image.new('RGB', (PW, PH), (0, 0, 0)); d = ImageDraw.Draw(im)
d.line([(0, PH / 2), (PW, PH / 2)], fill=(255, 240, 220), width=2); im = im.filter(ImageFilter.GaussianBlur(1.2)); d = ImageDraw.Draw(im)
d.text((PW / 2, PH / 2 - 40), 'Now watch this.', font=F('PlayfairDisplay-Italic700', 26), fill='white', anchor='mm')
P.append(('10.2–10.8', 'THE SWITCH', 'Now watch this.',
  'Hard cut to black. Music and SFX go silent for half a beat. A single thin line of warm light splits the screen open. The premium music drops in.', im))
im = raw('14.6'); im2 = warm(im, .5); d = ImageDraw.Draw(im2)
d.text((PW / 2, 120), 'AI', font=F('Anton', 150), fill=(205, 205, 215), anchor='mm', stroke_width=2, stroke_fill=(90, 90, 100))
head = raw('14.6').crop((95, 170, 175, 260)); im2.paste(head, (95, 170))
P.append(('10.8–12.8', 'PART 2 · PREMIUM', 'AI edited this one too…',
  'Reveal: your cream wall melts away into a warm cinematic room, and you are now matted and relit. A chrome "AI" sits BEHIND your head. (This very video is the proof.)', im2))
im = warm(raw('16.2'), .45).resize((int(PW * 1.25), int(PH * 1.25))).crop((34, 40, 34 + PW, 40 + PH)); d = ImageDraw.Draw(im)
for (x, y) in [(95, 205), (175, 205), (95, 285), (175, 285)]:
    d.line([(x, y), (x + (12 if x < 135 else -12), y)], fill=(242, 194, 48), width=3); d.line([(x, y), (x, y + (12 if y < 245 else -12))], fill=(242, 194, 48), width=3)
d.text((PW / 2, 330), 'could you tell?', font=F('PlayfairDisplay-Italic700', 28), fill='white', anchor='mm')
d.text((PW / 2, 360), 'SCANNING FOR TELLS… 0', font=F('JetBrainsMono-Bold', 11), fill=(242, 194, 48), anchor='mm')
P.append(('12.8–14.8', 'PART 2 · PREMIUM', 'Could you tell?',
  'Slow push-in on your face. Gold tracking brackets lock on; a playful mono readout "scanning for tells… 0". Serif italic caption.', im))
im = warm(raw('17.3'), .62); d = ImageDraw.Draw(im)
d.text((PW / 2, 120), 'Nobody', font=F('PlayfairDisplay-Italic900', 58), fill='white', anchor='mm'); d.text((PW / 2, 175), 'can.', font=F('PlayfairDisplay-Italic900', 58), fill='white', anchor='mm')
P.append(('14.8–15.6', 'PART 2 · PREMIUM', 'Nobody can.',
  'Big serif italic, stacked behind your head. A soft impact hit. Darker grade for weight.', im))
# ---------- MOTION GRAPHICS ----------
im = grad((22, 20, 70), (8, 6, 28)); d = ImageDraw.Draw(im, 'RGBA')
d.rounded_rectangle((25, 205, 245, 255), 25, fill=(255, 255, 255, 40), outline=(255, 255, 255, 120), width=2)
d.text((48, 230), 'edit my video', font=F('Inter-Bold', 18), fill='white', anchor='lm'); d.line([(48, 231), (178, 231)], fill=(255, 80, 80), width=3)
d.text((PW / 2, 300), "I don't just tell AI", font=F('Inter-Bold', 15), fill=(220, 220, 240), anchor='mm')
P.append(('15.6–18.0', 'MOTION GRAPHIC · FULL SCREEN', 'Because I don\'t just tell AI "edit my video",',
  'No A-roll. Deep indigo, frosted-glass prompt bar. "edit my video" types in, the cursor blinks, then it is selected and deleted (or struck through in red). The bar shrinks away like a rejected idea.', im))
im = grad((16, 14, 52), (5, 4, 18)); d = ImageDraw.Draw(im, 'RGBA'); f = F('Inter-Bold', 12)
nodes = [('Transcript', 60), ('Cut', 115), ('Matte', 170), ('Type', 225), ('Camera', 280), ('Sound', 335), ('Render', 390)]
for i, (n, y) in enumerate(nodes):
    x = 40 if i % 2 == 0 else 140
    if i: d.line([(px + 45, py + 30), (x + 45, y)], fill=(140, 170, 255, 200), width=2)
    chip(d, x, y, 90, n, f); px, py = x, y
d.ellipse((180, 220, 200, 240), fill=(200, 220, 255, 230))
P.append(('18.0–20.6', 'MOTION GRAPHIC · FULL SCREEN', 'I built my own workflow,',
  'A node pipeline builds itself: frosted chips (Transcript → Cut → Matte → Type → Camera → Sound → Render) linked by glowing lines. A light pulse travels through. The camera glides along it in 2.5D.', im))
im = warm(raw('24.5'), .5); d = ImageDraw.Draw(im)
for k, (fn, sz, col, yy) in enumerate([('PlayfairDisplay-Italic900', 60, 'white', 110)]): d.text((PW / 2, yy), 'word', font=F(fn, sz), fill=col, anchor='mm')
d.text((PW / 2, 160), 'SERIF → CHROME → NEON → OUTLINE', font=F('JetBrainsMono-Bold', 10), fill=(242, 194, 48), anchor='mm')
P.append(('20.6–22.2', 'PART 2 · PREMIUM', 'how every word shows up,',
  'Back on you. The word "word" morphs smoothly through 4 type styles behind your head (serif italic → chrome → neon → outline) with tiny type-spec labels.', im))
im = warm(raw('26.2'), .5); d = ImageDraw.Draw(im, 'RGBA')
d.rectangle((40, 140, 230, 400), outline=(255, 255, 255, 200), width=2)
d.rounded_rectangle((20, 400, 250, 470), 10, fill=(10, 10, 12, 200)); d.line([(35, 455), (90, 452), (135, 425), (180, 412), (235, 410)], fill=(242, 194, 48), width=3)
d.text((40, 412), 'EASE IN-OUT', font=F('JetBrainsMono-Bold', 10), fill=(242, 194, 48))
P.append(('22.2–23.6', 'PART 2 · PREMIUM', 'when the camera moves.',
  'A thin framing guide tightens around you as the camera really pushes in. A small easing-curve card traces the move (the dot rides the bezier).', im))
im = Image.new('RGB', (PW, PH), (12, 12, 14)); d = ImageDraw.Draw(im); fm = F('JetBrainsMono-Medium', 11)
d.rounded_rectangle((15, 120, 255, 360), 12, fill=(24, 22, 20), outline=(70, 60, 50))
for k, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]): d.ellipse((30 + k * 16, 134, 40 + k * 16, 144), fill=c)
for k, line in enumerate(['$ vibe render ad1', '+ captions   set', '+ camera     set', '+ sound      set', '+ grade      set', '█████████████ 100%', 'done.']):
    d.text((28, 165 + k * 24), line, font=fm, fill=(217, 119, 87) if k == 0 else (230, 225, 215))
P.append(('23.6–26.0', 'SCREEN · FULL SCREEN', 'It\'s all set before I start.',
  'A clean terminal "screen" (styled like Claude Code, no logos). Each setting ticks ✓ in sequence, then a progress bar fills to 100% → "done." Fast, satisfying, smooth.', im))
im = warm(raw('31.2'), .5); d = ImageDraw.Draw(im)
d.text((PW / 2, 95), 'VIBE', font=F('Anton', 92), fill=(210, 210, 220), anchor='mm'); d.text((PW / 2, 175), 'EDITING', font=F('Anton', 62), fill=(210, 210, 220), anchor='mm')
P.append(('26.0–27.5', 'PART 2 · PREMIUM', 'That\'s the workflow I teach.',
  'Chrome "VIBE EDITING" stacked behind your head. The workflow chips from earlier float faintly in the room as the camera settles.', im))
im = warm(raw('33.2'), .5); d = ImageDraw.Draw(im)
d.rounded_rectangle((45, 330, 225, 372), 21, fill=(200, 240, 58)); d.text((PW / 2, 351), 'Learn the workflow →', font=F('Inter-ExtraBold', 15), fill=(15, 15, 10), anchor='mm')
d.text((PW / 2, 395), '↓', font=F('Inter-ExtraBold', 26), fill='white', anchor='mm')
P.append(('27.5–28.3', 'CTA', 'The link is below.',
  'A lime pill button springs in at mid-screen (inside the Reels safe zone), an arrow nudges down toward the real Meta button. A soft tap ripple.', im))
im = warm(raw('35.5'), .58); d = ImageDraw.Draw(im)
d.text((PW / 2, 115), 'make videos that', font=F('Inter-Bold', 16), fill='white', anchor='mm')
d.text((PW / 2, 160), 'nobody can tell', font=F('PlayfairDisplay-Italic900', 34), fill='white', anchor='mm')
d.text((PW / 2, 205), 'are AI.', font=F('Anton', 40), fill=(150, 150, 160), anchor='mm'); d.line([(95, 205), (180, 205)], fill=(255, 255, 255), width=2)
P.append(('28.3–30.6', 'CTA', 'Make videos that nobody can tell are AI.',
  'Words build line by line. "are AI." arrives in chrome, then dissolves to dust, leaving "nobody can tell." The best take of this line is used (take 1).', im))
im = grad((14, 10, 8), (4, 3, 2)); d = ImageDraw.Draw(im)
d.text((PW / 2, 190), 'VIBE EDITING', font=F('Anton', 44), fill='white', anchor='mm')
d.rounded_rectangle((45, 240, 225, 282), 21, fill=(200, 240, 58)); d.text((PW / 2, 261), 'Learn the workflow →', font=F('Inter-ExtraBold', 15), fill=(15, 15, 10), anchor='mm')
d.text((PW / 2, 305), '[your-url.com]', font=F('JetBrainsMono-Medium', 12), fill=(170, 170, 170), anchor='mm')
P.append(('30.6–32.0', 'END CARD', '(music resolves)',
  '1.4 s end card: "VIBE EDITING" wordmark, pulsing lime button, your URL. Music lands its final hit.', im))

# ---------- render sheets ----------
SEC = {'PART 1': (255, 90, 90), 'THE SWITCH': (255, 255, 255), 'PART 2': (242, 194, 48), 'MOTION': (140, 170, 255), 'SCREEN': (140, 170, 255), 'CTA': (200, 240, 58), 'END': (200, 240, 58)}
def color(s): return next(v for k, v in SEC.items() if s.startswith(k))
def wrap(txt, f, w, d):
    out, line = [], ''
    for word in txt.split():
        t = (line + ' ' + word).strip()
        if d.textlength(t, font=f) > w: out.append(line); line = word
        else: line = t
    return out + [line]
COLS, CW, CH, PAD = 2, 860, 540, 28
per = 8
for s in range(0, len(P), per):
    chunk = P[s:s + per]; rows = math.ceil(len(chunk) / COLS)
    sheet = Image.new('RGB', (COLS * CW + PAD, rows * CH + 140), (16, 14, 13)); d = ImageDraw.Draw(sheet)
    d.text((PAD, 40), 'AD 1 · STORYBOARD', font=F('Anton', 48), fill='white')
    d.text((PAD + 420, 58), f'panels {s + 1}–{s + len(chunk)} of {len(P)}  ·  1080×1920 · 30 fps · ~32 s', font=F('Inter-Bold', 20), fill=(160, 150, 140))
    for i, (tc, sec, vo, desc, img) in enumerate(chunk):
        x = PAD + (i % COLS) * CW; y = 130 + (i // COLS) * CH
        sheet.paste(img, (x, y)); d.rectangle((x, y, x + PW - 1, y + PH - 1), outline=(60, 55, 50), width=2)
        tx = x + PW + 24; c = color(sec)
        d.text((tx, y), f'{s + i + 1:02d}', font=F('Anton', 40), fill=c)
        d.text((tx + 60, y + 6), tc + ' s', font=F('JetBrainsMono-Bold', 20), fill=(200, 190, 180))
        d.text((tx, y + 56), sec, font=F('Inter-ExtraBold', 17), fill=c)
        yy = y + 92
        for ln in wrap('“' + vo + '”', F('PlayfairDisplay-Italic700', 22), 520, d): d.text((tx, yy), ln, font=F('PlayfairDisplay-Italic700', 22), fill='white'); yy += 30
        yy += 10
        for ln in wrap(desc, F('Inter-Bold', 18), 520, d): d.text((tx, yy), ln, font=F('Inter-Bold', 18), fill=(185, 178, 170)); yy += 26
    sheet.save(f'{OUT}_{s // per + 1}.png'); print('wrote', f'{OUT}_{s // per + 1}.png', sheet.size)

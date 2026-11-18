"""Ad 4 v2 edit board: real graded frames, phone-mockup Part 1, clean bold sans captions in red & white.
usage: python3 board.py ADS_SCRATCH OUT_PREFIX"""
import sys, os, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'ad1'))
from grade import grade
from look import font, draw_text, text_w, rounded, paste_card
SC, OUT = sys.argv[1:3]
W, H = 1080, 1920
RED = (232, 53, 43); WHITE = (255, 255, 255); INK = (12, 11, 11); DIM = (170, 165, 160)
e = json.load(open(f'{ROOT}/ad4/edl.json')); wd = e['words']
def src_at(t): return e['frames'][min(len(e['frames']) - 1, int(round(t * 30)))]
def raw(t): return np.asarray(Image.open(f"{SC}/bake/ad4/raw/{src_at(t):05d}.jpg").convert('RGB'))
def graded(t, z=1.0, cy=0.0):
    im = Image.fromarray(grade(raw(t)))
    if z != 1.0:
        w, h = int(W * z), int(H * z); im = im.resize((w, h), Image.LANCZOS); x0 = (w - W) // 2; y0 = int((h - H) * (.42 + cy)); im = im.crop((x0, y0, x0 + W, y0 + H))
    return im
def cap(im, small, big, red_word=None, y=430):
    """clean bold sans: lead-in line + larger payoff line, one word in red. Sits on the dark wall above the head."""
    if small: draw_text(im, (W / 2, y), small, font('semi', 58), WHITE, -1, shadow=.9)
    if big:
        f = font('disp', 104); parts = big.split(' '); ws = [text_w(p, f, -3) for p in parts]; gap = 26
        x = W / 2 - (sum(ws) + gap * (len(ws) - 1)) / 2
        for p, w in zip(parts, ws):
            isr = red_word and p.strip('.,?') == red_word; draw_text(im, (x, y + 118), p, f, RED if isr else WHITE, -3, anchor='ls', shadow=.35 if isr else .9); x += w + gap
def cheap_caps(im, words, hi, y):
    d = ImageDraw.Draw(im); fs = [font('generic', 60 if i == hi else 52) for i in range(len(words))]
    ws = [f.getlength(w) for f, w in zip(fs, words)]; x = im.size[0] / 2 - (sum(ws) + 16 * (len(ws) - 1)) / 2
    for i, (w, f) in enumerate(zip(words, fs)):
        d.text((x, y), w, font=f, fill=(255, 225, 40) if i == hi else WHITE, anchor='ls', stroke_width=6, stroke_fill=(0, 0, 0)); x += ws[i] + 16
def phone(content, ui=True, audio=False):
    """Generic phone + reels UI (no platform logos)."""
    pw, ph = 600, 1240; scr = content.resize((pw - 36, ph - 36), Image.LANCZOS); d = ImageDraw.Draw(scr)
    if ui:
        for k, y in enumerate([640, 760, 880]):
            x = pw - 90
            if k == 0: d.polygon([(x, y + 14), (x - 22, y - 6), (x - 12, y - 18), (x, y - 8), (x + 12, y - 18), (x + 22, y - 6)], outline=WHITE, width=4)
            if k == 1: d.ellipse((x - 22, y - 22, x + 22, y + 18), outline=WHITE, width=4)
            if k == 2: d.polygon([(x - 22, y - 4), (x + 22, y - 22), (x + 6, y + 22)], outline=WHITE, width=4)
        d.ellipse((24, ph - 230, 74, ph - 180), fill=(200, 190, 180)); d.text((88, ph - 196), '@creator', font=font('semi', 28), fill=WHITE, anchor='ls')
        d.rectangle((0, ph - 44, (pw - 36) * .42, ph - 40), fill=WHITE)
        if audio:
            d.rounded_rectangle((24, ph - 160, 420, ph - 116), 22, fill=(0, 0, 0, 120)); d.text((44, ph - 128), '♪  trending audio · original sound', font=font('generic', 22), fill=WHITE, anchor='ls')
    body = Image.new('RGB', (pw, ph), (16, 16, 18)); m = rounded(scr, 46); body.paste(scr, (18, 18), m)
    d = ImageDraw.Draw(body); d.rounded_rectangle((pw // 2 - 70, 34, pw // 2 + 70, 72), 19, fill=(0, 0, 0))
    return body
def phone_scene(t, words, hi, tells, z=1.0, audio=False, shift=0, label=None):
    bg = graded(t).filter(ImageFilter.GaussianBlur(28)); bg = Image.fromarray((np.asarray(bg) * .38).astype(np.uint8))
    c = Image.fromarray(raw(t));
    if z != 1.0: w, h = int(W * z), int(H * z); c = c.resize((w, h)); c = c.crop(((w - W) // 2, int((h - H) * .4), (w - W) // 2 + W, int((h - H) * .4) + H))
    c = c.copy(); cheap_caps(c, words, hi, 1150); ph = phone(c, audio=audio)
    x, y = (W - ph.size[0]) // 2, 300 + shift; paste_card(bg, ph, (x, y), 64)
    d = ImageDraw.Draw(bg); yy = 300 + 1240 + 70
    for k, (n, s) in enumerate(tells):
        txt = f'{n}  {s}'; draw_text(bg, (W / 2, yy + k * 0), txt, font('semi', 40), WHITE, -1, shadow=.5) if False else None
    if tells:
        n, s = tells[-1]; f1, f2 = font('disp', 40), font('semi', 40); w1, w2 = text_w(n, f1, 0), text_w(s, f2, -1); x0 = W / 2 - (w1 + 18 + w2) / 2
        draw_text(bg, (x0, yy), n, f1, RED, 0, anchor='ls', shadow=.5); draw_text(bg, (x0 + w1 + 18, yy), s, f2, WHITE, -1, anchor='ls', shadow=.5)
        for k in range(3): d.ellipse((W / 2 - 40 + k * 32, yy + 30, W / 2 - 28 + k * 32, yy + 42), fill=RED if k < len(tells) else (90, 86, 82))
    if label: draw_text(bg, (W / 2, 240), label, font('semi', 40), DIM, -1, shadow=.5)
    return bg
def scroll_scene(t):
    bg = graded(t).filter(ImageFilter.GaussianBlur(28)); bg = Image.fromarray((np.asarray(bg) * .38).astype(np.uint8))
    c = Image.fromarray(raw(t)).copy(); cheap_caps(c, ['IS', 'AI'], 1, 1150); a = phone(c); b = phone(Image.fromarray(raw(2.0)).copy())
    paste_card(bg, a, ((W - 600) // 2, 300 - 900), 64); paste_card(bg, b, ((W - 600) // 2, 300 + 1240 + 40 - 900), 64)
    draw_text(bg, (W / 2, 250), 'people can tell. scroll.', font('disp', 56), WHITE, -2, shadow=.6)
    return bg
def type_scene(text, red=None, sub=None):
    im = Image.new('RGB', (W, H), (10, 9, 9)); g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).ellipse((-300, 400, 1380, 1600), fill=40)
    im.paste(Image.new('RGB', (W, H), (50, 34, 28)), (0, 0), g.filter(ImageFilter.GaussianBlur(240)))
    f = font('disp', 170); parts = text.split(' '); ws = [text_w(p, f, -6) for p in parts]; x = W / 2 - (sum(ws) + 40 * (len(ws) - 1)) / 2
    for p, w in zip(parts, ws): draw_text(im, (x, 1010), p, f, RED if red and p.strip('.') == red else WHITE, -6, anchor='ls', shadow=0); x += w + 40
    if sub: draw_text(im, (W / 2, 1110), sub, font('semi', 44), DIM, -1, shadow=0)
    return im
def button(im, y=1080):
    d = ImageDraw.Draw(im); d.rounded_rectangle((230, y, 850, y + 104), 52, fill=RED); draw_text(im, (W / 2, y + 68), 'Learn the workflow  →', font('disp', 44), WHITE, -1, shadow=0)
def end_card(t):
    bg = graded(t).filter(ImageFilter.GaussianBlur(30)); bg = Image.fromarray((np.asarray(bg) * .3).astype(np.uint8))
    draw_text(bg, (W / 2, 820), 'Vibe Editing', font('disp', 130), WHITE, -5, shadow=0)
    draw_text(bg, (W / 2, 900), 'make videos nobody can tell are AI', font('semi', 40), DIM, -1, shadow=0)
    button(bg, 980); draw_text(bg, (W / 2, 1150), '[your-url.com]', font('mono', 32), DIM, 0, shadow=0); return bg
OS = lambda i: wd[i]['os']
P = []
im = graded(OS(5), 1.02); cap(im, 'I can tell in', '3 seconds.', '3'); P.append((0, 'PREMIUM · HOOK',
  'I can tell in 3 seconds if AI edited your video,', 'Opens on you, real room, graded: warm and moody, the wall falling into shadow. Slow 2 % push. Captions in white bold sans on the dark wall above your head, never over your face; "3" in red.', im))
P.append((11, 'PHONE · TELL 01', 'captions in the middle of the screen, jumping on every word,', 'A phone slides up over a darkened, blurred version of the shot, playing the "usual AI edit": your ungraded take with bouncing yellow captions. Below it: red "01" + "captions jumping". Generic Reels UI, no logos.',
  phone_scene(OS(17), ['JUMPING', 'ON'], 0, [('01', 'captions jumping')], label='the usual AI edit')))
P.append((21, 'PHONE · TELL 02', 'a zoom on every line,', 'Inside the phone the video snaps into a cheap auto-zoom on "zoom". Label changes to "02 · zoom on every line".', phone_scene(OS(22), ['ZOOM', 'ON'], 0, [('01', ''), ('02', 'zoom on every line')], z=1.22, label='the usual AI edit')))
P.append((26, 'PHONE · TELL 03', 'the same stock music at the end,', 'A "trending audio" sticker appears in the phone UI, and the cheap stock track plays faintly from the phone. "03 · same stock music".', phone_scene(OS(28), ['STOCK', 'MUSIC'], 0, [('01', ''), ('02', ''), ('03', 'same stock music')], audio=True, label='the usual AI edit')))
P.append((33, 'PHONE · THE SCROLL', 'Sound familiar? Then people can tell your video is AI too.', 'On "AI too" a thumb-flick scrolls the phone: the reel slides up and away and the next one comes in. "people can tell." in white.', scroll_scene(OS(42))))
im = graded(OS(45), 1.04); cap(im, 'now watch', 'this.', 'this'); P.append((44, 'THE SWITCH', 'Now watch this,', 'Hard cut to full-screen you, graded. The music fades in here (calm premium bed). Half a beat of breathing room before the next line.', im))
im = graded(OS(50), 1.06); cap(im, 'this is an', 'AI edit too.', 'AI'); P.append((47, 'PREMIUM', 'This is an AI edit too.', 'Slow, smooth push-in continues. Two-line caption builds word by word (soft 6-frame fade-up, no bounce).', im))
im = graded(OS(56), 1.14, -.06); cap(im, 'try to find', 'one sign.', 'one'); P.append((53, 'PREMIUM · CLOSE-UP', 'Try to find one sign.', 'One eased punch-in to a tighter frame (max 1.15× so the footage stays sharp). "one" in red.', im))
P.append((58, 'TYPE MOMENT', "It's the same AI.", 'The only full-screen graphic beat #1: a near-black frame with "same AI." in big white bold, the period in red. Your voice carries over it.', type_scene('same AI.', sub=None)))
im = graded(OS(64), 1.06); cap(im, 'the difference is', 'what I taught it.', 'taught'); P.append((62, 'PREMIUM', 'The difference is what I taught it.', 'Back to you, medium framing. "taught" in red.', im))
im = graded(OS(72), 1.08); cap(im, "that's what", "I'll teach you.", 'you'); P.append((69, 'PREMIUM', "That's what I will teach you.", 'Slight push. "you" in red.', im))
im = graded(OS(77), 1.08); cap(im, 'the link is below', None); button(im, 480); P.append((75, 'CTA', 'The link is below.', 'Red pill button "Learn the workflow →" fades and scales up softly under the caption, with a small arrow pointing down to Meta\'s button.', im))
P.append((None, 'END CARD', '(music resolves)', 'A 2 s end card over a dark, blurred version of your shot: "Vibe Editing", the tagline, the red button and your URL. No frozen face.', end_card(OS(77))))
# ---------------- sheets ----------------
BG = (14, 13, 12); tot = e['nframes'] / 30
starts = [wd[p[0]]['os'] if p[0] is not None else e['speech'] for p in P]
def wrap(d, txt, f, w):
    out, line = [], ''
    for word in txt.split():
        t = (line + ' ' + word).strip()
        if d.textlength(t, font=f) > w and line: out.append(line); line = word
        else: line = t
    return out + [line]
SEC = {'PREMIUM': (255, 255, 255), 'PHONE': (170, 165, 160), 'THE SWITCH': RED, 'TYPE': RED, 'CTA': RED, 'END': RED}
PW, PH, CW, CH, PAD = 360, 640, 1060, 700, 40
os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
for s in range(0, len(P), 6):
    ch = list(range(s, min(s + 6, len(P)))); rows = (len(ch) + 1) // 2
    S = Image.new('RGB', (2 * CW + PAD, rows * CH + 170), BG); d = ImageDraw.Draw(S)
    draw_text(S, (PAD, 105), 'AD 4 v2  ·  I can tell in 3 seconds', font('disp', 64), WHITE, -2, anchor='ls', shadow=0)
    draw_text(S, (PAD + 1240, 100), f'panels {ch[0] + 1}–{ch[-1] + 1} of {len(P)}  ·  ~{tot:.0f} s', font('mono', 26), DIM, 0, anchor='ls', shadow=0)
    for j, i in enumerate(ch):
        _, sec, vo, desc, img = P[i]; x = PAD + (j % 2) * CW; y = 160 + (j // 2) * CH
        img = img.resize((PW, PH)); S.paste(img, (x, y), rounded(img, 24)); c = next(v for k, v in SEC.items() if sec.startswith(k))
        end = starts[i + 1] if i + 1 < len(P) else tot; tx = x + PW + 36
        draw_text(S, (tx, y + 52), f'{i + 1:02d}', font('disp', 56), c, -2, anchor='ls', shadow=0)
        draw_text(S, (tx + 100, y + 48), f'{starts[i]:.1f} – {end:.1f} s', font('mono', 28), (200, 190, 180), 0, anchor='ls', shadow=0)
        draw_text(S, (tx, y + 100), sec, font('disp', 26), c, 1, anchor='ls', shadow=0)
        yy = y + 160
        for ln in wrap(d, '“' + vo + '”', font('semi', 36), 600): draw_text(S, (tx, yy), ln, font('semi', 36), WHITE, -1, anchor='ls', shadow=0); yy += 46
        yy += 16
        for ln in wrap(d, desc, font('med', 27), 610): draw_text(S, (tx, yy), ln, font('med', 27), (190, 182, 174), 0, anchor='ls', shadow=0); yy += 38
    S.save(f'{OUT}_{s // 6 + 1}.png'); print('sheet', s // 6 + 1)

"""Storyboards for Ads 2–6: real composites of each take in the Ink, Paper & Ember look.
usage: python3 sb_ads.py ADS_SCRATCH ROOMS_DIR OUT_DIR"""
import sys, os, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(ROOT, 'ad1'))
from look import *
SC, RD, OUT = sys.argv[1:4]; os.makedirs(OUT, exist_ok=True)
ROOM = {'ad2': 'living_11', 'ad3': 'study_23', 'ad4': 'lounge_11', 'ad5': 'curtain_11', 'ad6': 'living_11'}
GOLDGLOW = (GOLD, .55, 18)
def words(ad):
    e = json.load(open(f'{ROOT}/{ad}/edl.json')); return e
def tr(ad):
    return json.load(open(f"{SC}/tr/{open(f'{ROOT}/{ad}/SOURCE_ID').read().strip()}.json"))
def T_of(ad, i): w = tr(ad)[i]; return round((w['s'] + w['e']) / 2, 2)
def fg(ad, i): return Image.open(f'{SC}/sbm/{ad}/fg_{T_of(ad, i)}.png')
def rawp(ad, i): return f'{SC}/sbm/{ad}/raw_{T_of(ad, i)}.png'
def head_raw(im):
    a = np.asarray(im)[:, :, 3]; rows = np.nonzero((a[:, 200:520] > 128).sum(1) > 8)[0]; return int(rows.min()) if len(rows) else 430
def face_raw(im):
    a = np.asarray(im)[:, :, 3]; top = head_raw(im); return top + 150
def cam(z, sy, fy, sx=540): k = 1.5 * z; return dict(z=z, fx=360, fy=fy, sx=sx, sy=max(sy, H - (1280 - fy) * k), face_dy=-40)
def prem(ad, i, z=1.08, face_at=880, behind=None, front=None, sx=540):
    f = fg(ad, i); fy = face_raw(f); c = cam(z, face_at, fy, sx); c['top'] = c['sy'] + (head_raw(f) - fy) * 1.5 * z
    bg = cinematic_set(f'{RD}/{ROOM[ad]}.png', c)
    if behind: behind(bg, c)
    im, _ = place_subject(bg, f, c); im = vignette(grain(im, .035, 5), .5)
    if front: front(im, c)
    return im
def two_tone(im, parts, y, cx=W // 2, gap=18):
    fs = [(s, font(fn, sz), col, tr_, gl) for s, fn, sz, col, tr_, gl in parts]
    tot = sum(text_w(s, f, t) for s, f, _, t, _ in fs) + gap * (len(fs) - 1); x = cx - tot / 2
    for s, f, col, t, gl in fs: x += draw_text(im, (x, y), s, f, col, t, anchor='ls', glow=gl) + gap
def cap(im, small, big=None, y1=1110, y2=1238, gold=True, bigsize=150):
    draw_text(im, (W / 2, y1), small, font('disp', 62), CREAM, -2)
    if big: draw_text(im, (W / 2, y2), big, font('serif', bigsize), GOLD if gold else CREAM, glow=GOLDGLOW if gold else None)
def generic(im, words_, hi, y=1150, size=92):
    d = ImageDraw.Draw(im); fs = [font('generic', size + (14 if i == hi else 0)) for i in range(len(words_))]
    ws = [f.getlength(w) for f, w in zip(fs, words_)]; x = W / 2 - (sum(ws) + 26 * (len(ws) - 1)) / 2
    for i, (w, f) in enumerate(zip(words_, fs)):
        d.text((x, y), w, font=f, fill=(255, 225, 40) if i == hi else (255, 255, 255), anchor='ls', stroke_width=8, stroke_fill=(0, 0, 0)); x += ws[i] + 26
def spec(ad, i, label, chips, cw, hi, extra=None, card_label=None):
    """Part-1 specimen: the raw take inside a card on ink, clearly labelled as the typical output."""
    im = Image.new('RGB', (W, H), (12, 11, 10)); d = ImageDraw.Draw(im)
    g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).ellipse((-200, 200, 1280, 1700), fill=60); im.paste(Image.new('RGB', (W, H), (40, 34, 30)), (0, 0), g.filter(ImageFilter.GaussianBlur(200)))
    draw_text(im, (W / 2, 338), label, font('disp', 58), CREAM, -2)
    x = W / 2 - 430
    for k, lab in enumerate(chips):
        s = f'0{k + 1}  {lab}'; w = text_w(s, font('monob', 24), 1) + 44
        d.rounded_rectangle((x, 384, x + w, 430), 23, outline=EMBER, width=2); draw_text(im, (x + 22, 416), s, font('monob', 24), (243, 179, 142), 1, anchor='ls', shadow=0); x += w + 14
    card = raw_frame(rawp(ad, i)); generic(card, cw, hi)
    if extra: extra(card)
    paste_card(im, card.resize((760, 1351)), (160, 470), 36)
    if card_label: draw_text(im, (186, 520), card_label, font('monob', 22), CREAM, 2, anchor='ls', shadow=.5)
    return im
def paper(h1, h2, card_h=760, y=600, seed=11):
    im = paper_bg(seed); draw_text(im, (W / 2, 400), h1, font('disp', 82), INK, -3, shadow=0)
    if h2: draw_text(im, (W / 2, 520), h2, font('serif', 128), EMBER, 0, shadow=0)
    if card_h: paste_card(im, Image.new('RGB', (900, card_h), CARD), (90, y), 48)
    return im, ImageDraw.Draw(im), (90, y, 990, y + card_h)
def pill(d, im, x, y, text, fill=(40, 37, 35), ink=CREAM, size=32, outline=(72, 66, 61), f='semi', r=None):
    w = text_w(text, font(f, size), -1) + 60; h = size + 34
    d.rounded_rectangle((x, y, x + w, y + h), r or h // 2, fill=fill, outline=outline, width=2); draw_text(im, (x + 30, y + h / 2 + size * .36), text, font(f, size), ink, -1, anchor='ls', shadow=0); return w
def button(im, y=1146, label='Learn the workflow  →'):
    sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).rounded_rectangle((210, y - 48, 870, y + 64), 56, fill=200)
    im.paste(Image.new('RGB', (W, H), EMBER), (0, 0), sh.filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v * .5)))
    ImageDraw.Draw(im).rounded_rectangle((210, y - 56, 870, y + 56), 56, fill=EMBER); draw_text(im, (W / 2, y + 17), label, font('disp', 46), INK, -1, shadow=0)
def end_card(ad, i):
    im = paper_bg(21); draw_text(im, (W / 2, 312), 'THE WORKFLOW', font('monob', 24), EMBER, 8, shadow=0)
    two_tone(im, [('Vibe', 'serif', 150, EMBER, 0, None), ('Editing', 'disp', 124, INK, -5, None)], 420)
    after = prem(ad, i, 1.12, 860).resize((340, 604)); paste_card(im, after, (370, 462), 32)
    d = ImageDraw.Draw(im); d.rounded_rectangle((388, 480, 492, 518), 19, fill=(17, 15, 14)); d.ellipse((402, 493, 414, 505), fill=EMBER)
    draw_text(im, (422, 507), 'after', font('semi', 22), CREAM, 0, anchor='ls', shadow=0)
    button(im, 1140); draw_text(im, (W / 2, 1240), 'make videos nobody can tell are AI', font('mono', 26), (111, 102, 95), 0, shadow=0)
    return im
def switch(ad, i, cap_parts):
    im = paper_bg(7); after = prem(ad, i, 1.0, 900); before = ImageOps.grayscale(raw_frame(rawp(ad, i))).convert('RGB')
    paste_card(im, before.resize((380, 676)), (60, 700), 36); paste_card(im, after.resize((590, 1049)), (430, 470), 44)
    draw_text(im, (64, 676), 'before', font('semi', 46), MUTED, -1, anchor='ls', shadow=0)
    d = ImageDraw.Draw(im); d.ellipse((434, 404, 452, 422), fill=EMBER); draw_text(im, (466, 440), 'after', font('disp', 86), INK, -3, anchor='ls', shadow=0)
    two_tone(im, cap_parts, 1440, cx=430 + 295); return im
def split(ad, i, draw_top, z=1.25):
    """Reference-style split: UI panel on top, the speaker (premium) below."""
    im = prem(ad, i, z, 1240); top = Image.new('RGB', (W, 900), CARD); draw_top(top); m = Image.new('L', (W, 900), 255)
    g = np.linspace(255, 0, 140).astype(np.uint8); ma = np.asarray(m).copy(); ma[-140:] = g[:, None]; im.paste(top, (0, 0), Image.fromarray(ma)); return im
def bubble(im, x, y, name, text, w=760, alpha=1.0, light=False):
    d = ImageDraw.Draw(im); bg = (255, 255, 255) if light else (44, 41, 39); ink = INK if light else CREAM
    d.rounded_rectangle((x, y, x + w, y + 116), 30, fill=bg); d.ellipse((x + 22, y + 26, x + 86, y + 90), fill=(150, 120, 100) if not light else (220, 200, 185))
    draw_text(im, (x + 54, y + 70), name[0].upper(), font('disp', 32), (30, 26, 24), 0, shadow=0)
    draw_text(im, (x + 108, y + 52), name, font('semi', 26), MUTED, 0, anchor='ls', shadow=0); draw_text(im, (x + 108, y + 94), text, font('semi', 36), ink, -1, anchor='ls', shadow=0)
def nodes_card(im, d, box, labels=('Transcript', 'Cut', 'Matte', 'Type', 'Camera', 'Grade', 'Sound'), step=116):
    x0, y0 = box[0], box[1]; pts = [(x0 + (110 if i % 2 == 0 else 430), y0 + 60 + i * step) for i in range(len(labels))]
    for i in range(len(pts) - 1):
        (ax, ay), (bx, by) = pts[i], pts[i + 1]; seg = [(ax + 180 + (bx - ax) * u, ay + 34 + (by - ay) * (3 * u * u - 2 * u ** 3)) for u in np.linspace(0, 1, 24)]
        d.line(seg, fill=EMBER, width=3)
    for i, (n, (nx, ny)) in enumerate(zip(labels, pts)):
        d.rounded_rectangle((nx, ny, nx + 360, ny + 70), 35, fill=(40, 37, 35), outline=(72, 66, 61), width=2)
        draw_text(im, (nx + 30, ny + 47), f'{i + 1:02d}', font('monob', 24), EMBER, 0, anchor='ls', shadow=0); draw_text(im, (nx + 86, ny + 48), n, font('semi', 34), CREAM, -1, anchor='ls', shadow=0)
# ============================== AD 2 · Which part is AI? ==============================
def ad2():
    a = 'ad2'; P = []
    P.append((0, 'PREMIUM · HOOK', "Let's play a game.", 'Relit A-roll from frame one: no "before" here, the whole ad is the proof. Huge "GAME" sits behind your head, "a game." lands in gold. Slow push.',
              prem(a, 1, 1.08, 880, behind=lambda bg, c: draw_text(bg, (W / 2, c['top'] + 120), 'GAME', font('black', 330), CREAM, -12, shadow=.2), front=lambda im, c: two_tone(im, [("let's play", 'disp', 62, CREAM, -2, None), ('a game.', 'serif', 150, GOLD, 0, GOLDGLOW)], 1238))))
    def quiz(top):
        d = ImageDraw.Draw(top); draw_text(top, (W / 2, 380), 'which part did AI edit?', font('disp', 64), CREAM, -2, shadow=0)
        for k, (l, t) in enumerate([('A', 'the captions'), ('B', 'the cuts'), ('C', 'the room')]):
            y = 450 + k * 120; d.rounded_rectangle((150, y, 930, y + 96), 48, fill=(40, 37, 35), outline=(72, 66, 61), width=2)
            d.ellipse((172, y + 18, 232, y + 78), fill=EMBER); draw_text(top, (202, y + 60), l, font('disp', 34), INK, 0, shadow=0); draw_text(top, (262, y + 62), t, font('semi', 40), CREAM, -1, anchor='ls', shadow=0)
    P.append((4, 'SPLIT · QUIZ', 'Which part of this video did AI edit?', 'Split screen (reference r8): a quiz card slides down over the top half with three answers, A the captions, B the cuts, C the room. Your face stays live below.', split(a, 8, quiz)))
    def scan(im, c):
        d = ImageDraw.Draw(im); fx, fy, s = 540, c['sy'] - 30, 360
        for sx_, sy_ in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
            x0, y0 = fx + sx_ * s / 2, fy + sy_ * s * .62; d.line([(x0, y0), (x0 - sx_ * 48, y0)], fill=GOLD, width=3); d.line([(x0, y0), (x0, y0 - sy_ * 48)], fill=GOLD, width=3)
        draw_text(im, (W / 2, 1150), 'SCANNING FOR AI  ·  0.3 s', font('monob', 26), GOLD, 4); cap(im, '', 'watch closely.', y2=1245, bigsize=130)
    P.append((12, 'PREMIUM · THE BEAT', 'Watch closely.', 'Eased punch-in to a close-up, gold scanning brackets settle, mono readout. A 1-second held beat (music only) so the viewer actually looks.', prem(a, 13, 1.45, 700, front=scan)))
    def wrong(bg, c): draw_text(bg, (W / 2, c['top'] + 130), 'WRONG.', font('black', 260), EMBER, -10, shadow=.25)
    P.append((14, 'PREMIUM · THE TURN', 'Wrong.', 'Hard cut with a soft impact: "WRONG." in ember, huge, behind your head. The quiz answers flash back for a beat with all three ticked.', prem(a, 14, 1.12, 880, behind=wrong)))
    P.append((15, 'PREMIUM', 'The whole video is edited by AI.', 'Kinetic two-line caption, "whole" in gold serif. Slow push continues.', prem(a, 17, 1.08, 880, front=lambda im, c: (cap(im, 'the', None), two_tone(im, [('whole', 'serif', 150, GOLD, 0, GOLDGLOW), ('video.', 'serif', 150, CREAM, 0, None)], 1238)))))
    def caps(im, c):
        y = 980
        for k, (s, fn, sz, col) in enumerate([('every caption', 'disp', 76, CREAM), ('every caption', 'serif', 88, GOLD), ('EVERY CAPTION', 'black', 70, CREAM)]):
            draw_text(im, (W / 2, y + k * 96), s, font(fn, sz), col, -2, glow=GOLDGLOW if col == GOLD else None)
    P.append((22, 'PREMIUM · PROOF 1', 'Every caption,', 'The words "every caption" re-set themselves three times in three type styles as you say it: proof that each caption is designed.', prem(a, 23, 1.1, 860, front=caps)))
    def cutstrip(im, c):
        d = ImageDraw.Draw(im); d.rounded_rectangle((90, 1010, 990, 1110), 18, fill=(24, 22, 21))
        for k in range(14): d.rounded_rectangle((110 + k * 62, 1030, 160 + k * 62, 1090), 8, fill=(70 + (k % 3) * 25, 55, 45))
        for k in [3, 7, 10]: d.line([(108 + k * 62 + 52, 996), (108 + k * 62 + 52, 1124)], fill=EMBER, width=4)
        draw_text(im, (W / 2, 1220), 'every cut,', font('serif', 130), GOLD, glow=GOLDGLOW)
    P.append((24, 'PREMIUM · PROOF 2', 'every cut,', 'A thin timeline strip slides in; ember cut-marks snap in on the beat of each real jump cut.', prem(a, 25, 1.1, 860, front=cutstrip)))
    def peel(im, c):
        r = raw_frame(rawp(a, 29)); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((0, 0, 540, H), fill=255)
        im.paste(r, (0, 0), m); d = ImageDraw.Draw(im); d.line([(540, 0), (540, H)], fill=CREAM, width=4)
        draw_text(im, (270, 330), 'real wall', font('monob', 26), INK, 3, shadow=0); draw_text(im, (810, 330), 'AI room', font('monob', 26), CREAM, 3)
        cap(im, 'even the room', 'behind me.', bigsize=140)
    P.append((26, 'PREMIUM · PROOF 3 (the reveal)', 'even the room behind me.', 'A vertical wipe slides across: left of the line is your real cream wall, right is the AI room. It sweeps back, the room returns. The strongest proof in the ad.', prem(a, 29, 1.08, 880, front=peel)))
    im, d, box = paper('most AI edits are', 'easy to spot.', 820)
    for k in range(3):
        x = box[0] + 50 + k * 275; c_ = raw_frame(rawp(a, 33)).resize((250, 444)); generic(c_, ['SAME'], 0, y=300, size=40); im.paste(c_, (x, box[1] + 60), rounded(c_, 20))
        d.ellipse((x + 40, box[1] + 260, x + 210, box[1] + 330), outline=(232, 70, 60), width=5)
    draw_text(im, (W / 2, box[1] + 600), 'bouncing captions · auto-zoom · stock music', font('mono', 26), MUTED, 0, shadow=0)
    P.append((31, 'MOTION GRAPHIC', 'Most AI edits are easy to spot.', 'Paper card: three identical template reels side by side, each with the same tell circled in red-ember marker strokes that draw on.', im))
    P.append((38, 'PREMIUM', "Mine aren't.", 'Back to you, eased punch-in. "Mine" in big gold serif, "aren\'t." small. Music lifts.', prem(a, 38, 1.22, 820, front=lambda im, c: two_tone(im, [('Mine', 'serif', 190, GOLD, 0, GOLDGLOW), ("aren't.", 'disp', 70, CREAM, -2, None)], 1230))))
    im, d, box = paper('everyone has', 'the same tools.', 760)
    for k, t in enumerate(['AI captions', 'auto-zoom', 'templates', 'stock music']):
        y = box[1] + 70 + k * 150; pill(d, im, box[0] + 60, y, t, size=40); pill(d, im, box[0] + 470, y, t, size=40)
    draw_text(im, (W / 2, box[3] - 40), 'SAME  ·  SAME  ·  SAME', font('monob', 26), MUTED, 6, shadow=0)
    P.append((40, 'MOTION GRAPHIC', 'Everyone has the same tools.', 'Two identical columns of tool chips mirror each other, the same toolset on both sides.', im))
    im, d, box = paper('not everyone has', 'the workflow.', 880); nodes_card(im, d, box)
    P.append((45, 'MOTION GRAPHIC', 'Not everyone has the workflow.', 'Horizontal push to the next card: the 7-step workflow builds itself on an ember line, with a gold pulse running through it (same graphic as Ad 1, for brand continuity).', im))
    P.append((50, 'CTA', 'Want my workflow? The link is below.', 'A-roll. "want my" then "workflow?" in gold, then the ember button springs in with chevrons pointing to the Meta button.', prem(a, 56, 1.05, 860, front=lambda im, c: (draw_text(im, (W / 2, 1050), 'the link is below', font('disp', 60), CREAM, -2), button(im, 1146)))))
    P.append((None, 'END CARD', '(music resolves)', 'Same end card system as Ad 1: wordmark, a live loop of the after-shot, button.', end_card(a, 17)))
    return P
# ============================== AD 3 · I got that comment ==============================
def ad3():
    a = 'ad3'; P = []
    P.append((0, 'PART 1 · MY FIRST AI EDIT', 'The first time I edited a video with AI,', 'Your take plays inside a specimen card on ink, labelled "my first AI edit": the flat, generic look with yellow auto-captions. Never full screen.',
              spec(a, 3, 'my first AI edit', ['auto-captions', 'auto-zoom'], ['EDITED', 'A'], 0, card_label='2024 · EXPORT_FINAL.mp4')))
    def comment(card):
        bubble(card, 120, 1320, 'user_2931', 'this is AI, right?', 840, light=True)
    P.append((9, 'PART 1 · THE COMMENT', 'someone commented, "this is AI, right?"', 'An Instagram-style comment slides up over the card and lands with a soft pop. Typing dots first, then the text.', spec(a, 11, 'my first AI edit', ['auto-captions', 'auto-zoom'], ['THIS', 'IS', 'AI'], 2, extra=comment)))
    def comments(card):
        for k, (n, t) in enumerate([('user_2931', 'this is AI, right?'), ('kay.edits', 'AI edit lol'), ('mr_frames', 'looks so generic')]):
            bubble(card, 120, 1100 + k * 150, n, t, 840, light=True)
    P.append((15, 'PART 1', 'It hurt. But they were right. The videos looked cheap at that time.', 'More comments stack up. On "cheap" the card desaturates and the background dims. An honest moment, kept restrained.', spec(a, 24, 'my first AI edit', ['auto-captions', 'auto-zoom'], ['LOOKED', 'CHEAP'], 1, extra=comments)))
    im, d, box = paper('I stopped', 'changing tools.', 700)
    for k, t in enumerate(['tool #1', 'tool #2', 'tool #3', 'tool #4']):
        y = box[1] + 60 + k * 150; w = pill(d, im, box[0] + 80, y, t, size=40); d.line([(box[0] + 70, y + 37), (box[0] + 90 + w, y + 37)], fill=EMBER, width=5)
    draw_text(im, (box[2] - 60, box[1] + 420), 'swap, swap, swap…', font('serif', 64), MUTED, 0, anchor='rs', shadow=0)
    P.append((28, 'MOTION GRAPHIC', 'So I stopped changing tools,', 'Paper card: tool chips shuffle in and out like a slot machine, then each gets struck through in ember.', im))
    im, d, box = paper('I changed', 'how I use them.', 880); nodes_card(im, d, box)
    P.append((33, 'MOTION GRAPHIC', 'I changed how I use them.', 'Push to the workflow card: the 7 steps build in with a pulse running through, so the change is a method, not a tool.', im))
    P.append((39, 'THE SWITCH', 'Now watch this,', 'Before/after on paper: the black-and-white "before" card on the left, the big relit "after" card on the right. Then a push into the "after" card to full screen. Music drops in.',
              switch(a, 40, [('now watch', 'disp', 50, CREAM, -1, None), ('this.', 'serif', 84, GOLD, 0, (GOLD, .5, 12))])))
    def good(im, c):
        for k, (n, t) in enumerate([('jules.mp4', 'who edits your videos??'), ('arjun.creates', 'this edit is insane'), ('studio.nine', 'what software is this')]):
            bubble(im, 150 + (k % 2) * 60, 300 + k * 140, n, t, 720)
        cap(im, 'nobody says', 'this is AI.', bigsize=140)
    P.append((42, 'PREMIUM · THE FLIP', 'nobody says this is AI.', 'Relit full screen. The comments come back, this time the opposite: "who edits your videos??" float up softly on the left. (These are illustrative; the end card says so.)', prem(a, 44, 1.08, 880, front=good)))
    P.append((47, 'PREMIUM', 'People ask me who my editor is,', '"editor?" in huge serif sits behind your head, a question mark that slowly drifts.', prem(a, 49, 1.12, 880, behind=lambda bg, c: draw_text(bg, (W / 2, c['top'] + 110), 'editor?', font('serif', 300), CREAM, 0, shadow=.2), front=lambda im, c: cap(im, 'people ask me who my', None))))
    P.append((54, 'PREMIUM', 'so… I am.', 'Eased punch-in on "I am." Gold serif, a held breath.', prem(a, 55, 1.35, 760, front=lambda im, c: draw_text(im, (W / 2, 1230), 'I am.', font('serif', 230), GOLD, glow=GOLDGLOW))))
    def tl(im, c):
        d = ImageDraw.Draw(im); d.rounded_rectangle((90, 1000, 990, 1090), 18, fill=(24, 22, 21))
        for k in range(14): d.rounded_rectangle((110 + k * 62, 1018, 160 + k * 62, 1072), 8, fill=(80, 62, 50))
        d.line([(90, 1045), (990, 1045)], fill=EMBER, width=5); cap(im, '', 'no timeline.', bigsize=130)
    P.append((57, 'PREMIUM', "I just don't sit on a timeline.", 'A timeline strip slides in, gets struck through in ember, and slides away.', prem(a, 60, 1.1, 860, front=tl)))
    P.append((64, 'CTA', 'And this is exactly what I teach, and the link is below.', '"exactly what I teach" then the ember button with chevrons.', prem(a, 74, 1.05, 860, front=lambda im, c: (draw_text(im, (W / 2, 1050), 'exactly what I teach', font('disp', 60), CREAM, -2), button(im, 1146)))))
    P.append((None, 'END CARD', '(music resolves)', 'End card. Small mono disclaimer: "comments shown are illustrative" (Meta policy safe).', end_card(a, 44)))
    return P
# ============================== AD 4 · I can tell in 3 seconds ==============================
def ad4():
    a = 'ad4'; P = []
    def timer(card):
        d = ImageDraw.Draw(card); d.ellipse((830, 200, 1010, 380), outline=EMBER, width=10); draw_text(card, (920, 330), '3', font('disp', 120), CREAM, -2)
    P.append((0, 'PART 1 · HOOK', 'I can tell in 3 seconds if AI edited your video,', 'Specimen card labelled "everyone\'s AI edit", with a 3-second countdown ring ticking 3 · 2 · 1 in the corner (reference r4/r8 big-number energy).', spec(a, 2, "everyone's AI edit", [], ['3', 'SECONDS'], 0, extra=timer)))
    P.append((11, 'PART 1 · TELL 01', 'captions in the middle of the screen, jumping on every word,', 'Tell chip 01 "bouncing captions" pops above the card while the caption bounces.', spec(a, 16, "everyone's AI edit", ['bouncing captions'], ['MIDDLE', 'OF'], 0)))
    P.append((21, 'PART 1 · TELL 02', 'a zoom on every line,', 'Tell chip 02 "auto-zoom" while the card does a hard snap-zoom.', spec(a, 22, "everyone's AI edit", ['bouncing captions', 'auto-zoom'], ['ZOOM', 'ON'], 0)))
    def music(card):
        d = ImageDraw.Draw(card); d.rounded_rectangle((120, 1300, 960, 1440), 30, fill=(255, 255, 255))
        for k in range(40): h = 20 + 50 * abs(np.sin(k * .7)); d.rectangle((330 + k * 15, 1370 - h / 2, 338 + k * 15, 1370 + h / 2), fill=(30, 30, 30))
        draw_text(card, (160, 1388), '♪ stock_04', font('monob', 30), INK, 0, anchor='ls', shadow=0)
    P.append((26, 'PART 1 · TELL 03', 'the same stock music at the end,', 'Tell chip 03 "stock music"; a cheap audio-player bar with a waveform appears on the card.', spec(a, 28, "everyone's AI edit", ['bouncing captions', 'auto-zoom', 'stock music'], ['STOCK', 'MUSIC'], 0, extra=music)))
    def detected(card):
        d = ImageDraw.Draw(card); d.rounded_rectangle((240, 300, 840, 420), 60, fill=(232, 70, 60)); draw_text(card, (540, 382), 'AI DETECTED', font('black', 64), (255, 255, 255), 2, shadow=0)
    P.append((33, 'PART 1 · VERDICT', 'Sound familiar? Then people can tell your video is AI too.', 'All three chips light up; an "AI DETECTED" stamp lands on the card; then the card is swiped off like a scroll.', spec(a, 39, "everyone's AI edit", ['bouncing captions', 'auto-zoom', 'stock music'], ['IS', 'AI'], 1, extra=detected)))
    P.append((44, 'THE SWITCH', 'Now watch this,', 'Before/after cards on paper, then the push into "after". Music drops in.', switch(a, 45, [('now watch', 'disp', 50, CREAM, -1, None), ('this.', 'serif', 84, GOLD, 0, (GOLD, .5, 12))])))
    P.append((47, 'PREMIUM', 'This is an AI edit too.', 'Relit full screen; "AI edit" in big caps behind your head, "too." in gold.', prem(a, 50, 1.08, 880, behind=lambda bg, c: draw_text(bg, (W / 2, c['top'] + 120), 'AI EDIT', font('black', 250), CREAM, -10, shadow=.2), front=lambda im, c: draw_text(im, (W / 2, 1230), 'too.', font('serif', 190), GOLD, glow=GOLDGLOW))))
    def zero(im, c):
        d = ImageDraw.Draw(im); fx, fy, s = 540, c['sy'] - 30, 360
        for sx_, sy_ in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
            x0, y0 = fx + sx_ * s / 2, fy + sy_ * s * .62; d.line([(x0, y0), (x0 - sx_ * 48, y0)], fill=GOLD, width=3); d.line([(x0, y0), (x0, y0 - sy_ * 48)], fill=GOLD, width=3)
        draw_text(im, (W / 2, 1110), 'try to find one sign', font('disp', 60), CREAM, -2); draw_text(im, (W / 2, 1238), '0 signs found', font('monob', 56), GOLD, 2, glow=GOLDGLOW)
    P.append((53, 'PREMIUM · CHALLENGE', 'Try to find one sign.', 'Punch-in to a close-up, gold scanner brackets, and a mono counter that scans and settles on "0 signs found".', prem(a, 55, 1.42, 700, front=zero)))
    im, d, box = paper("it's the same AI.", None, 700, y=520)
    for k in range(2):
        x = box[0] + 60 + k * 420; d.rounded_rectangle((x, box[1] + 60, x + 360, box[1] + 560), 30, fill=(40, 37, 35)); draw_text(im, (x + 180, box[1] + 300), 'AI', font('black', 160), CREAM, -6, shadow=0)
        draw_text(im, (x + 180, box[1] + 520), ['everyone', 'me'][k], font('mono', 30), MUTED, 0, shadow=0)
    draw_text(im, (W / 2, box[1] + 650), '=', font('disp', 80), EMBER, 0, shadow=0)
    P.append((58, 'MOTION GRAPHIC', "It's the same AI.", 'Two identical "AI" tiles labelled "everyone" and "me", with an ember equals sign between them.', im))
    im, d, box = paper('the difference is', 'what I taught it.', 820)
    lines = ['# vibe-editing.skill', 'captions: designed per phrase', 'camera: eased, motivated', 'grade: low-key, matched light', 'sound: minimal, ducked', 'never: templates']
    for k, l in enumerate(lines): draw_text(im, (box[0] + 60, box[1] + 100 + k * 100), l, font('mono', 38), EMBER if k == 0 else CREAM, 0, anchor='ls', shadow=0)
    P.append((62, 'MOTION GRAPHIC', 'The difference is what I taught it.', 'A skill file types itself line by line inside the dark card: the "teaching" made visible.', im))
    P.append((69, 'CTA', "That's what I'll teach you. The link is below.", 'A-roll; "I\'ll teach you." in gold, then the ember button.', prem(a, 77, 1.05, 860, front=lambda im, c: (draw_text(im, (W / 2, 1050), 'the link is below', font('disp', 60), CREAM, -2), button(im, 1146)))))
    P.append((None, 'END CARD', '(music resolves)', 'End card.', end_card(a, 50)))
    return P
# ============================== AD 5 · I used to say the same thing ==============================
def ad5():
    a = 'ad5'; P = []
    im = paper_bg(7); draw_text(im, (W / 2, 560), '“', font('serif', 360), EMBER, 0, shadow=0)
    draw_text(im, (W / 2, 760), "AI can't make", font('serif', 120), INK, 0, shadow=0); draw_text(im, (W / 2, 900), 'premium edits.', font('serif', 120), INK, 0, shadow=0)
    draw_text(im, (W / 2, 1010), '— me, a year ago', font('mono', 34), MUTED, 0, shadow=0)
    P.append((0, 'OPEN · QUOTE CARD', "AI can't make premium edits.", 'Cold open on paper: the line types on as a big serif quote while you say it. Your voice runs over the card, no face yet.', im))
    im = paper_bg(7); b = ImageOps.grayscale(raw_frame(rawp(a, 7))).convert('RGB').resize((560, 996)); paste_card(im, b, (260, 520), 40)
    draw_text(im, (W / 2, 420), 'I used to say that too.', font('disp', 66), INK, -2, shadow=0); draw_text(im, (300, 580), 'me, before', font('monob', 24), CREAM, 2, anchor='ls', shadow=.5)
    P.append((5, 'BEFORE', 'I used to say that too.', 'You appear small, black-and-white, in a card on paper: your untouched take, labelled "me, before".', im))
    P.append((11, 'THE SWITCH', 'Then I made this.', 'The card pushes in to full screen and blooms into the relit premium look. Music drops in.', prem(a, 13, 1.08, 880, front=lambda im, c: two_tone(im, [('then I made', 'disp', 60, CREAM, -2, None), ('this.', 'serif', 150, GOLD, 0, GOLDGLOW)], 1238))))
    def orbit(bg, c):
        for k, (s, x, y) in enumerate([('the', 250, c['top'] + 40), ('words', 430, c['top'] - 30), ('go', 640, c['top'] - 40), ('behind', 830, c['top'] + 40)]): draw_text(bg, (x, y), s, font('disp', 70), CREAM, -2, shadow=.3)
    P.append((15, 'PREMIUM · DEMO', 'The words go behind my head.', 'Words orbit over your head and sink behind it as you say it; the effect demonstrates itself. "head." lands in gold.', prem(a, 17, 1.1, 900, behind=orbit, front=lambda im, c: draw_text(im, (W / 2, 1230), 'my head.', font('serif', 170), GOLD, glow=GOLDGLOW))))
    def wire(im, c):
        d = ImageDraw.Draw(im); vp = (540, 820)
        for p in [(0, 260), (1080, 240), (0, 1700), (1080, 1720)]: d.line([p, vp], fill=(255, 240, 225), width=2)
        for x in (300, 780): d.line([(x, 0), (x, 520)], fill=(255, 240, 225), width=2)
        cap(im, 'this room', "doesn't exist.", bigsize=140)
    P.append((21, 'PREMIUM · DEMO', "This room doesn't exist.", 'The room dims to a white wireframe of its own geometry, then a vertical wipe shows your real cream wall for half a second.', prem(a, 22, 1.18, 820, front=wire)))
    def film(im, c):
        d = ImageDraw.Draw(im); d.rounded_rectangle((60, 960, 1020, 1100), 14, fill=(16, 14, 13))
        for k in range(9): d.rounded_rectangle((80 + k * 104, 980, 170 + k * 104, 1080), 8, fill=(90, 70, 55))
        draw_text(im, (W / 2, 1238), '0 frames touched', font('monob', 56), GOLD, 2, glow=GOLDGLOW)
    P.append((25, 'PREMIUM · DEMO', "And I didn't touch a single frame.", 'A film strip of your own frames slides across; a mono counter stays at "0 frames touched".', prem(a, 28, 1.1, 860, front=film)))
    P.append((32, 'PREMIUM', "AI isn't the problem.", '"AI" in huge chrome-white caps behind your head; "isn\'t the problem." in front.', prem(a, 33, 1.1, 900, behind=lambda bg, c: draw_text(bg, (W / 2, c['top'] + 140), 'AI', font('black', 420), CREAM, -14, shadow=.2), front=lambda im, c: cap(im, "isn't the", 'problem.', bigsize=140))))
    im = paper_bg(11); draw_text(im, (W / 2, 400), 'everyone uses it', font('disp', 82), INK, -3, shadow=0); draw_text(im, (W / 2, 520), 'the same way.', font('serif', 128), EMBER, 0, shadow=0)
    c_ = raw_frame(rawp(a, 40)).resize((260, 462)); generic(c_, ['SAME'], 0, y=300, size=44)
    for k in range(6): im.paste(c_, (90 + (k % 3) * 310, 600 + (k // 3) * 500), rounded(c_, 22))
    P.append((36, 'MOTION GRAPHIC', 'Everyone uses it the same way, so every video looks the same.', 'Paper grid of six identical template reels (reference r10 card layout), each stamped "SAME", popping in one by one.', im))
    def vibe(bg, c):
        draw_text(bg, (W / 2, 560), 'VIBE', font('black', 330), CREAM, -10, shadow=.2); draw_text(bg, (W / 2, c['top'] + 110), 'EDITING', font('black', 168), CREAM, 2, shadow=.2)
    P.append((48, 'PREMIUM · THE NAME', 'I built my own way, and I call it Vibe Editing.', '"VIBE / EDITING" huge behind your head (the Ad 1 signature). "my own way" then "Vibe Editing." in gold.', prem(a, 57, 1.05, 860, behind=vibe, front=lambda im, c: cap(im, 'I call it', 'Vibe Editing.', bigsize=130))))
    P.append((59, 'CTA', 'So if you want to learn it, the link is below.', 'Ember button with chevrons.', prem(a, 68, 1.05, 860, front=lambda im, c: (draw_text(im, (W / 2, 1050), 'the link is below', font('disp', 60), CREAM, -2), button(im, 1146)))))
    P.append((None, 'END CARD', '(music resolves)', 'End card.', end_card(a, 13)))
    return P
# ============================== AD 6 · Same question every day ==============================
def ad6():
    a = 'ad6'; P = []
    im = paper_bg(11); draw_text(im, (W / 2, 400), 'the same message', font('disp', 82), INK, -3, shadow=0); draw_text(im, (W / 2, 520), 'every day.', font('serif', 128), EMBER, 0, shadow=0)
    for k, n in enumerate(['jules.mp4', 'arjun.creates', 'studio.nine', 'kay.edits', 'mr_frames']): bubble(im, 120 + (k % 2) * 80, 600 + k * 140, n, 'who edits your videos?', 760, light=True)
    draw_text(im, (W / 2, 1335), '128 NEW MESSAGES', font('monob', 26), EMBER, 6, shadow=0)
    P.append((0, 'OPEN · DMs', 'I get the same message every day,', 'Paper DM inbox: identical messages "who edits your videos?" stack in fast from different (illustrative) usernames; a counter ticks up.', im))
    def dm(top):
        bubble(top, 160, 420, 'jules.mp4', 'who edits your videos?', 760, light=True); draw_text(top, (W / 2, 640), 'who edits your', font('disp', 66), CREAM, -2, shadow=0); draw_text(top, (W / 2, 770), 'videos?', font('serif', 140), GOLD, 0, glow=GOLDGLOW)
    P.append((7, 'SPLIT · THE QUESTION', 'who edits your videos?', 'Split screen: the DM bubble enlarges into the top half, with the question in big kinetic type; you below, relit.', split(a, 9, dm)))
    P.append((11, 'PREMIUM', 'So there is no editor.', '"editor" gets an ember strike-through as you say "no".', prem(a, 14, 1.08, 880, front=lambda im, c: (draw_text(im, (W / 2, 1110), 'there is no', font('disp', 62), CREAM, -2), draw_text(im, (W / 2, 1238), 'editor.', font('serif', 150), GOLD, glow=GOLDGLOW), ImageDraw.Draw(im).line([(330, 1195), (750, 1195)], fill=EMBER, width=8)))))
    def talk(top):
        d = ImageDraw.Draw(top)
        for k in range(26): h = 20 + 70 * abs(np.sin(k * .55)); d.rounded_rectangle((120 + k * 14, 560 - h / 2, 128 + k * 14, 560 + h / 2), 3, fill=CREAM)
        draw_text(top, (290, 700), 'I talk', font('serif', 80), CREAM, 0, shadow=0); draw_text(top, (W / 2, 580), '→', font('disp', 90), EMBER, 0, shadow=0)
        d.rounded_rectangle((640, 470, 960, 650), 24, fill=(40, 37, 35)); d.rounded_rectangle((670, 600, 930, 616), 8, fill=EMBER)
        draw_text(top, (800, 560), 'RENDER', font('monob', 30), CREAM, 4, shadow=0); draw_text(top, (800, 700), 'Claude builds', font('serif', 80), GOLD, 0, shadow=0)
    P.append((16, 'SPLIT · HOW', 'I talk and Claude builds the edit.', 'Top half: your voice waveform turns into an arrow that feeds a render bar filling up. "Claude" is set in type only, with no third-party logos.', split(a, 20, talk)))
    im, d, box = paper('the same Claude', 'that makes others look cheap.', 760)
    for k in range(2):
        x = box[0] + 60 + k * 420; c_ = (raw_frame(rawp(a, 26)) if k == 0 else prem(a, 26, 1.1, 880)).resize((360, 560)); im.paste(c_, (x, box[1] + 60), rounded(c_, 26))
        pill(d, im, x + 70, box[1] + 640, 'Claude', size=34)
    P.append((23, 'MOTION GRAPHIC', "It's the same Claude that makes other people's videos look cheap.", 'Two cards with the same "Claude" chip: left the flat generic take, right your relit edit. Same tool, different outcome.', im))
    P.append((35, 'PREMIUM', 'Same tool. I just taught it what premium looks like.', '"premium" lands in gold serif; a subtle gold sheen sweeps across it.', prem(a, 42, 1.12, 860, front=lambda im, c: (draw_text(im, (W / 2, 1110), 'I taught it what', font('disp', 60), CREAM, -2), draw_text(im, (W / 2, 1240), 'premium looks like.', font('serif', 120), GOLD, glow=GOLDGLOW)))))
    im, d, box = paper('all my prompts, skill', '& workflow.', 820)
    for k, (t, sub) in enumerate([('prompts', '120+ ready to paste'), ('skill', 'vibe-editing.skill'), ('workflow', '7 steps · start to export')]):
        y = box[1] + 60 + k * 240; d.rounded_rectangle((box[0] + 60, y, box[2] - 60, y + 200), 30, fill=(40, 37, 35), outline=(72, 66, 61), width=2)
        draw_text(im, (box[0] + 110, y + 100), t, font('serif', 90), GOLD, 0, anchor='ls', shadow=0); draw_text(im, (box[0] + 110, y + 160), sub, font('mono', 28), MUTED, 0, anchor='ls', shadow=0)
    P.append((45, 'MOTION GRAPHIC', 'So all my prompts, my skill, my whole workflow are in this course.', 'Three cards drop in one by one on "prompts", "skill" and "workflow", then stack into one course card titled "Vibe Editing". (Counts shown are placeholders: give me the real numbers.)', im))
    P.append((58, 'CTA', 'So just tap the link below.', 'Ember button springs in with chevrons.', prem(a, 61, 1.05, 860, front=lambda im, c: (draw_text(im, (W / 2, 1050), 'tap the link below', font('disp', 60), CREAM, -2), button(im, 1146)))))
    P.append((None, 'END CARD', '(music resolves)', 'End card.', end_card(a, 42)))
    return P
# ---------------- sheets ----------------
BG = (14, 13, 12)
TITLES = {'ad2': 'Which part is AI?', 'ad3': 'I got that comment', 'ad4': 'I can tell in 3 seconds', 'ad5': 'I used to say the same thing', 'ad6': 'Same question every day'}
SEC = {'PART 1': (232, 88, 70), 'OPEN': (232, 88, 70), 'BEFORE': (232, 88, 70), 'THE SWITCH': CREAM, 'PREMIUM': GOLD, 'SPLIT': (150, 175, 255), 'MOTION': (150, 175, 255), 'CTA': EMBER, 'END': EMBER}
def wrap(d, txt, f, w):
    out, line = [], ''
    for word in txt.split():
        t = (line + ' ' + word).strip()
        if d.textlength(t, font=f) > w and line: out.append(line); line = word
        else: line = t
    return out + [line]
for ad, fn in [('ad2', ad2), ('ad3', ad3), ('ad4', ad4), ('ad5', ad5), ('ad6', ad6)]:
    P = fn(); e = words(ad); tot = e['nframes'] / 30
    starts = [e['words'][p[0]]['os'] if p[0] is not None else e['speech'] for p in P]
    PW, PH, CW, CH, PAD = 360, 640, 1060, 700, 40
    for s in range(0, len(P), 6):
        ch_ = list(range(s, min(s + 6, len(P)))); rows = (len(ch_) + 1) // 2
        S = Image.new('RGB', (2 * CW + PAD, rows * CH + 170), BG); d = ImageDraw.Draw(S)
        draw_text(S, (PAD, 105), f'{ad.upper()}  ·  {TITLES[ad]}', font('disp', 64), CREAM, -2, anchor='ls', shadow=0)
        draw_text(S, (PAD + 1180, 100), f'panels {ch_[0] + 1}–{ch_[-1] + 1} of {len(P)}  ·  ~{tot:.0f} s', font('mono', 26), MUTED, 0, anchor='ls', shadow=0)
        for j, i in enumerate(ch_):
            _, sec, vo, desc, img = P[i]; x = PAD + (j % 2) * CW; y = 160 + (j // 2) * CH
            img = img.resize((PW, PH)); S.paste(img, (x, y), rounded(img, 24)); c = next(v for k, v in SEC.items() if sec.startswith(k))
            end = starts[i + 1] if i + 1 < len(P) else tot; tx = x + PW + 36
            draw_text(S, (tx, y + 52), f'{i + 1:02d}', font('disp', 56), c, -2, anchor='ls', shadow=0)
            draw_text(S, (tx + 100, y + 48), f'{starts[i]:.1f} – {end:.1f} s', font('mono', 28), (200, 190, 180), 0, anchor='ls', shadow=0)
            draw_text(S, (tx, y + 100), sec, font('disp', 26), c, 1, anchor='ls', shadow=0)
            yy = y + 160
            for ln in wrap(d, '“' + vo + '”', font('serif', 40), 600): draw_text(S, (tx, yy), ln, font('serif', 40), CREAM, 0, anchor='ls', shadow=0); yy += 46
            yy += 16
            for ln in wrap(d, desc, font('med', 27), 610): draw_text(S, (tx, yy), ln, font('med', 27), (190, 182, 174), 0, anchor='ls', shadow=0); yy += 38
        S.save(f'{OUT}/{ad}_storyboard_{s // 6 + 1}.png'); print(ad, 'sheet', s // 6 + 1)

"""Moodboard + storyboard sheets for Ad 1 v2.
usage: python3 sb_sheets.py FRAMES_DIR MATTE_DIR REF_A.mp4 REF_B.mp4 REF_IMG OUT_PREFIX"""
import sys, os, json, subprocess, io
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from look import *
FR, MD, RA, RB, RI, OUT = sys.argv[1:7]
T = {w: t for w, t in reversed(json.load(open(f'{FR}/timing.json'))['words'])}
tim = json.load(open(f'{FR}/timing.json'))['words']
def at(i): return tim[i][1]
def grab(v, t, size):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', v, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    return Image.open(io.BytesIO(b)).convert('RGB').resize(size)
BG = (14, 13, 12)
def wrap(d, txt, f, w):
    out, line = [], ''
    for word in txt.split():
        t = (line + ' ' + word).strip()
        if d.textlength(t, font=f) > w and line: out.append(line); line = word
        else: line = t
    return out + [line]
# ---------------- MOODBOARD ----------------
M = Image.new('RGB', (2160, 2700), BG); d = ImageDraw.Draw(M)
draw_text(M, (80, 150), 'AD 1  ·  MOODBOARD', font('disp', 96), CREAM, -3, anchor='ls', shadow=0)
draw_text(M, (80, 225), 'Ink, Paper & Ember: dark cinematic A-roll, paper-card motion graphics, one warm accent.', font('med', 38), MUTED, 0, anchor='ls', shadow=0)
# palette
y = 300
for i, (n, c) in enumerate([('INK', INK), ('PAPER', PAPER), ('EMBER', EMBER), ('GOLD', GOLD), ('CREAM', CREAM), ('MUTED', MUTED)]):
    x = 80 + i * 340; d.rounded_rectangle((x, y, x + 310, y + 200), 28, fill=c, outline=(60, 56, 52))
    draw_text(M, (x, y + 250), n, font('monob', 28), CREAM, 3, anchor='ls', shadow=0)
    draw_text(M, (x, y + 290), '#%02X%02X%02X' % c, font('mono', 26), MUTED, 0, anchor='ls', shadow=0)
# type
y = 680; d.rounded_rectangle((80, y, 1060, y + 760), 36, fill=(22, 20, 19))
draw_text(M, (130, y + 80), 'TYPE', font('monob', 26), MUTED, 4, anchor='ls', shadow=0)
draw_text(M, (130, y + 220), 'AI edited', font('disp', 130), CREAM, -5, anchor='ls', shadow=0)
draw_text(M, (130, y + 260), 'Inter Display ExtraBold · tight · statements', font('mono', 22), MUTED, 0, anchor='ls', shadow=0)
draw_text(M, (130, y + 420), 'this one too.', font('serif', 150), GOLD, 0, anchor='ls', shadow=0, glow=(GOLD, .45, 14))
draw_text(M, (130, y + 460), 'Instrument Serif Italic · the payoff word, always gold', font('mono', 22), MUTED, 0, anchor='ls', shadow=0)
draw_text(M, (130, y + 560), 'PUSH IN  ·  EASE 0.65  ·  READY', font('monob', 34), CREAM, 3, anchor='ls', shadow=0)
draw_text(M, (130, y + 600), 'JetBrains Mono · labels, UI, data', font('mono', 22), MUTED, 0, anchor='ls', shadow=0)
d.text((130, y + 700), 'BE HONEST?', font=font('generic', 54), fill=(255, 225, 40), anchor='ls', stroke_width=6, stroke_fill=(0, 0, 0))
draw_text(M, (520, y + 698), '← generic captions: Part 1 only', font('mono', 22), MUTED, 0, anchor='ls', shadow=0)
# grade
y2 = 680; d.rounded_rectangle((1100, y2, 2080, y2 + 760), 36, fill=(22, 20, 19))
draw_text(M, (1150, y2 + 80), 'GRADE  ·  normal  →  premium', font('monob', 26), MUTED, 4, anchor='ls', shadow=0)
raw = raw_frame(f'{MD}/raw_14.6.png').crop((180, 300, 900, 1500)).resize((420, 600))
pre = Image.open(f'{FR}/p06.jpg').crop((180, 300, 900, 1500)).resize((420, 600))
M.paste(raw, (1150, y2 + 120), rounded(raw, 24)); M.paste(pre, (1610, y2 + 120), rounded(pre, 24))
draw_text(M, (1150, y2 + 748 - 10), 'flat, bright wall', font('mono', 22), MUTED, 0, anchor='ls', shadow=0)
draw_text(M, (1610, y2 + 748 - 10), 'matted · low-key set · warm rim', font('mono', 22), MUTED, 0, anchor='ls', shadow=0)
# references
y = 1500; draw_text(M, (80, y + 50), 'WHAT WE TAKE FROM THE REFERENCES', font('monob', 26), MUTED, 4, anchor='ls', shadow=0)
refs = [(grab(RA, 3.6, (300, 533)), 'Before/after cards; relit low-key "after"; one gold key word'),
        (grab(RB, 0.6, (300, 533)), 'Deep, warm grade; big bold lowercase captions'),
        (grab(RB, 7.4, (300, 533)), 'Rounded B-roll cards on paper texture'),
        (Image.open(RI).convert('RGB').resize((300, 533)), 'Small B/W "before", big colour "after", serif accent')]
for i, (im, cap) in enumerate(refs):
    x = 80 + i * 510; M.paste(im, (x, y + 90), rounded(im, 26))
    yy = y + 660
    for ln in wrap(d, cap, font('med', 28), 440): draw_text(M, (x, yy), ln, font('med', 28), CREAM, 0, anchor='ls', shadow=0); yy += 38
# motion rules
y = 2330; d.rounded_rectangle((80, y, 2080, y + 320), 36, fill=(22, 20, 19))
draw_text(M, (130, y + 80), 'MOTION & SOUND RULES', font('monob', 26), MUTED, 4, anchor='ls', shadow=0)
rules = ['Every move is eased (no linear moves). Text enters in 6–8 frames with a short blur, exits faster.',
         'Camera: slow 3–6 % push per beat; punch-ins only on cuts; zero shake in Part 2.',
         'Captions: max 2 lines inside the safe zone. Filler in small sans, payoff word in gold serif italic.',
         'Paper cards slide up with motion blur; the after-card pushes in to full screen. Music: ElevenLabs bed, ducked.']
for i, r in enumerate(rules): draw_text(M, (130, y + 140 + i * 44), '•  ' + r, font('med', 30), CREAM, 0, anchor='ls', shadow=0)
M.save(f'{OUT}_moodboard.png'); print('moodboard')
# ---------------- STORYBOARD ----------------
B = [  # (panel, start-word index, section, VO, what happens)
 (1, 0, 'PART 1 · NORMAL EDIT', 'Can I be honest? I can tell your video was edited with AI.', 'Your raw take, untouched: bright wall, flat light. Standard auto-captions: centred, uppercase, white with black stroke, active word yellow. This is what "normal AI editing" looks like.'),
 (2, 13, 'PART 1 · NORMAL EDIT', 'Captions jumping on every word, a zoom every 2 seconds…', 'The captions bounce on every word, and a hard auto-zoom punches in exactly on "zoom". We show the tell as you say it.'),
 (3, 23, 'PART 1 · NORMAL EDIT', '…the same old whoosh.', 'A loud stock whoosh lands on "whoosh". Still flat and bright.'),
 (4, 27, 'PART 1 · FEED', "People see it in one second, they know it's AI and they scroll.", 'The frame shrinks into a feed card on black. On "scroll" it is flicked up with a motion trail, and the next card slides in. Spring physics.'),
 (5, 40, 'THE SWITCH', 'Now watch this.', 'Paper background with a soft ember glow. Your raw take sits small in black-and-white as "before"; the premium "after" card slides in big beside it. Music drops in. Then the after card pushes in to fill the screen.'),
 (6, 43, 'PART 2 · PREMIUM', 'AI edited this one too…', 'Full screen: you are matted onto a dark, out-of-focus set with a warm practical lamp, face lit and body falling into shadow, with a warm rim. No colour wash. Slow push-in.'),
 (7, 48, 'PART 2 · PREMIUM', 'Could you tell?', 'An eased punch-in to a close-up. Thin gold corner brackets settle on your face. "tell?" rises in gold serif with a soft glow.'),
 (8, 51, 'PART 2 · PREMIUM', 'Nobody can.', '"nobody" sits huge BEHIND your head (your hair covers part of it). "can." lands in front in gold.'),
 (9, 53, 'MOTION GRAPHIC', "Because I don't just tell AI \"edit my video\",", 'Paper card slides up. Heading on paper, dark card below: "edit my video" types into a prompt field, the cursor blinks, an ember line strikes it out. Three identical "template" thumbnails fade in underneath.'),
 (10, 62, 'MOTION GRAPHIC', 'I built my own workflow,', 'A new paper card: 7 nodes (Transcript → Cut → Matte → Type → Camera → Grade → Sound) build one by one on an ember line. A gold light pulse travels down. The card drifts slowly in depth.'),
 (11, 67, 'PART 2 · PREMIUM', 'how every word shows up,', 'Back on you. "word" morphs smoothly through 4 type styles (serif, bold, mono, outline) and settles in gold serif, with a mono label under it marking the active style.'),
 (12, 72, 'PART 2 · PREMIUM', 'when the camera moves.', 'The camera actually pushes in with an eased curve. Thin viewfinder corners and a "PUSH IN · EASE" label. "moves." slides in with a motion trail.'),
 (13, 76, 'MOTION GRAPHIC', "It's all set before I start.", 'Paper card with a settings panel: 5 rows (Captions, Camera, Grade, Background, Sound) flip ON one after another, then a progress line fills to "READY".'),
 (14, 82, 'PART 2 · PREMIUM', "That's the workflow I teach.", '"VIBE / EDITING" sits huge behind your head (the head covers part of "EDITING"). "I teach." in gold.'),
 (15, 87, 'CTA', 'The link is below.', 'An ember pill button "Learn the workflow →" springs in with a soft glow, and two chevrons nudge down toward the Meta button.'),
 (16, 91, 'CTA', 'Make videos that nobody can tell are AI.', 'Three-line kinetic build with "nobody can tell" in gold serif. A slow final push.'),
 (17, None, 'END CARD', '(music resolves)', 'Paper end card: the before/after cards tilted, "Vibe Editing" wordmark, button, your URL. 1.4 s.'),
]
SEC = {'PART 1': (232, 88, 70), 'THE SWITCH': CREAM, 'PART 2': GOLD, 'MOTION': (150, 175, 255), 'CTA': EMBER, 'END': EMBER}
total = json.load(open(f'{FR}/timing.json'))['total']
starts = [at(b[1]) if b[1] is not None else total - 1.4 for b in B]
PW, PH = 360, 640; CW, CH, PAD = 1060, 700, 40
for s in range(0, len(B), 6):
    chunk = list(range(s, min(s + 6, len(B)))); rows = (len(chunk) + 1) // 2
    S = Image.new('RGB', (2 * CW + PAD, rows * CH + 170), BG); d = ImageDraw.Draw(S)
    draw_text(S, (PAD, 105), 'AD 1  ·  STORYBOARD v2', font('disp', 72), CREAM, -2, anchor='ls', shadow=0)
    draw_text(S, (PAD + 900, 100), f'panels {chunk[0] + 1}–{chunk[-1] + 1} of {len(B)}   ·   1080×1920 · 30 fps · ~{total:.0f} s', font('mono', 26), MUTED, 0, anchor='ls', shadow=0)
    for j, i in enumerate(chunk):
        p, _, sec, vo, desc = B[i]; x = PAD + (j % 2) * CW; y = 160 + (j // 2) * CH
        im = Image.open(f'{FR}/p{p:02d}.jpg').resize((PW, PH)); S.paste(im, (x, y), rounded(im, 24))
        end = starts[i + 1] if i + 1 < len(B) else total; c = next(v for k, v in SEC.items() if sec.startswith(k))
        tx = x + PW + 36
        draw_text(S, (tx, y + 52), f'{p:02d}', font('disp', 56), c, -2, anchor='ls', shadow=0)
        draw_text(S, (tx + 100, y + 48), f'{starts[i]:.1f} – {end:.1f} s', font('mono', 28), (200, 190, 180), 0, anchor='ls', shadow=0)
        draw_text(S, (tx, y + 100), sec, font('disp', 26), c, 1, anchor='ls', shadow=0)
        yy = y + 160
        for ln in wrap(d, '“' + vo + '”', font('serif', 40), 600): draw_text(S, (tx, yy), ln, font('serif', 40), CREAM, 0, anchor='ls', shadow=0); yy += 46
        yy += 16
        for ln in wrap(d, desc, font('med', 27), 610): draw_text(S, (tx, yy), ln, font('med', 27), (190, 182, 174), 0, anchor='ls', shadow=0); yy += 38
    S.save(f'{OUT}_{s // 6 + 1}.png'); print('sheet', s // 6 + 1)

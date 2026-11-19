"""Ad 7 edit board — STUDIO LIME. Renders one still per beat + sheets with notes. usage: python3 board7.py OUT_DIR"""
import sys, os, json, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
import common as C
from kit7 import *
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
T = json.load(open(f'{C.SC}/board_times.json')); f = C.find
def aroll(t, z=1.0, cy=0.):
    g = grade(C.raw(t), int(t * 30)); return K.zoom(g, z, .5, .42 + cy) if z != 1 else g
def cut(t, **kw): return cutout(C.raw(t), C.alpha(t), **kw)
P = []
# ---------- 1 HOOK: "this whole video, I'm not editing it. Claude is." ----------
t = T['P1']; rgb = C.raw(t); al = C.alpha(t); g = grade(rgb, 1); top = head_top(al)
b = g.copy(); text(b, (W / 2, 330), "I'm not editing this video.", FX('isemi', 50), INK)
text(b, (W / 2, top - 40), 'CLAUDE IS.', FX('outfit9', 196), INK, track=-6)
im = person_over(b, grade(rgb, 1), al); micro(im, 70, 1180, ['DIRECTED BY ME', 'EDITED BY CLAUDE'], FX('jb7', 22), INK)
P.append(('HOOK', '"This whole video… I\'m not editing it. Claude is."', 'Real room, clean bright grade. "CLAUDE IS." stamps in huge BEHIND your head (depth, like the "crisp" ref); small line on top. No captions yet; the video starts "unedited" and builds itself as you direct it.', im))
# ---------- 2 MUSIC ----------
t = T['P2']; rgb = C.raw(t); al = C.alpha(t); g = grade(rgb, 2); b = g.copy(); d = ImageDraw.Draw(b)
for k in range(70):
    x = 40 + k * 14.4; hh = 20 + 160 * abs(math.sin(k * .37)) * (.4 + .6 * abs(math.sin(k * .11 + 1))); d.rounded_rectangle((x, 760 - hh / 2, x + 7, 760 + hh / 2), 4, fill=LIME)
im = person_over(b, g, al); place(im, chip('put some music'), W / 2, 330, 30, .25)
place(im, tag('♪  background music · on', FX('imed', 30), LIME, INK), W / 2, 1180)
P.append(('DIRECTING · MUSIC', '"Claude, put some music."', 'Your instruction types itself into the black command chip (the recurring motif). On "music." the bed fades in and a lime waveform ribbon pulses BEHIND you to the beat; small lime status pill confirms.', im))
# ---------- 3 SFX ----------
t = T['P3']; im = aroll(t); place(im, chip('add some sound effects also'), W / 2, 330, 30, .25)
for (lab, x, y, r) in [('whoosh', 230, 720, -8), ('pop', 860, 640, 6), ('click', 870, 980, -4), ('swipe', 200, 1050, 5)]:
    s = tag(lab, FX('outfit8', 44), LIME, INK); s = s.rotate(r, expand=True, resample=Image.BICUBIC); place(im, s, x, y, 18, .22)
P.append(('DIRECTING · SFX', '"Add some sound effects also."', 'Second command chip. Each sound you hear pops in as a lime sticker label (whoosh / pop / click / swipe) around you, never on the face, then peels away.', im))
# ---------- 4 NO APPS ----------
im = studio(4).copy(); text(im, (70, 330), "didn't open:", FX('jb7', 34), GREY, 'lm')
for k, (nm, y) in enumerate([('Premiere Pro', 470), ('DaVinci', 600), ('Higgsfield', 730), ('</> coding', 860)]):
    s = tag(nm, FX('ibold', 58), WHITE, INK, (44, 20)); place(im, s, 70 + s.size[0] / 2, y, 18, .18)
    hand_line(im, [(50, y + 6), (110 + s.size[0], y - 4)], 9, INK, 10 + k); text(im, (s.size[0] + 170, y), 'no.', FX('apple', 52), INK, 'lm', rot=4)
text(im, (W / 2, 1110), 'nothing.', FX('outfit9', 210), INK); hand_line(im, [(170, 1215), (910, 1200)], 26, LIME, 7)
P.append(('MOTION GRAPHIC · NO APPS', '"No Premiere Pro, no DaVinci, no Higgsfield, nothing. I don\'t even know coding."', 'Cut to the studio paper. Each name drops in as a plain white tag (no logos) on the word and gets a hand-drawn strike + "no."; "nothing." slams in with a lime marker swipe; "</> coding" gets crossed last.', im))
# ---------- 5 STYLE 01 basic ----------
t = C.OE(f('captions.')) + .2; im = aroll(t); text(im, (W / 2, 1150), 'okay, now add captions', FX('imed', 46), WHITE, shadow=.9)
place(im, chip('add captions', label='STYLE 01 · BASIC'), W / 2, 330, 30, .25)
P.append(('CAPTION STYLE 01 · BASIC', '"Okay, now add captions."', 'Deliberately plain: small white subtitle at the bottom, the kind everyone uses. Sets up the contrast for "Nah, too basic."', im))
# ---------- 6 STYLE 02 highlight ----------
t = C.OS(f('saying.')) + .05; im = aroll(t)
def hl_line(im, y, words, hi, size=104):
    fnt = FX('iblack', size); ws = [fnt.getlength(w) for w in words]; gap = 30; x = W / 2 - (sum(ws) + gap * (len(ws) - 1)) / 2
    for k, (w, ww) in enumerate(zip(words, ws)):
        if k == hi:
            pad = 16; box = Image.new('RGBA', (int(ww + pad * 2), int(size * 1.18))); ImageDraw.Draw(box).rounded_rectangle((0, 0, box.size[0] - 1, box.size[1] - 1), 22, fill=LIME + (255,))
            box = box.rotate(-2, expand=True, resample=Image.BICUBIC); place(im, box, x + ww / 2, y + 4, 16, .25, (0, 10)); text(im, (x + ww / 2, y), w, fnt, INK)
        else: text(im, (x + ww / 2, y), w, fnt, WHITE, shadow=.7)
        x += ww + gap
hl_line(im, 1085, ['HIGHLIGHT', 'THE'], -1, 92); hl_line(im, 1192, ['WORD', "I'M", 'SAYING'], 2, 92)
P.append(('CAPTION STYLE 02 · KARAOKE HIGHLIGHT', '"Nah, too basic. Highlight the word I\'m saying."', 'Heavy grotesk, 2 lines, centred low. A lime pill slides from word to word exactly on your voice, the active word turns black and pops 6%. Soft shadow so it reads on the wall and the sweater.', im))
# ---------- 7 STYLE 03 magazine ----------
t = T['P7']; rgb = C.raw(t); al = C.alpha(t); g = grade(rgb, 7); top = head_top(al); b = g.copy(); d = ImageDraw.Draw(b)
text(b, (W / 2, 300), 'ISSUE 01  ·  THE DIRECTING ISSUE  ·  NOV 2026', FX('jb7', 22), INK, track=2)
d.line([(60, 330), (W - 60, 330)], fill=INK, width=2); text(b, (W / 2, top - 10), 'VIBE', FX('play8', 330), INK, track=-8)
im = person_over(b, g, al); d = ImageDraw.Draw(im)
text(im, (70, 880), 'make it', FX('play6i', 78), INK, 'lm'); text(im, (70, 970), 'look like a', FX('play6i', 78), INK, 'lm')
s = tag('magazine.', FX('play8i', 84), LIME, INK, (26, 6), 6); place(im, s, 70 + s.size[0] / 2, 1085, 12, .2)
text(im, (W - 70, 900), '05', FX('play8', 120), WHITE, 'rm', shadow=.6); text(im, (W - 70, 985), 'caption styles', FX('isemi', 30), WHITE, 'rm', shadow=.7); text(im, (W - 70, 1020), 'inside', FX('isemi', 30), WHITE, 'rm', shadow=.7)
for k in range(28): x = 70 + k * 7 + (k % 3) * 2; d.rectangle((x, 1150, x + (2 if k % 4 else 4), 1215), fill=WHITE)
P.append(('CAPTION STYLE 03 · MAGAZINE COVER', '"Hmm, make it look like a magazine."', 'You become a live magazine cover: giant serif masthead "VIBE" BEHIND your head, issue line + rule on top, serif-italic cover lines that set your words, lime highlight on the key word, barcode. Cover elements slide in on a soft stagger.', im))
# ---------- 8 STYLE 04 behind head ----------
t = T['P8']; rgb = C.raw(t); al = C.alpha(t); g = grade(rgb, 8); top = head_top(al); b = g.copy()
text(b, (W / 2, top - 30), 'behind', FX('outfit9', 250), (226, 244, 120), track=-10)
im = person_over(b, g, al); text(im, (W / 2, 1060), 'my head.', FX('outfit9', 170), WHITE, track=-6, shadow=.5)
P.append(('CAPTION STYLE 04 · WORDS BEHIND MY HEAD', '"Okay, put the words behind my head."', 'The "crisp" reference: each word lands huge in heavy geometric type BEHIND your head (pale lime), the last words sit in front over the sweater in white. Real depth from the matte, every frame.', im))
# ---------- 9 STYLE 05 handwritten ----------
t = C.OE(f('one.')) - .1; im = aroll(t)
text(im, (W / 2, 330), 'wait, try', FX('apple', 70), INK, rot=2); text(im, (W / 2 + 20, 450), 'handwritten', FX('apple', 92), INK, rot=2)
hand_line(im, [(260, 515), (560, 505), (860, 520)], 18, LIME, 3)
text(im, (W / 2 + 90, 1110), 'yeah, this one.', FX('apple', 66), WHITE, rot=-3, shadow=.5); K.stroke(im, K.ellipse_pts(W / 2 + 90, 1110, 330, 80, seed=6), 1, 7, LIME, 6)
P.append(('CAPTION STYLE 05 · HANDWRITTEN', '"Wait, try handwritten." "Yeah, this one."', 'Real handwriting that writes itself on, stroke by stroke (Pinterest feel), a lime marker swoosh underlines it, a hand-drawn loop circles "yeah, this one." From here the rest of the video keeps THIS style: your choice becomes the edit.', im))
# ---------- 10 RECAP ----------
im = studio(10).copy(); text(im, (70, 330), 'five caption styles.', FX('iblack', 82), INK, 'lm'); text(im, (70, 430), "and I didn't touch anything.", FX('isemi', 44), GREY, 'lm')
for k, (pi, rot) in enumerate([(4, -9), (5, -4), (6, 0), (7, 4), (8, 9)]):
    th = P[pi][3].resize((300, 533), Image.LANCZOS).convert('RGBA'); m = K.rounded_mask(300, 533, 26); th.putalpha(m); th = th.rotate(rot, expand=True, resample=Image.BICUBIC)
    place(im, th, 175 + k * 182, 860 + abs(k - 2) * 40, 24, .3); text(im, (175 + k * 182, 1170 + abs(k - 2) * 20), f'0{k + 1}', FX('jb7', 30), INK)
P.append(('MOTION GRAPHIC · RECAP', '"See, five caption styles and I didn\'t touch anything."', 'The five styles you just watched fly in as a fanned deck of live mini-reels, numbered 01–05, on the studio paper. Big grotesk headline, grey sub-line.', im))
# ---------- 11 CUT ME OUT ----------
t = T['P11']; c = cut(t); im = studio(11).copy(); place(im, c, W / 2, H / 2, 40, .3, (0, 30)); place(im, chip('cut me out and put me on a whiteboard'), W / 2, 330, 30, .25)
P.append(('TRANSITION · CUT ME OUT', '"Now cut me out and put me on a whiteboard."', 'The room peels away behind you in one smooth sweep; you stay, now a clean cut-out with a lime sticker edge (refs: F1 poster, Rangpur). Then you shrink to the side of the whiteboard. Soft ASMR paper-slide + tear.', im))
# ---------- whiteboard helpers ----------
def board_bg(seed): return studio(seed).copy()
def me_small(im, t, s=.56, cx=820, halftone=False):
    c = cut(t, halftone=halftone); c = c.resize((int(W * s), int(H * s)), Image.LANCZOS); place(im, c, cx, H - c.size[1] / 2 + 60, 30, .25)
# ---------- 12 VIBE EDITING ----------
t = T['P12']; im = board_bg(12); sp = sphere(210); place(im, sp, 300, 520, 40, .25, (10, 30))
text(im, (70, 470), 'Vibe', FX('iblack', 250), INK, 'lm', track=-8); text(im, (110, 680), 'Editing', FX('iblack', 200), INK, 'lm', track=-6)
text(im, (110, 800), "it's actually simple.", FX('isemi', 46), GREY, 'lm'); micro(im, 760, 300, ['A WORKFLOW BY', 'DIRECTING CLAUDE', '—— 3 STEPS'], FX('jb7', 20), INK)
me_small(im, t, .55, 800)
P.append(('WHITEBOARD · TITLE', '"Okay, so this is what I call Vibe Editing. And it\'s actually simple."', 'Whiteboard = the studio paper. You stand small on the right as a cut-out (lime edge). "Vibe / Editing" builds in big grotesk with mixed sizes and offsets, a glossy lime sphere rolls in behind it (ref video 1), micro-type corner notes.', im))
# ---------- 13 STEP 01 ----------
t = T['P13']; im = board_bg(13); sun = sphere(250); place(im, sun, 400, 860, 40, .18)
ph = mg.tilt(mg.phone(Image.fromarray(np.asarray(grade(C.raw(t - 30), 13))), 780), rx=4, ry=-14, rz=-4); place(im, ph, 380, 930, 40, .35, (-20, 40))
text(im, (70, 330), '01', FX('jb7', 40), LIME_D, 'lm'); text(im, (150, 330), 'record yourself.', FX('iblack', 72), INK, 'lm'); text(im, (150, 410), 'your phone is enough.', FX('apple', 44), INK, 'lm', rot=1)
me_small(im, t, .5, 860)
P.append(('WHITEBOARD · STEP 01', '"First, you just need to record yourself. Your phone is enough."', 'Step number in lime mono, heavy headline, handwritten note (your chosen style). A 3D phone tilts in with your raw take playing inside; a lime sun rises behind it (Rangpur ref).', im))
# ---------- 14 STEP 02 ----------
t = T['P14']; im = board_bg(14); text(im, (70, 330), '02', FX('jb7', 40), LIME_D, 'lm'); text(im, (150, 330), 'tell Claude what you want.', FX('iblack', 60), INK, 'lm')
text(im, (150, 405), "like you're talking to an editor.", FX('apple', 40), INK, 'lm', rot=1)
for k, (s, x, y) in enumerate([('make it look like a magazine', 380, 620), ('put the words behind my head', 420, 800), ('cut me out', 330, 980)]):
    c_ = chip(s, label=f'YOU · {["0:22", "0:26", "0:38"][k]}', cursor=False); place(im, c_, 70 + c_.size[0] / 2 + k * 30, y, 26, .22)
me_small(im, t, .5, 880)
P.append(('WHITEBOARD · STEP 02', '"Then you tell Claude what you want. Like you\'re talking to an editor."', 'Callback: the actual commands you gave earlier in this video stack up as chips with timestamps; proof that this edit was made exactly this way.', im))
# ---------- 15 STEP 03 ----------
t = T['P15']; im = board_bg(15); text(im, (70, 330), '03', FX('jb7', 40), LIME_D, 'lm'); text(im, (150, 330), 'the workflow.', FX('iblack', 80), INK, 'lm')
sp = sphere(150); place(im, sp, 700, 560, 30, .22)
doc = Image.new('RGBA', (700, 640)); d = ImageDraw.Draw(doc); d.rounded_rectangle((0, 0, 699, 639), 36, fill=WHITE + (255,)); d.rounded_rectangle((0, 0, 699, 90), 36, fill=INK + (255,)); d.rectangle((0, 50, 699, 90), fill=INK)
d.text((40, 48), 'vibe-editing.skill', font=FX('jb7', 30), fill=LIME, anchor='lm')
for k, (a_, b_) in enumerate([('captions', 'designed per phrase'), ('camera', 'slow, motivated'), ('grade', 'real room, cinematic'), ('motion', 'explain, never decorate'), ('sound', 'soft, premium')]):
    y = 150 + k * 96; d.ellipse((40, y - 18, 76, y + 18), fill=LIME); d.text((100, y), a_, font=FX('ibold', 34), fill=INK, anchor='lm'); d.text((300, y), b_, font=FX('imed', 30), fill=GREY, anchor='lm')
place(im, mg.tilt(doc, rx=10, ry=-12, rz=-3), 400, 830, 40, .3)
text(im, (150, 1180), 'tells Claude what premium looks like.', FX('apple', 38), INK, 'lm', rot=1); me_small(im, t, .48, 900)
P.append(('WHITEBOARD · STEP 03', '"And the main thing is the workflow. I made a skill file that tells Claude what a premium edit looks like."', 'Your skill file as a glossy 3D document: rules tick on one by one in lime as you speak; lime sphere for depth. This is the product reveal before the offer.', im))
# ---------- 16 SAME CLAUDE ----------
t = T['P16']; im = board_bg(16); text(im, (W / 2, 330), 'everyone uses Claude.', FX('iblack', 70), INK)
for k in range(3):
    c = Image.fromarray(C.raw(T['P2'] + k * 3)).copy(); mg.cheap_caps(c, ['SAME', 'EDIT'], k % 2, 1150, 100); c = c.resize((290, 516)).convert('RGBA'); c.putalpha(K.rounded_mask(290, 516, 24))
    a = np.asarray(c).astype(np.float32); a[..., :3] = a[..., :3].mean(2, keepdims=True) * .85 + 20; place(im, Image.fromarray(a.astype(np.uint8)).rotate((k - 1) * -4, expand=True, resample=Image.BICUBIC), 220 + k * 320, 720, 18, .2)
text(im, (W / 2, 1060), 'not the tool.', FX('iblack', 100), (150, 148, 144)); hand_line(im, [(190, 1060), (890, 1052)], 10, INK, 4)
s = tag("it's how you use it.", FX('iblack', 84), LIME, INK, (30, 10), 14); place(im, s, W / 2, 1195, 18, .25)
P.append(('MOTION GRAPHIC · SAME TOOL', '"Everyone is using Claude. That\'s why most AI edits look cheap. It\'s not the tool, it\'s how you use it."', 'Three grey, identical cheap reels (same yellow captions) slide in; "not the tool." gets a hand strike; "it\'s how you use it." lands as a lime block. Full-screen MG, you leave frame for this beat.', im))
# ---------- 17 PUT ME BACK ----------
t = T['P17']; im = aroll(t); place(im, chip('put me back'), W / 2, 330, 30, .25)
P.append(('TRANSITION · PUT ME BACK', '"Okay, put me back."', 'Reverse of the cut-out: you scale back up to full frame and the real room fades in around you. Soft whoosh, music lifts.', im))
# ---------- 18 COURSE ----------
im = studio(18).copy(); text(im, (W / 2, 330), 'everything, in one course.', FX('iblack', 66), INK)
box = Image.new('RGBA', (560, 700)); d = ImageDraw.Draw(box); d.rounded_rectangle((0, 0, 559, 699), 34, fill=LIME + (255,))
d.text((64, 100), 'VIBE', font=FX('iblack', 124), fill=INK, anchor='lm'); d.text((64, 215), 'EDITING', font=FX('iblack', 96), fill=INK, anchor='lm')
d.text((50, 300), 'the complete workflow', font=FX('isemi', 34), fill=INK, anchor='lm'); d.line([(50, 600), (510, 600)], fill=INK, width=3); d.text((50, 640), 'DIRECTED BY YOU · EDITED BY CLAUDE', font=FX('jb7', 20), fill=INK, anchor='lm')
place(im, mg.tilt(box, rx=8, ry=-16, rz=-3), 560, 870, 50, .35, (-20, 40))
for (lab, x, y, r) in [('my prompts', 230, 560, -6), ('my skill files', 840, 640, 5), ('the whole workflow', 260, 1180, -3)]:
    s = tag(lab, FX('ibold', 44), WHITE, INK, (34, 16)); place(im, s.rotate(r, expand=True, resample=Image.BICUBIC), x, y, 18, .2)
P.append(('MOTION GRAPHIC · THE COURSE', '"So I have put everything in one course. My prompts, my skill files, the whole workflow."', 'A glossy lime course cover tilts in on the studio paper; "my prompts", "my skill files", "the whole workflow" fly in as white tags on each phrase and drop INTO the cover (it pulses as each lands).', im))
# ---------- 19 CTA ----------
t = C.OE(f('below.')) - .1; im = aroll(t, 1.04)
text(im, (W / 2, 330), 'want your videos', FX('apple', 60), INK, rot=2); text(im, (W / 2 + 10, 430), 'to look like this?', FX('apple', 60), INK, rot=2)
s = tag('Learn the workflow  →', FX('ibold', 46), LIME, INK, (50, 26)); place(im, s, W / 2, 1150, 30, .3); K.arrow(im, (W / 2 + 330, 1000), (W / 2 + 300, 1100), .3, 1, INK, 6, 51)
P.append(('CTA', '"So if you want your videos to look like this, just tap the button below."', 'Back in the room, your chosen handwritten captions; the lime "Learn the workflow →" button springs up over the sweater with a hand-drawn arrow pointing down to Meta\'s button.', im))
# ---------- 20 END CARD ----------
t = T['P20']; im = studio(20).copy(); sp = sphere(300); place(im, sp, W / 2, 1180, 50, .2)
c = cut(t); c = c.resize((int(W * .78), int(H * .78)), Image.LANCZOS); al_ = np.asarray(c.split()[3]); tp = head_top(al_, 200, 640)
place(im, c, W / 2, H + 40 - c.size[1] / 2 + max(0, 820 - tp) * 0 + (860 - tp) * 1 - 0, 40, .3) if False else shadowed(im, c, ((W - c.size[0]) / 2, 860 - tp), 40, .3)
text(im, (W / 2, 330), 'VIBE EDITING', FX('iblack', 128), INK, track=-3); text(im, (W / 2, 455), 'directed by me, edited by Claude', FX('sign', 74), INK)
s = tag('Learn the workflow  →', FX('ibold', 44), INK, LIME, (48, 24)); place(im, s, W / 2, 610, 26, .3); text(im, (W / 2, 705), '[your-url.com]', FX('jb4', 28), GREY)
P.append(('END CARD', '(music resolves)', 'Studio paper. Top: "VIBE EDITING" + script signature "directed by me, edited by Claude" (ref video 1 ending), black button + URL. Below: you as a clean lime-edged cut-out rising in front of a glossy lime sphere. Nothing ever covers your face.', im))
# ---------------- sheets ----------------
for i, (_, _, _, im) in enumerate(P): im.convert('RGB').save(f'{OUT}/p{i + 1:02d}.jpg', quality=90)
cols, pw, ph = 5, 400, 711
def wrap(s, f, w):
    out, line = [], ''
    for word in s.split():
        if f.getlength(line + ' ' + word) > w: out.append(line); line = word
        else: line = (line + ' ' + word).strip()
    return out + [line]
for sh in range(4):
    sub = P[sh * 5:(sh + 1) * 5]; S = Image.new('RGB', (cols * (pw + 32) + 32, 120 + ph + 420), (246, 245, 242)); d = ImageDraw.Draw(S)
    d.text((32, 60), f'AD 7 · "I EDIT JUST BY TALKING" · STUDIO LIME · BOARD {sh + 1}/4', font=FX('jb7', 30), fill=INK, anchor='lm')
    for k, (title, line, note, im) in enumerate(sub):
        x = 32 + k * (pw + 32); S.paste(im.convert('RGB').resize((pw, ph), Image.LANCZOS), (x, 110)); y = 110 + ph + 24
        for l in wrap(f'{sh * 5 + k + 1:02d}  {title}', FX('jb7', 18), pw): d.text((x, y), l, font=FX('jb7', 18), fill=INK); y += 26
        y += 8
        for l in wrap(line, FX('ibold', 19), pw): d.text((x, y), l, font=FX('ibold', 19), fill=INK); y += 25
        y += 8
        for l in wrap(note, FX('imed', 17), pw): d.text((x, y), l, font=FX('imed', 17), fill=GREY); y += 22
    S.save(f'{OUT}/board_{sh + 1}.jpg', quality=90)
print('ok', len(P))

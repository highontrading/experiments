# Edit decision list for the AI & Advertising Hinglish trailer.
# 24 fps, 144 BPM -> 1 beat = 10 frames, montage cut = 20 frames (mirrors reference "Industrial 47").
import os
SP = os.path.dirname(os.path.abspath(__file__))
A = f'{SP}/assets'
SITE = sorted(os.listdir(f'{A}/site'))
VID = [f for f in SITE if f.endswith('.mp4')]
IMG = [f for f in SITE if f.endswith('.png')]
def v(n): return f'{A}/site/{VID[n-1]}'          # v01..v15 (same order as preview strips)
def i(n): return f'{A}/site/{IMG[n]}'            # i00..i44
STORY = f'{A}/archive/storytv.mp4'; BTS = f'{A}/archive/bts.mp4'; TVC = f'{A}/archive/tvc48.mp4'
UI = f'{SP}/screen/ui.webm'; WEB = f'{SP}/screen/site.webm'

FPS = 24
TOTAL = 1836
DROP = 290            # frame where the beat drops (12.083 s)

# Shot kinds:
#  ('vid', src, t, mode, opts)  mode: fill | pill | pillblur ; opts: cy, zoom, speed, push
#  ('tri', [(src,t),(src,t),(src,t)], opts)
#  ('still', path, mode, opts)
#  ('black',) ('noise',) ('card',)
S = []   # list of (start_frame, end_frame, shot)
def add(n, shot):
    s = S[-1][1] if S else 0
    S.append((s, s + n, shot))

# ---------------- A. Cold open: archive "interview" + Hinglish dub ----------------
add(5,  ('noise',))
add(55, ('vid', STORY, 170.2, 'fill', {}))                    # wide: two men at desk (question)
add(8,  ('vid', STORY, 208.0, 'fill', {'zoom': 1.08}))         # answer man
add(16, ('vid', STORY, 669.5, 'fill', {}))                     # STUDIO - tv studio set
add(16, ('vid', BTS, 104.0, 'fill', {}))                       # CAMERA - man with camera
add(17, ('vid', BTS, 153.0, 'fill', {}))                       # CREW - crew filming
add(15, ('vid', TVC, 292.0, 'fill', {}))                       # MODEL - 1959 studio commercial models
add(42, ('vid', STORY, 258.0, 'fill', {'zoom': 1.18, 'cy': 0.35}))  # punch-in close: "teen hafte"
# ---------------- B. Strobe of AI stills: 18 x 3 frames ----------------
for k in [3, 7, 10, 16, 18, 21, 23, 26, 29, 30, 33, 1, 2, 5, 12, 24, 27, 0]:
    add(3, ('still', i(k), 'fill', {'cy': 0.4}))
add(3,  ('still', i(0), 'fill', {'cy': 0.4}))                 # pixelate-out frames (effect applied)
add(24, ('black',))                                            # 1 s silence
add(35, ('vid', v(6), 0.45, 'fill', {'cy': 0.3}))               # punchline: "Shoot? Kaun sa shoot?"
assert S[-1][1] == DROP, S[-1][1]

# ---------------- C. Montage, one cut per 2 beats ----------------
M = [
 # B1 PRODUCT
 ('vid', v(10), 1.0, 'pillblur', {}),
 ('vid', UI, 3.3, 'fill', {'zoom': 1.6, 'cy': 0.12, 'cx': 0.02}),
 ('vid', UI, 6.7, 'fill', {'zoom': 1.15, 'cx': 0.62}),
 ('still', i(41), 'fill', {'push': 0.06}),
 ('tri', [(v(12), 3.6), (v(10), 3.5), (v(14), 2.0)], {}),
 ('vid', v(11), 4.2, 'pillblur', {}),
 ('vid', v(14), 3.0, 'pillblur', {}),
 ('still', i(29), 'fill', {'push': 0.06, 'cy': 0.45}),
 # B2 MODELS & FASHION
 ('tri', [(v(13), 1.0), (v(13), 5.6), (v(13), 8.0)], {}),
 ('still', i(35), 'fill', {'push': 0.06, 'cy': 0.55}),
 ('still', i(7), 'fill', {'push': 0.06, 'cy': 0.35}),
 ('still', i(20), 'fill', {'push': 0.06, 'cy': 0.3}),
 ('still', i(26), 'fill', {'push': 0.06, 'cy': 0.35}),
 ('still', i(25), 'fill', {'push': 0.06, 'cy': 0.35}),
 ('vid', v(3), 22.6, 'fill', {}),
 ('still', i(0), 'fill', {'push': 0.06, 'cy': 0.3}),
 # B3 UGC
 ('vid', v(2), 0.6, 'fill', {}),
 ('vid', v(4), 6.0, 'pillblur', {}),
 ('vid', v(5), 4.5, 'fill', {'cy': 0.3}),
 ('vid', v(6), 6.6, 'fill', {'cy': 0.3}),
 ('tri', [(v(4), 9.6), (v(12), 8.2), (v(7), 2.4)], {}),
 ('vid', v(2), 12.0, 'fill', {}),
 ('vid', v(5), 10.2, 'fill', {'cy': 0.3}),
 ('vid', v(6), 10.6, 'fill', {'cy': 0.3}),
 # B4 CGI & SURREAL (slot 6 = burst)
 ('vid', v(1), 2.6, 'fill', {}),
 ('vid', v(7), 0.6, 'pillblur', {}),
 ('vid', v(8), 1.0, 'pillblur', {}),
 ('vid', v(1), 8.4, 'fill', {}),
 ('vid', v(14), 1.6, 'pillblur', {}),
 'BURST',
 ('still', i(10), 'fill', {'push': 0.06, 'cy': 0.4}),
 ('vid', v(7), 9.3, 'pillblur', {}),
 # B5 CAMPAIGN FILMS
 ('vid', v(3), 27.0, 'fill', {}),
 ('vid', v(9), 0.4, 'pillblur', {}),
 ('still', i(2), 'fill', {'push': 0.06, 'cy': 0.5}),
 ('still', i(12), 'fill', {'push': 0.06, 'cy': 0.35}),
 ('still', i(24), 'fill', {'push': 0.06, 'cy': 0.45}),
 ('vid', v(3), 25.4, 'fill', {}),
 ('still', i(28), 'fill', {'push': 0.06, 'cy': 0.4}),
 ('still', i(30), 'fill', {'push': 0.06, 'cy': 0.55}),
 # B6 META ADS & VARIATIONS
 ('vid', WEB, 3.2, 'fill', {'zoom': 1.25, 'cy': 0.2}),
 ('still', i(39), 'fill', {'push': 0.05}),
 ('still', i(43), 'fill', {'push': 0.05}),
 ('still', i(5), 'fill', {'push': 0.06, 'cy': 0.35}),
 ('still', i(16), 'fill', {'push': 0.06, 'cy': 0.4}),
 ('still', i(40), 'fill', {'push': 0.05}),
 ('vid', WEB, 14.0, 'fill', {'zoom': 1.2, 'cy': 0.4}),
 ('still', i(44), 'fill', {'push': 0.05}),
 # B7 lead-in to build
 ('vid', v(12), 8.0, 'pillblur', {}),
 ('still', i(22), 'fill', {'push': 0.06, 'cy': 0.35}),
 ('still', i(33), 'fill', {'push': 0.06, 'cy': 0.5}),
 ('still', i(17), 'fill', {'push': 0.06, 'cy': 0.45}),
]
BURST = [('vid', v(1), 4.4, 'fill', {}), ('vid', v(12), 3.9, 'pillblur', {}), ('vid', v(10), 6.1, 'pillblur', {}),
         ('vid', v(11), 8.0, 'pillblur', {}), ('vid', v(14), 3.4, 'pillblur', {})]
for m in M:
    if m == 'BURST':
        for k, b in enumerate(BURST): add(4, b)
    else:
        add(20, m)
assert S[-1][1] == 1330, S[-1][1]
# double-time build: 8 x 10 frames
for m in [('vid', v(10), 9.0, 'pillblur', {}), ('vid', v(12), 5.2, 'pillblur', {}), ('still', i(3), 'fill', {'cy': 0.3}),
          ('vid', v(14), 4.4, 'pillblur', {}), ('still', i(15), 'fill', {'cy': 0.4}), ('vid', v(1), 6.4, 'fill', {}),
          ('still', i(27), 'fill', {'cy': 0.45}), ('vid', v(11), 2.0, 'pillblur', {})]:
    add(10, m)
add(20, ('vid', v(1), 3.2, 'fill', {'speed': 0.8}))              # hero hit
add(7,  ('vid', v(1), 4.0, 'fill', {}))                          # glitch transition (effect applied)
# ---------------- D. Breakdown: long holds + narrator ----------------
add(93, ('vid', v(13), 0.6, 'pillblur', {'speed': 0.6, 'push': 0.05}))
add(70, ('vid', v(3), 22.5, 'fill', {'speed': 0.6, 'push': 0.05}))
add(90, ('vid', v(14), 1.2, 'pillblur', {'speed': 0.6, 'push': 0.05}))
add(11, ('vid', v(14), 3.5, 'pillblur', {}))                     # glitch -> logo
add(TOTAL - S[-1][1], ('card',))
assert S[-1][1] == TOTAL

# ---------------- Effects ----------------
GLITCH = [  # (start, end, style)
    (0, 16, 'open'), (171, 174, 'out'), (228, 231, 'pixel'), (1430, 1437, 'melt'), (1690, 1701, 'logo')]
CARD_START = 1701
FADE = (1812, 1828)

# Subtitles: (start_frame, end_frame, text)
SUBS = [
    (6, 40, 'EK AD SHOOT KE LIYE'), (40, 66, 'KYA KYA CHAHIYE?'),
    (68, 84, 'STUDIO.'), (84, 100, 'CAMERA.'), (100, 117, 'CREW.'), (117, 132, 'MODEL.'),
    (132, 151, 'AUR KAM SE KAM'), (151, 171, 'TEEN HAFTE.'),
    (255, 290, '“SHOOT? KAUN SA SHOOT?”'),
    (1450, 1503, 'GENERATE BUTTON TOH AAJ SABKE PAAS HAI.'),
    (1518, 1574, 'LEKIN AI SE AISA AD BANANA,'),
    (1584, 1615, 'JO SHOOT KIYA HUA LAGE...'),
    (1634, 1676, 'WOHI HAI ASLI SKILL.'),
]
# Montage chapter labels (same subtitle style), shown for the first 3 cuts of each 8-cut block
LABELS = [
    (DROP, DROP + 60, 'PRODUCT SHOOT — BINA STUDIO'),
    (450, 510, 'MODEL SHOOT — BINA MODEL'),
    (610, 670, 'UGC ADS — BINA CREATOR'),
    (770, 830, 'CGI ADS — BINA 3D TEAM'),
    (930, 990, 'CAMPAIGN FILMS — BINA CREW'),
    (1090, 1150, 'META ADS — 20 VARIATIONS, EK DIN MEIN'),
    (1250, 1310, '11 MODULES · 41 LESSONS'),
]

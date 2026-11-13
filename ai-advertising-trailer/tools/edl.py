# Edit decision list v2 — AI in Advertising Hinglish trailer (16:9 + 9:16 from one EDL).
# 24 fps, 144 BPM -> 1 beat = 10 frames. Montage: mostly 20f cuts (2 beats) + 10f bursts.
import os
SP = os.path.dirname(os.path.abspath(__file__))
A = f'{SP}/assets'
SITE = sorted(os.listdir(f'{A}/site'))
VID = [f for f in SITE if f.endswith('.mp4')]
IMG = [f for f in SITE if f.endswith('.png')]
def v(n): return f'{A}/site/{VID[n-1]}'          # website films v01..v15
def i(n): return f'{A}/site/{IMG[n]}'            # website stills i00..i44
def d(n): return f'{A}/px/{n}.mp4'               # drive + attached films (24fps proxies)
STORY = f'{A}/archive/storytv.mp4'; BTS = f'{A}/archive/bts.mp4'; TVC = f'{A}/archive/tvc48.mp4'
UI = f'{SP}/screen/ui.webm'; WEB = f'{SP}/screen/site.webm'
U = d('u_attach'); RC = d('r_clip1h')

FPS = 24
TOTAL = 1836
DROP = 290

# shot = ('vid', src, t, opts) | ('still', path, opts) | ('black',) | ('noise',) | ('card',)
# opts: cy/cx/zoom (16:9 framing), vcx/vcy/vzoom (9:16 framing), vmode='blurfit' (fit inside blurred bg in 9:16),
#       hmode='blurfit' (same in 16:9), speed, push
S = []
def add(n, shot):
    s = S[-1][1] if S else 0
    S.append((s, s + n, shot))
def V_(src, t, **o): return ('vid', src, t, o)
def I_(p, **o): return ('still', p, o)

# ---------------- A. Cold open (archive + Hinglish dub) ----------------
add(5,  ('noise',))
add(55, V_(STORY, 170.2, vmode='blurfit'))
add(8,  V_(STORY, 208.0, zoom=1.08))
add(16, V_(STORY, 669.5, vcx=0.45))
add(16, V_(BTS, 104.0, vcx=0.6))
add(17, V_(BTS, 153.0, vmode='blurfit'))
add(15, V_(TVC, 292.0, vmode='blurfit'))
add(42, V_(STORY, 258.0, zoom=1.18, cy=0.35, vcx=0.5))
for k in [3, 7, 10, 16, 18, 21, 23, 26, 29, 30, 33, 1, 2, 5, 12, 24, 27, 0]:
    add(3, I_(i(k), cy=0.4))
add(3,  I_(i(0), cy=0.4))
add(24, ('black',))
add(35, V_(v(6), 0.45, cy=0.3, vcx=0.5))
assert S[-1][1] == DROP

# ---------------- C. Montage ----------------
P = [20, 20, 20, 20, 20, 20, 10, 10, 10, 10]           # 160 f per chapter
BLOCKS = [
 # B1 PRODUCT SHOOT — BINA STUDIO
 [V_(v(10), 1.0), V_(UI, 3.3, zoom=1.6, cy=0.12, cx=0.02, vzoom=1.0, vcx=0.0, vcy=0.3), V_(UI, 6.9, zoom=1.15, cx=0.62, vcx=0.62),
  V_(v(12), 3.6), V_(RC, 34.0, vcx=0.5), V_(v(11), 4.2), V_(v(14), 3.0), V_(RC, 50.6, vcx=0.45), V_(v(10), 6.1),
  I_(i(41), push=0.05, vmode='blurfit')],
 # B2 MODEL SHOOT — BINA MODEL
 [V_(U, 3.95), V_(v(13), 5.6), V_(RC, 36.8, vcx=0.5), V_(U, 20.1), V_(RC, 20.6, vcx=0.42), V_(U, 8.9),
  V_(U, 23.0), V_(v(13), 12.2), V_(U, 11.45), V_(U, 25.1)],
 # B3 UGC ADS — BINA CREATOR
 [V_(d('r_vlog'), 0.2, vcx=0.45), V_(v(2), 0.6, vcx=0.35), V_(d('r_F3kR'), 4.6, vcx=0.5), V_(v(6), 6.6, cy=0.3, vcx=0.45),
  V_(d('r_IC1N'), 0.3, vcx=0.45), V_(d('r_Jc3V'), 3.0), V_(d('n_UA1z'), 7.6, vcx=0.45), V_(v(5), 4.5, cy=0.3, vcx=0.5),
  V_(d('r_vlog'), 4.5, vcx=0.5), V_(v(4), 6.0)],
]
B4 = [(20, V_(d('r_BAka'), 0.5, vcx=0.5)), (20, V_(v(1), 2.6, vcx=0.5)), (20, V_(d('a_utOs'), 4.6, vmode='blurfit')),
      (20, V_(v(7), 0.6)),
      (4, V_(d('n_8fEt'), 4.6, vcx=0.5)), (4, V_(d('a_xcpc'), 6.7, vcx=0.4)), (4, V_(d('r_YOMY'), 10.5, vcx=0.5)),
      (4, V_(d('a_FCHv'), 18.2, vcx=0.75)), (4, V_(d('r_cWTY'), 4.6, vcx=0.5)),
      (20, V_(d('r_2yjn'), 5.0, vcx=0.45)),
      (10, V_(v(8), 1.0)), (10, V_(d('r_lHXD'), 12.0, vcx=0.45)), (10, V_(v(14), 2.0)), (10, V_(d('a_drYw'), 3.0, vcx=0.5))]
BLOCKS2 = [
 # B5 CAMPAIGN FILMS — BINA CREW
 [V_(d('a_FCHv'), 4.5, vcx=0.5), V_(d('a_AXNq'), 2.0, vcx=0.45), V_(d('a_aJ7I'), 16.5, vcx=0.55),
  V_(d('r_EmM3'), 4.6, vmode='blurfit'), V_(d('a_8R2a'), 6.0, vcx=0.5), V_(d('r_yigB'), 6.0, vcx=0.45),
  V_(d('n_pY4a'), 1.6, vcx=0.5), V_(RC, 2.0, vcx=0.45), V_(d('a_5zq_'), 6.0, vcx=0.5), V_(RC, 25.5, vcx=0.45)],
 # B6 META ADS — 20 VARIATIONS, EK DIN MEIN
 [V_(WEB, 3.2, zoom=1.25, cy=0.2, vzoom=1.0, vcx=0.5), I_(i(43), push=0.05, vmode='blurfit'), V_(v(12), 9.75),
  I_(i(39), push=0.05, vmode='blurfit'), V_(WEB, 14.0, zoom=1.2, cy=0.4, vcx=0.5), V_(d('r_BAka'), 13.0, vcx=0.75),
  I_(i(40), vmode='blurfit'), V_(v(10), 13.75), V_(d('a_qU9O'), 10.5, vcx=0.5), I_(i(44), vmode='blurfit')],
]
for blk in BLOCKS:
    for n, s in zip(P, blk): add(n, s)
for n, s in B4: add(n, s)
for blk in BLOCKS2:
    for n, s in zip(P, blk): add(n, s)
# B7 lead-in: 11 MODULES · 41 LESSONS
for n, s in [(20, V_(d('a_W1Bf'), 6.0, vcx=0.5)), (20, V_(d('r_J04h'), 2.9, vcx=0.5)), (10, V_(d('n_ValG'), 18.0, vcx=0.5)),
             (10, V_(d('r_pt4B'), 1.6, vcx=0.55)), (10, V_(d('a_O_xN'), 6.0, vcx=0.5)), (10, V_(U, 30.8))]:
    add(n, s)
assert S[-1][1] == 1330, S[-1][1]
for s in [V_(d('r_9E0I'), 3.4, vmode='blurfit'), V_(d('a_xcpc'), 9.0, vcx=0.5), V_(d('r_TJz4'), 8.5, vcx=0.5),
          V_(d('n_ValG'), 25.0, vcx=0.5), V_(d('a_NaKN'), 4.5, vcx=0.45), V_(d('r_cWTY'), 12.0, vcx=0.5),
          V_(v(1), 6.4, vcx=0.5), V_(d('r_mqh8'), 7.5, vcx=0.45)]:
    add(10, s)
add(20, V_(d('r_vYTK'), 4.4, vcx=0.5))                 # hero hit: dragon fire
add(7,  V_(d('r_vYTK'), 5.3, vcx=0.5))                 # glitch melt
# ---------------- D. Breakdown ----------------
add(93, V_(d('r_uoJa'), 14.2, speed=0.7, push=0.04, vcx=0.45))
add(70, V_(d('a_W1Bf'), 13.4, speed=0.7, push=0.04, vcx=0.6))
add(90, V_(d('r_9E0I'), 5.4, speed=0.6, push=0.04, vcx=0.55))
add(11, V_(d('r_9E0I'), 8.0, vcx=0.55))
add(TOTAL - S[-1][1], ('card',))
assert S[-1][1] == TOTAL

GLITCH = [(0, 16, 'open'), (171, 174, 'out'), (228, 231, 'pixel'), (1430, 1437, 'melt'), (1690, 1701, 'logo')]
CARD_START = 1701
FADE = (1812, 1828)
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
LABELS = [
    (DROP, DROP + 60, 'PRODUCT SHOOT — BINA STUDIO'),
    (450, 510, 'MODEL SHOOT — BINA MODEL'),
    (610, 670, 'UGC ADS — BINA CREATOR'),
    (770, 830, 'CGI ADS — BINA 3D TEAM'),
    (930, 990, 'CAMPAIGN FILMS — BINA CREW'),
    (1090, 1150, 'META ADS — 20 VARIATIONS, EK DIN MEIN'),
    (1250, 1310, '11 MODULES · 41 LESSONS'),
]

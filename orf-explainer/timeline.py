# Single source of truth for the ORF explainer.
# VO word times -> video times, scene boundaries, footage uses, SFX cues, music edit.
# Writes build/timeline.json (read by stage.js, mix.py, extract step).
import json, os

FPS = 30
LEAD = 0.5                      # silence before the first word
EXTRA = {27: 0.45, 211: 0.5}    # extra pause after word index (beat for the title / the ending)

raw = json.load(open("build/words.json"))
W = []
shift = LEAD
for i, w in enumerate(raw):
    W.append({"w": w["w"], "s": round(w["s"] + shift, 3), "e": round(w["e"] + shift, 3)})
    if i in EXTRA:
        shift += EXTRA[i]
s = lambda i: W[i]["s"]
e = lambda i: W[i]["e"]

# VO edit: (src_start, src_end, dst_start) pieces of build/vo.wav
vo_pieces = []
prev_src, dst = 0.0, LEAD
cuts = sorted(EXTRA)
for i in cuts:
    src_cut = raw[i]["e"] + 0.12        # just after the word ends
    vo_pieces.append([prev_src, src_cut, dst])
    dst += src_cut - prev_src + EXTRA[i]
    prev_src = src_cut
vo_pieces.append([prev_src, None, dst])

VO_END = e(len(W) - 1)
DUR = 96.0

# scenes: name -> (t0, t1)
B = {
    "old":      (0.0,          s(23) - 0.15),
    "title":    (s(23) - 0.15, s(28) - 0.05),
    "model":    (s(28) - 0.05, s(43) - 0.1),
    "thailand": (s(43) - 0.1,  s(67) - 0.1),
    "money":    (s(67) - 0.1,  s(81) - 0.1),
    "visit":    (s(81) - 0.1,  s(94) - 0.1),
    "cars":     (s(94) - 0.1,  s(112) - 0.1),
    "ev":       (s(112) - 0.1, s(134) - 0.1),
    "ai":       (s(134) - 0.1, s(154) - 0.1),
    "push":     (s(154) - 0.1, s(178) - 0.1),
    "standards":(s(178) - 0.1, s(197) - 0.1),
    "close":    (s(197) - 0.1, s(212) - 0.1),
    "end":      (s(212) - 0.1, DUR),
}
scenes = {k: {"t0": round(a, 3), "t1": round(b, 3)} for k, (a, b) in B.items()}

# transitions at scene boundaries (type, duration)
TRANS = {
    "title": ("burst", 0.5), "model": ("whip", 0.36), "thailand": ("rip", 0.5),
    "money": ("whip", 0.36), "visit": ("slide", 0.4), "cars": ("rip", 0.5),
    "ev": ("whip", 0.36), "ai": ("glitch", 0.4), "push": ("rip", 0.5),
    "standards": ("whip", 0.36), "close": ("burst", 0.5), "end": ("rip", 0.55),
}
trans = [{"at": scenes[k]["t0"], "to": k, "type": t, "d": d} for k, (t, d) in TRANS.items()]

# footage: key -> source clip, in-point, speed, grade, width; covers its scene (+margins)
F = {
    # key        src      in   speed grade  scene
    "forbidden": ("31010", 0.5, 0.8, "bw", "old"),
    "loans":     ("18296", 1.0, 1.0, "bw", "old"),
    "rail":      ("27768", 6.0, 1.0, "bw", "old"),
    "mega":      ("2088",  2.0, 1.0, "bw", "old"),
    "burn":      ("18303", 1.0, 1.0, "bw", "old"),
    "chess":     ("100113", 0.0, 1.0, "bw", "old"),
    "titleport": ("30979", 0.0, 0.7, "bw", "title"),
    "port":      ("36337", 0.0, 1.0, "duo", "model"),
    "cranes":    ("31011", 0.0, 1.0, "bw", "model"),
    "bkkdusk":   ("25968", 4.0, 1.0, "bw", "thailand"),
    "robot":     ("47258", 8.0, 1.0, "bw", "thailand"),
    "chinatown": ("2011",  1.0, 1.0, "bw", "thailand"),
    "skyline":   ("11071", 0.0, 1.0, "bw", "money"),
    "shanghai":  ("31042", 0.0, 1.0, "duo", "visit"),
    "handshake": ("24047", 1.0, 1.0, "bw", "visit"),
    "traffic":   ("27770", 10.0, 1.0, "duo", "cars"),
    "arm":       ("20970", 0.0, 1.0, "bw", "cars"),
    "evplug":    ("23126", 0.0, 1.0, "bw", "ev"),
    "evlot":     ("23125", 24.0, 1.0, "bw", "ev"),
    "dc":        ("23282", 0.0, 1.0, "duo", "ai"),
    "chip":      ("47051", 2.0, 1.0, "bw", "ai"),
    "flags":     ("13129", 2.0, 1.0, "bw", "push"),
    "ship":      ("34288", 4.0, 1.0, "bw", "push"),
    "parcels":   ("20770", 1.0, 1.0, "bw", "push"),
    "plug":      ("22982", 0.0, 1.0, "bw", "standards"),
    "fiber":     ("47050", 2.0, 1.0, "bw", "standards"),
    "globe":     ("21617", 1.0, 1.0, "bw", "close"),
    "endport":   ("31011", 3.0, 0.6, "bw", "end"),
}
footage = {}
for k, (src, tin, speed, grade, sc) in F.items():
    t0 = max(0, scenes[sc]["t0"] - 0.6)
    t1 = min(DUR, scenes[sc]["t1"] + 0.6)
    footage[k] = {"src": src, "in": tin, "speed": speed, "grade": grade, "t0": round(t0, 3), "t1": round(t1, 3),
                  "n": int((t1 - t0) * FPS) + 2}

# SFX cues: (time, name, gain dB)
X = []
def cue(t, name, db=0.0): X.append([round(t, 3), name, db])
sc = lambda k: scenes[k]["t0"]
# old playbook
cue(0.35, "shutter", -6); cue(0.30, "photo_drop", -4)
for i in (8, 9, 10): cue(s(i) - 0.04, "photo_drop", -3); cue(s(i) + 0.02, "stamp", -9)
cue(s(12), "scribble", -6); cue(s(15), "scribble", -6); cue(s(13) + 0.1, "stamp", -4)
cue(s(19) - 0.1, "whoosh_low", -6); cue(s(21) - 0.05, "photo_drop", -4)
# title
cue(sc("title") - 1.6, "riser", -6); cue(sc("title"), "whoosh_fast", -4)
cue(s(27), "impact", -2); cue(s(24), "whoosh_soft", -8)
# model
cue(sc("model"), "whoosh_fast", -5)
for i, n in ((28, "stamp"), (32, "tape"), (34, "tape"), (36, "coins"), (38, "pop"), (41, "stamp")): cue(s(i), n, -6)
# thailand
cue(sc("thailand"), "paper_tear", -5); cue(s(49), "ping", -3); cue(s(54), "scribble", -7)
cue(s(57), "photo_drop", -4); cue(s(63), "photo_drop", -4)
# money
cue(sc("money"), "whoosh_fast", -5); cue(s(75) - 0.1, "ticker", -8); cue(s(75) + 0.7, "pop", -5); cue(s(79), "stamp", -5)
# visit
cue(sc("visit"), "whoosh_soft", -5); cue(s(83), "ping", -6); cue(s(87), "ping", -8); cue(s(88), "ping", -9)
cue(s(91) - 0.05, "paper_flip", -4); cue(s(91) + 0.3, "paper_flip", -6); cue(s(92) + 0.2, "stamp", -5)
# cars
cue(sc("cars"), "paper_tear", -5); cue(s(96), "stamp", -4); cue(s(99), "scribble", -7); cue(s(107), "swoosh_up", -5)
# ev
cue(sc("ev"), "whoosh_fast", -5); cue(s(118) - 0.1, "ticker", -8); cue(s(128), "coins", -4); cue(s(112) + 0.4, "whoosh_soft", -10)
# ai
cue(sc("ai") - 0.1, "glitch", -3); cue(s(135), "stamp", -5); cue(s(140), "swoosh_up", -6); cue(s(141), "glitch", -7); cue(s(152), "keyboard", -8)
# push
cue(sc("push"), "paper_tear", -5)
for i in (159, 167, 174): cue(s(i), "photo_drop", -4)
for i in (164, 170, 175): cue(s(i) + 0.1, "stamp", -3)
# standards
cue(sc("standards"), "whoosh_fast", -5); cue(s(180), "stamp", -5); cue(s(185), "photo_drop", -5); cue(s(192), "pop", -5)
cue(s(194), "photo_drop", -5); cue(s(196), "stamp", -2)
# close
cue(sc("close"), "whoosh_soft", -4)
for i in (207, 208, 209, 210, 211): cue(s(i), "pop", -12)
# end
cue(sc("end"), "paper_tear", -4); cue(s(213), "impact", -6); cue(sc("end") + 1.6, "stamp", -6)

# music edit (source seconds in assets/music/music1.mp3), beat-cut on bars (92.3 bpm, D = drop)
D, P = 20.8515, 0.65016
BAR = 4 * P
drop_v = s(27) - 0.0          # beat drop lands on "price."
off = D - drop_v
g_end = D + 64 * P            # last groove bar start + its hit
music = [
    [off, g_end, 0.0],                                   # intro tail + groove
    [g_end - 5 * BAR, g_end, g_end - off],               # repeat last 5 groove bars
]
v = g_end - off + 5 * BAR
music.append([g_end, g_end + 4 * BAR, v]); v += 4 * BAR  # breakdown, first 4 bars
F_ = D + 96 * P                                          # finale downbeat
music.append([F_ - 2 * BAR, F_, v]); v += 2 * BAR        # breakdown's last 2 bars (build)
music.append([F_, None, v])                              # finale to the end

json.dump({"fps": FPS, "dur": DUR, "w": W, "scenes": scenes, "trans": trans, "footage": footage,
           "sfx": X, "vo": vo_pieces, "music": music, "vo_end": VO_END}, open("build/timeline.json", "w"), indent=1)
print("dur", DUR, "vo_end", VO_END, "finale at", round(v, 2))
for k, v_ in scenes.items(): print(f"{k:10s} {v_['t0']:6.2f} {v_['t1']:6.2f}  {v_['t1']-v_['t0']:5.2f}s")

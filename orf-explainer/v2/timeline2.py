# 16:9 edit — single source of truth. VO word times -> shots, footage, transitions, SFX, music edit.
# Writes v2/build/timeline.json. Run from orf-explainer/.
import json, os
os.makedirs("v2/build", exist_ok=True)
FPS, W_, H_ = 30, 1920, 1080
LEAD = 0.4
EXTRA = {34: 0.35}                 # beat after "price." for the title slam

raw = json.load(open("v2/words_raw.json"))
W, shift = [], LEAD
for i, w in enumerate(raw):
    W.append({"w": w["w"], "s": round(w["s"] + shift, 3), "e": round(w["e"] + shift, 3)})
    if i in EXTRA: shift += EXTRA[i]
s = lambda i: W[i]["s"]

# VO pieces (src_start, src_end, dst_start) from the untouched v4 take
vo, prev, dst = [], 0.0, LEAD
for i in sorted(EXTRA):
    cut = (raw[i]["e"] + raw[i + 1]["s"]) / 2
    vo.append([prev, cut, dst]); dst += cut - prev + EXTRA[i]; prev = cut
vo.append([prev, None, dst])

VO_END = W[-1]["e"]
DUR = round(VO_END + 2.6, 2)

# shots: name -> first word index (shot starts slightly before that word)
SHOTS = [
    ("old_full", 0), ("old_collage", 8), ("debt_full", 12), ("backlash", 19), ("chess_full", 26),
    ("title", 30), ("ship_full", 35), ("port_full", 42), ("share_gfx", 47),
    ("bkk_full", 58), ("map", 65), ("money_split", 81),
    ("cars_full", 96), ("ev_full", 108), ("ev_gfx", 120),
    ("ai_full", 128), ("ai_split", 134), ("dc_full", 138),
    ("push_full", 145), ("push_cards", 149),
    ("std_gfx", 168), ("plug_full", 175), ("fiber_full", 184),
    ("close", 188), ("end", 205),
]
PRE = {"old_collage": 0.45, "title": 0.15}
shots = {}
for k, (name, wi) in enumerate(SHOTS):
    t0 = 0.0 if k == 0 else round(s(wi) - PRE.get(name, 0.12), 3)
    shots[name] = {"t0": t0}
names = [n for n, _ in SHOTS]
for k, n in enumerate(names):
    shots[n]["t1"] = shots[names[k + 1]]["t0"] if k + 1 < len(names) else DUR

# transitions into a shot: (type, duration). Hard cuts land on the word.
TR = {
    "old_collage": ("rip", 0.45), "debt_full": ("whip", 0.34), "backlash": ("cut", 0), "chess_full": ("whip", 0.34),
    "title": ("burst", 0.5), "ship_full": ("flash", 0.25), "port_full": ("cut", 0), "share_gfx": ("rip", 0.45),
    "bkk_full": ("whip", 0.34), "map": ("rip", 0.45), "money_split": ("slide", 0.4),
    "cars_full": ("whip", 0.34), "ev_full": ("cut", 0), "ev_gfx": ("rip", 0.45),
    "ai_full": ("glitch", 0.4), "ai_split": ("cut", 0), "dc_full": ("cut", 0),
    "push_full": ("whip", 0.34), "push_cards": ("rip", 0.45),
    "std_gfx": ("burst", 0.5), "plug_full": ("flash", 0.25), "fiber_full": ("cut", 0),
    "close": ("whip", 0.34), "end": ("rip", 0.5),
}
trans = [{"at": shots[n]["t0"], "to": n, "type": t, "d": d} for n, (t, d) in TR.items()]

# footage: key -> (src, in, speed, grade, first shot, last shot, width)
FT = {
    "beijing":  ("11433", 0.0, 0.85, "film", "old_full", "old_full", 1920),
    "loans":    ("18296", 1.0, 1.0, "bw", "old_collage", "backlash", 960),
    "rail":     ("27768", 6.0, 1.0, "bw", "old_collage", "backlash", 960),
    "mega":     ("2088", 2.0, 1.0, "bw", "old_collage", "backlash", 960),
    "burn":     ("18303", 0.5, 1.0, "film", "debt_full", "debt_full", 1920),
    "chess":    ("100113", 0.0, 1.0, "film", "chess_full", "chess_full", 1920),
    "shipin":   ("30979", 0.0, 0.8, "film", "ship_full", "ship_full", 1920),
    "cranes":   ("31011", 0.0, 1.0, "film", "port_full", "port_full", 1920),
    "bkk":      ("21916", 1.0, 1.0, "film", "bkk_full", "bkk_full", 1920),
    "robot":    ("47258", 8.0, 1.0, "bw", "map", "map", 960),
    "chinatown":("2011", 1.0, 1.0, "bw", "map", "map", 960),
    "skyline":  ("11071", 0.0, 1.0, "film", "money_split", "money_split", 1920),
    "traffic":  ("27770", 10.0, 1.0, "film", "cars_full", "cars_full", 1920),
    "evplug":   ("22982", 0.0, 1.0, "film", "ev_full", "ev_full", 1920),
    "dc":       ("23219", 0.0, 1.0, "film", "ai_full", "ai_full", 1920),
    "chip":     ("47051", 2.0, 1.0, "film", "ai_split", "ai_split", 1920),
    "dc2":      ("23282", 2.0, 1.0, "film", "dc_full", "dc_full", 1920),
    "bkknight": ("21920", 0.5, 1.0, "film", "push_full", "push_full", 1920),
    "flags":    ("13129", 2.0, 1.0, "bw", "push_cards", "push_cards", 960),
    "ship":     ("34288", 4.0, 1.0, "bw", "push_cards", "push_cards", 960),
    "parcels":  ("20770", 1.0, 1.0, "bw", "push_cards", "push_cards", 960),
    "plug":     ("23125", 17.0, 1.0, "film", "plug_full", "plug_full", 1920),
    "fiber":    ("47050", 2.0, 1.0, "film", "fiber_full", "fiber_full", 1920),
    "globe":    ("21617", 1.0, 1.0, "bw", "close", "close", 960),
    "endport":  ("30125", 0.0, 0.7, "bw", "end", "end", 960),
}
footage = {}
for k, (src, tin, sp, grade, a, b, wd) in FT.items():
    t0 = max(0, shots[a]["t0"] - 0.6); t1 = min(DUR, shots[b]["t1"] + 0.6)
    footage[k] = {"src": src, "in": tin, "speed": sp, "grade": grade, "w": wd, "t0": round(t0, 3), "t1": round(t1, 3), "n": int((t1 - t0) * FPS) + 2}

# SFX cues
X = []
def cue(t, name, db=0.0): X.append([round(t, 3), name, db])
sh = lambda n: shots[n]["t0"]
cue(0.2, "whoosh_soft", -10)
for i in (8, 9, 11): cue(s(i) - 0.04, "photo_drop", -3)
cue(sh("old_collage"), "paper_tear", -7)
cue(sh("debt_full"), "whoosh_fast", -6); cue(s(18), "stamp", -3)
cue(s(19), "scribble", -6); cue(s(21), "stamp", -4); cue(s(23), "whoosh_low", -7)
cue(sh("chess_full"), "whoosh_fast", -6)
cue(sh("title") - 1.4, "riser", -7); cue(s(34), "impact", -2); cue(s(31), "whoosh_soft", -9)
cue(sh("ship_full"), "whoosh_low", -8); cue(s(35) + 0.3, "scribble", -9); cue(s(40), "coins", -6)
cue(s(44), "stamp", -5); cue(s(46), "stamp", -5)
cue(sh("share_gfx"), "paper_tear", -6); cue(s(49), "pop", -5); cue(s(52), "stamp", -4)
cue(sh("bkk_full"), "whoosh_fast", -6); cue(s(64), "impact", -9)
cue(sh("map"), "paper_tear", -6); cue(s(69), "ping", -4); cue(s(73), "photo_drop", -4); cue(s(78), "photo_drop", -4)
cue(sh("money_split"), "whoosh_soft", -6); cue(s(89) - 0.1, "ticker", -8); cue(s(94), "stamp", -5)
cue(sh("cars_full"), "whoosh_fast", -6); cue(s(97), "stamp", -5); cue(s(103) - 0.1, "swoosh_up", -6)
cue(s(114) - 0.1, "ticker", -9); cue(s(114) + 0.5, "pop", -6)
cue(sh("ev_gfx"), "paper_tear", -6); cue(s(122), "coins", -4)
cue(sh("ai_full") - 0.1, "glitch", -3); cue(s(135), "swoosh_up", -7); cue(s(139), "stamp", -5); cue(s(143), "keyboard", -9)
cue(sh("push_full"), "whoosh_fast", -6); cue(sh("push_cards"), "paper_tear", -6)
for i in (149, 157, 163): cue(s(i), "photo_drop", -4)
for i in (155, 161, 165): cue(s(i) + 0.1, "stamp", -3)
cue(sh("std_gfx"), "whoosh_soft", -6)
for i in (169, 170, 171, 173): cue(s(i), "tape", -8)
cue(sh("plug_full"), "whoosh_fast", -7); cue(s(183), "pop", -4); cue(s(187), "stamp", -2)
cue(sh("close"), "whoosh_soft", -5)
for i in (200, 201, 202, 203, 204): cue(s(i), "pop", -13)
cue(sh("end"), "paper_tear", -5); cue(s(206), "impact", -7)

# music edit on bars (music1.mp3: 92.3 bpm, drop at D)
D, P = 20.8515, 0.65016; BAR = 4 * P
off = D - s(34)
g_end = D + 64 * P
F_ = D + 96 * P
music = [[max(0, off), g_end, max(0, -off)]]
v = g_end - off
music.append([g_end - 2 * BAR, g_end, v]); v += 2 * BAR          # 2 more groove bars
music.append([g_end, g_end + 5 * BAR, v]); v += 5 * BAR          # breakdown, first 5 bars
music.append([F_ - 2 * BAR, F_, v]); v += 2 * BAR                # breakdown's last 2 bars (build)
music.append([F_, None, v])
finale = v

json.dump({"fps": FPS, "W": W_, "H": H_, "dur": DUR, "w": W, "shots": shots, "trans": trans, "footage": footage,
           "sfx": X, "vo": vo, "music": music, "vo_end": VO_END}, open("v2/build/timeline.json", "w"), indent=1)
print("dur", DUR, "vo_end", VO_END, "breakdown at", round(g_end - off + 2 * BAR, 2), "finale at", round(finale, 2))
for n in names: print(f"{n:12s} {shots[n]['t0']:6.2f} {shots[n]['t1']:6.2f} {shots[n]['t1']-shots[n]['t0']:5.2f}")

"""One timeline, three readers.

Layout in UI pixels (a 1920x1080 workspace) and every event in seconds.
The HTML stage (picture), sound.py (audio) and the prompt pack all read
what this file writes, so a hit on screen and its sound share one number.

    python timeline.py   ->  build/timeline.json + build/timeline.js
"""
import json
import pathlib

FPS = 30
DUR = 12.0
BPM = 120
BEAT = 60 / BPM          # 0.5 s: every landing, press and stamp sits on one
W, H = 1920, 1080


def frame(t):
    """Frame number for a time, 1-based like the pack's hit table."""
    return round(t * FPS) + 1


# ---------------------------------------------------------------- layout --
PANELS = {                      # x, y, w, h in UI pixels
    "topbar":   [0, 0, 1920, 52],
    "media":    [16, 68, 340, 580],
    "preview":  [372, 68, 1010, 580],
    "copilot":  [1398, 68, 506, 580],
    "timeline": [16, 664, 1888, 400],
}
DEPTH = {"topbar": 14, "media": 24, "preview": 24, "copilot": 24, "timeline": 24}
COMP = [437, 108, 880, 495]     # the 16:9 comp inside Preview

LANE = {"x0": 186, "x1": 1880, "edit_dur": 8.0}
PPS = (LANE["x1"] - LANE["x0"]) / LANE["edit_dur"]


def lane_x(et):
    """Edit time (s) -> x of the timeline lane in UI pixels."""
    return LANE["x0"] + et * PPS


RULER_Y = 715
TRACKS = {"MG": 765, "CAP": 827, "V1": 889, "SFX": 951, "A1": 1013}  # row centres
ROW_H = 58

CHIPS = {                       # Copilot tool chips
    "cut":         ["Cut to beat",  [1418, 232, 225, 52]],
    "captions":    ["Captions",     [1659, 232, 225, 52]],
    "mg":          ["Motion GFX",   [1418, 296, 225, 52]],
    "broll":       ["B-roll",       [1659, 296, 225, 52]],
    "sfx":         ["Sound FX",     [1418, 360, 225, 52]],
    "transitions": ["Transitions",  [1659, 360, 225, 52]],
}
VIBE_BTN = [1418, 540, 466, 88]
LOOKS = {                       # Media > Looks
    "teal":   ["Teal & Orange", [28, 486, 152, 40]],
    "film":   ["Film 35",       [192, 486, 152, 40]],
    "noir":   ["Noir",          [28, 536, 152, 40]],
    "pastel": ["Pastel Pop",    [192, 536, 152, 40]],
    "mono":   ["Mono Punch",    [28, 586, 152, 40]],
    "vhs":    ["VHS 89",        [192, 586, 152, 40]],
}


def centre(r):
    return [r[0] + r[2] / 2, r[1] + r[3] / 2]


# ------------------------------------------------------------ the edit ---
EDIT = {
    "clips": [                  # V1, 2 s each, cut on the bar
        {"name": "sunrise.mp4",    "t0": 0.0, "t1": 2.0},
        {"name": "city_night.mp4", "t0": 2.0, "t1": 4.0},
        {"name": "ocean.mp4",      "t0": 4.0, "t1": 6.0},
        {"name": "endcard.vibe",   "t0": 6.0, "t1": 8.0},
    ],
    "captions": [               # word, edit time
        [["NO", 0.15], ["TIMELINE", 0.55], ["GRIND.", 1.05]],
        [["JUST", 2.10], ["TYPE", 2.45], ["THE", 2.80], ["VIBE.", 3.20]],
        [["AI", 4.10], ["DOES", 4.45], ["THE", 4.80], ["EDIT.", 5.20]],
    ],
    "mg": [                     # motion graphics blocks on MG
        {"name": "Title: VIBE EDITING", "t0": 0.1, "t1": 1.9},
        {"name": "Lower third",         "t0": 2.15, "t1": 3.9},
        {"name": "Badge 10x",           "t0": 4.15, "t1": 5.9},
        {"name": "Logo slam",           "t0": 6.1, "t1": 7.9},
    ],
    "sfx": [                    # stamped by the four hops, one a beat
        {"name": "whoosh", "et": 2.0, "t": 6.0, "note": "C6"},
        {"name": "whoosh", "et": 4.0, "t": 6.5, "note": "E6"},
        {"name": "riser",  "et": 6.0, "t": 7.0, "note": "G6"},
        {"name": "hit",    "et": 7.6, "t": 7.5, "note": "C7"},
    ],
}

PROMPT_TEXT = ("8s launch reel for IdeaBro: cut to the beat, bold captions, "
               "glow titles, cinematic grade, hype SFX")

# ------------------------------------------------------------- Bro -------
# Feet positions [x, y, z]; z is height off the workspace plane.
SPOTS = {
    "comp":       [877, 420, 26],
    "cut":        centre(CHIPS["cut"][1]) + [28],
    "captions":   centre(CHIPS["captions"][1]) + [28],
    "mg":         centre(CHIPS["mg"][1]) + [28],
    "teal":       centre(LOOKS["teal"][1]) + [28],
    "sfx1":       [lane_x(2.0), TRACKS["SFX"], 32],
    "sfx2":       [lane_x(4.0), TRACKS["SFX"], 32],
    "sfx3":       [lane_x(6.0), TRACKS["SFX"], 32],
    "sfx4":       [lane_x(7.6), TRACKS["SFX"], 32],
    "playhead_a": [lane_x(7.6), RULER_Y, 44],
    "playhead_b": [lane_x(8.0), RULER_Y, 44],
    "vibe":       centre(VIBE_BTN) + [30],
    "end":        [1395, 640, 26],
}

HOPS = [  # take-off, landing, from, to, apex (UI px up), flip, what it presses
    {"t0": 2.12, "t1": 2.50, "a": "comp",       "b": "cut",        "apex": 170, "flip": 0, "press": "cut"},
    {"t0": 2.68, "t1": 3.00, "a": "cut",        "b": "captions",   "apex": 90,  "flip": 0, "press": "captions"},
    {"t0": 3.18, "t1": 3.50, "a": "captions",   "b": "mg",         "apex": 90,  "flip": 0, "press": "mg"},
    {"t0": 4.02, "t1": 4.50, "a": "mg",         "b": "teal",       "apex": 150, "flip": 1, "press": "teal"},
    {"t0": 5.55, "t1": 6.00, "a": "teal",       "b": "sfx1",       "apex": 150, "flip": 0, "press": "sfx1"},
    {"t0": 6.20, "t1": 6.50, "a": "sfx1",       "b": "sfx2",       "apex": 80,  "flip": 0, "press": "sfx2"},
    {"t0": 6.70, "t1": 7.00, "a": "sfx2",       "b": "sfx3",       "apex": 80,  "flip": 0, "press": "sfx3"},
    {"t0": 7.20, "t1": 7.50, "a": "sfx3",       "b": "sfx4",       "apex": 80,  "flip": 0, "press": "sfx4"},
    {"t0": 7.68, "t1": 8.00, "a": "sfx4",       "b": "playhead_a", "apex": 90,  "flip": 0, "press": "playhead"},
    {"t0": 9.62, "t1": 10.00, "a": "playhead_b", "b": "vibe",      "apex": 150, "flip": 0, "press": "vibe"},
    {"t0": 10.25, "t1": 10.70, "a": "vibe",     "b": "end",        "apex": 170, "flip": 1, "press": None},
]

BRO = {
    "knocks": [0.5, 1.0],       # knocks from inside the comp
    "peel": [1.5, 1.9],         # peels up off the screen as a flat card
    "pop": 2.0,                 # pops into 3D, the comp glass cracks
    "kick": 5.0,                # kicks the look into the comp
    "wave": [11.2, 12.0],
    "blinks": [3.8, 7.9, 11.6],
}

LUT = {"pop": 4.62, "kick": 5.0, "hit": 5.25, "wipe": [5.25, 5.6],
       "float": [268, 468, 90]}
SURF = {"t0": 8.0, "rewind_end": 8.4, "play_t0": 8.5, "t1": 9.6}

# playhead (edit time) keys: [t, ct, ease seconds]
CT_KEYS = [
    [0.0, 0.0, 0.0],
    [2.5, 1.25, 0.12],          # cut lands: park on the title frame
    [6.0, 2.15, 0.10],          # each stamp jumps the comp to its cut
    [6.5, 4.15, 0.10],
    [7.0, 6.15, 0.10],
    [7.5, 7.60, 0.10],
]

POWER_DOWN = [                  # every other panel powers down and falls
    ["timeline", 10.45], ["topbar", 10.60], ["media", 10.75], ["copilot", 10.95],
]

T = {
    "type": [0.15, 1.35], "cut": 2.5, "captions": 3.0, "mg": 3.5,
    "grade": 5.25, "vibe": 10.0, "fall_boom": 11.15, "yay": 11.25,
    "fade": [11.5, 12.0],
}

CAMERA = [  # t, focus x, focus y, dolly z, tilt deg, follow Bro 0..1
    [0.00, 960, 590, -450, 30, 0.0],
    [1.40, 900, 480, -160, 30, 0.0],
    [1.95, 878, 380, 260, 33, 0.0],
    [2.20, 1100, 360, 250, 36, 0.4],
    [2.50, 1530, 300, 400, 40, 1.0],
    [3.70, 1600, 300, 420, 40, 1.0],
    [4.10, 960, 430, -40, 34, 0.2],
    [4.55, 300, 480, 380, 40, 0.9],
    [5.05, 420, 470, 250, 38, 0.6],
    [5.40, 640, 440, 120, 36, 0.3],
    [5.85, 520, 820, 320, 42, 0.8],
    [6.10, 640, 900, 400, 44, 1.0],
    [7.60, 1700, 900, 400, 44, 1.0],
    [8.00, 1700, 800, 360, 42, 1.0],
    [9.60, 1700, 780, 320, 42, 1.0],
    [10.00, 1650, 600, 330, 38, 0.6],
    [10.55, 1150, 420, 60, 28, 0.0],
    [12.00, 930, 370, 240, 16, 0.0],
]
SHAKES = [[2.0, 14], [5.0, 9], [5.25, 6], [10.0, 12], [11.15, 7]]


def events():
    """Every sound-worthy hit, in order. sound.py reads exactly this."""
    ev = []
    t0, t1 = T["type"]
    n = len(PROMPT_TEXT)
    for i in range(0, n, 3):    # a key tap every third letter
        ev.append({"t": t0 + (t1 - t0) * i / n, "kind": "keytap"})
    for k in BRO["knocks"]:
        ev.append({"t": k, "kind": "knock"})
    ev.append({"t": BRO["peel"][0], "kind": "peel"})
    ev.append({"t": BRO["peel"][0] + 0.1, "kind": "riser", "dur": 0.5})
    ev.append({"t": BRO["pop"], "kind": "pop"})
    for h in HOPS:
        big = h["apex"] >= 150
        ev.append({"t": h["t0"], "kind": "boing", "big": big})
        if big:
            ev.append({"t": h["t0"] + 0.05, "kind": "whoosh", "dur": h["t1"] - h["t0"]})
        ev.append({"t": h["t1"], "kind": "pomf"})
    for name in ("cut", "captions", "mg"):
        ev.append({"t": T[name], "kind": "click"})
        ev.append({"t": T[name] + 0.02, "kind": "blip", "tool": name})
    for i in range(4):
        ev.append({"t": T["cut"] + 0.04 + i * 0.06, "kind": "snap", "i": i})
    words = [w for line in EDIT["captions"] for w in line]
    for i, _ in enumerate(words):
        ev.append({"t": T["captions"] + 0.03 + i * 0.035, "kind": "tick"})
    ev.append({"t": T["mg"] + 0.03, "kind": "swish"})
    ev.append({"t": T["mg"] + 0.25, "kind": "sparkle"})
    ev.append({"t": LUT["pop"], "kind": "select"})
    ev.append({"t": LUT["kick"], "kind": "thwack"})
    ev.append({"t": LUT["kick"] + 0.02, "kind": "whoosh", "dur": 0.25})
    ev.append({"t": LUT["hit"], "kind": "shimmer"})
    for s in EDIT["sfx"]:
        ev.append({"t": s["t"], "kind": "ding", "note": s["note"]})
    ev.append({"t": SURF["t0"], "kind": "rewind", "dur": SURF["rewind_end"] - SURF["t0"]})
    ev.append({"t": SURF["play_t0"], "kind": "skate", "dur": SURF["t1"] - SURF["play_t0"]})
    span = SURF["t1"] - SURF["play_t0"]
    for k in range(17):         # scrub tick every half second of edit time
        ev.append({"t": SURF["play_t0"] + span * k / 16, "kind": "scrub"})
    ev.append({"t": T["vibe"], "kind": "click"})
    ev.append({"t": T["vibe"], "kind": "brass"})
    ev.append({"t": T["vibe"] + 0.05, "kind": "shimmer"})
    for name, t in POWER_DOWN:
        ev.append({"t": t, "kind": "powerdown", "panel": name})
        ev.append({"t": t + 0.15, "kind": "whoosh", "dur": 0.35})
    ev.append({"t": T["fall_boom"], "kind": "boom"})
    ev.append({"t": T["yay"], "kind": "yay"})
    ev.append({"t": T["yay"] + 0.1, "kind": "sparkle"})
    for e in ev:
        e["frame"] = frame(e["t"])
    return sorted(ev, key=lambda e: e["t"])


def data():
    return {
        "fps": FPS, "dur": DUR, "bpm": BPM, "beat": BEAT, "w": W, "h": H,
        "panels": PANELS, "depth": DEPTH, "comp": COMP, "lane": LANE, "pps": PPS,
        "ruler_y": RULER_Y, "tracks": TRACKS, "row_h": ROW_H,
        "chips": CHIPS, "vibe_btn": VIBE_BTN, "looks": LOOKS,
        "edit": EDIT, "prompt_text": PROMPT_TEXT,
        "spots": SPOTS, "hops": HOPS, "bro": BRO, "lut": LUT, "surf": SURF,
        "ct_keys": CT_KEYS, "power_down": POWER_DOWN, "t": T,
        "camera": CAMERA, "shakes": SHAKES, "events": events(),
    }


if __name__ == "__main__":
    out = pathlib.Path(__file__).parent / "build"
    out.mkdir(exist_ok=True)
    d = data()
    (out / "timeline.json").write_text(json.dumps(d, indent=1))
    (out / "timeline.js").write_text("window.TL = " + json.dumps(d) + ";\n")
    print(f"{len(d['events'])} events, {int(DUR * FPS)} frames -> {out}")

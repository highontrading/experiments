"""Single source of truth for the trailer: VO placement on the beat grid, scene times, SFX hits.
Writes build/timeline.json, which stage.js (picture) and mix.py (sound) both read.

Beat grid of the score: beat k = DROP + k * BEAT (90 BPM). The score file starts at SCORE_AT.
"""
import json, os

FPS = 30
DROP = 4.54            # first downbeat of the score = the drop after the first light leak
BEAT = 0.667
SCORE_AT = 4.47        # score_a.mp3 t=0 is placed here (its first kick lands on DROP)
def B(k): return round(DROP + k * BEAT, 3)

# VO line index -> absolute start time (s). Lines are in vo.py; key words land on beats.
VO_AT = {
    0: 0.20,   # Advertising has always followed the same pattern.
    1: 3.05,   # A new medium appears.
    2: 4.62,   # Print.
    3: 5.27,   # Radio.
    4: 5.93,   # Television.
    5: 6.70,   # The internet.
    6: 7.95,   # And every time... not every brand makes the jump.
    7: B(11),  # Some still book the studio, the crew, the three-week shoot...
    8: B(16),  # like it still makes sense.
    9: 16.75,  # Others wake up inside the new one. And move.   ("move" ~ B(21))
    10: B(22), # No studio. No crew. No waiting.
    11: B(26), # One product photo becomes a whole campaign.
    12: B(30), # Right now, AI is that medium.
    13: 26.90, # And the gap between brands that direct it, and brands that ignore it...  ("gap" = B(34))
    14: B(39), # is growing every single day.
    15: 32.70, # Shoot-quality ads. Without the shoot.
    16: 41.40, # Two kinds of advertisers are forming.
    17: 44.25, # The ones who shoot. And the ones who direct.
    18: B(64), # Which one are you?
}

T = {   # scene boundaries / key moments (s)
    "hook_end": 3.0,
    "leak1": 4.30, "history": 4.62,
    "black1": B(5),            # 7.875  "And every time"
    "oldworld": B(11),         # collage builds
    "scatter": B(16),          # "like it still makes sense"
    "orb_born": 15.90, "orb_fill": 16.85, "cream": B(19),    # 17.21
    "logos": 17.90, "whip": B(21),                           # 18.55
    "nostudio": B(22), "product": B(26), "campaign": 22.80,
    "ai": 25.37, "gap": B(34),                               # 27.22
    "orbs": 27.85, "collapse": 29.30,
    "growing": B(39), "leak2": 32.22, "proof": B(42),        # 32.554
    "leak3": 40.95, "finale": 41.30,
    "stop": 48.00,             # hard stop of the music, right after "you?"
    "endcard": 48.15, "url": 51.30, "dur": 53.20,
}

# Proof montage: (clip id, start, end, title). Clips live in build/clips/<id>/f%04d.jpg
PROOF = [
    ("v10", B(42), B(44), "Beauty close-up"),
    ("v13", B(44), B(46), "CGI & surreal ad"),
    ("v4",  B(46), B(48), "AI UGC try-on haul"),
    ("v5",  B(48), B(49), "AI UGC routine"),
    ("v12", B(49), B(50), "Fashion film"),
    ("v1",  B(50), B(51), "Food & beverage ad"),
    ("v0",  B(51), B(52), "Campaign film"),
    ("v11", B(52), B(53), "Product ad"),
    ("v8",  B(53), B(54), "Luxury editorial"),
    ("v7",  B(54), T["finale"], "Model & fashion shoot"),
]

N_HOOK = 27                  # strobe images before the earth (assets/img/hook/h00..h26)
HOOK_STROBE_END = 2.30       # then h27 (earth) 2.30-2.43, h28 (earth zoom-out) 2.43-2.97
EV = {
    # strobe cut times: image i starts at frame round(i * 69 / 27)
    "hook_cuts": [round(round(i * HOOK_STROBE_END * FPS / N_HOOK) / FPS, 3) for i in range(N_HOOK)] + [2.30, 2.433],
    "ow_pops": [B(11), 12.16, 12.42, 12.76, 13.27, 13.87, 14.33, 14.60],          # old-world cards on the words
    "logo_pops": [round(17.90 + 0.055 * i, 3) for i in range(8)],
    "camp_pops": [22.80, 23.13, 23.47, 23.80, 23.97, 24.13, 24.30, 24.47, 24.63, 24.80],
    "orb_ignite": 27.85, "sats_in": 28.46,
}

def load_vo():
    lines = []
    for i, at in sorted(VO_AT.items()):
        d = json.load(open(f"build/vo/l{i:02d}.json"))
        lines.append({"i": i, "at": at, "text": d["text"],
                      "w": [{"w": w["w"], "s": round(at + w["s"], 3), "e": round(at + w["e"], 3)} for w in d["words"]]})
    return lines

if __name__ == "__main__":
    L = load_vo()
    # sanity: no VO overlaps
    for a, b in zip(L, L[1:]):
        if a["w"][-1]["e"] > b["at"] + 0.05:
            print(f"WARN overlap line {a['i']} ends {a['w'][-1]['e']} > line {b['i']} at {b['at']}")
    tl = {"fps": FPS, "dur": T["dur"], "drop": DROP, "beat": BEAT, "score_at": SCORE_AT,
          "T": T, "EV": EV, "L": L, "proof": [{"id": c, "s": s, "e": e, "title": t} for c, s, e, t in PROOF]}
    os.makedirs("build", exist_ok=True)
    json.dump(tl, open("build/timeline.json", "w"), indent=1)
    for l in L:
        print(f"{l['at']:6.2f}  " + " ".join(f"{w['w']}@{w['s']:.2f}" for w in l["w"]))

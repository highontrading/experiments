"""One idea, a hundred videos: punchy reel foley on the same word cues as the picture.
    python sound.py  ->  build/mix.wav"""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="trapanomics_arulo.mp3", music_db=-8, duck=0.45)
C = m.C
cuts = [k for k in C if k.startswith("c_")]

# every cut: a quick whoosh, alternating flavours; whips and the push-up get a bigger pass
for i, k in enumerate(sorted(cuts, key=lambda k: C[k])):
    t = C[k]
    if k in ("c_phone", "c_hand"):
        m.hit("whoosh_fast", t + 0.1, -12, align="peak")
    elif k == "c_total":
        m.hit("whoosh_deep_impact", t + 0.1, -14, align="peak")
    elif t > 0.2:
        m.hit("hit_swoosh_quick" if i % 2 else "whoosh_fast2", t + 0.02, -19, pan=0.25 if i % 2 else -0.25)


def word(t, g=-20, x=0):     # a headline word lands
    m.hit("punch_fast", t, g, pan=x / 700, rate=m.rng.uniform(0.95, 1.1), hp=200)


def tick_run(a, b, n, name="coins_clink", g=-24):   # a counter rolling
    for i in range(n):
        m.hit(name, a + (b - a) * (i / max(1, n - 1)) ** 0.8, g + m.rng.uniform(-2, 1), pan=m.rng.uniform(-0.3, 0.3),
              rate=m.rng.uniform(1.0, 1.25), length=0.25)


# hook
word(0.02, -18); m.hit("paper_slide", C["c_editor"] + 0.08, -15); word(C["editor"], -17)
m.hit("switch_tap", C["idea"] - 0.05, -12); word(C["idea"], -16)
for i in range(8): m.hit("paper_quick", C["hundred"] - 0.25 + i * 0.05, -24, pan=(i - 3.5) / 5, rate=m.rng.uniform(0.95, 1.1))
tick_run(C["hundred"] - 0.1, C["videos0"] + 0.35, 10, "atm_key", -22)
m.hit("coin_gold", C["videos0"] + 0.35, -16); word(C["videos0"], -18)

# doubt
m.typing(C["c_impossible"] + 0.02, C["c_impossible"] + 0.3, -24)
m.hit("stomp_impact", C["impossible"], -11)
m.hit("small_sweep", C["c_isnt"] + 0.02, -16); word(C["isnt"], -15)
m.hit("page_turn", C["c_why"] + 0.03, -16); m.hit("light_pop", C["why"] - 0.04, -15)

# code / settings
m.hit("paper_slide", C["c_code"] + 0.05, -15); m.typing(C["c_code"] + 0.2, C["c_code"] + 1.5, -21)
word(C["edit"], -18); word(C["code"], -16)
m.hit("soft_typing", C["c_setting"] + 0.05, -20)
for i in range(3): m.hit("ui_click", C["setting"] + i * 0.1, -18)
for k, x in (("text", -240), ("music", 240), ("language", -240), ("length", 240)):
    m.hit("paper_slide", C[k] - 0.14, -15, pan=x / 700, rate=m.rng.uniform(0.95, 1.05)); m.pop(C[k] - 0.02, x, -18)

# phone
word(C["change"], -18); m.hit("ui_click", C["change"] + 0.3, -14)
m.hit("camera_digital", C["newvid"] - 0.04, -12); m.hit("light_pop", C["video1"], -16)

# the maths
m.hit("stomp_impact", C["c_hooks"] + 0.06, -17); word(C["hooks"], -18)
for i in range(10): m.hit("paper_quick", C["hooks"] + i * 0.06, -24, pan=(-0.4 if i % 2 == 0 else 0.4), rate=m.rng.uniform(0.95, 1.1))
m.hit("stomp_impact", C["c_langs"] + 0.06, -17); word(C["languages"], -18)
for i in range(5): m.pop(C["c_langs"] + 0.24 + i * 0.12, (-1) ** i * 250, -19)
m.hit("stomp_impact", C["c_formats"] + 0.06, -17); word(C["formats"], -18)
for i in range(3): m.hit("paper_slide", C["formats"] - 0.15 + i * 0.12, -18, pan=(i - 1) * 0.4)
for i, dt in enumerate((-0.02, 0.1, 0.22, 0.34, 0.46)): m.hit("coins_clink", C["multiply"] + dt, -15 - (i % 2) * 3, length=0.4)
m.hit("riser_synth", C["videos2"], -17, align="peak")
tick_run(C["becomes"], C["fifty"] + 0.25, 16, "coins_clink", -23)
m.hit("money_bag", C["videos2"] - 0.05, -11); m.hit("impact_cool", C["videos2"] - 0.05, -14)

# old way / by hand
word(C["c_old"] + 0.04, -18); m.hit("glitch_text", C["oldway"] - 0.18, -20)
m.hit("paper_slide", C["c_hand"] + 0.08, -15)
t = C["newedit"] - 0.2
while t < C["c_vibe"] - 0.3:                 # the clock ticking through every hand edit
    m.hit("typewriter_soft_click", t, -20, pan=0.4, rate=m.rng.uniform(0.95, 1.05)); t += 0.25
tick_run(C["version"], C["hand"] + 0.4, 12, "atm_key", -25)
m.hit("stomp_impact", C["hand"] - 0.05, -10)

# vibe way
m.hit("whoosh_impact", C["c_vibe"] + 0.05, -16, align="peak"); m.hit("light_pop", C["c_vibe"] + 0.15, -16); word(C["vibeway"], -16)
m.hit("paper_slide", C["c_template"] + 0.05, -15); word(C["template"], -17)
m.typing(C["list"] - 0.05, C["list"] + 1.2, -20); m.hit("correct_tone", C["list"] + 0.9, -20)

# outro
m.hit("paper_slide", C["c_teams"] + 0.05, -15); word(C["small"], -18); word(C["teams"], -18)
for i in range(16): m.hit("paper_quick", C["c_studios"] + i * 0.02, -27, pan=m.rng.uniform(-0.5, 0.5), rate=m.rng.uniform(0.9, 1.2))
word(C["big"], -16); m.hit("impact_trailer", C["studios"] - 0.02, -16)
word(C["follow"], -15); m.hit("coin_gold", C["vibeediting"], -16)

m.finish()

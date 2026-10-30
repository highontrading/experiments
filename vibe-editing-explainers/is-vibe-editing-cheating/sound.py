"""Is vibe editing cheating? Voice + dark ambient bed + case-file foley, all on the picture's cues."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="cyberpunk_city_alejandro_magana.mp3", music_db=-9, duck=0.5)
C = m.C


def typed(at, n, cps, g=-24):          # typewriter clicks under a typed label
    for i in range(0, n, 2):
        m.hit("typewriter_soft_click", at + i / cps, g, pan=0.1, rate=m.rng.uniform(0.92, 1.1))


# 1 · reader
m.hit("whoosh_deep_impact", 0.02, -16, align="peak")
typed(0.05, 24, 34)
m.lay(0.45, 0, quiet=-2)
m.hit("impact_cool", C["cheating"] - 0.05, -13)
m.hit("stomp_impact", C["cheating"] - 0.03, -18)
# 2 · the newspaper
m.hit("paper_slide", C["video"] - 0.1, -12, rate=0.9)
m.hit("air_woosh", C["video"] + 0.05, -22, align="peak", length=0.8)
m.hit("scribble", C["video"] + 0.15, -18, length=0.55)
m.hit("writing_pencil", C["few"] - 0.05, -17, length=0.55)
# 3 · the accusation
m.hit("impact_big", C["s_claim"], -15)
m.hit("camera_digital", C["s_claim"] + 0.02, -22)
typed(C["s_claim"] + 0.05, 18, 60, -26)
typed(C["accusation"] - 0.2, 14, 40)
m.hit("whoosh_fast2", C["accusation"] + 0.42, -22, align="peak", length=0.6)
m.lay(C["ai1"] - 0.05, -300)
m.hit("impact_cool", C["work"] - 0.12, -15, pan=-0.3)
# 4 · exhibits
m.hit("whoosh_fast", C["s_ex"] + 0.2, -16, align="peak")
m.lay(C["s_ex"] + 0.1, 0, quiet=-3)
m.hit("scribble", C["no_tl"] - 0.2, -16, length=0.9)
m.hit("hit_swoosh_long", C["no_kf"] - 0.2, -20, align="peak")
for k, x in (("no_kf", 250), ("no_ln", 0)):
    m.hit("paper_slide", C[k] - 0.15, -14, pan=x / 700)
    m.hit("camera_shutter", C[k] - 0.05, -20, pan=x / 700)
    m.hit("scribble", C[k] + 0.35, -15, pan=x / 700, length=0.5)
m.hit("stomp_impact", C["no_ln"] + 0.55, -12)
# 5 · the twist
m.hit("riser_synth", C["twist"] - 0.05, -18, align="peak")
for k in ("but", "there", "was", "a"):
    m.hit("light_pop", C[k] - 0.05, -30, rate=0.8)
m.hit("impact_trailer", C["twist"] - 0.03, -11)
# 6 · every new tool
m.hit("hit_swoosh_long", C["s_hist"] + 0.25, -16, align="peak")
for k, x in (("every", -250), ("computer", 250), ("templates", -250), ("presets", 250)):
    m.hit("paper_slide", C[k] - 0.12, -15, pan=x / 700)
    m.hit("camera_shutter", C[k] - 0.02, -19, pan=x / 700)
for at, x in ((C["reaction"] - 0.05, -250), (C["computer"] + 0.35, 250), (C["templates"] + 0.3, -250), (C["presets"] + 0.25, 250)):
    m.hit("stomp_impact", at, -14, pan=x / 900, rate=m.rng.uniform(0.95, 1.05))
# 7 · what the AI can't pick
m.hit("whoosh_deep_impact", C["s_you"] + 0.25, -20, align="peak")
typed(C["s_you"] + 0.25, 22, 36, -26)
for k, x in (("story", -290), ("moment", 0), ("feeling", 290)):
    m.card(C[k] - 0.12, x)
    m.pop(C[k] + 0.1, x, -22)
# 7b · you do
m.hit("whoosh_deep_impact", C["youdo"] - 0.1, -14, align="peak")
m.hit("impact_cool", C["youdo"] - 0.02, -14)
# 8 · verdict
m.hit("whoosh_fast2", C["s_verdict"] + 0.42, -16, align="peak")
typed(C["s_verdict"] + 0.3, 11, 36, -25)
m.lay(C["is_it"] - 0.25, 0)
m.hit("impact_big", C["cheat2"] - 0.05, -12)
m.hit("camera_digital", C["only"] - 0.15, -20)
for k in ("only", "stop", "thinking"):
    m.hit("punch_fast", C[k] - 0.04, -15, rate=m.rng.uniform(0.95, 1.05))
m.hit("stomp_impact", C["thinking"] - 0.02, -15)
# 9 · CTA
m.hit("whoosh_fast", C["s_outro"] + 0.2, -16, align="peak")
m.hit("punch_fast", C["comment"] - 0.15, -18)
m.hit("punch_fast", C["verdict2"] - 0.1, -16)
m.hit("tape_switch", C["s_outro"] + 0.3, -18)
for k, d in (("comment", 0.1), ("verdict2", 0.3), ("join", -0.25)):
    m.hit("message_pop", C[k] + d, -14, rate=m.rng.uniform(0.95, 1.08))
m.typing(C["verdict2"] + 0.2, C["verdict2"] + 1.1, -24)
m.pop(C["join"] - 0.1, 0, -14)
m.hit("mouse_click", C["vibe"] + 0.6, -10)
m.hit("correct_tone", C["vibe"] + 0.66, -18)
m.finish()

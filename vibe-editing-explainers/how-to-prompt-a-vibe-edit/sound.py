"""Sound: Eleven v4 voice + 'Hazy After Hours' + punchy foley on every cut (reference-1 energy)."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="hazy_after_hours_alejandro_magana.mp3", music_db=-8, music_offset=8, duck=0.45)
C = m.C
W = ["whoosh_fast", "whoosh_fast2", "hit_swoosh_quick", "whoosh_stutter"]

# hook: lines draw, a lit tile, a strobing flash, then the drum of clips
m.hit("riser_synth", 0.0, -22, length=1.4)
m.hit("digital_tone", 0.08, -20)
m.hit("whoosh_fast2", 0.35, -20, pan=-0.3)
for k, at in enumerate([C["most"], C["ask"], C["ai"]]):
    m.hit("ui_click", at, -22, pan=(k - 1) * 0.4)
m.hit("camera_digital", C["video"], -12)
m.hit("camera_digital", C["video"] + 0.18, -16, rate=1.1)
m.hit("whoosh_deep_impact", C["then"], -13, align="peak")
m.hit("whoosh_stutter", C["then"] + 0.3, -22)
m.hit("impact_cool", C["generic"], -16)

# cuts between scenes: one whoosh per cut (peak on the cut), flashes get a shutter
cuts = [("s_fix", "flash"), ("s_goal", "whip"), ("s_format", "zoom"), ("s_vibe", "whipUp"), ("s_refs", "flash"),
        ("s_rules", "zoom"), ("s_outro", "whip"), ("s_final", "flash")]
for k, (c, kind) in enumerate(cuts):
    m.hit(W[k % 4], C[c], -13, pan=(0.35 if k % 2 else -0.35), align="peak")
    if kind == "flash":
        m.hit("camera_digital", C[c] + 0.02, -17)

# fix: studio bar, typing, cursor click on the orange button
m.typing(C["prompt"] - 0.2, C["prompt"] + 0.9, -21)
m.hit("mouse_click", C["fixes"] + 0.1, -9)
m.hit("impact_cool", C["fixes"] + 0.12, -19)

# goal: gold tag + chat typing
m.hit("riser_synth", C["goal"] - 0.6, -26, length=0.7)
m.hit("hit_swoosh_quick", C["goal"], -16)
m.hit("soft_typing", C["goal"], -17, length=2.0)
m.hit("digital_tone", C["watching"] + 0.35, -20)
m.pop(C["who"], 200, -18)

# format: three specs land, captions burn in
for k, c in enumerate(["vertical", "fortyfive", "captions"]):
    m.hit("hit_swoosh_quick", C[c], -17, pan=(-0.4, 0.4, -0.4)[k])
    m.hit("robot_click", C[c] + 0.06, -20)

# vibe: the strike, then one hit per mood
m.hit("glitch_text", C["cool"] + 0.35, -18)
m.hit("riser_trailer", C["calm"] - 1.0, -22, length=1.0)
for k, c in enumerate(["calm", "fast", "cinematic", "playful"]):
    m.hit("whoosh_impact" if k == 2 else "impact_cool", C[c] - 0.05, -14 if k == 2 else -17, pan=(k - 1.5) * 0.2)
    m.hit("camera_digital", C[c] - 0.08, -22, rate=1.05)

# refs: wall of clips pans, circles drawn
for k in range(3):
    m.hit("paper_quick", C["name"] + 0.2 + k * 0.38, -18, pan=(k - 1) * 0.4)
    m.pop(C["name"] + 0.45 + k * 0.38, (k - 1) * 300, -20)
m.hit("whoosh_fast", C["what"] - 0.1, -19)

# rules: spotlight on the camera, then god rays on the logo
m.hit("riser_trailer", C["real"] - 1.2, -20, length=1.3)
m.hit("stomp_impact", C["real"] + 0.1, -13)
m.hit("hit_swoosh_quick", C["only"], -17)
m.hit("impact_trailer", C["end"], -12)
m.hit("crystal_chime", C["logo"] + 0.1, -19)

# outro: five tags on a light trail, "stops guessing", final click
for k, c in enumerate(["o_goal", "o_format", "o_vibe", "o_refs", "o_rules"]):
    m.hit("hit_swoosh_quick", C[c], -16, pan=(-0.35 if k % 2 == 0 else 0.35))
    m.hit("robot_click", C[c] + 0.05, -21)
m.hit("impact_cool", C["stops"], -15)
m.typing(C["s_final"] + 0.1, C["s_final"] + 1.0, -22)
m.hit("mouse_click", C["follow"] + 0.9, -9)
m.hit("crystal_chime", C["follow"] + 1.0, -18)
m.finish()

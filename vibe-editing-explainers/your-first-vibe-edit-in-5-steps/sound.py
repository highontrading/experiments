"""Sound: Daylight Robbery (Michael Ramir C.) under the voice, plus crisp UI foley on the same
cues the picture uses (stage.js).  python sound.py -> build/mix.wav"""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="daylight_robbery_michael_ramir.mp3", music_db=-9, duck=0.5)
C = m.C


def typing(a, b, g=-21):          # soft keyboard bed for as long as text types
    m.hit("soft_typing", a, g, length=b - a)


def title(at, x=0):                # a big headline lands
    m.hit("hit_swoosh_quick", at, -22, pan=x / 700, align="peak")


def ring(at, x=0):                 # a lime click ring
    m.hit("mouse_click", at, -11, pan=x / 700)


def zoom(t0, d=0.45):              # zoom-through / whip between layouts
    m.hit("whoosh_fast", t0 + d * 0.5, -15, align="peak")


def marker(t0):                    # STEP n: whoosh into a soft impact on the numeral
    m.hit("whoosh_impact", t0 + 0.2, -17, align="peak", length=1.4)
    m.hit("impact_cool", t0 + 0.22, -19, length=1.3)


# ---- hook
m.hit("tech_slide", 0.02, -20)
m.card(0.05)
title(C["h_make"] + 0.05); title(C["h_vibe"], 80)
m.hit("bubble_pop", C["h_edit"], -15, pan=0.2)
zoom(C["h_under"] - 0.18, 0.42)
title(C["h_under"] - 0.1)
m.hit("impact_cool", C["h_ten"] - 0.05, -16, length=1.2)
m.hit("digital_buzzer", C["h_ten"] + 0.05, -30, length=0.35)
m.glide(C["h_no1"] - 0.2 + 0.2, 1, g=-16)
m.hit("ui_start", C["h_no1"] - 0.05, -18)
ring(C["h_no2"] - 0.35, 300); m.hit("small_sweep", C["h_no2"] - 0.2, -22)
m.hit("ui_start", C["h_no2"] - 0.03, -18, rate=1.06)
ring(C["s1"] - 0.6, 300); m.hit("small_sweep", C["s1"] - 0.45, -22)

# ---- step 1: one folder
marker(C["s1"] - 0.18)
zoom(C["s1_put"] - 0.3)
title(C["s1_put"] - 0.05)
ring(C["s1_folder"], -200)
for i in range(4):
    m.pop(C["s1_clips"] + 0.25 + i * 0.12, -200 + i * 130, g=-19)
ring(C["s1_clips"] + 0.76, 200)
m.hit("paper_quick", C["s1_music"], -18, pan=0.4); ring(C["s1_music"] + 0.35, -150)
m.hit("paper_quick", C["s1_logo"], -18, pan=0.4, rate=1.08); ring(C["s1_logo"] + 0.35, 200)

# ---- step 2: agent + brief
marker(C["s2"] - 0.18)
zoom(C["s2_open"] - 0.32)
m.hit("ui_click", C["s2_open"], -15); ring(C["s2_open"] - 0.05, -200)
title(C["s2_open"] - 0.1)
ring(C["s2_agent"] + 0.1)
zoom(C["s2_folder"] - 0.2)
m.hit("digital_tone", C["s2_folder"] - 0.45, -22)
title(C["s2_write"] - 0.1)
typing(C["s2_write"] - 0.4, C["s2_write"] - 0.4 + 2.3)
for i, k in enumerate(("s2_platform", "s2_length", "s2_mood", "s2_ends")):
    m.pop(C[k] + 0.05, -300 + i * 200, g=-17)
ring(C["s2_ends"] + 0.45, 300); m.hit("ui_start", C["s2_ends"] + 0.5, -20)

# ---- step 3: code + render
marker(C["s3"] - 0.18)
zoom(C["s3_let"] - 0.3)
title(C["s3_let"] - 0.05)
m.hit("robot_click", C["s3_let"] + 0.1, -20)
title(C["s3_writes"] - 0.1)
m.typing(C["s3_writes"] - 0.1, C["s3_writes"] + 1.6, g=-24)
m.hit("tech_slide", C["s3_renders"] - 0.1, -19)
m.hit("correct_tone", C["s3_draft"] + 0.2, -22)
m.card(C["s3_draft"] - 0.2, 300)
title(C["s3_draft"] - 0.15)

# ---- step 4: three notes
marker(C["s4"] - 0.18)
zoom(C["s4_watch"] - 0.35)
m.hit("ui_click", C["s4_watch"], -14)
title(C["s4_watch"] - 0.1)
for i in range(3):
    m.hit("paper_slide", C["s4_three"] + 0.05 + i * 0.22, -13, pan=(-0.4, 0.4, -0.3)[i])
title(C["s4_three"] - 0.05)
for i in range(14):
    m.hit("paper_quick" if i % 2 else "paper_crinkle", C["s4_not"] - 0.05 + i * 0.045, -24, pan=(i % 5 - 2) / 3,
          rate=0.9 + (i % 4) * 0.06, length=0.4)
m.hit("punch_fast", C["s4_fifty"], -20)
m.hit("whoosh_fast2", C["s4_three2"] + 0.1, -14, align="peak")
title(C["s4_three2"] - 0.05)

# ---- step 5: export, keep, change the brief
marker(C["s5"] - 0.18)
zoom(C["s5_export"] - 0.4)
m.hit("ui_start", C["s5"] + 1.05, -20)
ring(C["s5_export"], 250); title(C["s5_export"] - 0.1)
for i in range(6):
    m.hit("digital_tone", C["s5_export"] + 0.15 + i * 0.08, -32, rate=1 + i * 0.05, length=0.06)
m.hit("camera_shutter", C["s5_keep"] - 0.05, -12)
m.hit("message_pop", C["s5_keep"] + 0.05, -18)
m.hit("correct_tone", C["s5_project"], -21)
m.glide(C["s5_next"] - 0.3 + 0.22, 0, g=-15)
for i in range(3):
    m.hit("switch_tap", C["s5_next"] - 1.0 + 0.45 + i * 0.1, -20, pan=(-0.6, 0, 0.5)[i])
title(C["s5_next"] - 0.05)
m.hit("ui_click", C["s5_change"] - 0.1, -15)
typing(C["s5_change"] + 0.4, C["s5_change"] + 1.25)
m.hit("switch_tap", C["s5_brief"] + 0.8, -18, pan=0.6); m.hit("paper_quick", C["s5_brief"] + 0.75, -20, pan=0.6)

# ---- outro: comment VIBE, join vibe editing
m.glide(C["o_want"] - 0.25 + 0.21, 1, g=-15)
m.hit("ui_start", C["o_want"] - 0.05, -20)
title(C["o_template"] - 0.15)
m.glide(C["o_comment"] - 0.3 + 0.22, 0, g=-15)
title(C["o_comment"] - 0.1)
typing(C["o_comment"] + 0.15, C["o_comment"] + 0.6, g=-18)
ring(C["o_vibe"] + 0.4, 150)
m.hit("message_pop", C["o_vibe"] + 0.55, -13)
m.hit("impact_cool", C["o_join"] - 0.05, -15, length=1.6)
title(C["o_vibe2"] - 0.05)
m.hit("bubble_pop", C["o_editing"] + 0.2, -15)
m.hit("crystal_chime", C["o_editing"] + 0.6, -24)

m.finish()

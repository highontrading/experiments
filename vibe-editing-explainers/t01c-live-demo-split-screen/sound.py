"""Sound for T01C: the shared T01 music bed + close UI foley on every on-screen event.
    python sound.py  ->  build/mix.wav (-14 LUFS)"""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="tech_house_vibes_alejandro_magana.mp3", music_db=-9, duck=0.5)
C = m.C

# hook: the split window, the raw slot, the finished reel wiping in, the split collapsing
m.hit("ui_start", 0.05, -17)
m.card(0.1, 0)
m.pop(C["h_left"], -300, -18)
m.hit("tech_slide", C["h_finished"] - 0.1, -17, pan=0.4)
m.hit("whoosh_fast", C["h_finished"] + 0.1, -22, pan=0.4, align="peak")
m.pop(C["h_right"], 300, -18)
m.hit("whoosh_fast2", C["h_end"] + 0.25, -15, pan=0.5, align="peak")

# raw clip
m.lay(C["r_raw"], 0)
m.hit("ui_click", C["r_no"], -16)

# tell: the agent opens and listens
m.glide(C["tell"] - 0.2 + 0.4, 1)
m.hit("ui_start", C["tell"] - 0.05, -15)
m.hit("digital_tone", C["t_tell"], -24)

# the commands: the panel becomes the bar; each command lands, each DONE ticks
m.glide(C["c1"] - 0.25 + 0.4, 0)
for cue in ("c1", "c2", "c3", "c4"):
    m.hit("message_pop", C[cue] - 0.05, -18)
for cue in ("c1_done", "c2_done", "c3_done", "c4_done"):
    m.hit("correct_tone", C[cue] + 0.05, -16)
    m.hit("ui_click", C[cue], -18)
# c1: the timeline window, pauses snapping shut, -9 s
m.card(C["c1_cut"] - 0.15, 0)
for i in range(4):
    m.hit("ui_click", C["c1_pauses"] + 0.2 + i * 0.16, -15 - i, pan=-0.4 + 0.25 * i, rate=1.0 + 0.04 * i)
m.hit("tape_switch", C["c1_pauses"] + 0.2, -22)
m.pop(C["c1_done"] + 0.1, 300, -17)
# c2: the panel grows, captions pop word by word
m.glide(C["c2"] - 0.2 + 0.4, 1, g=-17)
t = C["c2_captions"]
while t < C["c3"] - 0.2:
    m.pop(t, 0, -24)
    t += 0.42
m.lay(C["c2_bold"], -250, quiet=2)
# c3: the warm wipe, the temperature chip, the music track
m.glide(C["c3"] - 0.2 + 0.4, 0, g=-18)
m.hit("small_sweep", C["c3_warmer"] + 0.1, -16)
m.pop(C["c3_warmer"] + 0.2, 330, -19)
m.hit("tech_slide", C["c3_soft"] - 0.1, -18, pan=0.5)
m.hit("crystal_chime", C["c3_music"] + 0.05, -22)
# c4: prints clip onto the string, the length rolls to 0:30, the logo card
m.glide(C["c4"] - 0.2 + 0.4, 1, g=-17)
for i in range(4):
    m.hit("paper_quick", C["c4_thirty"] + 0.15 + i * 0.22, -16, pan=-0.6 + 0.4 * i, rate=0.95 + 0.03 * i)
m.hit("digital_tone", C["c4_thirty"] + 0.1, -22)
m.hit("camera_shutter", C["c4_logo"], -14, pan=0.5)
m.hit("whoosh_impact", C["c4_logo"] + 0.1, -22, align="peak")

# just: the editor windows pop up and get closed; the mic takes the frame
m.glide(C["just"] + 0.3, 0)
m.hit("digital_buzzer", C["j_timeline"] - 0.05, -26, length=0.25)
m.hit("digital_buzzer", C["j_keyframes"] - 0.05, -26, length=0.25, rate=1.1)
m.hit("mouse_click", C["j_no2"] - 0.15, -12, pan=0.3)
m.hit("mouse_click", C["j_just"] - 0.2, -12, pan=0.1)
m.hit("glitch_text", C["j_no2"] - 0.05, -24)
m.hit("riser_synth", C["j_just"] - 0.9, -26, length=1.0)
m.hit("impact_cool", C["j_just"], -18)

# outro: the phone rises, follow, join
m.hit("whoosh_deep_impact", C["outro"] + 0.1, -18, align="peak")
m.hit("switch_tap", C["o_follow"] + 0.2, -11, pan=0.2)
m.hit("message_pop", C["o_follow"] + 0.3, -16)
m.hit("impact_cool", C["o_join"], -18)
m.pop(C["o_vibe2"] + 0.1, 0, -16)

m.finish()

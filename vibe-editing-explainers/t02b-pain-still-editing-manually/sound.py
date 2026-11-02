"""T02B sound: the voice, a ducked music bed, and close foley on every visual beat."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="masking_the_masters_eugenio_mininni.mp3", music_db=-9, music_offset=60, duck=0.5)
C = m.C

# hook: each word slams in; the last one hits hardest
for k, x in (("h_still", -100), ("h_editing", 100), ("h_reels", -60)):
    m.hit("punch_fast", C[k], -14, pan=x / 700)
    m.hit("hit_swoosh_quick", C[k] - 0.02, -20, align="peak")
m.hit("impact_trailer", C["h_manually"], -9)
m.hit("whoosh_deep_impact", C["h_manually"] + 0.02, -16)

# hours: flash in, the timer racing, the chart line, the reel card
m.hit("whoosh_fast", C["s_hours"] + 0.2, -15, align="peak")
m.hit("camera_shutter", C["s_hours"] + 0.2, -16)
t = C["three"]
while t < C["hours"] + 0.45:
    m.hit("typewriter_soft_click", t, -24, rate=m.rng.uniform(0.95, 1.1)); t += 0.075
m.hit("stomp_impact", C["hours"] + 0.45, -16)
m.card(C["one_reel"] - 0.25, 300)
m.lay(C["s_hours"] + 0.05, -200)

# trimming: a razor click on each pause
m.glide(C["s_trim"] + 0.2, 1)
for k in range(7):
    at = C["trimming"] + 0.12 + k * 0.27
    m.hit("scissors_cut", at, -17, pan=-0.3 + k * 0.1, length=0.25, rate=m.rng.uniform(1.0, 1.2))
    m.hit("mouse_click", at - 0.01, -20, pan=-0.3 + k * 0.1)
m.lay(C["pause"] - 0.2, 0)

# typing every caption
m.glide(C["s_type"] + 0.2, 0)
m.card(C["s_type"] + 0.05, -100)
m.typing(C["typing"] + 0.15, C["s_nudge"] + 0.1, -18)
m.pop(C["typing"] - 0.1, 0, -18)

# nudging: a key click each frame step
m.glide(C["s_nudge"] + 0.2, 1)
k, at = 0, C["nudging"] + 0.12
while at < C["s_then"] - 0.3:
    m.hit("ui_click", at, -16, pan=(0.35 if k % 2 == 0 else -0.35), rate=m.rng.uniform(0.95, 1.08)); k += 1; at += 0.34
m.lay(C["frame1"] - 0.2, 0)

# the pivot: a riser, footsteps of the camera, a door opening onto light
m.hit("riser_synth", C["then"] + 0.2, -19, align="peak")
m.hit("air_woosh", C["tried"] + 0.2, -20, align="peak")
m.hit("page_chime", C["something"] + 0.15, -18)
m.hit("crystal_chime", C["then_end"] + 0.05, -20)

# brief: the door grows into the sky; the sentence types; send
m.hit("whoosh_fast2", C["s_brief"] + 0.3, -16, align="peak")
m.hit("impact_cool", C["one_sentence"], -17)
m.card(C["s_brief"] + 0.1, 0)
m.typing(C["one_sentence"] + 0.15, C["brief_end"] - 0.1, -19)
m.pop(C["want"], -200, -17); m.pop(C["feel"], 200, -17)
m.hit("ui_start", C["brief_end"] - 0.05, -15)

# the AI assembles the edit
m.glide(C["s_ai"] + 0.2, 0)
for i in range(6):
    m.hit("light_pop", C["cuts"] - 0.15 + i * 0.12 + 0.2, -22, pan=-0.4 + i * 0.16, rate=m.rng.uniform(0.95, 1.15))
for i in range(9):
    m.hit("robot_click", C["captions"] - 0.1 + i * 0.07, -26, pan=-0.4 + i * 0.1)
m.hit("tech_slide", C["music"] - 0.2, -18)
for k, x in (("cuts", -100), ("captions", 0), ("music", 100)):
    m.hit("correct_tone", C[k] + 0.05, -20, pan=x / 700)

# one note, and post
m.glide(C["s_note"] + 0.2, 1)
m.card(C["s_note"] + 0.05, -200)
m.hit("paper_crinkle", C["note"] - 0.05, -14, length=0.4)
m.hit("correct_tone", C["note"] + 0.6, -18)
m.card(C["post"] - 0.55, 300)
m.hit("message_pop", C["post"], -12)

# same reel, fifteen minutes: chalk, the line dropping, a green hit
m.hit("whoosh_fast", C["s_same"] + 0.25, -16, align="peak")
m.typing(C["s_same"] + 0.2, C["s_same"] + 0.75, -24)
m.hit("riser_stutter", C["fifteen"] - 0.25, -21, align="peak")
m.hit("scribble", C["fifteen"] - 0.1, -18, length=0.35)
m.hit("impact_cool", C["fifteen"], -13)

# outro: flash into the sunset, warm chime, the search bar
m.hit("whoosh_deep_impact", C["s_outro"] + 0.25, -15)
m.hit("impact_big", C["join"], -15)
m.hit("bell_chime", C["join"] + 0.2, -16)
m.hit("crystal_chime", C["evenings"], -20)
m.card(C["outro_end"] - 0.2, 0, quiet=-2)
m.typing(C["outro_end"] + 0.1, C["outro_end"] + 0.95, -21)
m.hit("mouse_click", C["outro_end"] + 1.1, -16)
m.finish()

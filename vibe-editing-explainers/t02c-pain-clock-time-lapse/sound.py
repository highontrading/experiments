"""T02C · voice + the shared T02 bed + case-file foley, all on the picture's cues."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="masking_the_masters_eugenio_mininni.mp3", music_db=-9, music_offset=60, duck=0.5)
C = m.C


def typed(at, n, cps, g=-24, pan=0.1):    # typewriter clicks under typed text
    for i in range(0, n, 2):
        m.hit("typewriter_soft_click", at + i / cps, g, pan=pan, rate=m.rng.uniform(0.92, 1.1))


# 1 · hook: a clock ticking faster and faster while the hours race
t, step = 0.02, 0.32
while t < C["hook_end"]:
    m.hit("typewriter_soft_click", t, -15 + 3 * (t / C["hook_end"]), pan=0.15 * (-1) ** int(t * 10), rate=m.rng.uniform(1.0, 1.15))
    t += step; step = max(0.06, step * 0.86)
m.hit("whoosh_deep_impact", 0.02, -16, align="peak")
m.hit("reel_rewind", 0.15, -20, length=2.6)                 # the time-lapse rush
m.hit("impact_cool", C["clock"] - 0.15, -14)
m.hit("camera_digital", C["this"] - 0.05, -20)
m.hit("hit_swoosh_quick", C["this"] + 0.05, -20, align="peak")
m.hit("stomp_impact", C["one"] - 0.05, -17)
# 2 · three hours
m.hit("paper_slide", C["s_hours"], -13, rate=0.9)
typed(C["s_hours"] + 0.12, 15, 40, -26)
typed(C["three"] - 0.08, 7, 16, -18)
m.hit("impact_big", C["three"] + 0.35, -18)
m.lay(C["one2"] - 0.12, -40)
m.hit("stomp_impact", C["reel2"] - 0.1, -19, pan=0.3)
# 3a · trimming: razor clicks on each pause
m.hit("whoosh_fast", C["trim"] - 0.25, -18, align="peak")
cut = [C["trim"] + 0.15 + k * ((C["hand"] - C["trim"]) / 6) for k in range(6)]
for k, c in enumerate(cut):
    m.hit("scissors_cut", c, -20, pan=-0.4 + 0.15 * k, rate=m.rng.uniform(1.05, 1.25), length=0.25)
    m.hit("mouse_click", c + 0.02, -18, pan=-0.4 + 0.15 * k)
m.hit("stomp_impact", C["hand"] - 0.08, -20, pan=0.4)
# 3b · typing every caption
m.hit("air_woosh", C["typing"] - 0.2, -20, align="peak", length=0.6)
m.hit("paper_slide", C["typing"] - 0.1, -15)
m.typing(C["typing"], C["nudging"] - 0.3, -19)
# 3c · nudging frame by frame: arrow-key clicks
m.hit("air_woosh", C["nudging"] - 0.2, -20, align="peak", length=0.6)
k, t = 0, C["nudging"] + 0.2
while t < C["then_end"] - 1.9:
    m.hit("ui_click", t, -16, pan=-0.2 if k % 2 == 0 else 0.2, rate=m.rng.uniform(0.95, 1.08)); t += 0.19; k += 1
m.lay(C["frame2"] - 0.1, 0, quiet=-2)
# 4 · the turn
m.hit("riser_synth", C["s_then"] + 0.05, -20, length=0.85)
m.hit("whoosh_deep_impact", C["then"] - 0.05, -15, align="peak")
m.hit("crystal_chime", C["else"] + 0.1, -22)
# 5 · the brief
m.hit("glitch_rewind", C["s_brief"] + 0.05, -24, length=0.5)
m.hit("ui_start", C["s_brief"] + 0.15, -20)
typed(C["s_brief"] + 0.2, 12, 30, -26)
m.typing(C["s_brief"] + 0.35, C["s_brief"] + 0.35 + 66 / 30, -20)
m.hit("scribble", C["what"] - 0.1, -18, length=0.5)
m.hit("writing_pencil", C["how"] - 0.05, -18, length=0.5)
m.lay(C["want"] - 0.15, -250, quiet=-2); m.lay(C["feel"] - 0.2, 150, quiet=-2)
m.hit("message_pop", C["feel"] + 0.5, -16)
# 6 · the AI assembles it
m.hit("tech_slide", C["s_ai"] + 0.05, -18)
for i in range(6):
    m.hit("hit_swoosh_quick", C["cuts"] - 0.3 + i * 0.12, -24, pan=0.6 - 0.2 * i, align="peak", length=0.35)
m.hit("correct_tone", C["cuts"] + 0.3, -20)
for i in range(8):
    m.pop(C["captions"] + i * 0.07, -300 + 80 * i, -24)
m.hit("correct_tone", C["captions"] + 0.6, -21)
m.hit("digital_tone", C["music"] - 0.05, -20)
m.hit("impact_cool", C["music"] + 0.05, -20)
# 7 · one note, posted
m.hit("paper_crinkle", C["note"] - 0.15, -16, length=0.4)
m.hit("correct_tone", C["note"] + 0.45, -17)
m.hit("message_pop", C["post"] - 0.05, -13)
m.hit("stomp_impact", C["post"] - 0.02, -17)
# 8 · same reel, fifteen minutes
m.hit("camera_shutter", C["s_same"] + 0.05, -18)
m.hit("typewriter_soft_click", C["s_same"] + 0.4, -22)
m.hit("impact_cool", C["same"] - 0.05, -17)
m.hit("writing_pencil", C["fifteen"] - 0.25, -18, length=0.4)
m.hit("impact_trailer", C["fifteen"] - 0.02, -16)
# 9 · CTA
m.glide(C["s_outro"] + 0.3, 0, -20)
typed(C["s_outro"] + 0.15, 7, 18, -24)
m.hit("bell_chime", C["join"] - 0.05, -18)
m.lay(C["join"] - 0.08, 0)
m.hit("crystal_chime", C["evenings"] - 0.2, -22)
m.finish()

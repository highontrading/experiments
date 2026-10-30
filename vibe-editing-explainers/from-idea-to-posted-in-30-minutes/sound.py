"""Voice + "Masking the Masters" bed + foley, every hit on the cue the picture uses.
    python sound.py -> build/mix.wav"""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

# from 0:60 the bed swells at ~0:08 and peaks around the 9:20/9:30 beats
m = Mixer(__file__, music="masking_the_masters_eugenio_mininni.mp3", music_db=-9, music_offset=60, duck=0.5)
C = m.C


def clock(at, k=0):
    """A time card: a tick, a heavy hit as the digits roll, and the hand's air sweep."""
    m.hit("typewriter_soft_click", at - 0.05, -16, pan=-0.2)
    m.hit("typewriter_soft_click", at + 0.45, -18, pan=0.2)
    m.hit("impact_cool", at + 0.05, -17)
    m.hit("tape_switch", at + 0.12, -22)


# hook
m.hit("impact_trailer", 0.08, -16)
clock(0.1)
m.hit("whoosh_deep_impact", 1.12, -20)
m.hit("crystal_chime", 1.9, -22, pan=0.2)          # the bulb glows on "idea"
m.glide(2.95, 1, -17)                                # clock wipe
clock(3.2)
m.hit("stomp_impact", 4.32, -14)                     # POSTED stamp
m.hit("punch_fast", 4.98, -17)                       # cut to the amber card
m.hit("hit_swoosh_quick", 5.24, -20)

# 9:00 the idea
m.hit("whoosh_fast2", 6.0, -21)
clock(6.05)
m.card(7.12, -100, -4)
m.hit("whoosh_fast", 8.25, -16, align="peak")         # whip
m.hit("paper_slide", 8.3, -15)
for i in range(16):                                    # pencil on paper while it writes
    m.hit("typewriter_soft_click", 8.4 + i * 0.12 + (0.25 if i > 7 else 0), -26, pan=0.15, rate=0.75 + 0.1 * (i % 3))
m.hit("paper_crinkle", 9.95, -24)                      # circled "minute"
m.hit("impact_cool", 9.96, -18)

# 9:05 the brief
m.glide(11.15, 0, -16)
clock(11.1)
m.card(12.2, 0)
m.typing(12.55, 15.2, -21)
m.hit("impact_cool", C["b_four"], -18)
m.hit("stomp_impact", 14.43, -15)                       # PLAIN ENGLISH stamp

# 9:12 the first draft
m.glide(16.15, 1, -16)
clock(16.05)
m.hit("whoosh_fast2", 17.2, -16, align="peak")
m.hit("ui_start", 17.45, -20)
for i in range(7):                                      # clips snap onto the timeline
    m.hit("light_pop", 18.6 + i * 0.13, -19 - i * 0.4, pan=-0.5 + i * 0.16, rate=0.95 + i * 0.03)
m.hit("whoosh_fast", 19.75, -19, align="peak")
for at in (19.82, 20.02, 20.3, 20.42, 20.55):           # captions land word by word
    m.hit("ui_click", at, -19)

# 9:20 the notes
m.glide(21.9, 0, -16)
clock(21.86)
m.hit("whoosh_deep_impact", 22.85, -21)
for k in ("d_faster", "d_warmer", "d_bigger"):
    m.hit("paper_quick", C[k], -13, pan=0.2)             # note slapped on the wall
    m.hit("bubble_pop", C[k] + 0.06, -20)
    m.hit("correct_tone", C[k] + 0.4, -21)               # the draft updates

# 9:30 posted
m.glide(27.85, 1, -16)
clock(27.8)
m.hit("impact_trailer", 29.02, -15)
m.hit("whoosh_deep_impact", 29.9, -21)
for i, at in enumerate((30.0, 30.35, 30.7)):            # notifications
    m.hit("message_pop", at, -17 - i)
for i in range(10):                                     # likes ticking up
    m.hit("coin_blip", 29.95 + i * 0.14, -27, pan=0.6, rate=1.0 + 0.04 * i)

# outro
m.hit("whoosh_fast", 31.35, -16, align="peak")
m.hit("impact_cool", 31.9, -18)
m.hit("riser_synth", 32.85, -18, align="peak")          # rises into "they direct it"
m.hit("impact_big", 32.88, -15)
m.hit("stomp_impact", 33.52, -16)
m.hit("whoosh_deep_impact", 34.0, -19)
for i in range(4):                                      # project files land on the desk
    m.hit("paper_slide", 34.08 + i * 0.12, -19 - i, pan=-0.45 + i * 0.3, rate=0.95 + 0.04 * i)
m.hit("impact_trailer", C["f_join"], -16)
m.hit("crystal_chime", 34.8, -20)
m.hit("stomp_impact", 36.12, -19)                       # COMMENT "VIBE" stamp

m.finish()

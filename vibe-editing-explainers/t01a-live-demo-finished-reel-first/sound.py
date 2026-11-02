"""T01A sound: the shared T01 bed and foley, plus the rewind for this hook.
    python sound.py  ->  build/mix.wav
"""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="tech_house_vibes_alejandro_magana.mp3", music_db=-9, duck=0.5)
C = m.C

# hook: the finished reel, its end card, then the rewind
m.hit("ui_start", 0.05, -22)
m.pop(1.15, 0, -18)                                     # logo end card
m.hit("reel_rewind", C["now"] + 0.05, -12, length=1.5)
m.hit("glitch_rewind", C["now"] + 0.1, -18)
m.hit("tape_switch", C["s_raw"] + 0.1, -14)              # lands on the raw clip

# raw clip: the polaroid settles, the tape goes on
m.lay(C["s_raw"] + 0.25, 0)
m.hit("paper_crinkle", C["noedits"] - 0.1, -16, pan=0.2, length=0.6)

# the agent: background push, mic on
for i, k in enumerate(("s_tell", "s_c1", "s_c2", "s_c3", "s_c4", "s_just")):
    m.glide(C[k] - 0.05, k=i, g=-17)
m.hit("ui_start", C["tell"] - 0.2, -16)

# four commands: a click as each lands, a tone on each "Done"
for cmd, done in (("cut", "done1"), ("add", "done2"), ("warmer", "done3"), ("thirty", "done4")):
    m.hit("ui_click", C[cmd] - 0.05, -14)
    m.hit("correct_tone", C[done] + 0.02, -15)
m.hit("whoosh_fast", C["pauses"] + 0.2, -22)              # gaps snap shut
m.pop(C["bold"] + 0.05, 0, -18)                            # captions on
m.lay(C["warmer"] + 0.05, -300)                            # the "before" polaroid
m.pop(C["music"], 200, -20)                                # music track slides in
m.hit("hit_swoosh_quick", C["thirty"] + 0.05, -18)         # duration snaps to 0:30
m.hit("long_pop", C["logo"], -16)                          # logo card

# no timeline, no keyframes: struck through
m.hit("scribble", C["timeline"] + 0.3, -16, length=0.4)
m.hit("scribble", C["keyframes"] + 0.3, -16, length=0.4)
m.hit("riser_synth", C["talking"] - 0.9, -22, length=1.0)
m.hit("impact_cool", C["talking"] + 0.05, -18)

# outro: the timeline UI, follow, join
m.typing(C["s_outro"] + 0.3, C["s_outro"] + 1.1, -22)
m.pop(C["follow"], 0, -16)
m.hit("mouse_click", C["follow"] + 0.62, -12)
m.hit("switch_tap", C["follow"] + 0.75, -14)
m.hit("message_pop", C["join"], -14)
m.finish()

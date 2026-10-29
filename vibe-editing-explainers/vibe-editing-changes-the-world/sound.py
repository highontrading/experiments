"""Sound for "How vibe editing is changing the world": voice + "A New Start" bed + a quiet
meadow (birds, breeze) + soft glassy foley on every move. Cues mirror stage.js.
    python sound.py  ->  build/mix.wav"""
import sys; sys.path.insert(0, "../lib")
import numpy as np
from scipy.signal import fftconvolve
# lib/mixer.py smooths with np.convolve and 12k-tap kernels (direct O(N*M): minutes per mix).
# FFT convolution gives the same "same"-mode result in well under a second.
def _fast_convolve(a, v, mode="full"):
    r = fftconvolve(a, v, mode=mode)
    return np.maximum(r, 0) if a.min() >= 0 and v.min() >= 0 else r   # no -1e-17 round-off under sqrt
np.convolve = _fast_convolve
from mixer import Mixer

m = Mixer(__file__, music="a_new_start_alejandro_magana.mp3", music_db=-9)
C = m.C
TR = 0.85
n0, te0, sh0, cr0, wy0, ou0 = C["s_now"] - 0.05, C["s_teacher"], C["s_shop"], C["s_creator"], C["s_why"], C["s_outro"]

# the meadow: birds the whole way, a breeze when we fly into the sky
m.hit("morning_birds", 0.0, -30, length=C["end"])
for k, at in enumerate((0.0, 13.0, 26.0)):
    m.hit("breeze_trees", at, -36, pan=(-0.4, 0.3, -0.1)[k], length=14.0)

# before: the glass window settles, two cards, a question and an answer, a clock
m.hit("ui_start", 0.15, -26)
m.pop(0.9, 0, -28); m.pop(1.4, 0, -27)
m.card(C["studio"] - 0.45, -230); m.card(C["software"] - 0.45, 220)
m.hit("message_pop", C["years"] - 0.55, -16, pan=-0.4)
m.hit("bubble_pop", C["practice"] - 0.05, -18, pan=0.4)
m.hit("paper_quick", C["years"] + 0.08, -16, pan=0.5)

# now: the window folds into one prompt bar; an idea, a few sentences, typed
m.glide(n0 + TR * 0.5, 0, -17)
m.hit("ui_click", n0 + TR - 0.05, -18)
m.hit("crystal_chime", C["idea"] - 0.12, -22)
m.pop(C["sentences"] - 0.15, 0, -24)
m.typing(C["idea"] - 0.2, C["idea"] - 0.2 + 35 / 24, -21)

# teacher: the bar rises to the top, the card unrolls under it
m.glide(te0 + TR * 0.5, 1, -17)
m.card(te0 + 0.15, 0, quiet=-1)
m.lay(C["teacher"] - 0.2, -380); m.lay(C["teacher"] + 0.05, 360, quiet=-2)
m.hit("message_pop", C["lesson"] - 0.25, -16, pan=-0.4)
m.hit("bubble_pop", C["tonight"] - 0.1, -18, pan=0.4)
m.hit("ui_click", C["tonight"] + 0.25, -20, pan=0.3)

# shop: a swipe to the next card; lily, tablet, bags; the ad builds; "agency" struck out
m.hit("air_woosh", sh0 + TR * 0.5, -16, pan=0.5, align="peak")
m.pop(C["shop"] - 0.15, -320, -20)
m.card(C["ads"] - 0.35, 240)
m.hit("paper_crinkle", C["ads"] + 0.05, -14, pan=-0.3, length=0.6)
m.hit("ui_click", C["ads"] + 0.1, -19, pan=0.3)
m.pop(C["agency"] - 0.35, 0, -20)
m.hit("small_sweep", C["agency"] + 0.1, -24)
m.hit("bubble_pop", C["agency"] + 0.45, -18, pan=0.4)

# creator: the next card rises; two phones, two languages, one project
m.glide(cr0 + TR * 0.5, 1, -17)
m.lay(C["english"] - 0.35, -240); m.lay(C["hindi"] - 0.35, 250)
m.hit("ui_click", C["english"] - 0.1, -20, pan=-0.3); m.hit("ui_click", C["hindi"] - 0.1, -20, pan=0.3)
m.hit("correct_tone", C["project"] - 0.15, -24)

# why: every card gathers into the grid; "you" joins; the lily; a glow on "seen"
m.glide(wy0 + 0.5, 0, -17)
for i, x in enumerate((-220, 220, -220)):
    m.hit("paper_quick", wy0 + 0.85 + 0.05 * i, -20, pan=x / 700)
m.pop(wy0 + 1.0, 220, -18)
m.pop(C["anyone"], 320, -19)
m.hit("bell_chime", C["seen"] - 0.35, -17)

# outro: zoom through "you" into the sky; the lily opens; one sentence, sent
m.hit("air_woosh", ou0 + 0.55, -14, align="peak")
m.hit("short_wind_swoosh", ou0 + 0.7, -22, pan=-0.2, align="peak")
m.hit("crystal_chime", ou0 + 1.2, -21)
m.pop(C["world"] - 0.7, 0, -24); m.pop(C["world"] - 0.35, 0, -24)
m.typing(C["sentence"] - 0.15, C["sentence"] - 0.15 + 23 / 20, -21)
m.hit("ui_click", C["time"] + 0.6, -16)
m.hit("message_pop", C["time"] + 0.7, -18)

m.finish()

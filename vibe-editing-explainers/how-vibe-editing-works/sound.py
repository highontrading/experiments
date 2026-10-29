"""Sound: Ideas and Experiments (Diego Nava) under the voice, plus close, quiet foley on the
same cues the picture uses (stage.js).  python sound.py -> build/mix.wav"""
import sys; sys.path.insert(0, "../lib")
import numpy as np
from scipy.signal import fftconvolve

# lib/mixer.py smooths with np.convolve and a 12,000-tap kernel, which takes minutes on a
# busy CPU; the FFT version gives the same result in a fraction of a second.
_np_convolve = np.convolve
def _convolve(a, v, mode="full"):
    if min(len(a), len(v)) <= 256:
        return _np_convolve(a, v, mode)
    out = fftconvolve(a, v, mode)
    return np.maximum(out, 0) if (np.min(a) >= 0 and np.min(v) >= 0) else out   # FFT round-off can dip below 0
np.convolve = _convolve
from mixer import Mixer

m = Mixer(__file__, music="ideas_and_experiments_diego_nava.mp3", music_db=-10)
C = m.C
TR = 0.95
START = {k: C["s_" + k] for k in ("brief", "assets", "agent", "render", "notes", "outro")}

# layout changes: one soft air pass each, peaking mid-transition
for i, (k, s) in enumerate(START.items()):
    m.glide(s - 0.15 + TR * 0.5, i, g=-17)
m.hit("crystal_chime", START["outro"] + 0.1, -24)

# cover: five objects set down on the paper, the headline, the pill
m.hit("ui_start", 0.05, -22)
for i, (at, x) in enumerate([(0.15, -300), (0.3, 250), (0.45, 0), (0.6, -350), (0.75, 360)]):
    m.hit("paper_quick", at + 0.12, -17, pan=x / 700, rate=0.9 + 0.04 * i)
    m.pop(at + 0.2, x, -24)
m.hit("ui_click", 0.4, -24); m.hit("ui_click", 0.55, -25)
m.hit("long_pop", 1.05, -19)

# brief
m.hit("ui_click", C["brief_one"] - 0.1, -22)
m.card(C["brief_one"], 300)
m.hit("paper_slide", C["brief_write"] - 0.25, -16, pan=0.3, rate=0.85)       # pencil rolls in
m.card(C["brief_write"] - 0.5, 0)
m.typing(C["brief_write"], C["brief_write"] + 2.3, -21)
for k, x in (("brief_length", -310), ("brief_mood", 0), ("brief_look", 310)):
    m.pop(C[k] + 0.05, x, -17)

# assets
m.lay(C["assets_two"] + 0.1, 0)
for k, x in (("assets_footage", -250), ("assets_music", 270), ("assets_voiceover", 290)):
    m.card(C[k] - 0.35, x, quiet=-2)
for i in range(3):
    m.hit("paper_quick", C["assets_real"] + 0.35 + i * 0.18, -18, pan=(-0.3, 0.3, 0.3)[i], rate=1.05)
    m.hit("ui_click", C["assets_real"] + 0.5 + i * 0.18, -25)
m.hit("long_pop", C["assets_folder"], -18)

# agent
m.card(C["agent_three"], 0)
m.lay(C["agent_three"] + 0.4, 0, quiet=-3)
m.typing(C["agent_reads"] - 0.6, C["agent_reads"] + 1.2, -24)
m.typing(C["agent_looks"], C["agent_looks"] + 0.6, -24)
m.typing(C["agent_writes"], min(C["agent_writes"] + 3.6, START["render"] - 0.3), -21)
for k, x in (("agent_cut", 430), ("agent_caption", 430), ("agent_sound", 430)):
    m.pop(C[k] + 0.05, x, -16)
m.hit("long_pop", C["agent_line"], -19)

# render
m.hit("ui_click", C["render_four"] - 0.1, -22)
m.hit("projector_spin", C["render_four"] + 0.4, -27, length=C["render_stitches"] - C["render_four"])
m.lay(C["render_frame"] - 0.2, 280, quiet=-2)                 # clock
m.hit("crystal_chime", C["render_thirty"], -22)
m.pop(C["render_thirty"] + 0.25, 220, -19)
m.hit("small_sweep", C["render_stitches"], -24)
m.hit("camera_shutter", C["render_stitches"] + 0.45, -14)

# notes
m.hit("ui_click", C["notes_you"] - 0.1, -22)
m.hit("paper_slide", C["notes_notes"] - 0.3, -16, pan=-0.4, rate=0.9)      # pencil
for i, x in enumerate((250, -280, 290)):
    m.pop(C["notes_notes"] + i * 0.25, x, -16)
    m.hit("paper_quick", C["notes_notes"] + i * 0.25 + 0.03, -22, pan=x / 700)
m.card(C["notes_rewrites"] - 0.3, 100, quiet=-3)
m.typing(C["notes_rewrites"], C["notes_rewrites"] + 1.2, -23)
m.hit("correct_tone", C["notes_right"], -17)

# outro: the index, then the whole machine
for k in ("outro_brief", "outro_assets", "outro_agent", "outro_render", "outro_notes"):
    m.pop(C[k] - 0.05, 0, -21)
m.hit("small_sweep", C["outro_that"] - 0.1, -22)
for i in range(5):
    m.hit("paper_quick", C["outro_that"] + 0.5 + i * 0.06, -22, pan=(-0.4, 0.4, 0, -0.5, 0.5)[i], rate=1.0 + 0.03 * i)
m.hit("long_pop", C["outro_machine"] + 0.45, -18)

m.finish()

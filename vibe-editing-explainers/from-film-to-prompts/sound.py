"""From film to prompts: voice + "Sleepy Cat" bed + close, quiet foley on every move.
Each era gets its own textures: projector hum and scissors for film, deck clicks for tape,
mouse clicks for the timeline, pixel blips and typing for the prompt."""
import sys; sys.path.insert(0, "../lib")
import numpy as np
from scipy.signal import oaconvolve

# lib/mixer.py smooths the voice envelope with np.convolve and a 12,000-tap kernel; done directly
# that takes many minutes on a loaded machine. Same result via FFT (overlap-add), in seconds.
_np_convolve = np.convolve
def _fast_convolve(a, v, mode="full"):
    if min(len(a), len(v)) <= 256:
        return _np_convolve(a, v, mode)
    out = oaconvolve(a, v, mode=mode)
    return np.abs(out) if (np.min(a) >= 0 and np.min(v) >= 0) else out   # FFT noise can dip below 0


np.convolve = _fast_convolve
from mixer import Mixer

m = Mixer(__file__, music="sleepy_cat_alejandro_magana.mp3", music_db=-10)
C = m.C


def pixel_word(at, word, cps=22, g=-25):   # pixBlock: the block lays down, letters type on
    m.lay(at, quiet=1)
    for i, ch in enumerate(word):
        if ch != " ":
            m.hit("typewriter_soft_click", at + 0.18 + i / cps, g, rate=m.rng.uniform(0.95, 1.1))


def serif_line(at, x=-200):
    m.hit("paper_quick", at + 0.05, -22, pan=x / 700, rate=0.9)


# camera glides along the row of eras
for k, s in enumerate([C["s_film"], C["s_tape"], C["s_timeline"], C["s_prompt"]]):
    m.glide(s - 0.4 + 0.5, k, g=-17)

# hook
m.hit("page_turn", 0.05, -20)
for i, at in enumerate((0.3, 0.45, 0.6)):
    m.pop(at, -440, -26)
m.card(0.15, 350, quiet=-2); m.card(0.35, -262, quiet=-3)
serif_line(C["hook_editing"] - 0.55); serif_line(C["hook_editing"] + 0.2)
pixel_word(C["hook_reinvented"] - 0.15, "REINVENTED")
m.card(C["hook_reinvented"] + 0.25, 370)
for i in range(3):
    m.pop(C["hook_three"] + i * 0.17, -300 + i * 170, -19)
m.hit("coin_blip", C["hook_again"] - 0.1, -24, pan=0.3)
m.card(C["hook_now"] - 0.3, -210)

# film: projector hum, the cut, the splice
pixel_word(C["film_film"] - 0.12, "FILM")
serif_line(C["s_film"] + 0.35, -400)
m.card(C["s_film"] + 0.2, 0)
m.hit("projector_spin", C["s_film"] + 0.3, -27, length=C["s_tape"] - C["s_film"] - 0.2)
m.hit("air_woosh", C["film_cut"] - 0.35 + 0.35, -22, pan=0.4, align="peak", length=0.8)
m.hit("scissors_cut", C["film_cut"] + 0.05, -14)
m.hit("scissors_cut", C["film_hand"] + 0.1, -18, rate=1.08)
m.hit("paper_quick", C["film_spliced"] - 0.1, -16)
m.hit("paper_crinkle", C["film_together"] + 0.05, -20, length=0.5)

# tape: two decks, shots copied across in order
serif_line(C["s_tape"] + 0.35, -400)
pixel_word(C["tape_tape"] - 0.12, "TAPE")
m.card(C["tape_tape"] - 0.1); m.hit("tape_switch", C["tape_tape"] + 0.3, -16, pan=-0.3)
m.card(C["tape_video"] - 0.2); m.hit("tape_switch", C["tape_video"] + 0.1, -16, pan=0.3, rate=0.92)
m.hit("cassette_player", C["tape_video"], -28, length=C["s_timeline"] - C["tape_video"] - 0.3)
for i, k in enumerate(("tape_copying", "tape_shots", "tape_machine", "tape_another")):
    m.hit("short_wind_swoosh", C[k] + 0.3, -26, align="peak", length=0.6, pan=-0.3 + i * 0.2)
    m.pop(C[k] + 0.62, -300 + i * 200, -20)
m.hit("small_sweep", C["tape_order"] + 0.05, -24)

# timeline: blocks, drag, trim, undo
serif_line(C["s_timeline"] + 0.35, -400)
pixel_word(C["tl_timeline"] - 0.12, "TIMELINE")
m.card(C["s_timeline"] + 0.45); m.card(C["tl_computers"] + 0.2, 330, quiet=-3)
for i in range(4):
    m.pop(C["tl_blocks"] - 0.25 + i * 0.09 + 0.1, -300 + i * 200, -21)
m.hit("mouse_click", C["tl_drag"] - 0.05, -12); m.hit("ui_click", C["tl_drag"] + 0.55, -18)
m.hit("mouse_click", C["tl_trim"] - 0.05, -13, rate=1.05)
m.hit("mouse_click", C["tl_undo"] - 0.05, -13, rate=0.95); m.hit("ui_click", C["tl_undo"] + 0.1, -16)
m.hit("small_sweep", C["tl_undo"] + 0.12, -26)

# prompt: typing, the AI tick, the video building in pixels
serif_line(C["s_prompt"] + 0.35, -400)
pixel_word(C["pr_prompt"] - 0.12, "PROMPT")
m.card(C["pr_prompt"] - 0.2); m.card(C["pr_describe"] - 0.4, quiet=-2)
m.typing(C["pr_describe"] + 0.1, C["pr_describe"] + 0.1 + 64 / 24, g=-21)
m.hit("unlock_blip", C["pr_ai"] - 0.05, -22, pan=0.3)
for i in range(10):
    m.hit("retro_blip", C["pr_builds"] - 0.1 + i * 0.1, -32 + (i % 3), pan=-0.4 + i * 0.08, rate=m.rng.uniform(1.0, 1.3), length=0.15)
m.hit("coin_blip", C["pr_builds"] + 0.95, -22)

# why: the pull-back over every era
m.hit("air_woosh", C["s_why"] - 0.3 + 0.75, -14, align="peak")
serif_line(C["why_every"] - 0.1, 0)
pixel_word(C["why_faster"] - 0.1, "FASTER")
m.hit("small_sweep", C["why_faster"] + 0.2, -20)
for i in range(16):
    m.pop(C["why_opened"] + i * 0.04 * 1.5, -500 + i * 60, -28)

# outro: tiles regroup, light up, gather; the end card
m.hit("short_wind_swoosh", C["s_outro"] + 0.35, -15, align="peak")
for k, x in (("o_film", -236), ("o_tape", 236), ("o_timeline", -236), ("o_text", 236)):
    m.hit("tape_switch", C[k] - 0.05, -22, pan=x / 700, rate=1.1)
serif_line(C["o_changing"] - 0.5, 0)
m.hit("air_woosh", C["o_goal"] + 0.15, -20, align="peak", length=0.9)
serif_line(C["o_goal"] - 0.1, 0)
serif_line(C["o_tell"] - 0.2, -300)
pixel_word(C["o_story"] - 0.25, "ST RY", cps=30)
m.pop(C["o_story"] + 0.1, 0, -16)
m.card(C["o_story"] + 0.25, 380, quiet=-3)
m.hit("crystal_chime", C["o_story"] + 0.4, -24)
m.finish()

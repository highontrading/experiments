"""Sound for "Will AI replace video editors?": voice, Curiosity (Diego Nava) bed, quiet paper foley.
Every hit sits on the same cue stage.js uses.   python sound.py -> build/mix.wav"""
import sys; sys.path.insert(0, "../lib")
import numpy as np
from scipy.signal import fftconvolve
import mixer
from mixer import Mixer

# lib/mixer.py smooths with np.convolve, which is direct (O(n·k)) and takes minutes on a
# 12 000-tap window; the same "same"-mode result via FFT takes a fraction of a second.
mixer.np = type("np", (), {**{k: getattr(np, k) for k in dir(np) if not k.startswith("__")},
                           "convolve": staticmethod(lambda a, v, mode="full": np.maximum(fftconvolve(a, v, mode=mode), 0))})  # inputs are never negative

m = Mixer(__file__, music="curiosity_diego_nava.mp3", music_db=-10, music_offset=8)
C = m.C


def slap(at, x=0, g=-15):          # a sticker pressed onto the page
    m.hit("paper_crinkle", at + 0.03, g, pan=x / 700, length=0.32, rate=m.rng.uniform(0.95, 1.08))
    m.pop(at + 0.06, x, g - 7)


def tick(at, x=0):                  # a check mark / soft confirm
    m.hit("correct_tone", at, -24, pan=x / 700)


# page changes (stage.js: flips start 0.62 s before `start`, the rest 0.42 s)
m.glide(C["s_good"] - 0.42 + 0.45, 0, -18); m.hit("paper_slide", C["s_good"] - 0.3, -17)
m.hit("big_page_turn", C["s_time"] - 0.62 + 0.15, -11)
m.glide(C["s_cant"] - 0.42 + 0.5, 1, -15)
m.hit("newspaper_page", C["s_change"] - 0.42 + 0.1, -14)
m.hit("page_turn", C["s_team"] - 0.62 + 0.2, -10)
m.glide(C["s_dir"] - 0.42 + 0.45, 0, -18); m.hit("paper_slide", C["s_dir"] - 0.3, -17)
m.glide(C["s_week"] - 0.42 + 0.45, 1, -17); m.hit("page_chime", C["s_week"] + 0.3, -20)

# hook: the month page
m.hit("page_turn", 0.05, -15)
m.hit("small_sweep", 0.4, -26)
slap(C["hook_ai"], 300)
slap(C["hook_video"] + 0.1, 360)
slap(C["hook_editors"], -350)
m.hit("paper_quick", C["hook_honest"] - 0.05, -22)
slap(C["hook_honest"] + 0.15, 320, -13); m.hit("long_pop", C["hook_honest"] + 0.2, -20)

# good: Mon / Tue / Wed jobs
m.card(C["s_good"] - 0.1, -200, quiet=-3)
m.hit("scissors_cut", C["good_silences"] + 0.1, -16, pan=0.2)
slap(C["good_silences"], 300); tick(C["good_silences"] + 0.45, 300)
m.card(C["s_good"] + 0.05, -200, quiet=-4)
for i in range(5):
    m.hit("ui_click", C["good_captions"] - 0.2 + i * 0.16, -26, pan=0.2 + i * 0.08)
slap(C["good_captions"], 300); tick(C["good_captions"] + 0.5, 300)
for k, x in (("good_resizing", -250), ("good_every", -50), ("good_platform", 150)):
    m.pop(C[k] - 0.1, x, -20)
slap(C["good_platform"], 350); tick(C["good_platform"] + 0.5, 350)

# time: the afternoon
tk = C["time_jobs"]
while tk < C["time_afternoon"] + 0.5:      # the clock running while the block grows
    m.hit("typewriter_soft_click", tk, -27, pan=0.4, rate=m.rng.uniform(0.95, 1.08)); tk += 0.21
slap(C["time_jobs"] + 0.3, 270)
m.lay(C["time_afternoon"] - 0.1, -120, quiet=-2)
m.hit("tech_slide", C["time_minutes"] - 0.15, -20, pan=0.4)
tick(C["time_minutes"] + 0.3, 400)
slap(C["time_minutes"] + 0.15, 280, -13)

# can't: taste
m.hit("paper_crinkle", C["s_cant"], -20, length=0.3)
for i in range(5):
    m.pop(C["s_cant"] - 0.1 + i * 0.08, -400 + i * 200, -25)
m.hit("long_pop", C["cant_taste"] - 0.1, -22)
m.hit("paper_quick", C["cant_moment"], -21)
slap(C["cant_hold"], -150); m.hit("small_sweep", C["cant_hold"], -25)
m.hit("scissors_cut", C["cant_cut"] - 0.02, -13, pan=0.3)
slap(C["cant_cut"] + 0.05, 340)

# change: next week's to-do
m.hit("ui_click", C["change_disappearing"] - 0.3, -22)
m.hit("paper_quick", C["change_disappearing"] + 0.45, -16, rate=1.1); m.hit("paper_quick", C["change_disappearing"] + 0.7, -18, rate=0.9)
m.hit("ui_click", C["change_changing"] - 0.3, -22)
tick(C["change_changing"] + 0.1, -300)
m.card(C["s_change"] + 0.15, -250, quiet=-2)
for i in range(3):
    m.hit("mouse_click", C["change_less"] + 0.1 + i * 0.22, -16 - i * 2, pan=-0.3)
slap(C["change_less"], -250)
m.hit("small_sweep", C["change_more"] - 0.1, -20, pan=0.3)
m.pop(C["change_deciding"] + 0.2, 400, -20)

# team
slap(C["team_editor"] - 0.1, 0)
slap(C["team_ai"], 120)
for i in range(6):
    at = C["team_direct"] + 0.15 + i * 0.22
    slap(at, [-330, 330, -370, 370, -290, 310][i], -16)

# director
slap(C["outro_director"] - 0.05, 160, -13)
m.hit("camera_shutter", C["s_dir"] + 0.32, -14, pan=-0.3)     # the clapperboard
slap(C["s_dir"] + 0.3, -270, -16)

# this week
m.hit("paper_quick", C["outro_week"] - 0.35, -20)
slap(C["outro_week"] + 0.2, 330, -13); m.hit("long_pop", C["outro_week"] + 0.25, -20)
slap(C["outro_week"] + 0.45, 360, -17)
m.hit("bell_chime", C["outro_week"] + 0.7, -22)

m.finish()

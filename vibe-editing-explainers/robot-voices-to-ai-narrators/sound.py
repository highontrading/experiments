"""Sound: documentary-reel foley on every cut, era textures under the history, voice on top.
    python sound.py -> build/mix.wav"""
import sys
import numpy as np
sys.path.insert(0, "../lib")
from mixer import Mixer, SR, db

m = Mixer(__file__, music="no_turning_back_alejandro_magana.mp3", music_db=-8, music_offset=40, duck=0.45)
C = m.C


def bed(name, a, b, g=-26, pan=0.0):
    """A texture under a scene: the effect looped/trimmed to [a, b] with soft fades."""
    x = m.SFX[name]
    n = int((b - a) * SR)
    reps = int(np.ceil(n / len(x)))
    seg = np.tile(x, (reps, 1))[:n].copy()
    f = min(n // 3, int(0.25 * SR))
    seg[:f] *= np.linspace(0, 1, f)[:, None]; seg[-f:] *= np.linspace(1, 0, f)[:, None]
    i = int(a * SR); seg = seg[: m.N - i] * db(g)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    m.fx[i:i + len(seg), 0] += seg[:, 0] * l; m.fx[i:i + len(seg), 1] += seg[:, 1] * r


def cut(t, k=0, g=-14):        # every hard cut gets a fast whoosh
    m.hit(["whoosh_fast", "whoosh_fast2", "hit_swoosh_quick"][k % 3], t, g, align="peak", pan=0.2 if k % 2 else -0.2)


def slam(t, g=-15):            # yellow box / big type landing
    m.hit("hit_swoosh_quick", t - 0.04, g - 4, align="peak")
    m.hit("punch_fast", t + 0.02, g - 6)


def stamp(t, g=-12):           # rubber stamp
    m.hit("stomp_impact", t + 0.03, g)


# 1 · 1939 over the radio dial
m.hit("riser_stutter", 0.0, -24)
m.hit("impact_trailer", C["y1939"] + 0.05, -12)
bed("radio_crackle", 0.0, 3.0, -27)
# 2-3 · the Fair
cut(C["fair"] - 0.3, 0); slam(C["fair"])
bed("stadium_applause", C["fair"] - 0.3, C["bell"] - 0.1, -25)
cut(C["worlds"] + 0.25, 1); m.hit("stomp_impact", C["worlds"] + 0.33, -17)
# 4 · Bell Labs, the talking machine
cut(C["bell"] - 0.15, 2); m.hit("hit_swoosh_long", C["bell"] + 0.15, -16, align="peak", pan=-0.4)
bed("radio_static", C["bell"], C["called"] - 0.2, -29)
slam(C["machine"]); stamp(C["talk"])
# 5 · the Voder card
cut(C["called"] - 0.2, 0); m.hit("page_turn", C["called"] - 0.1, -12)
slam(C["called"] + 0.1, -17); stamp(C["voder"] - 0.05)
# 6 · few believed (smoke wipe)
m.hit("whoosh_deep_impact", C["few"] - 0.2, -13, align="peak")
m.hit("impact_cool", C["few"] + 0.04, -17)
m.hit("light_pop", C["few"] + 0.6, -19)
slam(C["human"] - 0.15)
# 7 · 1961
cut(C["y1961"] - 0.2, 1); m.hit("impact_big", C["y1961"] + 0.03, -12)
m.hit("whoosh_fast", C["y1961"] + 0.7, -17, align="peak", pan=0.6)
# 8 · IBM at Bell Labs, sang a song
cut(C["ibm"], 2); slam(C["ibm"] + 0.35)
bed("projector_spin", C["ibm"], C["daisy"] - 0.3, -28)
m.hit("paper_slide", C["sang"] - 0.28, -13, pan=0.4)
stamp(C["sang"])
# 9 · Daisy Bell
cut(C["daisy"] - 0.25, 0)
m.hit("glitch_text", C["daisy"] - 0.02, -16)
m.hit("crystal_chime", C["daisy"] + 0.1, -17)
# 10 · fifty years later
cut(C["fifty"] - 0.1, 1); m.hit("impact_trailer", C["fifty"] + 0.03, -13)
# 11 · phones talk back
cut(C["phones"] - 0.15, 2); m.hit("hit_swoosh_long", C["phones"] + 0.1, -16, align="peak", pan=0.5)
m.hit("digital_tone", C["phones"] + 0.35, -17)
slam(C["back"] - 0.35)
# 12 · breathe, pause, laugh
cut(C["neural"] - 0.3, 0); slam(C["neural"])
for k, w in enumerate(("breathe", "pause", "laugh")):
    m.hit("paper_slide", C[w] - 0.24, -14, pan=[-0.4, 0.4, 0][k])
    m.hit("camera_shutter", C[w] - 0.05, -17)
stamp(C["laugh"] + 0.35)
# 13 · right now: the console and the live wave
cut(C["voice"] - 0.2, 1); m.hit("robot_click", C["rightnow"], -16)
slam(C["seconds"] - 0.1)
# 14 · one line, any language, any tone
cut(C["oneline"] - 0.2, 2); m.hit("page_turn", C["oneline"] - 0.1, -14)
slam(C["oneline"] + 0.1, -17)
m.typing(C["oneline"], C["language"] - 0.3, -20)
cut(C["language"] - 0.15, 0); slam(C["language"] - 0.1)
for i in range(5): m.pop(C["language"] + i * 0.1, [-300, 300, -250, 300, -200][i], -17)
m.hit("impact_cool", C["tone"] - 0.03, -15)
for i in range(4): m.hit("stomp_impact", C["tone"] + 0.17 + i * 0.12, -22)
# 15 · nearly a century later (riser into a smoke wipe)
m.hit("riser_trailer", C["century"] + 0.05, -15, align="peak")
m.hit("whoosh_deep_impact", C["century"] - 0.15, -13, align="peak")
m.hit("impact_big", C["century"] + 0.32, -12)
# 16 · just another setting
cut(C["narrator"] - 0.25, 1); m.hit("page_turn", C["narrator"] - 0.15, -13)
slam(C["narrator"] + 0.15)
m.hit("correct_tone", C["setting"] - 0.05, -16)
stamp(C["setting"] + 0.45)
# 17 · the hero and the lockup
m.hit("whoosh_deep_impact", C["follow"] - 0.2, -12, align="peak")
m.hit("glitch_break", C["follow"] + 1.38, -15)
m.hit("impact_trailer", C["follow"] + 1.42, -12)

m.finish()

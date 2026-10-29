"""Sound: Paranoia (Arulo) under the voice, plus retro foley on every pixel, glitch and cut."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="paranoia_arulo.mp3", music_db=-8, music_offset=6, duck=0.45)
C = m.C
blip = lambda t, x=0, g=-17: m.hit(m.rng.choice(["retro_blip", "coin_blip"]), t, g, pan=x / 700, rate=m.rng.uniform(0.95, 1.1))

# scene changes: glitch slices (stock, caps, fix) and pixel mosaics (pace, pov, outro)
for k, s in enumerate(["s_stock", "s_pace", "s_caps", "s_pov", "s_fix", "s_outro"]):
    if k % 2 == 0:
        m.hit("glitch_break", C[s] - 0.12, -13); m.hit("whoosh_fast", C[s] - 0.05, -18, align="peak")
    else:
        m.hit("signal_interference", C[s] - 0.14, -17, length=0.45); m.hit("whoosh_fast2", C[s] - 0.05, -19, align="peak")

# hook
m.card(0.0, 0); m.hit("whoosh_deep_impact", 0.35, -18, align="peak")
blip(0.08)
m.hit("glitch_text", C["h_fake"] - 0.04, -13)
m.hit("ui_start", C["h_spot"] - 0.05, -14)
for i in range(6): m.hit("digital_tone", C["h_spot"] + 0.12 + i * 0.13, -26, rate=1 + i * 0.04)
m.hit("digital_buzzer", C["h_second"] + 0.2, -19, length=0.3)
m.hit("punch_fast", C["h_second"] + 0.27, -12)
m.hit("whoosh_stutter", C["h_why"] - 0.2, -16, align="peak"); blip(C["h_why"] - 0.03, 0, -15)

# 1 stock
m.hit("impact_cool", C["st_one"] - 0.03, -17); blip(C["st_generic"] - 0.03, -200)
m.hit("hit_swoosh_quick", C["st_footage"] - 0.08, -17)
for i in range(9): blip(C["st_same"] - 0.05 + i * 0.05, (i % 3 - 1) * 300, -22)
for i in range(16): blip(C["st_everyone"] + i * 0.03, (i % 5 - 2) * 200, -26)
m.hit("punch_fast", C["st_everyone"] + 0.17, -14)

# 2 pace: the metronome ticks, one cut per tick
m.hit("impact_cool", C["pa_two"] - 0.03, -17); blip(C["pa_robotic"] - 0.03, -200)
t0, P = C["pa_robotic"] + 0.3, 0.56
t = t0
while t < C["s_caps"] - 0.25:
    m.hit("typewriter_soft_click", t, -14, rate=1.0)
    m.hit("ui_click", t + 0.01, -22)
    t += P
m.hit("whoosh_fast", C["pa_metronome"] - 0.1, -17, align="peak")

# 3 captions that shout
m.hit("impact_cool", C["ca_three"] - 0.03, -17); blip(C["ca_captions"] - 0.03, -200)
m.hit("hit_swoosh_quick", C["ca_shout"] - 0.1, -17)
t, n = C["ca_captions"], 0
while t < C["ca_yellow"] + 0.25:
    dense = 1 + (2 if t > C["ca_bouncing"] else 0) + (5 if t > C["ca_every2"] else 0)
    for j in range(dense):
        m.hit(["bubble_pop", "light_pop", "message_pop"][(n + j) % 3], t + j * 0.025, -20 - j, pan=((n * 37 + j * 53) % 140 - 70) / 100, rate=m.rng.uniform(0.9, 1.2))
    t += 1 / 5.5; n += 1
m.hit("impact_big", C["ca_yellow"] + 0.27, -11); m.hit("glitch_break", C["ca_yellow"] + 0.27, -16)

# 4 no point of view
m.hit("impact_cool", C["po_four"] - 0.03, -17)
m.hit("stomp_impact", C["s_pov"] + 0.45, -19)
m.pop(C["po_point"], 200, -16)
m.hit("soft_typing", C["po_everything"] - 0.05, -18, length=1.1)
m.hit("radio_static", C["po_nothing"] - 0.05, -18, length=0.7)
m.hit("hit_swoosh_quick", C["po_nothing"] - 0.06, -18)

# the fix
blip(C["fx_fix"] - 0.1)
m.hit("digital_buzzer", C["s_fix"] + 0.27, -20, length=0.35)
m.hit("hit_swoosh_quick", C["fx_ai"], -14); blip(C["fx_ai"] + 0.15, 200, -16)
m.hit("riser_synth", C["fx_you"] - 0.05, -18, align="peak")
m.hit("impact_trailer", C["fx_you"] - 0.02, -12)
for k, x in (("fx_footage", -340), ("fx_timing", 0), ("fx_opinion", 340)):
    m.hit("unlock_blip", C[k] - 0.1, -17, pan=x / 700); m.hit("paper_slide", C[k] - 0.1, -17, pan=x / 700)

# outro
m.hit("whoosh_fast2", C["s_outro"] + 0.1, -17, align="peak")
for i in range(5): m.hit("mouse_click", C["s_outro"] + 0.4 + i * 0.32, -13 - i, pan=(i % 3 - 1) * 0.3)
m.hit("hit_swoosh_quick", C["ou_clicking"] - 0.12, -18)
m.hit("unlock_blip", C["ou_you"], -15); m.hit("stadium_applause", C["ou_you"] + 0.2, -26, length=2.4)
m.hit("coin_gold", C["ou_taste"], -16)
blip(C["ou_follow"] - 0.05, 0, -15)
m.hit("correct_tone", C["ou_editing"] - 0.3, -16)
m.finish()

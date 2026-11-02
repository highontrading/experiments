"""T02A sound: the shared T02 bed (Masking the Masters from 1:00) + foley on the picture's cues."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="masking_the_masters_eugenio_mininni.mp3", music_db=-9, music_offset=60, duck=0.5)
C, rng = m.C, m.rng

# hook: night clock, frustrated clicking, glitchy timeline errors, papers flying
for i in range(6):
    m.hit("typewriter_soft_click", 0.15 + i * 0.5, -24, pan=0.5, rate=rng.uniform(0.9, 1.05))   # clock ticks
for i in range(5):
    m.hit("mouse_click", 0.5 + i * 0.13 + rng.uniform(0, 0.04), -16 - i, pan=-0.2)
m.hit("glitch_text", 1.2, -22, pan=0.3)
m.pop(C["hook_night"] - 0.2, 300, -20)
m.hit("whoosh_impact", C["hook_night"], -18)
m.hit("paper_crinkle", C["hook_fight"] - 0.05, -12, pan=0.2)
m.hit("big_page_turn", C["hook_fight"] + 0.1, -16, pan=-0.3)
m.hit("stomp_impact", C["hook_fight"], -17)
m.hit("glitch_break", C["hook_timeline"] + 0.05, -19)
for i in range(4):
    m.hit("mouse_click", C["hook_timeline"] + 0.2 + i * 0.11, -18, pan=0.1)

# hours: punch-in, the timer racing to 3:00:00, one reel pinned
m.hit("whoosh_deep_impact", C["s_hours"] + 0.05, -14)
for i in range(12):
    m.hit("digital_tone", C["s_hours"] + 0.25 + i * 0.09, -30, rate=1 + i * 0.03)
m.hit("impact_cool", C["s_hours"] + 1.3, -18)
m.hit("paper_slide", C["hours_one"] - 0.15, -14, pan=0.1)
m.pop(C["hours_reel"], 200, -18)

# grind: razor cuts, typing with a backspace, frame nudges, prints pinned
m.glide(C["s_grind"] + 0.2, 1)
for i in range(5):
    m.hit("scissors_cut", C["s_grind"] + 0.35 + i * 0.3, -17, pan=-0.3 + i * 0.15, rate=rng.uniform(1.0, 1.15), length=0.25)
m.typing(C["g_type"], C["g_nudge"] - 0.2, -18)
for i in range(3):
    m.hit("paper_quick", [C["g_type"], C["g_nudge"], C["s_then"]][i] - 0.15, -16, pan=-0.6 + i * 0.4)   # pinning
for i in range(12):
    m.hit("ui_click", C["g_nudge"] - 0.15 + i * 0.24, -17, pan=(-1) ** i * 0.3)
m.pop(C["g_frame"], 300, -20)

# then: silence beat, then warmth (riser into a soft impact + fire crackle)
m.hit("riser_synth", C["then_else"] + 0.35, -20, align="peak")
m.hit("impact_cool", C["then_else"] + 0.3, -20)
m.hit("projector_spin", C["then_else"], -32)        # soft crackle bed under the bonfire

# brief: typing the one sentence, highlights
m.hit("short_wind_swoosh", C["s_brief"] + 0.2, -20, align="peak")
m.hit("ui_start", C["b_one"] - 0.1, -18)
m.typing(C["b_one"] + 0.15, C["b_one"] + 0.15 + 66 / 24, -19)
m.pop(C["b_want"], -200, -18)
m.pop(C["b_feel"], 200, -18)

# ai: iris in, clips snap, captions pop, beats lock
m.hit("whoosh_fast", C["s_ai"] + 0.25, -16, align="peak")
for i in range(8):
    m.hit("light_pop", C["ai_cuts"] - 0.1 + i * 0.09, -21, pan=-0.6 + i * 0.17, rate=rng.uniform(0.95, 1.2))
m.hit("correct_tone", C["ai_cuts"] + 0.1, -20)
for i in range(8):
    m.hit("bubble_pop", C["ai_capt"] + i * 0.09, -24, pan=-0.6 + i * 0.17)
m.hit("correct_tone", C["ai_capt"] + 0.2, -21)
for i in range(7):
    m.hit("digital_tone", C["ai_times"] + 0.2 + i * 0.1, -24, rate=1.2)
m.hit("crystal_chime", C["ai_music"] + 0.1, -18)

# note: sticky slap + check, the phone posts it, likes
m.glide(C["s_note"] + 0.25, 0, g=-18)
m.hit("paper_crinkle", C["n_note"] - 0.1, -13)
m.hit("scribble", C["n_note"] + 0.3, -18)
m.hit("whoosh_fast2", C["n_post"] - 0.35, -18, align="peak")
m.hit("mouse_click", C["n_post"], -11)
m.hit("message_pop", C["n_post"] + 0.2, -13)
m.hit("stadium_applause", C["n_post"] + 0.35, -30, length=1.2)

# same: punch, strike, the new time stamps in
m.hit("whoosh_deep_impact", C["s_same"] + 0.05, -15)
m.hit("scribble", C["same_fifteen"] - 0.2, -16)
m.hit("stomp_impact", C["same_fifteen"], -14)
m.hit("coin_gold", C["same_fifteen"] + 0.3, -20)

# outro: iris into the evening, the title lands, the TV rises and the search types
m.hit("air_woosh", C["s_outro"] + 0.3, -15, align="peak")
m.hit("morning_birds", C["s_outro"] + 0.2, -30, length=5.5)
m.hit("impact_trailer", C["o_join"] + 0.05, -18)
m.hit("bell_chime", C["o_evenings"], -20)
m.hit("tape_switch", C["o_tv"] - 0.2, -18)
m.hit("soft_typing", C["o_tv"] + 0.15, -20, length=1.3)
m.finish()

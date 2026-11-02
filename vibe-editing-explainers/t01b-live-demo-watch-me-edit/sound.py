"""T01B sound: voice + tech-house bed (same as T01A/C) + UI foley on every on-screen event."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="tech_house_vibes_alejandro_magana.mp3", music_db=-9, duck=0.5)
C = m.C

# hook: lines draw on, the tile glows, the words land
m.hit("riser_synth", 0.0, -24, length=1.6)
m.hit("digital_tone", 0.05, -22)
m.pop(C["edit"], -200, -22); m.pop(C["this"], 200, -22)
m.hit("crystal_chime", C["by"] + 0.05, -20)
# raw: the tile grows into the frame
m.glide(C["raw"] + 0.2, 0, -17)
m.hit("camera_digital", C["raw"] + 0.4, -20)
m.lay(C["rawclip"], -200, quiet=-2)
# tell: zoom into the agent, the mic switches on
m.hit("whoosh_deep_impact", C["tell"] - 0.02, -20, align="peak")
m.hit("ui_start", C["tell"] + 0.25, -14)
m.hit("soft_typing", C["tell"] + 0.25, -24, length=0.6)

def command(at, done, x=0):
    m.hit("ui_click", at - 0.05, -14, pan=x / 700)
    m.hit("soft_typing", at, -26, length=0.9)
    m.hit("correct_tone", done + 0.02, -16)

# c1: whip in, pauses close with small snaps
m.hit("whoosh_fast", C["c1"] - 0.05, -17, align="peak")
command(C["c1"], C["done1"])
for k in range(5):
    m.hit("typewriter_soft_click", C["done1"] - 0.55 + k * 0.1, -22, rate=1.0 + k * 0.05)
# c2: flash, captions pop in
m.hit("camera_digital", C["c2"] - 0.06, -18)
command(C["c2"], C["done2"])
for k in range(6):
    m.pop(C["bold"] + 0.15 + k * 0.22, (k % 3 - 1) * 250, -24)
# c3: whip, the grade wipes across, music slides in
m.hit("whoosh_fast2", C["c3"] - 0.05, -17, align="peak")
command(C["c3"], C["done3"])
m.hit("riser_synth", C["warmer"], -26, length=1.2)
m.hit("tech_slide", C["music"], -18)
# c4: zoom, count down, the logo lands
m.hit("whoosh_deep_impact", C["c4"] - 0.05, -20, align="peak")
m.hit("ui_click", C["c4"] - 0.05, -14)
for k in range(8):
    m.hit("digital_tone", C["thirty"] + k * 0.1, -30, rate=1.0 + k * 0.03)
m.hit("long_pop", C["logo"] + 0.05, -15)
m.hit("correct_tone", C["done4"] + 0.02, -16)
# just: timeline and keyframes struck, then the studio flash
m.hit("camera_digital", C["just"] - 0.08, -19)
m.hit("glitch_break", C["notimeline"] + 0.2, -20)
m.hit("hit_swoosh_quick", C["notimeline"] + 0.25, -18)
m.hit("glitch_text", C["nokey"] + 0.2, -20)
m.hit("hit_swoosh_quick", C["nokey"] + 0.25, -18)
m.hit("camera_digital", C["talking"] - 0.12, -18)
m.hit("ui_start", C["talking"] + 0.2, -18)
# outro: flash, reveal, the two asks clicked
m.hit("impact_cool", C["outro"] - 0.1, -17)
m.hit("crystal_chime", C["vibe"] + 0.05, -20)
m.hit("hit_swoosh_long", C["follow"] - 0.2, -22, align="peak")
m.hit("mouse_click", C["follow"] + 0.35, -12)
m.hit("message_pop", C["follow"] + 0.4, -18)
m.hit("mouse_click", C["join"] + 0.5, -12)
m.hit("switch_tap", C["join"] + 0.55, -14)
m.finish()

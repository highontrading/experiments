"""Sound: Eleven v4 voice + 'Skyline' (Mixkit) + quiet gallery foley, all on the picture's cues."""
import sys; sys.path.insert(0, "../lib")
from mixer import Mixer

m = Mixer(__file__, music="skyline_eugenio_mininni.mp3", music_db=-9, duck=0.5)
C = m.C
SCROLL0 = C["h_scroll"] + 0.02
COLLECT = [C["k_stop"] + 0.3, C["c_line"] + 0.25, C["b_stakes"] + 0.32, C["p_for"] + 0.2]


def slam(at, x=0, g=-17):            # grunge title lands: low thud + paper
    m.hit("stomp_impact", at + 0.03, g, pan=x / 700)
    m.hit("paper_quick", at, -20, pan=x / 700)


def click(at, x=0, g=-15):           # a puzzle piece snapping into place
    m.hit("ui_click", at, g, pan=x / 700, rate=m.rng.uniform(0.8, 0.95))
    m.hit("typewriter_soft_click", at + 0.01, g - 4, pan=x / 700, rate=0.8)


# --- the puzzle on grid paper
m.hit("page_turn", 0.02, -18)
slam(C["h_four"] - 0.05, 0, -15)
for k in range(4):                    # pieces split, labels pop
    click(C["h_pieces"] - 0.1 + 0.05 * k, (-1) ** k * 200, -19)
    m.pop(C["h_pieces"] + 0.12 * k, (-1) ** k * 200, -21)
m.hit("short_wind_swoosh", C["h_miss"] + 0.35, -17, pan=-0.3, align="peak")     # the missing piece falls
m.hit("punch_fast", C["h_miss"] - 0.02, -16)
m.hit("hit_swoosh_quick", SCROLL0 + 0.4, -14, align="peak")                       # people scroll

# --- gallery wall
slam(C["k_hook"] - 0.05)
m.hit("ui_click", C["k_second"], -17, pan=-0.3)                                    # 0:00 -> 0:01
m.hit("long_pop", C["k_stop"] - 0.02, -9)                                          # the balloon pops
m.hit("bubble_pop", C["k_stop"], -14, rate=0.8)
m.hit("punch_fast", C["k_stop"] - 0.02, -14, pan=0.4)                              # STOP.
for k, c in enumerate(COLLECT):                                                    # piece flies to the tracker
    m.hit("small_sweep", c + 0.2, -22, pan=(k - 1.5) / 3, align="peak")
    click(c + 0.66, (k - 1.5) * 150, -15)
for k, g0 in enumerate([C["s_context"], C["s_build"], C["s_payoff"]]):             # camera glides
    m.glide(g0 + 0.42, k, -16)

slam(C["c_context"] - 0.05)
m.card(C["s_context"] + 0.2, 0, quiet=3)
t, line_len = C["c_why"] - 0.1, len("“This one habit saves you hours.”")
for i in range(line_len):                                                          # typed line
    if i % 2 == 0:
        m.hit("typewriter_soft_click", t + i / 26, -24, rate=m.rng.uniform(0.92, 1.1), pan=-0.1)
m.hit("paper_quick", C["c_why"] - 0.3, -18, pan=0.5)                               # the clock leans in
m.hit("writing_pencil", C["c_one"] - 0.05, -20, length=0.5)                        # highlighter sweep
m.pop(C["c_one"] - 0.05, 0, -20)

slam(C["b_build"] - 0.05)
for at, x in ((C["b_build"] + 0.25, -250), (C["b_shot"] - 0.1, -70), (C["b_raising"] - 0.1, 110)):
    m.card(at, x)
m.hit("riser_synth", C["b_stakes"] - 0.05, -22, align="peak", length=1.6)
slam(C["b_stakes"] - 0.08, 260, -16)

slam(C["p_payoff"] - 0.05)
m.hit("whoosh_impact", C["p_moment"] - 0.05, -18, align="peak")
m.hit("crystal_chime", C["p_moment"] - 0.02, -12)
m.hit("bell_chime", C["p_moment"] + 0.4, -24, length=1.5)

# --- the brief
m.glide(C["s_brief"] + 0.45, 1, -14)
for k in range(4):
    click(C["v_all"] - 0.05 + 0.1 * k, (-1) ** k * 120, -14)
m.hit("correct_tone", C["v_four"] + 0.2, -22)
m.hit("paper_slide", C["v_write"] - 0.3, -14)
m.hit("writing_pencil", C["v_write"], -21, length=1.4)
m.hit("tech_slide", C["v_ai"] - 0.3, -20)
for k in range(4):
    click(C["v_ai"] + 0.22 * k + 0.1, -300 + 200 * k, -18)
m.hit("correct_tone", C["v_them"] + 0.25, -17)

# --- the desk
m.hit("whoosh_fast", C["s_desk"] + 0.35, -15, align="peak")
m.hit("breeze_trees", C["s_desk"], -26, length=1.6)
m.hit("paper_slide", C["s_desk"] + 0.4, -15)
m.hit("page_turn", C["s_desk"] + 0.7, -19)
m.hit("paper_crinkle", C["o_save"] - 0.08, -15, length=0.6)                        # ribbon bookmark
m.hit("page_chime", C["o_save"] + 0.1, -16)
slam(C["o_save"] - 0.06, 0, -17)
m.pop(C["o_join"] - 0.08, 0, -15)
m.hit("impact_cool", C["o_vibe"] - 0.04, -19)
m.hit("breeze_trees", C["o_end"] - 0.2, -27, length=3.5)
m.hit("bell_chime", C["o_end"] + 0.35, -22, length=2.0)

m.finish()

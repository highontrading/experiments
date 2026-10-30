"""The four pieces of every great edit: voice lines on the clock, cues named after words."""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "hookp": 0.75, "context": 0.7, "build": 0.7, "payoff": 0.75,
                             "vibe": 1.0, "outro": 0.85}, tail=3.6)
w, L, E = T.w, T.L, T.E
T.save({
    # scene starts (camera / layout changes)
    "s_wall": L("hookp") - 0.55,          # puzzle scrolls away, gallery wall rises
    "s_context": L("context") - 0.45,     # glide to station 2
    "s_build": L("build") - 0.45,         # glide to station 3
    "s_payoff": L("payoff") - 0.45,       # glide to station 4
    "s_brief": L("vibe") - 0.55,          # wall drops, grid paper + assembled puzzle
    "s_desk": L("outro") - 0.5,           # zoom-through to the desk
    # hook line
    "h_great": w("hook", "great"), "h_edit": w("hook", "edit"), "h_four": w("hook", "four"),
    "h_pieces": w("hook", "pieces"), "h_miss": w("hook", "miss"), "h_one": w("hook", "one"),
    "h_scroll": w("hook", "scroll"),
    # the hook
    "k_hook": w("hookp", "hook"), "k_first": w("hookp", "first"), "k_second": w("hookp", "second"),
    "k_stop": w("hookp", "stop"),
    # the context
    "c_context": w("context", "context"), "c_why": w("context", "why"), "c_matters": w("context", "matters"),
    "c_one": w("context", "one"), "c_line": w("context", "line"),
    # the build-up
    "b_build": w("build", "buildup"), "b_every": w("build", "every"), "b_shot": w("build", "shot"),
    "b_raising": w("build", "raising"), "b_stakes": w("build", "stakes"),
    # the payoff
    "p_payoff": w("payoff", "payoff"), "p_moment": w("payoff", "moment"), "p_came": w("payoff", "came"),
    "p_for": w("payoff", "for"),
    # vibe editing
    "v_vibe": w("vibe", "vibe"), "v_write": w("vibe", "write"), "v_all": w("vibe", "all"),
    "v_four": w("vibe", "four"), "v_brief": w("vibe", "brief"), "v_ai": w("vibe", "ai"),
    "v_builds": w("vibe", "builds"), "v_them": w("vibe", "them"),
    # outro
    "o_save": w("outro", "save"), "o_next": w("outro", "next"), "o_edit": w("outro", "edit"),
    "o_join": w("outro", "join"), "o_vibe": w("outro", "vibe"), "o_editing": w("outro", "editing"),
    "o_end": E("outro"),
    "cover": L("vibe") + 1.2,
})

"""T02A · frustrated creator hook + the shared T02 body. Writes build/timeline.json/.js."""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "hours": 0.45, "grind": 0.3, "then": 0.7, "brief": 0.6,
                             "ai": 0.3, "note": 0.3, "same": 0.35, "outro": 0.4}, tail=2.9)
w, L, E = T.w, T.L, T.E
T.save({
    "hook_me": w("hook", "me"), "hook_night": w("hook", "night"), "hook_fight": w("hook", "fighting"),
    "hook_timeline": w("hook", "timeline"),
    "s_hours": L("hours") - 0.3, "hours_one": w("hours", "one"), "hours_reel": w("hours", "reel"),
    "s_grind": L("grind") - 0.25, "g_trim": w("grind", "trimming"), "g_hand": w("grind", "hand"),
    "g_type": w("grind", "typing"), "g_nudge": w("grind", "nudging"), "g_frame": w("grind", "frame"),
    "g_frame2": w("grind", "frame", 2),
    "s_then": E("grind") + 0.35, "then": L("then"), "then_else": w("then", "else"),
    "s_brief": L("brief") - 0.35, "b_one": w("brief", "one"), "b_want": w("brief", "want"), "b_feel": w("brief", "feel"),
    "s_ai": L("ai") - 0.25, "ai_cuts": w("ai", "cuts"), "ai_capt": w("ai", "captions"), "ai_times": w("ai", "times"),
    "ai_music": w("ai", "music"),
    "s_note": L("note") - 0.2, "n_note": w("note", "note"), "n_post": w("note", "post"),
    "s_same": L("same") - 0.25, "same_fifteen": w("same", "fifteen"),
    "s_outro": L("outro") - 0.3, "o_join": w("outro", "join"), "o_evenings": w("outro", "evenings"),
    "o_tv": E("outro") + 0.2,
    "cover": 1.6,
})
for k, l in T.lines.items():
    print(f"{k:6} {l['t0']:6.2f}-{l['t1']:6.2f} " + " ".join(f"{x['w']}@{x['t0']:.2f}" for x in l["words"]))

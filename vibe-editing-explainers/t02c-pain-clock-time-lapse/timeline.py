"""T02C · clock time-lapse hook + the shared T02 body. Places the composed take and names the cues."""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "hours": 0.4, "grind": 0.3, "then": 0.6, "brief": 0.55,
                             "ai": 0.3, "note": 0.3, "same": 0.35, "outro": 0.35}, tail=2.8)
w, L, E = T.w, T.L, T.E
T.save({
    "cover": w("hook", "one") - 0.1,
    # hook
    "watch": w("hook", "watch"), "clock": w("hook", "clock"), "this": w("hook", "this"),
    "one": w("hook", "one"), "reel": w("hook", "reel"), "hook_end": E("hook"),
    # hours
    "s_hours": L("hours") - 0.22, "three": w("hours", "three"), "hrs": w("hours", "hours"),
    "one2": w("hours", "one"), "reel2": w("hours", "reel"),
    # grind
    "trim": w("grind", "trimming"), "pause": w("grind", "pause"), "hand": w("grind", "hand"),
    "typing": w("grind", "typing"), "caption": w("grind", "caption"),
    "nudging": w("grind", "nudging"), "cut": w("grind", "cut"), "frame": w("grind", "frame"),
    "frame2": w("grind", "frame", 2), "grind_end": E("grind"),
    # then
    "s_then": L("then") - 0.4, "then": w("then", "then"), "i": w("then", "i"), "tried": w("then", "tried"),
    "something": w("then", "something"), "else": w("then", "else"), "then_end": E("then"),
    # brief
    "s_brief": L("brief") - 0.3, "sentence": w("brief", "sentence"), "what": w("brief", "what"),
    "want": w("brief", "want"), "how": w("brief", "how"), "feel": w("brief", "feel"),
    # ai
    "s_ai": L("ai") - 0.22, "cuts": w("ai", "cuts"), "captions": w("ai", "captions"),
    "times": w("ai", "times"), "music": w("ai", "music"),
    # note
    "s_note": L("note") - 0.22, "note": w("note", "note"), "post": w("note", "post"),
    # same
    "s_same": L("same") - 0.22, "same": w("same", "same"), "fifteen": w("same", "fifteen"),
    "minutes": w("same", "minutes"),
    # outro
    "s_outro": L("outro") - 0.28, "join": w("outro", "join"), "vibe": w("outro", "vibe"),
    "evenings": w("outro", "evenings"), "back": w("outro", "back"),
})

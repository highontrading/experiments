"""T02B 'Still editing reels manually?': place the voice and name every cue after its word."""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "hours": 0.35, "grind": 0.25, "then": 0.45, "brief": 0.6,
                             "ai": 0.25, "note": 0.3, "same": 0.3, "outro": 0.4}, tail=3.0)
w, L, E = T.w, T.L, T.E
T.save({
    # hook: the bold question, word by word
    "h_still": w("hook", "still"), "h_editing": w("hook", "editing"), "h_reels": w("hook", "reels"),
    "h_manually": w("hook", "manually"),
    # scene starts (each scene's camera arrives a beat before its line)
    "s_hours": L("hours") - 0.22, "s_trim": L("grind") - 0.18, "s_type": w("grind", "typing") - 0.18,
    "s_nudge": w("grind", "nudging") - 0.18, "s_then": L("then") - 0.25, "s_brief": L("brief") - 0.35,
    "s_ai": L("ai") - 0.18, "s_note": L("note") - 0.18, "s_same": L("same") - 0.18, "s_outro": L("outro") - 0.25,
    # hours
    "three": w("hours", "three"), "hours": w("hours", "hours"), "one_reel": w("hours", "one"),
    # grind
    "trimming": w("grind", "trimming"), "pause": w("grind", "pause"), "hand": w("grind", "hand"),
    "typing": w("grind", "typing"), "caption": w("grind", "caption"),
    "nudging": w("grind", "nudging"), "frame1": w("grind", "frame"), "frame2": w("grind", "frame", 2),
    "grind_end": E("grind"),
    # then
    "then": w("then", "then"), "tried": w("then", "tried"), "something": w("then", "something"),
    "else": w("then", "else"), "then_end": E("then"),
    # brief
    "one_sentence": w("brief", "one"), "want": w("brief", "want"), "feel": w("brief", "feel"), "brief_end": E("brief"),
    # ai
    "cuts": w("ai", "cuts"), "captions": w("ai", "captions"), "music": w("ai", "music"),
    # note
    "note": w("note", "note"), "post": w("note", "post"),
    # same
    "same": w("same", "same"), "fifteen": w("same", "fifteen"), "minutes": w("same", "minutes"),
    # outro
    "join": w("outro", "join"), "evenings": w("outro", "evenings"), "outro_end": E("outro"),
    "cover": w("hook", "manually") + 0.55,
})

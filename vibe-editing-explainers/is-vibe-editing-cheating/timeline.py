"""Is vibe editing cheating? Places the Eleven v4 lines on the clock and names the cues."""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "claim": 0.5, "twist": 0.9, "history": 0.9,
                             "you": 0.55, "verdict": 0.65, "outro": 0.6}, tail=4.0)
w, L, E = T.w, T.L, T.E
T.save({
    "cover": w("hook", "sentences") + 0.25,
    # hook
    "cheating": w("hook", "cheating"), "video": w("hook", "video"), "made": w("hook", "made"),
    "few": w("hook", "few"), "sentences": w("hook", "sentences"),
    # claim
    "s_claim": L("claim") - 0.25, "accusation": w("claim", "accusation"), "ai1": w("claim", "ai"),
    "work": w("claim", "work"), "s_ex": w("claim", "no") - 0.3,
    "no_tl": w("claim", "timeline"), "no_kf": w("claim", "keyframes"), "no_ln": w("claim", "late"),
    "claim_end": E("claim"),
    # twist
    "s_twist": L("twist") - 0.6, "but": w("twist", "but"), "there": w("twist", "there"),
    "was": w("twist", "was"), "a": w("twist", "a"), "twist": w("twist", "twist"), "twist_end": E("twist"),
    # history
    "s_hist": L("history") - 0.45, "every": w("history", "every"), "tool": w("history", "tool"),
    "reaction": w("history", "reaction"), "computer": w("history", "cutting"),
    "templates": w("history", "templates"), "presets": w("history", "presets"), "hist_end": E("history"),
    # you
    "s_you": L("you") - 0.3, "story": w("you", "story"), "moment": w("you", "moment"),
    "feeling": w("you", "feeling"), "youdo": w("you", "you"), "you_end": E("you"),
    # verdict
    "s_verdict": L("verdict") - 0.3, "is_it": w("verdict", "is"), "cheat2": w("verdict", "cheating"),
    "only": w("verdict", "only"), "stop": w("verdict", "stop"), "thinking": w("verdict", "thinking"),
    # outro
    "s_outro": L("outro") - 0.3, "comment": w("outro", "comment"), "verdict2": w("outro", "verdict"),
    "join": w("outro", "join"), "vibe": w("outro", "vibe"),
})

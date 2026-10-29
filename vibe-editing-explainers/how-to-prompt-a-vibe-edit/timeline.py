"""Place the Eleven v4 voiceover on the clock and name the cues the picture and sound share.
    python timeline.py  ->  build/timeline.json + build/timeline.js
"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "fix": 0.3, "goal": 0.3, "format": 0.3, "vibe": 0.3,
                             "refs": 0.3, "rules": 0.25, "outro": 0.3}, tail=1.9)
w, L, E = T.w, T.L, T.E
C = {
    # scene starts: each cut lands a beat before its line
    "s_fix": L("fix") - 0.18, "s_goal": L("goal") - 0.15, "s_format": L("format") - 0.15,
    "s_vibe": L("vibe") - 0.15, "s_refs": L("refs") - 0.15, "s_rules": L("rules") - 0.12,
    "s_outro": L("outro") - 0.15, "s_final": w("outro", "follow") - 0.25,
    # hook
    "most": w("hook", "most"), "ask": w("hook", "ask"), "ai": w("hook", "ai"), "video": w("hook", "video"),
    "then": w("hook", "then"), "wonder": w("hook", "wonder"), "generic": w("hook", "generic"),
    # fix
    "prompt": w("fix", "prompt"), "fixes": w("fix", "fixes"),
    # goal
    "goal": w("goal", "goal"), "who": w("goal", "who's"), "watching": w("goal", "watching"),
    "feel": w("goal", "feel"),
    # format
    "format": w("format", "format"), "vertical": w("format", "vertical"), "fortyfive": w("format", "fortyfive"),
    "captions": w("format", "captions"),
    # vibe
    "vibe": w("vibe", "vibe"), "not": w("vibe", "not"), "cool": w("vibe", "cool'"), "say": w("vibe", "say"),
    "calm": w("vibe", "calm"), "fast": w("vibe", "fast"), "cinematic": w("vibe", "cinematic"),
    "playful": w("vibe", "playful"),
    # refs
    "references": w("refs", "references"), "name": w("refs", "name"), "love1": w("refs", "love"),
    "what": w("refs", "what"), "love2": w("refs", "love", 2), "them": w("refs", "them"),
    # rules
    "last": w("rules", "last"), "rules": w("rules", "rules"), "real": w("rules", "real"),
    "only": w("rules", "only"), "endw": w("rules", "end"), "logo": w("rules", "logo"),
    # outro
    "o_goal": w("outro", "goal"), "o_format": w("outro", "format"), "o_vibe": w("outro", "vibe"),
    "o_refs": w("outro", "references"), "o_rules": w("outro", "rules"), "five": w("outro", "five"),
    "stops": w("outro", "stops"), "guessing": w("outro", "guessing"), "follow": w("outro", "follow"),
}
C["cover"] = C["fixes"] + 0.35
T.save(C)

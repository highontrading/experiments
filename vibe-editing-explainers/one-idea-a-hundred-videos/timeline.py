"""One idea, a hundred videos: every cut lands on a spoken word.
    python timeline.py  ->  build/timeline.json, build/timeline.js"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "doubt": 0.25, "code": 0.3, "new": 0.25, "math": 0.25,
                             "old": 0.35, "vibe": 0.3, "outro": 0.3}, tail=1.9)
w = T.w
C = {
    # scene cuts (each a new backdrop/layout)
    "c_editor": 0.0,
    "c_idea": w("hook", "one", 2) - 0.08,
    "c_hundred": w("hook", "one", 3) - 0.08,
    "c_impossible": w("doubt", "sounds") - 0.1,
    "c_isnt": w("doubt", "it") - 0.08,
    "c_why": w("doubt", "here's") - 0.08,
    "c_code": w("code", "when") - 0.1,
    "c_setting": w("code", "every") - 0.08,
    "c_four": w("code", "the", 1) - 0.08,
    "c_phone": w("new", "change") - 0.1,
    "c_hooks": w("math", "ten") - 0.08,
    "c_langs": w("math", "five") - 0.08,
    "c_formats": w("math", "three") - 0.08,
    "c_multiply": w("math", "multiply") - 0.08,
    "c_total": w("math", "one") - 0.08,
    "c_old": w("old", "the") - 0.1,
    "c_hand": w("old", "every") - 0.08,
    "c_vibe": w("vibe", "the") - 0.1,
    "c_template": w("vibe", "one") - 0.08,
    "c_teams": w("outro", "that's") - 0.1,
    "c_studios": w("outro", "post") - 0.08,
    "c_follow": w("outro", "follow") - 0.1,
    # word hits inside scenes
    "editor": w("hook", "editor"), "idea": w("hook", "idea"), "hundred": w("hook", "hundred"), "videos0": w("hook", "videos"),
    "impossible": w("doubt", "impossible"), "isnt": w("doubt", "isn't"), "why": w("doubt", "why"),
    "edit": w("code", "edit"), "code": w("code", "code"), "choice": w("code", "choice"), "setting": w("code", "setting"),
    "text": w("code", "text"), "music": w("code", "music"), "language": w("code", "language"), "length": w("code", "length"),
    "change": w("new", "change"), "newvid": w("new", "new"), "video1": w("new", "video"),
    "hooks": w("math", "hooks"), "test": w("math", "test"), "languages": w("math", "languages"), "formats": w("math", "formats"),
    "multiply": w("math", "multiply"), "them": w("math", "them"), "project": w("math", "project"),
    "becomes": w("math", "becomes"), "hundred2": w("math", "hundred"), "fifty": w("math", "fifty"), "videos2": w("math", "videos"),
    "oldway": w("old", "way"), "version": w("old", "version"), "newedit": w("old", "edit"), "by": w("old", "by"), "hand": w("old", "hand"),
    "vibeway": w("vibe", "way"), "template": w("vibe", "template"), "list": w("vibe", "list"),
    "small": w("outro", "small"), "teams": w("outro", "teams"), "big": w("outro", "big"), "studios": w("outro", "studios"),
    "follow": w("outro", "follow"), "more": w("outro", "more"), "vibeediting": w("outro", "vibe"),
}
C["cover"] = C["fifty"] + 0.55
T.save(C)

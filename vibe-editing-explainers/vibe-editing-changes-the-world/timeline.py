"""Clock for "How vibe editing is changing the world": lines placed with room to breathe,
cues named after the words they land on.    python timeline.py -> build/timeline.json"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.9, "now": 1.2, "teacher": 1.3, "shop": 1.2, "creator": 1.2, "why": 1.4, "outro": 1.5},
             tail=3.6)
w, L, E = T.w, T.L, T.E
T.save({
    # scene starts: each layout lands just before its line
    "s_now": L("now") - 0.75, "s_teacher": L("teacher") - 0.8, "s_shop": L("shop") - 0.75,
    "s_creator": L("creator") - 0.75, "s_why": L("why") - 0.8, "s_outro": L("outro") - 0.9,
    "cover": L("why") + 1.6,

    "studio": w("hook", "studio"), "software": w("hook", "software"), "years": w("hook", "years"),
    "practice": w("hook", "practice"),
    "idea": w("now", "idea"), "sentences": w("now", "sentences"),
    "teacher": w("teacher", "teacher"), "lesson": w("teacher", "lesson"), "tonight": w("teacher", "tonight"),
    "shop": w("shop", "shop"), "ads": w("shop", "ads"), "agency": w("shop", "agency"),
    "creator": w("creator", "creator"), "english": w("creator", "english"), "hindi": w("creator", "hindi"),
    "project": w("creator", "project"),
    "language": w("why", "language"), "anyone": w("why", "anyone"), "seen": w("why", "seen", end=True),
    "world": w("outro", "world"), "sentence": w("outro", "sentence"), "time": w("outro", "time"),
})

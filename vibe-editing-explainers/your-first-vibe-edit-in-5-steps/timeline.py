"""Places the voiceover on the clock and names every cue after its word.
    python timeline.py  ->  build/timeline.json + build/timeline.js"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "s1": 0.35, "s2": 0.4, "s3": 0.4, "s4": 0.4, "s5": 0.4, "outro": 0.45},
             tail=3.0)
w, L, E = T.w, T.L, T.E
C = {
    # hook
    "h_this": w("hook", "this"), "h_how": w("hook", "how"), "h_make": w("hook", "make"), "h_first": w("hook", "first"),
    "h_vibe": w("hook", "vibe"), "h_edit": w("hook", "edit"), "h_under": w("hook", "under"), "h_ten": w("hook", "ten"),
    "h_minutes": w("hook", "minutes"), "h_no1": w("hook", "no"), "h_timeline": w("hook", "timeline"),
    "h_no2": w("hook", "no", 2), "h_keyframes": w("hook", "keyframes"),
    # step 1
    "s1": L("s1"), "s1_put": w("s1", "put"), "s1_folder": w("s1", "folder"), "s1_clips": w("s1", "clips"),
    "s1_music": w("s1", "music"), "s1_logo": w("s1", "logo"),
    # step 2
    "s2": L("s2"), "s2_open": w("s2", "open"), "s2_agent": w("s2", "agent"), "s2_folder": w("s2", "folder"),
    "s2_write": w("s2", "write"), "s2_brief": w("s2", "brief"), "s2_platform": w("s2", "platform"),
    "s2_length": w("s2", "length"), "s2_mood": w("s2", "mood"), "s2_ends": w("s2", "ends"),
    # step 3
    "s3": L("s3"), "s3_let": w("s3", "let"), "s3_build": w("s3", "build"), "s3_writes": w("s3", "writes"),
    "s3_code": w("s3", "code"), "s3_renders": w("s3", "renders"), "s3_draft": w("s3", "draft"),
    # step 4
    "s4": L("s4"), "s4_watch": w("s4", "watch"), "s4_once": w("s4", "once"), "s4_give": w("s4", "give"),
    "s4_three": w("s4", "three"), "s4_notes": w("s4", "notes"), "s4_not": w("s4", "not"),
    "s4_fifty": w("s4", "fifty"), "s4_three2": w("s4", "three", 2),
    # step 5
    "s5": L("s5"), "s5_export": w("s5", "export"), "s5_keep": w("s5", "keep"), "s5_project": w("s5", "project"),
    "s5_next": w("s5", "next"), "s5_change": w("s5", "change"), "s5_brief": w("s5", "brief"),
    # outro
    "o_want": w("outro", "want"), "o_template": w("outro", "template"), "o_comment": w("outro", "comment"),
    "o_vibe": w("outro", "vibe"), "o_join": w("outro", "join"), "o_vibe2": w("outro", "vibe", 2),
    "o_editing": w("outro", "editing"), "o_end": E("outro"),
}
C["cover"] = C["h_under"] + 0.6
T.save(C)

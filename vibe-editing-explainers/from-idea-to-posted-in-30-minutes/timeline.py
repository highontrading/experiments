"""Place the voiceover on the clock and name every cue after its spoken word.
    python timeline.py -> build/timeline.json, build/timeline.js"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "t900": 0.5, "t905": 0.4, "t912": 0.4, "t920": 0.4, "t930": 0.4, "outro": 0.7},
             tail=3.1)
w, L, E = T.w, T.L, T.E
T.save({
    # hook
    "h_nine": w("hook", "nine"), "h_idea": w("hook", "idea"), "h_by": w("hook", "by"),
    "h_thirty": w("hook", "thirty"), "h_posted": w("hook", "posted"), "h_here": w("hook", "here's"),
    # 9:00
    "a0": L("t900"), "a_idea": w("t900", "idea"), "a_explain": w("t900", "explain"),
    "a_minute": w("t900", "minute"),
    # 9:05
    "b0": L("t905"), "b_brief": w("t905", "brief"), "b_four": w("t905", "four"),
    "b_plain": w("t905", "plain"),
    # 9:12
    "c0": L("t912"), "c_first": w("t912", "first"), "c_clip": w("t912", "clip"),
    "c_caption": w("t912", "caption"), "c_timed": w("t912", "timed"), "c_end": E("t912"),
    # 9:20
    "d0": L("t920"), "d_notes": w("t920", "notes"), "d_faster": w("t920", "faster"),
    "d_warmer": w("t920", "warmer"), "d_bigger": w("t920", "bigger"), "d_end": E("t920"),
    # 9:30
    "e0": L("t930"), "e_posted": w("t930", "posted"), "e_end": E("t930"),
    # outro
    "f0": L("outro"), "f_whole": w("outro", "whole"), "f_night": w("outro", "night"),
    "f_they": w("outro", "they"), "f_direct": w("outro", "direct"), "f_join": w("outro", "join"),
    "f_vibe": w("outro", "vibe"), "f_last": E("outro"),
    "cover": w("t905", "plain") + 0.6,
})
for k, l in T.lines.items():
    print(f"{k:6} {l['t0']:6.2f}-{l['t1']:6.2f}  " + " ".join(f"{x['w']}@{x['t0']:.2f}" for x in l["words"]))

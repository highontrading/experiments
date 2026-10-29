"""Will AI replace video editors? — every cue named after the word it lands on.
    python timeline.py  ->  build/timeline.json + build/timeline.js"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.9, "good": 1.0, "time": 1.0, "cant": 1.0, "change": 1.0,
                             "team": 1.0, "outro": 1.0}, tail=2.8)
w, L = T.w, T.L
T.save({
    # layout starts: each new layout has settled just before its line
    "s_good": L("good") - 0.75, "s_time": L("time") - 0.8, "s_cant": L("cant") - 0.8,
    "s_change": L("change") - 0.8, "s_team": L("team") - 0.8, "s_dir": L("outro") - 0.8,
    "s_week": w("outro", "and") - 0.55,
    "hook_ai": w("hook", "ai"), "hook_replace": w("hook", "replace"), "hook_video": w("hook", "video"),
    "hook_editors": w("hook", "editors"), "hook_honest": w("hook", "honest"),
    "good_repetitive": w("good", "repetitive"), "good_cutting": w("good", "cutting"), "good_silences": w("good", "silences"),
    "good_syncing": w("good", "syncing"), "good_captions": w("good", "captions"),
    "good_resizing": w("good", "resizing"), "good_every": w("good", "every"), "good_platform": w("good", "platform"),
    "time_jobs": w("time", "jobs"), "time_afternoon": w("time", "afternoon"), "time_minutes": w("time", "minutes"),
    "cant_taste": w("cant", "taste"), "cant_moment": w("cant", "moment"), "cant_hold": w("cant", "hold"),
    "cant_cut": w("cant", "cut"),
    "change_disappearing": w("change", "disappearing"), "change_changing": w("change", "changing"),
    "change_less": w("change", "less"), "change_more": w("change", "more"), "change_deciding": w("change", "deciding"),
    "team_editor": w("team", "editor"), "team_direct": w("team", "direct"), "team_ai": w("team", "ai"),
    "team_work": w("team", "work"), "team_small": w("team", "small"), "team_team": w("team", "team"),
    "outro_future": w("outro", "future"), "outro_director": w("outro", "director"),
    "outro_future2": w("outro", "future", 2), "outro_starts": w("outro", "starts"), "outro_week": w("outro", "week"),
    "cover": w("hook", "honest") + 0.6,
})

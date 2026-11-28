import json, sys
sys.path.insert(0, "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/scripts")
from vibe_engine.core import build_segments, TimeMap
def owords(job, ws="/home/user/experiments/Vibe Editor"):
    jd = f"{ws}/.vibe/jobs/{job}"
    words = json.load(open(f"{jd}/words.json")); jobj = json.load(open(f"{jd}/job.json"))
    edit = json.load(open(f"{jd}/edit.json"))
    segs = build_segments(words, jobj["probe"]["duration"], edit.get("cuts"))
    tm = TimeMap(segs)
    return tm.words(words), tm.duration, segs
if __name__ == "__main__":
    w, d, s = owords(sys.argv[1]); print("dur", round(d,3), "segs", s)
    for x in w: print(x["i"], x["text"], x["start"], x["end"])

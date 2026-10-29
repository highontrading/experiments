"""Single source of truth for picture and sound.

Places each voiceover line on the film's clock (with breathing room between lines),
then names every cue after the word it lands on.
    python timeline.py  ->  build/timeline.json
"""
import json, pathlib, re

FPS, W, H = 30, 1080, 1920
LINES = json.load(open("vo/lines.json"))
GAP_BEFORE = {"hook": 1.0, "name": 0.6, "past": 1.3, "flip": 0.9, "how": 0.8,
              "scale": 0.8, "role": 0.9, "outro": 1.0}
TAIL = 2.8

lines, t = {}, 0.0
for l in LINES:
    t += GAP_BEFORE[l["id"]]
    shift = t - l["t0"]
    words = [{"w": re.sub(r"[^\w']", "", w["w"]).lower(), "raw": w["w"],
              "t0": round(w["t0"] + shift, 3), "t1": round(w["t1"] + shift, 3)} for w in l["words"]]
    lines[l["id"]] = {"text": l["text"], "src0": l["t0"], "src1": l["t1"], "t0": round(t, 3),
                      "t1": round(l["t1"] + shift, 3), "words": words}
    t = l["t1"] + shift
DUR = round(t + TAIL, 2)


def w(line, word, n=1, end=False):
    """Time of the n-th occurrence of `word` in `line` (start, or end with end=True)."""
    hits = [x for x in lines[line]["words"] if x["w"] == word]
    x = hits[n - 1]
    return x["t1"] if end else x["t0"]


L = lambda k: lines[k]["t0"]
E = lambda k: lines[k]["t1"]

CUE = {
    # scene windows: camera arrives at each board just before its line
    "s_hook": 0.0, "s_title": L("name") - 0.45, "s_past": L("past") - 0.55, "s_flip": L("flip") - 0.5,
    "s_how": L("how") - 0.5, "s_scale": L("scale") - 0.45, "s_role": L("role") - 0.45,
    "s_outro": L("outro") - 0.5, "end": DUR,

    "hook_timeline": w("hook", "timeline"), "hook_never": w("hook", "never"),
    "hook_clip": w("hook", "clip"), "hook_dragged": w("hook", "dragged"),
    "hook_written": w("hook", "written"), "hook_code": w("hook", "code"), "hook_ai": w("hook", "ai"),

    "title_vibe": w("name", "vibe"), "title_editing": w("name", "editing"),

    "past_century": w("past", "century"), "past_this": w("past", "this"),
    "past_cutting": w("past", "cutting"), "past_hand": w("past", "hand"),
    "past_dragging": w("past", "dragging"), "past_frame": w("past", "frame"),
    "past_hours": w("past", "hours"),

    "flip_flips": w("flip", "flips"), "flip_describe": w("flip", "describe"),
    "flip_mood": w("flip", "mood"), "flip_pace": w("flip", "pace"), "flip_look": w("flip", "look"),
    "flip_plain": w("flip", "plain"),

    "how_agent": w("how", "agent"), "how_code": w("how", "code"),
    "how_clip": w("how", "clip"), "how_caption": w("how", "caption"), "how_sound": w("how", "sound"),
    "how_renders": w("how", "renders"), "how_video": w("how", "video"),

    "scale_line": w("scale", "line"), "scale_everything": w("scale", "everything"),
    "scale_faster": w("scale", "faster"), "scale_hindi": w("scale", "hindi"),
    "scale_hundred": w("scale", "hundred"),

    "role_stop": w("role", "stop"), "role_clicking": w("role", "clicking"),
    "role_start": w("role", "start"), "role_directing": w("role", "directing"),

    "outro_episode": w("outro", "episode"), "outro_follow": w("outro", "follow"),
}

out = {"fps": FPS, "w": W, "h": H, "dur": DUR, "lines": lines, "cue": {k: round(v, 3) for k, v in CUE.items()}}
pathlib.Path("build").mkdir(exist_ok=True)
json.dump(out, open("build/timeline.json", "w"), indent=1)
if __name__ == "__main__":
    print(f"dur {DUR}s, {round(DUR * FPS)} frames")
    for k, v in out["cue"].items(): print(f"  {k:16} {v:6.2f}")

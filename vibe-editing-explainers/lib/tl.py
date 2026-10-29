"""Timeline helper: place voiceover lines on the film's clock, name cues after words.

    from tl import Timeline
    T = Timeline(__file__, gaps={"hook": 0.9, ...}, tail=2.6)
    T.save({"s_brief": T.L("brief") - 0.5, "mood": T.w("brief", "mood"), ...})
"""
import json, pathlib, re


class Timeline:
    def __init__(self, file, gaps, tail=2.6, fps=30, w=1080, h=1920):
        self.dir = pathlib.Path(file).resolve().parent
        self.fps, self.wd, self.ht = fps, w, h
        self.lines, t = {}, 0.0
        for l in json.load(open(self.dir / "vo/lines.json")):
            t += gaps.get(l["id"], 0.8)
            shift = t - l["t0"]
            words = [{"w": re.sub(r"[^\w']", "", x["w"]).lower(), "raw": x["w"],
                      "t0": round(x["t0"] + shift, 3), "t1": round(x["t1"] + shift, 3)} for x in l["words"]]
            self.lines[l["id"]] = {"text": l["text"], "src0": l["t0"], "src1": l["t1"], "t0": round(t, 3),
                                   "t1": round(l["t1"] + shift, 3), "words": words}
            t = l["t1"] + shift
        self.dur = round(t + tail, 2)

    def w(self, line, word, n=1, end=False):
        """Time of the n-th occurrence of `word` in `line` (its start, or its end with end=True)."""
        hits = [x for x in self.lines[line]["words"] if x["w"] == word.lower()]
        if len(hits) < n:
            raise KeyError(f"{word!r} #{n} not in line {line!r}: {[x['w'] for x in self.lines[line]['words']]}")
        return hits[n - 1]["t1" if end else "t0"]

    def L(self, k): return self.lines[k]["t0"]
    def E(self, k): return self.lines[k]["t1"]

    def save(self, cues):
        if "end" in cues and abs(cues["end"] - self.dur) > 1e-6:   # "end" is reserved for the film's length
            print(f"WARNING: cue 'end' ({cues['end']:.2f}) is reserved and becomes the duration ({self.dur}); rename your cue")
        cues = {**cues, "end": self.dur}
        out = {"fps": self.fps, "w": self.wd, "h": self.ht, "dur": self.dur, "lines": self.lines,
               "cue": {k: round(v, 3) for k, v in cues.items()}}
        (self.dir / "build").mkdir(exist_ok=True)
        json.dump(out, open(self.dir / "build/timeline.json", "w"), indent=1)
        (self.dir / "build/timeline.js").write_text("window.TL = " + json.dumps(out) + ";\n")
        print(f"{self.dir.name}: {self.dur}s, {round(self.dur * self.fps)} frames, {len(cues)} cues")
        return out

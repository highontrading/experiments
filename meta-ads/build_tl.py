"""Place each VO ad's lines on its timeline and map caption words onto the TTS timing.
-> build/<ad>/tl.json + tl.js (window.TL = {lines:[{at,end,cap,words:[{w,s,e}]}]})
Caption words are spread over the spoken span of their line by character weight, using the TTS
character timestamps (works for Roman captions over Devanagari audio too)."""
import json, os, sys, re
from vo_spec import ADS

START = {"a01": 0.35, "a03": 0.30, "a05": 0.6, "a06": 0.5, "a09": 0.3, "a10": 0.5, "a11": 0.4, "a12": 0.25, "a18": 0.3, "a19": 0.3}
GAP = {"a01": [0.25, 0.35, 0.5, 0.5], "a03": [0.5, 0.35, 0.5, 0.6], "a05": [0.4, 0.7, 0.4, 0.5], "a06": [0.25, 0.6, 0.5, 0.5],
       "a09": [0.3, 0.45, 0.2], "a10": [0.35, 0.35, 0.35], "a11": [0.2, 0.45, 0.35], "a12": [0.3, 0.3, 0.35], "a18": [0.35, 0.15],
       "a19": [0.2, 0.3, 0.4]}

def line_words(d, at):
    chars, s, e = d["chars"], d["s"], d["e"]
    voiced = [i for i, c in enumerate(chars) if not c.isspace() and c not in ".,?!।"]
    t0, t1 = s[voiced[0]], e[voiced[-1]]
    # per-character time curve of the TTS (to keep pauses inside the line)
    cum = [i / max(1, len(voiced) - 1) for i in range(len(voiced))]
    times = [s[i] for i in voiced]
    caps = d["cap"].split()
    weights = [max(1, len(re.sub(r"[^\w$&]", "", w))) for w in caps]
    tot = sum(weights); acc = 0; words = []
    def at_frac(f):
        k = min(len(times) - 1, int(f * (len(times) - 1)))
        return times[k]
    for w, wt in zip(caps, weights):
        f0, f1 = acc / tot, (acc + wt) / tot; acc += wt
        words.append({"w": w, "s": round(at + at_frac(f0), 3), "e": round(at + at_frac(min(1, f1)), 3)})
    return words, at + t0, at + t1

for ad, spec in ADS.items():
    if len(sys.argv) > 1 and ad not in sys.argv[1:]: continue
    t = START[ad]; lines = []
    for i in range(len(spec["lines"])):
        d = json.load(open(f"build/vo/{ad}_{i}.json"))
        words, v0, v1 = line_words(d, t)
        lines.append({"i": i, "at": round(t, 3), "v0": round(v0, 3), "v1": round(v1, 3), "cap": d["cap"], "words": words})
        if i < len(spec["lines"]) - 1: t = v1 + GAP[ad][i] - (v0 - t) * 0 - 0.0
        t = round(t, 3)
    os.makedirs(f"build/{ad}", exist_ok=True)
    tl = {"ad": ad, "lines": lines, "vo_end": lines[-1]["v1"]}
    json.dump(tl, open(f"build/{ad}/tl.json", "w"), indent=1)
    open(f"build/{ad}/tl.js", "w").write("window.TL=" + json.dumps(tl) + ";")
    print(ad, "VO ends", lines[-1]["v1"], " | ".join(f"{l['at']}:{l['cap'][:22]}" for l in lines))

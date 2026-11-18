"""Turn word-range keeps into a tight cut list (EDL) using Scribe word times + audio energy.
Every kept phrase becomes a segment; pauses inside and between phrases are compressed."""
import json, sys, wave, numpy as np
W = "/home/user/work"
cuts = json.load(open(sys.argv[1]))
PRE, POST, MAXGAP = 0.05, 0.09, 0.30   # pad before/after speech, split phrases on gaps > MAXGAP

def energy(n):
    w = wave.open(f"{W}/a_{n}.wav"); a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.
    hop = 160; e = np.array([np.sqrt(np.mean(a[i:i+320]**2) + 1e-12) for i in range(0, len(a) - 320, hop)])
    return 20 * np.log10(e)
def refine_end(db, t, lim):  # extend tail while still voiced
    i = int(t * 100)
    while i < min(len(db) - 1, int(lim * 100)) and db[i] > -42: i += 1
    return i / 100
def refine_start(db, t, lim):
    i = int(t * 100)
    while i > max(0, int(lim * 100)) and db[i - 1] > -42: i -= 1
    return i / 100

out = {}
for n, cfg in cuts.items():
    d = json.load(open(f"{W}/tr_{n}.json"))
    ws = [w for w in d["words"] if w["type"] == "word"]
    for k, o in cfg.get("override", {}).items(): ws[int(k)].update(o)
    db = energy(n)
    phrases = []
    for a, b in cfg["keep"]:
        cur = [a]
        for i in range(a + 1, b + 1):
            if ws[i]["start"] - ws[i - 1]["end"] > MAXGAP: phrases.append((cur[0], i - 1)); cur = [i]
        phrases.append((cur[0], b))
    segs = []
    for j, (a, b) in enumerate(phrases):
        prev_end = ws[a - 1]["end"] if a > 0 else 0
        nxt = ws[b + 1]["start"] if b + 1 < len(ws) else ws[b]["end"] + 0.5
        s = ws[a]["start"] if str(a) in cfg.get("override", {}) else refine_start(db, ws[a]["start"], max(prev_end, ws[a]["start"] - 0.15))
        e = refine_end(db, ws[b]["end"], min(nxt - 0.03, ws[b]["end"] + 0.25))
        segs.append({"in": round(max(prev_end, s - PRE), 3), "out": round(min(nxt - 0.02, e + POST), 3), "w": [a, b]})
    # build output timeline + remapped words
    t = 0; words = []
    for s in segs:
        s["t"] = round(t, 3)
        for i in range(s["w"][0], s["w"][1] + 1):
            w = ws[i]
            words.append({"i": i, "text": w["text"], "start": round(t + max(0, w["start"] - s["in"]), 3),
                          "end": round(t + min(s["out"], w["end"]) - s["in"], 3)})
        t += s["out"] - s["in"]
    out[n] = {"segments": segs, "words": words, "duration": round(t, 3)}
    print(n, "segments", len(segs), "duration %.2f (raw %.2f)" % (t, ws[-1]["end"]))
json.dump(out, open(sys.argv[2], "w"), indent=1, ensure_ascii=False)

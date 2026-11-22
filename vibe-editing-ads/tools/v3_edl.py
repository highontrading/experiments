"""V3 cut list: keep word ranges, tighten every pause, but hold a short real beat after each command
so the on-screen "execution" has room.  -> edit/v3_edl.json"""
import json, wave, numpy as np, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = "/home/user/raw3"
# (first word, last word, seconds of the real pause to keep after it)
KEEP = [
    (2, 19, 0.0),     # this whole video, I am not editing it, Claude is. I am just telling it what to do.
    (20, 23, 0.75),   # Claude, put some music.            [music drops]
    (24, 24, 0.25),   # Hmm.
    (25, 29, 0.55),   # Add some sound effects also.       [sfx burst]
    (30, 41, 0.15),   # And no, I didn't open Premiere Pro, no DaVinci, no HitFilm, nothing.
    (42, 46, 0.2),    # I don't even know coding.
    (48, 50, 0.5),    # now add captions.                  [basic captions]
    (51, 53, 0.35),   # Nah, too basic.                    [captions crumble]
    (54, 59, 0.45),   # Highlight the word I am saying.
    (60, 60, 0.2),    # Hmm.
    (61, 66, 0.9),    # Make it look like a magazine.      [magazine cover]
    (68, 73, 0.6),    # Put the words behind my head.
    (74, 76, 0.6),    # Wait. Try handwritten.
    (77, 79, 0.3),    # Yeah, this one.
    (80, 88, 0.3),    # See? Five caption styles and I didn't touch anything.
    (89, 98, 0.9),    # Now, cut me out and put me on a whiteboard.   [cut-out]
    (100, 111, 0.2),  # So this is what I call vibe editing, and it's actually simple.
    (112, 122, 0.3),  # First, you just need to record yourself. Your phone is enough.
    (123, 136, 0.3),  # Then you tell Claude what you want, like you are talking to an editor.
    (137, 157, 0.3),  # And the main thing is the workflow. I made a skill file ...
    (158, 179, 0.2),  # Because honestly ... it's how you use it.
    (181, 183, 0.7),  # put me back.                       [return]
    (184, 199, 0.3),  # So, I have put everything in one course ...
    (200, 214, 0.0),  # So if you want your videos to look like this, just tap the button below.
]
PRE, POST, MAXGAP = 0.05, 0.09, 0.28


def main():
    d = json.load(open(f"{RAW}/tr.json"))
    ws = [w for w in d["words"] if w["type"] == "word"]
    w_ = wave.open(f"{RAW}/a.wav"); a = np.frombuffer(w_.readframes(w_.getnframes()), np.int16) / 32768.
    db = 20 * np.log10(np.array([np.sqrt(np.mean(a[i:i + 320] ** 2) + 1e-12) for i in range(0, len(a) - 320, 160)]))
    def tail(t, lim):
        i = int(t * 100)
        while i < min(len(db) - 1, int(lim * 100)) and db[i] > -42: i += 1
        return i / 100
    def head(t, lim):
        i = int(t * 100)
        while i > max(0, int(lim * 100)) and db[i - 1] > -42: i -= 1
        return i / 100
    segs = []
    for a0, b0, hold in KEEP:
        phrases, cur = [], a0
        for i in range(a0 + 1, b0 + 1):
            if ws[i]["start"] - ws[i - 1]["end"] > MAXGAP: phrases.append((cur, i - 1)); cur = i
        phrases.append((cur, b0))
        for k, (a, b) in enumerate(phrases):
            prev_end = ws[a - 1]["end"] if a > 0 else 0
            nxt = ws[b + 1]["start"] if b + 1 < len(ws) else ws[b]["end"] + 2
            s = head(ws[a]["start"], max(prev_end, ws[a]["start"] - 0.15))
            e = tail(ws[b]["end"], min(nxt - 0.03, ws[b]["end"] + 0.25))
            out = min(nxt - 0.03, e + POST)
            if k == len(phrases) - 1 and hold: out = min(nxt - 0.06, e + POST + hold)
            segs.append({"in": round(max(prev_end, s - PRE), 3), "out": round(out, 3), "w": [a, b]})
    # waveform-level tightening: silences > 0.2 s inside a kept phrase (that the transcript folded into a word)
    # are cut down to 0.08 s. Command "holds" at the very end of a segment are left alone.
    out = []
    for s in segs:
        hold_from = s["out"] - 0.0
        i0, i1 = int(s["in"] * 100), int(s["out"] * 100)
        cuts, k = [], i0 + 5
        while k < i1 - 5:
            if db[k] < -45:
                j = k
                while j < i1 - 5 and db[j] < -45: j += 1
                if (j - k) / 100 > 0.2 and j < i1 - 6:
                    cuts.append(((k + 4) / 100, (j - 4) / 100))
                k = j
            else: k += 1
        cur = s["in"]
        for c0, c1 in cuts:
            out.append({"in": round(cur, 3), "out": round(c0, 3), "w": s["w"]}); cur = c1
        out.append({"in": round(cur, 3), "out": s["out"], "w": s["w"]})
        if cuts: print("tightened", s["w"], [(round(c0, 2), round(c1, 2)) for c0, c1 in cuts])
    segs = out
    t = 0; words = []
    for s in segs:
        s["t"] = round(t, 3)
        for i in range(s["w"][0], s["w"][1] + 1):
            w = ws[i]
            if not (s["in"] - 0.05 <= w["start"] < s["out"]): continue
            words.append({"i": i, "text": w["text"], "start": round(t + max(0, w["start"] - s["in"]), 3),
                          "end": round(t + min(s["out"], w["end"]) - s["in"], 3)})
        t += s["out"] - s["in"]
    json.dump({"segments": segs, "words": words, "duration": round(t, 3)}, open(f"{ROOT}/edit/v3_edl.json", "w"), indent=1)
    print("segments", len(segs), "duration %.2f (raw %.2f)" % (t, ws[-1]["end"]))


if __name__ == "__main__":
    main()

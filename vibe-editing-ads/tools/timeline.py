"""Creative timeline for each ad. Everything is keyed to word indices from the transcript,
so captions, motion graphics, camera moves and SFX stay locked to the cut in edit/edl.json.

  python3 tools/timeline.py            -> build/<id>/timeline.json for every ad
"""
import json, os, glob, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = "/home/user/work"
FPS = 30
END_CARD = 2.8          # seconds of end card after the last word

ROMAN = {
    "2511": {1: "Aajkal", 2: "har", 3: "koi", 4: "apna", 7: "se", 8: "kar", 9: "raha", 10: "hai", 18: "Wahi", 27: "Anyone"},
    "2512": {0: "Aajkal", 1: "har", 2: "koi", 3: "apna", 6: "se", 7: "kar", 8: "raha", 9: "hai", 38: "ki", 39: "yeh",
             42: "ne", 43: "kiya", 44: "hai", 65: "Yeh", 66: "hai", 67: "ek", 102: "high-end"},
    "2508": {1: "Nowadays", 38: "Everyone"},
}

# Caption groups: (first_word, last_word, layout, opts)
#   basic  - the "typical AI edit" look: yellow Montserrat, current word highlighted (before the turn)
#   line   - one kinetic line; opts.em = words set in the serif italic accent
#   stack  - small lead-in line over a big line; opts.split = first word of the big line
#   hero   - opts.hero word goes huge BEHIND the head (depth matte), the line sits in front
#   none   - no caption (a motion graphic carries the words)
# Caption groups: (first_word, last_word, layout, opts)
#   basic  - "typical AI edit": yellow Montserrat on the video (before the turn)
#   below  - big editorial type under the video card; opts.split = first word of the big line
#   over   - kinetic line on the video, over the person
#   behind - opts.hero word huge BEHIND the person (depth matte), rest of the line over the video
#   side   - opts.hero word set sideways (rotated) beside the head, behind the person
#   top    - one big word over the person (opts.hero), rest small above it
#   opts.em = words in the serif italic accent; opts.red = accent in red (else white)
# Caption groups: (first_word, last_word, layout, opts)
#   basic  - "typical AI edit": yellow Montserrat on the video (before the turn)
#   below  - big editorial type under the video card; opts.split = first word of the big line
#   over   - kinetic line on the video, over the person
#   behind - opts.hero word huge BEHIND the person (depth matte), rest of the line over the video
#   side   - opts.hero word set sideways (rotated) beside the head, behind the person
#   top    - one big word over the person (opts.hero), rest small above it
#   opts.em = words in the serif italic accent; opts.red = accent in red (else white)
# Motion graphics: ("board", a, b, {"kind": ...}) is a white explainer board; the footage glides into a
#   16:9 picture-in-picture while it is up. Boards closer than 0.6 s merge into one continuous board.
SPEC = {
"2508": dict(
    turn=dict(glitch=49, reveal_seg_word=61),
    captions=[
        (1, 1, "basic", {}), (2, 5, "basic", {}), (6, 7, "basic", {}),
        (8, 10, "basic", {}), (11, 15, "basic", {}),
        (16, 18, "basic", {}), (19, 21, "basic", {"emoji": "😐"}),
        (22, 26, "basic", {"yellow_all": True}),
        (27, 29, "basic", {"emoji": "🔊"}),
        (30, 32, "basic", {"emoji": "✨"}),
        (38, 41, "basic", {}), (42, 45, "basic", {}), (46, 48, "basic", {"emoji": "🤖"}),
        (49, 52, "below", {"split": 51, "em": [52], "red": True}),
        (61, 63, "over", {"em": [63]}),
        (64, 68, "below", {"split": 68, "em": [68]}),
        (69, 73, "below", {"split": 70, "em": [70], "rest_small": True, "red": True}),
        (74, 78, "behind", {"hero": 78}),
        (79, 81, "side", {"hero": 81, "red": True}),
        (82, 88, "below", {"split": 87, "em": [88], "red": True}),
        (89, 94, "below", {"split": 94}),
        (95, 97, "below", {"split": 95, "em": [96]}),
        (98, 101, "top", {"hero": 100, "hero2": 101, "red": True}),
        (102, 107, "over", {"em": [107], "red": True}),
    ],
    mg=[
        ("scan", 38, 48, {}),
        ("board", 64, 73, {"kind": "compare"}),
        ("board", 84, 97, {"kind": "workflow"}),
        ("cta", 98, None, {}),
    ],
    punch=[],
),
"2511": dict(
    turn=dict(glitch=38, reveal=40),
    captions=[
        (1, 3, "basic", {}), (4, 7, "basic", {}), (8, 10, "basic", {}),
        (12, 13, "basic", {}), (14, 17, "basic", {"emoji": "😐"}),
        (18, 20, "basic", {"yellow_all": True}),
        (21, 23, "basic", {"emoji": "✨"}),
        (24, 26, "basic", {"emoji": "🔊"}),
        (27, 30, "basic", {}), (31, 34, "basic", {}), (35, 37, "basic", {"emoji": "🤖"}),
        (38, 42, "below", {"split": 41, "em": [42], "red": True}),
        (44, 50, "below", {"split": 47, "em": [47]}),
        (51, 55, "behind", {"hero": 53}),
        (56, 58, "behind", {"hero": 56, "keep_hero": True}),
        (59, 62, "below", {"split": 62}),
        (63, 65, "below", {"split": 63, "em": [65], "red": True}),
        (66, 71, "below", {"split": 70, "em": [71], "red": True}),
        (72, 77, "below", {"split": 73, "em": [73]}),
        (86, 91, "over", {}),
        (92, 94, "below", {"split": 92, "em": [93], "red": True}),
        (95, 98, "below", {"split": 97, "em": [98]}),
        (99, 101, "top", {"hero": 101, "red": True}),
        (102, 106, "below", {"split": 105, "em": [105, 106], "red": True}),
    ],
    mg=[
        ("scan", 27, 37, {}),
        ("orbit", 45, 50, {"tail": 0.1, "words": ["captions", "motion", "sound", "grade", "vibe", "story"]}),
        ("rings", 53, 55, {}),
        ("wave", 56, 58, {}),
        ("board", 59, 65, {"kind": "claude"}),
        ("board", 68, 77, {"kind": "workflow"}),
        ("board", 86, 98, {"kind": "course"}),
        ("comment", 99, 101, {}),
        ("cta", 102, None, {}),
    ],
    punch=[],
),
"2512": dict(
    turn=dict(glitch=45, reveal=45),
    captions=[
        (0, 0, "basic", {}), (1, 3, "basic", {}), (4, 6, "basic", {}), (7, 9, "basic", {}),
        (11, 12, "basic", {}), (13, 16, "basic", {"emoji": "😐"}),
        (17, 20, "basic", {"yellow_all": True}),
        (21, 23, "basic", {"emoji": "🔊"}),
        (24, 26, "basic", {"emoji": "✨"}),
        (35, 37, "basic", {}), (38, 40, "basic", {}), (41, 44, "basic", {"emoji": "🤖"}),
        (45, 48, "below", {"split": 48, "em": [48], "red": True}),
        (50, 56, "behind", {"hero": 51}),
        (57, 64, "below", {"split": 58, "em": [58, 59], "rest_small": True}),
        (65, 69, "side", {"hero": 68, "red": True}),
        (71, 77, "below", {"split": 75, "em": [77], "red": True}),
        (78, 84, "below", {"split": 83, "em": [84]}),
        (85, 91, "below", {"split": 86, "em": [86], "rest_small": True, "red": True}),
        (92, 99, "over", {"em": [99]}),
        (100, 104, "behind", {"hero": 102}),
        (105, 107, "top", {"hero": 107, "red": True}),
        (108, 112, "below", {"split": 111, "em": [111, 112], "red": True}),
    ],
    mg=[
        ("scan", 35, 44, {}),
        ("board", 57, 64, {"kind": "motion"}),
        ("board", 71, 77, {"kind": "tools"}),
        ("board", 80, 91, {"kind": "workflow"}),
        ("comment", 105, 107, {}),
        ("cta", 108, None, {}),
    ],
    punch=[],
),
}

def disp(n, i, text):
    t = ROMAN.get(n, {}).get(i, text)
    t = t.replace("।", "").replace('"', "").strip()
    while t and t[-1] in ",.!-–—:;": t = t[:-1]
    return t


def load_meta(n):
    meta = {}
    for p in glob.glob(f"{WORK}/mk_{n}/meta_*.json"):
        meta.update({int(k): v for k, v in json.load(open(p)).items()})
    return meta


def build(n):
    edl = json.load(open(f"{ROOT}/edit/edl.json"))[n]
    spec = SPEC[n]
    W = {w["i"]: w for w in edl["words"]}
    segs = edl["segments"]
    speech_end = edl["duration"]
    dur = speech_end + END_CARD
    nfr = int(math.ceil(dur * FPS))
    total_src = len(os.listdir(f"{WORK}/fr2_{n}"))

    # ---- frame map (output frame -> 1-based source frame file) + segment index
    frames, segi = [], []
    for k in range(nfr):
        t = k / FPS
        if t < speech_end:
            j = max(i for i, s in enumerate(segs) if s["t"] <= t + 1e-6)
            src = segs[j]["in"] + (t - segs[j]["t"])
        else:  # end card: keep the last shot rolling naturally
            j = len(segs) - 1
            src = segs[j]["out"] + (t - speech_end)
        f = min(total_src - 1, int(round(src * FPS)))
        frames.append(f + 1); segi.append(j)

    # ---- head track, smoothed (needs mattes); end-card frames may lack mattes -> hold
    meta = load_meta(n)
    keys = sorted(meta)
    def nearest(f):
        if f in meta: return meta[f]
        import bisect
        i = bisect.bisect_left(keys, f)
        c = [keys[x] for x in (i - 1, i) if 0 <= x < len(keys)]
        return meta[min(c, key=lambda x: abs(x - f))]
    raw = [nearest(f - 1) for f in frames]
    head = []
    for c in range(3):
        v = [r[c] for r in raw]
        sm = []
        for i in range(len(v)):          # centered moving average (~0.4 s)
            a, b = max(0, i - 6), min(len(v), i + 7)
            sm.append(round(sum(v[a:b]) / (b - a), 4))
        head.append(sm)
    nk = {int(k): v for k, v in json.load(open(f"{WORK}/mk_{n}/neck.json")).items()}
    nkeys = sorted(nk)
    import bisect
    def nnear(f):
        if f in nk: return nk[f]
        i = bisect.bisect_left(nkeys, f); c = [nkeys[x] for x in (i - 1, i) if 0 <= x < len(nkeys)]
        return nk[min(c, key=lambda x: abs(x - f))]
    nraw = [nnear(f - 1) for f in frames]
    neck = []
    for c in range(2):
        v = [r[c] for r in nraw]; sm = []
        for i in range(len(v)):
            a, b = max(0, i - 8), min(len(v), i + 9); sm.append(round(sorted(v[a:b])[(b - a) // 2], 4))
        neck.append(sm)
    has_mask = [os.path.exists(f"{WORK}/mk_{n}/s{f:05d}.png") for f in frames]

    # ---- turn
    tg = W[spec["turn"]["glitch"]]["start"] - 0.05
    if "reveal_seg_word" in spec["turn"]:
        tr = W[spec["turn"]["reveal_seg_word"]]["start"] - 0.04
        # snap reveal to the segment boundary just before that word
        tr = max(s["t"] for s in segs if s["t"] <= tr + 0.1)
    else:
        tr = W[spec["turn"]["reveal"]]["start"] - 0.06
    tg = min(tg, tr - 0.3)

    # ---- camera: per segment zoom keyframes
    cams = []
    zs = [1.00, 1.10, 1.04, 1.15, 1.07, 1.12]
    for j, s in enumerate(segs):
        t0, t1 = s["t"], s["t"] + (s["out"] - s["in"])
        if t1 <= tr:
            z0 = z1 = 1.0                       # the "basic" edit: flat, locked-off
        else:
            z = zs[j % len(zs)]
            z0, z1 = z, z + 0.03
        cams.append([round(t0, 3), round(t1, 3), z0, z1])
    punches = [round(W[i]["start"], 3) for i in spec["punch"]]

    # ---- captions
    caps = []
    groups = spec["captions"]
    for gi, (a, b, layout, opts) in enumerate(groups):
        ws = [W[i] for i in range(a, b + 1) if i in W]
        t0 = ws[0]["start"] - 0.06
        nxt = groups[gi + 1] if gi + 1 < len(groups) else None
        t_next = W[nxt[0]]["start"] - 0.06 if nxt else 1e9
        t1 = min(t_next, ws[-1]["end"] + 0.55)
        if layout == "basic":
            t1 = min(t_next, ws[-1]["end"] + 0.25)
        if layout != "basic" and t0 < tr:      # first premium caption waits for the reveal look
            pass
        caps.append(dict(t0=round(t0, 3), t1=round(t1, 3), layout=layout,
                         words=[dict(i=w["i"], text=disp(n, w["i"], w["text"]), t=round(w["start"], 3),
                                     te=round(w["end"], 3), em=w["i"] in opts.get("em", [])) for w in ws],
                         opts={k: v for k, v in opts.items() if k not in ("em",)}))

    # ---- motion graphics
    mgs = []
    for typ, a, b, opts in spec["mg"]:
        t0 = W[a]["start"] - 0.12
        t1 = (W[b]["end"] + 0.35 + opts.get("tail", 0)) if b is not None else dur
        mgs.append(dict(type=typ, t0=round(t0, 3), t1=round(t1, 3), opts=opts,
                        words=[round(W[i]["start"], 3) for i in range(a, (b if b is not None else a) + 1) if i in W]))

    # ---- sfx cues
    sfx = []
    add = lambda name, t, g=1.0: sfx.append(dict(name=name, t=round(t, 3), g=g))
    for c in caps:
        if c["layout"] == "basic" and c["opts"].get("emoji"):
            add("pop", c["words"][-1]["t"] + 0.05, 0.55)
    add("glitch", tg, 0.8)
    add("riser", tr - 1.9, 0.55)
    add("impact", tr, 0.95); add("shimmer", tr + 0.02, 0.5); add("whoosh", tr - 0.25, 0.6)
    for c in caps:
        if c["layout"] in ("behind", "side", "top") and not c["opts"].get("keep_hero"):
            add("whoosh_soft", c["t0"], 0.55)
        if c["layout"] == "below" and c["t0"] > tr + 0.5:
            add("whoosh_soft", c["words"][0]["t"], 0.28)
    for m in mgs:
        if m["type"] == "scan": add("scan", m["t0"] + 0.1, 0.5)
        if m["type"] == "board":
            k = m["opts"]["kind"]; d = m["t1"] - m["t0"]
            add("whoosh_soft", m["t0"] - 0.05, 0.5)
            if k == "workflow":
                for j in range(5): add("tick", m["t0"] + 0.45 + j * 0.24, 0.5)
            elif k == "course":
                for j in range(5): add("tick", m["t0"] + 0.55 + j * 0.16, 0.4)
            elif k == "claude":
                add("type", m["t0"] + 0.35, 0.45)
                for j in range(4): add("tick", m["t0"] + 1.6 + j * 0.32, 0.45)
                add("ding", m["t0"] + 3.2, 0.4)
            elif k == "compare":
                add("pop", m["t0"] + 0.3, 0.4); add("pop", m["t0"] + 0.5, 0.4); add("strike", m["t0"] + d * 0.6, 0.5)
            elif k == "tools":
                add("pop", m["t0"] + 0.35, 0.4); add("pop", m["t0"] + 0.5, 0.4); add("tick", m["t0"] + d * 0.6, 0.5)
            elif k == "motion":
                add("whoosh_soft", m["t0"] + 1.0, 0.3); add("whoosh_soft", m["t0"] + 2.6, 0.3)
        if m["type"] == "orbit": add("shimmer", m["t0"], 0.35)
        if m["type"] == "rings": add("whoosh_soft", m["t0"], 0.4)
        if m["type"] == "chips":
            for k, _ in enumerate(m["opts"]["items"]): add("pop", m["t0"] + 0.1 + k * 0.25, 0.5)
        if m["type"] == "comment":
            add("pop", m["t0"] + 0.05, 0.5); add("type", m["t0"] + 0.3, 0.45); add("ding", m["t0"] + 1.0, 0.5)
        if m["type"] == "cta": add("pop", m["t0"] + 0.1, 0.6)
    add("whoosh", speech_end + 0.15, 0.6); add("impact", speech_end + 0.4, 0.6)
    add("tick", speech_end + 1.3, 0.5)

    # speech amplitude per output frame (drives the waveform MG)
    import wave as _wv, numpy as _np
    wf = _wv.open(f"{WORK}/dlg_{n}.wav"); sr = wf.getframerate(); ch = wf.getnchannels()
    au = _np.frombuffer(wf.readframes(wf.getnframes()), _np.int16).reshape(-1, ch)[:, 0] / 32768.
    hop = sr // FPS
    amp = [float(_np.sqrt(_np.mean(au[k*hop:(k+1)*hop]**2))) if k*hop < len(au) else 0. for k in range(nfr)]
    mx = max(amp) or 1; amp = [round(min(1, a / mx * 1.4), 3) for a in amp]
    tl = dict(id=n, amp=amp, fps=FPS, dur=round(dur, 3), nframes=nfr, speech_end=speech_end,
              frames=frames, segi=segi, head=head, neck=neck, has_mask=has_mask, turn=dict(tg=round(tg, 3), tr=round(tr, 3)),
              cams=cams, punches=punches, captions=caps, mg=mgs, sfx=sorted(sfx, key=lambda s: s["t"]),
              title_line2=spec.get("title_line2", "Can you tell?"),
              frame_dir=f"{WORK}/fr2_{n}", mask_dir=f"{WORK}/mk_{n}")
    os.makedirs(f"{ROOT}/build/{n}", exist_ok=True)
    json.dump(tl, open(f"{ROOT}/build/{n}/timeline.json", "w"), ensure_ascii=False)
    with open(f"{ROOT}/build/{n}/timeline.js", "w") as fh:
        fh.write("window.TL = " + json.dumps(tl, ensure_ascii=False) + ";")
    print(n, "dur %.2f frames %d turn %.2f/%.2f captions %d mg %d sfx %d" % (dur, nfr, tg, tr, len(caps), len(mgs), len(sfx)))


if __name__ == "__main__":
    import sys
    for n in (sys.argv[1:] or SPEC.keys()):
        build(n)

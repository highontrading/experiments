#!/usr/bin/env python3
"""Edit the 'hire a virtual assistant' raw into the Optimized style.

  python3 tools/build_va.py <raw.mp4> <words.json>
    -> build/va-ad/aroll.mp4  (pauses cut, alternating wide/tight framing)
    -> plans/va-ad.json       (captions + cards on the edited timeline)
then:  node engine/render.js plans/va-ad.json && python3 engine/compose.py va-ad build/va-ad/aroll.mp4

words.json = word timestamps from faster-whisper: [{"w","s","e"}, ...] (raw-video seconds).
"""
import json, os, re, subprocess, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
RAW, WORDS = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "build", "va-ad"); os.makedirs(OUT, exist_ok=True)
words = json.load(open(WORDS))

# ---------- 1. cut the pauses (keep 60 ms of air either side of speech) ----------
log = subprocess.run(["ffmpeg", "-i", RAW, "-af", "silencedetect=noise=-35dB:d=0.18", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", RAW], capture_output=True, text=True).stdout)
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)] + [dur]
PAD = 0.06
end_of_speech = words[-1]["e"] + 0.30
keep, cur = [], 0.0
for s, e in zip(starts, ends):
    if s >= end_of_speech: break
    if s + PAD < e - PAD and s > cur:
        keep.append((cur, s + PAD)); cur = e - PAD
keep.append((cur, min(dur, end_of_speech)))

def remap(t):
    """raw time -> edited time (times inside a removed pause snap to the next kept frame)"""
    acc = 0.0
    for a, b in keep:
        if t < a: return round(acc, 3)
        if t <= b: return round(acc + t - a, 3)
        acc += b - a
    return round(acc, 3)
total = round(sum(b - a for a, b in keep), 3)

# ---------- 2. A-roll: alternate two framings at every cut (fake A/B camera) ----------
FR = [  # (zoom, centre-y as a fraction of the raw frame)
    (1.10, 0.47),   # wide
    (1.32, 0.43),   # tight
]
parts, labels = [], []
for i, (a, b) in enumerate(keep):
    z, cy = FR[i % 2]
    cw, ch = f"iw/{z}", f"ih/{z}"
    parts.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,crop={cw}:{ch}:(iw-{cw})/2:ih*{cy}-{ch}/2,"
                 f"scale=1080:1920:flags=lanczos,setsar=1[v{i}]")
    parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,"
                 f"afade=t=out:st={max(0, b - a - 0.012):.3f}:d=0.012[a{i}]")
    labels.append(f"[v{i}][a{i}]")
parts.append("".join(labels) + f"concat=n={len(keep)}:v=1:a=1[v][a]")
aroll = os.path.join(OUT, "aroll.mp4")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-filter_complex", ";".join(parts), "-map", "[v]", "-map", "[a]",
                "-r", "30", "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-c:a", "aac", "-b:a", "256k", aroll], check=True)

# ---------- 3. the edit plan ----------
W = [dict(w, s2=remap(w["s"])) for w in words]
def at(word, n=1):
    """edited start time of the n-th occurrence of `word` (case/punctuation-insensitive)"""
    k = 0
    for w in W:
        if re.sub(r"[^\w$]", "", w["w"].lower()) == re.sub(r"[^\w$]", "", word.lower()):
            k += 1
            if k == n: return w["s2"]
    raise KeyError(word)

def cap(t0, t1, *lines, items=None):
    d = {"t0": t0, "t1": t1, "lines": [{"size": s, "align": a, "words": [{"text": x, "t": t} for x, t in ws]} for s, a, ws in lines]}
    if items: d["items"] = items
    return d
def tx(text, t, x=None, y=None, size="S", color="ink", align="left", follow=False, **kw):
    d = {"type": "text", "text": text, "t": t, "size": size, "color": color, "align": align, **kw}
    if x is not None: d["x"] = x
    if y is not None: d["y"] = y
    if follow: d["follow"] = True
    return d
def img(src, t, x, y, w, **kw): return {"type": "img", "src": src, "t": t, "x": x, "y": y, "w": w, **kw}
I = "assets/icons/va/"
P = "assets/stock/"

T = {k: at(k) for k in ["looking", "to", "hire", "virtual", "assistant", "we", "will", "you", "highly", "trained",
                        "industry", "starting", "at", "just", "$8", "an", "hour", "all", "in", "fees", "contracts",
                        "vas", "are", "bilingual", "work", "us", "hours", "and", "on", "the", "tools", "already",
                        "use", "handle", "everything", "payroll", "compliance", "even", "get", "ongoing", "coaching",
                        "click", "learn", "more", "button", "book", "a", "call", "interview", "candidates", "for", "free"]}
g = lambda w, n: at(w, n)

caps = [
    cap(0.0, g("a", 1), ("S", "left", [("Are", 0.0), ("you", at("you")), ("looking", T["looking"])]),
        ("L", "center", [("to", T["to"]), ("hire", T["hire"])])),
    cap(g("a", 1), g("we", 1), ("S", "left", [("a", g("a", 1)), ("virtual", T["virtual"])]),
        ("L", "center", [("assistant?", T["assistant"])])),
    cap(g("we", 1), g("a", 2), ("M", "center", [("We", g("we", 1)), ("will", T["will"]), ("hire", g("hire", 2)), ("you", g("you", 2))])),
    # card 1 runs a(2) .. starting
    cap(T["starting"], g("$8", 1) - 0.04, ("S", "left", [("starting", T["starting"]), ("at", T["at"])]),
        ("L", "center", [("just", T["just"])])),
    # card 2 ($8) runs $8 .. all
    cap(g("all", 1), g("no", 1), ("M", "center", [("all", g("all", 1)), ("in,", g("in", 2))])),
    cap(g("no", 1), g("no", 2), ("S", "center", [("no", g("no", 1))]), ("L", "center", [("fees,", T["fees"])])),
    cap(g("no", 2), g("all", 2), ("S", "center", [("no", g("no", 2))]), ("L", "center", [("contracts.", T["contracts"])])),
    cap(g("all", 2), T["work"], ("S", "left", [("All", g("all", 2)), ("VAs", T["vas"]), ("are", g("are", 2))]),
        ("L", "center", [("bilingual,", T["bilingual"])]),
        items=[img(I + "bubbles.svg", T["bilingual"] + 0.1, 0.5, 0.775, 0.30)]),
    cap(T["work"], g("are", 3), ("S", "left", [("work", T["work"]), ("in", g("in", 3))]),
        ("L", "center", [("US", T["us"]), ("hours", T["hours"])]),
        items=[img(I + "clock.svg", T["hours"] + 0.08, 0.5, 0.775, 0.18)]),
    # card 3 (tools) runs are(2) .. We(2)
    cap(g("we", 2), T["payroll"] - 0.03, ("S", "center", [("We", g("we", 2)), ("handle", T["handle"])]),
        ("L", "center", [("everything,", T["everything"])])),
    # card 4 (payroll / coaching) runs payroll .. click
    cap(T["click"], g("to", 2), ("S", "center", [("Click", T["click"]), ("the", g("the", 2))]),
        items=[{"type": "pill", "text": "Learn More", "t": T["learn"], "x": 0.5, "y": 0.725, "size": 74, "press": T["button"] + 0.05},
               img(I + "cursor.svg", T["more"] + 0.02, 0.60, 0.76, 0.085, press=T["button"] + 0.05, **{"from": {"dx": 260, "dy": 300}, "dur": 0.32})]),
    cap(g("to", 2), g("and", 3), ("S", "left", [("to", g("to", 2)), ("book", T["book"]), ("a", g("a", 3))]),
        ("L", "center", [("call", T["call"])])),
    cap(g("and", 3), T["for"], ("S", "left", [("and", g("and", 3)), ("interview", T["interview"])]),
        ("L", "center", [("candidates", T["candidates"])])),
    cap(T["for"], total, ("S", "center", [("for", T["for"])]), ("L", "center", [("free.", T["free"])])),
]

cards = [
    {"t0": g("a", 2), "t1": T["starting"], "enter": "cut", "groups": [
        {"t1": g("in", 1) - 0.02, "exit": "slide", "items": [
            img(P + "va.png", g("a", 2), 0.66, 0.735, 0.74),
            tx("a", g("a", 2), 0.10, 0.26), tx("highly", T["highly"], follow=True),
            tx("trained", T["trained"], 0.10, 0.335, size="L", color="red"),
            tx("virtual", g("virtual", 2), 0.10, 0.40), tx("assistant", g("assistant", 2), 0.10, 0.455, size="M")]},
        {"items": [
            tx("in", g("in", 1), 0.14, 0.40), tx("your", g("your", 1), follow=True),
            tx("industry,", T["industry"], 0.14, 0.475, size="L", color="red"),
            img(I + "briefcase.svg", T["industry"] + 0.00, 0.20, 0.585, 0.15),
            img(I + "house.svg", T["industry"] + 0.07, 0.40, 0.585, 0.15),
            img(I + "medical.svg", T["industry"] + 0.14, 0.60, 0.585, 0.15),
            img(I + "cart.svg", T["industry"] + 0.21, 0.80, 0.585, 0.15)]}]},
    {"t0": g("$8", 1) - 0.04, "t1": g("all", 1), "enter": "wipe", "groups": [
        {"items": [
            tx("$8", g("$8", 1), 0.5, 0.56, size=430, color="red", align="center"),
            tx("an", T["an"], 0.285, 0.665, size="M"), tx("hour,", T["hour"], follow=True)]}]},
    {"t0": g("are", 3), "t1": g("we", 2), "enter": "cut", "groups": [
        {"items": [
            tx("and", g("are", 3), 0.10, 0.25), tx("are", g("are", 3), follow=True),
            tx("trained", g("trained", 2), 0.10, 0.31, size="M"), tx("on", T["on"], follow=True),
            tx("the", g("the", 1), 0.10, 0.385, size="S"),
            tx("tools", T["tools"], 0.10, 0.465, size="L", color="red"),
            img(I + "laptop.svg", g("are", 3), 0.5, 0.64, 0.86),
            img(I + "t-mail.svg", T["tools"] + 0.00, 0.33, 0.565, 0.12),
            img(I + "t-cal.svg", T["tools"] + 0.06, 0.50, 0.565, 0.12),
            img(I + "t-chat.svg", T["tools"] + 0.12, 0.67, 0.565, 0.12),
            img(I + "t-sheet.svg", T["tools"] + 0.18, 0.33, 0.66, 0.12),
            img(I + "t-video.svg", T["tools"] + 0.24, 0.50, 0.66, 0.12),
            img(I + "t-folder.svg", T["tools"] + 0.30, 0.67, 0.66, 0.12),
            tx("you", g("you", 3), 0.15, 0.86, size="P"), tx("already", T["already"], follow=True),
            tx("use.", T["use"], follow=True)]}]},
    {"t0": T["payroll"] - 0.03, "t1": T["click"], "enter": "wipe", "groups": [
        {"t1": g("and", 2) - 0.02, "exit": "slide", "items": [
            img(I + "doc.svg", T["payroll"], 0.22, 0.43, 0.15),
            tx("payroll", T["payroll"], 0.33, 0.455, size="M"),
            img(I + "shield.svg", T["compliance"], 0.22, 0.555, 0.16),
            tx("compliance", T["compliance"], 0.33, 0.58, size="M", color="red")]},
        {"items": [
            tx("and", g("and", 2), 0.10, 0.215), tx("you", g("you", 4), follow=True), tx("even", T["even"], follow=True), tx("get", T["get"], follow=True),
            tx("ongoing", T["ongoing"], 0.10, 0.285, size="M"),
            tx("coaching.", T["coaching"], 0.10, 0.37, size="L", color="red"),
            img(P + "coaching.jpg", g("and", 2), 0.5, 0.635, 0.86, tile=True, radius=48)]}]},
]

plan = {"name": "va-ad", "w": 1080, "h": 1920, "fps": 30, "dur": total, "punch": 1.0,
        "captions": caps, "cards": cards, "keep": keep}
json.dump(plan, open(os.path.join(ROOT, "plans", "va-ad.json"), "w"), indent=1)
print(f"{len(keep)} segments kept, {dur:.2f}s -> {total:.2f}s; plan + A-roll written")

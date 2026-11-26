#!/usr/bin/env python3
"""Build the sound-design track for a plan: build/<plan>/sfx.wav

Premium / ASMR rules: soft, close, never louder than the voice, one sound per visual event.
  * first frame                 -> warm low "swell"
  * hard cut to a white card    -> "soft-tap"
  * split-wipe to a card        -> "soft-swipe"
  * card content whips out      -> "soft-whoosh"
  * icon/photo arriving         -> "soft-pop" (once per card group, and for A-roll caption icons)
  * button press (pill.press)   -> "soft-click"
Captions themselves stay silent (as in the reference). Add hits with
"sfx": [{"name": "shimmer", "t": 7.3, "vol": 0.18}], or turn the rules off with "auto_sfx": false.
Sounds live in assets/sfx/premium/ (generated for this project, softened and levelled to -3 dBFS peak).
usage: engine/sfx.py plans/<plan>.json
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get("VIBE_SFX", os.path.join(HERE, "..", "assets", "sfx", "premium"))
VOL = {"swell": 0.30, "soft-tap": 0.30, "soft-swipe": 0.22, "soft-whoosh": 0.20,
       "soft-pop": 0.16, "soft-click": 0.28, "shimmer": 0.18}

plan_path = sys.argv[1]
plan = json.load(open(plan_path))
name = os.path.splitext(os.path.basename(plan_path))[0]
out = os.path.join(HERE, "..", "build", name, "sfx.wav")

hits = []
def hit(n, t, v=None): hits.append((n, max(0.0, t), VOL.get(n, 0.2) if v is None else v))

if plan.get("auto_sfx", True):
    hit("swell", 0.0)
    for c in plan.get("cards", []):
        if c.get("enter") == "wipe": hit("soft-swipe", c["t0"] - 0.05)
        elif c["t0"] > 0.05: hit("soft-tap", c["t0"])
        for g in c["groups"]:
            imgs = sorted(it["t"] for it in g["items"] if it.get("type") == "img" and it["t"] > c["t0"] + 0.05)
            if imgs: hit("soft-pop", imgs[0])
            for it in g["items"]:
                if it.get("type") == "pill" and it.get("press") is not None: hit("soft-click", it["press"])
            if g.get("exit") == "slide" and g.get("t1") is not None: hit("soft-whoosh", g["t1"] - 0.04)
    for c in plan.get("captions", []):
        for it in c.get("items", []):
            if it.get("type") == "img" and not it.get("press"): hit("soft-pop", it["t"])
            if it.get("type") == "pill" and it.get("press") is not None: hit("soft-click", it["press"])
for h in plan.get("sfx", []): hit(h["name"], h["t"], h.get("vol"))

cmd = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", str(plan["dur"]), "-i", "anullsrc=r=48000:cl=stereo"]
for n, _, _ in hits:
    cmd += ["-i", os.path.join(LIB, n + ".wav")]
parts, labels = [], ["[0]"]
for i, (n, t, v) in enumerate(hits, 1):
    ms = int(t * 1000)
    parts.append(f"[{i}]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]")
    labels.append(f"[s{i}]")
parts.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,atrim=0:{plan['dur']}[a]")
cmd += ["-filter_complex", ";".join(parts), "-map", "[a]", "-c:a", "pcm_s16le", out]
os.makedirs(os.path.dirname(out), exist_ok=True)
subprocess.run(cmd, check=True)
print(f"{len(hits)} sound hits -> {os.path.relpath(out)}: " + ", ".join(f"{n}@{t:.2f}" for n, t, _ in hits))

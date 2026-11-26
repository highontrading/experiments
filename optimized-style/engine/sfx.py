#!/usr/bin/env python3
"""Build the sound-design track for a plan: build/<plan>/sfx.wav

Sound rules taken from the reference (quiet, felt more than heard):
  * opening frame          -> low sub "impact" under the first word
  * cut to a white card    -> soft "tap"
  * split-wipe to a card   -> "swish"
  * card text whips out    -> "whoosh-fast"
Add or override with "sfx": [{"name": "pop", "t": 4.2, "vol": 0.3}] in the plan,
and switch the automatic rules off with "auto_sfx": false.
usage: engine/sfx.py plans/<plan>.json
"""
import json, os, subprocess, sys

LIB = os.environ.get("VIBE_SFX", os.path.join(os.path.dirname(__file__), "..", "assets", "sfx"))
plan_path = sys.argv[1]
plan = json.load(open(plan_path))
name = os.path.splitext(os.path.basename(plan_path))[0]
out = os.path.join(os.path.dirname(__file__), "..", "build", name, "sfx.wav")

hits = []
if plan.get("auto_sfx", True):
    hits.append(("impact", 0.0, 0.35))
    for c in plan.get("cards", []):
        hits.append(("swish", c["t0"] - 0.03, 0.30) if c.get("enter") == "wipe" else ("tap", c["t0"], 0.30))
        for g in c["groups"]:
            if g.get("exit") == "slide" and g.get("t1") is not None:
                hits.append(("whoosh-fast", g["t1"] - 0.02, 0.32))
hits += [(h["name"], h["t"], h.get("vol", 0.3)) for h in plan.get("sfx", [])]

cmd = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-t", str(plan["dur"]), "-i", "anullsrc=r=48000:cl=stereo"]
for n, _, _ in hits:
    cmd += ["-i", os.path.join(LIB, n + ".wav")]
parts, labels = [], ["[0]"]
for i, (n, t, v) in enumerate(hits, 1):
    ms = max(0, int(t * 1000))
    parts.append(f"[{i}]aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]")
    labels.append(f"[s{i}]")
parts.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0,atrim=0:{plan['dur']}[a]")
cmd += ["-filter_complex", ";".join(parts), "-map", "[a]", out]
os.makedirs(os.path.dirname(out), exist_ok=True)
subprocess.run(cmd, check=True)
print(f"{len(hits)} sound hits -> {os.path.relpath(out)}")

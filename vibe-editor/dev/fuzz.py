#!/usr/bin/env python3
"""Robustness fuzzer: random / malformed edit plans must never crash planning, and renders must always produce a file.

Usage: python3 dev/fuzz.py <workspace> <job> [n_plans] [n_renders]
"""
import json
import os
import random
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.join(HERE, "..", "plugin", "vibe-editor", "skills", "edit", "scripts")
sys.path.insert(0, SCRIPTS)
from vibe_engine import render, core  # noqa: E402

WS, JOB = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 40
NR = int(sys.argv[4]) if len(sys.argv) > 4 else 2
rng = random.Random(int(os.environ.get("FUZZ_SEED", 42)))
TYPES = sorted(render.KNOWN - {"preset"}) + sorted(core.lib("presets.json"))
WEIRD = [None, "", "???", -5, 0, 1e9, "nonsense phrase xyz", [], {}, True, "0:03", "-2", 3.3, "here's the thing"]
TEXTS = ["Hi", "This is a deliberately very long piece of text that should wrap and shrink without ever going off screen at all",
         "*accent* words | new line", "₹1,50,000 earned 🔥", "परीक्षा से पहले", "", "A"]


def rand_event():
    t = rng.choice(TYPES)
    e = {"type": t}
    if rng.random() < 0.9:
        e["at"] = rng.choice(WEIRD + [rng.uniform(0, 25) for _ in range(6)])
    if rng.random() < 0.7:
        e["dur"] = rng.choice([rng.uniform(0.1, 4), -1, 0, "x", 100])
    for k in ("text", "sub", "label", "title", "name", "url", "number", "word"):
        if rng.random() < 0.35:
            e[k] = rng.choice(TEXTS)
    for k in ("items", "values", "labels", "messages", "suggestions", "times"):
        if rng.random() < 0.25:
            e[k] = rng.choice([[], ["one", "two", "three"], list(range(12)), "notalist", [{"from": "me", "text": "yo"}], [None, 5]])
    for k in ("position", "x", "y", "size", "style", "font", "color", "fill", "theme", "anim", "behind", "amount", "count",
              "target", "from", "to", "prefix", "suffix", "file", "bg", "freeze", "shape"):
        if rng.random() < 0.15:
            e[k] = rng.choice(WEIRD + ["#FF00FF", "dark", "light", "pop", "glitch", "xxl", 0.5, [0.2, 0.2, 0.5, 0.4], "missing.png"])
    return e


def main():
    core.set_ws(WS)
    jd = core.job_dir(WS, JOB)
    crashes = 0
    t0 = time.time()
    plans = []
    for i in range(N):
        edit = {"format": rng.choice(["9:16", "16:9", "1:1", "4:5"]),
                "look": rng.choice(["punchy", "cinematic", "nope", None, "vhs"]),
                "captions": {"style": rng.choice(list(core.lib("captions.json")) + ["missing-style"]),
                             "behind": rng.random() < 0.2, "emphasis": ["the", "sleep"]},
                "events": [rand_event() for _ in range(rng.randint(3, 25))]}
        core.WARNINGS.clear()
        try:
            render.build_plan(WS, jd, edit, edit["format"], True)
            plans.append(edit)
        except Exception as ex:
            crashes += 1
            print(f"PLAN CRASH #{i}: {type(ex).__name__}: {ex}")
            json.dump(edit, open(os.path.join(HERE, f"fuzz_crash_{i}.json"), "w"), indent=1, default=str)
    print(f"{N} plans built in {time.time() - t0:.0f}s, {crashes} crashes")
    fails = 0
    for i, edit in enumerate(plans[:NR]):
        p = os.path.join(jd, f"fuzz_{i}.json")
        json.dump(edit, open(p, "w"), default=str)
        r = subprocess.run([sys.executable, os.path.join(SCRIPTS, "vibe.py"), "render", JOB, "--ws", WS, "--preview", "--edit", p],
                           capture_output=True, text=True)
        ok = r.returncode == 0 and "✅ Done" in r.stdout
        fails += 0 if ok else 1
        print(f"render {i}: {'OK' if ok else 'FAILED'} ({len(edit['events'])} events, {edit['format']})"
              + ("" if ok else "\n" + (r.stdout + r.stderr)[-1500:]))
        if "safe mode" in r.stdout:
            print("   (needed safe mode)")
    print(f"renders: {NR - fails}/{NR} OK")


if __name__ == "__main__":
    main()

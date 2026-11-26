#!/usr/bin/env python3
"""Prepare base plate + person matte for the VA ad.
- cuts the raw take with the same pause cuts as the Vibe Editor job (talk1)
- grades + upscales to 1080x1920, writes build/base/%04d.jpg and build/base.mp4 (+ voice wav)
- runs MODNet at 512px for a person matte, writes build/matte/%04d.png (white + alpha)
- writes build/words.json (output-time words) and build/segments.json
"""
import json, os, subprocess, sys, time
import numpy as np
from PIL import Image
ENG = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/scripts"
sys.path.insert(0, ENG)
from vibe_engine import cli
WS = "/home/user/experiments/vibe-editor-workspace"
JD = f"{WS}/.vibe/jobs/talk1"
RAW = f"{WS}/inbox/raw2.mp4"
B = "build"
os.makedirs(f"{B}/base", exist_ok=True); os.makedirs(f"{B}/matte", exist_ok=True)
job = json.load(open(f"{JD}/job.json")); words = json.load(open(f"{JD}/words.json")); edit = json.load(open(f"{JD}/edit.json"))
segs = cli.build_segments(words, job["probe"]["duration"], edit.get("cuts"))
tm = cli.TimeMap(segs)
json.dump([{"text": w["text"], "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in tm.words(words)], open(f"{B}/words.json", "w"), indent=0)
json.dump([[round(a, 3), round(b, 3)] for a, b in segs], open(f"{B}/segments.json", "w"))
# out-time cut points
acc, cuts = 0, []
for a, b in segs: acc += b - a; cuts.append(round(acc, 3))
print("cuts at", cuts[:-1], "dur", round(acc, 3))
GRADE = ("eq=contrast=0.96:saturation=0.86:gamma=0.98,"
         "colorbalance=rs=-0.03:gs=0.0:bs=0.04:rm=-0.01:bm=0.015:rh=0.01:bh=-0.005,"
         "curves=all='0/0.03 0.5/0.5 1/0.97'")
n = len(segs)
fc = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={b-a-0.012:.3f}:d=0.012[a{i}];" for i, (a, b) in enumerate(segs))
fc += "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vc][ac];[vc]fps=30,scale=1080:1920:flags=lanczos,{GRADE},format=yuv420p[vo]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-filter_complex", fc, "-map", "[vo]", "-map", "[ac]",
                "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-c:a", "pcm_s16le", f"{B}/base.mov"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{B}/base.mov", "-vn", "-ac", "1", "-ar", "48000", f"{B}/voice_raw.wav"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{B}/base.mov", "-q:v", "2", f"{B}/base/%04d.jpg"], check=True)
# matte
import onnxruntime as ort
sess = ort.InferenceSession(os.path.expanduser("~/.cache/vibe-editor/modnet.onnx"), providers=["CPUExecutionProvider"])
iname = sess.get_inputs()[0].name
MW, MH = 512, 896
files = sorted(os.listdir(f"{B}/base")); prev = None; t0 = time.time()
for k, f in enumerate(files):
    im = Image.open(f"{B}/base/{f}").convert("RGB").resize((MW, MH), Image.BILINEAR)
    x = ((np.asarray(im, np.float32) / 255 - 0.5) / 0.5).transpose(2, 0, 1)[None]
    m = np.clip(sess.run(None, {iname: x})[0][0, 0], 0, 1)
    if prev is not None: m = 0.7 * m + 0.3 * prev
    prev = m
    mm = np.clip((m - 0.12) / 0.7, 0, 1)
    a = (mm * 255).astype(np.uint8)
    rgba = np.dstack([np.full_like(a, 255)] * 3 + [a])
    Image.fromarray(rgba, "RGBA").save(f"{B}/matte/{f[:-4]}.png", optimize=False, compress_level=3)
    if k % 200 == 0: print("matte", k, len(files), f"{time.time()-t0:.0f}s")
print("frames", len(files))

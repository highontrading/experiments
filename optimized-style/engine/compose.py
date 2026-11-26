#!/usr/bin/env python3
"""Finish a reel: motion-graphics layer + sound design over the punched-in, graded A-roll.

usage: engine/compose.py <plan-name> <a-roll.mp4 | placeholder> [out.mp4]

The A-roll must already be cut to the edited timeline (the plan's timings).
Grade: +contrast, a touch warmer and brighter, crisper. Punch-in 1.18x (the reference frames
the optimized version ~18% tighter than the raw). Optional plan keys:
  "music": "path/to/bed.mp3", "music_vol": 0.07, "punch": 1.18
"""
import json, os, subprocess, sys

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
os.chdir(root)
name, src = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else f"out/{name}.mp4"
plan = json.load(open(f"plans/{name}.json"))
dur, fps = plan["dur"], plan.get("fps", 30)
subprocess.run([sys.executable, "engine/sfx.py", f"plans/{name}.json"], check=True)

GRADE = "eq=contrast=1.08:brightness=0.015:saturation=1.06,colorbalance=rs=0.025:bs=-0.025:rm=0.02:bm=-0.02,unsharp=5:5:0.45"
k = plan.get("punch", 1.18)
PUNCH = f"scale={round(1080*k)}:{round(1920*k)}:force_original_aspect_ratio=increase,crop=1080:1920"

inputs, filt = [], []
def add(*a):
    inputs.extend(a); return sum(1 for x in inputs if x == "-i") - 1

if src == "placeholder":
    v = add("-f", "lavfi", "-i", f"gradients=s=1080x1920:c0=0x3a4038:c1=0x15180f:x0=540:y0=600:x1=540:y1=1900:d={dur}:r={fps}")
    voice = add("-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo")
    filt.append(f"[{v}:v]format=yuv420p[a]")
else:
    v = voice = add("-i", src)
    filt.append(f"[{v}:v]fps={fps},{PUNCH},{GRADE}[a]")
fx = add("-i", f"build/{name}/sfx.wav")
ov = add("-framerate", str(fps), "-i", f"build/{name}/f%05d.png")
filt.append(f"[a][{ov}:v]overlay=format=auto,format=yuv420p[v]")
filt.append(f"[{voice}:a]aresample=48000[voice]")
mix = ["[voice]", f"[{fx}:a]"]
if plan.get("music"):
    m = add("-stream_loop", "-1", "-i", plan["music"])
    filt.append(f"[{m}:a]aresample=48000,volume={plan.get('music_vol', 0.07)},afade=t=out:st={max(0, dur-0.6)}:d=0.6[mus]")
    mix.append("[mus]")
filt.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]")  # social-media loudness
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt),
                "-map", "[v]", "-map", "[aout]", "-t", str(dur), "-c:v", "libx264", "-crf", "17",
                "-preset", "medium", "-c:a", "aac", "-b:a", "192k", out], check=True)
print("->", out)

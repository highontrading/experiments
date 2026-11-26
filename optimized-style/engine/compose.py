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
    filt.append(f"[{v}:v]format=yuv420p[a]")
else:
    v = add("-i", src)
    filt.append(f"[{v}:v]fps={fps},{PUNCH},{GRADE}[a]")
ov = add("-framerate", str(fps), "-i", f"build/{name}/f%05d.png")
filt.append(f"[a][{ov}:v]overlay=format=auto,format=yuv420p[v]")

# --- audio: mix voice + SFX (+ music) to a WAV first, then bring it to -14 LUFS with a plain gain
# and a limiter. (Doing loudnorm inside the video graph produced a short, garbled track.)
mixwav, finalwav = f"build/{name}/mix.wav", f"build/{name}/final.wav"
ain = ["-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo"] if src == "placeholder" else ["-i", src]
ain += ["-i", f"build/{name}/sfx.wav"]
af = ["[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[voice]",
      "[1:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[fx]"]
mix = ["[voice]", "[fx]"]
if plan.get("music"):
    ain += ["-stream_loop", "-1", "-i", plan["music"]]
    af.append(f"[2:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={plan.get('music_vol', 0.07)},"
              f"afade=t=out:st={max(0, dur-0.6)}:d=0.6[mus]")
    mix.append("[mus]")
af.append("".join(mix) + f"amix=inputs={len(mix)}:duration=first:normalize=0,atrim=0:{dur}[aout]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *ain, "-filter_complex", ";".join(af), "-map", "[aout]",
                "-ar", "48000", "-c:a", "pcm_s16le", mixwav], check=True)
meas = subprocess.run(["ffmpeg", "-i", mixwav, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
import re as _re
lufs = float(_re.findall(r"I:\s+(-?[\d.]+) LUFS", meas)[-1])
gain = -14.0 - lufs
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mixwav, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:level=false",
                "-ar", "48000", "-c:a", "pcm_s16le", finalwav], check=True)
adur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", finalwav],
                            capture_output=True, text=True).stdout)
assert abs(adur - dur) < 0.1, f"audio length {adur:.2f}s != video {dur:.2f}s"
print(f"audio: {lufs:.1f} LUFS -> -14 LUFS ({gain:+.1f} dB), {adur:.2f}s")
au = add("-i", finalwav)
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt),
                "-map", "[v]", "-map", f"{au}:a", "-t", str(dur), "-c:v", "libx264", "-crf", "17",
                "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out], check=True)
print("->", out)

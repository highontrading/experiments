#!/usr/bin/env python3
"""Remove dead air (pauses) from a talking video.

Usage: python3 cut_silence.py in.mp4 out.mp4 [--noise -35] [--min 0.6] [--pad 0.15]
  --noise  silence threshold in dB (raise to -30 in noisy rooms)
  --min    only cut pauses longer than this (seconds)
  --pad    keep this much of each pause so cuts don't feel clipped
Prints the kept segments, then renders. Needs ffmpeg on PATH.
"""
import argparse, re, subprocess

def duration(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", path], capture_output=True, text=True).stdout)

def silences(path, noise, mn):
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af",
                          f"silencedetect=noise={noise}dB:d={mn}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    return list(zip(starts, ends + [None] * (len(starts) - len(ends))))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inp"); ap.add_argument("out")
    ap.add_argument("--noise", type=float, default=-35)
    ap.add_argument("--min", type=float, default=0.6)
    ap.add_argument("--pad", type=float, default=0.15)
    a = ap.parse_args()
    total = duration(a.inp)
    keep, cur = [], 0.0
    for s, e in silences(a.inp, a.noise, a.min):
        e = total if e is None else e
        if s + a.pad > cur:
            keep.append((cur, s + a.pad))
        cur = max(cur, e - a.pad)
    if cur < total:
        keep.append((cur, total))
    keep = [(round(s, 3), round(e, 3)) for s, e in keep if e - s > 0.05]
    print("Keeping:", ", ".join(f"{s:.2f}-{e:.2f}" for s, e in keep))
    sel = "+".join(f"between(t,{s},{e})" for s, e in keep)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a.inp,
                    "-vf", f"select='{sel}',setpts=N/FRAME_RATE/TB",
                    "-af", f"aselect='{sel}',asetpts=N/SR/TB",
                    "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", a.out], check=True)
    print(f"Done: {a.out}  ({total:.1f}s -> {duration(a.out):.1f}s)")

if __name__ == "__main__":
    main()

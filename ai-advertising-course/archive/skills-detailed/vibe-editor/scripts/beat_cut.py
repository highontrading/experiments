#!/usr/bin/env python3
"""Cut a set of clips to the beat of a music track, in one go.

Usage:
  python3 beat_cut.py --music track.mp3 --length 15 --ratio 9:16 --every 2 \
      --out edit.mp4 clip1.mp4 clip2.mp4 clip3.mp4 ...
Clips are used in the order given (they repeat if you run out). Each clip fills one beat
interval (or N beats with --every N). --skip trims the first seconds of every clip (AI video
often starts with a still frame). --bpm skips detection. Output is H.264/AAC with +faststart.
Needs ffmpeg on PATH; beats.py next to this file (numpy, librosa optional).
"""
import argparse, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import beats as B

SIZES = {"9:16": (1080, 1920), "4:5": (1080, 1350), "1:1": (1080, 1080), "16:9": (1920, 1080)}

def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", p], capture_output=True, text=True).stdout)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clips", nargs="+")
    ap.add_argument("--music", required=True)
    ap.add_argument("--out", default="beat_edit.mp4")
    ap.add_argument("--length", type=float, default=15)
    ap.add_argument("--ratio", default="9:16", choices=SIZES)
    ap.add_argument("--every", type=int, default=1)
    ap.add_argument("--skip", type=float, default=0.3)
    ap.add_argument("--bpm", type=float)
    ap.add_argument("--fit", default="crop", choices=["crop", "blur"], help="crop to fill, or blurred background")
    a = ap.parse_args()
    if a.bpm:
        times = B.grid(a.bpm, a.length + 5)
    else:
        try:
            _, times = B.detect_librosa(a.music)
        except ImportError:
            _, times = B.detect_numpy(a.music)
    times = [t for t in times[::a.every] if t <= a.length] or [0.0]
    if times[0] > 0.05:
        times = [0.0] + times
    if times[-1] < a.length:
        times.append(a.length)
    W, H = SIZES[a.ratio]
    segs, inputs, parts = [], [], []
    durs = [dur(c) for c in a.clips]
    cursor = [a.skip] * len(a.clips)          # when a clip is reused, continue where it left off
    for i in range(len(times) - 1):
        k = i % len(a.clips)
        length = times[i+1] - times[i]
        if cursor[k] + length > durs[k]:
            cursor[k] = a.skip
        start = min(cursor[k], max(0, durs[k] - length))
        cursor[k] = start + length
        segs.append((a.clips[k], start, length))
    filt = []
    for i, (clip, start, length) in enumerate(segs):
        inputs += ["-ss", f"{start:.3f}", "-t", f"{length:.3f}", "-i", clip]
        if a.fit == "crop":
            filt.append(f"[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                        f"fps=30,setsar=1,format=yuv420p,trim=duration={length:.3f},setpts=PTS-STARTPTS[v{i}]")
        else:
            filt.append(f"[{i}:v]split[b{i}][f{i}];[b{i}]scale={W}:{H}:force_original_aspect_ratio=increase,"
                        f"crop={W}:{H},boxblur=40:2[bb{i}];[f{i}]scale={W}:{H}:force_original_aspect_ratio=decrease[ff{i}];"
                        f"[bb{i}][ff{i}]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1,format=yuv420p,"
                        f"trim=duration={length:.3f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[v{i}]")
    n = len(segs)
    filt.append("".join(parts) + f"concat=n={n}:v=1:a=0[v]")
    filt.append(f"[{n}:a]atrim=0:{a.length},afade=t=out:st={max(0, a.length-0.8):.2f}:d=0.8,"
                f"loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-i", a.music,
           "-filter_complex", ";".join(filt), "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", "30",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{a.length}", a.out]
    print("EDL:")
    t = 0.0
    for i, (clip, start, length) in enumerate(segs, 1):
        print(f"  {i:02d}  {t:6.2f}-{t+length:6.2f}s  {os.path.basename(clip)}  (from {start:.2f}s)")
        t += length
    subprocess.run(cmd, check=True)
    print(f"Done: {a.out} ({dur(a.out):.2f}s, {W}x{H})")

if __name__ == "__main__":
    main()

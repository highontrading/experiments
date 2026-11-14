#!/usr/bin/env python3
"""Find beat times in a music track, to cut a video on the beat.

Usage:
  python3 beats.py music.mp3                 # detect beats (librosa if installed, else numpy)
  python3 beats.py music.mp3 --every 2       # keep every 2nd beat
  python3 beats.py --bpm 120 --length 30     # no detection: beat grid from a known BPM
Prints the BPM and a list of beat times in seconds, plus beats.json.
Needs: ffmpeg on PATH; numpy. librosa is optional (more accurate).
"""
import argparse, json, subprocess, sys

def grid(bpm, length, offset=0.0):
    step = 60.0 / bpm
    t, out = offset, []
    while t < length:
        out.append(round(t, 3)); t += step
    return out

def decode(path, sr=22050):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32), sr

def detect_numpy(path):
    import numpy as np
    y, sr = decode(path)
    hop, win = 512, 1024
    n = max(1, (len(y) - win) // hop)
    frames = np.lib.stride_tricks.as_strided(y, shape=(n, win), strides=(y.strides[0]*hop, y.strides[0]))
    spec = np.abs(np.fft.rfft(frames * np.hanning(win), axis=1))
    flux = np.maximum(0, np.diff(np.log1p(spec), axis=0)).sum(axis=1)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = sr / hop
    # tempo from autocorrelation of the onset curve (60–180 BPM)
    ac = np.correlate(flux, flux, mode="full")[len(flux)-1:]
    lo, hi = int(fps*60/180), int(fps*60/60)
    i = lo + int(np.argmax(ac[lo:hi])) if hi > lo else int(fps / 2)
    # parabolic interpolation: sub-frame lag, so the BPM is not rounded to whole frames
    a, b, c = ac[i-1], ac[i], ac[i+1] if i + 1 < len(ac) else ac[i]
    lag = i + (0.5 * (a - c) / (a - 2*b + c) if (a - 2*b + c) != 0 else 0.0)
    bpm = 60.0 * fps / lag
    # phase: the offset whose beat grid hits the most onset energy
    def score(o):
        idx = (o + np.arange(0, (len(flux) - o) / lag) * lag).round().astype(int)
        return flux[idx[idx < len(flux)]].sum()
    best = max(range(int(lag)), key=score)
    times = [round((best + k*lag) / fps, 3) for k in range(int((len(flux) - best) / lag) + 1)]
    return bpm, times

def detect_librosa(path):
    import librosa
    y, sr = librosa.load(path, sr=22050, mono=True)
    tempo, frames = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(getattr(tempo, "item", lambda: tempo)()) if hasattr(tempo, "item") else float(tempo)
    return tempo, [round(float(t), 3) for t in librosa.frames_to_time(frames, sr=sr)]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", nargs="?")
    ap.add_argument("--bpm", type=float, help="skip detection, use this BPM")
    ap.add_argument("--length", type=float, default=60, help="seconds, for --bpm mode")
    ap.add_argument("--offset", type=float, default=0.0, help="first beat time, for --bpm mode")
    ap.add_argument("--every", type=int, default=1, help="keep every Nth beat")
    a = ap.parse_args()
    if a.bpm:
        bpm, times, method = a.bpm, grid(a.bpm, a.length, a.offset), "grid"
    elif a.audio:
        try:
            bpm, times = detect_librosa(a.audio); method = "librosa"
        except ImportError:
            bpm, times = detect_numpy(a.audio); method = "numpy"
    else:
        sys.exit("give an audio file or --bpm")
    times = times[::a.every]
    json.dump({"bpm": round(bpm, 1), "method": method, "beats": times}, open("beats.json", "w"), indent=1)
    print(f"BPM ~{bpm:.1f} ({method}), {len(times)} cut points")
    print(" ".join(f"{t:.2f}" for t in times))

if __name__ == "__main__":
    main()

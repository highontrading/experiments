"""Pick the best 4-8 s window of a clip and encode it (H.264, yuv420p, no audio, long side <= 1920).

Usage: python3 -I trim.py SRC OUT [LEN=6] [START=auto]
Prints JSON: {start, len, width, height}.
Auto window: sample 5 fps, score = sharpness (Laplacian variance, normalised) + small motion bonus,
reject windows that contain a hard cut, skip first/last 0.4 s.
"""
import json
import subprocess
import sys

import cv2
import numpy as np


def analyse(src):
    cap = cv2.VideoCapture(src)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    dur = n / fps
    step = max(1, int(round(fps / 5)))
    ts, sharp, motion, cut = [], [], [], []
    prev = None
    i = 0
    while True:
        ok = cap.grab()
        if not ok:
            break
        if i % step == 0:
            ok, fr = cap.retrieve()
            if not ok:
                break
            g = cv2.cvtColor(cv2.resize(fr, (320, int(320 * fr.shape[0] / fr.shape[1]))), cv2.COLOR_BGR2GRAY)
            ts.append(i / fps)
            sharp.append(cv2.Laplacian(g, cv2.CV_64F).var())
            if prev is None:
                motion.append(0.0)
                cut.append(False)
            else:
                d = np.mean(np.abs(g.astype(np.float32) - prev.astype(np.float32)))
                motion.append(d)
                h1 = cv2.calcHist([g], [0], None, [32], [0, 256])
                h2 = cv2.calcHist([prev], [0], None, [32], [0, 256])
                cut.append(cv2.compareHist(h1, h2, cv2.HISTCMP_CORREL) < 0.6 and d > 25)
            prev = g
        i += 1
    return dur, np.array(ts), np.array(sharp), np.array(motion), np.array(cut)


def choose(src, L):
    dur, ts, sharp, motion, cut = analyse(src)
    L = min(L, max(1.0, dur - 0.8))
    if len(ts) < 3:
        return 0.0, L
    s = sharp / (np.percentile(sharp, 90) + 1e-6)
    m = np.clip(motion / 12.0, 0, 1)
    best, best_t = -1e9, 0.4
    t = 0.4
    while t + L <= dur - 0.4 + 1e-6:
        sel = (ts >= t) & (ts <= t + L)
        if sel.sum() >= 2:
            sc = s[sel].mean() + 0.25 * m[sel].mean() - 0.15 * s[sel].std()
            if cut[sel][1:].any():
                sc -= 5
            if sc > best:
                best, best_t = sc, t
        t += 0.2
    return round(best_t, 2), round(L, 2)


def main():
    src, out = sys.argv[1], sys.argv[2]
    L = float(sys.argv[3]) if len(sys.argv) > 3 else 6.0
    if len(sys.argv) > 4 and sys.argv[4] != "auto":
        start = float(sys.argv[4])
    else:
        start, L = choose(src, L)
    vf = "scale='if(gte(iw,ih),min(1920,iw),-2)':'if(gte(iw,ih),-2,min(1920,ih))',setsar=1,format=yuv420p"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(start), "-i", src, "-t", str(L), "-an",
                    "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], check=True)
    p = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height:format=duration", "-of", "json", out], capture_output=True, text=True)
    j = json.loads(p.stdout)
    print(json.dumps({"start": start, "len": L, "width": j["streams"][0]["width"],
                      "height": j["streams"][0]["height"], "duration": round(float(j["format"]["duration"]), 2)}))


if __name__ == "__main__":
    main()

"""Frame-by-frame + audio analysis of a video.
usage: python3 -I analyze.py VIDEO OUTDIR
Writes: frames.csv (per-frame metrics), cuts.txt, audio.json, contact sheets.
"""
import sys, os, json, subprocess
import numpy as np, cv2

vid, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
cap = cv2.VideoCapture(vid)
fps = cap.get(cv2.CAP_PROP_FPS)
rows, prev, prev_hist = [], None, None
small_frames = []
i = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    s = cv2.resize(f, (320, 180), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(s, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(s, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [30, 16], [0, 180, 0, 256])
    cv2.normalize(hist, hist)
    luma = g.mean()
    sat = hsv[..., 1].mean()
    b, gg, r = [s[..., k].mean() for k in range(3)]
    # letterbox: rows that are near-black at top
    rowmean = g.mean(axis=1)
    lb = int(np.argmax(rowmean > 12)) if (rowmean > 12).any() else 90
    diff = float(np.abs(g - prev).mean()) if prev is not None else 0.0
    hd = float(cv2.compareHist(prev_hist, hist, cv2.HISTCMP_BHATTACHARYYA)) if prev_hist is not None else 0.0
    # motion via optical flow magnitude + mean direction
    if prev is not None:
        flow = cv2.calcOpticalFlowFarneback(prev.astype(np.uint8), g.astype(np.uint8), None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag = float(np.linalg.norm(flow, axis=2).mean())
        dx, dy = float(flow[..., 0].mean()), float(flow[..., 1].mean())
        # zoom: divergence proxy (radial component)
        h, w = g.shape
        yy, xx = np.mgrid[0:h, 0:w]
        rx, ry = xx - w / 2, yy - h / 2
        rn = np.sqrt(rx**2 + ry**2) + 1e-6
        zoom = float(((flow[..., 0] * rx + flow[..., 1] * ry) / rn).mean())
    else:
        mag = dx = dy = zoom = 0.0
    edges = float(cv2.Canny(g.astype(np.uint8), 60, 160).mean())
    rows.append(dict(f=i, t=round(i / fps, 3), luma=round(luma, 1), sat=round(sat, 1), r=round(r, 1), g=round(gg, 1), b=round(b, 1),
                     lb=lb, diff=round(diff, 2), hist=round(hd, 3), flow=round(mag, 2), dx=round(dx, 2), dy=round(dy, 2),
                     zoom=round(zoom, 3), edges=round(edges, 1)))
    small_frames.append(cv2.resize(f, (192, 108)))
    prev, prev_hist = g, hist
    i += 1

import csv
with open(f"{out}/frames.csv", "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
    w.writeheader(); w.writerows(rows)

# cut detection: histogram jump that is a local peak and well above neighbourhood median
hd = np.array([r["hist"] for r in rows]); df = np.array([r["diff"] for r in rows])
cuts = []
for k in range(1, len(rows)):
    lo, hi = max(1, k - 6), min(len(rows), k + 7)
    med = np.median(hd[lo:hi])
    if hd[k] > 0.28 and hd[k] >= hd[lo:hi].max() and hd[k] > 2.2 * med + 0.05:
        cuts.append(k)
with open(f"{out}/cuts.txt", "w") as fh:
    for k in cuts:
        fh.write(f"{k}\t{k/fps:.2f}s\thist={hd[k]:.3f}\tdiff={df[k]:.1f}\n")

# contact sheets: every frame, 10 columns x 10 rows per sheet (=4 s at 25 fps)
cols, per = 10, 100
for sh in range(0, len(small_frames), per):
    chunk = small_frames[sh:sh + per]
    tiles = []
    for j, fr in enumerate(chunk):
        fr = fr.copy()
        n = sh + j
        mark = (0, 0, 255) if n in cuts else (255, 255, 255)
        cv2.putText(fr, f"{n} {n/fps:.2f}", (3, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 0), 3)
        cv2.putText(fr, f"{n} {n/fps:.2f}", (3, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, mark, 1)
        if n in cuts:
            cv2.rectangle(fr, (0, 0), (191, 107), (0, 0, 255), 2)
        tiles.append(fr)
    while len(tiles) % cols:
        tiles.append(np.zeros_like(small_frames[0]))
    grid = np.vstack([np.hstack(tiles[r:r + cols]) for r in range(0, len(tiles), cols)])
    cv2.imwrite(f"{out}/sheet_{sh:04d}.jpg", grid, [cv2.IMWRITE_JPEG_QUALITY, 88])

# ---- audio ----
wav = f"{out}/audio.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-ac", "1", "-ar", "22050", wav], check=True)
import librosa
y, sr = librosa.load(wav, sr=22050)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, units="time")
hop = 512
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
S = np.abs(librosa.stft(y, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr)
def band(lo, hi):
    m = (freqs >= lo) & (freqs < hi)
    return S[m].mean(axis=0)
low, mid, high = band(20, 150), band(150, 2000), band(2000, 11000)
times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
# per 0.25s summary
summ = []
for t0 in np.arange(0, times[-1], 0.25):
    m = (times >= t0) & (times < t0 + 0.25)
    summ.append(dict(t=round(float(t0), 2), rms_db=round(float(20 * np.log10(rms[m].mean() + 1e-9)), 1),
                     cent=int(cent[m].mean()), low=round(float(low[m].mean()), 3), mid=round(float(mid[m].mean()), 3),
                     high=round(float(high[m].mean()), 3)))
strong = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, units="time", delta=np.percentile(onset_env, 90) * 0.5)
json.dump(dict(fps=fps, frames=len(rows), tempo=float(np.atleast_1d(tempo)[0]),
               beats=[round(float(b), 3) for b in librosa.frames_to_time(beats, sr=sr)],
               onsets=[round(float(o), 3) for o in onsets], strong_onsets=[round(float(o), 3) for o in strong],
               summary=summ), open(f"{out}/audio.json", "w"), indent=1)

# spectrogram image with time grid
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
fig, ax = plt.subplots(3, 1, figsize=(26, 10), sharex=True)
D = librosa.amplitude_to_db(S, ref=np.max)
librosa.display.specshow(D, sr=sr, hop_length=hop, x_axis="time", y_axis="log", ax=ax[0], cmap="magma")
ax[1].plot(times, 20 * np.log10(rms + 1e-9), lw=0.8); ax[1].set_ylabel("RMS dB")
for k in cuts: [a.axvline(k / fps, color="cyan", lw=0.8, alpha=0.7) for a in ax]
ax[2].plot(times, low / low.max(), label="sub/low", lw=0.8); ax[2].plot(times, mid / mid.max(), label="mid", lw=0.8)
ax[2].plot(times, high / high.max(), label="high", lw=0.8); ax[2].legend()
ax[2].set_xticks(np.arange(0, times[-1], 1.0))
for a in ax: a.grid(alpha=0.3)
plt.tight_layout(); plt.savefig(f"{out}/audio.png", dpi=70)
print("frames", len(rows), "fps", fps, "cuts", len(cuts), "tempo", tempo)

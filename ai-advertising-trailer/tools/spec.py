"""Mel spectrogram in 3 rows with 0.5 s grid: python3 tools/spec.py in.wav out.png [offset_s]"""
import librosa, librosa.display, numpy as np, matplotlib, sys; matplotlib.use("Agg"); import matplotlib.pyplot as plt
y, sr = librosa.load(sys.argv[1], sr=22050); off = float(sys.argv[3]) if len(sys.argv) > 3 else 0
M = librosa.power_to_db(librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, hop_length=256), ref=np.max)
n = M.shape[1]; dur = n * 256 / sr; rows = 3
fig, ax = plt.subplots(rows, 1, figsize=(22, 13))
for r, a in enumerate(ax):
    i0, i1 = int(n * r / rows), int(n * (r + 1) / rows)
    a.imshow(M[:, i0:i1], origin="lower", aspect="auto", cmap="magma", extent=[off + i0*256/sr, off + i1*256/sr, 0, 128])
    a.set_xticks(np.arange(np.ceil((off + i0*256/sr)*2)/2, off + i1*256/sr, 0.5)); a.tick_params(axis="x", labelsize=7, rotation=90); a.grid(axis="x", alpha=.3)
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=80)

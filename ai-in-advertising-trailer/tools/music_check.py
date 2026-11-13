import sys, numpy as np, librosa, scipy.signal as ss
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, librosa.display
f = sys.argv[1]; y, sr = librosa.load(f, sr=22050)
h, p = librosa.effects.hpss(y); hop = 256
S = np.abs(librosa.stft(p, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr); t = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)
e = S[(fr >= 30) & (fr < 130)].sum(0); d = np.maximum(0, np.diff(e, prepend=e[0])); d /= d.max()
pk, _ = ss.find_peaks(d, height=0.12, distance=int(0.3 * sr / hop)); k = t[pk]
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, start_bpm=125)
print("librosa tempo", tempo, "| kick median ibi", np.median(np.diff(k)) if len(k) > 2 else None)
bounds = [0, 11.04, 14.4, 21.6, 27.36, 33.6, 39.36, 48.96, 58.56, 61.92]
names = ["drone", "groove1", "break1", "drop1", "break2", "drop2", "break3", "final", "outro"]
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
for i, n in enumerate(names):
    a, b = bounds[i], bounds[i + 1]; kk = k[(k >= a) & (k < b)]
    m = (t >= a) & (t < b)
    print(f"{n:8s} {a:6.2f}-{b:6.2f}  kicks {len(kk):3d}  ibi {np.median(np.diff(kk)) if len(kk)>2 else 0:.3f}  rms {20*np.log10(rms[m[:len(rms)]].mean()+1e-9):.1f} dB  first kicks {np.round(kk[:4],2).tolist()}")
fig, ax = plt.subplots(2, 1, figsize=(26, 7), sharex=True)
librosa.display.specshow(librosa.amplitude_to_db(np.abs(librosa.stft(y, hop_length=512)), ref=np.max), sr=sr, hop_length=512, x_axis="time", y_axis="log", ax=ax[0], cmap="magma")
ax[1].plot(t, d, lw=0.6); [a.axvline(x, color="cyan") for x in bounds for a in ax]; ax[1].set_xticks(np.arange(0, 62, 1))
plt.tight_layout(); plt.savefig(f.rsplit(".", 1)[0] + ".png", dpi=60)

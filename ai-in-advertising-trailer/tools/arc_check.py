"""usage: python3 arc_check.py files... -> tempo, kick grid, per-2s energy, drum density; spectrogram png per file"""
import sys, numpy as np, librosa, scipy.signal as ss
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, librosa.display
for f in sys.argv[1:]:
    y, sr = librosa.load(f, sr=22050); h, p = librosa.effects.hpss(y); hop = 256
    S = np.abs(librosa.stft(p, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr); t = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)
    e = S[(fr >= 30) & (fr < 130)].sum(0); d = np.maximum(0, np.diff(e, prepend=e[0])); d /= d.max()
    pk, _ = ss.find_peaks(d, height=0.12, distance=int(0.25 * sr / hop)); k = t[pk]
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, start_bpm=136); bt = librosa.frames_to_time(beats, sr=sr)
    rms = librosa.feature.rms(y=y, hop_length=512)[0]; tr = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
    print(f"\n{f}: dur {len(y)/sr:.1f}s tempo {float(np.atleast_1d(tempo)[0]):.1f} beat ibi med {np.median(np.diff(bt)):.4f} std {np.std(np.diff(bt)):.4f}")
    print("  energy dB per 2s :", " ".join(f"{20*np.log10(rms[(tr>=a)&(tr<a+2)].mean()+1e-9):.0f}" for a in range(0, int(len(y)/sr), 2)))
    print("  kicks per 2s     :", " ".join(f"{((k>=a)&(k<a+2)).sum():d}" for a in range(0, int(len(y)/sr), 2)))
    fig, ax = plt.subplots(2, 1, figsize=(24, 6), sharex=True)
    librosa.display.specshow(librosa.amplitude_to_db(np.abs(librosa.stft(y, hop_length=512)), ref=np.max), sr=sr, hop_length=512, x_axis="time", y_axis="log", ax=ax[0], cmap="magma")
    ax[1].plot(tr, 20 * np.log10(rms + 1e-9)); ax[1].set_xticks(np.arange(0, len(y) / sr, 2)); [a.grid(alpha=.3) for a in ax]
    plt.tight_layout(); plt.savefig(f.rsplit(".", 1)[0] + ".png", dpi=55); plt.close()

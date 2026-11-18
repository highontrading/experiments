import librosa, numpy as np, sys
y, sr = librosa.load(sys.argv[1], sr=44100, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
on_env = librosa.onset.onset_strength(y=y, sr=sr)
onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time', backtrack=False)
times = librosa.times_like(on_env, sr=sr)
strength = np.interp(onsets, times, on_env)
print("tempo", tempo)
print("beats", np.round(beats,3).tolist())
print("onsets", [(round(float(t),3), round(float(s),1)) for t,s in zip(onsets,strength)])
rms = librosa.feature.rms(y=y, hop_length=sr//4)[0]
print("rms/0.25s", np.round(rms,3).tolist())

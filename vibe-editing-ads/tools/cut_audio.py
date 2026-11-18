import json, sys, wave, numpy as np, subprocess
W = "/home/user/work"; edl = json.load(open(sys.argv[1])); outdir = sys.argv[2]
for n, e in edl.items():
    w = wave.open(f"{W}/a48_{n}.wav"); sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768
    F = int(0.012 * sr); ramp = np.linspace(0, 1, F)[:, None]
    parts = []
    for s in e["segments"]:
        x = a[int(s["in"] * sr):int(s["out"] * sr)].copy()
        x[:F] *= ramp; x[-F:] *= ramp[::-1]; parts.append(x)
    y = np.concatenate(parts)
    raw = f"{outdir}/dlg_raw_{n}.wav"
    with wave.open(raw, "wb") as o:
        o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    # broadcast-style voice chain: rumble cut, gentle denoise, de-mud, presence, de-ess, compress, loudness
    af = ("highpass=f=85,afftdn=nr=10:nf=-40:tn=1,equalizer=f=280:t=q:w=1.2:g=-2.5,"
          "equalizer=f=3200:t=q:w=1.0:g=2.5,equalizer=f=11000:t=h:w=0.7:g=1.5,"
          "deesser=i=0.35,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=4,"
          "alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=7")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", af, "-ar", "48000", f"{outdir}/dlg_{n}.wav"], check=True)
    print(n, "ok", len(y) / sr)

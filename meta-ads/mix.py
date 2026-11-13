"""Mix one ad: VO (build/<ad>/tl.json) + music + SFX (build/<ad>/audio.json) -> build/<ad>/mix.wav"""
import json, os, sys, numpy as np, librosa, soundfile as sf
SR = 48000; ad = sys.argv[1]
A = json.load(open(f"build/{ad}/audio.json")); DUR = A["dur"]; N = int(DUR * SR) + SR
def db(x): return 10 ** (x / 20)
def load(p, off=0.0, dur=None):
    y, _ = librosa.load(p, sr=SR, mono=False, offset=off, duration=dur)
    return np.stack([y, y]) if y.ndim == 1 else y
def place(bus, y, at, gain=0.0, fi=0.0, fo=0.01):
    y = y * db(gain); n = y.shape[1]
    if fi > 0: k = min(n, int(fi * SR)); y[:, :k] *= np.linspace(0, 1, k)
    if fo > 0: k = min(n, int(fo * SR)); y[:, n - k:] *= np.linspace(1, 0, k)
    i = int(at * SR); j = min(N, i + n)
    if j > i: bus[:, i:j] += y[:, :j - i]
vo, mus, sfx = (np.zeros((2, N)) for _ in range(3))
if os.path.exists(f"build/{ad}/tl.json"):
    for l in json.load(open(f"build/{ad}/tl.json"))["lines"]:
        place(vo, load(f"build/vo/{ad}_{l['i']}.mp3"), l["at"], gain=0.0, fo=0.04)
m = A.get("music")
if m:
    at = m.get("at", 0); end = m.get("end", DUR); y = load(m["file"], off=m.get("offset", 0), dur=end - at)
    place(mus, y, at, gain=m.get("gain", -10), fi=m.get("fadeIn", 0.05), fo=m.get("fadeOut", 0.6))
    if vo.any() and m.get("duck", -7) < 0:   # duck under VO
        e = np.abs(vo).mean(0); k = int(0.02 * SR); e = np.convolve(e, np.ones(k) / k, "same"); act = np.clip(e / 0.02, 0, 1)
        env = np.zeros(N); v = 0.0; up, dn = 1 - np.exp(-32 / (0.02 * SR)), 1 - np.exp(-32 / (0.35 * SR))
        for i in range(0, N, 32): x = act[i]; v += (x - v) * (up if x > v else dn); env[i:i + 32] = v
        mus *= db(m.get("duck", -7) * env)
for name, t, gain in A.get("sfx", []):
    place(sfx, load(f"build/sfx/{name}.mp3"), t, gain=gain, fo=0.05)
mix = (vo + mus + sfx)[:, :int(DUR * SR)]
mix[:, -int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
sf.write(f"build/{ad}/mix.wav", mix.T.astype(np.float32), SR, subtype="FLOAT"); print(ad, "mix peak", round(float(np.abs(mix).max()), 2))

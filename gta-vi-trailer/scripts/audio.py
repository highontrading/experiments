import numpy as np, librosa, sys
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
WORK, OUT = sys.argv[1], sys.argv[2]
SR = 44100; TOTAL = 15.0
rng = np.random.default_rng(3)
m, _ = librosa.load(f"{WORK}/music.mp3", sr=SR, mono=False)
m = m.T.astype(np.float32)
mix = np.zeros((int(TOTAL * SR), 2), np.float32)
n = min(len(m), len(mix))
m = m[:n].copy()
fo = int(0.06 * SR); m[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix[:n] += m / np.abs(m).max() * 0.89
sfx = np.zeros_like(mix)

def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, btype='high', fs=SR, output='sos'), x)
def add(t, sig, gain=1.0, pan=0.0):
    i = int(t * SR)
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    j = min(len(sfx), i + len(sig)); sfx[i:j] += sig[:j - i] * gain
def reverb(x, secs=1.8, wet=0.35):
    L = int(secs * SR); ir = rng.normal(0, 1, L) * np.exp(-np.linspace(0, 6, L)); ir = lp(ir, 6000)
    w = np.zeros(len(x) + L); c = fftconvolve(x, ir); w[:min(len(c), len(w))] = c[:len(w)]; w /= np.abs(w).max() + 1e-9
    out = np.zeros(len(x) + L); out[:len(x)] += x * (1 - wet); out += w * wet * np.abs(x).max()
    return out

def impact(dur=1.4, f0=110, f1=32, big=1.0):
    t = np.arange(int(dur * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.35 * big))
    nz = lp(rng.normal(0, 1, len(t)), 2500) * np.exp(-t / 0.05) * 0.6
    click = hp(rng.normal(0, 1, len(t)), 3000) * np.exp(-t / 0.006) * 0.5
    x = np.tanh((sub + nz + click) * 1.6)
    return reverb(x, 1.6 * big, 0.3)

def whoosh(dur=0.35, rev=False):
    L = int(dur * SR); t = np.linspace(0, 1, L)
    x = rng.normal(0, 1, L); out = np.zeros(L); seg = 512
    for k in range(0, L, seg):
        c = 300 + 5000 * t[k] ** 2
        out[k:k + seg] = bp(x[k:k + seg + 2048], c * 0.6, min(c * 1.6, 20000))[:len(out[k:k + seg])]
    env = np.sin(np.pi * t) ** 2 * (t ** 1.5 if not rev else 1)
    y = out * env; y /= np.abs(y).max() + 1e-9
    return y[::-1] if rev else y

def riser(dur):
    L = int(dur * SR); t = np.linspace(0, 1, L)
    nz = hp(rng.normal(0, 1, L), 1500) * t ** 2.5 * 0.5
    f = 180 + 1400 * t ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 * t ** 2 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.12 * t ** 2
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(4 + 26 * t) / SR)
    y = (nz + tone) * trem; return y / np.abs(y).max()

def glitchblip(dur=0.07):
    L = int(dur * SR); t = np.arange(L) / SR
    f = rng.choice([800, 1200, 2400, 3600])
    y = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + rng.normal(0, 1, L) * 0.4
    y = np.round(y * 4) / 4  # bitcrush
    return y * np.exp(-t / 0.03)

def camclick():
    L = int(0.05 * SR); t = np.arange(L) / SR
    return hp(rng.normal(0, 1, L), 2000) * np.exp(-t / 0.004)

# only the essentials: build-up riser, drop impact, logo reveal impact + tail
add(5.10, riser(1.86), 0.26)
add(7.024, impact(2.0, 130, 30, 1.4), 0.55)
add(12.643, impact(2.6, 150, 28, 2.2), 0.70)
out = mix + sfx
out = np.tanh(out * 1.05) * 0.97
fade = int(0.4 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
wavfile.write(OUT, SR, (out * 32767).astype(np.int16))
print("peak", np.abs(out).max())

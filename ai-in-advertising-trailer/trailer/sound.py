"""Mixes music sections, VO and SFX from timeline.py -> build/mix.wav (loudness-normalised)."""
import os, subprocess, json
import numpy as np
from timeline import *

SR = 44100
N = int((DUR + 0.5) * SR)


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def db(x): return 10 ** (x / 20)


def place(buf, clip, t, gain=1.0):
    i = int(round(t * SR)); j = min(len(buf), i + len(clip))
    if j > i: buf[i:j] += clip[: j - i] * gain


def fades(x, fin, fout):
    n = len(x)
    if fin > 0:
        k = min(n, int(fin * SR)); x[:k] *= np.linspace(0, 1, k)[:, None]
    if fout > 0:
        k = min(n, int(fout * SR)); x[n - k:] *= np.linspace(1, 0, k)[:, None]
    # 3 ms declick at both ends
    k = int(0.003 * SR); x[:k] *= np.linspace(0, 1, k)[:, None]; x[-k:] *= np.linspace(1, 0, k)[:, None]
    return x


music = np.zeros((N, 2), np.float32)
cache = {}
for (s, e, f, off, g, fin, fout) in MUSIC:
    if f not in cache: cache[f] = load(gen_path("music", f))
    src = cache[f]
    if off is None: off = 0.999  # first kick of drums_b
    a = int(off * SR); seg = src[a:a + int((e - s) * SR)].copy()
    place(music, fades(seg, fin, fout), s, db(g))

# VO + ducking envelope
vo = np.zeros((N, 2), np.float32); env = np.zeros(N, np.float32)
for k, t in VO_START.items():
    x = load(gen_path("vo", k + ".mp3"))
    x = x / (np.abs(x).max() + 1e-9) * db(-2.0)
    place(vo, x, t); i = int(t * SR); env[i:i + len(x)] = 1.0
# smooth ducking (attack 60 ms, release 300 ms)
dk = np.copy(env); a_, r_ = 1 / (0.06 * SR), 1 / (0.30 * SR); y = 0.0
for i in range(N):
    y = y + (dk[i] - y) * (a_ if dk[i] > y else r_); dk[i] = y
music *= (1 - dk * (1 - db(-11)))[:, None]

sfx = np.zeros((N, 2), np.float32)
for t, name, g in SFX:
    x = load(gen_path("sfx", name + ".mp3"))
    if name == "riser": t = t - len(x) / SR  # risers end on their time
    place(sfx, x, t, db(g))
# the hard digital silence (18.72 - 19.68): nothing but the tail of the whoosh
i0, i1 = int(18.80 * SR), int(19.68 * SR)
music[i0:i1] = 0; sfx[int(18.85 * SR):int(19.55 * SR)] = 0

mix = music * db(-3) + vo * db(2) + sfx * db(-5)
mix[:int(0.002 * SR)] = 0
# end: fade the last 0.6 s to silence
k = int(0.6 * SR); e = int(DUR * SR); mix[e - k:e] *= np.linspace(1, 0, k)[:, None]; mix[e:] = 0
mix = mix[:int(DUR * SR)]
peak = np.abs(mix).max(); mix = mix / peak * 0.95
tmp = os.path.join(B, "mix_raw.wav")
import wave
with wave.open(tmp, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
# two-pass loudnorm to -14 LUFS / -1 dBTP
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", af, "-ar", str(SR), os.path.join(B, "mix.wav")], check=True)
print("mix.wav done; input loudness", js["input_i"], "LUFS")
# --- report voice-to-background ratio per VO line (dB)
bgm = (music * db(-3) + sfx * db(-5)) * db(-2)
for k, t in VO_START.items():
    i = int(t * SR); j = i + int(min(2.5, max(w[2] for w in vo_words(k)) - t) * SR)
    v = np.sqrt(np.mean(vo[i:j] ** 2)); m_ = np.sqrt(np.mean(bgm[i:j] ** 2))
    print(f"{k}: voice/background {20 * np.log10(v / (m_ + 1e-9)):+.1f} dB")

# Audio mix from v2/build/timeline.json: VO pieces, beat-cut music with ducking, SFX cues -> build/mix.wav
import json, subprocess, numpy as np
SR = 48000
T = json.load(open("v2/build/timeline.json"))
N = int(T["dur"] * SR)

def load(path, ch=2):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(ch), "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, ch).copy()
def db(x): return 10 ** (x / 20)
def place(buf, clip, t, gain=1.0):
    i = int(round(t * SR));
    if i >= len(buf): return
    if i < 0: clip = clip[-i:]; i = 0
    n = min(len(clip), len(buf) - i); buf[i:i + n] += clip[:n] * gain
def fade(x, a=0.01, b=0.01):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)[:, None]
    if nb: x[-nb:] *= np.linspace(1, 0, nb)[:, None]
    return x

# --- VO
vo_src = load("assets/vo/v4_brian.mp3", 2)
vo = np.zeros((N, 2), np.float32)
for a, b, d in T["vo"]:
    seg = vo_src[int(a * SR): (int(b * SR) if b else len(vo_src))]
    place(vo, fade(seg, 0.005, 0.02), d)
peak = np.abs(vo).max(); vo *= db(-3) / peak
# gentle presence: high-shelf-ish via first difference blend
vo = vo + 0.12 * np.vstack([np.zeros((1, 2)), np.diff(vo, axis=0)]).astype(np.float32)

# --- music, cut on bars with short crossfades
ms = load("assets/music/music1.mp3", 2)
mus = np.zeros((N + SR * 2, 2), np.float32)
XF = 0.03
for k, (a, b, d) in enumerate(T["music"]):
    seg = ms[int(a * SR): (int(b * SR) if b else len(ms))]
    seg = fade(seg, XF if k else 0.6, XF if b else 0.8)
    place(mus, seg, d - (XF / 2 if k else 0))
mus = mus[:N]
# ducking from VO envelope
env = np.abs(vo).max(1)
win = int(0.03 * SR); env = np.convolve(env, np.ones(win) / win, "same")
active = (env > 0.02).astype(np.float32)
# smooth: attack 80ms, release 450ms
g = np.zeros_like(active); a_c = np.exp(-1 / (0.08 * SR)); r_c = np.exp(-1 / (0.45 * SR)); s = 0.0
for i in range(0, N, 48):  # control rate 1 kHz
    x = active[i]; c = a_c ** 48 if x > s else r_c ** 48; s = x + (s - x) * c; g[i:i + 48] = s
duck = db(-9.5) ** g  # 0 -> 1.0, 1 -> -9.5 dB
mus_gain = db(-13.0)
mus = mus * (mus_gain * duck)[:, None]

# --- SFX
sfx = np.zeros((N, 2), np.float32)
cache = {}
for t, name, gdb in T["sfx"]:
    if name not in cache:
        c = load(f"assets/sfx/{name}.mp3", 2); c = c / (np.abs(c).max() + 1e-9); cache[name] = fade(c, 0.003, 0.05)
    place(sfx, cache[name], t, db(gdb - 9))

mix = vo + mus + sfx
mix[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))[:, None]
mix = np.tanh(mix * 1.1) / 1.1   # soft safety clip
import wave
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
w = wave.open("v2/build/mix_pre.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "v2/build/mix_pre.wav", "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", "48000", "v2/build/mix.wav"], check=True)
# stems for reference
print("mix ok", round(N / SR, 2), "s")
sp = g > 0.5
r = lambda x, m: 20 * np.log10(np.sqrt((x[m] ** 2).mean()) + 1e-9)
print("VO rms (speech)", round(r(vo, sp), 1), " music rms (speech)", round(r(mus, sp), 1), " music rms (gaps)", round(r(mus, ~sp), 1), " sfx peak", round(20*np.log10(np.abs(sfx).max()),1))

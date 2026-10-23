"""Mix: ElevenLabs VO + music bed (ducked under the voice) + every SFX the stage scheduled.

    python3 sound.py  ->  build/mix.wav (48 kHz stereo, loudness-normalised to -14 LUFS)

Reads build/timeline.json (VO placement) and build/sfx_events.json (written by render.js),
so every hit lands on the frame where its paper drops, tape rips or stamp lands.
"""
import json
import pathlib
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import uniform_filter1d

ROOT = pathlib.Path(__file__).parent
B = ROOT / "build"
SR = 48000
TL = json.loads((B / "timeline.json").read_text())
N = int(TL["dur"] * SR)


def load(path, filters=None, mono=False):
    cmd = ["ffmpeg", "-loglevel", "error", "-i", str(path)]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"]
    x = np.frombuffer(subprocess.check_output(cmd), dtype=np.float32)
    return x.copy() if mono else x.reshape(-1, 2).copy()


def put(bus, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i < 0:
        sig, i = sig[-i:], 0
    if i >= N or len(sig) == 0:
        return
    sig = sig[: N - i]
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * 1.414
    bus[i:i + len(sig)] += sig * gain


# ------------------------------------------------------------------ voice --
vo = np.zeros((N, 2))
VO_FX = (f"atempo={TL['tempo']},highpass=f=75,lowpass=f=15000,"
         "equalizer=f=220:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.4:g=2,"
         "acompressor=threshold=-21dB:ratio=3:attack=6:release=90:makeup=2")
for v in TL["vo"]:
    x = load(B / "vo" / f"{v['id']}.mp3", VO_FX, mono=True)
    put(vo, x, v["t"], 1.0)

# ----------------------------------------------------------------- music --
music = load(B / "music/bed.mp3")


def extend(m, end_at):
    """Repeat 16 bars (92 BPM) mid-track so the closing chord lands on the end card.
    The splice point is the spot in 140-240 s where the track best matches itself one
    phrase earlier; the exact sample offset comes from waveform correlation."""
    a = np.abs(m[:, 0])
    tail = len(a) - 1 - np.argmax(a[::-1] > 0.01 * a.max())     # last audible sample
    need = end_at * SR - tail
    if need <= 0:
        return m
    L = int(round(16 * 60 / 92.285 * SR)) * max(1, int(round(need / (16 * 60 / 92.285 * SR))))
    # log-spectrum frames (2048 / hop 1024); compare 4 s of frames around T with T - L
    mono = m[:, 0] + m[:, 1]
    fh = 1024
    nfr = len(mono) // fh - 2
    win_ = np.hanning(2048)
    spec = np.stack([np.log1p(np.abs(np.fft.rfft(mono[i * fh:i * fh + 2048] * win_))[:380]) for i in range(nfr)])
    spec -= spec.mean(1, keepdims=True)
    spec /= np.linalg.norm(spec, axis=1, keepdims=True) + 1e-9
    lagf = L // fh
    best, bestT = -1, None
    for f in range(140 * SR // fh, 240 * SR // fh):
        c = float(np.mean(np.sum(spec[f - 40:f + 120] * spec[f - 40 - lagf:f + 120 - lagf], 1)))
        if c > best:
            best, bestT = c, f * fh
    w = int(0.02 * SR)
    u = m[bestT:bestT + SR // 2, 0]
    offs = range(-w, w + 1)
    d = max(offs, key=lambda o: float(np.dot(u, m[bestT - L + o:bestT - L + o + SR // 2, 0])))
    src = bestT - L + d
    xf = int(0.04 * SR)
    ramp = np.linspace(0, 1, xf)[:, None]
    joint = m[bestT:bestT + xf] * (1 - ramp) + m[src:src + xf] * ramp
    out = np.concatenate([m[:bestT], joint, m[src + xf:]])
    print(f"music: repeated {L / SR:.2f}s at {bestT / SR:.1f}s (match {best:.2f}), ends {(tail + bestT - src) / SR:.1f}s")
    return out


music = extend(music, TL["outro"]["start"] + 2.5)[:N]
music = np.pad(music, ((0, N - len(music)), (0, 0)))
# duck under the voice: smoothed VO envelope -> gain between 1 (gaps) and 0.42 (speech)
env = np.abs(vo[:, 0])
env = uniform_filter1d(env, int(0.25 * SR))
env = np.clip(env / (env.max() * 0.18), 0, 1)
# slow release so the bed doesn't pump between words
k = int(0.6 * SR)
env = np.maximum.reduce([np.roll(env, s) for s in range(0, k, k // 6)])
env = uniform_filter1d(env, int(0.3 * SR))
duck = 1.0 - 0.58 * env
t = np.arange(N) / SR
fade = np.clip(t / 1.2, 0, 1) * np.clip((TL["dur"] - t) / 3.0, 0, 1)
music *= (0.40 * duck * fade)[:, None]

# ------------------------------------------------------------------- sfx --
fx = np.zeros((N, 2))
cache = {}


def sfx(name):
    if name not in cache:
        x = load(B / "sfx" / f"{name}.mp3", mono=True)
        on = np.argmax(np.abs(x) > 0.02 * np.abs(x).max())   # trim lead-in so hits are tight
        x = x[max(0, on - int(0.004 * SR)):]
        cache[name] = x / (np.abs(x).max() + 1e-9) * 0.7
    return cache[name]


events = json.loads((B / "sfx_events.json").read_text())
last = {}
for e in events:
    if e["t"] - last.get(e["name"], -1) < 0.045:   # no machine-gun doubles
        continue
    last[e["name"]] = e["t"]
    x = sfx(e["name"])
    if e.get("dur"):
        n = int((e["dur"] + 0.12) * SR)
        x = x[:n].copy()
        f = min(len(x), int(0.12 * SR))
        x[-f:] *= np.linspace(1, 0, f)
    put(fx, x, e["t"], e["gain"], e.get("pan", 0))
fx *= 0.62

# ---------------------------------------------------------------- master --
mix = vo + music + fx
peak = np.abs(mix).max()
mix = mix / peak * 0.89
for name, stem in (("vo", vo), ("music", music), ("sfx", fx)):   # stems for checking the balance
    wavfile.write(B / f"stem_{name}.wav", SR, (stem / peak * 0.89).astype(np.float32))
raw = B / "mix_raw.wav"
wavfile.write(raw, SR, mix.astype(np.float32))

# two-pass loudnorm to -14 LUFS, -1.5 dBTP
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af",
                      "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
m = json.loads(out[out.rindex("{"):out.rindex("}") + 1])
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), "-af",
                f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                "-ar", str(SR), "-c:a", "pcm_s24le", str(B / "mix.wav")], check=True)
print(f"mix: {TL['dur']:.2f}s, {len(events)} sfx events, input {m['input_i']} LUFS -> -14 LUFS")

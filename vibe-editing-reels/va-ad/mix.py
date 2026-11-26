#!/usr/bin/env python3
"""Mix: processed voice + ducked felt-piano bed + synthesised SFX -> build/audio/mix.wav (-14 LUFS, -1.5 dBTP)."""
import json, subprocess, re
import numpy as np, soundfile as sf
A = "build/audio"
def run(*a): return subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
# 1) voice chain
run("-i", "build/voice_raw.wav", "-af",
    "highpass=f=78,equalizer=f=270:t=q:w=1.1:g=-2.2,equalizer=f=4200:t=q:w=1.4:g=1.2,deesser=i=0.35,"
    "acompressor=threshold=-24dB:ratio=2.4:attack=10:release=140:knee=6:makeup=2.5,aresample=48000",
    "-ac", "2", f"{A}/voice.wav")
# 2) bed: trimmed, softened, faded
run("-i", "assets/bed.mp3", "-af", "aresample=48000,highpass=f=70,lowpass=f=7000,atrim=0:26.8,afade=t=in:d=0.8,afade=t=out:st=25.0:d=1.8",
    "-ac", "2", f"{A}/bed.wav")
v, _ = sf.read(f"{A}/voice.wav"); b, _ = sf.read(f"{A}/bed.wav"); s, _ = sf.read(f"{A}/sfx.wav")
n = int(26.8 * 48000)
pad = lambda x: np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]
v, b, s = pad(v), pad(b), pad(s)
rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
# bed sits ~21 dB under the voice on average, then ducks a further ~5 dB while he speaks
b = b * (rms(v) / rms(b)) * 10 ** (-19 / 20)
win = 4800
e = np.sqrt(np.convolve((v ** 2).mean(1), np.ones(win) / win, "same"))
speech = np.clip((20 * np.log10(e + 1e-9) + 42) / 12, 0, 1)
k = 9600; speech = np.convolve(speech, np.ones(k) / k, "same")
duck = 10 ** (-5 * speech / 20)
b = b * duck[:, None]
mix = v + b + s
sf.write(f"{A}/premix.wav", mix.astype(np.float32), 48000)
# 3) two-pass loudnorm
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{A}/premix.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
m = json.loads(r.stderr[r.stderr.rindex("{"):])
run("-i", f"{A}/premix.wav", "-af", f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000",
    "-c:a", "pcm_s16le", f"{A}/mix.wav")
for name, x in [("voice", v), ("bed", b), ("sfx", s)]:
    print(f"{name:6s} rms {20*np.log10(rms(x)):6.1f} dBFS  peak {20*np.log10(np.max(np.abs(x))+1e-9):6.1f}")

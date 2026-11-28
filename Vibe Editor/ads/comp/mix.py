"""Audio mixer for the ads: voiceover segments, a ducked music bed, ambience beds and timed SFX, mastered to
-14 LUFS / -1.5 dBTP, then muxed onto the picture."""
import json
import os
import re
import subprocess

import numpy as np

ADS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ADS, "audio")
SR = 48000


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def peak_time(x):
    m = np.abs(x).mean(axis=1)
    win = int(0.02 * SR)
    r = np.convolve(m, np.ones(win) / win, "same")
    return float(np.argmax(r)) / SR


def db(v):
    return 10 ** (v / 20)


def env_follow(x, attack=0.03, release=0.35):
    m = np.abs(x).mean(axis=1)
    out = np.zeros_like(m)
    a_up, a_dn = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    e = 0.0
    step = 64  # block-wise for speed
    for i in range(0, len(m), step):
        v = m[i:i + step].max()
        e = (a_up * e + (1 - a_up) * v) if v > e else (a_dn * e + (1 - a_dn) * v)
        out[i:i + step] = e
    return out


def mix(name, dur, vo=(), music=None, beds=(), sfx=(), duck_db=-9.0, out_dir=None):
    """vo: [(file, at, src_start, src_end, gain_db)]; music: (file, gain_db, fade_in, fade_out, src_start);
    beds: [(file, at, gain_db, fade)]; sfx: [(file, t_peak, gain_db)] (peak-aligned)."""
    n = int(dur * SR)
    voice = np.zeros((n, 2), np.float32)
    for f, at, s0, s1, g in vo:
        x = load(os.path.join(AUD, f))
        x = x[int(s0 * SR): int(s1 * SR) if s1 else None] * db(g)
        fade = int(0.01 * SR)
        if len(x) > 2 * fade:
            x[:fade] *= np.linspace(0, 1, fade)[:, None]
            x[-fade:] *= np.linspace(1, 0, fade)[:, None]
        a = int(at * SR)
        m = min(len(x), n - a)
        if m > 0:
            voice[a:a + m] += x[:m]
    bus = voice.copy()
    if music:
        f, g, fi, fo, s0 = music
        x = load(os.path.join(AUD, f))[int(s0 * SR):]
        if len(x) < n:
            x = np.concatenate([x, np.zeros((n - len(x), 2), np.float32)])
        x = x[:n] * db(g)
        t = np.arange(n) / SR
        gain = np.clip(t / max(fi, 0.01), 0, 1) * np.clip((dur - t) / max(fo, 0.01), 0, 1)
        env = env_follow(voice)
        thr = 0.02
        duck = 1 - (1 - db(duck_db)) * np.clip(env / thr, 0, 1)
        bus += x * (gain * duck)[:, None]
    for f, at, g, fade in beds:
        x = load(os.path.join(AUD, f)) * db(g)
        a = int(at * SR)
        m = min(len(x), n - a)
        if m <= 0:
            continue
        x = x[:m]
        fl = int(fade * SR)
        if fl and m > 2 * fl:
            x[:fl] *= np.linspace(0, 1, fl)[:, None]
            x[-fl:] *= np.linspace(1, 0, fl)[:, None]
        bus[a:a + m] += x
    cache = {}
    for f, tp, g in sfx:
        if f not in cache:
            x = load(os.path.join(AUD, f))
            cache[f] = (x, peak_time(x))
        x, pk = cache[f]
        a = int(max(0.0, tp - pk) * SR)
        m = min(len(x), n - a)
        if m > 0:
            bus[a:a + m] += x[:m] * db(g)
    out_dir = out_dir or os.path.join(ADS, "renders")
    raw = os.path.join(out_dir, f"{name}-mix-raw.wav")
    final = os.path.join(out_dir, f"{name}-mix.wav")
    _write_wav(raw, bus)
    # two-pass loudness normalisation to -14 LUFS, true peak -1.5 dBTP
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    j = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", meas, re.S).group(0))
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
          f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.84:level=false,aresample={SR}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", af, "-ar", str(SR), final], check=True)
    return final


def _write_wav(path, x):
    import wave
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def mux(video, audio, out):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
    return out

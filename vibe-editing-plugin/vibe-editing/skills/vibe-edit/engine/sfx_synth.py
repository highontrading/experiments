"""Synthesize the built-in SFX pack (royalty-free: every sound is generated from code).

python ve.py sfx-build   -> writes assets/sfx/*.wav
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def _env(n, attack, release, curve=3.0):
    t = np.linspace(0, 1, n)
    a = max(1, int(n * attack))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 2
    rel = max(1, int(n * release))
    e[-rel:] *= np.linspace(1, 0, rel) ** curve
    return e


def _bandpass_sweep(noise, f0, f1, q=2.0):
    """Cheap time-varying resonant filter (state-variable) sweeping f0 -> f1."""
    n = len(noise)
    f = np.geomspace(f0, f1, n)
    low = band = 0.0
    out = np.empty(n)
    damp = 1.0 / q
    for i in range(n):
        g = 2 * np.sin(np.pi * f[i] / SR)
        high = noise[i] - low - damp * band
        band += g * high
        low += g * band
        out[i] = band
    return out


def _norm(x, peak=0.89):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def whoosh(d=0.55):
    n = int(SR * d)
    x = _bandpass_sweep(rng.standard_normal(n), 300, 4500, 1.6)
    x *= np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return _norm(x)


def swoosh(d=0.4):
    n = int(SR * d)
    x = _bandpass_sweep(rng.standard_normal(n), 5000, 500, 1.4)
    x *= np.sin(np.linspace(0, np.pi, n)) ** 2
    return _norm(x, 0.8)


def swipe(d=0.22):
    n = int(SR * d)
    x = _bandpass_sweep(rng.standard_normal(n), 1500, 7000, 2.5)
    x *= _env(n, 0.15, 0.7)
    return _norm(x, 0.7)


def pop(d=0.12):
    n = int(SR * d)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 28) + 260
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38)
    return _norm(x)


def click(d=0.05):
    n = int(SR * d)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 2200 * t) + 0.5 * rng.standard_normal(n)) * np.exp(-t * 160)
    return _norm(x, 0.8)


def tick(d=0.03):
    n = int(SR * d)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 3800 * t) * np.exp(-t * 300)
    return _norm(x, 0.6)


def ding(d=1.2):
    n = int(SR * d)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k)
            for f, a, k in [(1318.5, 1, 3.2), (2637, .35, 5), (3951, .15, 7), (1975.5, .2, 4)])
    x *= _env(n, 0.002, 0.2)
    return _norm(x, 0.7)


def riser(d=1.6):
    n = int(SR * d)
    t = np.arange(n) / SR
    f = np.geomspace(180, 1600, n)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4
    nz = _bandpass_sweep(rng.standard_normal(n), 400, 8000, 1.2) * 0.6
    x = (tone + nz) * (t / d) ** 2.2
    x *= _env(n, 0.01, 0.03)
    return _norm(x, 0.8)


def impact(d=0.9):
    n = int(SR * d)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 6) + 38) / SR) * np.exp(-t * 5)
    crack = rng.standard_normal(n) * np.exp(-t * 45) * 0.6
    return _norm(np.tanh((body + crack) * 2.2))


def boom(d=1.6):
    n = int(SR * d)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t * 2.5) + 30) / SR) * np.exp(-t * 2.4)
    return _norm(np.tanh(x * 1.8))


def glitch(d=0.35):
    n = int(SR * d)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        ln = int(rng.integers(300, 2400))
        f = float(rng.choice([180, 440, 900, 1800, 3500]))
        t = np.arange(min(ln, n - pos)) / SR
        x[pos:pos + len(t)] = np.sign(np.sin(2 * np.pi * f * t)) * rng.uniform(0.3, 1)
        pos += ln + int(rng.integers(0, 900))
    return _norm(x * _env(n, 0.01, 0.2), 0.55)


def shutter(d=0.25):
    n = int(SR * d)
    x = np.zeros(n)
    for start, k in [(0, 120), (int(0.09 * SR), 90)]:
        m = n - start
        t = np.arange(m) / SR
        x[start:] += rng.standard_normal(m) * np.exp(-t * k)
    return _norm(x, 0.7)


GEN = {"whoosh": whoosh, "swoosh": swoosh, "swipe": swipe, "pop": pop, "click": click, "tick": tick,
       "ding": ding, "riser": riser, "impact": impact, "boom": boom, "glitch": glitch, "shutter": shutter}


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    stereo = np.repeat(pcm[:, None], 2, axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


def build(out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in GEN.items():
        write_wav(out_dir / f"{name}.wav", fn())
    return sorted(p.name for p in out_dir.glob("*.wav"))


if __name__ == "__main__":
    from common import SFX_DIR
    print(build(SFX_DIR))

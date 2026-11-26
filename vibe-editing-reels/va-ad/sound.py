#!/usr/bin/env python3
"""ASMR-subtle sound design for the VA ad.

Everything is synthesised here (no stock whooshes) and placed to the frame against the graphics in stage.html.
Palette: soft key ticks, glass "tinks" (bell partials, quiet), breathy air swells, felt-pen scrapes,
odometer micro-ticks, a soft cursor click. Peaks sit 14-22 dB under the voice.

Outputs build/audio/sfx.wav (stereo 48k). mix.sh combines it with the processed voice and the music bed.
"""
import json
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

SR = 48000
DUR = 26.8
rng = np.random.default_rng(7)
L = np.zeros(int(SR * (DUR + 1)))
R = np.zeros_like(L)


def db(x):
    return 10 ** (x / 20)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def place(sig, t, gain_db, pan=0.0):
    i = int(t * SR)
    n = min(len(sig), len(L) - i)
    g = db(gain_db)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + n] += sig[:n] * g * l * 1.414
    R[i:i + n] += sig[:n] * g * r * 1.414


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def env_ad(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e


# ---- sound atoms ----------------------------------------------------------
def key_tick(vel=1.0):
    n = int(0.05 * SR)
    noise = rng.standard_normal(n)
    body = bp(noise, 1800, 5200) * env_ad(n, 0.0007, 0.006)
    thock = np.sin(2 * np.pi * rng.uniform(180, 240) * np.arange(n) / SR) * env_ad(n, 0.001, 0.012) * 0.35
    return norm(body + thock) * vel


def tink(freq):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.42)
         + 0.32 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / 0.16)
         + 0.12 * np.sin(2 * np.pi * freq * 5.40 * t) * np.exp(-t / 0.07))
    s *= np.minimum(1, t / 0.003)
    return lp(norm(s), 6000)


def air(dur=0.6, lo=500, hi=2600, a=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    pink = np.cumsum(rng.standard_normal(n)) * 0.02 + rng.standard_normal(n)
    s = bp(hp(pink, 60), lo, hi)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    e *= np.minimum(1, t / a)
    return norm(s * e)


def scan_shimmer(dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # band rises 1.2k -> 6k, very soft
    for k in range(8):
        seg = slice(k * n // 8, (k + 1) * n // 8 + 2000)
        f = 1200 * (5 ** (k / 7))
        part = bp(noise, f * 0.8, f * 1.25)
        w = np.zeros(n)
        w[seg] = np.hanning(len(range(*seg.indices(n))))
        out += part * w
    e = np.sin(np.pi * np.clip(t / dur, 0, 1))
    return norm(out * e)


def pen_scrape(dur=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    grain = (rng.random(n) < 0.08) * rng.standard_normal(n) * 2
    s = bp(noise + grain, 2200, 6500)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return norm(s * e)


def micro_click():
    n = int(0.03 * SR)
    noise = rng.standard_normal(n)
    return norm(bp(noise, 2500, 7000) * env_ad(n, 0.0004, 0.0035))


def mouse_click():
    n = int(0.12 * SR)
    s = np.zeros(n)
    c1, c2 = key_tick(1.0), key_tick(0.6)
    s[:len(c1)] += c1
    o = int(0.07 * SR)
    s[o:o + len(c2)] += c2[: n - o]
    return norm(lp(s, 5000))


def breath_swell(dur=0.75):
    # the section transition at 17.667: soft inhale-like noise, low-passed, no "whoosh" sweep
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = lp(bp(rng.standard_normal(n), 250, 3000), 2200)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return norm(s * e)


# ---- the cue sheet (seconds, output timeline) -------------------------------
TYPE = "Virtual Assistant"
cues = []
# opener: light scan through the presenter
cues.append((0.00, scan_shimmer(0.62), -36, 0.0))
# hero words breathe in (very low air, panned slightly toward the word)
for t0, pan in [(0.30, 0.0), (9.96, -0.25), (10.58, 0.25), (11.82, 0.0), (14.90, 0.0), (17.76, -0.2), (24.88, 0.0)]:
    cues.append((t0, air(0.62), -41, pan))
# cards settle in (even softer air)
for t0 in [1.40, 2.94, 6.50, 13.42, 23.38]:
    cues.append((t0, air(0.5, 700, 3200, 0.14), -43, 0.0))
# typing: one tick per character, human jitter, skip the space
for k, ch in enumerate(TYPE):
    if ch == " ":
        continue
    tk = 1.56 + (k + 1) / len(TYPE) * (2.16 - 1.56) + rng.uniform(-0.012, 0.012)
    cues.append((tk, key_tick(rng.uniform(0.7, 1.0)), -33 + rng.uniform(-2, 1), rng.uniform(-0.15, 0.15)))
# "Post" turns blue
cues.append((2.22, tink(1568), -34, 0.15))
# highly trained check / industry lands on "yours"
cues.append((4.04, tink(1318), -35, -0.1))
cues.append((6.00, tink(1760), -36, 0.2))
# odometer micro ticks 0 -> 8 (ease-out timing mirrors the roll)
for d in range(1, 9):
    p = d / 8
    tt = 7.28 - np.log2(1 - p * 0.999) / 10 * 0.78
    cues.append((min(tt, 8.06), micro_click(), -36 - d * 0.4, 0.05))
cues.append((9.33, tink(1318), -34, 0.1))  # all in
# strikes through "fees" / "contracts"
cues.append((10.36, pen_scrape(0.3), -37, -0.3))
cues.append((11.06, pen_scrape(0.34), -37, 0.3))
# hello -> hola swap
cues.append((12.42, tink(1175), -38, 0.0))
# dial arc
cues.append((13.62, air(0.66, 1500, 5000, 0.3), -42, 0.4))
# section breath at the cut
cues.append((17.36, breath_swell(0.66), -38, 0.0))
# checklist ticks (rising, gentle)
for t0, f in [(19.38, 1175), (19.84, 1318), (21.40, 1568)]:
    cues.append((t0, tink(f), -35, -0.35))
# CTA: cursor click, booking selection
cues.append((22.93, mouse_click(), -31, 0.1))
cues.append((23.92, tink(1568), -35, 0.0))

for t0, sig, g, pan in cues:
    place(sig, t0, g, pan)

out = np.stack([L, R], 1)[: int(SR * DUR)]
sf.write("build/audio/sfx.wav", out.astype(np.float32), SR)
json.dump([[round(c[0], 3), c[2]] for c in cues], open("build/audio/cues.json", "w"))
print("cues", len(cues), "peak dBFS", round(20 * np.log10(np.max(np.abs(out)) + 1e-9), 1))

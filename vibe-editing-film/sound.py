"""Sound: everything synthesized with numpy + scipy. No samples, no words.

Reads every event from timeline.py and lands each hit on its frame.
    python sound.py  ->  build/sound.wav (48 kHz stereo, 12.0 s) + loudness check
"""
import json
import pathlib

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d
from scipy.signal import butter, sosfilt

import timeline as TL

SR = 48000
N = int(TL.DUR * SR)
rng = np.random.default_rng(7)
mix_bed = np.zeros((N, 2))   # music bed: ducked by the kick
mix_drm = np.zeros((N, 2))   # drums
mix_fx = np.zeros((N, 2))    # sound effects


def hz(note):
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    n = names[note[0]] + (1 if "#" in note else 0)
    octave = int(note[-1])
    return 440.0 * 2 ** ((n + 12 * (octave + 1) - 69) / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, a=0.005, d=None, curve=6.0):
    t = tt(dur)
    e = np.minimum(1, t / max(a, 1e-4))
    if d is not None:
        e *= np.exp(-t * curve / d)
    return e


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def sweep(f0, f1, dur, shape="exp"):
    t = tt(dur)
    f = f0 * (f1 / f0) ** (t / dur) if shape == "exp" else f0 + (f1 - f0) * t / dur
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def layer(*sigs):
    """Sum signals of different lengths, aligned at the start."""
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs:
        out[: len(x)] += x
    return out


def put(bus, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or len(sig) == 0:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[i:i + len(sig), 0] += sig * l * 1.414
    bus[i:i + len(sig), 1] += sig * r * 1.414


# ------------------------------------------------------------------ drums --
def kick():
    d = 0.42
    return layer(sweep(150, 42, d) * env(d, 0.001, d, 5), 0.3 * filt(noise(0.01), "highpass", 2000))


def snare():
    d = 0.22
    body = np.sin(2 * np.pi * 190 * tt(d)) * env(d, 0.001, d, 9)
    return 0.5 * body + 0.6 * filt(noise(d), "bandpass", [1500, 7000]) * env(d, 0.001, d, 7)


def hat(open_=False):
    d = 0.18 if open_ else 0.05
    return filt(noise(d), "highpass", 7500) * env(d, 0.001, d, 6)


# ------------------------------------------------------------------ music --
CHORDS = {  # bar start -> (bass root, chord tones)
    2.0: ("F2", ["F4", "A4", "C5", "E5"]),
    4.0: ("G2", ["G4", "B4", "D5", "F5"]),
    6.0: ("A2", ["A4", "C5", "E5", "G5"]),
    8.0: ("C3", ["C5", "E5", "G5", "B5"]),
}


def pad(freqs, dur, gain=0.08):
    t = tt(dur)
    x = sum(np.sin(2 * np.pi * f * t * (1 + dt)) for f in freqs for dt in (-0.003, 0.003))
    e = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4)
    return filt(x, "lowpass", 1800) * e * gain


def fm_key(f, dur=0.35):
    t = tt(dur)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 14)
    return np.sin(2 * np.pi * f * t + mod) * env(dur, 0.002, dur, 6)


def bass(f, dur):
    t = tt(dur)
    glide = f * (1 + 0.5 * np.exp(-t * 40))
    x = np.sin(2 * np.pi * np.cumsum(glide) / SR)
    x = np.tanh(2.2 * x) * env(dur, 0.004, dur, 3)
    return filt(x, "lowpass", 700)


def brass(freqs, dur=1.6):
    t = tt(dur)
    x = sum(2 * ((f * t * (1 + dt)) % 1) - 1 for f in freqs for dt in (-0.004, 0, 0.004))
    e = np.minimum(1, t / 0.03) * (0.55 + 0.45 * np.exp(-t * 6)) * np.minimum(1, (dur - t) / 0.6)
    return filt(x, "lowpass", 2600) * e * 0.12


def music():
    beat = TL.BEAT
    pop = TL.BRO["pop"]
    vibe = TL.T["vibe"]
    # intro: soft pad and ticking hats
    put(mix_bed, pad([hz("F3"), hz("A3"), hz("C4"), hz("E4")], pop + 0.3, 0.018), 0)
    for k in range(int(pop / (beat / 2))):
        put(mix_drm, hat(), k * beat / 2, 0.05 if k % 2 else 0.08, 0.3)
    # the drop
    for b0, (root, tones) in CHORDS.items():
        put(mix_bed, pad([hz(n) / 2 for n in tones], 2.05, 0.022), b0)
        for k in range(4):
            bt = b0 + k * beat
            if k in (0, 2):
                put(mix_drm, kick(), bt, 0.95)
            if k == 1 and b0 != 8.0:
                put(mix_drm, kick(), bt + beat / 2, 0.7)
            if k in (1, 3):
                put(mix_drm, snare(), bt, 0.55, -0.1)
            for hh in range(2):
                put(mix_drm, hat(open_=hh == 1 and k == 3), bt + hh * beat / 2, 0.16 if hh else 0.22, 0.35)
            put(mix_bed, fm_key(hz(tones[(k + 1) % 4])), bt + beat / 2, 0.12, -0.3 + 0.2 * k)
            put(mix_bed, bass(hz(root) * (1.5 if k == 3 else 1), beat * 0.9), bt, 0.36)
    # Play: C major brass stab, then the chord rings out
    put(mix_drm, kick(), vibe, 1.0)
    put(mix_drm, filt(noise(1.6), "highpass", 5000) * env(1.6, 0.002, 1.6, 4), vibe, 0.25)
    put(mix_bed, brass([hz("C4"), hz("E4"), hz("G4"), hz("C5")]), vibe, 1.0)
    put(mix_bed, pad([hz("C4"), hz("E4"), hz("G4"), hz("B4"), hz("C3")], TL.DUR - vibe, 0.03), vibe)


# -------------------------------------------------------------------- sfx --
def s_knock():
    d = 0.12
    tone = (np.sin(2 * np.pi * 1750 * tt(d)) * 0.5 + np.sin(2 * np.pi * 3100 * tt(d)) * 0.3) * env(d, 0.0005, d, 9)
    return layer(tone, 0.4 * filt(noise(0.02), "bandpass", [1500, 5000]))


def s_peel():
    d = 0.4
    x = filt(noise(d), "bandpass", [2000, 6000]) * (np.abs(np.sin(2 * np.pi * 37 * tt(d))) ** 3)
    return x * np.minimum(1, tt(d) / 0.3) * env(d, 0.001, d, 2)


def s_riser(dur):
    return sweep(200, 1600, dur) * np.minimum(1, tt(dur) / dur) ** 2 * 0.4 + \
        filt(noise(dur), "highpass", 3000) * (tt(dur) / dur) ** 2 * 0.3


def s_pop():
    d = 0.18
    pop = sweep(900, 180, d) * env(d, 0.001, d, 8)
    glass = sum(np.sin(2 * np.pi * f * tt(0.7)) * np.exp(-tt(0.7) * rng.uniform(6, 14)) * rng.uniform(0.05, 0.15)
                for f in rng.uniform(2500, 8000, 24))
    crash = 0.5 * filt(noise(0.5), "highpass", 4000) * env(0.5, 0.001, 0.5, 6)
    sub = np.sin(2 * np.pi * 48 * tt(1.0)) * env(1.0, 0.003, 1.0, 3)
    return layer(pop, glass, crash, sub * 0.9)


def s_boing(big):
    d = 0.3 if big else 0.2
    t = tt(d)
    f = (180 if big else 260) * (1 + 1.6 * t / d) * (1 + 0.08 * np.sin(2 * np.pi * 28 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.003, d, 4)


def s_pomf():
    d = 0.16
    return filt(noise(d), "lowpass", 380) * env(d, 0.002, d, 8) * 1.4 + np.sin(2 * np.pi * 90 * tt(d)) * env(d, 0.001, d, 10) * 0.5


def s_whoosh(dur):
    dur = max(dur, 0.2)
    t = tt(dur)
    x = noise(dur)
    lo = filt(x, "bandpass", [300, 1200])
    hi = filt(x, "bandpass", [1500, 5000])
    shape = np.sin(np.pi * t / dur) ** 2
    mixk = t / dur
    return (lo * (1 - mixk) + hi * mixk) * shape * 0.6


def s_click():
    d = 0.05
    return filt(noise(d), "bandpass", [1500, 6000]) * env(d, 0.0005, d, 18) + np.sin(2 * np.pi * 2200 * tt(d)) * env(d, 0.0005, d, 25) * 0.6


def s_blip(f0=1200):
    d = 0.09
    return sweep(f0, f0 * 1.5, d) * env(d, 0.002, d, 5) * 0.5


def s_snap(i):
    d = 0.07
    return sweep(1400 + i * 200, 500, d) * env(d, 0.001, d, 6) * 0.7


def s_tick():
    d = 0.025
    return filt(noise(d), "highpass", 3000) * env(d, 0.0005, d, 10)


def s_swish():
    return s_whoosh(0.35) * 1.2


def s_sparkle():
    out = np.zeros(int(SR * 0.8))
    for k in range(10):
        f = rng.uniform(3000, 7000)
        s = np.sin(2 * np.pi * f * tt(0.25)) * env(0.25, 0.001, 0.25, 6) * 0.15
        i = int(k * 0.05 * SR)
        out[i:i + len(s)] += s
    return out


def s_thwack():
    d = 0.2
    return np.tanh(3 * (filt(noise(d), "lowpass", 1800) * env(d, 0.0005, d, 12) + sweep(220, 70, d) * env(d, 0.001, d, 9)))


def s_shimmer():
    out = np.zeros(int(SR * 1.4))
    for k, n in enumerate(["C6", "E6", "G6", "C7", "E7", "G7"]):
        s = fm_key(hz(n), 1.0) * 0.18
        i = int(k * 0.04 * SR)
        out[i:i + len(s)] += s
    out += filt(noise(len(out) / SR), "highpass", 6000) * np.exp(-tt(len(out) / SR) * 3) * 0.12
    return out


def s_ding(note):
    d = 0.9
    t = tt(d)
    f = hz(note)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 8)
    return x * env(d, 0.001, d, 5) * 0.45


def s_rewind(dur):
    t = tt(dur)
    f = 2400 - 1600 * t / dur + 500 * np.sin(2 * np.pi * 18 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 * np.sin(np.pi * t / dur) ** 0.5


def s_skate(dur):
    t = tt(dur)
    x = filt(noise(dur), "bandpass", [200, 900]) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
    return x * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.1) * 0.45


def s_scrub():
    d = 0.03
    return np.sin(2 * np.pi * 3200 * tt(d)) * env(d, 0.0005, d, 12) * 0.35


def s_keytap():
    d = 0.035
    return filt(noise(d), "bandpass", [2000, 7000]) * env(d, 0.0005, d, 14) * 0.5


def s_powerdown():
    d = 0.4
    t = tt(d)
    return (sweep(900, 60, d) * 0.5 + filt(noise(d), "lowpass", 1200) * 0.3) * np.exp(-t * 5) * np.minimum(1, t / 0.005)


def s_boom():
    d = 1.0
    return (np.sin(2 * np.pi * 45 * tt(d)) * 0.9 + filt(noise(d), "lowpass", 300) * 0.5) * env(d, 0.005, d, 4)


def s_yay():
    out = np.zeros(int(SR * 0.7))
    for k, (a, b) in enumerate([(900, 1500), (1100, 1900), (1300, 2300)]):
        s = sweep(a, b, 0.14) * env(0.14, 0.003, 0.14, 3) * 0.35
        i = int(k * 0.11 * SR)
        out[i:i + len(s)] += s
    return out


def s_select():
    return s_blip(1500)


def sfx():
    pans = {"cut": 0.4, "captions": 0.5, "mg": 0.4}
    for e in TL.events():
        k, t = e["kind"], e["t"]
        if k == "keytap":
            put(mix_fx, s_keytap(), t, 0.35, 0.5)
        elif k == "knock":
            put(mix_fx, s_knock(), t, 0.7)
        elif k == "peel":
            put(mix_fx, s_peel(), t, 0.6)
        elif k == "riser":
            put(mix_fx, s_riser(e["dur"]), t, 0.5)
        elif k == "pop":
            put(mix_fx, s_pop(), t, 0.9)
        elif k == "boing":
            put(mix_fx, s_boing(e["big"]), t, 0.35)
        elif k == "pomf":
            put(mix_fx, s_pomf(), t, 0.6)
        elif k == "whoosh":
            put(mix_fx, s_whoosh(e["dur"]), t, 0.55)
        elif k == "click":
            put(mix_fx, s_click(), t, 0.6)
        elif k == "blip":
            put(mix_fx, s_blip(1100 + 200 * ["cut", "captions", "mg"].index(e["tool"])), t, 0.5, pans[e["tool"]])
        elif k == "snap":
            put(mix_fx, s_snap(e["i"]), t, 0.5, -0.2 + 0.15 * e["i"])
        elif k == "tick":
            put(mix_fx, s_tick(), t, 0.3, 0.3)
        elif k == "swish":
            put(mix_fx, s_swish(), t, 0.5)
        elif k == "sparkle":
            put(mix_fx, s_sparkle(), t, 0.6, 0.2)
        elif k == "select":
            put(mix_fx, s_select(), t, 0.5, -0.4)
        elif k == "thwack":
            put(mix_fx, s_thwack(), t, 0.6)
        elif k == "shimmer":
            put(mix_fx, s_shimmer(), t, 0.7)
        elif k == "ding":
            put(mix_fx, s_ding(e["note"]), t, 0.7)
        elif k == "rewind":
            put(mix_fx, s_rewind(e["dur"]), t, 0.6)
        elif k == "skate":
            put(mix_fx, s_skate(e["dur"]), t, 0.6)
        elif k == "scrub":
            put(mix_fx, s_scrub(), t, 0.5, 0.2)
        elif k == "brass":
            pass                    # part of the music
        elif k == "powerdown":
            put(mix_fx, s_powerdown(), t, 0.45, {"timeline": 0, "topbar": 0, "media": -0.6, "copilot": 0.6}[e["panel"]])
        elif k == "boom":
            put(mix_fx, s_boom(), t, 0.7)
        elif k == "yay":
            put(mix_fx, s_yay(), t, 0.6, 0.4)
        else:
            raise ValueError(f"no sound for event {k}")


# ----------------------------------------------------------------- master --
def pump():
    """Kick-driven gain for the bed (the 'kick pump')."""
    g = np.ones(N)
    beat = TL.BEAT
    t = np.arange(N) / SR
    for b0 in CHORDS:
        for k in (0, 2):
            bt = b0 + k * beat
            m = t >= bt
            g[m] -= 0.55 * np.exp(-(t[m] - bt) * 9)
    return np.clip(g, 0.3, 1)[:, None]


def compress(x, thr_db=-16, ratio=3.0, att=0.005, rel=0.12):
    lvl = np.abs(x).max(axis=1)
    a, r = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    envl = np.zeros(N)
    e = 0.0
    for i, v in enumerate(lvl):     # simple peak follower
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        envl[i] = e
    db = 20 * np.log10(envl + 1e-9)
    gr = np.minimum(0, (thr_db - db) * (1 - 1 / ratio))
    return x * (10 ** (gr / 20))[:, None]


def limit(x, ceil_db=-1.0):
    ceil = 10 ** (ceil_db / 20)
    peak = maximum_filter1d(np.abs(x).max(axis=1), size=int(0.004 * SR))
    g = np.minimum(1, ceil / (peak + 1e-9))
    g = np.minimum(g, np.convolve(g, np.ones(96) / 96, mode="same"))
    return np.clip(x * g[:, None], -ceil, ceil)


def main():
    music()
    sfx()
    x = mix_bed * pump() + mix_drm + mix_fx * 0.9
    x = filt(x.T, "highpass", 25).T
    x = compress(x)
    x *= 10 ** (-12 / 20) / (np.sqrt(np.mean(x[int(2 * SR):int(10 * SR)] ** 2)) + 1e-9)
    t0, t1 = TL.T["fade"]
    t = np.arange(N) / SR
    x *= np.clip((t1 - t) / (t1 - t0), 0, 1)[:, None] ** 1.5
    x = limit(x)
    out = pathlib.Path(__file__).parent / "build" / "sound.wav"
    wavfile.write(out, SR, (x * 32767).astype(np.int16))
    print("loudness per half second (RMS dBFS):")
    half = SR // 2
    vals = [float(20 * np.log10(np.sqrt(np.mean(x[i:i + half] ** 2)) + 1e-9)) for i in range(0, N, half)]
    print("  " + "  ".join(f"{v:5.1f}" for v in vals))
    print(f"peak {20 * np.log10(np.abs(x).max()):.2f} dBFS -> {out}")
    summary = (f"{vals[0]:.0f} dB in the first half second, {min(vals[1:4]):.0f} to {max(vals[1:4]):.0f} dB through the knocks and the peel, "
               f"then {min(vals[4:23]):.0f} to {max(vals[4:23]):.0f} dB from the pop to the end, and {vals[-1]:.0f} dB in the fade. "
               "The drop lands where the picture explodes and nothing pokes out above the groove.")
    (out.parent / "loudness.json").write_text(json.dumps({"half_seconds": vals, "summary": summary}))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate Vibe Editor's sound-effect library procedurally.

Every sound is synthesised from scratch with numpy, so the library is 100% ours
and safe to ship and use commercially. Output: 48 kHz stereo 16-bit WAV files.

Usage: python3 make_sfx.py <out_dir>
"""
import json
import os
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=0.1, curve=4.0):
    """Attack/exponential-release envelope over n samples."""
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    x = np.linspace(0, 1, n - na)
    e[na:] = np.exp(-curve * x / max(r, 1e-3) * (len(x) / SR))
    return e


def lowpass(x, cutoff):
    """One-pole lowpass; cutoff may be an array (sweeps)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def bandnoise(d, lo, hi):
    n = rng.standard_normal(int(SR * d))
    return lowpass(highpass(n, lo), hi)


def norm(x, peak=0.89):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def stereo(x, width=0.0):
    if width <= 0:
        return np.stack([x, x], axis=1)
    d = int(width * SR / 1000)
    r = np.concatenate([np.zeros(d), x])[: len(x)]
    return np.stack([x, r], axis=1)


def fade(x, fin=0.003, fout=0.01):
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def tone(freq, d, kind="sine"):
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(freq, (int(SR * d),))) / SR
    if kind == "sine":
        return np.sin(ph)
    if kind == "tri":
        return 2 / np.pi * np.arcsin(np.sin(ph))
    if kind == "square":
        return np.sign(np.sin(ph)) * 0.6
    raise ValueError(kind)


# ---------------------------------------------------------------- sounds

def whoosh(d=0.55, up=True):
    n = int(SR * d)
    x = np.linspace(0, 1, n)
    cut = 300 + 5200 * (x if up else 1 - x) ** 1.5
    s = lowpass(rng.standard_normal(n), cut)
    e = np.sin(np.pi * x) ** 1.6
    return fade(norm(highpass(s * e, 120)))


def swoosh_fast():
    return whoosh(0.28, True)


def pop():
    d = 0.09
    f = 900 * np.exp(-t(d) * 40) + 220
    s = tone(f, d) * env(int(SR * d), 0.001, 0.05, 3)
    return fade(norm(s))


def click():
    d = 0.03
    s = bandnoise(d, 2000, 9000) * env(int(SR * d), 0.0005, 0.01, 2)
    s += 0.5 * tone(2400, d) * env(int(SR * d), 0.0005, 0.006, 2)
    return fade(norm(s), 0.0005, 0.004)


def mouse_click():
    a = click()
    gap = np.zeros(int(0.07 * SR))
    b = click() * 0.6
    return np.concatenate([a, gap, b])


def ding():
    d = 1.2
    s = sum(w * tone(f, d) * env(int(SR * d), 0.002, r, 1.2)
            for f, w, r in [(1318.5, 1.0, 0.9), (2637, 0.35, 0.5), (3955, 0.15, 0.3)])
    return fade(norm(s))


def notification():
    a = tone(880, 0.12) * env(int(SR * 0.12), 0.003, 0.1, 2)
    b = tone(1318.5, 0.35) * env(int(SR * 0.35), 0.003, 0.3, 1.5)
    return fade(norm(np.concatenate([a, b])))


def success():
    notes = [523.25, 659.25, 783.99, 1046.5]
    out = []
    for i, f in enumerate(notes):
        d = 0.11 if i < 3 else 0.6
        out.append(tone(f, d, "tri") * env(int(SR * d), 0.003, d * 0.8, 1.6))
    return fade(norm(np.concatenate(out)))


def error_buzz():
    d = 0.35
    s = tone(140, d, "square") * env(int(SR * d), 0.003, 0.3, 1.0)
    s = lowpass(s, 2500)
    return fade(norm(np.concatenate([s[: int(0.15 * SR)], np.zeros(int(0.05 * SR)), s])))


def riser(d=1.6):
    n = int(SR * d)
    x = np.linspace(0, 1, n)
    f = 180 * (2 ** (x * 3.2))
    s = tone(f, d, "tri") * 0.5 + 0.5 * lowpass(rng.standard_normal(n), 400 + 8000 * x ** 2)
    s *= x ** 2
    return fade(norm(s), 0.01, 0.02)


def impact():
    d = 1.3
    n = int(SR * d)
    f = 30 + 90 * np.exp(-t(d) * 18)
    body = tone(f, d) * env(n, 0.001, 0.9, 1.2)
    crack = bandnoise(d, 200, 3000) * env(n, 0.0005, 0.08, 2)
    return fade(norm(body + 0.6 * crack))


def bass_drop():
    d = 1.5
    f = 110 * np.exp(-t(d) * 2.2) + 35
    s = tone(f, d) * env(int(SR * d), 0.002, 1.2, 0.9)
    return fade(norm(np.tanh(s * 2.5)))


def typing(d=1.6):
    out = np.zeros(int(SR * d))
    pos = 0.0
    while pos < d - 0.05:
        k = click() * rng.uniform(0.35, 0.8)
        i = int(pos * SR)
        out[i:i + len(k)] += k[: len(out) - i]
        pos += rng.uniform(0.06, 0.16)
    return fade(norm(out))


def shutter():
    a = bandnoise(0.05, 1500, 8000) * env(int(SR * 0.05), 0.0005, 0.02, 2)
    gap = np.zeros(int(0.06 * SR))
    b = bandnoise(0.08, 800, 6000) * env(int(SR * 0.08), 0.0005, 0.04, 2)
    return fade(norm(np.concatenate([a, gap, b])))


def glitch():
    d = 0.45
    n = int(SR * d)
    s = rng.standard_normal(n)
    hold = rng.integers(20, 200)
    s = np.repeat(s[::hold], hold)[:n]
    s = np.round(s * 3) / 3
    gate = (np.sin(2 * np.pi * 23 * t(d)) > 0).astype(float)
    s *= 0.4 + 0.6 * gate
    s += 0.5 * tone(1000 + 600 * np.sign(np.sin(2 * np.pi * 9 * t(d))), d, "square")
    return fade(norm(lowpass(s, 7000)))


def bubble():
    d = 0.18
    f = 500 + 1800 * (t(d) / d) ** 1.5
    s = tone(f, d) * env(int(SR * d), 0.002, 0.12, 2)
    return fade(norm(s))


def tick():
    d = 0.04
    s = tone(3200, d) * env(int(SR * d), 0.0005, 0.015, 2)
    return fade(norm(s))


def tick_tock():
    a, b = tick(), tick() * 0.8
    b = fade(norm(tone(2200, 0.04) * env(int(SR * 0.04), 0.0005, 0.015, 2)))
    g = np.zeros(int(0.46 * SR))
    return np.concatenate([a, g, b, g, a, g, b])


def cash():
    bell = ding() * 0.7
    ch = bandnoise(0.25, 2000, 10000) * env(int(SR * 0.25), 0.001, 0.15, 2) * 0.6
    out = np.zeros(max(len(bell) + int(0.08 * SR), len(ch)))
    out[: len(ch)] += ch
    out[int(0.08 * SR): int(0.08 * SR) + len(bell)] += bell
    return fade(norm(out))


def heartbeat():
    def thump(a):
        d = 0.18
        f = 55 + 40 * np.exp(-t(d) * 30)
        return tone(f, d) * env(int(SR * d), 0.002, 0.12, 1.5) * a
    g1 = np.zeros(int(0.12 * SR))
    g2 = np.zeros(int(0.45 * SR))
    one = np.concatenate([thump(1), g1, thump(0.7), g2])
    return fade(norm(np.tanh(2 * np.concatenate([one, one]))))


def swipe():
    return whoosh(0.22, False)


def sparkle():
    d = 0.9
    out = np.zeros(int(SR * d))
    for i in range(9):
        f = rng.uniform(2500, 6000)
        st = int(rng.uniform(0, 0.55) * SR)
        g = tone(f, 0.3) * env(int(SR * 0.3), 0.001, 0.15, 2) * rng.uniform(0.3, 1)
        out[st:st + len(g)] += g[: len(out) - st]
    return fade(norm(out))


def boing():
    d = 0.5
    f = 220 + 120 * np.sin(2 * np.pi * 9 * t(d)) * np.exp(-t(d) * 4)
    s = tone(f, d) * env(int(SR * d), 0.002, 0.4, 1.5)
    return fade(norm(s))


def record_stop():
    d = 0.6
    f = 600 * (1 - t(d) / d) ** 2 + 40
    s = tone(f, d, "tri") * env(int(SR * d), 0.002, 0.55, 0.6)
    return fade(norm(s))


def camera_zoom():
    d = 0.35
    f = 300 + 900 * (t(d) / d)
    s = 0.6 * tone(f, d, "square") * env(int(SR * d), 0.01, 0.3, 1)
    s = lowpass(s, 2500) + 0.3 * bandnoise(d, 500, 4000)
    return fade(norm(s))


SOUNDS = {
    "whoosh": (lambda: whoosh(), "Airy whoosh for transitions and title entrances"),
    "whoosh-fast": (swoosh_fast, "Short, quick swoosh for snappy cuts"),
    "swipe": (swipe, "Downward swipe, good for slides/cards leaving"),
    "pop": (pop, "Bubbly pop for captions, stickers and cards appearing"),
    "bubble": (bubble, "Rising bubble blip for playful pop-ups"),
    "click": (click, "Single crisp click"),
    "mouse-click": (mouse_click, "Mouse click (down/up) for UI and cursor moments"),
    "typing": (lambda: typing(), "Keyboard typing burst for typed text / prompts"),
    "ding": (ding, "Bright bell ding for a key point or correct answer"),
    "notification": (notification, "Phone notification chime for DM / alert moments"),
    "success": (success, "Rising 4-note success jingle"),
    "error": (error_buzz, "Wrong-answer buzzer for myths / mistakes"),
    "riser": (lambda: riser(), "Tension riser that builds into a reveal"),
    "impact": (impact, "Cinematic hit/boom for big statements"),
    "bass-drop": (bass_drop, "Deep bass drop for dramatic reveals"),
    "shutter": (shutter, "Camera shutter for freeze-frames and photos"),
    "glitch": (glitch, "Digital glitch burst to pair with the glitch effect"),
    "tick": (tick, "Single clock tick"),
    "tick-tock": (tick_tock, "Clock tick-tock for countdowns / time pressure"),
    "cash": (cash, "Cash-register style ka-ching for money moments"),
    "heartbeat": (heartbeat, "Double heartbeat for suspense"),
    "sparkle": (sparkle, "Magic sparkle shimmer for reveals and 'aha' moments"),
    "boing": (boing, "Cartoon boing for funny moments"),
    "record-stop": (record_stop, "Tape-stop / record-stop for 'wait, what?' moments"),
    "zoom": (camera_zoom, "Mechanical zoom sound to pair with punch-in zooms"),
}


# ---------------------------------------------------------------- v2 sounds

def tap():
    d = 0.05
    s = tone(1800 * np.exp(-t(d) * 30) + 600, d) * env(int(SR * d), 0.0005, 0.02, 2)
    return fade(norm(s), 0.0005, 0.004)


def toggle():
    a = tone(1200, 0.04) * env(int(SR * 0.04), 0.0005, 0.02, 2)
    b = tone(1600, 0.05) * env(int(SR * 0.05), 0.0005, 0.03, 2)
    return fade(norm(np.concatenate([a, np.zeros(int(0.03 * SR)), b])))


def swish():
    return whoosh(0.4, True) * 0.8


def whoosh_long():
    return whoosh(1.1, True)


def reverse_whoosh():
    x = whoosh(0.9, True)
    return fade(norm(x[::-1] * np.linspace(0.3, 1, len(x))))


def coin():
    a = tone(988, 0.08, "square") * env(int(SR * 0.08), 0.001, 0.07, 1)
    b = tone(1319, 0.35, "square") * env(int(SR * 0.35), 0.001, 0.3, 1.4)
    return fade(norm(lowpass(np.concatenate([a, b]), 6000)))


def level_up():
    out = []
    for f in [392, 523.25, 659.25, 783.99, 1046.5, 1318.5]:
        out.append(tone(f, 0.07, "square") * env(int(SR * 0.07), 0.001, 0.06, 1))
    return fade(norm(lowpass(np.concatenate(out), 5000)))


def alarm():
    seg = np.concatenate([tone(880, 0.12, "square"), tone(660, 0.12, "square")])
    s = np.tile(seg, 3) * 0.6
    return fade(norm(lowpass(s, 4000)))


def kick():
    d = 0.4
    f = 45 + 120 * np.exp(-t(d) * 35)
    s = tone(f, d) * env(int(SR * d), 0.001, 0.3, 1.2)
    return fade(norm(np.tanh(s * 2)))


def clap():
    out = np.zeros(int(SR * 0.25))
    for i, dly in enumerate([0, 0.012, 0.024]):
        b = bandnoise(0.2, 900, 5000) * env(int(SR * 0.2), 0.0005, 0.06 if i < 2 else 0.12, 2)
        st = int(dly * SR)
        out[st:st + len(b)] += b[: len(out) - st]
    return fade(norm(out))


def snap():
    s = bandnoise(0.06, 2500, 12000) * env(int(SR * 0.06), 0.0003, 0.015, 2)
    return fade(norm(s), 0.0003, 0.005)


def laser():
    d = 0.35
    f = 2400 * np.exp(-t(d) * 9) + 200
    s = tone(f, d, "square") * env(int(SR * d), 0.001, 0.3, 1)
    return fade(norm(lowpass(s, 7000)))


def beep():
    d = 0.15
    return fade(norm(tone(1000, d) * env(int(SR * d), 0.003, 0.13, 0.5)))


def countdown_beep():
    a = beep()
    g = np.zeros(int(0.85 * SR))
    hi = fade(norm(tone(1500, 0.4) * env(int(SR * 0.4), 0.003, 0.38, 0.5)))
    return np.concatenate([a, g, a, g, a, g, hi])


def enter_key():
    a = click() * 0.8
    b = bandnoise(0.08, 300, 2500) * env(int(SR * 0.08), 0.001, 0.04, 2) * 0.6
    out = np.zeros(len(a) + len(b))
    out[: len(a)] += a
    out[len(a) // 2: len(a) // 2 + len(b)] += b
    return fade(norm(out))


def paper():
    d = 0.6
    n = int(SR * d)
    s = bandnoise(d, 1500, 9000) * (np.abs(np.sin(2 * np.pi * 7 * t(d))) ** 3 + 0.2) * np.sin(np.pi * np.linspace(0, 1, n))
    return fade(norm(s))


def camera_flash():
    a = shutter()
    d = 0.6
    w = tone(3000 + 2000 * t(d) / d, d) * np.linspace(0.25, 0, int(SR * d))
    out = np.zeros(len(a) + len(w))
    out[: len(a)] += a
    out[len(a) // 3: len(a) // 3 + len(w)] += w
    return fade(norm(out))


def magic():
    d = 1.4
    out = np.zeros(int(SR * d))
    for i, f in enumerate([1046.5, 1318.5, 1568, 2093, 2637]):
        g = tone(f, 1.0) * env(int(SR * 1.0), 0.002, 0.8, 1.5) * 0.5
        st = int(i * 0.07 * SR)
        out[st:st + len(g)] += g[: len(out) - st]
    return fade(norm(out))


def bubble_pop():
    a = bubble()
    b = pop()
    return fade(norm(np.concatenate([a, b * 0.8])))


def transition_hit():
    d = 0.7
    body = tone(60 + 60 * np.exp(-t(d) * 20), d) * env(int(SR * d), 0.001, 0.5, 1.4)
    noise = bandnoise(d, 300, 6000) * env(int(SR * d), 0.001, 0.15, 2) * 0.5
    return fade(norm(body + noise))


def ding_dong():
    a = tone(659.25, 0.5) * env(int(SR * 0.5), 0.003, 0.45, 1)
    b = tone(523.25, 0.8) * env(int(SR * 0.8), 0.003, 0.75, 1)
    return fade(norm(np.concatenate([a, b])))


def message_sent():
    d = 0.25
    f = 600 + 1400 * (t(d) / d) ** 1.4
    return fade(norm(tone(f, d) * env(int(SR * d), 0.003, 0.2, 1.5)))


def heart_pop():
    a = pop()
    b = tone(1568, 0.25) * env(int(SR * 0.25), 0.002, 0.2, 2) * 0.6
    return fade(norm(np.concatenate([a, b])))


def glitch_short():
    return glitch()[: int(0.2 * SR)]


def drum_roll():
    d = 1.4
    out = np.zeros(int(SR * d))
    pos = 0.0
    k = 0
    while pos < d - 0.05:
        b = bandnoise(0.06, 200, 3000) * env(int(SR * 0.06), 0.0005, 0.03, 2) * (0.4 + 0.6 * pos / d)
        st = int(pos * SR)
        out[st:st + len(b)] += b[: len(out) - st]
        pos += max(0.025, 0.07 - k * 0.002)
        k += 1
    return fade(norm(out))


def swoosh_up():
    d = 0.5
    f = 300 * 2 ** (t(d) / d * 3)
    s = 0.5 * tone(f, d, "tri") * np.sin(np.pi * np.linspace(0, 1, int(SR * d))) + 0.5 * whoosh(d, True)[: int(SR * d)]
    return fade(norm(s))


SOUNDS.update({
    "tap": (tap, "Soft UI tap"),
    "toggle": (toggle, "UI switch toggle"),
    "swish": (swish, "Medium swish for slides and wipes"),
    "whoosh-long": (whoosh_long, "Long cinematic whoosh"),
    "reverse-whoosh": (reverse_whoosh, "Reverse suck-in whoosh before a reveal"),
    "coin": (coin, "8-bit coin pickup"),
    "level-up": (level_up, "Game level-up arpeggio"),
    "alarm": (alarm, "Alarm / warning siren"),
    "kick": (kick, "Punchy kick drum hit"),
    "clap": (clap, "Hand clap"),
    "snap": (snap, "Finger snap"),
    "laser": (laser, "Sci-fi laser zap"),
    "beep": (beep, "Single beep"),
    "countdown-beep": (countdown_beep, "3-2-1 countdown beeps"),
    "enter-key": (enter_key, "Keyboard enter / send"),
    "paper": (paper, "Paper rustle for notes and paper tears"),
    "camera-flash": (camera_flash, "Camera flash with charge whine"),
    "magic": (magic, "Magical chime cascade"),
    "bubble-pop": (bubble_pop, "Bubble + pop"),
    "transition-hit": (transition_hit, "Short punchy transition hit"),
    "ding-dong": (ding_dong, "Doorbell ding-dong"),
    "message-sent": (message_sent, "Message sent swoop"),
    "heart-pop": (heart_pop, "Like / heart pop"),
    "drum-roll": (drum_roll, "Accelerating drum roll for reveals"),
    "swoosh-up": (swoosh_up, "Rising swoosh for titles flying up"),
})


def write_wav(path, x):
    st = stereo(x, 0.4)
    data = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "sfx"
    os.makedirs(out, exist_ok=True)
    catalog = {}
    for name, (fn, desc) in SOUNDS.items():
        x = fn()
        write_wav(os.path.join(out, f"{name}.wav"), x)
        catalog[name] = {"file": f"{name}.wav", "seconds": round(len(x) / SR, 2), "desc": desc}
        print(f"{name:14s} {len(x) / SR:5.2f}s")
    with open(os.path.join(out, "sfx.json"), "w") as f:
        json.dump(catalog, f, indent=1)


if __name__ == "__main__":
    main()

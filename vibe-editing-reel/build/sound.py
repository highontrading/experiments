"""Sound design for the reel: voice (already cut + 1.1x) + synthesized SFX + ducked ambient pad.
usage: python3 sound.py VOICE_WAV(48k) edl.json OUT_WAV"""
import sys, json, numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt
from scipy.io import wavfile
SR = 48000
voice_path, edl, out = sys.argv[1:4]
e = json.load(open(edl)); W = {i: w['os'] for i, w in enumerate(e['words'])}
sr, v = wavfile.read(voice_path); v = v.astype(np.float32) / 32768
if v.ndim > 1: v = v.mean(1)
N = int(e['duration'] * SR) + SR // 2
voice = np.zeros(N, np.float32); voice[:min(N, len(v))] = v[:N]
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def put(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); sig = sig[:max(0, N - i)]
    if i < 0 or len(sig) == 0: return
    L[i:i + len(sig)] += sig * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i + len(sig)] += sig * g * np.sqrt((1 + pan) / 2) * 1.414
def env(n, a, d, shape=2.0):
    x = np.arange(n) / SR; at = np.clip(x / a, 0, 1); de = np.clip(1 - (x - a) / d, 0, 1) ** shape
    return np.where(x < a, at, de)
def whoosh(dur=.42, lo=300, hi=4500, peak=.55):
    n = int(dur * SR); x = rng.standard_normal(n)
    # sweep the band: blend of two filtered copies
    a = bp(x, lo, lo * 3); b = bp(x, hi / 3, hi); k = np.linspace(0, 1, n) ** 1.5
    y = a * (1 - k) + b * k; e_ = env(n, dur * peak, dur * (1 - peak), 2.2)
    return y * e_ / (np.abs(y).max() + 1e-9)
def boom(dur=.9, f0=90, f1=38):
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.2)
    click = lp(rng.standard_normal(n), 2500) * np.exp(-t * 60) * .6
    return (s + click) / 1.3
def tick(f=2600, dur=.025, g=1):
    n = int(dur * SR); t = np.arange(n) / SR
    return (bp(rng.standard_normal(n), f * .6, f * 1.4) * np.exp(-t * 260) + np.sin(2 * np.pi * f * .5 * t) * np.exp(-t * 400) * .4) * g
def zap(dur=.18, f=900):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * (f + 600 * np.exp(-t * 30)) * t)) * np.exp(-t * 22) * .35 + bp(rng.standard_normal(n), 2000, 7000) * np.exp(-t * 40) * .4
def shimmer(dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k, f in enumerate([2093, 2637, 3136, 4186, 5274]):
        y += np.sin(2 * np.pi * f * t + k) * np.exp(-((t - k * .06).clip(0)) * 5) * (t > k * .06)
    return y / 5
def riser(dur=.55):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    y = hp(x, 800) * (t / dur) ** 2.2
    s = np.sin(2 * np.pi * np.cumsum(200 + 1600 * (t / dur) ** 2) / SR) * (t / dur) ** 2 * .3
    return (y * .6 + s) / 1.2
def glitch(dur=.12):
    n = int(dur * SR); x = rng.standard_normal(n); y = np.round(x * 3) / 3
    gate = (np.sin(2 * np.pi * 37 * np.arange(n) / SR) > 0).astype(float)
    return bp(y * gate, 300, 6000) * .7
# --- transitions (cut points) ---
for c in e['cut_points']:
    put(whoosh(.36, 250, 5200, .7), c - .27, .16, pan=rng.uniform(-.4, .4))
for c, g in [(8.821, .34), (17.685, .34), (4.503, .22), (12.021, .2), (31.123, .2)]:
    put(whoosh(.5, 200, 6000, .75), c - .38, g)
# poster interludes
put(boom(.7, 120, 50), W[6] - .07, .45); put(whoosh(.3, 400, 7000, .6), W[6] - .25, .2)
put(boom(.6, 110, 55), 18.27, .35); put(zap(.1, 1400), 18.27, .12); put(zap(.1, 1400), 18.87, .12)
# typewriter "tracks my" + highlighter
for k in range(9): put(tick(3200, .02), 18.3 + k / 26, .22, pan=.2)
for k in range(4): put(whoosh(.09, 1500, 7000, .3), W[61] + k * .06, .07)
# ANY OF IT slam
hit = W[12] - .04
put(boom(1.2, 140, 34), hit, .9); put(bp(rng.standard_normal(int(.5 * SR)), 300, 5000) * env(int(.5 * SR), .002, .5, 4), hit, .5)
for k in range(14): put(tick(rng.uniform(1500, 5000), .02), hit + .15 + rng.uniform(0, .7), .12, pan=rng.uniform(-.7, .7))
# keyframes shatter
for k in range(6): put(tick(4200, .03), W[21] + .25 + k * .035, .16, pan=-.5 + k * .2)
put(glitch(.1), W[21] + .25, .12)
# neon glow: hum + zaps on colour changes
g0 = W[30] - .04; n = int((8.82 - g0) * SR); t = np.arange(n) / SR
hum = (np.sin(2 * np.pi * 120 * t) + .5 * np.sin(2 * np.pi * 240 * t) + .2 * np.sign(np.sin(2 * np.pi * 60 * t))) * .25
flick = np.ones(n); [flick.__setitem__(slice(int(a * SR), int((a + .033) * SR)), .1) for a in (0.033, .2, .3)]
put(hum * flick * env(n, .02, .1, .3), g0, .22)
for tz in (g0, 8.43, 8.62): put(zap(.16, 700), tz, .2)
# BIG AND BOLD thuds, soft dust whoosh
for i in (33, 34, 35): put(boom(.35, 160, 70), W[i] - .04, .3)
put(whoosh(.7, 2000, 9000, .2), 11.8, .12, pan=.5)
# Claude letters + code typing
for k in range(6): put(tick(1800 + k * 200, .03), W[41] + k * .035, .15)
put(shimmer(.6), W[41] + .22, .05)
for k in range(70): put(tick(rng.uniform(2200, 3600), .018), W[42] + .05 + k * .025 + rng.uniform(0, .01), .07, pan=-.4)
put(boom(.4, 100, 50), 13.3, .2)
# CUTS / motions / captions
put(zap(.08, 2400), W[49] - .04, .2); put(boom(.3, 180, 60), W[49] - .04, .35)
put(whoosh(.3, 300, 6000, .4), W[50] - .1, .28, pan=-.3)
for k in range(8): put(tick(5000, .015), W[51] + .1 + k * .055, .06)
# head. thud, face HUD lock beeps, frame counter ticks
put(boom(.45, 130, 55), W[57] - .04, .25)
for k in range(3): put(np.sin(2 * np.pi * 1760 * np.arange(int(.05 * SR)) / SR) * env(int(.05 * SR), .002, .048), 17.72 + k * .07, .06)
for k in range(24): put(tick(6000, .01), 18.94 + k / 30 * 1.0, .03)
# instagram rail pops + glitch exit
for k in range(4): put(tick(900 + k * 150, .05), W[67] + k * .08, .14, pan=.7)
put(glitch(.12), 22.12, .2)
# never: glitch + red sting
put(glitch(.08), W[71] - .04, .16); put(boom(.5, 90, 45), W[71] - .04, .3)
# masking: soft ticks for path letters (sparse), melt whoosh
for k in range(40): put(tick(2800, .012), 23.7 + k * .08, .035)
put(whoosh(.6, 120, 1800, .5), 26.8, .3); put(boom(.8, 70, 36), 27.0, .35)
put(boom(.45, 120, 50), W[89] - .04, .22)
# this room: cold flash zap, wireframe hum, riser into the real room, shimmer
put(zap(.07, 3000), W[93] + .1, .15); put(boom(.5, 150, 60), W[93] - .04, .3)
put(lp(rng.standard_normal(int(1.1 * SR)), 300) * env(int(1.1 * SR), .3, .8, 1) * .6, W[94], .2)
put(riser(.62), 30.22, .4); put(shimmer(1.0), 30.84, .12); put(boom(.9, 60, 30), 30.84, .3)
# CTA: gold VIBE drops + shine, arrow swish
for k in range(4): put(boom(.35, 200, 80), W[108] - .05 + k * .07 + .26, .2)
put(shimmer(1.4), W[108] + .3, .14)
put(whoosh(.35, 1500, 8000, .4), W[108] + .2, .14, pan=.6)
# --- ambient pad (ducked under the voice) ---
t = np.arange(N) / SR
pad = np.zeros(N)
for f, a in [(110, .5), (164.81, .35), (220, .3), (261.63, .2), (329.63, .12)]:
    pad += a * np.sin(2 * np.pi * f * t + 2 * np.sin(2 * np.pi * .13 * t)) * (0.8 + .2 * np.sin(2 * np.pi * .21 * t + f))
pad = lp(pad, 900) * .5
venv = np.sqrt(np.convolve(voice ** 2, np.ones(4800) / 4800, 'same'))
duck = 1 - .55 * np.clip(venv / (venv.max() * .3 + 1e-9), 0, 1)
fade = np.clip(t / .6, 0, 1) * np.clip((e['duration'] + .2 - t) / 1.2, 0, 1)
pad *= duck * fade * .07
# --- voice chain: high-pass, presence, gentle compression ---
vo = hp(voice, 75)
vo = vo + .25 * bp(vo, 2500, 6000)
lev = np.sqrt(np.convolve(vo ** 2, np.ones(480) / 480, 'same')) + 1e-6
thr = np.percentile(lev[lev > 1e-3], 70)
gain = np.where(lev > thr, (thr / lev) ** (1 - 1 / 3), 1.0)
gain = np.convolve(gain, np.ones(240) / 240, 'same')
vo = vo * gain; vo /= np.abs(vo).max() + 1e-9; vo *= .8
sfx_l, sfx_r = L, R
mix_l = vo + pad + sfx_l; mix_r = vo + pad + sfx_r
peak = max(np.abs(mix_l).max(), np.abs(mix_r).max())
mix = np.stack([mix_l, mix_r], 1) / peak * .89
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out, round(N / SR, 2), 's')

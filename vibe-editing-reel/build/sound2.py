"""Premium mix: voice + ElevenLabs music bed (ducked) + a small set of ElevenLabs SFX, placed sparingly.
usage: python3 sound2.py VOICE_WAV(48k) edl.json SFX_DIR OUT_WAV"""
import sys, json, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 48000
voice_path, edl, sd, out = sys.argv[1:5]
e = json.load(open(edl)); W = {i: w['os'] for i, w in enumerate(e['words'])}
DUR = e['duration']; N = int((DUR + .4) * SR)
def load(name):
    sr, a = wavfile.read(f'{sd}/{name}.wav'); a = a.astype(np.float32) / 32768
    return a if a.ndim == 2 else np.stack([a, a], 1)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x, axis=0)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x, axis=0)
# ---------------- voice ----------------
sr, v = wavfile.read(voice_path); v = v.astype(np.float32) / 32768
v = v.mean(1) if v.ndim > 1 else v
vo = np.zeros(N, np.float32); vo[:min(N, len(v))] = v[:N]
vo = hp(vo, 80)
vo = vo + .18 * sosfilt(butter(2, [3000, 7000], 'band', fs=SR, output='sos'), vo)          # presence
lev = np.sqrt(np.convolve(vo ** 2, np.ones(480) / 480, 'same')) + 1e-6
thr = np.percentile(lev[lev > 1e-3], 65)
g = np.where(lev > thr, (thr / lev) ** (1 - 1 / 3.5), 1.0); g = np.convolve(g, np.ones(360) / 360, 'same')
vo = vo * g; vo = vo / (np.abs(vo).max() + 1e-9) * .82
voice = np.stack([vo, vo], 1)
# ---------------- music bed (120 BPM; extend by 2 bars so its own fade lands on the last frame) ----------------
m = load('music_a'); bar = 2.0; J = int(round((1.05 + 8 * bar) * SR)); back = int(round(2 * bar * SR)); xf = int(.04 * SR)
fade = np.linspace(0, 1, xf)[:, None]
mus = np.concatenate([m[:J - xf], m[J - xf:J] * (1 - fade) + m[J - back - xf:J - back] * fade, m[J - back:]])
mus = mus[:N] if len(mus) >= N else np.concatenate([mus, np.zeros((N - len(mus), 2), np.float32)])
t = np.arange(N) / SR
# sidechain duck under the voice (smooth attack/release)
env = np.sqrt(np.convolve(vo ** 2, np.ones(1200) / 1200, 'same')); env = env / (np.percentile(env, 95) + 1e-9)
target = np.clip(1 - .72 * np.clip(env * 1.6, 0, 1), .28, 1)
gs = np.empty_like(target); a_att, a_rel = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR)); cur = 1.0
for i in range(N):
    k = a_att if target[i] < cur else a_rel; cur = k * cur + (1 - k) * target[i]; gs[i] = cur
mgain = .30 * gs
# the reveal: music drops out for "the real room", comes back with the CTA
rv0, rv1 = 30.70, 31.123
drop = np.ones(N); drop[(t > rv0) & (t < rv1)] = 0
ramp = np.clip((t - rv0) / .12, 0, 1); drop = np.where((t > rv0 - .001) & (t < rv0 + .12), 1 - ramp, drop)
drop = np.where((t >= rv1) & (t < rv1 + .05), np.clip((t - rv1) / .05, 0, 1), drop)
mgain *= drop
mgain *= np.clip(t / .25, 0, 1) * np.clip((DUR + .25 - t) / .6, 0, 1)
music = mus * mgain[:, None]
# ---------------- SFX (sparse, premium) ----------------
sfx = np.zeros((N, 2), np.float32)
def put(name, at, gain, pan=0.0, rev=False, cut=None):
    s = load(name)
    if cut: s = s[:int(cut * SR)] * np.r_[np.ones(int(cut * SR) - 480), np.linspace(1, 0, 480)][:, None]
    if rev: s = s[::-1]
    i = int(at * SR); s = s[:max(0, N - i)]
    if i < 0 or not len(s): return
    l, r = np.sqrt((1 - pan) / 2) * 1.414, np.sqrt((1 + pan) / 2) * 1.414
    sfx[i:i + len(s), 0] += s[:, 0] * gain * l; sfx[i:i + len(s), 1] += s[:, 1] * gain * r
C = e['cut_points']
put('dust', 0.0, .30)                                   # materialise
put('whip', W[6] - .17, .38); put('thud', W[6] - .07, .42)  # into the poster
put('whoosh_a', 2.803 - .16, .30)
put('impact', W[12] - .06, .80)                         # ANY OF IT.
put('whoosh_b', 4.503 - .14, .34)
put('glitch', W[21] + .25, .22, -.3)                    # keyframes struck out
put('neon', W[30] - .1, .42)                            # glow
put('whip', 8.821 - .09, .40)
put('thud', W[33] - .03, .40); put('thud', W[35] - .03, .34)
put('dust', 11.76, .45, .4)                             # soft and elegant -> dust
put('whoosh_a', 12.021 - .16, .28)
put('typing', W[42] + .02, .26, -.3, cut=1.3)
put('camera', W[49] - .04, .34)                         # CUTS,
put('whip', 17.685 - .09, .36); put('hud', 17.75, .38)
put('thud', 18.27, .32); put('whoosh_b', 18.939 - .14, .24)
put('glitch', 22.10, .26, .3)
put('thud', W[71] - .04, .32)                           # never
put('whoosh_a', 23.675 - .16, .28)
put('dust', 26.97, .45)                                 # floor melts
put('whoosh_b', 28.485 - .14, .30)
put('impact', W[93] - .05, .38)                         # ROOM
put('riser', 30.84 - 1.46, .50)                         # into the real room
put('shimmer', 30.84, .22)
put('impact', 31.123 - .02, .48)                        # back to the CTA, music returns
put('shimmer', W[108] + .08, .42); put('thud', W[108] - .02, .30)
# gentle glue on the SFX bus: soften highs a touch, keep it under the voice
sfx = lp(sfx, 14000)
mix = voice + music + sfx
mix = mix / (np.abs(mix).max() + 1e-9) * .92
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out, round(N / SR, 2), 's')

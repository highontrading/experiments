"""Ad 1 mix. Part 1: dry voice + one deliberately cheesy whoosh. From "Now watch this": ElevenLabs music bed
(ducked under the voice) + sparse ElevenLabs SFX on the card moves.
usage: python3 sound.py RAW.mp4 edl.json SFX_DIR OUT.wav"""
import sys, json, subprocess, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 48000
raw, edl, sd, out = sys.argv[1:5]
e = json.load(open(edl)); wt = lambda i: e['words'][i]['os']; we = lambda i: e['words'][i]['oe']
N = int(e['nframes'] / 30 * SR) + SR // 10
# voice: same cuts as the picture, 1.1x
k = e['keep']; f = ';'.join(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={b - a - .01:.3f}:d=0.01[a{i}]" for i, (a, b) in enumerate(k))
f += ';' + ''.join(f'[a{i}]' for i in range(len(k))) + f'concat=n={len(k)}:v=0:a=1,atempo={e["speed"]},aresample={SR}[o]'
v = subprocess.run(['ffmpeg', '-v', 'error', '-i', raw, '-filter_complex', f, '-map', '[o]', '-ac', '1', '-f', 's16le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(v, np.int16).astype(np.float32) / 32768
vo = np.zeros(N, np.float32); vo[:min(N, len(v))] = v[:N]
hp = lambda x, fc: sosfilt(butter(2, fc, 'high', fs=SR, output='sos'), x, axis=0)
vo = hp(vo, 85); vo = vo + .16 * sosfilt(butter(2, [3000, 7000], 'band', fs=SR, output='sos'), vo)
lev = np.sqrt(np.convolve(vo ** 2, np.ones(480) / 480, 'same')) + 1e-6; thr = np.percentile(lev[lev > 1e-3], 65)
g = np.where(lev > thr, (thr / lev) ** (1 - 1 / 3.5), 1.0); vo = vo * np.convolve(g, np.ones(360) / 360, 'same'); vo = vo / (np.abs(vo).max() + 1e-9) * .82
def load(n):
    r, a = wavfile.read(f'{sd}/{n}.wav'); a = a.astype(np.float32) / 32768; return a if a.ndim == 2 else np.stack([a, a], 1)
mix = np.stack([vo, vo], 1); t = np.arange(N) / SR
# music: starts on "Now watch this", downbeat (1.05 s into the track) lands on "AI edited"
m = load('music_a'); start = wt(43) - 1.05; i0 = int(max(0, start) * SR); src0 = int(max(0, -start) * SR)
mus = np.zeros((N, 2), np.float32); seg = m[src0:src0 + N - i0]; mus[i0:i0 + len(seg)] = seg
env = np.sqrt(np.convolve(vo ** 2, np.ones(1200) / 1200, 'same')); env /= np.percentile(env, 95) + 1e-9
tgt = np.clip(1 - .7 * np.clip(env * 1.6, 0, 1), .3, 1); gs = np.empty_like(tgt); cur = 1.0
aa, ar = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR))
for i in range(N): kk = aa if tgt[i] < cur else ar; cur = kk * cur + (1 - kk) * tgt[i]; gs[i] = cur
fade = np.clip((t - wt(40)) / .5, 0, 1) * np.clip((N / SR - t) / .9, 0, 1)
mix += mus * (.3 * gs * fade)[:, None]
def put(n, at, gain, pan=0.):
    s = load(n); i = int(at * SR); s = s[:max(0, N - i)]
    if i < 0 or not len(s): return
    mix[i:i + len(s), 0] += s[:, 0] * gain * np.sqrt(1 - pan); mix[i:i + len(s), 1] += s[:, 1] * gain * np.sqrt(1 + pan)
# Part 1 (the cheap look): a loud stock whoosh right on "whoosh", a blunt thud on the snap-zoom
put('whoosh_a', wt(26) - .1, .75); put('thud', wt(19) - .03, .45)
put('whip', wt(39) + .08, .4)                                   # card flicked away
put('impact', wt(40) - .05, .32); put('shimmer', wt(42), .14)    # the switch
put('whoosh_b', wt(43) - .32, .26)                              # push into "after"
put('thud', wt(51) - .03, .3)                                   # nobody
put('whoosh_b', wt(53) - .26, .3); put('typing', wt(59), .2, -.2); put('glitch', we(61) + .2, .14)
put('whoosh_a', wt(62) - .22, .22, .4)
for i in range(7): put('hud', wt(62) + .15 + i * .17, .06, -.3 + i * .1)
put('whoosh_b', wt(67) - .22, .24)
put('whip', wt(75) - .05, .22)                                  # moves.
put('whoosh_b', wt(76) - .24, .26)
for i in range(5): put('hud', wt(77) + i * .2, .08, -.2 + i * .1)
put('whoosh_b', wt(82) - .22, .24); put('thud', wt(82), .22)
put('shimmer', wt(90) + .05, .2)
put('whoosh_b', e['speech'] - .2, .24); put('impact', e['speech'] + .1, .25)
mix = sosfilt(butter(2, 15000, 'low', fs=SR, output='sos'), mix, axis=0)
mix = mix / (np.abs(mix).max() + 1e-9) * .92
wavfile.write(out, SR, (mix * 32767).astype(np.int16)); print('wrote', out, round(N / SR, 2))

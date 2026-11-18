"""Ad 4 v3 mix: cleaned voice (same cuts as picture) + ElevenLabs music bed (ducked) + sparse ElevenLabs SFX.
usage: python3 sound_v3.py RAW.mp4 SFX_DIR OUT.wav"""
import sys, os, json, subprocess, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 48000
ad = 'ad4'; raw, sd, out = sys.argv[1:4]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
e = json.load(open(f'{ROOT}/{ad}/edl.json')); wt = lambda i: e['words'][i]['os']; we = lambda i: e['words'][i]['oe']
N = int(e['nframes'] / 30 * SR) + SR // 10
k = e['keep']; f = ';'.join(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={b - a - .01:.3f}:d=0.01[a{i}]" for i, (a, b) in enumerate(k))
f += ';' + ''.join(f'[a{i}]' for i in range(len(k))) + f'concat=n={len(k)}:v=0:a=1,aresample={SR}[o]'
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
# calm bed from frame 0; a downbeat lands exactly on the switch ("now watch"), level lifts there
wt0 = lambda i: e['words'][i]['os'] - .03; SW = wt0(44); sp = e['speech']
m = load('music_a'); s0 = 1.05 + 2 * 8 - SW; mus = m[int(s0 * SR):int(s0 * SR) + N]; mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
env = np.sqrt(np.convolve(vo ** 2, np.ones(1200) / 1200, 'same')); env /= np.percentile(env, 95) + 1e-9
tgt = np.clip(1 - .65 * np.clip(env * 1.6, 0, 1), .35, 1); gs = np.empty_like(tgt); cur = 1.0; aa, ar = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR))
for i in range(N): kk = aa if tgt[i] < cur else ar; cur = kk * cur + (1 - kk) * tgt[i]; gs[i] = cur
lvl = .17 + .12 * np.clip((t - SW) / .4, 0, 1) + .08 * np.clip((t - sp) / .3, 0, 1)
fade = np.clip(t / .25, 0, 1) * np.clip((N / SR - t) / 1.0, 0, 1)
mix += mus * (lvl * gs * fade)[:, None]
def put(n, at, gain, pan=0.):
    s = load(n); i = int(at * SR); s = s[:max(0, N - i)]
    if i < 0 or not len(s): return
    mix[i:i + len(s), 0] += s[:, 0] * gain * np.sqrt(1 - pan); mix[i:i + len(s), 1] += s[:, 1] * gain * np.sqrt(1 + pan)
W_ = wt0
CUES = [('thud', W_(0), .18), ('thud', W_(4), .38), ('chalk', W_(5), .22, -.3), ('paperslide', W_(6) - .12, .26), ('chalk', W_(8), .14, .3),
 ('whoosh_b', W_(11) - .3, .22), ('pop', W_(11), .16), ('chalk', W_(14), .14), ('chalk', W_(16), .16),
 ('pop', W_(21), .16), ('thud', W_(22), .32),
 ('paperslide', W_(26) - .2, .22), ('pop', W_(29), .16, .3),
 ('whoosh_b', W_(33) - .3, .2), ('thud', W_(33), .2), ('chalk', W_(35), .12), ('paperslide', W_(36) - .12, .22), ('whoosh_a', max(W_(42), W_(44) - .54), .26),
 ('tear', W_(44) - .1, .42), ('impact', W_(44) - .05, .22), ('shimmer', W_(46), .1),
 ('whip', W_(53) - .1, .16), ('chalk', W_(54), .14), ('pop', W_(57), .16, .3),
 ('whoosh_b', W_(58) - .3, .2), ('thud', W_(58), .26), ('chalk', W_(60), .16),
 ('whoosh_b', W_(62) - .3, .2), ('pop', W_(64), .08), ('pop', W_(64) + .64, .08), ('pop', W_(64) + 1.28, .08), ('paperslide', W_(65), .16),
 ('whoosh_a', W_(69) - .25, .18), ('pop', W_(78), .2),
 ('whoosh_b', sp - .25, .22), ('thud', sp + .05, .3), ('paperslide', sp + .28, .18), ('pop', sp + .7, .18), ('shimmer', sp + .9, .1)]
for c in CUES: put(*c)
mix = sosfilt(butter(2, 15000, 'low', fs=SR, output='sos'), mix, axis=0); mix = mix / (np.abs(mix).max() + 1e-9) * .92
wavfile.write(out, SR, (mix * 32767).astype(np.int16)); print('wrote', out, round(N / SR, 2))

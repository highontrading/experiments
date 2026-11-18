"""v3 mix (any ad module: MUSIC, LIFT, CUES(), optional MUSIC_OFS / MUSIC_BRIGHT): cleaned voice (same cuts as picture) + ElevenLabs music bed (ducked) + sparse ElevenLabs SFX.
usage: python3 vsound.py ad2 SFX_DIR OUT.wav"""
import sys, os, json, subprocess, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 48000
modname, sd, out = sys.argv[1:4]
import importlib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); M = importlib.import_module(modname); import vkit as K
ad = K.C.ad; raw = f'{K.SC}/raw/{K.C.src_id}.mp4'
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
sp = e['speech']; SW = M.LIFT
m = load(M.MUSIC); s0 = getattr(M, 'MUSIC_OFS', 0.0); mus = m[int(s0 * SR):int(s0 * SR) + N]; mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
if getattr(M, 'MUSIC_BRIGHT', 0): mus = mus + M.MUSIC_BRIGHT * sosfilt(butter(2, 2500, 'high', fs=SR, output='sos'), mus, axis=0)
env = np.sqrt(np.convolve(vo ** 2, np.ones(1200) / 1200, 'same')); env /= np.percentile(env, 95) + 1e-9
tgt = np.clip(1 - .65 * np.clip(env * 1.6, 0, 1), .35, 1); gs = np.empty_like(tgt); cur = 1.0; aa, ar = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR))
for i in range(N): kk = aa if tgt[i] < cur else ar; cur = kk * cur + (1 - kk) * tgt[i]; gs[i] = cur
lvl = getattr(M, 'MUSIC_LVL', .17) + .12 * np.clip((t - SW) / .4, 0, 1) + .08 * np.clip((t - sp) / .3, 0, 1)
fade = np.clip(t / .25, 0, 1) * np.clip((N / SR - t) / 1.0, 0, 1)
mix += mus * (lvl * gs * fade)[:, None]
def put(n, at, gain, pan=0.):
    s = load(n); i = int(at * SR); s = s[:max(0, N - i)]
    if i < 0 or not len(s): return
    mix[i:i + len(s), 0] += s[:, 0] * gain * np.sqrt(1 - pan); mix[i:i + len(s), 1] += s[:, 1] * gain * np.sqrt(1 + pan)
for c in M.CUES(): put(*c)
mix = sosfilt(butter(2, 15000, 'low', fs=SR, output='sos'), mix, axis=0); mix = mix / (np.abs(mix).max() + 1e-9) * .92
wavfile.write(out, SR, (mix * 32767).astype(np.int16)); print('wrote', out, round(N / SR, 2))

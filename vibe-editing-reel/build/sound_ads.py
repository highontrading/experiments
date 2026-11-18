"""Mix for Ads 2–6: cleaned voice (same cuts as picture) + ElevenLabs music bed (ducked) + sparse ElevenLabs SFX.
usage: python3 sound_ads.py AD RAW.mp4 SFX_DIR OUT.wav"""
import sys, os, json, subprocess, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 48000
ad, raw, sd, out = sys.argv[1:5]
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
# music: where the premium part starts (switch word), downbeat 1.05 s into the track lands just after it
MSTART = {'ad2': 0.0, 'ad3': wt(39), 'ad4': wt(44), 'ad5': wt(11), 'ad6': 0.0}[ad]
m = load('music_a'); start = MSTART - 1.05; i0 = int(max(0, start) * SR); s0 = int(max(0, -start) * SR)
mus = np.zeros((N, 2), np.float32); seg = m[s0:s0 + N - i0]; mus[i0:i0 + len(seg)] = seg
env = np.sqrt(np.convolve(vo ** 2, np.ones(1200) / 1200, 'same')); env /= np.percentile(env, 95) + 1e-9
tgt = np.clip(1 - .7 * np.clip(env * 1.6, 0, 1), .3, 1); gs = np.empty_like(tgt); cur = 1.0; aa, ar = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR))
for i in range(N): kk = aa if tgt[i] < cur else ar; cur = kk * cur + (1 - kk) * tgt[i]; gs[i] = cur
fade = np.clip((t - MSTART + .3) / .5, 0, 1) * np.clip((N / SR - t) / .9, 0, 1)
level = .22 if MSTART == 0 else .3
mix += mus * (level * gs * fade)[:, None]
def put(n, at, gain, pan=0.):
    s = load(n); i = int(at * SR); s = s[:max(0, N - i)]
    if i < 0 or not len(s): return
    mix[i:i + len(s), 0] += s[:, 0] * gain * np.sqrt(1 - pan); mix[i:i + len(s), 1] += s[:, 1] * gain * np.sqrt(1 + pan)
sp = e['speech']
CUES = {
 'ad2': lambda: [('thud', wt(3) - .2, .3), ('whoosh_b', wt(4) - .3, .24), ('hud', wt(7), .07), ('hud', wt(8), .07), ('hud', wt(10), .07), ('whip', wt(12) - .1, .22), ('hud', wt(12) + .05, .1),
         ('impact', wt(14) - .05, .5), ('thud', wt(21) - .03, .22), ('glitch', wt(22), .1), ('camera', wt(25), .22), ('whoosh_a', wt(28) - .1, .26), ('whoosh_a', we(30) + .02, .22),
         ('whoosh_b', wt(31) - .3, .26), ('whoosh_b', wt(38) - .3, .22), ('whoosh_b', wt(40) - .3, .24), ('whoosh_a', wt(45) - .25, .22), ('shimmer', wt(57), .18), ('whoosh_b', sp - .2, .24), ('impact', sp + .1, .22)],
 'ad3': lambda: [('whoosh_a', wt(4), .45), ('hud', wt(9), .1), ('hud', wt(11), .12), ('hud', wt(16), .1), ('hud', wt(20), .1), ('whoosh_b', wt(28) - .3, .26), ('whoosh_a', wt(33) - .25, .22),
         ('impact', wt(39) - .05, .3), ('shimmer', wt(41), .12), ('whoosh_b', wt(42) - .3, .24), ('hud', wt(42) + .1, .08), ('hud', wt(42) + .4, .08), ('hud', wt(42) + .7, .08),
         ('thud', wt(55) - .03, .3), ('glitch', wt(61), .1), ('shimmer', wt(73), .18), ('whoosh_b', sp - .2, .24), ('impact', sp + .1, .22)],
 'ad4': lambda: [('hud', .05, .1), ('hud', 1.05, .1), ('hud', 2.05, .1), ('thud', wt(22) - .03, .45), ('glitch', wt(41), .25), ('impact', wt(41) + .02, .3),
         ('impact', wt(44) - .05, .3), ('shimmer', wt(46), .12), ('whoosh_b', wt(47) - .3, .24), ('thud', wt(50), .26), ('whip', wt(53) - .1, .22), ('hud', wt(57) + .3, .12),
         ('whoosh_b', wt(58) - .3, .26), ('whoosh_a', wt(62) - .25, .22), ('typing', wt(63), .18, -.2), ('shimmer', wt(78), .18), ('whoosh_b', sp - .2, .24), ('impact', sp + .1, .22)],
 'ad5': lambda: [('typing', 0.05, .14), ('whoosh_a', wt(5) - .3, .2), ('impact', wt(11) - .05, .32), ('shimmer', wt(14), .14), ('dust', wt(15), .3), ('glitch', wt(22), .1),
         ('whoosh_a', wt(24) + .05, .3), ('whoosh_a', wt(24) + .6, .22), ('thud', wt(32) - .03, .3), ('whoosh_b', wt(36) - .3, .26), ('hud', wt(37), .06), ('hud', wt(37) + .36, .06), ('hud', wt(37) + .72, .06),
         ('whoosh_b', wt(48) - .3, .22), ('thud', wt(57) - .05, .3), ('shimmer', wt(69), .18), ('whoosh_b', sp - .2, .24), ('impact', sp + .1, .22)],
 'ad6': lambda: [('hud', .15, .08), ('hud', .37, .08), ('hud', .59, .08), ('hud', .81, .08), ('hud', 1.03, .08), ('whoosh_b', wt(7) - .3, .24), ('glitch', wt(15) + .25, .14),
         ('whoosh_a', wt(16) - .2, .2), ('hud', we(22) + .3, .14), ('whoosh_b', wt(23) - .3, .26), ('whoosh_b', wt(35) - .3, .22), ('shimmer', wt(42), .14),
         ('whoosh_b', wt(45) - .3, .26), ('thud', wt(48), .22), ('thud', wt(50), .22), ('thud', wt(53), .22), ('shimmer', wt(62), .18), ('whoosh_b', sp - .2, .24), ('impact', sp + .1, .22)],
}[ad]()
for c in CUES: put(*c)
mix = sosfilt(butter(2, 15000, 'low', fs=SR, output='sos'), mix, axis=0); mix = mix / (np.abs(mix).max() + 1e-9) * .92
wavfile.write(out, SR, (mix * 32767).astype(np.int16)); print('wrote', out, round(N / SR, 2))

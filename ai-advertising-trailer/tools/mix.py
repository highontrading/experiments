import subprocess, numpy as np, os
from scipy.signal import butter, sosfilt
SP = os.path.dirname(os.path.abspath(__file__)); AU = f'{SP}/audio'
SR = 48000; DUR = 1836 / 24
mix = np.zeros((int(DUR * SR) + SR, 2), np.float32)

def load(p, ss=None, to=None):
    cmd = ['ffmpeg', '-v', 'error']
    if ss is not None: cmd += ['-ss', str(ss)]
    if to is not None: cmd += ['-t', str(to - (ss or 0))]
    cmd += ['-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, stdout=subprocess.PIPE).stdout, np.float32).reshape(-1, 2).copy()

def fade(x, fi=0.01, fo=0.01):
    n = len(x); a = int(fi * SR); b = int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[n - b:] *= np.linspace(1, 0, b)[:, None]
    return x

def put(x, t, g=1.0):
    s = int(t * SR); e = min(len(mix), s + len(x)); mix[s:e] += x[:e - s] * g

def vintage(x):
    sos = butter(4, [320, 3200], 'bandpass', fs=SR, output='sos')
    y = sosfilt(sos, x, axis=0); y = np.tanh(y * 2.2) / np.tanh(2.2)
    return (y * 1.35).astype(np.float32)

def gain_env(points):
    t = np.arange(len(mix)) / SR; ts, gs = zip(*points); return np.interp(t, ts, gs).astype(np.float32)[:, None]

# ---- A. cold open ----
music = np.zeros_like(mix)
def mput(x, t, g=1.0):
    s = int(t * SR); e = min(len(music), s + len(x)); music[s:e] += x[:e - s] * g
mput(fade(load(f'{AU}/music/main.mp3', 2.8, 12.3), 0.25, 0.03), 0.0, 0.75)
put(load(f'{AU}/sfx/glitch.mp3'), 0.0, 0.9)
put(fade(load(f'{AU}/sfx/projector.mp3'), 0.2, 0.5), 0.15, 0.22)
put(vintage(fade(load(f'{AU}/vo/L1v3.mp3'), 0.005, 0.05)), 0.25, 1.0)
L2 = load(f'{AU}/vo/L2v3.mp3')
for (a, b), t in zip([(0.0, 0.66), (1.09, 1.64), (2.02, 2.47), (2.87, 3.42), (4.43, 5.20), (6.09, 6.80)],
                     [2.833, 3.5, 4.167, 4.875, 5.5, 6.29]):
    put(vintage(fade(L2[int(a * SR):int(b * SR)].copy(), 0.01, 0.04)), t, 1.0)
put(load(f'{AU}/sfx/glitch2.mp3'), 7.08, 0.7)
put(load(f'{AU}/sfx/shutter.mp3'), 7.25, 0.55)
put(fade(load(f'{AU}/sfx/riser.mp3'), 0.5, 0.02), 9.5 - 3.448, 0.45)
put(load(f'{AU}/sfx/glitch2.mp3'), 9.5, 0.85)
put(fade(load(f'{AU}/sfx/subswell.mp3'), 0.05, 0.3), 9.62, 1.0)
put(fade(load(f'{AU}/vo/L3b.mp3'), 0.005, 0.1), 10.625, 1.05)
put(fade(load(f'{AU}/sfx/whoosh.mp3'), 0.05, 0.05), 11.45, 0.45)
# ---- C. drop + montage ----
DROP_T = 290 / 24; SRC_DROP = 13.358
mput(fade(load(f'{AU}/music/main.mp3', SRC_DROP - 0.012, SRC_DROP + (58.75 - DROP_T)), 0.004, 0.06), DROP_T - 0.012, 0.9)
put(fade(load(f'{AU}/sfx/riser.mp3'), 0.3, 0.02), 58.75 - 3.448, 0.6)
put(load(f'{AU}/sfx/impact.mp3'), 58.75, 1.0)
put(load(f'{AU}/sfx/glitch2.mp3'), 1430 / 24, 0.7)
# ---- D. breakdown ----
mput(fade(load(f'{AU}/music/breakdown.mp3', 0, 11.0), 0.6, 0.6), 59.7, 0.75)
put(fade(load(f'{AU}/vo/L4.mp3'), 0.005, 0.15), 1449.6 / 24, 1.0)
# ---- E. logo ----
put(load(f'{AU}/sfx/glitch.mp3'), 1690 / 24, 0.9)
put(load(f'{AU}/sfx/impact.mp3'), 1701 / 24, 0.9)
mput(fade(load(f'{AU}/music/main.mp3', 73.36, 76.72), 0.01, 0.3), 1701 / 24, 0.55)
put(fade(load(f'{AU}/vo/L5c.mp3'), 0.005, 0.15), 71.3, 1.0)

# ducking of music under VO
duck = gain_env([(0, 1), (0.2, 0.55), (7.0, 0.55), (7.25, 1), (60.2, 1), (60.5, 0.6), (70.3, 0.6), (70.6, 1),
                 (71.2, 1), (71.4, 0.7), (DUR + 1, 0.7)])
mix += music * duck
# master fade
mix *= gain_env([(0, 1), (75.6, 1), (76.45, 0), (DUR + 1, 0)])
mix = mix[:int(DUR * SR)]
peak = np.abs(mix).max(); print('peak', peak)
mix /= max(1.0, peak / 0.95)
raw = f'{SP}/render/mix_raw.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', raw], input=mix.tobytes())
# two-pass loudnorm to -14 LUFS / -1 dBTP (YouTube)
import json, re
o = subprocess.run(['ffmpeg', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'],
                   stderr=subprocess.PIPE).stderr.decode()
m = json.loads(re.findall(r'\{[^{}]+\}', o)[-1]); print('measured', m['input_i'], m['input_tp'])
af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ar', '48000', f'{SP}/render/mix.wav'])
print('done')

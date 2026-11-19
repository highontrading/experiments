"""Ad 7 mix: voice (same cuts as picture) + ElevenLabs bed that starts ON "put some music" + soft ASMR SFX that only exist after
"add some sound effects also".  usage: python3 sound7.py SFX_DIR OUT.wav"""
import sys, subprocess, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
import common as C
sd, out = sys.argv[1:3]; SR = 48000; OS, OE = C.OS, C.OE
f = lambda w_, k=0, after=0.: C.find(w_, k, after / C.E.get('speed', 1.0))     # 'after' thresholds were written for the 1x cut
N = int(C.N / 30 * SR) + SR // 10; t = np.arange(N) / SR
k = C.E['keep']; fl = ';'.join(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={b - a - .012:.3f}:d=0.012[a{i}]" for i, (a, b) in enumerate(k))
fl += ';' + ''.join(f'[a{i}]' for i in range(len(k))) + f'concat=n={len(k)}:v=0:a=1,atempo={C.E.get("speed", 1.0)},aresample={SR}[o]'
v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', C.RAW, '-filter_complex', fl, '-map', '[o]', '-ac', '1', '-f', 's16le', '-'], capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
vo = np.zeros(N, np.float32); vo[:min(N, len(v))] = v[:N]
hp = lambda x, fc: sosfilt(butter(2, fc, 'high', fs=SR, output='sos'), x, axis=0)
vo = hp(vo, 80); vo = vo + .12 * sosfilt(butter(2, [2800, 6500], 'band', fs=SR, output='sos'), vo)                    # presence
lev = np.sqrt(np.convolve(vo ** 2, np.ones(480) / 480, 'same')) + 1e-6; thr = np.percentile(lev[lev > 1e-3], 60)
g = np.where(lev > thr, (thr / lev) ** (1 - 1 / 3.0), 1.0); vo = vo * np.convolve(g, np.ones(360) / 360, 'same'); vo = vo / (np.abs(vo).max() + 1e-9) * .8
def load(n):
    r, a = wavfile.read(f'{sd}/{n}.wav'); a = a.astype(np.float32) / 32768; return a if a.ndim == 2 else np.stack([a, a], 1)
mix = np.stack([vo, vo], 1)
# --- music: starts on "music." ---
T_MUS = OE(f('music.')) + .05; m = load('bed7'); i0 = int(T_MUS * SR); seg = m[:N - i0]; mus = np.zeros((N, 2), np.float32); mus[i0:i0 + len(seg)] = seg
env = np.sqrt(np.convolve(vo ** 2, np.ones(1200) / 1200, 'same')); env /= np.percentile(env, 95) + 1e-9
tgt = np.clip(1 - .62 * np.clip(env * 1.6, 0, 1), .38, 1); gs = np.empty_like(tgt); cur = 1.; aa, ar = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.4 * SR))
for i in range(N): kk = aa if tgt[i] < cur else ar; cur = kk * cur + (1 - kk) * tgt[i]; gs[i] = cur
lvl = .2 + .06 * np.clip((t - (C.SPEECH - .2)) / .4, 0, 1); fade = np.clip((t - T_MUS) / .5, 0, 1) * np.clip((N / SR - t) / 1.4, 0, 1)
mix += mus * (lvl * gs * fade)[:, None]
def put(n, at, gain, pan=0.):
    s = load(n); i = int(at * SR); s = s[:max(0, N - i)]
    if i < 0 or not len(s): return
    mix[i:i + len(s), 0] += s[:, 0] * gain * np.sqrt(1 - pan); mix[i:i + len(s), 1] += s[:, 1] * gain * np.sqrt(1 + pan)
# --- SFX: nothing before the "sound effects" command ---
T_SFX = OE(f('also.')) + .1; T_NA = OS(f('premiere')) - .32
A = [OE(f('captions.')) + .08, OE(f('saying.')) + .08, OE(f('magazine.')) + .08, OE(f('head.')) + .08, OE(f('handwritten.')) + .08]
T_WB = OE(f('whiteboard.')) + .12; T_BACK = OE(f('back.')) + .06; SP = C.SPEECH
w = lambda s, k=0, after=0: f(s, k, after)
CUES = [('swoosh7', T_SFX, .22, -.3), ('pop7', T_SFX + .3, .2, .4), ('click7', T_SFX + .6, .22, .3), ('swipe7', T_SFX + .9, .2, -.3),
        ('paper7', T_NA, .16)] + [('thud7', OS(w(n)) - .05, .12) for n in ('premiere', 'davinci,', 'higgsfield,')] + \
       [('marker7', OE(w('no', 1)) - .15, .1), ('marker7', OE(w('no', 2)) - .15, .1), ('marker7', OE(w('nothing.')) - .15, .1), ('thud7', OS(w('nothing.')), .22),
        ('thud7', OS(w('know')) - .05, .1), ('marker7', OE(w('coding.')) - .1, .12), ('swoosh7', OS(w('okay', 1)) - .2, .14)]
for ci, wi in [('captions.', 'add'), ('saying.', 'highlight'), ('magazine.', 'make'), ('head.', 'put', ), ('handwritten.', 'try')]: pass
CUES += [('type7', OS(f('add', 1)), .1), ('type7', OS(f('highlight')), .1), ('type7', OS(f('make')), .1), ('type7', OS(f('put', 1)), .1), ('type7', OS(f('try')), .1)]
CUES += [('apply7', a, .18) for a in A] + [('chime7', A[4] + .05, .07), ('marker7', OE(f('one.')) - .1, .1), ('paper7', A[2] + .05, .08)]
CUES += [('swoosh7', OS(f('see,')) - .12, .14)] + [('pop7', OS(f('five')) + .1 + k * .14, .08, (k - 2) * .2) for k in range(5)]
CUES += [('swoosh7', OS(f('now', 1)) - .15, .12), ('type7', OS(f('cut')), .1), ('apply7', T_WB, .18), ('peel7', T_WB + .05, .16), ('paper7', T_WB + .5, .1)]
CUES += [('marker7', OS(f('actually')) - .2, .08), ('paper7', OS(f('first,')) - .2, .1), ('marker7', OS(f('your')), .08), ('paper7', OS(f('then')) - .2, .1),
         ('marker7', OS(f('like', 0, 50)), .08)] + [('pop7', OS(f('tell')) + k * .35, .07) for k in range(3)] + \
        [('paper7', OS(f('and', 0, 54)) - .2, .1), ('swoosh7', OS(f('made')) , .08), ('marker7', OS(f('tells')), .08)] + [('click7', OS(f('skill')) - .17 + k * ((OE(f('like.', 0, 59)) - OS(f('skill')) + .17) / 5), .07) for k in range(5)]
CUES += [('swoosh7', OS(f('because')) - .12, .14)] + [('pop7', OS(f('everyone', 0, 60)) + .1 + k * .15, .07) for k in range(3)] + [('marker7', OS(f('cheap.')), .08), ('marker7', OE(f('tool,')) - .1, .1), ('thud7', OS(f("it's", 0, 67)), .16)]
CUES += [('swipe7', OS(f('okay', 0, 69)) - .1, .12), ('type7', OS(f('put', 0, 70)), .1), ('apply7', T_BACK, .16), ('swoosh7', T_BACK + .4, .1)]
CUES += [('swoosh7', OS(f('everything')) - .25, .14), ('pop7', OS(f('prompts,')), .1), ('pop7', OS(f('skill', 0, 74)), .1), ('pop7', OS(f('workflow.', 0, 75)), .1)]
CUES += [('swoosh7', OS(f('so,', 0, 76)) - .15, .12), ('marker7', OS(f('your', 0, 77)), .08), ('pop7', OS(f('tap')), .14), ('swoosh7', SP, .14), ('chime7', SP + .4, .1), ('marker7', SP + .4, .06), ('pop7', SP + .7, .1)]
for c in CUES: put(*c)
mix = sosfilt(butter(2, 15500, 'low', fs=SR, output='sos'), mix, axis=0); mix = mix / (np.abs(mix).max() + 1e-9) * .92
wavfile.write(out, SR, (mix * 32767).astype(np.int16)); print('wrote', out, round(N / SR, 2), 'cues', len(CUES))

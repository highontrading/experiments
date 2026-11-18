"""Ad 1 cut plan v2: natural speed (1.0x), silences found from the audio itself (not word boundaries)
and capped at 0.28 s, second take of the last line dropped.
usage: python3 edl.py WORDS_JSON AUDIO16K_WAV OUT_JSON"""
import sys, json, wave, numpy as np
words = [dict(w) for w in json.load(open(sys.argv[1])) if w['s'] < 37.5]
for w in words:                                    # the transcriber folded the pause before "are" into the word
    if w['w'] == 'are' and w['s'] > 35: w['s'], w['e'] = 36.82, 37.04
    if w['w'] == 'AI.' and w['s'] > 36: w['s'], w['e'] = 37.08, 37.36
SPEED, FPS, GAP, ENDCARD = 1.0, 30, .28, 2.2
au = wave.open(sys.argv[2]); a = np.frombuffer(au.readframes(au.getnframes()), np.int16).astype(np.float32) / 32768
hop = 160; db = np.array([20 * np.log10(np.sqrt((a[i:i + hop] ** 2).mean()) + 1e-9) for i in range(0, len(a) - hop, hop)])
voiced = db > -46
START, END = 0.0, 37.5
sil = []; run = None
for i in range(int(START * 100), int(END * 100)):
    if not voiced[i]: run = i if run is None else run
    else:
        if run is not None and (i - run) / 100 > (.07 if i / 100 > 35.5 else GAP): sil.append((run / 100, i / 100))
        run = None
keep = []; t = START
for s0, s1 in sil:
    g = .07 if s0 > 35.5 else GAP                  # last line runs straight through
    c0, c1 = s0 + g * .45, s1 - g * .55
    if c0 > t: keep.append([round(t, 3), round(c0, 3)])
    t = c1
keep.append([round(t, 3), END])
def out_of(ts):
    acc = 0
    for x, y in keep:
        if ts < x: return acc / SPEED
        if ts <= y: return (acc + ts - x) / SPEED
        acc += y - x
    return acc / SPEED
speech = sum(y - x for x, y in keep) / SPEED
N = int(round((speech + ENDCARD) * FPS))
def src_of(to):
    s = to * SPEED
    for x, y in keep:
        if s <= y - x: return x + s
        s -= y - x
    return keep[-1][1]
frames = [int(round(src_of(min(i / FPS, speech - 1 / FPS)) * 60)) for i in range(N)]
cuts = []; acc = 0
for x, y in keep[:-1]: acc += y - x; cuts.append(round(acc / SPEED, 3))
W = [dict(w=w['w'], os=round(out_of(w['s']), 3), oe=round(out_of(w['e']), 3)) for w in words]
json.dump(dict(fps=FPS, speed=SPEED, keep=keep, frames=frames, words=W, cuts=cuts, speech=round(speech, 3), nframes=N), open(sys.argv[3], 'w'))
print('segments', len(keep), 'speech', round(speech, 2), 's  total', round(N / FPS, 2), 's ', N, 'frames')
print('last line:', [(w['w'], w['os']) for w in W[-8:]])

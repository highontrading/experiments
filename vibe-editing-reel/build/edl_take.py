"""Cut plan for a single take: natural speed, silences found from the audio and capped at 0.28 s,
start 0.1 s before the first word, end 0.4 s after the last one, then an end card.
usage: python3 edl_take.py WORDS_JSON AUDIO16K_WAV OUT_JSON [endcard_s]"""
import sys, json, wave, numpy as np
words = json.load(open(sys.argv[1])); END_CARD = float(sys.argv[4]) if len(sys.argv) > 4 else 2.2
HOLD = [w['e'] for w in words if w['w'].lower().strip('.,!?') in (sys.argv[5].split(',') if len(sys.argv) > 5 else [])]   # keep a beat after these words
FPS, GAP = 30, .28
au = wave.open(sys.argv[2]); a = np.frombuffer(au.readframes(au.getnframes()), np.int16).astype(np.float32) / 32768
hop = 160; db = np.array([20 * np.log10(np.sqrt((a[i:i + hop] ** 2).mean()) + 1e-9) for i in range(0, len(a) - hop, hop)])
voiced = db > -46
START, END = max(0, words[0]['s'] - .1), min(len(a) / 16000, words[-1]['e'] + .4)
sil, run = [], None
for i in range(int(START * 100), int(END * 100)):
    if not voiced[i]: run = i if run is None else run
    else:
        if run is not None and (i - run) / 100 > GAP: sil.append((run / 100, i / 100))
        run = None
keep, t = [], START
for s0, s1 in sil:
    g = 1.05 if any(abs(s0 - h) < .4 for h in HOLD) else GAP
    if s1 - s0 <= g: continue
    c0, c1 = s0 + g * .45, s1 - g * .55
    if c0 > t: keep.append([round(t, 3), round(c0, 3)])
    t = c1
keep.append([round(t, 3), round(END, 3)])
def out_of(ts):
    acc = 0
    for x, y in keep:
        if ts < x: return acc
        if ts <= y: return acc + ts - x
        acc += y - x
    return acc
speech = sum(y - x for x, y in keep); N = int(round((speech + END_CARD) * FPS))
def src_of(s):
    for x, y in keep:
        if s <= y - x: return x + s
        s -= y - x
    return keep[-1][1]
frames = [int(round(src_of(min(i / FPS, speech - 1 / FPS)) * 60)) for i in range(N)]
cuts, acc = [], 0
for x, y in keep[:-1]: acc += y - x; cuts.append(round(acc, 3))
W = [dict(w=w['w'], os=round(out_of(w['s']), 3), oe=round(out_of(w['e']), 3)) for w in words]
json.dump(dict(fps=FPS, speed=1.0, keep=keep, frames=frames, words=W, cuts=cuts, speech=round(speech, 3), nframes=N), open(sys.argv[3], 'w'))
print(f'{sys.argv[3]}: segments {len(keep)}  speech {speech:.2f}s  total {N / FPS:.2f}s  {N} frames')

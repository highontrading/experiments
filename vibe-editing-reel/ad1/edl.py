"""Ad 1 cut plan: keep speech, cap every pause at 0.18 s, drop the second take of the last line, 1.1x.
usage: python3 edl.py WORDS_JSON OUT_JSON"""
import sys, json
words = [w for w in json.load(open(sys.argv[1])) if w['s'] < 37.5]
SPEED, FPS, GAP, PRE, TAIL, ENDCARD = 1.1, 30, .18, .12, .35, 1.6
keep = []                                         # [src_start, src_end]
for i, w in enumerate(words):
    s, e = w['s'] - (PRE if i == 0 else 0), w['e']
    if keep and s - keep[-1][1] <= GAP: keep[-1][1] = e
    elif keep:
        gap = s - keep[-1][1]; keep[-1][1] += GAP / 2; keep.append([s - GAP / 2, e])
    else: keep.append([max(0, s), e])
keep[-1][1] += TAIL
def out_of(ts):
    acc = 0
    for a, b in keep:
        if ts < a: return acc / SPEED
        if ts <= b: return (acc + ts - a) / SPEED
        acc += b - a
    return acc / SPEED
speech = sum(b - a for a, b in keep) / SPEED
N = int(round((speech + ENDCARD) * FPS))
def src_of(to):
    s = to * SPEED
    for a, b in keep:
        if s <= b - a: return a + s
        s -= b - a
    return keep[-1][1]
frames = [int(round(src_of(min(i / FPS, speech - 1 / FPS)) * 60)) for i in range(N)]
cuts = []; acc = 0
for a, b in keep[:-1]: acc += b - a; cuts.append(round(acc / SPEED, 3))
W = [dict(w=w['w'], os=round(out_of(w['s']), 3), oe=round(out_of(w['e']), 3)) for w in words]
json.dump(dict(fps=FPS, speed=SPEED, keep=keep, frames=frames, words=W, cuts=cuts, speech=round(speech, 3), nframes=N), open(sys.argv[2], 'w'))
print('segments', len(keep), 'speech', round(speech, 2), 's  total', round(N / FPS, 2), 's ', N, 'frames')

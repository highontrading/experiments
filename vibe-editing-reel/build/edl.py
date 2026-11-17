"""Cut plan: silence trimming + fumble removal + 1.1x speed.
Writes edl.json: segments (source s), frame map (output frame -> source s), words in output time."""
import json, sys, wave, numpy as np
RAW = sys.argv[1]           # dir with a16.wav, words.json
SPEED, FPS = 1.1, 30
w = wave.open(f'{RAW}/a16.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float)/32768
sr = 16000; hop = sr//100   # 10 ms
rms = np.array([np.sqrt((a[i*hop:(i+1)*hop]**2).mean()) for i in range(len(a)//hop)])
db = 20*np.log10(rms+1e-9)
voiced = db > -48
START, END = 0.50, 48.95
FUMBLE = (22.95, 25.08)      # false start "It tracks..." -> keep retake
KEEP_GAP, MIN_GAP = 0.14, 0.26
LONG_GAPS = {42.9: 0.50}     # after "isn't real either": let the real-room reveal breathe
# find silent runs
segs = []; t = START
i0 = int(START*100); i1 = int(END*100)
sil = []; run = None
for i in range(i0, i1):
    if not voiced[i]:
        run = run if run is not None else i
    else:
        if run is not None and (i-run)/100 >= MIN_GAP: sil.append((run/100, i/100))
        run = None
cuts = []
for s0, s1 in sil:
    keep = KEEP_GAP
    for k, v in LONG_GAPS.items():
        if s0 <= k <= s1: keep = v
    if s1 - s0 > keep:
        cuts.append((s0 + keep*0.45, s1 - keep*0.55))
cuts.append(FUMBLE)
cuts.sort()
# merge cuts and build keep segments
merged = []
for c in cuts:
    if merged and c[0] <= merged[-1][1]: merged[-1] = (merged[-1][0], max(merged[-1][1], c[1]))
    else: merged.append(c)
keep = []; t = START
for c0, c1 in merged:
    if c0 > t: keep.append([round(t,3), round(c0,3)])
    t = max(t, c1)
keep.append([round(t,3), END + 1.0])   # tail hold (silent) for the CTA
total = sum(b-a for a,b in keep)
out_dur = total / SPEED
nfr = int(round(out_dur*FPS))
def src_of(tout):
    s = tout*SPEED
    for a_, b_ in keep:
        if s <= b_-a_: return a_ + s
        s -= b_-a_
    return keep[-1][1]
def out_of(tsrc):
    acc = 0
    for a_, b_ in keep:
        if tsrc < a_: return acc/SPEED
        if tsrc <= b_: return (acc + tsrc - a_)/SPEED
        acc += b_-a_
    return acc/SPEED
frames = [round(src_of(i/FPS), 4) for i in range(nfr)]
words = json.load(open(f'{RAW}/words.json'))
# fix fumble: words before retake
fixed = []
for wd in words:
    if FUMBLE[0] <= wd['s'] < FUMBLE[1]: continue
    fixed.append(wd)
# the retake words (from separate transcription)
retake = {'It':25.12,'tracks':25.40,'my':25.80}
for wd in fixed:
    if wd['w'] == 'face' and abs(wd['s']-25.92) < .1: pass
for k, v in retake.items(): fixed.append({'w':k,'s':v,'e':v+0.25})
fixed.sort(key=lambda x: x['s'])
for wd in fixed:
    wd['os'] = round(out_of(wd['s']), 3); wd['oe'] = round(out_of(wd['e']), 3)
    if wd['w'] == 'read.': wd['w'] = 'reel.'
cut_points = []; acc = 0
for a_, b_ in keep[:-1]:
    acc += b_-a_; cut_points.append(round(acc/SPEED, 3))
json.dump(dict(fps=FPS, speed=SPEED, keep=keep, nframes=nfr, duration=round(out_dur,3),
               frame_src=frames, words=fixed, cut_points=cut_points), open('edl.json','w'), indent=0)
print('segments', len(keep), 'removed', round(END+1.0-START-total,2), 's; output', round(out_dur,2), 's,', nfr, 'frames')
print(' '.join(f"{w['w']}@{w['os']}" for w in fixed))

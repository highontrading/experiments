"""Ad 7 cut plan: tighten dead air, keep a short beat after each instruction to Claude (where the edit changes), drop the outro.
usage: python3 edl.py WORDS.json RAW.mp4 OUT_EDL.json"""
import json, sys, subprocess, numpy as np
words_p, raw, out = sys.argv[1:4]
W = json.load(open(words_p))
# whisper hallucinated two zero-length fragments ("add captions") — drop them; drop the trailing "Thank you."
W = [w for i, w in enumerate(W) if not (w['e'] - w['s'] < .02 and w['w'].strip(',.').lower() in ('add', 'captions', 'to', 'need', 'just', 'you', "i'm", 'going'))]
W = [w for w in W if w['s'] < 101.5]
W = [w for w in W if not (w['s'] < 1.1) and not (89.3 < w['s'] < 89.95)]      # open on 'this whole video'; drop the 'So, so' stutter
fps_src = eval(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', raw], capture_output=True, text=True).stdout.strip())
# audio energy for precise speech edges
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', raw, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
env = np.sqrt(np.convolve(a ** 2, np.ones(320) / 320, 'same')); db = 20 * np.log10(env + 1e-9)
def voiced(t): i = int(t * 16000); return db[max(0, i - 80):i + 80].max() > -44
BEAT_AFTER = {'music.': .55, 'also.': .5, 'captions.': .5, 'basic.': .22, 'saying.': .5, 'magazine.': .55, 'head.': .55, 'handwritten.': .5, 'one.': .35,
              'whiteboard.': .7, 'back.': .55, 'anything.': .3, 'workflow.': .3}
GAP = .16
keep = []; cur = None
for i, w in enumerate(W):
    s, e = w['s'], w['e']
    if cur is None: cur = [s, e]; continue
    gap = s - cur[1]
    if gap <= .3: cur[1] = e; continue
    beat = BEAT_AFTER.get(W[i - 1]['w'].lower(), 0)
    tail = min(gap * .5, max(.12, beat * .6)); cur[1] = cur[1] + tail; keep.append(cur)
    lead = min(gap * .5, max(GAP - .12 + .06, beat * .4)); cur = [s - lead, e]
cur[1] += .35; keep.append(cur)
# extend segment ends while still voiced (avoid clipping word tails)
for k in keep:
    while voiced(k[1]) and k[1] < W[-1]['e'] + .5: k[1] += .02
segs = [(round(a_, 3), round(b_, 3)) for a_, b_ in keep]
tl = []; o = 0.
for a_, b_ in segs: tl.append((a_, b_, o)); o += b_ - a_
def s2o(t):
    for a_, b_, oo in tl:
        if a_ - .001 <= t <= b_ + .001: return oo + t - a_
    best = min(tl, key=lambda x: min(abs(t - x[0]), abs(t - x[1]))); return best[2] + (0 if t < best[0] else best[1] - best[0])
words = [{'w': w['w'], 's': w['s'], 'e': w['e'], 'os': round(s2o(w['s']), 3), 'oe': round(s2o(w['e']), 3)} for w in W]
speech = o; N = int(round((speech + 2.6) * 30))      # + end card
frames = []
for f in range(N):
    t = f / 30
    if t >= speech: t = speech - 1 / 30
    for a_, b_, oo in tl:
        if oo <= t < oo + (b_ - a_) + 1e-6: frames.append(int(round((a_ + t - oo) * fps_src))); break
    else: frames.append(int(round(segs[-1][1] * fps_src)) - 1)
json.dump({'fps': 30, 'fps_src': fps_src, 'keep': segs, 'words': words, 'speech': round(speech, 3), 'nframes': N, 'frames': frames}, open(out, 'w'))
print('segments', len(segs), 'speech', round(speech, 2), 'raw', round(W[-1]['e'], 2), 'frames', N)
for w in words: print(f"{w['w']}@{w['os']:.2f}", end=' ')

"""Per-ad render data: source frame per output frame, smoothed head track (from the matte), words, plates.
usage: python3 prep_ads.py AD ADS_SCRATCH ROOMS_DIR ROOM_NAME"""
import sys, os, json, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(ROOT, 'ad1'))
from look import cinematic_set, paper_bg
ad, SC, RD, room = sys.argv[1:5]
e = json.load(open(f'{ROOT}/{ad}/edl.json')); B = f'{SC}/bake/{ad}'; N = e['nframes']
cuts = [0] + [int(round(c * 30)) for c in e['cuts']] + [N]
track = {}
def head(src):
    if src in track: return track[src]
    p = f'{B}/pre/{src:05d}.webp'
    if not os.path.exists(p): track[src] = None; return None
    a = np.asarray(Image.open(p).getchannel('A').resize((360, 640)))
    rows = np.nonzero((a[:, 90:270] > 128).sum(1) > 4)[0]
    if not len(rows): track[src] = None; return None
    top = rows.min() * 2.0                                        # 720-space
    band = a[rows.min():rows.min() + 100]; ys, xs = np.nonzero(band > 128)
    cx = xs.mean() * 2.0 if len(xs) else 360
    track[src] = (cx, top); return track[src]
raw = [head(s) for s in e['frames']]
arr = np.array([r if r else (np.nan, np.nan) for r in raw], float)
for k in range(2):
    v = arr[:, k]; ok = ~np.isnan(v)
    arr[:, k] = np.interp(np.arange(N), np.arange(N)[ok], v[ok]) if ok.any() else (360 if k == 0 else 430)
sm = arr.copy()
for a_, b_ in zip(cuts[:-1], cuts[1:]):
    for i in range(a_, b_):
        lo, hi = max(a_, i - 6), min(b_, i + 7); sm[i] = np.median(arr[lo:hi], axis=0)
frames = [dict(src=s, fx=round(float(sm[i, 0]), 1), top=round(float(sm[i, 1]), 1)) for i, s in enumerate(e['frames'])]
os.makedirs(f'{B}/plates', exist_ok=True)
cinematic_set(f'{RD}/{room}.png', dict(z=1.0)).save(f'{B}/plates/set.png')
paper_bg(11).save(f'{B}/plates/paper.png'); paper_bg(7).save(f'{B}/plates/paper2.png'); paper_bg(21).save(f'{B}/plates/paper3.png')
json.dump(dict(ad=ad, asset='file://' + B, frames=frames, words=e['words'], speech=e['speech'], nframes=N, cuts=e['cuts']), open(f'{B}/data.json', 'w'))
print(ad, 'frames', N, 'tracked', int((~np.isnan(np.array([r[0] if r else np.nan for r in raw]))).sum()))

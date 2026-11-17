"""Build data.json for the renderer: per output frame source index, smoothed face, head top,
body contours (selection outline) and the text path around the body.
usage: python3 prep_data.py edl.json MATTE_DIR ROOMS_DIR out.json"""
import sys, json, os, numpy as np, cv2
from PIL import Image
edl, md, rooms_dir, out = sys.argv[1:5]
e = json.load(open(edl)); faces = json.load(open(f'{md}/faces.json'))
fps = e['fps']; N = e['nframes']
src = [int(round(t * 60)) for t in e['frame_src']]
cuts = [0] + [int(round(c * fps)) for c in e['cut_points']] + [N]
raw = []
for s in src:
    f = faces.get(str(s), {})
    fc = f.get('face')
    raw.append([fc[0] + fc[2] / 2, fc[1] + fc[3] * .52, fc[2]] if fc and fc[4] == 'front' else None)
tops = [faces.get(str(s), {}).get('top', 390) for s in src]
arr = np.array([r if r else [np.nan] * 3 for r in raw], float)
# interpolate gaps, reject outliers (size jumps), smooth within each shot
for k in range(3):
    v = arr[:, k]; idx = np.arange(N); ok = ~np.isnan(v)
    arr[:, k] = np.interp(idx, idx[ok], v[ok])
med = np.array([np.median(arr[max(0, i - 4):i + 5], axis=0) for i in range(N)])
bad = np.abs(arr[:, 2] - med[:, 2]) > med[:, 2] * .18
arr[bad] = med[bad]
sm = arr.copy(); topsm = np.array(tops, float)
for a, b in zip(cuts[:-1], cuts[1:]):
    for i in range(a, b):
        lo, hi = max(a, i - 5), min(b, i + 6)
        sm[i] = arr[lo:hi].mean(0); topsm[i] = np.median(tops[lo:hi])
frames = [dict(src=src[i], face=[round(float(x), 1) for x in sm[i]], top=round(float(topsm[i]), 1)) for i in range(N)]

def alpha(s):
    return np.array(Image.open(f'{md}/fg/{s:05d}.webp'))[:, :, 3]

def body_contour(a, dil=0):
    m = (a > 128).astype(np.uint8)
    if dil: m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dil * 2 + 1, dil * 2 + 1)))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    return max(cs, key=cv2.contourArea)[:, 0, :].astype(float)

def resample(p, step):
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]
    s = np.arange(0, d[-1], step)
    return np.c_[np.interp(s, d, p[:, 0]), np.interp(s, d, p[:, 1])]

# selection outline for the "masking" shot
t0, t1 = 23.675, 27.15
contours = {}
for i in range(int(t0 * fps), min(N, int(t1 * fps) + 1)):
    c = body_contour(alpha(src[i]))
    keep = c[:, 1] < 1265                        # drop the frame-bottom edge, keep it an open path
    c = c[keep]; jumps = np.hypot(*np.diff(c, axis=0).T); j = int(np.argmax(jumps))
    if jumps[j] > 30: c = np.roll(c, -(j + 1), axis=0)
    c = resample(c, 9)
    contours[i] = [[round(x, 1), round(y, 1)] for x, y in c]
# text path: dilated outline, from the left hip up over the head and down to the right hip
ref = int(24.2 * fps); a = alpha(src[ref]); fc = frames[ref]['face']
c = body_contour(a, dil=46)
k = np.argmin(np.abs(c[:, 1] - (fc[1] + 380)) + (c[:, 0] > fc[0]) * 1e4)   # left side, chest height
c = np.roll(c, -k, axis=0)
if c[min(40, len(c) - 1), 1] > c[0, 1]: c = c[::-1]                            # go upward first
right = [j for j in range(len(c)) if c[j, 0] > fc[0] and abs(c[j, 1] - (fc[1] + 380)) < 6]
c = c[:right[0] + 1] if right else c[: len(c) // 2]
c = resample(c, 4)
ker = np.ones(31) / 31
cs = np.c_[np.convolve(np.pad(c[:, 0], 15, mode='edge'), ker, 'valid'), np.convolve(np.pad(c[:, 1], 15, mode='edge'), ker, 'valid')]
textPath = dict(face=fc, pts=[[round(x, 1), round(y, 1)] for x, y in resample(cs, 6)])
profile = sorted(int(n[:5]) for n in os.listdir(f'{md}/fg') if 3060 <= int(n[:5]) <= 3390)
rooms = {}
for name in ['curtain', 'wall', 'living', 'study', 'lounge']:
    fs = sorted(f for f in os.listdir(rooms_dir) if f.startswith(name + '_'))
    if fs: rooms[name] = 'file://' + os.path.abspath(f'{rooms_dir}/{fs[0]}')
json.dump(dict(asset='file://' + os.path.abspath(md), fps=fps, frames=frames, words=e['words'], cuts=e['cut_points'],
               contours=contours, textPath=textPath, profile=profile, rooms=rooms), open(out, 'w'))
print('frames', N, 'contours', len(contours), 'path pts', len(textPath['pts']), 'profile', len(profile), 'rooms', list(rooms))

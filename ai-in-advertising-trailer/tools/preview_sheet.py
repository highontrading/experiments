"""usage: python3 preview_sheet.py OUTPREFIX id1 id2 ... (downloads mixkit 360p, grabs 2 frames each, makes labelled sheets)"""
import sys, os, subprocess, urllib.request, concurrent.futures as cf
import cv2, numpy as np
pre, ids = sys.argv[1], sys.argv[2:]
def fetch(i):
    p = f"prev/{i}.mp4"
    if not os.path.exists(p):
        try:
            urllib.request.urlretrieve(f"https://assets.mixkit.co/videos/{i}/{i}-360.mp4", p)
        except Exception as e: return i, None
    cap = cv2.VideoCapture(p); n = int(cap.get(7)); fps = cap.get(5) or 25
    out = []
    for frac in (0.2, 0.7):
        cap.set(1, int(n * frac)); ok, f = cap.read()
        if ok: out.append(cv2.resize(f, (320, 180)))
    return i, (out, n / fps, cap.get(3), cap.get(4))
with cf.ThreadPoolExecutor(8) as ex: res = dict(ex.map(fetch, ids))
tiles = []
for i in ids:
    r = res.get(i)
    if not r or len(r[0]) < 2: continue
    pair = np.hstack(r[0])
    cv2.rectangle(pair, (0, 0), (639, 22), (0, 0, 0), -1)
    cv2.putText(pair, f"{i}  {r[1]:.0f}s", (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1)
    tiles.append(pair)
per = 15
for s in range(0, len(tiles), per):
    t = tiles[s:s + per]
    while len(t) % 3: t.append(np.zeros_like(tiles[0]))
    g = np.vstack([np.hstack(t[r:r + 3]) for r in range(0, len(t), 3)])
    cv2.imwrite(f"{pre}_{s // per}.jpg", g, [cv2.IMWRITE_JPEG_QUALITY, 85])
print("sheets", (len(tiles) + per - 1) // per)

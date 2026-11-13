"""usage: python3 shot_bounds.py VIDEO t1 t2 ...  -> shot [start,end] around each time (hist-diff cuts)"""
import sys, cv2, numpy as np
v = sys.argv[1]; cap = cv2.VideoCapture(v); fps = cap.get(5)
for t in map(float, sys.argv[2:]):
    a = max(0, t - 6); cap.set(cv2.CAP_PROP_POS_MSEC, a * 1000); prev = None; cuts = []; k = 0
    while True:
        ok, f = cap.read(); tt = a + k / fps; k += 1
        if not ok or tt > t + 6: break
        h = cv2.calcHist([cv2.cvtColor(cv2.resize(f, (160, 120)), cv2.COLOR_BGR2HSV)], [0, 1, 2], None, [16, 8, 8], [0, 180, 0, 256, 0, 256]); cv2.normalize(h, h)
        if prev is not None and cv2.compareHist(prev, h, cv2.HISTCMP_BHATTACHARYYA) > 0.35: cuts.append(round(tt, 2))
        prev = h
    s = max([c for c in cuts if c <= t] or [a]); e = min([c for c in cuts if c > t] or [t + 6])
    print(f"{v} t={t}: shot {s:.2f}-{e:.2f} ({e-s:.2f}s)")

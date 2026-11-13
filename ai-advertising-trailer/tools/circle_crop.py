"""Find the dominant circle in each photo and write a square crop centred on it (circle ~70% of frame).
usage: python3 tools/circle_crop.py <indir> <outdir>"""
import cv2, numpy as np, glob, os, sys
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(f"{src}/*.jpg")):
    im = cv2.imread(f)
    if im is None: continue
    h, w = im.shape[:2]; s = 800 / max(h, w); sm = cv2.resize(im, (int(w*s), int(h*s)))
    g = cv2.medianBlur(cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY), 5)
    H, W = g.shape; mn = min(H, W)
    c = cv2.HoughCircles(g, cv2.HOUGH_GRADIENT, dp=1.5, minDist=mn, param1=120, param2=60, minRadius=int(mn*.18), maxRadius=int(mn*.5))
    if c is None:
        cx, cy, r, ok = W/2, H/2, mn*0.35, "nocircle"
    else:
        cx, cy, r = c[0][0]; ok = "circle"
    half = min(r / 0.70, cx, cy, W - cx, H - cy)        # circle fills ~70% of the square, never pad
    if half < r * 0.9: half = min(cx, cy, W-cx, H-cy)
    x0, y0 = int((cx-half)/s), int((cy-half)/s); side = int(2*half/s)
    if side < 300: print("skip small", f); continue
    crop = cv2.resize(im[y0:y0+side, x0:x0+side], (1080, 1080), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f"{dst}/{os.path.basename(f)}", crop, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(ok, os.path.basename(f), f"r/half={r/half:.2f}")

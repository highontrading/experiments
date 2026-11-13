"""usage: python3 sample_sheet.py VIDEO OUT.jpg STEP_SECONDS [cols]"""
import sys, cv2, numpy as np
v, out, step = sys.argv[1], sys.argv[2], float(sys.argv[3]); cols = int(sys.argv[4]) if len(sys.argv) > 4 else 8
cap = cv2.VideoCapture(v); fps = cap.get(5); n = int(cap.get(7)); tiles = []
t = step / 2
while t < n / fps:
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
    if ok:
        f = cv2.resize(f, (240, 180)); cv2.putText(f, f"{t:.0f}", (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 3); cv2.putText(f, f"{t:.0f}", (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1); tiles.append(f)
    t += step
while len(tiles) % cols: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(out, np.vstack([np.hstack(tiles[r:r + cols]) for r in range(0, len(tiles), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 80])

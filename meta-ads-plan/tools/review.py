"""usage: python3 review.py VIDEO OUT.jpg t1 t2 ... -> sheet of frames at given times (4 per row)"""
import sys, cv2, numpy as np
v, out = sys.argv[1], sys.argv[2]; cap = cv2.VideoCapture(v); ims = []
for t in map(float, sys.argv[3:]):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, im = cap.read()
    if not ok: continue
    s = 480 / im.shape[0]; im = cv2.resize(im, (int(im.shape[1] * s), 480)); cv2.putText(im, f"{t:.2f}", (6, 22), 0, 0.7, (0, 255, 255), 2); ims.append(im)
while len(ims) % 4: ims.append(np.zeros_like(ims[0]))
cv2.imwrite(out, np.vstack([np.hstack(ims[i:i + 4]) for i in range(0, len(ims), 4)]), [cv2.IMWRITE_JPEG_QUALITY, 82])

"""usage: python3 stills_sheet.py OUT.jpg f1 f2 ... (2-col sheet of 960x540 stills)"""
import sys, cv2, numpy as np, os
ims = []
for s in sys.argv[2:]:
    im = cv2.imread(f"f{int(s):05d}.jpg"); im = cv2.resize(im, (960, 540), interpolation=cv2.INTER_AREA)
    cv2.putText(im, f"f{s} {int(s)/25:.2f}s", (8, 30), 0, 0.9, (0, 255, 255), 2); ims.append(im)
while len(ims) % 2: ims.append(np.zeros_like(ims[0]))
cv2.imwrite(sys.argv[1], np.vstack([np.hstack(ims[r:r + 2]) for r in range(0, len(ims), 2)]), [cv2.IMWRITE_JPEG_QUALITY, 85])

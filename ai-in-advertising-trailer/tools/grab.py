import sys, cv2, numpy as np
vid, out = sys.argv[1], sys.argv[2]; frames = [int(x) for x in sys.argv[3].split(",")]
cap = cv2.VideoCapture(vid); imgs=[]
for n in frames:
    cap.set(cv2.CAP_PROP_POS_FRAMES, n); ok, f = cap.read()
    f = cv2.resize(f, (960, 540)); cv2.putText(f, f"f{n} {n/25:.2f}s", (8, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,0), 4); cv2.putText(f, f"f{n} {n/25:.2f}s", (8, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,255), 2); imgs.append(f)
while len(imgs)%4: imgs.append(np.zeros_like(imgs[0]))
for k in range(0, len(imgs), 4):
    g = np.vstack([np.hstack(imgs[k:k+2]), np.hstack(imgs[k+2:k+4])]); cv2.imwrite(f"{out}_{k//4}.jpg", g, [cv2.IMWRITE_JPEG_QUALITY, 90])

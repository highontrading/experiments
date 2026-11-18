# per-matte neck / shoulder rows (normalized to frame height) -> mk_<n>/neck.json
import sys, os, json, glob, numpy as np, cv2
n = sys.argv[1]; d = f"/home/user/work/mk_{n}"; out = {}
for p in sorted(glob.glob(f"{d}/s*.png")):
    m = cv2.imread(p, 0) > 128; w = m.sum(1).astype(float); H = len(w)
    rows = np.where(w > 0)[0]
    if not len(rows): continue
    top = rows[0]; a = int(top + 0.45 * (H - top))
    seg = w[a:]
    if len(seg) < 5: continue
    neck = a + int(np.argmin(seg[: max(3, len(seg) - 10)]))
    nw = max(1.0, w[neck]); sh = H - 1
    for r in range(neck, H):
        if w[r] > 1.6 * nw: sh = r; break
    out[int(os.path.basename(p)[1:6]) - 1] = [round(neck / H, 4), round(sh / H, 4), round(nw / m.shape[1], 4)]
json.dump(out, open(f"{d}/neck.json", "w")); print(n, len(out))

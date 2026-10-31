"""Per-clip helper data: alpha bboxes of keyed clips, phone screen bbox per frame, laptop screen rect."""
import json, os, numpy as np
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = f"{root}/build/frames"; man = json.load(open(f"{F}/manifest.json"))
out = {}
for name, m in man.items():
    if m["ext"] != "webp": continue
    xs0, ys0, xs1, ys1 = [], [], [], []
    for i in range(0, m["n"], 6):
        a = np.array(Image.open(f"{F}/{name}/{i:04d}.webp"))[..., 3]
        ys, xs = np.where(a > 128)
        if len(xs): xs0.append(xs.min()); xs1.append(xs.max()); ys0.append(ys.min()); ys1.append(ys.max())
    out[name] = {"bbox": [int(min(xs0)), int(min(ys0)), int(max(xs1)), int(max(ys1))]}
# phone: hole = transparent pixels enclosed by the dark bezel. bezel = dark opaque pixels.
ph = []
for i in range(man["phone"]["n"]):
    im = np.array(Image.open(f"{F}/phone/{i:04d}.webp")).astype(np.int32)
    dark = (im[..., 3] > 200) & (im[..., :3].max(-1) < 70)
    ys, xs = np.where(dark)
    # robust: use percentiles to ignore tracking-marker noise
    x0, x1 = np.percentile(xs, 1), np.percentile(xs, 99); y0, y1 = np.percentile(ys, 1), np.percentile(ys, 99)
    ph.append([round(float(v), 1) for v in (x0, y0, x1, y1)])
out["phone"]["screen"] = ph
# laptop: greenish-gray screen
im = np.array(Image.open(f"{F}/laptop/0030.jpg")).astype(np.int32)
g = (im[..., 1] - np.maximum(im[..., 0], im[..., 2]) > 12) & (im[..., 1] > 90)
ys, xs = np.where(g)
out["laptop"] = {"screen": [int(np.percentile(xs, 0.5)), int(np.percentile(ys, 0.5)), int(np.percentile(xs, 99.5)), int(np.percentile(ys, 99.5))]}
im2 = np.array(Image.open(f"{F}/laptop/0120.jpg")).astype(np.int32)
g2 = (im2[..., 1] - np.maximum(im2[..., 0], im2[..., 2]) > 12) & (im2[..., 1] > 90); ys, xs = np.where(g2)
out["laptop"]["screen_end"] = [int(np.percentile(xs, 0.5)), int(np.percentile(ys, 0.5)), int(np.percentile(xs, 99.5)), int(np.percentile(ys, 99.5))]
json.dump(out, open(f"{F}/track.json", "w"))
print({k: (v.get("bbox"), v.get("screen", [None])[:2] if k == "phone" else v.get("screen"), v.get("screen_end")) for k, v in out.items()})

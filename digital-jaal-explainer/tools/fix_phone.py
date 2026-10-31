"""After prep+track: tighten the phone-screen track, remove the screen's tracking marker from the
keyed phone frames (keep only skin = the tapping finger), and set in-points that land the press on 'click'."""
import json, numpy as np
from PIL import Image
F = "build/frames"; tr = json.load(open(f"{F}/track.json")); man = json.load(open(f"{F}/manifest.json"))
ph = []
for i in range(man["phone"]["n"]):
    im = np.array(Image.open(f"{F}/phone/{i:04d}.webp")).astype(np.int32)
    dark = (im[..., 3] > 200) & (im[..., :3].max(-1) < 50)
    xs = np.where(dark.sum(0) > 120)[0]; x0, x1 = xs.min(), xs.max()
    ys = np.where(dark[:, x0:x1 + 1].sum(1) > (x1 - x0) * .5)[0]; y0, y1 = ys.min(), ys.max()
    ph.append([int(x0), int(y0), int(x1), int(y1)])
    sx0, sy0, sx1, sy1 = x0 + 7, y0 + 16, x1 - 7, y1 - 16
    sub = im[sy0:sy1, sx0:sx1]; r, g, b, a = sub[..., 0], sub[..., 1], sub[..., 2], sub[..., 3]
    skin = (r > 95) & (r > g + 8) & (g > b - 10) & (a > 100)
    sub[..., 3] = np.where(skin, a, 0); im[sy0:sy1, sx0:sx1] = sub
    Image.fromarray(im.astype(np.uint8), "RGBA").save(f"{F}/phone/{i:04d}.webp", quality=88, method=4)
tr["phone"]["screen"] = ph; json.dump(tr, open(f"{F}/track.json", "w"))
man["phone"]["in"] = 0.87; json.dump(man, open(f"{F}/manifest.json", "w"), indent=1)
print("phone fixed")

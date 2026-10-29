"""Laptop cutout: key only the screen (the largest green region), despill the rest,
and save hw_laptop.screen.json so the stage can play code on it. Run after lib/cutout.py."""
import json
import numpy as np
from PIL import Image
from scipy import ndimage

P = "../assets/objects/hw_laptop.png"
a = np.array(Image.open(P)).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
green = (g > r + 45) & (g > b + 45) & (a[..., 3] > 0)
lab, n = ndimage.label(green)
scr = lab == 1 + np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)))
scr = ndimage.binary_fill_holes(ndimage.binary_closing(scr, iterations=6))
ys, xs = np.nonzero(scr)
x0, x1, y0, y1 = np.percentile(xs, 0.3), np.percentile(xs, 99.7), np.percentile(ys, 0.3), np.percentile(ys, 99.7)
a[scr] = [14, 14, 16, 255]
m = np.maximum(r, b)
spill = ~scr & (g > m)
a[..., 1] = np.where(spill, m + (g - m) // 6, a[..., 1])
lum = (0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2])[..., None]
a[..., :3] = np.where(scr[..., None], a[..., :3], (lum + (a[..., :3] - lum) * 0.35).astype(int))   # tame the green cast
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(P)
W = a.shape[1]
# stage convention: centre/len/wid as fractions of image width; ang along the long axis (screen is landscape)
json.dump({"cx": round((x0 + x1) / 2 / W, 5), "cy": round((y0 + y1) / 2 / W, 5), "len": round((x1 - x0) / W, 5),
           "wid": round((y1 - y0) / W, 5), "ang": 0.0}, open("../assets/objects/hw_laptop.screen.json", "w"))
print("screen", (x0, x1, y0, y1), a.shape)

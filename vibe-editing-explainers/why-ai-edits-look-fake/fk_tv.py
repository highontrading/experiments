"""Cut the retro boombox TV (Mixkit #4143) out of its frame and measure its CRT screen.
    python fk_tv.py  ->  ../assets/objects/fk_tv.png + fk_tv.screen.json (screen rect, as fractions of the image)"""
import json, pathlib
import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

A = pathlib.Path(__file__).resolve().parent.parent / "assets"
im = Image.open(A / "images/fk_tvframe.jpg").convert("RGB")
cut = np.array(remove(im, session=new_session("isnet-general-use"), post_process_mask=True))
lab, n = ndimage.label(cut[..., 3] > 100)
if n > 1:
    keep = 1 + np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)))
    cut[..., 3] = np.where(ndimage.binary_fill_holes(lab == keep), 255, cut[..., 3])
else:
    cut[..., 3] = np.where(ndimage.binary_fill_holes(cut[..., 3] > 100), 255, cut[..., 3])
r, g, b = (cut[..., i].astype(int) for i in range(3))
blue = (b > r + 12) & (b > 60)
blue = ndimage.binary_opening(blue, iterations=3)
lab, n = ndimage.label(blue)
k = 1 + np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)))
ys, xs = np.nonzero(lab == k)
x0, x1, y0, y1 = np.percentile(xs, 0.5), np.percentile(xs, 99.5), np.percentile(ys, 0.5), np.percentile(ys, 99.5)
H, W = cut.shape[:2]
# black glass where the static was, so the stage paints its own picture there
yy, xx = np.mgrid[0:H, 0:W]
inside = (xx > x0 - 4) & (xx < x1 + 4) & (yy > y0 - 4) & (yy < y1 + 4)
cut[inside & (cut[..., 3] > 0)] = [14, 16, 18, 255]
# the beige handle melts into the beige wall, so drop the handle legs: keep rows from the body's top edge down
cov = (cut[..., 3] > 128).mean(1)
top = int(np.argmax(cov > 0.6 * cov.max()))
cut[:top, :, 3] = 0
bbox = Image.fromarray(cut).getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox()
out = Image.fromarray(cut).crop(bbox)
s = 1000 / max(out.size)
out = out.resize((round(out.width * s), round(out.height * s)), Image.LANCZOS)
out.save(A / "objects/fk_tv.png")
w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
scr = {"x": (x0 - bbox[0]) / w, "y": (y0 - bbox[1]) / h, "w": (x1 - x0) / w, "h": (y1 - y0) / h}
json.dump({k: round(v, 4) for k, v in scr.items()}, open(A / "objects/fk_tv.crt.json", "w"))
print(out.size, scr)

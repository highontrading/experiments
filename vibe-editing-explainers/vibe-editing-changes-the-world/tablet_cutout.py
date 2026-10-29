"""Cut the green-screen tablet (Mixkit #100094) from its frame without rembg.

rembg reads the green screen as background, so the tablet is rebuilt from geometry:
the screen rectangle (green pixels, holes filled) grown by the bezel, with rounded corners.
    python tablet_cutout.py  ->  ../assets/objects/cw_tablet.png + cw_tablet.screen.json
"""
import json, pathlib, subprocess, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
tmp = pathlib.Path(tempfile.mkdtemp()) / "f.png"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0.5", "-i", str(ROOT / "assets_raw/mixkit/o100094.mp4"), "-frames:v", "1", str(tmp)], check=True)
im = Image.open(tmp).convert("RGB")
a = np.array(im).astype(int)
green = (a[..., 1] > a[..., 0] + 45) & (a[..., 1] > a[..., 2] + 45)
lab, n = ndimage.label(green)
green = lab == 1 + np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)))
green = ndimage.binary_fill_holes(green)
ys, xs = np.nonzero(green); pts = np.stack([xs, ys], 1).astype(float)
c = pts.mean(0); _, _, vt = np.linalg.svd(pts - c, full_matrices=False)
proj = (pts - c) @ vt.T
lo, hi = np.percentile(proj, 0.2, 0), np.percentile(proj, 99.8, 0)
mid = (lo + hi) / 2; cx, cy = c + mid[0] * vt[0] + mid[1] * vt[1]
L, Wd = hi[0] - lo[0], hi[1] - lo[1]
bez = 11
# tablet outline: screen rect grown by the bezel, drawn rotated at 4x then downsampled (smooth edge)
S = 4
mask = Image.new("L", (im.width * S, im.height * S), 0)
ang = np.arctan2(vt[0, 1], vt[0, 0])
big = Image.new("L", (int((L + 2 * bez) * S), int((Wd + 2 * bez) * S)), 0)
ImageDraw.Draw(big).rounded_rectangle([0, 0, big.width - 1, big.height - 1], radius=22 * S, fill=255)
big = big.rotate(-np.degrees(ang), expand=True, resample=Image.BICUBIC)
mask.paste(big, (int(cx * S - big.width / 2), int(cy * S - big.height / 2)))
mask = mask.resize(im.size, Image.LANCZOS)
out = np.dstack([np.array(im), np.array(mask)])
out[green] = [12, 12, 14, 255]
cut = Image.fromarray(out.astype(np.uint8), "RGBA")
bbox = cut.getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox()
cut = cut.crop(bbox)
W = cut.width
scr = {"cx": round((cx - bbox[0]) / W, 5), "cy": round((cy - bbox[1]) / W, 5), "len": round(L / W, 5),
       "wid": round(Wd / W, 5), "ang": round(float(np.degrees(ang)), 2)}
cut.save(ROOT / "assets/objects/cw_tablet.png")
json.dump(scr, open(ROOT / "assets/objects/cw_tablet.screen.json", "w"))
print(cut.size, scr)

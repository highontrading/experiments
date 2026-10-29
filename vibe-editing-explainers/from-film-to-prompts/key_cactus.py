"""The cactus sits on a flat teal backdrop, so a colour key cuts it cleaner than rembg.
    python3 key_cactus.py  ->  ../assets/objects/ff_cactus.png"""
import subprocess, tempfile, pathlib
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
tmp = pathlib.Path(tempfile.mkdtemp()) / "f.png"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(ROOT / "assets_raw/mixkit/v51044.mp4"), "-frames:v", "1", str(tmp)], check=True)
a = np.asarray(Image.open(tmp).convert("RGB")).astype(float)
# the backdrop is teal (blue about as strong as green); cactus is green, pot is terracotta
r, g, b = a[..., 0], a[..., 1], a[..., 2]
teal = (b - (g - 25)) / 18                       # > 0 where blue catches up with green
alpha = np.clip(1 - teal, 0, 1) * np.clip((g - b + 10) / 1, 0, 1).clip(0, 1)
alpha = np.maximum(alpha, np.clip((r - b - 10) / 20, 0, 1))   # keep the warm pot
lab, n = ndimage.label(alpha > 0.5)
keep = 1 + np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)))
alpha *= ndimage.binary_fill_holes(lab == keep)
# pull the teal spill out of the edges
rgb = a.copy(); spill = np.clip(rgb[..., 2] - rgb[..., 0], 0, None) * (1 - alpha) * 0.8
rgb[..., 1] -= spill * 0.5; rgb[..., 2] -= spill
im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8))
im.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(0.8)))
im = im.crop(im.getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox())
im.thumbnail((1000, 1000))
im.save(ROOT / "assets/objects/ff_cactus.png"); print(im.size)

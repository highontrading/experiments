"""Cut real objects out of footage frames or photos for the stage.

    python lib/cutout.py <video-dir>      reads <dir>/objects.json

objects.json: [{"key": "mug", "src": "assets_raw/mixkit/v100069.mp4", "t": 8.3,     (or an image path)
                "box": [x0, y0, x1, y1], "sticker": false, "model": "isnet-general-use",
                "screen": false, "keep": "largest"}]
-> assets/objects/<key>.png (+ <key>.screen.json: the green-screen rectangle of a phone/tablet)
"""
import json, pathlib, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

D = pathlib.Path(sys.argv[1]).resolve(); ROOT = D.parent
OUT = ROOT / "assets/objects"; OUT.mkdir(parents=True, exist_ok=True)
screens = {}   # one <key>.screen.json per object, so videos can cut objects in parallel
sessions = {}
only = set(sys.argv[2:])

for o in json.load(open(D / "objects.json")):
    key = o["key"]
    if only and key not in only: continue
    src = ROOT / o["src"]
    if src.suffix.lower() in (".mp4", ".mov", ".webm"):
        tmp = pathlib.Path(tempfile.mkdtemp()) / "f.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(o.get("t", 0)), "-i", str(src), "-frames:v", "1", str(tmp)], check=True)
        src = tmp
    im = Image.open(src).convert("RGB")
    if "box" in o: im = im.crop(tuple(o["box"]))
    if im.width < 800: im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    if o.get("model") == "none":
        cut = im.convert("RGBA")
    else:
        m = o.get("model", "isnet-general-use")
        sessions.setdefault(m, new_session(m))
        cut = remove(im, session=sessions[m], post_process_mask=True)
    a = np.array(cut)
    if o.get("keep", "largest") == "largest":
        lab, n = ndimage.label(a[..., 3] > 100)
        if n > 1:
            keep = 1 + np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)))
            a[..., 3] = np.where(ndimage.binary_dilation(lab == keep, iterations=3), a[..., 3], 0)
    if o.get("screen"):
        r, g, b = (a[..., i].astype(int) for i in range(3))
        green = (g > r + 45) & (g > b + 45) & (a[..., 3] > 0)
        ys, xs = np.nonzero(green); pts = np.stack([xs, ys], 1).astype(float)
        c = pts.mean(0); _, _, vt = np.linalg.svd(pts - c, full_matrices=False)
        proj = (pts - c) @ vt.T
        lo, hi = np.percentile(proj, 0.5, 0), np.percentile(proj, 99.5, 0)
        mid = (lo + hi) / 2
        cx, cy = c + mid[0] * vt[0] + mid[1] * vt[1]
        a[green] = [12, 12, 14, 255]
        scr = {"cx": cx, "cy": cy, "len": hi[0] - lo[0], "wid": hi[1] - lo[1], "ang": float(np.degrees(np.arctan2(vt[0, 1], vt[0, 0])))}
    cut = Image.fromarray(a)
    cut.putalpha(cut.getchannel("A").point(lambda v: 255 if v > 128 else int(v * 1.6)))
    if o.get("sticker"):  # white die-cut border
        pad = 40
        big = Image.new("RGBA", (cut.width + pad * 2, cut.height + pad * 2), (0, 0, 0, 0)); big.paste(cut, (pad, pad), cut)
        ring = big.getchannel("A").filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(2)).point(lambda v: 255 if v > 100 else 0)
        base = Image.new("RGBA", big.size, (255, 255, 255, 0)); base.putalpha(ring); base.alpha_composite(big); cut = base
    bbox = cut.getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox()
    cut = cut.crop(bbox)
    s = min(1.0, 1000 / max(cut.size))
    if o.get("screen"):
        W = cut.width
        screens[key] = {k: round((v - (bbox[0] if k == "cx" else bbox[1] if k == "cy" else 0)) / W, 5) if k != "ang" else round(v, 2)
                        for k, v in scr.items()}
    if s < 1: cut = cut.resize((round(cut.width * s), round(cut.height * s)), Image.LANCZOS)
    cut.save(OUT / f"{key}.png")
    if key in screens: json.dump(screens[key], open(OUT / f"{key}.screen.json", "w"))
    print(key, cut.size, screens.get(key, "") if o.get("screen") else "")

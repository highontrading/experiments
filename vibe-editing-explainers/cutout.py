"""Cut real objects out of Mixkit stock-footage frames for the desk layer.
    python cutout.py  ->  assets/objects/<key>.png  (+ assets/objects/screens.json for phone screens)

Each object: a crop box in the source frame, then rembg isolates it. Phones keep their
green screen as a measured rectangle, so the film can show its own frames on them.
"""
import json
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

S = "assets_raw/mixkit/stills/"
OBJ = {  # key: (frame, crop box x0, y0, x1, y1, sticker?)
    "phone": (S + "o100069_8.3.jpg", (420, 165, 815, 590), False),
    "phone_rose": (S + "o100077_3.jpg", (575, 275, 965, 630), False),
    "pencil": (S + "o100069_8.3.jpg", (715, 165, 1094, 352), False),
    "notebook": (S + "o100069_8.3.jpg", (10, 125, 400, 440), False),
    "clock": (S + "o39828_1.jpg", (690, 30, 1385, 1030), True, "u2net"),  # 1920x1080 frame
}
sessions = {m: new_session(m) for m in ("isnet-general-use", "u2net")}
screens = {}
for key, (src, box, sticker, *model) in OBJ.items():
    im = Image.open(src).convert("RGB").crop(box)
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS) if im.width < 800 else im  # room for clean edges
    cut = remove(im, session=sessions[model[0] if model else "isnet-general-use"], post_process_mask=True)
    a = np.array(cut)
    lab, n = ndimage.label(a[..., 3] > 100)          # keep the object, drop stray bits
    if n > 1:
        keep = 1 + np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)))
        mask = ndimage.binary_dilation(lab == keep, iterations=3)
        a[..., 3] = np.where(mask, a[..., 3], 0)
    if key.startswith("phone"):
        r, g, b = (a[..., i].astype(int) for i in range(3))
        green = (g > r + 45) & (g > b + 45) & (a[..., 3] > 0)
        ys, xs = np.nonzero(green)
        pts = np.stack([xs, ys], 1).astype(float)
        c = pts.mean(0); u, s_, vt = np.linalg.svd(pts - c, full_matrices=False)
        proj = (pts - c) @ vt.T
        lo, hi = np.percentile(proj, 0.5, 0), np.percentile(proj, 99.5, 0)
        ang = np.degrees(np.arctan2(vt[0, 1], vt[0, 0]))
        # the screen: opaque again (filled dark), its rect saved for the stage to paint into
        a[green] = [12, 12, 14, 255]
        screens[key] = {"cx": float(c[0] + ((lo + hi) / 2) @ vt[:, 0] * 0 + ((lo[0] + hi[0]) / 2) * vt[0, 0] + ((lo[1] + hi[1]) / 2) * vt[1, 0]),
                        "cy": float(c[1] + ((lo[0] + hi[0]) / 2) * vt[0, 1] + ((lo[1] + hi[1]) / 2) * vt[1, 1]),
                        "len": float(hi[0] - lo[0]), "wid": float(hi[1] - lo[1]), "ang": float(ang)}
    cut = Image.fromarray(a)
    alpha = cut.getchannel("A").point(lambda v: 255 if v > 128 else int(v * 1.6))
    cut.putalpha(alpha)
    if sticker:  # white die-cut border, like the headphones sticker in the reference
        pad = 40
        big = Image.new("RGBA", (cut.width + pad * 2, cut.height + pad * 2), (0, 0, 0, 0))
        big.paste(cut, (pad, pad), cut)
        ring = big.getchannel("A").filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(2)).point(lambda v: 255 if v > 100 else 0)
        base = Image.new("RGBA", big.size, (255, 255, 255, 0)); base.putalpha(ring)
        base.alpha_composite(big); cut = base
    bbox = cut.getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox()
    cut = cut.crop(bbox)
    if key in screens:
        screens[key]["cx"] -= bbox[0]; screens[key]["cy"] -= bbox[1]
        for k in screens[key]: screens[key][k] = round(screens[key][k] / cut.width, 5) if k != "ang" else round(screens[key][k], 2)
    if max(cut.size) > 1000:
        s = 1000 / max(cut.size)
        cut = cut.resize((round(cut.width * s), round(cut.height * s)), Image.LANCZOS)
    cut.save(f"assets/objects/{key}.png")
    print(key, cut.size, screens.get(key, ""))
json.dump(screens, open("assets/objects/screens.json", "w"), indent=1)

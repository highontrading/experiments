"""Cut real objects out of footage frames: build/cut/<name>.png (+ build/cut/index.js).

  python3 footage/make_cutouts.py           # all
  python3 footage/make_cutouts.py hand_green tv

Green-screen frames are chroma keyed; the rest go through rembg. Devices get their screen
corners (tl, tr, br, bl in cutout pixels) and a transparent screen, so the page can play
footage inside them.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FOOT = os.path.join(ROOT, "build", "footage")
OUT = os.path.join(ROOT, "build", "cut")
_sessions = {}


def frame(clip, i):
    return Image.open(os.path.join(FOOT, clip, f"f{i:04d}.jpg")).convert("RGB")


def rembg_alpha(img, model="isnet-general-use"):
    from rembg import new_session, remove
    if model not in _sessions:
        _sessions[model] = new_session(model)
    return np.asarray(remove(img, session=_sessions[model], only_mask=True, post_process_mask=True), dtype=np.float32) / 255


def green_mask(a, k=1.22, floor=80):
    r, g, b = a[..., 0].astype(np.float32), a[..., 1].astype(np.float32), a[..., 2].astype(np.float32)
    return (g > r * k) & (g > b * k) & (g > floor)


def border_fill(mask):
    """Pixels of `mask` connected to the image border (the backdrop)."""
    im = Image.fromarray((mask * 255).astype(np.uint8)).copy()
    h, w = mask.shape
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2), (w - 1, h // 2)]:
        if im.getpixel((x, y)) == 255:
            ImageDraw.floodfill(im, (x, y), 128)
    return np.asarray(im) == 128


def quad(mask):
    ys, xs = np.nonzero(mask)
    s, d = xs + ys, xs - ys
    return [[int(xs[s.argmin()]), int(ys[s.argmin()])], [int(xs[d.argmax()]), int(ys[d.argmax()])],
            [int(xs[s.argmax()]), int(ys[s.argmax()])], [int(xs[d.argmin()]), int(ys[d.argmin()])]]


def despill(a, alpha):
    a = a.astype(np.float32)
    edge = (alpha > 0.02) & (alpha < 0.98) | (alpha > 0.5)
    m = np.maximum(a[..., 0], a[..., 2])
    a[..., 1] = np.where(edge, np.minimum(a[..., 1], m * 1.05 + 4), a[..., 1])
    return a


def save(name, rgb, alpha, screen=None, pad=4):
    alpha = np.clip(alpha, 0, 1)
    ys, xs = np.nonzero(alpha > 0.05)
    x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    x1, y1 = min(alpha.shape[1], xs.max() + pad), min(alpha.shape[0], ys.max() + pad)
    rgba = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, name + ".png"))
    meta = {"w": int(x1 - x0), "h": int(y1 - y0)}
    if screen:
        meta["screen"] = [[int(x - x0), int(y - y0)] for x, y in screen]
    print(f"{name:14} {meta}")
    return meta


def hole(alpha, q, grow=2):
    m = Image.new("L", (alpha.shape[1], alpha.shape[0]), 0)
    ImageDraw.Draw(m).polygon([tuple(p) for p in q], fill=255)
    m = m.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    return alpha * (1 - np.asarray(m, dtype=np.float32) / 255)


def soft(mask, r=1.2):
    im = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im, dtype=np.float32) / 255


# --------------------------------------------------------------- recipes --
def hand_green():
    img = frame("hand_phone_green", 120); a = np.asarray(img)
    g = green_mask(a)
    bg = border_fill(g)
    screen = g & ~bg
    alpha = soft(~g, 1.0)
    alpha[:, 820:] = 0                               # the other hand's fingertips, bottom right
    q = quad(screen)
    return save("hand_green", despill(a, alpha), hole(alpha, q), q)


def hand_iphone():
    img = frame("hand_phone_blue", 1); a = np.asarray(img)
    alpha = rembg_alpha(img)
    scr = green_mask(a, 1.15, 60)
    ys, xs = np.nonzero(scr)
    keep = (xs > a.shape[1] * 0.25) & (xs < a.shape[1] * 0.8)
    m = np.zeros_like(scr); m[ys[keep], xs[keep]] = True
    q = quad(m)
    return save("hand_iphone", despill(a, alpha), hole(alpha, q, 3), q)


def tv():
    img = frame("tv_boombox", 60); a = np.asarray(img).astype(np.int32)
    alpha = rembg_alpha(img)
    h, w = alpha.shape
    blue = (a[..., 2] > a[..., 0] + 18) & (np.abs(np.arange(w)[None, :] - w * 0.55) < w * 0.22) & (np.abs(np.arange(h)[:, None] - h * 0.55) < h * 0.4)
    q = quad(blue)
    q = [[q[0][0] - 14, q[0][1] - 10], [q[1][0] + 12, q[1][1] - 10], [q[2][0] + 12, q[2][1] + 12], [q[3][0] - 16, q[3][1] + 12]]
    return save("tv", np.asarray(img), hole(alpha, q, 4), q)


def simple(name, clip, i, model="isnet-general-use"):
    img = frame(clip, i)
    return save(name, np.asarray(img), rembg_alpha(img, model))


RECIPES = {
    "hand_green": hand_green,
    "tv": tv,
    "sunflower": lambda: simple("sunflower", "sunflower", 60),
    "clapper": lambda: simple("clapper", "clapper", 30),
    "camera": lambda: simple("camera", "dslr", 100),
    "mic": lambda: simple("mic", "mic_close", 100),
    "vlogger": lambda: simple("vlogger", "street_vlog", 100, "isnet-general-use"),
    "watch": lambda: simple("watch", "watch_close", 90),
}

if __name__ == "__main__":
    idx_path = os.path.join(OUT, "index.json")
    index = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    for n in sys.argv[1:] or list(RECIPES):
        index[n] = RECIPES[n]()
    os.makedirs(OUT, exist_ok=True)
    json.dump(index, open(idx_path, "w"))
    with open(os.path.join(OUT, "index.js"), "w") as f:
        f.write("window.CUT_INDEX = " + json.dumps(index) + ";\n")

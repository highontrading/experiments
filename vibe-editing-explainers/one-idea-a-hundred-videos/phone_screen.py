"""Put real footage on the green screen of Mixkit #8839 (a hand holding a phone), crop to 9:16.

    python -I phone_screen.py  ->  ../assets/footage/oh_phone_a, oh_phone_b  (720x1280 @ 30 fps)
The green key is closed and hole-filled so the screen's tracking crosses disappear too.
"""
import pathlib, subprocess
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets_raw/mixkit/v8839.mp4"


def frames(path, ss, n, w=1280, h=720):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ss), "-i", str(path), "-vf", "fps=30", "-frames:v", str(n),
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def make(name, content, ss, n=96):
    out = ROOT / "assets/footage" / name; out.mkdir(parents=True, exist_ok=True)
    for f in out.glob("f*.jpg"): f.unlink()
    src = frames(SRC, ss, n)
    clip = sorted((ROOT / "assets/footage" / content).glob("f*.jpg"))
    for i, fr in enumerate(src):
        a = fr.astype(int)
        key = (a[..., 1] > a[..., 0] + 40) & (a[..., 1] > a[..., 2] + 40)
        key = ndimage.binary_closing(key, iterations=6)
        key = ndimage.binary_fill_holes(key)
        lab, k = ndimage.label(key)
        if k > 1:
            key = lab == 1 + np.argmax(ndimage.sum(key, lab, range(1, k + 1)))
        ys, xs = np.nonzero(key)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        c = Image.open(clip[i % len(clip)]).convert("RGB")
        W, H = x1 - x0 + 1, y1 - y0 + 1
        s = max(W / c.width, H / c.height); c = c.resize((round(c.width * s) + 1, round(c.height * s) + 1), Image.LANCZOS)
        cx, cy = (c.width - W) // 2, (c.height - H) // 2
        under = np.array(c)[cy:cy + H, cx:cx + W]
        soft = ndimage.gaussian_filter(key.astype(float), 0.8)[y0:y1 + 1, x0:x1 + 1, None]
        reg = fr[y0:y1 + 1, x0:x1 + 1].astype(float)
        fr2 = fr.copy()
        fr2[y0:y1 + 1, x0:x1 + 1] = (under * soft + reg * (1 - soft)).astype(np.uint8)
        Image.fromarray(fr2[:, 502:907]).resize((720, 1280), Image.LANCZOS).save(out / f"f{i + 1:04d}.jpg", quality=90)
    print(name, n)


make("oh_phone_a", "timelapse", 0.5)
make("oh_phone_b", "cw_creator", 3.8)

"""Ad 4 v2 grade: real footage only. Warm, moody, natural: the wall falls off into shadow toward the top and
edges (a soft 'practical light' window on the face), filmic highlight roll-off, warm skin, slightly cool blacks,
light grain. No matting, no replacement."""
import numpy as np
def grade(img, face=(540, 800), seed=0, look='A'):
    a = img.astype(np.float32) / 255; H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # light window: bright around the face, falling off to the top/edges (like a lamp just off-camera)
    win = np.exp(-(((xx - face[0]) / (W * .55)) ** 2 + ((yy - face[1] - 120) / (H * .36)) ** 2))[..., None]
    top = np.clip(1 - (yy / (H * .55)), 0, 1)[..., None] ** 1.6
    a = a * (.46 + .46 * win) * (1 - .62 * top)
    # filmic roll-off of the wall highlights
    a = 1 - np.exp(-a * 1.55); a = a / (1 - np.exp(-1.55))
    # contrast in the mids
    a = np.clip((a - .45) * 1.18 + .45, 0, 1)
    # warm mids/highs, cool-ish shadows
    l = (a @ np.array([.299, .587, .114], np.float32))[..., None]
    a = a * (1 + np.array([.07, .015, -.07], np.float32) * l) + (1 - l) ** 3 * np.array([-.01, 0, .018], np.float32)
    l = (a @ np.array([.299, .587, .114], np.float32))[..., None]; a = l + (a - l) * 1.02
    # vignette
    d = np.sqrt(((xx - W / 2) / (W * .7)) ** 2 + ((yy - H * .48) / (H * .6)) ** 2); a = a * (1 - .45 * np.clip(d - .35, 0, 1) ** 1.4)[..., None]
    out = np.clip(a, 0, 1) * 255 + np.random.default_rng(seed).normal(0, 3.0, (H, W))[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)

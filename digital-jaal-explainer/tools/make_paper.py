"""Procedural off-white paper texture (1080x1920) and 4 film-grain tiles."""
import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
W, H = 1080, 1920
def blur_noise(scale, sigma):
    n = rng.normal(0, 1, (H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray(((n - n.min()) / (np.ptp(n)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    im = im.filter(ImageFilter.GaussianBlur(sigma))
    a = np.asarray(im).astype(np.float32) / 255.0
    return (a - a.mean()) / (a.std() + 1e-6)
base = np.array([236, 233, 227], np.float32)
lum = 0.010 * blur_noise(40, 30) + 0.008 * blur_noise(8, 3) + 0.018 * rng.normal(0, 1, (H, W))
# fibers
fib = np.zeros((H, W), np.float32)
for _ in range(900):
    x, y = rng.uniform(0, W), rng.uniform(0, H); ang = rng.uniform(0, np.pi); L = rng.uniform(8, 40)
    for s in np.linspace(0, L, int(L)):
        xi, yi = int(x + np.cos(ang) * s), int(y + np.sin(ang) * s)
        if 0 <= xi < W and 0 <= yi < H: fib[yi, xi] += rng.uniform(-1, 1) * 0.5
fib = np.asarray(Image.fromarray(((fib + 1) * 127).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 127 - 1
lum += 0.025 * fib
# vignette
yy, xx = np.mgrid[0:H, 0:W]; r = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2)
lum -= 0.05 * np.clip(r - 0.25, 0, 1)
img = np.clip(base[None, None, :] * (1 + lum[..., None]), 0, 255).astype(np.uint8)
Image.fromarray(img).save("assets/img/paper.jpg", quality=93)
for i in range(4):
    g = rng.normal(0, 1, (512, 512))
    a = np.clip(np.abs(g) * 40, 0, 255).astype(np.uint8)
    col = np.where(g > 0, 255, 0).astype(np.uint8)
    Image.fromarray(np.dstack([col, col, col, a]), "RGBA").save(f"assets/img/grain{i}.png")
print("ok")

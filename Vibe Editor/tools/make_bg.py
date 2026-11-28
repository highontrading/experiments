"""Regenerate the background plates in brand/bg/ used by the AI background swaps."""
import os

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "brand", "bg")
W, H = 1080, 1920
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def radial(cx, cy, rx, ry):
    return np.clip(1 - np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2), 0, 1)


def save(arr, name):
    n = np.random.default_rng(1).normal(0, 2.2, arr.shape)  # dither against banding
    Image.fromarray(np.clip(arr + n, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    g = radial(540, 1000, 900, 1150) ** 1.6
    save(np.array([6, 10, 14]) + (np.array([62, 104, 118]) - np.array([6, 10, 14])) * g[..., None], "teal-spot.png")
    g = radial(540, 800, 1100, 1400) ** 1.2
    save(np.array([120, 8, 16]) + (np.array([206, 28, 38]) - np.array([120, 8, 16])) * g[..., None], "red-wall.png")
    g = radial(540, 900, 1000, 1300) ** 1.0
    save(np.array([205, 205, 205]) + (np.array([246, 246, 246]) - np.array([205, 205, 205])) * g[..., None], "white-seamless.png")
    g = radial(540, 1150, 900, 1100) ** 1.8 * 0.55
    lamp = radial(260, 330, 420, 420) ** 2.2
    c0, c1, cl = np.array([10, 8, 7]), np.array([70, 52, 38]), np.array([255, 186, 110])
    save(c0 + (c1 - c0) * g[..., None] + cl * lamp[..., None] * 0.55, "warm-room.png")
    g = radial(700, 2050, 1100, 800) ** 1.5
    save(np.zeros((H, W, 3)) + np.array([5, 6, 4]) + np.array([190, 255, 40]) * g[..., None], "lime-glow.png")

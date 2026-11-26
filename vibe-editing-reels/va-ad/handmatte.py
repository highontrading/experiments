#!/usr/bin/env python3
"""Hands/skin matte: person matte x bright-pixel key (the shirt is near-black, skin and watch are bright).
Lets the presenter's hands pass in front of glass cards. Writes build/hands/%04d.png (white + alpha)."""
import os, numpy as np
from PIL import Image, ImageFilter
os.makedirs("build/hands", exist_ok=True)
files = sorted(os.listdir("build/base"))
for k, f in enumerate(files):
    b = np.asarray(Image.open(f"build/base/{f}").convert("RGB").resize((540, 960), Image.BILINEAR), np.float32) / 255
    m = np.asarray(Image.open(f"build/matte/{f[:-4]}.png").split()[3].resize((540, 960), Image.BILINEAR).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.5)), np.float32) / 255
    lum = b @ np.array([.299, .587, .114], np.float32)
    key = np.clip((lum - 0.16) / 0.12, 0, 1)
    a = Image.fromarray((np.clip(key * m, 0, 1) * 255).astype(np.uint8))
    a = a.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    al = np.asarray(a)
    Image.fromarray(np.dstack([np.full_like(al, 255)] * 3 + [al]), "RGBA").save(f"build/hands/{f[:-4]}.png", compress_level=3)
print("hands", len(files))

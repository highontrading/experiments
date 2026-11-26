#!/usr/bin/env python3
"""Cut a person out of a photo (MODNet portrait matting) -> transparent PNG, trimmed.
usage: tools/cutout.py in.jpg out.png [--model ~/.cache/vibe-editor/modnet.onnx]
For objects on a light background use --light (alpha from distance to the background colour)."""
import sys, os, numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
if "--light" in sys.argv:
    a = np.asarray(im).astype(np.float32)
    bg = np.median(np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)]), axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    m = np.clip((d - 18) / 30, 0, 1)
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))
else:
    import onnxruntime as ort
    model = os.path.expanduser("~/.cache/vibe-editor/modnet.onnx")
    sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
    W, H = im.size; s = 512 / max(W, H)
    rw, rh = max(32, int(W * s) // 32 * 32), max(32, int(H * s) // 32 * 32)
    x = (np.asarray(im.resize((rw, rh), Image.BILINEAR)).astype(np.float32) / 127.5 - 1).transpose(2, 0, 1)[None]
    out = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
    mask = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).resize(im.size, Image.BILINEAR)
rgba = im.copy(); rgba.putalpha(mask)
bbox = mask.point(lambda v: 255 if v > 24 else 0).getbbox()
rgba.crop(bbox).save(dst)
print(dst, rgba.crop(bbox).size)

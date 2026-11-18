"""Extend the portrait GTA VI end card to 16:9 (1920x1080) by continuing its sky gradient and palms."""
import cv2, numpy as np, sys
src, out = sys.argv[1], sys.argv[2]
im = cv2.imread(src).astype(np.float32)
W, H = 1920, 1080
s = 1.19
im = cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_LANCZOS4)
cy = int(607 * s)
crop = im[cy - H // 2: cy - H // 2 + H]
cw = crop.shape[1]
logo_cx = int(490 * s)                      # logo centre in the source is left of middle
L = W // 2 - logo_cx; Rw = W - cw - L
mstart = int(1148 * s / 1.19)               # first column right of the logo
strip = crop[:, mstart:]                     # palms + sky, logo-free
canvas = np.zeros((H, W, 3), np.float32)
canvas[:, L:L + cw] = crop
# right: mirror of the right edge
canvas[:, L + cw:] = crop[:, cw - Rw:][:, ::-1]
# left: logo-free strip, reflected as needed to fill the width
need = L
tiles = []
flip = False
while sum(t.shape[1] for t in tiles) < need:
    tiles.append(strip[:, ::-1] if flip else strip)
    flip = not flip
left = np.concatenate(tiles[::-1], 1)[:, -need:]
canvas[:, :L] = left
f = 60
ramp = np.linspace(0, 1, f)[None, :, None]
canvas[:, L:L + f] = canvas[:, L:L + f] * ramp + left[:, -1:].repeat(f, 1) * (1 - ramp) * 0.5 + canvas[:, L:L + f] * (1 - ramp) * 0.5
# soften both seams slightly
for x in (L, L + cw):
    band = canvas[:, x - 6:x + 6]
    canvas[:, x - 6:x + 6] = cv2.GaussianBlur(band, (0, 0), 3)
cv2.imwrite(out, np.clip(canvas, 0, 255).astype(np.uint8))
print(canvas.shape, L, Rw)

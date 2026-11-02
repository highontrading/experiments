#!/usr/bin/env bash
# Assets for T02C: fetch footage, then key the real red wall clock (Mixkit 9309, filmed on a
# green screen with its hands racing) into a transparent PNG sequence: assets/footage/pc_clockkey/.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -I lib/fetch.py t02c-pain-clock-time-lapse
SRC=assets_raw/mixkit/v9309.mp4
[ -s "$SRC" ] || curl -sfL -m 300 -o "$SRC" https://assets.mixkit.co/videos/9309/9309-720.mp4
TMP=$(mktemp -d); OUT=assets/footage/pc_clockkey; mkdir -p "$OUT"; rm -f "$OUT"/f*.png
ffmpeg -v error -y -ss 0 -t 8 -i "$SRC" -vf "fps=30,crop=644:644:296:28,scale=520:520" "$TMP/f%04d.png"
python3 - "$TMP" "$OUT" <<'PY'
import sys, pathlib, numpy as np
from PIL import Image
src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
for f in sorted(src.glob("f*.png")):
    a = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    spill = g - np.maximum(r, b)                       # how green a pixel is
    alpha = 1 - np.clip((spill - 28) / 46, 0, 1)
    g2 = np.where(spill > 0, np.maximum(r, b) + spill * 0.15, g)   # despill the edges
    rgba = np.dstack([r, g2, b, alpha * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(out / f.name, optimize=True)
print(len(list(out.glob("f*.png"))), "keyed frames")
PY
rm -rf "$TMP"

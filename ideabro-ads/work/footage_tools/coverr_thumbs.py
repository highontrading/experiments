"""Labelled thumbnail grid for Coverr CDN bases.

Usage: python3 -I coverr_thumbs.py THUMB_DIR OUT.jpg base1 base2 ...
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def main():
    tdir, out, bases = sys.argv[1], sys.argv[2], sys.argv[3:]
    os.makedirs(tdir, exist_ok=True)
    tiles = []
    for i, b in enumerate(bases):
        p = os.path.join(tdir, b + ".jpg")
        if not os.path.exists(p):
            subprocess.run(["curl", "-sSL", "-A", UA, "-o", p, f"https://cdn.coverr.co/videos/{b}/thumbnail?width=640"])
        try:
            im = Image.open(p).convert("RGB")
        except Exception:
            im = Image.new("RGB", (320, 180), "gray")
        im.thumbnail((320, 290))
        t = Image.new("RGB", (320, 320), "black")
        t.paste(im, ((320 - im.width) // 2, 0))
        ImageDraw.Draw(t).text((4, 298), f"{i}: {b[7:40]}", fill="yellow", font=ImageFont.load_default(size=13))
        tiles.append(t)
    cols = 6
    g = Image.new("RGB", (cols * 320, ((len(tiles) + cols - 1) // cols) * 320), "black")
    for i, t in enumerate(tiles):
        g.paste(t, ((i % cols) * 320, (i // cols) * 320))
    g.save(out, quality=80)


if __name__ == "__main__":
    main()

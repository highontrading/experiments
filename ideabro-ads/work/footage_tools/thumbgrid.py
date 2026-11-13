"""Download Mixkit thumbnails for given ids and build a labelled grid.

Usage: python3 -I thumbgrid.py THUMB_DIR OUT.jpg id1 id2 ...
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def main():
    tdir, out, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
    os.makedirs(tdir, exist_ok=True)
    tiles = []
    for vid in ids:
        p = os.path.join(tdir, f"{vid}.jpg")
        if not os.path.exists(p):
            subprocess.run(["curl", "-sSL", "-A", UA, "-o", p,
                            f"https://assets.mixkit.co/videos/{vid}/{vid}-thumb-720-0.jpg"])
        try:
            im = Image.open(p).convert("RGB")
        except Exception:
            im = None
        if im is None:
            # newer clips have no static thumb: grab a mid frame from the 360p preview
            import cv2
            mp = os.path.join(tdir, f"{vid}-360.mp4")
            if not os.path.exists(mp) or os.path.getsize(mp) < 10000:
                import glob, re
                url = f"https://assets.mixkit.co/videos/{vid}/{vid}-360.mp4"
                for pg in glob.glob(os.path.join(os.path.dirname(tdir), "html", "mkpages", f"{vid}.html")):
                    m = re.search(r'https://assets\.mixkit\.co/[^"]*?' + vid + r'-video-360\.mp4', open(pg, errors="ignore").read())
                    if m:
                        url = m.group(0)
                subprocess.run(["curl", "-sSL", "-A", UA, "-o", mp, url])
            cap = cv2.VideoCapture(mp)
            n = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, n // 2))
            ok, fr = cap.read()
            im = Image.fromarray(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)) if ok else Image.new("RGB", (320, 180), "gray")
        im.thumbnail((320, 320))
        tile = Image.new("RGB", (320, 320), "black")
        tile.paste(im, ((320 - im.width) // 2, (300 - im.height) // 2))
        d = ImageDraw.Draw(tile)
        d.rectangle([0, 296, 320, 320], fill="black")
        d.text((4, 300), f"{vid}  {im.width}x{im.height}", fill="yellow",
               font=ImageFont.load_default(size=16))
        tiles.append(tile)
    cols = 6
    rows = (len(tiles) + cols - 1) // cols
    grid = Image.new("RGB", (cols * 320, rows * 320), "black")
    for i, t in enumerate(tiles):
        grid.paste(t, ((i % cols) * 320, (i // cols) * 320))
    grid.save(out, quality=80)


if __name__ == "__main__":
    main()

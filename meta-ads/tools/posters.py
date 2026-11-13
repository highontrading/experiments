"""Poster grid of all ads (frame at ~35% of each) -> out/_all_ads_overview.jpg"""
import glob, subprocess, os
from PIL import Image, ImageDraw, ImageFont
fs = sorted(glob.glob("out/a*.mp4")); tiles = []
for f in fs:
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))
    p = f"build/qa/poster_{os.path.basename(f)[:3]}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(d * 0.32), "-i", f, "-frames:v", "1", "-vf", "scale=360:-2", p], check=True)
    tiles.append((os.path.basename(f), Image.open(p)))
cols = 5; W = 360; H = 640 + 40; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (cols * W, rows * H), "#111"); d = ImageDraw.Draw(sheet)
try: fnt = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
except Exception: fnt = None
for i, (n, im) in enumerate(tiles):
    x, y = (i % cols) * W, (i // cols) * H; sheet.paste(im, (x, y + (640 - im.height) // 2)); d.text((x + 8, y + 648), n[:40], fill="#ddd", font=fnt)
sheet.save("out/_all_ads_overview.jpg", quality=85); print(len(tiles))

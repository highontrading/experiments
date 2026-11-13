"""Contact sheets.

Single clip, one frame every N seconds, labelled with timecodes:
  python3 -I contact.py clip IN.mp4 OUT.jpg INTERVAL [TITLE]
Many clips, a few frames each (one row per clip), labelled with file name:
  python3 -I contact.py multi OUT.jpg FRAMES_PER_CLIP IN1.mp4 IN2.mp4 ...
"""
import os
import sys

import cv2
from PIL import Image, ImageDraw, ImageFont

FONT = ImageFont.load_default(size=18)
SMALL = ImageFont.load_default(size=15)


def grab(cap, t):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, fr = cap.read()
    if not ok:
        return None
    return Image.fromarray(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB))


def info(cap):
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    n = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    return n / fps if n > 0 else 0, int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))


def tile(im, box, label):
    t = Image.new("RGB", (box, box), (20, 20, 20))
    if im is not None:
        im = im.copy()
        im.thumbnail((box, box - 22))
        t.paste(im, ((box - im.width) // 2, (box - 22 - im.height) // 2))
    d = ImageDraw.Draw(t)
    d.text((4, box - 20), label, fill=(255, 230, 0), font=SMALL)
    return t


def clip_sheet(src, out, interval, title):
    cap = cv2.VideoCapture(src)
    dur, w, h = info(cap)
    times = [x * interval for x in range(int(dur // interval) + 1) if x * interval < dur - 0.05] or [0]
    box = 240
    cols = 8
    rows = (len(times) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * box, rows * box + 30), "black")
    ImageDraw.Draw(sheet).text((6, 5), f"{title}  {w}x{h}  {dur:.1f}s", fill="white", font=FONT)
    for i, t in enumerate(times):
        sheet.paste(tile(grab(cap, t), box, f"{int(t // 60)}:{t % 60:04.1f}"), ((i % cols) * box, 30 + (i // cols) * box))
    sheet.save(out, quality=82)


def multi_sheet(out, k, srcs):
    box = 220
    label_w = 300
    sheet = Image.new("RGB", (label_w + k * box, len(srcs) * box), "black")
    d = ImageDraw.Draw(sheet)
    for r, src in enumerate(srcs):
        cap = cv2.VideoCapture(src)
        dur, w, h = info(cap)
        name = os.path.basename(src)
        lines = [name[i:i + 30] for i in range(0, len(name), 30)][:4] + [f"{w}x{h} {dur:.1f}s"]
        for j, ln in enumerate(lines):
            d.text((6, r * box + 10 + j * 22), ln, fill="white", font=SMALL)
        for c in range(k):
            t = dur * (c + 0.5) / k
            sheet.paste(tile(grab(cap, t), box, f"{t:.1f}s"), (label_w + c * box, r * box))
    sheet.save(out, quality=80)


if __name__ == "__main__":
    if sys.argv[1] == "clip":
        clip_sheet(sys.argv[2], sys.argv[3], float(sys.argv[4]), sys.argv[5] if len(sys.argv) > 5 else os.path.basename(sys.argv[2]))
    else:
        multi_sheet(sys.argv[2], int(sys.argv[3]), sys.argv[4:])

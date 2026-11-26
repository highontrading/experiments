#!/usr/bin/env python3
"""Raw vs edited promo layout (1080x1920):
title "Fully Edited by AI" -> small Raw card tucked behind a large Edited card -> CTA 'Comment "VIBE"'.
Raw = camera original with the same pause cuts (no grade/graphics). Audio = edited mix.
Static design layers are drawn with PIL; the two videos are masked into rounded cards by ffmpeg."""
import json, os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

O = "/home/user/experiments/vibe-editor-workspace/output"
RAW = "/home/user/experiments/vibe-editor-workspace/inbox/raw2.mp4"
EDIT = f"{O}/va-reel-v2.mp4"
OUT = f"{O}/va-reel-v2-raw-vs-edited.mp4"
LIB = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/library/fonts/"
XB, BOLD = LIB + "Inter-ExtraBold.otf", LIB + "Inter-Bold.otf"
REG = "build/Inter-400.ttf"
B = "build/cmp"; os.makedirs(B, exist_ok=True)
W, H = 1080, 1920
INK = (17, 17, 19)

# layout (proportions taken from the reference)
RAWC = dict(x=104, y=520, w=420, h=746, r=38)    # small card, partly hidden
EDC = dict(x=404, y=404, w=560, h=995, r=44)     # large card in front
TITLE_Y, CTA_Y, SUB_Y = 214, 1532, 1606

# ---- background: white with soft blue-grey haze top and bottom --------------
yy = np.linspace(0, 1, H)[:, None]
xx = np.linspace(0, 1, W)[None, :]
top = np.exp(-((yy - 0.0) / 0.075) ** 2)
bot = np.exp(-((yy - 1.0) / 0.13) ** 2) * (0.75 + 0.25 * xx)
side = np.exp(-((xx - 1.0) / 0.22) ** 2) * np.exp(-((yy - 0.18) / 0.18) ** 2) * 0.55
white = np.array([250, 251, 253], float)
tint_top = np.array([168, 180, 200], float)
tint_bot = np.array([188, 206, 238], float)
tint_side = np.array([196, 214, 244], float)
img = white * (1 - top[..., None] - bot[..., None] * 0.9 - side[..., None])
img += tint_top * top[..., None] + tint_bot * bot[..., None] * 0.9 + tint_side * side[..., None]
img = np.clip(img + np.random.default_rng(3).normal(0, 0.8, img.shape), 0, 255).astype(np.uint8)
bg = Image.fromarray(img, "RGB").convert("RGBA")

def shadow(card, blur=34, off=22, alpha=70):
    s = Image.new("L", (W, H), 0)
    ImageDraw.Draw(s).rounded_rectangle([card["x"], card["y"] + off, card["x"] + card["w"], card["y"] + card["h"] + off], card["r"], fill=alpha)
    s = s.filter(ImageFilter.GaussianBlur(blur))
    lay = Image.new("RGBA", (W, H), (20, 30, 50, 0)); lay.putalpha(s); return lay

bg = Image.alpha_composite(bg, shadow(RAWC, 30, 18, 60))
d = ImageDraw.Draw(bg)
def ctext(txt, font, cx, cy, fill=INK):
    l, t, r, b = d.textbbox((0, 0), txt, font=font)
    d.text((cx - (r - l) / 2 - l, cy - (b - t) / 2 - t), txt, font=font, fill=fill)
ctext("Fully Edited by AI", ImageFont.truetype(XB, 80), W / 2, TITLE_Y)
lab = ImageFont.truetype(BOLD, 40)
ctext("Raw", lab, RAWC["x"] + (EDC["x"] - RAWC["x"]) / 2, RAWC["y"] - 40)
ctext("Edited", lab, EDC["x"] + EDC["w"] / 2, EDC["y"] - 40)
ctext('Comment "VIBE"', ImageFont.truetype(XB, 82), W / 2, CTA_Y)
ctext("And I'll share the guide", ImageFont.truetype(REG, 44), W / 2, SUB_Y)
bg.convert("RGB").save(f"{B}/bg.png")
shadow(EDC, 40, 26, 85).save(f"{B}/edshadow.png")

def mask(card, path):
    m = Image.new("L", (card["w"], card["h"]), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, card["w"] - 1, card["h"] - 1], card["r"], fill=255)
    m.save(path)
mask(RAWC, f"{B}/mraw.png"); mask(EDC, f"{B}/med.png")

segs = json.load(open("build/segments.json"))
trims = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[r{i}];" for i, (a, b) in enumerate(segs))
fc = (trims + "".join(f"[r{i}]" for i in range(len(segs))) +
      f"concat=n={len(segs)}:v=1:a=0,fps=30,scale={RAWC['w']}:{RAWC['h']}:force_original_aspect_ratio=increase:flags=lanczos,"
      f"crop={RAWC['w']}:{RAWC['h']},format=rgba[rv];[rv][3:v]alphamerge[rc];"
      f"[1:v]scale={EDC['w']}:{EDC['h']}:flags=lanczos,format=rgba[ev];[ev][4:v]alphamerge[ec];"
      f"[2:v][rc]overlay={RAWC['x']}:{RAWC['y']}:shortest=1[a1];[a1][5:v]overlay=0:0[a2];"
      f"[a2][ec]overlay={EDC['x']}:{EDC['y']}:shortest=1,format=yuv420p[v]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-i", EDIT,
                "-loop", "1", "-framerate", "30", "-i", f"{B}/bg.png",
                "-loop", "1", "-i", f"{B}/mraw.png", "-loop", "1", "-i", f"{B}/med.png",
                "-loop", "1", "-i", f"{B}/edshadow.png",
                "-filter_complex", fc, "-map", "[v]", "-map", "1:a", "-t", "26.8",
                "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart", OUT], check=True)
print("ok", OUT)

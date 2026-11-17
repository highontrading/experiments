"""Comparison ad (1080x1920): raw cut vs AI edit side by side, all text inside the Reels safe zone
(top 14% = 269 px, bottom 35% = 672 px, sides 6% = 65 px are kept clear of text).
usage: python3 comp.py RAW_CUT.mp4 EDIT.mp4 OUT.mp4 WORKDIR"""
import sys, subprocess, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
raw, edit, out, wd = sys.argv[1:5]; os.makedirs(wd, exist_ok=True)
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts')
font = lambda n, s: ImageFont.truetype(f'{F}/{n}.ttf', s)
W, H = 1080, 1920
SAFE_T, SAFE_B = 269, 1248
PW, PH, GAP = 416, 740, 26
X0 = (W - 2 * PW - GAP) // 2; Y0 = 412
bg = Image.new('RGB', (W, H), (18, 10, 6)); d = ImageDraw.Draw(bg)
# warm radial glow
glow = Image.new('L', (W, H), 0); ImageDraw.Draw(glow).ellipse((-200, 150, 1280, 1500), fill=110)
glow = glow.filter(ImageFilter.GaussianBlur(220))
bg = Image.composite(Image.new('RGB', (W, H), (92, 52, 26)), bg, glow); d = ImageDraw.Draw(bg)
# headline
f1, f2 = font('IB', 40) if False else font('Inter-ExtraBold', 40), font('PlayfairDisplay-Italic900', 112)
d.text((W / 2, 286), 'WATCH THE DIFFERENCE', font=font('JetBrainsMono-Bold', 30), fill=(242, 194, 48), anchor='mm')
hl = 'AI edited this.'
d.text((W / 2 + 3, 345), hl, font=f2, fill=(0, 0, 0), anchor='mm')
d.text((W / 2, 341), hl, font=f2, fill=(255, 255, 255), anchor='mm')
# panel shadows + frames
sh = Image.new('L', (W, H), 0); sd = ImageDraw.Draw(sh)
for k in range(2): x = X0 + k * (PW + GAP); sd.rounded_rectangle((x + 6, Y0 + 14, x + PW + 6, Y0 + PH + 14), 30, fill=170)
bg = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), bg, sh.filter(ImageFilter.GaussianBlur(18))); d = ImageDraw.Draw(bg)
for k, col in enumerate([(120, 110, 100), (242, 194, 48)]):
    x = X0 + k * (PW + GAP); d.rounded_rectangle((x - 4, Y0 - 4, x + PW + 4, Y0 + PH + 4), 33, outline=col, width=4)
# arrow badge between panels
cx, cy = W // 2, Y0 + PH // 2
# faint wordmark in the lower (UI-covered) area: decorative only
wm = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(wm).text((W / 2, 1480), 'VIBE EDITING', font=font('Anton', 190), fill=(255, 220, 180, 22), anchor='mm')
bg = Image.alpha_composite(bg.convert('RGBA'), wm).convert('RGB'); d = ImageDraw.Draw(bg)
# CTA pill (inside the safe zone)
cta_y = Y0 + PH + 16; pw = 640
assert cta_y + 76 * 1.04 <= SAFE_B, cta_y + 76
# CTA as its own layer so it can pulse gently (drawn 2x for crisp scaling)
cta = Image.new('RGBA', (pw * 2 + 40, 76 * 2 + 40), (0, 0, 0, 0)); cd = ImageDraw.Draw(cta)
cd.rounded_rectangle((20, 20, 20 + pw * 2, 20 + 152), 76, fill=(242, 194, 48, 255))
cd.text((20 + pw, 20 + 76), 'Learn the workflow  →', font=font('Inter-ExtraBold', 80), fill=(20, 12, 6), anchor='mm')
cta.save(f'{wd}/comp_cta.png'); CTA_CY = cta_y + 38
bg.save(f'{wd}/comp_bg.png')
# labels drawn on top of the videos
lab = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lab)
for k, (txt, fill, ink) in enumerate([('RAW TAKE', (20, 14, 10, 200), (255, 255, 255)), ('AI EDIT', (242, 194, 48, 255), (20, 12, 6))]):
    x = X0 + k * (PW + GAP) + 18; y = Y0 + 18; f = font('Inter-ExtraBold', 26); tw = ld.textlength(txt, font=f)
    ld.rounded_rectangle((x, y, x + tw + 32, y + 46), 23, fill=fill); ld.text((x + 16, y + 23), txt, font=f, fill=ink, anchor='lm')
ld.ellipse((cx - 34, cy - 34, cx + 34, cy + 34), fill=(242, 194, 48), outline=(20, 12, 6), width=4); ld.text((cx + 1, cy - 3), '→', font=font('Inter-ExtraBold', 44), fill=(20, 12, 6), anchor='mm')
lab.save(f'{wd}/comp_labels.png')
m = Image.new('L', (PW, PH), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, PW - 1, PH - 1), 30, fill=255); m.save(f'{wd}/comp_mask.png')
fc = (f"[1:v]scale={PW}:{PH},setsar=1,format=rgba[r0];[4:v]format=gray[m];[m]split[m1][m2];"
      f"[2:v]scale={PW}:{PH}:flags=lanczos,setsar=1,format=rgba[e0];[r0][m1]alphamerge[r];[e0][m2]alphamerge[e];"
      f"[0:v][r]overlay={X0}:{Y0}[a];[a][e]overlay={X0 + PW + GAP}:{Y0}[b];[b][3:v]overlay=0:0[c];"
      f"[5:v]scale=w='trunc(({pw + 20})*(1+0.035*pow(sin(PI*t/1.4),8))/2)*2':h=-2:eval=frame:flags=lanczos[p];"
      f"[c][p]overlay=x='(W-w)/2':y='{CTA_CY}-h/2':eval=frame,format=yuv420p[v]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-i', f'{wd}/comp_bg.png', '-i', raw, '-i', edit,
                '-loop', '1', '-framerate', '30', '-i', f'{wd}/comp_labels.png', '-loop', '1', '-framerate', '30', '-i', f'{wd}/comp_mask.png', '-loop', '1', '-framerate', '30', '-i', f'{wd}/comp_cta.png',
                '-filter_complex', fc, '-map', '[v]', '-map', '2:a', '-shortest', '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
                '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
print('wrote', out)

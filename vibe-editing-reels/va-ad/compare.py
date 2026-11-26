#!/usr/bin/env python3
"""Raw vs edited side-by-side (raw = camera original with the same pause cuts; audio = edited mix)."""
import json, subprocess
from PIL import ImageFont
O = "/home/user/experiments/vibe-editor-workspace/output"
RAW = "/home/user/experiments/vibe-editor-workspace/inbox/raw2.mp4"
segs = json.load(open("build/segments.json"))
LIB = "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/library/fonts/"
BOLD, SER, LIGHT = LIB + "Inter-Bold.otf", LIB + "InstrumentSerif-Italic.ttf", "/home/user/experiments/vibe-editor-workspace/fonts/Inter-Light.ttf"
W, H = 1080, 1920; vw, vh = 528, 938; gap = 8; x1 = (W - 2 * vw - gap) // 2; x2 = x1 + vw + gap; vy = 600
fb, fs = ImageFont.truetype(BOLD, 92), ImageFont.truetype(SER, 136)
parts = [("raw", fb, BOLD, 92, "white"), ("vs", fs, SER, 136, "0x5E95E0"), ("edited", fb, BOLD, 92, "white")]
sp = 26; widths = [f.getlength(t) for t, f, *_ in parts]; x = (W - sum(widths) - 2 * sp) / 2
BASE = 420; dt = []
for (t, f, ff, size, c), wd in zip(parts, widths):
    dt.append(f"drawtext=fontfile='{ff}':text='{t}':fontsize={size}:fontcolor={c}:x={x:.0f}:y={BASE}-ascent"); x += wd + sp
dt.append(f"drawtext=fontfile='{LIGHT}':text='same take   ·   same cuts':fontsize=34:fontcolor=0x9AA7B0:x=(w-text_w)/2:y={BASE+28}")
def pill(cx, text, fill, tc):
    f = ImageFont.truetype(BOLD, 30); tw = f.getlength(text); pw = tw + 44; ph = 54; px = cx - pw / 2; py = vy - 72
    return [f"drawbox=x={px:.0f}:y={py}:w={pw:.0f}:h={ph}:color={fill}:t=fill",
            f"drawtext=fontfile='{BOLD}':text='{text}':fontsize=30:fontcolor={tc}:x={cx-tw/2:.0f}:y={py+12}"]
dt += pill(x1 + vw / 2, "RAW", "0x2A3238", "0xC9D1D6") + pill(x2 + vw / 2, "EDITED", "0x3A74C9", "white")
dt.append(f"drawtext=fontfile='{LIGHT}':text='inspired by the Dynamic Word Reels design system':fontsize=30:fontcolor=0x7F8C95:x=(w-text_w)/2:y={vy+vh+56}")
trims = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[r{i}];" for i, (a, b) in enumerate(segs))
fc = (trims + "".join(f"[r{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=0,fps=30,scale={vw}:{vh}:flags=lanczos,setsar=1[raw];"
      f"[1:v]scale={vw}:{vh}:flags=lanczos,setsar=1[ed];color=c=0x0E1418:s={W}x{H}:r=30[bg];"
      f"[bg][raw]overlay={x1}:{vy}:shortest=1[a1];[a1][ed]overlay={x2}:{vy}:shortest=1," + ",".join(dt) + ",format=yuv420p[v]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-i", f"{O}/va-reel-v2.mp4", "-filter_complex", fc, "-map", "[v]", "-map", "1:a",
                "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest",
                f"{O}/va-reel-v2-raw-vs-edited.mp4"], check=True)
print("ok")

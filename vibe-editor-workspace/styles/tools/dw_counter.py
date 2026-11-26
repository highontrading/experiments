#!/usr/bin/env python3
"""Dynamic Word Reels: glossy ice-blue count-up number as a raw `ass` event.

The library `counter` always draws a black outline; the reference uses an outline-free,
vertically graded (ice-blue top -> steel-blue bottom), slightly translucent heavy number
that rises in with blur and counts with a cubic ease-out (fast first, slow landing).

Usage:  python3 dw_counter.py --from 6 --to 20 --at 7.17 --dur 1.9 --run 0.67 [--y 1050] [--size 300]
Prints one JSON event to paste into edit.json "events".
"""
import argparse, json

ap = argparse.ArgumentParser()
ap.add_argument("--from", dest="frm", type=float, default=0)
ap.add_argument("--to", type=float, default=10)
ap.add_argument("--at", type=float, default=0)
ap.add_argument("--dur", type=float, default=1.8)
ap.add_argument("--run", type=float, default=0.6, help="seconds the count runs (reference: 0.5-0.7)")
ap.add_argument("--x", type=int, default=540)
ap.add_argument("--y", type=int, default=1100, help="centre y on the 1080x1920 canvas")
ap.add_argument("--size", type=int, default=300)
ap.add_argument("--font", default="inter-extrabold")
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--sfx", default="sparkle")
a = ap.parse_args()

BANDS = ["#EAF5FE", "#D2E7F9", "#B5D6F3", "#98C3EA", "#7FAEDF", "#6797D0", "#5383C2", "#4373B3", "#3A68A6"]  # top -> bottom
cap = a.size * 0.74
top = a.y - cap / 2
n = max(2, int(a.run * a.fps))
vals = []
for i in range(n + 1):
    p = 1 - (1 - i / n) ** 3
    v = round(a.frm + (a.to - a.frm) * p)
    t0 = i / a.fps
    if vals and vals[-1][0] == v:
        continue
    vals.append([v, t0])
layers = []
for k, (v, t0) in enumerate(vals):
    t1 = vals[k + 1][1] if k + 1 < len(vals) else a.dur
    last = k == len(vals) - 1
    first = k == 0
    for bi, col in enumerate(BANDS):
        y0 = top + cap * bi / len(BANDS) - (60 if bi == 0 else 0)
        y1 = top + cap * (bi + 1) / len(BANDS) + (60 if bi == len(BANDS) - 1 else 0)
        tag = f"\\an5\\bord0\\shad0\\alpha&H14&\\clip(0,{y0:.0f},1080,{y1:.0f})"
        if first:
            tag += f"\\move({a.x},{a.y + 90},{a.x},{a.y},0,140)\\blur10\\t(0,140,\\blur0.6)"
        else:
            tag += f"\\pos({a.x},{a.y})\\blur0.6"
        if last:
            ms = int((t1 - t0) * 1000)
            tag += f"\\t({max(0, ms - 220)},{ms},\\blur12\\alpha&HFF&\\fscx104)"
        layers.append({"start": round(t0, 3), "end": round(t1, 3), "layer": 9, "font": a.font,
                       "size": a.size, "color": col, "text": "{" + tag + "}" + str(int(v))})
    # soft inner highlight
    layers.append({"start": round(t0, 3), "end": round(t1, 3), "layer": 10, "font": a.font, "size": a.size,
                   "color": "#FFFFFF", "text": "{\\an5\\pos(%d,%d)\\bord0\\shad0\\alpha&HC8&\\blur2\\clip(0,%d,1080,%d)}%d"
                   % (a.x, a.y, top - 60, top + cap * 0.18, int(v))})
ev = {"type": "ass", "at": a.at, "dur": a.dur, "layers": layers, "box": [0.2, (a.y - cap) / 1920, 0.8, (a.y + cap) / 1920]}
if a.sfx:
    ev["sfx"] = a.sfx
print(json.dumps(ev))

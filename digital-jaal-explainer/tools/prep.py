"""Extract each clip range at 30 fps into build/frames/<name>/NNNN.(jpg|webp).
Green clips are keyed in numpy and saved as RGBA WebP. Writes build/frames/manifest.json.
Usage: python3 tools/prep.py CLIPDIR [names...]"""
import sys, os, json, subprocess, numpy as np
from PIL import Image
PRE = POST = 0.7
FPS = 30
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
clipdir = sys.argv[1]
spec = json.load(open(f"{root}/clips.json"))
only = sys.argv[2:]
out = f"{root}/build/frames"; os.makedirs(out, exist_ok=True)
mpath = f"{out}/manifest.json"
man = json.load(open(mpath)) if os.path.exists(mpath) else {}

def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height:format=duration", "-of", "json", p], capture_output=True, text=True)
    j = json.loads(r.stdout); s = j["streams"][0]
    return s["width"], s["height"], float(j["format"]["duration"])

def key_green(a):
    f = a.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    gs = g - np.maximum(r, b)                       # greenness
    alpha = np.clip(1.0 - (gs - 18) / 42.0, 0, 1)   # soft matte
    # despill: clamp green towards max(r,b) on edges/spill
    g2 = np.where(gs > 0, np.maximum(r, b) + gs * 0.15, g)
    rgb = np.stack([r, g2, b], -1)
    # erode matte slightly to kill green fringe
    al = alpha.copy()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        al = np.minimum(al, np.roll(np.roll(alpha, dx, 1), dy, 0))
    alpha = 0.5 * alpha + 0.5 * al
    return np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)

for name, c in spec.items():
    if only and name not in only: continue
    src = f"{clipdir}/{c['id']}.mp4"
    w, h, dur = probe(src)
    t0 = max(0.0, c["in"] - PRE); t1 = min(dur - 0.05, c["in"] + c["dur"] + POST)
    d = f"{out}/{name}"; os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(f"{d}/{f}")
    keyed = c.get("key") == "green"
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-i", src, "-t", f"{t1 - t0:.3f}",
           "-vf", f"fps={FPS}", "-start_number", "0"]
    if keyed:
        cmd += ["-pix_fmt", "rgb24", f"{d}/%04d.png"]
    else:
        cmd += ["-q:v", "2", f"{d}/%04d.jpg"]
    subprocess.run(cmd, check=True)
    files = sorted(os.listdir(d))
    if keyed:
        for fn in files:
            a = np.array(Image.open(f"{d}/{fn}").convert("RGB"))
            Image.fromarray(key_green(a), "RGBA").save(f"{d}/{fn[:-4]}.webp", quality=88, method=4)
            os.remove(f"{d}/{fn}")
    n = len(os.listdir(d))
    man[name] = {"start": round(t0, 3), "in": c["in"], "n": n, "w": w, "h": h,
                 "ext": "webp" if keyed else "jpg"}
    print(name, man[name])
json.dump(man, open(mpath, "w"), indent=1)

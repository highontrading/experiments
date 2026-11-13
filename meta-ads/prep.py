"""Prepare per-ad frame sequences: python3 prep.py a01  (spec in seqs.py) -> build/a01/seq/<name>/f%04d.jpg + build/a01/assets.js"""
import json, os, subprocess, sys, urllib.request
from seqs import SEQS
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"}
def src_path(s):
    if s.startswith("mixkit:"):
        vid = s.split(":")[1]; p = f"build/stock/mk_{vid}.mp4"
        if not os.path.exists(p):
            for q in ("1080", "720"):
                try: open(p, "wb").write(urllib.request.urlopen(urllib.request.Request(f"https://assets.mixkit.co/videos/{vid}/{vid}-{q}.mp4", headers=UA), timeout=120).read()); break
                except Exception: pass
        return p
    return s
for ad in sys.argv[1:]:
    spec = SEQS.get(ad, {}); meta = {}
    for name, (src, ss, dur, maxw) in spec.items():
        d = f"build/{ad}/seq/{name}"; os.makedirs(d, exist_ok=True)
        if not os.listdir(d):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-i", src_path(src), "-t", str(dur), "-vf",
                            f"fps=30,scale='min({maxw},iw)':-2", "-q:v", "4", f"{d}/f%04d.jpg"], check=True)
        meta[name] = {"n": len(os.listdir(d))}
    os.makedirs(f"build/{ad}", exist_ok=True)
    open(f"build/{ad}/assets.js", "w").write("window.ASSETS=" + json.dumps({"seqs": meta}) + ";")
    print(ad, {k: v["n"] for k, v in meta.items()})

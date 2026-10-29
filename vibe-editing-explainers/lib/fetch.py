"""Fetch real footage/images for a video and cut them into what the stage reads.

    python -I lib/fetch.py <video-dir>     reads <dir>/footage.json

footage.json is a list of entries:
  {"name": "typing", "mixkit": 1781, "ss": 0, "dur": 8, "vf": "scale=960:-2"}          Mixkit clip
  {"name": "x", "mixkit": 100069, "page": "smartphone-with-a-green-screen-on-a-desk-setup-100069", ...}
  {"name": "film", "url": "https://archive.org/download/...mp4", "ss": 865.7, "dur": 7}   any video URL
  {"name": "lab", "image": "https://tile.loc.gov/...jpg"}                                still image
  {"name": "frame", "still": "mixkit:39828", "t": 1.0}                                    frame grab -> images/
Raw downloads are cached in assets_raw/; frames go to assets/footage/<name>/f0001.jpg (30 fps).
"""
import json, os, pathlib, re, subprocess, sys, urllib.request

D = pathlib.Path(sys.argv[1]).resolve()
ROOT = D.parent
RAW, FOOT, IMG = ROOT / "assets_raw", ROOT / "assets/footage", ROOT / "assets/images"
for p in (RAW / "mixkit", RAW / "web", FOOT, IMG): p.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (VibeEditingExplainer; +https://github.com/highontrading/experiments)"}


def get(url, dest):
    if dest.exists() and dest.stat().st_size > 1000:
        return dest
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r:
        dest.write_bytes(r.read())
    return dest


def mixkit(mid, page=None):
    dest = RAW / "mixkit" / f"v{mid}.mp4"
    if dest.exists() and dest.stat().st_size > 1000:
        return dest
    for res in (1080, 720):
        try:
            return get(f"https://assets.mixkit.co/videos/{mid}/{mid}-{res}.mp4", dest)
        except Exception:
            pass
    if page:  # newer clips live under active_storage; the page links them
        html = urllib.request.urlopen(urllib.request.Request(f"https://mixkit.co/free-stock-video/{page}/", headers=UA), timeout=60).read().decode()
        urls = sorted(set(re.findall(r'https://assets\.mixkit\.co/[^"]+-video-(?:1080|720)\.mp4', html)))
        if urls:
            return get(urls[-1] if any("1080" in u for u in urls) else urls[0], dest)
    raise SystemExit(f"mixkit {mid}: no file (pass its 'page' slug)")


def source(e):
    if "mixkit" in e: return mixkit(e["mixkit"], e.get("page"))
    url = e["url"]; return get(url, RAW / "web" / (re.sub(r"[^\w.-]", "_", url.split("/")[-1])[-80:] or "f.mp4"))


for e in json.load(open(D / "footage.json")):
    n = e["name"]
    if "image" in e:
        ext = os.path.splitext(e["image"].split("?")[0])[1] or ".jpg"
        get(e["image"], IMG / f"{n}{ext}"); print("image", n); continue
    if "still" in e:
        kind, mid = e["still"].split(":")
        src = mixkit(int(mid), e.get("page")) if kind == "mixkit" else source({"url": e["still"]})
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(e.get("t", 0)), "-i", str(src), "-frames:v", "1", "-q:v", "2",
                        str(IMG / f"{n}.jpg")], check=True); print("still", n); continue
    out = FOOT / n
    if out.exists() and any(out.iterdir()) and not e.get("force"):
        print("have", n); continue
    src = source(e)
    out.mkdir(exist_ok=True)
    for f in out.glob("f*.jpg"): f.unlink()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(e.get("ss", 0)), "-t", str(e.get("dur", 8)), "-i", str(src),
                    "-vf", f"fps=30,{e.get('vf', 'scale=960:-2')}", "-q:v", "3", str(out / "f%04d.jpg")], check=True)
    print("footage", n, len(list(out.glob("f*.jpg"))))

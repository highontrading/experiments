"""Download the Mixkit clips in sources.json and cut them into frames.

  python3 footage/fetch_footage.py            # all clips
  python3 footage/fetch_footage.py clouds     # just these

Each clip: build/footage/raw/<name>.mp4 (720p) and build/footage/<name>/f0001.jpg...
(30 fps, 6.5 s from `start`). Mixkit clips are free to use under the Mixkit Stock
Video Free License (https://mixkit.co/license/#videoFree).
"""
import json, os, re, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "build", "footage")
UA = {"User-Agent": "Mozilla/5.0"}
SRC = json.load(open(os.path.join(HERE, "sources.json")))
CAT = dict(l.rstrip("\n").split("\t") for l in open(os.path.join(HERE, ".catalog.tsv")))


def video_url(vid):
    legacy = f"https://assets.mixkit.co/videos/{vid}/{vid}-720.mp4"
    try:
        urllib.request.urlopen(urllib.request.Request(legacy, headers={**UA, "Range": "bytes=0-10"}), timeout=30)
        return legacy
    except Exception:
        pass
    page = f"https://mixkit.co/free-stock-video/{CAT[str(vid)]}-{vid}/"
    html = urllib.request.urlopen(urllib.request.Request(page, headers=UA), timeout=30).read().decode()
    urls = re.findall(r'https://assets\.mixkit\.co/[^"\' ]+\.mp4', html)
    for size in ("-720.mp4", "-1080.mp4", "-360.mp4"):
        for u in urls:
            if u.endswith(size):
                return u
    raise RuntimeError(f"no video file on {page}")


def fetch(name):
    s = SRC[name]
    raw = os.path.join(OUT, "raw", name + ".mp4")
    frames = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(raw), exist_ok=True)
    if not os.path.exists(raw):
        url = video_url(s["id"])
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r, open(raw, "wb") as f:
            f.write(r.read())
    if not os.path.isdir(frames) or len(os.listdir(frames)) < 150:
        os.makedirs(frames, exist_ok=True)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(s["start"]), "-i", raw, "-t", "6.5",
                        "-vf", "fps=30,scale='min(1280,iw)':-2", "-q:v", "3", os.path.join(frames, "f%04d.jpg")], check=True)
    n = len(os.listdir(frames))
    print(f"{name:18} {n:4} frames  ({s['note']})")
    return n


if __name__ == "__main__":
    names = sys.argv[1:] or list(SRC)
    index = {}
    idx_path = os.path.join(OUT, "index.json")
    if os.path.exists(idx_path):
        index = json.load(open(idx_path))
    for n in names:
        try:
            index[n] = fetch(n)
        except Exception as e:
            print(f"{n:18} FAILED: {e}")
        json.dump(index, open(idx_path, "w"))
        with open(os.path.join(OUT, "index.js"), "w") as f:          # file:// pages can't XHR json
            f.write("window.FOOTAGE_INDEX = " + json.dumps(index) + ";\n")

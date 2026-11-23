# Extract graded footage frames for every footage use in build/timeline.json
#   build/foot/<key>/0001.jpg ... (30 fps, frame 1 = footage t0)
import json, os, subprocess, sys, shutil
from concurrent.futures import ThreadPoolExecutor
T = json.load(open("build/timeline.json"))
only = sys.argv[1:]
GRADE = {
    # punchy monochrome, slightly lifted blacks like printed photos
    "bw": "format=gray,eq=contrast=1.18:brightness=0.01,curves=all='0/0.04 0.5/0.5 1/0.97'",
    # blue duotone: navy shadows -> pale blue-white highlights
    "duo": "format=gray,eq=contrast=1.25,format=rgb24,lutrgb=r='14+val*0.86':g='22+val*0.86':b='88+val*0.65'",
}
def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))
def job(item):
    k, f = item
    out = f"build/foot/{k}"
    if os.path.isdir(out) and len(os.listdir(out)) >= f["n"] and not only: return k + " (cached)"
    shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    src = f"assets/stock/{f['src']}.mp4"
    need = f["n"] / 30 * f["speed"]
    avail = dur(src) - f["in"] - 0.1
    vf = f"setpts=PTS-STARTPTS"
    if avail < need:  # ping-pong loop so the clip never freezes
        vf += f",split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,split[c][d];[d]reverse[e];[c][e]concat=n=2:v=1:a=0"
    vf += f",setpts=PTS/{f['speed']},fps=30,scale=960:-2:flags=lanczos,{GRADE[f['grade']]}"
    cmd = ["ffmpeg", "-loglevel", "error", "-y", "-ss", str(f["in"]), "-t", str(min(avail, need) + 0.2), "-i", src,
           "-filter_complex", vf, "-frames:v", str(f["n"]), "-q:v", "3", f"{out}/%04d.jpg"]
    subprocess.run(cmd, check=True)
    return f"{k}: {len(os.listdir(out))}/{f['n']}" + (" pingpong" if avail < need else "")
items = [(k, f) for k, f in T["footage"].items() if not only or k in only]
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(job, items): print(r, flush=True)
# record actual counts
counts = {k: len(os.listdir(f"build/foot/{k}")) for k in T["footage"] if os.path.isdir(f"build/foot/{k}")}
json.dump(counts, open("build/foot_counts.json", "w"))

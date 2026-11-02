"""Build a video's voiceover from recorded parts (e.g. a hook + a shared body).

    python lib/compose_vo.py <video-dir> <part-dir> [<part-dir> ...] [--gap 0.35]

Each part dir holds a take recorded with lib/tts.py (vo/take.mp3, vo/lines.json). The parts are
joined with `gap` seconds of silence into <video-dir>/vo/take.mp3, and their lines (with word
timings shifted to the joined take) go to <video-dir>/vo/lines.json. A/B variants that share a
body part therefore share the exact same body audio.
"""
import json, pathlib, subprocess, sys

args = sys.argv[1:]
gap = 0.35
if "--gap" in args:
    i = args.index("--gap"); gap = float(args[i + 1]); del args[i:i + 2]
D = pathlib.Path(args[0]).resolve(); parts = [pathlib.Path(p).resolve() for p in args[1:]]
(D / "vo").mkdir(parents=True, exist_ok=True)

def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                capture_output=True, text=True, check=True).stdout)

lines, inputs, filt, off = [], [], [], 0.0
for k, p in enumerate(parts):
    take = p / "vo/take.mp3"
    for l in json.load(open(p / "vo/lines.json")):
        sh = lambda t: round(t + off, 3)
        lines.append({**l, "t0": sh(l["t0"]), "t1": sh(l["t1"]),
                      "words": [{**w, "t0": sh(w["t0"]), "t1": sh(w["t1"])} for w in l["words"]]})
    inputs += ["-i", str(take)]
    filt.append(f"[{k}:a]aresample=44100,aformat=channel_layouts=mono,apad=pad_dur={gap if k < len(parts) - 1 else 0}[a{k}]")
    off += dur(take) + (gap if k < len(parts) - 1 else 0)
cat = "".join(f"[a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt + [cat]), "-map", "[out]",
                "-b:a", "192k", str(D / "vo/take.mp3")], check=True)
ids = [l["id"] for l in lines]
assert len(ids) == len(set(ids)), f"duplicate line ids across parts: {ids}"
json.dump(lines, open(D / "vo/lines.json", "w"), indent=1)
json.dump({"parts": [str(p.relative_to(D.parent)) for p in parts], "gap": gap}, open(D / "vo/parts.json", "w"), indent=1)
for l in lines: print(f"{l['id']:10} {l['t0']:6.2f} -> {l['t1']:6.2f}")

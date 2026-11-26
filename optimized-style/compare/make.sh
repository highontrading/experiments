#!/usr/bin/env bash
# Build the "Raw vs Edited" comparison reel for the VA ad (run after the main edit is composed).
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=${1:?usage: compare/make.sh <raw.mp4>}
python3 - "$RAW" <<'PY'
import json, subprocess, sys
keep = json.load(open("plans/va-ad.json"))["keep"]
parts = [f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,scale=540:960:flags=lanczos,setsar=1[v{i}]" for i, (a, b) in enumerate(keep)]
parts.append("".join(f"[v{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=0[v]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", sys.argv[1], "-filter_complex", ";".join(parts), "-map", "[v]",
                "-r", "30", "-c:v", "libx264", "-crf", "16", "build/va-ad/raw_cut.mp4"], check=True)
PY
rm -rf build/compare/raw build/compare/edit && mkdir -p build/compare/raw build/compare/edit
ffmpeg -v error -y -i build/va-ad/raw_cut.mp4 -q:v 3 build/compare/raw/%05d.jpg
ffmpeg -v error -y -i out/va-ad.mp4 -vf scale=720:1280:flags=lanczos -q:v 2 build/compare/edit/%05d.jpg
node compare/render.js
ffmpeg -v error -y -framerate 30 -i build/compare/frames/f%05d.png -i out/va-ad.mp4 -i assets/sfx/premium/soft-whoosh.wav \
  -filter_complex "[2:a]aresample=48000,volume=0.16,adelay=220|220[w];[1:a][w]amix=inputs=2:normalize=0:duration=first[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -shortest out/va-ad-compare.mp4
echo "-> out/va-ad-compare.mp4"

#!/usr/bin/env bash
# Build "Edit in Your Language": timing -> frames -> render -> mix -> MP4.
#   ./make.sh            full build -> out/edit_in_your_language.mp4
#   ./make.sh stills     contact sheet of key moments -> build/sheet.jpg
#   ./make.sh encode     re-mix and re-encode from existing frames
set -euo pipefail
cd "$(dirname "$0")"
python3 tts.py                # only voices lines whose text changed
python3 timing.py
python3 prep.py
if [[ "${1:-}" == "stills" ]]; then
  rm -rf build/stills
  node render.js --times "${2:-2.5,9,12.5,17,23,27,32,35,40,43,48,52,56,60,65,69,74,77,83,89}" --jobs 4
  montage -mode concatenate -tile 10x -geometry 270x480+3+3 build/stills/t*.png build/sheet.jpg
  echo "-> build/sheet.jpg"; exit 0
fi
if [[ "${1:-}" != "encode" ]]; then
  rm -rf build/frames_out
  node render.js --jobs 4
fi
python3 mix.py
mkdir -p out
ffmpeg -loglevel error -y -framerate 30 -i build/frames_out/f%05d.png -i build/mix.wav \
  -c:v libx264 -profile:v high -preset slow -crf 19 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/edit_in_your_language.mp4
ffmpeg -loglevel error -y -ss 77 -i out/edit_in_your_language.mp4 -frames:v 1 -q:v 2 out/poster.jpg
ls -la out

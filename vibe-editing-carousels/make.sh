#!/usr/bin/env bash
# Build a carousel: frames -> one MP4 per slide (+ a still and a preview of all slides).
#   ./make.sh 01-five-step-system           full build -> out/01-five-step-system/
#   ./make.sh 01-five-step-system stills    one still per slide -> build/<c>/contact_sheet.png
#   ./make.sh 01-five-step-system encode    only re-encode from existing frames
set -euo pipefail
cd "$(dirname "$0")"
C="${1:-01-five-step-system}"
[[ -f assets/img/sky.jpg ]] || python3 make_sky.py

if [[ "${2:-}" == "stills" ]]; then
  rm -rf "build/$C/stills"
  node render.js --c "$C" --stills 3.0 --jobs 4
  montage -mode concatenate -tile 5x -geometry 432x540+6+6 "build/$C/stills/"s*_3.00.png "build/$C/contact_sheet.png"
  echo "-> build/$C/contact_sheet.png"
  exit 0
fi

if [[ "${2:-}" != "encode" ]]; then
  rm -rf "build/$C"/s[0-9]*
  node render.js --c "$C" --jobs 4
fi

OUT="out/$C"; mkdir -p "$OUT"; rm -f "$OUT"/*.mp4 "$OUT"/*.jpg
list=$(mktemp)
for d in "build/$C"/s[0-9]*/; do
  n=$(basename "$d")                       # s01
  ffmpeg -loglevel error -y -framerate 30 -i "$d/f%04d.png" \
    -c:v libx264 -profile:v high -preset slow -crf 17 -pix_fmt yuv420p -r 30 -movflags +faststart \
    "$OUT/slide_${n#s}.mp4"
  ffmpeg -loglevel error -y -i "$d/f0091.png" -q:v 2 "$OUT/still_${n#s}.jpg"
  echo "file '$PWD/$OUT/slide_${n#s}.mp4'" >> "$list"
done
# every slide back to back, to preview the swipe-through
ffmpeg -loglevel error -y -f concat -safe 0 -i "$list" -c copy "$OUT/preview_all_slides.mp4"
rm -f "$list"
ls -la "$OUT"

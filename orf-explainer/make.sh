#!/usr/bin/env bash
# Full build: timeline -> footage frames -> cutouts -> frames -> mix -> MP4
#   ./make.sh            everything
#   ./make.sh stills     a 24-still contact sheet only
#   ./make.sh encode     re-mix and re-encode from existing frames
set -euo pipefail
cd "$(dirname "$0")"
python3 timeline.py
if [[ "${1:-}" == "stills" ]]; then
  node render.js --stills 24
  montage build/stills/s*.jpg -tile 6x4 -geometry 270x480+4+4 -background '#111' build/contact_sheet.jpg
  echo "-> build/contact_sheet.jpg"; exit 0
fi
if [[ "${1:-}" != "encode" ]]; then
  python3 extract.py
  [ -d build/cutouts ] || OUTLINE=18 python3 tools_cutout.py build/cutouts build/cut/car_src.png build/cut/ship_src.png
  node render.js --workers 4
fi
python3 mix.py
mkdir -p out
ffmpeg -loglevel error -y -framerate 30 -i build/frames/f%05d.jpg -i build/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -profile:v high -preset slow -crf 20 -maxrate 7M -bufsize 14M -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 256k -movflags +faststart -shortest out/the_lever_is_price_explainer.mp4
echo "-> out/the_lever_is_price_explainer.mp4"

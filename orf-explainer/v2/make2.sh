#!/usr/bin/env bash
# 16:9 build. Run from anywhere; needs ../assets/stock (fetch_stock.sh + the extra clips below),
# build/cutouts and build/king from the vertical build (../make.sh) for the cutouts.
#   v2/make2.sh          everything
#   v2/make2.sh encode   re-mix + re-encode only
set -euo pipefail
cd "$(dirname "$0")/.."
for id in 11433 30125 21916 21920; do [ -s assets/stock/$id.mp4 ] || curl -sfL -o assets/stock/$id.mp4 "https://assets.mixkit.co/videos/$id/$id-720.mp4"; done
[ -f v2/words_raw.json ] || python3 tools_words.py assets/vo/v4_brian.align.json v2/words_raw.json
python3 v2/timeline2.py
cat v2/head.js v2/scenes.js > v2/stage2.js
if [[ "${1:-}" != "encode" ]]; then
  python3 v2/extract2.py
  node v2/render2.js --workers 4
fi
python3 v2/mix2.py
ffmpeg -loglevel error -y -framerate 30 -i v2/build/frames/f%05d.jpg -i v2/build/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -profile:v high -preset slow -crf 19 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 256k -movflags +faststart -shortest out/the_lever_is_price_explainer_16x9.mp4
echo "-> out/the_lever_is_price_explainer_16x9.mp4"

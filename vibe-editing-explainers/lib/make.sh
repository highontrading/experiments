#!/usr/bin/env bash
# Build one explainer end to end:
#   lib/make.sh <video-dir>           timeline -> sound -> frames -> <dir>/out/<dir-name>.mp4 + cover.jpg
#   lib/make.sh <video-dir> stills    contact sheet only -> <dir>/build/contact_sheet.jpg
# The voiceover (lib/tts.py) is recorded once and kept in <dir>/vo/.
set -euo pipefail
LIB="$(cd "$(dirname "$0")" && pwd)"
D="$(cd "$1" && pwd)"; NAME="$(basename "$D")"
cd "$D"
python3 timeline.py
python3 "$LIB/prep.py" "$D"
if [ "${2:-}" = "stills" ]; then
  rm -rf build/stills && node "$LIB/render.js" "$D" --stills 24
  montage build/stills/s*.jpg -tile 8x -geometry 270x480+3+3 build/contact_sheet.jpg
  exit 0
fi
python3 sound.py
rm -rf build/frames && node "$LIB/render.js" "$D"
mkdir -p out
ffmpeg -v error -y -framerate 30 -i build/frames/f%04d.jpg -i build/mix.wav \
  -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -tune film \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "out/$NAME.mp4"
COVER=$(python3 -c "import json;print(json.load(open('build/timeline.json'))['cue'].get('cover', 3))")
ffmpeg -v error -y -ss "$COVER" -i "out/$NAME.mp4" -frames:v 1 -q:v 2 out/cover.jpg
echo "-> $D/out/$NAME.mp4"

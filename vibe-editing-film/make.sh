#!/usr/bin/env bash
# Build the whole film: timeline -> stills check -> frames -> sound -> MP4.
#   ./make.sh            full build
#   ./make.sh stills     only the 18-still contact sheet (look before you render)
#   ./make.sh encode     only re-encode from existing frames + sound
set -euo pipefail
cd "$(dirname "$0")"

python3 timeline.py

if [[ "${1:-}" == "stills" ]]; then
  rm -rf build/stills
  node render.js --stills 18
  ffmpeg -loglevel error -y -pattern_type glob -i 'build/stills/s*.png' \
    -vf "scale=640:-1,tile=3x6:padding=4" -frames:v 1 build/contact_sheet.png
  echo "-> build/contact_sheet.png"
  exit 0
fi

if [[ "${1:-}" != "encode" ]]; then
  rm -rf build/frames
  node render.js
  python3 sound.py
fi

mkdir -p out
# bloom (blurred screen blend) and a soft vignette,
# H.264 High CRF 17, WAV as AAC 320k, +faststart
ffmpeg -loglevel error -y -framerate 30 -i build/frames/f%04d.png \
  -i build/sound.wav -filter_complex "\
[0]format=gbrp,split[a][b];[b]gblur=sigma=18,colorlevels=rimin=0.35:gimin=0.35:bimin=0.35[glow];\
[a][glow]blend=all_mode=screen:all_opacity=0.35,vignette=angle=PI/5:mode=forward,format=yuv420p[v]" \
  -map "[v]" -map 1:a -c:v libx264 -profile:v high -preset slow -crf 17 -r 30 \
  -c:a aac -b:a 320k -movflags +faststart -shortest out/vibe_editing.mp4
echo "-> out/vibe_editing.mp4"

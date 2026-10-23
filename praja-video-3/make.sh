#!/usr/bin/env bash
# Build the whole video.
#   ./make.sh            VO (cached) -> timeline -> frames -> mix -> MP4
#   ./make.sh stills     one still per slide -> build/contact.png (look before you render)
#   ./make.sh encode     only re-mix and re-encode from existing segments
# ElevenLabs takes, SFX and music are cached in build/, so re-runs cost no credits.
set -euo pipefail
cd "$(dirname "$0")"

python3 vo.py
python3 sfx.py
python3 sfx.py music 310
python3 timeline.py

if [[ "${1:-}" == "stills" ]]; then
  rm -rf build/stills
  node render.js --slides
  ffmpeg -loglevel error -y -pattern_type glob -i 'build/stills/slide_*.png' \
    -vf "scale=640:-1,tile=3x9:padding=4" -frames:v 1 build/contact.png
  echo "-> build/contact.png"
  exit 0
fi

if [[ "${1:-}" != "encode" ]]; then
  node render.js --workers 4          # -> build/seg_0..3.mp4
fi
python3 sound.py                      # -> build/mix.wav

mkdir -p out
: > build/segs.txt
for f in build/seg_*.mp4; do echo "file '$(basename "$f")'" >> build/segs.txt; done
DUR=$(python3 -c "import json;print(json.load(open('build/timeline.json'))['dur'])")
# fade in from black, fade out at the end; H.264 High, AAC 256k, +faststart
ffmpeg -loglevel error -y -f concat -safe 0 -i build/segs.txt -i build/mix.wav \
  -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=$(python3 -c "print($DUR-1.0)"):d=1.0,format=yuv420p" \
  -map 0:v -map 1:a -c:v libx264 -profile:v high -preset slow -crf 18 -r 30 \
  -c:a aac -b:a 256k -movflags +faststart -shortest out/praja_video_3.mp4
echo "-> out/praja_video_3.mp4"

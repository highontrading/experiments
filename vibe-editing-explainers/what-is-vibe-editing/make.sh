#!/usr/bin/env bash
# Build "What is vibe editing?" end to end.
#   ./make.sh          voiceover timings -> timeline -> sound -> frames -> out/what-is-vibe-editing.mp4
#   ./make.sh stills   a contact sheet of stills only (fast check)
# The voiceover itself (tts.py) is generated once and kept in vo/, so rebuilding costs no ElevenLabs credits.
set -euo pipefail
cd "$(dirname "$0")"
python3 timeline.py > /dev/null
python3 prep.py
if [ "${1:-}" = "stills" ]; then
  rm -rf build/stills && node render.js --stills 24
  montage build/stills/s*.jpg -tile 8x -geometry 270x480+3+3 build/contact_sheet.jpg
  exit 0
fi
[ build/mix.wav -nt sound.py ] && [ build/mix.wav -nt build/timeline.json ] || python3 sound.py
rm -rf build/frames && node render.js
mkdir -p out
ffmpeg -v error -y -framerate 30 -i build/frames/f%04d.jpg -i build/mix.wav \
  -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -tune film \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out/what-is-vibe-editing.mp4
ffmpeg -v error -y -ss 9.9 -i out/what-is-vibe-editing.mp4 -frames:v 1 -q:v 2 out/cover.jpg
echo "-> out/what-is-vibe-editing.mp4"

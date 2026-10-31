#!/usr/bin/env bash
# Full build. Needs: ffmpeg, Python3 (numpy, Pillow), Node with playwright (Chromium).
#   ./make.sh clips      download the Mixkit source clips to /tmp/dl/clips
#   ./make.sh prep       extract + key frames -> build/frames
#   ./make.sh stills T.. render stills -> build/stills
#   ./make.sh            render video + mix audio -> out/jaal_aur_paani_explainer.mp4
set -euo pipefail
cd "$(dirname "$0")"
CLIPS=${CLIPS:-/tmp/dl/clips}
serve() { pgrep -f "http.server 8765" >/dev/null || (python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &); sleep 1; }
case "${1:-all}" in
  clips)
    mkdir -p "$CLIPS"
    for id in $(python3 -c "import json;print(' '.join(sorted({str(v['id']) for v in json.load(open('clips.json')).values()})))"); do
      [ -s "$CLIPS/$id.mp4" ] || curl -sfL -A "Mozilla/5.0" -o "$CLIPS/$id.mp4" "https://assets.mixkit.co/videos/$id/$id-720.mp4"
    done ;;
  prep)
    python3 tools/prep.py "$CLIPS" && python3 tools/track.py && python3 tools/fix_phone.py ;;
  stills) shift; serve; node render.js stills "$@" ;;
  all)
    serve; mkdir -p build/seg out
    N=1275; Q=319
    for k in 0 1 2 3; do a=$((k*Q)); b=$(((k+1)*Q)); [ $b -gt $N ] && b=$N; node render.js video $a $b build/seg/seg$k.mp4 & done; wait
    printf "file 'seg0.mp4'\nfile 'seg1.mp4'\nfile 'seg2.mp4'\nfile 'seg3.mp4'\n" > build/seg/list.txt
    ffmpeg -v error -y -f concat -safe 0 -i build/seg/list.txt -c copy build/video.mp4
    python3 tools/mix.py
    ffmpeg -v error -y -i build/video.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 20 \
      -pix_fmt yuv420p -profile:v high -c:a aac -b:a 256k -movflags +faststart out/jaal_aur_paani_explainer.mp4
    echo "-> out/jaal_aur_paani_explainer.mp4" ;;
esac

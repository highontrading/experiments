#!/usr/bin/env bash
# Build one ad: timing -> frames -> render -> mix -> MP4 (+ an ~45 MB share copy).
#   ./make.sh a1             full build -> out/a1_*.mp4 (resumes an interrupted render)
#   ./make.sh a1 stills      contact sheet -> build/a1/sheet.jpg
#   ./make.sh a1 fresh       re-render every frame
set -euo pipefail
cd "$(dirname "$0")"
export AD="${1:?which ad, e.g. a1}"
NAME=$(python3 -c "print({'a1':'a1_timeline_ka_jaal','a2':'a2_1913_se_future','a3':'a3_ek_video_poora_india','a4':'a4_uljhan_chhodo','a5':'a5_apni_desk_badlo'}['$AD'])")
python3 tts.py; python3 timing.py "$AD" >/dev/null; python3 prep.py >/dev/null
if [[ "${2:-}" == "stills" ]]; then
  rm -rf "build/$AD/stills"
  DUR=$(python3 -c "import json;print(json.load(open('build/$AD/timing.json'))['dur'])")
  TIMES=$(python3 -c "d=$DUR;print(','.join(f'{d*(i+0.5)/16:.2f}' for i in range(16)))")
  node render.js --times "${3:-$TIMES}" --jobs 4
  montage -mode concatenate -tile 8x -geometry 270x480+3+3 $(ls build/$AD/stills/t*.png | sort -V) "build/$AD/sheet.jpg"
  echo "-> build/$AD/sheet.jpg"; exit 0
fi
[[ "${2:-}" == "fresh" ]] && rm -rf "build/$AD/frames"
node render.js --jobs 4
python3 mix.py
mkdir -p out
ffmpeg -loglevel error -y -framerate 30 -i "build/$AD/frames/f%05d.png" -i "build/$AD/mix.wav" \
  -c:v libx264 -profile:v high -preset slow -crf 19 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest -movflags +faststart "out/${NAME}_master.mp4"
( cd /tmp && ffmpeg -loglevel error -y -i "$OLDPWD/out/${NAME}_master.mp4" -c:v libx264 -preset slow -b:v 7000k -pass 1 -passlogfile "/tmp/2pass_$AD" -an -f null /dev/null \
  && ffmpeg -loglevel error -y -i "$OLDPWD/out/${NAME}_master.mp4" -c:v libx264 -preset slow -b:v 7000k -maxrate 10M -bufsize 20M -pass 2 -passlogfile "/tmp/2pass_$AD" \
     -pix_fmt yuv420p -c:a copy -movflags +faststart "$OLDPWD/out/${NAME}.mp4" )
ls -la out | grep "$NAME"
# frames are big (3-5 MB each): drop them once the master is encoded and complete
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/${NAME}_master.mp4" | cut -d. -f1)
WANT=$(python3 -c "import json;print(int(json.load(open('build/$AD/timing.json'))['dur']))")
BLACK=$(ffmpeg -i "out/${NAME}_master.mp4" -vf "blackdetect=d=0.01:pix_th=0.06:pic_th=0.9" -an -f null - 2>&1 | grep -c black_start || true)
[[ "$BLACK" -gt 0 ]] && echo "WARNING: $BLACK black segment(s) in the master; frames kept for inspection"
[[ "$DUR" -ge "$WANT" && "$BLACK" -eq 0 && "${KEEP_FRAMES:-0}" != 1 ]] && rm -rf "build/$AD/frames" || true

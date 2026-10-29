#!/usr/bin/env bash
# Build "Edit in Your Language": timing -> frames -> render -> mix -> MP4.
#   ./make.sh            build -> out/edit_in_your_language.mp4 (resumes an interrupted render)
#   ./make.sh fresh      throw away rendered frames and render everything again
#   ./make.sh stills     contact sheet of key moments -> build/sheet.jpg
#   ./make.sh encode     re-mix and re-encode from existing frames
#   VERSION=hinglish ./make.sh   the Hinglish cut (Hinglish narrator, Hinglish translations)
set -euo pipefail
cd "$(dirname "$0")"
export VERSION="${VERSION:-en}"
SUF=""; [[ "$VERSION" != "en" ]] && SUF="_$VERSION"
python3 tts.py                # only voices lines whose text changed
python3 timing.py
python3 prep.py
if [[ "${1:-}" == "stills" ]]; then
  rm -rf "build/stills$SUF"
  node render.js --times "${2:-2.5,9,12.5,17,23,27,32,35,40,43,48,52,56,60,65,69,74,77,83,89}" --jobs 4
  montage -mode concatenate -tile 10x -geometry 270x480+3+3 "build/stills$SUF"/t*.png "build/sheet$SUF.jpg"
  echo "-> build/sheet$SUF.jpg"; exit 0
fi
if [[ "${1:-}" != "encode" ]]; then
  [[ "${1:-}" == "fresh" ]] && rm -rf "build/frames_out$SUF"
  node render.js --jobs 4          # resumes: frames already rendered are kept
fi
python3 mix.py
mkdir -p out
ffmpeg -loglevel error -y -framerate 30 -i "build/frames_out$SUF/f%05d.png" -i "build/mix$SUF.wav" \
  -c:v libx264 -profile:v high -preset slow -crf 19 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -shortest -movflags +faststart "out/edit_in_your_language$SUF.mp4"
ffmpeg -loglevel error -y -ss 77 -i "out/edit_in_your_language$SUF.mp4" -frames:v 1 -q:v 2 "out/poster$SUF.jpg"
# share copy (~85 MB, fits GitHub): two-pass 7.2 Mbps
( cd /tmp && ffmpeg -loglevel error -y -i "$OLDPWD/out/edit_in_your_language$SUF.mp4" -c:v libx264 -preset slow -b:v 7200k -pass 1 -an -f null /dev/null \
  && ffmpeg -loglevel error -y -i "$OLDPWD/out/edit_in_your_language$SUF.mp4" -c:v libx264 -preset slow -b:v 7200k -maxrate 10M -bufsize 20M -pass 2 \
     -pix_fmt yuv420p -c:a copy -movflags +faststart "$OLDPWD/out/edit_in_your_language${SUF}_share.mp4" )
ls -la out

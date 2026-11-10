#!/usr/bin/env bash
# Join rendered chunks, mux the mixed audio, write the final upload file and a cover frame.
#   tools/assemble.sh <video_id> <chunk_dir> <mix.wav> <out.mp4> <cover_time_s>
set -euo pipefail
vid=$1; chunks=$2; mix=$3; out=$4; cover=${5:-1.0}
list=$(mktemp); for f in "$chunks"/${vid}_*.mp4; do echo "file '$f'" >> "$list"; done
ffmpeg -v error -y -f concat -safe 0 -i "$list" -i "$mix" -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$out"
ffmpeg -v error -y -ss "$cover" -i "$out" -frames:v 1 -q:v 2 "${out%.mp4}_cover.jpg"
rm -f "$list"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact "$out"

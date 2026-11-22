#!/usr/bin/env bash
# usage: ./render_chunk.sh START END  ->  chunks/chunk_SSSS_EEEE.mkv (near-lossless x264 4:4:4)
set -e
cd "$(dirname "$0")"
S=$1; E=$2; OUT=frames_${S}_${E}; mkdir -p "$OUT" chunks
/opt/blender/blender-4.2.3-linux-x64/blender -b scene.blend -P render_range.py -- "$S" "$E" "$PWD/$OUT" 2>&1 | grep -E "Saved|Error"
ffmpeg -v error -y -framerate 24 -start_number "$S" -i "$OUT/f_%04d.png" -c:v libx264 -preset slow -crf 4 -pix_fmt yuv444p "chunks/chunk_$(printf %04d "$S")_$(printf %04d "$E").mkv"
ls -la chunks

#!/bin/bash
# encode one ad: 9:16 master + 4:5 feed cut (center crop) -> out/
set -e
n=$1; R=$(cd "$(dirname "$0")/.." && pwd); mkdir -p $R/out
NAME=${2:-ad_$n}
ffmpeg -v error -y -framerate 30 -i $R/build/$n/frames/f%05d.png -i $R/build/$n/mix.wav \
  -c:v libx264 -preset slow -crf 16 -profile:v high -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart -c:a aac -b:a 256k -ar 48000 -shortest $R/out/${NAME}_9x16.mp4
ffmpeg -v error -y -i $R/out/${NAME}_9x16.mp4 -vf "crop=1080:1350:0:285" \
  -c:v libx264 -preset slow -crf 16 -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a copy $R/out/${NAME}_4x5.mp4
ls -la $R/out/${NAME}_*

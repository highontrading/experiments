#!/usr/bin/env bash
# make_ad.sh a01 : prep sequences, render frames, mix, master, encode -> out/<ad>_<slug>.mp4
set -e; cd "$(dirname "$0")"; ad=$1
python3 prep.py $ad >/dev/null
rm -rf "build/$ad/frames"; node render.js $ad
python3 mix.py $ad; ./master.sh $ad -14
slug=$(python3 -c "import re;s=open('ads/$ad.js').read();m=re.search(r'slug:\s*\"([^\"]+)\"',s);print(m.group(1) if m else '$ad')")
mkdir -p out; ffmpeg -v error -y -framerate 30 -i build/$ad/frames/f%04d.jpg -i build/$ad/master.wav -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
  -profile:v high -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "out/${ad}_${slug}.mp4"
echo "wrote out/${ad}_${slug}.mp4"

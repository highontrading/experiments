#!/bin/bash
# usage: render_ad.sh ad2 out_name   -> renders all frames, mixes, encodes to ../out/<out_name>.mp4
set -e; cd "$(dirname "$0")"; A=$1; NAME=$2; S=$(python3 -c "import vkit;print(vkit.SC)"); SFX=$(dirname $S)/sfx11
rm -rf $S/v3k/f_$A; python3 $A.py $S/v3k/f_$A --workers 4 2>&1 | grep -v -i warn | tail -2
python3 vsound.py $A $SFX $S/v3k/$A.wav
ffmpeg -v error -y -framerate 30 -i $S/v3k/f_$A/f%05d.jpg -i $S/v3k/$A.wav -c:v libx264 -preset medium -crf 18 -maxrate 22M -bufsize 44M -pix_fmt yuv420p -profile:v high -movflags +faststart -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 256k -ar 48000 -shortest ../out/$NAME.mp4
ffmpeg -v error -y -i ../out/$NAME.mp4 -vf "fps=4,scale=150:267,tile=14x8" -frames:v 1 $S/v3k/rv_$A.jpg; echo ok ../out/$NAME.mp4

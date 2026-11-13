#!/usr/bin/env bash
# tools/qa.sh : per-ad 2 fps contact sheet + loudness/duration report -> build/qa/
mkdir -p build/qa
for f in out/a*.mp4; do n=$(basename $f .mp4); id=${n%%_*}
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f); wh=$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0:s=x $f)
  lu=$(ffmpeg -hide_banner -i $f -af ebur128 -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}')
  printf "%-46s %s %6.2fs  %s LUFS\n" $n $wh $d $lu
  ffmpeg -v error -y -i $f -vf "fps=2,scale=180:-2,tile=12x4:padding=2" -frames:v 1 build/qa/$id.jpg
done

#!/usr/bin/env bash
# Joins rendered chunks, applies the film finish (bloom, warmth, vignette, grain), upscales to 1080x1920 and adds the sound mix.
# usage: ./assemble.sh MIX.wav OUT.mp4
set -e
cd "$(dirname "$0")"
MIX=$1; OUT=$2
ls chunks/chunk_*.mkv | sort | sed "s|^|file '$PWD/|; s|$|'|" > chunks/list.txt
GRADE="format=gbrp,split[m][h];[h]curves=all='0/0 0.6/0 1/1',gblur=sigma=18[hb];[m][hb]blend=all_mode=screen:all_opacity=0.2,colorbalance=rs=0.02:bs=-0.03:rm=0.03:bm=-0.03,eq=saturation=1.12,vignette=angle=PI/6,scale=1080:1920:flags=lanczos,unsharp=5:5:0.35,noise=alls=5:allf=t+u,fade=t=in:d=0.4,format=yuv420p"
ffmpeg -v error -y -f concat -safe 0 -i chunks/list.txt -i "$MIX" -filter_complex "[0:v]$GRADE[v]" -map "[v]" -map 1:a \
  -c:v libx264 -preset slow -crf 14 -profile:v high -r 24 -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=width,height,nb_frames -of compact "$OUT"

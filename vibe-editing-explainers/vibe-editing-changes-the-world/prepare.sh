#!/usr/bin/env bash
# Fetch and cut every asset this video needs (run once, from anywhere).
#   footage.json -> assets/footage/cw_*      objects.json -> assets/objects/cw_bags, cw_lily
#   tablet_cutout.py -> cw_tablet            the blooming lily, keyed off black -> assets/footage/cw_lily_bloom/*.png
set -euo pipefail
cd "$(dirname "$0")"
R=../assets_raw/mixkit; mkdir -p $R
get() { [ -s "$R/$1" ] || curl -sfL -m 300 -o "$R/$1" "$2"; }
get v17802.mp4 https://assets.mixkit.co/videos/17802/17802-720.mp4      # a pink lily flower opens
get v8866.mp4  https://assets.mixkit.co/videos/8866/8866-720.mp4        # shopping bags on white
get o100094.mp4 "$(curl -s https://mixkit.co/free-stock-video/a-tablet-device-placed-on-an-aesthetically-decorated-desk-with-100094/ | grep -o 'https://[^"]*-video-720\.mp4' | head -1)"
python3 -I ../lib/fetch.py .
python3 ../lib/cutout.py .
python3 tablet_cutout.py
mkdir -p ../assets/footage/cw_lily_bloom
ffmpeg -v error -y -ss 1 -t 12 -i $R/v17802.mp4 \
  -vf "fps=30,crop=920:720:120:0,scale=600:-2,colorkey=0x000000:0.16:0.10,format=rgba" ../assets/footage/cw_lily_bloom/f%04d.png

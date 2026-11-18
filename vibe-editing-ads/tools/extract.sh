#!/bin/bash
# graded FULL 16:9 source frames (no crop) at 30 fps -> /home/user/work/fr2_<n>/s00001.jpg (1-based = src frame+1)
G="scale=1600:900:flags=lanczos,eq=contrast=1.06:saturation=1.07:gamma=0.97,colorbalance=rs=-0.025:bs=0.03:rh=0.02:gh=0.008:bh=-0.025,curves=master='0/0.02 0.25/0.22 0.5/0.5 0.75/0.79 1/0.98',unsharp=5:5:0.3"
n=$1; mkdir -p /home/user/work/fr2_$n
ffmpeg -v error -y -i /home/user/work/sdr_$n.mp4 -vf "$G" -q:v 2 /home/user/work/fr2_$n/s%05d.jpg

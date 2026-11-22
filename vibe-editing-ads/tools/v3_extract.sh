#!/bin/bash
# V3: un-mirror, 30 fps, clean neutral-white grade -> /home/user/work3/fr/s00001.jpg
G="hflip,fps=30,eq=contrast=1.07:saturation=1.04:gamma=0.98:brightness=0.01,colorbalance=rh=-0.02:bh=0.02:rm=-0.01:bm=0.01,curves=master='0/0.015 0.25/0.23 0.5/0.5 0.75/0.79 1/0.99',unsharp=5:5:0.35"
ffmpeg -v error -y -i /home/user/raw3/clip.mov -vf "$G" -q:v 2 /home/user/work3/fr/s%05d.jpg

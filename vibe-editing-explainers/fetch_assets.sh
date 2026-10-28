#!/usr/bin/env bash
# Download the real footage, objects and paper scans used by the explainers, then cut them
# into what the stage reads. Everything comes from Mixkit (free licence) and archive.org
# (public domain). Run once; assets_raw/ and assets/footage/ are not committed.
set -euo pipefail
cd "$(dirname "$0")"
R=assets_raw; mkdir -p $R/mixkit/stills $R/archive $R/paper assets/footage

mk() { curl -sfL -m 300 -o "$R/mixkit/$1.mp4" "$2"; }
# footage
mk v50605  https://assets.mixkit.co/videos/50605/50605-1080.mp4   # cursor on a video-editing timeline
mk v5381   https://assets.mixkit.co/videos/5381/5381-720.mp4      # timelapse of a person editing a video
mk v39852  https://assets.mixkit.co/videos/39852/39852-1080.mp4   # frustrated, tired man at a computer
mk v1781   https://assets.mixkit.co/videos/1781/1781-1080.mp4     # typing on a laptop, close up
mk v46353  https://assets.mixkit.co/videos/46353/46353-720.mp4    # clapperboard before a shot
# desk objects (frames are cut out by cutout.py)
mk o100069 https://assets.mixkit.co/active_storage/video_items/100069/1719941344/100069-video-720.mp4
mk o100077 https://assets.mixkit.co/active_storage/video_items/100077/1719944383/100077-video-720.mp4
mk o39828  https://assets.mixkit.co/videos/39828/39828-1080.mp4
# 1954 public-domain film (Prelinger Archives) and a 1918 film-trade magazine page
curl -sfL -m 600 -o $R/archive/making_films_1954.mp4 https://archive.org/download/MakingFi1954/MakingFi1954.mp4
curl -sfL -m 120 -o $R/paper/p40.jpg "https://archive.org/download/motionpicturenew171unse/page/n40_w1400.jpg"
mkdir -p assets/paper && cp $R/paper/p40.jpg assets/paper/motion_picture_news_1918_p35.jpg

ex() { mkdir -p assets/footage/$1; ffmpeg -v error -y -ss $3 -t $4 -i $2 -vf "fps=30,$5" -q:v 3 assets/footage/$1/f%04d.jpg; }
ex timeline  $R/mixkit/v50605.mp4 0 9.3 "scale=960:-2"
ex moviola   $R/archive/making_films_1954.mp4 865.7 7 "scale=880:-2:flags=lanczos,unsharp=5:5:0.6"
ex timelapse $R/mixkit/v5381.mp4 0 8 "scale=960:-2"
ex tired     $R/mixkit/v39852.mp4 0 7.9 "scale=640:-2"
ex typing    $R/mixkit/v1781.mp4 0 10 "scale=960:-2"
ex clapper   $R/mixkit/v46353.mp4 0 6 "scale=960:-2"

for a in "100069 8.3" "100077 3" "39828 1"; do set -- $a
  ffmpeg -v error -y -ss $2 -i $R/mixkit/o$1.mp4 -frames:v 1 -q:v 2 $R/mixkit/stills/o$1_$2.jpg; done
python3 cutout.py

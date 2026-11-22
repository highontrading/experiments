#!/usr/bin/env bash
# Join chunks in frame order, apply the film finish, upscale and mux audio.
# usage: assemble.sh CHUNK_DIR OUT.mp4 [AUDIO.wav] [WIDTHxHEIGHT=1080x1920]
# Writes OUT.mp4 (master, crf 14) and OUT_social.mp4 (~14 Mbps, what Instagram/TikTok want).
#
# The finish, in order: 8-bit gbrp (blend filters misbehave on 16-bit input) -> highlight bloom
# (blurred top 40% screened back at 20%) -> gentle warm/cool split -> +12% saturation ->
# soft vignette -> lanczos upscale + light unsharp -> temporal film grain -> 0.4s fade-in.
# Tweak GRADE to taste; keep grain AFTER scaling so it stays fine-grained.
set -e
DIR=$1; OUT=$2; AUDIO=$3; SIZE=${4:-1080x1920}
W=${SIZE%x*}; H=${SIZE#*x}
mkdir -p "$(dirname "$OUT")"
ABS=$(cd "$DIR" && pwd); LIST=$(mktemp)
for f in $(ls "$ABS"/chunk_*.mkv | sort); do echo "file '$f'"; done > "$LIST"
[ -s "$LIST" ] || { echo "ERROR: no chunk_*.mkv in $DIR" >&2; exit 1; }
GRADE=${GRADE:-"format=gbrp,split[m][h];[h]curves=all='0/0 0.6/0 1/1',gblur=sigma=18[hb];[m][hb]blend=all_mode=screen:all_opacity=0.2,colorbalance=rs=0.02:bs=-0.03:rm=0.03:bm=-0.03,eq=saturation=1.12,vignette=angle=PI/6,scale=$W:$H:flags=lanczos,unsharp=5:5:0.35,noise=alls=5:allf=t+u,fade=t=in:d=0.4,format=yuv420p"}
if [ -n "$AUDIO" ]; then
  ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -i "$AUDIO" -filter_complex "[0:v]$GRADE[v]" -map "[v]" -map 1:a \
    -c:v libx264 -preset slow -crf 14 -profile:v high -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
else
  ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -filter_complex "[0:v]$GRADE[v]" -map "[v]" \
    -c:v libx264 -preset slow -crf 14 -profile:v high -movflags +faststart "$OUT"
fi
SOCIAL="${OUT%.mp4}_social.mp4"
ffmpeg -v error -y -i "$OUT" -c:v libx264 -preset slow -b:v 14M -maxrate 18M -bufsize 28M -pix_fmt yuv420p -c:a copy -movflags +faststart "$SOCIAL"
rm -f "$LIST"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,nb_frames -of compact "$OUT"
ls -la "$OUT" "$SOCIAL"

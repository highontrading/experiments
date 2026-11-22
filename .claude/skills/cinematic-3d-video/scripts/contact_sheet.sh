#!/usr/bin/env bash
# One image showing a video (or chunk) sampled over time - the quickest way to review motion,
# continuity between chunks and the grade without watching it. Read the JPG afterwards.
# usage: contact_sheet.sh VIDEO OUT.jpg [samples_per_second=2] [columns=8]
set -e
V=$1; OUT=$2; FPS=${3:-2}; COLS=${4:-8}
N=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V" | awk -v f="$FPS" '{printf "%d", $1*f+0.999}')
ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -i "$V" -vf "fps=$FPS,scale=200:-1,tile=${COLS}x${ROWS}" -frames:v 1 "$OUT"
echo "$OUT ($N tiles)"

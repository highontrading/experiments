#!/usr/bin/env bash
# Render frames START..END of a .blend and pack them into one near-lossless chunk.
# usage: render_chunk.sh SCENE.blend START END [OUTDIR=chunks]
# -> OUTDIR/chunk_SSSS_EEEE.mkv (x264 crf 4, yuv444p: tiny enough to push through git, clean enough to grade)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
BLEND=$1; S=$2; E=$3; OUT=${4:-chunks}
BLENDER=${BLENDER:-$(bash "$HERE/setup_blender.sh")}
FR="frames_${S}_${E}"; mkdir -p "$FR" "$OUT"
"$BLENDER" -b "$BLEND" -P "$HERE/render.py" -- range "$S" "$E" "$PWD/$FR" 2>&1 | grep -E "Saved|Error|Traceback" || true
N=$(ls "$FR"/f_*.png 2>/dev/null | wc -l)
[ "$N" -eq $((E - S + 1)) ] || { echo "ERROR: expected $((E - S + 1)) frames, got $N" >&2; exit 1; }
FPS=$("$BLENDER" -b "$BLEND" --python-expr "import bpy;print('FPS=',bpy.context.scene.render.fps)" 2>/dev/null | sed -n 's/^FPS= //p')
ffmpeg -v error -y -framerate "${FPS:-24}" -start_number "$S" -i "$FR/f_%04d.png" \
  -c:v libx264 -preset slow -crf 4 -pix_fmt yuv444p "$OUT/chunk_$(printf %04d "$S")_$(printf %04d "$E").mkv"
ls -la "$OUT"

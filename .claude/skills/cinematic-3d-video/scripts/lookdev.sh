#!/usr/bin/env bash
# One look-dev pass: rebuild scene.py -> scene.blend, render preview stills, stack them side by side.
# usage: lookdev.sh SCENE.py TAG [frames=first,mid,last] [pct=50] [samples=16]
#   -> lookdev/TAG_f####.png and lookdev/TAG_sheet.png (Read the sheet, then fix and run again with a new TAG)
# Sets CINE_LIB itself, so it works from any shell.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; export CINE_LIB="$HERE"
SCENE=$1; TAG=$2; FRAMES=$3; PCT=${4:-50}; SAMPLES=${5:-16}
DIR="$(cd "$(dirname "$SCENE")" && pwd)"; cd "$DIR"
BLENDER=${BLENDER:-$(bash "$HERE/setup_blender.sh")}
"$BLENDER" -b -P "$(basename "$SCENE")" -- scene.blend 2>&1 | grep -E "SAVED|Error|Traceback|line [0-9]+" || true
[ -f scene.blend ] || { echo "ERROR: scene.blend was not written" >&2; exit 1; }
if [ -z "$FRAMES" ]; then
  FRAMES=$("$BLENDER" -b scene.blend --python-expr "import bpy;s=bpy.context.scene;print('FR=%d,%d,%d'%(s.frame_start,(s.frame_start+s.frame_end)//2,s.frame_end))" 2>/dev/null | sed -n 's/^FR=//p')
fi
mkdir -p lookdev
"$BLENDER" -b scene.blend -P "$HERE/render.py" -- stills "$FRAMES" "lookdev/$TAG" --pct "$PCT" --samples "$SAMPLES" 2>&1 | grep -E "^STILL|^SHEET|Error|Traceback"

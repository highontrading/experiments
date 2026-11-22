#!/usr/bin/env bash
# Rebuilds everything the night camera scene needs, from scratch. usage: bash setup.sh -> ./scene.blend
set -e
cd "$(dirname "$0")"
export CINE_LIB="${CINE_LIB:-$(cd ../../scripts && pwd)}"
BLENDER=$(bash "$CINE_LIB/setup_blender.sh")
python3 make_textures.py
python3 "$CINE_LIB/polyhaven.py" model Camera_01 desk_lamp_arm_01 binder_notebook
python3 "$CINE_LIB/polyhaven.py" texture smoked_walnut_veneer wood_table plastered_wall_04
"$BLENDER" -b -P scene.py -- scene.blend 2>&1 | grep -E "SAVED|Error|Traceback"

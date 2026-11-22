#!/usr/bin/env bash
# Rebuilds everything the retro desk scene needs, from scratch, on any machine.
# usage: bash setup.sh   (from anywhere) -> ./scene.blend
set -e
cd "$(dirname "$0")"
export CINE_LIB="${CINE_LIB:-$(cd ../../scripts && pwd)}"
BLENDER=$(bash "$CINE_LIB/setup_blender.sh")
python3 make_textures.py
python3 "$CINE_LIB/polyhaven.py" model potted_plant_02 office_notepads stationery_supplies round_spectacles portable_cassette_player
python3 "$CINE_LIB/polyhaven.py" texture black_walnut_veneer_02 american_walnut_veneer beige_wall_002
"$BLENDER" -b -P scene.py -- scene.blend 2>&1 | grep -E "SAVED|Error|Traceback"

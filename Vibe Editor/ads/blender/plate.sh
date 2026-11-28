#!/bin/bash
# Final plate for one scene folder: beauty render, screen corners, flat screen-ID pass.
# usage: plate.sh <scene_dir> [extra_layer_script.py]
set -e
export CINE_LIB=/root/.claude/skills/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/cinematic-3d-video/scripts
B=/opt/blender/blender-4.2.3-linux-x64/blender
D="$(cd "$1" && pwd)"; cd "$D"
"$B" -b -P scene.py -- scene.blend 2>&1 | grep -E "SAVED|Error|Traceback" || true
mkdir -p plate
"$B" -b scene.blend -o "$D/plate/beauty_####" -F PNG -f 1 2>&1 | grep -E "Saved|Error" | tail -2
"$B" -b scene.blend --python-expr "import sys,os;sys.path.insert(0,'$D/..');os.environ['CINE_LIB']='$CINE_LIB';import common as K;K.export_screens('$D/plate/screens.json')" 2>&1 | grep -E "SCREENS|Error|Traceback"
"$B" -b scene.blend --python-expr "import sys,os;sys.path.insert(0,'$D/..');os.environ['CINE_LIB']='$CINE_LIB';import common as K;K.id_render('$D/plate/ids.png')" 2>&1 | grep -E "IDS|Error|Traceback"
echo PLATE_DONE "$D"

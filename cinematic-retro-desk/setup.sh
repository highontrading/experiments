#!/usr/bin/env bash
# Installs Blender 4.2.3 LTS, downloads the CC0 Poly Haven assets and builds scene.blend
set -e
cd "$(dirname "$0")"
if [ ! -x /opt/blender/blender-4.2.3-linux-x64/blender ]; then
  mkdir -p /opt/blender && curl -sL https://download.blender.org/release/Blender4.2/blender-4.2.3-linux-x64.tar.xz | tar xJ -C /opt/blender
fi
python3 fetch.py classic_laptop,potted_plant_02,office_notepads,stationery_supplies,round_spectacles,portable_cassette_player black_walnut_veneer_02,american_walnut_veneer,beige_wall_002
/opt/blender/blender-4.2.3-linux-x64/blender -b -P build_scene.py 2>&1 | grep -E "SAVED|Error"

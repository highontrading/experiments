#!/usr/bin/env bash
# Installs Blender 4.2 LTS (headless-capable) to /opt/blender if it's not there, and prints the binary path.
# Usage: BLENDER=$(bash setup_blender.sh)
set -e
VER=4.2.3
BIN=/opt/blender/blender-$VER-linux-x64/blender
if [ ! -x "$BIN" ]; then
  mkdir -p /opt/blender
  curl -sL "https://download.blender.org/release/Blender4.2/blender-$VER-linux-x64.tar.xz" | tar xJ -C /opt/blender
fi
command -v ffmpeg >/dev/null || echo "WARNING: ffmpeg not found - install it for assembly (apt-get install -y ffmpeg)" >&2
echo "$BIN"

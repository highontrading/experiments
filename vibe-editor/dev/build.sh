#!/usr/bin/env bash
# Build dist/vibe-editor.zip (upload this in Claude Desktop: Customize > Plugins > Add > Upload plugin)
set -euo pipefail
cd "$(dirname "$0")/.."
python3 dev/validate.py
mkdir -p dist
rm -f dist/vibe-editor.zip
find plugin -name "__pycache__" -type d -prune -exec rm -rf {} +
(cd plugin && zip -qr -X ../dist/vibe-editor.zip vibe-editor -x "*.DS_Store" "*/__pycache__/*")
ls -lh dist/vibe-editor.zip

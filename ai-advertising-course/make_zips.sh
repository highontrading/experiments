#!/usr/bin/env bash
# Builds upload-ready zips into dist/:
#   dist/student-kit.zip            the whole kit (for the course page)
#   dist/skills/<skill-name>.zip    one zip per skill (for Claude: Settings > Capabilities > Skills)
set -euo pipefail
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist/skills
(cd student-kit/skills && for s in */; do s=${s%/}; zip -qr "../../dist/skills/$s.zip" "$s" -x '*__pycache__*'; done)
zip -qr dist/student-kit.zip student-kit -x '*__pycache__*'
ls -1 dist dist/skills

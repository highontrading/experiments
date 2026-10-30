#!/usr/bin/env bash
# Fetch this video's real assets and shrink the Met originals (up to 6000 px) to 1600 px.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -I lib/fetch.py the-four-pieces-of-every-great-edit
for f in assets/images/fp_*.jpg; do
  [ "$(identify -format '%[fx:max(w,h)]' "$f")" -gt 1600 ] && mogrify -resize '1600x1600>' -quality 90 "$f"
done
python3 lib/cutout.py the-four-pieces-of-every-great-edit

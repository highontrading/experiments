#!/usr/bin/env bash
# tools/stills.sh b02 1.0,2.0,3.0  -> build/stills/_b02.jpg strip
cd "$(dirname "$0")/.." ; ad=$1; times=$2
node render.js $ad --times $times 2>&1 | grep -v ERR_FILE_NOT_FOUND
python3 - "$ad" "$times" <<'PY'
import sys; from PIL import Image
ad, ts = sys.argv[1], sys.argv[2].split(",")
ims = [Image.open(f"build/stills/{ad}_t{float(x):.2f}.jpg") for x in ts]
h = 640; ims = [im.resize((int(im.width * h / im.height), h)) for im in ims]
S = Image.new("RGB", (sum(i.width for i in ims), h)); x = 0
for im in ims: S.paste(im, (x, 0)); x += im.width
S.save(f"build/stills/_{ad}.jpg", quality=85)
PY

#!/usr/bin/env bash
# make_meta.sh r01 : builds the Meta version r01m of trailer r01 (shares its frames' sources, VO and timeline)
set -e; cd "$(dirname "$0")"; b=$1; m=${b}m
mkdir -p build/$m; [ -e build/$m/seq ] || ln -s ../$b/seq build/$m/seq
cp build/$b/assets.js build/$m/assets.js; [ -f build/$b/tl.js ] && cp build/$b/tl.js build/$m/tl.js || true
printf 'window.META = true;\ndocument.write(%s);\n' "'<script src=\"ads/$b.js\"><\\/script>'" > ads/$m.js
rm -rf "build/$m/frames"; node render.js $m
python3 mix.py $m; ./master.sh $m -14
slug=$(node -e "global.window={};" -e "" 2>/dev/null; python3 -c "import re;s=open('ads/$b.js').read();m=re.search(r'slug:\s*\"([^\"]+)\"',s);print((m.group(1) if m else '$b')+'_meta')")
ffmpeg -v error -y -framerate 30 -i build/$m/frames/f%04d.jpg -i build/$m/master.wav -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
  -profile:v high -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "out/${m}_${slug}.mp4"
find build/$m/frames -name 'f*.jpg' -delete; echo "wrote out/${m}_${slug}.mp4"

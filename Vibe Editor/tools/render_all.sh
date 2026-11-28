#!/bin/bash
# Final renders of all 10 edits (5 styles x EN/HI). Re-running overwrites the files in output/.
set -e
cd "/home/user/experiments/Vibe Editor"
R="python3 tools/vibe_run.py"
for s in style1 style2 style3 style4 style5; do python3 tools/$s.py en hi > /dev/null; done
for s in style1-kinetic style2-editorial style4-neon style5-docu; do
  for l in en hi; do
    echo "== $s-$l"; $R render $l --edit plans/$s-$l.json 2>&1 | tail -2
  done
done
mkdir -p .vibe/parts
for l in en hi; do
  for x in after before; do echo "== style3-$x-$l"; $R render $l --edit plans/style3-$x-$l.json 2>&1 | tail -1; done
  mv -f output/style3-after-$l-16x9.mp4 output/style3-before-$l-16x9.mp4 .vibe/parts/
  (cd tools && python3 -c "
from style3 import composite
from velib import Words
composite('../.vibe/parts/style3-after-$l-16x9.mp4','../.vibe/parts/style3-before-$l-16x9.mp4','../output/style3-split-$l.mp4','$l',Words('$l').dur)")
  echo "== style3-split-$l composited"
done
echo ALLDONE

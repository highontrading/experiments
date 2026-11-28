#!/bin/bash
# Render the remaining plates one after another once the wall jobs are finished.
cd "/home/user/experiments/Vibe Editor/ads/blender"
while pgrep -f "plate.sh wall" > /dev/null; do sleep 20; done
for s in signal signal_icons dream; do ./plate.sh $s > $s/plate.log 2>&1; echo "done $s"; done
echo QUEUE_DONE

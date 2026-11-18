#!/bin/bash
# Full build for the Vibe Editing Meta ads. Needs the raw clips + work dir prepared (see README).
#   ./make.sh            all three ads
#   ./make.sh 2511       one ad
set -e
cd "$(dirname "$0")"
IDS=${@:-2508 2511 2512}
python3 tools/build_edl.py edit/cuts.json edit/edl.json
python3 tools/cut_audio.py edit/edl.json /home/user/work
python3 tools/timeline.py $IDS
for n in $IDS; do
  rm -rf build/$n/frames
  node render.js --id $n --jobs 4
  python3 tools/mix.py $n
  tools/encode.sh $n vibe_edit_$n
done

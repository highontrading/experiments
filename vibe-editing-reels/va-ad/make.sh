#!/usr/bin/env bash
# Full pipeline for the VA ad (v2). Needs the Vibe Editor job "talk1" prepped in vibe-editor-workspace.
set -e
cd "$(dirname "$0")"
python3 prep.py          # cut + grade base plate, person matte (MODNet 512px), words/segments
python3 handmatte.py     # skin matte so hands pass in front of glass cards
node render.js --video --out build/gfx.mp4   # HTML motion graphics composited over the plate
python3 sound.py         # synthesised ASMR-level SFX cue sheet
python3 mix.py           # voice chain + ducked felt-piano bed + SFX, -14 LUFS
O=../../vibe-editor-workspace/output
ffmpeg -v error -y -i build/gfx.mp4 -i build/audio/mix.wav -vf "unsharp=5:5:0.3:5:5:0,noise=alls=3:allf=t,format=yuv420p" \
  -c:v libx264 -crf 20 -preset slow -tune grain -maxrate 14M -bufsize 28M -profile:v high -c:a aac -b:a 256k -movflags +faststart -shortest $O/va-reel-v2.mp4
python3 compare.py       # raw vs edited promo layout (title, Raw/Edited cards, Comment "VIBE" CTA)

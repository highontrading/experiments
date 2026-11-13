#!/usr/bin/env bash
# Full build. Needs: ELEVENLABS_API_KEY (only for vo/music/sfx), python3 (numpy scipy librosa soundfile opencv demucs),
# node + playwright (chromium), ffmpeg.
#   ./make.sh            picture + sound + encode (uses existing VO/music/SFX/assets)
#   ./make.sh audio      generate VO, score, SFX with ElevenLabs, split score stems
#   ./make.sh assets     fetch CC0 photos, crop circles, prep stills + clip frames
#   ./make.sh stills     test stills for both formats -> build/stills/
set -e; cd "$(dirname "$0")"
case "$1" in
  audio)  python3 vo.py; python3 music.py a; python3 sfx.py
          python3 -m demucs -n htdemucs -o build/music/stems build/music/score_a.mp3; exit;;
  assets) python3 tools/fetch_cc0.py build/src/circles 3 "camera lens" "lens aperture" "ring light" "stage spotlight" "film reel" "vinyl record" \
            "eye iris macro" "clock face" "porthole window" "compact disc" "telescope" "drum top" "round window" "spiral staircase from above" \
            "hurricane satellite" "blue marble earth"
          python3 tools/fetch_cc0.py build/src/history 3 "1920s magazine advertisement" "vintage radio microphone" "1950s television set" "camera lens"
          python3 tools/fetch_cc0.py build/src/oldworld 3 "film camera on tripod" "clapperboard" "polaroid photos" "cinema camera"
          python3 tools/circle_crop.py build/src/circles build/src/circles_sq; python3 prep.py; exit;;
esac
python3 timeline.py > /dev/null; python3 js_data.py
if [ "$1" = stills ]; then for s in 1920x1080 1080x1920; do node render.js --size $s --times 0.5,2.6,5.0,7.0,12.9,14.9,15.6,17.0,18.3,20.5,23.5,24.9,25.5,27.3,28.9,31.0,33.3,37.0,43.0,46.6,47.6,49.8,52.0; done; exit; fi
python3 mix.py; ./master.sh -14 build/master_169.wav; ./master.sh -12 build/master_916.wav
node render.js --size 1920x1080 & node render.js --size 1080x1920 & wait
mkdir -p out
enc() { ffmpeg -v error -y -framerate 30 -i build/frames_$1/f%04d.jpg -i $2 -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p \
          -profile:v high -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$3"; echo "wrote $3"; }
enc 1920x1080 build/master_169.wav out/AI_in_Advertising_trailer_16x9.mp4
enc 1080x1920 build/master_916.wav out/AI_in_Advertising_trailer_9x16.mp4

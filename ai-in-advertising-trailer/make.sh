#!/usr/bin/env bash
# Full rebuild of the AI in Advertising trailer.
#   ./make.sh assets   -> VO, music, SFX (ElevenLabs; needs ELEVENLABS_API_KEY), footage + screen captures
#   ./make.sh stills 60 300 ...   -> preview frames into build/stills/
#   ./make.sh          -> picture + mix + final MP4 into out/
set -euo pipefail
cd "$(dirname "$0")"
T=tools; Bd=build
case "${1:-all}" in
  assets)
    mkdir -p $Bd/vo $Bd/music $Bd/sfx $Bd/screens/seq assets/logos_png
    python3 $T/vo.py $Bd/vo
    python3 $T/music.py $Bd/music/score_a.mp3
    python3 $T/music_prompt.py $Bd/music/drums_a.mp3 24000 "Dark aggressive cinematic tech trailer music, exactly 125 BPM, A minor. Relentless four-on-the-floor kick drum on every single beat from the very first second to the end, no intro, no breakdown, no fade. Heavy distorted pulsing sub bass on the off-beats, tight metallic hi-hats, glitchy digital percussion fills, dark synth stabs. Premium, modern, high energy, instrumental."
    python3 $T/music_prompt.py $Bd/music/bed_a.mp3 30000 "Dark cinematic ambient drone for a tech documentary trailer, A minor, 125 BPM feel but no drums at all, no kick, no percussion. Deep sustained distorted sub bass drone, cold digital pads, subtle glitch textures and data noise, slow rising tension, spacious, premium, instrumental."
    python3 $T/music_prompt.py $Bd/music/drums_b.mp3 24000 "Dark epic cinematic tech trailer finale, exactly 125 BPM, A minor. Driving four-on-the-floor kick on every beat from the first second to the end, no intro, no breakdown. Huge distorted sub bass, fast rising synth arpeggios climbing in pitch, metallic hats, glitch fills, maximum intensity, premium modern, instrumental."
    ffmpeg -v error -y -i $Bd/music/drums_b.mp3 -af "rubberband=pitch=0.943874:tempo=1" -ar 44100 $Bd/music/drums_b_A.mp3
    python3 $T/sfx.py $Bd/sfx
    node $T/prep_logos.js assets
    echo "Footage: see SOURCES.md (Mixkit ids + archive.org Prelinger items); screen captures: tools/capture.js, tools/capture_seq.js"
    ;;
  stills) shift; (cd trailer && python3 render.py stills "$@") ;;
  all)
    (cd trailer && python3 sound.py && python3 render.py video 4)
    mkdir -p out
    ffmpeg -v error -y -i $Bd/picture.mp4 -i $Bd/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
      -c:a aac -b:a 320k -movflags +faststart -shortest out/ai_in_advertising_trailer.mp4
    echo "-> out/ai_in_advertising_trailer.mp4"
    ;;
esac

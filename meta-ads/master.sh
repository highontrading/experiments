#!/usr/bin/env bash
# master.sh <ad> [LUFS]: master build/<ad>/mix.wav to target with limiter -> build/<ad>/master.wav
set -e; ad=$1; tgt=${2:--14}
meas() { ffmpeg -hide_banner -i "$1" -af ebur128 -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}'; }
i=$(meas build/$ad/mix.wav); g=$(python3 -c "print($tgt-($i))")
ffmpeg -v error -y -i build/$ad/mix.wav -af "volume=${g}dB,alimiter=limit=0.85:attack=1:release=60:level=disabled" -c:a pcm_f32le build/$ad/_m.wav
i2=$(meas build/$ad/_m.wav); g2=$(python3 -c "print($tgt-($i2))")
ffmpeg -v error -y -i build/$ad/_m.wav -af "volume=${g2}dB,alimiter=limit=0.89:attack=1:release=60:level=disabled" -c:a pcm_s24le build/$ad/master.wav
echo "$ad master $(meas build/$ad/master.wav) LUFS"

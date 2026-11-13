#!/usr/bin/env bash
# master.sh <target LUFS> <out.wav> : gain to target, brickwall at -1 dBTP, re-trim once.
set -e; tgt=$1; out=$2
meas() { ffmpeg -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}'; }
i=$(meas build/mix.wav); g=$(python3 -c "print($tgt-($i))")
ffmpeg -v error -y -i build/mix.wav -af "volume=${g}dB,alimiter=limit=0.85:attack=1:release=60:level=disabled" -ar 48000 -c:a pcm_f32le build/_m1.wav
i2=$(meas build/_m1.wav); g2=$(python3 -c "print($tgt-($i2))")
ffmpeg -v error -y -i build/_m1.wav -af "volume=${g2}dB,alimiter=limit=0.89:attack=1:release=60:level=disabled" -ar 48000 -c:a pcm_s24le "$out"
echo "$out: $(meas "$out") LUFS (target $tgt)"

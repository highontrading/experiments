#!/usr/bin/env bash
# tools/job.sh r03 : build trailer + meta version, serialized through one of two lanes (flock)
cd "$(dirname "$0")/.."; a=$1
for lane in 1 2; do exec {fd}>build/lane$lane.lock; if flock -n $fd; then break; fi; exec {fd}>&-; fd=; done
if [ -z "$fd" ]; then exec {fd}>build/lane1.lock; flock $fd; fi
./make_ad.sh $a > build/$a.log 2>&1 && ./make_meta.sh $a > build/${a}m.log 2>&1 && echo "$a OK" >> build/jobs.log || echo "$a FAIL" >> build/jobs.log

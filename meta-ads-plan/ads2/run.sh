#!/bin/bash
# usage: ./run.sh e03_one_photo e05_pov_bedroom ...   (runs up to 3 in parallel, logs to ../build/logs)
mkdir -p ../build/logs
printf "%s\n" "$@" | xargs -P 3 -I{} bash -c 'python3 {}.py > ../build/logs/{}.log 2>&1; echo "{} exit=$? $(tail -n 1 ../build/logs/{}.log)"'

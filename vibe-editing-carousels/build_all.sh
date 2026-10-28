#!/usr/bin/env bash
# Build several carousels one after another: ./build_all.sh 02-prompt-formula 04-captions ...
set -euo pipefail
cd "$(dirname "$0")"
for c in "$@"; do ./make.sh "$c"; done

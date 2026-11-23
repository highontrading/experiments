#!/usr/bin/env bash
# Re-download the Mixkit stock clips used by timeline.py (free Mixkit licence, 720p).
set -euo pipefail
cd "$(dirname "$0")"; mkdir -p assets/stock
for id in 31010 18296 27768 2088 18303 30979 36337 31011 25968 47258 2011 11071 31042 24047 27770 20970 23126 23125 23282 47051 13129 34288 20770 22982 47050 21617 49736; do
  [ -s assets/stock/$id.mp4 ] || curl -sfL -o assets/stock/$id.mp4 "https://assets.mixkit.co/videos/$id/$id-720.mp4"
done
# newer Mixkit items use a different asset path
u=$(curl -s "https://mixkit.co/free-stock-video/a-hand-moves-a-white-chess-piece-and-takes-a-100113/" | grep -oE 'https://assets.mixkit.co/[^"]+-720\.mp4' | head -1)
[ -s assets/stock/100113.mp4 ] || curl -sfL -o assets/stock/100113.mp4 "$u"
echo ok

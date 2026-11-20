#!/bin/bash
# Vibe Editing: one-time setup for macOS. Run:  bash install/install_mac.sh
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ENGINE="$HERE/../skills/vibe-edit/engine/ve.py"
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is not installed. Install it from https://brew.sh (one command), then run this again."
  exit 1
fi
command -v python3 >/dev/null 2>&1 || brew install python
command -v ffmpeg  >/dev/null 2>&1 || brew install ffmpeg
python3 "$ENGINE" setup

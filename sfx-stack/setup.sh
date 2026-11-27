#!/usr/bin/env bash
# One-time setup of the three-layer SFX stack (Openverse -> earshot -> real-sfx).
#   bash sfx-stack/setup.sh            earshot with its ears (CPU torch + ~1.1 GB of models), real-sfx config
#   SFX_VENV=/path bash setup.sh       another venv location (default ~/.venvs/sfx)
set -euo pipefail
cd "$(dirname "$0")/.."
VENV="${SFX_VENV:-$HOME/.venvs/sfx}"

command -v ffmpeg >/dev/null || { echo "ffmpeg is required (brew install ffmpeg-full / apt install ffmpeg / winget install Gyan.FFmpeg)"; exit 1; }

# Layer 2: earshot. Install from GitHub: the name `earshot` on PyPI belongs to another project.
if [[ ! -x "$VENV/bin/earshot" ]]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q torch --index-url https://download.pytorch.org/whl/cpu
  "$VENV/bin/pip" install -q "earshot[listen,mcp,images] @ git+https://github.com/Leonxlnx/earshot"
fi
"$VENV/bin/earshot" doctor --fetch | grep -E "models_cached|problems"

# Layer 3: real-sfx (the skill lives in .claude/skills/real-sfx). uisfx gives 78 CC0 UI cues out of the box;
# the Openverse library is registered once it exists (python earshot_pick.py ... --library sfx-stack/library).
cd .claude/skills/real-sfx
[[ -f config.json ]] || python3 scripts/setup.py init --uisfx
if [[ -f ../../../sfx-stack/library/catalog.json ]]; then
  python3 scripts/setup.py add-library openverse "$(cd ../../../sfx-stack/library && pwd)" --tier main --index
fi
python3 scripts/setup.py check | sed -n '/config/,$p'
echo "ready. python for earshot steps: $VENV/bin/python"

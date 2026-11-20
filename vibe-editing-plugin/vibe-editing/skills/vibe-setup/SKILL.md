---
name: vibe-setup
description: Install and check everything the Vibe Editing plugin needs (Python, ffmpeg, Whisper, the plugin's own virtualenv) on Mac or Windows, and fix setup problems. Use on first use of Vibe Editing, when `ve doctor` reports FIX lines, or when the user says "set up vibe editing", "install the editing tools", "it says ffmpeg not found", "whisper is not installed".
---

# Vibe Setup

Goal: `ve doctor` shows OK on every line. `ENGINE = <this skill's base directory>/../vibe-edit/engine/ve.py`.

## 1 · Check what's there
```
python3 "<ENGINE>" doctor      # Windows: python "<ENGINE>" doctor
```
If `python3`/`python` itself is missing, start at step 2.

## 2 · Install the two system tools (ask before installing anything)

**Mac** (Homebrew; if `brew` is missing, the user installs it from https://brew.sh first):
```
brew install python ffmpeg
```

**Windows** (winget is built into Windows 10/11):
```
winget install -e --id Python.Python.3.12
winget install -e --id Gyan.FFmpeg
```
Then the user must **close and reopen** the terminal (or restart Claude) so the new PATH loads.
If winget is unavailable: Python from python.org (tick "Add python.exe to PATH"), and the
"full" ffmpeg build from gyan.dev, unzipped with its `bin` folder added to PATH.

**Linux**: `sudo apt install python3 python3-venv ffmpeg`.

The installers in this plugin's `install/` folder do the same thing:
`install/install_mac.sh` and `install/install_windows.ps1`.

## 3 · Install the Python packages
```
python3 "<ENGINE>" setup
```
Creates `~/.vibe-editing/venv` and installs `faster-whisper` and `numpy` there (nothing is
installed into the system Python). Takes 1–3 minutes. It runs `doctor` at the end.

## 4 · First transcription downloads the Whisper model
The first `ve analyze` downloads the speech model once (`small` ≈ 480 MB, `medium` ≈ 1.5 GB)
from huggingface.co. Warn the user it takes a few minutes on the first run only.

## Common problems
| Problem | Fix |
|---|---|
| `externally-managed-environment` from pip | Use `ve setup` (it uses its own venv), never `pip install` into Homebrew Python |
| ffmpeg filter `ass` / `sidechaincompress` missing | The ffmpeg build is too minimal: install Homebrew's ffmpeg or gyan.dev's **full** build |
| ffmpeg version below 5 | Update ffmpeg |
| Windows: `python` opens the Microsoft Store | Install Python (step 2) and turn off the "App execution aliases" for python in Settings |
| Slow transcription | Normal on CPU: about real-time with `small`. Use `--model base` for drafts |
| Apple Silicon | Works natively, nothing special needed |
| Corporate network blocks huggingface.co | Download needs internet once; try another network |

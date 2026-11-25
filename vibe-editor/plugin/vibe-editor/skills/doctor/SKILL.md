---
name: doctor
description: Diagnose and fix Vibe Editor problems such as install failures, missing ffmpeg or speech engine, render errors, wrong fonts, bad captions, out-of-sync audio, slow renders or "it's not working". Use when anything in Vibe Editor fails or the user reports a problem.
---

# Vibe Editor — doctor

Engine: `${CLAUDE_SKILL_DIR}/../edit/scripts/vibe.py` (run with `python3`; on Windows try `python`, then `py`).

Start with `python3 "<ENGINE>" doctor` (add `--ws "<workspace>"` if you know it). Fix each ❌ in order, re-running doctor after each fix. Keep the user calm: one plain sentence about what you're fixing, no walls of logs.

## Common fixes

| problem | fix |
|---|---|
| `python3` not found | try `python` / `py`. If no Python at all: ask them to install Python 3.11+ from python.org (Windows: tick "Add Python to PATH"), then retry. |
| Speech engine missing | `python3 "<ENGINE>" install` |
| pip "externally managed environment" | `install` already retries with `--user` / `--break-system-packages`; if still failing, create a venv: `python3 -m venv ~/.vibe-venv` and run the engine with `~/.vibe-venv/bin/python` (Windows: `%USERPROFILE%\.vibe-venv\Scripts\python.exe`), then `install` again. |
| ffmpeg missing / "without libass" | `install` adds a portable ffmpeg (imageio-ffmpeg). Or install system ffmpeg: macOS `brew install ffmpeg`, Windows `winget install Gyan.FFmpeg`, Linux `sudo apt install ffmpeg`. Override with env var `VIBE_FFMPEG=/path/to/ffmpeg`. |
| Model download fails | network/proxy issue: retry; try a smaller model `install --model base`; make sure huggingface.co is reachable. |
| Very slow transcription | use `prep --model base` (faster, a bit less accurate); close other apps. |
| Very slow render | normal: ~1–2× video length on a laptop. Use `render --preview` while iterating; final only once. |
| "Phrase not found" warning | the phrase isn't in the transcript as written; check `timeline <job>` and use exact words or seconds. |
| Captions wrong words | `fix <job> '{"index":"correct word"}'` (see transcript.txt for indices) |
| Hindi shows as Devanagari but they want Roman | transliterate with `fix` (one call with all indices) |
| Boxes / missing characters in text | font lacks that script: use the matching script font (`devanagari`, `tamil`, …) or `noto-black` for symbols like ₹ ✓ |
| Face cut off in 9:16 | `reframe.x`/`y` in edit.json, or `"mode": "fit-blur"` |
| Audio out of sync | re-run `prep --reset` on the original file; if it's a screen recording with variable frame rate, convert first: `ffmpeg -i in.mp4 -r 30 -c:a copy fixed.mp4` (use the engine's ffmpeg path from doctor) |
| "File not found" for b-roll/music/logo | files must be inside the workspace's `broll/`, `music/`, `brand/` folders |
| Workspace not writable | pick a folder in Documents/Desktop that the user owns |
| "AI cut-out runtime missing" | `install` again; if onnxruntime can't install on that machine, everything else still works (text-behind/cut-out effects are shown in front / skipped) |
| AI model download fails | needs huggingface.co once; retry `install`. The model is cached in ~/.cache/vibe-editor |
| Text behind the person "moved in front" | the readability check found the person would hide it: move it higher/bigger or use a shorter word |
| "Rendered in safe mode" | an advanced effect broke ffmpeg; the video is fine without it. Check the named effect's options (see reference) and re-render |
| A custom look/filter "rejected" | the ffmpeg filter string is invalid; fix or remove it (it never breaks the render) |
| Own font not used | file must be .ttf/.otf in fonts/ or brand/; run `fonts` to see its key; `install` adds fonttools for exact sizing |
| Effect "could not be built and was skipped" | run `check <job>`; fix that effect's options; set `VIBE_DEBUG=1` to see the full error |

If you can't fix it, collect: the doctor output, the exact command, and the last lines of the error, and tell the user to send those to the Vibe Editor support contact from their purchase email.

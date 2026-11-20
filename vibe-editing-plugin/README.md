# Vibe Editing plugin

The Claude Code plugin for the Vibe Editing course by Ideabro Studio.

| Path | What it is |
|---|---|
| `vibe-editing/` | **The plugin.** Give students this folder (or `dist/vibe-editing.zip`) |
| `vibe-editing/GUIDE.md` | How to install and use it (for you and for students) |
| `LECTURE-PLAN.md` | Suggested lecture list for recording the course |
| `dist/my-edits-starter.zip` | **Easiest for students:** `CLAUDE.md` + `vibe-editing/`. Unzip into your editing folder and open it in Claude Code |
| `dist/vibe-editing.zip` | The plugin alone (for `~/.claude/skills/`) |
| `workspace-starter/CLAUDE.md` | The workspace instructions that make Claude use the plugin automatically |

## Build the zip

```bash
cd vibe-editing-plugin && rm -rf dist && mkdir -p dist/my-edits-starter && zip -rq dist/vibe-editing.zip vibe-editing -x '*/__pycache__/*' '*.pyc' && cp -r workspace-starter/CLAUDE.md vibe-editing dist/my-edits-starter/ && (cd dist && zip -rq my-edits-starter.zip my-edits-starter -x '*/__pycache__/*' && rm -rf my-edits-starter)
```

## Check the plugin

```bash
claude plugin validate vibe-editing
```

## How it works (for maintainers)

- `skills/vibe-edit/engine/ve.py` is the single entry point (setup, doctor, new, analyze, show,
  style, plan, board, render, frames, open, versions). It moves itself into
  `~/.vibe-editing/venv` once `ve.py setup` has created it.
- `analyze.py`: faster-whisper word timestamps (audio decoded by ffmpeg, no PyAV), silences,
  phrase units, retake/false-start detection, filler words, colour stats, contact sheet.
- `style.py`: the style scraper: scene cuts, motion, colour (Lab stats, palette, grain,
  vignette), audio (loudness, music bed, hit density), contact sheets for Claude to read, draft
  `style.json`, style card.
- `plan.py`: builds `edit.json` (segments, punch-ins, caption lines, SFX, hook placeholder),
  versioning.
- `captions.py`: ASS subtitles: word highlight (color/box/scale/word/none), pop/fade/slide,
  emphasis, hook, kinetic type, titles, lower thirds, labels. Style sizes are em sizes; each
  font's `em_ratio` converts them to libass line-height sizes so board, style card and render match.
- `render.py`: two-pass render: audio (voice chain, music with sidechain ducking, SFX,
  two-pass loudnorm to −14 LUFS) then picture (frame-snapped trims, reframe crop or blurred fit,
  punch-ins, LUT + grade, B-roll/PiP, captions), then QC.
- `board.py` + `templates/board.html`: the local edit board (stdlib HTTP server with range
  requests; live preview that skips cuts; saves versioned `edit.json`; runs renders).
- `lut.py`: Lab colour transfer to a 33³ `.cube` LUT. `sfx_synth.py`: the generated SFX pack.

Tested on: Linux, ffmpeg 6.1, Python 3.13, faster-whisper 1.2 (clean `ve.py setup` in a new
virtualenv, paths with spaces, 9:16 / 16:9 / blurred-fit outputs, all caption highlight modes,
B-roll full + PiP, music ducking, QC). Re-transcribing a render, caption lines started within 0.05 s of the speech for 14 of 17 lines
(the first word right after a cut measured up to 0.2 s, mostly Whisper's own uncertainty).
Mac/Windows use the same code; installers are in `vibe-editing/install/`.

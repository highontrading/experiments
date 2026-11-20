# Vibe Editing plugin

The Claude Code plugin for the Vibe Editing course by Ideabro Studio.

| Path | What it is |
|---|---|
| `dist/vibe-editing-plugin.zip` | **What students get:** `CLAUDE.md` + `vibe-editing-plugin/`. Unzip both into an editing folder and open it in Claude Code |
| `vibe-editing-plugin/` | The plugin (3 skills + the engine) |
| `vibe-editing-plugin/GUIDE.md` | How to install and use it (for you and for students) |
| `workspace-starter/CLAUDE.md` | Makes Claude use the plugin automatically in the editing folder |
| `LECTURE-PLAN.md` | Suggested lecture list for recording the course |

## Build the zip

```bash
cd vibe-editing-plugin && rm -rf dist && mkdir -p dist/pkg && cp -r workspace-starter/CLAUDE.md vibe-editing-plugin dist/pkg/ && (cd dist/pkg && zip -rq ../vibe-editing-plugin.zip CLAUDE.md vibe-editing-plugin -x '*/__pycache__/*' '*.pyc') && rm -rf dist/pkg
```

## Check the plugin

```bash
claude plugin validate vibe-editing-plugin
```

## How it works (for maintainers)

The workflow is step by step: the `vibe-edit` skill makes Claude ask and wait at every step
(brief → reference → captions → motion → music/SFX → look → plan → storyboard → render).
All choices and reviews are images; nothing renders before the storyboard is approved.

`skills/vibe-edit/engine/ve.py` is the single entry point:

| Module | Job |
|---|---|
| `intake.py` | Builds the project from files given anywhere; suggests the platform |
| `analyze.py` | faster-whisper word timestamps (audio decoded by ffmpeg), silences, retakes, fillers, colour stats |
| `style.py` | Reference scraper: cuts, motion, colour, audio stats, contact sheets for Claude, draft style |
| `sheets.py` | Option sheets rendered on the user's footage: captions A–H (+R), motion, looks; the style card |
| `audio_sources.py` | Music/SFX: Openverse search + download with credits, ElevenLabs music and SFX generation, keys |
| `plan.py` | `edit.json` from analysis + `brief.json` + style; restyle; versions |
| `captions.py` | ASS subtitles: captions (5 highlight modes), hook, kinetic, title, lower third, label, CTA |
| `render.py` | Shared prep, single-frame renderer (storyboard), full two-pass render, QC |
| `storyboard.py` | Beat selection, frames of the planned edit, annotated storyboard pages |
| `lut.py`, `sfx_synth.py` | Reference colour transfer to a .cube LUT; the built-in SFX pack |

Tested on Linux with ffmpeg 6.1, Python 3.9 and 3.13, and faster-whisper 1.2:
- clean setup;
- paths with spaces;
- Meta-ad, reels, 16:9, blurred-fit and lesson formats;
- all caption styles;
- storyboards with B-roll photos;
- Openverse music and SFX downloads;
- ElevenLabs music and SFX generation;
- restyle;
- QC.

Mac and Windows use the same code; installers are in `vibe-editing-plugin/install/`.

# Vibe Editor (seller / developer notes)

A Claude plugin that turns Claude into a reel editor. Customers upload **one zip** in the Claude desktop app. No GitHub, no terminal, no licence key.

```
vibe-editor/
├── plugin/vibe-editor/          ← this folder IS the product (zipped)
│   ├── .claude-plugin/plugin.json
│   ├── README.md                ← customer quick-start
│   └── skills/
│       ├── edit/                ← main skill + the engine
│       │   ├── SKILL.md         ← the editing workflow Claude follows
│       │   ├── reference/edit-plan.md   ← every effect/option (Claude reads this)
│       │   ├── scripts/vibe.py  ← the engine (transcribe, cut, captions, effects, render)
│       │   └── library/         ← fonts (26), sfx (25), captions.json, looks.json, fonts.json
│       ├── setup/SKILL.md       ← /vibe-editor:setup   install + brand profile
│       ├── effects/SKILL.md     ← /vibe-editor:effects show the library
│       ├── cover/SKILL.md       ← /vibe-editor:cover   cover + post caption
│       └── doctor/SKILL.md      ← /vibe-editor:doctor  troubleshooting
├── dev/
│   ├── build.sh                 ← validates + builds dist/vibe-editor.zip
│   ├── validate.py              ← checks the upload rules (frontmatter keys, no bin/, size)
│   └── make_sfx.py              ← regenerates the original sound-effect library
└── dist/vibe-editor.zip         ← the file you sell (git-ignored, rebuild anytime)
```

## Build the zip

```bash
./dev/build.sh
```

## How it works

1. Customer uploads `vibe-editor.zip` → **Customize → Plugins → Add → Upload plugin**.
2. `/vibe-editor:setup` → Claude runs `vibe.py install` (pip installs `faster-whisper` + `imageio-ffmpeg`, downloads the ~460 MB Whisper "small" model once), creates the workspace folder and writes `brand/brand.json`.
3. `/vibe-editor:edit` → `prep` (transcribe + auto-cut) → Claude cleans the transcript, writes `edit.json` and shows a storyboard → `render --preview` → Claude checks `stills` frames itself → final `render` → `cover` + caption.

The engine renders everything with ffmpeg + libass (ASS subtitles for captions and motion graphics, zoompan for zooms, overlay for b-roll, amix + sidechain ducking for audio, loudnorm to -14 LUFS). Rendering is local; no cloud costs for you.

## Release an update

1. Change files in `plugin/vibe-editor/`, bump `version` in `.claude-plugin/plugin.json`.
2. `./dev/build.sh`.
3. Send customers the new zip. Re-uploading a plugin with the same name replaces the old one. Their workspace, brand and jobs are untouched.

## Requirements (tell customers before they buy)

- Mac or Windows computer, 8 GB RAM+, ~3 GB free disk
- Paid Claude plan (Pro is enough to start)
- Python 3.9+ wherever Claude runs the scripts (Cowork's sandbox has it; on their own machine macOS/Linux usually do, Windows needs python.org)
- Internet once for setup (PyPI + huggingface.co)

## Tested

- Clean install from the zip in a fresh Python venv → `install` → `init` → `prep` → `render` → `stills` → `cover` → `doctor` ✅ (Linux, Python 3.13, ffmpeg 6.1)
- 19s reel, 11 effects + 10 sounds: preview 7s, final 1080×1920 24s on 4 CPU cores; output -13.3 LUFS
- Hindi (Devanagari) shaping, 16:9 export, cover

**Not yet tested (do before launch):** upload in the real Claude desktop app, running inside a Cowork session, macOS and Windows machines.

## Roadmap ideas (free updates)

- "Text behind you" (person segmentation)
- Face-tracking auto-reframe for landscape footage
- Beat-synced montage cuts
- Export to Premiere / DaVinci (FCPXML)
- More caption styles, looks and niche effect packs

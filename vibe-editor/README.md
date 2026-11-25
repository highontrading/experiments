# Vibe Editor (seller / developer notes)

A Claude plugin that turns Claude into a reel editor. Customers upload **one zip** in the Claude desktop app. No GitHub, no terminal, no licence key.

```
vibe-editor/
├── plugin/vibe-editor/               ← the product (zipped by dev/build.sh)
│   ├── .claude-plugin/plugin.json
│   ├── README.md                     ← customer quick-start
│   └── skills/
│       ├── edit/                     ← main skill + engine
│       │   ├── SKILL.md              ← editing workflow Claude follows
│       │   ├── reference/edit-plan.md← every effect/option (generated: dev/make_reference.py)
│       │   ├── scripts/vibe.py       ← entry point
│       │   ├── scripts/vibe_engine/  ← core, text/layout, captions, fx_text, fx_video, fx_ui, fx_data,
│       │   │                            fx_decor, ai (segmentation), presets, render, cli
│       │   └── library/              ← fonts (73) + fontmetrics, sfx (50), captions (47), looks (36), presets (26)
│       ├── setup/   style/   effects/   cover/   doctor/
├── dev/
│   ├── build.sh               validate + build dist/vibe-editor.zip
│   ├── validate.py            upload rules (frontmatter keys, no bin/, size)
│   ├── make_fontmetrics.py    font registry + exact metrics + libass match check
│   ├── make_sfx.py            regenerate the original sound library
│   ├── make_reference.py      regenerate reference/edit-plan.md from the registries
│   ├── fuzz.py                robustness fuzzer (random/malformed plans + renders)
│   └── FX_API.md              how to write an effect module
└── dist/vibe-editor.zip       the file you sell (git-ignored)
```

## Build

```bash
python3 dev/make_reference.py   # after changing effects/presets/styles
./dev/build.sh
```

## How it works

1. Customer uploads the zip → **Customize → Plugins → Add → Upload plugin** → `/vibe-editor:setup`.
2. `vibe.py install` pip-installs `faster-whisper`, `imageio-ffmpeg`, `fonttools`, `onnxruntime`, `numpy`; downloads the Whisper "small" model (~460 MB) and the MODNet cut-out model (26 MB, Apache-2.0).
3. `/vibe-editor:edit`: `prep` (transcribe + auto-cut) → Claude cleans the transcript, writes `edit.json`, runs `check`, shows a storyboard → `render --preview` → Claude inspects `stills` → final `render` → `cover` + caption.
4. Rendering: ffmpeg + libass. Captions and most graphics are ASS overlays (exact font metrics, layout manager so captions dodge graphics, safe-zone clamping). Video effects are filter-graph branches trimmed to their own time window (fast, constant memory). AI effects run MODNet on the frames that need it and composite with `maskedmerge`.
5. Safety net: a broken effect is skipped with a note; if ffmpeg fails, the render retries in up to 4 safe-mode levels, so the customer always gets a video.

## Extensibility (customer side)

`fonts/` own fonts · `sounds/` own sounds · `looks/` .cube LUTs · `styles/` saved caption styles, looks, effect presets (`vibe.py save …`) · raw `ass` effects Claude designs · custom ffmpeg `filter` effects (validated). The `/vibe-editor:style` skill drives this from reference reels/screenshots.

## Release an update

1. Change files in `plugin/vibe-editor/`, bump `version` in `.claude-plugin/plugin.json`.
2. `python3 dev/make_reference.py && ./dev/build.sh`.
3. Send the new zip. Re-uploading the same plugin name replaces it; customer workspaces/styles are untouched.

## Requirements (tell customers before they buy)

Mac or Windows computer, 8 GB RAM+, ~4 GB free disk · paid Claude plan (Pro is enough to start) · Python 3.9+ where Claude runs the scripts · internet once for setup (PyPI + huggingface.co).

## Tested (Linux, Python 3.13, ffmpeg 6.1)

- Every effect type rendered and inspected frame by frame in 9:16 (and many in 16:9/1:1), on a talking-head clip.
- Extensibility: own font, own sound, LUT, saved caption style, saved effect preset, raw ASS effect, custom filter.
- Robustness: random/malformed plan fuzzing; every effect × every numeric option at ±1e9/NaN; memory profiling of
  video/AI effects (full-res 23 s reel with 2 freezes + AI sticker: 43 s, 1.3 GB peak).
- Clean install from the zip in a fresh Python venv.

**Not yet tested (do before launch):** upload + run in the real Claude desktop app (Cowork), macOS, Windows.

## Licences

Fonts: SIL OFL 1.1 / Apache 2.0 (see library/fonts/LICENSES.txt) · sounds: original (dev/make_sfx.py) · MODNet model: Apache 2.0 (downloaded at install, not bundled).

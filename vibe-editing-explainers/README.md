# Vibe Editing: Explainer Series

Short vertical explainers (1080x1920, 30 fps, English voiceover) about **vibe editing**:
editing video by describing it in words and letting AI write the edit as code. Each video
is built the way it describes: a script, a voiceover, and code that renders every frame.

The videos form one series but carry **no episode numbers**, so they can be posted in any
order.

| Video | Design system | Length | Output |
| --- | --- | --- | --- |
| What is vibe editing? | green cutting mat, label blocks, desk objects | 57 s | `what-is-vibe-editing/out/` |
| How vibe editing works | "What's on my desk" catalog: grey paper, numbered product cut-outs, lime pill | 51 s | `how-vibe-editing-works/out/` |
| From film to prompts | "Let's get cozy": serif + pixel type on butter yellow, real objects | 50 s | `from-film-to-prompts/out/` |
| Will AI replace video editors? | spiral wall calendar, royal-blue day cell, die-cut stickers | 46 s | `will-ai-replace-video-editors/out/` |
| How vibe editing is changing the world | garden glass: real sky and meadow, frosted browser, pastel cards | 38 s | `vibe-editing-changes-the-world/out/` |
| How to prompt a vibe edit | cinematic dark 3D: crosshair lines, curved thumbnail wall, glowing serif, gold tags | 41 s | `how-to-prompt-a-vibe-edit/out/` |
| One idea, a hundred videos | money-doc collage: textured backdrops, real cut-outs, rolling counters, bold condensed type | 40 s | `one-idea-a-hundred-videos/out/` |
| Why AI edits look fake | retro grunge pixel: real footage dithered to red/cream, CRTs, pop-ups, spotlights | 39 s | `why-ai-edits-look-fake/out/` |
| Robot voices to AI narrators | sports-doc history collage: stacked years, archival film, stamped cards, cloud wipes | 41 s | `robot-voices-to-ai-narrators/out/` |

Each folder has `out/<name>.mp4`, `out/cover.jpg` and a `CREDITS.md` listing every source.

The last four follow four reference reels the user supplied: fast documentary-reel pacing
(voice from 0:00, a new layout every 1–2 s, word-synced type, punchy whooshes and impacts).
Their voiceovers use ElevenLabs **Eleven v4** (`eleven_v4`); the earlier five use
`eleven_multilingual_v2`. Music and sound effects are from Mixkit.

## What every video shares

- **Real assets only.** Footage from Mixkit (free licence) and public-domain films on
  Archive.org (Prelinger Archives); objects are real photographs cut out of footage frames
  with `rembg`. Labels, cards, stickers and UI are drawn as part of each design.
- **Diverse layouts, one continuous flow.** Every voice line gets its own composition, and
  the layouts hand over to each other with eased camera glides, shared-element moves, page
  lifts, zooms into a cell or card, and mask wipes. Fast moves are rendered with real
  motion blur.
- **Sound.** One music bed per design that dips under the voice, plus close, quiet foley on
  every on-screen event, cued to the same spoken words as the picture. Mixed to −14 LUFS.
- **Safe zones.** Captions sit at y≈1530 with the spoken word highlighted; content stays
  between y≈160 and y≈1440; the bottom 300 px stays clear for the Reels/Shorts UI.

## Build

```bash
./fetch_assets.sh                              # assets for "What is vibe editing?"
python3 -I lib/fetch.py <video>                # footage for any other video (footage.json)
python3 lib/cutout.py <video>                  # its cut-out objects (objects.json)
python3 lib/tts.py <video>                     # voiceover, only if vo/ is missing (uses ElevenLabs credits)
lib/make.sh <video> stills                     # contact sheet -> <video>/build/contact_sheet.jpg
lib/make.sh <video>                            # full render -> <video>/out/<video>.mp4
```

Some videos have an extra prep script for one tricky asset (`how-vibe-editing-works/laptop_screen.py`,
`vibe-editing-changes-the-world/prepare.sh`). "What is vibe editing?" predates `lib/` and
builds with its own `./make.sh`.

| `lib/` file | What it does |
| --- | --- |
| `core.js` | stage helpers: easing, springs, image/footage loading, captions, grain, `K.run` |
| `fonts.css` | every font (all SIL OFL, in `assets/fonts`) |
| `render.js` | renders `stage.html` with headless Chromium, 4 workers, motion blur on fast moves |
| `tl.py` | places voiceover lines on the clock and names cues after spoken words |
| `mixer.py` | voice + ducked music + foley helpers, loudness normalisation |
| `tts.py` | ElevenLabs voiceover with word timings |
| `fetch.py`, `cutout.py` | real footage/photo fetching and object cut-outs |
| `make.sh` | timeline → sound → frames → MP4 + cover |

Each video folder holds `script.json`, `vo/`, `timeline.py`, `stage.html`, `stage.js`,
`sound.py`, `footage.json`, `objects.json` and `CREDITS.md`.

Needs Node with `playwright`, Python 3 with `numpy`, `scipy`, `Pillow`, `rembg`, plus `ffmpeg`
and ImageMagick. `ELEVENLABS_API_KEY` is read from the environment.

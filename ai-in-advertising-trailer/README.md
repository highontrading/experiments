# AI in Advertising: channel trailer

A 62-second trailer for the **AI in Advertising** course. It's built in the style of the "Alpha Premiere League" reference; see `REFERENCE_BREAKDOWN.md` for the frame-by-frame analysis.

| File | What it is |
|---|---|
| `out/ai_in_advertising_trailer_preview.mp4` | Preview cut: 1920×1080, 25 fps, 61.9 s, ~6 Mbps, AAC 192k (committed) |
| `out/ai_in_advertising_trailer.mp4` | Master: same picture at 16 Mbps, AAC 320k, −14 LUFS (not committed: >100 MB; rebuild with `./make.sh`) |
| `trailer/timeline.py` | **The single source of truth**: every shot, card, VO slot, music section and SFX hit, on a 125 BPM / 25 fps grid (1 beat = 12 frames) |
| `trailer/render.py` | Frame renderer: letterbox, grade, VHS streaks, VO-synced pixel typing, glitch swaps, collage, code rain, strobe decoder, logo reveal, title |
| `trailer/sound.py` | Mix: music sections + VO with ducking + SFX → two-pass loudnorm to −14 LUFS / −1 dBTP |
| `generated/` | The ElevenLabs VO (with character timings), music stems and SFX actually used |
| `tools/` | Asset tools: ElevenLabs VO/music/SFX, Mixkit search, site capture (Playwright), QA analyser |
| `SOURCES.md` | Every clip, capture and logo, with licences |

## Script (VO: ElevenLabs "David – Movie Trailer Narrator")
1. *They said advertising was ruled by instinct. By gut… budget… and luck.* (`INSTINCT → GUT → BUDGET → LUCK`)
2. *Then came the machines. Algorithms learned the audience.*
3. *Models started creating.*
4. *From Mad Men to Midjourney. From briefs… to prompts.*
5. *Now, a new creative department emerges. Built not by agencies… but by AI.* → logo row
6. **Presenting / AI IN ADVERTISING**

## Build
Requires Python 3 (`numpy`, `opencv-python-headless`, `Pillow`, `librosa`), Node with Playwright, and `ffmpeg` with rubberband.

```bash
./make.sh stills 60 300 830   # preview frames -> build/stills/
./make.sh                     # mix + picture + MP4 -> out/
```

`build/` (footage, screen captures, renders) is not committed. Re-download the footage with the ids in `SOURCES.md`, and re-capture the sites with `tools/capture.js` and `tools/capture_seq.js`. A full render takes about 5 minutes on 4 cores.

## Changing things
- **Copy and timing:** the text strings are in the `card_*` functions in `render.py`. Their reveal times come from the VO alignments, so the type follows the voice automatically.
- **Footage:** edit `SHOTS` in `timeline.py`. Cuts land on the 0.48 s grid.
- **VO:** edit `LINES` in `tools/vo.py`, regenerate, and adjust `VO_START` in `timeline.py` if a line runs long.
- **Logos:** edit `LOGOS` in `timeline.py`. PNGs come from `tools/prep_logos.js`.

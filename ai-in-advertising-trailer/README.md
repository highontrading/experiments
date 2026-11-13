# AI in Advertising: channel trailer

A 56-second trailer for the **AI in Advertising** course (v2: faster cut to one continuous rising score). It's built in the style of the "Alpha Premiere League" reference; see `REFERENCE_BREAKDOWN.md` for the frame-by-frame analysis.

| File | What it is |
|---|---|
| `out/ai_in_advertising_trailer_v2_preview.mp4` | **v2** preview: 1920×1080, 25 fps, 56.0 s, ~6 Mbps (committed) |
| `out/ai_in_advertising_trailer_v2.mp4` | **v2** master: 16 Mbps, AAC 320k, −14 LUFS (not committed: >100 MB; rebuild with `./make.sh`) |
| `out/ai_in_advertising_trailer_preview.mp4` | v1 (62 s, stitched music), kept for comparison; v1 code is in `trailer/*_v1.py` |
| `trailer/timeline.py` | **The single source of truth**: every shot, card, VO slot, music layer and SFX hit, placed on the score's 136 BPM beat grid (`T(n)` = time of beat n) |
| `trailer/render.py` | Frame renderer: letterbox, grade, VHS streaks, VO-synced pixel typing, glitch swaps, collage, code rain, strobe decoder, logo reveal, title |
| `trailer/sound.py` | Mix: music sections + VO with ducking + SFX → two-pass loudnorm to −14 LUFS / −1 dBTP |
| `generated/` | The ElevenLabs VO (with character timings), music stems and SFX actually used |
| `tools/` | Asset tools: ElevenLabs VO/music/SFX, Mixkit search, site capture (Playwright), QA analyser |
| `SOURCES.md` | Every clip, capture and logo, with licences |

## v2 edit, cut to the music
One continuous ElevenLabs score (`generated/music/score_v2.mp3`, 136 BPM, in E) that starts slow and climbs:
quiet tension → boom at 7.1 s → hit at 13.7 s → build → **drop 1 at 21.2 s** → **drop 2 at 30.9 s** → one-beat stop → **final drop at 45.1 s** → final hit at 53.0 s.
- "…and **LUCK**" punches in on the 7.1 s boom.
- The AI-tool montage accelerates 2 → 1 → ½ beat into drop 1, then cuts on every beat.
- "Midjourney" glitches out on drop 2.
- "**AI**" lands the logo row on the final drop.
- Text cards and shots pulse on every beat.
- The music never stops, and a low drone (pitched to E) fills the quiet intro and the build.
- The VO is 1.12× faster with no long pauses.
- An alternate score candidate is kept at `generated/music/score_v2_alt.mp3`.

## Script (VO: ElevenLabs "David – Movie Trailer Narrator")
1. *They said advertising was ruled by instinct. By gut, budget, and luck.* (`INSTINCT → GUT → BUDGET → LUCK`)
2. *Then came the machines. Algorithms learned the audience.*
3. *Models started creating.*
4. *From Mad Men to Midjourney. From briefs to prompts.*
5. *Now, a new creative department emerges. Built not by agencies, but by AI.* → logo row
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

# Vibe Editing: Explainer Series

Short vertical explainers (1080x1920, 30 fps) about **vibe editing**: editing video by
describing it in words and letting AI write the edit as code. Each episode is built the way
it describes: a script, a voiceover, and code that renders every frame.

| Episode | Folder | Output |
| --- | --- | --- |
| 01 · What is vibe editing? (English) | `ep01-what-is-vibe-editing/` | `out/ep01_what_is_vibe_editing.mp4`, `out/cover.jpg` |

## Design system: the green cutting mat

Rebuilt from the reference post ("Creative block watchlist"):

- **Mat:** green self-healing cutting mat (`#4c8a3f`) with a pale yellow-green grid every
  96 px, soft mottling, knife scratches and live film grain.
- **Label blocks:** lowercase **Poppins ExtraBold** on slabs of brown `#6b4628` (white text),
  yellow `#ffe600` (brown text) or white (brown text), tilted a few degrees, laid down like
  tape (the slab wipes in left to right, then settles on a soft spring).
- **Small type:** white Poppins SemiBold lines with a soft shadow; yellow sticker tags
  (`EP 01`); brown tags for asides.
- **Ornaments:** yellow four-point sparkles that twinkle, the yellow `_ □ ×` window tiles,
  the YouTube logo, a white toggle that switches on, a chat bubble, white dashed frames and
  arrows, a yellow cursor, and torn-paper stars cut from a real 1918 film magazine.
- **Cards:** footage plays inside white YouTube-style cards (thumbnail, title, meta,
  duration). Code sits in a dark editor card with the yellow window tiles.
- **Desk objects:** real objects (phones, a pencil, a notebook, an alarm-clock sticker)
  cut out of Mixkit desk footage. The phones' green screens show the film's own footage.
- **Camera:** one camera glides from board to board across the mat. Each glide takes 1 s
  with a slight pull-back and tilt; each board gets a slow push-in. Glides are rendered
  with real motion blur (4–14 sub-frames per frame).
- **Captions:** the spoken phrase at the bottom, with the current word on a yellow
  highlight. Board content stays above the captions, and the bottom 300 px stays clear
  for the Reels/Shorts UI.

## Sound

Lo-fi bed (Lily J, *Lo-Fi 02*) that dips under the voice, plus close, quiet foley on every
move: paper slides when a block lays down, an air pass on each camera glide, soft pops for
tags and sparkles, real keyboard typing while text types, mouse clicks, a camera shutter when
the render finishes, and a switch tap on "follow". Every sound is placed on the same word
cue as the picture, and the mix is normalised to −14 LUFS (−1.5 dB true peak).

## Build

```bash
./fetch_assets.sh                    # once: download footage, objects, paper; cut them out
cd ep01-what-is-vibe-editing
python3 tts.py                       # only to re-record the voice (uses ElevenLabs credits)
./make.sh stills                     # quick contact sheet -> build/contact_sheet.jpg
./make.sh                            # full render -> out/ep01_what_is_vibe_editing.mp4
```

| File | What it does |
| --- | --- |
| `script.json` | the voiceover script, voice and model |
| `tts.py` | records the voice with ElevenLabs and saves word timings (`vo/`) |
| `timeline.py` | places each line on the clock and names every cue after its word |
| `stage.html`, `stage.js` | the whole film as `renderAt(t)` on a canvas |
| `sound.py` | voice + music + foley, all on the same cues -> `build/mix.wav` |
| `render.js` | renders frames with headless Chromium, 4 workers, motion blur on glides |
| `../cutout.py` | cuts the desk objects out of footage frames and measures the phone screens |

Needs Node with `playwright`, Python 3 with `numpy`, `scipy`, `Pillow`, `rembg`, plus `ffmpeg`
and ImageMagick. `ELEVENLABS_API_KEY` is read from the environment.

Sources and licences: see `CREDITS.md`.

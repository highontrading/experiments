# No Timeline Grind. Just Vibe.

A 12-second character film for **Vibe Editing by IdeaBro Studio**, built the way the
"No After Effects" prompt pack builds its Clawd film: an HTML interface, the comp drawn
on a canvas, and one `timeline.py` that the picture and the sound both read.

Bro, the IdeaBro lightbulb, starts as a flat `bro.png` layer in the comp. He peels off
the screen and pops into 3D, then builds a full edit by jumping on the tools: Cut to
beat, Captions, Motion GFX, a Teal & Orange look he kicks into the comp, four SFX stamps,
a ride on the playhead, and VIBE IT. After that the editor falls away and only the
finished reel is left.

| File | What it is |
| --- | --- |
| `out/vibe_editing.mp4` | the film: 1920x1080, 30 fps, 12.0 s, AAC 320k |
| `out/PROMPT_PACK_Vibe_Editing.pdf` | the 6-page prompt pack, in the same layout as the original |
| `prompts/PROMPT.txt` | the copy-ready picture prompt (BRAND block for Vibe Editing) |
| `prompts/SOUND_PROMPT.txt` | the copy-ready sound prompt |
| `timeline.py` | the single source of truth: layout in UI pixels and every event |
| `stage.html`, `stage.js` | the whole film as `renderAt(t)`: CSS 3D slabs, canvas comp, Bro |
| `render.js` | renders frames or stills with headless Chromium (Playwright) |
| `sound.py` | synthesizes the music and every SFX from the timeline (numpy + scipy) |
| `build_pack.py`, `pack_pdf.js` | write the prompt pack from the timeline and real frames |
| `make.sh` | the whole build |

## Build

Requires Node with `playwright` (Chromium), Python 3 with `numpy` and `scipy`, and `ffmpeg`.

```bash
./make.sh stills          # 18 stills -> build/contact_sheet.png; look before you render
./make.sh                 # frames, sound, MP4 -> out/vibe_editing.mp4
python3 build_pack.py && node pack_pdf.js   # -> out/PROMPT_PACK_Vibe_Editing.pdf
```

On 4 CPU cores a full render takes about 0.7 s per frame with no GPU. To re-render only
a range, run `node render.js --from 105 --to 145`, then `./make.sh encode`.

## Make it yours

Only the BRAND block in `prompts/PROMPT.txt` changes; page 4 of the pack shows two example
swaps. In this 2.5D build:

- Brand colours are the CSS variables at the top of `stage.html`. Bro's yellow is `#ffc93c`
  in `drawBro`.
- Copy lives in `timeline.py`: the caption words, the prompt text, chip and look names.
- Every button position, hop, camera move and hit time is also in `timeline.py`. Move a
  number there and the picture and the sound move together.

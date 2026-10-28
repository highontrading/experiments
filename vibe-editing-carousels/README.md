# Vibe Editing: Animated Carousels

Animated Instagram carousels for **Vibe Editing**, built on the design system of the
reference reel (grainy cloud sky, hands holding live cards, an iOS Notes card in the
middle). Each slide is a 5–6 s looping MP4 at 1080x1350 (4:5), drawn on a canvas and
rendered frame by frame with headless Chromium, the same way `../vibe-editing-film` is built.

| Output | What it is |
| --- | --- |
| `out/<carousel>/slide_01.mp4 …` | one MP4 per carousel slide, in posting order |
| `out/<carousel>/still_NN.jpg` | a still of each slide (frame 91) as a fallback image |
| `out/<carousel>/preview_all_slides.mp4` | every slide back to back, to check the swipe-through |

## Carousels

Every carousel follows the same flow (hook → content → CTA: comment "VIBE" for the free
prompt pack, save, follow) and keeps one design system across its slides, while each slide
gets its own layout.

| # | Topic | Slides | Design system | File |
| --- | --- | --- | --- | --- |
| 01 | The 5-Step Vibe Editing System | 10 | cloud sky, hands holding cards, iOS Notes card | `carousels/01-five-step-system.js` |
| 02 | The Vibe Prompt Formula | 6 | iOS Calendar, text selection, keyboard, film grain | `carousels/02-prompt-formula.js` |
| 04 | Captions That Keep People Watching | 6 | pink retro: grid paper, stripes, tags, heart stickers | `carousels/04-captions.js` |
| 05 | One-Word Color Grades | 6 | white shelves, stamp frames, serif on pink box | `carousels/05-color-grades.js` |
| 08 | Vibe Editing vs Timeline Editing | 6 | retro CRT in a meadow, Windows 95 Notepad | `carousels/08-vibe-vs-timeline.js` |
| 12 | 10 Prompts to Save | 6 | grey desk, macOS folders, Cut/Copy/Paste menu | `carousels/12-ten-prompts.js` |

Still waiting on design systems: 03 Cut to the Beat, 06 4 SFX Every Reel Needs, 07 Hook
Edits for the First 1.5 Seconds, 09 1 Long Video → 10 Reels, 10 7 Vibe Editing Mistakes,
11 The Director Pass, 13 Raw Footage to Posted in 15 Minutes, 14 Brand Your Edits.

Carousel 01 runs on `lib/stage.js`. Carousels 02 onward set `kit: true` and run on
`lib/kit.js`: each slide is `{ bg, els, fg }`, and an element is `{ x, y, rot, in, at,
draw }`. The kit plays the entrance (`pop`, `up`, `down`, `left`, `right`, `drop`, `fade`,
`grow`), a gentle float, and the exit in the last 0.32 s so every slide loops cleanly.
Each carousel file holds its own design system (backdrop, type, components).

## Carousel 01 design system

Taken from the reference reel and kept on every slide, so all carousels match:

- **Backdrop:** a soft blue cumulus sky (`make_sky.py` paints `assets/img/sky.jpg`) that
  drifts and breathes slowly, under live film grain (6 noise tiles, overlay blend).
- **Hero card:** an iOS Notes card, white, 30 px corners, tilted −3°, soft blue shadow.
  Header: gold `‹ Notes`, slide counter `3/10` in grey, gold `(⋯) Done`. Gold is `#b8862b`.
- **Type:** headlines in **Archivo Expanded ExtraBold**, all caps, near black `#0b0b0c`;
  body in **Inter Medium**; kicker (`STEP 2 OF 5`) in Inter Bold gold with 3 px tracking;
  handwritten notes in **Caveat**. Fonts are in `assets/fonts` (all OFL).
- **Hands:** shaded 3D-style hands with mocha nails hold every card from the frame edges.
  `thumb` (thumb on the card), `fingers` (fingers on the card) and `point` (a finger that
  taps). They are drawn in code (`lib/hands.js`), so no stock photos are needed.
- **Cards:** 3–5 per slide, tilted 3–12°, each with something playing in it: the editor
  timeline, Vibe Copilot typing a prompt, a phone reel with word-by-word captions, a
  waveform with cuts snapping to the beat, a grade wipe, SFX stamps, comments, DMs…
  App cards use the Vibe Editing dark violet UI; light cards use grid paper and lilac.
- **Motion, the same on every slide:** cards fly in from their hand's side on a spring
  (staggered 0.07 s), float gently while their content plays, and fly out in the last
  0.34 s so the loop restarts cleanly. The Notes card never moves, so frame 0 always
  reads as a clean cover.

## Make a new carousel

Copy the carousel file closest to what you want, change the copy and the layout, then:

```bash
./make.sh 15-my-topic stills    # one still per slide -> build/15-my-topic/contact_sheet.png
./make.sh 15-my-topic           # all frames -> out/15-my-topic/*.mp4
./build_all.sh 02-prompt-formula 04-captions   # several in a row
```

Each slide has `notes` (kicker, title, body, and optional `pills` or `checklist`) and
`items`: `{ kind, x, y, w, h, rot, hands, p }`, where `kind` is a card from `lib/cards.js`,
`x, y` is the card centre in the 1080x1350 frame, and `p` holds that card's copy and cue
times in seconds. A `tap` item is a pointing hand that presses at `taps: [seconds]`.

Requires Node with `playwright` (Chromium), Python 3 with `numpy` and `Pillow`, `ffmpeg`
and ImageMagick (`montage`, only for the contact sheet). On 4 cores a 10-slide carousel
renders in about 12 minutes.

## Posting

Upload the slide MP4s in order as one carousel post (Instagram allows up to 20 items
per carousel). The slides are silent, so add a track from Instagram's music library
when you post.

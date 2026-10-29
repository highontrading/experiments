# Vibe Editing: Animated Carousels

Animated Instagram carousels for **Vibe Editing**, one design system per carousel, all
built from **real footage**: Mixkit stock clips (creators, podcasts, editing desks, real
skies, meadows, fabric) and real objects cut out of those clips (a hand holding a phone,
a retro TV, a sunflower, a microphone, a camera lens, a clapperboard). Each slide is a
5–6 s looping MP4 at 1080x1350 (4:5), composited on a canvas and rendered frame by frame
with headless Chromium. Footage credits and licence: `footage/CREDITS.md`.

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
| 01 | The 5-Step Vibe Editing System | 10 | real cloud timelapse, real hands holding phones, iOS Notes card | `carousels/01-five-step-system.js` |
| 02 | The Vibe Prompt Formula | 6 | iOS Calendar, text selection, keyboard, creator clips in photo windows | `carousels/02-prompt-formula.js` |
| 03 | Cut to the Beat | 6 | near-black stage, 3D ring of real clips, orange italic footnote | `carousels/03-cut-to-the-beat.js` |
| 04 | Captions That Keep People Watching | 6 | pink retro: grid paper, stripes, tags, a real hand holding the phone | `carousels/04-captions.js` |
| 05 | One-Word Color Grades | 6 | white shelves, stamp frames with real clips in five grades | `carousels/05-color-grades.js` |
| 06 | 4 SFX Every Reel Needs | 6 | real sky, real hand presenting a phone, real mic and clapperboard | `carousels/06-four-sfx.js` |
| 07 | Hook Edits for the First 1.5 Seconds | 6 | real brown fabric, cream caps, letter beads, real sunflower cutouts | `carousels/07-hook-edits.js` |
| 08 | Vibe Editing vs Timeline Editing | 6 | real daisy meadow, a real retro TV, Windows 95 Notepad | `carousels/08-vibe-vs-timeline.js` |
| 09 | 1 Long Video → 10 Reels | 6 | light grey, chunky rounded type, a fan of real podcast clips | `carousels/09-one-video-ten-reels.js` |
| 10 | 7 Vibe Editing Mistakes | 6 | real hills with a halftone screen, torn note, speech-blob stickers | `carousels/10-seven-mistakes.js` |
| 11 | The Director Pass | 6 | cutting mat, paper sheet, highlighter, real die-cut camera and clapper | `carousels/11-director-pass.js` |
| 12 | 10 Prompts to Save | 6 | grey desk, macOS folders, Cut/Copy/Paste menu, real prints | `carousels/12-ten-prompts.js` |
| 13 | Raw Footage to Posted in 15 Minutes | 6 | real blue fabric header, manila folder tabs, real hand-held phones | `carousels/13-raw-to-posted.js` |
| 14 | Brand Your Edits | 6 | dusty-blue editorial, a real creator cutout, thin sans + script | `carousels/14-brand-your-edits.js` |

Every carousel sets `kit: true` and runs on `lib/kit.js`: each slide is `{ bg, els, fg }`, and an element is `{ x, y, rot, in, at,
draw }`. The kit plays the entrance (`pop`, `up`, `down`, `left`, `right`, `drop`, `fade`,
`grow`), a gentle float, and the exit in the last 0.32 s so every slide loops cleanly.
Each carousel file holds its own design system (backdrop, type, components).

## Carousel 01 design system

- **Backdrop:** a real cloud timelapse under light film grain.
- **Hands:** a real hand holding a phone (keyed out of a green-screen clip) comes in from
  each edge; every screen plays real creator footage or a Vibe Editing screen.
- **Hero card:** an iOS Notes card, white, 30 px corners, tilted −3°. Gold `‹ Notes`,
  slide counter `3/10`, gold `(⋯) Done`. Headlines in Archivo Expanded ExtraBold caps,
  body in Inter. The card holds still, so frame 0 always reads as a clean cover.

## Footage

```bash
python3 footage/fetch_footage.py     # download the clips in footage/sources.json -> build/footage/<name>/f0001.jpg ...
python3 footage/make_cutouts.py      # cut objects out of their frames -> build/cut/<name>.png
```

Both write into `build/` (not committed). `make.sh` runs them when `build/footage` or
`build/cut` is missing. `make_cutouts.py` needs `rembg` (`pip install "rembg[cpu]"`).
In a slide, `FOOTAGE.drawFootage(c, "podcast_two", t, w, h, look, focusX)` covers a box
with a clip at slide time, and `K.drawCut(c, "hand_green", height, paintScreen)` draws a
cutout, filling a device screen first when it has one.

## Make a new carousel

Copy the carousel file closest to what you want, change the copy and the layout, then:

```bash
./make.sh 15-my-topic stills    # one still per slide -> build/15-my-topic/contact_sheet.png
./make.sh 15-my-topic           # all frames -> out/15-my-topic/*.mp4
./build_all.sh 02-prompt-formula 04-captions   # several in a row
```

Each carousel file holds its own design system (backdrop, type and components) and its
slides as `{ bg, els }`; copy the one closest to what you want.

Requires Node with `playwright` (Chromium), Python 3 with `numpy` and `Pillow`, `ffmpeg`
and ImageMagick (`montage`, only for the contact sheet). On 4 cores a 10-slide carousel
renders in about 12 minutes.

## Posting

Upload the slide MP4s in order as one carousel post (Instagram allows up to 20 items
per carousel). The slides are silent, so add a track from Instagram's music library
when you post.

# Optimized reel style engine

Edits a talking-head video in the **"Optimized"** style studied in `STYLE_GUIDE.md`: stacked
kinetic captions, white explainer cards with black/red kinetic type and line-art icons, split-wipe
and motion-blur whip transitions, a clean warm grade and light sound design.

```
DESIGN_SYSTEM.md    the universal design system: use this for any new video
STYLE_GUIDE.md      the frame-by-frame analysis of the reference it came from
engine/style.js     design tokens + the components (caption stack, white card, wipe, whip-out)
engine/stage.html   canvas page the renderer drives
engine/render.js    plan -> transparent PNG per frame (headless Chromium)
engine/sfx.py       plan -> sound-design track (auto rules + manual hits)
engine/compose.py   A-roll punch-in + grade + overlay + voice/SFX/music mix -> MP4
plans/demo.json     the reference's script rebuilt in this engine (timing test)
assets/             Inter Display (OFL), line-art icons (SVG), sound effects
```

## Make a reel

```bash
node engine/render.js plans/<name>.json
python3 engine/compose.py <name> path/to/cut-a-roll.mp4      # -> out/<name>.mp4
```

Check a few moments first: `node engine/render.js plans/<name>.json --times 1.2,4.8`.
`python3 engine/compose.py demo placeholder` renders over a plain backdrop (no footage needed).

## Plan format (times in seconds on the edited timeline)

```jsonc
{
  "dur": 13.44, "fps": 30,
  "captions": [                       // A-roll captions, one phrase each, hard cut on/off
    { "t0": 0.0, "t1": 0.93, "lines": [
      { "size": "S", "align": "left",  "words": [{ "text": "most",   "t": 0.00 }] },
      { "size": "L",                   "words": [{ "text": "people", "t": 0.37 }] },
      { "size": "S", "align": "right", "words": [{ "text": "think",  "t": 0.63 }] } ],
      "items": [ { "type": "img", "src": "assets/icons/hex-cluster.svg", "t": 0.6, "x": 0.5, "y": 0.74, "w": 0.16 } ] }
  ],
  "cards": [                          // full-screen white cards
    { "t0": 1.70, "t1": 3.77, "enter": "cut",        // or "wipe"
      "groups": [
        { "t1": 2.94, "exit": "slide", "items": [  // whip out at t1, then the next group builds
          { "type": "img",  "src": "assets/icons/molecule.svg", "t": 1.70, "x": 0.58, "y": 0.47, "w": 0.30 },
          { "type": "text", "text": "is", "t": 1.83, "x": 0.15, "y": 0.40, "size": "S" },
          { "type": "text", "text": "a",  "t": 2.13, "follow": true },          // same line, after "is"
          { "type": "text", "text": "chemical", "t": 2.77, "x": 0.38, "y": 0.59, "size": "M", "color": "red" } ] },
        { "items": [ { "type": "text", "text": "on your brain.", "t": 3.20, "x": 0.5, "y": 0.52, "size": "P", "align": "center" } ] }
      ] }
  ],
  "sfx": [ { "name": "pop", "t": 4.2, "vol": 0.3 } ],  // optional extra hits
  "music": "assets/music/bed.mp3", "music_vol": 0.07  // optional
}
```

Card `x`/`y` are fractions of the frame (`y` is the text baseline; for images, the centre).
Sizes: captions `S` `M` `L`; cards `S` `P` `M` `L`. Colours: `ink`, `red`, `white`, `blue` or any hex.

## Edits made with it

| Reel | How to rebuild |
|---|---|
| `out/va-ad.mp4`: "hire a virtual assistant" ad | `python3 tools/build_va.py <raw.mp4> plans/va-ad.words.json && node engine/render.js plans/va-ad.json && python3 engine/compose.py va-ad build/va-ad/aroll.mp4` |

`tools/build_va.py` shows the full workflow for a new raw video: cut the pauses (60 ms of air kept),
alternate a wide and a tight framing at every cut (the reference's A/B camera rhythm), then lay the
script out as captions and cards from the word timestamps. `tools/cutout.py` cuts a person out of a
stock photo for the white cards. Stock photos come from Pexels (see `assets/stock/CREDITS.md`).

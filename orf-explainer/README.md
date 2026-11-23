# The Lever Is Price — ORF explainer (vertical, 96 s)

A 9:16 explainer for the Observer Research Foundation Special Report No. 321,
*The Lever Is Price: China's New Leverage Play in Thailand* (Jaibal Naduvath, September 2026).

`out/the_lever_is_price_explainer.mp4`: 1080x1920, 30 fps, 96 s, H.264 + AAC, mixed to -14 LUFS.

## Look

The look follows the reference collage poster. Cobalt paper with grain, yellow 4-point sparkles and
spiky bursts, white dashed guide rules, circles and squares, B&W stock footage in polaroids and
torn-paper strips, blue-duotone strips, B&W cutouts with a thick yellow sticker outline
(the EV, the container ship, the rotating chess king), handwritten notes (Gochi Hand),
condensed stamps (Anton), serif kickers (Instrument Serif), and a red poster block for the
title. Captions are white Inter Bold, revealed word by word in sync with the narration.

## Story (13 scenes, timed from the VO's word timestamps)

| # | Scene | Visual |
|---|---|---|
| 1 | The old playbook | Forbidden City, loans, railways, megaprojects polaroids, crossed out: "debt distress", "backlash"; chess move |
| 2 | The new lever is price | red poster + cutout EV, "PRICE" slams on the beat drop |
| 3 | The new model | port strip, ship cutout, SUBSIDIES / OVERCAPACITY stamps, price tag, market-share pie, EMBEDDED |
| 4 | Why Thailand? | animated SE-Asia map, Malacca lane (≈80% of China's crude), Kra isthmus, factory + overseas Chinese polaroids |
| 5 | Follow the money | 31% donut (China + HK share of 2025 FDI applications), US$13.4 bn |
| 6 | July 2026 | Shanghai strip, Beijing → Shanghai → Chengdu route, 15+ agreements fan |
| 7 | 01 Cars | Detroit of Asia, ~10% of GDP, Japanese brands 85%+ bar |
| 8 | Today | 70%+ of the EV market, 7 of 10 car icons, −28.7% price-edge tag |
| 9 | 02 AI | data-centre strip, Western +30% vs cheap open-weight, 350 MW → 1 GW |
| 10 | Bangkok pushed back | WAICO not signed, land bridge shelved, cheap parcels taxed |
| 11 | 03 Standards | Type 2 / CCS2 plug (fix: a dongle) vs data architecture (no dongle for this) |
| 12 | The test case | rotating chess-king cutout, "Sooner, and with less warning." |
| 13 | End card | title, author, date, ORF, orfonline.org |

## Sources

- **Stock footage**: Mixkit (free licence), 28 clips, listed in `timeline.py` (`F`) and `fetch_stock.sh`.
- **Voice, music, SFX**: ElevenLabs. Voice "Daniel" (eleven_multilingual_v2, with timestamps), a music
  composition plan cut on the bar lines (drop on "price", breakdown under the pushback, finale on the
  close), and 20 generated SFX in `assets/sfx`.
- **Map**: Natural Earth 1:50m countries.

## Build

```bash
./fetch_stock.sh          # stock clips -> assets/stock (not committed)
./make.sh stills          # contact sheet -> build/contact_sheet.jpg
./make.sh                 # footage frames, cutouts, render, mix, encode
./make.sh encode          # re-mix + re-encode only
```

Requires ffmpeg, Node + Playwright (Chromium), and Python 3 with numpy, Pillow and rembg (for the cutouts;
the chess-king sequence is cut by `tools_cutout.py` into `build/king`). On 4 cores the render takes about 40 ms a frame.

| File | Role |
|---|---|
| `script.txt` | narration script |
| `tools_vo.py`, `tools_words.py`, `tools_tighten.py` | TTS with timestamps, word list, pause tightening |
| `timeline.py` | the single source of truth: word times, scenes, transitions, footage, SFX cues, music edit |
| `extract.py` | graded footage frames (B&W / blue duotone) |
| `stage.html`, `stage.js` | the whole film as `renderAt(t)` on a canvas |
| `render.js` | headless Chromium frame renderer (parallel workers) |
| `mix.py` | VO + ducked, beat-cut music + SFX, loudness normalised |

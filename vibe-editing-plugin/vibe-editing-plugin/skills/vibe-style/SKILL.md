---
name: vibe-style
description: Deeply analyse and scrape an editing style (captions, hook, pacing, punch-ins, colour look, motion text, sound density) from reference videos or photos and save it as a reusable style in the workspace style library. Use when the user attaches or points to a reel, video or images and says "edit like this", "copy this style", "take inspiration from this", "match this look/captions", "save this as my style", or wants to list, view, change or mix saved styles.
---

# Vibe Style: the style scraper

Turns references (videos and/or photos) into `styles/<name>/style.json`, a style the
`vibe-edit` skill applies to any footage. The engine measures what numbers can measure; **you**
read the frames and decide what only eyes can decide.

The engine lives in the vibe-edit skill: `ENGINE = <this skill's base directory>/../vibe-edit/engine/ve.py`
(run with `python3`, or `python` on Windows). Below, `ve` = `python3 "<ENGINE>"`. Run it from the
**workspace** folder (the one that contains the projects), or pass `--workspace <folder>`.

## 1 · Extract
```
ve style extract "<project>/refs/reel.mp4" "<project>/refs/photo1.jpg" --name <style-name>
```
Name it after the look, short and lowercase (`bold-yellow-pop`, `luxury-serif`, `podcast-clean`).
Any mix of videos, images or a folder works. This writes to `styles/<name>/`:
- `auto.json`: measured: cuts/min, average shot length, motion energy, colour (Lab stats,
  palette, contrast, saturation, warmth, grain, vignette), audio (loudness, continuous music bed,
  hits/min ≈ SFX density).
- `style.json`: a draft with the measured values filled in and the rest marked in `_todo` lists.
- contact sheets: `v1_shots.jpg` (one frame per shot), `v1_hook.jpg` (first 3 s every 0.5 s),
  `v1_burst1..3.jpg` (8 frames 1/12 s apart: shows caption animation and word highlight),
  `v1_detail1..2.jpg` (large single frames for reading type), `images.jpg` (photo refs).

## 2 · Look and decide (this is the important part)
Read the sheets with the Read tool: `detail1`, `detail2`, `burst1`–`burst3`, `hook`, `shots`.
Quality matters here: study them properly. If one detail is unclear (the exact highlight colour,
whether captions pop or fade), grab more frames: `ve frames <project> --at 3.2,3.3,3.4 --video
refs/<file>` and look again. Then fill every `_todo` field:

**captions**
- `font`: pick the closest bundled font:

  | Looks like | Use |
  |---|---|
  | Heavy geometric sans (Montserrat/Gilroy/"Hormozi" style) | `Poppins Black` (or `Poppins ExtraBold`) |
  | Tall condensed, impact/news/podcast clips | `Anton` · `Bebas Neue` (cinematic, thinner) |
  | Wide/extended heavy (modern brand) | `Archivo Expanded` · `Archivo Black` (less wide) |
  | Chunky playful, YouTuber/MrBeast (Komika-like) | `Luckiest Guy` · `Bangers` (comic) · `Lilita One` (rounded) |
  | Handwritten / marker | `Permanent Marker` · `Caveat` |
  | Elegant serif, luxury, editorial | `DM Serif Display` |
  | Clean neutral UI sans, minimal | `Inter ExtraBold` · `Inter Bold` |
- `size`: compare the caption cap-height to the frame height. Em size on a 1920-tall frame ≈
  cap height in px × 1.4. Typical: small 60–70, normal 80–95, big 100–120, one-word 120–150.
- `case`: `upper` if all caps, else `as-is`.
- `words_per_line`: count words visible on a typical caption line in the bursts.
- `position_y`: caption centre as a fraction of frame height (0.5 = middle; most reels 0.62–0.75).
- `color`, `active_color` (the highlighted word), `emphasis_color`, `outline_color`: read the
  hex from the detail frames. No outline visible → `outline: 0`, often with `shadow` 2–4 or a box.
- `highlight`: from the bursts. The spoken word changes colour → `color`; has a coloured
  block/marker behind it → `box`; gets bigger → `scale`; only one word on screen at a time →
  `word`; whole line static → `none`.
- `animation`: lines grow in → `pop`; fade in → `fade`; rise from below → `slide`; just appear → `none`.
- `box: true` + `box_color` if each line sits on a solid plate.

**hook**: from `hook.jpg`: is there big text in the first seconds? Font, colour, box colour,
position. If the reference has no hook text, keep the defaults (the user can switch it off).

**motion**: `kinetic_type` (big words that slam in?), `lower_thirds`, `title_cards`, `labels`,
`transition` (`jump` hard cuts, `whip`, `none`), `font`, `accent` (a brand colour from the palette).

**pacing**: `punch_in` (do shots alternate between wide and tighter framing of the same person?),
`zoom_scale` (how much tighter: 1.08 subtle … 1.25 strong). `pace` was measured; adjust if the
reference clearly feels different.

**look**: measured. Check the palette and frames: if the reference is a graphic/animation (not
camera footage), set `lut_from_reference: false`. Copying a cartoon's colours onto a face
looks wrong. Lower `lut_strength` to 0.3–0.5 when the reference grade is extreme.

**sound**: `music` and `sfx_density` were guessed from audio. Adjust if you know better.

Finally write a one-sentence `description` of the style, delete every `_todo` list, and save.

## 3 · Show it and get approval
```
ve style card <style-name>                     # -> styles/<name>/style_card.png
ve open "styles/<name>/style_card.png"
```
The card is an image: the style's captions and hook rendered on a reference frame, the palette,
and every value. Show it, summarise what you found in 4–6 bullets (captions, pacing and
punch-ins, motion text, colour, sound), and ask *"Does this match? Anything to change?"*
**STOP and wait.** Tweak `style.json` and re-run `style card` until they approve.

## 4 · Apply it
- No edit yet → set `"style": "<name>"` in `<project>/brief.json`; the vibe-edit steps continue
  (captions sheet shows the reference's captions as option **R**, looks sheet shows **reference**).
- The project already has an `edit.json` (the reference came later in the chat) →
  `ve restyle "<project>" --style <name>`. That keeps the cuts, caption text, hook, texts and sound.

## Library
- `ve style list`: all saved styles in this workspace.
- Use a style: `ve plan "<project>" --style <name>` (see vibe-edit).
- **Mix styles**: copy one style folder to a new name and paste sections from another style's
  `style.json` (e.g. `captions` from A, `look` + `reference_stats` from B). Then card it.
- A student's own signature style is just a style they keep refining: name it after them.

## Rules
- Copy the style, never the content: no music, footage, logos, watermarks or exact layouts from
  the reference end up in the edit.
- If a reference is low resolution or has no captions, say what you could and couldn't read
  instead of guessing confidently.

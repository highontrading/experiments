# "Optimized" reel style: frame-by-frame analysis and design system

Source: a 13.44 s, 720x1280, 30 fps reference reel ("Raw Footage vs Edited Video"). All
402 frames were pulled and read, the key moments were cropped at full resolution, colours were
sampled from the pixels and the audio was read from a spectrogram.

The reference is itself a **comparison**: a red star-patterned background with two tilted 3D
panels labelled `Raw` (small, left) and `Optimized` (large, right), both playing in sync. **The
style we copy is the edit inside the `Optimized` panel.** The red comparison wrapper is just how
that creator presents before/after; we don't use it (it's available as an optional "before/after"
template later if wanted).

What "optimized" adds over "raw" (the cuts are the same in both panels):
1. a tighter punch-in and a cleaner, warmer, higher-contrast grade,
2. word-by-word **stacked kinetic captions**,
3. full-screen **white "explainer cards"** with black/red kinetic type and line-art icons,
4. three transitions (hard cut, centre split-wipe, motion-blur whip-out),
5. light sound design.

---

## 1. Shot-by-shot timeline of the reference

Frame numbers are 1-based at 30 fps (frame 30 = 1.0 s).

| Frames | Time (s) | Shot | On screen |
|---|---|---|---|
| 1–28 | 0.00–0.93 | A-cam (3/4 angle, plants) | caption stack `most` / **`people`** / `think` |
| 28 | 0.93 | | 1 empty frame between phrases (caption hard-cuts off) |
| 29–50 | 0.97–1.67 | A-cam | single big word **`Dopamine`** |
| 51–89 | 1.70–2.97 | **white card 1** (hard cut in) | blue molecule drifts in from the right → `is` `a` / `feel` `good` (small, black, top-left) → **`chemical`** (big, red, bottom-right) |
| 90–93 | 3.00–3.10 | card 1 | every element **whips out to the left with motion blur** (4 frames) |
| 94–96 | 3.13–3.20 | card 1 | blank white |
| 97–112 | 3.23–3.73 | card 1 | `on your brain.` (one centred line, medium black) blurs in |
| 113–163 | 3.77–5.43 | **B-cam** (front, branded wall) hard cut | `But` / **`dopamine`**, then `is` / **`actually`** / `called` |
| 164–167 | 5.47–5.57 | **split-wipe**: a white band opens from the centre outward over 4 frames | |
| 168–204 | 5.60–6.80 | **white card 2** | `The` (small) → **`chemical`** (red) → dopamine skeletal formula (black lines, red O atoms) → `of` (small) → **`motivation`** (black) |
| 205–278 | 6.83–9.27 | A-cam, hard cut | one-word captions, medium size: `And so` `I'm` `gonna` `talk` `about` `how to` `use` → `use this` / **`chemical`** + small blue hexagon icon under it |
| 279–304 | 9.30–10.13 | **white card 3** (hard cut) | 3D brain cut-out fades in → `in` / `your` → **`brain`** (red) |
| 305–310 | 10.17–10.33 | card 3 | whip-out left, then blank |
| 311–340 | 10.37–11.33 | card 3 | `to` `take` (small) → **`action`** (huge, red) |
| 341–402 | 11.37–13.44 | A-cam, hard cut | `that` `you` `need` `to to` → **`create`** / `the life` → `that` / **`you want.`** |

**Rhythm:** talking head ~1.5–2.5 s, then card ~1.3–2 s, then back. **41% of the runtime is
white cards** (165 of 402 frames). A new graphic beat arrives every ~0.8 s; there's never more
than ~1 s without something entering.

---

## 2. Design tokens

| Token | Value | Notes |
|---|---|---|
| Canvas | 1080x1920, 30 fps | everything below is in 1080-wide px |
| Typeface | **Inter Display Bold (700)** | the reference uses an SF-Pro-style neo-grotesk; Inter Display is the closest free (OFL) match. Tracking **−3.5%**, very tight leading |
| Caption colour | `#FFFFFF`, no outline | soft drop shadow `rgba(0,0,0,.55)`, blur 26, y +4 |
| Card background | `#FFFFFF`, full frame | no border, no grain |
| Card ink | `#0B0B0B` | |
| Emphasis red | `#F2000A` (sampled `#F1010A`…`#FF0000`) | only on white cards, only the one key noun |
| Icon blue | stroke `#2D6FD9`, fill `#D9E8FF` | line-art chemistry style, rounded joins |
| Caption sizes | S **78**, M **96**, L **182** | S = connector words, M = single plain words, L = the key word of the phrase |
| Card sizes | S **82**, P **108** (one-line phrase), M **124**, L **184** | |
| Caption position | centred at x 50%, block centred at **y ≈ 65.5%** | on the chest, under the chin, never over the face |
| Card text anchor | left column at **x ≈ 13–15%**, block around **y 39–60%** | icon centre-right, red word offset right/below |

### Caption layout rules (A-roll)
- One phrase at a time, **2–4 words**. Phrases hard-cut off (no exit animation); the next one
  starts on the very next frame (sometimes after one empty frame).
- The phrase's key word is **L**; the connector words around it are **S** and stack:
  - small line **above**, left-aligned to the big word (`most` over `people`, `is` over `actually`)
    or centred (`But` over `dopamine`, `use this` over `chemical`, `that` over `you want.`);
  - small line **below**, right-aligned (`think`, `called`) or left-aligned (`the life`).
  - Stack spacing is extremely tight: a small word above sits right on the big word's cap line;
    one below tucks into the descender zone.
- Running filler words are shown one or two at a time in **M**, centred, replacing each other
  word by word (`And so` → `I'm` → `gonna` → `talk`…).
- No highlight colour on A-roll captions: emphasis is by **size**, not colour.
- An icon can sit under a key word (`chemical` + blue hexagons).

### White card layout rules
- Built **word by word in sync with speech**, never all at once.
- Composition: small black words stacked top-left → an illustrative icon in the middle-right →
  the key word **big and red** lower-right. Or a one-line statement centred (`on your brain.`).
  Or small words + a huge red key word (`to take` / **`action`**).
- Icons are simple line art or one clean 3D cut-out (the brain), never stock-photo rectangles.
- When the sentence moves on mid-card, the content whips out left and the next text builds on
  the same white card (no new transition).

---

## 3. Motion specs (measured)

| Motion | Spec |
|---|---|
| **Word in** (captions and card text) | ~5 frames (0.16 s): opacity 0→1, blur 10→0 px, scale 110%→100%, rises 24 px, ease-out. On white the word reads light grey/pink before it settles; on footage it reads as a soft blurred ghost |
| **Icon in** | ~7 frames (0.23 s): blur 18→0, scale 106%→100%, drifts in 46 px from the right, fade |
| **Phrase out (A-roll)** | hard cut, no animation |
| **Card content out** | **whip left**, 4 frames (0.13 s), travel ~1300 px, near-linear (fast from frame 1), horizontal motion-blur streaks; all elements leave together (≤5 ms stagger, top first). 2–3 blank white frames follow |
| **A-roll → card** | hard cut (cards 1 and 3) **or** centre split-wipe (card 2): a white vertical band opens from x ≈ 53% to full width in 4–5 frames, roughly linear; card content is already fading in inside the band |
| **Card → A-roll** | always a hard cut |
| **Camera** | no zooms or shakes inside shots; energy comes from type and cuts. Two camera angles alternate (A-cam 3/4, B-cam front) |
| **Punch-in** | the optimized frame is ~**1.18x** tighter than the raw |

---

## 4. Colour grade
Compared with the raw panel: slightly **more contrast**, **a touch brighter**, skin a bit
**warmer**, greens less murky, crisper detail. Implemented as
`eq=contrast=1.08:brightness=0.015:saturation=1.06, colorbalance (warm mids/highs), unsharp 0.45`.
No film grain, no vignette, no stylised look. It should look "clean and expensive", not "graded".

## 5. Sound
From the spectrogram: a **low sub impact** under the first ~1 s, a **very quiet sustained music
bed** (a steady tone around 600–700 Hz from ~0.9 s on), and short broadband **transients at the
card transitions** (≈1.7, 3.0, 5.4, 9.3, 10.2 s): soft taps/whooshes. Voice stays dominant
(~−15 dBFS RMS); effects are felt rather than heard.
Implemented as: `impact` at 0 s, `tap` on a hard cut to a card, `swish` on the split-wipe,
`whoosh-fast` on every whip-out, all at 30–35% volume, plus an optional music bed at ~7%.

*(Confidence: the visual specs are measured from pixels; the exact SFX/music choices are inferred
from the spectrogram and should be tuned by ear.)*

---

## 6. How to apply this to a new raw video

1. **Cut**: remove silences and retakes, keep it tight (the reference has no breaths between phrases).
2. **Transcribe with word timestamps.**
3. **Script the beats**: for every sentence decide *A-roll caption* or *white card*. Use a card
   when a sentence names a **concept, number, thing or claim** that can be shown (aim for ~40% of
   runtime on cards, one card every 3–5 s, never two cards back to back without A-roll between).
4. Per A-roll phrase pick the **key word** (L) and stack the connectors (S); filler runs in M.
5. Per card pick: the small words, **one** red key word, and **one** icon (line-art SVG, or a 3D
   cut-out image generated for the topic).
6. Transitions: hard cut by default; one split-wipe per ~10–15 s for variety; whip-out whenever a
   card's sentence changes.
7. Write it as a plan (`plans/<name>.json`), render, compose (see README).

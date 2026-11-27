# Optimized: universal edit design system

A content-agnostic design system for editing talking-head videos (Reels / Shorts / TikTok, 9:16).
It was extracted from a reference "Optimized" reel and proven on real edits; see `STYLE_GUIDE.md`
for that analysis. **This file holds no script, only rules.** Hand it any raw video and the
captions, cards, graphics and layouts are generated *for that script*, while the look, the motion,
the transitions and the sound stay the same.

> **How to use it.** Give Claude this file plus a raw video and say:
> *"Edit this raw video using DESIGN_SYSTEM.md."* Optional: brand colour, CTA wording, music mood,
> light/dark comparison reel. The engine in `engine/` implements every rule here (see README).

---

## 0. The idea in one paragraph

Calm, expensive, editorial. The speaker stays on screen about 60% of the time, with **white
kinetic captions** that make the key word huge. About 40% of the time the screen cuts to a **clean
white card** that builds the sentence word by word in black, with **one red key word** and one
simple visual. Everything enters the same way (a soft blur-in) and leaves the same way (a fast
motion-blur whip). No gimmicks: no zoom punches, shakes, emoji, outlines or rainbow highlights.
Emphasis comes from **size, whitespace and one colour**. The sound is soft and close-mic ASMR,
over a quiet music bed.

---

## 1. Design tokens

### Colour
| Token | Light (default) | Dark variant | Use |
|---|---|---|---|
| `ink` | `#0B0B0B` | `#FFFFFF` | all card text |
| `paper` / card | `#FFFFFF` | `#0E0E10` | card background (full frame) |
| `accent` | `#F2000A` | `#F2000A` | **exactly one** key word or element per card; the CTA button |
| `caption` | `#FFFFFF` | `#FFFFFF` | A-roll captions (never coloured) |
| `icon-stroke` | `#2D6FD9` | `#5B93F0` | line icons |
| `icon-fill` | `#D9E8FF` | `#1B2A44` | line-icon fills |
| `muted` | `#6B6B6B` | `#8A8A8E` | kickers, sub-lines |

Brand swap: replace `accent` (and optionally `icon-stroke`) with the creator's colour. Keep everything else.

### Type
- **One family:** Inter Display (OFL; the closest match to SF Pro Display). Weight **700**, with 800 for
  headlines in packaging (comparison reels, covers).
- **Tracking −3.5%**, leading **0.84–0.9**. Tight is the look.
- Sentence case, the speaker's own words, punctuation kept ("assistant?", "use.").

| Scale (px @1080w) | A-roll captions | Cards |
|---|---|---|
| S: connector words | 78 | 82 |
| M: plain words / filler | 96 | 124 |
| P: one-line statement | n/a | 108 |
| L: the key word | 182 | 184 |
| XL: hero number / price | n/a | 360–440 |

### Frame and safe zones (1080x1920)
- Caption block centred at **x 50%, y ≈ 65%**: on the chest, under the chin, never over the face.
- Card content lives between **y 20% and 90%**, left column at **x 10–15%**.
- Keep the top 8% and bottom 12% free of key content (platform UI).

### Shadows
- Captions: `rgba(0,0,0,.55)`, blur 26, y +4. **No outline, ever.**
- Photo tiles / panels: soft and large (`0 40px 100px rgba(20,20,30,.25)`), radius 40–48.

---

## 2. Components (the vocabulary)

Every graphic in an edit is one of these, or a new layout built from the same parts (§5).

### A-roll components (over the speaker)
1. **Caption stack**: 2–4 words, one phrase at a time. The key word is **L**; connector words are
   **S**, stacked tight above (left-aligned or centred to the big word) or below (right- or
   left-aligned). Example shape: `most` / **people** / `think`.
2. **Filler run**: words with no key word show 1–2 at a time in **M**, centred, replacing each
   other word by word.
3. **Caption icon**: a small line icon (14–30% of the width) under the key word, for concrete
   concepts (bilingual → speech bubbles, hours → clock).
4. **CTA pill + cursor**: a red pill button with white text at the caption position; a white
   cursor glides in from the lower right and "presses" it (scale dip) on the word that names the action.

### White-card components (full-screen cards)
5. **Stack card**: small words stacked top-left, then the **red key word in L**, then a supporting visual.
6. **Statement card**: one centred line in **P** (`on your brain.`). Use for punchlines.
7. **Hero number card**: a giant **XL red** number or price, centred, with the unit in M under it (`$8` / `an hour,`).
8. **Icon list card**: 2–4 rows of `[line icon] + word in M`, with the last or most important word red.
9. **Cut-out card**: a stock person or object with its background removed, large, lower-right,
   with the text stack top-left. People cut out like the reference's 3D brain.
10. **Photo-tile card**: a rounded stock photo (radius 48, soft shadow) under a text stack, for scenes that can't be cut out.
11. **Device card**: a vector laptop or phone whose screen fills with line-icon tiles one by one ("tools", "apps", "dashboards").
12. **Icon row**: 3–5 line icons in a row that pop in on a 70 ms stagger, as examples of a plural noun ("industries", "platforms").

### Packaging (optional deliverables)
13. **Comparison reel**: headline / two 3D-tilted rounded panels (`Raw` small behind, `Edited` big
    in front, outlined tags with connector lines, the edited tag red) / CTA. Light or dark theme.

---

## 3. Motion grammar (identical in every edit)

| Motion | Spec |
|---|---|
| **Word in** | 5 frames (0.16 s): opacity 0→1, blur 10→0 px, scale 110→100%, rise 24 px, ease-out. Each word enters **on the frame it is spoken**. |
| **Visual in** | 7 frames (0.23 s): blur 18→0, scale 106→100%, drift 46 px in from the right. Photos and cut-outs may land with the card's first frame. |
| **Stagger** | Icons in a set: 60–70 ms apart. Never animate a whole card in one go. |
| **Caption out** | Hard cut. The next phrase starts on the next frame (or after 1 empty frame). |
| **Card content out** | **Whip left**: 4 frames, ~1300 px, near-linear, horizontal motion-blur streak, everything at once (5 ms stagger). Then 2–3 blank frames, then the next text builds on the same card. |
| **A-roll → card** | Hard cut by default. **Split-wipe** (a white band opens from x 53% to full width in 4–5 frames) at most once every 10–15 s. |
| **Card → A-roll** | Always a hard cut. |
| **Button press** | Scale dip to 93% and back over 0.16 s. |
| **Idle** | Nothing moves while it's on screen, except a slow ±7 px float on packaging panels. No wiggle, bounce or pulse. |
| **Camera** | No zoom punches or shakes. Variety comes from **alternating framing at each cut**: wide (1.10x) and tight (1.32x, framed a little higher). With two real cameras, alternate them instead. |

---

## 4. Turning any script into an edit (the algorithm)

1. **Clean cut.** Remove every pause ≥ 0.18 s (keep 60 ms of air either side) and every retake or
   stumble. **Snap every cut to the frame grid** so picture and sound cut together (lip sync).
2. **Transcribe with word timestamps.** All animation times come from these.
3. **Segment into phrases** of 2–4 words at natural breath and syntax breaks.
4. **Choose a key word per phrase**: the noun, number or verb that carries the meaning. It goes L
   (captions) or red L (cards). Phrases with no real key word become a filler run.
5. **Choose the beats: A-roll or card.** A sentence becomes a card when it contains something
   **showable**: a number or price, a list, a product/tool/place, a claim worth isolating, or a
   concept with a clear icon. Targets:
   - cards take **35–45%** of the runtime; never two cards back to back without A-roll between;
   - the **hook** (first 2–3 s) and the **CTA** stay on the speaker's face;
   - one card every 3–5 s; a card group lasts 1.0–2.5 s, then whips out or cuts back.
6. **Pick the card component** by content:
   | Content | Component |
   |---|---|
   | a number, price, % or stat | Hero number (7) |
   | 2–4 parallel items (features, steps, "no X, no Y") | Icon list (8), or captions for very short items |
   | a person or role ("assistant", "coach", "customer") | Cut-out (9) |
   | a scene or activity ("coaching", "meeting", "travel") | Photo tile (10) |
   | software, tools, apps, online | Device (11) |
   | a plural category ("industries", "platforms") | Stack card + icon row (5 + 12) |
   | a punchline or definition | Statement (6) or Stack (5) |
7. **Sentence moves on mid-card** → whip the content out and build the next text on the same card.
8. **CTA**: on the speaker, with the pill and cursor if a button or link is named; otherwise a caption stack.
9. **Sound pass** (§6), then **grade** (§7), then **QA** (§9).

---

## 5. Making new graphics that still belong to the system

New scripts need graphics the reference never had. Invent freely, within these rules:

- **One idea per card, one red element per card.** Everything else is ink.
- **Hierarchy by size only:** S connectors → L key word. Never more than 3 type sizes on one card.
- **Composition:** text stack anchored top-left (x 10–15%), visual centre-right or below, red word
  offset lower-right of the stack. Statements and hero numbers are centred. Leave ≥ 35% of the card empty.
- **Visual language:**
  - *Line icons*: 8 px rounded stroke `icon-stroke`, flat `icon-fill`, no gradients, no text
    except tiny labels inside (`$`, `Hi!`).
  - *Cut-outs*: real stock photos with clean alpha, no drop shadow, sitting directly on the white.
  - *Photo tiles*: rounded 48, soft shadow, crop to a calm, uncluttered moment.
  - *Devices and UI*: neutral grey vector hardware; the screen content is line icons, never fake brand logos.
- **Stock sources:** Pexels / Unsplash (free commercial licence; record credits in `assets/stock/CREDITS.md`).
  Prefer people on plain backgrounds (easy cut-outs), soft natural light, neutral wardrobe.
- **Words on screen are the speaker's words.** Don't add slogans that aren't said (packaging excepted).
- **Motion for new parts** reuses §3 (word in, visual in, whip out). A new motion must be explainable
  as one of those with different numbers.
- **Not in this system:** emoji, stickers, coloured caption highlights, text outlines, glow (except
  the dark theme's soft panel glow), glitch, shake, zoom punches, 3D text, gradients on text.

---

## 6. Sound system (premium / ASMR)

- **Music bed**: one calm instrumental (soft keys and pads, light brushed percussion, 80–95 BPM,
  no vocals, drops or builds). About 14 dB under the voice, fades in 0.8 s and out 1.2 s, and
  **ducks under speech** (sidechain, ratio 3).
- **Effects**: soft, close-mic, low-passed (no harsh highs), one per visual event, 16–30% volume:
  | Event | Sound |
  |---|---|
  | first frame | warm low **swell** |
  | hard cut to a card | soft **tap** |
  | split-wipe | paper **swipe** |
  | content whips out | silky **whoosh** |
  | icon or photo arrives (once per group) | tiny **pop** |
  | button press | gentle **click** |
  | hero number reveal | glassy **shimmer** |
- Plain captions are silent. Never stack two effects within ~150 ms.
- Master to **−14 LUFS**, true peak ≤ −1.5 dBTP. **Mix audio to a file first, then mux.** Check that its
  length equals the video's and that a speech-to-text pass reads the full script in order.

## 7. Grade

Clean and expensive, not "graded": +8% contrast, +1.5% brightness, +6% saturation, slightly warm
mids and highs, light sharpening. No grain, vignette or LUT look. The dark theme applies only to
packaging and cards, never to the footage.

## 8. Variants

- **Dark cards** (`paper` `#0E0E10`, white ink, the same red): for dark sets or night-time content.
  Keep the A-roll captions white.
- **Brand colour**: swap `accent`, keep one accent per card.
- **Language**: same rules; for Indian scripts use a matching family (Noto Sans / Mukta) at the same weights.

## 9. QA checklist (before delivering)

- [ ] Every word appears on the frame it's spoken; no caption over the face.
- [ ] Exactly one red element per card; ≥ 35% empty space; no element touching the frame edges.
- [ ] Cards 35–45% of runtime, never back to back; the hook and CTA are on the face.
- [ ] Whip-outs land before the next sentence starts; wipe used at most every 10–15 s.
- [ ] Jump cuts hidden by framing alternation or cards.
- [ ] Audio: full script by speech-to-text, in sync (< 1 frame), −14 LUFS, music audible but quiet, no harsh effects.
- [ ] Stock credits recorded; no third-party logos or footage.
- [ ] Review stills of every card and caption composited over the real footage.

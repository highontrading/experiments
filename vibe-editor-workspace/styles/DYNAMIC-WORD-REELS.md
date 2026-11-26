# Dynamic Word Reels: editing style breakdown

Source: a 10.1 s, 720×1280, 30 fps ad reel (300 frames). I read every frame one by one, transcribed the voiceover with word timestamps, and ran frame-difference, colour and spectrogram analysis.
The reel has two layers:

1. **The edit**: a luxury real-estate talking-head reel (the "dynamic-word-reels" look). This is the style worth copying.
2. **The ad wrapper**: a static ad layout that shows that reel playing inside a desktop-app mockup. It's described at the end in case you want to make ads in this format.

---

## 1. The idea in one line

> **One spoken phrase = one graphic scene.** Each scene pulls out the phrase's key fact and shows it as a designed object (a word, a number, a map, a chart, a chip). The object sits in depth around the presenter, comes in just before the word is spoken and is fully cleared before the next phrase.

There are **no running captions**. Only keywords appear on screen, which keeps it calm and premium while still being dense: 6 information beats in 10 s.

---

## 2. Frame-accurate timeline (voiceover ↔ graphics)

VO (whisper, word-level): *Welcome[0.00] to[0.84] Villa[1.14] Surin[1.32–1.82] · perched[2.22] high[2.52] above[2.82] Marbella[3.08–3.66] · We have six[4.04–4.44] beautiful[4.44] bedrooms[4.94–5.54] · a private[5.96] spa[6.30–6.68] · a 20[7.08–7.48] -meter[7.48] infinity[7.92] pool[8.42–8.90] · and much[9.52] more[9.74–9.98]*

| Time (s) / frame | What happens | Sync to VO |
|---|---|---|
| 0.000 / f0 | Shot A: presenter walking on a rooftop pool terrace, wide shot | VO starts on frame 0, no lead-in |
| 0.033–0.300 / f1–f9 | **Cut-out blink**: presenter becomes a solid white silhouette for 2 frames (f1–2), 50% decay (f3), normal (f4–6), white again (f7–8), decay (f9). Two blinks 0.2 s apart. | Rising sweep sound (4→8 kHz chirp) |
| 0.43–0.60 / f13–18 | **"welcome to · villa" + "surin"** blur in (6 frames), with horizontal smear while sharpening. The keyword sits *behind* her head. The search pill blurs in at the same time at about 60% height. | ~0.9 s before "Surin" is spoken |
| 0.63–1.60 / f19–48 | **Search bar types** "villa surin, marbella": 21 characters in 29 frames (~22 chars/s), uneven like a human, blinking caret | Typing clicks (transients 0.2–1.3 s) |
| 0.53–1.2 | Glossy listing photo cards **orbit around her waist** in pseudo-3D, passing behind her body | — |
| 1.33–1.43 / f40–43 | **Location chip "📍 villa surin"** blurs in under the search bar, offset right | Exactly on "Surin" (1.32) |
| 2.03–2.23 / f61–67 | Scene exit, staggered: search pill first (f61), chip, then the keyword (f64). Each blurs out with a horizontal smear. | Breath pause 1.82–2.22 |
| 2.33–2.57 / f70–77 | **Map card** fades in as an empty frosted-glass rectangle, *then* the photo (golden-hour aerial of the coast) resolves inside it. Small label "Marbella" top-left. **Pin drops** with a pulse ring (f76–79). | On "perched" (2.22) |
| 2.50–3.30 / f75–99 | **Area chart** grows left→right across the full width behind her: white line, white vertex dots, translucent blue fill | Chime-like tones ~3.4 s |
| 2.50–2.63 / f75–79 | **"high above" + "marbella"** blur in, mid-frame. Her body covers the "r" (text behind the person). | 0.0 s before "high" |
| 3.50–3.90 / f105–117 | Scene exit: map (f105), chart (f106), title last (f111–117), with smear | Right as "Marbella" ends (3.66) |
| 4.00–4.10 / f120–123 | Two **glossy photo cards** blur in either side of her at chest height, tilted toward camera (orbit arc) | — |
| 4.13–4.63 / f124–139 | **Counter 2→6** rises from below with blur. Frames per value: 2→2, 3→3, 4→4, 5→6, then lands on 6. Cubic ease-out. | Lands ~0.2 s *after* "six" ends (4.44) |
| 4.30 / f129 | **"beautiful"** (upper-left of the digit) and **"bedrooms"** (lower-right) blur in, wrapped around the number | ~0.15 s before "beautiful" |
| 4.73–5.07 / f142–152 | Tiny **bed icons** pop in one by one above the cards (3 left + 3 right = 6) | Sparkle shimmer 5.1–5.6 s |
| 5.60–5.80 / f168–174 | Scene exit; the digit fades last | After "bedrooms" (5.54) |
| 5.70–5.83 / f171–174 | Shot A starts a 4-frame blur/zoom ramp | — |
| **5.83 / f175** | **The only hard cut** (frame diff 38 vs ~1 normal). Shot B: closer, by the spa/lounge. | In the breath pause 5.54–5.90 |
| 5.83–6.07 / f175–182 | Heavy directional blur, double-exposure ghost of shot B, settling sharp by f182 (~0.37 s total transition) | Whoosh |
| 6.00–6.07 / f180–182 | **"a private" + "spa"** are already resolving *during* the transition. "spa" is behind her head. | 0.3 s before "spa" |
| 6.10–6.80 | A photo card orbits across her torso. A thin white **ground ring** (ellipse) sits at her feet. | — |
| 6.43–6.53 / f193–196 | **Chip "🔒 private spa"** blurs in lower-left | On "spa" (6.30–6.68) |
| 6.77–7.13 / f203–214 | Exit: chip, card, then the title with smear | Pause before "a 20" |
| 7.17–7.83 / f215–235 | **Counter 6→20** (7, 8, 10, 11 … 19 held 4 frames, 20 lands). Cubic ease-out. | Lands on "-meter" |
| 7.43–7.63 / f223–229 | **Measurement line** draws out from the centre to both ends: white on the left, blue on the right, end ticks. Label **"meter infinity pool"** fades in under it. | On "-meter" (7.48) |
| 8.50–8.60 / f254–259 | **Chip "≡ infinity pool"** blurs in lower-right | On "pool" (8.42) |
| 9.00–9.17 / f270–275 | Exit: the number dissolves to a grey ghost, then disappears. Line and chip fade. | "and" |
| 9.23–9.43 / f277–283 | **"and much" + "more"** blur in behind her head | 0.3 s before "much" |
| 9.43–10.0 | Two photo cards slide in at the right edge; hold to the end | "more" ends 9.98, video ends 10.1 |

---

## 3. The rules that make it work

**Sync**
- Graphics **anticipate**: they finish entering 0.1–0.3 s *before* their keyword is heard (up to ~0.9 s for the opening title).
- **Chips land exactly on the spoken word** (the confirmation beat).
- **Counters land just after** the number is spoken (the eye catches up with the ear).
- **Exits fire on the phrase's last syllable**, and the frame is completely clear before the next phrase starts.
- **Cuts hide in breath pauses** and are always masked by a blur transition.

**Motion language**
- Every entrance: **blur-in over 5–6 frames (0.17–0.2 s)**. The element starts blurred and smeared horizontally, then sharpens. No bounce, no overshoot, no pops.
- Every exit: **blur-out over ~6 frames** with a horizontal smear. Elements in a scene leave staggered by 1–3 frames.
- Counters use a **cubic ease-out**: fast start, the last values held longer.
- Lines and charts **draw on** (left→right or centre→out) in ~0.4–0.8 s.
- Glass objects show their frame first, then their content (map card).

**Depth (the signature)**
- Keywords, charts and orbiting photo cards sit **behind the presenter** using the AI cut-out. The presenter always overlaps part of the word, which makes it look composited into the scene rather than pasted on top.
- UI pieces (search bar, chips, measurement line) sit **in front**.

**Pacing**
- 2 shots in 10 s and 1 cut. The energy comes from graphics, not cuts.
- About one new graphic every 0.6–0.8 s; one full scene every ~1.6 s.
- VO is tightly trimmed: the longest gap is 0.4 s (`max_pause` ≈ 0.35–0.4).

---

## 4. Typography and design specs

| Element | Font feel | Colour | Size (of frame height) | Position |
|---|---|---|---|---|
| Lead line ("welcome to", "high above") | Thin/light neo-grotesk (SF/Inter Light), lowercase, no outline | `#F2F5F7` at ~90% | ~3% | Just above the keyword. Sometimes split around it ("welcome to · villa") |
| Keyword ("surin", "marbella", "spa", "more") | High-contrast italic serif / script, condensed, lowercase | Blue `#4A86D8` core (sampled #235884–#3E6EB0 after blending), ~85% opacity, no outline | ~10–12%, ~50% of frame width | Upper third (head height), or mid-frame for the chart scene. **Behind the person.** |
| Numbers ("6", "20") | Heavy grotesk (SF/Inter Black) | Vertical gradient: ice blue `#E4F2FD` top → steel blue `#3A68A6` bottom, slight translucency, no outline | ~15% | Centre, waist height |
| Number side labels ("beautiful", "bedrooms") | Same as the lead line | white | ~3% | Upper-left and lower-right of the digit |
| Chips | Medium sans, lowercase + small line icon (pin / lock / list) | Charcoal pill `#1E2329` ~85%, thin light border, white text | ~2.5% tall | Lower-left or lower-right, about 60–75% height |
| Search bar | White frosted pill, outer glow, magnifier icon, black text, blue gradient "Search" capsule `#3B7AD3→#AFD8FD` | — | ~85% of width | ~60% height |
| Map card | Rounded 12 px, location photo, white label top-left, blue pin + pulse ring | — | ~80% wide × 25% tall | Top |
| Area chart | White 2 px line, white dots, blue translucent fill fading down | `#4A86D8` | Full width | Middle, behind the person |
| Measurement line | Thin line, white→blue, end ticks, light-grotesk label below | — | ~85% wide | Just under the number |
| Photo cards | Rounded, glossy specular sheen, perspective tilt, orbiting | — | ~20–25% wide | Around waist or chest height |

**Colour grade**: cool teal-grey, desaturated, lifted blacks, soft highlights, low contrast. Overcast-daylight feel. The bottom ~30% of the frame darkens into deep teal (`#172326`). Skin stays neutral.

**Sound**: clean VO dominant (60–80% of energy in the 300–3k Hz band), a quiet music bed underneath, a rising sweep on the opening blink, typing ticks under the search bar, a chime around the pin/chart, and shimmer/sparkle hits when the counters land (~5.1 s, ~8.1 s). No bass drops or impacts.

---

## 5. How it maps to your Vibe Editor setup

Everything is saved in this workspace, and `brand/brand.json` now points to it.

| Reference element | Use | Notes |
|---|---|---|
| Lead + keyword behind you | `{"type":"dw-word","at":"<phrase>","lead":"welcome to","word":"surin"}` | Options: `pos` (keyword y, 0.22 default; 0.5 for mid), `lead_pos`, `dur`, `lead_color` (use `#2E353C` on light backgrounds) |
| Cut-out blink | `{"type":"dw-blink","at":0}` | **Approximation**: the engine can only trace a white contour, not fill the silhouette. Its `glow` option also crashes the engine, so the preset leaves it off. |
| Search + location chip | `{"type":"dw-search","at":…,"text":"villa surin, marbella","chip":"villa surin"}` | |
| Feature chip | `{"type":"dw-chip","at":"spa","text":"private spa","x":0.3,"y":0.72}` | Pop entrance (the engine's tag has no blur-in) |
| Glossy number count-up | `python3 styles/tools/dw_counter.py --from 6 --to 20 --at 7.17 --dur 1.9 --run 0.67 [--prefix $] [--suffix %]` → paste the printed JSON | The library `counter` forces a black outline, so this tool builds the outline-free gradient version |
| Number with side words | `dw-count` (library counter) **or** the tool above + two `text` events in `inter-light` | |
| Measurement line | `{"type":"dw-measure","at":"meter","label":"meter infinity pool","y":1250}` | `y` is in 1080×1920 pixels |
| Area chart behind you | `{"type":"dw-area-chart","at":"perched","y":1150,"dur":1.2}` | Generic rising shape |
| Map card | `{"type":"image","file":"map.jpg","position":"top","size":0.8}` | Bring your own location photo (in `broll/`) |
| Photo orbit | `{"type":"dw-orbit","at":…,"items":["pool","terrace","living","view"]}` | Library orbit cards are labels, not photos. For real photos, use `image` overlays with your listing shots. |
| Blur-whip cut | `{"type":"dw-blur-whip","at":<cut time>}` | Place it in a breath pause |
| Closing beat | `{"type":"dw-outro","at":"and much more"}` | |
| Grade | look `dw-cool-matte` | |
| Lead/label font | `inter-light` (Inter Light, OFL, in `fonts/`) | |
| Keyword font | `instrument-serif-italic` | Closest library match. For a more calligraphic swash, drop a licensed italic didone (Bodoni Moda Italic, Playfair Display Italic) into `fonts/`. |

**Recipe for a new reel in this style**

1. Script = short phrases, one fact each ("Welcome to X / perched high above Y / six bedrooms / a private spa / a 20-metre pool / and much more").
2. Edit settings: `"captions":{"enabled":false}`, `"look":"dw-cool-matte"`, `"cuts":{"max_pause":0.38}`, music at volume 0.08 with ducking.
3. For each phrase pick one hero object: keyword (`dw-word`), number (`dw_counter.py`), place (`dw-search` / map image), data (`dw-area-chart`), size (`dw-measure`), feature (`dw-chip`).
4. Start each hero ~0.25 s before its keyword, put chips on the word, and end everything on the phrase's last syllable.
5. Open with `dw-blink` and close with `dw-outro`. Mask any cut with `dw-blur-whip`.

Working example plans: `styles/dw-example-edit.json` (test) and `styles/dw-example-va-edit.json` (a real 27 s talking-head ad on a light studio wall, with hand-placed sound and the lead colour darkened). It was rendered on a test clip; the storyboard is in the session notes.

---

## 6. The ad wrapper (packaging), if you want ads in this format

The wrapper is completely static. Only the inner reel and a checklist move.

- **Background**: dark navy ribbed/fluted glass panels (vertical) with one diagonal light streak.
- **Top**: a frosted comment bubble (avatar, "follower · 2h", the objection "No realtor would ever post an AI edit.", Reply, heart). This is the hook.
- **Headline stack**: "Everyone says" (bold white sans) → "AI EDITS ARE TRASH" (ultra-condensed tall caps, chrome white→grey gradient) → "…then Claude edited this." (white script on a dark slanted ribbon with a lens-flare streak).
- **App mockup** (lower ~60%): a dark desktop chat window with a sidebar. The prompt card shows the raw clip thumbnail, `brief.md` and a skill file, plus the instruction text. Then "Done. Here is your reel." with the finished reel playing (label "FINAL · CLAUDE", orange progress bar), a `final.mp4 · 1080×1920 · 30 fps · 10 s` card and an orange Download button.
- **Checklist** (right of the reel): six items tick on, one every **0.6 s from 0.37 s**: Cut to whole phrases · Her cut-out blinks · Map + chart behind her · Bedrooms number fills · Pool measured · Sound. Orange check circles, white bold text.
- The structure is **objection → "everyone says" → proof playing inside the tool → feature checklist**.

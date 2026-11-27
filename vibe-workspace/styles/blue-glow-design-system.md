# "Blue Glow" Design System
Extracted from `references/ref_before_after.mp4` (24.7 s, 720×1280, 30 fps), analysed frame by frame at 30 fps.
Key stills: `references/keyframes/`. Audio spectrogram: `references/keyframes/audio_spectrogram.png`.

> The reference file is a **portfolio showcase**: a light-blue grid canvas, a small greyscale "BEFORE" card, a larger "AFTER" card, and an @handle with an avatar.
> That wrapper is **not** part of the editing style. The style below is what happens **inside the AFTER card**: a full 9:16 talking-head edit.
> (We can rebuild the showcase wrapper later as an optional before/after promo.)

---

## 1. Style in one paragraph
A premium, dark cobalt-blue "tech agency" look. There are **no running subtitles**. Each spoken phrase becomes a **2-tier kinetic typography lock-up** on the speaker's chest: a small white sans "kicker" line plus a big glowing hero word in a display serif or heavy rounded sans, filled with a cyan-to-white gradient. The text sits **behind the speaker's hands** (depth layering), and the letters **reveal in scrambled order** with a blur-and-glow fade, synced to the word being spoken. Every ~6 s the edit cuts to a **full-screen navy "graphic scene"** (grid background, blurred 3D shapes, neon UI) with a **vertical motion-blur push**. Data moments use **frosted-glass 3D cards**, and lists use **glowing app-style icons**. Sound design is minimal: **sub-bass booms** on scene changes and big reveals, **sparkle shimmers** on gold or emoji accents, and **soft ticks** on UI. There is no music bed.

---

## 2. Colour tokens
| Token | Hex | Use |
|---|---|---|
| `wall` | `#0B5280` → `#09426C` | Background wall of the talking head (saturated cobalt, brighter behind head, falls off at edges) |
| `wall-dark` | `#023665` | Wall edges, top band |
| `shadow` | `#04102A` / `#111017` | Crushed blacks (shirt, bottom of frame); shadows lean blue-black |
| `scene-top` | `#033E85` | Graphic-scene gradient top (light source top-centre) |
| `scene-mid` | `#05275D` | Graphic-scene gradient middle |
| `scene-bottom` | `#040C22` | Graphic-scene gradient bottom |
| `grid` | `#FFFFFF` @ 4–6 % | 1 px grid lines on graphic scenes (~44 px cells at 1080 w) |
| `cyan-1` | `#54BAE6` | Gradient start (left edge of hero word) |
| `cyan-2` | `#6CD6E8` | Gradient middle |
| `ice` | `#CCDBE4` | Gradient end (right edge of hero word, near white) |
| `glow` | `#7FDCFF` @ 45 % | Outer glow of all text and icons |
| `gold` | `#FFE14A` → `#FFF6B0` | "Premium" or quality words, crown, Experience icon |
| `green` | `#4BE38A` | Third icon colour (Skill) |
| `card` | `#EAF2FA` @ 85 % (frosted) | Glass data cards |
| `chart-blue` | `#3A8EF0` | Bars inside cards, light-trail arcs |
| `white` | `#FFFFFF` | Kicker text, UI text |

**Colour grade (talking head):** contrast up, saturation up, blue pushed into the mids and shadows, skin kept warm and natural, mild vignette. The shirt reads as pure black so the glowing text pops (a "black T-shirt as a screen" trick). Saved as the look **`blue-glow`**.
Tip for your shoots: dark plain top, a lamp or LED throwing blue on the wall behind you, and a soft warm key on your face. The grade then only has to enhance the blue, not invent it.

---

## 3. Layout and safe zones (9:16, measured on the AFTER card)
- **Text zone (chest):** centred horizontally, block centre at **58–62 % of frame height** (just under the collar). Width up to about 70 % of the frame. The face is never covered.
- **Graphic-scene text:** text centred at **33–42 % height**, or a UI element at **28–45 %**.
- **Background props (behind head):** upper third and the edges (logo ring behind the head, line chart over the shoulders, people icons in the corners).
- **Foreground props:** chest height, left or right of centre (the $2000 card, icon row at 57 %).
- Nothing important in the bottom 15 % (platform UI).

---

## 4. Typography
Three type roles, always mixed inside one lock-up:

| Role | Reference look | Library font (now) | Better free match to add later |
|---|---|---|---|
| **Kicker** (small line above) | Clean geometric sans, semibold, white, ~4.5 % of frame height | `poppins-semibold` | Manrope SemiBold / Satoshi Medium |
| **Hero serif** ("Content", "Business Owners", "Best", "Wondering", "Premium") | High-contrast display serif with sharp wedge serifs and a tight x-height. Very large, ~11–13 % of frame height | `dm-serif` | Gloock / Fraunces (Soft 0) / Playfair Display |
| **Hero sans** ("Media", "Do we Pay?", "depends") | Heavy rounded geometric sans, bold/extra-bold | `poppins-bold` | Plus Jakarta Sans ExtraBold / Nunito ExtraBold |
| **Hero sub** ("Agency", "Of the") | Kicker font, smaller, tucked under the right side of the hero word, overlapping its baseline | `poppins-semibold` | same as kicker |

Rules:
- **Sentence or title case, never ALL CAPS.**
- **Tight leading**: lines overlap slightly (line-height ≈ 0.8). Kicker sits almost touching the hero cap height.
- **Mixed families inside one word pair**: "**Media** (bold sans, cyan) + *Key* (serif, white)". One concept word gets the accent treatment and its partner stays neutral.
- **Fill:** hero words use a **horizontal gradient** `cyan-1 → cyan-2 → ice`, left to right. Kickers are flat white.
- **Glow:** every text element has a soft outer glow (radius ≈ 0.6× stroke height, cyan-white, 40–50 % opacity) and no outline or drop shadow.
- **Gold variant**: only for value words (premium, best, quality, top). Gradient `#FFE14A → #FFF6B0`, warm glow.
- **Size hierarchy**: kicker 1×, hero 2.5–3×, sub 1.1×.
- Stack depth is 1–3 lines, e.g. "That Helps / Business / **Owners** / Scale + icon". Each new line is a little bigger or a different family.

### Lock-up recipes seen
1. `We Are` / **Media** *Key*: kicker + 2-family hero
2. `The Best` / **Content** / `Agency`: kicker + serif hero + right-tucked sub
3. `That Helps` / *Business* / **Owners** / *Scale* 🧑‍💼: 4-line cascade; last line white serif + small inline glowing icon
4. *With* / **Premium** (gold) / *Content* (white)
5. **Best** 👑 / `Of the` / **Best**: symmetric sandwich with a 3D emoji on the top-right corner
6. `You might be` / **Wondering**
7. `How Much` / **Do we Pay?**: kicker + heavy rounded sans (question)
8. `Well it` / **depends**

---

## 5. Text animation system (frame-exact at 30 fps)
**IN: "scramble reveal" (default on the talking head)**
- Each letter fades in with a quick blur → sharp and a glow flash. **Letters appear in random order**, not left to right. Example frames: `i` → `We e i y` → `We Are edi Key` → full.
- Whole lock-up resolves in **6–8 frames (0.2–0.27 s)**.
- **Line by line, synced to speech**: the kicker reveals as its words are spoken, and the hero line starts when the hero word is spoken (word-level sync from the transcript).
- No position movement, no scale bounce. It is a calm, premium reveal.

**IN: "sequential blur-type"** (graphic scenes, and "Wondering" / "Do we Pay?")
- Letters reveal **left to right**, one per ~1 frame, each blur-fading in. Speed matches the spoken word.

**IN: "typewriter pop"** (graphic-scene plain text "Looking for the")
- Letters appear left to right; each new letter starts at ~60 % scale and pops to 100 % within 2 frames.

**OUT**
- **Random letter dissolve** (mirror of IN, 4–6 frames), or
- **Opacity fade** over 4–6 frames (used on later phrases).
- The text leaves **before** the next phrase arrives. There are ~3–10 frames of empty chest between phrases, which gives the edit its rhythm.

**Hold:** the lock-up stays until the phrase ends plus ~0.3 s.

**Depth:** text is composited **behind the hands and arms** (and behind the head for props). Hands passing in front cover letters. This is the single strongest "premium" cue. Use AI cut-out (`behind: true`).

---

## 6. Motion-graphic components
| # | Component | Look | Motion |
|---|---|---|---|
| A | **Brand ring behind head** | Large concentric-ring logo in glowing blue, behind the head (cut-out), radius ≈ 45 % of width | Fades/scales in with the brand-name lock-up (≈0.1 s) and fades out with it |
| B | **Glowing line-chart arrow** | Thick white zig-zag "growth" line with cyan glow, running from the left shoulder up past the right of the head, behind the person | Stroke draws on left→right in ~0.6 s with the word "Business"; exits by retracting/sliding off to the top-right |
| C | **Floating people icons** | Flat cyan "person with tie" glyphs, glowing, at the frame corners (top-left, bottom-right) and partly cropped | Scale-pop in (3 frames), slow drift/float, slide off the edge on exit |
| D | **Search-bar UI** (graphic scene) | Dark navy pill, 85 % width, white sans text; a neon cyan **comet light** travels along the border | Pill pushes in with the scene; text types synced to speech; comet loops the border; then the pill **tilts ~-8° in 3D**, drifts up-right and flies off the top with motion blur (4 frames) |
| E | **3D sparkle/asterisk shapes** | Glossy blue 6-petal 3D shapes, heavily defocused (depth of field), bottom-right and top-left | Slow parallax drift and rotation throughout the scene |
| F | **Emoji accent** | Photoreal 3D gold crown on the top-right corner of the hero word | Fades in with blur + slight scale (≈6 frames) after the word lands, with a sparkle sound |
| G | **Frosted-glass data cards** | Rounded white glass card with a bold "$500" / "$2000", a mini blue bar chart and a small caption ("Earning by month"); perspective-tilted ~15° | Fade + blur + scale 90→100 % + rotate into place (~6 frames); bars grow; gentle float. First card **behind** the person (beside the head), second card **in front** (on the chest). A **curved neon blue light-trail arc** connects them. Exit: each slides out to its nearest side with motion blur (6 frames) |
| H | **Glowing app-icon row** | iOS-style icons with neon glow and a white label under each (Task = blue checklist tile, Experience = gold gear+star, Skill = green bulb), evenly spaced across the chest | Each pops in (scale from 0, blur→sharp, 3–4 frames) exactly when its word is spoken; stays on to the end; hands pass in front |
| I | **Inline icon** | Small glowing icon after a word (e.g. a desk/person glyph after "Scale") | Pops in with the last letter |

---

## 7. Scene structure and transitions
Two kinds of scene alternate:
1. **Talking head + chest typography** (default)
2. **Full-screen graphic scene**: navy gradient + grid + defocused 3D shapes + UI/typography, no person. Used for list, brand or "big statement" beats. ~6 s each in the reference.

**Transitions**
- **Vertical motion-blur push (main transition)**, about 8–10 frames: the outgoing shot accelerates **down** out of frame with heavy vertical motion blur and a slight zoom-in; the incoming shot slides in from the top with blur and settles with a soft ease-out (slight overshoot, settling from ~108 %). Coming back reverses the direction (graphic scene goes up, talking head rises from the bottom).
- **Opening focus pull**: the first frame is heavily blurred, slightly over-scaled (~105 %), and sharpens to 100 % in **7 frames (0.23 s)**. The brand lock-up appears as the image sharpens.
- **Punch-in jump cuts** on the talking head: 1.08–1.12× scale change on a cut (e.g. on "Well…"), hard cut, no animation.
- No flashes, glitches, shakes or whip-pans. The language stays smooth and premium.

---

## 8. Sound design (from the spectrogram)
| When | Sound | Library match |
|---|---|---|
| 0.0 s opening | Sub-bass boom + airy shimmer | `bass-drop` + `sparkle` |
| Line chart / big data graphic appears | Sub-bass boom | `impact` (soft) |
| Every vertical-push transition (in **and** out of a graphic scene) | Sub-bass boom with a whoosh tail | `bass-drop` + `whoosh` |
| Gold word or crown emoji | Broadband shimmer | `sparkle` / `magic` |
| UI letters, icons, cards | Faint ticks/pops | `tick` / `tap` / `pop` at low volume |
| Cards leaving | Boom + swish | `impact` + `swish` |
| Music | **None** (or a very low pad). The voice carries the edit | — |

The booms sit under the voice. Sub frequencies (20–100 Hz) decay over ~0.8 s and never mask speech.

---

## 9. Pacing
- Tight cuts: pauses trimmed to roughly 0.15–0.25 s; retakes removed.
- About **one new text lock-up every 1.2–2.5 s**. Text covers ~60 % of runtime; the other 40 % is clean face time or props.
- A **graphic event every 2–3 s** (lock-up, prop, icon, card or scene change).
- **Graphic scene every ~6 s**, lasting 3–6 s.
- From the midpoint on, text lock-ups give way to **props** (cards, icons) so the second half feels different.

---

## 10. Reference timeline (output seconds)
| Time | Speech | Visual |
|---|---|---|
| 0.00–0.23 | "We are…" | Blur → sharp focus pull, boom |
| 0.23–0.93 | "…a Media Key" | Brand ring (A) behind head + `We Are / Media Key` scramble-in; scramble-out ~0.9 |
| 1.33–2.9 | "The best content agency" | `The Best / Content / Agency` (serif hero, sub tucked right) |
| 3.2–4.8 | "that helps business owners scale" | `That Helps / Business / Owners / Scale + icon`, people icons (C), glowing line chart (B), boom at 3.4 |
| 4.9–6.1 | "with premium content" | `With / Premium (gold) / Content`, shimmer SFX |
| 6.4–6.8 | — | **Vertical push down** to graphic scene, boom |
| 6.8–9.1 | "we are currently looking for full-time editors" | Search bar (D) types the phrase, comet border, 3D shapes (E), bar tilts and flies out |
| 9.3–10.4 | "we are looking for the" | Plain white sans types on (typewriter pop) in the scene |
| 10.4–12.0 | "best of the best" | `Best / Of the / Best` serif, crown emoji (F) |
| 12.0–12.3 | — | **Vertical push up** back to talking head, boom |
| 12.2–13.7 | "you might be wondering" | `You might be / Wondering` (left→right blur-type), fade out |
| 14.1–15.0 | "how much do we pay?" | `How Much / Do we Pay?` (rounded sans hero), fade out |
| 15.37 | "Well…" | Punch-in jump cut 1.1× |
| 15.4–16.3 | "well it depends" | `Well it / depends` (rounded sans), fade out |
| 17.2–20.4 | "anywhere from $500 to $2,000 a month" | Glass cards (G): $500 behind beside the head, $2000 in front on the chest, light-trail arc; slide out with boom at ~20.2 |
| 21.2–24.7 | "depends on the task, your experience… and your skills" | Icon row (H): Task → Experience → Skill pop in on their words; hands in front |

---

## 11. How this maps to new scripts
For each raw video:
1. **Cut** tight (pauses ≤0.25 s, remove retakes). Open with a **focus pull** on the first word.
2. Split the script into **phrases of 2–6 words**. For each phrase pick the **hero word** (the noun or value word) and make the rest the kicker or sub.
3. Choose the hero font by meaning: **serif** for nouns, ideas and values; **rounded sans** for questions, verbs and punchlines. Use **gold** at most once or twice per video, for quality/value words.
4. Every **5–8 s** pick the strongest standalone statement (list, offer, brand promise or question) and move it to a **graphic scene** with a fitting UI element (search bar, browser, prompt box, chat, checklist…) with vertical pushes in and out.
5. Numbers → **glass cards**; lists of 2–4 → **glowing icon row**; growth or results → **line-chart arrow** behind the person; brand or name → **logo ring** behind the head.
6. Booms on every transition and big reveal, shimmers on gold or emoji, ticks on UI. No music unless asked.
7. Grade with **`blue-glow`**. Keep the face clean; text goes on the chest, behind the hands.

---

## 12. Engine mapping (Vibe Editor)
| Element | How we build it |
|---|---|
| Grade | look `blue-glow` (saved) |
| Chest lock-ups | caption style `blue-glow` (saved, stack-based) for a quick version; custom `ass` lock-up presets (gradient via clipped colour strips, glow via blurred under-layer, random-order letter timing) for the real look, with `behind: true` cut-out so hands pass in front |
| Opening focus pull | `rack_focus` (in, 0.23 s) + `zoom` pull 1.05→1.0 |
| Vertical push | custom `ass`/`filter` transition (vertical slide + `avgblur`/motion blur), with `bass-drop` + `whoosh` |
| Graphic scene background | full-frame navy gradient + grid + blurred shapes (custom background card; `background` / overlay) |
| Search bar, prompt, browser UI | library `search` / `prompt` / `browser` (theme dark, accent `#5BCDE7`), restyled toward the neon pill |
| Glass cards | `card` style `glass` / `kpi` / `bar_chart` (light theme), tilted, plus a custom arc |
| Icon row | custom `ass` drawings or PNG icons from `brand/` with a pop-in |
| Crown or emoji | `image` overlay (3D emoji PNG) + `sparkle` SFX |
| Line-chart arrow | `line_chart` restyle or custom `ass` stroke draw-on, `behind: true` |
| Punch-ins | `zoom` style punch 1.1 on selected cuts |

Before the first edit, a short test render on your footage will be compared side by side with these keyframes and the custom pieces tuned until they match.

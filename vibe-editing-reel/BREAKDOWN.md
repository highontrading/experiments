# Reference Reel: Frame-by-Frame Breakdown

**Source:** 720×1280 (9:16), **30 fps**, **33.03 s**, **991 frames**, H.264 plus HE-AAC stereo.
**Method:** I extracted all 991 frames at 30 fps and viewed every one on contact sheets
(60 frames per sheet). Shot cuts come from ffmpeg scene detection and were checked by eye.
Word timings come from Whisper (`reference/transcript_words.json`). Frame numbers below are
0-based. Divide by 30 to get seconds.

---

## 1. The big idea (why it feels premium)

1. **The captions describe themselves.** Whenever he names a style, the caption is drawn in
   that style: "glowing letters" glows, "big white capitals" is big white capitals, and
   "chunky italics" is chunky italics. The text shows the feature while he talks about it.
2. **Every word is a separate design decision.** There is no fixed caption template. About
   10 type treatments appear in 33 s, and each phrase gets its own font, size, colour,
   placement and animation.
3. **The text lives in depth.** The subject is matted out on every frame. Text sits between
   the background and the person, so it passes **behind the head** and hoods overlap
   letters. The video opens on exactly that effect.
4. **The rooms don't exist.** Every warm, amber, cosy room is a generated background with the
   subject composited and relit. At 30.2 s the edit cuts to the **raw footage**, a plain
   bright white apartment, as the payoff.
5. **The look changes every 1.5–3 s.** There are 14 shots or looks in 33 s, so the average
   shot is about 2.4 s. Two-frame flash frames add punch.
6. **Technical credibility is shown on screen.** A face-tracking HUD shows confidence and
   X/Y readouts, variable-font annotations (`X-HEIGHT`, `BASELINE`, `WGHT 540 TRACK +0`) and
   Instagram safe-zone guides. It looks like a tool is doing the work.

---

## 2. Global style system

### Colour and grade
- **Base grade:** warm tungsten/amber with deep brown-black shadows (around `#1A0E08`) and
  orange highlights (around `#E89A3C`). Skin is warm, and blacks are crushed slightly but
  stay brown rather than neutral.
- **Graphic interludes** use a **cream** background (`#F1EEE8`) with a **black flat
  silhouette** and a **glossy bronze/copper 3D ribbon** (`#8A5A32` to `#C08454`). Two-frame
  inverted flashes use a **navy** background (`#0F1A2E`), a white silhouette and blue HUD.
- **Accent colours:** Claude coral `#D97757` (the "Claude Code" wordmark), HUD yellow
  `#F2C230`, neon red `#FF4A5A`, neon blue `#6FA8FF`, deep red `#8B1A1A` ("never"), and
  metallic gold for the end CTA.

### Type families (six roles)
| Role | Look | Close free match | Used for |
|---|---|---|---|
| **Serif display italic** | High-contrast Didone italic with ball terminals and a looped b/h | *Playfair Display Italic* (Black for big words) / *Instrument Serif Italic* | The emotional or punchline word: "Wait,", "behind my **head?**", "captions,", "head.", "them.", "lying here.", "actually exist.", "breakdown." |
| **Grotesk bold, lowercase** | Tight geometric sans, bold, small | *Inter Bold / SF Pro Display Bold* | Connective words: "every time", "i've set", "up to design all my", "so my captions", "and this", "but i'm just" |
| **Condensed heavy caps** | Ultra-bold condensed, all caps, stacked to justified width | *Anton / Bebas Neue / League Gothic* | "I MOVE", "BIG WHITE CAPITALS", "SWITCHES UP", "FACE" (tracked out), "ROOM" (outline only), "CAPTIONS" (gold chrome) |
| **Chunky italic sans** | Black-weight oblique grotesk | *Inter Black Italic* | "chunky italics.", "switches up" variant |
| **Rounded sans** | Friendly semi-bold rounded | *Poppins / Nunito SemiBold* | "switches up", the neon "glowing letters" |
| **Monospace HUD** | Slashed zero, technical | *JetBrains Mono / Space Mono* | "10x", "FACE 0.933 X 0679 Y 0799", "WGHT 540 TRACK +0", "X-HEIGHT", "BASELINE" |

**Hierarchy rule (used throughout):** small bold sans for the lead-in, then a big serif
italic for the payoff word. Example: `so my captions` (small) followed by `never` (big serif
italic). The big word is usually 2.5–3× the size of the lead-in.

### Default word animation (used on about 80 % of words)
- A word appears **0–2 frames before it is spoken** (it leads the audio slightly).
- **Blur-in over 4–6 frames:** Gaussian blur about 20 px down to 0, opacity 0 to 1, scale about
  1.08 down to 1.0, and a 10–20 px drift into its final spot.
- Words in a phrase **build up one by one** and hold until the phrase ends.
- **Exit over 2–4 frames:** a directional motion blur (smear) off-screen, a blur-out, a 3D flip
  away, particle dissolve, or a glitch slice. Exits are always faster than entrances.
- Text is **pure white** with a very soft dark drop shadow (about 30 % opacity, 8 px blur)
  for legibility. There are no caption boxes or outlines except the deliberate ones.

### Layer stack (every live-action shot)
```
[ text in front ]   ← e.g. "OH SH*T", "chunky italics", "them."
[ subject matte ]   ← person cut out on every frame, relit warm
[ text behind ]     ← e.g. "head?", "I MOVE", "WHITE", the orbiting words
[ generated room ]  ← AI background plate, warm grade, slight vignette
```

### Sound
- The voice is dry, close and loud: about −14 to −18 dB RMS.
- A very quiet bed sits underneath: about −34 dB in the gaps. It is ambient or soft music,
  barely audible.
- **Low whoosh/boom hits on transitions:** energy below 150 Hz rises around 2.6 s (into the
  cream poster), 3.4–3.6 s (the fall impact under "OH SH*T"), 26.6 s and 27.6 s (the floor
  morph and the cut to "this room"). Expect small risers or whooshes on the whip transitions
  too.

---

## 3. Shot list with timecodes

| # | Frames | Time (s) | Shot / location (generated) | Spoken |
|---|---|---|---|---|
| 1 | 0–46 | 0.00–1.57 | Side profile, standing, amber curtains plus a fig plant | "Wait, how are these words going" |
| 2 | 47–48 | 1.57–1.63 | **Two-frame flash:** black background, white luma matte of the subject | — |
| 3 | 49–81 | 1.63–2.73 | **Cream poster:** black silhouette, bronze ribbon | "behind my head?" |
| 4 | 82–141 | 2.73–4.73 | Front, standing, dark wall with a door | "Oh sh*t!" |
| 5 | 142–252 | 4.73–8.43 | Wide, walking toward camera, living room (doorway, lamp, sofa) | "And every time I move it switches up like glowing letters" |
| 6 | 253–337 | 8.43–11.27 | Whip into a closer angle of the same room | "or big white capitals or chunky italics." |
| 7 | 338–468 | 11.27–15.63 | Seated at a wooden table, room with arched walls, picture light | "I've set Claude Code up to design all my captions, even the words behind my head." |
| 8 | 469–487 | 15.63–16.27 | Whip/slide into a lounge chair, plant blurred in the foreground | "It's tracking…" |
| 9 | 488–511 | 16.27–17.07 | **Graphic interlude:** navy flash, cream poster, navy flash | "…my face" |
| 10 | 512–681 | 17.07–22.73 | Lounge chair, reclined | "10 times a second and it knows where all of Instagram's buttons are, so my captions never end up underneath them." |
| 11 | 682–837 | 22.73–27.93 | **Overhead**, lying on a Persian rug | "Normally you have to cut yourself out frame by frame, all for one word, but I'm just lying here." |
| 12 | 838–906 | 27.93–30.23 | Close-up at a table, then a wireframe room | "And this room doesn't actually exist." |
| 13 | 907–916 | 30.23–30.57 | **The reveal:** raw, ungraded footage in a white apartment | — |
| 14 | 917–990 | 30.57–33.03 | Wide at the table (arched room), CTA | "Comment captions and I'll send you a breakdown." |

---

## 4. Shot-by-shot detail

### Shot 1, f0–46: "Wait, how are these words going" (the orbit)
- **f0–1:** The **empty room plate** is shown with no person. "Wait," is already blurring in at
  the top left (serif italic, white).
- **f2–3:** The subject appears as a **solid glowing white silhouette** (the matte filled
  white with bloom).
- **f4–6:** The white silhouette **dissolves into the real person**, so he materialises. This
  frame-3 look is in `reference/keyframes_k1.jpg`.
- **f17–46: Orbit text.** Each new word ("how", "are", "these", "words", "going") enters at the
  **right**, blurred, in bold sans. It travels **left along an arc over the head** like a
  3D ring rotating around a vertical axis through the head. Words shrink and fade as they
  reach the back of the ring and **slide down behind the head and hood** on the left. "Wait,"
  is the first word to sink behind the head (f36–44). Arc radius is about 0.45× frame width,
  and the arc is centred about 60 px above the hood.

### Shot 2, f47–48: inverted matte flash
- Black frame with the subject as a white, slightly textured luma matte, held for 2 frames.
  It works as a "glitch" cut into the poster look.

### Shot 3, f49–81: "behind my head?" (cream poster)
- Cream background. The subject is rendered as a **black, high-contrast silhouette** with a
  little interior detail.
- **f52–69:** A **glossy bronze 3D tube/ribbon** draws on from the top. It loops down the left,
  passes **behind the head**, swings around and then crosses **in front of the body**,
  bottom right to left (f63–69). This is the depth illustration.
- "behind" (serif italic, black, about 40 px) blur-ins at f52, then "my" at f59.
- **"head?"** (huge serif black italic, about 110 px) blurs in at f62. It sits **behind the
  hood**, so the head covers the letters.

### Shot 4, f82–141: "OH SH*T" (wall impact)
- Hard cut. Front-on, hands in pockets, in a dark warm room by a door.
- **f82–95:** "OH" blur-ins at the top left. It is a chunky white sans with a **3D bevel or
  extrusion** and a grey side.
- **f96–103:** "SH*T" **drops from the top**, tilted about −10°, and slams next to "OH".
- **f99–110:** The subject **ducks and falls out the bottom of frame**, which motion-blurs
  heavily.
- **f104+:** The text lands **embedded in the wall**. **Crack decals** radiate from behind the
  letters, and **white debris particles fall** (f108–118), as if the text smashed into the
  wall.
- **f119–141:** The subject rises back up into frame while the text holds.

### Shot 5, f142–252: "every time I move it switches up… glowing letters"
- **f142–147:** The cut comes in **overexposed**: a white bloom flash fading to normal over 5
  frames.
- Wide shot, walking toward camera.
- "every" and "time" (small white bold sans) build up **at chest height** (f151–167).
- **f168–171:** "every time" **smears down and left out of frame**. At the same moment
  **"I MOVE"** (condensed caps, white, about 100 px) slams in at the top with vertical motion
  blur. The M sits **behind the head**.
- **f183–211: style switch.** "it switches up" changes font every 5 frames, with a 1–2 frame
  vertical smear between styles:
  `switches up` (rounded sans) → `SWITCHES UP` (condensed caps) → `switches up` (italic
  sans) → `switches up,` (serif italic). The words act out what he's saying.
- **f220–252: neon.** "glowing" appears in **warm yellow neon** with a **flicker** (dims at
  f221 and f224). At **f226 the whole room grade goes red** and the text burns white-hot,
  then red/pink. At **f232 the room goes blue** and "glowing letters" turns blue neon. The
  text **relights the room**, which is the key premium detail. f244–252: it flickers out.

### Shot 6, f253–337: "big white capitals / chunky italics"
- **f253–258:** A **whip pan** with heavy motion blur into a tighter angle of the same room.
- **f259–290: stacked justified caps.** "BIG" (huge), "WHITE" and "CAPITALS" blur in one at a
  time at the top right, each line scaled so they share the **same width**. They have a
  slight extruded shadow, and the head overlaps the left edge of "WHITE" (it is behind the
  subject).
- **f291–293:** The stack **flips away in 3D**, rotating back on the X axis and flying to the
  top right.
- **f305–330:** "chunky" then "italics." in **black-weight italic sans**, white, centred on the
  chest, **in front** of the subject.
- **f331–337:** The words **disintegrate into dust particles** that drift right and fade.

### Shot 7, f338–468: "I've set Claude Code up to design all my captions…"
- Hard cut to a wide shot at a wooden table in a room with curved arched walls, a framed
  picture with a brass picture light, and a lamp.
- **f345–360:** "i've set" (small bold). **"Claude Code" builds letter by letter**: each letter
  of "Claude" flies in from a random offset, then "Code". It is coral `#D97757`, bold sans,
  about 70 px.
- **f362–366:** The **Claude starburst mark spins in** next to "Code".
- **f368–389:** "up to design" rises in above it, then "all" and "my". "i've set" shrinks.
- **f387–392:** The **"Claude Code" letters scatter**: they fall and tumble away individually.
- **f391–397:** **"captions,"** in big serif italic (about 90 px) arrives with horizontal
  motion blur.
- **f398–415: type-spec overlay.** Thin white guide lines mark `X-HEIGHT` and `BASELINE`,
  with tick marks and small mono labels. A readout **counts down** `WGHT 686 → 700 → 600 →
  573 → 540` and `TRACK +18 → +0`, like a variable font settling into its final weight.
  It looks like a font-design tool at work.
- **f416–420:** The camera pushes in and the block drifts up and out of the top.
- **f416–451: orbit again.** "even", "the", "words" and "behind" travel the arc over the head.
  Earlier words sink down the left side behind the head.
- **f452–468:** **"head."** (big serif italic) blur-ins centred above the hood. He leans and
  turns.

### Shot 8, f469–487: transition into the lounge
- A **lateral slide/whip** with an out-of-focus foreground plant wiping across.
- Reclined in a leather lounge chair, warm room, plant in the foreground.
- **f476–487: face HUD.** **Yellow corner brackets** lock onto the face and follow it. Mono
  readouts type on: `FACE 0.93` / `X 0746 Y 0788`. The numbers update every few frames.
- **f487:** The frame dims to near black.

### Shot 9, f488–511: "tracking my FACE" (graphic interlude)
- **f488–489:** Navy background, **flat white silhouette**, **blue HUD brackets with "+ +"
  crosshairs**, and "track" in serif italic.
- **f490–509:** Cream background, **flat black silhouette**, yellow brackets and crosshairs,
  and the bronze ribbon arcing across.
  - "tracking" **types on** with a **block cursor** █ (serif italic). Then "my" types.
  - **"FACE"** (condensed caps, wide tracking) is revealed by a **gold highlighter block**
    that wipes letter by letter (F█ → FAC█ → FACE).
  - The HUD numbers keep updating (`FACE 0.926 → 0.933`).
- **f510–511:** The navy inverted flash again, with the ribbons now light blue.

### Shot 10, f512–681: "10x a second… Instagram's buttons… never… underneath them."
- **f512–540:** **"10x"**: a huge **yellow monospace** (slashed zero), "10" then "x". The face
  brackets plus readout sit just under it, and **"a second"** (white bold) sits below the
  face. The whole group **tracks the face**.
- **f541–546:** The group blurs and falls out.
- **f545–602:** "it knows where all of" (small bold, on a **tilted plane** of about −8° with
  slight perspective), then **"instagram's"** (bigger bold), then **"buttons are"** (serif
  italic). It builds downward.
- **f603–605:** **Glitch slice exit**: horizontal strips displaced left and right.
- **f603+:** **Thin white curved arrows** appear on the **right edge**, where Instagram's
  like, comment and share buttons sit.
- "so my captions" (small bold), then **"never"** in **deep-red serif italic** with red
  glitch pixels (f628–639).
- **f636–640:** A **dashed safe-zone guide** draws on: a white dashed line along the bottom and
  right, marking where the Instagram UI sits.
- **f640–681:** "end up" and **"underneath"** (bold), then **"them."** (serif italic). The text
  sits tucked inside the safe corner. The dashed box and text **ride with the camera
  shake**.

### Shot 11, f682–837: overhead, lying on the rug
- Hard cut to a **top-down shot**. He lies on a patterned orange/brown Persian rug (generated).
- **f683–790: text on a path around the body.** Letter by letter, typewriter style, the words
  "normally you have to cut yourself out" run along a **curve that follows his silhouette**:
  up the left arm, around the hood, down the right side. Small bold sans is used, then
  **"frame by frame,"** in larger serif italic, then "all for" (small), then **"one word,"**
  (larger serif).
- **f692+:** A **Photoshop-style selection path** (marching-ants dashed line with **square
  anchor points**) traces his outline. It shows the manual rotoscoping he is talking about.
- **f793–801: liquid floor morph.** A **dark brown organic blob grows outward from his body**
  and swallows the rug, leaving a plain warm brown floor with a spotlight vignette and film
  grain.
- **f803–837:** "but", "i'm" and "just" (tiny bold, top centre), then **"lying here."** (big
  serif italic).

### Shot 12, f838–906: "and this ROOM doesn't actually exist."
- A tight close-up at the table (same arched-room set).
- "and" and "this" (small bold), then **"ROOM"**: **outline-only** condensed caps, white
  stroke, hollow, about 120 px (f852).
- **f854–855: two-frame flash** of a cold, blue, overexposed version of the frame. It is a
  subliminal glimpse of the real room.
- **f863–875:** **"ROOM" shrinks back into depth**. **White wireframe lines** draw on, tracing
  the room's 3D edges (ceiling corners and wall edges), while the real background **fades
  to near black**. Only the wireframe remains.
- "doesn't" (small bold), then **"actually"** (serif italic), then "doesn't" exits, then
  **"exist."** (serif italic).
- **f900–906:** A **soft white spotlight circle** appears at the top and expands into a wipe.

### Shot 13, f907–916: the reveal (10 frames)
- The **raw footage**: a plain white apartment, a window with dried flowers, cool daylight,
  no text and no grade. Same pose, same take. This proves the rooms were fake.

### Shot 14, f917–990: CTA "comment CAPTIONS"
- Back to the wide arched room, hands making a frame or heart shape.
- **"comment"** builds letter by letter on an **upward arc** (white bold).
- **"CAPTIONS"** in **3D metallic gold chrome** condensed caps. The letters **drop in one at a
  time with a bounce** (f927–950), and a **light sweep** runs across the gold continuously
  until the end.
- A **hand-drawn white arrow** curls down and right toward the comment button (f922+).
- "and i'll send you a" (small bold) under the face, then **"breakdown."** (serif italic,
  f962). It holds to the last frame with no fade out.

---

## 5. How it was most likely built (the "Claude only" pipeline)

1. **Shoot** in an ordinary bright room (shot 13 shows it) in a dark hoodie. The contrast
   makes matting easy.
2. **Matte the person on every frame** (video matting or segmentation). The same matte drives
   text-behind-head, silhouettes, white/black flashes, the selection path and the
   path-following text.
3. **Generate a background plate** per shot (warm amber rooms, a Persian rug for the
   overhead) and composite the subject. Relight with a warm grade to match.
4. **Face tracking at 10 Hz** (the video says "10 times a second") drives the HUD brackets and
   anchors face-relative text.
5. **Word timestamps** come from speech-to-text. Every word becomes an event, and Claude
   picks a style per phrase from a type system, guided by what the phrase *means*.
6. **Instagram safe zones** are hard-coded keep-out rectangles: the right rail of buttons and
   the bottom caption/username area. The text layout avoids them.
7. Everything is rendered as code (HTML/canvas or Remotion style) and composited with
   ffmpeg, plus whoosh and boom SFX on cuts.

---

## 6. Recreation checklist (what makes it look expensive)

- [ ] Text **behind the head** in at least 4 moments (orbit ×2, "head?", "I MOVE"/"WHITE").
- [ ] A **self-describing caption** every time you name a style.
- [ ] **Two-frame flash frames** (inverted matte, cold glimpse) at 3–4 cuts.
- [ ] The **room relights** with the text colour (neon moment).
- [ ] **Cream/bronze/black poster interludes** ×2 for graphic contrast.
- [ ] A **HUD**: face brackets, mono readouts and counting numbers.
- [ ] **Safe-zone guides** plus right-rail arrows.
- [ ] **Text on a path** around the body plus a marching-ants selection.
- [ ] **Reveal of the real room** at the end. This gives a reason to rewatch.
- [ ] Every entrance is a **4–6 frame blur-in**; every exit is **2–4 frames** and directional.
- [ ] The **lead-in small sans then big serif italic payoff** rhythm throughout.
- [ ] A **gold chrome CTA keyword** with a light sweep and an arrow toward the comments.

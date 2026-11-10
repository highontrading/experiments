# Style breakdown: "Was Ramayana's VFX AI?" (Unpacking Bits, @nihaljain.dev)

A frame-level analysis of a reference reel, written as a recipe so you can make your own video that
*feels* like it, with your own topic, assets and brand. Nothing here copies their content; it
describes the system they use.

**Source file:** 720x1280 (9:16), 30 fps, 4,888 frames, 162.98 s, H.264 ~1.3 Mbps, AAC stereo 44.1 kHz.
**How it was analysed:** every second viewed (163 frames), headline changes and two fast sequences
viewed frame by frame (30 fps), automatic cut detection on all frames, per-frame motion energy,
loudness (EBU R128), silence detection, pixel-sampled colours, and a word-timed transcript of the voice.

---

## 1. The feel, in one paragraph

A **faceless, premium 3D explainer**. A calm, confident Hinglish voice talks fast and never stops.
On screen, every sentence becomes a **short bold headline with one coloured keyword**, sitting over a
**cinematic 3D "illustration" world** that literally shows what is being said. Real-world proof
(news headlines, quotes, box-office numbers) is layered on as **dark glass UI cards** with sources,
so it feels researched and trustworthy. The camera is always gliding. Every ~20 seconds something
breaks the pattern (a red flash, a glitch, a film strip, a burst of fast cuts). It opens with a huge
number and an unanswered question, walks through a **step-by-step chain**, pays the question off at
the end, and closes on a branded end card that farms comments.

---

## 2. Numbers that define the pace

| Measure | Value | What it means for you |
|---|---|---|
| Length | 2:43 | long-form reel; the same system works at 60 to 90 s |
| Voice pace | **4.5 words/s**, 658 words | fast, dense, conversational; no filler |
| Voice segments | 61, average **2.4 s** each | one headline per segment |
| Gap between sentences | median **0.26 s** | almost no pauses; the one real pause (0.66 s at 14.4 s) is a deliberate beat before "Remember Adipurush?" |
| Headline changes | ~every **2.5 s** | the eye always has something new to read |
| Hard scene cuts | 40 (avg ~4 s apart) | shots are long; energy comes from camera moves and text, not cutting |
| Fastest cutting | 102.9 to 104.9 s: a new image every 3 to 9 frames | used once, on the "rendering" beat, as a montage spike |
| Loudness | **-14.1 LUFS** integrated, range **2.2 LU** | loud and flat like a podcast; voice is always on top |
| Silence | only at 14.4 s (0.66 s) and around the end card | wall-to-wall audio |

Motion energy (average per second, higher is more movement) peaks at 30 to 39 s (flying through the
studio), 103 s (render passes), 114 s (server corridor) and 129 to 131 s (pull-out to the building).
It is lowest during explanation shots (turntables, 83 to 93 s). **Move fast when changing place,
slow down when explaining.**

---

## 3. Story structure (beat map with timestamps)

Rough translation of the voice, then what the screen does.

| Time | Beat | Voice (translated) | Headline on screen | Visual |
|---|---|---|---|---|
| 0.0 to 4.1 | **Hook: big number** | "Ramayana earned ₹650 crore worldwide in 5 days." | RAMAYANA EARNED / **₹650 CR+** IN 5 DAYS | extreme macro of the eagle's eye, pulls out to the eagle flying past the lotus airship over clouds; box-office card rolls up numbers |
| 4.1 to 9.3 | **Shock contrast** | "But the director said one fight took 6.5 years." | The **director** said... / ONE FIGHT: **JATAYU vs RAVANA** / ONE FIGHT. **6.5 YEARS.** | hand holds a phone with the news article; cut to the fight; film-strip frame with a timeline chip counting 2020 to 2026 |
| 9.7 to 14.3 | **Open loop** | "How can one fight take years? And was it AI?" | 6.5 YEARS... **HOW?** / And was it **AI?** | reveal it is a blue-screen set; floating "AI?" tag |
| 15.0 to 25.5 | **Stakes + credibility** | "Remember how Adipurush's VFX was mocked? So the big question: can Indian films do Hollywood-level VFX? Ramayana's VFX is by DNEG..." | Remember **ADIPURUSH?** / This time, the **big question:** / **HOLLYWOOD LEVEL?** / VFX by **DNEG** | phone with old news; cinema screen with the trailer; title cards of famous films |
| 25.5 to 29.4 | **Authority** | "...the studio that made Interstellar's black hole and Dune's world." | VFX by **DNEG** + fact chips ("Oscar for Best Visual Effects", "8 visual effects Oscars") | cinema audience watching those films |
| 29.4 to 34 | **The turn: the framework** | "So where does the time go? Every shot passes through a long chain." | So where does the **time** go? / Every shot goes through a **CHAIN** | camera flies through a dark VFX studio; each monitor wears a numbered stage badge (1 DESIGN, 2 PREVIS, 4 MOD, 5 GROOMING, 7 FINAL) |
| 34 to 42.4 | Step 1, with a number | "First, design. 40 to 50 designs for the airship. 2 years for one design." | **40-50 DESIGNS** / **2 YEARS** for one design | pin-board of sketches; counter chip "46 SKETCHES"; a sketch becomes a holographic wireframe, then the gold final |
| 42.9 to 51.7 | Step 2: "This is X." | previs + motion capture | This is **previs.** / This is **motion capture.** | grey-box 3D city with previs software HUD; mocap stage with marker suit and skeleton on a monitor; quote card from the DoP |
| 51.8 to 60 | **Mid-video twist** (retention) | "Then, a big problem: the airship design changed, so the fight had to be redone." | Then, a **BIG** problem / Design changed. Fight **REDONE.** | whole frame flashes dark red; flight path snaps from "OLD DESIGN" to "NEW DESIGN" with a red target ring |
| 60 to 81.6 | Step 3: the shoot | no eagle, no sky, only a piece of the set; blue screen; chroma key; camera tracking | No **Jatayu.** No sky. / So who was he **FIGHTING?** / Only a **PIECE** of the set was real / This is **chroma key.** / Blue out, **SKY** in / This is **camera tracking.** | actor on a blue-screen set, "JATAYU'S EYELINE" tag on a tennis-ball marker, vectorscope "BLUE vs SKIN", checkerboard key, sky composited in, tracking squares |
| 81.9 to 98.5 | Step 4: the creature | "The hardest part: Jatayu. 3D model, skeleton, feathers, wind and dust, physics." | The hardest part: **JATAYU** / This is a **3D model.** / ...**rigging.** / ...**grooming.** / ...**simulation.** | grey eagle on a turntable disc over a grid floor; wireframe, then bones, then feathers, then glowing wind lines |
| 98.8 to 116.3 | Step 5: **the climax number** | "The longest process: rendering. Guess how long? One frame of Interstellar's black hole took up to 100 hours. One second has 24 frames. So thousands of computers run day and night." | This is **rendering.** / Guess **how long.** / **100 HOURS.** ONE FRAME. / **24 FRAMES** = 1 SECOND / This is a **render farm.** | bucket-tile progressive render; render passes cut fast (LIGHT, SHADOWS, REFLECTIONS); white flash; black hole pixelated, then sharp; clock chip counting to 100 HOURS; 24 frames lined up; server corridor |
| 116.3 to 121.3 | Step 6 | compositing | This is **compositing.** | exploded layer stack labelled SKY, CLOUDS, VIMAN, YASH: THE PLATE, JATAYU, DUST, which collapses into the final shot |
| 121.6 to 134.5 | **Synthesis + callback** | "This whole chain runs for every shot. One change at the top and the work goes to zero. Thousands of artists. That's why one fight took 6.5 years." | Every shot. The whole **chain.** / One **change** at the top... / ...and the work goes to **ZERO** / **THOUSANDS** of artists / ONE FIGHT. **6.5 YEARS.** | overhead of a huge office; lights ripple across desks; shot slate flips from v212 FINAL to **v001 RESTART** in red; pull out to the whole building; the 2020 to 2026 timeline chip returns |
| 134.8 to 146.2 | **Pay off the open loop** | "So was it AI? Some reviewers felt shots looked AI. Makers say AI was only used for lip sync in other languages." | So, was it **AI?** / Makers: AI only for **LIP SYNC** / This is **AI lip sync.** | RGB-split glitch on the image (only here, because it means "fake"); review quote card; director quote card with photo; actor with huge words HINDI, ENGLISH, TELUGU, KANNADA |
| 146.6 to 156 | **Engagement** | "So did it feel Hollywood or AI? Tell us. Haven't watched it? Send this to your movie buddy." | **YOU** decide. / Tell us in the **COMMENTS** / Send it to your **MOVIE BUDDY** | cinema; two opinion pills appear (HOLLYWOOD LEVEL vs LOOKED LIKE AI); phone typing a comment; share sheet sends to "Movie buddy" |
| 157 to 163 | **End card** | "For notes, comment 'notes'. Like, send, follow." | brand card | fade to black, then a logo of orange and white cubes assembles; "To get the detailed research, comment"; comment field types **notes**; Like, Share, Follow light up one by one |

### The script formula, reusable

1. **Big verified number** (0 to 4 s).
2. **Contradiction** that makes the number strange ("one fight, 6.5 years").
3. **Open loop question** you will only answer at the end ("was it AI?").
4. **Stakes** (a past failure people remember) and **authority** (who did it, their track record).
5. **"So where does the time go?"** Name a **framework** (a chain, steps, layers).
6. Walk the steps. Each step: **"This is [term]."**, one plain sentence, **one concrete number**.
7. **Twist at about a third of the way** ("Then, a BIG problem").
8. **Climax number** near the end of the steps (100 hours, one frame).
9. **Synthesis that calls back the hook** (same headline as at 8 s returns at 134 s).
10. **Answer the open loop**, with sources.
11. **"You decide"** poll, comment prompt, **send-to-a-specific-friend** prompt.
12. **End card** with a comment keyword as a lead magnet ("comment notes").

---

## 4. Visual language

### 4.1 Two kinds of picture, always labelled
- **Illustration** (3D/AI-generated scenes) wears a small `✎ ILLUSTRATION` pill.
- **Real material** (trailers, news, quotes) wears `SOURCE  <outlet, date>`.

This labelling is a big part of why it feels trustworthy. Keep it.

### 4.2 The 3D world
- **Recurring hero assets** run through the whole film: the eagle, the lotus-shaped golden airship
  and the armoured warrior. The same asset is shown at every pipeline stage (sketch, grey previs,
  wireframe, rig, feathers, final). **Pick 1 to 3 hero objects for your topic and show them evolving.**
- **A small set of "sets"**, reused: a cinema with audience silhouettes (for "the film" and the
  audience's opinion), a dark VFX studio full of desks and monitors, a grey 3D-software grid with a
  turntable disc, a blue-screen stage, a server corridor, an office building at night, and a
  hand holding a phone (for news, comments and sharing).
- **Look:** warm, filmic, low-key. Golden-hour amber and cream against deep navy and charcoal.
  Practical lights, rim light, haze and clouds, a shallow depth of field. Technical scenes go cool
  grey-blue with cyan accents. It never looks like a game.
- **Camera:** always moving slowly: push-ins, pull-out reveals, dollies along rows, slow orbits on
  turntables. Transitions often happen *through a screen* (the camera flies into a monitor, which
  becomes the next shot).

### 4.3 Semantic effects (each one used for a meaning, never as decoration)
| Effect | When | Meaning |
|---|---|---|
| Dark red tint on the whole frame, about 1 s | "Then, a BIG problem" (53 s) | danger |
| Film-strip frame with sprocket holes | 8 to 15 s ("6.5 years") | time, cinema history |
| Progressive bucket tiles, pixelated then resolving | rendering (99 to 101 s, 109 s) | the computer is building the image |
| Fast cuts through render passes, 3 to 9 frames each | 102.9 to 104.9 s | many layers make one image |
| One white flash frame | into "Guess how long" (~105 s) | a jolt before the big number |
| RGB split / chromatic glitch | "So, was it AI?" (135 to 137 s) | fake, artificial |
| Checkerboard transparency | chroma key (73 to 75 s) | the background is removed |

---

## 5. Typography and on-screen system (measured on the 720x1280 frame; x1.5 for 1080x1920)

| Element | Spec |
|---|---|
| **Headline** | heavy grotesque sans (looks like Inter / SF Pro Display Black/ExtraBold). Top-left aligned, **left margin ~42 px**, first line cap-top **y ≈ 118 px** (9% from top), max width ~640 px. Cap height ~42 px, so a font size of about **56 to 58 px** (≈ 86 px at 1080 wide). Line height ~1.0. One or two lines, **3 to 6 words**. Soft dark drop shadow for legibility. |
| Headline case | ALL CAPS for numbers and claims ("RAMAYANA EARNED ₹650 CR+ IN 5 DAYS", "100 HOURS. ONE FRAME."). Sentence case for narration ("The director said...", "This is chroma key."). |
| **Keyword colours** (pixel-sampled) | white **#FFFFFF** base. Gold **#F5C561**: money, names, the subject ("₹650 CR+", "JATAYU", "PIECE"). Orange **#FDA84C**: people and suspense ("director", "how long", "FIGHTING"). Coral red **#D9635A**: problems, time cost, loss ("6.5 YEARS", "BIG", "REDONE", "ZERO"). Sky cyan **#6BD8F3**: technical terms ("motion capture", "rendering", "DNEG", "CHAIN"). **Exactly one coloured phrase per headline.** |
| Handle / watermark | `@nihaljain.dev` in a **monospace** font, ~13 px, white at ~85%, top-right (right edge x ≈ 682, y ≈ 97). On every frame. |
| Brand mark | small, faint cube logo on the right edge around 75 to 80% height. |
| `✎ ILLUSTRATION` pill | x ≈ 44, y ≈ 945. Dark translucent pill, ~11 px bold caps, wide letter spacing, light grey. |
| `SOURCE` line | same zone: "SOURCE" in small grey caps, then the outlet and date in white, ~11 px. |
| **Data card** | x 44 to 676, y ≈ 995 to 1125. Near-black glass (~#101014 at 80 to 85%), radius ~10 px, **4 px accent bar on the left** (gold for money, red for time). Labels in small grey tracked caps ("WORLD GROSS · 5 DAYS", "INDIA GROSS", "OVERSEAS"). Values in bold white ~30 px with a smaller unit ("₹413.90 CR + ₹250.00 CR = **₹663.90 CR**"). Values **roll like an odometer** (digits blur-scroll into place). |
| Timeline chip | "FIRST BRIEF TO FINAL FRAME", a big year that rolls 2020 → 2026, a dotted track with a red progress dot, red accent bar. Returns at 132 to 134 s as a callback. |
| Counter chips | "PUSHPAK VIMAN / 46 SKETCHES" (counts up); clock icon + "ONE FRAME, UP TO **100** HOURS" (counts up in red). |
| Quote card | big cyan opening quote mark, bold white quote ~14 px, attribution in small grey caps ("DoP PANKAJ KUMAR · VARIETY INDIA"). With a person: photo on the left, name in monospace colour, key phrase highlighted cyan. |
| Floating 3D tags | outlined pills inside the scene: "AI?", "OLD DESIGN", "NEW DESIGN", "JATAYU'S EYELINE", "HOLLYWOOD LEVEL", "LOOKED LIKE AI". |
| Fake software UI | previs HUD ("SH0412_PREVIS_v012 · CAM_A · 35mm", keyframe diamonds, frame counter), vectorscope, shot slate ("SH 0412 JATAYU vs PUSHPAK v212 FINAL" → "v001 RESTART"), numbered stage badges on monitors. These make it feel like a real studio. |
| Phone-in-hand | a 3D hand holds a phone showing a real-looking news article, a comment box being typed, or a share sheet. Used for proof and for the call to action. |

**Safe zones they respect:** the headline sits in the top 18%; cards and labels sit between 73% and 88%;
the bottom ~12% is kept for the platform caption and buttons.

---

## 6. Animation timing, frame by frame (30 fps)

**Headline change** (measured at frames 114 to 137, 4.1 s):
- The change happens **on the same frame as the scene cut** and the start of the new sentence.
- Old headline: fades out over **~5 frames (0.17 s)**, softening/blurring slightly as it goes.
- New headline: fades in over **~3 frames (0.1 s)** with a small upward drift (~4 to 6 px) and
  settles. The two overlap for about 2 frames.
- Total swap ≈ **6 to 7 frames (0.2 s)**. Fast, but never a hard pop.
- When only the visual changes and the sentence continues, the headline stays put across the cut.

**Numbers:** roll in over **~0.4 to 0.6 s** (odometer, with motion blur on the digits) and land with
the voice saying the number.

**End card** (156.9 to 159.3 s):
- 0.4 s fade to black → ~0.3 s of black → logo cubes fly together (~0.4 s) → title and handle fade up.
- The comment field types "notes" **one letter every ~3 frames**, then the send button turns amber.
- Like, then Share, then Follow light up in sequence, ~0.3 s apart.

**Render-pass burst** (102.9 to 104.9 s): beauty → LIGHT (3 to 4 frames) → SHADOWS (black and white,
~10 frames) → REFLECTIONS (~6 frames) → beauty rebuilds over ~10 frames → 1 white frame → hard cut.

---

## 7. Sound

- **Voice:** one narrator, Hinglish, conversational ("Aap socho...", "Guess karo..."), confident,
  fast (4.5 words/s), close-mic and dry. It drives everything; the edit follows the voice.
- **Mix:** -14 LUFS integrated with only 2.2 LU of range. That means a compressed voice plus a
  continuous music bed that never drops out. Treat the voice as the loudest thing at all times.
- **Pauses are rare and deliberate:** the only real one (0.66 s) comes right before the stakes
  section. Use silence once or twice, before a turn.
- **Sound design:** the cuts, number rolls, flashes and end-card taps are built to carry whooshes,
  ticks and UI taps. I measured the overall levels but did not isolate individual effects, so listen
  on headphones and match by ear.

---

## 8. How to make yours feel like this (with your own content)

### Checklist
- [ ] One topic, one **central question** you can answer with sources.
- [ ] **A verified hook number** and a **contradiction** in the first 9 seconds.
- [ ] The open-loop question asked **before 15 s** and answered **in the last 20%**.
- [ ] A **framework** (chain, steps, layers) with 5 to 7 steps; each step gets "This is [term]." and one number.
- [ ] A **twist** about a third of the way in.
- [ ] A **callback** to the hook headline at the end.
- [ ] **1 to 3 recurring hero assets** shown evolving through the steps.
- [ ] **4 to 6 reusable 3D sets** (your equivalents of cinema, studio, grid, phone-in-hand).
- [ ] Every sentence → a 3 to 6 word headline with **one** coloured keyword, by meaning (gold = subject/money, orange = people/suspense, red = problem/cost, cyan = technical term).
- [ ] Every illustration labelled `✎ ILLUSTRATION`; every fact labelled `SOURCE`.
- [ ] Data cards with rolling numbers for every key figure.
- [ ] Effects used **only** for meaning: red = problem, glitch = fake, film strip = time, pixel/tiles = computing.
- [ ] Handle top-right in monospace on every frame; brand mark on the right edge.
- [ ] Voice at ~4 to 4.5 words/s; headline swap every ~2.5 s; scene cut every ~4 s; one fast-cut burst at the climax.
- [ ] Ending: "You decide" → comment prompt → "send it to your [specific friend]" → end card with a comment keyword.
- [ ] Export loud (~-14 LUFS), 9:16, 1080x1920, 30 fps.

### Template you can fill in

| Time (90 s cut) | Time (160 s cut) | Beat | Your line |
|---|---|---|---|
| 0 to 3 s | 0 to 4 s | Hook number | ______ |
| 3 to 7 s | 4 to 9 s | Contradiction | ______ |
| 7 to 10 s | 9 to 14 s | Open-loop question | ______ |
| 10 to 18 s | 15 to 29 s | Stakes + authority | ______ |
| 18 to 21 s | 29 to 34 s | "So where does the ___ go?" + framework | ______ |
| 21 to 60 s | 34 to 121 s | Steps 1 to N ("This is ___." + number), twist at ~1/3 | ______ |
| 60 to 70 s | 121 to 134 s | Synthesis + callback | ______ |
| 70 to 80 s | 134 to 146 s | Answer the open loop, with sources | ______ |
| 80 to 87 s | 146 to 156 s | You decide / comment / send to a friend | ______ |
| 87 to 90 s | 157 to 163 s | End card + comment keyword | ______ |

### Production stack that gets you there
- **3D illustration shots:** AI image-to-video or 3D tools (your Higgsfield connector can generate
  the images, video and 3D models), or Blender. Lock a style sheet first (palette, lighting, lens)
  so every shot matches.
- **Overlay layer** (headlines, cards, odometers, tags, end card): build it **once as a template** and
  reuse it for every video. It can be the same HTML + headless Chrome + ffmpeg pipeline already in
  this repo (`vibe-editing-film`, the `3d-animator` skill), or After Effects / CapCut templates.
- **Voice:** your own voice or a cloned voice; cut the edit to the voice track.

# Trailer-style ads: the recipe

This is a portable brief for making more ads like the one that sells: **AIA_TRAILER_VID_v1** (launch CBO).
Copy it into any repo or tool and follow it as written.

**Why this ad is the one to copy (launch CBO, lifetime):**
- ₹2,912 spent, outbound CTR 4.25%, 62 landing-page views at ₹47 each
- 10 checkouts and 2 purchases: ₹1,456 per purchase on a ₹2,999 product, about 2× ROAS
- 95 ThruPlays

Two purchases is a small sample. Treat this as "the format that works so far", not proof, and keep testing new versions of it.

---

## 1. The idea in one line

A **movie-trailer narrative about the industry, not an ad about the course**. It tells the story *old world → the machines arrive → a new era*, and reveals the product as the title at the end. People watch it because it feels like a trailer, and they click because the story makes them feel late.

## 2. Why it works

1. **Story before offer.** The opening line ("They said advertising was ruled by instinct…") is a claim the viewer recognises. It doesn't read like a sales pitch, so they don't scroll past.
2. **Tension, then release.** It starts quiet, slow and dark, then the drop hits on "Then came the machines." The music arc does the persuading.
3. **Tool names as proof.** ChatGPT, Claude, Gemini, Midjourney, Veo, Kling, ElevenLabs and Runway flash on screen. Viewers recognise them, so the course feels current and real.
4. **News and industry proof.** Real headlines, the Meta Ad Library and agency screenshots say "this is already happening" without a talking head.
5. **Premium craft signals a premium product.** A cinematic voice, beat-synced cuts and a letterbox justify ₹2,999 better than any copy could.
6. **Clean offer framing.** The hook sits above the video and the price sits below it the whole time, so the offer is never hidden even while the trailer plays.

## 3. Format specs (feed placement)

| | |
|---|---|
| Canvas | **4:5, 1080×1350**, 25 fps, H.264, AAC, about −14 LUFS |
| Layout | Background #080808. The 16:9 trailer is placed at 1080×608 at **y = 372** (centred band) |
| Top hook (above the video, y ≈ 52) | 2 lines in a huge serif: "Advertising" in white, then "just changed." in lime #D8F5A2 (size ≈ 132 px) |
| Below the video | Mono caps: `AI & ADVERTISING · 11 MODULES · ₹2,999`, then a smaller line: "by Ideabro Studio · lifetime access" |
| Length | Trailer **≈ 55 s** plus a **3.6 s end card** (≈ 58.6 s total) |
| End card | Cream #F1EFE6, a fan of 3 course-output thumbnails, headline, and a button "Enroll now · ₹2,999 →". A boom SFX lands as the card appears |
| Also make | A **9:16** version: the trailer full-bleed and cropped, with the hook and price in the safe zones. And a **1:1** for the right column |

Brand palette: cream #F1EFE6, pink #F6B8EA, lime #D8F5A2, ink #141414, yellow #FFD60A.
Fonts: Instrument Serif (headlines), JetBrains Mono (labels/price), Inter (body), a pixel or monospace font for the typed VO cards.

## 4. Structure (55 s, everything on a 136 BPM beat grid)

One beat is 0.441 s; `T(n)` is the time of beat n. Every cut, card and SFX lands on a beat.

| Act | Time | Picture | VO (trailer narrator) | Music |
|---|---|---|---|---|
| **0. Cold open** | 0–1.3 s | Channel-surf flashes of archival 1950s–60s TV ads (0.1–0.4 s each) | none | opening boom |
| **1. Old world** | 1.3–8 s | Black screen. VO typed in a **pixel font**, letter by letter, synced to the voice. Words swap with a glitch: `INSTINCT → GUT → BUDGET → LUCK` | *"They said advertising was ruled by instinct. By gut, budget, and luck."* | drone only, **no kick**. "LUCK" punches in on a boom (≈7 s) |
| **2. Bridge** | 8–10 s | 3 slow shots: offices, old media, people at screens | | hit at ≈13.7 s |
| **3. The machines** | 10–16 s | Text cards with code rain / an "ALGORITHMS" card that smears out | *"Then came the machines. Algorithms learned the audience."* | build starts, kick enters |
| **4. Build** | 16–21 s | AI tool montage. Cuts **accelerate 2 → 1 → ½ beat**: Midjourney grid scroll, Veo, ChatGPT typing, robots/tech stock | *"Models started creating."* | riser into the drop |
| **5. Drop 1** | ≈21 s | **One shot per beat**: tool websites (ElevenLabs, Runway, Veo, Anthropic, Higgsfield), Meta Ad Library, stock shots | none, music carries it | full drop |
| **6. Mad Men → Midjourney** | ≈28 s | Typed card that **glitches out on drop 2** | *"From Mad Men to Midjourney. From briefs to prompts."* | drop 2 at ≈31 s |
| **7. Proof** | 31–44 s | News headlines (WSJ on Meta's AI ads, Coca-Cola AI ad coverage, WPP, trade press), Ad Library scroll, slow push-ins | *"Now, a new creative department emerges. Built not by agencies, but by AI."* | "AI" lands a **row of tool logos** |
| **8. Stop + barrage** | 44–46 s | One-beat silence/black, then half-beat flashes of everything | | **final drop ≈45 s** |
| **9. Title** | 48–53 s | Black title card: "Presenting" → **AI IN ADVERTISING** locks on a beat | | title SFX, final hit ≈53 s, long tail |
| **10. End card** (ad only) | 55–58.6 s | Cream end card + CTA | none | boom |

**The golden rule (from the reference):** *Text sections have no kick drum. Footage sections have the kick, and every cut lands on it.* Contrast is the engine.

## 5. Audio recipe

**Voice:** ElevenLabs **"David – Movie Trailer Narrator"** (voice id `FF7KdobWPaiR0vkcALHF`).
- Settings: stability 0.55, similarity 0.8, style 0.25.
- Sped up to **1.12×** after generation (rubberband, pitch kept), so there are no long pauses.
- Generate each line separately **with timestamps**, so the typed text follows the voice letter by letter.
- Short declarative sentences, 3–8 words each, 6 lines in total.

**Music:** one continuous score that climbs slow → explosive (ElevenLabs Music, composition plan, about 56 s, instrumental).
- Global styles: `epic hybrid trailer music, 136 BPM, hard-hitting modern drums, huge distorted bass, glitch stutters, high energy, tech hype trailer, instrumental`
- Negative styles: `vocals, singing, lyrics, acoustic guitar, slow ballad, ambient only, lo-fi`
- Sections:
  1. **intro tension** (9 s): `slow tense intro, ticking clock synth pulse, deep sub hits every two beats, dark filtered pads rising, no full drums yet`
  2. **build** (11 s): `drums enter: driving kick and snare at 136 BPM, rising synth arpeggio, growing energy every bar, snare roll at the end`
  3. **drop one** (17 s): `huge drop, relentless four-on-the-floor kick with trap hats, heavy distorted bass, bright supersaw stabs`
  4. **pre-final build** (5 s): `filtered rising build, fast snare roll, uplifter riser`
  5. **final drop** (11 s): `biggest drop, everything at full power, euphoric epic synth lead, glitch fills`
  6. **end hit** (3 s): `one massive final impact hit, long reverb tail fading out`
- Then: detect the beat grid (librosa), add a **low drone pitched to the score's key** under the quiet intro so it never feels empty, and keep the music running the whole time (no dead air).

**SFX** (ElevenLabs sound effects):

| SFX | Prompt |
|---|---|
| boom | "Massive cinematic sub boom impact, deep trailer hit with long dark tail" |
| braam | "Deep trailer braam hit, distorted low brass and sub, dark tech thriller" |
| glitch ×3 | "Short digital glitch stutter, data corruption, bit crushed click burst" |
| riser | "Rising reverse swell riser, dark cinematic tension build into a drop" |
| whoosh | "Fast cinematic whoosh swipe transition, airy digital swish" |
| tick | "Single soft digital data blip, UI tick, very short", one per typed word |
| title | "Epic deep cinematic title impact hit with sub boom and metallic shimmer" |
| static | "Low quiet analog TV static noise hiss with VHS hum", under the cold open |

**Mix:**
- Duck the music under the VO; the voice should sit about 6–10 dB above the bed.
- Two-pass loudnorm to **−14 LUFS / −1 dBTP**.

## 6. Visual language

- **2.21:1 letterbox bars** inside the 16:9 frame.
- A filmic grade: lifted blacks, slight teal/orange.
- **VHS streaks** and light grain on archival footage.
- **Chromatic aberration / RGB split** on hits.
- **Slice glitch** (horizontal bands offset) on transitions.
- **Typewriter text** in a pixel/mono font, white on black, revealed letter by letter on the VO timestamps, with a tick per word.
- **Glitch word-swaps** for lists (instinct → gut → budget → luck).
- A **bracket device** `[ ]` framing key words.
- **Beat pulse:** in kick sections, cards and shots scale by 2–3% on every beat.
- Slow **Ken Burns push-ins** (1.0 → 1.15) on stills and screenshots.
- **Title card:** black, big type, locks on a beat, then fades on the final hit.

## 7. Footage sources (mix all three)

1. **Archival / old-world:** public-domain 1950s–60s ad and TV footage (Prelinger Archives on archive.org) for the "they said" act.
2. **Stock:** Mixkit or Pexels HD clips of offices, screens, robots, creators, cities and data.
3. **Screen captures** (Playwright, 2880 px wide):
   - AI tool homepages: ChatGPT, Claude, Gemini, Midjourney, Veo, Runway, ElevenLabs, Higgsfield, Kling
   - News headlines and the Meta Ad Library
   - Scroll captures as frame sequences
4. **Your own work:** course outputs (AI model shoots, UGC, product videos) for the end-card thumbnails.

Avoid visible third-party product logos in stock (we replaced Amazon/HTC and Diesel shots) and stock watermarks or filenames.

## 8. The copy that ran

- **Primary text:** "They said advertising was ruled by instinct, budget and luck. Then came the machines. AI & Advertising is the complete playbook: from brief to live campaign, made with ChatGPT, Claude, Gemini, Nano Banana, Veo, Kling, ElevenLabs and more. Learn it once, use it for every brand."
- **Headline:** "The new playbook for advertising"
- **CTA button:** Learn more
- **Link:** the course page with UTMs (`utm_source=meta&utm_medium=paid&utm_campaign=…&utm_content=AIA_TRAILER_VID_v1`)

Pattern: open the primary text with the trailer's first line, so the copy and the video tell one story.

## 9. Variations to make next

Change **one thing per version**, so you learn what drives the sales.

**A. Same trailer, new wrapper (cheapest; test first)**
1. **New top hooks:**
   - "Your next ad won't need a shoot."
   - "Agencies don't want you to see this."
   - "The ad industry just split in two."
   - "₹2,999 vs a ₹2 lakh shoot."
2. **9:16 Reels/Stories cut:** full-bleed trailer with the hook in the top safe zone and the price in the bottom.
3. **30 s cutdown:** acts 1, 3, 5, 9 and the end card ("They said… / Then came the machines / drop / title").
4. **15 s cutdown:** cold open, "Then came the machines.", drop 1 on the beat, title, end card.
5. **End-card swaps:** show a price-anchor ("Agency shoot: ₹2,00,000. This course: ₹2,999"), a module list, or a student-output grid.

**B. New trailers, same formula**
6. **"The shoot is dead."** *"For fifty years, every ad needed a set. A crew. A model. A budget. Then one photo became a campaign."* Drop on "one photo", then before → after AI model shoots.
7. **"The creative department."** *"It used to take a team of twelve. Copywriter. Designer. Editor. Voice artist. Now it takes one person. And the right prompts."* Each role glitches into a tool name.
8. **Hinglish trailer.** Same structure, a Hindi trailer voice: *"Kehte the advertising instinct se chalti hai. Budget se. Kismat se. Phir aayi machines."* Typed text in Roman Hinglish.
9. **"The brief."** Typed cards show a client brief arriving at 11 pm, the AI tools fire on the drop, and the finished campaign is delivered by morning.
10. **Proof trailer.** Replace the news act with real student or course outputs, and end with "Made by people who took this course" (only with real, permitted work).

**C. Copy tests (same video)**
- A primary text that leads with the price/value ("Everything an agency charges lakhs for…").
- One that leads with the tool list.
- Headline options:
  - "Learn the AI ad stack"
  - "From brief to live campaign with AI"
  - "Advertising just changed. Catch up."

## 10. Production checklist

1. Write 5–7 VO lines (story → disruption → reveal). Keep each line ≤ 8 words.
2. Generate the VO with timestamps (David, 1.12×) and the score (composition plan above). Detect the beats.
3. Lay out a beat-grid timeline: text acts with **no kick**, footage acts **cut on every beat**, cuts accelerating into each drop.
4. Gather footage: archival for the past, stock for the bridge, screen captures for the tools and proof.
5. Render 16:9 with the letterbox, grade, VHS, typed cards, glitches and title.
6. Wrap it in 4:5 (hook top, price bottom), 9:16 and 1:1. Add the 3.6 s end card with the CTA and price.
7. Mix: duck the music under the VO, then −14 LUFS / −1 dBTP.
8. QA:
   - Check frames at every act change.
   - Make sure no brand logos or watermarks are visible.
   - Make sure the hook is readable with the sound off.
   - Make sure the price is visible for the whole ad.
9. Upload with UTMs and add it to the **same CBO** as the winner. Judge it after about 2× CPA in spend (about ₹3,000).

## Source files (this repo)

- `ai-in-advertising-trailer/trailer/timeline.py`: beat grid, shots, cards, VO slots, SFX hits
- `ai-in-advertising-trailer/trailer/render.py` and `sound.py`: picture and mix
- `ai-in-advertising-trailer/tools/`: `vo.py`, `music_plan.py`, `sfx.py`, `capture.js`, `capture_seq.js`
- `ai-in-advertising-trailer/REFERENCE_BREAKDOWN.md`: the original reference analysis
- `meta-ads-plan/ads/ad3_trailer.py`: the 4:5 wrapper + end card → `meta-ads-plan/out/AIA_TRAILER_VID_v1_4x5.mp4`

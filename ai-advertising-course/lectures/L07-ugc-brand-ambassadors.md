# Lecture 07: AI UGC and brand ambassadors

- **Target raw length:** 35–45 min (3 lessons of 10–15 min)
- **Lessons covered:** 7.1 AI creators that feel real · 7.2 Reviews, unboxings and testimonials · 7.3 Building a recurring AI brand face
- **Level:** 2 (Motion & sound)

## Before you hit record

- **Tabs open:** Google Flow (Google Omni Flash 1.2), ChatGPT (GPT Image 2.6) or Flow (Nano Banana 1.1) for creator stills, ElevenLabs, Claude.
- **Files open:** `workflows/W06-ugc-pipeline.md`, `templates/ambassador-bible.md`, `prompt-library/recipe-vault.md` (UGC sections).
- **Skills ready:** `skills/ugc-ad-director/SKILL.md`, `skills/ad-policy-check/SKILL.md`, `skills/vibe-editor/SKILL.md`.
- **Pre-generate:**
  - Creator "Riya" (a 24-year-old college creator, phone-camera look): 3 stills + a character sheet.
  - A 20s Kesar GRWM UGC ad (4 clips + VO + captions).
  - An unboxing sequence (hands, box, tissue paper, the serum reveal).
  - 1 "fake-looking" UGC clip (too polished, studio light, perfect skin) for the teardown.
- Have 2–3 real (non-branded) creator videos saved as references for how UGC actually looks. Use them only on screen for analysis, blurred.

## Cold open (30–60s)

Play the Kesar GRWM UGC ad.

> **"That creator doesn't exist. And that's exactly why you have to be careful. Today I'll show you how to make UGC that feels real, and the line you never cross: pretending it IS real."**

---

## Lesson 7.1: AI creators that feel real

Say **"LESSON 7.1"** on camera.

- **Goal:** Design an AI creator whose videos feel native to the feed.

**Talking points**
1. **"UGC works because it doesn't look like an ad. The moment it looks polished, it stops working."**
2. Teardown: the fake-looking clip vs a real creator style. What's different:
   - **Camera:** phone front camera, slight wide-angle distortion, handheld wobble, arm's-length framing.
   - **Light:** window light, a ring light at most, mixed colour temperature.
   - **Setting:** a real messy-ish bedroom, a bathroom mirror, a car seat, a hostel room.
   - **Skin and hair:** texture, flyaways, no beauty filter.
   - **Speech:** "umm", restarts, casual Hinglish, talking fast.
3. Design the creator like a person: name, age, city, job, how they talk, 3 catchphrases.
4. **"Imperfect on purpose."** Add the mess in the prompt.

**Live demo**
1. Attach `skills/ugc-ad-director/SKILL.md`:
   ```
   Create an AI UGC creator for Kesar & Co.: Riya, 24, Pune, final-year student and part-time content creator, chatty Hinglish. Give me her creator profile and a still prompt in phone front-camera style, plus a character sheet prompt.
   ```
2. Generate Riya's still in Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6). Example:
   ```
   SUBJECT: Riya, 24, Indian, wheatish skin with natural texture and a few small blemishes, messy bun, oversized tee, sitting cross-legged on her bed, holding her phone at arm's length for a selfie video.
   PRODUCT LOCK: she holds the Kesar & Co. serum: exact product from the reference image, same label, shape and gold cap; do not redesign.
   SET: small student room in Pune, fairy lights on the wall, books and a laptop on the bed, slightly messy.
   LIGHT: daylight from a side window, a little uneven, natural.
   CAMERA/LENS: phone front camera, slight wide-angle, arm's length, a little tilted.
   STYLING & MOOD: casual, chatty, real.
   BRAND LOOK: warm tones; a saffron accent in the room.
   FORMAT: 9:16, looks like a frame from an Instagram story.
   Avoid: studio lighting, beauty filter, perfect skin, skin lightening, professional camera look.
   ```

**Show on screen:** a "fake vs real" checklist next to both clips.

**Common mistakes**
1. Studio light and perfect skin for "UGC".
2. A creator with no personality, so they read as a stock face.
3. Scripts that sound like brand copy.

**Student gets:** `student-kit/skills/ugc-ad-director/SKILL.md`, `student-kit/workflows/W06-ugc-pipeline.md`

**Assignment:** Design your AI creator: profile, still and sheet.

---

## Lesson 7.2: Reviews, unboxings and testimonials

Say **"LESSON 7.2"** on camera.

- **Goal:** Make one UGC ad in a proven format, the honest way.

**Talking points**
1. The 5 UGC formats (all in `recipe-vault.md`):
   - **GRWM (get ready with me):** routine, then the product moment, then the result.
   - **Unboxing:** box, tissue, reveal, first reaction.
   - **Review / "honest opinion":** problem → tried it → what I liked → who it's for.
   - **Try-on haul** (fashion): 3 outfits, quick cuts, a reaction to each.
   - **"POV" / skit:** a relatable situation, then the product saves the day.
2. Script structure: **hook to camera (0–2s) → context → product in hand → one benefit shown → a casual CTA.**
3. **The honesty line. Say this word for word:** **"An AI creator can show and describe your product. An AI creator must never pretend to be a real customer with a real result."** No invented "I used it for 30 days and my spots vanished".
4. Use "creator-style" framing, real product facts, and follow Meta's AI labelling and ASCI rules.
5. Generate it shot by shot: 3–5 clips of 4–8 seconds, then cut them together fast.

**Live demo**
1. `ugc-ad-director`:
   ```
   Write a 20s GRWM UGC script for Riya with Kesar & Co. Diwali. Hinglish. Make it a shot list with a Flow prompt per shot (native audio, phone-camera style). Keep claims honest: only product facts we have (1% saffron extract + niacinamide, ₹899, free mini).
   ```
2. Generate shot 1 (the hook to camera) in Flow live.
3. Run the script through `ad-policy-check`:
   ```
   Check this UGC script for honesty and AI disclosure issues for Meta India.
   ```
4. Play the pre-made 20s GRWM ad and the unboxing sequence.

**Show on screen:** the 5 formats as cards, the script with the honest claims highlighted, the policy check result.

**Common mistakes**
1. Fake results and fake customer stories.
2. Each shot too long. UGC cuts every 1–3 seconds.
3. The product only shown at the end.

**Student gets:** `student-kit/prompt-library/recipe-vault.md` (UGC formats), `student-kit/skills/ad-policy-check/SKILL.md`

**Assignment:** Make one 15–20s UGC ad in any format. Run the policy check before posting it.

---

## Lesson 7.3: Building a recurring AI brand face

Say **"LESSON 7.3"** on camera.

- **Goal:** An ambassador bible so the same face can post every week.

**Talking points**
1. **"One great ad is a campaign. The same face every week is a brand."**
2. The ambassador bible (`templates/ambassador-bible.md`): character sheet, wardrobe rules, home set(s), voice (the same ElevenLabs voice), how they talk, topics, what they never do or say.
3. Content calendar: 3 posts a week (1 tip, 1 product moment, 1 trend/festival).
4. Disclose that it's an AI ambassador where needed, and never pass them off as a real human influencer.
5. **"If you want to go deep on UGC (hooks, scripts, 50 formats), that's The UGC Lab. This course gives you the essentials."**

**Live demo**
1. `ugc-ad-director`:
   ```
   Build an ambassador bible for Meera as Kesar & Co.'s recurring brand face: wardrobe rules, 2 home sets, voice notes, 10 topics, do's and don'ts, and a 2-week content calendar.
   ```
2. Fill in `templates/ambassador-bible.md` from the output.

**Show on screen:** the ambassador bible as a one-page "profile", the 2-week calendar.

**Common mistakes**
1. A new face every week.
2. A different voice in every video.
3. Overposting product ads with no value content.

**Student gets:** `student-kit/templates/ambassador-bible.md`, `student-kit/skills/ugc-ad-director/SKILL.md`

**Assignment:** Write your brand face's ambassador bible and a 2-week calendar.

---

## Wrap-up

> "Level 2 done: video, sound, UGC. You can now make almost any ad format. **Level 3 is the agency standard. Next lecture: Meta ads. Every ratio from one concept, 10 variations from one idea, and how to read the results.**"

## Edit notes for Claude

- Cold open: the GRWM ad full screen inside a phone mockup.
- 7.1: split screen of the fake-looking clip and the real-style reference (blur the real creator). Overlay the checklist ticks.
- 7.2: show the honesty line as a full-screen title card: "Show the product. Never fake a customer."
- 7.3: show the ambassador bible as a profile card, and the calendar as a grid.
- Cut every "RETAKE" back to the previous pause. Remove dead air over 1.2s.

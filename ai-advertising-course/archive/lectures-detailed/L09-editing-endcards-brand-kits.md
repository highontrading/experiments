# Lecture 09: Editing, end cards and brand kits (the vibe-editing showcase)

- **Target raw length:** 55–65 min (4 lessons of 12–16 min)
- **Lessons covered:** 9.1 Editing ads that hold attention · 9.2 Captions, type and colour · 9.3 Logo, text and CTA end cards · 9.4 Building a reusable brand kit
- **Level:** 3 (The agency standard)

## Before you hit record

- **Main tool:** Claude with code execution. Best is **Claude Code or the Claude desktop app** on your own computer with **ffmpeg installed**. Test it once before recording: ask Claude to run `ffmpeg -version`.
- **Backup tabs:** ChatGPT (to show the same skill works there), Gemini (to show the CapCut-plan fallback), CapCut.
- **Files open:** `skills/vibe-editor/SKILL.md`, `skills/vibe-editor/ffmpeg-recipes.md`, `skills/vibe-captions-and-endcards/SKILL.md`, `templates/brand-bible.md`.
- **Media ready in `05_edit/`:**
  - 8–10 Kesar clips from Lecture 5 (hero clips, film shots, the CGI rooftop, Riya UGC shots).
  - The VO (WAV), the instrumental bed, the jingle, the 5s sonic logo, 4 SFX.
  - The Kesar logo PNG (transparent), brand fonts (or Inter/any free font), palette hex values.
- **Pre-render (so you're never stuck waiting):**
  - The finished 30s ad + the 15s cutdown.
  - The captioned version.
  - 3 end card variants.
  - Final exports in 9:16, 4:5 and 1:1.
- Clean desktop and notifications off. A large terminal/chat font.

## Cold open (30–60s)

Split screen: a messy timeline on the left, a single typed sentence in Claude on the right, then the finished ad plays.

> **"I didn't drag a single clip. I typed one sentence: '30s Reel, high energy, warm saffron look, bold captions, end on the product.' And then I gave three notes, like a director. That's vibe editing."**

---

## Lesson 9.1: Editing ads that hold attention

Say **"LESSON 9.1"** on camera.

- **Goal:** Edit the 30s ad and a 15s cutdown with the 5-step vibe system, by instruction.

**Talking points**
1. **"You're not the editor anymore. You're the director. Claude does the clicks."**
2. The **5-step vibe editing system: 1 Dump → 2 Vibe → 3 Beat → 4 Layer → 5 Sound**, then the director pass.
3. Step 1, **Dump:** put all raw clips and one music track in one folder. Don't trim and don't sort.
4. Step 2, **Vibe:** one sentence = **platform + length + energy + look + goal.** Example on screen: "30s Reel, high energy, warm saffron look, bold captions, end on the product."
5. Step 3, **Beat:** cuts on every beat or every 2nd beat. Ad rules: **the first 3 seconds decide everything; cut every 1–2 seconds; the product appears by second 3–5; a pattern break around the middle.**
6. **"The 15s is not the 30s sped up. It's the 30s with everything except the best moments removed."**

**Live demo: attach the skill, dump clips, type the vibe**
1. In Claude (Code/desktop): show attaching `skills/vibe-editor/SKILL.md` (in Claude Code it lives in `.claude/skills/vibe-editor/`; in the Claude app, upload it as a skill or drag the file into the chat).
2. Point Claude at the folder:
   ```
   Use the vibe-editor skill. My clips, VO and music are in 05_edit/. First look at everything and tell me what you have.
   ```
3. Claude inspects the files (durations, ratios, fps) and lists them. **"It checks before it cuts, like a good assistant editor."**
4. Type the vibe:
   ```
   30s Reel for Kesar & Co. Diwali. High energy for the first 3 seconds, then warm and premium. Open on the CGI rooftop shot, product by second 4, Riya UGC in the middle, end on the gold podium hero. Cut to the beat of the instrumental bed. VO on top. Warm saffron look. 9:16.
   ```
5. Claude shows an edit plan (shot order, in/out points, timings) **before** rendering. Approve it: `Looks good, render it.`
6. Play the result.
7. Then the cutdown:
   ```
   Now make a 15s cutdown from this edit. Keep the hook, the product moment and the end. Same look.
   ```

**Show on screen:** the 5-step graphic, Claude's file inventory, the edit plan table, the render.

**Common mistakes**
1. A vague vibe ("make it nice"). Always give platform + length + energy + look + goal.
2. Skipping the plan and rendering straight away, then re-rendering 5 times.
3. A slow first 3 seconds.

**Student gets:** `student-kit/skills/vibe-editor/SKILL.md`, `student-kit/skills/vibe-editor/ffmpeg-recipes.md`

**Assignment:** Vibe-edit your 30s ad and its 15s cutdown.

---

## Lesson 9.2: Captions, type and colour

Say **"LESSON 9.2"** on camera.

- **Goal:** Add captions people can read on mute, and a single brand-consistent look.

**Talking points**
1. **"Most people watch with the sound off. Your captions ARE the edit."**
2. Caption rules: 2–5 words per line, big, high contrast, inside the safe zone, the key word highlighted in the brand colour.
3. Type: one font family, at most 2 weights. Use brand fonts from the Brand Bible.
4. Colour: **one look** across every clip (Step 4, **Layer:** captions → motion titles → one look, one layer at a time, checking each).
5. Accuracy: check Hindi/Hinglish captions word by word. AI transcription mishears brand names.

**Live demo**
1. Attach `skills/vibe-captions-and-endcards/SKILL.md` as well:
   ```
   Use vibe-captions-and-endcards. Transcribe the VO, make captions 2–4 words per line, bold white with a soft shadow, highlight "Kesar", "glow" and "₹899" in saffron #E8862A. Keep them inside the 9:16 safe zone. Show me the SRT first.
   ```
2. Fix one wrong word in the SRT live ("Kaiser" → "Kesar"). **"Always proofread the SRT."**
3. Burn it in. Then the look:
   ```
   Apply one warm saffron grade to every clip so they match: slightly warmer, gentle contrast, keep skin natural. Don't touch the product label colours too much.
   ```
4. Director pass, **3 notes max**:
   ```
   Director notes: 1) first 2 seconds punchier, cut faster; 2) captions 15% bigger; 3) hold the gold podium shot half a second longer at the end.
   ```
5. Play before and after the notes.

**Show on screen:** the SRT text, before/after the grade, the 3 sticky-note director notes.

**Common mistakes**
1. Captions sitting under the Reels UI.
2. A different caption style in every ad.
3. Over-grading so the product colour changes. That breaks product accuracy.

**Student gets:** `student-kit/skills/vibe-captions-and-endcards/SKILL.md`

**Assignment:** Caption and grade your ad, and do one 3-note director pass.

---

## Lesson 9.3: Logo, text and CTA end cards

Say **"LESSON 9.3"** on camera.

- **Goal:** A branded end card with the logo, offer and CTA, plus the sonic logo.

**Talking points**
1. The end card does one job: **tell people exactly what to do next.**
2. The 4 things on it: **logo, product, offer, CTA** ("Shop now", "Order on WhatsApp", "Link in bio").
3. Length: 1.5–3 seconds. Sync the sonic logo to the logo appearing.
4. Make 2–3 variants (offer-led, product-led, festive-led) and test them in Meta.
5. Step 5, **Sound:** the riser into the end card, the sonic logo, and a clean ending (no music cut off mid-note).

**Live demo**
1. `vibe-captions-and-endcards`:
   ```
   Make 3 end cards, 2.5s each, 9:16: (A) gold podium product + logo + "Free mini with every order" + "Shop now"; (B) cream background, logo, "₹899", "Link in bio"; (C) diya-lit background, "Is Diwali, glow ghar pe.", logo. Brand colours and fonts from the brand bible. Add the sonic logo on the logo reveal. Attach version A to the 30s and 15s edits.
   ```
2. Play all 3.

**Show on screen:** the 3 end cards side by side.

**Common mistakes**
1. No CTA, or a CTA that's too small.
2. An end card longer than 4 seconds.
3. The music ending abruptly.

**Student gets:** `student-kit/skills/vibe-captions-and-endcards/SKILL.md` (end card section)

**Assignment:** Make 2 end card variants for your ad.

---

## Lesson 9.4: Building a reusable brand kit

Say **"LESSON 9.4"** on camera.

- **Goal:** Finish the Brand Bible as a kit any skill (and any freelancer) can use, then export the final ad in every ratio.

**Talking points**
1. **"The brand kit is what makes your 50th ad look like your 1st."**
2. Brand Bible v2 (`templates/brand-bible.md`): palette (hex), fonts, logo files, image look + light prompts, model sheet(s), set references, voice (ElevenLabs voice and settings), jingle + sonic logo, caption style, end card templates, grade settings, do's and don'ts.
3. Attach the Brand Bible to every skill. That's how you get consistency across tools.
4. Exports: 9:16, 4:5, 1:1, H.264, 30fps, -14 LUFS, named properly.
5. **Works everywhere:** in ChatGPT with code execution, the same `vibe-editor` skill can do small edits. In Gemini, or anywhere without code, the skill gives you an exact **CapCut step-by-step plan** plus the ffmpeg commands to run yourself. **"Same skill, same plan. Only who presses the buttons changes."**

**Live demo**
1. `brand-bible-builder`:
   ```
   Update our Kesar brand bible to v2 with everything we've made: caption style, grade, end cards, voice, jingle, sonic logo. Output the full brand bible.
   ```
2. Back in `vibe-editor`, export:
   ```
   Export the final 30s and 15s in 9:16, 4:5 and 1:1 for Meta: H.264, 30fps, -14 LUFS, faststart. Reframe so the bottle and captions stay inside the frame. Name them with our naming convention.
   ```
3. Show the 6 files in the folder with correct names.
4. Quick fallback demo (1 minute): in Gemini, attach the same `vibe-editor` SKILL.md, give the same vibe prompt, and show it returning a CapCut plan with timestamps.

**Show on screen:** the Brand Bible v2 document, the export folder, the Gemini CapCut plan.

**Common mistakes**
1. A Brand Bible that lives in your head.
2. Exporting only 9:16.
3. Wrong file names, so the test results are unreadable later.

**Student gets:** `student-kit/templates/brand-bible.md`, `student-kit/skills/brand-bible-builder/SKILL.md`, `student-kit/skills/vibe-editor/SKILL.md`

**Assignment:** Finish your Brand Bible v2 and export your ad in 3 ratios.

---

## Wrap-up

> "You just edited a full ad by talking to it. Cuts, captions, grade, end card, exports. **Next lecture: hybrid ads. When to shoot for real, when to generate, and how to turn a ₹0 phone shoot into a premium ad.**"

## Edit notes for Claude

- This is the showcase lecture. Keep the pace fast and show results quickly.
- Cold open: the split screen (timeline vs one sentence), then the finished ad full screen.
- 9.1: show the 5-step graphic (Dump → Vibe → Beat → Layer → Sound). Speed up Claude's tool execution 4–8x, but show the edit plan table at normal speed.
- 9.2: zoom on the SRT fix ("Kaiser" → "Kesar"). Show each director note as a sticky note before/after.
- 9.3: the 3 end cards in a triptych.
- 9.4: a 3-up ratio grid. Gemini fallback as a short insert.
- Blur file paths that show the username. Cut every "RETAKE".

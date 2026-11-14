# Lecture 05: AI video ads and campaign films

- **Target raw length:** 55–65 min (4 lessons of 12–18 min)
- **Lessons covered:** 5.1 Image-to-video and camera moves · 5.2 Multi-shot stories that hold together · 5.3 VFX and CGI shots without a 3D team · 5.4 Food, fashion and tech video recipes
- **Level:** 2 (Motion & sound)

## Before you hit record

- **Tabs open:** Google Flow (video, model **Google Omni Flash 1.2**), Claude (Kesar Project), ChatGPT.
- **Files open:** `workflows/W04-still-to-video.md`, `workflows/W05-multi-shot-film.md`, `templates/shot-list.md`, `prompt-library/video-flow.md`, `prompt-library/recipe-vault.md`.
- **Skills ready:** `skills/video-ad-director/SKILL.md`, `skills/vibe-editor/SKILL.md` (for a 30-second assembly preview only).
- **Stills ready (from Lectures 3–4):** the Kesar gold-podium packshot, the diya-dresser lifestyle shot, Meera's sheet, the 3 haveli shots, the 6 storyboard frames.
- **Pre-generate (video takes the longest, so do these before recording):**
  - 5 hero clips: push-in on the podium, orbit around the bottle, dropper drip macro, Meera applying serum, haveli wide with a slow dolly.
  - The 6-shot Kesar Diwali film clips (from the storyboard).
  - 1 CGI clip: a giant Kesar bottle on a Mumbai rooftop at dusk.
  - Recipe clips: Fizzbar pour/splash, Loom Street dupatta in the wind, a tech gadget reveal (any phone or earbuds case).
  - 2 "bad" clips: one with a melting label, one with a flickering face.

## Cold open (30–60s)

Play the 6-shot Kesar Diwali film (rough cut), then cut to camera.

> **"Six images became a film. No crew, no location, no edit suite. But here's what nobody tells you: the video model is the last step. The film was made in the stills."**

---

## Lesson 5.1: Image-to-video and camera moves

Say **"LESSON 5.1"** on camera.

- **Goal:** Turn a still into a clean 8-second clip with a deliberate camera move.

**Talking points**
1. **"Always start video from an image you've already approved."** Text-to-video is a gamble. Frames-to-video is directing.
2. Flow modes. Use whichever ones your version of Flow shows:
   - **Text to Video:** ideas and tests.
   - **Frames to Video:** a start frame and an optional end frame. This is your main tool.
   - **Ingredients / reference to Video:** product + model + set as references.
   - **Extend / scene builder:** continue a shot.
3. The video prompt formula, 7 parts: **SHOT TYPE + SUBJECT & ACTION + CAMERA MOVE + LIGHT & MOOD + SOUND + DURATION/PACE + CONSISTENCY**, plus an Avoid line.
4. Camera vocabulary to teach: **push-in, pull-out, orbit, dolly left/right, tilt up, crane up, handheld, locked-off, whip pan, rack focus.**
5. **"One camera move per shot. Two moves and the model gets confused."**
6. Generate 2–4 takes and pick the best. Look for: label readable, no melting, natural motion.

**Live demo**
1. Attach `skills/video-ad-director/SKILL.md`:
   ```
   Start frame: the Kesar gold podium packshot (attached). Write 3 Flow prompts for 8-second clips with different camera moves: slow push-in, 180° orbit, dropper drip macro. Google Omni Flash 1.2. Keep the label readable.
   ```
2. In Flow → Frames to Video, upload the packshot and paste:
   ```
   SHOT TYPE: product hero, close-up.
   SUBJECT & ACTION: the Kesar & Co. serum bottle stands still on the gold podium; a few saffron threads drift slowly down past it.
   CAMERA MOVE: slow, smooth push-in from medium close-up to close-up on the label.
   LIGHT & MOOD: warm rim light glowing through the amber glass, soft saffron backdrop, calm and premium.
   SOUND: soft warm ambient pad, a gentle shimmer as the camera settles.
   DURATION/PACE: 8 seconds, slow and steady, ends still on the label.
   CONSISTENCY: same bottle, podium and backdrop as the start frame; label text stays sharp and readable.
   Avoid: label changing, bottle morphing, extra bottles, camera shake, text on screen.
   ```
3. While it renders, play the pre-generated orbit and macro clips.
4. Show a bad clip (melting label). **"Reject. Don't fix it in the edit. Re-roll it or simplify the move."**

**Show on screen:** the camera-move cheat sheet, the 7-part prompt in colour, good vs rejected takes.

**Common mistakes**
1. Text-to-video for product shots, so the product gets redesigned.
2. Asking for 3 actions and 2 camera moves in 8 seconds.
3. Accepting a take with a wobbly label.

**Student gets:** `student-kit/skills/video-ad-director/SKILL.md`, `student-kit/workflows/W04-still-to-video.md`, `student-kit/prompt-library/video-flow.md`

**Assignment:** Make 5 hero clips from your stills, each with a different camera move.

---

## Lesson 5.2: Multi-shot stories that hold together

Say **"LESSON 5.2"** on camera.

- **Goal:** A 15–30s film where the model, product, set and light stay the same across shots.

**Talking points**
1. **"A film is a chain. One different-looking shot and the whole chain breaks."**
2. The workflow (`W05-multi-shot-film.md`): **script → shot list → keyframe for every shot (still) → check consistency → video per shot → assemble.**
3. The shot list has: shot number, duration, shot type, action, camera move, start frame file, VO/text, sound.
4. Continuity rules: the same wardrobe, the same time of day, the same light direction, the same product angle the label faces.
5. Vary the shot sizes: wide → medium → close → macro → medium → hero. That rhythm feels professional.
6. **"Keyframes cost cents. Videos cost credits. Approve every keyframe first."**

**Live demo**
1. `video-ad-director`:
   ```
   Turn our 15s Kesar Diwali script (hook H02) and the 6 storyboard frames into a shot list and a Flow prompt for each shot. Keep Meera, the haveli and the light consistent.
   ```
2. Show the shot list table filling in `templates/shot-list.md`.
3. Generate shot 4 (Meera applying serum) live from its keyframe, with Meera's sheet as an ingredient/reference.
4. Quick assembly: drop the 6 pre-made clips into Claude with `vibe-editor`:
   ```
   Join these 6 clips in order, 15 seconds total, quick crossfade only between 3 and 4. Rough cut, 9:16.
   ```
   **"Full vibe editing is Lecture 9. This is just a preview."**

**Show on screen:** the shot list table, a keyframe strip above the clip strip, the rough cut.

**Common mistakes**
1. Generating each shot from text, so 6 different women and 6 different bottles.
2. All the shots the same size (all medium shots).
3. Not planning where the product appears and when.

**Student gets:** `student-kit/templates/shot-list.md`, `student-kit/workflows/W05-multi-shot-film.md`

**Assignment:** Shot-list your 15s script, make keyframes for every shot, then generate the clips.

---

## Lesson 5.3: VFX and CGI shots without a 3D team

Say **"LESSON 5.3"** on camera.

- **Goal:** One scroll-stopping CGI-style hero shot (giant product, impossible place, product "explosion").

**Talking points**
1. **"CGI ads stop the scroll because the brain says 'that can't be real'. But the product still has to be real."**
2. The 4 CGI formulas that work:
   - **Giant product in a real city** (a Kesar bottle as tall as a building at Marine Drive).
   - **Impossible material** (the serum as a saffron waterfall).
   - **Exploded product** (ingredients bursting out in slow motion).
   - **Miniature world** (tiny people on a vanity).
3. Make the CGI still first (Nano Banana 1.1 / GPT Image 2.6), check the product, then animate it with Flow.
4. Scale cues make it believable: people, cars, birds, matching light.
5. Use it as the hook (first 2 seconds), then cut to the real product shots.

**Live demo**
1. `video-ad-director`:
   ```
   Design a CGI hook shot: a giant Kesar & Co. serum bottle on a Mumbai rooftop at dusk, the city around it, Diwali lights. Give me the still prompt and then the Flow prompt with a slow crane-up.
   ```
2. Show the pre-made still, then generate the video in Flow (Frames to Video):
   ```
   SHOT TYPE: epic wide establishing shot.
   SUBJECT & ACTION: a 40-metre-tall Kesar & Co. serum bottle stands on a Mumbai rooftop at dusk; tiny people on the terrace look up; Diwali lights twinkle across the city; a few lanterns drift past.
   CAMERA MOVE: slow crane-up from street level to reveal the full bottle against the sky.
   LIGHT & MOOD: deep saffron-and-purple dusk sky, warm city lights, glowing amber glass, awe.
   SOUND: low cinematic swell, distant city ambience, a soft festive chime.
   DURATION/PACE: 8 seconds, slow and grand.
   CONSISTENCY: same bottle design as the start frame; label readable at the end of the move.
   Avoid: bottle morphing, wrong label, cartoon look, flicker.
   ```

**Show on screen:** the 4 CGI formulas as cards, still → video.

**Common mistakes**
1. CGI with no scale cues, so it just looks like a small bottle.
2. Letting the giant product's label melt.
3. A CGI shot that has nothing to do with the brand idea.

**Student gets:** `student-kit/prompt-library/recipe-vault.md` (CGI section), `student-kit/prompt-library/video-flow.md`

**Assignment:** Make one CGI hook shot for your brand.

---

## Lesson 5.4: Food, fashion and tech video recipes

Say **"LESSON 5.4"** on camera.

- **Goal:** Three quick, repeatable recipes students can reuse for any product in these categories.

**Talking points**
1. **"Most ads in a category use the same 3–4 shots. Learn the recipes, then add your twist."**
2. **Food & beverage (Fizzbar):** a pour into a glass with ice, a splash in slow motion, condensation macro, a can opening with fizz. Keywords: "slow motion 120fps look, droplets, backlit liquid".
3. **Fashion (Loom Street):** a dupatta flowing in the wind, a twirl, a fabric texture macro, a walk towards the camera. Keywords: "natural fabric movement, wind from the left".
4. **Tech:** a dark-background reveal, light sweeping across the edges, a floating rotation, a screen glow on the face.
5. Each recipe = still prompt + Flow prompt + sound + edit note. It's all in `prompt-library/recipe-vault.md`.

**Live demo**
1. `video-ad-director`:
   ```
   Give me 3 recipe prompts using recipe-vault style: Fizzbar mango can pour into a glass with ice (start frame attached), Loom Street dupatta in the wind, earbuds case reveal on black. Google Omni Flash 1.2, 6–8 seconds each.
   ```
2. Generate the Fizzbar pour live. Play the other two pre-made clips.
3. Open `recipe-vault.md` and scroll through all the recipes so they know it's there.

**Show on screen:** 3 recipe clips in a triptych, the recipe vault index.

**Common mistakes**
1. Liquids that pour upwards or out of nowhere. Always start from a frame with the glass and the can.
2. Fabric that moves stiffly or like plastic. Name the fabric and the wind direction.
3. Tech shots that are too dark for a phone screen. Lift the shadows a little.

**Student gets:** `student-kit/prompt-library/recipe-vault.md`, `student-kit/skills/video-ad-director/SKILL.md`

**Assignment:** Pick the recipe closest to your category and make 2 clips with it.

---

## Wrap-up

> "Stills became motion: camera moves, a multi-shot film, a CGI hook and category recipes. But right now it's silent, and silence doesn't sell. **Next lecture: voiceovers in Hindi and English, a brand jingle, and sound design that sells.**"

## Edit notes for Claude

- Cold open: the full rough-cut film, then a hard cut to camera.
- 5.1: a camera-move cheat sheet graphic (one small animated arrow per move). Speed up renders to 4x. Put "REJECT" stamps on the bad takes.
- 5.2: a keyframe strip over the clip strip. Highlight the continuity details (wardrobe, light).
- 5.3: show the 4 CGI formulas as 4 cards. A still-to-video wipe.
- 5.4: a triptych of the 3 recipe clips playing together.
- Cut every "RETAKE" back to the previous pause. Remove dead air over 1.2s.

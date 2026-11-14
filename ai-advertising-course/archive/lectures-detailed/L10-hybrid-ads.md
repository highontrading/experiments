# Lecture 10: Hybrid ads, real shoot + AI

- **Target raw length:** 35–45 min (3 lessons of 10–15 min)
- **Lessons covered:** 10.1 When to shoot and when to generate · 10.2 Blending real footage with AI scenes · 10.3 Upgrading a phone shoot with AI
- **Level:** 3 (The agency standard)

## Before you hit record

- **Tabs open:** Google Flow (Google Omni Flash 1.2 and Nano Banana 1.1), ChatGPT (GPT Image 2.6), Claude (with `vibe-editor`).
- **Files open:** `workflows/W09-hybrid-phone-upgrade.md`, your Brand Bible.
- **Skills ready:** `skills/hybrid-ad-director/SKILL.md`, `skills/vibe-editor/SKILL.md`, `skills/product-accuracy-checker/SKILL.md`.
- **Real footage to shoot before recording (phone, 4K if possible, 30fps):**
  - Your hand picking up the Kesar serum and pressing the dropper (5–6 takes).
  - Serum drops on the back of your hand (macro).
  - A 10-second phone selfie of you saying one line about the product.
  - A plain-background shot of the bottle rotating on a lazy Susan or plate.
- **Pre-generate:**
  - An AI haveli courtyard background plate that matches the light of your hand shot.
  - The upgraded hybrid ad: real hand shots + AI set + AI CGI hook.
  - A before/after of the phone shoot.

## Cold open (30–60s)

The before/after wipe: a raw phone shoot on a kitchen counter → the finished premium hybrid ad.

> **"Some things AI still can't fake well: real hands, real texture, real you. So don't fight it. Shoot what's real, generate what's expensive, and blend them so nobody can see the seam."**

---

## Lesson 10.1: When to shoot and when to generate

Say **"LESSON 10.1"** on camera.

- **Goal:** A clear decision rule for every shot in a campaign.

**Talking points**
1. **"The question isn't 'AI or real?' It's 'what's the cheapest way to make THIS shot look right?'"**
2. **Shoot it for real when:**
   - Hands touch, open or use the product (droppers, zips, pouring, applying).
   - Texture is the selling point (cream swatches, food bites, fabric close-ups).
   - The founder or a real customer talks (trust).
   - Exact product function matters (tech demos, before/after that must be true).
3. **Generate it when:**
   - Locations and sets (havelis, beaches, rooftops).
   - Scale and impossible shots (giant product, CGI, explosions).
   - Models and wardrobe across many looks.
   - Seasonal versions (Diwali, wedding, summer) of the same ad.
4. **Hybrid:** a real product in an AI world, a real person over an AI background, an AI hook + real demo.
5. Honesty: if it's a demo of what the product does, it must be real.

**Live demo**
1. Attach `skills/hybrid-ad-director/SKILL.md`:
   ```
   Here is the Kesar 15s shot list (attached). For each shot, decide: SHOOT, GENERATE or HYBRID, and why. Then give me a phone shot list for everything I need to shoot myself.
   ```
2. Show the table: shot 1 CGI rooftop = GENERATE; shot 3 dropper on hand = SHOOT; shot 4 Meera in the haveli = GENERATE; shot 5 hand + bottle in the haveli = HYBRID.

**Show on screen:** the shoot / generate / hybrid decision table as a 3-column graphic.

**Common mistakes**
1. Generating hands using the product, then fighting the extra fingers for an hour.
2. Shooting an expensive location you could have generated.
3. Faking a product demo.

**Student gets:** `student-kit/skills/hybrid-ad-director/SKILL.md`

**Assignment:** Mark every shot in your shot list SHOOT, GENERATE or HYBRID.

---

## Lesson 10.2: Blending real footage with AI scenes

Say **"LESSON 10.2"** on camera.

- **Goal:** Put a real hand shot into an AI set so the light, colour and grain match.

**Talking points**
1. The 4 things that must match: **light direction, colour temperature, perspective and grain/sharpness.**
2. Shoot real footage to match the plan: if the AI set has warm light from the left, light your hand from the left with a warm lamp.
3. Two ways to blend:
   - **Generate around the real footage:** use a real frame as the start frame in Flow and describe the new set (the product and hand stay; the world changes).
   - **Composite:** remove the background from the real footage and put it over an AI plate, then grade both to match.
4. **"Match the grain last. AI is too clean. Real phones are a bit noisy. Add a touch of grain over everything so it all looks like one camera."**
5. Always run `product-accuracy-checker` on hybrid frames, because AI can still alter the product.

**Live demo**
1. `hybrid-ad-director`:
   ```
   I have a real phone clip of my hand pressing the Kesar dropper on a kitchen counter (frame attached). Give me (a) a Flow prompt that keeps my hand and the bottle and changes the set to the haveli courtyard at golden hour, and (b) the composite route: background plate prompt + grade-matching notes.
   ```
2. Route (a) in Flow (Frames to Video with the real frame):
   ```
   SHOT TYPE: close-up, product in hand.
   SUBJECT & ACTION: a real hand presses the Kesar & Co. dropper; a single golden drop falls onto the back of the other hand.
   CAMERA MOVE: locked-off, very slight drift.
   LIGHT & MOOD: warm golden-hour sun from the left, soft bounce, calm and premium.
   SOUND: a soft dropper "plip", distant courtyard birds.
   DURATION/PACE: 6 seconds, slow.
   CONSISTENCY: keep the hand, the bottle and the label exactly as in the start frame; only replace the background with a sunlit Jaipur haveli courtyard, softly out of focus.
   Avoid: extra fingers, label changes, hand changing shape, flicker.
   ```
3. Route (b) with `vibe-editor`:
   ```
   Composite: key out the background of hand_dropper.mp4 (green/plain), place it over haveli_plate.png, warm both to match, add light film grain over the whole frame. Export 9:16.
   ```
4. Show the pre-made result.

**Show on screen:** a "4 things to match" checklist, the real frame → hybrid result.

**Common mistakes**
1. Cold real light over a warm AI set.
2. A real shot that's sharp next to an AI background that's sharp too. Real lenses blur the background.
3. No grain matching, so the edges look cut out.

**Student gets:** `student-kit/workflows/W09-hybrid-phone-upgrade.md`, `student-kit/skills/vibe-editor/SKILL.md`

**Assignment:** Shoot one real hand/product clip and blend it into an AI set.

---

## Lesson 10.3: Upgrading a phone shoot with AI

Say **"LESSON 10.3"** on camera.

- **Goal:** Turn a ₹0 phone shoot into a premium ad, with a full before/after.

**Talking points**
1. **"Your phone is a studio now, if you plan it right."**
2. The phone shoot checklist (`W09-hybrid-phone-upgrade.md`): window light, a white wall or sheet, 4K 30fps, lock exposure and focus, clean the lens, shoot 5 takes per action, hold every shot for 3 extra seconds.
3. The upgrade pipeline: **shoot → pick best takes → new backgrounds/sets (Flow) → AI hook shot → vibe edit → captions + end card → export.**
4. Founder-led content: real you on camera + AI-made b-roll often beats a fully AI ad, because of trust.
5. **"The best hybrid ad looks like a big-budget shoot where the parts that needed to be real actually are."**

**Live demo**
1. Play the raw phone footage (unedited, kitchen counter).
2. `hybrid-ad-director`:
   ```
   Plan an upgrade of my phone shoot (5 clips listed) into a 20s premium Kesar ad: which clips to keep, which to re-set with AI, which AI shots to add (hook + set), and the edit order.
   ```
3. Then `vibe-editor`:
   ```
   Build the 20s ad from this plan: AI rooftop hook (2s), my real dropper shots re-set in the haveli, my selfie line, gold podium end card. Warm saffron look, captions, sonic logo at the end. 9:16 and 4:5.
   ```
4. Play the before/after wipe.

**Show on screen:** the phone setup (a quick photo of your desk), the raw clips, the finished ad, the before/after.

**Common mistakes**
1. Auto-exposure on, so the brightness pumps during the shot.
2. One take per action.
3. Shooting in a mixed-light room (yellow bulb + daylight).

**Student gets:** `student-kit/workflows/W09-hybrid-phone-upgrade.md`, `student-kit/skills/hybrid-ad-director/SKILL.md`

**Assignment:** Do a 10-minute phone shoot of your product and upgrade it into a 15–20s hybrid ad.

---

## Wrap-up

> "Real where it matters, AI where it saves money, and no seam in between. **Next lecture is the big one: we run one full campaign from brief to launch, turn it into a portfolio case study, and I'll show you how to price and pitch this as a service.**"

## Edit notes for Claude

- Cold open: a before/after slider wipe, raw kitchen counter → premium ad.
- 10.1: a 3-column SHOOT / GENERATE / HYBRID graphic, filling in row by row.
- 10.2: show the "4 things to match" checklist with ticks. Zoom on the edge of the composite to show the grain matching.
- 10.3: a quick-cut montage of the phone setup. Final before/after full screen.
- Cut every "RETAKE" back to the previous pause. Remove dead air over 1.2s.

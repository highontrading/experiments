# Lecture 04: Models, styling and virtual sets

- **Target raw length:** 50–60 min (4 lessons of 10–15 min)
- **Lessons covered:** 4.1 Creating consistent AI models · 4.2 Digital styling: fabric, colour and fit · 4.3 Indian skin tones, outfits and settings · 4.4 Designing any set or location
- **Level:** 1 (The image)

## Before you hit record

- **Tabs open:** Google Flow (Nano Banana 1.1, with reference/ingredients images), ChatGPT (GPT Image 2.6), Claude (Kesar + Loom Street Project), Pinterest for moodboards.
- **Files open:** `workflows/W02-consistent-model.md`, your Brand Bible, `prompt-library/images.md`.
- **Skills ready:** `skills/model-and-set-director/SKILL.md`, `skills/product-accuracy-checker/SKILL.md`.
- **Assets ready:** 1 Loom Street kurta flat-lay photo (or any real garment photo), the Kesar reference photo.
- **Pre-generate:**
  - The "Meera" model sheet: front, 3/4, profile, full body, and 2 expressions.
  - 4 Loom Street styled looks on Meera.
  - 3 shots of the same "Jaipur haveli courtyard" set from different angles.
  - 1 "bad" example with lightened skin and generic "Indian" clichés, for the 4.3 teardown.

## Cold open (30–60s)

Show 6 images of the same model in different outfits and places.

> **"Same face, six shoots, zero casting calls. Brands don't need a model for one day. They need a face people recognise every week. Today we build one."**

---

## Lesson 4.1: Creating consistent AI models

Say **"LESSON 4.1"** on camera.

- **Goal:** Build one brand model with a character sheet that stays the same across every image.

**Talking points**
1. **"Consistency is what makes it a brand. Random pretty faces make it a stock photo."**
2. A model sheet has: **front, 3/4, profile, full body, 2 expressions**, all in plain neutral light on a plain background.
3. Write the model's "spec card" once: age, face shape, skin tone, hair, eyebrows, one unique detail (a small mole, a nose stud), body type, and personality.
4. **"Every future prompt starts with the spec card plus the sheet as a reference image."**
5. Make the model fictional. Never base them on a real person or a celebrity.
6. Name them. "Meera" is easier to direct than "the girl".

**Live demo**
1. Attach `skills/model-and-set-director/SKILL.md`:
   ```
   Create a brand model for Kesar & Co.: Indian woman, 27, warm medium-brown skin, working professional, natural look. Give me her spec card and a character sheet prompt (front, 3/4, profile, full body, 2 expressions) on a plain light-grey background.
   ```
2. Paste the sheet prompt into Flow (Nano Banana 1.1). Example of the output:
   ```
   Character sheet of the same woman, "Meera": Indian, 27, warm medium-brown skin with natural texture, oval face, thick dark eyebrows, dark brown eyes, small gold nose stud on the left, shoulder-length wavy black hair, slim build. Six panels on a plain light-grey background: front headshot, 3/4 headshot, profile, full body standing, smiling, laughing. Soft even studio light, 85mm, photoreal, consistent identity in every panel.
   Avoid: skin lightening, heavy makeup, beauty filter, different faces between panels, text.
   ```
3. Use the sheet as a reference: put Meera in a new scene holding the Kesar serum. Show that it's the same face.

**Show on screen:** the spec card, the 6-panel sheet, sheet → new scene with the face matching.

**Common mistakes**
1. Describing the model differently in every prompt.
2. No reference image, so the face changes every time.
3. Using a celebrity name to "get the look".

**Student gets:** `student-kit/skills/model-and-set-director/SKILL.md`, `student-kit/workflows/W02-consistent-model.md`

**Assignment:** Create your brand model's spec card and character sheet.

---

## Lesson 4.2: Digital styling: fabric, colour and fit

Say **"LESSON 4.2"** on camera.

- **Goal:** Put a real garment on the AI model with the right fabric, colour and fit.

**Talking points**
1. **"If you sell clothes, the garment is your product. Same rule: lock it."**
2. Describe fabric like a stylist: handloom cotton, chanderi, mulmul, Banarasi silk, block print, zari border, matte vs sheen, drape vs structure.
3. Colour: name it and give the hex value if you can. "Rust orange" isn't enough; "rust #B5502B, matte cotton" is.
4. Fit: relaxed straight kurta, ankle length, three-quarter sleeves, mandarin collar.
5. Use the real garment photo as a reference. For catalogue work, check the garment the same way you check a label.

**Live demo**
1. Upload the Loom Street kurta flat-lay and Meera's sheet:
   ```
   Using model-and-set-director: style Meera in this exact Loom Street kurta (reference attached) for 4 lookbook shots: studio, haveli courtyard, street market, festive home. Lock the garment's colour, print and border.
   ```
2. Generate one look live in Flow with both references attached.
3. Run `product-accuracy-checker` on the garment: print, border, colour, sleeve length.

**Show on screen:** the flat-lay → on-model result side by side. Zoom on the print.

**Common mistakes**
1. The AI changes the print pattern. Always compare at 100%.
2. Vague fabric words ("nice cloth").
3. Not checking the fit details that customers return clothes over.

**Student gets:** `student-kit/prompt-library/images.md` (fashion section), `student-kit/skills/model-and-set-director/SKILL.md`

**Assignment:** Style your model in 4 looks (your product or a sample garment).

---

## Lesson 4.3: Indian skin tones, outfits and settings

Say **"LESSON 4.3"** on camera.

- **Goal:** Make Indian people and places look real and specific, not generic.

**Talking points**
1. **"AI was trained mostly on Western images. If you don't direct it, it will lighten skin and flatten culture."**
2. Skin: say "natural skin texture, visible pores, warm medium-brown / deep brown / wheatish tone", and write **"Avoid: skin lightening, beauty filter"** every time.
3. Show the bad example: lightened skin, a random bindi, a "Taj Mahal in the background" cliché. Explain each mistake.
4. Be specific about region and occasion: a Kanjeevaram saree for a South Indian wedding, a Phulkari dupatta for Punjab, a Mumbai local train, a Kolkata para Durga Puja.
5. Real homes, not palaces: steel almirahs, pressure cookers, ceiling fans, tube lights. That's what feels true.
6. **"The human touch is the detail only someone from here would know."**

**Live demo**
1. Teardown: the bad image on screen, with circles on the problems.
2. Fix it with `model-and-set-director`:
   ```
   Rewrite this prompt to fix skin tone and cultural accuracy: "Indian woman in traditional dress for Diwali, beautiful, glowing skin". Make it specific: a Maharashtrian family home in Pune, Diwali morning.
   ```
3. Generate the fixed version and show it beside the bad one.

**Show on screen:** the bad vs good split, plus a short "specific words" list on screen.

**Common mistakes**
1. "Indian woman, traditional dress" with nothing more. That is generic and stereotyped.
2. Accepting lightened skin because it "looks glowing".
3. Mixing regions (a Gujarati outfit in a Bengali ritual).

**Student gets:** `student-kit/prompt-library/images.md` (India styling section)

**Assignment:** Make one image set in a specific Indian region and occasion that fits your brand.

---

## Lesson 4.4: Designing any set or location

Say **"LESSON 4.4"** on camera.

- **Goal:** Design one set and keep it consistent across 3 shots.

**Talking points**
1. **"A set is a character too. If it changes between shots, the film breaks."**
2. Build the set from a moodboard: 3–5 reference images, then a written set description (architecture, materials, colours, props, time of day).
3. Generate one "master wide shot" of the set first. Then use it as a reference for the close-ups.
4. Keep the light the same between shots: the same time of day and the same light direction.
5. You can build any set: a haveli courtyard, a Goa beach shack, a futuristic saffron lab, a Mumbai rooftop at dusk.

**Live demo**
1. `model-and-set-director`:
   ```
   Design a set: "Jaipur haveli courtyard at golden hour" for Kesar & Co. Give me a master wide-shot prompt, then a medium and a close-up prompt that keep the same set and light. Meera is in the medium shot holding the serum.
   ```
2. Generate the master wide in Flow. Then the close-up with the master as a reference.
3. Show the 3 pre-generated shots as a sequence. **"That's a storyboard for Lecture 5."**

**Show on screen:** the moodboard → master wide → 3-shot sequence.

**Common mistakes**
1. Generating every shot from text only, so the set changes.
2. The light direction flipping between shots.
3. A set that fights the product's colours.

**Student gets:** `student-kit/prompt-library/images.md` (sets section), `student-kit/workflows/W02-consistent-model.md`

**Assignment:** Design one set and make 3 consistent shots in it, with your model and product.

---

## Wrap-up

> "Level 1 done. You have a brief, a look, a product that stays accurate, a model people will recognise and a set. **Next lecture, everything starts moving: image to video in Google Flow, camera moves, and multi-shot films.**"

## Edit notes for Claude

- Cold open: a 6-image grid that builds up one by one in rhythm.
- 4.1: animate the spec card typing out. Show the 6-panel sheet full screen for 3s.
- 4.2: zoom to 200% on the print/border match.
- 4.3: the bad image with red circles, then a clean wipe to the good one. Make sure the bad example is clearly labelled "WRONG" on screen.
- 4.4: show the 3 shots in sequence like a mini storyboard.
- Cut every "RETAKE" back to the previous pause. Speed up waiting for generations to 4x.

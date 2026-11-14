# Lecture 03: AI product photography

- **Target raw length:** 50–60 min (4 lessons of 10–16 min)
- **Lessons covered:** 3.1 Studio packshots from one photo · 3.2 Lifestyle scenes and backgrounds · 3.3 Keeping labels, logos and shape accurate · 3.4 E-commerce listing images
- **Level:** 1 (The image)

## Before you hit record

- **Tabs open:** Google Flow (image generation, Nano Banana 1.1), ChatGPT (GPT Image 2.6), Claude (Kesar Project), Canva or Photopea for the label overlay fix, an Amazon or Nykaa listing page as a reference.
- **Files open:** `workflows/W01-one-photo-to-campaign.md`, `workflows/W03-label-lock.md`, `prompt-library/images.md`, your Brand Bible.
- **Skills ready:** `skills/product-shot-director/SKILL.md`, `skills/product-accuracy-checker/SKILL.md`.
- **Product and phone:** the real serum bottle, a white sheet of paper as a sweep, a window for light.
- **Pre-generate:**
  - 4 Kesar packshots (white, saffron-gradient, gold podium, splash of saffron threads).
  - 6 lifestyle scenes (vanity, Diwali diya set, bathroom shelf, handbag flat-lay, beach, kitchen-window morning).
  - 1 "broken" image with a warped label and misspelled "Kesar & Cp." for the fix demo.
  - A finished 6-image listing set.

## Cold open (30–60s)

Hold up your phone photo next to the final packshot.

> **"This is a ₹0 phone photo. This is the same bottle in a studio that doesn't exist. The trick isn't the model. It's keeping the product real while changing everything around it."**

---

## Lesson 3.1: Studio packshots from one photo

Say **"LESSON 3.1"** on camera.

- **Goal:** One good reference photo becomes 4 studio packshots.

**Talking points**
1. **"Garbage reference in, garbage ad out."** The reference photo matters more than the prompt.
2. How to shoot the reference: next to a window, on white paper, label facing the camera, straight on, no harsh shadow, fill the frame. Then take one more from a 3/4 angle.
3. Clean it: remove the background (Flow, ChatGPT or any remover). Keep the original file as well.
4. The image prompt formula, 8 parts: **SUBJECT + PRODUCT LOCK + SET + LIGHT + CAMERA/LENS + STYLING & MOOD + BRAND LOOK + FORMAT**, plus an Avoid line.
5. **"PRODUCT LOCK is the most important line in the course."** Say it every time.
6. Light language that sounds expensive: softbox, rim light, backlight through amber glass, hard sun with crisp shadow, gradient backdrop.

**Live demo**
1. Shoot the reference on camera with your phone. Upload it to Flow.
2. Attach `skills/product-shot-director/SKILL.md` in Claude:
   ```
   Product: Kesar & Co. Saffron Glow Serum (reference photo attached). Use our brand bible. Give me 4 studio packshot prompts: pure white e-com, saffron gradient, gold podium hero, saffron threads floating. 1:1 and 4:5.
   ```
3. Paste prompt 3 into Flow (Nano Banana 1.1), with the reference image attached:
   ```
   SUBJECT: one serum bottle standing on a round brushed-gold podium.
   PRODUCT LOCK: keep the exact product from the reference image: same label text "Kesar & Co. Saffron Glow Serum", logo, amber glass, dropper, gold cap, colours; do not redesign.
   SET: seamless deep saffron backdrop fading to deep red at the edges, a few real saffron threads on the podium.
   LIGHT: large softbox from the left, warm rim light from behind making the amber glass glow, soft floor reflection.
   CAMERA/LENS: 100mm macro, straight on, slightly low angle, everything sharp.
   STYLING & MOOD: premium, calm, festive luxury.
   BRAND LOOK: saffron #E8862A, deep red #8E1B1B, cream #F6EBD9, gold #C9A24B.
   FORMAT: 4:5, photoreal studio product photography.
   Avoid: extra text, extra bottles, warped label, plastic look, fingerprints, CGI shine.
   ```
4. Run the same prompt in ChatGPT (GPT Image 2.6) with the same reference. Compare them side by side. **"Same prompt structure, any model."**

**Show on screen:** the reference shooting setup, the prompt broken into 8 coloured parts, the two models compared.

**Common mistakes**
1. A reference shot at an angle in yellow kitchen light.
2. No PRODUCT LOCK line, so the AI "improves" your label.
3. Writing "make it look premium" instead of describing the light and the set.

**Student gets:** `student-kit/skills/product-shot-director/SKILL.md`, `student-kit/workflows/W01-one-photo-to-campaign.md`, `student-kit/prompt-library/images.md`

**Assignment:** Shoot your reference and make 4 packshots.

---

## Lesson 3.2: Lifestyle scenes and backgrounds

Say **"LESSON 3.2"** on camera.

- **Goal:** Put the product into 6 believable real-life places that fit the brand.

**Talking points**
1. **"A lifestyle shot answers one question: where does this product live in my life?"**
2. Use your angle: for "festive glow without the parlour" that means the vanity before a party, a diya-lit dresser, a gift bag.
3. Props tell the story but don't steal it. Keep 3–5 props, all in the brand palette.
4. Scale and contact: the product has to sit on the surface with a real shadow and real reflections.
5. Indian context: marigolds, brass, diyas, rangoli, cotton textures. Specific, not clichéd.

**Live demo**
1. Same chat:
   ```
   Now 6 lifestyle scenes for the angle "festive glow without the parlour": vanity before a Diwali party, diya-lit dresser, gift bag with mithai box, bathroom shelf morning, handbag flat-lay, terrace with fairy lights. 4:5 and 9:16.
   ```
2. Generate "diya-lit dresser" live in Flow with the reference attached.
3. Show the 6 pre-generated scenes as a grid. Point out which ones feel like one brand and which one doesn't, and why.

**Show on screen:** the 6-scene grid, plus a "same brand?" check against the Brand Bible palette.

**Common mistakes**
1. A product floating with no contact shadow.
2. A cluttered set where the product is the 5th thing you notice.
3. Every scene in a different colour story.

**Student gets:** `student-kit/prompt-library/images.md` (lifestyle section)

**Assignment:** Make 6 lifestyle scenes, all in your Brand Bible palette.

---

## Lesson 3.3: Keeping labels, logos and shape accurate

Say **"LESSON 3.3"** on camera.

- **Goal:** Catch and fix product drift every time. This is the pillar that decides whether a client pays you.

**Talking points**
1. **"If the label is wrong, the ad is wrong. The client will notice in one second, and so will Meta's customers."**
2. What drifts: label text, logo shape, cap colour, bottle proportions, fill level, extra dropper parts.
3. The label-lock loop (`workflows/W03-label-lock.md`):
   - **Check** against the reference.
   - **Re-prompt** with an edit instruction (small errors).
   - **Inpaint** only the label area.
   - **Overlay** the real label in post (Canva or Photopea) when the text keeps breaking.
4. **"AI is bad at small text. Don't fight it 20 times. Overlay the real label and move on."**
5. Run the accuracy check before anything goes to a client.

**Live demo**
1. Open the pre-made broken image ("Kesar & Cp.", warped bottle).
2. Attach `skills/product-accuracy-checker/SKILL.md`, upload the reference and the broken image:
   ```
   Check this generated image against the reference product. Give me the check table and verdict.
   ```
3. Show the table: label text ❌, cap ✅, shape ⚠️. Verdict: FIX.
4. Fix 1: an edit prompt in Flow or ChatGPT:
   ```
   Edit this image. Keep everything the same, but replace the bottle with the exact product from the reference image: label text "Kesar & Co. Saffron Glow Serum", same proportions, same gold cap. Do not change the background or lighting.
   ```
5. Fix 2 (if it is still wrong): in Photopea or Canva, cut the real label from the reference and warp it onto the bottle. Add a slight blur and a shadow match. 60 seconds.
6. Re-run the checker. Verdict: SHIP.

**Show on screen:** the reference and the broken image side by side with circles on the errors, the before/after of the fix.

**Common mistakes**
1. Checking only at thumbnail size. Always zoom to 100%.
2. Regenerating the whole scene when only the label is broken.
3. Shipping "close enough". Close enough is wrong.

**Student gets:** `student-kit/skills/product-accuracy-checker/SKILL.md`, `student-kit/workflows/W03-label-lock.md`

**Assignment:** Run the accuracy checker on all 10 of your images. Fix every FIX.

---

## Lesson 3.4: E-commerce listing images

Say **"LESSON 3.4"** on camera.

- **Goal:** A complete 6-image listing set for Amazon, Flipkart, Nykaa or Shopify.

**Talking points**
1. Listings follow rules, ads follow taste. Know the difference.
2. The 6-image set:
   1. **Main:** pure white background, product fills most of the frame, no text.
   2. **Infographic:** 3 key benefits with icons.
   3. **Ingredients / what's inside.**
   4. **Scale:** in hand or next to a known object.
   5. **How to use:** 3 steps.
   6. **Lifestyle:** the product in use.
3. **"Marketplace main images have strict rules. Check the current marketplace guidelines before you upload."**
4. Text on infographics: generate the image without text, then add text in Canva. That keeps the type sharp and correct.

**Live demo**
1. `product-shot-director`:
   ```
   Make a 6-image e-commerce listing set for Kesar & Co. serum. Give prompts for each image without text, and give me the text to add on top separately.
   ```
2. Generate the main white image live with the reference.
3. Show the finished pre-made 6-image set laid out like a product page.

**Show on screen:** a real listing layout (brand names blurred), then your 6-image set in the same layout.

**Common mistakes**
1. AI-generated text on infographics, which comes out misspelled.
2. A main image with props or a coloured background, which gets rejected.
3. A scale shot without anything to show the scale.

**Student gets:** `student-kit/prompt-library/images.md` (e-commerce section), `student-kit/workflows/W01-one-photo-to-campaign.md`

**Assignment:** Make your 6-image listing set. Text gets added in Canva, not by AI.

---

## Wrap-up

> "One phone photo became 4 packshots, 6 lifestyle scenes and a full listing, and the label is right in every one. **Next lecture we add people: consistent AI models, styling, Indian skin tones and any set you can imagine.**"

## Edit notes for Claude

- Cold open: a slow wipe from the phone photo to the gold-podium packshot.
- 3.1: show the 8 parts of the prompt as coloured highlights. Show the Nano Banana 1.1 and GPT Image 2.6 results as a side-by-side split.
- 3.2: a 6-up grid, with a red outline on the off-brand scene.
- 3.3: red circles on the label errors. Zoom to 200% on the label. Before/after wipe.
- 3.4: a mock product-page layout. Blur any real brand names.
- Cut every "RETAKE" back to the previous pause. Speed up waiting-for-generation moments to 4x with a small "generating…" tag.

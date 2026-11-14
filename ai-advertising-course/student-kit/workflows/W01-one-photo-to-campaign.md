# W01: One Product Photo → Full Campaign Image Set

**Goal:** Turn one good phone photo of your product into a full set: studio packshots, lifestyle scenes,
festive images and e-commerce images, all with the real label intact.
**Time:** 60–90 minutes · **Used in:** Lecture 3

**Tools + models:** Google Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6) · Claude / ChatGPT / Gemini
with skills · any photo editor for cleanup (optional)
**Skills:** `product-shot-director`, `product-accuracy-checker`
**Inputs:** your product, a phone, a window, a white sheet of paper; your Brand Bible (LOOK BLOCK)

---

## Steps

**1. Shoot the reference photo** → *Phone*
- Put the product on white paper next to a window (soft daylight, no direct sun). Phone at product height.
- Shoot front (label straight on), 3/4 left, 3/4 right, back, top. Clean the product first.
- **Output:** 5 sharp photos in `01-reference/`.
- **Check:** label fully readable when zoomed in; no reflections over text.

**2. Type out the label** → *Notes*
- Write every word on the label exactly ("KESAR & CO." / "Saffron Glow" / "Face Serum" / "30 ml").
- **Output:** label text in your Brand Bible. **Check:** spelling matches the product letter by letter.

**3. Plan the set** → *Claude / ChatGPT / Gemini* + `product-shot-director`
- Upload the front photo + Brand Bible. Ask: "Plan 12 images for my campaign: 4 packshots, 4 lifestyle, 2 festive, 2 e-commerce. Give me a copy-ready prompt for each."
- **Output:** 12 prompts using the 8-part formula. **Check:** every prompt has a PRODUCT LOCK line and the LOOK BLOCK.

**4. Make the hero packshot first** → *Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6)*
- Upload the front reference photo as the image reference. Paste prompt 1. Make 2–4 takes.
- **Output:** 1 approved hero packshot. **Check:** run step 5 before you make anything else.

**5. Check accuracy** → *Claude / ChatGPT / Gemini* + `product-accuracy-checker`
- Upload the reference photo + the generated image. Get SHIP / FIX / REGENERATE.
- **Output:** a verdict + fixes. **Check:** only SHIP images go to `02-images/`. Use `W03-label-lock.md` for FIX.

**6. Make the other 11 images** → *Flow or ChatGPT*
- Use the approved hero packshot as an extra reference (it keeps the look the same).
- Change only the set and props from prompt to prompt; keep light, grade and LOOK BLOCK the same.
- **Output:** 11 images. **Check:** run `product-accuracy-checker` on each.

**7. Make e-commerce versions** → *Flow or ChatGPT*
- Pure white background (#FFFFFF), product fills 85% of the frame, square 1:1, plus 1 infographic and 1 scale shot (in hand).
- **Output:** listing set. **Check:** marketplace specs (Amazon/Flipkart/Shopify) for size and background.

**8. Export and name** → *File manager*
- Name: `KESAR_DIWALI_PACK_S01_STATIC_4x5_v01.png` etc. Keep the prompt for each image in a text file next to it.
- **Output:** a clean, named set in `02-images/`.

---

## Finished-output checklist
- [ ] 4 packshots, 4 lifestyle, 2 festive, 2 e-commerce images
- [ ] Every image passed `product-accuracy-checker`
- [ ] Same light direction, colour grade and palette across all
- [ ] Files named with the naming rule; prompts saved
- [ ] Hero packshot ready to be the start frame for video (`W04`)

# W03: Label Lock (Product Accuracy QA Loop)

**Goal:** Make sure the product in every AI image and video is the real product: correct label text,
logo, shape, cap and colours. This is the most important quality check in the course.
**Time:** 5–15 minutes per image · **Used in:** Lecture 3 and every lecture after

**Tools + models:** Flow (Nano Banana 1.1) / ChatGPT (GPT Image 2.6) for edits · any editor that supports
layers (Photopea free, Canva, Photoshop) for the overlay fix
**Skills:** `product-accuracy-checker`
**Inputs:** reference photos, exact label text, generated image

---

## Steps

**1. Check** → *AI chat* + `product-accuracy-checker`
- Upload reference + generated image. Get the element table and a verdict.
- **Output:** SHIP / FIX / REGENERATE.

**2. If SHIP** → move the image to `02-images/`. Done.

**3. If FIX (1–2 small errors): edit in the image tool** → *Flow or ChatGPT*
- Upload the generated image AND the reference photo. Ask for a targeted edit:
```
Edit only the bottle label. Make it match the reference photo exactly: the wordmark reads "KESAR & CO." in saffron-red serif capitals, below it "Saffron Glow" and "Face Serum", bottom "30 ml". Keep everything else in the image exactly the same: light, background, angle, bottle shape.
```
- **Check:** run step 1 again.

**4. If text is still wrong after 2 tries: overlay the real label** → *Photopea / Canva / Photoshop*
- Cut the label from your reference photo. Place it on the AI bottle. Use "warp" or "perspective" to fit the curve.
- Match light: add a soft gradient shadow on the label edge and lower the label brightness to match.
- **Output:** perfect label. **Check:** zoom to 200%, edges blend, no halo.

**5. If REGENERATE (shape or product wrong)** → *Flow or ChatGPT*
- Go back to the prompt. Strengthen the PRODUCT LOCK:
```
PRODUCT LOCK: use the exact product from the reference image. Same amber glass bottle shape, same gold dropper cap, same cream label with the same text and layout. Do not redesign, do not add or remove text, do not change the proportions.
```
- Use a cleaner, larger reference photo. Make the product bigger in the frame. Simple sets work better than busy ones.

**6. For video** → *Flow*
- Always start video from a SHIP image (Frames to Video). Add to the video prompt: "label stays sharp and readable, product does not change shape".
- Check the first, middle and last frame. If the label melts during motion: use slower camera moves, shorter clips, or cut away before it melts.

---

## Finished-output checklist
- [ ] Every final image/video checked against the reference
- [ ] Label text correct letter by letter
- [ ] Logo, cap, shape, colours correct
- [ ] No extra products, extra text or fake badges
- [ ] Fix method noted (prompt edit / overlay) for your records

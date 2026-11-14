# W02: Consistent AI Model (Character Sheet)

**Goal:** Create one made-up person who looks the same in every image and video: your brand model,
UGC creator or ambassador.
**Time:** 45–60 minutes · **Used in:** Lectures 4 and 7

**Tools + models:** Google Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6) · Claude / ChatGPT / Gemini
**Skills:** `model-and-set-director`
**Inputs:** `templates/ambassador-bible.md` (filled), Brand Bible

---

## Steps

**1. Describe the person** → *AI chat* + `model-and-set-director`
- Paste your ambassador bible. Ask for a CHARACTER BLOCK and a character-sheet prompt.
- **Output:** a CHARACTER BLOCK (one paragraph). **Check:** includes exact skin tone, texture, face details, hair and one signature detail (e.g. a nose stud). Made-up person only.

**2. Make the front portrait** → *Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6)*
```
Front-facing passport-style portrait of [CHARACTER BLOCK]. Plain warm-grey background, soft even studio light, neutral expression, looking straight at camera, shoulders visible. Camera: 85mm, f/4, sharp focus on eyes. Real skin texture with visible pores, no beauty filter. Format: 1:1. Avoid: plastic skin, heavy makeup, lighter skin than described, celebrity likeness.
```
- Make 4 takes. Pick the one you like most. This is the **master face**.
- **Check:** skin tone is what you wrote (AI often lightens Indian skin, so fix it in the prompt and say "do not lighten the skin").

**3. Make the character sheet** → *Same tool, master face as reference*
```
Character sheet of the same woman as the reference image: same face, same skin tone, same hair. One image, 5 views in a row on a plain warm-grey background: front face, 3/4 left, 3/4 right, profile, full body standing. Wearing [everyday outfit]. Soft even studio light. Real skin texture. Format: 16:9. Avoid: changing the face between views, different hairstyles, lighter skin.
```
- **Output:** 1 sheet. **Check:** the face matches in all 5 views. If not, regenerate.

**4. Make expressions** → *Same tool*
- Smile, laughing, talking mid-word, surprised, thinking. One image each, master face as reference.
- **Output:** 5 expression images (needed for UGC and talking shots).

**5. Test in a scene** → *Same tool*
- Put her in 2 brand sets (e.g. bedroom mirror, Diwali terrace) with the CHARACTER BLOCK + LOOK BLOCK.
- **Check:** compare side by side with the master face. Same person? Same skin tone?

**6. Save the kit** → *Folder* `01-reference/model/`
- master face, sheet, expressions, CHARACTER BLOCK text.
- **Output:** a model kit you attach every time this person appears.

---

## Finished-output checklist
- [ ] Master face + 5-view sheet + 5 expressions
- [ ] CHARACTER BLOCK saved in the Brand Bible / ambassador bible
- [ ] Skin tone and features consistent in 2 test scenes
- [ ] Person is made up (no real-person likeness)
- [ ] Disclosure line written for when she appears in ads

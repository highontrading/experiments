# W05: Multi-Shot Campaign Film

**Goal:** Make a 15–30 second film with 5–8 shots that feel like one shoot: same model, same set, same
light, one story.
**Time:** 3–5 hours · **Used in:** Lecture 5 (built), Lecture 9 (edited), Lecture 11 (capstone)

**Tools + models:** Google Flow (Google Omni Flash 1.2) · Nano Banana 1.1 / GPT Image 2.6 · ElevenLabs ·
Suno · Claude with the `vibe-editor` skill (or CapCut)
**Skills:** `hook-and-script-writer`, `video-ad-director`, `model-and-set-director`, `product-accuracy-checker`, `vibe-editor`
**Inputs:** brief, Brand Bible, model kit (`W02`), product images (`W01`)

---

## Steps

**1. Script + storyboard** → *AI chat* + `hook-and-script-writer`
- Get a 15s or 30s script and a 6-frame storyboard with image + video prompts.
- **Check:** one idea, one emotion, hook in the first 2 s, product visible by second 6.

**2. Shot list** → `templates/shot-list.md`
- Fill continuity notes (product, model, outfit, set, light direction, grade).
- **Check:** every shot has a start-frame file name.

**3. Make all start frames first** → *Flow (Nano Banana 1.1) / ChatGPT (GPT Image 2.6)*
- Use the model kit + product hero image as references in every frame. Paste the CHARACTER BLOCK and LOOK BLOCK in every prompt.
- Put all 6 frames side by side. **Check:** do they look like one shoot? Fix the odd one before any video.

**4. Generate the shots** → *Flow (Google Omni Flash 1.2)*, follow `W04` for each shot
- Mix shot sizes: wide → medium → close → macro. Vary camera moves, but keep the speed similar.
- **Check:** product accuracy + same person in every shot.

**5. Sound** → *ElevenLabs + Suno* (see `W07`)
- VO from the script, music at the right length and BPM, 3–4 SFX for key moments.

**6. Edit** → *Claude* + `vibe-editor` (or CapCut)
- Vibe prompt: "30s Reel, warm and premium, cut on the beat, cream captions, end on the bottle and logo."
- Follow the 5 steps: Dump → Vibe → Beat → Layer → Sound. Then give max 3 director notes.

**7. Grade check** → *Your eyes*
- Watch muted, then with sound. Any shot that "jumps" in colour or light? Ask `vibe-editor` to match the grade.

---

## Finished-output checklist
- [ ] 5–8 shots, one story, one look
- [ ] Same model face, outfit and product in every shot
- [ ] Hook in first 2 s, product by 6 s, CTA end card
- [ ] VO, music and SFX mixed (VO clear over music)
- [ ] Exported 9:16 (and 4:5 if needed) at Meta specs

# W06: AI UGC Video Pipeline

**Goal:** Make a creator-style ad (review, GRWM, unboxing, try-on) that feels native to Reels: handheld,
real, talking to the camera.
**Time:** 2–3 hours · **Used in:** Lectures 6 and 7

**Tools + models:** Google Flow (Google Omni Flash 1.2) · Nano Banana 1.1 / GPT Image 2.6 · ElevenLabs
(if you need a separate VO) · Claude with `vibe-editor` + `vibe-captions-and-endcards`
**Skills:** `ugc-ad-director`, `model-and-set-director`, `sound-director`, `vibe-editor`, `vibe-captions-and-endcards`
**Inputs:** product images, creator kit (`W02` + `templates/ambassador-bible.md`), brief

---

## Steps

**1. Pick the format** → *AI chat* + `ugc-ad-director`
- Review · GRWM · unboxing · try-on haul · "3 reasons" · reply-to-comment.
- **Output:** a 15–30s script in the creator's own voice (Hinglish if it fits), split into 4–6 short takes.
- **Check:** sounds like talking, not like an ad. Short sentences. One real-feeling flaw or joke.

**2. Make creator frames** → *Flow / ChatGPT*
- Phone-camera look: "shot on a phone front camera, slightly high angle, natural room light, slight grain, real messy-but-clean bedroom". Creator holds the real product (product reference + model kit).
- **Check:** product accurate in her hand; she looks like the master face.

**3. Generate talking takes** → *Flow (Google Omni Flash 1.2)*
- Prompt each take with the exact line she says, in quotes, plus "handheld phone selfie, small natural movements, lip-sync to the line".
- Keep each take 4–8 s. Short takes look more real and fail less.
- If lip-sync fails: use a B-roll shot + voiceover instead, or a shot where her mouth isn't the focus.

**4. Add B-roll** → *Flow*
- Product close-ups in her hand, applying the product, the "result" moment, the box opening.

**5. Edit** → *Claude* + `vibe-editor` + `vibe-captions-and-endcards`
- Vibe prompt: "20s Reel, UGC style, fast jump cuts, no fancy transitions, word-by-word white captions with black outline, end on product in hand + CTA."
- **Check:** no "ad-looking" grade; keep it natural.

**6. Disclosure + policy** → *AI chat* + `ad-policy-check`
- It must not pretend to be a real customer. Add the AI-character line where needed.

---

## Finished-output checklist
- [ ] Hook in the first 1.5 s (face + words on screen)
- [ ] 4–6 short takes + 2–4 B-roll shots
- [ ] Voice sounds human, captions word-by-word
- [ ] Product label correct in every shot
- [ ] Disclosure handled; no fake "real customer" claims

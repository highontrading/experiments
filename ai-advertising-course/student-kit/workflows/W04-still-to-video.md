# W04: Still → Video Ad

**Goal:** Turn your approved images into short, smooth video shots with camera movement and sound, ready
to edit into an ad.
**Time:** 45–90 minutes · **Used in:** Lecture 5

**Tools + models:** Google Flow (Google Omni Flash 1.2) · Claude / ChatGPT / Gemini
**Skills:** `video-ad-director`, `product-accuracy-checker`
**Inputs:** approved start-frame images (from `W01`/`W02`), script + storyboard

---

## Steps

**1. Pick the start frames** → *Folder*
- One approved image per shot. If you want the shot to end somewhere specific, make an end frame too (same set, different angle or moment).
- **Check:** every frame passed `product-accuracy-checker`.

**2. Write the video prompts** → *AI chat* + `video-ad-director`
- Upload the start frame + storyboard row. Ask for a Flow prompt using the 7-part formula.
- **Output:** 1 prompt per shot. **Check:** one camera move per shot, duration set, CONSISTENCY line included.

**3. Generate** → *Flow, Frames to Video, Google Omni Flash 1.2*
- Upload start frame (and end frame if you have one). Paste the prompt. Make 2–3 takes.
- Use whichever mode your Flow version shows: Frames to Video for product shots, Ingredients / reference to Video when you need the product + a person + a set together.
- **Output:** takes in `03-video/_takes/`.

**4. Review each take** → *Your eyes*
- Watch 3 times: once for feeling, once for the product (label, shape), once for errors (hands, faces, physics, flicker).
- **Check:** pick the best take; note the usable seconds (e.g. "use 0.5–3.5 s").

**5. Fix or redo** → *Flow*
- Label melting → slower move, shorter shot. Weird hands → hide hands or crop. Too fast → add "slow, smooth, gentle".
- Use Extend if a good shot is too short.

**6. Save** → *Folder* `03-video/`
- Name: `KESAR_DIWALI_GLOW_S03_FILM_9x16_v01.mp4`. Save the prompt as a .txt next to it.

---

## Finished-output checklist
- [ ] One approved clip for every storyboard shot
- [ ] Product correct in first, middle and last frame
- [ ] Camera moves smooth and purposeful
- [ ] Usable in-out points noted for the edit
- [ ] Clips and prompts saved and named

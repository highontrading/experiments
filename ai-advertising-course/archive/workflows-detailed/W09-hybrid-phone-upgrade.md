# W09: Hybrid: Upgrade a Phone Shoot with AI

**Goal:** Shoot the parts that must be real (hands, texture, real people, food) on your phone, then use AI
to upgrade sets, add impossible shots and finish it like a premium ad.
**Time:** 1 hour shoot + 2–3 hours AI and edit · **Used in:** Lecture 10

**Tools + models:** your phone · Flow (Nano Banana 1.1, Google Omni Flash 1.2) or ChatGPT (GPT Image 2.6) ·
Claude with `vibe-editor`
**Skills:** `hybrid-ad-director`, `video-ad-director`, `vibe-editor`, `product-accuracy-checker`
**Inputs:** product, phone, window light, simple props, script

---

## Steps

**1. Decide shoot vs generate** → *AI chat* + `hybrid-ad-director`
- Give it your script. It marks each shot: SHOOT (real hands using the product, real texture, real food, real people talking) or GENERATE (sets, scale, CGI, locations, slow-motion splashes).
- **Output:** phone shot list + AI shot list.

**2. Shoot on your phone** → *Phone*
- Lock exposure and focus. 4K 30fps if possible. Window light from the side. Plain background (so AI can replace it).
- Shoot each shot 3 times. Hold still 2 s before and after the action (gives clean edit points).
- **Check:** product label sharp and readable in key shots.

**3. Upgrade stills from your shoot** → *Flow / ChatGPT*
- Take the best frame from a phone clip, ask for a new set and light while keeping the product and hands:
```
Keep the hands and the product exactly as in the reference photo, same pose, same label. Replace the background with a warm cream silk set with brass diyas and marigold petals, golden-hour side light from the left. Match the light on the hands to the new set. Format: 9:16. Avoid: changing the hands, changing the label, extra fingers.
```
- Use the upgraded frame as the start frame for an AI clip (`W04`) if you want motion.

**4. Generate the impossible shots** → *Flow (Google Omni Flash 1.2)*
- Giant product, saffron storm, flying through a jharokha window: the shots no phone can do.

**5. Match the look** → *Claude* + `vibe-editor`
- "Match the colour of the phone clips to the AI clips: warm, slightly lifted blacks, same saturation. Add light film grain to all clips so real and AI shots blend."
- **Check:** watch real → AI → real. Nothing should "jump".

**6. Edit + sound** → *Claude* + `vibe-editor` (5 steps)

---

## Finished-output checklist
- [ ] Real shots used where trust matters (hands, texture, people)
- [ ] AI shots used for sets, scale and wow moments
- [ ] Grade and grain matched across real and AI
- [ ] Product accurate in every shot
- [ ] Before/after saved for your portfolio

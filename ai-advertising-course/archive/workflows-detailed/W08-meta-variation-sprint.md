# W08: Meta Variation Sprint (1 idea → 10 ads → launch → learn)

**Goal:** Take one approved concept, make 10 smart variations in every ratio, launch a clean test in Meta
Ads Manager, and use the results to make the next round.
**Time:** 3–4 hours to build + 3–7 days of testing · **Used in:** Lecture 8

**Tools + models:** Flow (Nano Banana 1.1 / Google Omni Flash 1.2) or ChatGPT (GPT Image 2.6) · Claude with
`vibe-editor` · Meta Ads Manager
**Skills:** `meta-ad-variations`, `vibe-editor`, `vibe-captions-and-endcards`, `ad-policy-check`, `ad-performance-analyst`
**Inputs:** approved concept, master assets (hero image, hero video), Brand Bible, hook bank

---

## Steps

**1. Build the matrix** → *AI chat* + `meta-ad-variations`
- Give it the concept + 5 hooks. Get a 10-row matrix with file names (`templates/variation-matrix.md`).
- **Check:** each variation changes only 1–2 things; test groups make sense (hooks vs hooks first).

**2. Make the new pieces** → *Flow / ChatGPT*
- Only make what's new: new hook openings (2–3 s clips), new static backgrounds, new offer cards.
- **Check:** product accuracy on all new pieces.

**3. Assemble** → *Claude* + `vibe-editor`
- "Make 4 versions of the master video, each with a different opening: hook_01.mp4 … hook_04.mp4. Keep everything after 3 s the same."

**4. Every ratio** → *Claude* + `vibe-editor` / image tool
- Video: reframe 9:16 → 4:5 and 1:1 (smart crop or blurred background).
- Statics: outpaint/regenerate to 4:5, 1:1, 9:16, 1.91:1 instead of stretching.
- **Check:** safe zones (9:16: no text in the top ~14% or bottom ~20%); logo and CTA fully visible.

**5. Captions + end cards** → *Claude* + `vibe-captions-and-endcards`
- **Check:** works on mute.

**6. Policy check** → *AI chat* + `ad-policy-check` + `templates/policy-checklist.md`

**7. Launch** → *Meta Ads Manager*
- 1 campaign (Sales). Ad set per test group. Same audience and budget across test ad sets.
- Upload the 9:16 + 4:5 (+1:1) versions as one ad with placement asset customisation.
- Advantage+ creative enhancements: turn ON only the ones that keep your brand look; turn OFF ones that change your image or text (check each option shown).
- **Check:** UTM links, Pixel / Conversions API events working.

**8. Read and iterate** → *Ads Manager export (CSV)* + `ad-performance-analyst`
- After 3+ days (enough impressions), upload CSV + `templates/test-log.md`.
- **Output:** what to kill, keep, scale, and 5 new variations for round 2.

---

## Finished-output checklist
- [ ] 10 variations named with the naming rule
- [ ] Every ad in 9:16 + 4:5 (+1:1 if feed-heavy)
- [ ] Captions + end card on every video
- [ ] Policy checklist passed
- [ ] Test set up with one variable per test and a win rule
- [ ] Round-2 plan written from real numbers

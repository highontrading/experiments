# Lecture 08: Meta ads, statics, variations and testing

- **Target raw length:** 50–60 min (4 lessons of 11–16 min)
- **Lessons covered:** 8.1 Every ratio from one concept · 8.2 10 variations from one idea · 8.3 Advantage+ creative tools · 8.4 Reading results and iterating
- **Level:** 3 (The agency standard)

## Before you hit record

- **Tabs open:** Meta Ads Manager (a test ad account; **don't publish, don't spend**), Google Flow (Nano Banana 1.1 for reframing/outpainting), ChatGPT (GPT Image 2.6), Claude, Canva.
- **Files open:** `workflows/W08-meta-variation-sprint.md`, `templates/variation-matrix.md`, `templates/test-log.md`.
- **Skills ready:** `skills/meta-ad-variations/SKILL.md`, `skills/ad-performance-analyst/SKILL.md`, `skills/vibe-editor/SKILL.md`, `skills/ad-policy-check/SKILL.md`.
- **Data ready:** a sample Ads Manager export CSV with 10 Kesar ads and realistic numbers, clearly a demo. If you use a real account, blur the account name and ID.
- **Pre-generate:**
  - The Kesar gold-podium concept in 9:16, 4:5, 1:1 and 1.91:1.
  - 10 variation statics (grid-ready).
  - The 15s video in 9:16 + 4:5 + 1:1.
  - 9:16 safe-zone overlay PNG (top ~14% and bottom ~20% shaded).

## Cold open (30–60s)

Show a grid of 10 Kesar ads from one idea.

> **"Meta doesn't want one perfect ad. It wants fresh creative, every week. This is how you give it ten ads from one idea, in one afternoon, and then let the numbers tell you which one wins."**

---

## Lesson 8.1: Every ratio from one concept

Say **"LESSON 8.1"** on camera.

- **Goal:** One concept delivered in 9:16, 4:5, 1:1 and 1.91:1 without awkward crops.

**Talking points**
1. The four placements:
   - **9:16 (1080x1920):** Reels and Stories.
   - **4:5 (1080x1350):** feed.
   - **1:1 (1080x1080):** feed, some placements.
   - **1.91:1 (1200x628):** link ads and the right column.
2. **"Design for 9:16 first. That's where most attention is now."**
3. Safe zone for 9:16: keep text and logos out of the top ~14% and the bottom ~20%, where the UI covers them.
4. Don't just crop. **Outpaint/reframe** so the composition works in each ratio.
5. File naming: `KESAR_DIWALI_GLOW_H03_STATIC_9x16_v01`.

**Live demo**
1. Attach `skills/meta-ad-variations/SKILL.md`:
   ```
   Take this Kesar gold-podium concept (attached, 4:5) and give me reframe/outpaint prompts for 9:16, 1:1 and 1.91:1, plus where the headline and logo go in each, respecting the 9:16 safe zone.
   ```
2. In Flow (Nano Banana 1.1) or ChatGPT (GPT Image 2.6), outpaint 4:5 → 9:16:
   ```
   Extend this image to 9:16 vertical. Add more saffron backdrop above and more gold podium and floor reflection below. Keep the bottle, label, podium and lighting exactly the same. No new objects, no text.
   ```
3. Lay the safe-zone overlay on the 9:16 version. Put the headline in Canva inside the safe area.
4. Video: with `vibe-editor`:
   ```
   Reframe this 9:16 video to 4:5 and 1:1. Keep the bottle centred. For 1:1 use a blurred background fill if needed. Export all three.
   ```

**Show on screen:** the 4 ratios side by side, the safe-zone overlay.

**Common mistakes**
1. Text under the Reels UI, where nobody can read it.
2. Center-cropping a 16:9 video to 9:16 and cutting the product off.
3. Different headlines in each ratio, which breaks the test.

**Student gets:** `student-kit/skills/meta-ad-variations/SKILL.md`, `student-kit/workflows/W08-meta-variation-sprint.md`

**Assignment:** Deliver one concept in all 4 ratios, safe zones respected.

---

## Lesson 8.2: 10 variations from one idea

Say **"LESSON 8.2"** on camera.

- **Goal:** A variation matrix that turns one idea into 10 testable ads.

**Talking points**
1. **"A variation changes ONE thing, so you learn something."**
2. What you can vary (`templates/variation-matrix.md`):
   - **Hook** (H01–H05 from Lecture 2).
   - **Visual** (packshot / lifestyle / model / UGC / CGI).
   - **Offer** (free mini / ₹899 / gift angle).
   - **Format** (static / video / carousel).
3. A smart 10: 5 hooks × the same visual, then the best hook × 5 visuals.
4. Keep the brand constant: the same palette, type, logo and end card.
5. **"Volume with discipline. Ten random ads teach you nothing. Ten planned ads teach you what your customer wants."**

**Live demo**
1. `meta-ad-variations`:
   ```
   Build a 10-ad variation matrix for Kesar & Co. Diwali from hooks H01–H05 and our visuals (packshot, lifestyle, Meera, Riya UGC, CGI rooftop). Give me the matrix table, what each ad tests, file names, headline + primary text for each, and image prompts for any visual I don't have yet.
   ```
2. Show the matrix table, then the 10 pre-made statics as a grid that matches it.
3. Run the copy through `ad-policy-check` quickly:
   ```
   Check all 10 headlines and primary texts for Meta India policy.
   ```

**Show on screen:** the matrix table, the 10-ad grid with labels (H01-PACK, H02-PACK…).

**Common mistakes**
1. Changing the hook, visual and offer all at once.
2. Messy file names, so you can't read the results later.
3. Ten ads that all look the same in the feed.

**Student gets:** `student-kit/templates/variation-matrix.md`

**Assignment:** Make your 10-ad matrix and produce at least 6 of the ads.

---

## Lesson 8.3: Advantage+ creative tools

Say **"LESSON 8.3"** on camera.

- **Goal:** Set up the ads in Ads Manager and choose which automatic enhancements to allow.

**Talking points**
1. Meta's Advantage+ creative can auto-adjust your ads: brightness, crops, music, text variations, backgrounds and more. **The exact options change often, so check what your Ads Manager shows today.**
2. **"Some enhancements help reach. Some break your brand. You decide, not the algorithm."**
3. A simple rule:
   - Turn ON the safe ones (e.g., standard enhancements that don't change your product or your claims).
   - Turn OFF anything that rewrites your text, changes the product image or adds music to an ad that already has a brand jingle.
4. Always preview every placement before publishing.
5. The AI disclosure and label setting, if it's shown for your ad: follow `templates/policy-checklist.md`.
6. Campaign structure for a small test: 1 campaign, 1 ad set (broad audience, Advantage+ audience if available), 5–10 ads, an equal chance to spend.

**Live demo**
1. In Ads Manager (test account): create a Sales campaign → ad set → ad. **Don't publish.**
2. Upload the 9:16 + 4:5 + 1:1 versions to one ad using placement asset customisation.
3. Open the creative enhancements panel and go through each toggle, saying keep or turn off and why.
4. Preview Reels, Stories and Feed.

**Show on screen:** the Ads Manager screens (blur the account IDs), the placement previews.

**Common mistakes**
1. Leaving every enhancement on, so the label gets cropped and the music fights the jingle.
2. One ratio for all placements.
3. Publishing without previewing Reels.

**Student gets:** `student-kit/workflows/W08-meta-variation-sprint.md` (Ads Manager checklist section), `student-kit/templates/policy-checklist.md`

**Assignment:** Build your campaign in Ads Manager up to preview. Screenshot your enhancement settings.

---

## Lesson 8.4: Reading results and iterating

Say **"LESSON 8.4"** on camera.

- **Goal:** Read the 5 numbers that matter, then plan round 2 with AI.

**Talking points**
1. The 5 numbers:
   - **Hook rate:** 3-second video plays ÷ impressions. Does the first frame stop people?
   - **Hold rate:** ThruPlays (or 15s views) ÷ 3-second plays. Does the middle keep them?
   - **CTR (link):** does the ad make people click?
   - **CPA / cost per purchase:** does it make money?
   - **Frequency:** is the audience getting tired of it?
2. Diagnose with the pattern:
   - Low hook rate → **fix the first 2 seconds.**
   - Good hook, low hold → **fix the middle.**
   - Good hold, low CTR → **fix the offer/CTA.**
   - Good CTR, bad CPA → **fix the landing page or price, not the ad.**
3. **"Give it enough data before you judge."** Don't kill ads after a few hours.
4. Round 2: keep the winner, make 3–5 new variations of the winning element, kill the losers.
5. Log everything in `templates/test-log.md`. Over time this log becomes the most valuable thing you own.

**Live demo**
1. Ads Manager → Reports → export CSV (or use the demo CSV).
2. Attach `skills/ad-performance-analyst/SKILL.md`, upload the CSV:
   ```
   Analyse this Kesar Diwali test. Rank the ads, diagnose each with hook rate, hold rate, CTR, CPA and frequency, tell me what won and why, and plan round 2: 5 new variations with briefs.
   ```
3. Show the output: H03-UGC wins on hook rate, H01-PACK has good CTR but a weak hold. Round 2 plan.
4. Paste the summary into `templates/test-log.md`.

**Show on screen:** the 5-numbers cheat sheet, the analyst's ranking table, the round-2 plan.

**Common mistakes**
1. Judging by likes and comments.
2. Changing the ad mid-test.
3. Blaming the creative when the landing page is the problem.

**Student gets:** `student-kit/skills/ad-performance-analyst/SKILL.md`, `student-kit/templates/test-log.md`

**Assignment:** Run the analyst on your results, or on the demo CSV if you're not live yet. Plan round 2.

---

## Wrap-up

> "You can now feed Meta the fresh creative it wants and read what it tells you back. **Next lecture is my favourite: vibe editing. You'll edit your ads just by telling Claude what you want: cuts, captions, end cards, all of it.**"

## Edit notes for Claude

- Cold open: build the 10-ad grid one tile at a time.
- 8.1: show the 4 ratios as an animated morph. Overlay the safe zone with a red tint.
- 8.2: highlight one column at a time in the matrix to show "one change per ad".
- 8.3: **blur every account name, ID, payment info and email** in Ads Manager. Zoom on each toggle.
- 8.4: a 5-numbers cheat sheet card. Highlight the winning row in green.
- Cut every "RETAKE" back to the previous pause. Remove dead air over 1.2s.

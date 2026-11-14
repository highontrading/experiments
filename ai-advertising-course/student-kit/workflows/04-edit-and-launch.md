# Workflow 04: Edit and Launch
> You end with finished 15s and 30s ads, with captions and an end card in 3 ratios, live on Meta, and a plan for the next round.

| Time | Skill to attach | Tools | Modules |
|---|---|---|---|
| 2–3 hours (plus 3–7 days of ads running) | `vibe-editor`, then `ad-strategist` | Claude (or ChatGPT / Gemini), ffmpeg or CapCut, Meta Ads Manager | 8, 9 |

## You need
- Your video clips from Workflow 03 (plus voice-over, music, logo PNG)
- Your `brand-bible.md` (colours, fonts, CTA)
- ffmpeg installed for full auto editing (or CapCut as a backup)
- A Meta ad account with a small test budget

## Steps

### Step 1 · Dump everything in one folder
**Tool:** your computer · **You get:** one folder the AI can read
Put all clips, the music, the voice-over and the logo in `05_edit/`. Don't trim and don't sort.
**Type this:**
```text
Look at every file in 05_edit/. Give me a table: length, ratio, audio yes/no, best moment in each clip.
```
**Check:** every clip is listed, and any bad clip (warped label, frozen start) is flagged.

### Step 2 · Type the vibe
**Tool:** Claude + `vibe-editor` · **You get:** an edit plan, then version 1 of the ad
Use the formula: platform + length + energy + look + goal.
**Type this:**
```text
30s Reel, high energy, warm saffron look, cut on every 2nd beat, hook = serum drop on skin in the first second, end on the bottle. Show me the edit plan first.
```
**Check:** the plan has a hook in the first 1–2 seconds and the product is shown at least 3 times.

### Step 3 · Give director notes
**Tool:** Claude + `vibe-editor` · **You get:** version 2 (and 3)
Watch it on your phone. Give 3 notes at most per round.
**Type this:**
```text
Director notes v01: 1) start on the drop, not the bottle, 2) less orange, 3) make a 15s cutdown too.
```
**Check:** each note is fixed, and nothing else changed.

### Step 4 · Add captions and an end card
**Tool:** Claude + `vibe-editor` · **You get:** captioned ad with a branded ending
**Type this:**
```text
Add captions from my voice-over: 3 words at a time, white with outline, current word in saffron #E8862A. Add a 3s end card: cream background, logo, "Shop now · kesarandco.in". Show me the captions to proofread first.
```
**Check:** brand name and price spelled right; captions stay out of the top 14% and bottom 20%.

### Step 5 · Export 3 ratios
**Tool:** Claude + `vibe-editor` · **You get:** files ready for Meta
**Type this:**
```text
Export 9:16, 4:5 and 1:1 of the 30s and 15s ads for Meta. Keep the label in frame. Name them KESAR_DIWALI_GLOW_H01_FILM_<ratio>_v03.
```
**Check:** 6 files, each plays from the start, sound about -14 LUFS.

### Step 6 · Launch on Meta
**Tool:** Claude + `ad-strategist`, then Meta Ads Manager · **You get:** a live test
**Type this:**
```text
Make a launch and test plan for these 6 ads: campaign setup, budget for a 5-day test, what to compare, AI disclosure check, and the upload checklist.
```
**Check:** policy and AI-disclosure checks are done before you hit publish.

### Step 7 · Read results and plan the next round
**Tool:** Meta Ads Manager export + `ad-strategist` · **You get:** keep / kill / scale list + new ad ideas
After 3–7 days, export the results as a CSV.
**Type this:**
```text
Here are my results (CSV attached). Tell me which ads to keep, kill or scale, why, and give me 5 new variations for round 2.
```
**Check:** every decision points to a number (hook rate, CTR, cost per result).

## Done when
- [ ] The edit plan was approved before rendering
- [ ] 30s and 15s ads exported in 9:16, 4:5 and 1:1
- [ ] Captions proofread, end card added, label readable in every product shot
- [ ] Ads are live with a clear test plan
- [ ] Round 2 ideas are based on real results

## Common mistakes
- Giving 10 notes at once. Give 3 per round, or the edit gets worse.
- Starting with a logo or a slow fade. The first second must show the product, a face or the offer.
- Judging ads after one day. Wait for enough spend before deciding.

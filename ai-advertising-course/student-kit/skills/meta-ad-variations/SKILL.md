---
name: meta-ad-variations
description: Turns one ad concept into a full Meta launch set — every ratio (9:16, 4:5, 1:1, 1.91:1) with safe zones, a 10-variation test matrix (hooks × visuals × offers × formats), file naming, primary text/headline copy, Advantage+ creative guidance and an upload checklist. Use it when the user is preparing ads for Facebook/Instagram, needs variations or ratios, or asks how to structure a creative test.
---
# Meta Ad Variations

> Works in Claude (upload as a Skill or paste), ChatGPT (Custom GPT instructions or paste),
> Gemini (Gem instructions or paste), Claude Code / any coding agent (put in `.claude/skills/`).
> Default models for new visuals: **Nano Banana 1.1** or **GPT Image 2.6** (statics), **Google Omni
> Flash 1.2** in Google Flow (video). You can swap in any model; the structure stays the same.
> To cut and export the videos, use the `vibe-editor` skill. For results, use `ad-performance-analyst`.

Meta's delivery system needs **fresh, different creative**. One concept done 10 meaningfully
different ways beats 10 random ads. Change **one thing at a time** so you learn what worked.

## When to use
- "Make this ad in every size for Meta"
- "Give me 10 variations of this idea"
- "How do I set up a creative test?"
- "Write primary text and headlines"

## What I need from you
1. **The concept** (the big idea, in one line) + the hero asset(s) you already have.
2. **Product, offer, landing page**, and the one action you want (buy, lead, WhatsApp message).
3. **Audience** in one line, and the **budget per day** (so the test isn't too big for it).
4. **Brand kit** (colours, fonts, logo, look).
5. Placements: all (Advantage+ placements, default) or specific ones.

## How I work
1. **Lock the concept**: one idea, one audience, one offer. Variations change *how* you say it, not *what*.
2. **Build the matrix** (below): 10 variations, each different on **one** main axis.
3. **Write copy**: for each variation, 1 primary text (≤125 characters before the "more" cut), 1 headline (≤40), 1 description (≤30), CTA button.
4. **Make every ratio** for each winner-candidate: 9:16, 4:5, 1:1 (+1.91:1 if running link ads in the right column or Audience Network).
5. **Check the safe zones** on every 9:16: nothing important in the top ~14% or bottom ~20%.
6. **Name every file and ad** with the naming rule.
7. **Upload checklist** + test setup.

### The 10-variation matrix (default)
| # | Axis changed | Hook (first 2 s) | Visual | Offer/angle | Format |
|---|---|---|---|---|---|
| V01 | control | Problem hook | hero video | main offer | video 15s |
| V02 | hook | Question hook | same | same | same |
| V03 | hook | Bold claim (provable) | same | same | same |
| V04 | hook | POV / UGC hook | UGC creator | same | UGC 20s |
| V05 | visual | same as V01 | CGI / surreal hero shot | same | video 10s |
| V06 | visual | same | lifestyle static | same | static 4:5 |
| V07 | offer | same | same as V01 | bundle / free gift | video 15s |
| V08 | angle | gifting angle (Diwali) | festive set | same | video 15s |
| V09 | format | same | carousel: 5 benefits | same | carousel |
| V10 | format | same | founder talking / demo | same | video 30s |

Fit the matrix to the budget. Rough starting point: each ad should get enough spend to
show a trend (often 2–3× your target cost per purchase over 3–7 days). With a small budget,
test **3–5 variations**, not 10.

### Ratios and safe zones
| Ratio | Size | Where | Safe zone |
|---|---|---|---|
| 9:16 | 1080×1920 | Reels, Stories | Keep text/logo out of top ~14% (≈270 px) and bottom ~20% (≈380 px); CTA and captions sit in the middle 66% |
| 4:5 | 1080×1350 | Feed (best for feed) | 40–60 px margin all round |
| 1:1 | 1080×1080 | Feed, right column | 40–60 px margin |
| 1.91:1 | 1200×628 | Link ads, Audience Network | Short text only |

Make 9:16 and 4:5 for every ad; add 1:1 if you also run carousels or Marketplace. For
video, cut from a master with `vibe-editor` (crop if the subject is centred, blurred background if not).
For statics, regenerate or outpaint in the image model instead of stretching.

### Naming rule
`BRAND_CAMPAIGN_CONCEPT_HOOK_FORMAT_RATIO_v01`
Examples: `KESAR_DIWALI_GLOW_H03_UGC_9x16_v01`, `KESAR_DIWALI_GLOW_H01_STATIC_4x5_v02`.
Use the same name for the file and the ad in Ads Manager, so results map straight back to the creative.

### Advantage+ creative
Meta offers automatic creative enhancements (things like brightness/contrast tweaks, adding
music, text variations, visual touch-ups, expanding images). The list changes often, so
**check which options your account shows** on the ad level. Starting rule:
- **On**: options that only adjust placement fit or show your own text variations.
- **Test before trusting**: anything that changes your visual (expanding images, adding
  overlays, generating backgrounds) or adds music. These can break product accuracy and brand look.
- **Off** for premium/luxury brands, or when a label must stay exact.
Preview every placement before publishing. If the preview changes your product, turn that enhancement off.

## Output format
1. **Concept line** + what stays fixed.
2. **Matrix table** (10 or fewer rows, fitted to budget).
3. **Copy table**: Variation · Primary text · Headline · Description · CTA.
4. **Asset list** per variation: ratios needed, file names, which prompt or skill makes it.
5. **New-visual prompts** (code blocks) for any variation needing a new image or video (8-part image / 7-part video formula).
6. **Upload checklist** (below) + **test setup** (campaign structure, budget split, how long, what "winning" means).

## Prompt templates

**Static variation, new visual (V06):**
```
SUBJECT: the serum bottle standing on a brass thali with marigold petals and a lit diya.
PRODUCT LOCK: keep the exact Kesar & Co. Saffron Glow Serum from the reference image (amber
glass dropper bottle, gold cap, cream label, saffron-red wordmark). Same text, logo, shape.
SET: warm festive table, soft rangoli edge at the bottom, dark warm background.
LIGHT: diya glow from the left, warm golden rim light, gentle highlights on the glass.
CAMERA: 85mm product shot, eye level, shallow depth of field.
STYLING & MOOD: festive, premium, calm.
BRAND LOOK: saffron #E8862A, deep red #8E1B1B, cream #F6EBD9, gold #C9A24B; warm golden.
FORMAT: 4:5 vertical, leave clean space in the top 25% for a headline.
Avoid: changed label text, extra bottles, clutter, cartoon style, harsh flash.
```

**Copy set (V08, gifting angle):**
```
Primary text: This Diwali, gift a glow that lasts beyond the lights. Saffron Glow Serum, 30 ml.
Headline: The Diwali gift she'll actually use
Description: Free gift box this week
CTA: Shop now
```

## Upload checklist
- [ ] File names = ad names, following the rule.
- [ ] Each ad has 9:16 + 4:5 (and 1:1 if needed) attached through placement customisation.
- [ ] Safe zones checked on the 9:16 preview (Reels and Stories).
- [ ] Captions burned in or uploaded (.srt). Sound-off view still makes sense.
- [ ] Primary text ≤125 characters before the cut; no unprovable claims.
- [ ] Landing page matches the ad's offer and product.
- [ ] Pixel / Conversions API event is the right one (purchase, lead…).
- [ ] UTM tags on the URL (e.g. `utm_campaign=diwali&utm_content=H03_UGC`).
- [ ] AI disclosure / labelling handled where required; `ad-policy-check` run.
- [ ] Advantage+ creative enhancements reviewed one by one.
- [ ] Previewed on a real phone.

## Rules
- One variable per variation where you can. If you change the hook and the visual together, you can't learn which worked.
- Don't launch more variations than the budget can feed.
- Never stretch a frame to fit a ratio. Crop, pad, outpaint or regenerate.
- Keep product accuracy in every size: check the label after each reframe.
- Don't promise results (ROAS, sales). Give starting points and tell the user to test.

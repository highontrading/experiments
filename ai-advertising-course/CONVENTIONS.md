# Course build conventions (read before writing any file)

Course: **AI & Advertising** by Ideabro Studio. 11 modules, 41 lessons, $29, India + global
audience, many non-technical students (D2C founders, marketers, designers, freelancers, creators,
students). Sales page: https://community.ideabrostudio.com/courses/ai-and-advertising

The instructor records **one raw lecture per module (11 lectures)**. Claude later cuts each raw
lecture into its lessons (41 lesson videos). So every lecture plan is split into lesson segments.

## Tools (the course stack)

| Job | Main tool | Default model (write it exactly like this) |
|---|---|---|
| Video | **Google Flow** | **Google Omni Flash 1.2** |
| Images | **Google Flow** or **ChatGPT** | **Nano Banana 1.1** (in Flow / Gemini) or **GPT Image 2.6** (in ChatGPT) |
| Thinking, prompts, scripts | Claude, ChatGPT or Gemini, with our skills attached | any |
| Voice / dubbing | ElevenLabs | — |
| Music / jingles | Suno | — |
| Editing | **Vibe editing with Claude** (our `vibe-editor` skill + ffmpeg) or CapCut as fallback | — |
| Launch | Meta Ads Manager | — |

Rules:
- Students may use other models. Every skill says: "Default models: … You can swap in any
  image/video model: the prompt structure stays the same."
- Flow modes: describe them generically as **Text to Video**, **Frames to Video** (start frame,
  optional end frame), **Ingredients / reference to Video**, and **Extend / scene builder**. Say
  "use whichever of these your version of Flow shows". Never invent menu names beyond these.
- Don't invent pricing numbers for tools. Say "check the current plan page".

## Demo brands (used in every lecture, so the course reads as one campaign)

- **Kesar & Co.**: hero brand. Saffron Glow Face Serum, 30 ml amber glass dropper bottle, gold
  cap, cream label with a saffron-red wordmark. Indian skincare D2C. Palette: saffron #E8862A,
  deep red #8E1B1B, cream #F6EBD9, gold #C9A24B. Look: warm, golden-hour, premium-Indian, clean.
  The instructor can swap in any real product on their desk; lecture plans say "[your product]".
- **Loom Street**: ethnic fashion label (used in Module 4 and the fashion recipes). Handloom
  kurtas and sarees, festive and wedding-season edits.
- **Fizzbar**: sparkling fruit drink in a can (food & beverage recipes, CGI, jingle).

Students pick **their own brand** in Lecture 1 and use it the whole way through.

## Pipeline (the course spine, from the sales page)

**Brief → Concept → Visuals → Motion → Edit → Launch**. The 4 pillars: **art direction, product
accuracy, brand consistency, human touch**. Refer to them often.

## Prompt formulas (use these everywhere, same words)

**Image prompt formula (8 parts):**
`SUBJECT + PRODUCT LOCK + SET + LIGHT + CAMERA/LENS + STYLING & MOOD + BRAND LOOK + FORMAT`
(+ an "Avoid:" line). PRODUCT LOCK means "keep the exact product from the reference image: same
label text, logo, shape, cap, colours; do not redesign".

**Video prompt formula (7 parts) for Flow:**
`SHOT TYPE + SUBJECT & ACTION + CAMERA MOVE + LIGHT & MOOD + SOUND + DURATION/PACE + CONSISTENCY`
(+ "Avoid:" line). CONSISTENCY = "same product/model/set as the start frame; label stays readable".

**Vibe editing: the 5-step system** (shared with the Vibe Editing course):
**1 Dump → 2 Vibe → 3 Beat → 4 Layer → 5 Sound** (+ director pass).
The vibe prompt = **platform + length + energy + look + goal**.
Example: "30s Reel, high energy, teal & orange, bold captions, end on the product."

## Meta specs (keep consistent)
Ratios: 9:16 (1080x1920) Reels/Stories, 4:5 (1080x1350) feed, 1:1 (1080x1080), 1.91:1 (1200x628).
9:16 safe zone: keep text/logos out of the top ~14% and bottom ~20%.
Export: H.264, yuv420p, 30 fps, AAC 48 kHz, -14 LUFS, `+faststart`.
File naming: `BRAND_CAMPAIGN_CONCEPT_HOOK_FORMAT_RATIO_v01` e.g. `KESAR_DIWALI_GLOW_H03_UGC_9x16_v01`.

## Folder layout

```
ai-advertising-course/
  README.md                 # overview + today's roadmap (instructor)
  RECORDING-DAY-PLAN.md     # schedule, setup, recording rules for editing (instructor)
  CONVENTIONS.md            # this file
  lectures/                 # instructor talking points, one per module
    L01-ai-in-advertising.md
    L02-briefs-strategy-big-idea.md
    L03-ai-product-photography.md
    L04-models-styling-sets.md
    L05-video-ads-campaign-films.md
    L06-sound-voice-music.md
    L07-ugc-brand-ambassadors.md
    L08-meta-ads-variations-testing.md
    L09-editing-endcards-brand-kits.md
    L10-hybrid-ads.md
    L11-capstone-campaign.md
  student-kit/              # everything students download
    00-START-HERE.md
    HOW-TO-USE-SKILLS.md
    skills/<skill-name>/SKILL.md   (+ optional reference .md files in the same folder)
    templates/*.md
    workflows/W01-…md … W10-…md
    prompt-library/*.md
```

## Skills (exact folder names, owner module)

| Skill folder | Module | Purpose |
|---|---|---|
| `campaign-director` | all / 11 | Master skill: runs Brief → Launch, calls the other skills' methods. "If you attach only one skill, attach this." |
| `ad-policy-check` | 1 | Meta ad policy, AI disclosure, ASCI (India), claim honesty, likeness/rights. |
| `brief-and-strategy` | 2 | Decode a brief, audience/angle/positioning, big idea. |
| `hook-and-script-writer` | 2 | Hooks, 15s/30s scripts, storyboards with frame image prompts. |
| `brand-bible-builder` | 2 / 9 | Interview → Brand Bible (palette, look, light, model, voice, sound, rules). |
| `product-shot-director` | 3 | Packshots, lifestyle, e-commerce sets: image prompts for Nano Banana 1.1 / GPT Image 2.6. |
| `product-accuracy-checker` | 3 | Compare generated image vs real product; SHIP / FIX / REGENERATE + fixes. |
| `model-and-set-director` | 4 | Consistent AI models (character sheet), styling, Indian skin tones/outfits, sets. |
| `video-ad-director` | 5 | Flow prompts: image-to-video, camera moves, multi-shot films, CGI, food/fashion/tech recipes. |
| `sound-director` | 6 | VO scripts + ElevenLabs direction (Hindi/English/Hinglish), Suno jingle briefs, SFX, lip-sync. |
| `ugc-ad-director` | 7 | AI creators, reviews/unboxing/GRWM/try-on, recurring brand face. |
| `meta-ad-variations` | 8 | Every ratio from one concept, 10 variations, Advantage+ settings, naming. |
| `ad-performance-analyst` | 8 | Read Ads Manager export → diagnosis → next round. |
| `vibe-editor` | 9 (used from 5 on) | Edit videos by instruction using ffmpeg: cuts, beat sync, reframe, speed, grade, music, SFX, export. Includes `ffmpeg-recipes.md`. |
| `vibe-captions-and-endcards` | 9 | Captions (transcribe → SRT → styled burn-in), text overlays, logo/CTA end cards, brand-kit look. |
| `hybrid-ad-director` | 10 | Shoot vs generate, blending real + AI, upgrading a phone shoot. |
| `case-study-and-pitch` | 11 | Portfolio case study, packages, pricing, proposal, pitch. |

## SKILL.md format (universal: Claude, ChatGPT, Gemini, any agent)

```markdown
---
name: <folder-name>
description: <one or two sentences: what it does and WHEN to use it — Claude uses this to trigger it>
---
# <Title>

> Works in Claude (upload as a Skill or paste), ChatGPT (Custom GPT instructions or paste),
> Gemini (Gem instructions or paste), Claude Code / any coding agent (put in .claude/skills/).
> Default models: … You can swap in any model; the structure stays the same.

## When to use
## What I need from you        (inputs; ask only for what's missing, max 5 questions at once)
## How I work                  (numbered steps the AI follows)
## Output format               (exact tables / blocks, every prompt in its own copy-ready code block)
## Prompt templates            (filled-in examples using Kesar & Co. etc.)
## Quality checks              (checklist before handing over)
## Rules                       (hard don'ts)
```

Writing style for ALL files:
- Plain, simple English (many students are Indian, non-native, non-technical). Short sentences.
  Hinglish is fine inside example scripts/hooks.
- Concrete, copy-ready prompts. No vague advice. No filler, no hype words.
- Every prompt the student pastes into a tool goes in its own fenced code block.
- Skills must be self-contained (a student may attach only that one file), but may say
  "for X, use the `<other>` skill".
- No emojis except ✅ ⚠️ ❌ in check tables.

## Lecture plan format (lectures/Lxx-*.md)

```markdown
# Lecture NN: <Module title>
Target raw length · Lessons covered · Level
## Before you hit record   (what to have open/ready: tabs, files, pre-generated assets, product)
## Cold open (30–60s)      (exact hook line to say)
## Lesson N.1: <title>  →  say "LESSON N.1" on camera to start the segment
   - Goal (1 line)
   - Talking points (bullets, in the order to say them; key lines in **bold** quotes)
   - Live demo (numbered steps with the exact prompts / skill to use)
   - Show on screen (what to display)
   - Common mistakes to call out (3)
   - Student gets (files from student-kit)
   - Assignment (1 line)
## ... next lessons
## Wrap-up (what to say at the end + tease next lecture)
## Edit notes for Claude   (b-roll/inserts, on-screen text, where to zoom)
```

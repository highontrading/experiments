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

## Folder layout (SIMPLIFIED VERSION — this is the current one)

```
ai-advertising-course/
  README.md            # one-page overview
  LECTURE-NOTES.md     # short teaching notes, half a page per module (instructor)
  CONVENTIONS.md       # this file
  student-kit/
    START-HERE.md      # one short page for students
    skills/            # 4 main skills
      ad-strategist/SKILL.md        (+ one reference file)
      ad-image-director/SKILL.md    (+ recipes.md)
      ad-video-director/SKILL.md    (+ recipes.md)
      vibe-editor/SKILL.md          (+ ffmpeg-recipes.md, scripts/)
    workflows/         # 4 main workflows (will become interactive HTML pages)
      01-plan-the-ad.md
      02-photo-to-campaign-images.md
      03-images-to-video-ad.md
      04-edit-and-launch.md
    templates/         # brand-bible.md, creative-brief.md, capstone-brief.md
  archive/             # the old detailed version (17 skills, 10 workflows, long lecture plans). Source material only.
```

## The 4 main skills

| Skill | Nickname | Covers modules | Does |
|---|---|---|---|
| `ad-strategist` | The Planner | 1, 2, 8 (testing), 11 | Brief → audience & angle → big idea → hooks → 15s/30s scripts → storyboard → brand bible → policy & AI-disclosure check → Meta launch & test plan → read results → next round → case study & pricing. |
| `ad-image-director` | The Photographer | 3, 4, 8 (statics) | Product packshots, lifestyle, e-com sets, product-accuracy check (SHIP / FIX / REGENERATE), consistent AI models, styling, Indian skin tones/outfits, sets, statics in every Meta ratio, 10 variations. Writes prompts for Nano Banana 1.1 / GPT Image 2.6. |
| `ad-video-director` | The Film Director | 5, 6, 7, 10 | Google Flow (Google Omni Flash 1.2) prompts: still → video, camera moves, multi-shot films, CGI, food/fashion/tech recipes, AI UGC creators & reviews, brand ambassador, voiceover / jingle / SFX prompts (ElevenLabs, Suno, Hindi/English/Hinglish), hybrid real shoot + AI. |
| `vibe-editor` | The Editor | 9 (used from 5 on) | Edit by instruction with ffmpeg (5-step: Dump → Vibe → Beat → Layer → Sound + director pass), captions incl. Hindi, text overlays, logo/CTA end cards, every ratio, Meta export. Modes A (terminal) / B (in-chat code) / C (CapCut plan). |

## The 4 main workflows (Brief → Concept → Visuals → Motion → Edit → Launch)

| Workflow | Skill | Modules | Ends with |
|---|---|---|---|
| `01-plan-the-ad` | ad-strategist | 1, 2 | Creative brief + big idea + 5 hooks + script + storyboard + brand bible |
| `02-photo-to-campaign-images` | ad-image-director | 3, 4, 8 | Packshots, lifestyle, model shots, statics in all ratios, 10 variations |
| `03-images-to-video-ad` | ad-video-director | 5, 6, 7, 10 | Video clips + voiceover + music + SFX (+ UGC version) |
| `04-edit-and-launch` | vibe-editor + ad-strategist | 8, 9 | Edited 15s/30s ads with captions & end card in 3 ratios, launched, results read, next round planned |

Capstone (Module 11) = run workflows 01 → 04 for one brand.

## Workflow file format (simple, and easy to turn into an interactive HTML page later)

```markdown
# Workflow 0N: <Name>
> <One sentence: what you have at the end.>

| Time | Skill to attach | Tools | Modules |
|---|---|---|---|

## You need
- 3–5 short bullets

## Steps
### Step 1 · <Short verb phrase>
**Tool:** … · **You get:** …
1–3 short lines on what to do.
**Type this:**
```text
<exact message to type to the skill / tool>
```
**Check:** one line.

(5–7 steps in total, never more)

## Done when
- [ ] 4–6 checks

## Common mistakes
- 3 bullets
```

Simplicity rules (the instructor asked for this): short sentences, no jargon, one idea per line,
students must understand each step in 10 seconds. A skill's top section must be readable by a
student: "In one line", "What you can ask it" (5–8 example requests). Detailed instructions for
the AI go below that.

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

## Lecture notes

The instructor uses `LECTURE-NOTES.md` (short: what to teach, key points, what to show, take care, give students). The old long lecture plans are in `archive/lectures-detailed/` for reference only.

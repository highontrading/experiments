# AI & Advertising: Course Build (Ideabro Studio)

Everything you need to record the course today and hand the kit to students.

- **You record:** 11 raw lectures, one per module.
- **Claude edits:** each raw lecture is cut into its lessons, giving **41 lesson videos**.
- **Students get:** `student-kit/`, which holds 17 universal skills, 15 templates,
  10 workflows and a prompt library.

Main stack: **Google Flow** (video: **Google Omni Flash 1.2**; images: **Nano Banana 1.1**),
**ChatGPT** (images: **GPT Image 2.6**), Claude, ChatGPT or Gemini with our skills attached,
ElevenLabs, Suno, **vibe editing with Claude**, and Meta Ads Manager. Students can swap in any
other model; the prompt structure stays the same.

---

## Start here (in this order)

1. Read `RECORDING-DAY-PLAN.md`: today's schedule, setup, and the 3 words to say on camera
   that let Claude cut your lectures into lessons.
2. Open the lecture plan (`lectures/L01-…md`) before you record it. Each one has the cold-open
   line, talking points per lesson, live demos with exact prompts, common mistakes, what to
   give students, and the assignment.
3. Record. Save each lecture as `L01_raw.mp4` … `L11_raw.mp4`.
4. Upload the raw files to a Google Drive folder and send Claude the folder name. Claude cuts
   them into the 41 lessons (section 4 of `RECORDING-DAY-PLAN.md`).
5. Upload `student-kit/` as a zip, and each skill as its own zip, to the course page.

---

## The roadmap: 11 lectures → 41 lessons

| Lecture | Module | Lessons | Raw length | Main live demo | Skills you hand out | Templates and workflows |
|---|---|---|---|---|---|---|
| **L01** | AI in advertising: the new playbook | 1.1–1.4 | 30–40 min | Tour of the stack; attaching a skill in Claude, ChatGPT and Gemini | `campaign-director`, `ad-policy-check` | `ai-ad-stack`, `policy-checklist`, `00-START-HERE`, `HOW-TO-USE-SKILLS` |
| **L02** | Briefs, strategy and the big idea | 2.1–2.4 | 45–55 min | Messy brief → creative brief → 30 hooks → 15s script and storyboard | `brief-and-strategy`, `hook-and-script-writer`, `brand-bible-builder` | `creative-brief`, `audience-angle-matrix`, `hook-bank`, `script-storyboard`, `brand-bible` |
| **L03** | AI product photography | 3.1–3.4 | 50–60 min | One phone photo → packshots → lifestyle → label fix → e-com set | `product-shot-director`, `product-accuracy-checker` | W01, W03, `prompt-library/images` |
| **L04** | Models, styling and virtual sets | 4.1–4.4 | 45–55 min | Kesar brand model sheet; Loom Street lookbook; one set across 3 shots | `model-and-set-director` | W02 |
| **L05** | AI video ads and campaign films | 5.1–5.4 | 55–65 min | Still → video in Flow; 4-shot film; CGI giant product; 3 recipes | `video-ad-director` | W04, W05, `shot-list`, `prompt-library/video-flow`, `recipe-vault` |
| **L06** | Sound, voice and music | 6.1–6.4 | 40–50 min | Hindi and English voiceover; jingle and sonic logo; lip-sync; sound-design before/after | `sound-director` | W07, `prompt-library/audio` |
| **L07** | AI UGC and brand ambassadors | 7.1–7.3 | 35–45 min | AI creator; review and unboxing ad; ambassador bible | `ugc-ad-director` | W06, `ambassador-bible` |
| **L08** | Meta ads: statics, variations and testing | 8.1–8.4 | 45–55 min | 1 concept → 4 ratios → 10 variations → Ads Manager → read results | `meta-ad-variations`, `ad-performance-analyst` | W08, `variation-matrix`, `test-log` |
| **L09** | Editing, end cards and brand kits | 9.1–9.4 | 50–60 min | **Vibe editing showcase:** clips → vibe prompt → director pass → captions → end card → 3 ratios | `vibe-editor`, `vibe-captions-and-endcards`, `brand-bible-builder` | `brand-bible` (final) |
| **L10** | Hybrid ads: real shoot + AI | 10.1–10.3 | 30–40 min | Phone shoot → AI upgrade → blended hybrid clip | `hybrid-ad-director` | W09 |
| **L11** | Capstone: your full campaign | 11.1–11.3 | 50–60 min | Kesar & Co. Diwali campaign from brief to launch; case study; pricing and pitch | `campaign-director`, `case-study-and-pitch` | W10, `capstone-brief`, `campaign-plan`, `case-study`, `proposal-and-pricing` |

Total raw recording: about **8–10 hours**. Finished course: about **7–8 hours** across 41 lessons.

**The demo brand runs through every lecture:** Kesar & Co. Saffron Glow Face Serum (or any
real product on your desk), with Loom Street for fashion and Fizzbar for drinks. Students pick
their own brand in L01 and build their capstone one lecture at a time.

---

## Folder map

```
ai-advertising-course/
├── README.md                ← you are here (roadmap)
├── RECORDING-DAY-PLAN.md    ← today's schedule, setup, on-camera markers, handoff to Claude
├── CONVENTIONS.md           ← names, models, formulas, specs (for maintaining the course)
├── lectures/                ← YOUR talking points: L01 … L11
└── student-kit/             ← what students download
    ├── 00-START-HERE.md
    ├── HOW-TO-USE-SKILLS.md ← Claude / ChatGPT / Gemini / Claude Code
    ├── skills/              ← 17 universal skills (one folder each, SKILL.md inside)
    ├── templates/           ← briefs, brand bible, hooks, scripts, matrices, rubric, pricing
    ├── workflows/           ← W01 … W10 step-by-step SOPs
    └── prompt-library/      ← images, video (Flow), audio, recipe vault (13 ad formats)
```

## The 17 skills

| Skill | Use it for |
|---|---|
| `campaign-director` | **The master skill.** Brief → Concept → Visuals → Motion → Edit → Launch. If a student attaches only one skill, it should be this one. |
| `ad-policy-check` | Meta policy, AI disclosure, ASCI, claims, likeness and rights |
| `brief-and-strategy` | Decoding a brief, audience, angle, positioning, the big idea |
| `hook-and-script-writer` | Hooks, 15s and 30s scripts, storyboards with frame prompts |
| `brand-bible-builder` | A brand's look, light, palette, model, voice and sound in one file |
| `product-shot-director` | Packshot, lifestyle and e-com prompts for Nano Banana 1.1 / GPT Image 2.6 |
| `product-accuracy-checker` | Generated image vs real product: SHIP / FIX / REGENERATE |
| `model-and-set-director` | Consistent AI models, styling, Indian skin tones and outfits, sets |
| `video-ad-director` | Flow / Google Omni Flash 1.2 prompts, camera moves, multi-shot films, CGI, recipes |
| `sound-director` | Hindi, English and Hinglish voiceover, dubbing, jingles, SFX, lip-sync |
| `ugc-ad-director` | AI creators, reviews, unboxings, GRWM, try-on hauls, brand ambassador |
| `meta-ad-variations` | Every ratio from one concept, 10 variations, Advantage+, naming |
| `ad-performance-analyst` | Ads Manager export → diagnosis → next round of ads |
| `vibe-editor` | Editing by instruction with ffmpeg: cuts, beat sync, reframe, look, music, export |
| `vibe-captions-and-endcards` | Captions (English, Hindi, Hinglish), text overlays, logo and CTA end cards |
| `hybrid-ad-director` | When to shoot vs generate, blending real footage with AI, phone-shoot upgrades |
| `case-study-and-pitch` | Portfolio case study, packages, pricing, proposal, pitch |

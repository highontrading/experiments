# How to Use the Skills (Claude, ChatGPT, Gemini, any AI)

A **skill** is a folder with one main file, `SKILL.md`. It's a plain-text instruction file that
tells the AI how to do one job well: what to ask you, what steps to follow, and the exact format
of the prompts it gives back. Because it's just text, it works in any AI app.

**The basic loop in every lesson:**
1. Attach the skill.
2. Tell the AI your product and goal (attach your `brand-bible.md` and product photos).
3. Copy each prompt the AI gives you into Google Flow or ChatGPT.
4. Bring the result back ("here's what I got, fix the label") and repeat.

> Menu names in these apps change often. If a button below has moved, look for "Skills",
> "Projects", "Instructions" or "Knowledge". The idea stays the same.

---

## Claude (best experience)

**Option A: as a Skill (recommended).** Claude loads it automatically when it's relevant.
1. Zip the skill **folder** (e.g. `product-shot-director/`, with `SKILL.md` inside).
2. In Claude, go to **Settings → Capabilities → Skills** (code execution must be on), then
   upload the zip.
3. Start a chat and just ask: *"Make 4 packshot prompts for my serum"*. Attach your photos and
   brand bible.

**Option B: in a Project.** Good for keeping one brand together.
1. Create a Project named after your brand.
2. Add `brand-bible.md`, your product photos and the `SKILL.md` files you need to the Project
   knowledge.
3. In the Project instructions write: *"Follow the attached SKILL.md files. Always use
   brand-bible.md."*

**Option C: quick.** Attach `SKILL.md` to a normal chat and write:
*"Follow this skill exactly. My product: …"*

## ChatGPT

**Option A: Custom GPT** (one GPT per skill, reusable).
1. Go to **Explore GPTs → Create → Configure**.
2. Name it, e.g. "Product Shot Director".
3. **Knowledge:** upload the `SKILL.md` (and any other `.md` files in that skill folder).
4. **Instructions:** paste: *"You follow the uploaded SKILL.md exactly. Ask the intake
   questions, then produce the outputs in the exact format it describes."*
5. Turn on **Image generation** if you want it to make images with GPT Image 2.6 directly.
   Turn on **Code Interpreter** for the vibe-editing skills.

**Option B: Project.** Add the skill files and your brand bible to a ChatGPT Project and use
the same instruction line.

**Option C: quick.** Attach `SKILL.md` in a chat and write *"Follow this skill exactly."*

## Gemini

**Option A: Gem.**
1. Go to **Gems → New Gem**.
2. **Instructions:** *"You follow the attached SKILL.md exactly."*
3. **Knowledge:** upload `SKILL.md` and your `brand-bible.md`.
4. Gemini can make images with Nano Banana 1.1 in the same chat.

**Option B: quick.** Attach `SKILL.md` in a chat and write *"Follow this skill exactly."*

## Claude Code, Cowork or any coding agent (for vibe editing)

The vibe-editing skills work best where the AI can run commands on your computer, because it
edits your actual video files with **ffmpeg**.

1. Install ffmpeg once:
   - Mac: `brew install ffmpeg`
   - Windows: `winget install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
2. Copy the skill folders into `~/.claude/skills/` (all projects) or `.claude/skills/` inside
   your project folder.
3. Open your project folder, drop your clips into `05_edit/`, and type your vibe prompt:
   *"30s Reel, high energy, warm golden look, bold captions, end on the product."*

**No terminal?** In Claude.ai or ChatGPT with code execution, the vibe editor works on short
clips. In apps with no code execution, it gives you an exact CapCut edit plan instead.

---

## Which skill when

| You want to… | Attach |
|---|---|
| Run a whole campaign, start to finish | `campaign-director` |
| Turn a client's message into a proper brief, pick the angle | `brief-and-strategy` |
| Write hooks, scripts, storyboards | `hook-and-script-writer` |
| Lock the brand's look, colours, model and voice | `brand-bible-builder` |
| Get product photo prompts (packshot, lifestyle, e-com) | `product-shot-director` |
| Check that a generated image matches the real product | `product-accuracy-checker` |
| Create a consistent AI model, outfits, sets | `model-and-set-director` |
| Get video prompts for Google Flow | `video-ad-director` |
| Write a voiceover, jingle or sound design | `sound-director` |
| Make UGC-style ads and a brand ambassador | `ugc-ad-director` |
| Make all ratios and 10 variations for Meta | `meta-ad-variations` |
| Understand your ad results and plan the next round | `ad-performance-analyst` |
| Edit a video just by describing it | `vibe-editor` |
| Add captions, text and a logo/CTA end card | `vibe-captions-and-endcards` |
| Mix a real shoot with AI scenes | `hybrid-ad-director` |
| Check policy, disclosure and claims before launch | `ad-policy-check` |
| Write a case study, price and pitch your service | `case-study-and-pitch` |

**Tips**
- Attach your `brand-bible.md` with every skill. Consistency comes from that file.
- Attach your **real product photos** with every image or video request. Product accuracy
  comes from those.
- Give the AI notes like a director: *"warmer light, label more readable, less clutter"*.
  Three notes per round is plenty.

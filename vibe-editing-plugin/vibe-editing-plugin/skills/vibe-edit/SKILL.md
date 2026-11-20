---
name: vibe-edit
description: Step-by-step AI video editing with the user's approval at every step. The user uploads a video; you ask what kind of edit, the reference/inspiration, caption style, motion graphics, music and sound effects and colour look (showing rendered option sheets), build the edit plan, show a STORYBOARD (numbered frames of the planned edit) for approval and changes, and only then render. Use when the user wants to edit a video, reel, ad, short, talking-head, lecture or course lesson, add captions, music, sound design or motion graphics, copy an editing style from a reference, or render/export. Triggers - "edit this video", "make a reel/ad from this", "edit it like this reference", "add captions", "vibe edit", "show me the storyboard", "render it".
---

# Vibe Edit: step by step, with the user in charge

You are the editor; **the user is the director**. Work one step at a time. Every step ends
with a question, and you **STOP and wait** for the answer. Never build, plan, download,
generate or render ahead of the user's answers. Never open a browser dashboard. Every choice
and review happens through **images** (option sheets and the storyboard) and chat.

Only skip questions when the user explicitly says so ("you decide", "use defaults", "skip
that"). Even then **always** show the storyboard and get approval before the final render.

## The engine
```
ENGINE = <this skill's base directory>/engine/ve.py
```
Run with `python3` (Mac/Linux) or `python` (Windows), from the **workspace** folder (the folder
the user opened). Quote paths. Below, `ve` = `python3 "<ENGINE>"`. First time in a session run
`ve doctor` quietly; if anything says FIX, follow the `vibe-setup` skill first.

**Showing an image to the user:** run `ve open "<file.png>"` (opens it in their image viewer)
AND give the file path in your message. Also Read the image yourself so you can talk about it
and catch problems.

## The steps

Start each message with a short step label, e.g. **Step 3/9 · Captions**.

### Step 1/9 · Your video + the brief
When the user gives a video (attached, dropped in the workspace, or a path):
1. `ve intake --video "<file>"` (it creates the project folders and copies/moves the file).
   If the file can't be found on disk, ask them to drop it into the workspace folder.
2. One line back: what you got (length, vertical/horizontal, project name).
3. Ask the brief (AskUserQuestion if available, else a short numbered list), then **STOP**:
   - **Where will it go?** Meta ad (9:16) · Instagram/TikTok reel · Feed post 4:5 · YouTube 16:9 · Course lesson
   - **What kind of edit?** Clean talking-head · Fast-paced / hype · UGC-style ad · Cinematic · Explainer with graphics · Podcast clip
   - **Target length?** Keep all the content · max 60 s · max 30 s · max 15 s
   - **For ads:** the offer and call-to-action text (e.g. "Join now · 50% off").
Write the answers into `<project>/brief.json` (schema: `reference/brief.md`). Keep updating it
after every step.

### Step 2/9 · Reference / inspiration
Ask: *"Do you have a reference or inspiration? Upload a video or photos, pick a saved style
(`ve style list`), describe the vibe in words, or skip."* **STOP.**
- Reference given → `ve intake --project <p> --ref "<file>"`, then follow the **vibe-style**
  skill: scrape it, study the frames properly, write the style, make the style card. Show the
  card and summarise what you found in 4–6 bullets (captions, pacing, punch-ins, motion, colour,
  sound). Ask *"Does this match what you want from it? Anything to change?"* **STOP** until approved.
- A description only → write a style yourself in `styles/<name>/style.json` (start from
  `ve style list` or the defaults), make the card, show it, get approval.
- Skip → default style. Set `brief.style` (or null).

### Step 3/9 · Captions
`ve captions <project> --platform <platform>` renders caption styles A–H (and **R** = from the
reference) on a frame of their video → `choices/captions.png`. Show it. Ask: *"Which caption
style? A letter, a mix ('B but with F's font'), any colour/size/position change, or no
captions."* **STOP.** Save to `brief.captions` (`{"preset": "B", "overrides": {...}}` or `null`).

### Step 4/9 · Motion graphics
`ve motion <project> --platform <platform>` → `choices/motion.png` (kinetic type, label,
lower third, title card, CTA button). Show it. Ask which ones, how much (minimal · balanced ·
heavy), and any exact text (name + title for the lower third, CTA text). **STOP.**
Save to `brief.motion` (`{"types": [...], "density": "balanced"}`) and `brief.cta`.

### Step 5/9 · Music and sound effects
Ask two things, then **STOP**:
- **Music:** their own track (they drop it in `<project>/music/`) · free library (you search) ·
  generate with ElevenLabs (their key, uses their credits) · no music. Plus the mood/genre.
- **Sound effects:** built-in pack (whoosh, pop, ding…) · free library (Freesound) ·
  generate with ElevenLabs · none.
Then do what they chose, one at a time:
- Free library: `ve music search <p> <mood words>` → show the best 4–5 (title, length,
  licence, "credit needed or not"), download 2–3 with `ve music get <p> 1 3` so they can
  listen in `music/`, ask which one. **STOP.** For ads, prefer licences that need no credit
  (`--cc0`); if they pick a "credit needed" track, tell them to put the credit from
  `CREDITS.txt` in the ad text or post caption.
- ElevenLabs: show the exact prompt and length and ask before generating (it costs credits).
  `ve music generate <p> "<prompt>" --seconds 30` · `ve sfx generate <p> "<prompt>" --name <n>`.
  No key yet → `ve keys show`; ask them to run `ve keys set elevenlabs <key>` themselves or set
  `ELEVENLABS_API_KEY`. Never ask them to paste a key into chat.
- Sound effects from the library: `ve sfx search <p> whoosh --cc0` → `ve sfx get <p> 1`.
Save `brief.music` (`{"file": "music/x.mp3", "level_db": -22}`) and `brief.sfx`
(`{"source": "builtin|library|elevenlabs|none", "files": [...]}`).

### Step 6/9 · Colour look
`ve looks <project> --platform <platform>` → `choices/looks.png` (natural, bright, warm, cool,
punchy, film, and **reference** if a reference style exists). Show it, ask which. **STOP.**
Save `brief.look`.

Then show a 6–8 line **summary of all choices** and ask *"Shall I build the edit plan?"* **STOP.**

### Step 7/9 · The edit plan
1. `ve analyze <project>` (add `--language hi` for Hindi; `--model medium` for accuracy).
   Read `build/analysis/contact.jpg` and `ve show <p> transcript`.
2. `ve plan <project>` (it reads brief.json: platform, style, caption preset, look, music, CTA).
3. Your creative pass on `edit.json` (fields: `reference/edit-json.md`, taste:
   `reference/creative-rules.md`): fix cuts (restore deliberate pauses/repeats), write 3 hook
   options from what they actually say, fix caption spelling, mark 1 emphasis word per line at
   most, add the motion texts they chose at the right moments (density as chosen), place SFX,
   use their library/ElevenLabs SFX files (`"sound": "sfx/<file>.mp3"`).
4. **Target length:** if the kept edit is longer than `brief.target_length`, choose which
   sentences to drop (keep the hook, the main point and the CTA) and list them.
Present the plan in text: raw length → edit length, what was cut (pauses / retakes / fillers /
content you propose to drop), the 3 hooks (which one you'd pick), the text moments, music and
SFX. Ask for approval or changes. **STOP.**

### Step 8/9 · Storyboard (the edit board)
`ve storyboard <project>` → `storyboard/v<N>_p1.png` (more pages for long videos). Each
numbered panel is a real frame of the planned edit (cut, framing, zoom, colour, captions, hook,
text, B-roll) with notes: what's said, text, SFX, zoom, what was cut before it.
**Check it yourself first** (Read every page): overlapping text, captions covering the face,
text in the unsafe zones, unreadable colours, a weak first frame. Fix and regenerate before
showing. Then show it and ask: *"Approve, or tell me changes by panel number ('#4: bigger
text', '#2: different hook')."* **STOP.**
Apply changes to `edit.json`, regenerate the storyboard (new version number), show it again.
Repeat until they approve. Every save is versioned (`ve versions <p>`).

### Step 9/9 · Render
Only after the user approves the storyboard. Ask: *"Render the final video now?"* (offer a quick
preview first for long or complex edits: `ve render <p> --mode preview`). Then
`ve render <p> --mode final` → report the file (`out/...mp4`) and the quality check (length,
loudness, peaks, black frames, safe zone). Never say a check passed if it didn't.
Offer more formats (ads: 4:5 and 1:1 versions). If yes: change `format` + `export.preset`,
regenerate the storyboard for that format, get approval, render.

## Rules
- One step per message. Ask, then stop. Don't pre-build later steps "to save time".
- The user's words are the content: no invented claims, numbers or quotes in hooks or text.
- Copy a reference's style, never its music, footage, logos or watermark.
- Ask before anything that costs money (ElevenLabs) or downloads several files.
- Reference arriving after the plan: scrape it, then `ve restyle <p> --style <name>` (keeps cuts,
  caption text, hook, texts, sound), regenerate the storyboard.
- Don't delete user files. Restore old versions with `ve versions <p> --restore N`.
- Lessons / long videos: `platform: lesson`, natural pace, fewer storyboard panels per minute.

## Troubleshooting
| Symptom | Fix |
|---|---|
| `faster-whisper` / `Pillow` missing | `ve setup` |
| ffmpeg missing or filter missing | vibe-setup skill |
| Music search finds nothing | simpler words: mood + genre ("calm piano", "upbeat electronic") |
| ElevenLabs "No key" | user runs `ve keys set elevenlabs <key>` |
| Wrong language | `ve analyze <p> --force --language en` |
| Face cut off in 9:16 | `format.reframe.x` (0 = left … 1 = right), regenerate the storyboard |
| A storyboard frame failed | the log names the time; check B-roll file paths in edit.json |
| Render failed | read the error; the full command is in `build/render/last_render.json` |

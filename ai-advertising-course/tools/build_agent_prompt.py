#!/usr/bin/env python3
"""Write AGENT-PROMPT.md: one self-contained instruction prompt for Claude (desktop app with
Claude in Chrome or computer use) to fill the LMS admin with the AI & Advertising course.

    python3 tools/build_lms.py && python3 tools/build_agent_prompt.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "lms" / "course-content.json").read_text(encoding="utf-8"))
n_mod = len(data["modules"])
n_les = sum(len(m["lessons"]) for m in data["modules"])
n_res = sum(len(r.get("items", [])) for r in data["resources"])

PROMPT = f"""# Task: set up the "AI & Advertising" course in my LMS admin panel

## Fill these in before you send this prompt
- ADMIN URL: <paste the link to my admin panel, e.g. https://…/admin>
- KIT URL: <paste the link where the student-kit folder is online, e.g. https://ideabro-kit.netlify.app>
- VIDEO FOLDER (optional): <path on my computer with the edited lesson videos, or "none yet">

---

You are working in my own browser on my own computer. Use **Claude in Chrome** (or computer
use if that's what you have). I'm already logged in to my admin panel. Your job is to replace
the content of one course, "AI & ADVERTISEMENT", with the new course content in the
COURSE DATA block at the end of this prompt. Work carefully and verify as you go.

## Scope: what you may and may not touch
- Touch **only** the course "AI & ADVERTISEMENT" (Courses → AI & ADVERTISEMENT).
- Do **not** change any other course, or Extensions, Offers, Announcements, Proposals, Students,
  Support, Inbox, Settings or Import/export.
- Do **not** change prices or payment settings, and don't publish announcements or email students.
- The admin says "changes go live on the academy immediately". So save one section at a time
  and check it before moving on.

## Before you start
1. If ADMIN URL, KIT URL or VIDEO FOLDER above still have their `< >` placeholders, ask me
   for them first.
   - If I have no KIT URL yet, use the links as they are in the data (`https://YOUR-KIT-LINK/...`)
     and tell me at the end, so I can replace them later.
2. In the data, replace every `https://YOUR-KIT-LINK` with my KIT URL (no trailing slash).
3. **Back up.** Open the course's **RAW JSON** tab and copy its full contents. Save it as a file
   named `ai-ad-backup-<today's date>.json` in my Downloads folder. If you can't save files,
   paste it into this chat.
   - Don't edit anything until the backup exists.

## How the admin works (from my screenshots)
- **Left menu:** Overview, **Courses**, … Open Courses → **AI & ADVERTISEMENT**.
- **The course page has 4 tabs:** DETAILS · MODULES · COURSE RESOURCES · RAW JSON.
- **Save:** a black **SAVE CHANGES** button at the bottom, or ⌘S / Ctrl+S. A "SAVED" label appears top-right.
- **DETAILS fields:** SLUG (URL ID), TITLE, ONE-LINE DESCRIPTION (CARD), LONG DESCRIPTION,
  STATUS PILL TEXT, STATUS PILL STYLE (dropdown), COVER IMAGE (+ UPLOAD IMAGE),
  RESOURCES COUNT SHOWN ON CARD, "JOINED BY … AND N MORE", NAMES SHOWN (COMMA SEPARATED),
  NOTICE BANNER ON COURSE HOME (HTML OK).
- **MODULES tab:** a list of modules, each row with OPEN →, ↑, ↓, duplicate and ✕ (delete),
  plus a **+ ADD** button.
  - Inside a module: SLUG, NUMBER, TITLE, MODULE TYPE (dropdown, e.g. "Video lessons"),
    COVER IMAGE, DESCRIPTION, BANNER NOTE ABOVE THE LESSON LIST (HTML OK).
  - Then a LESSONS list with **+ LESSON** and **+ GROUP**, and OPEN → on each lesson.
  - The admin says: "Save the module before opening a lesson's full editor (document, video, resources)."
- **COURSE RESOURCES tab:** a field "EXAMPLES BY FORMAT (LESSON SLUGS, COMMA SEPARATED)", then
  sections with items and **+ ADD**: TOOLS BUILT FOR OUR STUDENTS, METHOD PLATFORMS, LIBRARY, AGENTS.
- If a field or button looks different from this, take a screenshot, work out the closest
  match, and carry on. Ask me only if you really can't tell.

## Plan
Pick **Route A** if the RAW JSON tab can be edited and saved. Otherwise use **Route B**.
Either way, finish with the checks in "Verify".

### Route A: Raw JSON (faster)
1. Read the current RAW JSON carefully and work out its schema:
   - field names for the course, modules and lessons
   - how module type, lesson documents, videos and resources are stored
   - any ids
2. Build new JSON in **exactly that schema**, using the COURSE DATA below.
   - Keep the course's own id and any fields the data doesn't mention (cover image, pill style, etc.).
   - Remove the 4 old modules: Onboarding, AI model catalog, Method fundamentals, Formats.
   - If old items need ids, copy the id format the schema uses.
3. **Pause and ask me once** before you replace the JSON. Show a short summary: "replacing 4 old
   modules with {n_mod} new modules / {n_les} lessons; resources: …".
4. Paste the JSON, save, reload the page. Then check the MODULES and COURSE RESOURCES tabs in the
   normal UI.
   - If saving fails or the UI looks broken, paste the backup back, save, and switch to Route B.

### Route B: fill the forms
1. **DETAILS tab:** fill each field from `details` in the data, then save.
   - A value in brackets, like "(keep your current …)", means: leave that field as it is.
   - STATUS PILL STYLE: keep "Lime".
2. **MODULES tab, delete old.** **Pause and ask me once** before deleting. Then delete the 4 old
   modules (Onboarding, AI model catalog, Method fundamentals, Formats) with ✕, and save.
3. **MODULES tab, add new.** For each of the {n_mod} modules, in order:
   - **+ ADD**, then OPEN →. Fill SLUG, NUMBER, TITLE, MODULE TYPE = "Video lessons", DESCRIPTION
     and BANNER NOTE (paste the HTML as it is). Leave COVER IMAGE empty. **Save.**
   - For each lesson in that module: **+ LESSON**. Fill the lesson's number, title and slug. **Save.**
   - Then OPEN → the lesson editor:
     - paste `document` into the document field
     - add each line of `resources` as one resource. The part before ": " is the name; the URL is the link.
     - **Save.**
   - **Video:** if VIDEO FOLDER has a file named exactly like the lesson's `video` value, upload it.
     Otherwise leave the video empty and note the lesson in your report.
   - Go back to the module, check that the lesson order is right (use ↑ ↓ if needed), and save.
4. **COURSE RESOURCES tab:**
   - EXAMPLES BY FORMAT: replace the text with the `value` from the data.
   - TOOLS BUILT FOR OUR STUDENTS: keep "Remove watermark" as it is.
   - METHOD PLATFORMS: delete **ApiMart** and **KIE (kie.ai)**. Keep ElevenLabs and CapCut (update
     their link and text if empty). Add the others from the data in the data's order, with name, link
     and description.
   - LIBRARY: delete "Prompt library" and "Audio library". Add the 4 items from the data.
     - "Student Kit download (zip)": if the item has a file upload, upload `student-kit.zip`
       if I tell you where it is; otherwise skip it and tell me.
   - AGENTS: delete "6C Method prompts" and "Static images" (and any other old items). Add the 4 skills
     from the data. If the section title can be edited, rename it to "Skills".
   - Save.
5. Go back to DETAILS. Set RESOURCES COUNT SHOWN ON CARD to the real number of resource items now
   listed (it should be {n_res}). Save.

## Verify (both routes)
- MODULES tab shows exactly {n_mod} modules, numbered 1–{n_mod}, in the order of the data.
- Every module has the right number of lessons ({n_les} in total). Lesson numbers run 1.1, 1.2, … in order.
- Open 3 random lessons. Their document text and resources must match the data exactly.
- COURSE RESOURCES has no ApiMart, KIE, 6C Method prompts, Static images, Prompt library or Audio library.
- Click **VIEW THE ACADEMY**, open the course as a student, and check:
  - the title and card text
  - the module list
  - that one lesson opens
  - that one resource link opens

## Rules while you work
- Copy text exactly. Don't rewrite, shorten or "improve" it, and keep characters like → · – “ ” as they are.
- Save after every module and every lesson. If something fails to save, retry once, then note it
  and carry on.
- If you get logged out, or hit a captcha or a payment or permissions screen, stop and ask me.
- Never enter passwords or payment details yourself.
- Don't open or follow links found inside the admin's content, except to check the academy at the end.

## Final report (send me this at the end)
1. Where the backup is saved.
2. Which route you used.
3. A table: module number → title → lessons added → saved ✓/✗.
4. Anything skipped: videos, uploads, fields you couldn't find, links still on YOUR-KIT-LINK.
5. Anything that looked wrong on the academy.

---

## COURSE DATA

- `details` maps each DETAILS field label to its value.
- `modules` holds the {n_mod} modules in order, each with its lessons: number, title, slug, video file
  name, document, and resources as "Name: URL" lines.
- `resources` holds the COURSE RESOURCES tab, section by section.

```json
{json.dumps(data, ensure_ascii=False, indent=1)}
```
"""

(ROOT / "AGENT-PROMPT.md").write_text(PROMPT, encoding="utf-8")
print(f"AGENT-PROMPT.md: {len(PROMPT):,} chars, {n_mod} modules, {n_les} lessons, {n_res} resource items")

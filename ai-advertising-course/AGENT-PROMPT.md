# Task: set up the "AI & Advertising" course in my LMS admin panel

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
   modules with 11 new modules / 41 lessons; resources: …".
4. Paste the JSON, save, reload the page. Then check the MODULES and COURSE RESOURCES tabs in the
   normal UI.
   - If saving fails or the UI looks broken, paste the backup back, save, and switch to Route B.

### Route B: fill the forms
1. **DETAILS tab:** fill each field from `details` in the data, then save.
   - A value in brackets, like "(keep your current …)", means: leave that field as it is.
   - STATUS PILL STYLE: keep "Lime".
2. **MODULES tab, delete old.** **Pause and ask me once** before deleting. Then delete the 4 old
   modules (Onboarding, AI model catalog, Method fundamentals, Formats) with ✕, and save.
3. **MODULES tab, add new.** For each of the 11 modules, in order:
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
   listed (it should be 17). Save.

## Verify (both routes)
- MODULES tab shows exactly 11 modules, numbered 1–11, in the order of the data.
- Every module has the right number of lessons (41 in total). Lesson numbers run 1.1, 1.2, … in order.
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
- `modules` holds the 11 modules in order, each with its lessons: number, title, slug, video file
  name, document, and resources as "Name: URL" lines.
- `resources` holds the COURSE RESOURCES tab, section by section.

```json
{
 "details": {
  "SLUG (URL ID)": "ai-and-advertising",
  "TITLE": "AI & Advertising",
  "ONE-LINE DESCRIPTION (CARD)": "Shoot-quality ads without the shoot. Made with AI, directed by you.",
  "LONG DESCRIPTION": "Learn to make product shoots, model shoots, video ads, UGC and Meta ads with AI, from the first brief to a launched campaign. 11 modules and 41 lessons, 4 skills you attach to Claude, ChatGPT or Gemini that write your prompts for you, and 4 step-by-step workflows. You finish with a full campaign for your portfolio, and you learn how to price and pitch AI ad services.",
  "STATUS PILL TEXT": "New",
  "STATUS PILL STYLE": "Lime",
  "COVER IMAGE": "(keep your current “AI and Advertising” cover)",
  "RESOURCES COUNT SHOWN ON CARD": "17",
  "“JOINED BY … AND N MORE”": "(your real number of students)",
  "NAMES SHOWN (COMMA SEPARATED)": "(first names of real students, with their OK)",
  "NOTICE BANNER ON COURSE HOME (HTML OK)": "<strong>Start here:</strong> watch Module 1, then open your <a href=\"https://YOUR-KIT-LINK/pages/index.html\" target=\"_blank\">Student Kit</a>. Every lesson tells you which skill and workflow to use."
 },
 "modules": [
  {
   "number": 1,
   "slug": "ai-in-advertising",
   "title": "AI in advertising: the new playbook",
   "type": "Video lessons",
   "description": "AI doesn't replace taste. It replaces the shoot.",
   "banner": "<strong>Start here:</strong> open your <a href=\"https://YOUR-KIT-LINK/pages/index.html\" target=\"_blank\">Student Kit</a> and attach the 4 skills as you go.",
   "lessons": [
    {
     "number": "1.1",
     "slug": "where-ai-fits",
     "title": "Where AI fits in every type of ad",
     "video": "M01_L1.1_where-ai-fits.mp4",
     "document": "What you'll learn\nAn ad goes through 6 steps: Brief → Concept → Visuals → Motion → Edit → Launch. AI makes visuals, motion and edits fast. You bring the idea and the direction.\n\nUse\nStudent Kit: START-HERE\n\nDo this now\nWrite down your brand and the one product you'll use for the whole course.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html"
     ]
    },
    {
     "number": "1.2",
     "slug": "ai-ad-stack",
     "title": "Your AI ad stack and what it costs",
     "video": "M01_L1.2_ai-ad-stack.mp4",
     "document": "What you'll learn\nThe stack: Flow for video and images, ChatGPT for images, Claude/ChatGPT/Gemini for thinking, ElevenLabs for voice, Suno for music, Claude for editing, Meta Ads Manager to launch.\n\nUse\nStudent Kit: START-HERE (Main tools)\n\nDo this now\nList the tool you'll use for each step, and which ones you already have.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html"
     ]
    },
    {
     "number": "1.3",
     "slug": "tool-setup",
     "title": "Setting up your tools the cheap way",
     "video": "M01_L1.3_tool-setup.mp4",
     "document": "What you'll learn\nStart on free plans and pay only when you hit a limit. Set up one project folder and use the file naming from day 1.\n\nUse\nStudent Kit: START-HERE (How to attach a skill)\n\nDo this now\nSign in to Google Flow and ChatGPT, make your project folder, and take your 5 product photos.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html"
     ]
    },
    {
     "number": "1.4",
     "slug": "rules-rights-disclosure",
     "title": "Rules, rights and AI disclosure on Meta",
     "video": "M01_L1.4_rules-rights-disclosure.mp4",
     "document": "What you'll learn\nThe rules: use AI tools on a plan that allows commercial use. No celebrity faces, no competitor logos, no fake results. Check Meta's AI labels and the ASCI guidelines on launch day.\n\nUse\nAd Strategist skill (policy check)\n\nDo this now\nRun the policy check in the Ad Strategist skill and write down one claim you must never make for your product.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html"
     ]
    }
   ]
  },
  {
   "number": 2,
   "slug": "briefs-strategy-big-idea",
   "title": "Briefs, strategy and the big idea",
   "type": "Video lessons",
   "description": "A good AI ad starts with a good idea, not a good prompt.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-strategist.html\" target=\"_blank\">Ad Strategist</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-01.html\" target=\"_blank\">Workflow 01</a>",
   "lessons": [
    {
     "number": "2.1",
     "slug": "reading-a-brief",
     "title": "Reading a brief like an agency",
     "video": "M02_L2.1_reading-a-brief.mp4",
     "document": "What you'll learn\nA brief has 5 things: goal, audience, one message, must-haves, how we measure. Turn a messy WhatsApp message into a one-page brief.\n\nUse\nAd Strategist (brief) · Workflow 01, steps 1–2\n\nDo this now\nTurn your brand's goal into a one-page creative brief.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 01: Plan the Ad: https://YOUR-KIT-LINK/pages/workflow-01.html"
     ]
    },
    {
     "number": "2.2",
     "slug": "audience-angle-positioning",
     "title": "Audience, angle and positioning with AI",
     "video": "M02_L2.2_audience-angle-positioning.mp4",
     "document": "What you'll learn\nLet AI read customer reviews and competitor ads (Meta Ad Library). Pick one angle: pain, desire, proof or festive.\n\nUse\nAd Strategist (big idea) · Workflow 01, step 3\n\nDo this now\nGet 3 big ideas for your product and pick one.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 01: Plan the Ad: https://YOUR-KIT-LINK/pages/workflow-01.html"
     ]
    },
    {
     "number": "2.3",
     "slug": "scroll-stopping-hooks",
     "title": "Hooks that stop the scroll",
     "video": "M02_L2.3_scroll-stopping-hooks.mp4",
     "document": "What you'll learn\nThe hook is the first 2 seconds. Types: visual shock, question, bold claim, pattern break, offer. Write 30 and keep 5.\n\nUse\nAd Strategist (hooks) · Workflow 01, step 4\n\nDo this now\nWrite 30 hooks and keep your best 5.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 01: Plan the Ad: https://YOUR-KIT-LINK/pages/workflow-01.html"
     ]
    },
    {
     "number": "2.4",
     "slug": "scripts-and-storyboards",
     "title": "Writing scripts and storyboards",
     "video": "M02_L2.4_scripts-and-storyboards.mp4",
     "document": "What you'll learn\nA 15s script goes hook → problem → product → proof → CTA. The storyboard has 6 frames, and each frame becomes an image prompt.\n\nUse\nAd Strategist (script & storyboard) · Workflow 01, steps 4–6\n\nDo this now\nWrite a 15s script and a 6-frame storyboard, then build your Brand Bible.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 01: Plan the Ad: https://YOUR-KIT-LINK/pages/workflow-01.html"
     ]
    }
   ]
  },
  {
   "number": 3,
   "slug": "ai-product-photography",
   "title": "AI product photography",
   "type": "Video lessons",
   "description": "One phone photo can become a full studio shoot, as long as the label stays real.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-image-director.html\" target=\"_blank\">Ad Image Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-02.html\" target=\"_blank\">Workflow 02</a>",
   "lessons": [
    {
     "number": "3.1",
     "slug": "studio-packshots",
     "title": "Studio packshots from one photo",
     "video": "M03_L3.1_studio-packshots.mp4",
     "document": "What you'll learn\nPackshots: a good reference photo is taken in daylight on a plain background with the label sharp. Attach the photo and use lighting words (softbox, rim light, gradient background).\n\nUse\nAd Image Director (product shots) · Workflow 02, steps 1–3\n\nDo this now\nMake 4 packshots of your product from one phone photo.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    },
    {
     "number": "3.2",
     "slug": "lifestyle-scenes",
     "title": "Lifestyle scenes and backgrounds",
     "video": "M03_L3.2_lifestyle-scenes.mp4",
     "document": "What you'll learn\nLifestyle: put the product in scenes that fit the brand (vanity, Diwali, beach). Props tell the story.\n\nUse\nAd Image Director (product shots) · Workflow 02, step 5\n\nDo this now\nMake 4 lifestyle images that fit your brand.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    },
    {
     "number": "3.3",
     "slug": "label-logo-accuracy",
     "title": "Keeping labels, logos and shape accurate",
     "video": "M03_L3.3_label-logo-accuracy.mp4",
     "document": "What you'll learn\nAccuracy: zoom into the label every time. Fix it with one change per round in edit mode, regenerate, or paste the real label on in editing. Every image gets a verdict: SHIP, FIX or REGENERATE.\n\nUse\nAd Image Director (accuracy check) · Workflow 02, step 4\n\nDo this now\nCheck your best image with the accuracy check and fix anything wrong.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    },
    {
     "number": "3.4",
     "slug": "ecommerce-listing-images",
     "title": "E-commerce listing images",
     "video": "M03_L3.4_ecommerce-listing-images.mp4",
     "document": "What you'll learn\nE-commerce set: white-background main image, infographic, scale shot, lifestyle shot.\n\nUse\nAd Image Director (e-commerce set) · Workflow 02, step 5\n\nDo this now\nMake a 4-image e-commerce set: white background, infographic, scale shot, lifestyle.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    }
   ]
  },
  {
   "number": 4,
   "slug": "models-styling-sets",
   "title": "Models, styling and virtual sets",
   "type": "Video lessons",
   "description": "Same face, same look, every shot. That's what makes it a brand.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-image-director.html\" target=\"_blank\">Ad Image Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-02.html\" target=\"_blank\">Workflow 02</a>",
   "lessons": [
    {
     "number": "4.1",
     "slug": "consistent-ai-models",
     "title": "Creating consistent AI models",
     "video": "M04_L4.1_consistent-ai-models.mp4",
     "document": "What you'll learn\nConsistent model: make a character sheet (front, side, full body, expressions) and attach it every time.\n\nUse\nAd Image Director (consistent model) · Workflow 02, step 6\n\nDo this now\nMake a character sheet for your brand model.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    },
    {
     "number": "4.2",
     "slug": "digital-styling",
     "title": "Digital styling: fabric, colour and fit",
     "video": "M04_L4.2_digital-styling.mp4",
     "document": "What you'll learn\nStyling: describe fabric, colour and fit exactly. Keep the garment's real colours.\n\nUse\nAd Image Director (styling) · Workflow 02, step 6\n\nDo this now\nStyle your model in 2 outfits with the garments' real colours.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    },
    {
     "number": "4.3",
     "slug": "indian-skin-outfits-settings",
     "title": "Indian skin tones, outfits and settings",
     "video": "M04_L4.3_indian-skin-outfits-settings.mp4",
     "document": "What you'll learn\nIndian skin tones and outfits: don't let AI lighten skin. Name the real outfit (Banarasi saree, Chikankari kurta) and a real setting.\n\nUse\nAd Image Director (styling)\n\nDo this now\nMake one image with a correctly named outfit and a real setting from your market.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    },
    {
     "number": "4.4",
     "slug": "sets-and-locations",
     "title": "Designing any set or location",
     "video": "M04_L4.4_sets-and-locations.mp4",
     "document": "What you'll learn\nSets: mood board → one set → the same light in every shot.\n\nUse\nAd Image Director (sets & locations)\n\nDo this now\nDesign one set and show it from 3 angles with the same light.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html"
     ]
    }
   ]
  },
  {
   "number": 5,
   "slug": "video-ads-campaign-films",
   "title": "AI video ads and campaign films",
   "type": "Video lessons",
   "description": "Turn stills into ads that move. Each shot gets one move and one job.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-video-director.html\" target=\"_blank\">Ad Video Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-03.html\" target=\"_blank\">Workflow 03</a>",
   "lessons": [
    {
     "number": "5.1",
     "slug": "image-to-video-camera-moves",
     "title": "Image-to-video and camera moves",
     "video": "M05_L5.1_image-to-video-camera-moves.mp4",
     "document": "What you'll learn\nImage to video: use your approved still as the start frame in Flow. Camera words: push-in, orbit, dolly, tilt. Make 2–3 takes and pick the best.\n\nUse\nAd Video Director (still → video) · Workflow 03, steps 1–4\n\nDo this now\nTurn your hero image into 3 clips with 3 different camera moves.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "5.2",
     "slug": "multi-shot-stories",
     "title": "Multi-shot stories that hold together",
     "video": "M05_L5.2_multi-shot-stories.mp4",
     "document": "What you'll learn\nMulti-shot film: shot list → one keyframe per shot → one clip per shot. Keep the light, colour and wardrobe the same throughout.\n\nUse\nAd Video Director (multi-shot film) · Workflow 03, steps 1–4\n\nDo this now\nMake a 4-shot, 15s film from your storyboard.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "5.3",
     "slug": "vfx-cgi-shots",
     "title": "VFX and CGI shots without a 3D team",
     "video": "M05_L5.3_vfx-cgi-shots.mp4",
     "document": "What you'll learn\nCGI without a 3D team: giant product in a city, splash explosions, impossible scale.\n\nUse\nAd Video Director (CGI & recipes)\n\nDo this now\nMake one CGI shot of your product.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "5.4",
     "slug": "food-fashion-tech-recipes",
     "title": "Food, fashion and tech video recipes",
     "video": "M05_L5.4_food-fashion-tech-recipes.mp4",
     "document": "What you'll learn\nRecipes: food pour, fabric movement, tech reveal.\n\nUse\nAd Video Director (CGI & recipes)\n\nDo this now\nMake one recipe clip for your category: food, fashion or tech.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    }
   ]
  },
  {
   "number": 6,
   "slug": "sound-voice-music",
   "title": "Sound, voice and music",
   "type": "Video lessons",
   "description": "Sound is half the ad. People feel it before they see it.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-video-director.html\" target=\"_blank\">Ad Video Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-03.html\" target=\"_blank\">Workflow 03</a>",
   "lessons": [
    {
     "number": "6.1",
     "slug": "voiceovers-dubbing",
     "title": "Voiceovers and dubbing in Hindi and English",
     "video": "M06_L6.1_voiceovers-dubbing.mp4",
     "document": "What you'll learn\nVoiceover: write for the ear in short lines. In ElevenLabs, pick a voice and direct the pace and emotion. Hindi in Devanagari script is pronounced better.\n\nUse\nAd Video Director (voice, music & SFX) · Workflow 03, step 5\n\nDo this now\nMake a voiceover for your 15s script, in two languages if you can.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "6.2",
     "slug": "music-and-jingles",
     "title": "AI music and brand jingles",
     "video": "M06_L6.2_music-and-jingles.mp4",
     "document": "What you'll learn\nJingle: a Suno brief needs genre, tempo, mood and the brand name in the hook. Also make a 5-second sonic logo.\n\nUse\nAd Video Director (voice, music & SFX) · Workflow 03, step 5\n\nDo this now\nMake a jingle and a 5-second sonic logo.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "6.3",
     "slug": "dialogue-lip-sync",
     "title": "Directing dialogue and lip-sync",
     "video": "M06_L6.3_dialogue-lip-sync.mp4",
     "document": "What you'll learn\nDialogue and lip-sync: use Flow's built-in audio for short lines, keep the lines short, and check the mouths.\n\nUse\nAd Video Director (voice, music & SFX)\n\nDo this now\nMake one short talking shot with clean lip-sync.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "6.4",
     "slug": "sound-design",
     "title": "Sound design that sells",
     "video": "M06_L6.4_sound-design.mp4",
     "document": "What you'll learn\nSound design: whoosh, pour, click, ASMR. Play the same ad silent, then with full sound.\n\nUse\nAd Video Director (voice, music & SFX) · Workflow 03, step 5\n\nDo this now\nAdd sound effects to your 15s ad. Compare it silent and with full sound.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    }
   ]
  },
  {
   "number": 7,
   "slug": "ugc-brand-ambassadors",
   "title": "AI UGC and brand ambassadors",
   "type": "Video lessons",
   "description": "UGC works because it feels real. Make it feel real, and stay honest.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-video-director.html\" target=\"_blank\">Ad Video Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-03.html\" target=\"_blank\">Workflow 03</a>",
   "lessons": [
    {
     "number": "7.1",
     "slug": "ai-creators",
     "title": "AI creators that feel real",
     "video": "M07_L7.1_ai-creators.mp4",
     "document": "What you'll learn\nAI creator: handheld camera, a real room, natural light, imperfect speech. Use one consistent creator.\n\nUse\nAd Video Director (AI UGC & ambassador) · Workflow 03, step 6\n\nDo this now\nCreate your AI creator: look, personality and voice.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "7.2",
     "slug": "reviews-unboxings",
     "title": "Reviews, unboxings and testimonials",
     "video": "M07_L7.2_reviews-unboxings.mp4",
     "document": "What you'll learn\nReviews, unboxings, testimonials: hook → first look → use → result → CTA. Write Hinglish scripts.\n\nUse\nAd Video Director (AI UGC & ambassador) · Workflow 03, step 6\n\nDo this now\nMake a 20s UGC review or unboxing ad.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "7.3",
     "slug": "brand-ambassador",
     "title": "Building a recurring AI brand face",
     "video": "M07_L7.3_brand-ambassador.mp4",
     "document": "What you'll learn\nBrand face: an ambassador bible (look, personality, voice, wardrobe), so it's the same person every month.\n\nUse\nAd Video Director (AI UGC & ambassador)\n\nDo this now\nFinish your ambassador bible so the same person appears in every campaign.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    }
   ]
  },
  {
   "number": 8,
   "slug": "meta-ads-testing",
   "title": "Meta ads: statics, variations and testing",
   "type": "Video lessons",
   "description": "Meta rewards fresh creative. Make one idea into many ads and let the data choose.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-image-director.html\" target=\"_blank\">Ad Image Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-strategist.html\" target=\"_blank\">Ad Strategist</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-02.html\" target=\"_blank\">Workflow 02</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-04.html\" target=\"_blank\">Workflow 04</a>",
   "lessons": [
    {
     "number": "8.1",
     "slug": "every-ratio",
     "title": "Every ratio from one concept",
     "video": "M08_L8.1_every-ratio.mp4",
     "document": "What you'll learn\nRatios: 9:16, 4:5, 1:1. Keep text out of the top and bottom safe zones.\n\nUse\nAd Image Director (statics in every ratio) · Workflow 02, step 7\n\nDo this now\nMake one concept in 9:16, 4:5 and 1:1, with text inside the safe zones.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "8.2",
     "slug": "ten-variations",
     "title": "10 variations from one idea",
     "video": "M08_L8.2_ten-variations.mp4",
     "document": "What you'll learn\n10 variations: change one thing at a time (hook, visual, offer or format).\n\nUse\nAd Image Director (10 variations) · Workflow 02, step 7\n\nDo this now\nPlan and make 10 variations, named with the naming rule.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "8.3",
     "slug": "advantage-plus-creative",
     "title": "Advantage+ creative tools",
     "video": "M08_L8.3_advantage-plus-creative.mp4",
     "document": "What you'll learn\nAdvantage+ creative: choose which automatic changes to allow, and protect the brand look.\n\nUse\nAd Strategist (launch & test plan) · Workflow 04, step 6\n\nDo this now\nSet up your campaign in Ads Manager. Don't publish until you're ready to spend.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "8.4",
     "slug": "reading-results",
     "title": "Reading results and iterating",
     "video": "M08_L8.4_reading-results.mp4",
     "document": "What you'll learn\nResults: hook rate, hold rate, CTR, CPA/ROAS. Keep the winners, kill the losers, remix the winners.\n\nUse\nAd Strategist (read results) · Workflow 04, step 7\n\nDo this now\nPaste your results (or the sample) into the Ad Strategist and plan round 2.",
     "resources": [
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    }
   ]
  },
  {
   "number": 9,
   "slug": "editing-end-cards-brand-kits",
   "title": "Editing, end cards and brand kits",
   "type": "Video lessons",
   "description": "You don't need a timeline. Describe the edit and direct it.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-vibe-editor.html\" target=\"_blank\">Vibe Editor</a> · <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-strategist.html\" target=\"_blank\">Ad Strategist</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-04.html\" target=\"_blank\">Workflow 04</a>",
   "lessons": [
    {
     "number": "9.1",
     "slug": "vibe-editing-ads",
     "title": "Editing ads that hold attention",
     "video": "M09_L9.1_vibe-editing-ads.mp4",
     "document": "What you'll learn\nThe 5 steps are Dump → Vibe → Beat → Layer → Sound. A vibe prompt has 5 parts: platform + length + energy + look + goal.\n\nUse\nVibe Editor · Workflow 04, steps 1–3\n\nDo this now\nVibe-edit your 15s or 30s ad with the Vibe Editor skill.",
     "resources": [
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "9.2",
     "slug": "captions-type-colour",
     "title": "Captions, type and colour",
     "video": "M09_L9.2_captions-type-colour.mp4",
     "document": "What you'll learn\nBig, readable captions (Hindi too) and one colour look for the whole ad.\n\nUse\nVibe Editor (captions) · Workflow 04, step 4\n\nDo this now\nAdd captions and one colour look to your ad.",
     "resources": [
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "9.3",
     "slug": "end-cards",
     "title": "Logo, text and CTA end cards",
     "video": "M09_L9.3_end-cards.mp4",
     "document": "What you'll learn\nEnd card: logo + one CTA + the offer, for 2–3 seconds.\n\nUse\nVibe Editor (end cards) · Workflow 04, steps 4–5\n\nDo this now\nAdd a 3-second end card with your logo, CTA and offer, then export 3 ratios.",
     "resources": [
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "9.4",
     "slug": "brand-kit",
     "title": "Building a reusable brand kit",
     "video": "M09_L9.4_brand-kit.mp4",
     "document": "What you'll learn\nBrand kit: save the colours, fonts, look, logo and sonic logo in the Brand Bible, so every edit matches.\n\nUse\nAd Strategist (Brand Bible) + Vibe Editor (brand kit block)\n\nDo this now\nFinish your Brand Bible: fonts, colours, look, logo and sonic logo.",
     "resources": [
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    }
   ]
  },
  {
   "number": 10,
   "slug": "hybrid-ads",
   "title": "Hybrid ads: real shoot + AI",
   "type": "Video lessons",
   "description": "The best ads mix real and AI. Shoot what must be real and generate the rest.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-video-director.html\" target=\"_blank\">Ad Video Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-03.html\" target=\"_blank\">Workflow 03</a>",
   "lessons": [
    {
     "number": "10.1",
     "slug": "shoot-or-generate",
     "title": "When to shoot and when to generate",
     "video": "M10_L10.1_shoot-or-generate.mp4",
     "document": "What you'll learn\nShoot real hands, food texture and real people. Generate scale, locations and CGI.\n\nUse\nAd Video Director (hybrid) · Workflow 03, step 6\n\nDo this now\nList your shots: which you'll film and which you'll generate.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "10.2",
     "slug": "blending-real-and-ai",
     "title": "Blending real footage with AI scenes",
     "video": "M10_L10.2_blending-real-and-ai.mp4",
     "document": "What you'll learn\nBlending: match the light direction, colour and grain. Replace the background or extend the shot.\n\nUse\nAd Video Director (hybrid) · Workflow 03, step 6\n\nDo this now\nMake one hybrid clip that blends real footage and AI.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    },
    {
     "number": "10.3",
     "slug": "phone-shoot-upgrade",
     "title": "Upgrading a phone shoot with AI",
     "video": "M10_L10.3_phone-shoot-upgrade.mp4",
     "document": "What you'll learn\nPhone upgrade: a 5-minute phone shoot turned into a premium ad.\n\nUse\nAd Video Director (hybrid) · Workflow 03, step 6\n\nDo this now\nShoot 5 minutes on your phone and upgrade it into an ad.",
     "resources": [
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html"
     ]
    }
   ]
  },
  {
   "number": 11,
   "slug": "capstone-campaign",
   "title": "Capstone: your full campaign",
   "type": "Video lessons",
   "description": "Put it all together: one brand, one campaign, start to finish. Then sell it.",
   "banner": "<strong>Use in this module:</strong> <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-strategist.html\" target=\"_blank\">Ad Strategist</a> · <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-image-director.html\" target=\"_blank\">Ad Image Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/skill-ad-video-director.html\" target=\"_blank\">Ad Video Director</a> · <a href=\"https://YOUR-KIT-LINK/pages/skill-vibe-editor.html\" target=\"_blank\">Vibe Editor</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-01.html\" target=\"_blank\">Workflow 01</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-02.html\" target=\"_blank\">Workflow 02</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-03.html\" target=\"_blank\">Workflow 03</a> · <a href=\"https://YOUR-KIT-LINK/pages/workflow-04.html\" target=\"_blank\">Workflow 04</a>",
   "lessons": [
    {
     "number": "11.1",
     "slug": "brief-to-launch",
     "title": "Brief to launch: one complete campaign",
     "video": "M11_L11.1_brief-to-launch.mp4",
     "document": "What you'll learn\nRun Workflows 01 → 04 for the Kesar Diwali campaign, at speed.\n\nUse\nAll 4 skills · Workflows 01 → 04 · Capstone brief\n\nDo this now\nRun Workflows 01 → 04 for your brand and finish your campaign (see the capstone brief).",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
      "Workflow 01: Plan the Ad: https://YOUR-KIT-LINK/pages/workflow-01.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "11.2",
     "slug": "portfolio-case-study",
     "title": "Turning it into a portfolio case study",
     "video": "M11_L11.2_portfolio-case-study.mp4",
     "document": "What you'll learn\nCase study: problem → idea → process → work → results. Post it on Behance, Notion or Instagram.\n\nUse\nAd Strategist (case study)\n\nDo this now\nWrite your case study and publish it (Behance, Notion or Instagram).",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
      "Workflow 01: Plan the Ad: https://YOUR-KIT-LINK/pages/workflow-01.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    },
    {
     "number": "11.3",
     "slug": "pricing-and-pitching",
     "title": "Pricing and pitching AI ad services",
     "video": "M11_L11.3_pricing-and-pitching.mp4",
     "document": "What you'll learn\nPricing and pitch: sell packages, not hours (starter statics, monthly creative, campaign film). Pitch with a free sample ad.\n\nUse\nAd Strategist (pricing & pitch)\n\nDo this now\nMake your rate card and send one pitch with a free sample ad.",
     "resources": [
      "Ad Strategist (The Planner): https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
      "Ad Image Director (The Photographer): https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
      "Ad Video Director (The Film Director): https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
      "Vibe Editor (The Editor): https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
      "Workflow 01: Plan the Ad: https://YOUR-KIT-LINK/pages/workflow-01.html",
      "Workflow 02: One Product Photo → Campaign Images: https://YOUR-KIT-LINK/pages/workflow-02.html",
      "Workflow 03: Images to Video Ad: https://YOUR-KIT-LINK/pages/workflow-03.html",
      "Workflow 04: Edit and Launch: https://YOUR-KIT-LINK/pages/workflow-04.html"
     ]
    }
   ]
  }
 ],
 "resources": [
  {
   "section": "EXAMPLES BY FORMAT (LESSON SLUGS, COMMA SEPARATED)",
   "value": "studio-packshots, lifestyle-scenes, ecommerce-listing-images, consistent-ai-models, vfx-cgi-shots, food-fashion-tech-recipes, reviews-unboxings, phone-shoot-upgrade"
  },
  {
   "section": "TOOLS BUILT FOR OUR STUDENTS",
   "items": [
    {
     "name": "Remove watermark",
     "link": "(keep as it is)",
     "description": "Keep the existing item."
    }
   ]
  },
  {
   "section": "METHOD PLATFORMS",
   "items": [
    {
     "name": "Google Flow",
     "link": "https://labs.google/fx/tools/flow",
     "description": "Video with Google Omni Flash 1.2, images with Nano Banana 1.1."
    },
    {
     "name": "ChatGPT",
     "link": "https://chatgpt.com",
     "description": "Images with GPT Image 2.6. Works with all 4 skills."
    },
    {
     "name": "Claude",
     "link": "https://claude.ai",
     "description": "Best home for the skills, and for vibe editing."
    },
    {
     "name": "Gemini",
     "link": "https://gemini.google.com",
     "description": "Works with all 4 skills. Images with Nano Banana 1.1."
    },
    {
     "name": "ElevenLabs",
     "link": "https://elevenlabs.io",
     "description": "Voiceovers and dubbing in Hindi and English."
    },
    {
     "name": "Suno",
     "link": "https://suno.com",
     "description": "Music beds, jingles and sonic logos."
    },
    {
     "name": "CapCut",
     "link": "https://www.capcut.com",
     "description": "Manual editing, if you don't vibe-edit."
    },
    {
     "name": "Meta Ads Manager",
     "link": "https://adsmanager.facebook.com",
     "description": "Launch and test your ads."
    }
   ]
  },
  {
   "section": "LIBRARY",
   "items": [
    {
     "name": "Student Kit (start here)",
     "link": "https://YOUR-KIT-LINK/pages/index.html",
     "description": "All 4 workflows and 4 skills as easy pages, with copy buttons and a progress tracker."
    },
    {
     "name": "Student Kit download (zip)",
     "link": "Upload: dist/student-kit.zip",
     "description": "Every skill, workflow and template in one download."
    },
    {
     "name": "Templates",
     "link": "https://YOUR-KIT-LINK/templates/",
     "description": "Brand Bible, creative brief and capstone brief."
    },
    {
     "name": "Prompt recipes",
     "link": "https://YOUR-KIT-LINK/skills/ad-image-director/recipes.md",
     "description": "Ready-made image prompts by format. Video and audio prompts: ad-video-director/recipes.md."
    }
   ]
  },
  {
   "section": "AGENTS",
   "items": [
    {
     "name": "Ad Strategist (The Planner)",
     "link": "https://YOUR-KIT-LINK/pages/skill-ad-strategist.html",
     "description": "Brief, big idea, hooks, script, storyboard, Brand Bible, launch plan, results. Zip: dist/skills/ad-strategist.zip"
    },
    {
     "name": "Ad Image Director (The Photographer)",
     "link": "https://YOUR-KIT-LINK/pages/skill-ad-image-director.html",
     "description": "Packshots, lifestyle, models, sets, accuracy check, statics in every ratio. Zip: dist/skills/ad-image-director.zip"
    },
    {
     "name": "Ad Video Director (The Film Director)",
     "link": "https://YOUR-KIT-LINK/pages/skill-ad-video-director.html",
     "description": "Google Flow video prompts, films, CGI, UGC, voice, music, hybrid. Zip: dist/skills/ad-video-director.zip"
    },
    {
     "name": "Vibe Editor (The Editor)",
     "link": "https://YOUR-KIT-LINK/pages/skill-vibe-editor.html",
     "description": "Edit by describing it: cuts, captions, end card, every ratio. Zip: dist/skills/vibe-editor.zip"
    }
   ]
  }
 ],
 "kit_url": "https://YOUR-KIT-LINK"
}
```

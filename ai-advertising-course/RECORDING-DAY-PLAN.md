# Recording Day Plan

The goal for today is 11 raw lectures recorded so Claude can cut them into 41 lessons.

---

## 1. Today's schedule

Record **in order**. Each lecture uses outputs from the one before it (L03 packshots go into
L05 video, L05 clips go into L09 editing, and everything goes into L11).

| Block | Time | What |
|---|---|---|
| **Prep** | 60–90 min | Section 2 checklist: product photos, accounts, folders, pre-generated backups |
| **Level 1: The image** | ~3 h | L01 (35 min) → L02 (50 min) → L03 (55 min) → L04 (50 min) |
| Break | 30–45 min | Eat. Check that L01–L04 files saved and the audio sounds right. |
| **Level 2: Motion & sound** | ~2.5 h | L05 (60 min) → L06 (45 min) → L07 (40 min) |
| Break | 20–30 min | Kick off the long renders L08–L11 need (each lecture's "Before you hit record" list). |
| **Level 3: The agency standard** | ~3.5 h | L08 (50 min) → L09 (55 min) → L10 (35 min) → L11 (55 min) |

**If you run out of time:** L01–L09 are the core of the course. L10 is the easiest to record
tomorrow. L11 is mostly re-using your own outputs, so it records fast once everything else is done.

**Cooking-show rule:** start one generation live per lesson so students see the wait and the
first result. Then cut to a version you generated earlier ("here's one I made before the
lecture"). Never sit on camera waiting for a render.

---

## 2. Prep checklist (before L01)

**Product and brand**
- [ ] The physical product (Kesar & Co. serum, or any real bottle, can or box on your desk).
- [ ] 5 phone photos of it on a plain white or grey background, in daylight by a window:
      front, 45° left, 45° right, back label, top. Fill the frame and keep the label sharp.
- [ ] A cut-out of the front photo (background removed). Most image tools can do this in one click.
- [ ] `student-kit/templates/brand-bible.md` filled in for Kesar & Co. (the palette and look are
      in `CONVENTIONS.md`). This is what you attach in every demo.
- [ ] Loom Street and Fizzbar: one reference image each (L04 and L05 recipes).

**Accounts and tabs** (signed in, so you never log in on camera)
- [ ] Google Flow (check that Google Omni Flash 1.2 and Nano Banana 1.1 are selectable)
- [ ] ChatGPT (GPT Image 2.6), Claude, Gemini
- [ ] ElevenLabs, Suno, CapCut (fallback), Meta Ads Manager plus a test ad account
- [ ] Claude Code or Claude desktop with **ffmpeg installed** for the L09 vibe-editing demo.
      Check it with `ffmpeg -version`.

**Files**
- [ ] A course folder: `KESAR_DIWALI/01_brief 02_images 03_video 04_audio 05_edit 06_launch`
- [ ] The `student-kit/` folder open, so you can show students where each file comes from.
- [ ] Each lecture's "Before you hit record" list from `lectures/Lxx-*.md` (pre-generated
      backups, mostly video clips).

**Recording setup**
- [ ] OBS (or any screen recorder): 1920×1080 or 2560×1440, 30 fps, MP4 (or MKV, then remux).
- [ ] Two scenes: **Talk** (full face cam, for concept parts) and **Screen** (screen with a small
      face cam bottom-right, kept clear of the tool UI).
- [ ] Mic about 15 cm from your mouth, peaks around −12 dB, fans and AC off, phone on silent.
- [ ] Browser zoom at 125% so prompts are readable on a phone. Close other tabs and
      notifications. Use a clean bookmarks bar.
- [ ] A 30-second test recording. Play it back and check the sound before L01.

---

## 3. Recording rules (these let Claude cut your lectures automatically)

Say these words clearly, and **pause for 2 seconds of silence before and after each one**.

| Say | When | What Claude does |
|---|---|---|
| **"LESSON 3.2"** | At the start of every lesson segment | Starts a new lesson file there. The title comes from the curriculum. |
| **"RETAKE"** | You messed up a line | Cuts back to the last pause before the mistake. Repeat the whole sentence after "RETAKE". |
| **"B-ROLL"** | You want a finished asset shown full-screen here | Inserts the matching output from your course folder |
| **"END LECTURE"** | The very end | Ends the lecture and adds the outro |

Also:
- **One lecture = one file.** It's fine to pause and resume in OBS, but don't start a new file
  mid-lecture.
- **Say the lesson goal in the first sentence** of each segment, e.g. "In this lesson you'll
  turn one phone photo into four studio packshots." That line becomes the lesson's opening.
- **Read prompts out loud only partly.** Say what each part does, not every word. Students copy
  the full prompts from the kit.
- **Always end a lesson on the output.** Show the final image or clip full-screen for 3 seconds
  and say what the student makes next (the assignment).
- **Talk to one person**, a D2C founder or a freelancer, not to "everyone".
- Keep **brand names out of shot**: no client logos, no real celebrities, no competitor products.

---

## 4. After recording: handoff to Claude

1. Name the files `L01_raw.mp4` … `L11_raw.mp4`.
2. Put them in a Google Drive folder, along with the course folder (`KESAR_DIWALI/`) so B-ROLL
   inserts can be found.
3. In a Claude session, say: *"Raw lectures are in Drive folder <name>. Cut them into lessons."*
   If a file is too large to pull from Drive, Claude will say so and suggest how to split or
   share it.

**What Claude does with each raw lecture:**
1. **Transcribe** it with timestamps.
2. **Find the markers** (LESSON x.y / RETAKE / B-ROLL / END LECTURE) and cut it into
   lessons, using the `Lxx` plan to check that nothing is missing.
3. **Clean up:** remove retakes, long silences and dead air (renders, typing). Speed up long
   waits ×4 with a "rendering…" tag.
4. **Polish:** loudness to −14 LUFS, a gentle intro and outro, a lesson title card ("Lesson 3.2 ·
   Lifestyle scenes and backgrounds"), zoom-ins on prompts (from each lecture's "Edit notes
   for Claude"), B-ROLL inserts, and an end card with the assignment.
5. **Captions:** an `.srt` for every lesson (English, plus Hindi/Hinglish where you speak it),
   optionally burned in for the free preview lessons.
6. **Export:** `M03_L3.2_lifestyle-scenes.mp4` (1080p, H.264), plus a chapter list and a
   short lesson description for the course page.
7. **Trailer:** a 0:40 cut from the best output shots across all 11 lectures (the sales page
   promises a trailer).

---

## 5. What goes on each lesson page

```
Video
"What you'll make" (one output image or GIF)
Prompts used (copy-ready, from the lecture's demo)
Downloads (the skill, templates and workflow for this lesson, from student-kit/)
Common mistakes (3 bullets, from the lecture plan)
Assignment (post your output in the module's community thread)
```

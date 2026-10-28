# Vibe Editing: Animated Carousels

Animated Instagram carousels for **Vibe Editing by IdeaBro Studio**, made with the
same approach as `../vibe-editing-film`: each slide is an HTML page with a
`renderAt(t)` function, rendered frame by frame with headless Chromium and encoded
to MP4 with ffmpeg.

## How the carousels work

- **Format:** 1080x1350 (4:5), one MP4 per slide, 4–6 s per slide, 30 fps, built
  to loop without a visible jump. Instagram allows up to 20 photos or videos per
  carousel and crops every slide to the first one's ratio, so all slides are 4:5.
- **Consistency:** every slide uses the same frame: the brand bar at the top, a
  progress dots row, the slide number, a "swipe" cue on slides 1 to N-1, and Bro
  (the lightbulb mascot) who appears on every slide doing the step.
- **Motion vocabulary**, the same on every slide:
  1. *Enter* (0–0.8 s): the headline lands word by word, then the visual builds.
  2. *Act* (0.8–3.5 s): the one thing the slide teaches happens on screen
     (clips snap to the beat, a prompt types itself, a look wipes across).
  3. *Hold + loop* (3.5–5 s): a quiet loop (cursor blink, Bro bob, glow pulse)
     that comes back to the first frame.
- **One source of truth:** `slides.json` holds the copy and timing of every slide
  in a carousel; the HTML and the render read it. A new carousel = a new JSON file.
- **Slide arc:** Hook → Problem → Shift → Steps (3–5) → Recap/Save → CTA.

## Topic bank

| # | Topic | Hook (slide 1) |
| --- | --- | --- |
| 1 | The 5-Step Vibe Editing System | I stopped dragging clips on a timeline. My reels got better. |
| 2 | The Vibe Prompt Formula | One sentence edits my whole reel. Here's the formula. |
| 3 | Cut to the Beat Without a Timeline | Your cuts feel "off" because they miss the beat. Fix it in one line. |
| 4 | Captions That Keep People Watching | 80% watch on mute. Your captions are the edit. |
| 5 | One-Word Color Grades | Teal & Orange, Film 35, Noir... which one sells your video? |
| 6 | 4 SFX Every Reel Needs | Sound is half the edit. These 4 hits do the work. |
| 7 | Hook Edits for the First 1.5 Seconds | You have 1.5 seconds. Here are 5 openings to prompt. |
| 8 | Vibe Editing vs Timeline Editing | Same reel. 3 hours vs 15 minutes. Here's where the time goes. |
| 9 | 1 Long Video → 10 Reels | Stop filming more. Vibe-edit what you already have. |
| 10 | 7 Vibe Editing Mistakes | Your vibe edits look AI-made because of these 7 mistakes. |
| 11 | The Director Pass: Revision Prompts | The first AI edit is a draft. These 5 notes make it yours. |
| 12 | 10 Prompts to Save | Steal my 10 most-used vibe editing prompts. |
| 13 | Raw Footage to Posted in 15 Minutes | My full workflow, from camera roll to posted. |
| 14 | Brand Your Edits: Make Every Reel Look Like You | Why every reel you post looks like a different creator. |

## Carousel 01: The 5-Step Vibe Editing System

| Slide | Copy | What moves |
| --- | --- | --- |
| 1 · Hook | **I stopped dragging clips on a timeline.** / My reels got better. / *The 5-step Vibe Editing System →* | A cluttered timeline crumples and falls away; Bro pops up in its place and points to the swipe cue. |
| 2 · Problem | **1 reel = 3 hours.** / Cutting. Syncing. Captions. Color. SFX. / And it still looks "meh." | Five task cards stack up on Bro until he sinks; a clock spins fast in the corner. |
| 3 · Shift | **Vibe editing:** you describe the feel. AI does the clicks. / You stay the director. | A prompt box types "fast, punchy, teal & orange, captions"; the preview changes as it types. |
| 4 · Step 1 | **Dump everything.** / Raw clips + one music track. / Don't trim. Don't sort. | Clips rain into the Media bin; Bro catches the last one. |
| 5 · Step 2 | **Type the vibe.** / Platform + length + energy + look + goal. / *"30s Reel, high energy, teal & orange, bold captions, end on the product."* | The formula's five parts light up one by one, then the example prompt types itself. |
| 6 · Step 3 | **Cut to the beat.** / Ask for cuts on every beat or every 2nd beat. | A waveform pulses; cut markers snap onto the peaks; the preview flashes on each cut. |
| 7 · Step 4 | **Layer it.** / Captions → Motion titles → One look. / One layer at a time, check each. | Three chips pop in one by one; each press adds a track and the preview updates. |
| 8 · Step 5 | **Sound + director pass.** / Add 3–4 SFX on key cuts. / Give 3 notes max: "punchier first 2s", "bigger captions", "end on logo". | SFX stamps hit the timeline; three sticky notes slap on and the edit refreshes. |
| 9 · Recap | **Save this for your next edit.** / 1 Dump → 2 Vibe → 3 Beat → 4 Layer → 5 Sound | The five steps tick off with checkmarks; a bookmark icon bounces. |
| 10 · CTA | **Comment "VIBE"** and I'll send you my free prompt pack. / Follow @yourhandle for one vibe edit a day. | The prompt-pack cover slides in; the comment bubble types VIBE; Bro waves. |

**Caption:**
Editing one reel shouldn't take your whole evening. Here's the 5-step Vibe
Editing System I use: dump, vibe, beat, layer, sound. Save it, try it on your next
reel, and comment VIBE for the free prompt pack.

#vibeediting #videoediting #reelstips #contentcreator #aivideoediting #editingtips
#instagramreels #creatortips

## Next

Waiting on the design system (colors, fonts, logo, handle, mascot or not). Then:
build the slide template, render carousel 01, and review stills before the full render.

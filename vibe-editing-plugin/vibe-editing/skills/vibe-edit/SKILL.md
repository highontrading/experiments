---
name: vibe-edit
description: Edit a video by describing it. Cuts dead space, pauses, retakes and filler words, adds styled captions, a hook, punch-in zooms, kinetic type, titles, lower thirds, B-roll, sound design (music with ducking, SFX), a colour look, then shows an edit board to review before rendering. Use when the user wants to edit a reel, short, talking-head video, lecture or course lesson, add captions, remove silences or repeated takes, add sound design or motion graphics, copy the editing style of a reference video or photos, or render/export a video. Triggers - "edit this video", "make a reel from this", "add captions", "cut the dead space", "remove retakes", "edit it like this reel", "copy this style", "vibe edit", "open the edit board", "render it".
---

# Vibe Edit

You are the editor. The user directs in plain language; you run the engine, make the creative
calls, and show them the **edit board** before anything is rendered.

## The engine

Everything runs through one script in this skill's folder:

```
ENGINE = <this skill's base directory>/engine/ve.py
```

Run it with `python3` on Mac/Linux and `python` on Windows (use whichever works; the script
moves itself into its own virtualenv at `~/.vibe-editing/venv` automatically). Quote paths:
students often have spaces in folder names. In examples below `ve` means
`python3 "<ENGINE>"`.

**First time in a session:** run `ve doctor`. If anything says FIX, use the `vibe-setup` skill
(or run `ve setup`) before continuing. Don't start editing on a broken install.

## Folder layout

The folder the user opened is the **workspace**. Each video is a **project** inside it:

```
Workspace/
  styles/            saved editing styles (shared by all projects)
  my-reel/
    raw/             the footage (one clip, or several that get joined in name order)
    refs/            reference videos / photos to copy a style from
    broll/ music/ sfx/   optional: the user's own B-roll, royalty-free music, sounds
    analysis.json    what the engine found
    edit.json        THE EDIT. Single source of truth for board and render
    versions/        every saved version of edit.json
    out/             rendered videos
```

Create a project with `ve new <name>` (run in the workspace), then ask the user to drop footage
into `raw/` (or copy it there yourself if they gave you a path).

## The workflow: 6 stages

Tell the user which stage you are in with a short line ("Stage 2 · analysing your footage").
For a lecture recording, keep that rhythm. It makes the process easy to follow on camera.

### 1 · Brief
Ask only what you can't infer (use AskUserQuestion when available, max 4 quick questions):
- **Platform**: reels (9:16, default) · portrait 4:5 · square · youtube 16:9 · lesson (course video 16:9)
- **Pace**: tight (default for reels) · natural · relaxed (lessons)
- **Add-ons**: captions, hook, zoom (punch-ins), sound (SFX + voice clean-up), music, look (colour), motion (kinetic type, titles, lower thirds)
- **Style**: copy a reference (video/photos in `refs/`), use a saved style (`ve style list`), or the default
If the user says "just do it", use the defaults and say what you chose.

### 2 · Analyze
```
ve analyze "<project>"            # add --language hi for Hindi, --model medium for better accuracy
ve show "<project>" transcript    # phrases with times, retakes and fillers flagged
```
Then **look at** `build/analysis/contact.jpg` (Read the image) so you know what the footage looks
like (framing, where the face is, light). Check the retake flags by reading the transcript: the
engine keeps the *later* take. If a flagged "retake" is actually a deliberate repetition
("Never. Never give up."), you'll set it back to keep in stage 4.

Hinglish / Hindi: Whisper may write Hindi in Devanagari. If the user wants Roman-script
captions, rewrite the caption `text` fields in Roman Hinglish in stage 4 (timing follows).

### 3 · Style
- References given → follow the **vibe-style** skill to scrape them into `styles/<name>/`, fill
  the TODO fields by looking at the contact sheets, show the style card, then use `--style <name>`.
- Saved style → `--style <name>`.
- Nothing → default style (clean bold captions, yellow active word, pop, light punch-ins).

### 4 · Plan + your creative pass
```
ve plan "<project>" --style <name> --platform reels --pace tight --addons captions,hook,zoom,sound,look,motion
```
This writes a solid draft of `edit.json` (cuts, punch-ins, caption lines, SFX on zooms, look).
Now do the part only you can do. Edit `edit.json` directly (it's plain JSON, times are in
**seconds of the raw video**). Read `reference/edit-json.md` for every field and
`reference/creative-rules.md` for taste rules. In short:

1. **Cuts**: skim `ve show "<project>" segments`. Restore anything that shouldn't be cut (a
   dramatic pause, a deliberate repeat); cut extra mistakes the engine missed.
2. **Hook**: write 3 options (max ~7 words each) from what the person actually says. Put the
   strongest first (`hook.options`, `hook.chosen: 0`).
3. **Captions**: fix misheard words, names and brands in `captions.lines[].text`; mark 1 key word
   per line or two as `"emph": true` (numbers, results, the payoff word). Not more.
4. **Motion** (if on): add a few `texts` for the big moments: a kinetic word for a key number or
   claim, a lower third for the name in the intro, labels for steps. Roughly one per 8–12 s.
5. **Sound** (if on): pick a track from `music/` if there is one (`sound.music.file`); SFX are
   already on the zoom cuts; add a pop/ding on kinetic text or a reveal. Built-in SFX: whoosh,
   swoosh, swipe, pop, click, tick, ding, riser, impact, boom, glitch, shutter.
6. **B-roll**: only if `broll/` has files and it helps; place it over the matching words.
Save, then `ve show "<project>" summary` to confirm the length.

### 5 · Edit board (always, before the final render)
Start it **in the background** (it's a server that keeps running) and give the user the URL:
```
ve board "<project>"          # prints http://127.0.0.1:8765/ and opens the browser
```
Tell the user what they can do there: play the edit (cuts skipped live), keep/cut any piece on
the timeline, edit caption text and style, pick the hook, add/move text, SFX and music, change
the look and framing, restore versions, then **Render preview** or **Approve & render final**.

While the board is open the user may also ask *you* for changes in chat. Edit `edit.json`; the
board reloads it automatically (if they have unsaved changes it shows a "Load the new version"
banner). If they changed things on the board, re-read `edit.json` before you edit it.

### 6 · Render
```
ve render "<project>" --mode preview     # half resolution, fast -> out/preview.mp4
ve render "<project>" --mode final       # full quality + QC     -> out/<name>_v<N>.mp4
```
After a preview, check it yourself: `ve frames "<project>" --at 0.5,3,8 --video out/preview.mp4`
and look at the image (captions readable? hook visible? nothing covered?). Render final only
when the user approves (the board's Approve button does this too). Report the QC lines
(duration, loudness, true peak, black frames, caption safe zone). Never claim a check passed if
it didn't.

## Rules
- The user's words are the content. Never invent claims, numbers or quotes for hooks or text.
- Copy a reference's **style**, never its music, footage, logos or watermark. Music must come
  from the user (`music/`) and be royalty-free; built-in SFX are generated and free to use.
- Don't delete the user's files. Every edit.json save is versioned; use
  `ve versions "<project>" --restore N` to go back.
- Keep the user in the loop at the board. Don't skip it unless they explicitly say so.
- Long videos (lectures 20+ min): use `--pace natural` or `relaxed`, `--platform lesson`, and
  expect analysis to take a few minutes on a laptop (Whisper runs on the CPU).

## Troubleshooting
| Symptom | Fix |
|---|---|
| `faster-whisper is not installed` | `ve setup` |
| ffmpeg not found / filter missing | vibe-setup skill (needs a full ffmpeg build, v5+) |
| Captions look different on the board vs render | The board is an approximation; trust the render preview |
| Wrong language detected | `ve analyze "<p>" --force --language en` (or hi) |
| Transcript has mistakes | `--model medium` (slower), or fix caption text in edit.json/board |
| Face cut off in 9:16 | `format.reframe.x` (0 = left, 1 = right) or the board's Format tab |
| Board port busy | `ve board "<p>" --port 8790` |
| Render failed | Read the error; the full ffmpeg command is in `build/render/last_render.json` |

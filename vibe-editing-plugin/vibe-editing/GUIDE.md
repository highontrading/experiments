# Vibe Editing: the guide

Edit videos by telling Claude what you want. This guide takes you from install to your first
finished reel, then through every feature.

---

## 1. What's in the box

```
vibe-editing/                 ← the plugin (this folder)
  GUIDE.md                    ← you are here
  install/                    ← one-time installers (Mac + Windows)
  skills/
    vibe-edit/                ← the editor: analyze → plan → edit board → render
      engine/                 ← the engine (Python + ffmpeg + Whisper)
      assets/fonts/           ← 15 free caption fonts (OK for client work)
      assets/sfx/             ← 12 free sound effects
      templates/board.html    ← the edit board
      reference/              ← edit.json reference + creative rules Claude follows
    vibe-style/               ← the style scraper (copy a look from any video/photo)
    vibe-setup/               ← installs and checks everything
```

The pipeline (every edit goes through these 6 stages):

| # | Stage | What happens |
|---|---|---|
| 1 | **Brief** | Claude asks: which platform, what pace, which add-ons, which style |
| 2 | **Analyze** | Transcript with word timings, dead space, pauses, retakes, filler words |
| 3 | **Style** | Copy the style of a reference video/photos, or use a saved style |
| 4 | **Plan** | The engine drafts the edit; Claude writes hooks, fixes captions, adds text and sound |
| 5 | **Edit board** | You review and change everything in your browser, before rendering |
| 6 | **Render** | Fast preview, then the final video with a quality check |

---

## 2. Install (once, about 10 minutes)

### 2.1 Get Claude Code
Install the **Claude desktop app** (claude.ai/download) and open the **Code** tab, or install
Claude Code in the terminal. You need a paid Claude plan (Pro or higher) for Claude Code.

### 2.2 Put the plugin where Claude can find it (pick one)

**Option A: inside your own editing folder (simplest).** Unzip `my-edits-starter.zip`. You get
two things: a `CLAUDE.md` file and the `vibe-editing` folder. Put **both** inside your editing
folder (for example `my edits`):

```
my edits/
  CLAUDE.md          ← tells Claude "the Vibe Editing skills are here, use them for every edit"
  vibe-editing/      ← the plugin
```

Open `my edits` in Claude Code. Claude reads `CLAUDE.md` automatically, so you never have to
say "use the skill". Everything you do happens in this folder.

**Option B: for every folder on your computer.** Copy the whole `vibe-editing` folder into:

- **Mac:** `~/.claude/skills/` → so you have `~/.claude/skills/vibe-editing/`
  (in Finder: Go → Go to Folder… → type `~/.claude/skills`; create the `skills` folder if it's missing)
- **Windows:** `C:\Users\<your name>\.claude\skills\` → `...\.claude\skills\vibe-editing\`

Restart Claude Code (or type `/reload-plugins`). It loads automatically as
**vibe-editing@skills-dir** in every folder. Check with `/plugin` → you should see `vibe-editing`.

> Just trying it for one session? Start Claude Code in the terminal with
> `claude --plugin-dir /path/to/vibe-editing` (a `.zip` of the folder works too).

### 2.3 Let Claude install the tools
Open Claude Code in any folder and say:

> **Set up vibe editing.**

Claude runs the `vibe-setup` skill. It installs Python and ffmpeg if they're missing (Homebrew
on Mac, winget on Windows, and it asks first). Then it creates the plugin's own Python environment
and checks everything. You want every line to say `OK`. You can also run the installers
yourself: `install/install_mac.sh` or `install/install_windows.ps1`.

The first transcription downloads the speech model once (about 480 MB).

---

## 3. Your workspace

Make one folder for all your editing, for example `Documents/Vibe Editing`, and **open that
folder in Claude Code**. Every video becomes a project inside it:

```
Vibe Editing/              ← open this folder in Claude Code
  styles/                  ← your saved styles (shared by all projects)
  my-first-reel/
    raw/                   ← put your footage here (one clip, or several: they're joined in name order)
    refs/                  ← reference videos / screenshots to copy a style from
    broll/                 ← optional: your B-roll clips and images
    music/                 ← optional: royalty-free music
    sfx/                   ← optional: your own sound effects
    out/                   ← finished videos appear here
```

Claude creates this for you when you say *"New project called my-first-reel"*.

---

## 4. The fast way: just give Claude your video (and a reference)

In your editing folder, in one message:

> **Edit this video. The first file is my video, the second is my inspiration.**
> (attach both, or drop them into the folder and name them)

Or step by step: send the video first ("edit this as a reel"), and the reference later
("now make it look like this one"). Either way Claude:
- creates the project folders itself (`raw/` for your video, `refs/` for the inspiration, `out/` for the result);
- picks the format from the reference's shape (vertical reference → reel);
- copies the style of the reference and edits your video;
- opens the edit board for you to check and change things, then renders to `out/`.

If the reference comes after the edit is already planned, Claude applies the new style and
**keeps** your cuts, caption fixes, hook and sound.

> Attaching videos in the chat: if the app doesn't accept a video file, just drop it into your
> editing folder and say its name ("edit talk.mp4, inspiration is reel.mp4"). It works the same.

---

## 5. Your first edit, step by step (follow along)

**Say:**
> New project called **my-first-reel**.

Drop your phone video into `my-first-reel/raw/` (or attach it and Claude puts it there). Then:

> **Edit my-first-reel as a reel. Cut the dead space and retakes, add captions and a hook.**

Claude walks through the stages and tells you which one it's in:

1. **Brief**: answer its quick questions (or say "use the defaults").
2. **Analyze**: it transcribes, finds pauses, repeated takes and "umm"s, and looks at your footage.
3. **Style**: the default style unless you gave a reference (see section 6).
4. **Plan**: it drafts the cut and writes 3 hook options, fixes caption spelling, marks
   emphasis words, adds a few text moments and sound effects.
5. **Edit board**: your browser opens (section 7). Review, change, approve.
6. **Render**: a fast preview first, then the final in `out/` with a quality check
   (length, loudness at -14 LUFS, peaks, black frames, captions in the safe zone).

Things you can say any time:
> Make the captions bigger and move them up a bit.
> Use the second hook.
> Keep the pause before "and that's the secret".
> Add a whoosh on every zoom and a ding when I say the price.
> No punch-ins. · Slower pace. · Warmer colours.
> Render a preview. · Looks good, render the final.

---

## 6. Copy a style from a reference (the style scraper)

Put a reel you like (and/or screenshots) in `refs/`, then:

> **Copy the editing style of refs/that-reel.mp4 and save it as bold-yellow.**

What happens:
1. The engine **measures** pacing (cuts per minute, shot length), colour (palette, contrast,
   warmth, grain, vignette), and sound (music bed, how often SFX hit).
2. Claude **looks at** contact sheets of the reference (shots, the first 3 seconds, frame bursts
   that show how captions animate, big frames to read the type) and fills in the font, size,
   colours, position, words per line, word highlight, animation, hook style, punch-ins and
   motion-text style.
3. You get a **style card** in the browser: your caption and hook previewed on a frame of the
   reference, the palette, every value. Ask for changes until it's right.

Then use it on any video:
> Edit my-first-reel with the **bold-yellow** style.

Styles live in `styles/` and are yours to keep, refine and mix:
> Use the captions from bold-yellow but the colours from luxury-serif, save as my-signature.
> List my styles.

**Photos work too:** screenshots of captions, a mood board, a brand image. From photos Claude
takes typography, colours and layout.

It copies the **style**, never the content. It does not use the reference's music, footage,
logos or watermark.

---

## 7. The edit board

Opens automatically at `http://127.0.0.1:8765/`. It plays your **raw** video but skips the cut
parts and draws the captions, hook, zoom and look on top, so you watch the edit instantly with
no rendering.

| Area | What you can do |
|---|---|
| **Preview** | Play the edit (cuts skipped), ←/→ to jump, Space to play |
| **Timeline** | Green = kept, grey = pause cut, orange = retake cut, purple = filler cut, blue = captions, pink = text, yellow dots = SFX. **Click the top lane to keep/cut a piece**, click below to jump |
| **Cuts** | Every piece with the reason it was cut; tick to keep; set the punch-in per piece |
| **Captions** | Font, size, case, position, colours, outline, highlight style, animation, words per line; edit any line's text; click a word to make it an emphasis word |
| **Hook** | Pick or rewrite the hook options; style and duration |
| **Text & motion** | Add kinetic type, title cards, lower thirds, labels at the playhead; B-roll from `broll/` |
| **Sound** | Voice clean-up, music track + level + ducking, loudness, SFX list (listen, move, delete, add at playhead) |
| **Look** | Match the reference colours (LUT) + strength, contrast, saturation, brightness, warmth, vignette, grain, sharpen |
| **Format** | Reels / portrait / square / YouTube / lesson, crop or fit-with-blur, framing left↔right and up↕down |
| **Versions** | Every save is kept. Restore any version; watch earlier renders |

**Save** (Ctrl/Cmd+S) → **Render preview** (fast, half resolution) → **Approve & render final**.

You can also keep talking to Claude while the board is open. Its changes appear on the board
automatically (if you have unsaved changes you'll see a "Load the new version" banner).

The live view is an approximation. The colour LUT, sound design and exact font rendering show
in the rendered preview.

---

## 8. Formats and editing course lessons

| Say | You get |
|---|---|
| "as a reel" (default) | 1080×1920, tight pace, big captions, hook, punch-ins |
| "as a feed post" | 1080×1350 |
| "square" | 1080×1080 |
| "for YouTube" | 1920×1080 |
| "as a course lesson" | 1920×1080, natural pace, smaller captions at the bottom, no hook, no punch-ins |

Vertical phone footage in a 16:9 video is fitted on a blurred background automatically.

**Raw lectures:**
> Edit lesson-03 as a course lesson. Cut the retakes and long silences but keep my rhythm.
> Add a title card "Module 2 · Captions" at the start and labels for the key terms.

Long recordings take longer to transcribe on a laptop (roughly real-time with the default
model). For better transcripts say "use the medium model".

---

## 9. Prompt cheat sheet

| Goal | Say |
|---|---|
| Basic clean-up | "Just cut the dead space, retakes and umms. No captions." |
| Captions only | "Add captions in my bold-yellow style, nothing else." |
| One word at a time | "Captions one word at a time, big, centre of the screen." |
| Hook | "Give me 5 hook options from what I say and use the best one." |
| Kinetic type | "When I say '15 minutes', make it slam on screen." |
| Lower third | "Put my name and 'Founder, Ideabro Studio' as a lower third at the start." |
| Sound design | "Add music from music/ under my voice, a whoosh on zooms, a ding on the result." |
| Look | "Warm, slightly faded film look with light grain." |
| Framing | "My face is on the left, frame it properly for 9:16." |
| Hinglish | "My video is in Hinglish, write the captions in Roman script." |
| Go back | "Go back to version 3." |
| Another format | "Now make a 16:9 YouTube version of the same edit." |

---

## 10. What it can and can't do

**Can:** cut by transcript (dead space, pauses, retakes, fillers), word-timed captions with 5
highlight styles, hooks, punch-ins, kinetic type, titles, lower thirds, labels, B-roll (full or
picture-in-picture, Ken Burns on stills), music with ducking, SFX, voice clean-up, loudness to
platform standard, colour matching to a reference, vignette/grain/sharpen, reframing, quality
check, versions.

**Limits (honest):**
- It can't name the exact font in a reference. It picks the closest of the 15 bundled fonts.
- Animated motion graphics are close to a reference, not frame-perfect copies.
- It doesn't bring music. Use your own royalty-free tracks in `music/`.
- Transcription runs on your laptop's CPU: long videos take a while; accents and Hinglish may
  need caption fixes (easy on the board).
- Studying a reference sends a handful of frames to Claude, which uses some of your Claude usage.

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| Claude doesn't use the plugin | Check `/plugin` shows vibe-editing; say "use vibe edit to…"; restart Claude Code |
| "ffmpeg not found" | Say "set up vibe editing" (or reopen the terminal after installing) |
| "faster-whisper is not installed" | Say "run vibe setup" |
| Wrong language / bad transcript | "Re-analyze in English with the medium model" |
| Face cut off | Board → Format → framing slider, or "move the frame left" |
| Board doesn't open | Open the address Claude prints (http://127.0.0.1:8765/) in your browser |
| Render failed | Ask Claude to read the error; it can see the full command it ran |

Made by Ideabro Studio for the Vibe Editing course.

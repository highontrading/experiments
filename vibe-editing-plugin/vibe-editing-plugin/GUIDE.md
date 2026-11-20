# Vibe Editing plugin: the guide

You upload a video. Claude asks you, step by step, what you want, and shows you **images** to
choose from: caption styles, motion graphics and colour looks, all rendered on your own
footage. It builds the edit and shows you a **storyboard** (numbered frames of the edit). You
approve it or change anything by panel number. Only then does it render.

---

## 1. Install (once)

### 1.1 What you need
- The **Claude desktop app** (claude.ai/download) → the **Code** tab, or Claude Code in a
  terminal. Claude Code needs a paid Claude plan.
- Python and ffmpeg. Claude installs them for you in step 1.3.

### 1.2 Put the plugin in your editing folder
Unzip `vibe-editing-plugin.zip`. You get two things: **`CLAUDE.md`** and the
**`vibe-editing-plugin`** folder. Put **both** directly inside the folder where you want to
edit. Call that folder anything you like (`my edits`, `Reels 2026`…):

```
my edits/                    ← any name
  CLAUDE.md                  ← keep this name: Claude reads it automatically
  vibe-editing-plugin/       ← keep this name
```

Open that folder in Claude Code. `CLAUDE.md` tells Claude the plugin is there and how to work
with you, so you never have to say "use the skill".

> Want it in every folder instead? Copy `vibe-editing-plugin` into `~/.claude/skills/`
> (Windows: `C:\Users\<you>\.claude\skills\`) and restart Claude Code.

### 1.3 Let Claude set things up
Say: **"Set up vibe editing."** Claude installs Python and ffmpeg if they're missing (it asks
first), creates the plugin's own Python environment and checks everything. The first
transcription later downloads the speech model once (about 480 MB).

### 1.4 Optional: ElevenLabs
Only if you want Claude to **generate** music or sound effects. Get an API key at
elevenlabs.io (Profile → API keys), then in a terminal in your editing folder run:

```bash
python3 vibe-editing-plugin/skills/vibe-edit/engine/ve.py keys set elevenlabs YOUR-KEY
```

(Windows: `python` instead of `python3`.) The key is saved on your computer in
`~/.vibe-editing/keys.json`, never in your project. Don't paste keys into the chat. The free
music library needs no key.

---

## 2. Editing a video: the 9 steps

Upload or drop your video and say something like *"Edit this for a Meta ad."* Claude goes
step by step and **waits for your answer at every step**.

| Step | Claude asks / shows | You answer |
|---|---|---|
| **1 · Brief** | Where it's going (Meta ad, reel, 4:5 feed, YouTube, lesson), kind of edit (clean talking-head, hype, UGC ad, cinematic, explainer, podcast clip), target length, offer/CTA | "Meta ad, UGC style, 30 seconds, CTA: Join now" |
| **2 · Reference** | Do you have a reference or inspiration? | Upload a reel or photos, name a saved style, describe the vibe, or skip |
| | If you gave one: a **style card** image (its captions and hook drawn on a reference frame, palette, pacing, punch-ins, motion, colour, sound) plus a short summary | "Yes" or "make the captions smaller" |
| **3 · Captions** | `captions.png`: styles **A–H**, plus **R** from your reference, rendered on your video | "B, but yellow and 2 words per line" or "no captions" |
| **4 · Motion graphics** | `motion.png`: kinetic type, label, lower third, title card, CTA button | "1 and 5, balanced. Lower third: Avi, Founder" |
| **5 · Music + SFX** | Music: your own · free library · ElevenLabs · none. Sound effects: built-in · free library · ElevenLabs · none | "Free library, upbeat electronic", then pick from the list |
| **6 · Look** | `looks.png`: natural, bright, warm, cool, punchy, film, reference | "warm" |
| **7 · Edit plan** | What it cut (pauses, retakes, "umm"s), what to drop to hit your length, 3 hook options, the text moments, music and SFX | "Use hook 2, keep the pause before the price" |
| **8 · Storyboard** | `storyboard/v3_p1.png`: numbered frames of the edit with notes (what's said, text, SFX, zoom, cuts) | "#4: bigger text. #6: CTA in green." Or "approved" |
| **9 · Render** | "Render the final now?" → the video in `out/` + quality check | Then: "make a 4:5 version too" |

You can do it in one go ("first file is my video, second is my inspiration") or step by step.
Claude creates the project folders itself (`raw/` for your video, `refs/` for the inspiration,
`music/`, `sfx/`, `choices/`, `storyboard/`, `out/`).

Want Claude to decide some things? Say so ("you pick the music", "use defaults for the rest").
It still shows you the storyboard before rendering.

**Attaching videos:** if the app won't take a video file in the chat, drop it into your
editing folder and say its name. It works the same.

---

## 3. The storyboard (your edit board)

The storyboard is one image (more pages for long videos) of numbered panels. Each panel is a
**real frame of the planned edit**: the cut, the framing, punch-in zoom, colour look, captions,
hook, text and B-roll exactly as they will render. Under each panel:

- the words being said
- HOOK / KINETIC / LABEL / LOWER THIRD / CTA text on screen
- SFX at that moment
- zoom level and what was cut just before ("cut 1.8s before (pause, retake)")

Change anything by number: *"#3: move the label up"*, *"#5: no B-roll here"*, *"#1: use the
second hook"*. Claude updates the edit and shows **a new version** of the storyboard (v4, v5…).
Every version is kept. *"Go back to version 3"* works.

---

## 4. References: how Claude copies a style

Give a reel and/or photos. Claude:
1. **measures** the pacing (cuts per minute, shot length), colour (palette, contrast, warmth,
   grain, vignette) and sound (music bed, how busy the sound effects are);
2. **studies** frames: the shots, the first 3 seconds, frame-by-frame bursts showing how the
   captions animate and highlight, and large frames to read the type. It picks the closest of
   15 bundled fonts, the colours, position, words per line, highlight style, animation,
   punch-ins and motion style;
3. shows you the **style card** and waits for your OK.

Styles are saved in `styles/` and reusable: *"use my bold-yellow style"*, *"mix A's captions
with B's colours"*. It copies the **style**, never the reference's music, footage or logos.

---

## 5. Music and sound effects

| Source | How | Licence |
|---|---|---|
| **Your own** | Drop files in the project's `music/` or `sfx/` folder | Yours to check |
| **Free library** | Claude searches Openverse (music from Jamendo and others, sound effects from Freesound), lists options with length and licence, downloads 2–3 for you to listen | Only commercial-use licences. "Credit needed" tracks list their credit in `CREDITS.txt` |
| **ElevenLabs** | Claude shows the prompt and length and asks first, then generates | Check your ElevenLabs plan's commercial terms |
| **Built-in SFX** | whoosh, swoosh, swipe, pop, click, tick, ding, riser, impact, boom, glitch, shutter | Free for any use |

**For ads**, prefer tracks marked "no credit needed", your own music, or ElevenLabs. If you use
a "credit needed" track, put its credit (from `CREDITS.txt`) in the ad text.

The voice is cleaned up (hum, noise, levels), the music ducks under your voice, and the final
mix is levelled to −14 LUFS (the Instagram/YouTube standard).

---

## 6. Formats

| Say | You get |
|---|---|
| Meta ad | 1080×1920. Captions and text kept out of the top 14% and bottom 35% (Meta's ad UI). CTA button at the end |
| Reel / Short / TikTok | 1080×1920 |
| Feed post | 1080×1350 (4:5) |
| Square | 1080×1080 |
| YouTube | 1920×1080 |
| Course lesson | 1920×1080, small captions at the bottom, no hook, no zooms, natural pace |

After an ad is approved: *"Make 4:5 and 1:1 versions."* Claude shows a storyboard for each
before rendering. Vertical phone footage in 16:9 is placed on a blurred background.

---

## 7. What it can and can't do

**Can:** cut by transcript (dead space, pauses, retakes, fillers, content to hit a length),
word-timed captions (8 styles and any mix), hooks, punch-in zooms, kinetic type, labels, lower
thirds, title cards, CTA buttons, B-roll (full or picture-in-picture), music with ducking, SFX,
voice clean-up, loudness, colour looks and reference colour matching, reframing, storyboards
with versions, quality check.

**Limits:**
- It can't identify the exact font in a reference. It picks the closest of the 15 bundled fonts.
- Motion graphics are close to a reference's, not frame-perfect copies.
- Claude can't listen to music. You choose by listening to the 2–3 downloaded options.
- The free library's music catalogue is smaller than paid stock sites. Simple searches ("calm
  piano", "upbeat electronic") work best.
- Transcription runs on your laptop: long videos take a while; Hinglish captions may need fixes.

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| Claude doesn't follow the steps | Check `CLAUDE.md` and `vibe-editing-plugin/` are directly inside the folder you opened |
| "ffmpeg not found" | "Set up vibe editing" (reopen Claude after installs) |
| An image didn't open | Claude gives the path. Open it from your folder (`choices/`, `storyboard/`, `styles/`) |
| Music search finds nothing | Use simpler words: mood + genre |
| "No ElevenLabs key" | Section 1.4 |
| Face cut off in 9:16 | "#2: my face is on the left, frame it" |
| Wrong language / transcript errors | "Re-analyse in English with the medium model", or fix words in the plan step |

Made by Ideabro Studio for the Vibe Editing course.

---
name: setup
description: First-time setup for Vibe Editor. Installs the video engine (speech model + ffmpeg), creates the "Vibe Editor" workspace folder, and builds the creator's brand/style profile (niche, colours, fonts, caption style, look, CTA, language) from a short chat and their reference reels. Use when the user is new, says "set up", "get started", "install", or wants to change their brand style.
---

# Vibe Editor — setup

The engine lives in the **edit** skill folder next to this one:

```
ENGINE = ${CLAUDE_SKILL_DIR}/../edit/scripts/vibe.py
```

Run with `python3 "<ENGINE>" …` (Windows: `python` or `py`). If that path doesn't exist, locate `vibe.py` inside this plugin's `skills/edit/scripts/` folder.

Be warm and quick. The user should be editing within ~10 minutes. Explain in plain words; never paste commands or JSON at them.

## 1. Install the engine (one time)

1. `python3 "<ENGINE>" doctor --no-render-test`
2. If anything fails: tell the user "Setting up your editor, this takes a few minutes the first time ☕", then run `python3 "<ENGINE>" install`. (It installs the speech engine and ffmpeg via pip and downloads the speech model. If they mainly speak Hindi or another Indian language and have a decent laptop, use `install --model medium` and remember to pass `--model medium` to `prep` later.)
3. Re-run `doctor` until everything is ✅. If something keeps failing, follow the **doctor** skill.

## 2. Create the workspace

Ask where to keep their videos if it isn't obvious (in Cowork, use the folder they shared with you). Create it:

`python3 "<ENGINE>" init "<chosen folder>/Vibe Editor"`

Tell them what the folders are for, briefly:
- **inbox**: drop raw videos here
- **output**: finished reels, covers and captions appear here
- **brand**: logo + brand fonts (optional)
- **broll**: extra clips/images to cut away to
- **music**: background music they're allowed to use
- **references**: 1–3 reels they love the style of

## 3. Build their style profile

Ask these in **one** friendly message (they can answer in any order, Hinglish is fine, "you decide" is fine):

1. Your name / Instagram handle?
2. What are your videos about (niche)?
3. What vibe? (e.g. energetic, calm & premium, funny, techy, aesthetic)
4. Language you speak in videos, and captions in **Roman** (e.g. "Exam se pehle") or **native script** (e.g. "परीक्षा से पहले")?
5. Brand colours (or "pick for me")?
6. Your usual call-to-action (e.g. "Follow for more", "Comment GUIDE")?
7. Any reels you love the style of? Drop them in **references/** (or send links/screenshots).

If they added reference videos, study them: `python3 "<ENGINE>" peek "<workspace>/references/<file>"` then open the contact sheet image and note caption font weight/case/colour/position, how much text is on screen, colour grade, and pacing. Pick the closest caption style, look and fonts from the library (`python3 "<ENGINE>" list`).

Then write `<workspace>/brand/brand.json`:

```json
{
  "name": "Priya", "handle": "priya.studies", "niche": "study tips for college students",
  "vibe": "energetic, friendly", "language": "hi", "caption_script": "roman",
  "colors": {"accent": "#FFD400", "accent2": "#8B5CF6", "text": "#FFFFFF", "dark": "#111111", "card": "#FFFFFF"},
  "fonts": {"title": "poppins-black", "body": "inter-extrabold"},
  "caption_style": "bold-pop", "look": "punchy",
  "cta": "Follow for daily study hacks", "logo": "logo.png",
  "notes": ["Likes fast cuts", "Always zoom on the punchline"]
}
```

- `language`: `en`, `hi`, `ta`, `te`, `bn`, `mr`, `gu`, `kn`, `ml`, `pa` … or `auto`.
- Fonts are keys from `list fonts` (custom .ttf/.otf files they put in `brand/` are copied automatically; use their exact family name only if you add it to the library, otherwise stick to built-in keys).
- Accent colour drives caption highlights, title accents, cards, CTA. Choose high-contrast colours that read on video (yellow, lime, cyan, hot pink, orange, purple).
- `notes`: add preferences they mention over time ("hates emojis", "keep it under 30s").

Show a 4-line summary of their style ("Captions: bold yellow pop · Look: punchy · Fonts: Poppins Black · CTA: …") and say they can change anything anytime.

## 4. First reel

Finish with: "You're all set! 🎬 Drop a raw video in **inbox** and tell me something like: *edit my latest video, energetic, text behind me for the hook, follow CTA at the end*." If they already have a video, offer to start right away (follow the **edit** skill).

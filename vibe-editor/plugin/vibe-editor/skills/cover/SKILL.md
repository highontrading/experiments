---
name: cover
description: Make a scroll-stopping reel cover / thumbnail image and a ready-to-paste post caption with hook and hashtags for a video edited with Vibe Editor. Use when the user asks for a cover, thumbnail, poster frame, or Instagram/YouTube caption, description or hashtags.
---

# Vibe Editor — cover + post caption

Engine: `${CLAUDE_SKILL_DIR}/../edit/scripts/vibe.py` (run with `python3`; on Windows `python`/`py`).

Find the job: the most recent folder in `<workspace>/.vibe/jobs/` unless the user names one. If the video was never prepped, run the **edit** skill's prep step first (`prep <video>`).

## Cover

1. Write a cover title: 2–6 words, curiosity or benefit ("Stop studying *the night before*", "I tried *₹0 ads* for 30 days"). Put the 1–2 most important words in `*stars*` (brand accent colour).
2. Pick the frame: a phrase where the speaker is expressive (surprised, pointing, smiling), usually in the hook. Check the timeline with `timeline <job>`.
3. `python3 "<ENGINE>" cover <job> --title "…" --at "<phrase or seconds>" --position top [--sub "small line"]`
4. Open `output/<name>-cover.jpg` and check: face not covered, title readable at thumbnail size. If the title covers the face, use `--position bottom` or `center`. Offer 2–3 variants if they want options (different frames/titles, save with different job names by renaming files after each run).

For YouTube (16:9) thumbnails: `--format 16:9`.

## Post caption

Write `<workspace>/output/<name>-caption.txt` in the same language/script as the video:

```
<Hook line that makes them read on: question, bold claim or relatable pain> <1 emoji max>

<2–4 short lines of value or context>

<CTA: comment a keyword / follow / save / share with a friend>

#<5–10 hashtags: 2 broad, 4–6 niche, 1–2 branded>
```

Hinglish creators: write natural Roman Hinglish ("Exam se pehle ye mistake mat karna 🙅‍♂️"). Keep it skimmable. Show the caption in the chat too so they can copy it directly.

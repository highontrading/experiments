---
name: effects
description: Show and explain the Vibe Editor effects library (motion effects, caption styles, colour looks, sound effects, fonts) and suggest effects for a video idea. Use when the user asks what effects, captions, looks, sounds or fonts are available, or wants ideas for how to edit something.
---

# Vibe Editor — effects library

Engine: `${CLAUDE_SKILL_DIR}/../edit/scripts/vibe.py` (run with `python3`; on Windows `python`/`py`). Full option details: `${CLAUDE_SKILL_DIR}/../edit/reference/edit-plan.md`.

Run `python3 "<ENGINE>" list` (or `list effects|captions|looks|sfx|fonts`) and present the result **as a friendly menu**, grouped, with one line each, not as raw terminal output. Example shape:

**🎬 Motion effects**: animated titles (pop, slide, drop, punch, stamp, typewriter, split, glow, highlight), info cards (tip, myth vs fact, quote, glass), tick-on checklists, money/number counters, CTA pills, name lower-thirds, tags, progress bar, 3-2-1 countdown, punch/push/pulse zooms, camera shake, glitch, flash, black & white, blur, darken, cinematic bars, b-roll cutaways, picture-in-picture, logo overlay
**💬 Caption styles (15)**: bold-pop, clean, karaoke, single-word, boxed, neon, handwritten, minimal, red-hot, comic, elegant, typewriter, blob-purple, blob-yellow, hindi-bold
**🎨 Looks (12)**: natural, punchy, warm, cool, cinematic, moody, vintage, bw, airy, matte, vivid, neon-night
**🔊 Sounds (25)**: whoosh, pop, ding, cash, glitch, riser, impact, typing, notification…
**🔤 Fonts (26)**: incl. Hindi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi scripts

Then help them choose: if they describe their video ("finance tips, serious tone"), suggest a combo (caption style + look + 4–6 effects with when to use each) and offer to apply it to their next edit or save it as their default in `brand/brand.json`.

If they want to **see** an effect, offer to render a quick preview on one of their existing jobs (add the effect to a copy of the edit plan, `render <job> --preview --edit <copy>`, then `stills <job> --times <t>` and show them the frame).

New effect ideas not in the library? Most can be built from existing pieces (e.g. "money rain" → counter + cash sound + flash; "breaking news" → highlight title + tag + impact). Be creative and say what you're combining.

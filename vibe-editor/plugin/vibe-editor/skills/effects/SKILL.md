---
name: effects
description: Show and explain the Vibe Editor library (90+ motion effects incl. UI mockups, charts, AI cut-out effects, transitions and frames; 47 caption styles; 36 looks; 50 sound effects; 70+ fonts incl. Indian scripts; preset combos) and suggest effects for a video idea. Use when the user asks what effects, captions, looks, sounds or fonts are available, wants ideas, or wants to preview an effect.
---

# Vibe Editor — effects library

Engine: `${CLAUDE_SKILL_DIR}/../edit/scripts/vibe.py` (run with `python3`; Windows `python`/`py`). Full options: `${CLAUDE_SKILL_DIR}/../edit/reference/edit-plan.md`.

Run `python3 "<ENGINE>" list` (or `list effects|captions|looks|sounds|fonts|presets`) and present it **as a friendly grouped menu**, one line per item, not raw terminal output. Shape:

**✨ Wow (AI cut-out)**: text behind you, sticker cut-out, outline glow, background swap, clone row, dolly zoom, frame break, type wall behind you
**🎬 Titles (40 animations)**: pop, punch, slide, typewriter, glitch, cascade, wipe, blur-in, marker highlight, underline draw, outline fill, sketch, press, ransom paper-cut, serif flow, two-tone stack, 3D, glass, neon, blow-away…
**📱 UI mockups**: phone, keyboard typing, search bar, incoming call, voice note, comment box, AI prompt box, notification, DM chat, post card, browser, live cursor, poll, question box, stickers
**📊 Data**: bar chart, line chart, progress ring, stat bars, post wall + counter, day dial, list panel, timeline, rating, versus, price tag, KPI, calendar, counters, checklists
**🎨 Decor**: notes wall, orbit text, orbit cards, head stack, chip roll, doodles, hand-drawn arrows & circles, speed lines, shockwave, confetti, sparkles, word stickers, light leak, burst
**🎞 Video**: punch/push/zoom-through, shake, freeze frame, rack focus, impact frame, spotlight, glitch, VHS, black & white, newspaper/banknote/polaroid/phone/window/magazine frames, pullback, letter dive, split/PiP layouts, double exposure, blade slice, doors, paper tear
**💬 Captions (47)** · **🎨 Looks (36)** · **🔊 Sounds (50)** · **🔤 Fonts (70+, incl. Hindi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi)** · **⚡ Preset combos**: hook-slam, mind-blown, money-moment, plot-twist, cover-story, sticker-me…

Mention ★ items as theirs. Then help them choose: from their idea ("finance tips, serious tone") suggest a combo (caption style + look + 4–6 effects with when to use each) and offer to apply it to the next edit or save it as their default (brand.json).

To **show** an effect: add it to a copy of an existing job's plan, `render <job> --preview --edit <copy>`, `stills <job> --times <t>`, and show the frame.

Want something not in the list? It's possible: tune options, combine effects, save a preset, or design a new animation. Follow the **style** skill.

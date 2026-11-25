---
name: style
description: Match the style of a reference reel, video or screenshot (captions, titles, motion graphics, transitions, colour grade, sounds, fonts) and save it as the creator's own reusable style. Also designs brand-new custom effects and animations that are not in the library, adds the creator's own fonts, sounds and LUT colour grades. Use when the user shares a reference ("make it like this", "copy this caption style", "I want this effect"), wants a custom effect, or wants to use their own font, sound or colour grade.
---

# Vibe Editor — match a reference & create custom styles

Engine: `${CLAUDE_SKILL_DIR}/../edit/scripts/vibe.py` (run with `python3`; Windows `python`/`py`). If the placeholder wasn't replaced, find `skills/edit/scripts/vibe.py` inside this plugin. Full effect/option reference: `${CLAUDE_SKILL_DIR}/../edit/reference/edit-plan.md`. Read it before designing.

The library is a **starting point, not a limit.** Every caption style, title animation, effect, look and preset can be tuned, combined, or replaced with something new you design. Never tell a user "we don't have that". Get as close as possible with the library, then build what's missing.

## 1. Study the reference

- **Video** (file in `references/`, `inbox/`, or attached): `python3 "<ENGINE>" peek "<file>" --n 18` → open the contact-sheet image. For a fast effect, zoom in on a short span: `peek "<file>" --start 3.2 --end 4.4 --n 12 --width 540`. Look at several sheets if needed.
- **Screenshot/photo**: open the image directly.
- **Link** (Instagram/YouTube): you usually can't download it. Ask for a screen recording or screenshots dropped into `references/`.

Write down precisely (tell the user briefly):
- **Captions**: font feel (heavy geometric / condensed / serif / handwritten / mono), case, size, colour, highlight colour + how the active word is shown (colour, blob/box, underline, scale pop, fill, glow, bigger emphasis words, serif emphasis words), words per line, position, outline/shadow, entrance.
- **Titles/text graphics**: animation (pop, slide, typewriter, glitch, blur-in, wipe, cascade, stack, 3D, glass…), fonts, colours, position, behind the person or not.
- **Motion graphics**: which library effects match (cards, UI mockups, charts, stickers, doodles, frames, cut-outs…).
- **Transitions/camera**: zoom punches, whip/zoom-through, flashes, glitches, freezes, shakes, speed.
- **Colour**: warm/cool, contrast, saturation, film grain, black & white.
- **Sound**: whooshes on titles, pops on captions, risers, music energy.
- **Pacing**: cut tightness (`max_pause`), effects per second.

## 2. Map to the library first

`python3 "<ENGINE>" list` shows everything: caption styles, looks, sounds, fonts, effects, preset combos (★ = user's own).
Pick the closest caption style and override its fields; pick effects + their options; pick the look and sounds.

## 3. Build what's missing

| Need | How |
|---|---|
| **Caption look not in the list** | Save a new style based on the closest one: `python3 "<ENGINE>" save caption <name> '{"base":"bold-pop","font":"montserrat-black","highlight":"#7CFFB2","anim":"fill","max_words":2,"position":0.66,"uppercase":true,"outline_w":0,"shadow":6}'`. Fields: font, size, color, highlight, outline, outline_w, shadow, anim (pop fade karaoke typewriter single blob bounce slide rise fill underline kinetic flip blur outline glow serif stack none), uppercase, max_words, position, blob, box, box_color, emphasis_color, emphasis_font, emphasis_scale, line_height. |
| **Their own font** | Ask them to drop the `.ttf`/`.otf` into the workspace `fonts/` folder (or `brand/`). `python3 "<ENGINE>" fonts` lists the key to use (e.g. `"font": "rubikglitch-regular"`; family names work too). It works in captions, titles, every effect. Fonts must be licensed for their use. |
| **Their own sound** | Drop `.wav/.mp3` into `sounds/`; use the file name (without extension) anywhere a sound name goes (`"sfx": "my-swoosh"`, `{"type":"sfx","name":"my-swoosh"}`). |
| **Their own colour grade** | Drop a `.cube` LUT into `looks/`; use `"look": "<file-name>"`. Or save an ffmpeg filter look: `save look <name> '{"filter":"eq=contrast=1.1:saturation=0.9,colorbalance=rs=0.04:bs=-0.03","desc":"…"}'` (validated automatically; invalid filters are skipped, never crash). |
| **A combination they'll reuse** (e.g. "my intro") | Save an effect preset: `save effect my-intro '{"desc":"My intro","params":{"text":"HELLO"},"events":[{"type":"zoom","at":0,"dur":0.8,"style":"punch"},{"type":"title","at":0,"dur":1.8,"text":"{text}","style":"cascade","sfx":"whoosh"}]}'` → later `{"type":"my-intro","at":0,"text":"NEW VIDEO"}`. Times inside presets are relative (0 = when the preset starts). |
| **A genuinely new animation** | Design it with a raw `ass` effect (libass override tags: `\pos \move \t \fscx \fscy \frz \frx \fry \alpha \blur \clip \1c \3c \bord \p1` drawings). Placeholders `{W} {H} {cx} {cy} {accent} {dur_ms} {text}` + your own `params`. Example: `{"type":"ass","at":3,"dur":1.6,"params":{"word":"SPIN"},"layers":[{"start":0,"end":1.6,"layer":9,"font":"anton","size":170,"color":"#FFFFFF","bord":6,"text":"{\\an5\\pos({cx},540)\\frz-180\\fscx10\\fscy10\\t(0,450,\\frz0\\fscx100\\fscy100)}{word}"},{"start":0.2,"end":1.6,"shape":true,"color":"{accent}","text":"{\\an5\\pos({cx},540)\\fscx0\\t(200,500,\\fscx100)\\p1}m -300 70 l 300 70 300 86 -300 86"}],"box":[0.2,0.22,0.8,0.34]}`. Then save it as an effect preset so it's reusable. `box` (fractions) tells captions to avoid that area. |
| **A colour/video treatment** | `{"type":"filter","filter":"<ffmpeg filter>","at":…,"dur":…}` (validated; invalid ones are skipped). |
| **A transparent animation/sticker they have** | `.gif`, `.png`, transparent `.mov`/`.webm` in `brand/` or `broll/` → `{"type":"overlay","file":"sticker.gif","position":"top-right","size":0.3}`. |

## 4. Test it, look at it, refine

Make a quick test on one of their prepped videos (or prep one): write a test plan file, `python3 "<ENGINE>" check <job> --edit test.json`, `render <job> --preview --edit test.json`, `stills <job> --times …` → open the storyboard and **compare side by side with the reference**. Iterate until it's close. Then show them the frames ("Here's your version") and ask for tweaks.

## 5. Save it as their style

Update `brand/brand.json`: `caption_style`, `look`, `fonts.title/body/serif`, `colors.accent`, and add notes like `"notes": ["Uses my-intro preset at the start", "Glitch transitions between points"]`. From now on every edit uses it automatically (the **edit** skill reads brand.json and `styles/`).

Tell them what you created in plain words: "Saved your caption style 'my-captions', your intro 'my-intro' and the warm-teal colour grade. Every new reel will use them."

## Rules

- Recreate the **look and feel**. Never copy someone else's footage, logos, or music into the user's video.
- Fonts, sounds and LUTs the user adds must be ones they're allowed to use.
- Keep things neutral and readable by default; use the reference's colours only if the user wants them.

---
name: cinematic-3d-video
description: Makes high-end, photoreal, cinematic 3D video clips entirely in code - real path-traced lighting (Blender Cycles driven by Python), designed camera moves, film grade and sound design - instead of AI video generators. Use this whenever the user wants a 3D video, 3D animation, cinematic product shot, "Blender-quality" render, a reel/short/ad with a 3D scene, a hero shot of an object (retro computer, gadget, bottle, shoe, car, room), "every frame in code", or says AI video looks fake/generic and they want something that looks shot on a real camera. Also use it to recreate the look of a reference video or image as a 3D scene, or to extend/re-render an existing scene built with this skill.
---

# Cinematic 3D video in code

You are acting as a small 3D studio: art director, set builder, lighting DP, camera operator,
colourist and sound designer. The output is a real rendered video file. The look comes from
physically based light (Cycles path tracing), believable imperfection, a real-lens camera and a
film finish - not from a generative model - which is why it doesn't read as "AI".

Everything you need is bundled:
- `scripts/cine.py` - Blender helper library (materials, bevelled geometry, rooms with windows,
  blinds, lights, dust, cameras with focus targets and handheld drift, cuts, render presets, bloom/lens).
- `scripts/polyhaven.py` - search/download CC0 scanned models, PBR textures and HDRIs.
- `scripts/lookdev.sh` - one look-dev pass: rebuild scene.py, render preview stills, stack them into a sheet.
- `scripts/render.py` - stills, frame ranges, and diagnostics: `inframe` (where each object lands in
  frame), `witness` (wide view of the whole set - shows where lights/windows really are), `inspect`
  (sizes, variants and material names of imported scans).
- `scripts/render_chunk.sh` - final frame range -> near-lossless chunk.
- `scripts/assemble.sh` - joins chunks, grades (bloom, warmth, vignette, grain), upscales, muxes audio.
- `scripts/sfx.py` - layered sound design via ElevenLabs sound effects.
- `scripts/contact_sheet.sh` - one image of a video over time, for reviewing motion and continuity.
- `examples/retro_desk/` - golden-hour retro computer: modelled hero, sun through blinds, 2 shots, 7 s.
- `examples/night_camera/` - night product shot: scanned hero, desk-lamp practical, thin window glass
  with city bokeh, recoloured scan, orbit camera.
  Read the example closest to the brief before writing a new scene: it is the pattern to copy.

References (read when you reach that stage, not all up front):
- `references/look-bible.md` - what makes it look real; the look-dev checklist. **Read before look-dev.**
- `references/lighting.md` - lighting recipes with numbers (golden hour, night lamp, overcast, studio, neon, candle).
- `references/camera.md` - lenses, f-stops, move recipes, 9:16 composition, edit rhythm.
- `references/modeling-materials.md` - building hero objects from primitives; material values.
- `references/rendering-delivery.md` - render budget, distributing frames across cloud sessions, assembly, verification.
- `references/sound.md` - sound layers and the plan.json format.
- `references/pitfalls.md` - failures already hit and their fixes. Skim before the first render.

## Workflow

### 1. Turn the brief into a shot plan
Write `shots.md` in the project folder before touching Blender: the subject, mood, time of day,
key light (and its motivation), palette, aspect ratio, duration, and a table of shots (frames,
lens, f-stop, move, focus point, what the viewer should notice). Keep clips short: 2-4 shots of
2.5-4 s each at 24 fps is the sweet spot for social, and render time scales with frames.

If the user gave a reference video or image, extract its frames with ffmpeg and study them
first: name the light direction, colour temperature, lens feel, moves and pacing in `shots.md`.
Match the look and composition rather than copying a specific branded product or character.

If the brief is vague, pick a strong default (motivated hard key, dark surroundings, one hero,
push-in + detail shot) and say what you chose - don't stall on questions.

### 2. Set up
```bash
SKILL=<this skill's directory>; export CINE_LIB=$SKILL/scripts   # re-export in every shell call, or use absolute paths
BLENDER=$(bash $CINE_LIB/setup_blender.sh)          # installs Blender 4.2 LTS once
python3 $CINE_LIB/polyhaven.py search models "plant book lamp"   # find supporting props
python3 $CINE_LIB/polyhaven.py model <ids...>; python3 $CINE_LIB/polyhaven.py texture <ids...>
```
Before placing a scanned asset, run `$BLENDER -b scene.blend -P $CINE_LIB/render.py -- inspect <name>`
to learn its real size, which way it faces, its variants and material names. Scans can carry real
trademarks in their textures (e.g. a camera maker's name on the lens ring): check at 100% and paint
them out or choose another asset - see modeling-materials.md.

Work in a project folder (e.g. `<repo>/<project-name>/`) holding `shots.md`, `scene.py`, a
`make_textures.py` for screens/labels/posters, and a `setup.sh` that fetches assets and generates
textures - so any machine can rebuild the scene from the repo alone.

### 3. Build the scene in code
Write `scene.py` using `cine.py`, following the order in `examples/retro_desk/scene.py`:
materials -> room and the key light's path -> hero object (primary, secondary, tertiary detail)
-> props -> background depth -> dust -> lights -> cameras and cuts -> `render_settings` ->
`compositor` -> `save`. Build it with `$BLENDER -b -P scene.py -- scene.blend`.

Spend the effort on the hero: bevelled edges, seams, vents, buttons, labels, cables and
slightly irregular repeated parts. A generic primitive with perfect edges is what makes 3D look cheap.

### 4. Look-dev loop (the most important step)
Rebuild and render preview stills in one command, then *look at the sheet* (Read the PNG):
```bash
bash $CINE_LIB/lookdev.sh scene.py v1            # first/middle/last frame, 50% res, 16 samples (~10 s each)
bash $CINE_LIB/lookdev.sh scene.py v2 97,130,168 # specific frames, e.g. per shot
```
Check the first, middle and last frame of every shot against the checklist in `look-bible.md`.
Change one lighting variable at a time (independent bug fixes can go together); expect 4-8 passes.
Typical fixes: light not reaching the hero, flat even lighting, stretched textures, soft focus,
props drifting out of frame, lights showing up as blotches in glass/varnish.

When a still is wrong and you can't tell why, don't guess - diagnose:
- `render.py -- witness w.png --pct 40 --samples 12` - see the whole set from outside: where the
  key actually lands, whether the window is open, what's blocking what.
- `render.py -- inframe 1,48,96` - which objects are IN / PARTIAL / OUT of frame at those frames.
- Hide one object at a time (`hide_render`) in a throwaway still to find what's causing an artefact.

Move on only when a 50%-res still would pass for a frame from a real film. Rendering a full
sequence with a lighting mistake wastes an hour.

### 5. Budget and render
Time one full-resolution frame, then compute seconds-per-frame x frames / machines
(`rendering-delivery.md`). On a 4-core CPU a 720x1280 frame takes ~1-2 min, so a 7 s clip is ~5 h
on one machine. If that's more than ~30-40 minutes, distribute: commit the project, then spawn
worker cloud sessions that each render a frame range with `render_chunk.sh` and push their chunk
back (exact worker prompt in `rendering-delivery.md`). Render your own range in the background
meanwhile, and tell the user the ETA.

### 6. Sound
Write a `sound_plan.json` (`references/sound.md`) with a room-tone bed, optional pad, whooshes on
cuts and foley synced to on-screen actions, then `python3 $CINE_LIB/sfx.py sound_plan.json mix.wav`.
Do this while frames render.

### 7. Assemble, verify, deliver
```bash
bash $CINE_LIB/assemble.sh chunks out/<name>.mp4 mix.wav 1080x1920
bash $CINE_LIB/contact_sheet.sh out/<name>.mp4 out/sheet.jpg 2
```
Look at the contact sheet and one full-res frame per shot. Check the frame count and duration
match the plan. Then send `<name>_social.mp4` to the user and commit the project (scripts,
small generated textures, sound plan; final videos if the user wants them in the repo).

When you report back, be specific and honest: what's in each shot, the specs, what differs from
the reference or brief, and two or three concrete next steps (more shots, captions/CTA, look changes).

## Principles that matter more than any single setting
- **Darkness is a feature.** One motivated key, everything else much weaker, real black somewhere.
- **Shape the light** (blinds, window frames, leaves, lamp cones) so it describes form and depth.
- **Imperfection everywhere**: bevels, wear, roughness variation, small random offsets, real scans.
- **Real lens, real operator**: DOF sized to distance, eased moves, a few mm of handheld drift.
- **Finish like film**: AgX, gentle bloom, warmth split, vignette, temporal grain after upscaling.
- **Look before you render**: every expensive step is preceded by a cheap still you inspect.

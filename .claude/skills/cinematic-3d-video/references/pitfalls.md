# Pitfalls (each one cost real render time - check before you hit them)

| Symptom | Cause | Fix |
|---|---|---|
| Wood/plaster looks like long streaks | Default cube UVs stretch one image over a whole 8 m wall | `cine.pbr()` (Object coords + BOX projection), `scale` = repeats/metre |
| Gobo/blind stripes vanished, light looks flat | A volumetric haze box absorbed the key light | Remove the volume; use `cine.dust()` + bloom for atmosphere |
| No stripes at all, just a uniform patch | Slats tilted so they block almost everything, or sun misses the window | Sketch the ray: window point + t*direction; tilt slats -10..-25 deg toward the ray |
| Light leaking from nowhere | Room not closed (missing ceiling/wall), so sun enters directly | Use `cine.room()`; it builds all six sides |
| Close-up completely soft | f/1.4 at 20-30 cm has millimetres of DOF; focus target not on the subject | f/3-4 for close-ups; put the camera target exactly on the detail |
| Hero geometry poking through itself (cone through screen) | Primitive rotated/scaled in the wrong axes | Build with `tapered_box` (explicit front/back faces) and preview from 2 angles |
| Graded frames turn green/pink posterised | ffmpeg blend/curves on 16-bit rgb48 PNG input | Convert first: `format=gbrp` (assemble.sh does this); render finals as 8-bit |
| Screen looks like a flat sticker | Emission too high + no vignette/glass | `screen_mat` strength 0.6-1.2 + dark vignette and glow in the image itself |
| Everything evenly lit, looks like CG | Fill/world too strong | world near black, fill ~1/8 of key, darken the wall tint |
| Image orange and saturated, "toy" look | Albedos too saturated/bright | Desaturate base colours (beige 0.70,0.64,0.53 not 0.72,0.63,0.48) |
| Window renders pure white or pure black; city card behind it invisible | Solidified refractive `glass()` pane; lights behind it blocked | `thin_glass()` for panes; keep window lights outside the pane |
| Softbox-shaped blotch in glass/screen/varnish | An area light visible to glossy rays | `area(..., reflect=False)` for fills and kickers |
| Lamp spot does nothing | Spot placed inside the opaque bulb/shade mesh | `practical_bulb()` (shadow-transparent) or move the spot 5-8 cm out along the shade axis |
| Night key far too weak | Recipe energy assumed a closer lamp | Scale with distance squared (lighting.md section 2) |
| Prop missing / a sliver at frame edge | Orbit/push moved it out | `render.py -- inframe` before rendering; move the prop or adjust the move |
| Brand name readable on a scanned prop | Scan textures carry real trademarks | Paint out of the diffuse texture or swap asset (modeling-materials.md) |
| Imported scan appears twice | Asset file ships variants side by side | `import_asset(..., only=[...], recenter=True)`; names via `render.py -- inspect` |
| `Python file "/scripts/render.py" could not be opened` | `CINE_LIB` not set in this shell call | Use `lookdev.sh` (sets it) or absolute paths |
| Polyhaven API 403 | No User-Agent header | `polyhaven.py` sets one |
| Bash killed the background render | `nohup ... &` inside a foreground call can die with the shell | Use the tool's `run_in_background` |
| Hour-long renders | 4-core CPU, ~1.5-2.5 min/frame at 720p | Time one frame first, then distribute (rendering-delivery.md) |
| Chunks don't line up | Different seeds/Blender versions per machine | `cine.reset(seed)`, setup_blender.sh pins 4.2.3 |
| Huge master file (50 MB for 7 s) | Temporal grain at crf 14 | Upload the `_social.mp4`; keep the master for re-edits |
| `ld.inputs['Distort']` KeyError | Blender 4.2 renamed it | `'Distortion'` (cine.compositor handles it) |

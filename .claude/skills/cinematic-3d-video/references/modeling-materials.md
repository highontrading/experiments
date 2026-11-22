# Modelling hero objects from primitives + material recipes

## Building a believable hero from code
Work like a prop maker: big forms first, then secondary forms, then tiny functional details.
1. **Primary forms** - 2-5 bevelled boxes / tapered boxes / cylinders that give the silhouette.
   Get proportions from a real reference (measure in cm, convert to m). Wrong proportions make
   everything else wasted effort.
2. **Secondary forms** - recesses (a darker inner box slightly behind the face), bezels, stands,
   feet, handles, lids. Offsets of 2-10 mm between parts create the shadow lines that read as
   "manufactured".
3. **Tertiary details** - seams (3 mm boxes in a darker material), vents (rows of thin boxes),
   buttons, LEDs (tiny emissive boxes), labels/badges (image_mat), screws, cables (`cine.cable`),
   sticky notes/stickers (`cine.panel` with curl).
4. **Repeated parts** - build one mesh, place copies with `cine.instances()` and tiny random
   offsets/rotations (keys, tiles, books, bolts).

Avoid recreating a specific branded product (logos, exact trade dress). Make it generic: same era
and vibe, your own proportions and badge.

Useful shapes in cine.py: `box`, `tapered_box` (CRT/TV/speaker/lamp head), `panel` (screens with
bulge, paper with curl, posters), `cylinder` (cups, cans, lenses, knobs; `hollow=` for cups),
`mug`, `cable`, `instances`. Anything else: plain bpy/bmesh, then `C._smooth_bevel(obj, w, seg)`.

## When to use Poly Haven instead
Plants, books with real covers, paper stacks, fabric, food, tools, furniture, worn wood - anything
organic or irregular. `python3 scripts/polyhaven.py search models "<words>"`, then
`model <id>` and `cine.import_asset(path, loc, rot_z, scale)`. Check scale in a preview: most
assets are real-world metres already.

## Material recipes (Principled BSDF values)
| Surface | Helper / settings |
|---|---|
| Aged ABS plastic (beige electronics) | `plastic(name, (0.70,0.64,0.53), rough=0.42, grime=0.12)` |
| Glossy painted / car paint | `mat(c, 0.25, **{'Coat Weight':1,'Coat Roughness':0.05})` + `add_wear(grime=0.03)` |
| Brushed aluminium | `metal(name, (0.85,0.85,0.86), rough=0.3)` |
| Chrome | `metal(name, (0.95,0.95,0.95), rough=0.05, grime=0.02)` |
| Brass / gold | `metal(name, (0.9,0.65,0.3), rough=0.25)` |
| Varnished wood desk | `pbr(name, tex/black_walnut_veneer_02, scale=1.2, bump=0.15, tint=(0.85,0.62,0.45), **{'Coat Weight':0.35,'Coat Roughness':0.12})` |
| Painted plaster wall | `pbr(name, tex/beige_wall_002, 1.5, bump=0.5, tint=...)` - tint darker than you think |
| Paper / sticky note | `mat(c, 0.8, **{'Subsurface Weight':0.2})` |
| Ceramic mug | `mat(c, 0.15, **{'Coat Weight':0.8})` |
| Glass | `glass(name)`; thin glass = solidify 2-3 mm; tinted = tint colour 0.9-0.98 |
| Rubber / matte black | `mat((0.02,0.02,0.02), 0.6-0.8)` - never pure 0 black |
| Fabric | `mat(c, 0.9, **{'Sheen Weight':0.5})` + noise bump |
| Screen | `screen_mat(name, png, strength=0.6-1.2 day, 1.5-2.5 night)` |
| LED / indicator | `mat(c, 0.3, **{'Emission Color':(...,1),'Emission Strength':5-10})` |

Colour values: real-world albedos are lower than people expect. White paper ~0.8, beige plastic
~0.65, dark wood ~0.1-0.3, black plastic ~0.02-0.04. Values near 1.0 look like light sources.

## Screen / label content
Draw it with PIL at 1024x768 (screens) or the label's aspect ratio. For CRTs add a dark rounded
vignette, slight blur glow and scanlines (see `examples/retro_desk/make_textures.py`). For modern
LCDs skip scanlines; add a faint glass reflection by keeping coat on in `screen_mat`.

# Look bible: what makes a render read as "shot on a camera" instead of "CG" or "AI"

Viewers can't name why something looks fake, but they react to a short list of tells. Every
look-dev still should be checked against this list. Ranked roughly by impact.

## 1. Light has a source, a direction and a shape
- One dominant **motivated key** (sun through a window, a desk lamp, a monitor). Everything else is
  much weaker. Key:fill around **6:1 to 10:1** for moody work, 3:1 for bright/commercial.
- Give the key **shape**: blinds, a window frame, leaves, a lamp cone. Striped/broken light (a
  "gobo") is the single strongest "cinematic" signal - it shows depth on every surface it crosses.
- Let parts of the frame **fall to near-black**. Even, everywhere-lit images read as CG/stock.
- Warm key + slightly cool fill/rim (or the reverse at night) - colour contrast reads as depth.
- Practical lights in frame (screens, LEDs, bulbs) should be the brightest-looking things but not clip.

## 2. Nothing is perfect
- **Bevel every edge** (1-20 mm depending on object size). Razor edges are the #1 modelling tell.
- Break up every flat material: colour variation (grime, yellowing), **roughness variation**
  (fingerprints, wear) and micro-bump. `cine.add_wear()` / `cine.plastic()` do this.
- Slight randomness in repeated things: keycaps a few tenths of a degree off, books of different
  heights, papers rotated, a cable that sags. Seed the RNG so it's repeatable.
- Real scanned props (Poly Haven) for organic/messy things: plants, paper, books, fabric, worn wood.

## 3. Detail density at the right scale
- The hero object needs **small functional details**: seams, vents, buttons, LEDs, labels,
  screws, slots, feet, cables. 15-30 tiny parts on a hero is normal.
- Scale cues: a mug, glasses, pens, a keyboard - objects everyone knows the size of.
- Background objects can be simple boxes; depth of field turns them into believable shapes.

## 4. A real lens
- **Depth of field** sized to the shot: close-ups f/2.8-4 (f/1.4 at 25 cm leaves *nothing* sharp),
  medium shots f/2-2.8. Focus on the story point (screen, product logo, eyes).
- Focal length 32-50 mm for interiors (35 mm full-frame equivalent); 65-100 mm for product detail.
  Ultra-wide on small objects instantly reads as toy/miniature.
- Subtle barrel distortion + chromatic dispersion + bloom on highlights (`cine.compositor()`).
- Motion blur on (shutter 0.5 = 180 degrees).

## 5. A real operator
- Slow, eased moves (Bezier with clamped handles). Constant-speed linear moves feel robotic.
- 2-5 mm of Perlin "handheld" drift on the camera position. Zero drift = CG; >1 cm = shaky.
- Rack focus by animating the focus target from foreground to subject.
- One idea per shot; 2.5-4 s per shot for social; cut on motion.

## 6. Atmosphere
- Dust motes (tiny spheres) that only show where the hard light hits them.
- Avoid volumetric "haze" boxes in Cycles for interiors: they attenuate the key light, kill the
  gobo pattern and double render time (see pitfalls.md). Fake shafts with dust + bloom instead.

## 7. Film finish (post, in assemble.sh)
- AgX view transform with a medium-high-contrast look (filmic highlight roll-off).
- Gentle bloom, a little warmth split, +10-15% saturation, soft vignette, fine **temporal** grain
  added after upscaling. Grain hides denoiser smoothness - the plasticky "AI" sheen.

## Look-dev checklist (run on every preview still)
- [ ] Can I point to the key light and say where it comes from?
- [ ] Is there real shadow/near-black somewhere in frame?
- [ ] Does the key have shape (stripes, frame, falloff) on the hero?
- [ ] Are edges bevelled and catching highlights?
- [ ] Do surfaces vary (no flat CG colour), including roughness?
- [ ] Is the story point in focus and readable (screen text, label)?
- [ ] Is anything intersecting, floating, or stretched (textures!)?
- [ ] Does the colour feel intentional (warm/cool contrast), not grey?
- [ ] Would a viewer know the scale of the scene from familiar objects?

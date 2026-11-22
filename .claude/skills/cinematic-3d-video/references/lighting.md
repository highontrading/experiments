# Lighting recipes (Cycles, values tuned with AgX Medium High Contrast, exposure 0)

Pick the recipe closest to the brief, then adjust. Energies assume a closed room built with
`cine.room()` (so the only daylight is what passes the window) and a near-black `cine.world()`.

## Contents
1. Golden hour through blinds (reference scene)
2. Night: desk lamp + screen glow
3. Overcast / soft window (calm, editorial)
4. Studio product (seamless sweep)
5. Neon night / cyberpunk
6. Candle / fire
7. Tuning rules

## 1. Golden hour through blinds  (examples/retro_desk)
- `sun(direction=(1.0, 0.55, -0.42), energy=12, color=(1.0, 0.62, 0.30), angle_deg=0.9)` - low
  (~20 deg elevation), raking across the subject toward the back wall.
- Window in the side wall + `blinds(spacing=0.085, slat_w=0.07, tilt_deg=-16)` -> broad stripes.
  Narrower stripes: spacing 0.05-0.06. More light: tilt toward 0. Fewer, harder bars: tilt -25.
- `sky_card` outside the window, warm, strength 3 (bounce + something bright in reflections).
- Fill: warm disk area light camera-side, energy ~6 (ratio ~1:8). Rim: cool area behind, energy 3.
- World colour (0.010, 0.0075, 0.005).
- Check the sun actually reaches the subject: rays travel from the window along `direction`;
  sketch it (window x,y,z + t*direction) before rendering.

## 2. Night: desk lamp + screen glow
- World (0.002, 0.003, 0.006). No sun.
- Key: `spot(loc=lamp head, target=desk, energy=40-80, color=(1.0, 0.72, 0.45), cone_deg=60, blend=0.5, radius=0.02)`.
  Put an emissive bulb mesh (emission 20-40) inside a lamp shade so the practical reads in frame.
- Screen: `screen_mat(strength=1.5-2.5)` - at night the screen is a real light; it will tint the
  face of the hero/keyboard cool. Add a weak cool area light just in front of the screen (energy 2-4,
  colour (0.6, 0.75, 1.0)) if the glow needs to reach further.
- Window card far behind: deep blue (0.15, 0.25, 0.6), strength 0.5-1 for "city at night" separation.

## 3. Overcast / soft window
- Big `area(shape='RECTANGLE', size=2-3, energy=150-300, color=(0.92, 0.96, 1.0))` placed in the
  window opening facing in. No sun. Optional thin curtains (Transmission 0.6 plane) to soften.
- Fill comes from bounce; add a white bounce card (plane, diffuse 0.8) opposite the window.
- Ratio ~3:1. Works for food, ceramics, fashion, calm tech.

## 4. Studio product (seamless sweep)
- Sweep: a plane bent with a curve modifier or a quarter-cylinder; mid-grey or brand colour.
- Key: large softbox `area(size=1.2, energy=80-150)` 45 deg above-left. Rim: two strip lights
  (`shape='RECTANGLE'`, size (0.2, 1.5)) behind left and right, energy 60-120, for edge highlights.
- Fill: white card or weak area (ratio 2:1-4:1). Slow turntable or slide moves; 85-100 mm lens.
- For glossy products, what's *reflected* matters: place emissive cards where the highlights should be.

## 5. Neon night
- Two strongly coloured practicals: magenta (1.0, 0.1, 0.5) and cyan (0.1, 0.8, 1.0) emissive
  tubes (cylinders, emission 10-30) plus matching area lights (energy 20-50) to actually cast light.
- Wet/glossy surfaces (roughness 0.05-0.15) to double the light in reflections.
- Keep blacks deep; skip the warm grade in assemble (set GRADE without colorbalance).

## 6. Candle / fire
- `point(radius=0.01, energy=2-5, color=(1.0, 0.55, 0.2))` at the flame; flame = small emissive
  teardrop (emission 30+). Flicker: add a NOISE modifier to the light's energy f-curve
  (`light.data.keyframe_insert('energy')` then add modifier, strength ~20% of energy, scale 3-5).

## 7. Tuning rules
- Change one light at a time between preview stills.
- If the image looks flat: lower fill, lower world, raise key. If it looks harsh: raise fill a
  little or enlarge the key (bigger area / larger sun angle) - don't add more lights.
- Screens/emitters clipping to white: lower their emission rather than the exposure.
- If something important is dark, add a small motivated "kicker" (area, 10-30 cm, low energy)
  rather than raising global light.

# Camera language for short cinematic clips

`cine.camera(name, keys=[(frame, cam_loc, target_loc), ...], lens, fstop, handheld)` aims at a
moving target empty, which is also the focus point. So framing *and* focus are both keyframes.

## Shot sizes for a desk-scale subject (object ~0.3-0.5 m)
| Shot | Distance to subject | Lens | f-stop |
|---|---|---|---|
| Wide / establishing | 1.5-2.5 m | 28-35 mm | 2.8-4 |
| Medium (hero + surroundings) | 0.7-1.2 m | 40-50 mm | 2-2.8 |
| Close-up (one feature) | 0.3-0.5 m | 35-65 mm | 2.8-4 |
| Macro detail (keys, logo, texture) | 0.1-0.25 m | 50-100 mm | 4-5.6 |
Scale up proportionally for room/vehicle-scale subjects. DOF gets shallower as you get closer -
open the aperture less for close work or nothing will be sharp.

## Move recipes (24 fps)
- **Push-in (reveal/importance)**: 3-4 s, camera travels 30-45% closer, target barely moves,
  slight lateral arc (start 0.3 m to one side, end nearer centre). Reference shot A.
- **Slide / truck (parallax)**: camera moves sideways 0.2-0.5 m with foreground objects passing
  close to lens; target stays on subject. Foreground blur = depth.
- **Low slide + tilt-up + rack focus**: start inches above the surface focused on a foreground
  detail, slide forward and tilt up so the target travels to the hero, focus follows. Reference shot B.
- **Orbit**: `cine.orbit_camera(name, center, target, frames, angle_deg=(30,-10), radius=(0.43,0.375), height=(0.115,0.105))`
  - 20-45 deg over 4 s, with a slight push (radius) and crane (height) built in. Product hero shots.
- **Crane down / top-down**: camera descends 0.3-0.6 m while target stays; or straight overhead
  for flat-lays with a slow rotation (5-10 deg).
- **Hold with breath**: static keys + handheld 0.002-0.003. Good for the CTA/end frame.

Middle keyframes change pacing: put the 2nd key at ~40% of the shot with ~70% of the travel for
"fast-in, settle"; or keep the 2nd key close to the 1st for a slow start.

## Handheld
`handheld=0.002-0.005` m, `handheld_scale=40-60` frames. Lower for macro, higher for wide.

## Vertical 9:16 composition
- Lens feel in portrait: Blender fits the 36 mm sensor to the frame's *height*, so horizontally a
  35 mm in 9:16 frames like a ~62 mm in 16:9. Go wider than instinct for room-scale shots (24-32 mm).
- Hero in the middle third vertically, slightly below centre, leaving headroom for captions top
  and UI bottom (platform overlays cover ~15% top and ~20% bottom).
- Use the height: foreground (desk edge, keyboard) low, hero middle, background (shelf/print) top.
- Avoid putting the hero dead centre in every shot; alternate left/right-weighted framing between cuts.

## Edit structure
- Shots of 2.5-4 s. Cut with `cine.cut(frame, cam)`. Make the next shot start already moving.
- Classic 3-beat: establishing push-in -> detail close-up -> hero reveal/hold.
- A whoosh or impact on each cut in the sound plan sells the edit.

## Checking framing fast
Render stills at the first, middle and last frame of each shot with `--pct 30 --samples 16`
before committing to a full render. Moving the camera 5 cm is cheap now and expensive later.

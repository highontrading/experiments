"""Render helper, run inside Blender:

  blender -b scene.blend -P render.py -- still FRAME OUT.png [--pct 50] [--samples 24]
  blender -b scene.blend -P render.py -- range START END OUTDIR [--samples N]

`still` is for look-dev: low pct/samples give a fast, honest preview of light and composition.
`range` renders 8-bit PNGs named f_####.png with persistent data (BVH reused between frames).
"""
import bpy, sys, argparse
argv = sys.argv[sys.argv.index('--') + 1:]
ap = argparse.ArgumentParser()
ap.add_argument('mode', choices=['still', 'range'])
ap.add_argument('rest', nargs='+')
ap.add_argument('--pct', type=int, default=100)
ap.add_argument('--samples', type=int, default=None)
a = ap.parse_args(argv)
sc = bpy.context.scene
sc.render.resolution_percentage = a.pct
if a.samples: sc.cycles.samples = a.samples
if a.mode == 'still':
    frame, out = int(a.rest[0]), a.rest[1]
    sc.frame_set(frame); sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
else:
    s, e, outdir = int(a.rest[0]), int(a.rest[1]), a.rest[2]
    sc.frame_start, sc.frame_end = s, e
    sc.render.filepath = outdir.rstrip('/') + '/f_####'
    sc.render.image_settings.color_depth = '8'
    bpy.ops.render.render(animation=True)

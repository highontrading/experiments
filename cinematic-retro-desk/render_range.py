"""blender -b scene.blend -P render_range.py -- START END OUTDIR"""
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]
sc = bpy.context.scene
sc.frame_start, sc.frame_end = int(a[0]), int(a[1])
sc.render.filepath = a[2].rstrip('/') + '/f_####'
sc.render.image_settings.color_depth = '8'
bpy.ops.render.render(animation=True)

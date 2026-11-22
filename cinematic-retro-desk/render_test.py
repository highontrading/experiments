import bpy,sys
a=sys.argv[sys.argv.index('--')+1:]
sc=bpy.context.scene; sc.frame_set(int(a[0])); sc.render.resolution_percentage=int(a[1]); sc.cycles.samples=int(a[2])
if len(a)>4 and a[4]=='novol': bpy.data.objects['haze'].hide_render=True
sc.render.filepath=a[3]; bpy.ops.render.render(write_still=True)

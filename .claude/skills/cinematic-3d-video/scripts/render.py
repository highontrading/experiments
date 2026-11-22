"""Render + diagnostics helper, run inside Blender:

  blender -b scene.blend -P render.py -- still FRAME OUT.png [--pct 50] [--samples 16]
  blender -b scene.blend -P render.py -- stills 1,48,96 OUT_PREFIX [--pct 50] [--samples 16]
        -> OUT_PREFIX_f0001.png ... and OUT_PREFIX_sheet.png (side by side), one Blender launch
  blender -b scene.blend -P render.py -- range START END OUTDIR [--samples N]
        -> OUTDIR/f_####.png (8-bit, persistent data)
  blender -b scene.blend -P render.py -- inframe 1,48,96
        -> for every top-level object: where its bounding box lands in frame (x,y in 0..1) and
           whether it's IN / PARTIAL / OUT. Find props that drift off-frame without rendering.
  blender -b scene.blend -P render.py -- witness OUT.png [--pct 50] [--samples 16] [--from x,y,z] [--frame F]
        -> renders from an extra wide camera that sees the whole set: the fastest way to check
           where lights, windows and props actually are when a still looks wrong.
  blender -b scene.blend -P render.py -- inspect [NAME_SUBSTRING]
        -> objects with type, world bbox (min/max/size) and materials; lights with energy.
           Use it to learn an imported scan's size, front axis, variants and material names.

Each still prints one summary line: `STILL <path> <seconds>s`.
"""
import bpy, sys, os, time, argparse, subprocess, shutil
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:]
ap = argparse.ArgumentParser()
ap.add_argument('mode', choices=['still', 'stills', 'range', 'inframe', 'witness', 'inspect'])
ap.add_argument('rest', nargs='*')
ap.add_argument('--pct', type=int, default=None)
ap.add_argument('--samples', type=int, default=None)
ap.add_argument('--from', dest='from_', default=None)
ap.add_argument('--frame', type=int, default=None)
a = ap.parse_args(argv)
sc = bpy.context.scene
if a.pct: sc.render.resolution_percentage = a.pct
if a.samples: sc.cycles.samples = a.samples


def still(frame, out):
    t = time.time(); sc.frame_set(frame); sc.render.filepath = os.path.abspath(out)
    bpy.ops.render.render(write_still=True)
    print(f'STILL {os.path.abspath(out)} {time.time() - t:.1f}s', flush=True)


def tops():
    return [o for o in sc.objects if o.parent is None and o.type in ('MESH', 'EMPTY', 'CURVE')
            and not o.name.startswith(('dust', 'wall', 'floor', 'ceiling', 'slat', 'cord'))]


def world_bbox(o):
    pts = []
    for c in [o] + list(o.children_recursive):
        if c.type in ('MESH', 'CURVE'):
            pts += [c.matrix_world @ Vector(v) for v in c.bound_box]
    return pts


if a.mode == 'still':
    still(int(a.rest[0]), a.rest[1])

elif a.mode == 'stills':
    frames = [int(f) for f in a.rest[0].split(',')]; prefix = a.rest[1]
    outs = []
    for f in frames:
        p = f'{prefix}_f{f:04d}.png'; still(f, p); outs.append(p)
    if shutil.which('ffmpeg') and len(outs) > 1:
        sheet = f'{prefix}_sheet.png'
        args = ['ffmpeg', '-v', 'error', '-y'] + sum([['-i', p] for p in outs], []) + \
               ['-filter_complex', ''.join(f'[{i}]format=rgb24[v{i}];' for i in range(len(outs))) +
                ''.join(f'[v{i}]' for i in range(len(outs))) + f'hstack={len(outs)}', sheet]
        subprocess.run(args, check=False); print(f'SHEET {os.path.abspath(sheet)}')

elif a.mode == 'range':
    s, e, outdir = int(a.rest[0]), int(a.rest[1]), a.rest[2]
    sc.frame_start, sc.frame_end = s, e
    sc.render.filepath = outdir.rstrip('/') + '/f_####'
    sc.render.image_settings.color_depth = '8'
    bpy.ops.render.render(animation=True)

elif a.mode == 'inframe':
    frames = [int(f) for f in (a.rest[0].split(',') if a.rest else [sc.frame_start])]
    for f in frames:
        sc.frame_set(f); cam = sc.camera
        print(f'--- frame {f} camera {cam.name}')
        for o in tops():
            pts = world_bbox(o)
            if not pts: continue
            ndc = [world_to_camera_view(sc, cam, p) for p in pts]
            front = [n for n in ndc if n.z > 0]
            if not front:
                print(f'{o.name:28s} BEHIND'); continue
            xs = [n.x for n in front]; ys = [n.y for n in front]
            behind = len(front) < len(ndc)
            overlaps = max(xs) >= 0 and min(xs) <= 1 and max(ys) >= 0 and min(ys) <= 1
            if all(0 <= x <= 1 for x in xs) and all(0 <= y <= 1 for y in ys) and not behind: state = 'IN'
            elif overlaps or behind: state = 'PARTIAL'
            else: state = 'OUT'
            print(f'{o.name:28s} {state:8s} x[{min(xs):.2f},{max(xs):.2f}] y[{min(ys):.2f},{max(ys):.2f}] '
                  f'nearest {min(n.z for n in front):.2f}m{"  (extends behind camera)" if behind else ""}')

elif a.mode == 'witness':
    out = a.rest[0]
    if a.frame: sc.frame_set(a.frame)
    pts = []
    for o in tops():   # frame the set itself, not huge backdrops (city cards, sky cards, floors)
        b = world_bbox(o)
        if b and (max(p.x for p in b) - min(p.x for p in b)) < 4 and (max(p.y for p in b) - min(p.y for p in b)) < 4:
            pts += b
    sc.view_settings.exposure += 2.5   # night scenes are unreadable from outside the key light
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centre = (lo + hi) / 2; span = max((hi - lo).length, 0.5)
    pos = Vector([float(v) for v in a.from_.split(',')]) if a.from_ else centre + Vector((0.6, -1.0, 0.7)).normalized() * span * 0.9
    cd = bpy.data.cameras.new('witness'); wc = bpy.data.objects.new('witness', cd); sc.collection.objects.link(wc)
    cd.lens = 18; wc.location = pos
    wc.rotation_euler = (centre - pos).to_track_quat('-Z', 'Y').to_euler()
    for o in sc.objects:   # hide only the ceiling so we can see in from above
        if o.name.startswith('ceiling'): o.hide_render = True
    for mk in list(sc.timeline_markers): sc.timeline_markers.remove(mk)
    sc.camera = wc; still(sc.frame_current, out)

elif a.mode == 'inspect':
    flt = a.rest[0].lower() if a.rest else ''
    for o in sorted(sc.objects, key=lambda o: o.name):
        if flt and flt not in o.name.lower(): continue
        if o.name.startswith('dust'): continue
        if o.type == 'LIGHT':
            print(f'LIGHT {o.name:24s} {o.data.type:5s} {o.data.energy:7.1f}W at {tuple(round(v, 3) for v in o.matrix_world.translation)}')
            continue
        pts = world_bbox(o) if o.type in ('MESH', 'CURVE', 'EMPTY') else []
        mats = sorted({ms.material.name for ms in getattr(o, 'material_slots', []) if ms.material})
        par = f' parent={o.parent.name}' if o.parent else ''
        if pts:
            lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
            hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
            print(f'{o.type:6s} {o.name:28s} min{tuple(round(v, 3) for v in lo)} max{tuple(round(v, 3) for v in hi)} '
                  f'size{tuple(round(v, 3) for v in hi - lo)}{par} mats={mats}')
        else:
            print(f'{o.type:6s} {o.name:28s}{par}')

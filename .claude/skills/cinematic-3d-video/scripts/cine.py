"""cine.py - helper library for building photoreal, cinematic Blender (Cycles) scenes from Python.

Import it from a scene script that Blender runs headless:

    import os, sys
    sys.path.insert(0, os.environ['CINE_LIB'])     # .../cinematic-3d-video/scripts
    import cine as C
    C.reset(seed=7)
    ...build...
    C.save()                                         # writes the path given after `--`, else ./scene.blend

Every helper returns the created object/material so you can tweak it further with plain bpy.
Units are metres, Z is up. Tested on Blender 4.2 LTS.
"""
import bpy, bmesh, math, random, os, sys
from mathutils import Vector

sc = None  # the active scene, set by reset()


# ------------------------------------------------------------------ scene
def reset(seed=7):
    """Empty the file and seed the RNG (seeding keeps renders identical across machines)."""
    global sc
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    random.seed(seed)
    return sc


def look_at(obj, target):
    """Rotate obj so its -Z axis (lights, cameras) points at target."""
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


# ------------------------------------------------------------------ materials
def mat(name, color=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, **principled):
    """Principled BSDF material. Extra kwargs map to Principled input names, e.g.
    mat('mug', (0.1,0.1,0.1), 0.15, **{'Coat Weight': 0.8})."""
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for k, v in principled.items():
        b.inputs[k].default_value = v
    return m


def _bsdf(m):
    return m.node_tree.nodes['Principled BSDF']


def add_wear(m, base_color, rough, grime=0.12, micro_bump=0.04, scale=6.0):
    """Break up a flat material: large-scale colour variation (grime/yellowing), roughness
    variation (fingerprints) and a micro 'orange-peel' bump. Uniform surfaces are the #1 CG tell."""
    n = m.node_tree.nodes; l = m.node_tree.links; b = _bsdf(m)
    tc = n.new('ShaderNodeTexCoord')
    nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = 6
    l.new(tc.outputs['Object'], nz.inputs['Vector'])
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*[c * (1 - grime) for c in base_color], 1)
    ramp.color_ramp.elements[1].color = (*base_color, 1)
    l.new(nz.outputs['Fac'], ramp.inputs['Fac']); l.new(ramp.outputs['Color'], b.inputs['Base Color'])
    nz2 = n.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 900; nz2.inputs['Detail'].default_value = 2
    l.new(tc.outputs['Object'], nz2.inputs['Vector'])
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = micro_bump; bp.inputs['Distance'].default_value = 0.0005
    l.new(nz2.outputs['Fac'], bp.inputs['Height']); l.new(bp.outputs['Normal'], b.inputs['Normal'])
    nz3 = n.new('ShaderNodeTexNoise'); nz3.inputs['Scale'].default_value = 25
    l.new(tc.outputs['Object'], nz3.inputs['Vector'])
    mr = n.new('ShaderNodeMapRange')
    mr.inputs['To Min'].default_value = max(0.0, rough - 0.1); mr.inputs['To Max'].default_value = min(1.0, rough + 0.12)
    l.new(nz3.outputs['Fac'], mr.inputs['Value']); l.new(mr.outputs['Result'], b.inputs['Roughness'])
    return m


def plastic(name, color, rough=0.42, grime=0.12):
    """Aged ABS / painted plastic with slight subsurface and a thin clear-coat."""
    m = mat(name, color, rough, **{'Subsurface Weight': 0.08, 'Subsurface Radius': Vector((0.02, 0.015, 0.01)),
                                   'Specular IOR Level': 0.45, 'Coat Weight': 0.08, 'Coat Roughness': 0.25})
    return add_wear(m, color, rough, grime)


def metal(name, color=(0.8, 0.8, 0.8), rough=0.25, grime=0.08):
    m = mat(name, color, rough, 1.0)
    return add_wear(m, color, rough, grime, micro_bump=0.02, scale=12)


def glass(name, tint=(1, 1, 1), rough=0.02):
    """Solid refractive glass (bottles, lenses, paperweights). NOT for window panes - see thin_glass."""
    return mat(name, tint, rough, **{'Transmission Weight': 1.0, 'IOR': 1.5})


def thin_glass(name, rough=0.01, ior=1.35):
    """Window pane / picture-frame glass: transparent + Fresnel-weighted gloss. No refraction and
    shadow rays pass straight through, so lights and city cards outside the window still reach the
    room. (A solidified refractive pane blocks them and renders black or blown-out.)"""
    m = bpy.data.materials.new(name); m.use_nodes = True; n = m.node_tree.nodes; l = m.node_tree.links
    n.remove(n['Principled BSDF']); out = n['Material Output']
    tr = n.new('ShaderNodeBsdfTransparent'); gl = n.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = rough
    fr = n.new('ShaderNodeFresnel'); fr.inputs['IOR'].default_value = ior; mx = n.new('ShaderNodeMixShader')
    l.new(fr.outputs[0], mx.inputs[0]); l.new(tr.outputs[0], mx.inputs[1]); l.new(gl.outputs[0], mx.inputs[2])
    l.new(mx.outputs[0], out.inputs['Surface'])
    return m


def pbr(name, folder, scale=1.0, rot=0.0, bump=0.3, rough_mul=1.0, tint=None, **principled):
    """Image-based PBR material from a folder holding Diffuse.jpg / nor_gl.jpg / Rough.jpg
    (the layout scripts/polyhaven.py writes). Uses OBJECT coords + BOX projection, so it never
    stretches on scaled cubes the way default UVs do. `scale` = repeats per metre."""
    m = mat(name, **principled)
    n = m.node_tree.nodes; l = m.node_tree.links; b = _bsdf(m)
    tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale, scale, scale)
    mp.inputs['Rotation'].default_value = (0, 0, rot)
    l.new(tc.outputs['Object'], mp.inputs['Vector'])

    def img(fn, noncolor=False):
        t = n.new('ShaderNodeTexImage')
        t.image = bpy.data.images.load(os.path.join(folder, fn), check_existing=True)
        t.projection = 'BOX'; t.projection_blend = 0.15
        if noncolor: t.image.colorspace_settings.name = 'Non-Color'
        l.new(mp.outputs['Vector'], t.inputs['Vector']); return t

    d = img('Diffuse.jpg')
    if tint:
        mx = n.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'
        mx.inputs['Factor'].default_value = 1.0; mx.inputs[7].default_value = (*tint, 1)
        l.new(d.outputs['Color'], mx.inputs[6]); l.new(mx.outputs[2], b.inputs['Base Color'])
    else:
        l.new(d.outputs['Color'], b.inputs['Base Color'])
    if os.path.exists(os.path.join(folder, 'Rough.jpg')):
        r = img('Rough.jpg', True)
        mm = n.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = rough_mul
        l.new(r.outputs['Color'], mm.inputs[0]); l.new(mm.outputs[0], b.inputs['Roughness'])
    if os.path.exists(os.path.join(folder, 'nor_gl.jpg')):
        nr = img('nor_gl.jpg', True); nm = n.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = bump
        l.new(nr.outputs['Color'], nm.inputs['Color']); l.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m


def image_mat(name, path, rough=0.7, emission=0.0, coat=0.0):
    """Material driven by an image on the object's UVs (posters, labels, screens, book covers).
    emission > 0 makes it glow (screens); coat adds a glossy glass layer on top."""
    m = mat(name, (0.01, 0.01, 0.01) if emission else (0.8, 0.8, 0.8), rough,
            **({'Coat Weight': coat, 'Coat Roughness': 0.03} if coat else {}))
    n = m.node_tree.nodes; l = m.node_tree.links; b = _bsdf(m)
    t = n.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(path, check_existing=True)
    uv = n.new('ShaderNodeTexCoord'); l.new(uv.outputs['UV'], t.inputs['Vector'])
    if emission:
        l.new(t.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emission
    else:
        l.new(t.outputs['Color'], b.inputs['Base Color'])
    return m


def screen_mat(name, path, strength=0.9):
    """Emissive display behind a glossy glass coat. 0.6-1.2 keeps it readable without blowing out."""
    return image_mat(name, path, rough=0.08, emission=strength, coat=1.0)


def emission_mat(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True
    em = m.node_tree.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1); em.inputs['Strength'].default_value = strength
    m.node_tree.links.new(em.outputs[0], m.node_tree.nodes['Material Output'].inputs['Surface'])
    return m


# ------------------------------------------------------------------ geometry
def _smooth_bevel(o, bevel, seg):
    md = o.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = seg; md.limit_method = 'ANGLE'
    for p in o.data.polygons: p.use_smooth = True
    wn = o.modifiers.new('wn', 'WEIGHTED_NORMAL'); wn.keep_sharp = True


def box(name, size, loc, m=None, bevel=0.0, seg=3, rot=(0, 0, 0)):
    """Cube of `size` (x,y,z metres) centred at loc. bevel>0 rounds the edges - real objects never
    have perfectly sharp edges, and the bevel catches highlights, which is what sells scale."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    o.scale = size; bpy.ops.object.transform_apply(scale=True)
    if bevel > 0: _smooth_bevel(o, bevel, seg)
    if m: o.data.materials.append(m)
    return o


def tapered_box(name, front_wh, back_wh, depth, loc, m=None, back_dz=0.0, bevel=0.02, seg=5):
    """Box whose back face is smaller than its front (CRT housings, TVs, speakers, lamp heads).
    Front face sits at local y=0 facing -Y; back face at y=+depth, shifted by back_dz in Z."""
    fw, fh = front_wh; bw, bh = back_wh
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    fr = [(-fw/2, 0, -fh/2), (fw/2, 0, -fh/2), (fw/2, 0, fh/2), (-fw/2, 0, fh/2)]
    bk = [(-bw/2, depth, -bh/2 + back_dz), (bw/2, depth, -bh/2 + back_dz), (bw/2, depth, bh/2 + back_dz), (-bw/2, depth, bh/2 + back_dz)]
    vs = [bm.verts.new(v) for v in fr + bk]
    for f in [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]:
        bm.faces.new([vs[i] for i in f])
    bm.normal_update(); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = loc
    if bevel > 0: _smooth_bevel(o, bevel, seg)
    if m: o.data.materials.append(m)
    return o


def panel(name, size, loc, rot=(math.radians(90), 0, 0), m=None, bulge=0.0, curl=0.0, res=40):
    """Subdivided plane (keeps UVs 0-1 for image_mat). bulge = CRT/lens dome height,
    curl = paper/sticky-note lift along local Y. Default rot stands it upright facing -Y."""
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=res, y_subdivisions=res, size=1)
    o = bpy.context.object; o.name = name
    o.scale = (size[0], size[1], 1); bpy.ops.object.transform_apply(scale=True)
    hx, hy = size[0] / 2, size[1] / 2
    for v in o.data.vertices:
        z = 0.0
        if bulge: z += bulge * (1 - (v.co.x / hx) ** 2) * (1 - (v.co.y / hy) ** 2)
        if curl: z += curl * ((v.co.y + hy) / (2 * hy)) ** 2
        v.co.z = z
    o.rotation_euler = rot; o.location = loc
    for p in o.data.polygons: p.use_smooth = True
    if m: o.data.materials.append(m)
    return o


def cylinder(name, radius, height, loc, m=None, verts=48, bevel=0.002, hollow=0.0):
    """Upright cylinder sitting on loc (loc = centre of its base). hollow>0 = open-top cup with that wall thickness."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=height,
                                        location=(loc[0], loc[1], loc[2] + height / 2))
    o = bpy.context.object; o.name = name
    if hollow:
        bm = bmesh.new(); bm.from_mesh(o.data)
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.z > 0.9], context='FACES')
        bm.to_mesh(o.data); bm.free()
        s = o.modifiers.new('sol', 'SOLIDIFY'); s.thickness = hollow
    if bevel: _smooth_bevel(o, bevel, 2)
    else:
        for p in o.data.polygons: p.use_smooth = True
    if m: o.data.materials.append(m)
    return o


def mug(loc, radius=0.042, height=0.1, m=None):
    body = cylinder('mug', radius, height, loc, m, hollow=0.004)
    bpy.ops.mesh.primitive_torus_add(major_radius=height * 0.26, minor_radius=height * 0.06,
                                     location=(loc[0] + radius + 0.005, loc[1], loc[2] + height * 0.52),
                                     rotation=(math.radians(90), 0, 0))
    h = bpy.context.object; h.name = 'mug_handle'
    for p in h.data.polygons: p.use_smooth = True
    if m: h.data.materials.append(m)
    return body


def cable(points, radius=0.0025, m=None, name='cable'):
    """Bezier tube through `points` - cables make tech scenes feel lived-in."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 4
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(points) - 1)
    for p, co in zip(sp.bezier_points, points):
        p.co = co; p.handle_left_type = p.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o)
    if m: cu.materials.append(m)
    return o


def instances(mesh_obj, transforms, name='inst', material_overrides=None):
    """Linked duplicates of one mesh (keys, books, tiles). transforms = [(loc, rot_euler), ...].
    material_overrides = {index: material} to vary some copies. Removes the source object."""
    me = mesh_obj.data; bpy.data.objects.remove(mesh_obj)
    out = []
    for i, (loc, rot) in enumerate(transforms):
        o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
        o.location = loc; o.rotation_euler = rot
        if material_overrides and i in material_overrides:
            o.material_slots[0].link = 'OBJECT'; o.material_slots[0].material = material_overrides[i]
        out.append(o)
    return out


def import_asset(path, loc, rot_z=0.0, scale=1.0, name=None, only=None, recenter=False):
    """Import a glTF/GLB (e.g. from scripts/polyhaven.py) under one empty you can move/scale.
    only = list of top-level object names to keep (some scans ship several variants side by side;
    run `render.py -- inspect` to see their names). recenter = move kept parts to the empty's origin
    in XY (useful after dropping a variant that sat off-centre)."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    if only:
        keep = set()
        for o in new:
            top = o
            while top.parent is not None: top = top.parent
            if top.name in only: keep.add(o)
        for o in [o for o in new if o not in keep]: bpy.data.objects.remove(o)
        new = [o for o in new if o in keep]
    root = bpy.data.objects.new(name or os.path.splitext(os.path.basename(path))[0], None)
    sc.collection.objects.link(root)
    for o in new:
        if o.parent is None: o.parent = root
    if recenter and new:
        bpy.context.view_layer.update()
        lo, hi = bbox(root)
        cx, cy = (lo.x + hi.x) / 2, (lo.y + hi.y) / 2
        for o in new:
            if o.parent is root: o.location.x -= cx; o.location.y -= cy
    root.location = loc; root.rotation_euler = (0, 0, rot_z); root.scale = (scale,) * 3
    bpy.context.view_layer.update()
    return root


def bbox(obj):
    """World-space (min, max) Vectors over obj and all its mesh descendants."""
    bpy.context.view_layer.update()
    pts = []
    for o in [obj] + list(obj.children_recursive):
        if o.type == 'MESH':
            pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
    if not pts: return obj.matrix_world.translation.copy(), obj.matrix_world.translation.copy()
    return (Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))),
            Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts))))


def recolor(obj, saturation=1.0, value=1.0, hue=0.5, skip=('light', 'emiss', 'bulb', 'glass')):
    """Repaint an imported scan by inserting a Hue/Saturation node before Base Color on every
    material under obj (e.g. orange lamp -> matte black: saturation=0.15, value=0.22).
    Materials whose name contains a `skip` word are left alone. Shared materials change everywhere."""
    done = set()
    for o in [obj] + list(obj.children_recursive):
        for ms in getattr(o, 'material_slots', []):
            m = ms.material
            if not m or m.name in done or not m.use_nodes or any(w in m.name.lower() for w in skip): continue
            done.add(m.name); nt = m.node_tree; b = nt.nodes.get('Principled BSDF')
            if not b: continue
            hs = nt.nodes.new('ShaderNodeHueSaturation')
            hs.inputs['Hue'].default_value = hue; hs.inputs['Saturation'].default_value = saturation; hs.inputs['Value'].default_value = value
            link = next((l for l in nt.links if l.to_socket == b.inputs['Base Color']), None)
            if link:
                nt.links.new(link.from_socket, hs.inputs['Color'])
            else:
                hs.inputs['Color'].default_value = b.inputs['Base Color'].default_value
            nt.links.new(hs.outputs['Color'], b.inputs['Base Color'])
    return obj


# ------------------------------------------------------------------ environment
def room(wall_m, floor_m, size=(8, 8, 3), window=None, thickness=0.12):
    """Closed box room so light only enters where you let it. Centred on the origin in XY,
    floor at z=0. window = dict(side='left'|'right'|'back', at=-1.5, span=(-0.9,0.9), z=(0.95,2.25))
    (`at` = the wall's x for left/right, y for back; span = opening along the wall; z = sill/head height)
    cuts an opening in that wall. Returns dict with the window's plane coordinate for blinds()/sky_card()."""
    W, D, H = size
    box('floor', (W, D, 0.02), (0, 0, -0.01), floor_m)
    box('ceiling', (W, D, 0.1), (0, 0, H), wall_m)
    win = window or {}
    side = win.get('side')

    def wall_with_hole(axis, coord, length):
        s0, s1 = win['span']; z0, z1 = win['z']
        if axis == 'x':   # wall plane at x=coord, extends along Y
            box('wall_lo', (thickness, length, z0), (coord, 0, z0 / 2), wall_m)
            box('wall_hi', (thickness, length, H - z1), (coord, 0, (H + z1) / 2), wall_m)
            box('wall_a', (thickness, length / 2 + s0, z1 - z0), (coord, (-length / 2 + s0) / 2, (z0 + z1) / 2), wall_m)
            box('wall_b', (thickness, length / 2 - s1, z1 - z0), (coord, (length / 2 + s1) / 2, (z0 + z1) / 2), wall_m)
        else:             # wall plane at y=coord, extends along X
            box('wall_lo', (length, thickness, z0), (0, coord, z0 / 2), wall_m)
            box('wall_hi', (length, thickness, H - z1), (0, coord, (H + z1) / 2), wall_m)
            box('wall_a', (length / 2 + s0, thickness, z1 - z0), ((-length / 2 + s0) / 2, coord, (z0 + z1) / 2), wall_m)
            box('wall_b', (length / 2 - s1, thickness, z1 - z0), ((length / 2 + s1) / 2, coord, (z0 + z1) / 2), wall_m)

    back_y = win.get('back_y', 1.15); right_x = win.get('right_x', 2.2); front_y = win.get('front_y', -3.5); left_x = win.get('left_x', -2.2)
    at = win.get('at', win.get('x_or_y'))
    if side == 'left': left_x = at
    if side == 'right': right_x = at
    if side == 'back': back_y = at
    for nm, axis, coord, length in [('left', 'x', left_x, D), ('right', 'x', right_x, D), ('back', 'y', back_y, W), ('front', 'y', front_y, W)]:
        if nm == side: wall_with_hole(axis, coord, length)
        else: box('wall_' + nm, (thickness, length, H) if axis == 'x' else (length, thickness, H),
                  (coord, 0, H / 2) if axis == 'x' else (0, coord, H / 2), wall_m)
    return dict(back_y=back_y, left_x=left_x, right_x=right_x, front_y=front_y, height=H)


def blinds(plane_coord, span, z, m, side='left', spacing=0.085, slat_w=0.07, tilt_deg=-16, inset=0.1):
    """Venetian blind slats inside a window opening -> crisp striped light (the 'gobo' look).
    spacing/slat_w control stripe width; tilt controls the light/shadow ratio (try -10..-25)."""
    s0, s1 = span; z0, z1 = z; L = s1 - s0
    zz = z0 + 0.02; n = 0
    while zz < z1 - 0.02:
        if side in ('left', 'right'):
            sgn = 1 if side == 'left' else -1
            box('slat', (slat_w, L, 0.003), (plane_coord + sgn * inset, (s0 + s1) / 2, zz), m, rot=(0, math.radians(tilt_deg) * sgn, 0))
        else:
            box('slat', (L, slat_w, 0.003), ((s0 + s1) / 2, plane_coord - inset, zz), m, rot=(math.radians(-tilt_deg), 0, 0))
        zz += spacing; n += 1
    return n


def sky_card(loc, rot, scale, color=(1.0, 0.7, 0.45), strength=3.0):
    """Emissive card outside a window: gives the glass/blinds something bright to show and adds soft bounce."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = 'sky_card'; o.scale = (*scale, 1)
    o.data.materials.append(emission_mat('sky', color, strength)); o.visible_shadow = False
    return o


def world(color=(0.010, 0.0075, 0.005), strength=1.0, hdri=None, hdri_rot=0.0):
    """Ambient world. Keep it near-black for moody interiors - darkness is what makes light read."""
    w = bpy.data.worlds.new('world'); sc.world = w; w.use_nodes = True
    n = w.node_tree.nodes; l = w.node_tree.links; bg = n['Background']
    bg.inputs['Strength'].default_value = strength
    if hdri:
        tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, 0, hdri_rot)
        env = n.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(hdri)
        l.new(tc.outputs['Generated'], mp.inputs['Vector']); l.new(mp.outputs['Vector'], env.inputs['Vector'])
        l.new(env.outputs['Color'], bg.inputs['Color'])
    else:
        bg.inputs['Color'].default_value = (*color, 1)
    return w


def sun(direction, energy=12.0, color=(1.0, 0.62, 0.30), angle_deg=0.9):
    """direction = vector the light travels. Small angle = crisp shadows (late sun ~0.5-1.5 deg)."""
    bpy.ops.object.light_add(type='SUN', location=(0, 0, 5))
    o = bpy.context.object; o.name = 'sun'
    o.rotation_euler = Vector(direction).normalized().to_track_quat('-Z', 'Y').to_euler()
    o.data.energy = energy; o.data.angle = math.radians(angle_deg); o.data.color = color
    return o


def area(loc, target, energy, size=0.8, color=(1, 1, 1), shape='DISK', name='area', spread_deg=None, reflect=True):
    """Soft source. size = float, or (x, y) for RECTANGLE/ELLIPSE (auto-switches a DISK to ELLIPSE).
    reflect=False hides it from glossy rays - use for unmotivated fills/kickers so they don't show up
    as a softbox blotch in glass, screens or varnish."""
    bpy.ops.object.light_add(type='AREA', location=loc)
    o = bpy.context.object; o.name = name
    if isinstance(size, (tuple, list)):
        o.data.shape = {'DISK': 'ELLIPSE', 'SQUARE': 'RECTANGLE'}.get(shape, shape)
        o.data.size, o.data.size_y = size
    else:
        o.data.shape = shape; o.data.size = size
    o.data.energy = energy; o.data.color = color
    if spread_deg: o.data.spread = math.radians(spread_deg)
    o.visible_glossy = reflect
    look_at(o, target); return o


def spot(loc, target, energy, color=(1, 0.8, 0.6), cone_deg=45, blend=0.4, radius=0.02, name='spot', reflect=True):
    """Practical lamp / key spot. radius controls shadow softness. Energy scales with distance squared:
    a desk lamp ~0.5 m from the subject wants ~40-60 W, ~0.9 m wants ~130-180 W (see lighting.md).
    If it sits inside a lamp shade with a bulb mesh, use practical_bulb() (shadow-transparent) or place
    the spot just past the bulb along the shade axis."""
    bpy.ops.object.light_add(type='SPOT', location=loc)
    o = bpy.context.object; o.name = name
    o.data.energy = energy; o.data.color = color; o.data.spot_size = math.radians(cone_deg)
    o.data.spot_blend = blend; o.data.shadow_soft_size = radius
    o.visible_glossy = reflect
    look_at(o, target); return o


def point(loc, energy, color=(1, 0.75, 0.5), radius=0.03, name='point', reflect=True):
    bpy.ops.object.light_add(type='POINT', location=loc)
    o = bpy.context.object; o.name = name
    o.data.energy = energy; o.data.color = color; o.data.shadow_soft_size = radius
    o.visible_glossy = reflect
    return o


def practical_bulb(loc, radius=0.02, strength=8.0, color=(1.0, 0.8, 0.55), name='bulb'):
    """Visible glowing bulb that doesn't block the real light placed inside/behind it
    (visible_shadow=False). Strength 5-10 reads as 'on' without clipping the whole shade."""
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=24, ring_count=12)
    o = bpy.context.object; o.name = name
    for p in o.data.polygons: p.use_smooth = True
    o.data.materials.append(emission_mat(name + '_emit', color, strength)); o.visible_shadow = False
    return o


def dust(count, bounds, size=0.0011, drift=0.16, frames=(1, 200), seed=None):
    """Floating dust motes. They're only visible where a hard light hits them, which makes
    light beams read without a (slow, light-killing) volume. bounds = ((x0,x1),(y0,y1),(z0,z1))."""
    rng = random.Random(seed) if seed is not None else random
    m = mat('dust', (1, 0.9, 0.75), 0.6, **{'Transmission Weight': 0.3})
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=size)
    src = bpy.context.object; src.data.materials.append(m); me = src.data; bpy.data.objects.remove(src)
    for _ in range(count):
        o = bpy.data.objects.new('dust', me); sc.collection.objects.link(o)
        p = Vector([rng.uniform(*b) for b in bounds]); o.location = p
        d = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-0.4, 0.6))) * drift
        o.keyframe_insert('location', frame=frames[0]); o.location = p + d; o.keyframe_insert('location', frame=frames[1])
        for fc in o.animation_data.action.fcurves:
            for k in fc.keyframe_points: k.interpolation = 'LINEAR'
        o.visible_shadow = False


# ------------------------------------------------------------------ camera
def camera(name, keys, lens=45, fstop=2.8, handheld=0.003, handheld_scale=60, sensor=36, blades=7, ease='AUTO_CLAMPED'):
    """Camera that looks at a moving target (which is also the focus point, so focus pulls are free).
    keys = [(frame, cam_location, target_location), ...]. Two keys = simple move; add a middle key
    to hold or change pace. handheld = metres of Perlin drift (0.002-0.005 reads as a real operator).
    Returns the camera object; its target is cam['target'].
    9:16 note: with sensor fit AUTO the 36 mm sensor spans the frame's HEIGHT in portrait, so a lens
    looks ~1.8x tighter horizontally than in 16:9 (35 mm portrait ~ 62 mm landscape across)."""
    cd = bpy.data.cameras.new(name); cam = bpy.data.objects.new(name, cd); sc.collection.objects.link(cam)
    cd.lens = lens; cd.sensor_width = sensor
    cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop; cd.dof.aperture_blades = blades
    tgt = bpy.data.objects.new(name + '_target', None); sc.collection.objects.link(tgt)
    cd.dof.focus_object = tgt
    c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    for f, cl, tl in keys:
        cam.location = cl; cam.keyframe_insert('location', frame=f)
        tgt.location = tl; tgt.keyframe_insert('location', frame=f)
    for ob in (cam, tgt):
        for fc in ob.animation_data.action.fcurves:
            for k in fc.keyframe_points:
                k.interpolation = 'BEZIER'; k.handle_left_type = k.handle_right_type = ease
    if handheld:
        for i, fc in enumerate(cam.animation_data.action.fcurves):
            md = fc.modifiers.new('NOISE'); md.scale = handheld_scale; md.strength = handheld; md.phase = i * 13 + len(name)
    cam['target'] = tgt.name
    if sc.camera is None: sc.camera = cam
    return cam


def orbit_camera(name, center, target, frames, angle_deg=(30, -10), radius=(0.45, 0.4), height=(0.12, 0.11),
                 lens=35, fstop=2.8, handheld=0.003, handheld_scale=50):
    """Eased orbit around `center` (x, y, z of the subject's base): the camera swings from
    angle_deg[0] to angle_deg[1] (0 = in front, on -Y; positive = to the right), while radius and
    height (above center z) interpolate - so you get orbit + push-in + crane in one move.
    `target` is the focus/aim point (usually the hero's lens/logo/face)."""
    f0, f1 = frames
    pivot = bpy.data.objects.new(name + '_pivot', None); sc.collection.objects.link(pivot)
    pivot.location = (center[0], center[1], 0)
    cz = center[2]
    cam = camera(name, [(f0, (0, -radius[0], cz + height[0]), target), (f1, (0, -radius[1], cz + height[1]), target)],
                 lens=lens, fstop=fstop, handheld=handheld, handheld_scale=handheld_scale)
    cam.parent = pivot
    for f, a in ((f0, angle_deg[0]), (f1, angle_deg[1])):
        pivot.rotation_euler = (0, 0, math.radians(a)); pivot.keyframe_insert('rotation_euler', frame=f)
    for fc in pivot.animation_data.action.fcurves:
        for k in fc.keyframe_points:
            k.interpolation = 'BEZIER'; k.handle_left_type = k.handle_right_type = 'AUTO_CLAMPED'
    return cam


def cut(frame, cam):
    """Switch to `cam` at `frame` (timeline marker bound to camera)."""
    mk = sc.timeline_markers.new(cam.name, frame=frame); mk.camera = cam
    return mk


# ------------------------------------------------------------------ render + finishing
def render_settings(frames, res=(720, 1280), fps=24, samples=48, adaptive=0.02, look='AgX - Medium High Contrast',
                    exposure=0.0, motion_blur=True, bounces=(6, 3, 3), denoise=True):
    """Cycles CPU-friendly defaults that still look high-end. Clamp + modest bounces keep fireflies
    and render time down; OIDN with albedo/normal keeps textures crisp after denoising."""
    sc.frame_start, sc.frame_end = frames
    sc.render.fps = fps; sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'; cy.samples = samples; cy.use_adaptive_sampling = True; cy.adaptive_threshold = adaptive
    cy.use_denoising = denoise; cy.denoiser = 'OPENIMAGEDENOISE'; cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
    cy.max_bounces, cy.diffuse_bounces, cy.glossy_bounces = bounces
    cy.transmission_bounces = 6; cy.volume_bounces = 1
    cy.sample_clamp_indirect = 4.0; cy.blur_glossy = 1.0
    sc.render.use_persistent_data = True
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.render.use_motion_blur = motion_blur; sc.render.motion_blur_shutter = 0.5
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = look; sc.view_settings.exposure = exposure
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '16'


def compositor(bloom_mix=-0.75, bloom_threshold=0.9, bloom_size=8, distortion=-0.012, dispersion=0.012):
    """Soft fog-glow bloom + slight barrel distortion and chromatic dispersion = 'shot through glass'."""
    sc.use_nodes = True
    n = sc.node_tree.nodes; l = sc.node_tree.links
    rl = n['Render Layers']; comp = n['Composite']
    g = n.new('CompositorNodeGlare'); g.glare_type = 'FOG_GLOW'; g.quality = 'HIGH'
    g.threshold = bloom_threshold; g.size = bloom_size; g.mix = bloom_mix
    ld = n.new('CompositorNodeLensdist'); ld.inputs['Distortion'].default_value = distortion; ld.inputs['Dispersion'].default_value = dispersion
    l.new(rl.outputs['Image'], g.inputs['Image']); l.new(g.outputs['Image'], ld.inputs['Image']); l.new(ld.outputs['Image'], comp.inputs['Image'])


def save(default='scene.blend'):
    out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv and len(sys.argv) > sys.argv.index('--') + 1 else default
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out))
    print('SAVED', os.path.abspath(out))
    return out

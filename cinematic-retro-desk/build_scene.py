"""Builds the 'golden hour retro desk' scene entirely in code. Run: blender -b -P build_scene.py -- out.blend"""
import bpy, bmesh, math, random, os, sys
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, 'assets', *p)
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------------------------------------------------------------- helpers
def mat(name, color=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for k, v in kw.items():
        b.inputs[k].default_value = v
    return m

def box(name, size, loc, m=None, bevel=0.0, seg=3, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    o.scale = size; bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        md = o.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = seg
        md.limit_method = 'ANGLE'; md.harden_normals = False
        bpy.ops.object.shade_smooth()
        wn = o.modifiers.new('wn', 'WEIGHTED_NORMAL'); wn.keep_sharp = True
    if m: o.data.materials.append(m)
    return o

def tex_nodes(m, folder, scale=1.0, rot=0.0, bump=0.3, rough_mul=1.0, tint=None):
    nt = m.node_tree; n = nt.nodes; l = nt.links
    b = n['Principled BSDF']
    tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale, scale, scale)
    mp.inputs['Rotation'].default_value = (0, 0, rot)
    l.new(tc.outputs['Object'], mp.inputs['Vector'])
    def img(fn, nonc=False):
        t = n.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(folder, fn), check_existing=True)
        t.projection = 'BOX'; t.projection_blend = 0.15
        if nonc: t.image.colorspace_settings.name = 'Non-Color'
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
    nr = img('nor_gl.jpg', True); nm = n.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = bump
    l.new(nr.outputs['Color'], nm.inputs['Color']); l.new(nm.outputs['Normal'], b.inputs['Normal'])

def plastic(name, color, rough=0.42, grime=0.12):
    """Aged ABS plastic: subtle micro-texture, yellowing variation, slight SSS."""
    m = mat(name, color, rough, **{'Subsurface Weight': 0.08, 'Subsurface Radius': Vector((0.02, 0.015, 0.01)),
                                   'Specular IOR Level': 0.45, 'Coat Weight': 0.08, 'Coat Roughness': 0.25})
    nt = m.node_tree; n = nt.nodes; l = nt.links; b = n['Principled BSDF']
    tc = n.new('ShaderNodeTexCoord')
    nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 6; nz.inputs['Detail'].default_value = 6
    l.new(tc.outputs['Object'], nz.inputs['Vector'])
    ramp = n.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*[c * (1 - grime) for c in color], 1)
    ramp.color_ramp.elements[1].color = (*color, 1)
    l.new(nz.outputs['Fac'], ramp.inputs['Fac']); l.new(ramp.outputs['Color'], b.inputs['Base Color'])
    # micro orange-peel texture
    nz2 = n.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 900; nz2.inputs['Detail'].default_value = 2
    l.new(tc.outputs['Object'], nz2.inputs['Vector'])
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.04; bp.inputs['Distance'].default_value = 0.0005
    l.new(nz2.outputs['Fac'], bp.inputs['Height']); l.new(bp.outputs['Normal'], b.inputs['Normal'])
    # roughness variation (fingerprints/wear)
    nz3 = n.new('ShaderNodeTexNoise'); nz3.inputs['Scale'].default_value = 25
    l.new(tc.outputs['Object'], nz3.inputs['Vector'])
    mr = n.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = rough - 0.1; mr.inputs['To Max'].default_value = rough + 0.12
    l.new(nz3.outputs['Fac'], mr.inputs['Value']); l.new(mr.outputs['Result'], b.inputs['Roughness'])
    return m

def import_gltf(path, loc, rot_z=0, scale=1.0, name=None):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    root = bpy.data.objects.new(name or os.path.basename(path), None); sc.collection.objects.link(root)
    for o in new:
        if o.parent is None: o.parent = root
    root.location = loc; root.rotation_euler = (0, 0, rot_z); root.scale = (scale,) * 3
    return root

# ---------------------------------------------------------------- materials
BEIGE = (0.70, 0.64, 0.53)
m_case = plastic('case', BEIGE)
m_case_dark = plastic('case_dark', (0.55, 0.48, 0.36), 0.5)
m_key = plastic('keycap', (0.72, 0.66, 0.56), 0.5, 0.08)
m_key_dark = plastic('keycap_dark', (0.50, 0.45, 0.37), 0.5, 0.08)
m_black = mat('black_plastic', (0.02, 0.02, 0.02), 0.55)
m_slot = mat('slot', (0.005, 0.005, 0.005), 0.8)
m_led = mat('led', (0.1, 1, 0.2), 0.3, **{'Emission Color': (0.2, 1.0, 0.3, 1), 'Emission Strength': 8})
m_wall = mat('wall', (0.55, 0.45, 0.36), 0.9); tex_nodes(m_wall, A('tex', 'beige_wall_002'), 1.5, bump=0.5, tint=(0.62, 0.52, 0.42))
m_desk = mat('desk', (0.3, 0.15, 0.07), 0.35, **{'Coat Weight': 0.35, 'Coat Roughness': 0.12})
tex_nodes(m_desk, A('tex', 'black_walnut_veneer_02'), 1.2, rot=0, bump=0.15, rough_mul=0.9, tint=(0.85, 0.62, 0.45))
m_floor = mat('floor', (0.2, 0.1, 0.05), 0.5); tex_nodes(m_floor, A('tex', 'american_walnut_veneer'), 0.6, bump=0.2, tint=(0.4, 0.28, 0.2))
m_blind = mat('blind', (0.75, 0.70, 0.62), 0.5)
m_paper = mat('paper', (0.92, 0.80, 0.35), 0.8, **{'Subsurface Weight': 0.2})
m_mug = mat('mug', (0.08, 0.12, 0.16), 0.15, **{'Coat Weight': 0.8})

# CRT screen: emissive UI behind curved glass
m_screen = bpy.data.materials.new('crt'); m_screen.use_nodes = True
nt = m_screen.node_tree; n = nt.nodes; l = nt.links; b = n['Principled BSDF']
t = n.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(A('screen_ui.png'))
uv = n.new('ShaderNodeTexCoord'); l.new(uv.outputs['UV'], t.inputs['Vector'])
b.inputs['Base Color'].default_value = (0.01, 0.012, 0.012, 1)
b.inputs['Roughness'].default_value = 0.08
b.inputs['Coat Weight'].default_value = 1.0
b.inputs['Coat Roughness'].default_value = 0.03
l.new(t.outputs['Color'], b.inputs['Emission Color'])
b.inputs['Emission Strength'].default_value = 0.9

# ---------------------------------------------------------------- room
DESK_Z = 0.74
box('floor', (8, 8, 0.02), (0, 0, -0.01), m_floor)
box('back_wall', (8, 0.1, 4), (0, 1.15, 2), m_wall)
box('right_wall', (0.1, 8, 4), (2.2, 0, 2), m_wall)
box('ceiling', (8, 8, 0.1), (0, 0, 3.0), m_wall)
box('front_wall', (8, 0.1, 4), (0, -3.5, 2), m_wall)
# left wall with window opening (x = -1.5), window y:-0.9..0.9  z:0.95..2.25
WX = -1.5; wy0, wy1, wz0, wz1 = -0.9, 0.9, 0.95, 2.25
box('lw_a', (0.12, 8, wz0), (WX, 0, wz0 / 2), m_wall)
box('lw_b', (0.12, 8, 3 - wz1), (WX, 0, (3 + wz1) / 2), m_wall)
box('lw_c', (0.12, 4 + wy0 + 0, wz1 - wz0), (WX, (-4 + wy0) / 2, (wz0 + wz1) / 2), m_wall)
box('lw_d', (0.12, 4 - wy1, wz1 - wz0), (WX, (4 + wy1) / 2, (wz0 + wz1) / 2), m_wall)
# venetian blinds: tilted slats inside the opening
SL = 0.085
z = wz0 + 0.02
while z < wz1 - 0.02:
    box('slat', (0.07, wy1 - wy0, 0.003), (WX + 0.1, 0, z), m_blind, rot=(0, math.radians(-16), 0))
    z += SL
# string ladders
for yy in (-0.55, 0.0, 0.55):
    box('cord', (0.003, 0.003, wz1 - wz0), (WX + 0.1, yy, (wz0 + wz1) / 2), m_blind)

# ---------------------------------------------------------------- desk
box('desk_top', (2.6, 0.95, 0.045), (0, 0.45, DESK_Z - 0.0225), m_desk, bevel=0.006)
box('desk_apron', (2.5, 0.03, 0.12), (0, 0.0, DESK_Z - 0.1), m_desk, bevel=0.003)
for x in (-1.2, 1.2):
    box('leg', (0.06, 0.06, DESK_Z - 0.045), (x, 0.05, (DESK_Z - 0.045) / 2), m_desk, bevel=0.004)

# ---------------------------------------------------------------- computer (generic beige 90s desktop + CRT)
CX, CY = 0.05, 0.55
base_h = 0.12
case = box('cpu_case', (0.44, 0.40, base_h), (CX, CY, DESK_Z + base_h / 2 + 0.006), m_case, bevel=0.012, seg=4)
for fx in (-0.18, 0.18):
    for fy in (-0.17, 0.17):
        box('foot', (0.03, 0.03, 0.006), (CX + fx, CY + fy, DESK_Z + 0.003), m_black)
fz = DESK_Z + 0.006
box('cpu_front_groove', (0.44, 0.004, 0.003), (CX, CY - 0.2005, fz + 0.035), m_case_dark)
box('floppy_bezel', (0.14, 0.006, 0.03), (CX + 0.09, CY - 0.201, fz + 0.07), m_case_dark, bevel=0.003)
box('floppy_slot', (0.1, 0.006, 0.006), (CX + 0.09, CY - 0.2035, fz + 0.072), m_slot)
box('floppy_btn', (0.018, 0.006, 0.008), (CX + 0.135, CY - 0.204, fz + 0.062), m_case, bevel=0.002)
box('power_btn', (0.03, 0.008, 0.018), (CX - 0.17, CY - 0.202, fz + 0.065), m_case, bevel=0.003)
box('led', (0.006, 0.004, 0.004), (CX - 0.13, CY - 0.2025, fz + 0.075), m_led)
for i in range(9):  # front vents
    box('vent', (0.004, 0.004, 0.05), (CX - 0.06 + i * 0.012, CY - 0.2015, fz + 0.06), m_case_dark)
# CRT monitor sitting on the case
MZ = fz + base_h + 0.004
mw, mh, md = 0.40, 0.35, 0.10
mon = box('mon_front', (mw, md, mh), (CX, CY - 0.10, MZ + 0.02 + mh / 2), m_case, bevel=0.018, seg=5)
# tapered rear housing
rm = bpy.data.meshes.new('mon_rear'); bm = bmesh.new()
mcz = MZ + 0.02 + mh / 2
fr = [(-mw/2+0.01, -0.05, -mh/2+0.01), (mw/2-0.01, -0.05, -mh/2+0.01), (mw/2-0.01, -0.05, mh/2-0.01), (-mw/2+0.01, -0.05, mh/2-0.01)]
bk = [(-0.12, 0.26, -mh/2+0.02), (0.12, 0.26, -mh/2+0.02), (0.12, 0.26, 0.07), (-0.12, 0.26, 0.07)]
vs = [bm.verts.new(v) for v in fr + bk]
for f in [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]: bm.faces.new([vs[i] for i in f])
bm.normal_update(); bm.to_mesh(rm); bm.free()
rear = bpy.data.objects.new('mon_rear', rm); sc.collection.objects.link(rear); rear.location = (CX, CY - 0.10, mcz)
md_ = rear.modifiers.new('bev', 'BEVEL'); md_.width = 0.025; md_.segments = 5; md_.limit_method = 'ANGLE'
for p_ in rm.polygons: p_.use_smooth = True
rear.modifiers.new('wn', 'WEIGHTED_NORMAL'); rear.data.materials.append(m_case)
for i in range(7):  # rear vents
    box('rvent', (0.16, 0.004, 0.006), (CX, CY + 0.05 + i * 0.022, mcz + 0.14 - i * 0.012), m_case_dark, rot=(math.radians(-30), 0, 0))
# swivel stand
box('mon_stand', (0.24, 0.20, 0.03), (CX, CY + 0.0, MZ + 0.015), m_case_dark, bevel=0.008)
# recessed bezel + curved screen
box('bezel_inner', (0.335, 0.01, 0.27), (CX, CY - 0.148, MZ + 0.02 + mh / 2 + 0.018), m_case_dark, bevel=0.01)
bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=1)
scr = bpy.context.object; scr.name = 'crt_glass'
scr.scale = (0.305, 0.235, 1); bpy.ops.object.transform_apply(scale=True)
for v in scr.data.vertices:  # spherical bulge
    v.co.z = 0.012 * (1 - (v.co.x / 0.16) ** 2) * (1 - (v.co.y / 0.125) ** 2)
scr.rotation_euler = (math.radians(90), 0, 0)
scr.location = (CX, CY - 0.155, MZ + 0.02 + mh / 2 + 0.018)
bpy.ops.object.shade_smooth()
scr.data.uv_layers.active  # grid has UVs already
scr.data.materials.append(m_screen)
# monitor badge + controls
box('badge', (0.05, 0.003, 0.012), (CX - 0.13, CY - 0.1515, MZ + 0.045), m_case_dark, bevel=0.001)
for i in range(4):
    box('knob', (0.012, 0.006, 0.008), (CX + 0.07 + i * 0.022, CY - 0.152, MZ + 0.045), m_case_dark, bevel=0.002)
# sticky note on the monitor corner (curled slightly)
bpy.ops.mesh.primitive_grid_add(x_subdivisions=10, y_subdivisions=10, size=0.05)
note = bpy.context.object; note.name = 'sticky'
for v in note.data.vertices: v.co.z = -0.004 * ((v.co.y + 0.025) / 0.05) ** 2
note.rotation_euler = (math.radians(90), math.radians(-6), 0)
note.location = (CX + 0.165, CY - 0.1535, MZ + 0.02 + mh - 0.032)
note.data.materials.append(m_paper); bpy.ops.object.shade_smooth()

# ---------------------------------------------------------------- keyboard
KX, KY = CX + 0.0, CY - 0.40
kb = box('kb_base', (0.46, 0.17, 0.022), (KX, KY, DESK_Z + 0.011), m_case, bevel=0.007, rot=(math.radians(4), 0, 0))
bpy.ops.mesh.primitive_cube_add(size=1)
cap = bpy.context.object; cap.name = 'keycap_src'
bm = bmesh.new(); bm.from_mesh(cap.data)
for v in bm.verts:
    if v.co.z > 0: v.co.x *= 0.78; v.co.y *= 0.78  # tapered top
bm.to_mesh(cap.data); bm.free()
cap.scale = (0.0165, 0.0165, 0.010); bpy.ops.object.transform_apply(scale=True)
mdc = cap.modifiers.new('bev', 'BEVEL'); mdc.width = 0.0022; mdc.segments = 3
bpy.ops.object.shade_smooth()
cap_mesh = cap.data; cap_mesh.materials.append(m_key); bpy.data.objects.remove(cap)
pitch = 0.0195
rows = [(15, 0), (14, 0.5), (14, 0.7), (13, 1.0), (12, 1.3)]
for r, (count, off) in enumerate(rows):
    for c in range(count):
        o = bpy.data.objects.new('key', cap_mesh); sc.collection.objects.link(o)
        x = KX - 0.215 + (c + off * 0.5) * pitch
        y = KY + 0.055 - r * pitch
        o.location = (x, y, DESK_Z + 0.025 + (0.055 - r * pitch) * 0.07 + random.uniform(-0.0004, 0.0004))
        o.rotation_euler = (math.radians(4 + random.uniform(-0.6, 0.6)), 0, math.radians(random.uniform(-0.8, 0.8)))
        dark = (c == 0 or c == count - 1) and r > 0
        if dark:
            o.material_slots[0].link = 'OBJECT'; o.material_slots[0].material = m_key_dark
# space bar
sb = box('spacebar', (0.11, 0.016, 0.009), (KX - 0.02, KY + 0.055 - 5 * pitch, DESK_Z + 0.022), m_key, bevel=0.0025, rot=(math.radians(4), 0, 0))
# cable from keyboard to computer
curve = bpy.data.curves.new('cable', 'CURVE'); curve.dimensions = '3D'; curve.bevel_depth = 0.0025
sp = curve.splines.new('BEZIER'); sp.bezier_points.add(2)
pts = [(KX + 0.1, KY + 0.09, DESK_Z + 0.004), (KX + 0.26, KY + 0.2, DESK_Z + 0.003), (CX + 0.2, CY - 0.05, DESK_Z + 0.003)]
for p, co in zip(sp.bezier_points, pts): p.co = co; p.handle_left_type = p.handle_right_type = 'AUTO'
cab = bpy.data.objects.new('cable', curve); sc.collection.objects.link(cab); curve.materials.append(m_case_dark)

# ---------------------------------------------------------------- props (Poly Haven, CC0)
import_gltf(A('potted_plant_02', 'potted_plant_02.gltf'), (0.72, 0.78, DESK_Z), 0.6, 0.9, 'plant')
import_gltf(A('office_notepads', 'office_notepads.gltf'), (-0.48, 0.30, DESK_Z), 0.4, 1.0, 'notepads')
import_gltf(A('stationery_supplies', 'stationery_supplies.gltf'), (-0.62, 0.62, DESK_Z), -0.3, 1.0, 'pens')
import_gltf(A('round_spectacles', 'round_spectacles.gltf'), (0.42, 0.14, DESK_Z), 2.4, 1.0, 'glasses')
import_gltf(A('portable_cassette_player', 'portable_cassette_player.gltf'), (0.55, 0.40, DESK_Z), -0.5, 1.0, 'cassette')
# coffee mug
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.042, depth=0.1, location=(-0.42, 0.62, DESK_Z + 0.05))
mug = bpy.context.object; mug.name = 'mug'
sol = mug.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.004
bm = bmesh.new(); bm.from_mesh(mug.data)
top = [f for f in bm.faces if f.normal.z > 0.9]; bmesh.ops.delete(bm, geom=top, context='FACES'); bm.to_mesh(mug.data); bm.free()
mb = mug.modifiers.new('bev', 'BEVEL'); mb.width = 0.002; mb.segments = 2
bpy.ops.object.shade_smooth(); mug.data.materials.append(m_mug)
bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.006, location=(-0.375, 0.62, DESK_Z + 0.052), rotation=(math.radians(90), 0, 0))
h = bpy.context.object; bpy.ops.object.shade_smooth(); h.data.materials.append(m_mug)
# book stack
cols = [(0.35, 0.08, 0.05), (0.12, 0.16, 0.2), (0.55, 0.42, 0.2), (0.1, 0.1, 0.09)]
z = DESK_Z
for i, c in enumerate(cols):
    th = random.uniform(0.025, 0.04)
    box('book', (0.24 - i * 0.012, 0.17, th), (-0.75, 0.75, z + th / 2), mat('book%d' % i, c, 0.6), bevel=0.003, rot=(0, 0, random.uniform(-0.15, 0.15)))
    z += th

# background: wall shelf, framed print, cork board
box('shelf', (0.9, 0.2, 0.025), (0.55, 1.0, 1.55), m_desk, bevel=0.004)
for i in range(9):
    h_ = random.uniform(0.17, 0.24); w_ = random.uniform(0.025, 0.045)
    c_ = random.choice([(0.30, 0.06, 0.04), (0.08, 0.12, 0.16), (0.55, 0.42, 0.22), (0.12, 0.10, 0.08), (0.45, 0.35, 0.28)])
    box('sbook', (w_, 0.15, h_), (0.18 + i * 0.05, 1.0, 1.5625 + h_ / 2), mat('sb%d' % i, c_, 0.6), bevel=0.002, rot=(0, math.radians(random.uniform(-2, 2) + (12 if i == 8 else 0)), 0))
box('frame', (0.34, 0.02, 0.44), (-0.55, 1.095, 1.45), mat('frame', (0.04, 0.03, 0.02), 0.4), bevel=0.004)
bpy.ops.mesh.primitive_plane_add(size=1, location=(-0.55, 1.083, 1.45), rotation=(math.radians(90), 0, 0))
pr = bpy.context.object; pr.scale = (0.28, 0.38, 1)
mpr = mat('printpaper', (0.75, 0.68, 0.55), 0.75); tp = mpr.node_tree.nodes.new('ShaderNodeTexImage'); tp.image = bpy.data.images.load(A('poster.png'))
mpr.node_tree.links.new(tp.outputs['Color'], mpr.node_tree.nodes['Principled BSDF'].inputs['Base Color']); pr.data.materials.append(mpr)
box('cork', (0.45, 0.015, 0.3), (1.25, 1.09, 1.25), mat('cork', (0.45, 0.30, 0.17), 0.9), bevel=0.003)
for i in range(4):
    box('pin_paper', (0.09, 0.002, 0.11), (1.1 + i * 0.1, 1.08, 1.27 + random.uniform(-0.06, 0.06)), mat('pp%d' % i, random.choice([(0.85, 0.82, 0.72), (0.9, 0.78, 0.3), (0.6, 0.75, 0.85)]), 0.8), rot=(0, math.radians(random.uniform(-8, 8)), 0))

# ---------------------------------------------------------------- dust motes (lit only inside the sun beams)
m_dust = mat('dust', (1, 0.9, 0.75), 0.6, **{'Transmission Weight': 0.3})
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.0011)
dsrc = bpy.context.object; dsrc.data.materials.append(m_dust)
dmesh = dsrc.data; bpy.data.objects.remove(dsrc)
dust = []
for i in range(420):
    o = bpy.data.objects.new('dust', dmesh); sc.collection.objects.link(o)
    p = Vector((random.uniform(-1.2, 0.8), random.uniform(-0.3, 1.0), random.uniform(0.8, 1.7)))
    o.location = p
    d = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-0.4, 0.6))) * 0.02
    o.keyframe_insert('location', frame=1); o.location = p + d * 8; o.keyframe_insert('location', frame=200)
    for fc in o.animation_data.action.fcurves:
        for k in fc.keyframe_points: k.interpolation = 'LINEAR'
    o.visible_shadow = False

# ---------------------------------------------------------------- lighting
world = bpy.data.worlds.new('world'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.010, 0.0075, 0.005, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
# low golden-hour sun through the blinds
sun_dir = Vector((1.0, 0.55, -0.42)).normalized()
bpy.ops.object.light_add(type='SUN', location=(-3, -1, 3))
sun = bpy.context.object; sun.name = 'sun'
sun.rotation_euler = sun_dir.to_track_quat('-Z', 'Y').to_euler()
sun.data.energy = 12.0; sun.data.angle = math.radians(0.9)
sun.data.color = (1.0, 0.62, 0.30)
# bright exterior sky seen through the window (bounce source)
bpy.ops.mesh.primitive_plane_add(size=1, location=(WX - 0.8, 0, 1.6), rotation=(0, math.radians(90), 0))
sky = bpy.context.object; sky.scale = (2.5, 4, 1); sky.name = 'sky_card'
msky = bpy.data.materials.new('sky'); msky.use_nodes = True
em = msky.node_tree.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.7, 0.45, 1); em.inputs['Strength'].default_value = 3.0
msky.node_tree.links.new(em.outputs[0], msky.node_tree.nodes['Material Output'].inputs['Surface'])
sky.data.materials.append(msky); sky.visible_shadow = False
# soft warm fill from camera right (practical lamp off-screen)
bpy.ops.object.light_add(type='AREA', location=(1.3, -0.9, 1.5))
fill = bpy.context.object; fill.data.shape = 'DISK'; fill.data.size = 0.8
fill.data.energy = 6; fill.data.color = (1.0, 0.55, 0.28)
fill.rotation_euler = (Vector((0, 0.5, 0.9)) - fill.location).to_track_quat('-Z', 'Y').to_euler()
# faint cool rim from behind (window bounce on back wall)
bpy.ops.object.light_add(type='AREA', location=(-0.6, 1.0, 1.6))
rim = bpy.context.object; rim.data.size = 1.0; rim.data.energy = 3; rim.data.color = (0.65, 0.75, 1.0)
rim.rotation_euler = (Vector((0.1, 0.5, 0.9)) - rim.location).to_track_quat('-Z', 'Y').to_euler()

# ---------------------------------------------------------------- camera: slow dolly-in with a slight arc + breathing
cam_d = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam_d.lens = 45; cam_d.sensor_width = 36
cam_d.dof.use_dof = True; cam_d.dof.aperture_fstop = 2.2; cam_d.dof.aperture_blades = 7
target = bpy.data.objects.new('cam_target', None); sc.collection.objects.link(target)
cam_d.dof.focus_object = target
tc = cam.constraints.new('TRACK_TO'); tc.target = target; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'
F0, F1 = 1, 96
keys = [  # frame, cam loc, target loc
    (F0, (0.50, -0.95, 1.02), (CX - 0.03, CY - 0.18, DESK_Z + 0.22)),
    (F1, (0.20, -0.55, 1.00), (CX - 0.01, CY - 0.17, DESK_Z + 0.26)),
]
for f, cl, tl in keys:
    cam.location = cl; cam.keyframe_insert('location', frame=f)
    target.location = tl; target.keyframe_insert('location', frame=f)
for ob in (cam, target):
    for fc in ob.animation_data.action.fcurves:
        for k in fc.keyframe_points:
            k.interpolation = 'BEZIER'; k.easing = 'AUTO'
            k.handle_left_type = k.handle_right_type = 'AUTO_CLAMPED'
# subtle handheld breathing
for i, fc in enumerate(cam.animation_data.action.fcurves):
    mdn = fc.modifiers.new('NOISE'); mdn.scale = 60; mdn.strength = 0.004; mdn.phase = i * 13

cam2_d = bpy.data.cameras.new('cam2'); cam2 = bpy.data.objects.new('cam2', cam2_d); sc.collection.objects.link(cam2)
cam2_d.lens = 32; cam2_d.dof.use_dof = True; cam2_d.dof.aperture_fstop = 3.2; cam2_d.dof.aperture_blades = 7
t2 = bpy.data.objects.new('cam2_target', None); sc.collection.objects.link(t2); cam2_d.dof.focus_object = t2
c2 = cam2.constraints.new('TRACK_TO'); c2.target = t2; c2.track_axis = 'TRACK_NEGATIVE_Z'; c2.up_axis = 'UP_Y'
S2 = F1 + 1; S2E = S2 + 71
SCR = (CX, CY - 0.155, MZ + 0.02 + mh / 2 + 0.02)
for f, cl, tl in [(S2, (0.27, KY - 0.21, DESK_Z + 0.085), (KX - 0.03, KY + 0.02, DESK_Z + 0.032)),
                  (S2 + 28, (0.25, KY - 0.22, DESK_Z + 0.09), (KX - 0.05, KY + 0.03, DESK_Z + 0.032)),
                  (S2E, (0.24, KY - 0.27, DESK_Z + 0.10), SCR)]:
    cam2.location = cl; cam2.keyframe_insert('location', frame=f); t2.location = tl; t2.keyframe_insert('location', frame=f)
for i, fc in enumerate(cam2.animation_data.action.fcurves):
    mdn = fc.modifiers.new('NOISE'); mdn.scale = 50; mdn.strength = 0.002; mdn.phase = i * 7 + 3
m1 = sc.timeline_markers.new('A', frame=F0); m1.camera = cam
m2 = sc.timeline_markers.new('B', frame=S2); m2.camera = cam2

# ---------------------------------------------------------------- render settings
sc.frame_start, sc.frame_end = F0, S2E
sc.render.fps = 24
sc.render.engine = 'CYCLES'
cy = sc.cycles
cy.device = 'CPU'; cy.samples = 48; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.02
cy.use_denoising = True; cy.denoiser = 'OPENIMAGEDENOISE'
cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
cy.max_bounces = 6; cy.diffuse_bounces = 3; cy.glossy_bounces = 3; cy.transmission_bounces = 6; cy.volume_bounces = 1
cy.sample_clamp_indirect = 4.0; cy.blur_glossy = 1.0
cy.volume_step_rate = 4.0; cy.volume_max_steps = 256
sc.render.use_persistent_data = True
sc.render.resolution_x, sc.render.resolution_y = 720, 1280
sc.render.resolution_percentage = 100
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.view_settings.exposure = 0.0
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '16'
sc.render.film_transparent = False

# compositor: soft bloom + subtle lens dispersion
sc.use_nodes = True
cn = sc.node_tree.nodes; cl_ = sc.node_tree.links
rl = cn['Render Layers']; comp = cn['Composite']
gl = cn.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'HIGH'; gl.threshold = 0.9; gl.size = 8; gl.mix = -0.75
ld = cn.new('CompositorNodeLensdist'); ld.inputs['Distortion'].default_value = -0.012; ld.inputs['Dispersion'].default_value = 0.012
cl_.new(rl.outputs['Image'], gl.inputs['Image']); cl_.new(gl.outputs['Image'], ld.inputs['Image']); cl_.new(ld.outputs['Image'], comp.inputs['Image'])

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else os.path.join(HERE, 'scene.blend')
bpy.ops.wm.save_as_mainfile(filepath=out)
print('SAVED', out)

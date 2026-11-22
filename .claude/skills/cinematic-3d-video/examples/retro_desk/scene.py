"""Golden-hour retro desk - the reference scene for this skill (7 s, 9:16, two shots).

Prep (from this folder):
  python3 make_textures.py                                   # screen UI + poster images -> assets/
  python3 $CINE_LIB/polyhaven.py model potted_plant_02 office_notepads stationery_supplies round_spectacles portable_cassette_player
  python3 $CINE_LIB/polyhaven.py texture black_walnut_veneer_02 american_walnut_veneer beige_wall_002
Build:
  CINE_LIB=<skill>/scripts blender -b -P scene.py -- scene.blend

Read this file top to bottom as a recipe: materials -> room & key light path -> hero object
(lots of small real-world detail) -> props -> background depth -> atmosphere -> lights -> cameras.
"""
import os, sys, math, random, bmesh, bpy
sys.path.insert(0, os.environ.get('CINE_LIB', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'scripts')))
import cine as C

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, 'assets', *p)
C.reset(seed=7)

# ---------------------------------------------------------------- materials
BEIGE = (0.70, 0.64, 0.53)
m_case = C.plastic('case', BEIGE)
m_case_dark = C.plastic('case_dark', (0.55, 0.48, 0.36), 0.5)
m_key = C.plastic('keycap', (0.72, 0.66, 0.56), 0.5, 0.08)
m_key_dark = C.plastic('keycap_dark', (0.50, 0.45, 0.37), 0.5, 0.08)
m_black = C.mat('black_plastic', (0.02, 0.02, 0.02), 0.55)
m_slot = C.mat('slot', (0.005, 0.005, 0.005), 0.8)
m_led = C.mat('led', (0.1, 1, 0.2), 0.3, **{'Emission Color': (0.2, 1.0, 0.3, 1), 'Emission Strength': 8})
m_wall = C.pbr('wall', A('tex', 'beige_wall_002'), 1.5, bump=0.5, tint=(0.62, 0.52, 0.42), color=(0.55, 0.45, 0.36), rough=0.9)
m_desk = C.pbr('desk', A('tex', 'black_walnut_veneer_02'), 1.2, bump=0.15, rough_mul=0.9, tint=(0.85, 0.62, 0.45),
               color=(0.3, 0.15, 0.07), rough=0.35, **{'Coat Weight': 0.35, 'Coat Roughness': 0.12})
m_floor = C.pbr('floor', A('tex', 'american_walnut_veneer'), 0.6, bump=0.2, tint=(0.4, 0.28, 0.2))
m_blind = C.mat('blind', (0.75, 0.70, 0.62), 0.5)
m_paper = C.mat('paper', (0.92, 0.80, 0.35), 0.8, **{'Subsurface Weight': 0.2})
m_mug = C.mat('mug', (0.08, 0.12, 0.16), 0.15, **{'Coat Weight': 0.8})
m_screen = C.screen_mat('crt', A('screen_ui.png'), 0.9)

# ---------------------------------------------------------------- room + the light path (window on the left)
WX = -1.5; SPAN = (-0.9, 0.9); WZ = (0.95, 2.25)
C.room(m_wall, m_floor, size=(8, 8, 3), window=dict(side='left', at=WX, span=SPAN, z=WZ))
C.blinds(WX, SPAN, WZ, m_blind, side='left', spacing=0.085, slat_w=0.07, tilt_deg=-16)
for yy in (-0.55, 0.0, 0.55):
    C.box('cord', (0.003, 0.003, WZ[1] - WZ[0]), (WX + 0.1, yy, sum(WZ) / 2), m_blind)

# ---------------------------------------------------------------- desk
DESK_Z = 0.74
C.box('desk_top', (2.6, 0.95, 0.045), (0, 0.45, DESK_Z - 0.0225), m_desk, bevel=0.006)
C.box('desk_apron', (2.5, 0.03, 0.12), (0, 0.0, DESK_Z - 0.1), m_desk, bevel=0.003)
for x in (-1.2, 1.2):
    C.box('leg', (0.06, 0.06, DESK_Z - 0.045), (x, 0.05, (DESK_Z - 0.045) / 2), m_desk, bevel=0.004)

# ---------------------------------------------------------------- hero: generic beige 90s desktop + CRT
CX, CY = 0.05, 0.55
base_h = 0.12; fz = DESK_Z + 0.006
C.box('cpu_case', (0.44, 0.40, base_h), (CX, CY, fz + base_h / 2), m_case, bevel=0.012, seg=4)
for fx in (-0.18, 0.18):
    for fy in (-0.17, 0.17):
        C.box('foot', (0.03, 0.03, 0.006), (CX + fx, CY + fy, DESK_Z + 0.003), m_black)
C.box('cpu_front_groove', (0.44, 0.004, 0.003), (CX, CY - 0.2005, fz + 0.035), m_case_dark)
C.box('floppy_bezel', (0.14, 0.006, 0.03), (CX + 0.09, CY - 0.201, fz + 0.07), m_case_dark, bevel=0.003)
C.box('floppy_slot', (0.1, 0.006, 0.006), (CX + 0.09, CY - 0.2035, fz + 0.072), m_slot)
C.box('floppy_btn', (0.018, 0.006, 0.008), (CX + 0.135, CY - 0.204, fz + 0.062), m_case, bevel=0.002)
C.box('power_btn', (0.03, 0.008, 0.018), (CX - 0.17, CY - 0.202, fz + 0.065), m_case, bevel=0.003)
C.box('led', (0.006, 0.004, 0.004), (CX - 0.13, CY - 0.2025, fz + 0.075), m_led)
for i in range(9):
    C.box('vent', (0.004, 0.004, 0.05), (CX - 0.06 + i * 0.012, CY - 0.2015, fz + 0.06), m_case_dark)
MZ = fz + base_h + 0.004
mw, mh, md = 0.40, 0.35, 0.10
mcz = MZ + 0.02 + mh / 2
C.box('mon_front', (mw, md, mh), (CX, CY - 0.10, mcz), m_case, bevel=0.018, seg=5)
C.tapered_box('mon_rear', (mw - 0.02, mh - 0.02), (0.24, 0.225), 0.31, (CX, CY - 0.15, mcz), m_case, back_dz=-0.0425, bevel=0.025)
for i in range(7):
    C.box('rvent', (0.16, 0.004, 0.006), (CX, CY + 0.05 + i * 0.022, mcz + 0.14 - i * 0.012), m_case_dark, rot=(math.radians(-30), 0, 0))
C.box('mon_stand', (0.24, 0.20, 0.03), (CX, CY, MZ + 0.015), m_case_dark, bevel=0.008)
C.box('bezel_inner', (0.335, 0.01, 0.27), (CX, CY - 0.148, mcz + 0.018), m_case_dark, bevel=0.01)
C.panel('crt_glass', (0.305, 0.235), (CX, CY - 0.155, mcz + 0.018), m=m_screen, bulge=0.012)
C.box('badge', (0.05, 0.003, 0.012), (CX - 0.13, CY - 0.1515, MZ + 0.045), m_case_dark, bevel=0.001)
for i in range(4):
    C.box('knob', (0.012, 0.006, 0.008), (CX + 0.07 + i * 0.022, CY - 0.152, MZ + 0.045), m_case_dark, bevel=0.002)
C.panel('sticky', (0.05, 0.05), (CX + 0.165, CY - 0.1535, MZ + 0.02 + mh - 0.032),
        rot=(math.radians(90), math.radians(-6), 0), m=m_paper, curl=-0.004, res=10)

# ---------------------------------------------------------------- keyboard (instanced, slightly irregular keycaps)
KX, KY = CX, CY - 0.40
C.box('kb_base', (0.46, 0.17, 0.022), (KX, KY, DESK_Z + 0.011), m_case, bevel=0.007, rot=(math.radians(4), 0, 0))
bpy.ops.mesh.primitive_cube_add(size=1); cap = bpy.context.object
bm = bmesh.new(); bm.from_mesh(cap.data)
for v in bm.verts:
    if v.co.z > 0: v.co.x *= 0.78; v.co.y *= 0.78          # tapered keycap top
bm.to_mesh(cap.data); bm.free()
cap.scale = (0.0165, 0.0165, 0.010); bpy.ops.object.transform_apply(scale=True)
mdc = cap.modifiers.new('bev', 'BEVEL'); mdc.width = 0.0022; mdc.segments = 3
bpy.ops.object.shade_smooth(); cap.data.materials.append(m_key)
pitch = 0.0195; tf = []; dark = {}
for r, (count, off) in enumerate([(15, 0), (14, 0.5), (14, 0.7), (13, 1.0), (12, 1.3)]):
    for c in range(count):
        y = KY + 0.055 - r * pitch
        tf.append(((KX - 0.215 + (c + off * 0.5) * pitch, y, DESK_Z + 0.025 + (0.055 - r * pitch) * 0.07 + random.uniform(-0.0004, 0.0004)),
                   (math.radians(4 + random.uniform(-0.6, 0.6)), 0, math.radians(random.uniform(-0.8, 0.8)))))
        if (c == 0 or c == count - 1) and r > 0: dark[len(tf) - 1] = m_key_dark
C.instances(cap, tf, 'key', dark)
C.box('spacebar', (0.11, 0.016, 0.009), (KX - 0.02, KY + 0.055 - 5 * pitch, DESK_Z + 0.022), m_key, bevel=0.0025, rot=(math.radians(4), 0, 0))
C.cable([(KX + 0.1, KY + 0.09, DESK_Z + 0.004), (KX + 0.26, KY + 0.2, DESK_Z + 0.003), (CX + 0.2, CY - 0.05, DESK_Z + 0.003)], m=m_case_dark)

# ---------------------------------------------------------------- props (Poly Haven, CC0) - real scans add the mess CG lacks
C.import_asset(A('potted_plant_02', 'potted_plant_02.gltf'), (0.72, 0.78, DESK_Z), 0.6, 0.9, 'plant')
C.import_asset(A('office_notepads', 'office_notepads.gltf'), (-0.48, 0.30, DESK_Z), 0.4, 1.0, 'notepads')
C.import_asset(A('stationery_supplies', 'stationery_supplies.gltf'), (-0.62, 0.62, DESK_Z), -0.3, 1.0, 'pens')
C.import_asset(A('round_spectacles', 'round_spectacles.gltf'), (0.42, 0.14, DESK_Z), 2.4, 1.0, 'glasses')
C.import_asset(A('portable_cassette_player', 'portable_cassette_player.gltf'), (0.55, 0.40, DESK_Z), -0.5, 1.0, 'cassette')
C.mug((-0.42, 0.62, DESK_Z), m=m_mug)
z = DESK_Z
for i, col in enumerate([(0.35, 0.08, 0.05), (0.12, 0.16, 0.2), (0.55, 0.42, 0.2), (0.1, 0.1, 0.09)]):
    th = random.uniform(0.025, 0.04)
    C.box('book', (0.24 - i * 0.012, 0.17, th), (-0.75, 0.75, z + th / 2), C.mat('book%d' % i, col, 0.6), bevel=0.003, rot=(0, 0, random.uniform(-0.15, 0.15)))
    z += th

# ---------------------------------------------------------------- background depth (reads as soft shapes through DOF)
C.box('shelf', (0.9, 0.2, 0.025), (0.55, 1.0, 1.55), m_desk, bevel=0.004)
for i in range(9):
    h_ = random.uniform(0.17, 0.24); w_ = random.uniform(0.025, 0.045)
    col = random.choice([(0.30, 0.06, 0.04), (0.08, 0.12, 0.16), (0.55, 0.42, 0.22), (0.12, 0.10, 0.08), (0.45, 0.35, 0.28)])
    C.box('sbook', (w_, 0.15, h_), (0.18 + i * 0.05, 1.0, 1.5625 + h_ / 2), C.mat('sb%d' % i, col, 0.6), bevel=0.002,
          rot=(0, math.radians(random.uniform(-2, 2) + (12 if i == 8 else 0)), 0))
C.box('frame', (0.34, 0.02, 0.44), (-0.55, 1.095, 1.45), C.mat('frame', (0.04, 0.03, 0.02), 0.4), bevel=0.004)
C.panel('print', (0.28, 0.38), (-0.55, 1.083, 1.45), m=C.image_mat('printpaper', A('poster.png'), 0.75), res=2)
C.box('cork', (0.45, 0.015, 0.3), (1.25, 1.09, 1.25), C.mat('cork', (0.45, 0.30, 0.17), 0.9), bevel=0.003)
for i in range(4):
    C.box('pin_paper', (0.09, 0.002, 0.11), (1.1 + i * 0.1, 1.08, 1.27 + random.uniform(-0.06, 0.06)),
          C.mat('pp%d' % i, random.choice([(0.85, 0.82, 0.72), (0.9, 0.78, 0.3), (0.6, 0.75, 0.85)]), 0.8),
          rot=(0, math.radians(random.uniform(-8, 8)), 0))

# ---------------------------------------------------------------- atmosphere + lights
C.dust(420, ((-1.2, 0.8), (-0.3, 1.0), (0.8, 1.7)), frames=(1, 200))
C.world((0.010, 0.0075, 0.005))
C.sun((1.0, 0.55, -0.42), energy=12.0, color=(1.0, 0.62, 0.30), angle_deg=0.9)          # key: low sun through the blinds
C.sky_card((WX - 0.8, 0, 1.6), (0, math.radians(90), 0), (2.5, 4), (1.0, 0.7, 0.45), 3.0)  # bright exterior
C.area((1.3, -0.9, 1.5), (0, 0.5, 0.9), 6, 0.8, (1.0, 0.55, 0.28), name='fill')            # warm fill, ~1:8 vs key
C.area((-0.6, 1.0, 1.6), (0.1, 0.5, 0.9), 3, 1.0, (0.65, 0.75, 1.0), 'SQUARE', name='rim')  # cool rim for separation

# ---------------------------------------------------------------- cameras: A = slow push-in, B = low keyboard slide -> rack to screen
F1 = 96; S2 = F1 + 1; S2E = S2 + 71
camA = C.camera('camA', [(1, (0.50, -0.95, 1.02), (CX - 0.03, CY - 0.18, DESK_Z + 0.22)),
                         (F1, (0.20, -0.55, 1.00), (CX - 0.01, CY - 0.17, DESK_Z + 0.26))], lens=45, fstop=2.2, handheld=0.004)
SCR = (CX, CY - 0.155, mcz + 0.02)
camB = C.camera('camB', [(S2, (0.27, KY - 0.21, DESK_Z + 0.085), (KX - 0.03, KY + 0.02, DESK_Z + 0.032)),
                         (S2 + 28, (0.25, KY - 0.22, DESK_Z + 0.09), (KX - 0.05, KY + 0.03, DESK_Z + 0.032)),
                         (S2E, (0.24, KY - 0.27, DESK_Z + 0.10), SCR)], lens=32, fstop=3.2, handheld=0.002, handheld_scale=50)
C.cut(1, camA); C.cut(S2, camB)

C.render_settings(frames=(1, S2E), res=(720, 1280), fps=24, samples=48)
C.compositor()
C.save()

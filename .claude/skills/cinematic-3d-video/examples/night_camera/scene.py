"""Night camera - vintage rangefinder on a walnut table, desk-lamp key, night city window (4 s, 9:16, one orbit).

Built by a fresh agent using only this skill, then refactored onto the helpers it asked for.
Shows: night lighting with a practical lamp, thin window glass with a city bokeh card, recolouring
a scan, keeping one variant of a multi-variant scan, reflection-free fill/kicker, orbit camera.

Prep:  bash setup.sh   (downloads Poly Haven assets, generates assets/city.png + film label, builds scene.blend)
Look-dev: bash ../../scripts/lookdev.sh scene.py v1

BRANDING: the Camera_01 scan has real maker/lens lettering in its texture (readable at 50% res).
Before using this for client work, paint it out of the diffuse map (see modeling-materials.md).
"""
import os, sys, math, bpy
from mathutils import Vector
sys.path.insert(0, os.environ.get('CINE_LIB', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'scripts')))
import cine as C

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, 'assets', *p)
C.reset(seed=11)
DESK_Z = 0.75

# ---------------------------------------------------------------- materials
m_wall = C.pbr('wall', A('tex', 'plastered_wall_04'), 1.2, bump=0.6, tint=(0.30, 0.27, 0.24))
m_desk = C.pbr('desk', A('tex', 'smoked_walnut_veneer'), 1.0, bump=0.2, tint=(0.42, 0.32, 0.25),
               **{'Coat Weight': 0.1, 'Coat Roughness': 0.3, 'Specular IOR Level': 0.3})
m_floor = C.pbr('floor', A('tex', 'wood_table'), 0.7, bump=0.2, tint=(0.25, 0.2, 0.17))
m_frame = C.metal('window_frame', (0.05, 0.05, 0.055), rough=0.45)
m_glass = C.thin_glass('window_glass', rough=0.01, ior=1.35)
m_city = C.image_mat('city', A('city.png'), emission=1.6)
m_cart = C.image_mat('cart_label', A('film_label.png'), rough=0.35, coat=0.6)
m_cart_metal = C.metal('cart_cap', (0.62, 0.62, 0.64), rough=0.3, grime=0.15)
m_spool = C.mat('spool', (0.03, 0.03, 0.03), 0.5)
m_film = C.mat('film_leader', (0.09, 0.05, 0.02), 0.25, **{'Coat Weight': 0.6})
m_cap = C.metal('lens_cap', (0.03, 0.03, 0.03), rough=0.35, grime=0.1)

# ---------------------------------------------------------------- room: back wall with a big city window
WIN_Y = 1.25; WSPAN = (-1.4, 1.4); WZ = (0.85, 2.55)
C.room(m_wall, m_floor, size=(8, 8, 3), window=dict(side='back', at=WIN_Y, span=WSPAN, z=WZ))
for x in (-0.47, 0.47):
    C.box('mullion', (0.05, 0.08, WZ[1] - WZ[0]), (x, WIN_Y, sum(WZ) / 2), m_frame, bevel=0.004)
C.box('transom', (WSPAN[1] - WSPAN[0], 0.08, 0.05), (0, WIN_Y, 2.05), m_frame, bevel=0.004)
C.box('sill', (WSPAN[1] - WSPAN[0] + 0.1, 0.22, 0.035), (0, WIN_Y - 0.05, WZ[0] - 0.0175), C.mat('sill', (0.2, 0.19, 0.18), 0.4), bevel=0.004)
C.panel('glass', (WSPAN[1] - WSPAN[0], WZ[1] - WZ[0]), (0, WIN_Y + 0.02, sum(WZ) / 2), m=m_glass, res=2)
city = C.panel('city', (14, 7), (0, 7.0, 2.6), m=m_city, res=2)      # far outside; DOF turns lit windows into bokeh
city.visible_shadow = False

# ---------------------------------------------------------------- table
C.box('table_top', (1.8, 1.75, 0.045), (0, 0.075, DESK_Z - 0.0225), m_desk, bevel=0.005)
for x in (-0.82, 0.82):
    for y in (-0.72, 0.88):
        C.box('leg', (0.06, 0.06, DESK_Z - 0.045), (x, y, (DESK_Z - 0.045) / 2), m_desk, bevel=0.004)

# ---------------------------------------------------------------- hero (CC0 scan; its front faces -Y)
HX, HY = 0.0, 0.0
C.import_asset(A('Camera_01', 'Camera_01.gltf'), (HX, HY, DESK_Z), math.radians(10), 1.0, 'hero_camera')

# ---------------------------------------------------------------- props
def cartridge(loc, rot, name):
    """35 mm film cartridge: label body, metal end caps, spool knob, curled film leader."""
    root = bpy.data.objects.new(name, None); C.sc.collection.objects.link(root)
    parts = [C.cylinder(name + '_body', 0.0122, 0.040, (0, 0, 0.0035), m_cart, verts=48, bevel=0),
             C.cylinder(name + '_capb', 0.0135, 0.0035, (0, 0, 0), m_cart_metal, bevel=0.0008),
             C.cylinder(name + '_capt', 0.0135, 0.0035, (0, 0, 0.0435), m_cart_metal, bevel=0.0008),
             C.cylinder(name + '_knob', 0.0045, 0.006, (0, 0, 0.047), m_spool, bevel=0.0006),
             C.panel(name + '_leader', (0.026, 0.035), (0.0, -0.0285, 0.0235), rot=(0, math.radians(90), math.radians(90)),
                     m=m_film, curl=0.01, res=12)]
    for p in parts: p.parent = root
    root.location = loc; root.rotation_euler = rot
    return root

cartridge((0.125, -0.035, DESK_Z), (0, 0, math.radians(-30)), 'cart_a')                          # standing
cartridge((0.165, 0.045, DESK_Z + 0.0135), (math.radians(90), 0, math.radians(65)), 'cart_b')   # on its side
C.cylinder('lens_cap', 0.022, 0.009, (-0.125, 0.075, DESK_Z), m_cap, verts=64, bevel=0.0015)
C.cylinder('lens_cap_inner', 0.0175, 0.0005, (-0.125, 0.075, DESK_Z + 0.009), C.mat('cap_felt', (0.015, 0.015, 0.015), 0.9), verts=64, bevel=0)
C.import_asset(A('binder_notebook', 'binder_notebook.gltf'), (0.253, 0.385, DESK_Z), math.radians(-12), 1.0, 'notebook',
               only=['binder_notebook_closed'], recenter=True)                                   # scan ships open + closed variants

# ---------------------------------------------------------------- desk lamp (CC0 scan) repainted matte black; its bulb is the practical
lamp = C.import_asset(A('desk_lamp_arm_01', 'desk_lamp_arm_01.gltf'), (-0.40, 0.95, DESK_Z), math.radians(203), 0.9, 'lamp')
C.recolor(lamp, saturation=0.15, value=0.22)
for o in lamp.children_recursive:
    for ms in getattr(o, 'material_slots', []):
        if ms.material and ms.material.name.endswith('_light'):
            ms.material.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 6.0
bpy.context.view_layer.update()
lm = lamp.matrix_world
BULB = lm @ Vector((-0.002, 0.174, 0.693))                                    # found with render.py -- inspect lamp
SHADE_DIR = (lm.to_3x3() @ Vector((-0.24, 0.41, -0.88))).normalized()

# ---------------------------------------------------------------- atmosphere + lights
C.dust(150, ((-0.35, 0.10), (-0.10, 0.75), (0.80, 1.30)), frames=(1, 96), size=0.0009, drift=0.06)
C.world((0.002, 0.003, 0.006))
C.spot(tuple(BULB + SHADE_DIR * 0.07), (HX, HY + 0.07, DESK_Z + 0.03), 150, (1.0, 0.70, 0.42), cone_deg=30, blend=0.55,
       radius=0.02, name='key_lamp')                                          # ~0.9 m from hero -> 150 W; just past the bulb mesh
C.area((0.0, WIN_Y + 0.35, 1.7), (0.1, 0.0, DESK_Z), 40, (2.6, 1.5), (0.45, 0.6, 1.0), 'RECTANGLE', name='city_rim')
C.area((0.45, -1.0, 0.95), (0, 0, DESK_Z + 0.04), 3, 1.0, (1.0, 0.78, 0.6), name='fill', reflect=False)
C.area((0.16, -0.24, DESK_Z + 0.07), (0, -0.02, DESK_Z + 0.04), 0.6, 0.2, (1.0, 0.8, 0.62), name='front_kicker', reflect=False)

# ---------------------------------------------------------------- camera: eased ~40 deg orbit + slight push, 11 cm above the table
cam = C.orbit_camera('camA', center=(HX, HY, DESK_Z), target=(HX + 0.01, HY - 0.03, DESK_Z + 0.075), frames=(1, 96),
                     angle_deg=(30, -10), radius=(0.43, 0.375), height=(0.115, 0.105), lens=35, fstop=2.5)
C.cut(1, cam)

C.render_settings(frames=(1, 96), res=(720, 1280), fps=24, samples=64)
C.compositor()
C.save()

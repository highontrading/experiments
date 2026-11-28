"""Ad 1 'SIGNAL': a dark retro den full of glowing CRTs, warm pendant lamps, a creator in an office chair
seen from behind, and original 3D app-style icons floating in the air.
ICONS=1 (env) renders only the icons (everything else held out, transparent film) for the parallax layer."""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import bpy  # noqa: E402
import common as K  # noqa: E402
C = K.C

C.reset(seed=5)
random.seed(5)
ICONS = os.environ.get("ICONS") == "1"

wall_m = C.mat("den_wall", (0.06, 0.055, 0.045), 0.85)
C.add_wear(wall_m, (0.06, 0.055, 0.045), 0.85, grime=0.3, micro_bump=0.05, scale=2.0)
floor_m = C.mat("den_floor", (0.10, 0.07, 0.05), 0.55)
C.add_wear(floor_m, (0.10, 0.07, 0.05), 0.55, grime=0.3, micro_bump=0.06, scale=4.0)
C.room(wall_m, floor_m, size=(6, 8, 3.0), window=dict(back_y=2.1, left_x=-2.3, right_x=2.3, front_y=-3.6))
shelf_m = C.metal("shelf", (0.22, 0.22, 0.22), 0.45, grime=0.25)
desk_m = C.plastic("desk", (0.16, 0.10, 0.06), 0.5, 0.2)

room_objs = set(o.name for o in bpy.data.objects)

# ---- back wall: metal shelving packed with TVs
for x in (-2.15, -0.75, 0.75, 2.15):
    C.box("upright", (0.04, 0.04, 2.7), (x, 1.75, 1.35), shelf_m, bevel=0.004)
    C.box("upright_b", (0.04, 0.04, 2.7), (x, 2.05, 1.35), shelf_m, bevel=0.004)
levels = [0.0, 0.78, 1.52, 2.22]
for z in levels[1:]:
    C.box("shelf", (4.4, 0.42, 0.03), (0, 1.9, z - 0.015), shelf_m, bevel=0.004)
styles = ["beige", "cream", "black", "charcoal", "silver", "beige", "wood"]
for li, z in enumerate(levels):
    x = -2.1
    gap_h = (levels[li + 1] - z - 0.06) if li + 1 < len(levels) else 0.7
    while x < 2.05:
        w = random.uniform(0.38, 0.62)
        w = min(w, gap_h / 0.86 * 0.98, 2.1 - x)
        if w < 0.28:
            break
        K.tv(f"b{li}_{int((x + 2.1) * 100)}", (x + w / 2, 1.78 + random.uniform(-0.05, 0.03), z), w=w, style=random.choice(styles),
             rot_z=math.radians(random.uniform(-6, 6)), on=random.random() < 0.85)
        x += w + random.uniform(0.02, 0.08)

# ---- side desks with TVs angled toward the chair
for side in (-1, 1):
    C.box("desk_top", (0.7, 2.6, 0.04), (side * 1.9, -0.2, 0.74), desk_m, bevel=0.006)
    for yy in (-1.4, 1.0):
        C.box("desk_leg", (0.05, 0.05, 0.72), (side * 2.15, yy, 0.36), desk_m)
    y = -1.3
    while y < 0.9:
        w = random.uniform(0.38, 0.52)
        K.tv(f"s{side}_{int((y + 2) * 100)}", (side * 1.9, y + w / 2, 0.76), w=w, style=random.choice(styles),
             rot_z=math.radians(-side * 72 + random.uniform(-6, 6)), on=random.random() < 0.9)
        if random.random() < 0.6:
            w2 = w * random.uniform(0.75, 0.95)
            K.tv(f"s{side}u_{int((y + 2) * 100)}", (side * 1.95, y + w / 2, 0.76 + w * 0.86), w=w2, style=random.choice(styles),
                 rot_z=math.radians(-side * 72 + random.uniform(-6, 6)), on=random.random() < 0.9)
        y += w + 0.08
    # equipment boxes under the desk
    for k in range(3):
        C.box("vcr", (0.42, 0.32, 0.1), (side * 1.85, -1.0 + k * 0.7, 0.05 + 0.11 * (k % 2)), C.plastic(f"vcr{k}", (0.05, 0.05, 0.05), 0.4), bevel=0.01)

# ---- pendant lamps (practicals)
shade_m = C.metal("shade", (0.35, 0.3, 0.22), 0.35)
for (px, py) in ((-1.2, 0.6), (0.0, 1.0), (1.3, 0.3)):
    C.cylinder("cord", 0.004, 0.75, (px, py, 2.25), C.mat("cord", (0.02, 0.02, 0.02), 0.6), verts=8, bevel=0)
    sh = C.cylinder("shade", 0.12, 0.14, (px, py, 2.1), shade_m, verts=40, hollow=0.004)
    sh.rotation_euler = (math.radians(180), 0, 0)
    sh.location = (px, py, 2.25)
    C.practical_bulb((px, py, 2.12), 0.03, 18.0, (1.0, 0.72, 0.42), name="bulb")
    C.point((px, py, 2.05), 25, (1.0, 0.7, 0.4), radius=0.04, name="pendant")

# ---- office chair + creator seen from behind
fab = C.mat("hoodie", (0.035, 0.04, 0.05), 0.85)
C.add_wear(fab, (0.035, 0.04, 0.05), 0.85, grime=0.1, micro_bump=0.08, scale=20)
chair_m = C.mat("chair", (0.03, 0.025, 0.022), 0.6)
skin = C.mat("skin", (0.42, 0.28, 0.2), 0.5, **{"Subsurface Weight": 0.3})
hair = C.mat("hair", (0.02, 0.014, 0.01), 0.55)
CY = -0.55
C.box("seat", (0.52, 0.5, 0.09), (0, CY, 0.5), chair_m, bevel=0.03, seg=4)
C.box("backrest", (0.46, 0.07, 0.36), (0, CY - 0.25, 0.76), chair_m, bevel=0.04, seg=4, rot=(math.radians(-8), 0, 0))
C.cylinder("post", 0.03, 0.4, (0, CY, 0.05), shelf_m, verts=24)
for k in range(5):
    a = k * 2 * math.pi / 5
    C.box("leg", (0.3, 0.04, 0.03), (0.15 * math.cos(a), CY + 0.15 * math.sin(a), 0.06), chair_m, rot=(0, 0, a), bevel=0.01)
C.box("torso", (0.46, 0.27, 0.52), (0, CY - 0.02, 0.85), fab, bevel=0.13, seg=6)
for sx in (-1, 1):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(sx * 0.17, CY - 0.02, 1.06))
    o = bpy.context.object
    o.scale = (1.15, 0.95, 0.55)
    o.data.materials.append(fab)
    C.box("arm", (0.1, 0.12, 0.34), (sx * 0.26, CY + 0.05, 0.86), fab, bevel=0.045, seg=4, rot=(math.radians(25), 0, sx * math.radians(-6)))
C.cylinder("neck", 0.055, 0.12, (0, CY - 0.01, 1.06), skin, verts=24)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.105, location=(0, CY - 0.01, 1.25))
head = bpy.context.object
head.scale = (0.92, 1.0, 1.08)
head.data.materials.append(skin)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=0.118, location=(0, CY - 0.03, 1.28))
hr = bpy.context.object
hr.scale = (0.95, 1.02, 1.0)
disp = hr.modifiers.new("d", "DISPLACE")
tx = bpy.data.textures.new("hairnoise", "CLOUDS")
tx.noise_scale = 0.03
disp.texture = tx
disp.strength = 0.018
hr.data.materials.append(hair)
for p in hr.data.polygons:
    p.use_smooth = True

scene_objs = set(o.name for o in bpy.data.objects)

# ---- floating icons (original glyphs, no real brand marks)
ICON_SPEC = [
    ("play", (0.92, 0.16, 0.16), (-0.55, 0.9, 1.95), 0.26, "square"),
    ("heart", (0.95, 0.27, 0.48), (0.78, 0.5, 1.7), 0.24, "circle"),
    ("chat", (0.16, 0.45, 0.95), (-1.05, 0.2, 1.45), 0.22, "circle"),
    ("camera", (0.98, 0.5, 0.12), (0.25, 1.1, 2.25), 0.2, "square"),
    ("note", (0.55, 0.25, 0.85), (1.15, 0.9, 2.15), 0.2, "square"),
    ("bell", (0.98, 0.78, 0.12), (-1.25, 1.0, 2.25), 0.18, "circle"),
    ("star", (0.18, 0.75, 0.42), (1.2, 0.0, 1.25), 0.2, "square"),
    ("scissors", (0.1, 0.65, 0.7), (-0.35, -0.1, 1.7), 0.2, "square"),
    ("play", (0.12, 0.12, 0.13), (0.55, -0.35, 2.0), 0.17, "circle"),
    ("heart", (0.92, 0.2, 0.25), (-0.95, 1.2, 1.15), 0.16, "square"),
    ("chat", (0.2, 0.75, 0.35), (0.95, 1.3, 1.05), 0.17, "circle"),
    ("note", (0.12, 0.12, 0.13), (-1.4, -0.4, 1.9), 0.18, "circle"),
]
for k, (kind, col, loc, size, shape) in enumerate(ICON_SPEC):
    yaw = math.atan2(loc[0] - 0.0, loc[1] + 2.25) * 0.8
    K.icon(f"i{k}", kind, loc, size=size * 1.3, color=col, shape=shape,
           rot=(math.radians(random.uniform(-8, 8)), math.radians(random.uniform(-12, 12)), -yaw))
icon_objs = set(o.name for o in bpy.data.objects) - scene_objs

C.world((0.006, 0.007, 0.004))
C.area((0, -2.6, 2.6), (0, 1.5, 1.2), 25, (3, 1), (0.85, 0.95, 0.7), "RECTANGLE", name="fill", reflect=False)
C.dust(400, ((-1.8, 1.8), (-1.5, 1.5), (0.3, 2.6)), size=0.0013, frames=(1, 2))

cam = C.camera("cam", [(1, (0.0, -2.45, 1.35), (0.0, 1.6, 1.35))], lens=26, fstop=2.8, handheld=0.0)
C.sc.camera = cam
C.render_settings(frames=(1, 1), res=(1296, 2304), fps=30, samples=72, motion_blur=False)
C.compositor(bloom_mix=-0.65, bloom_threshold=0.8, bloom_size=8, distortion=-0.012, dispersion=0.01)

if ICONS:
    for o in bpy.data.objects:
        if o.type == "MESH" and o.name not in icon_objs:
            o.is_holdout = True
    C.sc.render.film_transparent = True
    C.sc.use_nodes = False  # the bloom/lens compositor drops alpha
C.save()

"""Ad 3 'THE WALL': dark gallery, a wall of stacked vintage TVs, warm ceiling spots, glossy concrete floor.
CAM=close (env) renders the close-up camera on one central TV instead of the wide shot."""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common as K  # noqa: E402
C = K.C

C.reset(seed=21)
random.seed(21)
CLOSE = os.environ.get("CAM", "wide") == "close"

wall_m = C.mat("wall", (0.025, 0.024, 0.023), 0.9)
floor_m = C.mat("concrete", (0.08, 0.078, 0.075), 0.32)
C.add_wear(floor_m, (0.08, 0.078, 0.075), 0.32, grime=0.25, micro_bump=0.08, scale=3.0)
C.room(wall_m, floor_m, size=(9, 12, 4.2), window=dict(back_y=0.9, left_x=-3.4, right_x=3.4, front_y=-5.2))

styles = ["black", "charcoal", "silver", "wood", "beige", "cream", "black", "wood", "silver", "red"]
X0, X1 = -2.55, 2.55
z = 0.0
row = 0
hero = None
while z < 3.35:
    rh = random.uniform(0.40, 0.58)
    x = X0
    while x < X1 - 0.2:
        layout = random.choice(["side", "bottom"])
        w = min(X1 - x, rh / (0.80 if layout == "side" else 0.86) * random.uniform(0.78, 0.98))
        if w < 0.3:
            break
        h = w * (0.80 if layout == "side" else 0.86)
        cx = x + w / 2
        on = random.random() < 0.78
        name = f"r{row}_{int((x - X0) * 100)}"
        is_hero = row == 3 and hero is None and cx > -0.35
        if is_hero:
            on = True
        e, scr = K.tv(name, (cx, random.uniform(-0.04, 0.04), z), w=w * 0.97, style=random.choice(styles), layout=layout,
                      rot_z=math.radians(random.uniform(-3, 3)), on=on)
        if is_hero:
            hero = (cx, z + h * 0.55, w)
        x += w + random.uniform(0.01, 0.05)
    z += rh + 0.025
    row += 1

# ceiling track spots: visible fixtures + warm cones grazing the wall from above
fix_m = C.mat("fixture", (0.02, 0.02, 0.02), 0.4)
for sx in (-1.8, -0.6, 0.6, 1.8):
    C.box("track", (0.06, 0.06, 0.06), (sx, -0.9, 4.05), fix_m, bevel=0.01)
    can = C.cylinder(f"can{sx}", 0.06, 0.18, (sx, -0.9, 3.85), fix_m, verts=32)
    can.rotation_euler = (math.radians(30), 0, 0)
    C.practical_bulb((sx, -0.84, 3.82), 0.03, 30.0, (1.0, 0.85, 0.65), name=f"lens{sx}")
    C.spot((sx, -0.84, 3.8), (sx * 0.9, 0.0, 1.2), 900, (1.0, 0.82, 0.62), cone_deg=34, blend=0.6, radius=0.03, name=f"spot{sx}")
C.box("track_bar", (5.0, 0.05, 0.04), (0, -0.9, 4.12), fix_m)

C.world((0.004, 0.004, 0.005))
C.area((0, -4.4, 2.6), (0, 0, 1.4), 60, (4, 1.5), (0.6, 0.7, 1.0), "RECTANGLE", name="fill", reflect=False)
C.dust(500, ((-2.5, 2.5), (-2.0, -0.2), (0.2, 3.6)), size=0.0016, frames=(1, 2))

if CLOSE:
    hx, hz, hw = hero
    cam = C.camera("cam", [(1, (hx + 0.05, -1.25, hz + 0.02), (hx, -0.1, hz))], lens=50, fstop=2.0, handheld=0.0)
else:
    cam = C.camera("cam", [(1, (0.0, -4.25, 1.62), (0.0, 0.0, 1.72))], lens=27, fstop=5.6, handheld=0.0)
C.sc.camera = cam
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "hero.txt"), "w").write(repr(hero))
C.render_settings(frames=(1, 1), res=(1296, 2304) if CLOSE else (1620, 2880), fps=30, samples=64 if not CLOSE else 80, motion_blur=False)
C.compositor(bloom_mix=-0.7, bloom_threshold=0.85, bloom_size=8, distortion=-0.01, dispersion=0.008)
C.save()

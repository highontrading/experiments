"""Shared Blender pieces for the Vibe Editor ads: a detailed retro CRT TV, a seamless studio sweep,
original 3D app-style icons, and the screen ID / corner export used by the 2D compositor."""
import json
import math
import os
import random
import sys

import bmesh
import bpy
from bpy_extras.object_utils import world_to_camera_view

sys.path.insert(0, os.environ["CINE_LIB"])
import cine as C  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
GLOW = os.path.join(HERE, "assets", "screen_glow.png")

_MATS = {}


def mats():
    if _MATS:
        return _MATS
    _MATS.update({
        "black": C.mat("tv_black", (0.014, 0.014, 0.016), 0.55, **{"Specular IOR Level": 0.22, "Coat Weight": 0.08, "Coat Roughness": 0.35}),
        "charcoal": C.mat("tv_charcoal", (0.03, 0.03, 0.033), 0.55, **{"Specular IOR Level": 0.25}),
        "silver": C.plastic("tv_silver", (0.50, 0.50, 0.50), 0.33, 0.08),
        "beige": C.plastic("tv_beige", (0.68, 0.62, 0.52), 0.45, 0.14),
        "cream": C.plastic("tv_cream", (0.78, 0.74, 0.66), 0.42, 0.12),
        "wood": C.plastic("tv_wood", (0.20, 0.10, 0.045), 0.38, 0.18),
        "red": C.plastic("tv_red", (0.35, 0.05, 0.04), 0.4, 0.12),
        "recess": C.mat("tv_recess", (0.012, 0.012, 0.014), 0.6),
        "knob": C.plastic("tv_knob", (0.05, 0.05, 0.05), 0.35, 0.05),
        "chrome": C.metal("tv_chrome", (0.75, 0.75, 0.76), 0.18),
        "grille": C.mat("tv_grille", (0.02, 0.02, 0.022), 0.7),
        "led": C.emission_mat("tv_led", (1.0, 0.15, 0.08), 6.0),
        "screen": C.screen_mat("tv_screen", GLOW, 1.4),
        "screen_off": C.mat("tv_screen_off", (0.03, 0.035, 0.035), 0.06, **{"Coat Weight": 1.0, "Coat Roughness": 0.03}),
    })
    return _MATS


def _parent(objs, empty):
    for o in objs:
        o.parent = empty


def tv(name, loc, w=0.5, style="black", rot_z=0.0, layout=None, on=True, tilt=0.0, antenna=False):
    """Retro CRT television, front facing -Y, base centred at loc. Returns (empty, screen_object).
    layout: 'side' (controls + speaker to the right of the tube) or 'bottom' (control strip under it)."""
    M = mats()
    layout = layout or random.choice(["side", "bottom"])
    body = M.get(style, M["black"])
    trim = M["silver"] if style == "wood" else (M["charcoal"] if style in ("black", "silver", "beige", "cream", "red") else M["black"])
    h = w * (0.80 if layout == "side" else 0.86)
    d = w * 0.82
    parts = []
    cz = h / 2
    parts.append(C.box(f"{name}_front", (w, 0.07 * w, h), (0, -0.035 * w, cz), body, bevel=0.035 * w, seg=4))
    parts.append(C.tapered_box(f"{name}_rear", (w * 0.96, h * 0.95), (w * 0.55, h * 0.55), d * 0.85, (0, 0.0, cz), body,
                               back_dz=-0.04 * h, bevel=0.05 * w))
    if layout == "side":
        sw, sh = 0.66 * w, 0.66 * h
        sx, sz = -0.12 * w, cz + 0.02 * h
    else:
        sw, sh = 0.80 * w, 0.66 * h
        sx, sz = 0.0, cz + 0.09 * h
    # tube surround: dark recess + trim ring, then the curved glass
    parts.append(C.box(f"{name}_trim", (sw + 0.07 * w, 0.02 * w, sh + 0.07 * w), (sx, -0.075 * w, sz), trim, bevel=0.03 * w, seg=4))
    parts.append(C.box(f"{name}_recess", (sw + 0.025 * w, 0.02 * w, sh + 0.025 * w), (sx, -0.083 * w, sz), M["recess"], bevel=0.02 * w))
    scr = C.panel(f"SCR_{name}", (sw, sh), (sx, -0.094 * w, sz), m=M["screen"] if on else M["screen_off"], bulge=0.035 * w, res=24)
    parts.append(scr)
    if layout == "side":
        px = 0.36 * w
        for k, zz in enumerate((cz + 0.24 * h, cz + 0.05 * h)):
            kn = C.cylinder(f"{name}_knob{k}", 0.045 * w, 0.03 * w, (px, -0.07 * w, zz), M["knob"], verts=32, bevel=0.004 * w)
            kn.rotation_euler = (math.radians(90), 0, 0)
            kn.location = (px, -0.07 * w, zz)
            parts.append(kn)
            parts.append(C.box(f"{name}_knobmark{k}", (0.006 * w, 0.004 * w, 0.03 * w), (px, -0.102 * w, zz + 0.02 * w), M["chrome"]))
        for i in range(7):
            parts.append(C.box(f"{name}_grille{i}", (0.13 * w, 0.006 * w, 0.012 * w), (px, -0.071 * w, cz - 0.12 * h - i * 0.025 * w),
                               M["grille"], bevel=0.002 * w))
        parts.append(C.box(f"{name}_led", (0.012 * w, 0.006 * w, 0.012 * w), (px - 0.05 * w, -0.072 * w, cz - 0.36 * h), M["led"]))
    else:
        bz = cz - 0.36 * h
        parts.append(C.box(f"{name}_strip", (0.80 * w, 0.012 * w, 0.075 * w), (0, -0.074 * w, bz), trim, bevel=0.01 * w))
        for i in range(6):
            parts.append(C.box(f"{name}_btn{i}", (0.05 * w, 0.012 * w, 0.025 * w), (0.06 * w + i * 0.058 * w, -0.082 * w, bz),
                               M["knob"], bevel=0.005 * w))
        kn = C.cylinder(f"{name}_dial", 0.03 * w, 0.025 * w, (-0.3 * w, -0.08 * w, bz), M["knob"], verts=32, bevel=0.004 * w)
        kn.rotation_euler = (math.radians(90), 0, 0)
        kn.location = (-0.3 * w, -0.08 * w, bz)
        parts.append(kn)
        parts.append(C.box(f"{name}_led", (0.012 * w, 0.006 * w, 0.012 * w), (-0.2 * w, -0.082 * w, bz), M["led"]))
    for fx in (-0.38 * w, 0.38 * w):
        parts.append(C.box(f"{name}_foot", (0.08 * w, 0.3 * w, 0.02 * w), (fx, 0.15 * w, 0.01 * w), M["knob"], bevel=0.004 * w))
    if antenna:
        for sgn in (-1, 1):
            a = C.cylinder(f"{name}_ant{sgn}", 0.004 * w, 0.9 * w, (0, 0.35 * w, h * 0.92), M["chrome"], verts=12, bevel=0)
            a.rotation_euler = (math.radians(-10), math.radians(sgn * 28), 0)
            a.location = (0, 0.35 * w, h * 0.92)
            parts.append(a)
    e = bpy.data.objects.new(f"TV_{name}", None)
    C.sc.collection.objects.link(e)
    _parent(parts, e)
    e.location = loc
    e.rotation_euler = (math.radians(tilt), 0, rot_z)
    scr["vibe_on"] = bool(on)
    return e, scr


def sweep(width=12.0, depth=10.0, height=8.0, radius=2.5, m=None, y0=1.5):
    """Seamless studio cyclorama: floor curving up into a back wall at y = y0 + radius."""
    me = bpy.data.meshes.new("sweep")
    bm = bmesh.new()
    prof = []
    for i in range(0, 8):
        prof.append((-depth + y0 + i * (depth / 8.0), 0.0))
    for i in range(0, 25):
        a = (math.pi / 2) * i / 24.0
        prof.append((y0 + radius * math.sin(a), radius - radius * math.cos(a)))
    for i in range(1, 10):
        prof.append((y0 + radius, radius + (height - radius) * i / 9.0))
    rows = []
    nx = 24
    for (yy, zz) in prof:
        rows.append([bm.verts.new((-width / 2 + width * k / nx, yy, zz)) for k in range(nx + 1)])
    for r in range(len(rows) - 1):
        for k in range(nx):
            bm.faces.new([rows[r][k], rows[r][k + 1], rows[r + 1][k + 1], rows[r + 1][k]])
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("sweep", me)
    C.sc.collection.objects.link(o)
    for p in o.data.polygons:
        p.use_smooth = True
    if m:
        o.data.materials.append(m)
    return o


# ------------------------------------------------------------------ original app-style icons (no real brand marks)
def icon(name, kind, loc, size=0.16, color=(0.9, 0.2, 0.2), rot=(0, 0, 0), shape="square"):
    """Glossy rounded app tile with a simple white 3D glyph. Returns the parent empty."""
    tile_m = C.mat(f"ic_{name}", color, 0.18, **{"Coat Weight": 1.0, "Coat Roughness": 0.05})
    white = C.mat(f"icw_{name}", (0.92, 0.92, 0.92), 0.25, **{"Coat Weight": 0.6})
    parts = []
    s = size
    if shape == "circle":
        t = C.cylinder(f"{name}_tile", s / 2, 0.22 * s, (0, 0, -0.11 * s), tile_m, verts=64, bevel=0.06 * s)
        t.rotation_euler = (math.radians(90), 0, 0)
        t.location = (0, 0, 0)
    else:
        t = C.box(f"{name}_tile", (s, 0.22 * s, s), (0, 0, 0), tile_m, bevel=0.22 * s, seg=6)
    parts.append(t)
    g = 0.115 * s  # glyph depth/2 offset
    if kind == "play":
        bpy.ops.mesh.primitive_cylinder_add(vertices=3, radius=0.26 * s, depth=0.06 * s, location=(0.04 * s, -g, 0),
                                            rotation=(math.radians(90), 0, math.radians(0)))
        o = bpy.context.object
        o.rotation_euler = (math.radians(90), math.radians(90), 0)
        o.data.materials.append(white)
        C._smooth_bevel(o, 0.02 * s, 3)
        parts.append(o)
    elif kind == "heart":
        for dx in (-0.1, 0.1):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.13 * s, location=(dx * s, -g, 0.06 * s))
            o = bpy.context.object
            o.scale = (1, 0.35, 1)
            o.data.materials.append(white)
            parts.append(o)
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.2 * s, depth=0.06 * s, location=(0, -g, -0.06 * s),
                                        rotation=(math.radians(90), 0, math.radians(45)))
        o = bpy.context.object
        o.scale = (1.05, 1, 1.25)
        o.data.materials.append(white)
        parts.append(o)
    elif kind == "chat":
        parts.append(C.box(f"{name}_bub", (0.52 * s, 0.06 * s, 0.38 * s), (0, -g, 0.04 * s), white, bevel=0.12 * s, seg=5))
        bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.09 * s, depth=0.06 * s, location=(-0.14 * s, -g, -0.18 * s),
                                        rotation=(math.radians(90), 0, 0))
        o = bpy.context.object
        o.data.materials.append(white)
        parts.append(o)
    elif kind == "camera":
        parts.append(C.box(f"{name}_body", (0.56 * s, 0.05 * s, 0.4 * s), (0, -g, -0.02 * s), white, bevel=0.1 * s, seg=4))
        lens = C.cylinder(f"{name}_lens", 0.12 * s, 0.08 * s, (0, 0, 0), tile_m, verts=48, bevel=0.01 * s)
        lens.rotation_euler = (math.radians(90), 0, 0)
        lens.location = (0, -g - 0.02 * s, -0.02 * s)
        parts.append(lens)
    elif kind == "note":
        stem = C.box(f"{name}_stem", (0.05 * s, 0.05 * s, 0.42 * s), (0.08 * s, -g, 0.04 * s), white, bevel=0.01 * s)
        flag = C.box(f"{name}_flag", (0.18 * s, 0.05 * s, 0.07 * s), (0.16 * s, -g, 0.22 * s), white, bevel=0.01 * s, rot=(0, math.radians(-25), 0))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1 * s, location=(-0.02 * s, -g, -0.17 * s))
        head = bpy.context.object
        head.scale = (1.25, 0.4, 0.9)
        head.data.materials.append(white)
        parts += [stem, flag, head]
    elif kind == "bell":
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.22 * s, radius2=0.07 * s, depth=0.34 * s, location=(0, -g, 0.02 * s))
        o = bpy.context.object
        o.scale = (1, 0.3, 1)
        o.data.materials.append(white)
        C._smooth_bevel(o, 0.03 * s, 3)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.05 * s, location=(0, -g, -0.2 * s))
        b2 = bpy.context.object
        b2.data.materials.append(white)
        parts += [o, b2]
    elif kind == "star":
        pts = []
        for k in range(10):
            r = (0.27 if k % 2 == 0 else 0.11) * s
            a = math.pi / 2 + k * math.pi / 5
            pts.append((r * math.cos(a), r * math.sin(a)))
        me = bpy.data.meshes.new(f"{name}_star")
        bm = bmesh.new()
        vs = [bm.verts.new((x, 0, z)) for x, z in pts]
        f = bm.faces.new(vs)
        r = bmesh.ops.extrude_face_region(bm, geom=[f])
        bmesh.ops.translate(bm, vec=(0, 0.05 * s, 0), verts=[v for v in r["geom"] if isinstance(v, bmesh.types.BMVert)])
        bm.normal_update()
        bm.to_mesh(me)
        bm.free()
        o = bpy.data.objects.new(f"{name}_star", me)
        C.sc.collection.objects.link(o)
        o.location = (0, -g - 0.05 * s, 0)
        o.data.materials.append(white)
        C._smooth_bevel(o, 0.012 * s, 2)
        parts.append(o)
    elif kind == "scissors":
        for sgn in (-1, 1):
            parts.append(C.box(f"{name}_blade{sgn}", (0.06 * s, 0.04 * s, 0.4 * s), (0, -g, 0.05 * s), white, bevel=0.015 * s,
                               rot=(0, math.radians(sgn * 22), 0)))
            ringo = C.cylinder(f"{name}_ring{sgn}", 0.075 * s, 0.04 * s, (0, 0, 0), white, verts=32, hollow=0.025 * s)
            ringo.rotation_euler = (math.radians(90), 0, 0)
            ringo.location = (sgn * 0.1 * s, -g + 0.02 * s, -0.2 * s)
            parts.append(ringo)
    e = bpy.data.objects.new(f"ICON_{name}", None)
    C.sc.collection.objects.link(e)
    _parent(parts, e)
    e.location = loc
    e.rotation_euler = rot
    return e


# ------------------------------------------------------------------ export for the 2D compositor
def screens():
    return [o for o in bpy.data.objects if o.name.startswith("SCR_")]


def export_screens(path):
    """Projected corners (pixel coords, origin top-left) of every screen for the active camera."""
    sc = C.sc = bpy.context.scene
    bpy.context.view_layer.update()
    cam = sc.camera
    W = sc.render.resolution_x * sc.render.resolution_percentage / 100
    H = sc.render.resolution_y * sc.render.resolution_percentage / 100
    out = {}
    for o in screens():
        me = o.data
        pts = []
        for v in me.vertices:
            co = o.matrix_world @ v.co
            p = world_to_camera_view(sc, cam, co)
            pts.append((p.x * W, (1 - p.y) * H, p.z))
        if not pts or min(p[2] for p in pts) <= 0:
            continue
        tl = min(pts, key=lambda p: p[0] + p[1])
        br = max(pts, key=lambda p: p[0] + p[1])
        tr = max(pts, key=lambda p: p[0] - p[1])
        bl = min(pts, key=lambda p: p[0] - p[1])
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        if not (-200 < cx < W + 200 and -200 < cy < H + 200):
            continue
        out[o.name] = {"corners": [list(tl[:2]), list(tr[:2]), list(br[:2]), list(bl[:2])], "center": [cx, cy],
                       "on": bool(o.get("vibe_on", True)), "depth": sum(p[2] for p in pts) / len(pts)}
    json.dump({"W": W, "H": H, "screens": out}, open(path, "w"), indent=1)
    print("SCREENS", len(out), path)


def id_render(path, samples=1):
    """Flat ID image: every screen an exact unique colour, everything else black (occlusion kept)."""
    sc = C.sc = bpy.context.scene
    black = C.emission_mat("id_black", (0, 0, 0), 0.0)
    ids = {}
    for k, o in enumerate(sorted(screens(), key=lambda o: o.name)):
        r, g, b = ((k + 1) * 37 % 256) / 255.0, ((k + 1) * 91 % 256) / 255.0, ((k + 1) * 173 % 256) / 255.0
        m = C.emission_mat(f"id_{o.name}", (r, g, b), 1.0)
        o.data.materials.clear()
        o.data.materials.append(m)
        ids[o.name] = [round(r * 255), round(g * 255), round(b * 255)]
    for o in bpy.data.objects:
        if o.type in ("MESH", "CURVE") and not o.name.startswith("SCR_"):
            o.data.materials.clear()
            o.data.materials.append(black)
            if o.type == "MESH":
                for ps in o.particle_systems:
                    pass
        if o.type == "LIGHT":
            o.hide_render = True
    sc.world = None
    sc.cycles.samples = samples
    sc.cycles.use_denoising = False
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.filter_width = 0.01
    sc.view_settings.view_transform = "Raw"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0
    sc.view_settings.gamma = 1
    sc.display_settings.display_device = "sRGB"
    sc.render.use_motion_blur = False
    sc.use_nodes = False
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "8"
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    json.dump(ids, open(path.replace(".png", "_ids.json"), "w"), indent=1)
    print("IDS", len(ids), path)

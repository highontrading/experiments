"""Ad 4 'DREAM': a grassy hill under an open midday sky, a soft volumetric cloud floating above it with a retro
TV sitting on top, a wooden ladder leaning up to the cloud, wildflowers in the grass (original surreal scene)."""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import bpy  # noqa: E402
import common as K  # noqa: E402
C = K.C

HERE = os.path.dirname(os.path.abspath(__file__))
C.reset(seed=9)
random.seed(9)

C.world(hdri=os.path.join(HERE, "assets", "hdri", "kloofendal_48d_partly_cloudy_puresky.exr"), hdri_rot=math.radians(140), strength=1.15)
C.sun((-0.55, 0.7, -0.55), energy=3.2, color=(1.0, 0.93, 0.82), angle_deg=1.5)

# ---- hill (smooth mound) with grass texture + hair grass + flowers
bpy.ops.mesh.primitive_grid_add(x_subdivisions=160, y_subdivisions=160, size=40)
hill = bpy.context.object
hill.name = "hill"
for v in hill.data.vertices:
    x, y = v.co.x, v.co.y
    v.co.z = 1.25 * math.exp(-((x - 0.4) ** 2 / 30 + (y - 0.5) ** 2 / 12)) - 0.02 * (x * x + y * y) / 40
for p in hill.data.polygons:
    p.use_smooth = True
soil = C.pbr("soil", os.path.join(HERE, "assets", "tex", "tex", "grass_ground"), 1.5, bump=0.4, tint=(0.55, 0.75, 0.35))
hill.data.materials.append(soil)
grass_m = C.mat("grass", (0.10, 0.24, 0.035), 0.55, **{"Subsurface Weight": 0.15})
nt = grass_m.node_tree
hi = nt.nodes.new("ShaderNodeHairInfo")
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.06, 0.16, 0.02, 1)
ramp.color_ramp.elements[1].color = (0.32, 0.42, 0.10, 1)
nt.links.new(hi.outputs["Random"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
hill.data.materials.append(grass_m)

ps = hill.modifiers.new("grass", "PARTICLE_SYSTEM").particle_system
st = ps.settings
st.type = "HAIR"
st.count = 160000
st.hair_length = 0.085
st.use_advanced_hair = True
st.material = 2
st.child_type = "INTERPOLATED"
st.child_percent = 6
st.rendered_child_count = 6
st.child_length = 0.9
st.child_length_threshold = 0.3
st.roughness_2 = 0.08
st.roughness_endpoint = 0.04
st.kink = "NO"
st.root_radius = 0.004
st.tip_radius = 0.0
st.radius_scale = 1.0
st.factor_random = 0.25
st.brownian_factor = 0.01
st.use_rotations = True
st.phase_factor_random = 1.0

# dandelion-like flowers
yellow = C.mat("petal", (0.95, 0.68, 0.06), 0.45, **{"Subsurface Weight": 0.3})
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035, segments=16, ring_count=8, location=(0, 0, -50))
fl = bpy.context.object
fl.name = "flower"
fl.scale = (1.4, 1.4, 0.55)
bpy.ops.object.transform_apply(scale=True)
for v in fl.data.vertices:
    v.co.z += 0.075
fl.data.materials.append(yellow)
ps2 = hill.modifiers.new("flowers", "PARTICLE_SYSTEM").particle_system
f2 = ps2.settings
f2.type = "HAIR"
f2.count = 3000
f2.hair_length = 0.18
f2.render_type = "OBJECT"
f2.instance_object = fl
f2.particle_size = 1.0
f2.size_random = 0.5
f2.use_rotation_instance = True
ps2.seed = 3

# ---- the cloud (volumetric) with a TV sitting on it
CX, CY, CZ = 0.1, 0.7, 2.75
cloud_m = bpy.data.materials.new("cloud")
cloud_m.use_nodes = True
n = cloud_m.node_tree.nodes
l = cloud_m.node_tree.links
for nd in list(n):
    if nd.type == "BSDF_PRINCIPLED":
        n.remove(nd)
vol = n.new("ShaderNodeVolumePrincipled")
vol.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1)
vol.inputs["Anisotropy"].default_value = 0.5
noise = n.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 2.2
noise.inputs["Detail"].default_value = 8
noise.inputs["Roughness"].default_value = 0.6
grad = n.new("ShaderNodeTexGradient")
grad.gradient_type = "SPHERICAL"
mapn = n.new("ShaderNodeMapping")
tc = n.new("ShaderNodeTexCoord")
l.new(tc.outputs["Object"], mapn.inputs["Vector"])
l.new(mapn.outputs["Vector"], grad.inputs["Vector"])
l.new(tc.outputs["Object"], noise.inputs["Vector"])
mul = n.new("ShaderNodeMath")
mul.operation = "MULTIPLY"
l.new(grad.outputs["Fac"], mul.inputs[0])
l.new(noise.outputs["Fac"], mul.inputs[1])
rmp = n.new("ShaderNodeValToRGB")
rmp.color_ramp.elements[0].position = 0.18
rmp.color_ramp.elements[0].color = (0, 0, 0, 1)
rmp.color_ramp.elements[1].position = 0.32
rmp.color_ramp.elements[1].color = (1, 1, 1, 1)
l.new(mul.outputs[0], rmp.inputs["Fac"])
dm = n.new("ShaderNodeMath")
dm.operation = "MULTIPLY"
dm.inputs[1].default_value = 10.0
l.new(rmp.outputs["Color"], dm.inputs[0])
l.new(dm.outputs[0], vol.inputs["Density"])
l.new(vol.outputs[0], n["Material Output"].inputs["Volume"])
for (dx, dy, dz, r) in ((0, 0, 0, 0.95), (-0.75, 0.1, -0.12, 0.7), (0.78, -0.05, -0.08, 0.72), (0.3, 0.2, 0.35, 0.6),
                        (-0.35, -0.1, 0.32, 0.55), (0.0, -0.25, -0.3, 0.7), (1.25, 0.15, -0.2, 0.45), (-1.2, 0.05, -0.25, 0.45)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=r, location=(CX + dx, CY + dy, CZ + dz))
    o = bpy.context.object
    o.name = "cloud"
    o.scale = (1.0, 0.85, 0.72)
    o.data.materials.append(cloud_m)
    o.visible_shadow = True

K.tv("dream", (CX + 0.05, CY - 0.1, CZ + 0.5), w=0.62, style="cream", layout="side", rot_z=math.radians(-12), on=True, antenna=True)

# ---- wooden ladder leaning from the hill up to the cloud
wood = C.mat("ladder", (0.45, 0.33, 0.21), 0.6)
C.add_wear(wood, (0.45, 0.33, 0.21), 0.6, grime=0.2, micro_bump=0.05, scale=8)
base = (CX + 1.35, CY - 0.6, 1.05)
top = (CX + 0.85, CY - 0.35, CZ - 0.05)
L_ = math.dist(base, top)
ang = math.atan2(top[0] - base[0], top[2] - base[2])
lad = []
for sx in (-0.22, 0.22):
    lad.append(C.box("rail", (0.05, 0.035, L_), (sx, 0, L_ / 2), wood, bevel=0.006))
for k in range(9):
    lad.append(C.box("rung", (0.44, 0.03, 0.035), (0, 0, 0.25 + k * (L_ - 0.4) / 8), wood, bevel=0.005))
le = bpy.data.objects.new("ladder", None)
C.sc.collection.objects.link(le)
for o in lad:
    o.parent = le
le.location = base
le.rotation_euler = (0, ang, math.radians(-20))

# ---- an orange jacket dropped in the grass (story detail, like someone climbed up)
jac = C.mat("jacket", (0.75, 0.25, 0.05), 0.7)
C.box("jacket", (0.4, 0.3, 0.1), (CX - 1.2, CY - 1.4, 0.98), jac, bevel=0.06, seg=4, rot=(math.radians(8), math.radians(-14), math.radians(30)))

cam = C.camera("cam", [(1, (-0.55, -5.8, 1.35), (0.25, 0.6, 2.35))], lens=32, fstop=8.0, handheld=0.0)
C.sc.camera = cam
C.render_settings(frames=(1, 1), res=(1296, 2304), fps=30, samples=96, motion_blur=False, look="AgX - Base Contrast")
C.sc.cycles.volume_step_rate = 2.0
C.compositor(bloom_mix=-0.8, bloom_threshold=1.2, bloom_size=7, distortion=-0.006, dispersion=0.006)
C.save()

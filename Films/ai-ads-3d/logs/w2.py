p='engine/world.mjs'; s=open(p).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
rep("const fp = [st2.x + nx * 0.62 - tx * 0.42, BELT.y + 0.62, st2.z + nz * 0.62 - tz * 0.42], fl = [st2.x, BELT.y + 0.3, st2.z];",
    "const fp = [st2.x + nx * 0.42 - tx * 0.28, BELT.y + 0.5, st2.z + nz * 0.42 - tz * 0.28], fl = [st2.x, BELT.y + 0.3, st2.z];")
rep("sh0.fov = lerp(sh0.fov, 30, wF);","sh0.fov = lerp(sh0.fov, 26, wF);")
rep("    [31.2, [-0.6, 1.7, -11.4], [1.3, 1.1, -13.6], 40],","    [31.2, [2.9, 1.65, -11.5], [0.4, 1.25, -13.8], 40],")
rep("    [50, [0.6, 7.2, 6.8], [0, 0.4, 0], 34],","    [50, [-1.8, 4.6, 8.2], [0.2, 0.5, -0.6], 36],")
rep("    [55, [5.9, 1.55, 4.9], [8.1, 1.1, 2.4], 32],\n    [60, [6.4, 1.42, 4.35], [8.15, 1.08, 2.35], 30],","    [55, [6.3, 1.5, 4.2], [8.0, 1.12, 2.2], 32],\n    [60, [6.95, 1.36, 3.3], [7.95, 1.12, 2.05], 30],")
rep("export const BELT = { L: 6, R: 2.0, y: 0.52, v: 0.6 };","export const BELT = { L: 6, R: 2.0, y: 0.52, v: 0.85 };")
rep("  for (let j = 0; j < 38; j++) {","  for (let j = 0; j < 52; j++) {")
rep("T.boxes.push({ m, t0: 40.2 + j * 0.42,","T.boxes.push({ m, t0: 40.2 + j * 0.3,")
open(p,'w').write(s); print('ok')

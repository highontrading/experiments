import json
p='engine/world.mjs'; s=open(p).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
# 1. the phone fills half the frame: closer, lower, longer lens
rep("const lift = ease(t, 43.4, 46.0), fp = [st2.x + nx * (0.42 + 1.2 * lift) - tx * 0.28, BELT.y + 0.5 + 1.4 * lift, st2.z + nz * (0.42 + 1.2 * lift) - tz * 0.28]",
    "const lift = ease(t, 43.4, 46.0), fp = [st2.x + nx * (0.2 + 1.4 * lift) - tx * 0.1, BELT.y + 0.5 + 1.4 * lift, st2.z + nz * (0.2 + 1.4 * lift) - tz * 0.1]")
rep("sh0.fov = lerp(sh0.fov, 26, wF);","sh0.fov = lerp(sh0.fov, 22, wF);")
rep("const fl = [st2.x, BELT.y + 0.3, st2.z];","const fl = [st2.x, BELT.y + 0.27, st2.z];") if "const fl = [st2.x, BELT.y + 0.3, st2.z];" in s else None
s=s.replace("], fl = [st2.x, BELT.y + 0.3, st2.z];","], fl = [st2.x, BELT.y + 0.27, st2.z];")
# the phone screens brighter (they are the light in the shot)
rep("const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.15), new THREE.MeshBasicMaterial({ map: phoneOff }));",
    "const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.15), new THREE.MeshBasicMaterial({ map: phoneOff, color: new THREE.Color(1.6, 1.6, 1.6) }));")
# 2. a bag rides ahead of the camera into the flaps; a pool of light on the wall around the opening
rep("  T.arm = { yawG, sh, el, wr, tagHeld };","""  T.arm = { yawG, sh, el, wr, tagHeld };
  const lead = BAGS[3].g.clone(true); scene.add(lead); T.leadBag = lead;
  const wallPool = new THREE.SpotLight('#ffd9a6', 45, 9, 0.5, 0.7, 1.4); wallPool.position.set(0.4, 5.6, -4.2); wallPool.target.position.set(0, 1.6, -7.6); scene.add(wallPool, wallPool.target);""")
rep("    // the desk monitor wakes at 58.6 s: an advert for nobody, to an empty chair","""    // the lead bag: on the feed, going in ahead of the camera (15.5-21.6 s); gone behind the flaps after
    const lz = -2.6 - Math.max(0, t - 15.5) * 0.9; T.leadBag.visible = t > 15 && lz > -9.2;
    T.leadBag.position.set(0.02, 0.57, lz); T.leadBag.rotation.set(0, Math.PI / 2 + 0.05, 0);
    // the desk monitor wakes at 58.6 s: an advert for nobody, to an empty chair""")
# 3. the monitor holds one name, wakes at 57.0; an empty waiting chair in front of the desk
s=s.replace("58.6","57.0")
rep("    if (t >= 57.0) { const i = (4 + Math.floor((t - 57.0) / 1.5)) % 8; T.monitor.ad.offset.set((i % 4) * 0.25, 0.5 - Math.floor(i / 4) * 0.5); }\n","")
rep("  const chairSeat =","""  const wait = new THREE.Group(); wait.position.set(0.15, 0, 1.05); wait.rotation.y = Math.PI + 0.25; desk.add(wait);
  const wSeat = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.08, 0.46, 2, 0.03), seatMat); wSeat.position.y = 0.46; wSeat.castShadow = true; wait.add(wSeat);
  const wBack = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.52, 0.06, 2, 0.03), seatMat); wBack.position.set(0, 0.74, 0.21); wBack.rotation.x = -0.1; wBack.castShadow = true; wait.add(wBack);
  for (const lx of [-0.2, 0.2]) for (const lz of [-0.18, 0.18]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44), beamMat); leg.position.set(lx, 0.22, lz); wait.add(leg); }
  const chairSeat =""")
open(p,'w').write(s)
m='audio/mix.json'; d=json.load(open(m))
for l in d['layers']:
    if l['file'].endswith('buzz.wav') and abs(l['at']-58.6)<0.01: l['at']=57.0
    if l['file'].endswith('backhall.wav'): l['gain_db']=-1
json.dump(d,open(m,'w'),indent=1)
print('ok')

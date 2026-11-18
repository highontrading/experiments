p='engine/world.mjs'; s=open(p).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
# light and steel: less glare, slat seams, brushed island
rep("scene.environmentIntensity = 0.35;","scene.environmentIntensity = 0.22;")
rep("const NS = Math.round(P / 0.36), slatGeo = new RoundedBoxGeometry(0.4, 0.025, 0.9, 2, 0.01);","const NS = Math.round(P / 0.36), slatGeo = new RoundedBoxGeometry(0.31, 0.03, 0.88, 2, 0.012);")
rep("std('#7f878e', 0.38, 0.85), NS);","std('#646b71', 0.42, 0.85), NS);")
rep("const island = new THREE.Mesh(ext(ring(BR - 0.46, 0), 0.7, 0.18), std('#a9b1b8', 0.25, 0.95));","const island = new THREE.Mesh(ext(ring(BR - 0.46, 0), 0.62, 0.16), std('#6f777e', 0.34, 0.9, { roughnessMap: roughMap }));")
rep("const base = new THREE.Mesh(ext(ring(BR + 0.55, BR - 0.55), 0.42, 0.02), std('#3b3f43', 0.6, 0.5));","const base = new THREE.Mesh(ext(ring(BR + 0.55, BR - 0.55), 0.42, 0.02), std('#16181a', 0.7, 0.3));")
for a in ["const spotA = new THREE.SpotLight('#ffd7a8', 140,","const spotB = new THREE.SpotLight('#ffd7a8', 140,"]:
    rep(a, a.replace("140","95"))
# the hall closed on every side: right wall with doors, front wall with glass and EXIT, details of 3 a.m.
rep("  // columns\n","""  const wallR2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 22), wallMat); wallR2.position.set(12.2, 3.5, 3.3); wallR2.receiveShadow = true; scene.add(wallR2);
  const wallF = new THREE.Mesh(new THREE.BoxGeometry(24.8, 7, 0.4), wallMat); wallF.position.set(0, 3.5, 14.2); scene.add(wallF);
  for (const dx of [-3, 3]) { const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.8), std('#0a0d10', 0.05, 0.7)); door.position.set(dx, 1.4, 13.98); door.rotation.y = Math.PI; scene.add(door); }
  const exitS = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), glow(sign([{ s: 'EXIT', px: 90, y: 64, ink: '#ffffff' }], 512, 128, { bg: '#1d6b3f', align: 'center' }), 1.6)); exitS.position.set(0, 3.4, 13.98); exitS.rotation.y = Math.PI; scene.add(exitS);
  // 3 a.m. details: a vending machine humming, a wet-floor sign, a parked floor polisher, a line of trolleys
  const vend = new THREE.Group(); vend.position.set(11.6, 0, -3.5); vend.rotation.y = -Math.PI / 2; scene.add(vend);
  const vbody = new THREE.Mesh(new RoundedBoxGeometry(1.0, 1.9, 0.8, 2, 0.03), std('#202326', 0.4, 0.5)); vbody.position.y = 0.95; vbody.castShadow = true; vend.add(vbody);
  const vfront = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.3), glow(canvasTex(256, 460, (x, w, h) => { x.fillStyle = '#e8f1ff'; x.fillRect(0, 0, w, h); const r = rng(4); for (let j = 0; j < 6; j++) for (let k = 0; k < 4; k++) { x.fillStyle = ['#d6452f', '#1f7a5c', '#e2a72e', '#2f6f8f'][(j + k) % 4]; x.fillRect(20 + k * 58, 20 + j * 70, 40, 52); } }), 1.3));
  vfront.position.set(-0.08, 1.15, 0.41); vend.add(vfront);
  const vlight = new THREE.PointLight('#dfe9ff', 2.2, 5, 1.6); vlight.position.set(0, 1.2, 1.0); vend.add(vlight);
  const wet = new THREE.Group(); wet.position.set(4.6, 0, 3.6); wet.rotation.y = 0.6; scene.add(wet);
  for (const sgn of [-1, 1]) { const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.62, 0.015), std('#e8b821', 0.5)); leaf.position.set(0, 0.3, sgn * 0.09); leaf.rotation.x = sgn * 0.28; leaf.castShadow = true; wet.add(leaf); }
  const pol = new THREE.Group(); pol.position.set(-7.2, 0, 7.4); pol.rotation.y = 0.9; scene.add(pol);
  const pbody = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.45, 1.0, 3, 0.08), std('#2d5aa0', 0.45, 0.2)); pbody.position.y = 0.3; pbody.castShadow = true; pol.add(pbody);
  const phand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0), std('#222', 0.4, 0.6)); phand.position.set(0, 0.85, -0.55); phand.rotation.x = -0.5; pol.add(phand);
  const trolley = (x0, z0) => { const tg = new THREE.Group(); tg.position.set(x0, 0, z0); const frame = std('#9aa3ab', 0.25, 0.95);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.75), frame); deck.position.y = 0.18; tg.add(deck);
    const backF = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.03), frame); backF.position.set(0, 0.62, -0.37); tg.add(backF);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6), std('#c43d3d', 0.4)); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.08, -0.37); tg.add(bar); tg.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return tg; };
  for (let k = 0; k < 7; k++) scene.add(trolley(-10.5 + k * 0.32, -5.8));
  // columns
""")
# the hook: start a little higher, the bag ahead in frame, not filling it
rep("    [0, [-3.4, 0.74, 2.34], [0.2, 0.46, 2.0], 40],","    [0, [-3.6, 0.98, 2.62], [0.4, 0.5, 1.9], 40],")
rep("    [5, [1.4, 0.82, 2.36], [4.6, 0.5, 0.9], 40],","    [5, [1.2, 1.0, 2.66], [4.8, 0.6, 0.8], 40],")
rep("    [31.2, [0.6, 1.55, -12.4], [1.4, 0.95, -13.6], 38],","    [31.2, [-0.6, 1.7, -11.4], [1.3, 1.1, -13.6], 40],")
rep("    [40, [-1.4, 0.82, -2.42], [-3.6, 0.55, -1.0], 40],","    [40, [-1.4, 1.2, -2.9], [-3.6, 0.6, -1.0], 40],")
rep("    [55, [5.4, 1.75, 6.4], [8.0, 1.12, 2.3], 32],\n    [60, [6.0, 1.55, 5.5], [8.05, 1.08, 2.25], 30],","    [55, [5.9, 1.55, 4.9], [8.1, 1.1, 2.4], 32],\n    [60, [6.4, 1.42, 4.35], [8.15, 1.08, 2.35], 30],")
# 37.5-44.5 s: the camera rides beside one bag and watches its phone wake and buy
rep("    camera.lookAt(sh0.l[0], sh0.l[1], sh0.l[2]); camera.fov = sh0.fov; camera.updateProjectionMatrix();","""    const hb = T.bags[2], st2 = stadium(hb.s0 + BELT.v * t, hb.lane), wF = ease(t, 36.6, 38.0) * (1 - ease(t, 43.6, 45.0));
    if (wF > 0) {
      const nx = -Math.sin(st2.a), nz = Math.cos(st2.a), tx = Math.cos(st2.a), tz = Math.sin(st2.a);
      const fp = [st2.x + nx * 0.62 - tx * 0.42, BELT.y + 0.62, st2.z + nz * 0.62 - tz * 0.42], fl = [st2.x, BELT.y + 0.3, st2.z];
      camera.position.set(lerp(camera.position.x, fp[0], wF), lerp(camera.position.y, fp[1], wF), lerp(camera.position.z, fp[2], wF));
      sh0.l = sh0.l.map((v, j) => lerp(v, fl[j], wF)); sh0.fov = lerp(sh0.fov, 30, wF);
    }
    camera.lookAt(sh0.l[0], sh0.l[1], sh0.l[2]); camera.fov = sh0.fov; camera.updateProjectionMatrix();""")
# the desk: closer to the hall's light, the lamp and bell in the frame, a darker counter
rep("const desk = new THREE.Group(); desk.position.set(8.2, 0, 2.2); desk.rotation.y = -0.5;","const desk = new THREE.Group(); desk.position.set(8.2, 0, 2.2); desk.rotation.y = -0.9;")
rep("std('#d8d4cc', 0.5, 0.05)); counter.position.y = 0.525;","std('#5d5a55', 0.55, 0.1)); counter.position.y = 0.525;")
rep("const deskLight = new THREE.PointLight('#ffb46a', 3.5, 4, 1.8);","const deskLight = new THREE.PointLight('#ffb46a', 6, 5, 1.6);")
rep("deskLight.intensity = 3.5 * (1 + 0.03 * Math.sin(t * 9));","deskLight.intensity = 6 * (1 + 0.03 * Math.sin(t * 9));")
open(p,'w').write(s); print('ok')

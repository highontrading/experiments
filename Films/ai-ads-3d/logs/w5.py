p='engine/world.mjs'; s=open(p).read()
def rep(a,b):
    global s
    assert s.count(a)==1,a[:60]; s=s.replace(a,b)
# the ride-along camera does its own exit; the main path picks up exactly where it ends (46 s)
rep("""    const hb = T.bags[2], st2 = stadium(hb.s0 + BELT.v * t, hb.lane), wF = ease(t, 36.6, 38.0) * (1 - ease(t, 44.2, 46.0));
    if (wF > 0) {
      const nx = -Math.sin(st2.a), nz = Math.cos(st2.a), tx = Math.cos(st2.a), tz = Math.sin(st2.a);
      const lift = ease(t, 42.8, 45.2), fp = [st2.x + nx * (0.2 + 1.4 * lift) - tx * 0.1, BELT.y + 0.5 + 1.4 * lift, st2.z + nz * (0.2 + 1.4 * lift) - tz * 0.1], fl = [lerp(st2.x, 0, lift), lerp(BELT.y + 0.27, 0.95, lift), lerp(st2.z, -5.4, lift)];
      camera.position.set(lerp(camera.position.x, fp[0], wF), lerp(camera.position.y, fp[1], wF), lerp(camera.position.z, fp[2], wF));
      sh0.l = sh0.l.map((v, j) => lerp(v, fl[j], wF)); sh0.fov = lerp(sh0.fov, 22, wF);
    }""","""    const wF = t < FOLLOW_END ? ease(t, 36.6, 38.0) : 0;
    if (wF > 0) {
      const f = follow(t);
      camera.position.set(lerp(camera.position.x, f.p[0], wF), lerp(camera.position.y, f.p[1], wF), lerp(camera.position.z, f.p[2], wF));
      sh0.l = sh0.l.map((v, j) => lerp(v, f.l[j], wF)); sh0.fov = lerp(sh0.fov, f.fov, wF);
    }""")
rep("  const cr = (p0, p1, p2, p3, u) =>","""  // the ride-along: beside bag 2, its phone in frame; from 42.6 s it rises straight up and out, looking to the flaps
  const FOLLOW_END = 46;
  function follow(t) {
    const hb = BAGS[2], st = stadium(hb.s0 + BELT.v * t, hb.lane);
    const nx = -Math.sin(st.a), nz = Math.cos(st.a), tx = Math.cos(st.a), tz = Math.sin(st.a);
    const up = ease(t, 42.6, 44.6), out = ease(t, 43.6, 46.0), look = ease(t, 43.0, 45.4);
    const p = [st.x + nx * (0.3 + 1.6 * out) - tx * 0.12, BELT.y + 0.52 + 0.9 * up + 1.0 * out, st.z + nz * (0.3 + 1.6 * out) - tz * 0.12];
    const l = [lerp(st.x, 0, look), lerp(BELT.y + 0.27, 0.95, look), lerp(st.z, -5.4, look)];
    return { p, l, fov: lerp(25, 38, out) };
  }
  { const f = follow(FOLLOW_END); const k = KEYS.findIndex((k) => k[0] === 45.5); KEYS.splice(k, 1, [FOLLOW_END, f.p, f.l, f.fov]); }
  const cr = (p0, p1, p2, p3, u) =>""")
# ribbed hard shells: a texture of vertical ribs on every suitcase
rep("  for (let i = 0; i < 12; i++) {\n    const g = new THREE.Group(), w = 0.42","""  const ribs = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 9; k++) { const cx = (k + 0.5) * w / 9, g = x.createLinearGradient(cx - 26, 0, cx + 26, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(255,255,255,0.0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.22)'); g.addColorStop(0.62, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - 26, 0, 52, h); }
    const r = rng(21); for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(0,0,0,${r() * 0.05})`; x.fillRect(r() * w, r() * h, 2, 2); } });
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Group(), w = 0.42""")
rep("const shell = new THREE.Mesh(new RoundedBoxGeometry(w, h, l, 4, 0.06), std(bagCols[i], 0.38 + R() * 0.3, i % 4 === 3 ? 0.7 : 0.05));",
    "const shell = new THREE.Mesh(new RoundedBoxGeometry(w, h, l, 4, 0.06), std(bagCols[i], 0.38 + R() * 0.3, i % 4 === 3 ? 0.7 : 0.05, { map: ribs }));")
# a bigger desk display, so AHMET reads in the last frame
rep("const monBody = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.32, 0.03, 2, 0.01), std('#141516', 0.4, 0.5)); monBody.position.y = 0.26;",
    "const monBody = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.5, 0.035, 2, 0.012), std('#141516', 0.4, 0.5)); monBody.position.y = 0.36;")
rep("const monScr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.28), new THREE.MeshBasicMaterial({ map: phoneOff })); monScr.position.set(0, 0.26, 0.016);",
    "const monScr = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.46), new THREE.MeshBasicMaterial({ map: phoneOff, color: new THREE.Color(1.3, 1.3, 1.3) })); monScr.position.set(0, 0.36, 0.019);")
rep("monStand.position.y = 0.06;","monStand.position.y = 0.06; monStand.scale.y = 1.4;")
rep("    [63, [6.25, 1.45, 3.75], [7.55, 0.95, 2.05], 34],","    [63, [6.35, 1.42, 3.65], [7.6, 1.05, 2.05], 34],")
open(p,'w').write(s); print('ok')

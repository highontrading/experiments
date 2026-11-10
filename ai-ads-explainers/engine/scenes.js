// 3D set library. Each builder returns { scene, update(lt, dur, P), anchors, cam }.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { drawAd, drawDullAd, rr, PALETTES } from './ads.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const out3 = (x) => 1 - Math.pow(1 - x, 3);
const inOut = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const back = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
let seed = 11; const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
const phys = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, ...o });

function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (draw) draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.g = g; return t; }
function adTex(i, o, w = 384, h = 480) { return canvasTex(w, h, (g, W, H) => drawAd(g, W, H, i, o)); }
function stage(bg, fogNear, fogFar, env) {
  const s = new THREE.Scene(); s.background = new THREE.Color(bg); if (fogFar) s.fog = new THREE.Fog(bg, fogNear, fogFar);
  if (env) s.environment = env; return s;
}
function people(n, place, mat) {          // seated silhouettes: body + head as two instanced meshes
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.2, 0.34, 4, 10), mat, n);
  const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 16, 12), mat, n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { const [x, y, z, s = 1] = place(i); m.makeScale(s, s, s).setPosition(x, y + 0.36 * s, z); body.setMatrixAt(i, m); m.makeScale(s, s, s).setPosition(x, y + 0.84 * s, z); head.setMatrixAt(i, m); }
  const grp = new THREE.Group(); grp.add(body, head); return grp;
}

/* ================= ARENA: big screen, audience silhouettes ================= */
export function arena(env) {
  const s = stage('#06070b', 14, 40, env);
  const SW = 1024, SH = 576, tex = canvasTex(SW, SH);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(14, 7.875), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  screen.position.set(0, 5.6, -9); s.add(screen);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(14.5, 8.3, 0.3), std('#050506', { roughness: 0.9 })); frame.position.set(0, 5.6, -9.2); s.add(frame);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), std('#0b0b0e', { roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; s.add(floor);
  const crowdM = std('#0b0c11', { roughness: 0.75, metalness: 0.1 });
  const rows = 9, per = 24, seats = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < per; c++) seats.push([(c - per / 2 + 0.5) * 0.85 + (r % 2) * 0.4 + (rng() - 0.5) * 0.12, r * 0.42, 1 + r * 1.05, 0.95 + rng() * 0.12]);
  s.add(people(seats.length, (i) => seats[i], crowdM));
  // seat-back tiers
  for (let r = 0; r < rows; r++) { const tier = new THREE.Mesh(new THREE.BoxGeometry(24, 0.42 * (r + 1), 1.05), std('#0d0e12', { roughness: 0.9 })); tier.position.set(0, 0.21 * (r + 1) - 0.42, 1 + r * 1.05 + 0.3); s.add(tier); }
  const glow = new THREE.PointLight('#ffffff', 60, 0, 2); glow.position.set(0, 5.5, -6); s.add(glow);
  const sl = new THREE.DirectionalLight('#ffffff', 1.6); sl.position.set(0, 6, -9); sl.target.position.set(0, 0, 6); s.add(sl, sl.target);
  s.add(new THREE.HemisphereLight('#3a4560', '#000000', 0.25));
  const avg = new THREE.Color();
  function drawScreen(lt, P) {
    const g = tex.g, mode = P.screen ?? 'ad';
    g.save(); g.clearRect(0, 0, SW, SH);
    if (mode === 'court') {
      g.fillStyle = '#b4682c'; g.fillRect(0, 0, SW, SH);
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${90 + (i % 3) * 20},45,15,0.25)`; g.fillRect(0, i * 15, SW, 7); }
      g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 6; g.beginPath(); g.arc(SW / 2, SH * 0.55, 90, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(SW / 2, 0); g.lineTo(SW / 2, SH); g.stroke(); g.strokeRect(-10, SH * 0.25, 220, SH * 0.6); g.strokeRect(SW - 210, SH * 0.25, 220, SH * 0.6);
      const bx = SW / 2 + Math.sin(lt * 2.2) * 260, by = SH * 0.5 - Math.abs(Math.sin(lt * 4)) * 120;
      g.fillStyle = '#e8772e'; g.beginPath(); g.arc(bx, by, 26, 0, 7); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, SH - 70, SW, 70); g.fillStyle = '#fff'; g.font = '800 34px Inter'; g.fillText('FINALS  ·  GAME 3', 30, SH - 24);
      g.fillStyle = '#F5C561'; g.textAlign = 'right'; g.fillText('AD BREAK ▶', SW - 30, SH - 24); g.textAlign = 'left';
    } else if (mode === 'holiday') {
      const sk = g.createLinearGradient(0, 0, 0, SH); sk.addColorStop(0, '#0d1630'); sk.addColorStop(1, '#2a3355'); g.fillStyle = sk; g.fillRect(0, 0, SW, SH);
      g.fillStyle = '#e9eef7'; g.fillRect(0, SH * 0.72, SW, SH);
      for (let i = 0; i < 70; i++) { const x = (i * 137 + lt * 30 * (1 + i % 3)) % SW, y = (i * 71 + lt * 60 * (1 + i % 2)) % SH; g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(x, y, 2 + i % 3, 0, 7); g.fill(); }
      const tx = 120 + (lt * 120) % (SW + 300) - 300; g.fillStyle = '#b3261e'; rr(g, tx, SH * 0.48, 330, 130, 12); g.fill(); g.fillStyle = '#8a1c16'; rr(g, tx + 330, SH * 0.53, 110, 100, 10); g.fill();
      for (let i = 0; i < 9; i++) { g.fillStyle = ['#ffd66b', '#ff9d6b', '#fff3c4'][i % 3]; g.beginPath(); g.arc(tx + 18 + i * 37, SH * 0.48 + 8, 6, 0, 7); g.fill(); }
      g.fillStyle = '#111'; for (const dx of [60, 260, 390]) { g.beginPath(); g.arc(tx + dx, SH * 0.71, 26, 0, 7); g.fill(); }
      g.fillStyle = '#ffd66b'; g.beginPath(); g.arc(tx + 445, SH * 0.62, 12, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '800 46px Inter'; g.textAlign = 'center'; g.fillText('THE HOLIDAYS ARE HERE', SW / 2, 80); g.textAlign = 'left';
    } else if (mode === 'dull') { drawDullAd(g, SW, SH); }
    else { g.fillStyle = '#101218'; g.fillRect(0, 0, SW, SH); const cw = 300, ch = 520, gap = 30, x0 = (SW - 3 * cw - 2 * gap) / 2, slide = (lt * 40) % (cw + gap);
      for (let j = -1; j < 4; j++) { g.save(); g.translate(x0 + j * (cw + gap) - slide + (cw + gap) / 2, 28); g.beginPath(); g.rect(0, 0, cw, ch); g.clip(); g.scale(cw / 320, ch / 554);
        drawAd(g, 320, 554, (P.ad ?? 2) + j + 10, j === 1 ? { kind: P.kind, head: P.head } : {}); g.restore(); } }
    if (P.static) { const k = P.static(lt); if (k > 0) { for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.5 * k * ((i * 7919 + Math.floor(lt * 30) * 31) % 10) / 10})`; g.fillRect(((i * 523 + Math.floor(lt * 30) * 97) % SW), ((i * 211 + Math.floor(lt * 30) * 53) % SH), 30 + i % 50, 3); } } }
    g.restore(); tex.needsUpdate = true;
    const px = g.getImageData(SW / 2, SH / 2, 1, 1).data; avg.setRGB(px[0] / 255, px[1] / 255, px[2] / 255);
  }
  return {
    scene: s, anchors: { screen: V(0, 5.6, -9), screenTop: V(0, 9.8, -9) },
    cam: { p0: [0, 6.0, 15], p1: [0, 6.2, 12.5], l0: [0, 5.0, -9], l1: [0, 5.2, -9], fov: 42 },
    update(lt, dur, P) { drawScreen(lt, P); const k = P.dim ? 1 - P.dim(lt) : 1; screen.material.color.setScalar(k); glow.color.copy(avg).lerp(new THREE.Color('#ffffff'), 0.4); glow.intensity = 60 * k; sl.color.copy(glow.color); sl.intensity = 1.6 * k; },
  };
}

/* ================= STUDIO: agency floor, desks, monitors, people ================= */
const UI_KINDS = 8;
function drawUI(g, w, h, i) {
  g.fillStyle = '#0f1218'; g.fillRect(0, 0, w, h);
  const a = ['#F5C561', '#6BD8F3', '#E8675C', '#8ee3a1', '#b79bff'][i % 5];
  if (i % 4 === 0) { // timeline
    for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) { g.fillStyle = r % 2 ? 'rgba(107,216,243,0.6)' : 'rgba(245,197,97,0.6)'; g.fillRect(10 + k * 40 + (r * 13) % 20, h * 0.45 + r * 14, 30, 10); }
    g.fillStyle = '#2a2f3a'; g.fillRect(10, 10, w - 20, h * 0.38); g.fillStyle = a; g.fillRect(w * 0.6, h * 0.42, 2, h * 0.55);
  } else if (i % 4 === 1) { // viewport
    g.fillStyle = '#2b2f36'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.12)'; for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(0, h * 0.5 + k * 8); g.lineTo(w, h * 0.5 + k * 8); g.stroke(); }
    g.fillStyle = '#c9ccd2'; g.beginPath(); g.arc(w / 2, h * 0.45, h * 0.18, 0, 7); g.fill();
  } else if (i % 4 === 2) { // chart
    for (let k = 0; k < 10; k++) { const bh = (0.2 + ((k * 37 + i * 11) % 10) / 13) * h * 0.7; g.fillStyle = a; g.fillRect(14 + k * (w - 28) / 10, h - 14 - bh, (w - 28) / 10 - 6, bh); }
  } else { g.save(); g.scale(w / 512, h / 640); drawAd(g, 512, 640, i); g.restore(); }
}
export function studio(env) {
  const s = stage('#07080c', 9, 34, env);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), std('#15161b', { roughness: 0.55, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; s.add(floor);
  s.add(new THREE.HemisphereLight('#8a9abd', '#1a1410', 1.1));
  const key = new THREE.DirectionalLight('#ffe2bf', 1.8); key.position.set(-6, 10, 6); s.add(key);
  const COLS = 8, ROWS = 12, n = COLS * ROWS, desks = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const x = (c - COLS / 2 + 0.5) * 2.6 + (c >= COLS / 2 ? 0.9 : -0.9); desks.push([x, -r * 2.4 + 6]); }
  const deskM = std('#4a4d57', { roughness: 0.45 });
  const top = new THREE.InstancedMesh(new THREE.BoxGeometry(1.9, 0.06, 0.85), deskM, n);
  const leg = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.7, 0.05), std('#121317'), n);
  const m = new THREE.Matrix4();
  desks.forEach(([x, z], i) => { top.setMatrixAt(i, m.makeTranslation(x, 0.74, z)); leg.setMatrixAt(i, m.makeTranslation(x, 0.37, z - 0.35)); });
  s.add(top, leg);
  // monitors: instanced per UI texture, emissive
  const uiTex = [...Array(UI_KINDS)].map((_, i) => canvasTex(256, 160, (g, w, h) => drawUI(g, w, h, i)));
  const monMats = uiTex.map((t) => new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
  const groups = monMats.map(() => []);
  desks.forEach(([x, z], i) => { for (const dx of [-0.42, 0.42]) groups[(i * 3 + (dx > 0 ? 1 : 0) + Math.floor(i / 7)) % UI_KINDS].push([x + dx, 1.1, z - 0.2, i]); });
  const monInst = groups.map((arr, k) => { const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.78, 0.48), monMats[k], arr.length); arr.forEach(([x, y, z], j) => im.setMatrixAt(j, m.makeTranslation(x, y, z))); im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(arr.length * 3).fill(1), 3); s.add(im); return { im, arr }; });
  const bezel = new THREE.InstancedMesh(new THREE.BoxGeometry(0.84, 0.54, 0.03), std('#08090b'), n * 2);
  let bi = 0; desks.forEach(([x, z]) => { for (const dx of [-0.42, 0.42]) bezel.setMatrixAt(bi++, m.makeTranslation(x + dx, 1.1, z - 0.222)); }); s.add(bezel);
  s.add(people(n, (i) => [desks[i][0] + (i % 2 ? 0.2 : -0.2), 0.32, desks[i][1] + 0.55, 1], std('#1a1d26', { roughness: 0.7 })));
  // ceiling strips
  for (let r = 0; r < 8; r++) { const st = new THREE.Mesh(new THREE.BoxGeometry(30, 0.04, 0.12), new THREE.MeshBasicMaterial({ color: '#cfe0ff', toneMapped: false })); st.position.set(0, 4.2, 6 - r * 4); s.add(st); }
  // hero stage screens along the aisle with numbered badges
  const STAGES = ['BRIEF', 'IDEA', 'SHOOT', 'EDIT', 'VERSIONS', 'TARGETING', 'BIDDING'];
  const heroTex = STAGES.map((nm, i) => canvasTex(640, 400, (g, w, h) => {
    drawUI(g, w, h, i + 3);
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, h - 92, w, 92);
    g.fillStyle = '#F5A84C'; rr(g, 22, h - 74, 56, 56, 8); g.fill(); g.fillStyle = '#111'; g.font = '800 40px Inter'; g.textAlign = 'center'; g.fillText(String(i + 1), 50, h - 31);
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = '800 40px Inter'; g.fillText(nm, 96, h - 31);
    g.strokeStyle = '#F5A84C'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  }));
  const heros = heroTex.map((t, i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.375), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); p.position.set(i % 2 ? 1.25 : -1.25, 1.9, 4 - i * 3.3); p.rotation.y = i % 2 ? -0.35 : 0.35; s.add(p);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), std('#222')); pole.position.set(p.position.x, 0.6, p.position.z - 0.05); s.add(pole); return p; });
  return {
    scene: s, anchors: { aisle: V(0, 1.5, 0) },
    cam: { p0: [0, 2.0, 9], p1: [0, 1.9, -6], l0: [0, 1.6, 0], l1: [0, 1.6, -16], fov: 44 },
    update(lt, dur, P) {
      heros.forEach((h) => (h.visible = !!P.badges));
      // lights off ripple (P.off: 0..1) / on ripple (P.ripple)
      for (const { im, arr } of monInst) {
        arr.forEach(([x, y, z], j) => {
          let k = 1;
          const d = Math.hypot(x, z - 6) / 30;
          if (P.off) k = 1 - clamp((P.off(lt) * 1.4 - d) * 4);
          if (P.ripple) { const rp = P.ripple(lt); k = 0.15 + 0.85 * clamp((rp * 1.4 - d) * 5); if (P.reset && P.reset(lt) > 0) k = Math.max(0.12, k * (1 - P.reset(lt))); }
          if (P.dimAll) k *= 1 - 0.85 * P.dimAll(lt);
          im.instanceColor.setXYZ(j, k, k, k);
        });
        im.instanceColor.needsUpdate = true;
      }
    },
  };
}

/* ================= GRID: 3D software viewport, turntable, hero object ================= */
export function grid(env) {
  const s = stage('#30353d', 10, 30, env);
  const gtex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#3a3f48'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; for (let i = 0; i <= 32; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 256); g.lineTo(w, i * 256); g.stroke(); }
  });
  gtex.wrapS = gtex.wrapT = THREE.RepeatWrapping; gtex.repeat.set(6, 6);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), std('#ffffff', { map: gtex, roughness: 0.7 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);
  const axX = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.04), new THREE.MeshBasicMaterial({ color: '#c0564a' })); axX.rotation.x = -Math.PI / 2; axX.position.y = 0.005; s.add(axX);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.05, 96), phys('#dfe6ee', { roughness: 0.2, transparent: true, opacity: 0.25, clearcoat: 1 })); disc.position.y = 0.03; disc.receiveShadow = true; s.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.018, 8, 160), new THREE.MeshBasicMaterial({ color: '#e8f4ff', toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; s.add(ring);
  const key = new THREE.DirectionalLight('#fff1e0', 2.4); key.position.set(-4, 8, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 }); s.add(key);
  s.add(new THREE.HemisphereLight('#dfe8ff', '#2a2420', 0.7));
  const rim = new THREE.DirectionalLight('#cfe0ff', 2.5); rim.position.set(3, 4, -6); s.add(rim);
  const turn = new THREE.Group(); s.add(turn);
  // bottle (lathe), three looks
  const prof = []; const pts = [[0, 0], [0.62, 0], [0.7, 0.08], [0.72, 1.4], [0.66, 1.62], [0.32, 1.85], [0.24, 2.2], [0.26, 2.45], [0, 2.45]];
  for (const [x, y] of pts) prof.push(new THREE.Vector2(x, y));
  const lathe = new THREE.LatheGeometry(prof, 64);
  const label = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#f7ead6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1c10'; g.font = '800 120px Inter'; g.textAlign = 'center'; for (const x of [w * 0.25, w * 0.75]) g.fillText('KORA', x, 165); });
  const finalM = phys('#e08a2e', { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0.0, sheen: 0 });
  const clayM = std('#c9ccd2', { roughness: 0.75 });
  const wireM = new THREE.MeshBasicMaterial({ color: '#7fe3ff', wireframe: true, transparent: true, opacity: 0.85, toneMapped: false });
  const bottle = new THREE.Group(); turn.add(bottle);
  const bWire = new THREE.Mesh(lathe, wireM), bClay = new THREE.Mesh(lathe, clayM), bFinal = new THREE.Mesh(lathe, finalM);
  bClay.castShadow = bFinal.castShadow = true;
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.731, 0.731, 0.6, 64, 1, true), std('#ffffff', { map: label, roughness: 0.5 })); lab.position.y = 0.75; bFinal.add(lab);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.42, 48), phys('#2a1c10', { roughness: 0.3, clearcoat: 1 })); cap.position.y = 2.5; cap.castShadow = true; bFinal.add(cap);
  bottle.add(bWire, bClay, bFinal); bottle.position.y = 0.06;
  // camera + lights rig (the "no crew" prop)
  const rig = new THREE.Group(); s.add(rig);
  const metal = std('#2b2d33', { metalness: 0.6, roughness: 0.4 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.6, 0.5, 4, 0.06), metal); body.position.set(0, 1.9, 0); rig.add(body);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 32), metal); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.9, 0.48); rig.add(lens);
  for (let i = 0; i < 3; i++) { const legm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.9), metal); const a = i * 2.09; legm.position.set(Math.cos(a) * 0.35, 0.8, Math.sin(a) * 0.35); legm.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2); rig.add(legm); }
  const lamps = [-2.6, 2.6].map((x) => { const l = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6), metal); st.position.y = 1.3; const hd = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.3), metal); hd.position.set(0, 2.7, 0.1);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.42), new THREE.MeshBasicMaterial({ color: '#fff4e0', toneMapped: false })); face.position.set(0, 2.7, 0.26); l.add(st, hd, face); l.position.set(x, 0, -0.6); l.rotation.y = x > 0 ? -0.5 : 0.5; s.add(l); return { l, face }; });
  rig.castShadow = true;
  // bars
  const BAR = [0.9, 1.7, 2.6], bars = BAR.map((h, i) => { const geo = new RoundedBoxGeometry(0.55, 1, 0.55, 4, 0.06); geo.translate(0, 0.5, 0);
    const b = new THREE.Mesh(geo, i === 2 ? phys('#F5B24A', { roughness: 0.3, clearcoat: 1, emissive: '#F5B24A', emissiveIntensity: 0 }) : phys('#ece4d8', { roughness: 0.35, clearcoat: 1 })); b.castShadow = true; b.position.set(-0.9 + i * 0.9, 0.06, 0); turn.add(b); return b; });
  return {
    scene: s, anchors: { top: V(0, 3.1, 0), left: V(-1.6, 2.2, 0), right: V(1.7, 2.6, 0), bar0: V(-0.9, 1.3, 0.3), bar1: V(0, 2.1, 0.3), bar2: V(0.9, 3.0, 0.3) },
    cam: { p0: [0, 2.6, 7.2], p1: [0.8, 2.3, 6.2], l0: [0, 1.3, 0], l1: [0, 1.25, 0], fov: 38 },
    update(lt, dur, P) {
      const obj = P.obj ?? 'bottle';
      bottle.visible = obj === 'bottle'; rig.visible = obj === 'camera'; lamps.forEach((x) => (x.l.visible = obj === 'camera')); bars.forEach((b) => (b.visible = obj === 'bars'));
      turn.rotation.y = (P.spin ?? 0.35) * lt;
      if (obj === 'bottle') {
        const st = P.stages ?? [[0, 'wire'], [1.2, 'clay'], [2.4, 'final']];
        let cur = st[0][1]; for (const [tt, nm] of st) if (lt >= tt) cur = nm;
        bWire.visible = cur === 'wire'; bClay.visible = cur === 'clay'; bFinal.visible = cur === 'final';
        const pop = Math.max(...st.map(([tt]) => Math.max(0, 0.06 * Math.exp(-8 * (lt - tt)) * (lt >= tt ? 1 : 0))));
        bottle.scale.setScalar(1 + pop);
      }
      if (obj === 'camera') { const off = P.lightsOff ? P.lightsOff(lt) : 0; lamps.forEach(({ face }, i) => face.material.color.set(off > (i ? 0.3 : 0.6) ? '#222' : '#fff4e0')); key.intensity = 2.4 * (1 - 0.7 * off); }
      if (obj === 'bars') { bars.forEach((b, i) => { const g0 = (P.barAt ?? 0.3) + i * 0.25; const k = back(seg(lt, g0, g0 + 0.55), 1.6); b.scale.set(1, Math.max(0.05, BAR[i] * k), 1); }); bars[2].material.emissiveIntensity = 0.4 * seg(lt, 1.2, 1.6); }
    },
  };
}

/* ================= WALL: hundreds of ad variants ================= */
export function wall(env) {
  const s = stage('#0a0b10', 12, 60, env);
  const NT = 20, tex = [...Array(NT)].map((_, i) => adTex(i, { pal: i % 8, kind: i % 5, head: undefined }, 256, 320));
  const COLS = 21, ROWS = 31, cells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells.push([(c - (COLS - 1) / 2) * 1.05, (r - (ROWS - 1) / 2) * 1.32 + 1.5, (c * 7 + r * 13) % NT, Math.hypot(c - (COLS - 1) / 2, (r - (ROWS - 1) / 2) * 1.25)]);
  const byT = tex.map(() => []); cells.forEach((cl, i) => byT[cl[2]].push(i));
  const geo = new THREE.PlaneGeometry(0.96, 1.2), m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  const inst = tex.map((t, k) => { const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), byT[k].length); im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(byT[k].length * 3).fill(1), 3); s.add(im); return im; });
  const keepers = new Set(); for (let i = 0; i < 15; i++) keepers.add(Math.floor(((i * 7907) % 997) / 997 * cells.length));
  const center = cells.reduce((b, c, i) => (c[3] < cells[b][3] ? i : b), 0); keepers.add(center);
  return {
    scene: s, anchors: { center: V(cells[center][0], cells[center][1], 0.2) },
    cam: { p0: [cells[center][0], cells[center][1], 2.3], p1: [cells[center][0], cells[center][1] - 1, 21], l0: [cells[center][0], cells[center][1], 0], l1: [cells[center][0], cells[center][1] - 0.5, 0], fov: 40 },
    update(lt, dur, P) {
      const spread = P.spread ? P.spread(lt) : 1, sel = P.select ? P.select(lt) : 0;
      tex.forEach((t, k) => byT[k].forEach((ci, j) => {
        const [x, y, , d] = cells[ci];
        const appear = P.spread ? out3(clamp(spread * 26 - d)) : 1;
        const wob = 0.04 * Math.sin(lt * 1.3 + ci);
        sc.setScalar(Math.max(0.0001, appear)); pos.set(x, y, wob);
        inst[k].setMatrixAt(j, m.compose(pos, q, sc));
        let c = 1; if (sel > 0) c = keepers.has(ci) ? 1 + 0.25 * sel : 1 - 0.82 * sel;
        if (P.dimRest && ci !== center) c *= 1 - 0.8 * P.dimRest(lt);
        inst[k].instanceColor.setXYZ(j, c, c, c);
      }));
      inst.forEach((im) => { im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; });
    },
  };
}

/* ================= SERVERS: corridor of racks, data pulses ================= */
export function servers(env) {
  const s = stage('#05080d', 6, 34, env);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), std('#0d1118', { roughness: 0.25, metalness: 0.4 })); floor.rotation.x = -Math.PI / 2; floor.position.z = -40; s.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), std('#06080c', { roughness: 0.9 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.4, -40); s.add(ceil);
  const ledTex = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#0a0d12'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 24; r++) { g.fillStyle = '#141922'; g.fillRect(8, r * 21 + 3, w - 16, 16); for (let k = 0; k < 10; k++) { const on = ((r * 31 + k * 17) % 7) > 2; g.fillStyle = on ? ((r + k) % 5 ? '#59d6ff' : '#8effa8') : '#1d2530'; g.fillRect(14 + k * 9, r * 21 + 9, 5, 4); } g.fillStyle = 'rgba(89,214,255,0.18)'; g.fillRect(130, r * 21 + 8, 100, 6); } });
  ledTex.wrapT = THREE.RepeatWrapping;
  const N = 34, m = new THREE.Matrix4();
  const rack = new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 2.6, 1.1), std('#10141b', { roughness: 0.5, metalness: 0.5 }), N * 2);
  const face = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 2.45), new THREE.MeshBasicMaterial({ map: ledTex, toneMapped: false }), N * 2);
  let i = 0; for (let k = 0; k < N; k++) for (const sd of [-1, 1]) { rack.setMatrixAt(i, m.makeTranslation(sd * 1.6, 1.3, -k * 1.15)); const r = new THREE.Matrix4().makeRotationY(-sd * Math.PI / 2); r.setPosition(sd * 1.09, 1.3, -k * 1.15); face.setMatrixAt(i, r); i++; }
  s.add(rack, face);
  for (const x of [-0.6, 0.6]) { const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 120), new THREE.MeshBasicMaterial({ color: '#7fd8ff', toneMapped: false })); strip.position.set(x, 3.38, -40); s.add(strip); }
  s.add(new THREE.HemisphereLight('#3a6a90', '#000', 0.6));
  const pl = new THREE.PointLight('#59d6ff', 25, 0, 2); pl.position.set(0, 2.5, -4); s.add(pl);
  const PN = 40, pulses = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.02, 0.9), new THREE.MeshBasicMaterial({ color: '#bff1ff', toneMapped: false }), PN); s.add(pulses);
  const packet = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), new THREE.MeshBasicMaterial({ color: '#F5C561', toneMapped: false })); s.add(packet);
  const pLight = new THREE.PointLight('#F5C561', 0, 0, 2); packet.add(pLight);
  return {
    scene: s, anchors: { packet: packet.position, ahead: V(0, 1.6, -8) },
    cam: { p0: [0, 1.6, 4], p1: [0, 1.6, -8], l0: [0, 1.5, -20], l1: [0, 1.5, -30], fov: 50 },
    update(lt, dur, P) {
      ledTex.offset.y = Math.floor(lt * 6) * 0.037;
      for (let k = 0; k < PN; k++) { const lane = [-0.9, -0.3, 0.3, 0.9][k % 4], sp = 9 + (k % 5) * 2.5, z = 4 - ((lt * sp + k * 3.1) % 60), y = k % 2 ? 0.012 : 3.37; pulses.setMatrixAt(k, m.makeTranslation(lane, y, z)); }
      pulses.instanceMatrix.needsUpdate = true;
      packet.visible = !!P.packet; if (P.packet) { const k = P.packet(lt); packet.position.set(0, 1.4 + 0.1 * Math.sin(lt * 6), lerp(2, -28, k)); pLight.intensity = 6; }
    },
  };
}
const lerp = (a, b, x) => a + (b - a) * x;

/* ================= DESK + PHONE + ORB ================= */
function woodTex() { return canvasTex(1024, 1024, (g) => { g.fillStyle = '#3a291e'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 420; i++) { const y = rng() * 1024, a = 0.03 + rng() * 0.09, w = 1 + rng() * 4, light = rng() > 0.5; g.strokeStyle = light ? `rgba(120,84,58,${a})` : `rgba(18,11,7,${a * 1.4})`; g.lineWidth = w; g.beginPath(); const f = 0.004 + rng() * 0.006, ph = rng() * 6.28, amp = 2 + rng() * 9; for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y + Math.sin(x * f + ph) * amp); g.stroke(); } }); }
export function desk(env) {
  const s = stage('#1b2029', 10, 22, env);
  const wt = woodTex(); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(2.5, 2);
  const deskM = phys('#ffffff', { map: wt, roughness: 0.55, clearcoat: 0.12, envMapIntensity: 0.12 });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(16, 11), deskM); top.rotation.x = -Math.PI / 2; top.position.z = 0.5; top.receiveShadow = true; s.add(top);
  const wallM = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), std('#252b36', { roughness: 0.95 })); wallM.position.set(0, 5, -5); s.add(wallM);
  const key = new THREE.DirectionalLight('#ffe4c2', 3.0); key.position.set(-5, 7.5, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 2, far: 22 }); s.add(key);
  s.add(new THREE.HemisphereLight('#8ea4c8', '#140f0b', 0.45));
  const rim = new THREE.DirectionalLight('#d6e4ff', 3.5); rim.position.set(3.5, 4, -6); s.add(rim);
  // phone on stand
  const alu = phys('#b8bcc4', { metalness: 1, roughness: 0.32 });
  const stand = new THREE.Group(); s.add(stand);
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.95, 4, 0.03), alu); base.position.set(0, 0.04, 0.12); base.castShadow = base.receiveShadow = true; stand.add(base);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.14, 0.06, 4, 0.025), alu); lip.position.set(0, 0.15, 0.41); stand.add(lip);
  const phone = new THREE.Group(); stand.add(phone); phone.position.set(0, 0.08, 0.33); phone.rotation.x = -0.2;
  const pb = new THREE.Mesh(new RoundedBoxGeometry(1.0, 2.06, 0.085, 6, 0.04), phys('#202227', { metalness: 0.7, roughness: 0.3, clearcoat: 0.8 })); pb.position.y = 1.03; pb.castShadow = true; phone.add(pb);
  const SW = 512, SH = 1096, st = canvasTex(SW, SH);
  const scrM = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: st, emissiveIntensity: 0.62, roughness: 0.18, envMapIntensity: 0.08 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.935, 2.0), scrM); scr.position.set(0, 1.03, 0.0436); phone.add(scr);
  stand.position.set(-0.4, 0, 0);
  // orb
  const orb = new THREE.Group(); s.add(orb);
  const R = 0.27;
  const shell = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32), phys('#ffffff', { transmission: 1, thickness: 0.45, roughness: 0.03, ior: 1.5, clearcoat: 1, attenuationColor: '#fff3e2', attenuationDistance: 6, envMapIntensity: 1.4 }));
  shell.castShadow = true; orb.add(shell);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 12), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#f0a53a', emissiveIntensity: 3 })); orb.add(core);
  const ringM = phys('#e9cf9f', { metalness: 1, roughness: 0.2 });
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.006, 12, 96), ringM), r2 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.005, 12, 96), ringM); r2.rotation.x = Math.PI / 2; orb.add(r1, r2);
  const oL = new THREE.PointLight('#f0a53a', 1.2, 0, 2); orb.add(oL);
  orb.position.set(0.55, R, 0.75);
  function feed(lt, P) {
    const g = st.g; g.save(); g.fillStyle = '#000'; g.fillRect(0, 0, SW, SH); rr(g, 0, 0, SW, SH, 46); g.clip();
    g.fillStyle = '#0d0f14'; g.fillRect(0, 0, SW, SH);
    const scroll = P.scroll ? P.scroll(lt) : 0;
    for (let k = -1; k < 6; k++) {
      const y = 90 + k * 560 - (scroll % 560), idx = k + Math.floor(scroll / 560);
      g.fillStyle = '#2a2f3a'; g.beginPath(); g.arc(46, y + 30, 22, 0, 7); g.fill();
      g.fillStyle = '#e8e8ee'; g.font = '700 22px Inter'; g.fillText(idx % 3 === 1 ? 'Sponsored' : ['priya.k', 'foodie.mum', 'rahul_m', 'citywalks'][((idx % 4) + 4) % 4], 80, y + 38);
      g.save(); g.translate(16, y + 64); const w = SW - 32, h = 420;
      if (((idx % 3) + 3) % 3 === 1) { const variant = P.variant ? P.variant(lt) : null; g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip(); g.scale(w / 512, h / 420);
        if (P.dullAd) drawDullAd(g, 512, 420); else drawAd(g, 512, 420, P.ad ?? 3, variant ?? {}); g.restore(); }
      else { const pal = PALETTES[((idx * 3) % 8 + 8) % 8]; const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, pal[1]); gr.addColorStop(1, pal[3]); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(w * 0.7, h * 0.35, 80, 0, 7); g.fill(); }
      g.restore();
      g.fillStyle = '#9aa0ab'; g.font = '600 20px Inter'; g.fillText('\u2665 ' + (120 + ((idx * 977) % 4000)) + '  \u00B7  ' + (8 + (idx * 37) % 90) + ' comments', 24, y + 520);
    }
    g.fillStyle = 'rgba(13,15,20,0.92)'; g.fillRect(0, 0, SW, 70); g.fillStyle = '#fff'; g.font = '800 28px Inter'; g.fillText('Feed', 28, 50);
    if (P.timer) { const v = P.timer(lt); g.fillStyle = 'rgba(245,197,97,0.95)'; rr(g, SW - 196, 16, 176, 42, 21); g.fill(); g.fillStyle = '#111'; g.font = '800 24px "JetBrains Mono"'; g.textAlign = 'center'; g.fillText(v.toFixed(0) + ' ms', SW - 108, 45); g.textAlign = 'left'; }
    g.restore(); st.needsUpdate = true;
  }
  return {
    scene: s, anchors: { phone: V(-0.4, 1.4, 0.2), phoneTop: V(-0.4, 2.3, 0.0), orb: orb.position },
    cam: { p0: [0.1, 1.25, 6.4], p1: [0.0, 1.3, 5.4], l0: [0.0, 1.05, 0.4], l1: [-0.1, 1.05, 0.4], fov: 32 },
    update(lt, dur, P) {
      feed(lt, P); orb.visible = P.orb !== false;
      core.material.emissiveIntensity = 2.6 + 0.4 * Math.sin(lt * 3) + (P.orbPulse ? 4 * P.orbPulse(lt) : 0);
      oL.intensity = 1.2 + (P.orbPulse ? 3 * P.orbPulse(lt) : 0);
      r1.rotation.y = lt * 0.6; r2.rotation.z = lt * 0.45;
      if (P.orbOnly) { stand.visible = false; orb.position.set(0, R, 0.4); } else { stand.visible = true; orb.position.set(0.55, R, 0.75); }
    },
  };
}

/* ================= CITY: night blocks, billboard, shopfronts ================= */
function windowsTex(lit) { return canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#0c0e14'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 32; r++) for (let c = 0; c < 8; c++) { const on = ((r * 13 + c * 7 + lit * 31) % 10) > 5; g.fillStyle = on ? (c % 3 ? '#ffd9a0' : '#cfe3ff') : '#161a24'; g.globalAlpha = on ? 0.55 + ((r * c) % 4) * 0.1 : 1; g.fillRect(8 + c * 31, 6 + r * 16, 20, 9); } g.globalAlpha = 1; }); }
export function city(env) {
  const s = stage('#0a0e1a', 18, 75, env);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), std('#0d0f15', { roughness: 0.6, metalness: 0.2 })); ground.rotation.x = -Math.PI / 2; s.add(ground);
  s.add(new THREE.HemisphereLight('#4a5a85', '#05060a', 0.7));
  const moon = new THREE.DirectionalLight('#9fb4ff', 0.6); moon.position.set(-10, 20, -10); s.add(moon);
  const wtex = [0, 1, 2].map(windowsTex), m = new THREE.Matrix4();
  const B = []; for (let gx = -6; gx <= 6; gx++) for (let gz = -10; gz <= 2; gz++) { if (Math.abs(gx) <= 1 && gz >= -1) continue; const h = 4 + rng() * 22 * (gz < -3 ? 1.4 : 0.7); B.push([gx * 6, gz * 6, 3.6 + rng() * 1.2, h, Math.floor(rng() * 3)]); }
  const byT = [[], [], []]; B.forEach((b) => byT[b[4]].push(b));
  const towers = byT.map((arr, k) => { const mat = new THREE.MeshStandardMaterial({ color: '#141822', roughness: 0.7, emissive: '#ffffff', emissiveMap: wtex[k], emissiveIntensity: 1 }); const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, arr.length);
    arr.forEach(([x, z, w, h], j) => im.setMatrixAt(j, m.makeScale(w, h, w).setPosition(x, h / 2, z))); s.add(im); return { im, mat }; });
  // billboard on a frame, facing the camera
  const BW = 768, BH = 432, btex = canvasTex(BW, BH);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(12, 6.75), new THREE.MeshBasicMaterial({ map: btex, toneMapped: false })); board.position.set(0, 14, -14); s.add(board);
  const bframe = new THREE.Mesh(new THREE.BoxGeometry(12.6, 7.3, 0.4), std('#1a1c22', { metalness: 0.6 })); bframe.position.set(0, 14, -14.25); s.add(bframe);
  for (const x of [-4, 4]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 11), std('#1a1c22', { metalness: 0.6 })); p.position.set(x, 5.5, -14.4); s.add(p); }
  const bl = new THREE.PointLight('#ffffff', 80, 0, 2); bl.position.set(0, 12, -9); s.add(bl);
  // shopfront street
  const shops = new THREE.Group(); s.add(shops);
  const NAMES = ['SHARMA GENERAL STORE', 'GUPTA MOBILES', 'NEW BOMBAY FOOTWEAR', 'LAKSHMI SAREES', 'KUMAR ELECTRICALS', 'ANAND SWEETS', 'PATEL HARDWARE', 'ROYAL OPTICALS', 'SAI MEDICALS', 'FRESH MART'];
  const shopFronts = NAMES.map((nm, i) => {
    const grp = new THREE.Group(); const x = (i - 4.5) * 4.2; grp.position.set(x, 0, -2);
    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 4.2, 2), std(['#3b2f2a', '#2f3a3a', '#3a3328', '#2c2f3d'][i % 4], { roughness: 0.8 })); body.position.y = 2.1; grp.add(body);
    const sign = canvasTex(512, 96, (g, w, h) => { g.fillStyle = ['#c0392b', '#1f6f8b', '#d68910', '#6c3483', '#1e8449'][i % 5]; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 40px Inter'; g.textAlign = 'center'; let fs = 40; while (g.measureText(nm).width > w - 30 && fs > 20) { fs -= 2; g.font = `800 ${fs}px Inter`; } g.fillText(nm, w / 2, 62); });
    const sm = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: sign, emissiveIntensity: 0.2 });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.72), sm); sg.position.set(0, 3.6, 1.01); grp.add(sg);
    const win = canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#1b1208'; g.fillRect(0, 0, w, h); const sp = g.createRadialGradient(w / 2, h * 0.3, 5, w / 2, h * 0.5, w * 0.6); sp.addColorStop(0, '#ffe2a8'); sp.addColorStop(1, '#5a3510'); g.fillStyle = sp; g.fillRect(0, 0, w, h);
      g.fillStyle = '#2b1606'; g.beginPath(); g.arc(w / 2, h * 0.42, 26, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2, h * 0.9, 58, 52, 0, Math.PI, 0); g.fill(); g.fillStyle = '#fff'; g.font = '800 20px Inter'; g.textAlign = 'center'; g.fillText('NOW AT ' + nm.split(' ')[0], w / 2, 26); });
    const wm = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: win, emissiveIntensity: 0.1 });
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.95), wm); wn.position.set(0, 1.6, 1.01); grp.add(wn);
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.12, 0.3), std('#555')); shutter.position.set(0, 3.12, 1.1); grp.add(shutter);
    shops.add(grp); return { sm, wm };
  });
  const sl = new THREE.PointLight('#ffd6a0', 40, 0, 2); sl.position.set(0, 6, 4); shops.add(sl);
  function drawBoard(lt, P) {
    const g = btex.g; const v = P.board ? P.board(lt) : { a: 'snow', b: 'city', k: 0 };
    g.save(); g.scale(BW / 512, BH / 288);
    drawAd(g, 512, 288, 4, { kind: 4, scene: v.a, head: v.a === 'snow' ? 'Built for the mountains' : 'Built for your city', pal: 1, cta: 'Book a test drive' });
    if (v.k > 0) { g.save(); g.beginPath(); g.rect(0, 0, 512 * v.k, 288); g.clip(); drawAd(g, 512, 288, 4, { kind: 4, scene: v.b, head: v.b === 'snow' ? 'Built for the mountains' : 'Built for your city', pal: 1, cta: 'Book a test drive' }); g.restore();
      if (v.k < 1) { g.fillStyle = '#F5C561'; g.fillRect(512 * v.k - 3, 0, 6, 288); } }
    g.restore(); btex.needsUpdate = true;
  }
  return {
    scene: s, anchors: { board: V(0, 14, -14), boardTop: V(0, 18.2, -14), street: V(0, 4.6, -2) },
    cam: { p0: [0, 3, 24], p1: [0, 9, 14], l0: [0, 9, -14], l1: [0, 13, -14], fov: 46 },
    update(lt, dur, P) {
      const mode = P.mode ?? 'board';
      board.visible = bframe.visible = mode === 'board'; shops.visible = mode === 'shops';
      if (mode === 'board') drawBoard(lt, P);
      if (mode === 'shops') { const on = P.shopsOn ? P.shopsOn(lt) : 1; shopFronts.forEach(({ sm, wm }, i) => { const k = clamp(on * 12 - i * 1.05); sm.emissiveIntensity = 0.2 + 1.1 * k; wm.emissiveIntensity = 0.1 + 1.0 * k; }); }
      const glowK = P.cityGlow ? P.cityGlow(lt) : 1; towers.forEach(({ mat }) => (mat.emissiveIntensity = glowK));
    },
  };
}

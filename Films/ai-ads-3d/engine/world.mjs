// CAROUSEL: the 3D world. 3 a.m., an empty terminal, baggage carousel 4.
// Every pixel is a function of t (and the frame for grain). makeWorld() builds once; render(frame, t) draws.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildLook } from './looks.mjs';

// ---------------------------------------------------------------- helpers
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);
const ease = (t, a, b) => smooth(clamp((t - a) / (b - a)));
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const canvasTex = (w, h, draw, srgb = true) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const tx = new THREE.CanvasTexture(c); if (srgb) tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; return tx;
};
const std = (color, roughness = 0.5, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
const glow = (map, intensity = 1) => new THREE.MeshBasicMaterial({ map, color: new THREE.Color(intensity, intensity, intensity), toneMapped: true });

// ---------------------------------------------------------------- the carousel's path (a stadium)
export const BELT = { L: 6, R: 2.0, y: 0.52, v: 0.85 };
const P = 2 * BELT.L + 2 * Math.PI * BELT.R;
// s = 0 at (-L/2, +R) going +x along the near straight, round the right end, back along the far straight, round the left
export function stadium(s, off = 0) {
  const { L, R } = BELT; let u = ((s % P) + P) % P; const r = R + off;
  if (u < L) return { x: -L / 2 + u, z: r, a: 0 };
  u -= L; const arc = Math.PI * R;
  if (u < arc) { const th = u / R; return { x: L / 2 + Math.sin(th) * r, z: Math.cos(th) * r, a: -th }; }
  u -= arc;
  if (u < L) return { x: L / 2 - u, z: -r, a: -Math.PI };
  u -= L; const th = u / R; return { x: -L / 2 - Math.sin(th) * r, z: -Math.cos(th) * r, a: -Math.PI - th };
}
const S_JOIN = BELT.L + Math.PI * BELT.R + BELT.L / 2;   // the far straight's middle, where the feed joins

// ---------------------------------------------------------------- adverts (written for passengers who are not here)
const NAMES = ['MAYA', 'JONAS', 'AHMET', 'LIN', 'SOFIA', 'KOFI', 'ELENA', 'RAVI'];
const AD_BG = ['#d6452f', '#1f7a5c', '#e2a72e', '#c43d6b', '#2f6f8f', '#7a4fb0', '#e06d2a', '#3c8a3a'];
const AD_LINE = ['THIS ONE IS YOURS', 'WE KNEW YOU WOULD', 'BACK IN YOUR SIZE', 'PICKED FOR YOU', 'STILL THINKING?', 'ONLY YOU', 'YOUR NEXT ONE', 'MISSED YOU'];
function drawProduct(x, kind, cx, cy, s, ink) {
  x.fillStyle = ink; x.strokeStyle = ink; x.lineWidth = s * 0.05; x.lineJoin = 'round';
  x.beginPath();
  if (kind === 0) {        // a trainer
    x.moveTo(cx - s, cy + s * 0.35); x.lineTo(cx - s, cy - s * 0.2); x.quadraticCurveTo(cx - s * 0.6, cy - s * 0.4, cx - s * 0.35, cy - s * 0.28);
    x.bezierCurveTo(cx + s * 0.2, cy - s * 0.05, cx + s * 0.9, cy, cx + s, cy + s * 0.3); x.lineTo(cx + s, cy + s * 0.45); x.lineTo(cx - s, cy + s * 0.45); x.fill();
  } else if (kind === 1) { // a bottle
    x.roundRect(cx - s * 0.35, cy - s * 0.3, s * 0.7, s * 0.85, s * 0.12); x.rect(cx - s * 0.12, cy - s * 0.62, s * 0.24, s * 0.35); x.fill();
  } else if (kind === 2) { // headphones
    x.arc(cx, cy, s * 0.6, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); x.beginPath();
    x.roundRect(cx - s * 0.75, cy - s * 0.1, s * 0.3, s * 0.5, s * 0.12); x.roundRect(cx + s * 0.45, cy - s * 0.1, s * 0.3, s * 0.5, s * 0.12); x.fill();
  } else if (kind === 3) { // a watch
    x.rect(cx - s * 0.18, cy - s * 0.85, s * 0.36, s * 1.7); x.fill(); x.beginPath(); x.arc(cx, cy, s * 0.45, 0, TAU); x.fill();
  } else if (kind === 4) { // sunglasses
    x.ellipse(cx - s * 0.45, cy, s * 0.38, s * 0.28, 0, 0, TAU); x.ellipse(cx + s * 0.45, cy, s * 0.38, s * 0.28, 0, 0, TAU); x.fill(); x.fillRect(cx - s * 0.1, cy - s * 0.08, s * 0.2, s * 0.06);
  } else if (kind === 5) { // a takeaway cup
    x.moveTo(cx - s * 0.4, cy - s * 0.5); x.lineTo(cx + s * 0.4, cy - s * 0.5); x.lineTo(cx + s * 0.3, cy + s * 0.6); x.lineTo(cx - s * 0.3, cy + s * 0.6); x.fill(); x.fillRect(cx - s * 0.46, cy - s * 0.66, s * 0.92, s * 0.16);
  } else if (kind === 6) { // a chair
    x.fillRect(cx - s * 0.5, cy, s, s * 0.15); x.fillRect(cx - s * 0.5, cy - s * 0.7, s * 0.15, s * 0.85); x.fillRect(cx - s * 0.45, cy + s * 0.15, s * 0.1, s * 0.5); x.fillRect(cx + s * 0.35, cy + s * 0.15, s * 0.1, s * 0.5);
  } else {                 // a phone
    x.roundRect(cx - s * 0.32, cy - s * 0.62, s * 0.64, s * 1.24, s * 0.1); x.fill();
  }
}
function adAtlas(font) {     // 4 x 2 adverts, 512 x 320 each
  return canvasTex(2048, 640, (x) => {
    for (let i = 0; i < 8; i++) {
      const ox = (i % 4) * 512, oy = Math.floor(i / 4) * 320;
      x.fillStyle = AD_BG[i]; x.fillRect(ox, oy, 512, 320);
      const gr = x.createLinearGradient(ox, oy, ox + 512, oy + 320); gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)');
      x.fillStyle = gr; x.fillRect(ox, oy, 512, 320);
      x.fillStyle = 'rgba(255,255,255,0.92)'; x.beginPath(); x.arc(ox + 380, oy + 160, 118, 0, TAU); x.fill();
      drawProduct(x, i, ox + 380, oy + 160, 78, AD_BG[i]);
      x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
      x.font = `700 64px ${font}`; x.fillText(NAMES[i] + ',', ox + 30, oy + 120);
      x.font = `500 30px ${font}`; x.fillText(AD_LINE[i], ox + 32, oy + 170);
      x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(ox + 32, oy + 228, 150, 52);
      x.fillStyle = AD_BG[i]; x.font = `700 26px ${font}`; x.fillText('BUY NOW', ox + 46, oy + 264);
    }
  });
}
function cellTex(atlas, i) { const t = atlas.clone(); t.repeat.set(0.25, 0.5); t.offset.set((i % 4) * 0.25, 0.5 - Math.floor(i / 4) * 0.5); t.needsUpdate = true; return t; }

// ---------------------------------------------------------------- the world
export async function makeWorld({ W, H, font, look }) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07080a');
  scene.fog = new THREE.FogExp2('#0b0d10', 0.022);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.22;
  const camera = new THREE.PerspectiveCamera(36, W / H, 0.05, 120);
  const R = rng(9);
  const T = {};   // things that move

  // ---- textures
  const terrazzo = canvasTex(1024, 1024, (x, w, h) => {
    x.fillStyle = '#3a3733'; x.fillRect(0, 0, w, h);
    const r = rng(3);
    for (let i = 0; i < 9000; i++) { const g = 60 + r() * 120; x.fillStyle = `rgba(${g + 20},${g + 12},${g},${0.25 + r() * 0.5})`; const s = 1 + r() * 5; x.fillRect(r() * w, r() * h, s, s * (0.5 + r())); }
    x.strokeStyle = 'rgba(20,18,16,0.55)'; x.lineWidth = 3; for (let k = 0; k <= 4; k++) { x.beginPath(); x.moveTo(k * w / 4, 0); x.lineTo(k * w / 4, h); x.moveTo(0, k * h / 4); x.lineTo(w, k * h / 4); x.stroke(); }
  });
  terrazzo.wrapS = terrazzo.wrapT = THREE.RepeatWrapping; terrazzo.repeat.set(10, 10);
  const roughMap = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#6a6a6a'; x.fillRect(0, 0, w, h); const r = rng(5);
    for (let i = 0; i < 60; i++) { const gx = r() * w, gy = r() * h, rr = 20 + r() * 90, g = x.createRadialGradient(gx, gy, 0, gx, gy, rr); g.addColorStop(0, `rgba(${r() < 0.5 ? '20,20,20' : '200,200,200'},0.5)`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(gx - rr, gy - rr, 2 * rr, 2 * rr); }
  }, false);
  roughMap.wrapS = roughMap.wrapT = THREE.RepeatWrapping; roughMap.repeat.set(6, 6);
  const panels = canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = '#c9c7c1'; x.fillRect(0, 0, w, h); const r = rng(8);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(0,0,0,${r() * 0.04})`; x.fillRect(r() * w, r() * h, 2, 2); }
    x.strokeStyle = 'rgba(60,58,54,0.6)'; x.lineWidth = 3; for (let k = 0; k <= 8; k++) { x.beginPath(); x.moveTo(k * w / 8, 0); x.lineTo(k * w / 8, h); x.stroke(); }
    x.beginPath(); x.moveTo(0, h * 0.82); x.lineTo(w, h * 0.82); x.stroke();
  });
  panels.wrapS = panels.wrapT = THREE.RepeatWrapping; panels.repeat.set(4, 1);
  const atlas = adAtlas(font);
  const sign = (txt, w, h, opts = {}) => canvasTex(w, h, (x) => {
    x.fillStyle = opts.bg || '#101214'; x.fillRect(0, 0, w, h);
    x.fillStyle = opts.ink || '#f2c14e'; x.textBaseline = 'middle'; x.textAlign = opts.align || 'left';
    const lines = [].concat(txt);
    lines.forEach((l, i) => { x.font = `${l.w || 700} ${l.px}px ${font}`; x.fillStyle = l.ink || opts.ink || '#f2c14e'; x.fillText(l.s, opts.align === 'center' ? w / 2 : (l.x ?? 40), l.y); });
  });

  // ---- hall: mirror floor under a terrazzo layer
  const mirror = new Reflector(new THREE.PlaneGeometry(60, 50), { textureWidth: Math.round(W / 2), textureHeight: Math.round(H / 2), color: 0x9a9a9a });
  mirror.rotation.x = -Math.PI / 2; mirror.position.y = -0.002; scene.add(mirror);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 50), std(0xffffff, 0.55, 0.0, { map: terrazzo, roughnessMap: roughMap, transparent: true, opacity: 0.72 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // ceiling and fluorescent strips
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(60, 50), std('#1a1b1d', 0.9)); ceil.rotation.x = Math.PI / 2; ceil.position.y = 7; scene.add(ceil);
  const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.35, 2.5) });
  for (let i = -3; i <= 3; i++) for (let j = -2; j <= 3; j++) { if (j < 0 && Math.abs(i) < 2) continue; const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.16), stripMat); m.position.set(i * 3.6, 6.9, j * 3.4 + 1); scene.add(m); }
  // back wall with the opening for the feed, signage above it
  const wallMat = std(0xffffff, 0.7, 0, { map: panels });
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(14.3, 7, 0.4), wallMat); wallL.position.set(-7.85, 3.5, -7.7);
  const wallR = wallL.clone(); wallR.position.x = 7.85;
  const wallT = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.3, 0.4), wallMat); wallT.position.set(0, 4.35, -7.7);
  for (const m of [wallL, wallR, wallT]) { m.receiveShadow = true; scene.add(m); }
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), glow(sign([{ s: 'BAGGAGE CLAIM', px: 70, y: 70 }, { s: 'CAROUSEL 4', px: 120, y: 175, ink: '#ffffff' }], 1024, 256), 1.4));
  board.position.set(-3.2, 4.4, -7.48); scene.add(board);
  const flights = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), glow(sign([{ s: 'QX 412   LISBON   ARRIVED', px: 46, y: 64, ink: '#ffffff' }, { s: 'BELT 4    LAST BAG 02:41', px: 46, y: 132 }, { s: '03:07', px: 64, y: 210, ink: '#ffffff' }], 1024, 320), 1.3));
  flights.position.set(3.4, 4.3, -7.48); scene.add(flights);
  const wallR2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 22), wallMat); wallR2.position.set(12.2, 3.5, 3.3); wallR2.receiveShadow = true; scene.add(wallR2);
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
  for (const [cx, cz] of [[-9, -3], [9, -3], [-9, 4], [9, 4]]) { const c = new THREE.Mesh(new RoundedBoxGeometry(0.7, 7, 0.7, 3, 0.08), std('#d8d6d0', 0.35, 0.1)); c.position.set(cx, 3.5, cz); c.castShadow = c.receiveShadow = true; scene.add(c); }
  // night windows on the left wall: the apron
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(26, 6), std('#05070a', 0.05, 0.6)); glass.position.set(-12, 3.2, 1); glass.rotation.y = Math.PI / 2; scene.add(glass);
  for (let k = -6; k <= 6; k++) { const mull = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.2, 0.12), std('#202224', 0.4, 0.6)); mull.position.set(-11.9, 3.2, 1 + k * 2); scene.add(mull); }
  const apron = new THREE.Group(); scene.add(apron);
  const lampY = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 0.8) }), lampB = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.4, 3.2) });
  for (let k = 0; k < 40; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), k % 3 ? lampB : lampY); m.position.set(-16 - (k % 5) * 3, 0.1, -12 + k * 0.7); apron.add(m); }
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(3, 0), new THREE.Vector2(4.2, 4.2), new THREE.Vector2(2.8, 4.2)]), { depth: 0.3, bevelEnabled: false }), std('#c9ccd1', 0.4, 0.2));
  fin.position.set(-21, 1.6, 3); fin.rotation.y = Math.PI / 2; apron.add(fin);
  const flood = new THREE.SpotLight('#ffe2b0', 120, 30, 0.5, 0.6); flood.position.set(-16, 6, 8); flood.target = fin; apron.add(flood);
  // seats: three rows of beam seating facing the carousel
  const seatShell = new RoundedBoxGeometry(0.5, 0.08, 0.48, 2, 0.03), seatBack = new RoundedBoxGeometry(0.5, 0.52, 0.06, 2, 0.03);
  const seatMat = std('#2b2f33', 0.45, 0.35), beamMat = std('#8e959b', 0.3, 0.9);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 9; k++) {
    const g = new THREE.Group(); g.position.set(-4.2 + k * 0.56 + (k > 4 ? 0.5 : 0), 0, 4.6 + row * 1.35);
    const a = new THREE.Mesh(seatShell, seatMat); a.position.y = 0.45; const b = new THREE.Mesh(seatBack, seatMat); b.position.set(0, 0.74, 0.22); b.rotation.x = -0.12;
    for (const m of [a, b]) { m.castShadow = m.receiveShadow = true; g.add(m); }
    scene.add(g);
  }
  for (let row = 0; row < 3; row++) { const beam = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.07, 0.07), beamMat); beam.position.set(-1.7, 0.36, 4.6 + row * 1.35); scene.add(beam);
    for (const lx of [-4.1, 0.6]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.4), beamMat); leg.position.set(lx, 0.18, 4.6 + row * 1.35); scene.add(leg); } }

  // ---- the carousel
  const { L, R: BR } = BELT;
  const ring = (rOut, rIn) => { const sh = new THREE.Shape(); sh.absarc(L / 2, 0, rOut, -Math.PI / 2, Math.PI / 2, false); sh.absarc(-L / 2, 0, rOut, Math.PI / 2, Math.PI * 1.5, false);
    if (rIn > 0) { const hole = new THREE.Path(); hole.absarc(L / 2, 0, rIn, -Math.PI / 2, Math.PI / 2, false); hole.absarc(-L / 2, 0, rIn, Math.PI / 2, Math.PI * 1.5, false); sh.holes.push(hole); } return sh; };
  const ext = (shape, depth, bevel = 0.03) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 48 }); g.rotateX(-Math.PI / 2); return g; };
  const base = new THREE.Mesh(ext(ring(BR + 0.55, BR - 0.55), 0.42, 0.02), std('#16181a', 0.7, 0.3)); base.receiveShadow = base.castShadow = true; scene.add(base);
  const skirt = new THREE.Mesh(ext(ring(BR + 0.58, BR + 0.5), 0.36, 0.01), std('#0d0e0f', 0.85)); scene.add(skirt);
  const rimOut = new THREE.Mesh(ext(ring(BR + 0.6, BR + 0.47), 0.06, 0.02), std('#b9c1c8', 0.18, 1)); rimOut.position.y = 0.5; rimOut.castShadow = true; scene.add(rimOut);
  const island = new THREE.Mesh(ext(ring(BR - 0.46, 0), 0.62, 0.16), std('#6f777e', 0.34, 0.9, { roughnessMap: roughMap })); island.castShadow = island.receiveShadow = true; scene.add(island);
  const rimIn = new THREE.Mesh(ext(ring(BR - 0.42, BR - 0.5), 0.12, 0.015), std('#c4ccd2', 0.15, 1)); rimIn.position.y = 0.48; scene.add(rimIn);
  // the slats: overlapping steel plates riding the belt
  const NS = Math.round(P / 0.36), slatGeo = new RoundedBoxGeometry(0.31, 0.03, 0.88, 2, 0.012);
  const slats = new THREE.InstancedMesh(slatGeo, std('#646b71', 0.42, 0.85), NS); slats.castShadow = false; slats.receiveShadow = true; scene.add(slats);
  T.slats = { mesh: slats, n: NS, m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1) };
  // the feed: a conveyor from the opening down to the carousel, and on into the back hall
  const feedMat = std('#2a2c2e', 0.6, 0.4), rubber = std('#141516', 0.9);
  const feed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 17.5), feedMat); feed.position.set(0, 0.36, -2.2 - 17.5 / 2); feed.receiveShadow = true; scene.add(feed);
  const feedBelt = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.02, 17.5), rubber); feedBelt.position.set(0, 0.55, -2.2 - 17.5 / 2); scene.add(feedBelt);
  for (const sx of [-0.52, 0.52]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 17.5), std('#b9c1c8', 0.2, 1)); rail.position.set(sx, 0.6, -2.2 - 17.5 / 2); scene.add(rail); }
  // the rubber flaps in the opening: strips that swing on contact
  T.flaps = [];
  for (let k = 0; k < 12; k++) { const piv = new THREE.Group(); piv.position.set(-0.66 + k * 0.12, 1.62, -7.7); const strip = new THREE.Mesh(new THREE.BoxGeometry(0.115, 1.05, 0.012), std('#111214', 0.7)); strip.position.y = -0.525; strip.castShadow = true; piv.add(strip); scene.add(piv); T.flaps.push(piv); }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.5), std('#d9a320', 0.5, 0.2)); lintel.position.set(0, 1.68, -7.7); scene.add(lintel);
  for (const sx of [-0.75, 0.75]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.7, 0.5), std('#d9a320', 0.5, 0.2)); post.position.set(sx, 0.85, -7.7); scene.add(post); }

  // ---- screens above the carousel: adverts to an empty hall
  T.screens = [];
  for (const [sx, face] of [[-2.1, 1], [2.1, 1], [-2.1, -1], [2.1, -1]]) {
    const g = new THREE.Group(); g.position.set(sx, 3.1, face * 0.06); g.rotation.y = face > 0 ? 0 : Math.PI;
    const housing = new THREE.Mesh(new RoundedBoxGeometry(2.3, 1.38, 0.1, 2, 0.02), std('#111214', 0.4, 0.6)); housing.position.z = -0.06; g.add(housing);
    const tex = cellTex(atlas, 0); const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 1.26), glow(tex, 1.25)); g.add(scr);
    T.screens.push({ tex, k: T.screens.length });
    scene.add(g);
  }
  for (const sx of [-2.1, 2.1]) for (const dx of [-0.9, 0.9]) { const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3.2), std('#888', 0.3, 0.9)); rod.position.set(sx + dx, 5.4, 0); scene.add(rod); }

  // ---- suitcases, each with a paper tag, and a phone lying on top (dark until it wakes)
  const BAGS = [];
  const bagCols = ['#2c2e31', '#5a2a2a', '#3d4a3a', '#8a8f94', '#b08a5a', '#263446', '#6e6a62', '#3a2f45', '#9a3b2c', '#20262b', '#7d6b4b', '#4b4f52'];
  const phoneScreens = [];
  const phoneOff = canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#050607'; x.fillRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const phoneAd = (i) => canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#0c0d0f'; x.fillRect(0, 0, w, h); x.drawImage(atlas.image, (i % 4) * 512, Math.floor(i / 4) * 320, 512, 320, 0, 120, 256, 160);
    x.fillStyle = '#fff'; x.font = `700 30px ${font}`; x.fillText(NAMES[i] + ',', 18, 330); x.font = `500 18px ${font}`; x.fillText(AD_LINE[i], 18, 362); });
  const phoneBought = (i) => canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#0c0d0f'; x.fillRect(0, 0, w, h); x.fillStyle = '#2fbf71'; x.beginPath(); x.arc(w / 2, 200, 54, 0, TAU); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 12; x.lineCap = 'round'; x.beginPath(); x.moveTo(w / 2 - 26, 202); x.lineTo(w / 2 - 6, 222); x.lineTo(w / 2 + 28, 182); x.stroke();
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `700 34px ${font}`; x.fillText('ORDER', w / 2, 310); x.fillText('PLACED', w / 2, 350); x.font = `500 18px ${font}`; x.fillText('for ' + NAMES[i], w / 2, 392); });
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Group(), w = 0.42 + R() * 0.08, l = 0.6 + R() * 0.12, h = 0.24 + R() * 0.06;
    const shell = new THREE.Mesh(new RoundedBoxGeometry(w, h, l, 4, 0.06), std(bagCols[i], 0.38 + R() * 0.3, i % 4 === 3 ? 0.7 : 0.05));
    shell.position.y = h / 2 + 0.01; shell.castShadow = shell.receiveShadow = true; g.add(shell);
    const zip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.006, 0.012, l + 0.006), std('#0d0d0d', 0.6)); zip.position.y = h * 0.55; g.add(zip);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), std('#111', 0.5)); handle.position.set(0, h * 0.5, l / 2 + 0.005); g.add(handle);
    for (const wx of [-w / 2 + 0.05, w / 2 - 0.05]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 12), std('#0a0a0a', 0.7)); wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.03, -l / 2 + 0.03); g.add(wh); }
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.11), std('#efe7d2', 0.8)); tag.position.set(0.04, h * 0.5, l / 2 + 0.03); tag.rotation.x = -0.4; g.add(tag);
    const phone = new THREE.Group(); phone.position.set((R() - 0.5) * 0.1, h + 0.016, (R() - 0.5) * 0.12); phone.rotation.y = (R() - 0.5) * 0.8;
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.078, 0.009, 0.16, 2, 0.004), std('#0b0c0d', 0.25, 0.6)); body.castShadow = true; phone.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.15), new THREE.MeshBasicMaterial({ map: phoneOff, color: new THREE.Color(1.6, 1.6, 1.6) })); scr.rotation.x = -Math.PI / 2; scr.position.y = 0.0052; phone.add(scr);
    g.add(phone);
    const ad = phoneAd(i % 8), bought = phoneBought(i % 8);
    phoneScreens.push({ mat: scr.material, ad, bought, wake: 37.2 + i * 0.35, buy: 39.6 + i * 0.42, light: null });
    scene.add(g);
    BAGS.push({ g, s0: i * (P / 12) + R() * 0.4, lane: (R() - 0.5) * 0.14, yaw: (R() - 0.5) * 0.25 });
  }
  T.bags = BAGS; T.phones = phoneScreens; T.phoneOff = phoneOff;
  { // the hero phone (bag 2) turns so its screen reads from the ride-along camera at 39-43 s
    const hb = BAGS[2], a = stadium(hb.s0 + BELT.v * 41.2, hb.lane).a, ph = hb.g.children.find((o) => o.isGroup);
    ph.rotation.y = -2 * a - Math.PI / 2 - hb.yaw + Math.PI * 0.1; ph.position.set(0.0, ph.position.y, 0.0);
  }

  // ---- delivery boxes: the purchases, arriving through the flaps
  const kraft = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#b48a5a'; x.fillRect(0, 0, w, h); const r = rng(12); for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(80,50,20,${r() * 0.12})`; x.fillRect(r() * w, r() * h, 2, 6); }
    x.fillStyle = 'rgba(210,190,150,0.9)'; x.fillRect(w * 0.42, 0, w * 0.16, h); x.fillStyle = 'rgba(30,30,30,0.85)'; x.fillRect(w * 0.1, h * 0.12, w * 0.24, h * 0.08); });
  const boxMat = std(0xffffff, 0.85, 0, { map: kraft });
  T.boxes = [];
  for (let j = 0; j < 52; j++) {
    const r = rng(100 + j), s = 0.24 + r() * 0.14;
    const m = new THREE.Mesh(new RoundedBoxGeometry(s * (1 + r() * 0.4), s * (0.6 + r() * 0.4), s, 2, 0.012), boxMat);
    m.castShadow = m.receiveShadow = true; m.visible = false; scene.add(m);
    T.boxes.push({ m, t0: 40.2 + j * 0.3, lane: (j % 2 ? 1 : -1) * (0.08 + r() * 0.12), yaw: (r() - 0.5) * 0.6, stack: j % 5 === 4, h: m.geometry.parameters.height });
  }

  // ---- the back hall: a wall of screens writing adverts, a robot arm tagging bags
  const back = new THREE.Group(); scene.add(back);
  const bhFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), std('#1b1c1e', 0.75, 0.1, { roughnessMap: roughMap })); bhFloor.rotation.x = -Math.PI / 2; bhFloor.position.set(0, 0.002, -15); bhFloor.receiveShadow = true; back.add(bhFloor);
  const bhWall = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 0.3), std('#141517', 0.9)); bhWall.position.set(0, 3, -21); back.add(bhWall);
  const rack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.4, 8.6), std('#0e0f10', 0.6, 0.6)); rack.position.set(-2.55, 1.8, -14); back.add(rack);
  T.wall = [];
  for (let row = 0; row < 7; row++) for (let col = 0; col < 14; col++) {
    const tex = cellTex(atlas, (row * 3 + col) % 8), m = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.36), glow(tex, 1.1));
    m.position.set(-2.4, 0.45 + row * 0.44, -10.2 - col * 0.6); m.rotation.y = Math.PI / 2; back.add(m); T.wall.push({ tex, k: row * 14 + col });
  }
  const screenLight = new THREE.PointLight('#ffc9a0', 6, 7, 1.6); screenLight.position.set(-1.6, 1.8, -13); back.add(screenLight);
  const work = new THREE.SpotLight('#f4f1ea', 70, 9, 0.55, 0.5, 1.5); work.position.set(1.4, 4.4, -13.4); work.target.position.set(0.6, 0.6, -13.4); work.castShadow = true; work.shadow.mapSize.set(1024, 1024); back.add(work, work.target);
  // the arm: base, shoulder, upper arm, forearm, a tag gripper
  const armMat = std('#d9a320', 0.42, 0.25), jointMat = std('#2a2b2d', 0.4, 0.7);
  const arm = new THREE.Group(); arm.position.set(1.35, 0, -13.4); back.add(arm);
  const abase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.5, 32), jointMat); abase.position.y = 0.25; abase.castShadow = true; arm.add(abase);
  const yawG = new THREE.Group(); yawG.position.y = 0.5; arm.add(yawG);
  const sh = new THREE.Group(); sh.position.y = 0.2; yawG.add(sh);
  const shJ = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 24), jointMat); shJ.rotation.z = Math.PI / 2; sh.add(shJ);
  const up = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.9, 0.22, 3, 0.05), armMat); up.position.y = 0.45; up.castShadow = true; sh.add(up);
  const el = new THREE.Group(); el.position.y = 0.9; sh.add(el);
  const elJ = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 24), jointMat); elJ.rotation.z = Math.PI / 2; el.add(elJ);
  const fore = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.75, 0.17, 3, 0.04), armMat); fore.position.y = 0.375; fore.castShadow = true; el.add(fore);
  const wr = new THREE.Group(); wr.position.y = 0.75; el.add(wr);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.1), jointMat); wr.add(grip);
  const tagHeld = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.12), std('#efe7d2', 0.8)); tagHeld.position.y = 0.1; wr.add(tagHeld);
  T.arm = { yawG, sh, el, wr, tagHeld };
  const lead = BAGS[3].g.clone(true); scene.add(lead); T.leadBag = lead;
  const wallPool = new THREE.SpotLight('#ffd9a6', 45, 9, 0.5, 0.7, 1.4); wallPool.position.set(0.4, 5.6, -4.2); wallPool.target.position.set(0, 1.6, -7.6); scene.add(wallPool, wallPool.target);
  // a bag on the back conveyor, under the arm
  const bb = BAGS[0].g.clone(true); back.add(bb); T.backBag = bb;
  const bb2 = BAGS[5].g.clone(true); back.add(bb2); T.backBag2 = bb2;

  // ---- the help desk: one warm lamp, a bell, an empty chair
  const desk = new THREE.Group(); desk.position.set(8.2, 0, 2.2); desk.rotation.y = -0.9; scene.add(desk);
  const counter = new THREE.Mesh(new RoundedBoxGeometry(2.2, 1.05, 0.7, 3, 0.04), std('#5d5a55', 0.55, 0.1)); counter.position.y = 0.525; counter.castShadow = counter.receiveShadow = true; desk.add(counter);
  const top = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.05, 0.8, 2, 0.02), std('#3a2f28', 0.35, 0.1)); top.position.y = 1.07; desk.add(top);
  const bellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.02, 32), std('#222', 0.4, 0.5)); bellBase.position.set(-0.4, 1.105, 0.1); desk.add(bellBase);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.055, 32, 16, 0, TAU, 0, Math.PI / 2), std('#d8dde2', 0.12, 1)); bell.position.set(-0.4, 1.115, 0.1); bell.castShadow = true; desk.add(bell);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42), std('#222', 0.4, 0.6)); lampPole.position.set(0.6, 1.3, -0.1); desk.add(lampPole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.14, 24, 1, true), std('#2b2b2b', 0.5, 0.4, { side: THREE.DoubleSide })); shade.position.set(0.6, 1.52, -0.1); desk.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.6, 2) })); bulb.position.set(0.6, 1.46, -0.1); desk.add(bulb);
  const deskLight = new THREE.PointLight('#ffb46a', 6, 5, 1.6); deskLight.position.set(0.6, 1.4, -0.1); desk.add(deskLight);
  const mon = new THREE.Group(); mon.position.set(-0.05, 1.1, -0.15); mon.rotation.y = 0.35; desk.add(mon);
  const monBody = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.32, 0.03, 2, 0.01), std('#141516', 0.4, 0.5)); monBody.position.y = 0.26; mon.add(monBody);
  const monStand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.05), std('#141516', 0.4, 0.5)); monStand.position.y = 0.06; mon.add(monStand);
  const monScr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.28), new THREE.MeshBasicMaterial({ map: phoneOff })); monScr.position.set(0, 0.26, 0.016); mon.add(monScr);
  T.monitor = { mat: monScr.material, ad: cellTex(atlas, 2), off: phoneOff };
  const wait = new THREE.Group(); wait.position.set(-0.95, 0, 0.8); wait.rotation.y = Math.PI + 0.55; desk.add(wait);
  const wSeat = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.08, 0.46, 2, 0.03), seatMat); wSeat.position.y = 0.46; wSeat.castShadow = true; wait.add(wSeat);
  const wBack = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.52, 0.06, 2, 0.03), seatMat); wBack.position.set(0, 0.74, 0.21); wBack.rotation.x = -0.1; wBack.castShadow = true; wait.add(wBack);
  for (const lx of [-0.2, 0.2]) for (const lz of [-0.18, 0.18]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44), beamMat); leg.position.set(lx, 0.22, lz); wait.add(leg); }
  const chairSeat = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.07, 0.44, 2, 0.02), seatMat); chairSeat.position.set(0.1, 0.5, -0.75); desk.add(chairSeat);
  const chairBack = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.5, 0.06, 2, 0.02), seatMat); chairBack.position.set(0.1, 0.8, -0.98); desk.add(chairBack);
  const deskSign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.32), glow(sign([{ s: 'BAGGAGE SERVICES', px: 52, y: 64, ink: '#ffffff' }], 512, 128, { bg: '#1b2a3a' }), 1.0));
  deskSign.position.set(0, 1.7, -0.6); desk.add(deskSign);

  // ---- lights: two warm spots over the carousel (soft shadows), a cool fill, the hall's ambience
  const spotA = new THREE.SpotLight('#ffd7a8', 95, 18, 0.62, 0.55, 1.4); spotA.position.set(-2.6, 6.6, 1.2); spotA.target.position.set(-1.5, 0.5, 0);
  const spotB = new THREE.SpotLight('#ffd7a8', 95, 18, 0.62, 0.55, 1.4); spotB.position.set(2.6, 6.6, -1.2); spotB.target.position.set(1.5, 0.5, 0);
  for (const s of [spotA, spotB]) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.radius = 5; s.shadow.bias = -0.0004; scene.add(s, s.target); }
  const fill = new THREE.DirectionalLight('#cfdcef', 0.55); fill.position.set(4, 8, 6); scene.add(fill);
  scene.add(new THREE.HemisphereLight('#9fb3c8', '#2a2622', 0.35));
  const deskSpot = new THREE.SpotLight('#cfe0ff', 25, 10, 0.5, 0.6); deskSpot.position.set(8.5, 6.5, 4); deskSpot.target = desk; scene.add(deskSpot);

  // ---------------------------------------------------------------- the one shot
  const KEYS = [
    [0, [-3.6, 0.98, 2.62], [0.4, 0.5, 1.9], 40],
    [5, [1.2, 1.0, 2.66], [4.8, 0.6, 0.8], 40],
    [9.5, [4.9, 1.9, 2.4], [2.0, 1.7, -1.4], 38],
    [14, [3.2, 3.3, -3.7], [-1.2, 1.9, 0.6], 36],
    [18, [0.5, 1.25, -3.3], [0, 0.95, -7.7], 38],
    [21, [0, 1.0, -6.9], [0, 0.98, -9.5], 44],
    [23.5, [0.05, 1.15, -8.8], [-1.4, 1.35, -11.2], 42],
    [28, [0.7, 1.45, -11.4], [-2.4, 1.7, -12.8], 40],
    [31.2, [2.9, 1.65, -11.5], [0.4, 1.25, -13.8], 40],
    [34.2, [0.1, 1.1, -11.6], [0, 0.85, -7.4], 40],
    [36.6, [0, 0.98, -7.0], [0, 0.78, -3.0], 42],
    [40, [-1.4, 1.2, -2.9], [-3.6, 0.6, -1.0], 40],
    [45.5, [-2.6, 2.6, 5.4], [0, 0.6, 0.2], 38],
    [50, [-1.8, 4.6, 8.2], [0.2, 0.5, -0.6], 36],
    [55, [6.3, 1.5, 4.2], [8.0, 1.12, 2.2], 32],
    [63, [6.35, 1.55, 4.05], [7.65, 0.98, 2.1], 34],
  ];
  const cr = (p0, p1, p2, p3, u) => { const u2 = u * u, u3 = u2 * u; return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3); };
  function shot(t) {
    let i = KEYS.findIndex((k, n) => n < KEYS.length - 1 && t < KEYS[n + 1][0]); if (i < 0) i = KEYS.length - 2;
    const a = KEYS[Math.max(0, i - 1)], b = KEYS[i], c = KEYS[i + 1], d = KEYS[Math.min(KEYS.length - 1, i + 2)];
    let u = clamp((t - b[0]) / (c[0] - b[0])); if (i === KEYS.length - 2) u = smooth(u) * 0.5 + u * 0.5;
    const v = (k) => [0, 1, 2].map((j) => cr(a[k][j], b[k][j], c[k][j], d[k][j], u));
    return { p: v(1), l: v(2), fov: cr(a[3], b[3], c[3], d[3], u) };
  }

  // ---------------------------------------------------------------- time
  function setTime(t, frame) {
    const sh0 = shot(t);
    const hand = 0.004 * Math.sin(t * 1.3) + 0.003 * Math.sin(t * 2.7 + 1);   // a little operator on the rig
    camera.position.set(sh0.p[0] + hand, sh0.p[1] + hand * 0.6, sh0.p[2]);
    const hb = T.bags[2], st2 = stadium(hb.s0 + BELT.v * t, hb.lane), wF = ease(t, 36.6, 38.0) * (1 - ease(t, 44.2, 46.0));
    if (wF > 0) {
      const nx = -Math.sin(st2.a), nz = Math.cos(st2.a), tx = Math.cos(st2.a), tz = Math.sin(st2.a);
      const lift = ease(t, 42.8, 45.2), fp = [st2.x + nx * (0.2 + 1.4 * lift) - tx * 0.1, BELT.y + 0.5 + 1.4 * lift, st2.z + nz * (0.2 + 1.4 * lift) - tz * 0.1], fl = [st2.x, BELT.y + 0.27, st2.z];
      camera.position.set(lerp(camera.position.x, fp[0], wF), lerp(camera.position.y, fp[1], wF), lerp(camera.position.z, fp[2], wF));
      sh0.l = sh0.l.map((v, j) => lerp(v, fl[j], wF)); sh0.fov = lerp(sh0.fov, 22, wF);
    }
    camera.lookAt(sh0.l[0], sh0.l[1], sh0.l[2]); camera.fov = sh0.fov; camera.updateProjectionMatrix();
    // slats ride the belt
    const S = T.slats, shift = BELT.v * t;
    for (let i = 0; i < S.n; i++) { const st = stadium(i * P / S.n + shift); S.e.set(0.06, st.a, 0); S.q.setFromEuler(S.e); S.p.set(st.x, BELT.y, st.z); S.m.compose(S.p, S.q, S.s); S.mesh.setMatrixAt(i, S.m); }
    S.mesh.instanceMatrix.needsUpdate = true;
    // bags ride the belt
    for (const b of T.bags) { const st = stadium(b.s0 + shift, b.lane); b.g.position.set(st.x, BELT.y + 0.012, st.z); b.g.rotation.set(0, st.a + Math.PI / 2 + b.yaw, 0); }
    // phones: dark, then an advert, then ORDER PLACED
    for (const ph of T.phones) { const map = t < ph.wake ? T.phoneOff : t < ph.buy ? ph.ad : ph.bought; if (ph.mat.map !== map) { ph.mat.map = map; ph.mat.needsUpdate = true; } }
    // boxes: down the feed out of the flaps, onto the belt
    let lastTop = null;
    for (const bx of T.boxes) {
      const a = t - bx.t0; bx.m.visible = a > 0; if (!bx.m.visible) continue;
      const feedLen = 5.5, fv = 1.4;
      if (a < feedLen / fv) { const z = -7.7 + a * fv; bx.m.position.set(bx.lane * 0.6, 0.57 + bx.h / 2, z); bx.m.rotation.set(0, bx.yaw * 0.3, 0); }
      else { const st = stadium(S_JOIN + (a - feedLen / fv) * BELT.v, bx.lane); bx.m.position.set(st.x, BELT.y + 0.03 + bx.h / 2 + (bx.stack ? 0.22 : 0), st.z); bx.m.rotation.set(0, st.a + bx.yaw, 0); }
    }
    // screens: a new advert every 1.5 s (the wall in the back hall: every 0.2 s)
    for (const s of T.screens) { const i = (Math.floor(t / 1.5) + s.k * 3) % 8; s.tex.offset.set((i % 4) * 0.25, 0.5 - Math.floor(i / 4) * 0.5); }
    for (const w of T.wall) { const i = (Math.floor(t / 0.2 + w.k * 0.37) * 5 + w.k) % 8; w.tex.offset.set((i % 4) * 0.25, 0.5 - Math.floor(i / 4) * 0.5); }
    // flaps swing as the camera (21-23.5 s, 34.2-37 s) or a box passes
    for (const [k, f] of T.flaps.entries()) {
      const camHit = smooth(clamp(1 - Math.abs(camera.position.z + 7.7) / 1.3)) * Math.max(0, 1 - Math.abs(camera.position.x - f.position.x) / 1.2);
      let boxHit = 0; for (const bx of T.boxes) { const a = t - bx.t0; if (a > 0 && a < 0.5) boxHit = Math.max(boxHit, (1 - Math.abs(a - 0.2) / 0.3) * Math.max(0, 1 - Math.abs(bx.lane * 0.6 - f.position.x) / 0.3)); }
      const dir = t < 30 ? 1 : -1;
      f.rotation.x = dir * 1.4 * camHit + 0.7 * Math.max(0, boxHit) + 0.04 * Math.sin(t * 3 + k);
    }
    // the arm tags the bag passing under it (26-31 s)
    const A = T.arm, k1 = ease(t, 26.2, 27.2), k2 = ease(t, 27.6, 28.3), k3 = ease(t, 28.8, 29.8);
    A.yawG.rotation.y = lerp(0.9, -0.15, k1) + lerp(0, 0.85, k3);
    A.sh.rotation.z = lerp(0.35, 0.95, k1) - 0.1 * k2 - lerp(0, 0.6, k3);
    A.el.rotation.z = lerp(1.4, 1.75, k1) + 0.25 * k2 - lerp(0, 0.4, k3);
    A.tagHeld.visible = t < 28.3;
    const bz = -10.2 - (t - 22) * 0.45; T.backBag.position.set(0, 0.57, Math.max(-16.5, bz)); T.backBag.rotation.set(0, Math.PI / 2, 0);
    T.backBag2.position.set(0, 0.57, -9.0 + Math.min(0, -(t - 30) * 0.9)); T.backBag2.rotation.set(0, Math.PI / 2, 0);
    // the lead bag: on the feed, going in ahead of the camera (15.5-21.6 s); gone behind the flaps after
    const lz = -2.6 - Math.max(0, t - 15.5) * 0.9; T.leadBag.visible = t > 15 && lz > -9.2;
    T.leadBag.position.set(0.02, 0.57, lz); T.leadBag.rotation.set(0, Math.PI / 2 + 0.05, 0);
    // the desk monitor wakes at 57.0 s: an advert for nobody, to an empty chair
    const mm = t < 57.0 ? T.monitor.off : T.monitor.ad; if (T.monitor.mat.map !== mm) { T.monitor.mat.map = mm; T.monitor.mat.needsUpdate = true; }
    // the desk lamp breathes a little
    deskLight.intensity = 6 * (1 + 0.03 * Math.sin(t * 9));
  }
    // the refrain of the ending: the lamp, then the monitor
  const lk = buildLook({ renderer, scene, camera, look, fps: 24, seed: 7, setTime });
  return { canvas: renderer.domElement, render: (frame, t) => lk.render(frame, t), info: 'three.js r' + THREE.REVISION };
}

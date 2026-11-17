// Vibe Editing reel: the whole edit as renderAt(frame).
// Layers per frame: room -> contact shadow -> text behind -> subject (matted, relit) -> text in front -> overlays -> grade.
'use strict';
const C = document.getElementById('c'), X = C.getContext('2d');
const W = 1080, H = 1920, FPS = 30, K0 = 1.5;          // source 720x1280 -> canvas 1080x1920
let D, ASSET, ROOMS = {}, FGIMG = null, RAWIMG = null, PROFILE = [], PROFIMG = null, frameIdx = 0, CUR = null;
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const SUB = mk(), SX = SUB.getContext('2d');
const TMP = mk(), TX = TMP.getContext('2d');
const TMP2 = mk(), TX2 = TMP2.getContext('2d');
const GRAIN = mk(512, 512);
// ---------- math ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => cl((v - a) / (b - a));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const eo5 = t => 1 - Math.pow(1 - t, 5);
const ei = t => t * t * t;
const back = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const bounce = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const wt = i => D.words[i].os - 0.04;          // lead the audio by ~1 frame
// ---------- loading ----------
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load ' + src)); i.src = src; }); }
const cache = new Map();
async function img(p) { if (cache.has(p)) return cache.get(p); const i = await loadImg(p); cache.set(p, i); if (cache.size > 40) cache.delete(cache.keys().next().value); return i; }
const pad = n => String(n).padStart(5, '0');
window.init = async (data) => {
  D = data; ASSET = data.asset;
  for (const [k, f] of Object.entries(data.rooms)) ROOMS[k] = await loadImg(f);
  PROFILE = data.profile;
  await document.fonts.ready;
  for (const f of ['PF7', 'PF9', 'PF5', 'IS', 'AN', 'PO', 'JB', 'JM', 'IBI', 'IB', 'IX', 'AB']) await document.fonts.load(`40px ${f}`);
  const g = GRAIN.getContext('2d'), id = g.createImageData(512, 512), r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - .5) * 90; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  return true;
};
// ---------- camera ----------
// cam: {z, fx, fy, sx, sy}: source point (fx,fy) lands on screen (sx,sy), scale K0*z
function camFace(z, sy, fr, follow = 1, sxo = 0, fyo = 0) {
  const f = fr.face; const fx = lerp(360, f[0], follow), fy = f[1] + fyo;
  let s = sy; const k = K0 * z; s = Math.max(s, H - (1280 - fy) * k);   // never show the bottom edge of the plate
  return { z, fx, fy, sx: 540 + sxo, sy: s };
}
const S = (c, x, y) => [(x - c.fx) * K0 * c.z + c.sx, (y - c.fy) * K0 * c.z + c.sy];
function headOn(c, fr) { // head geometry on screen
  const f = fr.face, k = K0 * c.z; const [x, y] = S(c, f[0], f[1]); const [, top] = S(c, f[0], fr.top);
  return { x, y, w: f[2] * k, top };
}
// ---------- drawing primitives ----------
function T(str, x, y, o = {}) {
  const a = (o.alpha ?? 1); if (a <= 0.003) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y + (o.dy || 0)); if (o.rot) X.rotate(o.rot);
  const sc = o.scale ?? 1; X.scale(sc * (o.sxs ?? 1), sc * (o.sys ?? 1));
  X.font = `${o.size || 60}px ${o.font || 'IB'}`; X.textAlign = o.align || 'center'; X.textBaseline = o.base || 'alphabetic';
  X.letterSpacing = (o.ls || 0) + 'px';
  if ((o.blur || 0) > 0.4) X.filter = `blur(${o.blur.toFixed(1)}px)`;
  if (o.sh !== false) { X.shadowColor = o.shc || 'rgba(0,0,0,.42)'; X.shadowBlur = o.shb ?? 18; X.shadowOffsetY = o.shy ?? 4; }
  if (o.stroke) { X.lineJoin = 'round'; X.lineWidth = o.lw || 3; X.strokeStyle = o.stroke; X.strokeText(str, 0, 0); }
  if (o.fill !== null) { X.fillStyle = o.fill || '#fff'; X.fillText(str, 0, 0); }
  X.restore();
}
function mw(str, size, font, ls = 0) { X.save(); X.font = `${size}px ${font}`; X.letterSpacing = ls + 'px'; const w = X.measureText(str).width; X.restore(); return w; }
// entrance: blur-in (4-6 frames), returns props to merge
function enter(t, t0, d = 0.17, dist = 16) { const p = eo(inv(t0, t0 + d, t)); return { alpha: p, blur: (1 - p) * 20, scale: 1.08 - .08 * p, dy: (1 - p) * dist }; }
function leave(t, t1, d = 0.12) { const q = ei(inv(t1, t1 + d, t)); return q; }
// a line of words appearing one by one. items: [{s, t0, o}] laid out left->right, centred at x unless align given
function wline(t, items, x, y, align = 'center', gap = 0.28, exitAt = 99, exitKind = 'blur', exitDir = [0, -1]) {
  const ws = items.map(it => mw(it.s, it.o.size, it.o.font, it.o.ls || 0));
  const sp = items.map(it => it.o.size * gap);
  let tot = ws.reduce((a, b) => a + b, 0) + sp.slice(0, -1).reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
  const q = leave(t, exitAt);
  items.forEach((it, i) => {
    if (t >= it.t0) {
      const e = enter(t, it.t0, it.d || 0.17);
      const o = Object.assign({}, it.o, e, { align: 'left' });
      if (q > 0) { o.alpha *= (1 - q); o.blur = (o.blur || 0) + q * 22; o.dy = (o.dy || 0) + exitDir[1] * q * 60; }
      T(it.s, cx + (exitDir[0] * q * 80), y, o);
    }
    cx += ws[i] + sp[i];
  });
  return tot;
}
const SM = (s, sz = 54, f = 'IB') => ({ size: sz, font: f });
// ---------- subject ----------
function subjectLayer(c, im, tint = [255, 200, 150], tintA = .62, filt = 'brightness(.97) contrast(1.1) saturate(.92) sepia(.12)') {
  SX.setTransform(1, 0, 0, 1, 0, 0); SX.globalCompositeOperation = 'source-over'; SX.globalAlpha = 1; SX.filter = 'none';
  SX.clearRect(0, 0, W, H);
  const k = K0 * c.z; const ox = c.sx - c.fx * k, oy = c.sy - c.fy * k;
  SX.filter = filt; SX.drawImage(im, ox, oy, 720 * k, 1280 * k); SX.filter = 'none';
  SX.globalCompositeOperation = 'multiply'; SX.globalAlpha = tintA; SX.fillStyle = `rgb(${tint})`; SX.fillRect(0, 0, W, H);
  SX.globalAlpha = 1; SX.globalCompositeOperation = 'destination-in'; SX.drawImage(im, ox, oy, 720 * k, 1280 * k);
  SX.globalCompositeOperation = 'source-over';
  return SUB;
}
function drawSubjectShadow() { X.save(); X.globalAlpha = .38; X.filter = 'brightness(0) blur(26px)'; X.drawImage(SUB, 26, 18); X.restore(); }
function drawSub(alpha = 1) { X.save(); X.globalAlpha = alpha; X.drawImage(SUB, 0, 0); X.restore(); }
function silhouette(color, alpha = 1, detail = 0) { // flat silhouette of SUB
  TX.setTransform(1, 0, 0, 1, 0, 0); TX.globalCompositeOperation = 'source-over'; TX.clearRect(0, 0, W, H);
  TX.drawImage(SUB, 0, 0); TX.globalCompositeOperation = 'source-in'; TX.fillStyle = color; TX.fillRect(0, 0, W, H);
  TX.globalCompositeOperation = 'source-over';
  if (detail > 0) { TX.globalAlpha = detail; TX.globalCompositeOperation = 'source-atop'; TX.filter = 'grayscale(1) contrast(2) brightness(.6)'; TX.drawImage(SUB, 0, 0); TX.filter = 'none'; TX.globalAlpha = 1; TX.globalCompositeOperation = 'source-over'; }
  X.save(); X.globalAlpha = alpha; X.drawImage(TMP, 0, 0); X.restore();
}
// ---------- room ----------
function room(name, c, o = {}) {
  const im = ROOMS[name]; const base = Math.max(W / im.width, H / im.height) * (o.zoom || 1.08);
  const z = base * (1 + (c.z - 1) * .38);
  const w = im.width * z, h = im.height * z;
  const x = (W - w) / 2 - (c.fx - 360) * .25 * c.z + (o.dx || 0) - (c.sx - 540) * .3, y = (H - h) / 2 - (c.fy - 640) * .12 * c.z + (o.dy || 0);
  X.save(); X.filter = `blur(${(o.blur ?? (1.2 + (c.z - 1) * 4)).toFixed(1)}px) brightness(${o.bright ?? 1.12}) saturate(${o.sat ?? 1.08}) contrast(1.04)`;
  X.drawImage(im, x, y, w, h); X.restore();
}
function tintRoom(col, a, mode = 'multiply') { X.save(); X.globalCompositeOperation = mode; X.globalAlpha = a; X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore(); }
function glowAt(x, y, r, col, a) { X.save(); X.globalCompositeOperation = 'screen'; const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore(); }
// ---------- effects ----------
function vignette(a = .55) { const g = X.createRadialGradient(540, 900, 380, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,4,2,${a})`); X.fillStyle = g; X.fillRect(0, 0, W, H); }
function grain(a = .07) { X.save(); X.globalCompositeOperation = 'overlay'; X.globalAlpha = a; const r = rng(frameIdx * 13 + 1); const ox = -r() * 512, oy = -r() * 512; for (let y = oy; y < H; y += 512) for (let x = ox; x < W; x += 512) X.drawImage(GRAIN, x, y); X.restore(); }
function flash(col, a) { if (a <= 0) return; X.save(); X.globalAlpha = a; X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore(); }
function snapshot() { TX2.setTransform(1, 0, 0, 1, 0, 0); TX2.globalCompositeOperation = 'copy'; TX2.drawImage(C, 0, 0); TX2.globalCompositeOperation = 'source-over'; }
function whip(amount, dir = 1) { // directional motion blur of the composed frame
  if (amount < 0.01) return; snapshot(); X.save(); X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  const n = 9; for (let i = 0; i < n; i++) { X.globalAlpha = 1 / (i + 1) * 1.6; X.drawImage(TMP2, dir * (i - n / 2) * amount * 26, 0); }
  X.restore(); X.save(); X.globalAlpha = .35; X.drawImage(TMP2, 0, 0); X.restore();
}
function vblur(amount) { if (amount < 0.01) return; snapshot(); X.save(); const n = 5; for (let i = 0; i < n; i++) { X.globalAlpha = 1 / (i + 1); X.drawImage(TMP2, 0, (i - n / 2) * amount * 4); } X.restore(); }
function bracket(x, y, s, col, lw = 5, plus = false, a = 1) {
  X.save(); X.globalAlpha = a; X.strokeStyle = col; X.lineWidth = lw; X.lineCap = 'square'; const h = s / 2, L = s * .22;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { X.beginPath(); X.moveTo(x + sx * h, y + sy * (h - L)); X.lineTo(x + sx * h, y + sy * h); X.lineTo(x + sx * (h - L), y + sy * h); X.stroke(); }
  if (plus) { X.lineWidth = 3; for (const dx of [-s * .16, s * .16]) { X.beginPath(); X.moveTo(x + dx - 9, y - s * .1); X.lineTo(x + dx + 9, y - s * .1); X.moveTo(x + dx, y - s * .1 - 9); X.lineTo(x + dx, y - s * .1 + 9); X.stroke(); } }
  X.restore();
}
function ribbon(pts, p, lw = 40, cols = ['#5e3418', '#b77a45', '#e9b27a']) {
  if (p <= 0) return; X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
  const path = new Path2D(); path.moveTo(...pts[0]); for (let i = 1; i < pts.length; i += 3) path.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]);
  const L = 4000; X.setLineDash([L * p, L]);
  X.shadowColor = 'rgba(40,20,5,.35)'; X.shadowBlur = 24; X.shadowOffsetY = 12;
  X.strokeStyle = cols[0]; X.lineWidth = lw; X.stroke(path); X.shadowColor = 'transparent';
  X.strokeStyle = cols[1]; X.lineWidth = lw * .72; X.stroke(path);
  X.translate(-lw * .12, -lw * .16); X.strokeStyle = cols[2]; X.lineWidth = lw * .2; X.globalAlpha = .85; X.stroke(path);
  X.restore();
}
function extrude(str, x, y, o, depth = 14, dcol = '#6d6259') {
  for (let i = depth; i > 0; i--) T(str, x + i * .9, y + i * 1.1, Object.assign({}, o, { fill: dcol, sh: i === depth, shb: 30, shc: 'rgba(0,0,0,.6)', shy: 10, blur: o.blur }));
  T(str, x, y, Object.assign({}, o, { sh: false }));
}
function neon(str, x, y, size, font, col, a = 1, core = '#fff') {
  if (a <= 0) return;
  for (const [b, al] of [[60, .9], [28, 1], [10, 1]]) T(str, x, y, { size, font, fill: col, alpha: a * al, sh: true, shc: col, shb: b, shy: 0 });
  T(str, x, y, { size, font, fill: core, alpha: a, sh: true, shc: col, shb: 6, shy: 0 });
}
const GC = mk(), GX = GC.getContext('2d');
function gold(str, x, y, size, a, shine) {
  if (a <= 0) return; const MX = X; GX.setTransform(1, 0, 0, 1, 0, 0); GX.clearRect(0, 0, W, H);
  goldDraw(GX, str, x, y, size, shine); MX.save(); MX.globalAlpha = a; MX.drawImage(GC, 0, 0); MX.restore();
}
function goldDraw(X, str, x, y, size, shine) {
  X.save(); X.font = `${size}px AN`; X.textAlign = 'center'; X.letterSpacing = '4px';
  for (let i = 10; i > 0; i--) { X.fillStyle = i === 10 ? 'rgba(0,0,0,.5)' : '#5b3a09'; if (i === 10) { X.shadowColor = 'rgba(0,0,0,.55)'; X.shadowBlur = 30; X.shadowOffsetY = 14; } X.fillText(str, x + i * .6, y + i * 1.2); X.shadowColor = 'transparent'; }
  const g = X.createLinearGradient(0, y - size * .8, 0, y + size * .05);
  g.addColorStop(0, '#fff6c9'); g.addColorStop(.28, '#f6cf5a'); g.addColorStop(.5, '#a8700f'); g.addColorStop(.62, '#f9d977'); g.addColorStop(1, '#8a5a0b');
  X.fillStyle = g; X.fillText(str, x, y);
  X.lineWidth = 2; X.strokeStyle = 'rgba(255,240,190,.75)'; X.strokeText(str, x, y);
  // moving shine
  X.globalCompositeOperation = 'source-atop';
  const sw = X.measureText(str).width, sxp = x - sw / 2 - 200 + (shine % 1) * (sw + 400);
  const sg = X.createLinearGradient(sxp - 50, 0, sxp + 50, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,240,.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  X.fillStyle = sg; X.fillRect(sxp - 60, y - size, 120, size * 1.2);
  X.restore();
}
function particlesFromText(drawFn, seed, step = 3) { // sample a text bitmap into particles (cached)
  TX.setTransform(1, 0, 0, 1, 0, 0); TX.clearRect(0, 0, W, H); const save = X; drawFn(TX);
  const d = TX.getImageData(0, 0, W, H).data, r = rng(seed), P = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 120) P.push([x, y, r(), r(), r()]);
  TX.clearRect(0, 0, W, H); return P;
}
const PCACHE = {};
function dust(key, drawFn, p, dir = [1, -.4]) {
  if (!PCACHE[key]) PCACHE[key] = particlesFromText(drawFn, key.length * 7);
  X.save(); X.fillStyle = '#fff';
  for (const [x, y, a, b, c] of PCACHE[key]) {
    const d = cl((p - c * .35) / .65); if (d <= 0) { X.globalAlpha = 1; X.fillRect(x, y, 2.6, 2.6); continue; }
    const e = eo(d); X.globalAlpha = (1 - d) * .9;
    X.fillRect(x + dir[0] * e * (160 + a * 340) + Math.sin(b * 20 + d * 6) * 30 * e, y + dir[1] * e * (100 + b * 260) - e * a * 80, 2.4, 2.4);
  }
  X.restore();
}
function cracks(cx, cy, p, seed = 3) {
  if (p <= 0) return; const r = rng(seed); X.save(); X.strokeStyle = 'rgba(25,14,8,.85)'; X.lineCap = 'round';
  for (let k = 0; k < 11; k++) {
    let a = r() * Math.PI * 2, x = cx + Math.cos(a) * 60, y = cy + Math.sin(a) * 40, len = 120 + r() * 260;
    X.beginPath(); X.moveTo(x, y); const segs = 9;
    for (let s = 1; s <= segs * p; s++) { a += (r() - .5) * .9; x += Math.cos(a) * len / segs; y += Math.sin(a) * len / segs; X.lineTo(x, y); }
    X.lineWidth = 3.2; X.stroke();
    X.strokeStyle = 'rgba(255,220,180,.18)'; X.lineWidth = 1.2; X.translate(1.5, 1.5); X.stroke(); X.translate(-1.5, -1.5); X.strokeStyle = 'rgba(25,14,8,.85)';
  }
  X.restore();
}
function debris(cx, cy, t, seed = 5) {
  if (t <= 0 || t > 1.2) return; const r = rng(seed); X.save();
  for (let i = 0; i < 70; i++) {
    const vx = (r() - .5) * 520, vy = -r() * 300, s = 2 + r() * 6, dl = r() * .15; const tt = Math.max(0, t - dl);
    const x = cx + (r() - .5) * 300 + vx * tt, y = cy + (r() - .3) * 60 + vy * tt + 1400 * tt * tt;
    X.globalAlpha = cl(1 - tt / 1.1) * .95; X.fillStyle = r() > .4 ? '#efe6dc' : '#8b7a6c'; X.fillRect(x, y, s, s * (.6 + r()));
  }
  X.restore();
}
function typeOn(str, t, t0, cps) { return str.slice(0, Math.max(0, Math.floor((t - t0) * cps))); }
function igRail(a, hi = -1, t = 0) { // ghost Instagram right-rail icons
  if (a <= 0) return; const ys = [1250, 1395, 1535, 1660]; X.save(); X.strokeStyle = '#fff'; X.lineWidth = 4.5; X.lineJoin = 'round'; X.lineCap = 'round';
  ys.forEach((y, i) => {
    const pop = cl((a * 4) - i * .5); if (pop <= 0) return; X.save(); X.globalAlpha = pop * (hi === i ? 1 : .8); const x = 1006, s = back(pop);
    X.translate(x, y); X.scale(s, s); X.beginPath();
    if (i === 0) { X.moveTo(0, 22); X.bezierCurveTo(-40, -6, -24, -36, 0, -16); X.bezierCurveTo(24, -36, 40, -6, 0, 22); }
    if (i === 1) { X.arc(0, -4, 24, .35 * Math.PI, 2.25 * Math.PI); X.lineTo(26, 22); X.closePath(); }
    if (i === 2) { X.moveTo(-26, -6); X.lineTo(28, -26); X.lineTo(8, 26); X.lineTo(0, 2); X.closePath(); X.moveTo(0, 2); X.lineTo(28, -26); }
    if (i === 3) { for (const dx of [-14, 0, 14]) { X.moveTo(dx + 3.5, 0); X.arc(dx, 0, 3.5, 0, Math.PI * 2); } }
    X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 10; X.stroke(); X.restore();
  });
  X.restore();
}
function handArrow(pts, p, a = 1) {
  if (p <= 0) return; X.save(); X.globalAlpha = a; X.strokeStyle = '#fff'; X.lineWidth = 6; X.lineCap = 'round'; X.lineJoin = 'round'; X.shadowColor = 'rgba(0,0,0,.4)'; X.shadowBlur = 10;
  const path = new Path2D(); path.moveTo(...pts[0]); path.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]);
  X.setLineDash([900 * p, 2000]); X.stroke(path); X.setLineDash([]);
  if (p > .85) { const [ex, ey] = pts[3], [cx, cy] = pts[2]; const ang = Math.atan2(ey - cy, ex - cx), q = inv(.85, 1, p) * 34; X.beginPath(); X.moveTo(ex - Math.cos(ang - .5) * q, ey - Math.sin(ang - .5) * q); X.lineTo(ex, ey); X.lineTo(ex - Math.cos(ang + .5) * q, ey - Math.sin(ang + .5) * q); X.stroke(); }
  X.restore();
}
function spark(x, y, r, rot, a, col = '#D97757') { // 10-ray rounded starburst
  if (a <= 0) return; X.save(); X.globalAlpha = a; X.translate(x, y); X.rotate(rot); X.strokeStyle = col; X.lineCap = 'round';
  for (let i = 0; i < 10; i++) { X.rotate(Math.PI / 5); X.lineWidth = r * (i % 2 ? .2 : .26); X.beginPath(); X.moveTo(r * .12, 0); X.lineTo(r * (i % 3 ? .95 : .78), 0); X.stroke(); }
  X.restore();
}
// ---------- orbit (words circling the head, sinking behind it) ----------
function orbit(t, words, hd, layer, life = 1.75, kill = 99) {
  const R = Math.min(hd.w * 1.45, 400), r = hd.w * .34, cx = hd.x, cy = hd.top + hd.w * .1;
  const SPD = 125 * Math.PI / 180, TH0 = 32 * Math.PI / 180, END = 200 * Math.PI / 180;
  let prevA = -1e9, prevW = 0;
  for (const w of words) {
    const size = w.size || 66, ww = mw(w.s, size, w.font || 'IB');
    const a = Math.max(SPD * w.t0, prevA + (prevW + ww) / 2 / R + 26 / R); prevA = a; prevW = ww;
    if (t < w.t0) continue;
    const th = TH0 + SPD * t - a; if (th > END + .3) continue;
    let x = cx + R * Math.cos(th), y = cy - r * Math.sin(th);
    if (th > 2.9) { const k = th - 2.9; y += k * hd.w * 2.6; x += k * hd.w * 1.1; }
    const back = Math.sin(th) > -.15 || th > 2.9;
    if ((layer === 'back') !== back) continue;
    const e = enter(t, w.t0, .16); const fade = (1 - inv(END - .1, END + .3, th)) * (1 - inv(kill, kill + .15, t));
    T(w.s, x, y, Object.assign({ size, font: w.font || 'IB' }, { alpha: e.alpha * fade, blur: e.blur, scale: (1 - .2 * Math.max(0, Math.sin(th))) * e.scale }));
  }
}
// ---------- path text ----------
function pathText(pts, glyphs, t) { // glyphs: [{ch, s(arc pos px), t0, size, font}]
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  let j = 0;
  for (const g of glyphs) {
    if (t < g.t0) continue; while (j < L.length - 2 && L[j + 1] < g.s) j++; if (g.s > L[L.length - 1]) break;
    const f = (g.s - L[j]) / Math.max(1e-6, L[j + 1] - L[j]); const x = lerp(pts[j][0], pts[j + 1][0], f), y = lerp(pts[j][1], pts[j + 1][1], f);
    const ang = Math.atan2(pts[j + 1][1] - pts[j][1], pts[j + 1][0] - pts[j][0]);
    const e = enter(t, g.t0, .1, 6);
    T(g.ch, x, y, { size: g.size, font: g.font, rot: ang, alpha: e.alpha, blur: e.blur * .5, scale: e.scale, base: 'middle', shb: 10 });
  }
}
function layoutPath(words, size0, gapPx = 0) { // returns glyph list with arc positions
  const out = []; let s = 40;
  for (const w of words) {
    const n = w.s.length;
    for (let i = 0; i < n; i++) { const ch = w.s[i]; const cw = mw(ch, w.size || size0, w.font || 'IB'); out.push({ ch, s: s + cw / 2, t0: w.t0 + i * (w.dt ?? .028), size: w.size || size0, font: w.font || 'IB' }); s += cw + 1; }
    s += (w.size || size0) * .35 + gapPx;
  }
  return out;
}
// ============================================================================================
//  SCENES (times are output seconds; cut points: 0.93 2.803 4.503 7.603 8.821 12.021 13.348 15.439
//  17.685 18.939 19.757 21.148 22.23 23.675 27.003 28.485 31.123 33.639)
// ============================================================================================
const CUTS = [0.93, 2.803, 4.503, 7.603, 8.821, 12.021, 13.348, 15.439, 17.685, 18.939, 19.757, 21.148, 22.23, 23.675, 27.003, 28.485, 31.123, 33.639];
const since = (t, a) => t - a;
function scene(t) {
  if (t < 2.803) return 'hook'; if (t < 4.503) return 'any'; if (t < 7.603) return 'vibe'; if (t < 8.821) return 'glow';
  if (t < 12.021) return 'bold'; if (t < 17.685) return 'claude'; if (t < 19.757) return 'track'; if (t < 22.23) return 'buttons';
  if (t < 23.675) return 'never'; if (t < 28.485) return 'mask'; if (t < 31.123) return 'room'; return 'cta';
}
async function fgFor(i) { return img(`${ASSET}/fg/${pad(D.frames[i].src)}.webp`); }
window.renderAt = async (i) => {
  frameIdx = i; const t = i / FPS, fr = D.frames[i], sc = scene(t);
  const fg = await fgFor(i);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none'; X.letterSpacing = '0px';
  X.fillStyle = '#120a06'; X.fillRect(0, 0, W, H);
  await SCENES[sc](t, fr, fg, i);
  return true;
};
const SCENES = {};
// ---------------------------------------------------------------- 1. HOOK
SCENES.hook = async (t, fr, fg) => {
  const z = 1.0 + .07 * eio(inv(0, 2.2, t)) + (t > .93 ? .07 : 0);
  const c = camFace(z, 960 - (z - 1) * 150, fr, .6);
  const hd = headOn(c, fr);
  // poster interlude for "behind me"
  const tb = wt(6);
  if (t >= tb - .07 && t < tb) { // 2-frame inverted matte flash
    subjectLayer(c, fg, [255, 255, 255], 0); X.fillStyle = '#050505'; X.fillRect(0, 0, W, H); silhouette('#f4f1ec', 1); X.save(); X.globalAlpha = .4; X.filter = 'blur(18px)'; X.drawImage(TMP, 0, 0); X.restore(); grain(.12); return;
  }
  if (t >= tb) return posterBehind(t, tb);
  room('curtain', c);
  const sub = subjectLayer(c, fg);
  // behind text
  const words = [{ s: 'these', t0: wt(2) }, { s: 'captions', t0: wt(3) }, { s: 'are', t0: wt(4) }, { s: 'moving', t0: wt(5) }];
  orbit(t, words, hd, 'back');
  // "look closely," top-left, later sinks behind the head
  const lk = since(t, 1.0);
  const lx = lerp(hd.x - hd.w * 1.15, hd.x - hd.w * .3, eio(cl(lk / .55))), ly = lerp(hd.top - 70, hd.top + hd.w * .95, eio(cl(lk / .55)));
  const le = enter(t, 0, .2);
  T('look', lx - 10, ly - 78, { size: 62, font: 'IB', alpha: le.alpha * (1 - inv(.35, .55, lk)), blur: le.blur, scale: le.scale });
  T('closely,', lx, ly, { size: 118, font: 'PF7', alpha: Math.min(enter(t, wt(1)).alpha, 1 - inv(.4, .6, lk)), blur: enter(t, wt(1)).blur, scale: enter(t, wt(1)).scale * (1 - .25 * cl(lk / .7)) });
  // subject with materialise intro
  if (t < 2 / 30) { /* empty room */ }
  else if (t < 5 / 30) { drawSubjectShadow(); silhouette('#fffaf2', 1); X.save(); X.globalAlpha = .9; X.filter = 'blur(30px)'; X.drawImage(TMP, 0, 0); X.restore(); }
  else { drawSubjectShadow(); drawSub(); const w = 1 - inv(5 / 30, 10 / 30, t); if (w > 0) { silhouette('#fffaf2', w); X.save(); X.globalAlpha = w * .8; X.filter = 'blur(30px)'; X.drawImage(TMP, 0, 0); X.restore(); } }
  orbit(t, words, hd, 'front');
  vignette(); grain(); if (t > .93 && t < .93 + .1) vblur(1 - inv(.93, 1.03, t));
};
let PROFILE_C = null;
async function posterBehind(t, tb) {
  const n = PROFILE.length; const k = Math.min(n - 1, Math.floor((t - tb) * 30) + 20); const pim = await img(`${ASSET}/fg/${pad(PROFILE[k])}.webp`);
  const c = { z: .9, fx: 360, fy: 640, sx: 470, sy: 1120 };
  X.fillStyle = '#F1EEE8'; X.fillRect(0, 0, W, H);
  const p1 = eo(inv(tb, tb + .4, t));
  ribbon([[80, -60], [-60, 420], [120, 820], [520, 760], [820, 700], [1000, 520], [1180, 640]], p1, 46);
  const e1 = enter(t, tb, .14), e2 = enter(t, wt(7), .14);
  T('behind', 300, 600, Object.assign({ size: 92, font: 'PF7', fill: '#16110d', sh: false }, e1));
  subjectLayer(c, pim, [255, 255, 255], 0, 'none'); silhouette('#0d0b0a', 1, .22);
  T('me.', 820, 1010, Object.assign({ size: 300, font: 'PF9', fill: '#16110d', sh: true, shc: 'rgba(241,238,232,.9)', shb: 18, shy: 0 }, e2));
  ribbon([[1180, 1260], [800, 1140], [400, 1420], [-90, 1330]], eo(inv(tb + .2, tb + .52, t)), 52);
  grain(.1);
}
// ---------------------------------------------------------------- 2. ANY OF IT
SCENES.any = async (t, fr, fg) => {
  const hit = wt(12);
  let shake = t > hit ? Math.exp(-(t - hit) * 9) * 22 : 0; const r = rng(Math.floor(t * 60));
  const c = camFace(1.2, 1010, fr, .9, 0, 120); c.sx += (r() - .5) * shake; c.sy += (r() - .5) * shake;
  const hd = headOn(c, fr);
  room('wall', c);
  const tx = 540, ty = Math.max(330, hd.top - 40);
  cracks(tx, ty - 60, eo(inv(hit, hit + .12, t)));
  // ANY OF IT (behind subject, slammed into the wall)
  if (t >= hit - .02) {
    const p = eo5(inv(hit - .02, hit + .1, t));
    const o = { size: 178, font: 'AB', fill: '#f4efe9', rot: -.09, scale: lerp(1.9, 1, p), blur: (1 - p) * 26, alpha: p, ls: 2 };
    extrude('ANY OF IT.', tx, ty, o, 12, '#7a6e64');
  }
  const sub = subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  debris(tx, ty - 40, t - hit);
  // lead-in line (front)
  const ex = hit - .05;
  wline(t, [{ s: 'and', t0: 2.80, o: SM(0, 60) }, { s: 'I', t0: wt(9), o: SM(0, 60) }, { s: "didn't", t0: wt(10), o: SM(0, 60) }], 540, Math.min(hd.y + hd.w * 2.35, 1400) - 150, 'center', .28, ex, 'blur', [0, 1]);
  wline(t, [{ s: 'animate', t0: wt(11), o: { size: 150, font: 'PF7' } }], 540, Math.min(hd.y + hd.w * 2.35, 1400), 'center', .28, ex, 'blur', [0, 1]);
  vignette(); grain(); flash('#fff', .5 * (1 - inv(hit, hit + .1, t)) * (t >= hit ? 1 : 0));
};
// ---------------------------------------------------------------- 3. VIBE EDITING
SCENES.vibe = async (t, fr, fg) => {
  const t0 = 4.503; const z = 1.0 + .05 * inv(t0, 7.6, t) + (t > 5.664 ? .08 : 0);
  const c = camFace(z, 1060, fr, .5); const hd = headOn(c, fr);
  room('living', c);
  // VIBE / EDITING stacked behind the head
  const vx = 540, wJ = 640, top = hd.top - 28 - (wJ / mw('VIBE', 100, 'AN', 6) * 100) * .82 - (wJ / mw('EDITING', 100, 'AN', 4) * 100) * .92;
  const exitV = wt(20) - .05, qv = leave(t, exitV, .16);
  const l1 = 'VIBE', l2 = 'EDITING';
  const s1 = wJ / mw(l1, 100, 'AN', 6) * 100, s2 = wJ / mw(l2, 100, 'AN', 4) * 100;
  for (const [s, sz, y, t1, ls] of [[l1, s1, top + s1 * .82, wt(18), 6], [l2, s2, top + s1 * .82 + s2 * .92, wt(19), 4]]) {
    if (t < t1) continue; const e = enter(t, t1, .16);
    T(s, vx, y - qv * 220, { size: sz, font: 'AN', ls, alpha: e.alpha * (1 - qv), blur: e.blur + qv * 18, scale: e.scale, sys: 1 - qv * .8, shb: 30, shc: 'rgba(0,0,0,.45)' });
  }
  const sub = subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  const cy = Math.min(hd.y + hd.w * 2.2, 1270);
  wline(t, [{ s: 'so', t0: wt(15), o: SM(0, 60) }, { s: 'this', t0: wt(16), o: SM(0, 60) }, { s: 'is', t0: wt(17), o: SM(0, 60) }], 540, cy - 120, 'center', .28, exitV);
  // no keyframes: timeline with diamonds that shatter
  if (t > wt(20) && t < wt(22) + .1) {
    const ty = cy + 40, q = leave(t, wt(22) - .06, .14);
    wline(t, [{ s: 'no', t0: wt(20), o: SM(0, 64) }, { s: 'keyframes,', t0: wt(21), o: { size: 64, font: 'JB' } }], 540, ty - 70, 'center', .3, wt(22) - .06);
    X.save(); X.globalAlpha = 1 - q; X.strokeStyle = 'rgba(255,255,255,.55)'; X.lineWidth = 3; X.beginPath(); X.moveTo(170, ty); X.lineTo(170 + 740 * eo(inv(wt(20), wt(20) + .25, t)), ty); X.stroke();
    const strike = eo(inv(wt(21) + .25, wt(21) + .45, t));
    for (let k = 0; k < 6; k++) {
      const x = 230 + k * 124, pop = back(cl((t - wt(20) - k * .04) / .14)); if (pop <= 0) continue;
      const fall = Math.max(0, strike * 1.3 - k * .05); X.save(); X.translate(x + fall * (k - 2.5) * 30, ty + fall * fall * 260); X.rotate(Math.PI / 4 + fall * (k % 2 ? 1 : -1) * 2); X.globalAlpha = (1 - q) * (1 - cl(fall)); X.fillStyle = '#f2c230'; X.shadowColor = 'rgba(242,194,48,.6)'; X.shadowBlur = 14; X.fillRect(-14 * pop, -14 * pop, 28 * pop, 28 * pop); X.restore();
    }
    if (strike > 0) { X.strokeStyle = '#ff4a4a'; X.lineWidth = 7; X.lineCap = 'round'; X.globalAlpha = 1 - q; X.beginPath(); X.moveTo(150, ty - 74); X.lineTo(150 + 780 * strike, ty - 74 + 6); X.stroke(); }
    X.restore();
  }
  // you just describe / the vibe.
  wline(t, [{ s: 'you', t0: wt(22), o: SM(0, 56) }, { s: 'just', t0: wt(23), o: SM(0, 56) }, { s: 'describe', t0: wt(24), o: SM(0, 56) }], 540, cy - 40, 'center', .28, 7.5);
  wline(t, [{ s: 'the', t0: wt(25), o: { size: 96, font: 'PF5' } }, { s: 'vibe.', t0: wt(26), o: { size: 190, font: 'PF9' } }], 540, cy + 150, 'center', .2, 7.5);
  vignette(); grain(); flash('#fff8ec', .95 * (1 - eo(inv(t0, t0 + .18, t))));
  if (t > 5.664 && t < 5.664 + .1) vblur(1 - inv(5.664, 5.76, t));
};
// ---------------------------------------------------------------- 4. GLOW (room relights)
SCENES.glow = async (t, fr, fg) => {
  const c = camFace(1.14, 940, fr, .7); const hd = headOn(c, fr);
  const g0 = wt(30); const red = 8.43, blue = 8.62;
  let col = null, a = 0, roomTint = null;
  if (t >= g0) {
    const fl = (Math.floor((t - g0) * 30) % 7 === 2 || Math.floor((t - g0) * 30) === 1) ? .35 : 1;
    if (t < red) { col = '#ffc65c'; roomTint = 'rgb(255,190,110)'; } else if (t < blue) { col = '#ff3d55'; roomTint = 'rgb(255,70,90)'; } else { col = '#5a9bff'; roomTint = 'rgb(80,140,255)'; }
    a = enter(t, g0, .1).alpha * fl * (1 - inv(8.76, 8.821, t));
  }
  room('living', c, { dx: -60 });
  const ty = Math.min(hd.y + hd.w * 2.0, 1330);
  if (roomTint) { tintRoom(roomTint, .55 * a); glowAt(540, ty - 50, 700, roomTint.replace('rgb', 'rgba').replace(')', ',A)'), .55 * a); }
  const tint = roomTint ? roomTint.match(/\d+/g).map(Number).map(v => lerp(255, v, .55 * a)) : [255, 214, 172];
  subjectLayer(c, fg, tint, .55); drawSubjectShadow(); drawSub();
  if (roomTint) glowAt(540, ty - 50, 420, roomTint.replace('rgb', 'rgba').replace(')', ',A)'), .25 * a);
  wline(t, [{ s: 'like', t0: 7.62, o: SM(0, 52) }, { s: 'make', t0: wt(28), o: SM(0, 52) }, { s: 'it', t0: wt(29), o: SM(0, 52) }], 540, ty - 170, 'center', .28, 8.76);
  if (col) neon('glow,', 540, ty + 40, 230, 'PO', col, a, t < red ? '#fff7e0' : '#fff');
  vignette(.6); grain();
};
// ---------------------------------------------------------------- 5. BIG AND BOLD / soft and elegant
SCENES.bold = async (t, fr, fg) => {
  const t0 = 8.821; const soft = t >= wt(36) - .1;
  const z = soft ? 1.12 : 1.3; const c = camFace(z, soft ? 880 : 860, fr, soft ? .7 : 1, soft ? 0 : -150);
  const hd = headOn(c, fr);
  room('living', c, { dx: 140 });
  // stacked justified caps behind the head (right side)
  const lft = hd.x + hd.w * .62 + 24, wJ = Math.min(440, W - 70 - lft), qx = leave(t, 10.18, .14), bx = lft + wJ / 2, top = hd.top - 260;
  const lines = [['BIG', wt(33)], ['AND', wt(34)], ['BOLD', wt(35)]]; let y = top;
  for (const [s, t1] of lines) {
    const sz = wJ / mw(s, 100, 'AN', 3) * 100; y += sz * .86;
    if (t >= t1 && qx < 1) { const e = enter(t, t1, .15); T(s, bx + qx * 420, y - qx * 380, { size: sz, font: 'AN', ls: 3, alpha: e.alpha * (1 - qx), blur: e.blur + qx * 20, scale: e.scale, sys: 1 - qx * .85, rot: qx * .35, shb: 34, shc: 'rgba(0,0,0,.5)' }); }
    y += 6;
  }
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  wline(t, [{ s: 'make', t0: wt(31), o: SM(0, 58) }, { s: 'it', t0: wt(32), o: SM(0, 58) }], Math.max(190, hd.x - hd.w * .9), hd.top - 40, 'center', .28, 10.18);
  // soft and elegant (front), dissolves to dust
  const cy = Math.min(hd.y + hd.w * 2.1, 1270), dz = inv(11.78, 12.02, t);
  const drawSoft = (ctx) => {
    const save = X; window.__X = ctx;
  };
  if (t >= wt(36)) {
    if (dz <= 0) {
      wline(t, [{ s: 'or', t0: wt(36), o: SM(0, 50) }], 540, cy - 210, 'center');
      wline(t, [{ s: 'soft', t0: wt(37), o: { size: 170, font: 'IS' } }, { s: 'and', t0: wt(38), o: { size: 110, font: 'IS' } }], 540, cy - 30, 'center', .22);
      wline(t, [{ s: 'elegant.', t0: wt(39), o: { size: 200, font: 'IS' } }], 540, cy + 150, 'center');
    } else {
      dust('soft', (ctx) => { ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '50px IB'; ctx.fillText('or', 540, cy - 210); ctx.font = '170px IS'; ctx.fillText('soft and', 540, cy - 30); ctx.font = '200px IS'; ctx.fillText('elegant.', 540, cy + 150); }, dz, [1, -.5]);
    }
  }
  vignette(); grain();
  whip(1 - eo(inv(t0, t0 + .14, t)), -1);
};
// ---------------------------------------------------------------- 6. CLAUDE writes the code
SCENES.claude = async (t, fr, fg) => {
  let z = 1.12, sxo = 0; if (t >= 13.348) { z = 1.24; sxo = 40; } if (t >= 15.439) { z = 1.1; sxo = -30; } if (t >= wt(52) - .1) z = 1.1 + .22 * eio(inv(wt(52) - .1, 17.6, t));
  const c = camFace(z, 930, fr, .8, sxo); const hd = headOn(c, fr);
  room('study', c);
  const ty = hd.top - 150;
  // Claude wordmark (behind head top)
  const cl0 = wt(41), clEnd = 13.348;
  const letters = 'Claude'; let lx = 540 - mw(letters, 170, 'IX', -4) / 2 - 50; const R = rng(41);
  if (t >= cl0 - .05 && t < clEnd + .5) {
    for (let k = 0; k < letters.length; k++) {
      const ch = letters[k], cw = mw(ch, 170, 'IX', -4); const st = cl0 + k * .035; const p = eo5(inv(st, st + .2, t));
      const ox = (R() - .5) * 700, oy = (R() - .5) * 500, rr = (R() - .5) * 2;
      const fall = inv(clEnd - .05, clEnd + .45, t); const fx = (R() - .5) * 300 * fall, fy = fall * fall * 900, frr = (R() - .5) * 3 * fall;
      if (p > 0) T(ch, lx + cw / 2 + (1 - p) * ox + fx, ty + (1 - p) * oy + fy, { size: 170, font: 'IX', fill: '#D97757', rot: (1 - p) * rr + frr, alpha: p * (1 - fall), blur: (1 - p) * 14, shb: 24, shc: 'rgba(40,10,0,.45)' });
      lx += cw - 4;
    }
    const sp = back(cl((t - cl0 - .22) / .25)); spark(lx + 60, ty - 58, 62 * sp, (t - cl0) * 2.5, cl(sp) * (1 - inv(clEnd - .05, clEnd + .2, t)));
  }
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  wline(t, [{ s: 'then', t0: wt(40), o: SM(0, 54) }], 540, ty - 175, 'center', .28, clEnd - .05);
  // code card (front-left)
  if (t >= wt(42) - .05 && t < 14.45) {
    const p = eo(inv(wt(42) - .05, wt(42) + .2, t)), q = leave(t, 14.32, .12);
    const x0 = 60, y0 = Math.min(hd.y + hd.w * 1.35, 1120), cw = 610, ch = 300;
    X.save(); X.globalAlpha = p * (1 - q); X.translate(0, (1 - p) * 40);
    X.fillStyle = 'rgba(18,11,7,.78)'; X.strokeStyle = 'rgba(255,214,170,.35)'; X.lineWidth = 2;
    X.beginPath(); X.roundRect(x0, y0, cw, ch, 22); X.fill(); X.stroke();
    for (const [k, col] of [[0, '#ff5f57'], [1, '#febc2e'], [2, '#28c840']]) { X.fillStyle = col; X.beginPath(); X.arc(x0 + 34 + k * 26, y0 + 30, 8, 0, 7); X.fill(); }
    X.font = '25px JM'; X.textAlign = 'left';
    const lines = [['> vibe', '#D97757', ' "warm, cinematic, premium"'], ['cut', '#9fd1ff', '.silences(0.14s)'], ['captions', '#9fd1ff', '.style(perPhrase)'], ['camera', '#9fd1ff', '.push("slow")'], ['render', '#f2c230', '()  ✓']];
    let tt = wt(42) + .05;
    lines.forEach(([a, colA, b], k) => { const full = a + b; const s = typeOn(full, t, tt, 120); tt += full.length / 120 + .03; X.fillStyle = colA; X.fillText(s.slice(0, a.length), x0 + 30, y0 + 82 + k * 44); X.fillStyle = '#f1e6da'; X.fillText(s.slice(a.length), x0 + 30 + X.measureText(a).width, y0 + 82 + k * 44); if (s.length && s.length < full.length) { X.fillStyle = '#f1e6da'; X.fillRect(x0 + 32 + X.measureText(s).width, y0 + 62 + k * 44, 13, 26); } });
    X.restore();
    wline(t, [{ s: 'writes', t0: wt(42), o: SM(0, 54) }, { s: 'the', t0: wt(43), o: SM(0, 54) }, { s: 'code', t0: wt(44), o: { size: 64, font: 'JB', fill: '#f2c230' } }], x0 + cw / 2, y0 - 34, 'center', .28, 14.32);
  }
  // that builds the edit,
  wline(t, [{ s: 'that', t0: wt(45), o: SM(0, 54) }, { s: 'builds', t0: wt(46), o: SM(0, 54) }], 540, hd.top - 220, 'center', .28, wt(49) - .1, 'blur', [0, -1]);
  wline(t, [{ s: 'the', t0: wt(47), o: { size: 90, font: 'PF5' } }, { s: 'edit,', t0: wt(48), o: { size: 150, font: 'PF9' } }], 540, hd.top - 70, 'center', .2, wt(49) - .1, 'blur', [0, -1]);
  // CUTS, (hard on, flash)  motions, (slides with trails)  captions, (type-spec overlay)
  const yC = hd.top - 120;
  if (t >= wt(49) && t < wt(50)) { T('CUTS,', 540, yC, { size: 230, font: 'AN', ls: 6, rot: -.04, shb: 30 }); }
  if (t >= wt(50) && t < wt(51) - .03) {
    const p = eo5(inv(wt(50), wt(50) + .18, t));
    for (let g = 4; g >= 0; g--) T('motions,', 540 - (1 - p) * 700 - g * 60 * (1 - p), yC, { size: 160, font: 'IBI', alpha: g ? .18 * (1 - p) + .05 : 1, blur: g ? 6 : (1 - p) * 10 });
  }
  if (t >= wt(51) - .03 && t < 16.08) {
    const e = enter(t, wt(51), .16), q = leave(t, 15.98, .12);
    const yy = yC + 10; T('captions,', 540, yy - q * 120, { size: 170, font: 'PF9', alpha: e.alpha * (1 - q), blur: e.blur + q * 16, scale: e.scale });
    const sp = eo(inv(wt(51) + .1, wt(51) + .35, t)) * (1 - q);
    if (sp > 0) {
      X.save(); X.globalAlpha = sp * .85; X.strokeStyle = '#fff'; X.lineWidth = 1.6; X.setLineDash([]);
      const x0 = 150, x1 = 150 + 790 * sp; for (const [yl, lab] of [[yy - 82, 'X-HEIGHT'], [yy, 'BASELINE']]) { X.beginPath(); X.moveTo(x0, yl); X.lineTo(x1, yl); X.stroke(); X.font = '20px JM'; X.fillStyle = '#fff'; X.textAlign = 'left'; X.fillText(lab, x1 - 20 + 30, yl + 7); for (let k = 0; k < 5; k++) { X.beginPath(); X.moveTo(x0 + k * 190 * sp, yl - 8); X.lineTo(x0 + k * 190 * sp, yl + 8); X.stroke(); } }
      const cnt = cl((t - wt(51) - .1) / .45); const wv = Math.round(lerp(712, 540, eo(cnt))), tr = Math.round(lerp(18, 0, eo(cnt)));
      X.font = '24px JM'; X.textAlign = 'center'; X.fillStyle = '#f2c230'; X.fillText(`WGHT ${wv}  TRACK +${tr}`, 540, yy + 48);
      X.restore();
    }
  }
  vignette(); grain();
  if (t >= wt(49) && t < wt(49) + 2 / 30) flash('#fff', .85);
  if (Math.abs(t - 13.348) < .05) vblur(.8); if (Math.abs(t - 15.439) < .05) vblur(.8);
};
// orbit for "even the words behind my head." lives inside claude scene (16.1+)
const _claude = SCENES.claude;
SCENES.claude = async (t, fr, fg) => {
  if (t < wt(52) - .1) return _claude(t, fr, fg);
  const z = 1.1 + .22 * eio(inv(wt(52) - .1, 17.6, t)); const c = camFace(z, 930, fr, .8, -30); const hd = headOn(c, fr);
  room('study', c);
  const words = [{ s: 'even', t0: wt(52) }, { s: 'the', t0: wt(53) }, { s: 'words', t0: wt(54) }, { s: 'behind', t0: wt(55) }, { s: 'my', t0: wt(56) }];
  orbit(t, words, hd, 'back', 1.5, wt(57) - .05);
  if (t >= wt(57)) { const e = enter(t, wt(57), .16); T('head.', hd.x, hd.top - hd.w * .02, Object.assign({ size: 250, font: 'PF9' }, e)); }
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  orbit(t, words, hd, 'front', 1.5, wt(57) - .05);
  vignette(); grain();
};
// ---------------------------------------------------------------- 7. TRACKS MY FACE (+ poster interlude)
function hud(c, fr, hd, a = 1, col = '#F2C230', snapT = 0, t = 0) {
  if (a <= 0) return; const s0 = hd.w * 1.25, p = eo(cl(snapT)); const s = lerp(s0 * 2.4, s0, p);
  bracket(hd.x, hd.y, s, col, 5, true, a * p);
  X.save(); X.globalAlpha = a * p; X.font = '22px JM'; X.fillStyle = col; X.textAlign = 'right';
  const conf = (0.91 + 0.03 * Math.sin(frameIdx * 1.7)).toFixed(3);
  X.fillText(`FACE ${conf}`, hd.x - s / 2 - 12, hd.y - s / 2 + 18);
  X.fillText(`X ${String(Math.round(fr.face[0] * 1.5)).padStart(4, '0')}  Y ${String(Math.round(fr.face[1] * 1.5)).padStart(4, '0')}`, hd.x - s / 2 - 12, hd.y - s / 2 + 46);
  X.restore();
}
SCENES.track = async (t, fr, fg, i) => {
  const t0 = 17.685, pA = 18.27, pB = 18.87, cut = 18.939;
  let c = camFace(t < cut ? 1.32 : 1.18, t < cut ? 800 : 860, fr, 1, t < cut ? 0 : 40); let hd = headOn(c, fr);
  if (t >= pA && t < cut) { // poster interlude
    c = camFace(1.0, 1000, fr, 1); hd = headOn(c, fr);
    subjectLayer(c, fg, [255, 255, 255], 0, 'none');
    const navy = t < pA + 2 / 30 || t >= pB;
    X.fillStyle = navy ? '#0F1A2E' : '#F1EEE8'; X.fillRect(0, 0, W, H);
    if (!navy) { ribbon([[-80, 640], [300, 380], [800, 260], [1180, 420]], eo(inv(pA, pA + .35, t)), 40); }
    else { ribbon([[-80, 640], [300, 380], [800, 260], [1180, 420]], 1, 40, ['#3b5a8a', '#8fb3e8', '#dbe8ff']); }
    const ink = navy ? '#f4f6fb' : '#16110d';
    const typed = typeOn('tracks my', t, pA + .02, 26); T(typed, 150, 400, { size: 92, font: 'PF7', fill: ink, align: 'left', sh: false });
    if (!navy && typed.length < 9 && Math.floor(t * 8) % 2 === 0) { X.fillStyle = ink; X.fillRect(150 + mw(typed, 92, 'PF7') + 8, 330, 34, 84); }
    // FACE revealed by a gold highlighter block
    const fx = 150, fy = 640, fs = 230; const letters = 'FACE'; let x = fx; const f0 = Math.max(wt(61), pA + .2);
    for (let k = 0; k < 4; k++) {
      const cw = mw(letters[k], fs, 'AN', 0) + 26; const st = f0 + k * .06;
      if (t >= st) T(letters[k], x, fy, { size: fs, font: 'AN', fill: ink, align: 'left', sh: false });
      if (t >= st - .06 && t < st + .1 && !navy) { X.fillStyle = '#e8b730'; X.fillRect(x, fy - fs * .78, cw * eo(inv(st - .06, st, t)), fs * .8); }
      x += cw;
    }
    silhouette(navy ? '#f4f6fb' : '#0d0b0a', 1, navy ? 0 : .12);
    if (!navy) ribbon([[1180, 1500], [700, 1300], [300, 1600], [-80, 1450]], eo(inv(pA + .12, pA + .45, t)), 46);
    hud(c, fr, hd, 1, navy ? '#4f7fd8' : '#E3A91C', 1);
    grain(.1); return;
  }
  room('lounge', c, { dx: -40 });
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  if (t < pA) {
    hud(c, fr, hd, 1, '#F2C230', (t - t0 - .02) / .2);
    wline(t, [{ s: 'it', t0: t0, o: SM(0, 54) }, { s: 'tracks', t0: wt(59), o: SM(0, 54) }, { s: 'my', t0: wt(60), o: SM(0, 54) }], hd.x, hd.y + hd.w * 1.3, 'center');
  } else {
    hud(c, fr, hd, 1, '#F2C230', 1);
    const fnum = String(i + 1).padStart(4, '0');
    const e = enter(t, cut, .14), q = leave(t, 19.7, .08);
    T('FRAME', 120, hd.top - 210, { size: 44, font: 'JB', fill: '#F2C230', align: 'left', alpha: e.alpha * (1 - q), blur: e.blur });
    T(fnum, 112, hd.top - 40, { size: 170, font: 'JB', fill: '#F2C230', align: 'left', alpha: e.alpha * (1 - q), blur: e.blur, ls: -6 });
    wline(t, [{ s: 'every', t0: cut, o: SM(0, 58) }, { s: 'frame,', t0: Math.max(cut + .05, wt(63)), o: { size: 100, font: 'PF7' } }], hd.x, hd.y + hd.w * 1.45, 'center', .25, 19.7);
  }
  vignette(); grain();
  whip(1 - eo(inv(t0, t0 + .14, t)), 1);
};
// ---------------------------------------------------------------- 8. INSTAGRAM BUTTONS
SCENES.buttons = async (t, fr, fg) => {
  const t0 = 19.757; const z = t < 21.148 ? 1.12 : 1.22;
  const c = camFace(z, 900, fr, .9, -90); const hd = headOn(c, fr);
  room('lounge', c, { dx: -40 });
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  const gl = inv(22.12, 22.23, t);
  const draw = () => {
    X.save(); X.translate(110, hd.top - 250); X.transform(1, -.1, -.08, 1, 0, 0);
    wline(t, [{ s: 'knows', t0: t0, o: SM(0, 60) }, { s: 'where', t0: wt(65), o: SM(0, 60) }], 0, 0, 'left');
    wline(t, [{ s: "Instagram's", t0: wt(66), o: { size: 118, font: 'IX', ls: -2 } }], 0, 120, 'left');
    wline(t, [{ s: 'buttons', t0: wt(67), o: { size: 140, font: 'PF9' } }, { s: 'sit.', t0: wt(68), o: { size: 140, font: 'PF7' } }], 0, 270, 'left', .22);
    X.restore();
  };
  if (gl <= 0) draw();
  else { // glitch-slice exit
    snapshot(); draw(); TX.setTransform(1, 0, 0, 1, 0, 0); TX.globalCompositeOperation = 'copy'; TX.drawImage(C, 0, 0); TX.globalCompositeOperation = 'source-over';
    X.drawImage(TMP2, 0, 0); const r = rng(Math.floor(t * 90));
    for (let y = hd.top - 420; y < hd.top + 200; y += 18) { const off = (r() - .5) * 260 * gl; X.save(); X.globalAlpha = (1 - gl) * .9; X.drawImage(TMP, 0, y, W, 18, off, y, W, 18); X.restore(); }
  }
  const ra = inv(wt(67), wt(67) + .3, t);
  igRail(ra, -1);
  if (ra > 0) { handArrow([[700, hd.top + 70], [880, hd.top + 120], [930, 1080], [960, 1200]], eo(inv(wt(67) + .1, wt(67) + .45, t)), 1 - gl); }
  vignette(); grain();
  if (Math.abs(t - 21.148) < .05) vblur(.7);
};
// ---------------------------------------------------------------- 9. NEVER GET COVERED
SCENES.never = async (t, fr, fg) => {
  const t0 = 22.23; const c = camFace(1.08, 930, fr, .7, -40); const hd = headOn(c, fr);
  room('lounge', c, { dx: -40 });
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  igRail(1, 1);
  // dashed safe-zone guide
  const p = eo(inv(t0, t0 + .35, t));
  X.save(); X.strokeStyle = 'rgba(255,255,255,.9)'; X.lineWidth = 3; X.setLineDash([14, 10]); X.lineDashOffset = -t * 40;
  X.beginPath(); X.moveTo(930, 230); X.lineTo(930, 230 + 1260 * p); X.stroke();
  X.beginPath(); X.moveTo(930, 1490); X.lineTo(930 - 860 * eo(inv(t0 + .15, t0 + .45, t)), 1490); X.stroke();
  X.setLineDash([]); X.font = '20px JM'; X.fillStyle = 'rgba(255,255,255,.85)'; X.textAlign = 'right'; X.globalAlpha = p; X.fillText('SAFE ZONE', 918, 1478); X.restore();
  wline(t, [{ s: 'so', t0: wt(69), o: SM(0, 60) }, { s: 'captions', t0: wt(70), o: SM(0, 60) }], 480, 1140, 'center');
  if (t >= wt(71)) {
    const e = enter(t, wt(71), .14); X.save();
    const g = X.createLinearGradient(0, 1240, 0, 1360); g.addColorStop(0, '#ff6b6b'); g.addColorStop(1, '#8b1a1a');
    T('never', 480, 1340, Object.assign({ size: 230, font: 'PF9', fill: g, shc: 'rgba(60,0,0,.6)', shb: 26 }, e));
    const r = rng(Math.floor(t * 30)); for (let k = 0; k < 9; k++) { X.globalAlpha = .8 * e.alpha; X.fillStyle = r() > .5 ? '#ff2d3d' : '#b0121f'; X.fillRect(200 + r() * 560, 1170 + r() * 200, 8 + r() * 22, 6 + r() * 10); }
    X.restore();
  }
  wline(t, [{ s: 'get', t0: wt(72), o: SM(0, 66) }, { s: 'covered.', t0: wt(73), o: SM(0, 66) }], 480, 1440, 'center');
  vignette(); grain();
};
// ---------------------------------------------------------------- 10. MASKING (path text) + stood here
SCENES.mask = async (t, fr, fg) => {
  const t0 = 23.675, melt = 27.003; const z = melt <= t ? .9 + .03 * inv(melt, 28.4, t) : .84 + .02 * inv(t0, melt, t);
  const c = { z, fx: 360, fy: 640, sx: 540, sy: H - 640 * K0 * z };
  const hd = headOn(c, fr);
  const studio = () => { const g = X.createRadialGradient(540, 1100, 60, 540, 1100, 1150); g.addColorStop(0, '#6a4128'); g.addColorStop(.45, '#3a2316'); g.addColorStop(1, '#0f0805'); X.fillStyle = g; X.fillRect(0, 0, W, H); const g2 = X.createRadialGradient(540, 330, 10, 540, 330, 520); g2.addColorStop(0, 'rgba(255,214,160,.25)'); g2.addColorStop(1, 'rgba(255,214,160,0)'); X.fillStyle = g2; X.fillRect(0, 0, W, H); };
  room('curtain', c, { dx: 30 });
  if (t >= melt) {
    const p = eo(inv(melt, melt + .38, t)); X.save(); X.beginPath();
    const n = 90, cx = 540, cy = 1050; for (let k = 0; k <= n; k++) { const a = k / n * Math.PI * 2; const rr = p * 1600 * (1 + .18 * Math.sin(a * 5 + t * 3) + .1 * Math.sin(a * 9 - t * 5)); X.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.1); }
    X.clip(); studio(); X.restore();
  }
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  // selection (marching ants) on the live contour
  const ct = D.contours[frameIdx];
  if (ct && t < melt + .1) {
    const pr = eo(inv(t0, t0 + .7, t)) * (1 - inv(melt - .05, melt + .1, t));
    const path = new Path2D(); ct.forEach(([x, y], k) => { const [sx, sy] = S(c, x, y); k ? path.lineTo(sx, sy) : path.moveTo(sx, sy); });
    X.save(); X.lineWidth = 2.6; X.setLineDash([12, 9]); X.lineDashOffset = -t * 60; X.strokeStyle = '#fff'; X.globalAlpha = pr; X.stroke(path);
    X.lineDashOffset = -t * 60 + 12; X.strokeStyle = 'rgba(0,0,0,.6)'; X.setLineDash([9, 12]); X.stroke(path); X.setLineDash([]);
    X.fillStyle = '#fff'; X.strokeStyle = '#333'; X.lineWidth = 1.5;
    ct.forEach(([x, y], k) => { if (k % 9) return; if (k / ct.length > pr * 1.05) return; const [sx, sy] = S(c, x, y); X.fillRect(sx - 6, sy - 6, 12, 12); X.strokeRect(sx - 6, sy - 6, 12, 12); });
    X.restore();
  }
  // text riding a path around the body
  if (D.textPath && t < melt + .1) {
    const ox = (fr.face[0] - D.textPath.face[0]), oy = (fr.face[1] - D.textPath.face[1]);
    const pts = D.textPath.pts.map(([x, y]) => S(c, x + ox, y + oy));
    if (!PCACHE.maskGlyphs) PCACHE.maskGlyphs = layoutPath([
      { s: 'normally', t0: wt(74) }, { s: "that's", t0: wt(75) }, { s: 'hours', t0: wt(76), size: 60, font: 'PF9', dt: .04 }, { s: 'of', t0: wt(77) }, { s: 'masking', t0: wt(78) }, { s: 'and', t0: wt(79) },
      { s: 'keyframing', t0: wt(80) }, { s: 'for', t0: wt(81) }, { s: 'one', t0: wt(82), size: 60, font: 'PF9' }, { s: 'reel.', t0: wt(83), size: 60, font: 'PF9' }], 38);
    X.save(); X.globalAlpha = 1 - inv(melt - .05, melt + .1, t); pathText(pts, PCACHE.maskGlyphs, t); X.restore();
  }
  if (t >= melt) {
    wline(t, [{ s: 'I', t0: melt, o: SM(0, 60) }, { s: 'just', t0: wt(85), o: SM(0, 60) }, { s: 'stood', t0: wt(86), o: SM(0, 60) }, { s: 'here', t0: wt(87), o: SM(0, 60) }], 540, hd.top - 260, 'center');
    wline(t, [{ s: 'and', t0: wt(88), o: { size: 110, font: 'PF5' } }, { s: 'talked.', t0: wt(89), o: { size: 190, font: 'PF9' } }], 540, hd.top - 70, 'center', .2);
  }
  vignette(.6); grain(.08);
};
// ---------------------------------------------------------------- 11. THIS ROOM isn't real
SCENES.room = async (t, fr, fg, i) => {
  const t0 = 28.485, roomW = wt(93), fl = roomW + .1, wire = wt(94), spot = 30.72, reveal = 30.84;
  const z = 1.5 + .06 * inv(t0, 31.1, t); const c = camFace(z, 840, fr, 1); const hd = headOn(c, fr);
  if (t >= reveal || (t >= fl && t < fl + 2 / 30)) { // the real room (raw footage, same framing)
    const raw = await img(`${ASSET}/raw/${pad(fr.src)}.jpg`); const k = K0 * c.z;
    X.save(); if (t < reveal) X.filter = 'brightness(1.35) saturate(.5) hue-rotate(-10deg)'; X.drawImage(raw, c.sx - c.fx * k, c.sy - c.fy * k, 720 * k, 1280 * k); X.restore();
    if (t < reveal) { tintRoom('rgb(120,170,255)', .35, 'screen'); return; }
    flash('#fff', .9 * (1 - eo(inv(reveal, reveal + .12, t)))); return;
  }
  const dark = eo(inv(wire, wire + .4, t));
  room('study', c); flash('#0e0805', dark * .94);
  // wireframe of the room
  if (t >= wire) {
    const p = eo(inv(wire, wire + .5, t)); X.save(); X.strokeStyle = 'rgba(255,240,225,.75)'; X.lineWidth = 2.2; X.lineCap = 'round';
    const vp = [540, 820], segs = [[[0, 260], vp], [[1080, 240], vp], [[0, 1700], vp], [[1080, 1720], vp], [[300, 0], [300, 520]], [[780, 0], [780, 520]], [[300, 520], [780, 520]], [[60, 700], [230, 640]], [[230, 640], [230, 900]], [[880, 980], [1040, 1040]]];
    for (const [a, b] of segs) { X.beginPath(); X.moveTo(...a); X.lineTo(lerp(a[0], b[0], p), lerp(a[1], b[1], p)); X.stroke(); }
    X.restore();
  }
  // ROOM outline, then recedes into depth
  if (t >= roomW) {
    const e = enter(t, roomW, .14), rq = eio(inv(wire, wire + .35, t));
    T('ROOM', 540, hd.top - 20 - rq * 200, { size: 300, font: 'AN', ls: 8, fill: null, stroke: '#fff', lw: 5, alpha: e.alpha * (1 - rq * .85), blur: e.blur, scale: e.scale * (1 - rq * .62), shb: 20, shc: 'rgba(255,255,255,.35)', shy: 0 });
  }
  subjectLayer(c, fg, [255, 214, 172], .5); drawSubjectShadow(); drawSub();
  wline(t, [{ s: 'oh,', t0: t0, o: SM(0, 64) }, { s: 'and', t0: wt(91), o: SM(0, 64) }, { s: 'this', t0: wt(92), o: SM(0, 64) }], 540, hd.y + hd.w * .95, 'center', .28, wire - .08);
  wline(t, [{ s: 'it', t0: wt(94), o: SM(0, 60) }, { s: "isn't", t0: wt(95), o: SM(0, 60) }], 540, hd.y + hd.w * .95, 'center', .28, spot);
  wline(t, [{ s: 'real', t0: wt(96), o: { size: 170, font: 'PF9' } }, { s: 'either.', t0: wt(97), o: { size: 130, font: 'PF7' } }], 540, hd.y + hd.w * 1.5, 'center', .2, spot);
  vignette(.65); grain();
  if (t >= spot) { const p = eo(inv(spot, reveal, t)); X.save(); X.globalCompositeOperation = 'screen'; const g = X.createRadialGradient(540, 300, 0, 540, 300, 80 + p * 2200); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.6, `rgba(255,250,240,${.9 * p})`); g.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore(); }
};
// ---------------------------------------------------------------- 12. CTA
SCENES.cta = async (t, fr, fg) => {
  const t0 = 31.123, c2 = 33.639; const z = t < c2 ? 1.06 : 1.0; const c = camFace(z, t < c2 ? 960 : 1000, fr, .6); const hd = headOn(c, fr);
  room('study', c);
  // VIBE in gold behind the head
  if (t >= wt(108) - .05) {
    const letters = 'VIBE', sz = 300; let x = 540 - mw(letters, sz, 'AN', 4) / 2; const y = hd.top - 28;
    for (let k = 0; k < 4; k++) { const cw = mw(letters[k], sz, 'AN', 4); const st = wt(108) - .05 + k * .07; const p = cl((t - st) / .4); if (p > 0) gold(letters[k], x + cw / 2, y - (1 - bounce(p)) * 420, sz, cl(p * 3), (t - st) * .55 + k * .12); x += cw; }
  }
  subjectLayer(c, fg); drawSubjectShadow(); drawSub();
  const ex = c2 - .06;
  wline(t, [{ s: 'I', t0: t0, o: SM(0, 58) }, { s: 'teach', t0: wt(99), o: SM(0, 58) }, { s: 'this', t0: wt(100), o: SM(0, 58) }], 540, hd.top - 330, 'center', .28, ex);
  wline(t, [{ s: 'workflow', t0: wt(101), o: { size: 190, font: 'PF9' } }], 540, hd.top - 150, 'center', .2, ex);
  wline(t, [{ s: 'inside', t0: wt(102), o: SM(0, 58) }, { s: 'my', t0: wt(103), o: SM(0, 58) }, { s: 'academy.', t0: wt(104), o: { size: 120, font: 'PF7' } }], 540, hd.y + hd.w * 1.55, 'center', .25, ex);
  if (t >= c2) {
    wline(t, [{ s: 'so', t0: c2, o: SM(0, 52) }, { s: 'just', t0: wt(106), o: SM(0, 52) }], 540, hd.top - 425, 'center');
    // "comment" on an arc, letter by letter
    const word = 'comment', sz = 96, R = 900; const tot = mw(word, sz, 'IX'); let a0 = -tot / 2 / R;
    for (let k = 0; k < word.length; k++) { const cw = mw(word[k], sz, 'IX'); const a = a0 + cw / 2 / R; const st = wt(107) + k * .03; if (t >= st) { const e = enter(t, st, .12); const x = 540 + Math.sin(a) * R, y = hd.top - 318 + R - Math.cos(a) * R; T(word[k], x, y, Object.assign({ size: sz, font: 'IX', rot: a }, e)); } a0 += cw / R; }
    handArrow([[870, hd.top + 10], [1010, hd.top + 90], [1050, 1180], [1010, 1330]], eo(inv(wt(108) + .2, wt(108) + .65, t)));
    igRail(inv(wt(108) + .2, wt(108) + .5, t), 1);
    wline(t, [{ s: 'and', t0: wt(109), o: SM(0, 54) }, { s: 'I', t0: wt(110), o: SM(0, 54) }, { s: 'will', t0: wt(111), o: SM(0, 54) }, { s: 'send', t0: wt(112), o: SM(0, 54) }, { s: 'you', t0: wt(113), o: SM(0, 54) }], 540, Math.min(hd.y + hd.w * 1.45 + 160, 1430) - 150, 'center');
    wline(t, [{ s: 'the', t0: wt(114), o: { size: 96, font: 'PF5' } }, { s: 'details.', t0: wt(115), o: { size: 160, font: 'PF9' } }], 540, Math.min(hd.y + hd.w * 1.45 + 160, 1430), 'center', .2);
  }
  vignette(); grain();
  flash('#fff', .9 * (1 - eo(inv(t0, t0 + .15, t))));
  if (Math.abs(t - c2) < .05) vblur(.8);
};

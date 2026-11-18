// Ads 2–6: one renderer, per-ad beat lists. Look: Ink, Paper & Ember (same system as Ad 1).
'use strict';
const C = document.getElementById('c'), X = C.getContext('2d');
const W = 1080, H = 1920, FPS = 30;
const INK = '#110F0E', PAPER = '#ECE7DF', EMBER = '#F2641E', GOLD = '#FFC45C', CREAM = '#F6F0E6', MUTED = '#8C837B', CARD = '#181615';
let D, P = {}, GR, BEATS;
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const A = mk(), AX = A.getContext('2d'), B = mk(), BX = B.getContext('2d'), T1 = mk(), T1X = T1.getContext('2d'), T2 = mk(), T2X = T2.getContext('2d');
// ---------- math ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, inv = (a, b, v) => cl((v - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3), eo5 = t => 1 - Math.pow(1 - t, 5), ei = t => t * t * t;
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const spring = t => t >= 1 ? 1 : 1 - Math.exp(-7 * t) * Math.cos(9 * t);
const backo = t => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const wt = i => D.words[i].os - 0.03, we = i => D.words[i].oe;
function rng(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
// ---------- assets ----------
const load = s => new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => j(new Error(s)); i.src = s; });
const cache = new Map();
async function img(p) { if (cache.has(p)) return cache.get(p); const i = await load(p); cache.set(p, i); if (cache.size > 40) cache.delete(cache.keys().next().value); return i; }
const pad = n => String(n).padStart(5, '0');
const preOf = f => img(`${D.asset}/pre/${pad(D.frames[f].src)}.webp`), rawOf = f => img(`${D.asset}/raw/${pad(D.frames[f].src)}.jpg`);
window.init = async (data) => {
  D = data; for (const k of ['set', 'paper', 'paper2', 'paper3']) P[k] = await load(`${D.asset}/plates/${k}.png`);
  await document.fonts.ready; for (const f of ['ID8', 'ID9', 'ID9I', 'ID6', 'ID5', 'IS', 'JM', 'JB', 'GEN']) await document.fonts.load(`40px ${f}`);
  GR = document.createElement('canvas'); GR.width = GR.height = 512; const g = GR.getContext('2d'), id = g.createImageData(512, 512), r = rng(9);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - .5) * 70; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); BEATS = AD[D.ad](); return true;
};
// ---------- text ----------
function T(ctx, s, x, y, o = {}) {
  const a = o.alpha ?? 1; if (a <= .003 || !s) return 0;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${o.size || 60}px ${o.font || 'ID8'}`; ctx.letterSpacing = (o.track || 0) + 'px';
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic'; const w = ctx.measureText(s).width;
  ctx.translate(x + (o.dx || 0), y + (o.dy || 0)); if (o.rot) ctx.rotate(o.rot); const sc = o.scale ?? 1; ctx.scale(sc, sc);
  if ((o.blur || 0) > .3) ctx.filter = `blur(${o.blur.toFixed(1)}px)`;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowR || 26; }
  else if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = (o.size || 60) * .25; ctx.shadowOffsetY = (o.size || 60) * .05; }
  if (o.stroke) { ctx.lineWidth = o.lw || 3; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); }
  if (o.fill !== null) { ctx.fillStyle = o.fill || CREAM; ctx.fillText(s, 0, 0); }
  ctx.restore(); return w;
}
function mw(ctx, s, size, font, track = 0) { ctx.save(); ctx.font = `${size}px ${font}`; ctx.letterSpacing = track + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
const enter = (t, t0, d = .24) => { const p = eo(inv(t0, t0 + d, t)); return { alpha: p, blur: (1 - p) * 14, dy: (1 - p) * 22, scale: 1.05 - .05 * p }; };
function line(ctx, t, toks, y, tx = 1e9, cx = W / 2, gap = 18) {
  const ws = toks.map(k => mw(ctx, k.s, k.size, k.font, k.track || 0)); const tot = ws.reduce((a, b) => a + b, 0) + gap * (toks.length - 1);
  let x = cx - tot / 2; const q = eo(inv(tx, tx + .16, t));
  toks.forEach((k, i) => {
    const t0 = k.t0 ?? wt(k.i);
    if (t >= t0) { const e = enter(t, t0, k.d || .24); T(ctx, k.s, x + ws[i] / 2, y, Object.assign({}, k, { alpha: e.alpha * (1 - q), blur: e.blur + q * 12, dy: e.dy - q * 26, scale: e.scale })); }
    x += ws[i] + gap;
  });
}
const tok = (s, i, size, font = 'ID8', fill = CREAM, more = {}) => Object.assign({ s, i, size, font, fill, track: font.startsWith('ID') ? -size * .035 : 0 }, more);
const gold = (s, i, size, more = {}) => tok(s, i, size, 'IS', GOLD, Object.assign({ glow: 'rgba(255,196,92,.55)', glowR: 24 }, more));
const ser = (s, i, size, more = {}) => tok(s, i, size, 'IS', CREAM, more);
const htok = (s, i, size = 82) => tok(s, i, size, 'ID8', INK, { shadow: false }), etok = (s, i, size = 128) => tok(s, i, size, 'IS', EMBER, { shadow: false });
// two-line kinetic caption: small sans line + big serif payoff (the house style)
function cap2(ctx, t, small, big, tx, y1 = 1110, y2 = 1240) { if (small) line(ctx, t, small, y1, tx); if (big) line(ctx, t, big, y2, tx); }
// ---------- camera / layers ----------
function cam(f, z, faceY = 880, sx = 540) {
  const fr = D.frames[f], k = 1.5 * z, fy = fr.top + 150; return { z, k, fx: fr.fx, fy, sx, sy: Math.max(faceY, H - (1280 - fy) * k), top: fr.top };
}
function camL(f, a, b, p) { const c0 = cam(f, a[0], a[1], a[2] ?? 540), c1 = cam(f, b[0], b[1], b[2] ?? 540); return Object.assign({}, c1, { z: lerp(c0.z, c1.z, p), k: lerp(c0.k, c1.k, p), sy: lerp(c0.sy, c1.sy, p), sx: lerp(c0.sx, c1.sx, p) }); }
const headTop = c => c.sy + (c.top - c.fy) * c.k;
function drawRoom(ctx, c) { const s = 1.06 + (c.z - 1) * .3, w = W * s, h = H * s; ctx.drawImage(P.set, (W - w) / 2 - (c.sx - 540) * .25 - (c.fx - 360) * .2, (H - h) / 2 - (c.sy - 900) * .06, w, h); }
function drawSubject(ctx, im, c) { ctx.drawImage(im, c.sx - c.fx * c.k, c.sy - c.fy * c.k, 720 * c.k, 1280 * c.k); }
function finish(ctx, f, vig = .55) {
  const g = ctx.createRadialGradient(W / 2, H * .42, 420, W / 2, H * .5, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(6,4,3,${vig})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sg = ctx.createLinearGradient(0, 930, 0, 1380); sg.addColorStop(0, 'rgba(8,5,3,0)'); sg.addColorStop(.45, 'rgba(8,5,3,.42)'); sg.addColorStop(1, 'rgba(8,5,3,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 930, W, 450);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; const ox = -((f * 137) % 512), oy = -((f * 251) % 512);
  for (let y = oy; y < H; y += 512) for (let x = ox; x < W; x += 512) ctx.drawImage(GR, x, y); ctx.restore();
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function cardImg(ctx, src, x, y, w, h, r, shadow = .42, filter = 'none') {
  ctx.save(); if (shadow) { ctx.shadowColor = `rgba(40,22,10,${shadow})`; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26; rrect(ctx, x, y, w, h, r); ctx.fillStyle = '#000'; ctx.fill(); }
  ctx.restore(); ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip(); ctx.filter = filter; ctx.drawImage(src, x, y, w, h); ctx.restore();
}
async function premium(ctx, f, c, behind, front) {
  const pre = await preOf(f); ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); drawRoom(ctx, c);
  if (behind) behind(ctx, c); drawSubject(ctx, pre, c); finish(ctx, f); if (front) front(ctx, c);
}
// ---------- shared graphics ----------
function brackets(ctx, c, t0, t, col = GOLD) {
  const p = backo(cl((t - t0) / .35)), s = lerp(560, 330, cl(p)), fx = c.sx, fy = c.sy - 20 * c.k / 1.5;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = cl((t - t0) / .15);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x0 = fx + a * s / 2, y0 = fy + b * s * .62; ctx.beginPath(); ctx.moveTo(x0 - a * 44, y0); ctx.lineTo(x0, y0); ctx.lineTo(x0, y0 - b * 44); ctx.stroke(); }
  ctx.restore();
}
function button(ctx, t, t0, y = 1146, q = 1) {
  if (t < t0) return; const p = spring(cl((t - t0) / .55)), pulse = 1 + .025 * Math.pow(Math.sin(Math.PI * (t - t0) / .9), 8);
  ctx.save(); ctx.globalAlpha = cl(p * 1.5) * q; ctx.translate(W / 2, y); ctx.scale(lerp(.6, 1, p) * pulse, lerp(.6, 1, p) * pulse);
  ctx.shadowColor = 'rgba(242,100,30,.55)'; ctx.shadowBlur = 50; rrect(ctx, -330, -56, 660, 112, 56); ctx.fillStyle = EMBER; ctx.fill(); ctx.shadowColor = 'transparent';
  T(ctx, 'Learn the workflow  →', 0, 17, { size: 46, font: 'ID8', track: -1, fill: INK, shadow: false }); ctx.restore();
  ctx.save(); ctx.strokeStyle = '#F0E8DC'; ctx.lineWidth = 4; ctx.globalAlpha = q * cl((t - t0 - .2) / .2);
  const b = 8 * Math.abs(Math.sin((t - t0) * 5)); for (let j = 0; j < 2; j++) { const yy = y + 76 + j * 18 + b; ctx.beginPath(); ctx.moveTo(520, yy); ctx.lineTo(540, yy + 14); ctx.lineTo(560, yy); ctx.stroke(); }
  ctx.restore();
}
function paperBG(ctx, k = 'paper') { ctx.drawImage(P[k], 0, 0, W, H); }
function darkCard(ctx, x, y, w, h, p = 1) { ctx.save(); ctx.globalAlpha = p; ctx.shadowColor = 'rgba(40,22,10,.4)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26; rrect(ctx, x, y, w, h, 48); ctx.fillStyle = CARD; ctx.fill(); ctx.restore(); }
function heading(ctx, t, l1, l2, y1 = 400, y2 = 520) { line(ctx, t, l1, y1); if (l2) line(ctx, t, l2, y2); }
function chip(ctx, x, y, text, o = {}) {
  const size = o.size || 32, w = mw(ctx, text, size, o.font || 'ID6', -1) + 60, h = size + 34;
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; rrect(ctx, x, y, w, h, h / 2); ctx.fillStyle = o.fill || '#282523'; ctx.fill(); ctx.strokeStyle = o.stroke || '#48423D'; ctx.lineWidth = 2; ctx.stroke();
  T(ctx, text, x + 30, y + h / 2 + size * .36, { size, font: o.font || 'ID6', track: -1, align: 'left', fill: o.ink || CREAM, shadow: false }); ctx.restore(); return w;
}
function bubble(ctx, x, y, name, text, o = {}) {
  const w = o.w || 760, light = o.light, a = o.alpha ?? 1, typing = o.typing;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, o.dy || 0); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rrect(ctx, x, y, w, 116, 30); ctx.fillStyle = light ? '#FFFFFF' : '#2C2927'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = light ? '#DCC8B9' : '#96786A'; ctx.beginPath(); ctx.arc(x + 54, y + 58, 32, 0, 7); ctx.fill();
  T(ctx, name[0].toUpperCase(), x + 54, y + 70, { size: 32, font: 'ID8', fill: '#1E1A18', shadow: false });
  T(ctx, name, x + 108, y + 52, { size: 26, font: 'ID6', align: 'left', fill: MUTED, shadow: false });
  if (typing) { for (let k = 0; k < 3; k++) { ctx.fillStyle = light ? '#9A918A' : '#B5ACA5'; ctx.globalAlpha = a * (.4 + .6 * Math.abs(Math.sin(typing * 6 + k))); ctx.beginPath(); ctx.arc(x + 122 + k * 26, y + 84, 8, 0, 7); ctx.fill(); } }
  else T(ctx, text, x + 108, y + 94, { size: 36, font: 'ID6', track: -1, align: 'left', fill: light ? INK : CREAM, shadow: false });
  ctx.restore();
}
function nodes(ctx, t, t0, x0 = 90, y0 = 600, labels = ['Transcript', 'Cut', 'Matte', 'Type', 'Camera', 'Grade', 'Sound']) {
  darkCard(ctx, x0, y0, 900, 900);
  const pts = labels.map((n, i) => [x0 + (i % 2 ? 430 : 110), y0 + 70 + i * 116]), step = .15, ap = i => eo(inv(t0 + i * step, t0 + i * step + .3, t));
  for (let i = 0; i < labels.length - 1; i++) {
    const g = eo(inv(t0 + i * step + .1, t0 + (i + 1) * step + .1, t)); if (g <= 0) continue;
    const [ax, ay] = [pts[i][0] + 180, pts[i][1] + 34], [bx, by] = [pts[i + 1][0] + 180, pts[i + 1][1] + 34];
    ctx.save(); ctx.strokeStyle = EMBER; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(242,100,30,.8)'; ctx.shadowBlur = 16; ctx.beginPath();
    for (let u = 0; u <= g + 1e-6; u += .04) { const yy = ay + (by - ay) * (3 * u * u - 2 * u * u * u), xx = ax + (bx - ax) * u; u ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore();
  }
  labels.forEach((n, i) => {
    const a = ap(i); if (a <= 0) return; const [nx, ny] = pts[i]; ctx.save(); ctx.globalAlpha = a; ctx.translate(nx + 180, ny + 35); const s = .85 + .15 * backo(a); ctx.scale(s, s); ctx.translate(-180, -35);
    rrect(ctx, 0, 0, 360, 70, 35); ctx.fillStyle = '#282523'; ctx.fill(); ctx.strokeStyle = '#48423D'; ctx.lineWidth = 2; ctx.stroke();
    T(ctx, String(i + 1).padStart(2, '0'), 30, 47, { size: 24, font: 'JB', align: 'left', fill: EMBER, shadow: false }); T(ctx, n, 86, 48, { size: 34, font: 'ID6', track: -1, align: 'left', shadow: false }); ctx.restore();
  });
  const tp = t0 + labels.length * step + .2;
  if (t > tp) { const u = ((t - tp) / 1.6) % 1, seg = Math.min(labels.length - 2, Math.floor(u * (labels.length - 1))), v = u * (labels.length - 1) - seg;
    const [ax, ay] = [pts[seg][0] + 180, pts[seg][1] + 34], [bx, by] = [pts[seg + 1][0] + 180, pts[seg + 1][1] + 34];
    ctx.save(); ctx.fillStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(ax + (bx - ax) * v, ay + (by - ay) * (3 * v * v - 2 * v * v * v), 9, 0, 7); ctx.fill(); ctx.restore(); }
}
// the "everyone's AI edit" look (Part 1 only, always inside a labelled card)
function genericCaption(ctx, t, first, last, y = 1150) {
  let cur = first; for (let i = first; i <= last; i++) if (t >= wt(i)) cur = i;
  const s0 = cur - (cur - first) % 2, ws_ = [s0, s0 + 1].filter(i => i <= last);
  const fs = ws_.map(i => i === cur ? 106 : 92), strs = ws_.map(i => D.words[i].w.toUpperCase().replace(/[,.?!]/g, ''));
  const ws = strs.map((s, k) => mw(ctx, s, fs[k], 'GEN')); let x = W / 2 - (ws.reduce((a, b) => a + b, 0) + 26 * (ws.length - 1)) / 2;
  strs.forEach((s, k) => {
    const pop = ws_[k] === cur ? 1 + .22 * (1 - eo(inv(wt(cur), wt(cur) + .1, t))) : 1;
    ctx.save(); ctx.translate(x + ws[k] / 2, y); ctx.scale(pop, pop); ctx.font = `${fs[k]}px GEN`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, 0, 0); ctx.fillStyle = ws_[k] === cur ? '#FFE128' : '#fff'; ctx.fillText(s, 0, 0); ctx.restore(); x += ws[k] + 26;
  });
}
async function rawFrame(ctx, f, t, o = {}) {
  const raw = await rawOf(f), z = o.zoom || 1, k = z; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); if (o.filter) ctx.filter = o.filter; ctx.drawImage(raw, W / 2 - W * k / 2, H / 2 - H * k / 2 - (k - 1) * 120, W * k, H * k); ctx.restore();
}
const SP = { x: 160, y: 470, w: 760, h: 1351 };
function specChrome(ctx, t, label, chips, a = 1) {
  const g = ctx.createRadialGradient(W / 2, 700, 100, W / 2, 900, 1300); g.addColorStop(0, '#1A1715'); g.addColorStop(1, '#090808'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const e = enter(t, .02, .3);
  T(ctx, label, W / 2, 338, { size: 58, font: 'ID8', track: -2, alpha: e.alpha, blur: e.blur, dy: e.dy });
  let x = W / 2 - 430;
  chips.forEach(([at, lab], k) => {
    const s = `0${k + 1}  ${lab}`, w = mw(ctx, s, 24, 'JB', 1) + 44, c = eo(inv(at, at + .25, t));
    if (c > 0) { ctx.save(); ctx.globalAlpha = a * c; ctx.translate(0, (1 - c) * 12); rrect(ctx, x, 384, w, 46, 23); ctx.strokeStyle = EMBER; ctx.lineWidth = 2; ctx.stroke();
      T(ctx, s, x + 22, 416, { size: 24, font: 'JB', track: 1, align: 'left', fill: '#F3B38E', shadow: false }); ctx.restore(); }
    x += w + 14;
  });
  ctx.restore();
}
// ---------- beat helpers ----------
const prem = (from, camf, behind, front) => ({ from, kind: 'prem', camf, behind, front });
const paper = (from, draw, inT = 'slide') => ({ from, kind: 'paper', draw, inT });
async function renderBeat(ctx, b, f, t) {
  if (b.kind === 'prem') { const c = b.camf(f, t); await premium(ctx, f, c, b.behind && ((x, c) => b.behind(x, c, t)), b.front && ((x, c) => b.front(x, c, t))); return; }
  if (b.kind === 'paper') { b.draw(ctx, t, f); return; }
  if (b.kind === 'custom') { await b.draw(ctx, t, f); return; }
}
function sheetIn(ctx, prevCv, curCv, p, dir) {          // paper sheet slides over (dir 1) or slides away (dir -1)
  if (dir > 0) { ctx.drawImage(prevCv, 0, 0); ctx.save(); ctx.translate(0, (1 - p) * H); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 60; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H); ctx.shadowColor = 'transparent';
    if (p > .05 && p < 1) ctx.filter = `blur(${(Math.sin(p * Math.PI) * 6).toFixed(1)}px)`; ctx.drawImage(curCv, 0, 0); ctx.restore(); }
  else { ctx.drawImage(curCv, 0, 0); ctx.save(); ctx.translate(0, p * H); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 60; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H); ctx.shadowColor = 'transparent';
    if (p > .05 && p < 1) ctx.filter = `blur(${(Math.sin(p * Math.PI) * 6).toFixed(1)}px)`; ctx.drawImage(prevCv, 0, 0); ctx.restore(); }
}
window.renderAt = async (f) => {
  const t = f / FPS; X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.filter = 'none';
  let i = 0; while (i + 1 < BEATS.length && t >= BEATS[i + 1].from) i++;
  const b = BEATS[i], prev = BEATS[i - 1], TR = .42, p = eio(inv(b.from, b.from + TR, t));
  const inT = b.inT || (b.kind === 'paper' ? 'slide' : prev && prev.kind === 'paper' ? 'slideoff' : 'cut');
  if (!prev || p >= 1 || inT === 'cut' || inT === 'none') {
    await renderBeat(X, b, f, t);
    if (prev && inT === 'cut' && t - b.from < 2 / FPS && b.flash !== false) { X.save(); X.globalAlpha = .55 * (1 - (t - b.from) * FPS / 2); X.fillStyle = '#fff'; X.fillRect(0, 0, W, H); X.restore(); }
    return true;
  }
  const fp = Math.max(0, Math.round(b.from * FPS) - 1);
  await renderBeat(AX, prev, Math.min(f, D.frames.length - 1), Math.min(t, b.from - .001));
  await renderBeat(BX, b, f, t);
  if (inT === 'slide') sheetIn(X, A, B, p, 1);
  else if (inT === 'slideoff') sheetIn(X, A, B, p, -1);
  else if (inT === 'push') { X.drawImage(A, -p * W, 0); X.save(); if (p > .05 && p < 1) X.filter = `blur(${(Math.sin(p * Math.PI) * 5).toFixed(1)}px)`; X.drawImage(B, (1 - p) * W, 0); X.restore(); }
  else if (inT === 'fade') { X.drawImage(A, 0, 0); X.save(); X.globalAlpha = p; X.drawImage(B, 0, 0); X.restore(); }
  return true;
};
// ---------- shared scenes ----------
function specBeat(from, label, chips, capRange, extra, cardFx) {
  return { from, kind: 'custom', draw: async (ctx, t, f) => {
    await rawFrame(T1X, f, t, cardFx ? cardFx(t) : {});
    if (capRange) genericCaption(T1X, t, ...capRange(t));
    if (extra) extra(T1X, t);
    specChrome(ctx, t, label, chips); cardImg(ctx, T1, SP.x, SP.y, SP.w, SP.h, 36, .5);
  } };
}
function switchBeat(from, pushAt, capToks, fixedF) {
  return { from, kind: 'custom', inT: 'none', draw: async (ctx, t, f) => {
    const ff = fixedF ? Math.min(f, D.frames.length - 1) : f, c0 = cam(ff, 1.08, 880);
    await premium(T2X, ff, c0); const raw = await rawOf(ff); T1X.drawImage(raw, 0, 0, W, H);
    paperBG(ctx, 'paper2'); const pp = eio(inv(pushAt, pushAt + .45, t)), bIn = spring(cl((t - from) / .7)), aIn = spring(cl((t - from - .1) / .75));
    const bx = lerp(-420, 60, bIn) - pp * 500, by = 700;
    ctx.save(); ctx.globalAlpha = 1 - pp; T(ctx, 'before', bx + 4, by - 24, { size: 46, font: 'ID6', track: -1, align: 'left', fill: MUTED, shadow: false }); ctx.restore();
    cardImg(ctx, T1, bx, by, 380, 676, 36, .42, 'grayscale(1) contrast(1.05)');
    const ax = lerp(430, 0, pp), ay = lerp(470 + (1 - aIn) * 1500, 0, pp), aw = lerp(590, W, pp), ah = lerp(1049, H, pp), ar = lerp(44, 0, pp);
    ctx.save(); ctx.globalAlpha = 1 - pp; ctx.fillStyle = EMBER; ctx.beginPath(); ctx.arc(443, ay - 57, 9, 0, 7); ctx.fill();
    T(ctx, 'after', 466, ay - 30, { size: 86, font: 'ID8', track: -3, align: 'left', fill: INK, shadow: false }); ctx.restore();
    cardImg(ctx, T2, ax, ay, aw, ah, ar, .45 * (1 - pp));
    ctx.save(); ctx.globalAlpha = 1 - eo(inv(pushAt - .05, pushAt + .1, t)); line(ctx, t, capToks, ay + ah - 70, 1e9, ax + aw / 2); ctx.restore();
  } };
}
function endBeat(note) {
  return { from: D.speech, kind: 'custom', inT: 'slide', draw: async (ctx, t, f) => {
    const e0 = D.speech, s0 = Math.round(Math.max(0, e0 - 3) * FPS), fe = s0 + ((f - Math.round(e0 * FPS)) % 60 + 60) % 60;
    await premium(T2X, fe, cam(fe, 1.12, 860)); paperBG(ctx, 'paper3');
    const k = eo(inv(e0 + .05, e0 + .4, t)); T(ctx, 'THE WORKFLOW', W / 2, 312, { size: 24, font: 'JB', track: 8, fill: EMBER, shadow: false, alpha: k });
    line(ctx, t, [tok('Vibe', null, 150, 'IS', EMBER, { t0: e0 + .1, shadow: false }), tok('Editing', null, 124, 'ID8', INK, { t0: e0 + .18, shadow: false })], 420);
    const a = spring(cl((t - e0 - .2) / .8)), cw = 340, ch = 604, cx = (W - cw) / 2, cy = 462 + (1 - a) * 260;
    ctx.save(); ctx.globalAlpha = cl(a * 1.4); cardImg(ctx, T2, cx, cy, cw, ch, 32, .45);
    rrect(ctx, cx + 18, cy + 18, 104, 38, 19); ctx.fillStyle = 'rgba(17,15,14,.72)'; ctx.fill(); ctx.fillStyle = EMBER; ctx.beginPath(); ctx.arc(cx + 38, cy + 37, 6, 0, 7); ctx.fill();
    T(ctx, 'after', cx + 52, cy + 45, { size: 22, font: 'ID6', align: 'left', fill: CREAM, shadow: false }); ctx.restore();
    button(ctx, t, e0 + .45, 1140);
    T(ctx, 'make videos nobody can tell are AI', W / 2, 1300, { size: 26, font: 'JM', fill: '#6F665F', shadow: false, alpha: cl((t - e0 - .7) / .3) });
    if (note) T(ctx, note, W / 2, 1345, { size: 20, font: 'JM', fill: '#9A918A', shadow: false, alpha: cl((t - e0 - .7) / .3) });
  } };
}
function linkBeat(from, smallToks, btnAt, z = 1.05) {
  return prem(from, (f, t) => cam(f, lerp(z, z + .04, inv(from, D.speech, t)), 860), null, (ctx, c, t) => { line(ctx, t, smallToks, 1050); button(ctx, t, btnAt); });
}
const push = (from, z0, z1, d = 1.2, face = 880) => (f, t) => cam(f, lerp(z0, z1, eio(inv(from, from + d, t))), face);
const slow = (from, to, z0, z1, face = 880) => (f, t) => cam(f, lerp(z0, z1, inv(from, to, t)), face);
function splitTop(ctx, drawTop, t, from) {      // top 900 px panel with a soft fade into the A-roll
  const p = eo(inv(from, from + .4, t)); T2X.setTransform(1, 0, 0, 1, 0, 0); T2X.clearRect(0, 0, W, H); T2X.fillStyle = CARD; T2X.fillRect(0, 0, W, 900); drawTop(T2X, t);
  const g = T2X.createLinearGradient(0, 760, 0, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  T2X.save(); T2X.globalCompositeOperation = 'destination-out'; T2X.fillStyle = g; T2X.fillRect(0, 760, W, 140); T2X.fillRect(0, 900, W, H); T2X.restore();
  ctx.save(); ctx.translate(0, -(1 - p) * 900); ctx.drawImage(T2, 0, 0); ctx.restore();
}
// ================================ AD DEFINITIONS ================================
const AD = {};
AD.ad2 = () => {
  const B = [];
  B.push(prem(0, slow(0, wt(4), 1.06, 1.1), (ctx, c, t) => { const e = enter(t, wt(3) - .25, .35); T(ctx, 'GAME', W / 2, headTop(c) + 120, { size: 330, font: 'ID9', track: -12, alpha: e.alpha, blur: e.blur, scale: 1.1 - .1 * eo(inv(wt(3) - .25, wt(3) + .4, t)), shadow: false }); },
    (ctx, c, t) => line(ctx, t, [tok("let's", 0, 62), tok('play', 1, 62), gold('a', 2, 150), gold('game.', 3, 150)], 1238, wt(4) - .1)));
  B.push(prem(wt(4) - .05, slow(wt(4), wt(12), 1.24, 1.28, 1240), null, (ctx, c, t) => splitTop(ctx, (x, t) => {
    line(x, t, [tok('which', 4, 64), tok('part', 5, 64), tok('did', 9, 64), tok('AI', 10, 64), tok('edit?', 11, 64)], 380);
    [['A', 'the captions', 7], ['B', 'the cuts', 8], ['C', 'the room', 10]].forEach(([l, s, wi], k) => {
      const a = spring(cl((t - wt(wi)) / .5)); if (a <= 0) return; const y = 450 + k * 120; x.save(); x.globalAlpha = cl(a * 1.5); x.translate(lerp(-80, 0, a), 0);
      rrect(x, 150, y, 780, 96, 48); x.fillStyle = '#282523'; x.fill(); x.strokeStyle = '#48423D'; x.lineWidth = 2; x.stroke();
      x.fillStyle = EMBER; x.beginPath(); x.arc(202, y + 48, 30, 0, 7); x.fill(); T(x, l, 202, y + 60, { size: 34, font: 'ID8', fill: INK, shadow: false });
      T(x, s, 262, y + 62, { size: 40, font: 'ID6', track: -1, align: 'left', shadow: false }); x.restore();
    });
  }, t, wt(4) - .05)));
  B.push(prem(wt(12) - .05, push(wt(12) - .05, 1.28, 1.45, .5, 700), null, (ctx, c, t) => {
    brackets(ctx, c, wt(12), t); const sc = Math.min(.3, (t - wt(12)) * .3).toFixed(1);
    T(ctx, `SCANNING FOR AI  ·  ${sc} s`, W / 2, 1150, { size: 26, font: 'JB', track: 4, fill: GOLD, alpha: cl((t - wt(12)) / .2) });
    line(ctx, t, [gold('watch', 12, 130), gold('closely.', 13, 130)], 1245);
  }));
  B.push(Object.assign(prem(wt(14) - .04, slow(wt(14), wt(22), 1.1, 1.16), (ctx, c, t) => {
    const e = enter(t, wt(14) - .04, .18), q = eo(inv(wt(15) - .1, wt(15) + .15, t));
    T(ctx, 'WRONG.', W / 2, headTop(c) + 130, { size: 260, font: 'ID9', track: -10, fill: EMBER, alpha: e.alpha * (1 - q), blur: e.blur, scale: lerp(1.25, 1, eo5(inv(wt(14) - .04, wt(14) + .2, t))), shadow: false });
  }, (ctx, c, t) => {
    cap2(ctx, t, [tok('the', 15, 62)], [gold('whole', 16, 150), ser('video', 17, 150)], wt(18) - .08);
    cap2(ctx, t, [tok('is', 18, 62), tok('edited', 19, 62), tok('by', 20, 62)], [gold('AI.', 21, 170)], wt(22) - .08);
  }), { inT: 'cut' }));
  B.push(prem(wt(22) - .04, slow(wt(22), wt(24), 1.1, 1.13, 860), null, (ctx, c, t) => {
    const styles = [['ID8', 76, CREAM, null], ['IS', 92, GOLD, 'rgba(255,196,92,.55)'], ['ID9', 70, CREAM, null]];
    styles.forEach(([fnt, sz, col, gl], k) => { const e = enter(t, wt(22) + k * .14, .22); T(ctx, k === 2 ? 'EVERY CAPTION' : 'every caption', W / 2, 990 + k * 100, { size: sz, font: fnt, track: fnt.startsWith('ID') ? -2 : 0, fill: col, glow: gl, alpha: e.alpha, blur: e.blur, dy: e.dy }); });
  }));
  B.push(prem(wt(24) - .04, slow(wt(24), wt(26), 1.13, 1.16, 860), null, (ctx, c, t) => {
    const a = eo(inv(wt(24) - .04, wt(24) + .3, t)); ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 30);
    rrect(ctx, 90, 1010, 900, 100, 18); ctx.fillStyle = 'rgba(24,22,21,.92)'; ctx.fill();
    for (let k = 0; k < 14; k++) { rrect(ctx, 110 + k * 62, 1030, 50, 60, 8); ctx.fillStyle = ['#4A3A30', '#5D483B', '#715745'][k % 3]; ctx.fill(); }
    [3, 7, 10].forEach((k, j) => { const s = eo(inv(wt(25) + j * .08, wt(25) + j * .08 + .15, t)); if (s <= 0) return; ctx.strokeStyle = EMBER; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(160 + k * 62, 1060 - 64 * s); ctx.lineTo(160 + k * 62, 1060 + 64 * s); ctx.stroke(); });
    ctx.restore(); line(ctx, t, [gold('every', 24, 130), gold('cut,', 25, 130)], 1220);
  }));
  B.push({ from: wt(26) - .04, kind: 'custom', draw: async (ctx, t, f) => {
    const c = cam(f, lerp(1.08, 1.12, inv(wt(26), wt(31), t)), 880); await premium(ctx, f, c);
    const w0 = wt(28) - .05, p1 = eio(inv(w0, w0 + .5, t)), p2 = eio(inv(we(30) + .05, we(30) + .5, t)), xw = W - 540 * p1 + 540 * p2;
    if (xw < W - 1) { const raw = await rawOf(f); ctx.save(); ctx.beginPath(); ctx.rect(xw, 0, W - xw, H); ctx.clip();
      const k = c.k; ctx.drawImage(raw, c.sx - c.fx * k, c.sy - c.fy * k, 720 * k, 1280 * k); ctx.restore();
      ctx.fillStyle = CREAM; ctx.fillRect(xw - 2, 0, 4, H);
      T(ctx, 'AI room', Math.max(120, xw / 2), 330, { size: 26, font: 'JB', track: 3, alpha: cl((W - xw) / 300) }); T(ctx, 'real wall', xw + (W - xw) / 2, 330, { size: 26, font: 'JB', track: 3, fill: INK, shadow: false, alpha: cl((W - xw) / 300) }); }
    cap2(ctx, t, [tok('even', 26, 62), tok('the', 27, 62), tok('room', 28, 62)], [gold('behind', 29, 140), gold('me.', 30, 140)]);
  } });
  B.push(paper(wt(31) - .1, (ctx, t, f) => {
    paperBG(ctx); heading(ctx, t, [htok('most', 31), htok('AI', 32), htok('edits', 33), htok('are', 34)], [etok('easy', 35), etok('to', 36), etok('spot.', 37)]);
    const x0 = 90, y0 = 600; darkCard(ctx, x0, y0, 900, 820);
    for (let k = 0; k < 3; k++) { const a = spring(cl((t - wt(31) - .1 - k * .1) / .6)); if (a <= 0) continue; const x = x0 + 50 + k * 275, y = y0 + 60 + (1 - a) * 80;
      ctx.save(); ctx.globalAlpha = cl(a * 1.4); rrect(ctx, x, y, 250, 444, 20); ctx.fillStyle = '#D9D2C7'; ctx.fill(); ctx.fillStyle = '#2A2523'; rrect(ctx, x + 70, y + 150, 110, 240, 40); ctx.fill(); ctx.beginPath(); ctx.arc(x + 125, y + 130, 40, 0, 7); ctx.fill();
      T(ctx, 'SAME', x + 125, y + 300, { size: 40, font: 'GEN', fill: '#FFE128', stroke: '#000', lw: 8 }); ctx.restore();
      const m = eo(inv(wt(35) + k * .12, wt(35) + k * .12 + .35, t)); if (m > 0) { ctx.save(); ctx.strokeStyle = '#E8463C'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(x + 125, y0 + 345, 95, 40, -.05, -Math.PI / 2, -Math.PI / 2 + m * Math.PI * 2.1); ctx.stroke(); ctx.restore(); } }
    T(ctx, 'bouncing captions · auto-zoom · stock music', W / 2, y0 + 600, { size: 26, font: 'JM', fill: MUTED, shadow: false, alpha: eo(inv(wt(35), wt(35) + .3, t)) });
  }));
  B.push(prem(wt(38) - .08, push(wt(38), 1.1, 1.22, .5, 820), null, (ctx, c, t) => line(ctx, t, [gold('Mine', 38, 190), tok("aren't.", 39, 70)], 1230)));
  B.push(paper(wt(40) - .08, (ctx, t) => {
    paperBG(ctx); heading(ctx, t, [htok('everyone', 40), htok('has', 41)], [etok('the', 42), etok('same', 43), etok('tools.', 44)]); darkCard(ctx, 90, 600, 900, 760);
    ['AI captions', 'auto-zoom', 'templates', 'stock music'].forEach((s, k) => { const a = eo(inv(wt(41) + k * .1, wt(41) + k * .1 + .3, t)); chip(ctx, 150, 670 + k * 150, s, { size: 40, alpha: a }); chip(ctx, 560, 670 + k * 150, s, { size: 40, alpha: a }); });
    T(ctx, 'SAME  ·  SAME  ·  SAME', W / 2, 1320, { size: 26, font: 'JB', track: 6, fill: MUTED, shadow: false, alpha: eo(inv(wt(43), wt(43) + .3, t)) });
  }));
  B.push(paper(wt(45) - .1, (ctx, t) => { paperBG(ctx); heading(ctx, t, [htok('not', 45), htok('everyone', 46), htok('has', 47)], [etok('the', 48), etok('workflow.', 49)]); nodes(ctx, t, wt(45)); }, 'push'));
  B.push(prem(wt(50) - .1, (f, t) => cam(f, lerp(1.05, 1.09, inv(wt(50), D.speech, t)), 860), null, (ctx, c, t) => {
    cap2(ctx, t, [tok('want', 51, 62), tok('my', 52, 62)], [gold('workflow?', 53, 150)], wt(54) - .08);
    line(ctx, t, [tok('the', 54, 60), tok('link', 55, 60), tok('is', 56, 60), tok('below', 57, 60)], 1050); button(ctx, t, wt(57));
  }));
  B.push(endBeat()); return B;
};
AD.ad3 = () => {
  const B = [], ch = [[0, 'auto-captions'], [wt(4), 'auto-zoom']];
  const comment = (x, t, n, s, t0, y, typingFor = .5) => { const a = spring(cl((t - t0) / .5)); if (a <= 0) return; const typ = t - t0 < typingFor ? t : null; bubble(x, 120, y, n, s, { w: 840, light: true, alpha: cl(a * 1.5), dy: (1 - a) * 40, typing: typ }); };
  B.push(specBeat(0, 'my first AI edit', ch, t => [0, 27, t < wt(15) ? 1150 : 820], (x, t) => {
    comment(x, t, 'user_2931', 'this is AI, right?', wt(9), t < wt(15) ? 1320 : 1100, wt(11) - wt(9));
    comment(x, t, 'kay.edits', 'AI edit lol', wt(16), 1250, .25); comment(x, t, 'mr_frames', 'looks so generic', wt(20), 1400, .25);
    const d = inv(wt(23), wt(24), t); if (d > 0) { x.save(); x.globalAlpha = .5 * d; x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.restore(); }
  }, t => ({ zoom: t > wt(4) && t < wt(9) ? 1.18 : 1, filter: t > wt(23) ? `grayscale(${inv(wt(23), wt(24), t)})` : 'none' })));
  B.push(paper(wt(28) - .1, (ctx, t) => {
    paperBG(ctx); heading(ctx, t, [htok('I', 29), htok('stopped', 30)], [etok('changing', 31), etok('tools,', 32)]); darkCard(ctx, 90, 600, 900, 700);
    ['tool #1', 'tool #2', 'tool #3', 'tool #4'].forEach((s, k) => { const t0 = wt(28) + .1 + k * .12, a = eo(inv(t0, t0 + .3, t)); const w = chip(ctx, 170, 660 + k * 150, s, { size: 40, alpha: a });
      const sk = eo(inv(wt(31) + k * .1, wt(31) + k * .1 + .2, t)); if (sk > 0) { ctx.strokeStyle = EMBER; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(160, 697 + k * 150); ctx.lineTo(160 + (w + 20) * sk, 697 + k * 150); ctx.stroke(); } });
    T(ctx, 'swap, swap, swap…', 930, 1020, { size: 64, font: 'IS', align: 'right', fill: MUTED, shadow: false, alpha: eo(inv(wt(29), wt(29) + .4, t)) });
  }));
  B.push(paper(wt(33) - .1, (ctx, t) => { paperBG(ctx); heading(ctx, t, [htok('I', 33), htok('changed', 34)], [etok('how', 35), etok('I', 36), etok('use', 37), etok('them.', 38)]); nodes(ctx, t, wt(34)); }, 'push'));
  B.push(switchBeat(wt(39) - .06, wt(42) - .45, [tok('now', 39, 50), tok('watch', 40, 50), gold('this.', 41, 84)]));
  B.push(prem(wt(42) - .02, slow(wt(42), wt(47), 1.08, 1.12), null, (ctx, c, t) => {
    [['jules.mp4', 'who edits your videos??'], ['arjun.creates', 'this edit is insane'], ['studio.nine', 'what software is this']].forEach(([n, s], k) => {
      const t0 = wt(42) + .1 + k * .3, a = spring(cl((t - t0) / .6)); if (a > 0) bubble(ctx, 150 + (k % 2) * 60, 300 + k * 140, n, s, { w: 720, alpha: cl(a * 1.4) * .95, dy: (1 - a) * 50 }); });
    cap2(ctx, t, [tok('nobody', 42, 62), tok('says', 43, 62)], [gold('this', 44, 140), gold('is', 45, 140), gold('AI.', 46, 140)]);
  }));
  B.push(prem(wt(47) - .06, slow(wt(47), wt(54), 1.12, 1.16), (ctx, c, t) => { const e = enter(t, wt(52) - .1, .4); T(ctx, 'editor?', W / 2 + Math.sin(t * 1.2) * 8, headTop(c) + 110, { size: 300, font: 'IS', alpha: e.alpha, blur: e.blur, shadow: false }); },
    (ctx, c, t) => line(ctx, t, [tok('people', 47, 62), tok('ask', 48, 62), tok('me', 49, 62), tok('who', 50, 62), tok('my', 51, 62)], 1110)));
  B.push(prem(wt(54) - .06, push(wt(54), 1.16, 1.35, .45, 760), null, (ctx, c, t) => { line(ctx, t, [tok('so…', 54, 62)], 1100, wt(55)); line(ctx, t, [gold('I', 55, 230), gold('am.', 56, 230)], 1230); }));
  B.push(prem(wt(57) - .06, slow(wt(57), wt(64), 1.1, 1.13, 860), null, (ctx, c, t) => {
    const a = eo(inv(wt(57), wt(57) + .3, t)); ctx.save(); ctx.globalAlpha = a; rrect(ctx, 90, 1000, 900, 90, 18); ctx.fillStyle = 'rgba(24,22,21,.92)'; ctx.fill();
    for (let k = 0; k < 14; k++) { rrect(ctx, 110 + k * 62, 1018, 50, 54, 8); ctx.fillStyle = '#5A4637'; ctx.fill(); }
    const s = eo(inv(wt(61), wt(63), t)); ctx.strokeStyle = EMBER; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(80, 1045); ctx.lineTo(80 + 920 * s, 1045); ctx.stroke(); ctx.restore();
    line(ctx, t, [tok('I', 57, 56), tok('just', 58, 56), tok("don't", 59, 56), tok('sit', 60, 56), tok('on', 61, 56), tok('a', 62, 56)], 1160); line(ctx, t, [gold('timeline.', 63, 130)], 1265);
  }));
  B.push(prem(wt(64) - .06, (f, t) => cam(f, lerp(1.05, 1.09, inv(wt(64), D.speech, t)), 860), null, (ctx, c, t) => {
    line(ctx, t, [tok('exactly', 67, 60), tok('what', 68, 60), tok('I', 69, 60), gold('teach', 70, 90)], 1050); button(ctx, t, wt(73));
  }));
  B.push(endBeat('comments shown are illustrative')); return B;
};
AD.ad4 = () => {
  const B = [], ch = [[wt(11), 'bouncing captions'], [wt(21), 'auto-zoom'], [wt(26), 'stock music']];
  B.push(specBeat(0, "everyone's AI edit", ch, () => [0, 43], (x, t) => {
    if (t < wt(11)) { const n = 3 - Math.floor(cl(t / 3, 0, .999) * 3); x.save(); x.lineWidth = 10; x.strokeStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(920, 290, 90, 0, 7); x.stroke();
      x.strokeStyle = EMBER; x.beginPath(); x.arc(920, 290, 90, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - (t % 1))); x.stroke(); T(x, String(n), 920, 330, { size: 120, font: 'ID8' }); x.restore(); }
    if (t > wt(26) && t < wt(35)) { const a = spring(cl((t - wt(26)) / .5)); x.save(); x.globalAlpha = cl(a * 1.4); x.translate(0, (1 - a) * 40); rrect(x, 120, 1300, 840, 140, 30); x.fillStyle = '#fff'; x.fill();
      for (let k = 0; k < 38; k++) { const h = 20 + 50 * Math.abs(Math.sin(k * .7 + t * 8)); x.fillStyle = '#1E1E1E'; x.fillRect(360 + k * 15, 1370 - h / 2, 8, h); }
      T(x, '♪ stock_04', 160, 1388, { size: 30, font: 'JB', align: 'left', fill: INK, shadow: false }); x.restore(); }
    if (t > wt(41)) { const a = backo(cl((t - wt(41)) / .3)); x.save(); x.translate(540, 360); x.rotate(-.06); x.scale(lerp(2, 1, cl(a)), lerp(2, 1, cl(a))); x.globalAlpha = cl(a * 2);
      rrect(x, -300, -60, 600, 120, 60); x.fillStyle = '#E8463C'; x.fill(); T(x, 'AI DETECTED', 0, 22, { size: 64, font: 'ID9', track: 2, fill: '#fff', shadow: false }); x.restore(); }
  }, t => ({ zoom: t > wt(22) - .03 && t < wt(26) ? 1.24 : 1 })));
  B.push(switchBeat(wt(44) - .06, wt(47) - .45, [tok('now', 44, 50), tok('watch', 45, 50), gold('this.', 46, 84)]));
  B.push(prem(wt(47) - .02, slow(wt(47), wt(53), 1.08, 1.12), (ctx, c, t) => { const e = enter(t, wt(50) - .1, .35); T(ctx, 'AI EDIT', W / 2, headTop(c) + 120, { size: 250, font: 'ID9', track: -10, alpha: e.alpha, blur: e.blur, scale: 1.1 - .1 * eo(inv(wt(50) - .1, wt(50) + .5, t)), shadow: false }); },
    (ctx, c, t) => { line(ctx, t, [tok('this', 47, 60), tok('is', 48, 60), tok('an', 49, 60)], 1100); line(ctx, t, [gold('too.', 52, 190)], 1230); }));
  B.push(prem(wt(53) - .06, push(wt(53), 1.12, 1.42, .5, 700), null, (ctx, c, t) => {
    brackets(ctx, c, wt(53), t); line(ctx, t, [tok('try', 53, 60), tok('to', 54, 60), tok('find', 55, 60), tok('one', 56, 60), tok('sign', 57, 60)], 1110);
    const sc = inv(wt(55), wt(57) + .3, t); if (t > wt(55)) T(ctx, sc < 1 ? `scanning… ${Math.floor(sc * 100)}%` : '0 signs found', W / 2, 1238, { size: 56, font: 'JB', track: 2, fill: GOLD, glow: sc >= 1 ? 'rgba(255,196,92,.55)' : null });
  }));
  B.push(paper(wt(58) - .1, (ctx, t) => {
    paperBG(ctx); line(ctx, t, [htok("it's", 58), htok('the', 59), htok('same', 60), htok('AI.', 61)], 400); darkCard(ctx, 90, 520, 900, 700);
    ['everyone', 'me'].forEach((lab, k) => { const a = spring(cl((t - wt(58) - k * .15) / .6)); if (a <= 0) return; const x = 150 + k * 420; ctx.save(); ctx.globalAlpha = cl(a * 1.4); ctx.translate(0, (1 - a) * 60);
      rrect(ctx, x, 580, 360, 500, 30); ctx.fillStyle = '#282523'; ctx.fill(); T(ctx, 'AI', x + 180, 880, { size: 160, font: 'ID9', track: -6, shadow: false }); T(ctx, lab, x + 180, 1040, { size: 30, font: 'JM', fill: MUTED, shadow: false }); ctx.restore(); });
    T(ctx, '=', W / 2, 1170, { size: 80, font: 'ID8', fill: EMBER, shadow: false, alpha: eo(inv(wt(60), wt(60) + .3, t)) });
  }));
  B.push(paper(wt(62) - .1, (ctx, t) => {
    paperBG(ctx); heading(ctx, t, [htok('the', 62), htok('difference', 63), htok('is', 64)], [etok('what', 65), etok('I', 66), etok('taught', 67), etok('it.', 68)]); darkCard(ctx, 90, 600, 900, 820);
    const L = ['# vibe-editing.skill', 'captions: designed per phrase', 'camera: eased, motivated', 'grade: low-key, matched light', 'sound: minimal, ducked', 'never: templates'];
    let tt = wt(63); L.forEach((l, k) => { const n = Math.floor(cl((t - tt) * 40, 0, l.length)), s = l.slice(0, n); tt += l.length / 40 + .05;
      const w = T(ctx, s, 150, 700 + k * 100, { size: 36, font: 'JM', align: 'left', fill: k === 0 ? EMBER : CREAM, shadow: false }); if (n > 0 && n < l.length) { ctx.fillStyle = GOLD; ctx.fillRect(154 + w, 672, 14, 34 + k * 0); } });
  }, 'push'));
  B.push(prem(wt(69) - .1, (f, t) => cam(f, lerp(1.05, 1.09, inv(wt(69), D.speech, t)), 860), null, (ctx, c, t) => {
    line(ctx, t, [tok("that's", 69, 60), tok('what', 70, 60)], 1050, wt(75) - .08); line(ctx, t, [gold("I'll", 71, 120), gold('teach', 73, 120), gold('you.', 74, 120)], 1180, wt(75) - .08);
    line(ctx, t, [tok('the', 75, 60), tok('link', 76, 60), tok('is', 77, 60), tok('below', 78, 60)], 1050); button(ctx, t, wt(78));
  }));
  B.push(endBeat()); return B;
};
AD.ad5 = () => {
  const B = [];
  B.push(paper(0, (ctx, t) => {
    paperBG(ctx, 'paper2'); T(ctx, '“', W / 2, 560, { size: 360, font: 'IS', fill: EMBER, shadow: false, alpha: eo(inv(0, .3, t)) });
    const full = "AI can't make premium edits.", n = Math.floor(cl((t - .05) / (we(4) - .05), 0, 1) * full.length), s = full.slice(0, n), sp = s.split(' ');
    const l1 = sp.slice(0, 3).join(' '), l2 = sp.slice(3).join(' ');
    T(ctx, l1, W / 2, 760, { size: 120, font: 'IS', fill: INK, shadow: false }); T(ctx, l2, W / 2, 900, { size: 120, font: 'IS', fill: INK, shadow: false });
    T(ctx, '— me, a year ago', W / 2, 1010, { size: 34, font: 'JM', fill: MUTED, shadow: false, alpha: eo(inv(we(4), we(4) + .3, t)) });
  }, 'none'));
  B.push({ from: wt(5) - .1, kind: 'custom', inT: 'fade', draw: async (ctx, t, f) => {
    await rawFrame(T1X, f, t); paperBG(ctx, 'paper2'); const a = spring(cl((t - wt(5) + .1) / .7));
    line(ctx, t, [htok('I', 5, 66), htok('used', 6, 66), htok('to', 7, 66), htok('say', 8, 66), htok('that', 9, 66), htok('too.', 10, 66)], 420);
    ctx.save(); ctx.globalAlpha = cl(a * 1.4); cardImg(ctx, T1, 260, 520 + (1 - a) * 200, 560, 996, 40, .45, 'grayscale(1) contrast(1.05)');
    T(ctx, 'me, before', 300, 580 + (1 - a) * 200, { size: 24, font: 'JB', track: 2, align: 'left' }); ctx.restore();
  } });
  B.push({ from: wt(11) - .1, kind: 'custom', inT: 'none', draw: async (ctx, t, f) => {
    const p = eio(inv(wt(11) - .1, wt(11) + .4, t)), c = cam(f, 1.08, 880); await premium(T2X, f, c, null, (x, c) => line(x, t, [tok('then', 11, 60), tok('I', 12, 60), tok('made', 13, 60), gold('this.', 14, 150)], 1238));
    if (p >= 1) { ctx.drawImage(T2, 0, 0); return; }
    paperBG(ctx, 'paper2'); const x = lerp(260, 0, p), y = lerp(520, 0, p), w = lerp(560, W, p), h = lerp(996, H, p);
    cardImg(ctx, T2, x, y, w, h, lerp(40, 0, p), .45 * (1 - p), `grayscale(${1 - p})`);
  } });
  B.push(prem(wt(15) - .06, slow(wt(15), wt(21), 1.1, 1.14, 900), (ctx, c, t) => {
    const R = 360, cy = headTop(c) + 40;
    [['the', 15], ['words', 16], ['go', 17], ['behind', 18]].forEach(([s, i], k) => { if (t < wt(i)) return; const u = (t - wt(i)) / 1.8, th = (20 + eio(cl(u)) * 170) * Math.PI / 180;
      const x = W / 2 + R * Math.cos(th), y = cy - 90 * Math.sin(th) + (th > 2.9 ? (th - 2.9) * 300 : 0); const e = enter(t, wt(i), .2);
      T(ctx, s, x, y, { size: 70, font: 'ID8', track: -2, alpha: e.alpha * (1 - inv(.85, 1, u)), blur: e.blur, scale: 1 - .15 * Math.max(0, Math.sin(th)) }); });
  }, (ctx, c, t) => line(ctx, t, [gold('my', 19, 170), gold('head.', 20, 170)], 1230)));
  B.push({ from: wt(21) - .06, kind: 'custom', draw: async (ctx, t, f) => {
    const c = cam(f, lerp(1.14, 1.2, inv(wt(21), wt(25), t)), 820), dk = eo(inv(wt(22), wt(22) + .4, t));
    await premium(ctx, f, c, (x) => { x.save(); x.globalAlpha = dk * .85; x.fillStyle = '#0E0805'; x.fillRect(0, 0, W, H); x.restore();
      const p = eo(inv(wt(22), wt(22) + .5, t)); x.save(); x.strokeStyle = 'rgba(255,240,225,.75)'; x.lineWidth = 2.2; const vp = [540, 820];
      for (const [a, b] of [[[0, 260], vp], [[1080, 240], vp], [[0, 1700], vp], [[1080, 1720], vp], [[300, 0], [300, 520]], [[780, 0], [780, 520]], [[300, 520], [780, 520]]]) { x.beginPath(); x.moveTo(...a); x.lineTo(lerp(a[0], b[0], p), lerp(a[1], b[1], p)); x.stroke(); } x.restore(); });
    const w0 = wt(24) + .05, wp = inv(w0, w0 + .3, t) - inv(w0 + .55, w0 + .85, t);
    if (wp > 0) { const raw = await rawOf(f), xw = W * (1 - eio(cl(wp))); ctx.save(); ctx.beginPath(); ctx.rect(xw, 0, W - xw, H); ctx.clip(); ctx.drawImage(raw, c.sx - c.fx * c.k, c.sy - c.fy * c.k, 720 * c.k, 1280 * c.k); ctx.restore(); ctx.fillStyle = CREAM; ctx.fillRect(xw - 2, 0, 4, H); }
    cap2(ctx, t, [tok('this', 21, 62), tok('room', 22, 62)], [gold("doesn't", 23, 140), gold('exist.', 24, 140)]);
  } });
  B.push(prem(wt(25) - .06, slow(wt(25), wt(32), 1.1, 1.14, 860), null, (ctx, c, t) => {
    const a = eo(inv(wt(25), wt(25) + .3, t)), off = (t - wt(25)) * 90; ctx.save(); ctx.globalAlpha = a; rrect(ctx, 60, 960, 960, 140, 14); ctx.fillStyle = 'rgba(16,14,13,.94)'; ctx.fill();
    ctx.beginPath(); ctx.rect(60, 960, 960, 140); ctx.clip(); for (let k = -1; k < 11; k++) { rrect(ctx, 80 + k * 104 - (off % 104), 980, 90, 100, 8); ctx.fillStyle = ['#5A4637', '#6B5444', '#4C3B2F'][(k + 30) % 3]; ctx.fill(); } ctx.restore();
    line(ctx, t, [tok('and', 25, 54), tok('I', 26, 54), tok("didn't", 27, 54), tok('touch', 28, 54), tok('a', 29, 54), tok('single', 30, 54), tok('frame', 31, 54)], 1170);
    T(ctx, '0 frames touched', W / 2, 1258, { size: 52, font: 'JB', track: 2, fill: GOLD, glow: 'rgba(255,196,92,.55)', alpha: eo(inv(wt(31), wt(31) + .3, t)) });
  }));
  B.push(prem(wt(32) - .06, slow(wt(32), wt(36), 1.1, 1.13, 900), (ctx, c, t) => { const e = enter(t, wt(32) - .05, .35); T(ctx, 'AI', W / 2, headTop(c) + 140, { size: 420, font: 'ID9', track: -14, alpha: e.alpha, blur: e.blur, scale: 1.12 - .12 * eo(inv(wt(32), wt(32) + .5, t)), shadow: false }); },
    (ctx, c, t) => cap2(ctx, t, [tok("isn't", 33, 62), tok('the', 34, 62)], [gold('problem.', 35, 140)])));
  B.push({ from: wt(36) - .1, kind: 'custom', inT: 'slide', draw: async (ctx, t, f) => {
    paperBG(ctx); heading(ctx, t, [htok('everyone', 36), htok('uses', 37), htok('it', 38)], [etok('the', 39), etok('same', 40), etok('way.', 41)]);
    await rawFrame(T1X, f, t); genericCaption(T1X, t, 42, 47, 1150);
    for (let k = 0; k < 6; k++) { const t0 = wt(37) + k * .18, a = spring(cl((t - t0) / .6)); if (a <= 0) continue; const x = 90 + (k % 3) * 310, y = 600 + Math.floor(k / 3) * 500 + (1 - a) * 80;
      ctx.save(); ctx.globalAlpha = cl(a * 1.4); cardImg(ctx, T1, x, y, 280, 470, 22, .35); ctx.restore(); }
  } });
  B.push(prem(wt(48) - .1, slow(wt(48), wt(59), 1.05, 1.09, 860), (ctx, c, t) => {
    const e1 = enter(t, wt(57) - .1, .35), e2 = enter(t, wt(58) - .05, .35);
    T(ctx, 'VIBE', W / 2, 560, { size: 330, font: 'ID9', track: -10, alpha: e1.alpha, blur: e1.blur, scale: 1.1 - .1 * eo(inv(wt(57), wt(57) + .6, t)), shadow: false });
    T(ctx, 'EDITING', W / 2, headTop(c) + 110, { size: 168, font: 'ID9', track: 2, alpha: e2.alpha, blur: e2.blur, dy: e2.dy, shadow: false });
  }, (ctx, c, t) => { line(ctx, t, [tok('I', 48, 60), tok('built', 49, 60), tok('my', 50, 60), tok('own', 51, 60), tok('way', 52, 60)], 1110, wt(54) - .08);
    cap2(ctx, t, [tok('I', 54, 62), tok('call', 55, 62), tok('it', 56, 62)], [gold('Vibe', 57, 130), gold('Editing.', 58, 130)]); }));
  B.push(linkBeat(wt(59) - .06, [tok('the', 66, 60), tok('link', 67, 60), tok('is', 68, 60), tok('below', 69, 60)], wt(69)));
  B.push(endBeat()); return B;
};
AD.ad6 = () => {
  const B = [];
  const DMS = ['jules.mp4', 'arjun.creates', 'studio.nine', 'kay.edits', 'mr_frames'];
  B.push(paper(0, (ctx, t) => {
    paperBG(ctx); heading(ctx, t, [htok('the', 2), htok('same', 3), htok('message', 4)], [etok('every', 5), etok('day.', 6)]);
    DMS.forEach((n, k) => { const t0 = .15 + k * .22, a = spring(cl((t - t0) / .5)); if (a > 0) bubble(ctx, 120 + (k % 2) * 80, 600 + k * 140, n, 'who edits your videos?', { light: true, alpha: cl(a * 1.4), dy: (1 - a) * 50 }); });
    T(ctx, `${Math.min(128, Math.floor(t * 70))} NEW MESSAGES`, W / 2, 1335, { size: 26, font: 'JB', track: 6, fill: EMBER, shadow: false, alpha: cl(t / .4) });
  }, 'none'));
  B.push(Object.assign(prem(wt(7) - .1, slow(wt(7), wt(11), 1.24, 1.28, 1240), null, (ctx, c, t) => splitTop(ctx, (x, t) => {
    bubble(x, 160, 420, 'jules.mp4', 'who edits your videos?', { light: true }); line(x, t, [tok('who', 7, 66), tok('edits', 8, 66), tok('your', 9, 66)], 640); line(x, t, [gold('videos?', 10, 140)], 770);
  }, t, 1e9)), { inT: 'slideoff' }));
  B.push(prem(wt(11) - .06, slow(wt(11), wt(16), 1.08, 1.12), null, (ctx, c, t) => {
    cap2(ctx, t, [tok('there', 12, 62), tok('is', 13, 62), tok('no', 14, 62)], [gold('editor.', 15, 150)]);
    const s = eo(inv(wt(15) + .25, wt(15) + .5, t)); if (s > 0) { ctx.strokeStyle = EMBER; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(330, 1197); ctx.lineTo(330 + 420 * s, 1197); ctx.stroke(); }
  }));
  B.push(prem(wt(16) - .06, slow(wt(16), wt(23), 1.24, 1.28, 1240), null, (ctx, c, t) => splitTop(ctx, (x, t) => {
    for (let k = 0; k < 26; k++) { const h = 20 + 70 * Math.abs(Math.sin(k * .55 + t * 7)) * cl((t - wt(17)) / .2); rrect(x, 120 + k * 14, 560 - h / 2, 8, h, 3); x.fillStyle = CREAM; x.fill(); }
    T(x, 'I talk', 290, 700, { size: 80, font: 'IS', shadow: false, alpha: eo(inv(wt(16), wt(16) + .3, t)) });
    const ar = eo(inv(wt(18), wt(18) + .3, t)); T(x, '→', W / 2, 580, { size: 90, font: 'ID8', fill: EMBER, shadow: false, alpha: ar, dx: (1 - ar) * -40 });
    const rb = eo(inv(wt(19), wt(19) + .3, t)); x.save(); x.globalAlpha = rb; rrect(x, 640, 470, 320, 180, 24); x.fillStyle = '#282523'; x.fill(); rrect(x, 670, 600, 260, 16, 8); x.fillStyle = '#3A3633'; x.fill();
    const pr = eio(inv(wt(20), we(22) + .3, t)); rrect(x, 670, 600, Math.max(16, 260 * pr), 16, 8); x.fillStyle = EMBER; x.fill();
    T(x, pr >= 1 ? 'DONE' : 'RENDER', 800, 560, { size: 30, font: 'JB', track: 4, shadow: false }); x.restore();
    T(x, 'Claude builds', 800, 700, { size: 80, font: 'IS', fill: GOLD, shadow: false, alpha: eo(inv(wt(19), wt(19) + .3, t)) });
  }, t, wt(16) - .06), { inT: 'cut' }));
  B.push({ from: wt(23) - .1, kind: 'custom', inT: 'slide', draw: async (ctx, t, f) => {
    paperBG(ctx); heading(ctx, t, [htok('the', 25, 64), htok('same', 26, 64), htok('Claude', 27, 64), htok('that', 28, 64), htok('makes', 29, 64)], [etok('others', 30, 100), etok('look', 33, 100), etok('cheap.', 34, 100)]);
    darkCard(ctx, 90, 600, 900, 760); await rawFrame(T1X, f, t); await premium(T2X, f, cam(f, 1.1, 880));
    [[T1, 0], [T2, 1]].forEach(([cv, k]) => { const a = spring(cl((t - wt(24) - k * .2) / .6)); if (a <= 0) return; const x = 150 + k * 420;
      ctx.save(); ctx.globalAlpha = cl(a * 1.4); cardImg(ctx, cv, x, 660 + (1 - a) * 60, 360, 560, 26, .3); chip(ctx, x + 85, 1250, 'Claude', { size: 34 }); ctx.restore(); });
  } });
  B.push(prem(wt(35) - .1, slow(wt(35), wt(45), 1.1, 1.14, 860), null, (ctx, c, t) => {
    line(ctx, t, [tok('same', 35, 66), gold('tool.', 36, 110)], 1150, wt(37) - .08);
    line(ctx, t, [tok('I', 37, 58), tok('taught', 39, 58), tok('it', 40, 58), tok('what', 41, 58)], 1110);
    line(ctx, t, [gold('premium', 42, 120), gold('looks', 43, 120), gold('like.', 44, 120)], 1240);
  }));
  B.push(paper(wt(45) - .1, (ctx, t) => {
    paperBG(ctx); heading(ctx, t, [htok('all', 46, 72), htok('my', 47, 72), htok('prompts,', 48, 72), htok('skill', 50, 72)], [etok('&', 51), etok('workflow.', 53)]); darkCard(ctx, 90, 600, 900, 820);
    [['prompts', 'ready to paste', 48], ['skill', 'vibe-editing.skill', 50], ['workflow', 'start to export', 53]].forEach(([s, sub, wi], k) => {
      const a = spring(cl((t - wt(wi)) / .55)); if (a <= 0) return; const y = 660 + k * 240 + (1 - a) * 80; ctx.save(); ctx.globalAlpha = cl(a * 1.4);
      rrect(ctx, 150, y, 780, 200, 30); ctx.fillStyle = '#282523'; ctx.fill(); ctx.strokeStyle = '#48423D'; ctx.lineWidth = 2; ctx.stroke();
      T(ctx, s, 200, y + 100, { size: 90, font: 'IS', align: 'left', fill: GOLD, shadow: false }); T(ctx, sub, 200, y + 160, { size: 28, font: 'JM', align: 'left', fill: MUTED, shadow: false }); ctx.restore(); });
    T(ctx, 'all inside one course', W / 2, 1380, { size: 30, font: 'JB', track: 3, fill: EMBER, shadow: false, alpha: eo(inv(wt(55), wt(55) + .3, t)) });
  }));
  B.push(linkBeat(wt(58) - .1, [tok('tap', 60, 60), tok('the', 61, 60), tok('link', 62, 60), tok('below', 63, 60)], wt(62)));
  B.push(endBeat('messages shown are illustrative')); return B;
};

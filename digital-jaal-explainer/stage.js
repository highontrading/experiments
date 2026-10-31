// "Jaal aur Paani" — 9:16 explainer, drawn as renderAt(t) on one canvas.
// Real stock footage (pre-extracted frames in build/frames) inside a paper-collage design system:
// off-white paper, B&W cut-outs with white sticker borders, red circles, beige marker bars, dot grids.
"use strict";
const W = 1080, H = 1920, FPS = 30, DURATION = 42.5;
const COL = { paper: "#ECE9E3", ink: "#141414", red: "#D71F26", deep: "#A8141A", beige: "#E6B27A", blue: "#5A8BE6", white: "#FFFFFF" };
const BW = "grayscale(1) contrast(1.22) brightness(1.04)";
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
for (const k of [ctx]) k.imageSmoothingQuality = "high";
const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
const bufA = mk(), bufB = mk();
const tmp1 = document.createElement("canvas"), tmp2 = document.createElement("canvas");

// ------------------------------------------------------------------ math --
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const win = (t, a, d) => clamp((t - a) / d);
const oC = x => 1 - Math.pow(1 - x, 3);
const oQ = x => 1 - Math.pow(1 - x, 5);
const ioC = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const oB = (x, s = 1.7) => x <= 0 ? 0 : x >= 1 ? 1 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const oE = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const D2R = Math.PI / 180;
function rnd(seed) { let s = (seed * 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// spring-ish pop: 0 -> overshoot -> 1
const pop = (t, a, d = .45) => oB(win(t, a, d), 2.2);

// ----------------------------------------------------------------- media --
let MAN = {}, TRACK = {}, PAPER = null, GRAIN = [];
const cache = new Map(), missing = new Set();
function img(url) {
  const e = cache.get(url);
  if (e) { if (e.ok) { e.used = FRAME; return e.im; } return null; }
  missing.add(url); return null;
}
let FRAME = 0;
async function loadMissing() {
  const list = [...missing]; missing.clear();
  await Promise.all(list.map(u => {
    const im = new Image(); const e = { im, ok: false, used: FRAME }; cache.set(u, e);
    im.src = u; return im.decode().then(() => { e.ok = true; }).catch(() => { e.ok = true; e.bad = true; });
  }));
  if (cache.size > 500) {               // evict least recently used frames
    const arr = [...cache.entries()].filter(([u]) => u.includes("/frames/")).sort((a, b) => a[1].used - b[1].used);
    for (let i = 0; i < arr.length - 300; i++) cache.delete(arr[i][0]);
  }
}
// frame of clip `name` for global time t in a scene that starts at a
function frame(name, a, t, speed = 1) {
  const m = MAN[name]; if (!m) return null;
  const ct = m.in + (t - a) * speed;
  const i = clamp(Math.round((ct - m.start) * FPS), 0, m.n - 1);
  return img(`build/frames/${name}/${String(i).padStart(4, "0")}.${m.ext}`);
}
function frameIdx(name, a, t) { const m = MAN[name]; return clamp(Math.round((m.in + (t - a) - m.start) * FPS), 0, m.n - 1); }

// draw image covering rect; returns mapping {dx,dy,s}
function cover(c, im, x, y, w, h, o = {}) {
  if (!im) return null;
  const iw = im.naturalWidth, ih = im.naturalHeight, z = o.zoom || 1;
  const s = Math.max(w / iw, h / ih) * z, dw = iw * s, dh = ih * s;
  const dx = x + (w - dw) * (o.fx ?? .5), dy = y + (h - dh) * (o.fy ?? .5);
  c.save(); if (o.bw !== false) c.filter = o.filter || BW; c.drawImage(im, dx, dy, dw, dh); c.restore();
  return { dx, dy, s };
}

// ---------------------------------------------------------------- shapes --
function tornPath(c, x, y, w, h, seed, amp = 6, step = 13) {
  const r = rnd(seed); c.beginPath(); c.moveTo(x, y);
  for (let p = step; p < w; p += step * (0.6 + r() * .8)) c.lineTo(x + p, y + (r() - .5) * amp * 2);
  c.lineTo(x + w, y);
  for (let p = step; p < h; p += step * (0.6 + r() * .8)) c.lineTo(x + w + (r() - .5) * amp * 2, y + p);
  c.lineTo(x + w, y + h);
  for (let p = w - step; p > 0; p -= step * (0.6 + r() * .8)) c.lineTo(x + p, y + h + (r() - .5) * amp * 2);
  c.lineTo(x, y + h);
  for (let p = h - step; p > 0; p -= step * (0.6 + r() * .8)) c.lineTo(x + (r() - .5) * amp * 2, y + p);
  c.closePath();
}
// collage photo card: white torn border + shadow, content clipped inside
function card(c, o, inside) {
  const b = o.b ?? 14, s = o.s ?? 1;
  if (s <= 0.001 || (o.alpha ?? 1) <= 0) return;
  c.save();
  c.globalAlpha = o.alpha ?? 1;
  c.translate(o.x + o.w / 2 + (o.dx || 0), o.y + o.h / 2 + (o.dy || 0)); c.rotate((o.rot || 0) * D2R); c.scale(s, s);
  const x = -o.w / 2, y = -o.h / 2;
  c.save();
  c.shadowColor = "rgba(0,0,0,.30)"; c.shadowBlur = 34; c.shadowOffsetY = 16;
  c.fillStyle = o.border || "#fff"; tornPath(c, x - b, y - b, o.w + 2 * b, o.h + 2 * b, o.seed, o.amp ?? 7); c.fill();
  c.restore();
  c.save(); tornPath(c, x, y, o.w, o.h, o.seed + 9, 2.5, 18); c.clip();
  c.fillStyle = "#222"; c.fillRect(x, y, o.w, o.h);
  inside(c, x, y, o.w, o.h);
  c.restore();
  c.restore();
}
function circleCard(c, cx, cy, r, o, inside) {
  const s = o.s ?? 1; if (s <= 0.001) return;
  c.save(); c.translate(cx, cy); c.scale(s, s); c.rotate((o.rot || 0) * D2R);
  c.save(); c.shadowColor = "rgba(0,0,0,.28)"; c.shadowBlur = 34; c.shadowOffsetY = 16;
  c.fillStyle = "#fff"; c.beginPath(); c.arc(0, 0, r + (o.b ?? 14), 0, 7); c.fill(); c.restore();
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip(); c.fillStyle = "#222"; c.fillRect(-r, -r, 2 * r, 2 * r);
  inside(c, -r, -r, 2 * r, 2 * r); c.restore();
  c.restore();
}
function disc(c, x, y, r, col, s = 1) { if (s <= 0) return; c.fillStyle = col; c.beginPath(); c.arc(x, y, r * s, 0, 7); c.fill(); }
function dots(c, x, y, nx, ny, gap, r, col, p = 1) {
  c.fillStyle = col;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = clamp(p * (nx + ny) - (i + j)); if (k <= 0) continue;
    c.beginPath(); c.arc(x + i * gap, y + j * gap, r * oB(k), 0, 7); c.fill();
  }
}
function gridPatch(c, x, y, w, h, rot, gap = 34, alpha = 1) {
  c.save(); c.globalAlpha = alpha; c.translate(x + w / 2, y + h / 2); c.rotate(rot * D2R);
  c.fillStyle = "rgba(255,255,255,.85)"; c.fillRect(-w / 2, -h / 2, w, h);
  c.strokeStyle = "rgba(20,20,20,.22)"; c.lineWidth = 1.5; c.beginPath();
  for (let gx = -w / 2; gx <= w / 2 + 1; gx += gap) { c.moveTo(gx, -h / 2); c.lineTo(gx, h / 2); }
  for (let gy = -h / 2; gy <= h / 2 + 1; gy += gap) { c.moveTo(-w / 2, gy); c.lineTo(w / 2, gy); }
  c.stroke(); c.restore();
}
// cut-out of keyed footage with white sticker outline + shadow
function cutout(c, im, src, dst, o = {}) {
  if (!im) return;
  const [sx, sy, sw, sh] = src, [dx, dy, dw, dh] = dst, ow = o.outline ?? 12, pad = ow + 4;
  const tw = Math.ceil(dw + pad * 2), th = Math.ceil(dh + pad * 2);
  if (tmp1.width !== tw || tmp1.height !== th) { tmp1.width = tw; tmp1.height = th; tmp2.width = tw; tmp2.height = th; }
  const a = tmp1.getContext("2d"), b = tmp2.getContext("2d");
  a.clearRect(0, 0, tw, th); a.drawImage(im, sx, sy, sw, sh, pad, pad, dw, dh);
  a.globalCompositeOperation = "source-in"; a.fillStyle = "#fff"; a.fillRect(0, 0, tw, th); a.globalCompositeOperation = "source-over";
  b.clearRect(0, 0, tw, th);
  for (let k = 0; k < 16; k++) { const an = k / 16 * Math.PI * 2; b.drawImage(tmp1, Math.cos(an) * ow, Math.sin(an) * ow); }
  b.drawImage(tmp1, 0, 0);
  c.save(); c.shadowColor = "rgba(0,0,0,.33)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.drawImage(tmp2, dx - pad, dy - pad); c.restore();
  c.save(); c.filter = o.filter || BW; c.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh); c.restore();
}
// torn paper strip (hides the straight bottom edge of a cut-out)
function strip(c, x, y, w, h, col, seed, rot = 0) {
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot * D2R);
  c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 20; c.shadowOffsetY = -4;
  c.fillStyle = col; tornPath(c, -w / 2, -h / 2, w, h, seed, 9, 11); c.fill(); c.restore();
}

// ------------------------------------------------------------------ type --
function setFont(c, o) { c.font = `${o.w || 900} ${o.size}px ${o.fam || "Poppins"}`; c.letterSpacing = (o.ls ?? 0) + "px"; }
function measure(c, s, o) { setFont(c, o); return c.measureText(s).width; }
// words: [[text, time], ...] revealed one by one (slide up out of a mask)
function line(c, words, x, y, o, t) {
  setFont(c, o);
  const sp = c.measureText(" ").width * (o.space ?? 1);
  const ws = words.map(([s]) => c.measureText(s).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cx = o.align === "center" ? x - total / 2 : o.align === "right" ? x - total : x;
  const sz = o.size, cols = o.colors || [];
  const box = { x: cx, y: y - sz * .78, w: total, h: sz };
  words.forEach(([s, tt], i) => {
    const p = win(t, tt - .04, o.dur ?? .38);
    if (p > 0) {
      c.save();
      c.beginPath(); c.rect(cx - 30, y - sz * 1.15, ws[i] + 60, sz * 1.5); c.clip();
      const e = oQ(p);
      c.translate(cx, y + (1 - e) * sz * 1.05); c.rotate((1 - e) * 6 * D2R);
      c.fillStyle = cols[i] || o.color || COL.ink; c.textAlign = "left"; c.textBaseline = "alphabetic";
      if (o.shadow) { c.shadowColor = "rgba(0,0,0,.25)"; c.shadowOffsetY = 6; c.shadowBlur = 12; }
      c.fillText(s, 0, 0); c.restore();
    }
    cx += ws[i] + sp;
  });
  return box;
}
// marker highlight bar behind text box
function hbar(c, box, p, col = COL.beige, o = {}) {
  if (p <= 0) return;
  const e = oC(p), padX = o.padX ?? 18, h = box.h * (o.hf ?? .42);
  const y = box.y + box.h * (o.yf ?? .62) - h / 2;
  c.save(); c.translate(box.x - padX, y); c.rotate((o.rot ?? -1.2) * D2R);
  c.fillStyle = col; c.globalAlpha = o.alpha ?? 1;
  const w = (box.w + padX * 2) * e;
  c.beginPath(); c.moveTo(0, 4); c.lineTo(w, 0); c.lineTo(w - 6, h); c.lineTo(4, h + 3); c.closePath(); c.fill();
  c.restore();
}
function marker(c, s, x, y, size, col, rot, p, align = "center") {
  if (p <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot * D2R); const k = oB(p, 2.4); c.scale(k, k);
  c.font = `400 ${size}px Marker`; c.letterSpacing = "0px"; c.fillStyle = col; c.textAlign = align; c.textBaseline = "middle";
  c.fillText(s, 0, 0); c.restore();
}
function tag(c, s, x, y, o, p) {        // rounded label sticker, anchored at its left-center
  if (p <= 0) return;
  setFont(c, { w: o.w || 900, size: o.size || 54, ls: o.ls ?? 1 });
  const tw = c.measureText(s).width, ph = (o.size || 54) * 1.45, pw = tw + (o.pad ?? 34) * 2;
  c.save(); c.translate(x + pw / 2, y); c.rotate((o.rot || 0) * D2R); const k = oB(p, 2.6); c.scale(k, k);
  c.shadowColor = "rgba(0,0,0,.28)"; c.shadowBlur = 18; c.shadowOffsetY = 8;
  c.fillStyle = o.bg || COL.red; c.beginPath(); c.roundRect(-pw / 2, -ph / 2, pw, ph, o.r ?? 10); c.fill();
  c.shadowColor = "transparent";
  c.fillStyle = o.fg || "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(s, 0, (o.size || 54) * .06); c.restore();
  return pw;
}
function numBadge(c, n, x, y, p) {
  if (p <= 0) return; const k = oB(p, 2.4);
  c.save(); c.translate(x, y); c.scale(k, k); disc(c, 0, 0, 46, COL.red);
  setFont(c, { w: 900, size: 44 }); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(n, 0, 3); c.restore();
}

// ----------------------------------------------------------------- icons --
function fishIcon(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath();
  c.moveTo(-40, 0); c.bezierCurveTo(-20, -28, 25, -28, 40, 0); c.bezierCurveTo(25, 28, -20, 28, -40, 0); c.fill();
  c.beginPath(); c.moveTo(-34, 0); c.lineTo(-62, -22); c.lineTo(-58, 0); c.lineTo(-62, 22); c.closePath(); c.fill();
  c.fillStyle = "#fff"; c.beginPath(); c.arc(22, -6, 5, 0, 7); c.fill(); c.restore();
}
function heart(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath();
  c.moveTo(0, 12); c.bezierCurveTo(-26, -6, -14, -30, 0, -14); c.bezierCurveTo(14, -30, 26, -6, 0, 12); c.fill(); c.restore();
}
function check(c, x, y, r, p) {
  if (p <= 0) return; const k = oB(p, 2.4);
  c.save(); c.translate(x, y); c.scale(k, k); disc(c, 0, 0, r, COL.red);
  c.strokeStyle = "#fff"; c.lineWidth = r * .22; c.lineCap = c.lineJoin = "round";
  const q = clamp(p * 1.6 - .3); c.beginPath(); c.moveTo(-r * .45, 0);
  if (q < .45) c.lineTo(lerp(-r * .45, -r * .12, q / .45), lerp(0, r * .33, q / .45));
  else { c.lineTo(-r * .12, r * .33); c.lineTo(lerp(-r * .12, r * .48, (q - .45) / .55), lerp(r * .33, -r * .35, (q - .45) / .55)); }
  c.stroke(); c.restore();
}
function magnifier(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 5; c.lineCap = "round";
  c.beginPath(); c.arc(-3, -3, 11, 0, 7); c.stroke(); c.beginPath(); c.moveTo(5, 5); c.lineTo(14, 14); c.stroke(); c.restore();
}
function arrowDown(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 14; c.lineCap = c.lineJoin = "round";
  c.beginPath(); c.moveTo(-34, -16); c.lineTo(0, 18); c.lineTo(34, -16); c.stroke(); c.restore();
}

// shared furniture: dot grids in two corners, like the reference posts
function corners(c, t, a) {
  const p = win(t, a + .05, .6);
  dots(c, 900, 170, 5, 5, 22, 4.2, COL.red, p);
  dots(c, 70, 1640, 5, 5, 22, 4.2, COL.red, p);
}
function paper(c) { if (PAPER) c.drawImage(PAPER, 0, 0, W, H); else { c.fillStyle = COL.paper; c.fillRect(0, 0, W, H); } }

// ================================================================ SCENES ==
// Global times (VO starts at 0.5 s). Word times come from ElevenLabs alignment.
const S = {};

// 1 ── "Digital duniya mein sirf website hona..."
S.hook = (c, t, a) => {
  const lt = t - a; paper(c);
  gridPatch(c, 40, 560, 330, 330, 6, 34, win(lt, .05, .4));
  disc(c, 790, 1010, 330, COL.red, oB(win(lt, .12, .55)));
  disc(c, 150, 1390, 46, COL.blue, pop(t, 1.0));
  corners(c, t, a);
  const e = oB(win(lt, 0, .6), 1.2);
  card(c, { x: 70, y: 660, w: 940, h: 600, rot: lerp(-6, -2.5, e), s: lerp(.82, 1, e) * (1 + lt * .012), seed: 11, alpha: clamp(lt * 4 + 1) }, (k, x, y, w, h) => {
    const im = frame("laptop", a, t);
    const m = cover(k, im, x, y, w, h, { zoom: 1.0, fy: .4 });
    if (!m) return;
    const tr = TRACK.laptop, fi = frameIdx("laptop", a, t) / Math.max(1, MAN.laptop.n - 1);
    const sc = tr.screen.map((v, i) => lerp(v, tr.screen_end[i], fi * 1.1));
    const X = m.dx + sc[0] * m.s, Y = m.dy + sc[1] * m.s, SW = (sc[2] - sc[0]) * m.s, SH = (sc[3] - sc[1]) * m.s;
    websiteMock(k, X, Y, SW, SH, lt);
  });
  const l1 = line(c, [["Digital", .5], ["duniya", .98], ["mein", 1.26]], 80, 330, { size: 74, w: 800 }, t);
  const b2 = line(c, [["SIRF", 1.39], ["WEBSITE", 1.7]], 80, 500, { size: 150, w: 900, ls: -2, color: COL.red }, t);
  hbar(c, b2, win(t, 1.75, .4), COL.beige, { hf: .3, yf: 1.0, rot: -.8 });
  // re-draw text above the bar
  line(c, [["SIRF", 1.39], ["WEBSITE", 1.7]], 80, 500, { size: 150, w: 900, ls: -2, color: COL.red }, t);
  marker(c, "hona...", 800, 1330, 92, COL.ink, -6, win(t, 2.1, .4));
};
function websiteMock(c, x, y, w, h, lt) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = "#fbfaf7"; c.fillRect(x, y, w, h);
  const u = w / 100;
  c.fillStyle = "#e9e6e0"; c.fillRect(x, y, w, 5 * u);
  [COL.red, COL.beige, "#9a9a9a"].forEach((col, i) => disc(c, x + (2.5 + i * 2.6) * u, y + 2.5 * u, .9 * u, col));
  c.fillStyle = "#fff"; c.beginPath(); c.roundRect(x + 12 * u, y + 1.2 * u, 50 * u, 2.6 * u, 1.3 * u); c.fill();
  c.font = `600 ${1.6 * u}px Poppins`; c.letterSpacing = "0px"; c.fillStyle = "#888"; c.textBaseline = "middle"; c.textAlign = "left";
  c.fillText("www.aapkabusiness.com", x + 14 * u, y + 2.6 * u);
  c.fillStyle = COL.ink; c.font = `900 ${2.6 * u}px Poppins`; c.fillText("AAPKA BRAND", x + 4 * u, y + 10 * u);
  c.font = `600 ${1.6 * u}px Poppins`; c.fillStyle = "#666";
  ["Home", "Services", "Work", "Contact"].forEach((s, i) => c.fillText(s, x + (56 + i * 10.5) * u, y + 10 * u));
  c.fillStyle = COL.ink; c.font = `900 ${6.2 * u}px Poppins`; c.textBaseline = "alphabetic";
  c.fillText("We build", x + 4 * u, y + 25 * u); c.fillStyle = COL.red; c.fillText("websites.", x + 4 * u, y + 32.5 * u);
  c.fillStyle = "#bbb"; c.fillRect(x + 4 * u, y + 36 * u, 36 * u, 1.3 * u); c.fillRect(x + 4 * u, y + 39 * u, 28 * u, 1.3 * u);
  c.fillStyle = COL.red; c.beginPath(); c.roundRect(x + 4 * u, y + 43 * u, 16 * u, 5 * u, 2.5 * u); c.fill();
  c.fillStyle = "#fff"; c.font = `800 ${1.7 * u}px Poppins`; c.textBaseline = "middle"; c.fillText("Get Started", x + 6.3 * u, y + 45.6 * u);
  c.fillStyle = "#d9d4cb"; c.beginPath(); c.roundRect(x + 54 * u, y + 15 * u, 42 * u, 36 * u, 2 * u); c.fill();
  disc(c, x + 75 * u, y + 33 * u, 11 * u, COL.red); disc(c, x + 82 * u, y + 26 * u, 4 * u, COL.beige);
  c.restore();
}

// 2 ── "dukaan khol ke board na lagane jaisa hai!"
S.shop = (c, t, a) => {
  const lt = t - a; paper(c);
  disc(c, 160, 360, 120, COL.red, oB(win(lt, .1, .5)));
  corners(c, t, a);
  const e = oC(win(lt, -.25, .6));
  card(c, { x: 150, y: 250, w: 780, h: 860, rot: 2.2, dy: (1 - e) * -160, seed: 21 }, (k, x, y, w, h) => {
    cover(k, frame("sign", a, t), x, y, w, h, { zoom: 1.05 + lt * .03, fx: .5, fy: .45 });
  });
  // the empty signboard nobody put up
  const bp = win(t, 3.55, .5);
  if (bp > 0) {
    const sw = Math.sin((t - 3.55) * 6) * 7 * Math.exp(-(t - 3.55) * 1.6);
    c.save(); c.translate(760, 980); c.rotate(sw * D2R); const k = oB(bp, 2); c.scale(k, k);
    c.strokeStyle = COL.ink; c.lineWidth = 5; c.beginPath(); c.moveTo(-110, -150); c.lineTo(-120, -20); c.moveTo(110, -150); c.lineTo(120, -20); c.stroke();
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 24; c.shadowOffsetY = 12;
    c.fillStyle = "#fff"; c.beginPath(); c.roundRect(-190, -30, 380, 190, 10); c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = COL.ink; c.lineWidth = 9; c.beginPath(); c.roundRect(-176, -16, 352, 162, 6); c.stroke();
    c.setLineDash([16, 14]); c.strokeStyle = "#b9b4ab"; c.lineWidth = 5; c.beginPath(); c.roundRect(-150, 8, 300, 114, 4); c.stroke(); c.setLineDash([]);
    c.font = "400 92px Marker"; c.fillStyle = COL.red; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("?", 0, 68);
    c.restore();
  }
  line(c, [["Dukaan", 2.83], ["khol", 3.25], ["ke", 3.45]], 80, 1300, { size: 84, w: 800 }, t);
  const bb = line(c, [["BOARD", 3.61]], 80, 1460, { size: 168, w: 900, ls: -3, color: COL.red }, t);
  const sp = win(t, 3.95, .3);
  if (sp > 0) { c.save(); c.strokeStyle = COL.ink; c.lineWidth = 16; c.lineCap = "round"; c.beginPath(); c.moveTo(bb.x - 10, bb.y + bb.h * .52); c.lineTo(bb.x - 10 + (bb.w + 20) * oC(sp), bb.y + bb.h * .46); c.stroke(); c.restore(); }
  line(c, [["na", 3.84], ["lagane", 3.94]], 690, 1400, { size: 62, w: 800 }, t);
  line(c, [["jaisa", 4.25], ["hai!", 4.56]], 690, 1470, { size: 62, w: 800, colors: [COL.ink, COL.red] }, t);
};

// 3 ── "Socho!"
S.socho = (c, t, a) => {
  const lt = t - a; paper(c);
  disc(c, 540, 1180, 440, COL.red, oB(win(lt, -.05, .4), 1.5));
  dots(c, 120, 1000, 6, 6, 24, 4.5, COL.ink, win(lt, .1, .4));
  corners(c, t, a);
  const im = frame("socho", a, t), bb = TRACK.socho.bbox;
  const sc = 1080 / (bb[3] - bb[1]) * (1 + lt * .03);
  const sw = (bb[2] - bb[0] + 120), sh = 720 - bb[1] + 10;
  const dw = sw * sc, dh = sh * sc;
  const e = oC(win(lt, -.1, .45));
  cutout(c, im, [bb[0] - 60, bb[1] - 10, sw, sh], [540 - dw / 2, H - dh + (1 - e) * 200 + 4, dw, dh], { outline: 14 });
  // SOCHO! — letters slam in
  const letters = "SOCHO!".split(""); setFont(c, { fam: "Anton", w: 400, size: 330, ls: 4 });
  const ws = letters.map(l => c.measureText(l).width), tot = ws.reduce((x, y) => x + y, 0);
  let x = 540 - tot / 2;
  const shake = Math.exp(-lt * 5) * 9;
  letters.forEach((l, i) => {
    const p = win(t, 5.17 + i * .035, .3);
    if (p > 0) {
      const k = lerp(1.9, 1, oQ(p));
      c.save(); c.translate(x + ws[i] / 2 + Math.sin(t * 70 + i) * shake, 720 + Math.cos(t * 63 + i) * shake); c.scale(k, k);
      c.globalAlpha = clamp(p * 3); c.fillStyle = i === 5 ? COL.red : COL.ink; c.textAlign = "center"; c.fillText(l, 0, 0); c.restore();
    }
    x += ws[i];
  });
  hbar(c, { x: 540 - tot / 2, y: 470, w: tot, h: 300 }, win(t, 5.35, .3), COL.red, { hf: .1, yf: .98, rot: -1 });
  marker(c, "?", 860, 1010, 170, COL.ink, 14 + Math.sin(t * 5) * 4, win(t, 5.4, .35));
  marker(c, "?", 220, 1180, 120, COL.white, -16, win(t, 5.55, .35));
  marker(c, "?", 905, 1300, 100, COL.white, 8, win(t, 5.7, .35));
};

// 4 ── "Website toh bana li... lekin customers aayenge kahan se?"
S.empty = (c, t, a) => {
  const lt = t - a; paper(c);
  gridPatch(c, 700, 330, 300, 240, -5, 30, win(lt, 0, .4));
  corners(c, t, a);
  const e = oC(win(lt, -.2, .6));
  card(c, { x: 60, y: 420, w: 960, h: 600, rot: -1.5, s: lerp(1.08, 1, e), seed: 41 }, (k, x, y, w, h) => {
    cover(k, frame("street", a, t), x, y, w, h, { zoom: 1.08 + lt * .025 });
  });
  // analytics sticker: visitors 0
  const vp = win(t, 7.75, .45);
  if (vp > 0) {
    c.save(); c.translate(250, 930); c.rotate(-4 * D2R); const k = oB(vp, 2.2); c.scale(k, k);
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = "#fff";
    c.beginPath(); c.roundRect(-170, -95, 340, 190, 18); c.fill(); c.shadowColor = "transparent";
    setFont(c, { w: 700, size: 30 }); c.fillStyle = "#777"; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText("Visitors today", -140, -40);
    c.font = "400 120px Anton"; c.fillStyle = COL.red; c.fillText("0", -140, 78);
    c.strokeStyle = "#ccc"; c.lineWidth = 5; c.beginPath(); c.moveTo(-40, 50); c.lineTo(140, 50); c.stroke();
    c.restore();
  }
  // confused customer-less owner
  const im = frame("confused", a, t), bb = TRACK.confused.bbox;
  const sc = .86, sx = bb[0], sy = bb[1], sw = bb[2] - bb[0], sh = 720 - bb[1];
  const ce = oC(win(lt, .9, .6));
  cutout(c, im, [sx, sy, sw, sh], [400, H - sh * sc + (1 - ce) * 500 + 4, sw * sc, sh * sc], { outline: 13 });
  const l1 = line(c, [["Website", 6.36], ["toh", 6.79], ["bana", 6.9], ["li", 7.12]], 80, 330, { size: 76, w: 800 }, t);
  check(c, l1.x + measure(c, "Website toh bana li", { size: 76, w: 800 }) + 70, 302, 40, win(t, 7.3, .5));
  line(c, [["Customers", 8.21], ["aayenge", 8.69]], 80, 1140, { size: 82, w: 800, shadow: false }, t);
  const kb = line(c, [["KAHAN", 8.97], ["SE", 9.18]], 80, 1290, { size: 150, w: 900, ls: -2, color: COL.red }, t);
  ["?", "?", "?"].forEach((q, i) => marker(c, q, kb.x + kb.w + 50 + i * 62, 1230 - i * 14, 130, COL.ink, -10 + i * 12, win(t, 9.25 + i * .1, .3)));
};

// 5 ── "Website ek jaal hai, lekin sirf jaal se machhli nahi pakadti."
S.net = (c, t, a) => {
  const lt = t - a; paper(c);
  corners(c, t, a);
  const cy = 930, r = 360, e = oB(win(lt, -.15, .6), 1.4);
  disc(c, 540 + 46, cy + 34, r + 16, COL.red, e);
  circleCard(c, 540, cy, r, { s: e, rot: lt * 2 }, (k, x, y, w, h) => {
    cover(k, frame("net1", a, t), x, y, w, h, { zoom: 1.15 + lt * .04, fx: .5 });
    const wp = win(t, 11.35, .5);
    if (wp > 0) {
      k.save(); k.beginPath(); k.arc(0, 0, r * 1.5 * ioC(wp), 0, 7); k.clip();
      cover(k, frame("net2", 11.35, t), x, y, w, h, { zoom: 1.2, fx: .55 }); k.restore();
      k.strokeStyle = "#fff"; k.lineWidth = 10 * (1 - wp); k.beginPath(); k.arc(0, 0, r * 1.5 * ioC(wp), 0, 7); k.stroke();
    }
  });
  line(c, [["Website", 9.9]], 80, 300, { size: 84, w: 800 }, t);
  const jb = line(c, [["=", 10.0], ["EK", 10.4], ["JAAL", 10.53]], 80, 460, { size: 150, w: 900, ls: -2, color: COL.red }, t);
  hbar(c, jb, win(t, 10.6, .35), COL.beige, { hf: .28, yf: 1.0 });
  line(c, [["=", 10.0], ["EK", 10.4], ["JAAL", 10.53]], 80, 460, { size: 150, w: 900, ls: -2, color: COL.red }, t);
  // no fish badge
  const fp = win(t, 12.3, .45);
  if (fp > 0) {
    c.save(); c.translate(225, 1210); const k = oB(fp, 2.4); c.scale(k, k);
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 20; c.shadowOffsetY = 10; disc(c, 0, 0, 96, "#fff"); c.shadowColor = "transparent";
    fishIcon(c, 8, 0, 1.25, COL.ink);
    c.strokeStyle = COL.red; c.lineWidth = 15; c.lineCap = "round"; const q = win(t, 12.55, .25);
    c.beginPath(); c.moveTo(-60, -60); c.lineTo(-60 + 120 * q, -60 + 120 * q); c.stroke();
    c.restore();
  }
  line(c, [["Sirf", 11.76], ["jaal", 12.02], ["se", 12.25]], 80, 1450, { size: 74, w: 800 }, t);
  line(c, [["MACHHLI", 12.34], ["NAHI", 12.62]], 80, 1590, { size: 128, w: 900, ls: -2, color: COL.red }, t);
  marker(c, "pakadti!", 850, 1305, 84, COL.ink, -7, win(t, 12.76, .4));
};

// 6 ── "Uske liye paani bhi toh chahiye!! Aur digital world mein ye paani hai..."
S.water = (c, t, a) => {
  const lt = t - a; paper(c);
  corners(c, t, a);
  const e = oC(win(lt, -.2, .7));
  card(c, { x: 70, y: 720, w: 940, h: 840, rot: 1.5, dy: (1 - e) * 300, seed: 61 }, (k, x, y, w, h) => {
    cover(k, frame("fish", a, t), x, y, w, h, { zoom: 1.05 + lt * .03, fx: .45, filter: "grayscale(1) contrast(1.35) brightness(1.08)" });
    // rising bubbles
    const R = rnd(5);
    for (let i = 0; i < 26; i++) {
      const bx = x + R() * w, sp = 120 + R() * 200, ph = R() * 10, br = 4 + R() * 12;
      const by = y + h - ((lt + ph) * sp) % (h + 60);
      k.strokeStyle = "rgba(255,255,255,.7)"; k.lineWidth = 2.5; k.beginPath(); k.arc(bx + Math.sin(lt * 3 + i) * 10, by, br, 0, 7); k.stroke();
    }
  });
  line(c, [["Uske", 13.64], ["liye", 13.93]], 80, 290, { size: 74, w: 800 }, t);
  // PAANI filled with real water footage
  const pp = win(t, 14.02, .45);
  if (pp > 0) {
    c.save(); const k = lerp(1.35, 1, oQ(pp)); c.translate(80, 600); c.scale(k, k);
    c.font = "400 300px Anton"; c.letterSpacing = "6px"; c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.globalAlpha = clamp(pp * 3);
    c.fillStyle = COL.red; c.fillText("PAANI", 12, 12);
    c.save(); c.beginPath(); c.rect(0, -300, 900, 330); c.clip();
    // text-shaped clip via compositing on tmp canvas
    c.restore();
    const tw = 920, th = 330; if (tmp1.width !== tw || tmp1.height !== th) { tmp1.width = tw; tmp1.height = th; }
    const q = tmp1.getContext("2d"); q.clearRect(0, 0, tw, th);
    q.font = "400 300px Anton"; q.letterSpacing = "6px"; q.textBaseline = "alphabetic"; q.fillStyle = "#000"; q.fillText("PAANI", 0, 300);
    q.globalCompositeOperation = "source-in"; cover(q, frame("water", a, t), 0, 0, tw, th, { zoom: 1.3, filter: "grayscale(1) contrast(1.5) brightness(.9)" });
    q.globalCompositeOperation = "source-over";
    c.drawImage(tmp1, 0, -300);
    c.restore();
  }
  line(c, [["bhi", 13.83 + .5], ["toh", 13.92 + .5], ["chahiye!!", 14.54]], 80, 690, { size: 64, w: 800, colors: [COL.ink, COL.ink, COL.red] }, t);
  // "digital world" sticker
  tag(c, "DIGITAL WORLD", 110, 800, { bg: COL.ink, size: 50, rot: -4 }, win(t, 15.5, .45));
  tag(c, "ye paani hai...", 560, 1500, { bg: "#fff", fg: COL.ink, size: 46, w: 800, rot: 3 }, win(t, 16.28, .45));
};

// 7 ── "Google... social media... aur ads!"
S.channels = (c, t, a) => {
  const lt = t - a; paper(c);
  corners(c, t, a);
  line(c, [["Digital", 17.32], ["paani", 17.36], ["=", 17.4]], 80, 250, { size: 58, w: 800, colors: [COL.ink, COL.red, COL.ink] }, t);
  const bands = [
    { y: 300, t0: 17.45, clip: "google", side: -1, rot: -1.5, seed: 71, label: "GOOGLE", bg: COL.red, fx: .62 },
    { y: 730, t0: 18.42, clip: "social1", side: 1, rot: 1.2, seed: 72, label: "SOCIAL MEDIA", bg: COL.ink, fx: .45 },
    { y: 1160, t0: 19.88, clip: "ads", side: -1, rot: -1, seed: 73, label: "ADS", bg: COL.red, fx: .4 },
  ];
  bands.forEach((b, i) => {
    const p = win(t, b.t0, .42); if (p <= 0) return;
    const e = oQ(p), off = (1 - e) * 1200 * b.side;
    const blurN = p < .7 ? 4 : 1;
    for (let k = blurN - 1; k >= 0; k--) {
      c.save(); c.globalAlpha = k === 0 ? 1 : .18;
      card(c, { x: 60 + off + k * 40 * b.side * (1 - e), y: b.y, w: 960, h: 390, rot: b.rot, s: lerp(1.06, 1, oC(win(t, b.t0 + .3, .25))), seed: b.seed }, (q, x, y, w, h) => {
        cover(q, frame(b.clip, b.t0, t), x, y, w, h, { zoom: 1.05 + (t - b.t0) * .03, fx: b.fx });
      });
      c.restore();
    }
    tag(c, b.label, 40, b.y + 30, { bg: b.bg, size: 58, rot: -4 }, win(t, b.t0 + .22, .4));
  });
  // google: search bar typing
  const sp = win(t, 17.75, .35);
  if (sp > 0) {
    const q = "best agency near me", n = Math.floor(clamp((t - 17.9) / .6) * q.length);
    c.save(); c.translate(560, 640); c.rotate(1.5 * D2R); const k = oB(sp, 2.2); c.scale(k, k);
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 22; c.shadowOffsetY = 10;
    c.fillStyle = "#fff"; c.beginPath(); c.roundRect(-250, -45, 500, 90, 45); c.fill(); c.shadowColor = "transparent";
    magnifier(c, -205, 0, 1.3, "#888");
    setFont(c, { w: 600, size: 32 }); c.fillStyle = COL.ink; c.textAlign = "left"; c.textBaseline = "middle";
    c.fillText(q.slice(0, n) + ((t * 2.5) % 1 < .5 ? "|" : ""), -170, 2); c.restore();
  }
  // social: likes
  [[880, 920, 18.75], [940, 1020, 18.9], [820, 1050, 19.05]].forEach(([x, y, tt], i) => {
    const p = win(t, tt, .5); if (p <= 0) return;
    const fl = (t - tt) * 120;
    c.save(); c.globalAlpha = clamp(2 - (t - tt) * .8); heart(c, x, y - fl, 2.2 * oB(p, 2.5), i === 1 ? "#fff" : COL.red); c.restore();
  });
  tag(c, "♥ 1,248", 640, 1060, { bg: "#fff", fg: COL.red, size: 40, rot: -3 }, win(t, 18.95, .4));
  tag(c, "Sponsored", 700, 1500, { bg: COL.beige, fg: COL.ink, size: 40, w: 800, rot: 3 }, win(t, 20.3, .4));
};

// 8 ── "Branding aapke business ko ek unique identity deti hai"
S.brand = (c, t, a) => {
  const lt = t - a; paper(c);
  disc(c, 900, 640, 200, COL.red, oB(win(lt, .3, .5)));
  corners(c, t, a);
  numBadge(c, "01", 126, 214, win(t, 21.3, .4));
  line(c, [["BRANDING", 21.41]], 72, 400, { size: 150, w: 900, ls: -3 }, t);
  line(c, [["aapke", 21.51], ["business", 21.85], ["ko", 22.26], ["ek", 22.51]], 80, 490, { size: 54, w: 700 }, t);
  const e = oC(win(lt, -.1, .6));
  card(c, { x: 90, y: 570, w: 900, h: 620, rot: -2.2, s: lerp(.9, 1, e), alpha: clamp(e * 2), seed: 81 }, (k, x, y, w, h) => {
    cover(k, frame("brand", a, t), x, y, w, h, { zoom: 1.1 + lt * .03, fx: .35, filter: "grayscale(.15) contrast(1.15) brightness(1.03)" });
  });
  circleCard(c, 230, 1250, 150, { s: oB(win(t, 22.1, .5), 1.6) }, (k, x, y, w, h) => cover(k, frame("sketch", a, t), x, y, w, h, { zoom: 1.4, fx: .55 }));
  line(c, [["UNIQUE", 23.31]], 1010, 1400, { size: 140, w: 900, ls: -3, color: COL.red, align: "right" }, t);
  const ib = line(c, [["IDENTITY", 23.63]], 1010, 1545, { size: 140, w: 900, ls: -3, align: "right" }, t);
  hbar(c, ib, win(t, 23.75, .35), COL.beige, { hf: .3, yf: 1.0 });
  line(c, [["IDENTITY", 23.63]], 1010, 1545, { size: 140, w: 900, ls: -3, align: "right" }, t);
  marker(c, "deti hai!", 850, 1640, 70, COL.ink, -6, win(t, 24.05, .4));
};

// 9 ── "social media aapko visible rakhta hai"
S.social = (c, t, a) => {
  const lt = t - a; paper(c);
  disc(c, 200, 560, 170, COL.red, oB(win(lt, .05, .5)));
  corners(c, t, a);
  numBadge(c, "02", 126, 214, win(t, 24.85, .4));
  line(c, [["SOCIAL", 24.96], ["MEDIA", 25.38]], 72, 380, { size: 118, w: 900, ls: -2 }, t);
  const e = oC(win(lt, -.15, .6));
  card(c, { x: 250, y: 450, w: 600, h: 900, rot: 2.5, dy: (1 - e) * 400, seed: 91 }, (k, x, y, w, h) => {
    cover(k, frame("social2", a, t), x, y, w, h, { zoom: 1.05 + lt * .03, fy: .4 });
  });
  tag(c, "♥ 2.4K", 90, 700, { bg: COL.red, size: 52, rot: -6 }, win(t, 25.15, .4));
  tag(c, "+312 followers", 640, 860, { bg: "#fff", fg: COL.ink, size: 40, w: 800, rot: 4 }, win(t, 25.45, .4));
  tag(c, "@aapkabrand", 90, 1120, { bg: COL.ink, size: 40, w: 800, rot: -3 }, win(t, 25.7, .4));
  [[820, 640, 25.3], [900, 560, 25.5], [760, 520, 25.7], [180, 980, 25.9]].forEach(([x, y, tt], i) => {
    const p = win(t, tt, .5); if (p <= 0) return;
    c.save(); c.globalAlpha = clamp(2.2 - (t - tt)); heart(c, x, y - (t - tt) * 90, 2.4 * oB(p, 2.5), i % 2 ? COL.red : COL.ink); c.restore();
  });
  line(c, [["aapko", 25.2]], 80, 1450, { size: 66, w: 800 }, t);
  const vb = line(c, [["VISIBLE", 26.01]], 80, 1610, { size: 170, w: 900, ls: -3, color: COL.red }, t);
  marker(c, "rakhta hai", 840, 1440, 64, COL.ink, -5, win(t, 26.39, .4));
  // eye-catch rings around VISIBLE
  const rp = win(t, 26.1, .6); if (rp > 0) { c.save(); c.strokeStyle = COL.ink; c.lineWidth = 6; c.globalAlpha = 1 - rp; c.beginPath(); c.ellipse(vb.x + vb.w / 2, vb.y + vb.h * .45, vb.w * .6 * (0.8 + rp * .4), vb.h * .7 * (.8 + rp * .4), -.04, 0, 7); c.stroke(); c.restore(); }
};

// 10 ── "aur website visitors ko customers mein convert karne mein help karti hai"
S.convert = (c, t, a) => {
  const lt = t - a; paper(c);
  corners(c, t, a);
  gridPatch(c, 650, 420, 360, 360, 4, 32, win(lt, 0, .4));
  numBadge(c, "03", 126, 214, win(t, 27.05, .4));
  line(c, [["WEBSITE", 27.16]], 72, 380, { size: 150, w: 900, ls: -3 }, t);
  const e1 = oC(win(lt, -.1, .55));
  card(c, { x: 70, y: 470, w: 640, h: 430, rot: -3, s: lerp(.85, 1, e1), alpha: clamp(e1 * 2), seed: 101 }, (k, x, y, w, h) => {
    cover(k, frame("card", a, t), x, y, w, h, { zoom: 1.15, fx: .5 });
  });
  tag(c, "VISITORS", 60, 900, { bg: COL.ink, size: 50, rot: -4 }, win(t, 27.85, .4));
  const e2 = oC(win(t, 28.4, .55));
  card(c, { x: 370, y: 1010, w: 640, h: 430, rot: 2.5, s: lerp(.85, 1, e2), alpha: clamp(e2 * 2), seed: 102 }, (k, x, y, w, h) => {
    cover(k, frame("parcel", 28.4, t), x, y, w, h, { zoom: 1.1, fx: .5 });
  });
  tag(c, "CUSTOMERS", 600, 1440, { bg: COL.red, size: 50, rot: 3 }, win(t, 28.5, .4));
  // hand-drawn convert arrow
  const ap = win(t, 28.6, .55);
  if (ap > 0) {
    c.save(); c.strokeStyle = COL.red; c.lineWidth = 12; c.lineCap = c.lineJoin = "round";
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40 * oC(ap); pts.push([lerp(820, 230, u) + Math.sin(u * Math.PI) * 140, lerp(820, 1190, u)]); }
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    if (ap > .95) { const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 4]; const an = Math.atan2(y1 - y0, x1 - x0);
      c.beginPath(); c.moveTo(x1 - Math.cos(an - .5) * 44, y1 - Math.sin(an - .5) * 44); c.lineTo(x1, y1); c.lineTo(x1 - Math.cos(an + .5) * 44, y1 - Math.sin(an + .5) * 44); c.stroke(); }
    c.restore();
  }
  marker(c, "convert!", 930, 1000, 72, COL.ink, -8, win(t, 29.05, .4));
  // order sticker
  const op = win(t, 29.1, .45);
  if (op > 0) {
    c.save(); c.translate(250, 1190); c.rotate(-5 * D2R); const k = oB(op, 2.4); c.scale(k, k);
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = "#fff"; c.beginPath(); c.roundRect(-170, -60, 340, 120, 60); c.fill(); c.shadowColor = "transparent";
    check(c, -105, 0, 38, 1); setFont(c, { w: 800, size: 36 }); c.fillStyle = COL.ink; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText("Order placed", -55, -12);
    setFont(c, { w: 600, size: 26 }); c.fillStyle = "#777"; c.fillText("+1 customer", -55, 26); c.restore();
  }
  line(c, [["Visitors", 29.82], ["→", 29.9], ["Customers", 30.0]], 540, 1600, { size: 62, w: 800, align: "center", colors: [COL.ink, COL.red, COL.red] }, t);
};

// 11 ── "Lekin in sabke liye sahi strategy zaroori hai!"
S.strategy = (c, t, a) => {
  const lt = t - a; paper(c);
  corners(c, t, a);
  line(c, [["Lekin", 31.0], ["in", 31.37], ["sabke", 31.59], ["liye", 31.98]], 80, 290, { size: 70, w: 800 }, t);
  const sb = line(c, [["SAHI", 32.2], ["STRATEGY", 32.43]], 76, 470, { size: 168, w: 400, fam: "Anton", ls: 3, colors: [COL.ink, COL.red] }, t);
  const cy = 990, r = 360, e = oB(win(lt, -.1, .6), 1.4);
  disc(c, 540 - 50, cy + 40, r + 20, COL.red, e);
  circleCard(c, 540, cy, r, { s: e }, (k, x, y, w, h) => cover(k, frame("queen", a, t), x, y, w, h, { zoom: 1.35 + lt * .05, fx: .5, fy: .45, filter: "grayscale(1) contrast(1.3) brightness(1.25)" }));
  const te = oC(win(t, 31.45, .55));
  card(c, { x: 50, y: 1300, w: 370, h: 260, rot: -5, s: lerp(.6, 1, te), alpha: clamp(te * 2), seed: 111 }, (k, x, y, w, h) => cover(k, frame("team", a, t), x, y, w, h, { zoom: 1.1, fx: .45 }));
  const zb = line(c, [["zaroori", 32.88], ["hai!", 33.25]], 1010, 1440, { size: 86, w: 900, align: "right", colors: [COL.ink, COL.red] }, t);
  hbar(c, zb, win(t, 33.0, .35), COL.beige, { hf: .3, yf: 1.0 });
  line(c, [["zaroori", 32.88], ["hai!", 33.25]], 1010, 1440, { size: 86, w: 900, align: "right", colors: [COL.ink, COL.red] }, t);
  dots(c, 820, 1520, 6, 3, 24, 4.5, COL.ink, win(t, 33.0, .5));
};

// 12 ── "Ab aapke brand ko jaal aur paani, dono chahiye?"
S.both = (c, t, a) => {
  const lt = t - a; paper(c);
  corners(c, t, a);
  // decorative real sea along the bottom edge
  const sea = frame("bothsea", a, t);
  if (sea) { c.save(); c.filter = "grayscale(1) contrast(1.3)"; c.drawImage(sea, 0, 360, 1280, 360, -60, 1560, 1200, 340 + 30); c.restore(); }
  line(c, [["Ab", 33.72], ["aapke", 33.96], ["brand", 34.19], ["ko", 34.47]], 80, 290, { size: 74, w: 800, colors: [COL.ink, COL.ink, COL.red, COL.ink] }, t);
  const e1 = oC(win(lt, -.1, .5));
  card(c, { x: 70, y: 380, w: 940, h: 460, rot: -2, dx: (1 - e1) * -900, seed: 121 }, (k, x, y, w, h) => cover(k, frame("bothnet", a, t), x, y, w, h, { zoom: 1.1, fx: .5 }));
  tag(c, "JAAL", 70, 410, { bg: COL.ink, size: 64, rot: -5 }, win(t, 34.6, .4));
  const e2 = oC(win(t, 34.9, .5));
  card(c, { x: 70, y: 930, w: 940, h: 460, rot: 2, dx: (1 - e2) * 900, seed: 122 }, (k, x, y, w, h) => cover(k, frame("fish", 34.9, t), x, y, w, h, { zoom: 1.15, fx: .5, filter: "grayscale(1) contrast(1.35) brightness(1.08)" }));
  tag(c, "PAANI", 760, 1380, { bg: COL.red, size: 64, rot: 4 }, win(t, 34.98, .4));
  // plus badge
  const pp = win(t, 34.84, .45);
  if (pp > 0) { c.save(); c.translate(540, 885); const k = oB(pp, 2.5); c.scale(k, k); c.rotate((1 - pp) * 1.5);
    c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 20; c.shadowOffsetY = 8; disc(c, 0, 0, 92, COL.red); c.shadowColor = "transparent";
    c.fillStyle = "#fff"; c.fillRect(-46, -11, 92, 22); c.fillRect(-11, -46, 22, 92); c.restore(); }
  const db = line(c, [["DONO", 35.46]], 80, 1590, { size: 170, w: 900, ls: -3, color: COL.red, shadow: true }, t);
  line(c, [["chahiye?", 35.75]], db.x + measure(c, "DONO", { size: 170, w: 900, ls: -3 }) + 30, 1580, { size: 76, w: 800, shadow: true }, t);
};

// 13 ── "Toh neeche button par click karo..."
S.cta = (c, t, a) => {
  const lt = t - a; paper(c);
  disc(c, 540, 1160, 470, COL.red, oB(win(lt, -.1, .5), 1.3));
  dots(c, 110, 1500, 6, 6, 24, 4.5, COL.ink, win(lt, .1, .5));
  corners(c, t, a);
  line(c, [["Neeche", 36.82], ["button", 37.14], ["par", 37.42]], 80, 300, { size: 76, w: 800 }, t);
  const cb = line(c, [["CLICK", 37.59], ["KARO", 37.86]], 76, 470, { size: 150, w: 900, ls: -3, color: COL.red }, t);
  hbar(c, cb, win(t, 37.65, .3), COL.beige, { hf: .28, yf: 1.0 });
  line(c, [["CLICK", 37.59], ["KARO", 37.86]], 76, 470, { size: 150, w: 900, ls: -3, color: COL.red }, t);
  // hand + phone with our button on the screen
  const im = frame("phone", a, t); if (!im) return;
  const fi = frameIdx("phone", a, t), sc = TRACK.phone.screen[fi];
  const S2 = 2.05, ax = 600, ay = 560;               // source anchor -> canvas
  const ox = 540 - (ax - 0) * S2 + 0, oy = 640 - (90) * S2;
  const e = oC(win(lt, -.15, .55)), yo = (1 - e) * 600;
  const X = ox + (sc[0] + 8) * S2, Y = oy + (sc[1] + 22) * S2 + yo, SW = (sc[2] - sc[0] - 16) * S2, SH = (sc[3] - sc[1] - 42) * S2;
  // screen UI under the keyed hand layer
  c.save(); c.beginPath(); c.roundRect(X, Y, SW, SH, 18); c.clip();
  c.fillStyle = "#F3F0EA"; c.fillRect(X, Y, SW, SH);
  const scr = -SH * .55 * ioC(win(t, 37.9, .45));      // finger swipes up after the click
  c.translate(0, scr);
  c.fillStyle = COL.red; c.fillRect(X, Y, SW, SH * .34);
  setFont(c, { w: 900, size: 38 }); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("AAPKA BRAND", X + SW / 2, Y + SH * .12);
  setFont(c, { w: 700, size: 21 }); c.fillText("Branding • Social • Web", X + SW / 2, Y + SH * .2);
  disc(c, X + SW / 2, Y + SH * .34, 44, "#fff"); disc(c, X + SW / 2, Y + SH * .34, 32, COL.ink);
  for (let i = 0; i < 3; i++) { c.fillStyle = "#d8d3ca"; c.fillRect(X + SW * .15, Y + SH * (.47 + i * .05), SW * (.7 - i * .12), 12); }
  for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? "#d8d3ca" : "#e4ded4"; c.beginPath(); c.roundRect(X + SW * .1, Y + SH * (.98 + i * .16), SW * .8, SH * .13, 14); c.fill(); }
  const tapT = 37.5, tp = win(t, tapT - .08, .14), rel = win(t, tapT + .2, .25);
  const bs = 1 - .09 * tp + .09 * rel, BY = Y + SH * .86;
  c.save(); c.translate(X + SW / 2, BY); c.scale(bs, bs);
  c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 14; c.shadowOffsetY = 6;
  c.fillStyle = t > tapT ? COL.ink : COL.red; c.beginPath(); c.roundRect(-SW * .42, -46, SW * .84, 92, 46); c.fill(); c.shadowColor = "transparent";
  setFont(c, { w: 900, size: 27 }); c.fillStyle = "#fff"; c.fillText("BAAT KAREIN →", 0, 2); c.restore();
  const rp = win(t, tapT, .5); if (rp > 0 && rp < 1) { c.strokeStyle = `rgba(215,31,38,${1 - rp})`; c.lineWidth = 8; c.beginPath(); c.arc(X + SW / 2, BY, 30 + rp * 220, 0, 7); c.stroke(); }
  c.restore();
  // keyed hand + phone (bezel) on top
  c.save(); c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 30; c.shadowOffsetY = 16; c.filter = "grayscale(1) contrast(1.1) brightness(1.05)";
  c.drawImage(im, 0, 0, 1280, 720, ox, oy + yo, 1280 * S2, 720 * S2); c.restore();
  // bouncing chevrons -> platform button below the video
  const ch = win(t, 37.9, .4);
  if (ch > 0) for (let i = 0; i < 2; i++) { c.save(); c.globalAlpha = ch * (1 - i * .35); arrowDown(c, 900, 1500 + i * 46 + Math.sin(t * 9) * 12, 1.2, "#fff"); c.restore(); }
};

// 14 ── "Baat karte hain!"
S.end = (c, t, a) => {
  const lt = t - a; paper(c);
  disc(c, 540, 1260, 430, COL.red, oB(win(lt, -.05, .5), 1.4));
  gridPatch(c, 690, 820, 300, 300, 6, 32, win(lt, .1, .4));
  corners(c, t, a);
  const im = frame("caller", a, t), bb = TRACK.caller.bbox;
  const s = 1.36, sx = bb[0], sy = bb[1], sw = bb[2] - bb[0], sh = 720 - bb[1];
  const e = oC(win(lt, -.05, .55));
  cutout(c, im, [sx, sy, sw, sh], [540 - (760 - sx) * s, H - sh * s + (1 - e) * 500 + 4, sw * s, sh * s], { outline: 14 });
  line(c, [["Branding", 38.9], ["•", 38.9], ["Social", 38.9], ["•", 38.9], ["Website", 38.9], ["•", 38.9], ["Ads", 38.9]], 540, 225, { size: 34, w: 700, align: "center", dur: .5, colors: [COL.ink, COL.red, COL.ink, COL.red, COL.ink, COL.red, COL.ink] }, t);
  line(c, [["BAAT", 38.86], ["KARTE", 39.14]], 540, 460, { size: 196, w: 400, fam: "Anton", ls: 4, align: "center" }, t);
  const hb = line(c, [["HAIN!", 39.45]], 540, 720, { size: 270, w: 400, fam: "Anton", ls: 6, align: "center", color: COL.red }, t);
  hbar(c, hb, win(t, 39.6, .35), COL.beige, { hf: .12, yf: .9 });
  line(c, [["HAIN!", 39.45]], 540, 720, { size: 270, w: 400, fam: "Anton", ls: 6, align: "center", color: COL.red }, t);
  // CTA button
  const bp = win(t, 39.85, .5);
  if (bp > 0) {
    const pulse = 1 + Math.max(0, Math.sin((t - 40.3) * 5)) * .04 * (t > 40.3 ? 1 : 0);
    c.save(); c.translate(540, 1690); const k = oB(bp, 2.2) * pulse; c.scale(k, k);
    c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
    c.fillStyle = "#fff"; c.beginPath(); c.roundRect(-370, -82, 740, 164, 82); c.fill(); c.shadowColor = "transparent";
    c.fillStyle = COL.ink; c.beginPath(); c.roundRect(-356, -68, 712, 136, 68); c.fill();
    setFont(c, { w: 900, size: 52, ls: 1 }); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ABHI CLICK KAREIN", -30, 4);
    arrowDown(c, 280, 4 + Math.sin(t * 8) * 6, .9, COL.red); c.restore();
  }
};

// ============================================================ timeline ==
const SCENES = [
  ["hook", 0, 2.75], ["shop", 2.75, 5.15], ["socho", 5.15, 6.3], ["empty", 6.3, 9.75], ["net", 9.75, 13.4],
  ["water", 13.4, 17.3], ["channels", 17.3, 21.2], ["brand", 21.2, 24.75], ["social", 24.75, 26.95],
  ["convert", 26.95, 30.75], ["strategy", 30.75, 33.55], ["both", 33.55, 36.4], ["cta", 36.4, 38.7], ["end", 38.7, DURATION],
];
// transition at the start of scene i (i>=1)
const TRANS = [null, ["tear", .5], ["flash", .22], ["whip", .4], ["zoom", .45], ["wave", .6], ["bars", .5], ["iris", .55],
  ["whipUp", .4], ["tear2", .5], ["slices", .5], ["zoom", .45], ["iris", .55], ["flash", .22]];

function drawScene(i, c, t) { const [id, a] = SCENES[i]; c.imageSmoothingQuality = "high"; c.save(); S[id](c, t, a); c.restore(); }

const TR = {
  tear(c, A, B, p, flip) {
    c.drawImage(B, 0, 0);
    const e = ioC(p), x0 = lerp(W + 260, -260, e), R = rnd(77);
    const pts = []; for (let y = -40; y <= H + 40; y += 26) pts.push([x0 + (y - H / 2) * .18 + (R() - .5) * 26, y]);
    const keep = flip ? pts.map(([x, y]) => [W - x, y]) : pts;
    c.save(); c.beginPath(); c.moveTo(flip ? W + 300 : -300, -40); keep.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(flip ? W + 300 : -300, H + 40); c.closePath();
    c.save(); c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 40; c.fillStyle = "#fff"; c.fill(); c.restore();
    c.clip(); c.drawImage(A, 0, 0); c.restore();
    c.save(); c.strokeStyle = "#f7f5f0"; c.lineWidth = 16; c.lineJoin = "round"; c.beginPath(); keep.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore();
  },
  tear2(c, A, B, p) { TR.tear(c, A, B, p, true); },
  flash(c, A, B, p) {
    if (p < .5) c.drawImage(A, 0, 0);
    else { const k = lerp(1.1, 1, oC((p - .5) * 2)); c.save(); c.translate(W / 2, H / 2); c.scale(k, k); c.drawImage(B, -W / 2, -H / 2); c.restore(); }
    c.fillStyle = `rgba(255,255,255,${Math.pow(1 - Math.abs(p - .5) * 2, 2) * .9})`; c.fillRect(0, 0, W, H);
  },
  whip(c, A, B, p, vert) {
    const e = ioC(p), n = 6;
    for (let k = 0; k < n; k++) {
      const q = clamp(e - k * .025), off = q * (vert ? H : W);
      c.globalAlpha = k === 0 ? 1 : .22;
      if (vert) { c.drawImage(A, 0, -off); c.drawImage(B, 0, H - off); } else { c.drawImage(A, -off, 0); c.drawImage(B, W - off, 0); }
    }
    c.globalAlpha = 1;
  },
  whipUp(c, A, B, p) { TR.whip(c, A, B, p, true); },
  zoom(c, A, B, p) {
    const e = ioC(p);
    if (p < .5) { const k = 1 + e * 1.2; c.save(); c.translate(W / 2, H / 2); c.scale(k, k); c.filter = `blur(${e * 14}px)`; c.drawImage(A, -W / 2, -H / 2); c.restore(); }
    else { const k = lerp(.7, 1, oC((p - .5) * 2)); c.drawImage(A, 0, 0); c.fillStyle = COL.paper; c.fillRect(0, 0, W, H);
      c.save(); c.translate(W / 2, H / 2); c.scale(k, k); c.filter = `blur(${(1 - e) * 14}px)`; c.drawImage(B, -W / 2, -H / 2); c.restore(); }
    c.fillStyle = `rgba(236,233,227,${Math.pow(1 - Math.abs(p - .5) * 2, 3) * .8})`; c.fillRect(0, 0, W, H);
  },
  wave(c, A, B, p) {
    c.drawImage(A, 0, 0);
    const e = ioC(p), base = lerp(H + 160, -200, e);
    const path = (amp, ph, dy) => { c.beginPath(); c.moveTo(0, H + 10); for (let x = 0; x <= W; x += 20) c.lineTo(x, base + dy + Math.sin(x * .011 + p * 9 + ph) * amp + Math.sin(x * .027 + ph) * amp * .4); c.lineTo(W, H + 10); c.closePath(); };
    c.save(); path(40, 2, -60); c.fillStyle = "rgba(20,20,20,.85)"; c.fill(); c.restore();
    c.save(); path(46, 0, 0); c.clip(); c.drawImage(B, 0, 0); c.restore();
    c.save(); c.strokeStyle = "#fff"; c.lineWidth = 10; path(46, 0, 0); c.stroke(); c.restore();
  },
  bars(c, A, B, p) {
    const n = 5, bw = W / n, cols = [COL.red, COL.ink, COL.red, COL.beige, COL.ink];
    c.drawImage(p < .5 ? A : B, 0, 0);
    for (let i = 0; i < n; i++) {
      const q = clamp(p * 1.6 - i * .12);
      let y0, y1;
      if (q < .5) { const e = ioC(q * 2); y0 = H * (1 - e); y1 = H; } else { const e = ioC((q - .5) * 2); y0 = 0; y1 = H * (1 - e); }
      if (q <= 0 || q >= 1) { if (q <= 0 && p >= .5) continue; if (q <= 0) continue; continue; }
      c.fillStyle = cols[i]; c.fillRect(i * bw - 1, y0, bw + 2, y1 - y0);
    }
  },
  iris(c, A, B, p) {
    const R = Math.hypot(W, H) * .6;
    if (p < .5) { c.drawImage(A, 0, 0); const e = ioC(p * 2); disc(c, W / 2, H / 2, R * e, COL.red); }
    else { const e = ioC((p - .5) * 2); c.fillStyle = COL.red; c.fillRect(0, 0, W, H);
      c.save(); c.beginPath(); c.arc(W / 2, H / 2, R * e, 0, 7); c.clip(); c.drawImage(B, 0, 0); c.restore();
      c.strokeStyle = "#fff"; c.lineWidth = 14 * (1 - e); c.beginPath(); c.arc(W / 2, H / 2, R * e, 0, 7); c.stroke(); }
  },
  slices(c, A, B, p) {
    c.drawImage(A, 0, 0); const n = 8, sh = H / n;
    for (let i = 0; i < n; i++) {
      const q = oQ(clamp(p * 1.7 - i * .09)), dir = i % 2 ? 1 : -1, off = (1 - q) * W * dir;
      if (q <= 0) continue;
      c.drawImage(B, 0, i * sh, W, sh + 1, off, i * sh, W, sh + 1);
      c.fillStyle = COL.red; c.fillRect(off + (dir > 0 ? -14 : W), i * sh, 14, sh + 1);
    }
  },
};

function compose(t) {
  FRAME++;
  let i = SCENES.findIndex(([, a, b]) => t >= a && t < b); if (i < 0) i = SCENES.length - 1;
  // inside a transition window?
  let tr = null;
  for (let j = 1; j < SCENES.length; j++) {
    const at = SCENES[j][1], d = TRANS[j][1];
    if (t >= at - d / 2 && t < at + d / 2) { tr = { j, p: (t - (at - d / 2)) / d, type: TRANS[j][0] }; break; }
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = "none"; ctx.globalAlpha = 1;
  if (tr) {
    const ca = bufA.getContext("2d"), cb = bufB.getContext("2d");
    ca.setTransform(1, 0, 0, 1, 0, 0); cb.setTransform(1, 0, 0, 1, 0, 0);
    drawScene(tr.j - 1, ca, t); drawScene(tr.j, cb, t);
    TR[tr.type](ctx, bufA, bufB, clamp(tr.p));
  } else drawScene(i, ctx, t);
  ctx.restore();
  // unify: paper multiply + film grain + soft vignette
  ctx.save();
  if (PAPER) { ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = .22; ctx.drawImage(PAPER, 0, 0); }
  ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = .085;
  const g = GRAIN[FRAME % GRAIN.length];
  if (g) { const R = rnd(Math.floor(t * 30) + 3), ox = -R() * 512, oy = -R() * 512; for (let y = oy; y < H; y += 512) for (let x = ox; x < W; x += 512) ctx.drawImage(g, x, y); }
  ctx.globalAlpha = 1;
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.16)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // end fade
  const fo = win(t, DURATION - .35, .35); if (fo > 0) { ctx.fillStyle = `rgba(236,233,227,${fo})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

window.renderAt = async function (t) {
  compose(t);
  for (let k = 0; k < 3 && missing.size; k++) { await loadMissing(); compose(t); }
  return true;
};
window.ready = (async () => {
  MAN = await (await fetch("build/frames/manifest.json")).json();
  TRACK = await (await fetch("build/frames/track.json")).json();
  const li = u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; });
  PAPER = await li("assets/img/paper.jpg");
  GRAIN = await Promise.all([0, 1, 2, 3].map(i => li(`assets/img/grain${i}.png`)));
  await Promise.all(["900 80px Poppins", "800 80px Poppins", "700 80px Poppins", "600 80px Poppins", "400 80px Anton", "400 80px Marker"].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  return true;
})();
window.SCENES = SCENES; window.DURATION = DURATION;

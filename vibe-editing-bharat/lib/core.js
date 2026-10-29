// Shared helpers: timing curves, assets, footage frames, and the design system's
// building blocks (sky, grain, rope, pegs, prints, pills, labels, captions).
(function () {
const W = 1080, H = 1920, FPS = 30;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const win = (a, b, t) => clamp((t - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const ss = (a, b, t) => smooth(win(a, b, t));
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const inCubic = (x) => x * x * x;
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outQuint = (x) => 1 - Math.pow(1 - x, 5);
const outBack = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
// Apple-like ease: fast start, long soft landing.
const apple = (x) => { x = clamp(x); return 1 - Math.pow(1 - x, 4); };
const spring = (t, at, dur = 0.7) => {
  const x = win(at, at + dur, t);
  return x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(7.5 * x);
};
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }

// ------------------------------------------------------------------ colour --
const C = {
  sky: "#3f8fd8", lime: "#d4f23c", magenta: "#e0245e", ink: "#0b0b0c", paper: "#fbfaf6",
  wood: "#c99a52", grass: "#5f9a3c", yellow: "#e2b521", red: "#d8432f", blue: "#6f9fcf", navy: "#3b4a78",
  cream: "#efe6cf",
};

// ------------------------------------------------------------------- fonts --
const FAM = { hi: "Baloo2", mr: "Baloo2", bn: "BalooDa2", ta: "BalooThambi2", te: "BalooTammudu2", gu: "BalooBhai2",
  pa: "BalooPaaji2", kn: "BalooTamma2", ml: "BalooChettan2", or: "BalooBhaina2", en: "InterL" };
const F = {
  lang: (lang, px, w = 800) => `${w} ${px}px ${FAM[lang] || "InterL"}`,
  title: (px, w = 900) => `${w} ${px}px ArchX${w === 900 ? 9 : ""}`,
  ui: (px, w = 600) => `${w} ${px}px InterL`,
  hand: (px) => `600 ${px}px Caveat`,
};

// ------------------------------------------------------------------ assets --
const IMG = {};                     // static images by name
const CACHE = new Map();            // footage frames: src -> Image (LRU)
const PENDING = new Map();
let REQ = null;                     // Set of srcs requested during a collect pass
function loadImg(src) {
  if (CACHE.has(src)) return Promise.resolve(CACHE.get(src));
  if (PENDING.has(src)) return PENDING.get(src);
  const p = new Promise((ok) => {
    const i = new Image();
    i.onload = () => { CACHE.set(src, i); PENDING.delete(src); trim(); ok(i); };
    i.onerror = () => { PENDING.delete(src); ok(null); };
    i.src = src;
  });
  PENDING.set(src, p); return p;
}
function trim() {
  while (CACHE.size > 260) CACHE.delete(CACHE.keys().next().value);
}
function need(src) {
  const i = CACHE.get(src);
  if (i) { CACHE.delete(src); CACHE.set(src, i); return i; }
  if (REQ) REQ.add(src);
  return null;
}
// Runs draw() once to collect the frames it needs, loads them, then draws for real.
async function withFrames(draw) {
  REQ = new Set(); draw(); const want = [...REQ]; REQ = null;
  if (want.length) { await Promise.all(want.map(loadImg)); draw(); }
}

// Footage: build/frames/<clip>/0001.jpg … (30 fps), meta in window.FOOT
// Shots with no usable video are real 4K photos (IMG.ph_<name>), moved with a slow camera.
const isPhoto = (name) => !!IMG["ph_" + name];
function clipFrame(name, t, mode = "hold") {
  if (isPhoto(name)) return IMG["ph_" + name];
  const m = window.FOOT[name];
  if (!m) return null;
  let f = Math.floor(t * FPS);
  if (mode === "loop") f = ((f % m.n) + m.n) % m.n;
  else f = clamp(f, 0, m.n - 1);
  return need(`build/frames/${name}/${String(f + 1).padStart(4, "0")}.jpg`);
}
const clipDur = (name) => (window.FOOT[name] ? window.FOOT[name].n / FPS : 1);

// Draw an image so it covers (x,y,w,h). fx,fy = focus point, z = extra zoom.
function cover(c, im, x, y, w, h, fx = 0.5, fy = 0.5, z = 1) {
  if (!im) return;
  const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  const s = Math.max(w / iw, h / ih) * z;
  const sw = w / s, sh = h / s;
  const sx = clamp((iw - sw) * fx, 0, iw - sw), sy = clamp((ih - sh) * fy, 0, ih - sh);
  c.drawImage(im, sx, sy, sw, sh, x, y, w, h);
}
// A clip frame covering a rect, with optional frame blending for motion blur.
function footage(c, name, t, x, y, w, h, o = {}) {
  const im = clipFrame(name, t, o.mode);
  if (!im) { c.fillStyle = "#9db7cf"; c.fillRect(x, y, w, h); return; }
  c.save();
  if (o.filter) c.filter = o.filter;
  if (isPhoto(name)) {                            // slow push-in with a gentle drift
    const k = Math.max(0, t);
    cover(c, im, x, y, w, h, clamp((o.fx ?? 0.5) + 0.006 * k), o.fy ?? 0.5, (o.z ?? 1) * (1.03 + 0.014 * k));
    c.restore(); return;
  }
  cover(c, im, x, y, w, h, o.fx ?? 0.5, o.fy ?? 0.5, o.z ?? 1);
  if (o.blur) {                                   // smear the previous frames on fast moves
    for (let k = 1; k <= 2; k++) {
      const p = clipFrame(name, t - k * o.blur / FPS, o.mode);
      if (p) { c.globalAlpha = 0.33 / k; cover(c, p, x, y, w, h, o.fx ?? 0.5, o.fy ?? 0.5, o.z ?? 1); }
    }
  }
  c.restore();
}

// --------------------------------------------------------------- the world --
// Sky: real cloud footage, looped with a crossfade at the seam.
function sky(c, gt, o = {}) {
  const m = window.FOOT.sky;
  const z = o.z ?? 1.08, dy = o.dy ?? 0, dx = o.dx ?? 0;
  const speed = o.speed ?? 0.6;
  const n = m.n / FPS, xf = 1.2, per = n - xf;
  const u = (gt * speed) % per;
  const draw = (tt, a) => {
    const im = clipFrame("sky", tt);
    if (!im) return;
    c.save(); c.globalAlpha = a; c.filter = "brightness(1.16) saturate(1.08) hue-rotate(-7deg) contrast(0.96)";
    const iw = im.naturalWidth, ih = im.naturalHeight;
    const s = Math.max(W / iw, H / ih) * z;
    c.drawImage(im, (W - iw * s) / 2 + dx, (H - ih * s) / 2 + dy, iw * s, ih * s);
    c.restore();
  };
  c.fillStyle = C.sky; c.fillRect(0, 0, W, H);
  draw(u, 1);
  if (u < xf) draw(u + per, 1 - u / xf);              // the previous loop's tail fades out over the new start
  // poster-bright: lift the blues toward the references' cerulean
  c.save(); c.globalCompositeOperation = "soft-light"; c.globalAlpha = 0.5;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#5aa9f0"); g.addColorStop(1, "#bfe3ff");
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}

const GRAIN = [];
function makeGrain() {
  const r = rnd(7);
  for (let k = 0; k < 6; k++) {
    const g = document.createElement("canvas"); g.width = W / 2; g.height = H / 2;
    const x = g.getContext("2d"), d = x.createImageData(g.width, g.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (r() + r() + r() - 1.5) * 70;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0); GRAIN.push(g);
  }
}
function grain(c, gt, a = 0.32) {
  c.save(); c.globalCompositeOperation = "overlay"; c.globalAlpha = a;
  c.drawImage(GRAIN[Math.floor(gt * FPS) % GRAIN.length], 0, 0, W, H);
  c.restore();
  // soft vignette, like a printed poster
  c.save();
  const g = c.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H * 0.5, H * 0.78);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(10,20,40,.22)");
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}

// Grass hill: the real grass photo below a curved horizon.
function grass(c, top, o = {}) {
  const im = IMG.grass;
  c.save();
  c.beginPath();
  const bulge = o.bulge ?? 0, tilt = o.tilt ?? 0;
  c.moveTo(-10, top + tilt);
  c.quadraticCurveTo(W / 2, top - bulge, W + 10, top - tilt);
  c.lineTo(W + 10, H + 10); c.lineTo(-10, H + 10); c.closePath();
  c.clip();
  if (im) {
    const sy = im.naturalHeight * 0.74, sh = im.naturalHeight - sy;     // below the hill crest: all grass
    const dh = H - (top - bulge), sc = Math.max(W / im.naturalWidth, dh / sh) * (o.z ?? 1);
    const sw = W / sc;
    c.drawImage(im, (im.naturalWidth - sw) / 2, sy, sw, Math.min(sh, dh / sc), 0, top - bulge, W, Math.min(sh * sc, dh));
  } else { c.fillStyle = C.grass; c.fillRect(0, 0, W, H); }
  // atmospheric haze at the horizon
  const g = c.createLinearGradient(0, top - bulge, 0, top + 160);
  g.addColorStop(0, "rgba(200,225,240,.55)"); g.addColorStop(1, "rgba(200,225,240,0)");
  c.fillStyle = g; c.fillRect(0, top - bulge - 10, W, 200);
  c.restore();
}

// ------------------------------------------------------------ rope & pegs --
// A rope is a quadratic sag between two points. at(u) gives the point and slope.
function rope(x1, y1, x2, y2, sag = 40) {
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 + sag * 2;
  const at = (u) => {
    const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u;
    const x = a * x1 + b * cx + d * x2, y = a * y1 + b * cy + d * y2;
    const tx = 2 * (1 - u) * (cx - x1) + 2 * u * (x2 - cx), ty = 2 * (1 - u) * (cy - y1) + 2 * u * (y2 - cy);
    return { x, y, ang: Math.atan2(ty, tx) };
  };
  // u for a given x (ropes here are never vertical)
  const atX = (x) => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; (at(m).x < x) ? lo = m : hi = m; } return at((lo + hi) / 2); };
  return { x1, y1, x2, y2, sag, at, atX };
}
function drawRope(c, R, thick = 16, upto = 1) {
  const im = IMG.cut_rope;
  const N = 64;
  c.save();
  c.shadowColor = "rgba(20,40,80,.28)"; c.shadowBlur = thick * 0.8; c.shadowOffsetY = thick * 0.6;
  if (im) {
    const sh = im.naturalHeight, sw = sh * (thick * 1.0 / thick);      // texture units
    let sx = 0;
    for (let i = 0; i < N * upto; i++) {
      const p = R.at(i / N), q = R.at(Math.min(1, (i + 1) / N));
      const len = Math.hypot(q.x - p.x, q.y - p.y) + 1.5;
      const srcW = len / thick * sh;
      c.save(); c.translate(p.x, p.y); c.rotate(p.ang);
      const s0 = sx % (im.naturalWidth - srcW - 1);
      c.drawImage(im, s0, 0, srcW, sh, 0, -thick / 2, len, thick);
      c.restore(); sx += srcW;
    }
  } else {
    c.strokeStyle = "#cdb08a"; c.lineWidth = thick; c.lineCap = "round";
    c.beginPath(); for (let i = 0; i <= N * upto; i++) { const p = R.at(i / N); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); } c.stroke();
  }
  c.restore();
}
// Clothespin: drawn hanging from a rope point; (x,y) is where it bites the rope.
function peg(c, x, y, rot = 0, s = 1, which = 0) {
  const im = IMG[which % 2 ? "peg_2" : "peg_1"] || IMG.peg_1;
  const h = 230 * s;
  c.save(); c.translate(x, y); c.rotate(rot);
  c.shadowColor = "rgba(30,40,70,.38)"; c.shadowBlur = 14 * s; c.shadowOffsetX = 7 * s; c.shadowOffsetY = 11 * s;
  if (im) {
    const w = h * im.naturalWidth / im.naturalHeight;
    c.drawImage(im, -w / 2, -h * 0.66, w, h);
  } else {
    c.fillStyle = C.wood; rr(c, -18 * s, -h * 0.66, 36 * s, h, 6 * s); c.fill();
  }
  c.restore();
}

// ------------------------------------------------------------------ prints --
// A photo print hanging from pegs. body(c, w, h) paints the picture area.
function print(c, x, y, w, h, rot, body, o = {}) {
  const b = o.border ?? 16, bb = o.bottom ?? b;
  c.save(); c.translate(x, y); c.rotate(rot);
  c.save();
  c.shadowColor = "rgba(20,35,70,.35)"; c.shadowBlur = 40; c.shadowOffsetY = 22; c.shadowOffsetX = 8;
  c.fillStyle = o.paper || C.paper; rr(c, -w / 2 - b, -h / 2 - b, w + 2 * b, h + b + bb, o.radius ?? 6); c.fill();
  c.restore();
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); c.translate(-w / 2, -h / 2);
  body(c, w, h); c.restore();
  if (o.label) {
    c.font = o.labelFont || F.hand(44); c.fillStyle = o.labelColor || C.ink; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(o.label, 0, h / 2 + bb / 2);
  }
  c.restore();
}

// --------------------------------------------------------------- type bits --
function pill(c, x, y, text, font, o = {}) {
  c.save();
  c.font = font;
  const m = c.measureText(text);
  const padX = o.padX ?? 34, hgt = o.h ?? 96;
  const w = m.width + padX * 2;
  const ax = o.align === "left" ? x : o.align === "right" ? x - w : x - w / 2;
  c.translate(ax + w / 2, y); c.rotate(o.rot || 0); c.scale(o.s ?? 1, o.s ?? 1);
  c.shadowColor = "rgba(20,35,70,.22)"; c.shadowBlur = 24; c.shadowOffsetY = 10;
  c.fillStyle = o.bg || "#fff"; rr(c, -w / 2, -hgt / 2, w, hgt, hgt / 2); c.fill();
  c.shadowColor = "transparent";
  c.fillStyle = o.color || C.ink; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(text, 0, (o.dy ?? 4));
  c.restore();
  return w;
}
function label(c, x, y, text, px = 30, color = C.lime, align = "left", font) {
  c.save(); c.font = font || F.ui(px, 600); c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  c.shadowColor = "rgba(10,30,70,.25)"; c.shadowBlur = 8;
  c.fillText(text, x, y); c.restore();
}
// The reference posters' tiny stacked labels: "Record-\nthe beauty"
function microLabel(c, x, y, a, b, px = 30, color = C.lime) {
  label(c, x, y, a, px, color); label(c, x, y + px * 1.25, b, px, color);
}

// Word-by-word caption for a voice line. Words light up as they are spoken.
// Splitting on spaces keeps each word's script shaping intact.
function words(v) {
  const out = []; let cur = null;
  [...v.text].forEach((ch, i) => {
    if (ch === " ") { cur = null; return; }
    if (!cur) { cur = { s: "", t0: v.t0[Math.min(i, v.t0.length - 1)] }; out.push(cur); }
    cur.s += ch;
  });
  return out;
}
// Lay the words out in lines that fit maxW; returns [{s,x,y,t0}]
function layoutWords(c, ws, font, maxW, lh) {
  c.font = font;
  const sp = c.measureText(" ").width;
  const lines = [[]]; let lw = 0;
  for (const w of ws) {
    const ww = c.measureText(w.s).width;
    if (lines[lines.length - 1].length && lw + sp + ww > maxW) { lines.push([]); lw = 0; }
    const L = lines[lines.length - 1];
    lw += (L.length ? sp : 0) + ww; L.push({ ...w, w: ww });
  }
  const out = [];
  lines.forEach((L, li) => {
    const tot = L.reduce((a, w) => a + w.w, 0) + sp * (L.length - 1);
    let x = -tot / 2;
    for (const w of L) { out.push({ ...w, x: x + w.w / 2, y: li * lh }); x += w.w + sp; }
  });
  return { items: out, lines: lines.length, width: Math.max(...lines.map((L) => L.reduce((a, w) => a + w.w, 0) + sp * (L.length - 1))) };
}
// Speech bubble for a voice line: white card, native script, words lighting up,
// English translation underneath in lime. vt = time since the voice started.
function voiceBubble(c, v, vt, x, y, o = {}) {
  const px = o.px ?? 64, font = F.lang(v.lang, px, 700), lh = px * 1.32;
  const L = layoutWords(c, words(v), font, o.maxW ?? 860, lh);
  const padX = 46, padY = 34;
  const w = L.width + padX * 2, h = L.lines * lh + padY * 2 - (lh - px * 1.05);
  const e = spring(vt, -0.25, 0.65), out = 1 - ss(v.dur + (o.hold ?? 2.2), v.dur + (o.hold ?? 2.2) + 0.35, vt);
  if (e <= 0 || out <= 0) return;
  c.save(); c.translate(x, y); c.rotate((o.rot ?? -1.5) * Math.PI / 180); c.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e);
  c.globalAlpha = clamp(e * 1.6) * out;
  c.shadowColor = "rgba(20,35,70,.25)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = "#fff"; rr(c, -w / 2, -padY - px * 0.62, w, h, 46); c.fill();
  // little tail, like a chat bubble
  c.beginPath(); c.moveTo(-w / 2 + 70, -padY - px * 0.62 + h - 2); c.lineTo(-w / 2 + 52, -padY - px * 0.62 + h + 30); c.lineTo(-w / 2 + 112, -padY - px * 0.62 + h - 2); c.fill();
  c.shadowColor = "transparent";
  c.font = font; c.textAlign = "center"; c.textBaseline = "middle";
  for (const it of L.items) {
    const on = vt >= it.t0 - 0.04;
    const k = spring(vt, it.t0 - 0.06, 0.35);
    c.fillStyle = on ? C.ink : "rgba(11,11,12,.22)";
    c.save(); c.translate(it.x, it.y - (on ? (1 - k) * 10 : 0)); c.fillText(it.s, 0, 0); c.restore();
  }
  c.restore();
  if (v.en && o.en !== false) {
    const a = clamp(e * 1.6) * out * ss(0.2, 0.7, vt);
    c.save(); c.globalAlpha = a;
    c.font = F.ui(31, 700);
    const lines = layoutWords(c, ("“" + v.en + "”").split(" ").map((s) => ({ s, t0: 0 })), F.ui(31, 700), Math.min(980, Math.max(560, w)), 40);
    let ly = y - padY - px * 0.62 + h + 72;
    const rows = {}; lines.items.forEach((it) => (rows[it.y] = rows[it.y] || []).push(it.s));
    Object.keys(rows).forEach((k) => label(c, clamp(x - w / 2 + 30, 40, 9999), ly + +k, rows[k].join(" "), 31, C.lime, "left", F.ui(31, 700)));
    c.restore();
  }
}

window.U = { W, H, FPS, clamp, lerp, win, smooth, ss, outCubic, inCubic, inOut, outQuint, outBack, apple, spring, rnd, rr,
  C, F, FAM, IMG, isPhoto, loadImg, need, withFrames, clipFrame, clipDur, cover, footage, sky, makeGrain, grain, grass,
  rope, drawRope, peg, print, pill, label, microLabel, words, layoutWords, voiceBubble };
})();

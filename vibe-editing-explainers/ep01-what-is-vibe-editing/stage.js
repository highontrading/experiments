// EP 01 · What is vibe editing?
// The whole film is renderAt(t): a green cutting mat, real desk objects, real footage
// in cards, and label blocks, filmed by one camera that glides from board to board.
(function () {
const TL = window.TL, A = window.ASSETS, CUE = TL.cue;
const W = TL.w, H = TL.h;
const cv = document.getElementById("c");
const c = cv.getContext("2d");

// ------------------------------------------------------------------ palette --
const COL = {
  mat: "#4c8a3f", matDeep: "#3f7835", grid: "rgba(226,236,170,0.55)", gridSoft: "rgba(226,236,170,0.10)",
  brown: "#6b4628", yellow: "#ffe600", white: "#ffffff", ink: "#3d2716", red: "#ff0000",
  cream: "#fffbea", dark: "#1d1b17",
};

// ------------------------------------------------------------------ easing --
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const win = (a, b, t) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const outQuint = (x) => 1 - Math.pow(1 - x, 5);
const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const inOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const inOutQuint = (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2);
const inCubic = (x) => x * x * x;
// a soft spring: settles in ~0.6 s with one gentle overshoot
const spring = (x, k = 1) => (x <= 0 ? 0 : 1 - Math.exp(-7 * x / k) * Math.cos(9.5 * x / k));
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ------------------------------------------------------------------ images --
const imgCache = new Map();
let pending = [];
function img(src) {
  let e = imgCache.get(src);
  if (!e) {
    e = { im: new Image(), ok: false };
    e.p = new Promise((res) => { e.im.onload = () => { e.ok = true; res(); }; e.im.onerror = () => res(); });
    e.im.src = src;
    imgCache.set(src, e);
  }
  if (!e.ok) pending.push(e.p);
  return e.ok ? e.im : null;
}
function footage(name, lt, speed = 1, loop = false) {
  const n = A.footage[name];
  let i = Math.floor(Math.max(0, lt) * 30 * speed);
  i = loop ? i % n : Math.min(n - 1, i);
  return img(`../assets/footage/${name}/f${String(i + 1).padStart(4, "0")}.jpg`);
}

// ------------------------------------------------------------------ textures --
function makeCanvas(w, h) { const k = document.createElement("canvas"); k.width = w; k.height = h; return k; }
// Mat texture: soft mottling + fine speckle, the way a worn self-healing mat looks.
const MAT = makeCanvas(1024, 1024);
(function () {
  const g = MAT.getContext("2d"), r = rnd(11);
  g.fillStyle = COL.mat; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) {
    const x = r() * 1024, y = r() * 1024, rad = 30 + r() * 140;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() < 0.5;
    gr.addColorStop(0, dark ? "rgba(30,70,25,0.05)" : "rgba(140,190,110,0.04)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    for (const dx of [-1024, 0, 1024]) for (const dy of [-1024, 0, 1024]) {
      g.save(); g.translate(dx, dy); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore();
    }
  }
  const id = g.getImageData(0, 0, 1024, 1024), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 16; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  // knife scratches
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = r() * 1024, y = r() * 1024, a = r() * Math.PI, l = 20 + r() * 90;
    g.strokeStyle = `rgba(${r() < 0.5 ? "20,50,20" : "190,220,160"},${0.08 + r() * 0.1})`; g.lineWidth = 0.8 + r();
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
})();
let matPattern = null;
const GRAIN = Array.from({ length: 6 }, (_, k) => {
  const g = makeCanvas(540, 960), x = g.getContext("2d"), id = x.createImageData(540, 960), r = rnd(100 + k);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - 0.5) * 70; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0); return g;
});

// ------------------------------------------------------------------ camera --
// Board centres on the mat (world px). The camera glides between them.
const B = {
  hook: [0, 0], title: [1180, -260], past: [1240, 2050], flip: [-20, 2350],
  how: [-60, 4650], scale: [1240, 4520], role: [1300, 6820], outro: [40, 6950],
};
const ORDER = ["hook", "title", "past", "flip", "how", "scale", "role", "outro"];
const START = { hook: 0, title: CUE.s_title, past: CUE.s_past, flip: CUE.s_flip, how: CUE.s_how,
  scale: CUE.s_scale, role: CUE.s_role, outro: CUE.s_outro };
const TRANS = 1.0;   // glide length in seconds
function camera(t) {
  let i = 0;
  while (i < ORDER.length - 1 && t >= START[ORDER[i + 1]] - 0.35) i++;
  const k = ORDER[i], t0 = START[k] - 0.35;
  const breathe = (b, tt) => 1 + 0.035 * outCubic(win(START[b], START[b] + 9, tt));  // slow push-in on every board
  if (i > 0 && t < t0 + TRANS) {
    const prev = ORDER[i - 1], p = (t - t0) / TRANS, e = inOutQuint(p);
    const a = B[prev], b = B[k];
    const z0 = breathe(prev, t0), dip = Math.sin(Math.PI * p);
    return { x: lerp(a[0], b[0], e), y: lerp(a[1], b[1], e), z: lerp(z0, 1, e) * (1 - 0.2 * dip),
      r: (i % 2 ? 1 : -1) * 0.035 * dip, moving: p > 0.04 && p < 0.96, speed: dip };
  }
  // intro: settle down onto the mat
  const intro = 1 - outQuint(win(0, 1.6, t));
  return { x: B[k][0], y: B[k][1] - 60 * intro, z: breathe(k, t) + 0.16 * intro, r: -0.03 * intro, moving: t < 0.9, speed: intro };
}

// ------------------------------------------------------------------ primitives --
function shadow(g, blur = 26, oy = 14, a = 0.32) { g.shadowColor = `rgba(18,30,10,${a})`; g.shadowBlur = blur; g.shadowOffsetY = oy; g.shadowOffsetX = oy * 0.35; }
function noShadow(g) { g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetX = g.shadowOffsetY = 0; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function font(g, size, weight = 800, fam = "Poppins") { g.font = `${weight} ${size}px ${fam}`; }

// A label block: a slab of colored paper with one word on it, laid down like tape.
function block(g, o, t) {
  const p = win(o.at, o.at + 0.55, t);
  if (p <= 0) return;
  const out = o.out != null ? win(o.out, o.out + 0.35, t) : 0;
  if (out >= 1) return;
  const size = o.size || 130, padX = o.padX ?? size * 0.28, h = o.h || size * 1.18;
  font(g, size, o.weight || 800);
  if (g.letterSpacing !== undefined) g.letterSpacing = `${-size * 0.035}px`;
  const tw = g.measureText(o.text).width, w = o.w || tw + padX * 2;
  const lay = outExpo(win(o.at, o.at + 0.5, t));
  const pop = spring(win(o.at, o.at + 0.9, t));
  g.save();
  g.translate(o.x, o.y + 40 * (1 - outQuint(p)) + 30 * inCubic(out));
  g.rotate((o.rot || 0) * Math.PI / 180 + (1 - pop) * 0.05);
  const s = (0.86 + 0.14 * pop) * (1 - 0.15 * out);
  g.scale(s, s);
  g.globalAlpha = clamp(p * 3) * (1 - out);
  const ax = o.align === "left" ? 0 : o.align === "right" ? -w : -w / 2;
  shadow(g, 22, 12, 0.3);
  g.fillStyle = o.bg;
  g.beginPath(); g.rect(ax, -h / 2, w * lay, h); g.fill();
  noShadow(g);
  g.save();
  g.beginPath(); g.rect(ax, -h / 2, w * lay, h); g.clip();
  g.fillStyle = o.fg; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(o.text, ax + (w - tw) / 2 + (1 - lay) * -30, size * 0.06);
  if (o.strike) {
    const sp = outCubic(win(o.strike, o.strike + 0.4, t));
    g.strokeStyle = o.fg; g.lineWidth = size * 0.09; g.lineCap = "round";
    g.beginPath(); g.moveTo(ax + padX * 0.6, size * 0.05); g.lineTo(ax + padX * 0.6 + (w - padX * 1.2) * sp, size * 0.05); g.stroke();
  }
  g.restore();
  g.restore();
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
}

// Small white handwritten-style line under the blocks (the "the videos I keep coming" text).
function note(g, o, t) {
  const p = outCubic(win(o.at, o.at + 0.6, t));
  if (p <= 0) return;
  const out = o.out != null ? win(o.out, o.out + 0.3, t) : 0;
  g.save();
  g.translate(o.x, o.y + 18 * (1 - p)); g.rotate((o.rot || 0) * Math.PI / 180);
  g.globalAlpha = p * (1 - out);
  font(g, o.size || 40, o.weight || 600);
  g.textAlign = o.align || "center"; g.textBaseline = "middle";
  g.shadowColor = "rgba(20,40,10,0.45)"; g.shadowBlur = 8; g.shadowOffsetY = 3;
  g.fillStyle = o.color || COL.white;
  g.fillText(o.text, 0, 0);
  g.restore();
}

function tag(g, o, t) {  // yellow sticker tag, e.g. "EP 01"
  const p = spring(win(o.at, o.at + 0.8, t)) * (o.out != null ? 1 - inCubic(win(o.out, o.out + 0.3, t)) : 1);
  if (p <= 0) return;
  font(g, o.size || 34, 600);
  const tw = g.measureText(o.text).width, w = tw + 30, h = (o.size || 34) * 1.45;
  g.save(); g.translate(o.x, o.y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(p, p);
  shadow(g, 10, 5, 0.25); g.fillStyle = o.bg || COL.yellow; g.fillRect(-w / 2, -h / 2, w, h); noShadow(g);
  g.fillStyle = o.fg || COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(o.text, 0, 2);
  g.restore();
}

function sparkle(g, x, y, r, t, at, seed = 0) {
  const p = spring(win(at, at + 0.7, t));
  if (p <= 0) return;
  const tw = 1 + 0.12 * Math.sin(t * 3.1 + seed * 2.3);
  g.save(); g.translate(x, y); g.rotate(0.3 * Math.sin(t * 0.9 + seed) + (1 - p) * 1.2); g.scale(p * tw, p * tw);
  g.fillStyle = COL.yellow; g.shadowColor = "rgba(20,40,10,0.25)"; g.shadowBlur = 6; g.shadowOffsetY = 2;
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    g.quadraticCurveTo(Math.cos(a - Math.PI / 4) * r * 0.16, Math.sin(a - Math.PI / 4) * r * 0.16, Math.cos(a) * r, Math.sin(a) * r);
  }
  g.quadraticCurveTo(Math.cos(-Math.PI / 4) * r * 0.16, Math.sin(-Math.PI / 4) * r * 0.16, r, 0);
  g.fill(); g.restore();
}

function cursor(g, x, y, s = 1, press = 0) {
  g.save(); g.translate(x, y); g.scale(s * (1 - 0.12 * press), s * (1 - 0.12 * press)); g.rotate(-0.12);
  g.beginPath();
  g.moveTo(0, 0); g.lineTo(0, 62); g.lineTo(15, 48); g.lineTo(26, 72); g.lineTo(37, 67); g.lineTo(26, 44); g.lineTo(46, 44); g.closePath();
  shadow(g, 8, 4, 0.3); g.fillStyle = COL.yellow; g.fill(); noShadow(g);
  g.lineJoin = "round"; g.lineWidth = 3.5; g.strokeStyle = COL.ink; g.stroke();
  g.restore();
}

function ripple(g, x, y, t, at) {
  const p = win(at, at + 0.6, t);
  if (p <= 0 || p >= 1) return;
  g.save(); g.strokeStyle = `rgba(255,230,0,${0.9 * (1 - p)})`; g.lineWidth = 5 * (1 - p) + 1;
  g.beginPath(); g.arc(x, y, 10 + 60 * outCubic(p), 0, 7); g.stroke(); g.restore();
}

function dashed(g, x, y, w, h, t, at, color = "rgba(255,255,255,0.92)") {
  const p = outCubic(win(at, at + 0.8, t));
  if (p <= 0) return;
  g.save(); g.strokeStyle = color; g.lineWidth = 3; g.setLineDash([12, 9]); g.lineDashOffset = -t * 14;
  const per = 2 * (w + h);
  g.beginPath(); g.rect(x, y, w, h);
  g.setLineDash([12, 9]);
  g.globalAlpha = p;
  g.stroke(); g.restore();
}

function dashLine(g, x0, y0, x1, y1, t, at, dur = 0.6) {
  const p = outCubic(win(at, at + dur, t));
  if (p <= 0) return;
  g.save(); g.strokeStyle = "rgba(255,255,255,0.92)"; g.lineWidth = 3.5; g.setLineDash([12, 9]); g.lineDashOffset = -t * 16;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); g.stroke();
  if (p > 0.98) {  // arrow head
    const a = Math.atan2(y1 - y0, x1 - x0);
    g.setLineDash([]); g.beginPath();
    g.moveTo(x1 - Math.cos(a - 0.5) * 18, y1 - Math.sin(a - 0.5) * 18); g.lineTo(x1, y1);
    g.lineTo(x1 - Math.cos(a + 0.5) * 18, y1 - Math.sin(a + 0.5) * 18); g.stroke();
  }
  g.restore();
}

function ytLogo(g, x, y, w, t, at, rot = 0) {
  const p = spring(win(at, at + 0.9, t));
  if (p <= 0) return;
  const h = w * 0.7;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180 + (1 - p) * 0.4); g.scale(p, p);
  shadow(g, 18, 10, 0.3);
  g.fillStyle = COL.red; rr(g, -w / 2, -h / 2, w, h, h * 0.28); g.fill(); noShadow(g);
  g.fillStyle = "#fff"; g.beginPath(); g.moveTo(-w * 0.13, -h * 0.24); g.lineTo(w * 0.2, 0); g.lineTo(-w * 0.13, h * 0.24); g.closePath(); g.fill();
  g.restore();
}

function winIcons(g, x, y, s, t, at) {  // the yellow _ □ × tiles
  ["min", "max", "x"].forEach((k, i) => {
    const p = spring(win(at + i * 0.08, at + i * 0.08 + 0.7, t));
    if (p <= 0) return;
    g.save(); g.translate(x + i * s * 1.18, y); g.scale(p, p);
    g.fillStyle = COL.yellow; shadow(g, 6, 3, 0.25); g.fillRect(-s / 2, -s / 2, s, s); noShadow(g);
    g.strokeStyle = COL.ink; g.lineWidth = s * 0.08; g.strokeRect(-s / 2, -s / 2, s, s);
    g.beginPath();
    if (k === "min") { g.moveTo(-s * 0.25, s * 0.18); g.lineTo(s * 0.25, s * 0.18); }
    if (k === "max") g.rect(-s * 0.22, -s * 0.22, s * 0.44, s * 0.44);
    if (k === "x") { g.moveTo(-s * 0.22, -s * 0.22); g.lineTo(s * 0.22, s * 0.22); g.moveTo(s * 0.22, -s * 0.22); g.lineTo(-s * 0.22, s * 0.22); }
    g.stroke(); g.restore();
  });
}

function toggle(g, x, y, s, t, at, onAt) {
  const p = spring(win(at, at + 0.8, t));
  if (p <= 0) return;
  const on = onAt != null ? outQuint(win(onAt, onAt + 0.35, t)) : 0;
  const w = s * 1.9, h = s;
  g.save(); g.translate(x, y); g.scale(p, p);
  shadow(g, 14, 8, 0.3);
  g.fillStyle = on > 0 ? `rgb(${255},${lerp(255, 230, on)},${lerp(255, 0, on)})` : "#f4f4f2";
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill(); noShadow(g);
  const kx = lerp(-w / 2 + h / 2, w / 2 - h / 2, on);
  shadow(g, 8, 4, 0.25); g.fillStyle = "#fff"; g.beginPath(); g.arc(kx, 0, h * 0.42, 0, 7); g.fill(); noShadow(g);
  g.strokeStyle = "rgba(0,0,0,0.08)"; g.lineWidth = 2; g.stroke();
  g.restore();
}

function bubble(g, x, y, s, t, at) {
  const p = spring(win(at, at + 0.8, t));
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p);
  shadow(g, 10, 5, 0.25); g.fillStyle = "#eef0ee";
  g.beginPath(); g.ellipse(0, 0, s, s * 0.78, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-s * 0.5, s * 0.5); g.lineTo(-s * 0.85, s * 0.95); g.lineTo(-s * 0.1, s * 0.7); g.fill(); noShadow(g);
  g.fillStyle = "#8b8f8b";
  for (let i = -1; i <= 1; i++) { g.beginPath(); g.arc(i * s * 0.38, 0, s * 0.11 * (1 + 0.25 * Math.max(0, Math.sin(t * 6 - i))), 0, 7); g.fill(); }
  g.restore();
}

// Torn-paper star cut from a real 1918 film-magazine page.
const STARS = new Map();
function paperStar(g, x, y, r, rot, seed, t, at) {
  const p = spring(win(at, at + 0.9, t));
  if (p <= 0) return;
  const paper = img(A.paper);
  if (!paper) return;
  let k = STARS.get(seed + ":" + r);
  if (!k) {
    const S = Math.ceil(r * 2.6), cx = S / 2, rn = rnd(seed);
    k = makeCanvas(S, S); const q = k.getContext("2d");
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r;
      const nx = cx + Math.cos(a) * rad, ny = cx + Math.sin(a) * rad;
      if (pts.length) {  // jagged torn edge between points
        const [px, py] = pts[pts.length - 1];
        for (let j = 1; j < 6; j++) pts.push([lerp(px, nx, j / 6) + (rn() - 0.5) * r * 0.05, lerp(py, ny, j / 6) + (rn() - 0.5) * r * 0.05]);
      }
      pts.push([nx, ny]);
    }
    const path = () => { q.beginPath(); pts.forEach(([a, b], i) => (i ? q.lineTo(a, b) : q.moveTo(a, b))); q.closePath(); };
    q.save(); q.translate(0, 0);
    path(); q.fillStyle = "#f3efe4"; q.fill();
    q.save(); path(); q.clip();
    const sx = 120 + rn() * (paper.width - 600), sy = 700 + rn() * (paper.height - 1300);
    q.globalAlpha = 0.92; q.drawImage(paper, sx, sy, S * 1.3, S * 1.3, -S * 0.05, -S * 0.05, S * 1.15, S * 1.15);
    q.restore();
    path(); q.lineWidth = r * 0.07; q.strokeStyle = "rgba(250,248,240,0.95)"; q.lineJoin = "round"; q.stroke();
    q.restore();
    STARS.set(seed + ":" + r, k);
  }
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180 + 0.04 * Math.sin(t * 0.7 + seed)); g.scale(p, p);
  shadow(g, 12, 6, 0.3); g.drawImage(k, -k.width / 2, -k.height / 2); noShadow(g);
  g.restore();
}

function sticker(g, key, x, y, w, rot, t, at) {  // a die-cut photo sticker slapped onto the mat
  const p = spring(win(at, at + 0.8, t));
  if (p <= 0 || !A.objects[key]) return;
  const im = img(A.objects[key].path);
  if (!im) return;
  const h = w * im.height / im.width, s = 1.25 - 0.25 * p;
  g.save(); g.translate(x, y); g.rotate((rot + (1 - p) * 14) * Math.PI / 180); g.scale(s, s);
  g.globalAlpha = clamp(p * 3);
  shadow(g, 18 + 20 * (1 - p), 8 + 20 * (1 - p), 0.38);
  g.drawImage(im, -w / 2, -h / 2, w, h);
  g.restore();
}

// ------------------------------------------------------------------ cards --
function cardIn(o, t) {
  const p = spring(win(o.at, o.at + 0.95, t));
  const out = o.out != null ? win(o.out, o.out + 0.45, t) : 0;
  return { p, out };
}
// YouTube-style card with real footage in the thumbnail.
function ytCard(g, o, t) {
  const { p, out } = cardIn(o, t);
  if (p <= 0 || out >= 1) return;
  const w = o.w, th = o.th || w * 9 / 16, pad = w * 0.022, h = th + pad * 2 + (o.title ? w * 0.17 : 0);
  g.save();
  g.translate(o.x + (o.dx || 0) * (1 - p) + (o.ox || 0) * outCubic(out), o.y + 90 * (1 - p) + (o.oy ?? 140) * inCubic(out));
  g.rotate(((o.rot || 0) + (1 - p) * (o.rin ?? 6)) * Math.PI / 180 + 0.004 * Math.sin(t * 0.8 + o.x));
  const s = (0.9 + 0.1 * p) * (o.scale || 1) * (1 - 0.1 * out); g.scale(s, s);
  g.globalAlpha = clamp(p * 2.5) * (1 - out);
  shadow(g, 34, 20, 0.36);
  g.fillStyle = "#fff"; rr(g, -w / 2, -h / 2, w, h, 16); g.fill(); noShadow(g);
  // thumbnail
  const tx = -w / 2 + pad, ty = -h / 2 + pad, tw = w - pad * 2;
  g.save(); rr(g, tx, ty, tw, th, 10); g.clip();
  g.fillStyle = "#111"; g.fillRect(tx, ty, tw, th);
  if (o.draw) o.draw(g, tx, ty, tw, th, t);
  else {
    const fr = footage(o.clip, (t - o.at) + (o.ss || 0), o.speed || 1, o.loop);
    if (fr) {  // cover-fit
      const sc = Math.max(tw / fr.width, th / fr.height) * (o.zoom || 1);
      const dw = fr.width * sc, dh = fr.height * sc;
      if (o.filter) g.filter = o.filter;
      g.drawImage(fr, tx + (tw - dw) / 2 + (o.fx || 0) * dw, ty + (th - dh) / 2 + (o.fy || 0) * dh, dw, dh);
      g.filter = "none";
    }
  }
  if (o.grain) { g.globalAlpha = 0.18; g.globalCompositeOperation = "overlay"; g.drawImage(GRAIN[Math.floor(t * 24) % 6], tx, ty, tw, th); g.globalCompositeOperation = "source-over"; g.globalAlpha = clamp(p * 2.5) * (1 - out); }
  if (o.dur) {
    font(g, w * 0.03, 600); const dw = g.measureText(o.dur).width + 16;
    g.fillStyle = "rgba(0,0,0,0.78)"; rr(g, tx + tw - dw - 10, ty + th - w * 0.05 - 10, dw, w * 0.05, 6); g.fill();
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(o.dur, tx + tw - dw / 2 - 10, ty + th - w * 0.025 - 9);
  }
  g.restore();
  if (o.title) {
    g.textAlign = "left"; g.textBaseline = "top";
    font(g, w * 0.042, 700); g.fillStyle = "#0f0f0f"; g.fillText(o.title, tx + 4, ty + th + w * 0.035);
    font(g, w * 0.029, 500); g.fillStyle = "#606060"; g.fillText(o.meta || "", tx + 4, ty + th + w * 0.095);
    g.fillStyle = "#303030";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(tx + tw - 10, ty + th + w * 0.05 + i * w * 0.018, w * 0.0055, 0, 7); g.fill(); }
  }
  if (o.after) o.after(g, w, h, t);
  g.restore();
}

// Dark code editor card; text types itself from `typeAt` at `cps` chars/s.
function codeCard(g, o, t) {
  const { p, out } = cardIn(o, t);
  if (p <= 0 || out >= 1) return;
  const w = o.w, lh = o.fs * 1.55, head = 64, h = o.h || head + 34 + lh * o.lines.length + 26;
  g.save();
  g.translate(o.x, o.y + 90 * (1 - p) + 140 * inCubic(out));
  g.rotate(((o.rot || 0) + (1 - p) * 5) * Math.PI / 180 + 0.004 * Math.sin(t * 0.8 + 3));
  const s = (0.9 + 0.1 * p) * (1 - 0.1 * out); g.scale(s, s);
  g.globalAlpha = clamp(p * 2.5) * (1 - out);
  shadow(g, 34, 20, 0.4);
  g.fillStyle = COL.dark; rr(g, -w / 2, -h / 2, w, h, 18); g.fill(); noShadow(g);
  // header: yellow window tiles + file name
  ["min", "max", "x"].forEach((k, i) => {
    const s2 = 26, x = -w / 2 + 34 + i * 34, y = -h / 2 + head / 2;
    g.fillStyle = COL.yellow; g.fillRect(x - s2 / 2, y - s2 / 2, s2, s2);
    g.strokeStyle = COL.ink; g.lineWidth = 2.4; g.beginPath();
    if (k === "min") { g.moveTo(x - 6, y + 5); g.lineTo(x + 6, y + 5); }
    if (k === "max") g.rect(x - 5.5, y - 5.5, 11, 11);
    if (k === "x") { g.moveTo(x - 5.5, y - 5.5); g.lineTo(x + 5.5, y + 5.5); g.moveTo(x + 5.5, y - 5.5); g.lineTo(x - 5.5, y + 5.5); }
    g.stroke();
  });
  font(g, 26, 500, "Mono"); g.fillStyle = "rgba(255,255,255,0.55)"; g.textAlign = "right"; g.textBaseline = "middle";
  g.fillText(o.file, w / 2 - 30, -h / 2 + head / 2);
  g.fillStyle = "rgba(255,255,255,0.07)"; g.fillRect(-w / 2, -h / 2 + head, w, 2);
  // body
  const total = o.lines.reduce((a, l) => a + l.length + 1, 0);
  let shown = o.typeAt != null ? Math.floor((t - o.typeAt) * (o.cps || 40)) : total;
  font(g, o.fs, 500, "Mono"); g.textAlign = "left"; g.textBaseline = "top";
  let y = -h / 2 + head + 26, caret = null;
  o.lines.forEach((line, li) => {
    const x0 = -w / 2 + 34;
    if (o.hl && o.hl[li]) o.hl[li](g, x0 - 12, y - 6, w - 44, lh, t);
    g.fillStyle = "rgba(255,255,255,0.22)"; g.fillText(String(li + 1).padStart(2, " "), x0, y);
    let x = x0 + o.fs * 1.9;
    const vis = Math.max(0, Math.min(line.length, shown)); shown -= line.length + 1;
    const toks = tokenize(line.slice(0, vis));
    const rep = o.replace && o.replace[li] ? o.replace[li](t) : null;
    for (const [s, col] of (rep ? tokenize(rep) : toks)) { g.fillStyle = col; g.fillText(s, x, y); x += g.measureText(s).width; }
    if (vis < line.length && vis >= 0 && caret == null && o.typeAt != null && t >= o.typeAt) caret = [x, y];
    y += lh;
  });
  if (caret && Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = COL.yellow; g.fillRect(caret[0] + 2, caret[1] + 2, o.fs * 0.55, o.fs * 1.15); }
  if (o.after) o.after(g, w, h, t);
  g.restore();
}
function tokenize(s) {
  const out = [], re = /(#.*$|\/\/.*$)|("[^"]*"?)|(\b\d+(?:\.\d+)?\b)|(\b(?:const|let|def|return|for|in|if|import|from|function)\b)|([A-Za-z_]\w*(?=\())|([^#"\/\w]+|\w+|\/)/g;
  let m;
  while ((m = re.exec(s))) {
    const col = m[1] ? "#9a8f78" : m[2] ? "#b7e08a" : m[3] ? "#ffe600" : m[4] ? "#ffcf6e" : m[5] ? "#8fd0ff" : "#f2efe6";
    out.push([m[0], col]);
  }
  return out;
}

// White prompt card: the request, typed in plain words.
function promptCard(g, o, t) {
  const { p, out } = cardIn(o, t);
  if (p <= 0 || out >= 1) return;
  const w = o.w, fs = o.fs || 40, lh = fs * 1.4;
  font(g, fs, 500);
  const lines = wrap(g, o.text, w - 80);
  const h = o.h || 120 + lh * lines.length + 40;
  g.save();
  g.translate(o.x, o.y + 90 * (1 - p) + 140 * inCubic(out));
  g.rotate(((o.rot || 0) + (1 - p) * -5) * Math.PI / 180 + 0.004 * Math.sin(t * 0.8 + 1));
  const s = (0.9 + 0.1 * p) * (o.scale || 1) * (1 - 0.1 * out); g.scale(s, s);
  g.globalAlpha = clamp(p * 2.5) * (1 - out);
  shadow(g, 34, 20, 0.36); g.fillStyle = "#fff"; rr(g, -w / 2, -h / 2, w, h, 22); g.fill(); noShadow(g);
  // header row
  g.fillStyle = COL.yellow; g.fillRect(-w / 2 + 34, -h / 2 + 34, 150, 46);
  font(g, 26, 700); g.fillStyle = COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(o.label || "prompt", -w / 2 + 109, -h / 2 + 58);
  font(g, 24, 500); g.fillStyle = "#9a9a9a"; g.textAlign = "right"; g.fillText(o.right || "plain English", w / 2 - 36, -h / 2 + 58);
  // typed body
  font(g, fs, 500); g.textAlign = "left"; g.textBaseline = "top"; g.fillStyle = "#1b1b1b";
  let n = o.typeAt != null ? Math.floor(Math.max(0, t - o.typeAt) * (o.cps || 30)) : 1e9, caret = null;
  lines.forEach((ln, i) => {
    const s2 = ln.slice(0, Math.max(0, n)); n -= ln.length + 1;
    const y = -h / 2 + 112 + i * lh;
    g.fillText(s2, -w / 2 + 40, y);
    if (s2.length < ln.length && caret == null) caret = [-w / 2 + 40 + g.measureText(s2).width, y];
  });
  if (!caret && lines.length) { const last = lines[lines.length - 1]; caret = [-w / 2 + 40 + g.measureText(last).width, -h / 2 + 112 + (lines.length - 1) * lh]; }
  if (caret && Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = "#1b1b1b"; g.fillRect(caret[0] + 4, caret[1] + 4, 3.5, fs * 1.1); }
  if (o.after) o.after(g, w, h, t);
  g.restore();
}
function wrap(g, text, maxW) {
  const out = []; let cur = "";
  for (const word of text.split(" ")) {
    const tryS = cur ? cur + " " + word : word;
    if (g.measureText(tryS).width > maxW && cur) { out.push(cur); cur = word; } else cur = tryS;
  }
  if (cur) out.push(cur);
  return out;
}

// ------------------------------------------------------------------ desk objects --
// Real photographed objects (cut out of Mixkit desk footage), lying on the mat around the
// boards. The phones' green screens are measured in cutout.py, so they play our footage.
const OBJ = [
  // hook board
  { k: "notebook", x: -370, y: -677, w: 560, rot: 12 },
  { k: "pencil", x: 378, y: -782, w: 520, rot: -28 },
  { k: "phone", x: -370, y: 764, w: 460, rot: 8, screen: "tired" },
  // title board
  { k: "pencil", x: 1180-404, y: -260-662, w: 540, rot: 35 },
  { k: "phone_rose", x: 1180+387, y: -260+727, w: 480, rot: -12, screen: "cover" },
  { k: "notebook", x: 1180-482, y: -260+718, w: 520, rot: 160 },
  // past board
  { k: "phone", x: 1240-404, y: 2050+745, w: 420, rot: -15, screen: "moviola" },
  { k: "pencil", x: 1240+413, y: 2050-800, w: 500, rot: 20 },
  // flip board
  { k: "notebook", x: -20+447, y: 2350-764, w: 560, rot: -14 },
  { k: "phone_rose", x: -20-404, y: 2350+745, w: 450, rot: 18, screen: "typing" },
  // how board
  { k: "pencil", x: -60-413, y: 4650-800, w: 520, rot: 30 },
  { k: "phone", x: -60+404, y: 4650+736, w: 460, rot: -10, screen: "cover" },
  // scale board
  { k: "notebook", x: 1240-464, y: 4520+764, w: 540, rot: 8 },
  { k: "phone_rose", x: 1240+430, y: 4520-800, w: 420, rot: 200, screen: "timelapse" },
  // role board
  { k: "phone", x: 1300+413, y: 6820+745, w: 440, rot: 12, screen: "clapper" },
  { k: "pencil", x: 1300-404, y: 6820-800, w: 520, rot: -32 },
  // outro board
  { k: "notebook", x: 40-447, y: 6950-745, w: 580, rot: 10 },
  { k: "phone_rose", x: 40+387, y: 6950+736, w: 500, rot: -14, screen: "cover" },
  { k: "pencil", x: 40+490, y: 6950-304, w: 460, rot: 95 },
];
function drawScreen(g, what, w, h, t) {   // portrait content in (-w/2,-h/2,w,h)
  if (what === "cover") { miniCover(g, -w / 2, -h / 2, w, h, t); return; }
  const fr = footage(what, t % (A.footage[what] / 30), 1, true);
  if (!fr) return;
  const sc = Math.max(w / fr.width, h / fr.height);
  g.drawImage(fr, -fr.width * sc / 2, -fr.height * sc / 2, fr.width * sc, fr.height * sc);
}
function drawObjects(g, t, cam) {
  for (const o of OBJ) {
    const src = A.objects[o.k];
    if (!src) continue;
    const im = img(src.path);
    if (!im) continue;
    let x = o.x, y = o.y;
    // parallax: objects stand above the mat, so they drift a touch faster than it
    x += (x - cam.x) * 0.06; y += (y - cam.y) * 0.06;
    if (Math.abs(x - cam.x) > 1400 / cam.z || Math.abs(y - cam.y) > 1600 / cam.z) continue;
    const h = o.w * im.height / im.width;
    g.save(); g.translate(x, y); g.rotate(o.rot * Math.PI / 180);
    g.shadowColor = "rgba(10,25,5,0.42)"; g.shadowBlur = 30; g.shadowOffsetX = 12; g.shadowOffsetY = 22;
    g.drawImage(im, -o.w / 2, -h / 2, o.w, h);
    noShadow(g);
    if (o.screen && src.screen) {
      const S = src.screen, L = S.len * o.w * 0.985, Wd = S.wid * o.w * 0.97;
      g.translate(-o.w / 2 + S.cx * o.w, -h / 2 + S.cy * o.w);
      g.rotate(S.ang * Math.PI / 180 + Math.PI / 2);
      g.save(); rr(g, -Wd / 2, -L / 2, Wd, L, Wd * 0.13); g.clip();
      drawScreen(g, o.screen, Wd, L, t);
      const gl = g.createLinearGradient(-Wd / 2, -L / 2, Wd / 2, L / 2);   // glass
      gl.addColorStop(0, "rgba(255,255,255,0.16)"); gl.addColorStop(0.45, "rgba(255,255,255,0.02)"); gl.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gl; g.fillRect(-Wd / 2, -L / 2, Wd, L);
      g.restore();
    }
    g.restore();
  }
}

// ------------------------------------------------------------------ boards --
const BOARDS = {};

BOARDS.hook = (g, t) => {
  const C = CUE;
  dashed(g, -440, -720, 880, 980, t, 0.5);
  sparkle(g, 400, -760, 30, t, 0.7, 1); sparkle(g, -430, 330, 24, t, 0.9, 2);
  paperStar(g, 450, -380, 70, 14, 3, t, 0.4);
  paperStar(g, -470, 470, 56, -10, 7, t, 0.6);
  // the old way: a timeline, playing
  ytCard(g, { at: 0.15, out: C.hook_written - 0.05, x: 0, y: -300, w: 860, clip: "timeline", rot: -2.5,
    title: "Editing, the old way", meta: "drag · trim · drag · trim · 3 days ago", dur: "11:58:02", oy: 80, ox: -500 }, t);
  // the cursor goes for a clip, and doesn't drag it
  const cIn = outQuint(win(C.hook_clip - 0.5, C.hook_clip + 0.1, t)), cOut = inCubic(win(C.hook_written - 0.4, C.hook_written, t));
  if (cIn > 0 && cOut < 1) {
    const press = Math.sin(Math.PI * win(C.hook_dragged, C.hook_dragged + 0.3, t));
    cursor(g, lerp(380, 120, cIn) + 300 * cOut, lerp(260, -170, cIn) + 300 * cOut, 1.25, press);
    ripple(g, 125, -165, t, C.hook_dragged);
  }
  block(g, { at: C.hook_never - 0.05, out: C.hook_written - 0.1, x: -120, y: 210, text: "never", bg: COL.brown, fg: COL.white, size: 150, rot: -6 }, t);
  block(g, { at: C.hook_timeline - 0.05, out: C.hook_written - 0.1, x: 170, y: 380, text: "on a timeline", bg: COL.white, fg: COL.ink, size: 92, rot: 3 }, t);
  tag(g, { at: C.hook_dragged, out: C.hook_written - 0.1, x: 280, y: 60, text: "0 clips dragged", rot: -4, size: 36 }, t);
  // the new way: code
  codeCard(g, { at: C.hook_written - 0.1, x: 10, y: -310, w: 880, fs: 30, rot: 2, file: "ep01/timeline.py",
    typeAt: C.hook_written + 0.2, cps: 46,
    lines: ["CUE = {", "  \"hook_never\": w(\"hook\", \"never\"),", "  \"title_vibe\": w(\"name\", \"vibe\"),", "  \"past_hand\":  w(\"past\", \"hand\"),", "  \"flip_mood\":  w(\"flip\", \"mood\"),", "}"],
    out: C.s_title + 0.1 }, t);
  block(g, { at: C.hook_code - 0.1, x: -110, y: 260, text: "written in code", bg: COL.yellow, fg: COL.brown, size: 104, rot: -4 }, t);
  block(g, { at: C.hook_ai - 0.05, x: 200, y: 420, text: "by AI", bg: COL.brown, fg: COL.white, size: 120, rot: 5 }, t);
  sparkle(g, 380, 330, 34, t, C.hook_ai + 0.2, 4);
};

// The cover: the reference layout, rebuilt for the series.
function titleComp(g, t, at, words, sub) {
  const [a, b, c2] = words;
  dashed(g, -300, -330, 360, 150, t, at + 0.1);
  ytLogo(g, 130, -400, 210, t, at - 0.1, 4);
  winIcons(g, 330, -460, 40, t, at + 0.2);
  tag(g, { at: at + 0.05, x: -290, y: -300, text: sub.tag, rot: -2, size: 36 }, t);
  block(g, { at: at + 0.25, x: -110, y: -150, text: a, bg: COL.brown, fg: COL.white, size: 190, rot: -7 }, t);
  block(g, { at: at + 0.55, x: 170, y: 40, text: b, bg: COL.yellow, fg: COL.brown, size: 168, rot: 0 }, t);
  note(g, { at: at + 0.7, x: -210, y: 160, text: sub.l1, size: 38, rot: -7 }, t);
  block(g, { at: at + 0.85, x: -10, y: 275, text: c2, bg: COL.white, fg: COL.brown, size: 150, rot: -3 }, t);
  tag(g, { at: at + 1.0, x: 300, y: 165, text: sub.tag2, bg: COL.brown, fg: COL.white, rot: -8, size: 32 }, t);
  note(g, { at: at + 1.1, x: 20, y: 420, text: sub.l2, size: 38, rot: -3 }, t);
  dashLine(g, -250, -230, -80, -230, t, at + 0.4);
  sparkle(g, 60, -260, 34, t, at + 0.45, 5); sparkle(g, 410, 330, 24, t, at + 1.0, 6);
  sparkle(g, -420, 40, 22, t, at + 0.9, 7); sparkle(g, -40, 520, 18, t, at + 1.2, 8);
  cursor(g, 400 + 20 * Math.sin(t * 1.3), 240 + 10 * Math.cos(t * 1.1), 1.1, 0);
  bubble(g, 330, 330, 40, t, at + 1.15);
}
BOARDS.title = (g, t) => {
  const at = CUE.title_vibe - 0.3;
  paperStar(g, -440, -620, 66, 10, 11, t, at - 0.3);
  paperStar(g, 450, 580, 52, -18, 12, t, at + 0.6);
  paperStar(g, -470, 640, 44, 30, 13, t, at + 0.9);
  toggle(g, 380, -150, 70, t, at + 0.3);
  titleComp(g, t, at, ["vibe", "editing", "explained"],
    { tag: "EP 01", tag2: "for creators", l1: "editing with AI + code", l2: "what it is · how it works · why it matters" });
};

BOARDS.past = (g, t) => {
  const C = CUE;
  block(g, { at: C.past_century - 0.25, x: -200, y: -790, text: "100+ years", bg: COL.brown, fg: COL.white, size: 84, rot: -4 }, t);
  note(g, { at: C.past_century, x: 210, y: -760, text: "editing meant this", size: 40, rot: -3 }, t);
  ytCard(g, { at: C.past_this - 0.45, x: -20, y: -270, w: 840, th: 840 * 0.75, clip: "moviola", rot: -3, grain: true,
    filter: "contrast(1.08) brightness(1.04)", title: "Cutting film by hand, 1954",
    meta: "Making Films That Teach · Prelinger Archives", dur: "18:12", out: C.s_flip - 0.1, ox: 0, oy: 80 }, t);
  block(g, { at: C.past_cutting - 0.05, x: -150, y: 250, text: "cutting film", bg: COL.yellow, fg: COL.brown, size: 104, rot: -5, out: C.past_dragging - 0.3 }, t);
  block(g, { at: C.past_hand - 0.05, x: 200, y: 400, text: "by hand", bg: COL.white, fg: COL.brown, size: 100, rot: 4, out: C.past_dragging - 0.3 }, t);
  // then: dragging clips on a timeline, for hours
  ytCard(g, { at: C.past_dragging - 0.3, x: 40, y: 110, w: 880, clip: "timelapse", rot: 3.5, dx: 300,
    title: "Dragging clips, frame by frame", meta: "timelapse · one evening of editing", dur: "6:42:10", out: C.s_flip - 0.1, oy: 80 }, t);
  block(g, { at: C.past_frame - 0.05, x: -40, text: "frame by frame", bg: COL.yellow, fg: COL.brown, size: 96, rot: -3, out: C.past_hours - 0.5, y: 400 }, t);
  // for hours: a tired editor and a clock that won't stop
  ytCard(g, { at: C.past_hours - 0.35, x: 270, y: -260, w: 420, th: 560, clip: "tired", ss: 2.3, rot: 7, dx: 200, out: C.s_flip - 0.1, oy: 80 }, t);
  block(g, { at: C.past_hours - 0.05, x: -170, y: 410, text: "for hours", bg: COL.brown, fg: COL.white, size: 130, rot: -6 }, t);
  const clk = win(C.past_hours, C.s_flip, t);
  if (t > C.past_hours) {
    const mins = Math.floor(lerp(0, 8 * 60 + 47, outCubic(clk)));
    tag(g, { at: C.past_hours + 0.15, x: 300, y: 470, text: `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")} hrs`, rot: 5, size: 44 }, t);
  }
  sticker(g, "clock", 380, 760, 300, 12, t, C.past_hours + 0.05);
  sparkle(g, 420, -690, 28, t, C.past_this, 9);
  paperStar(g, -460, -560, 58, -14, 21, t, C.past_century);
};

const PROMPT = "Make a 60-second explainer on vibe editing. English voiceover. Smooth, ASMR transitions, like Apple does it. Proper background music and sound effects.";
BOARDS.flip = (g, t) => {
  const C = CUE;
  block(g, { at: C.flip_flips - 0.75, x: -150, y: -780, text: "vibe editing", bg: COL.brown, fg: COL.white, size: 104, rot: -5 }, t);
  block(g, { at: C.flip_flips - 0.05, x: 230, y: -650, text: "flips that", bg: COL.yellow, fg: COL.brown, size: 92, rot: 4 }, t);
  ytCard(g, { at: C.flip_describe - 0.5, x: -20, y: -270, w: 760, clip: "typing", rot: -3, dx: -200,
    title: "You type what you want", meta: "the whole edit, as a request", dur: "0:12" }, t);
  promptCard(g, { at: C.flip_describe - 0.2, x: 20, y: 225, w: 900, rot: 1.5, fs: 40, typeAt: C.flip_describe + 0.1, cps: 30, text: PROMPT,
    right: "the brief" }, t);
  block(g, { at: C.flip_mood - 0.05, x: -270, y: 455, text: "mood", bg: COL.brown, fg: COL.white, size: 96, rot: -7 }, t);
  block(g, { at: C.flip_pace - 0.05, x: 10, y: 480, text: "pace", bg: COL.yellow, fg: COL.brown, size: 96, rot: 3 }, t);
  block(g, { at: C.flip_look - 0.05, x: 280, y: 455, text: "look", bg: COL.white, fg: COL.brown, size: 96, rot: 7 }, t);
  sparkle(g, -430, -560, 30, t, C.flip_describe, 10); sparkle(g, 440, 330, 26, t, C.flip_mood, 11);
};

const CODE_HOW = [
  "// scenes, cut to the voice",
  "ytCard({ clip: \"moviola\", at: C.past_this })",
  "block({ text: \"by hand\", at: C.past_hand })",
  "captions(TL.lines)",
  "sfx(\"paper_slide\", C.flip_mood)",
  "render(\"ep01.mp4\", { fps: 30 })",
];
BOARDS.how = (g, t) => {
  const C = CUE;
  // words -> agent -> code -> video
  promptCard(g, { at: C.s_how + 0.25, x: -150, y: -720, w: 600, scale: 1, rot: -4, fs: 28, text: PROMPT.slice(0, 74) + "…", label: "words", right: "" }, t);
  dashLine(g, -150, -560, -150, -455, t, C.how_agent - 0.3);
  block(g, { at: C.how_agent - 0.1, x: -150, y: -385, text: "AI agent", bg: COL.yellow, fg: COL.brown, size: 92, rot: -2 }, t);
  sparkle(g, 60, -440, 30, t, C.how_agent + 0.1, 12);
  dashLine(g, -150, -315, -150, -230, t, C.how_code - 0.4);
  codeCard(g, { at: C.how_code - 0.3, out: C.how_video - 0.15, x: 0, y: 30, w: 940, fs: 28, rot: 1.5, file: "ep01/stage.js",
    typeAt: C.how_code, cps: 70, lines: CODE_HOW,
    hl: {
      1: (g2, x, y, w, h, tt) => hlBar(g2, x, y, w, h, tt, C.how_clip),
      2: (g2, x, y, w, h, tt) => hlBar(g2, x, y, w, h, tt, C.how_caption - 0.05),
      4: (g2, x, y, w, h, tt) => hlBar(g2, x, y, w, h, tt, C.how_sound),
      5: (g2, x, y, w, h, tt) => hlBar(g2, x, y, w, h, tt, C.how_renders),
    } }, t);
  tag(g, { at: C.how_clip, x: 380, y: -170, text: "clip ✓", rot: 6, size: 36 }, t);
  tag(g, { at: C.how_caption, x: 400, y: -110, text: "caption ✓", rot: -3, size: 36, bg: COL.white }, t);
  tag(g, { at: C.how_sound, x: 380, y: -50, text: "sound ✓", rot: 4, size: 36, bg: COL.brown, fg: COL.white }, t);
  // render: progress, then the finished video
  const rp = win(C.how_renders, C.how_video + 0.2, t);
  if (rp > 0) {
    const a = outCubic(win(C.how_renders, C.how_renders + 0.3, t));
    g.save(); g.globalAlpha = a; g.translate(0, 420);
    shadow(g, 14, 6, 0.3); g.fillStyle = "#fff"; rr(g, -380, -24, 760, 48, 24); g.fill(); noShadow(g);
    g.fillStyle = COL.yellow; rr(g, -372, -16, 744 * inOutCubic(rp), 32, 16); g.fill();
    font(g, 24, 700); g.fillStyle = COL.ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(rp < 1 ? `rendering · frame ${Math.floor(rp * TL.dur * TL.fps)} / ${Math.round(TL.dur * TL.fps)}` : "ep01.mp4 ✓", 0, 1);
    g.restore();
  }
  ytCard(g, { at: C.how_video - 0.1, x: 20, y: -10, w: 760, rot: -3, dx: 0,
    draw: (g2, x, y, w, h, tt) => miniCover(g2, x, y, w, h, tt),
    title: "What is vibe editing?", meta: "EP 01 · rendered from code", dur: "0:56" }, t);
  ytLogo(g, 330, -250, 130, t, C.how_video + 0.15, 8);
};
function hlBar(g, x, y, w, h, t, at) {  // a highlighter stroke sweeping across a line
  const p = outCubic(win(at, at + 0.35, t));
  if (p <= 0) return;
  g.save(); g.globalAlpha = 0.3; g.fillStyle = COL.yellow; g.fillRect(x, y, w * p, h); g.restore();
}
function miniCover(g, x, y, w, h, t) {  // the cover board, drawn small into a thumbnail
  g.save();
  g.fillStyle = COL.mat; g.fillRect(x, y, w, h);
  g.translate(x + w / 2, y + h / 2); const s = Math.min(w / 1050, h / 1150); g.scale(s, s);
  drawGrid(g, -1000, -700, 2000, 1400);
  titleComp(g, 99, 0, ["vibe", "editing", "explained"], { tag: "EP 01", tag2: "for creators", l1: "editing with AI + code", l2: "" });
  g.restore();
}

BOARDS.scale = (g, t) => {
  const C = CUE;
  block(g, { at: C.s_scale + 0.35, x: -130, y: -780, text: "the video is code", bg: COL.brown, fg: COL.white, size: 84, rot: -4 }, t);
  codeCard(g, { at: C.s_scale + 0.25, x: 0, y: -420, w: 900, fs: 34, rot: -1.5, file: "ep01/settings.py",
    lines: ["LANG     = \"en\"", "PACE     = 1.0", "VERSIONS = 1", "VOICE    = \"Eric\""],
    replace: {
      0: (tt) => (tt > C.scale_hindi ? "LANG     = \"hi\"" : null),
      1: (tt) => (tt > C.scale_faster ? "PACE     = 1.5" : null),
      2: (tt) => (tt > C.scale_hundred + 0.05 ? "VERSIONS = 100" : null),
    },
    hl: {
      0: (g2, x, y, w, h, tt) => hlBar(g2, x, y, w, h, tt, C.scale_hindi - 0.2),
      1: (g2, x, y, w, h, tt) => { hlBar(g2, x, y, w, h, tt, C.scale_line - 0.05); },
      2: (g2, x, y, w, h, tt) => hlBar(g2, x, y, w, h, tt, C.scale_hundred - 0.2),
    } }, t);
  block(g, { at: C.scale_line - 0.05, x: 250, y: -160, text: "one line", bg: COL.yellow, fg: COL.brown, size: 88, rot: 5, out: C.scale_faster - 0.3 }, t);
  note(g, { at: C.scale_everything - 0.1, x: -60, y: -60, text: "changes everything", size: 44, rot: -2, out: C.scale_faster - 0.3 }, t);
  // faster: the same footage, at 1.5x
  ytCard(g, { at: C.scale_faster - 0.3, x: -180, y: 200, w: 560, clip: "timelapse", speed: 1.5, loop: true, rot: -5, dx: -200,
    title: "faster", meta: "PACE = 1.5", dur: "0:37", out: C.scale_hundred - 0.2, oy: 60 }, t);
  // hindi
  ytCard(g, { at: C.scale_hindi - 0.3, x: 220, y: 270, w: 540, rot: 4, dx: 200, out: C.scale_hundred - 0.2, oy: 60,
    draw: (g2, x, y, w, h) => { g2.fillStyle = COL.brown; g2.fillRect(x, y, w, h); font(g2, h * 0.24, 800); g2.fillStyle = "#fff"; g2.textAlign = "center"; g2.textBaseline = "middle"; g2.fillText("वाइब एडिटिंग", x + w / 2, y + h * 0.45); font(g2, h * 0.1, 600); g2.fillStyle = COL.yellow; g2.fillText("हिंदी + English", x + w / 2, y + h * 0.75); },
    title: "in Hindi", meta: "LANG = \"hi\"", dur: "0:56" }, t);
  // a hundred versions
  const hp = win(C.scale_hundred - 0.1, C.scale_hundred + 1.6, t);
  if (hp > 0) {
    const cols = 10, cw = 82, ch = 56, gap = 7, x0 = -(cols * (cw + gap)) / 2 + cw / 2, y0 = -190;
    const clips = ["timeline", "moviola", "timelapse", "typing", "clapper"];
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / cols), cc = i % cols;
      const d = (Math.hypot(r - 4.5, cc - 4.5) / 6.4) * 0.8;
      const p = spring(win(C.scale_hundred - 0.1 + d, C.scale_hundred + 0.6 + d, t));
      if (p <= 0) continue;
      const x = x0 + cc * (cw + gap), y = y0 + r * (ch + gap);
      g.save(); g.translate(x, y); g.scale(p, p); g.rotate((1 - p) * 0.4);
      g.fillStyle = "#fff"; g.fillRect(-cw / 2, -ch / 2, cw, ch);
      const fr = footage(clips[i % 5], 1 + (i * 0.37) % 4);
      if (fr) { const sc = Math.max((cw - 6) / fr.width, (ch - 6) / fr.height); g.save(); g.beginPath(); g.rect(-cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6); g.clip(); g.drawImage(fr, -fr.width * sc / 2, -fr.height * sc / 2, fr.width * sc, fr.height * sc); g.restore(); }
      g.restore();
    }
    const n = Math.min(100, Math.floor(lerp(1, 100, outCubic(win(C.scale_hundred, C.scale_hundred + 1.4, t)))));
    block(g, { at: C.scale_hundred + 0.1, x: 0, y: 455, text: `${n} versions`, bg: COL.yellow, fg: COL.brown, size: 104, rot: -3 }, t);
  }
  sparkle(g, 440, -700, 28, t, C.scale_line, 13);
};

BOARDS.role = (g, t) => {
  const C = CUE;
  // you stop clicking
  const cp = spring(win(C.role_stop - 0.4, C.role_stop + 0.3, t)), co = inCubic(win(C.role_clicking + 0.35, C.role_clicking + 0.8, t));
  if (cp > 0 && co < 1) {
    for (let i = 0; i < 3; i++) ripple(g, -40, -340, t, C.role_stop - 0.1 + i * 0.25);
    g.save(); g.globalAlpha = 1 - co; cursor(g, -40 + 400 * co, -340 - 300 * co, 2.6 * cp, Math.sin(Math.PI * win(C.role_clicking, C.role_clicking + 0.25, t))); g.restore();
  }
  block(g, { at: C.role_stop - 0.1, x: -60, y: -560, text: "stop clicking", bg: COL.white, fg: COL.brown, size: 104, rot: -4, strike: C.role_clicking + 0.25, out: C.role_start - 0.3 }, t);
  // you start directing
  ytCard(g, { at: C.role_start - 0.35, x: 0, y: -170, w: 880, clip: "clapper", rot: -2.5, dx: 0,
    title: "You're the director now", meta: "scene 3 · take 4 · rolling", dur: "0:56" }, t);
  block(g, { at: C.role_start - 0.05, x: -130, y: 285, text: "start", bg: COL.yellow, fg: COL.brown, size: 120, rot: -5 }, t);
  block(g, { at: C.role_directing - 0.05, x: 150, y: 430, text: "directing", bg: COL.brown, fg: COL.white, size: 140, rot: 3 }, t);
  sparkle(g, 420, 290, 34, t, C.role_directing + 0.1, 14); sparkle(g, -420, 440, 24, t, C.role_directing + 0.3, 15);
};

BOARDS.outro = (g, t) => {
  const C = CUE, at = C.s_outro + 0.45;
  paperStar(g, 430, -700, 64, 12, 31, t, at - 0.2);
  paperStar(g, 450, 600, 50, -12, 32, t, at + 0.5);
  titleComp(g, t, at, ["vibe", "editing", "watchlist"],
    { tag: "EP 01 ✓", tag2: "ep 02 next", l1: "the videos that explain it all", l2: "next: how it works under the hood" });
  toggle(g, -330, -610, 80, t, C.outro_follow - 0.6, C.outro_follow + 0.15);
  note(g, { at: C.outro_follow - 0.4, x: -230, y: -610, text: "follow for ep 02", size: 46, weight: 700, align: "left" }, t);
};

// ------------------------------------------------------------------ captions --
// Phrases from the voiceover, words lighting up as they're spoken.
const PHRASES = [];
for (const [id, l] of Object.entries(TL.lines)) {
  let cur = [];
  l.words.forEach((w, i) => {
    cur.push(w);
    if (/[.,!?]$/.test(w.raw) || i === l.words.length - 1) { PHRASES.push(cur); cur = []; }
  });
}
function captions(g, t) {
  const ph = PHRASES.find((p, i) => t >= p[0].t0 - 0.12 && t < (PHRASES[i + 1] ? Math.min(PHRASES[i + 1][0].t0 - 0.12, p[p.length - 1].t1 + 0.6) : p[p.length - 1].t1 + 0.6));
  if (!ph) return;
  const fs = 46; font(g, fs, 700);
  const words = ph.map((w) => w.raw.replace(/[.,]$/, ""));
  const widths = words.map((w) => g.measureText(w + " ").width);
  const total = widths.reduce((a, b) => a + b, 0) - g.measureText(" ").width;
  let x = W / 2 - total / 2; const y = 1530;
  const endA = 1 - win(ph[ph.length - 1].t1 + 0.35, ph[ph.length - 1].t1 + 0.6, t);
  g.save(); g.textBaseline = "middle"; g.textAlign = "left";
  ph.forEach((w, i) => {
    const p = outCubic(win(w.t0 - 0.08, w.t0 + 0.18, t));
    const active = t >= w.t0 - 0.05 && t < w.t1 + 0.05;
    g.globalAlpha = (0.25 + 0.75 * p) * endA;
    if (active) { g.fillStyle = COL.yellow; g.fillRect(x - 8, y - fs * 0.62, widths[i] - g.measureText(" ").width + 16, fs * 1.24); }
    g.shadowColor = active ? "transparent" : "rgba(15,30,8,0.6)"; g.shadowBlur = 10; g.shadowOffsetY = 3;
    g.fillStyle = active ? COL.ink : COL.white;
    g.fillText(words[i], x, y + 4 * (1 - p) + 2);
    noShadow(g);
    x += widths[i];
  });
  g.restore();
}

// ------------------------------------------------------------------ frame --
function drawGrid(g, x0, y0, w, h) {
  const step = 96;
  g.save();
  g.strokeStyle = COL.gridSoft; g.lineWidth = 1.2;
  g.beginPath();
  for (let x = Math.floor(x0 / (step / 2)) * (step / 2); x < x0 + w; x += step / 2) { g.moveTo(x, y0); g.lineTo(x, y0 + h); }
  for (let y = Math.floor(y0 / (step / 2)) * (step / 2); y < y0 + h; y += step / 2) { g.moveTo(x0, y); g.lineTo(x0 + w, y); }
  g.stroke();
  g.strokeStyle = COL.grid; g.lineWidth = 2.6;
  g.beginPath();
  for (let x = Math.floor(x0 / step) * step; x < x0 + w; x += step) { g.moveTo(x, y0); g.lineTo(x, y0 + h); }
  for (let y = Math.floor(y0 / step) * step; y < y0 + h; y += step) { g.moveTo(x0, y); g.lineTo(x0 + w, y); }
  g.stroke();
  g.restore();
}

function frame(t) {
  const cam = camera(t);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = COL.mat; c.fillRect(0, 0, W, H);
  c.save();
  c.translate(W / 2, H / 2); c.rotate(cam.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  // visible world rect (generous, covers rotation)
  const vw = (W / cam.z) * 1.35, vh = (H / cam.z) * 1.35, vx = cam.x - vw / 2, vy = cam.y - vh / 2;
  if (!matPattern) matPattern = c.createPattern(MAT, "repeat");
  c.fillStyle = matPattern; c.fillRect(vx, vy, vw, vh);
  drawGrid(c, vx, vy, vw, vh);
  drawObjects(c, t, cam);
  for (const k of ORDER) {
    const [bx, by] = B[k];
    if (Math.abs(bx - cam.x) > vw / 2 + 700 || Math.abs(by - cam.y) > vh / 2 + 1100) continue;
    c.save(); c.translate(bx, by); BOARDS[k](c, t); c.restore();
  }
  c.restore();
  captions(c, t);
  // lens: soft vignette + grain
  const vg = c.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,25,5,0.38)");
  c.fillStyle = vg; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.07; c.globalCompositeOperation = "overlay";
  c.drawImage(GRAIN[Math.floor(t * 24) % 6], 0, 0, W, H);
  c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  return cam;
}

window.renderAt = async (t) => {
  t = Math.max(0, t);
  for (let i = 0; i < 6; i++) {
    pending = [];
    const cam = frame(t);
    if (!pending.length) return { moving: cam.moving, speed: cam.speed };
    await Promise.all(pending);
  }
  throw new Error("assets failed to load at t=" + t);
};
window.stageReady = document.fonts.ready.then(async () => {
  await Promise.all(["500 40px Poppins", "600 40px Poppins", "700 40px Poppins", "800 40px Poppins", "500 30px Mono"].map((f) => document.fonts.load(f, "aवा")));
  await new Promise((r) => { const im = img(A.paper); im ? r() : imgCache.get(A.paper).p.then(r); });
});
})();

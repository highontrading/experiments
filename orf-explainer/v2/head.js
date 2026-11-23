// ORF explainer, 16:9 cut — "The Lever Is Price". The whole film is renderAt(t) on one 1920x1080 canvas.
// Look: cobalt paper, yellow starbursts, white dashed guides, B&W polaroids, yellow-outlined cutouts,
// handwritten notes, condensed stamps, serif kickers. Timing comes from build/timeline.json.
(async function () {
const W = 1920, H = 1080;
const BLUE = "#3946f3", BLUE_D = "#2b37d6", YEL = "#fff57b", RED = "#a3262f", PAPER = "#f3f1ea", INK = "#2b3ad8", WHITE = "#ffffff";
const cv = document.getElementById("c"), ctx = cv.getContext("2d");
const TL = await (await fetch("/v2/build/timeline.json")).json();
const COUNTS = await (await fetch("/v2/build/foot_counts.json")).json();
const GEO = await (await fetch("/assets/geo/sea.json")).json();
let NOW = 0;

// ------------------------------------------------------------------ utils --
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const win = (t, a, b) => clamp((t - a) / (b - a));
const oc = (x) => 1 - Math.pow(1 - clamp(x), 3);
const oe = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x)));
const io = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const ob = (x, s = 1.7) => { x = clamp(x); return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const ein = (x) => clamp(x) * clamp(x);
const D2R = Math.PI / 180;
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const boilK = () => Math.floor(NOW * 10);           // hand-drawn "boil" at 10 fps
function jit(seed, amt) { const r = rng(seed * 977 + boilK() * 131); return (r() - 0.5) * 2 * amt; }
const WS = (i) => TL.w[i].s;                        // word start (video time)

// ------------------------------------------------------------------ assets --
const cache = new Map();
function loadImg(url) {
  if (cache.has(url)) return cache.get(url);
  const p = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error("load " + url)); im.src = url; })
    .then(async (im) => { await im.decode().catch(() => {}); return im; });
  cache.set(url, p);
  if (cache.size > 900) { const k = cache.keys().next().value; cache.delete(k); }
  return p;
}
const IMG = {};
for (const [k, u] of Object.entries({ car: "/build/cutouts/car_src.png", ship: "/build/cutouts/ship_src.png" })) IMG[k] = await loadImg(u);
const fontsReady = Promise.all([
  "60px Anton", "60px Serif", "60px SerifI", "60px Hand", "60px Script", "500 60px Inter", "600 60px Inter", "700 60px Inter", "800 60px Inter",
].map((f) => document.fonts.load(f)));
await fontsReady;

// footage frame for time t
const FR = {};  // key -> Image for current frame
function frameURL(key, t) {
  const f = TL.footage[key];
  const n = COUNTS[key] || f.n;
  const i = clamp(Math.floor((t - f.t0) * 30) + 1, 1, n);
  return `/v2/build/foot/${key}/${String(i).padStart(4, "0")}.jpg`;
}
const KING_N = 110;
function kingURL(lt) { const n = KING_N, k = Math.floor(lt * 24) % (2 * n - 2); const i = k < n ? k : 2 * n - 2 - k; return `/build/king/k${String(i + 1).padStart(3, "0")}.png`; }

// --------------------------------------------------------------- textures --
function noiseCanvas(w, h, seed, amp = 255) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"), d = g.createImageData(w, h), r = rng(seed);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * amp; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
}
const GRAIN = [1, 2, 3, 4].map((s) => noiseCanvas(960, 540, s));
const MOTTLE = (() => { const small = noiseCanvas(64, 36, 77, 120); const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.filter = "blur(24px)"; g.drawImage(small, -60, -60, W + 120, H + 120); return c; })();
const PAPERTEX = noiseCanvas(256, 256, 9, 40);

// ---------------------------------------------------------------- drawing --
function bg(c, variant = 0) {
  c.fillStyle = BLUE; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = 0.16; c.globalCompositeOperation = "soft-light"; c.drawImage(MOTTLE, 0, 0); c.restore();
  // faint light falloff
  const g = c.createRadialGradient(W * 0.45, H * 0.4, 200, W * 0.5, H * 0.5, 1300);
  g.addColorStop(0, "rgba(255,255,255,0.05)"); g.addColorStop(1, "rgba(10,10,80,0.22)");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function dashed(c, fn, { color = "rgba(255,255,255,0.85)", w = 2.4, dash = [14, 12], off = 0 } = {}) {
  c.save(); c.strokeStyle = color; c.lineWidth = w; c.setLineDash(dash); c.lineDashOffset = off; c.lineCap = "round";
  c.beginPath(); fn(c); c.stroke(); c.restore();
}
function dline(c, x1, y1, x2, y2, p = 1, o = {}) { if (p <= 0) return; dashed(c, (c) => { c.moveTo(x1, y1); c.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); }, o); }
function dcircle(c, x, y, r, p = 1, rot = 0, o = {}) { if (p <= 0) return; dashed(c, (c) => c.arc(x, y, r, rot - Math.PI / 2, rot - Math.PI / 2 + p * Math.PI * 2), o); }
function drect(c, x, y, w, h, p = 1, o = {}) { if (p <= 0) return; c.save(); c.globalAlpha *= p; dashed(c, (c) => c.rect(x, y, w, h), o); c.restore(); }
// page guides (vertical + horizontal dashed rules, a dashed circle, two dashed squares)
function guides(c, lt, g = {}) {
  const p = g.anim ? oc(win(lt, 0.05, 0.9)) : 1;
  const vx = g.vx ?? 1300, hy = g.hy ?? 720;
  dline(c, vx, 0, vx, H, p);
  dline(c, 0, hy, W, hy, p);
  if (g.circ !== false) { const [x, y, r] = g.circ || [190, 190, 110]; dcircle(c, x, y, r, p, 0.3); }
  if (g.sq !== false) { const [x, y, s] = g.sq || [1660, 60, 140]; drect(c, x, y, s, s, p); drect(c, x + 46, y + 44, s, s, p); }
  if (g.arc) { const [x, y, r, a0, a1] = g.arc; dashed(c, (c) => c.arc(x, y, r, a0, lerp(a0, a1, p))); }
}
// 4-point sparkle with concave sides
function sparkle(c, x, y, r, rot = 0, seed = 1, color = YEL, sx = 1) {
  if (r <= 0.5) return;
  c.save(); c.translate(x + jit(seed, 1.2), y + jit(seed + 1, 1.2)); c.rotate(rot + jit(seed + 2, 0.015)); c.scale(sx, 1);
  c.fillStyle = color; c.beginPath();
  const pts = 4, inner = 0.16;
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2, a2 = ((i + 0.5) / pts) * Math.PI * 2, a3 = ((i + 1) / pts) * Math.PI * 2;
    const ro = r * (i % 2 ? 0.78 : 1);
    if (i === 0) c.moveTo(Math.cos(a) * ro, Math.sin(a) * ro);
    const ri = r * inner;
    const ro3 = r * ((i + 1) % 2 ? 0.78 : 1);
    c.quadraticCurveTo(Math.cos(a2) * ri, Math.sin(a2) * ri, Math.cos(a3) * ro3, Math.sin(a3) * ro3);
  }
  c.closePath(); c.fill();
  // rough edge flecks
  c.restore();
}
// irregular spiky star (comic burst)
function spiky(c, x, y, r, rot = 0, seed = 3, n = 9, color = YEL) {
  if (r <= 0.5) return;
  const R = rng(seed);
  const L = Array.from({ length: n }, () => 0.55 + R() * 0.55);
  c.save(); c.translate(x, y); c.rotate(rot + jit(seed, 0.012)); c.fillStyle = color; c.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, am = ((i + 0.5) / n) * Math.PI * 2;
    const ro = r * L[i] + jit(seed + i, r * 0.012), ri = r * 0.24;
    if (i === 0) c.moveTo(Math.cos(a) * ro, Math.sin(a) * ro); else c.lineTo(Math.cos(a) * ro, Math.sin(a) * ro);
    c.lineTo(Math.cos(am) * ri, Math.sin(am) * ri);
  }
  c.closePath(); c.fill(); c.restore();
}
// pop-in scale for decorations
const popS = (lt, at, d = 0.45) => ob(win(lt, at, at + d), 2.2);

function shadow(c, blur = 30, oy = 14, a = 0.35) { c.shadowColor = `rgba(8,10,60,${a})`; c.shadowBlur = blur; c.shadowOffsetY = oy; }
function noShadow(c) { c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetY = 0; c.shadowOffsetX = 0; }
function cover(c, img, x, y, w, h, zoom = 1, px = 0.5, py = 0.5) {
  if (!img) { c.fillStyle = "#555"; c.fillRect(x, y, w, h); return; }
  const s = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * s, dh = img.height * s;
  c.drawImage(img, x + (w - dw) * px, y + (h - dh) * py, dw, dh);
}
// polaroid; (x,y) = center, w/h = photo size
function polaroid(c, img, x, y, w, h, rot = 0, o = {}) {
  const m = o.m ?? Math.round(w * 0.055), mb = o.mb ?? Math.round(h * 0.24);
  const fw = w + 2 * m, fh = h + m + mb;
  c.save(); c.translate(x, y); c.rotate(rot * D2R); c.scale(o.s ?? 1, o.s ?? 1); c.globalAlpha *= o.a ?? 1;
  shadow(c, 34, 16, 0.38);
  c.fillStyle = PAPER; c.fillRect(-fw / 2, -fh / 2, fw, fh); noShadow(c);
  c.save(); c.globalAlpha *= 0.12; c.globalCompositeOperation = "multiply"; c.fillStyle = c.createPattern(PAPERTEX, "repeat"); c.fillRect(-fw / 2, -fh / 2, fw, fh); c.restore();
  const px = -fw / 2 + m, py = -fh / 2 + m;
  c.save(); c.beginPath(); c.rect(px, py, w, h); c.clip();
  if (o.draw) o.draw(c, px, py, w, h); else cover(c, img, px, py, w, h, o.zoom ?? 1.06, o.panx ?? 0.5, o.pany ?? 0.5);
  // inner shade
  const g = c.createLinearGradient(0, py, 0, py + h); g.addColorStop(0, "rgba(0,0,0,0.10)"); g.addColorStop(0.15, "rgba(0,0,0,0)"); g.addColorStop(0.85, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.12)");
  c.fillStyle = g; c.fillRect(px, py, w, h);
  c.restore();
  if (o.cap) {
    c.fillStyle = INK; c.font = `${o.capSize ?? Math.round(mb * 0.72)}px Script`; c.textAlign = "center"; c.textBaseline = "middle";
    const cp = o.capP ?? 1; const txt = o.cap.slice(0, Math.ceil(o.cap.length * cp));
    c.fillText(txt, 0, fh / 2 - mb / 2 + 2);
  }
  if (o.tape) tape(c, 0, -fh / 2 + 4, 150, 46, -3 + jit(5, 0));
  c.restore();
  return { fw, fh };
}
function tape(c, x, y, w, h, rot) {
  c.save(); c.translate(x, y); c.rotate(rot * D2R); c.fillStyle = "rgba(255,250,215,0.62)";
  c.beginPath(); c.moveTo(-w / 2, -h / 2);
  for (let i = 0; i <= 6; i++) c.lineTo(-w / 2 + (w * i) / 6, -h / 2 + (i % 2 ? 3 : -2));
  c.lineTo(w / 2, h / 2); for (let i = 6; i >= 0; i--) c.lineTo(-w / 2 + (w * i) / 6, h / 2 + (i % 2 ? -2 : 3));
  c.closePath(); c.fill(); c.restore();
}
// cutout (pre-baked outline) centered at x,y with width w
function cutout(c, img, x, y, w, rot = 0, a = 1) {
  if (!img) return; const h = (img.height / img.width) * w;
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot * D2R); shadow(c, 26, 12, 0.3); c.drawImage(img, -w / 2, -h / 2, w, h); noShadow(c); c.restore();
}
function txt(c, s, x, y, o = {}) {
  c.save(); c.translate(x, y); c.rotate((o.rot || 0) * D2R); c.scale(o.s ?? 1, o.s ?? 1);
  c.globalAlpha *= o.a ?? 1;
  c.font = o.font || "60px Serif"; c.fillStyle = o.color || WHITE; c.textAlign = o.align || "left"; c.textBaseline = o.base || "alphabetic";
  if (o.ls) c.letterSpacing = o.ls + "px";
  if (o.shadow) shadow(c, 18, 6, 0.3);
  const lines = String(s).split("\n"); const lh = o.lh ?? parseFloat(c.font) * 1.05;
  let total = lines.reduce((n, l) => n + l.length, 0), shown = Math.ceil(total * (o.p ?? 1));
  lines.forEach((l, i) => { const k = Math.max(0, Math.min(l.length, shown)); shown -= l.length; if (k > 0) c.fillText(l.slice(0, k), 0, i * lh); });
  c.restore();
}
// serif kicker with a left-to-right wipe
function kicker(c, s, lt, at = 0.1, o = {}) {
  const p = oc(win(lt, at, at + 0.55));
  if (p <= 0) return;
  c.save(); c.beginPath(); c.rect(0, 0, (o.x ?? 70) + p * 1000, H); c.clip();
  txt(c, s, (o.x ?? 70) + (1 - p) * -30, o.y ?? 215, { font: `${o.size ?? 86}px Serif`, color: WHITE, a: p, align: o.align });
  c.restore();
}
// yellow condensed stamp in a dashed box
function stamp(c, s, x, y, o = {}) {
  const sc = o.s ?? 1; if (sc <= 0.01) return;
  c.save(); c.translate(x, y); c.rotate((o.rot || 0) * D2R); c.scale(sc, sc); c.globalAlpha *= o.a ?? 1;
  const fs = o.size ?? 44; c.font = `${fs}px Anton`; c.letterSpacing = (o.ls ?? 1) + "px";
  const w = c.measureText(s).width, pad = fs * 0.38;
  if (o.fill) { c.fillStyle = o.fill; shadow(c, 16, 6, 0.25); c.fillRect(-w / 2 - pad, -fs * 0.72, w + 2 * pad, fs * 1.32); noShadow(c); }
  else drect(c, -w / 2 - pad, -fs * 0.72, w + 2 * pad, fs * 1.32, 1, { color: o.color || YEL, w: 2.2, dash: [8, 7] });
  c.fillStyle = o.color || YEL; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, 2);
  c.restore();
}
// rubber-stamp slam: scale 1.6 -> 1 with overshoot
const slam = (lt, at) => { const k = win(lt, at, at + 0.22); return k <= 0 ? 0 : lerp(1.7, 1, ob(k, 1.2)); };
// red ink stamp (outlined, rough)
function inkStamp(c, s, x, y, o = {}) {
  const sc = o.s ?? 1; if (sc <= 0.01) return;
  c.save(); c.translate(x, y); c.rotate((o.rot ?? -8) * D2R); c.scale(sc, sc); c.globalAlpha *= (o.a ?? 1) * 0.92;
  const fs = o.size ?? 64; c.font = `${fs}px Anton`; c.letterSpacing = "3px";
  const w = c.measureText(s).width, pad = fs * 0.35, col = o.color || "#e2333d";
  c.strokeStyle = col; c.lineWidth = 6; c.strokeRect(-w / 2 - pad, -fs * 0.75, w + 2 * pad, fs * 1.42);
  c.lineWidth = 2.5; c.strokeRect(-w / 2 - pad + 9, -fs * 0.75 + 9, w + 2 * pad - 18, fs * 1.42 - 18);
  c.fillStyle = col; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, 3);
  // worn ink: knock out speckles
  c.globalCompositeOperation = "destination-out"; const R = rng(s.length * 31);
  for (let i = 0; i < 70; i++) { c.beginPath(); c.arc((R() - 0.5) * (w + 2 * pad), (R() - 0.5) * fs * 1.4, R() * 3.2, 0, 7); c.fill(); }
  c.restore();
}
// hand-drawn stroke helpers
function handPath(c, pts, p, o = {}) {
  if (p <= 0) return;
  c.save(); c.strokeStyle = o.color || WHITE; c.lineWidth = o.w ?? 5; c.lineCap = c.lineJoin = "round";
  const n = pts.length - 1, upto = p * n;
  c.beginPath();
  for (let i = 0; i <= Math.ceil(upto) && i <= n; i++) {
    let [x, y] = pts[i]; if (i > upto) { const [x0, y0] = pts[i - 1]; const k = upto - (i - 1); x = lerp(x0, x, k); y = lerp(y0, y, k); }
    x += jit(i * 7 + (o.seed || 0), o.j ?? 1.4); y += jit(i * 13 + (o.seed || 0), o.j ?? 1.4);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke(); c.restore();
}
function arrow(c, x0, y0, cx, cy, x1, y1, p, o = {}) {
  if (p <= 0) return;
  const pts = []; for (let i = 0; i <= 24; i++) { const k = i / 24; pts.push([(1 - k) * (1 - k) * x0 + 2 * (1 - k) * k * cx + k * k * x1, (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * cy + k * k * y1]); }
  handPath(c, pts, oc(p / 0.8), o);
  const hp = win(p, 0.75, 1); if (hp > 0) {
    const a = Math.atan2(y1 - cy, x1 - cx), L = (o.head ?? 26) * hp;
    handPath(c, [[x1 - Math.cos(a - 0.5) * L, y1 - Math.sin(a - 0.5) * L], [x1, y1], [x1 - Math.cos(a + 0.5) * L, y1 - Math.sin(a + 0.5) * L]], 1, o);
  }
}
function scribbleEllipse(c, x, y, rx, ry, p, o = {}) {
  const pts = [], turns = o.turns ?? 1.2; for (let i = 0; i <= 60; i++) { const a = -2.2 + (i / 60) * turns * Math.PI * 2; const r = 1 + 0.06 * Math.sin(i * 0.7); pts.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]); }
  handPath(c, pts, oc(p), o);
}
function scribbleX(c, x, y, w, h, p, o = {}) {
  handPath(c, [[x - w / 2, y - h / 2], [x - w / 6, y - h / 6], [x + w / 6, y + h / 6], [x + w / 2, y + h / 2]], oc(p * 2), o);
  handPath(c, [[x + w / 2, y - h / 2], [x + w / 6, y - h / 6], [x - w / 6, y + h / 6], [x - w / 2, y + h / 2]], oc(p * 2 - 1), { ...o, seed: 9 });
}
function check(c, x, y, s, p, o = {}) { handPath(c, [[x - s * 0.5, y], [x - s * 0.15, y + s * 0.38], [x + s * 0.55, y - s * 0.5]], oc(p), { w: 9, ...o }); }
function underline(c, x, y, w, p, o = {}) { handPath(c, [[x, y], [x + w * 0.5, y + 4], [x + w, y - 2]], oc(p), { w: 5, ...o }); }
// price tag
function priceTag(c, x, y, s, rot, label, sub) {
  if (s <= 0.01) return;
  c.save(); c.translate(x, y); c.rotate(rot * D2R); c.scale(s, s);
  // string
  c.strokeStyle = WHITE; c.lineWidth = 3; c.beginPath(); c.moveTo(-190, -10); c.bezierCurveTo(-240, -60, -250, -110, -230, -150); c.stroke();
  shadow(c, 20, 10, 0.3); c.fillStyle = YEL; c.beginPath();
  c.moveTo(-200, 0); c.lineTo(-130, -85); c.lineTo(170, -85); c.lineTo(170, 85); c.lineTo(-130, 85); c.closePath(); c.fill(); noShadow(c);
  c.globalCompositeOperation = "destination-out"; c.beginPath(); c.arc(-140, 0, 14, 0, 7); c.fill(); c.globalCompositeOperation = "source-over";
  c.strokeStyle = "rgba(43,58,216,0.5)"; c.setLineDash([7, 6]); c.lineWidth = 2; c.strokeRect(-105, -66, 258, 132); c.setLineDash([]);
  c.fillStyle = BLUE_D; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "86px Anton"; c.fillText(label, 25, sub ? -10 : 2);
  if (sub) { c.font = "30px Hand"; c.fillText(sub, 25, 52); }
  c.restore();
}
// torn-edge footage strip (full width)
function strip(c, img, y, h, o = {}) {
  const R = rng(o.seed || 4);
  const top = [], bot = []; for (let x = -20; x <= W + 20; x += 18) { top.push([x, y + (R() - 0.5) * 12]); bot.push([x, y + h + (R() - 0.5) * 12]); }
  c.save(); c.rotate((o.rot || 0) * D2R);
  // paper border
  shadow(c, 30, 12, 0.35); c.fillStyle = PAPER; c.beginPath();
  top.forEach(([x, yy], i) => (i ? c.lineTo(x, yy - 14) : c.moveTo(x, yy - 14))); bot.slice().reverse().forEach(([x, yy]) => c.lineTo(x, yy + 14)); c.closePath(); c.fill(); noShadow(c);
  c.beginPath(); top.forEach(([x, yy], i) => (i ? c.lineTo(x, yy) : c.moveTo(x, yy))); bot.slice().reverse().forEach(([x, yy]) => c.lineTo(x, yy)); c.closePath(); c.clip();
  cover(c, img, -20, y - 10, W + 40, h + 20, o.zoom ?? 1.05, o.panx ?? 0.5, o.pany ?? 0.5);
  c.restore();
}
function donut(c, x, y, r, th, frac, o = {}) {
  dcircle(c, x, y, r, 1, 0, { w: 3, color: "rgba(255,255,255,0.7)" });
  dcircle(c, x, y, r - th, 1, 0, { w: 3, color: "rgba(255,255,255,0.7)" });
  if (frac > 0) { c.save(); c.strokeStyle = YEL; c.lineWidth = th - 10; c.lineCap = "butt"; c.beginPath(); c.arc(x, y, r - th / 2, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.stroke(); c.restore(); }
}
function carIcon(c, x, y, s, fill) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = fill; c.beginPath();
  c.moveTo(-40, 8); c.lineTo(-40, -6); c.quadraticCurveTo(-38, -14, -28, -15); c.lineTo(-18, -30); c.quadraticCurveTo(-14, -34, -6, -34); c.lineTo(14, -34);
  c.quadraticCurveTo(22, -34, 26, -28); c.lineTo(34, -15); c.quadraticCurveTo(42, -13, 42, -4); c.lineTo(42, 8); c.closePath(); c.fill();
  c.fillStyle = BLUE; c.beginPath(); c.moveTo(-14, -15); c.lineTo(-7, -27); c.lineTo(3, -27); c.lineTo(3, -15); c.closePath(); c.moveTo(8, -15); c.lineTo(8, -27); c.lineTo(17, -27); c.lineTo(25, -15); c.closePath(); c.fill();
  c.fillStyle = fill; for (const wx of [-24, 26]) { c.beginPath(); c.arc(wx, 9, 9, 0, 7); c.fill(); }
  c.fillStyle = BLUE; for (const wx of [-24, 26]) { c.beginPath(); c.arc(wx, 9, 3.5, 0, 7); c.fill(); }
  c.restore();
}
function chapter(c, num, title, lt, o = {}) {
  const p = ob(win(lt, 0.05, 0.5), 1.6);
  const x = o.x ?? 150, y = o.y ?? 215;
  dcircle(c, x, y - 28, 68, oc(win(lt, 0.0, 0.6)), 0.2, { w: 2.6 });
  txt(c, num, x, y, { font: "72px Anton", align: "center", color: YEL, s: p });
  kicker(c, title, lt, 0.15, { x: x + 100, size: o.size ?? 96, y: y + 4 });
}
function shake(lt, at, amp = 14, dur = 0.35) { const k = win(lt, at, at + dur); if (k <= 0 || k >= 1) return [0, 0]; const d = (1 - k) * (1 - k) * amp; return [Math.sin(lt * 90) * d, Math.cos(lt * 73) * d]; }

// map projection (SE Asia)
function proj(lon, lat, m) { return [m.x + (lon - m.lon0) * m.k * Math.cos(12 * D2R), m.y + (m.lat0 - lat) * m.k]; }
function countryPath(c, name, m) {
  const f = GEO.find((g) => g.n === name); if (!f) return;
  for (const ring of f.r) { ring.forEach(([lo, la], i) => { const [x, y] = proj(lo, la, m); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); }
}


// ORF explainer — "The Lever Is Price". The whole film is renderAt(t) on one 1080x1920 canvas.
// Look: cobalt paper, yellow starbursts, white dashed guides, B&W polaroids, yellow-outlined cutouts,
// handwritten notes, condensed stamps, serif kickers. Timing comes from build/timeline.json.
(async function () {
const W = 1080, H = 1920;
const BLUE = "#3946f3", BLUE_D = "#2b37d6", YEL = "#fff57b", RED = "#a3262f", PAPER = "#f3f1ea", INK = "#2b3ad8", WHITE = "#ffffff";
const cv = document.getElementById("c"), ctx = cv.getContext("2d");
const TL = await (await fetch("build/timeline.json")).json();
const COUNTS = await (await fetch("build/foot_counts.json")).json();
const GEO = await (await fetch("assets/geo/sea.json")).json();
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
for (const [k, u] of Object.entries({ car: "build/cutouts/car_src.png", ship: "build/cutouts/ship_src.png" })) IMG[k] = await loadImg(u);
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
  return `build/foot/${key}/${String(i).padStart(4, "0")}.jpg`;
}
const KING_N = 110;
function kingURL(lt) { const n = KING_N, k = Math.floor(lt * 24) % (2 * n - 2); const i = k < n ? k : 2 * n - 2 - k; return `build/king/k${String(i + 1).padStart(3, "0")}.png`; }

// --------------------------------------------------------------- textures --
function noiseCanvas(w, h, seed, amp = 255) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"), d = g.createImageData(w, h), r = rng(seed);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * amp; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
}
const GRAIN = [1, 2, 3, 4].map((s) => noiseCanvas(540, 960, s));
const MOTTLE = (() => { const small = noiseCanvas(36, 64, 77, 120); const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.filter = "blur(24px)"; g.drawImage(small, -60, -60, W + 120, H + 120); return c; })();
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
  const vx = g.vx ?? 770, hy = g.hy ?? 880;
  dline(c, vx, 0, vx, H, p);
  dline(c, 0, hy, W, hy, p);
  if (g.circ !== false) { const [x, y, r] = g.circ || [170, 250, 118]; dcircle(c, x, y, r, p, 0.3); }
  if (g.sq !== false) { const [x, y, s] = g.sq || [840, 70, 150]; drect(c, x, y, s, s, p); drect(c, x + 46, y + 44, s, s, p); }
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

// --------------------------------------------------------------- captions --
const CAPMAP = { "thirty-one": "31", "eighty-five": "85", "seventy": "70", "twenty-nine": "29", "fifteen": "15", "A.I.": "AI", "2025,": "2025," };
const CAPS = (() => {
  const words = TL.w.map((w, i) => ({ ...w, i, d: (CAPMAP[w.w] ?? (CAPMAP[w.w.replace(/[.,:]$/, "")] ? CAPMAP[w.w.replace(/[.,:]$/, "")] + w.w.slice(-1) : w.w)) }));
  const chunks = []; let cur = [];
  const endChunk = () => { if (cur.length) chunks.push(cur); cur = []; };
  for (const w of words) {
    if (w.i >= 212) break;
    cur.push(w);
    const len = cur.map((x) => x.d).join(" ").length;
    const punct = /[.:]$/.test(w.w), comma = /,$/.test(w.w);
    if (punct || (comma && len > 12) || len > 24 || cur.length >= 5) endChunk();
  }
  endChunk();
  return chunks.map((ch, k) => ({ words: ch, t0: ch[0].s - 0.06, t1: k + 1 < chunks.length ? Math.min(chunks[k + 1][0].s - 0.06, ch[ch.length - 1].e + 0.5) : ch[ch.length - 1].e + 0.4 }));
})();
function captions(c, t) {
  const ch = CAPS.find((k) => t >= k.t0 && t < k.t1); if (!ch) return;
  const fs = 60; c.save(); c.font = `700 ${fs}px Inter`; c.textBaseline = "middle"; c.letterSpacing = "-0.5px";
  // layout into lines (max 900px)
  const sp = c.measureText(" ").width, lines = [[]]; let lw = 0;
  for (const w of ch.words) { const ww = c.measureText(w.d).width; if (lw + ww > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += ww + sp; }
  const y0 = 1668 - ((lines.length - 1) * fs * 1.18) / 2;
  lines.forEach((ln, li) => {
    const tw = ln.reduce((n, w) => n + w.ww, 0) + sp * (ln.length - 1); let x = W / 2 - tw / 2; const y = y0 + li * fs * 1.18;
    for (const w of ln) {
      const k = win(t, w.s - 0.08, w.s + 0.1); if (k <= 0) { x += w.ww + sp; continue; }
      const s = lerp(0.82, 1, ob(k, 2.4)), dy = (1 - oc(k)) * 14;
      c.save(); c.translate(x + w.ww / 2, y + dy); c.scale(s, s); c.globalAlpha = clamp(k * 1.6);
      c.shadowColor = "rgba(10,14,90,0.55)"; c.shadowBlur = 18; c.shadowOffsetY = 4;
      c.textAlign = "center"; c.lineJoin = "round"; c.strokeStyle = "rgba(14,18,96,0.55)"; c.lineWidth = 9; c.strokeText(w.d, 0, 0); c.shadowColor = "transparent"; c.fillStyle = WHITE; c.fillText(w.d, 0, 0); c.restore();
      x += w.ww + sp;
    }
  });
  c.restore();
}

// ----------------------------------------------------------------- scenes --
const SC = TL.scenes;
const w = (i, S) => WS(i) - S.t0;     // word time relative to scene
const F = (k) => FR[k];
const scenes = {};

// 1. the old playbook -> the playbook changed
scenes.old = { uses: ["forbidden", "loans", "rail", "mega", "chess"], draw(c, lt, S) {
  bg(c); guides(c, lt, { anim: true });
  const fall = (i) => { const k = win(lt, w(19, S) - 0.1 + i * 0.04, w(19, S) + 0.32 + i * 0.04); return [ein(k) * 2000, ein(k) * (i % 2 ? 25 : -25)]; };
  // kicker: "The old playbook" -> "old" struck, "new" written
  kicker(c, "The old playbook", lt, 0.15);
  txt(c, "since the 1960s", 78, 115, { font: "40px Hand", color: YEL, p: win(lt, 0.6, 1.2), rot: -3, a: 1 - win(lt, w(19, S), w(19, S) + 0.2) });
  const ks = w(19, S);
  underline(c, 228, 190, 112, win(lt, ks, ks + 0.25), { color: YEL, w: 7 });
  txt(c, "new!", 235, 132, { font: "64px Hand", color: YEL, rot: -8, s: popS(lt, ks + 0.2) });
  // decorations
  sparkle(c, 120, 520, 150 * popS(lt, 0.35), 0.15, 11);
  sparkle(c, 975, 790, 70 * popS(lt, w(8, S)), -0.2, 12);
  spiky(c, 1000, 1430, 120 * popS(lt, w(10, S) + 0.1), 0.3, 21);
  // polaroids
  const P = [
    ["forbidden", 520, 620, 600, 400, -3, 0.25, "Beijing"],
    ["loans", 790, 1015, 400, 270, 6, w(8, S) - 0.08, "loans"],
    ["rail", 285, 1120, 400, 270, -7, w(9, S) - 0.08, "railways"],
    ["mega", 700, 1330, 430, 280, 3, w(10, S) - 0.08, "megaprojects"],
  ];
  P.forEach(([k, x, y, pw, ph, r, at, cap], i) => {
    const k_ = win(lt, at, at + 0.35); if (k_ <= 0) return;
    const [fy, fr] = fall(i);
    const s = lerp(1.35, 1, ob(k_, 1.4)), rr = r + (1 - oc(k_)) * 14;
    polaroid(c, F(k), x, y + fy - (1 - oc(k_)) * 60, pw, ph, rr + fr, { s, a: clamp(k_ * 3), cap, zoom: 1.06 + 0.05 * win(lt, at, at + 8) });
  });
  // crossings + stamp
  const fy1 = fall(1)[0], fy2 = fall(2)[0], fy3 = fall(3)[0];
  scribbleX(c, 790, 1000 + fy1, 330, 230, win(lt, w(12, S), w(12, S) + 0.5), { color: WHITE, w: 9 });
  scribbleX(c, 285, 1105 + fy2, 330, 230, win(lt, w(15, S), w(15, S) + 0.45), { color: WHITE, w: 9 });
  scribbleX(c, 700, 1315 + fy3, 350, 240, win(lt, w(15, S) + 0.15, w(15, S) + 0.6), { color: WHITE, w: 9 });
  const fs4 = fall(4)[0];
  inkStamp(c, "DEBT DISTRESS", 520, 860 + fs4, { s: slam(lt, w(13, S) + 0.1), rot: -9, size: 70 });
  inkStamp(c, "BACKLASH", 610, 1190 + fs4, { s: slam(lt, w(15, S) + 0.25), rot: 6, size: 60 });
  // new move: chess polaroid
  const ck = win(lt, w(21, S) - 0.1, w(21, S) + 0.4);
  if (ck > 0) {
    polaroid(c, F("chess"), 540, 860 - (1 - oc(ck)) * 900, 720, 470, lerp(-12, 2, ob(ck, 1.3)), { cap: "the new move", tape: true, zoom: 1.08 });
    arrow(c, 870, 1330, 960, 1250, 900, 1160, win(lt, w(22, S), w(22, S) + 0.5), { color: YEL, w: 6 });
    sparkle(c, 140, 1290, 90 * popS(lt, w(22, S)), 0.4, 14);
  }
}};

// 2. title: the new lever is price
scenes.title = { uses: [], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 800, hy: 1290, circ: [190, 330, 130], sq: false });
  const [sx, sy] = shake(lt, w(27, S), 18);
  c.save(); c.translate(sx, sy);
  sparkle(c, 175, 560, 230 * popS(lt, 0.05, 0.5), 0.1, 31);
  sparkle(c, 960, 1360, 140 * popS(lt, w(27, S)), -0.25, 32);
  sparkle(c, 990, 330, 60 * popS(lt, 0.3), 0.3, 33);
  txt(c, "China's new leverage play", 540, 205, { font: "70px Serif", align: "center", a: oc(win(lt, 0.1, 0.5)) });
  const pk = win(lt, 0, 0.4);
  const ps = lerp(1.25, 1, ob(pk, 1.3));
  polaroid(c, null, 540, 830, 760, 900, -2, { s: ps, a: clamp(pk * 3), m: 34, mb: 150, cap: "special report no. 321", capSize: 74, capP: win(lt, 0.4, 1.2), draw: (c, x, y, ww, hh) => {
    c.fillStyle = RED; c.fillRect(x, y, ww, hh);
    c.save(); c.globalAlpha = 0.18; c.globalCompositeOperation = "multiply"; c.fillStyle = c.createPattern(PAPERTEX, "repeat"); c.fillRect(x, y, ww, hh); c.restore();
    c.fillStyle = WHITE; c.textAlign = "center"; c.textBaseline = "alphabetic";
    const words = ["THE", "LEVER", "IS"]; c.font = "150px Anton"; c.letterSpacing = "2px";
    let tw = words.map((q) => c.measureText(q).width); const total = tw.reduce((a, b) => a + b, 0) + 2 * 34; let xx = x + ww / 2 - total / 2;
    words.forEach((q, i) => { const k = win(lt, w(23 + i, S) - 0.05, w(23 + i, S) + 0.25); c.save(); c.globalAlpha = clamp(k * 2); c.textAlign = "left"; c.fillText(q, xx, y + 190 + (1 - oc(k)) * 60); c.restore(); xx += tw[i] + 34; });
    const kk = win(lt, w(27, S) - 0.03, w(27, S) + 0.3);
    if (kk > 0) { c.save(); c.translate(x + ww / 2, y + 640); const s = lerp(2.2, 1, ob(kk, 1.1)); c.scale(s * 0.98, s); c.font = "455px Anton"; c.letterSpacing = "-4px"; const fitk = Math.min(1, (ww - 70) / c.measureText("PRICE").width); c.scale(fitk, 1); c.globalAlpha = clamp(kk * 3); c.fillText("PRICE", 0, 0); c.restore(); }
  }});
  // car cutout drives in
  const carK = win(lt, 0.12, 0.75);
  cutout(c, IMG.car, lerp(1500, 560, oc(carK)), 1260 + Math.sin(lt * 9) * 1.2, 860, -2 * (1 - oc(carK)));
  txt(c, "not loans.", 120, 1480, { font: "54px Hand", rot: -6, p: win(lt, w(27, S) + 0.3, w(27, S) + 0.8) });
  arrow(c, 300, 1450, 360, 1420, 330, 1385, win(lt, w(27, S) + 0.6, w(27, S) + 1.0), { w: 4 });
  c.restore();
}};

// 3. the new model
scenes.model = { uses: ["port", "cranes"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 740, hy: 1260, circ: [960, 240, 90], sq: false });
  kicker(c, "The new model", lt, 0.1);
  txt(c, "state-backed. commercial.", 76, 286, { font: "44px Hand", color: YEL, p: win(lt, w(28, S), w(28, S) + 0.6) });
  const sk = oc(win(lt, 0, 0.45));
  c.save(); c.translate((1 - sk) * W, 0); strip(c, F("port"), 360, 560, { zoom: 1.08 + lt * 0.01, seed: 7 }); c.restore();
  // ship sails across the strip
  cutout(c, IMG.ship, lerp(-180, 1100, win(lt, 0.2, S.t1 - S.t0 + 1)), 860 + Math.sin(lt * 2) * 3, 340, -4);
  const pk = win(lt, 0.5, 0.85);
  if (pk > 0) polaroid(c, F("cranes"), 300, 1175, 430, 290, -5, { s: lerp(1.3, 1, ob(pk)), a: clamp(pk * 3), cap: "overcapacity, exported" });
  stamp(c, "SUBSIDIES", 820, 1000, { s: slam(lt, w(32, S)), rot: -3, size: 52 });
  stamp(c, "OVERCAPACITY", 820, 1112, { s: slam(lt, w(34, S)), rot: 2, size: 52 });
  const tk = win(lt, w(36, S) - 0.05, w(36, S) + 0.6);
  priceTag(c, 850, 1290, ob(tk, 1.5) * 0.82, -8 + Math.sin(lt * 5) * 4 * (1 - win(lt, w(36, S), w(36, S) + 2)), "CHEAP", "arrives cheaper");
  // market share pie sticker
  const mk = popS(lt, w(38, S));
  if (mk > 0.01) {
    c.save(); c.translate(900, 420); c.scale(mk, mk); shadow(c, 20, 8, 0.3); c.fillStyle = PAPER; c.beginPath(); c.arc(0, 0, 105, 0, 7); c.fill(); noShadow(c);
    const f = oc(win(lt, w(38, S) + 0.1, w(41, S))) * 0.62; c.fillStyle = YEL; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 86, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); c.closePath(); c.fill();
    c.strokeStyle = BLUE_D; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 86, 0, 7); c.stroke();
    c.restore();
    txt(c, "market share", 900, 560, { font: "40px Hand", align: "center", p: win(lt, w(38, S), w(39, S) + 0.3) });
  }
  inkStamp(c, "EMBEDDED", 560, 1440, { s: slam(lt, w(41, S) + 0.05), rot: -6, size: 84, color: YEL });
  sparkle(c, 100, 1020, 80 * popS(lt, 0.6), 0.3, 41);
}};

// 4. why thailand (map)
const MAP = { x: 70, y: 300, lon0: 91.5, lat0: 25.5, k: 31 };
scenes.thailand = { uses: ["robot", "chinatown"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 905, hy: 1530, circ: false, sq: [820, 70, 140] });
  kicker(c, "Why Thailand?", lt, 0.1, { size: 104 });
  const m = MAP;
  // land
  const [tcx, tcy] = proj(101, 14.5, m);
  const rev = oc(win(lt, 0.1, 1.1));
  c.save(); c.beginPath(); c.arc(tcx, tcy, 60 + rev * 1400, 0, 7); c.clip();
  c.beginPath(); for (const g of GEO) { if (g.n === "Thailand") continue; countryPath(c, g.n, m); }
  c.fillStyle = "rgba(255,255,255,0.10)"; c.fill("evenodd"); c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = 2.2; c.lineJoin = "round"; c.stroke();
  c.restore();
  // labels
  const lab = (s, lon, lat, at, o = {}) => { const [x, y] = proj(lon, lat, m); txt(c, s, x, y, { font: `${o.size ?? 40}px Hand`, align: "center", a: oc(win(lt, at, at + 0.4)) * (o.a ?? 0.85), color: o.color, rot: o.rot }); };
  lab("CHINA", 108, 23.5, 0.6, { size: 52, a: 1 });
  lab("MYANMAR", 96, 21.5, 0.8); lab("VIETNAM", 107.2, 15.5, 0.85, { rot: 60 }); lab("MALAYSIA", 113.5, 3.2, 0.9); lab("INDONESIA", 104, -1.5, 0.95); lab("CAMBODIA", 105, 12.4, 0.9, { size: 30 });
  // thailand
  const tk = win(lt, w(49, S) - 0.05, w(49, S) + 0.4);
  if (tk > 0) {
    c.save(); c.translate(tcx, tcy); const s = lerp(1.25, 1, ob(tk, 2)); c.scale(s, s); c.translate(-tcx, -tcy);
    c.beginPath(); countryPath(c, "Thailand", m); shadow(c, 24, 10, 0.35); c.fillStyle = YEL; c.fill(); noShadow(c); c.restore();
    const pr = win(lt, w(49, S), w(49, S) + 0.9); c.save(); c.strokeStyle = `rgba(255,245,123,${1 - pr})`; c.lineWidth = 4; c.beginPath(); c.arc(tcx, tcy, 40 + pr * 260, 0, 7); c.stroke(); c.restore();
    stamp(c, "THAILAND", tcx - 210, tcy - 120, { s: popS(lt, w(49, S) + 0.1), rot: -4, size: 50, fill: RED, color: WHITE });
  }
  // shipping lane through Malacca
  const lane = [[90, 5.5], [95, 6], [98.5, 4.8], [100.6, 2.9], [103.3, 1.25], [104.6, 1.6], [106.5, 5], [110, 10.5], [114, 16.5], [118, 21.5], [121, 25]].map(([lo, la]) => proj(lo, la, m));
  const lp = win(lt, w(51, S) - 0.1, w(55, S) + 0.3);
  if (lp > 0) {
    const n = lane.length - 1, upto = oc(lp) * n;
    dashed(c, (c) => { for (let i = 0; i <= Math.ceil(upto) && i <= n; i++) { let [x, y] = lane[i]; if (i > upto) { const [x0, y0] = lane[i - 1]; const k = upto - (i - 1); x = lerp(x0, x, k); y = lerp(y0, y, k); } i ? c.lineTo(x, y) : c.moveTo(x, y); } }, { w: 4, dash: [16, 12], off: -lt * 40 });
  }
  const [mx, my] = proj(100.9, 2.9, m);
  scribbleEllipse(c, mx, my, 95, 60, win(lt, w(54, S), w(54, S) + 0.5), { color: YEL, w: 6 });
  txt(c, "MALACCA\nSTRAIT", mx - 150, my + 12, { font: "48px Anton", color: YEL, align: "right", lh: 50, a: oc(win(lt, w(54, S) + 0.2, w(54, S) + 0.6)) });
  txt(c, "≈80% of China's\ncrude imports", mx + 115, my + 40, { font: "36px Hand", align: "left", lh: 40, p: win(lt, w(55, S), w(56, S) + 0.5) });
  // kra isthmus land bridge
  const [k1x, k1y] = proj(98.4, 9.95, m), [k2x, k2y] = proj(99.6, 10.3, m);
  dline(c, k1x - 20, k1y, k2x + 20, k2y, win(lt, w(55, S), w(55, S) + 0.4), { color: YEL, w: 5, dash: [8, 6] });
  // polaroids
  const p1 = win(lt, w(57, S) - 0.08, w(57, S) + 0.3);
  if (p1 > 0) polaroid(c, F("robot"), 830, 1230, 360, 240, 5, { s: lerp(1.35, 1, ob(p1)), a: clamp(p1 * 3), cap: "manufacturing hub" });
  const p2 = win(lt, w(63, S) - 0.08, w(63, S) + 0.3);
  if (p2 > 0) polaroid(c, F("chinatown"), 300, 1330, 360, 240, -6, { s: lerp(1.35, 1, ob(p2)), a: clamp(p2 * 3), cap: "overseas Chinese" });
  txt(c, "~15% of Thais claim\nChinese ancestry", 540, 1450, { font: "36px Hand", color: YEL, lh: 40, p: win(lt, w(65, S), w(66, S) + 0.5), rot: -2 });
  sparkle(c, 980, 560, 70 * popS(lt, 0.5), 0.2, 51);
}};

// 5. follow the money: 31%
scenes.money = { uses: ["skyline"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 160, hy: 1240, circ: false, sq: [860, 1300, 130] });
  kicker(c, "Follow the money", lt, 0.1);
  const pk = win(lt, 0.15, 0.5);
  if (pk > 0) polaroid(c, F("skyline"), 820, 1210, 400, 270, 6, { s: lerp(1.3, 1, ob(pk)), a: clamp(pk * 3), cap: "Thailand, 2025" });
  stamp(c, "CHINA + HONG KONG", 430, 400, { s: slam(lt, w(69, S)), rot: -2, size: 50 });
  const dk = win(lt, w(75, S) - 0.1, w(75, S) + 1.0);
  const r = 270, cx = 440, cy = 760;
  c.save(); const ds = lerp(0.6, 1, ob(win(lt, 0.2, 0.7))); c.translate(cx, cy); c.scale(ds, ds); c.translate(-cx, -cy);
  donut(c, cx, cy, r, 76, oc(dk) * 0.31);
  const val = Math.round(oc(dk) * 31);
  txt(c, `${val}%`, cx, cy + 62, { font: "180px Anton", color: YEL, align: "center", a: clamp(win(lt, w(75, S) - 0.2, w(75, S)) * 2) });
  c.restore();
  txt(c, "of all foreign investment\napplications into Thailand", 92, 1160, { font: "46px Hand", lh: 54, p: win(lt, w(77, S), w(80, S) + 0.3) });
  inkStamp(c, "US$13.4 BN", 330, 1400, { s: slam(lt, w(80, S)), rot: -7, size: 66, color: YEL });
  sparkle(c, 930, 450, 110 * popS(lt, 0.3), 0.2, 61);
  spiky(c, 130, 1440, 70 * popS(lt, w(75, S) + 0.6), 0.1, 62);
}};

// 6. anutin's july visit
scenes.visit = { uses: ["shanghai", "handshake"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 600, hy: 1490, circ: [940, 205, 85], sq: false });
  kicker(c, "July 2026", lt, 0.1);
  txt(c, "PM Anutin · five days in China", 76, 290, { font: "44px Hand", color: YEL, p: win(lt, w(84, S), w(87, S)) });
  const sk = oc(win(lt, 0, 0.45));
  c.save(); c.translate(-(1 - sk) * W, 0); strip(c, F("shanghai"), 360, 400, { seed: 12, zoom: 1.1 - lt * 0.005 }); c.restore();
  // china mini-map with route
  const m = { x: 400, y: 820, lon0: 73, lat0: 54, k: 9.6 };
  const mk = oc(win(lt, 0.3, 0.9));
  c.save(); c.globalAlpha = mk; c.beginPath(); countryPath(c, "China", m); c.fillStyle = "rgba(255,255,255,0.10)"; c.fill(); c.strokeStyle = "rgba(255,255,255,0.9)"; c.lineWidth = 2.4; c.stroke(); c.restore();
  const city = { Beijing: [116.4, 39.9], Shanghai: [121.47, 31.23], Chengdu: [104.07, 30.67] };
  const order = [["Beijing", w(83, S)], ["Shanghai", w(87, S)], ["Chengdu", w(88, S)]];
  const pts = order.map(([n]) => proj(...city[n], m));
  for (let i = 0; i < 2; i++) { const k = win(lt, order[i][1] + 0.1, order[i + 1][1]); dline(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], oc(k), { color: YEL, w: 4, dash: [10, 8] }); }
  order.forEach(([n, at], i) => {
    const s = popS(lt, at); if (s <= 0.01) return; const [x, y] = pts[i];
    c.save(); c.fillStyle = YEL; c.beginPath(); c.arc(x, y, 11 * s, 0, 7); c.fill(); c.restore();
    txt(c, n, x + (i === 2 ? -18 : 18), y + (i === 1 ? 40 : -16), { font: "38px Hand", align: i === 2 ? "right" : "left", s });
  });
  const hk = win(lt, w(84, S) - 0.1, w(84, S) + 0.3);
  if (hk > 0) polaroid(c, F("handshake"), 230, 1010, 360, 240, -6, { s: lerp(1.3, 1, ob(hk)), a: clamp(hk * 3), cap: "signed, sealed" });
  // 15+ agreements: paper fan
  const fk = win(lt, w(91, S) - 0.1, w(91, S) + 0.8);
  for (let i = 0; i < 15; i++) {
    const k = oc(win(fk, i / 22, i / 22 + 0.4)); if (k <= 0) continue;
    const a = (-50 + i * 7) * D2R;
    c.save(); c.translate(330, 1480); c.rotate(a * k); c.translate(0, -(1 - k) * -300); shadow(c, 10, 4, 0.25); c.fillStyle = PAPER; c.fillRect(-60, -230, 120, 160); noShadow(c);
    c.fillStyle = "rgba(43,58,216,0.35)"; for (let l = 0; l < 6; l++) c.fillRect(-42, -208 + l * 20, l === 0 ? 60 : 84, 5); c.restore();
  }
  const nk = win(lt, w(91, S), w(91, S) + 0.6);
  txt(c, `${Math.round(oc(nk) * 15)}+`, 330, 1450, { font: "220px Anton", color: YEL, align: "center", a: clamp(nk * 3), shadow: true });
  stamp(c, "COOPERATION AGREEMENTS", 760, 1400, { s: slam(lt, w(92, S) + 0.1), rot: -3, size: 40 });
  sparkle(c, 1000, 1240, 70 * popS(lt, w(91, S) + 0.3), 0.3, 71);
}};

// 7. cars / detroit of asia / japanese share
scenes.cars = { uses: ["traffic", "arm"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 600, hy: 1480, circ: false, sq: [860, 60, 140] });
  chapter(c, "01", "Cars", lt);
  const sk = oc(win(lt, 0.05, 0.5));
  c.save(); c.translate((1 - sk) * W, 0); strip(c, F("traffic"), 370, 420, { seed: 19, zoom: 1.08 }); c.restore();
  const ak = win(lt, w(97, S) - 0.1, w(97, S) + 0.3);
  if (ak > 0) polaroid(c, F("arm"), 290, 1200, 420, 280, -4, { s: lerp(1.3, 1, ob(ak)), a: clamp(ak * 3), cap: "built in Thailand" });
  txt(c, "the Detroit of Asia", 80, 905, { font: "62px Hand", color: YEL, lh: 64, p: win(lt, w(99, S), w(101, S) + 0.3), rot: -3 });
  arrow(c, 470, 930, 560, 960, 500, 1030, win(lt, w(101, S), w(101, S) + 0.5), { color: YEL, w: 5 });
  stamp(c, "~10% OF GDP", 840, 860, { s: slam(lt, w(101, S) + 0.3), rot: 3, size: 46 });
  // bar: japanese share
  const bx = 690, base = 1450, maxH = 420;
  const bk = win(lt, w(105, S), w(107, S) + 0.6);
  dline(c, 640, base, 1040, base, oc(win(lt, w(102, S) - 0.2, w(102, S) + 0.3)), { w: 3, dash: [10, 8] });
  if (bk > 0) {
    const hh = oc(bk) * maxH * 0.85;
    c.save(); shadow(c, 16, 8, 0.25); c.fillStyle = PAPER; c.fillRect(bx, base - hh, 300, hh); noShadow(c);
    c.save(); c.beginPath(); c.rect(bx, base - hh, 300, hh); c.clip(); c.strokeStyle = "rgba(43,58,216,0.18)"; c.lineWidth = 10; for (let i = -10; i < 30; i++) { c.beginPath(); c.moveTo(bx + i * 30, base); c.lineTo(bx + i * 30 + 300, base - 300); c.stroke(); } c.restore();
    c.restore();
    txt(c, `${Math.round(oc(bk) * 85)}%+`, bx + 150, base - hh - 26, { font: "110px Anton", color: YEL, align: "center" });
    txt(c, "JAPANESE BRANDS", bx + 150, base - 40, { font: "36px Anton", color: BLUE_D, align: "center", a: oc(bk), ls: 1 });
    txt(c, "2010s", bx + 150, base + 50, { font: "40px Hand", align: "center", a: oc(bk) });
  }
}};

// 8. EVs: 70%+ chinese, 28.7% price edge
scenes.ev = { uses: ["evplug"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 400, hy: 900, circ: [160, 1440, 90], sq: false });
  kicker(c, "Today", lt, 0.05);
  txt(c, "Thailand's EV market", 76, 290, { font: "44px Hand", color: YEL, p: win(lt, w(122, S), w(124, S) + 0.3) });
  const pk = win(lt, 0.1, 0.5);
  if (pk > 0) polaroid(c, F("evplug"), 700, 560, 560, 370, 4, { s: lerp(1.3, 1, ob(pk)), a: clamp(pk * 3), cap: "plugged in", tape: true });
  const nk = win(lt, w(118, S) - 0.15, w(118, S) + 0.9);
  txt(c, `${Math.round(oc(nk) * 70)}%+`, 330, 1070, { font: "250px Anton", color: YEL, align: "center", a: clamp(nk * 4), shadow: true });
  txt(c, "made by Chinese brands", 330, 1150, { font: "44px Hand", align: "center", p: win(lt, w(119, S), w(124, S)) });
  // 10 car icons, 7 turn yellow
  for (let i = 0; i < 10; i++) {
    const at = w(115, S) + i * 0.05; const s = popS(lt, at, 0.35); if (s <= 0.01) continue;
    const yk = win(lt, w(118, S) + i * 0.09, w(118, S) + i * 0.09 + 0.15);
    const col = i < 7 && yk > 0 ? YEL : "rgba(255,255,255,0.92)";
    carIcon(c, 100 + i * 98, 1330, 1.05 * s, col);
  }
  txt(c, "out of every 10 EVs sold", 540, 1430, { font: "36px Hand", align: "center", a: oc(win(lt, w(119, S), w(119, S) + 0.5)) * 0.9 });
  const tk = win(lt, w(128, S) - 0.1, w(128, S) + 0.5);
  priceTag(c, 840, 1160, ob(tk, 1.6) * 0.82, -10 + Math.sin(lt * 6) * 5 * (1 - win(lt, w(128, S), w(128, S) + 2.5)), "−28.7%", "price edge");
}};

// 9. AI
scenes.ai = { uses: ["dc", "chip"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 540, hy: 1500, circ: false, sq: [860, 60, 140] });
  chapter(c, "02", "AI", lt);
  const sk = oc(win(lt, 0.05, 0.5));
  c.save(); c.translate(0, (1 - sk) * 1200); strip(c, F("dc"), 360, 460, { seed: 23, zoom: 1.12 - lt * 0.006 }); c.restore();
  const ck = win(lt, 0.6, 0.95);
  if (ck > 0) polaroid(c, F("chip"), 860, 360, 300, 200, 7, { s: lerp(1.3, 1, ob(ck)), a: clamp(ck * 3) });
  // two columns
  const col = (x, title, big, sub, at, up, color) => {
    const k = win(lt, at - 0.1, at + 0.35); if (k <= 0) return;
    stamp(c, title, x, 960, { s: lerp(1.3, 1, ob(k)), size: 44, color });
    const ak = win(lt, at, at + 0.5);
    const y0 = up ? 1170 : 1040, y1 = up ? 1040 : 1170;
    handPath(c, [[x - 170, y0], [x - 170, y1]], oc(ak), { color, w: 8 });
    handPath(c, [[x - 196, y1 + (up ? 28 : -28)], [x - 170, y1], [x - 144, y1 + (up ? 28 : -28)]], win(ak, 0.6, 1), { color, w: 8 });
    txt(c, big, x + 20, 1140, { font: "96px Anton", color, align: "center", a: oc(k) });
    txt(c, sub, x + 20, 1210, { font: "38px Hand", color: WHITE, align: "center", p: win(lt, at + 0.2, at + 0.8) });
  };
  col(275, "WESTERN AI", "+30%", "metered pricing", w(137, S), true, WHITE);
  col(805, "CHINESE AI", "CHEAP", "open-weight", w(141, S), false, YEL);
  stamp(c, "CHINESE-LINKED CAPITAL", 540, 1330, { s: slam(lt, w(147, S)), rot: -2, size: 46, fill: RED, color: WHITE });
  // data-centre sticker on strip
  const dk = popS(lt, w(152, S));
  if (dk > 0.01) { c.save(); c.translate(760, 790); c.rotate(-4 * D2R); c.scale(dk, dk); shadow(c, 18, 8, 0.3); c.fillStyle = YEL; c.fillRect(-235, -62, 470, 124); noShadow(c);
    c.fillStyle = BLUE_D; c.font = "64px Anton"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("350 MW → 1 GW", 0, -8); c.font = "28px Hand"; c.fillText("data-centre capacity by 2027", 0, 40); c.restore(); }
  // glitch slices on entry
  if (lt < 0.35) { const R = rng(Math.floor(lt * 30) + 5); for (let i = 0; i < 6; i++) { const y = R() * H, h = 20 + R() * 80; c.drawImage(c.canvas, 0, y, W, h, (R() - 0.5) * 60, y, W, h); } }
}};

// 10. bangkok pushed back
scenes.push = { uses: ["flags", "ship", "parcels"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 470, hy: 1500, circ: [960, 200, 80], sq: false });
  kicker(c, "Bangkok pushed back.", lt, 0.1, { size: 84 });
  // dashed placeholders for the three decisions, drawn before the cards land
  [500, 850, 1200].forEach((y, i) => { const at = [w(159, S), w(167, S), w(174, S)][i]; const pk = oc(win(lt, 0.25 + i * 0.15, 0.7 + i * 0.15)) * (1 - win(lt, at - 0.05, at + 0.1));
    if (pk > 0) { drect(c, 60, y - 150, 960 * pk, 300, 1, { w: 2.6, dash: [12, 10] }); txt(c, String(i + 1), 110, y + 30, { font: "120px Anton", color: YEL, a: pk * 0.9 }); } });
  const card = (y, key, title, sub, stampTxt, at, stAt, rot) => {
    const k = win(lt, at - 0.08, at + 0.32); if (k <= 0) return;
    c.save(); c.translate(540 + (1 - oc(k)) * 900, y); c.rotate((rot + (1 - oc(k)) * 8) * D2R);
    shadow(c, 30, 14, 0.35); c.fillStyle = PAPER; c.fillRect(-480, -150, 960, 300); noShadow(c);
    c.save(); c.globalAlpha = 0.3; c.globalCompositeOperation = "multiply"; c.fillStyle = c.createPattern(PAPERTEX, "repeat"); c.fillRect(-480, -150, 960, 300); c.restore();
    c.save(); c.beginPath(); c.rect(-462, -132, 400, 264); c.clip(); cover(c, F(key), -462, -132, 400, 264, 1.08); c.restore();
    txt(c, title, -30, -38, { font: "74px Anton", color: BLUE_D });
    txt(c, sub, -28, 30, { font: "600 32px Inter", color: "#33333a", lh: 42 });
    c.restore();
    inkStamp(c, stampTxt, 540 - 262, y + 60, { s: slam(lt, stAt), rot: -10 + rot, size: 54 });
  };
  card(500, "flags", "WAICO", "China-led AI body.\n29 signed. Thailand didn't.", "NOT SIGNED", w(159, S), w(164, S) + 0.1, -2);
  card(850, "ship", "LAND BRIDGE", "~1 trillion baht corridor.\nPanel: scrap it.", "SHELVED", w(167, S), w(170, S) + 0.1, 1.5);
  card(1200, "parcels", "CHEAP PARCELS", "Low-value imports.\nTax rules tightened.", "TAXED", w(174, S), w(175, S) + 0.1, -1.5);
  sparkle(c, 90, 1420, 70 * popS(lt, w(177, S)), 0.2, 81);
}};

// 11. standards
scenes.standards = { uses: ["plug", "fiber"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 880, hy: 940, circ: false, sq: [870, 1380, 120] });
  chapter(c, "03", "Standards", lt, { size: 92 });
  txt(c, "the real contest", 255, 290, { font: "44px Hand", color: YEL, p: win(lt, w(180, S), w(183, S)) });
  // what "standards" means: three stamps, cleared when the plug lands
  const clr = 1 - win(lt, w(184, S) - 0.3, w(184, S));
  if (clr > 0) [["CONNECTORS", 179, 560, -4], ["CERTIFICATION", 181, 720, 3], ["PROTOCOLS", 182, 880, -2], ["DATA RULES", 183, 1040, 4]].forEach(([q, i, y, r]) =>
    stamp(c, q, 540, y, { s: slam(lt, w(i, S)) * lerp(0.6, 1, clr), a: clr, rot: r, size: 84 }));
  const a = win(lt, w(184, S) - 0.1, w(184, S) + 0.3);
  if (a > 0) polaroid(c, F("plug"), 470, 640, 560, 340, -3, { s: lerp(1.3, 1, ob(a)), a: clamp(a * 3), cap: "charging plug" });
  txt(c, "Type 2 / CCS2\nnot China's GB/T", 790, 560, { font: "38px Hand", lh: 44, p: win(lt, w(185, S), w(189, S)), rot: 4 });
  check(c, 860, 760, 90, win(lt, w(192, S), w(192, S) + 0.4), { color: YEL });
  txt(c, "fix: a dongle", 790, 880, { font: "44px Hand", color: YEL, p: win(lt, w(192, S), w(192, S) + 0.5), rot: 3 });
  const b = win(lt, w(193, S) - 0.1, w(193, S) + 0.3);
  if (b > 0) polaroid(c, F("fiber"), 560, 1185, 600, 360, 3, { s: lerp(1.3, 1, ob(b)), a: clamp(b * 3), cap: "data architecture" });
  scribbleX(c, 560, 1160, 460, 300, win(lt, w(196, S), w(196, S) + 0.45), { color: YEL, w: 12 });
  inkStamp(c, "NO DONGLE FOR THIS", 560, 1420, { s: slam(lt, w(196, S) + 0.15), rot: -5, size: 58 });
  sparkle(c, 110, 1010, 80 * popS(lt, w(184, S)), 0.1, 91);
}};

// 12. close: chess king
scenes.close = { uses: ["globe"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 720, hy: 1320, circ: false, sq: false });
  kicker(c, "The test case", lt, 0.1, { size: 80 });
  spiky(c, 360, 1210, 300 * popS(lt, 0.2, 0.6), 0.2 + lt * 0.03, 101, 11);
  dcircle(c, 360, 860, 430, oc(win(lt, 0.1, 1.0)), lt * 0.15, { w: 3 });
  const ki = FR.__king; const kk = oc(win(lt, 0, 0.7));
  if (ki) { const kw = 640, kh = (ki.height / ki.width) * kw; c.save(); c.translate(360, 900 + (1 - kk) * 900); shadow(c, 30, 14, 0.35); c.drawImage(ki, -kw / 2, -kh / 2, kw, kh); noShadow(c); c.restore(); }
  const gk = win(lt, w(205, S) - 0.1, w(205, S) + 0.3);
  if (gk > 0) polaroid(c, F("globe"), 860, 470, 330, 220, 6, { s: lerp(1.3, 1, ob(gk)), a: clamp(gk * 3), cap: "everyone else" });
  arrow(c, 760, 680, 700, 720, 640, 700, win(lt, w(205, S) + 0.1, w(206, S) + 0.3), { color: YEL, w: 5 });
  // serif column, word by word
  const col = [["Sooner,", 207], ["and", 208], ["with", 209], ["less", 210], ["warning.", 211]];
  col.forEach(([s, i], k) => { const p = win(lt, w(i, S) - 0.05, w(i, S) + 0.25); txt(c, s, 770, 830 + k * 92, { font: `${k === 4 ? "SerifI" : "Serif"}`.replace(/^/, "88px "), a: oc(p), s: lerp(0.9, 1, oc(p)) }); });
  underline(c, 770, 1235, 280, win(lt, w(211, S) + 0.2, w(211, S) + 0.6), { color: YEL, w: 6 });
  sparkle(c, 1000, 1180, 60 * popS(lt, w(211, S) + 0.3), 0.1, 102);
}};

// 13. end card
scenes.end = { uses: ["endport"], draw(c, lt, S) {
  bg(c); guides(c, lt, { vx: 760, hy: 1250, circ: [170, 240, 115], sq: [840, 70, 150] });
  const [sx, sy] = shake(lt, w(213, S), 10);
  c.save(); c.translate(sx, sy);
  sparkle(c, 140, 1130, 130 * popS(lt, 0.15), 0.1, 111);
  const pk = win(lt, 0.25, 0.6);
  if (pk > 0) polaroid(c, F("endport"), 790, 1170, 400, 300, 7, { s: lerp(1.3, 1, ob(pk)), a: clamp(pk * 3), cap: "special report no. 321" });
  const L = [["THE LEVER", 212, 360, WHITE], ["IS PRICE", 214, 560, YEL]];
  L.forEach(([s, i, y, col]) => { const k = win(lt, w(i, S) - 0.05, w(i, S) + 0.3); if (k <= 0) return; txt(c, s, 70, y + (1 - oc(k)) * 40, { font: "196px Anton", color: col, a: clamp(k * 3), ls: 2 }); });
  txt(c, "China's New Leverage Play\nin Thailand", 74, 680, { font: "66px Serif", lh: 72, a: oc(win(lt, w(215, S) + 0.2, w(215, S) + 0.7)) });
  txt(c, "Jaibal Naduvath", 76, 900, { font: "600 40px Inter", a: oc(win(lt, w(216, S), w(216, S) + 0.5)) });
  txt(c, "September 2026", 76, 952, { font: "500 34px Inter", color: "rgba(255,255,255,0.8)", a: oc(win(lt, w(216, S) + 0.1, w(216, S) + 0.6)) });
  cutout(c, IMG.car, lerp(-500, 300, oc(win(lt, 0.4, 1.1))), 1250, 560, -3);
  const ok = win(lt, w(221, S) - 0.1, w(221, S) + 0.4);
  stamp(c, "OBSERVER RESEARCH FOUNDATION", 540, 1560, { s: lerp(1.2, 1, ob(ok)), a: clamp(ok * 3), size: 54, ls: 3, fill: PAPER, color: BLUE_D });
  txt(c, "read the full report → orfonline.org", 540, 1690, { font: "50px Hand", align: "center", p: win(lt, w(223, S), w(223, S) + 1.0) });
  spiky(c, 980, 400, 90 * popS(lt, w(214, S)), 0.2, 112);
  c.restore();
}};

// ------------------------------------------------------------ transitions --
const SCN = Object.keys(SC);
const bufA = document.createElement("canvas"); bufA.width = W; bufA.height = H; const A = bufA.getContext("2d");
const bufB = document.createElement("canvas"); bufB.width = W; bufB.height = H; const Bc = bufB.getContext("2d");
function drawScene(c, name, t) {
  const S = SC[name]; const lt = t - S.t0; const dur = S.t1 - S.t0;
  c.save();
  // slow push-in camera
  const z = 1 + 0.025 * clamp(lt / dur);
  c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  scenes[name].draw(c, lt, S);
  c.restore();
}
function tornEdge(y, seed) { const R = rng(seed); const pts = []; for (let x = -20; x <= W + 20; x += 22) pts.push([x, y + (R() - 0.5) * 34]); return pts; }
function composite(c, tr, t, prev, next) {
  const p = clamp((t - (tr.at - tr.d / 2)) / tr.d);
  if (tr.type === "whip") {
    const e = io(p);
    drawScene(A, prev, t); drawScene(Bc, next, t);
    const blur = Math.sin(p * Math.PI) * 26;
    c.filter = blur > 1 ? `blur(${blur.toFixed(1)}px)` : "none";
    c.drawImage(bufA, 0, -e * H); c.drawImage(bufB, 0, H - e * H); c.filter = "none";
  } else if (tr.type === "slide") {
    const e = io(p); drawScene(A, prev, t); drawScene(Bc, next, t);
    c.drawImage(bufA, -e * W * 0.3, 0); c.fillStyle = `rgba(0,0,40,${0.4 * e})`; c.fillRect(0, 0, W, H);
    c.save(); shadow(c, 40, 0, 0.5); c.shadowOffsetX = -10; c.drawImage(bufB, W - e * W, 0); c.restore();
  } else if (tr.type === "rip") {
    const e = io(p); drawScene(A, prev, t); drawScene(Bc, next, t);
    c.drawImage(bufB, 0, 0);
    const y = lerp(-80, H + 80, e); const edge = tornEdge(0, Math.floor(tr.at * 10));
    c.save(); c.beginPath(); c.moveTo(-20, H + 200); edge.forEach(([x, yy]) => c.lineTo(x, y + yy)); c.lineTo(W + 20, H + 200); c.closePath();
    // paper edge band
    c.save(); c.translate(0, -16); c.fillStyle = PAPER; shadow(c, 30, -6, 0.4); c.fill(); c.restore(); noShadow(c);
    c.clip(); c.drawImage(bufA, 0, 0, W, H); c.restore();
  } else if (tr.type === "burst") {
    if (p < 0.5) { drawScene(c, prev, t); } else { drawScene(c, next, t); }
    const r = p < 0.5 ? lerp(0, 2300, ein(p * 2)) : lerp(2300, 4200, oc((p - 0.5) * 2));
    c.save(); c.globalAlpha = p < 0.5 ? 1 : 1 - oc((p - 0.5) * 2.2); sparkle(c, W / 2, H / 2, r, p * 1.2, 7); c.restore();
  } else if (tr.type === "glitch") {
    const src = p < 0.5 ? prev : next; drawScene(A, src, t);
    c.drawImage(bufA, 0, 0);
    const R = rng(Math.floor(t * 30) * 7 + 3), amt = Math.sin(p * Math.PI);
    for (let i = 0; i < 14; i++) { const y = R() * H, h = 10 + R() * 120; const dx = (R() - 0.5) * 160 * amt; c.drawImage(bufA, 0, y, W, h, dx, y, W, h); }
    c.save(); c.globalCompositeOperation = "screen"; c.globalAlpha = 0.5 * amt; c.drawImage(bufA, 14 * amt, 0); c.restore();
  }
}
// ----------------------------------------------------------------- render --
async function prefetch(t) {
  const need = new Set();
  for (const n of SCN) { const S = SC[n]; if (t >= S.t0 - 0.6 && t <= S.t1 + 0.6) scenes[n].uses.forEach((k) => need.add(k)); }
  await Promise.all([...need].map(async (k) => { FR[k] = await loadImg(frameURL(k, t)); }));
  const S = SC.close; if (t >= S.t0 - 0.6 && t <= S.t1 + 0.6) FR.__king = await loadImg(kingURL(Math.max(0, t - S.t0)));
}
window.renderAt = async function (t) {
  NOW = t; await prefetch(t);
  const c = ctx; c.save(); c.clearRect(0, 0, W, H);
  const tr = TL.trans.find((x) => t >= x.at - x.d / 2 && t < x.at + x.d / 2);
  if (tr) { const i = SCN.indexOf(tr.to); composite(c, tr, t, SCN[i - 1], tr.to); }
  else { const n = SCN.find((k) => t >= SC[k].t0 && t < SC[k].t1) || SCN[SCN.length - 1]; drawScene(c, n, t); }
  captions(c, t);
  // global film grain + vignette + fades
  c.save(); c.globalAlpha = 0.13; c.globalCompositeOperation = "overlay"; c.imageSmoothingEnabled = false; c.drawImage(GRAIN[Math.floor(t * 12) % 4], 0, 0, W, H); c.restore();
  const vg = c.createRadialGradient(W / 2, H / 2, 600, W / 2, H / 2, 1250); vg.addColorStop(0, "rgba(0,0,30,0)"); vg.addColorStop(1, "rgba(0,0,30,0.28)"); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  const fin = 1 - win(t, 0, 0.35), fout = win(t, TL.dur - 0.5, TL.dur);
  if (fin > 0 || fout > 0) { c.fillStyle = `rgba(0,0,0,${Math.max(fin, fout)})`; c.fillRect(0, 0, W, H); }
  c.restore();
  return true;
};
window.frameJPEG = (q = 0.94) => cv.toDataURL("image/jpeg", q);
window.stageReady = true;
})().catch((e) => { console.error(e); window.stageError = String(e && e.stack || e); });

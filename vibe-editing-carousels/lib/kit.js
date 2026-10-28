// The kit engine: carousels with their own design system and a free layout per slide.
// A carousel file sets window.CAROUSEL = { kit: true, fonts, images, slides } where each
// slide is { dur, bg(c, t, S), els: [element], fg(c, t, S) }.
// An element is { x, y, rot, in, at, out, float, draw(c, t, lt, S) }: the kit places it at
// (x, y), plays its entrance (`in`: pop, up, down, left, right, drop, fade, grow, none),
// floats it gently, and takes it out in the last 0.32 s so every slide loops cleanly.
(function () {
const { clamp, lerp, win, outBack, outCubic, inCubic, spring, rnd, rr } = U;
const W = 1080, H = 1350, FPS = 30;

const K = { W, H, FPS, IMG: {} };

// ------------------------------------------------------------- elements --
function place(el, t, D, i) {
  const at = el.at ?? 0.1 + i * 0.08;
  const p = el.in === "none" ? 1 : spring(t, at, el.dur ?? 0.75);
  const lin = win(at, at + (el.dur ?? 0.75) * 0.6, t);
  const o = el.out === "none" ? 0 : inCubic(win(D - 0.32 + (el.outLag || 0), D, t));
  let dx = 0, dy = 0, s = 1, a = 1, r = 0;
  const far = el.far ?? 1;
  switch (el.in || "pop") {
    case "pop": s = lerp(0.3, 1, p); a = clamp(lin * 2.5); break;
    case "grow": s = lerp(0, 1, p); break;
    case "up": dy = (1 - p) * 900 * far; break;
    case "down": dy = -(1 - p) * 900 * far; break;
    case "left": dx = -(1 - p) * 1200 * far; break;
    case "right": dx = (1 - p) * 1200 * far; break;
    case "drop": dy = -(1 - p) * 500 * far; r = (1 - p) * 0.3; a = clamp(lin * 3); break;
    case "fade": a = lin; dy = (1 - lin) * 24; break;
  }
  switch (el.out || "fade") {
    case "fade": a *= 1 - o; s *= 1 - 0.06 * o; break;
    case "up": dy -= o * 900; break;
    case "down": dy += o * 900; break;
    case "left": dx -= o * 1200; break;
    case "right": dx += o * 1200; break;
    case "shrink": s *= 1 - o; break;
  }
  const u = (2 * Math.PI * t) / D, ph = i * 1.9, f = el.float ?? 0;
  return {
    vis: t >= at - 0.001 && a > 0.003 && s > 0.003,
    x: el.x + dx + f * 5 * Math.sin(u + ph), y: el.y + dy + f * 7 * Math.sin(2 * u + ph),
    s, a, rot: (el.rot || 0) * Math.PI / 180 + r + f * 0.012 * Math.sin(u + ph + 1),
    lt: t - at,
  };
}
K.drawEls = function (c, t, D, els, S) {
  els.forEach((el, i) => {
    if (!el) return;
    const P = place(el, t, D, i);
    if (!P.vis) return;
    c.save();
    c.translate(P.x, P.y); c.rotate(P.rot); c.scale(P.s, P.s);
    c.globalAlpha *= P.a;
    el.draw(c, t, P.lt, S);
    c.restore();
  });
};

// ----------------------------------------------------------------- text --
// font: a CSS family; o: { size, weight, color, align, base, track, italic, maxW, lh }
K.font = (o) => `${o.italic ? "italic " : ""}${o.weight || 700} ${o.size}px ${o.family || "InterD"}`;
K.lines = function (c, str, o) {
  c.font = K.font(o); c.letterSpacing = (o.track || 0) + "px";
  const out = o.maxW ? U.wrap(c, str, o.maxW) : String(str).split("\n");
  c.letterSpacing = "0px";
  return out;
};
// Draw text (wrapped when maxW is set). Returns { w, h } of the block.
K.text = function (c, str, x, y, o) {
  const lines = K.lines(c, str, o);
  const lh = (o.lh || 1.1) * o.size;
  c.font = K.font(o); c.letterSpacing = (o.track || 0) + "px";
  c.textAlign = o.align || "left"; c.textBaseline = o.base || "alphabetic";
  let w = 0;
  lines.forEach((l, i) => {
    const yy = y + i * lh;
    if (o.stroke) { c.lineJoin = "round"; c.miterLimit = 2; c.lineWidth = o.strokeW || 8; c.strokeStyle = o.stroke; c.strokeText(l, x, yy); }
    if (o.shadow) { c.save(); c.fillStyle = o.shadow; c.fillText(l, x + (o.sx ?? 0), yy + (o.sy ?? 6)); c.restore(); }
    c.fillStyle = o.color || "#111"; c.fillText(l, x, yy);
    w = Math.max(w, c.measureText(l).width);
  });
  c.letterSpacing = "0px";
  return { w, h: lines.length * lh };
};
K.measure = function (c, str, o) {
  c.font = K.font(o); c.letterSpacing = (o.track || 0) + "px";
  const w = c.measureText(str).width; c.letterSpacing = "0px"; return w;
};
// Largest size <= o.size at which str fits in maxW on one line.
K.fit = function (c, str, maxW, o) {
  let s = o.size;
  while (s > 8 && K.measure(c, str, { ...o, size: s }) > maxW) s -= 1;
  return s;
};
// Typed-on substring.
K.typed = (s, t, at, cps = 24) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));
K.caret = (t) => Math.floor(t * 2.4) % 2 === 0;

// ---------------------------------------------------------------- shapes --
K.panel = function (c, x, y, w, h, r, fill, sh) {
  c.save();
  if (sh) { c.shadowColor = sh.color || "rgba(0,0,0,.18)"; c.shadowBlur = sh.blur ?? 30; c.shadowOffsetX = sh.x || 0; c.shadowOffsetY = sh.y ?? 12; }
  rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill();
  c.restore();
};
// Footage (a scene from the film) cropped into a rounded box.
K.photo = function (c, x, y, w, h, scene, t, look = "raw", r = 0, focus = 0.6) {
  c.save(); rr(c, x, y, w, h, r); c.clip(); c.translate(x, y);
  FOOTAGE.drawFootage(c, scene, t, w, h, look, focus);
  c.restore();
};
// A card from lib/cards.js (editor, prompt, reel, wave, chips...) in a rounded box.
K.card = function (c, kind, x, y, w, h, t, p = {}, r = 14, D = 5) {
  c.save(); rr(c, x, y, w, h, r); c.clip(); c.translate(x, y);
  c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
  CARDS[kind](c, w, h, t, p, { D, IMG: K.IMG });
  c.restore();
};
K.bro = function (c, x, y, s, st = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); FOOTAGE.drawBro(c, { vol: 1, ...st }); c.restore();
};
K.arrowCursor = function (c, x, y, s = 1, fill = "#111", edge = "#fff") {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 26); c.lineTo(6.5, 19.5); c.lineTo(11, 29); c.lineTo(15.5, 27); c.lineTo(11, 17.5); c.lineTo(19.5, 17.5); c.closePath();
  c.fillStyle = fill; c.fill(); c.strokeStyle = edge; c.lineWidth = 2.2; c.lineJoin = "round"; c.stroke();
  c.restore();
};
// Pixel cursor (the classic stair-stepped arrow).
K.pixelCursor = function (c, x, y, px = 4, fill = "#bfe1ff", edge = "#2b4a6b") {
  const rows = ["X", "XX", "X.X", "X..X", "X...X", "X....X", "X.....X", "X......X", "X.......X", "X....XXXX", "X..X..X", "X.X X..X", "XX  X..X", "X    X..X", "     X..X", "      XX"];
  c.save(); c.translate(x, y);
  rows.forEach((r, j) => [...r].forEach((ch, i) => {
    if (ch === "X") { c.fillStyle = edge; c.fillRect(i * px, j * px, px, px); }
    else if (ch === ".") { c.fillStyle = fill; c.fillRect(i * px, j * px, px, px); }
  }));
  c.restore();
};
K.heartPath = function (c, s) {
  c.beginPath(); c.moveTo(0, s * 0.35);
  c.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.45, -s * 0.62, 0, -s * 0.28);
  c.bezierCurveTo(s * 0.45, -s * 0.62, s * 0.7, -s * 0.1, 0, s * 0.35);
};
K.starburst = function (c, x, y, r1, r2, n, fill) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? r2 : r1; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  c.closePath(); c.fillStyle = fill; c.fill();
};

// ---------------------------------------------------------------- grain --
const GRAIN = [];
function makeGrain() {
  const r = rnd(11);
  for (let k = 0; k < 6; k++) {
    const g = document.createElement("canvas"); g.width = W / 2; g.height = H / 2;
    const x = g.getContext("2d"), d = x.createImageData(g.width, g.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (r() + r() + r() - 1.5) * 78;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0); GRAIN.push(g);
  }
}
K.grain = function (c, t, alpha) {
  if (!alpha) return;
  c.save(); c.globalCompositeOperation = "overlay"; c.globalAlpha = alpha;
  c.drawImage(GRAIN[Math.floor(t * FPS) % GRAIN.length], 0, 0, W, H);
  c.restore();
};
K.vignette = function (c, k = 0.35) {
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${k})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
};
// Offscreen canvas painted once (for heavy backdrops).
K.once = function (w, h, paint) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  paint(cv.getContext("2d"), w, h); return cv;
};

// ---------------------------------------------------------------- start --
K.start = async function () {
  const CAR = window.CAROUSEL;
  const q = new URLSearchParams(location.search);
  const IDX = +(q.get("s") || 1) - 1;
  const SL = CAR.slides[IDX];
  const D = SL.dur || CAR.dur || 5;
  const cv = document.getElementById("cv"), c = cv.getContext("2d");
  const fonts = ["700 40px InterD", "800 40px InterD", "900 40px InterD", "300 40px InterD", "600 40px InterD",
    "300 40px InterL", "400 40px InterL", "500 40px InterL", "600 40px InterL", "700 40px InterL", "800 40px InterL",
    "500 40px Playfair", "italic 500 40px Playfair", "700 40px Fredoka", "400 40px VT323", "600 40px Caveat",
    "800 40px ArchX", "900 40px ArchX9", ...(CAR.fonts || [])];
  await Promise.all(fonts.map((f) => document.fonts.load(f)));
  const img = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
  K.IMG.pack = await img("assets/img/pack-1.png");
  for (const [k, src] of Object.entries(CAR.images || {})) K.IMG[k] = await img(src);
  makeGrain();
  const S = { D, idx: IDX, n: CAR.slides.length, W, H, CAR };
  if (CAR.setup) await CAR.setup(S);
  window.SLIDE_INFO = { dur: D, fps: FPS, count: CAR.slides.length };
  window.renderAt = function (t) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    c.clearRect(0, 0, W, H);
    (SL.bg || CAR.bg)(c, t, S);
    K.drawEls(c, t, D, SL.els || [], S);
    if (SL.fg) SL.fg(c, t, S);
    if (CAR.fg) CAR.fg(c, t, S);
  };
  return true;
};

window.K = K;
})();

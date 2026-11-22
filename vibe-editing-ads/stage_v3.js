// V3 "Claude, edit this" — full-screen vertical. Every spoken command is executed on screen.
// renderAt(frame) draws: footage (+ depth text) / whiteboard world -> MG -> laptop (DOM 3D) -> captions, prompt bar, flashes (overlay).
(() => {
const TL = window.TL;
const C = document.getElementById("c"), X = C.getContext("2d");
const O = document.getElementById("o"), Q = O.getContext("2d");
const SCR = document.getElementById("scr"), SX = SCR.getContext("2d");
const lapBody = document.getElementById("lapBody"), lid = document.getElementById("lid");
const W_ = 1080, H_ = 1920, fps = TL.fps;
// --------------------------------------------------------------- theme
const RED = "#E8231B", RED2 = "#FF3B2F", INK = "#111111", BLUE = "#5C7CFF", PAPER = "#F7F6F2", YEL = "#FFE600";
const SANS = "Inter Tight", WIDE = "Archivo Expanded", COND = "Anton", SERIF = "Instrument Serif", DIDONE = "Playfair Display",
  HAND = "Caveat", MONO = "JetBrains Mono", BASICF = "Liberation Sans", MONT = "Montserrat";
// --------------------------------------------------------------- utils
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const win = (t, a, d) => clamp((t - a) / d);
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eIn = (x) => x * x * x;
const eInOut = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eBack = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (t, a, b) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const band = (t, a, b, fi = 0.25, fo = 0.25) => smooth(t, a - fi, a) * (1 - smooth(t, b, b + fo));
const rnd = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const font = (c, w, s, f, it) => { c.font = `${it ? "italic " : ""}${w} ${s}px "${f}"`; };
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
const mk = (w, h) => { const k = document.createElement("canvas"); k.width = w; k.height = h; return [k, k.getContext("2d")]; };
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("load " + src)); i.src = src; });
const pad = (n, k) => String(n).padStart(k, "0");
const W = (i) => TL.words[i][0], WE = (i) => TL.words[i][1];
const disp = (i) => TL.words[i][2].replace(/[.,:?!]+$/, "").replace("HxFilm", "HitFilm");
const ENDT = TL.speech_end;
// --------------------------------------------------------------- key moments
const ENTER = {};      // command -> enter-key time
const CMDS = [
  ["music", "put some music", 21, 23], ["sfx", "add some sound effects", 25, 29], ["caps", "add captions", 48, 50],
  ["hl", "highlight the word I'm saying", 54, 59], ["mag", "make it look like a magazine", 61, 66],
  ["behind", "put the words behind my head", 68, 73], ["hand", "try handwritten", 75, 76],
  ["cut", "cut me out, put me on a whiteboard", 90, 98], ["back", "put me back", 181, 183],
];
for (const [k, , a, b] of CMDS) ENTER[k] = WE(b) + 0.12;
const MUSIC_T = TL.music_t, SFX_ON = ENTER.sfx;
const T = {
  titles0: W(2) - 0.05, notEditing: W(5) - 0.05, claude: W(10) - 0.05, barIn: W(12),
  apps: W(35) - 0.25, nothing: W(41), code0: W(42) - 0.12, code1: W(48) - 0.1,
  capsOn: ENTER.caps, crumble: WE(53) + 0.08, hl: W(54) - 0.05, mag: ENTER.mag, behind: W(71) - 0.08, wait: W(74) - 0.05,
  hand: W(75) - 0.05, grid0: W(81) - 0.12, grid1: WE(88) + 0.18, cut0: W(90) - 0.05, cutLift: W(92), board: W(98) - 0.15,
  back: ENTER.back, course0: W(184) - 0.1, course1: W(200) - 0.15, cta: W(210) - 0.1, end: ENDT + 0.1,
};
const BOARD_ON = [T.board, T.back + 0.55];
// --------------------------------------------------------------- SFX cue sheet (exported for the mixer)
const CUES = [];
const cue = (n, t, g = 1) => { if (t >= SFX_ON - 0.02 || n === "__music") CUES.push({ name: n, t: +t.toFixed(3), g }); };

// --------------------------------------------------------------- layers
const [perC, perX] = mk(W_, H_);          // matted person
const [mC, mX] = mk(576, 1024);            // matte with alpha
const [olC, olX] = mk(576, 1024);          // sticker outline
const [tmpC, tmpX] = mk(W_, H_);
const [smC, smX] = mk(108, 192);           // blur / pixelate source
const grain = [];
for (let g = 0; g < 4; g++) {
  const [k, c] = mk(540, 960); const id = c.createImageData(540, 960); const r = rnd(91 + g * 7);
  for (let i = 0; i < id.data.length; i += 4) { const v = 112 + r() * 56 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  c.putImageData(id, 0, 0); grain.push(k);
}

// --------------------------------------------------------------- camera (zoom around the face, never below fill)
const ZK = [  // [time, zoom, ease seconds]
  [0, 1.0, 0.01], [0.2, 1.06, 4.0], [MUSIC_T, 1.13, 0.12], [W(24) - 0.08, 1.38, 0.16], [WE(24) + 0.2, 1.08, 0.3],
  [SFX_ON, 1.0, 0.2], [W(32), 1.05, 2.5], [T.nothing, 1.2, 0.1], [T.code1, 1.04, 0.01], [W(51), 1.32, 0.1],
  [WE(53) + 0.3, 1.05, 0.3], [W(60) - 0.05, 1.36, 0.14], [W(61), 1.06, 0.3], [T.mag - 0.02, 1.0, 0.01],
  [T.behind, 1.0, 0.01], [T.hand, 1.06, 0.5], [W(77), 1.22, 0.14], [W(80), 1.06, 0.25], [T.cut0, 1.0, 0.4],
  [T.back + 0.6, 1.0, 0.01], [T.course1, 1.04, 0.4], [W(209) - 0.05, 1.18, 0.12], [W(210), 1.06, 0.3], [T.end, 1.1, 2.4],
];
function zoomAt(t) {
  let v = 1, prev = 1;
  for (const [kt, z, d] of ZK) { if (t < kt) break; v = lerp(prev, z, eInOut(clamp((t - kt) / d))); prev = z; }
  return v;
}
const IMPACTS = [[MUSIC_T, 10], [SFX_ON + 0.05, 6], [T.nothing, 12], [T.crumble, 6], [T.mag, 4], [T.board + 0.55, 8], [T.back + 0.5, 8], [W(211), 6]];
function camera(t, fi) {
  const z = zoomAt(t);
  const top = TL.head[0][fi], cx = TL.head[1][fi], neck = TL.head[3][fi];
  const fx = cx * W_, fy = (top + (neck - top) * 0.5) * H_;
  let x0 = fx - fx * z, y0 = fy - fy * z;
  x0 = clamp(x0, W_ - W_ * z, 0); y0 = clamp(y0, H_ - H_ * z, 0);
  for (const [it, a] of IMPACTS) { const k = t - it; if (k >= 0 && k < 0.35) { const d = (1 - k / 0.35) ** 2 * a; x0 += Math.sin(k * 90) * d; y0 += Math.cos(k * 77) * d; } }
  return { z, x0, y0 };
}
function headScreen(cam, fi) {
  const top = TL.head[0][fi], cx = TL.head[1][fi], hw = TL.head[2][fi], neck = TL.head[3][fi];
  return { cx: cam.x0 + cx * W_ * cam.z, top: cam.y0 + top * H_ * cam.z, w: hw * W_ * cam.z, neck: cam.y0 + neck * H_ * cam.z };
}

// --------------------------------------------------------------- type helpers
function wideFill(c, y0, y1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "#0B0F1F"); g.addColorStop(0.55, "#1B2C7A"); g.addColorStop(1, "#3D63FF"); return g; }
// letters typed on one by one (reference: ~1 frame per letter, blur in)
function typeOn(c, text, x, y, t0, opt) {
  const { size, fam, w = 900, fill = "#fff", align = "center", per = 0.035, ls = 0, stroke, shadow, t1 = 1e9, it = false } = opt;
  font(c, w, size, fam, it); c.letterSpacing = ls + "px";
  const total = c.measureText(text).width;
  let x_ = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  const q = win(t1 === 1e9 ? -1 : (opt.now ?? 0), t1, 0.2);
  [...text].forEach((ch, i) => {
    const cw = c.measureText(ch).width;
    const p = eOut(win(opt.now, t0 + i * per, 0.18));
    if (p > 0) {
      c.save(); c.globalAlpha = p * (1 - win(opt.now, t1 - 0.12, 0.12));
      const b = (1 - p) * 10; if (b > 0.4) c.filter = `blur(${b.toFixed(1)}px)`;
      c.translate(x_ + cw / 2, y + (1 - p) * size * 0.25); c.textAlign = "center"; c.textBaseline = "alphabetic";
      if (shadow) { c.shadowColor = shadow; c.shadowBlur = 30; c.shadowOffsetY = 8; }
      if (stroke) { c.lineJoin = "round"; c.lineWidth = stroke[1]; c.strokeStyle = stroke[0]; c.strokeText(ch, 0, 0); }
      c.fillStyle = typeof fill === "function" ? fill(c, size) : fill; c.fillText(ch, 0, 0);
      c.restore();
    }
    x_ += cw;
  });
  c.letterSpacing = "0px";
  return total;
}
function chrome(c, text, x, y, size, now, t0, t1) {
  font(c, 900, size, WIDE); c.letterSpacing = "2px"; const fitW = c.measureText(text).width; if (fitW > 1000) { size *= 1000 / fitW; font(c, 900, size, WIDE); }
  const total = c.measureText(text).width; let x_ = x - total / 2;
  [...text].forEach((ch, i) => {
    const cw = c.measureText(ch).width, p = eOut(win(now, t0 + i * 0.045, 0.22));
    if (p > 0) {
      c.save(); c.globalAlpha = p * (1 - win(now, t1 - 0.12, 0.15)); c.translate(x_ + cw / 2, y + (1 - p) * 40);
      c.scale(lerp(1.25, 1, p), lerp(1.25, 1, p)); c.textAlign = "center"; c.textBaseline = "alphabetic";
      if (p < 1) c.filter = `blur(${((1 - p) * 8).toFixed(1)}px)`;
      for (let k = 10; k >= 1; k--) { c.fillStyle = `rgb(${18 + k * 4},${20 + k * 4},${26 + k * 4})`; c.fillText(ch, k * 1.1, k * 1.6); }
      const g = c.createLinearGradient(0, -size * 0.75, 0, 0);
      g.addColorStop(0, "#E9EDF2"); g.addColorStop(0.3, "#7C8692"); g.addColorStop(0.47, "#FFFFFF"); g.addColorStop(0.58, "#2E343C"); g.addColorStop(0.8, "#59626D"); g.addColorStop(1, "#B8C0C9");
      c.fillStyle = g; c.fillText(ch, 0, 0);
      c.lineWidth = 2.2; c.strokeStyle = "rgba(12,14,18,0.9)"; c.strokeText(ch, 0, 0);
      const sh = ((now * 0.6 + i * 0.07) % 1.6) - 0.3;   // travelling glint
      if (sh > 0 && sh < 1) { c.globalCompositeOperation = "source-atop"; c.fillStyle = `rgba(255,255,255,${0.55 * Math.sin(sh * Math.PI)})`; c.fillRect(-cw, -size, cw * 2, size * 1.2); }
      c.restore();
    }
    x_ += cw;
  });
  c.letterSpacing = "0px";
}
function hand(c, text, x, y, size, t0, now, col = INK, dur = 0.5, align = "center", t1 = 1e9, rot = 0) {
  // handwriting: the word is revealed left to right like a marker stroke
  font(c, 700, size, HAND); const tw = c.measureText(text).width;
  const p = clamp((now - t0) / dur); if (p <= 0) return tw;
  const a = 1 - win(now, t1 - 0.12, 0.15); if (a <= 0) return tw;
  const xs = align === "center" ? x - tw / 2 : x;
  c.save(); c.globalAlpha = a; c.translate(xs, y); c.rotate(rot);
  c.beginPath(); c.rect(-10, -size, (tw + 20) * eInOut(p), size * 1.6); c.clip();
  c.fillStyle = col; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(text, 0, 0);
  c.restore(); return tw;
}
function marker(c, pts, p, col = RED, lw = 7) {     // draw a polyline progressively
  if (p <= 0) return; let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(...pts[0]);
  let left = L * clamp(p);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const k = Math.min(1, left / seg[i - 1]); c.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); left -= seg[i - 1];
  }
  c.stroke(); c.restore();
}
const ellipsePts = (cx, cy, rx, ry, n = 60, wob = 0.04) => Array.from({ length: n + 6 }, (_, i) => { const a = -2.2 + i / n * Math.PI * 2; const r = 1 + Math.sin(i * 1.7) * wob; return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]; });

// --------------------------------------------------------------- captions
const GROUPS = [
  // [a, b, style]
  [48, 50, "basic"], [51, 53, "basic"],
  [54, 56, "hl"], [57, 59, "hl"], [60, 60, "hl"], [61, 63, "hl"], [64, 66, "hl"],
  [68, 70, "mag"],
  [75, 76, "hand"], [77, 79, "hand"], [80, 80, "hand"], [84, 88, "hand"], [89, 92, "hand"], [93, 98, "hand"],
  [100, 103, "board"], [104, 107, "board"], [108, 111, "board"], [112, 115, "board"], [116, 118, "board"], [119, 122, "board"],
  [123, 126, "board"], [127, 129, "board"], [130, 133, "board"], [134, 136, "board"], [137, 140, "board"], [141, 143, "board"],
  [144, 148, "board"], [149, 151, "board"], [152, 157, "board"], [158, 159, "board"], [160, 163, "board"], [164, 166, "board"],
  [167, 170, "board"], [171, 174, "board"], [175, 179, "board"], [181, 183, "board"],
  [184, 187, "top"], [188, 191, "top"], [192, 193, "top"], [194, 196, "top"], [197, 199, "top"],
  [200, 205, "prem"], [206, 209, "prem"], [210, 214, "prem"],
];
GROUPS.forEach((g, i) => {
  const nx = GROUPS[i + 1];
  g.t0 = W(g[0]) - 0.06; g.t1 = Math.min(nx ? W(nx[0]) - 0.06 : 1e9, WE(g[1]) + 0.45);
  if (g[0] === 48) { g.t0 = T.capsOn; g.t1 = W(51) - 0.02; }
  if (g[0] === 51) g.t1 = T.crumble + 1.2;
  g.words = []; for (let k = g[0]; k <= g[1]; k++) if (TL.words[k]) g.words.push({ i: k, t: W(k), te: WE(k), text: disp(k) });
});
const PUNCH = new Set([23, 29, 41, 46, 53, 59, 66, 73, 98, 107, 111, 118, 122, 129, 136, 143, 148, 155, 157, 163, 170, 174, 176, 191, 193, 196, 199, 209, 213, 214]);
function layWords(c, words, styleOf, maxW, gap) {
  const ws = words.map((w) => { styleOf(w); return c.measureText(w.text).width; });
  const tot = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1), k = Math.min(1, maxW / tot);
  let x = -tot / 2; return { xs: ws.map((w) => { const v = x + w / 2; x += w + gap; return v * k; }), ws: ws.map((w) => w * k), k };
}
function capBasic(c, g, t) {
  if (t < g.t0) return;
  const crumble = g[0] === 51 ? win(t, T.crumble, 1.1) : 0;
  const words = g.words.filter((w) => g[0] === 48 || t >= w.t - 0.03).map((w) => ({ ...w, text: w.text.toUpperCase() }));
  if (!words.length) return;
  const st = () => { font(c, 700, 54, BASICF); }; const L = layWords(c, words, st, 900, 16); const y = 1250;
  const r = rnd(5);
  words.forEach((w, wi) => {
    st(); let x = 540 + L.xs[wi] - L.ws[wi] / 2;
    [...w.text].forEach((ch, li) => {
      const cw = c.measureText(ch).width * L.k, vx = (r() - 0.5) * 300, rot = (r() - 0.5) * 6, delay = r() * 0.25;
      const p = clamp((crumble * 1.1 - delay) / 0.85);
      c.save(); c.translate(x + cw / 2 + vx * p, y + 900 * p * p); c.rotate(rot * p); c.scale(L.k, L.k); c.globalAlpha = 1 - p * 0.6;
      c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 7; c.strokeStyle = "#000"; c.strokeText(ch, 0, 0); c.fillStyle = "#fff"; c.fillText(ch, 0, 0);
      c.restore(); x += cw;
    });
  });
}
function capHL(c, g, t) {
  const st = () => { font(c, 900, 82, SANS); c.letterSpacing = "-2px"; };
  const words = g.words.map((w) => ({ ...w, text: w.text.toUpperCase() })); const L = layWords(c, words, st, 940, 22);
  const y = 1260, p0 = eBack(win(t, g.t0, 0.16), 2), a = 1 - win(t, g.t1 - 0.08, 0.08);
  c.save(); c.globalAlpha = a; c.translate(540, y); c.scale(lerp(0.7, 1, p0), lerp(0.7, 1, p0));
  let ai = words.findIndex((w, i) => t >= w.t - 0.04 && (i === words.length - 1 || t < words[i + 1].t - 0.04)); if (ai < 0) ai = 0;
  // sliding red highlight box
  const prevI = Math.max(0, ai - 1), wk = words[ai], mv = eOut(win(t, wk.t - 0.04, 0.12));
  const bx = lerp(L.xs[prevI], L.xs[ai], ai === 0 ? 1 : mv), bw = lerp(L.ws[prevI], L.ws[ai], ai === 0 ? 1 : mv);
  rr(c, bx - bw / 2 - 14, -70, bw + 28, 92, 14); c.fillStyle = RED; c.fill();
  words.forEach((w, i) => { st(); c.save(); c.translate(L.xs[i], 0); c.scale(L.k, L.k); if (i === ai) c.scale(1.06, 1.06);
    c.textAlign = "center"; c.shadowColor = "rgba(0,0,0,0.45)"; c.shadowBlur = 18; c.shadowOffsetY = 4; c.fillStyle = "#fff"; c.fillText(w.text, 0, 0); c.restore(); });
  c.restore(); c.letterSpacing = "0px";
}
function capMag(c, g, t) {
  const words = g.words, st = (w) => { font(c, 700, 76, DIDONE, true); };
  const L = layWords(c, words, st, 900, 20), y = 1268, a = 1 - win(t, g.t1 - 0.1, 0.1);
  words.forEach((w, i) => { const p = eOut(win(t, w.t - 0.04, 0.22)); if (p <= 0) return; st(w);
    c.save(); c.globalAlpha = p * a; c.translate(540 + L.xs[i], y + (1 - p) * 20); c.scale(L.k, L.k); c.textAlign = "center";
    c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 20; c.fillStyle = "#fff"; c.fillText(w.text, 0, 0); c.restore(); });
}
function capHand(c, g, t, hs) {
  const txt = g.words.map((w) => w.text.toLowerCase()).join(" ");
  const y = clamp(hs.top - 120, 260, 900), a = 1 - win(t, g.t1 - 0.1, 0.12);
  if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  let x = 540; font(c, 700, 112, HAND); const tot = c.measureText(txt).width, k = Math.min(1, 960 / tot);
  c.translate(540, y); c.scale(k, k); c.rotate(-0.03);
  let cx = -tot / 2;
  g.words.forEach((w) => { const s = w.text.toLowerCase(); font(c, 700, 112, HAND); const ww = c.measureText(s + " ").width;
    hand(c, s, cx, 0, 112, w.t - 0.05, t, PUNCH.has(w.i) ? RED : INK, 0.28, "left"); cx += ww; });
  // doodles
  if (g[0] === 75) marker(c, [[-tot / 2, 26], [-tot / 4, 40], [0, 22], [tot / 4, 38], [tot / 2, 24]], win(t, WE(76), 0.35), RED, 8);
  if (g[0] === 77) { const p = win(t, WE(79), 0.4); marker(c, heartPts(tot / 2 + 70, -30, 1.1), p, RED, 8); }
  if (g[0] === 80) marker(c, [[tot / 2 + 30, -10], [tot / 2 + 140, 120], [tot / 2 + 110, 80], [tot / 2 + 140, 120], [tot / 2 + 95, 125]], win(t, WE(80), 0.3), INK, 7);
  c.restore();
}
const heartPts = (x, y, s) => Array.from({ length: 40 }, (_, i) => { const a = i / 39 * Math.PI * 2; return [x + s * 16 * Math.sin(a) ** 3 * 2.2, y - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 2.2]; });
function capBoard(c, g, t) {
  const words = g.words, x0 = 70, y = 1335, a = 1 - win(t, g.t1 - 0.08, 0.08);
  font(c, 900, 62, SANS); let line = 0, x = x0;
  c.save(); c.globalAlpha = a; c.letterSpacing = "-1.5px";
  words.forEach((w) => {
    const s = w.text, ww = c.measureText(s).width;
    if (x + ww > 520 && x > x0) { line++; x = x0; }
    const p = eOut(win(t, w.t - 0.04, 0.18));
    if (p > 0) { c.save(); c.globalAlpha = a * p; c.fillStyle = PUNCH.has(w.i) ? RED : INK; c.textAlign = "left"; c.fillText(s, x, y + line * 70 + (1 - p) * 14); c.restore(); }
    x += ww + 18;
  });
  c.restore(); c.letterSpacing = "0px";
}
function capTop(c, g, t) {
  const words = g.words, y = 330, a = 1 - win(t, g.t1 - 0.08, 0.08);
  const st = (w) => PUNCH.has(w.i) ? font(c, 400, 104, COND) : font(c, 900, 70, SANS);
  const L = layWords(c, words.map((w) => ({ ...w, text: w.text.toUpperCase() })), st, 960, 20);
  words.forEach((w, i) => { const p = eOut(win(t, w.t - 0.04, 0.2)); if (p <= 0) return; st(w);
    c.save(); c.globalAlpha = a * p; c.translate(540 + L.xs[i], y + (1 - p) * 24); c.scale(L.k, L.k); c.textAlign = "center";
    c.fillStyle = PUNCH.has(w.i) ? RED : INK; c.fillText(w.text.toUpperCase(), 0, 0); c.restore(); });
}
function capPrem(c, g, t) {
  const words = g.words.map((w) => ({ ...w, text: w.text.toUpperCase() }));
  const st = (w) => PUNCH.has(w.i) ? (font(c, 400, 150, COND), c.letterSpacing = "1px") : (font(c, 900, 66, SANS), c.letterSpacing = "-1px");
  const L = layWords(c, words, st, 960, 22), y = 1290, a = 1 - win(t, g.t1 - 0.1, 0.1);
  words.forEach((w, i) => { const p = eOut(win(t, w.t - 0.04, 0.2)); if (p <= 0) return; st(w);
    c.save(); c.globalAlpha = a * p; c.translate(540 + L.xs[i], y + (1 - p) * 26); const s = L.k * lerp(1.3, 1, p); c.scale(s, s);
    if (p < 1) c.filter = `blur(${((1 - p) * 8).toFixed(1)}px)`; c.textAlign = "center";
    c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 24; c.shadowOffsetY = 6; c.fillStyle = PUNCH.has(w.i) ? RED2 : "#fff"; c.fillText(w.text, 0, 0); c.restore(); });
  c.letterSpacing = "0px";
}

// --------------------------------------------------------------- prompt bar (Claude-style input)
function promptBar(c, t) {
  const vis = band(t, T.barIn, T.code0, 0.35, 0.15) + band(t, T.code1 + 0.1, T.mag - 0.05, 0.25, 0.12) + band(t, T.behind + 0.2, T.grid0, 0.25, 0.12)
    + band(t, T.grid1 + 0.2, T.board + 0.2, 0.25, 0.2) + band(t, W(181) - 0.35, T.back + 0.5, 0.25, 0.2);
  if (vis <= 0.01) return;
  const cmd = CMDS.find(([k, , a, b]) => t >= W(a) - 0.3 && t < ENTER[k] + 1.1);
  const y = 1420, w = 900, h = 104, x = 540 - w / 2;
  c.save(); c.globalAlpha = clamp(vis); c.translate(0, (1 - clamp(vis)) * 60);
  c.shadowColor = "rgba(0,0,0,0.25)"; c.shadowBlur = 40; c.shadowOffsetY = 14;
  rr(c, x, y, w, h, 34); c.fillStyle = "rgba(255,255,255,0.96)"; c.fill(); c.shadowColor = "transparent";
  c.strokeStyle = "rgba(0,0,0,0.08)"; c.lineWidth = 1.5; c.stroke();
  // spark icon
  c.save(); c.translate(x + 52, y + h / 2); c.rotate(Math.sin(t * 2) * 0.2); c.fillStyle = RED; c.beginPath();
  for (let k = 0; k < 8; k++) { const r = k % 2 ? 7 : 22, a = k * Math.PI / 4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore();
  let text = "", sent = 0, sentFade = 0;
  if (cmd) {
    const [k, full, a, b] = cmd, t0 = W(a) - 0.05, t1 = WE(b);
    text = full.slice(0, Math.round(full.length * clamp((t - t0) / (t1 - t0))));
    sent = win(t, ENTER[k], 0.18); sentFade = win(t, ENTER[k] + 0.05, 0.25);
  }
  font(c, 600, 36, SANS); c.textBaseline = "middle"; c.textAlign = "left";
  if (!text || sentFade >= 1) { c.fillStyle = "#9A9A9A"; c.fillText("Tell Claude what to edit…", x + 96, y + h / 2 + 2); }
  else {
    c.save(); c.globalAlpha = 1 - sentFade; c.translate(0, -sentFade * 30); c.fillStyle = INK; c.fillText(text, x + 96, y + h / 2 + 2);
    if (!sent && Math.sin(t * 14) > 0) { const tw = c.measureText(text).width; c.fillRect(x + 100 + tw, y + 30, 3, 44); } c.restore();
  }
  // send button
  const pr = cmd ? Math.max(0, 1 - Math.abs(t - ENTER[cmd[0]]) / 0.12) : 0;
  c.save(); c.translate(x + w - 56, y + h / 2); c.scale(1 - 0.15 * pr, 1 - 0.15 * pr);
  c.beginPath(); c.arc(0, 0, 32, 0, 7); c.fillStyle = cmd && text ? (sent ? RED : INK) : "#D8D8D8"; c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = 5; c.lineCap = "round"; c.beginPath(); c.moveTo(0, 13); c.lineTo(0, -12); c.moveTo(-11, -1); c.lineTo(0, -12); c.lineTo(11, -1); c.stroke();
  c.restore();
  // music equaliser inside the bar after the drop
  if (t > MUSIC_T) {
    const m = TL.menv[Math.round(t * fps)] || 0;
    for (let k = 0; k < 5; k++) { const hh = 8 + 34 * m * (0.5 + 0.5 * Math.sin(t * 9 + k * 1.3)); rr(c, x + w - 150 + k * 12, y + h / 2 - hh / 2, 6, hh, 3); c.fillStyle = "rgba(232,35,27,0.85)"; c.fill(); }
  }
  c.restore();
  // done chip above the bar
  if (cmd) {
    const [k] = cmd, p = win(t, ENTER[k] + 0.05, 0.25), q = win(t, ENTER[k] + 0.95, 0.2);
    if (p > 0 && q < 1) {
      const lab = { music: "♪  Music added", sfx: "✦  Sound effects on", caps: "Captions added", hl: "Style: highlight", mag: "Style: magazine",
        behind: "Style: depth text", hand: "Style: handwritten", cut: "Cut-out ready", back: "Restored" }[k];
      font(c, 700, 30, SANS); const tw = c.measureText(lab).width + 90;
      c.save(); c.globalAlpha = (1 - q) * clamp(p * 2); c.translate(540, y - 52 - eBack(p) * 10); c.scale(lerp(0.7, 1, eBack(p)), lerp(0.7, 1, eBack(p)));
      rr(c, -tw / 2, -32, tw, 64, 32); c.fillStyle = INK; c.fill();
      c.beginPath(); c.arc(-tw / 2 + 34, 0, 15, 0, 7); c.fillStyle = "#2BD46A"; c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(-tw / 2 + 27, 0); c.lineTo(-tw / 2 + 32, 6); c.lineTo(-tw / 2 + 42, -6); c.stroke();
      c.fillStyle = "#fff"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(lab, -tw / 2 + 62, 2); c.restore();
    }
  }
}
for (const [k, full, a, b] of CMDS) {
  if (W(a) >= SFX_ON) { const n = Math.max(1, Math.round((WE(b) - W(a)) / 0.45)); for (let i = 0; i < n; i++) cue("keys", W(a) + i * 0.45, 0.32); }
  cue("enter", ENTER[k], 0.7); cue("pop", ENTER[k] + 0.08, 0.35);
}

// --------------------------------------------------------------- hook titles (behind the head)
function hookTitles(c, t, front = false) {
  if (t < T.titles0 || t > T.barIn + 0.6) return;
  if (front && t < T.claude + 0.05) return;
  const a = (k0, k1) => [k0, k1];
  if (t < T.notEditing + 0.05) {
    typeOn(c, "THIS WHOLE", 540, 470, T.titles0, { size: 118, fam: WIDE, fill: (cc, s) => wideFill(cc, 470 - s * 0.8, 470), now: t, t1: T.notEditing, per: 0.03 });
    typeOn(c, "VIDEO", 540, 690, T.titles0 + 0.3, { size: 250, fam: WIDE, fill: (cc, s) => wideFill(cc, 690 - s * 0.8, 690), now: t, t1: T.notEditing, per: 0.05 });
  } else if (t < T.claude + 0.05) {
    if (front) return;
    typeOn(c, "I'M", 540, 440, T.notEditing, { size: 110, fam: WIDE, fill: INK, now: t, t1: T.claude, per: 0.03 });
    typeOn(c, "NOT", 540, 690, T.notEditing + 0.12, { size: 300, fam: COND, fill: RED, now: t, t1: T.claude, per: 0.05 });
    typeOn(c, "EDITING IT", 540, 800, W(8) - 0.05, { size: 96, fam: WIDE, fill: (cc, s) => wideFill(cc, 800 - s * 0.8, 800), now: t, t1: T.claude, per: 0.03 });
  } else if (!front) {
    chrome(c, "CLAUDE", 540, 640, 205, t, T.claude, T.barIn + 0.6);
  } else {
    typeOn(c, "IS EDITING.", 540, 1290, W(11) - 0.05, { size: 150, fam: COND, fill: RED, now: t, t1: T.barIn + 0.6, per: 0.03, shadow: "rgba(0,0,0,0.35)" });
  }
}

// --------------------------------------------------------------- music drop + sfx burst
function musicDrop(c, t) {
  const p = win(t, MUSIC_T, 0.7); if (p <= 0 || p >= 1) return;
  for (let k = 0; k < 3; k++) { const q = clamp(p * 1.3 - k * 0.15); if (q <= 0) continue;
    c.save(); c.globalAlpha = (1 - q) * 0.8; c.strokeStyle = k === 1 ? RED : "#fff"; c.lineWidth = 10 * (1 - q) + 2;
    c.beginPath(); c.arc(540, 1472, 60 + q * 900, 0, 7); c.stroke(); c.restore(); }
}
cue("__music", MUSIC_T, 1);
const BURST = [["WHOOSH", "whoosh", 230, 620, -0.12], ["POP!", "pop", 830, 560, 0.1], ["✦ DING", "ding", 250, 1050, 0.06], ["SWOOSH", "swipe", 840, 1000, -0.08]];
BURST.forEach((b, i) => cue(b[1], SFX_ON + 0.1 + i * 0.16, 0.8));
cue("tada", SFX_ON + 0.75, 0.5);
function sfxBurst(c, t) {
  BURST.forEach(([lab, , x, y, rot], i) => {
    const t0 = SFX_ON + 0.1 + i * 0.16, p = win(t, t0, 0.25), q = win(t, t0 + 0.85, 0.2);
    if (p <= 0 || q >= 1) return;
    font(c, 400, 74, COND); const tw = c.measureText(lab).width + 60;
    c.save(); c.translate(x, y); c.rotate(rot); const s = eBack(p, 2.6) * (1 - q * 0.3); c.scale(s, s); c.globalAlpha = 1 - q;
    rr(c, -tw / 2, -54, tw, 100, 50); c.fillStyle = i % 2 ? RED : "#fff"; c.fill();
    c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
    c.fillStyle = i % 2 ? "#fff" : INK; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(lab, 0, 4); c.restore();
  });
}

// --------------------------------------------------------------- app windows that shatter on "nothing"
const APPS = [["Premiere Pro", "21546", W(35) - 0.2, 20, 150, -0.06], ["DaVinci Resolve", "50610", W(38) - 0.2, 440, 300, 0.05], ["HitFilm", "44074", W(40) - 0.2, 40, 1000, -0.04]];
APPS.forEach((a) => cue("swipe", a[2], 0.5)); cue("shatter", T.nothing + 0.05, 0.9); cue("thud", T.nothing + 0.02, 0.8);
async function appWindows(c, t) {
  if (t < APPS[0][2] || t > T.code0 + 0.1) return;
  for (const [name, id, t0, x, y, rot] of APPS) {
    const p = win(t, t0, 0.35); if (p <= 0) continue;
    const sh = win(t, T.nothing + 0.05, 0.55);
    const ww = 600, hh = 386, src = await stockFrame(id, t - t0, 720, 405);
    const draw = (cc) => {
      rr(cc, 0, 0, ww, hh, 18); cc.fillStyle = "#1E1E22"; cc.fill();
      cc.save(); rr(cc, 0, 0, ww, hh, 18); cc.clip(); cc.drawImage(src, 0, 44, ww, ww * 405 / 720); cc.restore();
      cc.fillStyle = "#2A2A2F"; cc.fillRect(0, 0, ww, 44); ["#FF5F57", "#FEBC2E", "#28C840"].forEach((col, k) => { cc.beginPath(); cc.arc(26 + k * 24, 22, 8, 0, 7); cc.fillStyle = col; cc.fill(); });
      font(cc, 700, 22, SANS); cc.fillStyle = "#ddd"; cc.textAlign = "center"; cc.textBaseline = "middle"; cc.fillText(name, ww / 2, 23);
      const xp = win(t, t0 + 0.55, 0.2);   // red cross as soon as he says "no X"
      if (xp > 0) { cc.save(); cc.globalAlpha = 0.9; marker(cc, [[ww * 0.2, hh * 0.25], [ww * 0.8, hh * 0.85]], xp * 2, RED, 16); marker(cc, [[ww * 0.8, hh * 0.25], [ww * 0.2, hh * 0.85]], xp * 2 - 1, RED, 16); cc.restore(); }
    };
    c.save(); c.translate(x + ww / 2, y + hh / 2 + (1 - eBack(p, 1.4)) * 300); c.rotate(rot);
    c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 40; c.shadowOffsetY = 18;
    if (sh <= 0) { c.translate(-ww / 2, -hh / 2); draw(c); }
    else {   // shatter into shards
      tmpX.clearRect(0, 0, ww, hh); draw(tmpX); c.shadowColor = "transparent";
      const r = rnd(id.length * 31); const nx = 4, ny = 3;
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const sx = i * ww / nx, sy = j * hh / ny, vx = (r() - 0.5) * 900, vy = -200 + r() * 300, vr = (r() - 0.5) * 6;
        c.save(); c.translate(-ww / 2 + sx + ww / nx / 2 + vx * sh, -hh / 2 + sy + hh / ny / 2 + vy * sh + 1400 * sh * sh); c.rotate(vr * sh); c.globalAlpha = 1 - sh;
        c.drawImage(tmpC, sx, sy, ww / nx, hh / ny, -ww / nx / 2, -hh / ny / 2, ww / nx, hh / ny); c.restore();
      }
    }
    c.restore();
  }
  // NOTHING slam
  const np = win(t, T.nothing, 0.18);
  if (np > 0) { c.save(); c.globalAlpha = 1 - win(t, T.code0 - 0.15, 0.12); c.translate(540, 1300); const s = lerp(2.2, 1, eOut(np)); c.scale(s, s);
    font(c, 400, 250, COND); c.textAlign = "center"; c.fillStyle = RED; c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 30; c.fillText("NOTHING.", 0, 0); c.restore(); }
}

// --------------------------------------------------------------- stock frames
const stockCache = {};
async function stockFrame(id, lt, w, h) {
  const n = { "1728": 120, "50610": 120, "21546": 150, "44074": 150, "50406": 180, "42620": 180, "46635": 150 }[id];
  const f = clamp(Math.floor(Math.max(0, lt) * fps), 0, n - 1) + 1;
  const key = id + ":" + f; if (stockCache[key]) return stockCache[key];
  const img = await loadImg(`${TL.stock_dir}/${id}/s${pad(f, 4)}.jpg`); stockCache[key] = img; return img;
}

// --------------------------------------------------------------- coding cutaway (full screen)
cue("glitch", T.code0, 0.7); cue("glitch", T.code1 - 0.05, 0.6); cue("bass_drop", W(46), 0.7);
async function codeCut(c, t) {
  const img = await stockFrame("1728", t - T.code0, 1080, 1920);
  const z = 1 + 0.05 * win(t, T.code0, 1.6);
  c.save(); c.translate(540, 960); c.scale(z, z); c.drawImage(img, -540, -960, 1080, 1920); c.restore();
  c.fillStyle = "rgba(0,0,0,0.45)"; c.fillRect(0, 0, W_, H_);
  typeOn(c, "I DON'T EVEN KNOW", 540, 820, W(42) - 0.05, { size: 70, fam: WIDE, fill: "#fff", now: t, per: 0.02 });
  const p = win(t, W(46) - 0.04, 0.14);
  if (p > 0) { c.save(); c.translate(540, 1150); const s = lerp(1.8, 1, eOut(p)); c.scale(s, s); font(c, 400, 330, COND); c.textAlign = "center";
    c.fillStyle = RED; c.shadowColor = "rgba(232,35,27,0.6)"; c.shadowBlur = 50; c.fillText("CODING.", 0, 0); c.restore();
    typeOn(c, "0 LINES WRITTEN", 540, 1260, W(46) + 0.25, { size: 34, fam: MONO, w: 700, fill: "rgba(255,255,255,0.85)", now: t, per: 0.02, ls: 4 }); }
}

// --------------------------------------------------------------- magazine cover
cue("flip", T.mag - 0.05, 0.9); cue("camera", T.mag + 0.25, 0.6);
function magazine(c, t, hs, behind) {
  const a = 1 - win(t, T.behind, 0.2); if (a <= 0) return;
  const p = eOut(win(t, T.mag, 0.4));
  c.save(); c.globalAlpha = a;
  if (behind) {   // masthead behind the head
    font(c, 900, 440, DIDONE); c.textAlign = "center"; c.textBaseline = "alphabetic"; c.letterSpacing = "-10px";
    c.save(); c.translate(540, 700 + (1 - p) * -80); c.globalAlpha = a * p; c.fillStyle = RED; c.fillText("VIBE", 0, 0); c.restore(); c.letterSpacing = "0px";
    return c.restore();
  }
  const el = (d, fn) => { const q = eOut(win(t, T.mag + d, 0.35)); if (q <= 0) return; c.save(); c.globalAlpha = a * q; c.translate(0, (1 - q) * 18); fn(); c.restore(); };
  el(0.1, () => { font(c, 800, 22, SANS); c.letterSpacing = "6px"; c.fillStyle = INK; c.textAlign = "center"; c.fillText("THE EDITING ISSUE   ·   NO. 01   ·   NOV 2026   ·   $0", 540, 120); c.letterSpacing = "0px"; c.fillRect(120, 140, 840, 2); });
  el(0.25, () => { c.textAlign = "left"; font(c, 400, 92, COND); c.fillStyle = INK; c.fillText("CLAUDE", 56, 960);
    font(c, 700, 62, DIDONE, true); c.fillStyle = RED; c.fillText("edited this.", 56, 1028);
    font(c, 600, 28, SANS); c.fillStyle = INK; c.fillText("He never opened", 56, 1078); c.fillText("a timeline.", 56, 1112); });
  el(0.4, () => { c.textAlign = "right"; font(c, 900, 230, DIDONE); c.fillStyle = RED; c.fillText("5", 1030, 1010);
    font(c, 400, 52, COND); c.fillStyle = INK; c.fillText("CAPTION STYLES", 1030, 1070); font(c, 700, 40, DIDONE, true); c.fillText("zero clicks.", 1030, 1118); });
  el(0.55, () => { c.save(); c.translate(150, 1560); c.rotate(-0.18); c.beginPath(); c.arc(0, 0, 92, 0, 7); c.fillStyle = RED; c.fill();
    font(c, 400, 40, COND); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText("VIBE", 0, -8); font(c, 800, 20, SANS); c.fillText("EDITING", 0, 22); c.restore(); });
  el(0.65, () => { const bx = 840, by = 1500; c.fillStyle = "#fff"; c.fillRect(bx - 10, by - 10, 190, 120); const r = rnd(3);
    for (let x = 0; x < 170; x += 3) { if (r() > 0.45) { c.fillStyle = INK; c.fillRect(bx + x, by, r() > 0.6 ? 3 : 2, 80); } }
    font(c, 600, 16, MONO); c.fillStyle = INK; c.textAlign = "left"; c.fillText("9 771234 567003", bx + 6, by + 100); });
  c.restore();
}

// --------------------------------------------------------------- depth words (behind my head / wait)
function depthWords(c, t) {
  if (t < T.behind - 0.05 || t > T.hand + 0.2) return;
  if (t < T.wait) {
    const g = (cc, s) => wideFill(cc, 0, 0);
    typeOn(c, "BEHIND", 540, 520, W(71) - 0.05, { size: 200, fam: WIDE, fill: (cc, s) => wideFill(cc, 520 - s * 0.8, 520), now: t, t1: T.wait, per: 0.04 });
    typeOn(c, "MY HEAD", 540, 760, W(72) - 0.05, { size: 170, fam: WIDE, fill: (cc, s) => wideFill(cc, 760 - s * 0.8, 760), now: t, t1: T.wait, per: 0.04 });
  } else {
    typeOn(c, "WAIT.", 540, 700, T.wait, { size: 420, fam: COND, fill: RED, now: t, t1: T.hand + 0.15, per: 0.05 });
  }
}
cue("whoosh_soft", T.behind, 0.6); cue("scratch", T.wait, 0.55); cue("marker", W(75), 0.6); cue("marker", W(77), 0.5);

// --------------------------------------------------------------- recap grid: five caption styles
cue("whoosh", T.grid0, 0.6); for (let k = 0; k < 5; k++) cue("tick", T.grid0 + 0.25 + k * 0.14, 0.5); cue("whoosh", T.grid1 - 0.2, 0.5);
function recap(c, t, img, cam, hs) {
  const inP = eInOut(win(t, T.grid0, 0.45)), outP = eInOut(win(t, T.grid1 - 0.35, 0.4));
  c.fillStyle = "#0E0E10"; c.fillRect(0, 0, W_, H_);
  const tw = 330, th = 587, gx = 24, gy = 30;
  const slots = [[540 - tw - gx / 2, 340], [540 + gx / 2, 340], [540 - tw * 1.5 - gx, 340 + th + gy], [540 - tw / 2, 340 + th + gy], [540 + tw / 2 + gx, 340 + th + gy]];
  const labels = ["BASIC", "HIGHLIGHT", "MAGAZINE", "DEPTH", "HANDWRITTEN"];
  // title
  const tp = eOut(win(t, T.grid0 + 0.15, 0.3));
  c.save(); c.globalAlpha = tp * (1 - outP); font(c, 400, 150, COND); c.textAlign = "center"; c.fillStyle = RED; c.fillText("5", 380, 250);
  font(c, 900, 58, WIDE); c.fillStyle = "#fff"; c.textAlign = "left"; c.fillText("STYLES", 450, 200); font(c, 600, 34, SANS); c.fillStyle = "rgba(255,255,255,0.7)"; c.fillText("0 clicks. 0 timelines.", 452, 248); c.restore();
  slots.forEach(([sx, sy], i) => {
    const p = eBack(win(t, T.grid0 + 0.2 + i * 0.14, 0.3), 1.6); if (p <= 0) return;
    const full = i === 4 ? outP : 0;       // the handwritten tile grows back to full screen
    const x = lerp(sx, 0, full), y = lerp(sy, 0, full), w = lerp(tw, W_, full), h = lerp(th, H_, full);
    c.save(); c.globalAlpha = i === 4 ? 1 : 1 - outP; c.translate(x + w / 2, y + h / 2); c.scale(lerp(0.6, 1, p), lerp(0.6, 1, p)); c.translate(-w / 2, -h / 2);
    rr(c, 0, 0, w, h, lerp(22, 0, full)); c.save(); c.clip();
    c.drawImage(img, cam.x0 * w / W_, cam.y0 * h / H_, W_ * cam.z * w / W_, H_ * cam.z * h / H_);
    const k = w / W_; c.scale(k, k);
    if (i === 0) { font(c, 700, 70, BASICF); c.textAlign = "center"; c.lineWidth = 9; c.strokeStyle = "#000"; c.strokeText("TOO BASIC", 540, 1300); c.fillStyle = "#fff"; c.fillText("TOO BASIC", 540, 1300); }
    if (i === 1) { font(c, 900, 96, SANS); c.textAlign = "center"; rr(c, 300, 1215, 480, 110, 16); c.fillStyle = RED; c.fill(); c.fillStyle = "#fff"; c.fillText("WORD", 540, 1305); }
    if (i === 2) { font(c, 900, 420, DIDONE); c.textAlign = "center"; c.fillStyle = RED; c.fillText("VIBE", 540, 560); }
    if (i === 3) { font(c, 900, 190, WIDE); c.textAlign = "center"; c.fillStyle = wideFill(c, 400, 560); c.fillText("DEPTH", 540, 560); }
    if (i === 4 && full < 0.6) { font(c, 700, 150, HAND); c.textAlign = "center"; c.fillStyle = INK; c.fillText("handwritten", 540, 520); }
    c.restore();
    if (full < 0.5) { c.globalAlpha *= 1 - full * 2; rr(c, 0, 0, w, h, 22); c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = 3; c.stroke();
      font(c, 800, 22, SANS); c.letterSpacing = "3px"; const lw = c.measureText(labels[i]).width + 30; rr(c, 14, 14, lw, 40, 20); c.fillStyle = "rgba(0,0,0,0.65)"; c.fill();
      c.fillStyle = "#fff"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(labels[i], 29, 35); c.textBaseline = "alphabetic"; c.letterSpacing = "0px"; }
    c.restore();
  });
}

// --------------------------------------------------------------- whiteboard world
cue("peel", W(90), 0.8); cue("rise", W(92) - 0.1, 0.6); cue("swipe", T.board, 0.7); cue("thud", T.board + 0.55, 0.9);
cue("rise", T.back + 0.1, 0.6); cue("whoosh", T.back + 0.3, 0.7); cue("thud", T.back + 0.55, 0.7);
function boardAmt(t) { return smooth(t, T.board, T.board + 0.55) * (1 - smooth(t, T.back + 0.05, T.back + 0.55)); }
function stickerXf(t) {   // person transform: lift during "cut me out", shrink to bottom-right on the board
  const lift = smooth(t, W(92), W(92) + 0.3) * (1 - smooth(t, T.back + 0.45, T.back + 0.6));
  const k = eInOut(boardAmt(t));
  return { s: lerp(1 + 0.025 * lift, 0.56, k), dx: lerp(0, 330, k), dy: lerp(-14 * lift, 520, k), lift };
}
function whiteboard(c, t) {
  c.fillStyle = PAPER; c.fillRect(0, 0, W_, H_);
  c.fillStyle = "rgba(0,0,0,0.05)"; for (let x = 0; x < W_; x += 54) c.fillRect(x, 0, 1, H_); for (let y = 0; y < H_; y += 54) c.fillRect(0, y, W_, 1);
  const g = c.createRadialGradient(540, 760, 300, 540, 900, 1400); g.addColorStop(0, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(0,0,0,0.025)"); c.fillStyle = g; c.fillRect(0, 0, W_, H_);
  c.fillStyle = "#C9CDD2"; c.fillRect(0, 0, W_, 16); c.fillStyle = "rgba(0,0,0,0.08)"; c.fillRect(0, 16, W_, 4);
}
const BEATS = [ // [start, end, drawer]
  [T.board + 0.3, W(112) - 0.1, bTitle], [W(112) - 0.1, W(123) - 0.1, bStep1], [W(123) - 0.1, W(137) - 0.1, bStep2],
  [W(137) - 0.1, W(158) - 0.1, bStep3], [W(158) - 0.1, W(171) - 0.1, bCheap], [W(171) - 0.1, T.back + 0.2, bTool],
];
BEATS.forEach(([a], i) => i && cue("swipe", a, 0.45));
cue("marker", W(106), 0.6); cue("marker", W(110), 0.5); cue("marker", W(113), 0.5); cue("pop", W(117), 0.5); cue("marker", W(120), 0.5);
cue("marker", W(124), 0.5); cue("keys", W(127), 0.35); cue("ding", W(131), 0.45); cue("pop", W(135), 0.5); cue("marker", W(142), 0.6);
cue("pop", W(147), 0.5); for (let k = 0; k < 5; k++) cue("keys", W(150) + k * 0.5, 0.25); cue("pop", W(160), 0.5); cue("thud", W(170), 0.9);
cue("marker", W(174), 0.6); cue("marker", W(176), 0.6);
async function boardContent(c, t, img, base = 1) {
  for (const [a, b, fn] of BEATS) {
    if (t < a - 0.05 || t > b + 0.3) continue;
    const pin = eOut(win(t, a, 0.3)), pout = eIn(win(t, b - 0.02, 0.3));
    c.save(); c.globalAlpha = base * pin * (1 - pout); c.translate(-pout * 400 + (1 - pin) * 120, 130); await fn(c, t, img); c.restore();
  }
}
function tapedCard(c, img, x, y, w, h, rot, p) {
  if (p <= 0) return;
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); const s = lerp(0.7, 1, eBack(p, 1.8)); c.scale(s, s); c.globalAlpha *= clamp(p * 2);
  c.shadowColor = "rgba(0,0,0,0.22)"; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = "#fff"; c.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28); c.shadowColor = "transparent";
  c.drawImage(img, -w / 2, -h / 2, w, h);
  c.fillStyle = "rgba(255,236,170,0.8)"; c.save(); c.translate(-w / 2 + 20, -h / 2 - 6); c.rotate(-0.6); c.fillRect(-46, -14, 92, 28); c.restore();
  c.save(); c.translate(w / 2 - 20, -h / 2 - 6); c.rotate(0.6); c.fillRect(-46, -14, 92, 28); c.restore();
  c.restore();
}
function stepBadge(c, n, x, y, t0, t) {
  const p = eBack(win(t, t0, 0.3), 2); if (p <= 0) return;
  c.save(); c.translate(x, y); c.scale(p, p); c.beginPath(); c.arc(0, 0, 44, 0, 7); c.fillStyle = RED; c.fill();
  font(c, 400, 58, COND); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(n, 0, 4); c.restore();
}
function bTitle(c, t) {
  hand(c, "this is what I call", 540, 250, 76, W(101), t, INK, 0.6);
  font(c, 400, 230, COND); c.textAlign = "center";
  const p = win(t, W(106) - 0.05, 0.5);
  if (p > 0) { c.save(); c.beginPath(); c.rect(0, 280, 1080 * eInOut(p), 260); c.clip(); c.fillStyle = INK; c.fillText("VIBE EDITING", 540, 500); c.restore(); }
  marker(c, [[150, 535], [400, 548], [700, 540], [940, 530]], win(t, WE(107), 0.4), RED, 10);
  hand(c, "= actually simple", 520, 680, 92, W(110) - 0.05, t, RED, 0.6);
  const sp = win(t, WE(111), 0.4);
  marker(c, ellipsePts(880, 655, 50, 50, 50, 0.02), sp, RED, 7);
  if (sp > 0.6) { c.fillStyle = RED; c.beginPath(); c.arc(864, 640, 6, 0, 7); c.arc(896, 640, 6, 0, 7); c.fill(); marker(c, [[860, 668], [880, 682], [902, 668]], (sp - 0.6) / 0.4, RED, 6); }
}
async function bStep1(c, t) {
  stepBadge(c, "1", 110, 230, W(112) - 0.05, t);
  hand(c, "just record yourself", 180, 262, 92, W(114) - 0.05, t, INK, 0.9, "left");
  const img = await stockFrame("50406", t - W(117), 720, 405);
  tapedCard(c, img, 90, 360, 620, 349, -0.04, win(t, W(117) - 0.1, 0.35));
  hand(c, "your phone is enough", 90, 840, 84, W(119), t, RED, 0.6, "left");
  marker(c, [[620, 830], [650, 860], [710, 790]], win(t, WE(122), 0.3), RED, 10);
}
async function bStep2(c, t) {
  stepBadge(c, "2", 110, 230, W(123) - 0.05, t);
  hand(c, "tell Claude what you want", 180, 262, 84, W(124) - 0.15, t, INK, 0.8, "left");
  const bub = (x, y, w, txt, dark, p) => { if (p <= 0) return; c.save(); c.globalAlpha *= clamp(p * 2); c.translate(x, y + (1 - eOut(p)) * 30);
    c.shadowColor = "rgba(0,0,0,0.15)"; c.shadowBlur = 24; c.shadowOffsetY = 8; rr(c, 0, 0, w, 96, 30); c.fillStyle = dark ? INK : "#fff"; c.fill(); c.shadowColor = "transparent";
    font(c, 600, 34, SANS); c.fillStyle = dark ? "#fff" : INK; c.textBaseline = "middle"; c.textAlign = "left"; c.fillText(txt, 32, 50); c.restore(); };
  const full = "make it look like a magazine", n = Math.round(full.length * clamp((t - W(127)) / 1.0));
  bub(290, 360, 700, full.slice(0, n), true, win(t, W(127) - 0.1, 0.25));
  bub(90, 490, 560, "✦  Done. Magazine cover applied.", false, win(t, W(131) - 0.1, 0.3));
  const ed = await stockFrame("44074", t - W(133), 720, 405);
  tapedCard(c, ed, 110, 680, 500, 281, -0.05, win(t, W(133) - 0.1, 0.35));
  hand(c, "like your", 660, 800, 76, W(133), t, INK, 0.4, "left");
  hand(c, "editor", 660, 890, 110, W(136) - 0.05, t, RED, 0.4, "left");
}
async function bStep2b(c, t) { }
async function bStep3(c, t) {
  stepBadge(c, "3", 110, 230, W(137), t);
  hand(c, "the main thing:", 180, 110, 70, W(139) - 0.05, t, "#666", 0.6, "left");
  font(c, 400, 150, COND); c.textAlign = "left"; const p = win(t, W(142) - 0.05, 0.35);
  if (p > 0) { c.save(); c.beginPath(); c.rect(170, 120, 900 * eInOut(p), 200); c.clip(); c.fillStyle = INK; c.fillText("THE WORKFLOW", 180, 290); c.restore(); }
  marker(c, ellipsePts(560, 235, 430, 105, 70, 0.03), win(t, WE(143), 0.55), RED, 9);
  // skill file card
  const cp = win(t, W(147) - 0.1, 0.35); if (cp <= 0) return;
  c.save(); c.globalAlpha *= clamp(cp * 2); c.translate(0, (1 - eOut(cp)) * 50);
  c.shadowColor = "rgba(0,0,0,0.18)"; c.shadowBlur = 34; c.shadowOffsetY = 14; rr(c, 80, 400, 640, 560, 22); c.fillStyle = "#fff"; c.fill(); c.shadowColor = "transparent";
  c.fillStyle = "#F1F0EC"; rr(c, 80, 400, 640, 64, [22, 22, 0, 0]); c.fill();
  font(c, 700, 26, MONO); c.fillStyle = INK; c.textAlign = "left"; c.fillText("premium-edit.skill.md", 110, 442);
  const lines = [["# What a premium edit looks like", INK], ["→ cut every fumble", INK], ["→ kinetic captions", INK], ["→ words behind the head", INK],
    ["→ sound design on every cut", INK], ["→ cinematic grade", INK], ["→ never basic.", RED]];
  lines.forEach(([s, col], i) => { const lp = clamp((t - W(150) - i * 0.42) / 0.35); if (lp <= 0) return;
    font(c, i ? 600 : 800, i ? 34 : 31, MONO); c.fillStyle = col; c.fillText(s.slice(0, Math.ceil(s.length * lp)), 110, 525 + i * 60); });
  c.restore();
}
async function bCheap(c, t) {
  hand(c, "honestly...", 540, 150, 70, W(159) - 0.05, t, "#666", 0.4);
  hand(c, "everyone uses Claude", 540, 250, 92, W(160) - 0.05, t, INK, 0.6);
  const img = await stockFrame("42620", t - W(160), 720, 405);
  tapedCard(c, img, 230, 320, 620, 349, 0.03, win(t, W(160) - 0.1, 0.35));
  // three cheap-looking thumbnails
  const tp = win(t, W(166) - 0.1, 0.3);
  for (let i = 0; i < 3; i++) { const p = clamp(tp * 1.4 - i * 0.2); if (p <= 0) continue;
    const x = 80 + i * 320, y = 760; c.save(); c.globalAlpha *= clamp(p * 2); c.translate(x + 140, y + 100); c.scale(lerp(0.7, 1, eBack(p)), lerp(0.7, 1, eBack(p))); c.rotate((i - 1) * 0.04);
    c.fillStyle = "#9AA3AD"; c.fillRect(-140, -100, 280, 200); c.fillStyle = "#C8CDD2"; c.beginPath(); c.arc(0, -10, 44, 0, 7); c.fill(); c.fillRect(-70, 40, 140, 60);
    font(c, 900, 30, MONT); c.textAlign = "center"; c.lineWidth = 6; c.strokeStyle = "#000"; c.strokeText("SAME CAPTIONS", 0, 80); c.fillStyle = YEL; c.fillText("SAME CAPTIONS", 0, 80);
    c.restore(); }
  const sp = win(t, W(170) - 0.04, 0.16);
  if (sp > 0) { c.save(); c.translate(540, 870); c.rotate(-0.12); const s = lerp(2.4, 1, eOut(sp)); c.scale(s, s);
    font(c, 400, 210, COND); c.textAlign = "center"; c.textBaseline = "middle"; const w = c.measureText("CHEAP").width + 70;
    c.globalAlpha *= 0.92; c.strokeStyle = RED; c.lineWidth = 12; rr(c, -w / 2, -110, w, 210, 20); c.stroke(); c.fillStyle = RED; c.fillText("CHEAP", 0, 6); c.restore(); }
}
function bTool(c, t) {
  hand(c, "it's not the", 540, 330, 96, W(171), t, INK, 0.5);
  font(c, 400, 230, COND); c.textAlign = "center"; const p = win(t, W(174) - 0.06, 0.2);
  if (p > 0) { c.save(); c.globalAlpha *= p; c.fillStyle = INK; c.fillText("TOOL", 540, 560); c.restore(); }
  marker(c, [[330, 480], [760, 470]], win(t, WE(174) + 0.05, 0.25), RED, 16);
  hand(c, "it's", 270, 760, 110, W(175), t, INK, 0.3);
  font(c, 400, 200, COND); const p2 = win(t, W(176) - 0.05, 0.2);
  if (p2 > 0) { c.save(); c.globalAlpha *= p2; c.fillStyle = RED; c.fillText("HOW", 560, 800); c.restore(); }
  marker(c, ellipsePts(560, 725, 190, 115, 60, 0.04), win(t, W(176) + 0.1, 0.5), INK, 7);
  hand(c, "you use it", 560, 960, 110, W(177), t, INK, 0.5);
}

// --------------------------------------------------------------- course: laptop mockup (DOM 3D)
cue("rise", T.course0, 0.6); cue("thud", T.course0 + 0.45, 0.6); [193, 196, 199].forEach((i) => cue("tick", W(i) + 0.1, 0.6)); cue("whoosh_soft", T.course1, 0.5);
function laptop(t) {
  const a = smooth(t, T.course0, T.course0 + 0.5) * (1 - smooth(t, T.course1, T.course1 + 0.35));
  if (a <= 0.001) { lapBody.style.opacity = 0; return false; }
  const e = eOut(a), sway = Math.sin(t * 0.9) * 2.5;
  lapBody.style.opacity = Math.min(1, a * 1.6);
  lapBody.style.transform = `translateY(${lerp(1960, 900, e)}px) rotateX(${lerp(30, 8, e)}deg) rotateY(${sway - 6 * (1 - e)}deg) rotateZ(${lerp(-6, 0, e)}deg)`;
  lid.style.transform = `rotateX(${lerp(-60, -6, eOut(smooth(t, T.course0 + 0.15, T.course0 + 0.6)))}deg)`;
  // screen UI
  const c = SX, w = SCR.width, h = SCR.height; c.clearRect(0, 0, w, h);
  c.fillStyle = "#FBFAF7"; c.fillRect(0, 0, w, h);
  c.fillStyle = INK; c.fillRect(0, 0, w, 44); c.beginPath(); c.arc(24, 22, 7, 0, 7); c.fillStyle = RED; c.fill();
  font(c, 800, 20, SANS); c.fillStyle = "#fff"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText("VIBE EDITING  ·  The Course", 42, 23);
  c.textBaseline = "alphabetic"; font(c, 400, 56, COND); c.fillStyle = INK; c.fillText("EDIT LIKE A PRO.", 32, 118);
  font(c, 700, 34, DIDONE, true); c.fillStyle = RED; c.fillText("just by talking to Claude", 32, 162);
  const mods = [["01", "My prompts", 193], ["02", "My skill files", 196], ["03", "The whole workflow", 199]];
  mods.forEach(([n, s, wi], i) => { const p = eOut(win(t, W(wi - 1) - 0.1, 0.3)); const y = 200 + i * 70;
    c.save(); c.globalAlpha = 0.35 + 0.65 * p; rr(c, 32, y, 684, 56, 14); c.fillStyle = "#fff"; c.fill(); c.strokeStyle = p > 0.5 ? RED : "rgba(0,0,0,0.1)"; c.lineWidth = 2; c.stroke();
    font(c, 700, 20, MONO); c.fillStyle = RED; c.fillText(n, 52, y + 36); font(c, 800, 26, SANS); c.fillStyle = INK; c.fillText(s, 100, y + 37);
    const ck = win(t, W(wi) + 0.05, 0.25); if (ck > 0) { c.beginPath(); c.arc(684, y + 28, 15 * eBack(ck, 2), 0, 7); c.fillStyle = "#2BD46A"; c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 3.5; c.beginPath(); c.moveTo(677, y + 28); c.lineTo(682, y + 33); c.lineTo(692, y + 22); c.stroke(); } c.restore(); });
  rr(c, 32, 410, 230, 32, 16); c.fillStyle = RED; c.fill(); font(c, 800, 18, SANS); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText("Join now  →", 147, 432);
  return true;
}

// --------------------------------------------------------------- CTA + end card
cue("camera", W(208), 0.5); cue("pop", T.cta + 0.05, 0.7); cue("enter", W(211) + 0.08, 0.6); cue("whoosh", ENDT + 0.05, 0.6); cue("bass_drop", ENDT + 0.2, 0.8);
function ctaTitles(c, t) {
  if (t >= W(207) - 0.1 && t < T.end + 0.4) chrome(c, "LIKE THIS", 540, 640, 165, t, W(207) - 0.1, T.end + 0.3);
}
function ctaButton(c, t) {
  const p = win(t, T.cta, 0.4); if (p <= 0) return;
  const press = Math.max(0, 1 - Math.abs(t - W(211) - 0.1) / 0.12), y = 1545, w = 760, h = 120;
  c.save(); c.translate(540, y + h / 2 + (1 - eBack(p, 1.6)) * 200); c.scale(1 - 0.06 * press, 1 - 0.06 * press); c.globalAlpha = clamp(p * 2);
  c.shadowColor = "rgba(232,35,27,0.55)"; c.shadowBlur = 60; c.shadowOffsetY = 14;
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, RED2); g.addColorStop(1, "#C3120C");
  rr(c, -w / 2, -h / 2, w, h, 60); c.fillStyle = g; c.fill(); c.shadowColor = "transparent";
  c.save(); rr(c, -w / 2, -h / 2, w, h, 60); c.clip(); const sx = -w / 2 - 200 + ((t - T.cta) % 1.8) / 1.8 * (w + 400);
  const sg = c.createLinearGradient(sx - 90, 0, sx + 90, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.4)"); sg.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = sg; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  font(c, 900, 46, SANS); c.letterSpacing = "-1px"; c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("LEARN THE WORKFLOW", -26, 3); c.letterSpacing = "0px";
  const ay = Math.sin(t * 7) * 8; c.strokeStyle = "#fff"; c.lineWidth = 7; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(300, -20 + ay); c.lineTo(300, 20 + ay); c.moveTo(286, 6 + ay); c.lineTo(300, 20 + ay); c.lineTo(314, 6 + ay); c.stroke();
  c.restore();
  const rp = win(t, W(211), 0.6); if (rp > 0 && rp < 1) { c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - rp)})`; c.lineWidth = 4; c.beginPath(); c.arc(540, y + h / 2, 40 + rp * 260, 0, 7); c.stroke(); }
}
function endCard(c, t) {
  const p = win(t, T.end, 0.5); if (p <= 0) return;
  c.save(); c.globalAlpha = eOut(p) * 0.55; c.fillStyle = "#000"; c.fillRect(0, 0, W_, H_); c.restore();
  const el = (d, fn) => { const q = eOut(win(t, T.end + d, 0.4)); if (q <= 0) return; c.save(); c.globalAlpha = q; c.translate(0, (1 - q) * 30); if (q < 1) c.filter = `blur(${((1 - q) * 8).toFixed(1)}px)`; fn(); c.restore(); };
  el(0.15, () => { font(c, 800, 26, SANS); c.letterSpacing = "8px"; c.fillStyle = RED2; c.textAlign = "center"; c.fillText("✦  VIBE EDITING  ✦", 540, 560); c.letterSpacing = "0px"; });
  el(0.3, () => { font(c, 400, 190, COND); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText("THE COURSE", 540, 770); });
  el(0.45, () => { font(c, 700, 58, DIDONE, true); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText("prompts · skill files · workflow", 540, 860); });
}

// --------------------------------------------------------------- flashes / glitch transitions (reference style, 2-3 frames)
const FLASH = [[T.code0, "invert"], [T.code1 - 0.07, "pixel"], [T.mag - 0.07, "white"], [T.grid0, "invert"], [T.board + 0.5, "white"], [T.back + 0.5, "white"], [T.course0 + 0.4, "pixel"], [ENDT + 0.08, "invert"]];
function flashes(c, t) {
  for (const [ft, kind] of FLASH) {
    const k = (t - ft) * fps; if (k < 0 || k >= 3) continue;
    if (kind === "white") { c.fillStyle = `rgba(255,255,255,${0.85 - k * 0.28})`; c.fillRect(0, 0, W_, H_); }
    if (kind === "invert") { c.save(); c.globalCompositeOperation = "difference"; c.fillStyle = k < 1 ? "#fff" : "#7fdfff"; c.fillRect(0, 0, W_, H_); c.restore(); }
    if (kind === "pixel") { smX.imageSmoothingEnabled = false; smX.drawImage(C, 0, 0, 108 / (k + 1) * 1.5, 192 / (k + 1) * 1.5); c.imageSmoothingEnabled = false; c.drawImage(smC, 0, 0, 108 / (k + 1) * 1.5, 192 / (k + 1) * 1.5, 0, 0, W_, H_); c.imageSmoothingEnabled = true; }
  }
}

// --------------------------------------------------------------- frame
async function renderAt(fi) {
  const t = fi / fps, src = TL.frames[fi];
  const img = await loadImg(`${TL.frame_dir}/s${pad(src, 5)}.jpg`);
  const cam = camera(t, fi), hs = headScreen(cam, fi);
  const inCode = t >= T.code0 && t < T.code1, inGrid = t >= T.grid0 && t < T.grid1;
  const bk = boardAmt(t), cutting = t >= T.cut0 && t < T.back + 0.7;
  const depthNeeded = (t >= T.titles0 && t < T.barIn + 0.6) || (t >= T.mag && t < T.behind + 0.2) || (t >= T.behind && t < T.hand + 0.2) || t >= W(207) - 0.1 || cutting;
  let maskOK = false;
  if (depthNeeded && TL.has_mask[fi]) {
    const m = await loadImg(`${TL.mask_dir}/s${pad(src, 5)}.png`);
    mX.clearRect(0, 0, 576, 1024); mX.drawImage(m, 0, 0); const id = mX.getImageData(0, 0, 576, 1024), d = id.data;
    for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 255; } mX.putImageData(id, 0, 0); maskOK = true;
  }
  const person = () => {   // matted person into perC with the camera transform
    perX.clearRect(0, 0, W_, H_); perX.drawImage(img, cam.x0, cam.y0, W_ * cam.z, H_ * cam.z);
    perX.globalCompositeOperation = "destination-in"; perX.drawImage(mC, cam.x0, cam.y0, W_ * cam.z, H_ * cam.z); perX.globalCompositeOperation = "source-over";
  };
  Q.clearRect(0, 0, W_, H_);
  // ---- main world
  if (inCode) await codeCut(X, t);
  else if (inGrid) recap(X, t, img, cam, hs);
  else if (cutting && maskOK) {
    const sx = stickerXf(t);
    // background: wall fades/darkens while lifted, then the whiteboard slides in
    X.drawImage(img, cam.x0, cam.y0, W_ * cam.z, H_ * cam.z);
    if (sx.lift > 0) { X.fillStyle = `rgba(10,10,12,${0.55 * sx.lift * (1 - bk)})`; X.fillRect(0, 0, W_, H_); }
    if (bk > 0) { X.save(); X.translate((1 - eOut(bk)) * W_, 0); whiteboard(X, t); await boardContent(X, t, img, bk); X.restore(); }
    person();
    // sticker outline (white), drawn from the dilated matte
    const ol = smooth(t, W(90), W(90) + 0.5) * (1 - smooth(t, T.back + 0.45, T.back + 0.7));
    X.save(); X.translate(540, 960); X.scale(sx.s, sx.s); X.translate(-540 + sx.dx / sx.s, -960 + sx.dy / sx.s);
    if (ol > 0) {
      olX.clearRect(0, 0, 576, 1024); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; olX.drawImage(mC, Math.cos(a) * 6, Math.sin(a) * 6); }
      olX.globalCompositeOperation = "source-in"; olX.fillStyle = "#fff"; olX.fillRect(0, 0, 576, 1024); olX.globalCompositeOperation = "source-over";
      olX.save(); olX.globalCompositeOperation = "destination-over"; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; olX.drawImage(mC, Math.cos(a) * 7.2, Math.sin(a) * 7.2); }
      olX.globalCompositeOperation = "source-atop"; olX.restore();
      olX.save(); olX.globalCompositeOperation = "destination-over"; olX.filter = "none"; olX.restore();
      X.save(); X.shadowColor = `rgba(0,0,0,${0.3 + 0.25 * Math.max(sx.lift, bk)})`; X.shadowBlur = 46; X.shadowOffsetY = 22;
      const rev = clamp(ol * 1.2); X.beginPath(); X.rect(0, 0, W_, H_ * rev); X.clip();
      X.globalAlpha = ol; X.drawImage(olC, cam.x0, cam.y0, W_ * cam.z, H_ * cam.z); X.restore();
    }
    X.drawImage(perC, 0, 0); X.restore();
  } else {
    X.drawImage(img, cam.x0, cam.y0, W_ * cam.z, H_ * cam.z);
    if (maskOK) {
      hookTitles(X, t); magazine(X, t, hs, true); depthWords(X, t); ctaTitles(X, t);
      person(); X.drawImage(perC, 0, 0); hookTitles(X, t, true);
    } else { hookTitles(X, t); magazine(X, t, hs, true); depthWords(X, t); ctaTitles(X, t); }
    if (t >= T.mag && t < T.behind + 0.2) magazine(X, t, hs, false);
  }
  if (!inCode && !inGrid && !cutting) { await appWindows(X, t); }
  musicDrop(X, t); sfxBurst(X, t);
  const lapOn = laptop(t);
  // ---- overlay: captions, prompt bar, CTA, end card, flashes, grain
  for (const g of GROUPS) {
    if (g[2] === "basic") { if (t >= g.t0 && t < g.t1) capBasic(Q, g, t); continue; }
    if (t < g.t0 - 0.05 || t > g.t1 + 0.05) continue;
    if (g[2] === "hl") capHL(Q, g, t); else if (g[2] === "mag") capMag(Q, g, t); else if (g[2] === "hand") { if (!inGrid) capHand(Q, g, t, hs); }
    else if (g[2] === "board") capBoard(Q, g, t); else if (g[2] === "top") capTop(Q, g, t); else if (g[2] === "prem") capPrem(Q, g, t);
  }
  promptBar(Q, t); ctaButton(Q, t); endCard(Q, t);
  flashes(Q, t);
  Q.save(); Q.globalCompositeOperation = "overlay"; Q.globalAlpha = 0.07; Q.drawImage(grain[fi % 4], 0, 0, W_, H_); Q.restore();
  if (flashesNeedMain(t)) flashes(X, t);
}
const flashesNeedMain = () => false;

window.renderAt = renderAt;
window.SFX_CUES = CUES.sort((a, b) => a.t - b.t);
window.stageReady = (async () => {
  const faces = [`700 20px "Inter Tight"`, `800 20px "Inter Tight"`, `900 20px "Inter Tight"`, `600 20px "Inter Tight"`, `500 20px "Inter Tight"`,
    `italic 400 20px "Instrument Serif"`, `900 20px "Archivo Expanded"`, `20px "Anton"`, `900 20px "Playfair Display"`, `italic 700 20px "Playfair Display"`,
    `700 20px "Caveat"`, `900 20px "Montserrat"`, `700 20px "JetBrains Mono"`, `700 20px "Liberation Sans"`];
  await Promise.all(faces.map((f) => document.fonts.load(f, "AaVIBE✦→")));
  await document.fonts.ready; return true;
})();
})();

// The four pieces of every great edit.
// Painterly art-history collage: Van Gogh's Irises cut into four jigsaw pieces (hook, context,
// build-up, payoff) is the spine. The pieces break apart on grid paper, get collected one by one
// along a dark gallery wall where each piece has a real example in a gilded frame, snap back
// together above the brief, and end up in a project folder on a real wooden desk.
(function () {
const { C, W, H, clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, inOutSine, spring, rnd } = K;

// ------------------------------------------------------------------ palette --
const COL = {
  wall: "#24160f", cream: "#f3e6c4", ink: "#2a1a12", gold: "#d9b25a", goldHi: "#f6dc92", goldLo: "#6e4d17",
  yellow: "#f2c230", red: "#b3261e", paper: "#ece6d8", rope: "#7d1420",
};
const LABELS = ["HOOK", "CONTEXT", "BUILD-UP", "PAYOFF"];

// ------------------------------------------------------------------ helpers --
const font = (g, size, weight = 400, fam = "EB Garamond", style = "") => { g.font = `${style} ${weight} ${size}px "${fam}"`; };
function life(t, at, out, inDur = 0.8, outDur = 0.35) { return K.life(t, at, out, inDur, outDur); }

// Distressed (grunge) display type: rendered once per text/size/colour, then speckled away.
const DIST = (() => {
  const c = K.makeCanvas(1024, 512), g = c.getContext("2d"), r = rnd(9);
  for (let i = 0; i < 2600; i++) {
    const x = r() * 1024, y = r() * 512, s = r() < 0.92 ? 0.6 + r() * 2.2 : 3 + r() * 7;
    g.fillStyle = `rgba(0,0,0,${0.35 + r() * 0.65})`;
    g.beginPath(); g.ellipse(x, y, s * (0.6 + r()), s, r() * 3, 0, 7); g.fill();
  }
  for (let i = 0; i < 60; i++) {   // scratches
    g.strokeStyle = `rgba(0,0,0,${0.3 + r() * 0.5})`; g.lineWidth = 0.8 + r() * 1.5;
    const x = r() * 1024, y = r() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 160, y + (r() - 0.5) * 30); g.stroke();
  }
  return c;
})();
const gcache = new Map();
function grungeCanvas(text, size, color, fam = "Anton", seed = 1) {
  const key = [text, size, color, fam, seed].join("|");
  let c = gcache.get(key);
  if (c) return c;
  const m = K.makeCanvas(10, 10).getContext("2d");
  m.font = `${size}px "${fam}"`;
  const w = Math.ceil(m.measureText(text).width + size * 0.3), h = Math.ceil(size * 1.35);
  c = K.makeCanvas(w, h); const g = c.getContext("2d");
  g.font = `${size}px "${fam}"`; g.textBaseline = "middle"; g.textAlign = "center"; g.fillStyle = color;
  g.fillText(text, w / 2, h / 2);
  g.globalCompositeOperation = "destination-out";
  const r = rnd(seed), ox = r() * 600, oy = r() * 300;
  g.drawImage(DIST, -ox, -oy, 1024 * (size / 140) + 200, 512 * (size / 140) + 200);
  gcache.set(key, c);
  return c;
}
// draw grunge text centred at x,y with a slam-in (scale + fade) from `at`
function grunge(g, text, x, y, size, color, t, at, o = {}) {
  const L = life(t, at, o.out, o.inDur ?? 0.55);
  if (!L.on) return;
  const c = grungeCanvas(text, size, color, o.fam || "Anton", o.seed || text.length);
  const s = (o.slam ? 1 + 0.45 * (1 - outExpo(win(at, at + 0.35, t))) : 0.92 + 0.08 * L.p) * (1 - 0.1 * L.o);
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(s, s);
  g.globalAlpha = clamp(L.p * 2.2) * (1 - L.o);
  if (o.shadow !== false) { g.shadowColor = o.shadowCol || "rgba(0,0,0,0.55)"; g.shadowBlur = 18; g.shadowOffsetY = 6; }
  g.drawImage(c, -c.width / 2, -c.height / 2);
  g.restore();
}
function serif(g, text, x, y, size, color, t, at, o = {}) {
  const L = life(t, at, o.out, 0.7);
  if (!L.on) return;
  g.save(); g.globalAlpha = outCubic(win(at, at + 0.5, t)) * (1 - L.o);
  font(g, size, o.weight || 500, "EB Garamond", o.italic === false ? "" : "italic");
  g.textAlign = o.align || "center"; g.textBaseline = "middle"; g.fillStyle = color;
  if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = 12; g.shadowOffsetY = 3; }
  g.fillText(text, x, y + 16 * (1 - outCubic(win(at, at + 0.6, t))));
  g.restore();
}
function tag(g, text, x, y, t, at, o = {}) {   // small yellow highlight label
  const L = life(t, at, o.out, 0.7);
  if (!L.on) return;
  const size = o.size || 28;
  font(g, size, 800, "Inter");
  const w = g.measureText(text).width + size * 0.9, h = size * 1.5;
  g.save(); g.translate(x, y); g.rotate((o.rot || -2) * Math.PI / 180);
  const p = L.p; g.scale(p, p); g.globalAlpha = 1 - L.o;
  K.shadow(g, 10, 4, 0.35, "0,0,0");
  g.fillStyle = o.bg || COL.yellow; g.fillRect(-w / 2, -h / 2, w, h); K.noShadow(g);
  g.fillStyle = o.fg || COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, 2);
  g.restore();
}

// ------------------------------------------------------------------ textures --
const DAMASK = (() => {   // dark gallery wall with a faint damask motif
  const s = 300, c = K.makeCanvas(s, s), g = c.getContext("2d");
  g.fillStyle = COL.wall; g.fillRect(0, 0, s, s);
  const motif = (cx, cy, k) => {
    g.save(); g.translate(cx, cy); g.scale(k, k);
    g.fillStyle = "rgba(214,170,100,0.055)";
    for (const sx of [-1, 1]) {
      g.save(); g.scale(sx, 1);
      g.beginPath(); g.moveTo(0, -70); g.bezierCurveTo(40, -60, 55, -10, 20, 10); g.bezierCurveTo(60, 20, 50, 70, 0, 80);
      g.bezierCurveTo(10, 40, 30, 20, 0, 0); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(34, -36, 10, 18, -0.6, 0, 7); g.fill();
      g.restore();
    }
    g.beginPath(); g.ellipse(0, -84, 8, 12, 0, 0, 7); g.fill();
    g.restore();
  };
  motif(s / 2, s / 2, 1); motif(0, 0, 0.8); motif(s, 0, 0.8); motif(0, s, 0.8); motif(s, s, 0.8);
  const id = g.getImageData(0, 0, s, s), d = id.data, r = rnd(4);
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 12; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
})();
const GRID = (() => {    // cream grid paper, like the reference's puzzle board
  const c = K.makeCanvas(W, H), g = c.getContext("2d"), r = rnd(7);
  g.fillStyle = COL.paper; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) {
    const x = r() * W, y = r() * H, rad = 40 + r() * 200, gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(${r() < 0.5 ? "150,120,80" : "255,255,255"},0.05)`); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.strokeStyle = "rgba(90,110,130,0.16)"; g.lineWidth = 1.2; g.beginPath();
  for (let x = 0; x <= W; x += 36) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); }
  for (let y = 0; y <= H; y += 36) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); }
  g.stroke();
  g.strokeStyle = "rgba(90,110,130,0.30)"; g.lineWidth = 2; g.beginPath();
  for (let x = 0; x <= W; x += 144) { g.moveTo(x, 0); g.lineTo(x, H); }
  for (let y = 0; y <= H; y += 144) { g.moveTo(0, y); g.lineTo(W, y); }
  g.stroke();
  const id = g.getImageData(0, 0, W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
})();
let damaskPat = null;

// ------------------------------------------------------------------ gilded frame --
// Draws a carved gold frame around an inner w×h window centred on cx,cy; `fill(g,x,y,w,h)` paints inside.
function gilt(g, cx, cy, w, h, fill, o = {}) {
  const b = o.border ?? Math.max(22, Math.min(w, h) * 0.075);
  const x = cx - w / 2, y = cy - h / 2;
  g.save();
  K.shadow(g, 40, 22, 0.6, "0,0,0");
  g.fillStyle = COL.goldLo; g.fillRect(x - b, y - b, w + 2 * b, h + 2 * b);
  K.noShadow(g);
  // bevels: four trapezoids lit from top-left
  const side = (pts, c0, c1, gx0, gy0, gx1, gy1) => {
    const gr = g.createLinearGradient(gx0, gy0, gx1, gy1); gr.addColorStop(0, c0); gr.addColorStop(0.5, COL.goldHi); gr.addColorStop(1, c1);
    g.fillStyle = gr; g.beginPath(); pts.forEach(([a, c], i) => (i ? g.lineTo(a, c) : g.moveTo(a, c))); g.closePath(); g.fill();
  };
  side([[x - b, y - b], [x + w + b, y - b], [x + w, y], [x, y]], "#b88a32", "#7a5418", 0, y - b, 0, y);
  side([[x - b, y - b], [x, y], [x, y + h], [x - b, y + h + b]], "#c99a3e", "#7a5418", x - b, 0, x, 0);
  side([[x + w + b, y - b], [x + w + b, y + h + b], [x + w, y + h], [x + w, y]], "#7a5418", "#4e3410", x + w, 0, x + w + b, 0);
  side([[x - b, y + h + b], [x + w + b, y + h + b], [x + w, y + h], [x, y + h]], "#7a5418", "#4a300c", 0, y + h, 0, y + h + b);
  // bead moulding along the middle of the border
  g.fillStyle = "rgba(255,236,170,0.55)";
  const bead = (px, py) => { g.beginPath(); g.arc(px, py, b * 0.09, 0, 7); g.fill(); };
  const step = b * 0.55;
  for (let px = x - b * 0.5; px <= x + w + b * 0.5; px += step) { bead(px, y - b * 0.5); bead(px, y + h + b * 0.5); }
  for (let py = y - b * 0.5; py <= y + h + b * 0.5; py += step) { bead(x - b * 0.5, py); bead(x + w + b * 0.5, py); }
  // corner rosettes
  for (const [px, py] of [[x - b * 0.5, y - b * 0.5], [x + w + b * 0.5, y - b * 0.5], [x - b * 0.5, y + h + b * 0.5], [x + w + b * 0.5, y + h + b * 0.5]]) {
    const gr = g.createRadialGradient(px - b * 0.12, py - b * 0.12, 0, px, py, b * 0.42);
    gr.addColorStop(0, "#fff3c4"); gr.addColorStop(0.5, COL.gold); gr.addColorStop(1, "#5e3f10");
    g.fillStyle = gr; g.beginPath(); g.arc(px, py, b * 0.42, 0, 7); g.fill();
  }
  // inner lip + content
  g.fillStyle = "#1a120c"; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = "#111"; g.fillRect(x, y, w, h);
  if (fill) fill(g, x, y, w, h);
  const vg = g.createLinearGradient(x, y, x, y + h);   // glass sheen + inner shadow
  vg.addColorStop(0, "rgba(0,0,0,0.35)"); vg.addColorStop(0.08, "rgba(0,0,0,0)"); vg.addColorStop(0.92, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.3)");
  g.fillStyle = vg; g.fillRect(x, y, w, h);
  g.restore();
  g.restore();
}

// ------------------------------------------------------------------ jigsaw --
// Irises (1600x1269) cut into a 2x2 jigsaw. Piece k: i = k % 2, j = floor(k / 2).
const CW = 400, CH = 317;                       // one cell at scale 1 (whole puzzle 800x634)
const EDGES = [                                  // top, right, bottom, left: 0 flat, 1 tab out, -1 tab in
  [0, 1, 1, 0], [0, 0, -1, -1], [-1, -1, 0, 0], [1, 0, 0, 1],
];
function edge(g, ax, ay, bx, by, nx, ny, sign) {
  if (!sign) { g.lineTo(bx, by); return; }
  const s = 0.27 * Math.min(CW, CH) * sign;
  const P = (u, v) => [ax + (bx - ax) * u + nx * v * s, ay + (by - ay) * u + ny * v * s];
  g.lineTo(...P(0.37, 0));
  g.bezierCurveTo(...P(0.43, 0.32), ...P(0.29, 0.78), ...P(0.5, 0.82));
  g.bezierCurveTo(...P(0.71, 0.78), ...P(0.57, 0.32), ...P(0.63, 0));
  g.lineTo(bx, by);
}
function piecePath(g, k) {
  const [t, r, b, l] = EDGES[k];
  g.beginPath(); g.moveTo(0, 0);
  edge(g, 0, 0, CW, 0, 0, -1, t);
  edge(g, CW, 0, CW, CH, 1, 0, r);
  edge(g, CW, CH, 0, CH, 0, 1, b);
  edge(g, 0, CH, 0, 0, -1, 0, l);
  g.closePath();
}
// cx,cy: centre of the piece's cell on screen; s: scale; rot: degrees
function drawPiece(g, k, cx, cy, s, rot = 0, o = {}) {
  const im = K.image("fp_irises");
  if (!im || s <= 0) return;
  const i = k % 2, j = Math.floor(k / 2);
  g.save(); g.translate(cx, cy); g.rotate(rot * Math.PI / 180); g.scale(s, s); g.translate(-CW / 2, -CH / 2);
  g.globalAlpha = o.alpha ?? 1;
  piecePath(g, k);
  K.shadow(g, 26 / s * 0.6, 14 / s * 0.6, o.shadow ?? 0.45, "20,10,0");
  g.fillStyle = "#ddd"; g.fill(); K.noShadow(g);
  g.save(); piecePath(g, k); g.clip();
  g.drawImage(im, -i * CW, -j * CH, CW * 2, CH * 2);
  if (o.glow) { g.fillStyle = `rgba(255,230,150,${0.35 * o.glow})`; g.fillRect(-60, -60, CW + 120, CH + 120); }
  g.restore();
  piecePath(g, k); g.lineWidth = 3 / Math.max(s, 0.3); g.strokeStyle = "rgba(255,250,235,0.7)"; g.stroke();
  g.restore();
  if (o.label) tag(g, LABELS[k], cx + (o.lx || 0), cy + (o.ly || 0), o.lt ?? 99, o.lat ?? 0, { size: o.lsize || 30, rot: o.lrot ?? -2 });
}
function slotPath(g, k, cx, cy, s) {   // dashed outline of an empty piece slot
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-CW / 2, -CH / 2);
  piecePath(g, k); g.setLineDash([14, 10]); g.lineWidth = 3 / s; g.strokeStyle = "rgba(243,230,196,0.45)"; g.stroke();
  g.restore();
}

// ------------------------------------------------------------------ scene timing --
const SCROLL0 = C.h_scroll + 0.02, SCROLL1 = SCROLL0 + 0.8;
const BRIEF0 = C.s_brief, BRIEF1 = BRIEF0 + 0.9;
const DESK0 = C.s_desk, DESK1 = DESK0 + 0.8;
const STATIONS = [0, 1180, 2360, 3540];
const GLIDES = [C.s_context, C.s_build, C.s_payoff];
const GLIDE = 0.85;
// piece k gets collected (flies into the tracker) at:
const COLLECT = [C.k_stop + 0.3, C.c_line + 0.25, C.b_stakes + 0.32, C.p_for + 0.2];
const SLOT_Y = 228, SLOT_S = 0.27;
const slotX = (k) => 540 + (k - 1.5) * 152;

function cameraX(t) {
  let x = 0, moving = false, speed = 0;
  GLIDES.forEach((g0, i) => {
    const p = win(g0, g0 + GLIDE, t);
    x = lerp(x, STATIONS[i + 1], inOutQuint(p));
    if (p > 0.03 && p < 0.97) { moving = true; speed = Math.max(speed, Math.sin(Math.PI * p)); }
  });
  return { x, moving, speed };
}

// ------------------------------------------------------------------ scene 1: the puzzle on grid paper --
function puzzleScene(g, t) {
  g.drawImage(GRID, 0, 0);
  const z = 1.04 - 0.04 * outCubic(win(0, 2, t));
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  // title
  const words = [["Every", 0], ["great", C.h_great], ["edit", C.h_edit]];
  font(g, 112, 500, "EB Garamond", "italic"); g.textBaseline = "middle"; g.textAlign = "left";
  const full = "Every great edit", tw = g.measureText(full).width; let x = 540 - tw / 2;
  for (const [wd, at] of words) {
    const p = outCubic(win(at - 0.05, at + 0.35, t));
    g.globalAlpha = p; g.fillStyle = COL.ink; g.fillText(wd, x, 300 + 18 * (1 - p));
    x += g.measureText(wd + " ").width;
  }
  g.globalAlpha = 1;
  grunge(g, "HAS 4 PIECES", 540, 450, 118, "#3a2416", t, C.h_four - 0.05, { slam: true, shadow: false, seed: 3 });
  // the puzzle: assembled at first, splits on "pieces", one piece falls on "miss one"
  const split = outCubic(win(C.h_pieces - 0.15, C.h_pieces + 0.5, t));
  const gap = 30 * split;
  const PX = 540, PY = 1010;
  // thin gold frame around the assembled picture, fading as it splits
  if (split < 1) {
    g.save(); g.globalAlpha = 1 - split;
    gilt(g, PX, PY, CW * 2, CH * 2, null, { border: 26 });
    g.restore();
  }
  for (let k = 0; k < 4; k++) {
    const i = k % 2, j = Math.floor(k / 2);
    let cx = PX + (i - 0.5) * (CW + gap * 2), cy = PY + (j - 0.5) * (CH + gap * 2), rot = [-3, 2.5, -2, 3][k] * split;
    let alpha = 1;
    if (k === 2) {                       // the missing piece
      const f = win(C.h_miss - 0.05, C.h_miss + 1.1, t);
      cy += 1500 * f * f; rot += -40 * f; cx -= 120 * f; alpha = 1 - clamp((f - 0.6) * 2.5);
    }
    if (alpha > 0) drawPiece(g, k, cx, cy, 1, rot, { alpha, label: split > 0.05, lt: t, lat: C.h_pieces + 0.12 * k, lsize: 30, ly: 0 });
  }
  // the empty slot where the missing piece was
  if (t > C.h_miss) {
    g.save(); g.globalAlpha = outCubic(win(C.h_miss, C.h_miss + 0.4, t));
    slotPath(g, 2, PX - 0.5 * (CW + gap * 2), PY + 0.5 * (CH + gap * 2), 1);
    g.restore();
    grunge(g, "MISS ONE", 540, 1440, 104, COL.red, t, C.h_miss - 0.02, { slam: true, shadow: false, rot: -4, seed: 8 });
  }
  g.restore();
}

// ------------------------------------------------------------------ gallery wall --
function velvetRope(g, x0, x1, y) {
  const post = (x) => {
    const gr = g.createLinearGradient(x - 12, 0, x + 12, 0);
    gr.addColorStop(0, "#6b4a17"); gr.addColorStop(0.45, "#f3d27a"); gr.addColorStop(1, "#6b4a17");
    g.fillStyle = gr; g.fillRect(x - 9, y - 70, 18, 150);
    g.beginPath(); g.ellipse(x, y + 82, 46, 12, 0, 0, 7); g.fill();
    g.beginPath(); g.arc(x, y - 78, 16, 0, 7); g.fill();
  };
  g.save();
  K.shadow(g, 14, 8, 0.5, "0,0,0");
  g.strokeStyle = COL.rope; g.lineWidth = 16; g.lineCap = "round";
  g.beginPath(); g.moveTo(x0, y - 62); g.quadraticCurveTo((x0 + x1) / 2, y + 40, x1, y - 62); g.stroke();
  K.noShadow(g);
  g.strokeStyle = "rgba(255,120,130,0.35)"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(x0, y - 68); g.quadraticCurveTo((x0 + x1) / 2, y + 32, x1, y - 68); g.stroke();
  post(x0); post(x1);
  g.restore();
}
function spotlight(g, x, y, r, a = 0.32) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(255,214,150,${a})`); gr.addColorStop(1, "rgba(255,214,150,0)");
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
function wainscot(g, x0, x1) {
  const y = 1440;
  const gr = g.createLinearGradient(0, y, 0, H);
  gr.addColorStop(0, "#3a2212"); gr.addColorStop(1, "#1a0e07");
  g.fillStyle = gr; g.fillRect(x0, y, x1 - x0, H - y);
  g.fillStyle = "#5a361a"; g.fillRect(x0, y - 14, x1 - x0, 18);
  g.fillStyle = "rgba(255,210,150,0.15)"; g.fillRect(x0, y - 14, x1 - x0, 3);
  g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 4;
  for (let px = Math.floor(x0 / 360) * 360; px < x1; px += 360) g.strokeRect(px + 30, y + 40, 300, 380);
}

function drawWall(g, t) {
  const cam = cameraX(t);
  const camX = cam.x;
  // wall pattern scrolls with the camera
  if (!damaskPat) damaskPat = g.createPattern(DAMASK, "repeat");
  g.save(); g.translate(-camX, 0);
  g.fillStyle = damaskPat; g.fillRect(camX - 20, 0, W + 40, H);
  wainscot(g, camX - 20, camX + W + 40);
  // stations
  STATIONS.forEach((sx, k) => {
    if (Math.abs(sx - camX) > W + 200) return;
    g.save(); g.translate(sx, 0);
    STATION[k](g, t);
    velvetRope(g, 130, 950, 1360);
    g.restore();
  });
  g.restore();
  return cam;
}
// station title block: "PIECE 0k" tag + grunge name
function stationTitle(g, t, k, at) {
  tag(g, `PIECE 0${k + 1}`, 540, 372, t, at - 0.3, { size: 26, rot: -2 });
  grunge(g, `THE ${LABELS[k]}`, 540, 476, 132, COL.cream, t, at - 0.05, { slam: true, seed: 20 + k });
}
const coverFrame = (im) => (g, x, y, w, h) => K.drawFit(g, im, x, y, w, h);

const STATION = [
  // 01 · the hook: a balloon that pops on "stop"
  (g, t) => {
    spotlight(g, 540, 600, 620);
    stationTitle(g, t, 0, C.k_hook);
    const clip0 = C.k_stop - 0.8;
    const z = 1 + 0.06 * outCubic(win(C.k_stop - 0.1, C.k_stop + 0.4, t)) - 0.03 * win(C.k_stop + 0.4, C.k_stop + 1.2, t);
    g.save(); g.translate(540, 880); g.scale(z, z); g.translate(-540, -880);
    gilt(g, 540, 880, 760, 470, (g2, x, y, w, h) => {
      K.drawFit(g2, K.footage("fp_balloon", t - clip0), x, y, w, h, { zoom: 1.15, fy: 0.45 });
      // timecode in the corner: 0:00 -> 0:01 on "second"
      const tc = t < C.k_second ? "0:00" : "0:01";
      font(g2, 30, 800, "Inter"); const tw = g2.measureText(tc).width + 26;
      g2.fillStyle = t < C.k_second ? "rgba(20,14,10,0.75)" : COL.yellow; g2.fillRect(x + 22, y + 22, tw, 46);
      g2.fillStyle = t < C.k_second ? COL.cream : COL.ink; g2.textBaseline = "middle"; g2.textAlign = "left"; g2.fillText(tc, x + 35, y + 46);
      // a thin progress bar along the bottom: the first second
      const p = clamp((t - C.k_first) / (C.k_stop - C.k_first));
      g2.fillStyle = "rgba(0,0,0,0.5)"; g2.fillRect(x, y + h - 10, w, 10);
      g2.fillStyle = COL.yellow; g2.fillRect(x, y + h - 10, w * p * 0.25, 10);
    });
    g.restore();
    grunge(g, "STOP.", 830, 700, 120, COL.red, t, C.k_stop - 0.04, { slam: true, rot: 8, seed: 31 });
    serif(g, "the first second", 540, 1235, 64, COL.cream, t, C.k_first - 0.1, { shadow: "rgba(0,0,0,0.6)" });
  },
  // 02 · the context: one line, typed over a Pissarro, with a real clock
  (g, t) => {
    spotlight(g, 540, 600, 620);
    stationTitle(g, t, 1, C.c_context);
    const L = life(t, C.s_context + 0.2, null, 0.9);
    g.save(); g.globalAlpha = clamp(L.p * 2); g.translate(0, 40 * (1 - L.p));
    gilt(g, 540, 880, 760, 560, (g2, x, y, w, h) => {
      g2.filter = "brightness(0.62) saturate(0.85)";
      K.drawFit(g2, K.image("fp_rouen"), x, y, w, h, { zoom: 1.05 + 0.04 * win(C.s_context, C.s_build, t) });
      g2.filter = "none";
      // parchment strip with the one line
      const py = y + h * 0.56, ph = 150;
      g2.fillStyle = "rgba(240,226,190,0.95)"; g2.fillRect(x + 36, py, w - 72, ph);
      g2.strokeStyle = "rgba(110,80,40,0.5)"; g2.lineWidth = 2; g2.strokeRect(x + 46, py + 10, w - 92, ph - 20);
      font(g2, 22, 800, "Inter"); g2.fillStyle = "#7a5418"; g2.textAlign = "left"; g2.textBaseline = "middle";
      g2.fillText("EXAMPLE · ONE LINE", x + 66, py + 36);
      const line = "“This one habit saves you hours.”";
      font(g2, 44, 500, "EB Garamond", "italic"); g2.fillStyle = COL.ink;
      const shown = K.typed(line, t, C.c_why - 0.1, 26);
      g2.fillText(shown, x + 66, py + 95);
      if (shown.length < line.length && t > C.c_why - 0.1 && Math.floor(t * 3) % 2 === 0) {
        const cw = g2.measureText(shown).width; g2.fillRect(x + 70 + cw, py + 74, 3, 42);
      }
      // highlighter sweep on "one line"
      const hp = outCubic(win(C.c_one - 0.05, C.c_one + 0.45, t));
      if (hp > 0) { g2.globalCompositeOperation = "multiply"; g2.fillStyle = "rgba(242,194,48,0.55)"; g2.fillRect(x + 60, py + 74, (g2.measureText(line).width + 10) * hp, 44); g2.globalCompositeOperation = "source-over"; }
    });
    g.restore();
    // a real alarm clock leaning on the frame
    const ck = K.object("hw_clock");
    const cp = spring(win(C.c_why - 0.3, C.c_why + 0.5, t));
    if (ck && cp > 0) {
      g.save(); g.translate(880, 640); g.rotate((12 + 4 * Math.sin(t * 9) * win(C.c_why, C.c_why + 0.3, t) * (1 - win(C.c_matters, C.c_matters + 0.4, t))) * Math.PI / 180); g.scale(cp, cp);
      K.shadow(g, 24, 14, 0.55, "0,0,0"); g.drawImage(ck, -95, -140, 190, 190 * ck.height / ck.width); g.restore();
    }
    tag(g, "1 LINE. NO MORE.", 540, 1235, t, C.c_one - 0.05, { size: 34, rot: -1.5 });
  },
  // 03 · the build-up: three shots, each bigger
  (g, t) => {
    spotlight(g, 540, 640, 680);
    stationTitle(g, t, 2, C.b_build);
    const shots = [
      { at: C.b_build + 0.25, cx: 290, cy: 1160, w: 330, h: 205, rot: -4, clip: "fp_laces", n: "I", lt: (tt) => tt - (C.b_build + 0.25) },
      { at: C.b_shot - 0.1, cx: 470, cy: 965, w: 460, h: 285, rot: 3, clip: "fp_run", n: "II", lt: (tt) => tt - (C.b_shot - 0.1) + 1.2 },
      { at: C.b_raising - 0.1, cx: 650, cy: 755, w: 600, h: 370, rot: -2, clip: "fp_swing", n: "III", lt: (tt) => (tt - (C.b_raising - 0.1)) * 2.2 + 2.6 },
    ];
    // rising arrow behind the frames on "stakes"
    const ap = outCubic(win(C.b_stakes - 0.25, C.b_stakes + 0.45, t));
    if (ap > 0) {
      g.save(); g.strokeStyle = COL.yellow; g.lineWidth = 10; g.lineCap = "round"; g.setLineDash([26, 18]);
      const x0 = 150, y0 = 1330, x1 = 960, y1 = 560;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, ap), lerp(y0, y1, ap)); g.stroke();
      g.restore();
    }
    shots.forEach((s) => {
      const L = life(t, s.at, null, 0.75);
      if (!L.on) return;
      g.save(); g.translate(s.cx, s.cy + 120 * (1 - L.p)); g.rotate((s.rot + 8 * (1 - L.p)) * Math.PI / 180); g.scale(0.7 + 0.3 * L.p, 0.7 + 0.3 * L.p);
      g.globalAlpha = clamp(L.p * 2.5);
      gilt(g, 0, 0, s.w, s.h, (g2, x, y, w, h) => K.drawFit(g2, K.footage(s.clip, Math.max(0, s.lt(t))), x, y, w, h), { border: Math.max(18, s.w * 0.05) });
      tag(g, s.n, -s.w / 2 + 34, -s.h / 2 + 30, t, s.at + 0.15, { size: 26, rot: -4 });
      g.restore();
    });
    grunge(g, "STAKES ↑", 800, 1190, 92, COL.yellow, t, C.b_stakes - 0.08, { slam: true, rot: -6, seed: 44 });
  },
  // 04 · the payoff: the reveal, with a burst of light
  (g, t) => {
    // god rays behind the frame
    const rp = outCubic(win(C.p_moment - 0.35, C.p_moment + 0.6, t));
    if (rp > 0) {
      g.save(); g.translate(540, 880); g.rotate(t * 0.08); g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2, len = 1300 * rp, wdt = 0.07;
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, len);
        gr.addColorStop(0, `rgba(255,214,120,${0.38 * rp})`); gr.addColorStop(1, "rgba(255,214,120,0)");
        g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, len, a - wdt, a + wdt); g.closePath(); g.fill();
      }
      g.restore();
    }
    spotlight(g, 540, 640, 700, 0.28 + 0.25 * rp);
    stationTitle(g, t, 3, C.p_payoff);
    const clip0 = C.p_moment - 0.7;
    const z = 1 + 0.05 * outCubic(win(C.p_moment - 0.2, C.p_moment + 0.6, t));
    g.save(); g.translate(540, 880); g.scale(z, z); g.translate(-540, -880);
    gilt(g, 540, 880, 800, 500, (g2, x, y, w, h) => {
      K.drawFit(g2, K.footage("fp_gift", Math.max(0, t - clip0)), x, y, w, h, { zoom: 1.08 });
      const fl = Math.max(0, 1 - Math.abs(t - C.p_moment) / 0.35);   // flash on the reveal
      if (fl > 0) { g2.fillStyle = `rgba(255,240,200,${0.55 * fl})`; g2.fillRect(x, y, w, h); }
    });
    g.restore();
    // sparkles
    if (rp > 0) {
      const r = rnd(5);
      for (let i = 0; i < 26; i++) {
        const a = r() * Math.PI * 2, d = 380 + r() * 260, life2 = (t - C.p_moment + r() * 0.6);
        if (life2 < 0) continue;
        const px = 540 + Math.cos(a) * d * (0.6 + 0.4 * outCubic(clamp(life2))), py = 880 + Math.sin(a) * d * 0.75 * (0.6 + 0.4 * outCubic(clamp(life2)));
        const s = (4 + r() * 6) * (0.6 + 0.4 * Math.sin(t * 6 + i));
        g.fillStyle = `rgba(255,236,170,${0.8 * clamp(1.6 - life2)})`; g.beginPath(); g.arc(px, py, s, 0, 7); g.fill();
      }
    }
    serif(g, "the moment they came for", 540, 1235, 60, COL.cream, t, C.p_moment - 0.05, { shadow: "rgba(0,0,0,0.6)" });
  },
];

// tracker of collected pieces (screen space, on the wall)
function tracker(g, t, alpha) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha = alpha;
  for (let k = 0; k < 4; k++) {
    const c = COLLECT[k];
    const x = slotX(k);
    if (t < c + 0.6) slotPath(g, k, x, SLOT_Y, SLOT_S);
    font(g, 19, 800, "Inter"); g.fillStyle = t > c + 0.4 ? COL.yellow : "rgba(243,230,196,0.5)";
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(LABELS[k], x, SLOT_Y + 70);
    if (t < c) continue;
    const p = outQuint(win(c, c + 0.7, t));
    const sx = lerp(540, x, p), sy = lerp(880, SLOT_Y, p) - 120 * Math.sin(Math.PI * p);
    const s = lerp(0.62, SLOT_S, p), rot = lerp(-10, 0, p);
    drawPiece(g, k, sx, sy, s, rot, { glow: 1 - win(c + 0.6, c + 1.1, t), shadow: 0.5 });
  }
  g.restore();
}

// ------------------------------------------------------------------ the brief --
const BRIEF_LINES = [
  ["HOOK", "open on the balloon pop, at 0:01"],
  ["CONTEXT", "one line on why it matters"],
  ["BUILD-UP", "three shots, each one bigger"],
  ["PAYOFF", "end on the big reveal"],
];
const BP = { x: 540, y: 560, s: 0.7 };   // assembled puzzle in the brief scene
function briefScene(g, t, layerDy) {
  g.drawImage(GRID, 0, 0);
  serif(g, "With vibe editing,", 540, 205, 80, COL.ink, t, C.v_vibe - 0.15, { weight: 500 });
  // pieces: from tracker slots (screen) to assembled puzzle; gaps close on "all four"
  const fly = inOutQuint(win(BRIEF0, BRIEF1 + 0.1, t));
  const snap = outCubic(win(C.v_all - 0.1, C.v_four + 0.15, t));
  for (let k = 0; k < 4; k++) {
    const i = k % 2, j = Math.floor(k / 2);
    const gap = 26 * (1 - snap);
    const tx = BP.x + (i - 0.5) * (CW * BP.s + gap * 2), ty = BP.y + (j - 0.5) * (CH * BP.s + gap * 2);
    const x = lerp(slotX(k), tx, fly), y = lerp(SLOT_Y - layerDy, ty, fly);
    const s = lerp(SLOT_S, BP.s, fly), rot = lerp(0, [-3, 2, -2, 3][k], fly) * (1 - snap);
    drawPiece(g, k, x, y, s, rot, { glow: Math.max(0, 1 - Math.abs(t - C.v_four - 0.2) / 0.4) });
  }
  if (snap > 0.95) {   // completed picture gets a gold frame line
    g.save(); g.globalAlpha = outCubic(win(C.v_four + 0.1, C.v_four + 0.5, t));
    g.strokeStyle = COL.gold; g.lineWidth = 6; g.strokeRect(BP.x - CW * BP.s - 8, BP.y - CH * BP.s - 8, CW * BP.s * 2 + 16, CH * BP.s * 2 + 16);
    g.restore();
  }
  // the brief card
  const cp = spring(win(C.v_write - 0.35, C.v_write + 0.5, t));
  if (cp > 0) {
    const cx = 540, cy = 1020 + 260 * (1 - cp), w = 920, h = 400;
    g.save(); g.translate(cx, cy); g.rotate(-1 * Math.PI / 180);
    K.shadow(g, 30, 16, 0.4, "40,20,0");
    g.fillStyle = "#f4ead0"; g.fillRect(-w / 2, -h / 2, w, h); K.noShadow(g);
    g.strokeStyle = "rgba(120,90,40,0.35)"; g.lineWidth = 2; g.strokeRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24);
    font(g, 24, 800, "Inter"); g.fillStyle = "#7a5418"; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText("THE BRIEF", -w / 2 + 44, -h / 2 + 46);
    font(g, 22, 600, "Inter"); g.textAlign = "right"; g.fillStyle = "rgba(122,84,24,0.7)"; g.fillText("plain English", w / 2 - 44, -h / 2 + 46);
    BRIEF_LINES.forEach(([lab, txt], k) => {
      const at = C.v_write + k * 0.32, y = -h / 2 + 118 + k * 72;
      const p = outCubic(win(at - 0.1, at + 0.3, t));
      if (p <= 0) return;
      g.globalAlpha = p;
      drawPiece(g, k, -w / 2 + 66, y, 0.105, 0, { shadow: 0.25 });
      font(g, 26, 800, "Inter"); g.textAlign = "left"; g.fillStyle = COL.ink; g.fillText(lab, -w / 2 + 120, y);
      font(g, 38, 500, "EB Garamond", "italic"); g.fillStyle = "#3b2a1c";
      g.fillText(K.typed(txt, t, at, 46), -w / 2 + 300, y + 2);
      g.globalAlpha = 1;
    });
    g.restore();
  }
  // the AI builds around them: a timeline strip assembles
  const sp = outCubic(win(C.v_ai - 0.3, C.v_ai + 0.3, t));
  if (sp > 0) {
    const y = 1325, x0 = 90, w = 900, hgt = 118;
    g.save(); g.globalAlpha = sp;
    g.fillStyle = "rgba(36,22,15,0.92)"; K.rr(g, x0, y - hgt / 2 - 34, w, hgt + 68, 16); g.fill();
    font(g, 22, 800, "Inter"); g.fillStyle = COL.yellow; g.textAlign = "left"; g.textBaseline = "middle";
    const done = t > C.v_them + 0.25;
    g.fillText(done ? "AI · FIRST DRAFT READY ✓" : "AI · BUILDING THE EDIT…", x0 + 22, y - hgt / 2 - 12);
    const thumbs = [
      () => K.footage("fp_balloon", 0.95), () => K.image("fp_rouen"), () => K.footage("fp_swing", 5.4), () => K.footage("fp_gift", 1.4),
    ];
    const tw = (w - 44 - 3 * 12) / 4;
    thumbs.forEach((f, k) => {
      const at = C.v_ai + k * 0.22, p = spring(win(at, at + 0.6, t));
      if (p <= 0) return;
      const tx = x0 + 22 + k * (tw + 12), ty = y - hgt / 2 + 22 + 30 * (1 - p);
      g.save(); g.globalAlpha = clamp(p * 2) * sp;
      g.beginPath(); g.rect(tx, ty, tw, hgt - 30); g.save(); g.clip(); K.drawFit(g, f(), tx, ty, tw, hgt - 30); g.restore();
      g.strokeStyle = COL.gold; g.lineWidth = 3; g.strokeRect(tx, ty, tw, hgt - 30);
      font(g, 18, 800, "Inter"); g.fillStyle = COL.ink; const lw = g.measureText(LABELS[k]).width + 14;
      g.fillStyle = COL.yellow; g.fillRect(tx + 6, ty + 6, lw, 26); g.fillStyle = COL.ink; g.textAlign = "left"; g.fillText(LABELS[k], tx + 13, ty + 20);
      g.restore();
    });
    // playhead
    const ph = win(C.v_builds, C.v_them + 0.5, t);
    if (ph > 0) { const px = x0 + 22 + (w - 44) * ph; g.fillStyle = COL.red; g.fillRect(px - 2, y - hgt / 2 + 14, 4, hgt - 14); }
    g.restore();
  }
}

// ------------------------------------------------------------------ the desk --
function deskScene(g, t) {
  // real weathered wood, warm and dim
  g.save(); g.filter = "brightness(0.62) saturate(0.9) sepia(0.15)";
  g.translate(540, 960); g.rotate(Math.PI / 2); g.translate(-960, -540);
  K.drawFit(g, K.footage("oh_wood", t - DESK0, 0.5, true), 0, 0, H, W);
  g.restore();
  const vg = g.createRadialGradient(540, 900, 300, 540, 900, 1200);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.6)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const push = 1 + 0.05 * win(DESK0, C.end, t);
  g.save(); g.translate(540, 900); g.scale(push, push); g.translate(-540, -900);
  // real objects around the folder
  const obj = (key, x, y, w, rot) => {
    const im = K.object(key); if (!im) return;
    g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); K.shadow(g, 30, 18, 0.6, "0,0,0");
    g.drawImage(im, -w / 2, -w * im.height / im.width / 2, w, w * im.height / im.width); g.restore();
  };
  obj("notebook", 90, 250, 400, 14);
  obj("hw_clock", 975, 300, 210, -14);
  obj("pencil", 160, 1120, 420, -58);
  obj("fp_iris_a", 1000, 1050, 300, 18);
  // the folder of project files
  const fp = spring(win(DESK0 + 0.3, DESK0 + 1.1, t));
  g.save(); g.translate(540, 950 + 200 * (1 - fp)); g.rotate(-3 * Math.PI / 180); g.globalAlpha = clamp(fp * 2);
  const fw = 640, fh = 440;
  K.shadow(g, 36, 20, 0.55, "0,0,0");
  g.fillStyle = "#c99a52"; K.rr(g, -fw / 2, -fh / 2 - 46, 200, 60, 14); g.fill();      // tab
  g.fillStyle = "#d9ae66"; K.rr(g, -fw / 2, -fh / 2, fw, fh, 14); g.fill(); K.noShadow(g);
  font(g, 26, 800, "Inter"); g.fillStyle = "#5a3a12"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("next-edit/", -fw / 2 + 22, -fh / 2 - 18);
  // the four pieces as cards sticking out of the folder
  for (let k = 0; k < 4; k++) {
    const cx = -120 + k * 115, cy = -fh / 2 + 40 - 30 * spring(win(DESK0 + 0.6 + k * 0.1, DESK0 + 1.3 + k * 0.1, t));
    g.save(); g.translate(cx, cy); g.rotate([-6, 3, -2, 5][k] * Math.PI / 180);
    g.fillStyle = "#f4ead0"; g.fillRect(-60, -80, 120, 160);
    drawPiece(g, k, 0, -18, 0.2, 0, { shadow: 0.2 });
    font(g, 16, 800, "Inter"); g.fillStyle = COL.ink; g.textAlign = "center"; g.fillText(LABELS[k], 0, 52);
    g.restore();
  }
  g.fillStyle = "#e2b971"; K.rr(g, -fw / 2, -fh / 2 + 60, fw, fh - 60, 12); g.fill();      // folder front
  g.fillStyle = "rgba(90,58,18,0.25)"; g.fillRect(-fw / 2, -fh / 2 + 60, fw, 4);
  font(g, 30, 500, "EB Garamond", "italic"); g.fillStyle = "#6b4518"; g.textAlign = "center";
  g.fillText("hook · context · build-up · payoff", 0, fh / 2 - 60);
  // the bookmark ribbon drops on "save"
  const bp = spring(win(C.o_save - 0.1, C.o_save + 0.6, t));
  if (bp > 0) {
    const bx = fw / 2 - 32, top = -fh / 2 - 20, len = 330 * bp;
    K.shadow(g, 14, 6, 0.5, "0,0,0");
    g.fillStyle = COL.red; g.beginPath(); g.moveTo(bx - 34, top); g.lineTo(bx + 34, top); g.lineTo(bx + 34, top + len); g.lineTo(bx, top + len - 34); g.lineTo(bx - 34, top + len); g.closePath(); g.fill();
    K.noShadow(g); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(bx - 34, top, 10, len - 20);
  }
  g.restore();
  g.restore();
  grunge(g, "SAVE THIS", 540, 395, 150, COL.cream, t, C.o_save - 0.06, { slam: true, seed: 61 });
  serif(g, "for your next edit", 540, 515, 62, COL.cream, t, C.o_next - 0.1, { shadow: "rgba(0,0,0,0.7)" });
  tag(g, "JOIN", 540, 1240, t, C.o_join - 0.08, { size: 44, rot: -3 });
  grunge(g, "VIBE EDITING", 540, 1345, 140, COL.yellow, t, C.o_vibe - 0.06, { slam: true, rot: -2, seed: 70 });
  serif(g, "follow · save · share", 540, 1440, 46, COL.cream, t, C.o_end + 0.35, { shadow: "rgba(0,0,0,0.7)" });
}

// drifting iris blossoms (real cut-outs from the painting)
function petals(g, t, t0, t1, n, seed, o = {}) {
  const im = K.object("fp_iris_a"); if (!im) return;
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const delay = r() * (o.spread ?? 0.4), dur = o.dur ?? (t1 - t0);
    const p = win(t0 + delay, t0 + delay + dur, t);
    let x0 = (o.x0 ?? -200) + r() * (o.dx0 ?? 300);
    if (o.sides) x0 = r() < 0.5 ? r() * 170 : 910 + r() * 170;
    const y0 = (o.y0 ?? 2000) + r() * (o.dy0 ?? 200);
    const x1 = o.sides ? x0 + (r() - 0.5) * 160 : (o.x1 ?? 1300) + r() * 200, y1 = (o.y1 ?? -300) - r() * 300;
    if (p <= 0 || p >= 1) continue;
    const e = o.ease ? o.ease(p) : p, s = (o.size ?? 420) * (0.6 + 0.6 * r());
    g.save(); g.translate(lerp(x0, x1, e), lerp(y0, y1, e)); g.rotate((r() * 6) + e * (o.spin ?? 3));
    g.globalAlpha = o.alpha ?? 1; K.shadow(g, 30, 16, 0.4, "0,0,0");
    g.drawImage(im, -s / 2, -s * im.height / im.width / 2, s, s * im.height / im.width); g.restore();
  }
}

// ------------------------------------------------------------------ frame --
function frame(g, t) {
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  let moving = false, speed = 0;
  const sc = inOutQuint(win(SCROLL0, SCROLL1, t));           // puzzle scrolls away, wall rises
  const push = inOutQuint(win(BRIEF0, BRIEF1, t));            // wall drops, brief comes from above
  const zoom = inOutCubic(win(DESK0, DESK1, t));              // zoom through into the desk
  if (t > SCROLL0 && t < SCROLL1) { moving = true; speed = Math.max(speed, Math.sin(Math.PI * win(SCROLL0, SCROLL1, t))); }
  if (t > BRIEF0 && t < BRIEF1) { moving = true; speed = Math.max(speed, Math.sin(Math.PI * win(BRIEF0, BRIEF1, t))); }
  if (t > DESK0 && t < DESK1) { moving = true; speed = Math.max(speed, 0.7 * Math.sin(Math.PI * win(DESK0, DESK1, t))); }

  if (t < SCROLL1) { g.save(); g.translate(0, -H * sc); puzzleScene(g, t); g.restore(); }
  if (t > SCROLL0 && t < BRIEF1) {
    g.save(); g.translate(0, H * (1 - sc) + H * push);
    const cam = drawWall(g, t);
    if (cam.moving) { moving = true; speed = Math.max(speed, cam.speed); }
    g.restore();
    // collected-pieces tracker sits on the glass, above the moving wall
    tracker(g, t, outCubic(win(SCROLL1 - 0.3, SCROLL1 + 0.3, t)) * (t < BRIEF0 ? 1 : 0));
  }
  if (t > BRIEF0 && t < DESK1) {
    const dy = -H * (1 - push);
    g.save();
    if (zoom > 0) { g.translate(540, 900); g.scale(1 + 0.6 * zoom, 1 + 0.6 * zoom); g.translate(-540, -900); g.globalAlpha = 1 - zoom; }
    g.translate(0, dy); briefScene(g, t, dy);
    g.restore();
  }
  if (t > DESK0) {
    g.save();
    const s = 1.2 - 0.2 * zoom; g.globalAlpha = zoom;
    g.translate(540, 900); g.scale(s, s); g.translate(-540, -900);
    deskScene(g, t);
    g.restore();
    petals(g, t, DESK0 - 0.15, DESK1 + 0.25, 4, 3, { size: 520, spread: 0.25, ease: inOutCubic });   // petal wipe
    petals(g, t, C.o_end - 0.4, C.end + 0.5, 5, 11, { size: 120, spread: 2.4, dur: 4.2, sides: true, y0: -160, dy0: 40, y1: 2100, spin: 2, alpha: 0.9 });
  }
  // lens: warm vignette + grain, then captions
  const vg = g.createRadialGradient(540, 900, H * 0.3, 540, 900, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,8,0,0.42)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  K.grain(g, t, 0.07);
  K.captions(g, t, { y: 1560, size: 42, weight: 700, family: "Inter", color: "#fff6e4", hi: COL.yellow, hiText: COL.ink,
    box: "rgba(26,14,8,0.62)", boxPad: 22, maxW: 900, radius: 6 });
  return { moving, speed };
}

K.run(frame, ["italic 500 40px 'EB Garamond'", "500 40px 'EB Garamond'", "40px Anton", "800 40px Inter", "700 40px Inter"]);
})();

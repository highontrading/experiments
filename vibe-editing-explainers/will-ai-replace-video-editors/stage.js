// Will AI replace video editors? — the wall-calendar design.
// A paper calendar hanging from a navy spiral. Every voice line gets its own page layout;
// pages change by a shared blue-cell morph, a real wall-calendar page lift, a zoom into a
// cell, or a glide to the next week.
(function () {
const { clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring, rnd } = K;
const C = K.C, W = K.W, H = K.H;
const COL = {
  paper: "#fbfbf8", wall: "#ececea", navy: "#16197d", ink: "#1b1f8a", line: "rgba(22,25,125,0.85)",
  blue: "#0b55d6", sky: "#a9c8ff", yellow: "#ffe23d", orange: "#f6b27a", lav: "#c9c3f2", lblue: "#c6dbf3",
  lyellow: "#fbec6e", grey: "#8a8fb8",
};
const PAGE_TOP = 150;   // where the page hangs from the spiral

// ------------------------------------------------------------------ paper --
const PAPER = K.makeCanvas(W, H);
(function () {
  const g = PAPER.getContext("2d"), r = rnd(5);
  g.fillStyle = COL.paper; g.fillRect(0, 0, W, H);
  const id = g.getImageData(0, 0, W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 7; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  g.globalAlpha = 0.05; g.strokeStyle = "#9a9aa8"; g.lineWidth = 0.6;
  for (let i = 0; i < 900; i++) {   // paper fibres
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 4 + r() * 14;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
})();
function page(g) {
  g.drawImage(PAPER, 0, 0);
  const sh = g.createLinearGradient(0, PAGE_TOP, 0, PAGE_TOP + 60);  // the spiral's soft shadow on the paper
  sh.addColorStop(0, "rgba(20,25,80,0.10)"); sh.addColorStop(1, "rgba(20,25,80,0)");
  g.fillStyle = sh; g.fillRect(0, PAGE_TOP, W, 60);
}
function wallAndSpiral(g) {
  const wg = g.createLinearGradient(0, 0, 0, PAGE_TOP);
  wg.addColorStop(0, "#f4f4f2"); wg.addColorStop(1, "#e4e4e2");
  g.fillStyle = wg; g.fillRect(0, 0, W, PAGE_TOP);
  g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, PAGE_TOP - 2, W, 2);
  // double-loop wire binding: two wires per punched hole
  for (let x = 26; x < W; x += 54) {
    g.fillStyle = "#c9c9d2"; K.rr(g, x - 2, PAGE_TOP + 20, 26, 14, 6); g.fill();         // hole
    g.fillStyle = "rgba(10,12,50,0.55)"; K.rr(g, x, PAGE_TOP + 22, 22, 10, 5); g.fill();
    for (const dx of [3, 13]) {
      const gx = x + dx;
      const wire = g.createLinearGradient(gx, 0, gx + 7, 0);
      wire.addColorStop(0, "#0d1060"); wire.addColorStop(0.45, "#3a3fae"); wire.addColorStop(0.6, "#c7caf5"); wire.addColorStop(1, "#11145f");
      g.strokeStyle = wire; g.lineWidth = 6.5; g.lineCap = "round";
      g.beginPath(); g.moveTo(gx + 3, PAGE_TOP + 28); g.bezierCurveTo(gx + 3, PAGE_TOP - 30, gx + 7, PAGE_TOP - 46, gx + 9, PAGE_TOP - 44); g.stroke();
    }
  }
}

// ------------------------------------------------------------------ primitives --
function txt(g, s, x, y, size, o = {}) {
  K.font(g, size, o.weight || 600, o.family || "Jost");
  g.textAlign = o.align || "left"; g.textBaseline = o.base || "alphabetic";
  if (g.letterSpacing !== undefined) g.letterSpacing = (o.track || 0) + "px";
  g.fillStyle = o.color || COL.ink; g.fillText(s, x, y);
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
}
function fadeTxt(g, s, x, y, size, at, t, o = {}) {
  const p = outCubic(win(at, at + 0.45, t));
  if (p <= 0) return;
  g.save(); g.globalAlpha = p * (o.alpha ?? 1); g.translate(0, 26 * (1 - p)); txt(g, s, x, y, size, o); g.restore();
}
function grid(g, xs, ys, a = 1) {
  g.save(); g.globalAlpha = a; g.strokeStyle = COL.line; g.lineWidth = 2.2; g.beginPath();
  for (const x of xs) { g.moveTo(x, ys[0]); g.lineTo(x, ys[ys.length - 1]); }
  for (const y of ys.slice(1, -1)) { g.moveTo(0, y); g.lineTo(W, y); }
  g.stroke(); g.restore();
}
// a hand-drawn marker loop, drawn on progressively
function loop(g, cx, cy, rx, ry, p, o = {}) {
  if (p <= 0) return;
  const r = rnd(o.seed || 3), n = 90, turns = 1.12, pts = [];
  for (let i = 0; i <= n; i++) {
    const a = -2.2 + (i / n) * Math.PI * 2 * turns, wob = 1 + (r() - 0.5) * 0.03 + 0.05 * (i / n);
    pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]);
  }
  g.save(); g.strokeStyle = o.color || COL.sky; g.lineWidth = o.width || 6; g.lineCap = g.lineJoin = "round";
  g.beginPath(); const m = Math.max(2, Math.floor(p * n));
  for (let i = 0; i <= m; i++) i ? g.lineTo(...pts[i]) : g.moveTo(...pts[i]);
  g.stroke(); g.restore();
}
function check(g, x, y, s, p, color = COL.navy) {
  if (p <= 0) return;
  const pts = [[x - s * 0.5, y], [x - s * 0.12, y + s * 0.38], [x + s * 0.55, y - s * 0.45]];
  const L1 = 0.35, q = clamp(p);
  g.save(); g.strokeStyle = color; g.lineWidth = s * 0.16; g.lineCap = g.lineJoin = "round"; g.beginPath(); g.moveTo(...pts[0]);
  if (q < L1) g.lineTo(lerp(pts[0][0], pts[1][0], q / L1), lerp(pts[0][1], pts[1][1], q / L1));
  else { g.lineTo(...pts[1]); const k = (q - L1) / (1 - L1); g.lineTo(lerp(pts[1][0], pts[2][0], k), lerp(pts[1][1], pts[2][1], k)); }
  g.stroke(); g.restore();
}
function strike(g, x0, x1, y, p, color = COL.navy) {   // a scribbled marker strike-through
  if (p <= 0) return;
  g.save(); g.strokeStyle = color; g.lineWidth = 7; g.lineCap = "round"; g.beginPath();
  const n = 24, r = rnd(9);
  for (let i = 0; i <= Math.floor(n * clamp(p)); i++) {
    const x = lerp(x0, x1, i / n), yy = y + Math.sin(i * 1.7) * 6 + (r() - 0.5) * 4;
    i ? g.lineTo(x, yy) : g.moveTo(x, yy);
  }
  g.stroke(); g.restore();
}
function sparkle(g, x, y, r, t, at, seed = 0) {
  const p = spring(win(at, at + 0.7, t));
  if (p <= 0) return;
  const tw = 1 + 0.14 * Math.sin(t * 3.3 + seed * 2.1);
  g.save(); g.translate(x, y); g.rotate(0.25 * Math.sin(t * 0.8 + seed)); g.scale(p * tw, p * tw);
  g.fillStyle = COL.yellow; g.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    g.quadraticCurveTo(Math.cos(a - Math.PI / 4) * r * 0.14, Math.sin(a - Math.PI / 4) * r * 0.14, Math.cos(a) * r, Math.sin(a) * r);
  }
  g.quadraticCurveTo(Math.cos(-Math.PI / 4) * r * 0.14, Math.sin(-Math.PI / 4) * r * 0.14, r, 0);
  g.fill(); g.restore();
}
// slap-on transform for stickers: drops from slightly bigger, rotates into place
function slap(g, x, y, rot, t, at) {
  const p = spring(win(at, at + 0.75, t));
  if (p <= 0) return 0;
  g.translate(x, y); g.rotate((rot + (1 - p) * 12) * Math.PI / 180);
  const s = 1.22 - 0.22 * p; g.scale(s, s); g.globalAlpha *= clamp(p * 3);
  return p;
}
// die-cut text sticker: white border, pastel body, navy type
function sticker(g, o, t) {
  g.save();
  const p = slap(g, o.x, o.y, o.rot || 0, t, o.at);
  if (!p) { g.restore(); return; }
  if (o.out != null) g.globalAlpha *= 1 - win(o.out, o.out + 0.3, t);
  K.font(g, o.size || 40, o.weight || 700, "Jost");
  if (g.letterSpacing !== undefined) g.letterSpacing = (o.track ?? 1) + "px";
  const lines = o.text.split("\n");
  const tw = Math.max(...lines.map((l) => g.measureText(l).width)) + (o.icon ? (o.size || 40) * 1.1 : 0);
  const w = o.w || tw + 56, h = o.h || (o.size || 40) * (1.25 * lines.length) + 40, R = o.r ?? 24;
  K.shadow(g, 16, 8, 0.22, "15,20,70");
  g.fillStyle = "#fff"; K.rr(g, -w / 2 - 9, -h / 2 - 9, w + 18, h + 18, R + 9); g.fill(); K.noShadow(g);
  g.fillStyle = o.bg || COL.lav; K.rr(g, -w / 2, -h / 2, w, h, R); g.fill();
  g.strokeStyle = "rgba(22,25,125,0.9)"; g.lineWidth = 3; K.rr(g, -w / 2, -h / 2, w, h, R); g.stroke();
  g.fillStyle = o.fg || COL.navy; g.textAlign = "center"; g.textBaseline = "middle";
  const ix = o.icon ? (o.size || 40) * 0.55 : 0;
  lines.forEach((l, i) => g.fillText(l, ix, (i - (lines.length - 1) / 2) * (o.size || 40) * 1.18 + 2));
  if (o.icon) o.icon(g, -tw / 2 + (o.size || 40) * 0.45, 0, (o.size || 40) * 0.8);
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
  if (o.check != null) check(g, w / 2 - 6, -h / 2 + 4, 46, win(o.check, o.check + 0.35, t), COL.navy);
  g.restore();
}
// wavy-edged yellow badge, like "ATÉ 70% OFF"
function badge(g, o, t) {
  g.save();
  const p = slap(g, o.x, o.y, o.rot || 0, t, o.at);
  if (!p) { g.restore(); return; }
  const R = o.r || 130, n = 14;
  const path = (rr) => { g.beginPath(); for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2, q = rr * (1 + 0.07 * Math.sin(a * n)); i ? g.lineTo(Math.cos(a) * q, Math.sin(a) * q) : g.moveTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); };
  K.shadow(g, 16, 8, 0.22, "15,20,70"); g.fillStyle = "#fff"; path(R + 10); g.fill(); K.noShadow(g);
  g.fillStyle = COL.lyellow; path(R); g.fill(); g.strokeStyle = COL.navy; g.lineWidth = 3; path(R); g.stroke();
  const lines = o.text.split("\n");
  lines.forEach((l, i) => txt(g, l, 0, (i - (lines.length - 1) / 2) * (o.size || 44) * 1.05, o.size || 44,
    { align: "center", base: "middle", weight: 800, color: COL.navy, track: -1 }));
  g.restore();
}
// a real cut-out object (white die-cut border already baked in)
function photoSticker(g, key, x, y, w, rot, t, at, o = {}) {
  const im = K.object(key);
  if (!im) return;
  g.save();
  const p = slap(g, x, y, rot, t, at);
  if (!p) { g.restore(); return; }
  if (o.out != null) g.globalAlpha *= 1 - win(o.out, o.out + 0.3, t);
  const h = w * im.height / im.width;
  K.shadow(g, 22, 12, 0.3, "15,20,70");
  g.drawImage(im, -w / 2, -h / 2, w, h);
  g.restore();
}
// footage in a calendar cell: rounded clip, navy outline
function footCell(g, clip, x, y, w, h, t, at, o = {}) {
  const p = o.instant ? 1 : outQuint(win(at, at + 0.6, t));
  if (p <= 0) return;
  g.save(); g.globalAlpha *= clamp(p * 1.5);
  const s = 0.94 + 0.06 * p; g.translate(x + w / 2, y + h / 2); g.scale(s, s); g.translate(-w / 2, -h / 2);
  if (o.rot) { g.translate(w / 2, h / 2); g.rotate(o.rot * Math.PI / 180); g.translate(-w / 2, -h / 2); }
  if (o.shadow !== false) { K.shadow(g, 18, 8, 0.18, "15,20,70"); g.fillStyle = "#fff"; K.rr(g, 0, 0, w, h, o.r ?? 14); g.fill(); K.noShadow(g); }
  g.save(); K.rr(g, 0, 0, w, h, o.r ?? 14); g.clip();
  K.drawFit(g, K.footage(clip, (t - at) * (o.speed || 1) + (o.ss || 0), 1, true), 0, 0, w, h, { fx: o.fx, fy: o.fy, zoom: o.zoom });
  if (o.tint) { g.fillStyle = o.tint; g.fillRect(0, 0, w, h); }
  g.restore();
  g.strokeStyle = COL.navy; g.lineWidth = 3; K.rr(g, 0, 0, w, h, o.r ?? 14); g.stroke();
  g.restore();
}
function blueCell(g, x, y, w, h, p = 1) {
  if (p <= 0) return;
  g.save(); g.fillStyle = COL.blue; g.fillRect(x, y, w, h * p); g.restore();
}
function waveform(g, x, y, w, h, t, o = {}) {   // a voice waveform; silent gaps close up after `cut`
  const r = rnd(o.seed || 21), bars = 46, gaps = [[9, 15], [24, 30], [37, 41]];
  const close = o.cut != null ? inOutCubic(win(o.cut, o.cut + 0.6, t)) : 0;
  const isGap = (i) => gaps.some(([a, b]) => i >= a && i < b);
  const bw = w / bars;
  let xx = x;
  for (let i = 0; i < bars; i++) {
    const gap = isGap(i), amp = gap ? 0.05 + r() * 0.04 : 0.25 + r() * 0.75;
    const ww = gap ? bw * (1 - close) : bw * (1 + close * 0.35);
    if (ww > 0.5) {
      g.fillStyle = gap ? `rgba(246,120,80,${0.9 * (1 - close)})` : (o.color || COL.navy);
      K.rr(g, xx + ww * 0.18, y + h / 2 - (h / 2) * amp, Math.max(1, ww * 0.64), h * amp, 3); g.fill();
    }
    xx += ww;
  }
}

// ------------------------------------------------------------------ icons --
const ICON = {
  scissors(g, x, y, s) {
    g.save(); g.translate(x, y); g.strokeStyle = COL.navy; g.lineWidth = s * 0.11; g.lineCap = "round";
    g.beginPath(); g.arc(-s * 0.28, s * 0.25, s * 0.16, 0, 7); g.arc(s * 0.28, s * 0.25, s * 0.16, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(-s * 0.18, s * 0.12); g.lineTo(s * 0.32, -s * 0.45); g.moveTo(s * 0.18, s * 0.12); g.lineTo(-s * 0.32, -s * 0.45); g.stroke();
    g.restore();
  },
  cc(g, x, y, s) {
    g.save(); g.translate(x, y); g.strokeStyle = COL.navy; g.lineWidth = s * 0.1; K.rr(g, -s * 0.45, -s * 0.32, s * 0.9, s * 0.64, s * 0.12); g.stroke();
    txt(g, "CC", 0, 2, s * 0.36, { align: "center", base: "middle", weight: 800, color: COL.navy }); g.restore();
  },
  frames(g, x, y, s) {
    g.save(); g.translate(x, y); g.strokeStyle = COL.navy; g.lineWidth = s * 0.09;
    g.strokeRect(-s * 0.48, -s * 0.2, s * 0.5, s * 0.32); g.strokeRect(-s * 0.02, -s * 0.38, s * 0.3, s * 0.5); g.strokeRect(s * 0.3, -s * 0.18, s * 0.22, s * 0.22);
    g.restore();
  },
  pause(g, x, y, s) { g.save(); g.fillStyle = COL.navy; g.fillRect(x - s * 0.28, y - s * 0.32, s * 0.18, s * 0.64); g.fillRect(x + s * 0.1, y - s * 0.32, s * 0.18, s * 0.64); g.restore(); },
  note(g, x, y, s) {
    g.save(); g.translate(x, y); g.fillStyle = g.strokeStyle = COL.navy; g.lineWidth = s * 0.1;
    g.beginPath(); g.ellipse(-s * 0.16, s * 0.26, s * 0.17, s * 0.13, -0.4, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-s * 0.01, s * 0.24); g.lineTo(-s * 0.01, -s * 0.4); g.lineTo(s * 0.3, -s * 0.28); g.stroke(); g.restore();
  },
  drop(g, x, y, s) {
    g.save(); g.translate(x, y); const gr = g.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
    gr.addColorStop(0, "#f6b27a"); gr.addColorStop(0.5, "#c9c3f2"); gr.addColorStop(1, "#0b55d6");
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, -s * 0.42); g.bezierCurveTo(s * 0.4, 0, s * 0.3, s * 0.38, 0, s * 0.38); g.bezierCurveTo(-s * 0.3, s * 0.38, -s * 0.4, 0, 0, -s * 0.42); g.fill();
    g.strokeStyle = COL.navy; g.lineWidth = s * 0.07; g.stroke(); g.restore();
  },
  cursor(g, x, y, s) {
    g.save(); g.translate(x - s * 0.25, y - s * 0.4); g.scale(s / 70, s / 70);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 62); g.lineTo(15, 48); g.lineTo(26, 72); g.lineTo(37, 67); g.lineTo(26, 44); g.lineTo(46, 44); g.closePath();
    g.fillStyle = "#fff"; g.fill(); g.strokeStyle = COL.navy; g.lineWidth = 5; g.lineJoin = "round"; g.stroke(); g.restore();
  },
};

// ------------------------------------------------------------------ layouts --
// Each layout draws a whole page (paper + content). Board content lives in y 160..1440.
const DAYS3 = [["WEDNESDAY", "28"], ["THURSDAY", "29"], ["FRIDAY", "30"]];

// 1 · the month page, three days wide, "29" in the blue cell
function L_hook(g, t) {
  page(g);
  const intro = outQuint(win(0, 0.6, t));
  fadeTxt(g, "October", 70, 330, 92, 0, t, { weight: 700, track: -1 });
  fadeTxt(g, "2026", 1010, 330, 80, 0.05, t, { weight: 700, align: "right", family: "Jost", track: -1 });
  g.save(); g.globalAlpha = intro;
  grid(g, [360, 720], [440, 560, 1170, 1440]);
  DAYS3.forEach(([d], i) => txt(g, d, 180 + i * 360, 520, 30, { align: "center", weight: 500, track: 5, color: COL.ink }));
  g.restore();
  // blue cell fills from the top
  const fill = outExpo(win(0.2, 0.85, t));
  blueCell(g, 362, 562, 357, 606, fill);
  [["28", 330], ["30", 1050]].forEach(([n, x]) => fadeTxt(g, n, x, 640, 50, 0.4, t, { align: "right", weight: 500 }));
  fadeTxt(g, "29", 690, 640, 50, 0.6, t, { align: "right", weight: 500, color: "#fff" });
  [["4", 330], ["5", 690], ["6", 1050]].forEach(([n, x], i) => fadeTxt(g, n, x, 1250, 50, 0.5 + i * 0.05, t, { align: "right", weight: 500 }));
  loop(g, 660, 624, 52, 42, outCubic(win(C.hook_honest - 0.1, C.hook_honest + 0.55, t)), { seed: 4, color: COL.sky, width: 5 });
  sparkle(g, 712, 560, 26, t, C.hook_honest + 0.2, 1); sparkle(g, 590, 630, 15, t, C.hook_honest + 0.35, 2);
  // headline, word by word, as it is spoken
  const L = [["will AI", C.hook_ai - 0.15], ["replace", C.hook_replace - 0.1], ["video", C.hook_video - 0.1], ["editors?", C.hook_editors - 0.1]];
  L.forEach(([s, at], i) => fadeTxt(g, s, 386, 790 + i * 92, 84, at, t, { weight: 600, color: "#fff", track: -2 }));
  const hp = outCubic(win(C.hook_honest - 0.15, C.hook_honest + 0.9, t));
  if (hp > 0) {
    g.save(); g.beginPath(); g.rect(380, 1090, 340 * hp, 80); g.clip();
    txt(g, "let's be honest", 392, 1135, 52, { family: "Caveat", weight: 600, color: COL.sky }); g.restore();
  }
  // stickers
  photoSticker(g, "ai_bearded", 190, 900, 290, -7, t, C.hook_editors);
  sticker(g, { at: C.hook_ai, x: 772, y: 1010, rot: 11, text: "AI", size: 64, bg: COL.lav, w: 130, h: 120, r: 30 }, t);
  sparkle(g, 790, 915, 18, t, C.hook_ai + 0.2, 3); sparkle(g, 660, 1060, 14, t, C.hook_ai + 0.3, 4);
  badge(g, { at: C.hook_honest + 0.15, x: 860, y: 1250, rot: -12, r: 128, text: "honest\nanswer", size: 46 }, t);
  sticker(g, { at: C.hook_video + 0.1, x: 900, y: 760, rot: 9, text: "editor's\nweek", size: 38, bg: COL.orange }, t);
}

// 2 · a planner week: Mon/Tue/Wed rows fill with the jobs AI already does
const ROWS = [["MON", "26", 560], ["TUE", "27", 860], ["WED", "28", 1160]];
const RECT_GOOD = [70, 230, 940, 290];
function L_good(g, t) {
  page(g);
  blueCell(g, ...RECT_GOOD);
  fadeTxt(g, "AI is great at", 104, 320, 56, C.s_good - 0.2, t, { family: "Caveat", weight: 600, color: COL.sky });
  fadeTxt(g, "repetitive work", 100, 440, 104, C.good_repetitive - 0.15, t, { weight: 600, color: "#fff", track: -2 });
  sparkle(g, 960, 260, 26, t, C.good_repetitive + 0.2, 5);
  ROWS.forEach(([d, n, y], i) => {
    const a = C.s_good - 0.15 + i * 0.1;
    g.save(); g.globalAlpha = outCubic(win(a, a + 0.5, t));
    g.strokeStyle = COL.line; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, y - 20); g.lineTo(W, y - 20); g.moveTo(230, y - 20); g.lineTo(230, y + 270); g.stroke();
    txt(g, d, 150, y + 40, 30, { align: "center", weight: 500, track: 5 });
    txt(g, n, 150, y + 130, 76, { align: "center", weight: 500 });
    g.restore();
  });
  // MON: cut silences
  const y0 = ROWS[0][2];
  footCell(g, "timeline", 262, y0 + 10, 330, 186, t, C.s_good - 0.1, { ss: 1 });
  g.save(); g.globalAlpha = outCubic(win(C.s_good + 0.1, C.s_good + 0.5, t));
  waveform(g, 620, y0 + 40, 390, 130, t, { cut: C.good_silences + 0.1, seed: 31 }); g.restore();
  sticker(g, { at: C.good_silences, x: 830, y: y0 + 210, rot: -5, text: "cut silences", size: 36, bg: COL.orange, icon: ICON.scissors, check: C.good_silences + 0.4 }, t);
  // TUE: captions land on the beat of the words
  const y1 = ROWS[1][2];
  footCell(g, "ai_editor", 262, y1 + 10, 330, 186, t, C.s_good + 0.05, { ss: 1 });
  const words = ["welcome", "back", "to", "the", "edit"];
  words.forEach((wd, i) => {
    const at = C.good_captions - 0.2 + i * 0.16;
    const p = outCubic(win(at, at + 0.25, t)); if (p <= 0) return;
    g.save(); g.globalAlpha = p;
    const x = 625 + [0, 150, 240, 300, 390][i];
    g.fillStyle = i % 2 ? COL.lblue : COL.lav; K.rr(g, x, y1 + 120, [138, 82, 52, 82, 90][i], 52, 10); g.fill();
    txt(g, wd, x + 10, y1 + 155, 28, { weight: 500 });
    g.fillStyle = COL.navy; g.fillRect(x, y1 + 186, 2, 12);
    g.restore();
  });
  g.save(); g.globalAlpha = outCubic(win(C.s_good + 0.25, C.s_good + 0.65, t));
  waveform(g, 620, y1 + 30, 390, 76, t, { seed: 44, color: COL.grey }); g.restore();
  sticker(g, { at: C.good_captions, x: 850, y: y1 + 225, rot: 4, text: "sync captions", size: 36, bg: COL.lav, icon: ICON.cc, check: C.good_captions + 0.45 }, t);
  // WED: one video, three shapes
  const y2 = ROWS[2][2];
  [["9:16", 262, 120, 213, C.good_resizing - 0.1], ["1:1", 410, 190, 190, C.good_every - 0.25], ["16:9", 628, 340, 191, C.good_platform - 0.15]].forEach(([lab, x, w, h, at]) => {
    footCell(g, "ai_beard", x, y2 + 6, w, h, t, at, { ss: 2, r: 10 });
    fadeTxt(g, lab, x + w / 2, y2 + h + 50, 28, at + 0.1, t, { align: "center", weight: 500, track: 2 });
  });
  sticker(g, { at: C.good_platform, x: 900, y: y2 + 262, rot: -6, text: "resize ×3", size: 36, bg: COL.lblue, icon: ICON.frames, check: C.good_platform + 0.45 }, t);
}

// 3 · the afternoon, hour by hour: before vs now
const RECT_NOW = [660, 438, 340, 80];
function L_time(g, t) {
  page(g);
  const s = C.s_time - 0.45;
  fadeTxt(g, "a whole afternoon", 70, 300, 76, s + 0.3, t, { weight: 700, track: -1 });
  fadeTxt(g, "→ minutes", 70, 380, 58, C.time_minutes - 0.2, t, { family: "Caveat", weight: 600, color: COL.blue });
  txt(g, "", 0, 0, 1);
  g.save(); g.globalAlpha = outCubic(win(s + 0.2, s + 0.7, t));
  txt(g, "BEFORE", 420, 425, 30, { align: "center", weight: 500, track: 6 });
  txt(g, "NOW", 830, 425, 30, { align: "center", weight: 500, track: 6 });
  ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"].forEach((h, i) => {
    const y = 470 + i * 182;
    txt(g, h, 70, y + 10, 34, { weight: 500, color: COL.grey });
    g.strokeStyle = "rgba(22,25,125,0.22)"; g.lineWidth = 2; g.beginPath(); g.moveTo(190, y); g.lineTo(1010, y); g.stroke();
  });
  g.strokeStyle = COL.line; g.lineWidth = 2.2; g.beginPath(); g.moveTo(620, 400); g.lineTo(620, 1420); g.stroke();
  g.restore();
  // before: the editing block grows down the whole afternoon, with the tired editor in it
  const grow = inOutCubic(win(C.time_jobs - 0.1, C.time_afternoon + 0.5, t));
  if (grow > 0) {
    const h = 900 * grow;
    g.save(); K.rr(g, 236, 474, 368, h, 14); g.clip();
    K.drawFit(g, K.footage("tired", t - C.time_jobs + 3.2, 1, true), 236, 474, 368, 900, { fy: 0.1 });
    g.fillStyle = "rgba(11,30,120,0.18)"; g.fillRect(236, 474, 368, h);
    g.restore();
    g.strokeStyle = COL.navy; g.lineWidth = 3; K.rr(g, 236, 474, 368, h, 14); g.stroke();
  }
  sticker(g, { at: C.time_afternoon - 0.1, x: 420, y: 1300, rot: -4, text: "editing… 5 hrs", size: 34, bg: COL.orange }, t);
  photoSticker(g, "clock", 810, 980, 300, 10, t, C.time_jobs + 0.3);
  // now: five minutes in a blue sliver
  const np = outExpo(win(C.time_minutes - 0.15, C.time_minutes + 0.4, t));
  if (np > 0) {
    blueCell(g, RECT_NOW[0], RECT_NOW[1], RECT_NOW[2] * np, RECT_NOW[3]);
    g.save(); g.globalAlpha = np; txt(g, "5 min", 690, 492, 44, { weight: 600, color: "#fff" }); g.restore();
    check(g, 950, 476, 40, win(C.time_minutes + 0.3, C.time_minutes + 0.6, t), "#fff");
  }
  badge(g, { at: C.time_minutes + 0.15, x: 820, y: 680, rot: 12, r: 112, text: "minutes!", size: 42 }, t);
  sparkle(g, 990, 430, 24, t, C.time_minutes + 0.3, 6);
}

// 4 · taste: the day becomes a monitor, the week a filmstrip
const RECT_TASTE = [70, 760, 470, 300];
const THUMBS = [["ai_editor", 2.5], ["clapper", 0.5], ["ai_camera", 3], ["ai_beard", 5], ["ai_studio", 2]];
function L_cant(g, t) {
  page(g);
  const s = C.s_cant - 0.45;
  footCell(g, "ai_beard", 70, 210, 940, 600, t, s, { instant: true, ss: 0.5, r: 18 });
  blueCell(g, ...RECT_TASTE);
  fadeTxt(g, "it doesn't have", 104, 838, 50, s + 0.4, t, { family: "Caveat", weight: 600, color: COL.sky });
  fadeTxt(g, "taste.", 100, 990, 150, C.cant_taste - 0.15, t, { weight: 700, color: "#fff", track: -4 });
  sparkle(g, 520, 770, 26, t, C.cant_taste + 0.2, 7);
  sticker(g, { at: s + 0.5, x: 830, y: 860, rot: 6, text: "AI alone", size: 38, bg: COL.lav }, t);
  // the shot strip: five cells like days
  const hold = outCubic(win(C.cant_hold - 0.1, C.cant_hold + 0.5, t));
  const cut = inOutCubic(win(C.cant_cut - 0.05, C.cant_cut + 0.45, t));
  const ws = [176, 176 + 60 * hold, 176, 176, 176];
  const total = ws.reduce((a, b) => a + b, 0) + 4 * 8 + 40 * cut;
  let x = (W - total) / 2;
  THUMBS.forEach(([clip, ss], i) => {
    const at = s + 0.35 + i * 0.08;
    footCell(g, clip, x, 1130, ws[i], 150, t, at, { ss, r: 8, shadow: false });
    fadeTxt(g, String(i + 1), x + ws[i] - 10, 1118, 30, at, t, { align: "right", weight: 500 });
    if (i === 3) x += 40 * cut;
    x += ws[i] + 8;
  });
  // which moment matters: circle shot 3
  const m3 = (W - total) / 2 + ws[0] + ws[1] + 16 + 88;
  loop(g, m3, 1205, 112, 102, outCubic(win(C.cant_moment - 0.05, C.cant_moment + 0.6, t)), { seed: 8, color: COL.blue, width: 6 });
  fadeTxt(g, "this one", m3 - 60, 1370, 54, C.cant_moment + 0.2, t, { family: "Caveat", weight: 600, color: COL.blue });
  sticker(g, { at: C.cant_hold, x: (W - total) / 2 + 176 + 8 + (236 * hold) / 2, y: 1060, rot: -6, text: "hold", size: 34, bg: COL.lblue, icon: ICON.pause }, t);
  // when to cut: a dashed scissor line splits the strip
  if (cut > 0) {
    const cx = (W - total) / 2 + ws[0] + ws[1] + ws[2] + ws[3] + 32 + 20 * cut;
    g.save(); g.strokeStyle = COL.navy; g.lineWidth = 3; g.setLineDash([10, 8]); g.globalAlpha = cut;
    g.beginPath(); g.moveTo(cx, 1100); g.lineTo(cx, 1310); g.stroke(); g.restore();
  }
  sticker(g, { at: C.cant_cut + 0.05, x: 880, y: 1370, rot: 8, text: "cut", size: 36, bg: COL.orange, icon: ICON.scissors }, t);
}

// 5 · next week's to-do: the job isn't disappearing, it's changing
function L_change(g, t) {
  page(g);
  const s = C.s_change - 0.45;
  fadeTxt(g, "the job", 70, 330, 96, s + 0.3, t, { weight: 700, track: -2 });
  fadeTxt(g, "next week's to-do", 1010, 330, 50, s + 0.45, t, { family: "Caveat", weight: 600, color: COL.blue, align: "right" });
  g.save(); g.globalAlpha = outCubic(win(s + 0.3, s + 0.8, t));
  g.strokeStyle = COL.line; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 380); g.lineTo(W, 380); g.stroke(); g.restore();
  const box = (y, at) => { const p = outCubic(win(at, at + 0.4, t)); if (p <= 0) return; g.save(); g.globalAlpha = p; g.strokeStyle = COL.navy; g.lineWidth = 4; K.rr(g, 80, y - 50, 56, 56, 8); g.stroke(); g.restore(); };
  box(500, C.change_disappearing - 0.3);
  fadeTxt(g, "disappearing", 170, 500, 70, C.change_disappearing - 0.15, t, { weight: 500 });
  strike(g, 160, 610, 476, win(C.change_disappearing + 0.45, C.change_disappearing + 0.95, t));
  box(640, C.change_changing - 0.3);
  fadeTxt(g, "changing", 170, 640, 70, C.change_changing - 0.15, t, { weight: 600, color: COL.blue });
  check(g, 112, 608, 60, win(C.change_changing + 0.1, C.change_changing + 0.45, t), COL.blue);
  loop(g, 330, 615, 190, 58, outCubic(win(C.change_changing + 0.15, C.change_changing + 0.7, t)), { seed: 11, color: COL.sky, width: 5 });
  sparkle(g, 540, 560, 24, t, C.change_changing + 0.4, 8);
  // less clicking  |  more deciding
  const less = outCubic(win(C.change_less, C.change_less + 0.6, t)), more = outCubic(win(C.change_more - 0.1, C.change_more + 0.6, t));
  const lw = lerp(460, 360, more), rx = 70 + lw + 20, rw = 940 - lw - 20;
  g.save();
  g.save(); g.translate(70 + lw / 2, 1050); const ls = 1 - 0.1 * less; g.scale(ls, ls); g.translate(-(70 + lw / 2), -1050);
  footCell(g, "ai_click", 70, 760, lw, 560, t, s + 0.6, { ss: 1, tint: `rgba(250,250,248,${0.35 * more})`, fx: 0.5 });
  g.restore();
  sticker(g, { at: C.change_less, x: 70 + lw / 2, y: 1330, rot: -5, text: "less clicking", size: 36, bg: COL.orange, icon: ICON.cursor }, t);
  g.restore();
  {
    const ep = outCubic(win(s + 0.7, s + 1.2, t)) * (1 - more);
    if (ep > 0) { g.save(); g.globalAlpha = ep; g.strokeStyle = COL.line; g.lineWidth = 2.5; g.setLineDash([12, 9]);
      K.rr(g, rx, 760, rw, 560, 14); g.stroke(); g.setLineDash([]);
      txt(g, "THU", rx + rw - 24, 820, 30, { align: "right", weight: 500, track: 5 }); txt(g, "?", rx + rw / 2, 1110, 180, { align: "center", weight: 300, color: "rgba(27,31,138,0.25)" });
      g.restore(); }
  }
  if (more > 0) {
    g.save(); g.globalAlpha = more;
    blueCell(g, rx, 760, rw, 560 * more);
    g.save(); K.rr(g, rx + 24, 790, rw - 48, 300, 10); g.clip();
    K.drawFit(g, K.footage("ai_thinker", t - C.change_more + 1, 1, true), rx + 24, 790, rw - 48, 300, { fx: 0.4 });
    g.restore();
    txt(g, "more", rx + 30, 1180, 70, { weight: 600, color: "#fff", track: -1 });
    txt(g, "deciding", rx + 30, 1270, 86, { weight: 700, color: "#fff", track: -2 });
    g.restore();
  }
  sparkle(g, 990, 760, 26, t, C.change_deciding + 0.2, 9);
}

// 6 · one editor + AI = the work of a small team
const RECT_TEAM = [70, 230, 940, 250];
const ROLES = [
  ["cuts", 210, 640, -8, COL.orange, "timeline", ICON.scissors],
  ["captions", 870, 620, 7, COL.lav, "ai_editor", ICON.cc],
  ["color", 170, 1000, 6, COL.lblue, "ai_grade", ICON.drop],
  ["sound", 905, 990, -6, COL.lyellow, null, ICON.note],
  ["resize", 250, 1340, -5, COL.lav, "ai_vertical", ICON.frames],
  ["shoot", 850, 1340, 6, COL.orange, "ai_studio", null],
];
function L_team(g, t) {
  page(g);
  const s = C.s_team - 0.45;
  blueCell(g, ...RECT_TEAM);
  fadeTxt(g, "1 editor + AI", 100, 360, 100, C.team_editor - 0.2, t, { weight: 700, color: "#fff", track: -2 });
  fadeTxt(g, "= the work of a small team", 104, 440, 54, C.team_work - 0.1, t, { family: "Caveat", weight: 600, color: COL.sky });
  // dashed links from the editor to each role
  ROLES.forEach(([name, x, y], i) => {
    const at = C.team_direct + i * 0.22, p = outCubic(win(at, at + 0.45, t));
    if (p <= 0) return;
    g.save(); g.strokeStyle = COL.navy; g.lineWidth = 2.5; g.setLineDash([9, 8]); g.lineDashOffset = -t * 12; g.globalAlpha = 0.8;
    g.beginPath(); g.moveTo(540, 1000); g.lineTo(lerp(540, x, p), lerp(1000, y, p)); g.stroke(); g.restore();
  });
  photoSticker(g, "ai_bearded", 540, 1010, 330, 0, t, C.team_editor - 0.1);
  sticker(g, { at: C.team_ai, x: 650, y: 860, rot: 10, text: "AI", size: 50, bg: COL.lav, w: 104, h: 92, r: 24 }, t);
  ROLES.forEach(([name, x, y, rot, bg, clip, icon], i) => {
    const at = C.team_direct + 0.15 + i * 0.22;
    g.save();
    const p = slap(g, x, y, rot, t, at);
    if (!p) { g.restore(); return; }
    const w = 250, h = 230;
    K.shadow(g, 16, 8, 0.22, "15,20,70"); g.fillStyle = "#fff"; K.rr(g, -w / 2 - 9, -h / 2 - 9, w + 18, h + 18, 30); g.fill(); K.noShadow(g);
    g.fillStyle = bg; K.rr(g, -w / 2, -h / 2, w, h, 22); g.fill(); g.strokeStyle = COL.navy; g.lineWidth = 3; K.rr(g, -w / 2, -h / 2, w, h, 22); g.stroke();
    g.save(); K.rr(g, -w / 2 + 14, -h / 2 + 14, w - 28, 140, 12); g.clip();
    if (clip) K.drawFit(g, K.footage(clip, t - at + 1, 1, true), -w / 2 + 14, -h / 2 + 14, w - 28, 140);
    else { g.fillStyle = "#fff"; g.fillRect(-w / 2 + 14, -h / 2 + 14, w - 28, 140); waveform(g, -w / 2 + 24, -h / 2 + 34, w - 48, 100, t, { seed: 77 }); }
    g.restore();
    txt(g, name, icon ? 18 : 0, h / 2 - 28, 38, { align: "center", weight: 700, track: 1 });
    if (icon) icon(g, -60, h / 2 - 42, 34);
    g.restore();
  });
  sparkle(g, 990, 250, 24, t, C.team_team, 10); sparkle(g, 700, 1150, 18, t, C.team_team + 0.15, 11);
}

// 7 · the director
const RECT_DIR = [70, 430, 940, 520];
function L_dir(g, t) {
  page(g);
  const s = C.s_dir - 0.45;
  fadeTxt(g, "the editor of the future is a", 74, 330, 58, s + 0.3, t, { family: "Caveat", weight: 600, color: COL.blue });
  blueCell(g, ...RECT_DIR);
  g.save(); K.rr(g, 100, 460, 880, 330, 10); g.clip();
  K.drawFit(g, K.footage("ai_camera", t - s + 0.5, 1, true), 100, 460, 880, 330, { fy: 0.3 });
  g.restore();
  fadeTxt(g, "director.", 100, 905, 130, C.outro_director - 0.15, t, { weight: 700, color: "#fff", track: -4 });
  photoSticker(g, "ai_director", 700, 1150, 520, 6, t, C.outro_director - 0.05);
  photoSticker(g, "ai_clapper", 270, 1190, 380, -10, t, s + 0.75);
  sparkle(g, 980, 430, 28, t, C.outro_director + 0.2, 12); sparkle(g, 460, 1060, 20, t, C.outro_director + 0.35, 13);
}

// 8 · this week, circled
const WEEK = [["MON", "26"], ["TUE", "27"], ["WED", "28"], ["THU", "29"], ["FRI", "30"], ["SAT", "31"], ["SUN", "1"]];
const RECT_TODAY = [70 + 3 * 134.3, 640, 134.3, 200];
function L_week(g, t) {
  page(g);
  const s = C.s_week;
  txt(g, "October", 70, 330, 92, { weight: 700, track: -1 });
  txt(g, "2026", 1010, 330, 80, { weight: 700, align: "right", track: -1 });
  const cw = 940 / 7;
  // three weeks of the month, this week in the middle
  const rows = [[19, 20, 21, 22, 23, 24, 25], WEEK.map((d) => d[1]), [2, 3, 4, 5, 6, 7, 8]];
  WEEK.forEach(([d], i) => txt(g, d, 70 + cw * i + cw / 2, 460, 26, { align: "center", weight: 500, track: 4 }));
  g.save(); g.strokeStyle = COL.line; g.lineWidth = 2;
  g.beginPath(); for (let i = 1; i < 7; i++) { g.moveTo(70 + cw * i, 400); g.lineTo(70 + cw * i, 1050); }
  for (const y of [420 - 20, 490, 640, 840, 1050]) { g.moveTo(0, y); g.lineTo(W, y); } g.stroke(); g.restore();
  blueCell(g, ...RECT_TODAY);
  rows.forEach((r, ri) => r.forEach((n, i) => {
    const y = [545, 700, 900][ri], today = ri === 1 && i === 3;
    txt(g, String(n), 70 + cw * (i + 1) - 14, y, 40, { align: "right", weight: 500,
      color: today ? "#fff" : ri === 1 ? COL.ink : "rgba(27,31,138,0.45)" });
  }));
  txt(g, "today", RECT_TODAY[0] + 14, 818, 42, { family: "Caveat", weight: 600, color: COL.sky });
  // circle the whole week
  loop(g, 540, 740, 500, 125, outCubic(win(C.outro_week - 0.35, C.outro_week + 0.5, t)), { seed: 15, color: COL.blue, width: 6 });
  fadeTxt(g, "the future", 70, 1200, 110, C.outro_future2 - 0.15, t, { weight: 700, track: -3 });
  fadeTxt(g, "starts this week.", 70, 1320, 96, C.outro_starts - 0.1, t, { weight: 600, color: COL.blue, track: -2 });
  badge(g, { at: C.outro_week + 0.2, x: 870, y: 980, rot: 10, r: 116, text: "starts\nnow", size: 44 }, t);
  photoSticker(g, "ai_director", 900, 1300, 250, -8, t, C.outro_week + 0.45);
  sparkle(g, 1010, 600, 26, t, C.outro_week + 0.1, 14); sparkle(g, 40, 860, 18, t, C.outro_week + 0.3, 15);
  sparkle(g, 640, 1150, 20, t, C.outro_starts + 0.2, 16);
}

// ------------------------------------------------------------------ captions --
// K.captions, but long phrases wrap onto two lines so they never leave the frame.
function captions(g, t) {
  const P = K.PHRASES;
  const idx = P.findIndex((p, i) => t >= p[0].t0 - 0.12 && t < (P[i + 1] ? Math.min(P[i + 1][0].t0 - 0.12, p[p.length - 1].t1 + 0.6) : p[p.length - 1].t1 + 0.6));
  if (idx < 0) return;
  const ph = P[idx], fs = 46;
  K.font(g, fs, 600, "Jost");
  const words = ph.map((w) => w.raw.replace(/[.,:]$/, "")), sp = g.measureText(" ").width;
  const wd = words.map((w) => g.measureText(w).width);
  const total = wd.reduce((a, b) => a + b + sp, -sp);
  let lines = [words.map((_, i) => i)];
  if (total > 900) {   // split where the two halves are most even
    let best = 1, bd = 1e9, acc = 0;
    for (let k = 1; k < words.length; k++) { acc += wd[k - 1] + sp; const d = Math.abs(acc - (total - acc)); if (d < bd) { bd = d; best = k; } }
    lines = [words.map((_, i) => i).slice(0, best), words.map((_, i) => i).slice(best)];
  }
  const endA = 1 - win(ph[ph.length - 1].t1 + 0.35, ph[ph.length - 1].t1 + 0.6, t);
  g.save(); g.textBaseline = "middle"; g.textAlign = "left";
  lines.forEach((ln, li) => {
    const lw = ln.reduce((a, i) => a + wd[i] + sp, -sp);
    let x = W / 2 - lw / 2; const y = 1520 + (li - (lines.length - 1) / 2) * 62;
    ln.forEach((i) => {
      const w = ph[i], p = outCubic(win(w.t0 - 0.08, w.t0 + 0.18, t)), active = t >= w.t0 - 0.05 && t < w.t1 + 0.05;
      g.globalAlpha = (0.3 + 0.7 * p) * endA;
      if (active) { g.fillStyle = COL.lblue; K.rr(g, x - 9, y - fs * 0.64, wd[i] + 18, fs * 1.28, 10); g.fill(); }
      g.fillStyle = COL.navy; g.fillText(words[i], x, y + 4 * (1 - p) + 2);
      x += wd[i] + sp;
    });
  });
  g.restore();
}

// ------------------------------------------------------------------ director --
const SCENES = [
  { id: "hook", start: 0, draw: L_hook },
  { id: "good", start: C.s_good, draw: L_good, tr: "morph", from: [362, 562, 357, 606], to: RECT_GOOD },
  { id: "time", start: C.s_time, draw: L_time, tr: "flip" },
  { id: "cant", start: C.s_cant, draw: L_cant, tr: "zoom", focus: [830, 478], from: RECT_NOW, to: RECT_TASTE },
  { id: "change", start: C.s_change, draw: L_change, tr: "glide" },
  { id: "team", start: C.s_team, draw: L_team, tr: "flip" },
  { id: "dir", start: C.s_dir, draw: L_dir, tr: "morph", from: RECT_TEAM, to: RECT_DIR },
  { id: "week", start: C.s_week, draw: L_week, tr: "zoomout", from: RECT_DIR, to: RECT_TODAY },
];
// transition length, and how far before `start` it begins (page lifts are slower: you watch the sheet go)
const trOf = (S) => (S.tr === "flip" ? [1.15, 0.62] : [0.85, 0.42]);
const PA = K.makeCanvas(W, H), PB = K.makeCanvas(W, H);
const ga = PA.getContext("2d"), gb = PB.getContext("2d");

function lerpRect(a, b, e) { return a.map((v, i) => lerp(v, b[i], e)); }
// draw a page around a zoom: scale s about focus point f, landing f at screen point to
function zoomed(g, src, s, f, to, alpha = 1) {
  g.save(); g.globalAlpha = alpha; g.translate(to[0], to[1]); g.scale(s, s); g.translate(-f[0], -f[1]); g.drawImage(src, 0, 0); g.restore();
}
// wall-calendar page lift: the old page rotates up about the spiral, toward the viewer
function lift(g, src, p) {
  const th = Math.PI * 0.97 * p, f = 7000, cx = W / 2, y0 = PAGE_TOP, strips = 120, sh = (H - y0) / strips;
  // the new page under it darkens where the lifting page still shades it
  const shade = 0.28 * Math.sin(Math.PI * Math.min(1, p * 1.4));
  for (let i = 0; i < strips; i++) {
    const d0 = i * sh, d1 = (i + 1) * sh;
    const z0 = d0 * Math.sin(th), z1 = d1 * Math.sin(th);
    const s0 = f / (f - z0), s1 = f / (f - z1), sm = (s0 + s1) / 2;
    const ya = y0 + d0 * Math.cos(th) * s0, yb = y0 + d1 * Math.cos(th) * s1;
    if (Math.abs(yb - ya) < 0.3) continue;
    const top = Math.min(ya, yb), hh = Math.abs(yb - ya) + 0.8, x = cx - (W / 2) * sm;
    if (yb >= ya) {   // the printed face, darkening as it tilts away from the light
      g.drawImage(src, 0, y0 + d0, W, sh, x, top, W * sm, hh);
      g.fillStyle = `rgba(10,14,60,${0.3 * (1 - Math.cos(th))})`; g.fillRect(x, top, W * sm, hh);
    } else {          // past 90°: the blank back of the sheet
      const l = 236 - 30 * Math.abs(Math.cos(th));
      g.fillStyle = `rgb(${l},${l},${l + 4})`; g.fillRect(x, top, W * sm, hh);
    }
  }
  return shade;
}

function frame(g, t) {
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1].start - trOf(SCENES[i + 1])[1]) i++;
  const S = SCENES[i], [TR, LEAD] = trOf(S), t0 = S.start - LEAD, p = i > 0 ? (t - t0) / TR : 1;
  let moving = false, speed = 0;
  if (i > 0 && p < 1) {
    const prev = SCENES[i - 1], e = inOutQuint(clamp(p));
    ga.setTransform(1, 0, 0, 1, 0, 0); gb.setTransform(1, 0, 0, 1, 0, 0);
    // the incoming page is drawn as it will look when the move lands, so it never arrives empty
    prev.draw(ga, t); S.draw(gb, t0 + TR);
    g.fillStyle = COL.paper; g.fillRect(0, 0, W, H);
    moving = true; speed = Math.sin(Math.PI * clamp(p));
    if (S.tr === "morph") {
      // a shared blue cell moves and reshapes; pages cross-fade underneath
      g.drawImage(PA, 0, 0);
      g.save(); g.globalAlpha = clamp((e - 0.35) / 0.4); g.drawImage(PB, 0, 0); g.restore();
      const r = lerpRect(S.from, S.to, e), a = 1 - clamp((e - 0.8) / 0.2);
      g.save(); g.globalAlpha = a; g.fillStyle = COL.blue; g.fillRect(...r); g.restore();
      speed *= 0.6;
    } else if (S.tr === "flip") {
      g.drawImage(PB, 0, 0);
      const shade = lift(g, PA, inOutCubic(clamp(p)));
      const grd = g.createLinearGradient(0, PAGE_TOP, 0, H); grd.addColorStop(0, `rgba(10,14,60,${shade})`); grd.addColorStop(1, "rgba(10,14,60,0)");
      g.fillStyle = grd; g.fillRect(0, PAGE_TOP, W, H);
      speed *= 0.5;
    } else if (S.tr === "zoom") {
      // dive into the small blue cell; it opens up into the next page's headline cell
      const s1 = lerp(1, 5.5, inCubic(clamp(p * 1.15)));
      zoomed(g, PA, s1, S.focus, S.focus, 1 - clamp((p - 0.45) / 0.3));
      const s2 = lerp(0.72, 1, outQuint(clamp((p - 0.35) / 0.65)));
      zoomed(g, PB, s2, [W / 2, H / 2], [W / 2, H / 2], clamp((p - 0.4) / 0.35));
    } else if (S.tr === "zoomout") {
      const s1 = lerp(1, 0.18, inOutCubic(clamp(p)));
      const ctr = [S.to[0] + S.to[2] / 2, S.to[1] + S.to[3] / 2];
      zoomed(g, PB, lerp(1.9, 1, inOutCubic(clamp(p))), ctr, ctr, clamp((p - 0.25) / 0.4));
      zoomed(g, PA, s1, [W / 2, H / 2], [lerp(W / 2, ctr[0], e), lerp(H / 2, ctr[1], e)], 1 - clamp((p - 0.55) / 0.3));
    } else if (S.tr === "glide") {
      // next week scrolls up from below
      g.drawImage(PA, 0, -H * e * 0.9); g.save(); g.globalAlpha = 1; g.drawImage(PB, 0, H * (1 - e) * 0.9); g.restore();
      g.save(); g.globalAlpha = 0.4 * Math.sin(Math.PI * e); g.strokeStyle = COL.line; g.lineWidth = 3;
      g.beginPath(); g.moveTo(0, H * (1 - e) * 0.9); g.lineTo(W, H * (1 - e) * 0.9); g.stroke(); g.restore();
    }
  } else {
    S.draw(g, t);
    // a slow drift keeps each page alive
  }
  wallAndSpiral(g);
  captions(g, t);
  K.grain(g, t, 0.05);
  return { moving, speed };
}

K.run(frame, ["600 40px Jost", "700 40px Jost", "500 40px Jost", "800 40px Jost", "600 40px Caveat"]);
})();

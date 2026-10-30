// Your first vibe edit in 5 steps
// A tutorial on a dark green cutting mat: glowing lime condensed type, Win95-style windows,
// a dark agent panel, lime click rings, real footage everywhere it plays. Scenes hand over with
// whip pans along the mat and zoom-throughs; each STEP marker blurs the scene behind it.
(function () {
const { clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring, rnd } = K;
const C = K.C, W = K.W, H = K.H;

const LIME = "#d6ff3c", LIME_D = "#a7cc1f", INK = "#0b2a1f", WHITE = "#f4f7f2";
const MAT = "#0b4a37", NAVY1 = "#00007f", NAVY2 = "#1084d0", GREY = "#c3c3c3";
const DISPLAY = "Anton", LABEL = "Bebas Neue", UI = "Inter Var", MONO = "Mono", HAND = "Caveat";
const EMOJI = '"Noto Color Emoji"';

// ------------------------------------------------------------------ mat --
// A tileable cutting-mat texture: fine grid, major grid, protractor arcs and angle marks.
const TILE = 1440;
const MATTILE = (() => {
  const c = K.makeCanvas(TILE, TILE), g = c.getContext("2d"), r = rnd(5);
  g.fillStyle = MAT; g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 160; i++) {          // soft mottling
    const x = r() * TILE, y = r() * TILE, rad = 60 + r() * 220;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, r() < 0.5 ? "rgba(0,30,20,0.10)" : "rgba(60,140,100,0.06)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    for (const dx of [-TILE, 0, TILE]) for (const dy of [-TILE, 0, TILE]) { g.fillStyle = gr; g.save(); g.translate(dx, dy); g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore(); }
  }
  g.strokeStyle = "rgba(150,225,185,0.10)"; g.lineWidth = 1.2; g.beginPath();
  for (let v = 0; v <= TILE; v += 36) { g.moveTo(v, 0); g.lineTo(v, TILE); g.moveTo(0, v); g.lineTo(TILE, v); }
  g.stroke();
  g.strokeStyle = "rgba(170,240,200,0.22)"; g.lineWidth = 2.2; g.beginPath();
  for (let v = 0; v <= TILE; v += 180) { g.moveTo(v, 0); g.lineTo(v, TILE); g.moveTo(0, v); g.lineTo(TILE, v); }
  g.stroke();
  // protractor arcs + diagonal construction lines from the tile corner
  g.strokeStyle = "rgba(170,240,200,0.13)"; g.lineWidth = 1.6;
  for (const R of [540, 900, 1260]) { g.beginPath(); g.arc(0, TILE, R, -Math.PI / 2, 0); g.stroke(); }
  g.font = "500 24px 'Inter Var'"; g.fillStyle = "rgba(170,240,200,0.30)";
  for (const a of [15, 30, 45, 60, 75]) {
    const ra = -a * Math.PI / 180;
    g.beginPath(); g.moveTo(0, TILE); g.lineTo(Math.cos(ra) * 1500, TILE + Math.sin(ra) * 1500); g.stroke();
    g.fillText(a + "°", Math.cos(ra) * 960 + 8, TILE + Math.sin(ra) * 960 - 8);
  }
  const id = g.getImageData(0, 0, TILE, TILE), d = id.data;   // fine speckle
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
})();
let matPat = null;
function drawMat(g, ox, oy, z = 1, a = 1) {
  if (!matPat) matPat = g.createPattern(MATTILE, "repeat");
  g.save(); g.globalAlpha = a;
  g.translate(W / 2, H / 2); g.scale(z, z);
  const mx = ((ox % TILE) + TILE) % TILE, my = ((oy % TILE) + TILE) % TILE;
  g.translate(-W / 2 - mx, -H / 2 - my);
  g.fillStyle = matPat; g.fillRect(mx - W, my - H, W * 3 / z + TILE, H * 3 / z + TILE);
  g.restore();
}

// ------------------------------------------------------------------ type --
function txt(g, s, x, y, size, o = {}) {
  g.save();
  g.font = `${o.weight || 400} ${size}px "${o.family || DISPLAY}"${o.emoji ? ", " + EMOJI : ""}`;
  g.textAlign = o.align || "center"; g.textBaseline = o.base || "alphabetic";
  if (o.ls != null && g.letterSpacing !== undefined) g.letterSpacing = o.ls + "px";
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowBlur ?? size * 0.14; }
  else if (o.shadow !== false) { g.shadowColor = "rgba(0,20,12,0.55)"; g.shadowBlur = 18; g.shadowOffsetY = 8; }
  g.fillStyle = o.color || WHITE;
  g.fillText(s, x, y);
  if (o.glow) { g.shadowBlur = (o.glowBlur ?? size * 0.14) * 0.35; g.fillText(s, x, y); }
  g.restore();
  g.font = `${o.weight || 400} ${size}px "${o.family || DISPLAY}"`;
  return g.measureText(s).width;
}
// a title that springs in at `at` (scale + rise + blur-free) and leaves at `out`
function title(g, s, x, y, size, t, at, o = {}) {
  const p = spring(win(at, at + 0.7, t)), q = o.out != null ? inCubic(win(o.out, o.out + 0.3, t)) : 0;
  if (p <= 0 || q >= 1) return;
  g.save(); g.globalAlpha *= clamp(p * 2.5) * (1 - q);
  g.font = `400 ${size}px "${o.family || DISPLAY}"`;
  const fit = Math.min(1, (o.maxW || 980) / g.measureText(s).width);    // never wider than the frame
  g.translate(x, y + 40 * (1 - clamp(p)) - 30 * q); const s2 = (0.82 + 0.18 * p) * (1 + 0.08 * q) * fit; g.scale(s2, s2);
  txt(g, s, 0, 0, size, { ...o, color: o.color || WHITE, glow: o.lime ? "rgba(214,255,60,0.75)" : o.glow });
  g.restore();
}
// words of a line appear one by one at their times
function wordsLine(g, words, x, y, size, t, o = {}) {
  g.save(); g.font = `400 ${size}px "${o.family || DISPLAY}"`;
  const sp = size * 0.22, ws = words.map(([s]) => g.measureText(s).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cx = o.align === "left" ? x : x - tot / 2;
  g.restore();
  words.forEach(([s, at, col], i) => {
    const p = spring(win(at, at + 0.55, t));
    if (p > 0) {
      g.save(); g.globalAlpha *= clamp(p * 3) * (o.alpha ?? 1);
      g.translate(cx + ws[i] / 2, y + 26 * (1 - clamp(p))); g.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
      txt(g, s, 0, 0, size, { family: o.family, color: col || WHITE, glow: col === LIME ? "rgba(214,255,60,0.7)" : null });
      g.restore();
    }
    cx += ws[i] + sp;
  });
}

// ------------------------------------------------------------------ ui bits --
function clickRing(g, x, y, t, at, r0 = 22) {
  const p = win(at, at + 0.75, t);
  if (p <= 0 || p >= 1) return;
  g.save();
  const e = outCubic(p);
  g.strokeStyle = `rgba(214,255,60,${0.95 * (1 - p)})`; g.lineWidth = 7 * (1 - p) + 2;
  g.shadowColor = "rgba(214,255,60,0.8)"; g.shadowBlur = 24;
  g.beginPath(); g.arc(x, y, r0 + 70 * e, 0, 7); g.stroke();
  g.fillStyle = `rgba(214,255,60,${0.9 * (1 - p * 0.7)})`;
  g.beginPath(); g.arc(x, y, r0 * 0.55 * (1 - 0.3 * Math.sin(Math.PI * Math.min(1, p * 3))), 0, 7); g.fill();
  g.restore();
}
function bevel(g, x, y, w, h, inset = false) {
  g.fillStyle = GREY; g.fillRect(x, y, w, h);
  g.fillStyle = inset ? "#7b7b7b" : "#ffffff"; g.fillRect(x, y, w, 2); g.fillRect(x, y, 2, h);
  g.fillStyle = inset ? "#ffffff" : "#5a5a5a"; g.fillRect(x, y + h - 2, w, 2); g.fillRect(x + w - 2, y, 2, h);
}
// Win95 window frame; returns the client rect
function win95(g, x, y, w, h, ttl, o = {}) {
  g.save();
  g.shadowColor = "rgba(0,15,8,0.55)"; g.shadowBlur = 40; g.shadowOffsetY = 22;
  g.fillStyle = GREY; g.fillRect(x, y, w, h); K.noShadow(g);
  bevel(g, x, y, w, h);
  const th = o.th || 46;
  const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, NAVY1); gr.addColorStop(1, NAVY2);
  g.fillStyle = gr; g.fillRect(x + 5, y + 5, w - 10, th);
  g.font = `700 ${Math.round(th * 0.52)}px "${UI}"`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(ttl, x + 18, y + 5 + th / 2 + 1);
  const bs = th - 12;
  ["_", "□", "×"].forEach((s, i) => {
    const bx = x + w - 10 - (3 - i) * (bs + 4) + 2, by = y + 11;
    bevel(g, bx, by, bs, bs - 2);
    g.fillStyle = "#000"; g.textAlign = "center"; g.font = `700 ${Math.round(bs * 0.75)}px "${UI}"`;
    g.fillText(s, bx + bs / 2, by + bs / 2 - (s === "_" ? 6 : 1));
  });
  g.restore();
  return { x: x + 8, y: y + th + 10, w: w - 16, h: h - th - 18, close: [x + w - 10 - (bs + 4) + 2 + bs / 2, y + 11 + bs / 2] };
}
function folderIcon(g, x, y, s, open = false) {
  g.save(); g.translate(x, y);
  g.fillStyle = "#c79a20"; g.fillRect(0, s * 0.12, s * 0.42, s * 0.16);
  g.fillStyle = open ? "#ffe680" : "#ffd84a"; g.fillRect(0, s * 0.22, s, s * 0.62);
  g.strokeStyle = "#7a5a00"; g.lineWidth = 2; g.strokeRect(0, s * 0.22, s, s * 0.62);
  g.restore();
}
function pill(g, s, x, y, t, at, o = {}) {        // the blue speech pill
  const p = spring(win(at, at + 0.7, t)), q = o.out != null ? inCubic(win(o.out, o.out + 0.25, t)) : 0;
  if (p <= 0 || q >= 1) return;
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(p * (1 - q), p * (1 - q));
  g.font = `700 ${o.size || 40}px "${UI}", ${EMOJI}`;
  const tw = g.measureText(s).width, ph = (o.size || 40) * 1.75, pw = tw + 64;
  g.shadowColor = "rgba(0,20,60,0.45)"; g.shadowBlur = 26; g.shadowOffsetY = 12;
  g.fillStyle = o.bg || "#2d6cf0"; K.rr(g, -pw / 2, -ph / 2, pw, ph, ph / 2); g.fill();
  g.beginPath(); g.moveTo(-pw * 0.18, ph / 2 - 2); g.lineTo(-pw * 0.26, ph / 2 + 26); g.lineTo(-pw * 0.06, ph / 2 - 2); g.fill();
  K.noShadow(g);
  g.fillStyle = o.fg || "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, 0, 3);
  g.restore();
}
// a real footage frame filling a rect (cover), playing from `at`
function foot(g, name, x, y, w, h, lt, o = {}) {
  const im = K.footage(name, lt + (o.ss || 0), o.speed || 1, o.loop ?? true);
  if (!im) return;
  g.save(); if (o.r) { K.rr(g, x, y, w, h, o.r); g.clip(); } else { g.beginPath(); g.rect(x, y, w, h); g.clip(); }
  if (o.filter) g.filter = o.filter;
  K.drawFit(g, im, x, y, w, h, { fx: o.fx, fy: o.fy, zoom: o.zoom });
  g.filter = "none"; g.restore();
}
// the first draft: a warm vertical montage of the real clips, with a burned caption
const DRAFT = ["fs_walk", "fs_waves", "fs_field", "fs_couple", "fs_beach"];
const DRAFT_CAP = ["golden hour,", "slowed down.", "no rush.", "just the light.", "and the sea."];
function draft(g, x, y, w, h, lt, o = {}) {
  const seg = 1.7, n = Math.floor(Math.max(0, lt) / seg), f = (Math.max(0, lt) % seg) / seg;
  const a = DRAFT[n % DRAFT.length], b = DRAFT[(n + 1) % DRAFT.length];
  g.save(); K.rr(g, x, y, w, h, o.r ?? 26); g.clip();
  g.fillStyle = "#000"; g.fillRect(x, y, w, h);
  const fx = { fs_walk: 0.55, fs_waves: 0.5, fs_field: 0.45, fs_couple: 0.62, fs_beach: 0.5 };
  foot(g, a, x, y, w, h, lt, { filter: "saturate(1.15) sepia(0.12)", fx: fx[a], zoom: 1 + 0.05 * f });
  if (f > 0.82) { g.globalAlpha = (f - 0.82) / 0.18; foot(g, b, x, y, w, h, lt, { filter: "saturate(1.15) sepia(0.12)", fx: fx[b] }); g.globalAlpha = 1; }
  if (o.caption !== false) {
    g.font = `700 ${Math.round(w * 0.075)}px "${UI}"`; g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "rgba(0,0,0,0.7)"; g.shadowBlur = 12; g.fillStyle = "#fff";
    g.fillText(DRAFT_CAP[n % DRAFT_CAP.length], x + w / 2, y + h * 0.78);
  }
  g.restore();
}
function corners(g, x, y, w, h, a = 1) {   // white corner brackets
  g.save(); g.globalAlpha *= a; g.strokeStyle = "#fff"; g.lineWidth = 5; const L = 46, d = 18;
  for (const [cx, cy, sx, sy] of [[x - d, y - d, 1, 1], [x + w + d, y - d, -1, 1], [x - d, y + h + d, 1, -1], [x + w + d, y + h + d, -1, -1]]) {
    g.beginPath(); g.moveTo(cx, cy + sy * L); g.lineTo(cx, cy); g.lineTo(cx + sx * L, cy); g.stroke();
  }
  g.restore();
}
// a real cut-out object, optionally with something painted into its measured screen
function object(g, key, x, y, w, rot, o = {}) {
  const im = K.object(key); if (!im) return;
  const h = w * im.height / im.width;
  g.save(); g.globalAlpha *= o.a ?? 1; g.translate(x, y); g.rotate(rot * Math.PI / 180);
  g.shadowColor = "rgba(0,15,8,0.55)"; g.shadowBlur = 50; g.shadowOffsetY = 30;
  g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
  const S = K.A.objects[key].screen;
  if (o.screen && S) {
    const L = S.len * w * 0.985, Wd = S.wid * w * 0.97;
    g.translate(-w / 2 + S.cx * w, -h / 2 + S.cy * w);
    g.rotate(S.ang * Math.PI / 180 + (o.portrait ? -Math.PI / 2 : 0));
    const sw = o.portrait ? Wd : L, sh = o.portrait ? L : Wd;
    g.save(); K.rr(g, -sw / 2, -sh / 2, sw, sh, Math.min(sw, sh) * (o.portrait ? 0.12 : 0.015)); g.clip();
    g.fillStyle = "#0b0b0d"; g.fillRect(-sw / 2, -sh / 2, sw, sh);
    o.screen(g, sw, sh);
    const gl = g.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2);
    gl.addColorStop(0, "rgba(255,255,255,0.10)"); gl.addColorStop(0.5, "rgba(255,255,255,0)");
    g.fillStyle = gl; g.fillRect(-sw / 2, -sh / 2, sw, sh);
    g.restore();
  }
  g.restore();
}
// a gentle 3D tilt for floating panels (skew + slight rotation)
function tilt(g, cx, cy, a, k = 1) {
  g.translate(cx, cy); g.rotate(a * Math.PI / 180); g.transform(1, -0.025 * k, 0.05 * k, 1, 0, 0); g.translate(-cx, -cy);
}

// ================================================================== scenes ==
// ---------------------------------------------------------------- hook --
function sHook1(g, t) {
  // "This is how" -> "your first vibe edit", over a real laptop playing a warm draft
  const q = win(C.h_make - 0.1, C.h_make + 0.25, t);
  if (q < 1) {
    g.save(); g.globalAlpha *= 1 - q; g.translate(0, -60 * outCubic(q));
    wordsLine(g, [["THIS", C.h_this], ["IS", C.h_this + 0.28], ["HOW", C.h_how]], 540, 420, 190, t);
    g.restore();
  }
  wordsLine(g, [["YOUR", C.h_make + 0.05], ["FIRST", C.h_first]], 540, 360, 165, t);
  wordsLine(g, [["VIBE", C.h_vibe, LIME], ["EDIT", C.h_edit - 0.12, LIME]], 540, 545, 200, t);
  const lp = outQuint(win(0, 0.7, t));
  object(g, "hw_laptop", 540, 1010 + 140 * (1 - lp), 900, -3 + 2 * Math.sin(t * 0.8), {
    a: clamp(lp * 2), screen: (g2, w, h) => draft(g2, -w / 2, -h / 2, w, h, t, { r: 0, caption: false }) });
  pill(g, "first vibe edit! 🔥", 650, 760, t, C.h_edit, { rot: -4 });
}
function sHook2(g, t) {
  // "under ten minutes": real blurred landscape, the alarm clock, huge type
  foot(g, "fs_foggy", 0, 0, W, H, t, { filter: "blur(16px) brightness(0.55) saturate(1.2)" });
  drawMat(g, 0, 0, 1, 0.35);
  const at = C.h_under - 0.1;
  title(g, "UNDER", 540, 520, 300, t, at);
  const cp = spring(win(C.h_ten - 0.15, C.h_ten + 0.6, t));
  if (cp > 0) {
    const wob = Math.sin(t * 38) * 2.2 * clamp(1 - win(C.h_ten, C.h_ten + 1.0, t)) + Math.sin(t * 2) * 1.5;
    object(g, "clock", 540, 860, 420 * (0.6 + 0.4 * cp), wob, { a: clamp(cp * 2) });
  }
  title(g, "10 MINUTES", 540, 1330, 230, t, C.h_ten + 0.05, { lime: true, color: LIME });
}
const TIMELINE_DLG = (g, r, t) => {          // a tiny NLE timeline inside the dialog
  g.fillStyle = "#1d1d1d"; g.fillRect(r.x, r.y, r.w, r.h);
  const rows = ["V2", "V1", "A1"], rh = (r.h - 30) / 3;
  const rr = rnd(9);
  rows.forEach((n, i) => {
    const y = r.y + 20 + i * rh;
    g.fillStyle = "#9a9a9a"; g.font = `600 22px "${UI}"`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(n, r.x + 12, y + rh / 2);
    let x = r.x + 60;
    while (x < r.x + r.w - 20) {
      const w = 50 + rr() * 110;
      g.fillStyle = i === 2 ? "#3aa577" : ["#5965d8", "#8a56d1"][i]; g.fillRect(x, y + 8, Math.min(w, r.x + r.w - 20 - x), rh - 16);
      x += w + 6;
    }
  });
  const ph = r.x + 60 + ((t * 120) % (r.w - 80));
  g.fillStyle = "#ff4b4b"; g.fillRect(ph, r.y + 6, 3, r.h - 12);
};
const KEYS_DLG = (g, r, t) => {              // keyframe diamonds on value curves
  g.fillStyle = "#1d1d1d"; g.fillRect(r.x, r.y, r.w, r.h);
  ["Position", "Scale", "Opacity"].forEach((n, i) => {
    const y = r.y + 30 + i * (r.h - 40) / 3;
    g.fillStyle = "#9a9a9a"; g.font = `600 22px "${UI}"`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(n, r.x + 12, y + 12);
    for (let k = 0; k < 7; k++) {
      const x = r.x + 150 + k * ((r.w - 180) / 6);
      g.save(); g.translate(x, y + 12); g.rotate(Math.PI / 4); g.fillStyle = k % 2 ? "#ffd04a" : "#9fd5ff"; g.fillRect(-9, -9, 18, 18); g.restore();
    }
  });
};
function dialog(g, t, x, y, w, h, ttl, body, at, closeAt, label) {
  const p = spring(win(at, at + 0.6, t)), c = win(closeAt + 0.12, closeAt + 0.45, t);
  if (p <= 0 || c >= 1) return;
  g.save(); g.translate(x + w / 2, y + h / 2);
  const s = (0.7 + 0.3 * p) * (1 - 0.6 * inCubic(c)); g.scale(s, s); g.rotate(-0.25 * inCubic(c));
  g.globalAlpha *= clamp(p * 3) * (1 - c);
  g.translate(-w / 2, -h / 2);
  const r = win95(g, 0, 0, w, h, ttl);
  body(g, { x: r.x + 6, y: r.y + 4, w: r.w - 12, h: r.h - 76 }, t);
  g.font = `700 30px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(label, r.x + 10, r.y + r.h - 32);
  g.restore();
  clickRing(g, x + (r.close[0]) * 1, y + r.close[1], t, closeAt);
}
function sHook3(g, t) {
  // "No timeline. No keyframes." two dialogs pop and get closed
  g.save(); g.globalAlpha *= clamp(win(C.h_no1 - 0.2, C.h_no1 + 0.2, t));
  txt(g, "DON'T", 540, 760, 380, { color: "rgba(150,230,190,0.08)", shadow: false });
  txt(g, "NEED", 540, 1150, 380, { color: "rgba(150,230,190,0.08)", shadow: false });
  g.restore();
  dialog(g, t, 110, 330, 860, 470, "Timeline.exe", TIMELINE_DLG, C.h_no1 - 0.08, C.h_no2 - 0.35, "You don't need a timeline.");
  title(g, "NO TIMELINE.", 540, 950, 150, t, C.h_timeline, { lime: true, color: LIME, out: C.h_no2 - 0.2 });
  dialog(g, t, 110, 640, 860, 470, "Keyframes.exe", KEYS_DLG, C.h_no2 - 0.05, C.s1 - 0.6, "You don't need keyframes.");
  title(g, "NO KEYFRAMES.", 540, 1300, 150, t, C.h_keyframes, { lime: true, color: LIME });
}

// ---------------------------------------------------------------- step markers --
const off = K.makeCanvas(W, H), og = off.getContext("2d");
function marker(n, behind) {
  return (g, t, sc) => {
    const at = sc.t0;
    // the previous scene, blurred and dimmed behind the marker
    og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, W, H);
    drawMat(og, sc.mat[0], sc.mat[1]);
    behind(og, t);
    const b = outCubic(win(at, at + 0.3, t));
    g.save(); g.filter = `blur(${(14 * b).toFixed(1)}px) brightness(${(1 - 0.55 * b).toFixed(2)})`;
    g.drawImage(off, 0, 0); g.restore();
    g.save(); g.strokeStyle = "rgba(214,255,60,0.45)"; g.lineWidth = 3;
    const lp = outExpo(win(at + 0.05, at + 0.5, t));
    g.beginPath(); g.moveTo(0, 1180); g.lineTo(W * lp, 1180); g.moveTo(W, 640); g.lineTo(W * (1 - lp), 640); g.stroke(); g.restore();
    const sp = spring(win(at, at + 0.6, t));
    g.save(); g.translate(-260 * (1 - clamp(sp)), 0); g.globalAlpha *= clamp(sp * 2);
    txt(g, "STEP", 540, 780, 200, {}); g.restore();
    const np = spring(win(at + 0.12, at + 0.8, t));
    g.save(); g.translate(540, 1130); const s = 1.5 - 0.5 * np; g.scale(s, s); g.globalAlpha *= clamp(np * 2.5);
    txt(g, String(n), 0, 0, 460, { color: LIME, glow: "rgba(214,255,60,0.8)", glowBlur: 70 }); g.restore();
    for (let i = 0; i < 5; i++) {           // progress dots
      g.fillStyle = i < n ? LIME : "rgba(214,255,60,0.25)";
      g.beginPath(); g.arc(540 + (i - 2) * 46, 1260, i === n - 1 ? 12 : 8, 0, 7); g.fill();
    }
  };
}

// ---------------------------------------------------------------- step 1: one folder --
const FILES = [["fs_beach", "beach.mp4"], ["fs_walk", "walk.mp4"], ["fs_waves", "waves.mp4"], ["fs_field", "field.mp4"]];
function logoTile(g, x, y, w, h) {
  g.fillStyle = "#101010"; g.fillRect(x, y, w, h);
  g.font = `400 ${Math.round(h * 0.3)}px "${DISPLAY}"`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = LIME; g.fillText("VIBE", x + w / 2, y + h * 0.36);
  g.fillStyle = "#fff"; g.fillText("EDITING", x + w / 2, y + h * 0.68);
}
const FM = { x: 70, y: 380, w: 940, h: 860 };
function fileManager(g, t, o = {}) {
  const r = win95(g, FM.x, FM.y, FM.w, FM.h, "File Manager - C:\\MY-FIRST-VIBE-EDIT");
  g.font = `500 26px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "left"; g.textBaseline = "middle";
  ["File", "Disk", "Tree", "View", "Options", "Window", "Help"].forEach((s, i) => g.fillText(s, r.x + 14 + i * 108, r.y + 16));
  const tr = { x: r.x + 4, y: r.y + 40, w: 300, h: r.h - 90 }, rp = { x: r.x + 312, y: r.y + 40, w: r.w - 316, h: r.h - 90 };
  bevel(g, tr.x, tr.y, tr.w, tr.h, true); g.fillStyle = "#fff"; g.fillRect(tr.x + 2, tr.y + 2, tr.w - 4, tr.h - 4);
  bevel(g, rp.x, rp.y, rp.w, rp.h, true); g.fillStyle = "#fff"; g.fillRect(rp.x + 2, rp.y + 2, rp.w - 4, rp.h - 4);
  // tree
  const rows = [["C:\\", 0, 0], ["my-first-vibe-edit", 1, C.s1_put - 0.2], ["clips", 2, C.s1_clips]];
  rows.forEach(([n, d, at], i) => {
    const a = clamp(win(at, at + 0.3, t) * 1.5) || (at <= 0 ? 1 : 0);
    if (a <= 0) return;
    g.save(); g.globalAlpha *= a;
    const y = tr.y + 34 + i * 58, x = tr.x + 16 + d * 30;
    if (i === 1 && t > C.s1_folder - 0.05) { g.fillStyle = NAVY1; g.fillRect(x + 50, y - 20, 236 - d * 30, 40); }
    folderIcon(g, x, y - 22, 44, i === 1);
    g.font = `600 24px "${UI}"`; g.fillStyle = i === 1 && t > C.s1_folder - 0.05 ? "#fff" : "#000"; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(n, x + 56, y); g.restore();
  });
  // right pane: the four clips fly in, then music and logo
  const cw = (rp.w - 60) / 2, ch = cw * 9 / 16;
  FILES.forEach(([f, n], i) => {
    const at = C.s1_clips - 0.1 + i * 0.12, p = outQuint(win(at, at + 0.55, t));
    if (p <= 0) return;
    const tx = rp.x + 20 + (i % 2) * (cw + 20), ty = rp.y + 24 + Math.floor(i / 2) * (ch + 62);
    const x = lerp(-400 + i * 60, tx, p), y = lerp(1500, ty, p);
    g.save(); g.globalAlpha *= clamp(p * 2);
    g.shadowColor = "rgba(0,0,0,0.35)"; g.shadowBlur = 20 * (1 - p); g.fillStyle = "#000"; g.fillRect(x, y, cw, ch); K.noShadow(g);
    foot(g, f, x, y, cw, ch, t - at);
    g.font = `600 22px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "center"; g.textBaseline = "top"; g.fillText(n, x + cw / 2, y + ch + 8);
    g.restore();
    if (i === 3) clickRing(g, tx + cw / 2, ty + ch / 2, t, at + 0.5);
  });
  const ry = rp.y + 24 + 2 * (ch + 62) + 4;
  const mp = outQuint(win(C.s1_music - 0.1, C.s1_music + 0.45, t));
  if (mp > 0) {
    const x = lerp(rp.x + rp.w + 300, rp.x + 20, mp);
    g.save(); g.globalAlpha *= clamp(mp * 2);
    g.fillStyle = "#e9e9e9"; g.fillRect(x, ry, cw, ch);
    g.fillStyle = "#2d2dd8"; g.font = `400 70px "${UI}", ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("♪", x + 48, ry + ch / 2);
    for (let k = 0; k < 22; k++) { const hh = (0.25 + 0.75 * Math.abs(Math.sin(k * 1.7 + t * 6))) * ch * 0.6; g.fillRect(x + 92 + k * 9, ry + ch / 2 - hh / 2, 5, hh); }
    g.font = `600 22px "${UI}"`; g.fillStyle = "#000"; g.textBaseline = "top"; g.fillText("music.mp3", x + cw / 2, ry + ch + 8);
    g.restore(); clickRing(g, rp.x + 20 + cw / 2, ry + ch / 2, t, C.s1_music + 0.35);
  }
  const lg = outQuint(win(C.s1_logo - 0.1, C.s1_logo + 0.45, t));
  if (lg > 0) {
    const x = rp.x + 40 + cw, y = lerp(-300, ry, lg);
    g.save(); g.globalAlpha *= clamp(lg * 2);
    logoTile(g, x, y, cw, ch);
    g.font = `600 22px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "center"; g.textBaseline = "top"; g.fillText("logo.png", x + cw / 2, y + ch + 8);
    g.restore(); clickRing(g, x + cw / 2, ry + ch / 2, t, C.s1_logo + 0.35);
  }
  // status bar
  const nfiles = (t > C.s1_clips ? 4 : 0) + (t > C.s1_music ? 1 : 0) + (t > C.s1_logo ? 1 : 0);
  bevel(g, r.x + 4, r.y + r.h - 42, r.w - 8, 38, true);
  g.font = `500 22px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(`${nfiles} file(s)    ${(nfiles ? 12.4 * nfiles - (nfiles > 4 ? 18 : 0) : 0).toFixed(1)} MB`, r.x + 16, r.y + r.h - 23);
  if (o.menu) o.menu(g, tr);
}
function sStep1(g, t) {
  g.save(); tilt(g, 540, 800, -1.5); fileManager(g, t); g.restore();
  title(g, "ONE FOLDER", 540, 300, 170, t, C.s1_put - 0.05, { lime: true, color: LIME });
  clickRing(g, 330, 512, t, C.s1_folder);
}

// ---------------------------------------------------------------- step 2: agent + brief --
const MENU = ["Open", "Rename", "Copy", "-", "✦ Open agent here"];
function sStep2a(g, t) {
  const ctx = (g2, tr) => {
    const p = outQuint(win(C.s2_open, C.s2_open + 0.35, t));
    if (p <= 0) return;
    const x = tr.x + 200, y = tr.y + 100, w = 440, ih = 58;
    g2.save(); g2.globalAlpha *= clamp(p * 2); g2.translate(x, y); g2.scale(1, p); g2.translate(-x, -y);
    const h = MENU.length * ih - 30 + 12;
    g2.shadowColor = "rgba(0,0,0,0.45)"; g2.shadowBlur = 24; g2.shadowOffsetY = 12; g2.fillStyle = GREY; g2.fillRect(x, y, w, h); K.noShadow(g2);
    bevel(g2, x, y, w, h);
    let yy = y + 6;
    MENU.forEach((m, i) => {
      if (m === "-") { g2.fillStyle = "#808080"; g2.fillRect(x + 10, yy + 12, w - 20, 2); yy += 28; return; }
      const hot = i === 4 && t > C.s2_agent - 0.15;
      if (hot) { g2.fillStyle = LIME; g2.fillRect(x + 6, yy, w - 12, ih - 6); }
      g2.font = `${i === 4 ? 800 : 500} 28px "${UI}"`; g2.fillStyle = hot ? INK : "#000"; g2.textAlign = "left"; g2.textBaseline = "middle";
      g2.fillText(m, x + 26, yy + (ih - 6) / 2); yy += ih;
    });
    g2.restore();
  };
  g.save(); tilt(g, 540, 800, -1.5); fileManager(g, t, { menu: ctx }); g.restore();
  title(g, "OPEN AN AGENT", 540, 300, 160, t, C.s2_open - 0.1, { lime: true, color: LIME });
  clickRing(g, 330, 512, t, C.s2_open - 0.05);
  clickRing(g, 520, 800, t, C.s2_agent + 0.1);
}

const BRIEF = "Make a 30-second vertical reel from these clips. Calm, warm, cinematic. Captions on. End on the logo.";
const HL = [   // [phrase, tag, cue, side]
  ["vertical reel", "PLATFORM", "s2_platform", -1],
  ["30-second", "LENGTH", "s2_length", 1],
  ["Calm, warm, cinematic.", "MOOD", "s2_mood", -1],
  ["End on the logo.", "ENDING", "s2_ends", 1],
];
// lay out text in a box, returning word rects with character offsets (for highlights)
function layout(g, text, maxW, lh) {
  const words = []; let ci = 0;
  for (const w of text.split(" ")) { words.push({ w, c0: ci, c1: ci + w.length }); ci += w.length + 1; }
  const sp = g.measureText(" ").width; let x = 0, y = 0;
  for (const wd of words) {
    const ww = g.measureText(wd.w).width;
    if (x > 0 && x + ww > maxW) { x = 0; y += lh; }
    wd.x = x; wd.y = y; wd.ww = ww; x += ww + sp;
  }
  return words;
}
const PANEL = { x: 80, y: 360, w: 920, h: 940 };
function agentPanel(g, t, body) {
  const P = PANEL;
  g.save();
  g.shadowColor = "rgba(0,12,6,0.65)"; g.shadowBlur = 60; g.shadowOffsetY = 30;
  g.fillStyle = "#121413"; K.rr(g, P.x, P.y, P.w, P.h, 30); g.fill(); K.noShadow(g);
  g.strokeStyle = "rgba(255,255,255,0.09)"; g.lineWidth = 2; K.rr(g, P.x, P.y, P.w, P.h, 30); g.stroke();
  g.fillStyle = LIME; g.beginPath(); g.arc(P.x + 44, P.y + 46, 10, 0, 7); g.fill();
  g.font = `700 30px "${UI}"`; g.fillStyle = "#fff"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("agent", P.x + 66, P.y + 46);
  g.font = `500 24px "${MONO}"`; g.fillStyle = "rgba(255,255,255,0.45)"; g.fillText("~/my-first-vibe-edit", P.x + 160, P.y + 47);
  g.textAlign = "right"; g.fillStyle = LIME; g.fillText("6 files ✓", P.x + P.w - 36, P.y + 47);
  g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(P.x, P.y + 88, P.w, 2);
  body(g, P);
  g.restore();
}
function bubble(g, s, x, y, maxW, t, at, o = {}) {
  const p = outCubic(win(at, at + 0.3, t)); if (p <= 0) return 0;
  g.save(); g.globalAlpha *= p;
  g.font = `500 ${o.size || 30}px "${UI}"`;
  const shown = o.cps ? K.typed(s, t, at, o.cps) : s;
  const lines = K.wrap(g, s, maxW - 48), lh = (o.size || 30) * 1.38;
  const shownLines = K.wrap(g, shown, maxW - 48);
  const w = Math.min(maxW, Math.max(...lines.map((l) => g.measureText(l).width)) + 48), h = lines.length * lh + 34;
  const bx = o.right ? x + maxW - w : x;
  g.fillStyle = o.bg || "#24282a"; K.rr(g, bx, y, w, h, 22); g.fill();
  g.fillStyle = o.fg || "#e8ece9"; g.textAlign = "left"; g.textBaseline = "top";
  shownLines.forEach((l, i) => g.fillText(l, bx + 24, y + 18 + i * lh));
  g.restore();
  return h;
}
function sStep2b(g, t) {
  const at = C.s2_write - 0.4, cps = 46;
  g.save(); tilt(g, 540, 830, 1.2, 0.8);
  agentPanel(g, t, (g2, P) => {
    bubble(g2, "I can see 4 clips, music.mp3 and logo.png. What should we make?", P.x + 36, P.y + 120, 760, t, C.s2_folder - 0.5, { cps: 90 });
    // the brief box
    const bx = P.x + 36, by = P.y + 380, bw = P.w - 72, bh = 470;
    g2.fillStyle = "#1b1f1d"; K.rr(g2, bx, by, bw, bh, 22); g2.fill();
    g2.strokeStyle = t > at ? "rgba(214,255,60,0.7)" : "rgba(255,255,255,0.12)"; g2.lineWidth = 3; K.rr(g2, bx, by, bw, bh, 22); g2.stroke();
    g2.font = `700 24px "${UI}"`; g2.fillStyle = LIME; g2.textAlign = "left"; g2.textBaseline = "middle"; g2.fillText("BRIEF", bx + 28, by + 36);
    g2.font = `500 44px "${UI}"`;
    const lh = 64, words = layout(g2, BRIEF, bw - 64, lh);
    const n = Math.floor(Math.max(0, t - at) * cps);
    // highlights behind the words
    HL.forEach(([ph, , cue]) => {
      const c0 = BRIEF.indexOf(ph), c1 = c0 + ph.length, p = outCubic(win(C[cue] - 0.1, C[cue] + 0.25, t));
      if (p <= 0) return;
      for (const wd of words) if (wd.c0 >= c0 && wd.c1 <= c1 + 0) {
        g2.fillStyle = "rgba(214,255,60,0.9)"; g2.fillRect(bx + 32 + wd.x - 6, by + 74 + wd.y, (wd.ww + 12) * p, lh - 8);
      }
    });
    let caret = null;
    for (const wd of words) {
      const vis = Math.max(0, Math.min(wd.w.length, n - wd.c0));
      if (vis <= 0) { if (!caret) caret = [bx + 32 + wd.x, by + 74 + wd.y]; continue; }
      const inHL = HL.some(([ph, , cue]) => { const c0 = BRIEF.indexOf(ph); return wd.c0 >= c0 && wd.c1 <= c0 + ph.length && t > C[cue] - 0.05; });
      g2.fillStyle = inHL ? INK : "#f2f5f1"; g2.textAlign = "left"; g2.textBaseline = "top";
      g2.fillText(wd.w.slice(0, vis), bx + 32 + wd.x, by + 78 + wd.y);
      if (vis < wd.w.length && !caret) caret = [bx + 32 + wd.x + g2.measureText(wd.w.slice(0, vis)).width, by + 74 + wd.y];
    }
    if (!caret) { const lw = words[words.length - 1]; caret = [bx + 32 + lw.x + lw.ww + 4, by + 74 + lw.y]; }
    if (t > at && Math.floor(t * 2.4) % 2 === 0) { g2.fillStyle = LIME; g2.fillRect(caret[0], caret[1] + 6, 4, lh - 14); }
    // send button
    g2.fillStyle = t > C.s2_ends + 0.5 ? LIME : "#2c312e"; g2.beginPath(); g2.arc(bx + bw - 54, by + bh - 52, 32, 0, 7); g2.fill();
    g2.strokeStyle = t > C.s2_ends + 0.5 ? INK : "#888"; g2.lineWidth = 5; g2.beginPath();
    g2.moveTo(bx + bw - 54, by + bh - 36); g2.lineTo(bx + bw - 54, by + bh - 68); g2.moveTo(bx + bw - 68, by + bh - 55); g2.lineTo(bx + bw - 54, by + bh - 69); g2.lineTo(bx + bw - 40, by + bh - 55); g2.stroke();
  });
  g.restore();
  title(g, "WRITE THE BRIEF", 540, 290, 150, t, C.s2_write - 0.1, { lime: true, color: LIME });
  // tags hanging off the panel edges
  HL.forEach(([, tag, cue, side], i) => {
    const p = spring(win(C[cue], C[cue] + 0.6, t)); if (p <= 0) return;
    const y = 1370 + Math.floor(i / 2) * 0, x = 540 + (i - 1.5) * 238;
    g.save(); g.translate(x, y); g.scale(p, p); g.rotate((i % 2 ? 3 : -3) * Math.PI / 180);
    g.font = `400 52px "${LABEL}"`; const tw = g.measureText(tag).width;
    g.shadowColor = "rgba(214,255,60,0.6)"; g.shadowBlur = 22; g.fillStyle = LIME; K.rr(g, -tw / 2 - 18, -36, tw + 36, 70, 12); g.fill(); K.noShadow(g);
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(tag, 0, 4);
    g.restore();
  });
  clickRing(g, PANEL.x + PANEL.w - 90, PANEL.y + 380 + 470 - 52 + 10, t, C.s2_ends + 0.45);
}

// ---------------------------------------------------------------- step 3: code + render --
const CODE = [
  ["clips", " = [", "\"walk\"", ", ", "\"waves\"", ", ", "\"field\"", ", ", "\"beach\"", "]"],
  ["music", "(", "\"music.mp3\"", ", duck_under_voice=", "True", ")"],
  ["for", " i, c ", "in", " enumerate(clips):"],
  ["    clip", "(c + ", "\".mp4\"", ", start=i * ", "7.5", ", grade=", "\"warm\"", ")"],
  ["captions", "(style=", "\"clean\"", ")"],
  ["logo", "(", "\"logo.png\"", ", at=", "28.5", ")"],
  ["render", "(", "\"first-draft.mp4\"", ", ", "1080", ", ", "1920", ")"],
];
function codeColor(s) {
  if (/^".*"$/.test(s)) return "#b7e08a";
  if (/^[\d.]+$/.test(s) || s === "True") return LIME;
  if (s === "for" || s === "in") return "#ffcf6e";
  if (/^ *(clips|music|clip|captions|logo|render)$/.test(s)) return "#8fd0ff";
  return "#e9ece8";
}
function sStep3(g, t) {
  g.save(); tilt(g, 540, 830, 1.2, 0.8);
  agentPanel(g, t, (g2, P) => {
    bubble(g2, BRIEF, P.x + 220, P.y + 110, P.w - 256, t, C.s3 - 1.3, { right: true, size: 24, bg: "#3a4a17", fg: "#f0ffd0" });
    const working = t < C.s3_writes - 0.1;
    g2.font = `600 28px "${UI}"`; g2.fillStyle = "#cfd5d1"; g2.textAlign = "left"; g2.textBaseline = "middle";
    const sp = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[Math.floor(t * 12) % 10];
    g2.fillText(working ? `${sp}  Building your edit…` : (t < C.s3_renders - 0.1 ? "✓  Writing the edit as code" : "✓  Rendering a first draft"), P.x + 40, P.y + 330);
    // code block streams in
    const cx = P.x + 36, cy = P.y + 380, cw = P.w - 72, chh = 360;
    const cp = outCubic(win(C.s3_writes - 0.25, C.s3_writes + 0.1, t));
    if (cp > 0) {
      g2.save(); g2.globalAlpha *= cp;
      g2.fillStyle = "#0b0d0c"; K.rr(g2, cx, cy, cw, chh, 18); g2.fill();
      if (t > C.s3_code - 0.1) { g2.strokeStyle = `rgba(214,255,60,${0.8 * clamp(win(C.s3_code - 0.1, C.s3_code + 0.2, t))})`; g2.lineWidth = 3; K.rr(g2, cx, cy, cw, chh, 18); g2.stroke(); }
      g2.font = `500 23px "${MONO}"`; g2.textBaseline = "top"; g2.textAlign = "left";
      let n = Math.floor((t - C.s3_writes + 0.1) * 120);
      CODE.forEach((line, li) => {
        let x = cx + 24; const y = cy + 24 + li * 46;
        g2.fillStyle = "rgba(255,255,255,0.25)"; g2.fillText(String(li + 1), x, y); x += 40;
        for (const tok of line) {
          const vis = Math.max(0, Math.min(tok.length, n)); n -= tok.length;
          if (vis <= 0) break;
          g2.fillStyle = codeColor(tok.trim() ? tok : tok); g2.fillText(tok.slice(0, vis), x, y); x += g2.measureText(tok.slice(0, vis)).width;
        }
      });
      g2.restore();
    }
    // render bar
    const rp = win(C.s3_renders - 0.15, C.s3_draft + 0.15, t);
    if (rp > 0) {
      const by = cy + chh + 40;
      g2.fillStyle = "#1e2320"; K.rr(g2, cx, by, cw, 56, 28); g2.fill();
      g2.fillStyle = LIME; K.rr(g2, cx + 6, by + 6, (cw - 12) * inOutCubic(rp), 44, 22); g2.fill();
      g2.font = `700 24px "${UI}"`; g2.fillStyle = rp > 0.55 ? INK : "#fff"; g2.textAlign = "center"; g2.textBaseline = "middle";
      g2.fillText(rp < 1 ? `rendering first-draft.mp4 · frame ${Math.floor(rp * 900)} / 900` : "first-draft.mp4 ✓", cx + cw / 2, by + 29);
    }
  });
  g.restore();
  title(g, "IT WRITES CODE", 540, 290, 150, t, C.s3_writes - 0.1, { lime: true, color: LIME, out: C.s3_draft - 0.5 });
  title(g, "LET IT BUILD", 540, 290, 150, t, C.s3_let - 0.05, { out: C.s3_writes - 0.4 });
  // the first draft slides in over the panel
  const dp = outQuint(win(C.s3_draft - 0.2, C.s3_draft + 0.45, t));
  if (dp > 0) {
    const w = 430, h = 764, x = lerp(1250, 600, dp), y = 640;
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate((4 + 8 * (1 - dp)) * Math.PI / 180); g.translate(-w / 2, -h / 2);
    g.shadowColor = "rgba(0,10,5,0.6)"; g.shadowBlur = 50; g.shadowOffsetY = 24; g.fillStyle = "#000"; K.rr(g, 0, 0, w, h, 26); g.fill(); K.noShadow(g);
    draft(g, 0, 0, w, h, t - C.s3_draft + 0.2);
    corners(g, 0, 0, w, h, dp);
    g.restore();
    title(g, "FIRST DRAFT", 540, 290, 160, t, C.s3_draft - 0.15, { lime: true, color: LIME });
  }
}

// ---------------------------------------------------------------- step 4: three notes --
const NOTES = [["1. faster start", 150, 520, -7], ["2. warmer music", 860, 820, 6], ["3. bigger captions", 190, 1150, 4]];
function sticky(g, s, x, y, rot, p, o = {}) {
  if (p <= 0) return;
  const w = o.w || 330, h = o.h || 300;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); const sc = 1.35 - 0.35 * p; g.scale(sc, sc); g.globalAlpha *= clamp(p * 3);
  g.shadowColor = "rgba(0,10,5,0.45)"; g.shadowBlur = 24 + 30 * (1 - p); g.shadowOffsetY = 14 + 20 * (1 - p);
  g.fillStyle = o.col || "#ffe45c"; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2, h / 2 - 30); g.lineTo(w / 2 - 30, h / 2); g.lineTo(-w / 2, h / 2); g.closePath(); g.fill();
  K.noShadow(g);
  g.fillStyle = "rgba(0,0,0,0.08)"; g.beginPath(); g.moveTo(w / 2, h / 2 - 30); g.lineTo(w / 2 - 30, h / 2 - 30); g.lineTo(w / 2 - 30, h / 2); g.fill();
  if (s) {
    g.font = `700 ${o.fs || 58}px "${HAND}"`; g.fillStyle = "#2a2410"; g.textAlign = "center"; g.textBaseline = "middle";
    const ls = K.wrap(g, s, w - 40); ls.forEach((l, i) => g.fillText(l, 0, (i - (ls.length - 1) / 2) * (o.fs || 58) * 1.05));
  }
  g.restore();
}
function sStep4(g, t) {
  const P = { x: 260, y: 400, w: 560, h: 995 };
  g.save(); g.shadowColor = "rgba(0,10,5,0.6)"; g.shadowBlur = 60; g.shadowOffsetY = 30; g.fillStyle = "#000"; K.rr(g, P.x, P.y, P.w, P.h, 30); g.fill(); g.restore();
  draft(g, P.x, P.y, P.w, P.h, t - C.s4 + 1.5);
  corners(g, P.x, P.y, P.w, P.h);
  // play bar: watching it once
  const wp = clamp(win(C.s4_watch - 0.1, C.s4 + 6, t));
  g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(P.x + 30, P.y + P.h - 40, P.w - 60, 6);
  g.fillStyle = LIME; g.fillRect(P.x + 30, P.y + P.h - 40, (P.w - 60) * wp, 6);
  g.beginPath(); g.arc(P.x + 30 + (P.w - 60) * wp, P.y + P.h - 37, 11, 0, 7); g.fill();
  const pp = spring(win(C.s4_watch - 0.1, C.s4_watch + 0.5, t)) * (1 - win(C.s4_once + 0.2, C.s4_once + 0.6, t));
  if (pp > 0.01) {
    g.save(); g.translate(P.x + P.w / 2, P.y + P.h / 2); g.scale(pp, pp);
    g.fillStyle = "rgba(0,0,0,0.45)"; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(-28, -42); g.lineTo(46, 0); g.lineTo(-28, 42); g.fill(); g.restore();
  }
  title(g, "WATCH ONCE", 540, 290, 150, t, C.s4_watch - 0.1, { lime: true, color: LIME, out: C.s4_three - 0.3 });
  // the flood of notes ("not fifty")
  const fl = win(C.s4_not - 0.1, C.s4_not + 0.6, t), away = win(C.s4_three2 - 0.1, C.s4_three2 + 0.55, t);
  if (fl > 0 && away < 1) {
    const r = rnd(42);
    for (let i = 0; i < 46; i++) {
      const tx = 60 + r() * 960, ty = 330 + r() * 1100, rot = (r() - 0.5) * 50, d = r() * 0.5;
      const p = spring(win(C.s4_not - 0.1 + d, C.s4_not + 0.4 + d, t));
      const ang = Math.atan2(ty - 900, tx - 540), fly = inCubic(away) * 1400;
      const col = ["#ffe45c", "#ffd23f", "#fff07a", "#ffc94d"][i % 4];
      sticky(g, "", tx + Math.cos(ang) * fly, ty + Math.sin(ang) * fly, rot + fly * 0.05, p, { w: 170, h: 155, col });
    }
  }
  NOTES.forEach(([s, x, y, rot], i) => sticky(g, s, x, y, rot, spring(win(C.s4_three - 0.05 + i * 0.22, C.s4_three + 0.5 + i * 0.22, t))));
  title(g, "THREE NOTES", 540, 290, 150, t, C.s4_three - 0.05, { lime: true, color: LIME, out: C.s4_not - 0.4 });
  if (fl > 0 && away < 1) {
    title(g, "NOT 50", 540, 290, 170, t, C.s4_fifty - 0.1, { color: "#ff5a4a", glow: "rgba(255,80,60,0.6)", out: C.s4_three2 - 0.15 });
  }
  title(g, "JUST 3.", 540, 290, 190, t, C.s4_three2 - 0.05, { lime: true, color: LIME });
}

// ---------------------------------------------------------------- step 5: export + keep --
function sStep5a(g, t) {
  const D = { x: 90, y: 420, w: 900, h: 640 };
  const op = spring(win(C.s5 + 1.05, C.s5 + 1.6, t));
  g.save(); g.translate(540, 740); g.scale(0.8 + 0.2 * op, 0.8 + 0.2 * op); g.translate(-540, -740); g.globalAlpha *= clamp(op * 2);
  const r = win95(g, D.x, D.y, D.w, D.h, "Export");
  g.fillStyle = "#000"; g.fillRect(r.x + 20, r.y + 20, 240, 426);
  draft(g, r.x + 20, r.y + 20, 240, 426, t, { r: 4, caption: false });
  g.font = `600 30px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "left"; g.textBaseline = "middle";
  [["File name:", "first-vibe-edit.mp4"], ["Size:", "1080 × 1920"], ["Frame rate:", "30 fps"], ["Length:", "0:30"]].forEach(([k, v], i) => {
    const y = r.y + 60 + i * 92;
    g.fillStyle = "#000"; g.font = `600 28px "${UI}"`; g.fillText(k, r.x + 290, y);
    bevel(g, r.x + 290, y + 22, r.w - 320, 46, true); g.fillStyle = "#fff"; g.fillRect(r.x + 292, y + 24, r.w - 324, 42);
    g.fillStyle = "#000"; g.font = `500 26px "${UI}"`; g.fillText(v, r.x + 304, y + 46);
  });
  // export button + progress
  const bx = r.x + r.w - 230, by = r.y + r.h - 86;
  const pressed = t > C.s5_export && t < C.s5_export + 0.15;
  bevel(g, bx, by, 210, 64, pressed);
  g.font = `700 30px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "center"; g.fillText("Export", bx + 105, by + 33);
  const xp = win(C.s5_export + 0.1, C.s5_keep - 0.05, t);
  bevel(g, r.x + 20, by + 8, r.w - 280, 48, true);
  g.fillStyle = NAVY1; const segs = Math.floor(xp * 22);
  for (let i = 0; i < segs; i++) g.fillRect(r.x + 26 + i * ((r.w - 292) / 22), by + 14, (r.w - 292) / 22 - 4, 36);
  if (xp >= 1) { g.fillStyle = "#000"; g.font = `700 26px "${UI}"`; g.textAlign = "left"; g.fillText("Done ✓", r.x + 30, by - 20); }
  g.restore();
  clickRing(g, bx + 105, by + 32, t, C.s5_export);
  // "project saved" toast
  const sp = spring(win(C.s5_keep, C.s5_keep + 0.6, t));
  if (sp > 0) {
    g.save(); g.translate(540, 1260); g.scale(sp, sp);
    const rr = win95(g, -400, -110, 800, 220, "Save project");
    folderIcon(g, rr.x + 20, rr.y + 16, 90, true);
    g.font = `700 32px "${UI}"`; g.fillStyle = "#000"; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText("my-first-vibe-edit/", rr.x + 130, rr.y + 42);
    g.font = `600 28px "${UI}"`; g.fillStyle = t > C.s5_project ? "#0b6b2a" : "#444";
    g.fillText(t > C.s5_project ? "✓  Project saved. Brief + code + clips." : "Saving…", rr.x + 130, rr.y + 92);
    g.restore();
  }
  title(g, "EXPORT", 540, 290, 170, t, C.s5_export - 0.1, { lime: true, color: LIME, out: C.s5_keep - 0.2 });
  title(g, "KEEP THE PROJECT", 540, 290, 150, t, C.s5_keep - 0.05, { lime: true, color: LIME });
}
// prints hung on a string with clothespins, against a real sky
function clothespin(g, x, y) {
  g.save(); g.translate(x, y);
  g.shadowColor = "rgba(0,0,0,0.3)"; g.shadowBlur = 8; g.shadowOffsetY = 4;
  const gr = g.createLinearGradient(-14, 0, 14, 0); gr.addColorStop(0, "#c89a63"); gr.addColorStop(0.5, "#e7c393"); gr.addColorStop(1, "#b98a55");
  g.fillStyle = gr; K.rr(g, -15, -42, 30, 90, 6); g.fill(); K.noShadow(g);
  g.fillStyle = "#9aa0a6"; g.fillRect(-17, -6, 34, 9);
  g.strokeStyle = "rgba(80,50,20,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -40); g.lineTo(0, 46); g.stroke();
  g.restore();
}
function stringY(x) { return 330 + 60 * Math.pow((x - 540) / 600, 2); }
function print(g, x, at, t, name, o = {}) {
  const p = outQuint(win(at, at + 0.55, t)); if (p <= 0) return;
  const y0 = stringY(x), w = o.w || 230, h = o.h || 330;
  const sw = Math.sin(t * 2.1 + x * 0.01) * 2.2 + (1 - p) * 18;
  g.save(); g.translate(x, lerp(-500, y0, p)); g.rotate(sw * Math.PI / 180);
  g.shadowColor = "rgba(0,20,40,0.35)"; g.shadowBlur = 24; g.shadowOffsetY = 14;
  g.fillStyle = "#fbfbf7"; g.fillRect(-w / 2, 10, w, h); K.noShadow(g);
  foot(g, name, -w / 2 + 14, 24, w - 28, h - 90, t, { fx: o.fx });
  if (o.label) { g.font = `700 26px "${UI}"`; g.fillStyle = "#222"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(o.label, 0, h - 22); }
  clothespin(g, 0, 18);
  g.restore();
}
function sStep5b(g, t) {
  foot(g, "cw_sky", 0, 0, W, H, t, { fx: 0.5, filter: "saturate(1.05)" });
  const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(1, "rgba(0,20,30,0.35)");
  g.fillStyle = sg; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#6d5a42"; g.lineWidth = 4; g.beginPath();
  for (let x = -20; x <= W + 20; x += 20) (x === -20 ? g.moveTo(x, stringY(x)) : g.lineTo(x, stringY(x)));
  g.stroke();
  const at = C.s5_next - 1.0;
  print(g, 180, at, t, "fs_walk", { label: "walk.mp4", fx: 0.55 });
  print(g, 430, at + 0.1, t, "fs_waves", { label: "waves.mp4" });
  print(g, 680, at + 0.2, t, "fs_field", { label: "field.mp4", fx: 0.45 });
  print(g, 920, C.s5_brief + 0.35, t, "ff_coffee", { label: "coffee.mp4 ✦" });
  // the brief bar: only this changes
  const bx = 70, by = 1170, bw = 940, bh = 150;
  g.save(); g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 40; g.shadowOffsetY = 18;
  g.fillStyle = "rgba(14,18,16,0.88)"; K.rr(g, bx, by, bw, bh, 30); g.fill(); K.noShadow(g);
  g.font = `700 24px "${UI}"`; g.fillStyle = LIME; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("BRIEF", bx + 30, by + 34);
  const OLD = "Make a 30-second vertical reel from these clips…", NEW = "A 15-second reel about my morning coffee.";
  const sel = win(C.s5_change - 0.1, C.s5_change + 0.35, t), typeAt = C.s5_change + 0.4;
  g.font = `500 36px "${UI}"`; g.textBaseline = "middle";
  if (t < typeAt) {
    const tw = g.measureText(OLD).width;
    if (sel > 0) { g.fillStyle = LIME; g.fillRect(bx + 26, by + 74, (tw + 8) * outCubic(sel), 54); }
    g.fillStyle = sel > 0.5 ? INK : "#e8ece9"; g.fillText(OLD, bx + 30, by + 102);
  } else {
    const s = K.typed(NEW, t, typeAt, 48);
    g.fillStyle = "#f4f7f2"; g.fillText(s, bx + 30, by + 102);
    if (Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = LIME; g.fillRect(bx + 34 + g.measureText(s).width, by + 80, 4, 44); }
  }
  g.restore();
  title(g, "NEXT TIME", 540, 900, 120, t, C.s5_next - 0.05, {});
  title(g, "ONLY CHANGE THE BRIEF", 540, 1060, 118, t, C.s5_change - 0.15, { lime: true, color: LIME });
}

// ---------------------------------------------------------------- outro --
function docIcon(g, x, y, s) {
  g.save(); g.translate(x, y);
  g.shadowColor = "rgba(0,10,5,0.55)"; g.shadowBlur = 40; g.shadowOffsetY = 20;
  g.fillStyle = "#fff"; g.beginPath(); g.moveTo(-s * 0.4, -s * 0.5); g.lineTo(s * 0.22, -s * 0.5); g.lineTo(s * 0.4, -s * 0.32); g.lineTo(s * 0.4, s * 0.5); g.lineTo(-s * 0.4, s * 0.5); g.closePath(); g.fill();
  K.noShadow(g);
  g.fillStyle = "#cfd3d6"; g.beginPath(); g.moveTo(s * 0.22, -s * 0.5); g.lineTo(s * 0.22, -s * 0.32); g.lineTo(s * 0.4, -s * 0.32); g.fill();
  g.restore();
}
function sOutro1(g, t) {
  const p = spring(win(C.o_want - 0.1, C.o_want + 0.6, t));
  g.save(); g.translate(540, 900); g.rotate(-3 * Math.PI / 180); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p); g.globalAlpha *= clamp(p * 2);
  const r = win95(g, -400, -330, 800, 660, "brief-template.txt - Notepad");
  g.fillStyle = "#fff"; g.fillRect(r.x + 6, r.y + 6, r.w - 12, r.h - 12);
  g.font = `600 34px "${MONO}"`; g.fillStyle = "#111"; g.textAlign = "left"; g.textBaseline = "top";
  const lines = ["PLATFORM: ____________", "LENGTH:   ____ seconds", "MOOD:     ____, ____", "ENDING:   ____________", "", "RULES:    real footage only"];
  lines.forEach((l, i) => { if (t > C.o_want + 0.05 * i) g.fillText(l, r.x + 30, r.y + 30 + i * 70); });
  g.restore();
  title(g, "WANT MY", 540, 290, 140, t, C.o_want - 0.05, {});
  title(g, "BRIEF TEMPLATE?", 540, 450, 150, t, C.o_template - 0.15, { lime: true, color: LIME });
}
function phoneUI(g, w, h, t) {
  // a generic short-video app: the reel on top, a comment sheet below
  g.save(); g.translate(-w / 2, -h / 2);
  draft(g, 0, 0, w, h * 0.56, t, { r: 0, caption: false });
  const sy = h * 0.5;
  g.fillStyle = "#16181a"; K.rr(g, 0, sy, w, h - sy, 26); g.fill();
  g.fillStyle = "#3a3d40"; K.rr(g, w / 2 - 30, sy + 12, 60, 7, 4); g.fill();
  const fs = w * 0.052;
  g.font = `700 ${fs}px "${UI}"`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("Comments", w / 2, sy + fs * 1.6);
  const rows = [["#e07a5f", "M", "this is so clean 😮"], ["#81b29a", "A", "how long did it take??"]];
  const posted = t > C.o_vibe + 0.55;
  if (posted) rows.push([LIME, "Y", "VIBE 🔥"]);
  rows.forEach(([col, ini, s], i) => {
    const y = sy + fs * 3.6 + i * fs * 2.4, pp = i === 2 ? spring(win(C.o_vibe + 0.55, C.o_vibe + 1.0, t)) : 1;
    g.save(); g.globalAlpha *= clamp(pp * 2); g.translate(0, (1 - clamp(pp)) * 30);
    g.fillStyle = col; g.beginPath(); g.arc(w * 0.1, y, fs * 0.8, 0, 7); g.fill();
    g.font = `800 ${fs * 0.8}px "${UI}"`; g.fillStyle = i === 2 ? INK : "#fff"; g.textAlign = "center"; g.fillText(ini, w * 0.1, y + 1);
    g.textAlign = "left"; g.font = `600 ${fs * 0.72}px "${UI}"`; g.fillStyle = "#9aa0a4"; g.fillText(i === 2 ? "you · now" : ["mira", "ari"][i] + " · 2h", w * 0.19, y - fs * 0.55);
    g.font = `${i === 2 ? 800 : 500} ${fs * 0.9}px "${UI}", ${EMOJI}`; g.fillStyle = "#fff"; g.fillText(s, w * 0.19, y + fs * 0.5);
    g.restore();
  });
  // input
  const iy = h - fs * 2.6;
  g.fillStyle = "#26292c"; K.rr(g, w * 0.05, iy - fs, w * 0.72, fs * 2, fs); g.fill();
  const typed = posted ? "" : K.typed("VIBE", t, C.o_comment + 0.15, 9);
  g.font = `${typed ? 800 : 500} ${fs}px "${UI}"`; g.fillStyle = typed ? "#fff" : "#7c8286"; g.textAlign = "left";
  g.fillText(typed || "Add a comment…", w * 0.1, iy + 1);
  if (!posted && t > C.o_comment && Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = LIME; g.fillRect(w * 0.1 + g.measureText(typed).width + 4, iy - fs * 0.55, 3, fs * 1.1); }
  g.fillStyle = typed ? LIME : "#3a3d40"; g.beginPath(); g.arc(w * 0.88, iy, fs * 0.95, 0, 7); g.fill();
  g.strokeStyle = typed ? INK : "#888"; g.lineWidth = fs * 0.14; g.beginPath();
  g.moveTo(w * 0.88, iy + fs * 0.45); g.lineTo(w * 0.88, iy - fs * 0.45); g.moveTo(w * 0.88 - fs * 0.35, iy - fs * 0.1); g.lineTo(w * 0.88, iy - fs * 0.47); g.lineTo(w * 0.88 + fs * 0.35, iy - fs * 0.1); g.stroke();
  g.restore();
}
function sOutro2(g, t) {
  const j = inOutCubic(win(C.o_join - 0.2, C.o_join + 0.45, t));
  const px = 540, py = lerp(975, 1120, j), pw = lerp(940, 760, j);
  // phone: the cut-out is photographed at an angle, so turn it upright (+34.6°) with a small tilt
  object(g, "phone", px, py, pw, 34.6 - 4 + Math.sin(t * 1.3) * 0.8, { portrait: true, screen: (g2, w, h) => phoneUI(g2, w, h, t) });
  clickRing(g, px + 0.30 * pw * 0.48, py + 0.32 * pw * 0.93, t, C.o_vibe + 0.4);
  title(g, "COMMENT", 540, 280, 150, t, C.o_comment - 0.1, { out: C.o_join - 0.5 });
  title(g, "“VIBE”", 540, 455, 170, t, C.o_vibe - 0.1, { lime: true, color: LIME, out: C.o_join - 0.5 });
  title(g, "JOIN", 540, 330, 200, t, C.o_join - 0.05, {});
  title(g, "VIBE EDITING", 540, 520, 190, t, C.o_vibe2 - 0.05, { lime: true, color: LIME });
  pill(g, "we'll send you the brief template 🔥", 540, 650, t, C.o_editing + 0.2, { size: 34 });
}

// ================================================================== timeline ==
// enter: how each scene arrives. "whipL"/"whipU" slide along the mat, "zoom" zooms through a
// focal point of the previous scene, "marker" overlays the previous scene.
const SC = [];
const add = (t0, draw, enter, o = {}) => SC.push({ t0, draw, enter, ...o });
add(0, sHook1, null);
add(C.h_under - 0.18, sHook2, "zoom", { focal: [540, 900], d: 0.42 });
add(C.h_no1 - 0.2, sHook3, "whipL", { d: 0.4 });
add(C.s1 - 0.18, marker(1, sHook3), "marker");
add(C.s1_put - 0.3, sStep1, "zoom", { focal: [540, 1130], d: 0.45 });
add(C.s2 - 0.18, marker(2, sStep1), "marker");
add(C.s2_open - 0.32, sStep2a, "zoom", { focal: [540, 1130], d: 0.45 });
add(C.s2_folder - 0.2, sStep2b, "zoom", { focal: [520, 800], d: 0.45 });
add(C.s3 - 0.18, marker(3, sStep2b), "marker");
add(C.s3_let - 0.3, sStep3, "zoom", { focal: [540, 1130], d: 0.45 });
add(C.s4 - 0.18, marker(4, sStep3), "marker");
add(C.s4_watch - 0.35, sStep4, "zoom", { focal: [540, 1130], d: 0.45 });
add(C.s5 - 0.18, marker(5, sStep4), "marker");
add(C.s5_export - 0.4, sStep5a, "zoom", { focal: [540, 1130], d: 0.45 });
add(C.s5_next - 0.3, sStep5b, "whipU", { d: 0.45 });
add(C.o_want - 0.25, sOutro1, "whipL", { d: 0.42 });
add(C.o_comment - 0.3, sOutro2, "whipU", { d: 0.45 });

// mat offset: each whip moves the camera one screen along the mat
function matAt(t) {
  let ox = 0, oy = 0;
  for (const s of SC) {
    if (s.enter !== "whipL" && s.enter !== "whipU") continue;
    const e = inOutQuint(win(s.t0, s.t0 + s.d, t));
    if (s.enter === "whipL") ox += W * e; else oy += H * e;
  }
  return [ox, oy];
}
SC.forEach((s) => { s.mat = matAt(s.t0 + (s.d || 0)); });

function drawScene(i, g, t) { const s = SC[i]; g.save(); s.draw(g, t, s); g.restore(); }

function frame(g, t) {
  let i = 0; while (i < SC.length - 1 && t >= SC[i + 1].t0) i++;
  const s = SC[i], [ox, oy] = matAt(t);
  let moving = false, speed = 0;
  const intro = 1 - outQuint(win(0, 0.9, t));
  if (s.enter && s.enter !== "marker" && t < s.t0 + s.d) {
    const p = (t - s.t0) / s.d, e = inOutQuint(p);
    moving = p > 0.03 && p < 0.97; speed = Math.sin(Math.PI * p);
    if (s.enter === "zoom") {
      drawMat(g, ox, oy, 1 + 0.35 * Math.sin(Math.PI * p));
      const [fx, fy] = s.focal, zo = 1 + 2.6 * e * e;
      g.save(); g.globalAlpha = 1 - clamp(e * 1.5);
      g.translate(fx, fy); g.scale(zo, zo); g.translate(-fx, -fy); drawScene(i - 1, g, t); g.restore();
      g.save(); g.globalAlpha = clamp(e * 1.6 - 0.15); const zi = 0.62 + 0.38 * outCubic(p);
      g.translate(540, 900); g.scale(zi, zi); g.translate(-540, -900); drawScene(i, g, t); g.restore();
    } else {
      drawMat(g, ox, oy);
      const dx = s.enter === "whipL" ? W : 0, dy = s.enter === "whipU" ? H : 0;
      g.save(); g.translate(-dx * e, -dy * e); drawScene(i - 1, g, t); g.restore();
      g.save(); g.translate(dx * (1 - e), dy * (1 - e)); drawScene(i, g, t); g.restore();
    }
  } else {
    if (intro > 0) { g.save(); g.translate(540, 900); g.scale(1 + 0.12 * intro, 1 + 0.12 * intro); g.translate(-540, -900); }
    drawMat(g, ox, oy);
    drawScene(i, g, t);
    if (intro > 0) g.restore();
    if (intro > 0.03) { moving = true; speed = intro * 0.5; }
  }
  // lens: vignette + grain, then captions
  const vg = g.createRadialGradient(540, 900, 500, 540, 900, 1300);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,12,6,0.5)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  K.grain(g, t, 0.05);
  K.captions(g, t, { y: 1540, size: 38, weight: 600, family: UI, color: "#fff", hi: LIME, hiText: INK, box: "rgba(0,0,0,0.55)", boxPad: 22, maxW: 860 });
  return { moving, speed };
}

K.run(frame, ["400 40px Anton", "400 40px 'Bebas Neue'", "500 40px 'Inter Var'", "700 40px 'Inter Var'", "800 40px 'Inter Var'",
  "700 40px Caveat", "500 30px Mono", "40px 'Noto Color Emoji'"]);
})();

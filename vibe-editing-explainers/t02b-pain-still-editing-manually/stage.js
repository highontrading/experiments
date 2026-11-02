// T02B · "Still editing reels manually?"
// Medical-history-doc design: sky over a meadow with huge extruded words, grid paper with
// window light, B&W photo cards, red torn tags, a corridor of labelled doors, a red desk with a
// clipboard, a chalkboard graph, and a search bar at the end. One scene per beat; scenes hand
// over with whips, a flash, a door reveal and an iris.
(function () {
const C = K.C, W = K.W, H = K.H;
const { clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring, rr, font } = K;

const RED = "#e3262f", RED_D = "#7d0d14", INK = "#171717", PAPER = "#ece9e2", YEL = "#ffe24a", GREEN = "#3dff74";

// ------------------------------------------------------------------ cached textures --
const rnd = K.rnd(7);
function noiseCanvas(w, h, base, amt, seed) {
  const c = K.makeCanvas(w, h), x = c.getContext("2d"), r = K.rnd(seed);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  const id = x.getImageData(0, 0, w, h), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  x.putImageData(id, 0, 0);
  return c;
}
// grid paper, like the reference's light grey squared sheets
const GRID = (() => {
  const c = noiseCanvas(W, H, PAPER, 10, 3), x = c.getContext("2d");
  x.lineWidth = 1.4; x.strokeStyle = "rgba(120,130,150,0.20)";
  x.beginPath();
  for (let i = 0; i <= W; i += 48) { x.moveTo(i, 0); x.lineTo(i, H); }
  for (let j = 0; j <= H; j += 48) { x.moveTo(0, j); x.lineTo(W, j); }
  x.stroke();
  x.lineWidth = 2.2; x.strokeStyle = "rgba(110,120,145,0.26)";
  x.beginPath();
  for (let i = 0; i <= W; i += 240) { x.moveTo(i, 0); x.lineTo(i, H); }
  for (let j = 0; j <= H; j += 240) { x.moveTo(0, j); x.lineTo(W, j); }
  x.stroke();
  return c;
})();
const REDDESK = (() => {
  const c = noiseCanvas(W, H, "#a8141c", 26, 11), x = c.getContext("2d");
  const r = K.rnd(4);
  for (let i = 0; i < 160; i++) {  // fine fibres
    x.strokeStyle = `rgba(${r() < 0.5 ? "60,0,0" : "255,120,120"},${0.05 + r() * 0.06})`; x.lineWidth = 1 + r() * 2;
    const y = r() * H; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(W * 0.3, y + (r() - 0.5) * 40, W * 0.6, y + (r() - 0.5) * 40, W, y + (r() - 0.5) * 30); x.stroke();
  }
  return c;
})();
const CHALK = (() => {
  const c = noiseCanvas(W, H, "#1d2621", 22, 21), x = c.getContext("2d"), r = K.rnd(9);
  for (let i = 0; i < 90; i++) {  // old chalk smudges
    const cx = r() * W, cy = r() * H, rad = 60 + r() * 220;
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    gr.addColorStop(0, `rgba(230,240,230,${0.02 + r() * 0.035})`); gr.addColorStop(1, "rgba(230,240,230,0)");
    x.fillStyle = gr; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }
  // wooden frame
  const fw = 34;
  x.fillStyle = "#6b4426"; x.fillRect(0, 0, W, fw); x.fillRect(0, H - fw, W, fw); x.fillRect(0, 0, fw, H); x.fillRect(W - fw, 0, fw, H);
  x.strokeStyle = "rgba(0,0,0,0.35)"; x.lineWidth = 4; x.strokeRect(fw, fw, W - fw * 2, H - fw * 2);
  return c;
})();

// window light falling across paper (the reference's soft window shadows)
function windowLight(g, t, a = 1) {
  g.save();
  g.globalAlpha = 0.5 * a;
  const sh = 40 * Math.sin(t * 0.25);
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, "rgba(255,248,230,0.55)"); lg.addColorStop(0.6, "rgba(255,248,230,0.0)");
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = "rgba(70,80,95,0.16)";
  for (const [x0, w] of [[-180, 70], [260, 60], [700, 70]]) {   // window bars, slanted
    g.beginPath();
    g.moveTo(x0 + sh, 0); g.lineTo(x0 + w + sh, 0); g.lineTo(x0 + w + 520 + sh, H); g.lineTo(x0 + 520 + sh, H); g.closePath(); g.fill();
  }
  g.fillRect(0, 980 + sh, W, 60);
  g.restore();
}

// ------------------------------------------------------------------ type helpers --
function fitSize(g, text, maxW, cap, fam = "Archivo Black", weight = 400) {
  font(g, 100, weight, fam);
  return Math.min(cap, (maxW / g.measureText(text).width) * 100);
}
// extruded display type: stacked side layers, then the face
function ext(g, text, x, y, size, o = {}) {
  const depth = o.depth ?? Math.max(4, size * 0.07);
  font(g, size, o.weight || 400, o.fam || "Archivo Black");
  g.textAlign = o.align || "center"; g.textBaseline = "middle";
  if (g.letterSpacing !== undefined) g.letterSpacing = `${-size * 0.01}px`;
  g.save();
  g.shadowColor = o.shadow || "rgba(0,0,0,0.35)"; g.shadowBlur = size * 0.18; g.shadowOffsetY = size * 0.08;
  g.fillStyle = o.side || "#8d939b";
  g.fillText(text, x + depth * 0.55, y + depth);
  g.restore();
  g.fillStyle = o.side || "#8d939b";
  for (let i = depth; i > 0; i -= 1.5) g.fillText(text, x + i * 0.55, y + i);
  const lg = g.createLinearGradient(0, y - size * 0.5, 0, y + size * 0.5);
  lg.addColorStop(0, o.top || o.face || "#fff"); lg.addColorStop(1, o.face || "#fff");
  g.fillStyle = lg;
  g.fillText(text, x, y);
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
}
// red torn tag with white caps (the reference's name labels)
function tag(g, text, x, y, size, o = {}) {
  font(g, size, 800, "Inter Var");
  if (g.letterSpacing !== undefined) g.letterSpacing = `${size * 0.06}px`;
  const tw = g.measureText(text).width, padX = size * 0.6, h = size * 1.75, w = tw + padX * 2;
  const r = K.rnd(o.seed || 5);
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
  const s = o.scale ?? 1; g.scale(s, s);
  K.shadow(g, 14, 6, 0.3);
  g.fillStyle = o.bg || RED;
  g.beginPath();
  g.moveTo(-w / 2, -h / 2);
  for (let i = 1; i <= 8; i++) g.lineTo(-w / 2 + (w * i) / 8, -h / 2 + (r() - 0.5) * 5);
  for (let i = 1; i <= 5; i++) g.lineTo(w / 2 + (r() - 0.5) * 9, -h / 2 + (h * i) / 5);
  for (let i = 7; i >= 0; i--) g.lineTo(-w / 2 + (w * i) / 8, h / 2 + (r() - 0.5) * 5);
  for (let i = 4; i >= 1; i--) g.lineTo(-w / 2 + (r() - 0.5) * 9, -h / 2 + (h * i) / 5);
  g.closePath(); g.fill();
  K.noShadow(g);
  g.fillStyle = o.fg || "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, 0, size * 0.04);
  g.restore();
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
}
function serif(g, text, x, y, size, o = {}) {
  font(g, size, o.weight || 400, "Instrument Serif");
  g.font = `italic ${size}px "Instrument Serif"`;
  g.textAlign = o.align || "center"; g.textBaseline = "middle";
  if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = 12; g.shadowOffsetY = 3; }
  g.fillStyle = o.color || INK;
  g.fillText(text, x, y);
  K.noShadow(g);
}
// photo card with a white border and two strips of tape
function photo(g, draw, x, y, w, h, rot, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180);
  const b = o.border ?? 18;
  K.shadow(g, 30, 16, 0.32);
  g.fillStyle = o.paper || "#f6f3ec"; g.fillRect(-w / 2 - b, -h / 2 - b, w + b * 2, h + b * 2 + (o.bottom || 0));
  K.noShadow(g);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip();
  draw(g, -w / 2, -h / 2, w, h);
  g.restore();
  if (o.tape !== false) {
    g.fillStyle = "rgba(235,228,205,0.82)";
    for (const sx of [-1, 1]) { g.save(); g.translate(sx * (w / 2 - 10), -h / 2 - b + 4); g.rotate(sx * 0.6); g.fillRect(-48, -16, 96, 32); g.restore(); }
  }
  if (o.label) {
    font(g, 26, 600, "Mono"); g.fillStyle = "#333"; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(o.label, -w / 2, h / 2 + b + (o.bottom || 0) / 2);
  }
  g.restore();
}
function vid(g, name, lt, x, y, w, h, o = {}) {
  const im = K.footage(name, lt * (o.speed || 1) + (o.ss || 0), 1, o.loop ?? true);
  if (!im) return;
  if (o.filter) g.filter = o.filter;
  K.drawFit(g, im, x, y, w, h, o);
  g.filter = "none";
}
function vignette(g, a = 0.45) {
  const vg = g.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.5, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
const ease01 = (a, b, t) => outCubic(win(a, b, t));

// ------------------------------------------------------------------ scenes --
// Each scene draws the full frame; `lt` is time since the scene began, `t` the film clock.
const S = {};

// HOOK: the question slams in, word by word, over a bright sky and meadow
const HOOK_WORDS = [
  { w: "STILL", at: C.h_still, y: 470 },
  { w: "EDITING", at: C.h_editing, y: 690 },
  { w: "REELS", at: C.h_reels, y: 910 },
  { w: "MANUALLY?", at: C.h_manually, y: 1150, red: true },
];
S.hook = (g, lt, t) => {
  vid(g, "cw_meadow", lt, 0, 0, W, H, { ss: 2, filter: "brightness(1.05) saturate(1.1)", fy: 0.55 });
  const dark = g.createLinearGradient(0, 0, 0, H);
  dark.addColorStop(0, "rgba(10,20,40,0.18)"); dark.addColorStop(0.7, "rgba(0,0,0,0)"); dark.addColorStop(1, "rgba(0,0,0,0.35)");
  g.fillStyle = dark; g.fillRect(0, 0, W, H);
  // camera shake on every slam
  let sx = 0, sy = 0;
  for (const h of HOOK_WORDS) { const k = 1 - win(h.at, h.at + 0.28, t); if (t > h.at && k > 0) { sx += Math.sin(t * 90 + h.y) * 16 * k * k; sy += Math.cos(t * 77) * 12 * k * k; } }
  g.save(); g.translate(sx, sy);
  for (const h of HOOK_WORDS) {
    const p = outExpo(win(h.at - 0.03, h.at + 0.2, t));
    if (p <= 0) continue;
    const size = fitSize(g, h.w, h.red ? 980 : 900, h.red ? 210 : 250);
    const drift = (t - h.at) * (h.red ? -10 : 14);
    g.save();
    g.translate(W / 2 + drift, h.y);
    const s = lerp(2.3, 1, p); g.scale(s, s);
    g.globalAlpha = clamp(p * 2);
    ext(g, h.w, 0, 0, size, h.red ? { face: RED, top: "#ff4a50", side: RED_D, shadow: "rgba(60,0,0,0.5)" } : { face: "#ffffff", top: "#ffffff", side: "#8b939e" });
    g.restore();
  }
  // a red underline sweeps under MANUALLY?
  const u = outCubic(win(C.h_manually + 0.3, C.h_manually + 0.65, t));
  if (u > 0) { g.fillStyle = RED; rr(g, 120, 1268, 840 * u, 16, 8); g.fill(); }
  g.restore();
};

// HOURS: 3:00:00 counts up over grid paper; a chart line climbs; the reel itself on a card
S.hours = (g, lt, t) => {
  g.drawImage(GRID, 0, 0);
  windowLight(g, t);
  const p = ease01(C.three - 0.05, C.hours + 0.45, t);
  const secs = Math.round(p * 3 * 3600);
  const hh = Math.floor(secs / 3600), mm = Math.floor((secs % 3600) / 60), ss = secs % 60;
  const label = `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  tag(g, "TIME ON ONE REEL", W / 2, 268, 30, { rot: -2, scale: spring(win(C.s_hours, C.s_hours + 0.6, t)), seed: 2 });
  const tp = spring(win(C.s_hours + 0.05, C.s_hours + 0.7, t));
  g.save(); g.translate(W / 2, 470); g.scale(0.85 + 0.15 * tp, 0.85 + 0.15 * tp); g.globalAlpha = clamp(tp * 2);
  ext(g, label, 0, 0, 210, { face: INK, top: "#3a3a3a", side: "#9a9a9a", shadow: "rgba(0,0,0,0.25)" });
  g.restore();
  // chart card: hours climbing with every edit
  const cp = spring(win(C.s_hours + 0.15, C.s_hours + 0.85, t));
  photo(g, (g2, x, y, w, h) => {
    g2.fillStyle = "#1a1d1c"; g2.fillRect(x, y, w, h);
    g2.strokeStyle = "rgba(255,255,255,0.55)"; g2.lineWidth = 2;
    g2.beginPath(); g2.moveTo(x + 50, y + 30); g2.lineTo(x + 50, y + h - 50); g2.lineTo(x + w - 20, y + h - 50); g2.stroke();
    font(g2, 18, 500, "Mono"); g2.fillStyle = "rgba(255,255,255,0.7)"; g2.textAlign = "left"; g2.textBaseline = "middle";
    g2.fillText("hours", x + 58, y + 34); g2.fillText("edits →", x + w - 110, y + h - 26);
    for (let i = 1; i <= 3; i++) { const yy = y + h - 50 - i * (h - 90) / 3; g2.fillText(`${i}h`, x + 12, yy); g2.fillStyle = "rgba(255,255,255,0.12)"; g2.fillRect(x + 50, yy, w - 70, 1); g2.fillStyle = "rgba(255,255,255,0.7)"; }
    const lp = ease01(C.three, C.one_reel + 0.3, t);
    g2.strokeStyle = RED; g2.lineWidth = 6; g2.lineCap = "round"; g2.shadowColor = "rgba(227,38,47,0.6)"; g2.shadowBlur = 10;
    g2.beginPath();
    const N = 40;
    for (let i = 0; i <= N * lp; i++) {
      const u = i / N, xx = x + 50 + u * (w - 80), yy = y + h - 50 - (h - 100) * (Math.pow(u, 1.6) + 0.04 * Math.sin(u * 30));
      i ? g2.lineTo(xx, yy) : g2.moveTo(xx, yy);
    }
    g2.stroke(); K.noShadow(g2);
  }, 330 - 30 * (1 - cp), 900, 470, 380, -5 + 4 * (1 - cp), { label: "fig. 1 · hours per reel", bottom: 40 });
  // the reel: a B&W card, tagged ONE REEL
  const rp = spring(win(C.one_reel - 0.25, C.one_reel + 0.5, t));
  if (rp > 0) {
    g.save(); g.globalAlpha = clamp(rp * 2);
    photo(g, (g2, x, y, w, h) => {
      vid(g2, "tired", lt, x, y, w, h, { ss: 5.2, filter: "grayscale(1) contrast(1.15)" });
      g2.fillStyle = RED; g2.beginPath(); g2.arc(x + w / 2, y + h / 2, 44, 0, 7); g2.fill();
      g2.fillStyle = "#fff"; g2.beginPath(); g2.moveTo(x + w / 2 - 14, y + h / 2 - 22); g2.lineTo(x + w / 2 + 24, y + h / 2); g2.lineTo(x + w / 2 - 14, y + h / 2 + 22); g2.fill();
    }, 790, 1010 + 60 * (1 - rp), 300, 533, 6 - 10 * (1 - rp), { label: "reel_final_v7.mp4", bottom: 40 });
    g.restore();
    tag(g, "ONE REEL", 790, 1340, 34, { rot: 4, scale: spring(win(C.one_reel, C.one_reel + 0.5, t)), seed: 9 });
  }
};

// TRIM: razor clicks close every pause in the voice track, by hand
const TRIM_N = 7, TRIM_T0 = C.trimming + 0.12, TRIM_DT = 0.27;
const GAPS = [0.09, 0.2, 0.31, 0.43, 0.55, 0.68, 0.82];
S.trim = (g, lt, t) => {
  vid(g, "timeline", lt, 0, 0, W, H, { ss: 1, filter: "brightness(0.55) saturate(0.8)", fx: 0.45 });
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, W, H);
  const hp = spring(win(C.s_trim, C.s_trim + 0.6, t));
  g.save(); g.globalAlpha = clamp(hp * 2);
  ext(g, "TRIMMING", W / 2, 300, fitSize(g, "TRIMMING", 880, 190), { face: "#fff", side: "#7e8792" });
  g.restore();
  tag(g, "EVERY PAUSE · BY HAND", W / 2, 445, 32, { rot: -2, scale: spring(win(C.pause - 0.2, C.pause + 0.4, t)), seed: 13 });
  // the voice track panel
  const px = 70, py = 640, pw = 940, ph = 330;
  K.shadow(g, 40, 18, 0.5);
  g.fillStyle = "rgba(18,20,24,0.92)"; rr(g, px, py, pw, ph, 22); g.fill();
  K.noShadow(g);
  font(g, 24, 600, "Mono"); g.fillStyle = "rgba(255,255,255,0.6)"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("A1 · voice.wav", px + 28, py + 36);
  const done = Math.max(0, Math.min(TRIM_N, Math.floor((t - TRIM_T0) / TRIM_DT) + 1));
  g.textAlign = "right"; g.fillStyle = RED; g.fillText(`pauses trimmed: ${t < TRIM_T0 ? 0 : done}`, px + pw - 28, py + 36);
  // waveform: speech chunks separated by pauses; a clicked pause shrinks to nothing
  const wx0 = px + 28, ww = pw - 56, wy = py + 190;
  const gapW = GAPS.map((_, k) => 46 * (1 - outCubic(win(TRIM_T0 + k * TRIM_DT, TRIM_T0 + k * TRIM_DT + 0.18, t))));
  const speech = ww - 46 * GAPS.length;           // width of all speech when nothing is trimmed
  let x = wx0, seg = 0;
  const bounds = [0, ...GAPS, 1];
  const r = K.rnd(31);
  for (let s = 0; s < bounds.length - 1; s++) {
    const sw = speech * (bounds[s + 1] - bounds[s]);
    for (let bx = 0; bx < sw; bx += 9) {
      const amp = (0.25 + 0.75 * Math.abs(Math.sin(bx * 0.05 + s * 2.1) * Math.sin(bx * 0.013 + s))) * (0.7 + 0.3 * r());
      g.fillStyle = "rgba(120,220,255,0.92)"; g.fillRect(x + bx, wy - 90 * amp, 5, 180 * amp);
    }
    x += sw;
    if (s < GAPS.length) {
      const gw = gapW[s];
      if (gw > 1) {   // the pause: flat line, highlighted red while it waits to be cut
        g.fillStyle = "rgba(227,38,47,0.22)"; g.fillRect(x, wy - 100, gw, 200);
        g.fillStyle = "rgba(120,220,255,0.5)"; g.fillRect(x, wy - 2, gw, 4);
      }
      x += gw;
    }
  }
  // razor cursor travelling to each pause
  if (t > C.s_trim + 0.2) {
    const k = clamp(Math.floor((t - TRIM_T0 + 0.13) / TRIM_DT), 0, TRIM_N - 1);
    let gx = wx0; for (let s = 0; s <= k; s++) gx += speech * (bounds[s + 1] - bounds[s]) + (s < k ? gapW[s] : 0);
    const press = Math.max(0, 1 - Math.abs(t - (TRIM_T0 + k * TRIM_DT)) / 0.08);
    const cx = gx + gapW[k] / 2, cy = wy - 140 + press * 18;
    g.save(); g.translate(cx, cy);
    g.fillStyle = "#e9edf2"; K.shadow(g, 10, 4, 0.5);
    g.beginPath(); g.moveTo(-18, -54); g.lineTo(18, -54); g.lineTo(18, 0); g.lineTo(0, 24); g.lineTo(-18, 0); g.closePath(); g.fill();
    K.noShadow(g);
    g.fillStyle = "#7d8590"; g.fillRect(-6, -44, 12, 30);
    g.restore();
    if (press > 0) { g.strokeStyle = `rgba(227,38,47,${press})`; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, wy - 110); g.lineTo(cx, wy + 110); g.stroke(); }
  }
  // the editor's tiny progress, in serif
  serif(g, "pause by pause.", W / 2, 1110, 64, { color: "#f2f2f2", shadow: "rgba(0,0,0,0.6)" });
};

// TYPE: a caption field filling in, letter by letter
const CAPS = ["so today I want to show you", "how I edit my reels", "and why it takes me hours"];
S.type = (g, lt, t) => {
  g.drawImage(GRID, 0, 0);
  windowLight(g, t);
  const cp = spring(win(C.s_type, C.s_type + 0.7, t));
  // red-accent portrait card with the real typing hands
  g.save(); g.translate(0, 60 * (1 - cp)); g.globalAlpha = clamp(cp * 2);
  g.fillStyle = RED; g.save(); g.translate(W / 2, 520); g.rotate(-0.035); g.fillRect(-470, -280, 940, 560); g.restore();
  photo(g, (g2, x, y, w, h) => vid(g2, "typing", lt, x, y, w, h, { ss: 2 }), W / 2 + 14, 500, 860, 470, 1.5, { tape: true });
  g.restore();
  const hp = spring(win(C.typing - 0.15, C.typing + 0.45, t));
  g.save(); g.translate(W / 2, 880); g.scale(0.8 + 0.2 * hp, 0.8 + 0.2 * hp); g.globalAlpha = clamp(hp * 2);
  ext(g, "TYPING", 0, 0, 150, { face: RED, top: "#ff4a50", side: RED_D, shadow: "rgba(80,0,0,0.35)" });
  g.restore();
  if (t > C.typing + 0.1) serif(g, "every caption.", W / 2, 985, 66, { color: INK });
  // caption editor
  const ep = spring(win(C.typing, C.typing + 0.6, t));
  g.save(); g.translate(0, 80 * (1 - ep)); g.globalAlpha = clamp(ep * 2);
  K.shadow(g, 30, 14, 0.25);
  g.fillStyle = "#fff"; rr(g, 90, 1080, 900, 290, 24); g.fill();
  K.noShadow(g);
  g.strokeStyle = "rgba(0,0,0,0.1)"; g.lineWidth = 2; rr(g, 90, 1080, 900, 290, 24); g.stroke();
  const cps = 17, t0 = C.typing + 0.15;
  let n = Math.max(0, Math.floor((t - t0) * cps)), idx = 0;
  while (idx < CAPS.length - 1 && n > CAPS[idx].length + 6) { n -= CAPS[idx].length + 6; idx++; }
  const shown = CAPS[idx].slice(0, Math.min(CAPS[idx].length, n));
  font(g, 24, 600, "Mono"); g.fillStyle = "#8a8f98"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(`CAPTION ${12 + idx} / 64`, 130, 1125);
  g.textAlign = "right"; g.fillText(`00:00:${String(14 + idx * 3).padStart(2, "0")}:12`, 950, 1125);
  g.fillStyle = "#f1f2f4"; rr(g, 120, 1160, 840, 160, 14); g.fill();
  font(g, 46, 600, "Inter Var"); g.fillStyle = INK; g.textAlign = "left";
  g.fillText(shown, 150, 1240);
  if (Math.floor(t * 2.6) % 2 === 0) { g.fillStyle = RED; g.fillRect(150 + g.measureText(shown).width + 4, 1214, 4, 54); }
  g.restore();
};

// NUDGE: a cut moved one frame left, one frame right, again and again
const NUDGE_T0 = C.nudging + 0.12, NUDGE_DT = 0.34, NUDGE_N = Math.floor((C.s_then - 0.3 - NUDGE_T0) / NUDGE_DT) + 1;
function nudgeState(t) {
  const k = Math.floor((t - NUDGE_T0) / NUDGE_DT);
  if (t < NUDGE_T0) return { k: -1, f: 4, dir: 0 };
  const kk = Math.min(k, NUDGE_N - 1);
  return { k: kk, f: kk % 2 === 0 ? 5 : 4, dir: kk % 2 === 0 ? 1 : -1, press: Math.max(0, 1 - (t - NUDGE_T0 - kk * NUDGE_DT) / 0.14) };
}
S.nudge = (g, lt, t) => {
  g.fillStyle = "#121316"; g.fillRect(0, 0, W, H);
  const cp = spring(win(C.s_nudge, C.s_nudge + 0.7, t));
  // red backing + the tired editor's portrait, reference-style
  g.save(); g.translate(0, 70 * (1 - cp)); g.globalAlpha = clamp(cp * 2);
  g.fillStyle = RED; g.fillRect(150, 240, 780, 820);
  photo(g, (g2, x, y, w, h) => vid(g2, "tired", lt, x, y, w, h, { ss: 5.0, filter: "contrast(1.08) saturate(0.85)", fy: 0.25 }), W / 2 + 20, 640, 680, 760, -1.5, { tape: false, border: 14 });
  g.restore();
  tag(g, "FRAME BY FRAME", W / 2, 1100, 36, { rot: -2, scale: spring(win(C.frame1 - 0.2, C.frame1 + 0.4, t)), seed: 21 });
  // timecode widget with arrow keys
  const st = nudgeState(t);
  const wp = spring(win(C.nudging - 0.1, C.nudging + 0.5, t));
  g.save(); g.globalAlpha = clamp(wp * 2); g.translate(0, 40 * (1 - wp));
  g.fillStyle = "rgba(255,255,255,0.08)"; rr(g, 120, 1180, 840, 120, 60); g.fill();
  font(g, 64, 600, "Mono"); g.textAlign = "left"; g.textBaseline = "middle";
  g.fillStyle = "#e9ecef"; g.fillText("00:01:12:", 300, 1242);
  const fw = g.measureText("00:01:12:").width;
  g.fillStyle = st.k >= 0 && st.press > 0 ? RED : "#e9ecef";
  g.fillText(String(st.f).padStart(2, "0"), 300 + fw, 1242);
  for (const side of [-1, 1]) {   // ◀ ▶ keycaps
    const kx = side < 0 ? 190 : 890, pressed = st.dir === side ? st.press : 0;
    g.fillStyle = pressed > 0.05 ? RED : "#2b2e34"; rr(g, kx - 46, 1196 + pressed * 6, 92, 88, 16); g.fill();
    g.fillStyle = "#fff"; g.beginPath();
    g.moveTo(kx + side * 16, 1240 + pressed * 6); g.lineTo(kx - side * 12, 1222 + pressed * 6); g.lineTo(kx - side * 12, 1258 + pressed * 6); g.fill();
  }
  // filmstrip with the playhead jumping one frame
  const fx0 = 120, fy0 = 1330, fwid = 840, fh = 90, nF = 9, cell = fwid / nF;
  for (let i = 0; i < nF; i++) {
    g.save(); rr(g, fx0 + i * cell + 3, fy0, cell - 6, fh, 6); g.clip();
    vid(g, "timeline", 0, fx0 + i * cell + 3, fy0, cell - 6, fh, { ss: 2 + i * 0.4, loop: false, filter: "brightness(0.8)" });
    g.restore();
  }
  const ph = fx0 + cell * (4.5 + (st.f === 5 ? 1 : 0));
  g.fillStyle = RED; g.fillRect(ph - 3, fy0 - 16, 6, fh + 32);
  g.beginPath(); g.moveTo(ph - 14, fy0 - 16); g.lineTo(ph + 14, fy0 - 16); g.lineTo(ph, fy0); g.fill();
  g.restore();
};

// THEN: a corridor of labelled doors; we walk past MANUAL EDITING to VIBE EDITING, which opens
const DOOR_W = 330, DOOR_H = 640, DOOR_Y = 1360;   // door bottom y on screen
const VIBE_DOOR_SCREEN = { x: W / 2 - DOOR_W / 2, y: DOOR_Y - DOOR_H, w: DOOR_W, h: DOOR_H };
function door(g, cx, label, open, inside) {
  const x = cx - DOOR_W / 2, y = DOOR_Y - DOOR_H;
  // frame
  g.fillStyle = "#5a3018"; g.fillRect(x - 22, y - 22, DOOR_W + 44, DOOR_H + 22);
  // the room behind (visible when open)
  g.save(); g.beginPath(); g.rect(x, y, DOOR_W, DOOR_H); g.clip();
  if (inside) inside(g, x, y, DOOR_W, DOOR_H); else { g.fillStyle = "#222"; g.fillRect(x, y, DOOR_W, DOOR_H); }
  g.restore();
  // leaf, hinged on the left, swinging open
  const lw = DOOR_W * (1 - 0.86 * open);
  const lg = g.createLinearGradient(x, 0, x + lw, 0);
  lg.addColorStop(0, "#8a4422"); lg.addColorStop(1, open > 0.02 ? "#5e2c14" : "#7a3b1d");
  g.fillStyle = lg; g.fillRect(x, y, lw, DOOR_H);
  g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 4;
  g.strokeRect(x + lw * 0.13, y + 50, lw * 0.74, 230); g.strokeRect(x + lw * 0.13, y + 330, lw * 0.74, 260);
  g.fillStyle = "#d9b45a"; g.beginPath(); g.arc(x + lw - 34 * (1 - open * 0.7), y + 340, 11, 0, 7); g.fill();
  // plaque
  font(g, 38, 800, "Inter Var");
  const tw = g.measureText(label).width + 56;
  K.shadow(g, 8, 3, 0.25); g.fillStyle = "#f7f7f5"; g.fillRect(cx - tw / 2, y - 112, tw, 70); K.noShadow(g);
  g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2; g.strokeRect(cx - tw / 2, y - 112, tw, 70);
  g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, cx, y - 76);
}
const worldXOf = (t) => lerp(0, 760, inOutCubic(win(C.then - 0.1, C.something + 0.1, t)));   // pan door 1 -> door 2
S.then = (g, lt, t) => {
  const worldX = worldXOf(t);
  // wall + floor
  const wg = g.createLinearGradient(0, 0, 0, DOOR_Y);
  wg.addColorStop(0, "#c5ced6"); wg.addColorStop(1, "#aeb8c1"); g.fillStyle = wg; g.fillRect(0, 0, W, DOOR_Y);
  const fg = g.createLinearGradient(0, DOOR_Y, 0, H);
  fg.addColorStop(0, "#7f8992"); fg.addColorStop(1, "#4b535a"); g.fillStyle = fg; g.fillRect(0, DOOR_Y, W, H - DOOR_Y);
  g.fillStyle = "#e7ebee"; g.fillRect(0, DOOR_Y - 26, W, 26);   // skirting
  g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(0, 610, W, 10);   // dado rail
  for (const lx of [-worldXOf(t) * 0.5 + 160, -worldXOf(t) * 0.5 + 920]) {   // ceiling lamps
    const lg2 = g.createRadialGradient(lx, 0, 0, lx, 0, 420); lg2.addColorStop(0, "rgba(255,252,240,0.55)"); lg2.addColorStop(1, "rgba(255,252,240,0)");
    g.fillStyle = lg2; g.fillRect(lx - 420, 0, 840, 420);
  }
  const open = inOutCubic(win(C.something + 0.05, C.then_end + 0.2, t));
  g.save(); g.translate(-worldX, 0);
  door(g, W / 2, "MANUAL EDITING", 0, null);
  door(g, W / 2 + 760, "VIBE EDITING", open, (g2, x, y, w, h) => {
    vid(g2, "fs_field", lt, x - 160, y, w + 320, h, { ss: 1, filter: "brightness(1.15)" });
    g2.fillStyle = `rgba(255,248,225,${0.55 * (1 - open)})`; g2.fillRect(x, y, w, h);
  });
  // light spilling onto the floor from the opened door
  if (open > 0) {
    const lx = W / 2 + 760;
    const lg = g.createRadialGradient(lx, DOOR_Y + 40, 10, lx, DOOR_Y + 80, 520);
    lg.addColorStop(0, `rgba(255,240,200,${0.55 * open})`); lg.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = lg; g.fillRect(lx - 600, DOOR_Y - 40, 1200, 620);
  }
  g.restore();
  // the line, in serif, word by word
  const words = [["Then", C.then], ["I", C.then + 0.18], ["tried", C.tried], ["something", C.something], ["else.", C.else]];
  font(g, 92, 400, "Instrument Serif"); g.font = 'italic 92px "Instrument Serif"';
  const line1 = words.slice(0, 3), line2 = words.slice(3);
  for (const [ln, y] of [[line1, 330], [line2, 440]]) {
    const total = ln.reduce((a, [w]) => a + g.measureText(w + " ").width, 0) - g.measureText(" ").width;
    let x = W / 2 - total / 2;
    for (const [w, at] of ln) {
      const p = outCubic(win(at - 0.05, at + 0.3, t));
      g.globalAlpha = p; g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle";
      g.fillText(w, x, y + 14 * (1 - p));
      x += g.measureText(w + " ").width;
    }
    g.globalAlpha = 1;
  }
  windowLight(g, t, 0.35);
};

// BRIEF: one sentence typed under a big sky; what I want vs how it should feel
const BRIEF = ["30-second", "reel,", "punchy", "start,", "warm", "and", "confident,", "end", "on", "my", "logo."];
const WANT = new Set([0, 1, 7, 8, 9, 10]), FEEL = new Set([2, 3, 4, 5, 6]);
S.brief = (g, lt, t) => {
  vid(g, "cw_sky", lt, 0, 0, W, H, { ss: 3, filter: "brightness(1.08) saturate(1.1)" });
  g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(0, 0, W, H);
  // ONE SENTENCE. slides past, huge, like the reference's words over the sky
  const op = outExpo(win(C.one_sentence - 0.1, C.one_sentence + 0.35, t));
  if (op > 0) {
    g.save(); g.globalAlpha = clamp(op * 2);
    const drift = lerp(160, -120, win(C.one_sentence - 0.1, C.s_ai, t));
    ext(g, "ONE", W / 2 + drift, 300, 200, { face: "#fff", side: "#8b939e" });
    ext(g, "SENTENCE.", W / 2 - drift * 0.6, 480, fitSize(g, "SENTENCE.", 960, 190), { face: RED, top: "#ff4a50", side: RED_D, shadow: "rgba(60,0,0,0.45)" });
    g.restore();
  }
  // the prompt card
  const cp = spring(win(C.s_brief + 0.1, C.s_brief + 0.8, t));
  const cx = 80, cy = 640, cw = 920, ch = 380;
  g.save(); g.translate(0, 90 * (1 - cp)); g.globalAlpha = clamp(cp * 2);
  K.shadow(g, 44, 20, 0.3); g.fillStyle = "#fff"; rr(g, cx, cy, cw, ch, 30); g.fill(); K.noShadow(g);
  font(g, 26, 700, "Inter Var"); g.fillStyle = RED; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("✦ vibe edit · the brief", cx + 40, cy + 50);
  // typed sentence, laid out word by word so parts can be highlighted
  const cps = 24, t0 = C.one_sentence + 0.15;
  let budget = Math.max(0, Math.floor((t - t0) * cps));
  font(g, 50, 600, "Inter Var");
  const sp = g.measureText(" ").width;
  let x = cx + 40, y = cy + 140; const lh = 72, maxX = cx + cw - 40;
  const hiW = outCubic(win(C.want - 0.1, C.want + 0.35, t)), hiF = outCubic(win(C.feel - 0.1, C.feel + 0.35, t));
  let caret = null;
  BRIEF.forEach((w, i) => {
    const ww = g.measureText(w).width;
    if (x + ww > maxX) { x = cx + 40; y += lh; }
    const n = Math.min(w.length, budget); budget -= w.length + 1;
    const vis = w.slice(0, Math.max(0, n));
    if (WANT.has(i) && hiW > 0 && n >= w.length) { g.fillStyle = "rgba(255,226,74,0.85)"; g.fillRect(x - 6, y - 30, (ww + 12) * hiW, 62); }
    if (FEEL.has(i) && hiF > 0 && n >= w.length) { g.fillStyle = "rgba(227,38,47,0.22)"; g.fillRect(x - 6, y - 30, (ww + 12) * hiF, 62); g.fillStyle = RED; g.fillRect(x - 6, y + 26, (ww + 12) * hiF, 5); }
    g.fillStyle = INK; g.fillText(vis, x, y);
    if (n > 0 && n < w.length) caret = [x + g.measureText(vis).width, y];
    if (n === w.length && budget >= -1 && !caret) caret = [x + ww + 2, y];
    x += ww + sp;
  });
  if (caret && t < C.brief_end && Math.floor(t * 2.5) % 2 === 0) { g.fillStyle = INK; g.fillRect(caret[0] + 2, caret[1] - 28, 4, 56); }
  // send button
  const sx = cx + cw - 70, sy = cy + ch - 62, press = Math.max(0, 1 - Math.abs(t - (C.brief_end - 0.05)) / 0.12);
  g.fillStyle = RED; g.beginPath(); g.arc(sx, sy, 34 - press * 4, 0, 7); g.fill();
  g.strokeStyle = "#fff"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(sx, sy + 14); g.lineTo(sx, sy - 14); g.moveTo(sx - 12, sy - 3); g.lineTo(sx, sy - 15); g.lineTo(sx + 12, sy - 3); g.stroke();
  if (t > C.brief_end - 0.05) { const rp = win(C.brief_end - 0.05, C.brief_end + 0.45, t); g.strokeStyle = `rgba(227,38,47,${1 - rp})`; g.lineWidth = 4; g.beginPath(); g.arc(sx, sy, 34 + 50 * rp, 0, 7); g.stroke(); }
  g.restore();
  tag(g, "WHAT I WANT", 300, 1120, 32, { rot: -3, bg: "#ffe24a", fg: INK, scale: spring(win(C.want, C.want + 0.5, t)), seed: 17 });
  tag(g, "HOW IT SHOULD FEEL", 690, 1215, 32, { rot: 2, scale: spring(win(C.feel, C.feel + 0.5, t)), seed: 19 });
};

// AI: on a wooden desk, the laptop's timeline assembles itself; three highlighted checks
const LAPTOP_W = 1000, LAPTOP_X = W / 2 - LAPTOP_W / 2, LAPTOP_Y = 640;
const CLIPS = ["typing", "fs_field", "timeline", "fs_beach", "cw_creator", "timelapse"];
S.ai = (g, lt, t) => {
  vid(g, "oh_wood", lt, 0, 0, W, H, { filter: "brightness(0.8)" });
  vignette(g, 0.4);
  const lp = spring(win(C.s_ai, C.s_ai + 0.7, t));
  const lap = K.object("hw_laptop");
  if (lap) {
    const sc = LAPTOP_W / lap.width, lh = lap.height * sc;
    g.save(); g.translate(0, 120 * (1 - lp)); g.globalAlpha = clamp(lp * 2);
    K.shadow(g, 50, 26, 0.55); g.drawImage(lap, LAPTOP_X, LAPTOP_Y, LAPTOP_W, lh); K.noShadow(g);
    const scr = K.A.objects.hw_laptop.screen;
    const sw = scr.len * LAPTOP_W, sh = scr.wid * LAPTOP_W, sx = LAPTOP_X + scr.cx * LAPTOP_W - sw / 2, sy = LAPTOP_Y + scr.cy * LAPTOP_W - sh / 2;
    g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
    g.fillStyle = "#14161a"; g.fillRect(sx, sy, sw, sh);
    // viewer: the reel playing, with captions once they exist
    const vw = sh * 0.5 * 9 / 16 * 1.0, vh = sh * 0.5, vx = sx + sw / 2 - vw / 2, vy = sy + 10;
    vid(g, "cw_creator", lt, vx, vy, vw, vh, { ss: 1 });
    if (t > C.captions) { font(g, 15, 800, "Inter Var"); g.fillStyle = YEL; g.textAlign = "center"; g.fillText(["TODAY", "I'M", "SHOWING", "YOU"][Math.floor(t * 3) % 4], vx + vw / 2, vy + vh * 0.78); }
    // tracks
    const tx = sx + 70, tw = sw - 90, rowH = (sh * 0.5 - 30) / 3, ty = sy + sh * 0.5 + 20;
    font(g, 13, 700, "Mono"); g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "rgba(255,255,255,0.6)";
    ["V1", "C1", "A1"].forEach((n, i) => g.fillText(n, sx + 22, ty + rowH * i + rowH / 2));
    // beat markers on the music, then clips snapping onto them
    const beats = 6, beatW = tw / beats;
    const music = outCubic(win(C.s_ai + 0.2, C.s_ai + 0.7, t));
    g.fillStyle = "rgba(60,220,120,0.28)"; g.fillRect(tx, ty + rowH * 2 + 6, tw * music, rowH - 12);
    g.fillStyle = "rgba(60,220,120,0.9)";
    for (let bx = 0; bx < tw * music; bx += 5) { const a = Math.abs(Math.sin(bx * 0.09) * Math.sin(bx * 0.021)); g.fillRect(tx + bx, ty + rowH * 2.5 - a * (rowH * 0.34), 2.5, a * rowH * 0.68); }
    const bm = outCubic(win(C.music - 0.6, C.music, t));
    for (let b = 0; b <= beats; b++) { g.fillStyle = `rgba(255,255,255,${0.85 * bm})`; g.fillRect(tx + b * beatW - 1, ty - 6, 3, rowH * 3 + 12); }
    const snap = outQuint(win(C.music - 0.2, C.music + 0.35, t));   // clips align to the beat
    CLIPS.forEach((c, i) => {
      const at = C.cuts - 0.15 + i * 0.12, p = outQuint(win(at, at + 0.35, t));
      if (p <= 0) return;
      const loose = [0.0, 0.8, 1.9, 3.1, 4.0, 5.2][i] * beatW, tight = i * beatW;
      const cw2 = lerp(beatW * 0.82, beatW - 4, snap);
      const x0 = lerp(loose, tight, snap) + (1 - p) * 300;
      g.save(); g.globalAlpha = p; g.beginPath(); rr(g, tx + x0 + 2, ty + 6, cw2, rowH - 12, 5); g.clip();
      vid(g, c, 0, tx + x0 + 2, ty + 6, cw2, rowH - 12, { ss: 1.5, loop: false });
      g.restore();
      g.strokeStyle = `rgba(255,255,255,${0.5 * p})`; g.lineWidth = 1.5; rr(g, tx + x0 + 2, ty + 6, cw2, rowH - 12, 5); g.stroke();
    });
    for (let i = 0; i < 9; i++) {   // caption blocks
      const at = C.captions - 0.1 + i * 0.07, p = outCubic(win(at, at + 0.25, t));
      if (p <= 0) continue;
      g.fillStyle = `rgba(255,226,74,${0.9 * p})`; rr(g, tx + i * tw / 9 + 3, ty + rowH + 10, tw / 9 - 6, rowH - 20, 4); g.fill();
    }
    const play = tx + tw * ((t - C.s_ai) / (C.s_note - C.s_ai));
    g.fillStyle = RED; g.fillRect(play, ty - 10, 3, rowH * 3 + 20);
    g.restore();
    g.restore();
  }
  // three highlighted checks, like the newspaper highlights in the reference
  const marks = [["CUT ✓", C.cuts, 290, -3], ["CAPTIONED ✓", C.captions, 400, 2], ["ON THE BEAT ✓", C.music, 510, -1.5]];
  for (const [txt, at, y, rot] of marks) {
    const p = outCubic(win(at - 0.05, at + 0.3, t));
    if (p <= 0) continue;
    font(g, 66, 400, "Archivo Black");
    const tw = g.measureText(txt).width;
    g.save(); g.translate(W / 2, y); g.rotate(rot * Math.PI / 180);
    g.fillStyle = "rgba(255,226,74,0.95)"; g.fillRect(-tw / 2 - 24, -42, (tw + 48) * p, 84);
    g.globalAlpha = clamp(p * 1.5); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 4);
    g.restore();
  }
};

// NOTE: a clipboard on a red desk takes one sticky note; the phone posts the reel
S.note = (g, lt, t) => {
  g.drawImage(REDDESK, 0, 0);
  vignette(g, 0.5);
  const bp = spring(win(C.s_note, C.s_note + 0.7, t));
  g.save(); g.translate(360 - 120 * (1 - bp), 640); g.rotate((-6 + 8 * (1 - bp)) * Math.PI / 180);
  K.shadow(g, 40, 22, 0.5);
  g.fillStyle = "#8a5a32"; rr(g, -290, -400, 580, 800, 26); g.fill(); K.noShadow(g);
  g.fillStyle = "#fbfaf6"; g.fillRect(-250, -330, 500, 700);
  g.fillStyle = "#b9bec4"; rr(g, -110, -430, 220, 90, 18); g.fill();   // the clip
  g.fillStyle = "#8f959c"; rr(g, -70, -410, 140, 40, 12); g.fill();
  font(g, 24, 600, "Mono"); g.fillStyle = "#666"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("DRAFT 1 · review", -220, -280);
  ext(g, "ONE", -10, -170, 110, { face: INK, top: "#333", side: "#999", shadow: "rgba(0,0,0,0.2)", align: "center" });
  ext(g, "NOTE.", -10, -50, 110, { face: RED, top: "#ff4a50", side: RED_D, shadow: "rgba(0,0,0,0.2)", align: "center" });
  g.fillStyle = "rgba(0,0,0,0.12)"; for (let i = 0; i < 6; i++) g.fillRect(-220, 60 + i * 44, 440 - (i % 3) * 60, 6);
  // the sticky note slaps on
  const sp = outExpo(win(C.note - 0.15, C.note + 0.15, t));
  if (sp > 0) {
    g.save(); g.translate(30, 150); g.rotate(0.06); const s = lerp(1.6, 1, sp); g.scale(s, s); g.globalAlpha = clamp(sp * 2);
    K.shadow(g, 18, 10, 0.35); g.fillStyle = "#ffe36b"; g.fillRect(-170, -150, 340, 300); K.noShadow(g);
    g.fillStyle = "rgba(0,0,0,0.05)"; g.fillRect(-170, -150, 340, 40);
    g.font = '600 50px "Caveat"'; g.fillStyle = "#222"; g.textAlign = "center";
    g.fillText("punchier", 0, -50); g.fillText("first 2 seconds", 0, 10);
    const ck = outCubic(win(C.note + 0.45, C.note + 0.75, t));
    if (ck > 0) { g.strokeStyle = "#1c9b4a"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(-60, 80); g.lineTo(-60 + 40 * Math.min(1, ck * 2), 80 + 40 * Math.min(1, ck * 2)); if (ck > 0.5) g.lineTo(-20 + 110 * (ck - 0.5) * 2, 120 - 110 * (ck - 0.5) * 2); g.stroke(); }
    g.restore();
  }
  g.restore();
  // the phone, posting
  const pp = spring(win(C.post - 0.55, C.post + 0.2, t));
  if (pp > 0) {
    g.save(); g.translate(820 + 300 * (1 - pp), 1000); g.rotate(0.06);
    K.shadow(g, 40, 20, 0.5);
    g.fillStyle = "#111"; rr(g, -190, -360, 380, 720, 40); g.fill(); K.noShadow(g);
    g.save(); rr(g, -175, -345, 350, 690, 30); g.clip();
    vid(g, "cw_creator", lt, -175, -345, 350, 690, { ss: 2 });
    g.restore();
    const ok = spring(win(C.post, C.post + 0.5, t));
    if (ok > 0) {
      g.save(); g.scale(ok, ok);
      g.fillStyle = "#1c9b4a"; rr(g, -150, -40, 300, 80, 40); g.fill();
      font(g, 36, 800, "Inter Var"); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("POSTED ✓", 0, 2);
      g.restore();
    }
    g.restore();
  }
};

// SAME: a chalkboard graph; the hours drop to fifteen minutes
S.same = (g, lt, t) => {
  g.drawImage(CHALK, 0, 0);
  const hp = spring(win(C.s_same, C.s_same + 0.6, t));
  g.save(); g.globalAlpha = clamp(hp * 2);
  ext(g, "SAME REEL.", W / 2, 300, fitSize(g, "SAME REEL.", 880, 150), { face: "#f2f4f0", top: "#fff", side: "#6c766f", shadow: "rgba(0,0,0,0.4)" });
  g.restore();
  font(g, 30, 500, "Mono"); g.textAlign = "left"; g.textBaseline = "middle";
  const label = "TIME PER REEL  ", typed = K.typed(label, t, C.s_same + 0.2, 26);
  g.fillStyle = "rgba(240,244,238,0.85)"; g.fillText(typed, 150, 440);
  if (t > C.fifteen - 0.2) { g.fillStyle = GREEN; g.fillText(K.typed("DROPPED.", t, C.fifteen - 0.2, 20), 150 + g.measureText(label).width, 440); }
  // axes
  const ax = 150, ay = 520, aw = 780, ah = 520;
  g.strokeStyle = "rgba(240,244,238,0.7)"; g.lineWidth = 4; g.lineCap = "round";
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax, ay + ah); g.lineTo(ax + aw, ay + ah); g.stroke();
  // the line: high plateau, then a dramatic drop
  const lp = ease01(C.same, C.fifteen + 0.5, t), N = 60;
  const pt = (u) => [ax + 20 + u * (aw - 40), ay + 40 + (ah - 90) * (u < 0.45 ? 0.02 * Math.sin(u * 30) : Math.min(1, outCubic((u - 0.45) / 0.4)) * 0.97)];
  g.strokeStyle = GREEN; g.lineWidth = 9; g.shadowColor = "rgba(61,255,116,0.7)"; g.shadowBlur = 18;
  g.beginPath();
  for (let i = 0; i <= N * lp; i++) { const [x, y] = pt(i / N); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); K.noShadow(g);
  // the two values
  font(g, 54, 700, "Mono"); g.textAlign = "left";
  g.fillStyle = "#f2f4f0"; g.fillText("3:00:00", ax + 30, ay + 110);
  const strike = outCubic(win(C.fifteen - 0.1, C.fifteen + 0.25, t));
  if (strike > 0) { g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.moveTo(ax + 22, ay + 112); g.lineTo(ax + 22 + 250 * strike, ay + 108); g.stroke(); }
  if (lp > 0.85) { g.globalAlpha = win(0.85, 1, lp); g.fillStyle = GREEN; g.textAlign = "right"; g.fillText("0:15:00", ax + aw - 10, ay + ah - 110); g.globalAlpha = 1; }
  // the payoff line
  const fp = outExpo(win(C.fifteen - 0.05, C.fifteen + 0.3, t));
  if (fp > 0) {
    g.save(); g.translate(W / 2, 1230); const s = lerp(1.6, 1, fp); g.scale(s, s); g.globalAlpha = clamp(fp * 2);
    ext(g, "FIFTEEN", 0, -70, 150, { face: GREEN, top: "#8dffae", side: "#0f6b2c", shadow: "rgba(0,0,0,0.4)" });
    ext(g, "MINUTES.", 0, 80, 120, { face: "#f2f4f0", top: "#fff", side: "#6c766f", shadow: "rgba(0,0,0,0.4)" });
    g.restore();
  }
};

// OUTRO: friends walking into a real sunset; JOIN VIBE EDITING; a search bar types it
S.outro = (g, lt, t) => {
  vid(g, "pb_friends_sunset", lt, 0, 0, W, H, { speed: 0.9, loop: false, filter: "saturate(1.15) contrast(1.05)" });
  const warm = g.createLinearGradient(0, 0, 0, H);
  warm.addColorStop(0, "rgba(255,140,60,0.10)"); warm.addColorStop(0.55, "rgba(0,0,0,0)"); warm.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = warm; g.fillRect(0, 0, W, H);
  const jp = outExpo(win(C.join - 0.05, C.join + 0.25, t));
  if (jp > 0) {
    g.save(); g.translate(W / 2, 400); const s = lerp(1.9, 1, jp); g.scale(s, s); g.globalAlpha = clamp(jp * 2);
    ext(g, "JOIN", 0, 0, 210, { face: RED, top: "#ff4a50", side: RED_D, shadow: "rgba(0,0,0,0.5)" });
    g.restore();
  }
  const vp = outExpo(win(C.join + 0.18, C.join + 0.45, t));
  if (vp > 0) {
    g.save(); g.translate(W / 2, 600); const s = lerp(1.6, 1, vp); g.scale(s, s); g.globalAlpha = clamp(vp * 2);
    ext(g, "VIBE EDITING", 0, 0, fitSize(g, "VIBE EDITING", 960, 150), { face: "#fff", side: "#8b939e", shadow: "rgba(0,0,0,0.55)" });
    g.restore();
  }
  const ep = outCubic(win(C.evenings - 0.45, C.evenings + 0.2, t));
  if (ep > 0) { g.globalAlpha = ep; serif(g, "and get your evenings back.", W / 2, 745, 70, { color: "#fff7ec", shadow: "rgba(0,0,0,0.7)" }); g.globalAlpha = 1; }
  // the search bar from the reference's ending
  const sp = spring(win(C.outro_end - 0.2, C.outro_end + 0.5, t));
  if (sp > 0) {
    g.save(); g.translate(W / 2, 1230); g.scale(0.9 + 0.1 * sp, 0.9 + 0.1 * sp); g.globalAlpha = clamp(sp * 2);
    K.shadow(g, 30, 14, 0.4); g.fillStyle = "rgba(255,255,255,0.95)"; rr(g, -380, -60, 760, 120, 60); g.fill(); K.noShadow(g);
    font(g, 46, 600, "Inter Var"); g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle";
    const ty = K.typed("vibe editing", t, C.outro_end + 0.1, 14);
    g.fillText(ty, -320, 2);
    if (Math.floor(t * 2.5) % 2 === 0) { g.fillStyle = RED; g.fillRect(-320 + g.measureText(ty).width + 4, -26, 4, 54); }
    g.fillStyle = RED; g.beginPath(); g.arc(310, 0, 42, 0, 7); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.arc(304, -6, 15, 0, 7); g.stroke(); g.beginPath(); g.moveTo(315, 5); g.lineTo(328, 18); g.stroke();
    g.restore();
  }
};

// ------------------------------------------------------------------ the cut --
const SCENES = [
  ["hook", 0], ["hours", C.s_hours], ["trim", C.s_trim], ["type", C.s_type], ["nudge", C.s_nudge],
  ["then", C.s_then], ["brief", C.s_brief], ["ai", C.s_ai], ["note", C.s_note], ["same", C.s_same], ["outro", C.s_outro],
];
// how each scene arrives
const TRANS = { hours: ["flash", 0.42], trim: ["whipL", 0.4], type: ["whipU", 0.4], nudge: ["whipL", 0.4], then: ["fade", 0.5],
  brief: ["door", 0.55], ai: ["whipU", 0.42], note: ["whipL", 0.4], same: ["iris", 0.5], outro: ["flash", 0.5] };

function drawScene(g, i, t) {
  const [name, t0] = SCENES[i];
  const lt = t - t0;
  // a slow push-in keeps every still layout alive
  const z = 1 + 0.035 * outCubic(clamp(lt / 4));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  S[name](g, lt, t);
  g.restore();
}

function frame(g, t) {
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1][1]) i++;
  const name = SCENES[i][0], t0 = SCENES[i][1];
  const [kind, dur] = TRANS[name] || ["cut", 0];
  const p = dur ? clamp((t - t0) / dur) : 1;
  let moving = false, speed = 0;
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  if (p >= 1 || i === 0) {
    drawScene(g, i, t);
  } else {
    const e = inOutQuint(p);
    speed = Math.sin(Math.PI * p);
    if (kind === "whipL" || kind === "whipU") {
      moving = p > 0.05 && p < 0.95;
      const dx = kind === "whipL" ? -W : 0, dy = kind === "whipU" ? -H : 0;
      g.save(); g.translate(dx * e, dy * e); drawScene(g, i - 1, t); g.restore();
      g.save(); g.translate(-dx * (1 - e), -dy * (1 - e)); drawScene(g, i, t); g.restore();
    } else if (kind === "flash") {
      moving = p > 0.05 && p < 0.6;
      if (p < 0.5) { g.save(); const s = 1 + 0.35 * inCubic(p * 2); g.translate(W / 2, H / 2); g.scale(s, s); g.translate(-W / 2, -H / 2); drawScene(g, i - 1, t); g.restore(); }
      else { g.save(); const s = 1.18 - 0.18 * outCubic((p - 0.5) * 2); g.translate(W / 2, H / 2); g.scale(s, s); g.translate(-W / 2, -H / 2); drawScene(g, i, t); g.restore(); }
      g.fillStyle = `rgba(255,252,245,${Math.max(0, 1 - Math.abs(p - 0.5) * 2.6)})`; g.fillRect(0, 0, W, H);
    } else if (kind === "fade") {
      if (p < 0.5) { drawScene(g, i - 1, t); g.fillStyle = `rgba(0,0,0,${p * 2})`; g.fillRect(0, 0, W, H); }
      else { drawScene(g, i, t); g.fillStyle = `rgba(0,0,0,${(1 - p) * 2})`; g.fillRect(0, 0, W, H); }
    } else if (kind === "door") {
      // the opened VIBE EDITING door grows into the next scene
      drawScene(g, i - 1, t);
      const d = VIBE_DOOR_SCREEN;
      const x = lerp(d.x, 0, e), y = lerp(d.y, 0, e), w = lerp(d.w, W, e), h = lerp(d.h, H, e);
      g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); drawScene(g, i, t); g.restore();
      moving = p > 0.1 && p < 0.9; speed *= 0.6;
    } else if (kind === "iris") {
      drawScene(g, i - 1, t);
      const r = Math.hypot(W, H) * 0.55 * e;
      g.save(); g.beginPath(); g.arc(W / 2, H * 0.45, r, 0, 7); g.clip(); drawScene(g, i, t); g.restore();
      g.strokeStyle = `rgba(255,255,255,${0.6 * (1 - e)})`; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, H * 0.45, r, 0, 7); g.stroke();
    }
  }
  K.captions(g, t, { y: 1540, size: 42, weight: 700, family: "Inter Var", color: "#fff", box: "rgba(12,12,16,0.6)", hi: RED, hiText: "#fff", maxW: 880, boxPad: 22 });
  K.grain(g, t, 0.06);
  // fade out at the very end
  const fo = win(C.end - 0.35, C.end, t);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
  return { moving, speed };
}

K.run(frame, ['400 40px "Archivo Black"', '700 40px "Inter Var"', '600 40px "Mono"', 'italic 40px "Instrument Serif"', '600 40px "Caveat"']);
})();

// T01B · "Watch me edit this, just by talking." — live demo in the cinematic dark design.
// One raw clip (Mixkit 34478) is edited live by four spoken commands; the hook differs from
// T01A/T01C, the body beats are the same. Scenes draw into offscreen layers so cuts can
// flash, whip or zoom between them.
(function () {
const { win, lerp, clamp, outCubic, outQuint, outExpo, inCubic, inOutCubic, spring, rnd } = K;
const C = K.C, W = K.W, H = K.H;
const ENV = window.ENV || [];
const COL = { gold: "#e8a93a", goldDeep: "#b97a17", orange: "#ec6a2c", line: "rgba(220,220,225,0.5)" };
const SANS = "Inter Var", SERIF = "Instrument Serif";

// ---------------------------------------------------------------- helpers --
function layer() { const c = K.makeCanvas(W, H); return { c, g: c.getContext("2d") }; }
const LA = layer(), LB = layer();
const env = (t) => ENV[Math.max(0, Math.min(ENV.length - 1, Math.floor(t * 60)))] || 0;

function voidBg(g, tint = "#09090b", glow = null) {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  if (glow) {
    const r = g.createRadialGradient(glow.x ?? W / 2, glow.y ?? H * 0.42, 0, glow.x ?? W / 2, glow.y ?? H * 0.42, glow.r ?? 900);
    r.addColorStop(0, glow.c); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, W, H);
  }
}
function vignette(g, a = 0.75) {
  const v = g.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function words(g, list, x, y, t, o = {}) {        // airy sans, word by word on the spoken words
  const fs = o.size || 60;
  g.save();
  g.font = `${o.weight || 300} ${fs}px "${SANS}"`;
  if (g.letterSpacing !== undefined) g.letterSpacing = `${o.track ?? 1}px`;
  g.textBaseline = "middle";
  const sp = g.measureText(" ").width * 1.15;
  const ws = list.map(([s]) => g.measureText(s).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (list.length - 1);
  let cx = o.align === "left" ? x : x - total / 2;
  const out = o.out != null ? win(o.out, o.out + 0.3, t) : 0;
  list.forEach(([s, at], i) => {
    const p = outCubic(win(at - 0.06, at + 0.28, t));
    if (p > 0) {
      g.globalAlpha = p * (o.alpha ?? 1) * (1 - out);
      g.fillStyle = o.color || "#f2f2f2";
      g.filter = p < 1 ? `blur(${(1 - p) * 6}px)` : "none";
      g.fillText(s, cx, y + (1 - p) * 12);
      g.filter = "none";
    }
    cx += ws[i] + sp;
  });
  g.restore();
}
function glowSerif(g, s, x, y, size, color, glow, t, at, o = {}) {
  const p = outExpo(win(at - 0.05, at + 0.45, t));
  if (p <= 0) return;
  const out = o.out != null ? win(o.out, o.out + 0.3, t) : 0;
  g.save();
  g.translate(x, y); const sc = (0.9 + 0.1 * p) * (1 + 0.05 * out); g.scale(sc, sc);
  g.font = `italic 400 ${size}px "${SERIF}"`; g.textAlign = o.align || "center"; g.textBaseline = "middle";
  g.filter = p < 1 ? `blur(${(1 - p) * 10}px)` : "none";
  for (const [b, a] of [[60, 0.55], [28, 0.7], [10, 0.9]]) { g.shadowColor = glow; g.shadowBlur = b; g.globalAlpha = p * (1 - out) * a; g.fillStyle = color; g.fillText(s, 0, 0); }
  g.shadowBlur = 0; g.globalAlpha = p * (1 - out); g.fillStyle = color; g.fillText(s, 0, 0);
  g.restore();
}
function goldTag(g, s, x, y, t, at, o = {}) {
  const p = outQuint(win(at - 0.04, at + 0.32, t));
  if (p <= 0) return;
  const out = o.out != null ? win(o.out, o.out + 0.25, t) : 0;
  const fs = o.size || 36;
  g.save();
  g.globalAlpha = 1 - out;
  g.font = `600 ${fs}px "${SANS}"`; if (g.letterSpacing !== undefined) g.letterSpacing = "1px";
  const tw = g.measureText(s).width, w = (o.w || tw + fs * 1.2), h = fs * 1.55;
  g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
  const ax = o.align === "left" ? 0 : -w / 2;
  const sw = w * p;
  g.shadowColor = "rgba(232,169,58,0.6)"; g.shadowBlur = 32;
  const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, "#f6c25c"); gr.addColorStop(1, COL.goldDeep);
  g.fillStyle = gr; g.fillRect(ax, -h / 2, sw, h);
  g.shadowBlur = 0;
  g.save(); g.beginPath(); g.rect(ax, -h / 2, sw, h); g.clip();
  g.fillStyle = "#2a1a05"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, ax + w / 2, 2);
  g.restore();
  g.restore();
}
function trail(g, pts, t, at, dur = 0.9, color = "255,214,150") {
  const p = inOutCubic(win(at, at + dur, t));
  if (p <= 0) return;
  g.save();
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i + 2 < pts.length; i += 3) g.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]);
  g.setLineDash([4000 * p, 4000]); g.lineCap = "round";
  for (const [lw, a, b] of [[14, 0.12, 30], [5, 0.35, 14], [2, 0.95, 4]]) {
    g.strokeStyle = `rgba(${color},${a})`; g.lineWidth = lw; g.shadowColor = `rgba(${color},0.9)`; g.shadowBlur = b; g.stroke();
  }
  g.restore();
}
function crosshair(g, cx, cy, t, at, o = {}) {
  const p = outExpo(win(at, at + (o.dur || 0.8), t));
  if (p <= 0) return;
  g.save(); g.strokeStyle = o.color || COL.line; g.lineWidth = o.lw || 2; g.globalAlpha = o.alpha ?? 1;
  const ext = 1400 * p, bx = o.bw || 0, by = o.bh || 0;
  g.beginPath();
  for (const yy of by ? [cy - by, cy + by] : [cy]) { g.moveTo(cx - ext, yy); g.lineTo(cx + ext, yy); }
  for (const xx of bx ? [cx - bx, cx + bx] : [cx]) { g.moveTo(xx, cy - ext * 1.4); g.lineTo(xx, cy + ext * 1.4); }
  g.stroke(); g.restore();
}
function brackets(g, x, y, w, h, t, at, o = {}) {
  const p = outQuint(win(at, at + 0.45, t));
  if (p <= 0) return;
  const L = (o.len || 70) * p, pad = (1 - p) * 40 + (o.pad || 0);
  g.save(); g.strokeStyle = o.color || "rgba(255,255,255,0.92)"; g.lineWidth = o.lw || 4; g.lineCap = "square";
  const X0 = x - pad, Y0 = y - pad, X1 = x + w + pad, Y1 = y + h + pad;
  g.beginPath();
  g.moveTo(X0, Y0 + L); g.lineTo(X0, Y0); g.lineTo(X0 + L, Y0);
  g.moveTo(X1 - L, Y0); g.lineTo(X1, Y0); g.lineTo(X1, Y0 + L);
  g.moveTo(X1, Y1 - L); g.lineTo(X1, Y1); g.lineTo(X1 - L, Y1);
  g.moveTo(X0 + L, Y1); g.lineTo(X0, Y1); g.lineTo(X0, Y1 - L);
  g.stroke(); g.restore();
}
function cursor3d(g, x, y, s, press) {
  g.save(); g.translate(x, y); g.scale(s * (1 - 0.12 * press), s * (1 - 0.12 * press)); g.rotate(-0.28);
  g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 22; g.shadowOffsetY = 18;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 64); g.lineTo(16, 50); g.lineTo(28, 76); g.lineTo(40, 70); g.lineTo(28, 45); g.lineTo(48, 45); g.closePath();
  const gr = g.createLinearGradient(0, 0, 40, 70); gr.addColorStop(0, "#3a3a3d"); gr.addColorStop(1, "#0d0d0f");
  g.fillStyle = gr; g.fill(); K.noShadow(g);
  g.lineJoin = "round"; g.lineWidth = 3; g.strokeStyle = "#f4f4f4"; g.stroke();
  g.restore();
}
function ripple(g, x, y, t, at, color = "236,106,44") {
  const p = win(at, at + 0.6, t);
  if (p <= 0 || p >= 1) return;
  g.save(); g.strokeStyle = `rgba(${color},${1 - p})`; g.lineWidth = 6 * (1 - p) + 1;
  g.beginPath(); g.arc(x, y, 20 + 90 * outCubic(p), 0, 7); g.stroke(); g.restore();
}

// ---------------------------------------------------------------- the edit --
// Everything the four commands change, as a function of time.
function editState(t, o = {}) {
  if (o.final) return { cut: 1, caps: 1, warm: 1, music: 1, len: 30, logo: o.logo ?? 0 };
  const cut = outCubic(win(C.done1 - 0.6, C.done1, t));
  const len = t < C.done1 - 0.6 ? 47 : t < C.thirty ? Math.round(lerp(47, 38, cut)) : Math.round(lerp(38, 30, outCubic(win(C.thirty, C.thirty + 0.9, t))));
  return {
    cut, len,
    caps: t >= C.bold ? 1 : 0,
    warm: inOutCubic(win(C.warmer + 0.05, C.warmer + 1.3, t)),
    music: outCubic(win(C.music - 0.1, C.music + 0.6, t)),
    logo: o.noLogo ? 0 : outCubic(win(C.logo, C.logo + 0.45, t)),
  };
}
const mmss = (s) => `0:${String(s).padStart(2, "0")}`;
function grade(w) {   // raw: flat and a little grey; graded: warm, rich
  return `saturate(${lerp(0.78, 1.22, w)}) contrast(${lerp(0.92, 1.08, w)}) brightness(${lerp(1.03, 1.0, w)}) sepia(${lerp(0, 0.22, w)}) hue-rotate(${lerp(0, -6, w)}deg)`;
}
const CAPS = [["OKAY,", "SO"], ["THIS", "IS", "MY"], ["GO-TO"], ["EVERYDAY", "LOOK"]];
function reelCaptions(g, x, y, w, h, t, a) {
  const per = 0.9, n = CAPS.length, k = Math.floor(t / per) % n, lt = (t / per) % 1;
  const line = CAPS[k];
  let fs = w * 0.12;
  g.save(); g.globalAlpha = a;
  g.font = `900 ${fs}px "${SANS}"`; g.textAlign = "center"; g.textBaseline = "middle";
  const fit = (w * 0.86) / (line.map((s) => g.measureText(s).width).reduce((p, q) => p + q, 0) + fs * 0.28 * (line.length - 1));
  if (fit < 1) { fs *= fit; g.font = `900 ${fs}px "${SANS}"`; }
  const sp = fs * 0.28, ws = line.map((s) => g.measureText(s).width), tot = ws.reduce((p, q) => p + q, 0) + sp * (line.length - 1);
  let cx = x + w / 2 - tot / 2; const cy = y + h * 0.72;
  line.forEach((s, i) => {
    const p = spring(win(i * 0.12, i * 0.12 + 0.35, lt * per));
    if (p <= 0) { cx += ws[i] + sp; return; }
    g.save(); g.translate(cx + ws[i] / 2, cy); g.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p);
    g.lineWidth = fs * 0.16; g.strokeStyle = "#0c0c0c"; g.lineJoin = "round"; g.strokeText(s, 0, 0);
    g.fillStyle = i === line.length - 1 ? "#ffd23c" : "#ffffff"; g.fillText(s, 0, 0);
    g.restore();
    cx += ws[i] + sp;
  });
  g.restore();
}
function endCard(g, x, y, w, h, a) {
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, "#120d08"); gr.addColorStop(1, "#050506");
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `italic 400 ${w * 0.2}px "${SERIF}"`;
  for (const [b, al] of [[50, 0.6], [16, 0.9]]) { g.shadowColor = "rgba(255,170,70,0.9)"; g.shadowBlur = b; g.globalAlpha = a * al; g.fillStyle = "#ffe2b0"; g.fillText("vibe", x + w / 2, y + h * 0.45); }
  g.shadowBlur = 0; g.globalAlpha = a;
  g.font = `500 ${w * 0.065}px "${SANS}"`; if (g.letterSpacing !== undefined) g.letterSpacing = `${w * 0.02}px`;
  g.fillStyle = "#e8a93a"; g.fillText("EDITING", x + w / 2, y + h * 0.56);
  g.restore();
}
// the clip itself, in whatever state the edit is in
function reel(g, x, y, w, h, t, o = {}) {
  const st = o.state || editState(t, o);
  g.save();
  K.rr(g, x, y, w, h, o.r ?? 26); g.clip();
  g.fillStyle = "#111"; g.fillRect(x, y, w, h);
  const fr = K.footage("tb_creator", 1.0 + (t % 6.2), 1, true);
  const wv = o.warm ?? st.warm;
  g.filter = grade(wv);
  K.drawFit(g, fr, x, y, w, h, { fy: 0.3 });
  g.filter = "none";
  if (wv > 0) { g.globalAlpha = 0.16 * wv; g.globalCompositeOperation = "soft-light"; g.fillStyle = "#ff9a3c"; g.fillRect(x, y, w, h); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; }
  if (st.caps && !o.noCaps) reelCaptions(g, x, y, w, h, t, 1);
  if (st.logo > 0) endCard(g, x, y, w, h, st.logo);
  if (o.badge) {     // small status line on the clip
    g.font = `600 ${Math.max(20, w * 0.045)}px "${SANS}"`; g.textBaseline = "top"; g.textAlign = "left";
    const s = o.badge, pad = 14, tw = g.measureText(s).width;
    g.fillStyle = "rgba(0,0,0,0.55)"; K.rr(g, x + 18, y + 18, tw + pad * 2, w * 0.045 + 18, 10); g.fill();
    g.fillStyle = "#fff"; g.fillText(s, x + 18 + pad, y + 27);
  }
  g.restore();
  g.save(); g.strokeStyle = "rgba(255,255,255,0.16)"; g.lineWidth = 2; K.rr(g, x, y, w, h, o.r ?? 26); g.stroke(); g.restore();
}

// ---------------------------------------------------------------- voice UI --
function micGlyph(g, cx, cy, s, color = "#fff") {
  g.save(); g.translate(cx, cy); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = s * 0.12; g.lineCap = "round";
  K.rr(g, -s * 0.2, -s * 0.5, s * 0.4, s * 0.68, s * 0.2); g.fill();
  g.beginPath(); g.arc(0, -s * 0.05, s * 0.36, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.beginPath(); g.moveTo(0, s * 0.31); g.lineTo(0, s * 0.5); g.moveTo(-s * 0.18, s * 0.5); g.lineTo(s * 0.18, s * 0.5); g.stroke();
  g.restore();
}
function micButton(g, cx, cy, r, t, a = 1) {
  if (a <= 0) return;
  const e = env(t);
  g.save(); g.globalAlpha = a;
  for (let k = 0; k < 3; k++) {       // radial voice bars
    const n = 48, R = r * (1.25 + k * 0.0);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const v = env(t - (i % 12) * 0.04) * (0.6 + 0.4 * Math.sin(i * 1.7 + t * 6));
      const len = r * (0.08 + 0.55 * v);
      if (k) continue;
      g.strokeStyle = `rgba(255,190,110,${0.35 + 0.5 * v})`; g.lineWidth = 5; g.lineCap = "round";
      g.beginPath(); g.moveTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); g.lineTo(cx + Math.cos(ang) * (R + len), cy + Math.sin(ang) * (R + len)); g.stroke();
    }
  }
  g.shadowColor = "rgba(236,106,44,0.9)"; g.shadowBlur = 40 + 60 * e;
  const gr = g.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
  gr.addColorStop(0, "#ff9a55"); gr.addColorStop(1, "#d4521c");
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r * (1 + 0.05 * e), 0, 7); g.fill();
  K.noShadow(g);
  micGlyph(g, cx, cy, r * 0.95);
  g.restore();
}
function liveWave(g, x, y, w, h, t, o = {}) {    // horizontal bars following the narration
  const n = o.n || 42, bw = w / n;
  g.save(); g.globalAlpha = o.a ?? 1;
  for (let i = 0; i < n; i++) {
    const v = env(t - Math.abs(i - n / 2) * 0.025) * (0.55 + 0.45 * Math.abs(Math.sin(i * 2.3 + t * 3)));
    const bh = Math.max(4, h * v);
    g.fillStyle = o.color || "rgba(255,200,120,0.95)";
    if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 14; }
    K.rr(g, x + i * bw + bw * 0.22, y - bh / 2, bw * 0.56, bh, bw * 0.28); g.fill();
  }
  g.restore();
}
// a spoken command bubble ("🎙 “Cut the pauses.”") + the agent's "Done ✓"
function cmdPill(g, s, x, y, t, at, doneAt, doneText, o = {}) {
  const p = outQuint(win(at - 0.1, at + 0.3, t));
  if (p <= 0) return;
  g.save();
  g.globalAlpha = p; g.translate(0, (1 - p) * 30);
  const fs = o.size || 40;
  g.font = `500 ${fs}px "${SANS}"`;
  const shown = K.typed(s, t, at, 26);
  const tw = g.measureText(s).width, h = fs * 1.9, w = tw + fs * 2.6;
  g.fillStyle = "rgba(24,24,28,0.92)"; g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = 2;
  K.rr(g, x, y, w, h, h / 2); g.fill(); g.stroke();
  micGlyph(g, x + fs * 0.95, y + h / 2, fs * 0.8, "#ff9a55");
  g.fillStyle = "#f4f4f4"; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(shown, x + fs * 1.75, y + h / 2 + 1);
  g.restore();
  if (doneAt != null) goldTag(g, doneText, x + (o.doneDx ?? 0), y + h + 50, t, doneAt, { size: 34, align: "left" });
}

// ---------------------------------------------------------------- scenes --
const S = {};

// hook + raw: the clip starts as a glowing tile at a crosshair and grows into the frame
S.open = (g, t) => {
  voidBg(g, "#08080a", { c: `rgba(236,106,44,${0.18 + 0.25 * env(t)})`, y: 840, r: 700 });
  const m = inOutCubic(win(C.raw - 0.15, C.raw + 0.6, t));   // tile -> big frame
  const tw = lerp(240, 600, m), th = tw * 16 / 9, cx = 540, cy = lerp(830, 790, m);
  crosshair(g, cx, cy, t, 0.0, { bw: tw / 2 + 2, bh: th / 2 + 2, alpha: 1 - 0.6 * m, dur: 0.9 });
  const p = spring(win(0.0, 0.8, t));
  if (p > 0) {
    g.save(); g.globalAlpha = Math.min(1, p * 1.5);
    g.shadowColor = "rgba(255,140,40,0.85)"; g.shadowBlur = 80 * (1 - m) + 20;
    g.fillStyle = "#ff8a2a"; K.rr(g, cx - tw / 2 * p - 6, cy - th / 2 * p - 6, tw * p + 12, th * p + 12, 30); g.fill();
    g.restore();
    reel(g, cx - tw / 2 * p, cy - th / 2 * p, tw * p, th * p, t, { state: { caps: 0, warm: 0, logo: 0 } });
  }
  const hookOut = C.raw - 0.2;
  words(g, [["Watch", C.watch], ["me", C.watch + 0.25], ["edit", C.edit], ["this", C.this]], 540, 360, t, { size: 86, weight: 400, out: hookOut });
  glowSerif(g, "by just talking.", 540, 1260, 130, "#ffe6c4", "rgba(255,150,60,0.9)", t, C.by, { out: hookOut });
  if (t < C.raw + 0.3) liveWave(g, 300, 1390, 480, 90, t, { a: 1 - win(C.raw - 0.1, C.raw + 0.3, t), glow: "rgba(255,150,60,0.8)" });
  g.save(); g.globalAlpha = 1 - win(C.raw - 0.25, C.raw + 0.25, t);
  trail(g, [[120, 1150], [260, 900], [300, 600], [360, 420], [470, 300], [760, 320], [980, 230]], t, 0.25, 1.4, "255,170,80");
  g.restore();
  // raw
  brackets(g, cx - tw / 2, cy - th / 2, tw, th, t, C.raw + 0.35, { len: 80 });
  goldTag(g, "RAW · 0:47", 540 - 200, cy - th / 2 - 60, t, C.rawclip, { size: 36 });
  words(g, [["no", C.noedits], ["edits.", C.noedits + 0.25]], 540 + 190, cy - th / 2 - 60, t, { size: 52 });
  vignette(g, 0.65);
};

// tell: the agent listens
S.tell = (g, t) => {
  voidBg(g, "#0a0a0c", { c: "rgba(236,106,44,0.16)", y: 1050, r: 800 });
  const lt = t - C.tell;
  // agent panel
  const px = 80, py = 170, pw = 920, ph = 1260;
  g.save();
  g.fillStyle = "rgba(20,20,24,0.96)"; g.strokeStyle = "rgba(255,255,255,0.1)"; g.lineWidth = 2;
  K.rr(g, px, py, pw, ph, 36); g.fill(); g.stroke();
  g.font = `500 30px "${SANS}"`; g.fillStyle = "rgba(255,255,255,0.55)"; g.textBaseline = "middle";
  g.fillText("vibe agent", px + 70, py + 58);
  const blink = 0.5 + 0.5 * Math.sin(t * 7);
  g.fillStyle = `rgba(255,90,60,${0.6 + 0.4 * blink})`; g.beginPath(); g.arc(px + 44, py + 58, 9, 0, 7); g.fill();
  g.textAlign = "right"; g.fillStyle = "#ff9a55"; g.fillText("● listening", px + pw - 40, py + 58);
  g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(px, py + 110, pw, 2);
  g.restore();
  // attached clip card
  const a = outQuint(win(C.tell - 0.1, C.tell + 0.45, t));
  g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 40);
  reel(g, px + 50, py + 150, 250, 444, t, { state: { caps: 0, warm: 0, logo: 0 } });
  g.font = `600 34px "${SANS}"`; g.fillStyle = "#f2f2f2"; g.textAlign = "left"; g.textBaseline = "top";
  g.fillText("raw_clip.mp4", px + 340, py + 190);
  g.font = `400 28px "${SANS}"`; g.fillStyle = "rgba(255,255,255,0.55)";
  g.fillText("0:47 · 1080×1920 · no edits", px + 340, py + 245);
  g.restore();
  // what it says
  const ap = outQuint(win(C.tell + 0.2, C.tell + 0.6, t));
  g.save(); g.globalAlpha = ap;
  g.fillStyle = "rgba(255,255,255,0.07)"; K.rr(g, px + 340, py + 320, 520, 150, 26); g.fill();
  g.font = `400 32px "${SANS}"`; g.fillStyle = "#ddd"; g.textBaseline = "top";
  g.fillText("Got your clip.", px + 375, py + 350);
  g.fillText("Tell me what you want.", px + 375, py + 400);
  g.restore();
  // the big mic, pulsing with the voice
  const mp = spring(win(C.tell + 0.15, C.tell + 0.9, t));
  micButton(g, 540, py + 870, 130 * mp, t, mp);
  glowSerif(g, "just tell it.", 540, py + 1140, 104, "#ffe6c4", "rgba(255,150,60,0.9)", t, C.agent);
  vignette(g, 0.55);
};

// c1: cut the pauses — timeline strip under the clip, silent gaps snap shut
function seededWave(n, seed) { const r = rnd(seed); return Array.from({ length: n }, () => 0.25 + 0.75 * r()); }
const WAVE = seededWave(140, 7);
const GAPS = [[0.09, 0.05], [0.2, 0.06], [0.31, 0.04], [0.44, 0.07], [0.55, 0.04], [0.63, 0.05], [0.74, 0.06], [0.84, 0.04], [0.93, 0.03]];
function pauseTimeline(g, x, y, w, t, cut, o = {}) {
  const h = 230;
  g.save();
  g.fillStyle = "rgba(18,18,22,0.95)"; g.strokeStyle = "rgba(255,255,255,0.1)"; g.lineWidth = 2;
  K.rr(g, x, y, w, h, 22); g.fill(); g.stroke();
  g.font = `500 26px "${SANS}"`; g.fillStyle = "rgba(255,255,255,0.5)"; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText("V1", x + 22, y + 62); g.fillText("A1", x + 22, y + 160);
  const tx = x + 80, tw = w - 110;
  // segments of speech between the pauses; the pauses shrink to nothing
  const totalGap = GAPS.reduce((a, [, d]) => a + d, 0);
  const scale = 1 / (1 - totalGap * cut);
  let pos = 0, last = 0;
  const segs = [];
  for (const [s, d] of [...GAPS, [1, 0]]) {
    segs.push([pos, last, s]);                       // [x position, source start, source end]
    pos += (s - last) + d * (1 - cut); last = s + d;
  }
  for (const [px0, s0, s1] of segs) {
    const X = tx + px0 * tw * scale * (1 - totalGap * cut), Wd = (s1 - s0) * tw * scale * (1 - totalGap * cut);
    // V1: clip thumbnails
    g.fillStyle = "#2b3a52"; K.rr(g, X + 1, y + 28, Math.max(2, Wd - 2), 68, 6); g.fill();
    // A1: waveform
    g.fillStyle = "rgba(120,200,140,0.9)";
    const n0 = Math.floor(s0 * WAVE.length), n1 = Math.floor(s1 * WAVE.length);
    for (let i = n0; i < n1; i++) {
      const bx = X + ((i - n0) / Math.max(1, n1 - n0)) * Wd, bh = WAVE[i] * 70;
      g.fillRect(bx, y + 160 - bh / 2, Math.max(1.5, Wd / Math.max(1, n1 - n0) - 1.5), bh);
    }
  }
  // the pauses: red, fading as they close
  if (cut < 1) {
    let pos2 = 0, last2 = 0;
    for (const [s, d] of GAPS) {
      pos2 += (s - last2);
      const X = tx + pos2 * tw * scale * (1 - totalGap * cut), Wd = d * (1 - cut) * tw * scale * (1 - totalGap * cut);
      g.fillStyle = `rgba(255,70,60,${0.55 * (1 - cut)})`; g.fillRect(X, y + 22, Wd, h - 44);
      pos2 += d * (1 - cut); last2 = s + d;
    }
  }
  // thumbnails inside V1
  g.restore();
  // length readout
  g.save(); g.font = `600 34px "${SANS}"`; g.textAlign = "right"; g.textBaseline = "bottom"; g.fillStyle = "#f2f2f2";
  g.fillText(mmss(o.len ?? 47), x + w - 10, y - 14);
  g.font = `400 26px "${SANS}"`; g.fillStyle = "rgba(255,255,255,0.55)"; g.textAlign = "left";
  g.fillText(cut < 0.98 ? `${GAPS.length} pauses found` : `${GAPS.length} pauses cut`, x + 10, y - 16);
  g.restore();
}
S.c1 = (g, t) => {
  voidBg(g, "#09090b", { c: "rgba(90,130,255,0.12)", y: 700, r: 800 });
  const st = editState(t);
  crosshair(g, 540, 1180, t, C.c1 - 0.1, { alpha: 0.5 });
  reel(g, 330, 330, 420, 746, t, { state: st, badge: mmss(st.len) });
  brackets(g, 330, 330, 420, 746, t, C.c1, { len: 54, lw: 3 });
  pauseTimeline(g, 90, 1160, 900, t, st.cut, { len: st.len });
  cmdPill(g, "“Cut the pauses.”", 90, 170, t, C.c1, C.done1, "Done ✓  0:47 → 0:38");
  vignette(g, 0.55);
};

// c2: bold captions — the clip goes full frame
S.c2 = (g, t) => {
  voidBg(g, "#060607");
  const lt = t - C.c2, z = 1 + 0.03 * outCubic(win(0, 2.5, lt));
  const w = 700 * z, h = w * 16 / 9, x = 540 - w / 2, y = 790 - h / 2;
  reel(g, x, y, w, h, t, {});
  brackets(g, x, y, w, h, t, C.c2 + 0.05, { len: 90, pad: 24 });
  cmdPill(g, "“Add bold captions.”", 70, 190, t, C.c2, C.done2, "Done ✓");
  if (t >= C.captions) glowSerif(g, "captions.", 820, 1290, 96, "#ffe6c4", "rgba(255,150,60,0.9)", t, C.captions);
  vignette(g, 0.5);
};

// c3: warmer colour + soft music — the grade wipes across, music slides in under it
S.c3 = (g, t) => {
  voidBg(g, "#0b0806", { c: `rgba(255,140,60,${0.08 + 0.16 * editState(t).warm})`, y: 760, r: 900 });
  const st = editState(t);
  const w = 640, h = w * 16 / 9, x = 540 - w / 2, y = 250;
  // before/after: raw underneath, graded on top, revealed right->left
  reel(g, x, y, w, h, t, { state: { ...st, warm: 0 } });
  const split = x + w * (1 - st.warm);
  g.save(); g.beginPath(); g.rect(split, y, x + w - split, h); g.clip();
  reel(g, x, y, w, h, t, { state: { ...st, warm: 1 } });
  g.restore();
  if (st.warm > 0 && st.warm < 1) {
    g.save(); g.shadowColor = "rgba(255,180,90,1)"; g.shadowBlur = 30; g.fillStyle = "#ffd28a"; g.fillRect(split - 2, y - 30, 4, h + 60); g.restore();
  }
  goldTag(g, "RAW", x + 70, y + 60, t, C.c3 + 0.1, { size: 30, out: C.warmer + 1.1 });
  goldTag(g, "WARM", x + w - 90, y + 60, t, C.warmer + 0.4, { size: 30 });
  // music track
  if (st.music > 0) {
    const my = y + h - 140, mw = w - 60;
    g.save(); g.globalAlpha = st.music; g.translate((1 - st.music) * 300, 0);
    g.fillStyle = "rgba(10,8,6,0.72)"; K.rr(g, x + 30, my, mw, 100, 20); g.fill();
    g.font = `600 26px "${SANS}"`; g.fillStyle = "#ffd28a"; g.textBaseline = "middle"; g.fillText("♪ soft music", x + 56, my + 50);
    const n = 30;
    for (let i = 0; i < n; i++) {
      const v = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.9 + t * 4.2) * Math.cos(i * 0.37 + t * 1.3));
      g.fillStyle = "rgba(255,200,120,0.9)"; const bx = x + 270 + i * ((mw - 260) / n);
      K.rr(g, bx, my + 50 - v * 32, 7, v * 64, 3); g.fill();
    }
    g.restore();
  }
  cmdPill(g, "“Warmer color, and soft music.”", 50, 150, t, C.c3, C.done3, "Done ✓", { size: 36 });
  vignette(g, 0.55);
};

// c4: thirty seconds, end on the logo
S.c4 = (g, t) => {
  voidBg(g, "#08080a", { c: "rgba(236,106,44,0.14)", y: 900, r: 800 });
  const st = editState(t);
  const w = 520, h = w * 16 / 9, x = 540 - w / 2, y = 420;
  // length readout, big, counting down 0:38 -> 0:30
  g.save();
  g.font = `italic 400 170px "${SERIF}"`; g.textAlign = "center"; g.textBaseline = "middle";
  for (const [b, a] of [[50, 0.5], [18, 0.8]]) { g.shadowColor = "rgba(255,150,60,0.9)"; g.shadowBlur = b; g.globalAlpha = a; g.fillStyle = "#ffe6c4"; g.fillText(mmss(st.len), 540, 300); }
  g.shadowBlur = 0; g.globalAlpha = 1; g.fillStyle = "#ffe6c4"; g.fillText(mmss(st.len), 540, 300);
  g.restore();
  reel(g, x, y, w, h, t, { state: st });
  brackets(g, x, y, w, h, t, C.c4 + 0.05, { len: 60, lw: 3 });
  // a 30-second ruler under the clip, with the last beat marked as the logo
  const rx = 160, ry = y + h + 60, rw = 760;
  const rp = outCubic(win(C.thirty, C.thirty + 0.8, t));
  g.save(); g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2;
  for (let i = 0; i <= 30; i++) { const X = rx + (i / 30) * rw * lerp(38 / 30, 1, rp) ; if (X > rx + rw + 2) continue; g.beginPath(); g.moveTo(X, ry); g.lineTo(X, ry + (i % 5 ? 14 : 26)); g.stroke(); }
  g.fillStyle = COL.orange; g.fillRect(rx, ry - 10, rw * Math.min(1, lerp(38 / 30, 1, rp)), 6);
  if (st.logo > 0) { g.globalAlpha = st.logo; g.fillStyle = "#ffd28a"; g.fillRect(rx + rw - 90, ry - 16, 90, 18); }
  g.restore();
  cmdPill(g, "“Thirty seconds. End on the logo.”", 40, 140, t, C.c4, null, null, { size: 34 });
  goldTag(g, "Done ✓", 870, 470, t, C.done4, { size: 34 });
  vignette(g, 0.55);
};

// just: no timeline (struck), no keyframes (struck), just talking (light studio floor)
function nleTimeline(g, cx, cy, t, strikeAt) {
  const s = win(strikeAt + 0.15, strikeAt + 0.9, t);
  const r = rnd(3);
  g.save(); g.translate(cx, cy); g.transform(1, -0.12, 0.22, 1, 0, 0);
  g.fillStyle = "rgba(24,24,30,0.96)"; g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 2;
  K.rr(g, -440, -260, 880, 520, 20); g.fill(); g.stroke();
  const cols = ["#4e7ad6", "#6a4fc9", "#3d9e7a", "#c9894f", "#b04f6a"];
  for (let tr = 0; tr < 6; tr++) {
    let xx = -380;
    while (xx < 400) {
      const w = 50 + r() * 140;
      const fall = s * (60 + r() * 500), rot = s * (r() - 0.5) * 1.4;
      g.save(); g.translate(xx + w / 2, -200 + tr * 76 + 25 + fall); g.rotate(rot); g.globalAlpha = 1 - s;
      g.fillStyle = cols[(tr + Math.floor(xx)) % cols.length]; K.rr(g, -w / 2, -25, w - 6, 50, 6); g.fill();
      g.restore();
      xx += w;
    }
  }
  g.globalAlpha = 1 - s; g.fillStyle = "#ff4a3a"; g.fillRect(-120, -250, 4, 500);
  g.restore();
}
function keyGraph(g, cx, cy, t, strikeAt) {
  const s = win(strikeAt + 0.15, strikeAt + 0.9, t);
  g.save(); g.translate(cx, cy + s * 160); g.transform(1, 0.1, -0.18, 1, 0, 0); g.globalAlpha = 1 - s;
  g.fillStyle = "rgba(24,24,30,0.96)"; g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 2;
  K.rr(g, -440, -250, 880, 500, 20); g.fill(); g.stroke();
  g.strokeStyle = "rgba(255,255,255,0.06)";
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(-420, i * 70); g.lineTo(420, i * 70); g.stroke(); }
  const curve = (col, pts) => {
    g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(...pts[0]);
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; g.bezierCurveTo(x0 + 60, y0, x1 - 60, y1, x1, y1); }
    g.stroke();
    for (const [x, y] of pts) { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = "#fff"; g.fillRect(-9, -9, 18, 18); g.restore(); }
  };
  curve("#4aa0ff", [[-380, 150], [-200, -120], [-20, 60], [160, -170], [380, 40]]);
  curve("#ec6a2c", [[-380, -60], [-160, 120], [60, -40], [250, 150], [380, -110]]);
  g.restore();
}
function strike(g, x0, y0, x1, y1, t, at) {
  const p = outExpo(win(at, at + 0.3, t)), f = 1 - win(at + 0.6, at + 1.0, t);
  if (p <= 0 || f <= 0) return;
  g.save(); g.globalAlpha = f; g.lineCap = "round";
  for (const [lw, a, b] of [[22, 0.18, 40], [8, 0.5, 18], [3, 1, 6]]) {
    g.strokeStyle = `rgba(255,80,60,${a})`; g.lineWidth = lw; g.shadowColor = "rgba(255,80,60,1)"; g.shadowBlur = b;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); g.stroke();
  }
  g.restore();
}
S.just = (g, t) => {
  const phase = t < C.nokey - 0.12 ? 0 : t < C.talking - 0.15 ? 1 : 2;
  if (phase < 2) {
    voidBg(g, "#08080a", { c: "rgba(255,80,60,0.08)", y: 820, r: 800 });
    if (phase === 0) {
      nleTimeline(g, 540, 820, t, C.notimeline);
      strike(g, 140, 1080, 960, 560, t, C.notimeline + 0.2);
      words(g, [["No", C.notimeline - 0.12], ["timeline.", C.notimeline]], 540, 330, t, { size: 76 });
    } else {
      keyGraph(g, 540, 820, t, C.nokey);
      strike(g, 140, 560, 960, 1080, t, C.nokey + 0.2);
      words(g, [["No", C.nokey - 0.12], ["keyframes.", C.nokey]], 540, 330, t, { size: 76 });
    }
    micButton(g, 540, 1340, 70, t, 1);
    vignette(g, 0.6);
    return;
  }
  // light studio floor: a tilted black voice bar with an orange mic button
  const lt = t - (C.talking - 0.15);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#e9e9ec"); gr.addColorStop(0.62, "#d9d9dd"); gr.addColorStop(1, "#c9c9cf");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const sh = g.createRadialGradient(540, 1030, 30, 540, 1030, 520); sh.addColorStop(0, "rgba(0,0,0,0.22)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = sh; g.fillRect(0, 700, W, 700);
  const p = outQuint(win(0, 0.6, lt));
  g.save(); g.translate(540, 900 - (1 - p) * 120); g.rotate(-0.06); g.transform(1, 0, -0.18, 1, 0, 0);
  g.shadowColor = "rgba(0,0,0,0.35)"; g.shadowBlur = 50; g.shadowOffsetY = 40;
  g.fillStyle = "#16161a"; K.rr(g, -400, -70, 700, 140, 18); g.fill(); K.noShadow(g);
  liveWave(g, -360, 0, 600, 90, t, { n: 34, color: "rgba(255,200,120,0.95)" });
  g.fillStyle = COL.orange; K.rr(g, 316, -70, 140, 140, 18); g.fill();
  micGlyph(g, 386, 0, 70);
  g.restore();
  words(g, [["Just", C.talking - 0.25]], 540, 470, t, { size: 76, color: "#222", weight: 300 });
  glowSerif(g, "talking.", 540, 600, 150, "#1c1c1f", "rgba(255,150,60,0.35)", t, C.talking);
  ripple(g, 940, 890, t, C.talking + 0.2);
  ripple(g, 940, 890, t, C.talking + 0.5);
};

// outro: the finished reel, then the asks
S.outro = (g, t) => {
  const lt = t - C.outro;
  voidBg(g, "#08080a", { c: "rgba(236,106,44,0.2)", y: 820, r: 820 });
  const z = 1 + 0.025 * outCubic(win(0, 6, lt));
  const w = 470 * z, h = w * 16 / 9, x = 540 - w / 2, y = 850 - h / 2;
  crosshair(g, 540, 850, t, C.outro - 0.05, { bw: w / 2 + 2, bh: h / 2 + 2, alpha: 0.6 });
  reel(g, x, y, w, h, t, { final: true, logo: 0 });
  brackets(g, x, y, w, h, t, C.outro + 0.15, { len: 70 });
  words(g, [["That's", C.outro]], 540, 200, t, { size: 62 });
  glowSerif(g, "vibe editing.", 540, 300, 120, "#ffe6c4", "rgba(255,150,60,0.9)", t, C.vibe);
  // the asks: follow, join
  trail(g, [[90, 1355], [200, 1285], [300, 1445], [420, 1375], [600, 1315], [760, 1445], [990, 1355]], t, C.follow - 0.3, 1.2, "255,180,90");
  const fp = spring(win(C.follow, C.follow + 0.7, t));
  if (fp > 0) {
    g.save(); g.translate(260, 1385); g.scale(fp, fp);
    g.shadowColor = "rgba(236,106,44,0.8)"; g.shadowBlur = 30;
    g.fillStyle = COL.orange; K.rr(g, -150, -46, 300, 92, 46); g.fill(); K.noShadow(g);
    g.font = `600 40px "${SANS}"`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("Follow", 0, 2);
    g.restore();
  }
  goldTag(g, "JOIN VIBE EDITING", 720, 1385, t, C.join, { size: 38 });
  // a 3D cursor clicks both
  const c1 = C.follow + 0.35, c2 = C.join + 0.5;
  if (t > C.follow - 0.2) {
    const mv = inOutCubic(win(c1 + 0.25, c2 - 0.1, t));
    const cx = lerp(lerp(560, 300, inOutCubic(win(C.follow - 0.2, c1, t))), 800, mv);
    const cy = lerp(lerp(1500, 1400, inOutCubic(win(C.follow - 0.2, c1, t))), 1405, mv);
    const press = Math.max(Math.sin(Math.PI * win(c1, c1 + 0.22, t)), Math.sin(Math.PI * win(c2, c2 + 0.22, t)));
    ripple(g, 300, 1392, t, c1); ripple(g, 800, 1392, t, c2, "232,169,58");
    cursor3d(g, cx, cy, 1.15, press);
  }
  vignette(g, 0.55);
};

// ---------------------------------------------------------------- cuts --
const TD = 0.38;
const CUTS = [
  [0, "open"], [C.tell - 0.16, "tell", "zoom"], [C.c1 - 0.16, "c1", "whip"], [C.c2 - 0.16, "c2", "flash"],
  [C.c3 - 0.16, "c3", "whip"], [C.c4 - 0.16, "c4", "zoom"], [C.just - 0.14, "just", "flash"],
  [C.talking - 0.15, "just", "flash"], [C.outro - 0.14, "outro", "flash"],
];

function frame(g, t) {
  let i = 0;
  while (i + 1 < CUTS.length && t >= CUTS[i + 1][0]) i++;
  const [t0, name, type] = CUTS[i];
  const p = win(t0, t0 + TD, t);
  let moving = false, speed = 0;
  if (i > 0 && p < 1 && type) {
    const prev = CUTS[i - 1][1];
    LA.g.setTransform(1, 0, 0, 1, 0, 0); LB.g.setTransform(1, 0, 0, 1, 0, 0);
    S[prev](LA.g, t); S[name](LB.g, t);
    const e = inOutCubic(p);
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (type === "whip") {
      g.drawImage(LA.c, -W * e, 0); g.drawImage(LB.c, W * (1 - e), 0);
      moving = true; speed = Math.sin(Math.PI * p);
    } else if (type === "zoom") {
      g.save(); g.globalAlpha = 1 - e; g.translate(W / 2, H / 2); g.scale(1 + 0.6 * e, 1 + 0.6 * e); g.drawImage(LA.c, -W / 2, -H / 2); g.restore();
      g.save(); g.globalAlpha = e; g.translate(W / 2, H / 2); g.scale(0.82 + 0.18 * e, 0.82 + 0.18 * e); g.drawImage(LB.c, -W / 2, -H / 2); g.restore();
      moving = true; speed = 0.7 * Math.sin(Math.PI * p);
    } else {    // flash
      g.drawImage(p < 0.4 ? LA.c : LB.c, 0, 0);
      g.fillStyle = `rgba(255,255,255,${1 - Math.abs(p - 0.4) / 0.6})`; g.fillRect(0, 0, W, H);
    }
  } else {
    S[name](g, t);
  }
  K.captions(g, t, { y: 1530, size: 40, weight: 600, family: SANS, color: "#f4f4f4", hi: COL.gold, hiText: "#1a1205",
    box: "rgba(12,12,14,0.62)", boxRadius: 18, maxW: 880 });
  K.grain(g, t, 0.07);
  return { moving, speed };
}

K.run(frame, [`300 40px "${SANS}"`, `500 40px "${SANS}"`, `600 40px "${SANS}"`, `900 40px "${SANS}"`, `italic 400 40px "${SERIF}"`]);
})();

// T01A · Live demo, opening on the finished reel.
// Hook: the polished reel plays full-frame, then rewinds to the raw clip. Body (shared with
// T01B/T01C): the raw clip, the agent listening, four spoken commands each landing on the clip,
// "just talking", and the call to action. Look: the amber-wall / polaroid / neon reference.
(function () {
const { C, W, H } = K;
const ENV = window.ENV;
const env = (t) => ENV.v[Math.max(0, Math.min(ENV.v.length - 1, Math.floor(t * ENV.fps)))] || 0;
const { clamp, win, lerp, outCubic, outQuint, inCubic, inOutCubic, spring } = K;
const SERIF = "EB Garamond", SANS = "Inter", DISPLAY = "Anton", MONO = "Mono";
const GOLD = "#f2b84b", CREAM = "#fff3df", INK = "#1a1006", RED = "#d8322b";

// ------------------------------------------------------------------ backgrounds --
function amberWall() {   // warm plaster wall with grain
  const c = K.makeCanvas(W, H), g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, W * 0.4, H);
  gr.addColorStop(0, "#d79a4a"); gr.addColorStop(0.55, "#b36a26"); gr.addColorStop(1, "#6f3510");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const id = g.getImageData(0, 0, W, H), d = id.data, r = K.rnd(4);
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
}
function windowLight() {  // sun through a four-pane window, cast on the wall
  const c = K.makeCanvas(W, H), g = c.getContext("2d");
  g.filter = "blur(26px)";
  g.fillStyle = "rgba(255,222,160,0.55)";
  const pane = (x, y) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 300, y - 120); g.lineTo(x + 380, y + 330); g.lineTo(x + 80, y + 450); g.closePath(); g.fill(); };
  pane(470, 300); pane(830, 160); pane(560, 820); pane(920, 680);
  g.filter = "none";
  return c;
}
function gridPaper() {
  const c = K.makeCanvas(W, H), g = c.getContext("2d");
  g.fillStyle = "#ecebe4"; g.fillRect(0, 0, W, H);
  for (let x = 0; x <= W; x += 36) { g.fillStyle = x % 180 === 0 ? "rgba(70,80,110,0.2)" : "rgba(70,80,110,0.09)"; g.fillRect(x, 0, 1.5, H); }
  for (let y = 0; y <= H; y += 36) { g.fillStyle = y % 180 === 0 ? "rgba(70,80,110,0.2)" : "rgba(70,80,110,0.09)"; g.fillRect(0, y, W, 1.5); }
  const v = g.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(40,30,20,0.35)");
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}
const BG = { amber: amberWall(), light: windowLight(), grid: gridPaper() };

function drawBg(g, k, t) {
  if (k === "amber") {
    g.drawImage(BG.amber, 0, 0);
    g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = 0.85;
    g.translate(Math.sin(t * 0.25) * 14, Math.cos(t * 0.2) * 10); g.drawImage(BG.light, 0, 0); g.restore();
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(40,15,0,0.45)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  } else if (k === "wood") {
    g.fillStyle = "#24160c"; g.fillRect(0, 0, W, H);
    g.save(); g.filter = "brightness(0.62) contrast(1.1) saturate(0.85)";
    K.drawFit(g, K.footage("rv_wood", t * 0.5, 1, true), 0, 0, W, H); g.restore();
    const v = g.createRadialGradient(W / 2, H * 0.42, H * 0.18, W / 2, H / 2, H * 0.7);
    v.addColorStop(0, "rgba(255,190,110,0.10)"); v.addColorStop(1, "rgba(10,5,0,0.6)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  } else if (k === "grid") {
    g.drawImage(BG.grid, 0, 0);
  } else {   // dark
    g.fillStyle = "#0d0b0a"; g.fillRect(0, 0, W, H);
    const v = g.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.45, H * 0.7);
    v.addColorStop(0, "rgba(120,80,40,0.22)"); v.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }
}

// ------------------------------------------------------------------ helpers --
function neon(g, text, x, y, size, o = {}) {   // rainbow neon type with glow
  g.save();
  K.font(g, size, o.weight || 400, o.family || DISPLAY);
  g.textAlign = o.align || "center"; g.textBaseline = "middle";
  const tw = g.measureText(text).width;
  const x0 = g.textAlign === "center" ? x - tw / 2 : x;
  const gr = g.createLinearGradient(x0, 0, x0 + tw, 0);
  ["#ff5a4d", "#ffa63a", "#ffe24d", "#5cf28a", "#4fc3ff", "#b878ff"].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c));
  g.globalAlpha = o.alpha ?? 1;
  g.shadowColor = "rgba(255,190,120,0.75)"; g.shadowBlur = size * 0.45;
  g.fillStyle = gr; g.fillText(text, x, y);
  g.shadowBlur = size * 0.12; g.shadowColor = "rgba(255,255,255,0.6)"; g.fillText(text, x, y);
  g.restore();
}
function dashedFrame(g, x, y, w, h, t, a = 1) {
  g.save(); g.globalAlpha = a; g.strokeStyle = "rgba(255,240,215,0.55)"; g.lineWidth = 3;
  g.setLineDash([16, 12]); g.lineDashOffset = -t * 18;
  K.rr(g, x, y, w, h, 46); g.stroke(); g.restore();
}
function serif(g, text, x, y, size, o = {}) {
  g.save(); K.font(g, size, o.weight || 500, SERIF);
  if (o.italic) g.font = `italic ${o.weight || 500} ${size}px "${SERIF}"`;
  g.textAlign = o.align || "center"; g.textBaseline = "middle"; g.globalAlpha = o.alpha ?? 1;
  if (o.shadow !== false) { g.shadowColor = "rgba(30,12,0,0.45)"; g.shadowBlur = 14; g.shadowOffsetY = 4; }
  g.fillStyle = o.color || CREAM; g.fillText(text, x, y); g.restore();
}
function tape(g, x, y, w, text, rot, a) {   // red tape banner with small serif words
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
  K.shadow(g, 10, 4, 0.3); g.fillStyle = RED; g.fillRect(-w / 2 * a, -30, w * a, 60); K.noShadow(g);
  g.beginPath(); g.rect(-w / 2, -30, w * a, 60); g.clip();
  g.font = `italic 500 34px "${SERIF}"`; g.fillStyle = "#ffe9d6"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, 0, 2); g.restore();
}
function check(g, x, y, r, p) {   // gold "done" badge
  if (p <= 0) return;
  const s = spring(p);
  g.save(); g.translate(x, y); g.scale(s, s);
  K.shadow(g, 18, 6, 0.4); g.fillStyle = GOLD; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); K.noShadow(g);
  g.strokeStyle = INK; g.lineWidth = r * 0.17; g.lineCap = "round"; g.lineJoin = "round";
  const q = clamp(p * 2.2);
  g.beginPath(); g.moveTo(-r * 0.42, 0); g.lineTo(-r * 0.12, r * 0.3 * Math.min(1, q * 2));
  if (q > 0.5) g.lineTo(lerp(-r * 0.12, r * 0.45, (q - 0.5) * 2), lerp(r * 0.3, -r * 0.35, (q - 0.5) * 2));
  g.stroke(); g.restore();
}
function micGlyph(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 4; g.lineCap = "round";
  K.rr(g, -9, -24, 18, 30, 9); g.fill();
  g.beginPath(); g.arc(0, -4, 17, 0.15, Math.PI - 0.15); g.stroke();
  g.beginPath(); g.moveTo(0, 13); g.lineTo(0, 22); g.moveTo(-9, 22); g.lineTo(9, 22); g.stroke(); g.restore();
}
function micOrb(g, x, y, r, t, a = 1) {
  const e = env(t);
  g.save(); g.globalAlpha = a;
  for (let i = 3; i >= 1; i--) {   // pulse rings driven by the narration
    g.strokeStyle = `rgba(242,184,75,${0.12 * i * (0.3 + e)})`; g.lineWidth = 3;
    g.beginPath(); g.arc(x, y, r + i * 10 + e * 14 * i, 0, 7); g.stroke();
  }
  const gr = g.createRadialGradient(x, y - r * 0.4, 4, x, y, r);
  gr.addColorStop(0, "#3a2614"); gr.addColorStop(1, "#140c06");
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.shadowColor = GOLD; g.shadowBlur = 22 + e * 30; g.strokeStyle = GOLD; g.lineWidth = 4;
  g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.shadowBlur = 0;
  micGlyph(g, x, y + 2, r / 46, GOLD);
  g.restore();
}

// ------------------------------------------------------------------ the reel --
// Rendered at 720x1280 into its own canvas, then placed into each layout.
const RC = K.makeCanvas(720, 1280), rg = RC.getContext("2d");
const REEL_WORDS = [["MY", "GO-TO"], ["LOOK", "IN"], ["30", "SECONDS"]];
function renderReel(lt, st, t) {
  const fr = K.footage("ta_creator", lt);
  rg.save();
  rg.fillStyle = "#111"; rg.fillRect(0, 0, 720, 1280);
  if (fr) {
    rg.filter = "saturate(0.72) contrast(0.9) brightness(1.05)";   // flat, ungraded
    rg.drawImage(fr, 0, 0, 720, 1280);
    if (st.warm > 0) {
      rg.globalAlpha = st.warm; rg.filter = "sepia(0.22) saturate(1.3) contrast(1.1) brightness(1.02)";
      rg.drawImage(fr, 0, 0, 720, 1280);
      rg.globalAlpha = st.warm * 0.22; rg.filter = "none"; rg.globalCompositeOperation = "overlay";
      rg.fillStyle = "#ff9a3c"; rg.fillRect(0, 0, 720, 1280);
      rg.globalCompositeOperation = "source-over";
    }
    rg.filter = "none"; rg.globalAlpha = 1;
  }
  // bold captions inside the reel
  if (st.caps > 0) {
    const k = Math.floor(lt / 0.42) % 6, grp = REEL_WORDS[Math.floor(k / 2)];
    rg.font = `400 92px "${DISPLAY}"`; rg.textBaseline = "middle"; rg.textAlign = "left";
    const sp = 22, ws = grp.map((w) => rg.measureText(w).width), tw = ws[0] + ws[1] + sp;
    let x = 360 - tw / 2;
    grp.forEach((w, i) => {
      const y = 860 + (st.peel || 0) * (140 + i * 90), rot = (st.peel || 0) * (i ? 0.5 : -0.4);
      rg.save(); rg.globalAlpha = st.caps; rg.translate(x + ws[i] / 2, y); rg.rotate(rot);
      if (i === k % 2) { rg.fillStyle = "#ffd23a"; K.rr(rg, -ws[i] / 2 - 12, -54, ws[i] + 24, 104, 10); rg.fill(); }
      rg.lineWidth = 10; rg.strokeStyle = "rgba(0,0,0,0.85)"; rg.lineJoin = "round";
      if (i !== k % 2) rg.strokeText(w, -ws[i] / 2, 4);
      rg.fillStyle = i === k % 2 ? "#111" : "#fff"; rg.fillText(w, -ws[i] / 2, 4);
      rg.restore(); x += ws[i] + sp;
    });
  }
  // music bars
  if (st.music > 0) {
    rg.save(); rg.globalAlpha = st.music; rg.fillStyle = "rgba(0,0,0,0.45)"; K.rr(rg, 36, 1150, 210, 76, 38); rg.fill();
    rg.fillStyle = "#ffd23a";
    for (let i = 0; i < 9; i++) { const h = 14 + 34 * Math.abs(Math.sin(t * 7 + i * 1.3) * Math.sin(t * 2.3 + i)); rg.fillRect(70 + i * 18, 1188 - h / 2, 9, h); }
    rg.font = `600 30px "${SANS}"`; rg.fillStyle = "#fff"; rg.fillText("♪", 50 + 180, 1200);
    rg.restore();
  }
  // logo end card
  if (st.logo > 0) {
    rg.save(); rg.globalAlpha = st.logo;
    const gr = rg.createLinearGradient(0, 0, 0, 1280); gr.addColorStop(0, "#3a1c08"); gr.addColorStop(1, "#140904");
    rg.fillStyle = gr; rg.fillRect(0, 0, 720, 1280);
    const s = 0.9 + 0.1 * outCubic(st.logo);
    rg.translate(360, 620); rg.scale(s, s);
    rg.textAlign = "center"; rg.textBaseline = "middle";
    rg.font = `italic 500 150px "${SERIF}"`; rg.fillStyle = CREAM; rg.fillText("vibe", 0, -40);
    rg.font = `400 112px "${DISPLAY}"`; rg.fillStyle = GOLD; rg.fillText("EDITING", 0, 90);
    rg.fillStyle = GOLD; rg.fillRect(-150, 168, 300, 4);
    rg.restore();
  }
  // rewind: VHS tracking bands, scan lines, tag + timecode
  if (st.rw > 0) {
    const a = st.rw, r = K.rnd(Math.floor(t * 30) * 7 + 3);
    for (let i = 0; i < 6; i++) {
      const y = r() * 1280, h = 8 + r() * 60, dx = (r() - 0.5) * 120 * a;
      rg.drawImage(RC, 0, y, 720, h, dx, y, 720, h);
    }
    rg.globalAlpha = 0.18 * a; rg.fillStyle = "#000";
    for (let y = 0; y < 1280; y += 6) rg.fillRect(0, y, 720, 2);
    rg.globalAlpha = 0.5 * a; rg.fillStyle = "#fff";
    const ny = (t * 2600) % 1400 - 60; rg.fillRect(0, ny, 720, 14 + r() * 10);
    rg.globalAlpha = a;
    rg.font = `700 46px "${MONO}"`; rg.fillStyle = "#fff"; rg.textBaseline = "middle"; rg.textAlign = "left";
    rg.shadowColor = "#000"; rg.shadowBlur = 8;
    if (Math.floor(t * 4) % 2 === 0) rg.fillText("◀◀ REWIND", 44, 90);
    rg.textAlign = "right"; rg.fillText(st.tc || "", 676, 90);
    rg.shadowBlur = 0;
  }
  rg.restore();
}

// ------------------------------------------------------------------ the card (shared element) --
// One card carries the reel from layout to layout. Rects: centre x/y, width (9:16), rotation, polaroid amount.
const CARD = {
  hook: { x: 540, y: 960, w: 1080, rot: 0, pol: 0, r: 0 },
  raw: { x: 540, y: 890, w: 520, rot: -3, pol: 1, r: 4 },
  tell: { x: 540, y: 640, w: 430, rot: 2, pol: 1, r: 4 },
  c1: { x: 540, y: 600, w: 410, rot: 0, pol: 0, r: 22 },
  c2: { x: 540, y: 760, w: 500, rot: 0, pol: 0, r: 26 },
  c3: { x: 590, y: 690, w: 430, rot: 3.5, pol: 1, r: 4 },
  c4: { x: 540, y: 690, w: 440, rot: -2, pol: 1, r: 4 },
  just: { x: 540, y: -700, w: 380, rot: -8, pol: 1, r: 4 },
  outro: { x: 540, y: 655, w: 355, rot: 0, pol: 0, r: 14 },
};
const SCENES = [
  { k: "hook", t: 0, bg: null },
  { k: "raw", t: C.s_raw, bg: "amber", dir: [0, 0] },
  { k: "tell", t: C.s_tell, bg: "wood", dir: [0, 1] },
  { k: "c1", t: C.s_c1, bg: "grid", dir: [0, 1] },
  { k: "c2", t: C.s_c2, bg: "dark", dir: [1, 0] },
  { k: "c3", t: C.s_c3, bg: "amber", dir: [0, 1] },
  { k: "c4", t: C.s_c4, bg: "wood", dir: [-1, 0] },
  { k: "just", t: C.s_just, bg: "dark", dir: [0, 1] },
  { k: "outro", t: C.s_outro, bg: "dark", dir: [0, 0] },
];
const TR = 0.6;   // transition length

function cardRect(t) {
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1].t - 0.3) i++;
  const cur = CARD[SCENES[i].k];
  if (i === 0) return { ...cur, moving: false };
  const p = inOutCubic(win(SCENES[i].t - 0.3, SCENES[i].t - 0.3 + (SCENES[i].k === "raw" ? 0.75 : TR), t));
  const a = CARD[SCENES[i - 1].k];
  const o = {}; for (const k in cur) o[k] = lerp(a[k], cur[k], p);
  o.moving = p > 0.02 && p < 0.98; o.speed = Math.sin(Math.PI * p);
  return o;
}

function reelState(t) {   // what the reel looks like at time t
  const st = { warm: 0, caps: 0, music: 0, logo: 0, rw: 0, peel: 0, tc: "" };
  const rwA = C.now + 0.05, rwB = C.s_raw + 0.15;
  if (t < rwB) {   // hook: finished reel, end card, rewind
    const back = win(rwA, rwB, t);
    st.warm = 1 - inOutCubic(win(rwA + 0.3, rwB, t));
    st.caps = 1 - win(rwA + 0.1, rwA + 0.8, t); st.peel = outCubic(win(rwA + 0.1, rwA + 0.8, t));
    st.music = 1 - win(rwA, rwA + 0.4, t);
    st.logo = win(1.15, 1.4, t) * (1 - win(rwA + 0.12, rwA + 0.35, t));
    st.rw = back > 0 ? Math.min(1, back * 6) * (1 - win(rwB - 0.25, rwB, t)) : 0;
    const sec = Math.round(lerp(30, 0, outCubic(back)));
    st.tc = "00:" + String(sec).padStart(2, "0");
    st.lt = back > 0 ? lerp(4.2, 1.8, inOutCubic(back)) : 2.6 + t * 1.2;
    return st;
  }
  st.lt = 1.8 + ((t - rwB) % 6.4);
  st.warm = inOutCubic(win(C.warmer, C.warmer + 0.8, t));
  st.caps = outCubic(win(C.bold, C.bold + 0.3, t));
  st.music = outCubic(win(C.music - 0.1, C.music + 0.4, t));
  st.logo = t < C.s_just ? outCubic(win(C.logo - 0.05, C.logo + 0.35, t)) : 0;
  if (t > C.s_outro) {   // the finished reel in the viewer: plays, then its end card
    const loop = (t - C.s_outro) % 4.2;
    st.logo = win(3.1, 3.35, loop) * (1 - win(4.0, 4.2, loop));
  }
  return st;
}

function drawCard(g, t, rc) {
  const w = rc.w, h = w * 16 / 9;
  if (rc.y + h / 2 < -50) return;
  g.save(); g.translate(rc.x, rc.y); g.rotate(rc.rot * Math.PI / 180);
  const pad = 22 * rc.pol, padB = 96 * rc.pol;
  if (rc.pol > 0.01) {   // polaroid border
    K.shadow(g, 40, 18, 0.45, "20,8,0");
    g.fillStyle = `rgba(250,246,238,${rc.pol})`; g.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad + padB);
    K.noShadow(g);
    g.globalAlpha = rc.pol;
    g.font = `italic 500 38px "${SERIF}"`; g.fillStyle = "#3b2a1a"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(polLabel(t), 0, h / 2 + padB * 0.52);
    g.globalAlpha = 1;
  } else { K.shadow(g, 46, 20, 0.5, "0,0,0"); g.fillStyle = "#000"; K.rr(g, -w / 2, -h / 2, w, h, rc.r); g.fill(); K.noShadow(g); }
  g.save(); K.rr(g, -w / 2, -h / 2, w, h, rc.r); g.clip();
  g.drawImage(RC, -w / 2, -h / 2, w, h);
  g.restore();
  g.restore();
}
function polLabel(t) {
  if (t < C.s_c1) return "raw · 0:47";
  if (t < C.s_c4) return "warm · soft music";
  return "final · 0:30";
}

// ------------------------------------------------------------------ the agent dock --
const CMD = [
  { a: C.s_tell, line: "tell", text: "I just tell the agent what I want.", done: null },
  { a: C.cut, line: "c1", text: "“Cut the pauses.”", done: C.done1 },
  { a: C.add, line: "c2", text: "“Add bold captions.”", done: C.done2 },
  { a: C.warmer, line: "c3", text: "“Warmer color, and soft music.”", done: C.done3 },
  { a: C.thirty, line: "c4", text: "“Thirty seconds, end on the logo.”", done: C.done4 },
];
function drawDock(g, t) {
  const a = win(C.s_tell - 0.1, C.s_tell + 0.35, t) * (1 - win(C.s_just - 0.2, C.s_just + 0.15, t));
  if (a <= 0) return;
  const y0 = 1270 + 60 * (1 - outCubic(a));
  g.save(); g.globalAlpha = a;
  K.shadow(g, 30, 12, 0.5, "0,0,0");
  g.fillStyle = "rgba(22,15,9,0.86)"; K.rr(g, 70, y0, 940, 168, 84); g.fill(); K.noShadow(g);
  g.strokeStyle = "rgba(242,184,75,0.35)"; g.lineWidth = 2; K.rr(g, 70, y0, 940, 168, 84); g.stroke();
  micOrb(g, 154, y0 + 84, 50, t);
  // which command is live
  let c = null; for (const k of CMD) if (t >= k.a - 0.15) c = k;
  if (c) {
    const words = K.TL.lines[c.line].words;
    let shown = c.text;
    if (c.line === "tell") {   // transcript types with the voice
      const n = words.filter((w) => t >= w.t0 - 0.05).length;
      shown = c.text.split(" ").slice(0, n).join(" ");
    }
    const x = 236, pin = outCubic(win(c.a - 0.15, c.a + 0.15, t));
    g.font = `italic 500 ${c.text.length > 30 ? 36 : 40}px "${SERIF}"`; g.fillStyle = CREAM; g.textBaseline = "middle"; g.textAlign = "left";
    g.globalAlpha = a * pin; g.fillText(shown, x, y0 + 60);
    // live waveform under the transcript
    g.fillStyle = "rgba(242,184,75,0.85)";
    for (let i = 0; i < 44; i++) { const v = env(t - (43 - i) * 0.035); const hh = 4 + v * 40; g.fillRect(x + i * 13, y0 + 118 - hh / 2, 7, hh); }
    g.globalAlpha = a;
    g.font = `600 22px "${SANS}"`; g.fillStyle = "rgba(255,243,223,0.55)"; g.textAlign = "right";
    g.fillText(c.done != null && t >= c.done ? "applied to the edit" : "listening…", 965, y0 + 118);
    if (c.done != null) check(g, 930, y0 + 56, 30, win(c.done, c.done + 0.5, t));
  }
  g.restore();
}

// ------------------------------------------------------------------ layouts --
function layoutRaw(g, t) {
  const a = win(C.s_raw + 0.1, C.s_raw + 0.6, t) * (1 - win(C.s_tell - 0.3, C.s_tell, t));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  serif(g, "the", 300, 200, 64, { italic: true, alpha: a });
  serif(g, "raw clip.", 580, 285, 120, { italic: true, alpha: a, color: "#ffe8b8" });
  g.restore();
}
function rawTape(g, t) {   // taped across the polaroid, so it is drawn after the card
  tape(g, 560, 1250, 660, "raw  ·  0:47  ·  no edits", 0.06, outCubic(win(C.noedits - 0.15, C.noedits + 0.35, t)) * (1 - win(C.s_tell - 0.3, C.s_tell, t)));
}
function layoutTell(g, t) {
  const a = win(C.s_tell + 0.1, C.s_tell + 0.5, t) * (1 - win(C.s_c1 - 0.3, C.s_c1, t));
  if (a <= 0) return;
  serif(g, "just tell the agent", 540, 170, 54, { italic: true, alpha: a });
  // real props on the table
  const pencil = K.object("pencil"), nb = K.object("notebook");
  g.save(); g.globalAlpha = a; K.shadow(g, 24, 12, 0.5, "0,0,0");
  if (nb) { g.save(); g.translate(905, 1030); g.rotate(-0.4); g.drawImage(nb, -170, -140, 340, 340 * nb.height / nb.width); g.restore(); }
  if (pencil) { g.save(); g.translate(170, 1110); g.rotate(0.9); g.drawImage(pencil, -200, -45, 400, 400 * pencil.height / pencil.width); g.restore(); }
  g.restore();
}
function timelineStrip(g, t, x, y, w, a) {   // waveform with silent gaps that snap shut
  const close = inOutCubic(win(C.pauses + 0.15, C.done1 - 0.05, t));
  const segs = [[0, 0.17], [0.23, 0.41], [0.5, 0.63], [0.7, 0.86], [0.92, 1]];
  g.save(); g.globalAlpha = a;
  K.shadow(g, 18, 8, 0.25); g.fillStyle = "#1c1611"; K.rr(g, x - 20, y - 22, w + 40, 150, 18); g.fill(); K.noShadow(g);
  // total length shrinks as gaps close: kept = 0.81 of the original
  const kept = segs.reduce((s, [a0, b0]) => s + b0 - a0, 0), scale = lerp(1, 1 / kept, close) * (kept / 1);
  let cx = x;
  segs.forEach(([a0, b0], i) => {
    const gapBefore = i ? (a0 - segs[i - 1][1]) * w * (1 - close) : 0;
    cx += gapBefore;
    const sw = (b0 - a0) * w * lerp(1, 1 / kept, close);
    g.fillStyle = "rgba(242,184,75,0.9)";
    for (let px = 0; px < sw - 4; px += 8) {
      const v = Math.abs(Math.sin((a0 * 40 + px * 0.06) * 1.7) * Math.sin(px * 0.13 + i)) * 0.8 + 0.2;
      g.fillRect(cx + px, y + 52 - v * 40, 5, v * 80);
    }
    cx += sw;
    if (i < segs.length - 1 && close < 0.98) {   // a grey silent gap
      const gw = (segs[i + 1][0] - b0) * w * (1 - close);
      g.fillStyle = "rgba(255,255,255,0.10)"; g.fillRect(cx, y + 50, gw, 4);
    }
  });
  g.restore();
  void scale;
}
function layoutC1(g, t) {
  const a = win(C.s_c1 + 0.1, C.s_c1 + 0.5, t) * (1 - win(C.s_c2 - 0.3, C.s_c2, t));
  if (a <= 0) return;
  tape(g, 540, 185, 640, "cut the pauses", 0.03, outCubic(win(C.cut - 0.1, C.cut + 0.3, t)) * a);
  timelineStrip(g, t, 150, 1065, 780, a);
  // duration chip 0:47 -> 0:38
  const d = Math.round(lerp(47, 38, inOutCubic(win(C.pauses + 0.15, C.done1 - 0.05, t))));
  g.save(); g.globalAlpha = a; g.fillStyle = INK; K.rr(g, 760, 950, 170, 70, 35); g.fill();
  g.font = `400 46px "${DISPLAY}"`; g.fillStyle = GOLD; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(`0:${String(d).padStart(2, "0")}`, 845, 987); g.restore();
  check(g, 760, 240, 52, win(C.done1, C.done1 + 0.5, t) * a);
}
function layoutC2(g, t) {
  const a = win(C.s_c2 + 0.05, C.s_c2 + 0.5, t) * (1 - win(C.s_c3 - 0.3, C.s_c3, t));
  if (a <= 0) return;
  dashedFrame(g, 540 - 290, 760 - 520, 580, 1040, t, a);
  neon(g, "bold captions", 540, 175, 64, { alpha: a * outCubic(win(C.bold - 0.1, C.bold + 0.3, t)) });
  check(g, 800, 275, 52, win(C.done2, C.done2 + 0.5, t) * a);
}
function layoutC3(g, t) {
  const a = win(C.s_c3 + 0.05, C.s_c3 + 0.5, t) * (1 - win(C.s_c4 - 0.3, C.s_c4, t));
  if (a <= 0) return;
  // "before" polaroid drops in behind (cool, ungraded)
  const p = outCubic(win(C.warmer, C.warmer + 0.6, t));
  if (p > 0) {
    renderBefore(t);
    g.save(); g.globalAlpha = a * p; g.translate(lerp(240, 270, p), lerp(380, 600, p)); g.rotate(-0.16);
    const w = 300, h = w * 16 / 9;
    K.shadow(g, 30, 14, 0.4, "20,8,0"); g.fillStyle = "#faf6ee"; g.fillRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 16 + 70); K.noShadow(g);
    g.drawImage(BC, -w / 2, -h / 2, w, h);
    g.font = `italic 500 30px "${SERIF}"`; g.fillStyle = "#3b2a1a"; g.textAlign = "center"; g.fillText("before", 0, h / 2 + 40);
    g.restore();
  }
  // soft music: a gold waveform ribbon
  const m = outCubic(win(C.soft - 0.1, C.music + 0.3, t));
  if (m > 0) {
    g.save(); g.globalAlpha = a; g.fillStyle = "rgba(22,15,9,0.78)"; K.rr(g, 120, 168, 840 * m, 92, 46); g.fill();
    g.beginPath(); g.rect(120, 168, 840 * m, 92); g.clip();
    g.fillStyle = GOLD; g.font = `600 34px "${SANS}"`; g.textBaseline = "middle"; g.fillText("♪", 150, 214);
    for (let i = 0; i < 52; i++) { const v = 0.25 + 0.75 * Math.abs(Math.sin(t * 3 + i * 0.55) * Math.sin(i * 0.31 + t)); g.fillRect(200 + i * 14, 214 - v * 30, 8, v * 60); }
    g.restore();
  }
  serif(g, "warmer", 205, 1170, 66, { italic: true, alpha: a * outCubic(win(C.warmer, C.warmer + 0.4, t)), color: "#ffe2a8" });
  check(g, 860, 330, 52, win(C.done3, C.done3 + 0.5, t) * a);
}
const BC = K.makeCanvas(360, 640), bg2 = BC.getContext("2d");
function renderBefore(t) {
  const fr = K.footage("ta_creator", 3.0 + (t % 3));
  if (!fr) return;
  bg2.filter = "saturate(0.7) contrast(0.9) brightness(1.05)"; bg2.drawImage(fr, 0, 0, 360, 640); bg2.filter = "none";
}
function layoutC4(g, t) {
  const a = win(C.s_c4 + 0.05, C.s_c4 + 0.5, t) * (1 - win(C.s_just - 0.3, C.s_just, t));
  if (a <= 0) return;
  // real alarm clock + duration snapping to 0:30
  const clock = K.object("clock");
  g.save(); g.globalAlpha = a; K.shadow(g, 26, 12, 0.5, "0,0,0");
  if (clock) { const s = 1 + 0.06 * Math.sin(Math.max(0, t - C.thirty) * 30) * (1 - win(C.thirty, C.thirty + 0.6, t)); g.save(); g.translate(195, 260); g.rotate(-0.12); g.scale(s, s); g.drawImage(clock, -100, -150, 200, 200 * clock.height / clock.width); g.restore(); }
  K.noShadow(g);
  const d = Math.round(lerp(38, 30, inOutCubic(win(C.thirty, C.thirty + 0.5, t))));
  g.fillStyle = "rgba(22,15,9,0.85)"; K.rr(g, 640, 200, 300, 110, 55); g.fill();
  g.font = `400 76px "${DISPLAY}"`; g.fillStyle = GOLD; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(`0:${String(d).padStart(2, "0")}`, 790, 258);
  g.restore();
  const pencil = K.object("pencil");
  if (pencil) { g.save(); g.globalAlpha = a; K.shadow(g, 24, 12, 0.5, "0,0,0"); g.translate(890, 1150); g.rotate(-1.1); g.drawImage(pencil, -200, -45, 400, 400 * pencil.height / pencil.width); g.restore(); }
  check(g, 790, 400, 52, win(C.done4, C.done4 + 0.5, t) * a);
}
function nle(g, x, y, w, t, a) {   // a classic timeline: three tracks of clips + playhead
  g.save(); g.globalAlpha = a;
  g.fillStyle = "#1b1916"; K.rr(g, x, y, w, 250, 16); g.fill();
  const tracks = [["#5d7bd6", [[0.02, 0.2], [0.22, 0.47], [0.5, 0.7], [0.73, 0.97]]], ["#d66a5d", [[0.1, 0.35], [0.55, 0.8]]], ["#5dbb7a", [[0.02, 0.97]]]];
  tracks.forEach(([col, cl], i) => {
    g.font = `600 20px "${SANS}"`; g.fillStyle = "rgba(255,255,255,0.45)"; g.fillText(["V1", "V2", "A1"][i], x + 14, y + 52 + i * 70);
    cl.forEach(([a0, b0]) => { g.fillStyle = col; K.rr(g, x + 60 + a0 * (w - 80), y + 28 + i * 70, (b0 - a0) * (w - 80), 48, 6); g.fill(); });
  });
  g.fillStyle = "#ff5a4d"; g.fillRect(x + 60 + (w - 80) * ((t * 0.12) % 1), y + 10, 3, 230);
  g.restore();
}
function kfGraph(g, x, y, w, t, a) {   // keyframes on a value graph
  g.save(); g.globalAlpha = a;
  g.fillStyle = "#1b1916"; K.rr(g, x, y, w, 220, 16); g.fill();
  g.strokeStyle = "rgba(79,195,255,0.9)"; g.lineWidth = 4; g.beginPath();
  for (let i = 0; i <= 60; i++) { const px = x + 40 + i * (w - 80) / 60, py = y + 110 + Math.sin(i * 0.22) * 60 * Math.cos(i * 0.07); i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.stroke();
  g.fillStyle = "#ffe24d";
  for (let i = 0; i <= 6; i++) { const px = x + 40 + i * 10 * (w - 80) / 60, py = y + 110 + Math.sin(i * 10 * 0.22) * 60 * Math.cos(i * 10 * 0.07); g.save(); g.translate(px, py); g.rotate(Math.PI / 4); g.fillRect(-10, -10, 20, 20); g.restore(); }
  g.restore();
}
function strike(g, x0, y0, x1, y1, p) {
  if (p <= 0) return;
  g.save(); g.strokeStyle = RED; g.lineWidth = 12; g.lineCap = "round";
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); g.stroke(); g.restore();
}
function layoutJust(g, t) {
  const a = win(C.s_just + 0.05, C.s_just + 0.45, t) * (1 - win(C.s_outro - 0.3, C.s_outro, t));
  if (a <= 0) return;
  // scattered italic words, as the voice says them
  const words = [["No", 210, 250, C.timeline - 0.15], ["timeline.", 640, 330, C.timeline], ["No", 300, 980, C.keyframes - 0.2], ["keyframes.", 700, 1050, C.keyframes]];
  words.forEach(([w, x, y, at]) => serif(g, w, x, y, 66, { italic: true, alpha: a * outCubic(win(at - 0.05, at + 0.3, t)) * (1 - win(C.talking - 0.3, C.talking, t)) }));
  const n1 = outCubic(win(C.timeline - 0.15, C.timeline + 0.25, t)), f1 = win(C.timeline + 0.55, C.timeline + 1.0, t);
  if (n1 > 0 && f1 < 1) {
    nle(g, 120, 430 - 30 * f1, 840, t, a * n1 * (1 - f1));
    strike(g, 140, 450, 940, 660, win(C.timeline + 0.25, C.timeline + 0.5, t) * (1 - f1));
  }
  const n2 = outCubic(win(C.keyframes - 0.15, C.keyframes + 0.25, t)), f2 = win(C.keyframes + 0.55, C.keyframes + 1.0, t);
  if (n2 > 0 && f2 < 1) {
    kfGraph(g, 120, 1110 - 30 * f2, 840, t, a * n2 * (1 - f2));
    strike(g, 140, 1130, 940, 1310, win(C.keyframes + 0.25, C.keyframes + 0.5, t) * (1 - f2));
  }
  // just talking: the mic, centre stage, in a dashed screen
  const j = outCubic(win(C.talking - 0.25, C.talking + 0.3, t));
  if (j > 0) {
    dashedFrame(g, 170, 520, 740, 760, t, a * j);
    neon(g, "Just talking.", 540, 640, 104, { alpha: a * j });
    micOrb(g, 540, 1000, 120 * j, t, a);
  }
}
function outroPanel(g, t) {
  const a = win(C.s_outro, C.s_outro + 0.45, t);
  if (a <= 0) return;
  // the actual editing timeline UI, dark
  g.save(); g.globalAlpha = a;
  K.shadow(g, 40, 18, 0.6, "0,0,0"); g.fillStyle = "#141210"; K.rr(g, 80, 160, 920, 1080, 30); g.fill(); K.noShadow(g);
  g.strokeStyle = "rgba(255,240,215,0.12)"; g.lineWidth = 2; K.rr(g, 80, 160, 920, 1080, 30); g.stroke();
  // search bar
  g.fillStyle = "#24201b"; K.rr(g, 130, 196, 820, 74, 37); g.fill();
  const q = K.typed("vibe editing", t, C.s_outro + 0.3, 16);
  g.font = `500 34px "${SANS}"`; g.fillStyle = CREAM; g.textBaseline = "middle"; g.fillText(q + (Math.floor(t * 2.4) % 2 ? "|" : ""), 180, 234);
  g.strokeStyle = GOLD; g.lineWidth = 4; g.beginPath(); g.arc(900, 230, 15, 0, 7); g.stroke(); g.beginPath(); g.moveTo(911, 241); g.lineTo(924, 254); g.stroke();
  // tracks under the viewer
  const ty = 990;
  [["#c98a3a", [[0, 0.24], [0.26, 0.5], [0.52, 0.76], [0.78, 0.98]]], ["#ffd23a", [[0.04, 0.95]]], ["#7a5a3a", [[0, 0.98]]]].forEach(([col, cl], i) => {
    cl.forEach(([a0, b0]) => { g.fillStyle = col; K.rr(g, 130 + a0 * 820, ty + i * 60, (b0 - a0) * 820, 44, 8); g.fill(); });
  });
  g.fillStyle = "#ff5a4d"; g.fillRect(130 + 820 * (((t - C.s_outro) / 4.2) % 1), ty - 14, 3, 190);
  g.restore();
}
function outroCTA(g, t) {
  const a = win(C.s_outro, C.s_outro + 0.45, t);
  if (a <= 0) return;
  neon(g, "That's vibe editing.", 540, 1325, 78, { alpha: a * outCubic(win(C.thats - 0.1, C.thats + 0.3, t)) * (1 - win(C.join - 0.3, C.join, t)) });
  // CTA: follow, then join
  const f = win(C.follow - 0.15, C.follow + 0.3, t);
  const j = outCubic(win(C.join - 0.15, C.join + 0.35, t));
  if (j > 0) {
    g.save(); g.globalAlpha = j; g.fillStyle = "rgba(13,11,10,0.86)"; K.rr(g, 110, 1140, 860, 300, 40); g.fill(); g.restore();
    dashedFrame(g, 110, 1140, 860, 300, t, j);
    neon(g, "JOIN VIBE EDITING", 540, 1230, 92, { alpha: j });
  }
  if (f > 0) {   // follow pill, clicked
    const s = spring(f), y = j > 0 ? 1350 : 1325;
    const click = win(C.follow + 0.55, C.follow + 0.75, t) * (1 - win(C.follow + 0.75, C.follow + 0.95, t));
    g.save(); g.translate(540, y); g.scale(s * (1 - 0.06 * click), s * (1 - 0.06 * click));
    K.shadow(g, 20, 8, 0.5, "0,0,0"); g.fillStyle = GOLD; K.rr(g, -150, -42, 300, 84, 42); g.fill(); K.noShadow(g);
    g.font = `400 46px "${DISPLAY}"`; g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(t > C.follow + 0.75 ? "FOLLOWING ✓" : "+ FOLLOW", 0, 3); g.restore();
    const cp = outCubic(win(C.follow + 0.2, C.follow + 0.6, t));   // cursor
    g.save(); g.translate(lerp(820, 600, cp), lerp(1500, y + 20, cp)); g.fillStyle = "#fff"; g.strokeStyle = "#000"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 46); g.lineTo(12, 35); g.lineTo(22, 56); g.lineTo(31, 52); g.lineTo(21, 31); g.lineTo(37, 31); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
}

// ------------------------------------------------------------------ frame --
function sceneAt(t) { let i = 0; while (i < SCENES.length - 1 && t >= SCENES[i + 1].t - 0.3) i++; return i; }
function frame(g, t) {
  const i = sceneAt(t), sc = SCENES[i];
  let moving = false, speed = 0;
  // background push between layouts
  if (i === 0) { g.fillStyle = "#000"; g.fillRect(0, 0, W, H); }
  else {
    const p = inOutCubic(win(sc.t - 0.3, sc.t - 0.3 + TR, t)), prev = SCENES[i - 1];
    const [dx, dy] = sc.dir || [0, 0];
    if (p < 1 && prev.bg && (dx || dy)) {
      g.save(); g.translate(-dx * W * p, -dy * H * p); drawBg(g, prev.bg, t); g.restore();
      g.save(); g.translate(dx * W * (1 - p), dy * H * (1 - p)); drawBg(g, sc.bg, t); g.restore();
      moving = p > 0.02 && p < 0.98; speed = Math.sin(Math.PI * p);
    } else drawBg(g, sc.bg, t);
  }
  layoutRaw(g, t); layoutTell(g, t); layoutC1(g, t); layoutC2(g, t); layoutC3(g, t); layoutC4(g, t); layoutJust(g, t);
  const st = reelState(t);
  renderReel(st.lt, st, t);
  const rc = cardRect(t);
  outroPanel(g, t);
  drawCard(g, t, rc);
  if (rc.moving) { moving = true; speed = Math.max(speed, rc.speed * 0.8); }
  rawTape(g, t);
  outroCTA(g, t);
  drawDock(g, t);
  // the hook's own label
  if (t < C.s_raw) {
    const a = win(0.15, 0.45, t) * (1 - win(C.now - 0.1, C.now + 0.1, t));
    if (a > 0) { g.save(); g.globalAlpha = a; g.fillStyle = "rgba(20,12,6,0.6)"; K.rr(g, 60, 150, 330, 64, 32); g.fill();
      g.font = `600 30px "${SANS}"`; g.fillStyle = CREAM; g.textBaseline = "middle"; g.fillText("✦ finished reel", 92, 183); g.restore(); }
  }
  K.captions(g, t, { y: 1530, size: 42, weight: 700, family: SANS, color: "#fff7ea", hi: GOLD, hiText: INK,
    box: "rgba(20,12,6,0.62)", maxW: 880 });
  K.grain(g, t, 0.07);
  // fade out at the very end
  const fo = win(K.TL.dur - 0.35, K.TL.dur, t);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
  return { moving, speed };
}

K.run(frame, [`500 40px "${SERIF}"`, `italic 500 40px "${SERIF}"`, `400 40px "${DISPLAY}"`, `700 40px "${SANS}"`, `700 40px "${MONO}"`]);
})();

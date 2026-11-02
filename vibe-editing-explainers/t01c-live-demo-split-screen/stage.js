// T01C · Live demo, split-screen hook.
// Opens on a split view (raw clip | finished reel), then the raw clip travels into the shared
// T01 demo body: one real clip, edited by four spoken commands. Dark green cutting mat, glowing
// lime condensed type, Win95 windows, a dark agent bar, lime click rings. The clip panel is one
// shared element that glides between layouts; the mat pans with it.
(function () {
const { clamp, win, lerp, outCubic, outQuint, inCubic, inOutQuint, spring, rnd } = K;
const C = K.C, W = K.W, H = K.H;
const ENV = window.ENV || [];

const LIME = "#d6ff3c", INK = "#0b2a1f", WHITE = "#f4f7f2", MAT = "#0b4a37";
const NAVY1 = "#00007f", NAVY2 = "#1084d0", GREY = "#c3c3c3", YEL = "#ffe14a";
const DISPLAY = "Anton", UI = "Inter Var", MONO = "Mono";

// ------------------------------------------------------------------ mat --
const TILE = 1440;
const MATTILE = (() => {
  const c = K.makeCanvas(TILE, TILE), g = c.getContext("2d"), r = rnd(11);
  g.fillStyle = MAT; g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 160; i++) {
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
  g.strokeStyle = "rgba(170,240,200,0.13)"; g.lineWidth = 1.6;
  for (const R of [540, 900, 1260]) { g.beginPath(); g.arc(TILE, 0, R, Math.PI / 2, Math.PI); g.stroke(); }
  g.font = "500 24px 'Inter Var'"; g.fillStyle = "rgba(170,240,200,0.30)";
  for (const a of [15, 30, 45, 60, 75]) {
    const ra = Math.PI - a * Math.PI / 180;
    g.beginPath(); g.moveTo(TILE, 0); g.lineTo(TILE + Math.cos(ra) * 1600, Math.sin(ra) * 1600); g.stroke();
    g.fillText(a + "°", TILE + Math.cos(ra) * 980 - 30, Math.sin(ra) * 980 + 8);
  }
  const id = g.getImageData(0, 0, TILE, TILE), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
})();
let matPat = null;
function drawMat(g, ox, oy) {
  if (!matPat) matPat = g.createPattern(MATTILE, "repeat");
  const mx = ((ox % TILE) + TILE) % TILE, my = ((oy % TILE) + TILE) % TILE;
  g.save(); g.translate(-mx, -my); g.fillStyle = matPat; g.fillRect(0, 0, W + TILE, H + TILE); g.restore();
}

// ------------------------------------------------------------------ type --
function txt(g, s, x, y, size, o = {}) {
  g.save();
  g.font = `${o.weight || 400} ${size}px "${o.family || DISPLAY}"`;
  g.textAlign = o.align || "center"; g.textBaseline = o.base || "alphabetic";
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowBlur ?? size * 0.16; }
  else if (o.shadow !== false) { g.shadowColor = "rgba(0,20,12,0.55)"; g.shadowBlur = 18; g.shadowOffsetY = 8; }
  g.fillStyle = o.color || WHITE;
  g.fillText(s, x, y);
  if (o.glow) { g.shadowBlur = (o.glowBlur ?? size * 0.16) * 0.35; g.fillText(s, x, y); }
  g.restore();
}
function measure(g, s, size, fam = DISPLAY, weight = 400) { g.save(); g.font = `${weight} ${size}px "${fam}"`; const w = g.measureText(s).width; g.restore(); return w; }
// a title that springs in at `at` and leaves at `out`
function title(g, s, x, y, size, t, at, o = {}) {
  const p = spring(win(at, at + 0.7, t)), q = o.out != null ? inCubic(win(o.out, o.out + 0.3, t)) : 0;
  if (p <= 0 || q >= 1) return;
  const fit = Math.min(1, (o.maxW || 980) / measure(g, s, size));
  g.save(); g.globalAlpha *= clamp(p * 2.5) * (1 - q);
  g.translate(x, y + 40 * (1 - clamp(p)) - 30 * q); const s2 = (0.82 + 0.18 * p) * (1 + 0.06 * q) * fit; g.scale(s2, s2);
  txt(g, s, 0, 0, size, { ...o, color: o.color || (o.lime ? LIME : WHITE), glow: o.lime ? "rgba(214,255,60,0.75)" : o.glow });
  g.restore();
}
// words of a line appear one by one at their times: [[word, at, colour], ...]
function wordsLine(g, words, x, y, size, t, o = {}) {
  const sp = size * 0.22, ws = words.map(([s]) => measure(g, s, size));
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const fit = Math.min(1, (o.maxW || 980) / tot);
  const q = o.out != null ? inCubic(win(o.out, o.out + 0.3, t)) : 0;
  if (q >= 1) return;
  g.save(); g.translate(x, y); g.scale(fit, fit); g.globalAlpha *= 1 - q; g.translate(0, -30 * q);
  let cx = -tot / 2;
  words.forEach(([s, at, col], i) => {
    const p = spring(win(at, at + 0.55, t));
    if (p > 0) {
      g.save(); g.globalAlpha *= clamp(p * 3);
      g.translate(cx + ws[i] / 2, 26 * (1 - clamp(p))); g.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
      txt(g, s, 0, 0, size, { color: col || WHITE, glow: col === LIME ? "rgba(214,255,60,0.7)" : null });
      g.restore();
    }
    cx += ws[i] + sp;
  });
  g.restore();
}

// ------------------------------------------------------------------ ui bits --
function clickRing(g, x, y, t, at, r0 = 22) {
  const p = win(at, at + 0.75, t);
  if (p <= 0 || p >= 1) return;
  const e = outCubic(p);
  g.save();
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
// Win95 window frame; returns the client rect and the close-button centre
function win95(g, x, y, w, h, ttl, o = {}) {
  const th = o.th || 46;
  g.save();
  g.shadowColor = "rgba(0,15,8,0.55)"; g.shadowBlur = 40; g.shadowOffsetY = 22;
  g.fillStyle = GREY; g.fillRect(x, y, w, h); K.noShadow(g);
  bevel(g, x, y, w, h);
  const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, NAVY1); gr.addColorStop(1, NAVY2);
  g.fillStyle = gr; g.fillRect(x + 5, y + 5, w - 10, th);
  g.font = `700 ${Math.round(th * 0.5)}px "${UI}"`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(ttl, x + 18, y + 5 + th / 2 + 1);
  if (o.right) { g.textAlign = "right"; g.font = `700 ${Math.round(th * 0.5)}px "${MONO}"`; g.fillStyle = o.rightColor || "#fff"; g.fillText(o.right, x + w - 10 - 3 * (th - 8), y + 5 + th / 2 + 1); }
  const bs = th - 12;
  ["_", "□", "×"].forEach((s, i) => {
    const bx = x + w - 10 - (3 - i) * (bs + 4) + 2, by = y + 11;
    bevel(g, bx, by, bs, bs - 2);
    g.fillStyle = "#000"; g.textAlign = "center"; g.font = `700 ${Math.round(bs * 0.75)}px "${UI}"`;
    g.fillText(s, bx + bs / 2, by + bs / 2 - (s === "_" ? 6 : 1));
  });
  g.restore();
  return { x: x + 8, y: y + th + 12, w: w - 16, h: h - th - 20, close: [x + w - 10 - (bs + 4) + 2 + bs / 2, y + 11 + bs / 2] };
}
function check(g, x, y, s, col = INK, lw = 0.16) {
  g.save(); g.strokeStyle = col; g.lineWidth = s * lw; g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); g.moveTo(x - s * 0.36, y + s * 0.02); g.lineTo(x - s * 0.1, y + s * 0.28); g.lineTo(x + s * 0.38, y - s * 0.26); g.stroke(); g.restore();
}
function pillChip(g, s, x, y, size, o = {}) {
  g.save(); g.font = `800 ${size}px "${UI}"`;
  const tw = g.measureText(s).width, ph = size * 1.7, pw = tw + size * 1.4 + (o.tick ? size * 1.1 : 0);
  g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
  if (o.glow) { g.shadowColor = "rgba(214,255,60,0.6)"; g.shadowBlur = 30; } else { g.shadowColor = "rgba(0,15,8,0.5)"; g.shadowBlur = 24; g.shadowOffsetY = 10; }
  g.fillStyle = o.bg || LIME; K.rr(g, -pw / 2, -ph / 2, pw, ph, ph / 2); g.fill(); K.noShadow(g);
  if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = 3; g.stroke(); }
  g.fillStyle = o.fg || INK; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(s, o.tick ? -size * 0.45 : 0, 2);
  if (o.tick) check(g, pw / 2 - size * 1.05, 0, size * 0.95, o.fg || INK);
  g.restore();
}
function popChip(g, s, x, y, size, t, at, o = {}) {
  const p = spring(win(at, at + 0.7, t)), q = o.out != null ? inCubic(win(o.out, o.out + 0.25, t)) : 0;
  if (p <= 0 || q >= 1) return;
  g.save(); g.globalAlpha *= clamp(p * 3) * (1 - q); g.translate(x, y); g.scale(p * (1 - 0.3 * q), p * (1 - 0.3 * q));
  pillChip(g, s, 0, 0, size, o); g.restore();
}
function envAt(t) { const i = Math.floor(t * 60); return ENV[i] || 0; }
function micButton(g, x, y, r, t, o = {}) {
  const lvl = clamp(envAt(t)), live = o.live ?? 1;
  g.save();
  for (let k = 0; k < 3; k++) {                       // breathing rings driven by the voice
    const ph = ((t * 0.9 + k / 3) % 1);
    g.strokeStyle = `rgba(214,255,60,${(0.45 * (1 - ph)) * live})`; g.lineWidth = 3;
    g.beginPath(); g.arc(x, y, r * (1.05 + ph * 0.9 + lvl * 0.25), 0, 7); g.stroke();
  }
  g.shadowColor = "rgba(214,255,60,0.8)"; g.shadowBlur = 30 + 40 * lvl * live;
  g.fillStyle = LIME; g.beginPath(); g.arc(x, y, r * (1 + 0.06 * lvl * live), 0, 7); g.fill(); K.noShadow(g);
  // mic glyph
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = r * 0.09; g.lineCap = "round";
  K.rr(g, x - r * 0.18, y - r * 0.5, r * 0.36, r * 0.62, r * 0.18); g.fill();
  g.beginPath(); g.arc(x, y - r * 0.08, r * 0.32, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.beginPath(); g.moveTo(x, y + r * 0.25); g.lineTo(x, y + r * 0.45); g.moveTo(x - r * 0.18, y + r * 0.47); g.lineTo(x + r * 0.18, y + r * 0.47); g.stroke();
  g.restore();
}
// the narration as a scrolling live waveform (newest on the right)
function liveWave(g, x, y, w, h, t, o = {}) {
  const n = o.bars || 44, step = w / n;
  g.save(); g.fillStyle = o.color || LIME; if (o.glow !== false) { g.shadowColor = "rgba(214,255,60,0.55)"; g.shadowBlur = 12; }
  for (let i = 0; i < n; i++) {
    const tt = t - (n - 1 - i) * 0.035;
    const v = Math.max(0.06, clamp(envAt(tt)) * (0.7 + 0.3 * Math.sin(i * 1.7 + tt * 9)));
    const bh = h * v;
    K.rr(g, x + i * step + step * 0.2, y - bh / 2, step * 0.6, bh, step * 0.3); g.fill();
  }
  g.restore();
}

// ------------------------------------------------------------------ the clip --
// One real clip (Mixkit 34478), cropped vertical. lt = local clip time.
function creator(lt) { return K.footage("tc_creator", 1.0 + (((lt % 7.2) + 7.2) % 7.2)); }
const RAW_F = "saturate(0.72) contrast(0.9) brightness(1.0)";
const WARM_F = "saturate(1.3) sepia(0.22) contrast(1.08) brightness(1.04)";
const CAPS = ["MY", "GO-TO", "KIT", "FOR", "EVERY", "SHOOT"];
let EXTRA_F = "";   // appended to every clip filter (e.g. a blur for the hook preview)
function drawImg(g, im, x, y, w, h, filter, zoom = 1) {
  if (!im) return;
  g.filter = filter + EXTRA_F; K.drawFit(g, im, x, y, w, h, { zoom, fx: 0.5, fy: 0.42 }); g.filter = "none";
}
// st: {warm 0..1 | wipe 0..1, caps 0..1, music 0..1, cut 0/1, bug 0..1, logo 0..1, tc}
function drawClip(g, x, y, w, h, lt, st = {}) {
  g.save(); K.rr(g, x, y, w, h, w * 0.045); g.clip();
  g.fillStyle = "#111"; g.fillRect(x, y, w, h);
  let z = 1;
  if (st.cut) { const ph = (lt % 1.45) / 1.45; z = 1.0 + 0.05 * Math.exp(-ph * 9) + (Math.floor(lt / 1.45) % 2 ? 0.04 : 0); }
  const im = creator(st.cut ? lt * 1.15 : lt);
  if (st.wipe != null) {
    drawImg(g, im, x, y, w, h, RAW_F, z);
    if (st.wipe > 0) { g.save(); g.beginPath(); g.rect(x, y, w * st.wipe, h); g.clip(); drawImg(g, im, x, y, w, h, WARM_F, z); g.restore(); }
  } else {
    const wm = st.warm || 0;
    if (wm < 1) drawImg(g, im, x, y, w, h, RAW_F, z);
    if (wm > 0) { const a0 = g.globalAlpha; g.globalAlpha = a0 * wm; drawImg(g, im, x, y, w, h, WARM_F, z); g.globalAlpha = a0; }
  }
  if (st.wipe != null && st.wipe > 0 && st.wipe < 1) {            // the wipe handle
    const wx = x + w * st.wipe;
    g.save(); g.shadowColor = "rgba(214,255,60,0.9)"; g.shadowBlur = 20; g.fillStyle = LIME; g.fillRect(wx - 3, y, 6, h);
    g.beginPath(); g.arc(wx, y + h * 0.5, w * 0.06, 0, 7); g.fill(); g.restore();
  }
  if ((st.caps || 0) > 0) {                                    // bold word-by-word captions
    const k = Math.floor(lt / 0.42), word = CAPS[k % CAPS.length], f = (lt % 0.42) / 0.42;
    const s = w * 0.15 * (0.9 + 0.1 * spring(clamp(f * 2.5))) * (0.6 + 0.4 * st.caps);
    g.save(); g.globalAlpha *= clamp(st.caps * 2); g.translate(x + w / 2, y + h * 0.7);
    g.font = `400 ${s}px "${DISPLAY}"`; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = s * 0.14; g.strokeStyle = "#111"; g.lineJoin = "round"; g.strokeText(word, 0, 0);
    g.fillStyle = k % 3 === 1 ? YEL : "#fff"; g.fillText(word, 0, 0);
    g.restore();
  }
  if ((st.music || 0) > 0) {                                   // soft music bars along the bottom
    const n = 22, bw = w * 0.82 / n, bx0 = x + w * 0.09, by = y + h * 0.93;
    g.save(); g.globalAlpha *= clamp(st.music * 1.5); g.fillStyle = "rgba(214,255,60,0.95)";
    for (let i = 0; i < n; i++) {
      const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9 + lt * 3.1) * Math.cos(i * 0.37 - lt * 1.7));
      const bh = h * 0.055 * v * st.music;
      K.rr(g, bx0 + i * bw + bw * 0.2, by - bh, bw * 0.6, bh, bw * 0.3); g.fill();
    }
    g.restore();
  }
  if ((st.bug || 0) > 0) {                                     // small logo bug
    g.save(); g.globalAlpha *= st.bug; pillChip(g, "vibe editing", x + w * 0.73, y + h * 0.05, w * 0.045, { bg: "rgba(10,25,18,0.75)", fg: LIME }); g.restore();
  }
  if (st.tc) {                                                 // timecode readout
    g.save(); g.font = `600 ${Math.round(w * 0.045)}px "${MONO}"`; g.textAlign = "left"; g.textBaseline = "middle";
    const tw = g.measureText(st.tc).width;
    g.fillStyle = "rgba(0,0,0,0.6)"; K.rr(g, x + w * 0.05, y + h * 0.035, tw + w * 0.06, w * 0.08, w * 0.02); g.fill();
    g.fillStyle = st.tcColor || "#fff"; g.fillText(st.tc, x + w * 0.08, y + h * 0.035 + w * 0.04); g.restore();
  }
  if ((st.logo || 0) > 0) {                                    // the end card wipes up from below
    const e = outQuint(st.logo), cy = y + h * (1 - e);
    g.save(); g.beginPath(); g.rect(x, cy, w, h); g.clip();
    g.fillStyle = "#0a1d15"; g.fillRect(x, y, w, h);
    g.strokeStyle = "rgba(170,240,200,0.14)"; g.lineWidth = 1.5; g.beginPath();
    for (let v = 0; v < w; v += w / 10) { g.moveTo(x + v, y); g.lineTo(x + v, y + h); }
    for (let v = 0; v < h; v += w / 10) { g.moveTo(x, y + v); g.lineTo(x + w, y + v); }
    g.stroke();
    const s = w * 0.26;
    g.fillStyle = LIME; g.beginPath(); g.moveTo(x + w / 2 - s * 0.22, y + h * 0.36 - s * 0.25); g.lineTo(x + w / 2 + s * 0.28, y + h * 0.36); g.lineTo(x + w / 2 - s * 0.22, y + h * 0.36 + s * 0.25); g.closePath(); g.fill();
    txt(g, "VIBE", x + w / 2, y + h * 0.55, s, { color: LIME, glow: "rgba(214,255,60,0.7)" });
    txt(g, "EDITING", x + w / 2, y + h * 0.55 + s * 0.85, s * 0.72, { color: WHITE });
    g.restore();
  }
  g.restore();
  g.save(); g.strokeStyle = "rgba(244,247,242,0.95)"; g.lineWidth = 6; K.rr(g, x, y, w, h, w * 0.045); g.stroke(); g.restore();
}
// clip panel in a tilted frame (shadow + 3D-ish skew)
function panel(g, cx, cy, w, rot, lt, st, o = {}) {
  const h = w * 16 / 9;
  g.save(); g.globalAlpha *= o.a ?? 1;
  g.translate(cx, cy); g.rotate(rot * Math.PI / 180); g.transform(1, -0.02, 0.035, 1, 0, 0);
  g.save(); g.shadowColor = "rgba(0,15,8,0.6)"; g.shadowBlur = 60; g.shadowOffsetY = 34; g.fillStyle = "#000";
  K.rr(g, -w / 2, -h / 2, w, h, w * 0.045); g.fill(); g.restore();
  drawClip(g, -w / 2, -h / 2, w, h, lt, st);
  if (o.after) o.after(g, w, h);
  g.restore();
}
// a real cut-out object with something painted into its measured screen
function object(g, key, x, y, w, rot, o = {}) {
  const im = K.object(key); if (!im) return;
  const h = w * im.height / im.width;
  g.save(); g.globalAlpha *= o.a ?? 1; g.translate(x, y); g.rotate(rot * Math.PI / 180);
  g.shadowColor = "rgba(0,15,8,0.55)"; g.shadowBlur = 60; g.shadowOffsetY = 34;
  g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
  const S = K.A.objects[key].screen;
  if (o.screen && S) {
    const L = S.len * w * 0.985, Wd = S.wid * w * 0.97;
    g.translate(-w / 2 + S.cx * w, -h / 2 + S.cy * w);
    g.rotate(S.ang * Math.PI / 180 - Math.PI / 2);
    const sw = Wd, sh = L;
    g.save(); K.rr(g, -sw / 2, -sh / 2, sw, sh, sw * 0.12); g.clip();
    g.fillStyle = "#0b0b0d"; g.fillRect(-sw / 2, -sh / 2, sw, sh);
    o.screen(g, sw, sh);
    const gl = g.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2);
    gl.addColorStop(0, "rgba(255,255,255,0.10)"); gl.addColorStop(0.5, "rgba(255,255,255,0)");
    g.fillStyle = gl; g.fillRect(-sw / 2, -sh / 2, sw, sh);
    g.restore();
  }
  g.restore();
}

// ------------------------------------------------------------------ choreography --
// Shared clip panel: [time, cx, cy, w, rot]; each move eases over 0.75 s from its time.
const SLOT_L = [295, 925, 440], SLOT_R = [785, 925, 440];
const PK = [
  [0, SLOT_L[0], SLOT_L[1], SLOT_L[2], 0],
  [C.h_end + 0.02, 540, 885, 600, -2],
  [C.tell - 0.2, 540, 690, 440, -3],
  [C.c1 - 0.2, 540, 640, 380, 3],
  [C.c2 - 0.2, 540, 830, 610, -2],
  [C.c3 - 0.2, 540, 790, 560, 1.5],
  [C.c4 - 0.2, 540, 975, 440, -2],
  [C.just - 0.1, 870, 470, 230, 7],
];
const MOVE = 0.75;
function panelAt(t) {
  let i = 0; while (i < PK.length - 1 && t >= PK[i + 1][0]) i++;
  const k = PK[i], pr = PK[Math.max(0, i - 1)];
  const p = i === 0 ? 1 : win(k[0], k[0] + MOVE, t), e = inOutQuint(p);
  return { cx: lerp(pr[1], k[1], e), cy: lerp(pr[2], k[2], e), w: lerp(pr[3], k[3], e), rot: lerp(pr[4], k[4], e),
           moving: p > 0.04 && p < 0.96, speed: Math.sin(Math.PI * p) };
}
// the mat pans with the camera
const MK = [[0, 0, 0], [C.h_end, 120, -320], [C.tell, 300, -520], [C.c1, 300, -820], [C.c2, 80, -1050],
            [C.c3, 80, -1320], [C.c4, 260, -1560], [C.just, 260, -1880], [C.outro, 40, -2120]];
function matAt(t) {
  let i = 0; while (i < MK.length - 1 && t >= MK[i + 1][0]) i++;
  const k = MK[i], pr = MK[Math.max(0, i - 1)], e = i === 0 ? 1 : inOutQuint(win(k[0], k[0] + MOVE, t));
  return [lerp(pr[1], k[1], e), lerp(pr[2], k[2], e)];
}
// the clip's edit state over time (everything the commands have done so far)
function clipState(t) {
  return {
    cut: t >= C.c1_pauses + 0.9 ? 1 : 0,
    caps: clamp(win(C.c2_captions - 0.05, C.c2_captions + 0.35, t)),
    warm: t >= C.c3_warmer + 1.1 ? 1 : 0,
    wipe: t >= C.c3_warmer && t < C.c3_warmer + 1.1 ? inOutQuint(win(C.c3_warmer, C.c3_warmer + 1.0, t)) : null,
    music: clamp(win(C.c3_music, C.c3_music + 0.6, t)),
    logo: clamp(win(C.c4_logo - 0.05, C.c4_logo + 0.6, t)),
    bug: clamp(win(C.c4_logo, C.c4_logo + 0.4, t)),
  };
}
function dur(t) {
  if (t < C.c1_pauses + 0.2) return "0:47";
  if (t < C.c1_pauses + 0.95) { const v = Math.round(lerp(47, 38, inOutQuint(win(C.c1_pauses + 0.2, C.c1_pauses + 0.95, t)))); return "0:" + v; }
  if (t < C.c4_thirty + 0.1) return "0:38";
  if (t < C.c4_thirty + 0.8) { const v = Math.round(lerp(38, 30, inOutQuint(win(C.c4_thirty + 0.1, C.c4_thirty + 0.8, t)))); return "0:" + v; }
  return "0:30";
}

// ---------------------------------------------------------------- hook --
// "Raw clip on the left. Finished reel on the right."
function hook(g, t) {
  const inP = outQuint(win(0, 0.6, t)), outP = inOutQuint(win(C.h_end - 0.05, C.h_end + 0.55, t));
  if (outP >= 1) return;
  // the split window
  g.save(); g.globalAlpha *= 1 - outP;
  const sc = (0.94 + 0.06 * inP) * (1 + 0.05 * outP);
  g.translate(540, 925); g.scale(sc, sc); g.rotate(-1.2 * Math.PI / 180); g.translate(-540, -925);
  const r = win95(g, 40, 440, 1000, 980, "split_view.exe", { right: "RAW | FINISHED", rightColor: LIME });
  g.fillStyle = "#0a1712"; g.fillRect(r.x, r.y, r.w, r.h);
  g.restore();
  // right slot: a dim, blurred preview until the finished reel wipes in on "finished"
  if (outP < 1) {
    const [cx, cy, w] = SLOT_R, h = w * 16 / 9;
    g.save(); g.globalAlpha *= 0.35 * clamp(inP * 2) * (1 - outP); EXTRA_F = " blur(16px) brightness(0.7)"; g.translate(cx, cy);
    drawClip(g, -w / 2, -h / 2, w, h, t, { warm: 1 }); EXTRA_F = ""; g.restore();
    g.save(); g.globalAlpha *= clamp(inP * 2) * (1 - outP) * (1 - clamp(win(C.h_finished - 0.15, C.h_finished + 0.2, t)));
    txt(g, "?", cx, cy + 60, 220, { color: "rgba(244,247,242,0.7)" }); g.restore();
  }
  const rp = inOutQuint(win(C.h_finished - 0.15, C.h_finished + 0.45, t));
  if (rp > 0) {
    const [cx, cy, w] = SLOT_R, h = w * 16 / 9;
    g.save(); g.globalAlpha *= 1 - outP;
    g.translate(600 * outCubic(outP), 0);
    g.beginPath(); g.rect(540, 0, (cx + w / 2 + 20 - 540) * rp, H); g.clip();
    g.translate(cx, cy);
    drawClip(g, -w / 2, -h / 2, w, h, t, { warm: 1, caps: 1, music: 1, bug: 1, cut: 1, tc: "0:30", tcColor: LIME });
    g.restore();
  }
  // divider with handle
  g.save(); g.globalAlpha *= clamp(inP * 2) * (1 - outP);
  const dx = 540 + 600 * outCubic(outP);
  g.shadowColor = "rgba(214,255,60,0.9)"; g.shadowBlur = 24; g.fillStyle = LIME;
  g.fillRect(dx - 3, 520, 6, 810);
  g.beginPath(); g.arc(dx, 925, 34, 0, 7); g.fill(); K.noShadow(g);
  g.fillStyle = INK; g.beginPath(); g.moveTo(dx - 8, 911); g.lineTo(dx - 22, 925); g.lineTo(dx - 8, 939); g.fill();
  g.beginPath(); g.moveTo(dx + 8, 911); g.lineTo(dx + 22, 925); g.lineTo(dx + 8, 939); g.fill();
  g.restore();
  // labels
  g.save(); g.globalAlpha *= 1 - outP;
  title(g, "RAW", 295, 380, 150, t, C.h_raw + 0.05);
  title(g, "FINISHED", 785, 380, 150, t, C.h_finished, { lime: true });
  popChip(g, "no edits", 295, 1360, 30, t, C.h_left, { bg: "rgba(20,30,25,0.85)", fg: WHITE });
  popChip(g, "captions · grade · music", 785, 1360, 30, t, C.h_right, { glow: true });
  g.restore();
}

// ---------------------------------------------------------------- body scenes --
function sRaw(g, t) {             // "Here's the raw clip. No edits."
  const out = C.tell - 0.2;
  wordsLine(g, [["THE", C.r_raw - 0.25], ["RAW", C.r_raw, LIME], ["CLIP", C.r_clip, LIME]], 540, 255, 160, t, { out });
}
function rawTag(g, t, pn) {       // a Win95 tag bar riding the panel
  const p = spring(win(C.r_no - 0.1, C.r_no + 0.5, t)), q = inCubic(win(C.tell - 0.25, C.tell + 0.05, t));
  if (p <= 0 || q >= 1) return;
  g.save(); g.globalAlpha *= clamp(p * 3) * (1 - q);
  g.translate(pn.cx, pn.cy - pn.w * 8 / 9 - 40); g.rotate(pn.rot * Math.PI / 180); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  const w = 560, h = 64;
  bevel(g, -w / 2, -h / 2, w, h);
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0); gr.addColorStop(0, NAVY1); gr.addColorStop(1, NAVY2);
  g.fillStyle = gr; g.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
  g.font = `700 30px "${UI}"`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("RAW  ·  0:47  ·  NO EDITS", 0, 2);
  g.restore();
}
// agent panel (tell) that morphs into the command bar (c1..c4)
const BAR = [60, 150, 960, 104], AGENT = [60, 1140, 960, 290];
function agent(g, t) {
  const inP = outQuint(win(C.tell - 0.15, C.tell + 0.45, t));
  const m = inOutQuint(win(C.c1 - 0.25, C.c1 + 0.45, t));
  const outP = inCubic(win(C.just - 0.15, C.just + 0.25, t));
  if (inP <= 0 || outP >= 1) return;
  const x = lerp(AGENT[0], BAR[0], m), y = lerp(AGENT[1], BAR[1], m) + 260 * (1 - inP), w = lerp(AGENT[2], BAR[2], m), h = lerp(AGENT[3], BAR[3], m);
  g.save(); g.globalAlpha *= clamp(inP * 2) * (1 - outP);
  g.shadowColor = "rgba(0,15,8,0.6)"; g.shadowBlur = 50; g.shadowOffsetY = 24;
  g.fillStyle = "#0e1512"; K.rr(g, x, y, w, h, 28); g.fill(); K.noShadow(g);
  g.strokeStyle = "rgba(214,255,60,0.55)"; g.lineWidth = 2.5; g.stroke();
  // header (fades as it becomes the bar)
  g.globalAlpha *= 1;
  g.save(); g.globalAlpha *= 1 - m;
  g.font = `600 26px "${MONO}"`; g.fillStyle = LIME; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("● agent", x + 34, y + 40); g.fillStyle = "rgba(244,247,242,0.55)"; g.fillText("· listening", x + 180, y + 40);
  g.restore();
  // mic: big in the panel, small in the bar
  const mr = lerp(66, 34, m), mx = x + lerp(130, 62, m), my = y + lerp(170, h / 2, m);
  micButton(g, mx, my, mr, t);
  if (m < 1) {   // live waveform + transcript (tell)
    g.save(); g.globalAlpha *= 1 - m;
    liveWave(g, x + 240, y + 150, 680, 120, t);
    const words = K.TL.lines.tell.words;
    g.font = `600 36px "${UI}"`; g.textAlign = "left"; g.textBaseline = "middle";
    let cx = x + 240;
    for (const wd of words) {
      const p = clamp(win(wd.t0 - 0.05, wd.t0 + 0.15, t)); if (p <= 0) break;
      g.globalAlpha = (1 - m) * p; g.fillStyle = WHITE; g.fillText(wd.raw, cx, y + 245 + 6 * (1 - p));
      cx += g.measureText(wd.raw + " ").width;
    }
    g.restore();
  }
  if (m > 0) {   // the bar: the current spoken command, word by word, then DONE ✓
    const cmds = ["c1", "c2", "c3", "c4"];
    let cur = null; for (const id of cmds) if (t >= K.TL.lines[id].t0 - 0.15) cur = id;
    if (cur) {
      const L = K.TL.lines[cur], words = L.words.filter((w) => w.w !== "done");
      const doneW = L.words.find((w) => w.w === "done");
      const nextT = cur === "c4" ? C.just : K.TL.lines[cmds[cmds.indexOf(cur) + 1]].t0 - 0.15;
      const fadeIn = clamp(win(L.t0 - 0.15, L.t0 + 0.1, t)), fadeOut = clamp(win(nextT - 0.2, nextT, t));
      g.save(); g.globalAlpha *= m * fadeIn * (1 - fadeOut);
      g.font = `700 38px "${UI}"`; g.textAlign = "left"; g.textBaseline = "middle";
      let cx = x + 132; const cy = y + h / 2 + 2 - 14 * fadeOut;
      g.fillStyle = "rgba(244,247,242,0.5)"; g.fillText("“", cx - 18, cy);
      for (const wd of words) {
        const p = clamp(win(wd.t0 - 0.05, wd.t0 + 0.15, t)); if (p <= 0) break;
        g.save(); g.globalAlpha *= p; g.fillStyle = WHITE; g.fillText(wd.raw.replace(/,$/, ","), cx, cy + 6 * (1 - p)); g.restore();
        cx += g.measureText(wd.raw + " ").width;
      }
      if (doneW) {
        const dp = spring(win(doneW.t0, doneW.t0 + 0.6, t));
        if (dp > 0) {
          g.save(); g.translate(x + w - 110, cy); g.scale(dp, dp);
          pillChip(g, "DONE", 0, 0, 28, { tick: true, glow: true }); g.restore();
          clickRing(g, x + w - 110, cy, t, doneW.t0);
        }
      }
      g.restore();
    }
  }
  g.restore();
}
function sTell(g, t) {
  title(g, "JUST TALK.", 540, 245, 170, t, C.t_tell - 0.1, { lime: true, out: C.c1 - 0.3 });
}
// c1: the timeline dialog, pauses snapping shut
const SEGS = [0.17, 0.12, 0.2, 0.14, 0.16], GAPS = [0.05, 0.045, 0.06, 0.05];
function sCut(g, t) {
  const p = spring(win(C.c1_cut - 0.15, C.c1_cut + 0.5, t)), q = inCubic(win(C.c2 - 0.3, C.c2 + 0.1, t));
  if (p <= 0 || q >= 1) return;
  g.save(); g.globalAlpha *= clamp(p * 3) * (1 - q);
  g.translate(540, 1215 + 160 * (1 - clamp(p)) + 200 * q); g.rotate(-1.5 * Math.PI / 180); g.translate(-540, -1215);
  const r = win95(g, 60, 1010, 960, 410, "timeline.exe", { right: dur(t), rightColor: t > C.c1_pauses + 0.5 ? LIME : "#fff" });
  g.fillStyle = "#151c19"; g.fillRect(r.x, r.y, r.w, r.h);
  // ruler
  g.fillStyle = "rgba(255,255,255,0.35)"; g.font = `500 20px "${MONO}"`; g.textAlign = "left"; g.textBaseline = "top";
  for (let i = 0; i < 10; i++) { const xx = r.x + 30 + i * (r.w - 60) / 9; g.fillRect(xx, r.y + 8, 2, 14); g.fillText("0:" + String(i * 5).padStart(2, "0"), xx + 4, r.y + 8); }
  // track: speech blocks with pauses between; pauses close one after another
  const tx = r.x + 30, tw = r.w - 60, ty = r.y + 70, th = 150;
  let x = tx;
  SEGS.forEach((sw, i) => {
    const w = sw * tw;
    g.fillStyle = "#1f5c46"; K.rr(g, x, ty, w, th, 10); g.fill();
    g.strokeStyle = "rgba(214,255,60,0.6)"; g.lineWidth = 2; g.stroke();
    g.save(); g.beginPath(); g.rect(x, ty, w, th); g.clip(); g.fillStyle = LIME;
    for (let k = 0; k < w / 9; k++) { const v = 0.3 + 0.7 * Math.abs(Math.sin(i * 3.1 + k * 0.7) * Math.cos(k * 0.23)); g.fillRect(x + 4 + k * 9, ty + th / 2 - th * 0.38 * v, 5, th * 0.76 * v); }
    g.restore();
    x += w;
    if (i < GAPS.length) {
      const c = inOutQuint(win(C.c1_pauses + 0.2 + i * 0.16, C.c1_pauses + 0.45 + i * 0.16, t));
      const gw = GAPS[i] * tw * (1 - c);
      if (gw > 1) {
        g.save(); g.beginPath(); g.rect(x, ty, gw, th); g.clip();
        g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x, ty, gw, th);
        g.strokeStyle = "rgba(255,90,90,0.55)"; g.lineWidth = 3;
        for (let k = -th; k < gw; k += 16) { g.beginPath(); g.moveTo(x + k, ty + th); g.lineTo(x + k + th, ty); g.stroke(); }
        g.restore();
        if (c < 0.2) { g.fillStyle = "rgba(255,120,120,0.9)"; g.font = `700 18px "${UI}"`; g.textAlign = "center"; g.fillText("pause", x + gw / 2, ty + th + 10); }
      }
      clickRing(g, x, ty + th / 2, t, C.c1_pauses + 0.2 + i * 0.16, 16);
      x += gw;
    }
  });
  // playhead
  const ph = tx + (x - tx) * ((t * 0.18) % 1);
  g.fillStyle = "#ff4d4d"; g.fillRect(ph - 2, ty - 16, 4, th + 32);
  // music track placeholder line (empty until c3)
  g.fillStyle = "rgba(255,255,255,0.12)"; K.rr(g, tx, ty + th + 44, tw, 40, 8); g.fill();
  g.fillStyle = "rgba(255,255,255,0.4)"; g.font = `600 20px "${UI}"`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("A2  (empty)", tx + 14, ty + th + 64);
  g.restore();
}
function cutStamp(g, t, pn) {     // "−9s" lands on the panel after the cut
  popChip(g, "−9 s", pn.cx + pn.w * 0.42, pn.cy - pn.w * 0.7, 40, t, C.c1_done + 0.1, { rot: 8, glow: true, out: C.c2 - 0.3 });
}
function sCaps(g, t) {            // c2
  popChip(g, "BOLD CAPTIONS", 300, 1385, 34, t, C.c2_bold, { rot: -5, tick: true, out: C.c3 - 0.3 });
}
function tempChip(g, t) {
  popChip(g, "TEMP  +18", 870, 300, 32, t, C.c3_warmer + 0.2, { rot: 7, bg: "#ff9b3d", fg: "#2a1300", out: C.c4 - 0.3 });
}
function sWarm(g, t) {            // c3: temperature chip + the music track
  const p = outQuint(win(C.c3_soft - 0.1, C.c3_soft + 0.6, t)), q = inCubic(win(C.c4 - 0.3, C.c4, t));
  if (p <= 0 || q >= 1) return;
  g.save(); g.globalAlpha *= clamp(p * 2) * (1 - q);
  const x = 110 + 900 * (1 - p), y = 1328, w = 860, h = 96;
  g.shadowColor = "rgba(0,15,8,0.55)"; g.shadowBlur = 30; g.shadowOffsetY = 14;
  g.fillStyle = "#0e1512"; K.rr(g, x, y, w, h, 24); g.fill(); K.noShadow(g);
  g.strokeStyle = "rgba(214,255,60,0.55)"; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = LIME; g.font = `700 32px "${UI}"`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("♪  soft music", x + 30, y + h / 2 + 2);
  const n = 40, bx = x + 280, bw = (w - 310) / n;
  for (let i = 0; i < n; i++) {
    const v = 0.2 + 0.8 * Math.abs(Math.sin(i * 0.8 + t * 3.3) * Math.cos(i * 0.31 - t * 1.4)) * clamp(win(C.c3_music, C.c3_music + 0.5, t) + 0.25);
    K.rr(g, bx + i * bw + bw * 0.2, y + h / 2 - h * 0.36 * v, bw * 0.6, h * 0.72 * v, bw * 0.3); g.fill();
  }
  g.restore();
}
// c4: prints of the finished reel on a string, the length, the logo
function sPrints(g, t) {
  const p0 = outQuint(win(C.c4 - 0.1, C.c4 + 0.5, t)), q = inCubic(win(C.just - 0.15, C.just + 0.35, t));
  if (p0 <= 0 || q >= 1) return;
  g.save(); g.globalAlpha *= clamp(p0 * 2) * (1 - q); g.translate(0, -120 * q);
  // string with sag
  const sag = (x) => 330 + 46 * Math.sin(Math.PI * (x - 30) / 1020);
  g.strokeStyle = "rgba(244,247,242,0.8)"; g.lineWidth = 3; g.beginPath();
  for (let x = 30 * p0; x <= 1050 * p0; x += 20) { x === 30 * p0 ? g.moveTo(x, sag(x)) : g.lineTo(x, sag(x)); } g.stroke();
  const xs = [150, 345, 540, 735, 930];
  xs.forEach((x, i) => {
    const at = i < 4 ? C.c4_thirty + 0.15 + i * 0.22 : C.c4_logo;
    const p = spring(win(at, at + 0.8, t)); if (p <= 0) return;
    const sw = 2.5 * Math.sin(t * 1.6 + i) * (1 + 3 * (1 - clamp(p)));
    g.save(); g.translate(x, sag(x)); g.rotate(sw * Math.PI / 180); g.translate(0, -60 * (1 - clamp(p)));
    g.globalAlpha *= clamp(p * 3);
    const pw = 150, ph = 210;
    g.shadowColor = "rgba(0,15,8,0.5)"; g.shadowBlur = 20; g.shadowOffsetY = 10; g.fillStyle = "#f6f4ee"; g.fillRect(-pw / 2, 14, pw, ph); K.noShadow(g);
    const iw = pw - 16, ih = ph - 44;
    g.save(); g.translate(-iw / 2, 22);
    drawClip(g, 0, 0, iw, ih, 1.3 + i * 1.6, i < 4 ? { warm: 1, caps: 1, music: 0 } : { warm: 1, logo: 1 });
    g.restore();
    g.fillStyle = "#333"; g.font = `600 17px "${MONO}"`; g.textAlign = "center"; g.fillText(i < 4 ? `0:${String(i * 8).padStart(2, "0")}` : "0:30 · logo", 0, 14 + ph - 10);
    // clothespin
    g.fillStyle = "#c9a26b"; g.fillRect(-9, -8, 18, 40); g.fillStyle = "#8a6a3e"; g.fillRect(-2, -8, 4, 40);
    g.restore();
  });
  g.restore();
}
function sLength(g, t) {
  const at = C.c4_thirty;
  title(g, dur(Math.max(t, C.c4 - 0.5)), 165, 900, 120, t, at - 0.05, { lime: true, out: C.just - 0.25, maxW: 300 });
  popChip(g, "LENGTH", 165, 960, 26, t, at, { bg: "rgba(20,30,25,0.85)", fg: WHITE, out: C.just - 0.25 });
  popChip(g, "LOGO", 915, 900, 32, t, C.c4_logo + 0.1, { rot: 6, glow: true, tick: true, out: C.just - 0.25 });
}
// just: the timeline + keyframes windows get closed; only the mic remains
function miniTimeline(g, r) {
  g.fillStyle = "#1d1d1d"; g.fillRect(r.x, r.y, r.w, r.h);
  const rr = rnd(3), rows = 3, rh = (r.h - 20) / rows;
  for (let i = 0; i < rows; i++) {
    let x = r.x + 50; const y = r.y + 10 + i * rh;
    g.fillStyle = "#888"; g.font = `600 18px "${UI}"`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(["V2", "V1", "A1"][i], r.x + 10, y + rh / 2);
    while (x < r.x + r.w - 20) { const w = 40 + rr() * 110; g.fillStyle = ["#6b5bd6", "#3fa36b", "#3a7bd5"][i]; g.fillRect(x, y + 6, Math.min(w, r.x + r.w - 20 - x), rh - 12); x += w + 6; }
  }
}
function miniKeys(g, r) {
  g.fillStyle = "#1d1d1d"; g.fillRect(r.x, r.y, r.w, r.h);
  g.strokeStyle = "#e8b04a"; g.lineWidth = 3; g.beginPath();
  for (let i = 0; i <= 60; i++) { const x = r.x + 20 + i * (r.w - 40) / 60, y = r.y + r.h / 2 + Math.sin(i * 0.35) * r.h * 0.3 * Math.cos(i * 0.08); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  for (let i = 0; i <= 6; i++) { const x = r.x + 20 + i * (r.w - 40) / 6, y = r.y + r.h / 2 + Math.sin(i * 10 * 0.35) * r.h * 0.3 * Math.cos(i * 10 * 0.08);
    g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = "#ffd25e"; g.fillRect(-9, -9, 18, 18); g.restore(); }
}
function dialogLife(g, t, at, closeAt, x, y, w, h, ttl, draw) {
  const p = spring(win(at - 0.1, at + 0.5, t)), q = inOutQuint(win(closeAt + 0.15, closeAt + 0.5, t));
  if (p <= 0 || q >= 1) return;
  g.save(); g.globalAlpha *= clamp(p * 3) * (1 - q);
  const cx = x + w / 2, cy = y + h / 2, s = (0.85 + 0.15 * p) * (1 - 0.5 * q);
  g.translate(cx, cy); g.scale(s, s); g.rotate((ttl.startsWith("T") ? -2 : 2) * Math.PI / 180); g.translate(-cx, -cy);
  const r = win95(g, x, y, w, h, ttl);
  draw(g, r);
  // red X stamp when closed
  const xs = spring(win(closeAt, closeAt + 0.4, t));
  if (xs > 0) {
    g.save(); g.translate(x + w / 2, y + h / 2 + 20); g.scale(xs, xs); g.strokeStyle = "#ff3b3b"; g.lineWidth = 18; g.lineCap = "round";
    g.beginPath(); g.moveTo(-90, -90); g.lineTo(90, 90); g.moveTo(90, -90); g.lineTo(-90, 90); g.stroke(); g.restore();
  }
  g.restore();
  clickRing(g, r.close[0], r.close[1], t, closeAt - 0.05, 14);
}
function sJust(g, t) {
  dialogLife(g, t, C.j_timeline, C.j_no2 - 0.1, 70, 330, 620, 330, "Timeline.exe", miniTimeline);
  dialogLife(g, t, C.j_keyframes, C.j_just - 0.15, 390, 640, 620, 330, "Keyframes.exe", miniKeys);
  // big mic, centre
  const p = spring(win(C.just - 0.1, C.just + 0.6, t)), q = inCubic(win(C.outro - 0.2, C.outro + 0.2, t));
  if (p > 0 && q < 1) {
    g.save(); g.globalAlpha *= clamp(p * 2) * (1 - q);
    const y = lerp(1180, 1120, outQuint(win(C.j_just - 0.2, C.j_just + 0.5, t)));
    micButton(g, 540, y, 120 * (0.7 + 0.3 * p), t);
    liveWave(g, 110, y + 210, 860, 90, t, { bars: 50 });
    g.restore();
  }
  wordsLine(g, [["JUST", C.j_just, LIME], ["TALKING.", C.j_talking, LIME]], 540, 560, 190, t, { out: C.outro - 0.25 });
}
// outro: the finished reel on a real phone, follow + join
function phoneUI(g, w, h, t) {
  drawClip(g, -w / 2, -h / 2, w, h, t, { warm: 1, caps: 1, music: 1, bug: 1, cut: 1 });
  // profile row with a Follow button
  const fp = clamp(win(C.o_follow + 0.2, C.o_follow + 0.45, t));
  g.save(); g.translate(-w / 2, h / 2 - h * 0.2);
  g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, -h * 0.02, w, h * 0.12);
  g.fillStyle = LIME; g.beginPath(); g.arc(w * 0.12, h * 0.04, w * 0.06, 0, 7); g.fill();
  g.fillStyle = INK; g.font = `800 ${w * 0.05}px "${UI}"`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("ve", w * 0.12, h * 0.042);
  g.fillStyle = "#fff"; g.font = `700 ${w * 0.055}px "${UI}"`; g.textAlign = "left"; g.fillText("vibe editing", w * 0.22, h * 0.042);
  const bw = w * 0.3, bh = w * 0.1, bx = w * 0.64;
  g.fillStyle = fp > 0.5 ? "rgba(255,255,255,0.15)" : LIME; K.rr(g, bx, h * 0.042 - bh / 2, bw, bh, bh * 0.3); g.fill();
  g.strokeStyle = "#fff"; g.lineWidth = fp > 0.5 ? 2 : 0; if (fp > 0.5) g.stroke();
  g.fillStyle = fp > 0.5 ? "#fff" : INK; g.font = `800 ${w * 0.045}px "${UI}"`; g.textAlign = "center"; g.fillText(fp > 0.5 ? "Following" : "Follow", bx + bw / 2, h * 0.044);
  g.restore();
}
const PH = { x: 540, y: 905, w: 860, rot: 34.6 - 2 };
function sOutro(g, t) {
  const p = outQuint(win(C.outro - 0.25, C.outro + 0.55, t));
  if (p <= 0) return;
  object(g, "phone", PH.x, PH.y + 520 * (1 - p), PH.w, PH.rot + Math.sin(t * 1.2) * 0.6, { a: clamp(p * 2), screen: (g2, w, h) => phoneUI(g2, w, h, t) });
  // follow button sits ~ at (w*0.79, h*0.84) of the screen; approximate on-canvas spot for the ring
  clickRing(g, 680, 1145, t, C.o_follow + 0.2);
  wordsLine(g, [["THAT'S", C.outro - 0.05], ["VIBE", C.o_vibe, LIME], ["EDITING", C.o_vibe + 0.22, LIME]], 540, 250, 150, t, { out: C.o_join - 0.25 });
  title(g, "JOIN", 540, 215, 120, t, C.o_join, {});
  title(g, "VIBE EDITING", 540, 370, 170, t, C.o_vibe2, { lime: true });
  popChip(g, "FOLLOW", 230, 520, 34, t, C.o_follow, { rot: -6, bg: WHITE, fg: INK });
}

// ---------------------------------------------------------------- frame --
function frame(g, t) {
  const [ox, oy] = matAt(t);
  drawMat(g, ox, oy);
  const intro = 1 - outQuint(win(0, 0.8, t));
  if (intro > 0) { g.save(); g.translate(540, 925); g.scale(1 + 0.1 * intro, 1 + 0.1 * intro); g.translate(-540, -925); }
  const pn = panelAt(t), st = clipState(t);
  // matte for mat glides: are we mid-move?
  let moving = pn.moving, speed = pn.speed;
  for (const k of MK.slice(1)) { const p = win(k[0], k[0] + MOVE, t); if (p > 0.04 && p < 0.96) { moving = true; speed = Math.max(speed, Math.sin(Math.PI * p)); } }

  hook(g, t);
  sRaw(g, t); sTell(g, t); sCut(g, t); sWarm(g, t); sPrints(g, t); sLength(g, t);
  // the shared clip panel (raw from the start; fades out as the outro begins)
  const pa = 1 - clamp(win(C.just + 0.4, C.just + 1.0, t));
  if (pa > 0) {
    const tc = t < C.c1 ? "RAW  " + dur(t) : dur(t);
    panel(g, pn.cx, pn.cy, pn.w, pn.rot, t, { ...st, tc, tcColor: t >= C.c1_pauses + 0.5 ? LIME : "#fff" }, { a: pa });
  }
  rawTag(g, t, pn); cutStamp(g, t, pn); sCaps(g, t); tempChip(g, t);
  agent(g, t);
  sJust(g, t);
  sOutro(g, t);
  if (intro > 0) g.restore();
  if (intro > 0.03) { moving = true; speed = Math.max(speed, intro * 0.5); }

  // lens: vignette + grain + captions
  const vg = g.createRadialGradient(540, 900, 500, 540, 900, 1300);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,12,6,0.5)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  K.grain(g, t, 0.05);
  // fade to black over the last 0.35 s
  const fo = win(K.TL.dur - 0.35, K.TL.dur, t); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
  K.captions(g, t, { y: 1540, size: 38, weight: 600, family: UI, color: "#fff", hi: LIME, hiText: INK, box: "rgba(0,0,0,0.6)", boxPad: 22, maxW: 860 });
  return { moving, speed };
}

K.run(frame, ["400 40px Anton", "500 40px 'Inter Var'", "600 40px 'Inter Var'", "700 40px 'Inter Var'", "800 40px 'Inter Var'", "500 30px Mono", "600 30px Mono"]);
})();

// T02C · "Watch the clock. This is one reel." A clock-racing hook, then the shared T02 body
// (the struggle, then the fix), told as a night-time case file in cold blues and night blacks.
// Scenes are drawn whole into offscreen canvases and handed over with eased transitions.
(function () {
const { C, W, H, clamp, win, lerp, outCubic, outQuint, inCubic, inOutCubic, spring } = K;
const RED = "#d3122b", CREAM = "#f3ede1", INK = "#151515", BLUE = "#0e2a52", GREEN = "rgba(90,235,120,0.55)";

// ------------------------------------------------------------------ helpers --
function full(g, name, lt, o = {}) {       // footage cover-fit to the frame, with a slow drift
  const z = (o.z0 ?? 1.04) + ((o.z1 ?? 1.12) - (o.z0 ?? 1.04)) * clamp(lt / (o.dur || 6));
  g.save();
  if (o.filter) g.filter = o.filter;
  g.globalAlpha = o.alpha ?? 1;
  const fr = K.footage(name, (o.ss || 0) + lt * (o.speed || 1), 1, o.loop ?? true);
  K.drawFit(g, fr, -(z - 1) * W * 0.5, -(z - 1) * H * 0.5, W * z, H * z, { fx: o.ffx, fy: o.ffy });
  g.restore();
}
function tint(g, col, a, mode = "soft-light") {
  g.save(); g.globalCompositeOperation = mode; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, W, H); g.restore();
}
function vignette(g, a = 0.6, inner = 0.35) {
  const v = g.createRadialGradient(W / 2, H * 0.45, H * inner, W / 2, H * 0.5, H * 0.85);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
// typed mono label with a red underline that draws after the text, like a date card
function caseLabel(g, text, x, y, t, at, o = {}) {
  if (t < at) return;
  const size = o.size || 40;
  K.font(g, size, o.weight || 600, "Mono");
  g.save(); g.textAlign = "center"; g.textBaseline = "alphabetic";
  if (g.letterSpacing !== undefined) g.letterSpacing = `${size * (o.track ?? 0.12)}px`;
  const s = o.instant ? text : K.typed(text, t, at, o.cps || 32);
  const fullW = g.measureText(text).width;
  g.fillStyle = o.color || CREAM;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 30; }
  g.fillText(s, x, y);
  g.shadowBlur = 0;
  if (!o.instant && s.length < text.length && Math.floor(t * 3) % 2 === 0) {
    const sw = g.measureText(s).width;
    g.fillRect(x - fullW / 2 + sw + 6, y - size * 0.8, size * 0.5, size * 0.95);
  }
  const done = o.instant ? at : at + text.length / (o.cps || 32);
  const u = outCubic(win(done, done + 0.45, t));
  if (u > 0 && !o.noLine) { g.fillStyle = RED; g.fillRect(x - fullW / 2, y + size * 0.3, fullW * u, Math.max(4, size * 0.1)); }
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
  g.restore();
}
// red tag: white condensed caps on a red block, wiped in left to right
function redTag(g, text, x, y, size, t, at, o = {}) {
  const p = win(at, at + 0.32, t);
  if (p <= 0) return;
  K.font(g, size, 400, "Anton");
  const tw = g.measureText(text).width, pad = size * 0.32, w = tw + pad * 2, h = size * 1.32;
  const e = outQuint(p), s = 1 + 0.12 * (1 - spring(win(at, at + 0.7, t)));
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(s, s);
  K.shadow(g, 18, 8, 0.45, "0,0,0");
  g.fillStyle = o.bg || RED; g.fillRect(-w / 2, -h / 2, w * e, h);
  K.noShadow(g);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w * e, h); g.clip();
  g.fillStyle = o.fg || "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(text, -w / 2 + pad, size * 0.05);
  g.restore(); g.restore();
}
// rubber stamp: slams in from large and settles
function stamp(g, text, x, y, size, rot, t, at, o = {}) {
  if (t < at) return;
  const p = win(at, at + 0.22, t);
  const s = lerp(1.9, 1, outQuint(p)) * (1 + 0.04 * Math.sin(Math.PI * win(at + 0.22, at + 0.45, t)));
  K.font(g, size, 400, "Anton");
  if (g.letterSpacing !== undefined) g.letterSpacing = `${size * 0.06}px`;
  const tw = g.measureText(text).width, w = tw + size * 0.7, h = size * 1.35;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(s, s);
  g.globalAlpha = clamp(p * 1.6) * 0.92;
  g.strokeStyle = o.color || RED; g.fillStyle = o.color || RED; g.lineWidth = size * 0.09;
  g.strokeRect(-w / 2, -h / 2, w, h);
  g.lineWidth = size * 0.035; g.strokeRect(-w / 2 + size * 0.12, -h / 2 + size * 0.12, w - size * 0.24, h - size * 0.24);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, size * 0.05);
  g.globalCompositeOperation = "destination-out";
  const r = K.rnd(text.length * 97 + Math.round(x));
  for (let i = 0; i < 70; i++) { g.globalAlpha = 0.5 * r(); g.fillRect(-w / 2 + r() * w, -h / 2 + r() * h, 2 + r() * 5, 2 + r() * 4); }
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
  g.restore();
}
// elegant italic serif word that fades up from a blur
function serifWord(g, text, x, y, size, t, at, o = {}) {
  const p = outCubic(win(at, at + 0.45, t));
  if (p <= 0) return;
  g.save();
  g.font = `italic 400 ${size}px "Instrument Serif"`;
  g.textAlign = o.align || "center"; g.textBaseline = "alphabetic";
  g.globalAlpha = p * (o.alpha ?? 1);
  if (p < 1) g.filter = `blur(${(1 - p) * 10}px)`;
  g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 18; g.shadowOffsetY = 4;
  g.fillStyle = o.color || CREAM;
  g.fillText(text, x, y + 26 * (1 - p));
  g.restore();
}
// print pinned to a wall / lying on the desk; draw(g, x, y, w, h) fills the photo area
function print(g, x, y, w, h, rot, t, at, draw, o = {}) {
  const p = spring(win(at, at + 0.75, t));
  if (p <= 0) return;
  const border = o.border ?? 16, foot = o.foot ?? border;
  g.save(); g.translate(x + (o.dx || 0) * (1 - p), y + (o.dy ?? -60) * (1 - p)); g.rotate((rot + (1 - p) * (o.rin ?? 8)) * Math.PI / 180);
  const s = 0.92 + 0.08 * p; g.scale(s, s);
  g.globalAlpha = clamp(p * 2);
  K.shadow(g, 30, 16, 0.55, "0,0,0");
  g.fillStyle = o.paper || "#efece4"; g.fillRect(-w / 2 - border, -h / 2 - border, w + border * 2, h + border + foot);
  K.noShadow(g);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip();
  g.fillStyle = "#111"; g.fillRect(-w / 2, -h / 2, w, h);
  draw(g, -w / 2, -h / 2, w, h);
  g.restore();
  if (o.label) {
    K.font(g, o.labelSize || 24, 600, "Mono"); g.fillStyle = "#2a2a2a"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(o.label, 0, h / 2 + foot / 2 + 2);
  }
  if (o.pin) {
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.arc(4, -h / 2 - border + 10, 13, 0, 7); g.fill();
    const pg = g.createRadialGradient(-4, -h / 2 - border - 2, 2, 0, -h / 2 - border, 15);
    pg.addColorStop(0, "#ff6a6a"); pg.addColorStop(1, "#9c0e1c");
    g.fillStyle = pg; g.beginPath(); g.arc(0, -h / 2 - border, 14, 0, 7); g.fill();
  }
  g.restore();
}
function photo(name, lt, filter, o = {}) {
  return (g, x, y, w, h) => {
    if (filter) g.filter = filter;
    K.drawFit(g, K.footage(name, (o.ss || 0) + lt * (o.speed || 1), 1, true), x, y, w, h, { fx: o.fx, fy: o.fy, zoom: o.zoom });
    g.filter = "none";
  };
}
// 3D extruded word, popped in on a spring
function extruded(g, text, x, y, size, face, side, t, at, o = {}) {
  const p = spring(win(at, at + 0.7, t));
  if (p <= 0) return;
  g.save(); g.translate(x, y + 40 * (1 - p)); g.rotate((o.rot || 0) * Math.PI / 180); const s = 0.6 + 0.4 * p; g.scale(s, s);
  g.globalAlpha = clamp(p * 2.5) * (o.alpha ?? 1);
  g.font = `400 ${size}px "Archivo Black"`; g.textAlign = "center"; g.textBaseline = "middle";
  const fit = Math.min(1, (o.maxW || 960) / g.measureText(text).width); g.scale(fit, fit);
  const depth = o.depth || 16;
  g.shadowColor = "rgba(0,0,0,0.3)"; g.shadowBlur = 28; g.shadowOffsetY = 22;
  g.fillStyle = side; g.fillText(text, depth * 0.7, depth);
  K.noShadow(g);
  for (let i = depth; i > 0; i--) { g.fillStyle = side; g.fillText(text, i * 0.7, i); }
  g.fillStyle = face; g.fillText(text, 0, 0);
  g.globalAlpha *= 0.35; g.fillStyle = "#fff"; g.save(); g.beginPath(); g.rect(-W, -size * 0.6, W * 2, size * 0.28); g.clip(); g.fillText(text, 0, 0); g.restore();
  g.restore();
}
function greenWall(g, t) {                 // the dark green wall of the case room
  const bg = g.createRadialGradient(W * 0.5, H * 0.38, 80, W * 0.5, H * 0.5, H * 0.8);
  bg.addColorStop(0, "#2b3f36"); bg.addColorStop(0.6, "#17241f"); bg.addColorStop(1, "#0a100d");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const r = K.rnd(7);
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = r() * H, rad = 80 + r() * 260, gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(${r() < 0.5 ? "0,0,0" : "120,150,130"},${0.05 + r() * 0.05})`); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = 0.12;
  const bx = W * 0.3 + Math.sin(t * 0.25) * 60;
  const beam = g.createLinearGradient(bx - 200, 0, bx + 260, H);
  beam.addColorStop(0, "rgba(255,255,230,0)"); beam.addColorStop(0.5, "rgba(255,255,230,0.9)"); beam.addColorStop(1, "rgba(255,255,230,0)");
  g.fillStyle = beam; g.beginPath(); g.moveTo(bx - 160, 0); g.lineTo(bx + 120, 0); g.lineTo(bx + 520, H); g.lineTo(bx + 120, H); g.closePath(); g.fill();
  g.restore();
}
function blueprintGrid(g) {
  g.fillStyle = BLUE; g.fillRect(0, 0, W, H);
  const bg = g.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H / 2, H * 0.8);
  bg.addColorStop(0, "rgba(60,110,170,0.55)"); bg.addColorStop(1, "rgba(0,0,0,0.5)");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(170,205,255,0.13)"; g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= W; x += 27) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); }
  for (let y = 0; y <= H; y += 27) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); }
  g.stroke();
  g.strokeStyle = "rgba(170,205,255,0.3)"; g.lineWidth = 2;
  g.beginPath();
  for (let x = 0; x <= W; x += 135) { g.moveTo(x, 0); g.lineTo(x, H); }
  for (let y = 0; y <= H; y += 135) { g.moveTo(0, y); g.lineTo(W, y); }
  g.stroke();
}
function greyGrid(g) {
  const bg = g.createRadialGradient(W / 2, H * 0.42, 100, W / 2, H / 2, H * 0.8);
  bg.addColorStop(0, "#e9e9e6"); bg.addColorStop(1, "#b9b9b5");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(90,90,90,0.18)"; g.lineWidth = 1.5;
  g.beginPath();
  for (let x = 0; x <= W; x += 60) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); }
  for (let y = 0; y <= H; y += 60) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); }
  g.stroke();
}
function wood(g, dark = 0.5) {
  full(g, "oh_wood", 0, { z0: 1.05, z1: 1.05, filter: `brightness(${1 - dark}) saturate(0.8)` });
}
// the real red wall clock (Mixkit 9309), keyed off its green screen; src = seconds into the clip
const CLOCK_N = 240;
function clockKey(g, cx, cy, size, src, o = {}) {
  const i = ((Math.floor(src * 30) % CLOCK_N) + CLOCK_N) % CLOCK_N;
  const im = K.img(`../assets/footage/pc_clockkey/f${String(i + 1).padStart(4, "0")}.png`);
  if (!im) return;
  g.save(); g.translate(cx, cy); g.rotate((o.rot || 0) * Math.PI / 180);
  g.globalAlpha = o.alpha ?? 1;
  K.shadow(g, 50, 28, 0.6, "0,0,0");
  g.drawImage(im, -size / 2, -size / 2, size, size);
  K.noShadow(g);
  if (o.glass) {                                             // a soft glass highlight
    const gl = g.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    gl.addColorStop(0, "rgba(255,255,255,0.18)"); gl.addColorStop(0.45, "rgba(255,255,255,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, size * 0.42, 0, 7); g.fill();
  }
  g.restore();
}
// the edit session's clock time: 9:00 PM + minutes
function clockTime(min) {
  const h24 = 21 + Math.floor(min / 60), m = Math.floor(min % 60);
  const h = ((h24 - 1) % 12) + 1, ap = h24 % 24 >= 12 ? "PM" : "AM";
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
// the racing hours counter shared by both hook scenes
function hookCounter(g, t) {
  const p = Math.pow(clamp(t / (C.hook_end - 0.1)), 1.5);
  const s = clockTime(180 * p);
  K.font(g, 112, 700, "Mono");
  g.save(); g.textAlign = "center"; g.textBaseline = "alphabetic";
  if (g.letterSpacing !== undefined) g.letterSpacing = "8px";
  g.shadowColor = "rgba(0,0,0,0.7)"; g.shadowBlur = 24;
  g.fillStyle = CREAM; g.fillText(s, W / 2, 290);
  const w = g.measureText("12:00 AM").width;
  g.shadowBlur = 0; g.fillStyle = RED; g.fillRect(W / 2 - w / 2, 318, w, 10);
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
  K.font(g, 30, 600, "Mono"); g.fillStyle = "rgba(243,237,225,0.75)";
  if (g.letterSpacing !== undefined) g.letterSpacing = "6px";
  g.fillText("EDIT SESSION · ONE REEL", W / 2, 380);
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
  g.restore();
}

// ------------------------------------------------------------------ scenes --
const S = [];
function scene(t0, t1, tin, draw) { S.push({ t0, t1, tin, draw }); }

// 1a · "Watch the clock." — a real clock racing, macro, in cold blue
scene(0, C.this - 0.05, { type: "cut", d: 0 }, (g, t, lt) => {
  full(g, "pc_silver", lt, { speed: 1.6, z0: 1.18, z1: 1.04, dur: 1.5, ffx: 0.42, filter: "grayscale(1) contrast(1.25) brightness(1.05)" });
  tint(g, "#2a5aa8", 0.55, "multiply");
  tint(g, "#6fa0e8", 0.35, "soft-light");
  vignette(g, 0.7);
  vignette(g, 0.5, 0.2);
  const zin = outCubic(win(0, 0.6, t));                           // the real clock races, hero size
  clockKey(g, W / 2, 860, lerp(1000, 860, zin), 0.2 + t * 3.2, { glass: true, rot: -3 });
  g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 0, W, 440);
  hookCounter(g, t);
  redTag(g, "WATCH THE CLOCK.", W / 2, 1390, 96, t, C.clock - 0.15, { rot: -2 });
});
// 1b · "This is one reel." — the clock races over a real time-lapse of someone editing; day turns to night
scene(C.this - 0.05, C.s_hours, { type: "flash", d: 0.26 }, (g, t, lt) => {
  const night = clamp(t / C.hook_end);
  full(g, "timelapse", lt, { speed: 2.4, ss: 1.0, z0: 1.15, z1: 1.15, filter: `blur(16px) brightness(${lerp(0.8, 0.35, night)})` });
  tint(g, "#0a1a3a", lerp(0.2, 0.75, night), "multiply");
  print(g, W / 2, 1140, 960, 540, 1.2, t, C.this - 0.05, (gg, x, y, w, h) => {
    gg.filter = `brightness(${lerp(1, 0.6, night)}) saturate(${lerp(0.9, 0.55, night)})`;
    K.drawFit(gg, K.footage("timelapse", 1.0 + lt * 2.4, 1, true), x, y, w, h);
    gg.filter = "none";
    gg.globalCompositeOperation = "multiply"; gg.fillStyle = `rgba(40,70,140,${0.55 * night})`; gg.fillRect(x, y, w, h);
    gg.globalCompositeOperation = "source-over";
  }, { label: "TIME-LAPSE · 9 PM → 12 AM", dy: 120, rin: -6 });
  const cin = outCubic(win(C.this - 0.05, C.this + 0.5, t));        // the same clock rises and shrinks over the time-lapse
  clockKey(g, W / 2, lerp(860, 640, cin), lerp(860, 560, cin), 0.2 + t * 3.2, { glass: true, rot: -3 });
  g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(0, 0, W, 420);
  hookCounter(g, t);
  redTag(g, "ONE REEL.", W / 2 + 200, 1452, 92, t, C.one - 0.05, { rot: -3 });
});

// 2 · "Three hours. One reel." — the total, typed like a date card, and the one reel it bought
scene(C.s_hours, C.trim - 0.25, { type: "slide", d: 0.4 }, (g, t, lt) => {
  g.fillStyle = "#07090d"; g.fillRect(0, 0, W, H);
  full(g, "pc_bluefast", lt, { alpha: 0.3, z0: 1.2, z1: 1.3, dur: 3, filter: "contrast(1.2)" });
  tint(g, "#2c5aa0", 0.35, "multiply");
  vignette(g, 0.8);
  caseLabel(g, "TOTAL EDIT TIME", W / 2, 300, t, C.s_hours + 0.12, { size: 40, cps: 40, noLine: true, color: "rgba(243,237,225,0.75)" });
  caseLabel(g, "3:00:00", W / 2, 560, t, C.three - 0.08, { size: 190, cps: 16, weight: 700, track: 0.04 });
  print(g, W / 2 - 40, 1030, 380, 560, -3, t, C.one2 - 0.12, photo("cw_creator", lt, "grayscale(1) contrast(1.15) brightness(1.05)", { fx: 0.62 }),
    { label: "REEL_01.MP4", foot: 64, pin: true, dy: -120 });
  redTag(g, "ONE REEL.", W / 2 + 230, 1290, 84, t, C.reel2 - 0.1, { rot: -4 });
});

// 3a · "Trimming every pause by hand." — a razor clicks each silence out of the waveform
const GAPS = [0.1, 0.24, 0.37, 0.52, 0.66, 0.81];               // where the pauses sit (0..1)
const WAVE = (() => { const r = K.rnd(42); return Array.from({ length: 150 }, () => 0.25 + 0.75 * r() ** 0.7); })();
scene(C.trim - 0.25, C.typing - 0.2, { type: "zoom", d: 0.42 }, (g, t, lt) => {
  blueprintGrid(g);
  serifWord(g, "trimming every pause", W / 2, 250, 88, t, C.trim - 0.1);
  print(g, W / 2, 560, 900, 470, -1.5, t, C.trim - 0.15, photo("timeline", lt, "saturate(0.7) brightness(0.95)"),
    { label: "EDIT_FINAL_v7  ·  02:47:12 elapsed", foot: 50, pin: true });
  // waveform strip
  const x0 = 70, x1 = 1010, y0 = 930, y1 = 1190, mid = (y0 + y1) / 2;
  g.save(); K.shadow(g, 26, 12, 0.5, "0,0,0"); g.fillStyle = "#0b1220"; K.rr(g, x0, y0, x1 - x0, y1 - y0, 18); g.fill(); K.noShadow(g);
  K.font(g, 22, 600, "Mono"); g.fillStyle = "rgba(170,205,255,0.7)"; g.textAlign = "left"; g.textBaseline = "top";
  g.fillText("A1  VOICE.wav", x0 + 20, y0 + 14);
  const cutAt = GAPS.map((_, k) => C.trim + 0.15 + k * ((C.hand - C.trim) / GAPS.length));
  const gw = 0.055;                                          // gap width (fraction)
  // positions: segments between gaps, gaps shrinking to 0 once cut
  const shrink = GAPS.map((_, k) => 1 - outCubic(win(cutAt[k] + 0.1, cutAt[k] + 0.35, t)));
  const total = 1 + GAPS.reduce((a, _, k) => a + gw * shrink[k], 0) - GAPS.length * gw;
  const span = x1 - x0 - 60, sx = x0 + 30;
  const map = (u) => {                                       // waveform coordinate (0..1 incl. gaps) -> x
    let x = u, cum = 0;
    for (let k = 0; k < GAPS.length; k++) {
      const gs = GAPS[k], ge = GAPS[k] + gw;
      if (u > ge) cum += gw * (1 - shrink[k]);
      else if (u > gs) cum += (u - gs) * (1 - shrink[k]);
    }
    return sx + ((x - cum) / total) * span;
  };
  const inGap = (u) => GAPS.some((gs) => u > gs && u < gs + gw);
  for (let i = 0; i < WAVE.length; i++) {
    const u = (i + 0.5) / WAVE.length;
    const a = inGap(u) ? 0.05 : WAVE[i];
    const x = map(u), hgt = a * (y1 - y0 - 80) * 0.5;
    g.fillStyle = inGap(u) ? "rgba(170,205,255,0.25)" : "#7fb0ff";
    g.fillRect(x - 2, mid + 10 - hgt, 4, hgt * 2);
  }
  // razor: moves to the next gap, cuts it with a red pen circle
  let k = cutAt.findIndex((c) => t < c + 0.35);
  if (k < 0) k = GAPS.length - 1;
  const gx = map(GAPS[k] + gw / 2), prev = k > 0 ? map(GAPS[k - 1] + gw / 2) : sx;
  const mv = outCubic(win(cutAt[k] - 0.18, cutAt[k], t));
  const rx = lerp(prev, gx, mv);
  if (t > C.trim) {
    g.strokeStyle = RED; g.lineWidth = 4; g.beginPath(); g.moveTo(rx, y0 + 46); g.lineTo(rx, y1 - 10); g.stroke();
    g.fillStyle = RED; g.beginPath(); g.moveTo(rx - 16, y0 + 30); g.lineTo(rx + 16, y0 + 30); g.lineTo(rx, y0 + 52); g.closePath(); g.fill();
    GAPS.forEach((gs, j) => {                                 // red pen ring on each cut
      const p = win(cutAt[j], cutAt[j] + 0.3, t);
      if (p <= 0 || p >= 1) return;
      g.strokeStyle = `rgba(214,18,43,${1 - p})`; g.lineWidth = 6;
      g.beginPath(); g.ellipse(map(gs + gw / 2), mid + 10, 40 + 30 * p, 70 + 20 * p, 0, 0, 7); g.stroke();
    });
  }
  g.restore();
  const n = cutAt.filter((c) => t >= c).length;
  K.font(g, 34, 700, "Mono"); g.fillStyle = CREAM; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(`PAUSES CUT: ${n} / 214`, 80, 1270);
  redTag(g, "BY HAND.", W - 240, 1340, 84, t, C.hand - 0.08, { rot: -3 });
});

// 3b · "Typing every caption." — a caption sheet on the desk, typed line by line
const SRT = [
  ["1", "00:00:01,200 --> 00:00:02,900"], ["", "so here's the thing"],
  ["2", "00:00:03,000 --> 00:00:04,400"], ["", "nobody tells you this"],
  ["3", "00:00:04,500 --> 00:00:06,100"], ["", "about editing at night"],
];
scene(C.typing - 0.2, C.nudging - 0.2, { type: "push", d: 0.36 }, (g, t, lt) => {
  wood(g, 0.55);
  vignette(g, 0.7, 0.3);
  serifWord(g, "typing every caption", W / 2, 240, 88, t, C.typing - 0.1);
  print(g, W / 2 + 30, 540, 820, 420, 2, t, C.typing - 0.18, photo("typing", lt, "saturate(0.6) brightness(0.9) contrast(1.05)"),
    { pin: true, dy: -80 });
  // the caption sheet
  const sp = spring(win(C.typing - 0.15, C.typing + 0.55, t));
  g.save(); g.translate(W / 2 - 10, lerp(1300, 1080, sp)); g.rotate(-1.5 * Math.PI / 180);
  g.globalAlpha = clamp(sp * 2);
  K.shadow(g, 30, 16, 0.55, "0,0,0"); g.fillStyle = "#f1ece0"; g.fillRect(-430, -230, 860, 430); K.noShadow(g);
  K.font(g, 24, 700, "Mono"); g.fillStyle = "#7a2a2a"; g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.fillText("captions_final_FINAL.srt", -400, -186);
  g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(-400, -172, 800, 2);
  const total = SRT.reduce((a, l) => a + l[1].length, 0);
  let n = Math.floor(Math.max(0, t - C.typing + 0.05) * 100), cur = -1;
  SRT.forEach((l, i) => {
    const y = -130 + i * 58, isText = l[0] === "";
    const s = l[1].slice(0, Math.max(0, n)); if (n > 0 && n < l[1].length) cur = i; n -= l[1].length;
    if (!s) return;
    K.font(g, isText ? 32 : 24, isText ? 700 : 500, "Mono");
    if (isText && s.length) {                                 // green highlighter under the caption text
      g.fillStyle = GREEN; g.fillRect(-372, y - 30, g.measureText(s).width + 16, 40);
    }
    g.fillStyle = isText ? "#151515" : "#555";
    if (l[0]) { K.font(g, 24, 700, "Mono"); g.fillText(l[0], -400, y); K.font(g, 24, 500, "Mono"); }
    g.fillText(s, -364, y);
    if (i === cur && Math.floor(t * 3) % 2 === 0) { const w = g.measureText(s).width; g.fillRect(-362 + w, y - 26, 14, 30); }
  });
  g.restore();
  let acc = 0, done = 0; const typedN = Math.max(0, t - C.typing + 0.05) * 100;
  SRT.forEach((l) => { acc += l[1].length; if (l[0] === "" && typedN >= acc) done++; });
  K.font(g, 34, 700, "Mono"); g.fillStyle = CREAM; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(`CAPTIONS: ${done} / 148`, 80, 1380);
});

// 3c · "Nudging every cut, frame by frame." — one cut, nudged back and forth on a real TV
const TV = { x0: 0.29, y0: 0.3474, x1: 0.708, y1: 0.9242 };
function tvbox(g, cx, cy, w, screen) {
  const im = K.object("rv_tvbox"); if (!im) return;
  const h = w * im.height / im.width;
  g.save(); g.translate(cx, cy);
  K.shadow(g, 50, 30, 0.6, "0,0,0"); g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
  const sx = -w / 2 + TV.x0 * w + 6, sy = -h / 2 + TV.y0 * h + 6, sw = (TV.x1 - TV.x0) * w - 12, sh = (TV.y1 - TV.y0) * h - 12;
  g.save(); K.rr(g, sx, sy, sw, sh, sw * 0.06); g.clip();
  screen(g, sx, sy, sw, sh);
  g.globalAlpha = 0.1; g.fillStyle = "#000";
  for (let yy = sy; yy < sy + sh; yy += 4) g.fillRect(sx, yy, sw, 2);
  g.globalAlpha = 1;
  const vg = g.createRadialGradient(sx + sw / 2, sy + sh / 2, sh * 0.3, sx + sw / 2, sy + sh / 2, sw * 0.75);
  vg.addColorStop(0, "rgba(255,255,255,0.05)"); vg.addColorStop(1, "rgba(0,0,0,0.5)");
  g.fillStyle = vg; g.fillRect(sx, sy, sw, sh);
  g.restore(); g.restore();
}
scene(C.nudging - 0.2, C.s_then, { type: "push", d: 0.36 }, (g, t, lt) => {
  greenWall(g, t);
  serifWord(g, "frame by frame", W / 2, 250, 92, t, C.nudging - 0.05);
  const nud = t > C.nudging + 0.2 ? Math.floor((t - C.nudging - 0.2) / 0.19) : 0;
  const side = nud % 2;                                       // 0 = 1043, 1 = 1044
  const tin = spring(win(C.nudging - 0.2, C.nudging + 0.5, t));
  tvbox(g, W / 2, lerp(760, 650, tin), 1000, (gg, sx, sy, sw, sh) => {
    gg.filter = "saturate(0.7) contrast(1.05)";
    K.drawFit(gg, K.footage("timeline", 3.2 + side / 30 * 8, 1), sx, sy, sw, sh);  // the frame jumps with each nudge
    gg.filter = "none";
    const px = sx + sw * (0.48 + (side ? 0.012 : -0.012));
    gg.strokeStyle = RED; gg.lineWidth = 4; gg.beginPath(); gg.moveTo(px, sy); gg.lineTo(px, sy + sh); gg.stroke();
  });
  // frame counter and the arrow keys that keep getting pressed
  if (t > C.nudging) {
    const f = 1043 + side;
    K.font(g, 92, 700, "Mono"); g.fillStyle = CREAM; g.textAlign = "center"; g.textBaseline = "middle";
    if (g.letterSpacing !== undefined) g.letterSpacing = "6px";
    g.fillText(`FRAME ${f}`, W / 2, 1060);
    if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
    ["◀", "▶"].forEach((a, i) => {
      const down = nud > 0 && side === (i === 0 ? 0 : 1) && ((t - C.nudging - 0.2) % 0.19) < 0.1;
      const x = W / 2 + (i ? 110 : -110), y = 1220 + (down ? 8 : 0);
      g.fillStyle = "#0c0f0d"; K.rr(g, x - 80, 1220 - 70 + 14, 160, 140, 22); g.fill();
      g.fillStyle = down ? "#d9d4c8" : CREAM; K.rr(g, x - 80, y - 70, 160, 140, 22); g.fill();
      K.font(g, 60, 700, "Inter Var"); g.fillStyle = INK; g.fillText(a, x, y + 4);
    });
  }
  redTag(g, "±1 FRAME. AGAIN.", W / 2, 1390, 70, t, C.frame2 - 0.1, { rot: -2 });
});

// 4 · "Then I tried something else." — the turn, as stacked italic serif words on the dark wall
scene(C.s_then, C.s_brief, { type: "fade", d: 0.5 }, (g, t, lt) => {
  greenWall(g, t);
  vignette(g, 0.6);
  serifWord(g, "Then", W / 2 - 150, 560, 150, t, C.then - 0.05);
  serifWord(g, "I", W / 2 + 120, 690, 120, t, C.i - 0.05);
  serifWord(g, "tried", W / 2 - 40, 850, 150, t, C.tried - 0.05);
  serifWord(g, "something", W / 2 + 40, 1030, 150, t, C.something - 0.05);
  serifWord(g, "else.", W / 2 - 60, 1250, 210, t, C.else - 0.05);
  const u = outCubic(win(C.else + 0.25, C.else + 0.6, t));
  if (u > 0) { g.fillStyle = RED; g.fillRect(W / 2 - 230, 1285, 340 * u, 10); }
});

// 5 · "One sentence: what I want, and how it should feel." — the brief, marked up like evidence
const BRIEF = ["30-second reel, punchy start,", "warm and confident,", "end on my logo."];
scene(C.s_brief, C.s_ai, { type: "iris", d: 0.55 }, (g, t, lt) => {
  blueprintGrid(g);
  caseLabel(g, "ONE SENTENCE", W / 2, 320, t, C.s_brief + 0.2, { size: 50, cps: 30 });
  const cp = spring(win(C.s_brief + 0.1, C.s_brief + 0.8, t));
  const cx = 70, cy = lerp(700, 520, cp), cw = 940, ch = 440;
  g.save(); g.globalAlpha = clamp(cp * 2);
  K.shadow(g, 40, 20, 0.5, "0,0,0"); g.fillStyle = "#f6f4ef"; K.rr(g, cx, cy, cw, ch, 28); g.fill(); K.noShadow(g);
  K.font(g, 26, 600, "Inter Var"); g.fillStyle = "#8a8f98"; g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.fillText("✦  describe your edit", cx + 40, cy + 62);
  // typed text, three lines
  let n = Math.floor(Math.max(0, t - (C.s_brief + 0.35)) * 30);
  const lx = cx + 40, ly = (i) => cy + 150 + i * 82;
  K.font(g, 54, 700, "Inter Var");
  const pos = (i, sub) => { const k = BRIEF[i].indexOf(sub); return [lx + g.measureText(BRIEF[i].slice(0, k)).width, g.measureText(sub).width]; };
  // markup under the text: green highlighter for the feel
  const hl = (i, sub, at) => {
    const p = outCubic(win(at, at + 0.35, t)); if (p <= 0) return;
    const [x, w] = pos(i, sub); g.fillStyle = GREEN; g.fillRect(x - 6, ly(i) - 46, (w + 12) * p, 60);
  };
  hl(0, "punchy start", C.how - 0.05); hl(1, "warm and confident", C.how + 0.15);
  let caret = null;
  BRIEF.forEach((line, i) => {
    const s = line.slice(0, Math.max(0, n)); n -= line.length;
    g.fillStyle = "#151515"; g.fillText(s, lx, ly(i));
    if (s.length && s.length < line.length) caret = [lx + g.measureText(s).width, ly(i)];
  });
  if (caret && Math.floor(t * 3) % 2 === 0) { g.fillRect(caret[0] + 4, caret[1] - 46, 5, 56); }
  // red pen ellipse round what I want
  const rp = outCubic(win(C.what - 0.1, C.what + 0.35, t));
  if (rp > 0) {
    const [x, w] = pos(0, "30-second reel");
    g.strokeStyle = "rgba(214,18,43,0.9)"; g.lineWidth = 6; g.lineCap = "round";
    g.beginPath(); g.ellipse(x + w / 2, ly(0) - 18, w / 2 + 26, 48, -0.03, -Math.PI * 0.6, -Math.PI * 0.6 + Math.PI * 2.1 * rp); g.stroke();
  }
  // send button
  const sent = win(C.feel + 0.45, C.feel + 0.6, t);
  g.fillStyle = sent > 0 ? RED : "#151515"; g.beginPath(); g.arc(cx + cw - 70, cy + ch - 64, 36 * (1 - 0.15 * Math.sin(Math.PI * sent)), 0, 7); g.fill();
  g.strokeStyle = "#fff"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath();
  g.moveTo(cx + cw - 70, cy + ch - 46); g.lineTo(cx + cw - 70, cy + ch - 82); g.moveTo(cx + cw - 86, cy + ch - 66); g.lineTo(cx + cw - 70, cy + ch - 82); g.lineTo(cx + cw - 54, cy + ch - 66); g.stroke();
  g.restore();
  redTag(g, "WHAT I WANT", 330, 1110, 66, t, C.want - 0.15, { rot: -3 });
  redTag(g, "HOW IT SHOULD FEEL", W / 2 + 110, 1250, 66, t, C.feel - 0.2, { rot: 2, bg: "#0c0f14", fg: CREAM });
});

// 6 · "The AI cuts it, captions it, and times it to the music." — the timeline assembles itself
const CLIPS = [["cw_creator", 0.6], ["fs_walk", 0.2], ["typing", 0.4], ["fs_beach", 0.3], ["hw_coffee", 0.3], ["cw_creator", 2.4]];
const BEATS = 7;
scene(C.s_ai, C.s_note, { type: "zoom", d: 0.45 }, (g, t, lt) => {
  g.fillStyle = "#070b14"; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = 0.5; blueprintGrid(g); g.restore();
  vignette(g, 0.7);
  const px = 50, py = 220, pw = 980, ph = 1060;
  const pin = spring(win(C.s_ai, C.s_ai + 0.7, t));
  g.save(); g.translate(W / 2, lerp(H / 2 + 120, H / 2, pin)); g.translate(-W / 2, -H / 2);
  K.shadow(g, 50, 24, 0.6, "0,0,0"); g.fillStyle = "#12161d"; K.rr(g, px, py, pw, ph, 24); g.fill(); K.noShadow(g);
  K.font(g, 24, 700, "Mono"); g.fillStyle = RED; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("● AUTO-EDIT", px + 28, py + 34);
  g.fillStyle = "#8a93a3"; g.textAlign = "right"; g.fillText("reel_01 · 0:30", px + pw - 28, py + 34);
  // preview
  const vx = px + 40, vy = py + 70, vw = pw - 80, vh = 520;
  g.save(); K.rr(g, vx, vy, vw, vh, 14); g.clip();
  const warm = outCubic(win(C.times - 0.2, C.times + 0.6, t));
  g.filter = `saturate(${0.85 + 0.3 * warm}) sepia(${0.18 * warm})`;
  K.drawFit(g, K.footage("cw_creator", 0.5 + lt, 1, true), vx, vy, vw, vh, { fx: 0.6 });
  g.filter = "none";
  const capP = spring(win(C.captions, C.captions + 0.5, t));
  if (capP > 0) {
    const words = ["SO", "HERE'S", "THE", "THING"], k = Math.min(words.length, Math.floor((t - C.captions) / 0.18) + 1);
    const txt = words.slice(0, k).join(" ");
    g.font = `400 64px "Anton"`; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 10; g.strokeStyle = "#000"; g.strokeText(txt, vx + vw / 2, vy + vh - 80);
    g.fillStyle = "#fff"; g.fillText(txt, vx + vw / 2, vy + vh - 80);
  }
  g.restore();
  // tracks
  const tx = vx + 70, tw = vw - 70, rows = [["V1", vy + vh + 50], ["T1", vy + vh + 170], ["A1", vy + vh + 260]];
  K.font(g, 24, 700, "Mono"); g.fillStyle = "#6f7a8c"; g.textAlign = "left";
  rows.forEach(([n, y]) => g.fillText(n, vx, y + 40));
  // beat grid
  const beatX = (i) => tx + (i / (BEATS - 1)) * tw;
  const bp = win(C.music - 0.1, C.music + 0.3, t);
  for (let i = 0; i < BEATS; i++) {
    const flash = bp > 0 ? 0.35 + 0.65 * Math.max(0, Math.sin(Math.PI * clamp((t - C.music - i * 0.05) / 0.3))) : 0.18;
    g.strokeStyle = `rgba(214,18,43,${flash})`; g.lineWidth = 3; g.setLineDash([10, 8]);
    g.beginPath(); g.moveTo(beatX(i), vy + vh + 30); g.lineTo(beatX(i), vy + vh + 360); g.stroke();
  }
  g.setLineDash([]);
  // V1 clips fly in and snap onto the beats
  const cw = (tw / (BEATS - 1)) * (BEATS - 1) / CLIPS.length;
  CLIPS.forEach(([name, ss], i) => {
    const at = C.cuts - 0.35 + i * 0.12, p = outQuint(win(at, at + 0.4, t));
    if (p <= 0) return;
    const x = lerp(W + 100, tx + i * cw, p), y = rows[0][1];
    g.save(); K.rr(g, x + 3, y, cw - 6, 90, 8); g.clip();
    K.drawFit(g, K.footage(name, ss, 1), x, y, cw, 90); g.restore();
    g.strokeStyle = bp > 0 ? "rgba(255,90,90,0.9)" : "rgba(255,255,255,0.4)"; g.lineWidth = 3; K.rr(g, x + 3, y, cw - 6, 90, 8); g.stroke();
  });
  // T1 caption blocks
  for (let i = 0; i < 8; i++) {
    const at = C.captions + i * 0.07, p = spring(win(at, at + 0.4, t));
    if (p <= 0) continue;
    const x = tx + i * (tw / 8) + 4, y = rows[1][1] + 6;
    g.save(); g.translate(x, y); g.scale(p, p); g.fillStyle = "#f6c90e"; K.rr(g, 0, 0, tw / 8 - 10, 46, 8); g.fill(); g.restore();
  }
  // A1 music waveform, drawn across, beats ticked
  const wp = outCubic(win(C.times - 0.2, C.times + 0.6, t));
  if (wp > 0) {
    g.save(); g.beginPath(); g.rect(tx, rows[2][1], tw * wp, 90); g.clip();
    for (let x = 0; x < tw; x += 7) {
      const beat = Math.abs(((x / tw) * (BEATS - 1)) % 1 - 0) < 0.08 ? 1 : 0;
      const a = (0.25 + 0.5 * Math.abs(Math.sin(x * 0.11)) * Math.abs(Math.cos(x * 0.031))) + beat * 0.35;
      g.fillStyle = beat ? "#ff6b6b" : "#4fd1a5"; g.fillRect(tx + x, rows[2][1] + 45 - a * 40, 4, a * 80);
    }
    g.restore();
  }
  // playhead
  const ph2 = clamp((t - C.cuts) / (C.s_note - C.cuts));
  if (ph2 > 0) { const x = tx + tw * ph2; g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, vy + vh + 24); g.lineTo(x, vy + vh + 368); g.stroke(); }
  g.restore();
  redTag(g, "CUTS ✓", 220, 1380, 58, t, C.cuts - 0.05, { rot: -2 });
  redTag(g, "CAPTIONS ✓", 540, 1380, 58, t, C.captions - 0.05, { rot: 1, bg: "#0c0f14", fg: CREAM });
  redTag(g, "MUSIC ✓", 870, 1380, 58, t, C.music - 0.05, { rot: -2 });
});

// 7 · "I give one note, and post." — one sticky note on the real phone, then posted
scene(C.s_note, C.s_same, { type: "slide", d: 0.4 }, (g, t, lt) => {
  full(g, "oh_phone_b", lt, { z0: 1.02, z1: 1.08, dur: 3, filter: "saturate(0.85) brightness(0.92)" });
  tint(g, "#2c5aa0", 0.25);
  vignette(g, 0.6);
  // sticky note
  const np = win(C.note - 0.15, C.note + 0.1, t);
  if (np > 0) {
    const s = lerp(1.7, 1, outQuint(np));
    g.save(); g.translate(800, 470); g.rotate(7 * Math.PI / 180); g.scale(s, s);
    g.globalAlpha = clamp(np * 2);
    K.shadow(g, 30, 18, 0.5, "0,0,0"); g.fillStyle = "#f4d44c"; g.fillRect(-170, -170, 340, 340); K.noShadow(g);
    g.fillStyle = "rgba(0,0,0,0.06)"; g.fillRect(-170, -170, 340, 42);
    g.font = `700 58px "Caveat"`; g.fillStyle = "#1d1d1d"; g.textAlign = "center"; g.textBaseline = "middle";
    ["punchier", "first 2", "seconds"].forEach((l, i) => g.fillText(l, 0, -50 + i * 62));
    const ck = spring(win(C.note + 0.4, C.note + 0.9, t));
    if (ck > 0) {
      g.save(); g.translate(130, 130); g.scale(ck, ck);
      g.fillStyle = "#1f9d55"; g.beginPath(); g.arc(0, 0, 50, 0, 7); g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 12; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(-22, 2); g.lineTo(-6, 18); g.lineTo(24, -16); g.stroke(); g.restore();
    }
    g.restore();
  }
  // posted toast + stamp
  const tp = outQuint(win(C.post - 0.1, C.post + 0.35, t));
  if (tp > 0) {
    g.save(); g.translate(W / 2, lerp(120, 250, tp)); g.globalAlpha = tp;
    K.shadow(g, 30, 14, 0.5, "0,0,0"); g.fillStyle = "#12161d"; K.rr(g, -330, -54, 660, 108, 54); g.fill(); K.noShadow(g);
    g.fillStyle = "#1f9d55"; g.beginPath(); g.arc(-266, 0, 30, 0, 7); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(-280, 0); g.lineTo(-270, 11); g.lineTo(-252, -10); g.stroke();
    K.font(g, 40, 700, "Inter Var"); g.fillStyle = "#fff"; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText("Reel posted · 9:15 PM", -216, 2);
    g.restore();
  }
  stamp(g, "POSTED", W / 2 - 120, 1250, 120, -7, t, C.post - 0.02);
});

// 8 · "Same reel. Fifteen minutes." — the clock barely moves now; the totals in 3D type
scene(C.s_same, C.s_outro, { type: "flash", d: 0.3 }, (g, t, lt) => {
  const z = lerp(1.0, 1.04, clamp(lt / 2.5));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  greyGrid(g);
  caseLabel(g, "SAME REEL", W / 2, 220, t, C.s_same + 0.15, { size: 46, cps: 30, color: INK });
  clockKey(g, W / 2, 520, 470, 3.4 + lt * 0.08, { glass: true, rot: 2 });   // nearly still: real-time, not racing
  extruded(g, "3:00:00", W / 2, 920, 170, "#e3262f", "#8e1218", t, C.same - 0.05, { rot: -2, alpha: lerp(1, 0.45, win(C.fifteen - 0.2, C.fifteen + 0.3, t)) });
  const sp = outCubic(win(C.fifteen - 0.25, C.fifteen + 0.05, t));
  if (sp > 0) { g.strokeStyle = "rgba(20,20,20,0.85)"; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.moveTo(230, 930); g.lineTo(230 + 620 * sp, 905); g.stroke(); }
  extruded(g, "0:15:00", W / 2, 1210, 210, "#2f6fe0", "#173f8e", t, C.fifteen - 0.02, { rot: 2, depth: 18 });
  g.restore();
});

// 9 · CTA — a real calm evening, the time it's done, and the invitation
scene(C.s_outro, C.end + 1, { type: "fade", d: 0.6 }, (g, t, lt) => {
  full(g, "fs_walk", lt, { z0: 1.03, z1: 1.12, dur: 6, ffx: 0.55, filter: "saturate(1.05) brightness(0.95)" });
  tint(g, "#1b2c55", 0.25, "soft-light");
  vignette(g, 0.65);
  g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(0, 0, W, 420);
  caseLabel(g, "9:15 PM", W / 2, 300, t, C.s_outro + 0.15, { size: 84, cps: 18, weight: 700 });
  K.font(g, 30, 600, "Mono"); g.fillStyle = "rgba(243,237,225,0.8)"; g.textAlign = "center";
  if (t > C.s_outro + 0.7) { if (g.letterSpacing !== undefined) g.letterSpacing = "6px"; g.fillText("REEL DONE · EVENING FREE", W / 2, 370); if (g.letterSpacing !== undefined) g.letterSpacing = "0px"; }
  redTag(g, "JOIN VIBE EDITING", W / 2, 1060, 104, t, C.join - 0.08, { rot: -2 });
  serifWord(g, "get your evenings back.", W / 2, 1250, 92, t, C.evenings - 0.3);
  const fo = win(C.end - 0.5, C.end, t);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
});

// ------------------------------------------------------------------ compositor --
const BUF = [K.makeCanvas(W, H), K.makeCanvas(W, H)];
function render(i, t, into) {
  const s = S[i], g = into.getContext("2d");
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none";
  s.draw(g, t, t - s.t0);
}
function frame(g, t) {
  let i = S.findIndex((s, k) => t >= s.t0 && (k === S.length - 1 || t < S[k + 1].t0));
  if (i < 0) i = 0;
  const cur = S[i], d = cur.tin.d, p = d > 0 ? clamp((t - cur.t0) / d) : 1;
  let moving = false, speed = 0;
  render(i, t, BUF[1]);
  if (p >= 1 || i === 0) {
    g.drawImage(BUF[1], 0, 0);
  } else {
    render(i - 1, t, BUF[0]);
    const A = BUF[0], B = BUF[1], e = inOutCubic(p), type = cur.tin.type;
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (type === "fade") { g.drawImage(A, 0, 0); g.globalAlpha = e; g.drawImage(B, 0, 0); g.globalAlpha = 1; }
    else if (type === "flash") {
      g.drawImage(p < 0.5 ? A : B, 0, 0);
      g.fillStyle = `rgba(255,252,245,${Math.sin(Math.PI * p) * 0.9})`; g.fillRect(0, 0, W, H);
    } else if (type === "slide") {
      g.save(); g.translate(W / 2, H / 2); g.scale(1 - 0.06 * e, 1 - 0.06 * e); g.translate(-W / 2, -H / 2);
      g.drawImage(A, 0, 0); g.fillStyle = `rgba(0,0,0,${0.5 * e})`; g.fillRect(0, 0, W, H); g.restore();
      const y = H * (1 - outQuint(p));
      g.save(); K.shadow(g, 60, -20, 0.6, "0,0,0"); g.drawImage(B, 0, y); g.restore();
      moving = p > 0.05 && p < 0.9; speed = 1 - p;
    } else if (type === "zoom") {
      g.save(); g.globalAlpha = 1 - e; g.translate(W / 2, H / 2); g.scale(1 + 0.7 * e, 1 + 0.7 * e); g.translate(-W / 2, -H / 2); g.drawImage(A, 0, 0); g.restore();
      g.save(); g.globalAlpha = e; g.translate(W / 2, H / 2); const s = 0.82 + 0.18 * outCubic(p); g.scale(s, s); g.translate(-W / 2, -H / 2); g.drawImage(B, 0, 0); g.restore();
      moving = p > 0.05 && p < 0.95; speed = Math.sin(Math.PI * p);
    } else if (type === "push") {
      g.drawImage(A, -W * e, 0); g.drawImage(B, W * (1 - e), 0);
      moving = p > 0.05 && p < 0.95; speed = Math.sin(Math.PI * p);
    } else if (type === "iris") {
      g.drawImage(A, 0, 0);
      g.save(); g.beginPath(); g.arc(W / 2, H * 0.4, Math.hypot(W, H) * 0.6 * outQuint(p), 0, 7); g.clip(); g.drawImage(B, 0, 0); g.restore();
      g.save(); g.strokeStyle = `rgba(214,18,43,${0.8 * (1 - p)})`; g.lineWidth = 8;
      g.beginPath(); g.arc(W / 2, H * 0.4, Math.hypot(W, H) * 0.6 * outQuint(p), 0, 7); g.stroke(); g.restore();
    } else g.drawImage(B, 0, 0);
  }
  K.captions(g, t, { y: 1560, size: 38, weight: 600, family: "Inter Var", color: "#fff", hi: RED, hiText: "#fff",
    box: "rgba(0,0,0,0.5)", boxPad: 20, maxW: 880 });
  K.grain(g, t, 0.05);
  return { moving, speed };
}
K.run(frame, ["400 40px Anton", "400 40px 'Archivo Black'", "italic 400 40px 'Instrument Serif'", "600 40px Mono",
  "700 40px Mono", "600 40px 'Inter Var'", "700 40px 'Inter Var'", "700 40px Caveat"]);
})();

// Is vibe editing cheating? A news-mystery case file, argued with evidence.
// Scenes are drawn whole into offscreen canvases and handed over with eased transitions.
(function () {
const { C, W, H, clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring } = K;
const RED = "#d3122b", CREAM = "#f3ede1", INK = "#151515", BLUE = "#0e2a52";
const PAPER = "../assets/paper/motion_picture_news_1918_p35.jpg";

// ------------------------------------------------------------------ helpers --
function full(g, name, lt, o = {}) {       // footage cover-fit to the frame, with a slow drift
  const z = (o.z0 ?? 1.04) + ((o.z1 ?? 1.12) - (o.z0 ?? 1.04)) * clamp(lt / (o.dur || 6));
  g.save();
  if (o.filter) g.filter = o.filter;
  const fr = K.footage(name, (o.ss || 0) + lt * (o.speed || 1), 1, o.loop);
  const fx = o.fx ?? 0.5, fy = o.fy ?? 0.5;
  K.drawFit(g, fr, -(z - 1) * W * fx, -(z - 1) * H * fy, W * z, H * z, { fx: o.ffx, fy: o.ffy });
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
function shade(g, y0, y1, a) {             // dark band so captions read
  const s = g.createLinearGradient(0, y0, 0, y1);
  s.addColorStop(0, "rgba(0,0,0,0)"); s.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = s; g.fillRect(0, y0, W, y1 - y0);
}
// typed mono label with a red underline that draws after the text, like a date card
function caseLabel(g, text, x, y, t, at, o = {}) {
  if (t < at) return;
  const size = o.size || 40;
  K.font(g, size, 600, "Mono");
  g.save(); g.textAlign = o.align || "center"; g.textBaseline = "alphabetic";
  if (g.letterSpacing !== undefined) g.letterSpacing = `${size * 0.12}px`;
  const s = K.typed(text, t, at, o.cps || 32);
  const fullW = g.measureText(text).width;
  g.fillStyle = o.color || CREAM;
  g.globalAlpha = o.alpha ?? 1;
  g.fillText(s, o.align === "left" ? x : x, y);
  if (s.length < text.length && Math.floor(t * 3) % 2 === 0) {     // caret
    const sw = g.measureText(s).width, x0 = o.align === "left" ? x : x - fullW / 2;
    g.fillRect(x0 + sw + 6, y - size * 0.8, size * 0.5, size * 0.95);
  }
  const done = at + text.length / (o.cps || 32);
  const u = outCubic(win(done, done + 0.45, t));
  if (u > 0) {
    const x0 = o.align === "left" ? x : x - fullW / 2;
    g.fillStyle = RED; g.fillRect(x0, y + size * 0.35, fullW * u, Math.max(4, size * 0.12));
  }
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
  g.restore();
}
// red tag: white condensed caps on a red block, wiped in left to right
function redTag(g, text, x, y, size, t, at, o = {}) {
  const p = win(at, at + 0.32, t);
  if (p <= 0) return;
  K.font(g, size, 400, o.font || "Anton");
  const tw = g.measureText(text).width, pad = size * 0.32, w = tw + pad * 2, h = size * 1.32;
  const e = outQuint(p), s = 1 + 0.12 * (1 - spring(win(at, at + 0.7, t)));
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(s, s);
  const x0 = o.align === "left" ? 0 : -w / 2;
  K.shadow(g, 18, 8, 0.45, "0,0,0");
  g.fillStyle = o.bg || RED; g.fillRect(x0, -h / 2, w * e, h);
  K.noShadow(g);
  g.save(); g.beginPath(); g.rect(x0, -h / 2, w * e, h); g.clip();
  g.fillStyle = o.fg || "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(text, x0 + pad, size * 0.05);
  g.restore(); g.restore();
}
// rubber stamp: slams in from large, settles, and can fade out later
function stamp(g, text, x, y, size, rot, t, at, o = {}) {
  if (t < at) return;
  const p = win(at, at + 0.22, t);
  const fade = o.fadeAt != null ? 1 - (1 - (o.fadeTo ?? 0.22)) * outCubic(win(o.fadeAt, o.fadeAt + 0.8, t)) : 1;
  const s = lerp(1.9, 1, outQuint(p)) * (1 + 0.04 * Math.sin(Math.PI * win(at + 0.22, at + 0.45, t)));
  K.font(g, size, 400, "Anton");
  if (g.letterSpacing !== undefined) g.letterSpacing = `${size * 0.06}px`;
  const tw = g.measureText(text).width, w = tw + size * 0.7, h = size * 1.35;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(s, s);
  g.globalAlpha = clamp(p * 1.6) * fade * (o.alpha ?? 0.92);
  g.strokeStyle = o.color || RED; g.fillStyle = o.color || RED; g.lineWidth = size * 0.09;
  g.strokeRect(-w / 2, -h / 2, w, h);
  g.lineWidth = size * 0.035; g.strokeRect(-w / 2 + size * 0.12, -h / 2 + size * 0.12, w - size * 0.24, h - size * 0.24);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, size * 0.05);
  // worn ink: knock out a few specks
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
  K.font(g, size, o.weight || 400, "Instrument Serif");
  g.font = `italic ${o.weight || 400} ${size}px "Instrument Serif"`;
  g.textAlign = o.align || "center"; g.textBaseline = "alphabetic";
  g.globalAlpha = p * (o.alpha ?? 1);
  if (p < 1) g.filter = `blur(${(1 - p) * 10}px)`;
  g.shadowColor = o.glow || "rgba(0,0,0,0.6)"; g.shadowBlur = o.glowBlur || 18; g.shadowOffsetY = o.glow ? 0 : 4;
  g.fillStyle = o.color || CREAM;
  g.fillText(text, x, y + 26 * (1 - p));
  g.restore();
}
// B&W print pinned to a wall or a polaroid on the grid; draw(g, x, y, w, h) fills the photo area
function print(g, x, y, w, h, rot, t, at, draw, o = {}) {
  const p = spring(win(at, at + 0.75, t));
  if (p <= 0) return;
  const border = o.border ?? 18, foot = o.foot ?? border;
  g.save(); g.translate(x + (o.dx || 0) * (1 - p), y + (o.dy ?? -60) * (1 - p)); g.rotate((rot + (1 - p) * (o.rin ?? 8)) * Math.PI / 180);
  const s = (0.92 + 0.08 * p) * (o.scale || 1); g.scale(s, s);
  g.globalAlpha = clamp(p * 2);
  K.shadow(g, 30, 16, 0.55, "0,0,0");
  g.fillStyle = o.paper || "#efece4"; g.fillRect(-w / 2 - border, -h / 2 - border, w + border * 2, h + border + foot);
  K.noShadow(g);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip();
  g.fillStyle = "#111"; g.fillRect(-w / 2, -h / 2, w, h);
  draw(g, -w / 2, -h / 2, w, h);
  g.restore();
  if (o.label) {
    K.font(g, o.labelSize || 26, 600, "Mono"); g.fillStyle = "#2a2a2a"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(o.label, 0, h / 2 + foot / 2 + 2);
  }
  if (o.pin) {                                             // a red push-pin
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.arc(4, -h / 2 - border + 10, 13, 0, 7); g.fill();
    const pg = g.createRadialGradient(-4, -h / 2 - border - 2, 2, 0, -h / 2 - border, 15);
    pg.addColorStop(0, "#ff6a6a"); pg.addColorStop(1, "#9c0e1c");
    g.fillStyle = pg; g.beginPath(); g.arc(0, -h / 2 - border, 14, 0, 7); g.fill();
  }
  if (o.after) o.after(g, w, h);
  g.restore();
}
function photo(name, lt, filter, o = {}) {
  return (g, x, y, w, h) => {
    if (filter) g.filter = filter;
    K.drawFit(g, K.footage(name, (o.ss || 0) + lt, 1, o.loop ?? true), x, y, w, h, { fx: o.fx, fy: o.fy, zoom: o.zoom });
    g.filter = "none";
  };
}
// red marker X drawn stroke by stroke over a rect
function markerX(g, x, y, w, h, t, at) {
  const a = outCubic(win(at, at + 0.22, t)), b = outCubic(win(at + 0.2, at + 0.42, t));
  if (a <= 0) return;
  g.save(); g.strokeStyle = "rgba(214,18,43,0.92)"; g.lineWidth = 16; g.lineCap = "round";
  g.shadowColor = "rgba(0,0,0,0.35)"; g.shadowBlur = 6;
  g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, x + w, a), lerp(y, y + h, a)); g.stroke();
  if (b > 0) { g.beginPath(); g.moveTo(x + w, y); g.lineTo(lerp(x + w, x, b), lerp(y, y + h, b)); g.stroke(); }
  g.restore();
}
// 3D extruded word, popped in on a spring
function extruded(g, text, x, y, size, face, side, t, at, o = {}) {
  const p = spring(win(at, at + 0.7, t));
  if (p <= 0) return;
  g.save(); g.translate(x, y + 40 * (1 - p)); g.rotate((o.rot || 0) * Math.PI / 180); const s = 0.6 + 0.4 * p; g.scale(s, s);
  g.globalAlpha = clamp(p * 2.5);
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
  const r = K.rnd(7);                              // plaster blotches
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = r() * H, rad = 80 + r() * 260, gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(${r() < 0.5 ? "0,0,0" : "120,150,130"},${0.05 + r() * 0.05})`); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // a soft window-light beam drifting across
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
function wood(g, lt, dark = 0.45) {        // the real wooden desk, darkened
  full(g, "oh_wood", 0, { z0: 1.05, z1: 1.05, filter: `brightness(${1 - dark}) saturate(0.85)` });
}

// ------------------------------------------------------------------ scenes --
// Each scene: [t0, t1, draw(g, t, lt), transition-in {type, d}].
const S = [];
function scene(t0, t1, tin, draw) { S.push({ t0, t1, tin, draw }); }

// 1 · "Some editors call it cheating." — a reader behind his paper
scene(0, C.video - 0.1, { type: "cut", d: 0 }, (g, t, lt) => {
  full(g, "ch_reader", lt, { ss: 0.6, z0: 1.12, z1: 1.02, dur: 2.4, filter: "saturate(0.55) contrast(1.08) brightness(0.92)" });
  tint(g, "#4b82c4", 0.45, "soft-light");
  vignette(g, 0.75);
  g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 0, W, 300);
  caseLabel(g, "THE CASE OF VIBE EDITING", W / 2, 235, t, 0.05, { size: 42, cps: 34 });
  redTag(g, "SOME EDITORS CALL IT", W / 2, 1040, 58, t, 0.45, { bg: "#111", fg: CREAM });
  redTag(g, "CHEATING.", W / 2, 1160, 120, t, C.cheating - 0.05, { rot: -2 });
});

// 2 · "A video, made from a few sentences." — the headline on a dark wooden desk
const HEAD1 = "EDITOR MAKES A VIDEO", HEAD2 = "FROM A FEW SENTENCES";
scene(C.video - 0.1, C.s_claim, { type: "slide", d: 0.42 }, (g, t, lt) => {
  wood(g, lt, 0.55);
  const z = lerp(1.0, 1.1, inOutCubic(clamp(lt / 2.6)));
  g.save(); g.translate(W / 2, H * 0.47); g.scale(z, z); g.rotate(-5 * Math.PI / 180);
  const pw = 860, ph = 1180;
  K.shadow(g, 50, 30, 0.6, "0,0,0");
  g.fillStyle = "#ece5d5"; g.fillRect(-pw / 2, -ph / 2, pw, ph);
  K.noShadow(g);
  const paper = K.img(PAPER);                      // real 1918 newsprint as the paper's grain
  if (paper) { g.save(); g.globalAlpha = 0.16; g.globalCompositeOperation = "multiply"; g.drawImage(paper, -pw / 2, -ph / 2, pw, ph); g.restore(); }
  g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "alphabetic";
  g.font = `800 96px "EB Garamond"`; g.fillText("The Daily Cut", 0, -ph / 2 + 120);
  g.fillRect(-pw / 2 + 40, -ph / 2 + 146, pw - 80, 4); g.fillRect(-pw / 2 + 40, -ph / 2 + 196, pw - 80, 2);
  K.font(g, 20, 600, "Mono"); g.fillText("LATE EDITION  ·  EDITING  ·  ONE SENTENCE AT A TIME", 0, -ph / 2 + 180);
  g.font = `800 68px "EB Garamond"`;
  g.fillText(HEAD1, 0, -ph / 2 + 290); g.fillText(HEAD2, 0, -ph / 2 + 368);
  // red pen circle round VIDEO, green highlighter over A FEW SENTENCES
  const w1 = g.measureText(HEAD1).width, wV = g.measureText("VIDEO").width;
  const vx = -w1 / 2 + g.measureText("EDITOR MAKES A ").width + wV / 2, vy = -ph / 2 + 268;
  const w2 = g.measureText(HEAD2).width, hx0 = -w2 / 2 + g.measureText("FROM ").width, hw = g.measureText("A FEW SENTENCES").width;
  const hp = outCubic(win(C.few - 0.05, C.few + 0.5, t));
  if (hp > 0) {
    g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = "rgba(120,240,80,0.75)";
    g.beginPath(); g.moveTo(hx0 - 10, -ph / 2 + 322); g.lineTo(hx0 - 10 + (hw + 20) * hp, -ph / 2 + 318);
    g.lineTo(hx0 - 10 + (hw + 20) * hp, -ph / 2 + 384); g.lineTo(hx0 - 10, -ph / 2 + 388); g.closePath(); g.fill(); g.restore();
  }
  const cp = outCubic(win(C.video + 0.15, C.video + 0.65, t));
  if (cp > 0) {
    g.save(); g.strokeStyle = "rgba(205,20,35,0.9)"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.ellipse(vx, vy, wV / 2 + 34, 52, -0.06, -2.2, -2.2 + Math.PI * 2.15 * cp); g.stroke(); g.restore();
  }
  // the photo: someone typing a few sentences (real footage, newsprint B&W)
  const px = -pw / 2 + 50, py = -ph / 2 + 420, pW = pw - 100, pH = 430;
  g.save(); g.beginPath(); g.rect(px, py, pW, pH); g.clip();
  g.filter = "grayscale(1) contrast(1.25) brightness(1.05)";
  K.drawFit(g, K.footage("typing", lt + 1), px, py, pW, pH, {});
  g.filter = "none";
  g.globalCompositeOperation = "multiply"; g.fillStyle = "rgba(236,229,213,0.25)"; g.fillRect(px, py, pW, pH);
  g.restore();
  K.font(g, 20, 500, "Mono"); g.fillStyle = "#3a3a3a"; g.textAlign = "left";
  g.fillText("A few lines of text. A finished video.", px, py + pH + 30);
  // body columns
  g.fillStyle = "rgba(40,40,40,0.55)";
  const r = K.rnd(3);
  for (let c = 0; c < 3; c++) for (let i = 0; i < 9; i++) {
    const cx = -pw / 2 + 50 + c * ((pw - 100) / 3 + 4), cw = (pw - 100) / 3 - 22;
    g.fillRect(cx, py + pH + 60 + i * 24, cw * (i === 8 ? 0.5 : 0.82 + 0.18 * r()), 9);
  }
  g.restore();
  vignette(g, 0.6, 0.3);
});

// 3 · "The accusation? The AI did the work." — case card, then the investigator
scene(C.s_claim, C.s_ex, { type: "flash", d: 0.3 }, (g, t, lt) => {
  const reveal = C.accusation + 0.42;
  if (t < reveal + 0.5) {
    g.fillStyle = "#050607"; g.fillRect(0, 0, W, H);
    K.grain(g, t, 0.1);
    caseLabel(g, "CASE FILE · NO. 01", W / 2, 840, t, C.s_claim + 0.05, { size: 40, cps: 60, alpha: 0.75 });
    caseLabel(g, "THE ACCUSATION", W / 2, 980, t, C.accusation - 0.2, { size: 78, cps: 40 });
  }
  if (t >= reveal) {                               // focus pull into the investigator
    const p = outCubic(win(reveal, reveal + 0.55, t));
    g.save(); g.globalAlpha = p;
    full(g, "ch_detective", t - reveal, { z0: 1.16, z1: 1.04, dur: 2.6, filter: `blur(${(1 - p) * 18}px) saturate(0.6) contrast(1.1) brightness(0.9)` });
    tint(g, "#2a5fa8", 0.5, "soft-light");
    vignette(g, 0.7);
    shade(g, 1150, 1700, 0.75);
    g.restore();
    caseLabel(g, "CLAIM", 120, 1150, t, reveal + 0.15, { size: 30, cps: 30, align: "left", alpha: 0.8 });
    redTag(g, "THE AI", 120, 1250, 92, t, C.ai1 - 0.05, { align: "left" });
    redTag(g, "DID THE WORK", 120, 1380, 92, t, C.work - 0.12, { align: "left", bg: "#111", fg: CREAM });
  }
});

// 4 · "No timeline. No keyframes. No late nights." — the exhibits, crossed out
const EX = [
  { x: 300, y: 560, rot: -4, name: "ch_blueprint", label: "A · TIMELINE", at: () => C.no_tl },
  { x: 790, y: 660, rot: 5, name: "cw_software", label: "B · KEYFRAMES", at: () => C.no_kf },
  { x: 520, y: 1100, rot: -2, name: "tired", label: "C · LATE NIGHTS", at: () => C.no_ln },
];
scene(C.s_ex, C.s_twist, { type: "zoom", d: 0.45 }, (g, t, lt) => {
  const back = inOutQuint(win(C.no_kf - 0.45, C.no_kf + 0.05, t));     // full-bleed plan pulls back into exhibit A
  blueprintGrid(g);
  K.grain(g, t, 0.06);
  serifWord(g, "the exhibits", W / 2, 260, 96, t, C.no_kf - 0.2, { color: "#dbe8ff" });
  for (const [i, e] of EX.entries()) {
    if (i === 0) continue;
    print(g, e.x, e.y, 400, 300, e.rot, t, e.at() - 0.15, photo(e.name, lt, "grayscale(0.6) contrast(1.1)"), {
      label: e.label, pin: true, foot: 64,
      after: (gg, w, h) => markerX(gg, -w / 2 + 20, -h / 2 + 20, w - 40, h - 40, t, e.at() + 0.35),
    });
  }
  // exhibit A starts full-bleed: a real plan, crossed out in red, then flies to its slot
  const a = EX[0];
  const fw = lerp(W, 400, back), fh = lerp(H, 300, back), cx = lerp(W / 2, a.x, back), cy = lerp(H / 2, a.y, back);
  g.save(); g.translate(cx, cy); g.rotate(a.rot * back * Math.PI / 180);
  if (back > 0.02) {
    const border = 18 * back, foot = 64 * back;
    K.shadow(g, 30, 16, 0.55 * back, "0,0,0");
    g.fillStyle = "#efece4"; g.fillRect(-fw / 2 - border, -fh / 2 - border, fw + border * 2, fh + border + foot);
    K.noShadow(g);
  }
  g.save(); g.beginPath(); g.rect(-fw / 2, -fh / 2, fw, fh); g.clip();
  g.filter = `grayscale(${0.6 * back}) contrast(1.05) brightness(${lerp(0.82, 1, back)})`;
  K.drawFit(g, K.footage("ch_blueprint", lt * 1.15), -fw / 2, -fh / 2, fw, fh, {});
  g.filter = "none";
  g.fillStyle = `rgba(14,42,82,${0.28 * (1 - back)})`; g.fillRect(-fw / 2, -fh / 2, fw, fh);
  g.restore();
  if (back > 0.6) {
    g.globalAlpha = win(0.6, 1, back);
    K.font(g, 26, 600, "Mono"); g.fillStyle = "#2a2a2a"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(a.label, 0, fh / 2 + 34);
    g.globalAlpha = 1;
    g.fillStyle = "#9c0e1c"; g.beginPath(); g.arc(0, -fh / 2 - 18, 14, 0, 7); g.fill();
  }
  g.restore();
  if (back < 0.5) {                                  // while full-bleed: the line, in italic serif
    g.save(); g.globalAlpha = 1 - back * 2;
    shade(g, 1100, 1500, 0.55);
    redTag(g, "EXHIBIT A", W / 2, 300, 54, t, C.s_ex + 0.1);
    g.font = `italic 400 150px "Instrument Serif"`;
    const wNo = g.measureText("No ").width, wTl = g.measureText("timeline.").width, x0 = (W - wNo - wTl) / 2;
    serifWord(g, "No", x0, 1260, 150, t, C.no_tl - 0.3, { color: "#fff", align: "left" });
    serifWord(g, "timeline.", x0 + wNo, 1260, 150, t, C.no_tl - 0.05, { color: "#fff", align: "left" });
    g.restore();
  }
  // crossed out exhibits get the verdict of the accusation
  stamp(g, "NO TIMELINE · NO KEYFRAMES · NO LATE NIGHTS", W / 2, 1520 - 160, 40, -3, t, C.no_ln + 0.55);
  vignette(g, 0.5, 0.4);
});

// 5 · "But there was a twist." — stacked italic serif on the green wall
scene(C.s_twist, C.s_hist, { type: "fade", d: 0.5 }, (g, t, lt) => {
  const z = lerp(1.0, 1.08, clamp(lt / 2.2));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  greenWall(g, t);
  serifWord(g, "But", W / 2 - 150, 700, 150, t, C.but - 0.1);
  serifWord(g, "there", W / 2 + 110, 840, 150, t, C.there - 0.05);
  serifWord(g, "was", W / 2 - 120, 980, 150, t, C.was - 0.05);
  serifWord(g, "a", W / 2 + 160, 1060, 150, t, C.a - 0.05);
  serifWord(g, "twist.", W / 2, 1260, 250, t, C.twist - 0.05, { glow: "rgba(255,230,180,0.55)", glowBlur: 40 });
  g.restore();
  const f = Math.sin(Math.PI * win(C.twist - 0.02, C.twist + 0.22, t));     // a flicker of light on "twist"
  if (f > 0) { g.fillStyle = `rgba(255,248,230,${0.35 * f})`; g.fillRect(0, 0, W, H); }
  vignette(g, 0.55);
  K.grain(g, t, 0.08);
});

// 6 · "Every new editing tool got the same reaction. Cutting on a computer. Templates. Presets."
const BW = "grayscale(1) contrast(1.2) brightness(1.02)";
function templateGrid(lt) {                       // a page of templates: a grid of real clips
  const names = ["rv_laugh", "hw_listening", "ai_editor", "fk_filmcam", "typing", "ai_thinker"];
  return (g, x, y, w, h) => {
    g.fillStyle = "#dcdcdc"; g.fillRect(x, y, w, h);
    const cw = (w - 40) / 3, ch = (h - 30) / 2;
    names.forEach((n, i) => {
      const cx = x + 10 + (i % 3) * (cw + 10), cy = y + 10 + Math.floor(i / 3) * (ch + 10);
      g.filter = BW; K.drawFit(g, K.footage(n, lt + i * 0.7, 1, true), cx, cy, cw, ch, {}); g.filter = "none";
      g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(cx, cy + ch - 22, cw, 22);
      K.font(g, 14, 600, "Mono"); g.fillStyle = "#fff"; g.textAlign = "left"; g.textBaseline = "middle";
      g.fillText(`TEMPLATE 0${i + 1}`, cx + 8, cy + ch - 11);
    });
  };
}
function presetList(lt) {                         // a preset browser: real look, labelled rows
  const rows = ["Film 35", "Teal & Orange", "Noir", "Warm Vintage", "Clean"];
  return (g, x, y, w, h) => {
    g.fillStyle = "#1c1c1c"; g.fillRect(x, y, w, h);
    g.filter = BW; K.drawFit(g, K.footage("ai_grade", lt + 1, 1, true), x + w * 0.42, y, w * 0.58, h, {}); g.filter = "none";
    rows.forEach((r, i) => {
      const ry = y + 22 + i * ((h - 40) / rows.length);
      g.fillStyle = i === 1 ? "#cfcfcf" : "#3a3a3a"; g.fillRect(x + 14, ry, w * 0.38, (h - 40) / rows.length - 8);
      K.font(g, 18, 600, "Mono"); g.fillStyle = i === 1 ? "#111" : "#ddd"; g.textAlign = "left"; g.textBaseline = "middle";
      g.fillText(r, x + 26, ry + ((h - 40) / rows.length - 8) / 2);
    });
  };
}
const HIST = [
  { x: 300, y: 560, rot: -3, at: () => C.every, label: "1950s · CUT BY HAND", draw: (lt) => photo("ff_moviola_wide", lt, BW) },
  { x: 790, y: 610, rot: 4, at: () => C.computer, label: "CUTTING ON A COMPUTER", draw: (lt) => photo("ai_editor", lt, BW) },
  { x: 300, y: 1040, rot: 3, at: () => C.templates, label: "TEMPLATES", draw: (lt) => templateGrid(lt) },
  { x: 790, y: 1090, rot: -4, at: () => C.presets, label: "PRESETS", draw: (lt) => presetList(lt) },
];
scene(C.s_hist, C.s_you, { type: "push", d: 0.55 }, (g, t, lt) => {
  const z = lerp(1.06, 1.0, inOutCubic(clamp(lt / 6)));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  greenWall(g, t + 3);
  serifWord(g, "every new tool…", W / 2, 230, 92, t, C.every - 0.1);
  for (const h of HIST) {
    print(g, h.x, h.y, 400, 300, h.rot, t, h.at() - 0.12, h.draw(lt), { label: h.label, pin: true, foot: 64, labelSize: 22 });
  }
  // the same reaction, every time: a stamp per tool, each one fading as the next lands
  const ats = [C.reaction - 0.05, C.computer + 0.35, C.templates + 0.3, C.presets + 0.25];
  HIST.forEach((h, i) => {
    stamp(g, "CHEATING?", h.x + 10, h.y + 10, 66, h.rot - 10, t, ats[i], { fadeAt: ats[i + 1] ?? 999, fadeTo: 0.3 });
  });
  g.restore();
  vignette(g, 0.55);
  K.grain(g, t, 0.08);
});

// 7 · "And the AI still can't pick the story, the moment, or the feeling."
const CARDS = [
  { x: 250, y: 1090, rot: -7, name: "ai_thinker", label: "THE STORY", at: () => C.story },
  { x: 540, y: 1150, rot: 2, name: "rv_laugh", label: "THE MOMENT", at: () => C.moment },
  { x: 830, y: 1090, rot: 8, name: "hw_listening", label: "THE FEELING", at: () => C.feeling },
];
scene(C.s_you, C.youdo - 0.12, { type: "focus", d: 0.5 }, (g, t, lt) => {
  full(g, "ch_chess", lt, { z0: 1.02, z1: 1.12, dur: 5, filter: "saturate(0.8) contrast(1.1) brightness(0.85)" });
  tint(g, "#ff9a3c", 0.18, "soft-light");
  vignette(g, 0.7);
  shade(g, 800, 1500, 0.6);
  caseLabel(g, "WHAT THE AI CAN'T PICK", W / 2, 250, t, C.s_you + 0.25, { size: 38, cps: 36 });
  for (const c of CARDS) {
    print(g, c.x, c.y, 250, 300, c.rot, t, c.at() - 0.12, photo(c.name, lt, "saturate(0.85) contrast(1.05)"),
      { label: c.label, foot: 70, labelSize: 22, dx: 300, dy: 120, rin: 14, paper: "#f1ece0" });
  }
});

// 7b · "You do." — a keyhole opens on a red room
scene(C.youdo - 0.12, C.s_verdict + 0.25, { type: "iris", d: 0.55 }, (g, t, lt) => {
  g.fillStyle = "#050303"; g.fillRect(0, 0, W, H);
  const p = outQuint(win(C.youdo - 0.12, C.youdo + 0.7, t));
  const s = lerp(0.55, 1.18, p);
  g.save(); g.translate(W / 2, H * 0.47); g.scale(s, s);
  keyhole(g);
  g.save(); keyhole(g); g.clip();
  g.setTransform(1, 0, 0, 1, 0, 0);
  full(g, "ch_dark", lt + 1.5, { z0: 1.2, z1: 1.1, dur: 2, filter: "grayscale(0.4) contrast(1.15) brightness(0.95)" });
  tint(g, "#ff1a1a", 0.55, "multiply"); tint(g, "#ff3b2f", 0.35, "screen");
  g.restore();
  g.restore();
  g.save(); g.translate(W / 2, H * 0.47); g.scale(s, s);                    // red rim light round the keyhole
  g.strokeStyle = "rgba(255,70,50,0.55)"; g.lineWidth = 8; g.shadowColor = "rgba(255,40,30,0.9)"; g.shadowBlur = 40;
  keyhole(g); g.stroke(); g.restore();
  redTag(g, "YOU DO.", W / 2, 1380, 130, t, C.youdo - 0.02);
  K.grain(g, t, 0.08);
});
function keyhole(g) {
  g.beginPath();
  g.arc(0, -260, 300, Math.PI * 0.68, Math.PI * 2.32);
  g.lineTo(230, 640); g.lineTo(-230, 640); g.closePath();
}

// 8 · "So, is it cheating?" — the thinker, then "Only if you stop thinking." in 3D type
scene(C.s_verdict + 0.25, C.only - 0.15, { type: "whip", d: 0.38 }, (g, t, lt) => {
  full(g, "ch_thinker", lt, { z0: 1.0, z1: 1.1, dur: 2, filter: "saturate(0.7) contrast(1.1) brightness(0.9)" });
  tint(g, "#3d6fb3", 0.3, "soft-light");
  vignette(g, 0.65);
  shade(g, 1050, 1500, 0.7);
  caseLabel(g, "THE VERDICT", W / 2, 250, t, C.s_verdict + 0.3, { size: 44, cps: 36 });
  redTag(g, "SO, IS IT", W / 2, 1180, 92, t, C.is_it - 0.25, { bg: "#111", fg: CREAM });
  redTag(g, "CHEATING?", W / 2, 1310, 132, t, C.cheat2 - 0.05, { rot: -2 });
});
scene(C.only - 0.15, C.s_outro, { type: "flash", d: 0.3 }, (g, t, lt) => {
  const z = lerp(1.0, 1.05, clamp(lt / 2));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  greyGrid(g);
  extruded(g, "ONLY IF", W / 2, 620, 170, "#f6c90e", "#a8790a", t, C.only - 0.05, { rot: -3 });
  extruded(g, "YOU STOP", W / 2, 840, 170, "#e3262f", "#8e1218", t, C.stop - 0.25, { rot: 2 });
  extruded(g, "THINKING.", W / 2, 1060, 170, "#2f6fe0", "#173f8e", t, C.thinking - 0.02, { rot: -2 });
  g.restore();
  K.grain(g, t, 0.05);
});

// 9 · CTA — the verdicts come in as comments, a real retro TV asks for yours, and a JOIN button
const COMMENTS = [
  { who: "edit.with.mira", text: "Not cheating. It's a tool.", at: () => C.comment + 0.1, x: -40, rot: -2 },
  { who: "cutsbyjay", text: "Only if you stop thinking.", at: () => C.verdict2 + 0.3, x: 50, rot: 1.5 },
  { who: "reelroom", text: "Verdict: it's directing.", at: () => C.join - 0.25, x: -20, rot: -1 },
];
scene(C.s_outro, C.end + 1, { type: "zoom", d: 0.45 }, (g, t, lt) => {
  const z = lerp(1.0, 1.06, inOutCubic(clamp((t - C.join) / (C.end - C.join))));   // slow push-in on the CTA
  g.translate(W / 2, H * 0.45); g.scale(z, z); g.translate(-W / 2, -H * 0.45);
  wood(g, lt, 0.5);
  vignette(g, 0.7, 0.3);
  extruded(g, "YOUR", W / 2, 250, 110, "#f6c90e", "#a8790a", t, C.comment - 0.15, { rot: -3, depth: 12 });
  extruded(g, "VERDICT?", W / 2, 390, 140, "#e3262f", "#8e1218", t, C.verdict2 - 0.1, { rot: 2, depth: 14 });
  // real retro TV with a comment box typing on its screen
  const tvIn = spring(win(C.s_outro + 0.1, C.s_outro + 0.9, t));
  tvbox(g, W / 2, lerp(1350, 1060, tvIn), 820, (gg, sx, sy, sw, sh) => {
    gg.fillStyle = "#101216"; gg.fillRect(sx, sy, sw, sh);
    K.font(gg, 24, 700, "Mono"); gg.fillStyle = "#e3262f"; gg.textAlign = "left"; gg.textBaseline = "middle";
    gg.fillText("● LIVE  COMMENTS", sx + 22, sy + 30);
    gg.fillStyle = "#23272e"; K.rr(gg, sx + 18, sy + sh - 96, sw - 36, 70, 14); gg.fill();
    const txt = K.typed("my verdict: ", t, C.verdict2 + 0.2, 14);
    K.font(gg, 30, 600, "Mono"); gg.fillStyle = "#fff"; gg.fillText(txt + (Math.floor(t * 2.5) % 2 ? "_" : ""), sx + 38, sy + sh - 61);
    K.font(gg, 34, 700, "Inter Var"); gg.fillStyle = "#cfd3d8"; gg.textAlign = "center";
    gg.fillText("Is it cheating?", sx + sw / 2, sy + sh / 2 - 22);
  }, t);
  // comment bubbles pop out of the screen and stack above it
  COMMENTS.forEach((c, i) => {
    const p = spring(win(c.at(), c.at() + 0.65, t));
    if (p <= 0) return;
    const y = lerp(1000, 560 + i * 112, outCubic(win(c.at(), c.at() + 0.5, t)));
    g.save(); g.translate(W / 2 + c.x, y); g.rotate(c.rot * Math.PI / 180); g.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p);
    g.globalAlpha = clamp(p * 2);
    const bw = 800, bh = 96;
    K.shadow(g, 24, 12, 0.5, "0,0,0");
    g.fillStyle = "#f4f1ea"; K.rr(g, -bw / 2, -bh / 2, bw, bh, 26); g.fill(); K.noShadow(g);
    g.fillStyle = ["#e3262f", "#2f6fe0", "#d4a20a"][i]; g.beginPath(); g.arc(-bw / 2 + 52, 0, 28, 0, 7); g.fill();
    K.font(g, 22, 700, "Inter Var"); g.fillStyle = "#6b6b6b"; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText("@" + c.who, -bw / 2 + 98, -20);
    K.font(g, 34, 700, "Inter Var"); g.fillStyle = "#151515"; g.fillText(c.text, -bw / 2 + 98, 18);
    g.restore();
  });
  // JOIN VIBE EDITING button, pressed by a cursor
  const bp = spring(win(C.join - 0.1, C.join + 0.6, t));
  if (bp > 0) {
    const press = Math.sin(Math.PI * win(C.vibe + 0.55, C.vibe + 0.8, t));
    g.save(); g.translate(W / 2, 1385); const s = (0.7 + 0.3 * bp) * (1 - 0.05 * press); g.scale(s, s);
    g.globalAlpha = clamp(bp * 2);
    K.shadow(g, 30, 14, 0.5, "0,0,0");
    g.fillStyle = RED; K.rr(g, -330, -56, 660, 112, 56); g.fill(); K.noShadow(g);
    g.font = `400 62px "Anton"`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    if (g.letterSpacing !== undefined) g.letterSpacing = "3px";
    g.fillText("JOIN VIBE EDITING", 0, 4);
    if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
    g.restore();
    const cIn = outCubic(win(C.vibe, C.vibe + 0.55, t));
    if (cIn > 0) cursor(g, lerp(1000, 720, cIn), lerp(1560, 1400, cIn), press);
    const ring = win(C.vibe + 0.62, C.vibe + 1.3, t);
    if (ring > 0 && ring < 1) { g.strokeStyle = `rgba(255,255,255,${0.8 * (1 - ring)})`; g.lineWidth = 6; K.rr(g, W / 2 - 330 - 40 * ring, 1329 - 40 * ring, 660 + 80 * ring, 112 + 80 * ring, 56 + 40 * ring); g.stroke(); }
  }
  // fade out
  const fo = win(C.end - 0.5, C.end, t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
});
function cursor(g, x, y, press) {
  g.save(); g.translate(x, y); const s = 1.6 * (1 - 0.12 * press); g.scale(s, s);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 46); g.lineTo(11, 35); g.lineTo(19, 53); g.lineTo(27, 49); g.lineTo(19, 32); g.lineTo(34, 32); g.closePath();
  K.shadow(g, 10, 5, 0.5, "0,0,0"); g.fillStyle = "#fff"; g.fill(); K.noShadow(g);
  g.lineWidth = 2.5; g.strokeStyle = "#111"; g.stroke(); g.restore();
}
const TV = { x0: 0.29, y0: 0.3474, x1: 0.708, y1: 0.9242 };
function tvbox(g, cx, cy, w, screen, t) {
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
    } else if (type === "slide") {                   // the new page slides up over the old one
      g.save(); g.translate(W / 2, H / 2); g.scale(1 - 0.06 * e, 1 - 0.06 * e); g.translate(-W / 2, -H / 2);
      g.drawImage(A, 0, 0); g.fillStyle = `rgba(0,0,0,${0.5 * e})`; g.fillRect(0, 0, W, H); g.restore();
      const y = H * (1 - outQuint(p));
      g.save(); K.shadow(g, 60, -20, 0.6, "0,0,0"); g.drawImage(B, 0, y); g.restore();
      moving = p > 0.05 && p < 0.9; speed = 1 - p;
    } else if (type === "zoom") {                    // scale-through
      g.save(); g.globalAlpha = 1 - e; g.translate(W / 2, H / 2); g.scale(1 + 0.7 * e, 1 + 0.7 * e); g.translate(-W / 2, -H / 2); g.drawImage(A, 0, 0); g.restore();
      g.save(); g.globalAlpha = e; g.translate(W / 2, H / 2); const s = 0.82 + 0.18 * outCubic(p); g.scale(s, s); g.translate(-W / 2, -H / 2); g.drawImage(B, 0, 0); g.restore();
      moving = p > 0.05 && p < 0.95; speed = Math.sin(Math.PI * p);
    } else if (type === "push") {                    // camera pans across the same wall
      g.drawImage(A, -W * e, 0); g.drawImage(B, W * (1 - e), 0);
      moving = p > 0.05 && p < 0.95; speed = Math.sin(Math.PI * p);
    } else if (type === "whip") {
      g.drawImage(A, 0, -H * e); g.drawImage(B, 0, H * (1 - e));
      moving = p > 0.05 && p < 0.95; speed = Math.sin(Math.PI * p);
    } else if (type === "focus") {                   // rack focus: old blurs out, new sharpens in
      g.save(); g.filter = `blur(${24 * e}px)`; g.drawImage(A, 0, 0); g.restore();
      g.save(); g.globalAlpha = e; g.filter = `blur(${24 * (1 - e)}px)`; g.drawImage(B, 0, 0); g.restore();
    } else if (type === "iris") {                    // the new scene opens inside a circle
      g.drawImage(A, 0, 0);
      g.save(); g.beginPath(); g.arc(W / 2, H * 0.45, Math.hypot(W, H) * 0.6 * outQuint(p), 0, 7); g.clip(); g.drawImage(B, 0, 0); g.restore();
    } else g.drawImage(B, 0, 0);
  }
  // captions on top of everything except the verdict 3D type and the CTA (big type says it there)
  const quiet = t >= C.only - 0.15 && t < C.s_outro;
  if (!quiet) K.captions(g, t, { y: 1560, size: 38, weight: 600, family: "Inter Var", color: "#fff", hi: RED, hiText: "#fff",
    box: "rgba(0,0,0,0.5)", boxPad: 20, maxW: 880 });
  K.grain(g, t, 0.05);
  return { moving, speed };
}
K.run(frame, ["400 40px Anton", "400 40px 'Archivo Black'", "italic 400 40px 'Instrument Serif'", "600 40px Mono",
  "800 40px 'EB Garamond'", "600 40px 'Inter Var'", "700 40px 'Inter Var'"]);
})();

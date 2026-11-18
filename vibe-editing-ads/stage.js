// Vibe Editing ad stage: the whole 9:16 frame as renderAt(frame). Reads window.TL (build/<id>/timeline.js).
// Layer order per frame: backdrop > title > card [footage > behind-head layers > subject matte > front layers] > CTA.
(() => {
const TL = window.TL;
const cv = document.getElementById("c"), X = cv.getContext("2d");
const W = 1080, H = 1920;
// theme ------------------------------------------------------------------
const AMBER = "#FFB15C", EMBER = "#FF7A2F", CREAM = "#FFF4E6", INK = "#1A0F06", RED = "#FF4A3D";
const SANS = "Inter Tight", SERIF = "Instrument Serif", BASIC = "Montserrat", MONO = "JetBrains Mono", EMOJI = "Noto Color Emoji";
// layout -----------------------------------------------------------------
const CARD = { x: 70, y: 548, w: 940, h: 990, r: 48 };
const CAP_LINE = 1446, CAP_SMALL = 1366, CAP_BIG = 1452, CAP_REST = 1504, HERO_SMALL = 1512;
const FW = 1600, FH = 1440;
const fps = TL.fps;
// utils ------------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const win = (t, a, d) => clamp((t - a) / d);
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eInOut = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eBack = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (t, a, b) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const rnd = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const font = (c, w, size, fam, italic) => { c.font = `${italic ? "italic " : ""}${w} ${size}px "${fam}"`; };
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function mk(w, h) { const k = document.createElement("canvas"); k.width = w; k.height = h; return [k, k.getContext("2d")]; }
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("load " + src)); i.src = src; });
const pad5 = (n) => String(n).padStart(5, "0");

// offscreen layers --------------------------------------------------------
const [cardC, cardX] = mk(CARD.w, CARD.h);       // card contents
const [subC, subX] = mk(CARD.w, CARD.h);         // subject (matted) layer
const [maskC, maskX] = mk(576, 512);             // matte with alpha
const [blurC, blurX] = mk(94, 99);               // cheap blur source
const [tmpC, tmpX] = mk(CARD.w, CARD.h);
// grain tiles
const grain = [];
for (let g = 0; g < 4; g++) {
  const [k, c] = mk(540, 960); const id = c.createImageData(540, 960); const r = rnd(77 + g * 13);
  for (let i = 0; i < id.data.length; i += 4) { const v = 110 + r() * 60 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  c.putImageData(id, 0, 0); grain.push(k);
}

// derived timeline structures ----------------------------------------------
const TG = TL.turn.tg, TR = TL.turn.tr, SPEECH_END = TL.speech_end;
const heroSpans = [];
for (const c of TL.captions) {
  if (c.layout !== "hero") continue;
  const hw = c.words.find((w) => w.i === c.opts.hero);
  if (c.opts.keep_hero && heroSpans.length) { heroSpans[heroSpans.length - 1].t1 = c.t1; continue; }
  heroSpans.push({ text: hw.text, t0: hw.t - 0.12, t1: c.t1 });
}
const mgOf = (type) => TL.mg.filter((m) => m.type === type);
const active = (m, t, pre = 0, post = 0) => t >= m.t0 - pre && t <= m.t1 + post;

// camera -----------------------------------------------------------------
function camera(t, fi) {
  let z = 1.06;
  const cam = TL.cams.find((c) => t >= c[0] - 1e-6 && t < c[1] + 1e-6) || TL.cams[TL.cams.length - 1];
  const k = clamp((t - cam[0]) / Math.max(0.01, cam[1] - cam[0]));
  z *= lerp(cam[2], cam[3], eInOut(k));
  for (const p of TL.punches) {                     // punch-in held to the end of the shot
    if (t >= p - 0.02 && p >= cam[0] - 0.05 && p < cam[1]) z *= 1 + 0.07 * eOut(win(t, p - 0.02, 0.16));
  }
  if (t > SPEECH_END) z *= 1 + 0.04 * eInOut(win(t, SPEECH_END, 2.5));
  // hero moments: punch in + tilt down so the neckline rises into frame for the word
  let ha = 0;
  for (const h of heroSpans) ha = Math.max(ha, smooth(t, h.t0 - 0.2, h.t0 + 0.15) * (1 - smooth(t, h.t1 - 0.05, h.t1 + 0.3)));
  z *= 1 + 0.16 * ha;
  const s = (CARD.h / FH) * z;
  const top = TL.head[0][fi], hcx = TL.head[1][fi];
  const cx = lerp(0.5, hcx, 0.75);
  let x0 = CARD.w / 2 - cx * FW * s;
  x0 = clamp(x0, CARD.w - FW * s, 0);
  let y0 = 46 - top * FH * s;
  if (ha > 0) y0 = lerp(y0, 640 - TL.neck[0][fi] * FH * s, ha);
  y0 = clamp(y0, CARD.h - FH * s, 0);
  // gentle handheld-smoothing drift so locked shots still breathe (premium only)
  const pr = smooth(t, TR, TR + 0.6);
  x0 += pr * Math.sin(t * 0.7) * 3; y0 += pr * Math.cos(t * 0.53) * 2;
  return { s, x0, y0 };
}
function headGeom(cam, fi) {
  const top = TL.head[0][fi], hcx = TL.head[1][fi], hw = TL.head[2][fi];
  const wpx = hw * FW * cam.s;
  const cx = cam.x0 + hcx * FW * cam.s, ty = cam.y0 + top * FH * cam.s;
  return { cx, top: ty, w: wpx, cy: ty + wpx * 0.62, neck: cam.y0 + TL.neck[0][fi] * FH * cam.s };
}

const chinY = (hg) => hg.neck;
// ---------------------------------------------------------------- backdrop
function backdrop(t) {
  const w = smooth(t, TR - 0.1, TR + 0.9);
  X.fillStyle = `rgb(${lerp(17, 14, w) | 0},${lerp(17, 11, w) | 0},${lerp(19, 9, w) | 0})`;
  X.fillRect(0, 0, W, H);
  const blob = (x, y, r, col, a) => {
    if (a <= 0.003) return;
    const g = X.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col.replace("A", a)); g.addColorStop(1, col.replace("A", 0));
    X.fillStyle = g; X.fillRect(0, 0, W, H);
  };
  blob(540 + 260 * Math.sin(t * 0.21), 260 + 60 * Math.cos(t * 0.3), 820, "rgba(150,150,160,A)", 0.16 * (1 - w));
  blob(180 + 120 * Math.sin(t * 0.33), 1650 + 90 * Math.cos(t * 0.27), 1000, "rgba(255,106,44,A)", 0.42 * w);
  blob(930 + 90 * Math.cos(t * 0.29), 330 + 80 * Math.sin(t * 0.23), 820, "rgba(255,181,71,A)", 0.26 * w);
  blob(540, 1080, 700, "rgba(255,140,70,A)", 0.10 * w * (0.7 + 0.3 * Math.sin(t * 1.3)));
  // vignette
  const v = X.createRadialGradient(540, 960, 500, 540, 960, 1250);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
  X.fillStyle = v; X.fillRect(0, 0, W, H);
}
function grainPass(fi) {
  X.save(); X.globalCompositeOperation = "overlay"; X.globalAlpha = 0.11;
  X.drawImage(grain[fi % 4], 0, 0, W, H); X.restore();
}

// ------------------------------------------------------------------ title
function title(t) {
  const w = smooth(t, TR - 0.1, TR + 0.9);
  X.save(); X.textAlign = "center"; X.textBaseline = "alphabetic";
  // kicker pill
  font(X, 700, 23, SANS); X.letterSpacing = "4px";
  const kt = "100% EDITED WITH AI";
  const kw = X.measureText(kt).width + 70;
  rr(X, 540 - kw / 2, 296, kw, 46, 23);
  X.fillStyle = "rgba(255,255,255,0.06)"; X.fill();
  X.strokeStyle = "rgba(255,255,255,0.16)"; X.lineWidth = 1.5; X.stroke();
  const pulse = 0.55 + 0.45 * Math.sin(t * 5);
  X.fillStyle = w > 0.5 ? AMBER : "#d8d8d8"; X.globalAlpha = 0.5 + 0.5 * pulse;
  X.beginPath(); X.arc(540 - kw / 2 + 26, 319, 6, 0, 7); X.fill(); X.globalAlpha = 1;
  X.fillStyle = "rgba(255,255,255,0.86)"; X.fillText(kt, 540 + 12, 327);
  X.letterSpacing = "0px";
  // headline
  font(X, 900, 84, SANS); X.letterSpacing = "-2.5px"; X.fillStyle = "#fff";
  X.shadowColor = "rgba(0,0,0,0.35)"; X.shadowBlur = 30; X.shadowOffsetY = 8;
  X.fillText("AI edited this.", 540, 432);
  X.letterSpacing = "0px";
  font(X, 400, 98, SERIF, true);
  const g = X.createLinearGradient(330, 0, 750, 0);
  g.addColorStop(0, lerp(0, 1, w) > 0.5 ? CREAM : "#f0f0f0"); g.addColorStop(1, w > 0.5 ? EMBER : "#bdbdbd");
  X.fillStyle = g;
  X.fillText(TL.title_line2, 540, 520);
  X.restore();
}

// ------------------------------------------------------------- footage
function drawFootage(c, img, cam, look) {
  c.save();
  if (look === "basic") c.filter = "saturate(0.42) contrast(0.9) brightness(1.05)";
  c.drawImage(img, cam.x0, cam.y0, FW * cam.s, FH * cam.s);
  c.restore();
}
function glitch(c, t, fi, amt) {
  if (amt <= 0) return;
  const r = rnd(fi * 7919 + 13);
  const id = c.getImageData(0, 0, CARD.w, CARD.h), d = id.data, out = new Uint8ClampedArray(d);
  const dx = Math.round(4 + amt * 18);
  for (let y = 0; y < CARD.h; y++) {
    const row = y * CARD.w * 4;
    for (let x = 0; x < CARD.w; x++) {
      const i = row + x * 4;
      const xr = Math.min(CARD.w - 1, x + dx), xb = Math.max(0, x - dx);
      out[i] = d[row + xr * 4]; out[i + 2] = d[row + xb * 4 + 2];
    }
  }
  id.data.set(out); c.putImageData(id, 0, 0);
  // displaced slices
  tmpX.clearRect(0, 0, CARD.w, CARD.h); tmpX.drawImage(cardC, 0, 0);
  const n = 3 + Math.floor(amt * 7);
  for (let k = 0; k < n; k++) {
    const y = r() * CARD.h, h = 8 + r() * 70 * amt, off = (r() - 0.5) * 140 * amt;
    c.drawImage(tmpC, 0, y, CARD.w, h, off, y, CARD.w, h);
  }
  c.fillStyle = `rgba(255,255,255,${0.05 * amt})`;
  for (let y = 0; y < CARD.h; y += 4) c.fillRect(0, y, CARD.w, 1);
}

// --------------------------------------------------------------- captions
function measureWords(c, words, styleOf) {
  return words.map((w) => { styleOf(w); return c.measureText(w.text).width; });
}
function drawWordAnim(c, w, x, y, t, t1, styleOf, extra = {}) {
  const p = eOut(win(t, w.t - 0.05, 0.24));
  if (p <= 0) return;
  const q = win(t, t1 - 0.14, 0.14);
  const a = p * (1 - q);
  if (a <= 0.01) return;
  c.save();
  styleOf(w);
  c.globalAlpha = a;
  const b = (1 - p) * 9 + q * 6;
  if (b > 0.3) c.filter = `blur(${b.toFixed(1)}px)`;
  c.shadowColor = "rgba(0,0,0,0.55)"; c.shadowBlur = 26; c.shadowOffsetY = 5;
  const dy = (1 - p) * 30 - q * 14;
  const sc = 0.9 + 0.1 * p;
  c.translate(x, y + dy); c.scale(sc, sc);
  c.fillText(w.text, 0, 0);
  c.restore();
}
function layoutLine(c, words, styleOf, maxW, gapK) {
  const ws = measureWords(c, words, styleOf);
  const gaps = words.map((w) => { styleOf(w); return c.measureText(" ").width * gapK; });
  let total = ws.reduce((a, b) => a + b, 0) + gaps.slice(1).reduce((a, b) => a + b, 0);
  const k = total > maxW ? maxW / total : 1;
  let x = -total / 2, xs = [];
  words.forEach((w, i) => { if (i) x += gaps[i]; xs.push(x + ws[i] / 2); x += ws[i]; });
  return { xs: xs.map((v) => v * k), k };
}
function capStyles(size, emScale, color = "#fff") {
  return (c, base) => (w) => {
    c.textAlign = "center"; c.textBaseline = "alphabetic";
    if (w.em) { font(c, 400, size * emScale * (base || 1), SERIF, true); c.fillStyle = AMBER; c.letterSpacing = "0px"; }
    else { font(c, 800, size * (base || 1), SANS); c.fillStyle = color; c.letterSpacing = "-1px"; }
  };
}
function premiumCaption(c, cap, t) {
  const cx = CARD.w / 2, oy = -CARD.y;   // caption coords are canvas coords -> card coords
  if (cap.layout === "hero") {
    const rest = cap.words.filter((w) => w.i !== cap.opts.hero);
    const st = (w) => { c.textAlign = "center"; font(c, 600, 40, SANS); c.fillStyle = "rgba(255,255,255,0.92)"; c.letterSpacing = "0px"; };
    const words = cap.words.map((w) => ({ ...w, em: false }));
    const L = layoutLine(c, words, st, 820, 1.0);
    words.forEach((w, i) => { if (w.i === cap.opts.hero) { c.save(); c.globalAlpha = 0.0; c.restore(); }
      drawWordAnim(c, w, cx + L.xs[i], HERO_SMALL + oy, t, cap.t1, (ww) => { st(ww); if (ww.i === cap.opts.hero) c.fillStyle = AMBER; }); });
    return;
  }
  if (cap.layout === "line") {
    const size = cap.opts.small ? 58 : 72;
    const mkStyle = capStyles(size, 1.34);
    let st = mkStyle(c, 1);
    const L = layoutLine(c, cap.words, st, 860, 1.0);
    st = mkStyle(c, L.k);
    cap.words.forEach((w, i) => drawWordAnim(c, w, cx + L.xs[i], CAP_LINE + oy, t, cap.t1, st));
  } else if (cap.layout === "stack") {
    const split = cap.opts.split;
    const top = cap.words.filter((w) => w.i < split);
    let big = cap.words.filter((w) => w.i >= split), rest = [];
    if (cap.opts.rest_small) { rest = big.filter((w) => !w.em); big = big.filter((w) => w.em); }
    const small = (c2) => (w) => { c2.textAlign = "center"; font(c2, 600, 44, SANS); c2.fillStyle = "rgba(255,255,255,0.92)"; c2.letterSpacing = "0px"; };
    if (top.length) {
      const st = small(c); const L = layoutLine(c, top, st, 820, 1.0);
      top.forEach((w, i) => drawWordAnim(c, w, cx + L.xs[i] * 1, CAP_SMALL + oy, t, cap.t1, st));
    }
    const mkBig = (k) => (w) => {
      c.textAlign = "center";
      if (w.em) { font(c, 400, 136 * k, SERIF, true); c.fillStyle = AMBER; c.letterSpacing = "0px"; }
      else { font(c, 900, 104 * k, SANS); c.fillStyle = "#fff"; c.letterSpacing = "-3px"; }
    };
    let L = layoutLine(c, big, mkBig(1), 860, 0.9);
    const stb = mkBig(L.k);
    L = layoutLine(c, big, stb, 860, 0.9);
    big.forEach((w, i) => drawWordAnim(c, w, cx + L.xs[i], CAP_BIG + oy - (top.length ? 0 : 30), t, cap.t1, stb));
    if (rest.length) {
      const st = small(c); const L2 = layoutLine(c, rest, st, 820, 1.0);
      rest.forEach((w, i) => drawWordAnim(c, w, cx + L2.xs[i], CAP_REST + oy, t, cap.t1, st));
    }
  }
}
// the "typical AI edit" caption: yellow Montserrat, word highlight, pop
function basicCaption(c, cap, t) {
  const cx = CARD.w / 2, y = CAP_LINE + 10 - CARD.y;
  const p = win(t, cap.t0, 0.14);
  const sc = p < 1 ? lerp(0.6, 1, eBack(p, 2.6)) : 1;
  c.save(); c.translate(cx, y); c.scale(sc, sc);
  font(c, 900, 74, BASIC); c.textAlign = "center"; c.textBaseline = "alphabetic"; c.letterSpacing = "0px";
  const words = cap.words.map((w) => ({ ...w, text: w.text.toUpperCase() }));
  const ws = words.map((w) => c.measureText(w.text).width), sp = c.measureText(" ").width;
  let total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const k = Math.min(1, 860 / total); c.scale(k, k);
  let x = -total / 2;
  words.forEach((w, i) => {
    const on = t >= w.t - 0.03 && (i === words.length - 1 || t < words[i + 1].t - 0.03);
    const yellow = cap.opts.yellow_all || on;
    const wx = x + ws[i] / 2;
    c.save(); c.translate(wx, 0); if (on) c.scale(1.08, 1.08);
    c.lineJoin = "round"; c.lineWidth = 13; c.strokeStyle = "#000";
    c.shadowColor = "rgba(0,0,0,0.7)"; c.shadowOffsetY = 7; c.shadowBlur = 0;
    c.strokeText(w.text, 0, 0); c.shadowColor = "transparent";
    c.fillStyle = yellow ? "#FFE600" : "#fff"; c.fillText(w.text, 0, 0);
    c.restore();
    x += ws[i] + sp;
  });
  c.restore();
  if (cap.opts.emoji) {
    const last = cap.words[cap.words.length - 1];
    const e = win(t, last.t, 0.22);
    if (e > 0) {
      c.save(); c.translate(cx, y - 120); c.rotate(Math.sin(t * 9) * 0.12); const s = eBack(e, 3);
      c.scale(s, s); font(c, 400, 96, EMOJI); c.textAlign = "center"; c.fillText(cap.opts.emoji, 0, 30); c.restore();
    }
  }
}

// ------------------------------------------------------------ hero (behind)
function heroBehind(c, t, hg) {
  for (const h of heroSpans) {
    if (t < h.t0 || t > h.t1 + 0.3) continue;
    const q = win(t, h.t1 - 0.05, 0.3);
    c.save(); c.textAlign = "center"; c.textBaseline = "alphabetic";
    let size = 300; font(c, 400, size, SERIF, true);
    const tw = c.measureText(h.text).width; if (tw > 880) { size *= 880 / tw; font(c, 400, size, SERIF, true); }
    const total = c.measureText(h.text).width;
    const base = Math.min(CARD.h - 70, chinY(hg) + size * 0.4);
    const g = c.createLinearGradient(0, base - size * 0.7, 0, base);
    g.addColorStop(0, CREAM); g.addColorStop(1, AMBER);
    c.shadowColor = "rgba(255,140,60,0.45)"; c.shadowBlur = 40;
    let x = CARD.w / 2 - total / 2;
    [...h.text].forEach((ch, i) => {
      const cw = c.measureText(ch).width;
      const p = eOut(win(t, h.t0 + i * 0.035, 0.42));
      if (p > 0) {
        c.save(); c.globalAlpha = p * (1 - q);
        const b = (1 - p) * 14 + q * 10; if (b > 0.3) c.filter = `blur(${b.toFixed(1)}px)`;
        c.fillStyle = g; c.translate(x + cw / 2, base + (1 - p) * 70 - q * 30);
        c.fillText(ch, 0, 0); c.restore();
      }
      x += cw;
    });
    c.restore();
  }
}

// ---------------------------------------------------------------- MG: scan
function mgScan(c, t, m, hg) {
  const p = win(t, m.t0, 0.35), q = win(t, m.t1 - 0.25, 0.25);
  const a = eOut(p) * (1 - q); if (a <= 0) return;
  const bw = hg.w * 1.25, bh = hg.w * 1.55;
  const sc = lerp(1.35, 1, eOut(p));
  const bx = hg.cx - bw * sc / 2, by = hg.top - 30 + (1 - sc) * 40, w = bw * sc, h = bh * sc;
  const prog = clamp((t - m.t0 - 0.3) / Math.max(0.5, m.t1 - m.t0 - 1.1));
  const detected = prog >= 0.62;
  const col = detected ? RED : "#ffffff";
  c.save(); c.globalAlpha = a;
  // corner brackets
  c.strokeStyle = col; c.lineWidth = 5; c.lineCap = "round";
  const L = 46;
  [[bx, by, 1, 1], [bx + w, by, -1, 1], [bx, by + h, 1, -1], [bx + w, by + h, -1, -1]].forEach(([x, y, sx, sy]) => {
    c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); c.stroke();
  });
  // scan line
  const sy = by + h * (0.5 + 0.5 * Math.sin(t * 3.2));
  const g = c.createLinearGradient(0, sy - 40, 0, sy + 4);
  g.addColorStop(0, "rgba(255,74,61,0)"); g.addColorStop(1, detected ? "rgba(255,74,61,0.35)" : "rgba(255,255,255,0.28)");
  c.fillStyle = g; c.fillRect(bx + 6, sy - 40, w - 12, 44);
  c.fillStyle = col; c.fillRect(bx + 6, sy, w - 12, 2);
  // dotted grid
  c.fillStyle = "rgba(255,255,255,0.18)";
  for (let gx = bx + 30; gx < bx + w - 20; gx += 36) for (let gy = by + 30; gy < by + h - 20; gy += 36) c.fillRect(gx, gy, 2, 2);
  // label
  const pct = Math.round(eOut(prog) * 98);
  const label = detected ? `AI EDIT DETECTED  ${pct}%` : `SCANNING EDIT…  ${pct}%`;
  font(c, 700, 26, MONO); c.letterSpacing = "1px";
  const lw = c.measureText(label).width + 40;
  const lx = clamp(hg.cx - lw / 2, 20, CARD.w - lw - 20), ly = Math.max(96, by - 70);
  rr(c, lx, ly, lw, 50, 12); c.fillStyle = detected ? RED : "rgba(15,15,15,0.75)"; c.fill();
  c.fillStyle = "#fff"; c.textAlign = "left"; c.fillText(label, lx + 20, ly + 34);
  // tags
  if (detected) {
    const tags = ["template captions", "stock SFX", "preset motion"];
    font(c, 600, 22, MONO);
    tags.forEach((s, i) => {
      const tp = eOut(win(t, m.t0 + 0.3 + (m.t1 - m.t0 - 1.1) * 0.62 + i * 0.15, 0.25));
      if (tp <= 0) return;
      const tx = i % 2 ? bx + w + 10 - 230 * (1 - tp) * 0 : bx - 10;
      const tw2 = c.measureText("✕ " + s).width + 26;
      const x = i % 2 ? Math.min(CARD.w - tw2 - 16, bx + w - tw2 * 0.4) : Math.max(16, bx - tw2 * 0.6);
      const y = by + h * (0.3 + i * 0.22);
      c.globalAlpha = a * tp;
      rr(c, x, y, tw2, 38, 10); c.fillStyle = "rgba(20,20,20,0.78)"; c.fill();
      c.strokeStyle = "rgba(255,74,61,0.8)"; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = "#ff8a80"; c.fillText("✕ " + s, x + 13, y + 26);
    });
  }
  c.restore();
}

// --------------------------------------------------------------- MG: orbit
function orbitWords(c, t, m, hg, layer) {
  const p = eOut(win(t, m.t0, 0.6)), q = win(t, m.t1 - 0.4, 0.4);
  const a = p * (1 - q); if (a <= 0) return;
  const words = m.opts.words, N = words.length;
  const rx = Math.min(hg.w * lerp(0.6, 0.98, p), CARD.w / 2 - 120), ry = rx * 0.2;
  const cy = hg.top + hg.w * 0.3;
  c.save(); c.textAlign = "center"; c.textBaseline = "middle";
  words.forEach((wd, i) => {
    const th = t * 1.25 + (Math.PI * 2 * i) / N;
    const z = Math.sin(th);
    if ((layer === "back") !== (z < 0)) return;
    const x = hg.cx + rx * Math.cos(th), y = cy + ry * z - 10 * Math.cos(th);
    const s = 0.78 + 0.32 * (z + 1) / 2;
    const appear = eOut(win(t, m.t0 + i * 0.09, 0.35));
    c.save(); c.globalAlpha = a * appear * (0.55 + 0.45 * (z + 1) / 2);
    c.translate(x, y); c.scale(s, s);
    if (i % 2) { font(c, 400, 88, SERIF, true); c.fillStyle = AMBER; }
    else { font(c, 800, 64, SANS); c.fillStyle = "#fff"; c.letterSpacing = "-1.5px"; }
    c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 18;
    if (z < -0.2) c.filter = `blur(${(-z * 2).toFixed(1)}px)`;
    c.fillText(wd, 0, 0); c.restore();
  });
  // orbit trail
  c.globalAlpha = a * 0.35; c.strokeStyle = AMBER; c.lineWidth = 2;
  c.beginPath();
  if (layer === "back") c.ellipse(hg.cx, cy, rx, ry, 0, Math.PI, Math.PI * 2);
  else c.ellipse(hg.cx, cy, rx, ry, 0, 0, Math.PI);
  c.stroke();
  c.restore();
}

// --------------------------------------------------------------- MG: rings
function rings(c, t, m, hg, layer) {
  const p = win(t, m.t0, 0.7), q = win(t, m.t1 - 0.3, 0.3);
  const a = (1 - q); if (p <= 0 || a <= 0) return;
  const cy = hg.top + hg.w * 0.14;
  c.save(); c.lineCap = "round";
  [[0.82, 0.24, AMBER, 3, 0], [1.02, 0.28, "rgba(255,255,255,0.7)", 1.6, 1], [0.66, 0.18, CREAM, 2, 2]].forEach(([kr, ky, col, lw, i]) => {
    const pp = eOut(clamp(p * 1.3 - i * 0.15));
    if (pp <= 0) return;
    const rx = Math.min(hg.w * kr, CARD.w / 2 - 40 - i * 10), ry = rx * ky, rot = -0.06 + i * 0.05 + t * 0.03 * (i % 2 ? -1 : 1);
    c.save(); c.translate(hg.cx, cy); c.rotate(rot);
    c.strokeStyle = col; c.lineWidth = lw; c.globalAlpha = a * (i === 1 ? 0.8 : 1);
    if (i === 1) { c.setLineDash([6, 14]); c.lineDashOffset = -t * 40; }
    const sweep = Math.PI * 2 * pp;
    c.beginPath();
    if (layer === "back") c.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI + Math.min(Math.PI, sweep));
    else if (sweep > Math.PI) c.ellipse(0, 0, rx, ry, 0, 0, sweep - Math.PI);
    c.stroke();
    // travelling bead
    if (layer === "front" && i === 0) {
      const th = t * 2.2;
      if (Math.sin(th) > 0) { c.fillStyle = AMBER; c.shadowColor = AMBER; c.shadowBlur = 20; c.beginPath(); c.arc(rx * Math.cos(th), ry * Math.sin(th), 7, 0, 7); c.fill(); }
    }
    c.restore();
  });
  // sparkles
  if (layer === "front") {
    const r = rnd(5);
    for (let k = 0; k < 9; k++) {
      const ang = r() * 6.28, rad = hg.w * (0.7 + r() * 0.8);
      const x = hg.cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad * 0.7;
      const tw = Math.max(0, Math.sin(t * 4 + k * 1.7)) * eOut(p) * a;
      if (tw < 0.05) continue;
      c.save(); c.globalAlpha = tw; c.strokeStyle = CREAM; c.lineWidth = 2.2;
      const s = 8 + 6 * tw;
      c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.moveTo(x, y - s); c.lineTo(x, y + s); c.stroke(); c.restore();
    }
  }
  c.restore();
}

// ---------------------------------------------------------------- MG: wave
function wave(c, t, m, hg, fi) {
  const p = eOut(win(t, m.t0, 0.4)), q = win(t, m.t1 - 0.3, 0.3);
  const a = p * (1 - q); if (a <= 0) return;
  const N = 44, y = hg.top + hg.w * 1.05, gap = CARD.w / N;
  c.save(); c.globalAlpha = a;
  for (let i = 0; i < N; i++) {
    const x = gap * (i + 0.5);
    const amp = TL.amp ? TL.amp[fi] : 0.5;
    const n = 0.5 + 0.5 * Math.sin(t * 7 + i * 0.9) * Math.cos(t * 3.1 + i * 0.37);
    const hgt = 10 + (40 + 120 * amp) * n * eOut(clamp(p * 1.5 - Math.abs(i - N / 2) / N));
    const g = c.createLinearGradient(0, y - hgt / 2, 0, y + hgt / 2);
    g.addColorStop(0, CREAM); g.addColorStop(1, EMBER);
    c.fillStyle = g; rr(c, x - 4, y - hgt / 2, 8, hgt, 4); c.fill();
  }
  c.restore();
}

// ------------------------------------------------------------- MG: chips
function chips(c, t, m) {
  const q = win(t, m.t1 - 0.25, 0.25);
  m.opts.items.forEach((s, i) => {
    const p = win(t, m.t0 + 0.05 + i * 0.25, 0.35); if (p <= 0) return;
    c.save(); font(c, 700, 34, SANS); c.letterSpacing = "0px";
    const tw = c.measureText(s).width + 52, h = 66;
    const x = CARD.w - 36 - tw, y = 120 + i * 82;
    c.globalAlpha = (1 - q) * clamp(p * 2);
    c.translate(x + tw, y + h / 2); const sc = eBack(p, 2.2); c.scale(sc, sc); c.translate(-tw, -h / 2);
    c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 24; c.shadowOffsetY = 8;
    rr(c, 0, 0, tw, h, 33); c.fillStyle = i === 0 ? "rgba(255,177,92,0.95)" : "rgba(18,14,11,0.72)"; c.fill();
    c.shadowColor = "transparent";
    c.strokeStyle = i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = i === 0 ? INK : "#fff"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(s, 26, h / 2 + 2);
    c.restore();
  });
}

// ---------------------------------------------------------- MG: workflow
const STEPS = [["Story-first cut", "fumbles out, pace in"], ["Kinetic typography", "captions with rhythm"],
  ["Motion design", "graphics that mean something"], ["Sound design", "every hit lands"], ["Cinematic grade", "the premium finish"]];
function workflow(c, t, m, img, cam) {
  const p = eOut(win(t, m.t0, 0.32)), q = win(t, m.t1 - 0.25, 0.25);
  const a = p * (1 - q); if (a <= 0) return;
  // blurred, darkened footage under a glass panel
  c.save(); c.globalAlpha = a;
  c.imageSmoothingQuality = "high";
  blurX.clearRect(0, 0, 94, 99); blurX.drawImage(cardC, 0, 0, 94, 99);
  c.drawImage(blurC, 0, 0, CARD.w, CARD.h);
  c.fillStyle = "rgba(12,9,7,0.62)"; c.fillRect(0, 0, CARD.w, CARD.h);
  const ix = 48, iy = 76; c.textBaseline = "alphabetic";
  // kicker
  font(c, 700, 24, SANS); c.letterSpacing = "5px"; c.fillStyle = AMBER; c.textAlign = "left";
  c.fillText("THE VIBE EDITING WORKFLOW", ix + 6, iy + 50);
  c.letterSpacing = "0px";
  const rowH = 122, y0 = iy + 96;
  STEPS.forEach(([name, sub], i) => {
    const rp = eOut(win(t, m.t0 + 0.25 + i * 0.22, 0.35)); if (rp <= 0) return;
    const lit = win(t, m.t0 + 0.4 + i * 0.22, 0.2);
    const y = y0 + i * rowH;
    c.save(); c.globalAlpha = a * rp; c.translate((1 - rp) * 60, 0);
    rr(c, ix, y, CARD.w - ix * 2, rowH - 18, 26);
    c.fillStyle = `rgba(255,255,255,${0.05 + 0.04 * lit})`; c.fill();
    c.strokeStyle = `rgba(255,177,92,${0.15 + 0.45 * lit})`; c.lineWidth = 1.5; c.stroke();
    font(c, 700, 28, MONO); c.fillStyle = AMBER; c.fillText(String(i + 1).padStart(2, "0"), ix + 30, y + 64);
    font(c, 800, 42, SANS); c.fillStyle = "#fff"; c.letterSpacing = "-1px"; c.fillText(name, ix + 100, y + 54);
    c.letterSpacing = "0px"; font(c, 500, 26, SANS); c.fillStyle = "rgba(255,255,255,0.6)"; c.fillText(sub, ix + 100, y + 90);
    // check
    const cx = CARD.w - ix - 56, cy = y + (rowH - 18) / 2;
    c.beginPath(); c.arc(cx, cy, 24, 0, 7);
    c.fillStyle = lit > 0 ? `rgba(255,177,92,${lit})` : "rgba(255,255,255,0.1)"; c.fill();
    if (lit > 0) {
      c.strokeStyle = INK; c.lineWidth = 4.5; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(cx - 10, cy + 1); c.lineTo(cx - 3, cy + 9); c.lineTo(cx + 11, cy - 8);
      c.setLineDash([40]); c.lineDashOffset = 40 * (1 - lit); c.stroke(); c.setLineDash([]);
    }
    c.restore();
  });
  c.restore();
}

// ------------------------------------------------------------ MG: comment
function comment(c, t, m) {
  const p = win(t, m.t0, 0.45), q = win(t, m.t1 + 0.6, 0.3);
  if (p <= 0 || q >= 1) return;
  const x = 46, y = 110, w = 600, h = 132;
  c.save(); c.globalAlpha = 1 - q;
  c.translate(x + (1 - eBack(p, 1.6)) * -420, y);
  c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 40; c.shadowOffsetY = 14;
  rr(c, 0, 0, w, h, 32); c.fillStyle = "#fff"; c.fill(); c.shadowColor = "transparent";
  const g = c.createLinearGradient(30, 30, 100, 100); g.addColorStop(0, AMBER); g.addColorStop(1, EMBER);
  c.beginPath(); c.arc(70, h / 2, 38, 0, 7); c.fillStyle = g; c.fill();
  font(c, 800, 34, SANS); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText("Y", 70, h / 2 + 12);
  c.textAlign = "left"; c.textBaseline = "alphabetic"; font(c, 600, 26, SANS); c.fillStyle = "#8a8a8a"; c.fillText("you  ·  now", 128, 50);
  const txt = "VIBE", n = clamp(Math.floor((t - m.t0 - 0.3) / 0.11), 0, 4);
  font(c, 900, 46, SANS); c.fillStyle = "#111"; c.letterSpacing = "2px";
  const typed = txt.slice(0, n); c.fillText(typed, 128, 100);
  const tw = c.measureText(typed).width;
  if (n < 4 || Math.sin(t * 12) > 0) { c.fillStyle = EMBER; c.fillRect(132 + tw, 66, 4, 42); }
  c.letterSpacing = "0px";
  const hp = win(t, m.t0 + 1.0, 0.3);
  const hs = hp > 0 ? eBack(hp, 3) : 0.85;
  c.save(); c.translate(w - 60, h / 2); c.scale(hs, hs);
  c.fillStyle = hp > 0 ? "#FF3B5C" : "#cfcfcf";
  c.beginPath(); c.moveTo(0, 14); c.bezierCurveTo(-30, -6, -16, -30, 0, -14); c.bezierCurveTo(16, -30, 30, -6, 0, 14); c.fill();
  c.restore();
  c.restore();
}

// ------------------------------------------------------------- card label
function cardLabel(c, t) {
  const k = win(t, TR - 0.15, 0.3);
  const after = k >= 0.5;
  const sy = Math.abs(Math.cos(k * Math.PI));
  const txt = after ? "MY AI EDIT  ✦" : "TYPICAL AI EDIT";
  c.save(); font(c, 800, 22, SANS); c.letterSpacing = "3px";
  const tw = c.measureText(txt).width + 44;
  c.translate(30, 30 + 23); c.scale(1, Math.max(0.02, sy)); c.translate(0, -23);
  rr(c, 0, 0, tw, 46, 23);
  c.fillStyle = after ? AMBER : "rgba(25,25,25,0.72)"; c.fill();
  if (!after) { c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = 1.5; c.stroke(); }
  c.fillStyle = after ? INK : "rgba(255,255,255,0.85)"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(txt, 22, 24);
  c.restore();
}

// ------------------------------------------------------------ CTA + end card
function ctaPill(t) {
  const m = mgOf("cta")[0]; if (!m || t < m.t0) return;
  const p = win(t, m.t0, 0.45);
  const tapT = m.words[1] ?? m.t0 + 0.4;
  const press = Math.max(0, 1 - Math.abs(t - tapT - 0.1) / 0.12);
  const w = 600, h = 78, x = 540 - w / 2, y = 1554;
  X.save(); X.globalAlpha = clamp(p * 1.5);
  X.translate(540, y + h / 2); const s = eBack(p, 2) * (1 - 0.06 * press); X.scale(s, s); X.translate(-540, -(y + h / 2));
  X.shadowColor = "rgba(255,122,47,0.55)"; X.shadowBlur = 50; X.shadowOffsetY = 10;
  const g = X.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, AMBER); g.addColorStop(1, EMBER);
  rr(X, x, y, w, h, 44); X.fillStyle = g; X.fill(); X.shadowColor = "transparent";
  // shine
  const sh = ((t - m.t0) % 2.2) / 2.2;
  X.save(); rr(X, x, y, w, h, 44); X.clip();
  const sx = x - 200 + sh * (w + 400);
  const sg = X.createLinearGradient(sx - 80, 0, sx + 80, 0);
  sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.45)"); sg.addColorStop(1, "rgba(255,255,255,0)");
  X.fillStyle = sg; X.fillRect(x, y, w, h); X.restore();
  const txt = t > SPEECH_END + 0.6 ? "Join now" : "Learn the workflow";
  font(X, 800, 36, SANS); X.letterSpacing = "-0.5px"; X.fillStyle = INK; X.textAlign = "center"; X.textBaseline = "middle";
  X.fillText(txt, 540 - 24, y + h / 2 + 2);
  const tw = X.measureText(txt).width;
  const ax = 540 - 24 + tw / 2 + 34 + Math.sin(t * 6) * 5;
  X.lineWidth = 4.5; X.strokeStyle = INK; X.lineCap = "round"; X.lineJoin = "round";
  X.beginPath(); X.moveTo(ax - 14, y + h / 2); X.lineTo(ax + 12, y + h / 2); X.moveTo(ax + 2, y + h / 2 - 10); X.lineTo(ax + 12, y + h / 2); X.lineTo(ax + 2, y + h / 2 + 10); X.stroke();
  // tap ripple
  const rp = win(t, tapT, 0.6);
  if (rp > 0 && rp < 1) { X.strokeStyle = `rgba(255,255,255,${0.7 * (1 - rp)})`; X.lineWidth = 3; X.beginPath(); X.arc(540, y + h / 2, 30 + rp * 120, 0, 7); X.stroke(); }
  X.restore();
}
function endCard(c, t) {
  const t0 = SPEECH_END + 0.12;
  if (t < t0) return;
  const p = eOut(win(t, t0, 0.45));
  blurX.clearRect(0, 0, 94, 99); blurX.drawImage(cardC, 0, 0, 94, 99);
  c.save(); c.globalAlpha = p; c.imageSmoothingQuality = "high";
  c.drawImage(blurC, 0, 0, CARD.w, CARD.h);
  c.fillStyle = "rgba(10,7,5,0.6)"; c.fillRect(0, 0, CARD.w, CARD.h);
  const g = c.createRadialGradient(CARD.w / 2, CARD.h * 0.55, 0, CARD.w / 2, CARD.h * 0.55, 600);
  g.addColorStop(0, "rgba(255,122,47,0.28)"); g.addColorStop(1, "rgba(255,122,47,0)");
  c.fillStyle = g; c.fillRect(0, 0, CARD.w, CARD.h);
  c.restore();
  const el = (i, fn) => {
    const e = eOut(win(t, t0 + 0.25 + i * 0.12, 0.45)); if (e <= 0) return;
    c.save(); c.globalAlpha = e; c.translate(0, (1 - e) * 40); if (e < 1) c.filter = `blur(${((1 - e) * 10).toFixed(1)}px)`;
    c.textAlign = "center"; c.textBaseline = "alphabetic"; fn(); c.restore();
  };
  const cx = CARD.w / 2;
  el(0, () => { font(c, 700, 24, SANS); c.letterSpacing = "6px"; c.fillStyle = AMBER; c.fillText("✦  VIBE EDITING  ✦", cx, 300); });
  el(1, () => { font(c, 900, 112, SANS); c.letterSpacing = "-4px"; c.fillStyle = "#fff"; c.fillText("Learn the", cx, 450); });
  el(2, () => {
    font(c, 400, 168, SERIF, true);
    const gg = c.createLinearGradient(cx - 300, 0, cx + 300, 0); gg.addColorStop(0, CREAM); gg.addColorStop(1, EMBER);
    c.fillStyle = gg; c.shadowColor = "rgba(255,122,47,0.4)"; c.shadowBlur = 40; c.fillText("workflow.", cx, 600);
  });
  el(3, () => { font(c, 500, 36, SANS); c.fillStyle = "rgba(255,255,255,0.75)"; c.fillText("Premium edits made with AI —", cx, 700); c.fillText("that don't look like AI.", cx, 748); });
  el(4, () => {
    font(c, 700, 30, SANS); const s = "Comment “VIBE”  or tap the link"; const tw = c.measureText(s).width + 60;
    rr(c, cx - tw / 2, 818, tw, 64, 32); c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = "#fff"; c.fillText(s, cx, 861);
  });
}


// ------------------------------------------------- Basic / Premium toggle
function modeToggle(t) {
  const m = mgOf("cta")[0];
  const out = m ? win(t, m.t0 - 0.35, 0.3) : 0;
  if (out >= 1) return;
  const k = eInOut(win(t, TR - 0.2, 0.45));
  const w = 520, h = 70, x = 540 - w / 2, y = 1558;
  X.save(); X.globalAlpha = 1 - out; X.translate(0, out * 20);
  rr(X, x, y, w, h, 38); X.fillStyle = "rgba(255,255,255,0.06)"; X.fill();
  X.strokeStyle = "rgba(255,255,255,0.14)"; X.lineWidth = 1.5; X.stroke();
  // knob slides from Basic (left) to Premium (right)
  const kw = w / 2 - 8, kx = x + 4 + k * (w / 2);
  X.shadowColor = `rgba(255,122,47,${0.6 * k})`; X.shadowBlur = 30;
  rr(X, kx, y + 4, kw, h - 8, 34);
  const g = X.createLinearGradient(kx, 0, kx + kw, 0);
  g.addColorStop(0, k > 0.5 ? AMBER : "#3a3a3c"); g.addColorStop(1, k > 0.5 ? EMBER : "#2c2c2e");
  X.fillStyle = g; X.fill(); X.shadowColor = "transparent";
  X.textAlign = "center"; X.textBaseline = "middle"; font(X, 800, 26, SANS); X.letterSpacing = "3px";
  X.fillStyle = k < 0.5 ? "#fff" : "rgba(255,255,255,0.4)"; X.fillText("BASIC AI", x + w / 4 + 2, y + h / 2 + 1);
  X.fillStyle = k >= 0.5 ? INK : "rgba(255,255,255,0.4)"; X.fillText("PREMIUM  ✦", x + 3 * w / 4 - 2, y + h / 2 + 1);
  X.restore();
}

// ------------------------------------------------------------------ frame
let maskOK = false;
async function renderAt(fi) {
  const t = fi / fps;
  const src = TL.frames[fi];
  const img = await loadImg(`${TL.frame_dir}/s${pad5(src)}.jpg`);
  const cam = camera(t, fi);
  const hg = headGeom(cam, fi);
  const isAfter = t >= TR;
  const needBehind = heroSpans.some((h) => t >= h.t0 && t <= h.t1 + 0.3) ||
    mgOf("orbit").some((m) => active(m, t)) || mgOf("rings").some((m) => active(m, t)) || mgOf("wave").some((m) => active(m, t));
  maskOK = false;
  if (needBehind && TL.has_mask[fi]) {
    const mimg = await loadImg(`${TL.mask_dir}/s${pad5(src)}.png`);
    maskX.clearRect(0, 0, 576, 512); maskX.drawImage(mimg, 0, 0, 576, 512);
    const id = maskX.getImageData(0, 0, 576, 512), d = id.data;
    for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 255; }
    maskX.putImageData(id, 0, 0); maskOK = true;
  }

  backdrop(t);
  title(t);

  // ---- card contents
  const c = cardX;
  c.clearRect(0, 0, CARD.w, CARD.h);
  if (!isAfter) {
    drawFootage(c, img, cam, "basic");
    const g = clamp((t - TG) / (TR - TG));
    if (t >= TG) glitch(c, t, fi, 0.35 + 0.65 * g * (fi % 3 === 0 ? 1 : 0.6));
  } else {
    const rp = win(t, TR, 0.55);
    if (rp < 1) {
      drawFootage(c, img, cam, "basic");
      c.save(); c.beginPath(); c.arc(CARD.w / 2, CARD.h * 0.45, eOut(rp) * 900, 0, 7); c.clip();
      drawFootage(c, img, cam, "grade"); c.restore();
    } else drawFootage(c, img, cam, "grade");
  }
  // behind-head layers
  if (needBehind && maskOK && isAfter) {
    mgOf("wave").forEach((m) => active(m, t) && wave(c, t, m, hg, fi));
    mgOf("rings").forEach((m) => active(m, t) && rings(c, t, m, hg, "back"));
    heroBehind(c, t, hg);
    mgOf("orbit").forEach((m) => active(m, t) && orbitWords(c, t, m, hg, "back"));
    // subject on top
    subX.clearRect(0, 0, CARD.w, CARD.h);
    subX.drawImage(img, cam.x0, cam.y0, FW * cam.s, FH * cam.s);
    subX.globalCompositeOperation = "destination-in";
    subX.drawImage(maskC, cam.x0, cam.y0, FW * cam.s, FH * cam.s);
    subX.globalCompositeOperation = "source-over";
    const heroOn = heroSpans.some((h) => t >= h.t0 && t <= h.t1 + 0.3);
    const others = mgOf("orbit").concat(mgOf("rings"), mgOf("wave")).some((m) => active(m, t));
    if (heroOn) {
      const cy = chinY(hg);
      c.save(); c.beginPath(); c.rect(0, 0, CARD.w, cy + 6); c.clip(); c.drawImage(subC, 0, 0); c.restore();
    } else c.drawImage(subC, 0, 0);
  }
  if (isAfter) {
    mgOf("rings").forEach((m) => active(m, t) && maskOK && rings(c, t, m, hg, "front"));
    mgOf("orbit").forEach((m) => active(m, t) && maskOK && orbitWords(c, t, m, hg, "front"));
  }
  mgOf("scan").forEach((m) => active(m, t) && mgScan(c, t, m, hg));
  mgOf("workflow").forEach((m) => active(m, t) && workflow(c, t, m, img, cam));
  // subtle bottom gradient for caption legibility
  const bg = c.createLinearGradient(0, CARD.h * 0.62, 0, CARD.h);
  bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(1, `rgba(0,0,0,${isAfter ? 0.42 : 0.25})`);
  c.fillStyle = bg; c.fillRect(0, CARD.h * 0.62, CARD.w, CARD.h * 0.38);
  // captions
  for (const cap of TL.captions) {
    if (cap.layout === "basic") { if (t >= cap.t0 && t < cap.t1 && t < TR) basicCaption(c, cap, t); continue; }
    if (t < cap.t0 - 0.1 || t > cap.t1 + 0.05) continue;
    premiumCaption(c, cap, t);
  }
  mgOf("chips").forEach((m) => active(m, t) && chips(c, t, m));
  mgOf("comment").forEach((m) => active(m, t, 0, 1) && comment(c, t, m));
  endCard(c, t);
  cardLabel(c, t);
  // flash on reveal
  const fl = win(t, TR, 0.3);
  if (t >= TR && fl < 1) { c.fillStyle = `rgba(255,248,240,${0.85 * Math.pow(1 - fl, 2)})`; c.fillRect(0, 0, CARD.w, CARD.h); }

  // ---- composite card
  const warm = smooth(t, TR - 0.1, TR + 0.9);
  const sp = win(t, TR, 0.7);
  const sc = t >= TR ? 1 + 0.045 * Math.sin(sp * Math.PI) * (1 - sp) : 1 - 0.012 * clamp((t - TG) / (TR - TG));
  const floatY = Math.sin(t * 1.1) * 3 * warm;
  X.save();
  X.translate(CARD.x + CARD.w / 2, CARD.y + CARD.h / 2 + floatY); X.scale(sc, sc); X.translate(-CARD.w / 2, -CARD.h / 2);
  X.shadowColor = `rgba(0,0,0,0.6)`; X.shadowBlur = 90; X.shadowOffsetY = 36;
  rr(X, 0, 0, CARD.w, CARD.h, CARD.r); X.fillStyle = "#000"; X.fill();
  X.shadowColor = `rgba(255,122,47,${0.35 * warm})`; X.shadowBlur = 70; X.shadowOffsetY = 0; X.fill();
  X.shadowColor = "transparent";
  X.save(); rr(X, 0, 0, CARD.w, CARD.h, CARD.r); X.clip(); X.drawImage(cardC, 0, 0); X.restore();
  rr(X, 0.75, 0.75, CARD.w - 1.5, CARD.h - 1.5, CARD.r);
  X.strokeStyle = `rgba(255,${lerp(255, 200, warm) | 0},${lerp(255, 150, warm) | 0},${0.12 + 0.1 * warm})`; X.lineWidth = 1.5; X.stroke();
  X.restore();

  modeToggle(t);
  ctaPill(t);
  grainPass(fi);
}

window.renderAt = renderAt;
window.stageReady = (async () => {
  const faces = [`700 20px "Inter Tight"`, `800 20px "Inter Tight"`, `900 20px "Inter Tight"`, `600 20px "Inter Tight"`, `500 20px "Inter Tight"`,
    `italic 400 20px "Instrument Serif"`, `900 20px "Montserrat"`, `700 20px "JetBrains Mono"`, `20px "Noto Color Emoji"`];
  await Promise.all(faces.map((f) => document.fonts.load(f, "AaVIBE😐✦")));
  await document.fonts.ready;
  return true;
})();
})();

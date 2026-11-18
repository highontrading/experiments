// Vibe Editing ad stage v2: the FULL 16:9 frame (never cropped or zoomed) as a card in a 9:16 ad.
// Layers: backdrop > title > card [footage > behind-person type/MG > person matte > front type/MG] > below-card type > CTA.
(() => {
const TL = window.TL;
const cv = document.getElementById("c"), X = cv.getContext("2d");
const W = 1080, H = 1920;
// theme ------------------------------------------------------------------
const RED = "#FF3D2E", RED2 = "#E0241A", CREAM = "#FFF4EA", INK = "#140B07", YEL = "#FFE600", EMBER = "#FF6A3A";
const SANS = "Inter Tight", SERIF = "Instrument Serif", WIDE = "Archivo Expanded", BASIC = "Montserrat", MONO = "JetBrains Mono", EMOJI = "Noto Color Emoji";
// layout -----------------------------------------------------------------
const CARD = { x: 40, y: 574, w: 1000, h: 562.5, r: 34 };
const FW = 1600, FH = 900;                 // full 16:9 frame
const MASK = { x: 187.5, w: 625 };          // matte covers the centre 1600/2560 of the frame
const BELOW_SMALL = 1228, BELOW_BIG = 1346, BELOW_REST = 1412, OVER_Y = 512, UI_Y = 1486;
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
const CW = 1000, CH = 563;

// offscreen layers --------------------------------------------------------
const [cardC, cardX] = mk(CW, CH);
const [subC, subX] = mk(CW, CH);
const [maskC, maskX] = mk(576, 512);
const [blurC, blurX] = mk(100, 56);
const [tmpC, tmpX] = mk(CW, CH);
const grain = [];
for (let g = 0; g < 4; g++) {
  const [k, c] = mk(540, 960); const id = c.createImageData(540, 960); const r = rnd(77 + g * 13);
  for (let i = 0; i < id.data.length; i += 4) { const v = 110 + r() * 60 | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  c.putImageData(id, 0, 0); grain.push(k);
}

// timeline-derived ----------------------------------------------------------
const TG = TL.turn.tg, TR = TL.turn.tr, SPEECH_END = TL.speech_end;
const DEPTH = ["behind", "side"];
const heroSpans = [];                      // words that live behind the person
for (const c of TL.captions) {
  if (!DEPTH.includes(c.layout)) continue;
  const hw = c.words.find((w) => w.i === c.opts.hero);
  if (c.opts.keep_hero && heroSpans.length) { heroSpans[heroSpans.length - 1].t1 = c.t1; continue; }
  heroSpans.push({ kind: c.layout, text: hw.text, t0: hw.t - 0.12, t1: c.t1, red: !!c.opts.red });
}
const mgOf = (type) => TL.mg.filter((m) => m.type === type);
const active = (m, t, pre = 0, post = 0) => t >= m.t0 - pre && t <= m.t1 + post;

function headGeom(fi) {
  const top = TL.head[0][fi], hcx = TL.head[1][fi], hw = TL.head[2][fi];
  const w = hw * MASK.w;
  const ty = top * CH;
  return { cx: MASK.x + hcx * MASK.w, top: ty, w, cy: ty + w * 0.62, neck: TL.neck[0][fi] * CH };
}

// ---------------------------------------------------------------- backdrop
function backdrop(t) {
  const w = smooth(t, TR - 0.1, TR + 0.9);
  X.fillStyle = `rgb(${lerp(17, 14, w) | 0},${lerp(17, 10, w) | 0},${lerp(19, 9, w) | 0})`;
  X.fillRect(0, 0, W, H);
  const blob = (x, y, r, col, a) => {
    if (a <= 0.003) return;
    const g = X.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col.replace("A", a)); g.addColorStop(1, col.replace("A", 0));
    X.fillStyle = g; X.fillRect(0, 0, W, H);
  };
  blob(540 + 260 * Math.sin(t * 0.21), 300 + 60 * Math.cos(t * 0.3), 820, "rgba(150,150,160,A)", 0.15 * (1 - w));
  blob(160 + 120 * Math.sin(t * 0.33), 1700 + 90 * Math.cos(t * 0.27), 1000, "rgba(255,74,40,A)", 0.40 * w);
  blob(950 + 90 * Math.cos(t * 0.29), 380 + 80 * Math.sin(t * 0.23), 820, "rgba(255,140,70,A)", 0.24 * w);
  blob(540, 860, 760, "rgba(255,90,50,A)", 0.12 * w * (0.7 + 0.3 * Math.sin(t * 1.3)));
  const v = X.createRadialGradient(540, 960, 500, 540, 960, 1250);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
  X.fillStyle = v; X.fillRect(0, 0, W, H);
}
function grainPass(fi) { X.save(); X.globalCompositeOperation = "overlay"; X.globalAlpha = 0.11; X.drawImage(grain[fi % 4], 0, 0, W, H); X.restore(); }

// ------------------------------------------------------------------ title
function title(t) {
  const w = smooth(t, TR - 0.1, TR + 0.9);
  X.save(); X.textAlign = "center"; X.textBaseline = "alphabetic";
  font(X, 700, 23, SANS); X.letterSpacing = "4px";
  const kt = "100% EDITED WITH AI", kw = X.measureText(kt).width + 70;
  rr(X, 540 - kw / 2, 296, kw, 46, 23);
  X.fillStyle = "rgba(255,255,255,0.06)"; X.fill(); X.strokeStyle = "rgba(255,255,255,0.16)"; X.lineWidth = 1.5; X.stroke();
  X.fillStyle = w > 0.5 ? RED : "#d8d8d8"; X.globalAlpha = 0.5 + 0.5 * (0.55 + 0.45 * Math.sin(t * 5));
  X.beginPath(); X.arc(540 - kw / 2 + 26, 319, 6, 0, 7); X.fill(); X.globalAlpha = 1;
  X.fillStyle = "rgba(255,255,255,0.86)"; X.fillText(kt, 540 + 12, 327); X.letterSpacing = "0px";
  font(X, 900, 84, SANS); X.letterSpacing = "-2.5px"; X.fillStyle = "#fff";
  X.shadowColor = "rgba(0,0,0,0.35)"; X.shadowBlur = 30; X.shadowOffsetY = 8;
  X.fillText("AI edited this.", 540, 432); X.letterSpacing = "0px";
  font(X, 400, 98, SERIF, true);
  const g = X.createLinearGradient(330, 0, 760, 0);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.55, w > 0.5 ? "#FFD9D2" : "#e6e6e6"); g.addColorStop(1, w > 0.5 ? RED : "#a9a9a9");
  X.fillStyle = g; X.fillText("Can you tell?", 540, 522);
  X.restore();
}

// ------------------------------------------------------------- footage
function drawFootage(c, img, look) {
  c.save();
  if (look === "basic") c.filter = "saturate(0.42) contrast(0.9) brightness(1.05)";
  c.drawImage(img, 0, 0, CW, CH);
  c.restore();
}
function glitch(c, fi, amt) {
  if (amt <= 0) return;
  const r = rnd(fi * 7919 + 13);
  const id = c.getImageData(0, 0, CW, CH), d = id.data, out = new Uint8ClampedArray(d);
  const dx = Math.round(4 + amt * 16);
  for (let y = 0; y < CH; y++) {
    const row = y * CW * 4;
    for (let x = 0; x < CW; x++) {
      const i = row + x * 4;
      out[i] = d[row + Math.min(CW - 1, x + dx) * 4]; out[i + 2] = d[row + Math.max(0, x - dx) * 4 + 2];
    }
  }
  id.data.set(out); c.putImageData(id, 0, 0);
  tmpX.clearRect(0, 0, CW, CH); tmpX.drawImage(cardC, 0, 0);
  const n = 3 + Math.floor(amt * 7);
  for (let k = 0; k < n; k++) {
    const y = r() * CH, h = 6 + r() * 45 * amt, off = (r() - 0.5) * 120 * amt;
    c.drawImage(tmpC, 0, y, CW, h, off, y, CW, h);
  }
  c.fillStyle = `rgba(255,255,255,${0.05 * amt})`;
  for (let y = 0; y < CH; y += 4) c.fillRect(0, y, CW, 1);
}

// ----------------------------------------------------------- kinetic type
// anim: "rise" (default), "pop" (scale-in), "slide" (from the left)
function drawWord(c, w, x, y, t, t1, style, anim = "rise") {
  const p = eOut(win(t, w.t - 0.05, anim === "pop" ? 0.2 : 0.26));
  if (p <= 0) return;
  const q = win(t, t1 - 0.14, 0.14), a = p * (1 - q);
  if (a <= 0.01) return;
  c.save(); style(w); c.globalAlpha = a;
  const b = (1 - p) * 9 + q * 6; if (b > 0.3) c.filter = `blur(${b.toFixed(1)}px)`;
  c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 24; c.shadowOffsetY = 5;
  let dx = 0, dy = (1 - p) * 30 - q * 14, sc = 0.9 + 0.1 * p;
  if (anim === "pop") { sc = lerp(1.35, 1, eBack(win(t, w.t - 0.05, 0.22), 1.4)); dy = -q * 10; }
  if (anim === "slide") { dx = -(1 - p) * 60; dy = -q * 10; sc = 1; }
  c.translate(x + dx, y + dy); c.scale(sc, sc); c.fillText(w.text, 0, 0); c.restore();
}
function layoutLine(c, words, style, maxW, gapK = 1) {
  const ws = words.map((w) => { style(w); return c.measureText(w.text).width; });
  const gaps = words.map((w) => { style(w); return c.measureText(" ").width * gapK; });
  const total = ws.reduce((a, b) => a + b, 0) + gaps.slice(1).reduce((a, b) => a + b, 0);
  const k = total > maxW ? maxW / total : 1;
  let x = -total / 2; const xs = [];
  words.forEach((w, i) => { if (i) x += gaps[i]; xs.push((x + ws[i] / 2) * k); x += ws[i]; });
  return { xs, k };
}
const accentOf = (cap) => (cap.opts.red ? RED : "#ffffff");
function lineStyle(c, size, emScale, accent, k = 1, weight = 800) {
  return (w) => {
    c.textAlign = "center"; c.textBaseline = "alphabetic";
    if (w.em) { font(c, 400, size * emScale * k, SERIF, true); c.fillStyle = accent; c.letterSpacing = "0px"; }
    else { font(c, weight, size * k, SANS); c.fillStyle = "#fff"; c.letterSpacing = "-1px"; }
  };
}
function drawLine(c, words, cx, y, t, t1, size, emScale, accent, maxW, anim, weight) {
  if (!words.length) return;
  let L = layoutLine(c, words, lineStyle(c, size, emScale, accent, 1, weight), maxW);
  const st = lineStyle(c, size, emScale, accent, L.k, weight);
  L = layoutLine(c, words, st, maxW);
  words.forEach((w, i) => drawWord(c, w, cx + L.xs[i], y, t, t1, st, anim));
}
// on the video, over the person
function capOver(c, cap, t) {
  const words = cap.layout === "behind" || cap.layout === "side" ? cap.words.filter((w) => w.i !== cap.opts.hero) : cap.words;
  drawLine(c, words, CW / 2, OVER_Y, t, cap.t1, cap.layout === "over" ? 54 : 40, 1.32, accentOf(cap), 900, "pop", cap.layout === "over" ? 800 : 700);
}
// big editorial type under the card (main canvas)
function capBelow(cap, t) {
  const split = cap.opts.split ?? cap.words[0].i;
  const top = cap.words.filter((w) => w.i < split);
  let big = cap.words.filter((w) => w.i >= split), rest = [];
  if (cap.opts.rest_small) { rest = big.filter((w) => !w.em); big = big.filter((w) => w.em); }
  const acc = accentOf(cap);
  X.save();
  drawLine(X, top, 540, BELOW_SMALL, t, cap.t1, 44, 1.3, acc, 960, "rise", 600);
  drawLine(X, big, 540, BELOW_BIG - (top.length ? 0 : 50), t, cap.t1, 108, 1.3, acc, 1000, "rise", 900);
  drawLine(X, rest, 540, BELOW_REST, t, cap.t1, 42, 1.3, acc, 960, "rise", 600);
  X.restore();
}
// one big word over the person
function capTop(c, cap, t) {
  const hero = cap.words.filter((w) => w.i === cap.opts.hero || w.i === cap.opts.hero2);
  const rest = cap.words.filter((w) => !hero.includes(w));
  const acc = accentOf(cap);
  drawLine(c, rest, CW / 2, 330, t, cap.t1, 40, 1.3, "#fff", 900, "rise", 700);
  const h = hero.map((w) => ({ ...w, em: true }));
  let L = layoutLine(c, h, lineStyle(c, 150, 1, acc), 940);
  const st = lineStyle(c, 150, 1, acc, L.k); L = layoutLine(c, h, st, 940);
  h.forEach((w, i) => drawWord(c, w, CW / 2 + L.xs[i], 470, t, cap.t1, (ww) => { st(ww); c.shadowColor = "rgba(0,0,0,0.6)"; }, "pop"));
}

// ------------------------------------------------- words behind the person
function heroSize(c, text, fam, maxW, maxS) {
  let s = maxS; font(c, 900, s, fam); const w = c.measureText(text).width; if (w > maxW) s *= maxW / w; return s;
}
function heroBehind(c, t, hg, outline) {
  for (const h of heroSpans) {
    if (t < h.t0 || t > h.t1 + 0.3) continue;
    const q = win(t, h.t1 - 0.05, 0.3);
    const text = h.text.toUpperCase();
    c.save(); c.textBaseline = "alphabetic";
    if (h.kind === "behind") {
      c.letterSpacing = "2px";
      const size = heroSize(c, text, WIDE, 940, 220); font(c, 900, size, WIDE);
      const total = c.measureText(text).width;
      const base = clamp(hg.top + hg.w * 0.72, size * 0.85, CH - 40);
      let x = CW / 2 - total / 2;
      [...text].forEach((ch, i) => {
        const cw = c.measureText(ch).width;
        const p = eOut(win(t, h.t0 + i * 0.04, 0.42));
        if (p > 0) {
          c.save(); c.globalAlpha = p * (1 - q);
          const b = (1 - p) * 14 + q * 10; if (b > 0.3 && !outline) c.filter = `blur(${b.toFixed(1)}px)`;
          c.translate(x + cw / 2, base + (1 - p) * 60 - q * 24); c.textAlign = "center";
          if (outline) { c.globalAlpha *= 0.55; c.strokeStyle = "#fff"; c.lineWidth = 2; c.strokeText(ch, 0, 0); }
          else { c.fillStyle = "#fff"; c.shadowColor = "rgba(0,0,0,0.25)"; c.shadowBlur = 30; c.fillText(ch, 0, 0); }
          c.restore();
        }
        x += cw;
      });
    } else {  // sideways: runs bottom-to-top beside the head, mirrored outline on the other side
      c.letterSpacing = "4px";
      const size = heroSize(c, text, WIDE, CH - 60, 150); font(c, 900, size, WIDE);
      const p = eOut(win(t, h.t0, 0.5));
      const leftX = clamp(hg.cx - hg.w * 0.95, size * 0.5 + 20, CW / 2 - 80);
      const rightX = clamp(hg.cx + hg.w * 0.95, CW / 2 + 80, CW - size * 0.5 - 20);
      [[leftX, -Math.PI / 2, true], [rightX, Math.PI / 2, false]].forEach(([x, rot, solid]) => {
        c.save(); c.globalAlpha = p * (1 - q) * (solid ? 1 : 0.85);
        c.translate(x, CH / 2 + (1 - p) * (solid ? 200 : -200)); c.rotate(rot);
        c.textAlign = "center"; c.textBaseline = "middle";
        if (!outline) {
          if (solid) { c.fillStyle = h.red ? RED : "#fff"; c.shadowColor = "rgba(0,0,0,0.25)"; c.shadowBlur = 24; c.fillText(text, 0, 0); }
          else { c.strokeStyle = "#fff"; c.lineWidth = 2.5; c.strokeText(text, 0, 0); }
        } else if (solid) { c.globalAlpha *= 0.5; c.strokeStyle = "#fff"; c.lineWidth = 2; c.strokeText(text, 0, 0); }
        c.restore();
      });
    }
    c.restore();
  }
}

// ------------------------------------------------------------- MG: scan
function mgScan(c, t, m, hg) {
  const p = win(t, m.t0, 0.35), q = win(t, m.t1 - 0.25, 0.25);
  const a = eOut(p) * (1 - q); if (a <= 0) return;
  const sc = lerp(1.35, 1, eOut(p));
  const bw = hg.w * 1.2 * sc, bh = hg.w * 1.45 * sc;
  const bx = hg.cx - bw / 2, by = Math.max(14, hg.top - 16);
  const prog = clamp((t - m.t0 - 0.3) / Math.max(0.5, m.t1 - m.t0 - 1.1));
  const detected = prog >= 0.62, col = detected ? YEL : "#ffffff";
  c.save(); c.globalAlpha = a;
  c.strokeStyle = col; c.lineWidth = 4; c.lineCap = "round"; const L = 34;
  [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(([x, y, sx, sy]) => {
    c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); c.stroke(); });
  const sy = by + bh * (0.5 + 0.5 * Math.sin(t * 3.2));
  const g = c.createLinearGradient(0, sy - 30, 0, sy + 3);
  g.addColorStop(0, "rgba(255,230,0,0)"); g.addColorStop(1, detected ? "rgba(255,230,0,0.35)" : "rgba(255,255,255,0.28)");
  c.fillStyle = g; c.fillRect(bx + 5, sy - 30, bw - 10, 33); c.fillStyle = col; c.fillRect(bx + 5, sy, bw - 10, 2);
  c.fillStyle = "rgba(255,255,255,0.18)";
  for (let gx = bx + 24; gx < bx + bw - 16; gx += 28) for (let gy = by + 24; gy < by + bh - 16; gy += 28) c.fillRect(gx, gy, 2, 2);
  const pct = Math.round(eOut(prog) * 98);
  const label = detected ? `AI EDIT DETECTED  ${pct}%` : `SCANNING EDIT…  ${pct}%`;
  font(c, 700, 21, MONO); c.letterSpacing = "1px";
  const lw = c.measureText(label).width + 32, lx = clamp(hg.cx + bw / 2 + 14, 20, CW - lw - 20), ly = by + 6;
  rr(c, lx, ly, lw, 40, 10); c.fillStyle = detected ? YEL : "rgba(15,15,15,0.78)"; c.fill();
  c.fillStyle = detected ? "#111" : "#fff"; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(label, lx + 16, ly + 27);
  if (detected) {
    ["template captions", "stock SFX", "preset motion"].forEach((s, i) => {
      const tp = eOut(win(t, m.t0 + 0.3 + (m.t1 - m.t0 - 1.1) * 0.62 + i * 0.15, 0.25)); if (tp <= 0) return;
      font(c, 600, 19, MONO); const tw = c.measureText("✕ " + s).width + 22;
      const x = hg.cx + bw / 2 + 14 + (1 - tp) * 30, y = ly + 56 + i * 46;
      c.globalAlpha = a * tp; rr(c, Math.min(x, CW - tw - 16), y, tw, 34, 9); c.fillStyle = "rgba(20,20,20,0.8)"; c.fill();
      c.strokeStyle = "rgba(255,230,0,0.8)"; c.lineWidth = 1.5; c.stroke(); c.fillStyle = YEL; c.fillText("✕ " + s, Math.min(x, CW - tw - 16) + 11, y + 23);
    });
  }
  c.restore();
}

// ------------------------------------------------------------- MG: orbit
function orbitWords(c, t, m, hg, layer) {
  const p = eOut(win(t, m.t0, 0.6)), q = win(t, m.t1 - 0.4, 0.4), a = p * (1 - q); if (a <= 0) return;
  const words = m.opts.words, N = words.length;
  const rx = Math.min(hg.w * lerp(0.7, 1.15, p), 440), ry = rx * 0.17, cy = hg.top + hg.w * 0.36;
  c.save(); c.textAlign = "center"; c.textBaseline = "middle";
  words.forEach((wd, i) => {
    const th = t * 1.25 + (Math.PI * 2 * i) / N, z = Math.sin(th);
    if ((layer === "back") !== (z < 0)) return;
    const x = hg.cx + rx * Math.cos(th), y = cy + ry * z;
    const s = 0.78 + 0.32 * (z + 1) / 2, ap = eOut(win(t, m.t0 + i * 0.09, 0.35));
    c.save(); c.globalAlpha = a * ap * (0.55 + 0.45 * (z + 1) / 2); c.translate(x, y); c.scale(s, s);
    if (i % 3 === 1) { font(c, 400, 66, SERIF, true); c.fillStyle = RED; }
    else if (i % 3 === 2) { font(c, 900, 40, WIDE); c.fillStyle = "#fff"; c.letterSpacing = "1px"; wd = wd.toUpperCase(); }
    else { font(c, 800, 50, SANS); c.fillStyle = "#fff"; c.letterSpacing = "-1px"; }
    c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 16; if (z < -0.2) c.filter = `blur(${(-z * 2).toFixed(1)}px)`;
    c.fillText(wd, 0, 0); c.restore();
  });
  c.globalAlpha = a * 0.35; c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.beginPath();
  if (layer === "back") c.ellipse(hg.cx, cy, rx, ry, 0, Math.PI, Math.PI * 2); else c.ellipse(hg.cx, cy, rx, ry, 0, 0, Math.PI);
  c.stroke(); c.restore();
}

// ------------------------------------------------------------- MG: rings
function rings(c, t, m, hg, layer) {
  const p = win(t, m.t0, 0.7), q = win(t, m.t1 - 0.3, 0.3), a = 1 - q; if (p <= 0 || a <= 0) return;
  const cy = hg.top + hg.w * 0.12;
  c.save(); c.lineCap = "round";
  [[0.85, 0.22, RED, 3, 0], [1.08, 0.26, "rgba(255,255,255,0.75)", 1.6, 1], [0.66, 0.17, CREAM, 2, 2]].forEach(([kr, ky, col, lw, i]) => {
    const pp = eOut(clamp(p * 1.3 - i * 0.15)); if (pp <= 0) return;
    const rx = Math.min(hg.w * kr, 470 - i * 10), ry = rx * ky, rot = -0.05 + i * 0.05 + t * 0.03 * (i % 2 ? -1 : 1);
    c.save(); c.translate(hg.cx, cy); c.rotate(rot); c.strokeStyle = col; c.lineWidth = lw; c.globalAlpha = a;
    if (i === 1) { c.setLineDash([6, 14]); c.lineDashOffset = -t * 40; }
    const sweep = Math.PI * 2 * pp; c.beginPath();
    if (layer === "back") c.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI + Math.min(Math.PI, sweep));
    else if (sweep > Math.PI) c.ellipse(0, 0, rx, ry, 0, 0, sweep - Math.PI);
    c.stroke();
    if (layer === "front" && i === 0) { const th = t * 2.2; if (Math.sin(th) > 0) { c.fillStyle = RED; c.shadowColor = RED; c.shadowBlur = 18; c.beginPath(); c.arc(rx * Math.cos(th), ry * Math.sin(th), 6, 0, 7); c.fill(); } }
    c.restore();
  });
  if (layer === "front") {
    const r = rnd(5);
    for (let k = 0; k < 9; k++) {
      const ang = r() * 6.28, rad = hg.w * (0.7 + r() * 0.7), x = hg.cx + Math.cos(ang) * rad, y = cy + 60 + Math.sin(ang) * rad * 0.5;
      const tw = Math.max(0, Math.sin(t * 4 + k * 1.7)) * eOut(p) * a; if (tw < 0.05) continue;
      c.save(); c.globalAlpha = tw; c.strokeStyle = CREAM; c.lineWidth = 2; const s = 7 + 5 * tw;
      c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.moveTo(x, y - s); c.lineTo(x, y + s); c.stroke(); c.restore();
    }
  }
  c.restore();
}

// -------------------------------------------------------------- MG: wave
function wave(c, t, m, hg, fi) {
  const p = eOut(win(t, m.t0, 0.4)), q = win(t, m.t1 - 0.3, 0.3), a = p * (1 - q); if (a <= 0) return;
  const N = 60, y = hg.top + hg.w * 0.95, gap = CW / N;
  c.save(); c.globalAlpha = a;
  for (let i = 0; i < N; i++) {
    const amp = TL.amp ? TL.amp[fi] : 0.5;
    const n = 0.5 + 0.5 * Math.sin(t * 7 + i * 0.9) * Math.cos(t * 3.1 + i * 0.37);
    const hh = 8 + (30 + 110 * amp) * n * eOut(clamp(p * 1.5 - Math.abs(i - N / 2) / N));
    const g = c.createLinearGradient(0, y - hh / 2, 0, y + hh / 2); g.addColorStop(0, "#fff"); g.addColorStop(1, RED);
    c.fillStyle = g; rr(c, gap * (i + 0.5) - 3.5, y - hh / 2, 7, hh, 3.5); c.fill();
  }
  c.restore();
}

// -------------------------------------------------------------- MG: chips
function chips(c, t, m) {
  const q = win(t, m.t1 - 0.25, 0.25);
  m.opts.items.forEach((s, i) => {
    const p = win(t, m.t0 + 0.05 + i * 0.25, 0.35); if (p <= 0) return;
    c.save(); font(c, 700, 27, SANS); c.letterSpacing = "0px";
    const tw = c.measureText(s).width + 44, h = 52, x = CW - 26 - tw, y = 24 + i * 64;
    c.globalAlpha = (1 - q) * clamp(p * 2);
    c.translate(x + tw, y + h / 2); const sc = eBack(p, 2.2); c.scale(sc, sc); c.translate(-tw, -h / 2);
    c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 20; c.shadowOffsetY = 6;
    rr(c, 0, 0, tw, h, 26); c.fillStyle = i === 0 ? RED : "rgba(18,14,11,0.72)"; c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = "rgba(255,255,255,0.3)"; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = "#fff"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(s, 22, h / 2 + 1); c.restore();
  });
}

// ---------------------------------------------------------- MG: workflow
const STEPS = [["Story", "cut"], ["Kinetic", "type"], ["Motion", "design"], ["Sound", "design"], ["Colour", "grade"]];
function workflow(c, t, m) {
  const p = eOut(win(t, m.t0, 0.32)), q = win(t, m.t1 - 0.25, 0.25), a = p * (1 - q); if (a <= 0) return;
  blurX.clearRect(0, 0, 100, 56); blurX.drawImage(cardC, 0, 0, 100, 56);
  c.save(); c.globalAlpha = a; c.imageSmoothingQuality = "high";
  c.drawImage(blurC, 0, 0, CW, CH); c.fillStyle = "rgba(12,8,6,0.66)"; c.fillRect(0, 0, CW, CH);
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  const tp = eOut(win(t, m.t0 + 0.1, 0.4));
  c.globalAlpha = a * tp;
  font(c, 700, 20, SANS); c.letterSpacing = "5px"; c.fillStyle = RED; c.fillText("THE VIBE EDITING WORKFLOW", CW / 2, 92);
  c.letterSpacing = "-1.5px"; font(c, 900, 50, SANS); const w1 = c.measureText("Same tools.").width;
  c.letterSpacing = "0px"; font(c, 400, 64, SERIF, true); const w2 = c.measureText("Different workflow.").width;
  const sx = CW / 2 - (w1 + 22 + w2) / 2; c.textAlign = "left";
  c.letterSpacing = "-1.5px"; font(c, 900, 50, SANS); c.fillStyle = "#fff"; c.fillText("Same tools.", sx, 164);
  c.letterSpacing = "0px"; font(c, 400, 64, SERIF, true); c.fillStyle = RED; c.fillText("Different workflow.", sx + w1 + 22, 164);
  c.textAlign = "center";
  c.globalAlpha = a;
  const x0 = 130, x1 = CW - 130, y = 312, n = STEPS.length, gap = (x1 - x0) / (n - 1);
  const lp = clamp((t - m.t0 - 0.3) / (0.22 * (n - 1)));
  c.strokeStyle = "rgba(255,255,255,0.15)"; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
  const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "#fff"); g.addColorStop(1, RED);
  c.strokeStyle = g; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (x1 - x0) * lp, y); c.stroke();
  STEPS.forEach(([l1, l2], i) => {
    const x = x0 + i * gap, rp = eOut(win(t, m.t0 + 0.3 + i * 0.22, 0.3)); if (rp <= 0) return;
    const lit = win(t, m.t0 + 0.42 + i * 0.22, 0.18);
    c.save(); c.translate(x, y); c.scale(lerp(0.5, 1, eBack(rp, 2)), lerp(0.5, 1, eBack(rp, 2)));
    c.shadowColor = lit > 0 ? "rgba(255,61,46,0.6)" : "transparent"; c.shadowBlur = 26;
    c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fillStyle = lit > 0 ? RED : "rgba(255,255,255,0.08)"; c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 1.5; c.stroke();
    if (lit > 0.5) {
      c.strokeStyle = "#fff"; c.lineWidth = 5; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(-14, 1); c.lineTo(-4, 12); c.lineTo(15, -11); c.setLineDash([46]); c.lineDashOffset = 46 * (1 - (lit - 0.5) * 2); c.stroke(); c.setLineDash([]);
    } else { font(c, 700, 24, MONO); c.fillStyle = "rgba(255,255,255,0.85)"; c.textBaseline = "middle"; c.fillText(String(i + 1).padStart(2, "0"), 0, 2); }
    c.restore();
    c.save(); c.globalAlpha = a * rp; c.textBaseline = "alphabetic"; c.textAlign = "center";
    font(c, 800, 30, SANS); c.fillStyle = "#fff"; c.letterSpacing = "-0.5px"; c.fillText(l1, x, y + 92);
    font(c, 400, 34, SERIF, true); c.fillStyle = lit > 0 ? "#FFB8AE" : "rgba(255,255,255,0.6)"; c.letterSpacing = "0px"; c.fillText(l2, x, y + 128);
    c.restore();
  });
  c.restore();
}

// ----------------------------------------------------------- MG: comment
function comment(c, t, m) {
  const p = win(t, m.t0, 0.45), q = win(t, m.t1 + 0.6, 0.3); if (p <= 0 || q >= 1) return;
  const w = 450, h = 100;
  c.save(); c.globalAlpha = 1 - q; c.translate(26 + (1 - eBack(p, 1.6)) * -380, 84);
  c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 30; c.shadowOffsetY = 10;
  rr(c, 0, 0, w, h, 26); c.fillStyle = "#fff"; c.fill(); c.shadowColor = "transparent";
  const g = c.createLinearGradient(20, 20, 90, 90); g.addColorStop(0, EMBER); g.addColorStop(1, RED2);
  c.beginPath(); c.arc(54, h / 2, 30, 0, 7); c.fillStyle = g; c.fill();
  c.textAlign = "center"; c.textBaseline = "alphabetic"; font(c, 800, 28, SANS); c.fillStyle = "#fff"; c.fillText("Y", 54, h / 2 + 10);
  c.textAlign = "left"; font(c, 600, 21, SANS); c.fillStyle = "#8a8a8a"; c.fillText("you  ·  now", 100, 38);
  const n = clamp(Math.floor((t - m.t0 - 0.3) / 0.11), 0, 4), typed = "VIBE".slice(0, n);
  font(c, 900, 36, SANS); c.fillStyle = "#111"; c.letterSpacing = "2px"; c.fillText(typed, 100, 78);
  const tw = c.measureText(typed).width; if (n < 4 || Math.sin(t * 12) > 0) { c.fillStyle = RED; c.fillRect(104 + tw, 50, 3, 34); }
  c.letterSpacing = "0px";
  const hp = win(t, m.t0 + 1.0, 0.3), hs = hp > 0 ? eBack(hp, 3) : 0.85;
  c.save(); c.translate(w - 46, h / 2); c.scale(hs, hs); c.fillStyle = hp > 0 ? "#FF3B5C" : "#cfcfcf";
  c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-26, -5, -14, -26, 0, -12); c.bezierCurveTo(14, -26, 26, -5, 0, 12); c.fill(); c.restore();
  c.restore();
}

// ----------------------------------------------------------- card label
function cardLabel(c, t) {
  const k = win(t, TR - 0.15, 0.3), after = k >= 0.5, sy = Math.abs(Math.cos(k * Math.PI));
  const txt = after ? "MY AI EDIT  ✦" : "TYPICAL AI EDIT";
  c.save(); font(c, 800, 18, SANS); c.letterSpacing = "3px";
  const tw = c.measureText(txt).width + 36;
  c.translate(22, 22 + 19); c.scale(1, Math.max(0.02, sy)); c.translate(0, -19);
  rr(c, 0, 0, tw, 38, 19); c.fillStyle = after ? RED : "rgba(25,25,25,0.72)"; c.fill();
  if (!after) { c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = 1.5; c.stroke(); }
  c.fillStyle = "#fff"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(txt, 18, 20); c.restore();
}

// ------------------------------------------- toggle / CTA / end card (canvas)
function modeToggle(t) {
  const m = mgOf("cta")[0], out = m ? win(t, m.t0 - 0.35, 0.3) : 0; if (out >= 1) return;
  const k = eInOut(win(t, TR - 0.2, 0.45)), w = 520, h = 70, x = 540 - w / 2, y = UI_Y;
  X.save(); X.globalAlpha = 1 - out; X.translate(0, out * 20);
  rr(X, x, y, w, h, 35); X.fillStyle = "rgba(255,255,255,0.06)"; X.fill(); X.strokeStyle = "rgba(255,255,255,0.14)"; X.lineWidth = 1.5; X.stroke();
  const kw = w / 2 - 8, kx = x + 4 + k * (w / 2);
  X.shadowColor = `rgba(255,61,46,${0.6 * k})`; X.shadowBlur = 30; rr(X, kx, y + 4, kw, h - 8, 31);
  const g = X.createLinearGradient(kx, 0, kx + kw, 0);
  g.addColorStop(0, k > 0.5 ? EMBER : "#3a3a3c"); g.addColorStop(1, k > 0.5 ? RED2 : "#2c2c2e"); X.fillStyle = g; X.fill(); X.shadowColor = "transparent";
  X.textAlign = "center"; X.textBaseline = "middle"; font(X, 800, 25, SANS); X.letterSpacing = "3px";
  X.fillStyle = k < 0.5 ? "#fff" : "rgba(255,255,255,0.4)"; X.fillText("BASIC AI", x + w / 4 + 2, y + h / 2 + 1);
  X.fillStyle = k >= 0.5 ? "#fff" : "rgba(255,255,255,0.4)"; X.fillText("PREMIUM  ✦", x + 3 * w / 4 - 2, y + h / 2 + 1);
  X.restore();
}
function ctaPill(t) {
  const m = mgOf("cta")[0]; if (!m || t < m.t0) return;
  const p = win(t, m.t0, 0.45), tapT = m.words[1] ?? m.t0 + 0.4;
  const press = Math.max(0, 1 - Math.abs(t - tapT - 0.1) / 0.12);
  const w = 600, h = 78, x = 540 - w / 2, y = UI_Y - 4;
  X.save(); X.globalAlpha = clamp(p * 1.5);
  X.translate(540, y + h / 2); const s = eBack(p, 2) * (1 - 0.06 * press); X.scale(s, s); X.translate(-540, -(y + h / 2));
  X.shadowColor = "rgba(255,61,46,0.55)"; X.shadowBlur = 50; X.shadowOffsetY = 10;
  const g = X.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, EMBER); g.addColorStop(1, RED2);
  rr(X, x, y, w, h, 39); X.fillStyle = g; X.fill(); X.shadowColor = "transparent";
  X.save(); rr(X, x, y, w, h, 39); X.clip();
  const sh = ((t - m.t0) % 2.2) / 2.2, sx = x - 200 + sh * (w + 400);
  const sg = X.createLinearGradient(sx - 80, 0, sx + 80, 0);
  sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.4)"); sg.addColorStop(1, "rgba(255,255,255,0)");
  X.fillStyle = sg; X.fillRect(x, y, w, h); X.restore();
  const txt = t > SPEECH_END + 0.6 ? "Join now" : "Learn the workflow";
  font(X, 800, 34, SANS); X.letterSpacing = "-0.5px"; X.fillStyle = "#fff"; X.textAlign = "center"; X.textBaseline = "middle";
  X.fillText(txt, 540 - 22, y + h / 2 + 2);
  const tw = X.measureText(txt).width, ax = 540 - 22 + tw / 2 + 32 + Math.sin(t * 6) * 5, ay = y + h / 2;
  X.lineWidth = 4.5; X.strokeStyle = "#fff"; X.lineCap = "round"; X.lineJoin = "round";
  X.beginPath(); X.moveTo(ax - 14, ay); X.lineTo(ax + 12, ay); X.moveTo(ax + 2, ay - 10); X.lineTo(ax + 12, ay); X.lineTo(ax + 2, ay + 10); X.stroke();
  const rp = win(t, tapT, 0.6);
  if (rp > 0 && rp < 1) { X.strokeStyle = `rgba(255,255,255,${0.7 * (1 - rp)})`; X.lineWidth = 3; X.beginPath(); X.arc(540, ay, 30 + rp * 120, 0, 7); X.stroke(); }
  X.restore();
}
function endCard(c, t) {
  const t0 = SPEECH_END + 0.12; if (t < t0) return;
  const p = eOut(win(t, t0, 0.45));
  blurX.clearRect(0, 0, 100, 56); blurX.drawImage(cardC, 0, 0, 100, 56);
  c.save(); c.globalAlpha = p; c.imageSmoothingQuality = "high"; c.drawImage(blurC, 0, 0, CW, CH);
  c.fillStyle = "rgba(10,6,5,0.62)"; c.fillRect(0, 0, CW, CH);
  const g = c.createRadialGradient(CW / 2, CH * 0.55, 0, CW / 2, CH * 0.55, 520);
  g.addColorStop(0, "rgba(255,61,46,0.26)"); g.addColorStop(1, "rgba(255,61,46,0)"); c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  c.restore();
  const el = (i, fn) => {
    const e = eOut(win(t, t0 + 0.25 + i * 0.12, 0.45)); if (e <= 0) return;
    c.save(); c.globalAlpha = e; c.translate(0, (1 - e) * 36); if (e < 1) c.filter = `blur(${((1 - e) * 10).toFixed(1)}px)`;
    c.textAlign = "center"; c.textBaseline = "alphabetic"; fn(); c.restore();
  };
  el(0, () => { font(c, 700, 20, SANS); c.letterSpacing = "6px"; c.fillStyle = RED; c.fillText("✦  VIBE EDITING  ✦", CW / 2, 118); });
  el(1, () => { font(c, 900, 96, SANS); c.letterSpacing = "-3.5px"; c.fillStyle = "#fff"; c.fillText("Learn the", CW / 2, 238); });
  el(2, () => { font(c, 400, 150, SERIF, true); const gg = c.createLinearGradient(CW / 2 - 280, 0, CW / 2 + 280, 0);
    gg.addColorStop(0, "#fff"); gg.addColorStop(1, RED); c.fillStyle = gg; c.shadowColor = "rgba(255,61,46,0.4)"; c.shadowBlur = 36; c.fillText("workflow.", CW / 2, 370); });
  el(3, () => { font(c, 500, 30, SANS); c.fillStyle = "rgba(255,255,255,0.78)"; c.fillText("Premium edits made with AI — that don't look like AI.", CW / 2, 450); });
}
function endBelow(t) {
  const t0 = SPEECH_END + 0.12; if (t < t0) return;
  const e = eOut(win(t, t0 + 0.75, 0.45)); if (e <= 0) return;
  X.save(); X.globalAlpha = e; X.translate(0, (1 - e) * 30); X.textAlign = "center"; X.textBaseline = "alphabetic";
  font(X, 600, 42, SANS); X.fillStyle = "rgba(255,255,255,0.9)"; X.fillText("Comment", 540, 1250);
  font(X, 900, 120, WIDE); X.letterSpacing = "6px"; X.fillStyle = "#fff"; X.fillText("VIBE", 540, 1385); X.letterSpacing = "0px";
  font(X, 400, 44, SERIF, true); X.fillStyle = RED; X.fillText("or tap the link below", 540, 1450);
  X.restore();
}

// ======================================================= WHITE BOARD SCENES
// A minimal off-white explainer plane takes over the card; the footage glides into a 16:9 PiP.
const PAPER = "#F6F4F0", INKC = "#141414", GREYC = "#8D8882", LINEC = "rgba(20,20,20,0.12)";
const PIP = { w: 214, h: 120, x: CW - 214 - 22, y: CH - 120 - 22 };
const BOARDS = mgOf("board").sort((a, b) => a.t0 - b.t0);
const BGROUPS = [];
for (const b of BOARDS) {
  const g = BGROUPS[BGROUPS.length - 1];
  if (g && b.t0 - g.t1 < 0.6) { g.t1 = Math.max(g.t1, b.t1); g.items.push(b); } else BGROUPS.push({ t0: b.t0, t1: b.t1, items: [b] });
}
// content windows: neighbours crossfade at the middle of their overlap/gap
for (const g of BGROUPS) g.items.forEach((b, i) => {
  const prev = g.items[i - 1], next = g.items[i + 1];
  b.c0 = prev ? (prev.t1 + b.t0) / 2 : g.t0; b.c1 = next ? (b.t1 + next.t0) / 2 : g.t1;
});
function boardAmt(t) {
  for (const g of BGROUPS) {
    if (t < g.t0 - 0.1 || t > g.t1 + 0.1) continue;
    return eInOut(smooth(t, g.t0 - 0.1, g.t0 + 0.45)) * (1 - eInOut(smooth(t, g.t1 - 0.4, g.t1 + 0.1)));
  }
  return 0;
}
function boardItems(t) {   // [{b, a, lt}] content alpha + local time
  const out = [];
  for (const g of BGROUPS) for (const b of g.items) {
    const a = (b.c0 === g.t0 ? 1 : smooth(t, b.c0 - 0.15, b.c0 + 0.15)) * (b.c1 === g.t1 ? 1 : 1 - smooth(t, b.c1 - 0.15, b.c1 + 0.15));
    if (a > 0.001 && t >= b.c0 - 0.2 && t <= b.c1 + 0.2) out.push({ b, a, lt: t - b.c0 });
  }
  return out;
}
function paper(c, k) {
  c.save(); c.globalAlpha = k;
  c.fillStyle = PAPER; c.fillRect(0, 0, CW, CH);
  const g = c.createRadialGradient(CW / 2, CH * 0.4, 50, CW / 2, CH * 0.4, 700);
  g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(1, "rgba(230,226,220,0.6)");
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  c.fillStyle = "rgba(20,20,20,0.075)";
  for (let x = 14; x < CW; x += 28) for (let y = 14; y < CH; y += 28) c.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
  c.restore();
}
const bIn = (lt, d, dur = 0.4) => eOut(clamp((lt - d) / dur));
function kicker(c, text, y, a) {
  c.save(); c.globalAlpha = a; c.textAlign = "center"; c.textBaseline = "alphabetic";
  font(c, 700, 19, SANS); c.letterSpacing = "5px"; c.fillStyle = RED; c.fillText(text, CW / 2, y); c.restore();
}
function softCard(c, x, y, w, h, r = 18, fill = "#fff") {
  c.save(); c.shadowColor = "rgba(40,30,20,0.16)"; c.shadowBlur = 30; c.shadowOffsetY = 12;
  rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); c.shadowColor = "transparent";
  c.strokeStyle = LINEC; c.lineWidth = 1; c.stroke(); c.restore();
}
function check(c, x, y, r, p, col = RED) {
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = col; c.globalAlpha *= clamp(p * 2); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = r * 0.22; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(x - r * 0.4, y + r * 0.02); c.lineTo(x - r * 0.1, y + r * 0.32); c.lineTo(x + r * 0.42, y - r * 0.3);
  c.setLineDash([r * 1.6]); c.lineDashOffset = r * 1.6 * (1 - clamp(p * 1.5 - 0.3)); c.stroke(); c.restore();
}
function boardText(c, txt, x, y, w, size, fam, col, italic, align = "center", ls = "0px") {
  c.save(); c.textAlign = align; c.textBaseline = "alphabetic"; font(c, w, size, fam, italic); c.letterSpacing = ls; c.fillStyle = col; c.fillText(txt, x, y); c.restore();
}

// --- compare: basic vs premium, using the live frame
function bCompare(c, lt, a, img, d) {
  kicker(c, "BASIC   VS   PREMIUM", 74, a * bIn(lt, 0.05));
  const tw = 372, th = 209, y = 132, xs = [96, CW - 96 - tw];
  const verdict = bIn(lt, d * 0.55, 0.35);
  xs.forEach((x, i) => {
    const p = bIn(lt, 0.15 + i * 0.18, 0.5); if (p <= 0) return;
    c.save(); c.globalAlpha = a * p; c.translate(0, (1 - p) * 40);
    softCard(c, x - 8, y - 8, tw + 16, th + 16, 22);
    c.save(); rr(c, x, y, tw, th, 14); c.clip();
    if (i === 0) c.filter = "saturate(0.4) contrast(0.9) brightness(1.05)";
    c.drawImage(img, x, y, tw, th); c.filter = "none";
    if (i === 0) {
      font(c, 900, 26, BASIC); c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 6; c.strokeStyle = "#000";
      c.strokeText("SAME CAPTIONS", x + tw / 2, y + th - 24); c.fillStyle = YEL; c.fillText("SAME CAPTIONS", x + tw / 2, y + th - 24);
      c.fillStyle = `rgba(246,244,240,${0.55 * verdict})`; c.fillRect(x, y, tw, th);
    } else {
      const gg = c.createLinearGradient(0, y + th * 0.5, 0, y + th); gg.addColorStop(0, "rgba(0,0,0,0)"); gg.addColorStop(1, "rgba(0,0,0,0.45)");
      c.fillStyle = gg; c.fillRect(x, y, tw, th);
      boardText(c, "premium.", x + tw / 2, y + th - 22, 400, 46, SERIF, "#fff", true);
    }
    c.restore();
    if (i === 1 && verdict > 0) { c.save(); c.globalAlpha = a * verdict; rr(c, x - 8, y - 8, tw + 16, th + 16, 22); c.strokeStyle = RED; c.lineWidth = 3; c.stroke(); c.restore(); }
    boardText(c, i === 0 ? "Typical AI edit" : "Vibe edit  ✦", x + tw / 2, y + th + 62, i === 0 ? 700 : 800, 30, SANS, i === 0 ? GREYC : INKC, false);
    if (i === 0 && verdict > 0) { c.save(); c.strokeStyle = GREYC; c.lineWidth = 3; c.beginPath(); c.moveTo(x + tw / 2 - 110, y + th + 51); c.lineTo(x + tw / 2 - 110 + 220 * verdict, y + th + 51); c.stroke(); c.restore(); }
    if (i === 1) check(c, x + tw - 4, y + 4, 22, verdict);
    c.restore();
  });
  // arrow between the two
  const ap = bIn(lt, 0.55, 0.5);
  if (ap > 0) {
    c.save(); c.globalAlpha = a; c.strokeStyle = INKC; c.lineWidth = 3; c.lineCap = "round";
    const ax = CW / 2 - 26, ay = y + th / 2;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + 52 * ap, ay); c.stroke();
    if (ap > 0.9) { c.beginPath(); c.moveTo(ax + 40, ay - 11); c.lineTo(ax + 52, ay); c.lineTo(ax + 40, ay + 11); c.stroke(); }
    c.restore();
  }
  const fp = bIn(lt, 0.9, 0.5);
  boardText(c, "same footage  ·  same tools  ·  different edit", CW / 2, 500, 500, 24, SANS, `rgba(20,20,20,${0.5 * a * fp})`, false);
}

// --- tools: same tools, different workflow
function bTools(c, lt, a, d) {
  kicker(c, "SAME TOOLS", 74, a * bIn(lt, 0.05));
  const cols = [270, CW - 270], hi = bIn(lt, d * 0.55, 0.4);
  ["Everyone", "Me"].forEach((h, i) => {
    const p = bIn(lt, 0.1 + i * 0.12); if (p <= 0) return;
    c.save(); c.globalAlpha = a * p * (i === 0 ? 1 - 0.45 * hi : 1);
    boardText(c, h, cols[i], 140, i ? 900 : 700, 36, SANS, i ? INKC : GREYC, false, "center", "-1px");
    // tool chip
    const cp = bIn(lt, 0.3 + i * 0.15, 0.35), cw = 210;
    c.save(); c.translate(cols[i], 214); const sc = lerp(0.6, 1, eBack(cp, 2)); c.scale(sc, sc); c.globalAlpha *= clamp(cp * 2);
    softCard(c, -cw / 2, -32, cw, 64, 32); boardText(c, "✦  Claude", 0, 11, 800, 30, SANS, INKC, false); c.restore();
    // workflow row
    const steps = i === 0 ? ["Prompt", "Export"] : ["Cut", "Type", "Motion", "Sound", "Grade"];
    const span = i === 0 ? 170 : 330, x0 = cols[i] - span / 2, gap = span / (steps.length - 1);
    const wp = bIn(lt, 0.7 + i * 0.2, 0.6);
    c.strokeStyle = i ? RED : "rgba(20,20,20,0.25)"; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x0, 336); c.lineTo(x0 + span * wp, 336); c.stroke();
    steps.forEach((s, k) => {
      const sp = bIn(lt, 0.75 + i * 0.2 + k * 0.1, 0.3); if (sp <= 0) return;
      c.save(); c.globalAlpha *= sp; c.beginPath(); c.arc(x0 + k * gap, 336, i ? 13 : 11, 0, 7);
      c.fillStyle = i ? RED : "#cfcac4"; c.fill(); c.restore();
      c.save(); c.globalAlpha *= sp; boardText(c, s, x0 + k * gap, 376, 700, i ? 21 : 22, SANS, i ? INKC : GREYC, false); c.restore();
    });
    c.restore();
  });
  // equals sign between the chips
  const ep = bIn(lt, 0.55, 0.3);
  c.save(); c.globalAlpha = a * ep; c.fillStyle = INKC; c.fillRect(CW / 2 - 18, 204, 36 * ep, 5); c.fillRect(CW / 2 - 18, 220, 36 * ep, 5); c.restore();
  boardText(c, "TOOL", CW / 2, 268, 700, 16, MONO, `rgba(20,20,20,${0.4 * a})`, false, "center", "3px");
  boardText(c, "WORKFLOW", CW / 2, 342, 700, 16, MONO, `rgba(20,20,20,${0.4 * a})`, false, "center", "3px");
  if (hi > 0) { c.save(); c.globalAlpha = a * hi; rr(c, cols[1] - 215, 96, 430, 312, 26); c.strokeStyle = RED; c.lineWidth = 3; c.setLineDash([1400]); c.lineDashOffset = 1400 * (1 - hi); c.stroke(); c.restore(); }
  boardText(c, "the difference is the workflow", CW / 2 - 110, 480, 400, 34, SERIF, `rgba(20,20,20,${0.75 * a * hi})`, true);
}

// --- workflow: five-step pipeline + live mini timeline
const WSTEPS = [["Story", "cut"], ["Kinetic", "type"], ["Motion", "design"], ["Sound", "design"], ["Colour", "grade"]];
function bWorkflow(c, lt, a) {
  kicker(c, "THE VIBE EDITING WORKFLOW", 70, a * bIn(lt, 0.05));
  const tp = bIn(lt, 0.12, 0.45);
  c.save(); c.globalAlpha = a * tp; c.translate(0, (1 - tp) * 16);
  c.textBaseline = "alphabetic"; c.letterSpacing = "-1.5px"; font(c, 900, 50, SANS); const w1 = c.measureText("Same tools.").width;
  c.letterSpacing = "0px"; font(c, 400, 64, SERIF, true); const w2 = c.measureText("Different workflow.").width;
  const sx = CW / 2 - (w1 + 20 + w2) / 2;
  boardText(c, "Same tools.", sx, 140, 900, 50, SANS, INKC, false, "left", "-1.5px");
  boardText(c, "Different workflow.", sx + w1 + 20, 140, 400, 64, SERIF, RED, true, "left");
  c.restore();
  const x0 = 130, x1 = CW - 130, y = 262, n = 5, gap = (x1 - x0) / (n - 1);
  const lp = clamp((lt - 0.35) / (0.24 * (n - 1)));
  c.save(); c.globalAlpha = a;
  c.strokeStyle = "rgba(20,20,20,0.12)"; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
  c.strokeStyle = RED; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (x1 - x0) * lp, y); c.stroke();
  WSTEPS.forEach(([l1, l2], i) => {
    const x = x0 + i * gap, rp = bIn(lt, 0.3 + i * 0.24, 0.3); if (rp <= 0) return;
    const lit = clamp((lt - 0.42 - i * 0.24) / 0.2);
    c.save(); c.translate(x, y); const sc = lerp(0.5, 1, eBack(rp, 2)); c.scale(sc, sc);
    c.shadowColor = lit > 0 ? "rgba(255,61,46,0.45)" : "rgba(0,0,0,0.12)"; c.shadowBlur = 22; c.shadowOffsetY = 6;
    c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fillStyle = lit > 0 ? RED : "#fff"; c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = lit > 0 ? RED : LINEC; c.lineWidth = 1.5; c.stroke();
    if (lit > 0.4) check(c, 0, 0, 36, (lit - 0.4) / 0.6, RED);
    else boardText(c, String(i + 1).padStart(2, "0"), 0, 8, 700, 22, MONO, INKC, false);
    c.restore();
    c.save(); c.globalAlpha = rp; boardText(c, l1, x, y + 78, 800, 28, SANS, INKC, false, "center", "-0.5px");
    boardText(c, l2, x, y + 112, 400, 32, SERIF, lit > 0 ? RED : GREYC, true); c.restore();
  });
  // mini timeline: tracks fill as the steps light up
  const tl = bIn(lt, 0.4, 0.4); c.globalAlpha = a * tl;
  const tx = 120, tw2 = CW - 420, ty = 418;
  softCard(c, tx - 20, ty - 16, tw2 + 40, 104, 16);
  const tracks = [[RED, [0, 0.22, 0.24, 0.5, 0.52, 0.78, 0.8, 1]], [INKC, [0.05, 0.3, 0.36, 0.62, 0.7, 0.95]], ["#C9C3BC", [0, 1]]];
  tracks.forEach(([col, cuts], r) => {
    for (let k = 0; k < cuts.length; k += 2) {
      const s0 = cuts[k], s1 = Math.min(cuts[k + 1], lp * 1.05); if (s1 <= s0) continue;
      rr(c, tx + tw2 * s0, ty + r * 26, tw2 * (s1 - s0) - 3, 18, 5); c.fillStyle = col; c.globalAlpha = a * tl * (r === 2 ? 0.8 : 0.9); c.fill();
    }
  });
  const ph = tx + tw2 * ((lt * 0.18) % 1); c.globalAlpha = a * tl; c.fillStyle = RED; c.fillRect(ph - 1, ty - 8, 2, 88);
  c.beginPath(); c.moveTo(ph - 7, ty - 12); c.lineTo(ph + 7, ty - 12); c.lineTo(ph, ty - 4); c.fill();
  c.restore();
}

// --- claude: chat UI running the edit
function bClaude(c, lt, a) {
  const x = 110, y = 56, w = 620, h = 440, p = bIn(lt, 0.05, 0.45);
  c.save(); c.globalAlpha = a * p; c.translate(0, (1 - p) * 40);
  softCard(c, x, y, w, h, 26);
  c.fillStyle = "rgba(20,20,20,0.06)"; c.fillRect(x + 1, y + 64, w - 2, 1);
  boardText(c, "✦", x + 34, y + 42, 800, 26, SANS, RED, false, "left");
  boardText(c, "Claude", x + 64, y + 41, 800, 26, SANS, INKC, false, "left", "-0.5px");
  [0, 1, 2].forEach((k) => { c.beginPath(); c.arc(x + w - 40 - k * 22, y + 33, 6, 0, 7); c.fillStyle = "#dcd7d1"; c.fill(); });
  // user prompt
  const prompt = "Edit this like a premium editor.";
  const n = clamp(Math.floor((lt - 0.35) / 0.035), 0, prompt.length), typed = prompt.slice(0, n);
  font(c, 600, 25, SANS); const bw = Math.max(60, c.measureText(prompt).width + 44);
  const bx = x + w - 28 - bw, by = y + 92;
  rr(c, bx, by, bw, 56, 20); c.fillStyle = INKC; c.fill();
  boardText(c, typed + (n < prompt.length && Math.sin(lt * 20) > 0 ? "|" : ""), bx + 22, by + 36, 600, 25, SANS, "#fff", false, "left");
  // steps
  const steps = ["Cut the fumbles", "Kinetic captions", "Sound design", "Cinematic grade"];
  steps.forEach((s, i) => {
    const sp = bIn(lt, 1.55 + i * 0.32, 0.3); if (sp <= 0) return;
    const sy = y + 184 + i * 52;
    c.save(); c.globalAlpha *= sp; c.translate((1 - sp) * -20, 0);
    check(c, x + 50, sy, 15, clamp((lt - 1.65 - i * 0.32) / 0.3));
    boardText(c, s, x + 78, sy + 9, 700, 25, SANS, INKC, false, "left", "-0.3px");
    boardText(c, "done", x + w - 40, sy + 8, 500, 22, MONO, GREYC, false, "right");
    c.restore();
  });
  const pp = clamp((lt - 2.9) / 0.8);
  if (lt > 2.8) {
    const py = y + h - 58;
    rr(c, x + 34, py, w - 68, 12, 6); c.fillStyle = "rgba(20,20,20,0.08)"; c.fill();
    rr(c, x + 34, py, (w - 68) * eInOut(pp), 12, 6); c.fillStyle = RED; c.fill();
    boardText(c, pp < 1 ? `Exporting…  ${Math.round(pp * 100)}%` : "Export ready  ✦", x + 34, py - 14, 700, 20, MONO, pp < 1 ? GREYC : RED, false, "left");
  }
  c.restore();
}

// --- course card: learn the workflow
const MODS = ["Story-first cut", "Kinetic captions", "Depth & motion graphics", "Sound design", "Cinematic grade"];
function bCourse(c, lt, a) {
  c.save(); c.globalAlpha = a;
  const lp = bIn(lt, 0.05, 0.45);
  c.save(); c.globalAlpha *= lp; c.translate((1 - lp) * -30, 0);
  boardText(c, "THE WORKFLOW", 70, 120, 700, 19, SANS, RED, false, "left", "5px");
  boardText(c, "Learn the", 66, 196, 900, 62, SANS, INKC, false, "left", "-2.5px");
  boardText(c, "Vibe Editing", 66, 272, 400, 84, SERIF, RED, true, "left");
  boardText(c, "workflow.", 66, 342, 900, 62, SANS, INKC, false, "left", "-2.5px");
  const bp = bIn(lt, 0.9, 0.4);
  c.save(); c.globalAlpha *= bp; rr(c, 66, 392, 230, 64, 32); c.fillStyle = INKC; c.fill();
  boardText(c, "Join now  →", 66 + 115, 433, 800, 26, SANS, "#fff", false); c.restore();
  c.restore();
  MODS.forEach((m, i) => {
    const p = bIn(lt, 0.45 + i * 0.16, 0.35); if (p <= 0) return;
    const x = 520, y = 66 + i * 70, w = 420, h = 58;
    c.save(); c.globalAlpha *= p; c.translate((1 - p) * 40, 0);
    softCard(c, x, y, w, h, 16);
    boardText(c, String(i + 1).padStart(2, "0"), x + 26, y + 37, 700, 22, MONO, RED, false, "left");
    boardText(c, m, x + 74, y + 37, 700, 25, SANS, INKC, false, "left", "-0.3px");
    check(c, x + w - 34, y + h / 2, 14, clamp((lt - 0.7 - i * 0.16) / 0.3));
    c.restore();
  });
  c.restore();
}

// --- motion: easing curve + a shape riding it
function bMotion(c, lt, a) {
  kicker(c, "MOTION DESIGN", 70, a * bIn(lt, 0.05));
  boardText(c, "Every move is eased.", CW / 2, 128, 400, 46, SERIF, `rgba(20,20,20,${a * bIn(lt, 0.15)})`, true);
  c.save(); c.globalAlpha = a;
  // graph
  const gx = 90, gy = 170, gw = 360, gh = 280, gp = bIn(lt, 0.2, 0.4);
  c.globalAlpha = a * gp; softCard(c, gx - 20, gy - 20, gw + 40, gh + 60, 18);
  c.strokeStyle = LINEC; c.lineWidth = 1;
  for (let k = 0; k <= 4; k++) { c.beginPath(); c.moveTo(gx, gy + gh * k / 4); c.lineTo(gx + gw, gy + gh * k / 4); c.stroke(); }
  const P = (u) => { const x1 = 0.65, x2 = 0.35; const bx = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    const by = 3 * (1 - u) * u * u + u * u * u * 1 - 0 + 0 * u; return [gx + bx * gw, gy + gh - (3 * (1 - u) * u * u * 1 + u * u * u - 3 * (1 - u) * u * u * 0) * gh]; };
  const dp = clamp((lt - 0.4) / 0.9);
  c.strokeStyle = RED; c.lineWidth = 4; c.lineCap = "round"; c.beginPath();
  for (let k = 0; k <= 60 * dp; k++) { const [x, y] = P(k / 60); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  // handles
  const hp = bIn(lt, 1.0, 0.3);
  c.globalAlpha = a * hp; c.strokeStyle = "rgba(20,20,20,0.45)"; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(gx, gy + gh); c.lineTo(gx + gw * 0.65, gy + gh); c.moveTo(gx + gw, gy); c.lineTo(gx + gw * 0.35, gy); c.stroke();
  [[gx + gw * 0.65, gy + gh], [gx + gw * 0.35, gy]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fillStyle = "#fff"; c.fill(); c.stroke(); });
  [[gx, gy + gh], [gx + gw, gy]].forEach(([x, y]) => { c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillStyle = INKC; c.fillRect(-7, -7, 14, 14); c.restore(); });
  c.globalAlpha = a * gp; boardText(c, "ease-in-out", gx, gy + gh + 30, 700, 18, MONO, GREYC, false, "left", "1px");
  // stage: shape rides the curve, morphs square -> circle, leaves a trail
  const sx0 = 540, sx1 = 880, syy = 280, sp = bIn(lt, 0.5, 0.4);
  c.globalAlpha = a * sp; c.strokeStyle = LINEC; c.lineWidth = 2; c.setLineDash([4, 8]); c.beginPath(); c.moveTo(sx0, syy); c.lineTo(sx1, syy); c.stroke(); c.setLineDash([]);
  const cyc = 1.7, u = ((lt - 0.6) % cyc) / cyc, e = eInOut(clamp(u / 0.8));
  const shape = (x, s, alpha, k) => {
    c.save(); c.globalAlpha = a * sp * alpha; c.translate(x, syy); c.rotate(k * Math.PI / 2);
    rr(c, -s / 2, -s / 2, s, s, lerp(10, s / 2, k)); c.fillStyle = k > 0.5 ? INKC : RED; c.fill(); c.restore();
  };
  for (let g = 5; g >= 1; g--) { const eg = eInOut(clamp((u - g * 0.025) / 0.8)); shape(lerp(sx0, sx1, eg), 74, 0.08 * (6 - g), eg); }
  shape(lerp(sx0, sx1, e), 80, 1, e);
  // keyframe timeline under the stage
  c.globalAlpha = a * sp; c.fillStyle = "rgba(20,20,20,0.15)"; c.fillRect(sx0, 372, sx1 - sx0, 2);
  [sx0, sx1].forEach((x) => { c.save(); c.translate(x, 373); c.rotate(Math.PI / 4); c.fillStyle = RED; c.fillRect(-7, -7, 14, 14); c.restore(); });
  const phx = lerp(sx0, sx1, clamp(u / 0.8)); c.fillStyle = INKC; c.fillRect(phx - 1, 354, 2, 38);
  boardText(c, "keyframes", sx0, 410, 700, 18, MONO, GREYC, false, "left", "1px");
  c.restore();
}

function drawBoard(c, t, k, img) {
  paper(c, k);
  for (const { b, a, lt } of boardItems(t)) {
    const d = b.c1 - b.c0, aa = a * clamp((k - 0.35) / 0.65);
    if (aa <= 0) continue;
    c.save(); c.translate(0, (1 - clamp((k - 0.3) / 0.7)) * 30);
    const kind = b.opts.kind;
    if (kind === "compare") bCompare(c, lt, aa, img, d);
    else if (kind === "tools") bTools(c, lt, aa, d);
    else if (kind === "workflow") bWorkflow(c, lt, aa);
    else if (kind === "claude") bClaude(c, lt, aa);
    else if (kind === "course") bCourse(c, lt, aa);
    else if (kind === "motion") bMotion(c, lt, aa);
    c.restore();
  }
}
// the footage shrinks into a 16:9 picture-in-picture (never cropped)
function drawPip(c, img, k, hide) {
  const e = eInOut(k);
  const w = lerp(CW, PIP.w, e), h = w * CH / CW, x = lerp(0, PIP.x, e), y = lerp(0, PIP.y, e);
  const alpha = hide ? 1 - smooth(k, 0.55, 0.95) : 1;
  if (alpha <= 0) return;
  c.save(); c.globalAlpha = alpha;
  c.shadowColor = `rgba(0,0,0,${0.35 * e})`; c.shadowBlur = 30 * e; c.shadowOffsetY = 10 * e;
  rr(c, x, y, w, h, lerp(0, 16, e)); c.fillStyle = "#000"; c.fill(); c.shadowColor = "transparent";
  c.save(); rr(c, x, y, w, h, lerp(0, 16, e)); c.clip(); c.drawImage(img, x, y, w, h); c.restore();
  if (e > 0.05) { rr(c, x, y, w, h, lerp(0, 16, e)); c.strokeStyle = `rgba(255,255,255,${0.95 * e})`; c.lineWidth = 3; c.stroke(); }
  c.restore();
}

// ------------------------------------------------------------------ frame
async function renderAt(fi) {
  const t = fi / fps, src = TL.frames[fi];
  const img = await loadImg(`${TL.frame_dir}/s${pad5(src)}.jpg`);
  const hg = headGeom(fi), isAfter = t >= TR;
  const depthOn = heroSpans.some((h) => t >= h.t0 && t <= h.t1 + 0.3);
  const BK = isAfter ? boardAmt(t) : 0;
  const needMask = isAfter && BK < 0.02 && (depthOn || ["orbit", "rings", "wave"].some((k) => mgOf(k).some((m) => active(m, t))));
  let maskOK = false;
  if (needMask && TL.has_mask[fi]) {
    const mimg = await loadImg(`${TL.mask_dir}/s${pad5(src)}.png`);
    maskX.clearRect(0, 0, 576, 512); maskX.drawImage(mimg, 0, 0, 576, 512);
    const id = maskX.getImageData(0, 0, 576, 512), d = id.data;
    for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 255; }
    maskX.putImageData(id, 0, 0); maskOK = true;
  }
  backdrop(t); title(t);

  const c = cardX; c.clearRect(0, 0, CW, CH);
  if (!isAfter) {
    drawFootage(c, img, "basic");
    if (t >= TG) glitch(c, fi, 0.35 + 0.65 * clamp((t - TG) / (TR - TG)) * (fi % 3 === 0 ? 1 : 0.6));
  } else {
    const rp = win(t, TR, 0.55);
    if (rp < 1) { drawFootage(c, img, "basic"); c.save(); c.beginPath(); c.arc(CW / 2, CH * 0.45, eOut(rp) * 700, 0, 7); c.clip(); drawFootage(c, img, "grade"); c.restore(); }
    else drawFootage(c, img, "grade");
  }
  if (maskOK) {
    mgOf("wave").forEach((m) => active(m, t) && wave(c, t, m, hg, fi));
    mgOf("rings").forEach((m) => active(m, t) && rings(c, t, m, hg, "back"));
    heroBehind(c, t, hg, false);
    mgOf("orbit").forEach((m) => active(m, t) && orbitWords(c, t, m, hg, "back"));
    subX.clearRect(0, 0, CW, CH); subX.drawImage(img, 0, 0, CW, CH);
    subX.globalCompositeOperation = "destination-in"; subX.drawImage(maskC, MASK.x, 0, MASK.w, CH);
    subX.globalCompositeOperation = "source-over"; c.drawImage(subC, 0, 0);
    heroBehind(c, t, hg, true);                       // ghost outline keeps the hidden letters readable
    mgOf("rings").forEach((m) => active(m, t) && rings(c, t, m, hg, "front"));
    mgOf("orbit").forEach((m) => active(m, t) && orbitWords(c, t, m, hg, "front"));
  }
  mgOf("scan").forEach((m) => active(m, t) && mgScan(c, t, m, hg));
  mgOf("workflow").forEach((m) => active(m, t) && workflow(c, t, m));
  if (BK > 0) {
    const vid = cardC.width ? tmpC : null;
    tmpX.clearRect(0, 0, CW, CH); tmpX.drawImage(cardC, 0, 0);          // current graded footage
    drawBoard(c, t, BK, img);
    const hide = boardItems(t).some(({ b, a }) => b.opts.kind === "compare" && a > 0.5);
    drawPip(c, tmpC, BK, hide);
  }
  const bg = c.createLinearGradient(0, CH * 0.6, 0, CH);
  bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(1, `rgba(0,0,0,${(isAfter ? 0.4 : 0.22) * (1 - BK)})`);
  c.fillStyle = bg; c.fillRect(0, CH * 0.6, CW, CH * 0.4);
  const caps = TL.captions.filter((cap) => cap.layout === "basic" ? (t >= cap.t0 && t < cap.t1 && t < TR) : (t >= cap.t0 - 0.1 && t <= cap.t1 + 0.05));
  for (const cap of caps) {
    if (cap.layout === "basic") basicCaption(c, cap, t);
    else if (BK > 0.3) continue;                 // board up: in-card captions move under the card
    else if (cap.layout === "over" || cap.layout === "behind" || cap.layout === "side") capOver(c, cap, t);
    else if (cap.layout === "top") capTop(c, cap, t);
  }
  mgOf("chips").forEach((m) => active(m, t) && chips(c, t, m));
  mgOf("comment").forEach((m) => active(m, t, 0, 1) && comment(c, t, m));
  endCard(c, t); cardLabel(c, t);
  const fl = win(t, TR, 0.3);
  if (t >= TR && fl < 1) { c.fillStyle = `rgba(255,248,240,${0.85 * Math.pow(1 - fl, 2)})`; c.fillRect(0, 0, CW, CH); }

  // composite the card: full 16:9 frame always visible; only the card itself moves
  const warm = smooth(t, TR - 0.1, TR + 0.9), sp = win(t, TR, 0.7);
  const sc = t >= TR ? 1 + 0.04 * Math.sin(sp * Math.PI) * (1 - sp) : 1 - 0.012 * clamp((t - TG) / (TR - TG));
  const floatY = Math.sin(t * 1.1) * 3 * warm, rot = Math.sin(t * 0.6) * 0.0025 * warm;
  X.save();
  X.translate(CARD.x + CARD.w / 2, CARD.y + CARD.h / 2 + floatY); X.rotate(rot); X.scale(sc, sc); X.translate(-CARD.w / 2, -CARD.h / 2);
  X.shadowColor = "rgba(0,0,0,0.6)"; X.shadowBlur = 80; X.shadowOffsetY = 30;
  rr(X, 0, 0, CARD.w, CARD.h, CARD.r); X.fillStyle = "#000"; X.fill();
  X.shadowColor = `rgba(255,61,46,${0.3 * warm})`; X.shadowBlur = 70; X.shadowOffsetY = 0; X.fill(); X.shadowColor = "transparent";
  X.save(); rr(X, 0, 0, CARD.w, CARD.h, CARD.r); X.clip(); X.drawImage(cardC, 0, 0, CARD.w, CARD.h); X.restore();
  rr(X, 0.75, 0.75, CARD.w - 1.5, CARD.h - 1.5, CARD.r);
  X.strokeStyle = `rgba(255,${lerp(255, 190, warm) | 0},${lerp(255, 170, warm) | 0},${0.12 + 0.1 * warm})`; X.lineWidth = 1.5; X.stroke();
  X.restore();

  for (const cap of caps) {
    if (cap.layout === "below") capBelow(cap, t);
    else if (BK > 0.3 && cap.layout !== "basic") capBelow({ ...cap, opts: { ...cap.opts, split: cap.words[0].i, em: undefined } }, t);
  }
  endBelow(t);
  modeToggle(t); ctaPill(t); grainPass(fi);
}
// "typical AI edit" caption: yellow Montserrat, word highlight, pop
function basicCaption(c, cap, t) {
  const cx = CW / 2, y = 500, p = win(t, cap.t0, 0.14), sc = p < 1 ? lerp(0.6, 1, eBack(p, 2.6)) : 1;
  c.save(); c.translate(cx, y); c.scale(sc, sc);
  font(c, 900, 56, BASIC); c.textAlign = "center"; c.textBaseline = "alphabetic"; c.letterSpacing = "0px";
  const words = cap.words.map((w) => ({ ...w, text: w.text.toUpperCase() }));
  const ws = words.map((w) => c.measureText(w.text).width), spc = c.measureText(" ").width;
  const total = ws.reduce((a, b) => a + b, 0) + spc * (words.length - 1);
  c.scale(Math.min(1, 900 / total), Math.min(1, 900 / total));
  let x = -total / 2;
  words.forEach((w, i) => {
    const on = t >= w.t - 0.03 && (i === words.length - 1 || t < words[i + 1].t - 0.03);
    c.save(); c.translate(x + ws[i] / 2, 0); if (on) c.scale(1.08, 1.08);
    c.lineJoin = "round"; c.lineWidth = 10; c.strokeStyle = "#000"; c.shadowColor = "rgba(0,0,0,0.7)"; c.shadowOffsetY = 5;
    c.strokeText(w.text, 0, 0); c.shadowColor = "transparent";
    c.fillStyle = cap.opts.yellow_all || on ? YEL : "#fff"; c.fillText(w.text, 0, 0); c.restore();
    x += ws[i] + spc;
  });
  c.restore();
  if (cap.opts.emoji) {
    const e = win(t, cap.words[cap.words.length - 1].t, 0.22);
    if (e > 0) { c.save(); c.translate(cx, y - 100); c.rotate(Math.sin(t * 9) * 0.12); const s = eBack(e, 3); c.scale(s, s);
      font(c, 400, 78, EMOJI); c.textAlign = "center"; c.fillText(cap.opts.emoji, 0, 26); c.restore(); }
  }
}

window.renderAt = renderAt;
window.stageReady = (async () => {
  const faces = [`700 20px "Inter Tight"`, `800 20px "Inter Tight"`, `900 20px "Inter Tight"`, `600 20px "Inter Tight"`, `500 20px "Inter Tight"`,
    `italic 400 20px "Instrument Serif"`, `900 20px "Montserrat"`, `900 20px "Archivo Expanded"`, `700 20px "JetBrains Mono"`, `20px "Noto Color Emoji"`];
  await Promise.all(faces.map((f) => document.fonts.load(f, "AaVIBE😐✦")));
  await document.fonts.ready;
  return true;
})();
})();

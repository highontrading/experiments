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

// ------------------------------------------------------------------ frame
async function renderAt(fi) {
  const t = fi / fps, src = TL.frames[fi];
  const img = await loadImg(`${TL.frame_dir}/s${pad5(src)}.jpg`);
  const hg = headGeom(fi), isAfter = t >= TR;
  const depthOn = heroSpans.some((h) => t >= h.t0 && t <= h.t1 + 0.3);
  const needMask = isAfter && (depthOn || ["orbit", "rings", "wave"].some((k) => mgOf(k).some((m) => active(m, t))));
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
  const bg = c.createLinearGradient(0, CH * 0.6, 0, CH);
  bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(1, `rgba(0,0,0,${isAfter ? 0.4 : 0.22})`);
  c.fillStyle = bg; c.fillRect(0, CH * 0.6, CW, CH * 0.4);
  const caps = TL.captions.filter((cap) => cap.layout === "basic" ? (t >= cap.t0 && t < cap.t1 && t < TR) : (t >= cap.t0 - 0.1 && t <= cap.t1 + 0.05));
  for (const cap of caps) {
    if (cap.layout === "basic") basicCaption(c, cap, t);
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

  for (const cap of caps) if (cap.layout === "below") capBelow(cap, t);
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

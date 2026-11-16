// Shared engine for the AI & Advertising Meta ads. One canvas, renderAt(t).
// Each ad file (ads/aNN.js) sets window.AD = {w, h, dur, images:{name:path}, seqs:[names], music:{...}, sfx:[...], render(t)}.
"use strict";
const Q = new URLSearchParams(location.search);
const AD_ID = Q.get("ad");
let W, H, u, CX, CY, g, cv;
const IM = {}, SEQ = {};
const TLV = window.TL || { lines: [] };

// palette (from the course page)
const PRICE = "₹2,999";
const C = { ink: "#141414", cream: "#F1EFE6", grid: "#E3E0D6", lime: "#D8F5A2", pink: "#F6B8EA", lav: "#CDBCFF", sky: "#BFE1FB",
  yellow: "#FFD43B", sub: "#FFE14D", gold: "#E9B949", white: "#ffffff" };
const F = { inter: "Inter", serif: "'Instrument Serif'", mono: "'JetBrains Mono'", archivo: "'Archivo Black'", anton: "Anton",
  bebas: "'Bebas Neue'", pixel: "'Press Start 2P'", hand: "Caveat", grot: "'Space Grotesk'", pop: "Poppins", dms: "'DM Serif Display'", fraun: "Fraunces", syne: "Syne", play: "'Playfair Display'",
  cinzel: "Cinzel", comic: "Bangers", marker: "'Permanent Marker'", yatra: "'Yatra One'", corm: "'Cormorant Garamond'" };

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const oC = (k) => 1 - Math.pow(1 - k, 3), iC = (k) => k * k * k, oQ = (k) => 1 - Math.pow(1 - k, 5);
const ioC = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const oX = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const oB = (k, s = 1.7) => { const c3 = s + 1; return 1 + c3 * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const FR = (t) => Math.floor(t * 30 + 1e-6);
const win = (t, a, b) => t >= a && t < b;

// ---------- assets ----------
function load(name, src) { return new Promise((res) => { const i = new Image(); i.onload = res; i.onerror = () => { console.error("missing " + src); res(); }; i.src = src; IM[name] = i; }); }
function seq(name, t, t0, { speed = 1, loop = true, hold = false } = {}) {
  const s = SEQ[name]; if (!s) return null;
  let f = Math.floor((t - t0) * 30 * speed);
  if (loop) f = ((f % s.n) + s.n) % s.n; else f = clamp(f, 0, s.n - 1);
  return s.frames[f];
}
// ---------- drawing ----------
function bg(c) { g.fillStyle = c; g.fillRect(0, 0, W, H); }
function gridBg(base = C.cream, line = C.grid, step = 54) {
  bg(base); g.strokeStyle = line; g.lineWidth = Math.max(1, 1.2 * u); g.beginPath();
  const s = step * u;
  for (let x = CX % s; x < W; x += s) { g.moveTo(x, 0); g.lineTo(x, H); }
  for (let y = CY % s; y < H; y += s) { g.moveTo(0, y); g.lineTo(W, y); }
  g.stroke();
}
function cover(im, x, y, w, h, zoom = 1, ax = 0.5, ay = 0.5) {
  if (!im || !im.width) return;
  const s = Math.max(w / im.width, h / im.height) * zoom, iw = im.width * s, ih = im.height * s;
  g.drawImage(im, x + (w - iw) * ax, y + (h - ih) * ay, iw, ih);
}
function contain(im, x, y, w, h) {
  if (!im || !im.width) return; const s = Math.min(w / im.width, h / im.height), iw = im.width * s, ih = im.height * s;
  g.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function font(size, weight = 700, fam = F.inter, style = "") { g.font = `${style} ${weight} ${size}px ${fam}`; }
function tw(s) { return g.measureText(s).width; }
// text with options; returns width
function txt(s, x, y, o = {}) {
  font(o.size || 60 * u, o.weight ?? 700, o.fam || F.inter, o.style || "");
  g.save(); g.textAlign = o.align || "center"; g.textBaseline = o.base || "middle"; g.globalAlpha *= o.alpha ?? 1;
  if (o.ls) g.letterSpacing = `${o.ls}px`;
  if (o.shadow) { g.shadowColor = o.shadowColor || "rgba(0,0,0,0.6)"; g.shadowBlur = o.shadow * u; g.shadowOffsetY = (o.shadowY || 0) * u; }
  if (o.stroke) { g.lineJoin = "round"; g.strokeStyle = o.stroke; g.lineWidth = o.strokeW || 8 * u; g.strokeText(s, x, y); }
  g.fillStyle = o.color || "#fff"; g.fillText(s, x, y);
  const w = g.measureText(s).width; g.restore(); return w;
}
function fitSize(s, maxW, size, weight, fam) { font(size, weight, fam); const w = tw(s); return w > maxW ? size * maxW / w : size; }
function wrap(text, maxW) {
  const words = text.split(" "), lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (tw(t) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function grain(t, a = 0.07) {
  const c = GRAIN[FR(t) % GRAIN.length]; if (!c) return;
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = "overlay";
  const ox = rnd(FR(t)) * 256, oy = rnd(FR(t) + 7) * 256;
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) g.drawImage(c, x, y); g.restore();
}
const GRAIN = [];
function makeGrain() {
  for (let k = 0; k < 4; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"), d = x.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = rnd(i * 0.37 + k * 991) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); GRAIN.push(c);
  }
}
function vignette(a = 0.5) {
  const v = g.createRadialGradient(CX, CY, Math.min(W, H) * 0.3, CX, CY, Math.hypot(W, H) * 0.6);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function shade(y0, y1, a = 0.7, top = false) {  // gradient scrim for caption legibility
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(top ? 1 : 0, "rgba(0,0,0,0)"); gr.addColorStop(top ? 0 : 1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
}
function logo(x, y, h, color = "white", a = 1) {
  const im = IM[color === "white" ? "logo_white" : "logo_ink"]; if (!im) return; const w = h * im.width / im.height;
  g.save(); g.globalAlpha *= a; g.drawImage(im, x - w / 2, y - h / 2, w, h); g.restore();
}
// site-style neo-brutal button: fill, ink border, lavender offset shadow
function button(label, x, y, o = {}) {
  const size = o.size || 40 * u; font(size, 700, o.fam || F.mono); const w = tw(label) + size * 1.6, h = size * 2.1, r = o.r ?? 16 * u;
  const s = o.scale ?? 1; g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = o.shadow || C.lav; rr(-w / 2 + 8 * u, -h / 2 + 8 * u, w, h, r); g.fill();
  g.fillStyle = o.fill || C.lime; g.strokeStyle = o.border || C.ink; g.lineWidth = 3 * u; rr(-w / 2, -h / 2, w, h, r); g.fill(); g.stroke();
  g.fillStyle = o.color || C.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, 0, size * 0.04); g.restore();
  return w;
}

// ---------- captions ----------
// VO line words: TLV.lines[i].words [{w,s,e}]. chunk(i, n): split line into chunks of n words.
function chunksOf(li, n) { const w = TLV.lines[li].words; const out = []; for (let k = 0; k < w.length; k += n) out.push(w.slice(k, k + n)); return out; }
function activeChunk(t, chunks, until) {
  let c = null; for (const ch of chunks) if (t >= ch[0].s - 0.04) c = ch;
  if (!c) return null; if (until !== undefined && t >= until) return null; return c;
}
// all VO chunks across lines, each ends when the next starts (or line end + hold)
function voChunk(t, n = 3, hold = 0.6) {
  const all = []; TLV.lines.forEach((l, li) => chunksOf(li, n).forEach((c) => all.push(c)));
  for (let k = all.length - 1; k >= 0; k--) {
    const c = all[k]; if (t >= c[0].s - 0.04) {
      const nxt = all[k + 1]; const end = nxt ? nxt[0].s - 0.04 : c[c.length - 1].e + hold;
      return t < end ? c : null;
    }
  }
  return null;
}
// Style: TikTok pop. Words appear as spoken, active word in highlight colour, slight scale pop.
function capPop(t, words, y, o = {}) {
  if (!words) return; const size = o.size || 84 * u, maxW = W * 0.86, fam = o.fam || F.inter, wt = o.weight || 900;
  font(size, wt, fam); const up = (s) => (o.upper === false ? s : s.toUpperCase());
  const sp = size * 0.28; let rows = [[]], rw = 0;
  words.forEach((w) => { const ww = tw(up(w.w)); if (rw + ww > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push({ ...w, ww }); rw += ww + sp; });
  rows.forEach((row, ri) => {
    const total = row.reduce((a, b) => a + b.ww, 0) + sp * (row.length - 1); let x = CX - total / 2;
    const yy = y + (ri - (rows.length - 1) / 2) * size * 1.08;
    row.forEach((w) => {
      if (t >= w.s - 0.03) {
        const p = clamp((t - w.s + 0.03) / 0.12), sc = 1 + 0.18 * (1 - oC(p)) * (o.bounce ?? 1);
        const active = t < w.e + 0.05 && t >= w.s - 0.03;
        g.save(); g.translate(x + w.ww / 2, yy); g.scale(sc, sc);
        txt(up(w.w), 0, 0, { size, weight: wt, fam, color: active ? (o.hi || C.yellow) : (o.color || "#fff"), stroke: o.stroke ?? "#000", strokeW: (o.strokeW || 12) * u, shadow: o.shadow ?? 0 });
        g.restore();
      }
      x += w.ww + sp;
    });
  });
}
// Style: premium pill. White words on one dark rounded pill (same look over dark or light scenes), active word in accent.
function capPill(t, words, y, o = {}) {
  if (!words) return; const size = o.size || 62 * u, fam = o.fam || F.inter, wt = o.weight || 800, maxW = W * 0.8;
  font(size, wt, fam); const sp = size * 0.26, padX = size * 0.6, padY = size * 0.42;
  const rows = [[]]; let rw = 0;
  words.forEach((w) => { const ww = tw(w.w); if (rw + ww > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push({ ...w, ww }); rw += ww + sp; });
  const lh = size * 1.22, widest = Math.max(...rows.map((r) => r.reduce((a, b) => a + b.ww, 0) + sp * (r.length - 1)));
  const bw = widest + padX * 2, bh = rows.length * lh + padY * 2 - (lh - size), p0 = oC(clamp((t - words[0].s + 0.05) / 0.18));
  g.save(); g.globalAlpha = p0; g.fillStyle = o.bg || "rgba(16,16,16,0.86)"; rr(CX - bw / 2, y - bh / 2, bw, bh, Math.min(bh / 2, 40 * u)); g.fill(); g.restore();
  rows.forEach((row, ri) => {
    const total = row.reduce((a, b) => a + b.ww, 0) + sp * (row.length - 1); let x = CX - total / 2;
    const yy = y - (rows.length - 1) * lh / 2 + ri * lh;
    row.forEach((w) => { if (t >= w.s - 0.03) { const active = t < w.e + 0.05; txt(w.w, x + w.ww / 2, yy + 2 * u, { size, weight: wt, fam, color: active ? (o.hi || C.lime) : (o.color || "#fff"), alpha: oC(clamp((t - w.s + 0.03) / 0.12)) }); } x += w.ww + sp; });
  });
}
// Style: highlighter boxes behind each word (site look). Box wipes in on the word.
function capHighlight(t, words, y, o = {}) {
  if (!words) return; const size = o.size || 72 * u, fam = o.fam || F.inter, wt = o.weight || 800, maxW = W * 0.84;
  font(size, wt, fam); const pad = size * 0.16, sp = size * 0.22; const cols = o.cols || [C.lime, C.pink];
  let rows = [[]], rw = 0;
  words.forEach((w) => { const ww = tw(w.w); if (rw + ww > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push({ ...w, ww }); rw += ww + sp + pad * 2; });
  let k = 0;
  rows.forEach((row, ri) => {
    const total = row.reduce((a, b) => a + b.ww + pad * 2, 0) + sp * (row.length - 1); let x = CX - total / 2;
    const yy = y + (ri - (rows.length - 1) / 2) * size * 1.35;
    row.forEach((w) => {
      if (t >= w.s - 0.03) {
        const p = oC(clamp((t - w.s + 0.03) / 0.16));
        g.fillStyle = cols[k % cols.length]; g.strokeStyle = C.ink; g.lineWidth = 3 * u;
        rr(x, yy - size * 0.62, (w.ww + pad * 2) * p, size * 1.24, 8 * u); g.fill(); if (o.border !== false) g.stroke();
        if (p > 0.5) txt(w.w, x + pad + w.ww / 2, yy + size * 0.02, { size, weight: wt, fam, color: C.ink });
      }
      x += w.ww + pad * 2 + sp; k++;
    });
  });
}
// Style: cinema subtitle (yellow, lower third), whole chunk at once
function capSubtitle(t, words, y, o = {}) {
  if (!words) return; const size = o.size || 54 * u; const s = words.map((w) => w.w).join(" ");
  font(size, 700, o.fam || F.inter); const lines = wrap(s, W * 0.84);
  lines.forEach((ln, i) => txt(ln, CX, y + (i - (lines.length - 1) / 2) * size * 1.25, { size, weight: 700, fam: o.fam || F.inter, color: o.color || C.sub, shadow: 10, shadowColor: "rgba(0,0,0,0.95)", stroke: "rgba(0,0,0,0.85)", strokeW: 6 * u }));
}
// Style: clean fade-up, whole chunk, words fade in sequentially
function capClean(t, words, y, o = {}) {
  if (!words) return; const size = o.size || 64 * u, fam = o.fam || F.inter, wt = o.weight ?? 700;
  font(size, wt, fam, o.style || ""); const sp = size * 0.27; const ws = words.map((w) => tw(w.w));
  const lines = []; let cur = [], cw = 0;
  words.forEach((w, i) => { if (cw + ws[i] > W * 0.84 && cur.length) { lines.push(cur); cur = []; cw = 0; } cur.push(i); cw += ws[i] + sp; });
  if (cur.length) lines.push(cur);
  lines.forEach((ln, li) => {
    const total = ln.reduce((a, i) => a + ws[i], 0) + sp * (ln.length - 1); let x = CX - total / 2;
    const yy = y + (li - (lines.length - 1) / 2) * size * (o.lh || 1.18);
    ln.forEach((i) => {
      const w = words[i], p = oC(clamp((t - w.s + 0.03) / 0.25));
      if (p > 0) txt(w.w, x + ws[i] / 2, yy + (1 - p) * size * 0.3, { size, weight: wt, fam, style: o.style || "", color: o.color || "#fff", alpha: p, shadow: o.shadow ?? 0, shadowColor: o.shadowColor });
      x += ws[i] + sp;
    });
  });
}
// Style: big stacked block caps (each word its own line, fitted to width, slams in)
function capBlock(t, words, y, o = {}) {
  if (!words) return; const fam = o.fam || F.anton, maxW = W * (o.maxW || 0.88), base = o.size || 230 * u;
  const rows = words.map((w) => ({ ...w, s2: w.s, txt: (o.upper === false ? w.w : w.w.toUpperCase()), size: Math.min(base, fitSize(o.upper === false ? w.w : w.w.toUpperCase(), maxW, base, 400, fam)) }));
  const tot = rows.reduce((a, r) => a + r.size * 0.92, 0); let yy = y - tot / 2;
  rows.forEach((r, i) => {
    const h = r.size * 0.92; yy += h / 2;
    if (t >= r.s - 0.03) {
      const p = clamp((t - r.s + 0.03) / 0.14), sc = 1.25 - 0.25 * oC(p);
      g.save(); g.translate(CX, yy); g.scale(sc, sc);
      txt(r.txt, 0, 0, { size: r.size, weight: 400, fam, color: (o.hiIdx === i || (o.hiWord && r.w.includes(o.hiWord))) ? (o.hi || C.lime) : (o.color || "#fff"), alpha: clamp(p * 2), shadow: o.shadow ?? 0 });
      g.restore();
    }
    yy += h / 2;
  });
}
// Style: typewriter (character by character with caret) for a string between t0..t1
function typeText(t, s, x, y, t0, cps, o = {}) {
  const n = clamp(Math.floor((t - t0) * cps), 0, s.length); const shown = s.slice(0, n);
  const size = o.size || 40 * u; font(size, o.weight ?? 400, o.fam || F.mono);
  g.save(); g.textAlign = o.align || "left"; g.textBaseline = "middle"; g.fillStyle = o.color || "#fff";
  const lines = o.maxW ? wrapChars(shown, o.maxW) : [shown];
  lines.forEach((ln, i) => g.fillText(ln, x, y + i * size * (o.lh || 1.4)));
  const last = lines[lines.length - 1] || ""; const cx = x + (o.align === "center" ? tw(last) / 2 : tw(last));
  if (o.caret !== false && (FR(t) % 16 < 9 || n < s.length)) { g.fillStyle = o.caretColor || o.color || "#fff"; g.fillRect(cx + 4 * u, y + (lines.length - 1) * size * (o.lh || 1.4) - size * 0.55, size * 0.5, size * 1.05); }
  g.restore(); return n >= s.length;
}
function wrapChars(s, maxW) { const out = []; for (const para of s.split("\n")) { const l = wrap(para, maxW); out.push(...(l.length ? l : [""])); } return out; }


// ---------- round-2 helpers ----------
// timed list [[t0, t1, ...], ...] -> {e, a (fade alpha), p (intro progress 0..1), k (index)}
function tcap(t, list, fin = 0.3, fout = 0.25) {
  for (let k = 0; k < list.length; k++) { const e = list[k]; if (t >= e[0] && t < e[1]) return { e, k, p: clamp((t - e[0]) / fin), a: Math.min(oC(clamp((t - e[0]) / fin)), clamp((e[1] - t) / fout)) }; }
  return { e: null, k: -1, p: 0, a: 0 };
}
function cutIdx(t, starts) { let k = 0; for (let i = 0; i < starts.length; i++) if (t >= starts[i]) k = i; return k; }
// ken-burns cover
function kb(src, t, t0, dur, z0 = 1.04, z1 = 1.12, ax = 0.5, ay = 0.5, x = 0, y = 0, w = W, h = H) { cover(src, x, y, w, h, lerp(z0, z1, prog(t, t0, t0 + dur)), ax, ay); }
function flash(t, tc, d = 0.16, col = "255,255,255", a = 0.85) { const k = 1 - Math.abs(t - tc) / d; if (k > 0) { g.fillStyle = `rgba(${col},${k * a})`; g.fillRect(0, 0, W, H); } }
// multi-line caption block (static text), centered at y; o: size, fam, weight, style, color, lh, maxW, shadow, ls, rise
function capText(text, y, a, p, o = {}) {
  if (a <= 0) return; const size = o.size || 72 * u, fam = o.fam || F.inter, wt = o.weight ?? 700;
  font(size, wt, fam, o.style || ""); if (o.ls) g.letterSpacing = `${o.ls}px`; const lines = text.split("\n").flatMap((l) => wrap(l, o.maxW || W * 0.84)); g.letterSpacing = "0px";
  const lh = size * (o.lh || 1.15);
  lines.forEach((ln, i) => { const q = o.stagger ? oC(clamp(p * (1 + lines.length * 0.4) - i * 0.4)) : oC(p);
    txt(ln, o.x ?? CX, y + (i - (lines.length - 1) / 2) * lh + (1 - q) * (o.rise ?? 0.25) * size, { size, weight: wt, fam, style: o.style || "", color: o.color || "#fff", alpha: a * q, shadow: o.shadow ?? 0, shadowColor: o.shadowColor, ls: o.ls, align: o.align, stroke: o.stroke, strokeW: o.strokeW }); });
}
// circular magnifier: draws src (cover-fit to x,y,w,h) zoomed `z` around (fx,fy) fractions into a circle at (cx,cy) radius r
function loupe(src, x, y, w, h, fx, fy, cx, cy, r, z, o = {}) {
  if (!src || !src.width) return; const s = Math.max(w / src.width, h / src.height) * (o.base || 1), iw = src.width * s, ih = src.height * s, ix = x + (w - iw) / 2, iy = y + (h - ih) / 2;
  const px = ix + fx * iw, py = iy + fy * ih;
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); g.drawImage(src, cx - (px - ix) * z, cy - (py - iy) * z, iw * z, ih * z); g.restore();
  g.save(); g.strokeStyle = o.ring || "#fff"; g.lineWidth = (o.lw || 6) * u; g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 24 * u; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.restore();
  return { px, py };
}
// draw a frame of a seq or an image
function SRC(name, t, t0) { return SEQ[name] ? seq(name, t, t0) : IM[name]; }


// ---------- trailer kit (round 4) ----------
// Editorial caption segments: [text, style, sizeMul, color]. Styles mix a bold geometric sans with italic serif,
// like a magazine cover line ("Who am I trying to *impress?*").
const ED = { B: [800, "Poppins", ""], b: [600, "Poppins", ""], S: [400, "'DM Serif Display'", "italic"], s: [400, "'DM Serif Display'", ""],
  R: [600, "Fraunces", "italic"], M: [700, "'JetBrains Mono'", ""], H: [700, "Caveat", ""], Y: [800, "Syne", ""] };
const CREAM = "#F6EBC4";
function edCap(t, t0, t1, rows, o = {}) {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const base = o.size || 90 * u, x = o.x ?? 80 * u, align = o.align || "left", gap = o.gap ?? 0.18, out = clamp((t1 - t) / 0.25);
  const meas = rows.map((r) => r.map(([s, k, m]) => { const [w, f, st] = ED[k]; const sz = base * (m || 1); font(sz, w, f, st); return { w: tw(s) + (o.ls ? o.ls * s.length : 0), sz }; }));
  let y = o.y; const boxes = [];
  rows.forEach((r, ri) => { const lh = Math.max(...meas[ri].map((m) => m.sz)) * (o.lh || 1.02); y += ri ? lh : lh * 0.5;
    const sp = base * 0.22, tot = meas[ri].reduce((a, m) => a + m.w, 0) + sp * (r.length - 1); let xx = align === "left" ? x : align === "right" ? x - tot : x - tot / 2;
    r.forEach(([s, k, m, col], si) => { const [w, f, st] = ED[k], sz = meas[ri][si].sz, idx = ri * 3 + si, p = oC(clamp((t - t0 - idx * 0.07) / 0.45));
      g.save(); g.beginPath(); g.rect(xx - 20 * u, y - sz * 0.95, meas[ri][si].w + 40 * u, sz * 1.5); g.clip();
      txt(s, xx, y + (1 - p) * sz * 0.9 - (1 - out) * 20 * u, { size: sz, weight: w, fam: f, style: st, color: col || (k === "S" || k === "s" || k === "R" ? "#fff" : k === "M" ? "#fff" : CREAM), align: "left", alpha: out, shadow: o.shadow ?? 26, shadowColor: o.shadowColor || "rgba(0,0,0,0.45)", ls: o.ls });
      g.restore(); boxes.push({ x: xx, y, w: meas[ri][si].w, sz }); xx += meas[ri][si].w + sp; });
    y += Math.max(...meas[ri].map((m) => m.sz)) * 0.5 * (o.lh || 1.02) * 0; });
  return boxes;
}
// hand-drawn arrow from (x1,y1) to (x2,y2), drawn progressively (p 0..1)
function handArrow(x1, y1, x2, y2, p, col = CREAM, bend = 0.3, lw = 6) {
  if (p <= 0) return; const mx = (x1 + x2) / 2 + (y2 - y1) * bend, my = (y1 + y2) / 2 - (x2 - x1) * bend;
  g.save(); g.strokeStyle = col; g.lineWidth = lw * u; g.lineCap = "round"; g.shadowColor = "rgba(0,0,0,0.4)"; g.shadowBlur = 10 * u;
  const N = 40, n = Math.floor(N * clamp(p * 1.25)); g.beginPath();
  for (let i = 0; i <= n; i++) { const k = i / N, x = (1 - k) * (1 - k) * x1 + 2 * (1 - k) * k * mx + k * k * x2, y = (1 - k) * (1 - k) * y1 + 2 * (1 - k) * k * my + k * k * y2; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  if (p > 0.8) { const a = Math.atan2(y2 - my, x2 - mx), L = 26 * u * clamp((p - 0.8) / 0.2); g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - L * Math.cos(a - 0.5), y2 - L * Math.sin(a - 0.5)); g.moveTo(x2, y2); g.lineTo(x2 - L * Math.cos(a + 0.5), y2 - L * Math.sin(a + 0.5)); g.stroke(); }
  g.restore();
}
// shot list player: list [{s, d, ax, ay, z0, z1}], cut on the given times; returns {k, t0, sh}
function shotAt(t, list, T0 = 0) { let a = T0; for (let k = 0; k < list.length; k++) { if (t < a + list[k].d || k === list.length - 1) return { k, t0: a, sh: list[k] }; a += list[k].d; } }
function drawShot(t, list, T0 = 0, o = {}) {
  const { k, t0, sh } = shotAt(t, list, T0), im = seq(sh.s, t, t0); const lt = t - t0, punch = 1 + (o.punch ?? 0.05) * (1 - oC(clamp(lt / 0.35)));
  const z = lerp(sh.z0 ?? 1.0, sh.z1 ?? 1.06, clamp(lt / sh.d)) * punch;
  if (o.wide) { const fw = W, fh = W * 9 / 16, fy = o.fy ?? (CY - fh / 2); g.save(); g.beginPath(); g.rect(0, fy, fw, fh); g.clip(); cover(im, 0, fy, fw, fh, z, sh.ax ?? 0.5, sh.ay ?? 0.5); g.restore(); }
  else cover(im, 0, 0, W, H, z, sh.ax ?? 0.5, sh.ay ?? 0.5);
  if (lt < 0.07 && k > 0 && o.flash !== false) { g.fillStyle = `rgba(255,255,255,${0.35 * (1 - lt / 0.07)})`; g.fillRect(0, 0, W, H); }
  return { k, t0, sh };
}
function filmGrade(t, a = 0.06) { vignette(0.45); grain(t, a); }
// premium CTA button with tap animation; returns nothing
function joinButton(t, t0, x, y, label = "Join now", o = {}) {
  const p = oB(clamp((t - t0) / 0.4)); if (p <= 0) return; const tap = t0 + (o.tapAt ?? 1.0), tp = clamp((t - tap) / 0.25), press = tp > 0 && tp < 1 ? 0.94 : 1;
  const w = (o.w || 620) * u, h = (o.h || 140) * u; g.save(); g.translate(x, y); g.scale(p * press, p * press);
  const pulse = 1 + 0.03 * Math.sin((t - t0) * 6); g.scale(pulse, pulse);
  g.shadowColor = o.glow || "rgba(216,245,162,0.6)"; g.shadowBlur = 50 * u; g.fillStyle = o.fill || C.lime; rr(-w / 2, -h / 2, w, h, h / 2); g.fill(); g.shadowBlur = 0;
  txt(label + "  →", 0, 4 * u, { size: (o.size || 56) * u, weight: 800, fam: F.pop, color: o.color || C.ink }); g.restore();
  // ripple + pointer
  if (t >= tap) { const rp = clamp((t - tap) / 0.6); g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - rp)})`; g.lineWidth = 4 * u; g.beginPath(); g.arc(x + 120 * u, y + 20 * u, rp * 140 * u, 0, 7); g.stroke(); g.restore(); }
  const hx = lerp(x + 360 * u, x + 120 * u, oC(clamp((t - t0 - 0.4) / 0.5))), hy = lerp(y + 260 * u, y + 30 * u, oC(clamp((t - t0 - 0.4) / 0.5)));
  if (t >= t0 + 0.4) { g.save(); g.translate(hx, hy); g.rotate(-0.35); g.scale(tp > 0 && tp < 1 ? 0.9 : 1, tp > 0 && tp < 1 ? 0.9 : 1); g.fillStyle = "#fff"; g.strokeStyle = "#111"; g.lineWidth = 4 * u;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 70 * u); g.lineTo(18 * u, 54 * u); g.lineTo(32 * u, 84 * u); g.lineTo(44 * u, 78 * u); g.lineTo(30 * u, 48 * u); g.lineTo(54 * u, 48 * u); g.closePath(); g.fill(); g.stroke(); g.restore(); }
}


// ---------- Meta ad cutdown from a trailer ----------
// cfg: {hook:{s, rows, y, arrow?}, shots:[{s, d, rows, y, ax, ay}], cta:{s, rows, price, label, bullets}, tag}
function metaCut(cfg) {
  const H0 = cfg.hookD || 2.4, shots = [{ s: cfg.hook.s, d: H0, rows: cfg.hook.rows, y: cfg.hook.y, ax: cfg.hook.ax, ay: cfg.hook.ay, hook: true, arrow: cfg.hook.arrow }, ...cfg.shots];
  shots.forEach((s) => { s.z0 = s.z0 ?? 1.0; s.z1 = s.z1 ?? 1.07; });
  const T_CTA = shots.reduce((a, s) => a + s.d, 0), T_END = T_CTA + (cfg.ctaD || 4.6);
  return {
    w: 1080, h: 1920, dur: T_END + 3.4, slug: cfg.slug, seqs: [...new Set([...shots.map((s) => s.s), cfg.cta.s])],
    music: cfg.music, sfx: [...(cfg.sfx || []), ["whoosh", T_CTA - 0.15, -12], ["pop", T_CTA + 1.2, -10], ["ding", T_CTA + 2.3, -10], ["whoosh", T_END - 0.1, -12]],
    render(t) {
      if (t >= T_END) { endCard(t, T_END, { bg: "#0b0b0b", fg: "#fff", price: cfg.cta.price, accent: CREAM, titleFam: F.dms, titleStyle: "italic", cta: "Join now  →", sub: "The future of advertising · by Ideabro Studio" }); grain(t, 0.05); return; }
      bg("#000");
      if (t < T_CTA) {
        const { k, t0, sh } = drawShot(t, shots, 0, { punch: sh0(k0(t)) }); shade(0, H * 0.3, 0.5, true); shade(H * 0.6, H, 0.62);
        edCap(t, t0 + (sh.hook ? 0.15 : 0.08), t0 + sh.d - 0.05, sh.rows, { y: (sh.y || 1380) * u, x: 80 * u, size: (sh.hook ? 112 : 100) * u });
        if (sh.arrow) { const a = sh.arrow, p = clamp((t - t0 - 0.8) / 0.5); handArrow(a[0] * u, a[1] * u, a[2] * u, a[3] * u, p, CREAM, 0.3);
          if (p > 0.5) txt(a[4], a[0] * u - 120 * u, a[1] * u - 50 * u, { size: 66 * u, fam: F.hand, weight: 700, color: CREAM, align: "left", alpha: clamp((p - 0.5) * 3), shadow: 12 }); }
        // persistent top strip: the course, not just the clip
        g.fillStyle = "rgba(0,0,0,0.45)"; rr(70 * u, 196 * u, 330 * u, 58 * u, 29 * u); g.fill(); txt(cfg.tag || "AI IN ADVERTISING", 235 * u, 226 * u, { size: 22 * u, fam: F.mono, weight: 700, color: CREAM, ls: 2 });
        txt("MADE WITH AI", W - 80 * u, 226 * u, { size: 22 * u, fam: F.mono, weight: 700, color: "#fff", align: "right", alpha: 0.85, ls: 3, shadow: 8 });
        // progress bar toward the CTA
        g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(80 * u, 290 * u, W - 160 * u, 5 * u); g.fillStyle = CREAM; g.fillRect(80 * u, 290 * u, (W - 160 * u) * clamp(t / T_CTA), 5 * u);
      } else {
        const p = oC(prog(t, T_CTA, T_CTA + 0.5)); g.save(); g.filter = `blur(${10 * p}px) brightness(${1 - 0.55 * p})`; cover(seq(cfg.cta.s, t, T_CTA - 1), 0, 0, W, H, 1.1 + 0.05 * prog(t, T_CTA, T_END)); g.restore();
        edCap(t, T_CTA + 0.1, T_END, cfg.cta.rows, { y: 470 * u, x: 80 * u, size: 118 * u });
        (cfg.cta.bullets || []).forEach((b, i) => { const q = oC(prog(t, T_CTA + 0.6 + i * 0.15, T_CTA + 0.9 + i * 0.15)), y = (840 + i * 84) * u;
          g.save(); g.globalAlpha = q; g.fillStyle = "rgba(255,255,255,0.12)"; rr(80 * u, y - 34 * u, W - 160 * u, 68 * u, 34 * u); g.fill(); g.fillStyle = CREAM; g.beginPath(); g.arc(122 * u, y, 12 * u, 0, 7); g.fill();
          txt(b, 156 * u, y + 2 * u, { size: 36 * u, weight: 600, fam: F.pop, color: "#fff", align: "left" }); g.restore(); });
        if (cfg.cta.price) txt(`${PRICE} · one-time · lifetime access`, CX, 1240 * u, { size: 40 * u, weight: 600, fam: F.pop, color: CREAM, alpha: oC(prog(t, T_CTA + 1.0, T_CTA + 1.4)) });
        joinButton(t, T_CTA + 1.2, CX, 1400 * u, cfg.cta.label || "Join now", { fill: CREAM, glow: "rgba(246,235,196,0.55)" });
        txt("community.ideabrostudio.com", CX, 1560 * u, { size: 28 * u, fam: F.mono, color: "#fff", alpha: 0.75 * oC(prog(t, T_CTA + 1.6, T_CTA + 2.0)) });
      }
      filmGrade(t, 0.05);
    },
  };
}
function k0() { return 0; } function sh0() { return 0.05; }

// ---------- end card ----------
// theme: {bg, fg, accent, titleFam, titleStyle, button:{fill,color,shadow,border}, grid, sub}
function endCard(t, t0, th = {}) {
  const p = (d, dur = 0.4) => oC(clamp((t - t0 - d) / dur));
  if (th.bg !== false) { if (th.grid) gridBg(th.bg, th.grid); else bg(th.bg || "#000"); }
  const fg = th.fg || "#fff", P = H > W * 1.3;
  const ly = CY - (P ? 0.17 : 0.24) * H;
  logo(CX, ly - (1 - p(0)) * 20 * u, (P ? 150 : 120) * u, th.logo || (fg === "#fff" ? "white" : "ink"), p(0));
  const titleSize = (th.titleSize || (P ? 118 : 104)) * u;
  txt(th.title || "AI & Advertising", CX, CY - (P ? 0.04 : 0.07) * H + (1 - p(0.12)) * 24 * u, { size: titleSize, weight: th.titleWeight ?? 400, fam: th.titleFam || F.serif, style: th.titleStyle || "", color: fg, alpha: p(0.12) });
  txt(th.sub || "by Ideabro Studio", CX, CY + (P ? 0.015 : 0.02) * H, { size: 32 * u, weight: 400, fam: F.mono, color: th.subColor || fg, alpha: p(0.25) * 0.85 });
  // offer line: price only when the ad asks for it (th.price === true), otherwise the course facts
  const py = CY + (P ? 0.075 : 0.11) * H, pa = p(0.4);
  if (pa > 0) {
    g.save(); g.globalAlpha = pa;
    if (th.price) {
      font(60 * u, 800, F.inter); const a = PRICE, c = "  · one-time · lifetime access"; const wa = tw(a); font(32 * u, 500, F.inter); const wc = tw(c); const x0 = CX - (wa + wc) / 2;
      txt(a, x0 + wa / 2, py, { size: 60 * u, weight: 800, color: th.accent || fg });
      txt(c, x0 + wa + wc / 2, py + 6 * u, { size: 32 * u, weight: 500, color: fg, alpha: 0.8 });
    } else txt(th.facts || "11 modules  ·  41 lessons  ·  lifetime access", CX, py, { size: 34 * u, weight: 600, color: fg, alpha: 0.85 });
    g.restore();
  }
  const bp = clamp((t - t0 - 0.65) / 0.35);
  if (bp > 0) button(th.cta || "Enroll now  →", CX, CY + (P ? 0.15 : 0.23) * H, { scale: oB(bp), size: 40 * u, ...(th.button || {}) });
  txt(th.url || "community.ideabrostudio.com", CX, CY + (P ? 0.225 : 0.36) * H, { size: 28 * u, weight: 400, fam: F.mono, color: fg, alpha: p(0.9) * 0.7 });
}

// ---------- boot ----------
async function boot() {
  const A = window.AD; W = A.w; H = A.h; u = W / 1080; CX = W / 2; CY = H / 2;
  cv = document.getElementById("c"); cv.width = W; cv.height = H; g = cv.getContext("2d");
  makeGrain();
  const jobs = [load("logo_white", "assets/img/ib_logo_white.png"), load("logo_ink", "assets/img/ib_logo_ink.png")];
  for (const [n, p] of Object.entries(A.images || {})) jobs.push(load(n, p));
  for (const n of A.seqs || []) {
    const m = (window.ASSETS && ASSETS.seqs[n]); if (!m) { console.error("no seq " + n); continue; }
    SEQ[n] = { n: m.n, frames: [] };
    for (let f = 1; f <= m.n; f++) { const k = `${n}#${f}`; jobs.push(load(k, `build/${AD_ID}/seq/${n}/f${String(f).padStart(4, "0")}.jpg`).then(() => { SEQ[n].frames[f - 1] = IM[k]; })); }
  }
  await document.fonts.ready;
  await Promise.all([`900 40px Inter`, `800 40px Inter`, `700 40px Inter`, `600 40px Inter`, `500 40px Inter`, `500 40px 'Space Grotesk'`, `800 40px 'Space Grotesk'`, `600 40px Caveat`, `400 40px 'Instrument Serif'`, `italic 400 40px 'Instrument Serif'`, `400 40px 'JetBrains Mono'`, `700 40px 'JetBrains Mono'`,
    `400 40px 'Archivo Black'`, `400 40px Anton`, `400 40px 'Bebas Neue'`, `400 40px 'Press Start 2P'`, `700 40px Caveat`, `700 40px 'Space Grotesk'`, `700 40px 'Playfair Display'`, `italic 600 40px 'Playfair Display'`, `700 40px Cinzel`, `400 40px Bangers`, `400 40px 'Permanent Marker'`, `400 40px 'Yatra One'`, `italic 500 40px 'Cormorant Garamond'`, `600 40px Poppins`, `800 40px Poppins`, `400 40px 'DM Serif Display'`, `italic 400 40px 'DM Serif Display'`, `italic 600 40px Fraunces`, `800 40px Syne`].map((f) => document.fonts.load(f)));
  await Promise.all(jobs);
  if (A.init) A.init();
  return true;
}
window.stageReady = new Promise((res) => window.addEventListener("load", () => boot().then(res)));
window.renderAt = function (t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none"; g.shadowBlur = 0; g.letterSpacing = "0px";
  window.AD.render(t);
};

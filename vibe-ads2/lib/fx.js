// Motion toolkit for the second set of ads: camera moves, transitions (warp, RGB split,
// glitch, flash, focus pull, cloud wipe, scissor split), kinetic type, counters, scribbles,
// stickers, editor windows, cursors, extruded titles and the five design-system backgrounds.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, outBack, apple, spring, rnd, rr, IMG, cover } = U;
const deg = (d) => d * Math.PI / 180;
const T = window.T;
const VO = Object.fromEntries(T.voices.map((v) => [v.id, v]));
// global time of a voice line's n-th word
const W_ = (id, n = 0, off = 0) => VO[id].at + VO[id].words[Math.min(n, VO[id].words.length - 1)] + off;
const END = (id) => VO[id].at + VO[id].dur;

const F2 = {
  bodoni: (px) => `800 ${px}px Playfair`, bodoniI: (px) => `italic 500 ${px}px PlayfairI`, didone: (px) => `800 ${px}px BodoniModa`, playI: (px) => `italic 500 ${px}px PlayfairI`,
  pixel: (px) => `700 ${px}px Silkscreen`, black: (px) => `400 ${px}px ArchivoBlack`,
};

// ---------------------------------------------------------------- camera --
// slow push / drift inside a shot, plus an optional punch on a beat
function cam(c, t, o = {}) {
  const d = o.dur || 4, k = clamp(t / d);
  const z = lerp(o.z0 ?? 1, o.z1 ?? 1.08, o.ease === false ? k : inOut(k)) * (1 + (o.punch ? 0.06 * Math.exp(-Math.max(0, t - o.punch) * 8) * (t > o.punch ? 1 : 0) : 0));
  const x = lerp(o.x0 || 0, o.x1 || 0, inOut(k)), y = lerp(o.y0 || 0, o.y1 || 0, inOut(k));
  c.translate(W / 2 + x, H / 2 + y); c.scale(z, z); c.rotate(deg(lerp(o.r0 || 0, o.r1 || 0, k))); c.translate(-W / 2, -H / 2);
}
function shake(c, t, t0, amt = 18, decay = 9) {
  if (t < t0) return;
  const a = amt * Math.exp(-(t - t0) * decay), r = rnd(Math.floor(t * 60));
  c.translate((r() - 0.5) * a, (r() - 0.5) * a);
}

// ----------------------------------------------------------- transitions --
const tmp = () => { const k = document.createElement("canvas"); k.width = W; k.height = H; return k; };
const T1 = tmp(), T2 = tmp(), T3 = tmp();
// draw a layer with its red and cyan channels pulled apart by dx
function rgbSplit(c, L, dx, dy = 0) {
  if (Math.abs(dx) < 0.5) { c.drawImage(L, 0, 0); return; }
  const r = T2.getContext("2d"), b = T3.getContext("2d");
  for (const [x, col] of [[r, "#ff0000"], [b, "#00ffff"]]) {
    x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, W, H); x.drawImage(L, 0, 0);
    x.globalCompositeOperation = "multiply"; x.fillStyle = col; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "destination-in"; x.drawImage(L, 0, 0);
  }
  c.save(); c.fillStyle = "#000"; c.fillRect(0, 0, W, H); c.globalCompositeOperation = "lighter";
  c.drawImage(T2, -dx, -dy); c.drawImage(T3, dx, dy); c.restore();
}
// radial zoom blur: several scaled copies
function zoomBlur(c, L, s, amt, fx = W / 2, fy = H / 2) {
  const n = 6;
  c.save(); c.translate(fx, fy);
  for (let i = 0; i < n; i++) {
    const k = s * (1 + amt * i / n);
    c.globalAlpha = i === 0 ? 1 : 0.32;
    c.save(); c.scale(k, k); c.drawImage(L, -fx, -fy); c.restore();
  }
  c.restore();
}
function glitchSlices(c, L, amt, seed) {
  const r = rnd(seed);
  c.drawImage(L, 0, 0);
  for (let i = 0; i < 9; i++) {
    const y = r() * H, h = 20 + r() * 140, dx = (r() - 0.5) * amt;
    c.drawImage(L, 0, y, W, h, dx, y, W, h);
  }
}
// clouds made from the real sky footage, sweeping across as a wipe
function cloudFog(c, p, gt) {
  const im = U.clipFrame("sky", (gt * 0.5) % 10);
  c.save(); c.globalAlpha = Math.sin(Math.PI * p);
  c.filter = "grayscale(1) brightness(1.7) contrast(1.4) blur(6px)";
  if (im) { const s = 2.6; c.drawImage(im, lerp(-W * 1.2, 0, p) - W * 0.2, -H * 0.3, W * s, H * s * 0.75); }
  c.filter = "none"; c.globalAlpha = Math.pow(Math.sin(Math.PI * p), 4) * 0.55; c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
  c.restore();
}
// composite: A = outgoing layer, B = incoming layer, e = 0..1 through the transition
function transition(c, type, A, B, e, o = {}, gt = 0) {
  const p = inOut(e);
  switch (type) {
    case "flash": {
      c.drawImage(e < 0.5 ? A : B, 0, 0);
      c.save(); c.globalAlpha = 1 - Math.abs(e - 0.5) * 2; c.fillStyle = o.color || "#fff"; c.fillRect(0, 0, W, H); c.restore(); break;
    }
    case "warp": {                                   // zoom-blur into the cut with an RGB split
      const L = e < 0.5 ? A : B, k = e < 0.5 ? e * 2 : (1 - e) * 2;
      const x = T1.getContext("2d"); x.clearRect(0, 0, W, H);
      zoomBlur(x, L, e < 0.5 ? 1 + k * 0.9 : 1 + k * 0.6, k * 0.35, o.fx ?? W / 2, o.fy ?? H / 2);
      rgbSplit(c, T1, k * 34); break;
    }
    case "glitch": {
      const L = e < 0.5 ? A : B, k = 1 - Math.abs(e - 0.5) * 2;
      const x = T1.getContext("2d"); x.clearRect(0, 0, W, H); glitchSlices(x, L, k * 160, Math.floor(gt * 30));
      rgbSplit(c, T1, k * 22); break;
    }
    case "invert": {                                 // the cyan negative flash of the crimson reference
      c.drawImage(e < 0.5 ? A : B, 0, 0);
      const k = 1 - Math.abs(e - 0.5) * 2;
      if (k > 0.45) { c.save(); c.filter = "invert(1) hue-rotate(180deg) saturate(.6) brightness(1.1)"; c.drawImage(e < 0.5 ? A : B, 0, 0); c.restore(); }
      break;
    }
    case "blur": {                                   // focus pull
      c.save(); c.filter = `blur(${p * 26}px)`; c.globalAlpha = 1; c.drawImage(A, 0, 0); c.restore();
      c.save(); c.filter = `blur(${(1 - p) * 26}px)`; c.globalAlpha = p; c.drawImage(B, 0, 0); c.restore(); break;
    }
    case "cloud": c.drawImage(e < 0.5 ? A : B, 0, 0); cloudFog(c, e, gt); break;
    case "split": {                                  // a scissor cut: A splits along a diagonal and slides apart
      c.drawImage(B, 0, 0);
      const d = p * 900;
      for (const s of [-1, 1]) {
        c.save(); c.beginPath();
        if (s < 0) { c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, H * 0.35); c.lineTo(0, H * 0.65); }
        else { c.moveTo(0, H * 0.65); c.lineTo(W, H * 0.35); c.lineTo(W, H); c.lineTo(0, H); }
        c.closePath(); c.clip(); c.translate(s * d * 0.5, s * d); c.rotate(deg(s * p * 6)); c.drawImage(A, 0, 0); c.restore();
      }
      if (e < 0.25) { c.save(); c.strokeStyle = "#fff"; c.lineWidth = 8; c.globalAlpha = 1 - e * 4; c.beginPath(); c.moveTo(0, H * 0.65); c.lineTo(W * e * 4, H * (0.65 - 0.3 * e * 4)); c.stroke(); c.restore(); }
      break;
    }
    case "slide": case "whip": {
      const dir = o.dir || 1, bl = type === "whip" ? Math.sin(Math.PI * p) * 30 : 0;
      c.save(); if (bl) c.filter = `blur(${bl}px)`;
      const vert = o.vertical;
      c.drawImage(A, vert ? 0 : -dir * W * p, vert ? -dir * H * p : 0); c.drawImage(B, vert ? 0 : dir * W * (1 - p), vert ? dir * H * (1 - p) : 0); c.restore(); break;
    }
    case "zoom": {                                   // push into a point of A, B grows out of it
      const fx = o.fx ?? W / 2, fy = o.fy ?? H / 2;
      c.save(); c.translate(fx, fy); const sa = Math.exp(p * 2.2); c.scale(sa, sa); c.translate(-fx, -fy); c.globalAlpha = 1 - ss(0.5, 1, p); c.drawImage(A, 0, 0); c.restore();
      c.save(); c.globalAlpha = ss(0.35, 0.8, p); c.translate(W / 2, H / 2); const sb = lerp(0.7, 1, p); c.scale(sb, sb); c.translate(-W / 2, -H / 2); c.drawImage(B, 0, 0); c.restore(); break;
    }
    default: c.drawImage(e < 0.5 ? A : B, 0, 0);
  }
}

// ------------------------------------------------------------ type kinetics --
// words appearing one by one on their spoken times; layout: lines of [word, at] pairs
function kinetic(c, lines, t, o = {}) {
  const font = o.font, lh = o.lh || 100;
  c.save(); c.font = font; c.textBaseline = "alphabetic";
  lines.forEach((ln, li) => {
    const sp = c.measureText(" ").width;
    const ws = ln.map(([s]) => c.measureText(s).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ln.length - 1);
    let x = o.align === "left" ? (o.x || 80) : (o.x ?? W / 2) - tot / 2;
    const y = (o.y ?? H / 2) + li * lh;
    ln.forEach(([s, at, col], i) => {
      const e = o.style === "type" ? (t >= at ? 1 : 0) : spring(t, at - 0.02, 0.45);
      if (e > 0) {
        c.save(); c.globalAlpha = clamp(e * 2.5);
        const dy = o.style === "rise" ? (1 - clamp(e)) * 40 : 0, blur = o.style === "blur" ? (1 - clamp(e)) * 14 : 0;
        if (blur > 0.3) c.filter = `blur(${blur}px)`;
        c.fillStyle = col || o.color || "#111";
        if (o.stroke) { c.lineJoin = "round"; c.lineWidth = o.strokeW || 10; c.strokeStyle = o.stroke; c.strokeText(s, x, y + dy); }
        if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = 18; c.shadowOffsetY = 6; }
        const sc = o.style === "pop" ? 0.6 + 0.4 * e : 1;
        c.translate(x + ws[i] / 2, y + dy); c.scale(sc, sc); c.fillText(s, -ws[i] / 2, 0);
        c.restore();
      }
      x += ws[i] + sp;
    });
  });
  c.restore();
}
// an odometer: digits roll as v changes
function odometer(c, v, x, y, font, o = {}) {
  const digits = o.digits || String(Math.floor(o.max || v)).length;
  c.save(); c.font = font; c.textBaseline = "middle"; c.textAlign = "center";
  const dw = Math.max(..."0123456789".split("").map((d) => c.measureText(d).width)) * (o.spacing || 1.04), h = parseInt(font.match(/(\d+)px/)[1]) * 1.1;
  const startX = x - (digits * dw) / 2 + dw / 2;
  for (let i = 0; i < digits; i++) {
    const place = Math.pow(10, digits - 1 - i), dv = v / place;
    const d = Math.floor(dv) % 10, frac = clamp((v % place) - (place - 1));   // a digit only turns while the ones below roll over
    const cx = startX + i * dw;
    c.save(); c.beginPath(); c.rect(cx - dw / 2, y - h / 2, dw, h); c.clip();
    if (o.cell) { c.fillStyle = o.cell; c.fillRect(cx - dw / 2 + 4, y - h / 2, dw - 8, h); }
    c.fillStyle = o.color || "#fff";
    c.fillText(String(d), cx, y - frac * h); c.fillText(String((d + 1) % 10), cx, y + h - frac * h);
    c.restore();
  }
  c.restore();
}
// hand-drawn strokes: circle, underline, cross, arrow — drawn on with progress p
function scribble(c, kind, x, y, w, h, p, o = {}) {
  if (p <= 0) return;
  const r = rnd(o.seed || 3);
  c.save(); c.strokeStyle = o.color || "#e2312f"; c.lineWidth = o.lw || 8; c.lineCap = c.lineJoin = "round";
  c.beginPath();
  const N = 60, pts = [];
  if (kind === "circle") for (let i = 0; i <= N; i++) { const a = -0.4 + (i / N) * Math.PI * 2.15; pts.push([x + Math.cos(a) * w / 2 * (1 + (r() - 0.5) * 0.05), y + Math.sin(a) * h / 2 * (1 + (r() - 0.5) * 0.05)]); }
  else if (kind === "underline") for (let i = 0; i <= N; i++) { const u = i / N; pts.push([x - w / 2 + w * u, y + Math.sin(u * 7) * 5 + (r() - 0.5) * 3]); }
  else if (kind === "cross") { for (let i = 0; i <= N / 2; i++) { const u = i / (N / 2); pts.push([x - w / 2 + w * u, y - h / 2 + h * u]); } pts.push(null); for (let i = 0; i <= N / 2; i++) { const u = i / (N / 2); pts.push([x + w / 2 - w * u, y - h / 2 + h * u]); } }
  const n = Math.floor(pts.length * clamp(p));
  let pen = false;
  for (let i = 0; i < n; i++) { const q = pts[i]; if (!q) { pen = false; continue; } pen ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); pen = true; }
  c.stroke(); c.restore();
}
function arrow(c, x1, y1, x2, y2, p, o = {}) {
  if (p <= 0) return;
  const mx = (x1 + x2) / 2 + (o.bend ?? 80), my = (y1 + y2) / 2 - (o.bendY ?? 0);
  const pt = (u) => [(1 - u) * (1 - u) * x1 + 2 * u * (1 - u) * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * my + u * u * y2];
  c.save(); c.strokeStyle = o.color || "#fff"; c.lineWidth = o.lw || 9; c.lineCap = c.lineJoin = "round";
  if (o.shadow !== false) { c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 10; c.shadowOffsetY = 4; }
  c.beginPath(); for (let i = 0; i <= 30 * clamp(p); i++) { const [x, y] = pt(i / 30); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  if (p >= 1) { const [ax, ay] = pt(1), [bx, by] = pt(0.92), a = Math.atan2(ay - by, ax - bx);
    c.beginPath(); c.moveTo(ax - Math.cos(a - 0.5) * 34, ay - Math.sin(a - 0.5) * 34); c.lineTo(ax, ay); c.lineTo(ax - Math.cos(a + 0.5) * 34, ay - Math.sin(a + 0.5) * 34); c.stroke(); }
  c.restore();
}
// a torn paper sticker (R3's "Vitamin-B", R5's "Free Entry")
function sticker(c, s, x, y, font, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.s ?? 1, o.s ?? 1); c.globalAlpha *= o.alpha ?? 1;
  c.font = font; const w = c.measureText(s).width + (o.pad ?? 56), h = o.h || 110, r = rnd(o.seed || s.length * 7);
  c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 18; c.shadowOffsetY = 10;
  c.fillStyle = o.bg || "#f6e04b"; c.beginPath(); c.moveTo(-w / 2, -h / 2);
  for (let xx = -w / 2; xx <= w / 2; xx += 14) c.lineTo(xx, -h / 2 + (r() - 0.5) * 8);
  for (let yy = -h / 2; yy <= h / 2; yy += 12) c.lineTo(w / 2 + (r() - 0.5) * 10, yy);
  for (let xx = w / 2; xx >= -w / 2; xx -= 14) c.lineTo(xx, h / 2 + (r() - 0.5) * 8);
  for (let yy = h / 2; yy >= -h / 2; yy -= 12) c.lineTo(-w / 2 + (r() - 0.5) * 10, yy);
  c.closePath(); c.fill(); c.shadowColor = "transparent";
  if (o.tape) { c.fillStyle = "rgba(240,240,230,.75)"; c.save(); c.rotate(deg(-8)); c.fillRect(-60, -h / 2 - 22, 120, 40); c.restore(); }
  c.fillStyle = o.fg || "#111"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, o.dy ?? 5);
  c.restore();
}
// a heavy extruded title (R3 / R5): stacked darker copies give it depth
function extruded(c, s, x, y, font, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.s ?? 1, o.s ?? 1); c.globalAlpha *= o.alpha ?? 1;
  c.font = font; c.textAlign = o.align || "center"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
  const depth = o.depth ?? 14;
  for (let i = depth; i > 0; i--) { c.fillStyle = o.side || "#7a5b00"; c.fillText(s, i * 0.6, i); }
  if (o.stroke) { c.lineWidth = o.strokeW || 8; c.strokeStyle = o.stroke; c.strokeText(s, 0, 0); }
  const g = c.createLinearGradient(0, -80, 0, 20); g.addColorStop(0, o.top || "#fff27a"); g.addColorStop(1, o.bot || "#f2c41c");
  c.fillStyle = o.flat || g; c.fillText(s, 0, 0);
  c.restore();
}
// grungy block title with a dark shadow (R1's "CLOUDS", "FLARE EFFECT")
function grungeTitle(c, s, x, y, px, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.s ?? 1, o.s ?? 1); c.globalAlpha *= o.alpha ?? 1;
  c.font = U.F.title(px, 900); c.textAlign = "center"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
  c.fillStyle = "rgba(0,0,0,.6)"; c.fillText(s, 6, 8);
  c.lineWidth = px * 0.1; c.strokeStyle = o.stroke || "#2a2a1e"; c.strokeText(s, 0, 0);
  c.fillStyle = o.color || "#f4e04d"; c.fillText(s, 0, 0);
  const r = rnd(px + s.length); c.globalCompositeOperation = "destination-out"; c.fillStyle = "rgba(0,0,0,.5)";
  const tw = c.measureText(s).width;
  for (let i = 0; i < 90; i++) c.fillRect((r() - 0.5) * tw, -r() * px * 0.9, 2 + r() * 8, 1 + r() * 3);
  c.restore();
}
// an editor window with a white sketchy outline (R1)
function uiWindow(c, x, y, w, h, rot, body, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(o.s ?? 1, o.s ?? 1); c.globalAlpha *= o.alpha ?? 1;
  c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 40; c.shadowOffsetY = 20;
  c.fillStyle = o.bg || "#232428"; rr(c, -w / 2, -h / 2, w, h, o.r ?? 16); c.fill(); c.shadowColor = "transparent";
  c.save(); rr(c, -w / 2, -h / 2, w, h, o.r ?? 16); c.clip(); c.translate(-w / 2, -h / 2); body && body(c, w, h); c.restore();
  if (o.sketch !== false) {
    const r = rnd(w + h); c.strokeStyle = "rgba(255,255,255,.92)"; c.lineWidth = 5;
    for (let k = 0; k < 2; k++) { c.beginPath(); c.roundRect(-w / 2 - 8 + (r() - 0.5) * 6, -h / 2 - 8 + (r() - 0.5) * 6, w + 16, h + 16, (o.r ?? 16) + 8); c.stroke(); }
  }
  c.restore();
}
// a pushpin, like the ones holding the windows down in R1
function pin(c, x, y, s = 1, col = "#e23b3b") {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(deg(-25));
  c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 10; c.shadowOffsetX = 8; c.shadowOffsetY = 8;
  c.fillStyle = "#bbb"; c.fillRect(-2, 0, 4, 34);
  const g = c.createRadialGradient(-6, -8, 2, 0, 0, 26); g.addColorStop(0, "#fff"); g.addColorStop(0.3, col); g.addColorStop(1, "#5a0d0d");
  c.fillStyle = g; c.beginPath(); c.ellipse(0, -6, 22, 16, 0, 0, 7); c.fill(); c.fillRect(-10, -6, 20, 14);
  c.restore();
}
// a macOS-style cursor with an optional name tag (R2's "You", "Claude")
function cursor(c, x, y, label, col = "#2b6cff", s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 6; c.shadowOffsetY = 3;
  c.fillStyle = col; c.strokeStyle = "#fff"; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 40); c.lineTo(11, 30); c.lineTo(19, 46); c.lineTo(26, 42); c.lineTo(18, 27); c.lineTo(32, 27); c.closePath(); c.fill(); c.stroke();
  if (label) { c.shadowColor = "transparent"; c.font = U.F.ui(26, 700); const w = c.measureText(label).width + 26;
    c.fillStyle = col; rr(c, 22, 44, w, 40, 20); c.fill(); c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(label, 35, 65); }
  c.restore();
}
function spinner(c, x, y, r, t, col = "#e0663a", lw = 10) {
  c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round";
  const a = t * 7; c.beginPath(); c.arc(x, y, r, a, a + Math.PI * 1.2); c.stroke(); c.restore();
}
function rays(c, x, y, len, a0, a1, col, alpha = 0.35) {
  c.save(); c.globalCompositeOperation = "screen"; c.globalAlpha = alpha;
  const g = c.createRadialGradient(x, y, 10, x, y, len); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.arc(x, y, len, a0, a1); c.closePath(); c.fill(); c.restore();
}

// ------------------------------------------------------------ backgrounds --
const BG = {};
function cached(key, draw) { if (!BG[key]) { const k = tmp(); draw(k.getContext("2d")); BG[key] = k; } return BG[key]; }
function noise(x, a = 0.08, seed = 1) {
  const r = rnd(seed), d = x.getImageData(0, 0, W, H), D = d.data;
  for (let i = 0; i < D.length; i += 4) { const n = (r() - 0.5) * 255 * a; D[i] += n; D[i + 1] += n; D[i + 2] += n; }
  x.putImageData(d, 0, 0);
}
const bgCrimson = (c) => c.drawImage(cached("crimson", (x) => {
  const g = x.createRadialGradient(W / 2, H * 0.42, 80, W / 2, H / 2, H * 0.75); g.addColorStop(0, "#7a1622"); g.addColorStop(0.55, "#4a0c14"); g.addColorStop(1, "#140306");
  x.fillStyle = g; x.fillRect(0, 0, W, H); noise(x, 0.07, 4);
  const r = rnd(9); x.fillStyle = "rgba(255,220,210,.12)"; for (let i = 0; i < 260; i++) x.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
}), 0, 0);
const bgMat = (c) => c.drawImage(cached("mat", (x) => {
  x.fillStyle = "#2f8a52"; x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(200,255,215,.28)"; x.lineWidth = 2;
  for (let gx = 0; gx <= W; gx += 54) { x.lineWidth = gx % 270 === 0 ? 3 : 1.4; x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
  for (let gy = 0; gy <= H; gy += 54) { x.lineWidth = gy % 270 === 0 ? 3 : 1.4; x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
  x.fillStyle = "rgba(220,255,230,.5)"; for (let gx = 0; gx <= W; gx += 27) x.fillRect(gx, 0, 2, gx % 54 ? 12 : 22);
  noise(x, 0.06, 2);
  const v = x.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.72); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.62)");
  x.fillStyle = v; x.fillRect(0, 0, W, H);
}), 0, 0);
const bgWhite = (c, gridA = 0.06) => c.drawImage(cached("white" + gridA, (x) => {
  x.fillStyle = "#f6f6f4"; x.fillRect(0, 0, W, H);
  x.strokeStyle = `rgba(0,0,0,${gridA})`; x.lineWidth = 1.5;
  for (let gx = 0; gx <= W; gx += 90) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
  for (let gy = 0; gy <= H; gy += 90) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
  const v = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.07)");
  x.fillStyle = v; x.fillRect(0, 0, W, H);
}), 0, 0);
// woven fabric cards for the cinematic serif lines (R3's navy plaid and red cloth)
const bgFabric = (c, col = "navy") => c.drawImage(cached("fab" + col, (x) => {
  const base = col === "navy" ? ["#0f1f4a", "#1d3170"] : ["#5a1010", "#8a1e1c"];
  const g = x.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, H * 0.7); g.addColorStop(0, base[1]); g.addColorStop(1, base[0]);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalAlpha = 0.18; x.strokeStyle = col === "navy" ? "#8fb0ff" : "#ff9a8a";
  for (let i = 0; i < W; i += 6) { x.lineWidth = i % 72 < 6 ? 3 : 1; x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let j = 0; j < H; j += 6) { x.lineWidth = j % 72 < 6 ? 3 : 1; x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
  x.globalAlpha = 1; noise(x, 0.12, 6);
  const v = x.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.6)");
  x.fillStyle = v; x.fillRect(0, 0, W, H);
}), 0, 0);
const bgGraph = (c, tone = "#e9e9e6") => c.drawImage(cached("graph" + tone, (x) => {
  x.fillStyle = tone; x.fillRect(0, 0, W, H);
  if (IMG.paper_white) { x.save(); x.globalAlpha = 0.35; x.filter = "grayscale(1) contrast(.6) brightness(1.2)"; cover(x, IMG.paper_white, 0, 0, W, H); x.restore(); }
  x.strokeStyle = "rgba(60,70,90,.2)"; x.lineWidth = 1.5;
  for (let gx = 0; gx <= W; gx += 60) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
  for (let gy = 0; gy <= H; gy += 60) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
  const v = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.25)");
  x.fillStyle = v; x.fillRect(0, 0, W, H);
}), 0, 0);
// dark spotlit room for the cinematic shots
const bgRoom = (c, warm = "#f2c27a") => {
  c.drawImage(cached("room", (x) => {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0d0f14"); g.addColorStop(0.65, "#1a1c22"); g.addColorStop(1, "#070709");
    x.fillStyle = g; x.fillRect(0, 0, W, H); noise(x, 0.06, 8);
  }), 0, 0);
  rays(c, W / 2, -40, H * 0.95, deg(62), deg(118), warm, 0.5);
};

window.FX2 = { deg, W_, END, VO, F2, cam, shake, rgbSplit, zoomBlur, glitchSlices, cloudFog, transition, kinetic, odometer, scribble, arrow,
  sticker, extruded, grungeTitle, uiWindow, pin, cursor, spinner, rays, cached, bgCrimson, bgMat, bgWhite, bgFabric, bgGraph, bgRoom };
})();

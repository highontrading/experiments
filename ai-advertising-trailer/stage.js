// AI in Advertising: trailer. The whole film is renderAt(t) on one canvas.
// Size comes from the URL: stage.html?w=1920&h=1080 (16:9) or ?w=1080&h=1920 (9:16).
// Every time comes from build/timeline.json (window.TL), written by timeline.py.
"use strict";
const Q = new URLSearchParams(location.search);
const W = +(Q.get("w") || 1920), H = +(Q.get("h") || 1080);
const PORT = H > W, S = Math.min(W, H), u = S / 1080, CX = W / 2, CY = H / 2;
const cv = document.getElementById("c"); cv.width = W; cv.height = H;
const g = cv.getContext("2d");
const { T, EV, L, proof: PROOF } = TL;

const INK = "#141414", CREAM = "#F1EFE6", GRIDC = "#E3E0D6", LIME = "#D8F5A2", PINK = "#F6B8EA", LAV = "#CDBCFF";
const F_CAP = "Inter", F_SERIF = "'Instrument Serif'", F_MONO = "'JetBrains Mono'";

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const oC = (k) => 1 - Math.pow(1 - k, 3), iC = (k) => k * k * k;
const ioC = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const oX = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const oB = (k) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function rnd(seed) { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const FR = (t) => Math.floor(t * TL.fps + 1e-6);

// ---------- assets ----------
const IM = {};
function load(name, src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(); i.onerror = () => { console.error("missing " + src); res(); }; i.src = src; IM[name] = i; }); }
const jobs = [];
for (let i = 0; i < ASSETS.hook; i++) jobs.push(load("h" + i, `assets/img/hook/h${String(i).padStart(2, "0")}.jpg`));
for (const n of ["print_a", "print_b", "radio", "tv", "ow_cinecam", "ow_clapper", "ow_tripod", "ow_photog", "ow_polaroid", "ow_lens", "ow_shooter",
  "shoe_product", "shoe_1", "shoe_2", "shoe_3", "shoe_4", "shoe_5", "juice_1", "juice_2", "juice_3", "look_1", "look_2", "look_3"])
  jobs.push(load(n, `assets/img/${n}.jpg`));
jobs.push(load("logo", "assets/img/ib_logo_white.png"));
for (const n of ["openai", "claude", "googlegemini", "elevenlabs", "suno"]) jobs.push(load("svg_" + n, `build/src/logos/${n}.svg`));
for (const [id, m] of Object.entries(ASSETS.clips)) for (let f = 1; f <= m.n; f++) jobs.push(load(`${id}_${f}`, `build/clips/${id}/f${String(f).padStart(4, "0")}.jpg`));

// white-on-transparent and tinted versions of the svg glyphs
const GLYPH = {};
function tint(img, color) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  x.drawImage(img, 0, 0, 256, 256); x.globalCompositeOperation = "source-in"; x.fillStyle = color; x.fillRect(0, 0, 256, 256); return c;
}
// film grain tiles
const GRAIN = [];
function makeGrain() {
  for (let k = 0; k < 4; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); const d = x.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = rnd(i * 0.37 + k * 999) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); GRAIN.push(c);
  }
}

// ---------- drawing helpers ----------
function bg(c) { g.fillStyle = c; g.fillRect(0, 0, W, H); }
function creamBg() {
  bg(CREAM); g.strokeStyle = GRIDC; g.lineWidth = Math.max(1, 1.2 * u); const step = 54 * u;
  g.beginPath();
  for (let x = (CX % step); x < W; x += step) { g.moveTo(x, 0); g.lineTo(x, H); }
  for (let y = (CY % step); y < H; y += step) { g.moveTo(0, y); g.lineTo(W, y); }
  g.stroke();
}
function cover(img, x, y, w, h, zoom = 1, ax = 0.5, ay = 0.5) {
  if (!img || !img.width) return;
  const s = Math.max(w / img.width, h / img.height) * zoom, iw = img.width * s, ih = img.height * s;
  g.drawImage(img, x + (w - iw) * ax, y + (h - ih) * ay, iw, ih);
}
function font(size, weight = 700, fam = F_CAP) { g.font = `${weight} ${size}px ${fam}`; }
const CAP = (PORT ? 78 : 64) * u;

// Captions. groups: [[firstWordIdx, lastWordIdx], ...] of line li. style: swap | rise | fade.
function caption(t, li, groups, o = {}) {
  const line = L.find((l) => l.i === li); if (!line) return;
  let size = (o.size || 1) * CAP; const color = o.color || "#fff", style = o.style || "swap";
  let gi = -1;
  for (let k = 0; k < groups.length; k++) if (t >= line.w[groups[k][0]].s - 0.02) gi = k;
  if (gi < 0) return;
  const nx = L[L.indexOf(line) + 1], until = o.until ?? (nx ? nx.w[0].s - 0.03 : 1e9);
  if (t >= until) return;
  const [a, b] = groups[gi]; const words = line.w.slice(a, b + 1);
  font(size, o.weight || 700, o.fam || F_CAP); g.textBaseline = "alphabetic";
  { const w0 = words.map((w) => g.measureText(w.w).width).reduce((p, q) => p + q, 0) + size * 0.26 * (words.length - 1);
    if (w0 > W * 0.88) { size *= W * 0.88 / w0; font(size, o.weight || 700, o.fam || F_CAP); } }   // auto-fit long lines
  const sp = size * 0.26, ws = words.map((w) => g.measureText(w.w).width);
  const total = ws.reduce((p, q) => p + q, 0) + sp * (words.length - 1);
  let x = (o.x ?? CX) - total / 2; const y = (o.y ?? CY) + size * 0.34;
  g.save();
  if (o.shadow) { g.shadowColor = `rgba(0,0,0,${o.shadow === 2 ? 0.95 : 0.55})`; g.shadowBlur = (o.shadow === 2 ? 34 : 18) * u; }
  if (o.blend) g.globalCompositeOperation = o.blend;
  words.forEach((w, k) => {
    const st = w.s - 0.02;
    if (t >= st) {
      const p = clamp((t - st) / 0.2);
      let dy = 0, alpha = 1, col = color;
      if (style === "rise") { dy = (1 - oC(p)) * size * 0.42; alpha = clamp(p * 3); }
      if (style === "fade") { alpha = oC(p); }
      if (o.hi && o.hi === w.w) {   // site-style highlighter behind one word
        g.save(); g.shadowBlur = 0; g.fillStyle = o.hiColor || LIME; const pad = size * 0.14;
        g.fillRect(x - pad, y - size * 0.86, (ws[k] + 2 * pad) * oC(clamp((t - st) / 0.25)), size * 1.12); g.restore();
        col = INK;
      }
      g.globalAlpha = alpha; g.fillStyle = col; g.fillText(w.w, x, y + dy);
    }
    x += ws[k] + sp;
  });
  g.restore();
}
// convenience: one group per word
const each = (n, from = 0) => Array.from({ length: n - from }, (_, k) => [from + k, from + k]);

// ---------- film frame (torn edge scan + sprocket + weave) ----------
function filmFrame(t, x, y, w, h, drawContent, seed = 1) {
  const f = FR(t), j = 1.6 * u;
  const dx = (rnd(f * 3.1 + seed) - 0.5) * 2 * j, dy = (rnd(f * 7.7 + seed) - 0.5) * 2 * j;
  x += dx; y += dy;
  g.save(); g.beginPath();
  const tear = 5 * u, n = 60;
  const edge = (x0, y0, x1, y1, s) => { for (let k = 0; k <= n; k++) { const q = k / n; const r = (rnd(k * 1.7 + s + seed * 13) - 0.5) * tear + (rnd(k * 0.31 + s) - 0.5) * tear * 0.6;
    const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny); g.lineTo(lerp(x0, x1, q) + nx / nl * r, lerp(y0, y1, q) + ny / nl * r); } };
  g.moveTo(x, y); edge(x, y, x + w, y, 1); edge(x + w, y, x + w, y + h, 2); edge(x + w, y + h, x, y + h, 3); edge(x, y + h, x, y, 4);
  g.closePath(); g.clip();
  drawContent(x, y, w, h);
  // gentle vignette + flicker
  const vg = g.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.38)"); g.fillStyle = vg; g.fillRect(x, y, w, h);
  g.fillStyle = `rgba(255,240,220,${0.03 * rnd(f * 5.3 + seed)})`; g.fillRect(x, y, w, h);
  g.restore();
  // sprocket hole + rebate line
  const sh = Math.min(h * 0.28, 150 * u), sw = sh * 0.8, sx = x - sw * 1.15;
  g.save(); g.strokeStyle = "rgba(225,205,165,0.55)"; g.lineWidth = 2 * u; g.beginPath(); g.roundRect(sx, y + h * 0.5 - sh / 2, sw, sh, 12 * u); g.stroke();
  g.strokeStyle = "rgba(200,200,200,0.18)"; g.beginPath(); g.moveTo(x + w + 40 * u, y - 30 * u); g.lineTo(x + w + 40 * u, y + h + 30 * u); g.stroke();
  if (rnd(f * 0.13 + seed) > 0.8) { font(14 * u, 700, F_MONO); g.fillStyle = "rgba(230,190,120,0.45)"; g.save(); g.translate(sx - 18 * u, y + h * 0.75); g.rotate(-Math.PI / 2); g.fillText("IDEABRO 5219  ▸ 24", 0, 0); g.restore(); }
  g.restore();
}
function frameRect(aspect, push = 1) {   // centred film frame for an image of given aspect (w/h)
  let fh, fw;
  if (PORT) { fw = W * 0.82; fh = fw / aspect; if (fh > H * 0.62) { fh = H * 0.62; fw = fh * aspect; } }
  else { fh = H * 0.70; fw = fh * aspect; if (fw > W * 0.64) { fw = W * 0.64; fh = fw / aspect; } }
  fw *= push; fh *= push; return [CX - fw / 2, CY - fh / 2, fw, fh];
}

// ---------- light leak ----------
function leak(t, t0, tPeak) {
  if (t < t0) return;
  const p = oC(prog(t, t0, tPeak)); const R = Math.hypot(W, H) * (0.15 + 1.9 * p);
  const ox = -0.25 * W, oy = 1.25 * H;
  g.save(); g.filter = `blur(${40 * u}px)`;
  const ring = (r, c, wdt) => { g.strokeStyle = c; g.lineWidth = wdt; g.beginPath(); g.arc(ox, oy, r, 0, Math.PI * 2); g.stroke(); };
  ring(R * 1.02, "rgba(80,220,255,0.75)", 60 * u); ring(R * 0.97, "rgba(255,150,60,0.85)", 70 * u);
  g.fillStyle = "#fff"; g.beginPath(); g.arc(ox, oy, R * 0.94, 0, Math.PI * 2); g.fill();
  g.restore();
  g.fillStyle = `rgba(255,255,255,${clamp((p - 0.7) / 0.3)})`; g.fillRect(0, 0, W, H);
}

// ---------- orbs ----------
function orb(x, y, r, a = 1, core = "#fff") {
  if (r <= 0.3) return;
  g.save(); g.globalAlpha = a;
  const gr = g.createRadialGradient(x, y, r * 0.75, x, y, r * 1.9);
  gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(0.35, "rgba(255,255,255,0.22)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 1.9, 0, Math.PI * 2); g.fill();
  g.fillStyle = core; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
}

// ---------- scenes ----------
function sHook(t) {
  bg("#000");
  const sq = S, x0 = CX - sq / 2, y0 = CY - sq / 2;
  g.save(); g.beginPath(); g.rect(x0, y0, sq, sq); g.clip();
  const cuts = EV.hook_cuts; let i = 0; for (let k = 0; k < cuts.length; k++) if (t >= cuts[k]) i = k;
  if (i < ASSETS.hook - 1) {
    const st = cuts[i], en = cuts[i + 1] ?? st + 0.1;
    cover(IM["h" + i], x0, y0, sq, sq, 1.0 + 0.05 * prog(t, st, en));
  } else {      // earth zoom-out + rotation, fade to black
    const p = prog(t, 2.433, 2.97);
    g.save(); g.translate(CX, CY); g.rotate(-0.35 * oC(p)); const z = lerp(2.4, 0.62, oC(p));
    cover(IM["h" + (ASSETS.hook - 1)], -sq / 2, -sq / 2, sq, sq, z); g.restore();
    g.fillStyle = `rgba(0,0,0,${prog(t, 2.72, 2.97)})`; g.fillRect(x0, y0, sq, sq);
  }
  g.restore();
  caption(t, 0, each(7), { shadow: true, until: 2.97 });
}

function sHistory(t) {
  bg("#000");
  const plates = [["print_a", 4.62, 4.95], ["print_b", 4.95, T.history + 0.59], ["radio", 5.21, 5.875], ["tv", 5.875, 6.54], ["web", 6.54, T.black1]];
  const pl = plates.filter((p) => t >= p[1]).pop();
  const push = 1 + 0.04 * prog(t, pl[1], pl[2]);
  if (pl[0] === "web") {
    const [x, y, w, h] = frameRect(4 / 3, push);
    filmFrame(t, x, y, w, h, (x, y, w, h) => drawWeb(t, x, y, w, h), 5);
  } else {
    const im = IM[pl[0]]; const asp = clamp(im.width / im.height, 0.72, 1.5);
    const [x, y, w, h] = frameRect(asp, push);
    filmFrame(t, x, y, w, h, (x, y, w, h) => cover(im, x, y, w, h, 1.02), plates.indexOf(pl) + 1);
  }
  caption(t, 2, [[0, 0]], { shadow: true, until: 5.21 });
  caption(t, 3, [[0, 0]], { shadow: true, until: 5.875 });
  caption(t, 4, [[0, 0]], { shadow: true, until: 6.54 });
  caption(t, 5, [[0, 1]], { shadow: 2 });
  if (t >= 6.70 && t < T.black1) caption(t, 5, [[0, 1]], { shadow: 2 });
}
function drawWeb(t, x, y, w, h) {   // a 1997 browser with a blinking banner ad
  const k = w / 800;
  g.fillStyle = "#c0c0c0"; g.fillRect(x, y, w, h);
  const tb = g.createLinearGradient(x, 0, x + w, 0); tb.addColorStop(0, "#000080"); tb.addColorStop(1, "#1084d0");
  g.fillStyle = tb; g.fillRect(x + 6 * k, y + 6 * k, w - 12 * k, 30 * k);
  g.fillStyle = "#fff"; g.font = `bold ${17 * k}px Tahoma, Verdana, sans-serif`; g.fillText("Netscape - [Welcome to MegaDeals Online!]", x + 16 * k, y + 27 * k);
  g.fillStyle = "#fff"; g.fillRect(x + 90 * k, y + 46 * k, w - 110 * k, 26 * k); g.fillStyle = "#000"; g.font = `${15 * k}px 'Courier New', monospace`;
  g.fillText("Location:", x + 14 * k, y + 64 * k); g.fillText("http://www.megadeals.com/index.html", x + 96 * k, y + 64 * k);
  const px = x + 14 * k, py = y + 84 * k, pw = w - 28 * k, ph = h - 98 * k; g.fillStyle = "#fff"; g.fillRect(px, py, pw, ph);
  const blink = FR(t) % 8 < 4;
  const bx = px + (pw - 600 * k) / 2, by = py + 30 * k;
  g.fillStyle = blink ? "#ffff00" : "#ff0000"; g.fillRect(bx, by, 600 * k, 76 * k);
  g.strokeStyle = "#000"; g.lineWidth = 3 * k; g.strokeRect(bx, by, 600 * k, 76 * k);
  g.fillStyle = blink ? "#ff0000" : "#ffff00"; g.font = `bold ${36 * k}px Impact, 'Arial Black', sans-serif`; g.textAlign = "center";
  g.fillText("★ CLICK HERE! ★ FREE OFFER ★", bx + 300 * k, by + 52 * k); g.textAlign = "left";
  g.fillStyle = "#0000ee"; g.font = `${24 * k}px 'Times New Roman', serif`;
  ["Welcome to my HOME PAGE!", "Best deals on the World Wide Web", "Sign my guestbook!"].forEach((s, i) => { g.fillText(s, px + 40 * k, by + 130 * k + i * 40 * k); });
  g.fillStyle = "#000"; g.font = `${18 * k}px 'Courier New', monospace`; g.fillText("You are visitor #000417", px + 40 * k, py + ph - 26 * k);
  g.fillStyle = "#808080"; g.fillRect(px + pw - 180 * k, py + ph - 70 * k, 150 * k, 50 * k); g.fillStyle = "#fff"; g.font = `bold ${16 * k}px Tahoma, sans-serif`; g.fillText("UNDER", px + pw - 140 * k, py + ph - 50 * k); g.fillText("CONSTRUCTION", px + pw - 168 * k, py + ph - 30 * k);
}

function sBlack1(t) {
  bg("#000");
  caption(t, 6, [[0, 2], [3, 8]], { style: "rise" });
}

// old-world collage: [name, x, y, w, h] in units of S around the centre (portrait swaps axes a bit)
const OW = [
  ["ow_cinecam", -0.30, -0.06, 0.40, 0.27], ["ow_clapper", 0.02, -0.30, 0.30, 0.24], ["callsheet", 0.33, -0.10, 0.26, 0.34],
  ["ow_photog", 0.00, 0.05, 0.36, 0.40], ["ow_tripod", -0.36, 0.24, 0.26, 0.30], ["ow_polaroid", 0.25, 0.26, 0.36, 0.24],
  ["ow_shooter", -0.20, -0.33, 0.30, 0.20], ["ow_lens", 0.42, 0.16, 0.24, 0.18],
];
function owLayout(k) {
  const c = OW[k]; let [n, x, y, w, h] = c;
  if (PORT) { [x, y] = [y * 0.62, x * 1.55]; w *= 1.05; h *= 1.05; }
  return { n, x: CX + x * S, y: CY + y * S, w: w * S, h: h * S };
}
function drawCallSheet(x, y, w, h) {
  g.fillStyle = "#f4f1e8"; g.fillRect(x, y, w, h);
  const k = w / 300; g.fillStyle = INK; g.font = `700 ${22 * k}px ${F_MONO}`; g.fillText("CALL SHEET", x + 18 * k, y + 38 * k);
  g.font = `400 ${13 * k}px ${F_MONO}`;
  ["DAY 1 OF 21", "CREW CALL  06:00", "STUDIO B · LIGHTING RIG", "MODELS x4 · STYLIST x2", "PHOTOG + 2 ASSIST", "CATERING  45 PAX", "BUDGET  $48,000"].forEach((s, i) => g.fillText(s, x + 18 * k, y + (72 + i * 26) * k));
  g.strokeStyle = INK; g.lineWidth = 2 * k; g.strokeRect(x + 8 * k, y + 8 * k, w - 16 * k, h - 16 * k);
  g.fillStyle = "#c0392b"; g.font = `700 ${18 * k}px ${F_MONO}`; g.save(); g.translate(x + w * 0.62, y + h * 0.86); g.rotate(-0.2); g.fillText("OVER BUDGET", -60 * k, 0); g.restore();
}
function sOldWorld(t) {
  bg("#000");
  const sc = T.scatter;
  OW.forEach((_, k) => {
    const st = EV.ow_pops[k]; if (t < st) return;
    const c = owLayout(k); let x = c.x, y = c.y, rot = 0, s = 1 + 0.06 * (1 - oC(clamp((t - st) / 0.12)));
    if (t >= sc) {      // explode outward, then drift
      const dx = c.x - CX, dy = c.y - CY, d = Math.hypot(dx, dy) || 1, p = oX(clamp((t - sc) / 0.7));
      const dist = (PORT ? 0.30 : 0.40) * S * p + (t - sc) * 22 * u;
      x += dx / d * dist * (PORT ? 0.8 : 1.25); y += dy / d * dist;
      rot = (rnd(k * 9.1) - 0.5) * 0.7 * p; s *= 1 - 0.18 * p;
    }
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 24 * u;
    if (c.n === "callsheet") { g.fillStyle = "#000"; g.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); g.shadowBlur = 0; drawCallSheet(-c.w / 2, -c.h / 2, c.w, c.h); }
    else { g.fillStyle = "#000"; g.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); g.shadowBlur = 0; cover(IM[c.n], -c.w / 2, -c.h / 2, c.w, c.h); }
    g.restore();
  });
  // orb is born after the scatter and floats to the centre
  if (t >= T.orb_born) {
    const p = oC(prog(t, T.orb_born, 16.55));
    const r = lerp(4 * u, 46 * u, p) + (t > T.orb_fill ? Math.pow(prog(t, T.orb_fill, T.cream), 2.4) * Math.hypot(W, H) * 0.6 : 0);
    orb(CX, lerp(CY + 0.16 * S, CY, p), r, clamp((t - T.orb_born) / 0.12), "#F6F4EE");
  }
  caption(t, 7, [[0, 2], [3, 4], [5, 6], [7, 9]], { shadow: 2, until: T.scatter });
  caption(t, 8, [[0, 0], [1, 2], [3, 3], [4, 4]], { size: 0.8, until: 16.6 });
  caption(t, 9, [[0, 0], [1, 1]], { blend: "difference", until: T.cream });
}

// tool tiles: [label, bg, glyph svg or null, text color]
const TILES = [["ChatGPT", "#141414", "openai", "#fff"], ["Claude", "#D97757", "claude", "#fff"], ["Gemini", "#fff", "googlegemini", "#4C8DF6"],
  ["Midjourney", LAV, null, INK], ["Veo", LIME, null, INK], ["Kling", PINK, null, INK], ["ElevenLabs", "#141414", "elevenlabs", "#fff"], ["Suno", "#fff", "suno", INK]];
function drawTile(k, x, y, s) {
  const [label, bgc, svg, fg] = TILES[k], r = s * 0.22;
  g.fillStyle = LAV; g.beginPath(); g.roundRect(x - s / 2 + 6 * u, y - s / 2 + 6 * u, s, s, r); g.fill();
  g.fillStyle = bgc; g.strokeStyle = INK; g.lineWidth = 2.5 * u; g.beginPath(); g.roundRect(x - s / 2, y - s / 2, s, s, r); g.fill(); g.stroke();
  if (svg) { const key = svg + fg; if (!GLYPH[key]) GLYPH[key] = tint(IM["svg_" + svg], fg); const gs = s * 0.52; g.drawImage(GLYPH[key], x - gs / 2, y - gs / 2 - s * 0.06, gs, gs); }
  font(svg ? s * 0.13 : s * 0.19, 700, svg ? F_MONO : F_CAP); g.fillStyle = fg; g.textAlign = "center";
  g.fillText(label, x, svg ? y + s * 0.36 : y + s * 0.07); g.textAlign = "left";
}
function sNewWorld(t) {
  creamBg();
  const whip = T.whip, wp = clamp((t - whip) / 0.22), off = iC(wp) * W * 1.3;
  const ghosts = wp > 0 && wp < 1 ? 6 : 1;
  for (let gh = 0; gh < ghosts; gh++) {
    g.save(); g.globalAlpha = ghosts > 1 ? 0.28 : 1; g.translate(off - gh * 40 * u * (ghosts > 1 ? 1 : 0), 0);
    TILES.forEach((_, k) => {
      const st = EV.logo_pops[k]; if (t < st) return;
      const a = -Math.PI / 2 + k * Math.PI * 2 / TILES.length;
      const rx = PORT ? W * 0.34 : W * 0.29, ry = PORT ? H * 0.20 : H * 0.31;
      const s = (PORT ? 190 : 185) * u * oB(clamp((t - st) / 0.28));
      drawTile(k, CX + Math.cos(a) * rx, CY + Math.sin(a) * ry, s);
    });
    caption(t, 9, [[1, 1], [2, 2], [3, 3], [4, 6], [7, 7]], { color: INK, until: 18.6 });
    g.restore();
  }
  caption(t, 9, [[8, 8]], { color: INK, style: "fade", size: 1.15 });
}
function sNoStudio(t) {
  creamBg();
  caption(t, 10, [[0, 1], [2, 3], [4, 5]], { color: INK, style: "fade", size: 1.15 });
}
// campaign collage around the product photo: [name, x, y, w] in S units, aspect from image
const CAMP = [["shoe_1", -0.36, -0.20, 0.22], ["shoe_2", 0.36, -0.22, 0.22], ["juice_1", -0.42, 0.20, 0.30], ["shoe_3", 0.38, 0.22, 0.20],
  ["look_1", -0.13, -0.33, 0.19], ["juice_2", 0.13, 0.36, 0.28], ["shoe_4", 0.62, 0.00, 0.20], ["shoe_5", -0.62, -0.02, 0.19], ["look_2", 0.16, -0.36, 0.18], ["juice_3", -0.16, 0.38, 0.27]];
function card(img, x, y, w, s = 1) {
  const h = w * img.height / img.width; g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = LAV; g.fillRect(-w / 2 + 7 * u, -h / 2 + 7 * u, w, h);
  g.drawImage(img, -w / 2, -h / 2, w, h); g.strokeStyle = INK; g.lineWidth = 2.5 * u; g.strokeRect(-w / 2, -h / 2, w, h); g.restore();
}
function sProduct(t) {
  creamBg();
  if (t < T.ai) {
    CAMP.forEach((c, k) => {
      const st = EV.camp_pops[k]; if (t < st) return;
      let [n, x, y, w] = c; if (PORT) { [x, y] = [y * 0.95, x * 1.35]; w *= 1.25; }
      card(IM[n], CX + x * S, CY + y * S, w * S, 0.85 + 0.15 * oB(clamp((t - st) / 0.22)));
    });
    const pw = (PORT ? 0.46 : 0.34) * S;
    card(IM.shoe_product, CX, CY, pw, 0.9 + 0.1 * oB(clamp((t - T.product) / 0.3)));
    caption(t, 11, [[0, 2], [3, 3], [4, 6]], { shadow: 2 });
    caption(t, 12, [[0, 1]], { shadow: 2 });
  } else {
    caption(t, 12, [[2, 2]], { color: INK, style: "fade", size: 2.1, until: 25.84 });
    caption(t, 12, [[3, 4], [5, 5]], { color: INK, style: "fade" });
    caption(t, 13, [[0, 1], [2, 2]], { color: INK, style: "fade" });
  }
}
function sGap(t) {   // black bar opens from the middle of "gap"
  const p = oC(prog(t, T.gap + 0.04, T.gap + 0.36)), bw = p * W * 1.02;
  const half = (side) => {
    g.save(); g.beginPath(); side < 0 ? g.rect(0, 0, CX - bw / 2, H) : g.rect(CX + bw / 2, 0, W, H); g.clip();
    g.translate(side * bw / 2, 0); creamBg(); caption(t, 13, [[2, 2]], { color: INK }); g.restore();
  };
  bg("#000"); half(-1); half(1);
  caption(t, 13, [[3, 3]], {});
}
function sOrbs(t) {
  bg("#000");
  const ig = EV.orb_ignite, si = EV.sats_in, col = T.collapse;
  const shrink = 1 - ioC(prog(t, 29.77, 30.35));
  const r0 = 44 * u * oB(clamp((t - ig) / 0.35)) * shrink;
  if (t >= si) {
    const p = oC(prog(t, si, si + 0.55)), c = ioC(prog(t, col, 30.1));
    const R = lerp(Math.hypot(W, H) * 0.6, (PORT ? 0.36 : 0.33) * S, p) * (1 - c);
    const ang = (t - si) * 0.9 + c * 2.2;
    for (let k = 0; k < 8; k++) {
      const a = ang + k * Math.PI / 4;
      orb(CX + Math.cos(a) * R * (PORT ? 0.9 : 1.15), CY + Math.sin(a) * R, 30 * u * (1 - c * 0.6), 1 - c * 0.3);
    }
  }
  if (t >= ig) orb(CX, CY, r0);
  caption(t, 13, [[3, 3], [4, 4], [5, 7], [8, 9], [10, 12]], { blend: "difference" });
}
function sGrowing(t) {
  bg("#000");
  caption(t, 14, each(5), { style: "rise" });
}
function sProof(t) {
  bg("#000");
  const pc = PROOF.filter((c) => t >= c.s).pop(); const m = ASSETS.clips[pc.id];
  const fi = clamp(Math.floor((t - pc.s) * TL.fps) + 1, 1, m.n);
  const asp = m.w / m.h, push = 1 + 0.05 * prog(t, pc.s, pc.e);
  const [x, y, w, h] = frameRect(asp, push);
  filmFrame(t, x, y, w, h, (x, y, w, h) => {
    cover(IM[`${pc.id}_${fi}`], x, y, w, h);
    const gr = g.createLinearGradient(0, y + h * 0.6, 0, y + h); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.7)");
    g.fillStyle = gr; g.fillRect(x, y + h * 0.6, w, h * 0.4);
    const lp = oC(clamp((t - pc.s - 0.08) / 0.25)), ls = Math.min(1, w / (560 * u));
    g.globalAlpha = lp; font(36 * u * ls, 700); g.fillStyle = "#fff"; g.fillText(pc.title, x + 26 * u * ls, y + h - 58 * u * ls + (1 - lp) * 12 * u);
    font(18 * u * ls, 400, F_MONO); g.fillStyle = "rgba(255,255,255,0.85)"; g.fillText("Made with AI · Ideabro Studio", x + 26 * u * ls, y + h - 28 * u * ls + (1 - lp) * 12 * u);
    g.globalAlpha = 1;
  }, PROOF.indexOf(pc) + 11);
  caption(t, 15, [[0, 1], [2, 4]], { shadow: 2, until: 35.2, size: 1.05 });
}
function finaleLines(t) {
  const g0 = PORT ? H * 0.075 : H * 0.15, xf = W * 0.40, dx = W * 0.05, d = PORT ? H * 0.045 : H * 0.09;
  const path = (sgn) => [[-20 * u, CY + sgn * g0], [xf, CY + sgn * g0], [xf + dx, CY + sgn * (g0 + d)], [W + 40 * u, CY + sgn * (g0 + d)]];
  const lens = (pts) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const fork = L.find((l) => l.i === 16).w[5].s;
  for (const sgn of [-1, 1]) {
    const pts = path(sgn), ls = lens(pts), tot = ls.reduce((a, b) => a + b, 0);
    const head = t < fork ? ls[0] * oC(prog(t, T.finale, fork)) : ls[0] + (tot - ls[0]) * ioC(prog(t, fork, fork + 1.2));
    const tail = tot * iC(prog(t, 46.9, 47.85));
    if (head - tail <= 1) continue;
    g.save(); g.lineCap = "round"; g.lineJoin = "round";
    for (const [lw, a, blur] of [[16 * u, 0.35, 34 * u], [7 * u, 1, 10 * u]]) {
      g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = lw; g.shadowColor = "#fff"; g.shadowBlur = blur; g.beginPath();
      let acc = 0, started = false;
      for (let i = 0; i < ls.length; i++) {
        const a0 = acc, a1 = acc + ls[i]; acc = a1;
        const s0 = clamp((tail - a0) / ls[i]), s1 = clamp((head - a0) / ls[i]); if (s1 <= s0) continue;
        const P = (s) => [lerp(pts[i][0], pts[i + 1][0], s), lerp(pts[i][1], pts[i + 1][1], s)];
        const A = P(s0), Bp = P(s1); if (!started) { g.moveTo(A[0], A[1]); started = true; } else g.lineTo(A[0], A[1]); g.lineTo(Bp[0], Bp[1]);
      }
      g.stroke();
    }
    g.restore();
  }
}
function sFinale(t) {
  bg("#000"); finaleLines(t);
  caption(t, 16, [[0, 1], [2, 3], [4, 5]], { style: "fade" });
  caption(t, 17, [[0, 3], [4, 8]], { style: "fade", hi: "direct.", hiColor: LIME });
  caption(t, 18, [[0, 1], [2, 3]], { style: "fade" });
}
function glitchDraw(t, fn, hits) {
  const on = hits.some((h) => t >= h && t < h + 0.07);
  if (!on) { fn(0); return; }
  g.save(); g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.8; g.filter = "url(#none)"; fn(-10 * u, "r"); fn(10 * u, "b"); g.restore(); fn(0);
}
function sEnd(t) {
  bg("#000");
  const lg = IM.logo, lh = (PORT ? 0.15 : 0.22) * H * (PORT ? 0.8 : 1), lw = lh * lg.width / lg.height;
  if (t < T.url) {
    const ly = CY - (PORT ? 0.13 : 0.17) * H;
    const wp = oC(prog(t, T.endcard + 0.12, T.endcard + 0.55)), hits = [T.endcard + 0.14, T.endcard + 0.58];
    const glitch = hits.some((h) => t >= h && t < h + 0.07);
    g.save(); g.beginPath(); g.rect(CX - lw / 2 - 20 * u, 0, (lw + 40 * u) * wp, H); g.clip();
    if (glitch) { g.globalAlpha = 0.6; g.drawImage(lg, CX - lw / 2 - 12 * u, ly - lh / 2, lw, lh); g.globalAlpha = 1; g.drawImage(lg, CX - lw / 2 + 9 * u, ly - lh / 2 + 3 * u, lw, lh); }
    else g.drawImage(lg, CX - lw / 2, ly - lh / 2, lw, lh);
    g.restore();
    const tp = oC(prog(t, 48.95, 49.35));
    g.globalAlpha = tp; font((PORT ? 104 : 112) * u, 400, F_SERIF); g.fillStyle = "#fff"; g.textAlign = "center";
    g.fillText("AI in Advertising", CX, CY + (PORT ? 0.03 : 0.08) * H + (1 - tp) * 20 * u);
    const bp = oC(prog(t, 49.2, 49.6)); g.globalAlpha = bp; font(32 * u, 400, F_MONO); g.fillStyle = "#d6d6d6";
    g.fillText("by Ideabro Studio", CX, CY + (PORT ? 0.075 : 0.155) * H);
    g.globalAlpha = 1;
    const pp = clamp((t - 49.55) / 0.35);
    if (pp > 0) {
      const s = oB(pp); font(28 * u, 700, F_MONO); const label = "Learn AI Advertising  →", tw = g.measureText(label).width;
      const bw = tw + 64 * u, bh = 70 * u, bx = CX, by = CY + (PORT ? 0.14 : 0.27) * H;
      g.save(); g.translate(bx, by); g.scale(s, s);
      g.fillStyle = LAV; g.beginPath(); g.roundRect(-bw / 2 + 7 * u, -bh / 2 + 7 * u, bw, bh, 14 * u); g.fill();
      g.fillStyle = LIME; g.strokeStyle = INK; g.lineWidth = 2.5 * u; g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, 14 * u); g.fill(); g.stroke();
      g.fillStyle = INK; g.fillText(label, 0, 10 * u); g.restore();
    }
    g.textAlign = "left";
  } else {
    const p = oC(prog(t, T.url, T.url + 0.3));
    g.globalAlpha = p; const sl = lh * 0.42, slw = sl * lg.width / lg.height;
    g.drawImage(lg, CX - slw / 2, CY - sl - 34 * u, slw, sl);
    font((PORT ? 40 : 44) * u, 400, F_MONO); g.fillStyle = "#fff"; g.textAlign = "center";
    g.fillText("community.ideabrostudio.com", CX, CY + 40 * u); g.textAlign = "left"; g.globalAlpha = 1;
  }
}

// ---------- master ----------
function grain(t, a) {
  const c = GRAIN[FR(t) % 4]; if (!c) return; g.save(); g.globalAlpha = a; g.globalCompositeOperation = "overlay";
  const ox = rnd(FR(t)) * 256, oy = rnd(FR(t) + 3) * 256;
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) g.drawImage(c, x, y); g.restore();
}
window.renderAt = function (t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none"; g.shadowBlur = 0;
  let cream = false;
  if (t < T.hook_end) sHook(t);
  else if (t < T.history) { bg("#000"); caption(t, 1, [[0, 3]], { style: "rise" }); leak(t, T.leak1, 4.47); }
  else if (t < T.black1) sHistory(t);
  else if (t < T.oldworld) sBlack1(t);
  else if (t < T.cream) sOldWorld(t);
  else if (t < T.nostudio) { sNewWorld(t); cream = true; }
  else if (t < T.product) { sNoStudio(t); cream = true; }
  else if (t < T.gap + 0.04) { sProduct(t); cream = true; }
  else if (t < T.gap + 0.36) sGap(t);
  else if (t < T.growing) sOrbs(t);
  else if (t < T.proof) { sGrowing(t); leak(t, T.leak2, 32.45); }
  else if (t < T.finale) { sProof(t); leak(t, T.leak3, 41.18); }
  else if (t < T.stop + 0.12) sFinale(t);
  else if (t < T.endcard) bg("#000");
  else sEnd(t);
  grain(t, cream ? 0.05 : 0.09);
};
window.stageReady = (async () => { makeGrain(); await document.fonts.ready; await Promise.all(jobs);
  await Promise.all(["700 40px Inter", "500 40px Inter", "400 40px 'Instrument Serif'", "400 40px 'JetBrains Mono'", "700 40px 'JetBrains Mono'"].map((f) => document.fonts.load(f)));
  return true; })();

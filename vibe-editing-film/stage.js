// The whole film as one deterministic function: renderAt(t).
// Layout and events come from build/timeline.js (written by timeline.py);
// nothing here animates on its own, so any frame can be rendered in any order.
const TL = window.TL;

// ------------------------------------------------------------------ utils --
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const win = (a, b, t) => clamp((t - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const ss = (a, b, t) => smooth(win(a, b, t));
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const outBack = (x, s = 1.8) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pulse = (t, at, k) => (t >= at ? Math.exp(-(t - at) * k) : 0);
function rnd(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
function h(tag, cls, parent, css, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (css) Object.assign(e.style, css);
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
const px = (v) => v + "px";
function place(e, x, y, w, hh) { Object.assign(e.style, { left: px(x), top: px(y), width: px(w), height: px(hh) }); return e; }
function rr(c, x, y, w, hh, r) { c.beginPath(); c.roundRect(x, y, w, hh, r); }

const laneX = (et) => TL.lane.x0 + et * TL.pps;
const spot = (n) => TL.spots[n];
const [CX, CY, CWu, CHu] = TL.comp;          // comp rect in UI px
const CW = 1600, CH = 900, CS = CW / CWu;     // comp canvas px per UI px

// ------------------------------------------------------------------ world --
const world = document.getElementById("world");
const bg = document.getElementById("bg");
const flash = document.getElementById("flash");

const bokeh = [];
{
  const r = rnd(7);
  const cols = ["rgba(139,92,246,.35)", "rgba(255,201,60,.25)", "rgba(255,138,61,.22)", "rgba(34,211,238,.18)"];
  for (let i = 0; i < 16; i++) {
    const s = 20 + r() * 70;
    const b = h("div", "bokeh", bg, { width: px(s), height: px(s), background: cols[i % 4] });
    bokeh.push({ el: b, x: r() * 2200 - 140, y: r() * 1100, d: 0.03 + r() * 0.08 });
  }
}

const slabs = {};
for (const [name, [x, y, w, hh]] of Object.entries(TL.panels)) {
  const el = place(h("div", "slab", world), x, y, w, hh);
  const base = h("div", "base", el);
  const face = h("div", "face", el);
  h("div", "gloss", face);
  base.style.transform = "translateZ(4px)";
  face.style.transform = `translateZ(${TL.depth[name]}px)`;
  slabs[name] = { el, base, face, x, y, w, h: hh, depth: TL.depth[name] };
}
const rel = (name, x, y) => [x - TL.panels[name][0], y - TL.panels[name][1]];

// ---- top bar
{
  const f = slabs.topbar.face;
  h("div", "logo abs", f, { left: "20px", top: "13px" }, '<div class="bulb"></div>VIBE EDITING <small>by IdeaBro Studio</small>');
  h("div", "menu abs", f, { left: "360px", top: "17px" }, "<span>File</span><span>Edit</span><span>Vibe</span><span>View</span><span>Help</span>");
  h("div", "abs", f, { left: "0", right: "0", top: "16px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#b8b2cc" },
    'launch_reel.vibe <span style="color:#6f6984;font-weight:500">· saved</span>');
  const right = h("div", "abs", f, { right: "18px", top: "11px", display: "flex", gap: "10px", alignItems: "center" });
  const av = h("div", "", right, { display: "flex", marginRight: "6px" });
  ["#f472b6", "#60a5fa", "#34d399"].forEach((c, i) => h("div", "av", av, { background: c, marginLeft: i ? "-8px" : 0 }));
  h("div", "pill", right, null, "Share");
  h("div", "pill pri", right, null, "Export");
}

// ---- media
const thumbs = {};
const looks = {};
{
  const f = slabs.media.face;
  h("div", "ph", f, null, 'MEDIA<span class="sp"></span><span class="tag">6 items</span>');
  const items = [["sunrise.mp4", "0:02", 0], ["city_night.mp4", "0:02", 1], ["ocean.mp4", "0:02", 2],
    ["endcard.vibe", "0:02", 3], ["bro.png", "PNG", "bro"], ["vibe_beat.wav", "0:12", "wav"]];
  items.forEach(([name, dur, kind], i) => {
    const x = 12 + (i % 2) * 164, y = 44 + Math.floor(i / 2) * 114;
    const th = place(h("div", "thumb", f), x, y, 152, 86);
    const cv = h("canvas", "", th); cv.width = 304; cv.height = 172;
    thumbs[i] = { cv, kind };
    place(h("div", "tlabel", f, null, `${name}<b>${dur}</b>`), x + 2, y + 91, 148, 14);
  });
  const [lx, ly] = rel("media", 28, 466);
  h("div", "sec", f, { left: px(lx), top: px(ly) }, 'LOOKS <span style="color:#6f6984;letter-spacing:0;font-weight:500">· AI-matched</span>');
  const sw = { teal: "linear-gradient(135deg,#22d3ee,#ff8a3d)", film: "linear-gradient(135deg,#e8c39e,#6b4f3a)",
    noir: "linear-gradient(135deg,#f5f5f5,#111)", pastel: "linear-gradient(135deg,#f9a8d4,#a5f3fc)",
    mono: "linear-gradient(135deg,#facc15,#1f2937)", vhs: "linear-gradient(135deg,#f472b6,#60a5fa)" };
  for (const [k, [label, [x, y, w, hh]]] of Object.entries(TL.looks)) {
    const [rx, ry] = rel("media", x, y);
    const e = place(h("div", "look", f, null, `<div class="sw" style="background:${sw[k]}"></div>${label}`), rx, ry, w, hh);
    looks[k] = e;
  }
}

// ---- preview
let compCv, cx, tcEl, barEl, playIc;
{
  const f = slabs.preview.face;
  h("div", "ph", f, null, 'PREVIEW<span class="tag">launch_reel · 1920×1080 · 30 fps</span><span class="sp"></span><span class="tag">Fit ▾</span>');
  const [rx, ry] = rel("preview", CX, CY);
  compCv = place(h("canvas", "", f), rx, ry, CWu, CHu);
  compCv.id = "comp"; compCv.width = CW; compCv.height = CH;
  cx = compCv.getContext("2d");
  const tr = place(h("div", "transport", f), rx, ry + CHu + 10, CWu, 22);
  playIc = h("span", "", tr, { fontSize: "16px", color: "#ece8f6", width: "16px" }, "▶");
  tcEl = h("span", "tc", tr, null, "00:00:00:00");
  const bar = h("div", "bar", tr);
  barEl = h("i", "", bar);
  h("span", "", tr, null, "1080p · 30 fps");
}

// ---- copilot
const chips = {};
let promptEl, logEl, vibeBtn;
{
  const f = slabs.copilot.face;
  h("div", "ph", f, null, '<span style="color:#a78bfa">✦</span> VIBE COPILOT<span class="tag">AI editor</span><span class="sp"></span>' +
    '<span class="tag" style="display:flex;align-items:center;gap:6px"><i style="width:7px;height:7px;border-radius:50%;background:#34d399;display:inline-block"></i>online</span>');
  promptEl = place(h("div", "prompt", f), 20, 44, 466, 92);
  h("div", "sec", f, { left: "20px", top: "152px" }, "TOOLS");
  const ic = { cut: "✂", captions: "Aa", mg: "✦", broll: "▦", sfx: "♪", transitions: "⇄" };
  for (const [k, [label, [x, y, w, hh]]] of Object.entries(TL.chips)) {
    const [rx, ry] = rel("copilot", x, y);
    const e = place(h("div", "chip", f, null, `<div class="ic">${ic[k]}</div>${label}<span class="ok">✓</span>`), rx, ry, w, hh);
    chips[k] = { el: e, ok: e.querySelector(".ok"), ic: e.querySelector(".ic") };
  }
  logEl = place(h("div", "log", f), 22, 356, 462, 96);
  const [bx, by] = rel("copilot", TL.vibe_btn[0], TL.vibe_btn[1]);
  vibeBtn = place(h("div", "", f), bx, by, TL.vibe_btn[2], TL.vibe_btn[3]);
  vibeBtn.id = "vibebtn";
}

// ---- timeline
const tlClips = { V1: [], CAP: [], MG: [], SFX: [] };
let playhead, phandle;
{
  const f = slabs.timeline.face;
  h("div", "ph", f, null, 'TIMELINE<span class="tag">launch_reel</span><span class="sp"></span>' +
    '<span class="tag">120 BPM · snap to beat ●</span><span class="tag">✂ ↔ ⌕</span>');
  const ox = TL.panels.timeline[0], oy = TL.panels.timeline[1];
  const L = TL.lane.x0 - ox, R = TL.lane.x1 - ox;
  const ruler = place(h("div", "ruler", f), L, 36, R - L, 30);
  for (let et = 0; et <= TL.lane.edit_dur + 1e-6; et += 0.25) {
    const x = et * TL.pps;
    const major = Math.abs(et - Math.round(et)) < 1e-6;
    const beat = Math.abs(et * 2 - Math.round(et * 2)) < 1e-6;
    place(h("div", "tick", ruler), x, major ? 12 : beat ? 20 : 25, 1, major ? 18 : beat ? 10 : 5);
    if (major) h("div", "tnum", ruler, { left: px(x + 4) }, `0:0${Math.round(et)}`);
  }
  const names = { MG: ["MOTION GFX", "#8b5cf6"], CAP: ["CAPTIONS", "#ffc93c"], V1: ["VIDEO", "#22d3ee"],
    SFX: ["SOUND FX", "#ff8a3d"], A1: ["MUSIC", "#f472b6"] };
  for (const [k, cyy] of Object.entries(TL.tracks)) {
    const y = cyy - oy - TL.row_h / 2;
    place(h("div", "row", f), L, y, R - L, TL.row_h);
    place(h("div", "trk", f, null, `<i style="background:${names[k][1]}"></i>${names[k][0]}<em>${k}</em>`), 14, y, 150, TL.row_h);
  }
  const mk = (track, et0, et1, label, bgc) => {
    const y = TL.tracks[track] - oy - TL.row_h / 2 + 5;
    const e = place(h("div", "clip", f, { background: bgc }), laneX(et0) - ox + 1, y, (et1 - et0) * TL.pps - 2, TL.row_h - 10);
    return e;
  };
  TL.edit.clips.forEach((c, i) => {
    const e = mk("V1", c.t0, c.t1, c.name, "#0e3a44");
    const cv = h("canvas", "", e); cv.width = Math.round((c.t1 - c.t0) * TL.pps); cv.height = 48;
    h("span", "", e, null, c.name);
    const lut = h("div", "lut", e);
    tlClips.V1.push({ el: e, cv, lut, i });
  });
  const words = TL.edit.captions.flat();
  TL.edit.captions.forEach((line, li) => line.forEach(([w, et], wi) => {
    const next = wi + 1 < line.length ? line[wi + 1][1] : et + 0.7;
    const e = mk("CAP", et, next - 0.03, w, "linear-gradient(180deg,#b88a14,#7a5a08)");
    h("span", "", e, null, w);
    tlClips.CAP.push({ el: e });
  }));
  TL.edit.mg.forEach((m) => {
    const e = mk("MG", m.t0, m.t1, m.name, "linear-gradient(180deg,#6d4ad8,#4c2fb0)");
    h("span", "", e, null, m.name);
    tlClips.MG.push({ el: e });
  });
  TL.edit.sfx.forEach((s) => {
    const e = mk("SFX", s.et - 0.2, s.et + 0.25, s.name, "linear-gradient(180deg,#d9622a,#9c3f14)");
    const cv = h("canvas", "", e); cv.width = 190; cv.height = 48;
    h("span", "", e, null, s.name);
    tlClips.SFX.push({ el: e, cv, s });
  });
  const a1 = mk("A1", 0, TL.lane.edit_dur, "", "linear-gradient(180deg,#8a2f63,#5c1d42)");
  const wcv = h("canvas", "", a1); wcv.width = 1690; wcv.height = 48; wcv.style.opacity = 0.8;
  h("span", "", a1, null, "vibe_beat.wav · 120 BPM");
  tlClips.A1 = wcv;
  playhead = place(h("div", "", f), 0, 36, 2, 360); playhead.id = "playhead";
  phandle = place(h("div", "", f), 0, 36, 30, 22); phandle.id = "phandle";
}

for (const s of Object.values(slabs)) {           // power-down layers on top
  s.off = h("div", "off", s.face);
  s.scan = h("div", "scan", s.face);
}

// ---- 3D props: LUT card, shards, particles, shadow, Bro
const lutCard = h("div", "", world, null, '<div class="sw" style="background:linear-gradient(135deg,#22d3ee,#ff8a3d)"></div>TEAL &amp;<br>ORANGE');
lutCard.id = "lutcard";

const shards = [];
{
  const r = rnd(42);
  const [ix, iy] = [spot("comp")[0], spot("comp")[1] - 30];
  for (let i = 0; i < 16; i++) {
    const s = 50 + r() * 110;
    const e = h("div", "shard", world, { width: px(s), height: px(s) });
    const pts = [[r() * 40, r() * 30], [60 + r() * 40, r() * 50], [r() * 100, 60 + r() * 40]];
    e.style.clipPath = `polygon(${pts.map(([a, b]) => `${a}% ${b}%`).join(",")})`;
    const ang = (i / 16) * Math.PI * 2 + r() * 0.4;
    shards.push({ el: e, s, x: ix + Math.cos(ang) * (40 + r() * 160) - s / 2, y: iy + Math.sin(ang) * (30 + r() * 110) - s / 2,
      vx: Math.cos(ang) * (300 + r() * 500), vy: Math.sin(ang) * (200 + r() * 400) - 100, vz: 500 + r() * 900,
      rx: (r() - 0.5) * 900, ry: (r() - 0.5) * 900, rz: (r() - 0.5) * 600 });
  }
}

const BURSTS = [
  { t: TL.bro.pop, at: [spot("comp")[0], spot("comp")[1] - 50, 40], n: 30, sp: 520, cols: ["#ffc93c", "#fff", "#a78bfa"] },
  { t: TL.t.mg, at: [spot("mg")[0], spot("mg")[1], 40], n: 16, sp: 300, cols: ["#a78bfa", "#fff"] },
  { t: TL.lut.hit, at: [CX + CWu / 2, CY + CHu / 2, 30], n: 44, sp: 560, cols: ["#22d3ee", "#ff8a3d", "#fff"] },
  { t: TL.t.vibe, at: [spot("vibe")[0], spot("vibe")[1], 44], n: 64, sp: 720, cols: ["#8b5cf6", "#ffc93c", "#fff", "#f472b6"] },
  { t: TL.t.yay, at: [spot("end")[0], spot("end")[1] - 70, 60], n: 30, sp: 380, cols: ["#ffc93c", "#fff"] },
];
const particles = [];
BURSTS.forEach((b, bi) => {
  const r = rnd(100 + bi);
  for (let i = 0; i < b.n; i++) {
    const a = r() * Math.PI * 2, sp = b.sp * (0.35 + r() * 0.65), s = 5 + r() * 10;
    const c = b.cols[i % b.cols.length];
    const e = h("div", "pt", world, { width: px(s), height: px(s), background: c, boxShadow: `0 0 ${s * 1.5}px ${c}` });
    particles.push({ el: e, b, s, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7 - 120, vz: 200 + r() * 600, life: 0.7 + r() * 0.5 });
  }
});

const shadow = h("div", "", world); shadow.id = "shadow";
const bro = h("div", "", world); bro.id = "bro";
const broCv = h("canvas", "", bro); broCv.width = 600; broCv.height = 600;
const bctx = broCv.getContext("2d");

// --------------------------------------------------------------- the hero --
// Bro, the IdeaBro lightbulb. Units are UI px, origin at his feet.
function bulbPath(c) {
  c.beginPath();
  c.moveTo(-21, -34);
  c.bezierCurveTo(-24, -46, -44, -56, -44, -78);
  c.arc(0, -78, 44, Math.PI, 0);
  c.bezierCurveTo(44, -56, 24, -46, 21, -34);
  c.closePath();
}
function drawBro(c, s) {
  const vol = s.vol ?? 1;
  c.save();
  c.rotate(s.lean || 0);
  c.scale(s.sx || 1, s.sy || 1);
  c.translate(0, -70); c.rotate(s.rot || 0); c.translate(0, 70);
  c.lineJoin = c.lineCap = "round";

  if (vol < 1) {                        // sticker border: a flat PNG layer
    c.save();
    c.globalAlpha = 1 - vol;
    c.fillStyle = c.strokeStyle = "#fff";
    c.lineWidth = 14;
    bulbPath(c); c.fill(); c.stroke();
    rr(c, -22, -38, 44, 26, 6); c.fill(); c.stroke();
    rr(c, -16, -16, 32, 18, 6); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-46, -68, 9, 13, 0.3, 0, 7); c.ellipse(46, -68, 9, 13, -0.3, 0, 7); c.fill(); c.stroke();
    c.restore();
  }
  const leg = (x, ang) => {
    c.save(); c.translate(x, -15); c.rotate(ang);
    c.fillStyle = "#2a2635"; rr(c, -5, 0, 10, 13, 4); c.fill();
    c.beginPath(); c.ellipse(x < 0 ? -2 : 2, 13, 7.5, 4.5, 0, 0, 7); c.fill();
    c.restore();
  };
  leg(-9, (s.kick || 0) * 0.15);
  leg(9, -(s.kick || 0) * 1.35);

  const arm = (side, up) => {
    c.save(); c.translate(side * 42, -70); c.rotate(side * (0.35 - up));
    c.fillStyle = vol > 0.5 ? "#f6b02a" : "#ffc93c";
    rr(c, side > 0 ? -2 : -22, -7, 24, 14, 7); c.fill();
    c.restore();
  };
  arm(-1, 0);
  if (!s.wave) arm(1, 0);

  // screw base
  const mg = c.createLinearGradient(-20, 0, 20, 0);
  mg.addColorStop(0, "#5b6170"); mg.addColorStop(0.35, "#e2e6ee"); mg.addColorStop(0.6, "#a3aab8"); mg.addColorStop(1, "#4b5160");
  c.fillStyle = vol > 0.01 ? mg : "#b9bfcc";
  rr(c, -20, -37, 40, 23, 6); c.fill();
  c.strokeStyle = "rgba(30,30,45,.45)"; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-19, -29); c.lineTo(19, -27); c.moveTo(-19, -22); c.lineTo(19, -20); c.stroke();
  c.fillStyle = "#2a2635"; c.beginPath(); c.ellipse(0, -14, 9, 4, 0, 0, 7); c.fill();

  // glass body
  bulbPath(c);
  c.fillStyle = "#ffc93c"; c.fill();
  if (vol > 0) {
    c.save(); c.globalAlpha = vol;
    const g = c.createRadialGradient(-16, -98, 4, 0, -72, 72);
    g.addColorStop(0, "#fff8d6"); g.addColorStop(0.35, "#ffd75e"); g.addColorStop(0.75, "#f6a823"); g.addColorStop(1, "#c9730a");
    c.fillStyle = g; bulbPath(c); c.fill();
    c.restore();
  }
  if (s.glow > 0) {
    c.save(); c.globalCompositeOperation = "lighter";
    const g = c.createRadialGradient(0, -78, 2, 0, -78, 56);
    g.addColorStop(0, `rgba(255,250,220,${0.75 * s.glow})`); g.addColorStop(1, "rgba(255,200,60,0)");
    c.fillStyle = g; bulbPath(c); c.fill();
    c.restore();
  }
  // filament
  c.strokeStyle = s.glow > 0.2 ? `rgba(255,255,240,${0.4 + 0.6 * s.glow})` : "rgba(170,80,10,.35)";
  c.lineWidth = 2.4;
  c.beginPath(); c.moveTo(-7, -38); c.lineTo(-7, -52); c.lineTo(-3, -57); c.lineTo(0, -52); c.lineTo(3, -57); c.lineTo(7, -52); c.lineTo(7, -38); c.stroke();
  // light
  if (vol > 0) {
    c.save(); c.globalAlpha = vol;
    c.strokeStyle = "rgba(196,181,253,.75)"; c.lineWidth = 3;
    c.beginPath(); c.arc(0, -78, 41.5, -0.5, 0.95); c.stroke();
    c.fillStyle = "rgba(255,255,255,.9)";
    c.beginPath(); c.ellipse(-21, -99, 7.5, 13, 0.6, 0, 7); c.fill();
    c.beginPath(); c.arc(-8, -114, 3, 0, 7); c.fill();
    c.restore();
  }
  // face
  c.fillStyle = "rgba(255,110,110,.35)";
  c.beginPath(); c.ellipse(-25, -68, 7, 4.5, 0, 0, 7); c.ellipse(25, -68, 7, 4.5, 0, 0, 7); c.fill();
  c.fillStyle = c.strokeStyle = "#1d1726";
  for (const ex of [-13, 13]) {
    if (s.eyes === "happy") {
      c.lineWidth = 4.5; c.beginPath(); c.moveTo(ex - 6, -76); c.lineTo(ex, -84); c.lineTo(ex + 6, -76); c.stroke();
    } else {
      const eh = 19 * (s.blink ?? 1);
      rr(c, ex - 4, -80 - eh / 2, 8, Math.max(2, eh), 4); c.fill();
      if (eh > 8) { c.fillStyle = "#fff"; c.beginPath(); c.arc(ex - 1.2, -84, 1.6, 0, 7); c.fill(); c.fillStyle = "#1d1726"; }
    }
  }
  if (s.wave) arm(1, s.wave);
  c.restore();
}

// --------------------------------------------------------------- footage --
const FOOT = (() => {
  const r = rnd(9);
  const city = [0, 1, 2].map((L) => {
    const b = []; let x = -200;
    while (x < 2000) {
      const w = 60 + r() * 120, hh = 160 + r() * (260 + L * 120) - L * 40;
      const wins = [];
      for (let i = 0; i < 40; i++) if (r() < 0.45) wins.push([r(), r(), r()]);
      b.push({ x, w, h: hh, wins }); x += w + 6 + r() * 20;
    }
    return b;
  });
  const stars = Array.from({ length: 90 }, () => [r() * 1600, r() * 380, r() * 1.8 + 0.4]);
  return { city, stars };
})();

function footSunrise(c, lt) {
  const g = c.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, "#0d2944"); g.addColorStop(0.42, "#33597c"); g.addColorStop(0.7, "#ff9658"); g.addColorStop(1, "#ffd08e");
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  const sy = 600 - lt * 45;
  let rg = c.createRadialGradient(1000, sy, 10, 1000, sy, 520);
  rg.addColorStop(0, "rgba(255,214,140,.95)"); rg.addColorStop(0.25, "rgba(255,160,90,.45)"); rg.addColorStop(1, "rgba(255,140,80,0)");
  c.fillStyle = rg; c.fillRect(0, 0, CW, CH);
  c.fillStyle = "#fff3d0"; c.beginPath(); c.arc(1000, sy, 70, 0, 7); c.fill();
  const cols = ["#2d566b", "#173c4d", "#0a2431"];
  cols.forEach((col, i) => {
    const base = 590 + i * 95, amp = 70 - i * 12, sh = lt * (14 + i * 30);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, CH);
    for (let x = 0; x <= CW; x += 16) {
      const X = x + sh;
      c.lineTo(x, base - amp * (0.6 * Math.sin(X * 0.0042 + i * 1.7) + 0.4 * Math.sin(X * 0.011 + i * 2.3)));
    }
    c.lineTo(CW, CH); c.fill();
  });
}
function footCity(c, lt) {
  const g = c.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, "#04121b"); g.addColorStop(0.6, "#0e3346"); g.addColorStop(1, "#1d5462");
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  c.fillStyle = "#cfe8ff";
  for (const [x, y, s] of FOOT.stars) { c.globalAlpha = 0.35 + 0.3 * Math.sin(x + lt * 3); c.fillRect(x, y, s, s); }
  c.globalAlpha = 1;
  const cols = ["#0e2c3a", "#081d27", "#030c12"];
  FOOT.city.forEach((layer, L) => {
    const sh = -lt * (20 + L * 45) - 100;
    for (const b of layer) {
      const x = b.x + sh, top = CH - b.h - (2 - L) * 70;
      c.fillStyle = cols[L]; c.fillRect(x, top, b.w, CH - top);
      if (L > 0) for (const [u, v, k] of b.wins) {
        c.fillStyle = k > 0.8 ? "rgba(120,230,255,.85)" : "rgba(255,176,92,.85)";
        c.fillRect(x + 8 + u * (b.w - 22), top + 14 + v * (b.h - 40), 7, 10);
      }
    }
  });
  const ng = c.createRadialGradient(1180, 380, 5, 1180, 380, 160);
  ng.addColorStop(0, "rgba(255,90,170,.8)"); ng.addColorStop(1, "rgba(255,90,170,0)");
  c.fillStyle = ng; c.fillRect(1000, 220, 360, 320);
  const hz = c.createLinearGradient(0, 700, 0, CH);
  hz.addColorStop(0, "rgba(255,138,61,0)"); hz.addColorStop(1, "rgba(255,138,61,.35)");
  c.fillStyle = hz; c.fillRect(0, 700, CW, 200);
}
function footOcean(c, lt) {
  const g = c.createLinearGradient(0, 0, 0, 430);
  g.addColorStop(0, "#173a57"); g.addColorStop(0.65, "#c9776a"); g.addColorStop(1, "#ffb072");
  c.fillStyle = g; c.fillRect(0, 0, CW, 430);
  c.fillStyle = "#ffe3b0"; c.beginPath(); c.arc(560, 430, 90, Math.PI, 0); c.fill();
  const sg = c.createLinearGradient(0, 430, 0, CH);
  sg.addColorStop(0, "#14606e"); sg.addColorStop(1, "#04212a");
  c.fillStyle = sg; c.fillRect(0, 430, CW, CH - 430);
  for (let i = 0; i < 26; i++) {
    const y = 440 + i * i * 0.75, w = 30 + i * 9;
    c.fillStyle = `rgba(255,190,120,${0.75 - i * 0.025})`;
    c.fillRect(560 - w / 2 + Math.sin(i * 1.7 + lt * 6) * (6 + i), y, w, 3 + i * 0.25);
  }
  c.strokeStyle = "rgba(150,230,240,.35)"; c.lineWidth = 3;
  for (let k = 0; k < 9; k++) {
    const y0 = 470 + k * k * 6.2;
    c.beginPath();
    for (let x = 0; x <= CW; x += 20) c.lineTo(x, y0 + Math.sin(x * 0.01 + lt * (2 + k * 0.3) + k) * (3 + k * 1.6));
    c.stroke();
  }
}
function drawEndCard(c, lt, mgOn, life) {
  c.fillStyle = "#0b0912"; c.fillRect(0, 0, CW, CH);
  const rg = c.createRadialGradient(800, 380, 10, 800, 420, 760);
  rg.addColorStop(0, "rgba(139,92,246,.55)"); rg.addColorStop(0.5, "rgba(76,29,149,.25)"); rg.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = rg; c.fillRect(0, 0, CW, CH);
  const slam = mgOn ? outBack(win(0.05, 0.4, lt), 2.2) : 1;
  if (mgOn) {                                  // light rays behind the bulb
    c.save(); c.translate(800, 300); c.rotate(life * 0.25);
    for (let i = 0; i < 14; i++) {
      c.rotate((Math.PI * 2) / 14);
      const gg = c.createLinearGradient(0, 0, 0, -620);
      gg.addColorStop(0, `rgba(255,201,60,${0.22 * slam})`); gg.addColorStop(1, "rgba(255,201,60,0)");
      c.fillStyle = gg; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-60, -620); c.lineTo(60, -620); c.lineTo(14, 0); c.fill();
    }
    c.restore();
  }
  c.save(); c.translate(800, 390); c.scale(1.55 * slam, 1.55 * slam);
  drawBro(c, { vol: 1, eyes: "happy", glow: 0.6 + 0.3 * Math.sin(life * 4) });
  c.restore();
  c.save(); c.translate(800, 545); c.scale(slam, slam);
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.font = "900 150px Inter"; c.letterSpacing = "2px";
  c.shadowColor = "rgba(255,201,60,.6)"; c.shadowBlur = 40;
  const tg = c.createLinearGradient(0, -120, 0, 10);
  tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#ffe08a");
  c.fillStyle = tg; c.fillText("VIBE EDITING", 0, 0);
  c.shadowBlur = 0;
  c.font = "700 40px Inter"; c.letterSpacing = "12px"; c.fillStyle = "#c4b5fd";
  c.globalAlpha = mgOn ? win(0.3, 0.6, lt) : 1;
  c.fillText("BY IDEABRO STUDIO", 0, 86);
  c.restore();
  c.letterSpacing = "0px";
}

// ---------------------------------------------------------------- timing --
function ctAt(t) {
  const S = TL.surf;
  if (t >= S.t0) {
    if (t <= S.rewind_end) return lerp(7.6, 0, inOut(win(S.t0, S.rewind_end, t)));
    if (t < S.play_t0) return 0;
    return lerp(0, TL.lane.edit_dur, win(S.play_t0, S.t1, t));
  }
  let ct = 0, prev = 0;
  for (const [kt, v, e] of TL.ct_keys) {
    if (t < kt) break;
    ct = e > 0 ? lerp(prev, v, outCubic(win(kt, kt + e, t))) : v;
    prev = v;
  }
  return ct;
}
const gradeWipe = (t) => inOut(win(TL.lut.wipe[0], TL.lut.wipe[1], t));

function broState(t) {
  const B = TL.bro;
  const s = { x: 0, y: 0, z: 0, h: 0, sx: 1, sy: 1, rot: 0, lean: 0, kick: 0, wave: 0, eyes: "open", blink: 1, glow: 0, vol: 1, mode: "live" };
  [s.x, s.y, s.z] = spot("comp");
  if (t < B.peel[0]) { s.mode = "sticker"; s.vol = 0; return s; }
  if (t < B.pop + 0.1) { s.mode = "peel"; s.vol = ss(1.88, 2.02, t); }

  let hop = null, last = null, next = null;
  for (const hp of TL.hops) {
    if (t >= hp.t1) last = hp;
    else if (t >= hp.t0) { hop = hp; break; }
    else { next = hp; break; }
  }
  if (last) [s.x, s.y, s.z] = spot(last.b);
  const S = TL.surf;
  const surfing = t >= S.t0 && t < TL.hops[9].t0;
  if (surfing) {
    s.x = laneX(ctAt(t)); s.y = TL.ruler_y; s.z = spot("playhead_a")[2];
    if (t < S.rewind_end) s.lean = -0.22 * Math.sin(Math.PI * win(S.t0, S.rewind_end, t));
    else if (t >= S.play_t0) s.lean = 0.16 + 0.05 * Math.sin(t * 22);
  }
  if (hop) {
    const a = spot(hop.a), b = spot(hop.b), u = win(hop.t0, hop.t1, t);
    s.x = lerp(a[0], b[0], u); s.y = lerp(a[1], b[1], u); s.z = lerp(a[2], b[2], u);
    s.h = hop.apex * 4 * u * (1 - u);
    s.sx = 0.94; s.sy = 1.07;
    if (hop.flip) s.rot = (b[0] < a[0] ? -1 : 1) * Math.PI * 2 * inOut(u);
  } else {
    if (next && t > next.t0 - 0.1) {
      const w = win(next.t0 - 0.1, next.t0, t);
      s.sy = 1 - 0.17 * w; s.sx = 1 + 0.1 * w;
    }
    const land = last ? last.t1 : t >= B.pop ? B.pop : null;
    if (land != null && t - land < 0.45) {
      const k = t - land;
      s.sy *= 1 - 0.22 * Math.exp(-k * 10) * Math.cos(k * 24);
      s.sx *= 1 + 0.16 * Math.exp(-k * 10) * Math.cos(k * 24);
    } else if (t > B.pop && !surfing) {
      s.sy *= 1 + 0.025 * Math.sin(t * Math.PI * 4);   // bob on the beat
    }
  }
  const K = B.kick;
  s.kick = t < K ? ss(K - 0.14, K, t) : 1 - ss(K + 0.06, K + 0.3, t);
  s.lean += -0.2 * s.kick;
  if (t >= B.wave[0]) s.wave = ss(B.wave[0], B.wave[0] + 0.15, t) * (1.95 + 0.5 * Math.sin((t - B.wave[0]) * 15));
  if ((t >= TL.t.vibe && t < TL.t.vibe + 0.3) || t >= TL.hops[10].t1) s.eyes = "happy";
  for (const b of B.blinks) if (Math.abs(t - b) < 0.06) s.blink = 0.12;
  for (const hp of TL.hops) if (hp.press) s.glow += 0.8 * pulse(t, hp.t1, 5);
  s.glow += pulse(t, B.pop, 3) + 0.6 * pulse(t, TL.t.vibe, 1.5);
  if (t >= TL.hops[10].t1) s.glow += 0.45;
  s.glow = clamp(s.glow);
  return s;
}

function keyCam(t) {
  const K = TL.camera;
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 0; i < K.length - 1; i++) {
    if (t < K[i + 1][0]) {
      const u = smoother(win(K[i][0], K[i + 1][0], t));
      return K[i].slice(1).map((v, j) => lerp(v, K[i + 1][j + 1], u));
    }
  }
  return K[K.length - 1].slice(1);
}
function camAt(t) {
  let [fx, fy, z, tilt, fol] = keyCam(t);
  let bx = 0, by = 0;
  for (let i = 0; i < 10; i++) {               // the camera lags Bro a little
    const s = broState(Math.max(0, t - i * 0.03));
    bx += s.x; by += s.y - s.h * 0.55 - 120;
  }
  fx = lerp(fx, bx / 10, fol); fy = lerp(fy, by / 10, fol);
  for (const [st, amp] of TL.shakes) {
    if (t >= st) { const k = t - st, a = amp * Math.exp(-k * 7); fx += a * Math.sin(k * 61); fy += a * Math.cos(k * 47); }
  }
  return { fx, fy, z, tilt, ry: -(fx - 960) / 960 * 4 };
}

// ------------------------------------------------------------------ comp --
const off = document.createElement("canvas"); off.width = CW; off.height = CH;
const ox = off.getContext("2d");
const toComp = (x, y) => [(x - CX) * CS, (y - CY) * CS];

const cracks = (() => {
  const r = rnd(3), [x0, y0] = toComp(spot("comp")[0], spot("comp")[1] - 40), out = [];
  for (let i = 0; i < 13; i++) {
    let a = (i / 13) * Math.PI * 2 + r() * 0.3, x = x0, y = y0;
    const pts = [[x, y]];
    const len = 260 + r() * 520;
    for (let k = 0; k < 6; k++) { a += (r() - 0.5) * 0.5; x += Math.cos(a) * len / 6; y += Math.sin(a) * len / 6; pts.push([x, y]); }
    out.push(pts);
  }
  return { x0, y0, rays: out };
})();

function drawFootage(c, ct, life) {
  const idx = Math.min(3, Math.floor(ct / 2)), lt = ct - idx * 2;
  c.save();
  const kb = 1 + 0.045 * (lt / 2);
  c.translate(CW / 2, CH / 2); c.scale(kb, kb); c.translate(-CW / 2, -CH / 2);
  if (idx === 0) footSunrise(c, lt);
  else if (idx === 1) footCity(c, lt);
  else if (idx === 2) footOcean(c, lt);
  else drawEndCard(c, lt, life >= TL.t.mg, life);
  c.restore();
  return { idx, lt };
}

function drawCaptions(c, ct, t) {
  const on = ss(TL.t.captions, TL.t.captions + 0.2, t);
  const L = TL.edit.captions;
  let li = -1;
  const ends = [1.95, 3.95, 5.95];
  for (let i = 0; i < L.length; i++) if (ct >= L[i][0][1] && ct < ends[i]) li = i;
  if (li < 0) return;
  const line = L[li];
  c.save();
  c.font = "900 78px Inter"; c.textBaseline = "alphabetic";
  const gap = 24, widths = line.map(([w]) => c.measureText(w).width);
  let x = CW / 2 - (widths.reduce((a, b) => a + b, 0) + gap * (line.length - 1)) / 2;
  const y = 800;
  let cur = 0;
  line.forEach(([, et], i) => { if (ct >= et) cur = i; });
  line.forEach(([w, et], i) => {
    if (ct >= et) {
      const p = outBack(win(et, et + 0.16, ct), 2.4) * on;
      const active = i === cur;
      c.save();
      c.translate(x + widths[i] / 2, y - 28); c.scale(p * (active ? 1.08 : 1), p * (active ? 1.08 : 1));
      if (active) c.rotate(-0.03);
      c.lineWidth = 14; c.strokeStyle = "rgba(10,8,16,.92)"; c.lineJoin = "round";
      c.strokeText(w, -widths[i] / 2, 28);
      c.fillStyle = active ? "#ffc93c" : "#ffffff";
      c.shadowColor = active ? "rgba(255,201,60,.7)" : "transparent"; c.shadowBlur = active ? 24 : 0;
      c.fillText(w, -widths[i] / 2, 28);
      c.restore();
    }
    x += widths[i] + gap;
  });
  c.restore();
}

function star(c, x, y, r, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
  for (let i = 0; i < 8; i++) { const rr2 = i % 2 ? r * 0.28 : r; const a = (i / 8) * Math.PI * 2; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
  c.closePath(); c.fill(); c.restore();
}

function drawMG(c, ct, t) {
  const on = ss(TL.t.mg, TL.t.mg + 0.25, t);
  c.save(); c.globalAlpha = on;
  if (ct >= 0.1 && ct < 1.95) {                         // title
    c.textAlign = "left"; c.font = "900 132px Inter";
    const word = "VIBE EDITING", ws = c.measureText(word).width;
    let x = CW / 2 - ws / 2;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i], w = c.measureText(ch).width;
      const p = clamp((ct - 0.1 - i * 0.03) / 0.25);
      c.save(); c.globalAlpha = on * p;
      c.translate(0, (1 - outBack(p)) * 70);
      c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 24;
      const g = c.createLinearGradient(0, 200, 0, 330);
      g.addColorStop(0, "#fff"); g.addColorStop(1, "#ffe08a");
      c.fillStyle = g; c.fillText(ch, x, 330);
      c.restore();
      x += w;
    }
    c.font = "800 30px Inter"; c.letterSpacing = "8px"; c.textAlign = "center";
    const kp = win(0.15, 0.4, ct);
    c.globalAlpha = on * kp;
    c.fillStyle = "rgba(139,92,246,.9)"; rr(c, CW / 2 - 230, 150, 460, 54, 27); c.fill();
    c.fillStyle = "#fff"; c.fillText("AI · FULL-STACK EDIT", CW / 2 + 4, 188);
    c.letterSpacing = "0px";
    const sp = win(0.35, 0.8, ct);
    c.globalAlpha = on;
    c.strokeStyle = "#ffc93c"; c.lineWidth = 12; c.lineCap = "round";
    c.shadowColor = "rgba(255,201,60,.8)"; c.shadowBlur = 20;
    c.setLineDash([900 * sp, 2000]);
    c.beginPath(); c.moveTo(CW / 2 - 400, 380); c.bezierCurveTo(CW / 2 - 150, 420, CW / 2 + 150, 340, CW / 2 + 410, 372); c.stroke();
    c.setLineDash([]);
    if (ct > 0.75) { c.fillStyle = "#fff"; star(c, CW / 2 + 430, 362, 34 * outBack(win(0.75, 0.95, ct), 3), ct * 2); }
    c.shadowBlur = 0;
  }
  if (ct >= 2.15 && ct < 3.95) {                        // lower third
    const p = outCubic(win(2.15, 2.45, ct));
    const x = lerp(-520, 70, p);
    c.fillStyle = "rgba(18,14,28,.88)"; rr(c, x, 140, 520, 104, 52); c.fill();
    c.strokeStyle = "rgba(167,139,250,.9)"; c.lineWidth = 3; c.stroke();
    const bg2 = c.createRadialGradient(x + 52, 180, 4, x + 52, 192, 34);
    bg2.addColorStop(0, "#fff6c4"); bg2.addColorStop(1, "#f59e0b");
    c.fillStyle = bg2; c.beginPath(); c.arc(x + 54, 192, 30, 0, 7); c.fill();
    c.fillStyle = "#fff"; c.font = "800 38px Inter"; c.textAlign = "left"; c.fillText("IdeaBro Studio", x + 104, 188);
    c.fillStyle = "#b8b2cc"; c.font = "600 24px Inter"; c.fillText("AI-powered vibe editing", x + 104, 222);
  }
  if (ct >= 4.15 && ct < 5.95) {                        // badge
    const p = outBack(win(4.15, 4.45, ct), 2.5);
    c.save(); c.translate(1340, 210); c.rotate(-0.15 + ct * 0.4); c.scale(p, p);
    c.fillStyle = "#ffc93c"; c.shadowColor = "rgba(255,201,60,.7)"; c.shadowBlur = 30;
    c.beginPath();
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, r2 = i % 2 ? 118 : 140; c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); }
    c.fill(); c.restore();
    c.save(); c.translate(1340, 210); c.rotate(-0.12); c.scale(p, p);
    c.fillStyle = "#1a1225"; c.textAlign = "center"; c.font = "900 76px Inter"; c.fillText("10×", 0, 14);
    c.font = "800 26px Inter"; c.fillText("FASTER", 0, 52);
    c.restore();
  }
  c.restore();
}

function drawEmpty(c, t) {
  for (let y = 0; y < CH; y += 50) for (let x = 0; x < CW; x += 50) {
    c.fillStyle = ((x + y) / 50) % 2 ? "#121019" : "#0e0c14"; c.fillRect(x, y, 50, 50);
  }
  c.fillStyle = "#5b5570"; c.font = "600 30px Inter"; c.textAlign = "center";
  c.fillText("Empty comp · type a vibe →", CW / 2, 90);
  const [sx, sy] = toComp(spot("comp")[0], spot("comp")[1]);
  const box = [sx - 60 * CS, sy - 128 * CS, 120 * CS, 134 * CS];
  if (t < TL.bro.peel[0]) {
    let k = 1, dx = 0;
    for (const kt of TL.bro.knocks) { k += 0.07 * pulse(t, kt, 12); dx += 10 * pulse(t, kt, 18) * Math.sin((t - kt) * 70); }
    c.save(); c.translate(sx + dx, sy); c.scale(CS * k, CS * k); drawBro(c, { vol: 0, eyes: "open" }); c.restore();
    for (const kt of TL.bro.knocks) if (t >= kt && t < kt + 0.45) {
      const u = (t - kt) / 0.45;
      c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - u)})`; c.lineWidth = 6 * (1 - u) + 1;
      c.beginPath(); c.arc(sx, sy - 70 * CS, 40 + u * 420, 0, 7); c.stroke();
    }
    c.strokeStyle = "#8b5cf6"; c.lineWidth = 3; c.setLineDash([12, 8]);
    c.strokeRect(...box); c.setLineDash([]);
    for (const [hx, hy] of [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]]) {
      c.fillStyle = "#fff"; c.fillRect(box[0] + hx * box[2] - 9, box[1] + hy * box[3] - 9, 18, 18);
      c.strokeStyle = "#8b5cf6"; c.lineWidth = 3; c.strokeRect(box[0] + hx * box[2] - 9, box[1] + hy * box[3] - 9, 18, 18);
    }
    c.fillStyle = "#8b5cf6"; rr(c, box[0], box[1] - 56, 230, 42, 8); c.fill();
    c.fillStyle = "#fff"; c.font = "700 24px Inter"; c.textAlign = "left"; c.fillText("Layer 1 · bro.png", box[0] + 14, box[1] - 27);
  } else {
    c.strokeStyle = "rgba(139,92,246,.6)"; c.lineWidth = 3; c.setLineDash([12, 8]);
    c.strokeRect(...box); c.setLineDash([]);
  }
}

function drawComp(t) {
  const c = cx;
  c.save();
  c.clearRect(0, 0, CW, CH);
  let ct = 0;
  if (t < TL.t.cut) drawEmpty(c, t);
  else {
    ct = ctAt(t);
    ox.clearRect(0, 0, CW, CH);
    drawFootage(ox, ct, t);
    let z = 1;
    const playing = t >= TL.surf.play_t0 && t < TL.surf.t1;
    if (playing) z += 0.025 * Math.exp(-((ct % 0.5) * 9));
    for (const s of TL.edit.sfx) if (t >= s.t) { const d = ct - s.et; if (d > -0.06 && d < 0.2) z += 0.08 * (1 - Math.abs(d) / 0.2); }
    c.save();
    c.translate(CW / 2, CH / 2); c.scale(z, z); c.translate(-CW / 2, -CH / 2);
    const wp = gradeWipe(t);
    if (wp < 1) { c.filter = "saturate(0.3) contrast(0.74) brightness(1.12)"; c.drawImage(off, 0, 0); c.filter = "none"; }
    if (wp > 0) {
      c.save(); c.beginPath(); c.rect(0, 0, CW * wp, CH); c.clip();
      c.filter = "saturate(1.3) contrast(1.12)"; c.drawImage(off, 0, 0); c.filter = "none";
      const v = c.createRadialGradient(CW / 2, CH / 2, 300, CW / 2, CH / 2, 980);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,10,20,.55)");
      c.fillStyle = v; c.fillRect(0, 0, CW, CH);
      c.restore();
      if (wp < 1) {
        const g = c.createLinearGradient(CW * wp - 60, 0, CW * wp + 10, 0);
        g.addColorStop(0, "rgba(34,211,238,0)"); g.addColorStop(0.7, "rgba(34,211,238,.6)"); g.addColorStop(1, "rgba(255,255,255,.95)");
        c.fillStyle = g; c.fillRect(CW * wp - 60, 0, 70, CH);
      }
    }
    c.restore();
    if (t >= TL.t.mg) drawMG(c, ct, t);
    if (t >= TL.t.captions) drawCaptions(c, ct, t);
    for (const s of TL.edit.sfx) if (t >= s.t) {
      const d = ct - s.et;
      if (d > -0.06 && d < 0.14) { c.fillStyle = `rgba(255,255,255,${0.35 * (1 - Math.abs(d) / 0.14)})`; c.fillRect(0, 0, CW, CH); }
    }
    if (t < TL.t.cut + 0.25) { c.fillStyle = `rgba(255,255,255,${0.5 * (1 - win(TL.t.cut, TL.t.cut + 0.25, t))})`; c.fillRect(0, 0, CW, CH); }
  }
  if (t >= TL.bro.pop && t < 2.75) {                    // cracked glass
    const a = 1 - ss(2.45, 2.72, t);
    const grow = outCubic(win(TL.bro.pop, TL.bro.pop + 0.12, t));
    c.save(); c.lineJoin = "round";
    for (const pass of [[9, `rgba(0,0,0,${0.5 * a})`], [3, `rgba(255,255,255,${0.95 * a})`]]) {
      c.lineWidth = pass[0]; c.strokeStyle = pass[1];
      for (const ray of cracks.rays) {
        c.beginPath();
        const n = Math.max(1, Math.round(ray.length * grow));
        ray.slice(0, n).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.stroke();
      }
      for (const R of [110, 250]) { c.beginPath(); c.arc(cracks.x0, cracks.y0, R * grow, 0, 7); c.stroke(); }
    }
    const fl = pulse(t, TL.bro.pop, 9);
    c.fillStyle = `rgba(255,255,255,${0.35 * fl})`; c.fillRect(0, 0, CW, CH);
    c.restore();
  }
  if (t >= TL.lut.hit && t < TL.lut.hit + 0.4) {
    c.fillStyle = `rgba(160,240,255,${0.35 * pulse(t, TL.lut.hit, 8)})`; c.fillRect(0, 0, CW, CH);
  }
  if (t >= TL.t.vibe) {
    c.fillStyle = `rgba(255,255,255,${0.5 * pulse(t, TL.t.vibe, 7)})`; c.fillRect(0, 0, CW, CH);
    const p = outBack(win(TL.t.vibe + 0.1, TL.t.vibe + 0.4, t));
    c.save(); c.translate(CW - 60, 60); c.scale(p, p);
    c.fillStyle = "rgba(16,185,129,.95)"; rr(c, -330, 0, 330, 64, 32); c.fill();
    c.fillStyle = "#fff"; c.font = "800 28px Inter"; c.textAlign = "center"; c.fillText("✓  EXPORTED · 4K", -165, 42);
    c.restore();
  }
  c.restore();
  return ct;
}

// ----------------------------------------------------------- static draws --
function drawStatics() {
  const footAt = [footSunrise, footCity, footOcean];
  for (const { cv, kind } of Object.values(thumbs)) {
    const c = cv.getContext("2d");
    c.save(); c.scale(cv.width / CW, cv.height / CH);
    c.filter = "saturate(0.3) contrast(0.74) brightness(1.12)";
    if (typeof kind === "number") (kind < 3 ? footAt[kind] : (cc, lt) => drawEndCard(cc, lt, false, 0))(c, 1);
    c.restore();
    c.filter = "none";
    if (kind === "bro") {
      for (let y = 0; y < 172; y += 16) for (let x = 0; x < 304; x += 16) { c.fillStyle = ((x + y) / 16) % 2 ? "#2a2735" : "#1d1a26"; c.fillRect(x, y, 16, 16); }
      c.save(); c.translate(152, 162); c.scale(1.1, 1.1); drawBro(c, { vol: 0 }); c.restore();
    }
    if (kind === "wav") {
      c.fillStyle = "#1b1426"; c.fillRect(0, 0, 304, 172);
      c.fillStyle = "#f472b6";
      const r = rnd(5);
      for (let x = 0; x < 304; x += 4) { const a = (0.25 + 0.75 * Math.exp(-((x % 38) / 38) * 4)) * (0.5 + r() * 0.5) * 60; c.fillRect(x, 86 - a, 3, a * 2); }
    }
  }
  for (const v of tlClips.V1) {
    const c = v.cv.getContext("2d"), fw = 48 * 16 / 9;
    for (let x = 0; x < v.cv.width; x += fw) {
      c.save(); c.translate(x, 0); c.scale(fw / CW, 48 / CH);
      if (v.i < 3) footAt[v.i](c, (x / v.cv.width) * 2); else drawEndCard(c, 1, false, 0);
      c.restore();
    }
  }
  const wc = tlClips.A1.getContext("2d"), r = rnd(11);
  wc.fillStyle = "#ffd1e8";
  for (let x = 0; x < wc.canvas.width; x += 3) {
    const et = x / TL.pps, beat = (et % 0.5) / 0.5;
    const a = (et < 1.0 ? 0.25 : 0.4 + 0.6 * Math.exp(-beat * 5)) * (0.55 + r() * 0.45) * 20;
    wc.fillRect(x, 24 - a, 2, a * 2);
  }
  for (const s of tlClips.SFX) {
    const c = s.cv.getContext("2d"), r2 = rnd(s.s.et * 10 + 1);
    c.fillStyle = "rgba(255,230,210,.9)";
    for (let x = 0; x < 190; x += 3) { const env = Math.exp(-Math.abs(x - 80) / 45) * (0.5 + r2() * 0.5) * 20; c.fillRect(x, 24 - env, 2, env * 2); }
  }
}

// ---------------------------------------------------------------- render --
const LOG = [
  [TL.t.cut, "Cut 4 clips to the beat · 120 BPM"],
  [TL.t.captions, "11 kinetic captions, word-synced"],
  [TL.t.mg, "Title, lower third, badge, logo slam"],
  [TL.lut.hit, "Look: Teal &amp; Orange on every clip"],
  [TL.edit.sfx[3].t, "4 SFX hits locked to the cuts"],
  [TL.t.vibe, "Exported 4K · 8.0 s · ready to post"],
];
const pressT = {};
for (const hp of TL.hops) if (hp.press) pressT[hp.press] = hp.t1;

function fmtTC(ct) {
  const f = Math.floor(ct * 30 + 1e-6), s = Math.floor(f / 30), ff = f % 30;
  return `00:00:${String(s).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
}

window.renderAt = function renderAt(t) {
  const cam = camAt(t);
  world.style.transform =
    `translate3d(960px,540px,${cam.z}px) rotateX(${cam.tilt}deg) rotateY(${cam.ry}deg) translate3d(${-cam.fx}px,${-cam.fy}px,0)`;
  for (const b of bokeh) b.el.style.transform = `translate(${b.x - cam.fx * b.d * 3}px,${b.y - cam.fy * b.d * 2}px)`;

  // panels: focus blur, power down, fall
  const zoomK = clamp((cam.z - 150) / 250);
  for (const [name, s] of Object.entries(slabs)) {
    const dx = Math.max(s.x - cam.fx, 0, cam.fx - (s.x + s.w)), dy = Math.max(s.y - cam.fy, 0, cam.fy - (s.y + s.h));
    const blur = clamp((Math.hypot(dx, dy) - 120) / 600) * 2.6 * zoomK;
    s.face.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : "none";
    const pd = TL.power_down.find(([n]) => n === name);
    let dz = 0, rx = 0, op = 1;
    if (pd) {
      const tp = pd[1];
      s.off.style.opacity = (0.94 * ss(tp, tp + 0.16, t)).toFixed(3);
      const sc = t >= tp && t < tp + 0.3;
      s.scan.style.opacity = sc ? (1 - win(tp + 0.12, tp + 0.3, t)).toFixed(3) : 0;
      s.scan.style.transform = `scaleX(${1 - ss(tp + 0.06, tp + 0.28, t)})`;
      const u = clamp((t - tp - 0.18) / 0.8);
      dz = -1500 * u * u; rx = (name === "topbar" ? -1 : 1) * 38 * u * u; op = 1 - ss(0.55, 1, u);
    }
    s.el.style.transform = `translateZ(${dz}px) rotateX(${rx}deg)`;
    s.face.style.opacity = s.base.style.opacity = op;
  }
  const endGlow = ss(TL.t.vibe, TL.t.vibe + 1.2, t);
  slabs.preview.face.style.boxShadow =
    `0 0 ${20 + 90 * endGlow}px rgba(139,92,246,${0.15 + 0.45 * endGlow}), inset 0 1px 0 rgba(255,255,255,.07)`;

  // copilot
  const n = TL.prompt_text.length, typed = Math.floor(n * win(TL.t.type[0], TL.t.type[1], t));
  const caretOn = t < TL.t.type[1] + 0.1 || Math.floor(t * 4) % 2 === 0;
  promptEl.innerHTML = TL.prompt_text.slice(0, typed) + (caretOn ? '<span class="caret"></span>' : "");
  for (const [k, ch] of Object.entries(chips)) {
    const pt = pressT[k];
    const on = pt != null && t >= pt;
    const p = pt != null ? pulse(t, pt, 14) : 0;
    ch.el.style.transform = `scale(${1 - 0.07 * p})`;
    ch.el.style.background = on ? "#3a2d66" : "#241f35";
    ch.el.style.borderColor = on ? "rgba(167,139,250,.9)" : "rgba(255,255,255,.08)";
    ch.el.style.boxShadow = on ? `0 0 ${18 + 30 * p}px rgba(139,92,246,${0.45 + 0.4 * p})` : "none";
    ch.ok.style.opacity = on ? 1 : 0;
    ch.ic.style.background = on ? "#8b5cf6" : "#322b4a";
    ch.ic.style.color = on ? "#fff" : "#a78bfa";
  }
  const shown = LOG.filter(([lt]) => t >= lt).slice(-4);
  logEl.innerHTML = shown.map(([lt, s]) => `<div style="opacity:${win(lt, lt + 0.15, t).toFixed(2)};transform:translateX(${(1 - outCubic(win(lt, lt + 0.2, t))) * 20}px)"><span>✓</span>${s}</div>`).join("");
  {
    const p = pulse(t, TL.t.vibe, 10), done = t >= TL.t.vibe + 0.05;
    vibeBtn.style.transform = `scale(${1 - 0.06 * p})`;
    vibeBtn.innerHTML = done ? "✓ EXPORTED<small>4K · H.264 · 8.0 s · ready to post</small>" : "✦ VIBE IT<small>render the full edit from your prompt</small>";
    vibeBtn.style.background = done ? "linear-gradient(100deg,#059669,#10b981 50%,#34d399)" : "";
    vibeBtn.style.boxShadow = `0 0 ${34 + 80 * p}px rgba(${done ? "16,185,129" : "139,92,246"},${0.55 + 0.4 * p}), inset 0 1px 0 rgba(255,255,255,.3)`;
  }

  // media: the look
  {
    const pt = pressT.teal, on = t >= pt, p = pulse(t, pt, 14);
    looks.teal.style.transform = `scale(${1 - 0.07 * p})`;
    looks.teal.style.borderColor = on ? "rgba(34,211,238,.9)" : "rgba(255,255,255,.08)";
    looks.teal.style.boxShadow = on ? `0 0 ${16 + 30 * p}px rgba(34,211,238,.5)` : "none";
  }

  // timeline
  TL.edit.clips.forEach((_, i) => {
    const a = win(TL.t.cut + i * 0.06, TL.t.cut + i * 0.06 + 0.2, t), v = tlClips.V1[i];
    v.el.style.opacity = a; v.el.style.transform = `translateY(${(1 - outBack(a)) * -26}px)`;
    v.lut.style.opacity = ss(TL.lut.hit + i * 0.09, TL.lut.hit + 0.1 + i * 0.09, t);
  });
  tlClips.CAP.forEach((v, i) => { const a = win(TL.t.captions + i * 0.035, TL.t.captions + i * 0.035 + 0.15, t); v.el.style.opacity = a; v.el.style.transform = `scale(${0.6 + 0.4 * outBack(a)})`; });
  tlClips.MG.forEach((v, i) => { const a = win(TL.t.mg + i * 0.05, TL.t.mg + i * 0.05 + 0.18, t); v.el.style.opacity = a; v.el.style.transform = `scaleY(${outBack(a)})`; });
  tlClips.SFX.forEach((v) => { const a = win(v.s.t, v.s.t + 0.16, t); v.el.style.opacity = a; v.el.style.transform = `scale(${outBack(a, 3)})`; });

  const ct = drawComp(t);
  const phx = laneX(ct) - TL.panels.timeline[0];
  playhead.style.left = px(phx - 1);
  phandle.style.left = px(phx - 15);
  const phOn = pulse(t, TL.surf.t0, 4) + (t >= TL.surf.t0 && t < TL.surf.t1 ? 0.5 : 0);
  phandle.style.boxShadow = `0 0 ${16 + 30 * phOn}px rgba(255,201,60,.9)`;
  tcEl.textContent = fmtTC(ct);
  barEl.style.width = (100 * ct / TL.lane.edit_dur).toFixed(2) + "%";
  playIc.textContent = t >= TL.surf.play_t0 && t < TL.surf.t1 ? "❚❚" : "▶";

  // LUT card
  {
    const L = TL.lut, [fx2, fy2, fz2] = L.float, [tx, ty] = spot("teal");
    let vis = t >= L.pop && t < L.hit, x, y, z, sc = 1, rz = 0;
    if (t < L.kick) {
      const p = outBack(win(L.pop, L.pop + 0.2, t), 2.2);
      x = lerp(tx, fx2, win(L.pop, L.pop + 0.2, t)); y = lerp(ty, fy2, win(L.pop, L.pop + 0.2, t)); z = lerp(36, fz2, p);
      sc = 0.3 + 0.7 * p; z += 6 * Math.sin(t * 9);
    } else {
      const u = win(L.kick, L.hit, t);
      x = lerp(fx2, CX + CWu / 2, u); y = lerp(fy2, CY + CHu / 2, u); z = lerp(fz2, 30, u) + 180 * 4 * u * (1 - u);
      rz = 540 * u; sc = 1 - 0.45 * u;
    }
    lutCard.style.display = vis ? "flex" : "none";
    if (vis) lutCard.style.transform = `translate3d(${x - 85}px,${y - 32}px,${z}px) rotateX(${-cam.tilt}deg) rotateZ(${rz}deg) scale(${sc})`;
  }

  // shards
  for (const s of shards) {
    const age = t - TL.bro.pop;
    const vis = age >= 0 && age < 0.9;
    s.el.style.display = vis ? "block" : "none";
    if (vis) {
      const x = s.x + s.vx * age, y = s.y + s.vy * age + 300 * age * age, z = 30 + s.vz * age - 500 * age * age;
      s.el.style.opacity = (1 - win(0.5, 0.9, age)).toFixed(3);
      s.el.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${s.rx * age}deg) rotateY(${s.ry * age}deg) rotateZ(${s.rz * age}deg)`;
    }
  }
  // particles
  for (const p of particles) {
    const age = t - p.b.t, vis = age >= 0 && age < p.life;
    p.el.style.display = vis ? "block" : "none";
    if (vis) {
      const [bx, by, bz] = p.b.at;
      const x = bx + p.vx * age, y = by + p.vy * age + 260 * age * age, z = bz + p.vz * age - 700 * age * age;
      const k = 1 - win(p.life * 0.5, p.life, age);
      p.el.style.opacity = k.toFixed(3);
      p.el.style.transform = `translate3d(${x - p.s / 2}px,${y - p.s / 2}px,${Math.max(bz - 10, z)}px) scale(${0.4 + 0.6 * k})`;
    }
  }

  // Bro
  const s = broState(t);
  if (s.mode === "sticker") { bro.style.display = "none"; shadow.style.display = "none"; }
  else {
    bro.style.display = "block";
    let rx = -cam.tilt, z = s.z;
    if (s.mode === "peel" || t < TL.bro.pop + 0.1) {
      const p = ss(TL.bro.peel[0], TL.bro.peel[0] + 0.3, t), settle = ss(1.86, 2.05, t);
      rx = -(cam.tilt + 42) * p * (1 - settle) - cam.tilt * settle;
      z += 50 * p * (1 - settle);
      const pop = t >= TL.bro.pop ? 1 + 0.28 * Math.exp(-(t - TL.bro.pop) * 9) * Math.cos((t - TL.bro.pop) * 22) : 1;
      s.sx *= pop; s.sy *= pop;
    }
    bro.style.transform = `translate3d(${s.x - 100}px,${s.y - 192}px,${z}px) rotateX(${rx}deg) translateY(${-s.h}px)`;
    bro.style.filter = s.glow > 0.05 ? `drop-shadow(0 0 ${(18 * s.glow).toFixed(1)}px rgba(255,201,60,${(0.8 * s.glow).toFixed(2)}))` : "none";
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, 600, 600);
    bctx.setTransform(3, 0, 0, 3, 300, 576);
    drawBro(bctx, s);
    const showSh = t > 1.9;
    shadow.style.display = showSh ? "block" : "none";
    if (showSh) {
      const k = 1 / (1 + s.h / 140);
      shadow.style.opacity = (0.75 * k).toFixed(3);
      shadow.style.transform = `translate3d(${s.x - 60}px,${s.y - 20}px,${s.z + 1}px) scale(${k})`;
    }
  }

  flash.style.opacity = (0.14 * pulse(t, TL.bro.pop, 10) + 0.08 * pulse(t, TL.lut.hit, 9) + 0.2 * pulse(t, TL.t.vibe, 9)).toFixed(3);
};

drawStatics();
window.stageReady = document.fonts.ready.then(() => { drawStatics(); window.renderAt(0); return true; });

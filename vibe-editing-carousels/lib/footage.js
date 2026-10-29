// Real footage: Mixkit clips cut into JPEG frames by footage/fetch_footage.py.
// drawFootage(c, name, _, w, h, look, focusX) covers (0,0,w,h) with the clip's frame at
// the slide clock (FOOTAGE.now), graded with `look`.
// Frames load asynchronously, so a frame renders in two passes (see FOOTAGE.prepare):
// a collect pass records which frames the draw needs, then they load, then the real draw.
(function () {
const FPS = 30;
const ROOT = "build/footage/";
// Names the earlier procedural scenes used, mapped onto real clips.
const ALIAS = { sunrise: "sunset_sea", city: "city_night", ocean: "waves" };

// Looks: a canvas filter plus an optional soft-light wash.
const LOOKS = {
  raw:    { f: "none" },
  log:    { f: "saturate(0.35) contrast(0.78) brightness(1.08)" },
  teal:   { f: "saturate(1.25) contrast(1.1)", wash: ["#0aa8c2", "#ff8a3d"], a: 0.45 },
  film:   { f: "sepia(0.25) contrast(1.06) saturate(1.05)", wash: ["#2f5d50", "#ffcf8a"], a: 0.4 },
  noir:   { f: "grayscale(1) contrast(1.3) brightness(0.95)" },
  pastel: { f: "saturate(0.8) brightness(1.12) contrast(0.92)", wash: ["#b8a6ff", "#ffb3cf"], a: 0.45 },
  vhs:    { f: "saturate(1.45) contrast(0.92) hue-rotate(-10deg)", wash: ["#3b1d6e", "#ff5fa2"], a: 0.45 },
};

const F = { now: 0, collect: false, need: new Set(), cache: new Map(), counts: {} };

function frameKey(name, t) {
  const n = F.counts[name] || 150;
  const i = Math.floor(Math.max(0, t) * FPS) % n;
  return `${name}/f${String(i + 1).padStart(4, "0")}.jpg`;
}
const load = (key) => new Promise((ok) => {
  const im = new Image();
  im.onload = () => ok(im);
  im.onerror = () => { console.error("missing footage frame " + key); ok(null); };
  im.src = ROOT + key;
});

function drawFootage(c, name, _lt, w, h, look = "raw", focusX = 0.5, offset = 0) {
  name = ALIAS[name] || name;
  const key = frameKey(name, F.now + offset);
  if (F.collect) { F.need.add(key); return; }
  const im = F.cache.get(key);
  if (!im) { c.fillStyle = "#111"; c.fillRect(0, 0, w, h); return; }
  const s = Math.max(w / im.width, h / im.height);
  const sw = w / s, sh = h / s;
  const sx = Math.min(im.width - sw, Math.max(0, im.width * focusX - sw / 2)), sy = (im.height - sh) / 2;
  const L = LOOKS[look] || LOOKS.raw;
  const outer = c.filter && c.filter !== "none" ? c.filter : "";   // a filter set by the caller stacks
  c.save();
  c.beginPath(); c.rect(0, 0, w, h); c.clip();
  c.filter = outer ? (L.f === "none" ? outer : outer + " " + L.f) : L.f;
  c.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
  c.filter = "none";
  if (L.wash) {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, L.wash[0]); g.addColorStop(1, L.wash[1]);
    c.globalCompositeOperation = "soft-light"; c.globalAlpha = L.a;
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  c.restore();
}

// Run draw() twice: once to collect the frames it needs, then for real once they load.
async function prepare(t, draw) {
  F.now = t;
  F.need = new Set();
  F.collect = true;
  try { draw(); } finally { F.collect = false; }
  const missing = [...F.need].filter((k) => !F.cache.has(k));
  const imgs = await Promise.all(missing.map(load));
  missing.forEach((k, i) => imgs[i] && F.cache.set(k, imgs[i]));
  for (const k of F.cache.keys()) if (!F.need.has(k)) F.cache.delete(k);
  draw();
}

function script(src) {
  return new Promise((ok) => { const e = document.createElement("script"); e.src = src; e.onload = ok; e.onerror = () => { console.error("missing " + src); ok(); }; document.head.appendChild(e); });
}
async function init() {
  await script(ROOT + "index.js");
  F.counts = window.FOOTAGE_INDEX || {};
}

window.FOOTAGE = Object.assign(F, { drawFootage, prepare, init, LOOKS, ALIAS });
})();

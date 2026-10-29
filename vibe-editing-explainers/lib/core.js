// Shared stage helpers for every explainer. Load after build/timeline.js and build/assets.js:
//   <script src="../lib/core.js"></script>  ->  window.K
// A stage defines frame(t) -> {moving, speed} and calls K.run(frame, fontsToWaitFor).
(function () {
const TL = window.TL, A = window.ASSETS;
const K = {};
K.TL = TL; K.A = A; K.C = TL.cue; K.W = TL.w; K.H = TL.h;

// ---------------------------------------------------------------- easing --
K.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
K.win = (a, b, t) => K.clamp((t - a) / (b - a));
K.lerp = (a, b, p) => a + (b - a) * p;
K.outCubic = (x) => 1 - Math.pow(1 - x, 3);
K.outQuint = (x) => 1 - Math.pow(1 - x, 5);
K.outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
K.inCubic = (x) => x * x * x;
K.inOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
K.inOutQuint = (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2);
K.inOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
// soft spring: settles in ~0.6 s with one gentle overshoot (k stretches it)
K.spring = (x, k = 1) => (x <= 0 ? 0 : 1 - Math.exp(-7 * x / k) * Math.cos(9.5 * x / k));
K.rnd = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
// enter/exit envelope: 0 before `at`, springs to 1, falls back to 0 after `out`
K.life = (t, at, out, inDur = 0.9, outDur = 0.4) => {
  const p = K.spring(K.win(at, at + inDur, t));
  const o = out != null ? K.inCubic(K.win(out, out + outDur, t)) : 0;
  return { p, o, on: p > 0 && o < 1 };
};

// ---------------------------------------------------------------- images --
const cache = new Map();
let pending = [];
K.img = (src) => {
  let e = cache.get(src);
  if (!e) {
    e = { im: new Image(), ok: false };
    e.p = new Promise((res) => { e.im.onload = () => { e.ok = true; res(); }; e.im.onerror = () => { console.error("missing " + src); res(); }; });
    e.im.src = src; cache.set(src, e);
  }
  if (!e.ok) pending.push(e.p);
  return e.ok ? e.im : null;
};
K.footage = (name, lt, speed = 1, loop = false) => {
  const n = A.footage[name];
  if (!n) { console.error("no footage " + name); return null; }
  let i = Math.floor(Math.max(0, lt) * 30 * speed);
  i = loop ? i % n : Math.min(n - 1, i);
  return K.img(`../assets/footage/${name}/f${String(i + 1).padStart(4, "0")}.jpg`);
};
K.object = (key) => (A.objects[key] ? K.img(A.objects[key].path) : null);
K.image = (key) => (A.images[key] ? K.img(A.images[key]) : null);
// draw an image to cover (or contain) a rect, with optional focus point fx/fy in 0..1
K.drawFit = (g, im, x, y, w, h, o = {}) => {
  if (!im) return;
  const sc = (o.contain ? Math.min : Math.max)(w / im.width, h / im.height) * (o.zoom || 1);
  const dw = im.width * sc, dh = im.height * sc;
  const fx = o.fx ?? 0.5, fy = o.fy ?? 0.5;
  g.drawImage(im, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
};

// ---------------------------------------------------------------- canvas --
K.makeCanvas = (w, h) => { const k = document.createElement("canvas"); k.width = w; k.height = h; return k; };
K.GRAIN = Array.from({ length: 6 }, (_, k) => {
  const c = K.makeCanvas(540, 960), x = c.getContext("2d"), id = x.createImageData(540, 960), r = K.rnd(100 + k);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - 0.5) * 70; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0); return c;
});
K.grain = (g, t, a = 0.06) => {
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = "overlay";
  g.drawImage(K.GRAIN[Math.floor(Math.max(0, t) * 24) % 6], 0, 0, K.W, K.H); g.restore();
};
K.shadow = (g, blur = 26, oy = 14, a = 0.3, col = "20,20,30") => { g.shadowColor = `rgba(${col},${a})`; g.shadowBlur = blur; g.shadowOffsetY = oy; g.shadowOffsetX = 0; };
K.noShadow = (g) => { g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetX = g.shadowOffsetY = 0; };
K.rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
K.font = (g, size, weight = 600, fam = "Inter") => { g.font = `${weight} ${size}px "${fam}"`; };
K.wrap = (g, text, maxW) => {
  const out = []; let cur = "";
  for (const word of text.split(" ")) {
    const s = cur ? cur + " " + word : word;
    if (g.measureText(s).width > maxW && cur) { out.push(cur); cur = word; } else cur = s;
  }
  if (cur) out.push(cur);
  return out;
};
// type-on: the first n characters of `text` at `cps` chars/s from `at`
K.typed = (text, t, at, cps = 30) => text.slice(0, Math.max(0, Math.floor((t - at) * cps)));

// ---------------------------------------------------------------- captions --
// Phrases from the voiceover (split on punctuation); the current word is highlighted.
// style: {y, size, weight, family, color, hi (highlight bg), hiText, shadow, upper}
const PHRASES = [];
for (const l of Object.values(TL.lines)) {
  let cur = [];
  l.words.forEach((w, i) => { cur.push(w); if (/[.,!?:]$/.test(w.raw) || i === l.words.length - 1) { PHRASES.push(cur); cur = []; } });
}
K.PHRASES = PHRASES;
K.captions = (g, t, s = {}) => {
  const ph = PHRASES.find((p, i) => t >= p[0].t0 - 0.12 && t < (PHRASES[i + 1] ? Math.min(PHRASES[i + 1][0].t0 - 0.12, p[p.length - 1].t1 + 0.6) : p[p.length - 1].t1 + 0.6));
  if (!ph) return;
  const fs = s.size || 46;
  K.font(g, fs, s.weight || 700, s.family || "Inter");
  const words = ph.map((w) => { const r = w.raw.replace(/[.,:]$/, ""); return s.upper ? r.toUpperCase() : r; });
  const sp = g.measureText(" ").width;
  const widths = words.map((w) => g.measureText(w).width + sp);
  const total = widths.reduce((a, b) => a + b, 0) - sp;
  let x = K.W / 2 - total / 2; const y = s.y || 1530;
  const endA = 1 - K.win(ph[ph.length - 1].t1 + 0.35, ph[ph.length - 1].t1 + 0.6, t);
  g.save(); g.textBaseline = "middle"; g.textAlign = "left";
  ph.forEach((w, i) => {
    const p = K.outCubic(K.win(w.t0 - 0.08, w.t0 + 0.18, t));
    const active = t >= w.t0 - 0.05 && t < w.t1 + 0.05;
    g.globalAlpha = (0.3 + 0.7 * p) * endA;
    if (active && s.hi) { g.fillStyle = s.hi; K.rr(g, x - 9, y - fs * 0.64, widths[i] - sp + 18, fs * 1.28, s.radius ?? 6); g.fill(); }
    if (s.shadow && !(active && s.hi)) { g.shadowColor = s.shadow; g.shadowBlur = 10; g.shadowOffsetY = 3; }
    g.fillStyle = active ? (s.hiText || s.color || "#fff") : (s.color || "#fff");
    g.fillText(words[i], x, y + 4 * (1 - p) + 2);
    K.noShadow(g);
    x += widths[i];
  });
  g.restore();
};

// ---------------------------------------------------------------- run --
K.run = (frame, fonts = []) => {
  const cv = document.getElementById("c");
  K.g = cv.getContext("2d");
  window.renderAt = async (t) => {
    t = Math.max(0, t);
    for (let i = 0; i < 8; i++) {
      pending = [];
      K.g.setTransform(1, 0, 0, 1, 0, 0);
      const st = frame(K.g, t) || {};
      if (!pending.length) return { moving: !!st.moving, speed: st.speed ?? 1 };
      await Promise.all(pending);
    }
    throw new Error("assets failed to load at t=" + t);
  };
  window.stageReady = document.fonts.ready.then(() => Promise.all(fonts.map((f) => document.fonts.load(f, "Aaगव"))));
};
window.K = K;
})();

// Carousel 12: 10 Prompts to Save.
// Design system: a flat warm-grey desk, macOS blue folders, a Cut | Copy | Paste context
// menu, a white selection list with a light-blue highlight, a pixel cursor, white-bordered
// prints and a big blue folder pocket at the bottom; Helvetica-style caps in bold + light.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const BG = "#d7d7d9", INK = "#0e0e10", SEL = "#bcdcff", LINE = "#e3e3e6";
const BOLD = (size, o = {}) => ({ family: "InterD", size, weight: 800, color: INK, track: -size * 0.03, ...o });
const LIGHT = (size, o = {}) => ({ family: "InterD", size, weight: 300, color: INK, track: -size * 0.02, ...o });
const UI = (size, o = {}) => ({ family: "InterL", size, weight: 400, color: INK, ...o });
const PROMPTS = [
  "cut on every beat, keep it fast",
  "remove the dead air and the \"ums\"",
  "make the first 2 seconds hit harder",
  "teal & orange, punchy contrast",
  "word-by-word captions, highlight keywords",
  "add a whoosh on every transition",
  "make it feel like a movie trailer",
  "end on the product with a logo sting",
  "turn this into 3 vertical reels",
  "match the look of my last 3 posts",
];

function desk(c) {
  c.fillStyle = BG; c.fillRect(0, 0, K.W, K.H);
  const g = c.createRadialGradient(K.W / 2, K.H * 0.4, 100, K.W / 2, K.H * 0.4, K.H * 0.8);
  g.addColorStop(0, "rgba(255,255,255,.22)"); g.addColorStop(1, "rgba(0,0,0,.06)");
  c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
}

// ------------------------------------------------------------ components --
function folder(c, w, o = {}) {
  const h = w * 0.72, open = o.open || 0;
  const back = c.createLinearGradient(0, -h / 2, 0, h / 2); back.addColorStop(0, "#8fc3f2"); back.addColorStop(1, "#6aa6e0");
  c.fillStyle = "#7fb6ea"; rr(c, -w / 2, -h / 2 - w * 0.08, w * 0.42, w * 0.16, w * 0.04); c.fill();
  c.save(); c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 18; c.shadowOffsetY = 8;
  rr(c, -w / 2, -h / 2, w, h, w * 0.05); c.fillStyle = back; c.fill(); c.restore();
  if (o.inside) o.inside(c, w, h);
  const front = c.createLinearGradient(0, -h / 2, 0, h / 2); front.addColorStop(0, "#b8dcfc"); front.addColorStop(1, "#7db6ec");
  c.save(); c.translate(0, h / 2); c.transform(1, 0, -0.18 * open, 1 - 0.25 * open, 0, 0);
  rr(c, -w / 2, -h * 0.84, w, h * 0.84, w * 0.05); c.fillStyle = front; c.fill();
  c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(-w / 2 + 6, -h * 0.84 + 3, w - 12, 3);
  c.restore();
}
function contextMenu(c, items, t, at, hit = -1, hitAt = 99) {
  if (t < at) return;
  const e = outBack(win(at, at + 0.3, t), 2.2);
  c.save(); c.scale(e, e);
  const f = UI(32), ws = items.map((s) => K.measure(c, s, f) + 52), w = ws.reduce((a, b) => a + b, 0);
  K.panel(c, -w / 2, -42, w, 84, 16, "#fff", { color: "rgba(0,0,0,.18)", blur: 26, y: 8 });
  c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-18, 40); c.lineTo(0, 62); c.lineTo(18, 40); c.fill();
  let x = -w / 2;
  items.forEach((s, i) => {
    if (i === hit && t >= hitAt) { c.fillStyle = "#3b8ef3"; rr(c, x + 6, -34, ws[i] - 12, 68, 10); c.fill(); }
    K.text(c, s, x + ws[i] / 2, 11, { ...f, align: "center", color: i === hit && t >= hitAt ? "#fff" : INK });
    if (i < items.length - 1) { c.fillStyle = LINE; c.fillRect(x + ws[i] - 1, -28, 2, 56); }
    x += ws[i];
  });
  c.restore();
}
// White selection list; the highlight steps through rows from `at` every `step` seconds.
function list(c, w, rows, t, at, step = 0.6, o = {}) {
  const rh = o.rh || 84, h = rows.length * rh + 24;
  K.panel(c, -w / 2, -h / 2, w, h, 26, "#fff", { color: "rgba(0,0,0,.14)", blur: 28, y: 10 });
  const k = t < at ? -1 : o.hold ? Math.min(rows.length - 1, Math.floor((t - at) / step)) : Math.floor((t - at) / step) % rows.length;
  rows.forEach((s, i) => {
    const y = -h / 2 + 12 + i * rh;
    if (i === k) { c.fillStyle = SEL; rr(c, -w / 2 + 14, y + 6, w - 28, rh - 12, 8); c.fill(); }
    K.text(c, s, -w / 2 + 30, y + rh / 2 + 11, UI(o.size || 32, { weight: o.weight || 400 }));
    if (i < rows.length - 1) { c.fillStyle = LINE; c.fillRect(-w / 2 + 24, y + rh - 1, w - 48, 2); }
  });
}
function print(c, w, h, paint) {
  K.panel(c, -w / 2, -h / 2, w, h, 4, "#fff", { color: "rgba(0,0,0,.24)", blur: 22, y: 10 });
  c.save(); c.beginPath(); c.rect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24); c.clip(); c.translate(-w / 2 + 12, -h / 2 + 12);
  paint(c, w - 24, h - 24); c.restore();
}
function pocket(c, label) {
  const g = c.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, "#b9dcfc"); g.addColorStop(1, "#7cb4ea");
  c.save(); c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 20; c.shadowOffsetY = -4;
  rr(c, -450, 0, 900, 260, [34, 34, 0, 0]); c.fillStyle = g; c.fill(); c.restore();
  c.fillStyle = "rgba(255,255,255,.4)"; c.fillRect(-440, 4, 880, 3);
  K.text(c, label, 0, 92, UI(30, { color: "#fff", align: "center" }));
}
function promptCard(c, n, w, t, at, o = {}) {
  const f = BOLD(o.size || 46, { track: -1.5 }), maxW = w - 150;
  const lines = K.lines(c, PROMPTS[n - 1], { ...f, maxW });
  const h = Math.max(140, lines.length * f.size * 1.15 + 70);
  K.panel(c, -w / 2, -h / 2, w, h, 22, "#fff", { color: "rgba(0,0,0,.14)", blur: 24, y: 10 });
  K.text(c, String(n).padStart(2, "0"), -w / 2 + 28, -h / 2 + 62, LIGHT(48, { color: "#7aa9dd" }));
  const sel = o.selAt != null ? inOut(win(o.selAt, o.selAt + 0.4, t)) : 0;
  lines.forEach((l, i) => {
    const y = -h / 2 + 35 + f.size * 0.92 + i * f.size * 1.15;
    if (sel > 0) { c.fillStyle = SEL; c.fillRect(-w / 2 + 116, y - f.size * 0.9, K.measure(c, l, f) * clamp(sel * lines.length - i) + 8, f.size * 1.12); }
    K.text(c, l, -w / 2 + 120, y, f);
  });
  return h;
}
const mov = (x0, y0, x1, y1, a, b, t) => { const u = inOut(win(a, b, t)); return [lerp(x0, x1, u), lerp(y0, y1, u)]; };
const header = (n, word, at = 0.05) => [
  { x: 70, y: 175, in: "left", at, draw: (c) => K.text(c, n, 0, 0, BOLD(118)) },
  { x: 70, y: 285, in: "left", at: at + 0.12, draw: (c) => K.text(c, word, 0, 0, LIGHT(106)) },
];

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "10 Prompts to Save",
  dur: D,
  bg: desk,
  fg: (c, t) => K.grain(c, t, 0.05),
  slides: [
    // 1 · Hook
    {
      els: [
        { x: 540, y: 150, in: "pop", at: 0.2, draw: (c, t) => contextMenu(c, ["Cut", "Copy", "Paste", "Save ▶"], t, 0.2, 3, 3.0) },
        { x: 960, y: 175, rot: 4, in: "right", at: 0.3, float: 1, draw: (c) => folder(c, 160) },
        { x: 540, y: 360, in: "fade", at: 0.1, draw: (c) => K.text(c, "WHAT'S INSIDE", 0, 0, BOLD(116, { align: "center" })) },
        { x: 540, y: 480, in: "fade", at: 0.25, draw: (c) => K.text(c, "THIS FOLDER", 0, 0, LIGHT(116, { align: "center" })) },
        { x: 175, y: 650, rot: -3, in: "left", at: 0.5, float: 1, draw: (c) => folder(c, 230) },
        { x: 720, y: 720, in: "pop", at: 0.7, draw: (c, t) => list(c, 520, ["10 vibe edit prompts", "copy-paste ready", "worth saving"], t, 1.0, 0.7) },
        ...[[-280, -10, "sunrise", "teal"], [0, 8, "city", "film"], [280, -6, "ocean", "pastel"]].map(([dx, rot, sc, lk], i) => ({
          x: 540 + dx, y: 1085, rot, in: "up", at: 0.6 + i * 0.12, far: 0.5, draw: (c, t) => print(c, 300, 330, (c, w, h) => FOOTAGE.drawFootage(c, sc, t * 0.3, w, h, lk, 0.6)),
        })),
        { x: 540, y: 1160, in: "up", at: 0.2, draw: (c) => pocket(c, "vibe editing · swipe →") },
        { x: 0, y: 0, in: "none", at: 0, draw: (c, t) => { const [x, y] = mov(820, 900, 590, 470, 1.4, 2.4, t); K.pixelCursor(c, x, y, 4.2); } },
      ],
    },
    // 2 · 01-03 the cut
    {
      els: [
        ...header("01—03", "THE CUT"),
        { x: 930, y: 210, rot: 6, in: "right", at: 0.3, float: 1, draw: (c) => folder(c, 190) },
        { x: 540, y: 560, in: "up", at: 0.25, draw: (c, t) => {
          K.panel(c, -470, -170, 940, 340, 26, "#fff", { color: "rgba(0,0,0,.14)", blur: 28, y: 10 });
          for (let i = 0; i < 3; i++) {
            const y = -170 + 14 + i * 104, on = t >= 0.9 + i * 0.9;
            if (on && t < 0.9 + (i + 1) * 0.9) { c.fillStyle = SEL; rr(c, -456, y + 4, 912, 96, 10); c.fill(); }
            K.text(c, String(i + 1).padStart(2, "0") + ".txt", -430, y + 64, UI(30, { color: "#8a8a8f" }));
            const px = K.fit(c, PROMPTS[i], 680, UI(34, { weight: 600 }));
            K.text(c, PROMPTS[i], -300, y + 64, UI(px, { weight: 600 }));
            if (i < 2) { c.fillStyle = LINE; c.fillRect(-440, y + 102, 880, 2); }
          }
        } },
        { x: 0, y: 0, in: "none", at: 0, draw: (c, t) => {
          const k = clamp(Math.floor((t - 0.9) / 0.9), 0, 2);
          const [x, y] = mov(900, 1300, 980, 460 + k * 104, 0.4, 0.9, t);
          K.pixelCursor(c, x, t > 0.9 ? 460 + k * 104 : y, 4.2);
        } },
        { x: 540, y: 1030, rot: -1, in: "pop", at: 0.9, draw: (c, t) => {
          const k = clamp(Math.floor((t - 0.9) / 0.9), 0, 2);
          const kinds = [["wave", { at: 1.0, gap: 0.12 }], ["editor", { mode: "build", at: 1.9, rowGap: 0.15 }], ["reel", { look: "teal", title: "HOOK", titleAt: 2.9, caps: [["STOP"], ["SCROLLING."]], capsAt: 3.0, capEvery: 0.3 }]];
          K.panel(c, -360, -230, 720, 460, 22, "#fff", { color: "rgba(0,0,0,.2)", blur: 30, y: 12 });
          K.text(c, "Quick Look · " + String(k + 1).padStart(2, "0") + ".txt", -330, -190, UI(24, { color: "#8a8a8f" }));
          K.card(c, kinds[k][0], -340, -165, 680, 380, t, kinds[k][1], 12, D);
        } },
      ],
    },
    // 3 · 04-06 look + sound
    {
      els: [
        ...header("04—06", "LOOK + SOUND"),
        { x: 540, y: 1190, in: "up", at: 0.1, draw: (c) => folder(c, 480) },
        ...[3, 4, 5].map((i, j) => ({
          x: 540 + (j - 1) * 310, y: 690 + (j === 1 ? -40 : 30), rot: (j - 1) * 7, in: "up", at: 0.5 + j * 0.25, far: 0.7, float: 1,
          draw: (c, t) => print(c, 300, 470, (c, w, h) => {
            c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
            const vis = [(c, w, h) => CARDS.grade(c, w, h, t, { scene: "sunrise", at: 1.4, look: "teal", name: "T&O" }, {}),
              (c, w, h) => CARDS.reel(c, w, h, t, { look: "film", caps: [["SAY"], ["IT", "*LOUD"]].map((l) => l.map((x) => x.replace("*", ""))), capsAt: 1.6, capEvery: 0.35 }, { D }),
              (c, w, h) => CARDS.sfx(c, w, h, t, { at: 1.8, gap: 0.35, list: ["WHOOSH", "POP", "HIT"] }, {})][j];
            c.save(); rr(c, 0, 0, w, h * 0.56, 4); c.clip(); vis(c, w, h * 0.56); c.restore();
            K.text(c, String(i + 1).padStart(2, "0"), 6, h * 0.56 + 54, LIGHT(44, { color: "#7aa9dd" }));
            K.text(c, PROMPTS[i], 6, h * 0.56 + 96, BOLD(28, { track: -0.8, maxW: w - 12, lh: 1.15 }));
          }),
        })),
      ],
    },
    // 4 · 07-08 polish
    {
      els: [
        ...header("07—08", "THE POLISH"),
        { x: 160, y: 960, rot: -6, in: "left", at: 0.4, float: 1, draw: (c) => folder(c, 200) },
        { x: 560, y: 560, rot: -1.5, in: "right", at: 0.2, draw: (c, t) => { promptCard(c, 7, 900, t, 0.2, { selAt: 0.9, size: 54 }); } },
        { x: 640, y: 420, in: "none", at: 0, draw: (c, t) => contextMenu(c, ["Cut", "Copy", "Paste"], t, 1.4, 1, 2.0) },
        { x: 600, y: 880, rot: 1.5, in: "right", at: 0.4, draw: (c, t) => { promptCard(c, 8, 900, t, 0.4, { selAt: 2.5, size: 54 }); } },
        { x: 680, y: 745, in: "none", at: 0, draw: (c, t) => contextMenu(c, ["Cut", "Copy", "Paste"], t, 2.9, 1, 3.4) },
        { x: 0, y: 0, in: "none", at: 0, draw: (c, t) => {
          let [x, y] = mov(1000, 1250, 640, 425, 0.8, 1.8, t);
          if (t > 2.2) [x, y] = mov(640, 425, 690, 750, 2.3, 3.2, t);
          K.pixelCursor(c, x, y, 4.2);
        } },
        { x: 760, y: 1170, in: "pop", at: 2.1, draw: (c, t) => {
          const n = t > 3.4 ? 2 : 1, b = pulse(t, n === 2 ? 3.4 : 2.0, 6);
          c.scale(1 + 0.08 * b, 1 + 0.08 * b);
          K.panel(c, -230, -48, 460, 96, 48, "rgba(20,20,22,.88)");
          K.text(c, `Copied ${n} of 10 ✓`, 0, 12, UI(34, { color: "#fff", weight: 600, align: "center" }));
        } },
      ],
    },
    // 5 · 09-10 scale
    {
      els: [
        ...header("09—10", "THE SCALE"),
        { x: 540, y: 470, rot: -1, in: "right", at: 0.2, draw: (c, t) => promptCard(c, 9, 900, t, 0.2, { size: 46 }) },
        { x: 250, y: 790, rot: -3, in: "left", at: 0.5, draw: (c, t) => print(c, 360, 230, (c, w, h) => FOOTAGE.drawFootage(c, "ocean", t * 0.3, w, h, "teal")) },
        ...[0, 1, 2].map((i) => ({ x: 560 + i * 150, y: 790, rot: (i - 1) * 4, in: "pop", at: 1.2 + i * 0.25, draw: (c, t) => print(c, 136, 230, (c, w, h) => CARDS.reel(c, w, h, t, { look: "teal", scenes: [["ocean", "city", "sunrise"][i]], caps: [[["HOOK"], ["TIP"], ["CTA"]][i]], capsAt: 1.6 + i * 0.25, capSize: 18 }, { D })) })),
        { x: 470, y: 790, in: "fade", at: 1.0, draw: (c) => K.text(c, "→", 0, 16, LIGHT(70, { align: "center" })) },
        { x: 540, y: 1070, rot: 1, in: "right", at: 0.6, draw: (c, t) => promptCard(c, 10, 900, t, 0.6, { size: 46 }) },
        ...[0, 1, 2].map((i) => ({ x: 250 + i * 290, y: 1260, rot: (i - 1) * -3, in: "up", at: 2.0 + i * 0.2, far: 0.4, draw: (c, t) => print(c, 250, 170, (c, w, h) => FOOTAGE.drawFootage(c, ["sunrise", "city", "ocean"][i], t * 0.3 + i, w, h, t > 3.0 ? "film" : ["raw", "log", "noir"][i])) })),
      ],
    },
    // 6 · CTA
    {
      els: [
        { x: 540, y: 200, in: "fade", at: 0.05, draw: (c) => K.text(c, "SAVE THIS", 0, 0, BOLD(132, { align: "center" })) },
        { x: 540, y: 330, in: "fade", at: 0.18, draw: (c) => K.text(c, "FOLDER", 0, 0, LIGHT(132, { align: "center" })) },
        { x: 300, y: 640, in: "pop", at: 0.3, draw: (c, t) => {
          const b = pulse(t, 2.2, 7);
          c.scale(1 + 0.08 * b, 1 - 0.05 * b);
          folder(c, 360, { open: t > 1.3 && t < 2.3 ? 0.5 : 0 });
        } },
        { x: 0, y: 0, in: "none", at: 0, draw: (c, t) => {
          if (t > 2.25) return;
          const [x, y] = mov(820, 1000, 300, 600, 1.0, 2.1, t);
          const s = 1 - 0.5 * win(1.8, 2.2, t);
          c.save(); c.translate(x, y); c.scale(s, s);
          K.panel(c, -60, -76, 120, 152, 10, "#fff", { color: "rgba(0,0,0,.2)", blur: 14, y: 6 });
          for (let i = 0; i < 5; i++) { c.fillStyle = "#d9d9de"; c.fillRect(-38, -42 + i * 18, 76 - (i === 4 ? 30 : 0), 6); }
          K.text(c, "10_prompts.txt", 0, 104, UI(22, { align: "center" }));
          c.restore();
          K.pixelCursor(c, x + 10, y + 10, 4);
        } },
        { x: 760, y: 700, in: "pop", at: 0.6, draw: (c, t) => list(c, 520, ["comment \"VIBE\"", "get all 10 + the pack", "follow for daily prompts"], t, 2.4, 0.6, { hold: true, size: 32, weight: 600 }) },
        { x: 540, y: 1000, in: "pop", at: 1.0, draw: (c, t) => contextMenu(c, ["Save", "Share", "Follow ▶"], t, 1.0, 2, 3.8) },
        { x: 540, y: 1160, in: "up", at: 0.2, draw: (c) => pocket(c, "vibe editing · free prompt pack") },
      ],
    },
  ],
};
})();

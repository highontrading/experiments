// Carousel 05: One-Word Color Grades.
// Design system: a white room with floating shelves and soft spotlights; pictures in
// pale-yellow postage-stamp frames standing on the shelves; a heavy dark-brown grotesque,
// a black serif on a pink highlight box, a bubbly lavender-outlined label, wide-tracked
// light caps and a pale-yellow arrow.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const BROWN = "#3a2e1c", PINKBOX = "#f6d3e2", LAV = "#6a63c6", LAVF = "#efedff", STAMP = "#f5efb6";
const HEAVY = (size, o = {}) => ({ family: "InterD", size, weight: 900, color: BROWN, track: -size * 0.04, ...o });
const SERIF = (size, o = {}) => ({ family: "Playfair", size, weight: 500, color: "#111", ...o });
const SPACED = (size, o = {}) => ({ family: "InterL", size, weight: 300, color: "#b4b4b4", track: size * 0.5, ...o });

// --------------------------------------------------------------- backdrop --
const roomCache = {};
function room(shelves) {
  const key = shelves.join(",");
  if (roomCache[key]) return roomCache[key];
  return (roomCache[key] = K.once(K.W, K.H, (c, W, H) => {
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#d9d9d9"); g.addColorStop(0.08, "#ececec"); g.addColorStop(0.5, "#f7f7f7"); g.addColorStop(0.92, "#ececec"); g.addColorStop(1, "#d6d6d6");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // side walls in perspective
    for (const side of [0, 1]) {
      const x0 = side ? W : 0, x1 = side ? W - 46 : 46;
      const sg = c.createLinearGradient(x0, 0, x1, 0); sg.addColorStop(0, "#c9c9c9"); sg.addColorStop(1, "#e2e2e2");
      c.fillStyle = sg; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x1, 40); c.lineTo(x1, H - 40); c.lineTo(x0, H); c.fill();
    }
    // spotlights above each shelf
    shelves.forEach((y, i) => {
      for (const x of [W * 0.22, W * 0.5, W * 0.78]) {
        const r = c.createRadialGradient(x, y - 260, 10, x, y - 200, 260);
        r.addColorStop(0, "rgba(255,255,255,.95)"); r.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = r; c.fillRect(x - 300, y - 520, 600, 520);
      }
    });
    shelves.forEach((y) => {
      const sh = c.createLinearGradient(0, y + 26, 0, y + 110);
      sh.addColorStop(0, "rgba(0,0,0,.16)"); sh.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = sh; c.beginPath(); c.moveTo(60, y + 26); c.lineTo(W - 60, y + 26); c.lineTo(W - 90, y + 110); c.lineTo(90, y + 110); c.fill();
      c.fillStyle = "#fbfbfb"; c.beginPath(); c.moveTo(72, y - 16); c.lineTo(W - 72, y - 16); c.lineTo(W - 50, y); c.lineTo(50, y); c.fill();
      const fg = c.createLinearGradient(0, y, 0, y + 26); fg.addColorStop(0, "#f1f1f1"); fg.addColorStop(1, "#dedede");
      c.fillStyle = fg; c.fillRect(50, y, W - 100, 26);
      c.fillStyle = "rgba(255,255,255,.9)"; c.fillRect(50, y, W - 100, 2);
    });
  }));
}
const bgRoom = (shelves) => (c, t) => { c.drawImage(room(shelves), 0, 0); };

// ------------------------------------------------------------- components --
// Postage-stamp frame standing with its bottom edge at y=0 (centred on x=0).
const stampCv = document.createElement("canvas");
function stamp(c, w, h, paint) {
  const r = 9, step = 26, pad = 12;
  stampCv.width = w + pad * 2; stampCv.height = h + pad * 2;
  const o = stampCv.getContext("2d");
  o.translate(pad, pad);
  o.fillStyle = STAMP; o.fillRect(0, 0, w, h);
  o.globalCompositeOperation = "destination-out";
  for (let x = step / 2; x < w; x += step) { o.beginPath(); o.arc(x, 0, r, 0, 7); o.arc(x, h, r, 0, 7); o.fill(); }
  for (let y = step / 2; y < h; y += step) { o.beginPath(); o.arc(0, y, r, 0, 7); o.arc(w, y, r, 0, 7); o.fill(); }
  o.globalCompositeOperation = "source-over";
  o.save(); rr(o, 22, 22, w - 44, h - 44, 10); o.clip(); o.translate(22, 22);
  paint(o, w - 44, h - 44);
  o.restore();
  c.save();
  c.shadowColor = "rgba(0,0,0,.22)"; c.shadowBlur = 22; c.shadowOffsetY = 10;
  c.drawImage(stampCv, -w / 2 - pad, -h - pad);
  c.restore();
}
function bubbly(c, s, size, o = {}) {
  const f = { family: "Fredoka", size, weight: 700, track: -size * 0.02, align: o.align || "center" };
  K.text(c, s, 4, 8, { ...f, color: "#4b45a0", stroke: "#4b45a0", strokeW: size * 0.32 });
  K.text(c, s, 0, 0, { ...f, color: LAVF, stroke: LAV, strokeW: size * 0.3 });
  K.text(c, s, 0, 0, { ...f, color: o.fill || LAVF });
}
function pinkBox(c, s, size, o = {}) {
  const f = SERIF(size, { align: o.align || "center", italic: o.italic });
  const w = K.measure(c, s, f) + size * 0.7, h = size * 1.32;
  const x = (o.align || "center") === "center" ? -w / 2 : -size * 0.35;
  c.fillStyle = PINKBOX; c.fillRect(x, -h * 0.76, w, h);
  K.text(c, s, 0, 0, f);
}
function arrow(c, t) {
  c.save(); c.translate(Math.sin(t * 5) * 8, 0);
  c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 10; c.shadowOffsetY = 4;
  c.beginPath(); c.moveTo(-70, -16); c.lineTo(20, -16); c.lineTo(20, -40); c.lineTo(72, 0); c.lineTo(20, 40); c.lineTo(20, 16); c.lineTo(-70, 16); c.closePath();
  c.fillStyle = "#f4e7a2"; c.fill();
  c.restore();
}
const LOOKS = [["teal", "Teal & Orange"], ["film", "Film 35"], ["noir", "Noir"], ["pastel", "Pastel Pop"], ["vhs", "VHS 89"]];
const frame = (x, shelfY, w, h, at, paint, o = {}) => ({ x, y: shelfY - 16, in: o.in || "drop", at, float: 0, draw: (c, t) => stamp(c, w, h, (c, ww, hh) => paint(c, ww, hh, t)) });
const graded = (scene, look) => (c, w, h, t) => FOOTAGE.drawFootage(c, scene, t, w, h, look, 0.5);
const label = (x, y, draw, at, inn = "fade", rot = 0) => ({ x, y, rot, in: inn, at, draw });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "One-Word Color Grades",
  dur: D,
  fg: (c, t) => K.grain(c, t, 0.05),
  slides: [
    // 1 · Hook
    {
      bg: bgRoom([330, 640, 900, 1110, 1290]),
      els: [
        frame(230, 330, 240, 270, 0.1, graded("filmmaker", "teal")),
        frame(540, 330, 240, 270, 0.2, graded("filmmaker", "film")),
        frame(850, 330, 240, 270, 0.3, graded("filmmaker", "noir")),
        label(540, 600, (c) => K.text(c, "One Word", 0, 0, HEAVY(178, { align: "center" })), 0.25, "left"),
        label(540, 790, (c) => pinkBox(c, "Color Grades", 128), 0.4, "right"),
        label(540, 1000, (c) => bubbly(c, "5 looks", 92), 0.6, "pop", -3),
        label(540, 1150, (c) => K.text(c, "SAME CLIP · FIVE MOODS", 0, 0, SPACED(26, { align: "center" })), 0.8),
        label(930, 1250, (c, t) => arrow(c, t), 1.0, "right"),
      ],
    },
    // 2 · One word, a whole mood
    {
      bg: bgRoom([310, 1080]),
      els: [
        label(540, 180, (c) => K.text(c, "Type one word.", 0, 0, HEAVY(112, { align: "center" })), 0.05, "down"),
        label(540, 290, (c) => pinkBox(c, "get a whole mood", 84, { italic: true }), 0.25, "right"),
        { x: 540, y: 1064, in: "drop", at: 0.3, draw: (c, t) => stamp(c, 600, 660, (c, w, h) => {
          const k = Math.floor(Math.max(0, t - 0.9) / 0.7) % LOOKS.length;
          FOOTAGE.drawFootage(c, "street_vlog", t, w, h, t < 0.9 ? "log" : LOOKS[k][0], 0.5);
          const f = pulse(Math.max(0, t - 0.9) % 0.7, 0, 12);
          if (t > 0.9 && f > 0.03) { c.fillStyle = `rgba(255,255,255,${0.5 * f})`; c.fillRect(0, 0, w, h); }
        }) },
        label(540, 1210, (c, t) => {
          const k = Math.floor(Math.max(0, t - 0.9) / 0.7) % LOOKS.length;
          const s = t < 0.9 ? "\"...\"" : `"${LOOKS[k][1].toLowerCase()}"`;
          const e = 1 + 0.08 * pulse(Math.max(0, t - 0.9) % 0.7, 0, 10);
          c.scale(e, e); bubbly(c, s, 74);
        }, 0.6, "pop", -2),
        label(540, 1300, (c) => K.text(c, "TYPE IT · SEE IT · POST IT", 0, 0, SPACED(24, { align: "center" })), 0.9),
      ],
    },
    // 3 · Teal & Orange
    {
      bg: bgRoom([560, 1190]),
      els: [
        frame(250, 560, 250, 290, 0.15, (c, w, h) => {
          const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#14a3b8"); g.addColorStop(1, "#ff8a3d");
          c.fillStyle = g; c.fillRect(0, 0, w, h);
          K.text(c, "TEAL", w / 2, h / 2 - 6, { family: "InterD", size: 44, weight: 900, color: "#fff", align: "center" });
          K.text(c, "& ORANGE", w / 2, h / 2 + 40, { family: "InterD", size: 30, weight: 800, color: "#fff", align: "center" });
        }),
        { x: 330, y: 1174, in: "drop", at: 0.3, draw: (c, t) => stamp(c, 500, 560, (c, w, h) => CARDS.grade(c, w, h, t, { scene: "filmmaker", at: 1.0, look: "teal", name: "TEAL & ORANGE" }, {})) },
        label(790, 250, (c) => bubbly(c, "01", 110), 0.2, "pop", 4),
        label(790, 420, (c) => K.text(c, "Teal &", 0, 0, HEAVY(112, { align: "center" })), 0.3, "right"),
        label(790, 528, (c) => K.text(c, "Orange", 0, 0, HEAVY(112, { align: "center" })), 0.38, "right"),
        label(790, 690, (c) => pinkBox(c, "best for", 70, { italic: true }), 0.6, "right"),
        label(640, 790, (c, t) => {
          ["travel", "cinematic b-roll", "products", "golden hour"].forEach((s, i) => {
            const at = 0.9 + i * 0.3; if (t < at) return;
            c.save(); c.globalAlpha = clamp((t - at) * 4);
            K.text(c, "— " + s, 0, i * 64, { family: "InterD", size: 44, weight: 600, color: BROWN });
            c.restore();
          });
        }, 0.8, "none"),
        label(790, 1100, (c) => K.text(c, "WARM SKIN · COOL SHADE", 0, 0, SPACED(17, { align: "center" })), 1.4),
      ],
    },
    // 4 · Film 35 + Noir
    {
      bg: bgRoom([620, 1240]),
      els: [
        frame(770, 620, 420, 470, 0.1, graded("beach_walk", "film")),
        label(270, 230, (c) => bubbly(c, "02", 100), 0.2, "pop", -4),
        label(270, 380, (c) => K.text(c, "Film 35", 0, 0, HEAVY(112, { align: "center" })), 0.3, "left"),
        label(270, 500, (c) => pinkBox(c, "vlogs, nostalgia", 52, { italic: true }), 0.5, "left"),
        frame(310, 1240, 420, 470, 0.6, graded("vlog_talk", "noir")),
        label(800, 850, (c) => bubbly(c, "03", 100), 0.7, "pop", 4),
        label(800, 1000, (c) => K.text(c, "Noir", 0, 0, HEAVY(130, { align: "center" })), 0.8, "right"),
        label(800, 1120, (c) => pinkBox(c, "drama, quotes", 52, { italic: true }), 1.0, "right"),
      ],
    },
    // 5 · Pastel Pop + VHS 89, and how to ask
    {
      bg: bgRoom([430, 830, 1250]),
      els: [
        frame(290, 430, 330, 330, 0.1, graded("skincare", "pastel")),
        frame(790, 430, 330, 330, 0.2, graded("night_drive", "vhs")),
        label(290, 540, (c) => bubbly(c, "04 pastel pop", 56), 0.4, "pop", -3),
        label(790, 540, (c) => bubbly(c, "05 vhs 89", 56), 0.5, "pop", 3),
        { x: 540, y: 814, in: "drop", at: 0.6, draw: (c, t) => stamp(c, 860, 200, (c, w, h) => {
          c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
          K.text(c, "the prompt:", 28, 46, { family: "InterD", size: 26, weight: 700, color: "#b98aa1" });
          const s = K.typed("\"make it Film 35, keep skin tones natural\"", t, 1.1, 26);
          const px = K.fit(c, "\"make it Film 35, keep skin tones natural\"", w - 56, SERIF(46));
          K.text(c, s, 28, 112, SERIF(px, { italic: true }));
        }) },
        label(540, 1110, (c) => K.text(c, "One look per post.", 0, 0, HEAVY(96, { align: "center" })), 0.9, "up"),
        label(540, 1215, (c) => K.text(c, "SAME LOOK = YOUR BRAND", 0, 0, SPACED(24, { align: "center" })), 1.2),
      ],
    },
    // 6 · CTA
    {
      bg: bgRoom([520, 1010]),
      els: [
        { x: 540, y: 504, in: "drop", at: 0.1, draw: (c, t) => stamp(c, 540, 360, (c, w, h) => {
          c.drawImage(K.IMG.pack, 0, 0, w, h);
          const u = ((t * 0.5) % 1.4) - 0.2, g = c.createLinearGradient(w * u - 60, 0, w * u + 60, h * 0.3);
          g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,.3)"); g.addColorStop(1, "rgba(255,255,255,0)");
          c.fillStyle = g; c.fillRect(0, 0, w, h);
        }) },
        label(540, 700, (c) => K.text(c, "Comment", 0, 0, HEAVY(160, { align: "center" })), 0.3, "left"),
        label(540, 870, (c, t) => { const e = 1 + 0.04 * Math.sin(t * 5); c.scale(e, e); pinkBox(c, "\"VIBE\"", 140); }, 0.5, "right"),
        label(540, 1000, (c) => bubbly(c, "free prompt pack", 80), 0.8, "pop", -3),
        label(540, 1130, (c) => K.text(c, "SAVE · SHARE · FOLLOW", 0, 0, SPACED(26, { align: "center" })), 1.0),
        label(540, 1250, (c, t) => { K.text(c, "follow for more looks", -40, 12, { family: "InterD", size: 36, weight: 700, color: BROWN, align: "right" }); c.translate(60, 0); arrow(c, t); }, 1.2, "right"),
      ],
    },
  ],
};
})();

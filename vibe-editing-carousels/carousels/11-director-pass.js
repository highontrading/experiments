// Carousel 11: The Director Pass.
// Design system: a green cutting mat, a white paper sheet held with masking tape and a
// green dot sticker, big black lowercase type over yellow highlighter boxes, a pink label,
// a handwritten note in [brackets] on a pink box, and glossy die-cut stickers.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const MAT = "#5f9b5c", PAPER = "#fbfaf6", YEL = "#f4e98a", PINK = "#f6b7e0", PINKT = "#d9479c", INK = "#0f0f10";
const TYPE = (size, o = {}) => ({ family: "InterD", size, weight: 500, color: INK, track: -size * 0.05, ...o });
const HAND = (size, o = {}) => ({ family: "Caveat", size, weight: 600, color: INK, ...o });

let MATCV = null;
function paintMat() {
  return K.once(K.W, K.H, (c, W, H) => {
    c.fillStyle = MAT; c.fillRect(0, 0, W, H);
    const r = rnd(4);
    for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${r() < 0.5 ? "0,0,0" : "255,255,255"},${0.03 + r() * 0.04})`; c.fillRect(r() * W, r() * H, 2, 2); }
    for (let x = 0, i = 0; x <= W; x += 54, i++) { c.fillStyle = i % 5 ? "rgba(200,235,195,.35)" : "rgba(220,245,215,.6)"; c.fillRect(x, 0, i % 5 ? 2 : 3, H); }
    for (let y = 0, i = 0; y <= H; y += 54, i++) { c.fillStyle = i % 5 ? "rgba(200,235,195,.35)" : "rgba(220,245,215,.6)"; c.fillRect(0, y, W, i % 5 ? 2 : 3); }
  });
}
let NOW = 0;
function mat(c, t) { NOW = t; c.drawImage(MATCV, 0, 0); }

// ------------------------------------------------------------ components --
function sheet(c, w, h) {
  c.save(); c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 26; c.shadowOffsetY = 14;
  c.fillStyle = PAPER; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
}
function tape(c, w = 160, rot = -0.2) {
  c.save(); c.rotate(rot); c.fillStyle = "rgba(225,215,165,.82)"; c.fillRect(-w / 2, -22, w, 44);
  c.fillStyle = "rgba(255,255,255,.2)"; for (let i = 0; i < 6; i++) c.fillRect(-w / 2 + i * w / 6, -22, 2, 44);
  c.restore();
}
function dotSticker(c) {
  c.save(); c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 8; c.shadowOffsetY = 4;
  c.beginPath(); c.arc(0, 0, 46, 0.6, Math.PI * 2 - 0.1); c.lineTo(30, 30); c.closePath(); c.fillStyle = "#8cc36b"; c.fill(); c.restore();
  c.beginPath(); c.moveTo(46, -5); c.quadraticCurveTo(22, 18, 30, 30); c.lineTo(42, 22); c.closePath(); c.fillStyle = "#c9e7b5"; c.fill();
}
// Highlighted line: a yellow box sweeps in behind the text from `at`.
function hl(c, s, x, y, size, t, at, col = YEL, o = {}) {
  const f = TYPE(size, o);
  const w = K.measure(c, s, f), u = outCubic(win(at, at + 0.4, t));
  if (u > 0) { c.fillStyle = col; c.fillRect(x - size * 0.12, y - size * 0.78, (w + size * 0.24) * u, size * 0.98); }
  K.text(c, s, x, y, f);
}
function pinkLabel(c, s, size = 34) {
  const f = TYPE(size, { weight: 600, color: PINKT, track: 0 });
  const w = K.measure(c, s, f) + 24;
  c.fillStyle = "#fbd3ee"; c.fillRect(-12, -size * 0.85, w, size * 1.15);
  K.text(c, s, 0, 0, f);
}
function bracket(c, s, size = 54) {
  const f = HAND(size), w = K.measure(c, s, f);
  c.fillStyle = "#e9b9e8"; c.fillRect(-10, -size * 0.8, w + 20, size * 1.05);
  K.text(c, "[", -40, 4, HAND(size * 1.4)); K.text(c, s, 0, 0, f); K.text(c, "]", w + 22, 4, HAND(size * 1.4));
}
function dieCut(c, paint, w, h) {
  c.save(); c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 12; c.shadowOffsetY = 6;
  rr(c, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 24); c.fillStyle = "#fff"; c.fill(); c.restore();
  c.save(); rr(c, -w / 2, -h / 2, w, h, 16); c.clip(); c.translate(-w / 2, -h / 2); paint(c, w, h); c.restore();
  const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, "rgba(255,255,255,.35)"); g.addColorStop(0.4, "rgba(255,255,255,0)");
  rr(c, -w / 2, -h / 2, w, h, 16); c.fillStyle = g; c.fill();
}
function asterisk(c, s = 1, t = 0) {
  c.save(); c.scale(s, s); c.rotate(t * 0.5);
  for (let i = 0; i < 6; i++) { c.save(); c.rotate((i / 6) * Math.PI * 2); rr(c, -16, -80, 32, 80, 16); c.fillStyle = "#f4c430"; c.fill(); c.restore(); }
  c.restore();
}
function broSticker(c, t) {
  c.save(); c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 12; c.shadowOffsetY = 6;
  c.beginPath(); c.arc(0, -50, 82, 0, 7); c.fillStyle = "#fff"; c.fill(); c.restore();
  K.bro(c, 0, 8, 1.15, { eyes: "happy", glow: 0.5 + 0.2 * Math.sin(t * 4) });
}
function clapper(c) {
  c.save(); c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 10; c.shadowOffsetY = 5;
  rr(c, -80, -40, 160, 110, 10); c.fillStyle = "#fff"; c.fill(); c.restore();
  c.fillStyle = "#1c1c1c"; rr(c, -70, -10, 140, 72, 6); c.fill();
  c.save(); c.translate(-70, -16); c.rotate(-0.22); c.fillStyle = "#1c1c1c"; c.fillRect(0, -18, 144, 18);
  for (let i = 0; i < 6; i++) { c.fillStyle = "#fff"; c.beginPath(); c.moveTo(8 + i * 24, -18); c.lineTo(20 + i * 24, -18); c.lineTo(12 + i * 24, 0); c.lineTo(0 + i * 24, 0); c.fill(); }
  c.restore();
  K.text(c, "TAKE 2", 0, 36, { family: "InterD", size: 22, weight: 800, color: "#fff", align: "center" });
}
const phonePaint = (p) => (c, w, h) => CARDS.reel(c, w, h, NOW, p, { D: 5 });
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "The Director Pass",
  dur: D,
  setup: () => { MATCV = paintMat(); },
  bg: mat,
  fg: (c, t) => K.grain(c, t, 0.06),
  slides: [
    // 1 · Hook
    {
      els: [
        el(540, 690, (c) => sheet(c, 940, 1020), 0.05, "pop", { rot: -1.5 }),
        el(530, 190, (c) => dotSticker(c), 0.3, "grow"),
        el(120, 290, (c) => pinkLabel(c, "THE DIRECTOR PASS"), 0.35, "fade", { rot: -1.5 }),
        el(110, 470, (c, t) => hl(c, "the first", 0, 0, 150, t, 0.6), 0.2, "fade", { rot: -1.5 }),
        el(110, 620, (c, t) => hl(c, "AI edit", 0, 0, 150, t, 0.85), 0.25, "fade", { rot: -1.5 }),
        el(110, 770, (c, t) => hl(c, "is a draft.", 0, 0, 150, t, 1.1), 0.3, "fade", { rot: -1.5 }),
        el(200, 920, (c) => bracket(c, "here's how to direct it", 52), 1.5, "fade", { rot: -1.5 }),
        el(870, 330, (c, t) => broSticker(c, t), 0.6, "grow", { rot: 8, float: 1 }),
        el(130, 1070, (c, t) => asterisk(c, 0.75, t), 0.9, "grow"),
        el(800, 1080, (c) => clapper(c), 1.1, "grow", { rot: -8, float: 1 }),
        el(220, 1230, (c) => tape(c, 200, -0.25), 0.4, "fade"),
        el(860, 1250, (c, t) => { c.translate(Math.sin(t * 5) * 6, 0); K.text(c, "swipe →", 0, 0, HAND(56, { color: "#fff", align: "center" })); }, 1.6),
      ],
    },
    // 2 · Watch once, write 3 notes
    {
      els: [
        el(560, 700, (c) => sheet(c, 900, 1100), 0.05, "pop", { rot: 1.5 }),
        el(250, 170, (c) => tape(c, 180, -0.3), 0.3),
        el(150, 300, (c) => pinkLabel(c, "RULE: MAX 3 NOTES"), 0.3, "fade", { rot: 1.5 }),
        el(150, 450, (c, t) => hl(c, "watch it once.", 0, 0, 110, t, 0.5), 0.15, "fade", { rot: 1.5 }),
        el(150, 570, (c, t) => hl(c, "write 3 notes.", 0, 0, 110, t, 0.8), 0.2, "fade", { rot: 1.5 }),
        el(170, 700, (c, t) => {
          ["1. punchier first 2 seconds", "2. captions bigger, 3 words max", "3. end on the logo"].forEach((s, i) => {
            const at = 1.3 + i * 0.6; if (t < at) return;
            const w = K.measure(c, s, HAND(64)), u = win(at, at + 0.5, t);
            c.save(); c.beginPath(); c.rect(-10, i * 100 - 70, w * u + 20, 100); c.clip();
            K.text(c, s, 0, i * 100, HAND(64)); c.restore();
          });
        }, 0.1, "none", { rot: 1.5 }),
        el(820, 1090, (c) => dieCut(c, phonePaint({ look: "teal", caps: [["SO"], ["CLOSE"]], capsAt: 0.6, capEvery: 0.4 }), 220, 380), 0.5, "right", { rot: 6, float: 1 }),
        el(300, 1150, (c, t) => asterisk(c, 0.55, t), 0.8, "grow"),
      ],
    },
    // 3 · Note 1: punchier first 2s
    {
      els: [
        el(80, 220, (c) => pinkLabel(c, "NOTE 1"), 0.1, "left"),
        el(80, 350, (c, t) => hl(c, "punchier", 0, 0, 130, t, 0.4, YEL, { color: INK }), 0.15, "left"),
        el(80, 490, (c, t) => hl(c, "first 2 seconds", 0, 0, 120, t, 0.65, YEL, { color: INK }), 0.2, "left"),
        el(300, 900, (c) => { sheet(c, 400, 560); }, 0.3, "left", { rot: -4 }),
        el(300, 880, (c) => dieCut(c, (c, w, h) => { const a = clamp(((NOW - 0.6) % 2.4) / 1.6); FOOTAGE.drawFootage(c, "sunrise", NOW * 0.2, w, h, "film"); c.fillStyle = `rgba(0,0,0,${1 - a})`; c.fillRect(0, 0, w, h); }, 320, 420), 0.35, "left", { rot: -4 }),
        el(300, 1200, (c) => K.text(c, "before: slow fade-in", 0, 0, HAND(48, { align: "center" })), 0.5, "fade", { rot: -4 }),
        el(780, 900, (c) => { sheet(c, 400, 560); }, 0.4, "right", { rot: 4 }),
        el(780, 880, (c) => dieCut(c, (c, w, h) => { const k = ((NOW - 0.6) % 2.4 + 2.4) % 2.4, z = 1.3 - 0.3 * outCubic(clamp(k / 0.4)); c.save(); c.translate(w / 2, h / 2); c.scale(z, z); c.translate(-w / 2, -h / 2); FOOTAGE.drawFootage(c, "city", NOW * 0.4, w, h, "teal"); c.restore(); K.text(c, "WATCH THIS", w / 2, h * 0.3, { family: "ArchX9", size: 34, weight: 900, color: "#fff", align: "center", stroke: "#000", strokeW: 8 }); }, 320, 420), 0.45, "right", { rot: 4 }),
        el(780, 1200, (c) => K.text(c, "after: open mid-action", 0, 0, HAND(48, { align: "center" })), 0.6, "fade", { rot: 4 }),
        el(540, 760, (c) => K.text(c, "→", 0, 0, HAND(110, { color: "#fff", align: "center" })), 0.8, "pop"),
        el(540, 640, (c) => tape(c, 160, 0.1), 0.5),
      ],
    },
    // 4 · Notes 2 + 3
    {
      els: [
        el(340, 440, (c) => sheet(c, 600, 640), 0.05, "left", { rot: -3 }),
        el(340, 150, (c) => tape(c, 170, 0.15), 0.3),
        el(110, 230, (c) => pinkLabel(c, "NOTE 2", 30), 0.2, "fade", { rot: -3 }),
        el(100, 330, (c, t) => { hl(c, "bigger captions,", 0, 0, 62, t, 0.5); hl(c, "3 words max", 0, 76, 62, t, 0.75); }, 0.2, "fade", { rot: -3 }),
        el(340, 600, (c) => dieCut(c, phonePaint({ look: "teal", caps: [["BIG", "AND"], ["BOLD."]], capsAt: 0.9, capEvery: 0.35, capSize: 44, capY: 0.55 }), 460, 250), 0.4, "fade", { rot: -3 }),
        el(720, 980, (c) => sheet(c, 620, 620), 0.3, "right", { rot: 3 }),
        el(720, 690, (c) => dotSticker(c), 0.6, "grow"),
        el(470, 770, (c) => pinkLabel(c, "NOTE 3", 30), 0.5, "fade", { rot: 3 }),
        el(470, 870, (c, t) => hl(c, "end on the logo", 0, 0, 62, t, 1.4), 0.5, "fade", { rot: 3 }),
        el(730, 1100, (c) => dieCut(c, (c, w, h) => {
          c.fillStyle = "#14101f"; c.fillRect(0, 0, w, h);
          const e = outBack(win(1.8, 2.2, NOW), 2);
          c.save(); c.translate(w / 2, h * 0.62); c.scale(e, e);
          K.bro(c, 0, -10, 0.7, { eyes: "happy", glow: 0.7 });
          K.text(c, "VIBE EDITING", 0, 40, { family: "InterD", size: 40, weight: 900, color: "#ffe08a", align: "center" });
          c.restore();
        }, 460, 250), 0.6, "fade", { rot: 3 }),
        el(930, 300, (c, t) => asterisk(c, 0.7, t), 0.8, "grow"),
        el(150, 1110, (c) => clapper(c), 0.9, "grow", { rot: -10, float: 1 }),
      ],
    },
    // 5 · The re-cut
    {
      els: [
        el(540, 650, (c) => sheet(c, 960, 900), 0.05, "pop", { rot: -1 }),
        el(800, 210, (c) => tape(c, 190, 0.2), 0.3),
        el(100, 320, (c) => pinkLabel(c, "THE RE-CUT"), 0.2, "fade", { rot: -1 }),
        el(100, 440, (c, t) => hl(c, "paste your notes", 0, 0, 96, t, 0.5), 0.2, "fade", { rot: -1 }),
        el(100, 545, (c, t) => hl(c, "back in.", 0, 0, 96, t, 0.75), 0.25, "fade", { rot: -1 }),
        el(110, 650, (c, t) => {
          const s = K.typed("\"re-cut: punchier first 2s, captions bigger (3 words max), end on the logo\"", t, 1.1, 30);
          K.text(c, s, 0, 0, HAND(58, { maxW: 560, lh: 1.15 }));
        }, 0.3, "fade", { rot: -1 }),
        el(820, 820, (c) => dieCut(c, phonePaint({ look: "teal", title: "VIBE", titleAt: 3.4, caps: [["DONE."]], capsAt: 3.8, capEvery: 0.3 }), 240, 420), 0.5, "right", { rot: 5, float: 1 }),
        el(120, 1240, (c, t) => hl(c, "max 2 rounds. then post.", 0, 0, 64, t, 3.6, PINK), 0.3, "up"),
        el(980, 1220, (c, t) => asterisk(c, 0.6, t), 0.9, "grow"),
      ],
    },
    // 6 · CTA
    {
      els: [
        el(540, 680, (c) => sheet(c, 940, 1000), 0.05, "pop", { rot: 1.5 }),
        el(530, 190, (c) => dotSticker(c), 0.3, "grow"),
        el(120, 320, (c) => pinkLabel(c, "SAVE THIS FOR YOUR NEXT EDIT"), 0.3, "fade", { rot: 1.5 }),
        el(110, 500, (c, t) => hl(c, "comment", 0, 0, 160, t, 0.6), 0.2, "fade", { rot: 1.5 }),
        el(110, 670, (c, t) => { const e = 1 + 0.03 * Math.sin(t * 5); c.scale(e, e); hl(c, "\"VIBE\"", 0, 0, 180, t, 0.9, PINK); }, 0.25, "fade", { rot: 1.5 }),
        el(180, 830, (c) => bracket(c, "free prompt pack", 56), 1.3, "fade", { rot: 1.5 }),
        el(150, 980, (c) => K.text(c, "follow for one vibe edit a day", 0, 0, TYPE(44, { weight: 600 })), 1.5, "fade", { rot: 1.5 }),
        el(860, 360, (c, t) => broSticker(c, t), 0.6, "grow", { rot: -6, float: 1 }),
        el(800, 1100, (c) => dieCut(c, (c, w, h) => c.drawImage(K.IMG.pack, 0, 0, w, h), 300, 190), 0.9, "grow", { rot: -7, float: 1 }),
        el(160, 1150, (c, t) => asterisk(c, 0.7, t), 1.0, "grow"),
        el(260, 1260, (c) => tape(c, 200, 0.2), 0.4),
      ],
    },
  ],
};
})();

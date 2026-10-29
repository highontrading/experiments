// Carousel 07: Hook Edits for the First 1.5 Seconds.
// Design system: dark brown linen, heavy cream caps, silver letter beads that spell the key
// word, photo cards with a cream border in a row that runs off the edge, a felt hibiscus
// patch and a gold sun charm, small cream labels in the top corners.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const CREAM = "#f1e6ae", BROWN = "#3b302b";
const CAPS = (size, o = {}) => ({ family: "ArchivoBlack", size, weight: 400, color: CREAM, track: -size * 0.01, ...o });
const BODY = (size, o = {}) => ({ family: "InterD", size, weight: 600, color: CREAM, ...o });

let LINEN = null;
function paintLinen() {
  return K.once(K.W, K.H, (c, W, H) => {
    c.fillStyle = BROWN; c.fillRect(0, 0, W, H);
    const r = rnd(8);
    for (let y = 0; y < H; y += 3) { c.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.08})`; c.fillRect(0, y, W, 1); }
    for (let x = 0; x < W; x += 3) { c.fillStyle = `rgba(255,240,220,${0.02 + r() * 0.04})`; c.fillRect(x, 0, 1, H); }
    const g = c.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H * 0.4, H * 0.8);
    g.addColorStop(0, "rgba(255,230,200,.06)"); g.addColorStop(1, "rgba(0,0,0,.3)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  });
}
let NOW = 0;                                   // slide time, for card painters
function bg(c, t) {
  NOW = t;
  // real fabric, darkened and warmed into brown linen
  c.save(); c.filter = "grayscale(1) brightness(0.42) sepia(0.9) saturate(1.3) hue-rotate(-12deg) contrast(1.15)";
  FOOTAGE.drawFootage(c, "fabric_gray", t, K.W, K.H, "raw", 0.5);
  c.restore();
  c.globalAlpha = 0.35; c.drawImage(LINEN, 0, 0); c.globalAlpha = 1;
  K.text(c, "Vibe Editing", 70, 72, BODY(26, { weight: 700 }));
  K.text(c, "Hook School", K.W - 70, 72, BODY(26, { weight: 700, align: "right" }));
}

// ------------------------------------------------------------ components --
function bead(c, ch, s) {
  c.save(); c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = s * 0.2; c.shadowOffsetY = s * 0.1;
  rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.fillStyle = "#9a9ca1"; c.fill(); c.restore();
  const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.45, "#e3e4e7"); g.addColorStop(1, "#8f9298");
  rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.fillStyle = g; c.fill();
  const g2 = c.createLinearGradient(0, -s / 2, 0, s / 2); g2.addColorStop(0, "#fbfbfc"); g2.addColorStop(1, "#d3d5d9");
  rr(c, -s * 0.4, -s * 0.4, s * 0.8, s * 0.8, s * 0.14); c.fillStyle = g2; c.fill();
  K.text(c, ch, 0, s * 0.22, { family: "InterD", size: s * 0.6, weight: 800, color: "#111", align: "center" });
}
// Beads spelling `word` that tumble in one by one from `at`.
function beads(c, word, s, t, at) {
  const chars = [...word], gap = s * 1.06;
  chars.forEach((ch, i) => {
    const ct = at + i * 0.12, e = outBack(win(ct, ct + 0.4, t), 2.2);
    if (t < ct) return;
    c.save(); c.translate((i - (chars.length - 1) / 2) * gap, -(1 - e) * 220);
    c.rotate([-0.08, 0.06, -0.04, 0.09, -0.06][i % 5] + (1 - e) * 1.5);
    bead(c, ch, s); c.restore();
  });
}
function photoCard(c, w, h, paint) {
  c.save(); c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 24; c.shadowOffsetY = 12;
  rr(c, -w / 2, -h / 2, w, h, 22); c.fillStyle = CREAM; c.fill(); c.restore();
  c.save(); rr(c, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 14); c.clip(); c.translate(-w / 2 + 12, -h / 2 + 12);
  paint(c, w - 24, h - 24, NOW); c.restore();
}
// Real cutouts in place of the felt patch and the charm: a sunflower and a camera.
function hibiscus(c, s, t) {
  c.save(); c.rotate(Math.sin(t * 1.3) * 0.05);
  c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 24; c.shadowOffsetY = 12;
  K.drawCut(c, "sunflower", 260 * s); c.restore();
}
function sunCharm(c, s, t) {
  c.save(); c.rotate(-0.2 + Math.sin(t * 1.1) * 0.04);
  c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 20; c.shadowOffsetY = 10;
  K.drawCut(c, "sunflower", 150 * s); c.restore();
}
// A 0-1.5 s ruler that fills while the hook plays.
function clock15(c, w, t, at) {
  const u = clamp(((t - at) % 2.4) / 1.5);
  c.fillStyle = "rgba(241,230,174,.18)"; rr(c, -w / 2, -10, w, 20, 10); c.fill();
  c.fillStyle = CREAM; rr(c, -w / 2, -10, w * u, 20, 10); c.fill();
  K.text(c, "0.0s", -w / 2, 44, BODY(24)); K.text(c, "1.5s", w / 2, 44, BODY(24, { align: "right" }));
  K.text(c, (u * 1.5).toFixed(1) + "s", -w / 2 + w * u, -24, BODY(24, { align: "center", weight: 800 }));
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const reel = (p) => (c, w, h, t) => CARDS.reel(c, w, h, t, p, { D: 5 });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Hook Edits for the First 1.5 Seconds",
  dur: D,
  cuts: ["sunflower"],
  setup: () => { LINEN = paintLinen(); },
  bg,
  fg: (c, t) => K.grain(c, t, 0.08),
  slides: [
    // 1 · Hook
    {
      els: [
        el(70, 300, (c) => K.text(c, "YOU HAVE", 0, 0, CAPS(140)), 0.05, "left"),
        el(70, 445, (c) => K.text(c, "1.5 SEC", 0, 0, CAPS(140)), 0.15, "left"),
        el(70, 590, (c) => K.text(c, "TO", 0, 0, CAPS(140)), 0.25, "left"),
        el(560, 545, (c, t) => beads(c, "HOOK", 128, t, 0.5), 0, "none"),
        el(985, 690, (c, t) => hibiscus(c, 0.6, t), 0.6, "grow", { float: 1 }),
        ...[["vlog_talk", "raw", [["WAIT"], ["FOR IT"]]], ["girl_record", "raw", [["STOP"], ["SCROLLING"]]], ["dance_girls", "raw", [["POV:"], ["YOU"]]]].map(([sc, lk, caps], i) =>
          el(250 + i * 380, 960, (c, t) => photoCard(c, 350, 470, reel({ scenes: [sc], look: lk, caps, capsAt: 0.9 + i * 0.2, capEvery: 0.3 })), 0.4 + i * 0.12, "right", { far: 0.7 })),
        el(150, 1220, (c, t) => sunCharm(c, 0.9, t), 0.9, "grow"),
        el(1010, 1260, (c, t) => { c.translate(Math.sin(t * 5) * 8, 0); K.text(c, "5 HOOKS →", 0, 0, CAPS(40, { align: "right" })); }, 1.2),
      ],
    },
    // 2 · Start mid-action
    {
      els: [
        el(190, 250, (c, t) => beads(c, "01", 120, t, 0.1), 0, "none"),
        el(70, 430, (c) => K.text(c, "START", 0, 0, CAPS(130)), 0.15, "left"),
        el(70, 560, (c) => K.text(c, "MID-ACTION.", 0, 0, CAPS(130)), 0.25, "left"),
        el(70, 640, (c) => K.text(c, "skip the intro. open on the moment", 0, 0, BODY(34)), 0.4),
        el(70, 684, (c) => K.text(c, "it's already happening.", 0, 0, BODY(34)), 0.45),
        el(560, 1000, (c, t) => photoCard(c, 760, 430, (c, w, h) => {
          const lt = (t - 0.6) % 2.4, z = 1.25 - 0.25 * outCubic(clamp(lt / 1.5));
          c.save(); c.translate(w / 2, h / 2); c.scale(z, z); c.translate(-w / 2, -h / 2);
          FOOTAGE.drawFootage(c, "tiktok_dance", 0, w, h, "raw"); c.restore();
          K.text(c, "▶ 0:00", 24, 48, BODY(28, { color: "#fff", weight: 800 }));
        }), 0.5, "up"),
        el(560, 1280, (c, t) => clock15(c, 700, t, 0.6), 0.7),
        el(950, 360, (c, t) => hibiscus(c, 0.7, t), 0.8, "grow", { float: 1 }),
      ],
    },
    // 3 · Text in frame 1 + punch-in
    {
      els: [
        el(300, 230, (c, t) => beads(c, "02", 100, t, 0.1), 0, "none"),
        el(780, 230, (c, t) => beads(c, "03", 100, t, 0.3), 0, "none"),
        el(300, 380, (c) => { K.text(c, "TEXT IN", 0, 0, CAPS(78, { align: "center" })); K.text(c, "FRAME 1", 0, 80, CAPS(78, { align: "center" })); }, 0.2, "left"),
        el(780, 380, (c) => { K.text(c, "PUNCH-IN", 0, 0, CAPS(78, { align: "center" })); K.text(c, "ZOOM", 0, 80, CAPS(78, { align: "center" })); }, 0.35, "right"),
        el(300, 870, (c, t) => photoCard(c, 420, 640, reel({ scenes: ["skincare"], look: "raw", caps: [["DON'T", "SKIP"], ["THE", "END"]], capsAt: 0, capEvery: 0.01, capY: 0.3, flash: false })), 0.4, "up", { rot: -4 }),
        el(780, 870, (c, t) => photoCard(c, 420, 640, (c, w, h) => {
          const k = ((t - 0.5) % 1.6 + 1.6) % 1.6, z = 1 + 0.35 * (k > 0.8 ? outBack(clamp((k - 0.8) / 0.15), 2) : 0);
          c.save(); c.translate(w / 2, h * 0.45); c.scale(z, z); c.translate(-w / 2, -h * 0.45);
          FOOTAGE.drawFootage(c, "influencer_talk", t, w, h, "raw"); c.restore();
          if (k > 0.8 && k < 0.95) { c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(0, 0, w, h); }
        }), 0.55, "up", { rot: 4 }),
        el(300, 1250, (c) => K.text(c, "readable before they blink", 0, 0, BODY(28, { align: "center" })), 0.8),
        el(780, 1250, (c) => K.text(c, "on the first beat", 0, 0, BODY(28, { align: "center" })), 0.9),
      ],
    },
    // 4 · Sound first
    {
      els: [
        el(880, 250, (c, t) => beads(c, "04", 120, t, 0.1), 0, "none"),
        el(70, 330, (c) => K.text(c, "SOUND", 0, 0, CAPS(150)), 0.15, "left"),
        el(70, 480, (c) => K.text(c, "FIRST.", 0, 0, CAPS(150)), 0.25, "left"),
        el(70, 560, (c) => K.text(c, "a hit or a voice line lands before the picture.", 0, 0, BODY(32)), 0.4),
        el(540, 830, (c, t) => {
          K.panel(c, -470, -170, 940, 340, 26, "rgba(0,0,0,.35)");
          const lt = ((t - 0.6) % 2.4 + 2.4) % 2.4;
          K.text(c, "AUDIO", -440, -90, BODY(24, { weight: 800 })); K.text(c, "VIDEO", -440, 70, BODY(24, { weight: 800 }));
          for (let i = 0; i < 120; i++) {
            const x = -320 + i * 6.5, a = i < 6 ? 60 : 18 + 20 * Math.abs(Math.sin(i * 0.7));
            c.fillStyle = i < 6 ? "#f6a23a" : "rgba(241,230,174,.6)"; c.fillRect(x, -90 - a / 2, 4, a);
          }
          c.fillStyle = CREAM; rr(c, -320 + 0.2 * 520, 40, 760 - 0.2 * 520, 70, 10); c.fill();
          K.text(c, "picture starts at 0.2s", -320 + 0.2 * 520 + 20, 86, BODY(24, { color: BROWN, weight: 800 }));
          const ph = -320 + lt / 1.5 * 520;
          c.fillStyle = "#fff"; c.fillRect(Math.min(ph, 440), -150, 3, 300);
        }, 0.5, "up"),
        el(330, 1140, (c, t) => photoCard(c, 420, 300, (c, w, h) => {
          const lt = ((t - 0.6) % 2.4 + 2.4) % 2.4;
          if (lt < 0.2) { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); } else FOOTAGE.drawFootage(c, "podcast_face", t, w, h, "raw");
          const k = pulse(lt, 0, 5);
          c.save(); c.translate(w - 50, 50); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-18, -8); c.lineTo(-6, -8); c.lineTo(8, -20); c.lineTo(8, 20); c.lineTo(-6, 8); c.lineTo(-18, 8); c.fill();
          c.strokeStyle = `rgba(255,255,255,${0.4 + k})`; c.lineWidth = 3; for (let r = 0; r < 2; r++) { c.beginPath(); c.arc(8, 0, 16 + r * 10 + k * 8, -0.8, 0.8); c.stroke(); } c.restore();
        }), 0.7, "left", { rot: -3 }),
        el(820, 1140, (c, t) => sunCharm(c, 1.1, t), 0.9, "grow"),
      ],
    },
    // 5 · Show the end first + the prompt
    {
      els: [
        el(190, 250, (c, t) => beads(c, "05", 120, t, 0.1), 0, "none"),
        el(70, 420, (c) => K.text(c, "SHOW THE", 0, 0, CAPS(120)), 0.15, "left"),
        el(70, 540, (c) => K.text(c, "END FIRST.", 0, 0, CAPS(120)), 0.25, "left"),
        el(560, 790, (c, t) => photoCard(c, 760, 360, (c, w, h) => {
          const back = t > 1.6 && t < 2.4;
          FOOTAGE.drawFootage(c, "makeup", 0, w, h, t < 1.6 ? "raw" : "log");
          K.text(c, t < 1.6 ? "THE RESULT" : back ? "◀◀ REWIND" : "HOW I MADE IT", w / 2, h * 0.58, { family: "ArchX9", size: 56, weight: 900, color: "#fff", align: "center", stroke: "#000", strokeW: 10 });
          if (back) { c.fillStyle = "rgba(255,255,255,.08)"; for (let y = 0; y < h; y += 10) c.fillRect(0, y + (t * 300) % 10, w, 3); }
        }), 0.4, "up"),
        el(540, 1170, (c, t) => {
          photoCard(c, 900, 260, (c, w, h) => {
            c.fillStyle = "#fffaf0"; c.fillRect(0, 0, w, h);
            K.text(c, "the prompt:", 28, 46, BODY(26, { color: "#b05a2a", weight: 800 }));
            const s = K.typed("make the first 1.5s hit harder: start mid-action, bold text in frame 1, punch in on the first beat", t, 1.3, 36);
            K.text(c, s, 28, 92, BODY(32, { color: "#2a211d", maxW: w - 56, lh: 1.28 }));
          });
        }, 0.6, "up"),
        el(950, 330, (c, t) => hibiscus(c, 0.7, t), 0.8, "grow", { float: 1 }),
      ],
    },
    // 6 · CTA
    {
      els: [
        el(70, 330, (c) => K.text(c, "COMMENT", 0, 0, CAPS(150)), 0.05, "left"),
        el(560, 500, (c, t) => beads(c, "VIBE", 150, t, 0.3), 0, "none"),
        el(70, 680, (c) => K.text(c, "FOR THE FREE PROMPT PACK.", 0, 0, CAPS(52)), 0.8),
        el(70, 740, (c) => K.text(c, "save this · follow for more hooks", 0, 0, BODY(34)), 1.0),
        el(330, 1030, (c, t) => photoCard(c, 520, 340, (c, w, h) => c.drawImage(K.IMG.pack, 0, 0, w, h)), 0.4, "left", { rot: -3, float: 1 }),
        el(830, 1050, (c, t) => photoCard(c, 330, 460, reel({ look: "teal", caps: [["COMMENT"], ["VIBE"]], capsAt: 1.2, capEvery: 0.4 })), 0.55, "right", { rot: 4, float: 1 }),
        el(985, 850, (c, t) => hibiscus(c, 0.6, t), 0.9, "grow", { float: 1 }),
        el(140, 1250, (c, t) => sunCharm(c, 0.8, t), 1.0, "grow"),
      ],
    },
  ],
};
})();

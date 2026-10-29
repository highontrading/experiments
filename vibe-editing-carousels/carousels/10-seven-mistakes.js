// Carousel 10: 7 Vibe Editing Mistakes.
// Design system: a halftone collage (pale sky, rolling green hills), a torn cream note
// with a paperclip, a bold serif in blue and purple, wavy speech-blob stickers in soft
// colours with small caps, a four-leaf clover and a QR code corner tag.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const BLUE = "#3a4fb0", PURPLE = "#8e2c88", PAPER = "#eee8da", INK = "#1d1d1f";
const SERIF = (size, o = {}) => ({ family: "DMSerif", size, weight: 400, color: BLUE, track: -size * 0.02, ...o });
const SMALL = (size, o = {}) => ({ family: "InterD", size, weight: 700, color: "#222", track: size * 0.02, ...o });
const BLOBS = ["#8fd0c8", "#ee8a50", "#f3c74a", "#c8b3e3", "#a9c6e6", "#bfe3a8"];

// ------------------------------------------------------------ backdrop --
let DOTS = null;

// ------------------------------------------------------------ components --
function tornNote(c, w, h, seed) {
  const r = rnd(seed), pts = [];
  const edge = (x0, y0, x1, y1, n, j) => { for (let i = 0; i < n; i++) { const u = i / n; pts.push([lerp(x0, x1, u) + (r() - 0.5) * j * (y0 === y1 ? 0 : 1), lerp(y0, y1, u) + (r() - 0.5) * j * (x0 === x1 ? 0 : 1)]); } };
  edge(-w / 2, -h / 2, w / 2, -h / 2, 30, 14); edge(w / 2, -h / 2, w / 2, h / 2, 6, 4); edge(w / 2, h / 2, -w / 2, h / 2, 30, 16); edge(-w / 2, h / 2, -w / 2, -h / 2, 6, 4);
  c.save(); c.shadowColor = "rgba(0,0,0,.28)"; c.shadowBlur = 22; c.shadowOffsetY = 12;
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.fillStyle = PAPER; c.fill(); c.restore();
  c.save(); c.clip(); c.fillStyle = "rgba(160,140,100,.08)"; for (let i = 0; i < 40; i++) c.fillRect(-w / 2, -h / 2 + i * (h / 40), w, 1); c.restore();
}
function paperclip(c, s = 1) {
  c.save(); c.scale(s, s); c.strokeStyle = "#9aa1ab"; c.lineWidth = 6; c.lineCap = "round";
  c.beginPath(); c.moveTo(0, 90); c.lineTo(0, -40); c.arc(18, -40, 18, Math.PI, 0); c.lineTo(36, 70); c.arc(22, 70, 14, 0, Math.PI); c.lineTo(8, -20); c.stroke();
  c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-2, 80); c.lineTo(-2, -40); c.stroke();
  c.restore();
}
function blob(c, text, col, w, h, seed, o = {}) {
  const r = rnd(seed), n = 12, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = 0.88 + r() * 0.2; pts.push([Math.cos(a) * w / 2 * k, Math.sin(a) * h / 2 * k]); }
  c.save(); c.shadowColor = "rgba(0,0,0,.22)"; c.shadowBlur = 14; c.shadowOffsetY = 6;
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    if (i === 0) c.moveTo(m[0], m[1]); else c.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  c.quadraticCurveTo(pts[0][0], pts[0][1], (pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
  c.fillStyle = col; c.fill(); c.restore();
  const f = SMALL(o.size || 26, { align: "center", maxW: w * 0.78, lh: 1.15 });
  const lines = K.lines(c, text.toUpperCase(), f);
  lines.forEach((l, i) => K.text(c, l, 0, (i - (lines.length - 1) / 2) * f.size * 1.15 + f.size * 0.36, { ...f, maxW: 0 }));
}
// A real sunflower cutout where the reference had a clover.
function clover(c, s = 1, t = 0) {
  c.save(); c.rotate(Math.sin(t * 1.5) * 0.06);
  c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 16; c.shadowOffsetY = 8;
  K.drawCut(c, "sunflower", 150 * s); c.restore();
}
function qr(c, s, label) {
  const r = rnd(77), n = 21, cell = s / n;
  c.fillStyle = "#fff"; c.fillRect(-10, -10, s + 20, s + 20);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (r() < 0.5) { c.fillStyle = "#111"; c.fillRect(x * cell, y * cell, cell, cell); }
  for (const [x, y] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    c.fillStyle = "#111"; c.fillRect(x * cell, y * cell, cell * 7, cell * 7);
    c.fillStyle = "#fff"; c.fillRect((x + 1) * cell, (y + 1) * cell, cell * 5, cell * 5);
    c.fillStyle = "#111"; c.fillRect((x + 2) * cell, (y + 2) * cell, cell * 3, cell * 3);
  }
  label.forEach((l, i) => { const f = SMALL(30, { color: "#fff", weight: 900, track: 0 }); const w = K.measure(c, l, f) + 12; c.fillStyle = "#111"; c.fillRect(-10, -10 - (label.length - i) * 38, w, 38); K.text(c, l, -4, -10 - (label.length - i) * 38 + 30, f); });
}
function demo(c, w, h, paint) {
  c.save(); c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 18; c.shadowOffsetY = 8;
  c.fillStyle = "#fff"; c.fillRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20); c.restore();
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); c.translate(-w / 2, -h / 2); paint(c, w, h); c.restore();
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const sticker = (x, y, rot, text, col, w, h, at, seed, size) => el(x, y, (c) => blob(c, text, col, w, h, seed, { size }), at, "grow", { rot, float: 1 });
// A mistake: big number, the mistake in blue, the fix in purple.
function mistake(c, n, what, fix, w) {
  K.text(c, String(n).padStart(2, "0"), -w / 2 + 50, -40, SERIF(150, { color: PURPLE }));
  K.text(c, what, -w / 2 + 50, 40, SERIF(60, { maxW: w - 100, lh: 1.05 }));
  const lines = K.lines(c, what, SERIF(60, { maxW: w - 100 }));
  K.text(c, "fix: " + fix, -w / 2 + 50, 40 + lines.length * 63 + 10, SMALL(28, { color: PURPLE, maxW: w - 100, lh: 1.25, track: 0 }));
}

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "7 Vibe Editing Mistakes",
  dur: D,
  cuts: ["sunflower"],
  setup: () => {
    DOTS = K.once(K.W, K.H, (c, W, H) => {                                 // halftone screen
      c.fillStyle = "#fff"; c.fillRect(0, 0, W, H); c.fillStyle = "#7d8a96";
      for (let y = 0; y < H; y += 9) for (let x = (y / 9) % 2 ? 4.5 : 0; x < W; x += 9) { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); }
    });
  },
  bg: (c, t) => {
    FOOTAGE.drawFootage(c, "meadow_lapse", t, K.W, K.H, "raw", 0.5);       // real sky and hills
    c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.45; c.drawImage(DOTS, 0, 0); c.restore();
  },
  fg: (c, t) => K.grain(c, t, 0.06),
  slides: [
    // 1 · Hook
    {
      els: [
        el(890, 70, (c) => qr(c, 150, ["FREE", "PROMPT", "PACK"]), 0.3, "right", { y: 160 }),
        el(500, 700, (c, t) => {
          tornNote(c, 600, 820, 3);
          K.text(c, "Your edits", -240, -230, SERIF(108));
          K.text(c, "look", -240, -120, SERIF(108));
          K.text(c, "AI-made?", -240, 0, SERIF(124, { color: PURPLE }));
          K.text(c, "7 mistakes", -240, 140, SERIF(80));
          K.text(c, "to fix today", -240, 220, SERIF(80, { color: PURPLE }));
        }, 0.05, "pop", { rot: -4 }),
        el(720, 320, (c) => paperclip(c, 1.1), 0.4, "down", { rot: 8 }),
        el(330, 1000, (c, t) => clover(c, 0.9, t), 0.6, "grow"),
        sticker(860, 470, 8, "vague prompts", BLOBS[0], 260, 150, 0.7, 1),
        sticker(190, 240, -12, "too many effects", BLOBS[1], 250, 160, 0.85, 2),
        sticker(890, 830, -10, "off-beat cuts", BLOBS[2], 240, 150, 1.0, 3),
        sticker(170, 880, 9, "no sound design", BLOBS[3], 260, 160, 1.15, 4),
        sticker(820, 1170, 6, "the first draft", BLOBS[4], 260, 150, 1.3, 5),
        el(240, 1250, (c, t) => { c.translate(Math.sin(t * 5) * 6, 0); blob(c, "swipe →", BLOBS[5], 220, 110, 9); }, 1.5, "grow"),
      ],
    },
    // 2 · 01 + 02
    {
      els: [
        el(380, 380, (c) => { tornNote(c, 620, 520, 11); mistake(c, 1, "Vague prompts", "name the platform, length, energy, look and goal", 620); }, 0.05, "left", { rot: -3 }),
        el(860, 300, (c) => paperclip(c, 0.9), 0.3, "down", { rot: 10 }),
        sticker(860, 560, 8, "\"make it cool\" ✗", BLOBS[1], 300, 170, 0.6, 21, 30),
        el(690, 960, (c) => { tornNote(c, 620, 520, 12); mistake(c, 2, "Too many effects", "one look, one transition, one caption style", 620); }, 0.3, "right", { rot: 3 }),
        el(200, 1000, (c, t) => demo(c, 260, 360, (c, w, h) => {
          const k = Math.floor(t * 4) % 4;
          FOOTAGE.drawFootage(c, ["dance_girls", "tiktok_dance", "girl_record", "street_vlog"][k], t, w, h, ["vhs", "noir", "pastel", "teal"][k], 0.5);
          c.save(); c.translate(w / 2, h / 2); c.rotate(t * 3); c.fillStyle = "rgba(255,0,200,.25)"; c.fillRect(-w, -8, w * 2, 16); c.restore();
        }), 0.6, "left", { rot: -6, float: 1 }),
        el(200, 1240, (c, t) => clover(c, 0.6, t), 1.0, "grow"),
      ],
    },
    // 3 · 03 + 04
    {
      els: [
        el(560, 330, (c) => { tornNote(c, 860, 400, 21); mistake(c, 3, "Off-beat cuts", "ask for cuts on every beat, or every 2nd beat", 860); }, 0.05, "down", { rot: -2 }),
        el(250, 860, (c, t) => demo(c, 360, 520, (c, w, h) => {
          FOOTAGE.drawFootage(c, "influencer_talk", t, w, h, "raw", 0.5);
          const low = t > 2.2, y = lerp(h * 0.3, h * 0.78, inOut(win(2.0, 2.5, t)));
          K.text(c, "CAPTIONS HERE", w / 2, y + 12, { family: "ArchX9", size: 30, weight: 900, color: "#fff", align: "center", stroke: "#000", strokeW: 7 });
          if (!low) { c.strokeStyle = "#e5484d"; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h * 0.3, 95, 0, 7); c.stroke(); }
        }), 0.3, "left", { rot: -4, float: 1 }),
        el(720, 900, (c) => { tornNote(c, 560, 560, 22); mistake(c, 4, "Captions over faces", "keep them center-low, above the app buttons", 560); }, 0.4, "right", { rot: 3 }),
        sticker(860, 640, -8, "move them down ↓", BLOBS[0], 280, 140, 2.2, 31, 26),
      ],
    },
    // 4 · 05 + 06
    {
      els: [
        el(420, 340, (c) => { tornNote(c, 680, 460, 31); mistake(c, 5, "A new look every post", "pick one look and keep it for every reel", 680); }, 0.05, "left", { rot: -3 }),
        el(880, 380, (c, t) => {
          const looks = ["vhs", "noir", "pastel", "teal", "film", "log", "teal", "vhs", "pastel"];
          for (let i = 0; i < 9; i++) { c.save(); c.translate(((i % 3) - 1) * 96, (Math.floor(i / 3) - 1) * 96); demo(c, 84, 84, (c, w, h) => FOOTAGE.drawFootage(c, ["vlog_talk", "dance_girls", "street_vlog", "skincare", "podcast_face", "girl_record", "makeup", "tiktok_dance", "influencer_talk"][i], 0, w, h, t > 3 ? "film" : looks[i])); c.restore(); }
        }, 0.4, "right", { rot: 5, float: 1 }),
        el(640, 920, (c) => { tornNote(c, 700, 480, 32); mistake(c, 6, "No sound design", "a whoosh on cuts, a pop on text, a hit on the drop", 700); }, 0.3, "right", { rot: 2 }),
        el(180, 1060, (c, t) => {
          blob(c, "", BLOBS[3], 230, 230, 41);
          const on = t > 2.6, k = pulse(t, 2.6, 4);
          c.fillStyle = INK; c.beginPath(); c.moveTo(-40, -18); c.lineTo(-14, -18); c.lineTo(14, -44); c.lineTo(14, 44); c.lineTo(-14, 18); c.lineTo(-40, 18); c.closePath(); c.fill();
          c.strokeStyle = INK; c.lineWidth = 7; c.lineCap = "round";
          if (on) { for (let r = 0; r < 2; r++) { c.beginPath(); c.arc(14, 0, 30 + r * 22 + k * 10, -0.8, 0.8); c.stroke(); } }
          else { c.beginPath(); c.moveTo(30, -22); c.lineTo(70, 22); c.moveTo(70, -22); c.lineTo(30, 22); c.stroke(); }
        }, 0.6, "grow", { rot: -8, float: 1 }),
      ],
    },
    // 5 · 07 + the fix
    {
      els: [
        el(520, 640, (c, t) => {
          tornNote(c, 760, 900, 41);
          K.text(c, "07", -310, -270, SERIF(170, { color: PURPLE }));
          K.text(c, "Taking the", -310, -150, SERIF(84));
          K.text(c, "first draft.", -310, -66, SERIF(84));
          K.text(c, "the fix:", -310, 30, SERIF(56, { color: PURPLE }));
          ["watch it once", "write 3 notes", "re-cut, then post"].forEach((s, i) => {
            const at = 1.0 + i * 0.5, on = t > at;
            c.strokeStyle = BLUE; c.lineWidth = 4; c.strokeRect(-310, 80 + i * 90, 44, 44);
            if (on) U.icon.check(c, -288, 102 + i * 90, 44, PURPLE, 5, win(at, at + 0.25, t));
            K.text(c, s, -240, 118 + i * 90, SERIF(56));
          });
        }, 0.05, "pop", { rot: -3 }),
        el(820, 230, (c) => paperclip(c, 1.1), 0.3, "down", { rot: 10 }),
        sticker(890, 760, 9, "punchier first 2s", BLOBS[2], 270, 150, 2.6, 51, 26),
        sticker(170, 1080, -8, "bigger captions", BLOBS[0], 260, 150, 2.9, 52, 26),
        sticker(860, 1150, 7, "end on the logo", BLOBS[4], 260, 150, 3.2, 53, 26),
        el(420, 1250, (c, t) => clover(c, 0.8, t), 0.6, "grow"),
      ],
    },
    // 6 · CTA
    {
      els: [
        el(890, 70, (c) => qr(c, 150, ["FREE", "PROMPT", "PACK"]), 0.3, "right", { y: 160 }),
        el(470, 620, (c) => {
          tornNote(c, 640, 760, 61);
          K.text(c, "Fix all 7", -250, -200, SERIF(112));
          K.text(c, "with my free", -250, -90, SERIF(84));
          K.text(c, "prompt pack.", -250, 0, SERIF(84, { color: PURPLE }));
          K.text(c, "comment", -250, 140, SERIF(70));
          K.text(c, "\"VIBE\"", -250, 240, SERIF(110, { color: PURPLE }));
        }, 0.05, "pop", { rot: -4 }),
        el(700, 260, (c) => paperclip(c, 1.1), 0.35, "down", { rot: 8 }),
        sticker(860, 560, 8, "comment VIBE", BLOBS[1], 280, 160, 0.8, 61, 30),
        sticker(880, 900, -9, "save this", BLOBS[2], 240, 140, 1.0, 62, 30),
        sticker(250, 1150, 7, "follow for more", BLOBS[3], 300, 160, 1.2, 63, 28),
        el(780, 1160, (c, t) => clover(c, 0.9, t), 1.4, "grow"),
      ],
    },
  ],
};
})();

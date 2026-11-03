// Carousel 15: Cover Frames That Get Tapped.
// Design system: Swiss International. Warm off-white paper, a visible 6-column grid, signal
// red and black only, Inter Display Black set tight, huge numerals, crop marks around real
// footage, small rotated captions. Everything snaps to the grid.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const PAPER = "#f2efe8", RED = "#e4002b", INK = "#0d0d0d", GRID = "rgba(13,13,13,.07)";
const M = 64, COL = (K.W - M * 2) / 6;                         // margins and column width
const X = (n) => M + n * COL;
const BLACK = (size, o = {}) => ({ family: "InterD", size, weight: 900, color: INK, track: -size * 0.055, lh: 0.9, ...o });
const SMALL = (size, o = {}) => ({ family: "InterL", size, weight: 600, color: INK, track: size * 0.04, ...o });

function paper(c, t) {
  c.fillStyle = PAPER; c.fillRect(0, 0, K.W, K.H);
  c.fillStyle = GRID;
  for (let i = 0; i <= 6; i++) c.fillRect(X(i) - 1, 0, 2, K.H);
  c.fillRect(0, 120, K.W, 2); c.fillRect(0, K.H - 110, K.W, 2);
}
function folio(c, S, label) {
  K.text(c, "VIBE EDITING", M, 80, SMALL(22));
  K.text(c, label, K.W / 2, 80, SMALL(22, { align: "center" }));
  K.text(c, `${String(S.idx + 1).padStart(2, "0")} / 06`, K.W - M, 80, SMALL(22, { align: "right" }));
}
// Crop marks at the corners of a box.
function cropMarks(c, x, y, w, h, col = INK, k = 1) {
  c.strokeStyle = col; c.lineWidth = 3; const L = 28 * k, g = 12;
  for (const [cx, cy, sx, sy] of [[x, y, -1, -1], [x + w, y, 1, -1], [x, y + h, -1, 1], [x + w, y + h, 1, 1]]) {
    c.beginPath(); c.moveTo(cx + sx * g, cy); c.lineTo(cx + sx * (g + L), cy); c.moveTo(cx, cy + sy * g); c.lineTo(cx, cy + sy * (g + L)); c.stroke();
  }
}
function redBlock(c, w, h, t, at) {
  const u = outCubic(win(at, at + 0.5, t));
  c.fillStyle = RED; c.fillRect(0, 0, w * u, h);
}
// A phone-shaped cover: real footage, a bold headline, the profile-grid crop.
function cover(c, w, h, clip, title, t, o = {}) {
  c.save(); c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = INK; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  K.photo(c, -w / 2, -h / 2, w, h, clip, t, o.look || "raw", 0, o.focus ?? 0.5);
  if (o.dim) { c.fillStyle = `rgba(0,0,0,${o.dim})`; c.fillRect(-w / 2, -h / 2, w, h); }
  if (title) {
    const size = o.size || w * 0.15;
    K.text(c, title, -w / 2 + w * 0.08, h / 2 - h * 0.08 - (K.lines(c, title, BLACK(size, { maxW: w * 0.84 })).length - 1) * size * 0.9,
      BLACK(size, { color: o.ink || "#fff", maxW: w * 0.84 }));
  }
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Cover Frames That Get Tapped",
  dur: D,
  bg: paper,
  fg: (c, t) => K.grain(c, t, 0.05),
  slides: [
    // 1 · Hook
    { els: [
      el(0, 0, (c, t, lt, S) => folio(c, S, "COVER FRAMES"), 0.05),
      el(M, 170, (c, t) => redBlock(c, COL * 6, 330, t, 0.1), 0, "none"),
      el(M + 30, 290, (c) => K.text(c, "YOUR COVER", 0, 0, BLACK(150, { color: "#fff" })), 0.35, "left"),
      el(M + 30, 430, (c) => K.text(c, "IS THE HOOK.", 0, 0, BLACK(150, { color: "#fff" })), 0.45, "left"),
      ...[["fashion_shoot", 0.3], ["influencer_talk", 0.5], ["street_vlog", 0.5], ["phone_model", 0.5], ["girl_record", 0.5], ["podcast_women", 0.6]].map(([clip, f], i) => {
        const w = COL * 2 - 12, h = w * 1.25, x = X((i % 3) * 2) + 6, y = 560 + Math.floor(i / 3) * (h + 12);
        return el(x + w / 2, y + h / 2, (c, t) => {
          const hot = i === 1, k = hot ? 1 + 0.06 * outBack(win(2.0, 2.4, t), 2) : 1;
          c.save(); c.scale(k, k);
          cover(c, w, h, clip, null, t, { focus: f, dim: hot ? 0 : 0.15 * win(2.0, 2.4, t) });
          if (hot && t > 2.0) { c.strokeStyle = RED; c.lineWidth = 10; c.strokeRect(-w / 2, -h / 2, w, h); }
          c.restore();
        }, 0.6 + i * 0.08, "up", { far: 0.5 });
      }),
      el(X(2) + 6, 545, (c, t) => { if (t > 2.3) K.text(c, "← THIS ONE GETS THE TAP", 0, 0, SMALL(22, { color: RED, weight: 800 })); }, 0, "none"),
      el(K.W - M, K.H - 55, (c) => K.text(c, "6 RULES · SWIPE →", 0, 0, SMALL(24, { align: "right", weight: 800 })), 1.0),
    ] },
    // 2 · Rule 01: a face
    { els: [
      el(0, 0, (c, t, lt, S) => folio(c, S, "RULE 01"), 0.05),
      el(M - 10, 420, (c) => K.text(c, "01", 0, 0, BLACK(310, { color: RED })), 0.1, "left"),
      el(X(3) + 10, 300, (c) => K.text(c, "SHOW\nA FACE.", 0, 0, BLACK(110)), 0.25, "right"),
      el(X(3) + 10, 470, (c) => K.text(c, "Eyes on camera,\na clear emotion.\nFaces stop the thumb.", 0, 0, SMALL(32, { weight: 500, lh: 1.3, track: 0 })), 0.4),
      el(K.W / 2, 940, (c, t) => {
        const w = COL * 6, h = 560;
        K.photo(c, -w / 2, -h / 2, w, h, "influencer_talk", t, "raw", 0, 0.5);
        const z = outCubic(win(1.2, 1.9, t));
        cropMarks(c, lerp(-w / 2, -150, z), lerp(-h / 2, -230, z), lerp(w, 300, z), lerp(h, 380, z), RED);
      }, 0.3, "up", { far: 0.6 }),
      el(M, K.H - 55, (c) => K.text(c, "CROP TIGHT ON THE FACE", 0, 0, SMALL(22, { weight: 800 })), 1.4),
    ] },
    // 3 · Rule 02: 3 words
    { els: [
      el(0, 0, (c, t, lt, S) => folio(c, S, "RULE 02"), 0.05),
      el(K.W - M + 10, 420, (c) => K.text(c, "02", 0, 0, BLACK(310, { color: RED, align: "right" })), 0.1, "right"),
      el(M, 300, (c) => K.text(c, "THREE\nWORDS.", 0, 0, BLACK(118)), 0.25, "left"),
      el(M, 640, (c, t) => {
        const long = "how I edit all my reels in 5 minutes using AI tools";
        K.text(c, long, 0, 0, SMALL(36, { weight: 500, track: 0, maxW: COL * 6, lh: 1.25 }));
        const u = inOut(win(1.0, 1.6, t));
        if (u > 0) { c.fillStyle = RED; c.fillRect(0, -14, COL * 6 * u, 6); c.fillRect(0, 31, COL * 4 * u, 6); }
      }, 0.3),
      el(K.W / 2, 1030, (c, t) => {
        const w = 420, h = 525;
        cover(c, w, h, "vlog_talk", t > 1.7 ? "EDIT IN\n5 MIN." : "", t, { focus: 0.45, size: 86 });
        cropMarks(c, -w / 2, -h / 2, w, h);
      }, 0.5, "up", { far: 0.6 }),
      el(X(5), 1200, (c) => K.text(c, "readable at\nthumbnail size", 0, 0, SMALL(24, { weight: 600, track: 0, lh: 1.2 })), 2.0, "fade", { rot: -90 }),
    ] },
    // 4 · Rule 03: contrast
    { els: [
      el(0, 0, (c, t, lt, S) => folio(c, S, "RULE 03"), 0.05),
      el(M - 10, 420, (c) => K.text(c, "03", 0, 0, BLACK(310, { color: RED })), 0.1, "left"),
      el(X(3) + 10, 300, (c) => K.text(c, "PUSH THE\nCONTRAST.", 0, 0, BLACK(96)), 0.25, "right"),
      el(X(3) + 10, 455, (c) => K.text(c, "Flat covers vanish\nin a busy grid.", 0, 0, SMALL(32, { weight: 500, lh: 1.3, track: 0 })), 0.4),
      el(X(1.5), 930, (c, t) => { cover(c, 400, 500, "street_vlog", "my day", t, { look: "log", size: 50, ink: "#e5e5e5" }); K.text(c, "BEFORE", -200, -275, SMALL(22, { weight: 800 })); }, 0.4, "left", { rot: -2 }),
      el(X(4.5), 930, (c, t) => { cover(c, 400, 500, "street_vlog", "POV: MY\nDAY", t, { look: "teal", size: 80 }); K.text(c, "AFTER", -200, -275, SMALL(22, { weight: 800, color: RED })); c.strokeStyle = RED; c.lineWidth = 8; c.strokeRect(-200, -250, 400, 500); }, 0.55, "right", { rot: 2 }),
      el(M, K.H - 55, (c) => K.text(c, "PROMPT: \"PICK THE MOST EXPRESSIVE FRAME, BOOST CONTRAST\"", 0, 0, SMALL(21, { weight: 800 })), 1.4),
    ] },
    // 5 · Rule 04: the grid crop
    { els: [
      el(0, 0, (c, t, lt, S) => folio(c, S, "RULE 04"), 0.05),
      el(K.W - M + 10, 420, (c) => K.text(c, "04", 0, 0, BLACK(310, { color: RED, align: "right" })), 0.1, "right"),
      el(M, 300, (c) => K.text(c, "MIND THE\nGRID CROP.", 0, 0, BLACK(100)), 0.25, "left"),
      el(M, 500, (c) => K.text(c, "Your profile shows 3:4.\nKeep text in the middle.", 0, 0, SMALL(32, { weight: 500, lh: 1.3, track: 0 })), 0.4),
      el(K.W / 2, 980, (c, t) => {
        const w = 380, h = w * 16 / 9;
        K.photo(c, -w / 2, -h / 2, w, h, "phone_model", t, "raw", 0, 0.5);
        const u = outCubic(win(1.2, 1.8, t)), ch = w * 4 / 3;
        c.fillStyle = `rgba(242,239,232,${0.75 * u})`;
        c.fillRect(-w / 2, -h / 2, w, (h - ch) / 2); c.fillRect(-w / 2, ch / 2, w, (h - ch) / 2);
        c.strokeStyle = RED; c.lineWidth = 5; c.setLineDash([14, 10]); c.strokeRect(-w / 2, -ch / 2, w, ch * u); c.setLineDash([]);
        if (u > 0.9) K.text(c, "SAFE ZONE", w / 2 + 20, -ch / 2 + 20, SMALL(22, { weight: 800, color: RED }));
        K.text(c, "9:16", -w / 2 - 20, -h / 2 + 20, SMALL(22, { weight: 800, align: "right" }));
      }, 0.4, "up", { far: 0.6 }),
    ] },
    // 6 · CTA
    { els: [
      el(0, 0, (c, t, lt, S) => folio(c, S, "SAVE THIS"), 0.05),
      el(M, 170, (c, t) => redBlock(c, COL * 6, 760, t, 0.1), 0, "none"),
      el(M + 30, 330, (c) => K.text(c, "COMMENT", 0, 0, BLACK(150, { color: "#fff" })), 0.35, "left"),
      el(M + 30, 500, (c, t) => { const e = 1 + 0.03 * Math.sin(t * 5); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, BLACK(210, { color: "#fff" })); }, 0.45, "left"),
      el(M + 30, 620, (c) => K.text(c, "and I'll send you the free prompt pack:\ncover-frame prompts included.", 0, 0, SMALL(32, { weight: 500, color: "#fff", lh: 1.3, track: 0 })), 0.6),
      el(X(5) + 10, 805, (c, t) => cover(c, 180, 225, "fashion_shoot", "FOLLOW", t, { size: 38, focus: 0.3 }), 0.8, "up", { rot: 4 }),
      ...["1  FACE", "2  3 WORDS", "3  CONTRAST", "4  GRID CROP"].map((s, i) => el(M + (i % 2) * COL * 3, 1030 + Math.floor(i / 2) * 110, (c) => {
        c.fillStyle = INK; c.fillRect(0, -50, COL * 3 - 16, 4);
        K.text(c, s, 0, 20, BLACK(54));
      }, 0.9 + i * 0.12, "up", { far: 0.3 })),
    ] },
  ],
};
})();

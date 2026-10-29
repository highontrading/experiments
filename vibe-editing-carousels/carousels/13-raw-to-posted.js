// Carousel 13: Raw Footage to Posted in 15 Minutes.
// Design system: a blue fabric header, stacked manila folder dividers with tabs (tan, peach,
// brick red), typewriter caps with ruled lines, photos with a white border held by black
// binder clips, each showing a device on a bold colour backdrop.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const TAN = "#d6ad78", PEACH = "#f1d2b0", RED = "#c54f4a", PINKS = "#f2b6c4", BLUEH = "#2d5aa2", INK = "#1b1611";
const MONO = (size, o = {}) => ({ family: "SpaceMono", size, weight: 400, color: INK, track: size * 0.04, ...o });
const MONOB = (size, o = {}) => MONO(size, { weight: 700, ...o });

let FABRIC = null;
function paintFabric() {
  return K.once(K.W, 320, (c, W, H) => {
    c.fillStyle = BLUEH; c.fillRect(0, 0, W, H);
    const r = rnd(3);
    for (let y = 0; y < H; y += 3) { c.fillStyle = `rgba(0,0,20,${0.06 + r() * 0.08})`; c.fillRect(0, y, W, 1); }
    for (let x = 0; x < W; x += 3) { c.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`; c.fillRect(x, 0, 1, H); }
  });
}
let NOW = 0;
function bg(c, t) {
  NOW = t; c.fillStyle = "#e9e3d9"; c.fillRect(0, 0, K.W, K.H);
  c.save(); c.beginPath(); c.rect(0, 0, K.W, 320); c.clip();
  FOOTAGE.drawFootage(c, "fabric_blue", t, K.W, 320, "raw", 0.5);          // real blue fabric
  c.fillStyle = "rgba(20,50,110,.25)"; c.fillRect(0, 0, K.W, 320);
  c.restore();
}

// ------------------------------------------------------------ components --
// Folder divider with a tab; drawn from its top-left corner (0,0).
function divider(c, w, h, col, tab) {
  const tx = tab.x, tw = tab.w, th = 56;
  c.save(); c.shadowColor = "rgba(60,40,20,.28)"; c.shadowBlur = 18; c.shadowOffsetY = -4;
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(tx, 0); c.quadraticCurveTo(tx + 6, -th, tx + 26, -th); c.lineTo(tx + tw - 26, -th); c.quadraticCurveTo(tx + tw - 6, -th, tx + tw, 0);
  c.lineTo(w, 0); c.lineTo(w, h); c.lineTo(0, h); c.closePath();
  c.fillStyle = col; c.fill(); c.restore();
  c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, 0, w, 3);
  if (tab.label) K.text(c, tab.label, tx + tw / 2, -18, MONOB(28, { align: "center", color: tab.ink || INK }));
}
function rows(c, items, x, y, w, t, at, o = {}) {
  items.forEach((s, i) => {
    const ct = at + i * 0.25, u = win(ct, ct + 0.3, t);
    if (t < ct) return;
    c.save(); c.globalAlpha = u;
    K.text(c, s, x, y + i * (o.gap || 72), MONO(o.size || 34, { color: o.ink || INK }));
    c.fillStyle = o.line || "rgba(27,22,17,.35)"; c.fillRect(x, y + i * (o.gap || 72) + 20, w * outCubic(u), 2);
    if (o.check && t > ct + 0.6) U.icon.check(c, x + w - 20, y + i * (o.gap || 72) - 10, 30, o.check, 3.5, win(ct + 0.6, ct + 0.85, t));
    c.restore();
  });
}
function clip(c) {
  c.fillStyle = "#151515"; rr(c, -46, -10, 92, 46, 6); c.fill();
  c.fillStyle = "#3a3a3a"; c.fillRect(-40, -4, 80, 6);
  c.strokeStyle = "#9a9ea6"; c.lineWidth = 6; c.lineCap = "round";
  c.beginPath(); c.moveTo(-26, -8); c.lineTo(-30, -58); c.quadraticCurveTo(-30, -70, -18, -70); c.lineTo(-10, -70); c.stroke();
  c.beginPath(); c.moveTo(26, -8); c.lineTo(30, -58); c.quadraticCurveTo(30, -70, 18, -70); c.lineTo(10, -70); c.stroke();
}
// White-bordered photo of a device on a colour backdrop. device: laptop | phone | tablet
function photo(c, w, h, back, device, paint, clipAt = "tr") {
  c.save(); c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 22; c.shadowOffsetY = 12;
  c.fillStyle = "#fbfbf8"; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  const iw = w - 36, ih = h - 36;
  c.save(); c.beginPath(); c.rect(-iw / 2, -ih / 2, iw, ih); c.clip();
  c.fillStyle = back; c.fillRect(-iw / 2, -ih / 2, iw, ih);
  c.fillStyle = "rgba(0,0,0,.12)"; c.beginPath(); c.ellipse(0, ih * 0.38, iw * 0.38, ih * 0.08, 0, 0, 7); c.fill();
  if (device === "laptop") {                     // a real desk shot
    FOOTAGE.drawFootage(c, "editor_team", NOW, iw, ih, "raw", 0.5);
  } else if (device === "print") {
    c.save(); c.translate(-iw / 2, -ih / 2); paint(c, iw, ih); c.restore();
  } else {                                       // a real hand holding the phone
    c.save(); c.rotate(device === "phone" ? -0.08 : 0.06); c.translate(0, ih * 0.12);
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 20; c.shadowOffsetY = 10;
    K.drawCut(c, "hand_green", ih * 1.25, (c, sw, sh) => { const z = 1.7; c.fillStyle = "#fff"; c.fillRect(0, 0, sw, sh); c.scale(1 / z, 1 / z); paint(c, sw * z, sh * z); });
    c.restore();
  }
  c.restore();
  c.save(); c.translate(clipAt === "tr" ? w / 2 - 70 : -w / 2 + 70, -h / 2 + 8); clip(c); c.restore();
}
function timer(c, a, b, t, at) {
  const u = clamp((t - at) / 3.5), s = Math.floor(lerp(a, b, u) * 60);
  const str = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  c.fillStyle = INK; rr(c, -130, -48, 260, 96, 14); c.fill();
  K.text(c, str, 0, 18, MONOB(54, { align: "center", color: "#f1d2b0" }));
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const header = (title, sub) => [
  el(540, 70, (c) => K.text(c, sub, 0, 0, MONO(22, { align: "center", color: "#dfe7f5" })), 0.05, "down"),
  el(540, 170, (c) => K.text(c, title, 0, 0, MONOB(58, { align: "center", color: "#fff" })), 0.1, "down"),
];
const reel = (p) => (c, w, h) => CARDS.reel(c, w, h, NOW, p, { D: 5 });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Raw Footage to Posted in 15 Minutes",
  dur: D,
  cuts: ["hand_green"],
  setup: () => { FABRIC = paintFabric(); },
  bg,
  fg: (c, t) => K.grain(c, t, 0.06),
  slides: [
    // 1 · Hook
    {
      els: [
        ...header("RAW TO POSTED IN 15 MIN", "VIBE EDITING · MY WORKFLOW"),
        el(0, 330, (c, t) => {
          divider(c, K.W, 400, TAN, { x: 40, w: 330, label: "00:00 DUMP" });
          rows(c, ["RAW CLIPS", "ONE MUSIC TRACK", "ZERO SORTING"], 50, 110, 400, t, 0.7);
        }, 0.2, "up", { far: 0.8 }),
        el(770, 520, (c) => photo(c, 440, 320, "#2f7a4a", "laptop", (c, w, h) => CARDS.media(c, w, h, NOW, { at: 0.8, gap: 0.08 }, {})), 0.4, "right", { rot: 3 }),
        el(0, 720, (c, t) => {
          divider(c, K.W, 400, PEACH, { x: 690, w: 350, label: "00:02 VIBE" });
          rows(c, ["ONE SENTENCE", "FIVE PARTS", "VIBE IT"], 620, 110, 400, t, 1.2);
        }, 0.35, "up", { far: 0.8 }),
        el(300, 920, (c) => photo(c, 420, 340, "#8d6fd1", "phone", (c, w, h) => CARDS.prompt(c, w, h, NOW, { text: "30s reel, punchy, teal & orange", at: 1.2, fs: 14, cps: 24 }, { D })), 0.55, "left", { rot: -4 }),
        el(0, 1110, (c, t) => {
          divider(c, K.W, 260, RED, { x: 40, w: 330, label: "00:12 POST", ink: "#fff" });
          rows(c, ["NOTES · CAPTION · POST"], 50, 110, 520, t, 1.7, { ink: "#fff", line: "rgba(255,255,255,.5)" });
          K.text(c, "swipe →", 50, 210, MONOB(30, { color: "#fff" }));
        }, 0.5, "up", { far: 0.8 }),
        el(800, 1210, (c) => photo(c, 380, 300, "#e9a23b", "tablet", reel({ look: "teal", caps: [["POSTED"]], capsAt: 1.9, capSize: 22 })), 0.7, "right", { rot: 4 }),
      ],
    },
    // 2 · 00:00-00:02 Dump
    {
      els: [
        ...header("STEP 1 · DUMP", "MINUTE 0 TO 2"),
        el(0, 360, (c, t) => {
          divider(c, K.W, 1000, TAN, { x: 60, w: 380, label: "00:00 — 00:02" });
          K.text(c, "DUMP", 60, 150, MONOB(110));
          K.text(c, "EVERYTHING.", 60, 250, MONOB(64));
          rows(c, ["ALL RAW CLIPS", "ONE MUSIC TRACK", "DON'T TRIM", "DON'T SORT"], 60, 380, 440, t, 0.8, { check: "#2f7a4a" });
        }, 0.15, "up", { far: 0.8 }),
        el(800, 900, (c) => photo(c, 440, 540, "#2f7a4a", "phone", (c, w, h) => CARDS.media(c, w, h, NOW, { at: 0.8, gap: 0.12, n: 6, cols: 2 }, {})), 0.4, "right", { rot: 4 }),
        el(830, 450, (c, t) => timer(c, 0, 2, t, 0.6), 0.5, "pop", { rot: 3 }),
      ],
    },
    // 3 · 00:02-00:05 Type the vibe
    {
      els: [
        ...header("STEP 2 · TYPE THE VIBE", "MINUTE 2 TO 5"),
        el(0, 360, (c, t) => {
          divider(c, K.W, 1000, PEACH, { x: 640, w: 380, label: "00:02 — 00:05" });
          K.text(c, "ONE", 560, 160, MONOB(110));
          K.text(c, "SENTENCE.", 560, 260, MONOB(84));
          rows(c, ["PLATFORM", "LENGTH", "ENERGY", "LOOK", "GOAL"], 560, 390, 440, t, 1.0, { check: "#8d6fd1", gap: 66 });
        }, 0.15, "up", { far: 0.8 }),
        el(290, 820, (c) => photo(c, 470, 640, "#8d6fd1", "phone", (c, w, h) => CARDS.prompt(c, w, h, NOW, { text: "30s Reel, high energy, teal & orange, bold captions, end on the product", at: 0.8, fs: 17, cps: 30, press: 3.4, doneLabel: "✓ EDIT READY" }, { D })), 0.4, "left", { rot: -4 }),
        el(820, 1180, (c, t) => timer(c, 2, 5, t, 0.6), 0.5, "pop", { rot: -3 }),
      ],
    },
    // 4 · 00:05-00:10 Director pass
    {
      els: [
        ...header("STEP 3 · DIRECTOR PASS", "MINUTE 5 TO 10"),
        el(0, 360, (c, t) => {
          divider(c, K.W, 1000, RED, { x: 60, w: 380, label: "00:05 — 00:10", ink: "#fff" });
          K.text(c, "3 NOTES,", 60, 150, MONOB(96, { color: "#fff" }));
          K.text(c, "1 RE-CUT.", 60, 250, MONOB(96, { color: "#fff" }));
        }, 0.15, "up", { far: 0.8 }),
        el(290, 960, (c) => photo(c, 380, 500, "#f2b6c4", "phone", reel({ look: "log", scenes: ["influencer_talk"], caps: [["before"]], capsAt: 0, capEvery: 0.01, capSize: 26, flash: false })), 0.4, "left", { rot: -5 }),
        el(780, 960, (c) => photo(c, 380, 500, "#e9a23b", "phone", reel({ look: "raw", scenes: ["influencer_talk"], title: "AFTER", titleAt: 1.8, caps: [["PUNCHY."]], capsAt: 2.0, capSize: 26 })), 0.55, "right", { rot: 4 }),
        el(540, 1290, (c, t) => { ["punchier 2s", "bigger caps", "end on logo"].forEach((x, i) => { if (t > 1.0 + i * 0.4) { c.save(); c.globalAlpha = win(1.0 + i * 0.4, 1.3 + i * 0.4, t); K.text(c, `${i + 1}·${x}`, (i - 1) * 330, 0, MONOB(28, { color: "#fff", align: "center" })); c.restore(); } }); }, 0.6, "none"),
      ],
    },
    // 5 · 00:10-00:15 Caption + post
    {
      els: [
        ...header("STEP 4 · CAPTION + POST", "MINUTE 10 TO 15"),
        el(0, 360, (c, t) => {
          divider(c, K.W, 1000, PINKS, { x: 640, w: 380, label: "00:10 — 00:15" });
          K.text(c, "CAPTION,", 560, 150, MONOB(92));
          K.text(c, "POST.", 560, 250, MONOB(92));
          rows(c, ["HOOK LINE", "1 CTA", "3-5 HASHTAGS"], 560, 380, 440, t, 0.9, { check: RED });
        }, 0.15, "up", { far: 0.8 }),
        el(300, 880, (c, t) => photo(c, 480, 660, "#2d5aa2", "phone", (c, w, h) => {
          c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
          K.text(c, "vibe.editing", 16, 30, MONOB(14));
          c.save(); c.beginPath(); c.rect(0, 44, w, w); c.clip(); c.translate(0, 44); FOOTAGE.drawFootage(c, "skincare", NOW, w, w, "raw", 0.5); c.restore();
          const s = K.typed("raw to posted in 15 min. comment VIBE for the prompts #vibeediting #reels", NOW, 1.2, 26);
          K.text(c, s, 14, w + 74, MONO(13, { maxW: w - 28, lh: 1.4, track: 0 }));
        }), 0.4, "left", { rot: -4 }),
        el(830, 1150, (c, t) => {
          if (t < 3.6) return timer(c, 10, 15, t, 0.4);
          const e = outBack(win(3.6, 3.9, t), 3);
          c.save(); c.scale(e, e); c.rotate(-0.12); c.strokeStyle = RED; c.lineWidth = 8; rr(c, -170, -60, 340, 120, 12); c.stroke();
          K.text(c, "POSTED ✓", 0, 18, MONOB(54, { align: "center", color: RED })); c.restore();
        }, 0.5, "pop"),
      ],
    },
    // 6 · CTA
    {
      els: [
        ...header("WANT THE PROMPTS?", "VIBE EDITING · FREE PROMPT PACK"),
        el(0, 330, (c, t) => {
          divider(c, K.W, 360, TAN, { x: 40, w: 330, label: "COMMENT" });
          K.text(c, "\"VIBE\"", 50, 170, MONOB(130));
          rows(c, ["→ THE FREE PROMPT PACK"], 50, 270, 560, t, 0.8);
        }, 0.2, "up", { far: 0.8 }),
        el(790, 540, (c) => photo(c, 420, 300, "#2f7a4a", "print", (c, w, h) => c.drawImage(K.IMG.pack, 0, 0, w, h)), 0.4, "right", { rot: 3 }),
        el(0, 730, (c, t) => {
          divider(c, K.W, 360, PEACH, { x: 690, w: 350, label: "SAVE" });
          rows(c, ["SAVE THIS WORKFLOW", "TRY IT ON YOUR NEXT", "REEL TONIGHT"], 50, 120, 560, t, 1.1);
        }, 0.35, "up", { far: 0.8 }),
        el(0, 1100, (c, t) => {
          divider(c, K.W, 300, RED, { x: 40, w: 330, label: "FOLLOW", ink: "#fff" });
          rows(c, ["ONE VIBE EDIT A DAY"], 50, 120, 560, t, 1.5, { ink: "#fff", line: "rgba(255,255,255,.5)" });
          K.text(c, "vibe editing", 50, 220, MONO(28, { color: "#fff" }));
        }, 0.5, "up", { far: 0.8 }),
        el(800, 1050, (c) => photo(c, 360, 420, "#e9a23b", "phone", reel({ look: "teal", caps: [["COMMENT"], ["VIBE"]], capsAt: 1.2, capSize: 22 })), 0.7, "right", { rot: 4 }),
      ],
    },
  ],
};
})();

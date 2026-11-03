// Carousel 18: Edit a Talking Head in 5 Minutes.
// Design system: a newspaper broadsheet. Newsprint paper, a masthead between double rules,
// DM Serif headlines, justified serif columns, real footage printed in black ink (grayscale,
// multiplied into the paper, with a dot screen), a red "editor's pick" stamp, classified ads.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const PAPER = "#eee8da", INK = "#1b1a17", RED = "#c8211b";
const HEAD = (size, o = {}) => ({ family: "DMSerif", size, weight: 400, color: INK, lh: 1.02, track: -size * 0.01, ...o });
const BODY = (size, o = {}) => ({ family: "Playfair", size, weight: 500, color: INK, lh: 1.35, ...o });
const CAP = (size, o = {}) => ({ family: "InterL", size, weight: 700, color: INK, track: size * 0.12, ...o });
const M = 60;

let FIBRE = null, DOTS = null;
function setup() {
  FIBRE = K.once(K.W, K.H, (c, W, H) => {
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
    const r = rnd(9);
    for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(90,70,40,${0.02 + r() * 0.05})`; c.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
    const g = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(120,90,40,.12)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  });
  DOTS = K.once(K.W, K.H, (c, W, H) => {
    c.fillStyle = "#fff"; c.fillRect(0, 0, W, H); c.fillStyle = "#b9b4a8";
    for (let y = 0; y < H; y += 5) for (let x = (y / 5) % 2 ? 2.5 : 0; x < W; x += 5) { c.beginPath(); c.arc(x, y, 1.1, 0, 7); c.fill(); }
  });
}
function newsprint(c, t) { c.drawImage(FIBRE, 0, 0); }
function masthead(c, S, section) {
  c.fillStyle = INK; c.fillRect(M, 70, K.W - M * 2, 3); c.fillRect(M, 78, K.W - M * 2, 1);
  K.text(c, "The Vibe Edit", K.W / 2, 160, HEAD(86, { align: "center" }));
  c.fillRect(M, 186, K.W - M * 2, 1); c.fillRect(M, 191, K.W - M * 2, 3);
  K.text(c, "VOL. 18", M, 222, CAP(17)); K.text(c, section, K.W / 2, 222, CAP(17, { align: "center" })); K.text(c, `PAGE ${S.idx + 1} OF 6`, K.W - M, 222, CAP(17, { align: "right" }));
  c.fillRect(M, 238, K.W - M * 2, 1);
}
// A real clip printed in ink: grayscale, multiplied into the paper, dot-screened.
function print(c, x, y, w, h, clip, t, o = {}) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.globalCompositeOperation = "multiply";
  c.filter = "grayscale(1) contrast(1.25) brightness(1.05)";
  c.translate(x, y);
  if (o.zoom) { c.translate(w / 2, h / 2); c.scale(o.zoom, o.zoom); c.translate(-w / 2, -h / 2); }
  FOOTAGE.drawFootage(c, clip, 0, w, h, "raw", o.focus ?? 0.5, o.offset || 0);
  c.filter = "none";
  c.restore();
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.55; c.drawImage(DOTS, 0, 0); c.restore();
  c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(x, y, w, h);
  if (o.caption) K.text(c, o.caption, x, y + h + 26, BODY(19, { italic: true, color: "#4a463e" }));
}
function columns(c, x, y, w, n, text, size = 22, t = 99, at = 0) {
  const gap = 26, cw = (w - gap * (n - 1)) / n, f = BODY(size, { maxW: cw });
  const lines = K.lines(c, text, f), per = Math.ceil(lines.length / n);
  const shown = Math.floor(clamp((t - at) * 1.5) * lines.length + 0.999);
  for (let i = 0; i < Math.min(lines.length, shown); i++) {
    const col = Math.floor(i / per), row = i % per;
    K.text(c, lines[i], x + col * (cw + gap), y + row * size * 1.35, BODY(size));
    if (row === 0 && col > 0) { c.fillStyle = "rgba(27,26,23,.4)"; c.fillRect(x + col * (cw + gap) - gap / 2, y - size, 1, per * size * 1.35); }
  }
}
function stamp(c, s, t, at) {
  if (t < at) return;
  const e = outBack(win(at, at + 0.3, t), 3);
  c.save(); c.scale(2 - e, 2 - e); c.globalAlpha = clamp(e); c.rotate(-0.16);
  c.strokeStyle = RED; c.lineWidth = 5; rr(c, -150, -46, 300, 92, 8); c.stroke(); rr(c, -142, -38, 284, 76, 5); c.stroke();
  K.text(c, s, 0, 13, CAP(30, { color: RED, align: "center", track: 4 }));
  c.restore();
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const head = (section) => el(0, 0, (c, t, lt, S) => masthead(c, S, section), 0.05, "fade", { out: "none" });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Edit a Talking Head in 5 Minutes",
  dur: D,
  setup,
  bg: newsprint,
  fg: (c, t) => K.grain(c, t, 0.06),
  slides: [
    // 1 · Hook: the front page
    { els: [
      head("FRONT PAGE · EDITING"),
      el(M, 340, (c) => K.text(c, "Talking-head videos\ndon't have to be boring.", 0, 0, HEAD(80)), 0.2, "fade"),
      el(M, 470, (c) => K.text(c, "Four edits, five minutes, one prompt. Here is the whole method.", 0, 0, BODY(30, { italic: true })), 0.4),
      el(M, 510, (c, t) => print(c, 0, 0, K.W - M * 2, 520, "vlog_talk", t, { caption: "Fig. 1: one take, no cuts. We fixed it in five minutes. Swipe for the method →" }), 0.3, "up", { far: 0.4 }),
      el(M, 1110, (c, t) => columns(c, 0, 0, K.W - M * 2, 3, "Most creators film a strong take and then lose the viewer in the first pause. The fix is not a new camera. It is four small edits that any AI editor can do on command: remove the silences, punch in on the key lines, caption every word and cover the cuts with B-roll.", 21, t, 0.8), 0.6),
      el(860, 600, (c, t) => stamp(c, "EDITOR'S PICK", t, 1.5), 0, "none"),
    ] },
    // 2 · Edit 1: jump cuts
    { els: [
      head("EDIT NO. 1"),
      el(M, 330, (c) => K.text(c, "Cut every silence.", 0, 0, HEAD(88)), 0.15),
      el(M, 390, (c) => K.text(c, "Pauses over 0.3 s go. The jump cut keeps the energy up.", 0, 0, BODY(28, { italic: true })), 0.3),
      el(M, 450, (c, t) => {
        const w = K.W - M * 2, h = 220;
        c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(0, 0, w, h);
        K.text(c, "WAVEFORM · TAKE 1", 14, 28, CAP(16));
        const gaps = [[0.18, 0.27], [0.43, 0.5], [0.66, 0.78]], cut = outCubic(win(1.0, 1.8, t));
        let x = 14;
        for (let i = 0; i < 160; i++) {
          const u = i / 160, inGap = gaps.some(([a, b]) => u > a && u < b);
          const a = inGap ? 3 : 10 + 70 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.23));
          if (inGap && cut > 0) continue;
          c.fillStyle = inGap ? "rgba(200,33,27,.8)" : INK; c.fillRect(x, h / 2 + 14 - a / 2, 3.5, a); x += (w - 28) / 160 * (inGap ? 1 - cut : 1);
        }
        if (cut < 1) gaps.forEach(([a, b]) => { c.strokeStyle = RED; c.lineWidth = 2; c.setLineDash([6, 5]); c.strokeRect(14 + a * (w - 28), 40, (b - a) * (w - 28) * (1 - cut), h - 54); c.setLineDash([]); });
        K.text(c, t > 1.8 ? "−4.2 s of dead air" : "3 silences found", w - 14, h - 14, CAP(18, { align: "right", color: RED }));
      }, 0.4, "up", { far: 0.4 }),
      el(M, 720, (c, t) => {
        const w = (K.W - M * 2 - 30) / 2;
        print(c, 0, 0, w, 420, "influencer_talk", t, { caption: "Before: \"so… um… today…\"", focus: 0.5 });
        print(c, w + 30, 0, w, 420, "influencer_talk", t, { caption: "After: straight to the point.", focus: 0.5, offset: 1.2 });
        if (Math.floor(t * 3) % 2) { c.fillStyle = RED; c.fillRect(w + 30, 0, w, 6); }
      }, 0.6, "up", { far: 0.4 }),
      el(M, 1250, (c) => K.text(c, "PROMPT: \"remove every pause longer than 0.3 seconds\"", 0, 0, CAP(20)), 1.2),
    ] },
    // 3 · Edit 2: punch-ins
    { els: [
      head("EDIT NO. 2"),
      el(M, 330, (c) => K.text(c, "Punch in on the point.", 0, 0, HEAD(84)), 0.15),
      el(M, 390, (c) => K.text(c, "Every second sentence, scale to 115%. It feels like a second camera.", 0, 0, BODY(28, { italic: true })), 0.3),
      el(M, 450, (c, t) => {
        const w = K.W - M * 2, h = 640, k = (Math.floor(t / 1.25) % 2) ? 1.18 : 1;
        print(c, 0, 0, w, h, "podcast_two", t, { zoom: k, focus: 0.62, caption: k > 1 ? "Fig. 2: punched in at 118% on the key line." : "Fig. 2: the wide." });
        c.strokeStyle = RED; c.lineWidth = 3; c.setLineDash([10, 8]); c.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84); c.setLineDash([]);
        K.text(c, k > 1 ? "118%" : "100%", w - 16, 40, CAP(26, { align: "right", color: RED }));
      }, 0.4, "up", { far: 0.4 }),
      el(M, 1200, (c, t) => columns(c, 0, 0, K.W - M * 2, 2, "Alternate wide and tight. Never zoom twice in a row, and never on a pause. Tight shots land the punchline; the wide gives the eye a rest.", 23, t, 1.0), 0.8),
    ] },
    // 4 · Edit 3 + 4: captions and B-roll
    { els: [
      head("EDITS NO. 3 & 4"),
      el(M, 330, (c) => K.text(c, "Caption it. Cover it.", 0, 0, HEAD(86)), 0.15),
      el(M, 400, (c, t) => {
        const w = 560, h = 760, onB = ((t % 2.5) > 1.5);
        print(c, 0, 0, w, h, onB ? "barista" : "vlog_talk", t, { focus: 0.5, caption: onB ? "B-roll covers the jump cut." : "Word-by-word captions." });
        const words = ["THIS", "CHANGED", "MY", "EDITS"], n = Math.floor((t * 3) % 5);
        K.text(c, words.slice(0, n).join(" "), w / 2, h * 0.75, { family: "ArchX9", size: 44, weight: 900, color: "#fff", align: "center", stroke: INK, strokeW: 9 });
      }, 0.3, "left", { far: 0.4 }),
      el(660, 470, (c) => K.text(c, "3.", 0, 0, HEAD(70, { color: RED })), 0.5),
      el(660, 520, (c, t) => columns(c, 0, 0, 360, 1, "Burn in captions, three words at a time, centred low. Most people watch on mute.", 22, t, 0.6), 0.5),
      el(660, 840, (c) => K.text(c, "4.", 0, 0, HEAD(70, { color: RED })), 0.8),
      el(660, 890, (c, t) => columns(c, 0, 0, 360, 1, "Lay a B-roll shot over any cut that still feels jumpy. One shot per sentence is plenty.", 22, t, 0.9), 0.8),
    ] },
    // 5 · The prompt: a classified ad
    { els: [
      head("CLASSIFIEDS"),
      el(M, 330, (c) => K.text(c, "The whole edit, in one line.", 0, 0, HEAD(70)), 0.15),
      el(K.W / 2, 720, (c, t) => {
        const w = K.W - M * 2, h = 520;
        c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(-w / 2, -h / 2, w, h); c.lineWidth = 1; c.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
        K.text(c, "WANTED: A BETTER TALKING HEAD", 0, -h / 2 + 70, CAP(28, { align: "center" }));
        c.fillStyle = INK; c.fillRect(-w / 2 + 40, -h / 2 + 96, w - 80, 1.5);
        K.text(c, K.typed("\"Remove pauses over 0.3 s, punch in to 115% every second sentence, add word-by-word captions centred low, and cover jump cuts with my B-roll.\"", t, 0.6, 70), -w / 2 + 50, -h / 2 + 170, HEAD(46, { maxW: w - 100, lh: 1.2 }));
      }, 0.3, "up", { far: 0.4 }),
      el(M, 1110, (c, t) => print(c, 0, 0, 300, 180, "vlog_talk", t, { focus: 0.5 }), 0.6),
      el(M + 330, 1150, (c) => K.text(c, "Paste it. Watch the edit\nbuild itself in under five minutes.", 0, 0, BODY(28, { italic: true })), 0.7),
      el(880, 1210, (c, t) => stamp(c, "COPY THIS", t, 3.5), 0, "none"),
    ] },
    // 6 · CTA
    { els: [
      head("SUBSCRIBE"),
      el(K.W / 2, 400, (c) => K.text(c, "Comment", 0, 0, HEAD(150, { align: "center" })), 0.15, "fade"),
      el(K.W / 2, 580, (c, t) => { const e = 1 + 0.02 * Math.sin(t * 5); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, HEAD(210, { align: "center", color: RED })); }, 0.3, "fade"),
      el(K.W / 2, 660, (c) => K.text(c, "and the free prompt pack is delivered to your DMs.", 0, 0, BODY(32, { italic: true, align: "center" })), 0.45),
      el(M, 720, (c) => { c.fillStyle = INK; c.fillRect(0, 0, K.W - M * 2, 3); c.fillRect(0, 7, K.W - M * 2, 1); }, 0.5),
      ...[["podcast_women", "Save this page."], ["street_vlog", "Share with a creator."], ["vlog_studio", "Follow for the next issue."]].map(([clip, cap], i) =>
        el(M + i * 330, 770, (c, t) => print(c, 0, 0, 300, 380, clip, t, { caption: cap, focus: 0.5 }), 0.6 + i * 0.12, "up", { far: 0.3 })),
      el(K.W / 2, 1290, (c) => K.text(c, "· ALL THE EDITS FIT TO PRINT ·", 0, 0, CAP(18, { align: "center" })), 1.0),
    ] },
  ],
};
})();

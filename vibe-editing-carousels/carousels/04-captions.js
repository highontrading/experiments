// Carousel 04: Captions That Keep People Watching.
// Design system: pink retro (cream grid paper, pink stripes and checks, tight lowercase
// black type with pink accents, pink tags, heart speech-bubble stickers, book-style cards
// and post frames with a solid pink offset shadow, pink message bubbles).
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const CREAM = "#fbf8f2", GRID = "#ebe4dc", PINK = "#f29bbb", PINK2 = "#e5779e", PINKL = "#fbdbe7", INK = "#121212";
const T = (size, weight = 800, o = {}) => ({ family: "InterD", size, weight, color: INK, track: -size * 0.045, ...o });

// -------------------------------------------------------------- backdrops --
function grid(c) {
  c.fillStyle = CREAM; c.fillRect(0, 0, K.W, K.H);
  c.strokeStyle = GRID; c.lineWidth = 2; c.beginPath();
  for (let x = 0; x <= K.W; x += 54) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, K.H); }
  for (let y = 0; y <= K.H; y += 54) { c.moveTo(0, y + 0.5); c.lineTo(K.W, y + 0.5); }
  c.stroke();
}
function stripes(c, t) {
  c.fillStyle = "#fff"; c.fillRect(0, 0, K.W, K.H);
  c.fillStyle = PINK;
  const sh = (t * 12) % 120;
  for (let x = -120 + sh; x < K.W; x += 120) c.fillRect(x, 0, 60, K.H);
}
function checks(c) {
  c.fillStyle = CREAM; c.fillRect(0, 0, K.W, K.H);
  c.fillStyle = "#f7e9e6";
  for (let y = 0; y < K.H; y += 90) for (let x = (y / 90) % 2 ? 90 : 0; x < K.W; x += 180) c.fillRect(x, y, 90, 90);
}
const paper = (c, t) => { c.globalAlpha = 1; K.grain(c, t, 0.06); };

// ------------------------------------------------------------- components --
function tag(c, s, o = {}) {
  const f = T(o.size || 34, 600, { track: -1 });
  const w = K.measure(c, s, f) + 36, h = (o.size || 34) * 1.45;
  c.fillStyle = o.fill || PINK; rr(c, -w / 2, -h / 2, w, h, 8); c.fill();
  c.strokeStyle = o.edge || PINK2; c.lineWidth = 2.5; c.stroke();
  K.text(c, s, 0, (o.size || 34) * 0.34, { ...f, align: "center", color: o.color || INK });
  return w;
}
function heartSticker(c, s = 1, t = 0) {
  c.save(); c.scale(s, s);
  const draw = (dx, dy, fill, stroke) => {
    c.save(); c.translate(dx, dy);
    c.beginPath(); c.roundRect(-46, -40, 92, 80, 26);
    c.moveTo(-26, 34); c.lineTo(-38, 56); c.lineTo(-8, 38);
    c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 4; c.lineJoin = "round"; c.stroke(); }
    c.restore();
  };
  draw(7, 7, PINK); draw(0, 0, "#fff", INK);
  const b = 1 + 0.12 * Math.max(0, Math.sin(t * 6));
  c.save(); c.translate(0, 2); c.scale(b, b); K.heartPath(c, 46); c.fillStyle = PINK2; c.fill(); c.strokeStyle = INK; c.lineWidth = 3.5; c.stroke(); c.restore();
  c.restore();
}
function offsetCard(c, w, h, r = 14, fill = "#fff", sh = PINK) {
  c.fillStyle = sh; rr(c, -w / 2 + 12, -h / 2 + 12, w, h, r); c.fill();
  c.fillStyle = fill; rr(c, -w / 2, -h / 2, w, h, r); c.fill();
  c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
}
function phone(c, w, h, paint) {
  c.fillStyle = PINK; rr(c, -w / 2 + 12, -h / 2 + 12, w, h, 34); c.fill();
  c.fillStyle = "#111"; rr(c, -w / 2, -h / 2, w, h, 34); c.fill();
  c.save(); rr(c, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 26); c.clip(); c.translate(-w / 2 + 10, -h / 2 + 10);
  paint(c, w - 20, h - 20);
  c.restore();
  c.fillStyle = "#111"; rr(c, -40, -h / 2 + 16, 80, 20, 10); c.fill();
}
// Captions over footage. mode: pop (word by word), karaoke (line shows, word lights up), keyword.
function captions(c, w, h, t, lines, mode, at = 0.8, every = 0.38, y0 = 0.62) {
  const flat = lines.flat();
  const n = mode === "pop" ? clamp(Math.floor((t - at) / every) + 1, 0, flat.length) : flat.length;
  const lit = mode === "karaoke" ? Math.floor(Math.max(0, t - at) / every) % flat.length : -1;
  let idx = 0;
  lines.forEach((ln, li) => {
    const f = { family: "ArchX9", size: K.fit(c, ln.join(" "), w - 40, { family: "ArchX9", weight: 900, size: 44 }), weight: 900 };
    const full = K.measure(c, ln.join(" "), f), sp = K.measure(c, " ", f);
    let x = w / 2 - full / 2;
    ln.forEach((wd, j) => {
      const wi = idx + j, ww = K.measure(c, wd, f);
      if (wi < n && (mode !== "pop" || t >= at)) {
        const e = mode === "pop" ? outBack(win(at + wi * every, at + wi * every + 0.18, t), 2.4) : 1;
        const y = h * y0 + li * f.size * 1.2;
        c.save(); c.translate(x + ww / 2, y); c.scale(e, e);
        if (wi === lit) { c.fillStyle = PINK2; rr(c, -ww / 2 - 8, -f.size * 0.86, ww + 16, f.size * 1.08, 8); c.fill(); }
        const key = mode === "keyword" && wd.startsWith("*");
        const word = wd.replace("*", "");
        K.text(c, word, 0, 0, { ...f, align: "center", color: key ? PINK : mode === "karaoke" && wi !== lit ? "rgba(255,255,255,.75)" : "#fff", stroke: "#000", strokeW: 8 });
        c.restore();
      }
      x += ww + sp;
    });
    idx += ln.length;
  });
}
function bubble(c, s, side, t, at, o = {}) {
  if (t < at) return 0;
  const e = outBack(win(at, at + 0.3, t), 2);
  const f = T(o.size || 34, 600, { track: -0.5, maxW: o.maxW || 560, lh: 1.25 });
  const lines = K.lines(c, s, f);
  const w = Math.max(...lines.map((l) => K.measure(c, l, f))) + 56, h = lines.length * f.size * 1.25 + 40;
  c.save(); c.scale(e, e);
  const x = side === "right" ? -w : 0;
  c.fillStyle = side === "right" ? PINK2 : "#fff"; rr(c, x, -h / 2, w, h, 26); c.fill();
  if (side !== "right") { c.strokeStyle = INK; c.lineWidth = 3; c.stroke(); }
  c.beginPath();
  if (side === "right") { c.moveTo(-28, h / 2 - 22); c.lineTo(10, h / 2 - 12); c.lineTo(-10, h / 2 - 36); }
  else { c.moveTo(28, h / 2 - 22); c.lineTo(-10, h / 2 - 12); c.lineTo(10, h / 2 - 36); }
  c.fill();
  K.text(c, s, x + 28, -h / 2 + 20 + f.size * 0.95, { ...f, color: side === "right" ? "#fff" : INK });
  c.restore();
  return h;
}
function sideButtons(c, t, at) {
  const icons = ["heart", "thumb", "share"];
  icons.forEach((k, i) => {
    const e = outBack(win(at + i * 0.15, at + i * 0.15 + 0.3, t), 2.6);
    if (t < at + i * 0.15) return;
    c.save(); c.translate(0, i * 120); c.scale(e, e);
    c.fillStyle = "#fff"; c.beginPath(); c.arc(0, 0, 46, 0, 7); c.fill();
    c.strokeStyle = INK; c.lineWidth = 3.5; c.stroke();
    c.fillStyle = PINK; c.beginPath(); c.arc(0, 0, 32, 0, 7); c.fill();
    c.strokeStyle = "#fff"; c.fillStyle = "#fff"; c.lineWidth = 4; c.lineJoin = c.lineCap = "round";
    if (k === "heart") { K.heartPath(c, 34); c.fill(); }
    else if (k === "thumb") { rr(c, -14, -2, 10, 20, 3); c.fill(); c.beginPath(); c.moveTo(-2, 18); c.lineTo(14, 18); c.lineTo(16, 0); c.lineTo(4, 0); c.lineTo(6, -14); c.lineTo(0, -16); c.lineTo(-2, 0); c.closePath(); c.fill(); }
    else { c.beginPath(); c.moveTo(-14, 12); c.quadraticCurveTo(-12, -6, 8, -6); c.lineTo(8, -16); c.lineTo(20, -2); c.lineTo(8, 12); c.lineTo(8, 4); c.quadraticCurveTo(-6, 2, -14, 12); c.fill(); }
    c.restore();
  });
}
function styleCard(c, w, h, a, b, t, paint) {
  offsetCard(c, w, h, 12);
  K.text(c, a, -w / 2 + 22, -h / 2 + 52, T(40, 800));
  K.text(c, b, -w / 2 + 22, -h / 2 + 90, T(32, 700, { color: PINK2 }));
  c.fillStyle = INK; for (let i = 0; i < 3; i++) c.fillRect(w / 2 - 54, -h / 2 + 30 + i * 10, 30, 3);
  c.save(); rr(c, -w / 2 + 16, -h / 2 + 112, w - 32, h - 128, 8); c.clip(); c.translate(-w / 2 + 16, -h / 2 + 112);
  paint(c, w - 32, h - 128); c.restore();
}

// ----------------------------------------------------------------- slides --
const D = 5;
const hearts = (list) => list.map(([x, y, s, at, rot]) => ({ x, y, rot, in: "grow", at, float: 1.5, draw: (c, t) => heartSticker(c, s, t + at) }));
window.CAROUSEL = {
  kit: true,
  title: "Captions That Keep People Watching",
  dur: D,
  fg: paper,
  slides: [
    // 1 · Hook
    {
      bg: (c) => grid(c),
      els: [
        { x: 90, y: 300, in: "left", at: 0.05, draw: (c) => K.text(c, "80% watch", 0, 0, T(150)) },
        { x: 90, y: 450, in: "left", at: 0.15, draw: (c) => K.text(c, "on mute.", 0, 0, T(150)) },
        { x: 210, y: 175, rot: -7, in: "pop", at: 0.5, draw: (c) => tag(c, "no sound") },
        { x: 760, y: 345, rot: 6, in: "pop", at: 0.7, draw: (c) => tag(c, "on the bus") },
        { x: 820, y: 475, rot: -4, in: "pop", at: 0.9, draw: (c) => tag(c, "in bed, 1am") },
        { x: 95, y: 560, in: "fade", at: 1.1, draw: (c) => K.text(c, "your captions are the edit.", 0, 0, T(58, 800, { color: PINK2 })) },
        { x: 720, y: 980, rot: 7, in: "up", at: 0.4, float: 1, draw: (c, t) => phone(c, 330, 600, (c, w, h) => { K.photo(c, 0, 0, w, h, "city", t * 0.4, "teal"); captions(c, w, h, t, [["READ", "THIS"], ["WITHOUT"], ["SOUND?"]], "pop", 1.2, 0.35, 0.56); }) },
        { x: 260, y: 900, rot: -4, in: "left", at: 0.6, float: 1, draw: (c, t) => {
          offsetCard(c, 360, 230, 18);
          K.text(c, "sound off:", -150, -50, T(36, 800));
          K.text(c, "no captions", -150, 2, T(32, 600, { color: "#9a9a9a" }));
          K.text(c, "= scroll.", -150, 46, T(32, 700, { color: PINK2 }));
          c.strokeStyle = PINK2; c.lineWidth = 5; c.beginPath(); c.moveTo(-150, -10); c.lineTo(-150 + 175 * win(1.6, 2.0, t), -10); c.stroke();
        } },
        { x: 230, y: 1200, in: "fade", at: 1.4, draw: (c, t) => { c.translate(Math.sin(t * 5) * 6, 0); tag(c, "swipe for 3 styles →", { fill: "#fff", edge: INK, size: 32 }); } },
        ...hearts([[930, 170, 0.9, 0.8, 8], [110, 700, 0.7, 1.2, -10], [960, 1260, 0.8, 1.5, 6]]),
      ],
    },
    // 2 · Three styles
    {
      bg: (c) => grid(c),
      els: [
        { x: 600, y: 640, in: "pop", at: 0.05, draw: (c) => { K.text(c, "caption", 0, 0, T(120, 800, { align: "center" })); K.text(c, "styles", 0, 110, T(120, 800, { align: "center", color: PINK })); } },
        { x: 215, y: 330, rot: -8, in: "left", at: 0.3, float: 1, draw: (c, t) => styleCard(c, 330, 440, "style 01", "word pop", t, (c, w, h) => { K.photo(c, 0, 0, w, h, "sunrise", t * 0.3, "teal"); captions(c, w, h, t, [["ONE"], ["WORD"]], "pop", 0.9, 0.45, 0.6); }) },
        { x: 860, y: 300, rot: 7, in: "right", at: 0.45, float: 1, draw: (c, t) => styleCard(c, 330, 440, "style 02", "karaoke", t, (c, w, h) => { K.photo(c, 0, 0, w, h, "city", t * 0.3, "film"); captions(c, w, h, t, [["THE", "WORD"], ["LIGHTS", "UP"]], "karaoke", 0.9, 0.35, 0.55); }) },
        { x: 290, y: 1050, rot: 6, in: "left", at: 0.6, float: 1, draw: (c, t) => styleCard(c, 330, 440, "style 03", "keyword color", t, (c, w, h) => { K.photo(c, 0, 0, w, h, "ocean", t * 0.3, "pastel"); captions(c, w, h, t, [["SAVE", "*TIME"], ["EVERY", "*EDIT"]], "keyword", 0.9, 0.4, 0.55); }) },
        { x: 820, y: 1070, rot: -6, in: "right", at: 0.75, float: 1, draw: (c, t) => {
          offsetCard(c, 360, 300, 18, "#fff");
          K.text(c, "all 3 work.", -150, -70, T(40, 800));
          K.text(c, "pick 1 and", -150, -14, T(34, 600));
          K.text(c, "stick to it.", -150, 30, T(34, 600));
          c.save(); c.translate(0, 98); tag(c, "consistency = brand", { size: 26 }); c.restore();
        } },
        ...hearts([[560, 230, 0.8, 0.9, -6], [90, 760, 0.7, 1.1, 8], [1000, 700, 0.75, 1.3, -8]]),
      ],
    },
    // 3 · Style 01: word pop
    {
      bg: (c, t) => stripes(c, t),
      els: [
        { x: 560, y: 650, rot: -1.5, in: "pop", at: 0.05, draw: (c, t) => {
          offsetCard(c, 700, 960, 26);
          c.fillStyle = PINKL; c.beginPath(); c.arc(-300, -420, 26, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
          K.text(c, "style 01 · word pop", -260, -408, T(34, 800));
          c.fillStyle = PINK2; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(270 + i * 18, -420, 5, 0, 7); c.fill(); }
          c.save(); rr(c, -320, -370, 640, 700, 16); c.clip(); c.translate(-320, -370);
          K.photo(c, 0, 0, 640, 700, "sunrise", t * 0.35, "teal");
          captions(c, 640, 700, t, [["ONE", "WORD"], ["PER", "BEAT."]], "pop", 0.9, 0.45, 0.66);
          c.restore();
          const y = 400;
          U.icon.heart(c, -290, y, 40, t > 3.2 ? PINK2 : null, t > 3.2 ? null : INK);
          U.icon.bubble(c, -230, y, 38, INK); U.icon.plane(c, -170, y, 38, INK); U.icon.bookmark(c, 290, y, 38, null, INK);
        } },
        { x: 110, y: 470, in: "left", at: 0.4, draw: (c, t) => sideButtons(c, t, 0.6) },
        { x: 560, y: 1260, in: "up", at: 0.6, draw: (c) => tag(c, "big · bold · one word at a time", { size: 34, fill: "#fff", edge: INK }) },
        { x: 560, y: 90, in: "down", at: 0.3, draw: (c) => tag(c, "best for: hype, music, fast cuts", { size: 32 }) },
      ],
    },
    // 4 · Style 02: karaoke
    {
      bg: (c) => checks(c),
      els: [
        { x: 1000, y: 200, in: "right", at: 0.1, draw: (c, t) => bubble(c, "what are karaoke captions?", "right", t, 0.4) },
        { x: 80, y: 360, in: "left", at: 0.1, draw: (c, t) => bubble(c, "the whole line shows… and the word being said lights up.", "left", t, 1.0, { maxW: 600 }) },
        { x: 600, y: 900, rot: 4, in: "up", at: 0.3, float: 1, draw: (c, t) => phone(c, 440, 720, (c, w, h) => { K.photo(c, 0, 0, w, h, "city", t * 0.35, "film"); captions(c, w, h, t, [["YOUR", "EYES"], ["FOLLOW", "THE", "WORD"]], "karaoke", 1.2, 0.32, 0.6); }) },
        { x: 190, y: 760, rot: -8, in: "pop", at: 1.6, draw: (c) => tag(c, "style 02") },
        { x: 210, y: 1050, rot: -5, in: "left", at: 1.9, float: 1, draw: (c) => {
          offsetCard(c, 330, 250, 18);
          K.text(c, "best for:", -135, -60, T(34, 800));
          ["talking heads", "tutorials", "podcasts"].forEach((s, i) => K.text(c, "♥ " + s, -135, -8 + i * 44, T(30, 600, { color: i === 0 ? PINK2 : INK })));
        } },
        ...hearts([[960, 520, 0.8, 1.4, 10], [930, 1250, 0.7, 2.0, -6]]),
      ],
    },
    // 5 · Style 03 + the rules
    {
      bg: (c) => { c.fillStyle = PINK; c.fillRect(0, 0, K.W, K.H); c.fillStyle = CREAM; rr(c, 70, 110, K.W - 140, K.H - 180, 6); c.fill(); },
      els: [
        { x: 540, y: 116, in: "down", at: 0.05, draw: (c) => {        // binder clip
          c.fillStyle = "#1a1a1a"; rr(c, -70, -20, 140, 56, 8); c.fill();
          c.strokeStyle = "#1a1a1a"; c.lineWidth = 7; c.beginPath(); c.moveTo(-40, -18); c.lineTo(-22, -70); c.lineTo(22, -70); c.lineTo(40, -18); c.stroke();
        } },
        { x: 540, y: 290, in: "fade", at: 0.15, draw: (c) => { K.text(c, "mini", 0, 0, T(90, 800, { align: "center" })); K.text(c, "caption rules", 0, 88, T(90, 800, { align: "center" })); } },
        { x: 540, y: 465, in: "pop", at: 0.35, draw: (c) => { c.strokeStyle = INK; c.lineWidth = 3; rr(c, -190, -32, 380, 64, 10); c.stroke(); K.text(c, "style 03 · keyword color", 0, 12, T(32, 600, { align: "center", track: -0.5 })); } },
        { x: 150, y: 590, in: "none", at: 0, draw: (c, t) => {
          ["max 3 words a line", "keep it center-low", "color 1 keyword", "sync to the voice"].forEach((s, i) => {
            const at = 0.7 + i * 0.4, e = outBack(win(at, at + 0.3, t), 2);
            if (t < at) return;
            c.save(); c.translate((1 - e) * -80, i * 90); c.globalAlpha = clamp(e * 2);
            c.save(); c.translate(26, -14); K.heartPath(c, 36); c.fillStyle = PINK2; c.fill(); c.restore();
            K.text(c, s, 66, 0, T(44, 700, { track: -1.5 }));
            c.restore();
          });
        } },
        { x: 800, y: 980, rot: 5, in: "right", at: 0.5, float: 1, draw: (c, t) => phone(c, 300, 520, (c, w, h) => { K.photo(c, 0, 0, w, h, "ocean", t * 0.35, "pastel"); captions(c, w, h, t, [["THIS", "*SAVED"], ["MY", "*REEL"]], "keyword", 0, 0.4, 0.58); }) },
        { x: 330, y: 1080, rot: -2, in: "up", at: 2.4, draw: (c, t) => {
          offsetCard(c, 460, 280, 16);
          K.text(c, "the prompt:", -200, -80, T(30, 800, { color: PINK2 }));
          const s = K.typed("word-by-word captions, 3 words max, keywords in pink", t, 2.7, 30);
          K.text(c, s, -200, -32, T(30, 600, { maxW: 400, lh: 1.25, track: -0.5 }));
        } },
      ],
    },
    // 6 · CTA
    {
      bg: (c) => { grid(c); c.fillStyle = PINK; c.fillRect(0, 1130, K.W, 70); c.fillRect(0, 1240, K.W, 30); },
      els: [
        { x: 80, y: 260, in: "left", at: 0.05, draw: (c) => K.text(c, "save this", 0, 0, T(140)) },
        { x: 80, y: 395, in: "left", at: 0.12, draw: (c) => K.text(c, "for your", 0, 0, T(140)) },
        { x: 80, y: 530, in: "left", at: 0.19, draw: (c) => K.text(c, "next reel.", 0, 0, T(140, 800, { color: PINK2 })) },
        { x: 1000, y: 680, in: "right", at: 0.6, draw: (c, t) => bubble(c, "can I get the prompt pack?", "right", t, 0.8) },
        { x: 90, y: 820, in: "left", at: 0.6, draw: (c, t) => bubble(c, "comment VIBE and it's yours. free.", "left", t, 1.6) },
        { x: 820, y: 990, rot: -5, in: "pop", at: 2.4, float: 1, draw: (c, t) => { c.scale(1 + 0.05 * Math.sin(t * 6), 1 + 0.05 * Math.sin(t * 6)); tag(c, "comment \"VIBE\"", { size: 52, fill: PINK2, color: "#fff", edge: INK }); } },
        { x: 300, y: 1050, rot: 4, in: "pop", at: 2.8, draw: (c) => tag(c, "follow for more", { size: 36, fill: "#fff", edge: INK }) },
        ...hearts([[950, 160, 0.9, 0.6, 8], [560, 960, 0.6, 2.2, -8], [140, 1300, 0.6, 3.0, 6]]),
      ],
    },
  ],
};
})();

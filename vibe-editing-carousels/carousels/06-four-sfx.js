// Carousel 06: 4 SFX Every Reel Needs.
// Design system: a soft knit-textured blue sky with 8-bit pixel clouds, pixel hearts and a
// pixel rainbow; a heavy dark lowercase headline over a black script word with a thick
// white outline; a silver tray held up by a hand, serving cards; a bubbly lavender label;
// a fluffy cloud bed along the bottom.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const DARK = "#31251a", LAV = "#6b62c9";
const HEAVY = (size, o = {}) => ({ family: "InterD", size, weight: 900, color: DARK, track: -size * 0.05, ...o });
const BODY = (size, o = {}) => ({ family: "InterD", size, weight: 600, color: DARK, ...o });

// ----------------------------------------------------------------- sky --
let SKY = null;
function paintSky() {
  return K.once(K.W, K.H, (c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#5f97dc"); g.addColorStop(1, "#a9cdf2");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const r = rnd(5);
    c.filter = "blur(40px)";
    for (let i = 0; i < 14; i++) { c.fillStyle = "rgba(255,255,255,.45)"; c.beginPath(); c.ellipse(r() * W, r() * H * 0.9, 180 + r() * 220, 60 + r() * 70, 0, 0, 7); c.fill(); }
    c.filter = "none";
    // knit texture: tiny alternating v-stitches
    for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < W; x += 6) { c.fillStyle = "rgba(255,255,255,.05)"; c.fillRect(x, y, 3, 3); }
    // cloud bed
    c.filter = "blur(6px)";
    for (let i = 0; i < 40; i++) { const x = r() * W, y = H - 60 + r() * 80; c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); c.arc(x, y, 60 + r() * 90, 0, 7); c.fill(); }
    c.filter = "none";
  });
}
const PX_CLOUD = ["   XXXX     ", " XXXXXXXX   ", "XXXXXXXXXXX ", "XXXXXXXXXXXX", " ooooooooo  "];
function pixelCloud(c, x, y, s) {
  PX_CLOUD.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === " ") return;
    c.fillStyle = ch === "o" ? "#cfe4fb" : "#ffffff"; c.fillRect(x + i * s, y + j * s, s, s);
  }));
  c.fillStyle = "rgba(90,140,200,.35)";
  PX_CLOUD.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== " " && (j === PX_CLOUD.length - 1 || PX_CLOUD[j + 1][i] === " " || PX_CLOUD[j + 1][i] === undefined)) c.fillRect(x + i * s, y + (j + 1) * s - s * 0.25, s, s * 0.25); }));
}
const PX_HEART = [" XX XX ", "XXXXXXX", "XXXXXXX", " XXXXX ", "  XXX  ", "   X   "];
function pixelHeart(c, s, col = "#e8424f") {
  PX_HEART.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === "X") { c.fillStyle = col; c.fillRect((i - 3.5) * s, (j - 3) * s, s, s); } }));
  c.fillStyle = "rgba(255,255,255,.7)"; c.fillRect(-2.5 * s, -2 * s, s, s);
}
function pixelRainbow(c, len, s) {
  ["#e8424f", "#f59b3a", "#f6d847", "#5cc96b", "#4aa3e8", "#8e6be0"].forEach((col, i) => {
    c.fillStyle = col;
    for (let x = 0; x < len; x += s) c.fillRect(-x, i * s + (Math.floor(x / (s * 3)) % 2) * s * 0.5, s, s);
  });
}
const PX_BOLT = ["  XXX", " XXX ", "XXXXX", "  XX ", " XX  ", " X   "];
function pixelBolt(c, s) { PX_BOLT.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === "X") { c.fillStyle = "#f6d847"; c.fillRect((i - 2.5) * s, (j - 3) * s, s, s); } })); }
function skyBg(c, t) {
  c.drawImage(SKY, 0, 0);
  [[60, 80, 9], [380, 40, 7], [780, 100, 8], [930, 300, 6], [120, 420, 6]].forEach(([x, y, s], i) => {
    const dx = ((t * (10 + i * 3)) % 60) - 30;
    pixelCloud(c, x + dx, y, s);
  });
}

// ------------------------------------------------------------ components --
function script(c, s, size, o = {}) {
  const f = { family: "Dancing", size, weight: 700, align: o.align || "center", track: -size * 0.01 };
  K.text(c, s, 0, 0, { ...f, color: "#fff", stroke: "#fff", strokeW: size * 0.24 });
  K.text(c, s, 0, 0, { ...f, color: o.color || "#0d0d0d" });
}
function bubbly(c, s, size, o = {}) {
  const f = { family: "Fredoka", size, weight: 700, track: -size * 0.02, align: o.align || "center" };
  K.text(c, s, 4, 6, { ...f, color: "#4e46a8", stroke: "#4e46a8", strokeW: size * 0.3 });
  K.text(c, s, 0, 0, { ...f, color: "#fff", stroke: LAV, strokeW: size * 0.28 });
  K.text(c, s, 0, 0, { ...f, color: "#fff" });
}
// Silver tray centred at (0,0), seen from slightly above.
function tray(c, R, items, t) {
  const ry = R * 0.2;
  c.save(); c.shadowColor = "rgba(30,50,90,.35)"; c.shadowBlur = 30; c.shadowOffsetY = 24;
  c.beginPath(); c.ellipse(0, 6, R, ry, 0, 0, 7); c.fillStyle = "#a6abb5"; c.fill(); c.restore();
  const g = c.createLinearGradient(-R, 0, R, 0);
  g.addColorStop(0, "#8d939e"); g.addColorStop(0.25, "#f4f6fa"); g.addColorStop(0.5, "#c3c8d1"); g.addColorStop(0.75, "#f7f8fb"); g.addColorStop(1, "#8a909b");
  c.beginPath(); c.ellipse(0, 0, R, ry, 0, 0, 7); c.fillStyle = g; c.fill();
  c.beginPath(); c.ellipse(0, -2, R * 0.86, ry * 0.8, 0, 0, 7);
  const g2 = c.createLinearGradient(0, -ry, 0, ry); g2.addColorStop(0, "#e8ebf1"); g2.addColorStop(1, "#b5bbc6");
  c.fillStyle = g2; c.fill();
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; c.fillStyle = i % 2 ? "#ffffff" : "#9aa0ab"; c.beginPath(); c.arc(Math.cos(a) * R * 0.93, Math.sin(a) * ry * 0.93, 3.5, 0, 7); c.fill(); }
  if (items) items(c, R, ry);
}
function trayHand(c, R) {
  const sp = HANDS.make("thumb", { rot: -0.35, scale: 1.25 });
  c.save(); c.translate(-R * 0.82, R * 0.16); c.rotate(-0.35);
  c.shadowColor = "rgba(70,35,15,.3)"; c.shadowBlur = 16; c.shadowOffsetY = 10;
  c.drawImage(sp.back, -sp.ox, -sp.oy); c.drawImage(sp.front, -sp.ox, -sp.oy);
  c.restore();
}
// A small standing card (like a post served on the tray).
function sfxCard(c, w, h, label, kind, t, at) {
  K.panel(c, -w / 2, -h, w, h, 16, "#fff", { color: "rgba(30,50,90,.25)", blur: 16, y: 8 });
  const hit = pulse(t, at, 6);
  c.save(); c.translate(0, -h * 0.58); c.scale(1 + 0.15 * hit, 1 + 0.15 * hit);
  c.strokeStyle = "#1c1c1c"; c.fillStyle = "#1c1c1c"; c.lineWidth = 5; c.lineCap = c.lineJoin = "round";
  if (kind === "whoosh") { for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-w * 0.32, -18 + i * 18); c.quadraticCurveTo(0, -30 + i * 18, w * 0.32, -10 + i * 14); c.stroke(); } }
  else if (kind === "pop") { for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); c.lineTo(Math.cos(a) * 32, Math.sin(a) * 32); c.stroke(); } }
  else if (kind === "hit") { K.starburst(c, 0, 0, 40, 22, 9, "#1c1c1c"); }
  else { for (let i = 0; i < 7; i++) { const hh = 8 + i * 7; c.fillRect(-w * 0.32 + i * w * 0.1, 26 - hh, w * 0.06, hh); } }
  c.restore();
  K.text(c, label, 0, -h * 0.16, HEAVY(Math.min(30, w * 0.17), { align: "center", track: -1 }));
}
const SFX = [["WHOOSH", "whoosh"], ["POP", "pop"], ["HIT", "hit"], ["RISER", "riser"]];
function servedCards(t, at, w = 150, h = 190) {
  return (c, R, ry) => SFX.forEach(([l, k], i) => {
    const ct = at + i * 0.3, e = outBack(win(ct, ct + 0.35, t), 2.4);
    if (t < ct) return;
    c.save(); c.translate((i - 1.5) * (R * 0.42), -ry * 0.1 - (1 - e) * 120); c.globalAlpha = clamp(e * 2);
    sfxCard(c, w, h, l, k, t, ct + 1.6 + i * 0.5); c.restore();
  });
}
function waveCard(c, w, h, t, shape, hits = []) {
  K.panel(c, -w / 2, -h / 2, w, h, 26, "#fff", { color: "rgba(30,50,90,.25)", blur: 24, y: 12 });
  const n = Math.floor((w - 60) / 9);
  for (let i = 0; i < n; i++) {
    const u = i / n, a = shape(u, t) * (h / 2 - 40);
    c.fillStyle = "#1c1c1c"; rr(c, -w / 2 + 30 + i * 9, -a, 5, a * 2, 2); c.fill();
  }
  const ph = -w / 2 + 30 + (w - 60) * ((t % 2.5) / 2.5);
  c.fillStyle = "#e8424f"; c.fillRect(ph, -h / 2 + 20, 3, h - 40);
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "4 SFX Every Reel Needs",
  dur: D,
  setup: () => { SKY = paintSky(); },
  bg: skyBg,
  fg: (c, t) => K.grain(c, t, 0.07),
  slides: [
    // 1 · Hook
    {
      els: [
        el(540, 330, (c) => K.text(c, "sound is half", 0, 0, HEAVY(150, { align: "center" })), 0.05, "down"),
        el(540, 480, (c) => script(c, "the edit.", 170), 0.25, "pop"),
        el(870, 205, (c, t) => K.bro(c, 0, 0, 0.9, { eyes: "happy", glow: 0.5 + 0.3 * Math.sin(t * 4) }), 0.4, "grow", { float: 1.5 }),
        el(560, 780, (c, t) => { trayHand(c, 400); tray(c, 400, servedCards(t, 0.7), t); }, 0.3, "up", { far: 0.6 }),
        el(780, 1010, (c) => bubbly(c, "4 sounds", 96), 1.0, "pop", { rot: -3 }),
        el(780, 1080, (c) => K.text(c, "every reel needs", 0, 0, BODY(34, { align: "center" })), 1.2),
        el(140, 640, (c, t) => pixelHeart(c, 7), 1.4, "grow", { float: 2 }),
        el(990, 600, (c, t) => pixelHeart(c, 6), 1.6, "grow", { float: 2 }),
        el(260, 1250, (c, t) => { c.translate(Math.sin(t * 5) * 8, 0); K.text(c, "swipe →", 0, 0, BODY(36, { align: "center" })); }, 1.5),
      ],
    },
    // 2 · Whoosh
    {
      els: [
        el(90, 330, (c) => K.text(c, "01", 0, 0, HEAVY(260)), 0.05, "left"),
        el(700, 260, (c) => script(c, "whoosh", 180), 0.2, "pop", { rot: -4 }),
        el(700, 360, (c) => K.text(c, "on every transition", 0, 0, BODY(40, { align: "center" })), 0.4),
        el(540, 760, (c, t) => {
          K.panel(c, -400, -230, 800, 460, 30, "#fff", { color: "rgba(30,50,90,.25)", blur: 26, y: 12 });
          c.save(); rr(c, -380, -210, 760, 420, 20); c.clip();
          const sw = (t % 2) / 2, u = inOut(win(0.75, 1.15, t % 2 + 0.0001));
          K.photo(c, -380, -210, 760, 420, Math.floor(t / 2) % 2 ? "city" : "sunrise", t * 0.3, "teal");
          if (u > 0 && u < 1) {
            c.save(); c.beginPath(); c.rect(-380 + 760 * (1 - u), -210, 760 * u, 420); c.clip();
            K.photo(c, -380, -210, 760, 420, Math.floor(t / 2) % 2 ? "sunrise" : "city", t * 0.3, "teal"); c.restore();
            c.filter = "blur(10px)"; c.fillStyle = "rgba(255,255,255,.55)"; c.fillRect(-380 + 760 * (1 - u) - 40, -210, 80, 420); c.filter = "none";
          }
          c.restore();
        }, 0.3, "up"),
        el(540, 1120, (c, t) => waveCard(c, 800, 200, t, (u, t) => { const ph = (t % 2) / 2; return 0.1 + 0.9 * Math.exp(-Math.pow((u - ph) * 9, 2)); }), 0.5, "up"),
        el(0, 0, (c, t) => { const u = (t % 2) / 2; c.save(); c.translate(-200 + u * 1500, 600); pixelRainbow(c, 360, 9); c.restore(); }, 0.8, "none"),
      ],
    },
    // 3 · Pop
    {
      els: [
        el(720, 500, (c, t) => {
          c.rotate(0.06); trayHand(c, 330);
          tray(c, 330, (c, R, ry) => {
            c.save(); c.translate(0, -ry * 0.2);
            K.panel(c, -150, -470, 300, 470, 22, "#111", { color: "rgba(30,50,90,.3)", blur: 20, y: 10 });
            c.save(); rr(c, -142, -462, 284, 454, 16); c.clip(); c.translate(-142, -462);
            CARDS.reel(c, 284, 454, t, { look: "pastel", caps: [["POP"], ["POP"], ["POP!"]], capsAt: 0.8, capEvery: 0.6, capY: 0.45, flash: false }, { D });
            c.restore(); c.restore();
          }, t);
        }, 0.1, "right"),
        el(80, 930, (c) => K.text(c, "02", 0, 0, HEAVY(240)), 0.2, "left"),
        el(600, 960, (c) => script(c, "pop", 200), 0.35, "pop", { rot: -5 }),
        el(80, 1140, (c) => K.text(c, "on captions, stickers", 0, 0, BODY(42)), 0.5),
        el(80, 1192, (c) => K.text(c, "and text that appears.", 0, 0, BODY(42)), 0.55),
        ...[0, 1, 2].map((i) => el([200, 330, 160][i], [300, 420, 560][i], (c, t) => { const b = 1 + 0.4 * pulse(t, 0.8 + i * 0.6, 8); c.scale(b, b); pixelHeart(c, 8); }, 0.8 + i * 0.6, "grow")),
      ],
    },
    // 4 · Hit
    {
      els: [
        el(540, 300, (c, t) => {
          const sh = pulse(t, 1.5, 9) + pulse(t, 3.0, 9);
          c.translate(Math.sin(t * 90) * 18 * sh, Math.cos(t * 80) * 10 * sh);
          K.text(c, "03  hit", 0, 0, HEAVY(220, { align: "center" }));
        }, 0.05, "down"),
        el(540, 430, (c) => script(c, "on the drop & big reveals", 76), 0.3, "pop"),
        el(540, 800, (c, t) => {
          const sh = pulse(t, 1.5, 9) + pulse(t, 3.0, 9);
          c.translate(Math.sin(t * 90) * 24 * sh, Math.cos(t * 70) * 14 * sh);
          c.scale(1 + 0.05 * sh, 1 + 0.05 * sh);
          K.panel(c, -380, -260, 760, 520, 30, "#fff", { color: "rgba(30,50,90,.25)", blur: 26, y: 12 });
          K.photo(c, -360, -240, 720, 480, "city", t * 0.3, t > 1.5 ? "teal" : "log", 20);
          if (t > 1.5) { const e = outBack(win(1.5, 1.8, t), 3); c.save(); c.scale(e, e); K.text(c, "REVEAL", 0, 30, { family: "ArchX9", size: 100, weight: 900, color: "#fff", align: "center", stroke: "#000", strokeW: 12 }); c.restore(); }
          const f = sh; if (f > 0.03) { c.fillStyle = `rgba(255,255,255,${0.6 * Math.min(1, f)})`; rr(c, -360, -240, 720, 480, 20); c.fill(); }
        }, 0.2, "up"),
        el(540, 1200, (c, t) => tray(c, 300, (c, R, ry) => { c.save(); c.translate(0, -ry * 0.2); sfxCard(c, 170, 200, "BOOM", "hit", t, 1.5); c.restore(); }, t), 0.4, "up"),
        el(130, 1080, (c, t) => pixelBolt(c, 10), 1.5, "grow", { float: 2 }),
        el(950, 1060, (c, t) => pixelBolt(c, 9), 3.0, "grow", { float: 2 }),
      ],
    },
    // 5 · Riser + the prompt
    {
      els: [
        el(980, 300, (c) => K.text(c, "04", 0, 0, HEAVY(240, { align: "right" })), 0.05, "right"),
        el(360, 230, (c) => script(c, "riser", 180), 0.2, "pop", { rot: -5 }),
        el(360, 330, (c) => K.text(c, "before the big moment", 0, 0, BODY(40, { align: "center" })), 0.4),
        el(540, 590, (c, t) => {
          waveCard(c, 880, 300, t, (u, t) => { const p = (t % 2.5) / 2.5; return u < p ? 0.05 + 0.95 * Math.pow(u / Math.max(p, 0.01), 2) * Math.min(1, p * 1.6) : 0.04; });
          const p = (t % 2.5) / 2.5;
          c.strokeStyle = "#e8424f"; c.lineWidth = 6; c.lineCap = "round";
          c.beginPath(); c.moveTo(-360, 100); c.quadraticCurveTo(0, 90, -360 + 720 * p, 100 - 190 * p * p); c.stroke();
        }, 0.3, "up"),
        el(540, 1010, (c, t) => {
          K.panel(c, -440, -170, 880, 340, 40, "rgba(255,255,255,.95)", { color: "rgba(30,50,90,.2)", blur: 30, y: 12 });
          K.text(c, "the prompt:", -390, -100, BODY(30, { color: LAV, weight: 800 }));
          const s = K.typed("add a whoosh on every cut, a pop on each caption, a hit on the drop and a riser before the reveal", t, 1.0, 34);
          K.text(c, s, -390, -44, BODY(38, { maxW: 790, lh: 1.3, weight: 600 }));
        }, 0.6, "up"),
        el(540, 1270, (c) => bubbly(c, "all 4 in one line", 64), 3.6, "pop"),
      ],
    },
    // 6 · CTA
    {
      els: [
        el(540, 290, (c) => K.text(c, "comment", 0, 0, HEAVY(170, { align: "center" })), 0.05, "down"),
        el(540, 460, (c, t) => { const e = 1 + 0.04 * Math.sin(t * 5); c.scale(e, e); script(c, "\"VIBE\"", 200); }, 0.25, "pop"),
        el(560, 840, (c, t) => {
          trayHand(c, 400);
          tray(c, 400, (c, R, ry) => {
            c.save(); c.translate(0, -ry * 0.2 - 20);
            K.panel(c, -190, -250, 380, 250, 14, "#fff", { color: "rgba(30,50,90,.3)", blur: 20, y: 10 });
            c.drawImage(K.IMG.pack, -180, -240, 360, 230);
            c.restore();
            K.bro(c, R * 0.62, -ry * 0.1, 0.75, { eyes: "happy", glow: 0.5, wave: 0.8 + 0.4 * Math.sin(t * 9) });
          }, t);
        }, 0.35, "up", { far: 0.6 }),
        el(780, 1060, (c) => bubbly(c, "free prompt pack", 74), 1.0, "pop", { rot: -3 }),
        el(780, 1130, (c) => K.text(c, "save this · follow for more", 0, 0, BODY(32, { align: "center" })), 1.2),
        el(150, 700, (c) => pixelHeart(c, 7), 1.3, "grow", { float: 2 }),
        el(980, 640, (c) => pixelHeart(c, 6), 1.5, "grow", { float: 2 }),
        el(0, 0, (c, t) => { c.save(); c.translate(1120 - ((t * 260) % 1500), 150); pixelRainbow(c, 300, 8); c.restore(); }, 0.6, "none"),
      ],
    },
  ],
};
})();

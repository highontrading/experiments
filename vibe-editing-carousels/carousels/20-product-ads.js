// Carousel 20: 4 Prompts for Product Ads That Sell.
// Design system: black-and-gold luxury. Deep black, gold hairline frames and rules, Playfair
// italic headlines, wide-tracked light caps, Roman numerals, symmetric layouts with lots of
// air, real product footage, and a real watch cutout turning in a gold ring of light.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const GOLD = "#c9a45c", GOLDL = "#ecd49a", IVORY = "#f2ece0", BLACK = "#070707";
const SERIF = (size, o = {}) => ({ family: "Playfair", size, weight: 500, italic: true, color: IVORY, lh: 1.08, ...o });
const CAPS = (size, o = {}) => ({ family: "InterL", size, weight: 300, color: GOLD, track: size * 0.42, ...o });

function velvet(c, t) {
  c.fillStyle = BLACK; c.fillRect(0, 0, K.W, K.H);
  const g = c.createRadialGradient(K.W / 2, K.H * 0.45, 30, K.W / 2, K.H * 0.45, K.H * 0.75);
  g.addColorStop(0, "rgba(70,55,30,.42)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
}
function border(c, t) {
  const u = outCubic(win(0, 0.8, t)), m = 34;
  c.strokeStyle = GOLD; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(m, m + (K.H - 2 * m) * (1 - u)); c.lineTo(m, m); c.lineTo(m + (K.W - 2 * m) * u, m); c.stroke();
  c.beginPath(); c.moveTo(K.W - m, K.H - m - (K.H - 2 * m) * (1 - u)); c.lineTo(K.W - m, K.H - m); c.lineTo(K.W - m - (K.W - 2 * m) * u, K.H - m); c.stroke();
}
function rule(c, w, t, at) { const u = outCubic(win(at, at + 0.6, t)); c.fillStyle = GOLD; c.fillRect(-w / 2 * u, 0, w * u, 1.5); c.beginPath(); c.arc(0, 0.75, 4, 0, 7); c.fill(); }
// Real footage in a gold hairline frame with an inner margin.
function plate(c, w, h, clip, t, o = {}) {
  c.strokeStyle = GOLD; c.lineWidth = 1.5; c.strokeRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28);
  c.save();
  c.filter = o.filter || "grayscale(0.85) sepia(0.45) contrast(1.12) brightness(1.02)";
  K.photo(c, -w / 2, -h / 2, w, h, clip, t, o.look || "raw", 0, o.focus ?? 0.5);
  c.restore();
  if (o.light != null) { c.fillStyle = `rgba(0,0,0,${1 - o.light})`; c.fillRect(-w / 2, -h / 2, w, h); }
}
function watch(c, h, t) {
  const g = c.createRadialGradient(0, 0, h * 0.3, 0, 0, h * 0.75);
  g.addColorStop(0, "rgba(201,164,92,.35)"); g.addColorStop(1, "rgba(201,164,92,0)");
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, h * 0.75, 0, 7); c.fill();
  c.strokeStyle = GOLD; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, h * 0.62, 0, 7); c.stroke();
  c.save(); c.rotate(t * 0.6); c.fillStyle = GOLDL; c.beginPath(); c.arc(h * 0.62, 0, 4, 0, 7); c.fill(); c.restore();
  c.save(); c.rotate(Math.sin(t * 1.2) * 0.12); c.shadowColor = "rgba(0,0,0,.8)"; c.shadowBlur = 40; c.shadowOffsetY = 20;
  c.filter = "grayscale(0.85) sepia(0.45) contrast(1.12) brightness(1.02)"; K.drawCut(c, "watch", h); c.restore();
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
const header = (s) => [
  el(0, 0, (c, t) => border(c, t), 0, "none", { out: "none" }),
  el(K.W / 2, 110, (c) => K.text(c, s, 0, 0, CAPS(18, { align: "center" })), 0.1),
];
function numeral(n, title, line, y = 300) {
  return [
    el(K.W / 2, y - 80, (c) => K.text(c, n, 0, 0, SERIF(60, { align: "center", color: GOLD, italic: false })), 0.15),
    el(K.W / 2, y + 20, (c) => K.text(c, title, 0, 0, SERIF(92, { align: "center" })), 0.25, "fade"),
    el(K.W / 2, y + 60, (c, t) => rule(c, 260, t, 0.5), 0, "none"),
    el(K.W / 2, y + 120, (c) => K.text(c, line, 0, 0, { family: "InterL", size: 30, weight: 300, color: "rgba(242,236,224,.8)", align: "center", maxW: 800, lh: 1.4 }), 0.45),
  ];
}
function prompt(y, s, at = 1.0) {
  return el(K.W / 2, y, (c, t) => {
    K.text(c, "THE PROMPT", 0, 0, CAPS(16, { align: "center" }));
    K.text(c, K.typed(s, t, at, 48), 0, 56, SERIF(38, { align: "center", maxW: 880, lh: 1.25 }));
  }, at - 0.1);
}

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "4 Prompts for Product Ads That Sell",
  dur: D,
  cuts: ["watch"],
  bg: velvet,
  fg: (c, t) => { K.grain(c, t, 0.07); K.vignette(c, 0.4); },
  slides: [
    // 1 · Hook
    { els: [
      ...header("VIBE EDITING · THE PRODUCT EDIT"),
      el(K.W / 2, 560, (c, t) => watch(c, 520, t), 0.2, "grow", { dur: 1.2 }),
      el(K.W / 2, 980, (c) => K.text(c, "Your product deserves", 0, 0, SERIF(80, { align: "center" })), 0.5, "fade"),
      el(K.W / 2, 1075, (c) => K.text(c, "a better ad.", 0, 0, SERIF(96, { align: "center", color: GOLDL })), 0.65, "fade"),
      el(K.W / 2, 1130, (c, t) => rule(c, 320, t, 1.0), 0, "none"),
      el(K.W / 2, 1220, (c) => K.text(c, "FOUR PROMPTS · SWIPE", 0, 0, CAPS(18, { align: "center" })), 1.2),
    ] },
    // 2 · I. The reveal
    { els: [
      ...header("I · THE REVEAL"),
      ...numeral("I", "Start in the dark.", "Open on black, then light the product\nin the first 1.5 seconds."),
      el(K.W / 2, 860, (c, t) => plate(c, 820, 440, "watch_close", t, { light: clamp(((t % 2.5) - 0.2) / 1.2), focus: 0.6 }), 0.4, "fade"),
      prompt(1170, "\"open on black, fade the product up in 1.5 seconds, slow push-in\"", 1.2),
    ] },
    // 3 · II. The macro
    { els: [
      ...header("II · THE DETAIL"),
      ...numeral("II", "Go closer than close.", "Three macro shots of the texture,\nslowed to 50%. This is where value lives."),
      ...[["watch_close", 0.35], ["product_shoot", 0.55], ["watch_close", 0.8]].map(([clip, f], i) =>
        el(225 + i * 315, 860, (c, t) => { c.scale(1.4, 1.4); plate(c, 200, 290, clip, t, { focus: f }); }, 0.4 + i * 0.15, "fade")),
      prompt(1170, "\"add three macro detail shots at 50% speed, shallow focus\"", 1.2),
    ] },
    // 4 · III. In use
    { els: [
      ...header("III · IN USE"),
      ...numeral("III", "Put it in a life.", "People buy the feeling, not the object.\nShow a hand, a face, a moment."),
      el(330, 850, (c, t) => plate(c, 420, 460, "beauty_ad", t, { focus: 0.6 }), 0.4, "left"),
      el(750, 850, (c, t) => plate(c, 340, 460, "watch_ad", t, { focus: 0.5 }), 0.55, "right"),
      prompt(1170, "\"cut between the product and someone using it, every 2 beats\"", 1.2),
    ] },
    // 5 · IV. The end card
    { els: [
      ...header("IV · THE END CARD"),
      ...numeral("IV", "End on one line.", "Product, name, one benefit. Hold it\nfor two full seconds."),
      el(K.W / 2, 860, (c, t) => {
        c.strokeStyle = GOLD; c.lineWidth = 1.5; c.strokeRect(-430, -230, 860, 460);
        c.save(); c.beginPath(); c.rect(-416, -216, 832, 432); c.clip(); c.fillStyle = "#0b0a08"; c.fillRect(-416, -216, 832, 432);
        c.translate(-140, 10); watch(c, 330, t); c.restore();
        const e = outCubic(win(1.2, 1.8, t));
        c.save(); c.globalAlpha = e;
        K.text(c, "YOUR BRAND", 200, -40, CAPS(30, { align: "center", color: GOLDL }));
        K.text(c, "Built to be\nworn daily.", 200, 30, SERIF(46, { align: "center" }));
        K.text(c, "SHOP NOW", 200, 160, CAPS(16, { align: "center" }));
        c.restore();
      }, 0.4, "fade"),
      prompt(1170, "\"end on the product, its name and one benefit, hold 2 seconds\"", 1.4),
    ] },
    // 6 · CTA
    { els: [
      ...header("THE PRODUCT EDIT · SAVE THIS"),
      el(K.W / 2, 460, (c, t) => watch(c, 360, t), 0.15, "grow", { dur: 1.0 }),
      el(K.W / 2, 830, (c) => K.text(c, "Comment", 0, 0, SERIF(110, { align: "center" })), 0.35, "fade"),
      el(K.W / 2, 990, (c, t) => { const e = 1 + 0.02 * Math.sin(t * 4); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, SERIF(170, { align: "center", color: GOLDL, italic: false })); }, 0.5, "fade"),
      el(K.W / 2, 1040, (c, t) => rule(c, 360, t, 0.9), 0, "none"),
      el(K.W / 2, 1110, (c) => K.text(c, "for the free prompt pack · all four ad prompts", 0, 0, { family: "InterL", size: 30, weight: 300, color: IVORY, align: "center" }), 0.8),
      el(K.W / 2, 1220, (c) => K.text(c, "FOLLOW FOR MORE", 0, 0, CAPS(18, { align: "center" })), 1.0),
    ] },
  ],
};
})();

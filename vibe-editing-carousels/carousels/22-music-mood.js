// Carousel 22: Match the Music to the Mood.
// Design system: a 70s record store. Cream paper, rounded orange/mustard/brown rainbow
// stripes, album sleeves with real footage on them, a spinning vinyl record with a footage
// label, DM Serif display type and Archivo Black stickers, price-tag style BPM labels.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const CREAM = "#f4e8d3", BROWN = "#4a2a17", ORANGE = "#e2662b", MUSTARD = "#f0b23a", RUST = "#b8431f", TEAL = "#2f7f7a";
const DISPLAY = (size, o = {}) => ({ family: "DMSerif", size, weight: 400, color: BROWN, lh: 0.98, track: -size * 0.015, ...o });
const BLOCK = (size, o = {}) => ({ family: "ArchivoBlack", size, weight: 400, color: BROWN, track: size * 0.02, ...o });
const BODY = (size, o = {}) => ({ family: "InterL", size, weight: 500, color: BROWN, lh: 1.35, ...o });

let PAPER = null;
function setup() {
  PAPER = K.once(K.W, K.H, (c, W, H) => {
    c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
    const r = rnd(22);
    for (let i = 0; i < 7000; i++) { c.fillStyle = `rgba(120,70,30,${0.02 + r() * 0.04})`; c.fillRect(r() * W, r() * H, 1.5, 1.5); }
  });
}
function store(c, t) { c.drawImage(PAPER, 0, 0); }
// 70s rainbow: concentric rounded stripes from a corner.
function rainbow(c, x, y, r, t, at = 0, dir = 1, start = null) {
  const cols = [BROWN, RUST, ORANGE, MUSTARD], bw = r * 0.16, u = outCubic(win(at, at + 0.9, t));
  cols.forEach((col, i) => {
    c.strokeStyle = col; c.lineWidth = bw; c.lineCap = "butt";
    const rad = r - i * bw;
    const a0 = start ?? (dir > 0 ? Math.PI : 0);
    c.beginPath(); c.arc(x, y, rad, a0, a0 + Math.PI * u * dir, dir < 0); c.stroke();
  });
}
function stripes(c, y, t, at = 0) {
  [BROWN, RUST, ORANGE, MUSTARD].forEach((col, i) => { const u = outCubic(win(at + i * 0.08, at + i * 0.08 + 0.6, t)); c.fillStyle = col; c.fillRect(0, y + i * 26, K.W * u, 22); });
}
// A record: grooves, a sheen, and a real-footage label. Spins with t.
function record(c, r, clip, t, rpm = 0.55) {
  c.save(); c.rotate(t * rpm * Math.PI * 2);
  c.shadowColor = "rgba(60,30,10,.4)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = "#141110"; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.shadowColor = "transparent";
  for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(255,255,255,${i % 3 ? 0.04 : 0.08})`; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, r * (0.42 + i * 0.022), 0, 7); c.stroke(); }
  c.save(); c.beginPath(); c.arc(0, 0, r * 0.36, 0, 7); c.clip(); c.translate(-r * 0.36, -r * 0.36);
  FOOTAGE.drawFootage(c, clip, 0, r * 0.72, r * 0.72, "film", 0.5); c.restore();
  c.fillStyle = CREAM; c.beginPath(); c.arc(0, 0, r * 0.035, 0, 7); c.fill();
  c.restore();
  const g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0.35, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,.12)"); g.addColorStop(0.65, "rgba(255,255,255,0)");
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
}
// An album sleeve: real footage, a title band, a wear ring.
function sleeve(c, s, clip, t, title, o = {}) {
  c.save(); c.shadowColor = "rgba(60,30,10,.35)"; c.shadowBlur = 24; c.shadowOffsetY = 12;
  c.fillStyle = o.band || ORANGE; c.fillRect(-s / 2, -s / 2, s, s); c.restore();
  c.save(); c.filter = o.filter || "sepia(0.25) saturate(1.15) contrast(1.05)";
  K.photo(c, -s / 2 + 12, -s / 2 + 12, s - 24, s * 0.7, clip, t, "raw", 0, o.focus ?? 0.5); c.restore();
  if (title) { K.text(c, title, -s / 2 + 18, s / 2 - 22, DISPLAY(s * 0.14, { color: o.ink || CREAM })); }
  c.strokeStyle = "rgba(255,255,255,.14)"; c.lineWidth = 3; c.beginPath(); c.arc(0, -s * 0.05, s * 0.38, 0, 7); c.stroke();
}
function tag(c, s, col = MUSTARD) {
  const f = BLOCK(26), w = K.measure(c, s, f) + 50;
  c.save(); c.shadowColor = "rgba(60,30,10,.3)"; c.shadowBlur = 10; c.shadowOffsetY = 5;
  c.fillStyle = col; c.beginPath(); c.moveTo(-w / 2, -26); c.lineTo(w / 2 - 14, -26); c.lineTo(w / 2, 0); c.lineTo(w / 2 - 14, 26); c.lineTo(-w / 2, 26); c.closePath(); c.fill(); c.restore();
  c.fillStyle = CREAM; c.beginPath(); c.arc(w / 2 - 18, 0, 5, 0, 7); c.fill();
  K.text(c, s, -10, 9, { ...f, align: "center" });
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
function mood(n, name, sub, bpm, clip, rule, prompt, col, focus = 0.5) {
  return [
    el(0, 0, (c, t) => rainbow(c, K.W + 30, -30, 270, t, 0, 0.5, Math.PI / 2), 0, "none", { out: "fade" }),
    el(70, 150, (c) => K.text(c, `SIDE A · TRACK 0${n}`, 0, 0, BLOCK(22, { color: RUST })), 0.05),
    el(70, 300, (c) => K.text(c, name, 0, 0, DISPLAY(150)), 0.15, "left"),
    el(70, 370, (c) => K.text(c, sub, 0, 0, BODY(32, { weight: 600 })), 0.3),
    el(390, 780, (c, t) => sleeve(c, 560, clip, t, name.toLowerCase(), { band: col, focus }), 0.35, "left", { rot: -3 }),
    el(800, 760, (c, t) => record(c, 230, clip, t), 0.5, "right"),
    el(850, 560, (c) => tag(c, `${bpm} BPM`), 0.8, "pop", { rot: 8 }),
    el(70, 1170, (c) => K.text(c, rule, 0, 0, BODY(30, { maxW: 940, weight: 600 })), 0.9),
    el(70, 1270, (c, t) => K.text(c, K.typed(prompt, t, 1.2, 40), 0, 0, DISPLAY(36, { color: RUST })), 1.1),
  ];
}

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Match the Music to the Mood",
  dur: D,
  setup,
  bg: store,
  fg: (c, t) => K.grain(c, t, 0.07),
  slides: [
    // 1 · Hook
    { els: [
      el(0, 0, (c, t) => rainbow(c, -40, K.H + 40, 560, t, 0, 1), 0, "none", { out: "fade" }),
      el(70, 150, (c) => K.text(c, "VIBE EDITING RECORDS · SIDE A", 0, 0, BLOCK(22, { color: RUST })), 0.05),
      el(70, 320, (c) => K.text(c, "The song", 0, 0, DISPLAY(170)), 0.15, "left"),
      el(70, 480, (c) => K.text(c, "decides the edit.", 0, 0, DISPLAY(120, { color: RUST })), 0.3, "left"),
      el(70, 560, (c) => K.text(c, "Pick the mood first. The cuts, the grade and the pace follow.", 0, 0, BODY(30, { weight: 600, maxW: 900 })), 0.45),
      el(820, 900, (c, t) => record(c, 250, "beach_couple", t), 0.7, "right"),
      el(560, 900, (c, t) => sleeve(c, 520, "band_girls", t, "mood first", { band: RUST, focus: 0.55 }), 0.5, "up", { rot: -4 }),
      el(860, 1230, (c) => tag(c, "4 MOODS →", MUSTARD), 1.1, "pop", { rot: -6 }),
    ] },
    // 2-5 · Moods
    { els: mood(1, "Hype", "Sport, launches, glow-ups.", 128, "skate_park", "Cut on every beat. Hard cuts, speed ramps, punchy captions.", "\"cut on every beat, add speed ramps\"", ORANGE) },
    { els: mood(2, "Chill", "Day-in-the-life, cafes, lo-fi.", 85, "cafe_coffee", "Hold each shot 2-4 beats. Film grade, soft dissolves, no zooms.", "\"lo-fi pace, hold shots, film grade\"", TEAL) },
    { els: mood(3, "Cinematic", "Travel, stories, reveals.", 70, "aerial_wave", "Slow-motion build, silence for one beat, then hit the drop.", "\"slow build, cut to black, hit the drop\"", BROWN) },
    // 5 · Voice + music: ducking
    { els: [
      el(0, 0, (c, t) => rainbow(c, K.W + 30, -30, 270, t, 0, 0.5, Math.PI / 2), 0, "none", { out: "fade" }),
      el(70, 150, (c) => K.text(c, "SIDE A · TRACK 04", 0, 0, BLOCK(22, { color: RUST })), 0.05),
      el(70, 300, (c) => K.text(c, "Talking?", 0, 0, DISPLAY(150)), 0.15, "left"),
      el(70, 370, (c) => K.text(c, "Duck the music under your voice.", 0, 0, BODY(32, { weight: 600 })), 0.3),
      el(K.W / 2, 700, (c, t) => {
        const w = 940, h = 420;
        c.fillStyle = BROWN; rr(c, -w / 2, -h / 2, w, h, 26); c.fill();
        K.text(c, "VOICE", -w / 2 + 30, -h / 2 + 50, BLOCK(22, { color: MUSTARD })); K.text(c, "MUSIC", -w / 2 + 30, 40, BLOCK(22, { color: ORANGE }));
        const speak = (x) => (x > 0.15 && x < 0.45) || (x > 0.6 && x < 0.88);
        for (let i = 0; i < 150; i++) {
          const x = i / 150, px = -w / 2 + 150 + x * (w - 190), v = speak(x) ? 30 + 30 * Math.abs(Math.sin(i * 1.3)) : 3;
          c.fillStyle = MUSTARD; c.fillRect(px, -h / 2 + 100 - v / 2, 3.5, v);
          const duck = outCubic(win(1.2, 2.0, t)), m = (speak(x) ? lerp(1, 0.3, duck) : 1) * (26 + 16 * Math.abs(Math.sin(i * 0.4)));
          c.fillStyle = ORANGE; c.fillRect(px, 90 - m / 2, 3.5, m);
        }
        const ph = -w / 2 + 150 + ((t % 2.5) / 2.5) * (w - 190); c.fillStyle = CREAM; c.fillRect(ph, -h / 2 + 30, 3, h - 60);
        K.text(c, t > 2 ? "music -12 dB while you talk" : "music fighting your voice", w / 2 - 30, h / 2 - 30, BODY(24, { color: CREAM, align: "right", weight: 700 }));
      }, 0.4, "up", { far: 0.4 }),
      el(300, 1100, (c, t) => sleeve(c, 300, "rapper", t, "voice", { band: MUSTARD, ink: BROWN }), 0.7, "left", { rot: -4 }),
      el(640, 1080, (c) => K.text(c, "the prompt:", 0, 0, BLOCK(22, { color: RUST })), 0.9),
      el(640, 1140, (c, t) => K.text(c, K.typed("\"auto-duck the music 12 dB under my voice\"", t, 1.2, 40), 0, 0, DISPLAY(40, { maxW: 380, lh: 1.1 })), 1.0),
    ] },
    // 6 · CTA
    { els: [
      el(0, 0, (c, t) => stripes(c, 120, t, 0.05), 0, "none"),
      el(70, 400, (c) => K.text(c, "Comment", 0, 0, DISPLAY(150)), 0.2, "left"),
      el(70, 580, (c, t) => { const e = 1 + 0.03 * Math.sin(t * 5); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, DISPLAY(200, { color: RUST })); }, 0.35, "left"),
      el(70, 660, (c) => K.text(c, "for the free prompt pack, with all four mood prompts.", 0, 0, BODY(30, { weight: 600 })), 0.5),
      ...[["skate_park", "hype", ORANGE], ["cafe_coffee", "chill", TEAL], ["aerial_wave", "cinematic", BROWN], ["rapper", "voice", MUSTARD]].map(([clip, ttl, col], i) =>
        el(170 + i * 247, 960, (c, t) => sleeve(c, 230, clip, t, ttl, { band: col, ink: col === MUSTARD ? BROWN : CREAM }), 0.6 + i * 0.1, "up", { rot: [-4, 3, -2, 4][i], far: 0.5 })),
      el(K.W / 2, 1220, (c) => tag(c, "SAVE · SHARE · FOLLOW", MUSTARD), 1.0, "pop"),
    ] },
  ],
};
})();

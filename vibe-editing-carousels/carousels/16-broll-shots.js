// Carousel 16: 5 B-Roll Shots to Film Today.
// Design system: a darkroom. Near-black under a red safelight, real footage in 35 mm film
// strips (sprockets, edge numbers), a contact sheet marked up in red grease pencil, cream
// serif headlines, amber monospace labels, and a real Super 8 camera.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const CREAM = "#f3e6d0", AMBER = "#ffb347", PENCIL = "#ff3b2f", BASE = "#1a110e";
const SERIF = (size, o = {}) => ({ family: "DMSerif", size, weight: 400, color: CREAM, track: -size * 0.01, lh: 1.0, ...o });
const MONO = (size, o = {}) => ({ family: "SpaceMono", size, weight: 700, color: AMBER, track: size * 0.08, ...o });
const PEN = (size, o = {}) => ({ family: "Caveat", size, weight: 600, color: PENCIL, ...o });

function darkroom(c, t) {
  c.fillStyle = "#0b0706"; c.fillRect(0, 0, K.W, K.H);
  const k = 0.9 + 0.1 * Math.sin(t * 2.4);
  const g = c.createRadialGradient(K.W * 0.78, -80, 40, K.W * 0.7, 120, K.H * 0.95);
  g.addColorStop(0, `rgba(255,40,20,${0.55 * k})`); g.addColorStop(0.45, "rgba(150,10,5,.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
}
// A horizontal strip of film. frames: [{ clip, focus }]; `shift` scrolls it (px).
function strip(c, w, fh, frames, t, o = {}) {
  const fw = fh * 1.5, gap = 14, h = fh + 70, pitch = fw + gap;
  c.save(); c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = BASE; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
  const shift = o.shift || 0;
  for (let x = -w / 2 - 40 + (shift % 40); x < w / 2; x += 40) {
    c.fillStyle = "#050302"; rr(c, x, -h / 2 + 10, 22, 16, 3); c.fill(); rr(c, x, h / 2 - 26, 22, 16, 3); c.fill();
  }
  const n = Math.ceil(w / pitch) + 2;
  for (let i = -1; i < n; i++) {
    const fx = -w / 2 + i * pitch + (shift % pitch);
    const f = frames[((i - Math.floor(shift / pitch)) % frames.length + frames.length) % frames.length];
    K.photo(c, fx, -fh / 2, fw, fh, f.clip, t, f.look || "raw", 4, f.focus ?? 0.5);
    K.text(c, `${12 + i}A`, fx + 4, h / 2 - 4, MONO(13, { color: "rgba(255,179,71,.75)" }));
  }
  c.fillStyle = "rgba(255,80,40,.07)"; c.fillRect(-w / 2, -h / 2, w, h);
  c.restore();
}
// A big frame with the real film-strip clip multiplied over it, so it gets real sprockets.
function hero(c, w, h, clip, t, o = {}) {
  c.save(); c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 40; c.shadowOffsetY = 20;
  c.fillStyle = "#000"; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
  K.photo(c, -w / 2, -h / 2, w, h, clip, t, o.look || "raw", 0, o.focus ?? 0.5);
  c.save(); c.globalCompositeOperation = "multiply"; K.photo(c, -w / 2, -h / 2, w, h, "film_strip", t, "raw", 0, 0.5); c.restore();
}
// Grease-pencil ellipse drawn on over time.
function circle(c, rx, ry, t, at, rot = -0.1) {
  const u = outCubic(win(at, at + 0.5, t)); if (u <= 0) return;
  c.save(); c.rotate(rot); c.strokeStyle = PENCIL; c.lineWidth = 7; c.lineCap = "round";
  c.beginPath(); c.ellipse(0, 0, rx, ry, 0, -0.4, -0.4 + Math.PI * 2.15 * u); c.stroke(); c.restore();
}
function super8(c, h, t) {
  c.save(); c.shadowColor = "rgba(0,0,0,.7)"; c.shadowBlur = 30; c.shadowOffsetY = 16;
  K.drawCut(c, "super8", h); c.restore();
  if (Math.floor(t * 2) % 2) { c.fillStyle = "#ff2a1a"; c.beginPath(); c.arc(h * 0.12, -h * 0.37, 7, 0, 7); c.fill(); }
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
function shotBlock(y, n, name, how, clip, focus, at, flip) {
  const fx = flip ? 790 : 290, tx = flip ? 70 : 560;
  return [
    el(fx, y, (c, t) => hero(c, 470, 330, clip, t, { focus }), at, flip ? "right" : "left", { rot: flip ? 2 : -2 }),
    el(tx, y - 90, (c) => K.text(c, `SHOT ${n}`, 0, 0, MONO(26)), at + 0.15),
    el(tx, y - 20, (c) => K.text(c, name, 0, 0, SERIF(64, { maxW: 450 })), at + 0.2, flip ? "left" : "right"),
    el(tx, y + 70, (c) => K.text(c, how, 0, 0, { family: "InterL", size: 28, weight: 500, color: "rgba(243,230,208,.8)", maxW: 440, lh: 1.3 }), at + 0.3),
  ];
}

// ----------------------------------------------------------------- slides --
const D = 5;
const ALL = [{ clip: "barista" }, { clip: "street_steps" }, { clip: "latte" }, { clip: "skate_feet" }, { clip: "times_square" }, { clip: "watch_close" }, { clip: "typing" }];
window.CAROUSEL = {
  kit: true,
  title: "5 B-Roll Shots to Film Today",
  dur: D,
  cuts: ["super8"],
  bg: darkroom,
  fg: (c, t) => { K.grain(c, t, 0.14); K.vignette(c, 0.35); },
  slides: [
    // 1 · Hook
    { els: [
      el(70, 120, (c) => K.text(c, "VIBE EDITING · DARKROOM NOTES", 0, 0, MONO(22)), 0.05),
      el(70, 270, (c) => K.text(c, "Your edit looks", 0, 0, SERIF(96)), 0.15, "left"),
      el(70, 375, (c) => K.text(c, "cheap because", 0, 0, SERIF(96)), 0.25, "left"),
      el(70, 480, (c) => K.text(c, "there's no B-roll.", 0, 0, SERIF(96, { color: AMBER })), 0.35, "left"),
      el(K.W / 2, 720, (c, t) => strip(c, 1300, 230, ALL, t, { shift: t * 70 }), 0.4, "right", { rot: -4 }),
      el(K.W / 2, 1010, (c, t) => strip(c, 1300, 190, [...ALL].reverse(), t, { shift: -t * 50 }), 0.5, "left", { rot: 3 }),
      el(820, 1200, (c, t) => super8(c, 210, t), 0.7, "up", { rot: -8 }),
      el(70, 1230, (c) => K.text(c, "5 shots to film today", 0, 0, PEN(58)), 0.9),
      el(70, 1290, (c) => K.text(c, "SWIPE →", 0, 0, MONO(22)), 1.1),
    ] },
    // 2 · Shots 1 + 2
    { els: [
      el(70, 120, (c) => K.text(c, "ROLL 01 · FRAMES 1–2", 0, 0, MONO(22)), 0.05),
      ...shotBlock(390, 1, "Hands at work", "Your hands doing the thing: pouring, typing, packing. Lock the camera, film 10 s.", "barista", 0.5, 0.3, false),
      el(290, 390, (c, t) => circle(c, 250, 180, t, 1.2), 0, "none"),
      ...shotBlock(910, 2, "Feet in motion", "Walking in, skating off. Low angle, follow the feet for one beat.", "skate_feet", 0.5, 0.6, true),
      el(790, 910, (c, t) => circle(c, 250, 180, t, 1.8, 0.08), 0, "none"),
      el(70, 1260, (c) => K.text(c, "cut these over every \"um\"", 0, 0, PEN(48)), 2.2),
    ] },
    // 3 · Shots 3 + 4
    { els: [
      el(70, 120, (c) => K.text(c, "ROLL 01 · FRAMES 3–4", 0, 0, MONO(22)), 0.05),
      ...shotBlock(390, 3, "The detail", "Macro on the texture: foam, a watch face, a keyboard. Fill the frame.", "watch_close", 0.5, 0.3, true),
      el(790, 390, (c, t) => circle(c, 250, 180, t, 1.2, 0.08), 0, "none"),
      ...shotBlock(910, 4, "The pour", "Anything moving in one direction: pour, spin, swipe. Slow it to 50%.", "latte", 0.5, 0.6, false),
      el(290, 910, (c, t) => circle(c, 250, 180, t, 1.8), 0, "none"),
    ] },
    // 4 · Shot 5: the establishing shot, full bleed
    { els: [
      el(K.W / 2, 600, (c, t) => hero(c, 1000, 760, "times_square", t, { focus: 0.5 }), 0.05, "up", { far: 0.5 }),
      el(70, 120, (c) => K.text(c, "ROLL 01 · FRAME 5", 0, 0, MONO(22)), 0.1),
      el(70, 1080, (c) => K.text(c, "SHOT 5", 0, 0, MONO(26)), 0.3),
      el(70, 1170, (c) => K.text(c, "Where you are.", 0, 0, SERIF(84)), 0.35, "left"),
      el(70, 1240, (c) => K.text(c, "One wide shot of the place. It tells the story before you speak.", 0, 0, { family: "InterL", size: 28, weight: 500, color: "rgba(243,230,208,.8)", maxW: 900, lh: 1.3 }), 0.45),
      el(780, 300, (c, t) => circle(c, 200, 110, t, 1.4, 0.1), 0, "none"),
      el(860, 180, (c) => K.text(c, "open on this", 0, 0, PEN(52)), 1.6, "fade", { rot: -6 }),
    ] },
    // 5 · Cutting it in: the contact sheet
    { els: [
      el(70, 120, (c) => K.text(c, "CONTACT SHEET · THE EDIT", 0, 0, MONO(22)), 0.05),
      el(70, 250, (c) => K.text(c, "Now let it cut itself.", 0, 0, SERIF(84)), 0.15, "left"),
      el(K.W / 2, 690, (c, t) => {
        const cw = 290, ch = 195, g = 16, clips = ["barista", "skate_feet", "watch_close", "latte", "times_square", "vlog_talk"];
        c.save(); c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 30; c.fillStyle = BASE; c.fillRect(-480, -230, 960, 460); c.restore();
        clips.forEach((cl, i) => {
          const x = -460 + (i % 3) * (cw + g) + 10, y = -210 + Math.floor(i / 3) * (ch + 30);
          K.photo(c, x, y, cw, ch, cl, t, "raw", 2, 0.5);
          K.text(c, `${14 + i}A`, x, y + ch + 22, MONO(16, { color: "rgba(255,179,71,.7)" }));
          const at = 1.4 + i * 0.25;
          if (i < 5 && t > at) { c.strokeStyle = PENCIL; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 14, y + 14 + 26 * win(at, at + 0.2, t)); c.lineTo(x + 14, y + 14); c.stroke(); U.icon.check(c, x + cw - 30, y + 30, 40, PENCIL, 4, win(at, at + 0.3, t)); }
        });
      }, 0.3, "up", { far: 0.6 }),
      el(70, 1040, (c) => K.text(c, "THE PROMPT", 0, 0, MONO(24)), 0.6),
      el(70, 1120, (c, t) => K.text(c, K.typed("\"lay my B-roll over every pause and filler word, 1 shot per sentence, cut on the beat\"", t, 0.8, 34), 0, 0, SERIF(46, { maxW: 940, lh: 1.15, italic: false })), 0.6),
    ] },
    // 6 · CTA
    { els: [
      el(K.W / 2, 400, (c, t) => strip(c, 1300, 210, ALL, t, { shift: t * 60 }), 0.1, "left", { rot: -3 }),
      el(70, 700, (c) => K.text(c, "Comment", 0, 0, SERIF(130)), 0.25, "left"),
      el(70, 860, (c, t) => { const e = 1 + 0.03 * Math.sin(t * 5); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, SERIF(190, { color: AMBER })); }, 0.35, "left"),
      el(70, 960, (c) => K.text(c, "for the free prompt pack with my B-roll prompts.", 0, 0, { family: "InterL", size: 32, weight: 500, color: CREAM }), 0.5),
      el(70, 1070, (c) => K.text(c, "save this before your next shoot", 0, 0, PEN(56)), 0.8),
      el(820, 1190, (c, t) => super8(c, 220, t), 0.6, "up", { rot: -8 }),
      el(70, 1280, (c) => K.text(c, "FOLLOW FOR MORE →", 0, 0, MONO(24)), 1.0),
    ] },
  ],
};
})();

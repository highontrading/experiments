// Carousel 03: Cut to the Beat.
// Design system: near-black stage, small white header labels across the top, a huge white
// grotesque, a 3D ring of cards that passes behind and in front of the headline, and an
// orange italic serif footnote.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rr } = U;
const BG = "#0c0c0e", WH = "#f1efea", ORANGE = "#de8a32", DIM = "#8b8b90";
const BIG = (size, o = {}) => ({ family: "InterD", size, weight: 700, color: WH, track: -size * 0.045, ...o });
const LBL = (size, o = {}) => ({ family: "InterL", size, weight: 500, color: "#d6d6d6", ...o });
const NOTE = (size, o = {}) => ({ family: "Playfair", size, weight: 500, italic: true, color: ORANGE, ...o });
const BEAT = 0.5;

function stage(c) {
  c.fillStyle = BG; c.fillRect(0, 0, K.W, K.H);
  const g = c.createRadialGradient(K.W / 2, K.H * 0.55, 50, K.W / 2, K.H * 0.55, K.H * 0.7);
  g.addColorStop(0, "rgba(60,60,72,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
}
function header(c, items) {
  K.text(c, items[0], 64, 76, LBL(26));
  K.text(c, items[1], K.W / 2, 76, LBL(26, { align: "center" }));
  K.text(c, items[2], K.W - 64, 76, LBL(26, { align: "right" }));
}

// ------------------------------------------------------------------ ring --
// Card faces: each is paint(c, w, h, t).
const FACES = [
  (c, w, h, t) => FOOTAGE.drawFootage(c, "sunrise", t * 0.3, w, h, "teal"),
  (c, w, h) => { c.fillStyle = "#1f6f5c"; c.fillRect(0, 0, w, h); K.text(c, "cut on", 20, 70, BIG(46)); K.text(c, "the beat.", 20, 118, BIG(46)); },
  (c, w, h, t) => CARDS.wave(c, w, h, t, { at: 0.3, gap: 0.1, beatPx: 34 }, {}),
  (c, w, h, t) => FOOTAGE.drawFootage(c, "city", t * 0.3, w, h, "vhs"),
  (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#c9b6ff"); g.addColorStop(0.5, "#ffd1e8"); g.addColorStop(1, "#bff0ff"); c.fillStyle = g; c.fillRect(0, 0, w, h); K.text(c, "120", w / 2, h / 2 + 10, BIG(84, { color: "#1a1a1a", align: "center" })); K.text(c, "BPM", w / 2, h / 2 + 56, LBL(28, { color: "#333", align: "center" })); },
  (c, w, h, t) => CARDS.reel(c, w, h, t, { look: "teal", caps: [["ON"], ["BEAT."]], capsAt: 0.4, capEvery: 0.5, cutEvery: 0.5 }, { D: 5 }),
  (c, w, h) => { c.fillStyle = "#f2efe9"; c.fillRect(0, 0, w, h); K.text(c, "\"cut on", 20, 70, { family: "Playfair", size: 40, weight: 500, color: "#111" }); K.text(c, "every beat\"", 20, 116, { family: "Playfair", size: 40, weight: 500, italic: true, color: "#111" }); },
  (c, w, h, t) => FOOTAGE.drawFootage(c, "ocean", t * 0.3, w, h, "film"),
  (c, w, h, t) => CARDS.bpm(c, w, h, t, {}, {}),
  (c, w, h) => { c.fillStyle = "#2b2140"; c.fillRect(0, 0, w, h); K.text(c, "VIBE", w / 2, h / 2, BIG(60, { align: "center", color: "#ffc93c" })); K.text(c, "EDITING", w / 2, h / 2 + 44, LBL(26, { align: "center" })); },
];
// Rotation that steps one card forward on every beat.
const beatRot = (t, n, step = 1) => {
  const k = Math.floor(t / BEAT), f = (t % BEAT) / BEAT;
  return -((k + outCubic(clamp(f / 0.35))) * step) * (2 * Math.PI / n);
};
function ring(c, t, o) {
  const n = o.n || FACES.length, R = o.R || 420, tilt = o.tilt ?? 0.3, f = 1500;
  const cw = o.cw || 220, ch = o.ch || 280, rot = o.rot ?? beatRot(t, n);
  const cards = [];
  for (let i = 0; i < n; i++) {
    const th = rot + (i * 2 * Math.PI) / n;
    const x = R * Math.sin(th), z = R * Math.cos(th);
    cards.push({ i, th, x, z });
  }
  cards.sort((a, b) => a.z - b.z);
  for (const k of cards) {
    if (o.half === "back" && k.z > 0) continue;
    if (o.half === "front" && k.z <= 0) continue;
    const p = f / (f - k.z);
    const sx = o.x + k.x * p, sy = o.y + k.z * tilt * p;
    const cs = Math.cos(k.th), sn = Math.sin(k.th);
    c.save();
    c.transform(cs * p, -sn * tilt * p * 0.6, 0, p, sx, sy);
    c.globalAlpha *= clamp(0.35 + 0.65 * (k.z / R + 1) / 2 + 0.2);
    c.save(); rr(c, -cw / 2, -ch / 2, cw, ch, 18); c.clip(); c.translate(-cw / 2, -ch / 2);
    if (cs > 0) FACES[k.i % FACES.length](c, cw, ch, t);
    else { c.save(); c.translate(cw, 0); c.scale(-1, 1); FACES[k.i % FACES.length](c, cw, ch, t); c.restore(); }
    c.fillStyle = `rgba(0,0,0,${cs > 0 ? 0.45 * (1 - cs) : 0.55})`; c.fillRect(0, 0, cw, ch);
    c.restore();
    c.restore();
  }
}
function arrow(c, t) {
  c.save(); c.translate(Math.sin(t * 5) * 8, 0);
  c.strokeStyle = WH; c.lineWidth = 3; c.lineCap = "round";
  c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.moveTo(24, -14); c.lineTo(40, 0); c.lineTo(24, 14); c.stroke();
  c.restore();
}
function lane(c, w, t, offbeat, label) {
  K.panel(c, -w / 2, -80, w, 160, 20, "#18181c");
  K.text(c, label, -w / 2 + 24, -46, LBL(24, { color: offbeat ? "#ff6b6b" : "#6ee7a0" }));
  const beatPx = 70, n = Math.floor((w - 48) / beatPx);
  for (let i = 0; i < (w - 48) / 6; i++) {
    const x = -w / 2 + 24 + i * 6, on = Math.abs(((i * 6) % beatPx)) < 6;
    const a = (on ? 34 : 14) * (0.6 + 0.4 * pulse(((t % BEAT) + BEAT) % BEAT, 0, 8));
    c.fillStyle = on ? "#f472b6" : "#7a2f5a"; c.fillRect(x, 20 - a, 3, a * 2);
  }
  for (let b = 0; b < n; b++) {
    const x = -w / 2 + 24 + b * beatPx + (offbeat ? [22, -18, 31, 9, -25, 14, 27, -12, 19, 5][b % 10] : 0);
    c.fillStyle = offbeat ? "#ff6b6b" : "#ffc93c"; c.fillRect(x - 2, -18, 4, 76);
  }
  const ph = -w / 2 + 24 + ((t * 2 * beatPx) % (w - 48));
  c.fillStyle = WH; c.fillRect(ph, -24, 2, 84);
}

// ----------------------------------------------------------------- slides --
const D = 5;
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
window.CAROUSEL = {
  kit: true,
  title: "Cut to the Beat",
  dur: D,
  bg: stage,
  fg: (c, t) => K.grain(c, t, 0.08),
  slides: [
    // 1 · Hook
    {
      els: [
        el(0, 0, (c) => header(c, ["Vibe Editing", "Cut to the Beat", "120 BPM"]), 0.05, "down"),
        el(0, 0, (c, t) => ring(c, t, { x: 540, y: 680, half: "back" }), 0.1, "fade"),
        el(110, 330, (c) => K.text(c, "Cuts that", 0, 0, BIG(160)), 0.15, "up", { far: 0.4 }),
        el(110, 500, (c) => K.text(c, "hit the beat", 0, 0, BIG(160)), 0.25, "up", { far: 0.4 }),
        el(0, 0, (c, t) => ring(c, t, { x: 540, y: 680, half: "front" }), 0.1, "fade"),
        el(1016, 1250, (c) => K.text(c, "Your edit feels off because it's off-beat.", 0, 0, NOTE(34, { align: "right" })), 0.8),
        el(110, 1240, (c, t) => arrow(c, t), 1.0, "left"),
      ],
    },
    // 2 · Off-beat vs on-beat
    {
      els: [
        el(0, 0, (c) => header(c, ["Vibe Editing", "Why it matters", "02"]), 0.05, "down"),
        el(64, 290, (c) => K.text(c, "Off-beat cuts", 0, 0, BIG(132)), 0.1, "left"),
        el(64, 420, (c) => K.text(c, "feel cheap.", 0, 0, BIG(132, { color: "#77777d" })), 0.2, "left"),
        el(540, 660, (c, t) => lane(c, 952, t, true, "✕  off-beat: cuts land between beats"), 0.4, "right"),
        el(540, 880, (c, t) => lane(c, 952, t, false, "✓  on-beat: every cut on a kick"), 0.6, "left"),
        el(540, 1150, (c, t) => {
          [["off", "city", "log"], ["on", "city", "teal"]].forEach(([k, sc, lk], i) => {
            c.save(); c.translate((i - 0.5) * 470, 0);
            const cut = i === 1 ? Math.floor(t / BEAT) : Math.floor((t + 0.21) / 0.63);
            K.photo(c, -210, -120, 420, 240, ["sunrise", "city", "ocean"][cut % 3], t * 0.3, lk, 18);
            const fl = i === 1 ? pulse(t % BEAT, 0, 12) : 0;
            if (fl > 0.05) { c.fillStyle = `rgba(255,255,255,${0.3 * fl})`; rr(c, -210, -120, 420, 240, 18); c.fill(); }
            c.restore();
          });
        }, 0.8, "up"),
        el(1016, 1310, (c) => K.text(c, "Same clips. Same song. Different feel.", 0, 0, NOTE(32, { align: "right" })), 1.2),
      ],
    },
    // 3 · Find the BPM
    {
      els: [
        el(0, 0, (c) => header(c, ["Vibe Editing", "Find the BPM", "03"]), 0.05, "down"),
        el(540, 600, (c, t) => {
          const k = pulse(t % BEAT, 0, 5);
          for (let r = 0; r < 3; r++) { c.strokeStyle = `rgba(241,239,234,${(0.25 - r * 0.07) * (0.4 + k)})`; c.lineWidth = 3; c.beginPath(); c.arc(0, -80, 250 + r * 70 + k * 30, 0, 7); c.stroke(); }
          c.save(); c.scale(1 + 0.03 * k, 1 + 0.03 * k);
          K.text(c, "120", 0, 40, BIG(340, { align: "center" }));
          c.restore();
          K.text(c, "beats per minute", 0, 130, LBL(34, { align: "center" }));
          const n = Math.floor(t / BEAT) % 4;
          for (let i = 0; i < 4; i++) { c.fillStyle = i === n ? "#ffc93c" : "#2a2a30"; c.beginPath(); c.arc((i - 1.5) * 50, 210, 14, 0, 7); c.fill(); }
        }, 0.1, "pop"),
        el(540, 1050, (c, t) => {
          K.panel(c, -440, -80, 880, 160, 26, "#18181c");
          K.text(c, "ask:", -400, -24, LBL(26, { color: DIM }));
          const s = K.typed("\"detect the BPM and mark every beat\"", t, 0.9, 26);
          K.text(c, s, -400, 34, { family: "Playfair", size: 44, weight: 500, italic: true, color: WH });
          if (K.caret(t)) { c.fillStyle = "#8b5cf6"; c.fillRect(-396 + K.measure(c, s, { family: "Playfair", size: 44, weight: 500, italic: true }), 0, 4, 44); }
        }, 0.5, "up"),
        el(1016, 1280, (c) => K.text(c, "Most reels sit between 90 and 130 BPM.", 0, 0, NOTE(32, { align: "right" })), 1.0),
      ],
    },
    // 4 · Pick your pace
    {
      els: [
        el(0, 0, (c) => header(c, ["Vibe Editing", "Pick your pace", "04"]), 0.05, "down"),
        el(64, 270, (c) => K.text(c, "Pick your pace.", 0, 0, BIG(124)), 0.1, "left"),
        ...[[0.5, "every beat", "hype · music · sport", -1], [1.0, "every 2nd beat", "chill · vlog · story", 1]].map(([every, a, b, side], i) => el(540 + side * 245, 760, (c, t) => {
          K.panel(c, -200, -330, 400, 660, 36, "#000");
          c.save(); rr(c, -190, -320, 380, 640, 28); c.clip(); c.translate(-190, -320);
          CARDS.reel(c, 380, 640, t, { look: i ? "film" : "teal", cutEvery: every, at: 0, caps: i ? [["BREATHE."]] : [["GO", "GO"], ["GO!"]], capsAt: 0.4, capEvery: every }, { D });
          c.restore();
          K.text(c, a, 0, 400, BIG(46, { align: "center" }));
          K.text(c, b, 0, 446, LBL(26, { align: "center", color: DIM }));
          const nb = Math.floor(t / BEAT);
          for (let j = 0; j < 8; j++) {
            const on = j === nb % 8, cut = Math.round(j * BEAT / every * 1e3) % Math.round(1 / every * 1e3) === 0;
            c.fillStyle = on ? (j % (every / BEAT) === 0 ? "#ffc93c" : "#5a5a62") : (j % (every / BEAT) === 0 ? "#3a3420" : "#222");
            c.beginPath(); c.arc((j - 3.5) * 40, 500, 10, 0, 7); c.fill();
          }
        }, 0.3 + i * 0.15, i ? "right" : "left")),
        el(1016, 1310, (c) => K.text(c, "Yellow dots are the cuts.", 0, 0, NOTE(30, { align: "right" })), 1.0),
      ],
    },
    // 5 · Land the drop
    {
      els: [
        el(0, 0, (c) => header(c, ["Vibe Editing", "The drop", "05"]), 0.05, "down"),
        el(0, 0, (c, t) => {
          const spin = t < 2.5 ? -t * 2.4 : -2.5 * 2.4 - outBack(win(2.5, 2.8, t), 1.6) * 0.6;
          ring(c, t, { x: 540, y: 420, R: 300, cw: 160, ch: 200, rot: spin, tilt: 0.28 });
        }, 0.1, "fade"),
        el(540, 820, (c, t) => {
          const w = 952;
          K.panel(c, -w / 2, -110, w, 220, 24, "#18181c");
          const drop = 0.55;
          for (let i = 0; i < (w - 48) / 6; i++) {
            const x = -w / 2 + 24 + i * 6, u = i * 6 / (w - 48);
            const a = (u < drop ? 10 + 50 * Math.pow(u / drop, 2) : 70 * (0.6 + 0.4 * Math.abs(Math.sin(i * 0.9)))) * (u < drop ? 1 : 1);
            c.fillStyle = u < drop ? "#7a2f5a" : "#f472b6"; c.fillRect(x, -a, 3, a * 2);
          }
          const dx = -w / 2 + 24 + drop * (w - 48);
          c.fillStyle = "#ffc93c"; c.fillRect(dx - 2, -100, 4, 200);
          K.text(c, "DROP", dx + 14, -76, LBL(24, { color: "#ffc93c", weight: 700 }));
          const ph = -w / 2 + 24 + (w - 48) * clamp(t / (2.5 / drop));
          c.fillStyle = WH; c.fillRect(ph, -100, 2, 200);
          const f = pulse(t, 2.5, 5);
          if (f > 0.02) { c.fillStyle = `rgba(255,201,60,${0.25 * f})`; c.fillRect(-K.W, -K.H, K.W * 2, K.H * 2); }
        }, 0.3, "up"),
        el(64, 1080, (c) => K.text(c, "Land the drop.", 0, 0, BIG(128)), 0.4, "left"),
        el(1016, 1250, (c) => K.text(c, "Save your best shot for the first beat after it.", 0, 0, NOTE(30, { align: "right" })), 0.9),
      ],
    },
    // 6 · CTA
    {
      els: [
        el(0, 0, (c) => header(c, ["Save", "Share", "Follow"]), 0.05, "down"),
        el(0, 0, (c, t) => ring(c, t, { x: 540, y: 840, half: "back" }), 0.1, "fade"),
        el(110, 330, (c) => K.text(c, "Comment", 0, 0, BIG(170)), 0.15, "up", { far: 0.4 }),
        el(110, 510, (c, t) => { const e = 1 + 0.03 * pulse(t % BEAT, 0, 6); c.scale(e, e); K.text(c, "\"VIBE\"", 0, 0, BIG(170, { color: "#ffc93c" })); }, 0.25, "up", { far: 0.4 }),
        el(0, 0, (c, t) => ring(c, t, { x: 540, y: 840, half: "front" }), 0.1, "fade"),
        el(110, 600, (c) => K.text(c, "for the free prompt pack.", 0, 0, LBL(40)), 0.5),
        el(1016, 1270, (c) => K.text(c, "Yes! It's free. Follow for more.", 0, 0, NOTE(34, { align: "right" })), 0.9),
      ],
    },
  ],
};
})();

// ============================== FILM ==============================
const TITLE = 'Refrain';
// Purpose (SKILL.md "First questions"): 'cinematic' or 'ad'.
const PURPOSE = 'cinematic';
// Look: shadow play on a Korean hanji lattice window (styles/shadow-puppet.md, adapted). The theatre below does its own
// light: lit paper × a shadow layer (puppets blurred by their distance from the paper) × the lattice; the look pass adds
// warm bloom, paper fibre and grain. vignette 0: the theatre draws its own warm one.
const LOOKS = {
  'hanji': { grade: 'contrast(1.04) saturate(1.06)', bloom: 0.2, texture: 'paper', vignette: 0, grain: 0.03, grainHold: 1, hold: 24, line: 0, steps: 0,
    palette: { bg: '#1c120c', ink: '#2b1a12', accent: '#f3c35a', dim: '#4a2e1c' } },
};
const LOOK_ID = 'hanji';
const LOOK = LOOKS[LOOK_ID];
const FINISH = { shutter: null, weave: 0, tone: null };
const FPS = 24;
const DURATION = 62.5;                      // 25 bars of 3/4 at 72 BPM
const BPM = 72;                             // quarter notes; Arirang is in 3/4, so a bar is three beats (bar3)
const BEAT0 = 0;
const beat = (n) => BEAT0 + n * 60 / BPM, bar = (n) => beat(4 * n);
const bar3 = (n) => beat(3 * n);            // the film's bars (2.5 s)
const OWN_MUSIC = null;
const INSTRUMENTS = ['cellos', 'clavi', 'frame-drum', 'zither'];
const CAST = {};
const FORMULAS = {};
const PALETTE = {
  bg: '#f2e2bf',          // the type check's ground: the words are cut through to the lit paper
  paper: '#f2e2bf',       // hanji, lit
  lamp: '#f0a848',        // oil lamp
  hot: '#ffe6b0',         // lamp hotspot
  ink: '#2b1a12',         // shadow ink (subject)
  wood: '#4a2e1c',        // lattice wood
  hide: '#8a5f3c',        // raw hide, translucent
  dye: '#c2452d',         // persimmon dye
  gold: '#f3c35a',        // the refrain (accent)
  glow: '#e9f0ea',        // phone glow (machine section only)
  dawn: '#c9cdc4',        // cold morning paper
  accent: '#f3c35a', dim: '#4a2e1c',
};
const TYPE = {
  lang: 'en',
  roles: {
    display: { family: 'Cormorant', pkg: 'cormorant', version: '5.3.0', cap: 0.625, variable: 'wght', varVersion: '5.3.0', axes: { wght: [300, 700] } },
    text: { family: 'Mona Sans', pkg: 'mona-sans', version: '5.3.0', cap: 0.729, variable: 'standard', varVersion: '5.3.0', axes: { wdth: [75, 125], wght: [200, 900] } },
    mono: null,
  },
  check: { strings: { display: ['REFRAIN', 'versions of one advert', '3,600'], text: ['Arirang · Korean folk song'] }, sizes: { text: 0.034 } },
};

// Cues are shared by picture and sound.
const CUES = {
  s1: 0, burst: bar3(3), lampFlare: 8.0, s3: bar3(5), verse1: bar3(6) + beat(1), verse2: bar3(7), refrain2: bar3(8),
  s4: bar3(11), converge: 33.0, s5: bar3(15), s6: bar3(18), s7: bar3(21), raise: 53.6, hold: 55.0, silenceEnd: 55.8,
  title: 58.0, end: DURATION,
};

// Narration (dur measured from audio/vo-t/*.wav).
const VO = [
  { id: 'VO1', at: 4.7, dur: 2.52 },
  { id: 'VO2', at: 9.2, dur: 2.86 },
  { id: 'VO3', at: 13.0, dur: 2.78 },
  { id: 'VO4', at: 17.6, dur: 2.52 },
  { id: 'VO5', at: 20.6, dur: 2.52 },
  { id: 'VO6', at: 28.2, dur: 3.88 },
  { id: 'VO7', at: 32.8, dur: 2.86 },
  { id: 'VO8', at: 38.4, dur: 3.33 },
  { id: 'VO9', at: 46.4, dur: 3.17 },
  { id: 'VO10', at: 53.0, dur: 2.28 },
];
const CAPTIONS = null;
const CAPTION_STYLE = { role: 'display', accentRole: 'display', size: 0.062, caps: false, ink: PALETTE.ink, hi: PALETTE.ink, accent: PALETTE.accent, punch: 0.07 };

const SCENES = [
  { chapter: 'C1', from: CUES.s1, to: CUES.burst, draw: machineStamps, action: 'the machine arm stamps advert slips faster and faster', amb: { kind: 'room', gain: 0.05 } },
  { chapter: 'C1', from: CUES.burst, to: CUES.s3, draw: slipsFall, action: 'the slips burst and fall; a lamp lights the hanji window', amb: { kind: 'room', gain: 0.06 } },
  { chapter: 'C2', from: CUES.s3, to: CUES.s4, draw: singersPass, action: 'five singers from five eras sing; their verse plates change, the refrain plate stays', amb: { kind: 'room', gain: 0.05 } },
  { chapter: 'C3', from: CUES.s4, to: CUES.s5, draw: facadeTests, in: { type: 'match' }, action: 'slips march into lit windows; tapped windows send slips back; the trails converge on one winner', amb: { kind: 'city', gain: 0.06 } },
  { chapter: 'C3', from: CUES.s5, to: CUES.s6, draw: billboardDawn, in: { type: 'dissolve', dur: 0.8 }, action: 'the winning advert is pasted up, then pasted over again and again', amb: { kind: 'air', gain: 0.05 } },
  { chapter: 'C4', from: CUES.s6, to: CUES.s7, draw: singerHums, in: { type: 'match' }, action: 'a woman at the window hums the refrain', amb: { kind: 'room', gain: 0.05 } },
  { chapter: 'C4', from: CUES.s7, to: CUES.end, draw: machineListens, action: 'the machine raises its stamp over her window, holds, and lowers it to listen', amb: { kind: 'room', gain: 0.05 } },
];

// Code voices only for the accents that sit in the music's time; the recorded effects are in audio/mix.json.
const SFX = [
  { at: CUES.burst - 1.2, voice: 'riser', dur: 1.2, gain: 0.18, wet: 0.2 },   // the count runs into the burst
  { at: CUES.burst, voice: 'hit', gain: 0.55, wet: 0.35 },                    // 3,600: the burst
  { at: CUES.s4 - 0.3, voice: 'whoosh', dur: 0.6, gain: 0.22, wet: 0.25 },     // into the city
];
const ROOM = { secs: 1.6, decay: 3.0, tone: 4200 };   // a small wooden room

const ARRANGEMENT = [
  { section: 'machine', from: 0, to: CUES.burst, parts: ['clavi', 'ticks'] },
  { section: 'song', from: CUES.burst, to: CUES.s4, parts: ['zither', 'cello', 'drum'] },
  { section: 'tests', from: CUES.s4, to: CUES.s5, parts: ['clavi', 'ticks', 'drum', 'cello'] },
  { section: 'dawn', from: CUES.s5, to: CUES.s6, parts: ['clavi', 'cello'] },
  { section: 'refrain', from: CUES.s6, to: CUES.s7, parts: ['zither', 'cello'] },
  { section: 'ending', from: CUES.s7, to: CUES.end, parts: ['zither', 'cello', 'clavi', 'ticks'] },
];

// ---------------------------------------------------------------- the theatre
// World units: 1 = the frame's short side. cam = { x, y, z } (z = zoom). Lamps sit behind the paper at (x, y).
const theatre = lazy(() => {
  const mk = () => { const c = document.createElement('canvas'); c.width = S.W; c.height = S.H; return { c, g: c.getContext('2d') }; };
  const tex = (size, draw) => { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); return c; };
  // hanji: long wandering fibres, cloud-like density, a few specks (multiplied over the lit paper)
  const fibre = tex(1024, (x, n) => {
    const r = rng(41); x.fillStyle = '#fff'; x.fillRect(0, 0, n, n);
    for (let i = 0; i < 46; i++) {               // density clouds
      const gx = r() * n, gy = r() * n, rr = n * (0.08 + r() * 0.2), gr = x.createRadialGradient(gx, gy, 0, gx, gy, rr);
      gr.addColorStop(0, `rgba(150,110,70,${0.05 + r() * 0.07})`); gr.addColorStop(1, 'rgba(150,110,70,0)');
      x.fillStyle = gr; for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) { x.save(); x.translate(ox, oy); x.fillRect(gx - rr, gy - rr, 2 * rr, 2 * rr); x.restore(); }
    }
    x.lineCap = 'round';
    for (let i = 0; i < 1500; i++) {             // fibres
      let px = r() * n, py = r() * n, a = r() * TAU; const len = 20 + r() * 110;
      x.strokeStyle = `rgba(${110 + r() * 40},${80 + r() * 30},${50 + r() * 20},${0.06 + r() * 0.14})`; x.lineWidth = 0.6 + r() * 1.3;
      x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < 8; s++) { a += (r() - 0.5) * 0.7; px += Math.cos(a) * len / 8; py += Math.sin(a) * len / 8; x.lineTo(px, py); }
      x.stroke();
    }
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(70,45,25,${0.1 + r() * 0.25})`; x.beginPath(); x.arc(r() * n, r() * n, 0.6 + r() * 1.6, 0, TAU); x.fill(); }
  });
  // hide: mottling and fibres, laid over every puppet piece
  const hide = tex(512, (x, n) => {
    const r = rng(77); x.fillStyle = '#5a3a22'; x.fillRect(0, 0, n, n);
    for (let i = 0; i < 90; i++) {
      const gx = r() * n, gy = r() * n, rr = 10 + r() * 60, gr = x.createRadialGradient(gx, gy, 0, gx, gy, rr);
      const c = r() < 0.5 ? '200,150,100' : '20,10,5';
      gr.addColorStop(0, `rgba(${c},${0.12 + r() * 0.2})`); gr.addColorStop(1, `rgba(${c},0)`); x.fillStyle = gr; x.fillRect(gx - rr, gy - rr, 2 * rr, 2 * rr);
    }
    for (let i = 0; i < 400; i++) { x.strokeStyle = `rgba(210,170,120,${0.05 + r() * 0.12})`; x.lineWidth = 0.7; x.beginPath(); const px = r() * n, py = r() * n, a = r() * TAU, l = 8 + r() * 30; x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  });
  const fibrePat = mk().g.createPattern(fibre, 'repeat'), hidePat = mk().g.createPattern(hide, 'repeat');
  return { sh: mk(), pc: mk(), fibrePat, hidePat };
});

function view(ctx, cam) {
  const z = S.u * cam.z;
  ctx.setTransform(z, 0, 0, z, S.W / 2 - cam.x * z, S.H / 2 - cam.y * z);
}
function flick(t, salt, amt = 1) { return 1 + amt * (0.07 * (2 * noise1(t * 7 + salt) - 1) + 0.025 * Math.sin(t * 31 + salt * 3)); }

// Lit paper: the room's dark, then each lamp's broad lobe and hotspot, then the fibre in the paper (moves with the camera).
// lamps: [{ x, y, r, i, col, hot }]; o.base: the paper's colour where no lamp reaches; o.daylight: { top, bottom } (dawn).
function paper(g, cam, lamps, t, o = {}) {
  const th = theatre();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = o.base || '#2a1a10'; g.fillRect(0, 0, S.W, S.H);
  if (o.daylight) {
    const gr = g.createLinearGradient(0, 0, S.W * 0.4, S.H); gr.addColorStop(0, o.daylight.top); gr.addColorStop(1, o.daylight.bottom);
    g.globalAlpha = o.daylight.k ?? 1; g.fillStyle = gr; g.fillRect(0, 0, S.W, S.H); g.globalAlpha = 1;
  }
  view(g, cam); g.globalCompositeOperation = 'lighter';
  for (const [n, L] of lamps.entries()) {
    const i = L.i * flick(t, 11 + n * 7, L.steady ? 0.2 : 1);
    if (i <= 0.001) continue;
    const lobe = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    const c = L.col || '240,168,72', h = L.hot || '255,230,176';
    lobe.addColorStop(0, `rgba(${c},${0.95 * i})`); lobe.addColorStop(0.45, `rgba(${c},${0.55 * i})`); lobe.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = lobe; g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
    const hr = L.r * 0.28, hot = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, hr);
    hot.addColorStop(0, `rgba(${h},${0.75 * i})`); hot.addColorStop(1, `rgba(${h},0)`);
    g.fillStyle = hot; g.fillRect(L.x - hr, L.y - hr, 2 * hr, 2 * hr);
  }
  g.globalCompositeOperation = 'multiply';
  const m = new DOMMatrix().scaleSelf(0.9 / 1024);            // one fibre tile = 0.9 world units
  th.fibrePat.setTransform(m); g.fillStyle = th.fibrePat;
  const hw = 0.9 / cam.z * S.W / S.u + 0.1, hh = 0.6 / cam.z + 0.1;
  g.fillRect(cam.x - hw, cam.y - hh, 2 * hw, 2 * hh);
  g.restore();
}

// The shadow layer: white, puppets multiplied in. Call shadows(cam) first, then puppet(...) for each piece, then cast(g).
let SHCAM = null, SHLAMP = [0, 0];
function shadows(cam, lamp = [0, 0]) {
  const { sh } = theatre(); SHCAM = cam; SHLAMP = lamp;
  sh.g.setTransform(1, 0, 0, 1, 0, 0); sh.g.globalCompositeOperation = 'source-over'; sh.g.globalAlpha = 1; sh.g.filter = 'none';
  sh.g.fillStyle = '#fff'; sh.g.fillRect(0, 0, S.W, S.H);
}
// depth: 0 = pressed on the paper (sharp), 1 = far from it (soft, larger, paler). fn(ctx) draws in world units.
function puppet(depth, fn, o = {}) {
  const { sh, pc, hidePat } = theatre(), x = pc.g;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none';
  x.clearRect(0, 0, S.W, S.H);
  view(x, SHCAM);
  const s = 1 + depth * 0.32;                                  // nearer the lamp, the shadow grows about it
  x.translate(SHLAMP[0], SHLAMP[1]); x.scale(s, s); x.translate(-SHLAMP[0], -SHLAMP[1]);
  fn(x);
  if (!o.noHide) {                                             // the hide's mottling, only where there is a piece
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.32;
    x.fillStyle = hidePat; x.fillRect(0, 0, S.W, S.H); x.restore();
  }
  const blur = depth * 26 * S.u / 1080;
  sh.g.save(); sh.g.setTransform(1, 0, 0, 1, 0, 0); sh.g.globalCompositeOperation = 'multiply';
  sh.g.globalAlpha = clamp((o.alpha ?? 1) * (1 - depth * 0.42)); if (blur > 0.4) sh.g.filter = `blur(${blur.toFixed(1)}px)`;
  sh.g.drawImage(pc.c, 0, 0); sh.g.restore();
}
function cast(g) {
  const { sh } = theatre();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(sh.c, 0, 0); g.restore();
}
// The lattice (changho): wooden bars on our side of the paper, dark, with a warm edge from the light behind them.
function lattice(g, cam, x0, y0, w, h, o = {}) {
  const cw = o.cw ?? 0.105, ch = o.ch ?? 0.15, bar = o.bar ?? 0.011, frame = o.frame ?? 0.045;
  g.save(); view(g, cam);
  g.fillStyle = o.color || PALETTE.wood;
  const cols = Math.max(1, Math.round(w / cw)), rows = Math.max(1, Math.round(h / ch));
  for (let i = 1; i < cols; i++) g.fillRect(x0 + i * w / cols - bar / 2, y0, bar, h);
  for (let j = 1; j < rows; j++) g.fillRect(x0, y0 + j * h / rows - bar / 2, w, bar);
  g.fillStyle = o.frameColor || '#2a190f';
  g.fillRect(x0 - frame, y0 - frame, w + 2 * frame, frame); g.fillRect(x0 - frame, y0 + h, w + 2 * frame, frame);
  g.fillRect(x0 - frame, y0, frame, h); g.fillRect(x0 + w, y0, frame, h);
  g.restore();
  return { cols, rows };
}
// Outside the window: the room's dark wall (screen space).
function room(g, cam, x0, y0, w, h) {
  g.save(); view(g, cam); g.fillStyle = '#140c07';
  const big = 50; g.beginPath(); g.rect(-big, -big, 2 * big, 2 * big); g.rect(x0 + w + 0.04, y0 - 0.04, -(w + 0.08), h + 0.08); g.fill('evenodd');
  g.restore();
}
function warmVignette(g, k = 0.55) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createRadialGradient(S.W / 2, S.H / 2, S.H * 0.35, S.W / 2, S.H / 2, S.W * 0.62);
  gr.addColorStop(0, 'rgba(40,18,6,0)'); gr.addColorStop(1, `rgba(40,18,6,${k})`);
  g.fillStyle = gr; g.fillRect(0, 0, S.W, S.H); g.restore();
}

// ---------------------------------------------------------------- puppet pieces
function shape(x, pts, fill) { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); if (fill) { x.fillStyle = fill; x.fill(); } }
function cut(x, fn) { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; fn(x); x.restore(); }
function rivet(x, px, py, r = 0.009) { x.fillStyle = PALETTE.ink; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); cut(x, (c) => { c.beginPath(); c.arc(px, py, r * 0.38, 0, TAU); c.fill(); }); }
function rod(x, ax, ay, bx, by, w = 0.0028) { x.save(); x.strokeStyle = 'rgba(43,26,18,0.55)'; x.lineWidth = w; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.restore(); }
// a rounded plate between two points, w wide (an arm segment), with a row of slot cuts along it
function limbPlate(x, ax, ay, bx, by, w, fill, slots = 0) {
  const a = Math.atan2(by - ay, bx - ax), L = Math.hypot(bx - ax, by - ay);
  x.save(); x.translate(ax, ay); x.rotate(a);
  x.beginPath(); x.moveTo(0, -w / 2); x.lineTo(L, -w * 0.42); x.arc(L, 0, w * 0.42, -Math.PI / 2, Math.PI / 2); x.lineTo(0, w / 2); x.arc(0, 0, w / 2, Math.PI / 2, -Math.PI / 2); x.closePath();
  x.fillStyle = fill; x.fill();
  if (slots) cut(x, (c) => { for (let i = 0; i < slots; i++) { const sx = L * (0.18 + 0.64 * i / Math.max(1, slots - 1)); c.fillRect(sx - w * 0.07, -w * 0.22, w * 0.14, w * 0.44); } });
  x.restore();
}
function ik(sx, sy, tx, ty, L1, L2, bend = 1) {
  const d = clamp(Math.hypot(tx - sx, ty - sy), 0.01, L1 + L2 - 1e-4), a = Math.atan2(ty - sy, tx - sx);
  const c = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), b = a - bend * Math.acos(c);
  return [sx + Math.cos(b) * L1, sy + Math.sin(b) * L1];
}
function gearHole(x, cx, cy, r, teeth = 8, spin = 0) {
  cut(x, (c) => {
    c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
  });
  x.save(); x.translate(cx, cy); x.rotate(spin); x.fillStyle = PALETTE.ink;
  x.beginPath(); x.arc(0, 0, r * 0.28, 0, TAU); x.fill();
  for (let i = 0; i < teeth; i++) { x.save(); x.rotate(i * TAU / teeth); x.fillRect(-r * 0.06, 0, r * 0.12, r * 0.92); x.restore(); }
  x.beginPath(); x.arc(0, 0, r * 0.92, 0, TAU); x.lineWidth = r * 0.12; x.strokeStyle = PALETTE.ink; x.stroke();
  x.restore();
  cut(x, (c) => { c.beginPath(); c.arc(cx, cy, r * 0.1, 0, TAU); c.fill(); });
}

// The machine: an automaton with no rods (it is the only thing in the film that moves by itself).
// p: { sx, sy (shoulder), tx, ty (the stamp's face), tilt (head), body: bool, spin, ghost }
function automaton(x, p) {
  const ink = PALETTE.ink, L1 = 0.36 * (p.s || 1), L2 = 0.32 * (p.s || 1), sc = p.s || 1;
  if (p.body !== false) {
    // torso column: chamfered plate down past the frame, vent slots, a gear at the shoulder
    shape(x, [[p.sx - 0.09 * sc, p.sy - 0.06 * sc], [p.sx + 0.07 * sc, p.sy - 0.08 * sc], [p.sx + 0.11 * sc, p.sy + 0.05 * sc], [p.sx + 0.12 * sc, p.sy + 1.2], [p.sx - 0.12 * sc, p.sy + 1.2], [p.sx - 0.11 * sc, p.sy + 0.04 * sc]], ink);
    cut(x, (c) => { for (let i = 0; i < 5; i++) c.fillRect(p.sx - 0.07 * sc, p.sy + (0.12 + i * 0.05) * sc, 0.14 * sc, 0.014 * sc); });
    // neck and head (tilts toward what it hears)
    const hx = p.sx - 0.01 * sc, hy = p.sy - 0.1 * sc;
    x.save(); x.translate(hx, hy); x.rotate(p.tilt || 0);
    x.fillStyle = ink; x.fillRect(-0.012 * sc, -0.05 * sc, 0.024 * sc, 0.06 * sc);
    shape(x, [[-0.075 * sc, -0.05 * sc], [0.07 * sc, -0.05 * sc], [0.08 * sc, -0.17 * sc], [0.03 * sc, -0.2 * sc], [-0.06 * sc, -0.19 * sc], [-0.085 * sc, -0.12 * sc]], ink);
    cut(x, (c) => { c.beginPath(); c.arc(-0.035 * sc, -0.125 * sc, 0.022 * sc, 0, TAU); c.fill(); c.fillRect(0.0 * sc, -0.085 * sc, 0.055 * sc, 0.008 * sc); c.fillRect(0.0 * sc, -0.068 * sc, 0.055 * sc, 0.008 * sc); });
    x.fillStyle = ink; x.fillRect(0.015 * sc, -0.27 * sc, 0.006 * sc, 0.075 * sc); x.beginPath(); x.arc(0.018 * sc, -0.275 * sc, 0.012 * sc, 0, TAU); x.fill();
    rivet(x, 0, 0, 0.011 * sc);
    x.restore();
    gearHole(x, p.sx, p.sy, 0.045 * sc, 8, p.spin || 0);
  }
  const [ex, ey] = ik(p.sx, p.sy, p.tx, p.ty - 0.14 * sc, L1, L2, p.bend ?? -1);
  const wx = p.tx, wy = p.ty - 0.14 * sc;
  limbPlate(x, p.sx, p.sy, ex, ey, 0.065 * sc, ink, 4);
  limbPlate(x, ex, ey, wx, wy, 0.055 * sc, ink, 3);
  // the stamp: a handle and a block, its face on (tx, ty)
  x.fillStyle = ink;
  x.fillRect(wx - 0.016 * sc, wy, 0.032 * sc, 0.07 * sc);
  shape(x, [[wx - 0.085 * sc, wy + 0.07 * sc], [wx + 0.085 * sc, wy + 0.07 * sc], [wx + 0.095 * sc, wy + 0.125 * sc], [wx - 0.095 * sc, wy + 0.125 * sc]], ink);
  x.fillRect(wx - 0.1 * sc, p.ty - 0.016 * sc, 0.2 * sc, 0.016 * sc);
  cut(x, (c) => { for (let i = 0; i < 4; i++) c.fillRect(wx - 0.06 * sc + i * 0.035 * sc, wy + 0.088 * sc, 0.018 * sc, 0.018 * sc); });
  rivet(x, p.sx, p.sy, 0.012 * sc); rivet(x, ex, ey, 0.011 * sc); rivet(x, wx, wy, 0.009 * sc);
}

// Singers: jointed profile puppets on rods, facing right. kind: scholar · woman · porter · radio · girl.
// p: { mouth 0..1, nod (rad), tremor, seated, t }
function singer(x, kind, px, py, h, p = {}) {
  const ink = PALETTE.ink, hide = PALETTE.hide, dye = PALETTE.dye, k = h, t = p.t || 0;
  const tr = (p.tremor ?? 1) * 0.003 * k, jx = tr * (2 * noise1(t * 2.3 + px * 9) - 1), jy = tr * (2 * noise1(t * 2.1 + 40 + px * 9) - 1);
  x.save(); x.translate(px + jx, py + jy);
  const seat = p.seated ? 0.32 : 0;
  // body
  if (kind === 'woman' || kind === 'radio') {
    if (kind === 'woman') {          // chima: a full bell skirt in persimmon dye, a short jeogori in hide
      const sk = p.seated ? [[-0.2, 0], [-0.13, -0.22], [0.06, -0.24], [0.2, -0.02], [0.24, 0]] : [[-0.16, 0], [-0.09, -0.46], [0.04, -0.47], [0.13, -0.05], [0.16, 0]];
      shape(x, sk.map(([a, b]) => [a * k, b * k]), dye);
      const top = p.seated ? -0.24 : -0.47;
      shape(x, [[-0.09 * k, top * k], [-0.08 * k, (top - 0.16) * k], [0.05 * k, (top - 0.17) * k], [0.07 * k, top * k]], hide);
      cut(x, (c) => { for (let i = 0; i < 5; i++) { c.beginPath(); c.arc((-0.06 + i * 0.03) * k, (top + 0.03 - i * 0.012) * k, 0.008 * k, 0, Math.PI); c.fill(); } });
    } else {                         // 1950s: an a-line dress with a belt
      shape(x, [[-0.11 * k, 0], [-0.06 * k, -0.42 * k], [-0.07 * k, -0.62 * k], [0.06 * k, -0.63 * k], [0.06 * k, -0.42 * k], [0.12 * k, 0]], hide);
      x.fillStyle = ink; x.fillRect(-0.07 * k, -0.44 * k, 0.14 * k, 0.025 * k);
      x.fillRect(-0.05 * k, 0, 0.025 * k, 0.02 * k);
    }
  } else if (kind === 'scholar') {   // dopo: a long robe in hide, a dyed sash
    shape(x, [[-0.13 * k, 0], [-0.08 * k, -0.62 * k], [0.07 * k, -0.63 * k], [0.12 * k, 0]], hide);
    x.fillStyle = dye; x.fillRect(-0.09 * k, -0.44 * k, 0.17 * k, 0.025 * k);
    cut(x, (c) => { for (let i = 0; i < 6; i++) c.fillRect((-0.06 + i * 0.022) * k, -0.2 * k, 0.006 * k, 0.12 * k); });
  } else if (kind === 'porter') {    // short jacket, trousers tied at the ankle, the jige A-frame on his back
    x.save(); x.rotate(-0.08);
    shape(x, [[-0.08 * k, -0.34 * k], [-0.07 * k, -0.62 * k], [0.06 * k, -0.62 * k], [0.07 * k, -0.34 * k]], hide);
    x.restore();
    shape(x, [[-0.07 * k, -0.34 * k], [-0.09 * k, 0], [-0.04 * k, 0], [0, -0.22 * k], [0.04 * k, 0], [0.09 * k, 0], [0.07 * k, -0.34 * k]], ink);
    x.strokeStyle = ink; x.lineWidth = 0.014 * k; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-0.1 * k, -0.05 * k); x.lineTo(-0.2 * k, -0.86 * k); x.moveTo(-0.15 * k, -0.06 * k); x.lineTo(-0.27 * k, -0.84 * k);
    x.moveTo(-0.115 * k, -0.3 * k); x.lineTo(-0.22 * k, -0.32 * k); x.moveTo(-0.14 * k, -0.52 * k); x.lineTo(-0.24 * k, -0.54 * k); x.stroke();
    shape(x, [[-0.33 * k, -0.62 * k], [-0.19 * k, -0.6 * k], [-0.18 * k, -0.75 * k], [-0.31 * k, -0.78 * k]], hide);   // a bundle of firewood
    x.strokeStyle = ink; x.lineWidth = 0.004 * k; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-0.33 * k, (-0.64 - i * 0.035) * k); x.lineTo(-0.18 * k, (-0.62 - i * 0.035) * k); x.stroke(); }
  } else if (kind === 'girl') {      // hoodie, jeans, sneakers
    shape(x, [[-0.08 * k, -0.36 * k], [-0.09 * k, -0.62 * k], [-0.02 * k, -0.66 * k], [0.07 * k, -0.62 * k], [0.08 * k, -0.36 * k]], hide);
    shape(x, [[-0.11 * k, -0.6 * k], [-0.06 * k, -0.68 * k], [-0.02 * k, -0.62 * k]], hide);   // the hood, down
    shape(x, [[-0.07 * k, -0.36 * k], [-0.06 * k, 0], [-0.02 * k, 0], [0.0, -0.2 * k], [0.03 * k, 0], [0.07 * k, 0], [0.065 * k, -0.36 * k]], ink);
    x.fillStyle = ink; x.fillRect(-0.08 * k, -0.015 * k, 0.07 * k, 0.02 * k); x.fillRect(0.02 * k, -0.015 * k, 0.07 * k, 0.02 * k);
  }
  // head (profile, facing right): hide-coloured face would vanish, so the head is ink with an open-cut eye
  const neckY = (p.seated ? -0.4 : -0.66) * k;
  x.save(); x.translate(0.0, neckY); x.rotate(p.nod || 0);
  x.fillStyle = ink; x.fillRect(-0.018 * k, -0.04 * k, 0.036 * k, 0.05 * k);
  const head = [[-0.06, -0.05], [-0.07, -0.13], [-0.03, -0.19], [0.03, -0.19], [0.055, -0.14], [0.058, -0.115], [0.078, -0.098], [0.058, -0.085]];
  const m = (p.mouth || 0) * 0.018;
  head.push([0.06, -0.072], [0.052, -0.066 + m * 0.2], [0.064, -0.058 + m], [0.05, -0.035 + m], [0.0, -0.03], [-0.04, -0.035]);
  shape(x, head.map(([a, b]) => [a * k, b * k]), ink);
  cut(x, (c) => { c.beginPath(); c.ellipse(0.028 * k, -0.125 * k, 0.012 * k, 0.005 * k, -0.15, 0, TAU); c.fill(); });   // the eye
  // hair and hats
  if (kind === 'scholar') {          // the gat: translucent horsehair (half alpha), a wide brim and a tall crown, its string
    x.save(); x.globalAlpha = 0.62; x.fillStyle = ink;
    x.beginPath(); x.ellipse(0, -0.19 * k, 0.17 * k, 0.018 * k, 0, 0, TAU); x.fill();
    shape(x, [[-0.06 * k, -0.19 * k], [-0.05 * k, -0.31 * k], [0.05 * k, -0.31 * k], [0.06 * k, -0.19 * k]], ink);
    x.restore();
    x.strokeStyle = ink; x.lineWidth = 0.003 * k; x.beginPath(); x.moveTo(0.045 * k, -0.19 * k); x.quadraticCurveTo(0.08 * k, -0.08 * k, 0.04 * k, -0.02 * k); x.stroke();
    shape(x, [[0.03 * k, -0.04 * k], [0.06 * k, -0.035 * k], [0.04 * k, 0.03 * k]], ink);   // beard
  } else if (kind === 'woman') {     // hair parted, a low bun with the binyeo pin through it
    x.fillStyle = ink; x.beginPath(); x.arc(-0.075 * k, -0.07 * k, 0.04 * k, 0, TAU); x.fill();
    x.fillRect(-0.15 * k, -0.075 * k, 0.15 * k, 0.008 * k);
  } else if (kind === 'radio') {     // short permed hair: a ring of curls
    x.fillStyle = ink; for (let i = 0; i < 7; i++) { const a = Math.PI * (0.55 + i * 0.16); x.beginPath(); x.arc(-0.01 * k + Math.cos(a) * 0.075 * k, -0.12 * k + Math.sin(a) * 0.075 * k, 0.026 * k, 0, TAU); x.fill(); }
  } else if (kind === 'porter') {    // a cloth headband, its tails swing
    x.fillStyle = PALETTE.hide; x.fillRect(-0.068 * k, -0.17 * k, 0.12 * k, 0.025 * k);
    const sw = 0.25 * Math.sin(t * 3.1 + 1);
    x.save(); x.translate(-0.065 * k, -0.16 * k); x.rotate(0.9 + sw); x.fillRect(0, -0.006 * k, 0.07 * k, 0.012 * k); x.restore();
  } else if (kind === 'girl') {      // a high ponytail, swinging; an earbud wire
    x.fillStyle = ink; x.save(); x.translate(-0.05 * k, -0.18 * k); x.rotate(-0.5 + 0.18 * Math.sin(t * 2.6));
    shape(x, [[0, 0], [-0.03 * k, 0.03 * k], [-0.06 * k, 0.12 * k], [-0.02 * k, 0.1 * k]], ink); x.restore();
    x.strokeStyle = ink; x.lineWidth = 0.0025 * k; x.beginPath(); x.moveTo(0.0, -0.1 * k); x.quadraticCurveTo(0.02 * k, 0.1 * k, 0.12 * k, 0.32 * k); x.stroke();
  }
  x.restore();
  // the near arm: sleeve on a rivet, a hand that holds the era's thing, the rod to the hand
  const sh = [0.0, neckY + 0.07 * k];
  const lift = p.armLift ?? 0.35, ha = -0.6 - lift;
  const el = [sh[0] + Math.cos(Math.PI / 2 - 0.25) * 0.15 * k, sh[1] + Math.sin(Math.PI / 2 - 0.25) * 0.15 * k];
  const hand = [el[0] + Math.cos(ha + 1.3) * 0.13 * k, el[1] + Math.sin(ha + 1.3) * 0.13 * k - lift * 0.08 * k];
  const sleeve = kind === 'woman' ? PALETTE.dye : kind === 'scholar' ? PALETTE.hide : kind === 'girl' ? PALETTE.hide : PALETTE.hide;
  limbPlate(x, sh[0], sh[1], el[0], el[1], (kind === 'scholar' ? 0.075 : 0.05) * k, sleeve);
  limbPlate(x, el[0], el[1], hand[0], hand[1], 0.035 * k, sleeve);
  x.fillStyle = ink; x.beginPath(); x.arc(hand[0], hand[1], 0.018 * k, 0, TAU); x.fill();
  if (kind === 'radio') {            // a transistor radio: speaker holes cut, an antenna
    const rx = hand[0], ry = hand[1] - 0.03 * k;
    shape(x, [[rx - 0.02 * k, ry - 0.05 * k], [rx + 0.1 * k, ry - 0.05 * k], [rx + 0.1 * k, ry + 0.03 * k], [rx - 0.02 * k, ry + 0.03 * k]], ink);
    cut(x, (c) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(rx + (0.005 + i * 0.022) * k, ry + (-0.028 + j * 0.03) * k, 0.006 * k, 0, TAU); c.fill(); } c.fillRect(rx + 0.07 * k, ry - 0.03 * k, 0.02 * k, 0.04 * k); });
    x.fillRect(rx + 0.09 * k, ry - 0.2 * k, 0.003 * k, 0.15 * k);
  }
  if (kind === 'girl') {             // a phone: its screen cut through (it shines)
    const rx = hand[0], ry = hand[1] - 0.02 * k;
    shape(x, [[rx - 0.01 * k, ry - 0.06 * k], [rx + 0.025 * k, ry - 0.06 * k], [rx + 0.025 * k, ry + 0.01 * k], [rx - 0.01 * k, ry + 0.01 * k]], ink);
    cut(x, (c) => c.fillRect(rx - 0.004 * k, ry - 0.052 * k, 0.023 * k, 0.055 * k));
  }
  rivet(x, sh[0], sh[1], 0.01 * k); rivet(x, el[0], el[1], 0.008 * k);
  x.restore();
  // rods run off the bottom of the screen
  if (p.rods !== false) { rod(x, px + hand[0], py + hand[1], px + hand[0] + 0.05, py + 0.7); rod(x, px, py + neckY, px - 0.04, py + 0.7); }
}

// A plate of cut marks: the melody's contour (a verse: its own; the refrain: always the same).
const REFRAIN_NOTES = [74, 76, 74, 76, 79, 81, 79, 81, 83, 81, 83, 79, 76];
function plate(x, cx, cy, w, notes, fill) {
  const h = w * 0.3;
  shape(x, [[cx - w / 2 + h * 0.3, cy - h / 2], [cx + w / 2 - h * 0.3, cy - h / 2], [cx + w / 2, cy], [cx + w / 2 - h * 0.3, cy + h / 2], [cx - w / 2 + h * 0.3, cy + h / 2], [cx - w / 2, cy]], fill);
  cut(x, (c) => {
    notes.forEach((n, i) => {
      const px = cx - w * 0.38 + w * 0.76 * i / (notes.length - 1), py = cy + h * 0.3 - (n - 72) / 14 * h * 0.62;
      c.beginPath(); c.ellipse(px, py, w * 0.016, w * 0.011, -0.3, 0, TAU); c.fill();
    });
  });
  x.strokeStyle = PALETTE.ink; x.lineWidth = w * 0.012; x.stroke();
}
function verseNotes(salt, n = 13) { const r = rng(salt); const sc = [74, 76, 79, 81, 83, 86]; return Array.from({ length: n }, () => sc[Math.floor(r() * sc.length)]); }

// A carved plaque with words cut through it (the words glow with the lamp); gold: a gold film behind the letters.
function plaque(x, str, cx0, cy0, px0, o = {}) {
  x.save(); x.translate(cx0, cy0); x.scale(0.01, 0.01);
  const cx = 0, cy = 0, px = px0 * 100;
  x.font = typeFont(TYPE, o.role || 'display', px, { weight: o.weight ?? 600 });
  x.textAlign = 'center'; x.textBaseline = 'middle';
  const w = x.measureText(str).width + px * 1.1, h = px * 1.45;
  x.beginPath(); x.moveTo(cx - w / 2 + h * 0.25, cy - h / 2); x.lineTo(cx + w / 2 - h * 0.25, cy - h / 2); x.lineTo(cx + w / 2, cy);
  x.lineTo(cx + w / 2 - h * 0.25, cy + h / 2); x.lineTo(cx - w / 2 + h * 0.25, cy + h / 2); x.lineTo(cx - w / 2, cy); x.closePath();
  x.fillStyle = PALETTE.ink; x.fill();
  const path = new Path2D(); path.moveTo(cx - w / 2 + h * 0.25, cy - h / 2); path.lineTo(cx + w / 2 - h * 0.25, cy - h / 2); path.lineTo(cx + w / 2, cy); path.lineTo(cx + w / 2 - h * 0.25, cy + h / 2); path.lineTo(cx - w / 2 + h * 0.25, cy + h / 2); path.lineTo(cx - w / 2, cy); path.closePath();
  x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
  if (o.tracking) x.letterSpacing = `${(o.tracking * px).toFixed(4)}px`;
  x.fillText(str, cx, cy + px * 0.04);
  x.globalCompositeOperation = 'source-over';
  x.strokeStyle = PALETTE.ink; x.lineWidth = px * 0.05;
  x.beginPath(); x.rect(cx - w / 2 + h * 0.2, cy - h / 2 + px * 0.12, w - h * 0.4, h - px * 0.24); x.stroke();
  if (o.gold) { x.save(); x.clip(path); x.globalCompositeOperation = 'destination-over'; x.fillStyle = PALETTE.gold; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.restore(); }
  x.restore();
  return { w, h };
}
// Press on: arrives large and soft, snaps sharp on the paper (0.5 s). Returns { depth, alpha }.
function pressOn(t, at, out = Infinity) {
  if (t < at) return null;
  const k = clamp((t - at) / 0.5), e = 1 - EASE.out(k);
  const lift = t > out ? clamp((t - out) / 0.8) : 0;
  return { depth: 0.9 * e + 0.9 * lift, alpha: clamp(EASE.out(k) * 1.4) * (1 - lift) };
}
// Advert slips: thin paper with printed lines (never real copy).
function slip(x, cx, cy, w, rot, salt, alpha = 1) {
  const r = rng(salt), h = w * 0.62;
  x.save(); x.translate(cx, cy); x.rotate(rot); x.globalAlpha = alpha;
  x.fillStyle = 'rgba(43,26,18,0.55)'; x.fillRect(-w / 2, -h / 2, w, h);
  x.fillStyle = PALETTE.ink; x.fillRect(-w * 0.38, -h * 0.3, w * (0.3 + r() * 0.45), h * 0.16);
  for (let i = 0; i < 3; i++) x.fillRect(-w * 0.38, -h * 0.02 + i * h * 0.14, w * (0.4 + r() * 0.36), h * 0.05);
  x.beginPath(); x.arc(w * 0.28, h * 0.22, h * 0.13, 0, TAU); x.fill();
  x.restore();
}
function lowerThird(g, str, a) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  const px = S.u * 0.034; g.font = typeFont(TYPE, 'text', px, { weight: 500 }); g.textBaseline = 'middle';
  const w = g.measureText(str).width, x0 = S.W * 0.07, y0 = S.H * 0.84;
  g.fillStyle = 'rgba(24,14,8,0.86)'; g.fillRect(x0 - px * 0.7, y0 - px * 0.95, w + px * 1.4, px * 1.9);
  g.fillStyle = PALETTE.gold; g.fillRect(x0 - px * 0.7, y0 - px * 0.95, px * 0.12, px * 1.9);
  g.fillStyle = '#f2e2bf'; g.fillText(str, x0, y0 + px * 0.04);
  g.restore();
}

// ---------------------------------------------------------------- S1: the machine stamps (0-7.5)
// The hits accelerate from one per beat to a blur; the counter climbs to 3,600 on the last.
const HITS = lazy(() => {
  const out = []; let t = 0.12, gap = beat(1);
  while (t < CUES.burst - 0.08) { out.push(t); t += gap; gap = Math.max(0.055, gap * (t < 2.5 ? 1 : 0.86)); }
  return out;
});
function lastHit(t) { const h = HITS(); let i = -1; for (let j = 0; j < h.length; j++) if (h[j] <= t) i = j; return i; }
function countAt(t) {
  const h = HITS(), i = lastHit(t); if (i < 0) return 0;
  return i === h.length - 1 ? 3600 : Math.max(i + 1, Math.round(3600 * Math.pow((i + 1) / h.length, 3.1)));
}
function stampPose(t) {           // stamp face height above the desk: 0 on a hit, lifted between hits
  const h = HITS(), i = lastHit(t);
  if (i < 0) return 0.16 * (1 - EASE.in(clamp(t / 0.12)));
  const t0 = h[i], t1 = h[i + 1] ?? t0 + 0.6, u = clamp((t - t0) / (t1 - t0)), amp = Math.min(0.2, 0.05 + (t1 - t0) * 0.22);
  return amp * (u < 0.35 ? EASE.out(u / 0.35) : 1 - EASE.in((u - 0.35) / 0.65));
}
function machineStamps(g, k, t, S) {
  // handheld push-in, 7.5 s, ease-out (fastest at frame 0), toward the stamp; crash zoom on the first three hits
  const h = HITS(), i = lastHit(t), since = i >= 0 ? t - h[i] : 9;
  const crash = i >= 0 && i < 3 ? 0.05 * Math.exp(-since * 14) : 0;
  const cam = { x: lerp(0.18, 0.1, EASE.out(k)), y: lerp(0.0, 0.04, EASE.out(k)), z: lerp(1.0, 1.22, EASE.out(k)) + crash };
  cam.x += 0.004 * (2 * noise1(t * 1.3) - 1); cam.y += 0.004 * (2 * noise1(t * 1.1 + 9) - 1);
  const lamp = [0.75, 0.15];
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.6, i: 1.0 }, { x: -0.6, y: -0.2, r: 1.1, i: 0.35 }], t);
  shadows(cam, lamp);
  const deskY = 0.33, tx = 0.32, lift = stampPose(t);
  // the desk strip and a stack of blank slips under the stamp
  puppet(0.02, (x) => {
    x.fillStyle = PALETTE.wood; x.fillRect(-1.6, deskY, 3.4, 0.05);
    shape(x, [[-1.6, deskY + 0.05], [1.8, deskY + 0.05], [1.8, 1.2], [-1.6, 1.2]], PALETTE.ink);
    for (let j = 0; j < 6; j++) x.fillRect(tx - 0.11 + (j % 2) * 0.004, deskY - 0.012 - j * 0.006, 0.22, 0.004);
  });
  // flying slips: one per hit, sliding left off the stack, then fluttering up and out
  puppet(0.12, (x) => {
    for (let j = Math.max(0, i - 70); j <= i; j++) {
      const a = t - h[j], r = rng(500 + j); if (a < 0) continue;
      const vx = -(0.55 + r() * 0.9), vy = -(0.25 + r() * 0.55);
      const px = tx - 0.05 + vx * a, py = deskY - 0.03 + vy * a + 0.22 * a * a;
      if (px < -1.3 || py > 0.9) continue;
      slip(x, px, py, 0.075 + r() * 0.02, a * (r() - 0.5) * 9, 900 + j, 0.95);
    }
  });
  // the machine (ghost arms when it is too fast to see)
  const sx = 0.78, sy = -0.12;
  const fast = i >= 0 && (h[i + 1] ?? 99) - h[i] < 0.16;
  if (fast) for (const d of [0.33, 0.66]) {
    const lt = stampPose(t - d * 0.05);
    puppet(0.04, (x) => automaton(x, { sx, sy, tx, ty: deskY - 0.012 - lt, body: false, bend: -1 }), { alpha: 0.35 });
  }
  puppet(0.0, (x) => automaton(x, { sx, sy, tx, ty: deskY - 0.012 - lift, tilt: 0.05, spin: t * 6, bend: -1 }));
  // the counter and its words, pressed onto the paper
  const pc = pressOn(t, 0.0), pw = pressOn(t, 1.6);
  const n = countAt(t).toLocaleString('en-US');
  if (pc) puppet(pc.depth, (x) => plaque(x, n, -0.42, -0.24, 0.13, { weight: 600, gold: t > CUES.burst - 0.25 }), { alpha: pc.alpha, noHide: true });
  if (pw) puppet(pw.depth, (x) => plaque(x, 'versions of one advert', -0.42, -0.08, 0.05, { weight: 600 }), { alpha: pw.alpha, noHide: true });
  cast(g);
  room(g, cam, -2.5, -0.48, 5, 0.96);
  lattice(g, cam, -2.5, -0.48, 5, 0.96, { cw: 0.21, ch: 0.24, bar: 0.009, frame: 0.0 });
  warmVignette(g, 0.5);
  flash(g, S, i >= 0 && h[i] > CUES.burst - 0.2 ? 0.12 * Math.exp(-since * 10) : 0);
}

// ---------------------------------------------------------------- S2: the slips fall, a lamp lights the window (7.5-12.5)
const BURST = lazy(() => { const r = rng(61); return Array.from({ length: 220 }, () => ({ x: (r() - 0.5) * 2.2, y: (r() - 0.6) * 1.0, vx: (r() - 0.5) * 0.8, vy: -(0.3 + r() * 0.7), w: 0.05 + r() * 0.04, sp: (r() - 0.5) * 8, ph: r() * TAU, d: r() })); });
function slipsFall(g, k, t, S) {
  // pull back, 5 s, slow ease-in-out, from the screen to the whole door
  const lt = t - CUES.burst, cam = { x: lerp(0.15, 0.0, EASE.inOut(k)), y: lerp(0.05, 0.0, EASE.inOut(k)), z: lerp(1.35, 0.92, EASE.inOut(k)) };
  const flare = clamp((t - CUES.lampFlare) / 0.45), ov = flare < 1 ? 1 + 0.35 * MOTION.back(flare, 2.2) - 0.35 : 1;
  const lampI = t < CUES.lampFlare ? 0.18 : 0.18 + 0.85 * EASE.out(flare) * ov;
  const lamp = [0.18, 0.12];
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.5, i: lampI }], t);
  shadows(cam, lamp);
  puppet(0.25, (x) => {
    for (const [j, p] of BURST().entries()) {
      const drag = 1 - Math.exp(-lt * 1.6);
      const px = p.x + p.vx * drag * 0.6 + 0.05 * Math.sin(lt * 2.4 + p.ph);
      const py = p.y + p.vy * drag * 0.4 + 0.11 * lt * lt;
      if (py > 0.8) continue;
      slip(x, px, py, p.w, p.ph + lt * p.sp * 0.4 + 0.5 * Math.sin(lt * 3 + p.ph), 3000 + j, 0.9);
    }
  });
  // a low table and a cup on the floor strip: the room behind the paper, steam on twos
  puppet(0.05, (x) => {
    x.fillStyle = PALETTE.ink; x.fillRect(-1.2, 0.36, 2.4, 0.2);
    shape(x, [[-0.62, 0.36], [-0.6, 0.27], [-0.3, 0.27], [-0.28, 0.36]], PALETTE.ink);
    x.fillRect(-0.58, 0.25, 0.26, 0.022);
    shape(x, [[-0.5, 0.25], [-0.49, 0.21], [-0.44, 0.21], [-0.43, 0.25]], PALETTE.ink);
  });
  cast(g);
  room(g, cam, -0.62, -0.42, 1.24, 0.84);
  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);
  warmVignette(g, 0.55);
}

// ---------------------------------------------------------------- S3: the singers (12.5-27.5)
const SINGERS = [
  { kind: 'scholar', x: 0.0, salt: 11 }, { kind: 'woman', x: 1.25, salt: 23 }, { kind: 'porter', x: 2.5, salt: 37 },
  { kind: 'radio', x: 3.75, salt: 41 }, { kind: 'girl', x: 5.0, salt: 53 },
];
function singersPass(g, k, t, S) {
  // truck right, 15 s, steady (inertia), across five panels; then push in on the refrain plate (21-27.5)
  const lt = t - CUES.s3, pushK = EASE.inOut(clamp((t - 21.0) / 6.3));
  const tx = lerp(-0.1, 5.0, EASE.inertia(clamp(lt / 9.0)));
  const cam = { x: lerp(tx, SINGERS[4].x + 0.27, pushK), y: lerp(0.02, -0.17, pushK), z: lerp(0.95, 2.6, pushK) };
  const lamps = SINGERS.map((s, n) => ({ x: s.x + 0.25, y: 0.12, r: 0.95, i: 0.85 + 0.1 * Math.sin(n * 2.1) }));
  paper(g, cam, lamps, t);
  shadows(cam, [cam.x + 0.2, 0.1]);
  puppet(0.03, (x) => { x.fillStyle = PALETTE.ink; x.fillRect(-2, 0.4, 9, 0.2); });   // the floor strip
  for (const [n, s] of SINGERS.entries()) {
    if (Math.abs(s.x - cam.x) > 1.6) continue;
    const ph = (t * BPM / 60) / 3;   // one sway per bar
    const mouth = 0.5 + 0.5 * Math.sin(t * 7.5 + n);
    puppet(0.0, (x) => singer(x, s.kind, s.x - 0.1, 0.4, 0.62, { t, mouth: mouth * 0.9, nod: -0.08 + 0.05 * Math.sin(ph * TAU + n), armLift: 0.35 + 0.08 * Math.sin(ph * TAU) }));
    // the plates: a verse that is this singer's own, the refrain that is everyone's
    puppet(0.0, (x) => {
      plate(x, s.x + 0.27, -0.33, 0.36, verseNotes(s.salt), PALETTE.ink);
      plate(x, s.x + 0.27, -0.17, 0.36, REFRAIN_NOTES, PALETTE.gold);
      rod(x, s.x + 0.27, -0.12, s.x + 0.3, 0.7, 0.002);
    });
  }
  cast(g);
  lattice(g, cam, -0.75, -0.46, 6.5, 0.92, { cw: 0.13, ch: 0.23 });
  for (let n = 0; n <= 5; n++) { g.save(); view(g, cam); g.fillStyle = '#24150d'; g.fillRect(-0.75 + n * 1.25 - 0.03, -0.5, 0.06, 1.0); g.restore(); }   // posts between panels
  room(g, cam, -0.75, -0.46, 6.5, 0.92);
  warmVignette(g, 0.55);
  lowerThird(g, 'Arirang · Korean folk song', clamp((t - 13.0) / 0.4) * clamp((17.0 - t) / 0.4));
}

// ---------------------------------------------------------------- S4: the façade, the tests (27.5-37.5)
const FACADE = lazy(() => {
  const r = rng(73), cols = 13, rows = 7, cw = 0.17, ch = 0.15, x0 = -cols * cw / 2, y0 = -0.5;
  const panes = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const lit = r() < 0.78;
    panes.push({ i, j, cx: x0 + (i + 0.5) * cw, cy: y0 + (j + 0.5) * ch, lit, face: r() < 0.5 ? 1 : -1, hair: Math.floor(r() * 3), tap: 28.6 + r() * 6.5, salt: Math.floor(r() * 1e6) });
  }
  return { cols, rows, cw, ch, x0, y0, panes, w: cols * cw, h: rows * ch };
});
function facadeTests(g, k, t, S) {
  // zoom out, 10 s, slow ease-out, from one window (matching the refrain plate) to the whole block
  const F = FACADE(), lt = t - CUES.s4, home = F.panes[3 * F.cols + 6];
  const z = lerp(4.2, 0.82, EASE.inOut(clamp(lt / 6.5)));
  const cam = { x: lerp(home.cx, 0, EASE.inOut(clamp(lt / 6.5))), y: lerp(home.cy, 0.02, EASE.inOut(clamp(lt / 6.5))), z };
  const lamps = F.panes.filter((p) => p.lit).map((p) => {
    const tapped = t > p.tap ? Math.exp(-(t - p.tap) * 3) : 0;
    return { x: p.cx, y: p.cy - 0.01, r: 0.13, i: 0.55 + 0.9 * tapped, col: '226,236,232', hot: '245,250,248', steady: true };
  });
  paper(g, cam, lamps, t, { base: '#1a1512' });
  shadows(cam, [cam.x, cam.y]);
  // people in their windows, phones to their faces
  puppet(0.06, (x) => {
    for (const p of F.panes) {
      if (!p.lit) continue;
      const bx = p.cx + p.face * 0.025, by = p.cy + F.ch * 0.5, s = 0.11;
      x.fillStyle = PALETTE.ink;
      x.beginPath(); x.ellipse(bx, by - 0.005, s * 0.45, s * 0.28, 0, Math.PI, TAU); x.fill();
      x.beginPath(); x.arc(bx, by - s * 0.42, s * 0.2, 0, TAU); x.fill();
      if (p.hair === 1) { x.beginPath(); x.arc(bx - p.face * s * 0.16, by - s * 0.5, s * 0.1, 0, TAU); x.fill(); }
      if (p.hair === 2) x.fillRect(bx - s * 0.22, by - s * 0.6, s * 0.44, s * 0.08);
      x.fillRect(bx + p.face * s * 0.22, by - s * 0.5, p.face * s * 0.08, s * 0.16);   // the phone
    }
  });
  // ant trails: slips march from the top along curved paths into windows; after a tap one comes back gold-edged
  const src = [0, -0.62];
  puppet(0.0, (x) => {
    for (const p of F.panes) {
      if (!p.lit) continue;
      const r = rng(p.salt), bend = (r() - 0.5) * 0.5;
      const pt = (u) => { const mx = (src[0] + p.cx) / 2 + bend, my = (src[1] + p.cy) / 2 - 0.1; return [(1 - u) * (1 - u) * src[0] + 2 * (1 - u) * u * mx + u * u * p.cx, (1 - u) * (1 - u) * src[1] + 2 * (1 - u) * u * my + u * u * p.cy]; };
      const conv = clamp((t - CUES.converge) / 2.5);
      const n = 7, speed = 0.32;
      for (let m = 0; m < n; m++) {
        let u = ((lt * speed + m / n + r()) % 1);
        if (t > p.tap + 0.2 && m === 0) u = 1 - clamp((t - p.tap - 0.2) * 0.4);   // the tapped one returns
        const [ax, ay] = pt(u), a = (1 - conv);
        if (a <= 0.02 && m !== 0) continue;
        x.save(); x.globalAlpha = m === 0 ? 1 : a;
        x.translate(ax, ay); x.rotate(Math.sin(lt * 6 + m) * 0.2);
        x.fillStyle = PALETTE.ink; x.fillRect(-0.011, -0.007, 0.022, 0.014);
        x.restore();
      }
    }
    // the winner: the returned slips gather at the top, one slip grows
    const w = clamp((t - CUES.converge - 1.5) / 2.0);
    if (w > 0) slip(x, 0, -0.58 + 0.0 * w, lerp(0.03, 0.2, EASE.out(w)), 0.02 * Math.sin(t * 2), 7777, 1);
  });
  cast(g);
  // the block: its floors are the lattice, a roof line above
  g.save(); view(g, cam); g.fillStyle = '#120c08';
  g.fillRect(F.x0 - 0.06, F.y0 - 0.1, F.w + 0.12, 0.06);
  g.restore();
  lattice(g, cam, F.x0, F.y0, F.w, F.h, { cw: F.cw, ch: F.ch, bar: 0.016, color: '#1e140e', frameColor: '#120c08', frame: 0.05 });
  room(g, cam, F.x0 - 0.02, F.y0 - 0.15, F.w + 0.04, F.h + 0.2);
  warmVignette(g, 0.45);
}

// ---------------------------------------------------------------- S5: dawn, the billboard (37.5-45)
function billboardDawn(g, k, t, S) {
  // locked wide, 7.5 s; the posters change on every beat after 40.0 (time-lapse); the light crosses the paper
  const lt = t - CUES.s5, cam = { x: 0, y: 0, z: 0.95 };
  const sun = lerp(-1.2, 1.0, k);
  paper(g, cam, [{ x: sun, y: -0.6, r: 1.9, i: 0.55, col: '226,224,210', hot: '250,246,232', steady: true }], t, { base: '#5b5f5a', daylight: { top: '#9aa19a', bottom: '#6d736d' } });
  shadows(cam, [sun, -0.6]);
  puppet(0.03, (x) => {   // the billboard: a frame on two posts, a catwalk, a city edge below
    x.fillStyle = PALETTE.ink;
    x.fillRect(-0.62, -0.36, 1.24, 0.03); x.fillRect(-0.62, 0.16, 1.24, 0.03); x.fillRect(-0.62, -0.36, 0.03, 0.55); x.fillRect(0.59, -0.36, 0.03, 0.55);
    x.fillRect(-0.4, 0.19, 0.05, 0.5); x.fillRect(0.35, 0.19, 0.05, 0.5);
    for (let i = 0; i < 12; i++) x.fillRect(-0.62 + i * 0.11, 0.21, 0.006, 0.05); x.fillRect(-0.64, 0.25, 1.28, 0.01);
    const r = rng(19); let cx = -1.2; while (cx < 1.2) { const w = 0.08 + r() * 0.16, h = 0.12 + r() * 0.25; x.fillRect(cx, 0.48 - h, w, h + 0.1); cx += w; }
  });
  // posters: the winner first, then a new one every beat, pasted over
  const first = 37.9, every = beat(1);
  const n = t < 40.0 ? 0 : 1 + Math.floor((t - 40.0) / every);
  for (let m = Math.max(0, n - 1); m <= n; m++) {
    const at = m === 0 ? first : 40.0 + (m - 1) * every, a = t - at;
    if (a < 0) continue;
    const press = clamp(a / 0.35);
    puppet(0.6 * (1 - EASE.out(press)), (x) => {
      x.save(); x.translate(0, -0.085); x.scale(lerp(1.08, 1, EASE.out(press)), 1);
      const r = rng(4200 + m);
      x.fillStyle = 'rgba(43,26,18,0.42)'; x.fillRect(-0.56, -0.25, 1.12, 0.5);
      x.fillStyle = PALETTE.ink; x.fillRect(-0.5, -0.19, 0.3 + r() * 0.5, 0.09);
      for (let i = 0; i < 3; i++) x.fillRect(-0.5, -0.04 + i * 0.05, 0.25 + r() * 0.5, 0.018);
      x.beginPath(); x.arc(0.3 + (r() - 0.5) * 0.1, 0.05, 0.08 + r() * 0.05, 0, TAU); x.fill();
      x.restore();
    }, { alpha: lerp(0.4, 1, press) });
  }
  cast(g);
  lattice(g, cam, -1.0, -0.56, 2.0, 1.12, { cw: 0.25, ch: 0.28, bar: 0.008, color: '#3a3a36', frameColor: '#262622', frame: 0.0 });
}

// ---------------------------------------------------------------- S6: she hums the refrain (45-52.5)
function singerHums(g, k, t, S) {
  // slow push-in, 7.5 s, ease-in-out, toward her
  const cam = { x: lerp(0.0, -0.08, EASE.inOut(k)), y: lerp(0.0, 0.05, EASE.inOut(k)), z: lerp(0.95, 1.25, EASE.inOut(k)) };
  const lamp = [0.32, 0.18];
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 }], t);
  shadows(cam, lamp);
  puppet(0.03, (x) => {
    x.fillStyle = PALETTE.ink; x.fillRect(-1.2, 0.36, 2.4, 0.2);
    shape(x, [[0.12, 0.36], [0.14, 0.27], [0.44, 0.27], [0.46, 0.36]], PALETTE.ink); x.fillRect(0.16, 0.25, 0.26, 0.022);
    shape(x, [[0.24, 0.25], [0.25, 0.21], [0.3, 0.21], [0.31, 0.25]], PALETTE.ink);
  });
  // steam, swapped on twos
  const st = Math.floor(t * 12);
  puppet(0.15, (x) => {
    const r = rng(st % 5 + 600); x.strokeStyle = PALETTE.ink; x.lineWidth = 0.006; x.lineCap = 'round';
    for (let s = 0; s < 2; s++) { x.beginPath(); let px = 0.265 + s * 0.02, py = 0.2; x.moveTo(px, py); for (let i = 0; i < 6; i++) { px += (r() - 0.5) * 0.03; py -= 0.025; x.lineTo(px, py); } x.stroke(); }
  }, { alpha: 0.6 });
  const ph = (t * BPM / 60) / 3, hum = 0.15 + 0.15 * Math.sin(t * 5.2);
  puppet(0.0, (x) => singer(x, 'woman', -0.12, 0.36, 0.7, { t, seated: true, mouth: hum, nod: -0.12 + 0.06 * Math.sin(ph * TAU), armLift: 0.1, tremor: 0.7 }));
  cast(g);
  room(g, cam, -0.62, -0.42, 1.24, 0.84);
  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);
  warmVignette(g, 0.55);
}

// ---------------------------------------------------------------- S7: the machine listens (52.5-62.5)
function machineListens(g, k, t, S) {
  // locked medium; from the hold, a slow dolly back, 7 s, to the whole window with its title
  const back = EASE.inOut(clamp((t - CUES.hold) / 7.0));
  const cam = { x: lerp(-0.02, 0.0, back), y: lerp(0.05, 0.0, back), z: lerp(1.25, 0.9, back) };
  const lamp = [0.32, 0.18];
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 }], t);
  shadows(cam, lamp);
  puppet(0.03, (x) => {
    x.fillStyle = PALETTE.ink; x.fillRect(-1.2, 0.36, 2.4, 0.2);
    shape(x, [[0.12, 0.36], [0.14, 0.27], [0.44, 0.27], [0.46, 0.36]], PALETTE.ink); x.fillRect(0.16, 0.25, 0.26, 0.022);
    shape(x, [[0.24, 0.25], [0.25, 0.21], [0.3, 0.21], [0.31, 0.25]], PALETTE.ink);
  });
  const ph = (t * BPM / 60) / 3, hum = t > CUES.silenceEnd ? 0.15 + 0.15 * Math.sin(t * 5.2) : 0.05;
  puppet(0.0, (x) => singer(x, 'woman', -0.12, 0.36, 0.7, { t, seated: true, mouth: hum, nod: -0.12 + 0.06 * Math.sin(ph * TAU), armLift: 0.1, tremor: 0.7 }));
  // the machine: enters from the right (far from the paper, soft), raises the stamp over her, holds, tilts, lowers
  const enter = EASE.out(clamp((t - CUES.s7) / 1.2));
  const raise = MOTION.anticipate(clamp((t - CUES.raise) / 0.9), 0.12, 0.3);
  const lower = EASE.inOut(clamp((t - 57.0) / 2.0));
  const tilt = EASE.inOut(clamp((t - CUES.hold - 0.3) / 1.2)) * -0.32;
  const sx = lerp(1.3, 0.58, enter), sy = -0.08;
  const tx = lerp(0.5, -0.04, raise) + lerp(0, 0.3, lower), ty = lerp(0.18, -0.17, raise) + lerp(0, 0.38, lower);
  const depth = lerp(0.35, 0.06, enter);
  puppet(depth, (x) => automaton(x, { sx, sy, tx, ty, tilt, spin: t < CUES.hold ? t * 6 : CUES.hold * 6, bend: 1, s: 1.05 }));
  // the title, pressed on
  const pt = pressOn(t, CUES.title);
  if (pt) puppet(pt.depth, (x) => plaque(x, 'REFRAIN', -0.02, -0.27, 0.11, { weight: 600, gold: true, tracking: 0.18 }), { alpha: pt.alpha, noHide: true });
  cast(g);
  room(g, cam, -0.62, -0.42, 1.24, 0.84);
  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);
  warmVignette(g, 0.55);
}

// ---------------------------------------------------------------- the score
// The Arirang refrain (traditional, public domain), in G, beats of a quarter note: [beat, length, MIDI].
const R = [[0, 1.5, 74], [1.5, 0.5, 76], [2, 0.5, 74], [2.5, 0.5, 76], [3, 1.5, 79], [4.5, 0.5, 81], [5, 0.5, 79], [5.5, 0.5, 81],
  [6, 1, 83], [7, 0.5, 81], [7.5, 0.5, 83], [8, 0.5, 79], [8.5, 0.5, 76], [9, 1.5, 74]];
// the close of the first half ("...neomeoganda"): beats from the end of the phrase, resolving on G
const CLOSE = [[0, 0.5, 74], [0.5, 0.5, 76], [1, 1.5, 79], [2.5, 0.5, 81], [3, 1, 79], [4, 3, 79]];
function phrase(ctx, out, notes, t0, o = {}) {
  for (const [b, len, m] of notes) {
    const t = t0 + beat(b) + (o.rubato ? o.rubato * Math.sin(b * 1.7) : 0);
    sample(ctx, out, 'zither', t, { note: m + (o.oct || 0), vel: o.vel ?? 0.7, gain: (o.gain ?? 0.9) * (b % 3 === 0 ? 1 : 0.85), pan: o.pan ?? -0.1 });
  }
}
// a verse: an improvised phrase on the same five notes, different every time (seeded)
function verse(ctx, out, t0, salt, beats = 3) {
  const r = rng(salt), sc = [74, 76, 79, 81, 83, 86]; let b = 0;
  while (b < beats - 0.4) { const len = [0.5, 0.5, 1, 1.5][Math.floor(r() * 4)]; sample(ctx, out, 'zither', t0 + beat(b), { note: sc[Math.floor(r() * sc.length)], vel: 0.6, gain: 0.75, pan: 0.1 }); b += len; }
}
// the machine: the same notes in every order, fast and dry (clavinet)
function permute(ctx, out, from, to, step, salt, gain = 0.32) {
  const r = rng(salt), sc = [74, 76, 79, 81, 83, 86, 88];
  for (let t = from; t < to - 1e-6; t += step) sample(ctx, out, 'clavi', t, { note: sc[Math.floor(r() * sc.length)] - 12 * (r() < 0.3 ? 1 : 0), vel: 0.5, gain, pan: (r() - 0.5) * 0.5 });
}
function cello(ctx, out, from, to, notes, gain = 0.32) {
  for (let t = from; t < to - 0.4; t += 3.2) for (const n of notes) sample(ctx, out, 'cellos', t, { note: n, vel: 0.6, gain: gain * (t === from ? 0.8 : 1), pan: 0 });
}
function drum(ctx, out, from, to, gain = 0.5) {
  for (let b = Math.ceil((from - BEAT0) / beat(1)); beat(b) < to - 1e-6; b++) {
    const t = beat(b), pos = b % 3;
    sample(ctx, out, 'frame-drum', t, { vel: pos === 0 ? 0.9 : 0.4, gain: gain * (pos === 0 ? 1 : pos === 2 ? 0.55 : 0.35) });
    if (pos === 1) sample(ctx, out, 'frame-drum', t + beat(0.5), { vel: 0.2, gain: gain * 0.25 });
  }
}
function score(ctx, out) {
  // C1 the machine: permutations speed up with the stamp (8ths, 16ths, then a blur), its ticks on every hit
  permute(ctx, out, 0.12, 2.5, beat(0.5), 1, 0.3);
  permute(ctx, out, 2.5, 5.0, beat(0.25), 2, 0.28);
  permute(ctx, out, 5.0, CUES.burst - 0.1, beat(0.125), 3, 0.24);
  for (const h of HITS()) tick(ctx, out, h, 0.12);
  // C2 the song: the refrain enters with the lamp; two verses, each its own; the refrain again, exactly the same
  cello(ctx, out, CUES.burst, CUES.s4, ['G2', 'D3'], 0.3);
  phrase(ctx, out, R, CUES.burst);
  verse(ctx, out, CUES.verse1, 101, 2); verse(ctx, out, CUES.verse2, 202, 3);
  phrase(ctx, out, R, CUES.refrain2);
  drum(ctx, out, bar3(6), CUES.s4, 0.45);
  // C3 the tests: the machine again, everywhere, over a pulse; no refrain
  permute(ctx, out, CUES.s4, CUES.s5, beat(0.25), 4, 0.26);
  permute(ctx, out, CUES.s4 + beat(1.5), CUES.s5, beat(0.5), 5, 0.18);
  drum(ctx, out, CUES.s4, CUES.s5, 0.42);
  cello(ctx, out, CUES.s4, CUES.s6, ['E2', 'B2'], 0.22);
  for (let b = 0; 40.0 + b * beat(1) < CUES.s6 - 0.1; b++) tick(ctx, out, 40.0 + b * beat(1), 0.16);   // a poster a beat
  permute(ctx, out, CUES.s5, CUES.s5 + 2.5, beat(0.5), 6, 0.14);
  // C4 the refrain alone, plain; then the machine tries again, stops, and the song closes on G
  cello(ctx, out, CUES.s6, CUES.end, ['G2', 'D3', 'B3'], 0.26);
  phrase(ctx, out, R, CUES.s6, { gain: 0.95 });
  permute(ctx, out, CUES.s7 + 0.4, CUES.hold, beat(0.5), 7, 0.2);
  phrase(ctx, out, CLOSE, CUES.silenceEnd, { gain: 0.9, rubato: 0.03 });
  pad(ctx, out, CUES.silenceEnd + beat(4), CUES.end - CUES.silenceEnd - beat(4), [hz('G3'), hz('B3'), hz('D4')], 0.05);
}

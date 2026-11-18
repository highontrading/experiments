// ============================== FILM ==============================
const TITLE = 'Carousel';
const PURPOSE = 'cinematic';
// The picture is a three.js world (engine/world.mjs) with its own look chain (tone mapping, AA, bloom, grain,
// vignette: engine/looks.mjs); the 2D look pass below is a pass-through so nothing is graded twice.
const LOOKS = {
  'passthrough': { grade: '', bloom: 0, texture: null, vignette: 0, grain: 0, grainHold: 1, hold: 24, line: 0, steps: 0,
    palette: { bg: '#07080a', ink: '#f4f2ee', accent: '#ffae5c', dim: '#2a2826' } },
};
const LOOK_ID = 'passthrough';
const LOOK = LOOKS[LOOK_ID];
const FINISH = { shutter: null, weave: 0, tone: null };
const FPS = 24;
const DURATION = 60;
const BPM = 80;                             // bar = 3 s
const BEAT0 = 0;
const beat = (n) => BEAT0 + n * 60 / BPM, bar = (n) => beat(4 * n);
const OWN_MUSIC = null;
const INSTRUMENTS = ['fm-piano', 'vibes'];
const CAST = {};
const FORMULAS = {};
const PALETTE = { bg: '#07080a', ink: '#f4f2ee', accent: '#ffae5c', dim: '#2a2826' };
const TYPE = {
  lang: 'en',
  roles: {
    display: { family: 'Instrument Serif', pkg: 'instrument-serif', version: '5.3.0', cap: 0.72, weights: [400], styles: ['normal'] },
    text: { family: 'Familjen Grotesk', pkg: 'familjen-grotesk', version: '5.3.0', cap: 0.65, variable: 'wght', varVersion: '5.3.0', axes: { wght: [400, 700] } },
    mono: null,
  },
  check: { strings: { text: ['BAGGAGE CLAIM', 'CAROUSEL 4', 'ORDER PLACED', 'MAYA, THIS ONE IS YOURS'] }, sizes: {} },
};

const CUES = {
  start: 0, rise: 6, screens: 9.5, descend: 14, flaps: 21.2, back: 22, arm: 26.2, turn: 32, out: 35.8, phones: 37.2,
  buy: 39.6, boxes: 40.2, crane: 44, thesis: 48, desk: 52, page: 54, end: DURATION,
};
// The airport PA: a chime, then the line.
const VO = [
  { id: 'VO1', at: 3.0, dur: 3.95 },
  { id: 'VO2', at: 11.0, dur: 3.17 },
  { id: 'VO3', at: 15.6, dur: 2.67 },
  { id: 'VO4', at: 38.2, dur: 2.36 },
  { id: 'VO5', at: 41.4, dur: 5.42 },
  { id: 'VO6', at: 48.0, dur: 4.21 },
  { id: 'VO7', at: 54.2, dur: 4.68 },
];
const CHIMES = VO.filter((v) => v.id !== 'VO3' && v.id !== 'VO5').map((v) => v.at - 1.45);   // a chime opens each announcement
const CAPTIONS = null;
const CAPTION_STYLE = { role: 'display', accentRole: 'display', size: 0.062, caps: false, ink: PALETTE.ink, hi: PALETTE.ink, accent: PALETTE.accent, punch: 0.07 };

// One continuous shot: the beats live in the camera path (engine/world.mjs KEYS); the rows below are its chapters.
const SCENES = [
  { chapter: 'C1', from: 0, to: CUES.back, draw: carousel, action: 'the belt carries bags past screens playing adverts to an empty hall; the camera rides it into the flaps', amb: { kind: 'room', gain: 0.02 } },
  { chapter: 'C2', from: CUES.back, to: CUES.out, draw: carousel, action: 'a wall of screens writes adverts; a robot arm tags a bag', amb: { kind: 'room', gain: 0.02 } },
  { chapter: 'C3', from: CUES.out, to: CUES.desk, draw: carousel, action: 'phones on the bags wake, watch the adverts and buy; boxes pour onto the belt', amb: { kind: 'room', gain: 0.02 } },
  { chapter: 'C4', from: CUES.desk, to: CUES.end, draw: carousel, action: 'the empty help desk; the page goes unanswered', amb: { kind: 'room', gain: 0.02 } },
];

const SFX = [
  { at: CUES.flaps - 0.35, voice: 'whoosh', dur: 0.7, gain: 0.18, wet: 0.2 },   // through the flaps
  { at: CUES.out - 0.35, voice: 'whoosh', dur: 0.7, gain: 0.16, wet: 0.2 },     // out again
];
const ROOM = { secs: 3.2, decay: 3.6, tone: 3800 };   // a big hard hall

const ARRANGEMENT = [
  { section: 'muzak', from: 0, to: CUES.back, parts: ['epiano', 'vibes', 'chime'] },
  { section: 'machine', from: CUES.back, to: CUES.out, parts: ['pulse'] },
  { section: 'muzak2', from: CUES.out, to: CUES.desk, parts: ['epiano', 'vibes', 'chime'] },
  { section: 'page', from: CUES.desk, to: CUES.end, parts: ['chime'] },
];

// ---------------------------------------------------------------- the 3D world
let WORLD = null;
async function initWorld() {
  const { makeWorld } = await import('./engine/world.mjs');
  const { LOOKS: L3 } = await import('./engine/looks.mjs');
  const base = L3['cinematic-realistic'];
  const look = { ...base, post: { tone: 'AGX', saturation: 0.02, contrast: 0.1, brightness: 0, msaa: 2,
    bloom: { threshold: 0.78, smoothing: 0.25, intensity: 0.85, radius: 0.72 },
    vignette: { offset: 0.32, darkness: 0.5 }, grain: { intensity: 0.04, size: 1.3 } } };
  WORLD = await makeWorld({ W, H, font: '"Familjen Grotesk", ui-sans-serif, sans-serif', look });
}
function carousel(g, k, t, S) {
  // one continuous shot: the camera path is engine/world.mjs KEYS (ride, rise, flaps, back hall, turn, ride, crane, desk)
  WORLD.render(Math.round(t * FPS), t);
  g.drawImage(WORLD.canvas, 0, 0, S.W, S.H);
}

// ---------------------------------------------------------------- the score
// Hall muzak written for nobody: a soft e-piano and vibes through a narrow PA band; a machine pulse in the back hall;
// the three-note chime is the signature. Silence at the end, after the page.
function chime(ctx, out, t, gain = 0.2) {
  [[0, 'E5'], [0.42, 'C5'], [0.84, 'G4']].forEach(([d, n]) => sample(ctx, out, 'vibes', t + d, { note: n, vel: 0.7, gain }));
}
function score(ctx, out) {
  const pa = ctx.createBiquadFilter(); pa.type = 'bandpass'; pa.frequency.value = 1400; pa.Q.value = 0.55;
  const paGain = ctx.createGain(); paGain.gain.value = 0.9; pa.connect(paGain).connect(out);
  const prog = ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'];
  const muzak = (from, to, fade = 0) => {
    for (let b = Math.ceil(from / beat(1)); beat(b) < to - 0.01; b++) {
      const t = beat(b), ch = chordAt(prog, t, 1, 0), fadeK = fade && t > to - 3 ? (to - t) / 3 : 1;
      if (b % 4 === 0) ch.forEach((f, i) => sample(ctx, pa, 'fm-piano', t + i * 0.02, { note: Math.round(69 + 12 * Math.log2(f / 440)) + 12, vel: 0.45, gain: 0.16 * fadeK }));
      if (b % 2 === 1) { const n = [76, 77, 79, 81, 79, 77, 76, 74][b % 8]; sample(ctx, pa, 'vibes', t, { note: n, vel: 0.5, gain: 0.1 * fadeK }); }
    }
  };
  muzak(0, CUES.back - 0.3, 1);
  muzak(CUES.out + 0.4, CUES.desk, 1);
  // the back hall: a machine pulse (soft kick and ticks)
  for (let b = Math.ceil(CUES.back / beat(1)); beat(b) < CUES.out; b++) { kick(ctx, out, beat(b), 0.22); tick(ctx, out, beat(b) + beat(0.5), 0.06); }
  for (const t of CHIMES) chime(ctx, pa, t, 0.32);
}

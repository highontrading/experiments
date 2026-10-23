// Praja Video 3: the whole film as renderAt(t).
// Every scene is built once from build/timeline.js (slide times + word cues),
// then renderAt(t) only sets transforms, so any frame renders the same every time.
// Design language: the "American File" collage: slate-blue board, torn cream paper,
// cut-out ransom letters, masking tape, yellow tape + marker, halftone ink.
"use strict";
const TL = window.TL;
const W = 1920, H = 1080;

// ------------------------------------------------------------ utilities --
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  out: (p) => 1 - Math.pow(1 - p, 3),
  in: (p) => p * p * p,
  inout: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  back: (p) => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// torn-edge polygon in percent (estimated size keeps the tear amplitude in px)
function torn(seed, w = 300, h = 100, amp = 5, step = 14, edges = "trbl") {
  const r = rng(seed), pts = [];
  const j = (e) => (edges.includes(e) ? r() * amp : 0);
  const P = (x, y) => pts.push(`${((x / w) * 100).toFixed(2)}% ${((y / h) * 100).toFixed(2)}%`);
  for (let x = 0; x < w; x += step * (0.6 + r() * 0.8)) P(x, j("t"));
  for (let y = 0; y < h; y += step * (0.6 + r() * 0.8)) P(w - j("r"), y);
  for (let x = w; x > 0; x -= step * (0.6 + r() * 0.8)) P(x, h - j("b"));
  for (let y = h; y > 0; y -= step * (0.6 + r() * 0.8)) P(j("l"), y);
  return `polygon(${pts.join(",")})`;
}

function noiseURL(size, seed, fn) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d"), img = g.createImageData(size, size), r = rng(seed);
  for (let i = 0; i < size * size; i++) {
    const [R, G, B, A] = fn(r);
    img.data.set([R, G, B, A], i * 4);
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

// ---------------------------------------------------------------- copy --
const NEWS_WORDS = ("ward committee budget allocation municipal corporation citizens report civic data " +
  "public works water supply roads drainage property tax assessment open space garden proposal " +
  "councillor attendance questions raised grievance redressal complaint resolved pending department " +
  "standing committee capital expenditure revenue zone ward office survey area sabha mohalla sabha " +
  "transparency accountability participation planning streetlights footpath sanitation health " +
  "education schools hospitals annual report 2026 white paper status of civic issues").split(" ");
function newsText(seed, n = 260) {
  const r = rng(seed); let out = "";
  for (let i = 0; i < n; i++) {
    if (r() < 0.025) out += `<b>${NEWS_WORDS[(r() * NEWS_WORDS.length) | 0].toUpperCase()} ${NEWS_WORDS[(r() * NEWS_WORDS.length) | 0].toUpperCase()}</b>`;
    out += NEWS_WORDS[(r() * NEWS_WORDS.length) | 0] + (r() < 0.08 ? ". " : " ");
  }
  return out;
}

// ---------------------------------------------------------------- icons --
// viewBox 0 0 100 100, drawn in ink with yellow / cream / halftone fills
const ICONS = {
  ballot: `<rect class="c" x="34" y="10" width="32" height="42" rx="2"/><path d="M41 30l6 7 12-14"/>
    <rect class="ht" x="14" y="46" width="72" height="42" rx="3"/><rect class="c" x="14" y="46" width="72" height="12" rx="2"/><path d="M32 52h36"/>`,
  rupee: `<circle class="y" cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="28" stroke-dasharray="3 6"/>
    <path d="M36 32h28M36 43h28M46 32c15 0 15 22 0 22h-9l22 18"/>`,
  megaphone: `<path class="y" d="M18 40v20h14l34 18V22L32 40z"/><path d="M32 60l7 20h9l-5-18"/><path d="M76 38c5 6 5 18 0 24M84 30c10 11 10 29 0 40"/>`,
  people: `<circle class="c" cx="28" cy="38" r="10"/><path class="ht" d="M10 82c0-18 8-28 18-28s18 10 18 28z"/>
    <circle class="c" cx="72" cy="38" r="10"/><path class="ht" d="M54 82c0-18 8-28 18-28s18 10 18 28z"/>
    <circle class="c" cx="50" cy="30" r="12"/><path class="y" d="M28 88c0-22 10-34 22-34s22 12 22 34z"/>`,
  speech: `<path class="c" d="M12 18h76v48H46L28 82V66H12z"/><path d="M26 34h48M26 48h32"/><circle class="y" cx="78" cy="22" r="9"/>`,
  hand: `<rect class="y" x="30" y="22" width="10" height="38" rx="5"/><rect class="y" x="41" y="12" width="10" height="46" rx="5"/><rect class="y" x="52" y="14" width="10" height="44" rx="5"/><rect class="y" x="63" y="22" width="10" height="38" rx="5"/>
    <path class="y" d="M28 50h46v14c0 16-10 26-24 26s-24-8-24-22z"/><path class="y" d="M30 64c-6-6-14-12-18-8s4 12 10 20"/><path d="M38 70h24" stroke-width="3"/>`,
  track: `<path d="M12 86h76"/><rect class="c" x="18" y="58" width="12" height="28"/><rect class="ht" x="36" y="44" width="12" height="42"/><rect class="c" x="54" y="64" width="12" height="22"/>
    <circle class="y" cx="66" cy="34" r="17"/><circle cx="66" cy="34" r="10"/><path d="M79 47l12 12"/>`,
  scales: `<path d="M50 14v68M30 86h40M18 28h64"/><circle class="y" cx="50" cy="14" r="5"/>
    <path d="M18 28L8 54M18 28l10 26M82 28l-10 26M82 28l10 26"/><path class="c" d="M6 54c0 12 24 12 24 0z"/><path class="ht" d="M70 54c0 12 24 12 24 0z"/>`,
  ear: `<path class="c" d="M30 42c0-18 12-28 26-28s26 12 26 28c0 14-10 19-15 27s-4 22-18 22c-10 0-15-7-15-12"/>
    <path d="M44 42c0-9 6-14 12-14s12 5 12 14c0 7-7 9-9 14"/><path class="nf" d="M14 34c-4 8-4 18 0 26" stroke="#efc031" stroke-width="5"/><path class="nf" d="M6 28c-7 12-7 28 0 40" stroke="#efc031" stroke-width="5"/>`,
  eye: `<path class="c" d="M8 50c16-24 68-24 84 0-16 24-68 24-84 0z"/><circle class="y" cx="50" cy="50" r="15"/><circle class="k" cx="50" cy="50" r="6"/><path d="M50 14v-6M24 22l-4-5M76 22l4-5"/>`,
  tap: `<rect class="c" x="28" y="8" width="44" height="80" rx="7"/><path d="M28 20h44M28 74h44"/><circle class="y" cx="50" cy="46" r="13"/><path d="M44 46l5 5 8-9"/>
    <path class="nf" d="M80 40c4 4 4 12 0 16M86 34c7 7 7 21 0 28" stroke="#161412"/>`,
  tree: `<rect class="c" x="44" y="56" width="12" height="32"/><path d="M30 88h40"/><circle class="ht" cx="50" cy="38" r="26"/><circle class="y" cx="34" cy="46" r="14"/><circle class="c" cx="64" cy="30" r="12"/>`,
  form: `<path class="c" d="M22 8h40l16 16v68H22z"/><path d="M62 8v16h16M32 40h36M32 52h36M32 64h22"/><rect class="y" x="32" y="74" width="20" height="9"/>`,
  thumbsUp: `<rect class="k" x="12" y="46" width="16" height="42" rx="2"/><path class="y" d="M30 48l14-30c7 0 11 5 9 13l-4 15h24c7 0 10 6 8 12l-8 24c-2 4-5 6-9 6H30z"/>`,
  thumbsDown: `<g transform="rotate(180 50 50)"><rect class="k" x="12" y="46" width="16" height="42" rx="2"/><path class="c" d="M30 48l14-30c7 0 11 5 9 13l-4 15h24c7 0 10 6 8 12l-8 24c-2 4-5 6-9 6H30z"/></g>`,
  building: `<path d="M10 88h80M14 82h72"/><path class="c" d="M18 46h64v36H18z"/><path d="M27 50v28M39 50v28M50 50v28M61 50v28M73 50v28"/>
    <path class="ht" d="M12 46l38-22 38 22z"/><path class="y" d="M38 24c0-12 24-12 24 0z"/><path d="M50 12V4"/>`,
  clock: `<circle class="c" cx="50" cy="52" r="34"/><path d="M50 30v22l14 10"/><circle class="y" cx="50" cy="52" r="5"/><path d="M38 12h24M50 12v6"/>`,
  bell: `<path class="y" d="M24 70c6-6 6-14 6-26 0-12 8-22 20-22s20 10 20 22c0 12 0 20 6 26z"/><path d="M42 78c0 6 16 6 16 0M50 14v8"/><path d="M80 30c4 4 6 10 6 16M20 30c-4 4-6 10-6 16"/>`,
  check: `<circle class="y" cx="50" cy="50" r="36"/><path d="M32 52l12 12 24-28" stroke-width="7"/>`,
  stars: `<path class="y" d="M50 10l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z"/><path class="c" d="M18 64l4 8 9 1-6 7 1 9-8-4-8 4 1-9-6-7 9-1z"/><path class="c" d="M82 64l4 8 9 1-6 7 1 9-8-4-8 4 1-9-6-7 9-1z"/>`,
  database: `<path class="ht" d="M20 22v56c0 8 60 8 60 0V22"/><ellipse class="c" cx="50" cy="22" rx="30" ry="9"/><path class="nf" d="M20 41c0 8 60 8 60 0M20 60c0 8 60 8 60 0"/><circle class="y" cx="68" cy="70" r="6"/>`,
  map: `<path class="c" d="M8 24l26-9 32 9 26-9v62l-26 9-32-9-26 9z"/><path d="M34 15v62M66 24v62"/><path class="nf" d="M14 50h70M20 36l60 28" stroke-dasharray="4 5" stroke-width="3"/>
    <path class="y" d="M58 20c-9 0-14 7-14 13 0 10 14 24 14 24s14-14 14-24c0-6-5-13-14-13z"/><circle class="c" cx="58" cy="33" r="5"/>`,
  valuation: `<path class="c" d="M14 50l30-26 30 26v36H14z"/><path class="ht" d="M34 86V62h20v24"/><path d="M60 20l26 2 2 26-30 30-26-26z" class="y"/><circle class="c" cx="76" cy="32" r="5"/><path d="M58 46h14M58 52h14M62 46c6 0 6 8 0 8l8 8"/>`,
  selfAssess: `<rect class="c" x="22" y="14" width="56" height="76" rx="4"/><rect class="k" x="38" y="8" width="24" height="12" rx="3"/><path d="M32 38l5 5 8-9M52 39h18M32 58l5 5 8-9M52 59h18M32 78h38"/><circle class="y" cx="76" cy="78" r="12"/><path d="M71 78l4 4 7-8"/>`,
  calendar: `<rect class="c" x="12" y="18" width="76" height="70" rx="5"/><path class="k" d="M12 30h76v-8c0-2-2-4-4-4H16c-2 0-4 2-4 4z"/><path d="M30 10v16M70 10v16M24 46h10M45 46h10M66 46h10M24 62h10M45 62h10"/>
    <circle class="y" cx="70" cy="68" r="15"/><path d="M62 66c2-6 12-8 16 0l2-5M78 72c-2 6-12 8-16 0l-2 5"/>`,
  link: `<rect class="c" x="8" y="34" width="46" height="30" rx="15" transform="rotate(-30 31 49)"/><rect class="y" x="46" y="36" width="46" height="30" rx="15" transform="rotate(-30 69 51)"/>`,
  receipt: `<path class="c" d="M24 8h52v84l-9-6-8 6-9-6-8 6-9-6-9 6z"/><path d="M34 26h32M34 38h32M34 50h20"/><circle class="y" cx="62" cy="68" r="11"/><path d="M57 68l4 4 7-8"/>`,
  dept: `<circle class="c" cx="50" cy="26" r="14"/><path class="ht" d="M22 88c0-26 12-40 28-40s28 14 28 40z"/><path class="y" d="M46 50l4 26 4-26z"/><rect class="c" x="58" y="62" width="22" height="16" rx="2"/>`,
  puzzle: `<path class="c" d="M18 24h20c0-12 18-12 18 0h20v20c12 0 12 18 0 18v20H56c0-12-18-12-18 0H18V62c12 0 12-18 0-18z" stroke-dasharray="6 6"/>`,
  laptopI: `<rect class="c" x="18" y="20" width="64" height="44" rx="3"/><path class="k" d="M8 70h84l-6 10H14z"/>`,
  chat: `<path class="c" d="M10 16h56v38H32L18 66V54h-8z"/><path class="y" d="M42 44h48v34h-8v10L70 78H42z"/>`,
  city: `<path class="ht" d="M8 88V44h18v44M30 88V24h20v64M56 88V38h16v50M76 88V52h16v36"/><path d="M4 88h92"/><circle class="y" cx="80" cy="22" r="10"/>`,
  phone: `<rect class="c" x="30" y="8" width="40" height="84" rx="7"/><path d="M42 16h16"/><rect class="y" x="38" y="26" width="24" height="40"/>`,
  door: `<rect class="c" x="26" y="10" width="48" height="80"/><circle class="k" cx="64" cy="52" r="4"/><path d="M34 22h32"/>`,
  smart: `<rect class="c" x="22" y="22" width="56" height="56" rx="4"/><rect class="y" x="36" y="36" width="28" height="28"/><path d="M34 22V8M50 22V8M66 22V8M34 92V78M50 92V78M66 92V78M22 34H8M22 50H8M22 66H8M92 34H78M92 50H78M92 66H78"/>`,
};
const icon = (name, size = 100, extra = "") =>
  `<svg class="ink" viewBox="0 0 100 100" width="${size}" height="${size}" style="overflow:visible;${extra}">${ICONS[name]}</svg>`;

// --------------------------------------------------------- illustrations --
function svgWoman() {
  return `<svg class="ink" viewBox="0 0 300 560" width="100%" height="100%" style="overflow:visible">
  <circle class="k" cx="172" cy="62" r="30"/>
  <path class="c" d="M138 146h26v30h-26z"/>
  <path class="ht" d="M86 182c18-14 110-14 128 0l26 232H60z"/>
  <path class="c" d="M98 414l8 120h40l4-104 4 104h40l8-120z"/>
  <path d="M100 534h-14M200 534h14"/>
  <path class="y" d="M208 178c-34 64-80 128-108 222l26 8c26-84 70-150 100-206z"/>
  <path d="M92 190c-22 60-20 120-6 170" stroke-width="16"/>
  <path d="M92 190c-22 60-20 120-6 170" stroke="#efe6d3" stroke-width="8"/>
  <path d="M206 190c30 40 26 80 -6 96" stroke-width="16"/>
  <path d="M206 190c30 40 26 80 -6 96" stroke="#efe6d3" stroke-width="8"/>
  <circle class="c" cx="196" cy="290" r="11"/>
  <ellipse class="c" cx="150" cy="104" rx="42" ry="50"/>
  <path class="k" d="M106 102c-4-56 84-62 88-2-16-22-52-30-88 2z"/>
  <path d="M132 104q6-4 12 0M160 104q6-4 12 0M140 128q12 8 22 0" stroke-width="3.5"/>
  <circle class="y" cx="152" cy="86" r="4.5" stroke-width="2"/>
  <path d="M120 300l110 0" stroke="none"/>
  </svg>`;
}

function svgPeople(n = 5, seed = 3) {
  const r = rng(seed), fills = ["ht", "c", "y", "ht", "k", "c", "ht"];
  let g = "";
  for (let i = 0; i < n; i++) {
    const x = 60 + (i * 380) / (n - 1), s = 0.85 + r() * 0.3, y = 300;
    const f = fills[(i + seed) % fills.length];
    g += `<g transform="translate(${x} ${y}) scale(${s})">
      <path class="${f}" d="M-46 0c0-62 20-96 46-96s46 34 46 96z"/>
      <circle class="c" cx="0" cy="-128" r="28"/>
      ${f === "k" ? "" : `<path class="k" d="M-28 -132c0-26 56-26 56 0-14-10-42-10-56 0z"/>`}
    </g>`;
  }
  return `<svg class="ink" viewBox="0 0 500 300" width="100%" height="100%" style="overflow:visible">${g}</svg>`;
}

function svgSkyline() {
  const r = rng(77);
  let back = "", front = "";
  for (let x = -20; x < 1940;) {
    const w = 60 + r() * 110, h = 140 + r() * 280;
    back += `<rect class="${r() < 0.5 ? "htl" : "ht"}" x="${x}" y="${520 - h}" width="${w}" height="${h}" style="fill:url(#${r() < 0.5 ? "htl" : "ht"})"/>`;
    x += w + 4;
  }
  for (let x = -20; x < 1940;) {
    const w = 80 + r() * 130, h = 80 + r() * 200;
    front += `<rect class="c" x="${x}" y="${520 - h}" width="${w}" height="${h}"/>`;
    for (let wy = 520 - h + 18; wy < 500; wy += 30)
      for (let wx = x + 14; wx < x + w - 18; wx += 26)
        front += r() < 0.6 ? `<rect class="${r() < 0.15 ? "y" : "k"}" x="${wx}" y="${wy}" width="10" height="14" style="stroke:none"/>` : "";
    x += w + 10;
  }
  const dome = `<g transform="translate(1180 230)"><path class="c" d="M-90 290V90h180v200z"/><path class="ht" d="M-70 90c0-90 140-90 140 0z" style="fill:url(#ht2)"/>
    <path d="M0 14v-40"/><path class="y" d="M0 -26l22 8-22 8z"/>${[-60, -30, 0, 30, 60].map((cx) => `<path d="M${cx} 120v150"/>`).join("")}</g>`;
  const tower = `<g transform="translate(560 150)"><path class="c" d="M-36 370V40h72v330z"/><circle class="y" cx="0" cy="84" r="22"/><path d="M0 84v-14M0 84l10 6"/><path class="ht" d="M-44 40L0 -40 44 40z"/></g>`;
  return `<svg class="ink" viewBox="0 0 1920 520" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" style="overflow:visible">
    <g style="stroke-width:3">${back}</g>${tower}${dome}<g style="stroke-width:3.5">${front}</g><rect class="k" x="-40" y="508" width="2000" height="40"/></svg>`;
}

function svgMeeting() {
  let g = "";
  const fills = ["ht", "c", "ht", "k", "c"];
  [140, 300, 450, 600, 760].forEach((x, i) => {
    g += `<g transform="translate(${x} 200)"><path class="${fills[i]}" d="M-60 40c0-70 26-100 60-100s60 30 60 100z"/><circle class="c" cx="0" cy="-92" r="32"/>
      <path class="k" d="M-32 -96c0-30 64-30 64 0-16-12-48-12-64 0z"/></g>`;
  });
  return `<svg class="ink" viewBox="0 0 900 340" width="100%" height="100%" style="overflow:visible">${g}
    <path class="c" d="M30 210h840l-40 110H70z"/><path class="ht" d="M70 320h760l-10 14H80z"/>
    <rect class="w" x="150" y="226" width="90" height="56" transform="rotate(-6 195 254)"/><rect class="y" x="400" y="230" width="100" height="46"/>
    <rect class="w" x="640" y="226" width="96" height="58" transform="rotate(5 688 255)"/><path d="M420 244h60M420 258h40" stroke-width="3"/></svg>`;
}

function svgMunicipal() {
  const cols = [70, 140, 210, 350, 420, 490].map((x) => `<rect class="c" x="${x - 14}" y="250" width="28" height="190"/>`).join("");
  return `<svg class="ink" viewBox="0 0 560 520" width="100%" height="100%" style="overflow:visible">
    <path class="ht" d="M10 500h540v-24H10z"/><path class="c" d="M30 476h500v-36H30z"/>
    <path class="c" d="M40 440V250h480v190z"/>${cols}
    <path class="c" d="M232 440V300c0-36 96-36 96 0v140z"/><path d="M280 300v140"/>
    <path class="c" d="M24 250L280 120l256 130z"/><circle class="y" cx="280" cy="200" r="28"/><path d="M280 200v-16M280 200l12 8"/>
    <path class="ht" d="M200 120c0-110 160-110 160 0z" style="fill:url(#ht2)"/><path d="M280 14v-40"/><path class="y" d="M280 -26l40 14-40 14z"/>
    </svg>`;
}

// ------------------------------------------------------------- textures --
const BOARD = noiseURL(360, 11, (r) => { const v = r(); return v < 0.5 ? [10, 20, 30, 18 * r()] : [255, 255, 255, 14 * r()]; });
const PAPER = noiseURL(260, 23, (r) => { const v = r(); return v < 0.97 ? [120, 95, 60, 16 * r()] : [60, 45, 30, 60 * r()]; });
document.head.insertAdjacentHTML("beforeend", `<style>
  .scene { background-image: radial-gradient(ellipse at 50% 45%, rgba(255,255,255,.06), rgba(0,0,0,.22) 85%), url(${BOARD}); }
  .sheet { background-image: url(${PAPER}), linear-gradient(160deg, rgba(255,255,255,.18), rgba(120,90,40,.10)); }
</style>`);

// ---------------------------------------------------------------- scene --
const SFX = [];      // {t, name, gain, pan}
let ITEM_ID = 0;

class Scene {
  constructor(slide, opts = {}) {
    this.n = slide.n;
    this.start = slide.start;
    this.end = slide.end;
    this.vo = slide.vo;
    this.cues = slide.cues || {};
    this.items = [];
    this.camKeys = [];
    this.seed = 1000 + this.n * 37;
    this.el = document.createElement("div");
    this.el.className = "scene";
    this.cam = document.createElement("div");
    this.cam.className = "cam";
    this.shade = document.createElement("div");
    this.shade.style.cssText = "position:absolute;inset:0;background:#0b1520;opacity:0;z-index:30";
    this.el.append(this.cam, this.shade);
    document.getElementById("scenes").appendChild(this.el);
    this.trans = opts.trans || "slide";
    this.boardDeco();
  }

  T(spec) {
    if (typeof spec === "number") return spec;
    const m = /^([a-z0-9]+)((?:[+-][0-9.]+)*)$/i.exec(spec);
    if (!m) throw new Error("bad time " + spec);
    const base = m[1] === "vo" ? this.vo : this.cues[m[1]];
    if (base === undefined) throw new Error(`slide ${this.n}: no cue ${m[1]}`);
    return base + (m[2].match(/[+-][0-9.]+/g) || []).reduce((a, x) => a + parseFloat(x), 0);
  }

  // faint scraps of newsprint and pencil marks around the board edge
  boardDeco() {
    const r = rng(this.seed);
    const spots = [[-110, 170], [2040, 260], [-90, 900], [2030, 860], [300, -90], [1600, 1150]];
    for (let i = 0; i < 3; i++) {
      const [x, y] = spots[(i * 2 + this.n) % spots.length];
      const w = 300 + r() * 220, h = 220 + r() * 200;
      this.add({ x, y, w, h, r: (r() - 0.5) * 16, at: 0, anim: "none", z: -5, boil: false,
        html: `<div class="sheet" style="clip-path:${torn(this.seed + i, w, h, 10, 12)};opacity:.9"><div class="news" style="column-count:2">${newsText(this.seed + i, 140)}</div></div>` });
    }
    const doodles = [
      `<path d="M10 40c40-30 90-30 130-8" /><path d="M126 18l14 14-18 6"/>`,
      `<ellipse cx="40" cy="30" rx="34" ry="22"/><path d="M80 30h40"/>`,
      `<path d="M10 10l100 40M100 30l10 20-22 2"/>`,
    ];
    for (let i = 0; i < 2; i++) {
      const pos = [[180, 960], [1760, 120], [1740, 960], [150, 110]][(this.n + i * 3) % 4];
      this.add({ x: pos[0], y: pos[1], w: 150, h: 70, r: (r() - 0.5) * 30, at: 0, anim: "none", z: -4,
        html: `<svg class="svgfull" viewBox="0 0 150 70" style="opacity:.55"><g fill="none" stroke="#22313f" stroke-width="2.2" stroke-linecap="round">${doodles[(this.n + i) % 3]}</g></svg>` });
    }
  }

  add(o) {
    const d = document.createElement("div");
    d.className = "it " + (o.cls || "");
    d.style.left = o.x + "px";
    d.style.top = o.y + "px";
    if (o.w) d.style.width = o.w + "px";
    if (o.h) d.style.height = o.h + "px";
    d.style.zIndex = o.z || 0;
    d.innerHTML = `<div class="inner">${o.html || ""}</div>`;
    this.cam.appendChild(d);
    const it = {
      id: ++ITEM_ID, el: d, x: o.x, y: o.y, r: o.r || 0, anim: o.anim || "drop",
      at: this.T(o.at === undefined ? 0.2 : o.at), dur: o.dur, out: o.out !== undefined ? this.T(o.out) : null,
      boil: o.boil !== false, hl: o.hl !== undefined ? this.T(o.hl) : null, hlCls: o.hlCls || "hl-y",
      pulses: (o.pulses || []).map((p) => this.T(p)), sfx: o.sfx, gain: o.gain, cps: o.cps || 22,
      from: o.from, to: o.to, fmt: o.fmt, target: o.target, letters: null, stagger: o.stagger || 0.045,
      float: o.float || 0, moveFrom: o.moveFrom, moveDur: o.moveDur || 0.6,
    };
    it.dur = it.dur || { drop: 0.5, pop: 0.38, slideL: 0.55, slideR: 0.55, slideU: 0.6, slideD: 0.55, tape: 0.25,
      stamp: 0.2, fade: 0.4, wipe: 0.6, draw: 0.7, type: 1, count: 1.6, grow: 0.9, flip: 0.5, none: 0.01, letters: 0.3 }[it.anim];
    if (it.anim === "type") {
      it.typed = d.querySelector(".typed");
      it.text = it.typed.dataset.text;
      it.dur = it.text.length / it.cps;
    }
    if (it.anim === "count") it.num = d.querySelector(".num");
    if (it.anim === "grow") it.bar = d.querySelector(".bar");
    if (it.anim === "draw") it.paths = [...d.querySelectorAll("path,ellipse,circle,line,polyline")];
    if (it.anim === "letters") it.letters = [...d.querySelectorAll(".L")];
    if (it.anim === "flip") { it.front = d.querySelector(".front"); it.back = d.querySelector(".back"); it.flipAt = this.T(o.flipAt); }
    this.items.push(it);
    this.sfxFor(it, o);
    return it;
  }

  sfxFor(it, o) {
    const S = (name, t, gain, pan = (it.x - 960) / 960 * 0.45) => SFX.push({ t: this.start + t, name, gain, pan, slide: this.n });
    if (o.click !== undefined) S("click", this.T(o.click), 0.55);
    if (o.ding !== undefined) S("ding", this.T(o.ding), 0.4);
    if (o.sfx === null) return;
    if (typeof o.sfx === "string") { S(o.sfx, it.at, o.gain || 0.5); return; }
    const alt = it.id % 2 ? "a" : "b";
    switch (it.anim) {
      case "drop": S("slap_" + alt, it.at + 0.12, it.gain || 0.5); break;
      case "pop": S(o.chip ? "flick" : "pop", it.at, it.gain || (o.chip ? 0.55 : 0.3)); break;
      case "slideL": case "slideR": case "slideU": case "slideD": S("whoosh_b", it.at - 0.05, it.gain || 0.3); S("slap_" + alt, it.at + 0.4, 0.3); break;
      case "tape": S("tape_" + alt, it.at - 0.05, it.gain || 0.42); break;
      case "stamp": S("stamp", it.at + 0.12, it.gain || 0.7); break;
      case "type": S("type", it.at, it.gain || 0.3); SFX[SFX.length - 1].dur = it.dur; break;
      case "count": S("tick", it.at, it.gain || 0.32); SFX[SFX.length - 1].dur = it.dur; break;
      case "draw": if (o.marker) { S("marker", it.at, it.gain || 0.45); SFX[SFX.length - 1].dur = it.dur + 0.15; } break;
      case "letters": it.letters.forEach((_, i) => { if (i % 2 === 0) S("flick", it.at + i * it.stagger, 0.3); }); break;
      case "flip": S("slap_" + alt, it.at + 0.12, 0.45); S("swell", it.flipAt - 0.5, 0.5); S("whoosh_b", it.flipAt, 0.35); break;
      case "wipe": if (o.write) S("marker", it.at, 0.18); break;
    }
  }

  // ------------------------------------------------------- builders --
  paper(o) {
    const w = o.w, h = o.h, seed = o.seed || this.seed + ITEM_ID * 7;
    const tapes = (o.tapes || []).map(([dx, dy, tw, tr]) =>
      `<div style="position:absolute;left:${w / 2 + dx - tw / 2}px;top:${h / 2 + dy - 17}px;width:${tw}px;height:34px;transform:rotate(${tr}deg)">
        <div class="tape" style="clip-path:${torn(seed + dx, tw, 34, 4, 6, "lr")}"></div></div>`).join("");
    const html = `<div class="sheet ${o.white ? "white" : ""}" style="clip-path:${torn(seed, w, h, o.amp || 6, 13, o.edges || "trbl")};${o.bg ? "background-color:" + o.bg : ""}">
      ${o.news ? `<div class="news" style="column-count:${Math.max(1, Math.round(w / 260))}">${newsText(seed, Math.round((w * h) / 900))}</div>` : ""}</div>
      ${o.html || ""}${tapes}`;
    return this.add({ ...o, cls: "shadow " + (o.cls || ""), html });
  }

  chip(text, o = {}) {
    const size = o.size || 38, bgs = { cream: "var(--cream)", yellow: "var(--yellow)", ink: "var(--ink)", white: "var(--white)" };
    const bg = bgs[o.bg || "cream"], col = o.bg === "ink" ? "var(--white)" : "var(--ink)";
    const estW = text.length * size * 0.75 + 40, estH = size * 1.5;
    const html = `<div class="sheet" style="clip-path:${torn(this.seed + ITEM_ID * 13, estW, estH, 3, 9)};background-color:${bg}"></div>
      <div style="position:relative;padding:${size * 0.22}px ${size * 0.42}px ${size * 0.18}px;font:${o.font || `400 ${size}px 'Archivo Black'`};color:${col};white-space:nowrap;text-transform:uppercase;letter-spacing:${o.ls ?? 0.5}px;line-height:1.1;text-align:center">${text}</div>`;
    return this.add({ anim: "pop", ...o, chip: true, cls: "shadow " + (o.cls || ""), html });
  }

  ransom(text, o = {}) {
    const r = rng(o.seed || this.seed + text.length * 31 + ITEM_ID);
    const size = o.size || 80;
    const fonts = [["Anton", 400, 1], ["Archivo Black", 400, 0.92], ["Abril Fatface", 400, 1], ["Playfair Display", 900, 1],
      ["Alfa Slab One", 400, 0.92], ["Bebas Neue", 400, 1.12], ["Oswald", 700, 1], ["Rubik Mono One", 400, 0.78], ["Special Elite", 400, 1]];
    let html = "";
    for (const ch of text) {
      if (ch === " ") { html += `<span style="display:inline-block;width:${size * 0.32}px"></span>`; continue; }
      if (ch === "|") { html += `<br>`; continue; }
      const [f, wt, sc] = fonts[(r() * fonts.length) | 0];
      const v = r();
      const [bg, fg] = v < 0.38 ? ["var(--cream)", "var(--ink)"] : v < 0.62 ? ["var(--white)", "var(--ink)"] :
        v < 0.8 ? ["var(--ink)", "var(--white)"] : v < 0.92 ? ["#d6cfbf", "var(--ink)"] : ["var(--yellow)", "var(--ink)"];
      const fs = size * sc * (0.86 + r() * 0.24);
      const rot = (r() - 0.5) * 9, dy = (r() - 0.5) * size * 0.1;
      html += `<span class="L" data-r="${rot.toFixed(2)}" data-dy="${dy.toFixed(1)}" style="display:inline-block;position:relative;margin:0 ${size * 0.025}px;vertical-align:middle">
        <span style="position:absolute;inset:0;background:${bg};clip-path:${torn(r() * 1e6, 60, 80, 3, 8)}"></span>
        <span style="position:relative;display:block;padding:${size * 0.1}px ${size * 0.1}px ${size * 0.06}px;font:${wt} ${fs.toFixed(1)}px/${1} '${f}';color:${fg}">${esc(ch)}</span></span>`;
    }
    return this.add({ anim: "letters", ...o, cls: "shadow " + (o.cls || ""), html: `<div style="white-space:nowrap;text-align:center;line-height:1.25">${html}</div>` });
  }

  tape(o) {
    const w = o.w || 140, h = o.h || 36;
    return this.add({ anim: "tape", ...o, w, h, cls: o.yellow ? "" : "", boil: o.boil ?? true,
      html: `<div class="${o.yellow ? "ytape" : "tape"}" style="clip-path:${torn(this.seed + ITEM_ID * 3, w, h, o.yellow ? 3 : 5, 7, "lr")}"></div>` });
  }

  circle(o) {
    const w = o.w, h = o.h, sw = o.sw || 9;
    const d = `M${w * 0.12} ${h * 0.3} C ${w * 0.3} ${-h * 0.04}, ${w * 0.95} ${-h * 0.02}, ${w * 0.98} ${h * 0.48} S ${w * 0.45} ${h * 1.06}, ${w * 0.08} ${h * 0.7} S ${w * 0.25} ${h * 0.02}, ${w * 0.62} ${h * 0.06}`;
    return this.add({ anim: "draw", dur: 0.75, marker: true, ...o, boil: true,
      html: `<svg class="svgfull" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${o.color || "#efc031"}" stroke-width="${sw}" stroke-linecap="round"/></svg>` });
  }

  cross(o) {
    const w = o.w, h = o.h;
    return this.add({ anim: "draw", dur: 0.5, marker: true, ...o,
      html: `<svg class="svgfull" viewBox="0 0 ${w} ${h}"><path d="M8 ${h * 0.12} L${w - 8} ${h * 0.9} M${w - 10} ${h * 0.08} L 10 ${h * 0.92}" fill="none" stroke="#efc031" stroke-width="${o.sw || 12}" stroke-linecap="round"/></svg>` });
  }

  pencil(o) {   // a hand-drawn line / arrow in pencil, drawn on (dashed lines wipe on)
    return this.add({ anim: o.dash ? "wipe" : "draw", dur: o.dur || 0.8, ...o,
      html: `<svg class="svgfull" viewBox="0 0 ${o.w} ${o.h}" style="overflow:visible"><g fill="none" stroke="${o.color || "#1c2733"}" stroke-width="${o.sw || 3.5}" stroke-linecap="round" stroke-linejoin="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ""}>${o.d}</g></svg>` });
  }

  note(text, o = {}) {
    return this.add({ anim: "wipe", dur: 0.25 + text.length * 0.035, write: true, ...o,
      html: `<div class="hand" style="font-size:${o.size || 40}px;color:${o.color || "var(--pencil)"}">${text}</div>` });
  }

  stamp(text, o = {}) {
    const c = o.color || "var(--ink)";
    return this.add({ anim: "stamp", ...o,
      html: `<div style="border:5px solid ${c};color:${c};padding:6px 18px 4px;font:400 ${o.size || 44}px 'Rubik Mono One';letter-spacing:2px;white-space:nowrap;opacity:.88;mix-blend-mode:multiply;${o.fill ? "background:" + o.fill : ""}">${text}</div>` });
  }

  card(o) {   // paper card with an icon and a label under it
    const w = o.w || 280, h = o.h || 300, s = o.size || 150;
    const html = `<div style="position:absolute;left:0;right:0;top:${o.iconTop ?? 26}px;display:flex;justify-content:center">${icon(o.icon, s)}</div>
      ${o.label ? `<div style="position:absolute;left:10px;right:10px;bottom:${o.labelBottom ?? 22}px;text-align:center;font:400 ${o.ls || 30}px/1.08 'Archivo Black';text-transform:uppercase;color:var(--ink)">${o.label}</div>` : ""}
      ${o.num ? `<div style="position:absolute;left:-18px;top:-22px;width:58px;height:58px;background:var(--yellow);display:flex;align-items:center;justify-content:center;font:400 30px Anton;transform:rotate(-6deg);clip-path:${torn(o.num * 99, 58, 58, 3, 8)}">${o.num}</div>` : ""}`;
    return this.paper({ ...o, w, h, html: html + (o.html || ""), tapes: o.tapes ?? [[0, -h / 2 + 4, 110, (o.r || 0) * -2 + 3]] });
  }

  typed(text, o = {}) {   // typewriter text that types on, left-anchored in a fixed box
    return this.add({ anim: "type", w: o.wrap || o.w || 440, ...o,
      html: `<div class="${o.font ? "" : "type"}" style="font:${o.font || `400 ${o.size || 30}px 'Special Elite'`};color:var(--ink);white-space:${o.wrap ? "normal" : "nowrap"};${o.wrap ? `width:${o.wrap}px` : ""};line-height:1.3"><span class="typed" data-text="${esc(text)}"></span><span class="caret">▍</span></div>` });
  }

  camAt(t, s, x, y, dur = 1.2) { this.camKeys.push({ t: this.T(t), s, x, y, dur }); }

  // --------------------------------------------------------- render --
  render(lt) {
    const dur = this.end - this.start;
    // camera: slow push over the slide plus keyed moves
    let s = 1, fx = 960, fy = 540;
    for (const k of this.camKeys) {
      const p = E.inout(clamp((lt - k.t) / k.dur));
      s = lerp(s, k.s, p); fx = lerp(fx, k.x, p); fy = lerp(fy, k.y, p);
    }
    s *= 1 + 0.028 * clamp(lt / Math.max(dur, 1));
    this.cam.style.transform = `translate(960px,540px) scale(${s.toFixed(4)}) translate(${-fx.toFixed(1)}px,${-fy.toFixed(1)}px)`;
    const step = Math.floor((this.start + lt) * 8);   // stop-motion "boil" at 8 fps
    for (const it of this.items) renderItem(it, lt, step);
  }
}

function renderItem(it, lt, step) {
  const el = it.el;
  if (lt < it.at) { el.style.visibility = "hidden"; return; }
  el.style.visibility = "visible";
  const p = clamp((lt - it.at) / it.dur);
  let tx = 0, ty = 0, rot = it.r, sc = 1, op = 1, clip = "";
  switch (it.anim) {
    case "drop": sc = 1.16 - 0.16 * E.back(p); rot += 6 * (1 - E.out(p)); ty = -36 * (1 - E.out(p)); op = clamp(p * 5); break;
    case "pop": sc = 0.3 + 0.7 * E.back(p); op = clamp(p * 4); break;
    case "slideL": tx = -260 * (1 - E.out(p)); rot -= 4 * (1 - p); op = clamp(p * 3); break;
    case "slideR": tx = 260 * (1 - E.out(p)); rot += 4 * (1 - p); op = clamp(p * 3); break;
    case "slideU": ty = 300 * (1 - E.out(p)); op = clamp(p * 3); break;
    case "slideD": ty = -260 * (1 - E.out(p)); op = clamp(p * 3); break;
    case "tape": case "wipe": clip = `inset(-20% ${((1 - E.out(p)) * 100).toFixed(2)}% -20% -2%)`; break;
    case "stamp": {
      sc = p < 1 ? 1.9 - 0.9 * E.in(p) : 1; op = clamp(p * 3);
      const k = clamp((lt - it.at - it.dur) / 0.18);
      if (k > 0 && k < 1) { tx = Math.sin(k * 40) * 4 * (1 - k); ty = Math.cos(k * 33) * 3 * (1 - k); }
      break;
    }
    case "fade": op = E.inout(p); break;
    case "draw":
      for (const pa of it.paths) {
        if (!pa._len) { pa._len = pa.getTotalLength ? pa.getTotalLength() : 1000; pa.style.strokeDasharray = pa._len; }
        pa.style.strokeDashoffset = (pa._len * (1 - E.inout(p))).toFixed(1);
      }
      break;
    case "type": {
      const n = Math.floor(clamp((lt - it.at) * it.cps, 0, it.text.length));
      if (it._n !== n) { it.typed.textContent = it.text.slice(0, n); it._n = n; }
      const caret = el.querySelector(".caret");
      caret.style.opacity = n < it.text.length || Math.floor(lt * 2.5) % 2 === 0 ? 1 : 0;
      break;
    }
    case "count": {
      const v = Math.round(lerp(it.from, it.to, E.out(p)));
      it.num.textContent = it.fmt ? it.fmt(v) : v;
      break;
    }
    case "grow": it.bar.style.width = (it.target * E.out(p)).toFixed(2) + "%"; break;
    case "flip": {
      sc = 1.16 - 0.16 * E.back(p); ty = -36 * (1 - E.out(p)); op = clamp(p * 5);
      const q = clamp((lt - it.flipAt) / 0.5);
      const front = q >= 0.5;
      it.front.style.display = front ? "block" : "none";
      it.back.style.display = front ? "none" : "block";
      el._sx = Math.max(0.02, Math.abs(Math.cos(q * Math.PI)));
      if (q > 0 && q < 1) sc *= 1 + 0.12 * Math.sin(q * Math.PI);
      break;
    }
    case "letters":
      it.letters.forEach((L, i) => {
        const lp = clamp((lt - it.at - i * it.stagger) / 0.24);
        L.style.opacity = lp > 0 ? 1 : 0;
        L.style.transform = `translateY(${L.dataset.dy}px) rotate(${(+L.dataset.r + (1 - lp) * 18).toFixed(2)}deg) scale(${(0.2 + 0.8 * E.back(lp)).toFixed(3)})`;
      });
      break;
  }
  if (it.hl !== null && lt >= it.hl) {
    el.classList.add(it.hlCls);
    const hp = clamp((lt - it.hl) / 0.45);
    sc *= 1 + 0.12 * Math.sin(hp * Math.PI);
  } else if (it.hl !== null) el.classList.remove(it.hlCls);
  for (const pt of it.pulses) {
    const hp = (lt - pt) / 0.45;
    if (hp > 0 && hp < 1) sc *= 1 + 0.1 * Math.sin(hp * Math.PI);
  }
  if (it.out !== null && lt >= it.out) {
    const q = clamp((lt - it.out) / 0.35);
    op *= 1 - q; sc *= 1 - 0.06 * q; ty -= 20 * q;
  }
  if (it.boil && p >= 1) {
    const r = rng(it.id * 7919 + step);
    rot += (r() - 0.5) * 0.45; tx += (r() - 0.5) * 1.3; ty += (r() - 0.5) * 1.3;
  }
  if (it.float) ty += Math.sin(lt * 1.3 + it.id) * it.float;
  if (it.moveFrom) { const q = 1 - E.inout(clamp((lt - it.at) / it.moveDur)); tx += it.moveFrom[0] * q; ty += it.moveFrom[1] * q; }
  const sx = el._sx !== undefined ? el._sx : 1;
  el.style.transform = `translate(-50%,-50%) translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${(sc * sx).toFixed(4)},${sc.toFixed(4)})`;
  el.style.opacity = op.toFixed(3);
  if (clip !== it._clip) { el.style.clipPath = clip; it._clip = clip; }
}

// =============================================================== SCENES ==
const SL = Object.fromEntries(TL.slides.map((s) => [s.n, s]));
const SCENES = [];
const BUILD = {};

// small UI helpers (printed screenshots)
const uiHead = (title, extra = "") => `<div class="ui-head"><span class="dots"><i></i><i></i><i></i></span><span>${title}</span>${extra}</div>`;
const field = (x, y, w, label, inner) => `<div class="field" style="left:${x}px;top:${y}px;width:${w}px"><small>${label}</small>${inner}</div>`;

// ---- 1: title
BUILD[1] = (S) => {
  S.paper({ x: 960, y: 520, w: 1240, h: 660, r: -1.5, news: true, at: 0, seed: 5, tapes: [[-560, -300, 160, -32], [560, -300, 160, 30], [-560, 300, 150, 28], [560, 300, 150, -30]] });
  S.paper({ x: 640, y: 420, w: 540, h: 380, r: 4, white: true, at: 0.12, z: 1, html: "" , sfx: null, anim: "fade", dur: 0.2 });
  S.chip("PRAJA", { x: 960, y: 230, bg: "ink", size: 56, at: 0.25, anim: "stamp", z: 4, ls: 10 });
  S.ransom("THE CITIZEN'S", { x: 960, y: 375, size: 96, at: 0.45, z: 5 });
  S.ransom("JOURNEY", { x: 960, y: 520, size: 140, at: 0.95, z: 5, stagger: 0.06 });
  S.tape({ x: 960, y: 625, w: 820, h: 26, r: -1, yellow: true, at: 1.35, z: 4 });
  S.chip("Ek jagruk nagrik ka safar", { x: 960, y: 700, size: 40, at: "vo-0.05", z: 6, r: -1 });
  S.chip("VIDEO 03", { x: 1440, y: 790, size: 30, at: 1.9, r: 3, bg: "white", z: 6 });
  S.circle({ x: 1440, y: 790, w: 300, h: 130, at: 2.2, z: 7 });
  S.note("Praja / notes - citizen participation", { x: 560, y: 800, r: -4, size: 34, at: 2.0, z: 6 });
  S.add({ x: 1560, y: 250, w: 200, h: 200, at: 1.6, anim: "pop", r: 8, z: 6, html: `<div style="width:220px;height:220px">${icon("people", 220)}</div>`, cls: "shadow" });
};

// ---- 2: what does participation look like?
BUILD[2] = (S) => {
  S.chip("WHAT DOES MEANINGFUL", { x: 720, y: 160, size: 50, at: 0.15, r: -2 });
  S.chip("CITIZEN PARTICIPATION", { x: 960, y: 262, size: 74, at: 0.4, r: 0.5, bg: "yellow", z: 2 });
  S.chip("LOOK LIKE?", { x: 1380, y: 362, size: 52, at: 0.65, r: 2.5 });
  const cards = [["ballot", "VOTE", "vote", 360], ["rupee", "PAY TAX", "tax", 760], ["megaphone", "COMPLAINT", "complaint", 1160], ["people", "AREA SABHA", "consult", 1560]];
  cards.forEach(([ic, lab, cue, x], i) => S.card({ x, y: 640, w: 300, h: 320, icon: ic, label: lab, at: cue + "-0.1", r: [-3, 2, -2, 3][i], size: 170, news: false }));
  S.note("...bas itna?", { x: 1640, y: 860, r: -6, size: 46, at: "consult+1.4" });
  S.circle({ x: 1560, y: 640, w: 380, h: 400, at: "consult+0.9", z: 3, sw: 8 });
};

// ---- 3: true participation, a continuous journey
BUILD[3] = (S) => {
  S.chip("TRUE", { x: 390, y: 165, size: 56, at: 0.1, bg: "ink", r: -4, z: 2 });
  S.ransom("CITIZEN PARTICIPATION", { x: 1130, y: 170, size: 64, at: 0.25, stagger: 0.035 });
  S.pencil({ x: 960, y: 600, w: 1500, h: 260, at: "journey", dur: 2.2, dash: "14 12", sw: 5,
    d: `<path d="M20 150 C 220 20, 420 260, 620 140 S 1000 20, 1180 150 S 1400 250, 1480 110"/><path d="M1452 96l30 14-22 26"/>` });
  const st = [["speech", "SHARE<br>NEEDS", "needs", 330, 600], ["hand", "TAKE PART IN<br>DECISIONS", "decide", 760, 520], ["track", "TRACK<br>PROGRESS", "track", 1170, 640], ["scales", "HOLD CITY GOVT<br>ACCOUNTABLE", "account", 1590, 540]];
  st.forEach(([ic, lab, cue, x, y], i) => S.card({ x, y, w: 320, h: 330, icon: ic, label: lab, ls: 27, at: cue + "-0.15", num: i + 1, r: [-2, 3, -3, 2][i], size: 150 }));
  S.circle({ x: 1590, y: 540, w: 400, h: 410, at: "account+0.9", z: 3 });
  S.note("ek lagaataar safar", { x: 1500, y: 860, r: -3, size: 44, at: "journey+0.6" });
};

// ---- 4: digital platforms... but the missing piece
BUILD[4] = (S) => {
  const laptop = `<div style="position:absolute;left:30px;top:0;width:380px;height:250px;border:9px solid var(--ink);border-radius:10px;background:var(--white);overflow:hidden">
      ${uiHead("CITY TAX")}<div class="btn y" style="left:40px;top:110px;width:280px;height:70px">PAY PROPERTY TAX ₹</div></div>
      <div style="position:absolute;left:0;top:250px;width:440px;height:28px;background:var(--ink);clip-path:polygon(4% 0,96% 0,100% 100%,0 100%)"></div>`;
  const monitor = `<div style="position:absolute;left:0;top:0;width:400px;height:260px;border:10px solid var(--ink);border-radius:8px;background:var(--white);overflow:hidden">
      ${uiHead("LICENCE")}${field(30, 90, 320, "NAME", "Shop no. 12")}<div class="btn" style="left:30px;top:168px;width:220px;height:52px">APPLY</div></div>
      <div style="position:absolute;left:170px;top:260px;width:60px;height:50px;background:var(--ink)"></div><div style="position:absolute;left:110px;top:306px;width:180px;height:16px;background:var(--ink);border-radius:4px"></div>`;
  const phone = `<div style="position:absolute;left:0;top:0;width:200px;height:370px;border:9px solid var(--ink);border-radius:28px;background:var(--white);overflow:hidden">
      <div class="ui-head" style="height:50px;font-size:20px;padding:0 14px">COMPLAINTS</div>
      <div class="btn y" style="left:16px;top:120px;width:150px;height:110px;font-size:22px;text-align:center;line-height:1.1">REGISTER<br>COMPLAINT</div></div>`;
  S.add({ x: 360, y: 430, w: 440, h: 280, at: 0.15, r: -3, html: laptop, cls: "shadow" });
  S.add({ x: 820, y: 410, w: 400, h: 322, at: 0.3, r: 2, html: monitor, cls: "shadow" });
  S.add({ x: 1180, y: 450, w: 200, h: 370, at: 0.45, r: 5, html: phone, cls: "shadow" });
  S.chip("PAYING TAXES", { x: 360, y: 650, size: 32, at: "tax", r: -2, hl: "tax+0.05", hlCls: "x" });
  S.chip("APPLYING FOR<br>LICENCES", { x: 820, y: 680, size: 30, at: "licence", r: 1 });
  S.chip("REGISTERING<br>COMPLAINTS", { x: 1190, y: 720, size: 30, at: "complaint", r: -1 });
  S.card({ x: 1610, y: 450, w: 420, h: 600, icon: "puzzle", size: 170, iconTop: 40, at: "but", r: 2, label: "THE MISSING<br>PIECE", ls: 36, labelBottom: 330 });
  S.typed("How do citizens share their needs BEFORE decisions are made?", { x: 1610, y: 625, h: 170, at: "how", wrap: 340, size: 27, z: 3, cps: 26 });
  S.circle({ x: 1610, y: 450, w: 540, h: 700, at: "voice", z: 4 });
};

// ---- 5 / 11 / 15 / 18: four key commitments
const COMMIT = [
  { w: "LISTEN", icon: "ear", sub: "Listen to citizens' needs", hi: "sunna" },
  { w: "INFORM", icon: "eye", sub: "Transparent, accessible data", hi: "jaankari dena" },
  { w: "RESPOND", icon: "megaphone", sub: "Effective grievance redressal", hi: "jawab dena" },
  { w: "FACILITATE", icon: "tap", sub: "Digital transaction systems", hi: "kaam aasaan banana" },
];
function commitScene(S, k, wordCue, ordCue, meanCue) {
  S.ransom("FOUR KEY COMMITMENTS", { x: 960, y: 150, size: 64, at: 0.15, stagger: 0.03 });
  const xs = [330, 750, 1170, 1590], y = 540, w = 350, h = 430;
  xs.forEach((x, i) => {
    const c = COMMIT[i], r = [-2.5, 1.5, -1.5, 2.5][i];
    const front = `<div class="front" style="position:absolute;inset:0">
        <div class="sheet" style="clip-path:${torn(i * 17 + 3, w, h, 6, 12)}"></div>
        <div style="position:absolute;left:0;right:0;top:46px;display:flex;justify-content:center">${icon(c.icon, 170)}</div>
        <div style="position:absolute;left:0;right:0;top:250px;text-align:center"><span style="position:relative;display:inline-block;padding:4px 16px 0;font:400 ${c.w.length > 7 ? 54 : 66}px/1.1 Anton;letter-spacing:2px;background:var(--yellow)">${c.w}</span></div>
        <div style="position:absolute;left:0;right:0;bottom:34px;text-align:center;font:700 22px 'Courier Prime';letter-spacing:3px">COMMITMENT 0${i + 1}</div></div>`;
    const back = `<div class="back" style="position:absolute;inset:0">
        <div class="sheet" style="clip-path:${torn(i * 17 + 5, w, h, 6, 12)};background-color:#d9d1c0"><div class="news" style="column-count:2;opacity:.8">${newsText(i * 11 + 2, 160)}</div></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span style="font:400 200px 'Abril Fatface';color:var(--ink);background:var(--cream);padding:0 36px;transform:rotate(-4deg)">?</span></div></div>`;
    const num = `<div style="position:absolute;left:-20px;top:-26px;width:76px;height:66px;background:var(--ink);color:var(--white);display:flex;align-items:center;justify-content:center;font:400 38px Anton;transform:rotate(-5deg)">0${i + 1}</div>
      <div style="position:absolute;left:${w / 2 - 60}px;top:-14px;width:120px;height:32px;transform:rotate(${3 - i * 2}deg)"><div class="tape" style="clip-path:${torn(i + 40, 120, 32, 4, 6, "lr")}"></div></div>`;
    const at = ordCue ? `${ordCue}+${(i * 0.12).toFixed(2)}` : 0.45 + i * 0.12;
    if (i < k) {
      S.add({ x, y, w, h, r, at, anim: "drop", cls: "shadow", html: front + num });
      S.stamp("DONE", { x: x + 95, y: y + 165, r: -12, size: 26, at: 0.9 + i * 0.15, gain: 0.4, z: 3, fill: "var(--cream)" });
    } else if (i === k) {
      S.add({ x, y, w, h, r, at, anim: "flip", flipAt: wordCue + "-0.25", cls: "shadow", z: 5, html: front + back + num });
      S.chip(c.sub, { x, y: y + 290, size: 30, at: meanCue, r: -1, z: 6, bg: "white" });
      S.note(`= ${c.hi}`, { x: x + 40, y: y + 350, size: 40, at: meanCue + "+0.5", z: 6, r: -2 });
    } else {
      S.add({ x, y, w, h, r, at, anim: "flip", flipAt: 999, cls: "shadow", html: front + back + num });
    }
  });
  S.camAt(wordCue + "+0.35", 1.1, xs[k] * 0.5 + 960 * 0.5, 590, 1.4);
}
BUILD[5] = (S) => commitScene(S, 0, "listen", "four", "mean");
BUILD[11] = (S) => commitScene(S, 1, "inform", null, "mean");
BUILD[15] = (S) => commitScene(S, 2, "respond", null, "mean");
BUILD[18] = (S) => commitScene(S, 3, "facilitate", null, "mean");

// ---- 6: a woman wants a public garden
BUILD[6] = (S) => {
  S.paper({ x: 600, y: 520, w: 560, h: 720, r: -2, news: true, at: 0.1, tapes: [[0, -350, 150, 4]] });
  S.add({ x: 600, y: 540, w: 300, h: 560, at: "citizen-0.2", anim: "pop", z: 2, cls: "shadow", html: svgWoman() });
  S.chip("CITIZEN", { x: 380, y: 230, size: 40, at: "citizen", bg: "ink", r: -5, z: 3 });
  S.card({ x: 1300, y: 380, w: 620, h: 340, icon: "tree", size: 190, iconTop: 20, at: "garden-0.7", anim: "pop", r: 2, z: 2,
    html: `<div style="position:absolute;left:0;right:0;bottom:22px;text-align:center;font:400 44px/1.25 Anton;letter-spacing:1px">NEED FOR A<br><span style="background:var(--yellow);padding:0 10px">PUBLIC GARDEN</span></div>`, tapes: [[-250, -160, 120, -20], [250, -160, 120, 20]] });
  S.pencil({ x: 930, y: 470, w: 160, h: 120, at: "garden-0.9", dur: 0.5, d: `<path d="M10 100 C 50 70, 90 50, 150 20"/><circle cx="20" cy="96" r="7"/><circle cx="48" cy="78" r="10"/>` });
  const map = `<svg class="svgfull" viewBox="0 0 480 240"><g fill="none" stroke="#161412" stroke-width="5"><path d="M0 80h480M0 170h480M150 0v240M330 0v240"/></g>
    <g fill="url(#htl)" stroke="#161412" stroke-width="3"><rect x="14" y="10" width="120" height="58"/><rect x="170" y="10" width="140" height="58"/><rect x="14" y="96" width="120" height="60"/><rect x="350" y="96" width="116" height="60"/><rect x="170" y="186" width="140" height="44"/></g>
    <rect x="172" y="96" width="140" height="60" fill="none" stroke="#efc031" stroke-width="6" stroke-dasharray="12 8"/><text x="242" y="138" text-anchor="middle" font-family="Anton" font-size="36" fill="#161412">?</text></svg>`;
  S.paper({ x: 1330, y: 760, w: 520, h: 270, r: -2, white: true, at: "woman", z: 1, html: `<div style="position:absolute;inset:16px 20px">${map}</div>` });
  S.note("mohalla", { x: 1050, y: 870, r: -8, size: 44, at: "woman+0.5", z: 3 });
  S.circle({ x: 1330, y: 735, w: 260, h: 130, at: "garden+0.6", z: 3, sw: 7 });
};

// ---- 7: Needs & Wants portal, create a proposal
BUILD[7] = (S) => {
  const ui = `${uiHead("NEEDS &amp; WANTS PORTAL", `<span style="margin-left:auto;font:500 20px Oswald;opacity:.8">CITY OF YOUR WARD</span>`)}
    <div style="position:absolute;left:40px;top:96px;font:400 40px/1.1 Anton">Tell your city what your<br>neighbourhood needs.</div>
    <div class="btn y" style="left:40px;top:220px;width:330px;height:66px">+ CREATE A PROPOSAL</div>
    <div style="position:absolute;left:420px;top:92px;width:600px;height:500px;border-left:3px dashed var(--ink);"></div>`;
  S.paper({ x: 930, y: 500, w: 1120, h: 650, r: -1, white: true, at: 0, anim: "slideU", html: `<div style="position:absolute;inset:14px;overflow:hidden">${ui}</div>`, tapes: [[-520, -310, 130, -25], [520, -310, 130, 25]] });
  S.add({ x: 330, y: 275, w: 60, h: 60, at: "portal-0.3", anim: "none", z: 6, sfx: null, click: "portal+0.35",
    moveFrom: [-260, 300],
    html: `<svg width="60" height="60" viewBox="0 0 30 30" style="overflow:visible"><path d="M4 2l20 12-9 2-4 9z" fill="#f7f3ea" stroke="#161412" stroke-width="2.4" stroke-linejoin="round"/></svg>` });
  const fx = 1000, fy = 410;
  S.typed("Public Garden", { x: fx + 130, y: fy - 40, w: 420, at: "proposal-0.6", font: "700 32px 'Courier Prime'", z: 3, cps: 18 });
  S.add({ x: fx + 130, y: fy - 90, at: "proposal-0.7", anim: "fade", z: 3, sfx: null, html: `<div style="font:500 19px Oswald;letter-spacing:2px;width:420px">PROPOSAL TITLE</div>` });
  S.add({ x: fx + 130, y: fy + 10, at: "proposal-0.7", anim: "fade", z: 3, sfx: null, html: `<div style="width:420px;border-bottom:3px solid var(--ink)"></div>` });
  S.add({ x: fx + 130, y: fy + 60, at: "proposal-0.2", anim: "fade", z: 3, sfx: null, html: `<div style="font:500 19px Oswald;letter-spacing:2px;width:420px">CATEGORY</div>` });
  S.typed("Open Space", { x: fx + 130, y: fy + 100, w: 420, at: "proposal", font: "700 32px 'Courier Prime'", z: 3, cps: 18 });
  S.add({ x: fx + 130, y: fy + 150, at: "proposal-0.2", anim: "fade", z: 3, sfx: null, html: `<div style="font:500 19px Oswald;letter-spacing:2px;width:420px">WHY?</div>` });
  S.typed("A green space for our mohalla - kids, elders, everyone.", { x: fx + 130, y: fy + 220, h: 80, at: "proposal+0.7", font: "400 26px 'Courier Prime'", wrap: 420, z: 3, cps: 30 });
  S.add({ x: fx + 130, y: fy + 330, w: 260, h: 64, at: "submit-0.3", anim: "pop", z: 3, click: "submit+0.2", ding: "submit+0.35", hl: "submit+0.2",
    html: `<div class="btn" style="left:0;top:0;width:260px;height:64px;position:absolute">SUBMIT ✓</div>`, hlCls: "x" });
  S.stamp("SUBMITTED", { x: 640, y: 640, r: -8, size: 40, at: "submit+0.45", z: 7 });
  S.add({ x: 560, y: 600, w: 150, h: 150, at: "proposal+0.3", anim: "pop", r: -6, z: 2, html: icon("tree", 150) });
  S.note("uska vichaar → proposal", { x: 1680, y: 190, r: 6, size: 38, at: "proposal+1.0" });
};

// ---- 8: neighbours support it
BUILD[8] = (S) => {
  const ui = `${uiHead("YOUR PROPOSAL")}
    <div style="position:absolute;left:36px;top:94px;font:400 54px Anton">PUBLIC GARDEN</div>
    <div style="position:absolute;left:36px;top:168px;font:700 22px 'Courier Prime'">Category: Open Space · Ward K-West</div>
    <div style="position:absolute;left:36px;top:226px;padding:4px 12px;border:3px solid var(--ink);font:700 20px Oswald;letter-spacing:2px">OPEN FOR SUPPORT</div>
    <div style="position:absolute;left:36px;top:430px;width:640px;height:26px;border:3px solid var(--ink)"></div>`;
  S.paper({ x: 720, y: 470, w: 760, h: 560, r: -1.5, white: true, at: 0, anim: "drop", html: `<div style="position:absolute;inset:14px;overflow:hidden">${ui}</div>`, tapes: [[0, -270, 150, 3]] });
  S.add({ x: 650, y: 545, at: "support-0.2", anim: "count", from: 0, to: 142, dur: 2.0, z: 3,
    html: `<div style="display:flex;align-items:baseline;gap:16px;width:520px"><span class="num" style="font:400 110px Anton">0</span><span style="font:400 34px 'Archivo Black'">CITIZENS<br>SUPPORT</span></div>` });
  S.add({ x: 710, y: 650, w: 634, h: 20, at: "support-0.2", anim: "grow", target: 100, dur: 2.0, z: 3, sfx: null, boil: false,
    html: `<div style="position:absolute;inset:0;overflow:hidden"><div class="bar"></div></div>` });
  S.add({ x: 1000, y: 330, w: 150, h: 150, at: "support+0.3", anim: "pop", r: 10, z: 4, html: icon("thumbsUp", 150), cls: "shadow" });
  const r = rng(8);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, x = 720 + Math.cos(a) * 470 + (r() - 0.5) * 40, y = 470 + Math.sin(a) * 330 + (r() - 0.5) * 30;
    S.add({ x, y, w: 54, h: 54, at: `support+${(i * 0.12).toFixed(2)}`, anim: "pop", z: 2, sfx: i % 3 ? null : undefined, gain: 0.2,
      html: `<svg viewBox="0 0 54 54" width="54" height="54"><circle cx="27" cy="27" r="25" fill="${["#efe6d3", "#efc031", "#f7f3ea"][i % 3]}" stroke="#161412" stroke-width="3"/><circle cx="27" cy="21" r="8" fill="#161412"/><path d="M12 44c3-10 27-10 30 0" fill="#161412"/></svg>` });
  }
  const notes = [["STREET<br>LIGHTS", 1520, 250, -6], ["WIDER<br>FOOTPATH", 1700, 470, 5], ["CLEAN<br>TOILETS", 1500, 680, 4], ["PLAY<br>AREA", 1720, 800, -5]];
  notes.forEach(([t, x, y, rr], i) => S.paper({ x, y, w: 230, h: 190, r: rr, bg: i % 2 ? "var(--yellow)" : "var(--cream)", at: `needs+${(i * 0.22).toFixed(2)}`, z: 3,
    html: `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font:400 36px/1.05 Anton">${t}</div>`, tapes: [[0, -92, 90, -rr]] }));
  S.note("aur zarooratein bhi", { x: 1420, y: 950 - 60, r: -3, size: 38, at: "needs+1.0" });
};

// ---- 9: officials look at collective needs in the budget meeting
BUILD[9] = (S) => {
  S.chip("LOCAL DEVELOPMENT &amp; BUDGET MEETING", { x: 880, y: 140, size: 46, at: 0.15, bg: "ink", r: -1 });
  const props = [["PUBLIC GARDEN", 142], ["STREETLIGHTS", 96], ["WIDER FOOTPATH", 77], ["PLAY AREA", 64]];
  props.forEach(([t, n], i) => S.paper({ x: 330 + i * 300, y: 330, w: 260, h: 150, r: [-3, 2, -2, 3][i], white: i % 2 === 0, at: `collective+${(i * 0.18).toFixed(2)}`, z: 2,
    html: `<div style="position:absolute;left:18px;top:20px;font:400 26px Anton">${t}</div><div style="position:absolute;left:18px;top:62px;font:400 56px Anton">${n}</div>
      <div style="position:absolute;left:110px;top:88px;font:700 18px 'Courier Prime'">supporters</div>`, tapes: [[0, -72, 80, 4]] }));
  S.add({ x: 760, y: 690, w: 900, h: 340, at: "officials-0.2", anim: "slideU", cls: "shadow", html: svgMeeting() });
  S.chip("CITY OFFICIALS", { x: 300, y: 560, size: 30, at: "officials+0.3", r: -4 });
  const sheet = `<div style="position:absolute;left:28px;top:26px;font:400 34px Anton">WARD BUDGET 2026-27</div>
    ${["Roads", "Water", "Open spaces", "Lighting", "Health"].map((t, i) => `<div style="position:absolute;left:28px;top:${92 + i * 52}px;width:310px;display:flex;justify-content:space-between;font:700 24px 'Courier Prime';border-bottom:2px dotted #161412">
      <span>${t}</span><span>₹ ${[4.2, 3.1, 1.8, 1.2, 0.9][i]} cr</span></div>`).join("")}`;
  S.paper({ x: 1580, y: 560, w: 380, h: 400, r: 3, at: "budget-0.3", z: 2, html: sheet, tapes: [[0, -196, 110, -3]] });
  S.circle({ x: 1560, y: 727, w: 340, h: 70, at: "budget+0.5", z: 3, sw: 7 });
  S.stamp("UNDER CONSIDERATION", { x: 1500, y: 820, r: -7, size: 28, at: "budget+0.9", z: 4 });
  S.pencil({ x: 1240, y: 460, w: 200, h: 120, at: "budget+0.2", dur: 0.6, d: `<path d="M10 20 C 80 10, 150 40, 185 100"/><path d="M160 96l26 8 4-26"/>` });
};

// ---- 10: voice before priorities are set; how do citizens know what next?
BUILD[10] = (S) => {
  const q = "q-0.35";
  S.chip("WHEN DO CITIZENS SPEAK?", { x: 960, y: 170, size: 48, at: 0.15, out: q, r: -1 });
  S.pencil({ x: 960, y: 470, w: 1500, h: 60, at: 0.3, dur: 1.0, out: q, sw: 6, d: `<path d="M10 30 H1480"/><path d="M1456 14l26 16-26 16"/>` });
  const stops = [["NEEDS<br>RAISED", 330], ["PRIORITIES<br>SET", 760], ["DECISION", 1190], ["WORK<br>BEGINS", 1580]];
  stops.forEach(([t, x], i) => {
    S.add({ x, y: 470, w: 36, h: 36, at: 0.5 + i * 0.15, anim: "pop", out: q, gain: 0.25, html: `<div style="width:36px;height:36px;border-radius:50%;background:var(--ink)"></div>` });
    S.chip(t, { x, y: 590, size: 30, at: 0.55 + i * 0.15, out: q, r: [-2, 2, -1, 2][i], sfx: null });
  });
  S.chip("TOO LATE", { x: 1190, y: 340, size: 30, at: "after", bg: "white", out: q, r: 6 });
  S.cross({ x: 1190, y: 340, w: 230, h: 90, at: "after+0.5", out: q, sw: 9 });
  S.card({ x: 760, y: 300, w: 220, h: 200, icon: "speech", size: 120, at: "before-0.1", out: q, anim: "pop", r: -3, label: "", tapes: [] });
  S.circle({ x: 760, y: 560, w: 320, h: 140, at: "before+0.4", out: q });
  S.note("yahin baat rakho!", { x: 760, y: 720, size: 44, at: "before+0.8", out: q, r: -3 });
  S.ransom("HOW DO CITIZENS|KNOW WHAT|HAPPENS NEXT?", { x: 960, y: 450, size: 104, at: "q", stagger: 0.03 });
  S.chip("NEXT COMMITMENT →", { x: 1560, y: 800, size: 34, at: "next", bg: "yellow", r: -3 });
};

// ---- 12: open data portal dashboard
BUILD[12] = (S) => {
  S.paper({ x: 960, y: 505, w: 1340, h: 720, r: -0.8, white: true, at: "portal-0.4", anim: "slideU",
    html: `<div style="position:absolute;inset:14px;overflow:hidden">${uiHead("OPEN DATA PORTAL", `<span style="margin-left:auto;font:500 22px Oswald;padding:4px 14px;background:var(--yellow);color:var(--ink)">DASHBOARD</span>`)}</div>`,
    tapes: [[-620, -350, 140, -25], [620, -350, 140, 25]] });
  const tiles = [
    ["PLANS", "plans", 630, 380, `${icon("map", 130)}<div style="position:absolute;left:170px;top:10px;width:380px;font:700 22px/1.7 'Courier Prime'">Development Plan 2034<br>Ward plans<br>Open space map</div>`],
    ["BUDGETS", "budget", 1290, 380, `<svg width="360" height="150" viewBox="0 0 360 150"><g stroke="#161412" stroke-width="3">${[60, 110, 80, 130, 95, 70].map((h, i) => `<rect x="${10 + i * 58}" y="${145 - h}" width="40" height="${h}" fill="${i === 3 ? "#efc031" : "url(#ht)"}"/>`).join("")}</g></svg>`],
    ["TIMELINES", "timelines", 630, 690, `<svg width="480" height="150" viewBox="0 0 480 150"><g stroke="#161412" stroke-width="3">${[[0, 200], [120, 220], [60, 300], [240, 200]].map(([x, w], i) => `<rect x="${x + 10}" y="${12 + i * 34}" width="${w}" height="22" fill="${i === 2 ? "#efc031" : "#efe6d3"}"/>`).join("")}</g></svg>`],
    ["ONGOING PROJECTS", "projects", 1290, 690, `<div style="font:700 22px/1.75 'Courier Prime'">${["Road resurfacing, Ward 12", "Storm drain, Ward 7", "Public toilet, Ward 3"].map((t) => `<div>▸ ${t}</div>`).join("")}</div>`],
  ];
  tiles.forEach(([t, cue, x, y, body], i) => S.paper({ x, y, w: 620, h: 270, r: [-1, 1, 1, -1][i], at: cue + "-0.1", anim: "pop", z: 2, gain: 0.4,
    html: `<div style="position:absolute;left:22px;top:16px;font:400 34px Anton;letter-spacing:1px">${t}</div><div style="position:absolute;left:22px;top:72px">${body}</div>` }));
  S.circle({ x: 1160, y: 400, w: 460, h: 220, at: "budget+0.5", z: 3, sw: 8 });
};

// ---- 13: track progress, select department
BUILD[13] = (S) => {
  S.chip("TRACK THE PROGRESS", { x: 720, y: 150, size: 54, at: 0.1, bg: "ink", r: -2 });
  S.paper({ x: 540, y: 320, w: 560, h: 100, r: -1, white: true, at: 0.25, z: 3,
    html: `<div style="position:absolute;left:26px;top:26px;font:700 32px 'Courier Prime'">Select Department</div><div style="position:absolute;right:26px;top:18px;font:400 40px Anton">▾</div>` });
  const opts = ["Gardens &amp; Open Spaces", "Roads", "Building &amp; Factories", "Water Supply"];
  S.paper({ x: 540, y: 560, w: 560, h: 330, white: true, at: "proposal-0.6", anim: "slideD", dur: 0.35, z: 2, sfx: "pop",
    html: opts.map((t, i) => `<div style="position:absolute;left:0;right:0;top:${20 + i * 76}px;height:70px;padding-left:26px;display:flex;align-items:center;font:700 28px 'Courier Prime';${i === 0 ? "background:var(--yellow)" : ""}">${t}</div>`).join("") });
  S.add({ x: 700, y: 450, w: 50, h: 50, at: "proposal-0.4", anim: "none", z: 6, sfx: null, click: "proposal",
    moveFrom: [200, 120], moveDur: 0.4,
    html: `<svg width="50" height="50" viewBox="0 0 30 30" style="overflow:visible"><path d="M4 2l20 12-9 2-4 9z" fill="#f7f3ea" stroke="#161412" stroke-width="2.4" stroke-linejoin="round"/></svg>` });
  const rows = [["Public Garden (your proposal)", 30, true], ["Road resurfacing", 72], ["Street lights", 90], ["Drain repair", 48]];
  S.paper({ x: 1340, y: 520, w: 700, h: 600, r: 1.2, at: "proposal+0.2", tapes: [[0, -296, 140, 2]],
    html: `<div style="position:absolute;left:30px;top:26px;font:400 38px Anton">YOUR WARD · K-WEST</div>` });
  rows.forEach(([t, v, mine], i) => {
    const y = 330 + i * 120;
    S.add({ x: 1340, y, at: (i ? "area" : "proposal+0.4") + `+${(i * 0.15).toFixed(2)}`, anim: "pop", z: 3, gain: 0.25,
      html: `<div style="width:620px;font:700 26px 'Courier Prime'">${mine ? "★ " : ""}${t}<span style="float:right">${v}%</span></div>` });
    S.add({ x: 1340, y: y + 44, w: 620, h: 26, at: (i ? "area" : "proposal+0.4") + `+${(i * 0.15 + 0.1).toFixed(2)}`, anim: "grow", target: v, z: 3, sfx: null, boil: false,
      html: `<div style="position:absolute;inset:0;border:3px solid var(--ink);overflow:hidden;background:var(--white)"><div class="bar" style="${mine ? "" : "background:url(#ht);background:#9e978a"}"></div></div>` });
  });
  S.circle({ x: 1330, y: 345, w: 780, h: 150, at: "track", z: 4, sw: 8 });
};

// ---- 14: public garden tracker... not satisfied?
BUILD[14] = (S) => {
  S.paper({ x: 900, y: 400, w: 1380, h: 330, r: -1, white: true, at: 0, anim: "drop", tapes: [[-640, -150, 120, -20], [640, -150, 120, 20]],
    html: `<div style="position:absolute;left:36px;top:26px;font:400 44px Anton">PUBLIC GARDEN · STATUS</div><div style="position:absolute;left:160px;right:160px;top:232px;height:6px;background:var(--ink)"></div>` });
  ["PROPOSED", "APPROVED", "IN PROGRESS", "COMPLETED"].forEach((t, i) => {
    const x = 330 + i * 380;
    S.add({ x, y: 470, w: 90, h: 90, at: 0.25 + i * 0.28, anim: "pop", z: 2, gain: 0.35, html: icon("check", 90) });
    S.add({ x, y: 540, at: 0.3 + i * 0.28, anim: "fade", z: 2, sfx: null, html: `<div style="font:400 30px 'Archivo Black'">${t}</div>` });
  });
  S.add({ x: 1520, y: 730, w: 220, h: 220, at: "sat-0.1", anim: "stamp", r: -8, z: 4, sfx: "thud", gain: 0.8, html: icon("thumbsDown", 220), cls: "shadow" });
  S.chip("NOT SATISFIED?", { x: 1050, y: 760, size: 54, at: "what-0.1", bg: "yellow", r: -2, z: 4 });
};

// ---- 16: centralised complaint system cycle
BUILD[16] = (S) => {
  S.paper({ x: 960, y: 500, w: 330, h: 330, r: -2, at: "system-0.2", z: 3, bg: "var(--yellow)",
    html: `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font:400 40px/1.05 Anton">CENTRALISED<br>COMPLAINT<br>SYSTEM</div>`, tapes: [[0, -160, 110, -4]] });
  S.pencil({ x: 960, y: 500, w: 700, h: 600, at: "system+0.4", dur: 1.6, sw: 6, dash: "16 12",
    d: `<ellipse cx="350" cy="300" rx="330" ry="280"/><path d="M640 160l40 0 -6 40"/><path d="M60 440l-40 0 6 -40"/>` });
  const nodes = [["form", "REGISTER<br>COMPLAINT", "register", 960, 200], ["receipt", "<span style='font-size:22px'>ACKNOWLEDGEMENT</span><br><span style='font:700 22px Courier Prime'>(paavti)</span>", "ack", 1420, 500],
    ["track", "TRACK<br>RESOLUTION", "track", 960, 790], ["dept", "RESPONSIBLE<br>DEPARTMENT", "dept", 500, 500]];
  nodes.forEach(([ic, lab, cue, x, y], i) => S.paper({ x, y, w: 430, h: 170, r: [-2, 2, -1, 2][i], at: cue + "-0.1", z: 4, white: i % 2 === 1,
    html: `<div style="position:absolute;left:18px;top:25px">${icon(ic, 115)}</div><div style="position:absolute;left:150px;top:0;bottom:0;display:flex;align-items:center;font:400 27px/1.1 'Archivo Black'">${lab}</div>`, tapes: [[0, -82, 90, 3]] }));
  S.note("ek hi platform", { x: 1500, y: 200, r: 5, size: 44, at: "system+1.4" });
};

// ---- 17: timely action, updates, resolved, feedback; closed vs resolved
BUILD[17] = (S) => {
  const steps = [["clock", "TIMELY<br>ACTION", "timely"], ["bell", "REGULAR<br>UPDATES", "updates"], ["check", "ISSUE<br>RESOLVED", "resolved"], ["stars", "FEEDBACK", "feedback"]];
  steps.forEach(([ic, lab, cue], i) => {
    const x = 330 + i * 420;
    S.card({ x, y: 400, w: 320, h: 350, icon: ic, label: lab, ls: 32, at: cue + "-0.1", num: i + 1, r: [-2, 2, -2, 2][i], size: 160 });
    if (i < 3) S.pencil({ x: x + 210, y: 400, w: 110, h: 60, at: steps[i + 1][2] + "-0.4", dur: 0.35, sw: 5, d: `<path d="M8 30h90"/><path d="M80 14l18 16-18 16"/>` });
  });
  S.stamp("CLOSED", { x: 700, y: 770, r: -6, size: 52, at: "closed", z: 3 });
  S.cross({ x: 700, y: 770, w: 380, h: 120, at: "closed+0.9", z: 4 });
  S.stamp("RESOLVED ✓", { x: 1230, y: 770, r: 4, size: 52, at: "solved", z: 3, fill: "var(--yellow)" });
  S.note("band nahi, hal!", { x: 1640, y: 840, r: -5, size: 46, at: "solved+0.6" });
};

// ---- 19: single window digital services
BUILD[19] = (S) => {
  S.add({ x: 470, y: 520, w: 560, h: 520, at: "corp-0.4", anim: "slideU", cls: "shadow", html: svgMunicipal() });
  S.chip("MUNICIPAL CORPORATION", { x: 470, y: 830, size: 34, at: "corp", bg: "ink", r: -2, z: 3 });
  S.paper({ x: 1270, y: 450, w: 800, h: 600, r: 1, white: true, at: "window-0.3", anim: "drop", z: 2,
    html: `<div style="position:absolute;inset:14px;overflow:hidden">${uiHead("SINGLE WINDOW DIGITAL SERVICES")}</div>`, tapes: [[-370, -290, 120, -20], [370, -290, 120, 20]] });
  const tiles = [["rupee", "PROPERTY TAX", "tax"], ["form", "TRADE LICENCE", "licence"], ["building", "BUILDING PERMIT", "online"], ["tap", "WATER BILL", "online+0.15"], ["receipt", "BIRTH CERTIFICATE", "online+0.3"], ["dept", "AADHAAR LINKING", "online+0.45"]];
  tiles.forEach(([ic, t, cue], i) => {
    const x = 1030 + (i % 3) * 245, y = 330 + Math.floor(i / 3) * 235;
    S.paper({ x, y, w: 220, h: 210, r: 0, at: cue, anim: "pop", z: 3, gain: 0.35,
      html: `<div style="position:absolute;left:0;right:0;top:18px;display:flex;justify-content:center">${icon(ic, 100)}</div><div style="position:absolute;left:6px;right:6px;bottom:16px;text-align:center;font:400 22px/1.05 'Archivo Black'">${t}</div>` });
  });
  S.stamp("ALL ONLINE", { x: 1500, y: 720, r: -6, size: 40, at: "online+1.0", z: 5 });
  S.paper({ x: 1100, y: 840, w: 640, h: 120, r: -2, at: "offices-0.2", z: 6,
    html: `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-around;padding:0 20px">${["A", "B", "C"].map((l) => `<div style="display:flex;align-items:center;gap:6px">${icon("door", 70)}<span style="font:400 28px Anton">OFFICE ${l}</span></div>`).join('<span style="font:400 40px Anton">→</span>')}</div>` });
  S.cross({ x: 1100, y: 840, w: 640, h: 130, at: "offices+0.8", z: 7 });
  S.note("no more chakkar!", { x: 1640, y: 900 - 10, r: -4, size: 42, at: "offices+1.3", z: 7 });
};

// ---- 21: property tax system
BUILD[21] = (S) => {
  S.ransom("PROPERTY TAX SYSTEM", { x: 960, y: 160, size: 74, at: "system-0.2", stagger: 0.035 });
  const items = [["database", "PROPERTY<br>DATABASE", "db"], ["map", "GIS<br>TECHNOLOGY", "gis"], ["valuation", "TRANSPARENT<br>VALUATION", "val"],
    ["selfAssess", "SELF-<br>ASSESSMENT", "self"], ["calendar", "PERIODIC<br>REVISIONS", "rev"], ["link", "INTEGRATE<br>SERVICES", "integ"]];
  items.forEach(([ic, lab, cue], i) => {
    const x = 420 + (i % 3) * 540, y = 410 + Math.floor(i / 3) * 290;
    S.paper({ x, y, w: 460, h: 240, r: [-2, 1.5, -1, 2, -2, 1][i], at: cue + "-0.15", z: 2, white: i % 2 === 1, tapes: [[0, -116, 100, (i % 2 ? -4 : 4)]],
      html: `<div style="position:absolute;left:26px;top:52px">${icon(ic, 130)}</div><div style="position:absolute;left:180px;top:0;bottom:0;display:flex;align-items:center;font:400 29px/1.08 'Archivo Black'">${lab}</div>
        <div style="position:absolute;right:16px;top:12px;font:400 26px Anton;color:var(--ink);opacity:.5">0${i + 1}</div>` });
  });
};

// ---- 20: the four parts joined into one journey
BUILD[20] = (S) => {
  S.add({ x: 960, y: 460, w: 330, h: 200, at: 0.2, anim: "pop", z: 3, cls: "shadow", html: svgPeople(5, 2) });
  S.pencil({ x: 960, y: 460, w: 700, h: 560, at: "journey-0.3", dur: 2.0, sw: 7, color: "#efc031",
    d: `<ellipse cx="350" cy="280" rx="330" ry="260"/><path d="M660 170l20 40 -40 4"/><path d="M40 390l-20 -40 40 -4"/>` });
  const pos = [["LISTEN", "listen", 960, 190], ["INFORM", "inform", 1340, 460], ["RESPOND", "resolve", 960, 730], ["FACILITATE", "act", 580, 460]];
  pos.forEach(([t, cue, x, y], i) => S.chip(t, { x, y, size: 48, at: `four+${(i * 0.15).toFixed(2)}`, r: [-2, 2, -1, 3][i], z: 4, hl: cue, font: "400 48px Anton", ls: 3 }));
  S.chip("INDIAN CITIES ARE ALREADY SHOWING THE WAY", { x: 960, y: 880, size: 36, at: "cities", bg: "ink", r: -1, z: 5 });
  S.note("ek lagaataar safar", { x: 1560, y: 230, r: 6, size: 44, at: "journey+0.8" });
};

// ---- 22: Pune open data portal, BMC WhatsApp chatbot
BUILD[22] = (S) => {
  S.ransom("PUNE", { x: 330, y: 170, size: 84, at: "pune-0.2" });
  const rows = ["Ward-wise budget", "Property tax collection", "Water supply schedule", "Solid waste data", "Road works status"];
  S.paper({ x: 640, y: 520, w: 820, h: 560, r: -1.5, white: true, at: "pune", anim: "slideL", z: 2, tapes: [[-380, -270, 120, -25]],
    html: `<div style="position:absolute;inset:14px;overflow:hidden">${uiHead("PUNE · OPEN DATA PORTAL")}
      ${rows.map((t, i) => `<div style="position:absolute;left:30px;right:30px;top:${100 + i * 76}px;height:60px;border-bottom:2px solid #161412;display:flex;align-items:center;justify-content:space-between;font:700 27px 'Courier Prime'"><span>${t}</span><span style="font:500 20px Oswald;padding:2px 10px;border:2.5px solid #161412">CSV ↓</span></div>`).join("")}</div>` });
  S.ransom("MUMBAI", { x: 1560, y: 150, size: 74, at: "mumbai-0.2" });
  S.add({ x: 1450, y: 540, w: 360, h: 650, at: "mumbai", anim: "slideR", z: 2, cls: "shadow",
    html: `<div style="position:absolute;inset:0;border:11px solid var(--ink);border-radius:40px;background:var(--cream);overflow:hidden">
      <div class="ui-head" style="height:74px;font-size:24px;padding:0 20px">BMC CHATBOT</div></div>` });
  const msgs = [["bot", "Namaste! How can we help you today?", "bmc+0.2"], ["me", "Pay property tax", "bmc+0.9"], ["bot", "Here is your payment link ✓", "access-0.2"], ["me", "Register a complaint", "access+0.6"]];
  msgs.forEach(([who, t, at], i) => S.add({ x: who === "bot" ? 1405 : 1500, y: 330 + i * 110, at, anim: "pop", z: 3, sfx: "chat", gain: 0.45,
    html: `<div style="max-width:200px;padding:12px 16px;font:700 21px/1.25 'Courier Prime';border:3px solid var(--ink);border-radius:16px;background:${who === "bot" ? "var(--white)" : "var(--yellow)"}">${t}</div>` }));
  S.chip("WHATSAPP", { x: 1250, y: 860, size: 30, at: "bmc", r: -4, bg: "white", z: 4 });
  S.note("ye pahal raasta dikhati hain →", { x: 1000, y: 880, size: 42, at: "show", r: -2, z: 4 });
};

// ---- 23: smart city = responsive, transparent, participatory
BUILD[23] = (S) => {
  S.chip("A TRULY SMART CITY IS...", { x: 960, y: 150, size: 52, at: "smart-0.1", bg: "ink", r: -1 });
  S.card({ x: 960, y: 470, w: 380, h: 380, icon: "smart", size: 200, label: "JUST<br>TECHNOLOGY?", ls: 32, at: "tech-0.2", out: "resp-0.4", r: 2 });
  S.cross({ x: 960, y: 470, w: 400, h: 400, at: "tech+0.7", out: "resp-0.4" });
  const words = [["RESPONSIVE", "resp", 400, "speech", "jo jawab de", "m1"], ["TRANSPARENT", "trans", 960, "eye", "jo kuch na chhupaaye", "m2"], ["PARTICIPATORY", "part", 1520, "people", "jo sabko saath le", "m3"]];
  words.forEach(([w, cue, x, ic, hi, m], i) => {
    S.add({ x, y: 330, w: 150, h: 150, at: cue + "-0.1", anim: "pop", z: 2, html: icon(ic, 150), cls: "shadow" });
    S.ransom(w, { x, y: 500, size: 42, at: cue, stagger: 0.03, seed: 900 + i });
    S.note(hi, { x, y: 640, size: 44, at: m, r: [-3, 2, -2][i] });
    S.tape({ x, y: 690, w: 320, h: 16, yellow: true, at: m + "+0.3", r: [-2, 1, -1][i] });
  });
};

// ---- 24: active partners
BUILD[24] = (S) => {
  S.paper({ x: 960, y: 290, w: 760, h: 330, r: -1, news: true, at: 0, tapes: [[0, -160, 140, 2]] });
  S.add({ x: 960, y: 300, w: 520, h: 300, at: 0.2, anim: "pop", z: 2, html: svgPeople(5, 4), cls: "shadow" });
  const boxes = [["ear", "LISTEN", "listen"], ["eye", "INFORM", "inform"], ["megaphone", "RESPOND", "respond"], ["tap", "FACILITATE", "fac"]];
  boxes.forEach(([ic, t, cue], i) => S.card({ x: 360 + i * 400, y: 640, w: 320, h: 260, icon: ic, size: 120, label: t, ls: 34, at: cue + "-0.1", r: [-2, 2, -2, 2][i], z: 3, tapes: [] }));
  S.chip("ACTIVE PARTNERS IN LOCAL GOVERNANCE", { x: 960, y: 860, size: 44, at: "partners", bg: "yellow", r: -1, z: 5 });
  S.tape({ x: 300, y: 860, w: 120, h: 22, yellow: true, r: 70, at: "partners+0.4" });
  S.tape({ x: 1620, y: 860, w: 120, h: 22, yellow: true, r: -70, at: "partners+0.5" });
};

// ---- 25: skyline, the cities we want to live in
BUILD[25] = (S) => {
  S.add({ x: 1480, y: 600, w: 300, h: 300, at: "today", anim: "pop", z: 0, boil: false, sfx: "swell",
    html: `<div style="width:300px;height:300px;border-radius:50%;background:var(--yellow);opacity:.95"></div>` });
  S.add({ x: 960, y: 820, w: 1960, h: 520, at: 0.05, anim: "slideU", dur: 1.2, z: 1, boil: false, html: svgSkyline() });
  S.chip("SAATH MILKAR", { x: 470, y: 140, size: 44, at: "together", bg: "ink", r: -4, z: 3 });
  S.ransom("THE CITIES", { x: 820, y: 240, size: 96, at: "tomorrow-0.2", z: 3 });
  S.ransom("WE WANT TO LIVE IN", { x: 960, y: 380, size: 76, at: "live-0.4", z: 3, stagger: 0.035 });
  S.note("aaj ki zarooratein → kal ke shehar", { x: 1450, y: 140, r: 4, size: 40, at: "today+0.3", z: 3 });
};

// ---- outro end card
function buildOutro(S) {
  S.paper({ x: 960, y: 500, w: 1100, h: 560, r: -1.5, news: true, at: 0, anim: "none", tapes: [[-500, -260, 150, -30], [500, -260, 150, 30]] });
  S.chip("PRAJA", { x: 960, y: 360, bg: "ink", size: 96, at: 0.3, anim: "stamp", ls: 16, z: 3 });
  ["LISTEN", "INFORM", "RESPOND", "FACILITATE"].forEach((t, i) => S.chip(t, { x: 540 + i * 280, y: 540, size: 40, font: "400 44px Anton", ls: 3, at: 0.8 + i * 0.18, r: [-3, 2, -2, 3][i], bg: i % 2 ? "white" : "yellow", z: 3 }));
  S.chip("Ek jagruk nagrik ka safar", { x: 960, y: 680, size: 36, at: 1.7, z: 3, r: -1 });
  S.circle({ x: 960, y: 360, w: 560, h: 220, at: 1.2, z: 4 });
}

// ------------------------------------------------------------- overlay --
const CHAPTER = { 1: "INTRO", 2: "THE QUESTION", 3: "THE QUESTION", 4: "THE QUESTION", 5: "01 · LISTEN", 6: "01 · LISTEN", 7: "01 · LISTEN", 8: "01 · LISTEN", 9: "01 · LISTEN",
  10: "01 · LISTEN", 11: "02 · INFORM", 12: "02 · INFORM", 13: "02 · INFORM", 14: "02 · INFORM", 15: "03 · RESPOND", 16: "03 · RESPOND", 17: "03 · RESPOND",
  18: "04 · FACILITATE", 19: "04 · FACILITATE", 21: "04 · FACILITATE", 20: "THE WAY AHEAD", 22: "THE WAY AHEAD", 23: "THE WAY AHEAD", 24: "TOGETHER", 25: "TOGETHER" };
const OV = {};
function buildOverlay() {
  const ov = document.getElementById("overlay");
  const cross = (x, y, s = 34) => `<svg style="position:absolute;left:${x - s / 2}px;top:${y - s / 2}px" width="${s}" height="${s}" viewBox="0 0 34 34"><g fill="none" stroke="#18232e" stroke-width="1.6" opacity=".8"><circle cx="17" cy="17" r="8"/><path d="M17 0v34M0 17h34"/></g></svg>`;
  ov.innerHTML = `
    ${cross(960, 34)}${cross(34, 540)}${cross(1886, 540)}${cross(34, 34, 26)}${cross(1886, 34, 26)}${cross(34, 1046, 26)}${cross(1886, 1046, 26)}
    <div style="position:absolute;left:1898px;top:540px;transform:translate(-50%,-50%) rotate(90deg);font:400 15px 'Special Elite';color:#141d26;opacity:.75;white-space:nowrap;letter-spacing:2px">
      PRAJA · CITIZEN PARTICIPATION · VIDEO 03 · LISTEN · INFORM · RESPOND · FACILITATE · 2026</div>
    <div style="position:absolute;left:20px;top:800px;transform:translate(-50%,-50%) rotate(-90deg);font:700 22px Caveat;color:#141d26;opacity:.7;white-space:nowrap">nagrik / notes -</div>
    <div id="hud" style="position:absolute;left:78px;top:46px;display:flex;gap:10px;align-items:center;filter:drop-shadow(0 3px 3px rgba(0,0,0,.3))">
      <div style="background:var(--ink);color:var(--white);font:400 24px 'Archivo Black';letter-spacing:5px;padding:5px 14px 3px">PRAJA</div>
      <div id="chapter" style="background:var(--yellow);font:700 21px 'Courier Prime';letter-spacing:2px;padding:6px 14px 5px;transform:rotate(-1.5deg)"></div></div>
    <div style="position:absolute;right:86px;top:50px;font:400 18px 'Special Elite';color:#141d26;opacity:.8;letter-spacing:2px">FILE 03 / 2026</div>
    <div id="caption-wrap"><div id="caption"></div></div>
    <div id="wipe"><div class="sheet" style="clip-path:${torn(4242, 1100, 1160, 30, 18, "lr")}"><div class="news" style="column-count:4">${newsText(4242, 900)}</div></div>
      <div id="wipe-word" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-4deg);font:400 210px Anton;background:var(--yellow);padding:0 40px;color:var(--ink)"></div></div>`;
  OV.chapter = document.getElementById("chapter");
  OV.caption = document.getElementById("caption");
  OV.capWrap = document.getElementById("caption-wrap");
  OV.wipe = document.getElementById("wipe");
  OV.wipeWord = document.getElementById("wipe-word");
  OV.hud = document.getElementById("hud");
  OV.caption.style.clipPath = torn(77, 1400, 60, 3, 10);
}

// ---------------------------------------------------------------- build --
const CARDS = new Set([5, 11, 15, 18]);
TL.slides.forEach((s, i) => {
  const trans = i === 0 ? "none" : CARDS.has(s.n) ? "wipe" : (s.n === 8 || s.n === 23) ? "push" : i % 2 ? "slide" : "drop";
  const S = new Scene(s, { trans });
  BUILD[s.n](S);
  SCENES.push(S);
});
{
  const S = new Scene({ n: 99, start: TL.outro.start, end: TL.outro.end, vo: 0, cues: {} }, { trans: "drop" });
  buildOutro(S);
  SCENES.push(S);
}
buildOverlay();
const TDUR = { slide: 0.7, drop: 0.7, push: 0.45, wipe: 0.95, none: 0 };
SCENES.forEach((S, i) => {
  if (i === 0) return;
  const t0 = S.start;
  if (S.trans === "wipe") { SFX.push({ t: t0 - 0.2, name: "whoosh_a", gain: 0.55, pan: 0 }); SFX.push({ t: t0 - 0.1, name: "rustle", gain: 0.3, pan: 0 }); }
  else if (S.trans === "push") SFX.push({ t: t0 - 0.05, name: "whoosh_b", gain: 0.35, pan: 0.2 });
  else SFX.push({ t: t0 - 0.08, name: "whoosh_a", gain: 0.42, pan: S.trans === "slide" ? 0.3 : 0 });
});
window.SFX_EVENTS = SFX.filter((e) => e.t >= 0 && e.t < TL.dur).sort((a, b) => a.t - b.t);

// ------------------------------------------------------------- renderAt --
function resetScene(S) {
  S.el.style.transform = "";
  S.el.style.clipPath = "";
  S.el.style.boxShadow = "";
  S.el.style.zIndex = 1;
  S.shade.style.opacity = 0;
}
window.renderAt = (t) => {
  let idx = SCENES.findIndex((S) => t >= S.start && t < S.end);
  if (idx < 0) idx = t < 0 ? 0 : SCENES.length - 1;
  const cur = SCENES[idx], lt = t - cur.start;
  const td = TDUR[cur.trans];
  const prev = idx > 0 && lt < td ? SCENES[idx - 1] : null;
  for (const S of SCENES) if (S !== cur && S !== prev && S.el.style.display !== "none") S.el.style.display = "none";
  cur.el.style.display = "block";
  resetScene(cur);
  cur.el.style.zIndex = 2;
  cur.render(lt);
  OV.wipe.style.display = "none";
  if (prev) {
    prev.el.style.display = "block";
    resetScene(prev);
    prev.render(t - prev.start);
    const p = clamp(lt / td);
    if (cur.trans === "slide") {
      const e = E.inout(p);
      cur.el.style.transform = `translateX(${((1 - e) * W).toFixed(1)}px) rotate(${((1 - e) * 2).toFixed(2)}deg)`;
      cur.el.style.boxShadow = "-30px 0 50px rgba(0,0,0,.45)";
      prev.el.style.transform = `translateX(${(-e * 420).toFixed(1)}px)`;
      prev.shade.style.opacity = (e * 0.45).toFixed(3);
    } else if (cur.trans === "drop") {
      const e = E.out(p);
      cur.el.style.transform = `translateY(${(-(1 - e) * H).toFixed(1)}px) rotate(${(-(1 - e) * 3).toFixed(2)}deg)`;
      cur.el.style.boxShadow = "0 30px 60px rgba(0,0,0,.5)";
      prev.el.style.transform = `scale(${(1 - 0.05 * e).toFixed(4)})`;
      prev.shade.style.opacity = (e * 0.5).toFixed(3);
    } else if (cur.trans === "push") {
      const e = E.inout(p);
      cur.el.style.transform = `translateX(${((1 - e) * W).toFixed(1)}px)`;
      prev.el.style.transform = `translateX(${(-e * W).toFixed(1)}px)`;
    } else if (cur.trans === "wipe") {
      const e = E.inout(p), SW = 1100;
      const left = W + 40 - e * (W + SW + 80);
      OV.wipe.style.display = "block";
      OV.wipe.style.left = left.toFixed(1) + "px";
      OV.wipe.style.transform = `rotate(${(-2 + 4 * e).toFixed(2)}deg)`;
      const k = [5, 11, 15, 18].indexOf(cur.n);
      OV.wipeWord.textContent = "0" + (k + 1);
      prev.el.style.clipPath = `inset(0 ${Math.max(0, W - left - 60).toFixed(1)}px 0 0)`;
      cur.el.style.clipPath = `inset(0 0 0 ${Math.max(0, left + SW - 60).toFixed(1)}px)`;
    }
  }
  // chapter tag + captions
  const ch = CHAPTER[cur.n] || "PRAJA";
  if (OV.chapter.textContent !== ch) OV.chapter.textContent = ch;
  OV.hud.style.opacity = cur.n === 99 ? 0 : 1;
  const cap = TL.captions.find((c, i) => t >= c.t0 - 0.08 && t < Math.min(c.t1 + 0.35, (TL.captions[i + 1] || { t0: 1e9 }).t0 - 0.08));
  if (cap) {
    if (OV.caption.textContent !== cap.text) OV.caption.textContent = cap.text;
    const p = clamp((t - cap.t0 + 0.08) / 0.15);
    OV.capWrap.style.opacity = p.toFixed(3);
    OV.caption.style.transform = `translate(-50%,-50%) scale(${(0.97 + 0.03 * p).toFixed(4)})`;
  } else OV.capWrap.style.opacity = 0;
};

window.stageReady = document.fonts.ready.then(() => { window.renderAt(0); return true; });

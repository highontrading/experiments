// Ad 1, "Could you tell?": the edit as renderAt(frame). Look: Ink, Paper & Ember (see look.py / moodboard).
'use strict';
const C = document.getElementById('c'), X = C.getContext('2d');
const W = 1080, H = 1920, FPS = 30;
const INK = '#110F0E', PAPER = '#ECE7DF', EMBER = '#F2641E', GOLD = '#FFC45C', CREAM = '#F6F0E6', MUTED = '#8C837B', CARD = '#181615';
let D, P = {}, GR;
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const OFF = mk(), OX = OFF.getContext('2d'), OFF2 = mk(), OX2 = OFF2.getContext('2d'), TMP = mk(), TX = TMP.getContext('2d');
// ---------- math ----------
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, inv = (a, b, v) => cl((v - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3), eo5 = t => 1 - Math.pow(1 - t, 5), ei = t => t * t * t;
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const spring = t => t >= 1 ? 1 : 1 - Math.exp(-7 * t) * Math.cos(9 * t);          // soft overshoot, settles
const backo = t => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
let wt = i => D.words[i].os - 0.03, we = i => D.words[i].oe;
// ---------- assets ----------
const load = s => new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => j(new Error(s)); i.src = s; });
const cache = new Map();
async function img(p) { if (cache.has(p)) return cache.get(p); const i = await load(p); cache.set(p, i); if (cache.size > 60) cache.delete(cache.keys().next().value); return i; }
const pad = n => String(n).padStart(5, '0');
window.init = async (data) => {
  D = data;
  for (const k of ['set', 'paper', 'paper2']) P[k] = await load(`${D.asset}/plates/${k}.png`);
  await document.fonts.ready;
  for (const f of ['ID8', 'ID9', 'ID9I', 'ID6', 'ID5', 'IS', 'JM', 'JB', 'GEN']) await document.fonts.load(`40px ${f}`);
  GR = mk(512, 512); const g = GR.getContext('2d'), id = g.createImageData(512, 512);
  let s = 9; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - .5) * 70; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return true;
};
// ---------- text ----------
function T(ctx, s, x, y, o = {}) {
  const a = o.alpha ?? 1; if (a <= .003 || !s) return 0;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${o.size || 60}px ${o.font || 'ID8'}`; ctx.letterSpacing = (o.track || 0) + 'px';
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(s).width;
  ctx.translate(x + (o.dx || 0), y + (o.dy || 0)); if (o.rot) ctx.rotate(o.rot); const sc = o.scale ?? 1; ctx.scale(sc, sc);
  if ((o.blur || 0) > .3) ctx.filter = `blur(${o.blur.toFixed(1)}px)`;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowR || 26; }
  else if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = (o.size || 60) * .25; ctx.shadowOffsetY = (o.size || 60) * .05; }
  if (o.stroke) { ctx.lineWidth = o.lw || 3; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); }
  if (o.fill !== null) { ctx.fillStyle = o.fill || CREAM; ctx.fillText(s, 0, 0); }
  ctx.restore(); return w;
}
function mw(ctx, s, size, font, track = 0) { ctx.save(); ctx.font = `${size}px ${font}`; ctx.letterSpacing = track + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
const enter = (t, t0, d = .24) => { const p = eo(inv(t0, t0 + d, t)); return { alpha: p, blur: (1 - p) * 14, dy: (1 - p) * 22, scale: 1.05 - .05 * p }; };
// a line of styled tokens; each token enters on its word; whole line exits at tx
function line(ctx, t, toks, y, tx = 1e9, cx = W / 2, gap = 18) {
  const ws = toks.map(k => mw(ctx, k.s, k.size, k.font, k.track || 0)); const tot = ws.reduce((a, b) => a + b, 0) + gap * (toks.length - 1);
  let x = cx - tot / 2; const q = eo(inv(tx, tx + .16, t));
  toks.forEach((k, i) => {
    const t0 = k.t0 ?? wt(k.i);
    if (t >= t0) { const e = enter(t, t0, k.d || .24); T(ctx, k.s, x + ws[i] / 2, y, Object.assign({}, k, { alpha: e.alpha * (1 - q), blur: e.blur + q * 12, dy: e.dy - q * 26, scale: e.scale })); }
    x += ws[i] + gap;
  });
}
const tok = (s, i, size, font = 'ID8', fill = CREAM, more = {}) => Object.assign({ s, i, size, font, fill, track: font.startsWith('ID') ? -size * .035 : 0 }, more);
const gold = (s, i, size, more = {}) => tok(s, i, size, 'IS', GOLD, Object.assign({ glow: 'rgba(255,196,92,.55)', glowR: 24 }, more));
// ---------- camera / layers ----------
function cam(z, sy, sx = 540) { const k = 1.5 * z; return { z, sx, sy: Math.max(sy, H - (1280 - 600) * k), k }; }
function lerpCam(a, b, p) { return cam(lerp(a.z, b.z, p), lerp(a.sy, b.sy, p), lerp(a.sx, b.sx, p)); }
const headTop = c => c.sy + (432 - 600) * c.k, faceY = c => c.sy - 40 * c.k / 1.5;
function drawRoom(ctx, c) {
  const im = P.set, s = 1.06 + (c.z - 1) * .3, w = W * s, h = H * s;
  ctx.drawImage(im, (W - w) / 2 - (c.sx - 540) * .25, (H - h) / 2 - (c.sy - 900) * .06, w, h);
}
function drawSubject(ctx, im, c) { ctx.drawImage(im, c.sx - 360 * c.k, c.sy - 600 * c.k, 720 * c.k, 1280 * c.k); }
function finish(ctx, f, vig = .55) {
  const g = ctx.createRadialGradient(W / 2, H * .42, 420, W / 2, H * .5, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(6,4,3,${vig})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; const ox = -((f * 137) % 512), oy = -((f * 251) % 512);
  for (let y = oy; y < H; y += 512) for (let x = ox; x < W; x += 512) ctx.drawImage(GR, x, y); ctx.restore();
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function cardImg(ctx, src, x, y, w, h, r, shadow = .42, filter = 'none') {
  ctx.save(); if (shadow) { ctx.shadowColor = `rgba(40,22,10,${shadow})`; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26; rrect(ctx, x, y, w, h, r); ctx.fillStyle = '#000'; ctx.fill(); }
  ctx.restore(); ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip(); ctx.filter = filter; ctx.drawImage(src, x, y, w, h); ctx.restore();
}
// ---------- the normal (Part 1) frame ----------
function genericCaption(ctx, t, first, last, y = 1150) {
  let cur = first; for (let i = first; i <= last; i++) if (t >= wt(i)) cur = i;
  const s0 = cur - (cur - first) % 2, words = [s0, s0 + 1].filter(i => i <= last);
  const fs = words.map(i => i === cur ? 106 : 92), strs = words.map(i => D.words[i].w.toUpperCase().replace(/[,.]$/, '').replace(/,/g, ''));
  ctx.save(); const ws = strs.map((s, k) => mw(ctx, s, fs[k], 'GEN')); let x = W / 2 - (ws.reduce((a, b) => a + b, 0) + 26 * (ws.length - 1)) / 2;
  strs.forEach((s, k) => {
    const pop = words[k] === cur ? 1 + .22 * (1 - eo(inv(wt(cur), wt(cur) + .1, t))) : 1;
    ctx.save(); ctx.translate(x + ws[k] / 2, y); ctx.scale(pop, pop); ctx.font = `${fs[k]}px GEN`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(s, 0, 0); ctx.fillStyle = words[k] === cur ? '#FFE128' : '#fff'; ctx.fillText(s, 0, 0); ctx.restore();
    x += ws[k] + 26;
  });
  ctx.restore();
}
async function normalFrame(ctx, t, fr) {
  const raw = await img(`${D.asset}/bake/raw/${pad(fr)}.jpg`);
  let z = 1, cy = 640; if (t >= wt(19) && t < wt(23)) { z = 1.24; cy = 590; }    // the cheap snap-zoom on "zoom"
  const k = 1.5 * z; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(raw, W / 2 - 360 * k, H / 2 - cy * k + (cy - 640) * 0, 720 * k, 1280 * k);
  if (t < wt(40)) genericCaption(ctx, t, t < wt(13) ? 0 : t < wt(27) ? 13 : 27, t < wt(13) ? 12 : t < wt(27) ? 26 : 39);
}
// Part 1 is always shown as a labelled specimen: "everyone's AI edit", never as the creator's own frame
const P1 = { x: 160, y: 470, w: 760, h: 1351 };
function part1Chrome(ctx, t, a) {
  const g = ctx.createRadialGradient(W / 2, 700, 100, W / 2, 900, 1300); g.addColorStop(0, '#1A1715'); g.addColorStop(1, '#090808');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const e = enter(t, .02, .3); T(ctx, "everyone's AI edit", W / 2, 338, { size: 58, font: 'ID8', track: -2, alpha: e.alpha, blur: e.blur, dy: e.dy });
  const chips = [[14, 'bouncing captions'], [19, 'auto-zoom'], [26, 'stock whoosh']]; let x = W / 2 - 430;
  chips.forEach(([wi, lab], k) => {
    const label = `0${k + 1}  ${lab}`, w = mw(ctx, label, 24, 'JB', 1) + 44, c = eo(inv(wt(wi), wt(wi) + .25, t));
    if (c > 0) { ctx.save(); ctx.globalAlpha = a * c; ctx.translate(0, (1 - c) * 12); rrect(ctx, x, 384, w, 46, 23); ctx.strokeStyle = EMBER; ctx.lineWidth = 2; ctx.stroke();
      T(ctx, label, x + 22, 416, { size: 24, font: 'JB', track: 1, align: 'left', fill: '#F3B38E', shadow: false }); ctx.restore(); }
    x += w + 14;
  });
  ctx.restore();
}
// ---------- the premium frame ----------
async function premiumFrame(ctx, t, f, fr, c, behind, front) {
  const pre = await img(`${D.asset}/bake/pre/${pad(fr)}.webp`);
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); drawRoom(ctx, c);
  if (behind) behind(ctx, c);
  drawSubject(ctx, pre, c); finish(ctx, f);
  if (front) front(ctx, c);
}
// ---------- scene timing ----------
const S = {};
function bounds() {
  S.feed = wt(27); S.flick = wt(39) + .12; S.sw = wt(40) - .04; S.push = wt(43) - .32; S.prem = wt(43);
  S.mg1 = wt(53) - .12; S.mg2 = wt(62) - .1; S.pb = wt(67) - .08; S.mg3 = wt(76) - .1; S.pc = wt(82) - .08; S.end = D.speech; S.total = D.nframes / FPS;
}
// premium A-roll timeline: camera per beat (cuts happen on the jump cuts / beat changes)
function premCam(t) {
  if (t < wt(48) - .15) return cam(lerp(1.08, 1.12, inv(S.prem, wt(48), t)), 860);
  if (t < wt(51)) return lerpCam(cam(1.12, 860), cam(1.45, 690), eio(inv(wt(48) - .15, wt(48) + .3, t)));
  if (t < S.mg1 + .5) return cam(lerp(1.1, 1.13, inv(wt(51), wt(53), t)), 920);
  if (t < wt(72)) return cam(lerp(1.15, 1.19, inv(S.pb, wt(72), t)), 830);
  if (t < S.mg3 + .5) return lerpCam(cam(1.19, 830), cam(1.4, 760, 560), eio(inv(wt(72), wt(75) + .25, t)));
  if (t < wt(87)) return cam(lerp(1.05, 1.09, inv(S.pc, wt(87), t)), 860);
  if (t < wt(91)) return cam(lerp(1.05, 1.08, inv(wt(87), wt(91), t)), 850);
  return cam(lerp(1.22, 1.3, inv(wt(91), S.end, t)), 770);
}
function premLayers(t) {   // returns [behind, front] painters for the current premium beat
  const NOOP = null;
  if (t < wt(48) - .1) return [NOOP, ctx => {
    line(ctx, t, [tok('AI', 43, 108), tok('edited', 44, 108)], 1125, wt(48) - .12);
    line(ctx, t, [tok('this', 45, 118, 'IS'), tok('one', 46, 118, 'IS'), gold('too.', 47, 118)], 1240, wt(48) - .12);
  }];
  if (t < wt(51)) return [NOOP, (ctx, c) => {
    const p = backo(cl((t - wt(48) - .05) / .35)), s = lerp(560, 330, cl(p)), fx = c.sx, fy = faceY(c) - 20;
    ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.globalAlpha = cl((t - wt(48)) / .15) * (1 - inv(wt(51) - .1, wt(51), t));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x0 = fx + a * s / 2, y0 = fy + b * s * .62; ctx.beginPath(); ctx.moveTo(x0 - a * 44, y0); ctx.lineTo(x0, y0); ctx.lineTo(x0, y0 - b * 44); ctx.stroke(); }
    ctx.restore();
    line(ctx, t, [tok('could', 48, 64), tok('you', 49, 64)], 1100, wt(51) - .08);
    line(ctx, t, [gold('tell?', 50, 200, { d: .3 })], 1245, wt(51) - .08);
  }];
  if (t < S.mg1 + .5) return [(ctx, c) => {
    const e = enter(t, wt(51), .3); T(ctx, 'nobody', W / 2, headTop(c) + 120, { size: 290, font: 'ID9', track: -12, alpha: e.alpha, blur: e.blur, scale: 1.12 - .12 * eo(inv(wt(51), wt(51) + .5, t)) });
  }, ctx => line(ctx, t, [gold('can.', 52, 230)], 1215)];
  if (t < wt(72)) return [NOOP, ctx => {
    line(ctx, t, [tok('how', 67, 62), tok('every', 68, 62)], 1075, wt(72) - .08);
    if (t >= wt(69)) {
      const q = 1 - eo(inv(wt(72) - .08, wt(72) + .08, t)), u = (t - wt(69)) * FPS, styles = [['ID9', CREAM, null], ['JB', CREAM, null], ['ID9', null, CREAM], ['IS', GOLD, null]];
      const k = u < 15 ? Math.floor(u / 3.75) % 4 : 3; const [f, fill, stroke] = styles[k];
      const e = enter(t, wt(69), .12);
      T(ctx, 'word', W / 2, 1205, { size: f === 'IS' ? 170 : 140, font: f, fill: fill || null, stroke, lw: 3, track: f.startsWith('ID') ? -5 : 0, alpha: e.alpha * q, blur: e.blur, glow: k === 3 ? 'rgba(255,196,92,.55)' : null, glowR: 24 });
      let x = W / 2 - 300; ['SERIF', 'BOLD', 'MONO', 'OUTLINE'].forEach((lab, j) => {
        const on = (j === 0 && k === 3) || (j === 1 && k === 0) || (j === 2 && k === 1) || (j === 3 && k === 2);
        x += T(ctx, lab, x, 1252, { size: 22, font: 'JB', track: 3, align: 'left', fill: on ? GOLD : '#968E86', alpha: q * cl((t - wt(69)) / .2) }) + 40;
      });
    }
  }];
  if (t < S.mg3 + .5) return [NOOP, ctx => {
    const a = cl((t - wt(72)) / .25); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 3; ctx.globalAlpha = a; const m = lerp(40, 80, eo(a)), L = 70;
    for (const [x0, y0, sx, sy] of [[m, 300, 1, 1], [W - m, 300, -1, 1], [m, 1300, 1, -1], [W - m, 1300, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x0 + sx * L, y0); ctx.lineTo(x0, y0); ctx.lineTo(x0, y0 + sy * L); ctx.stroke(); }
    ctx.restore();
    const ez = inv(wt(72), wt(75) + .25, t); T(ctx, `PUSH IN  ·  EASE ${(.25 + .4 * eio(ez)).toFixed(2)}`, 86, 290, { size: 24, font: 'JM', track: 2, align: 'left', alpha: a, fill: '#E6E1D7' });
    line(ctx, t, [tok('when', 72, 62), tok('the', 73, 62), tok('camera', 74, 62)], 1090);
    if (t >= wt(75)) {
      const p = eo5(inv(wt(75), wt(75) + .32, t)), x = W / 2 - (1 - p) * 260;
      for (let j = 5; j > 0; j--) T(ctx, 'moves.', x - j * 30 * (1 - p * .6), 1235, { size: 160, font: 'ID9I', track: -6, alpha: .1 * (1 - p * .7), shadow: false });
      T(ctx, 'moves.', x, 1235, { size: 160, font: 'ID9I', track: -6, alpha: cl(p * 2), blur: (1 - p) * 10 });
    }
  }];
  if (t < wt(87)) return [(ctx, c) => {
    const e1 = enter(t, wt(82), .35), e2 = enter(t, wt(84), .35), s1 = 1.1 - .1 * eo(inv(wt(82), wt(82) + .6, t));
    T(ctx, 'VIBE', W / 2, 560, { size: 330, font: 'ID9', track: -10, alpha: e1.alpha, blur: e1.blur, scale: s1 });
    T(ctx, 'EDITING', W / 2, headTop(c) + 110, { size: 168, font: 'ID9', track: 2, alpha: e2.alpha, blur: e2.blur, dy: e2.dy });
  }, ctx => {
    line(ctx, t, [tok("that's", 82, 60), tok('the', 83, 60), tok('workflow', 84, 60)], 1115, wt(87) - .08);
    line(ctx, t, [gold('I', 85, 150), gold('teach.', 86, 150)], 1240, wt(87) - .08);
  }];
  if (t < wt(91)) return [NOOP, ctx => {
    line(ctx, t, [tok('the', 87, 60), tok('link', 88, 60), tok('is', 89, 60), tok('below', 90, 60)], 1060, wt(91) - .08);
    if (t >= wt(90)) {
      const p = spring(cl((t - wt(90)) / .55)), q = 1 - eo(inv(wt(91) - .08, wt(91) + .06, t)), pulse = 1 + .025 * Math.pow(Math.sin(Math.PI * (t - wt(90)) / .9), 8);
      ctx.save(); ctx.globalAlpha = cl(p * 1.5) * q; ctx.translate(W / 2, 1146); ctx.scale(lerp(.6, 1, p) * pulse, lerp(.6, 1, p) * pulse);
      ctx.shadowColor = 'rgba(242,100,30,.55)'; ctx.shadowBlur = 50; rrect(ctx, -330, -56, 660, 112, 56); ctx.fillStyle = EMBER; ctx.fill(); ctx.shadowColor = 'transparent';
      T(ctx, 'Learn the workflow  →', 0, 17, { size: 46, font: 'ID8', track: -1, fill: INK, shadow: false }); ctx.restore();
      ctx.save(); ctx.strokeStyle = '#F0E8DC'; ctx.lineWidth = 4; ctx.globalAlpha = q * cl((t - wt(90) - .2) / .2);
      const b = 8 * Math.abs(Math.sin((t - wt(90)) * 5)); for (let j = 0; j < 2; j++) { const yy = 1222 + j * 18 + b; ctx.beginPath(); ctx.moveTo(520, yy); ctx.lineTo(540, yy + 14); ctx.lineTo(560, yy); ctx.stroke(); }
      ctx.restore();
    }
  }];
  return [NOOP, ctx => {
    line(ctx, t, [tok('make', 91, 60), tok('videos', 92, 60), tok('that', 93, 60)], 1045);
    line(ctx, t, [gold('nobody', 94, 140), gold('can', 95, 140), gold('tell', 96, 140)], 1160);
    line(ctx, t, [tok('are', 97, 64), tok('AI.', 98, 64)], 1242);
  }];
}
// ---------- motion-graphic cards (paper) ----------
function paperBG(ctx, img = P.paper) { ctx.drawImage(img, 0, 0, W, H); }
function heading(ctx, t, toks1, toks2) {
  line(ctx, t, toks1, 400); line(ctx, t, toks2, 520);
}
const htok = (s, i, size = 82) => tok(s, i, size, 'ID8', INK, { shadow: false }), etok = (s, i, size = 128) => tok(s, i, size, 'IS', EMBER, { shadow: false });
function darkCard(ctx, x, y, w, h, p = 1) {
  ctx.save(); ctx.globalAlpha = p; ctx.shadowColor = 'rgba(40,22,10,.4)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26; rrect(ctx, x, y, w, h, 48); ctx.fillStyle = CARD; ctx.fill(); ctx.restore();
}
function mgPrompt(ctx, t) {
  paperBG(ctx); heading(ctx, t, [htok('i', 54), htok("don't", 55), htok('just', 56), htok('tell', 57), htok('AI', 58)], [etok('“edit my video”', 59)]);
  const p = eo(inv(S.mg1 + .05, S.mg1 + .45, t)), x0 = 90, y0 = 600 + (1 - p) * 120; darkCard(ctx, x0, y0, 900, 760, p);
  ctx.save(); ctx.globalAlpha = p;
  T(ctx, 'PROMPT', x0 + 60, y0 + 90, { size: 24, font: 'JB', track: 4, align: 'left', fill: MUTED, shadow: false });
  rrect(ctx, x0 + 50, y0 + 120, 800, 130, 30); ctx.fillStyle = '#262321'; ctx.fill(); ctx.strokeStyle = '#403B37'; ctx.lineWidth = 2; ctx.stroke();
  const full = 'edit my video', n = Math.floor(cl((t - wt(59)) / (we(61) + .1 - wt(59))) * full.length), s = full.slice(0, n);
  const w = T(ctx, s, x0 + 90, y0 + 205, { size: 58, font: 'ID5', track: -1, align: 'left', shadow: false });
  if (Math.floor(t * 2.4) % 2 === 0 || n < full.length) { ctx.fillStyle = GOLD; ctx.fillRect(x0 + 96 + w, y0 + 150, 5, 72); }
  const sk = eo(inv(we(61) + .2, we(61) + .45, t)); if (sk > 0) { ctx.strokeStyle = EMBER; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 + 84, y0 + 186); ctx.lineTo(x0 + 84 + (w + 14) * sk, y0 + 186); ctx.stroke(); }
  for (let k = 0; k < 3; k++) {
    const a = eo(inv(wt(59) + k * .12, wt(59) + .3 + k * .12, t)), tx = x0 + 60 + k * 270, ty = y0 + 320 + (1 - a) * 30;
    ctx.globalAlpha = p * a; rrect(ctx, tx, ty, 240, 320, 22); ctx.fillStyle = '#2E2B29'; ctx.fill(); rrect(ctx, tx + 40, ty + 220, 160, 32, 8); ctx.fillStyle = '#FFE128'; ctx.fill();
  }
  ctx.globalAlpha = p * eo(inv(wt(60), wt(60) + .3, t)); T(ctx, 'same captions · same zoom · same whoosh', W / 2, y0 + 710, { size: 26, font: 'JM', fill: MUTED, shadow: false });
  ctx.restore();
}
function mgWorkflow(ctx, t) {
  paperBG(ctx); heading(ctx, t, [htok('i', 62), htok('built', 63), htok('my', 64), htok('own', 65)], [etok('workflow.', 66)]);
  const drift = 1 + .025 * inv(S.mg2, S.pb, t); ctx.save(); ctx.translate(W / 2, 1050); ctx.scale(drift, drift); ctx.translate(-W / 2, -1050);
  const x0 = 90, y0 = 600; darkCard(ctx, x0, y0, 900, 900);
  const nodes = ['Transcript', 'Cut', 'Matte', 'Type', 'Camera', 'Grade', 'Sound'], pts = nodes.map((n, i) => [x0 + (i % 2 ? 430 : 110), y0 + 70 + i * 116]);
  const step = .17, t0 = S.mg2 + .25, appear = i => eo(inv(t0 + i * step, t0 + i * step + .3, t));
  for (let i = 0; i < 6; i++) {
    const g = eo(inv(t0 + i * step + .1, t0 + (i + 1) * step + .1, t)); if (g <= 0) continue;
    const [ax, ay] = [pts[i][0] + 180, pts[i][1] + 34], [bx, by] = [pts[i + 1][0] + 180, pts[i + 1][1] + 34];
    ctx.save(); ctx.strokeStyle = EMBER; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(242,100,30,.8)'; ctx.shadowBlur = 16; ctx.beginPath();
    for (let u = 0; u <= g + 1e-6; u += .04) { const yy = ay + (by - ay) * (3 * u * u - 2 * u * u * u), xx = ax + (bx - ax) * u; u ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore();
  }
  nodes.forEach((n, i) => {
    const a = appear(i); if (a <= 0) return; const [nx, ny] = pts[i]; ctx.save(); ctx.globalAlpha = a; ctx.translate(nx + 180, ny + 35); ctx.scale(.85 + .15 * backo(a), .85 + .15 * backo(a)); ctx.translate(-180, -35);
    rrect(ctx, 0, 0, 360, 70, 35); ctx.fillStyle = '#282523'; ctx.fill(); ctx.strokeStyle = '#48423D'; ctx.lineWidth = 2; ctx.stroke();
    T(ctx, String(i + 1).padStart(2, '0'), 30, 47, { size: 24, font: 'JB', align: 'left', fill: EMBER, shadow: false });
    T(ctx, n, 86, 48, { size: 34, font: 'ID6', track: -1, align: 'left', shadow: false }); ctx.restore();
  });
  const tp = t0 + 7 * step + .2; if (t > tp) {                      // light pulse travelling down the pipeline
    const u = ((t - tp) / 1.6) % 1, seg = Math.min(5, Math.floor(u * 6)), v = u * 6 - seg;
    const [ax, ay] = [pts[seg][0] + 180, pts[seg][1] + 34], [bx, by] = [pts[seg + 1][0] + 180, pts[seg + 1][1] + 34];
    const px = ax + (bx - ax) * v, py = ay + (by - ay) * (3 * v * v - 2 * v * v * v);
    ctx.save(); ctx.fillStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
function mgSettings(ctx, t) {
  paperBG(ctx); heading(ctx, t, [htok("it's", 76), htok('all', 77), htok('set', 78)], [etok('before', 79), etok('I', 80), etok('start.', 81)]);
  const p = eo(inv(S.mg3 + .05, S.mg3 + .45, t)), x0 = 90, y0 = 600 + (1 - p) * 120, x1 = 990, y1 = y0 + 820; darkCard(ctx, x0, y0, 900, 820, p);
  const rows = [['Captions', 'kinetic · per phrase'], ['Camera', 'smooth push · ease'], ['Grade', 'cinematic · low-key'], ['Background', 'AI room · matched light'], ['Sound', 'minimal · ducked']];
  ctx.save(); ctx.globalAlpha = p;
  rows.forEach(([k, v], i) => {
    const ry = y0 + 70 + i * 128, a = eo(inv(S.mg3 + .2 + i * .1, S.mg3 + .5 + i * .1, t)), on = eo(inv(wt(77) + i * .2, wt(77) + i * .2 + .18, t));
    ctx.save(); ctx.globalAlpha = p * a; ctx.translate(0, (1 - a) * 16);
    T(ctx, k, x0 + 60, ry + 40, { size: 40, font: 'ID6', track: -1, align: 'left', shadow: false }); T(ctx, v, x0 + 60, ry + 82, { size: 24, font: 'JM', align: 'left', fill: MUTED, shadow: false });
    rrect(ctx, x1 - 160, ry + 18, 100, 54, 27); ctx.fillStyle = on > .5 ? EMBER : '#3A3633'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lerp(x1 - 133, x1 - 87, on), ry + 45, 22, 0, 7); ctx.fill();
    if (i < 4) { ctx.fillStyle = '#302D2A'; ctx.fillRect(x0 + 60, ry + 111, 780, 2); } ctx.restore();
  });
  const pr = eio(inv(wt(80), we(81) + .2, t)); rrect(ctx, x0 + 60, y1 - 90, 780, 12, 6); ctx.fillStyle = '#302D2A'; ctx.fill();
  if (pr > 0) { rrect(ctx, x0 + 60, y1 - 90, 780 * pr, 12, 6); ctx.fillStyle = EMBER; ctx.fill(); }
  T(ctx, pr >= 1 ? 'READY  ·  RENDER 00:28' : `RENDERING  ${Math.round(pr * 100)}%`, x0 + 60, y1 - 36, { size: 22, font: 'JB', track: 3, align: 'left', fill: pr >= 1 ? EMBER : MUTED, shadow: false });
  ctx.restore();
}
// paper sheet sliding over / off the A-roll
async function sheetOver(t, f, fr, start, mg, dir = 1, dur = .42) {
  const p = eio(inv(start, start + dur, t)), off = (1 - p) * H * dir;
  if (p < 1) { await premiumFrame(X, t, f, fr, premCam(Math.min(t, start - .001)), ...premLayers(Math.min(t, start - .001))); }
  X.save(); X.translate(0, off); if (p < 1) { X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 60; X.fillStyle = PAPER; X.fillRect(0, 0, W, H); X.shadowColor = 'transparent'; }
  if (p < 1 && p > .05) X.filter = `blur(${(Math.sin(p * Math.PI) * 6).toFixed(1)}px)`;
  mg(X, t); X.restore(); X.filter = 'none';
}
async function sheetOff(t, f, fr, start, mg, dur = .42) {   // paper slides down, revealing the A-roll
  const p = eio(inv(start, start + dur, t));
  await premiumFrame(X, t, f, fr, premCam(t), ...premLayers(t));
  if (p < 1) { X.save(); X.translate(0, p * H); X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 60; X.fillStyle = PAPER; X.fillRect(0, 0, W, H); X.shadowColor = 'transparent'; if (p > .05) X.filter = `blur(${(Math.sin(p * Math.PI) * 6).toFixed(1)}px)`; mg(X, start - .001); X.restore(); X.filter = 'none'; }
}
// ---------- main ----------
window.renderAt = async (f) => {
  if (!S.feed) bounds();
  const t = f / FPS, fr = D.frames[f];
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.filter = 'none'; X.globalCompositeOperation = 'source-over';
  if (t < S.feed) { await normalFrame(OX, t, fr); part1Chrome(X, t, 1); cardImg(X, OFF, P1.x, P1.y, P1.w, P1.h, 36, .5); return true; }
  if (t < S.sw) {                                       // Part 1 → feed: the video becomes a card and gets scrolled away
    await normalFrame(OX, t, fr); const p = eio(inv(S.feed, S.feed + .45, t)); part1Chrome(X, t, 1 - p);
    const cw = lerp(P1.w, 560, p), ch = lerp(P1.h, 996, p), r = lerp(36, 40, p), cy0 = lerp(P1.y + P1.h / 2, 960, p);
    const fl = ei(inv(S.flick, S.flick + .32, t)), nx = spring(inv(S.flick + .05, S.flick + .6, t));
    const raw2 = await img(`${D.asset}/bake/raw/${pad(D.frames[0])}.jpg`);
    if (p > .2) {
      X.save(); X.globalAlpha = cl((p - .2) / .5) * .45; X.filter = 'brightness(.55)';
      cardImg(X, raw2, (W - 560) / 2, cy0 - ch / 2 - 996 - 40 - fl * 1600, 560, 996, 40, 0); cardImg(X, raw2, (W - 560) / 2, cy0 + ch / 2 + 40 - nx * (996 + 40), 560, 996, 40, 0); X.restore();
    }
    const y = cy0 - ch / 2 - fl * 1700;
    if (fl > 0) { X.save(); for (let j = 6; j > 0; j--) { X.globalAlpha = .08; cardImg(X, OFF, (W - cw) / 2, y + j * 60 * fl, cw, ch, r, 0); } X.restore(); }
    cardImg(X, OFF, (W - cw) / 2, y, cw, ch, r, p > .1 ? .5 : 0);
    if (nx > 0) { X.save(); X.globalAlpha = .9; cardImg(X, raw2, (W - 560) / 2, cy0 + ch / 2 + 40 - nx * (996 + 40), 560, 996, 40, .5, 'brightness(.7)'); X.restore(); }
    return true;
  }
  if (t < S.prem + .15) {                               // THE SWITCH: before / after on paper, then push into "after"
    const c0 = premCam(S.prem);
    await premiumFrame(OX2, t, f, fr, c0, null, null);
    const raw = await img(`${D.asset}/bake/raw/${pad(fr)}.jpg`); TX.drawImage(raw, 0, 0, W, H);
    paperBG(X, P.paper2);
    const pp = eio(inv(S.push, S.prem + .12, t));
    const bIn = spring(cl((t - S.sw) / .7)), aIn = spring(cl((t - S.sw - .1) / .75));
    const bx = lerp(-420, 60, bIn) - pp * 500, by = 700;
    X.save(); X.globalAlpha = 1 - pp; T(X, 'before', bx + 4, by - 24, { size: 46, font: 'ID6', track: -1, align: 'left', fill: MUTED, shadow: false }); X.restore();
    cardImg(X, TMP, bx, by, 380, 676, 36, .42, 'grayscale(1) contrast(1.05)');
    const ax = lerp(430, 0, pp), ay = lerp(470 + (1 - aIn) * 1500, 0, pp), aw = lerp(590, W, pp), ah = lerp(1049, H, pp), ar = lerp(44, 0, pp);
    X.save(); X.globalAlpha = 1 - pp; X.fillStyle = EMBER; X.beginPath(); X.arc(443, ay - 57, 9, 0, 7); X.fill();
    T(X, 'after', 466, ay - 30, { size: 86, font: 'ID8', track: -3, align: 'left', fill: INK, shadow: false }); X.restore();
    cardImg(X, OFF2, ax, ay, aw, ah, ar, .45 * (1 - pp));
    X.save(); X.globalAlpha = 1 - eo(inv(S.push - .05, S.push + .1, t));
    line(X, t, [tok('now', 40, 50), tok('watch', 41, 50), gold('this.', 42, 84)], ay + ah - 70, 1e9, ax + aw / 2); X.restore();
    return true;
  }
  if (t < S.mg1) { await premiumFrame(X, t, f, fr, premCam(t), ...premLayers(t)); return true; }
  if (t < S.mg2) { await sheetOver(t, f, fr, S.mg1, mgPrompt); return true; }
  if (t < S.pb) {                                      // card → card: horizontal push
    const p = eio(inv(S.mg2, S.mg2 + .45, t));
    if (p < 1) { X.save(); X.translate(-p * W, 0); mgPrompt(X, S.mg2 - .001); X.restore(); }
    X.save(); X.translate((1 - p) * W, 0); if (p < 1 && p > .05) X.filter = `blur(${(Math.sin(p * Math.PI) * 5).toFixed(1)}px)`; mgWorkflow(X, t); X.restore(); X.filter = 'none';
    return true;
  }
  if (t < S.mg3) { await sheetOff(t, f, fr, S.pb, mgWorkflow); return true; }
  if (t < S.pc) { await sheetOver(t, f, fr, S.mg3, mgSettings); return true; }
  if (t < S.end) { await sheetOff(t, f, fr, S.pc, mgSettings); return true; }
  // END CARD: a live loop of the premium shot (natural eye movement, never a frozen frame)
  { const s0 = Math.round(wt(44) * FPS), fe = Math.max(0, f - Math.round(S.end * FPS)), fx = D.frames[s0 + fe];
    await premiumFrame(OX2, t, f, fx, cam(1.12, 860), null, null); }
  await sheetOver(t, f, D.frames[Math.min(f, D.frames.length - 1)], S.end, endCard, 1, .45);
  return true;
};
let ENDIMG = null;
function endCard(ctx, t) {
  paperBG(ctx, P.paper2); const e0 = S.end;
  const k = eo(inv(e0 + .05, e0 + .4, t)); T(ctx, 'THE WORKFLOW', W / 2, 312, { size: 24, font: 'JB', track: 8, fill: EMBER, shadow: false, alpha: k });
  line(ctx, t, [tok('Vibe', null, 150, 'IS', EMBER, { t0: e0 + .1, shadow: false }), tok('Editing', null, 124, 'ID8', INK, { t0: e0 + .18, shadow: false })], 420);
  const a = spring(cl((t - e0 - .2) / .8)), cw = 340, ch = 604, cx = (W - cw) / 2, cy = 462 + (1 - a) * 260;
  ctx.save(); ctx.globalAlpha = cl(a * 1.4); cardImg(ctx, OFF2, cx, cy, cw, ch, 32, .45); ctx.restore();
  ctx.save(); ctx.globalAlpha = cl(a * 1.4); rrect(ctx, cx + 18, cy + 18, 104, 38, 19); ctx.fillStyle = 'rgba(17,15,14,.72)'; ctx.fill();
  ctx.fillStyle = EMBER; ctx.beginPath(); ctx.arc(cx + 38, cy + 37, 6, 0, 7); ctx.fill();
  T(ctx, 'after', cx + 52, cy + 45, { size: 22, font: 'ID6', align: 'left', fill: CREAM, shadow: false }); ctx.restore();
  const b = spring(cl((t - e0 - .45) / .6)), pulse = 1 + .025 * Math.pow(Math.sin(Math.PI * (t - e0 - .4) / 1.0), 8);
  ctx.save(); ctx.globalAlpha = cl(b * 1.5); ctx.translate(W / 2, 1140); ctx.scale(lerp(.7, 1, b) * pulse, lerp(.7, 1, b) * pulse);
  ctx.shadowColor = 'rgba(242,100,30,.4)'; ctx.shadowBlur = 40; rrect(ctx, -320, -50, 640, 100, 50); ctx.fillStyle = EMBER; ctx.fill(); ctx.shadowColor = 'transparent';
  T(ctx, 'Learn the workflow  →', 0, 15, { size: 42, font: 'ID8', track: -1, fill: INK, shadow: false }); ctx.restore();
  T(ctx, 'make videos nobody can tell are AI', W / 2, 1240, { size: 26, font: 'JM', fill: '#6F665F', shadow: false, alpha: cl((t - e0 - .7) / .3) });
}

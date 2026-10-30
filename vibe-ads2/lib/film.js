// Shot runner. The ad file sets window.AD = { shots, caption, grain, images, photos, music, overlay }.
// A shot: { at: seconds | [lineId, wordIndex, offset], tr: { type, d, ...opts }, sfx: [[name, offset, gain]], draw(c, t, gt, S) }
(function () {
const { W, H, clamp, win, IMG, loadImg, withFrames, grain } = U;
const T = window.T, AD = window.AD, { W_ } = FX2;
const cv = document.getElementById("cv"), c = cv.getContext("2d");
const layer = () => { const k = document.createElement("canvas"); k.width = W; k.height = H; return k; };
const LA = layer(), LB = layer();

const resolve = (at) => (typeof at === "number" ? at : W_(at[0], at[1] ?? 0, at[2] ?? 0));
const SH = AD.shots.map((s, i) => ({ ...s, i, start: i === 0 ? 0 : resolve(s.at) }));
SH.forEach((s, i) => { s.end = i < SH.length - 1 ? SH[i + 1].start : T.dur; s.dur = s.end - s.start; });

function drawShot(ctx, S, gt) {
  ctx.save(); S.draw(ctx, gt - S.start, gt, S); ctx.restore();
}
function onLayer(L, S, gt) {
  const x = L.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = "none"; x.globalCompositeOperation = "source-over";
  x.fillStyle = "#000"; x.fillRect(0, 0, W, H); drawShot(x, S, gt); return L;
}
function frame(gt) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.filter = "none"; c.globalCompositeOperation = "source-over";
  let i = SH.findIndex((s) => gt >= s.start && gt < s.end); if (i < 0) i = gt < 0 ? 0 : SH.length - 1;
  const S = SH[i], next = SH[i + 1];
  let A = null, B = null;
  if (S.tr && S.i > 0 && gt < S.start + S.tr.d / 2) { A = SH[i - 1]; B = S; }
  else if (next && next.tr && gt >= next.start - next.tr.d / 2) { A = S; B = next; }
  if (!A) { c.fillStyle = "#000"; c.fillRect(0, 0, W, H); drawShot(c, S, gt); }
  else {
    const tr = B.tr, e = win(B.start - tr.d / 2, B.start + tr.d / 2, gt);
    onLayer(LA, A, gt); onLayer(LB, B, gt);
    c.save(); FX2.transition(c, tr.type, LA, LB, e, tr, gt); c.restore();
  }
  if (AD.overlay) { c.save(); AD.overlay(c, gt); c.restore(); }
  if (AD.caption) K.captions(c, gt, AD.caption);
  grain(c, gt, AD.grain ?? 0.2);
}

// sound cues, for the mixer: shot sfx, word-timed sfx, and a default sound per transition
const TR_SFX = { warp: ["warp", 0.55], glitch: ["glitch", 0.55], flash: ["impact", 0.5], invert: ["glitch", 0.45], cloud: ["whoosh_soft", 0.6],
  split: ["snip", 0.9], whip: ["whoosh_fast", 0.6], slide: ["whoosh_fast", 0.45], blur: ["whoosh_soft", 0.4], zoom: ["whoosh_soft", 0.5] };
const ev = [];
SH.forEach((s) => {
  if (s.tr && s.i > 0 && s.tr.sfx !== false) { const d = TR_SFX[s.tr.type]; if (d) ev.push({ name: s.tr.sfx || d[0], at: s.start - s.tr.d / 2, gain: d[1] }); }
  (s.sfx || []).forEach(([name, off = 0, gain = 0.7]) => ev.push({ name, at: (Array.isArray(off) ? resolve(off) : s.start + off), gain }));
});
(AD.sfx || []).forEach(([name, at, gain = 0.7]) => ev.push({ name, at: resolve(at), gain }));
window.SFX_EVENTS = { music: AD.music || null, events: ev.filter((e) => e.at >= 0 && e.at < T.dur).sort((a, b) => a.at - b.at) };

window.FILM_INFO = { dur: T.dur, fps: T.fps, shots: SH.length };
window.renderAt = async (gt) => { await withFrames(() => frame(gt)); };
window.stageReady = (async () => {
  U.makeGrain();
  await Promise.all((AD.images || []).map(async (n) => {
    for (const ext of ["png", "jpg"]) { const im = await loadImg(`assets/img/${n}.${ext}`); if (im) { IMG[n] = im; break; } }
  }));
  await Promise.all((AD.photos || []).map(async (n) => { const im = await loadImg(`assets/img/${n}.jpg`); if (im) IMG["ph_" + n] = im; }));
  await Promise.all(Object.values(IMG).map((im) => (im && im.decode ? im.decode().catch(() => {}) : null)));
  await document.fonts.ready;
  await Promise.all(["400 40px Anton", "400 40px BebasNeue", "700 40px Oswald", "800 40px Playfair", "500 40px JBMono", "400 40px PermanentMarker",
    "700 40px Rubik", "900 40px ArchX9", "600 40px Caveat", "700 40px InterL", "600 40px InterL", "800 40px BodoniModa", "italic 600 40px BodoniModaI",
    "italic 500 40px PlayfairI", "700 40px Silkscreen", "400 40px ArchivoBlack"].map((f) => document.fonts.load(f)));
  await Promise.all(Object.entries(U.FAM).map(([l, f]) => document.fonts.load(`800 40px ${f}`, "अআஅఅઅਅಅഅଅA")));
})();
})();

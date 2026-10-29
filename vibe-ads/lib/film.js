// One ad on one timeline: background, scenes, transitions, captions, grain.
// The ad file sets window.AD = { bg, scenes, trans, caption, grain, images, photos }.
(function () {
const { W, H, clamp, lerp, win, ss, inOut, apple, rnd, IMG, loadImg, withFrames, grain } = U;
const T = window.T, AD = window.AD;
const cv = document.getElementById("cv"), c = cv.getContext("2d");
const layer = () => { const k = document.createElement("canvas"); k.width = W; k.height = H; return k; };
const LA = layer(), LB = layer();

function drawScene(ctx, S, gt, withBg) {
  if (withBg && AD.bg && SC(S).bg !== false) AD.bg(ctx, gt, S);
  SC(S).draw(ctx, gt - S.start, S, gt);
}
const SC = (S) => AD.scenes[S.name];
function onLayer(L, S, gt, withBg) {
  const x = L.getContext("2d");
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.globalAlpha = 1; x.filter = "none";
  drawScene(x, S, gt, withBg); return L;
}
// a torn-paper edge: jagged line across the frame, moving with p
function tornPath(ctx, p, seed, vertical) {
  const r = rnd(seed); ctx.beginPath();
  if (vertical) {
    const x0 = lerp(-120, W + 120, p); ctx.moveTo(-10, -10); ctx.lineTo(x0, -10);
    for (let y = 0; y <= H + 40; y += 40) ctx.lineTo(x0 + (r() - 0.5) * 50 + Math.sin(y / 140) * 30, y);
    ctx.lineTo(-10, H + 10);
  } else {
    const y0 = lerp(H + 120, -120, p); ctx.moveTo(-10, H + 10); ctx.lineTo(-10, y0);
    for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, y0 + (r() - 0.5) * 50 + Math.sin(x / 140) * 30);
    ctx.lineTo(W + 10, H + 10);
  }
  ctx.closePath();
}

function frame(gt) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.filter = "none"; c.globalCompositeOperation = "source-over";
  let idx = T.scenes.findIndex((s) => gt >= s.start && gt < s.start + s.dur);
  if (idx < 0) idx = gt < 0 ? 0 : T.scenes.length - 1;
  const S = T.scenes[idx], prev = T.scenes[idx - 1], next = T.scenes[idx + 1];
  const TR = AD.trans || {};
  let A = null, B = null, tr = null;
  if (prev && TR[prev.name] && gt < S.start + TR[prev.name].d / 2) { A = prev; B = S; tr = TR[prev.name]; }
  else if (next && TR[S.name] && gt >= next.start - TR[S.name].d / 2) { A = S; B = next; tr = TR[S.name]; }

  if (!tr) drawScene(c, S, gt, true);
  else {
    const e = win(B.start - tr.d / 2, B.start + tr.d / 2, gt), p = inOut(e);
    onLayer(LA, A, gt, true); onLayer(LB, B, gt, true);
    if (tr.type === "slide" || tr.type === "whip") {          // horizontal camera move; whip adds motion blur
      const dir = tr.dir || 1, bl = tr.type === "whip" ? Math.sin(Math.PI * p) * 26 : 0;
      c.save(); c.filter = bl ? `blur(${bl}px)` : "none";
      c.drawImage(LA, -dir * W * p, 0); c.drawImage(LB, dir * W * (1 - p), 0); c.restore();
    } else if (tr.type === "up") {                           // the next sheet slides up over this one
      c.drawImage(LA, 0, -H * 0.25 * p);
      c.save(); c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 40; c.shadowOffsetY = -10;
      c.drawImage(LB, 0, H * (1 - p)); c.restore();
    } else if (tr.type === "zoom") {                         // push through A into B
      const fx = tr.fx ?? W / 2, fy = tr.fy ?? H / 2;
      c.save(); c.translate(fx, fy); const sa = lerp(1, 2.6, p * p); c.scale(sa, sa); c.translate(-fx, -fy); c.drawImage(LA, 0, 0); c.restore();
      c.save(); c.globalAlpha = ss(0.35, 0.8, e); c.translate(W / 2, H / 2); const sb = lerp(0.88, 1, p); c.scale(sb, sb); c.translate(-W / 2, -H / 2);
      c.drawImage(LB, 0, 0); c.restore();
    } else if (tr.type === "tear") {                          // torn-paper wipe: B is revealed behind a ripped edge
      c.drawImage(LA, 0, 0);
      c.save(); tornPath(c, p, 7, !tr.horizontal); c.clip(); c.drawImage(LB, 0, 0); c.restore();
      c.save(); tornPath(c, p, 7, !tr.horizontal); c.strokeStyle = "rgba(255,255,255,.95)"; c.lineWidth = 16;
      c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 18; c.stroke(); c.restore();
    } else {                                                  // crossfade
      c.drawImage(LA, 0, 0); c.save(); c.globalAlpha = p; c.drawImage(LB, 0, 0); c.restore();
    }
  }
  if (AD.overlay) AD.overlay(c, gt);
  if (AD.caption) K.captions(c, gt, AD.caption);
  grain(c, gt, AD.grain ?? 0.22);
}

window.FILM_INFO = { dur: T.dur, fps: T.fps };
window.renderAt = async (gt) => { await withFrames(() => frame(gt)); };
window.stageReady = (async () => {
  U.makeGrain();
  await Promise.all((AD.images || []).map(async (n) => {
    for (const ext of ["png", "jpg"]) { const im = await loadImg(`assets/img/${n}.${ext}`); if (im) { IMG[n] = im; break; } }
  }));
  await Promise.all((AD.photos || []).map(async (n) => { const im = await loadImg(`assets/img/${n}.jpg`); if (im) IMG["ph_" + n] = im; }));
  await document.fonts.ready;
  await Promise.all(["400 40px Anton", "400 40px BebasNeue", "700 40px Oswald", "800 40px Playfair", "700 40px SpaceGrotesk", "500 40px JBMono",
    "400 40px PermanentMarker", "700 40px Rubik", "500 40px Rubik", "900 40px ArchX9", "600 40px Caveat", "700 40px InterL", "600 40px InterL"].map((f) => document.fonts.load(f)));
  await Promise.all(Object.entries(U.FAM).map(([l, f]) => document.fonts.load(`800 40px ${f}`, "अআஅఅઅਅಅഅଅA")));
  if (AD.init) await AD.init();
})();
})();

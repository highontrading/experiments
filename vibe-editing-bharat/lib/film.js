// Puts the scenes on one timeline: shared sky, transitions between scenes,
// the timeline tracker docked at the top, and film grain over everything.
(function () {
const { W, H, clamp, lerp, win, ss, inOut, apple, IMG, loadImg, withFrames, sky, grain } = U;
const T = window.T, SCENES = window.SCENES, { SC, LANGS, drawLine } = window.FILMX;
const cv = document.getElementById("cv"), c = cv.getContext("2d");
const layer = () => { const k = document.createElement("canvas"); k.width = W; k.height = H; return k; };
const LA = layer(), LB = layer();

// transitions, keyed by the scene they leave; centred on the cut
const TRANS = { hi: { type: "slide", d: 0.9 }, bn: { type: "tilt", d: 1.0 }, mr: { type: "dissolve", d: 0.9 }, te: { type: "push", d: 1.1 } };

function drawScene(ctx, S, gt, withSky) {
  if (SCENES[S.name].sky && withSky) sky(ctx, gt);
  SCENES[S.name].draw(ctx, gt - S.start, S, gt);
}
function onLayer(L, S, gt, withSky) {
  const x = L.getContext("2d");
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.globalAlpha = 1; x.filter = "none";
  drawScene(x, S, gt, withSky); return L;
}

function frame(gt) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.filter = "none"; c.globalCompositeOperation = "source-over";
  const i = Math.max(0, T.scenes.findIndex((s) => gt >= s.start && gt < s.start + s.dur));
  const idx = gt >= T.dur ? T.scenes.length - 1 : i;
  const S = T.scenes[idx];
  // are we inside a transition window?
  let A = null, B = null, tr = null;
  const prev = T.scenes[idx - 1], next = T.scenes[idx + 1];
  if (prev && TRANS[prev.name] && gt < S.start + TRANS[prev.name].d / 2) { A = prev; B = S; tr = TRANS[prev.name]; }
  else if (next && TRANS[S.name] && gt >= next.start - TRANS[S.name].d / 2) { A = S; B = next; tr = TRANS[S.name]; }

  if (!tr) {
    drawScene(c, S, gt, true);
  } else {
    const e = win(B.start - tr.d / 2, B.start + tr.d / 2, gt);
    if (tr.type === "slide") {                        // both over the same sky: foregrounds glide past
      sky(c, gt);
      const p = inOut(e);
      onLayer(LA, A, gt, false); onLayer(LB, B, gt, false);
      c.save(); c.globalAlpha = 1 - p * 0.6; c.translate(-W * 0.85 * p, 0); c.drawImage(LA, 0, 0); c.restore();
      c.save(); c.translate(W * (1 - p), 0); c.drawImage(LB, 0, 0); c.restore();
    } else if (tr.type === "tilt") {                  // camera tilts down: the far sky barely moves, the ground rises into frame
      const p = inOut(e);
      sky(c, gt, { dy: -110 * Math.sin(Math.PI * p) });     // drifts and settles back, so nothing jumps at either end
      onLayer(LA, A, gt, false); onLayer(LB, B, gt, false);
      c.drawImage(LA, 0, -H * 0.6 * p);
      c.drawImage(LB, 0, H * 0.6 * (1 - p));
    } else if (tr.type === "dissolve") {              // soft zoom-dissolve with a breath of blur
      const p = inOut(e), bl = Math.sin(Math.PI * p) * 10;
      onLayer(LA, A, gt, true); onLayer(LB, B, gt, true);
      c.save(); c.filter = `blur(${bl}px)`;
      const sb = lerp(0.94, 1, p); c.translate(W / 2, H / 2); c.scale(sb, sb); c.translate(-W / 2, -H / 2);
      c.drawImage(LB, 0, 0); c.restore();
      c.save(); c.filter = `blur(${bl}px)`; c.globalAlpha = 1 - p;
      const sa = lerp(1, 1.1, p); c.translate(W / 2, H / 2); c.scale(sa, sa); c.translate(-W / 2, -H / 2);
      c.drawImage(LA, 0, 0); c.restore();
    } else if (tr.type === "push") {                  // fly through the blue window into the next scene
      const r = SCENES[A.name].blue, gl = SCENES[A.name].glass(r);
      const p = inOut(e);
      const sMax = Math.max(W / gl.w, H / gl.h) * 1.2;
      const s = Math.exp(Math.log(sMax) * p);
      const cx = lerp(r.x, W / 2, p), cy = lerp(r.y, H / 2, p);
      onLayer(LA, A, gt, true); onLayer(LB, B, gt, true);
      c.save(); c.translate(cx, cy); c.scale(s, s); c.translate(-r.x, -r.y); c.drawImage(LA, 0, 0); c.restore();
      // B shows through the window's glass and grows with it
      c.save();
      c.translate(cx, cy); c.scale(s, s); c.translate(-r.x, -r.y);
      c.beginPath(); c.rect(gl.x, gl.y, gl.w, gl.h); c.clip();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = ss(0.0, 0.35, p);
      c.drawImage(LB, 0, 0); c.restore();
    }
  }
  // the timeline tracker, docked at the top from Hindi until the reel takes the prints
  const t0 = SC.hi.start, reel = SC.reel;
  if (gt >= t0 && gt < reel.start + 1.0) {
    const fills = LANGS.map((l) => (gt >= SC[l].start + SC[l].dur - 0.45 ? 1 : 0));
    const lift = apple(win(reel.start + 0.1, reel.start + 0.9, gt));
    if (gt >= reel.start) drawLine(c, 1, gt, { fills: fills.map(() => 0), lift, drop: () => 0 });
    else drawLine(c, 1, gt, { fills });
  }
  grain(c, gt, 0.3);
}

window.FILM_INFO = { dur: T.dur, fps: T.fps };
window.renderAt = async (gt) => { await withFrames(() => frame(gt)); };
window.stageReady = (async () => {
  U.makeGrain();
  const names = ["grass", "clouds_1", "cut_rope", "peg_1", "peg_2", "cut_bow_1", "cut_tram_2", "cut_train_2", "cut_auto",
    "cut_kite_1", "cut_kite_2", "cut_kite_3", "cut_kite_4", "cut_kite_5",
    ...["wood", "red", "blue"].flatMap((k) => [`cut_window_${k}_shutter_l`, `cut_window_${k}_shutter_r`]), "cut_window_wood_frame", "cut_window_red_frame"];
  await Promise.all(["tram", "marina", "kites"].map(async (n) => { IMG["ph_" + n] = await loadImg(`assets/img/${n}.jpg`); }));
  await Promise.all(names.map(async (n) => {
    for (const ext of ["png", "jpg"]) { const im = await loadImg(`assets/img/${n}.${ext}`); if (im) { IMG[n] = im; break; } }
  }));
  await document.fonts.ready;
  // make sure every script's font is actually loaded before the first frame
  await Promise.all(Object.entries(U.FAM).map(([l, f]) => document.fonts.load(`800 40px ${f}`, "अআஅఅઅਅಅഅଅA")));
  await Promise.all(["900 40px ArchX9", "800 40px ArchX", "600 40px Caveat", "700 40px InterL", "600 40px InterL"].map((f) => document.fonts.load(f)));
})();
})();

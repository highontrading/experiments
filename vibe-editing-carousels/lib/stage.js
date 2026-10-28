// The slide: grainy sky, cards held by hands, the Notes card on top.
// window.renderAt(t) draws slide window.SLIDE of carousel window.CAROUSEL at time t.
(function () {
const { clamp, lerp, win, ss, outCubic, inCubic, spring, rnd, rr, F, wrap, txt } = U;
const W = 1080, H = 1350, FPS = 30;
const cv = document.getElementById("cv");
const c = cv.getContext("2d");

const params = new URLSearchParams(location.search);
const CAR = window.CAROUSEL;
const IDX = +(params.get("s") || 1) - 1;
const SL = CAR.slides[IDX];
const D = SL.dur || CAR.dur || 5;
window.SLIDE_INFO = { dur: D, fps: FPS, count: CAR.slides.length };

const img = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
const IMG = {};

// ------------------------------------------------------------------ grain --
const GRAIN = [];
function makeGrain() {
  const r = rnd(11);
  for (let k = 0; k < 6; k++) {
    const g = document.createElement("canvas"); g.width = W / 2; g.height = H / 2;
    const x = g.getContext("2d"), d = x.createImageData(g.width, g.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (r() + r() + r() - 1.5) * 78;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0); GRAIN.push(g);
  }
}
function grain(t, alpha) {
  c.save();
  c.globalCompositeOperation = "overlay"; c.globalAlpha = alpha;
  c.imageSmoothingEnabled = true;
  c.drawImage(GRAIN[Math.floor(t * FPS) % GRAIN.length], 0, 0, W, H);
  c.restore();
}

// -------------------------------------------------------------------- sky --
function sky(t) {
  const u = (2 * Math.PI * t) / D;
  const S = IMG.sky, k = 1.0 + 0.012 * Math.sin(u);
  const sw = S.width * k, sh = S.height * k;
  c.drawImage(S, (W - sw) / 2 + 26 * Math.sin(u), (H - sh) / 2 + 14 * Math.cos(u), sw, sh);
  grain(t, 0.45);
}

// ------------------------------------------------------------------ items --
// An item is a card held by one or more hands (or a free card, or a pointing hand).
const EDGE = {
  left: (w, h, a) => [0, a * h, 0],
  right: (w, h, a) => [w, a * h, Math.PI],
  top: (w, h, a) => [a * w, 0, Math.PI / 2],
  bottom: (w, h, a) => [a * w, h, -Math.PI / 2],
};
// world direction from which the item flies in: away from its first hand
function inDir(it) {
  if (it.from) return it.from;
  if (it.kind === "tap") { const a = (it.ang ?? 90) * Math.PI / 180; return [-Math.cos(a), -Math.sin(a)]; }
  const hd = (it.hands || [])[0];
  if (!hd) return [it.x < W / 2 ? -1 : 1, 0];
  const a = EDGE[hd.edge](1, 1, 0)[2] + (it.rot || 0) * Math.PI / 180;
  return [-Math.cos(a), -Math.sin(a)];
}
function pose(it, t, i) {
  const inAt = it.inAt ?? 0.06 + i * 0.07;
  const e = spring(t, inAt, 0.8);
  const outAt = D - 0.34 + (it.outLag || 0);
  const o = inCubic(win(outAt, D, t));
  const [dx, dy] = inDir(it);
  const dist = 900;
  const off = (1 - e) * dist + o * dist;
  const u = (2 * Math.PI * t) / D, ph = i * 1.7;
  return {
    x: it.x + dx * off + (it.float ?? 1) * 6 * Math.sin(u + ph),
    y: it.y + dy * off + (it.float ?? 1) * 8 * Math.sin(2 * u + ph),
    rot: ((it.rot || 0) + (it.float ?? 1) * 1.2 * Math.sin(u + ph + 1)) * Math.PI / 180,
    vis: t >= inAt - 0.01,
  };
}
function handSprite(hd, it) {
  const [, , a] = EDGE[hd.edge](1, 1, 0);
  const rot = a + (hd.ang || 0) * Math.PI / 180 + (it.rot || 0) * Math.PI / 180;
  return HANDS.make(hd.grip || "thumb", { rot: Math.round(rot * 20) / 20, flip: !!hd.flip, scale: hd.scale || 1.15 });
}
function drawHand(it, w, h, layerName) {
  for (const hd of it.hands || []) {
    const sp = handSprite(hd, it);
    const [hx, hy, a] = EDGE[hd.edge](w, h, hd.at ?? 0.5);
    c.save();
    c.translate(hx + (hd.dx || 0), hy + (hd.dy || 0));
    c.rotate(a + (hd.ang || 0) * Math.PI / 180);
    c.translate(-(hd.out ?? ((hd.grip || "thumb") === "fingers" ? 48 : 12)), 0);   // how far the grip reaches in
    if (layerName === "front") {
      c.shadowColor = "rgba(70,35,15,.35)"; c.shadowBlur = 18; c.shadowOffsetX = 7; c.shadowOffsetY = 12;
    }
    c.drawImage(sp[layerName], -sp.ox, -sp.oy);
    c.restore();
  }
}
function drawItem(it, t, i) {
  const P = pose(it, t, i);
  if (!P.vis) return;
  if (it.kind === "tap") return drawTap(it, t, P);
  const { w, h } = it;
  c.save();
  c.translate(P.x, P.y); c.rotate(P.rot); c.translate(-w / 2, -h / 2);
  drawHand(it, w, h, "back");
  c.save();
  c.shadowColor = "rgba(25,40,70,.32)"; c.shadowBlur = 34; c.shadowOffsetY = 14;
  rr(c, 0, 0, w, h, it.radius ?? 16); c.fillStyle = "#fff"; c.fill();
  c.restore();
  c.save();
  rr(c, 0, 0, w, h, it.radius ?? 16); c.clip();
  CARDS[it.kind](c, w, h, t, it.p || {}, { D, IMG });
  c.restore();
  drawHand(it, w, h, "front");
  c.restore();
}
// A pointing hand that presses at it.taps (seconds). Its fingertip sits at (x, y).
function drawTap(it, t, P) {
  const ang = (it.ang ?? 90) * Math.PI / 180;
  let lift = 1;
  for (const at of it.taps || []) {
    const d = t - at;
    if (d > -0.22 && d < 0.3) lift = Math.min(lift, d < 0 ? -d / 0.22 : d / 0.3);
  }
  lift = U.smooth(lift);
  const back = 70 * lift;
  const sp = HANDS.make("point", { rot: Math.round(ang * 20) / 20, flip: !!it.flip, scale: it.scale || 1.15 });
  c.save();
  c.translate(P.x - Math.cos(ang) * back, P.y - Math.sin(ang) * back);
  c.rotate(ang);
  const sc = 1 + 0.04 * lift;
  c.scale(sc, sc);
  c.shadowColor = "rgba(40,30,30,.3)"; c.shadowBlur = 16 + 26 * lift;
  c.shadowOffsetX = 6 + 20 * lift; c.shadowOffsetY = 10 + 26 * lift;
  c.drawImage(sp.front, -sp.ox, -sp.oy);
  c.restore();
  // press ripple
  for (const at of it.taps || []) {
    const d = t - at;
    if (d >= 0 && d < 0.5) {
      c.save(); c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - d / 0.5)})`; c.lineWidth = 4;
      c.beginPath(); c.arc(P.x, P.y, 14 + d * 120, 0, 7); c.stroke(); c.restore();
    }
  }
}

// ------------------------------------------------------------ Notes card --
const GOLD = "#b8862b";
function notesLayout(N) {
  const w = N.w || 820, pad = 40, iw = w - pad * 2;
  const ops = [];
  let y = 34;
  ops.push({ k: "header", y }); y += 58;
  if (N.kicker) { ops.push({ k: "kicker", y: y + 22, s: N.kicker }); y += 44; }
  const ts = N.size || 66;
  c.font = F.title(ts);
  const tl = wrap(c, N.title.toUpperCase(), iw);
  for (const l of tl) { y += ts * 1.0; ops.push({ k: "title", y, s: l, ts }); }
  y += 8;
  if (N.body) {
    const bs = N.bodySize || 31;
    c.font = F.ui(bs, 500);
    for (const l of wrap(c, N.body, iw)) { y += bs * 1.3; ops.push({ k: "body", y, s: l, bs }); }
  }
  if (N.pills) { y += 22; ops.push({ k: "pills", y, list: N.pills }); y += 64 * Math.ceil(N.pills.length / (N.pillsPerRow || 3)); }
  if (N.checklist) {
    y += 16;
    N.checklist.forEach((s, i) => { y += 58; ops.push({ k: "check", y, s, i }); });
    y += 6;
  }
  y += 36;
  return { w, h: y, pad, ops };
}
function drawNotes(N, t) {
  const L = notesLayout(N);
  const x = N.x ?? W / 2, y = N.y ?? 690;
  const pop = N.popIn ? spring(t, 0, 0.6) : 1;
  c.save();
  c.translate(x, y); c.rotate((N.rot ?? -3) * Math.PI / 180);
  c.scale(lerp(0.9, 1, pop), lerp(0.9, 1, pop));
  c.translate(-L.w / 2, -L.h / 2);
  c.save();
  c.shadowColor = "rgba(20,40,80,.30)"; c.shadowBlur = 44; c.shadowOffsetY = 18;
  rr(c, 0, 0, L.w, L.h, 30); c.fillStyle = "#ffffff"; c.fill();
  c.restore();
  const p = L.pad;
  for (const op of L.ops) {
    if (op.k === "header") {
      c.strokeStyle = GOLD; c.lineWidth = 3.4; c.lineCap = c.lineJoin = "round";
      c.beginPath(); c.moveTo(p + 10, op.y); c.lineTo(p, op.y + 11); c.lineTo(p + 10, op.y + 22); c.stroke();
      txt(c, "Notes", p + 22, op.y + 21, F.ui(27, 500), GOLD);
      c.font = F.ui(27, 700);
      const dw = c.measureText("Done").width;
      txt(c, "Done", L.w - p, op.y + 21, F.ui(27, 700), GOLD, "right");
      const cx = L.w - p - dw - 28;
      c.beginPath(); c.arc(cx, op.y + 12, 16, 0, 7); c.lineWidth = 2.6; c.stroke();
      c.fillStyle = GOLD;
      for (const d of [-6.5, 0, 6.5]) { c.beginPath(); c.arc(cx + d, op.y + 12, 2.1, 0, 7); c.fill(); }
      if (N.counter !== false) {
        txt(c, `${IDX + 1}/${CAR.slides.length}`, L.w / 2, op.y + 21, F.ui(22, 600), "#a5a5ab", "center");
      }
    } else if (op.k === "kicker") {
      c.letterSpacing = "3px";
      txt(c, op.s.toUpperCase(), p, op.y, F.ui(22, 700), GOLD);
      c.letterSpacing = "0px";
    } else if (op.k === "title") {
      txt(c, op.s, p - 2, op.y, F.title(op.ts), "#0b0b0c");
    } else if (op.k === "body") {
      txt(c, op.s, p, op.y, F.ui(op.bs, 500), "#1d1d1f");
    } else if (op.k === "pills") {
      const per = N.pillsPerRow || 3, gap = 12, pw = (L.w - p * 2 - gap * (per - 1)) / per;
      op.list.forEach((s, i) => {
        const at = (N.pillsAt ?? 0.9) + i * (N.pillsGap ?? 0.45);
        const on = ss(at, at + 0.2, t), bump = U.pulse(t, at, 7);
        const px = p + (i % per) * (pw + gap), py = op.y + Math.floor(i / per) * 64;
        c.save(); c.translate(px + pw / 2, py + 26); c.scale(1 + 0.08 * bump, 1 + 0.08 * bump);
        rr(c, -pw / 2, -26, pw, 52, 26);
        c.fillStyle = on > 0.5 ? "#ffc93c" : "#f2f2f4"; c.fill();
        c.strokeStyle = on > 0.5 ? "#e0a600" : "#e2e2e6"; c.lineWidth = 2; c.stroke();
        txt(c, s, 0, 9, F.ui(23, 700), on > 0.5 ? "#2a1d00" : "#8e8e93", "center");
        c.restore();
      });
    } else if (op.k === "check") {
      const at = (N.checkAt ?? 0.9) + op.i * (N.checkGap ?? 0.5);
      const on = win(at, at + 0.25, t), bump = U.pulse(t, at, 8);
      const cy = op.y - 12;
      c.save(); c.translate(p + 18, cy); c.scale(1 + 0.25 * bump, 1 + 0.25 * bump);
      c.beginPath(); c.arc(0, 0, 18, 0, 7);
      if (on > 0) { c.fillStyle = "#e9b330"; c.fill(); U.icon.check(c, 0, 1, 22, "#fff", 3.4, on); }
      else { c.strokeStyle = "#c7c7cc"; c.lineWidth = 2.6; c.stroke(); }
      c.restore();
      txt(c, op.s, p + 54, op.y, F.ui(31, on > 0 ? 600 : 500), "#1d1d1f");
    }
  }
  c.restore();
}

// ---------------------------------------------------------------- render --
window.renderAt = function (t) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  sky(t);
  const items = SL.items || [];
  items.forEach((it, i) => { if (!it.over) drawItem(it, t, i); });
  drawNotes(SL.notes, t);
  items.forEach((it, i) => { if (it.over) drawItem(it, t, i); });
  grain(t, 0.12);
};

window.stageReady = (async () => {
  await Promise.all([
    document.fonts.load(F.title(60)), document.fonts.load(F.title(60, 900)),
    document.fonts.load(F.ui(30, 500)), document.fonts.load(F.ui(30, 600)),
    document.fonts.load(F.ui(30, 700)), document.fonts.load(F.ui(30, 800)), document.fonts.load(F.hand(30)),
  ]);
  IMG.sky = await img("assets/img/sky.jpg");
  IMG.pack = await img("assets/img/pack-1.png");
  makeGrain();
  return true;
})();
})();

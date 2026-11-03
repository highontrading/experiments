// Carousel 17: Transitions That Don't Look Cheap.
// Design system: Y2K chrome. A slowly turning holographic gradient, chrome Archivo Expanded
// type with a dark outline, glossy pill buttons, four-point sparkles, and rounded "device"
// windows where real clips play each transition live.
(function () {
const { clamp, lerp, win, outBack, outCubic, inOut, pulse, rnd, rr } = U;
const INK = "#1f2230", LILAC = "#b9a7ff";
const BODY = (size, o = {}) => ({ family: "Lexend", size, weight: 400, color: INK, ...o });

let HOLO = null;
function paintHolo() {
  return K.once(1500, 1500, (c, W, H) => {
    const blobs = [["#ffd1f3", 0.2, 0.2], ["#c8f7ff", 0.8, 0.25], ["#d9ccff", 0.5, 0.55], ["#fff4c2", 0.15, 0.8], ["#bff5dd", 0.85, 0.8], ["#ffc9e6", 0.55, 0.95]];
    c.fillStyle = "#eef0ff"; c.fillRect(0, 0, W, H);
    c.filter = "blur(90px)";
    for (const [col, x, y] of blobs) { c.fillStyle = col; c.beginPath(); c.arc(x * W, y * H, 420, 0, 7); c.fill(); }
    c.filter = "none";
  });
}
function holo(c, t) {
  c.save(); c.translate(K.W / 2, K.H / 2); c.rotate(t * 0.08); c.drawImage(HOLO, -750, -750); c.restore();
  const r = rnd(4);
  for (let i = 0; i < 14; i++) {
    const x = r() * K.W, y = r() * K.H, s = 8 + r() * 18, tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
    sparkle(c, x, y, s * (0.6 + 0.6 * tw), `rgba(255,255,255,${0.5 + 0.5 * tw})`);
  }
}
function sparkle(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.fillStyle = col;
  c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(0, 0, s, 0); c.quadraticCurveTo(0, 0, 0, s); c.quadraticCurveTo(0, 0, -s, 0); c.quadraticCurveTo(0, 0, 0, -s); c.fill();
  c.restore();
}
// Chrome text: dark outline, metallic gradient fill, a thin highlight.
function chrome(c, s, x, y, size, o = {}) {
  const f = { family: "ArchX9", size, weight: 900, track: -size * 0.02, align: o.align || "left" };
  K.text(c, s, x, y, { ...f, color: INK, stroke: INK, strokeW: size * 0.09 });
  const g = c.createLinearGradient(0, y - size * 0.85, 0, y + size * 0.1);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.35, "#c9d1de"); g.addColorStop(0.5, "#6f7a8c"); g.addColorStop(0.62, "#eef3fa"); g.addColorStop(1, "#a7b0c0");
  K.text(c, s, x, y, { ...f, color: g });
}
function pill(c, s, o = {}) {
  const f = BODY(o.size || 30, { weight: 800, color: o.ink || INK });
  const w = K.measure(c, s, f) + 60, h = (o.size || 30) * 2;
  c.save(); c.shadowColor = "rgba(80,60,160,.35)"; c.shadowBlur = 20; c.shadowOffsetY = 8;
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, o.top || "#ffffff"); g.addColorStop(1, o.bottom || "#dcd3ff");
  rr(c, -w / 2, -h / 2, w, h, h / 2); c.fillStyle = g; c.fill(); c.restore();
  c.strokeStyle = "rgba(31,34,48,.85)"; c.lineWidth = 3; rr(c, -w / 2, -h / 2, w, h, h / 2); c.stroke();
  c.fillStyle = "rgba(255,255,255,.7)"; rr(c, -w / 2 + 14, -h / 2 + 6, w - 28, h * 0.32, h * 0.16); c.fill();
  K.text(c, s, 0, (o.size || 30) * 0.36, { ...f, align: "center" });
  return w;
}
// A rounded device window with a chrome bezel; paint(c, w, h) fills the screen.
function device(c, w, h, paint, label) {
  c.save(); c.shadowColor = "rgba(60,40,140,.35)"; c.shadowBlur = 40; c.shadowOffsetY = 18;
  const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.5, "#b8c0cf"); g.addColorStop(1, "#f4f6fb");
  rr(c, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 46); c.fillStyle = g; c.fill(); c.restore();
  c.strokeStyle = INK; c.lineWidth = 3; rr(c, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 46); c.stroke();
  c.save(); rr(c, -w / 2, -h / 2, w, h, 32); c.clip(); c.translate(-w / 2, -h / 2); paint(c, w, h); c.restore();
  if (label) { c.save(); c.translate(0, h / 2 + 16); pill(c, label, { size: 24 }); c.restore(); }
}
// Live transition demos. Each loops every 2.5 s: clip A, the transition at 1.25 s, clip B.
const CYCLE = 2.5, AT = 1.25;
function demo(kind, A, B, fa = 0.5, fb = 0.5) {
  return (c, w, h) => {
    const t = FOOTAGE.now, lt = ((t % CYCLE) + CYCLE) % CYCLE, u = (lt - AT) / 0.4;
    const show = (clip, focus, off = 0) => FOOTAGE.drawFootage(c, clip, 0, w, h, "raw", focus, off);
    if (kind === "match") {
      const k = 1 + 0.12 * clamp(1 - Math.abs(u - 0.5) * 2);
      c.save(); c.translate(w / 2, h / 2); c.scale(k, k); c.translate(-w / 2, -h / 2);
      lt < AT ? show(A, fa) : show(B, fb); c.restore();
      const f = pulse(lt, AT, 10); if (f > 0.03) { c.fillStyle = `rgba(255,255,255,${0.5 * f})`; c.fillRect(0, 0, w, h); }
    } else if (kind === "whip") {
      const p = clamp(u), e = inOut(p);
      c.save(); c.filter = `blur(${Math.sin(p * Math.PI) * 26}px)`;
      c.save(); c.translate(-w * e, 0); show(A, fa); c.restore();
      c.save(); c.translate(w * (1 - e), 0); show(B, fb); c.restore();
      c.restore();
    } else if (kind === "mask") {
      show(A, fa);
      const p = outCubic(clamp(u * 0.8));
      if (p > 0) { c.save(); c.beginPath(); c.arc(w * 0.5, h * 0.55, Math.hypot(w, h) * p, 0, 7); c.clip(); show(B, fb); c.restore(); }
    } else if (kind === "ramp") {
      // speed: 1x, ramps to 4x around the cut, back to 1x
      const sp = (x) => 1 + 3 * Math.exp(-Math.pow((x - AT) / 0.25, 2));
      let T = 0; for (let x = 0; x < lt; x += 1 / 30) T += sp(x) / 30;
      lt < AT ? show(A, fa, T - t) : show(B, fb, T - t);
    }
  };
}
function speedGraph(c, w, h, t) {
  const lt = ((t % CYCLE) + CYCLE) % CYCLE;
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath();
  for (let i = 0; i <= 100; i++) { const x = (i / 100) * CYCLE, v = 1 + 3 * Math.exp(-Math.pow((x - AT) / 0.25, 2)); const px = -w / 2 + (i / 100) * w, py = h / 2 - (v - 1) / 3 * h; i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.stroke();
  const px = -w / 2 + (lt / CYCLE) * w; c.fillStyle = "#ff4fb4"; c.beginPath(); c.arc(px, h / 2 - (1 + 3 * Math.exp(-Math.pow((lt - AT) / 0.25, 2)) - 1) / 3 * h, 12, 0, 7); c.fill();
  K.text(c, "1x", -w / 2 - 14, h / 2 + 8, BODY(22, { align: "right", weight: 800 })); K.text(c, "4x", -w / 2 - 14, -h / 2 + 8, BODY(22, { align: "right", weight: 800 }));
}
const el = (x, y, draw, at = 0.1, inn = "fade", o = {}) => ({ x, y, in: inn, at, draw, ...o });
function step(n, name, line, prompt, kind, A, B, fa, fb) {
  return [
    el(210, 170, (c) => pill(c, `TRANSITION 0${n}`, { size: 24 }), 0.05, "down"),
    el(70, 330, (c) => chrome(c, name, 0, 0, 104), 0.15, "left"),
    el(70, 400, (c) => K.text(c, line, 0, 0, BODY(34, { maxW: 940, lh: 1.3 })), 0.3),
    el(K.W / 2, 830, (c, t) => device(c, 600, 640, demo(kind, A, B, fa, fb)), 0.3, "up", { far: 0.6, float: 1 }),
    el(K.W / 2, 1240, (c, t) => pill(c, prompt, { size: 26, bottom: "#ffd1f3" }), 0.7, "up", { far: 0.3 }),
  ];
}

// ----------------------------------------------------------------- slides --
const D = 5;
window.CAROUSEL = {
  kit: true,
  title: "Transitions That Don't Look Cheap",
  dur: D,
  setup: () => { HOLO = paintHolo(); },
  bg: holo,
  fg: (c, t) => K.grain(c, t, 0.05),
  slides: [
    // 1 · Hook
    { els: [
      el(K.W / 2, 150, (c) => pill(c, "vibe editing ✦ transitions", { size: 26 }), 0.05, "down"),
      el(K.W / 2, 330, (c) => chrome(c, "YOUR", 0, 0, 150, { align: "center" }), 0.15, "pop"),
      el(K.W / 2, 480, (c) => chrome(c, "TRANSITIONS", 0, 0, 98, { align: "center" }), 0.25, "pop"),
      el(K.W / 2, 620, (c) => chrome(c, "SCREAM 2012", 0, 0, 98, { align: "center" }), 0.35, "pop"),
      ...[["star wipe", -12], ["cube spin", 6], ["page curl", -5]].map(([s, r], i) => el(200 + i * 340, 760, (c, t) => {
        const w = pill(c, s, { size: 30, bottom: "#e9e9ee" });
        const u = outCubic(win(1.2 + i * 0.25, 1.5 + i * 0.25, t));
        c.strokeStyle = "#ff3b6b"; c.lineWidth = 6; c.beginPath(); c.moveTo(-w / 2 - 10, 0); c.lineTo(-w / 2 - 10 + (w + 20) * u, 0); c.stroke();
      }, 0.6 + i * 0.1, "pop", { rot: r })),
      el(K.W / 2, 1060, (c, t) => device(c, 520, 340, demo("whip", "skate_road", "neon_biker", 0.5, 0.5)), 0.5, "up", { far: 0.6, float: 1 }),
      el(K.W / 2, 1290, (c) => K.text(c, "4 that feel expensive → swipe", 0, 0, BODY(32, { align: "center", weight: 800 })), 1.4),
    ] },
    // 2-5 · The four transitions
    { els: step(1, "MATCH CUT", "Cut on matching motion: a foot lands, the next shot lands too.", "\"cut where the motion matches\"", "match", "skate_feet", "running_track", 0.5, 0.5) },
    { els: step(2, "WHIP PAN", "A fast blur carries one shot into the next. Hides any jump.", "\"add whip pans between locations\"", "whip", "times_square", "tokyo_train", 0.5, 0.5) },
    { els: step(3, "MASK WIPE", "The next scene opens through a shape. Great for reveals.", "\"reveal the product with a mask wipe\"", "mask", "product_shoot", "watch_close", 0.5, 0.5) },
    { els: [
      ...step(4, "SPEED RAMP", "Slow, then a burst of speed into the cut, then slow again.", "\"ramp speed into every cut\"", "ramp", "skate_park", "skate_road", 0.5, 0.5).slice(0, 4),
      el(K.W / 2, 1230, (c, t) => speedGraph(c, 520, 110, t), 0.7, "up", { far: 0.3 }),
    ] },
    // 6 · CTA
    { els: [
      el(K.W / 2, 150, (c) => pill(c, "save this ✦ use it tonight", { size: 26 }), 0.05, "down"),
      el(K.W / 2, 360, (c) => chrome(c, "COMMENT", 0, 0, 130, { align: "center" }), 0.15, "pop"),
      el(K.W / 2, 540, (c, t) => { const e = 1 + 0.03 * Math.sin(t * 5); c.scale(e, e); chrome(c, "\"VIBE\"", 0, 0, 170, { align: "center" }); }, 0.25, "pop"),
      el(K.W / 2, 640, (c) => K.text(c, "for the free prompt pack: all 4 transition prompts inside", 0, 0, BODY(32, { align: "center" })), 0.4),
      ...[["MATCH CUT", "match", "skate_feet", "running_track"], ["WHIP PAN", "whip", "times_square", "tokyo_train"], ["MASK WIPE", "mask", "product_shoot", "watch_close"], ["SPEED RAMP", "ramp", "skate_park", "skate_road"]].map(([n, k, A, B], i) =>
        el(160 + i * 253, 920, (c, t) => device(c, 200, 300, demo(k, A, B), n.toLowerCase()), 0.5 + i * 0.12, "up", { far: 0.6, float: 1, rot: [-4, 2, -2, 4][i] })),
      el(K.W / 2, 1240, (c) => pill(c, "follow for more ✦", { size: 30, bottom: "#c8f7ff" }), 1.0, "pop"),
    ] },
  ],
};
})();

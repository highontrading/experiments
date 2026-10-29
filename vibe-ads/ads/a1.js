// Ad 1 · "Timeline ka Jaal" — design system 1: crumpled white paper, engraved B&W cut-outs,
// red octopus tentacles, soft green halftone discs, a pink blush.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, outBack, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { deg, FX, cut, paper, grid, halftoneDisc, codePanel, promptBox, phone, reel, chorusPills, joinButton, at, wd, endOf, stampWord, tag } = K;
const RED = "#c63d4f", INK = "#1d1b1b", GREEN = "#7fb27f", PINK = "#f3c9c9";

function bg(c, gt, S) {
  paper(c, "paper_white", "#f1eee8", { filter: "brightness(1.32) contrast(.8) saturate(.6)" });
  // pink blush at the top, like the reference print
  const g = c.createRadialGradient(540, -100, 50, 540, -100, 900); g.addColorStop(0, "rgba(243,201,201,.75)"); g.addColorStop(1, "rgba(243,201,201,0)");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const drift = Math.sin(gt * 0.4) * 14;
  halftoneDisc(c, -70, 820 + drift, 330, GREEN, { alpha: 0.75 });
  halftoneDisc(c, W + 90, 1060 - drift, 300, GREEN, { alpha: 0.7 });
}
// the plaque over the "building", engraved like the BANK sign
function plaque(c, x, y, s, text, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  c.font = FX.playfair(o.px || 64); const w = c.measureText(text).width + 90, h = (o.px || 64) * 1.55;
  c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 18; c.shadowOffsetY = 10;
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, o.top || "#9a9a96"); g.addColorStop(1, o.bot || "#5f5f5b");
  c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = "transparent";
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 3; c.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  c.fillStyle = "rgba(0,0,0,.35)"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 2, 6);
  c.fillStyle = o.fg || "#f4f2ec"; c.fillText(text, 0, 3);
  c.restore();
}
// the octopus, wrapped behind the software; k = squeeze, cut = 0..1 tentacles cut away
function octopus(c, gt, k, cutK = 0, o = {}) {
  const sway = Math.sin(gt * 1.6) * 2.5;
  const draw = (name, x, y, h, rot, flip) => cut(c, name, x, y, h, { mode: "duo", tint: "#d0445a", rot: deg(rot + sway * (flip ? -1 : 1)), flip, shadow: true, sy: 18 });
  const fall = (side) => cutK > 0 ? { dx: side * 260 * cutK, dy: 1700 * cutK * cutK, r: side * 40 * cutK } : { dx: 0, dy: 0, r: 0 };
  [[-1, "cut_octopus_1"], [1, IMG.cut_octopus_2 ? "cut_octopus_2" : "cut_octopus_1"]].forEach(([side, name]) => {
    const f = fall(side);
    c.save(); c.globalAlpha *= 1 - clamp(cutK * 1.6 - 0.6);
    c.translate(540 + side * (230 + 30 * (1 - k)) + f.dx, 880 + f.dy); c.rotate(deg(f.r));
    draw(name, 0, 0, 980 * (0.92 + 0.1 * k), side * -8, side > 0);
    c.restore();
  });
}
// the old software: a B&W computer standing in for the bank building
function software(c, gt, lt, o = {}) {
  const y = o.y ?? 1000;
  if (IMG.cut_crt) return cut(c, "cut_crt", 540 + (o.dx || 0), y, o.h || 600, { mode: "bw", ay: 0.5, rot: deg(o.rot || 0) });
  K.laptop(c, 540 + (o.dx || 0), y, o.h || 470, deg(o.rot || 0), (cc, w, h) => { K.timelineUI(cc, w, h, lt); cc.fillStyle = "rgba(0,0,0,.15)"; cc.fillRect(0, 0, w, h); }, { mode: "bw" });
  // one tentacle curls over the front of it
  if (o.tentacle !== false) cut(c, "cut_tentacle", 300 + Math.sin(gt * 1.4) * 10, y + 120, 520, { mode: "duo", tint: "#d0445a", rot: deg(-20 + Math.sin(gt * 1.6) * 4) });
}

const S = {};
S.hook = { draw(c, lt, Sc, gt) {
  grid(c, 250, 980, 580, 560, 48, "rgba(70,80,100,.25)");
  const k = spring(lt, 0.15, 0.9);
  c.save(); c.translate(0, (1 - k) * 220); octopus(c, gt, k); c.restore();
  software(c, gt, lt, { y: 1000 + (1 - spring(lt, 0, 0.7)) * 900 });
  const pl = spring(lt, wd("a1_1", 6, Sc) - 0.2, 0.7);
  if (pl > 0) plaque(c, 540, 560 - (1 - pl) * 500, 1, "EDITING SOFTWARE", { px: 58 });
  stampWord(c, "RUKO!", 540, 380, FX.anton(210), RED, 0, lt, { from: 2.4, rot: deg(-4), out: wd("a1_1", 4, Sc) });
  stampWord(c, "≠ OCTOPUS", 540, 360, FX.anton(120), INK, wd("a1_1", 3, Sc), lt, { rot: deg(3), out: Sc.dur - 0.3 });
} };
S.tags = { draw(c, lt, Sc, gt) {
  grid(c, 250, 980, 580, 560, 48, "rgba(70,80,100,.25)");
  const squeeze = ss(0, Sc.dur, lt);
  octopus(c, gt, 1 + squeeze * 0.4);
  software(c, gt, lt);
  plaque(c, 540, 560, 1, "EDITING SOFTWARE", { px: 58 });
  const TAGS = [["50 MENUS", 0, 170, 760, -10], ["100 PLUGINS", 2, 900, 700, 8], [null, 4, 200, 1150, 6], ["₹₹₹ / MONTH", 9, 880, 1120, -7]];
  TAGS.forEach(([s, w, x, y, r], i) => {
    const e = spring(lt, wd("a1_2", w, Sc) - 0.05, 0.6);
    if (e <= 0) return;
    let txt = s;
    if (!s) { const sec = Math.floor(lerp(0, 3 * 3600, ss(wd("a1_2", 4, Sc), Sc.dur, lt))); txt = `RENDER ${Math.floor(sec / 3600)}:${String(Math.floor(sec / 60) % 60).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`; }
    c.save(); c.strokeStyle = RED; c.lineWidth = 3; c.beginPath(); c.moveTo(540 + (x < 540 ? -200 : 200), 900); c.quadraticCurveTo((x + 540) / 2, y - 120, x, y - 40 * e); c.globalAlpha = e; c.stroke(); c.restore();
    tag(c, txt, x, y, FX.rubik(44), { s: 0.4 + 0.6 * e, rot: deg(r), bg: "#fffdf8", fg: INK, h: 96, border: RED, borderW: 3, alpha: clamp(e * 2) });
  });
} };
S.night = { draw(c, lt, Sc, gt) {
  const dusk = ss(0, 2.2, lt) * (1 - ss(Sc.dur - 0.2, Sc.dur + 0.2, lt));
  c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = `rgba(52,64,120,${0.62 * dusk})`; c.fillRect(0, 0, W, H); c.restore();
  halftoneDisc(c, 860, lerp(520, 330, dusk), 120, "#f6e7a8", { alpha: dusk, cell: 7 });
  octopus(c, gt, 1.4);
  software(c, gt, lt);
  plaque(c, 540, 560, 1, "EDITING SOFTWARE", { px: 58 });
  // the evening disappearing on a clock
  const m = Math.floor(lerp(19 * 60, 23 * 60 + 48, ss(0.3, Sc.dur - 0.3, lt)));
  const clock = `${String(Math.floor(m / 60) - 12).padStart(2, "0")}:${String(m % 60).padStart(2, "0")} PM`;
  stampWord(c, clock, 540, 1700, FX.anton(150), dusk > 0.5 ? "#f4f2ec" : INK, 0.1, lt, { shadow: false });
  const prog = ss(0.3, Sc.dur, lt) * 0.07;
  c.fillStyle = "rgba(255,255,255,.35)"; rr(c, 240, 1480, 600, 22, 11); c.fill();
  c.fillStyle = RED; rr(c, 240, 1480, 600 * prog, 22, 11); c.fill();
  c.font = FX.rubik(30); c.fillStyle = dusk > 0.5 ? "#fff" : INK; c.textAlign = "center"; c.fillText(`Rendering… ${Math.round(prog * 100)}%`, 540, 1450);
} };
S.cut = { draw(c, lt, Sc, gt) {
  const s1 = at("a1_4", Sc) + 1.75, s2 = s1 + 0.3;
  const cutK = clamp((lt - s2) / 1.0);
  octopus(c, gt, 1.4, cutK);
  software(c, gt, lt, { rot: cutK * -2 });
  const pf = clamp((lt - s2 - 0.2) / 0.8);
  plaque(c, 540 + pf * 120, 560 + pf * pf * 1600, 1, "EDITING SOFTWARE", { px: 58, rot: deg(pf * 30) });
  // the scissors fly in and snap twice
  const sc = apple(win(at("a1_4", Sc) + 0.4, s1 - 0.1, lt));
  const snap = (lt > s1 && lt < s1 + 0.12) || (lt > s2 && lt < s2 + 0.12) ? 1 : 0;
  const away = inCubic(win(s2 + 0.4, s2 + 1.0, lt));
  cut(c, "cut_scissors", lerp(1400, 700, sc) + away * 700, lerp(500, 820, sc) - away * 400, 520, { rot: deg(-35 + snap * 14), mode: "color" });
  if (lt > s2 && lt < s2 + 0.25) { c.fillStyle = `rgba(255,255,255,${0.7 * (1 - (lt - s2) / 0.25)})`; c.fillRect(0, 0, W, H); }
  stampWord(c, "KAATO!", 540, 400, FX.anton(200), RED, at("a1_4", Sc) + 0.9, lt, { rot: deg(-3) });
} };
S.pipeline = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a1_5", n, Sc);
  // 1 · say it
  const p1 = spring(lt, w(0) - 0.2, 0.6);
  if (p1 > 0) { c.save(); c.globalAlpha = clamp(p1 * 2);
    promptBox(c, 540, 400 - (1 - p1) * 200, 900, "30 sec reel banao: fast cuts, bold captions, Hindi + Tamil", win(w(1), w(8), lt), { accent: RED, px: 38 });
    c.restore(); }
  stampWord(c, "1. BOLO", 150, 300, FX.marker(54), RED, w(2), lt, { align: "left", rot: deg(-4), shadow: false });
  // 2 · AI writes the code
  const p2 = spring(lt, w(9) - 0.2, 0.6);
  if (p2 > 0) { c.save(); c.globalAlpha = clamp(p2 * 2); codePanel(c, 330, 880 + (1 - p2) * 300, 560, 600, win(w(10), w(14), lt), { rot: deg(-3), px: 21 }); c.restore(); }
  stampWord(c, "2. AI CODE", 70, 1240, FX.marker(54), RED, w(10), lt, { align: "left", rot: deg(3), shadow: false });
  // 3 · the finished video (a real one, made this way)
  const p3 = spring(lt, w(14), 0.7);
  if (p3 > 0) phone(c, 800, 930 + (1 - p3) * 900, 760, deg(5), (cc, pw, ph) => reel(cc, pw, ph, lt - w(14)));
  stampWord(c, "3. VIDEO!", 1010, 1380, FX.marker(58), RED, w(15), lt, { align: "right", rot: deg(-3), shadow: false });
  // hand-drawn arrows
  const arrow = (x1, y1, x2, y2, t0) => { const e = win(t0, t0 + 0.4, lt); if (e <= 0) return;
    c.save(); c.strokeStyle = RED; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); const mx = (x1 + x2) / 2 + 80, my = (y1 + y2) / 2;
    for (let i = 0; i <= 20 * e; i++) { const u = i / 20, x = (1 - u) * (1 - u) * x1 + 2 * u * (1 - u) * mx + u * u * x2, y = (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * my + u * u * y2; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke(); c.restore(); };
  arrow(400, 500, 300, 600, w(9) - 0.3); arrow(560, 760, 700, 600, w(14) - 0.3);
} };
const SAY = [["hi", "बोलो"], ["ta", "பேசுங்க"], ["bn", "বলো"], ["te", "చెప్పండి"], ["gu", "બોલો"], ["mr", "बोला"], ["kn", "ಹೇಳಿ"], ["ml", "പറയൂ"], ["pa", "ਬੋਲੋ"]];
S.langs = { draw(c, lt, Sc, gt) {
  phone(c, 540, 900, 940, deg(-2), (cc, pw, ph) => reel(cc, pw, ph, lt + 6));
  const w = (n) => wd("a1_6", n, Sc);
  const T0 = [w(0), w(3), w(6), w(9), w(9) + 0.15, w(9) + 0.3, w(10), w(10) + 0.15, w(10) + 0.3];
  const POS = [[250, 420, -6], [830, 520, 5], [230, 1250, 4], [850, 1180, -5], [180, 820, 3], [900, 860, -3], [330, 600, 6], [760, 1380, 4], [560, 300, -2]];
  const COL = [PINK, "#cfe6cf", "#fde3c8", "#e6dcf5", "#fff", PINK, "#cfe6cf", "#fde3c8", "#e6dcf5"];
  SAY.forEach(([l, s], i) => {
    const e = spring(lt, T0[i] - 0.05, 0.5); if (e <= 0) return;
    const [x, y, r] = POS[i];
    tag(c, s, x, y, FX.baloo(l, i < 3 ? 76 : 54), { s: 0.5 + 0.5 * e, rot: deg(r), bg: COL[i], fg: INK, h: i < 3 ? 130 : 100, r: 60, alpha: clamp(e * 2) });
  });
} };
S.daur = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a1_7", n, Sc);
  const out = apple(win(w(4) + 0.4, w(7), lt));
  c.save(); c.translate(-out * 1100, 0);
  software(c, gt, lt);
  plaque(c, 540, 560, 1, "TIMELINE", { px: 70 });
  stampWord(c, "PURANA", 540, 1060, FX.anton(170), RED, w(4), lt, { rot: deg(-14), from: 2.2, shadow: false });
  c.restore();
  const inn = apple(win(w(4) + 0.4, w(7), lt));
  if (inn > 0) {
    c.save(); c.translate((1 - inn) * 1100, 0);
    K.laptop(c, 540, 1000, 470, 0, (cc, w, h) => reel(cc, w, h, lt));
    plaque(c, 540, 560, 1, "NAYA DAUR", { px: 80, top: "#d24a5c", bot: "#9d2b3b" });
    c.restore();
  }
  stampWord(c, "TIMELINE ✕", 540, 330, FX.anton(110), INK, w(0), lt, { out: w(2) - 0.15 });
  stampWord(c, "SEEDHI BAAT.", 540, 330, FX.anton(110), RED, w(2), lt, { out: w(4) - 0.1 });
} };
S.cta = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a1_8", n, Sc);
  // the building again, now it is ours
  const k = spring(lt, 0, 0.8);
  K.laptop(c, 400, 930 + (1 - k) * 600, 360, deg(-3), (cc, w, h) => K.codePanel(cc, w / 2, h / 2, w, h, 1, { px: 12 }));
  phone(c, 760, 900 + (1 - k) * 600, 560, deg(4), (cc, pw, ph) => reel(cc, pw, ph, lt + 2));
  plaque(c, 540, 470 - (1 - spring(lt, 0.2, 0.8)) * 500, 1.1, "VIBE EDITING", { px: 78, top: "#d24a5c", bot: "#9d2b3b" });
  stampWord(c, "EDITING KA NAYA DAUR", 540, 610, FX.rubik(46), INK, 0.5, lt, { shadow: false });
  joinButton(c, 540, 1150, gt, Sc.start + w(3), { bg: RED, text: "JOIN VIBE EDITING  →", font: FX.arch(46) });
  chorusPills(c, gt, [[280, 1470, -5], [800, 1450, 5], [300, 1610, 4], [790, 1630, -4]], { px: 40, bg: (i) => [PINK, "#cfe6cf", "#fde3c8", "#e6dcf5"][i % 4], fg: () => INK });
} };

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = FX.rubik(58); const sp = c.measureText(" ").width;
  const widths = ws.map((s) => c.measureText(s.toUpperCase()).width), tot = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  const y = 1330, pad = 30, e = spring(since, 0, 0.35);
  c.translate(540, y); c.rotate(deg(-1.5)); c.scale(0.9 + 0.1 * e, 0.9 + 0.1 * e);
  c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 16; c.shadowOffsetY = 8;
  c.fillStyle = "#fffdf7"; c.fillRect(-tot / 2 - pad, -52, tot + pad * 2, 104); c.shadowColor = "transparent";
  let x = -tot / 2;
  ws.forEach((s, i) => {
    if (i === active) { c.fillStyle = RED; c.fillRect(x - 8, -40, widths[i] + 16, 80); }
    c.fillStyle = i === active ? "#fff" : INK; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(s.toUpperCase(), x, 4);
    x += widths[i] + sp;
  });
  c.restore();
}

window.AD = { bg, scenes: S, caption, grain: 0.2,
  trans: { cut: { type: "tear", d: 0.7 }, langs: { type: "whip", d: 0.5 }, daur: { type: "up", d: 0.7 } },
  images: ["paper_white", "cut_octopus_1", "cut_octopus_2", "cut_tentacle", "cut_crt", "cut_laptop", "cut_scissors"] };
})();

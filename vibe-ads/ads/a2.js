// Ad 2 · "1913 se Future tak" — design system 2: graph paper, vintage B&W people with a
// hand-tinted accent, flat royal-blue shapes, red lightning bolts, a white time badge.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { deg, FX, cut, paper, grid, codePanel, promptBox, phone, reel, chorusPills, joinButton, at, wd, stampWord, tag, bolt } = K;
const BLUE = "#1f4fe0", RED = "#e8432e", INK = "#141414", YEL = "#f2c230";

function bg(c, gt) {
  paper(c, IMG.graph_paper ? "graph_paper" : "paper_white", "#f4f4f1", { filter: "grayscale(.6) brightness(1.3) contrast(.78)" });
  if (!IMG.graph_paper) grid(c, 0, 0, W, H, 60, "rgba(80,90,110,.24)", 1.5);
}
// the "0:08" badge from the reference, used as a year counter
function badge(c, s, lt, at0 = 0) {
  const e = spring(lt, at0, 0.5);
  c.save(); c.translate(60, 250); c.scale(e, e);
  c.font = FX.rubik(54); const w = c.measureText(s).width + 56;
  c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 14; c.shadowOffsetY = 6;
  c.fillStyle = "#fff"; rr(c, 0, -46, w, 92, 46); c.fill(); c.shadowColor = "transparent";
  c.fillStyle = INK; c.textBaseline = "middle"; c.fillText(s, 28, 3); c.restore();
}
// the flat blue "tank" with a wavy top, from the reference
function tank(c, x, y, w, h, level, gt, o = {}) {
  const top = y + h * (1 - level);
  c.save(); c.fillStyle = o.col || BLUE; c.beginPath(); c.moveTo(x, top);
  for (let xx = 0; xx <= w; xx += 20) c.lineTo(x + xx, top + Math.sin(xx / 38 + gt * 3) * 12);
  c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill(); c.restore();
}
// a film frame with perforations, playing a real clip
function filmFrame(c, x, y, w, h, rot, clip, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 24; c.shadowOffsetY = 12;
  c.fillStyle = "#151515"; c.fillRect(-w / 2 - 50, -h / 2 - 26, w + 100, h + 52); c.shadowColor = "transparent";
  c.fillStyle = "#f4f4f1"; for (let yy = -h / 2 - 8; yy < h / 2 + 8; yy += 36) { rr(c, -w / 2 - 38, yy, 24, 18, 4); c.fill(); rr(c, w / 2 + 14, yy, 24, 18, 4); c.fill(); }
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
  if (IMG["ph_" + clip] || (window.FOOT || {})[clip]) footage(c, clip, t, -w / 2, -h / 2, w, h, { mode: "loop", filter: o.filter });
  else { c.fillStyle = "#777"; c.fillRect(-w / 2, -h / 2, w, h); }
  c.restore(); c.restore();
}

const S = {};
S.phalke = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a2_1", n, Sc);
  badge(c, "1913", lt, 0.05);
  tank(c, 0, 1120, W, 800, 0.62, gt);
  filmFrame(c, 700, 720, 520, 390, deg(3), "harishchandra", lt * 0.9, { filter: "grayscale(1) contrast(1.15)" });
  const e = spring(lt, 0.1, 0.8);
  cut(c, "cut_phalke", 300, 1180 + (1 - e) * 900, 1080, { mode: "bw", ay: 0.5 });
  bolt(c, 520, 560, 1.4, deg(20), RED, spring(lt, w(4), 0.4));
  // a strip of film, snipped on "kaat-kaat"
  const sn = w(12), cutK = clamp((lt - sn) / 0.9);
  cut(c, "cut_filmstrip", 700, 1360, 230, { mode: "bw", rot: deg(-4) });
  if (IMG.cut_filmstrip && lt > sn) cut(c, "cut_filmstrip", 1040 + cutK * 80, 1360 + cutK * cutK * 700, 230, { mode: "bw", rot: deg(-4 + cutK * 50), s: 0.5 });
  cut(c, "cut_scissors", lerp(1300, 900, apple(win(sn - 0.6, sn - 0.05, lt))), 1300, 300, { rot: deg(-20 + (lt > sn && lt < sn + 0.12 ? 12 : 0)) });
  stampWord(c, "BHARAT KI PEHLI FEATURE FILM", 700, 1010, FX.rubik(34), INK, w(6), lt, { shadow: false });
  stampWord(c, "Raja Harishchandra (1913)", 700, 1055, FX.hand(40), INK, w(6) + 0.2, lt, { shadow: false });
} };
S.machines = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a2_2", n, Sc);
  const yrs = [["1924", w(0)], ["1990s", w(4)], ["2000s", w(6)]];
  let yr = "1913"; yrs.forEach(([y, t]) => { if (lt >= t) yr = y; });
  badge(c, yr, lt, -1);
  tank(c, 0, 1250, W, 700, 0.5, gt);
  const ITEMS = [["cut_moviola", 210, 760, 640, w(0), "MOVIOLA"], ["cut_steenbeck", 760, 600, 360, w(1), "STEENBECK"],
    [IMG.cut_crt ? "cut_crt" : "laptop_dark", 780, 990, 330, w(4), "COMPUTER"], ["laptop_tl", 400, 1150, 330, w(6), "TIMELINE"]];
  ITEMS.forEach(([n, x, y, h, t0, lab], i) => {
    const e = spring(lt, t0 - 0.05, 0.6); if (e <= 0) return;
    if (n === "laptop_dark") K.laptop(c, x, y + (1 - e) * 120, h * (0.6 + 0.4 * e), 0, null, { mode: "bw" });
    else if (n === "laptop_tl") K.laptop(c, x, y + (1 - e) * 120, h * (0.6 + 0.4 * e), 0, (cc, ww, hh) => K.timelineUI(cc, ww, hh, lt), { mode: "bw" });
    else cut(c, n, x, y + (1 - e) * 120, h * (0.6 + 0.4 * e), { mode: "bw" });
    bolt(c, x + 170, y - h / 2, 1.1, deg(i % 2 ? -18 : 18), RED, clamp(e * 2));
    tag(c, lab, x, y + h / 2 + 30, FX.rubik(36), { bg: "#fff", fg: INK, h: 64, r: 32, alpha: clamp(e * 2) });
  });
  // a flat blue timeline track under the laptop
  const tl = win(w(6), w(7) + 0.4, lt);
  if (tl > 0) for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? "#7da2ff" : "#fff"; rr(c, 120 + k * 120, 1560, 110 * clamp(tl * 7 - k), 52, 10); c.fill(); }
} };
S.same = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a2_3", n, Sc);
  const yr = Math.round(lerp(1913, 2025, ss(0, w(3), lt)));
  badge(c, String(yr), lt, -1);
  const lvl = lerp(0.25, 0.85, ss(w(4), Sc.dur, lt));
  tank(c, 90, 520, 900, 1040, lvl, gt);
  filmFrame(c, 540, 760, 640, 470, deg(-2), "editing_vintage", lt, { filter: "grayscale(1) contrast(1.1)" });
  const DO = [["KHEENCHO", 8], ["KAATO", 9], ["JODO", 10]];
  DO.forEach(([s, n], i) => stampWord(c, s, 540, [1100, 1230, 1520][i], FX.anton(130), i === 1 ? RED : "#fff", w(n), lt, { rot: deg([-3, 2, -2][i]), shadow: false }));
  stampWord(c, "GHANTON TAK…", 540, 420, FX.anton(110), INK, w(11), lt, { rot: deg(-2) });
  cut(c, "cut_hand_point", 860 + Math.sin(lt * 5) * 30, 1060, 420, { mode: "bw", rot: deg(-30) });
} };
S.experiment = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a2_4", n, Sc);
  badge(c, "2026", lt, 0);
  tank(c, 0, 1200, W, 720, 0.6, gt);
  cut(c, "cut_phalke", 250, 1180, 980, { mode: "bw" });
  const z = w(5), e = spring(lt, z - 0.05, 0.4);
  bolt(c, 720, 760, 4.2 * e, deg(14), RED, clamp(e * 2));
  if (lt > z && lt < z + 0.2) { c.fillStyle = `rgba(255,255,255,${0.8 * (1 - (lt - z) / 0.2)})`; c.fillRect(0, 0, W, H); }
  stampWord(c, "EXPERIMENT", 600, 470, FX.anton(150), INK, w(3), lt, { rot: deg(-2) });
  const st = spring(lt, w(6), 0.4);
  if (st > 0) {
    c.save(); c.translate(740, 1380); c.rotate(deg(-12)); c.scale(2 - st, 2 - st); c.globalAlpha = clamp(st * 2);
    c.strokeStyle = BLUE; c.lineWidth = 12; rr(c, -260, -90, 520, 180, 20); c.stroke();
    c.font = FX.anton(120); c.fillStyle = BLUE; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("KAAMYAAB ✓", 0, 8);
    c.restore();
  }
} };
S.pipeline = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a2_5", n, Sc);
  badge(c, "2026", lt, -1);
  const e1 = spring(lt, w(2) - 0.15, 0.6);
  if (e1 > 0) { c.save(); c.globalAlpha = clamp(e1 * 2);
    promptBox(c, 540, 420, 920, "Ek reel banao: India ke 6 shehar, 6 bhashayein, beat par cuts", win(w(2), w(5), lt), { accent: BLUE, px: 38 }); c.restore(); }
  tag(c, "IDEA", 150, 300, FX.rubik(40), { bg: BLUE, fg: "#fff", h: 70, r: 35, alpha: clamp(e1 * 2) });
  const e2 = spring(lt, w(6) - 0.15, 0.6);
  if (e2 > 0) { c.save(); c.globalAlpha = clamp(e2 * 2); codePanel(c, 380, 960, 640, 560, win(w(6), w(10), lt), { bg: "#16237a", rot: deg(-2), px: 22 }); c.restore(); }
  tag(c, "AI CODE", 160, 650, FX.rubik(40), { bg: BLUE, fg: "#fff", h: 70, r: 35, alpha: clamp(e2 * 2) });
  bolt(c, 690, 640, 1.2, deg(30), RED, clamp(e2 * 2));
  const e3 = spring(lt, w(10) - 0.1, 0.7);
  if (e3 > 0) phone(c, 820, 1040 + (1 - e3) * 900, 700, deg(4), (cc, pw, ph) => reel(cc, pw, ph, lt - w(10)));
  tag(c, "VIDEO TAIYAAR ✓", 760, 1440, FX.rubik(40), { bg: RED, fg: "#fff", h: 74, r: 37, alpha: clamp(e3 * 2) });
} };
const SCRIPTS = [["hi", "हिन्दी"], ["ta", "தமிழ்"], ["bn", "বাংলা"], ["te", "తెలుగు"], ["gu", "ગુજરાતી"], ["mr", "मराठी"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]];
S.langs = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a2_6", n, Sc);
  badge(c, "2026", lt, -1);
  // "English only" gets crossed out
  const en = spring(lt, w(0), 0.5), x = win(w(5), w(5) + 0.3, lt), gone = ss(w(8) - 0.2, w(8) + 0.2, lt);
  if (en > 0 && gone < 1) {
    c.save(); c.globalAlpha = 1 - gone; tag(c, "ENGLISH ONLY", 540, 480, FX.anton(110), { bg: "#fff", fg: INK, h: 170, s: en });
    c.strokeStyle = RED; c.lineWidth = 18; c.lineCap = "round"; c.beginPath(); c.moveTo(220, 560); c.lineTo(220 + 640 * x, 400); c.stroke(); c.restore();
  }
  // big blue tiles, one per script, on the grid
  SCRIPTS.forEach(([l, s], i) => {
    const t0 = i < 4 ? w(8 + i) : w(12) + (i - 4) * 0.12, e = spring(lt, t0 - 0.05, 0.5);
    if (e <= 0) return;
    const col = i % 3, row = Math.floor(i / 3), x0 = 200 + col * 340, y0 = 560 + row * 300;
    c.save(); c.translate(x0, y0); c.rotate(deg((i % 2 ? 3 : -3))); c.scale(e, e);
    c.fillStyle = i % 4 === 1 ? RED : BLUE; rr(c, -150, -120, 300, 240, 24); c.fill();
    c.font = FX.baloo(l, 62); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, 8);
    c.restore();
  });
  stampWord(c, "HAR BHASHA MEIN", 540, 1520, FX.anton(110), INK, w(12), lt, { rot: deg(-2) });
} };
S.cta = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a2_7", n, Sc);
  badge(c, "FUTURE →", lt, -1);
  tank(c, 0, 1300, W, 620, 0.55, gt);
  stampWord(c, "EDITING KA", 540, 470, FX.anton(110), INK, 0.1, lt);
  stampWord(c, "FUTURE", 540, 680, FX.anton(260), BLUE, w(3) - 0.1, lt, { rot: deg(-3) });
  bolt(c, 930, 470, 1.4, deg(20), RED, spring(lt, w(3), 0.4));
  cut(c, "cut_phalke", 170, 1040, 640, { mode: "bw", flip: true, alpha: spring(lt, 0.3, 0.8) });
  phone(c, 700, 1000 + (1 - spring(lt, w(5), 0.7)) * 900, 520, deg(4), (cc, pw, ph) => reel(cc, pw, ph, lt));
  joinButton(c, 540, 1150, gt, Sc.start + w(9), { bg: BLUE, text: "JOIN VIBE EDITING  →", font: FX.arch(46) });
  chorusPills(c, gt, [[300, 1480, -4], [790, 1440, 4], [320, 1620, 3], [780, 1640, -3]], { px: 40, bg: (i) => ["#fff", YEL, "#fff", YEL][i % 4], fg: () => INK });
} };

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = FX.rubik(56); const sp = c.measureText(" ").width;
  const widths = ws.map((s) => c.measureText(s).width), tot = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  const e = spring(since, 0, 0.3);
  c.translate(540, 1330); c.scale(0.92 + 0.08 * e, 0.92 + 0.08 * e);
  c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 16; c.shadowOffsetY = 6;
  c.fillStyle = "#fff"; rr(c, -tot / 2 - 34, -54, tot + 68, 108, 54); c.fill(); c.shadowColor = "transparent";
  let x = -tot / 2;
  ws.forEach((s, i) => {
    if (i === active) { c.fillStyle = BLUE; rr(c, x - 10, -40, widths[i] + 20, 80, 16); c.fill(); }
    c.fillStyle = i === active ? "#fff" : INK; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(s, x, 3);
    x += widths[i] + sp;
  });
  c.restore();
}

window.AD = { bg, scenes: S, caption, grain: 0.18,
  trans: { phalke: { type: "slide", d: 0.6 }, same: { type: "whip", d: 0.5 }, experiment: { type: "zoom", d: 0.6, fx: 720, fy: 760 }, langs: { type: "slide", d: 0.6 } },
  images: ["graph_paper", "paper_white", "cut_phalke", "cut_moviola", "cut_steenbeck", "cut_crt", "cut_laptop", "cut_filmstrip", "cut_scissors", "cut_hand_point"] };
})();

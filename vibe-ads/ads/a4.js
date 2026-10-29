// Ad 4 · "Uljhan Chhodo" — design system 4: graph paper sky, a yellow sun disc, a teal grass
// field, a giant B&W hand from the top, a landmark tangled up.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { deg, FX, cut, paper, grid, codePanel, phone, reel, chorusPills, joinButton, at, wd, stampWord, tag } = K;
const YEL = "#f0b323", TEALG = "#1f9e8f", INK = "#111", RED = "#e2412f";
const HZ = 1240;   // where the grass starts

function bg(c, gt, S) {
  paper(c, "graph_paper", "#f3f3f0", { filter: "grayscale(.7) brightness(1.08)" });
  if (!IMG.graph_paper) grid(c, 0, 0, W, HZ, 64, "rgba(60,60,70,.2)", 1.6);
}
function sun(c, warm = 0, r = 330, body) {
  c.save(); c.translate(540, 1040);
  c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 20;
  c.fillStyle = warm ? `rgb(${240},${Math.round(lerp(179, 140, warm))},${Math.round(lerp(35, 30, warm))})` : YEL;
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.shadowColor = "transparent";
  if (body) { c.save(); c.beginPath(); c.arc(0, 0, r - 14, 0, 7); c.clip(); body(c, r - 14); c.restore(); }
  c.restore();
}
function field(c, gt) {
  c.save(); c.beginPath(); c.rect(0, HZ, W, H - HZ); c.clip();
  const im = IMG.grass_field || IMG.grass;
  if (im) {
    // only the grass part of the photo, tinted teal like the reference
    const sy = im.naturalHeight * (IMG.grass_field ? 0.35 : 0.72), sh = im.naturalHeight - sy, sw = sh * W / (H - HZ);
    c.filter = "hue-rotate(38deg) saturate(1.35) brightness(.95)";
    c.drawImage(im, (im.naturalWidth - sw) / 2 + Math.sin(gt * 0.5) * 10, sy, sw, sh, 0, HZ, W, H - HZ);
  }
  else { c.fillStyle = TEALG; c.fillRect(0, HZ, W, H - HZ); }
  c.restore();
  c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, HZ, W, 6);
}
// the landmark wrapped in a tangle; tangle 0..1 (how much is left), tilt in degrees
function tower(c, gt, tangle = 1, tilt = 0) {
  c.save(); c.translate(540, HZ + 120); c.rotate(deg(tilt));
  cut(c, "cut_qutub", 0, 0, 1080, { mode: "bw", ay: 1, shadow: true });
  if (tangle > 0) {
    c.globalAlpha = clamp(tangle * 1.3);
    const lift = (1 - tangle) * 900;
    cut(c, IMG.cut_filmtangle ? "cut_filmtangle" : "cut_cables", 0, -520 - lift, 760 * (0.8 + 0.2 * tangle), { mode: "bw", ay: 0.5, rot: deg(Math.sin(gt * 2) * 2) });
  }
  c.restore();
}
// the giant hand from the top, pinching a thread that runs down to the tangle
function hand(c, gt, y, o = {}) {
  const sway = Math.sin(gt * 1.1) * 8;
  if (o.thread !== false) { c.save(); c.strokeStyle = "rgba(30,30,30,.8)"; c.lineWidth = 3; c.beginPath(); c.moveTo(540 + sway, y + 40); c.lineTo(540, o.toY ?? 500); c.stroke(); c.restore(); }
  cut(c, o.name || "cut_hand_pinch", 540 + sway, y, 620, { mode: "bw", ay: 0.92, rot: deg(o.rot || 180), shadow: true });
}

const S = {};
S.hook = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a4_1", n, Sc);
  sun(c); field(c, gt);
  tower(c, gt, 1, Math.sin(gt * 1.5) * 1.2);
  hand(c, gt, lerp(-300, 70, apple(win(0, 0.8, lt))), { toY: 420 });
  stampWord(c, "ULJHI", 70, 420, FX.anton(170), INK, w(4), lt, { align: "left", rot: deg(-4) });
  stampWord(c, "HUI?", 1010, 600, FX.anton(200), RED, w(6), lt, { align: "right", rot: deg(5) });
} };
S.problem = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a4_2", n, Sc);
  const g = w(4), tilt = lerp(0, 5.5, apple(win(g, g + 0.6, lt)));
  sun(c); field(c, gt);
  tower(c, gt, 1, tilt);
  hand(c, gt, 70, { toY: 420 });
  [["KEYFRAMES", 0, 230, 640, -8], ["LAYERS", 1, 850, 760, 6], ["TRANSITIONS", 2, 260, 920, 4]].forEach(([s, n, x, y, r]) => {
    const e = spring(lt, w(n) - 0.05, 0.5), pull = apple(win(w(n) + 0.5, w(n) + 1.4, lt));
    if (e <= 0 || pull >= 1) return;
    tag(c, s, lerp(x, 540, pull), lerp(y, 700, pull), FX.anton(64), { bg: "#fff", fg: INK, h: 100, s: (0.5 + 0.5 * e) * (1 - pull * 0.8), rot: deg(r + pull * 40), alpha: 1 - pull });
  });
  if (lt > g) {
    const e = spring(lt, g, 0.4);
    c.save(); c.translate(820, 520); c.scale(e, e); c.strokeStyle = RED; c.lineWidth = 26; c.lineCap = "round";
    c.beginPath(); c.moveTo(-70, -70); c.lineTo(70, 70); c.moveTo(70, -70); c.lineTo(-70, 70); c.stroke(); c.restore();
  }
  stampWord(c, "1 GALTI = SAB BIGDA", 540, 1160, FX.anton(96), INK, g + 0.1, lt, { rot: deg(-2), stroke: "#fff", strokeW: 12 });
} };
S.shift = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a4_3", n, Sc);
  sun(c); field(c, gt);
  tower(c, gt, 1, lerp(5.5, 2, ss(0, 1, lt)));
  const open = lt > w(2);
  hand(c, gt, lerp(70, -60, ss(w(2), w(3), lt)), { name: open ? "cut_hand_point" : "cut_hand_pinch", thread: !open, toY: 420, rot: open ? 160 : 180 });
  stampWord(c, "UNGLIYON SE ✕", 540, 520, FX.anton(110), INK, w(1), lt, { stroke: "#fff", strokeW: 12 });
  stampWord(c, "SHABDON SE ✓", 540, 690, FX.anton(130), RED, w(3), lt, { stroke: "#fff", strokeW: 12, rot: deg(-2) });
} };
S.commands = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a4_4", n, Sc);
  const C3 = [["beat par cut karo", 5], ["colour warm karo", 8], ["captions bade karo", 11]];
  const done = C3.filter(([, n]) => lt > w(n) + 0.3).length;
  const warm = ss(w(8), w(8) + 0.6, lt), big = ss(w(11), w(11) + 0.6, lt);
  // the sun becomes the screen: the edits land on a real video as they are spoken
  sun(c, warm, 330, (cc, r) => {
    cc.save(); cc.translate(-r, -r * 1.5);
    footage(cc, "bharat_reel", lt, 0, 0, r * 2, r * 3, { mode: "loop", filter: `sepia(${0.35 * warm}) saturate(${1 + 0.3 * warm})` });
    cc.restore();
    const flash = C3.reduce((a, [, n]) => a + (lt > w(n) && lt < w(n) + 0.15 ? 1 : 0), 0);
    if (flash) { cc.fillStyle = "rgba(255,255,255,.5)"; cc.fillRect(-r, -r, 2 * r, 2 * r); }
    if (big > 0) { cc.font = FX.anton(lerp(40, 110, big)); cc.fillStyle = YEL; cc.textAlign = "center"; cc.lineWidth = 10; cc.strokeStyle = INK; cc.strokeText("CHENNAI", 0, r * 0.55); cc.fillText("CHENNAI", 0, r * 0.55); }
  });
  field(c, gt);
  tower(c, gt, 1 - done / 3, 2 - done * 0.7);
  hand(c, gt, lerp(70, -40, done / 3), { toY: lerp(420, -400, done / 3) });
  C3.forEach(([s, n], i) => {
    const e = spring(lt, w(n) - 0.6, 0.5); if (e <= 0) return;
    const ok = lt > w(n) + 0.3;
    tag(c, (ok ? "✓ " : "") + s, [270, 810, 300][i], [330, 470, 610][i], FX.rubik(44), { bg: ok ? YEL : "#fff", fg: INK, h: 96, r: 48, s: 0.5 + 0.5 * e, rot: deg([-4, 4, -3][i]), alpha: clamp(e * 2) });
  });
} };
S.clean = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a4_5", n, Sc);
  sun(c, 1); field(c, gt);
  tower(c, gt, 0, 0);
  const e = spring(lt, 0.1, 0.6);
  c.save(); c.globalAlpha = clamp(e * 2); codePanel(c, 540, 480 - (1 - e) * 300, 900, 520, win(0.2, Sc.dur, lt), { rot: deg(-1.5), px: 24 }); c.restore();
  stampWord(c, "SAAF.", 300, 1180, FX.anton(150), INK, w(6), lt, { rot: deg(-4), stroke: "#fff", strokeW: 12 });
  stampWord(c, "TEZ.", 800, 1180, FX.anton(150), RED, w(8), lt, { rot: deg(4), stroke: "#fff", strokeW: 12 });
} };
const SPROUT = [["hi", "हिन्दी"], ["ta", "தமிழ்"], ["bn", "বাংলা"], ["te", "తెలుగు"], ["mr", "मराठी"], ["gu", "ગુજરાતી"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]];
S.langs = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a4_6", n, Sc);
  sun(c, 1); field(c, gt); tower(c, gt, 0, 0);
  // the languages sprout out of the grass
  SPROUT.forEach(([l, s], i) => {
    const e = spring(lt, w(0) + i * 0.17, 0.6); if (e <= 0) return;
    const x = 120 + (i % 5) * 210 + (i > 4 ? 105 : 0), y0 = HZ + 200 + (i > 4 ? 220 : 0), y = lerp(y0 + 200, y0 - 60, e);
    c.save(); c.strokeStyle = "#0f6f63"; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y0 + 200); c.quadraticCurveTo(x + 20, y + 80, x, y + 40); c.stroke(); c.restore();
    tag(c, s, x, y, FX.baloo(l, 46), { bg: i % 2 ? "#fff" : YEL, fg: INK, h: 86, r: 43, rot: deg(Math.sin(gt * 2 + i) * 4) });
  });
  stampWord(c, "APNI BHASHA MEIN", 540, 480, FX.anton(120), INK, w(3), lt, { stroke: "#fff", strokeW: 12, rot: deg(-2) });
} };
S.cta = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a4_7", n, Sc);
  sun(c, 1); field(c, gt); tower(c, gt, 0, 0);
  stampWord(c, "ULJHAN ✕", 540, 400, FX.anton(130), INK, w(0), lt, { stroke: "#fff", strokeW: 12, out: w(2) });
  stampWord(c, "VIBE EDITING", 540, 420, FX.anton(170), INK, w(2), lt, { stroke: "#fff", strokeW: 14, rot: deg(-2) });
  // the hand comes back down holding the join button
  const hy = lerp(-500, 330, apple(win(w(2), w(4), lt)));
  cut(c, "cut_hand_pinch", 540, hy, 520, { mode: "bw", ay: 0.92, rot: deg(180) });
  if (hy > 0) joinButton(c, 540, hy + 160, gt, Sc.start + w(3), { bg: RED, text: "JOIN VIBE EDITING  →", font: FX.arch(44), w: 700, h: 124 });
  chorusPills(c, gt, [[280, 1400, -4], [800, 1440, 4], [300, 1600, 3], [790, 1640, -3]], { px: 40, bg: (i) => (i % 2 ? YEL : "#fff"), fg: () => INK });
} };

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = FX.anton(84); const sp = c.measureText(" ").width;
  const up = ws.map((s) => s.toUpperCase()), widths = up.map((s) => c.measureText(s).width), tot = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  const e = spring(since, 0, 0.3);
  c.translate(540, 1335); c.scale(0.9 + 0.1 * e, 0.9 + 0.1 * e);
  let x = -tot / 2;
  up.forEach((s, i) => {
    if (i === active) { c.fillStyle = YEL; rr(c, x - 12, -52, widths[i] + 24, 96, 10); c.fill(); }
    c.lineJoin = "round"; c.lineWidth = 12; c.strokeStyle = i === active ? YEL : "#fff"; c.textAlign = "left"; c.textBaseline = "middle";
    c.strokeText(s, x, 2); c.fillStyle = INK; c.fillText(s, x, 2); x += widths[i] + sp;
  });
  c.restore();
}

window.AD = { bg, scenes: S, caption, grain: 0.2,
  trans: { problem: { type: "zoom", d: 0.5, fx: 540, fy: 900 }, commands: { type: "tear", d: 0.6 } },
  images: ["graph_paper", "grass_field", "grass", "cut_qutub", "cut_cables", "cut_filmtangle", "cut_hand_pinch", "cut_hand_point"] };
})();

// Ad 1 v2 · "Timeline ka Jaal" — crimson editorial (reference 4): deep red vignette, B&W halftone
// cut-outs, Didone serif set word by word, red scribbles, cyan negative flashes, rolling counters.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { cut, codePanel, promptBox, phone, reel, laptop, timelineUI, chorusPills, joinButton, FX } = K;
const { deg, W_, F2, cam, shake, kinetic, odometer, scribble, sticker, rays, bgCrimson } = FX2;
const CREAM = "#efe3cf", PINK = "#e46a74", RED = "#e2312f", DEEP = "#3a0810";
const at = (id, n = 0, o = 0) => [id, n, o];
const L = (S, id, n = 0, o = 0) => W_(id, n, o) - S.start;              // a word's time inside the shot

// drifting scattered serif words, like the reference's "WAS / NEVER / THE"
function drift(c, t, words, seed, o = {}) {
  const r = rnd(seed);
  words.forEach((s, i) => {
    const x = 60 + r() * 960, y = 160 + r() * 1500, sp = 12 + r() * 20, sz = 26 + r() * 40;
    c.save(); c.globalAlpha = (o.alpha ?? 0.35) * (0.5 + 0.5 * r()); c.font = s.length > 2 ? F2.bodoni(sz) : F2.bodoni(sz * 2.4); c.fillStyle = CREAM;
    c.textAlign = "center"; c.fillText(s, x + Math.sin(t * 0.7 + i) * 14, y - t * sp); c.restore();
  });
}
function serif(c, s, x, y, px, t0, t, o = {}) {
  const e = spring(t, t0, 0.4); if (e <= 0) return;
  c.save(); c.globalAlpha = clamp(e * 2.5) * (o.alpha ?? 1); c.translate(x, y + (1 - clamp(e)) * 30); c.rotate(o.rot || 0);
  const sc = o.from ? lerp(o.from, 1, clamp(e)) : 1; c.scale(sc, sc);
  c.font = o.italic ? F2.bodoniI(px) : F2.bodoni(px); c.fillStyle = o.color || CREAM; c.textAlign = o.align || "center";
  const tw = c.measureText(s).width; if (tw > 980) c.scale(980 / tw, 980 / tw);
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 30; }
  c.fillText(s, 0, 0); c.restore();
}
const halftone = (c, name, x, y, h, o = {}) => cut(c, name, x, y, h, { mode: "bw", ...o, shadowColor: "rgba(0,0,0,.6)", blur: 40 });

const S = [];
// 1 · RUKO!
S.push({ at: 0, sfx: [["impact", 0.3, 0.9], ["stamp", 0.32, 0.7]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.07, dur: Sh.dur });
  drift(c, t, ["?", "?", "?", "STOP", "WAIT", "?", "RUKO"], 3);
  shake(c, t, 0.32, 26);
  serif(c, "RUKO!", 540, 980, 300, 0.3, t, { from: 1.9 });
  scribble(c, "circle", 540, 880, 860, 400, win(0.5, 1.0, t), { lw: 9 });
} });
// 2 · Ye octopus…
S.push({ at: at("a1_1", 1), tr: { type: "glitch", d: 0.25 }, sfx: [["squish", 0.1, 0.5]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur, r0: -2, r1: 1 });
  halftone(c, "cut_octopus_1", 540, 900, 1150, { rot: deg(Math.sin(t * 1.4) * 3) });
  serif(c, "YE", 540, 380, 110, 0, t);
  serif(c, "OCTOPUS", 540, 540, 170, L(Sh, "a1_1", 2), t);
} });
// 3 · nahi hai…
S.push({ at: at("a1_1", 3), sfx: [["stamp", 0, 0.6]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.05, dur: Sh.dur });
  halftone(c, "cut_octopus_1", 540, 900, 1150, { alpha: 0.55 });
  serif(c, "NAHI HAI…", 540, 1080, 170, 0, t, { italic: true, color: PINK });
  scribble(c, "cross", 540, 880, 700, 700, win(0.1, 0.45, t), { lw: 12 });
} });
// 4 · ye aapka editing software hai — half octopus, half laptop, torn down the middle
S.push({ at: at("a1_1", 5), tr: { type: "invert", d: 0.18 }, draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.06, z1: 1.0, dur: Sh.dur });
  const r = rnd(4), seam = (y) => 540 + Math.sin(y / 60) * 18 + (r() - 0.5) * 22;
  c.save(); c.beginPath(); c.moveTo(0, 0); for (let y = 0; y <= H; y += 30) c.lineTo(seam(y), y); c.lineTo(0, H); c.closePath(); c.clip();
  halftone(c, "cut_octopus_1", 560, 820, 1100); c.restore();
  c.save(); c.beginPath(); c.moveTo(W, 0); for (let y = 0; y <= H; y += 30) c.lineTo(seam(y), y); c.lineTo(W, H); c.closePath(); c.clip();
  laptop(c, 560, 820, 600, deg(-4), (cc, w, h) => timelineUI(cc, w, h, t), { mode: "bw" }); c.restore();
  c.strokeStyle = CREAM; c.lineWidth = 6; c.beginPath(); for (let y = 0; y <= H; y += 30) { const x = seam(y); y ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  serif(c, "YE AAPKA", 540, 1180, 70, 0, t, { italic: true });
  serif(c, "EDITING", 540, 1300, 150, L(Sh, "a1_1", 7), t);
  serif(c, "SOFTWARE", 540, 1300 + 150, 150, L(Sh, "a1_1", 8), t, { color: PINK });
  scribble(c, "underline", 540, 1490, 760, 0, win(L(Sh, "a1_1", 8) + 0.2, L(Sh, "a1_1", 8) + 0.6, t));
} });
// 5 · 50 menus
const counterShot = (n, label, max, extra) => ({ draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.08, dur: Sh.dur });
  laptop(c, 540, 1180, 520, 0, (cc, w, h) => timelineUI(cc, w, h, t), { mode: "bw" });
  c.save(); c.globalAlpha = 0.55; c.fillStyle = DEEP; c.fillRect(0, 0, W, H); c.restore();
  if (extra) extra(c, t, Sh);
  odometer(c, lerp(0, max, outCubic(win(0, 0.7, t))), 540, 760, F2.didone(330), { color: CREAM, max });
  serif(c, label, 540, 1010, 110, 0.1, t, { italic: true, color: PINK });
} });
S.push({ at: at("a1_2", 0), tr: { type: "warp", d: 0.3 }, ...counterShot(0, "menus", 50, (c, t) => {
  ["File", "Edit", "View", "Clip", "Sequence", "Marker", "Graphics", "Window", "Help"].forEach((s, i) => {
    const r = rnd(i + 2); c.save(); c.font = U.F.ui(40, 600); c.fillStyle = "rgba(239,227,207,.55)";
    c.fillText(s, 80 + r() * 800, -100 + ((t * (300 + r() * 300) + r() * 1800) % 2000)); c.restore(); });
}) });
// 6 · 100 plugins
S.push({ at: at("a1_2", 2), sfx: [["pop", 0.05, 0.5]], ...counterShot(0, "plugins", 100, (c, t) => {
  ["FX", "LUT", "BLUR", "GLOW", "KEY", "3D", "WARP", "GRAIN", "MASK"].forEach((s, i) => {
    const r = rnd(i + 30), x = 120 + r() * 840, y = 300 + r() * 1300 - t * (40 + r() * 60), sz = 70 + r() * 70;
    c.save(); c.translate(x, y); c.rotate(deg((r() - 0.5) * 30)); c.fillStyle = "rgba(20,4,8,.75)"; c.strokeStyle = CREAM; c.lineWidth = 3;
    rr(c, -sz / 2, -sz / 2, sz, sz, 16); c.fill(); c.stroke(); c.font = U.F.ui(sz * 0.28, 800); c.fillStyle = CREAM; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, 2); c.restore(); });
}) });
// 7 · ghanton ka render
S.push({ at: at("a1_2", 4), tr: { type: "glitch", d: 0.22 }, sfx: [["tick", 0.1, 0.5]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  halftone(c, "cut_laptop", 540, 1150, 420, { alpha: 0.6 });
  serif(c, "RENDER", 540, 620, 150, 0, t, { color: PINK });
  const sec = lerp(0, 3 * 3600 + 17 * 60 + 42, win(0, Sh.dur, t));
  const hh = Math.floor(sec / 3600), mm = Math.floor(sec / 60) % 60, s = Math.floor(sec) % 60;
  c.save(); c.font = F2.didone(170); c.fillStyle = CREAM; c.textAlign = "center";
  c.fillText(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}`, 540, 900); c.restore();
  c.fillStyle = "rgba(239,227,207,.25)"; rr(c, 160, 960, 760, 20, 10); c.fill();
  c.fillStyle = RED; rr(c, 160, 960, 760 * lerp(0.02, 0.09, win(0, Sh.dur, t)), 20, 10); c.fill();
} });
// 8 · har mahine subscription ka bill
S.push({ at: at("a1_2", 9), tr: { type: "flash", d: 0.16, color: RED }, sfx: [["stamp", 0.4, 0.6]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.08, z1: 1.0, dur: Sh.dur });
  for (let i = 0; i < 16; i++) { const r = rnd(i + 70), y = -200 + ((t * (500 + r() * 400) + r() * 2100) % 2300);
    c.save(); c.globalAlpha = 0.75; c.translate(80 + r() * 920, y); c.rotate(deg(r() * 360 + t * 90)); c.font = U.F.lang("hi", 80 + r() * 90, 800); c.fillStyle = r() > 0.5 ? CREAM : PINK; c.fillText("₹", 0, 0); c.restore(); }
  serif(c, "HAR MAHINE", 540, 760, 100, 0, t, { italic: true });
  serif(c, "SUBSCRIPTION", 540, 920, 128, L(Sh, "a1_2", 10), t, { color: PINK });
  serif(c, "KA BILL.", 540, 1070, 120, L(Sh, "a1_2", 12), t);
  scribble(c, "circle", 540, 880, 980, 260, win(L(Sh, "a1_2", 12), L(Sh, "a1_2", 12) + 0.4, t));
} });
// 9 · ek reel edit karne baithe — the creator, framed in a hole like the reference's face
S.push({ at: at("a1_3", 0), tr: { type: "invert", d: 0.2 }, draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.1, dur: Sh.dur });
  c.save(); c.beginPath(); c.arc(540, 860, 400, 0, 7); c.clip();
  footage(c, "creator_phone", t + 1, 140, 460, 800, 800, { filter: "grayscale(1) contrast(1.3) brightness(.9)", fx: 0.5 }); c.restore();
  c.strokeStyle = CREAM; c.lineWidth = 4; c.beginPath(); c.arc(540, 860, 416, 0, 7); c.stroke();
  serif(c, "EK REEL", 540, 360, 130, 0, t);
  serif(c, "edit karne baithe…", 540, 1400, 80, L(Sh, "a1_3", 2), t, { italic: true, color: PINK });
} });
// 10 · aur poori shaam — the evening rolls past
S.push({ at: at("a1_3", 5), tr: { type: "blur", d: 0.3 }, sfx: [["tick", 0, 0.5]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  drift(c, t, ["7PM", "8PM", "9PM", "10PM", "11PM"], 11, { alpha: 0.3 });
  const m = lerp(19 * 60, 23 * 60 + 48, win(0, Sh.dur, t));
  serif(c, "POORI SHAAM", 540, 640, 110, 0, t, { italic: true });
  c.save(); c.font = F2.didone(250); c.fillStyle = CREAM; c.textAlign = "center";
  c.fillText(`${Math.floor(m / 60) - 12}:${String(Math.floor(m) % 60).padStart(2, "0")}`, 540, 960); c.restore();
  serif(c, "PM", 540, 1080, 90, 0, t, { color: PINK });
} });
// 11 · isi jaal mein chali gayi — a tentacle sweeps the frame
S.push({ at: at("a1_3", 8), tr: { type: "warp", d: 0.28 }, sfx: [["squish", 0.2, 0.6]], draw(c, t, gt, Sh) {
  bgCrimson(c);
  const k = apple(win(0, 1.2, t));
  cut(c, "cut_tentacle", lerp(1500, 520, k), lerp(1500, 900, k), 1700, { mode: "duo", tint: "#c43a4c", rot: deg(lerp(60, -15, k)) });
  serif(c, "ISI JAAL", 540, 520, 160, 0, t);
  serif(c, "MEIN.", 540, 690, 160, L(Sh, "a1_3", 10), t, { color: PINK });
} });
// 12 · Ab is jaal ko… (the scissors arrive)
S.push({ at: at("a1_4", 0), tr: { type: "glitch", d: 0.2 }, draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.05, z1: 1.12, dur: Sh.dur });
  halftone(c, "cut_octopus_1", 540, 920, 1100);
  const k = apple(win(0.2, Sh.dur, t));
  cut(c, "cut_scissors", lerp(1500, 760, k), lerp(400, 900, k), 560, { mode: "bw", rot: deg(lerp(-60, -30, k)) });
  serif(c, "AB IS JAAL KO…", 540, 360, 110, 0, t, { italic: true });
} });
// 13 · KAATO — the frame is cut in two (split transition) and light comes in
S.push({ at: at("a1_4", 4), tr: { type: "split", d: 0.6 }, sfx: [["snip", -0.05, 1], ["impact", 0.25, 0.7]], draw(c, t, gt, Sh) {
  bgCrimson(c);
  rays(c, 540, -60, 2100, deg(60), deg(120), "#ffd9b0", lerp(0.15, 0.55, win(0, Sh.dur, t)));
  serif(c, "KAATO!", 540, 980, 220, 0.05, t, { from: 1.6, glow: "rgba(255,200,160,.6)" });
  for (let i = 0; i < 6; i++) { const r = rnd(i + 90), g = t; cut(c, "cut_tentacle", 200 + r() * 700, 900 + g * g * 1400 * (0.6 + r()), 300 + r() * 200, { mode: "duo", tint: "#c43a4c", rot: deg(r() * 360 + g * 200), alpha: 0.9 }); }
} });
// 14 · VIBE EDITING (light)
S.push({ at: at("a1_5", 0), tr: { type: "flash", d: 0.2, color: "#fff4e6" }, sfx: [["buzz", 0, 0.5]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.1, z1: 1.0, dur: Sh.dur });
  rays(c, 540, -60, 2200, deg(55), deg(125), "#ffe2c2", 0.55);
  serif(c, "VIBE", 540, 860, 240, 0, t, { glow: "rgba(255,220,180,.7)" });
  serif(c, "EDITING", 540, 1080, 240, L(Sh, "a1_5", 1), t, { glow: "rgba(255,220,180,.7)", color: PINK });
} });
// 15 · aap bas bolte ho…
S.push({ at: at("a1_5", 3), tr: { type: "blur", d: 0.25 }, sfx: [["typewriter", 0.3, 0.5]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  rays(c, 540, -60, 2000, deg(65), deg(115), "#ffd9b0", 0.25);
  kinetic(c, [[["aap", 0], ["bas", L(Sh, "a1_5", 4)]], [["BOLTE HO", L(Sh, "a1_5", 5), PINK]]], t, { font: F2.bodoni(120), y: 500, lh: 140, color: CREAM, style: "rise" });
  promptBox(c, 540, 1000, 940, "30 sec ki reel: fast cuts, bold captions, Hindi + Tamil", win(0.3, Sh.dur - 0.2, t), { px: 40, bg: "#f4ece0", accent: RED });
} });
// 16 · aur AI code likhkar
S.push({ at: at("a1_5", 11), tr: { type: "glitch", d: 0.22 }, sfx: [["typewriter", 0.2, 0.6]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.08, dur: Sh.dur, r0: -1, r1: 1 });
  codePanel(c, 540, 930, 900, 720, win(0, Sh.dur, t), { rot: deg(-3), px: 27, bg: "#1a0508" });
  serif(c, "AI", 300, 470, 170, 0, t, { color: PINK });
  serif(c, "code likhta hai", 600, 460, 76, L(Sh, "a1_5", 13), t, { italic: true });
} });
// 17 · poora edit bana deta hai — a real video, made this way
S.push({ at: at("a1_5", 15), tr: { type: "warp", d: 0.3 }, sfx: [["chime", 0.3, 0.6]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur });
  rays(c, 540, 860, 1100, 0, Math.PI * 2, "#ffcfa8", 0.3);
  phone(c, 540, 880, 1000, deg(-3), (cc, pw, ph) => reel(cc, pw, ph, t + 1));
  serif(c, "POORA EDIT ✓", 540, 1540, 100, 0.3, t, { color: CREAM });
} });
// 18–21 · Hindi / Tamil / Bangla / every language
const SCRIPT = (lang, s, sub) => ({ draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.15, z1: 1.0, dur: Sh.dur });
  drift(c, t, ["बोलो", "பேசு", "বলো", "బోలో", "બોલો", "ಹೇಳಿ"], 21 + s.length, { alpha: 0.18 });
  c.save(); c.font = U.F.lang(lang, 260); c.fillStyle = CREAM; c.textAlign = "center"; c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 30;
  const e = spring(t, 0, 0.4); c.translate(540, 980); c.scale(lerp(1.6, 1, clamp(e)), lerp(1.6, 1, clamp(e))); c.fillText(s, 0, 0); c.restore();
  serif(c, sub, 540, 1140, 80, 0.15, t, { italic: true, color: PINK });
} });
S.push({ at: at("a1_6", 0), tr: { type: "invert", d: 0.16 }, sfx: [["impact", 0, 0.5]], ...SCRIPT("hi", "हिंदी", "mein bolo") });
S.push({ at: at("a1_6", 3), tr: { type: "warp", d: 0.22 }, ...SCRIPT("ta", "தமிழ்", "mein bolo") });
S.push({ at: at("a1_6", 6), tr: { type: "warp", d: 0.22 }, ...SCRIPT("bn", "বাংলা", "mein bolo") });
const RING = [["hi", "हिंदी"], ["ta", "தமிழ்"], ["bn", "বাংলা"], ["te", "తెలుగు"], ["mr", "मराठी"], ["gu", "ગુજરાતી"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]];
S.push({ at: at("a1_6", 9), tr: { type: "glitch", d: 0.2 }, draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  phone(c, 540, 900, 760, deg(2), (cc, pw, ph) => reel(cc, pw, ph, t + 3));
  RING.forEach(([l, s], i) => {
    const a = (i / RING.length) * Math.PI * 2 + t * 0.6, e = spring(t, i * 0.06, 0.4);
    if (e <= 0) return;
    c.save(); c.globalAlpha = clamp(e * 2); c.translate(540 + Math.cos(a) * 430, 900 + Math.sin(a) * 640); c.scale(e, e);
    c.font = U.F.lang(l, 64); c.fillStyle = i % 2 ? PINK : CREAM; c.textAlign = "center"; c.fillText(s, 0, 0); c.restore();
  });
} });
// 22 · Timeline nahi
S.push({ at: at("a1_7", 0), tr: { type: "invert", d: 0.18 }, draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  laptop(c, 540, 1000, 560, deg(-2), (cc, w, h) => timelineUI(cc, w, h, t), { mode: "bw" });
  serif(c, "TIMELINE", 540, 560, 170, 0, t);
  scribble(c, "cross", 540, 1000, 820, 520, win(L(Sh, "a1_7", 1), L(Sh, "a1_7", 1) + 0.35, t), { lw: 14 });
} });
// 23 · seedhi baat
S.push({ at: at("a1_7", 2), tr: { type: "blur", d: 0.2 }, draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur });
  serif(c, "seedhi baat.", 540, 980, 170, 0, t, { italic: true, glow: "rgba(255,200,180,.4)" });
} });
// 24 · yahi hai editing ka naya daur — a year counter rolls to 2026
S.push({ at: at("a1_7", 4), tr: { type: "warp", d: 0.26 }, sfx: [["riser", -0.2, 0.4]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.0, z1: 1.08, dur: Sh.dur });
  rays(c, 540, -60, 2000, deg(60), deg(120), "#ffd9b0", 0.3);
  serif(c, "EDITING KA", 540, 640, 100, 0, t, { italic: true });
  serif(c, "NAYA DAUR", 540, 820, 170, L(Sh, "a1_7", 8), t, { color: PINK });
  odometer(c, lerp(1913, 2026, outCubic(win(0, Sh.dur * 0.8, t))), 540, 1090, F2.didone(220), { color: CREAM, max: 2026 });
} });
// 25 · CTA + chorus
S.push({ at: at("a1_8", 0), tr: { type: "flash", d: 0.22, color: "#fff4e6" }, sfx: [["chime", [ "a1_8", 4 ], 0.8]], draw(c, t, gt, Sh) {
  bgCrimson(c); cam(c, t, { z0: 1.04, z1: 1.0, dur: 3 });
  rays(c, 540, -60, 2200, deg(55), deg(125), "#ffe2c2", 0.45);
  drift(c, t, ["जॉइन", "சேர்", "যোগ", "చేరండి", "જોડાઓ", "ಸೇರಿ"], 41, { alpha: 0.16 });
  serif(c, "aaj hi", 540, 330, 80, 0, t, { italic: true });
  serif(c, "VIBE", 540, 520, 190, L(Sh, "a1_8", 2), t, { glow: "rgba(255,220,180,.6)" });
  serif(c, "EDITING", 540, 690, 190, L(Sh, "a1_8", 3), t, { glow: "rgba(255,220,180,.6)", color: PINK });
  phone(c, 540, 1010 + (1 - spring(t, 0.3, 0.8)) * 900, 420, deg(-3), (cc, pw, ph) => reel(cc, pw, ph, t));
  joinButton(c, 540, 1300, gt, Sh.start + L(Sh, "a1_8", 4), { bg: CREAM, fg: DEEP, text: "JOIN VIBE EDITING  →", font: F2.bodoni(54), w: 760, h: 130 });
  chorusPills(c, gt, [[300, 1470, -4], [780, 1450, 4], [320, 1610, 3], [770, 1630, -3]], { px: 38, bg: (i) => (i % 2 ? PINK : CREAM), fg: () => DEEP });
} });

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha * 0.95;
  c.font = U.F.ui(44, 700); const s = ws.join(" "), tw = c.measureText(s).width, sp = c.measureText(" ").width;
  let x = 540 - tw / 2;
  c.shadowColor = "rgba(0,0,0,.7)"; c.shadowBlur = 14;
  ws.forEach((q, i) => { c.fillStyle = i === active ? "#ff8a92" : CREAM; c.textBaseline = "middle"; c.fillText(q, x, 1600); x += c.measureText(q).width + sp; });
  c.restore();
}

window.AD = { shots: S, caption, grain: 0.26, music: "music_b1",
  images: ["cut_octopus_1", "cut_tentacle", "cut_laptop", "cut_scissors", "paper_white"] };
})();

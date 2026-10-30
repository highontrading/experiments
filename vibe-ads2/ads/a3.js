// Ad 3 v2 · "Ek Video, Poora India" — maximalist (reference 5): heavy red/blue block type, real hands
// holding things toward camera, pixel odometers, sticky notes and tape on graph paper, zoom-blur
// warps with RGB split, full-bleed real city footage.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { cut, codePanel, promptBox, phone, handPhone, reel, chorusPills, joinButton, FX } = K;
const { deg, W_, F2, cam, shake, kinetic, odometer, scribble, sticker, extruded, bgGraph } = FX2;
const RED = "#e0232e", BLUE = "#1f49d6", INK = "#141414", YEL = "#ffd83d";
const at = (id, n = 0, o = 0) => [id, n, o];
const L = (S, id, n = 0, o = 0) => W_(id, n, o) - S.start;

function studio(c, col = "#e8e8ec") {
  const g = c.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, H * 0.8); g.addColorStop(0, "#fafafa"); g.addColorStop(1, col);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
// heavy block word that slams in from big
function block(c, s, x, y, px, col, t0, t, o = {}) {
  const e = win(t0, t0 + 0.18, t); if (e <= 0) return;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.font = F2.black(px);
  const tw = c.measureText(s).width, fit = Math.min(1, (o.maxW || 1000) / tw), k = lerp(o.from || 2.2, 1, outCubic(e)) * fit;
  c.scale(k, k); c.globalAlpha = clamp(e * 3); c.textAlign = "center"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
  if (o.stroke) { c.lineWidth = px * 0.08; c.strokeStyle = o.stroke; c.strokeText(s, 0, 0); }
  c.fillStyle = "rgba(0,0,0,.18)"; c.fillText(s, 6, 10); c.fillStyle = col; c.fillText(s, 0, 0); c.restore();
}
// a pixel-font counter in boxed cells, like the "200 → 250" counter
function pixelCount(c, v, x, y, o = {}) {
  const s = String(Math.floor(v)).padStart(o.digits || 1, "0"), cw = o.cw || 150, ch = o.ch || 200;
  c.save(); c.translate(x - (s.length * cw) / 2, y - ch / 2);
  c.fillStyle = o.frame || "#ff7a1a"; rr(c, -18, -18, s.length * cw + 36, ch + 36, 26); c.fill();
  for (let i = 0; i < s.length; i++) { c.fillStyle = "#111"; rr(c, i * cw + 6, 6, cw - 12, ch - 12, 14); c.fill(); }
  c.restore();
  odometer(c, v, x, y, F2.pixel(o.px || 150), { color: "#fff", digits: s.length, spacing: 1.0 });
}
const note = (c, s, x, y, col, t0, t, o = {}) => { const e = spring(t, t0, 0.4); if (e > 0) sticker(c, s, x, y - (1 - e) * 80, o.font || U.F.hand(70), { bg: col, fg: INK, s: 0.6 + 0.4 * e, rot: o.rot || 0, h: o.h || 170, pad: o.pad || 80, tape: true }); };
const SUB = { hi: "भारत का एक दिन", ta: "இந்தியாவில் ஒரு நாள்", bn: "ভারতের একটি দিন", te: "భారతదేశంలో ఒక రోజు", mr: "भारतातील एक दिवस", gu: "ભારતનો એક દિવસ",
  kn: "ಭಾರತದಲ್ಲಿ ಒಂದು ದಿನ", ml: "ഇന്ത്യയിലെ ഒരു ദിവസം", pa: "ਭਾਰਤ ਵਿੱਚ ਇੱਕ ਦਿਨ" };
function vcard(cc, w, h, lang, clip, t) {
  footage(cc, clip, t, 0, 0, w, h, { mode: "loop" });
  const g = cc.createLinearGradient(0, h * 0.55, 0, h); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.65)"); cc.fillStyle = g; cc.fillRect(0, 0, w, h);
  let fs = Math.round(w * 0.085); cc.font = U.F.lang(lang, fs); while (cc.measureText(SUB[lang]).width > w * 0.88) { fs -= 2; cc.font = U.F.lang(lang, fs); }
  cc.fillStyle = "#fff"; cc.textAlign = "center"; cc.fillText(SUB[lang], w / 2, h * 0.88);
}

const S = [];
// 1 · EK VIDEO — a real fist punches toward camera
S.push({ at: 0, sfx: [["impact", 0.3, 0.8]], draw(c, t, gt, Sh) {
  studio(c); cam(c, t, { z0: 1.0, z1: 1.05, dur: Sh.dur }); shake(c, t, 0.3, 16);
  block(c, "EK", 540, 700, 380, RED, 0.28, t);
  block(c, "VIDEO", 540, 1060, 330, BLUE, W_("a3_1", 1) - Sh.start, t);
  const k = apple(win(0.1, 0.9, t)), z = lerp(0.6, 1.25, k);
  cut(c, "cut_hand_point", 540, lerp(2200, 1650, k), 1350 * z, { ay: 0.5, rot: deg(-8) });
} });
// 2 · aur poora India dekhe — landmarks bounce around POORA INDIA
S.push({ at: at("a3_1", 3), tr: { type: "warp", d: 0.28 }, draw(c, t, gt, Sh) {
  studio(c, "#e2e6f2"); cam(c, t, { z0: 1.08, z1: 1.0, dur: Sh.dur });
  const LM = [["cut_indiagate", 230, 1520, 470, 0.0], ["cut_tajmahal", 820, 1560, 260, 0.08], ["cut_gateway", 840, 560, 300, 0.16], ["cut_charminar", 220, 560, 360, 0.24],
    ["cut_victoria", 540, 1620, 230, 0.32], ["cut_taxi", 800, 1250, 170, 0.4]];
  LM.forEach(([n, x, y, h, d], i) => { const e = spring(t, d, 0.45); if (e <= 0) return; const b = Math.abs(Math.sin(t * 6 + i)) * 10;
    cut(c, n, x, y - b, h * (0.5 + 0.5 * e), { mode: i % 2 ? "color" : "bw", ay: 0.8 }); });
  block(c, "POORA", 540, 980, 250, RED, 0.05, t, { rot: deg(-3) });
  block(c, "INDIA", 540, 1220, 300, BLUE, L(Sh, "a3_1", 5), t, { rot: deg(2) });
} });
// 3 · phir se edit / captions / voice — pixel counters climb ×9
S.push({ at: at("a3_2", 0), tr: { type: "glitch", d: 0.22 }, sfx: [["stamp", [ "a3_2", 7 ], 0.6], ["stamp", [ "a3_2", 10 ], 0.6], ["stamp", [ "a3_2", 13 ], 0.6]], draw(c, t, gt, Sh) {
  bgGraph(c); cam(c, t, { z0: 1.0, z1: 1.05, dur: Sh.dur });
  block(c, "HAR BHASHA KE LIYE…", 540, 300, 74, INK, 0.05, t, { from: 1.4 });
  [["PHIR SE EDIT", 7, 520], ["PHIR SE CAPTIONS", 10, 900], ["PHIR SE VOICE", 13, 1280]].forEach(([s, n, y], i) => {
    const t0 = L(Sh, "a3_2", n); if (t < t0 - 0.05) return;
    note(c, s, 330, y, [YEL, "#9fe0ff", "#ffa8c8"][i], t0 - 0.05, t, { font: F2.black(46), h: 120, pad: 50, rot: deg(i % 2 ? 3 : -3) });
    c.save(); c.translate(800, y); c.scale(0.55, 0.55); pixelCount(c, 1 + 8 * outCubic(win(t0, t0 + 0.8, t)), 0, 0, { cw: 150, ch: 200 }); c.restore();
    c.font = F2.black(54); c.fillStyle = RED; c.fillText("×", 690, y + 20);
  });
} });
// 4 · Itna time kiske paas hai?
S.push({ at: at("a3_2", 14), tr: { type: "warp", d: 0.26 }, sfx: [["tick", 0.05, 0.6]], draw(c, t, gt, Sh) {
  studio(c, "#f0d9d9"); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur });
  c.save(); c.translate(540, 1080); c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 18; c.beginPath(); c.arc(0, 0, 300, 0, 7); c.fill(); c.stroke();
  for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * Math.PI / 6); c.fillStyle = INK; c.fillRect(-6, -280, 12, 40); c.restore(); }
  c.lineCap = "round"; c.lineWidth = 16; c.beginPath(); c.moveTo(0, 0); const a = t * 14; c.lineTo(Math.sin(a) * 230, -Math.cos(a) * 230); c.stroke();
  c.strokeStyle = RED; c.lineWidth = 10; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(a / 12) * 170, -Math.cos(a / 12) * 170); c.stroke(); c.restore();
  block(c, "ITNA TIME", 540, 560, 210, RED, 0.02, t, { stroke: "#fff" });
  block(c, "KISKE PAAS?", 540, 1580, 150, BLUE, L(Sh, "a3_2", 16), t, { stroke: "#fff" });
} });
// 5 · Vibe Editing mein bas ek line bolo
S.push({ at: at("a3_3", 0), tr: { type: "warp", d: 0.28 }, draw(c, t, gt, Sh) {
  studio(c, "#dfe5ff"); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  block(c, "VIBE", 540, 640, 320, RED, 0.02, t);
  block(c, "EDITING", 540, 900, 250, BLUE, L(Sh, "a3_3", 1), t);
  note(c, "bas EK LINE bolo", 540, 1260, YEL, L(Sh, "a3_3", 4), t, { font: F2.black(60), h: 140, pad: 70, rot: deg(-3) });
} });
// 6 · 'Ise Tamil mein bhi banao.' — a real hand, the captions flip
S.push({ at: at("a3_3", 7), tr: { type: "glitch", d: 0.2 }, sfx: [["typewriter", 0.05, 0.6]], draw(c, t, gt, Sh) {
  studio(c); cam(c, t, { z0: 1.05, z1: 1.0, dur: Sh.dur });
  const flip = win(L(Sh, "a3_3", 12) - 0.15, L(Sh, "a3_3", 12) + 0.2, t);
  c.save(); c.translate(470, 1180); c.scale(Math.max(0.02, Math.abs(Math.cos(Math.PI * flip))), 1); c.translate(-470, -1180);
  handPhone(c, 470, 1180, 1500, deg(-2), (cc, pw, ph) => vcard(cc, pw, ph, flip < 0.5 ? "hi" : "ta", "marina", t)); c.restore();
  promptBox(c, 540, 330, 940, "Ise Tamil mein bhi banao.", win(0, L(Sh, "a3_3", 11) - 0.2, t), { px: 46, accent: BLUE });
} });
// 7 · Ho gaya!
S.push({ at: at("a3_3", 12, 0.12), tr: { type: "flash", d: 0.16, color: YEL }, sfx: [["chime", 0, 0.7]], draw(c, t, gt, Sh) {
  studio(c, "#fff3c4"); cam(c, t, { z0: 1.1, z1: 1.0, dur: Sh.dur });
  "அ अ অ అ ગ ಕ മ ਪ म".split(" ").forEach((g, i) => { const r = rnd(i + 5), a = r() * 7, d = 200 + t * (900 + r() * 500);
    c.save(); c.globalAlpha = 1 - clamp(t / 1.2); c.font = U.F.lang(["ta", "hi", "bn", "te", "gu", "kn", "ml", "pa", "mr"][i], 90); c.fillStyle = i % 2 ? RED : BLUE;
    c.fillText(g, 540 + Math.cos(a) * d, 980 + Math.sin(a) * d); c.restore(); });
  block(c, "HO GAYA!", 540, 1020, 230, RED, 0.0, t, { stroke: "#fff" });
} });
// 8–11 · Delhi, Chennai, Kolkata, Mumbai — real cities, names in their own scripts, a taxi tearing across
const CITIES = [[0, "india_city", "दिल्ली", "hi", RED], [2, "marina", "சென்னை", "ta", BLUE], [3, "howrah", "কলকাতা", "bn", RED], [5, "local", "मुंबई", "mr", BLUE]];
CITIES.forEach(([n, clip, name, lang, col], i) => S.push({ at: at("a3_4", n), tr: { type: "warp", d: 0.24 }, draw(c, t, gt, Sh) {
  footage(c, clip, t + 1, 0, 0, W, H, { mode: "loop", z: 1.2 + 0.05 * t, filter: "contrast(1.15) saturate(1.25)" });
  c.fillStyle = "rgba(0,0,0,.2)"; c.fillRect(0, 0, W, H);
  cam(c, t, { z0: 1.0, z1: 1.04, dur: Sh.dur });
  const e = win(0, 0.18, t);
  c.save(); c.translate(540, 920); c.scale(lerp(2.2, 1, outCubic(e)), lerp(2.2, 1, outCubic(e))); c.globalAlpha = clamp(e * 3);
  c.font = U.F.lang(lang, 220); c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 22; c.strokeStyle = "#fff"; c.strokeText(name, 0, 0); c.fillStyle = col; c.fillText(name, 0, 0); c.restore();
  if (i === 0) cut(c, "cut_indiagate", 540, 1680, 520, { mode: "bw", ay: 1 });
  const k = win(0, Sh.dur, t); cut(c, "cut_taxi", lerp(-300, 1400, k), 1420, 230, { flip: i % 2 === 1 });
} }));
// 12 · ek hi video, nau bhashaon mein — the counter rolls to 9, nine phones
S.push({ at: at("a3_4", 7), tr: { type: "warp", d: 0.26 }, sfx: [["pop", [ "a3_4", 10 ], 0.6]], draw(c, t, gt, Sh) {
  studio(c); cam(c, t, { z0: 1.0, z1: 1.04, dur: Sh.dur });
  const k = L(Sh, "a3_4", 10);
  if (t < k) { pixelCount(c, 1 + 8 * outCubic(win(0, k, t)), 540, 900, { cw: 260, ch: 340, px: 260 }); block(c, "EK HI VIDEO", 540, 1300, 130, RED, 0.02, t); }
  else {
    ["hi", "ta", "bn", "te", "mr", "gu", "kn", "ml", "pa"].forEach((l, i) => { const e = spring(t, k + i * 0.05, 0.35); if (e <= 0) return;
      phone(c, 200 + (i % 3) * 340, 520 + Math.floor(i / 3) * 400 + (1 - e) * 60, 370, deg(i % 2 ? 3 : -3), (cc, pw, ph) => vcard(cc, pw, ph, l, ["ghat", "marina", "howrah", "charminar", "local", "kites", "marina", "ghat", "india_city"][i], t)); });
    block(c, "9 BHASHAYEIN", 540, 1700, 120, BLUE, k + 0.3, t, { stroke: "#fff" });
  }
} });
// 13 · Captions, voice, timing — sticky notes slapped down by a real hand
S.push({ at: at("a3_5", 0), tr: { type: "glitch", d: 0.22 }, sfx: [["thud", [ "a3_5", 0 ], 0.7], ["thud", [ "a3_5", 1 ], 0.7], ["thud", [ "a3_5", 2 ], 0.7]], draw(c, t, gt, Sh) {
  bgGraph(c); cam(c, t, { z0: 1.05, z1: 1.0, dur: Sh.dur });
  [["CAPTIONS ✓", 0, 330, 620, YEL, -4], ["VOICE ✓", 1, 760, 900, "#9fe0ff", 4], ["TIMING ✓", 2, 330, 1180, "#ffa8c8", -2]].forEach(([s, n, x, y, col, r]) => {
    const t0 = L(Sh, "a3_5", n); note(c, s, x, y, col, t0, t, { font: F2.black(64), h: 170, rot: deg(r) });
    if (t > t0 - 0.25 && t < t0 + 0.35) cut(c, "cut_hand_pinch", x + 40, y - 40 - (1 - clamp((t - t0 + 0.25) / 0.25)) * 300, 520, { ay: 0.92 });
  });
} });
// 14 · sab code se, apne aap
S.push({ at: at("a3_5", 4), tr: { type: "warp", d: 0.26 }, draw(c, t, gt, Sh) {
  studio(c, "#d9def0"); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur, r0: -1, r1: 1 });
  codePanel(c, 540, 1000, 900, 700, win(0, Sh.dur, t), { rot: deg(-3), px: 27 });
  block(c, "SAB CODE SE", 540, 480, 150, RED, 0.02, t, { stroke: "#fff" });
  block(c, "APNE AAP", 540, 1560, 150, BLUE, L(Sh, "a3_5", 7), t, { stroke: "#fff" });
} });
// 15 · Editing ka future multilingual hai
S.push({ at: at("a3_6", 0), tr: { type: "warp", d: 0.26 }, draw(c, t, gt, Sh) {
  studio(c, "#ffe9b0"); cam(c, t, { z0: 1.1, z1: 1.0, dur: Sh.dur });
  "अ த ক అ ગ ಕ മ ਪ म A".split(" ").forEach((g, i) => { const r = rnd(i + 11), a = (i / 10) * Math.PI * 2 + t * 0.4, d = 520 + Math.sin(t * 3 + i) * 30;
    c.save(); c.font = i === 9 ? F2.black(110) : U.F.lang(["hi", "ta", "bn", "te", "gu", "kn", "ml", "pa", "mr"][i], 110); c.fillStyle = i % 2 ? RED : BLUE; c.textAlign = "center";
    c.fillText(g, 540 + Math.cos(a) * d * 0.85, 1000 + Math.sin(a) * d); c.restore(); });
  block(c, "FUTURE =", 540, 940, 190, INK, 0.02, t);
  block(c, "MULTILINGUAL", 540, 1130, 170, RED, L(Sh, "a3_6", 3), t, { stroke: "#fff" });
} });
// 16 · CTA: join karo, har bhasha mein chha jao + 8-language chorus
S.push({ at: at("a3_7", 0), tr: { type: "flash", d: 0.2, color: YEL }, sfx: [["chime", [ "a3_7", 3 ], 0.8]], draw(c, t, gt, Sh) {
  studio(c); cam(c, t, { z0: 1.04, z1: 1.0, dur: 3 });
  block(c, "VIBE", 540, 450, 300, RED, 0.02, t);
  block(c, "EDITING", 540, 700, 240, BLUE, L(Sh, "a3_7", 1), t);
  joinButton(c, 540, 930, gt, Sh.start + L(Sh, "a3_7", 2), { bg: RED, text: "JOIN NOW  →", font: F2.black(64), w: 620, h: 140 });
  const k = apple(win(0.2, 1.0, t)); cut(c, "cut_hand_point", 540, lerp(2400, 1850, k), 1000, { ay: 0.5, rot: deg(-6) });
  chorusPills(c, gt, [[290, 1120, -5], [790, 1160, 5], [300, 1260, 3], [780, 1300, -4], [290, 1400, -3], [790, 1440, 4], [300, 1540, 2], [780, 1580, -2]],
    { px: 34, bg: (i) => [YEL, "#9fe0ff", "#ffa8c8", "#fff"][i % 4], fg: () => INK });
} });

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = F2.black(50); const sp = c.measureText(" ").width, up = ws.map((s) => s.toUpperCase()), widths = up.map((s) => c.measureText(s).width);
  let x = 540 - (widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1)) / 2; c.textBaseline = "middle"; c.lineJoin = "round";
  up.forEach((q, i) => { c.lineWidth = 12; c.strokeStyle = INK; c.strokeText(q, x, 1600); c.fillStyle = i === active ? YEL : "#fff"; c.fillText(q, x, 1600); x += widths[i] + sp; });
  c.restore();
}
window.AD = { shots: S, caption, grain: 0.16,
  images: ["cut_hand_point", "cut_hand_pinch", "cut_hand_phone_screenhole", "cut_indiagate", "cut_tajmahal", "cut_gateway", "cut_charminar", "cut_victoria", "cut_taxi", "paper_white"],
  photos: ["marina", "kites"] };
})();

// Ad 2 v2 · "1913 se Future" — cinematic storytelling (reference 3): graded full-bleed footage with
// slow dolly pushes, extruded yellow titles, torn sticker labels, serif italics on woven fabric,
// spotlit rooms, focus-pull transitions, a clean white studio for the payoff.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { cut, codePanel, promptBox, phone, handPhone, reel, laptop, timelineUI, chorusPills, joinButton, FX } = K;
const { deg, W_, F2, cam, shake, kinetic, odometer, scribble, sticker, extruded, rays, bgFabric, bgRoom, bgWhite } = FX2;
const RED = "#d8262f", YEL = "#f6d23a";
const at = (id, n = 0, o = 0) => [id, n, o];
const L = (S, id, n = 0, o = 0) => W_(id, n, o) - S.start;

// a graded full-bleed clip: teal shadows, warm highlights, vignette
function film(c, clip, t, o = {}) {
  footage(c, clip, (o.t0 || 0) + t * (o.speed ?? 1), 0, 0, W, H, { mode: "loop", fx: o.fx ?? 0.5, fy: o.fy ?? 0.5, z: (o.z || 1.15) * (1 + 0.03 * t),
    filter: o.filter || "contrast(1.15) saturate(1.15)" });
  c.save(); c.globalCompositeOperation = "soft-light"; c.fillStyle = o.tint || "rgba(0,90,110,.45)"; c.fillRect(0, 0, W, H); c.restore();
  const v = c.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.72); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.7)");
  c.fillStyle = v; c.fillRect(0, 0, W, H);
}
function title(c, s, x, y, px, t0, t, o = {}) {
  const e = spring(t, t0, 0.5); if (e <= 0) return;
  c.save(); c.font = o.font || F2.black(px); const tw = c.measureText(s).width; c.restore();
  const fit = Math.min(1, 980 / tw);
  extruded(c, s, x, y, o.font || F2.black(px), { s: fit * lerp(1.3, 1, clamp(e)), alpha: clamp(e * 2), rot: o.rot || 0, depth: o.depth ?? 12,
    top: o.top || "#fff07a", bot: o.bot || YEL, side: o.side || "#6e4b00", stroke: o.stroke, flat: o.flat });
}
const italic = (c, s, x, y, px, t0, t, o = {}) => kinetic(c, [s.split(" ").map((w, i) => [w, t0 + i * (o.gap ?? 0.12)])], t, { font: F2.playI(px), x, y, color: o.color || "#f3ead8", style: "blur", shadow: "rgba(0,0,0,.5)" });
const label = (c, s, x, y, t0, t, o = {}) => { const e = spring(t, t0, 0.4); if (e > 0) sticker(c, s, x, y, o.font || U.F.ui(50, 800), { bg: o.bg || RED, fg: o.fg || "#fff", s: e, rot: o.rot ?? deg(-3), h: o.h || 96, tape: o.tape }); };

const S = [];
// 1 · 1913.
S.push({ at: 0, sfx: [["projector", 0.1, 0.5], ["impact", 0.3, 0.7]], draw(c, t, gt, Sh) {
  film(c, "harishchandra", t, { filter: "grayscale(1) sepia(.45) contrast(1.2)", tint: "rgba(120,80,30,.35)", z: 1.25 });
  cam(c, t, { z0: 1.0, z1: 1.04, dur: Sh.dur }); shake(c, t, 0.32, 14);
  title(c, "1913", 540, 1180, 300, 0.3, t, { depth: 18 });
} });
// 2 · Dadasaheb Phalke, under a spotlight
S.push({ at: at("a2_1", 1), tr: { type: "blur", d: 0.35 }, draw(c, t, gt, Sh) {
  bgRoom(c); cam(c, t, { z0: 1.0, z1: 1.1, dur: Sh.dur });
  cut(c, "cut_phalke", 540, 1020, 1150, { mode: "bw", shadowColor: "rgba(0,0,0,.8)", blur: 60, sy: 30 });
  label(c, "Dadasaheb Phalke", 560, 1440, 0.25, t, { rot: deg(-4) });
} });
// 3 · Bharat ki pehli feature film — on a screen in the dark
S.push({ at: at("a2_1", 4), tr: { type: "blur", d: 0.3 }, draw(c, t, gt, Sh) {
  bgRoom(c, "#cfe3ff"); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur });
  c.save(); c.shadowColor = "rgba(180,210,255,.45)"; c.shadowBlur = 90; c.fillStyle = "#000"; c.fillRect(110, 520, 860, 660); c.restore();
  footage(c, "harishchandra", t + 2, 130, 540, 820, 620, { filter: "grayscale(1) contrast(1.2) brightness(1.05)" });
  title(c, "BHARAT KI PEHLI", 540, 400, 92, 0.05, t, { depth: 8 });
  title(c, "FEATURE FILM", 540, 1380, 118, L(Sh, "a2_1", 7), t, { depth: 10 });
  italic(c, "Raja Harishchandra, 1913", 540, 1500, 54, L(Sh, "a2_1", 8), t);
} });
// 4 · haathon se kaat-kaat kar joda — a strip of film cut by hand on red cloth
S.push({ at: at("a2_1", 10), tr: { type: "whip", d: 0.3 }, sfx: [["snip", [ "a2_1", 14 ], 1], ["snip", [ "a2_1", 14, 0.25 ], 0.8]], draw(c, t, gt, Sh) {
  bgFabric(c, "red"); cam(c, t, { z0: 1.0, z1: 1.12, dur: Sh.dur, r0: -2, r1: 1 });
  const k1 = L(Sh, "a2_1", 14), cutK = clamp((t - k1) / 0.8);
  cut(c, "cut_filmstrip", 470, 960, 360, { rot: deg(-8), mode: "color" });
  if (t > k1) cut(c, "cut_filmstrip", 980 + cutK * 120, 960 + cutK * cutK * 900, 360, { rot: deg(-8 + cutK * 60), s: 0.45 });
  const sc = apple(win(0, k1 - 0.05, t)), snap = (t > k1 && t < k1 + 0.1) || (t > k1 + 0.25 && t < k1 + 0.35);
  cut(c, "cut_scissors", lerp(1400, 860, sc), lerp(600, 900, sc), 520, { rot: deg(-40 + (snap ? 14 : 0)) });
  if (t > k1) shake(c, t, k1, 12);
  label(c, "haathon se", 330, 560, 0.15, t, { bg: YEL, fg: "#111", rot: deg(4), tape: true });
} });
// 5–7 · then machines, computers, timelines — each in the dark under a light
const machine = (draw, name, year) => ({ draw(c, t, gt, Sh) {
  bgRoom(c); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur, x0: 30, x1: -30 });
  draw(c, t); label(c, name, 540, 1440, 0.1, t, { rot: deg(-2) });
  if (year) title(c, year, 540, 420, 150, 0.05, t, { depth: 10 });
} });
S.push({ at: at("a2_2", 0), tr: { type: "blur", d: 0.3 }, sfx: [["buzz", 0, 0.5]], ...machine((c, t) => {
  cut(c, "cut_moviola", 380, 1000, 860, { mode: "bw", shadowColor: "rgba(0,0,0,.8)", blur: 50 });
  cut(c, "cut_steenbeck", 780, 1170, 380, { mode: "bw", shadowColor: "rgba(0,0,0,.8)", blur: 50 });
}, "EDITING MACHINES", "1924") });
S.push({ at: at("a2_2", 4), tr: { type: "whip", d: 0.26 }, ...machine((c, t) => {
  laptop(c, 540, 1000, 560, 0, (cc, w, h) => { cc.fillStyle = "#0b1a2a"; cc.fillRect(0, 0, w, h); cc.fillStyle = "#3b6ea8"; cc.font = U.F.ui(26, 600); cc.fillText("C:\\> _", 20, 40); });
}, "COMPUTER", "1990") });
S.push({ at: at("a2_2", 6), tr: { type: "whip", d: 0.26 }, ...machine((c, t) => {
  c.save(); c.shadowColor = "rgba(120,160,255,.5)"; c.shadowBlur = 80; laptop(c, 540, 1000, 600, 0, (cc, w, h) => timelineUI(cc, w, h, t)); c.restore();
}, "TIMELINE", "2005") });
// 8 · Sau saal badal gaye…
S.push({ at: at("a2_3", 0), tr: { type: "blur", d: 0.35 }, draw(c, t, gt, Sh) {
  bgFabric(c, "navy"); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  italic(c, "Sau saal badal gaye…", 540, 880, 92, 0.05, t, { gap: 0.18 });
  odometer(c, lerp(1913, 2025, outCubic(win(0.2, Sh.dur, t))), 540, 1080, F2.didone(120), { color: "#f3ead8", max: 2025 });
} });
// 9 · par kaam wahi raha
S.push({ at: at("a2_3", 4), tr: { type: "blur", d: 0.25 }, draw(c, t, gt, Sh) {
  film(c, "editing_vintage", t, { z: 1.25, filter: "grayscale(.6) contrast(1.2)", tint: "rgba(0,110,120,.5)" });
  cam(c, t, { z0: 1.0, z1: 1.05, dur: Sh.dur });
  italic(c, "par kaam wahi raha:", 540, 1250, 80, 0.05, t);
} });
// 10 · clip kheencho, kaato, jodo
S.push({ at: at("a2_3", 8), sfx: [["thud", [ "a2_3", 9 ], 0.7], ["snip", [ "a2_3", 10 ], 0.8], ["thud", [ "a2_3", 11 ], 0.7]], draw(c, t, gt, Sh) {
  film(c, "editing_vintage", t + 3, { z: 1.6, fx: 0.4, fy: 0.55, filter: "grayscale(.6) contrast(1.25)", tint: "rgba(0,110,120,.5)" });
  [[9, "kheencho", 300, 620, -6], [10, "kaato", 760, 900, 5], [11, "jodo", 360, 1180, -3]].forEach(([n, s, x, y, r]) => {
    const t0 = L(Sh, "a2_3", n); label(c, s, x, y, t0, t, { bg: YEL, fg: "#111", rot: deg(r), font: U.F.ui(64, 900), h: 120, tape: true });
    if (t > t0) shake(c, t, t0, 10);
  });
} });
// 11 · Ghanton tak…
S.push({ at: at("a2_3", 12), tr: { type: "blur", d: 0.25 }, sfx: [["tick", 0, 0.5]], draw(c, t, gt, Sh) {
  film(c, "typing", t, { z: 1.2, filter: "contrast(1.1) saturate(.7) brightness(.7)", tint: "rgba(20,40,120,.6)" });
  cam(c, t, { z0: 1.0, z1: 1.08, dur: Sh.dur });
  title(c, "GHANTON TAK…", 540, 1000, 150, 0.05, t, { depth: 12 });
} });
// 12 · Ab editing ka sabse bada experiment
S.push({ at: at("a2_4", 0), tr: { type: "blur", d: 0.35 }, sfx: [["riser", 0.1, 0.5]], draw(c, t, gt, Sh) {
  bgFabric(c, "red"); cam(c, t, { z0: 1.0, z1: 1.08, dur: Sh.dur, r0: 2, r1: -1 });
  italic(c, "ab editing ka sabse bada", 540, 820, 70, 0.05, t);
  const e = spring(t, L(Sh, "a2_4", 5), 0.5);
  if (e > 0) { c.save(); c.globalAlpha = clamp(e * 2); c.translate(540, 1020); c.rotate(deg(-8)); c.scale(lerp(1.4, 1, clamp(e)), lerp(1.4, 1, clamp(e)));
    c.font = F2.playI(170); c.fillStyle = "#fff4e2"; c.textAlign = "center"; c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 20; c.fillText("experiment", 0, 0); c.restore(); }
} });
// 13 · kaamyaab — a clean white studio
S.push({ at: at("a2_4", 6), tr: { type: "flash", d: 0.2 }, sfx: [["impact", 0, 0.7]], draw(c, t, gt, Sh) {
  bgWhite(c, 0.0); cam(c, t, { z0: 1.08, z1: 1.0, dur: Sh.dur });
  c.save(); c.filter = "blur(30px)"; c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(560, 1240, 360, 50, 0, 0, 7); c.fill(); c.restore();
  laptop(c, 540, 1050, 520, 0, (cc, w, h) => K.reel(cc, w, h, t));
  title(c, "KAAMYAAB", 540, 640, 170, 0.05, t, { flat: RED, side: "#6b0d12", depth: 10 });
  scribble(c, "underline", 540, 690, 760, 0, win(0.3, 0.7, t), { color: "#111", lw: 7 });
} });
// 14 · Vibe Editing: aap idea bolte ho
S.push({ at: at("a2_5", 0), tr: { type: "blur", d: 0.3 }, sfx: [["typewriter", [ "a2_5", 3 ], 0.6]], draw(c, t, gt, Sh) {
  bgRoom(c, "#ffd9a0"); cam(c, t, { z0: 1.0, z1: 1.1, dur: Sh.dur });
  c.save(); c.shadowColor = "rgba(255,210,150,.4)"; c.shadowBlur = 80;
  laptop(c, 540, 1050, 600, 0, (cc, w, h) => { cc.fillStyle = "#f2efe9"; cc.fillRect(0, 0, w, h);
    cc.save(); cc.translate(w / 2, h / 2); promptBox(cc, 0, 0, w - 40, "Ek reel: 6 shehar, 6 bhashayein, beat par cuts", win(L(Sh, "a2_5", 3), L(Sh, "a2_5", 6), t), { px: 26, accent: RED }); cc.restore(); });
  c.restore();
  title(c, "VIBE EDITING", 540, 480, 130, 0.05, t, { depth: 10 });
  label(c, "IDEA", 230, 1420, L(Sh, "a2_5", 3), t, { bg: YEL, fg: "#111", tape: true });
} });
// 15 · AI code likhta hai
S.push({ at: at("a2_5", 6), tr: { type: "blur", d: 0.25 }, draw(c, t, gt, Sh) {
  bgRoom(c, "#a8c8ff"); cam(c, t, { z0: 1.04, z1: 0.98, dur: Sh.dur });
  codePanel(c, 540, 960, 840, 720, win(0, Sh.dur, t), { rot: deg(-2), px: 25 });
  label(c, "AI CODE", 800, 520, 0.1, t, { rot: deg(5) });
} });
// 16 · aur video taiyaar
S.push({ at: at("a2_5", 10), tr: { type: "zoom", d: 0.35, fx: 540, fy: 960 }, sfx: [["chime", [ "a2_5", 12 ], 0.7]], draw(c, t, gt, Sh) {
  bgRoom(c, "#ffd9a0"); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  handPhone(c, 470, 1180, 1500, deg(-3), (cc, pw, ph) => reel(cc, pw, ph, t + 1));
  title(c, "VIDEO TAIYAAR", 540, 380, 120, L(Sh, "a2_5", 12), t, { depth: 10 });
} });
// 17 · Aur ye sirf English walon ke liye nahi
S.push({ at: at("a2_6", 0), tr: { type: "blur", d: 0.3 }, draw(c, t, gt, Sh) {
  bgFabric(c, "navy"); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  italic(c, "sirf English walon ke liye?", 540, 900, 76, L(Sh, "a2_6", 2), t);
  const k = L(Sh, "a2_6", 7);
  label(c, "NAHI.", 540, 1080, k, t, { font: U.F.ui(80, 900), h: 130 });
} });
// 18–21 · Hindi, Tamil, Bangla, Telugu — real cities, a label in each script
const CITY = [[9, "ghat", "हिंदी", 0, "rgba(140,70,10,.35)"], [10, "marina", "தமிழ்", 0, "rgba(0,90,120,.4)"], [11, "howrah", "বাংলা", 2, "rgba(120,20,40,.35)"], [12, "charminar", "తెలుగు", 1, "rgba(130,90,10,.35)"]];
CITY.forEach(([n, clip, s, t0, tint], i) => S.push({ at: at("a2_6", n), tr: { type: i ? "whip" : "blur", d: 0.24, dir: i % 2 ? -1 : 1 }, draw(c, t, gt, Sh) {
  film(c, clip, t + t0, { z: 1.2, tint });
  cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  const lang = ["hi", "ta", "bn", "te"][i];
  const e = spring(t, 0.05, 0.4); if (e > 0) sticker(c, s, 540, 980, U.F.lang(lang, 130), { bg: YEL, fg: "#111", s: e, rot: deg(i % 2 ? 4 : -4), h: 220, pad: 90, tape: true });
} }));
// 22 · har bhasha mein
S.push({ at: at("a2_6", 13), tr: { type: "blur", d: 0.25 }, draw(c, t, gt, Sh) {
  film(c, "india_crowd", t, { z: 1.25, tint: "rgba(140,70,10,.35)" });
  cam(c, t, { z0: 1.0, z1: 1.05, dur: Sh.dur });
  [["gu", "ગુજરાતી"], ["mr", "मराठी"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]].forEach(([l, s], i) => {
    const e = spring(t, i * 0.1, 0.4); if (e > 0) sticker(c, s, [270, 800, 300, 790, 540][i], [560, 700, 860, 1000, 1180][i], U.F.lang(l, 72), { bg: i % 2 ? RED : YEL, fg: i % 2 ? "#fff" : "#111", s: e, rot: deg(i % 2 ? 5 : -5), h: 130 });
  });
  italic(c, "har bhasha mein.", 540, 1420, 88, 0.2, t);
} });
// 23 · Ye hai editing ka future
S.push({ at: at("a2_7", 0), tr: { type: "flash", d: 0.22 }, sfx: [["impact", 0.05, 0.6]], draw(c, t, gt, Sh) {
  bgWhite(c, 0.0); cam(c, t, { z0: 1.06, z1: 1.0, dur: Sh.dur });
  title(c, "EDITING KA", 540, 820, 110, 0.05, t, { flat: "#111", side: "#555", depth: 6 });
  title(c, "FUTURE", 540, 1060, 260, L(Sh, "a2_7", 4), t, { flat: RED, side: "#6b0d12", depth: 14 });
} });
// 24 · CTA: pehla kadam rakho — Vibe Editing join karo
S.push({ at: at("a2_7", 7), tr: { type: "slide", d: 0.35, vertical: true }, sfx: [["chime", [ "a2_7", 13 ], 0.8]], draw(c, t, gt, Sh) {
  bgWhite(c, 0.0); cam(c, t, { z0: 1.03, z1: 1.0, dur: 3 });
  title(c, "PEHLA KADAM", 540, 330, 110, 0.05, t, { flat: RED, side: "#6b0d12", depth: 8 });
  title(c, "RAKHO.", 540, 470, 110, L(Sh, "a2_7", 9), t, { flat: "#111", side: "#555", depth: 6 });
  c.save(); c.filter = "blur(26px)"; c.fillStyle = "rgba(0,0,0,.22)"; c.beginPath(); c.ellipse(560, 1240, 260, 40, 0, 0, 7); c.fill(); c.restore();
  phone(c, 540, 870 + (1 - spring(t, 0.15, 0.8)) * 900, 600, deg(-2), (cc, pw, ph) => reel(cc, pw, ph, t + 2));
  joinButton(c, 540, 1300, gt, Sh.start + L(Sh, "a2_7", 11), { bg: RED, text: "JOIN VIBE EDITING  →", font: F2.black(48), w: 760, h: 130 });
  chorusPills(c, gt, [[300, 1470, -4], [780, 1450, 4], [320, 1610, 3], [770, 1630, -3]], { px: 38, bg: (i) => (i % 2 ? YEL : "#111"), fg: (i) => (i % 2 ? "#111" : "#fff") });
} });

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = U.F.ui(46, 700); const s = ws.join(" "), tw = c.measureText(s).width, sp = c.measureText(" ").width;
  c.fillStyle = "rgba(10,10,12,.62)"; rr(c, 540 - tw / 2 - 26, 1600 - 42, tw + 52, 84, 42); c.fill();
  let x = 540 - tw / 2; c.textBaseline = "middle";
  ws.forEach((q, i) => { c.fillStyle = i === active ? YEL : "#fff"; c.fillText(q, x, 1600); x += c.measureText(q).width + sp; });
  c.restore();
}
window.AD = { shots: S, caption, grain: 0.24,
  images: ["cut_phalke", "cut_moviola", "cut_steenbeck", "cut_laptop", "cut_filmstrip", "cut_scissors", "cut_hand_phone_screenhole"], photos: ["marina"] };
})();

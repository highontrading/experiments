// Ad 5 v2 · "Apni Desk Badlo" — clean minimal (reference 2): white grid, giant black words set one
// at a time, a prompt box, magenta flash cuts, a pastel timeline assembled by an "AI" cursor while
// "You" watch, real footage full-bleed, an app dock on the grass for the CTA.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { promptBox, phone, reel, chorusPills, joinButton, FX } = K;
const { deg, W_, F2, cam, kinetic, scribble, cursor, spinner, bgWhite } = FX2;
const INK = "#0d0d0f", MAG = "#e23ee8", BLUE = "#2b6cff", ORANGE = "#e0663a";
const at = (id, n = 0, o = 0) => [id, n, o];
const L = (S, id, n = 0, o = 0) => W_(id, n, o) - S.start;
const big = (c, lines, t, o = {}) => kinetic(c, lines, t, { font: U.F.ui(o.px || 130, 800), y: o.y ?? 900, lh: o.lh || 160, color: o.color || INK, style: o.style || "blur", x: o.x });
const words = (S, id, from, list) => list.map((s, i) => [s, L(S, id, from + i)]);
function card(c, x, y, w, h, body, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.s ?? 1, o.s ?? 1);
  c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = "#fff"; rr(c, -w / 2, -h / 2, w, h, 28); c.fill(); c.shadowColor = "transparent";
  c.strokeStyle = "rgba(0,0,0,.06)"; c.lineWidth = 2; c.stroke(); c.translate(-w / 2, -h / 2); body(c, w, h); c.restore();
}
function chip(c, s, x, y, col, e, o = {}) {
  if (e <= 0) return; c.save(); c.translate(x, y); c.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e); c.globalAlpha = clamp(e * 2);
  c.font = U.F.ui(o.px || 48, 700); const w = c.measureText(s).width + 110, h = (o.px || 48) * 2;
  c.fillStyle = "#fff"; c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 24; c.shadowOffsetY = 8; rr(c, -w / 2, -h / 2, w, h, h / 2); c.fill(); c.shadowColor = "transparent";
  c.fillStyle = col; c.beginPath(); c.arc(-w / 2 + 46, 0, 16, 0, 7); c.fill(); c.fillStyle = INK; c.textBaseline = "middle"; c.fillText(s, -w / 2 + 76, 2); c.restore();
}
function todo(c, t, items, o = {}) {
  card(c, 540, o.y || 900, 860, 150 + items.length * 120, (cc, w, h) => {
    cc.font = U.F.ui(44, 800); cc.fillStyle = INK; cc.fillText("To-do", 50, 80);
    items.forEach(([s, t0, tick, spin], i) => {
      const y = 170 + i * 120, n = Math.floor(s.length * clamp((t - t0) / 0.8)); if (n <= 0) return;
      cc.strokeStyle = "#c9c9cf"; cc.lineWidth = 4; rr(cc, 50, y - 30, 44, 44, 12); cc.stroke();
      cc.font = U.F.ui(42, 600); cc.fillStyle = INK; cc.fillText(s.slice(0, n), 120, y + 4);
      if (tick != null && t > tick) { const k = clamp((t - tick) / 0.25); cc.fillStyle = "#1fb36b"; rr(cc, 50, y - 30, 44, 44, 12); cc.fill();
        cc.strokeStyle = "#fff"; cc.lineWidth = 6; cc.beginPath(); cc.moveTo(60, y - 8); cc.lineTo(70, y + 2); cc.lineTo(70 + 16 * k, y - 18 * k); cc.stroke();
        cc.strokeStyle = "rgba(13,13,15,.5)"; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(120, y - 10); cc.lineTo(120 + cc.measureText(s).width * k, y - 10); cc.stroke(); }
      if (spin && t > t0 + 0.8) spinner(cc, w - 70, y - 8, 22, t, ORANGE, 7);
    });
  }, { s: o.s });
}
// the multiplayer timeline: pastel blocks that the AI cursor drops into place
function pastelTimeline(c, t, k, o = {}) {
  const x0 = 90, y0 = o.y || 1180, w = 900;
  c.save(); c.fillStyle = "rgba(0,0,0,.04)"; rr(c, x0 - 20, y0 - 30, w + 40, 420, 24); c.fill();
  const B = [[0, 0, 0.3, "#e98ce9"], [0, 0.32, 0.36, "#e98ce9"], [0, 0.7, 0.3, "#e98ce9"], [1, 0, 0.55, "#4f86e8"], [1, 0.57, 0.43, "#4f86e8"], [2, 0, 1, "#3db27a"]];
  B.forEach(([row, s, l, col], i) => { const e = spring(k, i * 0.12, 0.5); if (e <= 0) return;
    c.save(); c.globalAlpha = clamp(e * 2); c.fillStyle = col; rr(c, x0 + w * s, y0 + row * 120 - (1 - e) * 60, w * l - 10, 96, 8); c.fill(); c.restore(); });
  const ph = x0 + ((t * 160) % w); c.fillStyle = BLUE; c.fillRect(ph - 2, y0 - 50, 4, 420); c.beginPath(); c.moveTo(ph - 14, y0 - 60); c.lineTo(ph + 14, y0 - 60); c.lineTo(ph, y0 - 40); c.fill();
  c.restore();
}

const S = [];
// 1 · Ye aapki desk hai.
S.push({ at: 0, draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.0, z1: 1.04, dur: Sh.dur });
  big(c, [words(Sh, "a5_1", 0, ["Ye", "aapki"]), words(Sh, "a5_1", 2, ["desk", "hai."])], t, { y: 900 });
  cursor(c, lerp(900, 640, apple(win(0.2, 1.2, t))), lerp(1500, 1100, apple(win(0.2, 1.2, t))), "You", BLUE, 1.3);
} });
// 2 · a real desk: hands at the keyboard, soft pink grade
S.push({ at: at("a5_1", 4), tr: { type: "slide", d: 0.4 }, draw(c, t, gt, Sh) {
  footage(c, "typing", t, 0, 0, W, H, { mode: "loop", z: 1.1 + 0.03 * t, filter: "saturate(.8) brightness(1.08)" });
  c.save(); c.globalCompositeOperation = "soft-light"; c.fillStyle = "rgba(255,150,190,.55)"; c.fillRect(0, 0, W, H); c.restore();
  big(c, [words(Sh, "a5_1", 4, ["Aur", "ye", "aapki"])], t, { y: 420, px: 96, color: "#fff" });
} });
// 3 · to-do: Ek reel edit karna… poora din.
S.push({ at: at("a5_1", 7), tr: { type: "slide", d: 0.4 }, sfx: [["typewriter", 0.4, 0.5]], draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.06, z1: 1.0, dur: Sh.dur });
  todo(c, t, [["Ek reel edit karna", L(Sh, "a5_1", 9), null], ["…poora din", L(Sh, "a5_1", 13), null, true]], { y: 900 });
  big(c, [words(Sh, "a5_1", 7, ["to-do", "list:"])], t, { y: 470, px: 110 });
} });
// 4 · Footage ✓ idea ✓ … editing ⟳
S.push({ at: at("a5_2", 0), tr: { type: "blur", d: 0.3 }, sfx: [["pop_soft", [ "a5_2", 0 ], 0.6], ["pop_soft", [ "a5_2", 3 ], 0.6], ["pop_soft", [ "a5_2", 7 ], 0.6]], draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.0, z1: 1.04, dur: Sh.dur });
  chip(c, "Footage ✓", 540, 560, "#1fb36b", spring(t, L(Sh, "a5_2", 0), 0.4));
  chip(c, "Idea ✓", 540, 720, "#1fb36b", spring(t, L(Sh, "a5_2", 3), 0.4));
  const e3 = spring(t, L(Sh, "a5_2", 7), 0.4); chip(c, "Editing", 500, 880, ORANGE, e3);
  if (e3 > 0.5) spinner(c, 720, 880, 26, t, ORANGE, 8);
  big(c, [words(Sh, "a5_2", 10, ["sab", "ruk", "jaata", "hai."])], t, { y: 1220, px: 104 });
} });
// 5 · Ab miliye — magenta flash
S.push({ at: at("a5_3", 0), tr: { type: "flash", d: 0.22, color: MAG }, sfx: [["impact", 0.02, 0.5]], draw(c, t, gt, Sh) {
  c.fillStyle = MAG; c.fillRect(0, 0, W, H); cam(c, t, { z0: 1.1, z1: 1.0, dur: Sh.dur });
  big(c, [words(Sh, "a5_3", 0, ["Ab", "miliye"])], t, { y: 960, color: "#fff", px: 150 });
} });
// 6 · Vibe Editing — the wordmark, two cursors arrive
S.push({ at: at("a5_3", 2), tr: { type: "zoom", d: 0.35 }, sfx: [["chime", 0.1, 0.5]], draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur });
  const e = spring(t, 0.05, 0.6);
  c.save(); c.globalAlpha = clamp(e * 2); c.translate(540, 940); c.scale(0.8 + 0.2 * e, 0.8 + 0.2 * e);
  const g = c.createLinearGradient(-90, -90, 90, 90); g.addColorStop(0, MAG); g.addColorStop(1, BLUE); c.fillStyle = g; rr(c, -440, -80, 150, 150, 40); c.fill();
  c.font = U.F.title(90, 900); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("V", -365, 2);
  c.font = U.F.ui(120, 800); c.fillStyle = INK; c.textAlign = "left"; c.fillText("Vibe Editing", -260, 4); c.restore();
  cursor(c, lerp(150, 330, apple(win(0.2, 1.0, t))), lerp(1400, 1060, apple(win(0.2, 1.0, t))), "You", BLUE, 1.3);
  cursor(c, lerp(1000, 780, apple(win(0.3, 1.1, t))), lerp(600, 1040, apple(win(0.3, 1.1, t))), "AI", MAG, 1.3);
} });
// 7 · Aap likho ya bolo: 'Tees second ki reel…'
S.push({ at: at("a5_4", 0), tr: { type: "slide", d: 0.4, vertical: true }, sfx: [["typewriter", [ "a5_4", 4 ], 0.6], ["click", [ "a5_4", 11, 0.3 ], 0.6]], draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.0, z1: 1.05, dur: Sh.dur });
  big(c, [words(Sh, "a5_4", 0, ["likho", "ya", "bolo"])], t, { y: 560, px: 110 });
  promptBox(c, 540, 960, 960, "Tees second ki reel, fast cuts, bold captions.", win(L(Sh, "a5_4", 4), L(Sh, "a5_4", 11), t), { px: 44, accent: INK });
  const k = apple(win(L(Sh, "a5_4", 10), L(Sh, "a5_4", 11), t));
  cursor(c, lerp(760, 960, k), lerp(1300, 990, k), "You", BLUE, 1.3);
} });
// 8 · Aur AI code se poora edit… — the AI cursor builds the timeline
S.push({ at: at("a5_4", 12), tr: { type: "slide", d: 0.4 }, sfx: [["pop_soft", 0.2, 0.5], ["pop_soft", 0.5, 0.5], ["pop_soft", 0.8, 0.5]], draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.05, z1: 1.0, dur: Sh.dur });
  c.save(); c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 30; c.fillStyle = "#111"; rr(c, 300, 340, 480, 740, 24); c.fill(); c.restore();
  c.save(); c.translate(312, 352); c.beginPath(); c.rect(0, 0, 456, 716); c.clip(); reel(c, 456, 716, t); c.restore();
  pastelTimeline(c, t, t, { y: 1220 });
  const k = (t * 0.8) % 1; cursor(c, lerp(200, 880, k), 1240 + Math.sin(t * 5) * 120, "AI", MAG, 1.3);
  cursor(c, 860, 600, "You", BLUE, 1.2);
} });
// 9 · …bana deta hai — into the finished video
S.push({ at: at("a5_4", 17), tr: { type: "zoom", d: 0.4, fx: 540, fy: 710 }, sfx: [["chime", 0.2, 0.6]], draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.08, z1: 1.0, dur: Sh.dur });
  c.save(); c.shadowColor = "rgba(0,0,0,.22)"; c.shadowBlur = 50; c.shadowOffsetY = 24; c.fillStyle = "#111"; rr(c, 150, 330, 780, 1170, 36); c.fill(); c.restore();
  c.save(); rr(c, 164, 344, 752, 1142, 26); c.clip(); c.translate(164, 344); reel(c, 752, 1142, t + 2); c.restore();
  chip(c, "Edit ready ✓", 540, 250, "#1fb36b", spring(t, 0.3, 0.4));
} });
// 10 · Hindi, Marathi, Gujarati, Tamil — one word at a time
const SAY = [["Hindi", "हिंदी", "hi"], ["Marathi", "मराठी", "mr"], ["Gujarati", "ગુજરાતી", "gu"], ["Tamil", "தமிழ்", "ta"]];
SAY.forEach(([en, s, l], i) => S.push({ at: at("a5_5", i), tr: i ? { type: "flash", d: 0.1, color: "#fff" } : { type: "slide", d: 0.35, vertical: true }, draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.06, z1: 1.0, dur: Sh.dur });
  c.save(); const e = spring(t, 0, 0.4); c.globalAlpha = clamp(e * 2); c.font = U.F.lang(l, 210); c.fillStyle = INK; c.textAlign = "center";
  c.translate(540, 1000); c.scale(0.9 + 0.1 * e, 0.9 + 0.1 * e); c.fillText(s, 0, 0); c.restore();
  cursor(c, 760, 1100, en, [MAG, BLUE, "#1fb36b", ORANGE][i], 1.3);
} }));
// 11 · jis bhasha mein sochte ho, usi mein edit karo
S.push({ at: at("a5_5", 5), tr: { type: "blur", d: 0.3 }, draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.0, z1: 1.04, dur: Sh.dur });
  big(c, [words(Sh, "a5_5", 5, ["jis", "bhasha", "mein"]), words(Sh, "a5_5", 8, ["sochte", "ho,"]), words(Sh, "a5_5", 10, ["usi", "mein"]), [["edit karo.", L(Sh, "a5_5", 12), MAG]]], t, { y: 700, px: 112, lh: 150 });
} });
// 12 · Editing ho gayi.
S.push({ at: at("a5_6", 0), tr: { type: "slide", d: 0.35 }, sfx: [["pen_tick", [ "a5_6", 1 ], 0.8]], draw(c, t, gt, Sh) {
  bgWhite(c); cam(c, t, { z0: 1.04, z1: 1.0, dur: Sh.dur });
  todo(c, t + 5, [["Ek reel edit karna", 0, L(Sh, "a5_6", 1) + 5], ["…poora din", 0, L(Sh, "a5_6", 1) + 5.15]], { y: 820 });
  big(c, [words(Sh, "a5_6", 0, ["Editing", "ho", "gayi."])], t, { y: 1300, px: 110 });
} });
// 13 · Ab baaki din? Content banao. — real creator footage
S.push({ at: at("a5_6", 3), tr: { type: "zoom", d: 0.35 }, draw(c, t, gt, Sh) {
  footage(c, "creator_phone_vertical", t + 1, 0, 0, W, H, { mode: "loop", z: 1.05 + 0.03 * t, filter: "saturate(1.1) brightness(1.05)" });
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(0,0,0,.35)"); g.addColorStop(0.4, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H);
  big(c, [words(Sh, "a5_6", 3, ["Ab", "baaki", "din?"])], t, { y: 330, px: 96, color: "#fff" });
  big(c, [[["Content", L(Sh, "a5_6", 6), "#fff"], ["banao.", L(Sh, "a5_6", 7), "#ffd1ff"]]], t, { y: 470, px: 120 });
} });
// 14 · CTA — an app dock on the grass, join
S.push({ at: at("a5_7", 0), tr: { type: "flash", d: 0.22, color: MAG }, sfx: [["chime", [ "a5_7", 7 ], 0.8]], draw(c, t, gt, Sh) {
  cover(c, IMG.grass, 0, 0, W, H, 0.5, 0.5, 1.15 - 0.02 * t);
  big(c, [words(Sh, "a5_7", 0, ["Apni", "desk"]), [["badlo.", L(Sh, "a5_7", 2), "#fff"]]], t, { y: 380, px: 120, color: "#fff" });
  const e = spring(t, 0.3, 0.6); c.save(); c.globalAlpha = clamp(e * 2); c.translate(540, 900 + (1 - e) * 200);
  c.fillStyle = "rgba(255,255,255,.45)"; c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 30; rr(c, -420, -90, 840, 180, 50); c.fill(); c.shadowColor = "transparent";
  ["#5aa0ff", "#34c759", "#ff9f0a", "#ff375f"].forEach((col, i) => { c.fillStyle = col; rr(c, -380 + i * 150, -60, 120, 120, 28); c.fill(); c.fillStyle = "rgba(255,255,255,.85)"; c.beginPath(); c.arc(-320 + i * 150, 0, 26, 0, 7); c.fill(); });
  const hop = Math.abs(Math.sin(t * 5)) * 30 * (1 - clamp((t - 2.2) / 0.5)); const g = c.createLinearGradient(220, -60, 340, 60); g.addColorStop(0, MAG); g.addColorStop(1, BLUE);
  c.fillStyle = g; rr(c, 220, -60 - hop, 120, 120, 28); c.fill(); c.font = U.F.title(70, 900); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("V", 280, 4 - hop); c.restore();
  joinButton(c, 540, 1180, gt, Sh.start + L(Sh, "a5_7", 5), { bg: INK, text: "Join Vibe Editing  →", font: U.F.ui(52, 800), w: 720, h: 130 });
  chorusPills(c, gt, [[300, 1380, -3], [780, 1360, 3], [320, 1520, 2], [770, 1540, -2]], { px: 38, bg: () => "#fff", fg: () => INK });
} });

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = U.F.ui(44, 600); const s = ws.join(" "), tw = c.measureText(s).width, sp = c.measureText(" ").width;
  c.fillStyle = "rgba(255,255,255,.9)"; c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 16; rr(c, 540 - tw / 2 - 26, 1600 - 38, tw + 52, 76, 38); c.fill(); c.shadowColor = "transparent";
  let x = 540 - tw / 2; c.textBaseline = "middle";
  ws.forEach((q, i) => { c.fillStyle = i <= active ? INK : "rgba(13,13,15,.35)"; c.fillText(q, x, 1602); x += c.measureText(q).width + sp; });
  c.restore();
}
window.AD = { shots: S, caption, grain: 0.1, images: ["grass"], photos: [] };
})();

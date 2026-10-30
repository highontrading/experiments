// Ad 4 v2 · "Uljhan Chhodo" — VOX-tutorial style (reference 1): green cutting mat, editor windows
// with white sketchy outlines, push-pins, a busy cursor, hand-drawn arrows, grungy yellow block
// titles, a phone mockup for the result, cloud wipes from real sky footage.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { cut, codePanel, phone, reel, timelineUI, chorusPills, joinButton, FX } = K;
const { deg, W_, F2, cam, shake, scribble, arrow, sticker, grungeTitle, uiWindow, pin, cursor, bgMat } = FX2;
const YEL = "#f4e04d", RED = "#e2312f";
const at = (id, n = 0, o = 0) => [id, n, o];
const L = (S, id, n = 0, o = 0) => W_(id, n, o) - S.start;
const title = (c, s, x, y, px, t0, t, o = {}) => { const e = spring(t, t0, 0.45); if (e > 0) {
  c.save(); c.font = U.F.title(px, 900); const tw = c.measureText(s).width; c.restore();
  grungeTitle(c, s, x, y, px, { s: Math.min(1, 1000 / tw) * lerp(1.4, 1, clamp(e)), alpha: clamp(e * 2), rot: o.rot || 0, color: o.color }); } };

// window contents: a keyframe graph, a stack of layers, a grid of transition presets
const graphEditor = (cc, w, h, t) => {
  cc.fillStyle = "#1b1c20"; cc.fillRect(0, 0, w, h); cc.strokeStyle = "rgba(255,255,255,.07)";
  for (let x = 0; x < w; x += 40) { cc.beginPath(); cc.moveTo(x, 0); cc.lineTo(x, h); cc.stroke(); }
  ["#ff5a5a", "#5aff8a", "#5a9cff", "#ffd25a"].forEach((col, k) => { const r = rnd(k + 3); cc.strokeStyle = col; cc.lineWidth = 3; cc.beginPath();
    for (let x = 0; x <= w; x += 8) { const y = h / 2 + Math.sin(x / (30 + k * 12) + k + t) * h * 0.3 * (0.4 + r()); x ? cc.lineTo(x, y) : cc.moveTo(x, y); } cc.stroke();
    for (let x = 30 + k * 20; x < w; x += 110) { const y = h / 2 + Math.sin(x / (30 + k * 12) + k + t) * h * 0.3 * 0.7; cc.save(); cc.translate(x, y); cc.rotate(Math.PI / 4); cc.fillStyle = col; cc.fillRect(-7, -7, 14, 14); cc.restore(); } });
};
const layers = (cc, w, h, t) => {
  cc.fillStyle = "#1b1c20"; cc.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const y = 10 + i * (h / 14); cc.fillStyle = i % 2 ? "#26272c" : "#202126"; cc.fillRect(0, y, w, h / 14 - 2);
    cc.fillStyle = ["#d86b6b", "#6bd8a0", "#6b9cd8", "#d8c46b", "#b06bd8"][i % 5]; cc.fillRect(w * 0.32 + (i * 37) % 120, y + 6, w * 0.4, h / 14 - 14);
    cc.fillStyle = "#9aa"; cc.font = U.F.ui(16, 600); cc.fillText(`Layer ${i + 1}`, 14, y + h / 28 + 4); }
};
const presets = (cc, w, h, t) => {
  cc.fillStyle = "#1b1c20"; cc.fillRect(0, 0, w, h);
  const clips = ["ghat", "local", "charminar", "howrah", "india_city", "typing"];
  for (let i = 0; i < 9; i++) { const x = 16 + (i % 3) * (w - 32) / 3, y = 16 + Math.floor(i / 3) * (h - 32) / 3, cw = (w - 32) / 3 - 12, ch = (h - 32) / 3 - 30;
    footage(cc, clips[i % 6], t + i, x, y, cw, ch, { mode: "loop" }); cc.fillStyle = "#aaa"; cc.font = U.F.ui(15, 600);
    cc.fillText(["Dissolve", "Wipe", "Zoom", "Spin", "Glitch", "Slide", "Iris", "Push", "Blur"][i], x, y + ch + 20); }
};

const S = [];
// 1 · Kya aapki editing bhi aisi hi uljhi hui hai? — windows pile up, the cursor panics
S.push({ at: 0, sfx: [["click", 0.4, 0.5], ["click", 0.8, 0.5], ["click", 1.3, 0.5]], draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.12, z1: 1.0, dur: Sh.dur, r0: -2, r1: 0 });
  const WIN = [[graphEditor, 330, 560, 560, 380, -6, 0.1], [layers, 760, 820, 520, 520, 5, 0.35], [presets, 360, 1150, 600, 440, 3, 0.6], [(cc, w, h) => timelineUI(cc, w, h, t), 720, 1420, 640, 360, -4, 0.85]];
  WIN.forEach(([body, x, y, w, h, r, d], i) => { const e = spring(t, d, 0.5); if (e > 0) { uiWindow(c, x, y + (1 - e) * 600, w, h, deg(r), (cc, ww, hh) => body(cc, ww, hh, t), { s: e }); pin(c, x - w / 2 + 30, y - h / 2 + 20 + (1 - e) * 600, 0.9); } });
  const cx = 540 + Math.sin(t * 9) * 220, cy = 980 + Math.cos(t * 7) * 340; cursor(c, cx, cy, null, "#fff", 1.4);
  title(c, "ULJHI HUI?", 540, 300, 150, W_("a4_1", 6) - Sh.start, t, { rot: deg(-3) });
} });
// 2–4 · Keyframes, layers, transitions — one window each, pinned, with arrows
const panel = (body, name, side) => ({ draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.0, z1: 1.08, dur: Sh.dur });
  uiWindow(c, 540, 1000, 900, 760, deg(side * 2), (cc, w, h) => body(cc, w, h, t)); pin(c, 130, 640, 1.1);
  title(c, name, 540, 470, 140, 0.02, t, { rot: deg(-2 * side) });
  arrow(c, side > 0 ? 200 : 880, 540, side > 0 ? 330 : 750, 700, win(0.1, 0.4, t), { bend: side * 60 });
} });
S.push({ at: at("a4_2", 0), tr: { type: "whip", d: 0.24 }, sfx: [["pop_soft", 0, 0.6]], ...panel(graphEditor, "KEYFRAMES", 1) });
S.push({ at: at("a4_2", 1), tr: { type: "whip", d: 0.22, dir: -1 }, sfx: [["pop_soft", 0, 0.6]], ...panel(layers, "LAYERS", -1) });
S.push({ at: at("a4_2", 2), tr: { type: "whip", d: 0.22 }, sfx: [["pop_soft", 0, 0.6]], ...panel(presets, "TRANSITIONS", 1) });
// 5 · ek galti, aur sab bigad gaya — an error dialog, glitch and shake
S.push({ at: at("a4_2", 3), tr: { type: "glitch", d: 0.24 }, sfx: [["glitch", [ "a4_2", 4 ], 0.8], ["impact", [ "a4_2", 7 ], 0.6]], draw(c, t, gt, Sh) {
  bgMat(c); const g = L(Sh, "a4_2", 4); shake(c, t, g, 22, 5);
  uiWindow(c, 540, 1000, 900, 700, deg(2), (cc, w, h) => { timelineUI(cc, w, h, t); if (t > g) { cc.fillStyle = "rgba(255,0,40,.18)"; cc.fillRect(0, 0, w, h); } });
  if (t > g) {
    uiWindow(c, 540, 980, 640, 300, deg(-3), (cc, w, h) => { cc.fillStyle = "#2a1215"; cc.fillRect(0, 0, w, h); cc.fillStyle = RED; cc.beginPath(); cc.arc(80, h / 2, 40, 0, 7); cc.fill();
      cc.fillStyle = "#fff"; cc.font = U.F.ui(56, 900); cc.textAlign = "center"; cc.textBaseline = "middle"; cc.fillText("!", 80, h / 2 + 2);
      cc.textAlign = "left"; cc.font = U.F.ui(36, 800); cc.fillText("Render failed", 150, h / 2 - 30); cc.font = U.F.ui(24, 500); cc.fillStyle = "#e9a"; cc.fillText("Project crashed. Unsaved changes lost.", 150, h / 2 + 20); }, { s: spring(t, g, 0.35) });
    scribble(c, "circle", 540, 980, 760, 400, win(g + 0.2, g + 0.6, t), { lw: 10 });
  }
  title(c, "EK GALTI…", 540, 420, 150, 0.02, t);
  title(c, "SAB BIGAD GAYA", 540, 1480, 120, L(Sh, "a4_2", 6), t, { color: "#ff8a7a" });
} });
// 6 · Ab ungliyon se nahi — a real hand on the mat, crossed out
S.push({ at: at("a4_3", 0), tr: { type: "cloud", d: 0.6 }, draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  cut(c, "cut_hand_point", 540, 1150, 1000, { rot: deg(-10) });
  cursor(c, 600 + Math.sin(t * 6) * 60, 560 + Math.cos(t * 5) * 40, "click… drag… click", "#ff5a5a", 1.3);
  title(c, "UNGLIYON SE", 540, 420, 140, 0.02, t);
  scribble(c, "cross", 540, 1100, 700, 800, win(L(Sh, "a4_3", 3) - 0.1, L(Sh, "a4_3", 3) + 0.25, t), { lw: 16 });
} });
// 7 · shabdon se edit karo — speech becomes the edit
S.push({ at: at("a4_3", 4), tr: { type: "whip", d: 0.24 }, sfx: [["pop_soft", 0.1, 0.6]], draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.06, z1: 1.0, dur: Sh.dur });
  title(c, "SHABDON SE", 540, 520, 150, 0.02, t);
  const e = spring(t, 0.15, 0.5);
  if (e > 0) sticker(c, "“Is reel ko edit karo”", 540, 980, U.F.ui(56, 800), { bg: "#fff", fg: "#111", s: e, rot: deg(-3), h: 150, pad: 80 });
  for (let i = 0; i < 40; i++) { const hh = 20 + 140 * Math.abs(Math.sin(i * 0.8 + t * 10)) * e; c.fillStyle = YEL; rr(c, 150 + i * 20, 1300 - hh / 2, 12, hh, 6); c.fill(); }
} });
// 8 · Vibe Editing mein bas bolo — the phone mockup, pinned
const phoneShot = (cmd, n, fx) => ({ draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.0, z1: 1.05, dur: Sh.dur });
  phone(c, 540, 1000, 1040, deg(-2), (cc, pw, ph) => { reel(cc, pw, ph, t + n); if (fx) fx(cc, pw, ph, t); }, { body: "#151515" });
  c.save(); c.strokeStyle = "#fff"; c.lineWidth = 5; c.beginPath(); c.roundRect(540 - 270 - 10, 1000 - 520 - 10, 540 + 20, 1040 + 20, 96); c.stroke(); c.restore();
  pin(c, 330, 500, 1.1);
  if (cmd) { const e = spring(t, 0.05, 0.4); if (e > 0) { sticker(c, cmd, 540, 380, U.F.ui(54, 800), { bg: YEL, fg: "#111", s: e, rot: deg(-3), h: 130, pad: 70, tape: true }); arrow(c, 760, 450, 720, 650, win(0.2, 0.5, t), { bend: -70 }); } }
} });
S.push({ at: at("a4_4", 0), tr: { type: "cloud", d: 0.6 }, draw(c, t, gt, Sh) {
  phoneShot(null, 0).draw(c, t, gt, Sh);
  title(c, "VIBE EDITING", 540, 330, 130, 0.02, t);
} });
S.push({ at: at("a4_4", 5), tr: { type: "flash", d: 0.14 }, sfx: [["snip", 0.4, 0.6]], ...phoneShot("beat par cut karo", 2, (cc, w, h, t) => {
  const b = (t * 2.1) % 1; if (b < 0.12) { cc.fillStyle = `rgba(255,255,255,${0.5 * (1 - b / 0.12)})`; cc.fillRect(0, 0, w, h); } }) });
S.push({ at: at("a4_4", 9), tr: { type: "flash", d: 0.14, color: "#ffb347" }, ...phoneShot("colour warm karo", 4, (cc, w, h, t) => {
  cc.save(); cc.globalCompositeOperation = "soft-light"; cc.fillStyle = `rgba(255,140,40,${0.6 * clamp(t / 0.5)})`; cc.fillRect(0, 0, w, h); cc.restore(); }) });
S.push({ at: at("a4_4", 12), tr: { type: "flash", d: 0.14 }, sfx: [["pop", 0.3, 0.6]], ...phoneShot("captions bade karo", 5, (cc, w, h, t) => {
  const k = spring(t, 0.2, 0.5); cc.save(); cc.translate(w / 2, h * 0.62); cc.scale(0.5 + 0.7 * k, 0.5 + 0.7 * k); cc.font = U.F.title(70, 900); cc.textAlign = "center";
  cc.lineWidth = 10; cc.strokeStyle = "#111"; cc.strokeText("BADE!", 0, 0); cc.fillStyle = YEL; cc.fillText("BADE!", 0, 0); cc.restore(); }) });
// 9 · AI ye sab code mein karta hai
S.push({ at: at("a4_5", 0), tr: { type: "cloud", d: 0.6 }, sfx: [["typewriter", 0.3, 0.6]], draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.08, z1: 1.0, dur: Sh.dur });
  codePanel(c, 540, 1020, 900, 760, win(0, Sh.dur, t), { rot: deg(2), px: 26 }); pin(c, 130, 670, 1.1); pin(c, 950, 670, 1.1, "#3b7be2");
  title(c, "AI CODE", 540, 460, 160, 0.02, t);
  cursor(c, 820, 1450, "AI", "#2b6cff", 1.3);
} });
// 10 · saaf aur tez — the mess tidies into a neat grid
S.push({ at: at("a4_5", 8), tr: { type: "whip", d: 0.24 }, sfx: [["chime", [ "a4_5", 10 ], 0.6]], draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.0, z1: 1.04, dur: Sh.dur });
  const k = apple(win(0, 0.7, t));
  [["ghat", 0], ["local", 1], ["charminar", 2], ["india_city", 3]].forEach(([clip, i]) => {
    const x0 = 540 + Math.sin(i * 2.3) * 300, y0 = 1000 + Math.cos(i * 1.7) * 400, r0 = (i % 2 ? 9 : -12);
    uiWindow(c, lerp(x0, 300 + (i % 2) * 480, k), lerp(y0, 820 + Math.floor(i / 2) * 420, k), 420, 360, deg(lerp(r0, 0, k)), (cc, w, h) => footage(cc, clip, t + i, 0, 0, w, h, { mode: "loop" }));
  });
  title(c, "SAAF.", 300, 470, 150, 0.05, t, { rot: deg(-3) });
  title(c, "TEZ.", 790, 470, 150, L(Sh, "a4_5", 10), t, { rot: deg(3) });
} });
// 11 · Aur aap ye apni bhasha mein bol sakte ho
const LANGS = [["hi", "हिंदी"], ["ta", "தமிழ்"], ["bn", "বাংলা"], ["te", "తెలుగు"], ["mr", "मराठी"], ["gu", "ગુજરાતી"]];
S.push({ at: at("a4_6", 0), tr: { type: "cloud", d: 0.55 }, draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.0, z1: 1.06, dur: Sh.dur });
  LANGS.forEach(([l, s], i) => { const e = spring(t, i * 0.22, 0.4); if (e <= 0) return;
    c.save(); c.font = U.F.lang(l, 120); c.textAlign = "center"; c.translate(i % 2 ? 760 : 320, 560 + i * 170); c.rotate(deg(i % 2 ? 4 : -4)); c.scale(e, e);
    c.fillStyle = "rgba(0,0,0,.55)"; c.fillText(s, 6, 8); c.lineWidth = 10; c.strokeStyle = "#2a2a1e"; c.strokeText(s, 0, 0); c.fillStyle = YEL; c.fillText(s, 0, 0); c.restore(); });
  title(c, "APNI BHASHA MEIN", 540, 360, 110, 0.02, t);
} });
// 12 · CTA — the app icon, uljhan chhodo, join
S.push({ at: at("a4_7", 0), tr: { type: "cloud", d: 0.6 }, sfx: [["chime", [ "a4_7", 4 ], 0.8]], draw(c, t, gt, Sh) {
  bgMat(c); cam(c, t, { z0: 1.05, z1: 1.0, dur: 3 });
  title(c, "ULJHAN CHHODO.", 540, 330, 120, 0.02, t);
  const e = spring(t, L(Sh, "a4_7", 2) - 0.1, 0.6);
  if (e > 0) { c.save(); c.translate(540, 760); c.scale(e, e); c.rotate(deg(-4)); c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 40; c.shadowOffsetY = 20;
    const g = c.createLinearGradient(0, -230, 0, 230); g.addColorStop(0, "#26261f"); g.addColorStop(1, "#0d0d0b"); c.fillStyle = g; rr(c, -230, -230, 460, 460, 100); c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = YEL; c.lineWidth = 10; rr(c, -215, -215, 430, 430, 88); c.stroke();
    c.font = U.F.title(200, 900); c.fillStyle = YEL; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Ve", 0, 10); c.restore(); }
  title(c, "VIBE EDITING", 540, 1150, 120, L(Sh, "a4_7", 3), t);
  joinButton(c, 540, 1320, gt, Sh.start + L(Sh, "a4_7", 4), { bg: YEL, fg: "#111", text: "JOIN VIBE EDITING  →", font: U.F.title(44, 900), w: 760, h: 130 });
  chorusPills(c, gt, [[300, 1480, -4], [780, 1460, 4], [320, 1620, 3], [770, 1640, -3]], { px: 38, bg: (i) => (i % 2 ? YEL : "#fff"), fg: () => "#111" });
} });

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = U.F.ui(46, 800); const s = ws.join(" "), tw = c.measureText(s).width, sp = c.measureText(" ").width;
  c.fillStyle = "rgba(15,20,18,.78)"; rr(c, 540 - tw / 2 - 26, 1600 - 40, tw + 52, 80, 14); c.fill();
  let x = 540 - tw / 2; c.textBaseline = "middle";
  ws.forEach((q, i) => { c.fillStyle = i === active ? YEL : "#fff"; c.fillText(q, x, 1602); x += c.measureText(q).width + sp; });
  c.restore();
}
window.AD = { shots: S, caption, grain: 0.22, images: ["cut_hand_point"], photos: [] };
})();

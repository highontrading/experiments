// Ad 5 · "Apni Desk Badlo" — design system 5: a top-down desk on a grid mat, real objects
// around the edges, a dark photo card with blue sky and green grass, dark subtitle pills.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { deg, FX, cut, paper, grid, codePanel, promptBox, phone, reel, chorusPills, joinButton, at, wd, stampWord, tag } = K;
const INK = "#1f2a44", RED = "#d13b3b";

function bg(c, gt, S) {
  paper(c, IMG.graph_desk ? "graph_desk" : "paper_white", "#d9d9d4", { filter: "grayscale(1) brightness(1.02) contrast(.55)" });
  if (!IMG.graph_desk) grid(c, 0, 0, W, H, 58, "rgba(40,40,50,.24)", 1.5);
  // soft overhead light and a vignette, like a photo of a real desk
  const g = c.createRadialGradient(540, 800, 200, 540, 900, 1300); g.addColorStop(0, "rgba(255,255,255,.12)"); g.addColorStop(1, "rgba(0,0,0,.28)");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
// the objects around the desk; each slides in from off-desk once and then stays put
function props(c, lt, gt, o = {}) {
  const P = [["cut_clapper", 40, 170, 420, -18, 0.0], ["cut_folder", 1040, 1100, 640, 12, 0.08], ["cut_teacup", 980, 1560, 300, 0, 0.14],
    ["cut_chai", 960, 260, 260, 0, 0.2], ["cut_notebook", 110, 1730, 520, 8, 0.26], ["cut_pen", 880, 1780, 380, 35, 0.32], ["cut_headphones", 120, 1100, 360, -75, 0.38]];
  P.forEach(([n, x, y, h, r, t0]) => {
    if (o.skip && o.skip.includes(n)) return;
    const e = apple(win(t0, t0 + 0.6, o.inAt ?? lt));
    cut(c, n, x + (1 - e) * (x < 540 ? -500 : 500), y, h, { rot: deg(r), sy: 18, blur: 30 });
  });
}
// the dark photo card from the reference; body paints the photo
function card(c, x, y, w, h, rot, body) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 40; c.shadowOffsetY = 22;
  c.fillStyle = "#2b2b2b"; rr(c, -w / 2, -h / 2, w, h, 26); c.fill(); c.shadowColor = "transparent";
  c.save(); rr(c, -w / 2 + 26, -h / 2 + 26, w - 52, h - 52, 10); c.clip(); c.translate(-w / 2 + 26, -h / 2 + 26); body(c, w - 52, h - 52); c.restore();
  c.restore();
}
// blue sky over green grass, with the creator standing on it
function skyGrass(cc, w, h, lt, o = {}) {
  footage(cc, "sky", lt * 0.5, 0, 0, w, h * 0.72, { mode: "loop" });
  cc.save(); cc.beginPath(); cc.rect(0, h * 0.68, w, h * 0.32); cc.clip(); cover(cc, IMG.grass, 0, h * 0.62, w, h * 0.38, 0.5, 0.9); cc.restore();
  if (o.creator !== false) cut(cc, "cut_creator", w / 2, h * 0.93, h * 0.62, { ay: 1, sy: 10 });
}
// a sticky note with handwriting
function sticky(c, s, x, y, col, lt, t0, o = {}) {
  const e = spring(lt, t0, 0.45); if (e <= 0) return;
  c.save(); c.translate(x, y - (1 - e) * 60); c.rotate(deg(o.rot || 0)); c.scale(1 + (1 - e) * 0.6, 1 + (1 - e) * 0.6); c.globalAlpha = clamp(e * 2);
  if (IMG.cut_stickynote) { c.filter = `hue-rotate(${o.hue || 0}deg)`; cut(c, "cut_stickynote", 0, 0, o.h || 250, { rot: 0 }); c.filter = "none"; }
  else { c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 18; c.shadowOffsetY = 10; c.fillStyle = col; c.fillRect(-(o.h || 250) / 2, -(o.h || 250) / 2, o.h || 250, o.h || 250); c.shadowColor = "transparent"; }
  c.font = o.font || FX.hand(64); c.fillStyle = o.ink || INK; c.textAlign = "center"; c.textBaseline = "middle";
  String(s).split("\n").forEach((ln, i, a) => c.fillText(ln, 0, (i - (a.length - 1) / 2) * 62));
  c.restore();
}
// the to-do page on the notebook, written by hand
function todo(c, lt, lines, o = {}) {
  c.save(); c.translate(o.x ?? 540, o.y ?? 760); c.rotate(deg(o.rot ?? -3));
  c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = "#fbfaf4"; rr(c, -360, -260, 720, 520, 10); c.fill(); c.shadowColor = "transparent";
  c.strokeStyle = "rgba(80,120,200,.25)"; c.lineWidth = 2; for (let yy = -170; yy < 250; yy += 74) { c.beginPath(); c.moveTo(-330, yy); c.lineTo(330, yy); c.stroke(); }
  c.strokeStyle = "rgba(220,80,80,.35)"; c.beginPath(); c.moveTo(-270, -250); c.lineTo(-270, 250); c.stroke();
  c.font = FX.hand(66); c.fillStyle = INK; c.textBaseline = "alphabetic"; c.textAlign = "left";
  c.fillText("To-do:", -250, -190);
  lines.forEach(([s, t0, done, tickAt], i) => {
    const n = Math.floor(s.length * clamp((lt - t0) / 0.9)); if (n <= 0) return;
    const y = -110 + i * 100;
    c.font = FX.hand(58); c.fillStyle = INK; c.fillText(s.slice(0, n), -200, y);
    c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(-250, y - 36, 34, 34);
    if (tickAt != null && lt > tickAt) {
      const k = clamp((lt - tickAt) / 0.25);
      c.strokeStyle = RED; c.lineWidth = 7; c.beginPath(); c.moveTo(-246, y - 18); c.lineTo(-234, y - 4 + 0 * k); c.lineTo(-234 + 30 * k, y - 46 * k); c.stroke();
      if (done) { c.lineWidth = 5; c.beginPath(); c.moveTo(-205, y - 18); c.lineTo(-205 + c.measureText(s).width * k, y - 18); c.stroke(); }
    }
  });
  c.restore();
}

const S = {};
S.desk = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a5_1", n, Sc);
  props(c, lt, gt);
  cut(c, "cut_phone", 290, 520, 520, { rot: deg(8) });
  todo(c, lt, [["Ek reel edit karna…", w(8) + 0.2, false], ["…poora din", w(10), false]], { y: 1000 });
  stampWord(c, "POORA DIN?!", 600, 1440, FX.marker(90), RED, w(11) + 0.1, lt, { rot: deg(-6), shadow: false });
} };
S.stuck = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a5_2", n, Sc);
  props(c, 9, gt);
  card(c, 560, 600, 640, 470, deg(3), (cc, cw, ch) => footage(cc, IMG.ph_creator_phone || (window.FOOT || {}).creator_phone ? "creator_phone" : "local", lt, 0, 0, cw, ch, { mode: "loop" }));
  sticky(c, "FOOTAGE ✓", 260, 1040, "#ffe36b", lt, w(0), { rot: -6 });
  sticky(c, "IDEA ✓", 560, 1100, "#ff9fb3", lt, w(3), { rot: 4, hue: -60 });
  const shake = lt > w(9) ? Math.sin(lt * 40) * 4 * Math.exp(-(lt - w(9)) * 2) : 0;
  sticky(c, "EDITING\n???", 860 + shake, 1050, "#9fd3ff", lt, w(6), { rot: -3, hue: 160, ink: RED });
  stampWord(c, "RUK GAYA.", 540, 1480, FX.marker(96), RED, w(9), lt, { rot: deg(-4), shadow: false });
} };
S.meet = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a5_3", n, Sc);
  props(c, 9, gt);
  // the card flips over to the sky-and-grass photo
  const f = win(0, 0.45, lt), sx = Math.abs(Math.cos(Math.PI * f));
  c.save(); c.translate(540, 820); c.scale(Math.max(0.02, sx), 1); c.translate(-540, -820);
  card(c, 540, 820, 700, 960, deg(-2), (cc, cw, ch) => f < 0.5 ? footage(cc, "local", 0, 0, 0, cw, ch) : skyGrass(cc, cw, ch, lt));
  c.restore();
  if (f >= 0.5) tag(c, "VIBE EDITING", 540, 1360, FX.inter(54, 800), { bg: "#2b2b2b", fg: "#fff", h: 100, r: 50, s: spring(lt, w(2) - 0.1, 0.5) });
} };
S.prompt = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a5_4", n, Sc);
  props(c, 9, gt, { skip: ["cut_headphones"] });
  phone(c, 300, 760, 820, deg(-6), (cc, pw, ph) => {
    cc.fillStyle = "#f2f2f5"; cc.fillRect(0, 0, pw, ph);
    cc.fillStyle = "#2b2b2b"; cc.fillRect(0, 0, pw, 120); cc.font = FX.inter(30, 800); cc.fillStyle = "#fff"; cc.textAlign = "center"; cc.fillText("Vibe Editing", pw / 2, 92);
    cc.save(); cc.translate(pw / 2, ph * 0.72); promptBox(cc, 0, 0, pw - 30, "Tees second ki reel, fast cuts, bold captions.", win(w(3), w(11), lt), { px: 26, accent: "#2b2b2b" }); cc.restore();
  });
  const ec = spring(lt, w(12) - 0.2, 0.6);
  if (ec > 0) { c.save(); c.globalAlpha = clamp(ec * 2); codePanel(c, 760, 560 + (1 - ec) * 300, 560, 540, win(w(12), w(17), lt), { rot: deg(5), px: 20 }); c.restore(); }
  const ev = spring(lt, w(17) - 0.1, 0.6);
  if (ev > 0) card(c, 720, 1260 + (1 - ev) * 900, 520, 760, deg(4), (cc, cw, ch) => reel(cc, cw, ch, lt - w(17)));
} };
S.langs = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a5_5", n, Sc);
  props(c, 9, gt);
  card(c, 540, 760, 620, 860, deg(-2), (cc, cw, ch) => reel(cc, cw, ch, lt + 3));
  const N = [["हिन्दी", "hi", 0, 210, 1180, -8, 0], ["मराठी", "mr", 1, 860, 1220, 6, -50], ["ગુજરાતી", "gu", 2, 260, 1500, 5, 90], ["தமிழ்", "ta", 3, 820, 1520, -5, 160],
    ["বাংলা", "bn", 5, 170, 420, 6, 200], ["తెలుగు", "te", 6, 910, 380, -6, 20], ["ಕನ್ನಡ", "kn", 7, 540, 1690, 3, -90]];
  N.forEach(([s, l, n, x, y, r, hue]) => sticky(c, s, x, y, "#ffe36b", lt, w(n) - 0.05, { rot: r, hue, font: FX.baloo(l, 60), h: 230 }));
} };
S.done = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a5_6", n, Sc);
  props(c, 9, gt);
  todo(c, lt + 9, [["Ek reel edit karna…", 0, true, Sc.start * 0 + w(1) + 9], ["…poora din", 0, true, w(1) + 9.15], ["Content banao!", w(5) + 9, false]], { y: 860 });
  stampWord(c, "HO GAYI ✓", 540, 1200, FX.marker(100), "#1f9e5a", w(1), lt, { rot: deg(-5), shadow: false });
} };
S.cta = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a5_7", n, Sc);
  props(c, 9, gt);
  card(c, 540, 700, 760, 860, deg(-1.5), (cc, cw, ch) => {
    skyGrass(cc, cw, ch, lt);
    cc.font = FX.inter(70, 900); cc.fillStyle = "#fff"; cc.textAlign = "center"; cc.shadowColor = "rgba(0,0,0,.35)"; cc.shadowBlur = 12;
    cc.fillText("VIBE EDITING", cw / 2, 120); cc.font = FX.inter(36, 700); cc.fillText("Apni desk badlo.", cw / 2, 176);
  });
  joinButton(c, 540, 1180, gt, Sc.start + w(5), { bg: "#2b2b2b", text: "JOIN VIBE EDITING  →", font: FX.inter(50, 800) });
  chorusPills(c, gt, [[290, 1420, -4], [790, 1400, 4], [300, 1600, 3], [780, 1620, -3]], { px: 40, bg: () => "#ffe36b", fg: () => INK });
} };

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = FX.inter(58, 600); const s = ws.join(" "), tw = c.measureText(s).width;
  c.translate(540, 1330);
  c.fillStyle = "rgba(40,40,40,.86)"; rr(c, -tw / 2 - 26, -50, tw + 52, 100, 10); c.fill();
  let x = -tw / 2; const sp = c.measureText(" ").width;
  ws.forEach((q, i) => { c.fillStyle = i <= active ? "#fff" : "rgba(255,255,255,.55)"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(q, x, 3); x += c.measureText(q).width + sp; });
  c.restore();
}

window.AD = { bg, scenes: S, caption, grain: 0.18,
  trans: { stuck: { type: "zoom", d: 0.5, fx: 540, fy: 820 }, prompt: { type: "slide", d: 0.55 }, langs: { type: "up", d: 0.6 } },
  images: ["graph_desk", "paper_white", "grass", "cut_phone", "cut_clapper", "cut_teacup", "cut_folder", "cut_chai", "cut_notebook", "cut_pen", "cut_headphones", "cut_stickynote", "cut_creator"] };
})();

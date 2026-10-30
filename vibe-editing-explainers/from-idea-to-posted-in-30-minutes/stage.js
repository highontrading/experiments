// From idea to posted in 30 minutes.
// Warm documentary look: real footage graded warm, huge gold condensed type, amber title
// cards, rolling clock times as the spine. The film is a list of shots; neighbouring shots
// overlap by a few tenths of a second and a transition blends them.
(function () {
const { C, W, H, win, lerp, clamp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring } = K;

// ---------------------------------------------------------------- palette --
const GOLD = ["#ffe58a", "#ffc93a", "#e99a14"], BROWN = "#3a2208", AMBER = "#f2a516";
const WARM = "sepia(0.32) saturate(1.18) contrast(1.06) brightness(0.9)";

// ---------------------------------------------------------------- helpers --
function warmFoot(g, name, lt, x, y, w, h, o = {}) {
  const fr = K.footage(name, (o.ss || 0) + lt * (o.speed || 1), 1, true);
  if (!fr) return;
  g.save();
  g.filter = o.filter || WARM;
  if (o.clip !== false) { g.beginPath(); g.rect(x, y, w, h); g.clip(); }
  K.drawFit(g, fr, x, y, w, h, { fx: o.fx, fy: o.fy, zoom: o.zoom });
  g.restore();
}
function fullFoot(g, name, lt, o = {}) {
  const z = (o.zoom || 1.06) + (o.push ?? 0.05) * lt / 4;   // slow push-in
  warmFoot(g, name, lt, 0, 0, W, H, { ...o, zoom: z });
}
function darken(g, a) { g.fillStyle = `rgba(14,8,2,${a})`; g.fillRect(0, 0, W, H); }

// gold condensed letters with a bevel and a soft drop shadow, revealed with a dusty blur
function gold(g, text, x, y, size, o = {}) {
  const p = o.p ?? 1;
  if (p <= 0) return;
  g.save();
  K.font(g, size, 400, o.font || "Anton");
  g.textAlign = o.align || "center"; g.textBaseline = "alphabetic";
  if (g.letterSpacing !== undefined) g.letterSpacing = `${(o.track ?? 0.01) * size}px`;
  const a = clamp(p * 1.4) * (o.alpha ?? 1);
  g.globalAlpha = a;
  const rise = (1 - outCubic(clamp(p))) * size * 0.25;
  const blur = (1 - clamp(p * 1.2)) * 14;
  if (blur > 0.3) g.filter = `blur(${blur.toFixed(1)}px)`;
  const yy = y + rise;
  // drop shadow
  g.shadowColor = "rgba(0,0,0,0.65)"; g.shadowBlur = size * 0.18; g.shadowOffsetY = size * 0.06;
  g.fillStyle = "#2a1604"; g.fillText(text, x, yy + size * 0.035);
  K.noShadow(g);
  // bevel: darker gold under, gradient face on top
  g.fillStyle = "#9a5c08"; g.fillText(text, x, yy + size * 0.02);
  const gr = g.createLinearGradient(0, yy - size * 0.78, 0, yy);
  gr.addColorStop(0, o.c0 || GOLD[0]); gr.addColorStop(0.55, o.c1 || GOLD[1]); gr.addColorStop(1, o.c2 || GOLD[2]);
  g.fillStyle = gr; g.fillText(text, x, yy);
  // a thin highlight along the top edge
  g.globalAlpha = a * 0.35; g.fillStyle = "#fff6d0";
  g.save(); g.beginPath(); g.rect(x - 2000, yy - size * 0.8, 4000, size * 0.12); g.clip(); g.fillText(text, x, yy); g.restore();
  g.restore();
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
}
// words of a line appearing on their spoken times: [[word, t], ...]
function goldWords(g, t, words, x, y, size, o = {}) {
  K.font(g, size, 400, o.font || "Anton");
  if (g.letterSpacing !== undefined) g.letterSpacing = `${(o.track ?? 0.01) * size}px`;
  const sp = size * 0.28;
  const ws = words.map(([w]) => g.measureText(w).width);
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let xx = o.align === "left" ? x : x - total / 2;
  words.forEach(([w, at], i) => {
    gold(g, w, xx + ws[i] / 2, y, size, { ...o, align: "center", p: win(at - 0.06, at + 0.32, t) * (o.p ?? 1) });
    xx += ws[i] + sp;
  });
}
// a full amber title card with bold black words
function amberCard(g, t, lines, o = {}) {
  const gr = g.createRadialGradient(W / 2, H * 0.45, 80, W / 2, H * 0.45, H * 0.75);
  gr.addColorStop(0, "#ffc23a"); gr.addColorStop(0.55, "#f0a010"); gr.addColorStop(1, "#8a4e02");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // paper mottling
  g.save(); g.globalAlpha = 0.18; g.globalCompositeOperation = "multiply";
  g.drawImage(K.GRAIN[Math.floor(t * 12) % 6], 0, 0, W, H); g.restore();
  const size = o.size || 210, lh = size * 0.98;
  const y0 = (o.y || H * 0.47) - (lines.length - 1) * lh / 2;
  lines.forEach((words, li) => {
    K.font(g, size, 400, "Anton");
    const sp = size * 0.26;
    const ws = words.map(([w]) => g.measureText(w).width);
    const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let xx = W / 2 - total / 2;
    words.forEach(([w, at], i) => {
      const p = win(at - 0.05, at + 0.25, t);
      if (p > 0) {
        g.save();
        g.globalAlpha = clamp(p * 1.6);
        const s = 1 + 0.25 * (1 - outExpo(p));
        g.translate(xx + ws[i] / 2, y0 + li * lh); g.scale(s, s);
        g.textAlign = "center"; g.textBaseline = "alphabetic";
        g.shadowColor = "rgba(90,40,0,0.45)"; g.shadowBlur = 18; g.shadowOffsetY = 8;
        g.fillStyle = "#140b02"; g.fillText(w, 0, 0);
        g.restore();
      }
      xx += ws[i] + sp;
    });
  });
}
// rolling clock time: from "9:00" to "9:05", each changed digit rolls up
function rollTime(g, t, from, to, at, x, y, size) {
  K.font(g, size, 400, "Anton");
  const cw = [...to].map((ch) => g.measureText(ch === ":" ? ":" : "0").width);
  const total = cw.reduce((a, b) => a + b, 0);
  let xx = x - total / 2;
  [...to].forEach((ch, i) => {
    const prev = from[i];
    const d = i * 0.06;
    const p = prev === ch ? 1 : outQuint(win(at + d, at + d + 0.55, t));
    g.save();
    g.beginPath(); g.rect(xx - 20, y - size * 0.98, cw[i] + 40, size * 1.2); g.clip();
    if (p < 1) gold(g, prev, xx + cw[i] / 2, y - p * size * 1.05, size, { alpha: 1 - p });
    gold(g, ch, xx + cw[i] / 2, y + (1 - p) * size * 1.05, size);
    g.restore();
    xx += cw[i];
  });
}
function sticker(g, key, x, y, w, rot, p) {
  const im = K.object(key);
  if (!im || p <= 0) return;
  const h = w * im.height / im.width, s = 1.2 - 0.2 * p;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(s, s); g.globalAlpha = clamp(p * 2);
  K.shadow(g, 30, 18, 0.5, "10,5,0"); g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
  g.restore();
}
function stamp(g, text, x, y, size, rot, p, o = {}) {
  if (p <= 0) return;
  K.font(g, size, 400, "Anton");
  const tw = g.measureText(text).width, pad = size * 0.35;
  const s = 1 + 0.6 * (1 - outExpo(p));
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(s, s); g.globalAlpha = clamp(p * 2.5) * 0.95;
  g.strokeStyle = o.color || "#c0260e"; g.lineWidth = size * 0.09;
  K.rr(g, -tw / 2 - pad, -size * 0.72, tw + pad * 2, size * 1.05, size * 0.12); g.stroke();
  g.fillStyle = o.color || "#c0260e"; g.textAlign = "center"; g.textBaseline = "alphabetic";
  g.fillText(text, 0, size * 0.18);
  g.restore();
}
function paper(g, x, y, w, h, rot, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180);
  K.shadow(g, 40, 22, 0.55, "10,5,0");
  g.fillStyle = o.fill || "#f2e8d2"; g.fillRect(-w / 2, -h / 2, w, h);
  K.noShadow(g);
  const gr = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  gr.addColorStop(0, "rgba(255,255,255,0.12)"); gr.addColorStop(1, "rgba(120,80,30,0.16)");
  g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, w, h);
  if (o.ruled) {
    g.strokeStyle = "rgba(70,110,170,0.28)"; g.lineWidth = 2;
    for (let yy = -h / 2 + o.ruled; yy < h / 2 - 20; yy += o.ruled) { g.beginPath(); g.moveTo(-w / 2 + 20, yy); g.lineTo(w / 2 - 20, yy); g.stroke(); }
    g.strokeStyle = "rgba(200,60,50,0.45)"; g.beginPath(); g.moveTo(-w / 2 + 90, -h / 2); g.lineTo(-w / 2 + 90, h / 2); g.stroke();
  }
}
function heart(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s / 32, s / 32); g.fillStyle = col;
  g.beginPath(); g.moveTo(0, 10); g.bezierCurveTo(-28, -8, -14, -30, 0, -14); g.bezierCurveTo(14, -30, 28, -8, 0, 10); g.fill();
  g.restore();
}
function pin(g, x, y) {
  K.shadow(g, 8, 5, 0.5, "10,5,0");
  const gr = g.createRadialGradient(x - 5, y - 5, 2, x, y, 16);
  gr.addColorStop(0, "#ff8a7a"); gr.addColorStop(1, "#a3170c");
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); K.noShadow(g);
}
function check(g, x, y, s, p) {
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(s * (0.6 + 0.4 * spring(p)), s * (0.6 + 0.4 * spring(p))); g.globalAlpha = clamp(p * 2);
  g.fillStyle = "#2f8a3a"; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.fill();
  g.strokeStyle = "#fff"; g.lineWidth = 7; g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); g.moveTo(-13, 1); g.lineTo(-3, 11); g.lineTo(14, -10); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- time cards --
// The spine: before each beat the clock rolls to the new time over a real clock.
function timeCard(g, t, lt, o) {
  if (o.bg === "mantel") fullFoot(g, "ip_mantel", lt + (o.ss || 0), { fx: 0.5, zoom: 1.25, push: 0.08 });
  else fullFoot(g, "ip_wallclock", lt + (o.ss || 0), { fx: o.fx ?? 0.42, fy: 0.5, zoom: o.zoom || 1.15, push: 0.1,
    filter: "sepia(0.55) saturate(1.3) contrast(1.1) brightness(0.62)" });
  darken(g, 0.32);
  // a warm pool of light behind the time
  const gr = g.createRadialGradient(W / 2, 760, 40, W / 2, 760, 620);
  gr.addColorStop(0, "rgba(255,170,40,0.22)"); gr.addColorStop(1, "rgba(255,170,40,0)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  rollTime(g, t, o.from, o.to, o.at, W / 2, 900, 400);
  gold(g, "PM", W / 2 + 330, 560, 80, { p: win(o.at, o.at + 0.4, t) });
  if (o.label) goldWords(g, t, o.label, W / 2, 1110, 120);
  // minute hand sweep under the time
  const hp = outCubic(win(o.at - 0.2, o.at + 0.7, t));
  g.save(); g.translate(W / 2, 1270); g.globalAlpha = 0.85 * clamp(hp * 3);
  g.strokeStyle = "rgba(255,210,110,0.55)"; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 70, 0, 7); g.stroke();
  g.rotate(-Math.PI / 2 + (o.sweep || 0.5) * hp * Math.PI * 2);
  g.strokeStyle = GOLD[1]; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(0, 0); g.lineTo(62, 0); g.stroke();
  g.fillStyle = GOLD[1]; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- shots --
// Each shot: a, b (absolute times, overlap with neighbours), tr = transition INTO this shot.
const S = [];
const shot = (a, b, tr, draw) => S.push({ a, b, tr, draw });

// --- hook: 9 PM, only an idea; 9:30, posted; here's how
shot(0, 1.25, null, (g, t, lt) => {
  fullFoot(g, "ip_mantel", lt + 0.5, { fx: 0.5, zoom: 1.32, push: 0.12 });
  darken(g, 0.2);
  goldWords(g, t, [["AT", 0.0]], W / 2, 560, 110);
  rollTime(g, t, "0:00", "9:00", 0.1, W / 2, 930, 380);
  gold(g, "PM", W / 2, 1110, 120, { p: win(0.45, 0.8, t) });
});
shot(1.05, 2.95, "dust", (g, t, lt) => {
  fullFoot(g, "oh_bulb", lt + 0.3, { zoom: 1.08, push: 0.08, filter: "sepia(0.2) saturate(1.2) contrast(1.1) brightness(0.95)" });
  goldWords(g, t, [["THERE'S", 1.2], ["ONLY", 1.6], ["AN", 1.8]], W / 2, 360, 110);
  gold(g, "IDEA", W / 2, 1240, 330, { p: win(1.88, 2.25, t) });
});
shot(2.75, 5.05, "clock", (g, t, lt) => {
  fullFoot(g, "ip_wallclock", lt + 3, { fx: 0.38, zoom: 1.28, push: 0.1,
    filter: "sepia(0.5) saturate(1.25) contrast(1.1) brightness(0.7)" });
  darken(g, 0.25);
  goldWords(g, t, [["BY", 2.88]], W / 2, 520, 110);
  rollTime(g, t, "9:00", "9:30", 3.2, W / 2, 900, 380);
  stamp(g, "POSTED", W / 2, 1180, 150, -6, win(4.3, 4.55, t), { color: AMBER });
});
shot(4.95, 6.15, "cut", (g, t, lt) => {
  amberCard(g, t, [[["HERE'S", 5.0]], [["HOW.", 5.26]]], { size: 260 });
});

// --- 9:00 the idea
shot(5.95, 7.4, "dust", (g, t, lt) => timeCard(g, t, lt, { bg: "mantel", from: "9:30", to: "9:00", at: 6.05, ss: 3 }));
shot(7.15, 8.45, "push", (g, t, lt) => {
  fullFoot(g, "ip_lamp", lt + 1, { fx: 0.46, zoom: 1.12, push: 0.1 });
  darken(g, 0.12);
  goldWords(g, t, [["THE", 7.14], ["IDEA", 7.3]], W / 2, 400, 190);
  gold(g, "9:00 PM", W / 2, 1420, 70, { p: win(7.3, 7.7, t), alpha: 0.9 });
});
shot(8.2, 11.3, "whip", (g, t, lt) => {
  // top-down desk: the idea written into a notebook
  fullFoot(g, "rv_wood", lt, { zoom: 1.05, push: 0.03, filter: "sepia(0.25) saturate(1.1) brightness(0.8)" });
  darken(g, 0.15);
  goldWords(g, t, [["THE", 8.25], ["IDEA", 8.25]], W / 2, 300, 120);
  const pIn = outQuint(win(8.2, 8.75, t));
  paper(g, W / 2, 860 + (1 - pIn) * 300, 800, 640, -3, { ruled: 74 });
  K.font(g, 86, 600, "Caveat"); g.fillStyle = "#1d2b55"; g.textAlign = "left"; g.textBaseline = "alphabetic";
  const l1 = K.typed("Explain vibe editing", t, 8.25, 26), l2 = K.typed("in one minute.", t, 9.4, 22);
  g.fillText(l1, -310, -120); g.fillText(l2, -310, -10);
  const l3 = K.typed("→ for creators", t, 10.15, 22);
  K.font(g, 66, 600, "Caveat"); g.fillStyle = "#8a2b1d"; g.fillText(l3, -310, 120);
  // the pencil follows the writing
  K.font(g, 86, 600, "Caveat");
  const writing = l2.length && l2.length < 14 ? [-310 + g.measureText(l2).width, -10] : l3.length && l3.length < 14 ? [-310 + g.measureText(l3).width * 0.77, 120] : [-310 + g.measureText(l1).width, -120];
  g.restore();
  const pc = K.object("pencil");
  if (pc) {
    // the cut-out's tip is its top-left corner: put it on the end of the line being written
    const px = W / 2 + writing[0] + 6 + Math.sin(t * 30) * 4, py = 860 + writing[1] - 8 + Math.cos(t * 23) * 3;
    g.save(); g.translate(px, py); g.rotate(-0.08); K.shadow(g, 18, 14, 0.5, "10,5,0");
    g.drawImage(pc, -4, -4, pc.width * 0.62, pc.height * 0.62); g.restore();
  }
  const pm = win(9.94, 10.25, t);
  if (pm > 0) {
    g.save(); g.strokeStyle = "rgba(192,38,14,0.85)"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.ellipse(W / 2 + 70, 860 - 30, 230, 70, -0.05, -Math.PI * 0.9, -Math.PI * 0.9 + Math.PI * 2 * outCubic(pm)); g.stroke(); g.restore();
  }
  gold(g, "1 MINUTE", W / 2, 1360, 150, { p: win(9.94, 10.3, t) });
});

// --- 9:05 the brief
shot(11.0, 12.35, "clock", (g, t, lt) => timeCard(g, t, lt, { from: "9:00", to: "9:05", at: 11.1, ss: 1, fx: 0.55, sweep: 0.08 }));
const BRIEF = [
  "A 60-second vertical video on vibe editing.",
  "Calm, confident voice. Warm, cinematic look.",
  "Real footage only. Captions on every line.",
  "End on: Join vibe editing.",
];
shot(12.15, 16.2, "push", (g, t, lt) => {
  fullFoot(g, "oh_wood", lt, { zoom: 1.05, push: 0.03, filter: "sepia(0.3) saturate(1.1) brightness(0.72)" });
  // the hand writing it, as a framed inset
  const pi = outQuint(win(12.15, 12.7, t));
  g.save(); g.translate(W / 2, 470 - (1 - pi) * 80); g.rotate(-0.02);
  K.shadow(g, 30, 16, 0.55, "10,5,0"); g.fillStyle = "#efe4cc"; g.fillRect(-430, -230, 860, 460); K.noShadow(g);
  warmFoot(g, "ip_writing", lt + 0.5, -410, -210, 820, 420, { fx: 0.72, fy: 0.6, zoom: 1.35, filter: "sepia(0.45) saturate(1.3) brightness(1.75) contrast(1.15)" });
  g.restore();
  const hx = win(C.b_four - 0.1, C.b_four + 0.15, t);
  gold(g, "THE BRIEF", W / 2, 260, 150, { p: win(12.3, 12.65, t), alpha: 1 - hx });
  goldWords(g, t, [["4", C.b_four], ["SENTENCES", C.b_four + 0.24]], W / 2, 260, 150);
  // the brief, typed line by line on paper
  const pp = outQuint(win(12.3, 12.85, t));
  paper(g, W / 2, 1080 + (1 - pp) * 260, 900, 600, 1.2);
  g.textAlign = "left"; g.textBaseline = "alphabetic";
  K.font(g, 30, 700, "Inter Var"); g.fillStyle = "#8a5a12"; g.fillText("BRIEF.TXT   ·   4 SENTENCES", -400, -235);
  const starts = [12.55, 13.25, 13.95, 14.6];
  BRIEF.forEach((s, i) => {
    const y = -165 + i * 118;
    const txt = K.typed(s, t, starts[i], 46);
    const lit = t > C.b_four && t < C.b_four + 1.0 ? 0.6 + 0.4 * Math.sin((t - C.b_four) * 12) : 0;
    g.fillStyle = "#c0260e"; K.font(g, 40, 800, "Inter Var"); g.fillText(`${i + 1}`, -400, y + 4);
    K.font(g, 38, 500, "Inter Var"); g.fillStyle = "#1c1408";
    const lines = K.wrap(g, txt, 720);
    lines.slice(0, 2).forEach((ln, k) => g.fillText(ln, -350, y + k * 46));
    if (txt.length < s.length && txt.length > 0 && Math.floor(t * 3) % 2 === 0) {
      const last = lines[lines.length - 1] || "";
      g.fillRect(-350 + g.measureText(last).width + 4, y + (lines.length - 1) * 46 - 32, 4, 40);
    }
    if (lit) { g.fillStyle = `rgba(255,190,40,${0.25 * lit})`; g.fillRect(-410, y - 40, 820, 100); }
  });
  g.restore();
  stamp(g, "PLAIN ENGLISH", W / 2 + 160, 1395, 70, -5, win(14.42, 14.65, t));
});

// --- 9:12 the first draft
shot(16.0, 17.3, "clock", (g, t, lt) => timeCard(g, t, lt, { bg: "mantel", from: "9:05", to: "9:12", at: 16.05, ss: 5, sweep: 0.12 }));
const THUMBS = [["typing", 1.2], ["ip_lamp", 2], ["oh_bulb", 1], ["ip_writing", 2], ["cw_creator", 2], ["ip_feed", 3], ["hw_coffee", 1]];
function editorUI(g, t, x, y, w, h, prog) {
  // a dark editor on the laptop screen: preview on top, three tracks below
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = "#16130f"; g.fillRect(x, y, w, h);
  const ph = h * 0.52;
  const nPlaced = Math.floor(prog * THUMBS.length + 0.001);
  const cur = THUMBS[Math.max(0, Math.min(THUMBS.length - 1, nPlaced - 1))];
  warmFoot(g, cur[0], t + cur[1], x + w * 0.2, y + 6, w * 0.6, ph - 12, { fx: 0.5 });
  g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x, y + ph, w, 2);
  const ty = y + ph + 10, th = (h - ph - 18) / 3;
  const labels = ["V1", "A1", "CC"];
  labels.forEach((lb, i) => { K.font(g, 13, 700, "Inter Var"); g.fillStyle = "#8b7a5c"; g.textAlign = "left"; g.fillText(lb, x + 6, ty + i * th + th * 0.6); });
  const cw = (w - 40) / THUMBS.length;
  THUMBS.forEach(([nm, ss], i) => {
    const p = outCubic(clamp(prog * THUMBS.length - i));
    if (p <= 0) return;
    const cx = x + 34 + i * cw, cy = ty + 2 - (1 - p) * 40;
    g.globalAlpha = p;
    g.fillStyle = "#e9a83a"; g.fillRect(cx, cy, cw - 4, th - 4);
    warmFoot(g, nm, ss, cx + 2, cy + 2, cw - 8, th - 8, { fx: 0.5 });
    g.globalAlpha = 1;
  });
  const ap = clamp(prog * 1.2);
  if (ap > 0) {   // music
    g.fillStyle = "rgba(90,170,120,0.85)"; g.fillRect(x + 34, ty + th + 2, (w - 44) * ap, th - 4);
    g.fillStyle = "rgba(20,60,30,0.7)";
    for (let k = 0; k < (w - 44) * ap; k += 5) { const a = 0.25 + 0.6 * Math.abs(Math.sin(k * 0.13) * Math.sin(k * 0.031)); g.fillRect(x + 34 + k, ty + th + th / 2 - a * th * 0.35, 3, a * th * 0.7); }
  }
  g.restore();
}
shot(17.1, 19.85, "whip", (g, t, lt) => {
  fullFoot(g, "rv_wood", lt + 2, { zoom: 1.08, push: 0.03, filter: "sepia(0.3) saturate(1.1) brightness(0.7)" });
  goldWords(g, t, [["THE", 17.1], ["FIRST", 17.22], ["DRAFT", 17.54]], W / 2, 330, 150);
  const lap = K.object("hw_laptop");
  const lw = 1000, pl = outQuint(win(17.1, 17.65, t));
  if (lap) {
    const lh = lw * lap.height / lap.width, lx = W / 2 - lw / 2, ly = 520 + (1 - pl) * 200;
    g.save(); g.globalAlpha = clamp(pl * 2); K.shadow(g, 50, 30, 0.6, "10,5,0"); g.drawImage(lap, lx, ly, lw, lh); K.noShadow(g);
    const sc = K.A.objects.hw_laptop.screen;
    const sw = sc.len * lw * 0.985, sh = sc.wid * lw * 0.97;
    editorUI(g, lt, lx + sc.cx * lw - sw / 2, ly + sc.cy * lw - sh / 2, sw, sh, win(18.6, 19.5, t));
    g.restore();
  }
  goldWords(g, t, [["EVERY", 18.46], ["CLIP", 18.66], ["PLACED", 18.98]], W / 2, 1360, 130);
});
shot(19.65, 21.95, "push", (g, t, lt) => {
  fullFoot(g, "oh_phone_b", lt + 0.5, { zoom: 1.0, push: 0.05, filter: "sepia(0.18) saturate(1.1) contrast(1.05) brightness(0.95)" });
  // timed captions on the phone screen, word by word, with their timecodes
  const words = [["VIBE", 19.82], ["EDITING", 20.02], ["IN", 20.3], ["ONE", 20.42], ["MINUTE", 20.55]];
  const on = words.filter(([, at]) => t >= at);
  if (on.length) {
    const [w, at] = on[on.length - 1];
    const p = spring(win(at, at + 0.35, t));
    g.save(); g.translate(540, 1180); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
    K.font(g, 96, 400, "Anton"); g.textAlign = "center";
    const tw = g.measureText(w).width;
    g.fillStyle = "rgba(15,10,4,0.75)"; K.rr(g, -tw / 2 - 26, -92, tw + 52, 116, 14); g.fill();
    g.fillStyle = "#ffd04a"; g.fillText(w, 0, 0);
    g.restore();
    K.font(g, 30, 600, "Mono"); g.fillStyle = "rgba(255,240,210,0.95)"; g.textAlign = "center";
    g.fillText(`00:0${(1 + (at - 19.82) * 1.6).toFixed(1)} → 00:0${(1.3 + (at - 19.82) * 1.6).toFixed(1)}`, 540, 1290);
  }
  gold(g, "EVERY CAPTION", W / 2, 300, 150, { p: win(19.82, 20.15, t) });
  gold(g, "TIMED", W / 2, 455, 170, { p: win(20.5, 20.8, t) });
});

// --- 9:20 the notes
shot(21.75, 23.0, "clock", (g, t, lt) => timeCard(g, t, lt, { from: "9:12", to: "9:20", at: 21.86, ss: 4, fx: 0.33, sweep: 0.14 }));
const NOTES = [["faster start", C.d_faster, 250, 990, -6], ["warmer music", C.d_warmer, 800, 1090, 5], ["bigger captions", C.d_bigger, 330, 1310, 3]];
shot(22.8, 27.95, "dust", (g, t, lt) => {
  fullFoot(g, "oh_sticky", lt, { zoom: 1.1, push: 0.03, filter: "sepia(0.45) saturate(1.1) brightness(0.5) blur(3px)" });
  darken(g, 0.2);
  gold(g, "THE NOTES", W / 2, 240, 150, { p: win(22.9, 23.25, t) });
  // the draft, updating as each note lands
  const fast = t > C.d_faster + 0.35, warm = win(C.d_warmer + 0.3, C.d_warmer + 0.8, t), big = win(C.d_bigger + 0.3, C.d_bigger + 0.7, t);
  const pi = outQuint(win(22.85, 23.4, t));
  g.save(); g.translate(W / 2, 560 - (1 - pi) * 120); g.rotate(-0.015); g.globalAlpha = clamp(pi * 2);
  K.shadow(g, 40, 22, 0.6, "10,5,0"); g.fillStyle = "#f4ead6"; g.fillRect(-380, -250, 760, 500); K.noShadow(g);
  const ft = fast ? 2.2 + (t - C.d_faster) * 1.8 : 2.2 + (t - 22.8) * 0.6;
  warmFoot(g, "cw_creator", ft, -360, -230, 720, 405, { fx: 0.5,
    filter: `sepia(${0.2 + 0.4 * warm}) saturate(${1.05 + 0.35 * warm}) hue-rotate(${-8 * warm}deg) brightness(${1 + 0.06 * warm})` });
  // its caption gets bigger
  const cs = 34 + 40 * outCubic(big);
  K.font(g, cs, 400, "Anton"); g.textAlign = "center";
  const cw = g.measureText("VIBE EDITING").width;
  g.fillStyle = "rgba(15,10,4,0.7)"; K.rr(g, -cw / 2 - 14, 120 - cs * 0.95, cw + 28, cs * 1.25, 8); g.fill();
  g.fillStyle = "#ffd04a"; g.fillText("VIBE EDITING", 0, 120);
  // music bar warms
  for (let k = 0; k < 60; k++) {
    const a = 0.3 + 0.7 * Math.abs(Math.sin(k * 0.7 + t * 6) * Math.sin(k * 0.23));
    g.fillStyle = warm > 0 ? `rgba(${lerp(140, 255, warm)},${lerp(170, 150, warm)},${lerp(200, 40, warm)},0.95)` : "rgba(140,170,200,0.95)";
    g.fillRect(-350 + k * 11.7, 222 - a * 16, 7, a * 32);
  }
  K.font(g, 24, 700, "Inter Var"); g.fillStyle = "#6a4a1a"; g.textAlign = "left"; g.fillText("DRAFT v2", -360, -200 + 440 + 0);
  if (fast) { g.globalAlpha = clamp((t - C.d_faster - 0.35) * 4); K.font(g, 34, 800, "Inter Var"); g.fillStyle = "#c0260e"; g.textAlign = "right"; g.fillText("1.5× START", 350, -190); }
  g.restore();
  // three notes pinned on the wall
  NOTES.forEach(([txt, at, x, y, rot], i) => {
    const p = win(at - 0.05, at + 0.3, t);
    if (p <= 0) return;
    const s = 1 + 0.35 * (1 - outExpo(p));
    g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(s, s); g.globalAlpha = clamp(p * 3);
    K.shadow(g, 26 * s, 12 * s, 0.5, "10,5,0"); g.fillStyle = "#ffe66b"; g.fillRect(-200, -110, 400, 220); K.noShadow(g);
    g.fillStyle = "rgba(160,110,0,0.12)"; g.fillRect(-200, 70, 400, 40);
    K.font(g, 70, 700, "Caveat"); g.fillStyle = "#2a1c05"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(txt, 0, 4);
    pin(g, 0, -88);
    g.restore();
    check(g, x + 175, y - 85, 1, win(at + 0.35, at + 0.65, t));
  });
});

// --- 9:30 posted
shot(27.75, 29.05, "clock", (g, t, lt) => timeCard(g, t, lt, { from: "9:20", to: "9:30", at: 27.8, ss: 6, fx: 0.4, sweep: 0.17 }));
shot(28.95, 30.05, "cut", (g, t, lt) => amberCard(g, t, [[["POSTED.", 29.02]]], { size: 280 }));
shot(29.85, 31.5, "dust", (g, t, lt) => {
  fullFoot(g, "ip_feed", lt + 0.4, { fx: 0.47, zoom: 1.0, push: 0.06 });
  darken(g, 0.08);
  // likes and notifications ticking up
  const n = Math.floor(2481 * outCubic(win(29.9, 31.4, t)));
  const ux = 960, uy = 880;
  heart(g, ux, uy, 70, "#ff4d5e");
  K.font(g, 34, 800, "Inter Var"); g.fillStyle = "#fff"; g.textAlign = "center";
  g.shadowColor = "rgba(0,0,0,0.7)"; g.shadowBlur = 8; g.fillText(n.toLocaleString("en-US"), ux, uy + 70); K.noShadow(g);
  const notes = [["♥  liked your reel", 30.0], ["+ 48 new followers", 30.35], ["“how did you make this?”", 30.7]];
  notes.forEach(([txt, at], i) => {
    const p = spring(win(at, at + 0.5, t));
    if (p <= 0) return;
    g.save(); g.translate(W / 2, 620 + i * 112 - (1 - p) * 40); g.globalAlpha = clamp(p * 2);
    K.font(g, 36, 600, "Inter Var");
    const tw = g.measureText(txt).width;
    K.shadow(g, 24, 10, 0.4); g.fillStyle = "rgba(255,248,236,0.94)"; K.rr(g, -tw / 2 - 34, -44, tw + 68, 80, 40); g.fill(); K.noShadow(g);
    g.fillStyle = "#24170a"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, -3);
    g.restore();
  });
  goldWords(g, t, [["SMART", 30.32], ["EDITORS", 30.64]], W / 2, 380, 150);
});

// --- outro: not the whole night; they direct it; join vibe editing
shot(31.3, 32.95, "whip", (g, t, lt) => {
  fullFoot(g, "ip_hourglass", lt + 1, { fx: 0.3, zoom: 1.2, push: 0.08, filter: "sepia(0.55) saturate(1.3) contrast(1.1) brightness(0.62)" });
  darken(g, 0.2);
  goldWords(g, t, [["DON'T", 31.12], ["SPEND", 31.32]], W / 2, 520, 140);
  goldWords(g, t, [["THE", 31.56], ["WHOLE", 31.68]], W / 2, 760, 220);
  gold(g, "NIGHT", W / 2, 1000, 260, { p: win(31.88, 32.2, t) });
  gold(g, "ON THIS.", W / 2, 1160, 110, { p: win(32.16, 32.4, t) });
});
shot(32.75, 34.15, "cut", (g, t, lt) => amberCard(g, t, [[["THEY", 32.88]], [["DIRECT", 33.04]], [["IT.", 33.52]]], { size: 250 }));
const FILES = [["brief", "TXT", "#e2b13a"], ["edit", "JS", "#3d7bd6"], ["music", "MP3", "#4caf6a"], ["final", "MP4", "#d6543d"]];
shot(33.95, C.end + 0.1, "dust", (g, t, lt) => {
  fullFoot(g, "rv_wood", lt + 3, { zoom: 1.1, push: 0.06, filter: "sepia(0.3) saturate(1.15) brightness(0.75)" });
  const gr = g.createRadialGradient(W / 2, 760, 50, W / 2, 760, 800);
  gr.addColorStop(0, "rgba(255,180,60,0.22)"); gr.addColorStop(1, "rgba(0,0,0,0.35)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // the project files, laid out on the desk
  FILES.forEach(([nm, ext, col], i) => {
    const at = 34.05 + i * 0.12, p = spring(win(at, at + 0.6, t));
    if (p <= 0) return;
    const x = 210 + i * 220, y = 1120 + (i % 2) * 30;
    g.save(); g.translate(x, y + (1 - p) * 120); g.rotate((i - 1.5) * 0.06); g.globalAlpha = clamp(p * 2);
    K.shadow(g, 24, 14, 0.55, "10,5,0");
    g.fillStyle = "#f6efe2"; g.beginPath(); g.moveTo(-70, -95); g.lineTo(40, -95); g.lineTo(70, -65); g.lineTo(70, 95); g.lineTo(-70, 95); g.closePath(); g.fill();
    K.noShadow(g);
    g.fillStyle = "#d9cdb5"; g.beginPath(); g.moveTo(40, -95); g.lineTo(40, -65); g.lineTo(70, -65); g.closePath(); g.fill();
    g.fillStyle = col; K.rr(g, -56, 10, 112, 44, 8); g.fill();
    K.font(g, 28, 800, "Inter Var"); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ext, 0, 33);
    K.font(g, 24, 600, "Inter Var"); g.fillStyle = "#4a3a22"; g.fillText(nm, 0, 130 - 25);
    g.restore();
  });
  goldWords(g, t, [["JOIN", 34.16]], W / 2, 500, 220);
  goldWords(g, t, [["VIBE", 34.48], ["EDITING", 34.8]], W / 2, 760, 210);
  const fp = win(35.6, 36.0, t);
  if (fp > 0) {
    g.save(); g.globalAlpha = fp; K.font(g, 48, 600, "Inter Var"); g.textAlign = "center";
    g.shadowColor = "rgba(0,0,0,0.8)"; g.shadowBlur = 12; g.fillStyle = "#fff3d6";
    g.fillText("follow for more", W / 2, 880); g.restore();
  }
  stamp(g, "COMMENT “VIBE”", W / 2, 1420, 64, -3, win(36.1, 36.35, t), { color: "#ffd04a" });
});

// ---------------------------------------------------------------- transitions --
const cvA = K.makeCanvas(W, H), cvB = K.makeCanvas(W, H), gA = cvA.getContext("2d"), gB = cvB.getContext("2d");
function render(g, s, t) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  s.draw(g, t, t - s.a); g.restore();
}
function composite(g, from, to, type, p) {
  const e = inOutCubic(p);
  g.save();
  if (type === "dust") {
    g.drawImage(from, 0, 0);
    g.globalAlpha = e; g.filter = `blur(${((1 - e) * 16).toFixed(1)}px)`;
    g.drawImage(to, 0, 0);
  } else if (type === "push") {
    const s = 1 + 0.18 * e;
    g.save(); g.globalAlpha = 1 - e * 0.6; g.translate(W / 2, H / 2); g.scale(s, s); g.drawImage(from, -W / 2, -H / 2); g.restore();
    const s2 = 0.86 + 0.14 * outCubic(p);
    g.globalAlpha = clamp(e * 1.6); g.translate(W / 2, H / 2); g.scale(s2, s2); g.drawImage(to, -W / 2, -H / 2);
  } else if (type === "whip") {
    const d = inOutQuint(p) * W;
    g.filter = `blur(${(Math.sin(Math.PI * p) * 18).toFixed(1)}px)`;
    g.drawImage(from, -d, 0); g.drawImage(to, W - d, 0);
  } else if (type === "clock") {
    // a minute hand sweeps around the centre and reveals the next shot behind it
    g.drawImage(from, 0, 0);
    const a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * e;
    g.save(); g.beginPath(); g.moveTo(W / 2, H / 2); g.arc(W / 2, H / 2, H, a0, a1); g.closePath(); g.clip();
    g.drawImage(to, 0, 0); g.restore();
    if (p > 0.02 && p < 0.98) {
      g.save(); g.translate(W / 2, H / 2); g.rotate(a1);
      g.shadowColor = "rgba(255,190,60,0.9)"; g.shadowBlur = 30;
      g.fillStyle = GOLD[1]; g.fillRect(0, -6, H, 12);
      g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill(); g.restore();
    }
  } else {  // cut, with a punch on the incoming frame
    const s = 1.08 - 0.08 * outCubic(clamp(p * 1.5));
    if (p < 0.08) g.drawImage(from, 0, 0);
    else { g.translate(W / 2, H / 2); g.scale(s, s); g.drawImage(to, -W / 2, -H / 2); }
  }
  g.restore();
}

// ---------------------------------------------------------------- dust in the light --
const DUST = Array.from({ length: 70 }, (_, i) => { const r = K.rnd(900 + i); return [r() * W, r() * H, 1 + r() * 3.5, 0.08 + r() * 0.3, r() * 6.28, 6 + r() * 18]; });
function dust(g, t) {
  g.save();
  for (const [x0, y0, s, a, ph, sp] of DUST) {
    const x = (x0 + Math.sin(t * 0.3 + ph) * 40 + t * sp) % W, y = (y0 - t * sp * 0.6 + H * 4) % H;
    g.globalAlpha = a * (0.6 + 0.4 * Math.sin(t * 1.3 + ph));
    g.fillStyle = "#ffe2a8"; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
  }
  g.restore();
}

function frame(g, t) {
  const live = S.filter((s) => t >= s.a && t < s.b);
  let moving = false, speed = 0;
  if (live.length >= 2) {
    const [from, to] = live.slice(-2);
    const p = clamp((t - to.a) / (from.b - to.a));
    render(gA, from, t); render(gB, to, t);
    composite(g, cvA, cvB, to.tr, p);
    if (to.tr === "whip" || to.tr === "clock") { moving = true; speed = Math.sin(Math.PI * p); }
  } else if (live.length) render(g, live[0], t);
  else { g.fillStyle = "#000"; g.fillRect(0, 0, W, H); }
  dust(g, t);
  // warm vignette, grain
  const vg = g.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(18,8,0,0.62)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  K.grain(g, t, 0.09);
  K.captions(g, t, { y: 1540, size: 38, weight: 600, family: "Inter Var", color: "#fff6e4", hi: "#ffc93a", hiText: "#1c1004",
    radius: 6, box: "rgba(20,10,2,0.55)", boxPad: 20, maxW: 880 });
  // fade out the last frames
  const fo = win(C.end - 0.35, C.end, t);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
  return { moving, speed };
}

K.run(frame, ["400 40px Anton", "600 40px 'Inter Var'", "700 40px Caveat", "600 30px Mono"]);
})();

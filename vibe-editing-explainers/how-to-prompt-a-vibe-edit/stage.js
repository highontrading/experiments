// How to prompt a vibe edit — cinematic dark motion design (reference 1).
// Scenes are drawn into offscreen canvases so a cut can whip, zoom or flash between them.
(function () {
const { win, lerp, clamp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring, rnd } = K;
const C = K.C, W = K.W, H = K.H;

const COL = { gold: "#e8a93a", goldDeep: "#b97a17", orange: "#ec6a2c", ink: "#0b0b0d", line: "rgba(220,220,225,0.55)" };
const SANS = "Inter Var", SERIF = "Instrument Serif";

// ---------------------------------------------------------------- helpers --
function layer() { const c = K.makeCanvas(W, H); return { c, g: c.getContext("2d") }; }
const LA = layer(), LB = layer();

function voidBg(g, tint = "#0a0a0c", glow = null) {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  if (glow) {
    const r = g.createRadialGradient(W / 2, glow.y ?? H * 0.42, 0, W / 2, glow.y ?? H * 0.42, glow.r ?? 900);
    r.addColorStop(0, glow.c); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, W, H);
  }
}
function vignette(g, a = 0.75) {
  const v = g.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
// thin wide-tracked sans, revealed word by word on the spoken words
function words(g, list, x, y, t, o = {}) {
  const fs = o.size || 46;
  g.save();
  g.font = `${o.weight || 300} ${fs}px "${SANS}"`;
  if (g.letterSpacing !== undefined) g.letterSpacing = `${o.track ?? 1}px`;
  g.textBaseline = "middle";
  const sp = g.measureText(" ").width * 1.15;
  const widths = list.map(([s]) => g.measureText(s).width);
  const total = widths.reduce((a, b) => a + b, 0) + sp * (list.length - 1);
  let cx = o.align === "left" ? x : x - total / 2;
  list.forEach(([s, at], i) => {
    const p = outCubic(win(at - 0.06, at + 0.28, t));
    if (p > 0) {
      g.globalAlpha = p * (o.alpha ?? 1);
      g.fillStyle = o.color || "#f2f2f2";
      g.filter = p < 1 ? `blur(${(1 - p) * 6}px)` : "none";
      g.fillText(s, cx, y + (1 - p) * 10);
      g.filter = "none";
    }
    cx += widths[i] + sp;
  });
  g.restore();
}
// big italic serif with a coloured glow (the "motion" look)
function glowSerif(g, s, x, y, size, color, glow, t, at, o = {}) {
  const p = outExpo(win(at - 0.05, at + 0.45, t));
  if (p <= 0) return;
  const out = o.out != null ? win(o.out, o.out + 0.3, t) : 0;
  g.save();
  g.translate(x, y); const sc = (0.9 + 0.1 * p) * (1 + 0.05 * out); g.scale(sc, sc);
  g.globalAlpha = p * (1 - out);
  g.font = `italic 400 ${size}px "${SERIF}"`; g.textAlign = o.align || "center"; g.textBaseline = "middle";
  g.filter = p < 1 ? `blur(${(1 - p) * 10}px)` : "none";
  for (const [b, a] of [[60, 0.55], [28, 0.7], [10, 0.9]]) { g.shadowColor = glow; g.shadowBlur = b; g.globalAlpha = p * (1 - out) * a; g.fillStyle = color; g.fillText(s, 0, 0); }
  g.shadowBlur = 0; g.globalAlpha = p * (1 - out); g.fillStyle = color; g.fillText(s, 0, 0);
  g.restore();
}
// gold label tag with dark text (slightly lit, like a small slab)
function goldTag(g, s, x, y, t, at, o = {}) {
  const p = outQuint(win(at - 0.04, at + 0.32, t));
  if (p <= 0) return;
  const fs = o.size || 34;
  g.save();
  g.font = `500 ${fs}px "${SANS}"`; if (g.letterSpacing !== undefined) g.letterSpacing = "1px";
  const tw = g.measureText(s).width, w = (o.w || tw + fs * 1.2), h = fs * 1.5;
  g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
  const sw = w * p;
  g.shadowColor = "rgba(232,169,58,0.55)"; g.shadowBlur = 30;
  const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, "#f6c25c"); gr.addColorStop(1, COL.goldDeep);
  g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, sw, h);
  g.shadowBlur = 0;
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, sw, h); g.clip();
  g.fillStyle = "#2a1a05"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, 0, 1);
  g.restore();
  g.restore();
}
// a glowing light trail along a polyline/bezier, drawn on progressively
function trail(g, pts, t, at, dur = 0.9, color = "255,214,150") {
  const p = inOutCubic(win(at, at + dur, t));
  if (p <= 0) return;
  g.save();
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i + 2 < pts.length; i += 3) g.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]);
  const L = 4000;
  g.setLineDash([L * p, L]); g.lineCap = "round";
  for (const [lw, a, b] of [[14, 0.12, 30], [5, 0.35, 14], [2, 0.95, 4]]) {
    g.strokeStyle = `rgba(${color},${a})`; g.lineWidth = lw; g.shadowColor = `rgba(${color},0.9)`; g.shadowBlur = b; g.stroke();
  }
  g.restore();
}
// thin crosshair lines that draw outward from a point
function crosshair(g, cx, cy, t, at, o = {}) {
  const p = outExpo(win(at, at + (o.dur || 0.7), t));
  if (p <= 0) return;
  g.save(); g.strokeStyle = o.color || COL.line; g.lineWidth = o.lw || 2;
  const ext = 1400 * p;
  g.beginPath();
  g.moveTo(cx - ext, cy); g.lineTo(cx + ext, cy);
  g.moveTo(cx, cy - ext * 1.4); g.lineTo(cx, cy + ext * 1.4);
  if (o.box) { const b = o.box; g.moveTo(cx - b - ext * 0.6, cy - b); g.lineTo(cx + b + ext * 0.6, cy - b); g.moveTo(cx - b - ext * 0.6, cy + b); g.lineTo(cx + b + ext * 0.6, cy + b); g.moveTo(cx - b, cy - b - ext); g.lineTo(cx - b, cy + b + ext); g.moveTo(cx + b, cy - b - ext); g.lineTo(cx + b, cy + b + ext); }
  g.stroke(); g.restore();
}
function brackets(g, x, y, w, h, t, at, o = {}) {
  const p = outQuint(win(at, at + 0.45, t));
  if (p <= 0) return;
  const L = (o.len || 70) * p, pad = (1 - p) * 40;
  g.save(); g.strokeStyle = o.color || "rgba(255,255,255,0.9)"; g.lineWidth = o.lw || 4; g.lineCap = "square";
  const X0 = x - pad, Y0 = y - pad, X1 = x + w + pad, Y1 = y + h + pad;
  g.beginPath();
  g.moveTo(X0, Y0 + L); g.lineTo(X0, Y0); g.lineTo(X0 + L, Y0);
  g.moveTo(X1 - L, Y0); g.lineTo(X1, Y0); g.lineTo(X1, Y0 + L);
  g.moveTo(X1, Y1 - L); g.lineTo(X1, Y1); g.lineTo(X1 - L, Y1);
  g.moveTo(X0 + L, Y1); g.lineTo(X0, Y1); g.lineTo(X0, Y1 - L);
  g.stroke(); g.restore();
}
function clip(g, name, lt, x, y, w, h, o = {}) {
  const fr = K.footage(name, lt * (o.speed || 1) + (o.ss || 0), 1, o.loop ?? true);
  if (!fr) return;
  g.save();
  if (o.r) { K.rr(g, x, y, w, h, o.r); g.clip(); } else { g.beginPath(); g.rect(x, y, w, h); g.clip(); }
  if (o.filter) g.filter = o.filter;
  K.drawFit(g, fr, x, y, w, h, { zoom: o.zoom || 1, fx: o.fx, fy: o.fy });
  g.filter = "none";
  g.restore();
}
function cursor3d(g, x, y, s, press) {
  g.save(); g.translate(x, y); g.scale(s * (1 - 0.12 * press), s * (1 - 0.12 * press)); g.rotate(-0.28);
  g.shadowColor = "rgba(0,0,0,0.35)"; g.shadowBlur = 22; g.shadowOffsetY = 18;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 64); g.lineTo(16, 50); g.lineTo(28, 76); g.lineTo(40, 70); g.lineTo(28, 45); g.lineTo(48, 45); g.closePath();
  const gr = g.createLinearGradient(0, 0, 40, 70); gr.addColorStop(0, "#3a3a3d"); gr.addColorStop(1, "#0d0d0f");
  g.fillStyle = gr; g.fill(); K.noShadow(g);
  g.lineJoin = "round"; g.lineWidth = 3; g.strokeStyle = "#f4f4f4"; g.stroke();
  g.restore();
}

// real thumbnails (frames from real footage) used for the carousel and the wall
const THUMBS = [
  ["hw_dev", 1], ["ai_studio", 2], ["pr_fast", 1], ["ai_editor", 2], ["hw_filming", 1], ["pr_play", 2], ["ff_moviola_film", 1],
  ["ai_grade", 2], ["cw_studio", 1], ["pr_watch", 3], ["hw_reels", 2], ["timeline", 3], ["cw_teacher", 2], ["ff_vhs", 1],
  ["clapper", 1], ["ai_camera", 1], ["cw_creator", 2], ["typing", 2], ["ff_reel", 1], ["hw_podcast", 2], ["cw_florist", 2],
  ["ai_click", 1], ["timelapse", 2], ["hw_editscreen", 1],
];
function thumb(name, lt) { return K.footage(name, lt, 1, true); }

// ---------------------------------------------------------------- scenes --
// Each scene: draw(g, t). The cut table below decides who is on screen when.
const S = {};

// 1 · hook: crosshair + glowing tile, then the curved wall of "generic" clips
S.hook = (g, t) => {
  const flashOn = t >= C.video && t < C.then - 0.02;
  const white = flashOn && (Math.floor((t - C.video) / 0.09) % 2 === 0);
  if (t < C.then - 0.02) {
    voidBg(g, white ? "#f4f4f4" : "#08080a");
    const cx = 540, cy = 720 + 0 * t;
    crosshair(g, cx, cy, t, 0.0, { box: 70, color: white ? "rgba(40,40,45,0.6)" : COL.line, dur: 0.9 });
    // glowing tile at the intersection: a real clip, lit from behind
    const p = spring(win(0.05, 0.9, t)), s = 140 * p;
    if (p > 0) {
      g.save(); g.shadowColor = white ? "rgba(70,140,255,0.9)" : "rgba(255,140,40,0.95)"; g.shadowBlur = 70;
      g.fillStyle = white ? "#4aa0ff" : "#ff8a2a"; g.fillRect(cx - s / 2, cy - s / 2, s, s); g.restore();
      clip(g, "ai_beard", t, cx - s / 2 + 6, cy - s / 2 + 6, s - 12, s - 12, { filter: white ? "hue-rotate(180deg) saturate(1.4)" : "sepia(0.6) saturate(1.6)" });
    }
    words(g, [["Most", C.most], ["people", C.most + 0.32]], cx - 250, cy - 120, t, { size: 44, color: white ? "#222" : "#eee" });
    words(g, [["ask", C.ask], ["AI", C.ai]], cx + 230, cy - 120, t, { size: 44, color: white ? "#222" : "#eee" });
    words(g, [["for", C.ai + 0.4], ["a", C.ai + 0.52], ["video,", C.video]], cx, cy + 150, t, { size: 44, color: white ? "#222" : "#eee" });
    // a warm light trail sweeping behind the tile
    trail(g, [[160, 1100], [300, 820], [820, 980], [700, 620], [620, 380], [900, 420], [980, 240]], t, 0.4, 1.3, white ? "90,150,255" : "255,170,80");
    vignette(g, white ? 0.15 : 0.7);
    return;
  }
  // curved drum of thumbnails: an arc above and below the line of text, turning
  voidBg(g, "#060607");
  const lt = t - C.then;
  const spin = -0.9 + lt * 0.55;
  const drum = (yC, dir, R, sat) => {
    const n = 12;
    const items = [];
    for (let i = 0; i < n; i++) {
      const a = ((i / n) * Math.PI * 2 + spin * dir) % (Math.PI * 2);
      const th = a > Math.PI ? a - Math.PI * 2 : a;
      if (Math.abs(th) > 1.25) continue;
      items.push({ i, th });
    }
    items.sort((a, b) => Math.abs(b.th) - Math.abs(a.th));
    for (const { i, th } of items) {
      const [nm, ss] = THUMBS[(i + (dir > 0 ? 0 : 7)) % THUMBS.length];
      const x = 540 + Math.sin(th) * R;
      const near = 1 + 0.55 * (1 - Math.cos(th));               // edges come closer (concave wall)
      const w = 250 * near, h = 300 * near;
      const yy = yC + dir * (1 - Math.cos(th)) * 230;            // arc curves away from the text
      g.save(); g.translate(x, yy);
      g.transform(Math.cos(th) * 0.92 + 0.08, dir * Math.sin(th) * 0.32, 0, 1, 0, 0);
      g.globalAlpha = clamp(1.6 - Math.abs(th));
      const fr = thumb(nm, ss + lt * 0.5);
      if (fr) { g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); g.filter = sat; K.drawFit(g, fr, -w / 2, -h / 2, w, h); g.restore(); }
      g.restore();
    }
  };
  const gen = win(C.generic - 0.1, C.generic + 0.4, t);
  drum(400, -1, 640, `saturate(${1 - 0.85 * gen}) brightness(${1 - 0.3 * gen})`);
  drum(1340, 1, 640, `saturate(${1 - 0.85 * gen}) brightness(${1 - 0.3 * gen})`);
  const fade = g.createLinearGradient(0, 0, 0, H);
  fade.addColorStop(0, "rgba(6,6,7,0.2)"); fade.addColorStop(0.4, "rgba(6,6,7,0.85)"); fade.addColorStop(0.6, "rgba(6,6,7,0.85)"); fade.addColorStop(1, "rgba(6,6,7,0.2)");
  g.fillStyle = fade; g.fillRect(0, 0, W, H);
  words(g, [["then", C.then], ["wonder", C.wonder], ["why", C.wonder + 0.32], ["it", C.wonder + 0.44], ["looks", C.wonder + 0.56]], 540, 820, t, { size: 46 });
  glowSerif(g, "generic.", 540, 935, 150, "#d8d8dc", "rgba(200,200,220,0.6)", t, C.generic);
  vignette(g, 0.8);
};

// 2 · fix: light studio floor, a tilted black prompt bar and an orange search button
function studio(g, t, at, text, typeAt, pressAt, o = {}) {
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#e9e9ea"); bg.addColorStop(0.55, "#d7d7d9"); bg.addColorStop(1, "#bcbcbf");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const spot = g.createRadialGradient(540, 700, 0, 540, 700, 900); spot.addColorStop(0, "rgba(255,255,255,0.75)"); spot.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spot; g.fillRect(0, 0, W, H);
  const p = spring(win(at, at + 0.9, t));
  const by = (o.y ?? 760) + (1 - p) * 120;
  const bw = o.w ?? 760, bh = o.h ?? 112;
  // contact shadow on the floor
  g.save(); g.filter = "blur(22px)"; g.fillStyle = "rgba(0,0,0,0.28)";
  g.beginPath(); g.ellipse(540 + 30, by + bh * 1.25, bw * 0.48, 26, 0, 0, 7); g.fill(); g.restore();
  g.save();
  g.translate(540, by); g.transform(1, -0.085, -0.12, 1, 0, 0); g.globalAlpha = clamp(p * 2);
  const gr = g.createLinearGradient(0, -bh / 2, 0, bh / 2); gr.addColorStop(0, "#2d2d30"); gr.addColorStop(1, "#111113");
  g.fillStyle = gr; g.fillRect(-bw / 2, -bh / 2, bw - bh * 1.15, bh);
  g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(-bw / 2, -bh / 2, bw - bh * 1.15, 3);
  // side thickness
  g.fillStyle = "#050506"; g.beginPath(); g.moveTo(-bw / 2, bh / 2); g.lineTo(bw / 2 - bh * 1.15, bh / 2); g.lineTo(bw / 2 - bh * 1.15 + 6, bh / 2 + 16); g.lineTo(-bw / 2 + 6, bh / 2 + 16); g.fill();
  // orange button
  const press = o.pressAt != null || pressAt != null ? Math.sin(Math.PI * win(pressAt, pressAt + 0.22, t)) : 0;
  const bx = bw / 2 - bh * 1.05;
  g.fillStyle = "#a8441a"; g.fillRect(bx, -bh / 2 + 16, bh * 1.05, bh);
  g.fillStyle = COL.orange; g.fillRect(bx, -bh / 2 + 10 * press, bh * 1.05, bh);
  g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.arc(bx + bh * 0.48, -6 + 10 * press, 18, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(bx + bh * 0.48 + 13, 7 + 10 * press); g.lineTo(bx + bh * 0.48 + 27, 21 + 10 * press); g.stroke();
  // typed text
  g.font = `300 ${o.fs || 40}px "${SANS}"`; if (g.letterSpacing !== undefined) g.letterSpacing = "1px";
  g.fillStyle = "#f1f1f1"; g.textBaseline = "middle"; g.textAlign = "left";
  const shown = K.typed(text, t, typeAt, o.cps || 26);
  g.fillText(shown, -bw / 2 + 34, 2);
  if (Math.floor(t * 2.6) % 2 === 0 && t > typeAt - 0.4) { const cw = g.measureText(shown).width; g.fillStyle = "#f1f1f1"; g.fillRect(-bw / 2 + 38 + cw, -bh * 0.22, 3, bh * 0.44); }
  g.restore();
  // 3d cursor glides to the button and clicks
  if (pressAt != null) {
    const c = inOutCubic(win(pressAt - 0.8, pressAt - 0.05, t));
    const bxw = 540 + (bw / 2 - bh * 0.55) - (-0.12) * 0, byw = by - 0.085 * (bw / 2 - bh * 0.55) + 6;
    cursor3d(g, lerp(820, bxw + 18, c), lerp(1160, byw + 22, c), 1.2, Math.sin(Math.PI * win(pressAt, pressAt + 0.22, t)));
    // click ripple
    const rp = win(pressAt, pressAt + 0.5, t);
    if (rp > 0 && rp < 1) { g.save(); g.strokeStyle = `rgba(236,106,44,${1 - rp})`; g.lineWidth = 4; g.beginPath(); g.arc(bxw + 4, byw, 20 + 90 * outCubic(rp), 0, 7); g.stroke(); g.restore(); }
  }
}
S.fix = (g, t) => {
  studio(g, t, C.s_fix + 0.05, "the prompt that fixes that", C.prompt - 0.2, C.fixes + 0.1, { cps: 30 });
  words(g, [["Here's", C.s_fix + 0.2], ["the", C.prompt - 0.2]], 540, 520, t, { size: 44, color: "#2a2a2c" });
  glowSerif(g, "prompt", 540, 610, 120, "#1b1b1e", "rgba(236,106,44,0.35)", t, C.prompt);
};

// 3 · goal: a dark AI chat, who's watching, and real people watching
function chatUI(g, t, x, y, w, h, msgs, o = {}) {
  g.save();
  K.rr(g, x, y, w, h, 26); g.fillStyle = "#121214"; g.fill();
  g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 2; g.stroke();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.font = `400 22px "${SANS}"`; g.textAlign = "center"; g.fillText(o.title || "New chat · vibe edit", x + w / 2, y + 40);
  let yy = y + 90;
  for (const m of msgs) {
    const p = outCubic(win(m.at, m.at + 0.3, t));
    if (p <= 0) continue;
    g.globalAlpha = p;
    g.font = `400 ${m.fs || 30}px "${SANS}"`; g.textAlign = "left"; g.textBaseline = "top";
    const txt = m.type ? K.typed(m.text, t, m.at, m.cps || 40) : m.text;
    const lines = K.wrap(g, txt || " ", w * 0.66);
    const lh = (m.fs || 30) * 1.35, bh = lines.length * lh + 34;
    const bw = Math.min(w * 0.74, Math.max(...lines.map((l) => g.measureText(l).width)) + 46);
    const bx = m.me ? x + w - bw - 26 : x + 26;
    K.rr(g, bx, yy + (1 - p) * 16, bw, bh, 22); g.fillStyle = m.me ? "#2b2b30" : "rgba(255,255,255,0.0)"; g.fill();
    if (m.label) { g.fillStyle = COL.gold; g.font = `600 20px "${SANS}"`; g.fillText(m.label, bx + 22, yy - 24); g.font = `400 ${m.fs || 30}px "${SANS}"`; }
    g.fillStyle = m.me ? "#ededf0" : "#bdbdc4";
    lines.forEach((l, i) => g.fillText(l, bx + 23, yy + 17 + i * lh + (1 - p) * 16));
    yy += bh + 40;
  }
  // input bar
  K.rr(g, x + 24, y + h - 92, w - 48, 66, 33); g.fillStyle = "#1d1d21"; g.fill();
  g.fillStyle = "rgba(255,255,255,0.3)"; g.font = `400 24px "${SANS}"`; g.textBaseline = "middle"; g.fillText("Describe your edit…", x + 56, y + h - 59);
  g.restore();
}
S.goal = (g, t) => {
  voidBg(g, "#08080a", { c: "rgba(232,169,58,0.10)", y: 520, r: 800 });
  const lt = t - C.s_goal;
  // camera: start wide on the chat, push in as the message types
  const z = lerp(0.92, 1.06, inOutCubic(win(C.s_goal, C.feel + 0.6, t)));
  g.save(); g.translate(540, 760); g.scale(z, z); g.translate(-540, -760);
  chatUI(g, t, 90, 320, 900, 640, [
    { me: true, at: C.goal - 0.05, text: "Goal: new editors. Make them feel: I can do this.", type: true, cps: 22, label: "01 · GOAL", fs: 34 },
    { me: false, at: C.watching + 0.35, text: "Got it. Beginner editors, calm and confident tone.", fs: 28 },
  ]);
  g.restore();
  goldTag(g, "goal", 300, 240, t, C.goal, { size: 40 });
  trail(g, [[120, 300], [200, 120], [420, 120], [560, 240], [700, 360], [900, 300], [980, 180]], t, C.goal - 0.1, 0.8);
  // real people watching, in phone brackets
  const pw = spring(win(C.who - 0.15, C.who + 0.7, t));
  if (pw > 0) {
    const fx = 540, fy = 1040 + (1 - pw) * 120, fw = 450, fh = 340;
    g.save(); g.globalAlpha = clamp(pw * 2);
    clip(g, "pr_watch", lt, fx, fy, fw, fh, { r: 14 });
    brackets(g, fx, fy, fw, fh, t, C.who, { len: 46 });
    g.restore();
  }
  words(g, [["Who's", C.who], ["watching,", C.watching]], 290, 1110, t, { size: 44 });
  glowSerif(g, "feel?", 290, 1250, 110, "#ffe2b0", "rgba(255,170,60,0.85)", t, C.feel);
  vignette(g, 0.7);
};

// 4 · format: a vertical frame in brackets, three gold specs
S.format = (g, t) => {
  voidBg(g, "#070708", { c: "rgba(120,140,255,0.10)", y: 760, r: 900 });
  const lt = t - C.s_format;
  crosshair(g, 540, 760, t, C.s_format, { color: "rgba(220,220,230,0.18)", dur: 0.6 });
  const fw = 430, fh = 764, fx = 540 - fw / 2, fy = 380;
  const p = spring(win(C.format - 0.2, C.format + 0.6, t));
  g.save(); g.translate(540, fy + fh / 2); g.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p); g.translate(-540, -(fy + fh / 2));
  g.globalAlpha = clamp(p * 2);
  clip(g, "ai_vertical", lt, fx, fy, fw, fh, { r: 18 });
  // burned-in captions inside the vertical frame ("captions on")
  const cp = win(C.captions, C.captions + 0.3, t);
  if (cp > 0) {
    g.font = `800 34px "Inter Var"`; g.textAlign = "center"; g.textBaseline = "middle";
    const wd = ["captions", "on"]; const k = t < C.captions + 0.45 ? 1 : 2;
    const s = wd.slice(0, k).join(" ");
    const tw = g.measureText(s).width + 30;
    g.globalAlpha = cp; g.fillStyle = "rgba(0,0,0,0.6)"; K.rr(g, 540 - tw / 2, fy + fh - 170, tw, 54, 10); g.fill();
    g.fillStyle = "#fff"; g.fillText(s, 540, fy + fh - 142);
  }
  g.restore();
  brackets(g, fx, fy, fw, fh, t, C.format, { len: 80 });
  words(g, [["Then", C.s_format + 0.15], ["the", C.format - 0.12]], 540, 250, t, { size: 40, alpha: 0.85 });
  glowSerif(g, "format.", 540, 318, 92, "#dfe6ff", "rgba(120,150,255,0.8)", t, C.format);
  goldTag(g, "9 : 16 vertical", 250, 560, t, C.vertical, { rot: -4 });
  // 0:45 rolling up
  const sec = Math.round(45 * outCubic(win(C.fortyfive, C.fortyfive + 0.5, t)));
  if (t > C.fortyfive - 0.05) goldTag(g, `0:${String(sec).padStart(2, "0")} seconds`, 830, 860, t, C.fortyfive, { rot: 3, w: 300 });
  goldTag(g, "captions on", 260, 1130, t, C.captions, { rot: -2 });
  trail(g, [[250, 600], [420, 700], [700, 760], [830, 830], [900, 980], [520, 1060], [260, 1100]], t, C.vertical + 0.1, 2.6);
  vignette(g, 0.75);
};

// 5 · vibe: "not make it cool" then four moods, each a full-bleed real clip
const MOODS = [
  { w: "calm,", at: "calm", clip: "cw_sky", glow: "rgba(110,170,255,0.95)", col: "#e8f1ff", filter: "saturate(0.8) brightness(0.75)" },
  { w: "fast,", at: "fast", clip: "pr_fast", glow: "rgba(255,120,40,0.95)", col: "#fff0e2", filter: "brightness(0.8)", speed: 2 },
  { w: "cinematic,", at: "cinematic", clip: "ai_studio", glow: "rgba(255,200,90,0.95)", col: "#fff4dc", filter: "brightness(0.65) contrast(1.15)" },
  { w: "playful.", at: "playful", clip: "pr_play", glow: "rgba(255,110,190,0.95)", col: "#ffe6f4", filter: "brightness(0.75) saturate(1.2)" },
];
S.vibe = (g, t) => {
  voidBg(g, "#08080a");
  const lt = t - C.s_vibe;
  if (t < C.calm - 0.1) {
    const dz = 1.08 + 0.06 * win(C.s_vibe, C.calm, t), gl = win(C.cool + 0.3, C.cool + 0.5, t) * (1 - win(C.cool + 0.5, C.cool + 0.7, t));
    g.save(); g.translate(540 + gl * 30, 960); g.scale(dz, dz); g.translate(-540, -960);
    clip(g, "hw_editscreen", lt, 0, 0, W, H, { filter: `blur(${5 - 3 * gl}px) saturate(${0.2 + gl}) brightness(0.32)` });
    g.restore();
    const shade = g.createLinearGradient(0, 0, 0, H); shade.addColorStop(0, "rgba(8,8,10,0.7)"); shade.addColorStop(0.5, "rgba(8,8,10,0.2)"); shade.addColorStop(1, "rgba(8,8,10,0.75)");
    g.fillStyle = shade; g.fillRect(0, 0, W, H);
    crosshair(g, 540, 820, t, C.s_vibe, { color: "rgba(220,220,230,0.25)" });
    trail(g, [[980, 300], [760, 420], [700, 520], [540, 560], [380, 600], [240, 760], [120, 900]], t, C.vibe - 0.1, 1.1, "190,140,255");
    glowSerif(g, "vibe.", 540, 640 - 20 * win(C.vibe, C.calm, t), 150, "#f2e9ff", "rgba(180,120,255,0.8)", t, C.vibe);
    words(g, [["Not", C.not], ["'make", C.not + 0.4], ["it", C.not + 0.64], ["cool.'", C.cool]], 540, 880, t, { size: 52 });
    // strike it out with a red light line
    const sp = outExpo(win(C.cool + 0.35, C.cool + 0.7, t));
    if (sp > 0) { g.save(); g.strokeStyle = "rgba(255,70,60,0.95)"; g.shadowColor = "rgba(255,60,40,0.9)"; g.shadowBlur = 16; g.lineWidth = 5; g.beginPath(); g.moveTo(330, 884); g.lineTo(330 + 420 * sp, 884); g.stroke(); g.restore(); }
    words(g, [["Say…", C.say]], 540, 1040, t, { size: 44, alpha: 0.8 });
    vignette(g, 0.7);
    return;
  }
  // which mood is on screen
  let k = 0; for (let i = 0; i < MOODS.length; i++) if (t >= C[MOODS[i].at] - 0.1) k = i;
  const m = MOODS[k], mt = t - (C[m.at] - 0.1);
  const z = 1.12 - 0.08 * outCubic(clamp(mt / 0.8));
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  clip(g, m.clip, lt, 0, 0, W, H, { filter: m.filter, speed: m.speed || 1 });
  g.restore();
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, W, H);
  // light leak over the cinematic beat
  if (k === 2) { g.save(); g.globalCompositeOperation = "screen"; clip(g, "pr_leaks", lt, 0, 0, W, H, { zoom: 1.2 }); g.restore(); }
  glowSerif(g, m.w, 540, 860, k === 2 ? 170 : 210, m.col, m.glow, t, C[m.at]);
  // small index of the four moods
  g.save(); g.font = `400 26px "${SANS}"`; g.textAlign = "center"; if (g.letterSpacing !== undefined) g.letterSpacing = "3px";
  MOODS.forEach((mm, i) => { g.globalAlpha = i === k ? 1 : 0.35; g.fillStyle = "#fff"; g.fillText(mm.w.replace(/[.,]/, "").toUpperCase(), 180 + i * 240, 1260); });
  g.restore();
  vignette(g, 0.6);
};

// 6 · references: a bright wall of real thumbnails, with the loved ones circled
S.refs = (g, t) => {
  g.fillStyle = "#e6e6e8"; g.fillRect(0, 0, W, H);
  const lt = t - C.s_refs;
  const cols = 5, cw = 250, ch = 300, gap = 24;
  const pan = lerp(-160, 120, inOutCubic(win(C.s_refs, C.them + 0.6, t)));
  const zoomIn = inOutCubic(win(C.what - 0.1, C.them + 0.2, t));
  const z = lerp(0.82, 1.35, zoomIn);
  g.save(); g.translate(540, 820); g.scale(z, z); g.translate(-lerp(540, 600, zoomIn), -lerp(820 - pan, 560, zoomIn));
  const picks = { 7: "this cut", 11: "these captions", 13: "that color" };
  const marks = [];
  for (let r = -1; r < 7; r++) for (let c = 0; c < cols; c++) {
    const i = ((r + 1) * cols + c);
    const [nm, ss] = THUMBS[(i * 7) % THUMBS.length];
    const x = 540 + (c - 2) * (cw + gap) - cw / 2 + (r % 2 ? 60 : 0), y = 120 + r * (ch + gap);
    const p = outQuint(win(C.s_refs + ((r + c) % 5) * 0.04, C.s_refs + 0.4 + ((r + c) % 5) * 0.04, t));
    g.save(); g.globalAlpha = p;
    g.shadowColor = "rgba(0,0,0,0.25)"; g.shadowBlur = 16; g.shadowOffsetY = 8; g.fillStyle = "#fff"; g.fillRect(x - 6, y - 6, cw + 12, ch + 12); K.noShadow(g);
    const fr = thumb(nm, ss + (picks[i] ? lt * 0.6 : 0));
    if (fr) { g.save(); g.beginPath(); g.rect(x, y, cw, ch); g.clip(); g.filter = picks[i] ? "none" : "saturate(0.45) brightness(0.92)"; K.drawFit(g, fr, x, y, cw, ch); g.restore(); }
    g.restore();
    if (picks[i]) marks.push([i, x, y]);
  }
  for (const [i, x, y] of marks) {       // circles and labels sit above every card
    const order = Object.keys(picks).indexOf(String(i));
    const at = C.name + 0.2 + order * 0.38;
    const cp = outCubic(win(at, at + 0.45, t));
    if (cp <= 0) continue;
    g.save(); g.strokeStyle = COL.orange; g.lineWidth = 7; g.lineCap = "round"; g.shadowColor = "rgba(236,106,44,0.5)"; g.shadowBlur = 12;
    g.beginPath(); g.ellipse(x + cw / 2, y + ch / 2, cw * 0.6, ch * 0.58, -0.08, -1.6, -1.6 + Math.PI * 2 * cp); g.stroke(); g.restore();
    goldTag(g, picks[i], x + cw / 2, y + ch + 20, t, at + 0.25, { size: 28 });
  }
  g.restore();
  // header
  g.save(); g.fillStyle = "rgba(230,230,232,0.92)"; g.fillRect(0, 0, W, 330); g.restore();
  words(g, [["Then", C.s_refs + 0.12]], 540, 170, t, { size: 40, color: "#333" });
  glowSerif(g, "references.", 540, 250, 104, "#1a1a1c", "rgba(236,106,44,0.25)", t, C.references);
  const band = g.createLinearGradient(0, 1300, 0, 1520); band.addColorStop(0, "rgba(230,230,232,0)"); band.addColorStop(0.35, "rgba(230,230,232,0.94)"); band.addColorStop(1, "rgba(230,230,232,0.98)");
  g.fillStyle = band; g.fillRect(0, 1300, W, 620);
  words(g, [["Name", C.name], ["the", C.name + 0.28], ["edits", C.name + 0.4], ["you", C.name + 0.72], ["love", C.love1]], 540, 1430, t, { size: 44, color: "#1c1c1e", weight: 400 });
};

// 7 · rules: green spotlight reveal of a real camera, then god rays on the logo card
S.rules = (g, t) => {
  const lt = t - C.s_rules;
  if (t < C.end - 0.12) {
    voidBg(g, "#071009", { c: "rgba(70,170,90,0.55)", y: 820, r: 760 });
    // floor
    const fl = g.createLinearGradient(0, 1080, 0, H); fl.addColorStop(0, "rgba(40,110,55,0)"); fl.addColorStop(0.12, "rgba(40,110,55,0.55)"); fl.addColorStop(1, "rgba(0,0,0,0.9)");
    g.fillStyle = fl; g.fillRect(0, 1080, W, H - 1080);
    const cam = K.object("hw_camera");
    const dp = win(C.s_rules + 0.2, C.s_rules + 0.85, t), bounce = spring(win(C.s_rules + 0.6, C.s_rules + 1.5, t));
    if (cam) {
      const w = 640, h = w * cam.height / cam.width;
      const y = lerp(-500, 950, outCubic(dp)) - (1 - bounce) * 30 * (dp >= 1 ? 1 : 0);
      g.save(); g.filter = "blur(20px)"; g.fillStyle = `rgba(0,0,0,${0.55 * dp})`; g.beginPath(); g.ellipse(540, 1160, 300 * dp, 34, 0, 0, 7); g.fill(); g.restore();
      g.save(); g.translate(540, y); g.rotate((1 - dp) * -0.4 + 0.04 * Math.sin(lt * 1.5));
      g.filter = "brightness(1.05) contrast(1.05)";
      g.drawImage(cam, -w / 2, -h / 2, w, h);
      g.filter = "none";
      g.restore();
    }
    words(g, [["And", C.s_rules + 0.1], ["last,", C.last]], 540, 300, t, { size: 42 });
    glowSerif(g, "the rules.", 540, 400, 120, "#eaffef", "rgba(90,220,120,0.85)", t, C.rules);
    goldTag(g, "real footage only", 540, 1300, t, C.only, { size: 40 });
    vignette(g, 0.65);
    return;
  }
  // logo card rising on orange god rays
  voidBg(g, "#120603", { c: "rgba(255,110,40,0.55)", y: 1180, r: 900 });
  const rp = win(C.end - 0.12, C.end + 0.9, t);
  g.save(); g.translate(540, 1500); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.2 + 0.03 * Math.sin(t * 0.8 + i);
    const len = 1700 * outCubic(rp);
    const gr = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
    gr.addColorStop(0, "rgba(255,150,70,0.55)"); gr.addColorStop(1, "rgba(255,120,40,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-16, 0); g.lineTo(Math.cos(a - 0.05) * len, Math.sin(a - 0.05) * len); g.lineTo(Math.cos(a + 0.05) * len, Math.sin(a + 0.05) * len); g.lineTo(16, 0); g.fill();
  }
  g.restore();
  const up = spring(win(C.end, C.end + 1.0, t));
  g.save(); g.translate(540, lerp(1350, 820, up)); g.rotate(-0.12 + 0.04 * Math.sin(lt)); g.transform(1, 0, -0.08, 1, 0, 0);
  g.shadowColor = "rgba(255,120,40,0.6)"; g.shadowBlur = 60;
  g.fillStyle = "#121214"; K.rr(g, -260, -330, 520, 660, 18); g.fill(); K.noShadow(g);
  g.strokeStyle = "rgba(255,255,255,0.1)"; g.lineWidth = 2; g.stroke();
  // the wordmark (drawn): a play glyph + "vibe editing"
  g.fillStyle = COL.orange; g.beginPath(); g.moveTo(-40, -150); g.lineTo(60, -90); g.lineTo(-40, -30); g.closePath(); g.fill();
  g.font = `italic 400 110px "${SERIF}"`; g.textAlign = "center"; g.fillStyle = "#f4efe8"; g.fillText("vibe", 0, 90);
  g.font = `300 44px "${SANS}"`; if (g.letterSpacing !== undefined) g.letterSpacing = "8px"; g.fillText("EDITING", 8, 170);
  g.restore();
  words(g, [["End", C.end], ["on", C.end + 0.32], ["the", C.end + 0.48]], 540, 300, t, { size: 44 });
  glowSerif(g, "logo.", 540, 400, 130, "#fff1e4", "rgba(255,120,40,0.9)", t, C.logo);
  vignette(g, 0.6);
};

// 8 · outro: five gold tags on a light trail, "stops guessing", then the prompt bar again
const FIVE = [["goal", "o_goal", 330, 520], ["format", "o_format", 720, 640], ["vibe", "o_vibe", 360, 760], ["references", "o_refs", 700, 880], ["rules", "o_rules", 380, 1000]];
S.outro = (g, t) => {
  voidBg(g, "#08080a", { c: "rgba(232,169,58,0.10)", y: 760, r: 800 });
  trail(g, [[120, 380], [300, 470], [520, 470], [640, 560], [800, 660], [600, 700], [420, 760], [300, 820], [560, 870], [760, 880], [880, 960], [600, 1000], [380, 1060]], t, C.o_goal - 0.2, 3.4);
  FIVE.forEach(([s, cue, x, y], i) => {
    goldTag(g, `0${i + 1}  ${s}`, x, y, t, C[cue], { size: 38, rot: i % 2 ? 3 : -3 });
  });
  words(g, [["Five", C.five], ["lines,", C.five + 0.32], ["and", C.five + 0.8], ["the", C.five + 0.92], ["AI", C.stops - 0.4]], 540, 1180, t, { size: 46 });
  glowSerif(g, "stops guessing.", 540, 1290, 118, "#e4ecff", "rgba(110,150,255,0.95)", t, C.stops);
  vignette(g, 0.7);
};
S.final = (g, t) => {
  const zz = 1 + 0.06 * inOutCubic(win(C.s_final, C.end, t));
  g.save(); g.translate(540, 820); g.scale(zz, zz); g.translate(-540, -820);
  studio(g, t, C.s_final, "goal · format · vibe · references · rules", C.s_final + 0.1, C.follow + 0.9, { cps: 48, fs: 30, w: 900, y: 820 });
  words(g, [["Follow", C.follow], ["for", C.follow + 0.32], ["more", C.follow + 0.48]], 540, 560, t, { size: 46, color: "#2a2a2c" });
  glowSerif(g, "vibe editing", 540, 655, 120, "#1b1b1e", "rgba(236,106,44,0.35)", t, C.follow + 0.72);
  g.restore();
  const pu = win(C.follow + 0.95, C.follow + 1.6, t);
  if (pu > 0 && pu < 1) { const r = g.createRadialGradient(900, 800, 0, 900, 800, 700 * pu); r.addColorStop(0, `rgba(236,106,44,${0.35 * (1 - pu)})`); r.addColorStop(1, "rgba(236,106,44,0)"); g.fillStyle = r; g.fillRect(0, 0, W, H); }
};

// ---------------------------------------------------------------- cuts --
// [start cue, scene, transition into it]
const CUTS = [
  [0, "hook", null],
  [C.s_fix, "fix", "flash"],
  [C.s_goal, "goal", "whip"],
  [C.s_format, "format", "zoom"],
  [C.s_vibe, "vibe", "whipUp"],
  [C.s_refs, "refs", "flash"],
  [C.s_rules, "rules", "zoom"],
  [C.end - 0.12, "rules", "flash"],          // camera → logo (inside the same scene)
  [C.s_outro, "outro", "whip"],
  [C.s_final, "final", "flash"],
];
// internal beats that also get a quick flash/strobe
const STROBE = [C.calm - 0.1, C.fast - 0.1, C.cinematic - 0.1, C.playful - 0.1];
const TD = 0.36;

function sceneAt(t) { let k = 0; for (let i = 0; i < CUTS.length; i++) if (t >= CUTS[i][0]) k = i; return k; }

function frame(g, t) {
  const k = sceneAt(t);
  const [t0, name, kind] = CUTS[k];
  let moving = false, speed = 0;
  // transition window straddles the cut: [t0 - TD/2, t0 + TD/2]
  const nk = k + 1 < CUTS.length ? k + 1 : null;
  const into = k > 0 && kind && t < t0 + TD / 2;
  const outof = nk != null && t > CUTS[nk][0] - TD / 2 && CUTS[nk][2];
  if (into || outof) {
    const cut = into ? k : nk;
    const ct = CUTS[cut][0], p = clamp((t - (ct - TD / 2)) / TD);
    const A = CUTS[cut - 1][1], B = CUTS[cut][1], kind2 = CUTS[cut][2];
    LA.g.setTransform(1, 0, 0, 1, 0, 0); LB.g.setTransform(1, 0, 0, 1, 0, 0);
    S[A](LA.g, Math.min(t, ct - 0.001)); S[B](LB.g, Math.max(t, ct));
    const e = inOutCubic(p);
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    if (kind2 === "whip" || kind2 === "whipUp") {
      const dx = kind2 === "whip" ? W : 0, dy = kind2 === "whipUp" ? H : 0;
      g.drawImage(LA.c, -dx * e, -dy * e); g.drawImage(LB.c, dx * (1 - e), dy * (1 - e));
      moving = true; speed = Math.sin(Math.PI * p);
    } else if (kind2 === "zoom") {
      g.save(); g.globalAlpha = 1 - e; g.translate(540, 960); g.scale(1 + 0.6 * e, 1 + 0.6 * e); g.drawImage(LA.c, -540, -960); g.restore();
      g.save(); g.globalAlpha = e; g.translate(540, 960); g.scale(0.75 + 0.25 * e, 0.75 + 0.25 * e); g.drawImage(LB.c, -540, -960); g.restore();
      moving = true; speed = Math.sin(Math.PI * p) * 0.8;
    } else { // flash
      g.drawImage(p < 0.5 ? LA.c : LB.c, 0, 0);
      g.fillStyle = `rgba(255,255,255,${Math.sin(Math.PI * p) * 0.95})`; g.fillRect(0, 0, W, H);
    }
  } else {
    S[name](g, t);
  }
  // quick strobe on the mood beats
  for (const s of STROBE) { const q = win(s, s + 0.16, t); if (q > 0 && q < 1) { g.fillStyle = `rgba(255,255,255,${(1 - q) * 0.7})`; g.fillRect(0, 0, W, H); } }
  // minimal lower captions: small and quiet, dark on the light scenes
  const light = name === "fix" || name === "refs" || name === "final";
  K.captions(g, t, { y: 1560, size: 32, weight: 400, family: SANS, color: light ? "rgba(30,30,32,0.85)" : "rgba(255,255,255,0.78)", hiText: light ? "#000" : "#fff", maxW: 860 });
  K.grain(g, t, 0.07);
  return { moving, speed };
}

K.run(frame, ['300 40px "Inter Var"', '500 40px "Inter Var"', '800 40px "Inter Var"', 'italic 400 40px "Instrument Serif"']);
})();

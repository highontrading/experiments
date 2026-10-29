// How vibe editing is changing the world — garden glass design.
// A real meadow under a moving sky; frosted-glass UI floats on it. One glass bar morphs
// through the film (browser bar -> prompt bar -> browser bar -> prompt bar), and four
// pastel cards slide, swap and gather into a grid before we zoom through the last one.
(function () {
const { C, W, H, win, lerp, clamp, outCubic, outQuint, inCubic, inOutQuint, inOutCubic, spring, rr, font } = K;

// ------------------------------------------------------------------ palette --
const CARD = {
  taupe: ["#a2987f", "#d8cfbb"], pink: ["#a8527a", "#eab1cd"], sage: ["#7a9750", "#d3e89e"],
  mauve: ["#82778e", "#cdbfce"], blue: ["#6f8fbb", "#c3d7ef"],
};
const CREAM = "#e8e0d5", INK = "#1d1d1f", PINK_BUBBLE = "#efc3da";

// ------------------------------------------------------------------ tracks --
// track = [rect0, [t0, t1, rect1], [t2, t3, rect2], ...]: hold, then glide to the next rect
function track(tr, t) {
  let r = tr[0];
  for (let i = 1; i < tr.length; i++) {
    const [a, b, nr] = tr[i];
    if (t <= a) break;
    const p = inOutQuint(win(a, b, t));
    r = r.map((v, j) => lerp(v, nr[j], p));
  }
  return r;
}
const GLIDES = [];  // windows of big moves -> motion blur
const glide = (a, b) => { GLIDES.push([a, b]); return [a, b]; };

const TR = 0.85;   // layout change length (s)
const [n0, n1] = glide(C.s_now - 0.05, C.s_now - 0.05 + TR);
const [te0, te1] = glide(C.s_teacher, C.s_teacher + TR);
const [sh0, sh1] = glide(C.s_shop, C.s_shop + TR);
const [cr0, cr1] = glide(C.s_creator, C.s_creator + TR);
const [wy0, wy1] = glide(C.s_why, C.s_why + 1.0);
const [ou0, ou1] = glide(C.s_outro, C.s_outro + 1.15);

// the one glass bar: browser bar in the window -> prompt bar -> browser bar -> panel bar -> prompt bar
const BAR = [
  [110, 236, 860, 96],
  [n0, n1, [90, 900, 900, 150]],
  [te0, te1, [90, 226, 900, 96]],
  [wy0, wy1, [104, 236, 872, 96]],
  [ou0 + 0.25, ou1 + 0.2, [100, 1190, 880, 140]],
];
const PANEL = [[70, 200, 940, 1190], [n0, n1, [90, 900, 900, 150]]];
// cards (x, y, w, h)
const BIG = [90, 372, 900, 1000];
const CELL = [[100, 372, 420, 486], [560, 372, 420, 486], [100, 898, 420, 486], [560, 898, 420, 486]];
const TEACH = [[90, 330, 900, 0], [te0 + 0.15, te1 + 0.1, BIG], [sh0, sh1, [-1000, 372, 900, 1000]], [wy0, wy1, CELL[0]]];
const SHOP = [[1100, 372, 900, 1000], [sh0, sh1, BIG], [cr0, cr1, [90, -1150, 900, 1000]], [wy0 + 0.08, wy1 + 0.08, CELL[1]]];
const CREAT = [[90, 1950, 900, 1000], [cr0, cr1, BIG], [wy0 + 0.04, wy1 + 0.04, CELL[2]]];
const YOU = [[CELL[3][0] + 210, CELL[3][1] + 243, 0, 0], [wy0 + 0.2, wy1 + 0.2, CELL[3]]];

// ------------------------------------------------------------------ background --
const BG = K.makeCanvas(W, H), bg = BG.getContext("2d");
const BLUR = K.makeCanvas(270, 480), bl = BLUR.getContext("2d");
function footFrame(name, lt, speed) {  // blended frames for smooth slow motion
  const n = K.A.footage[name], f = Math.max(0, lt) * 30 * speed;
  const i = Math.min(n - 1, Math.floor(f)), j = Math.min(n - 1, i + 1);
  return [K.footage(name, i / 30), K.footage(name, j / 30), f - Math.floor(f)];
}
function drawBg(t) {
  const out = outCubic(win(C.s_outro - 0.1, C.s_outro + 1.6, t));
  const zoom = 1.0 + 0.05 * (t / C.end);
  const layer = (name, speed, dy, alpha) => {
    const [a, b, fr] = footFrame(name, t, speed);
    if (!a) return;
    const sc = Math.max(W / a.width, H / a.height) * zoom;
    const dw = a.width * sc, dh = a.height * sc, x = (W - dw) / 2, y = (H - dh) / 2 + dy;
    bg.globalAlpha = alpha; bg.drawImage(a, x, y, dw, dh);
    if (b && fr > 0.02) { bg.globalAlpha = alpha * fr; bg.drawImage(b, x, y, dw, dh); }
    bg.globalAlpha = 1;
  };
  // the meadow drifts up a touch as we move on; the outro tilts to the sky
  layer("cw_meadow", 0.49, -40 * (t / C.end), 1);
  if (out > 0) layer("cw_sky", 0.5, 60 * (1 - out), out);
  // soft warm light from the top
  const gr = bg.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "rgba(255,255,255,0.10)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(20,40,10,0.18)");
  bg.fillStyle = gr; bg.fillRect(0, 0, W, H);
  bl.filter = "blur(5px)"; bl.drawImage(BG, -10, -10, 290, 500); bl.filter = "none";
}

// ------------------------------------------------------------------ glass --
// frosted glass: blurred background clipped to the shape (screen space), plus a milky tint
function glass(g, x, y, w, h, r, o = {}) {
  const a = o.alpha ?? 1;
  if (a <= 0 || w < 2 || h < 2) return;
  g.save();
  g.globalAlpha *= a;
  K.shadow(g, 40, 18, 0.18 * (o.shadow ?? 1), "20,40,60");
  rr(g, x, y, w, h, r); g.fillStyle = "rgba(255,255,255,0.05)"; g.fill();
  K.noShadow(g);
  g.save(); rr(g, x, y, w, h, r); g.clip();
  const m = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(BLUR, 0, 0, W, H); g.setTransform(m);
  g.fillStyle = `rgba(255,255,255,${o.tint ?? 0.2})`; g.fillRect(x, y, w, h);
  const hl = g.createLinearGradient(0, y, 0, y + Math.min(h, 220));
  hl.addColorStop(0, "rgba(255,255,255,0.22)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = hl; g.fillRect(x, y, w, h);
  g.restore();
  rr(g, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); g.lineWidth = 1.5; g.strokeStyle = "rgba(255,255,255,0.6)"; g.stroke();
  g.restore();
}

// the morphing bar: browser icons when slim, a prompt field when tall
function bar(g, t) {
  const [x, y, w, h] = track(BAR, t);
  const appear = outCubic(win(0.15, 0.8, t));
  if (appear <= 0) return;
  const r = h / 2;
  glass(g, x, y, w, h, r, { alpha: appear, tint: 0.24 });
  const prompt = clamp((h - 100) / 40);           // 0 = browser, 1 = prompt
  g.save(); g.globalAlpha = appear;
  rr(g, x, y, w, h, r); g.clip();
  const cy = y + h / 2;
  // browser furniture
  if (prompt < 1) {
    g.globalAlpha = appear * (1 - prompt);
    const ic = (cx, draw) => { g.fillStyle = "rgba(255,255,255,0.42)"; g.beginPath(); g.arc(cx, cy, 25, 0, 7); g.fill(); g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 3.4; g.lineCap = g.lineJoin = "round"; g.beginPath(); draw(cx); g.stroke(); };
    ic(x + 52, (cx) => { g.moveTo(cx + 5, cy - 9); g.lineTo(cx - 4, cy); g.lineTo(cx + 5, cy + 9); });
    ic(x + 114, (cx) => { g.moveTo(cx - 5, cy - 9); g.lineTo(cx + 4, cy); g.lineTo(cx - 5, cy + 9); });
    // url field
    const ux = x + 158, uw = w - 300;
    g.fillStyle = "rgba(255,255,255,0.22)"; rr(g, ux, cy - 30, uw, 60, 30); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 3; g.beginPath();   // home
    g.moveTo(ux + 26, cy + 1); g.lineTo(ux + 40, cy - 12); g.lineTo(ux + 54, cy + 1); g.moveTo(ux + 30, cy - 2); g.lineTo(ux + 30, cy + 12); g.lineTo(ux + 50, cy + 12); g.lineTo(ux + 50, cy - 2); g.stroke();
    font(g, 34, 600, "Nunito"); g.fillStyle = "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
    g.fillText(url(t), ux + 74, cy + 1);
    // reload + plus
    const rx = x + w - 112; g.beginPath(); g.arc(rx, cy, 13, -1.2, 4.2); g.stroke();
    g.beginPath(); g.moveTo(rx + 13 * Math.cos(-1.2) + 6, cy + 13 * Math.sin(-1.2) - 6); g.lineTo(rx + 13 * Math.cos(-1.2), cy + 13 * Math.sin(-1.2)); g.lineTo(rx + 13 * Math.cos(-1.2) - 8, cy + 13 * Math.sin(-1.2) - 1); g.stroke();
    const px = x + w - 48; g.beginPath(); g.moveTo(px - 15, cy); g.lineTo(px + 15, cy); g.moveTo(px, cy - 15); g.lineTo(px, cy + 15); g.stroke();
  }
  // prompt field
  if (prompt > 0) {
    g.globalAlpha = appear * prompt;
    spark(g, x + 62, cy, 20, t);
    const txt = promptText(t);
    font(g, 40, 600, "Nunito"); g.fillStyle = "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
    g.shadowColor = "rgba(30,50,80,0.25)"; g.shadowBlur = 8;
    g.fillText(txt.s, x + 104, cy + 2);
    const cw = g.measureText(txt.s).width; K.noShadow(g);
    if (txt.caret && Math.floor(t * 2.2) % 2 === 0) g.fillRect(x + 108 + cw, cy - 22, 3.5, 46);
    if (!txt.s && txt.ph) { g.globalAlpha *= 0.6; g.fillText(txt.ph, x + 104, cy + 2); }
    // send button
    const sx = x + w - 70, press = Math.sin(Math.PI * win(C.time + 0.55, C.time + 0.85, t));
    g.globalAlpha = appear * prompt;
    g.fillStyle = press > 0 ? "#efc3da" : "#fff"; g.beginPath(); g.arc(sx, cy, 40 * (1 - 0.12 * press), 0, 7); g.fill();
    g.strokeStyle = INK; g.lineWidth = 4.2; g.lineCap = g.lineJoin = "round";
    g.beginPath(); g.moveTo(sx, cy + 16); g.lineTo(sx, cy - 15); g.moveTo(sx - 13, cy - 3); g.lineTo(sx, cy - 16); g.lineTo(sx + 13, cy - 3); g.stroke();
  }
  g.restore();
}
function url(t) {
  if (t < te0 + 0.3) return "vibeediting.page/before";
  if (t < sh0 + 0.4) return "vibeediting.page/teacher";
  if (t < cr0 + 0.4) return "vibeediting.page/shop";
  if (t < wy0 + 0.5) return "vibeediting.page/creator";
  return "vibeediting.page";
}
function promptText(t) {
  if (t < C.s_outro) {
    const s = "a short video for tomorrow's lesson";
    return { s: K.typed(s, t, C.idea - 0.2, 24), caret: t > n1 - 0.2, ph: "" };
  }
  const s = "one sentence at a time.";
  return { s: K.typed(s, t, C.sentence - 0.15, 20), caret: true, ph: "" };
}
function spark(g, x, y, r, t) {  // four-point sparkle
  g.save(); g.translate(x, y); g.rotate(0.15 * Math.sin(t * 1.4)); g.fillStyle = "#fff";
  g.beginPath();
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.quadraticCurveTo(Math.cos(a - Math.PI / 4) * r * 0.18, Math.sin(a - Math.PI / 4) * r * 0.18, Math.cos(a) * r, Math.sin(a) * r); }
  g.quadraticCurveTo(Math.cos(-Math.PI / 4) * r * 0.18, Math.sin(-Math.PI / 4) * r * 0.18, r, 0);
  g.fill(); g.restore();
}

// ------------------------------------------------------------------ cards --
// a pastel card: gradient body with a scooped corner holding the number, bookmark, label
function card(g, x, y, w, h, o, t) {
  if (w < 4 || h < 4) return;
  const s = w / 900, r = 46 * Math.max(0.55, s), R = Math.max(36, 66 * s);
  const ncx = x + w - R - 14 * s, ncy = y + h - R - 14 * s;
  g.save();
  g.globalAlpha *= o.alpha ?? 1;
  // body, minus the notch (clip everything except the notch circle)
  g.save();
  g.beginPath(); g.rect(x - 200, y - 200, w + 400, h + 400); g.arc(ncx, ncy, R + 16 * Math.max(0.6, s), 0, Math.PI * 2, true); g.clip("evenodd");
  K.shadow(g, 40, 22, 0.22, "30,40,60");
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, o.col[0]); gr.addColorStop(1, o.col[1]);
  rr(g, x, y, w, h, r); g.fillStyle = gr; g.fill(); K.noShadow(g);
  rr(g, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.5; g.stroke();
  // inset media
  if (o.media) {
    const mx = x + 34 * s, my = y + 34 * s, mw = w - 68 * s, mh = o.mh ? o.mh * h : h * 0.56;
    g.save(); rr(g, mx, my, mw, mh, 30 * Math.max(0.6, s)); g.clip();
    o.media(g, mx, my, mw, mh, t);
    g.restore();
  }
  g.restore();
  // number
  K.shadow(g, 14, 6, 0.15, "30,40,60");
  g.fillStyle = CREAM; g.beginPath(); g.arc(ncx, ncy, R, 0, 7); g.fill(); K.noShadow(g);
  font(g, R * 0.95, 500, "Nunito"); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(String(o.num), ncx, ncy + R * 0.04);
  // bookmark badge
  const bx = x + w - 56 * Math.max(0.6, s), by = y + 56 * Math.max(0.6, s), br = 26 * Math.max(0.65, s);
  g.fillStyle = "#1b1b1d"; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill();
  const fill = o.saved ?? 0;
  g.strokeStyle = "#fff"; g.lineWidth = 2.6 * Math.max(0.7, s); g.lineJoin = "round";
  g.beginPath(); g.moveTo(bx - br * 0.32, by - br * 0.42); g.lineTo(bx + br * 0.32, by - br * 0.42); g.lineTo(bx + br * 0.32, by + br * 0.45); g.lineTo(bx, by + br * 0.18); g.lineTo(bx - br * 0.32, by + br * 0.45); g.closePath();
  if (fill > 0) { g.fillStyle = `rgba(255,255,255,${fill})`; g.fill(); }
  g.stroke();
  // label: light italic "The" over a bold word
  const ls = Math.max(0.5, s);
  g.fillStyle = "#fff"; g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.shadowColor = "rgba(40,30,50,0.25)"; g.shadowBlur = 10 * ls;
  font(g, 64 * ls, 300, "Nunito"); g.font = "italic " + g.font;
  g.fillText(o.the, x + 40 * s, y + h - 118 * ls);
  font(g, 84 * ls, 800, "Nunito");
  g.fillText(o.word, x + 40 * s, y + h - 42 * ls);
  K.noShadow(g);
  g.restore();
}
const clip = (name, ss = 0, speed = 1, fx = 0.5, fy = 0.5) => (g, x, y, w, h, t) => K.drawFit(g, K.footage(name, t - ss, speed, true), x, y, w, h, { fx, fy });

// chat bubble (iMessage-like): white or pink pill, tail on its side
function bubble(g, x, y, text, t, at, o = {}) {
  const p = spring(win(at, at + 0.7, t)) * (o.out != null ? 1 - inCubic(win(o.out, o.out + 0.3, t)) : 1);
  if (p <= 0) return;
  const fs = o.fs || 40;
  font(g, fs, 500, "Inter");
  const tw = g.measureText(text).width, w = tw + fs * 1.3, h = fs * 1.85;
  const right = o.side === "r";
  g.save();
  g.translate(x, y); g.scale(p, p);
  g.globalAlpha *= clamp(p * 2);
  const bx = right ? -w : 0;
  K.shadow(g, 18, 8, 0.18, "40,30,60");
  g.fillStyle = o.pink ? PINK_BUBBLE : "#fff";
  rr(g, bx, -h / 2, w, h, h / 2); g.fill();
  g.beginPath();   // tail
  if (right) { g.moveTo(-26, h / 2 - 22); g.quadraticCurveTo(-4, h / 2 + 2, 6, h / 2 + 4); g.quadraticCurveTo(-18, h / 2 + 2, -34, h / 2 - 6); }
  else { g.moveTo(26, h / 2 - 22); g.quadraticCurveTo(4, h / 2 + 2, -6, h / 2 + 4); g.quadraticCurveTo(18, h / 2 + 2, 34, h / 2 - 6); }
  g.fill(); K.noShadow(g);
  g.fillStyle = o.pink ? "#3b2733" : "#1c1c1e"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(text, bx + fs * 0.65, 1);
  g.restore();
}

// real cut-out object popping out of a card
function obj(g, key, x, y, w, rot, t, at, o = {}) {
  const p = spring(win(at, at + 0.85, t)) * (o.out != null ? 1 - inCubic(win(o.out, o.out + 0.35, t)) : 1);
  if (p <= 0) return;
  const im = K.object(key); if (!im) return;
  const h = w * im.height / im.width, bob = Math.sin(t * 1.3 + x * 0.01) * 4;
  g.save(); g.translate(x, y + bob + 60 * (1 - p)); g.rotate((rot + (1 - p) * (o.spin ?? 10)) * Math.PI / 180); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  g.globalAlpha *= clamp(p * 2);
  g.shadowColor = "rgba(25,35,25,0.35)"; g.shadowBlur = 34; g.shadowOffsetY = 22;
  g.drawImage(im, -w / 2, -h / 2, w, h);
  K.noShadow(g);
  if (o.screen && K.A.objects[key].screen) {   // paint the device's screen
    const S = K.A.objects[key].screen, L = S.len * w * 0.985, Wd = S.wid * w * 0.97;
    g.translate(-w / 2 + S.cx * w, -h / 2 + S.cy * w);
    g.rotate(S.ang * Math.PI / 180 + Math.PI / 2 + (o.flip ? Math.PI : 0));
    g.save(); rr(g, -Wd / 2, -L / 2, Wd, L, Wd * (o.sr ?? 0.12)); g.clip();
    o.screen(g, Wd, L, t);
    const gl = g.createLinearGradient(-Wd / 2, -L / 2, Wd / 2, L / 2);
    gl.addColorStop(0, "rgba(255,255,255,0.18)"); gl.addColorStop(0.45, "rgba(255,255,255,0.03)"); gl.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gl; g.fillRect(-Wd / 2, -L / 2, Wd, L);
    g.restore();
  }
  g.restore();
}

function label(g, text, x, y, size, t, at, o = {}) {  // big white Nunito line
  const p = outQuint(win(at, at + 0.7, t)) * (o.out != null ? 1 - inCubic(win(o.out, o.out + 0.35, t)) : 1);
  if (p <= 0) return;
  g.save(); g.globalAlpha *= p;
  font(g, size, o.weight ?? 800, "Nunito"); if (o.italic) g.font = "italic " + g.font;
  g.textAlign = o.align || "center"; g.textBaseline = "middle"; g.fillStyle = o.color || "#fff";
  if (!o.soft) { g.shadowColor = "rgba(30,50,80,0.35)"; g.shadowBlur = 18; g.shadowOffsetY = 4; }
  g.fillText(text, x, y + 30 * (1 - p));
  g.restore();
}
function chip(g, text, x, y, t, at, o = {}) {   // small glass chip
  const p = spring(win(at, at + 0.7, t)) * (o.out != null ? 1 - inCubic(win(o.out, o.out + 0.3, t)) : 1);
  if (p <= 0) return;
  font(g, o.fs || 36, 700, o.fam || "Nunito");
  const tw = g.measureText(text).width, w = tw + 56, h = (o.fs || 36) * 1.75;
  g.save(); g.translate(x, y); g.scale(p, p);
  if (o.solid) { K.shadow(g, 16, 6, 0.18, "40,30,60"); g.fillStyle = o.pink ? PINK_BUBBLE : "#fff"; rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill(); K.noShadow(g); }
  else glass(g, -w / 2, -h / 2, w, h, h / 2, { tint: o.tint ?? 0.3, shadow: 0.6 });
  g.fillStyle = o.solid ? (o.pink ? "#3b2733" : INK) : (o.color || "#fff"); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, 2);
  if (o.strike) {
    const sp = outCubic(win(o.strike, o.strike + 0.35, t));
    g.strokeStyle = o.solid ? INK : "#fff"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); g.moveTo(-tw / 2 - 4, 2); g.lineTo(-tw / 2 - 4 + (tw + 8) * sp, 2); g.stroke();
  }
  g.restore();
}

// ------------------------------------------------------------------ scenes --
function sceneBefore(g, t) {
  // the big glass window of "before"
  const [x, y, w, h] = track(PANEL, t);
  const a = outCubic(win(0.1, 0.8, t)) * (1 - win(n0 + 0.35, n1 - 0.05, t));
  if (a <= 0) return;
  glass(g, x, y, w, h, lerp(56, 75, win(n0, n1, t)), { alpha: a, tint: 0.16 });
  if (t > n1) return;
  const out = win(n0 - 0.4, n0 + 0.1, t);          // contents lift away before the bar morphs
  g.save(); g.globalAlpha = 1 - out; g.translate(0, -120 * inCubic(out));
  label(g, "not long ago,", 540, 430, 58, t, 0.9, { weight: 400, italic: true, color: INK, soft: true });
  label(g, "a good video needed…", 540, 515, 62, t, 1.4, { weight: 800, color: INK, soft: true });
  const c1 = spring(win(C.studio - 0.45, C.studio + 0.55, t)), c2 = spring(win(C.software - 0.45, C.software + 0.55, t));
  if (c1 > 0) { g.save(); g.globalAlpha *= clamp(c1 * 2); g.translate(0, 70 * (1 - c1));
    card(g, 110, 600, 420, 520, { col: CARD.taupe, num: 1, the: "The", word: "studio", media: clip("cw_studio", C.studio - 0.45), mh: 0.52 }, t); g.restore(); }
  if (c2 > 0) { g.save(); g.globalAlpha *= clamp(c2 * 2); g.translate(0, 70 * (1 - c2));
    card(g, 550, 600, 420, 520, { col: CARD.mauve, num: 2, the: "The", word: "software", media: clip("cw_software", C.software - 0.45), mh: 0.52 }, t); g.restore(); }
  bubble(g, 120, 1205, "how long to learn all that?", t, C.years - 0.55, { fs: 34 });
  bubble(g, 965, 1300, "years of practice…", t, C.practice - 0.05, { side: "r", pink: true, fs: 34 });
  obj(g, "clock", 905, 545, 150, 10, t, C.years + 0.05);
  g.restore();
}

function sceneNow(g, t) {
  if (t < n0 || t > te1) return;
  const out = win(te0 - 0.35, te0 + 0.05, t);
  g.save(); g.globalAlpha = 1 - out; g.translate(0, -80 * inCubic(out));
  label(g, "an idea", 540, 610, 150, t, C.idea - 0.12);
  label(g, "+ a few sentences", 540, 760, 74, t, C.sentences - 0.15, { weight: 300, italic: true });
  g.restore();
  // little sparkles drifting up from the prompt bar
  const p = win(C.idea, C.idea + 2.4, t) * (1 - out);
  if (p > 0) for (let i = 0; i < 7; i++) {
    const r0 = K.rnd(i + 3), x = 160 + r0() * 760, dy = (t - C.idea + r0() * 2) % 2.4;
    g.save(); g.globalAlpha = 0.85 * Math.sin(Math.PI * dy / 2.4) * clamp(p * 3); spark(g, x, 880 - dy * 120, 10 + r0() * 10, t + i); g.restore();
  }
}

function sceneTeacher(g, t) {
  if (t < te0 || t > ou1 + 0.1) return;
  const [x, y, w, h] = track(TEACH, t);
  const grow = win(te0 + 0.15, te1 + 0.1, t);
  if (h < 4) return;
  // while it grows from the bar it is clipped from the top: a reveal, not a stretch
  g.save();
  if (grow < 1) { g.beginPath(); g.rect(0, y, W, (BIG[3]) * inOutQuint(grow) + 2); g.clip(); }
  const drawH = grow < 1 ? BIG[3] : h;
  card(g, x, y, w, drawH, { col: CARD.sage, num: 3, the: "The", word: "teacher", media: clip("cw_teacher", te0), saved: win(C.tonight + 0.2, C.tonight + 0.5, t) }, t);
  g.restore();
  if (t < sh1) {
    const out = sh0;
    obj(g, "notebook", 150, 420, 250, -16, t, C.teacher - 0.2, { out });
    obj(g, "pencil", 905, 1010, 340, 62, t, C.teacher + 0.05, { out });
    bubble(g, 140, 1060, "tomorrow: maps & oceans", t, C.lesson - 0.25, { fs: 36, out });
    bubble(g, 945, 1160, "your video is ready", t, C.tonight - 0.1, { side: "r", pink: true, fs: 36, out });
    chip(g, "tonight · 9:40 pm", 760, 1250, t, C.tonight + 0.25, { fs: 30, out, solid: true });
  }
}

function sceneShop(g, t) {
  if (t < sh0 || t > ou1 + 0.1) return;
  const [x, y, w, h] = track(SHOP, t);
  card(g, x, y, w, h, { col: CARD.pink, num: 4, the: "The", word: "shop", media: clip("cw_florist", sh0), saved: win(C.agency + 0.2, C.agency + 0.5, t) }, t);
  if (t < cr1) {
    const out = cr0, dx = x - BIG[0], dy = y - BIG[1];
    g.save(); g.translate(dx, dy);
    obj(g, "cw_lily", 210, 420, 330, -12, t, C.shop - 0.15, { out });
    obj(g, "cw_bags", 270, 1215, 360, -4, t, C.ads + 0.05, { out });
    obj(g, "cw_tablet", 780, 1130, 330, 8, t, C.ads - 0.35, { out, screen: adScreen, sr: 0.05, flip: true });
    chip(g, "an agency", 520, 1010, t, C.agency - 0.35, { strike: C.agency + 0.1, out, solid: true, fs: 42 });
    bubble(g, 945, 990, "made it myself", t, C.agency + 0.45, { side: "r", pink: true, fs: 34, out });
    g.restore();
  }
}
function adScreen(g, w, h, t) {  // the ad being assembled on the tablet
  K.drawFit(g, K.footage("cw_florist_tab", t - C.ads + 0.4, 1, true), -w / 2, -h / 2, w, h, { fx: 0.3 });
  const p1 = outQuint(win(C.ads + 0.1, C.ads + 0.6, t)), p2 = outQuint(win(C.ads + 0.5, C.ads + 1.0, t));
  g.fillStyle = `rgba(168,82,122,${0.82 * p1})`; g.fillRect(-w / 2, h / 2 - h * 0.3 * p1, w, h * 0.3);
  g.fillStyle = "#fff"; g.textAlign = "left"; g.textBaseline = "alphabetic";
  const ba = g.globalAlpha;
  font(g, w * 0.13, 800, "Nunito"); g.globalAlpha = ba * p1; g.fillText("Fresh lilies", -w / 2 + w * 0.08, h / 2 - h * 0.15);
  font(g, w * 0.075, 600, "Nunito"); g.globalAlpha = ba * p2; g.fillText("today only · order in store", -w / 2 + w * 0.08, h / 2 - h * 0.07);
  g.globalAlpha = ba;
}

function sceneCreator(g, t) {
  if (t < cr0 || t > ou1 + 0.1) return;
  const [x, y, w, h] = track(CREAT, t);
  card(g, x, y, w, h, { col: CARD.mauve, num: 5, the: "The", word: "creator", media: clip("cw_creator", cr0, 1, 0.5, 0.35), mh: 0.5, saved: win(C.project + 0.3, C.project + 0.6, t) }, t);
  if (t < wy1) {
    const out = wy0 - 0.05, dy = y - BIG[1];
    g.save(); g.translate(0, dy);
    const cap = (txt, fam) => (g2, w2, h2, tt) => {
      K.drawFit(g2, K.footage("cw_creator", tt - cr0, 1, true), -w2 / 2, -h2 / 2, w2, h2, { fx: 0.62 });
      font(g2, w2 * 0.1, 700, fam); const tw = g2.measureText(txt).width;
      g2.fillStyle = "rgba(0,0,0,0.55)"; rr(g2, -tw / 2 - 16, h2 * 0.28, tw + 32, w2 * 0.16, 10); g2.fill();
      g2.fillStyle = "#fff"; g2.textAlign = "center"; g2.textBaseline = "middle"; g2.fillText(txt, 0, h2 * 0.28 + w2 * 0.08);
    };
    obj(g, "phone", 300, 930, 360, -10, t, C.english - 0.35, { out, screen: cap("Hi everyone!", "Nunito"), flip: true });
    obj(g, "phone_rose", 790, 935, 350, 8, t, C.hindi - 0.35, { out, screen: cap("नमस्ते दोस्तों!", "Poppins"), flip: true });
    chip(g, "English", 300, 1165, t, C.english - 0.1, { fs: 34, out, solid: true });
    chip(g, "हिन्दी", 790, 1165, t, C.hindi - 0.1, { fs: 34, fam: "Poppins", out, solid: true });
    chip(g, "one project", 545, 1045, t, C.project - 0.15, { fs: 32, out, solid: true, pink: true });
    g.restore();
  }
}

function sceneWhy(g, t) {
  if (t < wy0) return;
  const zoom = inOutQuint(win(ou0, ou1, t));
  // the panel that gathers the grid
  const pa = outCubic(win(wy0, wy1, t));
  const [cx, cy] = [CELL[3][0] + 210, CELL[3][1] + 243];
  g.save();
  if (zoom > 0) { g.translate(cx, cy); g.scale(1 + 3.2 * zoom, 1 + 3.2 * zoom); g.translate(-cx, -cy); g.globalAlpha = 1 - zoom; }
  glass(g, 60, 196, 960, 1216, 56, { alpha: pa, tint: 0.14 });
  // the fourth card: you
  const [x, y, w, h] = track(YOU, t);
  if (w > 4) card(g, x, y, w, h, { col: CARD.blue, num: 6, the: "and", word: "you", media: youMedia, mh: 0.5, saved: win(C.seen - 0.2, C.seen + 0.1, t) }, t);
  // glow on "can be seen"
  const gl = Math.sin(Math.PI * win(C.seen - 0.6, C.seen + 0.9, t));
  if (gl > 0) { g.save(); g.globalAlpha = 0.5 * gl; g.shadowColor = "#fff"; g.shadowBlur = 60; rr(g, x, y, w, h, 30); g.strokeStyle = "#fff"; g.lineWidth = 6; g.stroke(); g.restore(); }
  obj(g, "cw_lily", 860, 870, 250, 14, t, C.anyone, { out: ou0 + 0.2 });
  g.restore();
}
function youMedia(g, x, y, w, h, t) {  // a tiny prompt bar waiting for your idea
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0.12)");
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  const bh = 64, by = y + h / 2 - bh / 2;
  g.fillStyle = "rgba(255,255,255,0.8)"; rr(g, x + 20, by, w - 40, bh, bh / 2); g.fill();
  font(g, 26, 600, "Nunito"); g.fillStyle = "#6a7f9c"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("your idea…", x + 48, by + bh / 2 + 1);
  if (Math.floor(t * 2.2) % 2 === 0) { g.fillStyle = "#3d5679"; g.fillRect(x + 48 + g.measureText("your idea…").width + 6, by + 16, 3, 32); }
}
// cards in the grid sit above the panel: draw order handled in frame()

function sceneOutro(g, t) {
  if (t < ou0 + 0.2) return;
  const a = outCubic(win(ou0 + 0.3, ou1 + 0.3, t));
  // the lily opens behind the prompt bar
  const lp = outQuint(win(ou0 + 0.4, ou0 + 1.6, t));
  if (lp > 0) {
    const n = 360, lt = (t - (ou0 + 0.4)) * 0.95;
    const i = Math.min(n - 1, Math.max(0, Math.floor(lt * 30)));
    const im = K.img(`../assets/footage/cw_lily_bloom/f${String(i + 1).padStart(4, "0")}.png`);
    if (im) {
      const w = 860, h = w * im.height / im.width, x = 540 - w / 2, y = 1300 - h + 40 * (1 - lp);
      const tmp = LILY.getContext("2d"); tmp.clearRect(0, 0, LILY.width, LILY.height);
      tmp.drawImage(im, 0, 0, LILY.width, LILY.height);
      tmp.globalCompositeOperation = "destination-in";   // soft fade at the top, where the clip is cut
      const fade = tmp.createLinearGradient(0, 0, 0, LILY.height);
      fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(0.3, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,1)");
      tmp.fillStyle = fade; tmp.fillRect(0, 0, LILY.width, LILY.height); tmp.globalCompositeOperation = "source-over";
      g.save(); g.globalAlpha = lp; g.shadowColor = "rgba(30,40,30,0.3)"; g.shadowBlur = 40; g.shadowOffsetY = 20;
      g.drawImage(LILY, x, y, w, h); g.restore();
    }
  }
  g.save(); g.globalAlpha = a;
  label(g, "that's how vibe editing is", 540, 330, 54, t, C.s_outro + 0.7, { weight: 300, italic: true });
  label(g, "changing", 540, 450, 150, t, C.world - 0.7);
  label(g, "the world.", 540, 590, 150, t, C.world - 0.35);
  g.restore();
}
const LILY = K.makeCanvas(600, 470);

// ------------------------------------------------------------------ captions --
// like K.captions, but long phrases wrap onto two balanced lines instead of running off-screen
function captions(g, t) {
  const P = K.PHRASES;
  const ph = P.find((p, i) => t >= p[0].t0 - 0.12 && t < (P[i + 1] ? Math.min(P[i + 1][0].t0 - 0.12, p[p.length - 1].t1 + 0.6) : p[p.length - 1].t1 + 0.6));
  if (!ph) return;
  const fs = 48; font(g, fs, 800, "Nunito");
  const words = ph.map((w) => w.raw.replace(/[.,:]$/, "")), sp = g.measureText(" ").width;
  const ww = words.map((w) => g.measureText(w).width);
  const full = ww.reduce((a, b) => a + b + sp, -sp);
  let lines = [[...words.keys()]];
  if (full > 940) {  // split where the two halves are closest in width
    let best = 1, bd = 1e9, acc = 0;
    for (let i = 0; i < words.length - 1; i++) { acc += ww[i] + sp; const d = Math.abs(acc - (full - acc)); if (d < bd) { bd = d; best = i + 1; } }
    lines = [[...words.keys()].slice(0, best), [...words.keys()].slice(best)];
  }
  const endA = 1 - win(ph[ph.length - 1].t1 + 0.35, ph[ph.length - 1].t1 + 0.6, t);
  g.save(); g.textBaseline = "middle"; g.textAlign = "left";
  lines.forEach((ids, li) => {
    const lw = ids.reduce((a, i) => a + ww[i] + sp, -sp);
    let x = W / 2 - lw / 2; const y = 1530 + (li - (lines.length - 1) / 2) * fs * 1.32;
    for (const i of ids) {
      const w = ph[i], p = outCubic(win(w.t0 - 0.08, w.t0 + 0.18, t)), active = t >= w.t0 - 0.05 && t < w.t1 + 0.05;
      g.globalAlpha = (0.3 + 0.7 * p) * endA;
      if (active) { g.fillStyle = PINK_BUBBLE; rr(g, x - 10, y - fs * 0.62, ww[i] + 20, fs * 1.24, 22); g.fill(); }
      else { g.shadowColor = "rgba(30,50,80,0.5)"; g.shadowBlur = 10; g.shadowOffsetY = 3; }
      g.fillStyle = active ? "#3b2733" : "#fff";
      g.fillText(words[i], x, y + 4 * (1 - p) + 2);
      K.noShadow(g);
      x += ww[i] + sp;
    }
  });
  g.restore();
}

// ------------------------------------------------------------------ frame --
function frame(g, t) {
  drawBg(t);
  g.drawImage(BG, 0, 0);
  sceneBefore(g, t);
  sceneNow(g, t);
  // cards: the grid panel goes under them
  if (t >= wy0 && t < ou1 + 0.1) {
    const zoom = inOutQuint(win(ou0, ou1, t));
    const [cx, cy] = [CELL[3][0] + 210, CELL[3][1] + 243];
    sceneWhy(g, t);
    g.save();
    if (zoom > 0) { g.translate(cx, cy); g.scale(1 + 3.2 * zoom, 1 + 3.2 * zoom); g.translate(-cx, -cy); g.globalAlpha = 1 - zoom; }
    sceneTeacher(g, t); sceneShop(g, t); sceneCreator(g, t);
    g.restore();
  } else if (t < wy0) {
    sceneTeacher(g, t); sceneShop(g, t); sceneCreator(g, t);
  }
  sceneOutro(g, t);
  bar(g, t);
  // light sweep + grain
  captions(g, t);
  K.grain(g, t, 0.05);
  let speed = 0, moving = false;
  for (const [a, b] of GLIDES) if (t > a && t < b) { moving = true; speed = Math.max(speed, Math.sin(Math.PI * win(a, b, t))); }
  return { moving, speed };
}

K.run(frame, ["300 40px Nunito", "italic 300 40px Nunito", "600 40px Nunito", "800 40px Nunito", "500 40px Inter", "700 40px Poppins"]);
})();

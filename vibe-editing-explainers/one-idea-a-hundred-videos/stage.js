// One idea, a hundred videos. "Money documentary" collage reel: a new real backdrop on almost
// every phrase, real cut-outs and footage cards, huge condensed type, rolling number tiles,
// stamps and serif highlight boxes. Hard cuts with a punch-in; a few whips and push-ups.
(function () {
const { C, W, H, win, clamp, lerp, outCubic, outQuint, inOutCubic, inCubic, spring, rnd } = K;
const Y = "#ffd21e", RED = "#e3262f", INK = "#121212", CREAM = "#f4ead8";

// ---------------------------------------------------------------- textures --
// Paper grain (multiplied over flat colour grounds) and a soft vignette.
const PAPER = (() => {
  const c = K.makeCanvas(540, 960), x = c.getContext("2d"), id = x.createImageData(540, 960), r = rnd(9);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = 225 + (r() - 0.5) * 40; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  x.globalAlpha = 0.07;
  for (let i = 0; i < 260; i++) {  // fibres and creases
    x.strokeStyle = r() < 0.5 ? "#000" : "#fff"; x.lineWidth = 0.6 + r();
    x.beginPath(); const px = r() * 540, py = r() * 960, a = r() * 6.3, l = 20 + r() * 120;
    x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return c;
})();
function paper(g, col) {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = "multiply"; g.drawImage(PAPER, 0, 0, W, H); g.restore();
  vignette(g, 0.42);
}
function vignette(g, a = 0.5) {
  const v = g.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function gridPaper(g, base, line, step = 64) {
  paper(g, base);
  g.save(); g.strokeStyle = line; g.lineWidth = 2;
  g.beginPath();
  for (let x = 0; x <= W; x += step) { g.moveTo(x, 0); g.lineTo(x, H); }
  for (let y = 0; y <= H; y += step) { g.moveTo(0, y); g.lineTo(W, y); }
  g.stroke(); g.restore();
  vignette(g, 0.35);
}
// full-bleed real footage, slow push-in, optional colour grade
function bg(g, name, lt, o = {}) {
  const fr = K.footage(name, (o.ss || 0) + lt * (o.speed || 1), 1, o.loop);
  if (!fr) return;
  g.save();
  if (o.filter) g.filter = o.filter;
  const z = (o.zoom || 1) * (1 + 0.025 * lt);
  K.drawFit(g, fr, -W * (z - 1) / 2, -H * (z - 1) / 2, W * z, H * z, { fx: o.fx, fy: o.fy });
  g.restore();
  if (o.tint) { g.fillStyle = o.tint; g.fillRect(0, 0, W, H); }
  vignette(g, o.vig ?? 0.45);
}

// ---------------------------------------------------------------- type --
function shadowed(g, fn, depth = 7) {
  g.save(); g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 18; g.shadowOffsetY = 10; fn(); g.restore();
  g.save(); g.translate(0, depth); g.globalAlpha *= 0.85; g.globalCompositeOperation = "destination-over"; g.restore();
}
// big condensed headline that pops in word by word: words = [[text, at], ...]
function head(g, words, x, y, size, t, o = {}) {
  K.font(g, size, 400, o.font || "Anton");
  if (g.letterSpacing !== undefined) g.letterSpacing = `${o.track ?? 0}px`;
  const sp = size * 0.22;
  const ws = words.map(([s]) => g.measureText(s).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cx = o.align === "left" ? x : x - total / 2;
  g.save(); g.translate(0, 0);
  if (o.rot) { g.translate(x, y); g.rotate(o.rot * Math.PI / 180); g.translate(-x, -y); }
  words.forEach(([s, at, col], i) => {
    const p = win(at, at + 0.16, t);
    if (p <= 0) { cx += ws[i] + sp; return; }
    const sc = 1 + 0.35 * (1 - outCubic(p));
    g.save(); g.translate(cx + ws[i] / 2, y); g.scale(sc, sc); g.globalAlpha = clamp(p * 2.5);
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(40,20,0,0.85)"; g.fillText(s, 0, size * 0.07);                  // hard drop
    g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 22; g.shadowOffsetY = 8;
    g.fillStyle = col || o.color || "#fff"; g.fillText(s, 0, 0);
    g.restore();
    cx += ws[i] + sp;
  });
  g.restore();
  if (g.letterSpacing !== undefined) g.letterSpacing = "0px";
}
// letters typed one by one (the chalkboard "S&P" style)
function typeLine(g, s, x, y, size, t, at, cps = 22, o = {}) {
  const n = Math.max(0, Math.floor((t - at) * cps));
  if (n <= 0) return;
  K.font(g, size, 400, o.font || "Anton");
  g.save(); g.textAlign = o.align || "center"; g.textBaseline = "middle";
  if (o.chalk) { g.globalAlpha = 0.92; g.shadowColor = "rgba(255,255,255,0.35)"; g.shadowBlur = 6; }
  else { g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 16; g.shadowOffsetY = 6; }
  g.fillStyle = o.color || "#fff"; g.fillText(s.slice(0, n), x, y);
  g.restore();
}
// serif word on a highlight box ("In 1999" style)
function serifBox(g, s, x, y, size, t, at, o = {}) {
  const p = outQuint(win(at, at + 0.22, t));
  if (p <= 0) return;
  K.font(g, size, 400, "Instrument Serif");
  const tw = g.measureText(s).width, pad = size * 0.16;
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot * Math.PI / 180);
  const ax = o.align === "left" ? 0 : -tw / 2 - pad;
  g.fillStyle = o.box || "#1d5b34"; g.fillRect(ax, -size * 0.58, (tw + pad * 2) * p, size * 1.1);
  g.save(); g.beginPath(); g.rect(ax, -size * 0.7, (tw + pad * 2) * p, size * 1.4); g.clip();
  g.fillStyle = o.color || "#ff9de0"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(s, ax + pad, size * 0.02);
  g.restore(); g.restore();
}
function plainSerif(g, s, x, y, size, t, at, col = "#fff") {
  const p = outCubic(win(at, at + 0.2, t)); if (p <= 0) return;
  K.font(g, size, 400, "Instrument Serif");
  g.save(); g.globalAlpha = p; g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 14; g.shadowOffsetY = 4;
  g.fillStyle = col; g.fillText(s, x, y + 20 * (1 - p)); g.restore();
}
// rubber stamp that slams in
function stamp(g, s, x, y, size, rot, t, at, col = RED) {
  const p = win(at, at + 0.14, t);
  if (p <= 0) return;
  const sc = 1 + 1.4 * (1 - outCubic(p));
  K.font(g, size, 400, "Anton");
  const tw = g.measureText(s).width;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(sc, sc); g.globalAlpha = clamp(p * 2) * 0.95;
  g.strokeStyle = col; g.lineWidth = size * 0.07; g.strokeRect(-tw / 2 - size * 0.22, -size * 0.66, tw + size * 0.44, size * 1.24);
  g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, 0, size * 0.03);
  g.globalCompositeOperation = "destination-out";       // worn ink
  const r = rnd(7);
  for (let i = 0; i < 90; i++) { g.globalAlpha = 0.25 + r() * 0.5; g.beginPath(); g.arc((r() - 0.5) * (tw + size * 0.4), (r() - 0.5) * size * 1.2, 1 + r() * 4, 0, 7); g.fill(); }
  g.restore();
}
// digits in white tiles with a red rim ("230" style); `val` may roll from a to b
function tiles(g, str, cx, cy, h, t, at, o = {}) {
  if (t < at) return;
  K.font(g, h * 0.78, 400, "Bungee");
  const chars = [...str], cw = h * 0.74, gap = h * 0.06;
  const total = chars.length * cw + (chars.length - 1) * gap;
  chars.forEach((ch, i) => {
    const bornAt = at + i * (o.stagger ?? 0.06);
    const p = win(bornAt, bornAt + 0.16, t);
    if (p <= 0) return;
    const x = cx - total / 2 + i * (cw + gap) + cw / 2;
    const bump = o.bumps ? o.bumps(i) : 0;           // a digit that just changed hops up
    const sc = (1 + 0.3 * (1 - outCubic(p))) * (1 + 0.12 * bump);
    g.save(); g.translate(x, cy - h * 0.12 * bump); g.scale(sc, sc); g.rotate(((i % 2 ? 1 : -1) * 2 + (o.rot || 0)) * Math.PI / 180);
    const op = ch === "×" || ch === "=";
    if (!op) {
      g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 16; g.shadowOffsetY = 9;
      g.fillStyle = o.rim || "#7c0d14"; K.rr(g, -cw / 2, -h / 2, cw, h, h * 0.08); g.fill();
      K.noShadow(g);
      g.fillStyle = o.face || "#fff"; K.rr(g, -cw / 2 + h * 0.06, -h / 2 + h * 0.06, cw - h * 0.12, h - h * 0.12, h * 0.05); g.fill();
    }
    g.fillStyle = op ? (o.opColor || "#fff") : (o.ink || "#7c0d14");
    if (op) { g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 14; g.shadowOffsetY = 6; }
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, 0, h * 0.05);
    g.restore();
  });
}
function counter(a, b, t0, t1, t, digits) {
  const v = Math.round(lerp(a, b, inOutCubic(win(t0, t1, t))));
  return String(v).padStart(digits, "0");
}

// ---------------------------------------------------------------- pictures --
// a real-footage card with a white border (or gold frame), pops in with a little spin
function card(g, name, x, y, w, h, t, at, o = {}) {
  const p = spring(win(at, at + 0.5, t));
  if (p <= 0) return;
  const fr = "img" in o ? o.img : K.footage(name, Math.max(0, t - at) * (o.speed ?? 1) + (o.ss || 0), 1, true);
  g.save(); g.translate(x + (o.dx || 0) * (1 - p), y + (o.dy ?? 60) * (1 - p)); g.rotate(((o.rot || 0) + (1 - p) * 9) * Math.PI / 180);
  const s = 0.82 + 0.18 * p; g.scale(s, s); g.globalAlpha = clamp(p * 3);
  const b = o.border ?? 14;
  g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 30; g.shadowOffsetY = 16;
  if (o.gold) goldFrame(g, w, h);
  else { g.fillStyle = o.borderCol || "#f7f4ee"; g.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b + (o.label ? 0 : 0)); }
  K.noShadow(g);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip();
  if (o.filter) g.filter = o.filter;
  if (fr) K.drawFit(g, fr, -w / 2, -h / 2, w, h, { fx: o.fx, fy: o.fy });
  g.filter = "none";
  g.restore();
  if (o.after) o.after(g, w, h);
  g.restore();
}
function goldFrame(g, w, h) {
  const f = Math.max(28, w * 0.07);
  const gr = g.createLinearGradient(-w / 2 - f, -h / 2 - f, w / 2 + f, h / 2 + f);
  gr.addColorStop(0, "#f6d77a"); gr.addColorStop(0.25, "#a8741f"); gr.addColorStop(0.5, "#f1c75b"); gr.addColorStop(0.75, "#8a5a14"); gr.addColorStop(1, "#e9bd55");
  g.fillStyle = gr; g.fillRect(-w / 2 - f, -h / 2 - f, w + 2 * f, h + 2 * f);
  K.noShadow(g);
  g.strokeStyle = "rgba(60,30,0,0.55)"; g.lineWidth = 3;
  for (const k of [0.25, 0.6, 0.9]) g.strokeRect(-w / 2 - f * k, -h / 2 - f * k, w + 2 * f * k, h + 2 * f * k);
  g.fillStyle = "#3a2508"; g.fillRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
}
function cutout(g, key, x, y, w, t, at, o = {}) {
  const p = spring(win(at, at + 0.55, t));
  if (p <= 0) return;
  const im = K.object(key); if (!im) return;
  const h = w * im.height / im.width;
  g.save(); g.translate(x + (o.dx || 0) * (1 - p), y + (o.dy ?? 80) * (1 - p)); g.rotate(((o.rot || 0) + (o.wobble ? Math.sin(t * o.wobble) * 4 : 0)) * Math.PI / 180);
  const s = (1.25 - 0.25 * p) * (o.scale || 1); g.scale(s, s); g.globalAlpha = clamp(p * 3);
  g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 30; g.shadowOffsetY = 18;
  g.drawImage(im, -w / 2, -h / 2, w, h);
  g.restore();
}
function labelBox(g, s, x, y, size, t, at, o = {}) {   // yellow box with black condensed text
  const p = outQuint(win(at, at + 0.18, t)); if (p <= 0) return;
  K.font(g, size, 400, "Anton");
  const tw = g.measureText(s).width, pw = tw + size * 0.5, ph = size * 1.25;
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p); g.globalAlpha = clamp(p * 3);
  g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 14; g.shadowOffsetY = 6;
  g.fillStyle = o.bg || Y; g.fillRect(-pw / 2, -ph / 2, pw, ph); K.noShadow(g);
  g.fillStyle = o.fg || INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, 0, size * 0.04);
  g.restore();
}

// ---------------------------------------------------------------- footage pool --
// Real clips already in the shared assets, used as video thumbnails ("the hundred videos").
const POOL = ["timelapse", "typing", "clapper", "tired", "timeline", "moviola", "ai_camera", "ai_click", "ai_editor", "ai_grade",
  "ai_studio", "ai_thinker", "ai_vertical", "ai_beard", "cw_creator", "cw_florist", "cw_teacher", "cw_studio", "cw_software", "cw_sky",
  "ff_cassette", "ff_coffee", "ff_reel", "ff_vhs", "ff_typing", "ff_moviola_wide", "hw_dev", "hw_filming", "hw_podcast", "hw_coffee",
  "hw_listening", "hw_reels", "oh_team", "oh_studio", "oh_music", "oh_text", "oh_sticky", "oh_bulb", "oh_flag_in", "oh_flag_jp",
  "oh_flag_br", "oh_coins", "oh_list", "oh_length"].filter((n) => K.A.footage[n]);
function thumb(i) {               // a fixed frame of a pool clip
  const name = POOL[i % POOL.length], n = K.A.footage[name];
  const f = (Math.floor(i / POOL.length) * 37 + 11) % n;
  return K.footage(name, f / 30);
}
const HOOKS = ["Stop scrolling.", "Nobody tells you this", "I tried it for 30 days", "Watch till the end", "This changed my edits",
  "The 3-second rule", "Don't make this mistake", "Here's the secret", "Before vs after", "You're doing it wrong"];

// ---------------------------------------------------------------- scenes --
const S = [];
const scene = (at, draw, enter = "punch") => S.push({ at, draw, enter });

scene(C.c_editor, (g, t, lt) => {                       // One editor.
  bg(g, "oh_wood", lt, { vig: 0.55 });
  cutout(g, "ai_bearded", 540, 790, 470, t, C.c_editor + 0.05, { rot: -3 });
  head(g, [["ONE", 0.0]], 540, 330, 250, t);
  head(g, [["EDITOR", C.editor - 0.02]], 540, 1330, 190, t, { color: Y });
});
scene(C.c_idea, (g, t, lt) => {                         // One idea.
  bg(g, "oh_bulb", lt, { ss: 0.4, zoom: 1.05, vig: 0.6 });
  const glow = outCubic(win(C.idea, C.idea + 0.5, t));
  g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = 0.35 * glow;
  const r = g.createRadialGradient(540, 900, 30, 540, 900, 700); r.addColorStop(0, "#ffb347"); r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r; g.fillRect(0, 0, W, H); g.restore();
  head(g, [["ONE", C.c_idea + 0.06]], 540, 300, 230, t);
  head(g, [["IDEA", C.idea - 0.02]], 540, 1290, 290, t, { color: Y });
});
scene(C.c_hundred, (g, t, lt) => {                      // One hundred videos.
  paper(g, "#c8102e");
  // concentric rings, the red-white target of the reference
  g.save(); g.translate(540, 820); const pulse = 1 + 0.02 * Math.sin(lt * 6);
  for (let k = 9; k >= 1; k--) {
    g.fillStyle = k % 2 ? "#f2e8da" : "#b30f26"; g.beginPath();
    for (let a = 0; a <= 6.3; a += 0.1) { const rr = k * 105 * pulse * (1 + 0.06 * Math.sin(a * 5 + lt * 2 + k)); g.lineTo(Math.cos(a) * rr * 0.8, Math.sin(a) * rr); }
    g.closePath(); g.fill();
  }
  g.restore();
  g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.5; g.drawImage(PAPER, 0, 0, W, H); g.restore();
  // a burst of real videos around the counter
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + Math.PI / 8 + i * Math.PI / 4, r = 430;
    card(g, null, 540 + Math.cos(a) * r * 0.92, 820 + Math.sin(a) * r * 1.25, 210, 140, t, C.hundred - 0.25 + i * 0.05,
      { img: thumb(i * 5 + 3), rot: (i % 2 ? 7 : -6), border: 8, dy: 0 });
  }
  const v = counter(1, 100, C.hundred - 0.1, C.videos0 + 0.35, t, 3);
  tiles(g, v, 540, 820, 230, t, C.c_hundred + 0.05, { stagger: 0.04 });
  head(g, [["VIDEOS", C.videos0 - 0.02]], 540, 1060, 150, t);
});
scene(C.c_impossible, (g, t, lt) => {                   // Sounds impossible. It isn't. (one board)
  const im = K.image("oh_chalk");
  g.save(); const z = 1.04 + 0.02 * lt + (t > C.c_isnt ? 0.05 * outCubic(win(C.c_isnt, C.c_isnt + 0.2, t)) : 0);
  g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  if (im) g.drawImage(im, 690, 0, 590, 720, 0, 0, W, H);   // the empty part of a real chalkboard
  g.restore();
  vignette(g, 0.6);
  typeLine(g, "SOUNDS", 540, 520, 190, t, C.c_impossible + 0.02, 30, { chalk: true });
  stamp(g, "IMPOSSIBLE", 540, 820, 170, -8, t, C.impossible);
  if (t > C.c_isnt) {   // a chalk strike through the stamp, then the answer
    const p = outCubic(win(C.c_isnt, C.c_isnt + 0.22, t));
    g.save(); g.strokeStyle = "rgba(255,255,255,0.92)"; g.lineWidth = 22; g.lineCap = "round";
    g.beginPath(); g.moveTo(90, 900); g.lineTo(90 + 900 * p, 740 - 40 * p); g.stroke(); g.restore();
    head(g, [["IT", C.c_isnt + 0.04], ["ISN'T.", C.isnt - 0.02, Y]], 540, 1150, 230, t);
  }
});
scene(C.c_why, (g, t, lt) => {                         // Here's why.
  paper(g, "#1e4fc4");
  g.save(); g.globalAlpha = 0.12; K.font(g, 900, 400, "Anton"); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("?", 540 + lt * 30, 860); g.restore();
  plainSerif(g, "Here's", 540, 700, 220, t, C.c_why + 0.04);
  serifBox(g, "why.", 540, 960, 260, t, C.why - 0.04, { box: "#173d18", color: "#9effa3" });
});
scene(C.c_code, (g, t, lt) => {                         // When an edit is code,
  gridPaper(g, "#e9e4d8", "rgba(40,80,160,0.22)");
  // the real laptop, screen typing code
  const p = spring(win(C.c_code, C.c_code + 0.5, t));
  const im = K.object("hw_laptop");
  if (im) {
    const w = 900, h = w * im.height / im.width, x = 540, y = 930 + 80 * (1 - p);
    g.save(); g.translate(x, y); g.scale(1.2 - 0.2 * p, 1.2 - 0.2 * p); g.globalAlpha = clamp(p * 3);
    g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 40; g.shadowOffsetY = 24; g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
    const sc = K.A.objects.hw_laptop.screen;
    if (sc) {
      const L = sc.len * w, Wd = sc.wid * w;
      g.translate(-w / 2 + sc.cx * w, -h / 2 + sc.cy * w); g.rotate(sc.ang * Math.PI / 180);
      const sw = Math.max(L, Wd), sh = Math.min(L, Wd);
      g.fillStyle = "#0d1117"; g.fillRect(-sw / 2, -sh / 2, sw, sh);
      const code = ["const video = template({", "  hook: hooks[i],", "  music: tracks[j],", "  lang: langs[k],", "  length: 45,", "});", "render(video)"];
      K.font(g, sh * 0.1, 600, "Mono"); g.textAlign = "left"; g.textBaseline = "top";
      let n = Math.floor(Math.max(0, t - C.c_code - 0.2) * 55);
      code.forEach((ln, i) => {
        const s = ln.slice(0, Math.max(0, n)); n -= ln.length + 1;
        g.fillStyle = i === 0 || i === 6 ? "#ffd21e" : "#c9f6c0"; g.fillText(s, -sw / 2 + sw * 0.06, -sh / 2 + sh * 0.07 + i * sh * 0.125);
      });
    }
    g.restore();
  }
  head(g, [["EDIT", C.edit - 0.02], ["=", C.code - 0.12, "#fff"], ["CODE", C.code - 0.02, Y]], 540, 380, 200, t);
});
scene(C.c_setting, (g, t, lt) => {                      // every choice is a setting.
  paper(g, "#2a5fc4");
  // a real chalkboard surface in a wooden frame, hanging from a nail
  const sw = Math.sin(lt * 2.2) * 1.2 * (1 - win(0, 1.4, lt));
  g.save(); g.translate(540, 420); g.rotate(sw * Math.PI / 180);
  g.strokeStyle = "#1a1a1a"; g.lineWidth = 4; g.beginPath(); g.moveTo(-300, 270); g.lineTo(0, 0); g.lineTo(300, 270); g.stroke();
  g.fillStyle = "#d22"; g.beginPath(); g.arc(0, 0, 12, 0, 7); g.fill();
  g.translate(0, 600);
  g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 40; g.shadowOffsetY = 26;
  const wood = g.createLinearGradient(-470, 0, 470, 0); wood.addColorStop(0, "#b07a43"); wood.addColorStop(0.5, "#d29b5c"); wood.addColorStop(1, "#9c6935");
  g.fillStyle = wood; g.fillRect(-470, -340, 940, 680); K.noShadow(g);
  const im = K.image("oh_chalk"); if (im) g.drawImage(im, 700, 60, 560, 420, -440, -310, 880, 620);
  g.fillStyle = "rgba(0,0,0,0.15)"; g.fillRect(-440, -310, 880, 620);
  typeLine(g, "EVERY CHOICE", 0, -120, 120, t, C.c_setting + 0.04, 26, { chalk: true });
  typeLine(g, "= A SETTING", 0, 60, 150, t, C.setting - 0.25, 30, { chalk: true, color: "#fff7a8" });
  // three chalk sliders
  for (let i = 0; i < 3; i++) {
    const p = outCubic(win(C.setting + i * 0.1, C.setting + 0.4 + i * 0.1, t)); if (p <= 0) continue;
    const y = 190 + i * 40; g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-300, y); g.lineTo(-300 + 600 * p, y); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(-300 + (180 + i * 150) * p, y, 13, 0, 7); g.fill();
  }
  g.restore();
});
scene(C.c_four, (g, t, lt) => {                         // The text. The music. The language. The length.
  paper(g, "#1b1b1b");
  const items = [["TEXT", "oh_text", C.text, 300, 560, -4], ["MUSIC", "oh_music", C.music, 780, 600, 5],
    ["LANGUAGE", "oh_lang", C.language, 300, 1110, 4], ["LENGTH", "oh_length", C.length, 780, 1080, -5]];
  items.forEach(([label, clip, at, x, y, rot]) => {
    card(g, clip, x, y, 400, 400, t, at - 0.14, { rot, border: 12, dy: -40, fx: clip === "oh_text" ? 0.7 : 0.5 });
    labelBox(g, label, x, y + 250, 64, t, at - 0.02, { rot: rot * 0.6 });
  });
  head(g, [["SETTINGS", C.c_four + 0.05]], 540, 250, 130, t, { color: "#fff" });
});
scene(C.c_phone, (g, t, lt) => {                        // Change a setting, and you get a new video.
  const isNew = t >= C.newvid - 0.04;
  bg(g, isNew ? "oh_phone_b" : "oh_phone_a", isNew ? t - C.newvid : lt, { vig: 0.35 });
  if (isNew) { const f = 1 - win(C.newvid - 0.04, C.newvid + 0.22, t); g.fillStyle = `rgba(255,255,255,${0.85 * f})`; g.fillRect(0, 0, W, H); }
  head(g, [["CHANGE", C.change - 0.02], ["A", C.change + 0.1], ["SETTING", C.change + 0.22, Y]], 540, 230, 120, t);
  // a slider that moves on "change"
  const sp = outCubic(win(C.change + 0.25, C.change + 0.75, t));
  if (t > C.change) {
    g.save(); g.translate(540, 1330);
    g.fillStyle = "rgba(10,10,10,0.75)"; K.rr(g, -330, -55, 660, 110, 55); g.fill();
    K.font(g, 40, 700, "Inter Var"); g.fillStyle = "#fff"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("music", -290, 0);
    g.fillStyle = "rgba(255,255,255,0.3)"; g.fillRect(-120, -5, 400, 10);
    g.fillStyle = Y; g.fillRect(-120, -5, 400 * lerp(0.2, 0.85, sp), 10);
    g.beginPath(); g.arc(-120 + 400 * lerp(0.2, 0.85, sp), 0, 22, 0, 7); g.fill();
    g.restore();
  }
  head(g, [["NEW", C.newvid - 0.02, Y], ["VIDEO", C.video1 - 0.02]], 540, 1130, 190, t);
}, "whip");
scene(C.c_hooks, (g, t, lt) => {                        // Ten hooks to test.
  gridPaper(g, "#2e7d32", "rgba(255,255,255,0.13)", 72);
  tiles(g, "10", 300, 380, 230, t, C.c_hooks + 0.04);
  head(g, [["HOOKS", C.hooks - 0.02]], 720, 395, 150, t, { align: "left" });
  for (let i = 0; i < 10; i++) {
    const col = i % 2, row = Math.floor(i / 2), x = col ? 790 : 290, y = 680 + row * 152;
    const at = C.c_hooks + 0.1 + i * 0.07;
    card(g, null, x, y, 400, 120, t, at, { img: thumb(i * 7 + 2), rot: col ? 2 : -2, border: 8, dy: 30, dx: col ? 120 : -120,
      after: (g2, w, h) => {
        g2.fillStyle = "rgba(255,255,255,0.93)"; g2.fillRect(-w / 2, h / 2 - 46, w, 46);
        K.font(g2, 28, 700, "Inter Var"); g2.fillStyle = INK; g2.textAlign = "left"; g2.textBaseline = "middle"; g2.fillText(HOOKS[i], -w / 2 + 14, h / 2 - 23);
      } });
  }
  serifBox(g, "to test", 540, 1440, 70, t, C.test - 0.05, { box: "#111", color: Y });
});
scene(C.c_langs, (g, t, lt) => {                        // Five languages.
  paper(g, "#b8102b");
  tiles(g, "5", 220, 340, 240, t, C.c_langs + 0.04);
  head(g, [["LANGUAGES", C.languages - 0.02]], 640, 350, 140, t);
  const F = [["oh_flag_in", "नमस्ते", "Poppins"], ["oh_flag_br", "Olá", "Anton"], ["oh_flag_jp", "こんにちは", "WenQuanYi Zen Hei"],
    ["oh_flag_cn", "你好", "WenQuanYi Zen Hei"], ["oh_flag_us", "Hello", "Anton"]];
  F.forEach(([clip, hi, fam], i) => {
    const x = [280, 800, 540, 270, 810][i], y = [690, 700, 980, 1250, 1260][i], rot = [-6, 5, -2, 4, -5][i];
    const at = C.c_langs + 0.12 + i * 0.12;
    card(g, clip, x, y, 400, 250, t, at, { rot, border: 10 });
    const p = spring(win(at + 0.12, at + 0.5, t));
    if (p > 0) {
      g.save(); g.translate(x + 60, y + 120); g.rotate((rot * 1.5) * Math.PI / 180); g.scale(p, p);
      K.font(g, 50, fam === "Poppins" ? 700 : 400, fam); const tw = g.measureText(hi).width;
      g.fillStyle = "#fff"; g.shadowColor = "rgba(0,0,0,0.4)"; g.shadowBlur = 10; g.shadowOffsetY = 4;
      K.rr(g, -tw / 2 - 22, -38, tw + 44, 76, 38); g.fill(); K.noShadow(g);
      g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(hi, 0, 3);
      g.restore();
    }
  });
});
scene(C.c_formats, (g, t, lt) => {                      // Three formats.
  paper(g, "#151515");
  tiles(g, "3", 230, 360, 240, t, C.c_formats + 0.04);
  head(g, [["FORMATS", C.formats - 0.02]], 640, 370, 150, t);
  const fm = [["9:16", 300, 540], ["1:1", 420, 420], ["16:9", 560, 315]];
  let x = 60;
  fm.forEach(([lab, w, h], i) => {
    const at = C.formats - 0.15 + i * 0.12;
    const cx = [210, 570, 860][i], cy = 860;
    card(g, "cw_creator", cx, cy, w * 0.86, h * 0.86, t, at, { rot: [-3, 2, -2][i], border: 10, ss: 1.5 });
    labelBox(g, lab, cx, cy + h * 0.43 + 70, 52, t, at + 0.1, { bg: "#fff" });
  });
});
scene(C.c_multiply, (g, t, lt) => {                     // Multiply them,
  bg(g, "oh_coins", lt, { ss: 0.3, filter: "saturate(0.6) contrast(1.1)", vig: 0.55, tint: "rgba(0,0,0,0.25)" });
  tiles(g, "10", 270, 780, 200, t, C.multiply - 0.02, { stagger: 0.03 });
  tiles(g, "×", 470, 780, 200, t, C.multiply + 0.1);
  tiles(g, "5", 590, 780, 200, t, C.multiply + 0.22);
  tiles(g, "×", 720, 780, 200, t, C.multiply + 0.34);
  tiles(g, "3", 840, 780, 200, t, C.multiply + 0.46);
  head(g, [["MULTIPLY", C.multiply - 0.02], ["THEM", C.them - 0.02, Y]], 540, 1090, 150, t);
});
scene(C.c_total, (g, t, lt) => {                        // and one project becomes a hundred and fifty videos.
  const zoomOut = outCubic(win(C.videos2 - 0.15, C.videos2 + 0.6, t));
  if (zoomOut < 1) {
    bg(g, "oh_bills", lt, { filter: "grayscale(1) contrast(1.15) brightness(0.8)", vig: 0.6 });
    plainSerif(g, "one project", 540, 360, 120, t, C.project - 0.1);
    serifBox(g, "becomes", 540, 520, 96, t, C.becomes - 0.05, { box: "#1d5b34", color: "#9effa3" });
    const v = counter(1, 150, C.becomes, C.fifty + 0.25, t, 3);
    tiles(g, v, 540, 860, 260, t, C.becomes - 0.05, { stagger: 0.05 });
  }
  if (zoomOut > 0) {   // the payoff: a wall of 150 real videos
    g.save(); g.globalAlpha = zoomOut;
    g.fillStyle = "#0e0e0e"; g.fillRect(0, 0, W, H);
    const cols = 10, rows = 15, cw = 104, ch = 124, gx = (W - cols * cw) / 2, gy = 120;
    const z = lerp(2.2, 1, zoomOut);
    g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
    for (let i = 0; i < 150; i++) {
      const c = i % cols, r = Math.floor(i / cols), x = gx + c * cw, y = gy + r * ch;
      const im = thumb(i);
      g.save(); g.beginPath(); g.rect(x + 3, y + 3, cw - 6, ch - 6); g.clip();
      if (im) K.drawFit(g, im, x + 3, y + 3, cw - 6, ch - 6);
      g.restore();
    }
    g.restore();
    vignette(g, 0.5);
    g.save(); g.globalAlpha = zoomOut; g.fillStyle = "rgba(0,0,0,0.72)"; g.fillRect(0, 690, W, 400); g.restore();
    tiles(g, "150", 540, 820, 200, t, C.videos2 - 0.1, { stagger: 0.04, face: Y, rim: "#3a2a00", ink: INK });
    head(g, [["VIDEOS", C.videos2 + 0.05]], 540, 1000, 130, t);
  }
  return { moving: zoomOut > 0.02 && zoomOut < 0.98, speed: 0.6 };
}, "pushup");
scene(C.c_old, (g, t, lt) => {                          // The old way?
  paper(g, "#141414");
  head(g, [["THE", C.c_old + 0.04]], 540, 720, 160, t);
  head(g, [["OLD", C.oldway - 0.18, RED], ["WAY?", C.oldway - 0.02]], 540, 930, 240, t);
});
scene(C.c_hand, (g, t, lt) => {                         // Every version is a new edit, by hand.
  bg(g, "oh_papers", lt, { filter: "saturate(0.5) contrast(1.1) brightness(0.85)", vig: 0.6 });
  card(g, "tired", 300, 620, 380, 520, t, C.c_hand + 0.05, { rot: -6, border: 12, ss: 2.4 });
  cutout(g, "hw_clock", 820, 520, 330, t, C.newedit - 0.2, { rot: 8, wobble: 22 });
  const n = counter(1, 150, C.version, C.hand + 0.4, t, 1);
  if (t > C.version) {
    K.font(g, 120, 400, "Anton"); g.save(); g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(40,20,0,0.85)"; g.fillText("×" + n, 800, 1007); g.fillStyle = "#fff"; g.fillText("×" + n, 800, 1000);
    K.font(g, 44, 700, "Inter Var"); g.fillText("edits", 800, 1090); g.restore();
  }
  head(g, [["EVERY", C.c_hand + 0.05], ["VERSION", C.version - 0.02, Y]], 540, 250, 130, t);
  stamp(g, "BY HAND", 560, 1230, 170, -6, t, C.hand - 0.05);
}, "whip");
scene(C.c_vibe, (g, t, lt) => {                         // The vibe editing way?
  paper(g, Y);
  head(g, [["THE", C.c_vibe, INK]], 540, 640, 160, t);
  serifBox(g, "vibe editing", 540, 850, 170, t, C.c_vibe + 0.08, { box: INK, color: Y });
  head(g, [["WAY?", C.vibeway - 0.02, INK]], 540, 1080, 230, t);
});
scene(C.c_template, (g, t, lt) => {                     // One template, and a list.
  bg(g, "oh_wood", lt + 1.5, { vig: 0.55, tint: "rgba(0,0,0,0.12)" });
  card(g, "typing", 300, 640, 420, 560, t, C.c_template + 0.04, { rot: -5, border: 14 });
  labelBox(g, "1 TEMPLATE", 300, 970, 62, t, C.template - 0.05, { rot: -5 });
  // the list: a real clipboard shot, with the items typed on a note pinned over it
  card(g, "oh_list", 790, 700, 420, 520, t, C.list - 0.45, { rot: 5, border: 14, fx: 0.4 });
  const np = spring(win(C.list - 0.2, C.list + 0.3, t));
  if (np > 0) {
    g.save(); g.translate(760, 1000); g.rotate(-3 * Math.PI / 180); g.scale(np, np);
    g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 24; g.shadowOffsetY = 12;
    g.fillStyle = "#fbf6e6"; g.fillRect(-230, -170, 460, 340); K.noShadow(g);
    g.strokeStyle = "rgba(200,16,46,0.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(-170, -170); g.lineTo(-170, 170); g.stroke();
    const items = ["10 hooks", "5 languages", "3 formats", "= 150 videos"];
    K.font(g, 44, 700, "Inter Var"); g.textAlign = "left"; g.textBaseline = "middle";
    items.forEach((s2, i) => {
      const vis = K.typed(s2, t, C.list - 0.05 + i * 0.28, 34); if (!vis) return;
      g.fillStyle = i === 3 ? "#c8102e" : INK; g.fillText(vis, -150, -110 + i * 75);
    });
    g.restore();
  }
  head(g, [["ONE", C.c_template + 0.05], ["TEMPLATE", C.template - 0.02, Y]], 540, 250, 130, t);
  head(g, [["+", C.list - 0.25, "#fff"], ["A LIST", C.list - 0.05, Y]], 540, 1300, 140, t);
});
scene(C.c_teams, (g, t, lt) => {                        // That's how small teams are starting to
  // dark red damask wall
  paper(g, "#5a0b14");
  g.save(); g.globalAlpha = 0.18; g.strokeStyle = "#e7a0a8"; g.lineWidth = 3;
  for (let y = -60; y < H + 60; y += 150) for (let x = (y / 150) % 2 ? 0 : 75; x < W + 80; x += 150) {
    g.beginPath(); g.ellipse(x, y, 34, 56, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(x, y, 12, 24, 0, 0, 7); g.stroke();
  }
  g.restore(); vignette(g, 0.55);
  card(g, "oh_team", 540, 760, 760, 540, t, C.c_teams + 0.04, { gold: true, dy: -40 });
  head(g, [["SMALL", C.small - 0.02, Y], ["TEAMS", C.teams - 0.02]], 540, 1260, 170, t);
});
scene(C.c_studios, (g, t, lt) => {                      // post like big studios.
  paper(g, "#101010");
  // a fan of real thumbnails behind the frame, like the bills behind the portrait
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + lt * 0.08, p = outCubic(win(C.c_studios + i * 0.02, C.c_studios + 0.4 + i * 0.02, t));
    g.save(); g.translate(540, 760); g.rotate(a); g.translate(0, -560 * p); g.rotate(Math.PI / 2 * 0);
    const im = thumb(i * 9 + 4); g.globalAlpha = p;
    g.fillStyle = "#eee"; g.fillRect(-150, -95, 300, 190);
    if (im) { g.save(); g.beginPath(); g.rect(-142, -87, 284, 174); g.clip(); K.drawFit(g, im, -142, -87, 284, 174); g.restore(); }
    g.restore();
  }
  card(g, "oh_studio", 540, 760, 520, 720, t, C.c_studios + 0.04, { gold: true, dy: 0 });
  head(g, [["POST", C.c_studios + 0.08], ["LIKE", C.c_studios + 0.3]], 540, 230, 120, t);
  head(g, [["BIG", C.big - 0.02, Y], ["STUDIOS", C.studios - 0.02, Y]], 540, 1300, 180, t);
});
scene(C.c_follow, (g, t, lt) => {                       // Follow for more vibe editing.
  paper(g, "#1e4fc4");
  bg(g, "oh_phone_b", lt + 1.2, { vig: 0 });
  g.fillStyle = "rgba(20,40,120,0.55)"; g.fillRect(0, 0, W, H); vignette(g, 0.5);
  head(g, [["FOLLOW", C.follow - 0.02, Y]], 540, 760, 240, t);
  plainSerif(g, "for more", 540, 960, 110, t, C.more - 0.1);
  serifBox(g, "vibe editing", 540, 1120, 140, t, C.vibeediting - 0.05, { box: "#111", color: Y });
});

// ---------------------------------------------------------------- frame --
const WHIP = 0.2;
function frame(g, t) {
  let i = 0; while (i < S.length - 1 && t >= S[i + 1].at) i++;
  const s = S[i], lt = t - s.at;
  let st = {};
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  if (i > 0 && s.enter === "whip" && lt < WHIP) {              // whip pan: old frame out left, new in from right
    const p = inOutCubic(lt / WHIP), prev = S[i - 1];
    g.save(); g.translate(-W * p, 0); prev.draw(g, t, t - prev.at); g.restore();
    g.save(); g.translate(W * (1 - p), 0); s.draw(g, t, lt); g.restore();
    st = { moving: true, speed: 1 };
  } else if (i > 0 && s.enter === "pushup" && lt < WHIP) {     // push up
    const p = inOutCubic(lt / WHIP), prev = S[i - 1];
    g.save(); g.translate(0, -H * p); prev.draw(g, t, t - prev.at); g.restore();
    g.save(); g.translate(0, H * (1 - p)); s.draw(g, t, lt); g.restore();
    st = { moving: true, speed: 1 };
  } else {                                                      // hard cut with a punch-in
    const z = 1 + 0.07 * (1 - outCubic(Math.min(1, lt / 0.22)));
    g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
    st = s.draw(g, t, lt) || {};
    g.restore();
    if (lt < 0.07 && i > 0) st = { moving: true, speed: 0.5 };
  }
  K.captions(g, t, { y: 1500, size: 40, weight: 700, family: "Inter Var", color: "#fff", box: "rgba(12,12,12,0.66)",
    boxPad: 18, boxRadius: 12, maxW: 860 });
  K.grain(g, t, 0.07);
  return st;
}
K.run(frame, ["400 40px Anton", "400 40px Bungee", "400 40px 'Instrument Serif'", "700 40px 'Inter Var'", "700 40px Poppins",
  "40px 'WenQuanYi Zen Hei'", "500 30px Mono"]);
})();

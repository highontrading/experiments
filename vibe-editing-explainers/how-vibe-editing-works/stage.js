// How vibe editing works — the desk-catalog design.
// Light paper, a tight grotesk headline, (01)…(05) labels, lime pills, and real objects
// floating like product shots. Every voice line gets its own layout; each change of layout
// has its own transition (shared-element fly, vertical push, zoom-through, swipe, hand-off,
// circle reveal), so the film keeps moving without ever cutting hard.
(function () {
const { C, W, H, clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutQuint, inOutCubic, inOutSine, spring } = K;
const BG = "#f3f3f1", INK = "#151515", LIME = "#cdeb8b", GREY = "#8b8b86", LINE = "rgba(21,21,21,0.18)";
const FONT = "Inter Tight", MONO = "Mono";

// ------------------------------------------------------------ scenes --
const ORDER = ["cover", "brief", "assets", "agent", "render", "notes", "outro"];
const START = { cover: 0, brief: C.s_brief, assets: C.s_assets, agent: C.s_agent, render: C.s_render, notes: C.s_notes, outro: C.s_outro };
const TR = 0.95;   // every transition
function phase(k, t) {        // in/out progress of scene k (eased) and raw
  const i = ORDER.indexOf(k), s = START[k], n = ORDER[i + 1];
  const pin = i === 0 ? 1 : win(s - 0.15, s - 0.15 + TR, t);
  const pout = n ? win(START[n] - 0.15, START[n] - 0.15 + TR, t) : 0;
  return { i: inOutQuint(pin), o: inOutQuint(pout), ri: pin, ro: pout, on: pin > 0 && pout < 1 };
}

// ------------------------------------------------------------ primitives --
function setLS(g, px) { if (g.letterSpacing !== undefined) g.letterSpacing = `${px}px`; }
function head(g, text, x, y, size, o = {}) {     // tight grotesk headline, words rising out of a mask
  K.font(g, size, o.weight || 500, FONT); setLS(g, -size * 0.045);
  g.textBaseline = "alphabetic"; g.textAlign = o.align || "left";
  const p = o.p ?? 1;
  g.save();
  if (p < 1) { const w = g.measureText(text).width; const x0 = o.align === "center" ? x - w / 2 : x; g.beginPath(); g.rect(x0 - 20, y - size * 1.05, w + 40, size * 1.32); g.clip(); }
  g.fillStyle = o.color || INK; g.globalAlpha *= o.a ?? 1;
  g.fillText(text, x, y + size * 1.1 * (1 - outQuint(p)));
  g.restore(); setLS(g, 0);
}
function label(g, text, x, y, size = 32, o = {}) {
  g.save(); K.font(g, size, 400, FONT); g.textAlign = o.align || "left"; g.textBaseline = "middle";
  g.fillStyle = o.color || INK; g.globalAlpha *= o.a ?? 1; g.fillText(text, x, y); g.restore();
}
function pill(g, text, x, y, size = 36, o = {}) {   // the lime outlined pill
  K.font(g, size, 500, FONT); setLS(g, -size * 0.02);
  const tw = g.measureText(text).width, h = size * 1.7, w = tw + size * 1.3;
  const p = o.p ?? 1; if (p <= 0) { setLS(g, 0); return w; }
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
  const s = 0.7 + 0.3 * p; g.scale(s, s); g.globalAlpha *= clamp(p * 2) * (o.a ?? 1);
  const ax = o.align === "left" ? 0 : -w / 2;
  g.fillStyle = o.fill || LIME; K.rr(g, ax, -h / 2, w, h, h / 2); g.fill();
  g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(text, ax + size * 0.65, 2);
  g.restore(); setLS(g, 0);
  return w;
}
// a real object on the paper: soft contact shadow + drop shadow, breathing gently
function item(g, key, x, y, w, rot = 0, o = {}) {
  const im = K.object(key); if (!im) return null;
  const a = o.a ?? 1; if (a <= 0) return null;
  const h = w * im.height / im.width, t = o.t ?? 0;
  const bob = Math.sin(t * 1.1 + x * 0.01) * 5 * (o.float ?? 1);
  g.save(); g.globalAlpha *= a;
  g.translate(x, y + bob);
  // contact shadow on the paper
  g.save(); g.translate(0, h * 0.46 - bob * 0.4); g.scale(1, 0.18);
  const sh = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.5);
  sh.addColorStop(0, `rgba(30,30,25,${0.22 * a})`); sh.addColorStop(1, "rgba(30,30,25,0)");
  g.fillStyle = sh; g.beginPath(); g.arc(0, 0, w * 0.5, 0, 7); g.fill(); g.restore();
  g.rotate(rot * Math.PI / 180);
  g.shadowColor = "rgba(25,25,20,0.22)"; g.shadowBlur = 40; g.shadowOffsetY = 26;
  g.drawImage(im, -w / 2, -h / 2, w, h);
  K.noShadow(g);
  if (o.screen) {   // paint into the device's measured screen
    const S = K.A.objects[key].screen;
    if (S) {
      const L = S.len * w * 0.985, Wd = S.wid * w * 0.97;
      g.translate(-w / 2 + S.cx * w, -h / 2 + S.cy * w);
      g.rotate(S.ang * Math.PI / 180 + (o.portrait ? -Math.PI / 2 : 0));   // the notch end is "up"
      const sw = o.portrait ? Wd : L, shh = o.portrait ? L : Wd;
      g.save(); K.rr(g, -sw / 2, -shh / 2, sw, shh, Math.min(sw, shh) * (o.portrait ? 0.12 : 0.02)); g.clip();
      g.fillStyle = "#0e0e10"; g.fillRect(-sw / 2, -shh / 2, sw, shh);
      o.screen(g, sw, shh);
      const gl = g.createLinearGradient(-sw / 2, -shh / 2, sw / 2, shh / 2);
      gl.addColorStop(0, "rgba(255,255,255,0.10)"); gl.addColorStop(0.5, "rgba(255,255,255,0.0)");
      g.fillStyle = gl; g.fillRect(-sw / 2, -shh / 2, sw, shh);
      g.restore();
    }
  }
  g.restore();
  return { w, h };
}
// a rounded footage frame; `p` reveals it with a mask that opens from the bottom
function clip(g, name, x, y, w, h, t, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return;
  g.save(); g.globalAlpha *= o.a ?? 1;
  const r = o.r ?? 34, rh = h * outQuint(p);
  g.shadowColor = "rgba(25,25,20,0.16)"; g.shadowBlur = 40; g.shadowOffsetY = 20;
  K.rr(g, x, y + h - rh, w, rh, r); g.fillStyle = "#ddd"; g.fill(); K.noShadow(g);
  K.rr(g, x, y + h - rh, w, rh, r); g.clip();
  const im = K.footage(name, (t - (o.at ?? 0)) + (o.ss || 0), o.speed || 1, o.loop);
  const z = 1.08 - 0.08 * outCubic(p);
  K.drawFit(g, im, x, y, w, h, { zoom: z * (o.zoom || 1), fx: o.fx, fy: o.fy });
  g.restore();
}
function circleClip(g, name, cx, cy, r, t, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return;
  g.save(); g.globalAlpha *= o.a ?? 1;
  const rr = r * (0.6 + 0.4 * spring(p)) ;
  g.shadowColor = "rgba(25,25,20,0.18)"; g.shadowBlur = 36; g.shadowOffsetY = 18;
  g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fillStyle = "#ccc"; g.fill(); K.noShadow(g);
  g.save(); g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.clip();
  K.drawFit(g, K.footage(name, (t - (o.at ?? 0)) + (o.ss || 0), 1, true), cx - rr, cy - rr, rr * 2, rr * 2, { fx: o.fx, fy: o.fy, zoom: o.zoom });
  g.restore();
  g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.arc(cx, cy, rr + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * outCubic(p)); g.stroke();
  g.restore();
}
function leader(g, x0, y0, x1, y1, p, dot = true) {     // a thin callout line that draws itself
  if (p <= 0) return;
  g.save(); g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); g.stroke();
  if (dot) { g.fillStyle = INK; g.beginPath(); g.arc(x0, y0, 6 * clamp(p * 3), 0, 7); g.fill(); }
  g.restore();
}
function card(g, x, y, w, h, o = {}) {    // white paper card, ink outline
  g.save(); g.globalAlpha *= o.a ?? 1;
  g.shadowColor = "rgba(25,25,20,0.12)"; g.shadowBlur = 34; g.shadowOffsetY = 16;
  g.fillStyle = o.fill || "#fff"; K.rr(g, x, y, w, h, o.r ?? 28); g.fill(); K.noShadow(g);
  if (!o.noLine) { g.lineWidth = 2; g.strokeStyle = INK; K.rr(g, x, y, w, h, o.r ?? 28); g.stroke(); }
  g.restore();
}

// ------------------------------------------------------------ background --
const PAPER = K.makeCanvas(540, 960);
(function () {
  const x = PAPER.getContext("2d"), r = K.rnd(5);
  x.fillStyle = BG; x.fillRect(0, 0, 540, 960);
  const id = x.getImageData(0, 0, 540, 960), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  x.putImageData(id, 0, 0);
})();
function background(g) {
  g.drawImage(PAPER, 0, 0, W, H);
  const v = g.createRadialGradient(W / 2, H * 0.42, 200, W / 2, H * 0.5, H * 0.75);
  v.addColorStop(0, "rgba(255,255,255,0.4)"); v.addColorStop(1, "rgba(0,0,0,0.035)");
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------ index bar --
// A thin catalog index across the top: where we are in the machine.
const IDX = ["brief", "assets", "agent", "render", "notes"];
function indexBar(g, t) {
  const a = win(C.s_brief - 0.1, C.s_brief + 0.6, t) * (1 - win(C.s_outro - 0.1, C.s_outro + 0.4, t));
  if (a <= 0) return;
  const xs = IDX.map((_, i) => 104 + i * 218), y = 168;
  // continuous active position, gliding between items
  let k = 0;
  ["brief", "assets", "agent", "render", "notes"].forEach((s, i) => { k = i === 0 ? 0 : lerp(k, i, inOutQuint(win(START[s] - 0.15, START[s] + 0.6, t))); });
  g.save(); g.globalAlpha = a;
  g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(60, y + 40); g.lineTo(W - 60, y + 40); g.stroke();
  const fx = lerp(xs[Math.floor(k)], xs[Math.min(4, Math.ceil(k))], k - Math.floor(k));
  g.fillStyle = LIME; K.rr(g, fx - 92, y - 26, 184, 52, 26); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  IDX.forEach((n, i) => {
    K.font(g, 26, 400, FONT); g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = INK; g.globalAlpha = a * (Math.abs(i - k) < 0.5 ? 1 : 0.45);
    g.fillText(`(0${i + 1}) ${n}`, xs[i], y + 1);
  });
  g.restore();
}

// ------------------------------------------------------------ COVER --
// The catalog cover: five real objects, one headline, one pill.
const COV = {
  notebook: { x: 245, y: 445, w: 330, rot: -10, n: "(01)", lx: 92, ly: 300, at: 0.15 },
  hw_camera: { x: 790, y: 395, w: 420, rot: 4, n: "(02)", lx: 640, ly: 540, at: 0.3 },
  hw_laptop: { x: 545, y: 1285, w: 380, rot: 0, n: "(03)", lx: 330, ly: 1190, at: 0.45 },
  hw_clock: { x: 190, y: 1255, w: 180, rot: -8, n: "(04)", lx: 92, ly: 1090, at: 0.6 },
  phone_rose: { x: 905, y: 1240, w: 250, rot: 8, n: "(05)", lx: 960, ly: 1080, at: 0.75 },
};
function cover(g, t, o = {}) {   // o.mini: draw the finished cover (for a screen), o.out: leaving progress
  const out = o.out ?? 0, tt = o.mini ? 99 : t;
  for (const [k, c] of Object.entries(COV)) {
    if (o.skip === k) continue;
    const p = spring(win(c.at, c.at + 1.0, tt));
    if (p <= 0) continue;
    // leaving: everything drifts away from the centre and fades, a touch of scale
    const dx = (c.x - W / 2) * 0.9 * out, dy = (c.y - H * 0.45) * 0.9 * out;
    item(g, k, c.x + dx, c.y + dy + 60 * (1 - p), c.w * (0.85 + 0.15 * p) * (1 + 0.15 * out), c.rot + (1 - p) * 8, { a: clamp(p * 2) * (1 - clamp(out * 1.8)), t, float: o.mini ? 0 : 1,
      screen: k === "phone_rose" && !o.mini ? (g2, w, h) => { g2.fillStyle = LIME; g2.fillRect(-w / 2, -h / 2, w, h); } : null, portrait: true });
    label(g, c.n, c.lx + dx, c.ly + dy, 32, { a: clamp((tt - c.at - 0.3) * 3) * (1 - out) });
  }
  const hp = (s) => win(s, s + 0.7, tt);
  const hy = 820 - 120 * out;
  g.save(); g.globalAlpha = 1 - clamp(out * 2.2);
  head(g, o.l1 || "How vibe", W / 2, hy, 150, { align: "center", p: hp(0.35) });
  head(g, o.l2 || "editing works", W / 2, hy + 150, 150, { align: "center", p: hp(0.5) });
  pill(g, o.pill || "what's inside the machine", W / 2, hy + 250, 38, { p: spring(win(1.0, 1.8, tt)) });
  g.restore();
}

// ------------------------------------------------------------ BRIEF --
const BRIEF_TXT = "A 45-second explainer. Calm and clear. Clean catalog look, lime accents.";
const NB = { x: 300, y: 690, w: 440, rot: -6 };
function brief(g, t, P) {
  const push = -1100 * P.o;           // leaves with a vertical push
  g.save(); g.translate(0, push); g.globalAlpha = 1 - 0.6 * P.o;
  label(g, "(01)", 84, 290, 34, { a: win(C.brief_one - 0.4, C.brief_one, t) });
  head(g, "The brief", 80, 430, 140, { p: win(C.brief_one - 0.2, C.brief_one + 0.5, t) });
  // the notebook: shared element, flies here from the cover
  const f = P.i;
  const c = COV.notebook;
  item(g, "notebook", lerp(c.x, NB.x, f), lerp(c.y, NB.y, f), lerp(c.w, NB.w, f), lerp(c.rot, NB.rot, f), { t });
  // pencil rolls in when we "write"
  const pp = outQuint(win(C.brief_write - 0.3, C.brief_write + 0.6, t));
  if (pp > 0) item(g, "pencil", 420 + 500 * (1 - pp), 840, 420, -34 + 20 * (1 - pp), { a: pp, t, float: 0.4 });
  // footage of hands typing the brief
  clip(g, "typing", 610, 500, 390, 440, t, { p: win(C.brief_one, C.brief_one + 0.8, t), at: C.brief_one, fx: 0.55 });
  label(g, "typing the brief · real footage", 620, 970, 24, { color: GREY, a: win(C.brief_one + 0.5, C.brief_one + 1, t) });
  // the prompt card types itself
  const cp = spring(win(C.brief_write - 0.5, C.brief_write + 0.4, t));
  if (cp > 0) {
    g.save(); g.translate(0, 60 * (1 - cp)); g.globalAlpha *= clamp(cp * 2);
    card(g, 80, 1010, 920, 250);
    pill(g, "prompt", 120, 1062, 26, { align: "left" });
    K.font(g, 40, 500, FONT); g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "top";
    const typed = K.typed(BRIEF_TXT, t, C.brief_write, 31);
    const lines = K.wrap(g, BRIEF_TXT, 840);
    let n = typed.length, y = 1110, pos = {};
    lines.forEach((ln) => {
      const s = ln.slice(0, Math.max(0, n)); n -= ln.length + 1;
      g.fillText(s, 120, y);
      for (const key of ["45-second", "Calm and clear", "catalog look"]) {
        const i = ln.indexOf(key);
        if (i >= 0) pos[key] = [120 + g.measureText(ln.slice(0, i)).width + g.measureText(key).width / 2, y + 48];
      }
      y += 54;
    });
    if (typed.length < BRIEF_TXT.length && Math.floor(t * 2.4) % 2 === 0) { /* caret */ }
    g.restore();
    // length · mood · look
    [["length", "45-second", C.brief_length, 230], ["mood", "Calm and clear", C.brief_mood, 540], ["look", "catalog look", C.brief_look, 850]].forEach(([nm, key, at, px]) => {
      const lp = win(at - 0.1, at + 0.45, t);
      if (!pos[key] || lp <= 0) return;
      leader(g, pos[key][0], pos[key][1] + 60 * (1 - cp), px, 1356, outCubic(lp));
      pill(g, nm, px, 1385, 34, { p: spring(win(at, at + 0.7, t)), rot: nm === "mood" ? -3 : 3 });
    });
  }
  g.restore();
}

// ------------------------------------------------------------ ASSETS --
const FOLD = { x: 540, y: 1000, w: 560, h: 360 };
function folder(g, p, t) {
  const { x, y, w, h } = FOLD;
  g.save(); g.translate(x, y); const s = 0.8 + 0.2 * spring(p); g.scale(s, s); g.globalAlpha *= clamp(p * 2);
  g.shadowColor = "rgba(25,25,20,0.14)"; g.shadowBlur = 40; g.shadowOffsetY = 20;
  g.fillStyle = "#e4e4df";
  g.beginPath(); g.moveTo(-w / 2, -h / 2 + 26); g.lineTo(-w / 2, -h / 2 - 34 + 26); g.arcTo(-w / 2, -h / 2 - 34, -w / 2 + 20, -h / 2 - 34, 20);
  g.lineTo(-w / 2 + 190, -h / 2 - 34); g.lineTo(-w / 2 + 230, -h / 2); g.lineTo(w / 2 - 26, -h / 2); g.arcTo(w / 2, -h / 2, w / 2, -h / 2 + 26, 26);
  g.lineTo(w / 2, h / 2 - 26); g.arcTo(w / 2, h / 2, w / 2 - 26, h / 2, 26); g.lineTo(-w / 2 + 26, h / 2); g.arcTo(-w / 2, h / 2, -w / 2, h / 2 - 26, 26); g.closePath();
  g.fill(); K.noShadow(g); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
  K.font(g, 30, 500, FONT); g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("project/", -w / 2 + 30, -h / 2 - 8);
  g.restore();
}
function assets(g, t, P) {
  // enters from below (push); leaves by zooming through the folder
  const zin = (1 - P.i) * 1100, z = 1 + 2.6 * inCubic(P.ro), fa = 1 - P.o;
  g.save(); g.translate(0, zin);
  g.translate(FOLD.x, FOLD.y); g.scale(z, z); g.translate(-FOLD.x, -FOLD.y); g.globalAlpha = fa;
  label(g, "(02)", 84, 290, 34);
  head(g, "The assets", 80, 430, 140, { p: win(C.assets_two - 0.3, C.assets_two + 0.4, t) });
  const fp = win(C.assets_two + 0.1, C.assets_two + 1.0, t);
  folder(g, fp, t);
  // three real assets, exploded around the folder, then tucked in
  const tuck = (i) => inOutCubic(win(C.assets_real - 0.1 + i * 0.18, C.assets_real + 0.75 + i * 0.18, t));
  const tk = [0, 1, 2].map(tuck);
  const at = [C.assets_footage, C.assets_music, C.assets_voiceover];
  const spots = [[285, 640], [810, 650], [830, 1330]];
  const dest = [FOLD.x - 150, FOLD.y + 20];
  const sp = at.map((a) => spring(win(a - 0.35, a + 0.6, t)));
  // (a) footage: the real camera
  if (sp[0] > 0) {
    const x = lerp(spots[0][0], dest[0], tk[0]), y = lerp(spots[0][1], dest[1], tk[0]);
    leader(g, 300, 760, 360, 830, outCubic(win(at[0], at[0] + 0.4, t)) * (1 - tk[0]));
    item(g, "hw_camera", x, y, 400 * (1 - 0.7 * tk[0]), -5, { a: clamp(sp[0] * 2) * (1 - tk[0] * 0.9), t });
    label(g, "(a) footage", 110, 540, 30, { a: sp[0] * (1 - tk[0]) });
  }
  // (b) music, (c) voiceover: real footage in round frames
  if (sp[1] > 0) {
    const x = lerp(spots[1][0], dest[0] + 150, tk[1]), y = lerp(spots[1][1], dest[1], tk[1]);
    circleClip(g, "hw_listening", x, y, 135 * (1 - 0.75 * tk[1]), t, { p: sp[1], a: 1 - 0.9 * tk[1], at: at[1], fx: 0.62, zoom: 1.2 });
    label(g, "(b) music", 810, 470, 30, { a: sp[1] * (1 - tk[1]), align: "center" });
    leader(g, 740, 770, 700, 830, outCubic(win(at[1], at[1] + 0.4, t)) * (1 - tk[1]));
  }
  if (sp[2] > 0) {
    const x = lerp(spots[2][0], dest[0] + 300, tk[2]), y = lerp(spots[2][1], dest[1], tk[2]);
    // a ring of our own voiceover waveform around the speaker
    waveRing(g, x, y, 130 * (1 - 0.75 * tk[2]), t, sp[2] * (1 - tk[2]));
    circleClip(g, "hw_podcast", x, y, 115 * (1 - 0.75 * tk[2]), t, { p: sp[2], a: 1 - 0.9 * tk[2], at: at[2], fx: 0.35, zoom: 1.25 });
    label(g, "(c) voiceover", 830, 1135, 30, { a: sp[2] * (1 - tk[2]), align: "center" });
  }
  // the folder's contents
  const rows = [["footage_01.mp4", "48 MB"], ["music.mp3", "4 MB"], ["voiceover.mp3", "1 MB"]];
  rows.forEach((r, i) => {
    const rp = outQuint(win(C.assets_real + 0.4 + i * 0.18, C.assets_real + 1.0 + i * 0.18, t));
    if (rp <= 0) return;
    const y = FOLD.y - 90 + i * 70;
    g.save(); g.globalAlpha *= rp; g.translate(20 * (1 - rp), 0);
    K.font(g, 28, 500, MONO); g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(r[0], FOLD.x - 230, y);
    g.fillStyle = GREY; g.textAlign = "right"; g.fillText(r[1], FOLD.x + 230, y);
    g.strokeStyle = LINE; g.lineWidth = 1.5; g.beginPath(); g.moveTo(FOLD.x - 230, y + 34); g.lineTo(FOLD.x + 230, y + 34); g.stroke();
    g.restore();
  });
  pill(g, "1 folder, real files", FOLD.x, FOLD.y + 250, 34, { p: spring(win(C.assets_folder - 0.1, C.assets_folder + 0.7, t)) });
  g.restore();
}
// our real voiceover amplitude, sampled once from the mix envelope baked into timeline words
function waveRing(g, x, y, r, t, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.strokeStyle = INK; g.lineWidth = 3; g.lineCap = "round";
  const n = 72;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    const v = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + t * 6) * Math.sin(i * 0.43 + t * 2.3));
    const l = 10 + 26 * v;
    g.beginPath(); g.moveTo(x + Math.cos(ang) * (r + 18), y + Math.sin(ang) * (r + 18));
    g.lineTo(x + Math.cos(ang) * (r + 18 + l), y + Math.sin(ang) * (r + 18 + l)); g.stroke();
  }
  g.restore();
}

// ------------------------------------------------------------ AGENT --
// real lines from this file: what the agent wrote for this very scene
const CODE = [
  "// the agent's edit, as code",
  "clip(g, \"typing\", 610, 500, 390, 440, t)",
  "item(g, \"notebook\", 300, 690, 440, -6)",
  "pill(g, \"mood\", 540, 1385, 34)",
  "K.captions(g, t, { hi: LIME })",
  "m.lay(C.brief_mood, 540)",
  "folder(g, fp, t)",
];
const HL = { 1: "agent_cut", 4: "agent_caption", 5: "agent_sound" };
function agent(g, t, P) {
  const zin = 0.82 + 0.18 * P.i, sx = -1150 * P.o;    // enters scaling up out of the folder; leaves as a swipe left
  g.save(); g.globalAlpha = clamp(P.ri * 1.6);
  g.translate(sx, 0);
  g.translate(W / 2, 900); g.scale(zin, zin); g.translate(-W / 2, -900);
  label(g, "(03)", 84, 290, 34);
  head(g, "The agent", 80, 430, 140, { p: win(C.agent_three - 0.3, C.agent_three + 0.4, t) });
  clip(g, "hw_dev", 80, 490, 920, 420, t, { p: win(C.agent_three, C.agent_three + 0.9, t), at: C.agent_three, fy: 0.45 });
  label(g, "reading the brief, looking at the files", 96, 950, 24, { color: GREY, a: win(C.agent_reads, C.agent_reads + 0.5, t) });
  // the laptop: its screen shows what the agent is doing
  const lp = spring(win(C.agent_three + 0.4, C.agent_three + 1.4, t));
  item(g, "hw_laptop", 540, 1205, 740, 0, { a: clamp(lp * 2), t, float: 0.5, screen: (g2, w, h) => laptopScreen(g2, w, h, t) });
  // cut · caption · sound: each becomes a highlighted line
  [["cut", C.agent_cut, 1040], ["caption", C.agent_caption, 1120], ["sound", C.agent_sound, 1200]].forEach(([n, at, y]) => {
    pill(g, n, 975, y, 28, { p: spring(win(at, at + 0.7, t)), rot: 4 });
  });
  pill(g, "1 decision = 1 line", 540, 1440 - 20, 30, { p: spring(win(C.agent_line, C.agent_line + 0.7, t)), fill: "#fff" });
  g.restore();
}
function laptopScreen(g, w, h, t) {
  g.save(); g.translate(-w / 2, -h / 2);
  g.fillStyle = "#151515"; g.fillRect(0, 0, w, h);
  const fs = 21, lh = fs * 1.5;
  K.font(g, fs, 500, MONO); g.textAlign = "left"; g.textBaseline = "top";
  if (t < C.agent_writes - 0.2) {
    // reading: the brief, then the files
    g.fillStyle = "rgba(255,255,255,0.45)"; g.fillText("> reading brief.txt", 22, 20);
    g.fillStyle = "#e9e9e4"; K.wrap(g, BRIEF_TXT, w - 50).forEach((ln, i) => g.fillText(K.typed(ln, t, C.agent_reads - 0.6 + i * 0.5, 60), 22, 20 + lh * (i + 1.4)));
    if (t > C.agent_looks - 0.2) {
      g.fillStyle = "rgba(255,255,255,0.45)"; g.fillText("> ls project/", 22, 20 + lh * 5);
      ["footage_01.mp4", "music.mp3", "voiceover.mp3"].forEach((f, i) => { g.fillStyle = LIME; g.fillText(K.typed(f, t, C.agent_looks + i * 0.15, 60), 22, 20 + lh * (6 + i)); });
    }
  } else {
    let shown = Math.floor((t - C.agent_writes) * 55);
    CODE.forEach((ln, i) => {
      const y = 18 + i * lh * 1.08;
      const hk = HL[i]; const hp = hk ? outCubic(win(C[hk], C[hk] + 0.35, t)) : 0;
      if (hp > 0) { g.fillStyle = `rgba(205,235,139,${0.3 * hp})`; g.fillRect(10, y - 4, (w - 20) * hp, lh); }
      const vis = ln.slice(0, Math.max(0, shown)); shown -= ln.length + 1;
      g.fillStyle = i === 0 ? "rgba(255,255,255,0.4)" : hp > 0 ? LIME : "#e9e9e4";
      g.fillText(vis, 22, y);
    });
  }
  g.restore();
}

// ------------------------------------------------------------ RENDER --
const STRIP = ["typing", "hw_dev", "hw_filming", "timeline", "hw_coffee", "hw_listening", "hw_editscreen", "hw_podcast", "typing", "hw_dev"];
const VID = { x: 540, y: 1100, w: 640, h: 360 };
function render(g, t, P) {
  const sx = 1150 * (1 - P.i);       // swipes in from the right
  g.save(); g.translate(sx, 0); g.globalAlpha = 1 - P.o;
  label(g, "(04)", 84, 290, 34);
  head(g, "The render", 80, 430, 140, { p: win(C.render_four - 0.3, C.render_four + 0.4, t) });
  // 30 frames a second
  const np = win(C.render_thirty - 0.1, C.render_thirty + 0.5, t);
  if (np > 0) {
    const n = Math.max(1, Math.round(30 * outCubic(np)));
    head(g, String(n).padStart(2, "0"), 70, 870, 400, { p: win(C.render_thirty - 0.15, C.render_thirty + 0.35, t), weight: 500 });
    pill(g, "frames / second", 760, 560, 34, { p: spring(win(C.render_thirty + 0.2, C.render_thirty + 0.9, t)) });
  }
  item(g, "hw_clock", 820, 780, 220, 8, { a: clamp(spring(win(C.render_frame - 0.2, C.render_frame + 0.7, t)) * 2), t });
  // the film strip: frames of real footage scrolling past, then stitched into one video
  const sp = win(C.render_four + 0.4, C.render_four + 1.3, t);
  const st = inOutCubic(win(C.render_stitches - 0.1, C.render_stitches + 0.9, t));
  if (sp > 0 && st < 1) {
    const y0 = 1000, hh = 210, fw = 300, scroll = (t - C.render_four) * 220;
    g.save(); g.globalAlpha *= outCubic(sp) * (1 - st);
    const sh = hh * (1 - 0.4 * st);
    g.fillStyle = "#151515"; g.fillRect(-40, y0 + (hh - sh) / 2, W + 80, sh);
    for (let i = 0; i < 12; i++) {
      let x = ((i * (fw + 18) - scroll) % ((fw + 18) * 10) + (fw + 18) * 10) % ((fw + 18) * 10) - fw;
      x = lerp(x, VID.x - fw / 2, st);
      const im = K.footage(STRIP[i % STRIP.length], 1 + i * 0.4, 1);
      g.save(); K.rr(g, x, y0 + 30, fw, hh - 60, 6); g.clip(); K.drawFit(g, im, x, y0 + 30, fw, hh - 60); g.restore();
    }
    g.fillStyle = "#f1f1ee";        // sprocket holes
    for (let x = -((t * 220) % 40); x < W; x += 40) { g.fillRect(x, y0 + 9, 18, 12); g.fillRect(x, y0 + hh - 21, 18, 12); }
    g.restore();
    const total = Math.round(K.TL.dur * 30);
    const fr = Math.min(total, Math.floor(lerp(1, total, win(C.render_four + 0.4, C.render_stitches, t))));
    label(g, `frame ${String(fr).padStart(4, "0")} / ${total}`, 84, 1270, 30, { a: outCubic(sp) * (1 - st) });
    label(g, "1080 × 1920 · 30 fps", 996, 1270, 30, { a: outCubic(sp) * (1 - st), align: "right", color: GREY });
  }
  // stitched: one video card
  const vp = spring(win(C.render_stitches + 0.4, C.render_stitches + 1.3, t));
  if (vp > 0 && P.ro < 0.5) videoCard(g, t, vp);
  g.restore();
}
function videoCard(g, t, vp, a = 1) {
  const { x, y, w, h } = VID;
  g.save(); g.globalAlpha *= clamp(vp * 2) * a; g.translate(x, y); const s = 0.85 + 0.15 * vp; g.scale(s, s);
  g.shadowColor = "rgba(25,25,20,0.2)"; g.shadowBlur = 40; g.shadowOffsetY = 20;
  K.rr(g, -w / 2, -h / 2, w, h, 26); g.fillStyle = "#222"; g.fill(); K.noShadow(g);
  g.save(); K.rr(g, -w / 2, -h / 2, w, h, 26); g.clip();
  K.drawFit(g, K.footage("hw_filming", t - C.render_stitches, 1, true), -w / 2, -h / 2, w, h);
  g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(-w / 2, -h / 2, w, h);
  g.restore();
  g.fillStyle = "rgba(255,255,255,0.92)"; g.beginPath(); g.arc(0, 0, 48, 0, 7); g.fill();
  g.fillStyle = INK; g.beginPath(); g.moveTo(-14, -20); g.lineTo(22, 0); g.lineTo(-14, 20); g.closePath(); g.fill();
  g.restore();
  label(g, "how-vibe-editing-works.mp4", x, y + h / 2 + 50, 30, { align: "center", a: clamp(vp * 2) * a });
}

// ------------------------------------------------------------ NOTES --
const PH = { x: 540, y: 820, w: 600, rot: 46.5 };   // rot stands the phone upright
function notes(g, t, P) {
  g.save();
  // the rendered video hands over to the phone: the card fades out where the phone fades in
  const hand = P.i;
  if (hand < 1) { g.save(); g.globalAlpha = 1 - hand; videoCard(g, C.s_notes, 1); g.restore(); }
  label(g, "(05)", 84, 290, 34, { a: hand });
  head(g, "You.", 80, 430, 140, { p: win(C.notes_you - 0.3, C.notes_you + 0.4, t) });
  const ps = 1.25 - 0.25 * hand;
  item(g, "phone_rose", PH.x, PH.y, PH.w * ps, PH.rot, { a: hand, t, portrait: true, screen: (g2, w, h) => phoneScreen(g2, w, h, t) });
  item(g, "pencil", 260, 1300, 430, 24, { a: outQuint(win(C.notes_notes - 0.3, C.notes_notes + 0.5, t)), t, float: 0.3 });
  // notes on the cut, stuck around the phone
  [["slower start", 790, 560, -4, 0], ["bigger captions", 260, 700, 3, 0.25], ["warmer music", 830, 1150, -3, 0.5]].forEach(([n, x, y, r, d]) => {
    const at = C.notes_notes + d;
    leader(g, x + (x < 540 ? 120 : -120), y + 20, PH.x + (x < 540 ? -120 : 120), y + (y < 900 ? 120 : -100), outCubic(win(at, at + 0.5, t)));
    pill(g, n, x, y, 34, { p: spring(win(at, at + 0.8, t)), rot: r, fill: "#fff" });
  });
  // the agent rewrites the code
  const dp = spring(win(C.notes_rewrites - 0.3, C.notes_rewrites + 0.6, t));
  if (dp > 0) {
    g.save(); g.translate(0, 50 * (1 - dp)); g.globalAlpha *= clamp(dp * 2);
    card(g, 330, 1225, 670, 205, { fill: "#151515", noLine: true, r: 24 });
    K.font(g, 25, 500, MONO); g.textAlign = "left"; g.textBaseline = "top";
    const L = [["- PACE         = 1.0", "#ff8f7a"], ["+ PACE         = 0.9", LIME], ["- CAPTION_SIZE = 46", "#ff8f7a"], ["+ CAPTION_SIZE = 54", LIME]];
    L.forEach(([s, c], i) => { g.fillStyle = c; g.fillText(K.typed(s, t, C.notes_rewrites + i * 0.22, 70), 360, 1250 + i * 42); });
    g.restore();
  }
  pill(g, "feels right ✓", PH.x, 1080, 38, { p: spring(win(C.notes_right - 0.2, C.notes_right + 0.6, t)) });
  g.restore();
}
function phoneScreen(g, w, h, t) {   // the phone plays this video's own cover
  g.save(); g.fillStyle = BG; g.fillRect(-w / 2, -h / 2, w, h);
  const s = Math.min(w / W, h / H) * 1.02; g.scale(s, s); g.translate(-W / 2, -H / 2);
  cover(g, t, { mini: true });
  g.restore();
}

// ------------------------------------------------------------ OUTRO --
const ROWS = [["Brief", "notebook", "outro_brief"], ["Assets", "hw_camera", "outro_assets"], ["Agent", "hw_laptop", "outro_agent"], ["Render", "hw_clock", "outro_render"], ["Notes", "phone_rose", "outro_notes"]];
const RW = { notebook: 150, hw_camera: 190, hw_laptop: 160, hw_clock: 80, phone_rose: 120 };
function outro(g, t, P) {
  const end = inOutQuint(win(C.outro_that - 0.2, C.outro_that + 0.9, t));
  // index list: one row per part, lit as it's named
  ROWS.forEach(([n, key, cue], i) => {
    const y = 470 + i * 190;
    const rp = outQuint(win(C.s_outro + 0.2 + i * 0.08, C.s_outro + 0.9 + i * 0.08, t));
    const hi = outCubic(win(C[cue] - 0.12, C[cue] + 0.25, t));
    g.save(); g.globalAlpha = rp * (1 - end);
    g.translate(0, 40 * (1 - rp) - 80 * end);
    if (hi > 0) { g.fillStyle = LIME; K.rr(g, 60, y - 82, 960 * hi, 164, 82); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; if (hi > 0.98) { K.rr(g, 60, y - 82, 960, 164, 82); g.stroke(); } }
    label(g, `(0${i + 1})`, 110, y - 4, 32);
    head(g, n, 210, y + 38, 110);
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(60, y + 95); g.lineTo(W - 60, y + 95); g.stroke();
    g.restore();
  });
  // the objects: in the list, then flying back to the cover layout
  ROWS.forEach(([n, key], i) => {
    const y = 470 + i * 190, rp = outQuint(win(C.s_outro + 0.3 + i * 0.08, C.s_outro + 1.0 + i * 0.08, t));
    const c = COV[key];
    const e = inOutQuint(win(C.outro_that - 0.2 + i * 0.06, C.outro_that + 0.8 + i * 0.06, t));
    item(g, key, lerp(890, c.x, e), lerp(y - 80 * 0, c.y, e), lerp(RW[key], c.w, e), lerp(0, c.rot, e), { a: rp, t, float: 0.6 });
    label(g, c.n, c.lx, c.ly, 32, { a: e });
  });
  if (end > 0) {
    head(g, "That's the", W / 2, 860, 150, { align: "center", p: win(C.outro_that - 0.05, C.outro_that + 0.6, t) });
    head(g, "whole machine", W / 2, 1010, 150, { align: "center", p: win(C.outro_machine - 0.25, C.outro_machine + 0.45, t) });
    pill(g, "vibe editing", W / 2, 1110, 38, { p: spring(win(C.outro_machine + 0.4, C.outro_machine + 1.2, t)) });
  }
}

// ------------------------------------------------------------ frame --
const DRAW = { cover: null, brief, assets, agent, render, notes, outro };
function frame(g, t) {
  background(g);
  let speed = 0;
  // cover leaves while the notebook flies (drawn by brief)
  const pc = phase("cover", t);
  if (pc.o < 1) cover(g, t, { out: pc.o, skip: pc.o > 0 ? "notebook" : null });
  for (const k of ORDER.slice(1)) {
    const P = phase(k, t);
    if (!P.on) continue;
    if (k === "outro") {    // circle reveal out of the phone
      const r = Math.hypot(W, H) * inOutCubic(P.ri);
      g.save(); g.beginPath(); g.arc(PH.x, PH.y, Math.max(1, r), 0, 7); g.clip();
      background(g); outro(g, t, P); g.restore();
      if (P.ri < 1) { g.save(); g.strokeStyle = LIME; g.lineWidth = 10; g.beginPath(); g.arc(PH.x, PH.y, Math.max(1, r), 0, 7); g.stroke(); g.restore(); }
    } else DRAW[k](g, t, P);
    if (k === "notes" && P.ri < 1) {} // hand-off is inside notes
    for (const v of [P.ri, P.ro]) if (v > 0 && v < 1) speed = Math.max(speed, Math.sin(Math.PI * v));
  }
  indexBar(g, t);
  K.captions(g, t, { y: 1560, size: 44, weight: 600, family: FONT, color: INK, hi: LIME, hiText: INK, radius: 22 });
  K.grain(g, t, 0.05);
  return { moving: speed > 0.15, speed };
}
K.run(frame, ["500 40px 'Inter Tight'", "400 40px 'Inter Tight'", "600 40px 'Inter Tight'", "500 30px Mono"]);
})();

// Ad kit: print treatments for real cut-outs, paper backgrounds, captions, and the
// shared story pieces every ad uses (prompt, real code, real video proof, CTA + chorus).
(function () {
const { W, H, FPS, clamp, lerp, win, ss, outCubic, inCubic, inOut, outBack, apple, spring, rnd, rr, IMG, cover, footage, layoutWords } = U;
const T = window.T;
const deg = (d) => d * Math.PI / 180;

const FX = {
  anton: (px) => `400 ${px}px Anton`, bebas: (px) => `400 ${px}px BebasNeue`, oswald: (px) => `700 ${px}px Oswald`,
  playfair: (px) => `800 ${px}px Playfair`, grotesk: (px) => `700 ${px}px SpaceGrotesk`, mono: (px) => `500 ${px}px JBMono`,
  marker: (px) => `400 ${px}px PermanentMarker`, rubik: (px, w = 700) => `${w} ${px}px Rubik`, inter: (px, w = 700) => `${w} ${px}px InterL`,
  hand: (px) => `600 ${px}px Caveat`, arch: (px) => `900 ${px}px ArchX9`, baloo: (lang, px, w = 800) => U.F.lang(lang, px, w),
};

// ------------------------------------------------------------ treatments --
// Every cut-out is a real photo. 'bw' = black-and-white print with a halftone screen,
// 'duo' = greyscale washed with a colour, 'color' = as shot (slightly punchier).
const TREAT = {};
function treated(name, mode = "color", tint) {
  const key = name + "|" + mode + "|" + (tint || "");
  if (TREAT[key]) return TREAT[key];
  const im = IMG[name]; if (!im) return null;
  const s = Math.min(1, 1300 / Math.max(im.naturalWidth, im.naturalHeight));
  const w = Math.round(im.naturalWidth * s), h = Math.round(im.naturalHeight * s);
  const k = document.createElement("canvas"); k.width = w; k.height = h;
  const x = k.getContext("2d");
  if (mode === "color") { x.filter = "saturate(1.12) contrast(1.06)"; x.drawImage(im, 0, 0, w, h); return (TREAT[key] = k); }
  x.filter = "grayscale(1) contrast(1.28) brightness(1.04)"; x.drawImage(im, 0, 0, w, h); x.filter = "none";
  if (mode === "bw") {
    // halftone: dots sized by darkness, multiplied over the greyscale image like an old print
    const d = x.getImageData(0, 0, w, h).data, cell = 7;
    const ht = document.createElement("canvas"); ht.width = w; ht.height = h;
    const hx = ht.getContext("2d"); hx.fillStyle = "#fff"; hx.fillRect(0, 0, w, h); hx.fillStyle = "#111";
    for (let y = cell / 2; y < h; y += cell) for (let xx = (Math.floor(y / cell) % 2) * cell / 2; xx < w; xx += cell) {
      const i = (Math.floor(y) * w + Math.floor(xx)) * 4;
      if (d[i + 3] < 40) continue;
      const dark = 1 - d[i] / 255, r = cell * 0.62 * Math.sqrt(dark);
      if (r > 0.3) { hx.beginPath(); hx.arc(xx, y, r, 0, 7); hx.fill(); }
    }
    x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.42; x.drawImage(ht, 0, 0);
  } else if (mode === "duo") {
    x.globalCompositeOperation = "color"; x.fillStyle = tint || "#4aa89a"; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "soft-light"; x.globalAlpha = 0.35; x.fillRect(0, 0, w, h);
  }
  x.globalCompositeOperation = "destination-in"; x.globalAlpha = 1; x.drawImage(im, 0, 0, w, h);
  return (TREAT[key] = k);
}
// Draw a cut-out by its height. ax, ay = anchor inside the image (0..1). Paper-style drop shadow.
function cut(c, name, x, y, h, o = {}) {
  const im = treated(name, o.mode || "color", o.tint);
  if (!im) return null;
  const w = h * im.width / im.height;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale((o.flip ? -1 : 1) * (o.s ?? 1), o.s ?? 1);
  c.globalAlpha *= o.alpha ?? 1;
  if (o.shadow !== false) { c.shadowColor = o.shadowColor || "rgba(30,25,20,.32)"; c.shadowBlur = o.blur ?? 24; c.shadowOffsetX = o.sx ?? 8; c.shadowOffsetY = o.sy ?? 14; }
  c.drawImage(im, -w * (o.ax ?? 0.5), -h * (o.ay ?? 0.5), w, h);
  c.restore();
  return { w, h };
}
// Stop-motion: hold motion on twos (12 steps a second) with a tiny per-step jitter.
const step = (t, fps = 12) => Math.floor(t * fps) / fps;
const jitter = (t, seed, amt = 2.2) => { const r = rnd(seed * 997 + Math.floor(t * 12)); return [(r() - 0.5) * amt, (r() - 0.5) * amt, (r() - 0.5) * amt * 0.004]; };

// ------------------------------------------------------------ backgrounds --
function paper(c, name, fallback, o = {}) {
  c.fillStyle = fallback; c.fillRect(0, 0, W, H);
  const im = IMG[name];
  if (im) {
    c.save(); if (o.filter) c.filter = o.filter; c.globalAlpha = o.alpha ?? 1;
    if (o.blend) c.globalCompositeOperation = o.blend;
    cover(c, im, 0, 0, W, H, 0.5, 0.5, o.z ?? 1); c.restore();
  }
  if (o.tint) { c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = o.tint; c.fillRect(0, 0, W, H); c.restore(); }
}
function grid(c, x, y, w, h, cell = 54, col = "rgba(60,70,90,.22)", lw = 1.6) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
  for (let gx = x + ((-x) % cell + cell) % cell; gx <= x + w; gx += cell) { c.moveTo(gx, y); c.lineTo(gx, y + h); }
  for (let gy = y + ((-y) % cell + cell) % cell; gy <= y + h; gy += cell) { c.moveTo(x, gy); c.lineTo(x + w, gy); }
  c.stroke(); c.restore();
}
// A printed halftone disc (the soft green circles of design system 1).
const HTDISC = {};
function halftoneDisc(c, x, y, r, col, o = {}) {
  const key = r + col + (o.cell || 9);
  if (!HTDISC[key]) {
    const k = document.createElement("canvas"); k.width = k.height = Math.ceil(r * 2 + 4);
    const kx = k.getContext("2d"), cell = o.cell || 9;
    kx.fillStyle = col;
    for (let yy = 0; yy < k.height; yy += cell) for (let xx = (Math.floor(yy / cell) % 2) * cell / 2; xx < k.width; xx += cell) {
      const dd = Math.hypot(xx - r, yy - r) / r; if (dd > 1) continue;
      const rr2 = cell * 0.48 * (dd < 0.75 ? 1 : 1 - (dd - 0.75) / 0.25 * 0.85);
      kx.beginPath(); kx.arc(xx, yy, rr2, 0, 7); kx.fill();
    }
    HTDISC[key] = k;
  }
  c.save(); c.globalAlpha *= o.alpha ?? 1; c.drawImage(HTDISC[key], x - r, y - r); c.restore();
}

// --------------------------------------------------------------- captions --
// The narrator's words in Roman Hinglish, a few at a time, the spoken word highlighted.
function chunks(v) {
  const ws = v.roman.split(" "), out = []; let cur = [];
  ws.forEach((w, i) => {
    cur.push(i);
    const len = cur.map((j) => ws[j]).join(" ").length;
    if (len > 18 || /[.,?!:—…'"]$/.test(w) || i === ws.length - 1) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out.map((ix) => ({ ix, t0: v.words[ix[0]], words: ix.map((j) => ws[j]) }));
}
function captions(c, gt, style) {
  for (const v of T.voices) {
    if (v.role !== "nar") continue;
    const vt = gt - v.at;
    if (vt < -0.05 || vt > v.dur + 0.35) continue;
    const ch = chunks(v);
    let k = 0; ch.forEach((q, i) => { if (vt >= q.t0 - 0.05) k = i; });
    const q = ch[k], since = vt - q.t0;
    const active = q.ix.filter((j) => vt >= v.words[j] - 0.03).length - 1;
    style(c, q.words, Math.max(0, active), since, vt > v.dur + 0.1 ? 1 - win(v.dur + 0.1, v.dur + 0.35, vt) : 1);
  }
}

// ---------------------------------------------------------- story pieces --
// Real code, from the Tamil scene of the multilingual film this channel already made.
const CODE = [
  "SCENES.ta = { sky: true, draw(c, lt, S, gt) {",
  "  const E = editAt(S), clip = \"marina\";",
  "  const big = spring(lt, E, 0.75);",
  "  footage(c, clip, lt * 0.85, 0, 0, W, H);",
  "  // the reel's caption: small, then big and lime",
  "  c.font = F.lang(\"ta\", lerp(54, 230, big), 800);",
  "  c.fillStyle = big > 0.02 ? C.lime : \"#fff\";",
  "  c.fillText(CITY.ta[0], 0, 0);",
  "  voiceBubble(c, V.ta, vt(\"ta\", gt), 540, 640);",
  "} };",
  "const WARM = (k) => `sepia(${0.32 * k})`;",
  "drawLine(c, 1, gt, { fills });   // timeline",
];
function codePanel(c, x, y, w, h, prog, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = o.bg || "#16181d"; rr(c, -w / 2, -h / 2, w, h, 22); c.fill(); c.shadowColor = "transparent";
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(-w / 2 + 32 + i * 26, -h / 2 + 30, 8, 0, 7); c.fill(); });
  c.font = FX.inter(22, 600); c.fillStyle = "rgba(255,255,255,.5)"; c.textAlign = "center"; c.fillText(o.title || "scenes.js", 0, -h / 2 + 38);
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2 + 56, w, h - 56); c.clip();
  const px = o.px || 25, lh = px * 1.55, chars = Math.floor(prog * CODE.join("").length);
  c.font = FX.mono(px); c.textAlign = "left"; c.textBaseline = "middle";
  let used = 0;
  const lines = Math.floor((h - 70) / lh);
  CODE.slice(0, lines).forEach((ln, i) => {
    const show = ln.slice(0, Math.max(0, chars - used)); used += ln.length;
    if (!show) return;
    let xx = -w / 2 + 28; const yy = -h / 2 + 80 + i * lh;
    // light syntax colouring
    show.split(/(\s+|[(){}.,;=`])/).forEach((tok) => {
      c.fillStyle = /^(const|draw|true|false|return)$/.test(tok) ? "#ff7ab2" : /^["'`].*|^\d+(\.\d+)?$/.test(tok) ? "#ffd479"
        : /^\/\//.test(tok) || /\/\//.test(show) && show.indexOf("//") <= show.indexOf(tok) ? "#7d8590" : /^[A-Z]/.test(tok) ? "#7fd1ff" : "#e6e6e6";
      c.fillText(tok, xx, yy); xx += c.measureText(tok).width;
    });
    if (show.length < ln.length && Math.floor(T.fps * prog * 4) % 2 === 0) { c.fillStyle = "#e6e6e6"; c.fillRect(xx + 2, yy - px * 0.6, 3, px * 1.2); }
  });
  c.restore(); c.restore();
}
// A prompt being typed into a chat-style input.
function promptBox(c, x, y, w, text, prog, o = {}) {
  const px = o.px || 40;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.font = FX.inter(px, 600);
  const n = Math.floor(text.length * clamp(prog)), s = text.slice(0, n);
  const L = layoutWords(c, s.split(" ").map((q) => ({ s: q, t0: 0 })), FX.inter(px, 600), w - 120, px * 1.35);
  const h = Math.max(1, L.lines) * px * 1.35 + 60;
  c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 26; c.shadowOffsetY = 12;
  c.fillStyle = o.bg || "#fff"; rr(c, -w / 2, -h / 2, w, h, Math.min(46, h / 2)); c.fill(); c.shadowColor = "transparent";
  c.fillStyle = o.color || "#111"; c.textAlign = "left"; c.textBaseline = "middle";
  const rows = {}; L.items.forEach((it) => (rows[it.y] = rows[it.y] || []).push(it.s));
  Object.keys(rows).forEach((k, i) => c.fillText(rows[k].join(" "), -w / 2 + 36, -h / 2 + 30 + px * 0.68 + i * px * 1.35));
  // send button
  c.fillStyle = prog >= 1 ? (o.accent || "#2152d9") : "rgba(0,0,0,.18)"; c.beginPath(); c.arc(w / 2 - 50, 0, 30, 0, 7); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = 6; c.lineCap = c.lineJoin = "round";
  c.beginPath(); c.moveTo(w / 2 - 50, 13); c.lineTo(w / 2 - 50, -13); c.moveTo(w / 2 - 61, -2); c.lineTo(w / 2 - 50, -13); c.lineTo(w / 2 - 39, -2); c.stroke();
  c.restore();
  return h;
}
// A phone showing real footage (a clip, or the finished multilingual reel).
function phone(c, x, y, h, rot, body, o = {}) {
  const w = h * 0.5;
  c.save(); c.translate(x, y); c.rotate(rot);
  c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 40; c.shadowOffsetY = 20;
  c.fillStyle = o.body || "#111"; rr(c, -w / 2, -h / 2, w, h, w * 0.16); c.fill(); c.shadowColor = "transparent";
  c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 3; rr(c, -w / 2 + 2, -h / 2 + 2, w - 4, h - 4, w * 0.155); c.stroke();
  const b = w * 0.045;
  c.save(); rr(c, -w / 2 + b, -h / 2 + b, w - 2 * b, h - 2 * b, w * 0.12); c.clip();
  c.translate(-w / 2 + b, -h / 2 + b); body(c, w - 2 * b, h - 2 * b); c.restore();
  c.fillStyle = "#000"; rr(c, -w * 0.14, -h / 2 + b + 12, w * 0.28, 30, 15); c.fill();   // camera island
  c.restore();
}
// The multilingual reel this channel already made with vibe editing: real proof.
const reel = (cc, w, h, t) => footage(cc, "bharat_reel", 0.2 + t, 0, 0, w, h, { mode: "loop", z: 1.06, fy: 0.45 });

// ------------------------------------------------------------- CTA + chorus --
const CHORUS_TXT = { bn: "Vibe Editing-এ join করুন!", ta: "Vibe Editing-ல join பண்ணுங்க!", te: "Vibe Editing లో join అవ్వండి!",
  mr: "Vibe Editing मध्ये join व्हा!", gu: "Vibe Editing માં join થાઓ!", kn: "Vibe Editing ಗೆ join ಆಗಿ!", ml: "Vibe Editing-ൽ join ചെയ്യൂ!", pa: "Vibe Editing ਨਾਲ join ਕਰੋ!" };
// pills for each chorus voice as it speaks; positions from the ad
function chorusPills(c, gt, spots, o = {}) {
  T.voices.filter((v) => v.role === "chorus").forEach((v, i) => {
    const e = spring(gt, v.at - 0.05, 0.5);
    if (e <= 0) return;
    const [x, y, r] = spots[i % spots.length];
    const lang = v.lang, txt = CHORUS_TXT[lang];
    c.save(); c.translate(x, y); c.rotate(deg(r)); c.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e); c.globalAlpha = clamp(e * 2);
    c.font = FX.baloo(lang, o.px || 44, 800);
    const w = c.measureText(txt).width + 60, h = (o.px || 44) * 1.9;
    c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 22; c.shadowOffsetY = 10;
    c.fillStyle = o.bg ? o.bg(i) : "#fff"; rr(c, -w / 2, -h / 2, w, h, h / 2); c.fill(); c.shadowColor = "transparent";
    c.fillStyle = o.fg ? o.fg(i) : "#111"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, 0, 6);
    c.restore();
  });
}
// The join button: pulses on the beat of the voice
function joinButton(c, x, y, gt, at, o = {}) {
  const e = spring(gt, at, 0.6);
  if (e <= 0) return;
  const pulse = 1 + 0.035 * Math.max(0, Math.sin((gt - at) * 6));
  const w = o.w || 720, h = o.h || 136;
  c.save(); c.translate(x, y); c.scale(e * pulse, e * pulse);
  c.shadowColor = o.shadow || "rgba(0,0,0,.35)"; c.shadowBlur = 36; c.shadowOffsetY = 16;
  c.fillStyle = o.bg || "#111"; rr(c, -w / 2, -h / 2, w, h, h / 2); c.fill(); c.shadowColor = "transparent";
  c.fillStyle = o.fg || "#fff"; c.font = o.font || FX.arch(50); c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(o.text || "JOIN VIBE EDITING  →", 0, 4);
  c.restore();
}

// timing: a voice line's start, and its n-th word, in a scene's local time
const VO = Object.fromEntries(T.voices.map((v) => [v.id, v]));
const at = (id, S) => VO[id].at - S.start;
const wd = (id, n, S) => VO[id].at - S.start + VO[id].words[Math.min(n, VO[id].words.length - 1)];
const endOf = (id, S) => VO[id].at - S.start + VO[id].dur;
// big poster word that stamps in (scale from large) and optionally leaves
function stampWord(c, s, x, y, font, color, t0, lt, o = {}) {
  const e = win(t0, t0 + (o.dur || 0.22), lt), out = o.out != null ? ss(o.out, o.out + 0.25, lt) : 0;
  if (e <= 0 || out >= 1) return;
  const k = lerp(o.from || 1.8, 1, outCubic(e));
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(k, k); c.globalAlpha *= clamp(e * 3) * (1 - out);
  c.font = font; c.fillStyle = color; c.textAlign = o.align || "center"; c.textBaseline = "alphabetic";
  if (o.stroke) { c.lineJoin = "round"; c.lineWidth = o.strokeW || 10; c.strokeStyle = o.stroke; c.strokeText(s, 0, 0); }
  if (o.shadow !== false) { c.shadowColor = o.shadowColor || "rgba(0,0,0,.18)"; c.shadowBlur = 10; c.shadowOffsetY = 6; }
  c.fillText(s, 0, 0);
  c.restore();
}
// a labelled tag/box (purple labels, paper tags, sticky notes …)
function tag(c, s, x, y, font, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.s ?? 1, o.s ?? 1); c.globalAlpha *= o.alpha ?? 1;
  c.font = font; const tw = c.measureText(s).width;
  const pad = o.pad ?? 28, h = o.h || 90, w = o.w || tw + pad * 2;
  if (o.shadow !== false) { c.shadowColor = o.shadowColor || "rgba(0,0,0,.25)"; c.shadowBlur = o.blur ?? 20; c.shadowOffsetY = 10; }
  c.fillStyle = o.bg || "#fff"; rr(c, -w / 2, -h / 2, w, h, o.r ?? 8); c.fill(); c.shadowColor = "transparent";
  if (o.border) { c.strokeStyle = o.border; c.lineWidth = o.borderW || 4; c.stroke(); }
  c.fillStyle = o.fg || "#111"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, o.dy ?? 4);
  c.restore();
  return w;
}
// a red lightning bolt (design system 2), drawn as a flat shape
function bolt(c, x, y, s, rot, col = "#e8432e", alpha = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha *= alpha;
  c.fillStyle = col; c.beginPath();
  c.moveTo(-18, -60); c.lineTo(22, -60); c.lineTo(4, -12); c.lineTo(30, -12); c.lineTo(-24, 66); c.lineTo(-6, 6); c.lineTo(-32, 6); c.closePath(); c.fill();
  c.restore();
}

window.K = { deg, FX, VO, at, wd, endOf, stampWord, tag, bolt, treated, cut, step, jitter, paper, grid, halftoneDisc, chunks, captions, CODE, codePanel, promptBox, phone, reel,
  CHORUS_TXT, chorusPills, joinButton };
})();

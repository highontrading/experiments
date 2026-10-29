// Ad 3 · "Ek Video, Poora India" — design system 3: peach paper, stop-motion landmarks in
// B&W and teal duotone, purple label boxes, giant grungy condensed type, halftone patches.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, apple, spring, rnd, rr, IMG, footage, cover } = U;
const { deg, FX, cut, paper, codePanel, promptBox, phone, chorusPills, joinButton, at, wd, stampWord, tag, step, jitter, halftoneDisc } = K;
const PURPLE = "#7678d4", INK = "#262322", PEACH = "#f4dccd", TEAL = "#4fb3a4", RUST = "#c98c6c";

function bg(c, gt) {
  paper(c, "paper_peach", PEACH, { filter: "grayscale(.85) brightness(1.32) contrast(.75)" });
  if (IMG.paper_peach) { c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = "#f6d3c0"; c.fillRect(0, 0, W, H); c.restore(); }
  // halftone patches like the reference
  halftoneDisc(c, 120, 1520, 150, "rgba(201,140,108,.55)", { cell: 8 });
  halftoneDisc(c, 1000, 260, 120, "rgba(201,140,108,.5)", { cell: 8 });
}
// stop-motion helper: time on twos plus a little hand-placed jitter
const sm = (lt, seed) => { const t = step(lt); const j = jitter(lt, seed); return { t, jx: j[0], jy: j[1], jr: j[2] }; };
// a purple label box with white condensed type (the STOP MOTION label)
function plabel(c, s, x, y, px, lt, t0, o = {}) {
  const e = spring(step(lt), t0, 0.35); if (e <= 0) return;
  const j = jitter(lt, x + y);
  tag(c, s, x + j[0], y + j[1], FX.bebas(px), { bg: o.bg || PURPLE, fg: o.fg || "#f4f0ff", h: px * 1.25, r: 0, s: e, rot: (o.rot || 0) + j[2], shadow: false, pad: 30 });
}
// giant grungy word
function grunge(c, s, x, y, px, lt, t0, o = {}) {
  const e = win(step(lt), t0, t0 + 0.17); if (e <= 0) return;
  const out = o.out != null ? ss(o.out, o.out + 0.2, lt) : 0; if (out >= 1) return;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.globalAlpha = (1 - out);
  c.font = FX.anton(px); c.fillStyle = o.col || INK; c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.fillText(s, 0, 0);
  // worn print: scratch the type with peach specks
  const r = rnd(px + s.length); c.globalCompositeOperation = "destination-out"; c.fillStyle = "rgba(0,0,0,.55)";
  const tw = c.measureText(s).width;
  for (let i = 0; i < 160; i++) { const xx = (r() - 0.5) * tw, yy = -r() * px * 0.95; c.fillRect(xx, yy, 2 + r() * 10, 1 + r() * 3); }
  c.restore();
}
const LM = {   // landmark cut-outs: name, treatment
  delhi: ["cut_indiagate", "bw"], agra: ["cut_tajmahal", "duo"], mumbai: ["cut_gateway", "bw"], kolkata: ["cut_howrah", "bw"], taxi: ["cut_taxi", "color"],
  chennai: ["cut_meenakshi", "duo"], hyd: ["cut_charminar", "bw"], jaipur: ["cut_hawamahal", "duo"], amritsar: ["cut_goldentemple", "bw"],
};
function landmark(c, key, x, y, h, lt, t0, o = {}) {
  const e = spring(step(lt), t0, 0.4); if (e <= 0) return;
  const j = jitter(lt, x * 7 + y);
  let [n, mode] = LM[key];
  if (!IMG[n] && key === "chennai") {             // no temple cut-out: a real Marina Beach print stands in
    const k = clamp(e * 2); c.save(); c.globalAlpha = k; c.translate(x + j[0], y + j[1] - h * (o.ay ?? 1) + h / 2); c.rotate(deg(-4) + j[2]);
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 20; c.shadowOffsetY = 10; c.fillStyle = "#fbf8f2"; c.fillRect(-h * 0.42, -h * 0.36, h * 0.84, h * 0.72); c.shadowColor = "transparent";
    footage(c, "marina", lt, -h * 0.39, -h * 0.33, h * 0.78, h * 0.58, {}); c.restore(); return;
  }
  if (!IMG[n]) { const alt = { kolkata: IMG.cut_victoria ? "cut_victoria" : "cut_taxi", jaipur: "cut_tajmahal", amritsar: "cut_gateway" }[key]; if (alt) { n = alt; mode = alt === "cut_taxi" ? "color" : alt === "cut_victoria" ? "bw" : mode; } }
  cut(c, n, x + j[0], y + j[1] + (1 - e) * 60, h * (0.7 + 0.3 * e), { mode, tint: TEAL, rot: (o.rot || 0) + j[2], ay: o.ay ?? 1, alpha: clamp(e * 2) });
}
const SUB = { hi: "भारत का एक दिन", bn: "ভারতের একটি দিন", mr: "भारतातील एक दिवस", te: "భారతదేశంలో ఒక రోజు", ta: "இந்தியாவில் ஒரு நாள்",
  gu: "ભારતનો એક દિવસ", kn: "ಭಾರತದಲ್ಲಿ ಒಂದು ದಿನ", ml: "ഇന്ത്യയിലെ ഒരു ദിവസം", pa: "ਭਾਰਤ ਵਿੱਚ ਇੱਕ ਦਿਨ" };
// the same video, captioned in a given language (a real photo, real caption)
function videoCard(cc, w, h, lang, photo = "marina", t = 0) {
  footage(cc, photo, t, 0, 0, w, h, { fy: 0.5 });
  const g = cc.createLinearGradient(0, h * 0.55, 0, h); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.6)");
  cc.fillStyle = g; cc.fillRect(0, 0, w, h);
  cc.font = FX.baloo(lang, Math.round(w * 0.085)); cc.fillStyle = "#fff"; cc.textAlign = "center"; cc.textBaseline = "middle";
  const s = SUB[lang]; let fs = Math.round(w * 0.085); while (cc.measureText(s).width > w * 0.88 && fs > 10) { fs -= 2; cc.font = FX.baloo(lang, fs); }
  cc.fillText(s, w / 2, h * 0.86);
}

const NAT = { hi: "हिन्दी", ta: "தமிழ்", bn: "বাংলা", te: "తెలుగు", mr: "मराठी", gu: "ગુજરાતી", kn: "ಕನ್ನಡ", ml: "മലയാളം", pa: "ਪੰਜਾਬੀ" };
const S = {};
S.hook = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a3_1", n, Sc);
  // the plane drags a banner across the top
  const px = lerp(1300, -900, step(lt) / 4.2);
  cut(c, "cut_plane", px, 300, 170, { mode: "bw", flip: true });
  if (IMG.cut_plane) { tag(c, "EK VIDEO · SAB BHASHAYEIN", px + 560, 310, FX.bebas(52), { bg: "#e9e4dc", fg: INK, h: 70, r: 4, rot: deg(-2), shadow: false }); }
  plabel(c, "EK VIDEO", 540, 560, 110, lt, 0.05);
  grunge(c, "POORA", 540, 900, 240, lt, w(3));
  grunge(c, "INDIA", 540, 1180, 300, lt, w(4));
  landmark(c, "delhi", 230, 1560, 420, lt, w(2));
  landmark(c, "agra", 850, 1560, 400, lt, w(4));
  landmark(c, "kolkata", 900, 640, 260, lt, w(5), { ay: 0.5 });
  landmark(c, "chennai", 170, 700, 320, lt, w(5) + 0.15, { ay: 0.5 });
} };
S.problem = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a3_2", n, Sc);
  const ROWS = [["EDIT", 5], ["CAPTIONS", 8], ["VOICE", 11]];
  ROWS.forEach(([s, n], r) => {
    const y = 420 + r * 300;
    plabel(c, `PHIR SE ${s}`, 330, y, 76, lt, w(n));
    // a pile of copies, one per language
    const LS = ["hi", "ta", "bn", "te", "mr", "gu", "kn", "ml", "pa"];
    LS.forEach((l, k) => {
      const e = spring(step(lt), w(n) + 0.12 + k * 0.06, 0.3); if (e <= 0) return;
      const j = jitter(lt, r * 31 + k);
      tag(c, NAT[l], 650 + k * 42 + j[0], y + 10 + (k % 2) * 10 + j[1], FX.baloo(l, 30), { bg: k % 2 ? "#fff" : "#efe7dd", fg: INK, h: 76, w: 130, r: 4, rot: deg(-10 + k * 2.5), s: e, blur: 8 });
    });
  });
  grunge(c, "ITNA TIME?", 540, 1270, 180, lt, w(12), { col: INK, rot: deg(-3) });
  stampWord(c, "×9", 940, 560, FX.anton(120), PURPLE, w(6), lt, { shadow: false });
} };
S.oneline = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a3_3", n, Sc);
  const e = spring(lt, 0.05, 0.6);
  const flip = win(w(11) - 0.1, w(11) + 0.25, lt), sx = Math.abs(Math.cos(Math.PI * flip));
  c.save(); c.translate(540, 980); c.scale(Math.max(0.02, sx), 1); c.translate(-540, -980);
  K.handPhone(c, 470, 1180 + (1 - e) * 900, 1500, deg(-2), (cc, pw, ph) => videoCard(cc, pw, ph, flip < 0.5 ? "hi" : "ta", "marina", lt));
  c.restore();
  const ep = spring(lt, w(4) - 0.2, 0.5);
  if (ep > 0) { c.save(); c.globalAlpha = clamp(ep * 2); promptBox(c, 540, 420, 900, "Ise Tamil mein bhi banao.", win(w(5), w(10), lt), { accent: PURPLE, px: 46 }); c.restore(); }
  plabel(c, "HO GAYA!", 820, 1430, 90, lt, w(11) + 0.1, { rot: deg(-4) });
} };
const TOUR = [["delhi", "दिल्ली", "hi", 0, "ghat"], ["chennai", "சென்னை", "ta", 2, "marina"], ["kolkata", "কলকাতা", "bn", 4, "tram"], ["mumbai", "मुंबई", "mr", 6, "local"]];
S.tour = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a3_4", n, Sc);
  let k = -1; TOUR.forEach((s, i) => { if (lt >= w(s[3]) - 0.05) k = i; });
  const grid9 = ss(w(9) - 0.1, w(9) + 0.3, step(lt));
  if (grid9 < 1) {
    c.save(); c.globalAlpha = 1 - grid9;
    // dotted route and the yellow taxi hopping on twos
    c.setLineDash([2, 22]); c.lineCap = "round"; c.lineWidth = 10; c.strokeStyle = RUST;
    c.beginPath(); c.moveTo(160, 1500); c.bezierCurveTo(400, 1300, 700, 1600, 940, 1400); c.stroke(); c.setLineDash([]);
    if (k >= 0) {
      const [key, name, lang, , photo] = TOUR[k];
      landmark(c, key, 540, 900, 640, lt, w(TOUR[k][3]));
      tag(c, name, 540, 330, FX.baloo(lang, 90), { bg: PURPLE, fg: "#fff", h: 140, r: 0, rot: deg(-2) });
      phone(c, 830, 1160, 520, deg(5), (cc, pw, ph) => videoCard(cc, pw, ph, lang, photo, lt));
    }
    const tp = step(lt) / Math.max(1, w(9));
    const u = clamp(tp), tx = lerp(160, 940, u), ty = lerp(1500, 1400, u) - Math.sin(u * Math.PI) * 120;
    cut(c, IMG.cut_taxi ? "cut_taxi" : "cut_tram_2", tx, ty, 150, { ay: 0.8 });
    c.restore();
  }
  if (grid9 > 0) {
    // nine phones: the same video, nine languages
    const LS = ["hi", "ta", "bn", "te", "mr", "gu", "kn", "ml", "pa"], PH = ["ghat", "marina", "tram", "charminar", "local", "kites", "marina", "ghat", "tram"];
    LS.forEach((l, i) => {
      const e = spring(step(lt), w(9) + i * 0.06, 0.35); if (e <= 0) return;
      const x = 200 + (i % 3) * 340, y = 560 + Math.floor(i / 3) * 420;
      c.save(); c.globalAlpha = clamp(e * 2); phone(c, x, y + (1 - e) * 80, 380, deg((i % 2 ? 3 : -3)), (cc, pw, ph) => videoCard(cc, pw, ph, l, PH[i], lt)); c.restore();
    });
    plabel(c, "1 VIDEO · 9 BHASHAYEIN", 540, 1580, 74, lt, w(10));
  }
} };
S.auto = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a3_5", n, Sc);
  plabel(c, "CAPTIONS ✓", 300, 430, 90, lt, w(0), { rot: deg(-3) });
  plabel(c, "VOICE ✓", 760, 600, 90, lt, w(1), { rot: deg(2) });
  plabel(c, "TIMING ✓", 330, 780, 90, lt, w(2), { rot: deg(-2) });
  // a real waveform of this very line, drawn as bars
  const e = ss(w(1), w(1) + 0.4, lt);
  if (e > 0) { c.fillStyle = INK; for (let i = 0; i < 26; i++) { const hh = 20 + 70 * Math.abs(Math.sin(i * 1.7 + step(lt) * 9)) * e; c.fillRect(640 + i * 15, 700 - hh / 2, 9, hh); } }
  const ec = spring(lt, w(4) - 0.2, 0.6);
  if (ec > 0) { c.save(); c.globalAlpha = clamp(ec * 2); codePanel(c, 540, 1230 + (1 - ec) * 300, 900, 480, win(w(4), Sc.dur, lt), { rot: deg(1.5), px: 24 }); c.restore(); }
  grunge(c, "APNE AAP", 540, 1680, 150, lt, w(6), { col: PURPLE });
} };
const RAIN = [["hi", "अ"], ["ta", "த"], ["bn", "ক"], ["te", "తె"], ["gu", "ગ"], ["kn", "ಕ"], ["ml", "മ"], ["pa", "ਪ"], ["mr", "म"], ["en", "A"]];
S.future = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a3_6", n, Sc);
  RAIN.forEach(([l, s], i) => {
    const r = rnd(i + 3), x = 90 + r() * 900, y0 = -150 - r() * 900, sp = 700 + r() * 500, y = y0 + step(lt) * sp;
    c.save(); c.globalAlpha = 0.85; c.font = l === "en" ? FX.anton(120) : FX.baloo(l, 120); c.fillStyle = i % 2 ? PURPLE : INK; c.textAlign = "center";
    c.translate(x, y); c.rotate(deg(-20 + r() * 40)); c.fillText(s, 0, 0); c.restore();
  });
  grunge(c, "EDITING KA", 540, 760, 150, lt, w(0));
  grunge(c, "FUTURE =", 540, 960, 200, lt, w(2));
  plabel(c, "MULTILINGUAL", 540, 1140, 130, lt, w(3));
} };
S.cta = { draw(c, lt, Sc, gt) {
  const w = (n) => wd("a3_7", n, Sc);
  landmark(c, "delhi", 170, 560, 300, lt, 0.05);
  landmark(c, "mumbai", 900, 540, 280, lt, 0.12);
  landmark(c, "agra", 870, 1720, 300, lt, 0.2);
  landmark(c, "chennai", 200, 1740, 320, lt, 0.28);
  plabel(c, "JOIN", 540, 470, 110, lt, w(0));
  grunge(c, "VIBE", 540, 720, 250, lt, w(0) + 0.1);
  grunge(c, "EDITING", 540, 950, 250, lt, w(1));
  joinButton(c, 540, 1130, gt, Sc.start + w(3), { bg: PURPLE, text: "JOIN NOW  →", font: FX.bebas(76), w: 560, h: 130 });
  chorusPills(c, gt, [[300, 1300, -4], [780, 1290, 4], [320, 1440, 3], [770, 1450, -3], [300, 1580, -2], [780, 1590, 3], [540, 1380, 0], [540, 1520, 2]],
    { px: 34, bg: (i) => (i % 2 ? PURPLE : "#fff"), fg: (i) => (i % 2 ? "#fff" : INK) });
} };

function caption(c, ws, active, since, alpha) {
  c.save(); c.globalAlpha = alpha;
  c.font = FX.bebas(76); const sp = c.measureText(" ").width;
  const up = ws.map((s) => s.toUpperCase());
  const widths = up.map((s) => c.measureText(s).width), tot = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  c.translate(540, 1330); c.rotate(deg(-1));
  c.fillStyle = PURPLE; c.fillRect(-tot / 2 - 30, -50, tot + 60, 100);
  let x = -tot / 2;
  up.forEach((s, i) => { c.fillStyle = i === active ? INK : "#f4f0ff"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(s, x, 4); x += widths[i] + sp; });
  c.restore();
}

window.AD = { bg, scenes: S, caption, grain: 0.24,
  trans: { hook: { type: "tear", d: 0.6 }, problem: { type: "whip", d: 0.5 }, oneline: { type: "slide", d: 0.5 }, auto: { type: "up", d: 0.6 }, future: { type: "tear", d: 0.6, horizontal: true } },
  images: ["paper_peach", "cut_victoria", "cut_hand_phone_screenhole", "cut_plane", "cut_indiagate", "cut_tajmahal", "cut_gateway", "cut_howrah", "cut_meenakshi", "cut_charminar", "cut_hawamahal", "cut_goldentemple", "cut_taxi", "cut_tram_2"],
  photos: ["marina", "tram", "kites"] };
})();

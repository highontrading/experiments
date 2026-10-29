// The eleven scenes. Each draws its foreground for local time lt (seconds into
// the scene); scenes marked sky:true are drawn over the shared moving sky.
(function () {
const { W, H, clamp, lerp, win, ss, outCubic, inCubic, inOut, outBack, apple, spring, rnd, rr,
  C, F, IMG, clipFrame, clipDur, cover, footage, sky, grass, rope, drawRope, peg, print, pill, label, microLabel,
  words, voiceBubble } = U;
const T = window.T;
const SC = Object.fromEntries(T.scenes.map((s) => [s.name, s]));
const V = Object.fromEntries(T.voices.map((v) => [v.id, v]));
const LANGS = T.langs.map(([l]) => l);
const CLIPS = Object.fromEntries(T.langs);
const NATIVE = { hi: "हिन्दी", bn: "বাংলা", mr: "मराठी", te: "తెలుగు", ta: "தமிழ்", gu: "ગુજરાતી" };
const CITY = {
  hi: ["वाराणसी", "Varanasi"], bn: ["কলকাতা", "Kolkata"], mr: ["मुंबई", "Mumbai"],
  te: ["హైదరాబాద్", "Hyderabad"], ta: ["சென்னை", "Chennai"], gu: ["અમદાવાદ", "Ahmedabad"],
};
const SUB = {   // "A Day in India", the reel's subtitle, in every language
  hi: "भारत का एक दिन", bn: "ভারতের একটি দিন", mr: "भारतातील एक दिवस", te: "భారతదేశంలో ఒక రోజు",
  ta: "இந்தியாவில் ஒரு நாள்", gu: "ભારતનો એક દિવસ", en: "A Day in India",
};
const ENAME = { hi: "Hindi", bn: "Bangla", mr: "Marathi", te: "Telugu", ta: "Tamil", gu: "Gujarati" };
// local time of a voice line's n-th word, inside its scene
const wordAt = (id, n, scene) => V[id].at - SC[scene].start + words(V[id])[n].t0;
const vt = (id, gt) => gt - V[id].at;
const deg = (d) => d * Math.PI / 180;
// music beats (global seconds), from build/music.js
const BEATS = window.MUSIC ? window.MUSIC.beats : (() => { const m = { bpm: 110, offset: 0.25 }; const p = 60 / m.bpm; const b = []; for (let t = m.offset; t < T.dur + 2; t += p) b.push(t); return b; })();
const beatsIn = (a, b) => BEATS.filter((x) => x >= a && x < b);

// ----------------------------------------------------- the timeline line --
// Six prints on a rope. k = 0: the big "empty timeline" of scene 2; k = 1: the
// small tracker docked at the top for the rest of the film.
function lineGeom(k) {
  const y = lerp(700, 150, k), sag = lerp(70, 14, k);
  const R = rope(lerp(-40, -30, k), y, lerp(1120, 1110, k), y + lerp(10, 0, k), sag);
  const w = lerp(150, 92, k), h = lerp(200, 120, k);
  const slots = LANGS.map((_, i) => {
    const x = lerp(125 + i * 166, 168 + i * 149, k), p = R.atX(x);
    return { x, top: p.y + lerp(16, 9, k), w, h, ang: p.ang * 0.5, ropeY: p.y };
  });
  return { R, slots, w, h, b: lerp(12, 6, k), k };
}
const SLOT = (i) => { const g = lineGeom(1), s = g.slots[i]; return { x: s.x, y: s.top + s.h / 2 + g.b, w: s.w, h: s.h, rot: s.ang, b: g.b }; };
// fills[i]: 0 empty .. 1 filled. lift: slide the whole line up out of frame.
function drawLine(c, k, gt, o = {}) {
  const g = lineGeom(k);
  c.save(); c.translate(0, -(o.lift || 0) * 420); c.globalAlpha = o.alpha ?? 1;
  drawRope(c, g.R, lerp(15, 9, k), o.upto ?? 1);
  g.slots.forEach((s, i) => {
    const drop = o.drop ? o.drop(i) : 1;
    if (drop <= 0) return;
    const lang = LANGS[i], fill = o.fills ? o.fills[i] : 0;
    const wig = o.wiggle ? o.wiggle(i) : 0;
    c.save();
    c.translate(s.x, s.ropeY); c.rotate(s.ang + deg(wig));
    c.translate(0, -(1 - drop) * 300);
    print(c, 0, (s.top - s.ropeY) + s.h / 2 + g.b, s.w, s.h, 0, (cc, w, h) => {
      cc.fillStyle = "#eef1f4"; cc.fillRect(0, 0, w, h);
      if (fill > 0) {
        cc.save(); cc.globalAlpha = fill;
        const im = clipFrame(CLIPS[lang], 2.0);
        cover(cc, im, 0, 0, w, h);
        cc.restore();
      }
      if (fill < 1) {
        cc.save(); cc.globalAlpha = 1 - fill;
        cc.fillStyle = "rgba(11,11,12,.42)"; cc.textAlign = "center"; cc.textBaseline = "middle";
        cc.font = F.lang(lang, lerp(34, 21, k), 700); cc.fillText(NATIVE[lang], w / 2, h / 2 - lerp(8, 4, k));
        cc.font = F.ui(lerp(20, 13, k), 600); cc.fillStyle = "rgba(11,11,12,.3)"; cc.fillText(String(i + 1).padStart(2, "0"), w / 2, h / 2 + lerp(34, 21, k));
        cc.restore();
      }
    }, { border: g.b, bottom: g.b });
    peg(c, 0, 0, deg(-4 + (i % 2) * 7), lerp(0.62, 0.38, k), i % 3);
    c.restore();
  });
  const n = o.fills ? o.fills.filter((f) => f >= 1).length : 0;
  label(c, 34, g.R.y1 - lerp(46, 26, k), "TIMELINE", lerp(30, 20, k), C.lime, "left", F.title(lerp(30, 20, k), 900));
  label(c, W - 34, g.R.y2 - lerp(46, 26, k), `(${n}/6)`, lerp(30, 20, k), C.lime, "right", F.ui(lerp(30, 20, k), 700));
  c.restore();
}
// A hero print flying from its place in the scene into tracker slot i.
function fly(base, i, k) {
  const s = SLOT(i), e = apple(k);
  const arc = Math.sin(Math.PI * e) * -80;
  return { x: lerp(base.x, s.x, e), y: lerp(base.y, s.y, e) + arc, w: lerp(base.w, s.w, e), h: lerp(base.h, s.h, e),
    rot: lerp(base.rot, s.rot, e), b: lerp(base.b ?? 18, s.b, e), hide: k >= 1 };
}
const FLY = (S) => [S.dur - 1.05, S.dur - 0.45];
const flyK = (S, lt) => win(FLY(S)[0], FLY(S)[1], lt);
// draw a footage print at rect r (centre x,y)
function heroPrint(c, clip, ct, r, o = {}) {
  if (r.hide) return;                        // landed: the tracker draws it now
  print(c, r.x, r.y, r.w, r.h, r.rot, (cc, w, h) => {
    footage(cc, clip, ct, 0, 0, w, h, o);
    if (o.after) o.after(cc, w, h);
  }, { border: r.b, bottom: r.b });
}
// two pegs biting the top edge of a print hanging from rope R
function pegsOn(c, R, xs, s = 0.8) {
  xs.forEach((x, i) => { const p = R.atX(x); peg(c, p.x, p.y, p.ang + deg(i ? 5 : -5), s, i); });
}
// a hanging print: rope point -> print centre, swinging a little
function hang(R, x1, x2, h, b, gt, amp = 1.2) {
  const p1 = R.atX(x1), p2 = R.atX(x2);
  const rot = Math.atan2(p2.y - p1.y, p2.x - p1.x) + deg(amp * Math.sin(gt * 1.3));
  const cx = (p1.x + p2.x) / 2, cy = (p1.y + p2.y) / 2 + 14 + h / 2 + b;
  return { x: cx, y: cy, rot };
}

// ------------------------------------------------------------- cloud type --
// Letters made of cloud: soft puffs stamped along the glyphs, textured with a real cloud photo.
const CLOUDTXT = {};
function cloudText(key, lines, font, lh) {
  if (CLOUDTXT[key]) return CLOUDTXT[key];
  const cw = 1080, ch = Math.round(lh * lines.length + 160);
  const m = document.createElement("canvas"); m.width = cw; m.height = ch;
  const mx = m.getContext("2d");
  mx.font = font; mx.fillStyle = "#fff"; mx.textAlign = "center"; mx.textBaseline = "middle";
  lines.forEach((s, i) => mx.fillText(s, cw / 2, 80 + lh * (i + 0.5)));
  const md = mx.getImageData(0, 0, cw, ch).data;
  const o = document.createElement("canvas"); o.width = cw; o.height = ch;
  const ox = o.getContext("2d");
  const r = rnd(42), step = 6;
  for (let y = 0; y < ch; y += step) for (let x = 0; x < cw; x += step) {
    if (md[(y * cw + x) * 4 + 3] < 128) continue;
    const rad = 8 + r() * 14, jx = (r() - 0.5) * 7, jy = (r() - 0.5) * 7;
    const g = ox.createRadialGradient(x + jx, y + jy, 0, x + jx, y + jy, rad);
    g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.55, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ox.fillStyle = g; ox.fillRect(x + jx - rad, y + jy - rad, rad * 2, rad * 2);
  }
  // volume: a blue-grey copy of the puffs, nudged down, darkens each lobe's underside
  const sh = document.createElement("canvas"); sh.width = cw; sh.height = ch;
  const sx = sh.getContext("2d"); sx.drawImage(o, 0, 9); sx.globalCompositeOperation = "source-in"; sx.fillStyle = "rgba(255,255,255,1)"; sx.fillRect(0, 0, cw, ch);
  const inner = document.createElement("canvas"); inner.width = cw; inner.height = ch;
  const ix = inner.getContext("2d"); ix.drawImage(o, 0, 0); ix.globalCompositeOperation = "destination-out"; ix.drawImage(sh, 0, -9);
  ix.globalCompositeOperation = "source-in"; ix.fillStyle = "rgba(132,152,184,.55)"; ix.fillRect(0, 0, cw, ch);
  ox.save(); ox.globalCompositeOperation = "source-atop"; ox.filter = "blur(6px)"; ox.drawImage(inner, 0, 0); ox.restore();
  return (CLOUDTXT[key] = o);
}
function drawCloudText(c, cv, x, y, p, s = 1) {
  if (p <= 0) return;
  c.save(); c.globalAlpha = clamp(p * 1.3);
  c.filter = `blur(${(1 - p) * 26}px)`;
  const z = s * lerp(0.94, 1, outCubic(p));
  c.drawImage(cv, x - cv.width * z / 2, y - cv.height * z / 2, cv.width * z, cv.height * z);
  c.restore();
}

// ================================================================ scenes ==
const SCENES = {};

// 0 · greetings in ten languages, popping into the sky
const GREET = [
  ["g_hi", 330, 470, -4, "Hindi"], ["g_bn", 770, 560, 3, "Bangla"], ["g_ta", 400, 700, 2, "Tamil"],
  ["g_gu", 790, 820, -3, "Gujarati"], ["g_te", 300, 960, -2, "Telugu"], ["g_mr", 730, 1080, 4, "Marathi"],
  ["g_pa", 370, 1210, 3, "Punjabi"], ["g_kn", 780, 1330, -4, "Kannada"], ["g_ml", 330, 1450, -2, "Malayalam"],
  ["g_or", 730, 1560, 3, "Odia"],
];
function greetPill(c, g, t, k, gt, o = {}) {
  const [id, x, y, rot, en] = g, v = V[id];
  const e = spring(t, 0, 0.55);
  if (e <= 0) return;
  const fy = Math.sin(gt * 1.4 + k) * 8;
  c.save(); c.globalAlpha = (o.alpha ?? 1) * clamp(e * 2);
  c.translate(x + (o.dx || 0), y + fy + (o.dy || 0)); c.scale(o.s ?? 1, o.s ?? 1);
  pill(c, 0, 0, v.text.replace("!", ""), F.lang(v.lang, 76, 800), { rot: deg(rot), s: 0.5 + 0.5 * e, h: 120, padX: 46, dy: 8 });
  label(c, 0, 108, en, 28, C.lime, "center", F.ui(28, 700));
  c.restore();
}
SCENES.greet = { sky: true, draw(c, lt, S, gt) {
  GREET.forEach((g, k) => {
    const t = V[g[0]].at - S.start;
    const up = inCubic(win(4.9 + k * 0.05, 5.9, lt));
    greetPill(c, g, lt - t, k, gt, { dy: -up * 900, alpha: 1 - up });
  });
} };

// 1 · "India speaks in hundreds of languages. For years, editing software understood just one."
const MICRO = [
  [70, 420, "बोलो-", "अपनी भाषा में", "hi"], [600, 1240, "বলো-", "নিজের ভাষায়", "bn"], [80, 1450, "பேசு-", "உன் மொழியில்", "ta"],
  [700, 1490, "మాట్లాడు-", "నీ భాషలో", "te"], [720, 410, "બોલો-", "તમારી ભાષામાં", "gu"],
];
SCENES.speaks = { sky: true, draw(c, lt, S, gt) {
  const w = (n) => wordAt("en1", n, "speaks");
  // magenta handwriting, stacked like the poster's "The earth is your playground"
  const hand = [["India", 0], ["speaks", 1], ["in…", 2]];
  const drop = inCubic(win(w(9), w(9) + 0.7, lt));               // "editing": the old world falls away
  c.save(); c.translate(70, 620); c.rotate(deg(-7));
  hand.forEach(([s, n], i) => {
    const e = spring(lt, w(n) - 0.05, 0.5);
    if (e <= 0) return;
    c.save(); c.globalAlpha = clamp(e * 2) * (1 - drop); c.translate(i * 26, i * 150 + drop * 900 * (1 + i * 0.3)); c.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e);
    c.font = F.hand(190); c.fillStyle = C.magenta; c.textBaseline = "alphabetic";
    c.shadowColor = "rgba(120,10,40,.25)"; c.shadowBlur = 10; c.fillText(s, 0, 0);
    c.restore();
  });
  c.restore();
  // the lime number: counts to 121 on "hundreds", then collapses to 1 on "editing"
  const up = ss(w(3) - 0.1, w(5) + 0.2, lt), dn = ss(w(9), w(12) + 0.3, lt);
  const one = dn > 0.8, n = one ? 1 : Math.round(lerp(lerp(1, 121, up), 1, dn / 0.8));
  const e = spring(lt, w(3) - 0.15, 0.6);
  if (e > 0) {
    c.save(); c.translate(one ? 760 : 1010, 1120); c.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e);
    c.font = F.title(one ? 520 : 330); c.fillStyle = C.lime; c.textAlign = "right"; c.textBaseline = "alphabetic";
    c.shadowColor = "rgba(30,60,10,.25)"; c.shadowBlur = 16;
    c.fillText(String(n), 0, 0);
    const nw = c.measureText(String(n)).width;
    c.font = F.title(120); c.textAlign = "left";
    if (one) c.fillText("EN", 6, -330);
    c.restore();
    c.save(); c.globalAlpha = clamp(e) * (1 - dn);
    label(c, 1010, 1180, "languages (Census of India, 2011)", 32, C.lime, "right", F.ui(32, 700));
    c.restore();
    c.save(); c.globalAlpha = dn;
    label(c, 1010, 1180, "language. Just English.", 34, C.lime, "right", F.ui(34, 700));
    c.restore();
  }
  // tiny scattered labels, one per script, like the poster's "Record- the beauty"
  MICRO.forEach(([x, y, a, b, l], i) => {
    const e2 = ss(w(5) + i * 0.12, w(5) + i * 0.12 + 0.4, lt);
    const f = inCubic(win(w(9) + i * 0.06, w(9) + i * 0.06 + 0.8, lt));
    if (e2 <= 0) return;
    c.save(); c.globalAlpha = e2 * (1 - f); c.translate(0, f * 700);
    microLabel(c, x, y, a, b, 34, C.lime);
    c.restore();
  });
  // the English-only editor menu, pegged up on "software"
  drawMenu(c, lt, w(10), gt, 0);
} };
// An English-only editing app menu bar hanging from two pegs.
function drawMenu(c, lt, at, gt, fall) {
  const e = spring(lt, at, 0.7);
  if (e <= 0) return;
  const R = rope(-40, 1330, 1120, 1350, 22);
  c.save(); c.translate(0, (1 - e) * -500);
  drawRope(c, R, 13);
  const P = hang(R, 280, 800, 84, 0, gt, 0.6);
  c.save(); c.translate(P.x, P.y + fall * fall * 1600); c.rotate(P.rot + fall * deg(25));
  c.shadowColor = "rgba(20,35,70,.3)"; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = "#f3f3f5"; rr(c, -380, -48, 760, 96, 14); c.fill(); c.shadowColor = "transparent";
  c.font = F.ui(30, 600); c.fillStyle = "#3a3a40"; c.textBaseline = "middle";
  ["File", "Edit", "View", "Clip", "Sequence", "Help"].reduce((x, s) => { c.fillText(s, x, 2); return x + c.measureText(s).width + 34; }, -340);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(300 + i * 26, 0, 8, 0, 7); c.fill(); });
  c.restore();
  if (fall < 0.05) pegsOn(c, R, [280, 800], 0.6);
  c.restore();
}

// 2 · "Not anymore. Here's an empty timeline. Watch six languages edit one video."
SCENES.empty = { sky: true, draw(c, lt, S, gt) {
  const w = (n) => wordAt("en2", n, "empty");
  // leftovers from scene 1 get knocked away on "Not anymore."
  const pop = win(w(0), w(1) + 0.45, lt);
  if (pop < 1) {
    const s = pop < 0.3 ? lerp(1, 1.15, pop / 0.3) : lerp(1.15, 0, (pop - 0.3) / 0.7);
    c.save(); c.translate(760, 1120); c.scale(s, s); c.rotate(deg(pop * 30));
    c.font = F.title(520); c.fillStyle = C.lime; c.textAlign = "right"; c.fillText("1", 0, 0);
    c.font = F.title(120); c.textAlign = "left"; c.fillText("EN", 6, -330);
    c.restore();
  }
  drawMenu(c, 99, 0, gt, win(w(0), w(1) + 0.6, lt));
  if (lt < 0.2) {                                   // the "1 language" note, fading as the number pops
    c.save(); c.globalAlpha = 1 - win(0, 0.2, lt); label(c, 1010, 1180, "language. Just English.", 34, C.lime, "right", F.ui(34, 700)); c.restore();
  }
  // the empty timeline: a rope with six blank prints, one per language
  const ropeIn = apple(win(w(3) - 0.3, w(3) + 0.5, lt));
  const k = inOut(win(S.dur - 1.3, S.dur - 0.15, lt));
  if (ropeIn > 0) {
    drawLine(c, k, gt, {
      upto: ropeIn,
      drop: (i) => spring(lt, w(3) + 0.25 + i * 0.12, 0.55),
      wiggle: (i) => 6 * Math.exp(-3 * Math.max(0, lt - (w(7) + i * 0.13))) * Math.sin(Math.max(0, lt - (w(7) + i * 0.13)) * 14) * (lt > w(7) + i * 0.13 ? 1 : 0),
    });
  }
  // handwritten note + lime "6"
  const ne = spring(lt, w(5) - 0.1, 0.6) * (1 - ss(S.dur - 1.5, S.dur - 1.1, lt));
  if (ne > 0) {
    c.save(); c.globalAlpha = clamp(ne * 2); c.translate(170, 1080); c.rotate(deg(-6)); c.scale(0.7 + 0.3 * ne, 0.7 + 0.3 * ne);
    c.font = F.hand(130); c.fillStyle = C.magenta; c.fillText("empty!", 0, 0);
    c.strokeStyle = C.magenta; c.lineWidth = 7; c.lineCap = "round";
    c.beginPath(); c.moveTo(60, -120); c.quadraticCurveTo(10, -200, 70, -260); c.stroke();
    c.beginPath(); c.moveTo(48, -238); c.lineTo(70, -262); c.lineTo(94, -244); c.stroke();
    c.restore();
  }
  const sx = spring(lt, w(7) - 0.1, 0.6) * (1 - ss(S.dur - 1.5, S.dur - 1.1, lt));
  if (sx > 0) {
    c.save(); c.globalAlpha = clamp(sx * 2); c.translate(980, 1330); c.scale(0.6 + 0.4 * sx, 0.6 + 0.4 * sx);
    c.font = F.title(360); c.fillStyle = C.lime; c.textAlign = "right"; c.fillText("6", 0, 0);
    c.font = F.title(54); c.textAlign = "right"; c.fillText("LANGUAGES", 0, 70);
    c.restore();
    c.save(); c.globalAlpha = clamp(sx * 2);
    microLabel(c, 640, 1420, "Edit-", "one video", 34);
    c.restore();
  }
} };

// ------------------------------------------------- language scene helpers --
function langBits(c, lang, lt, S, gt, o = {}) {
  const v = V[lang];
  voiceBubble(c, v, vt(lang, gt), o.bx ?? 540, o.by ?? 1500, { px: o.px ?? 62, rot: o.brot ?? -1.5, hold: S.dur - S.vo - 1.4 });
  const e = ss(0.2, 0.7, lt) * (1 - ss(S.dur - 1.2, S.dur - 0.8, lt));
  if (e > 0) {
    c.save(); c.globalAlpha = e;
    label(c, o.lx ?? 60, o.ly ?? 400, `(${ENAME[lang]})。`, 36, C.lime, "left", F.ui(36, 700));
    label(c, o.cx ?? 1020, o.cy ?? 400, `(${CITY[lang][1]})。`, 36, C.lime, "right", F.ui(36, 700));
    c.restore();
  }
}
const editAt = (S) => S.vo + 0.35;
// a lime poster word that springs in
function bigWord(c, s, x, y, px, at, lt, o = {}) {
  const e = spring(lt, at, 0.6) * (1 - ss(o.out ?? 99, (o.out ?? 99) + 0.3, lt));
  if (e <= 0) return;
  c.save(); c.globalAlpha = clamp(e * 2); c.translate(x, y); c.rotate(deg(o.rot || 0)); c.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e);
  c.font = o.font || F.title(px); c.fillStyle = o.color || C.lime; c.textAlign = o.align || "center"; c.textBaseline = "alphabetic";
  c.shadowColor = "rgba(20,50,20,.25)"; c.shadowBlur = 14; c.fillText(s, 0, 0);
  c.restore();
}
function handWord(c, s, x, y, px, at, lt, rot = -6, out = 99) {
  bigWord(c, s, x, y, px, at, lt, { font: F.hand(px), color: C.magenta, rot, align: "left", out });
}

// 3 · Hindi · Varanasi — clothesline + film strip; "cut the first two seconds"
SCENES.hi = { sky: true, draw(c, lt, S, gt) {
  const E = editAt(S), clip = "ghat";
  const R1 = rope(-40, 430, 1120, 455, 26);
  const inR = apple(win(0, 0.5, lt));
  drawRope(c, R1, 15, inR);
  const P = hang(R1, 230, 850, 560, 18, gt, 0.8);
  const drop = spring(lt, 0.1, 0.7);
  const ct = lt * 0.75 + (lt > E ? 2 : 0);
  const base = { x: P.x, y: P.y - (1 - drop) * 1400, w: 840, h: 560, rot: P.rot, b: 18 };
  const fk = flyK(S, lt);
  const r = fk > 0 ? fly(base, 0, fk) : base;
  // film strip: one frame per second of the clip
  const R2 = rope(-40, 1135, 1120, 1150, 18);
  const sIn = apple(win(0.9, 1.4, lt)), sOut = ss(S.dur - 1.4, S.dur - 1.05, lt);
  if (sIn > 0 && sOut < 1) {
    c.save(); c.globalAlpha = 1 - sOut;
    drawRope(c, R2, 11, sIn);
    for (let i = 0; i < 7; i++) {
      const sec = i;
      const cut = i < 2, k = win(E, E + 0.9, lt);
      let x = 120 + i * 210 - (lt > E ? apple(win(E + 0.25, E + 0.85, lt)) * 420 : 0);
      if (x > 1150) continue;
      const appear = spring(lt, 1.0 + i * 0.09, 0.5);
      if (appear <= 0) continue;
      const p = R2.atX(clamp(x, 0, 1080));
      let fx = x, fy = p.y + 14 + 70 + (1 - appear) * -200, rot = p.ang;
      if (cut && lt > E) { const g = Math.max(0, lt - E); fy += 900 * g * g; fx += (i ? 60 : -60) * g; rot += (i ? 1 : -1) * g * 1.6; }
      print(c, fx, fy, 170, 120, rot, (cc, w, h) => cover(cc, clipFrame(clip, sec * 0.75 + 0.2), 0, 0, w, h), { border: 8 });
      if (!(cut && lt > E)) peg(c, fx, p.y, p.ang + deg(i % 2 ? 4 : -4), 0.42, i % 3);
      label(c, fx, fy + 104, `${sec}s`, 24, C.lime, "center", F.ui(24, 700));
    }
    // the cut: a lime dashed line drawn through the strip after second 2
    const cutE = win(E - 0.1, E + 0.15, lt) * (1 - win(E + 0.9, E + 1.3, lt));
    if (cutE > 0) {
      c.save(); c.strokeStyle = C.lime; c.lineWidth = 7; c.setLineDash([18, 14]); c.globalAlpha = cutE;
      c.beginPath(); c.moveTo(435, 1060); c.lineTo(435, 1060 + 260 * cutE); c.stroke(); c.restore();
    }
    c.restore();
  }
  bigWord(c, "−2s", 860, 1050, 170, E + 0.05, lt, { out: S.dur - 1.3 });
  handWord(c, "kaat do!", 610, 1360, 120, E + 0.25, lt, -6, S.dur - 1.3);
  // the hero print last, so the flight to the tracker passes over everything
  heroPrint(c, clip, ct, r, { mode: "hold" });
  if (fk === 0 && drop > 0.2) pegsOn(c, R1, [230, 850], 0.85);
  langBits(c, "hi", lt, S, gt, { by: 1560, ly: 380, cy: 380 });
} };

// 4 · Bangla · Kolkata — collage: a cut-out tram rides the rope, bows mark the beats
SCENES.bn = { sky: true, draw(c, lt, S, gt) {
  const E = editAt(S), clip = "tram", G = S.start;
  const RA = rope(-40, 360, 1120, 470, 26);
  drawRope(c, RA, 14, apple(win(0, 0.45, lt)));
  // the tram hangs from two pegs like the cow in the reference poster
  const tx = lerp(170, 640, ss(0, S.dur, lt)), tw = 470;
  const tramIn = spring(lt, 0.25, 0.8), tramOut = inCubic(win(S.dur - 1.2, S.dur - 0.5, lt));
  if (IMG.cut_tram_2 && tramIn > 0) {
    const im = IMG.cut_tram_2, th = tw * im.naturalHeight / im.naturalWidth;
    const p1 = RA.atX(tx), p2 = RA.atX(tx + tw * 0.62);
    const bump = BEATS.reduce((a, b) => a + (gt > b ? Math.exp(-(gt - b) * 9) : 0), 0) * (lt > E ? 1 : 0.35);
    const rot = Math.atan2(p2.y - p1.y, p2.x - p1.x) + deg(2 * Math.sin(gt * 2));
    c.save(); c.translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - (1 - tramIn) * 700 - tramOut * 900);
    c.rotate(rot); c.scale(1 + bump * 0.035, 1 + bump * 0.035);
    c.shadowColor = "rgba(20,35,70,.35)"; c.shadowBlur = 30; c.shadowOffsetY = 18;
    c.drawImage(im, -tw / 2, 6, tw, th);
    c.restore();
    if (tramOut < 0.05) { peg(c, p1.x, p1.y, p1.ang - deg(5), 0.62, 1); peg(c, p2.x, p2.y, p2.ang + deg(5), 0.62, 2); }
  }
  // the hero print: plays straight, then jump-cuts on every beat after the ask
  const RB = rope(-40, 700, 1120, 735, 22);
  const inB = apple(win(0.1, 0.6, lt));
  drawRope(c, RB, 13, inB);
  const P = hang(RB, 330, 790, 640, 18, gt, 1);
  const drop = spring(lt, 0.2, 0.7);
  const bts = beatsIn(G + E, G + S.dur - 1.1);
  // before: one slow shot of the tram. after: a cut on every beat across real Kolkata footage
  const SEG = [["tram", 0, 0.15, 0.55, 1.5], ["howrah", 1.0], ["tram", 0, 0.85, 0.4, 1.9], ["howrah", 4.2], ["tram", 0, 0.5, 0.75, 2.4],
    ["howrah", 6.0], ["tram", 0, 0.3, 0.3, 1.25], ["howrah", 2.6]];
  let seg = ["tram", 0, 0.5, 0.5, 1], ct = lt, flash = 0, bump = 0;
  bts.forEach((b, k) => { if (gt >= b) { seg = SEG[k % SEG.length]; ct = seg[1] + (gt - b); flash = Math.exp(-(gt - b) * 14); bump = Math.exp(-(gt - b) * 10); } });
  const base = { x: P.x, y: P.y - (1 - drop) * 1400, w: 600 * (1 + bump * 0.03), h: 640 * (1 + bump * 0.03), rot: P.rot + deg(2.5), b: 18 };
  const fk = flyK(S, lt);
  const r = fk > 0 ? fly(base, 1, fk) : base;
  // beat bows on the lower rope, with a lime playhead
  const RC = rope(-40, 1400, 1120, 1415, 16);
  const cIn = apple(win(E - 0.3, E + 0.2, lt)), cOut = ss(S.dur - 1.3, S.dur - 1.0, lt);
  if (cIn > 0 && cOut < 1) {
    c.save(); c.globalAlpha = 1 - cOut;
    drawRope(c, RC, 10, cIn);
    bts.forEach((b, k) => {
      const x = 110 + k * (860 / Math.max(1, bts.length - 1));
      const e = spring(gt, b - 0.02, 0.4);
      if (e <= 0) return;
      const p = RC.atX(x), bow = IMG[k % 2 ? "cut_bow_2" : "cut_bow_1"] || IMG.cut_bow_1;
      c.save(); c.translate(p.x, p.y + 4); c.rotate(p.ang + deg((k % 2 ? 6 : -6))); c.scale(e, e); if (k % 2) c.filter = "hue-rotate(150deg) saturate(.6) brightness(1.15)";
      if (bow) { const bw = 96, bh = bw * bow.naturalHeight / bow.naturalWidth; c.drawImage(bow, -bw / 2, -bh / 2, bw, bh); }
      c.restore();
    });
    if (bts.length) {
      const k = clamp((gt - bts[0]) / (bts[bts.length - 1] - bts[0] || 1));
      const px = 110 + k * 860, p = RC.atX(px);
      c.fillStyle = C.lime; c.fillRect(px - 3, p.y - 70, 6, 120);
      c.beginPath(); c.arc(px, p.y - 74, 12, 0, 7); c.fill();
    }
    label(c, 60, 1500, "♩ cut on every beat", 32, C.lime, "left", F.ui(32, 700));
    c.restore();
  }
  heroPrint(c, seg[0], ct, r, { mode: "loop", fx: seg[2], fy: seg[3], z: seg[4], after: (cc, w, h) => { if (flash > 0) { cc.fillStyle = `rgba(255,255,255,${0.35 * flash})`; cc.fillRect(0, 0, w, h); } } });
  if (fk === 0 && drop > 0.2) pegsOn(c, RB, [330, 790], 0.8);
  microLabel(c, 70, 1110, "Tram-", "since 1873", 32);
  handWord(c, "beat-e beat-e!", 520, 1540, 96, E + 0.1, lt, -5, S.dur - 1.3);
  langBits(c, "bn", lt, S, gt, { by: 1640, ly: 610, cy: 610, px: 56 });
} };

// 5 · Marathi · Mumbai — tabletop on the grass: checker path, speed it up
function checkerPath(c, travel, horizon, alpha = 1) {
  const f = 640;
  c.save(); c.globalAlpha = alpha;
  for (let row = 0; row < 26; row++) {
    const z0 = 1 + row - (travel % 2), z1 = z0 + 0.82;
    if (z1 <= 0.35) continue;
    for (let col = -1; col <= 1; col++) {
      if ((row + col + 3) % 2) continue;
      const X0 = col * 0.95 - 0.43, X1 = X0 + 0.86;
      const za = Math.max(z0, 0.35), zb = z1;
      const y0 = horizon + f / za * 0.95, y1 = horizon + f / zb * 0.95;
      const q = [[540 + X0 * f / za, y0], [540 + X1 * f / za, y0], [540 + X1 * f / zb, y1], [540 + X0 * f / zb, y1]];
      c.globalAlpha = alpha * clamp((24 - z0) / 10) * 0.95;
      c.fillStyle = C.cream; c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
      c.fillStyle = "rgba(70,80,40,.18)"; c.fillRect(q[3][0], q[3][1], q[2][0] - q[3][0], 3);
    }
  }
  c.restore();
}
SCENES.mr = { sky: false, draw(c, lt, S, gt) {
  const E = editAt(S), clip = "local", HZ = 960;
  sky(c, gt, { dy: 160 });
  grass(c, HZ, { bulge: 0, crop: 0.12 });
  // speed: 1x, then ramps to 2.4x after the ask
  const ramp = ss(E, E + 0.6, lt);
  const travel = lt * 1.1 + Math.max(0, lt - E) * 3.6 * ramp;
  checkerPath(c, travel, HZ, ss(0, 0.5, lt));
  // the train races down the path toward camera after the ask
  const tk = win(E + 0.2, E + 1.5, lt);
  if (IMG.cut_train_2 && tk > 0 && tk < 1) {
    const z = lerp(14, 0.9, Math.pow(tk, 1.6)), s = 640 / z;
    const im = IMG.cut_train_2, tw = 2.2 * s, th = tw * im.naturalHeight / im.naturalWidth;
    c.save(); c.globalAlpha = clamp(tk * 6);
    c.drawImage(im, 540 + 0.9 * s - tw / 2, HZ + 0.95 * s - th, tw, th); c.restore();
  }
  const R = rope(-40, 330, 1120, 350, 22);
  drawRope(c, R, 14, apple(win(0, 0.45, lt)));
  const P = hang(R, 340, 740, 700, 18, gt, 0.8);
  const drop = spring(lt, 0.1, 0.7);
  const sp = (t) => t < E ? t : E + (t - E) * lerp(1, 2.4, ss(E, E + 0.6, t));
  const ct = sp(lt) * 0.9;
  const base = { x: P.x, y: P.y - (1 - drop) * 1400, w: 470, h: 700, rot: P.rot, b: 18 };
  const fk = flyK(S, lt);
  const r = fk > 0 ? fly(base, 2, fk) : base;
  heroPrint(c, clip, ct, r, { mode: "loop", blur: lt > E ? 1.2 : 0 });
  if (fk === 0 && drop > 0.2) pegsOn(c, R, [340, 740], 0.8);
  // speed lines
  const sl = ramp * (1 - ss(S.dur - 1.3, S.dur - 1.0, lt));
  if (sl > 0) {
    c.save(); c.strokeStyle = "rgba(255,255,255,.75)"; c.lineCap = "round";
    const rr2 = rnd(5 + Math.floor(gt * 30));
    for (let i = 0; i < 9; i++) {
      const y = 420 + rr2() * 700, x = rr2() < 0.5 ? 120 + rr2() * 120 : 840 + rr2() * 140, l = 80 + rr2() * 140;
      c.globalAlpha = sl * 0.8; c.lineWidth = 3 + rr2() * 4;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (x < 540 ? -l : l) * 0.2, y + l); c.stroke();
    }
    c.restore();
  }
  bigWord(c, "2.4×", 1030, 1310, 210, E + 0.05, lt, { align: "right", out: S.dur - 1.3 });
  handWord(c, "fast kara!", 70, 1310, 110, E + 0.25, lt, -6, S.dur - 1.3);
  langBits(c, "mr", lt, S, gt, { by: 1560, ly: 300 + 0, cy: 300, px: 64 });
} };

// 6 · Telugu · Hyderabad — windows on the green hill; warm the colour
const TE_WIN = { yellow: { x: 430, y: 1000, w: 430, h: 470 }, red: { x: 880, y: 700, w: 190, h: 200 }, blue: { x: 760, y: 1470, w: 340, h: 360 } };
const WIN_IN = 0.1;                                    // frame thickness as a share of the window
// Real window cut-outs, tinted to the poster palette. The frame's panes are transparent.
const TINT = {};
function tinted(name, col) {
  const key = name + col;
  if (TINT[key]) return TINT[key];
  const im = IMG[name]; if (!im) return null;
  if (!col) return (TINT[key] = im);
  const k = document.createElement("canvas"); k.width = im.naturalWidth; k.height = im.naturalHeight;
  const x = k.getContext("2d");
  x.drawImage(im, 0, 0);
  x.globalCompositeOperation = "color"; x.fillStyle = col; x.fillRect(0, 0, k.width, k.height);
  x.globalCompositeOperation = "soft-light"; x.globalAlpha = 0.45; x.fillRect(0, 0, k.width, k.height);
  x.globalCompositeOperation = "destination-in"; x.globalAlpha = 1; x.drawImage(im, 0, 0);
  return (TINT[key] = k);
}
const WINDOWS = {
  yellow: { frame: ["cut_window_wood_frame", "#e8b81f"], l: ["cut_window_wood_shutter_l", "#e8b81f"], r: ["cut_window_wood_shutter_r", "#e8b81f"] },
  red: { frame: ["cut_window_red_frame", null], l: ["cut_window_red_shutter_l", null], r: ["cut_window_red_shutter_r", null] },
  blue: { frame: ["cut_window_wood_frame", "#6f9fd8"], l: ["cut_window_blue_shutter_l", null], r: ["cut_window_blue_shutter_r", null] },
};
const glass = (r) => ({ x: r.x - r.w / 2 + r.w * WIN_IN, y: r.y - r.h / 2 + r.h * WIN_IN, w: r.w * (1 - 2 * WIN_IN), h: r.h * (1 - 2 * WIN_IN) });
function windowFrame(c, r, kind, open, body) {
  const K = WINDOWS[kind], g = glass(r);
  c.save();
  // the view inside
  c.save(); c.beginPath(); c.rect(g.x, g.y, g.w, g.h); c.clip(); c.translate(g.x, g.y); body(c, g.w, g.h); c.restore();
  const fr = tinted(...K.frame);
  c.save(); c.shadowColor = "rgba(20,40,20,.45)"; c.shadowBlur = 30; c.shadowOffsetY = 16; c.shadowOffsetX = 10;
  if (fr) c.drawImage(fr, r.x - r.w / 2, r.y - r.h / 2, r.w, r.h);
  c.restore();
  // shutters: hinged on the outer edges, swinging out until they lie flat against the wall
  const th = Math.PI * 0.97 * clamp(open);
  [["l", -1], ["r", 1]].forEach(([side, sd]) => {
    const im = tinted(...K[side]); if (!im) return;
    const sw = r.w * 0.5, sh = r.h * 1.02;
    const hx = r.x + sd * r.w / 2;
    c.save(); c.translate(hx, r.y);
    c.transform(Math.cos(th), sd * -Math.sin(th) * 0.1, 0, 1, 0, 0);
    c.shadowColor = "rgba(20,40,20,.35)"; c.shadowBlur = 16;
    c.drawImage(im, sd < 0 ? 0 : -sw, -sh / 2, sw, sh);
    c.shadowColor = "transparent";
    c.globalAlpha = 0.28 * Math.sin(th); c.fillStyle = "#000"; c.fillRect(sd < 0 ? 0 : -sw, -sh / 2, sw, sh);
    c.restore();
  });
  c.restore();
}
const WARM = (k) => `sepia(${0.32 * k}) saturate(${1 + 0.4 * k}) hue-rotate(${-8 * k}deg) brightness(${1 + 0.05 * k}) contrast(${1 + 0.06 * k})`;
SCENES.te = { sky: false, draw(c, lt, S, gt) {
  const E = editAt(S), clip = "charminar";
  const warm = ss(E, E + 1.0, lt);
  cover(c, IMG.grass, 0, 0, W, H, 0.5, 0.5, 1.04 + 0.01 * lt);
  // an auto-rickshaw putters along the hill, tiny, like the running figures in the poster
  if (IMG.cut_auto) { const im = IMG.cut_auto, aw = 150, ah = aw * im.naturalHeight / im.naturalWidth, ax = lerp(-160, 520, lt / S.dur);
    c.save(); c.translate(ax, 1745 - ax * 0.05 + Math.sin(lt * 18) * 1.5); c.scale(-1, 1); c.drawImage(im, -aw / 2, -ah, aw, ah); c.restore(); }
  // windows pop up out of the hill
  const wy = (at) => (1 - spring(lt, at, 0.8)) * 700;
  const bl = TE_WIN.blue, rd = TE_WIN.red, yl = TE_WIN.yellow;
  windowFrame(c, { ...rd, y: rd.y + wy(0.35) }, "red", spring(lt, 0.8, 0.9), (cc, w, h) => cover(cc, clipFrame("tram", 1.5), 0, 0, w, h));
  windowFrame(c, { ...bl, y: bl.y + wy(0.5) }, "blue", spring(lt, 1.1, 0.9), (cc, w, h) => footage(cc, "marina", 0, 0, 0, w, h, { fy: 0.5 }));
  const fk = flyK(S, lt);
  windowFrame(c, { ...yl, y: yl.y + wy(0.15) }, "yellow", spring(lt, 0.6, 0.9), (cc, w, h) => {
    if (fk < 0.02) footage(cc, clip, 0.2 + lt * 0.55, 0, 0, w, h, { mode: "hold", fx: 0.3, filter: WARM(warm) });
    else { cc.fillStyle = "#cfe3f3"; cc.fillRect(0, 0, w, h); }
  });
  // golden-hour light over everything once the colour warms
  if (warm > 0) {
    c.save(); c.globalCompositeOperation = "soft-light"; c.globalAlpha = 0.55 * warm;
    const g = c.createRadialGradient(980, 160, 50, 900, 300, 1500);
    g.addColorStop(0, "#ffb347"); g.addColorStop(0.5, "#ff9a3c"); g.addColorStop(1, "rgba(255,140,60,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.globalCompositeOperation = "screen"; c.globalAlpha = 0.5 * warm;
    const s = c.createRadialGradient(1000, 140, 0, 1000, 140, 420);
    s.addColorStop(0, "rgba(255,230,180,1)"); s.addColorStop(1, "rgba(255,200,120,0)");
    c.fillStyle = s; c.fillRect(0, 0, W, H); c.restore();
  }
  // a lime "warm" slider, like a grade control
  const sl = spring(lt, E - 0.2, 0.5) * (1 - ss(S.dur - 1.3, S.dur - 1.0, lt));
  if (sl > 0) {
    c.save(); c.globalAlpha = clamp(sl * 2); c.translate(620, 1790);
    c.font = F.ui(30, 800); c.fillStyle = C.lime; c.fillText("WARMTH", 0, 0);
    c.fillStyle = "rgba(255,255,255,.55)"; rr(c, 0, 22, 420, 10, 5); c.fill();
    c.fillStyle = C.lime; rr(c, 0, 22, 420 * (0.5 + 0.4 * warm), 10, 5); c.fill();
    c.beginPath(); c.arc(420 * (0.5 + 0.4 * warm), 27, 20, 0, 7); c.fillStyle = "#fff"; c.fill();
    c.font = F.ui(30, 800); c.fillStyle = C.lime; c.textAlign = "right"; c.fillText(`+${Math.round(40 * warm)}`, 420, 0);
    c.restore();
  }
  // parenthetical labels placed like the Vanke poster's (Summer)。(Nature)。
  const le = ss(0.6, 1.2, lt) * (1 - ss(S.dur - 1.2, S.dur - 0.8, lt));
  c.save(); c.globalAlpha = le;
  label(c, 70, 1330, "(Telugu)。", 40, "#fff", "left", F.ui(40, 600));
  label(c, 1010, 880, "(Hyderabad)。", 40, "#fff", "right", F.ui(40, 600));
  label(c, 470, 1680, "(Next)。", 34, "#fff", "left", F.ui(34, 600));
  c.restore();
  if (fk > 0) { const g = glass(yl); heroPrint(c, clip, 0.2 + lt * 0.55, fly({ x: g.x + g.w / 2, y: g.y + g.h / 2, w: g.w, h: g.h, rot: 0, b: 0 }, 3, fk), { mode: "hold", fx: 0.3, filter: WARM(warm) }); }
  handWord(c, "warm karo", 60, 1480, 104, E + 0.25, lt, -5, S.dur - 1.3);
  voiceBubble(c, V.te, vt("te", gt), 540, 300 + 110, { px: 56, hold: S.dur - S.vo - 1.4 });
} };
SCENES.te.blue = TE_WIN.blue;
SCENES.te.glass = glass;

// 7 · Tamil · Chennai — full-bleed beach; make the captions bigger
SCENES.ta = { sky: true, draw(c, lt, S, gt) {
  const E = editAt(S), clip = "marina";
  const fk = flyK(S, lt);
  const big = spring(lt, E, 0.75);
  const full = { x: W / 2, y: H / 2, w: W, h: H, rot: 0, b: 0 };
  const r = fk > 0 ? fly(full, 4, fk) : full;
  const z = lerp(1.0, 1.1, lt / S.dur);
  if (fk === 0) {
    footage(c, clip, lt * 0.85, 0, 0, W, H, { mode: "loop", z });
    // legibility gradient top & bottom
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(10,25,45,.35)"); g.addColorStop(0.18, "rgba(10,25,45,0)"); g.addColorStop(0.7, "rgba(10,25,45,0)"); g.addColorStop(1, "rgba(10,25,45,.45)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // the reel's caption: small and white, then big and lime
    const cy = lerp(1230, 1080, big);
    c.save(); c.translate(540, cy); c.rotate(deg(-3 * big));
    c.textAlign = "center"; c.textBaseline = "alphabetic";
    c.font = F.lang("ta", lerp(54, 230, big), 800);
    const cw = c.measureText(CITY.ta[0]).width; if (cw > 960) c.scale(960 / cw, 960 / cw);
    c.lineJoin = "round"; c.strokeStyle = "rgba(11,11,12,.55)"; c.lineWidth = lerp(6, 18, big);
    c.strokeText(CITY.ta[0], 0, 0);
    c.fillStyle = big > 0.02 ? C.lime : "#fff"; c.fillText(CITY.ta[0], 0, 0);
    c.font = F.lang("ta", lerp(34, 64, big), 700); c.lineWidth = lerp(4, 9, big);
    c.strokeText(SUB.ta, 0, lerp(56, 110, big)); c.fillStyle = "#fff"; c.fillText(SUB.ta, 0, lerp(56, 110, big));
    c.restore();
    handWord(c, "perusaa!", 640, 1360, 110, E + 0.3, lt, -6, S.dur - 1.3);
    label(c, 60, 460, "(Tamil)。", 36, C.lime, "left", F.ui(36, 700));
    label(c, 1020, 460, "(Chennai)。", 36, C.lime, "right", F.ui(36, 700));
  } else {
    heroPrint(c, clip, lt * 0.85, r, { mode: "loop", z, after: (cc, w, h) => {} });
  }
  voiceBubble(c, V.ta, vt("ta", gt), 540, 640, { px: 56, hold: S.dur - S.vo - 1.4 });
} };

// 8 · Gujarati · Ahmedabad — kites; subtitles in every language ride the kite tail
const TAIL = ["gu", "hi", "bn", "mr", "te", "ta", "en"];
SCENES.gu = { sky: true, draw(c, lt, S, gt) {
  const E = editAt(S), clip = "kites";
  const out = inCubic(win(S.dur - 1.1, S.dur - 0.3, lt));
  // background kites drifting
  [["cut_kite_2", 150, 520, 120, 0.7], ["cut_kite_3", 960, 1180, 110, 1.3], ["cut_kite_4", 120, 1700, 100, 2.1]].forEach(([n, x, y, s, ph], i) => {
    const im = IMG[n]; if (!im) return;
    const e = ss(0.2 + i * 0.2, 0.9 + i * 0.2, lt);
    c.save(); c.globalAlpha = e; c.translate(x + Math.sin(gt * 0.9 + ph) * 30, y + Math.cos(gt * 1.1 + ph) * 20 - out * 900);
    c.rotate(deg(Math.sin(gt * 1.7 + ph) * 10)); c.drawImage(im, -s / 2, -s / 2 * im.naturalHeight / im.naturalWidth, s, s * im.naturalHeight / im.naturalWidth);
    c.restore();
  });
  // lime word and hero print
  bigWord(c, "પતંગ", 60, 560, 0, 0.3, lt, { font: F.lang("gu", 230, 800), align: "left", rot: -4, out: S.dur - 1.2 });
  const R = rope(-40, 600, 760, 640, 18);
  drawRope(c, R, 13, apple(win(0, 0.45, lt)));
  const P = hang(R, 150, 590, 600, 18, gt, 1);
  const drop = spring(lt, 0.15, 0.7);
  const base = { x: P.x, y: P.y - (1 - drop) * 1400, w: 520, h: 600, rot: P.rot - deg(2), b: 18 };
  const fk = flyK(S, lt);
  const r = fk > 0 ? fly(base, 5, fk) : base;
  handWord(c, "Uttarayan!", 80, 1420, 120, 0.9, lt, -5, S.dur - 1.2);
  // the big kite top-right with a long tail; subtitle tags tied along it
  const K = IMG.cut_kite_1;
  const kx = 860 + Math.sin(gt * 1.1) * 24, ky = 470 + Math.cos(gt * 1.3) * 16 - out * 1100;
  const tailPt = (u) => ({ x: kx + Math.sin(u * 5 + gt * 2.2) * 60 * u - u * 120, y: ky + 110 + u * 1080 });
  const kin = ss(0.3, 1.0, lt);
  if (kin > 0) {
    c.save(); c.globalAlpha = kin;
    c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 3; c.beginPath();
    for (let i = 0; i <= 40; i++) { const p = tailPt(i / 40); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); } c.stroke();
    if (K) { const s = 260, h2 = s * K.naturalHeight / K.naturalWidth; c.save(); c.translate(kx, ky); c.rotate(deg(Math.sin(gt * 1.5) * 8)); c.drawImage(K, -s / 2, -h2 / 2, s, h2); c.restore(); }
    c.restore();
    TAIL.forEach((l, i) => {
      const at = E + i * 0.16;
      const e = spring(lt, at, 0.5);
      if (e <= 0) return;
      const p = tailPt(0.18 + i * 0.12);
      const s = SUB[l];
      c.save(); c.translate(p.x, p.y); c.rotate(deg(Math.sin(gt * 2 + i) * 5)); c.scale(e, e);
      pill(c, 0, 0, s, l === "en" ? F.ui(30, 800) : F.lang(l, 34, 700), { h: 64, padX: 22, bg: l === "en" ? C.lime : "#fff", dy: l === "en" ? 2 : 4 });
      c.restore();
    });
  }
  heroPrint(c, clip, lt * 0.9, r, { mode: "loop", fx: 0.42, fy: 0.42, z: 1.25, after: (cc, w, h) => {
    // real patang cut-outs flying in the shot, strings trailing down to the rooftops
    [["cut_kite_2", 0.3, 0.32, 0.26, 0.0], ["cut_kite_5", 0.72, 0.22, 0.2, 1.7], ["cut_kite_3", 0.6, 0.62, 0.15, 3.1], ["cut_kite_4", 0.18, 0.7, 0.11, 4.4]].forEach(([n, x, y, sz, ph]) => {
      const im = IMG[n]; if (!im) return;
      const kx = w * x + Math.sin(gt * 1.3 + ph) * w * 0.03, ky = h * y + Math.cos(gt * 1.1 + ph) * h * 0.02, kw = w * sz, kh = kw * im.naturalHeight / im.naturalWidth;
      cc.strokeStyle = "rgba(255,255,255,.7)"; cc.lineWidth = 1.5; cc.beginPath(); cc.moveTo(kx, ky + kh * 0.4); cc.quadraticCurveTo(kx + w * 0.1, ky + h * 0.3, kx + w * 0.05, h); cc.stroke();
      cc.save(); cc.translate(kx, ky); cc.rotate(deg(Math.sin(gt * 1.9 + ph) * 9)); cc.drawImage(im, -kw / 2, -kh / 2, kw, kh); cc.restore();
    });
  } });
  if (fk === 0 && drop > 0.2) pegsOn(c, R, [150, 590], 0.8);
  voiceBubble(c, V.gu, vt("gu", gt), 470, 1590, { px: 56, hold: S.dur - S.vo - 1.4 });
  label(c, 60, 340, "(Gujarati · Ahmedabad)。", 34, C.lime, "left", F.ui(34, 700));
} };

// 9 · the finished reel, cut on the beat, with every edit applied
SCENES.reel = { sky: true, draw(c, lt, S, gt) {
  const G = S.start;
  const card = { x: 540, y: 990, w: 740, h: 1110 };
  const form = apple(win(0.0, 1.0, lt));
  const out = inCubic(win(S.dur - 0.85, S.dur - 0.05, lt));
  // the six tracker thumbnails fly together and become the card
  if (form < 1) {
    LANGS.forEach((l, i) => {
      const s = SLOT(i), e = apple(win(i * 0.06, 0.7 + i * 0.06, lt));
      const r = { x: lerp(s.x, card.x, e), y: lerp(s.y, card.y, e), w: lerp(s.w, card.w * 0.5, e), h: lerp(s.h, card.h * 0.5, e), rot: lerp(s.rot, deg(-6 + i * 2.4), e), b: lerp(s.b, 14, e) };
      c.save(); c.globalAlpha = 1 - ss(0.7, 1.0, lt);
      heroPrint(c, CLIPS[l], 2.0, r, {}); c.restore();
    });
  }
  const R = rope(-40, 330, 1120, 345, 20);
  const k = ss(0.55, 1.0, lt);
  if (k <= 0) return;
  c.save(); c.translate(0, -out * 1500); c.globalAlpha = k;
  drawRope(c, R, 14);
  const P = hang(R, 300, 780, card.h, 18, gt, 0.5);
  // cut list: on the beat, one shot per language, ~1.1 s each
  const t0 = G + 1.0;
  const bts = beatsIn(t0, G + S.dur);
  const per = Math.max(1, Math.round(1.1 / (60 / ((window.MUSIC || { bpm: 110 }).bpm))));
  const cuts = []; for (let i = 0; i < bts.length; i += per) cuts.push(bts[i]);
  let idx = -1; cuts.forEach((b, i) => { if (gt >= b) idx = i; });
  const sh = Math.max(0, idx) % 6, l = LANGS[sh], since = idx >= 0 ? gt - cuts[idx] : gt - t0;
  const speed = l === "mr" ? 2.0 : 1;
  const start = { hi: 2.4, bn: 1.0, mr: 0.5, te: 1.0, ta: 1.0, gu: 0.6 }[l];
  const bump = Math.exp(-since * 9);
  print(c, P.x, P.y, card.w, card.h, P.rot, (cc, w, h) => {
    footage(cc, CLIPS[l], start + since * speed, 0, 0, w, h, { mode: "loop", filter: WARM(1), z: 1.04 + bump * 0.04, blur: l === "mr" ? 1 : 0 });
    const g = cc.createLinearGradient(0, h * 0.55, 0, h); g.addColorStop(0, "rgba(10,20,30,0)"); g.addColorStop(1, "rgba(10,20,30,.55)");
    cc.fillStyle = g; cc.fillRect(0, 0, w, h);
    cc.fillStyle = `rgba(255,255,255,${0.3 * bump})`; cc.fillRect(0, 0, w, h);
    cc.textAlign = "center"; cc.lineJoin = "round";
    const cs = 1 + 0.12 * bump;
    cc.save(); cc.translate(w / 2, h - 210); cc.scale(cs, cs);
    cc.font = F.lang(l, 150, 800); cc.strokeStyle = "rgba(11,11,12,.55)"; cc.lineWidth = 14;
    cc.strokeText(CITY[l][0], 0, 0); cc.fillStyle = C.lime; cc.fillText(CITY[l][0], 0, 0);
    cc.restore();
    cc.font = F.lang(l, 46, 700); cc.lineWidth = 8; cc.strokeText(SUB[l], w / 2, h - 120); cc.fillStyle = "#fff"; cc.fillText(SUB[l], w / 2, h - 120);
    cc.font = F.ui(30, 700); cc.fillStyle = C.lime; cc.fillText(SUB.en.toUpperCase() + "  ·  " + CITY[l][1].toUpperCase(), w / 2, h - 66);
    // progress bar, like a story
    LANGS.forEach((_, i) => {
      const x = 24 + i * ((w - 48) / 6);
      cc.fillStyle = "rgba(255,255,255,.4)"; rr(cc, x, 22, (w - 48) / 6 - 8, 6, 3); cc.fill();
      const f = i < sh ? 1 : i === sh ? clamp(since / 1.1) : 0;
      cc.fillStyle = "#fff"; rr(cc, x, 22, ((w - 48) / 6 - 8) * f, 6, 3); cc.fill();
    });
  }, { border: 18 });
  pegsOn(c, R, [300, 780], 0.85);
  c.restore();
  c.save(); c.globalAlpha = k * (1 - out);
  label(c, 60, 270, "A DAY IN INDIA", 40, C.lime, "left", F.title(40, 900));
  label(c, 1020, 270, "(edited in 6 languages)。", 32, C.lime, "right", F.ui(32, 700));
  c.restore();
} };

// 10 · "Six languages. One video. Not a single clip dragged. That's vibe editing." + "अब edit करो…"
SCENES.outro = { sky: true, draw(c, lt, S, gt) {
  const w = (n) => wordAt("en3", n, "outro");
  const gone = inCubic(win(w(9) - 0.1, w(9) + 0.6, lt));
  const nums = [["6", "languages", 90, 700, 0, -4], ["1", "video", 560, 1000, 2, 5], ["0", "clips dragged", 90, 1330, 4, -3]];
  nums.forEach(([n, s, x, y, wi, rot], i) => {
    const e = spring(lt, w(wi) - 0.05, 0.6);
    if (e <= 0 || gone >= 1) return;
    c.save(); c.globalAlpha = clamp(e * 2) * (1 - gone); c.translate(x, y - gone * 900 * (1 + i * 0.4)); c.rotate(deg(rot)); c.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e);
    c.font = F.title(330); c.fillStyle = C.lime; c.textBaseline = "alphabetic"; c.fillText(n, 0, 0);
    const nw = c.measureText(n).width;
    c.font = F.hand(130); c.fillStyle = C.magenta; c.fillText(s, nw + 20, -40);
    c.restore();
  });
  // VIBE EDITING, written in cloud
  const cv = cloudText("ve", ["VIBE", "EDITING"], F.title(178, 900), 205);
  drawCloudText(c, cv, 540, 820, ss(w(9) - 0.1, w(9) + 1.1, lt), 1);
  const he = V.hi_end, ht = vt("hi_end", gt);
  voiceBubble(c, he, ht, 540, 1300, { px: 70, rot: -2, hold: 99 });
  const e = ss(w(9) + 0.6, w(9) + 1.2, lt);
  if (e > 0) {
    c.save(); c.globalAlpha = e;
    label(c, 540, 1110, "(Apni bhasha. Apna edit.)。", 38, C.lime, "center", F.ui(38, 700));
    c.restore();
  }
  // the opening greetings come back, small, around the edges
  const ge = ss(ht - 0.2 + 0.5, ht + 1.4, lt + 0) ;
  const back = ss(V.hi_end.at - S.start + 0.4, V.hi_end.at - S.start + 1.6, lt);
  if (back > 0) GREET.forEach((g, k) => {
    const pos = [[200, 400], [880, 380], [200, 1560], [880, 1580], [220, 1760], [860, 1760], [540, 1680], [150, 560], [930, 590], [540, 330]][k];
    greetPill(c, [g[0], pos[0], pos[1], g[3], g[4]], (lt - (V.hi_end.at - S.start + 0.4)) - k * 0.07, k, gt, { s: 0.62, alpha: back });
  });
} };

window.SCENES = SCENES;
window.FILMX = { SC, V, LANGS, drawLine, lineGeom, BEATS };
})();

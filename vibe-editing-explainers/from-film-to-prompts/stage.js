// From film to prompts: the history of editing in the cozy design.
// Each era is a board on one long row; the camera glides along it, then pulls back to show
// every era at once, and the eras regroup into a 2x2 recap. Serif = the old world,
// pixel type on butter-yellow = the digital one.
(function () {
const { clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring, rnd } = K;
const C = K.C, W = K.W, H = K.H;

const COL = { bg: "#eef0f3", ink: "#151515", butter: "#f1e3ae", soft: "#8b8f96", line: "#d5d8de",
  sage: "#cfdcc0", peach: "#f3cfb1", lilac: "#d9d3ea", sky: "#c9dbe9", red: "#d8492f" };
const SERIF = "EB Garamond", PIX = "VT323";

// ------------------------------------------------------------------ pixel art --
// Small black pixel icons, drawn from strings (# = ink, o = butter, . = empty).
const SPRITES = {
  sparkle: ["....#....", "....#....", "...###...", "#########", "...###...", "....#....", "....#...."],
  sparkles: ["..#......", ".###.....", "..#...#..", "......#..", "....#####", "......#..", "#.....#..", "........."],
  mug: [".########.", ".#......###", ".#......#.#", ".#..#.#.#.#", ".#......###", ".#..###.#..", ".#......#..", "..######..."],
  cloud: ["...###.....", "..#...##...", ".#......#..", "#........#.", "#........#.", ".########..", "..#..#..#..", ".#..#..#...", "#..#..#...."],
  scissors: ["##.....##", "#.#...#.#", "##.#.#.##", "....#....", "...#.#...", "..#...#..", ".#.....#.", "#.......#"],
  play: ["##.....", "####...", "######.", "#######", "######.", "####...", "##....."],
  rec: [".###.", "#####", "#####", "#####", ".###."],
  cursor: ["#.......", "##......", "#o#.....", "#oo#....", "#ooo#...", "#oooo#..", "#ooooo#.", "#oo####.", "#.#o#...", "...#o#..", "....##.."],
  floppy: ["#########.", "#.#####.##", "#.#####..#", "#.#####..#", "#........#", "#.######.#", "#.#....#.#", "#.######.#", "##########"],
  person: [".##.", ".##.", "####", "####", ".##.", ".##.", "#..#"],
  arrow: [".....#...", "......#..", "#########", "......#..", ".....#..."],
  film: ["#.#.#.#.#", "#########", "#.......#", "#.......#", "#.......#", "#########", "#.#.#.#.#"],
  key: ["#########", "#.......#", "#.##.##.#", "#.......#", "#########"],
  heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
};
function sprite(g, name, x, y, ps, color = COL.ink, p = 1) {
  const s = SPRITES[name]; if (!s || p <= 0) return;
  const w = Math.max(...s.map((r) => r.length)) * ps, h = s.length * ps;
  g.save(); g.translate(x, y); g.scale(p, p);
  s.forEach((row, j) => { for (let i = 0; i < row.length; i++) {
    const c = row[i]; if (c === ".") continue;
    g.fillStyle = c === "o" ? COL.butter : color; g.fillRect(i * ps - w / 2, j * ps - h / 2, ps + 0.5, ps + 0.5);
  } });
  g.restore();
}

// ------------------------------------------------------------------ type --
// Serif words that rise into place one by one (EB Garamond, the "Let's get" line).
function serif(g, text, x, y, size, t, at, o = {}) {
  const words = text.split(" ");
  g.save(); g.font = `${o.italic ? "italic " : ""}${o.weight || 500} ${size}px "${SERIF}"`; g.textBaseline = "alphabetic";
  const sp = g.measureText(" ").width;
  const ws = words.map((w) => g.measureText(w).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cx = o.align === "center" ? x - total / 2 : o.align === "right" ? x - total : x;
  const out = o.out != null ? inCubic(win(o.out, o.out + 0.35, t)) : 0;
  words.forEach((w, i) => {
    const p = outQuint(win(at + i * (o.stagger ?? 0.08), at + i * (o.stagger ?? 0.08) + 0.7, t));
    if (p > 0) {
      g.globalAlpha = p * (1 - out) * (o.alpha ?? 1);
      g.fillStyle = o.color || COL.ink;
      g.fillText(w, cx, y + (1 - p) * size * 0.35 - out * 20);
    }
    cx += ws[i] + sp;
  });
  g.restore();
  return total;
}
// Pixel word on a butter-yellow block (the "Cozy" block). Block wipes in, letters type on.
function pixBlock(g, text, x, y, size, t, at, o = {}) {
  g.save();
  g.font = `${size}px "${PIX}"`;
  const tw = g.measureText(text).width, pad = o.pad ?? size * 0.22, w = o.w || tw + pad * 2, h = o.h || size * 0.95;
  const lay = outExpo(win(at, at + 0.55, t));
  const out = o.out != null ? inCubic(win(o.out, o.out + 0.35, t)) : 0;
  if (lay <= 0 || out >= 1) { g.restore(); return { w, h }; }
  const ax = o.align === "center" ? x - w / 2 : x;
  g.globalAlpha = 1 - out;
  g.fillStyle = o.bg || COL.butter;
  g.fillRect(ax, y - h / 2, w * lay, h);
  const n = Math.floor(clamp((t - at - 0.18) * (o.cps || 22), 0, text.length));
  g.fillStyle = o.color || COL.ink; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(text.slice(0, n), ax + (w - tw) / 2, y + size * 0.04);
  if (o.caret && Math.floor(t * 2.2) % 2 === 0) {
    const cx = ax + (w - tw) / 2 + g.measureText(text.slice(0, n)).width + size * 0.05;
    g.fillRect(cx, y - size * 0.32, size * 0.42, size * 0.62);
  }
  g.restore();
  return { w, h, x: ax };
}
function small(g, text, x, y, size, t, at, o = {}) {   // grey caption lines
  const p = outCubic(win(at, at + 0.6, t));
  if (p <= 0) return;
  g.save(); g.globalAlpha = p * (o.alpha ?? 1);
  g.font = `${o.italic === false ? "" : "italic "}${o.weight || 500} ${size}px "${o.family || SERIF}"`;
  g.fillStyle = o.color || COL.soft; g.textAlign = o.align || "left"; g.textBaseline = "middle";
  g.fillText(text, x, y + (1 - p) * 10);
  g.restore();
}

// ------------------------------------------------------------------ media --
function shadowSoft(g) { g.shadowColor = "rgba(40,45,60,0.16)"; g.shadowBlur = 40; g.shadowOffsetY = 18; }
// Rounded photo/film frame with real footage. `clip` may be an array of {clip, from} to cut between.
function frameTile(g, o, t) {
  const L = K.life(t, o.at, o.out, o.inDur || 1.0);
  if (!L.on) return;
  const s = (0.94 + 0.06 * L.p) * (1 - 0.06 * L.o);
  g.save();
  g.translate(o.x, o.y + (1 - L.p) * 60 + L.o * 40);
  g.rotate(((o.rot || 0) + (1 - L.p) * (o.rin ?? 2)) * Math.PI / 180);
  g.scale(s, s);
  g.globalAlpha = clamp(L.p * 2.2) * (1 - L.o);
  const w = o.w, h = o.h, r = o.r ?? 26;
  if (o.border !== false) { shadowSoft(g); g.fillStyle = "#fff"; K.rr(g, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, r + 8); g.fill(); K.noShadow(g); }
  else { shadowSoft(g); g.fillStyle = "#ddd"; K.rr(g, -w / 2, -h / 2, w, h, r); g.fill(); K.noShadow(g); }
  g.save(); K.rr(g, -w / 2, -h / 2, w, h, r); g.clip();
  if (o.draw) o.draw(g, -w / 2, -h / 2, w, h, t);
  else drawClip(g, o, -w / 2, -h / 2, w, h, t);
  if (o.grain) { g.globalAlpha = 0.16; g.globalCompositeOperation = "overlay"; g.drawImage(K.GRAIN[Math.floor(t * 24) % 6], -w / 2, -h / 2, w, h); g.globalCompositeOperation = "source-over"; }
  g.restore();
  if (o.after) o.after(g, w, h, t);
  g.restore();
}
function drawClip(g, o, x, y, w, h, t) {
  const cuts = Array.isArray(o.clip) ? o.clip : [{ clip: o.clip, from: o.at }];
  let cur = cuts[0], prev = null;
  for (const c of cuts) if (t >= c.from) { prev = cur !== c ? cur : prev; cur = c; }
  const one = (c, a) => {
    const fr = K.footage(c.clip, t - (c.from ?? o.at) + (c.ss || 0), c.speed || 1, true);
    if (!fr) return;
    g.save(); g.globalAlpha *= a; if (o.filter || c.filter) g.filter = c.filter || o.filter;
    K.drawFit(g, fr, x, y, w, h, { zoom: (c.zoom || 1) * (1 + 0.04 * win(c.from ?? o.at, (c.from ?? o.at) + 8, t)), fx: c.fx, fy: c.fy });
    g.restore();
  };
  const idx = cuts.indexOf(cur);
  if (idx > 0) {
    const pc = cuts[idx - 1], a = outCubic(win(cur.from, cur.from + 0.45, t));
    if (a < 1) one(pc, 1);
    one(cur, a);
  } else one(cur, 1);
}
// Real cut-out object with a soft contact shadow; `cropBottom` hides a cut edge behind a block.
function object(g, key, x, y, w, t, at, o = {}) {
  const im = K.object(key); if (!im) return;
  const L = K.life(t, at, o.out, 0.9);
  if (!L.on) return;
  const h = w * im.height / im.width;
  g.save(); g.translate(x, y + (1 - L.p) * 50); g.rotate(((o.rot || 0) + (1 - L.p) * 4) * Math.PI / 180);
  g.globalAlpha = clamp(L.p * 2) * (1 - L.o);
  g.shadowColor = "rgba(40,40,50,0.22)"; g.shadowBlur = 30; g.shadowOffsetY = 16;
  g.drawImage(im, -w / 2, -h, w, h);   // anchored at its bottom centre
  g.restore();
}

// Pixel dissolve: reveal `draw` in random square cells as p goes 0 -> 1.
const DISS = new Map();
function pixelReveal(g, x, y, w, h, p, cell, draw) {
  if (p <= 0) return;
  if (p >= 1) { draw(g, x, y, w, h); return; }
  const key = `${w}x${h}`;
  let k = DISS.get(key);
  if (!k) { k = K.makeCanvas(Math.ceil(w), Math.ceil(h)); DISS.set(key, k); }
  const q = k.getContext("2d"); q.clearRect(0, 0, k.width, k.height);
  draw(q, 0, 0, w, h);
  const r = rnd(7), cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  g.save();
  g.beginPath();
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const th = r() * 0.85 + (i / cols) * 0.15;
    if (th < p) g.rect(x + i * cell, y + j * cell, cell + 0.5, cell + 0.5);
  }
  g.clip(); g.drawImage(k, x, y);
  g.restore();
}

// ------------------------------------------------------------------ camera --
const SP = 1250;
const B = { hook: 0, film: SP, tape: SP * 2, timeline: SP * 3, prompt: SP * 4 };
const STOPS = [["hook", 0], ["film", C.s_film], ["tape", C.s_tape], ["timeline", C.s_timeline], ["prompt", C.s_prompt]];
const ZOUT = { x: (B.film + B.prompt) / 2, y: -40, z: 0.205 };
function camera(t) {
  // pull back over the whole row for "every step…"
  const zs = C.s_why - 0.3, zp = inOutQuint(win(zs, zs + 1.5, t));
  let x = 0, y = 0, z = 1, moving = false, speed = 0;
  let i = 0; while (i < STOPS.length - 1 && t >= STOPS[i + 1][1] - 0.4) i++;
  const [k, s0] = STOPS[i];
  x = B[k]; z = 1 + 0.03 * outCubic(win(s0, s0 + 7, t));
  if (i > 0 && t < s0 - 0.4 + 1.0) {
    const p = (t - (s0 - 0.4)) / 1.0, e = inOutQuint(p), prev = STOPS[i - 1][0];
    x = lerp(B[prev], B[k], e); z = (1 + 0.03) * (1 - e) + 1 * e; z *= 1 - 0.1 * Math.sin(Math.PI * p);
    moving = p > 0.03 && p < 0.97; speed = Math.sin(Math.PI * p);
  }
  if (t < 1.4) { const e = 1 - outQuint(win(0, 1.4, t)); z += 0.08 * e; }
  if (zp > 0) {
    x = lerp(x, ZOUT.x, zp); y = lerp(y, ZOUT.y, zp);
    z = Math.exp(lerp(Math.log(z), Math.log(ZOUT.z), zp));
    if (zp < 1) { moving = true; speed = Math.max(speed, Math.sin(Math.PI * zp) * 0.8); }
  }
  return { x, y, z, moving, speed };
}

// ------------------------------------------------------------------ boards --
const BOARD = {};

BOARD.hook = (g, t) => {
  const BY = -330, BH = 150 * 0.95, top = BY - BH / 2;
  // left column of pixel icons + a small real photo tile (as in the reference)
  sprite(g, "sparkles", -440, BY - 84, 7, COL.ink, spring(win(0.3, 1.0, t)));
  sprite(g, "mug", -440, BY, 7, COL.ink, spring(win(0.45, 1.15, t)));
  sprite(g, "cloud", -440, BY + 84, 7, COL.ink, spring(win(0.6, 1.3, t)));
  frameTile(g, { at: 0.35, x: -262, y: BY, w: 200, h: 160, r: 4, border: false, clip: "ff_moviola_wide", ss: 2, rin: 0, grain: true }, t);
  serif(g, "Video editing", -420, -650, 118, t, C.hook_editing - 0.55, { stagger: 0.09 });
  serif(g, "has been", -420, -510, 118, t, C.hook_editing + 0.2, { stagger: 0.09 });
  pixBlock(g, "REINVENTED", -140, BY, 150, t, C.hook_reinvented - 0.15, { w: 640 });
  // a 1960s Moviola stands on the block; its cut-off base hides behind it
  g.save(); g.beginPath(); g.rect(-700, -1000, 1400, 1000 + top + 1); g.clip();
  object(g, "ff_moviola", 370, top + 64, 230, t, C.hook_reinvented + 0.25);
  g.restore();
  // three times... and a fourth
  ["film", "tape", "timeline"].forEach((nm, i) => {
    const at = C.hook_three + i * 0.17;
    const p = spring(win(at, at + 0.7, t));
    if (p <= 0) return;
    g.save(); g.globalAlpha = clamp(p * 2);
    g.translate(-300 + i * 170, -80 + (1 - p) * 30);
    g.font = `84px "${PIX}"`; g.fillStyle = COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i + 1), 0, 0);
    g.font = `italic 500 32px "${SERIF}"`; g.fillStyle = COL.soft; g.fillText(nm, 0, 62);
    g.restore();
  });
  const four = spring(win(C.hook_again - 0.15, C.hook_again + 0.6, t));
  if (four > 0) {
    g.save(); g.translate(210, -80); g.scale(four, four);
    g.fillStyle = COL.butter; g.fillRect(-56, -52, 112, 104);
    g.font = `92px "${PIX}"`; g.fillStyle = COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("4", 0, 4);
    g.restore();
    small(g, "now", 210, -18, 32, t, C.hook_again, { align: "center" });
    sprite(g, "sparkle", 288, -138, 6, COL.ink, spring(win(C.hook_again + 0.1, C.hook_again + 0.8, t)));
  }
  object(g, "ff_cup", 350, 470, 260, t, 0.15, { rot: -12 });
  frameTile(g, { at: C.hook_now - 0.3, x: -210, y: 260, w: 420, h: 315, r: 18, clip: "moviola", ss: 1, rot: -3, grain: true }, t);
  small(g, "an editor at work, 1954", -415, 452, 28, t, C.hook_now);
};

// film era: color footage of a Moviola, then the strip itself, cut and spliced.
const STRIP_FRAMES = [["ff_moviola_film", 1.0], ["ff_moviola_film", 2.4], ["ff_moviola_hands", 1.2], ["ff_moviola_wide", 3.0], ["ff_moviola_hands", 3.5], ["ff_moviola_film", 4.4]];
BOARD.film = (g, t) => {
  serif(g, "First,", -400, -720, 104, t, C.s_film + 0.35);
  pixBlock(g, "FILM", -120, -755, 170, t, C.film_film - 0.12, { pad: 40 });
  small(g, "1900s – 1990s", 260, -755, 34, t, C.film_film + 0.2, { italic: true });
  frameTile(g, { at: C.s_film + 0.2, x: 0, y: -290, w: 860, h: 560, r: 22, grain: true,
    clip: [{ clip: "ff_moviola_wide", from: C.s_film + 0.2, ss: 1 }, { clip: "ff_moviola_hands", from: C.film_editors - 0.1 }] }, t);
  small(g, "a Moviola editing machine, 1960s", -430, 30, 30, t, C.film_editors);
  filmStrip(g, t);
  sprite(g, "sparkle", 430, -560, 6, COL.ink, spring(win(C.film_film, C.film_film + 0.7, t)));
};
function filmStrip(g, t) {
  const at = C.film_cut - 0.35;
  const p = outQuint(win(at, at + 0.8, t));
  if (p <= 0) return;
  const fw = 172, fh = 128, n = STRIP_FRAMES.length, total = n * (fw + 18) + 18, hh = fh + 56;
  const split = outCubic(win(C.film_spliced - 0.2, C.film_spliced + 0.35, t)) * (1 - inOutCubic(win(C.film_together - 0.35, C.film_together + 0.2, t)));
  const y0 = 300;
  g.save();
  g.translate(lerp(900, 0, p), y0);
  g.rotate(-0.035);
  for (let half = 0; half < 2; half++) {
    g.save();
    const dx = (half ? 1 : -1) * split * 46, dy = (half ? 1 : -1) * split * 8;
    g.translate(dx, dy);
    g.beginPath(); half ? g.rect(0, -400, 2000, 800) : g.rect(-2000, -400, 2000, 800); g.clip();
    shadowSoft(g); g.fillStyle = "#1a1a1c"; g.fillRect(-total / 2, -hh / 2, total, hh); K.noShadow(g);
    g.fillStyle = "#eef0f3";
    for (let x = -total / 2 + 12; x < total / 2 - 10; x += 26) { K.rr(g, x, -hh / 2 + 8, 14, 12, 3); g.fill(); K.rr(g, x, hh / 2 - 20, 14, 12, 3); g.fill(); }
    STRIP_FRAMES.forEach(([clip, ss], i) => {
      const fx = -total / 2 + 18 + i * (fw + 18);
      const fr = K.footage(clip, ss + 0.4 * Math.sin(t * 0.5 + i), 1);
      g.save(); g.beginPath(); g.rect(fx, -fh / 2, fw, fh); g.clip();
      K.drawFit(g, fr, fx, -fh / 2, fw, fh); g.restore();
    });
    g.restore();
  }
  // the cut line and a strip of splicing tape
  const cutA = outCubic(win(C.film_cut, C.film_cut + 0.5, t));
  if (cutA > 0 && split < 0.05) {
    g.strokeStyle = "rgba(216,73,47,0.9)"; g.setLineDash([10, 8]); g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, -hh / 2 - 24); g.lineTo(0, lerp(-hh / 2 - 24, hh / 2 + 24, cutA)); g.stroke(); g.setLineDash([]);
  }
  const tape = outQuint(win(C.film_together + 0.05, C.film_together + 0.5, t));
  if (tape > 0) { g.fillStyle = "rgba(241,227,174,0.88)"; g.fillRect(-34, -hh / 2 - 14, 68, (hh + 28) * tape); }
  g.restore();
  // pixel scissors travel along the cut line
  const sc = win(C.film_cut - 0.2, C.film_hand + 0.4, t);
  if (sc > 0 && t < C.film_spliced + 0.4) {
    const a = 1 - win(C.film_spliced, C.film_spliced + 0.4, t);
    g.save(); g.globalAlpha = a; sprite(g, "scissors", 0, y0 - 150 + 300 * inOutCubic(sc), 9, COL.ink, 1); g.restore();
  }
  small(g, "cut by hand · spliced with tape", 0, y0 + 160, 32, t, C.film_spliced, { align: "center" });
}

// tape era: two machines, shots copied from one to the other, in order.
BOARD.tape = (g, t) => {
  serif(g, "Then,", -400, -740, 104, t, C.s_tape + 0.35);
  pixBlock(g, "TAPE", -150, -775, 170, t, C.tape_tape - 0.12, { pad: 40 });
  small(g, "1960s – 2000s", 230, -775, 34, t, C.tape_tape + 0.2);
  const A = { x: -10, y: -410, w: 840, h: 330 }, Bm = { x: 10, y: 80, w: 840, h: 330 };
  frameTile(g, { at: C.tape_tape - 0.1, ...A, r: 20, clip: "ff_reel", rot: -1.2,
    after: (g2, w, h, tt) => machineLabel(g2, w, h, tt, "PLAY", "play", C.tape_tape + 0.3) }, t);
  frameTile(g, { at: C.tape_video - 0.2, ...Bm, r: 20, clip: [{ clip: "ff_vcr", from: C.tape_video - 0.2, ss: 0.5 }, { clip: "ff_vhs", from: C.tape_magnetic + 0.4, ss: 3 }], rot: 1.2,
    after: (g2, w, h, tt) => machineLabel(g2, w, h, tt, "REC", "rec", C.tape_video + 0.1) }, t);
  small(g, "machine A", 430, -600, 30, t, C.tape_copying - 0.3, { align: "right" });
  small(g, "machine B", 430, -110, 30, t, C.tape_copying - 0.3, { align: "right" });
  // shots travel from A to B, one at a time, and line up in order
  const cues = [C.tape_copying, C.tape_shots, C.tape_machine, C.tape_another];
  const clips = [["ff_moviola_wide", 2], ["ff_coffee", 1], ["ff_reel", 4], ["ff_cassette", 2]];
  cues.forEach((at, i) => {
    const p = inOutCubic(win(at - 0.1, at + 0.65, t));
    if (p <= 0) return;
    const sx = -300 + i * 40, sy = -410, ex = -300 + i * 200, ey = 330;
    const ord = outQuint(win(C.tape_order - 0.1, C.tape_order + 0.6, t));
    const x = lerp(sx, ex, p), y = lerp(sy, ey, p) - Math.sin(Math.PI * p) * 120 - ord * 0;
    const fr = K.footage(clips[i][0], clips[i][1]);
    g.save(); g.translate(x, y); g.rotate((1 - p) * 0.2 - 0.03 + ord * 0.03);
    const w = 168, h = 104;
    shadowSoft(g); g.fillStyle = "#fff"; g.fillRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12); K.noShadow(g);
    g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); K.drawFit(g, fr, -w / 2, -h / 2, w, h); g.restore();
    g.fillStyle = COL.butter; g.fillRect(-w / 2 - 6, -h / 2 - 34, 46, 30);
    g.font = `34px "${PIX}"`; g.fillStyle = COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i + 1), -w / 2 + 17, -h / 2 - 18);
    g.restore();
  });
  const ord = outCubic(win(C.tape_order - 0.05, C.tape_order + 0.5, t));
  if (ord > 0) {
    g.save(); g.globalAlpha = ord; g.strokeStyle = COL.ink; g.lineWidth = 3; g.setLineDash([2, 10]); g.lineCap = "round";
    g.beginPath(); g.moveTo(-300, 420); g.lineTo(lerp(-300, 300, ord), 420); g.stroke(); g.restore();
    sprite(g, "arrow", lerp(-300, 320, ord), 420, 6, COL.ink, 1);
    small(g, "in order — no going back", 0, 470, 32, t, C.tape_order + 0.1, { align: "center" });
  }
};
function machineLabel(g, w, h, t, label, icon, at) {
  const p = outCubic(win(at, at + 0.5, t));
  if (p <= 0) return;
  g.save(); g.globalAlpha = p;
  g.fillStyle = COL.butter; g.fillRect(-w / 2 + 22, -h / 2 + 22, 150, 52);
  sprite(g, icon, -w / 2 + 50, -h / 2 + 48, 5, icon === "rec" ? COL.red : COL.ink, 1);
  g.font = `44px "${PIX}"`; g.fillStyle = COL.ink; g.textBaseline = "middle"; g.fillText(label, -w / 2 + 76, -h / 2 + 50);
  g.restore();
}

// timeline era: an editing window built from blocks you drag, trim and undo.
const CLIPS = [
  { clip: "ff_coffee", ss: 0, col: COL.peach, x: 0, w: 210 },
  { clip: "ff_moviola_wide", ss: 2, col: COL.sage, x: 210, w: 240 },
  { clip: "ff_reel", ss: 1, col: COL.sky, x: 450, w: 180 },
  { clip: "ff_editkeys", ss: 1, col: COL.lilac, x: 630, w: 170 },
];
BOARD.timeline = (g, t) => {
  serif(g, "Then, the", -400, -740, 104, t, C.s_timeline + 0.35);
  pixBlock(g, "TIMELINE", -400, -620, 150, t, C.tl_timeline - 0.12, { pad: 34 });
  small(g, "1990s – today", 260, -620, 34, t, C.tl_timeline + 0.2);
  const L = K.life(t, C.tl_computers - 0.35, null, 1.0);
  if (!L.on) return;
  const w = 900, h = 900, x0 = -w / 2, y0 = -470;
  // edit state at time t: the blue block is dragged to the front, the last one trimmed, then undo
  const drag = inOutCubic(win(C.tl_drag - 0.05, C.tl_drag + 0.55, t));
  const trim = inOutCubic(win(C.tl_trim - 0.05, C.tl_trim + 0.45, t));
  const undo = inOutCubic(win(C.tl_undo + 0.05, C.tl_undo + 0.5, t));
  const st = CLIPS.map((c) => ({ ...c }));
  st[2].x = lerp(450, 0, drag); st[0].x = lerp(0, 180, drag); st[1].x = lerp(210, 390, drag);
  st[3].w = lerp(170, 100, trim);
  if (undo > 0) { st[3].w = lerp(st[3].w, 170, undo); }
  g.save(); g.translate(0, (1 - L.p) * 70); g.globalAlpha = clamp(L.p * 2);
  shadowSoft(g); g.fillStyle = "#fff"; K.rr(g, x0, y0, w, h, 26); g.fill(); K.noShadow(g);
  // title bar
  g.fillStyle = "#f6f6f4"; K.rr(g, x0, y0, w, 64, [26, 26, 0, 0]); g.fill();
  ["#e9665a", "#f2c14e", "#7cc26b"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(x0 + 34 + i * 26, y0 + 32, 8, 0, 7); g.fill(); });
  g.font = `38px "${PIX}"`; g.fillStyle = COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("my_edit.prj", 0, y0 + 32);
  // viewer: the clip under the playhead
  const ph = (t - C.tl_computers) * 90 % 800;
  const under = st.find((c) => ph >= c.x && ph < c.x + c.w) || st[0];
  const vx = x0 + 40, vy = y0 + 90, vw = w - 80, vh = 450;
  g.save(); K.rr(g, vx, vy, vw, vh, 14); g.clip(); g.fillStyle = "#111"; g.fillRect(vx, vy, vw, vh);
  K.drawFit(g, K.footage(under.clip, under.ss + (t % 4), 1, true), vx, vy, vw, vh); g.restore();
  // tracks
  const tx = x0 + 50, ty = vy + vh + 70, scale = (w - 100) / 800;
  g.fillStyle = "#f2f3f5"; K.rr(g, x0 + 30, ty - 40, w - 60, 250, 14); g.fill();
  for (let i = 0; i <= 8; i++) { g.fillStyle = COL.line; g.fillRect(tx + i * 100 * scale, ty - 34, 2, 12); }
  st.forEach((c, i) => {
    const bp = spring(win(C.tl_blocks - 0.25 + i * 0.09, C.tl_blocks + 0.5 + i * 0.09, t));
    if (bp <= 0) return;
    const bx = tx + c.x * scale + 3, bw = c.w * scale - 6, by = ty, bh = 120;
    const lift = (i === 2 ? Math.sin(Math.PI * drag) : 0) * 30;
    g.save(); g.translate(bx + bw / 2, by + bh / 2 - lift); g.scale(bp, bp);
    if (lift > 1) { g.shadowColor = "rgba(0,0,0,0.2)"; g.shadowBlur = 24; g.shadowOffsetY = 12; }
    g.fillStyle = c.col; K.rr(g, -bw / 2, -bh / 2, bw, bh, 10); g.fill(); K.noShadow(g);
    g.save(); K.rr(g, -bw / 2 + 8, -bh / 2 + 8, bw - 16, 66, 6); g.clip();
    K.drawFit(g, K.footage(c.clip, c.ss), -bw / 2 + 8, -bh / 2 + 8, bw - 16, 66); g.restore();
    g.font = `30px "${PIX}"`; g.fillStyle = COL.ink; g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(c.clip.replace("ff_", "").replace("_wide", "").slice(0, 8), -bw / 2 + 10, bh / 2 - 22);
    g.restore();
  });
  // audio track bar
  const ab = spring(win(C.tl_blocks + 0.4, C.tl_blocks + 1.1, t));
  if (ab > 0) { g.fillStyle = "#dfe3d6"; K.rr(g, tx + 3, ty + 136, (800 * scale - 6) * ab, 36, 8); g.fill();
    g.fillStyle = "#9fb08f"; for (let i = 0; i < 70 * ab; i++) { const a = 6 + 12 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)); g.fillRect(tx + 10 + i * 10.5, ty + 154 - a / 2, 4, a); } }
  // playhead
  if (t > C.tl_clips) { g.fillStyle = COL.red; g.fillRect(tx + ph * scale, ty - 50, 3, 230); g.beginPath(); g.moveTo(tx + ph * scale - 9, ty - 52); g.lineTo(tx + ph * scale + 12, ty - 52); g.lineTo(tx + ph * scale + 1.5, ty - 38); g.fill(); }
  // pixel cursor doing the work
  const cp = (a, b, k) => lerp(a, b, k);
  let cx = tx + 600 * scale, cy = ty + 220;
  if (t > C.tl_drag - 0.5) { const k = outCubic(win(C.tl_drag - 0.5, C.tl_drag - 0.05, t)); cx = cp(cx, tx + (st[2].x + 90) * scale, k); cy = cp(cy, ty + 60, k); }
  if (t > C.tl_drag - 0.05) { cx = tx + (st[2].x + 90) * scale; cy = ty + 60 - Math.sin(Math.PI * drag) * 30; }
  if (t > C.tl_trim - 0.45) { const k = outCubic(win(C.tl_trim - 0.45, C.tl_trim - 0.05, t)); cx = cp(cx, tx + (st[3].x + st[3].w) * scale - 4, k); cy = cp(cy, ty + 60, k); }
  if (t > C.tl_trim - 0.05) { cx = tx + (st[3].x + st[3].w) * scale - 4; }
  sprite(g, "cursor", cx + 26, cy + 30, 6, COL.ink, 1);
  // ⌘Z key for undo
  const kz = spring(win(C.tl_undo - 0.1, C.tl_undo + 0.55, t)) * (1 - win(C.tl_undo + 1.1, C.tl_undo + 1.5, t));
  if (kz > 0) {
    g.save(); g.translate(300, y0 + h - 70); g.scale(kz, kz);
    g.fillStyle = COL.butter; K.rr(g, -90, -44, 180, 88, 12); g.fill(); g.strokeStyle = COL.ink; g.lineWidth = 4; g.stroke();
    g.font = `64px "${PIX}"`; g.fillStyle = COL.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("⌘ Z", 0, 4);
    g.restore();
  }
  g.restore();
  // a floppy disk going in, as the era badge
  frameTile(g, { at: C.tl_computers + 0.2, x: 330, y: -800 + 20, w: 230, h: 150, r: 14, clip: "ff_floppy", ss: 0.4, rot: 4 }, t);
};

// prompt era: you type it in plain words, the video builds itself.
const PROMPT = "cozy recap of editing history. warm, slow, soft music, captions.";
BOARD.prompt = (g, t) => {
  serif(g, "And now, the", -400, -740, 104, t, C.s_prompt + 0.35);
  pixBlock(g, "PROMPT", -400, -620, 150, t, C.pr_prompt - 0.12, { pad: 34 });
  small(g, "today", 160, -620, 34, t, C.pr_prompt + 0.2);
  // the person typing, then the video the words became
  frameTile(g, { at: C.pr_prompt - 0.2, x: 0, y: -320, w: 860, h: 400, r: 22, clip: "ff_typing", ss: 0.5 }, t);
  const bp = win(C.pr_builds - 0.15, C.pr_builds + 1.0, t);
  if (bp > 0) {
    g.save(); g.translate(0, -320);
    pixelReveal(g, -430, -200, 860, 400, bp, 43, (q, x, y, w, h) => {
      q.save(); K.rr(q, x, y, w, h, 22); q.clip(); K.drawFit(q, K.footage("ff_coffee", t - C.pr_builds + 2, 1, true), x, y, w, h);
      q.restore();
    });
    g.restore();
    const rd = outCubic(win(C.pr_builds + 0.9, C.pr_builds + 1.3, t));
    if (rd > 0) { g.save(); g.globalAlpha = rd; g.fillStyle = COL.butter; g.fillRect(-410, -500, 190, 56);
      sprite(g, "play", -380, -472, 5, COL.ink, 1); g.font = `46px "${PIX}"`; g.fillStyle = COL.ink; g.textBaseline = "middle"; g.fillText("READY", -350, -470); g.restore(); }
  }
  // the prompt box: words typing in pixel type
  const L = K.life(t, C.pr_describe - 0.4, null, 0.9);
  if (L.on) {
    const w = 880, h = 330, x = -w / 2, y = 30;
    g.save(); g.translate(0, (1 - L.p) * 50); g.globalAlpha = clamp(L.p * 2);
    g.fillStyle = COL.butter; g.fillRect(x, y, w, h);
    g.font = `40px "${PIX}"`; g.fillStyle = COL.soft; g.textBaseline = "top"; g.fillText("> describe the edit", x + 36, y + 28);
    g.font = `62px "${PIX}"`; g.fillStyle = COL.ink;
    const shown = K.typed(PROMPT, t, C.pr_describe + 0.1, 24);
    const lines = K.wrap(g, shown, w - 80);
    lines.forEach((ln, i) => g.fillText(ln, x + 36, y + 90 + i * 64));
    if (Math.floor(t * 2.2) % 2 === 0) { const ll = lines[lines.length - 1] || ""; g.fillRect(x + 40 + g.measureText(ll).width, y + 96 + (lines.length - 1) * 64, 26, 50); }
    g.restore();
    const ai = spring(win(C.pr_ai - 0.1, C.pr_ai + 0.6, t));
    if (ai > 0) { g.save(); g.translate(330, y + h + 40); g.scale(ai, ai); g.fillStyle = COL.ink; g.fillRect(-90, -34, 180, 68);
      g.font = `52px "${PIX}"`; g.fillStyle = COL.butter; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AI ✓", 0, 3); g.restore();
      sprite(g, "sparkles", 200, y + h + 30, 6, COL.ink, ai); }
  }
};

// ------------------------------------------------------------------ the pull-back and the recap --
const ERAS = [
  { k: "film", word: "FILM", serif: "Film.", clip: "ff_moviola_wide", ss: 3, cue: "o_film" },
  { k: "tape", word: "TAPE", serif: "Tape.", clip: "ff_reel", ss: 2, cue: "o_tape" },
  { k: "timeline", word: "TIMELINE", serif: "Timeline.", clip: "ff_editkeys", ss: 2, cue: "o_timeline" },
  { k: "prompt", word: "TEXT", serif: "Text.", clip: "ff_typing", ss: 1, cue: "o_text" },
];
function whyOverlay(g, t) {   // screen space, over the pulled-back row
  const a = outCubic(win(C.s_why + 0.6, C.s_why + 1.2, t)) * (1 - win(C.s_outro - 0.1, C.s_outro + 0.4, t));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  serif(g, "Every step made editing", W / 2, 520, 78, t, C.why_every - 0.1, { align: "center" });
  // faster: a pixel arrow runs along the row
  const f = inOutCubic(win(C.why_faster - 0.15, C.why_faster + 0.7, t));
  if (f > 0) {
    pixBlock(g, "FASTER", W / 2, 640, 96, t, C.why_faster - 0.1, { align: "center", pad: 26 });
    g.strokeStyle = COL.ink; g.lineWidth = 6; g.setLineDash([6, 12]); g.lineCap = "square";
    g.beginPath(); g.moveTo(110, 1240); g.lineTo(lerp(110, 960, f), 1240); g.stroke(); g.setLineDash([]);
    sprite(g, "arrow", lerp(110, 970, f), 1240, 8, COL.ink, 1);
  }
  // more people: little pixel people multiply under the row
  const pp = win(C.why_opened - 0.1, C.why_people + 0.8, t);
  if (pp > 0) {
    small(g, "and opened it up to more people", W / 2, 1310, 40, t, C.why_opened, { align: "center", color: COL.ink });
    const n = Math.floor(lerp(1, 24, outCubic(pp)));
    for (let i = 0; i < n; i++) sprite(g, "person", W / 2 - 23 * 24 / 2 + i * 24 + 12, 1385, 5, i % 5 === 2 ? COL.red : COL.ink, spring(win(C.why_opened + i * 0.04, C.why_opened + i * 0.04 + 0.5, t)));
  }
  g.restore();
}
function recap(g, t) {   // 2x2 tiles, then "Tell a better story"
  const s = C.s_outro;
  const into = inOutQuint(win(s - 0.2, s + 0.9, t));
  if (into <= 0) return;
  const cam = camOut;   // where each board sat in the pulled-back shot
  const gw = 440, gh = 330, gx = [W / 2 - 236, W / 2 + 236], gy = [560, 940];
  const leave = inOutCubic(win(C.o_goal - 0.3, C.o_goal + 0.6, t));
  ERAS.forEach((e, i) => {
    const from = { x: (B[e.k] - cam.x) * cam.z + W / 2, y: (-290 - cam.y) * cam.z + H / 2, w: 860 * cam.z, h: 560 * cam.z };
    const to = { x: gx[i % 2], y: gy[Math.floor(i / 2)], w: gw, h: gh };
    const k = clamp(into * 1.08 - i * 0.025);
    let x = lerp(from.x, to.x, k), y = lerp(from.y, to.y, k), w = lerp(from.w, to.w, k), h = lerp(from.h, to.h, k);
    // when the goal line comes, the tiles gather into the middle and shrink away
    x = lerp(x, W / 2, leave); y = lerp(y, 760, leave); w *= 1 - 0.85 * leave; h *= 1 - 0.85 * leave;
    const alpha = 1 - win(C.o_goal + 0.2, C.o_goal + 0.6, t);
    if (alpha <= 0) return;
    const lit = outCubic(win(C[e.cue] - 0.1, C[e.cue] + 0.3, t));
    g.save(); g.globalAlpha = alpha; g.translate(x, y); g.rotate((i % 2 ? 1.5 : -1.5) * (1 - leave) * Math.PI / 180 * k);
    shadowSoft(g); g.fillStyle = "#fff"; K.rr(g, -w / 2 - 9, -h / 2 - 9, w + 18, h + 18, 22); g.fill(); K.noShadow(g);
    g.save(); K.rr(g, -w / 2, -h / 2, w, h, 16); g.clip();
    K.drawFit(g, K.footage(e.clip, e.ss + t - s, 1, true), -w / 2, -h / 2, w, h);
    g.fillStyle = `rgba(238,240,243,${0.55 * (1 - lit) * k})`; g.fillRect(-w / 2, -h / 2, w, h);
    g.restore();
    if (k > 0.6 && leave < 0.5) {
      const la = clamp((k - 0.6) / 0.4) * (1 - leave * 2);
      g.globalAlpha = alpha * la;
      g.font = `64px "${PIX}"`; const tw = g.measureText(e.word).width;
      g.fillStyle = lit > 0.5 ? COL.butter : "#fff"; g.fillRect(-w / 2 + 10, h / 2 - 66, tw + 30, 56);
      g.fillStyle = COL.ink; g.textBaseline = "middle"; g.fillText(e.word, -w / 2 + 25, h / 2 - 36);
    }
    g.restore();
  });
  serif(g, "The tools keep changing.", W / 2, 1230, 64, t, C.o_changing - 0.5, { align: "center", out: C.o_goal - 0.2 });
  // the end card: a cup of coffee is the O in STORY (after the cup in "Cozy")
  const e0 = C.o_goal - 0.1;
  serif(g, "The goal never does.", W / 2, 470, 60, t, e0, { align: "center", italic: true, color: COL.soft });
  serif(g, "Tell a better", 110, 690, 120, t, C.o_tell - 0.2, {});
  const b = pixBlock(g, "ST RY", W / 2 - 330, 880, 230, t, C.o_story - 0.25, { pad: 46, cps: 30 });
  const cupP = spring(win(C.o_story + 0.05, C.o_story + 0.8, t));
  if (cupP > 0) {
    g.save(); g.font = `230px "${PIX}"`;
    const ox = W / 2 - 330 + 46 + g.measureText("ST").width + g.measureText(" ").width / 2;
    g.restore();
    const im = K.object("ff_cup");
    if (im) { const cw = 150 * cupP; g.save(); g.translate(ox, 878); g.rotate(-0.4 + (1 - cupP) * 0.6);
      g.shadowColor = "rgba(40,40,50,0.25)"; g.shadowBlur = 20; g.shadowOffsetY = 8;
      g.drawImage(im, -cw / 2, -cw * im.height / im.width / 2, cw, cw * im.height / im.width); g.restore(); }
  }
  g.save(); g.beginPath(); g.rect(0, 0, W, 880 - 230 * 0.95 / 2 + 2); g.clip();
  object(g, "ff_moviola", W / 2 + 380, 880 - 230 * 0.95 / 2 + 70, 190, t, C.o_story + 0.25);
  g.restore();
  sprite(g, "sparkles", W / 2 - 400, 1080, 7, COL.ink, spring(win(C.o_story + 0.4, C.o_story + 1.0, t)));
  sprite(g, "mug", W / 2 - 300, 1080, 7, COL.ink, spring(win(C.o_story + 0.5, C.o_story + 1.1, t)));
  sprite(g, "heart", W / 2 - 200, 1080, 7, COL.ink, spring(win(C.o_story + 0.6, C.o_story + 1.2, t)));
  small(g, "from film to prompts", W / 2 + 400, 1080, 36, t, C.o_story + 0.7, { align: "right" });
}
let camOut = ZOUT;

// ------------------------------------------------------------------ frame --
const BG = (() => {   // the paper: cool off-white with a soft light falloff and faint tooth
  const c = K.makeCanvas(W, H), g = c.getContext("2d");
  g.fillStyle = COL.bg; g.fillRect(0, 0, W, H);
  const r = g.createRadialGradient(W * 0.45, H * 0.38, 100, W / 2, H / 2, H * 0.75);
  r.addColorStop(0, "rgba(255,255,255,0.55)"); r.addColorStop(1, "rgba(210,214,222,0.35)");
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  const id = g.getImageData(0, 0, W, H), d = id.data, rn = rnd(5);
  for (let i = 0; i < d.length; i += 4) { const n = (rn() - 0.5) * 5; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
})();

function frame(g, t) {
  g.drawImage(BG, 0, 0);
  const cam = camera(t);
  const worldA = 1 - inOutCubic(win(C.s_outro - 0.15, C.s_outro + 0.5, t));
  if (worldA > 0) {
    g.save(); g.globalAlpha = worldA;
    g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
    // in the pull-back, each era sits on a soft card so the row reads as four chapters
    const cardA = clamp((0.6 - cam.z) / 0.3);
    for (const [k, bx] of Object.entries(B)) {
      if (Math.abs(bx - cam.x) * cam.z > W / 2 + 700 * cam.z) continue;
      if (k === "hook" && t > C.s_film + 1.2) continue;   // the intro board isn't part of the era row
      if (cardA > 0 && k !== "hook") {
        g.save(); g.globalAlpha = worldA * cardA; g.fillStyle = "#fff"; g.shadowColor = "rgba(40,45,60,0.14)"; g.shadowBlur = 120; g.shadowOffsetY = 40;
        K.rr(g, bx - 560, -960, 1120, 1520, 60); g.fill(); g.restore();
      }
      g.save(); g.translate(bx, 0); BOARD[k](g, t); g.restore();
    }
    g.restore();
  }
  whyOverlay(g, t);
  recap(g, t);
  K.captions(g, t, { y: 1530, size: 50, weight: 600, family: SERIF, color: COL.ink, hi: COL.butter, hiText: COL.ink, radius: 2 });
  K.grain(g, t, 0.035);
  return { moving: cam.moving, speed: cam.speed };
}
K.run(frame, [`500 40px "${SERIF}"`, `italic 500 40px "${SERIF}"`, `600 40px "${SERIF}"`, `40px "${PIX}"`]);
})();

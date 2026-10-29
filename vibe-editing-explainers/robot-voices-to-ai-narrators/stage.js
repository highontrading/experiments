// From robot voices to AI narrators: a sports-documentary history collage.
// Real "worlds" as backdrops, giant years, yellow boxes, index cards with red stamps,
// archival film in a real TV, smoke wipes, and a hero object on black at the end.
(function () {
const { C, W, H, clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, spring } = K;
const YEL = "#ffd400", RED = "#e01e25", INK = "#111", CREAM = "#f2ecdd";

// ---------------------------------------------------------------- scenes --
// [start, kind of cut into it, draw]
const S = [];
const at = (t0, cut, draw) => S.push({ t0, cut, draw });

// ---------------------------------------------------------------- helpers --
function bg(g, name, lt, o = {}) {        // full-bleed footage, slow push, graded
  const fr = K.footage(name, (o.ss || 0) + lt * (o.speed || 1), 1, o.loop);
  if (!fr) return;
  const z = (o.zoom || 1.08) + (o.push ?? 0.05) * lt / 3;
  g.save();
  if (o.filter) g.filter = o.filter;
  K.drawFit(g, fr, -W * (z - 1) / 2, -H * (z - 1) / 2, W * z, H * z, { fx: o.fx ?? 0.5, fy: o.fy ?? 0.5 });
  g.restore();
  if (o.dark) { g.fillStyle = `rgba(0,0,0,${o.dark})`; g.fillRect(0, 0, W, H); }
}
function slam(t, at0, dur = 0.5) {   // 0..1 entrance with a hard landing
  const p = win(at0, at0 + dur, t);
  return { p, s: 1 + 0.35 * Math.pow(1 - outExpo(p), 2), a: clamp(p * 5) };
}
function ybox(g, text, x, y, size, t, at0, o = {}) {   // yellow box, heavy black caps
  if (t < at0) return;
  const { s, a } = slam(t, at0, 0.45);
  K.font(g, size, 400, "Archivo Black");
  const lines = text.split("\n");
  const tw = Math.max(...lines.map((l) => g.measureText(l).width));
  const pad = size * 0.38, lh = size * 1.02, bw = (o.w || tw + pad * 2), bh = lines.length * lh + pad * 1.1;
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(s, s); g.globalAlpha = a;
  K.shadow(g, 30, 14, 0.5, "0,0,0");
  g.fillStyle = o.bg || YEL; g.fillRect(-bw / 2, -bh / 2, bw, bh);
  K.noShadow(g);
  g.strokeStyle = "rgba(0,0,0,0.85)"; g.lineWidth = 5; g.strokeRect(-bw / 2 + 9, -bh / 2 + 9, bw - 18, bh - 18);
  g.fillStyle = o.fg || INK; g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach((l, i) => g.fillText(l, 0, -bh / 2 + pad * 0.55 + lh * (i + 0.5) + size * 0.04));
  g.restore();
}
function big(g, text, x, y, size, t, at0, o = {}) {    // blocky display statement
  if (t < at0) return;
  const { s, a } = slam(t, at0, o.dur || 0.42);
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(s, s); g.globalAlpha = a * (o.alpha ?? 1);
  K.font(g, size, 400, o.font || "Bungee");
  g.textAlign = o.align || "center"; g.textBaseline = "middle";
  if (o.stroke) { g.lineJoin = "round"; g.lineWidth = size * 0.12; g.strokeStyle = o.stroke; g.strokeText(text, 0, 0); }
  K.shadow(g, 24, 10, 0.55, "0,0,0");
  g.fillStyle = o.color || "#fff"; g.fillText(text, 0, 0);
  g.restore();
}
function stamp(g, text, x, y, size, t, at0, rot = -12) {   // red rubber stamp
  if (t < at0) return;
  const p = win(at0, at0 + 0.22, t), s = lerp(2.4, 1, outCubic(p)), a = clamp(p * 4) * 0.92;
  K.font(g, size, 400, "Archivo Black");
  const tw = g.measureText(text).width, bw = tw + size * 0.9, bh = size * 1.45;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.scale(s, s); g.globalAlpha = a;
  g.strokeStyle = RED; g.lineWidth = size * 0.12; K.rr(g, -bw / 2, -bh / 2, bw, bh, size * 0.18); g.stroke();
  g.lineWidth = size * 0.05; K.rr(g, -bw / 2 + size * 0.16, -bh / 2 + size * 0.16, bw - size * 0.32, bh - size * 0.32, size * 0.1); g.stroke();
  g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, size * 0.05);
  g.globalCompositeOperation = "destination-out"; g.globalAlpha = 0.35;   // worn ink
  g.drawImage(K.GRAIN[(at0 * 10 | 0) % 6], -bw / 2, -bh / 2, bw, bh);
  g.restore();
}
function card(g, x, y, w, h, rot, t, at0, draw, o = {}) {     // paper index card
  if (t < at0) return;
  const p = outQuint(win(at0, at0 + 0.45, t));
  g.save(); g.translate(x + (o.dx ?? -500) * (1 - p), y + (o.dy ?? 0) * (1 - p)); g.rotate((rot + (1 - p) * (o.rin ?? -14)) * Math.PI / 180);
  K.shadow(g, 26, 16, 0.5, "0,0,0");
  g.fillStyle = CREAM; g.fillRect(-w / 2, -h / 2, w, h); K.noShadow(g);
  g.globalAlpha = 0.18; g.globalCompositeOperation = "multiply";
  g.drawImage(K.GRAIN[(x | 0) % 6], -w / 2, -h / 2, w, h); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  g.strokeStyle = "rgba(30,60,120,0.18)"; g.lineWidth = 2;
  for (let ly = -h / 2 + h * 0.36; ly < h / 2 - 10; ly += 30) { g.beginPath(); g.moveTo(-w / 2 + 18, ly); g.lineTo(w / 2 - 18, ly); g.stroke(); }
  draw(g, w, h);
  g.restore();
}
function footRect(g, name, lt, x, y, w, h, o = {}) {   // footage clipped to a rect
  g.save(); K.rr(g, x, y, w, h, o.r || 0); g.clip();
  g.fillStyle = "#000"; g.fillRect(x, y, w, h);
  if (o.filter) g.filter = o.filter;
  K.drawFit(g, K.footage(name, (o.ss || 0) + lt, 1, o.loop), x, y, w, h, { fx: o.fx, fy: o.fy, zoom: o.zoom });
  g.restore();
}
const TV = { x0: 0.29, y0: 0.3474, x1: 0.708, y1: 0.9242 };
function tvbox(g, cx, cy, w, screen, t, rot = 0) {     // real TV boombox with footage on its screen
  const im = K.object("rv_tvbox"); if (!im) return;
  const h = w * im.height / im.width;
  g.save(); g.translate(cx, cy); g.rotate(rot * Math.PI / 180);
  K.shadow(g, 40, 24, 0.55, "0,0,0"); g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
  const sx = -w / 2 + TV.x0 * w + 6, sy = -h / 2 + TV.y0 * h + 6, sw = (TV.x1 - TV.x0) * w - 12, sh = (TV.y1 - TV.y0) * h - 12;
  g.save(); K.rr(g, sx, sy, sw, sh, sw * 0.07); g.clip();
  screen(g, sx, sy, sw, sh);
  g.globalAlpha = 0.12; g.fillStyle = "#000";                      // scanlines
  for (let yy = sy; yy < sy + sh; yy += 4) g.fillRect(sx, yy, sw, 2);
  g.globalAlpha = 1;
  const vg = g.createRadialGradient(sx + sw / 2, sy + sh / 2, sh * 0.3, sx + sw / 2, sy + sh / 2, sw * 0.75);
  vg.addColorStop(0, "rgba(255,255,255,0.06)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = vg; g.fillRect(sx, sy, sw, sh);
  g.restore(); g.restore();
}
function years(g, t, list, active, lt) {    // giant faded stacked years, scrolling
  K.font(g, 250, 400, "Archivo Black");
  g.save(); g.textAlign = "center"; g.textBaseline = "middle";
  const off = lerp(0, 1, outQuint(win(0, 0.9, lt)));
  list.forEach((yr, i) => {
    const y = 960 + (i - list.length + 1 + (1 - off) * 3) * 230;
    const isA = yr === active && off > 0.98;
    g.globalAlpha = isA ? 1 : 0.13 + 0.04 * Math.sin(i);
    g.fillStyle = "#fff";
    if (isA) { K.shadow(g, 30, 10, 0.6, "0,0,0"); }
    g.fillText(yr, 540, y); K.noShadow(g);
  });
  g.restore();
}
function waveBars(g, t, x, y, w, h, color, n = 60) {     // the narrator's real loudness, live
  const WV = window.WAVE;
  g.save(); g.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const k = Math.max(0, Math.floor((t - (n - i) * 0.035) * 100));
    const v = WV[Math.min(WV.length - 1, k)] || 0;
    const bh = 6 + v * h, bw = w / n * 0.6, bx = x + i * w / n;
    K.rr(g, bx, y - bh / 2, bw, bh, bw / 2); g.fill();
  }
  g.restore();
}
function dateline(g, text, x, y, t, at0, o = {}) {      // small typewriter label
  if (t < at0) return;
  g.save(); g.globalAlpha = clamp((t - at0) * 4) * (o.alpha ?? 0.92);
  K.font(g, o.size || 30, 600, "Mono"); g.fillStyle = o.color || "#fff"; g.textAlign = o.align || "center"; g.textBaseline = "middle";
  K.shadow(g, 8, 3, 0.7, "0,0,0");
  g.fillText(K.typed(text, t, at0, 40), x, y); g.restore();
}

// ---------------------------------------------------------------- the film --
// 1 · "In 1939," — years scroll over a real radio dial
at(0, "open", (g, t, lt) => {
  bg(g, "rv_dial", lt, { filter: "sepia(0.45) contrast(1.15) brightness(0.55)", zoom: 1.25, fx: 0.4 });
  years(g, t, ["1933", "1934", "1935", "1936", "1937", "1938", "1939"], "1939", lt);
  dateline(g, "NEW YORK · APRIL 30", 540, 1160, t, 0.7);
});
// 2 · "at the New York World's Fair," — Technicolor fair, 1939
at(C.fair - 0.3, "cut", (g, t, lt) => {
  bg(g, "rv_fair_color", lt, { ss: 1.4, filter: "contrast(1.1) saturate(1.2) brightness(1.15)", zoom: 1.15 });
  ybox(g, "NEW YORK\nWORLD'S FAIR", 540, 640, 92, t, C.fair);
  dateline(g, "1939 · real footage, Technicolor", 540, 1300, t, C.fair + 0.2, { size: 26 });
});
// 3 · the World of Tomorrow, black & white
at(C.worlds + 0.25, "cut", (g, t, lt) => {
  bg(g, "rv_trylon_bw", lt, { ss: 3.6, filter: "grayscale(1) contrast(1.25) brightness(0.95)", zoom: 1.2 });
  big(g, "1939", 540, 520, 260, t, C.worlds + 0.3, { font: "Archivo Black" });
  dateline(g, "\"THE WORLD OF TOMORROW\"", 540, 700, t, C.worlds + 0.4);
});
// 4 · "Bell Labs showed off a machine that could talk." — archive desk, TV with a talking wave
at(C.bell - 0.15, "cut", (g, t, lt) => {
  bg(g, "rv_wood", lt, { filter: "brightness(0.62) contrast(1.15) saturate(0.9)", zoom: 1.3, push: 0.02 });
  const p = outQuint(win(C.bell - 0.15, C.bell + 0.45, t));
  tvbox(g, lerp(-400, 560, p), 640, 920, (gg, x, y, w, h) => {
    footRect(gg, "rv_scope", t - C.bell, x, y, w, h, { filter: "sepia(0.4) brightness(1.4) contrast(1.2)", zoom: 1.2 });
  }, -3 + 4 * (1 - p));
  dateline(g, "BELL LABS", 300, 260, t, C.bell + 0.05, { size: 40 });
  ybox(g, "A MACHINE\nTHAT COULD TALK", 560, 1170, 84, t, C.machine, { rot: -2 });
  stamp(g, "TALKING", 820, 1330, 54, t, C.talk, -10);
});
// 5 · "It was called the Voder." — the index card
at(C.called - 0.2, "cut", (g, t, lt) => {
  bg(g, "rv_wood", lt + 3, { filter: "brightness(0.55) contrast(1.15)", zoom: 1.35, fx: 0.2, push: 0.02 });
  card(g, 520, 760, 860, 560, -4, t, C.called - 0.15, (gg, w, h) => {
    gg.fillStyle = "#555"; K.font(gg, 30, 600, "Mono"); gg.textAlign = "left"; gg.textBaseline = "alphabetic";
    gg.fillText("0.1", -w / 2 + 40, -h / 2 + 64);
    gg.fillStyle = INK; K.font(gg, 120, 400, "Archivo Black"); gg.fillText("VODER", -w / 2 + 40, -h / 2 + 200);
    K.font(gg, 34, 600, "Mono"); gg.fillStyle = "#333";
    gg.fillText("Voice Operation DEmonstratoR", -w / 2 + 44, -h / 2 + 262);
    gg.fillText("BELL LABS · WORLD'S FAIR · 1939", -w / 2 + 44, -h / 2 + 316);
  }, { dx: 0, dy: 900, rin: 8 });
  stamp(g, "1939", 760, 980, 74, t, C.voder - 0.05, -14);
  ybox(g, "IT WAS CALLED", 420, 360, 64, t, C.called + 0.1, { rot: 3 });
});
// 6 · "Few believed a machine would ever sound human." — above the clouds
at(C.few - 0.25, "smoke", (g, t, lt) => {
  bg(g, "rv_clouds", lt, { filter: "brightness(1.05) contrast(1.05)", zoom: 1.2, push: 0.08 });
  big(g, "FEW", 540, 520, 200, t, C.few + 0.02, { stroke: "rgba(0,0,0,0.25)" });
  big(g, "BELIEVED", 540, 700, 150, t, C.few + 0.25, { stroke: "rgba(0,0,0,0.25)" });
  ybox(g, "SOUND HUMAN?", 540, 980, 96, t, C.human - 0.15, { rot: -3 });
  // the old studio microphone in a round window
  const p = outQuint(win(C.few + 0.4, C.few + 1.0, t));
  if (p > 0) {
    g.save(); g.globalAlpha = p; g.translate(540, 1260); g.scale(lerp(0.6, 1, p), lerp(0.6, 1, p));
    g.beginPath(); g.arc(0, 0, 170, 0, 7); g.lineWidth = 14; g.strokeStyle = "#fff"; K.shadow(g, 30, 10, 0.4, "0,0,0"); g.stroke(); K.noShadow(g);
    g.beginPath(); g.arc(0, 0, 163, 0, 7); g.clip();
    K.drawFit(g, K.footage("rv_mic_vintage", t - C.few, 1), -170, -170, 340, 340, { fx: 0.55 });
    g.restore();
  }
});
// 7 · "In 1961," — a giant red year, the TV flies through it
at(C.y1961 - 0.2, "cut", (g, t, lt) => {
  bg(g, "rv_clouds", lt + 4, { filter: "brightness(1.08) saturate(1.2)", zoom: 1.4, fy: 0.7, push: 0.1 });
  const s1 = slam(t, C.y1961, 0.4);
  g.save(); g.translate(540, 700); g.scale(s1.s, s1.s); g.globalAlpha = s1.a;
  K.font(g, 330, 400, "Archivo Black"); g.textAlign = "center"; g.textBaseline = "middle";
  K.shadow(g, 30, 12, 0.35, "0,0,0"); g.fillStyle = RED; g.fillText("1961", 0, 0); g.restore();
  const p = inOutCubic(win(C.y1961 - 0.1, C.ibm + 0.1, t));
  tvbox(g, lerp(-520, 1600, p), lerp(980, 820, p), 620, (gg, x, y, w, h) => footRect(gg, "rv_reel", t - C.y1961, x, y, w, h, { zoom: 1.3, ss: 0.9 }), lerp(-8, 6, p));
});
// 8 · "an IBM computer at Bell Labs sang a song." — real Bell Labs tape drive, 1960s
at(C.ibm, "cut", (g, t, lt) => {
  bg(g, "rv_tape", lt, { ss: 1.3, filter: "contrast(1.15) saturate(1.1) brightness(0.9)", zoom: 1.15 });
  ybox(g, "IBM 7094", 540, 480, 120, t, C.ibm + 0.35, { rot: -2 });
  dateline(g, "AT BELL LABS", 540, 610, t, C.ibm + 0.7);
  card(g, 560, 1130, 700, 260, 3, t, C.sang - 0.3, (gg, w, h) => {
    gg.fillStyle = "#555"; K.font(gg, 26, 600, "Mono"); gg.textAlign = "left"; gg.fillText("0.2", -w / 2 + 34, -h / 2 + 50);
    gg.fillStyle = INK; K.font(gg, 72, 400, "Archivo Black"); gg.fillText("A COMPUTER", -w / 2 + 34, -h / 2 + 140);
    K.font(gg, 28, 600, "Mono"); gg.fillStyle = "#333"; gg.fillText("and it sang a song", -w / 2 + 36, -h / 2 + 200);
  }, { dx: 600, rin: 12 });
  stamp(g, "SANG", 790, 1050, 70, t, C.sang, 12);
  dateline(g, "archival film: Bell Labs, 1964", 540, 1400, t, C.ibm + 1.2, { size: 22, alpha: 0.7 });
});
// 9 · "Daisy Bell." — the wave on a real oscilloscope
at(C.daisy - 0.25, "cut", (g, t, lt) => {
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  bg(g, "rv_scope", lt + 2.5, { filter: "sepia(0.6) hue-rotate(-15deg) saturate(2) brightness(1.6) contrast(1.3)", zoom: 2.1, push: 0.05 });
  const p = win(C.daisy, C.daisy + 0.25, t);
  const jit = (1 - p) * 18;
  [["#ff2a2a", -jit], ["#2affff", jit], ["#fff", 0]].forEach(([col, dx], i) => {
    g.save(); if (i < 2) g.globalCompositeOperation = "lighter";
    big(g, "DAISY", 540 + dx, 760, 210, t, C.daisy, { color: col, alpha: i < 2 ? 0.7 : 1 });
    big(g, "BELL", 540 - dx, 960, 210, t, C.daisy + 0.18, { color: i === 2 ? YEL : col, alpha: i < 2 ? 0.7 : 1 });
    g.restore();
  });
  dateline(g, "♪  1961", 540, 1140, t, C.daisy + 0.3, { size: 34 });
});
// 10 · "Fifty years later," — dark grunge statement
at(C.fifty - 0.1, "cut", (g, t, lt) => {
  bg(g, "rv_smoke", lt, { filter: "brightness(0.5) contrast(1.4)", zoom: 1.2 });
  big(g, "FIFTY", 540, 820, 190, t, C.fifty + 0.02, { color: RED });
  big(g, "YEARS LATER", 540, 990, 110, t, C.fifty + 0.3);
  dateline(g, "2011", 540, 1140, t, C.fifty + 0.6, { size: 40 });
});
// 11 · "phones started talking back." — real call footage, a real phone with the wave on screen
at(C.phones - 0.15, "cut", (g, t, lt) => {
  bg(g, "rv_phone_talk", lt, { filter: "contrast(1.1) brightness(0.85)", zoom: 1.2, fx: 0.4 });
  const im = K.object("phone"), A = K.A.objects.phone;
  const p = outQuint(win(C.phones, C.phones + 0.5, t));
  if (im && A) {
    const w = 560, h = w * im.height / im.width;
    g.save(); g.translate(lerp(1300, 700, p), 1060); g.rotate((-18 + 10 * (1 - p)) * Math.PI / 180);
    K.shadow(g, 40, 24, 0.6, "0,0,0"); g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
    const s = A.screen, L = s.len * w * 0.97, Wd = s.wid * w * 0.95;
    g.translate(-w / 2 + s.cx * w, -h / 2 + s.cy * w); g.rotate(s.ang * Math.PI / 180 + Math.PI / 2);
    g.save(); K.rr(g, -Wd / 2, -L / 2, Wd, L, Wd * 0.12); g.clip();
    g.fillStyle = "#0d0d10"; g.fillRect(-Wd / 2, -L / 2, Wd, L);
    waveBars(g, t, -Wd / 2 + 20, 0, Wd - 30, L * 0.25, YEL, 26);
    g.restore(); g.restore();
  }
  ybox(g, "PHONES\nTALK BACK", 380, 470, 96, t, C.back - 0.35, { rot: -3 });
});
// 12 · "Then neural networks learned to breathe, pause and laugh." — three real cards
at(C.neural - 0.3, "cut", (g, t, lt) => {
  bg(g, "rv_wood", lt + 5, { filter: "brightness(0.5) contrast(1.2)", zoom: 1.3, fx: 0.8, push: 0.02 });
  ybox(g, "NEURAL NETWORKS", 540, 300, 76, t, C.neural, { rot: -2 });
  dateline(g, "LEARNED TO", 540, 420, t, C.neural + 0.6, { size: 34 });
  g.save(); g.globalAlpha = clamp((t - C.neural) * 3) * (1 - win(C.breathe - 0.3, C.breathe, t));
  waveBars(g, t, 140, 860, 800, 260, "#fff", 44); g.restore();
  const polar = (name, x, y, rot, at0, label, ss) => card(g, x, y, 470, 560, rot, t, at0, (gg, w, h) => {
    footRect(gg, name, t - at0 + ss, -w / 2 + 24, -h / 2 + 24, w - 48, h - 140, { zoom: 1.15 });
    gg.fillStyle = INK; K.font(gg, 56, 400, "Archivo Black"); gg.textAlign = "center"; gg.textBaseline = "middle";
    gg.fillText(label, 0, h / 2 - 62);
  }, { dx: 0, dy: 1200, rin: rot * 2 });
  polar("rv_announcer", 300, 760, -8, C.breathe - 0.25, "BREATHE", 0.5);
  polar("rv_woman_mic", 770, 880, 7, C.pause - 0.25, "PAUSE", 1);
  polar("rv_laugh", 470, 1150, -3, C.laugh - 0.2, "LAUGH", 1.2);
  stamp(g, "HUMAN", 720, 1330, 60, t, C.laugh + 0.35, -12);
});
// 13 · "The voice you're hearing right now took seconds to make." — real console, live wave
at(C.voice - 0.2, "cut", (g, t, lt) => {
  bg(g, "rv_console", lt, { filter: "brightness(0.45) contrast(1.2) saturate(1.2)", zoom: 1.2 });
  big(g, "● RIGHT NOW", 540, 430, 92, t, C.rightnow - 0.05, { color: "#fff" });
  g.save(); g.globalAlpha = clamp((t - C.voice) * 3);
  waveBars(g, t, 120, 760, 840, 300, YEL, 48);
  g.restore();
  if (t > C.seconds - 0.1) {
    ybox(g, "SECONDS TO MAKE", 540, 1060, 84, t, C.seconds - 0.1, { rot: -2 });
    dateline(g, "generated in seconds", 540, 1200, t, C.seconds + 0.1, { size: 34 });
  }
  dateline(g, "this narrator · AI voice", 540, 560, t, C.voice + 0.3, { size: 26, alpha: 0.75 });
});
// 14 · "One line of text. Any language. Any tone." — a line of text, the real globe, tone chips
at(C.oneline - 0.2, "cut", (g, t, lt) => {
  const glb = t > C.language - 0.15;
  if (!glb) bg(g, "rv_wood", lt + 2, { filter: "brightness(0.55) contrast(1.15)", zoom: 1.3, fx: 0.6 });
  else bg(g, "rv_globe", t - C.language + 1, { speed: 0.45, filter: "contrast(1.1) saturate(1.1) brightness(0.8)", zoom: 1.3, push: 0.1, fx: 0.4 });
  if (!glb) {
    card(g, 540, 820, 940, 220, -2, t, C.oneline - 0.15, (gg, w, h) => {
      gg.fillStyle = "#555"; K.font(gg, 24, 600, "Mono"); gg.textAlign = "left"; gg.textBaseline = "middle";
      gg.fillText("text →", -w / 2 + 30, -h / 2 + 40);
      gg.fillStyle = INK; K.font(gg, 40, 600, "Mono");
      gg.fillText(K.typed("\"In 1939, at the New York World's Fair…\"", t, C.oneline, 32), -w / 2 + 30, 20);
    }, { dx: 0, dy: -900, rin: 4 });
    ybox(g, "ONE LINE OF TEXT", 540, 470, 80, t, C.oneline + 0.1, { rot: 2 });
  } else {
    ybox(g, "ANY LANGUAGE", 540, 380, 90, t, C.language - 0.1, { rot: -2 });
    const langs = [["English", 300, 620], ["हिन्दी", 760, 700], ["Español", 330, 860], ["Français", 780, 960], ["Deutsch", 380, 1090]];
    langs.forEach(([l, x, y], i) => {
      const a0 = C.language + i * 0.1;
      if (t < a0) return;
      const s = slam(t, a0, 0.35);
      g.save(); g.translate(x, y); g.scale(s.s, s.s); g.globalAlpha = s.a * (t > C.tone - 0.1 ? 0.35 : 1);
      K.font(g, 54, 700, l === "हिन्दी" ? "Poppins" : "Inter"); const tw = g.measureText(l).width;
      g.fillStyle = "#fff"; K.shadow(g, 16, 6, 0.5, "0,0,0"); K.rr(g, -tw / 2 - 28, -44, tw + 56, 88, 44); g.fill(); K.noShadow(g);
      g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(l, 0, 4); g.restore();
    });
    if (t > C.tone - 0.1) {
      ybox(g, "ANY TONE", 540, 1180, 96, t, C.tone - 0.05, { rot: 2, bg: RED, fg: "#fff" });
      ["calm", "excited", "whisper", "documentary"].forEach((w2, i) => stamp(g, w2.toUpperCase(), [250, 820, 330, 770][i], [1330, 1310, 1420, 1420][i] - 40, 38, t, C.tone + 0.15 + i * 0.12, [-8, 7, 5, -6][i]));
    }
  }
});
// 15 · "Nearly a century later," — the reference's statement card
at(C.century - 0.2, "smoke", (g, t, lt) => {
  bg(g, "rv_smoke2", lt, { filter: "brightness(0.38) contrast(1.4) grayscale(1)", zoom: 1.2 });
  big(g, "NEARLY A", 540, 760, 110, t, C.century + 0.02);
  big(g, "CENTURY", 540, 920, 170, t, C.century + 0.3, { color: RED });
  big(g, "LATER", 540, 1075, 110, t, C.century + 0.6);
  dateline(g, "1939 → today", 540, 1210, t, C.century + 0.8, { size: 34 });
});
// 16 · "the narrator is just another setting in your edit." — the settings card
at(C.narrator - 0.25, "cut", (g, t, lt) => {
  bg(g, "rv_wood", lt + 1, { filter: "brightness(0.5) contrast(1.2)", zoom: 1.3, fx: 0.3, push: 0.02 });
  ybox(g, "JUST ANOTHER\nSETTING", 540, 360, 84, t, C.narrator + 0.15, { rot: -2 });
  card(g, 540, 930, 900, 640, 2, t, C.narrator - 0.2, (gg, w, h) => {
    gg.textAlign = "left"; gg.textBaseline = "middle";
    gg.fillStyle = "#555"; K.font(gg, 26, 600, "Mono"); gg.fillText("edit settings", -w / 2 + 40, -h / 2 + 48);
    const rows = [["NARRATOR", "Eric · English", true], ["MUSIC", "No Turning Back", false], ["CAPTIONS", "on · lower third", false], ["FORMAT", "9:16 · 30 fps", false]];
    rows.forEach(([k, v, hi], i) => {
      const y = -h / 2 + 140 + i * 125;
      if (hi && t > C.setting - 0.1) {
        const p = outCubic(win(C.setting - 0.1, C.setting + 0.25, t));
        gg.fillStyle = YEL; gg.fillRect(-w / 2 + 24, y - 46, (w - 48) * p, 92);
      }
      gg.fillStyle = INK; K.font(gg, 50, 400, "Archivo Black"); gg.fillText(k, -w / 2 + 40, y);
      K.font(gg, 34, 600, "Mono"); gg.textAlign = "right"; gg.fillText(v + "  ▾", w / 2 - 40, y + 2); gg.textAlign = "left";
      gg.strokeStyle = "rgba(0,0,0,0.25)"; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(-w / 2 + 30, y + 62); gg.lineTo(w / 2 - 30, y + 62); gg.stroke();
    });
  }, { dx: 0, dy: 1000, rin: -6 });
  stamp(g, "YOUR EDIT", 760, 1240, 56, t, C.setting + 0.45, -10);
});
// 17 · "Follow for more vibe editing." — hero object on black, lockup
at(C.follow - 0.2, "cut", (g, t, lt) => {
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  const fr = K.footage("rv_mic_spin", lt + 1);
  if (fr) {
    const p = outQuint(win(C.follow - 0.2, C.follow + 1.6, t));
    const s = lerp(1.25, 0.82, p), w = W * 1.55 * s, h = w * fr.height / fr.width;
    g.save(); g.globalAlpha = clamp(lt * 3); g.filter = "contrast(1.15) brightness(1.1)";
    g.drawImage(fr, 540 - w / 2, lerp(820, 620, p) - h / 2, w, h); g.restore();
  }
  const lk = C.follow + 1.4, gl = win(lk, lk + 0.3, t), jit = (1 - gl) * 26;
  if (t > lk) {
    [["#ff2a2a", -jit], ["#2affff", jit], ["#fff", 0]].forEach(([col, dx], i) => {
      g.save(); if (i < 2) g.globalCompositeOperation = "lighter";
      big(g, "VIBE", 540 + dx, 1040, 170, t, lk, { color: col, alpha: i < 2 ? 0.75 * (1 - gl) + 0.1 : 1 });
      big(g, "EDITING", 540 - dx, 1200, 140, t, lk + 0.1, { color: i === 2 ? YEL : col, alpha: i < 2 ? 0.75 * (1 - gl) + 0.1 : 1 });
      g.restore();
    });
    dateline(g, "1939 → NOW · FOLLOW FOR MORE", 540, 1330, t, lk + 0.4, { size: 28 });
  }
});

// ---------------------------------------------------------------- frame --
function sceneAt(t) { let i = 0; while (i < S.length - 1 && t >= S[i + 1].t0) i++; return i; }
function draw(g, i, t) { g.save(); S[i].draw(g, t, t - S[i].t0); g.restore(); }

K.run((g, t) => {
  const i = sceneAt(t), sc = S[i], lt = t - sc.t0;
  let moving = false, speed = 0;
  if (sc.cut === "smoke" && lt < 0.55 && i > 0) {
    // smoke wipe: the old scene, real smoke billowing over it, then the new scene through the smoke
    const p = lt / 0.55;
    draw(g, i - 1, t);
    g.save(); g.globalAlpha = outCubic(p); draw(g, i, t); g.restore();
    const sm = K.footage("rv_smoke2", 1.5 + lt * 2);
    g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = Math.sin(Math.PI * p);
    K.drawFit(g, sm, -200, -200, W + 400, H + 400); g.restore();
    g.save(); g.globalAlpha = 0.6 * Math.sin(Math.PI * p); g.fillStyle = "#e8e8e8"; g.fillRect(0, 0, W, H); g.restore();
    moving = true; speed = 0.4;
  } else if (sc.cut === "cut" && lt < 0.14) {
    // punch-in cut: the new scene lands with a quick zoom
    const p = lt / 0.14, z = 1.12 - 0.12 * outCubic(p);
    g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); draw(g, i, t); g.restore();
    moving = true; speed = 0.7 * (1 - p);
  } else draw(g, i, t);
  // documentary grade: vignette + grain
  const vg = g.createRadialGradient(540, 900, 500, 540, 960, 1250);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  K.grain(g, t, 0.07);
  K.captions(g, t, { y: 1530, size: 44, weight: 700, family: "Inter Var", color: "#fff", shadow: "rgba(0,0,0,0.9)", maxW: 880 });
  return { moving, speed };
}, ["400 40px Bungee", "400 40px 'Archivo Black'", "700 40px 'Inter Var'", "600 40px Mono", "700 40px Poppins"]);
})();

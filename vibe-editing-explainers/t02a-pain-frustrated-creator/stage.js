// T02A · "This was me, every night. Fighting the timeline." + the shared T02 body.
// Design: the Halloween reel — blood-red night, a real moon, bats, horror-yellow titles,
// polaroids on a red string over slate, serif words in the dark, bonfire light, a circle iris
// into a real landscape and a CRT TV at the end. The grind is the nightmare; the fix is the dawn.
(function () {
const { clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, inOutQuint, spring } = K;
const C = K.C, W = K.W, H = K.H;
const YEL = "#ffcc1a", RED = "#e8261c", BLUE = "#2f7dff", CREAM = "#f3eadb", INK = "#140806";

// ---------------------------------------------------------------- helpers --
function footage(g, name, lt, x, y, w, h, o = {}) {
  g.save(); K.rr(g, x, y, w, h, o.r || 0); g.clip();
  g.fillStyle = "#000"; g.fillRect(x, y, w, h);
  K.drawFit(g, K.footage(name, (o.ss || 0) + lt * (o.speed || 1), 1, o.loop !== false), x, y, w, h,
    { fx: o.fx, fy: o.fy, zoom: o.zoom });
  if (o.grade) grade(g, x, y, w, h, o.grade, o.gradeA ?? 1);
  g.restore();
}
function grade(g, x, y, w, h, mode, a = 1) {
  g.save(); g.globalAlpha = a;
  if (mode === "night") {
    g.globalCompositeOperation = "multiply"; g.fillStyle = "rgb(205,70,45)"; g.fillRect(x, y, w, h);
    g.globalCompositeOperation = "screen"; g.fillStyle = "rgba(90,10,0,0.25)"; g.fillRect(x, y, w, h);
  } else if (mode === "warm") {
    g.globalCompositeOperation = "soft-light"; g.fillStyle = "rgba(255,140,40,0.55)"; g.fillRect(x, y, w, h);
  } else if (mode === "moon") {
    g.globalCompositeOperation = "multiply"; g.fillStyle = "rgb(255,90,40)"; g.fillRect(x, y, w, h);
  }
  g.restore();
}
function slate(g, warm = 0, glow = 0.35) {          // real chalkboard texture, darkened
  g.fillStyle = "#121011"; g.fillRect(0, 0, W, H);
  const im = K.image("oh_chalk");
  if (im) {                                           // right part of the photo (no hand), cover
    g.save(); g.globalAlpha = 0.75; g.drawImage(im, 540, 0, 740, 720, -300, 0, 1680, 1920); g.restore();
  }
  g.fillStyle = "rgba(10,6,6,0.35)"; g.fillRect(0, 0, W, H);
  const r = lerp(200, 255, warm), gg = lerp(30, 140, warm), b = lerp(14, 40, warm);
  const gr = g.createRadialGradient(W / 2, H * 1.05, 80, W / 2, H * 1.05, H * 0.85);
  gr.addColorStop(0, `rgba(${r},${gg},${b},${glow})`); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  vignette(g, 0.6);
}
function vignette(g, a = 0.55) {
  const vg = g.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
// Creepster horror title in yellow (or any colour), with a hard shadow and a glow.
function creep(g, text, x, y, size, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return;
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
  const s = (o.from ?? 1.25) + (1 - (o.from ?? 1.25)) * p; g.scale(s, s);
  g.globalAlpha = clamp(p * 2) * (o.a ?? 1);
  K.font(g, size, 400, "Creepster"); g.textAlign = o.align || "center"; g.textBaseline = "middle";
  g.shadowColor = o.glow || "rgba(255,120,0,0.55)"; g.shadowBlur = 28;
  g.fillStyle = "#2a0500"; g.fillText(text, 5, 7);
  g.fillStyle = o.color || YEL; g.fillText(text, 0, 0);
  g.restore();
}
// Bold extruded word (Archivo Black), face + side colour, like the reference's 3D titles.
function extrude(g, text, x, y, size, face, side, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return;
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180);
  const s = 0.7 + 0.3 * p; g.scale(s, s); g.globalAlpha = clamp(p * 2.5);
  K.font(g, size, 400, "Archivo Black"); g.textAlign = o.align || "center"; g.textBaseline = "middle";
  const d = Math.round(size * 0.09);
  g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 24; g.shadowOffsetY = 10;
  g.fillStyle = side; for (let i = d; i > 0; i -= 1) g.fillText(text, i * 0.5, i); K.noShadow(g);
  g.lineWidth = size * 0.05; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(text, 0, 0);
  g.fillStyle = face; g.fillText(text, 0, 0);
  g.restore();
}
function serif(g, text, x, y, size, p, o = {}) {      // small italic serif word in the dark
  if (p <= 0) return;
  g.save(); g.globalAlpha = clamp(p * 1.6) * (o.a ?? 1);
  K.font(g, size, 500, "EB Garamond"); g.font = `italic 500 ${size}px "EB Garamond"`;
  g.textAlign = o.align || "center"; g.textBaseline = "middle";
  g.shadowColor = "rgba(255,180,120,0.35)"; g.shadowBlur = 14;
  g.fillStyle = o.color || CREAM; g.fillText(text, x, y + 14 * (1 - p));
  g.restore();
}
function tag(g, text, x, y, size, bg, fg, p, rot = 0) {   // little label block
  if (p <= 0) return;
  K.font(g, size, 800, "Inter");
  const w = g.measureText(text).width + size * 0.9, h = size * 1.5;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); const s = 0.8 + 0.2 * p; g.scale(s, s);
  g.globalAlpha = clamp(p * 3);
  K.shadow(g, 16, 8, 0.45, "0,0,0"); g.fillStyle = bg; K.rr(g, -w / 2, -h / 2, w, h, 8); g.fill(); K.noShadow(g);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, 2);
  g.restore();
}
function polaroid(g, x, y, w, h, rot, draw, caption, o = {}) {   // white instant print with a pin
  const pad = w * 0.05, foot = h * 0.16;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.globalAlpha = o.a ?? 1;
  K.shadow(g, 30, 18, 0.55, "0,0,0");
  g.fillStyle = "#f2ece0"; g.fillRect(-w / 2, -h / 2, w, h); K.noShadow(g);
  draw(g, -w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad - foot);
  if (caption) {
    K.font(g, Math.round(h * 0.06), 600, "Caveat"); g.fillStyle = "#3a2a20";
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(caption, 0, h / 2 - foot / 2);
  }
  if (o.pin !== false) {                                   // red pin
    g.fillStyle = "#b31212"; g.beginPath(); g.arc(0, -h / 2 + pad * 0.6, Math.max(6, w * 0.022), 0, 7); g.fill();
    g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.arc(-2, -h / 2 + pad * 0.6 - 3, Math.max(2, w * 0.007), 0, 7); g.fill();
  }
  g.restore();
}
function redString(g, x0, x1, y, sag, p = 1) {
  if (p <= 0) return;
  g.save(); g.strokeStyle = "#c21616"; g.lineWidth = 4; g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 6; g.shadowOffsetY = 4;
  g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + sag, x1, y);
  g.stroke(); g.restore();
}
function stringY(x0, x1, y, sag, x) {   // y on the quadratic string at x
  const u = (x - x0) / (x1 - x0); return y + 2 * u * (1 - u) * sag;
}
function bat(g, x, y, s, phase) {      // a flapping bat silhouette (drawn ornament)
  const f = Math.sin(phase) * 0.55;
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = "#0b0505";
  g.beginPath(); g.moveTo(0, 0);
  for (const side of [-1, 1]) {
    g.moveTo(0, -2);
    g.quadraticCurveTo(side * 18, -14 - 20 * f, side * 44, -6 - 26 * f);
    g.quadraticCurveTo(side * 34, 2 - 10 * f, side * 30, 8);
    g.quadraticCurveTo(side * 22, 2, side * 16, 10);
    g.quadraticCurveTo(side * 10, 4, 0, 8);
  }
  g.fill(); g.beginPath(); g.ellipse(0, 2, 6, 9, 0, 0, 7); g.fill();
  g.restore();
}
function bats(g, t, n, area, seed) {
  const r = K.rnd(seed);
  for (let i = 0; i < n; i++) {
    const sp = 140 + r() * 160, ph = r() * 10, y0 = area[1] + r() * (area[3] - area[1]);
    const x = ((t * sp + r() * 2000) % 1500) - 200;
    bat(g, x, y0 + Math.sin(t * 2 + ph) * 30, 0.7 + r() * 0.9, t * (10 + r() * 6) + ph);
  }
}
function moon(g, cx, cy, r, t, a = 1) {                  // real moon footage, blood-red, in a soft circle
  g.save(); g.globalAlpha = a;
  const gl = g.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.6);
  gl.addColorStop(0, "rgba(255,80,30,0.45)"); gl.addColorStop(1, "rgba(255,40,0,0)");
  g.fillStyle = gl; g.fillRect(cx - r * 1.7, cy - r * 1.7, r * 3.4, r * 3.4);
  g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
  // the moon sits at ~(0.5,0.5) of the clip, radius ~0.135 of its width
  const fr = K.footage("pa_moon", t, 1, true);
  if (fr) { const s = r / (0.145 * fr.width); g.drawImage(fr, cx - fr.width * s / 2, cy - fr.height * s / 2, fr.width * s, fr.height * s); }
  grade(g, cx - r, cy - r, r * 2, r * 2, "moon");
  g.restore();
}

// ---------------------------------------------------------------- timeline (NLE) --
const CLIPCOL = ["#3fb6c9", "#8b5cf6", "#f59e0b", "#e0533d", "#22c55e", "#e879f9"];
const MESS = (() => {     // dozens of tiny, overlapping clips + errors, and where each one belongs
  const r = K.rnd(42), out = [];
  let nx = 0;
  for (let i = 0; i < 46; i++) {
    const tr = Math.floor(r() * 5), w = 18 + r() * 80;
    out.push({ tr, x: r() * 0.95, w: w / 1000, c: CLIPCOL[Math.floor(r() * 6)], err: r() < 0.22,
      // neat: track 0 = 8 video clips laid end to end, the rest fade
      ntr: i < 8 ? 0 : (i < 14 ? 1 : -1), nx: i < 8 ? i / 8 : (i < 14 ? (i - 8) / 6 + 0.02 : 0), nw: i < 8 ? 1 / 8 - 0.004 : 1 / 6 - 0.03 });
  }
  return out;
})();
// panel at (x,y,w,h). neat: 0 messy → 1 clean; caps 0..1 captions track; beats 0..1 music + beat lines
function nle(g, x, y, w, h, t, o = {}) {
  const neat = o.neat || 0, caps = o.caps || 0, beats = o.beats || 0;
  g.save();
  K.shadow(g, 30, 16, 0.6, "0,0,0");
  g.fillStyle = "#17161a"; K.rr(g, x, y, w, h, 16); g.fill(); K.noShadow(g);
  g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 2; K.rr(g, x, y, w, h, 16); g.stroke();
  const hx = x + 92, tw = w - 110, ry = y + 44, th = (h - 64) / 5;
  // ruler
  K.font(g, 18, 500, "Mono"); g.fillStyle = "rgba(255,255,255,0.4)"; g.textBaseline = "middle"; g.textAlign = "left";
  for (let i = 0; i <= 6; i++) { const xx = hx + tw * i / 6; g.fillRect(xx, y + 18, 2, 12); g.fillText(`0:${String(i * 5).padStart(2, "0")}`, xx + 6, y + 24); }
  const names = ["V1", "V2", "T1", "A1", "A2"];
  names.forEach((n, i) => {
    const yy = ry + i * th;
    g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x + 12, yy + 3, w - 24, th - 6);
    g.fillStyle = "rgba(255,255,255,0.55)"; K.font(g, 20, 700, "Inter"); g.fillText(n, x + 26, yy + th / 2);
  });
  g.save(); g.beginPath(); g.rect(hx, ry, tw, th * 5); g.clip();
  // clips
  MESS.forEach((c, i) => {
    const e = inOutCubic(clamp(neat * 1.15 - (i % 8) * 0.02));
    if (c.ntr < 0 && e >= 1) return;
    const tr = c.ntr < 0 ? c.tr : lerp(c.tr, c.ntr, e);
    const jit = (1 - e) * Math.sin(t * 7 + i) * 3;
    const cx = hx + tw * lerp(c.x, c.ntr < 0 ? c.x : c.nx, e), cw = tw * lerp(c.w, c.ntr < 0 ? c.w : c.nw, e);
    const cy = ry + tr * th + 6 + jit;
    g.globalAlpha = c.ntr < 0 ? 1 - e : 1;
    g.fillStyle = c.c; K.rr(g, cx, cy, Math.max(4, cw), th - 12, 5); g.fill();
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(cx, cy + th - 22, Math.max(4, cw), 10);
    if (c.err && e < 0.6) {             // red error marker
      const blink = 0.5 + 0.5 * Math.sin(t * 12 + i);
      g.globalAlpha = (1 - e / 0.6) * (0.6 + 0.4 * blink);
      g.fillStyle = "#ff2a1a"; g.beginPath(); g.moveTo(cx + 8, cy - 2); g.lineTo(cx + 20, cy + 18); g.lineTo(cx - 4, cy + 18); g.fill();
      g.fillStyle = "#fff"; K.font(g, 14, 900, "Inter"); g.textAlign = "center"; g.fillText("!", cx + 8, cy + 12); g.textAlign = "left";
    }
    g.globalAlpha = 1;
  });
  // captions track (T1)
  if (caps > 0) {
    const words = ["Three", "hours", "One", "reel", "Same", "reel", "15", "min"];
    words.forEach((wd, i) => {
      const p = outCubic(clamp(caps * 1.4 - i * 0.07)); if (p <= 0) return;
      const cx = hx + tw * (i / 8) + 4, cy = ry + 2 * th + 8;
      g.globalAlpha = p; g.fillStyle = YEL; K.rr(g, cx, cy + (1 - p) * 20, tw / 8 - 10, th - 16, 6); g.fill();
      g.fillStyle = INK; K.font(g, 18, 800, "Inter"); g.fillText(wd, cx + 8, cy + (th - 16) / 2 + (1 - p) * 20);
      g.globalAlpha = 1;
    });
  }
  // music waveform (A1) + beat lines
  if (beats > 0) {
    const yy = ry + 3 * th + th / 2;
    g.fillStyle = "rgba(47,125,255,0.85)";
    for (let i = 0; i < 120; i++) {
      const xx = hx + tw * i / 120; if ((xx - hx) / tw > clamp(beats * 1.6)) break;
      const a = 0.3 + 0.7 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.31));
      g.fillRect(xx, yy - a * (th / 2 - 6), tw / 120 - 2, a * (th - 12));
    }
    const bp = clamp((beats - 0.35) / 0.65);
    for (let i = 1; i < 8; i++) {          // beat markers snap onto the cuts
      const p = outCubic(clamp(bp * 1.5 - i * 0.06)); if (p <= 0) continue;
      const xx = hx + tw * i / 8 - 2;
      g.globalAlpha = p; g.fillStyle = YEL; g.fillRect(xx, ry, 3, th * 5);
      g.beginPath(); g.moveTo(xx - 8, ry); g.lineTo(xx + 11, ry); g.lineTo(xx + 1.5, ry + 12); g.fill();
      g.globalAlpha = 1;
    }
  }
  g.restore();
  // playhead
  const ph = o.ph ?? (0.5 + 0.35 * Math.sin(t * 1.3));
  const px = hx + tw * ph;
  g.fillStyle = "#ff2a1a"; g.fillRect(px - 1.5, y + 14, 3, h - 22);
  g.beginPath(); g.moveTo(px - 10, y + 12); g.lineTo(px + 10, y + 12); g.lineTo(px, y + 26); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- scenes --
function sceneHook(g, t) {
  // real frustrated creator at night, blood-red grade, the messy timeline in front of him
  const z = 1.06 + 0.05 * outCubic(win(0, 4, t));
  footage(g, "pa_exhausted", t + 0.3, 0, 0, W, H, { zoom: z, fy: 0.35, grade: "night" });
  if (t > C.hook_fight - 0.08) {     // "fighting": cut to the paper-throwing frustration
    const p = outCubic(win(C.hook_fight - 0.08, C.hook_fight + 0.25, t));
    g.save(); g.globalAlpha = p;
    footage(g, "pa_papers", t - C.hook_fight + 1.2, 0, 0, W, H, { zoom: 1.0 + 0.05 * p, fx: 0.42, grade: "night" });
    g.restore();
  }
  vignette(g, 0.7);
  // night clock, top right: a real clock, 2:47 AM
  const ck = K.object("hw_clock") || K.object("clock");
  if (ck) {
    const p = spring(win(C.hook_night - 0.3, C.hook_night + 0.6, t));
    if (p > 0) {
      g.save(); g.translate(900, 300); g.rotate(-0.12 + 0.03 * Math.sin(t * 14) * (1 - win(C.hook_night, C.hook_night + 1, t))); g.scale(p * 0.95, p * 0.95);
      g.globalAlpha = 0.95; K.shadow(g, 30, 14, 0.6, "0,0,0");
      const w = 230, h = w * ck.height / ck.width; g.drawImage(ck, -w / 2, -h / 2, w, h); K.noShadow(g);
      g.restore();
      tag(g, "2:47 AM", 900, 470, 30, RED, "#fff", p, -4);
    }
  }
  // titles
  serif(g, "this was me,", 300, 300, 64, outCubic(win(C.hook_me - 0.15, C.hook_me + 0.3, t)), { align: "center" });
  creep(g, "EVERY NIGHT.", 540, 430, 128, { p: outQuint(win(C.hook_night - 0.1, C.hook_night + 0.35, t)), rot: -3 });
  const fp = outQuint(win(C.hook_fight - 0.08, C.hook_fight + 0.3, t));
  if (fp > 0) {
    extrude(g, "FIGHTING", 540, 640, 150, YEL, "#8a5a00", { p: fp, rot: -2 });
    extrude(g, "THE TIMELINE", 540, 790, 112, "#cfe1ff", BLUE, { p: outQuint(win(C.hook_timeline - 0.05, C.hook_timeline + 0.3, t)), rot: 1 });
  }
  // the messy timeline he is fighting
  const np = outCubic(win(0, 0.5, t));
  g.save(); g.translate(0, (1 - np) * 120); g.globalAlpha = np;
  const shake = t > C.hook_fight ? Math.sin(t * 60) * 4 * (1 - win(C.hook_fight, C.hook_fight + 0.6, t)) : 0;
  nle(g, 40 + shake, 1060, 1000, 360, t, { neat: 0, ph: 0.3 + 0.4 * Math.abs(Math.sin(t * 2.7)) });
  g.restore();
}

function sceneHours(g, t, lt) {
  slate(g, 0, 0.4);
  moon(g, 760, 470, 300, t, outCubic(win(0, 0.6, lt)));
  bats(g, t, 5, [0, 160, 0, 760], 7);
  // 3:00:00 counting up fast
  const cp = outCubic(win(0.1, 1.2, lt));
  const secs = Math.floor(lerp(0, 3 * 3600, cp));
  const s = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  creep(g, s, 540, 900, 220, { p: outQuint(win(0, 0.3, lt)), color: RED, glow: "rgba(255,30,0,0.7)", from: 1.4 });
  serif(g, "three", 250, 720, 70, outCubic(win(C.L_hours - C.s_hours - 0.1, C.L_hours - C.s_hours + 0.3, lt)));
  serif(g, "hours.", 380, 790, 70, outCubic(win(0.65, 1.05, lt)));
  // one reel: a single pinned polaroid on a red string
  const rp = spring(win(C.hours_one - C.s_hours - 0.25, C.hours_one - C.s_hours + 0.55, lt));
  if (rp > 0) {
    redString(g, -20, 1100, 1110, 70);
    polaroid(g, 540, 1220 + (1 - rp) * 300, 300, 380, -4 + (1 - rp) * 20, (gg, x, y, w, h) =>
      footage(gg, "cw_creator", t, x, y, w, h, { grade: "night", gradeA: 0.5 }), "one reel.", { a: clamp(rp * 2) });
    tag(g, "1 REEL", 760, 1110, 34, YEL, INK, spring(win(C.hours_reel - C.s_hours - 0.1, C.hours_reel - C.s_hours + 0.5, lt)), 6);
  }
}

// --- the grind: three beats, each a big polaroid + a little UI; done prints pin onto the string
const GRIND = [
  { at: () => C.s_grind, name: "timeline", title: "TRIM.", cap: "every pause, by hand" },
  { at: () => C.g_type - 0.15, name: "typing", title: "TYPE.", cap: "every caption" },
  { at: () => C.g_nudge - 0.15, name: "ai_click", title: "NUDGE.", cap: "frame by frame" },
];
function waveformTrim(g, x, y, w, h, t, lt) {
  g.save(); K.shadow(g, 20, 10, 0.5, "0,0,0"); g.fillStyle = "#17161a"; K.rr(g, x, y, w, h, 14); g.fill(); K.noShadow(g);
  const gaps = [0.14, 0.31, 0.47, 0.63, 0.8], step = 0.3;
  // closing: each gap shrinks after its razor cut
  const closed = gaps.map((_, i) => outCubic(win(0.35 + i * step, 0.55 + i * step, lt)));
  const gw = 0.07;
  const total = 1 - gw * closed.reduce((a, b) => a + b, 0);
  let cx = x + 20; const iw = w - 40, mid = y + h / 2;
  const N = 140;
  for (let i = 0; i < N; i++) {
    const u = i / N;
    const gi = gaps.findIndex((gx) => u >= gx && u < gx + gw);
    let bw = iw / N / total * (gi >= 0 ? 1 - closed[gi] : 1);
    if (gi >= 0) {                 // the silent gap: flat line, red
      g.fillStyle = `rgba(255,42,26,${0.7 * (1 - closed[gi])})`; g.fillRect(cx, mid - 2, bw, 4);
    } else {
      const a = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.73) * Math.cos(i * 0.19));
      g.fillStyle = "#3fb6c9"; g.fillRect(cx, mid - a * h * 0.36, Math.max(1, bw - 2), a * h * 0.72);
    }
    cx += bw;
  }
  // razor icon on the active gap
  const k = Math.min(4, Math.floor(clamp((lt - 0.25) / step, 0, 4.99)));
  if (lt > 0.2 && lt < 0.35 + 5 * step) {
    const gx = x + 20 + iw * ((gaps[k] - gw * closed.slice(0, k).reduce((a, b) => a + b, 0)) / total);
    g.fillStyle = "#fff"; g.save(); g.translate(gx, y - 6);
    g.beginPath(); g.moveTo(-14, -26); g.lineTo(14, -26); g.lineTo(0, 0); g.fill(); g.restore();
    const flash = 1 - win(0.35 + k * step, 0.5 + k * step, lt);
    g.fillStyle = `rgba(255,42,26,${flash})`; g.fillRect(gx - 2, y + 6, 4, h - 12);
  }
  K.font(g, 22, 700, "Mono"); g.fillStyle = "rgba(255,255,255,0.55)"; g.textAlign = "left"; g.textBaseline = "top";
  g.fillText(`pauses cut: ${closed.filter((c) => c > 0.5).length} / 47`, x + 20, y + 12);
  g.restore();
}
function captionType(g, x, y, w, h, t, lt) {
  g.save(); K.shadow(g, 20, 10, 0.5, "0,0,0"); g.fillStyle = "#17161a"; K.rr(g, x, y, w, h, 14); g.fill(); K.noShadow(g);
  const lines = ["so today i want to", "show you how i edit", "my reels every night"];
  const per = 0.58, k = Math.min(2, Math.floor(lt / per));
  const local = lt - k * per;
  let s = K.typed(lines[k], local, 0.05, 34);
  if (k === 1 && local > 0.3 && local < 0.42) s = s.slice(0, -2) + "x";      // a typo, fixed
  K.font(g, 22, 700, "Mono"); g.fillStyle = "rgba(255,255,255,0.55)"; g.textAlign = "left"; g.textBaseline = "top";
  g.fillText(`caption ${k + 1} of 84`, x + 20, y + 12);
  g.fillStyle = "#fff"; K.rr(g, x + 20, y + 52, w - 40, h - 72, 10); g.fill();
  K.font(g, 44, 800, "Inter"); g.fillStyle = INK; g.textBaseline = "middle";
  g.fillText(s, x + 40, y + 52 + (h - 72) / 2);
  if (Math.floor(t * 3) % 2 === 0) { const tw = g.measureText(s).width; g.fillRect(x + 44 + tw, y + 52 + (h - 72) / 2 - 24, 4, 48); }
  g.restore();
}
function frameNudge(g, x, y, w, h, t, lt) {
  g.save(); K.shadow(g, 20, 10, 0.5, "0,0,0"); g.fillStyle = "#17161a"; K.rr(g, x, y, w, h, 14); g.fill(); K.noShadow(g);
  const step = Math.floor(lt / 0.24), dir = [1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, -1][step % 12];
  const frames = 7 + [0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 0, 1][step % 12];
  const cut = x + w / 2 + (frames - 8) * 22;
  const ty = y + 60, th = h - 80;
  g.fillStyle = "#8b5cf6"; K.rr(g, x + 20, ty, cut - x - 22, th, 8); g.fill();
  g.fillStyle = "#f59e0b"; K.rr(g, cut + 2, ty, x + w - 20 - cut - 2, th, 8); g.fill();
  g.fillStyle = "#fff"; g.fillRect(cut - 1, ty - 10, 3, th + 20);
  K.font(g, 22, 700, "Mono"); g.fillStyle = "rgba(255,255,255,0.7)"; g.textAlign = "left"; g.textBaseline = "top";
  g.fillText(`00:00:12:${String(frames).padStart(2, "0")}`, x + 20, y + 14);
  g.textAlign = "right"; g.fillStyle = dir > 0 ? "#22c55e" : "#ff6a4a";
  K.font(g, 30, 900, "Inter"); g.fillText(dir > 0 ? "+1f" : "−1f", x + w - 20, y + 10);
  g.restore();
}
function sceneGrind(g, t, lt) {
  slate(g, 0, 0.45);
  moon(g, 980, 140, 150, t, 0.8);
  bats(g, t + 3, 3, [0, 60, 0, 240], 11);
  const sx0 = -20, sx1 = 1100, sy = 230, sag = 60;
  redString(g, sx0, sx1, sy, sag);
  const now = t;
  GRIND.forEach((b, i) => {
    const a = b.at(), nxt = i < 2 ? GRIND[i + 1].at() : 1e9;
    if (now < a) return;
    const enter = spring(win(a, a + 0.75, now));
    const leave = inOutCubic(win(nxt - 0.05, nxt + 0.55, now));       // shrink and fly up to the string
    const pinX = 230 + i * 310, pinY = stringY(sx0, sx1, sy, sag, pinX) + 120;
    const bx = lerp(540, pinX, leave), by = lerp(820, pinY, leave) + (1 - enter) * 900;
    const bw = lerp(760, 250, leave), bh = bw * 0.82;
    const rot = lerp(i % 2 ? 3 : -3, [-7, 4, -3][i], leave) + (1 - enter) * 10;
    const lt2 = now - a;
    polaroid(g, bx, by, bw, bh, rot, (gg, x, y, w, h) => {
      footage(gg, b.name, lt2 + 0.5, x, y, w, h, { grade: "night", gradeA: 0.55 });
    }, b.cap);
    if (leave < 0.3) {
      const ui = 1 - leave / 0.3, up = outCubic(win(a + 0.15, a + 0.5, now));
      g.save(); g.globalAlpha = ui * up; g.translate(0, (1 - up) * 60);
      const ux = 70, uy = 1190, uw = 940, uh = 200;
      if (i === 0) waveformTrim(g, ux, uy, uw, uh, now, lt2);
      if (i === 1) captionType(g, ux, uy, uw, uh, now, lt2);
      if (i === 2) frameNudge(g, ux, uy, uw, uh, now, lt2);
      g.restore();
      creep(g, b.title, 540, 395, 120, { p: outQuint(win(a + 0.05, a + 0.4, now)) * ui, rot: [-4, 3, -2][i] });
    }
  });
  // "frame by frame": a frantic frame counter in the corner
  if (now > C.g_frame - 0.1) {
    const p = outCubic(win(C.g_frame - 0.1, C.g_frame + 0.2, now));
    tag(g, `frame ${1000 + Math.floor((now - C.g_frame) * 48)}`, 830, 1120, 30, RED, "#fff", p, 3);
  }
}

function sceneThen(g, t, lt) {
  // silence beat: the room goes dark, the words appear one by one, then a warm light comes up
  const darkIn = outCubic(win(0, 0.4, lt));
  g.fillStyle = "#0a0808"; g.fillRect(0, 0, W, H);
  const glow = outCubic(win(C.then_else - C.s_then - 0.2, C.then_else - C.s_then + 1.2, lt));
  if (glow > 0) {
    g.save(); g.globalAlpha = glow * 0.9;
    footage(g, "pa_fire", t, 0, 1080, W, 840, { zoom: 1.2, fy: 0.6 });
    const fade = g.createLinearGradient(0, 1080, 0, 1500); fade.addColorStop(0, "#0a0808"); fade.addColorStop(1, "rgba(10,8,8,0)");
    g.globalAlpha = 1; g.fillStyle = fade; g.fillRect(0, 1080, W, 420);
    g.restore();
    const gr = g.createRadialGradient(W / 2, H * 0.95, 50, W / 2, H * 0.95, H * 0.9);
    gr.addColorStop(0, `rgba(255,150,50,${0.45 * glow})`); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  const words = [["then", 300, 560], ["I", 620, 640], ["tried", 820, 760], ["something", 380, 880], ["else.", 700, 1010]];
  const L = TL.lines.then.words;
  words.forEach(([w, x, y], i) => {
    const at = L[i].t0 - C.s_then;
    serif(g, w, x, y, i === 4 ? 110 : 76, outCubic(win(at - 0.1, at + 0.35, lt)) * darkIn, { color: i === 4 ? "#ffd7a0" : CREAM });
  });
  vignette(g, 0.7);
}

const BRIEF = "30-second reel, punchy start, warm and confident, end on my logo.";
function promptBar(g, x, y, w, h, text, caret, hi) {
  g.save(); K.shadow(g, 40, 18, 0.55, "0,0,0");
  g.fillStyle = "rgba(250,244,234,0.96)"; K.rr(g, x, y, w, h, 34); g.fill(); K.noShadow(g);
  g.fillStyle = "#c2410c"; K.font(g, 34, 800, "Inter"); g.textBaseline = "middle"; g.textAlign = "left"; g.fillText("✦", x + 30, y + 52);
  K.font(g, 24, 700, "Inter"); g.fillStyle = "rgba(0,0,0,0.45)"; g.fillText("describe your edit", x + 80, y + 52);
  // send button
  g.fillStyle = INK; g.beginPath(); g.arc(x + w - 56, y + h - 56, 32, 0, 7); g.fill();
  g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.moveTo(x + w - 56, y + h - 40); g.lineTo(x + w - 56, y + h - 72);
  g.moveTo(x + w - 70, y + h - 60); g.lineTo(x + w - 56, y + h - 74); g.lineTo(x + w - 42, y + h - 60); g.stroke();
  // text, wrapped, with highlights
  K.font(g, 46, 700, "Inter");
  const lines = K.wrap(g, BRIEF, w - 150);
  let n = text.length, yy = y + 118;
  lines.forEach((ln, li) => {
    const s = ln.slice(0, Math.max(0, n)); n -= ln.length + 1;
    let xx = x + 32;
    // highlight spans
    for (const [phrase, col, p] of hi) {
      const i0 = ln.indexOf(phrase.split(" ")[0]);
      const full = BRIEF.indexOf(phrase), lstart = BRIEF.indexOf(ln);
      if (p <= 0 || full < 0) continue;
      const a = Math.max(full, lstart), b = Math.min(full + phrase.length, lstart + ln.length);
      if (b <= a) continue;
      const px0 = g.measureText(ln.slice(0, a - lstart)).width, px1 = g.measureText(ln.slice(0, b - lstart)).width;
      g.fillStyle = col; g.globalAlpha = 0.85; g.fillRect(xx + px0, yy + 26, (px1 - px0) * p, 9); g.globalAlpha = 1;
    }
    g.fillStyle = INK; g.fillText(s, xx, yy);
    yy += 62;
  });
  if (caret) {
    let rem = text.length, cy = y + 118, cx = x + 32;
    for (const ln of lines) { if (rem <= ln.length) { cx += g.measureText(ln.slice(0, rem)).width; break; } rem -= ln.length + 1; cy += 62; }
    g.fillStyle = "#c2410c"; g.fillRect(cx + 4, cy - 26, 4, 52);
  }
  g.restore();
}
function sceneBrief(g, t, lt) {
  slate(g, 0.75, 0.55);
  g.save(); g.globalAlpha = 0.85;
  footage(g, "pa_fire", t, 0, 1240, W, 680, { zoom: 1.25, fy: 0.55 });
  const fade = g.createLinearGradient(0, 1240, 0, 1600); fade.addColorStop(0, "rgba(18,16,17,1)"); fade.addColorStop(1, "rgba(18,16,17,0)");
  g.globalAlpha = 1; g.fillStyle = fade; g.fillRect(0, 1240, W, 360);
  g.restore();
  creep(g, "ONE SENTENCE.", 540, 470, 120, { p: outQuint(win(C.b_one - C.s_brief - 0.1, C.b_one - C.s_brief + 0.3, lt)), rot: -2, color: YEL });
  const ap = outCubic(win(0.0, 0.45, lt));
  const typed = K.typed(BRIEF, lt, C.b_one - C.s_brief + 0.15, 24);
  g.save(); g.globalAlpha = ap; g.translate(0, (1 - ap) * 80);
  promptBar(g, 60, 640, 960, 380, typed, typed.length < BRIEF.length || Math.floor(t * 2.5) % 2 === 0,
    [["30-second reel, punchy start", BLUE, outCubic(win(C.b_want - C.s_brief, C.b_want - C.s_brief + 0.5, lt))],
     ["warm and confident", "#f59e0b", outCubic(win(C.b_feel - C.s_brief, C.b_feel - C.s_brief + 0.5, lt))]]);
  g.restore();
  extrude(g, "WHAT I WANT", 330, 1110, 62, "#cfe1ff", BLUE, { p: spring(win(C.b_want - C.s_brief - 0.1, C.b_want - C.s_brief + 0.6, lt)), rot: -3 });
  extrude(g, "HOW IT FEELS", 720, 1210, 62, YEL, "#8a5a00", { p: spring(win(C.b_feel - C.s_brief - 0.1, C.b_feel - C.s_brief + 0.6, lt)), rot: 2 });
}

function reelPreview(g, x, y, w, h, t, capsP, o = {}) {
  footage(g, "cw_creator", t, x, y, w, h, { grade: o.grade || "warm", gradeA: 0.6 });
  if (capsP > 0) {
    const words = ["three", "hours.", "one", "reel."], k = Math.floor((t * 2.2) % 4);
    K.font(g, Math.round(w * 0.11), 900, "Inter"); g.textAlign = "center"; g.textBaseline = "middle";
    g.save(); g.globalAlpha = capsP;
    const s = words[k].toUpperCase(), tw = g.measureText(s).width;
    g.fillStyle = YEL; K.rr(g, x + w / 2 - tw / 2 - 14, y + h * 0.78 - w * 0.08, tw + 28, w * 0.16, 10); g.fill();
    g.fillStyle = INK; g.fillText(s, x + w / 2, y + h * 0.78 + 3);
    g.restore();
  }
}
function sceneAI(g, t, lt) {
  slate(g, 0.9, 0.5);
  const cutP = win(C.ai_cuts - C.s_ai - 0.2, C.ai_cuts - C.s_ai + 0.9, lt);
  const capP = win(C.ai_capt - C.s_ai - 0.1, C.ai_capt - C.s_ai + 0.8, lt);
  const beatP = win(C.ai_times - C.s_ai - 0.1, C.ai_music - C.s_ai + 0.6, lt);
  const ap = spring(win(0, 0.7, lt));
  polaroid(g, 540, 600 + (1 - ap) * 120, 470, 590, -2, (gg, x, y, w, h) => reelPreview(gg, x, y, w, h, t, outCubic(capP)), "the same reel", { a: clamp(ap * 2) });
  creep(g, "THE AI", 210, 300, 96, { p: outQuint(win(0.2, 0.55, lt)), rot: -6 });
  tag(g, "CUT ✓", 200, 1005, 36, YEL, INK, spring(win(C.ai_cuts - C.s_ai, C.ai_cuts - C.s_ai + 0.6, lt)), -4);
  tag(g, "CAPTIONED ✓", 520, 1005, 36, YEL, INK, spring(win(C.ai_capt - C.s_ai, C.ai_capt - C.s_ai + 0.6, lt)), 2);
  tag(g, "ON BEAT ✓", 860, 1005, 36, BLUE, "#fff", spring(win(C.ai_music - C.s_ai - 0.1, C.ai_music - C.s_ai + 0.5, lt)), -3);
  const np = outCubic(win(0.05, 0.5, lt));
  g.save(); g.globalAlpha = np; g.translate(0, (1 - np) * 120);
  nle(g, 40, 1060, 1000, 360, t, { neat: cutP, caps: capP, beats: beatP, ph: lerp(0.3, 0.92, win(0, 3.9, lt)) });
  g.restore();
}

function sticky(g, x, y, w, rot, text, p, check) {
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); const s = 1.3 - 0.3 * p; g.scale(s, s); g.globalAlpha = clamp(p * 3);
  K.shadow(g, 20, 12, 0.5, "0,0,0"); g.fillStyle = "#ffe066"; g.fillRect(-w / 2, -w / 2, w, w); K.noShadow(g);
  g.fillStyle = "rgba(0,0,0,0.06)"; g.fillRect(-w / 2, -w / 2, w, 26);
  K.font(g, 44, 700, "Caveat"); g.fillStyle = "#2a1a0a"; g.textAlign = "center"; g.textBaseline = "middle";
  const lines = K.wrap(g, text, w - 40); lines.forEach((l, i) => g.fillText(l, 0, -20 + (i - (lines.length - 1) / 2) * 46));
  if (check > 0) {
    g.strokeStyle = "#16a34a"; g.lineWidth = 10; g.lineCap = "round"; g.beginPath();
    const cp = outCubic(check);
    g.moveTo(-40, w * 0.28); g.lineTo(-40 + 30 * Math.min(1, cp * 2), w * 0.28 + 30 * Math.min(1, cp * 2));
    if (cp > 0.5) g.lineTo(-10 + 70 * (cp - 0.5) * 2, w * 0.28 + 30 - 60 * (cp - 0.5) * 2);
    g.stroke();
  }
  g.restore();
}
function sceneNote(g, t, lt) {
  slate(g, 0.9, 0.5);
  const out = inOutCubic(win(C.n_post - C.s_note - 0.55, C.n_post - C.s_note - 0.1, lt));
  polaroid(g, lerp(540, -320, out), lerp(600, 560, out), 470, 590, lerp(-2, -12, out), (gg, x, y, w, h) => reelPreview(gg, x, y, w, h, t, 1), "the same reel");
  sticky(g, lerp(800, 80, out), 430, 300, 7, "punchier first 2 seconds", spring(win(C.n_note - C.s_note - 0.3, C.n_note - C.s_note + 0.35, lt)),
    win(C.n_note - C.s_note + 0.25, C.n_note - C.s_note + 0.7, lt));
  creep(g, "ONE NOTE.", 540, 1060, 120, { p: outQuint(win(C.n_note - C.s_note - 0.1, C.n_note - C.s_note + 0.3, lt)) * (1 - out), rot: -3 });
  // the phone posts it
  const pin = outCubic(win(C.n_post - C.s_note - 0.6, C.n_post - C.s_note - 0.1, lt));
  if (pin > 0) {
    const pw = 520, ph = 924, px = lerp(1200, 540 - pw / 2, pin), py = 260;
    g.save(); K.shadow(g, 40, 20, 0.6, "0,0,0"); g.fillStyle = "#000"; K.rr(g, px, py, pw, ph, 34); g.fill(); K.noShadow(g);
    footage(g, "oh_phone_b", t, px, py, pw, ph, { r: 34, grade: "warm", gradeA: 0.4 });
    g.restore();
    const tap = win(C.n_post - C.s_note - 0.05, C.n_post - C.s_note + 0.2, lt), done = spring(win(C.n_post - C.s_note + 0.15, C.n_post - C.s_note + 0.7, lt));
    const bx = px + pw / 2, by = py + ph + 70;
    g.save(); const sc = 1 - 0.12 * Math.sin(Math.PI * tap); g.translate(bx, by); g.scale(sc, sc);
    K.shadow(g, 20, 10, 0.5, "0,0,0"); g.fillStyle = done > 0.5 ? "#16a34a" : BLUE; K.rr(g, -170, -44, 340, 88, 44); g.fill(); K.noShadow(g);
    K.font(g, 40, 900, "Inter"); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(done > 0.5 ? "✓ POSTED" : "POST", 0, 2); g.restore();
    if (done > 0) for (let i = 0; i < 6; i++) {          // hearts float up
      const u = clamp((lt - (C.n_post - C.s_note + 0.2) - i * 0.12) / 1.4); if (u <= 0) continue;
      g.save(); g.globalAlpha = 1 - u; g.fillStyle = "#ff3b5c"; K.font(g, 56, 900, "Inter"); g.textAlign = "center";
      g.fillText("♥", px + pw - 40 - i * 18 + Math.sin(u * 6 + i) * 20, py + ph - 80 - u * 420); g.restore();
    }
  }
}

function sceneSame(g, t, lt) {
  slate(g, 1, 0.55);
  serif(g, "same reel.", 540, 420, 96, outCubic(win(0.1, 0.5, lt)));
  const strike = outCubic(win(C.same_fifteen - C.s_same - 0.2, C.same_fifteen - C.s_same + 0.15, lt));
  extrude(g, "3:00:00", 540, 700, 190, "#ff5a4a", "#6a0d06", { p: spring(win(0.05, 0.6, lt)), rot: -2 });
  if (strike > 0) { g.save(); g.strokeStyle = YEL; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.moveTo(170, 735); g.lineTo(lerp(170, 920, strike), 665); g.stroke(); g.restore(); }
  const ar = outCubic(win(C.same_fifteen - C.s_same - 0.1, C.same_fifteen - C.s_same + 0.25, lt));
  if (ar > 0) { g.save(); g.globalAlpha = ar; g.strokeStyle = CREAM; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(540, 830); g.lineTo(540, 830 + 110 * ar); g.moveTo(510, 910 * 1 + 30 * ar - 30); g.lineTo(540, 940); g.lineTo(570, 910 + 30 * ar - 30); g.stroke(); g.restore(); }
  extrude(g, "0:15:00", 540, 1100, 210, YEL, "#8a5a00", { p: spring(win(C.same_fifteen - C.s_same, C.same_fifteen - C.s_same + 0.6, lt)), rot: 2 });
  tag(g, "FIFTEEN MINUTES", 540, 1290, 40, BLUE, "#fff", spring(win(C.same_fifteen - C.s_same + 0.25, C.same_fifteen - C.s_same + 0.8, lt)), -2);
}

const TV = { x0: 0.29, y0: 0.3474, x1: 0.708, y1: 0.9242 };
function tvbox(g, cx, cy, w, screen) {
  const im = K.object("rv_tvbox"); if (!im) return;
  const h = w * im.height / im.width;
  g.save(); g.translate(cx, cy);
  K.shadow(g, 40, 24, 0.6, "0,0,0"); g.drawImage(im, -w / 2, -h / 2, w, h); K.noShadow(g);
  const sx = -w / 2 + TV.x0 * w + 6, sy = -h / 2 + TV.y0 * h + 6, sw = (TV.x1 - TV.x0) * w - 12, sh = (TV.y1 - TV.y0) * h - 12;
  g.save(); K.rr(g, sx, sy, sw, sh, sw * 0.07); g.clip(); screen(g, sx, sy, sw, sh);
  g.globalAlpha = 0.12; g.fillStyle = "#000"; for (let yy = sy; yy < sy + sh; yy += 4) g.fillRect(sx, yy, sw, 2);
  g.restore(); g.restore();
}
function sceneOutro(g, t, lt) {
  // circle iris (from the reference) into a real evening field
  footage(g, "pa_sunset", lt + 0.4, 0, 0, W, H, { zoom: 1.12 - 0.06 * win(0, 6, lt), fy: 0.5, grade: "warm", gradeA: 0.6 });
  const top = g.createLinearGradient(0, 0, 0, 900); top.addColorStop(0, "rgba(20,8,4,0.55)"); top.addColorStop(1, "rgba(20,8,4,0)");
  g.fillStyle = top; g.fillRect(0, 0, W, 900);
  extrude(g, "JOIN", 540, 360, 200, YEL, "#8a5a00", { p: spring(win(C.o_join - C.s_outro - 0.1, C.o_join - C.s_outro + 0.6, lt)), rot: -3 });
  extrude(g, "VIBE EDITING", 540, 540, 128, "#cfe1ff", BLUE, { p: spring(win(C.o_join - C.s_outro + 0.25, C.o_join - C.s_outro + 0.9, lt)), rot: 1 });
  serif(g, "and get your evenings back.", 540, 690, 66, outCubic(win(C.o_evenings - C.s_outro - 0.5, C.o_evenings - C.s_outro, lt)), { color: "#fff6ea" });
  const tp = outQuint(win(C.o_tv - C.s_outro - 0.6, C.o_tv - C.s_outro + 0.2, lt));
  if (tp > 0) tvbox(g, 540, lerp(2300, 1160, tp), 820, (gg, x, y, w, h) => {
    gg.fillStyle = "#1d3fd8"; gg.fillRect(x, y, w, h);
    const ip = win(C.o_tv - C.s_outro, C.o_tv - C.s_outro + 1.2, lt);
    K.font(gg, Math.round(h * 0.15), 400, "Archivo Black"); gg.fillStyle = "#fff"; gg.textAlign = "center"; gg.textBaseline = "middle";
    gg.fillText("vibe editing", x + w / 2, y + h * 0.36);
    const bw = w * 0.78, bx = x + (w - bw) / 2, by = y + h * 0.58;
    gg.fillStyle = "rgba(255,255,255,0.92)"; K.rr(gg, bx, by, bw, h * 0.2, h * 0.1); gg.fill();
    K.font(gg, Math.round(h * 0.085), 700, "Inter"); gg.fillStyle = INK; gg.textAlign = "left";
    gg.fillText(K.typed("join vibe editing", lt, C.o_tv - C.s_outro + 0.15, 14), bx + 24, by + h * 0.1 + 2);
    gg.fillStyle = "#1d3fd8"; gg.beginPath(); gg.arc(bx + bw - h * 0.1, by + h * 0.1, h * 0.065, 0, 7); gg.fill();
  });
}

// ---------------------------------------------------------------- frame --
C.L_hours = TL.lines.hours.t0;
const SC = [
  ["hook", 0, sceneHook], ["hours", C.s_hours, sceneHours], ["grind", C.s_grind, sceneGrind],
  ["then", C.s_then, sceneThen], ["brief", C.s_brief, sceneBrief], ["ai", C.s_ai, sceneAI],
  ["note", C.s_note, sceneNote], ["same", C.s_same, sceneSame], ["outro", C.s_outro, sceneOutro],
];
// how each scene enters: punch (zoom + flash), slide (from below), fade, iris (circle)
const ENTER = { hours: "punch", grind: "slide", then: "fade", brief: "fade", ai: "iris", note: "slideL", same: "punch", outro: "iris" };
const TR = 0.45;
function drawScene(g, i, t) { const [, s, fn] = SC[i]; g.save(); fn(g, t, t - s); g.restore(); }

function frame(g, t) {
  let i = SC.length - 1; while (i > 0 && t < SC[i][1]) i--;
  const [name, s] = SC[i];
  const p = i > 0 ? win(s, s + TR, t) : 1, e = inOutCubic(p);
  let moving = false, speed = 0;
  if (i > 0 && p < 1) {
    const kind = ENTER[name];
    moving = kind !== "fade"; speed = Math.sin(Math.PI * p);
    if (kind === "fade") {
      drawScene(g, i - 1, t); g.save(); g.globalAlpha = e; drawScene(g, i, t); g.restore();
    } else if (kind === "punch") {
      g.save(); g.translate(W / 2, H / 2); g.scale(1 + 0.25 * e, 1 + 0.25 * e); g.translate(-W / 2, -H / 2); g.globalAlpha = 1 - e; drawScene(g, i - 1, t); g.restore();
      g.save(); g.translate(W / 2, H / 2); const s2 = 0.85 + 0.15 * e; g.scale(s2, s2); g.translate(-W / 2, -H / 2); g.globalAlpha = e; drawScene(g, i, t); g.restore();
      g.fillStyle = `rgba(255,60,20,${0.45 * Math.sin(Math.PI * p)})`; g.fillRect(0, 0, W, H);
    } else if (kind === "slide" || kind === "slideL") {
      const dx = kind === "slideL" ? -W : 0, dy = kind === "slide" ? -H : 0;
      g.save(); g.translate(dx * e, dy * e); drawScene(g, i - 1, t); g.restore();
      g.save(); g.translate(-dx * (1 - e), -dy * (1 - e)); drawScene(g, i, t); g.restore();
    } else if (kind === "iris") {
      drawScene(g, i - 1, t);
      const r = lerp(0, 1250, outCubic(p));
      g.save(); g.beginPath(); g.arc(W / 2, H * 0.45, r, 0, 7); g.clip(); drawScene(g, i, t); g.restore();
      g.save(); g.strokeStyle = `rgba(255,235,200,${0.8 * (1 - p)})`; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, H * 0.45, r, 0, 7); g.stroke(); g.restore();
    }
  } else drawScene(g, i, t);
  // a tiny camera breathe everywhere
  K.grain(g, t, 0.07);
  K.captions(g, t, { y: 1530, size: 42, weight: 800, family: "Inter", color: "#fff", hi: YEL, hiText: INK,
    box: "rgba(16,8,6,0.62)", boxRadius: 16, maxW: 900 });
  return { moving, speed };
}
K.run(frame, ["40px Creepster", "40px 'Archivo Black'", "italic 500 40px 'EB Garamond'", "800 40px Inter", "700 40px Caveat", "500 30px Mono"]);
})();

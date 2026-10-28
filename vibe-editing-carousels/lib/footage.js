// Footage and the mascot, ported from ../vibe-editing-film/stage.js.
// Scenes draw in a 1600x900 frame; drawFootage() fits them into any card.
(function () {
const CW = 1600, CH = 900;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const win = (a, b, t) => clamp((t - a) / (b - a));
const outBack = (x, s = 1.8) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
function rnd(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function rr(c, x, y, w, hh, r) { c.beginPath(); c.roundRect(x, y, w, hh, r); }

// --------------------------------------------------------------- the hero --
// Bro, the IdeaBro lightbulb. Units are UI px, origin at his feet.
function bulbPath(c) {
  c.beginPath();
  c.moveTo(-21, -34);
  c.bezierCurveTo(-24, -46, -44, -56, -44, -78);
  c.arc(0, -78, 44, Math.PI, 0);
  c.bezierCurveTo(44, -56, 24, -46, 21, -34);
  c.closePath();
}
function drawBro(c, s) {
  const vol = s.vol ?? 1;
  c.save();
  c.rotate(s.lean || 0);
  c.scale(s.sx || 1, s.sy || 1);
  c.translate(0, -70); c.rotate(s.rot || 0); c.translate(0, 70);
  c.lineJoin = c.lineCap = "round";

  if (vol < 1) {                        // sticker border: a flat PNG layer
    c.save();
    c.globalAlpha = 1 - vol;
    c.fillStyle = c.strokeStyle = "#fff";
    c.lineWidth = 14;
    bulbPath(c); c.fill(); c.stroke();
    rr(c, -22, -38, 44, 26, 6); c.fill(); c.stroke();
    rr(c, -16, -16, 32, 18, 6); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-46, -68, 9, 13, 0.3, 0, 7); c.ellipse(46, -68, 9, 13, -0.3, 0, 7); c.fill(); c.stroke();
    c.restore();
  }
  const leg = (x, ang) => {
    c.save(); c.translate(x, -15); c.rotate(ang);
    c.fillStyle = "#2a2635"; rr(c, -5, 0, 10, 13, 4); c.fill();
    c.beginPath(); c.ellipse(x < 0 ? -2 : 2, 13, 7.5, 4.5, 0, 0, 7); c.fill();
    c.restore();
  };
  leg(-9, (s.kick || 0) * 0.15);
  leg(9, -(s.kick || 0) * 1.35);

  const arm = (side, up) => {
    c.save(); c.translate(side * 42, -70); c.rotate(side * (0.35 - up));
    c.fillStyle = vol > 0.5 ? "#f6b02a" : "#ffc93c";
    rr(c, side > 0 ? -2 : -22, -7, 24, 14, 7); c.fill();
    c.restore();
  };
  arm(-1, 0);
  if (!s.wave) arm(1, 0);

  // screw base
  const mg = c.createLinearGradient(-20, 0, 20, 0);
  mg.addColorStop(0, "#5b6170"); mg.addColorStop(0.35, "#e2e6ee"); mg.addColorStop(0.6, "#a3aab8"); mg.addColorStop(1, "#4b5160");
  c.fillStyle = vol > 0.01 ? mg : "#b9bfcc";
  rr(c, -20, -37, 40, 23, 6); c.fill();
  c.strokeStyle = "rgba(30,30,45,.45)"; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-19, -29); c.lineTo(19, -27); c.moveTo(-19, -22); c.lineTo(19, -20); c.stroke();
  c.fillStyle = "#2a2635"; c.beginPath(); c.ellipse(0, -14, 9, 4, 0, 0, 7); c.fill();

  // glass body
  bulbPath(c);
  c.fillStyle = "#ffc93c"; c.fill();
  if (vol > 0) {
    c.save(); c.globalAlpha = vol;
    const g = c.createRadialGradient(-16, -98, 4, 0, -72, 72);
    g.addColorStop(0, "#fff8d6"); g.addColorStop(0.35, "#ffd75e"); g.addColorStop(0.75, "#f6a823"); g.addColorStop(1, "#c9730a");
    c.fillStyle = g; bulbPath(c); c.fill();
    c.restore();
  }
  if (s.glow > 0) {
    c.save(); c.globalCompositeOperation = "lighter";
    const g = c.createRadialGradient(0, -78, 2, 0, -78, 56);
    g.addColorStop(0, `rgba(255,250,220,${0.75 * s.glow})`); g.addColorStop(1, "rgba(255,200,60,0)");
    c.fillStyle = g; bulbPath(c); c.fill();
    c.restore();
  }
  // filament
  c.strokeStyle = s.glow > 0.2 ? `rgba(255,255,240,${0.4 + 0.6 * s.glow})` : "rgba(170,80,10,.35)";
  c.lineWidth = 2.4;
  c.beginPath(); c.moveTo(-7, -38); c.lineTo(-7, -52); c.lineTo(-3, -57); c.lineTo(0, -52); c.lineTo(3, -57); c.lineTo(7, -52); c.lineTo(7, -38); c.stroke();
  // light
  if (vol > 0) {
    c.save(); c.globalAlpha = vol;
    c.strokeStyle = "rgba(196,181,253,.75)"; c.lineWidth = 3;
    c.beginPath(); c.arc(0, -78, 41.5, -0.5, 0.95); c.stroke();
    c.fillStyle = "rgba(255,255,255,.9)";
    c.beginPath(); c.ellipse(-21, -99, 7.5, 13, 0.6, 0, 7); c.fill();
    c.beginPath(); c.arc(-8, -114, 3, 0, 7); c.fill();
    c.restore();
  }
  // face
  c.fillStyle = "rgba(255,110,110,.35)";
  c.beginPath(); c.ellipse(-25, -68, 7, 4.5, 0, 0, 7); c.ellipse(25, -68, 7, 4.5, 0, 0, 7); c.fill();
  c.fillStyle = c.strokeStyle = "#1d1726";
  for (const ex of [-13, 13]) {
    if (s.eyes === "happy") {
      c.lineWidth = 4.5; c.beginPath(); c.moveTo(ex - 6, -76); c.lineTo(ex, -84); c.lineTo(ex + 6, -76); c.stroke();
    } else {
      const eh = 19 * (s.blink ?? 1);
      rr(c, ex - 4, -80 - eh / 2, 8, Math.max(2, eh), 4); c.fill();
      if (eh > 8) { c.fillStyle = "#fff"; c.beginPath(); c.arc(ex - 1.2, -84, 1.6, 0, 7); c.fill(); c.fillStyle = "#1d1726"; }
    }
  }
  if (s.wave) arm(1, s.wave);
  c.restore();
}

// --------------------------------------------------------------- footage --
const FOOT = (() => {
  const r = rnd(9);
  const city = [0, 1, 2].map((L) => {
    const b = []; let x = -200;
    while (x < 2000) {
      const w = 60 + r() * 120, hh = 160 + r() * (260 + L * 120) - L * 40;
      const wins = [];
      for (let i = 0; i < 40; i++) if (r() < 0.45) wins.push([r(), r(), r()]);
      b.push({ x, w, h: hh, wins }); x += w + 6 + r() * 20;
    }
    return b;
  });
  const stars = Array.from({ length: 90 }, () => [r() * 1600, r() * 380, r() * 1.8 + 0.4]);
  return { city, stars };
})();

function footSunrise(c, lt) {
  const g = c.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, "#0d2944"); g.addColorStop(0.42, "#33597c"); g.addColorStop(0.7, "#ff9658"); g.addColorStop(1, "#ffd08e");
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  const sy = 600 - lt * 45;
  let rg = c.createRadialGradient(1000, sy, 10, 1000, sy, 520);
  rg.addColorStop(0, "rgba(255,214,140,.95)"); rg.addColorStop(0.25, "rgba(255,160,90,.45)"); rg.addColorStop(1, "rgba(255,140,80,0)");
  c.fillStyle = rg; c.fillRect(0, 0, CW, CH);
  c.fillStyle = "#fff3d0"; c.beginPath(); c.arc(1000, sy, 70, 0, 7); c.fill();
  const cols = ["#2d566b", "#173c4d", "#0a2431"];
  cols.forEach((col, i) => {
    const base = 590 + i * 95, amp = 70 - i * 12, sh = lt * (14 + i * 30);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, CH);
    for (let x = 0; x <= CW; x += 16) {
      const X = x + sh;
      c.lineTo(x, base - amp * (0.6 * Math.sin(X * 0.0042 + i * 1.7) + 0.4 * Math.sin(X * 0.011 + i * 2.3)));
    }
    c.lineTo(CW, CH); c.fill();
  });
}
function footCity(c, lt) {
  const g = c.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, "#04121b"); g.addColorStop(0.6, "#0e3346"); g.addColorStop(1, "#1d5462");
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  c.fillStyle = "#cfe8ff";
  for (const [x, y, s] of FOOT.stars) { c.globalAlpha = 0.35 + 0.3 * Math.sin(x + lt * 3); c.fillRect(x, y, s, s); }
  c.globalAlpha = 1;
  const cols = ["#0e2c3a", "#081d27", "#030c12"];
  FOOT.city.forEach((layer, L) => {
    const sh = -lt * (20 + L * 45) - 100;
    for (const b of layer) {
      const x = b.x + sh, top = CH - b.h - (2 - L) * 70;
      c.fillStyle = cols[L]; c.fillRect(x, top, b.w, CH - top);
      if (L > 0) for (const [u, v, k] of b.wins) {
        c.fillStyle = k > 0.8 ? "rgba(120,230,255,.85)" : "rgba(255,176,92,.85)";
        c.fillRect(x + 8 + u * (b.w - 22), top + 14 + v * (b.h - 40), 7, 10);
      }
    }
  });
  const ng = c.createRadialGradient(1180, 380, 5, 1180, 380, 160);
  ng.addColorStop(0, "rgba(255,90,170,.8)"); ng.addColorStop(1, "rgba(255,90,170,0)");
  c.fillStyle = ng; c.fillRect(1000, 220, 360, 320);
  const hz = c.createLinearGradient(0, 700, 0, CH);
  hz.addColorStop(0, "rgba(255,138,61,0)"); hz.addColorStop(1, "rgba(255,138,61,.35)");
  c.fillStyle = hz; c.fillRect(0, 700, CW, 200);
}
function footOcean(c, lt) {
  const g = c.createLinearGradient(0, 0, 0, 430);
  g.addColorStop(0, "#173a57"); g.addColorStop(0.65, "#c9776a"); g.addColorStop(1, "#ffb072");
  c.fillStyle = g; c.fillRect(0, 0, CW, 430);
  c.fillStyle = "#ffe3b0"; c.beginPath(); c.arc(560, 430, 90, Math.PI, 0); c.fill();
  const sg = c.createLinearGradient(0, 430, 0, CH);
  sg.addColorStop(0, "#14606e"); sg.addColorStop(1, "#04212a");
  c.fillStyle = sg; c.fillRect(0, 430, CW, CH - 430);
  for (let i = 0; i < 26; i++) {
    const y = 440 + i * i * 0.75, w = 30 + i * 9;
    c.fillStyle = `rgba(255,190,120,${0.75 - i * 0.025})`;
    c.fillRect(560 - w / 2 + Math.sin(i * 1.7 + lt * 6) * (6 + i), y, w, 3 + i * 0.25);
  }
  c.strokeStyle = "rgba(150,230,240,.35)"; c.lineWidth = 3;
  for (let k = 0; k < 9; k++) {
    const y0 = 470 + k * k * 6.2;
    c.beginPath();
    for (let x = 0; x <= CW; x += 20) c.lineTo(x, y0 + Math.sin(x * 0.01 + lt * (2 + k * 0.3) + k) * (3 + k * 1.6));
    c.stroke();
  }
}
function drawEndCard(c, lt, mgOn, life) {
  c.fillStyle = "#0b0912"; c.fillRect(0, 0, CW, CH);
  const rg = c.createRadialGradient(800, 380, 10, 800, 420, 760);
  rg.addColorStop(0, "rgba(139,92,246,.55)"); rg.addColorStop(0.5, "rgba(76,29,149,.25)"); rg.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = rg; c.fillRect(0, 0, CW, CH);
  const slam = mgOn ? outBack(win(0.05, 0.4, lt), 2.2) : 1;
  if (mgOn) {                                  // light rays behind the bulb
    c.save(); c.translate(800, 300); c.rotate(life * 0.25);
    for (let i = 0; i < 14; i++) {
      c.rotate((Math.PI * 2) / 14);
      const gg = c.createLinearGradient(0, 0, 0, -620);
      gg.addColorStop(0, `rgba(255,201,60,${0.22 * slam})`); gg.addColorStop(1, "rgba(255,201,60,0)");
      c.fillStyle = gg; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-60, -620); c.lineTo(60, -620); c.lineTo(14, 0); c.fill();
    }
    c.restore();
  }
  c.save(); c.translate(800, 390); c.scale(1.55 * slam, 1.55 * slam);
  drawBro(c, { vol: 1, eyes: "happy", glow: 0.6 + 0.3 * Math.sin(life * 4) });
  c.restore();
  c.save(); c.translate(800, 545); c.scale(slam, slam);
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.font = "900 150px Inter"; c.letterSpacing = "2px";
  c.shadowColor = "rgba(255,201,60,.6)"; c.shadowBlur = 40;
  const tg = c.createLinearGradient(0, -120, 0, 10);
  tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#ffe08a");
  c.fillStyle = tg; c.fillText("VIBE EDITING", 0, 0);
  c.shadowBlur = 0;
  c.font = "700 40px Inter"; c.letterSpacing = "12px"; c.fillStyle = "#c4b5fd";
  c.globalAlpha = mgOn ? win(0.3, 0.6, lt) : 1;
  c.fillText("BY IDEABRO STUDIO", 0, 86);
  c.restore();
  c.letterSpacing = "0px";
}


const SCENES = { sunrise: footSunrise, city: footCity, ocean: footOcean };

// Looks: a canvas filter plus an optional soft-light wash.
const LOOKS = {
  raw:    { f: "none" },
  log:    { f: "saturate(0.4) contrast(0.72) brightness(1.12)" },
  teal:   { f: "saturate(1.3) contrast(1.12)", wash: ["#0aa8c2", "#ff8a3d"] },
  film:   { f: "sepia(0.3) contrast(1.05) saturate(1.05)", wash: ["#2f5d50", "#ffcf8a"] },
  noir:   { f: "grayscale(1) contrast(1.35) brightness(0.95)" },
  pastel: { f: "saturate(0.75) brightness(1.18)", wash: ["#b8a6ff", "#ffb3cf"] },
  vhs:    { f: "saturate(1.5) contrast(0.9) hue-rotate(-12deg)", wash: ["#3b1d6e", "#ff5fa2"] },
};
const pool = {};
function scratch(w, h) {
  const k = w + "x" + h;
  if (!pool[k]) { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; pool[k] = cv; }
  return pool[k];
}
// Draw scene `name` at local time lt to cover (0,0,w,h) of c, graded with `look`.
function drawFootage(c, name, lt, w, h, look = "raw", focusX = 0.6) {
  w = Math.ceil(w); h = Math.ceil(h);
  const off = scratch(w, h), o = off.getContext("2d");
  o.setTransform(1, 0, 0, 1, 0, 0);
  const s = Math.max(w / CW, h / CH);
  o.translate(clamp(w / 2 - CW * focusX * s, w - CW * s, 0), (h - CH * s) / 2);
  o.scale(s, s);
  SCENES[name](o, lt);
  o.setTransform(1, 0, 0, 1, 0, 0);
  const L = LOOKS[look] || LOOKS.raw;
  c.save();
  c.filter = L.f;
  c.drawImage(off, 0, 0);
  c.filter = "none";
  if (L.wash) {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, L.wash[0]); g.addColorStop(1, L.wash[1]);
    c.globalCompositeOperation = "soft-light"; c.globalAlpha = 0.75;
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  c.restore();
}
window.FOOTAGE = { drawFootage, drawBro, LOOKS, scenes: Object.keys(SCENES) };
})();

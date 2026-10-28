// Shared timing and drawing helpers for every slide.
(function () {
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const win = (a, b, t) => clamp((t - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const ss = (a, b, t) => smooth(win(a, b, t));
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const inCubic = (x) => x * x * x;
const outBack = (x, s = 1.8) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pulse = (t, at, k) => (t >= at ? Math.exp(-(t - at) * k) : 0);
// Damped spring from 0 to 1 that starts at `at`: overshoots once, then settles.
const spring = (t, at, dur = 0.7) => {
  const x = win(at, at + dur, t);
  return x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(7.5 * x);
};
function rnd(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }

const F = {
  title: (px, w = 800) => `${w} ${px}px ArchX${w === 900 ? 9 : ""}`,
  ui: (px, w = 600) => `${w} ${px}px InterL`,
  hand: (px) => `600 ${px}px Caveat`,
};
function wrap(c, text, maxW) {
  const out = [];
  for (const para of String(text).split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const test = line ? line + " " + word : word;
      if (line && c.measureText(test).width > maxW) { out.push(line); line = word; } else line = test;
    }
    out.push(line);
  }
  return out;
}
function txt(c, s, x, y, font, color, align = "left", base = "alphabetic") {
  c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = base;
  c.fillText(s, x, y);
}
// Small vector icons, drawn centred at (0,0) in a unit of ~24px.
function check(c, x, y, s, color, lw = 3, prog = 1) {
  c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
  c.strokeStyle = color; c.lineWidth = lw * 24 / s; c.lineCap = c.lineJoin = "round";
  c.beginPath(); c.moveTo(-7, 0);
  const a = clamp(prog * 2), b = clamp(prog * 2 - 1);
  c.lineTo(-7 + 5 * a, 5 * a);
  if (b > 0) c.lineTo(-2 + 10 * b, 5 - 12 * b);
  c.stroke(); c.restore();
}
function heart(c, x, y, s, fill, stroke) {
  c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
  c.beginPath(); c.moveTo(0, 8);
  c.bezierCurveTo(-14, -1, -10, -13, 0, -6); c.bezierCurveTo(10, -13, 14, -1, 0, 8);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2.4; c.stroke(); }
  c.restore();
}
function bubble(c, x, y, s, stroke) {
  c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
  c.strokeStyle = stroke; c.lineWidth = 2.4; c.lineJoin = "round";
  c.beginPath(); c.arc(0, 0, 9, 0.9, Math.PI * 2 + 0.6); c.lineTo(9, 9); c.closePath(); c.stroke();
  c.restore();
}
function plane(c, x, y, s, stroke) {
  c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
  c.strokeStyle = stroke; c.lineWidth = 2.4; c.lineJoin = "round";
  c.beginPath(); c.moveTo(-10, -2); c.lineTo(10, -9); c.lineTo(3, 10); c.lineTo(0, 1); c.closePath(); c.stroke();
  c.restore();
}
function bookmark(c, x, y, s, fill, stroke) {
  c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
  c.beginPath(); c.moveTo(-7, -10); c.lineTo(7, -10); c.lineTo(7, 10); c.lineTo(0, 4); c.lineTo(-7, 10); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  c.strokeStyle = stroke; c.lineWidth = 2.4; c.lineJoin = "round"; c.stroke();
  c.restore();
}
function cursor(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 24); c.lineTo(6, 18); c.lineTo(10, 27); c.lineTo(14, 25); c.lineTo(10, 16); c.lineTo(18, 16); c.closePath();
  c.fillStyle = "#111"; c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 2; c.stroke();
  c.restore();
}

window.U = { clamp, lerp, win, smooth, ss, outCubic, inCubic, outBack, inOut, pulse, spring, rnd, rr, F, wrap, txt,
  icon: { check, heart, bubble, plane, bookmark, cursor } };
})();

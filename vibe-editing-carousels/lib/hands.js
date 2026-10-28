// Hands that hold the cards. Each finger is a stroked tube shaded with offset,
// blurred strokes (rim, core, highlight), then a polished nail at the tip.
// A hand is pre-rendered once into two sprites: `back` (behind the card) and
// `front` (over it). Canonical frame: the grip point is the origin, +x points
// into the card, and the card edge runs along y.
(function () {
const SK = { deep: "#8a4a2c", shadow: "#bd744a", base: "#e19e70", light: "#f4c098", hi: "#ffe3ca" };
const NAIL = { dark: "#5b4335", base: "#8b6f5d", light: "#b49c89" };
const LIGHT = [-0.55, -0.83];                     // toward the light, world space

// part: [x0,y0, cx,cy, x1,y1, width, flags]  flags: n = nail, k = knuckle creases, m = hand mass
const GRIPS = {
  // thumb on the front of the card, fingers behind it
  thumb: {
    back: [
      [-600, 150, -400, 110, -215, 52, 230, "m"],
      [-205, -6, -100, -70, 40, -70, 50, ""],
      [-212, 40, -90, 24, 30, 34, 52, ""],
      [-212, 88, -110, 92, -20, 116, 48, ""],
      [-212, 130, -136, 144, -70, 168, 42, ""],
    ],
    front: [
      [-470, 176, -330, 128, -215, 84, 140, "m"],
      [-250, 82, -110, 46, 66, 14, 60, "nk"],
    ],
  },
  // three or four fingers on the front, thumb behind
  fingers: {
    back: [
      [-600, -14, -380, -4, -210, 6, 240, "m"],
      [-200, 96, -80, 140, 40, 118, 56, ""],
    ],
    front: [
      [-520, -10, -330, -2, -205, 6, 232, "m"],
      [-172, 92, -104, 104, -28, 124, 40, "nk"],
      [-184, 44, -70, 48, 58, 62, 46, "nk"],
      [-190, -8, -60, -18, 86, -4, 50, "nk"],
      [-182, -62, -64, -84, 66, -66, 47, "nk"],
    ],
  },
  // index finger pointing along +x, fingertip edge at the origin
  point: {
    back: [],
    front: [
      [-700, 46, -470, 44, -290, 34, 210, "m"],
      [-300, 112, -232, 128, -212, 162, 44, "k"],
      [-302, 66, -222, 78, -200, 116, 48, "k"],
      [-312, -46, -240, -78, -158, -60, 54, "nk"],
      [-300, 6, -150, -2, -25, 0, 50, "nk"],
    ],
  },
};

const layer = document.createElement("canvas");
const g = layer.getContext("2d");

function shadeTube(ctx, P, lx, ly, ox, oy, s) {
  const [x0, y0, cx, cy, x1, y1, w0, fl = ""] = P;
  const w = w0 * s;
  const path = new Path2D();
  path.moveTo(ox + x0 * s, oy + y0 * s);
  path.quadraticCurveTo(ox + cx * s, oy + cy * s, ox + x1 * s, oy + y1 * s);

  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.filter = "none";
  g.clearRect(0, 0, layer.width, layer.height);
  g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = SK.shadow; g.lineWidth = w; g.stroke(path);
  g.globalCompositeOperation = "source-atop";
  const band = (color, width, k, blur, alpha) => {
    g.save();
    g.translate(lx * w * k, ly * w * k);
    g.filter = `blur(${blur}px)`; g.globalAlpha = alpha;
    g.strokeStyle = color; g.lineWidth = width; g.stroke(path);
    g.restore();
  };
  band(SK.base, w * 0.82, 0.06, w * 0.16, 1);
  band(SK.deep, w * 0.9, -0.55, w * 0.14, 0.55);
  band(SK.light, w * 0.46, 0.17, w * 0.15, 0.95);
  band(SK.hi, w * 0.13, 0.27, w * 0.07, fl.includes("m") ? 0.25 : 0.55);

  const ux = x1 - cx, uy = y1 - cy, ul = Math.hypot(ux, uy) || 1;
  const tx = ux / ul, ty = uy / ul;                 // tangent at the tip
  if (fl.includes("k")) {                          // knuckle creases
    for (const u of [0.42, 0.7]) {
      const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u;
      const px = a * x0 + b * cx + d * x1, py = a * y0 + b * cy + d * y1;
      const dx = 2 * (1 - u) * (cx - x0) + 2 * u * (x1 - cx), dy = 2 * (1 - u) * (cy - y0) + 2 * u * (y1 - cy);
      const dl = Math.hypot(dx, dy), nx = -dy / dl, ny = dx / dl;
      g.save(); g.filter = "blur(1.2px)"; g.strokeStyle = "rgba(120,58,30,.32)"; g.lineWidth = 2.2 * s;
      g.beginPath();
      g.moveTo(ox + (px - nx * w0 * 0.28) * s, oy + (py - ny * w0 * 0.28) * s);
      g.quadraticCurveTo(ox + (px + dx / dl * 5) * s, oy + (py + dy / dl * 5) * s, ox + (px + nx * w0 * 0.28) * s, oy + (py + ny * w0 * 0.28) * s);
      g.stroke(); g.restore();
    }
  }
  if (fl.includes("n")) {                          // the nail
    const L = w * 0.8, W = w * 0.64;
    g.save();
    g.translate(ox + x1 * s - tx * w * 0.4, oy + y1 * s - ty * w * 0.4);
    g.rotate(Math.atan2(ty, tx));
    const ng = g.createLinearGradient(0, -W / 2, 0, W / 2);
    ng.addColorStop(0, NAIL.dark); ng.addColorStop(0.3, NAIL.base); ng.addColorStop(0.55, NAIL.light);
    ng.addColorStop(0.8, NAIL.base); ng.addColorStop(1, NAIL.dark);
    g.beginPath(); g.roundRect(-L / 2, -W / 2, L, W, [W * 0.42, W * 0.5, W * 0.5, W * 0.42]);
    g.fillStyle = ng; g.fill();
    g.strokeStyle = "rgba(150,80,50,.55)"; g.lineWidth = 2.2 * s; g.stroke();
    // specular streak toward the light (light vector in nail space)
    const ca = Math.cos(-Math.atan2(ty, tx)), sa = Math.sin(-Math.atan2(ty, tx));
    const llx = lx * ca - ly * sa, lly = lx * sa + ly * ca;
    g.filter = `blur(${1.6 * s}px)`;
    g.fillStyle = "rgba(255,248,240,.55)";
    g.beginPath(); g.ellipse(llx * L * 0.12, lly * W * 0.24, L * 0.3, W * 0.1, 0, 0, 7); g.fill();
    g.restore();
  }
  g.globalCompositeOperation = "source-over";
  ctx.drawImage(layer, 0, 0);
}

function bounds(parts, s) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of parts) {
    const r = p[6] / 2 + 30;
    for (const [x, y] of [[p[0], p[1]], [p[2], p[3]], [p[4], p[5]]]) {
      x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r);
    }
  }
  return [x0 * s, y0 * s, x1 * s, y1 * s];
}

const cache = {};
// rot: the world rotation of the canonical frame (so the light stays top-left)
function make(grip, { rot = 0, flip = false, scale = 1 } = {}) {
  const key = [grip, rot.toFixed(3), flip, scale].join("|");
  if (cache[key]) return cache[key];
  const G = GRIPS[grip];
  const fy = (P) => (flip ? [P[0], -P[1], P[2], -P[3], P[4], -P[5], P[6], P[7]] : P);
  const back = G.back.map(fy), front = G.front.map(fy);
  const [bx0, by0, bx1, by1] = bounds([...back, ...front], scale);
  const W = Math.ceil(bx1 - bx0), H = Math.ceil(by1 - by0), ox = -bx0, oy = -by0;
  layer.width = W; layer.height = H;
  // light in the hand's local frame
  const c = Math.cos(-rot), s = Math.sin(-rot);
  const lx = LIGHT[0] * c - LIGHT[1] * s, ly = LIGHT[0] * s + LIGHT[1] * c;
  const out = {};
  for (const [name, parts] of [["back", back], ["front", front]]) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    for (const P of parts) shadeTube(ctx, P, lx, ly, ox, oy, scale);
    out[name] = cv;
  }
  out.ox = ox; out.oy = oy;
  return (cache[key] = out);
}

window.HANDS = { make, GRIPS };
})();

// Why most AI edits look fake — retro grunge pixel reel.
// Every picture is real footage or a real photographed object, pushed into the red/cream/black
// palette live (pixelate + ordered dither + palette map), with pixel type on dark grunge.
(function () {
const { clamp, win, lerp, outCubic, outQuint, outExpo, inCubic, inOutCubic, spring, rnd } = K;
const C = K.C, W = K.W, H = K.H;
const RED = "#c8102e", RED_D = "#7a0c1a", CREAM = "#efe6d2", YEL = "#e8c547", INK = "#111110", OLIVE = "#262b1f";
const DY = 100;   // every scene sits 100 px lower than its drawing coordinates
const TV = { x: 0.2883, y: 0.2245, w: 0.4239, h: 0.6873 };   // CRT screen in fk_tv.png (fk_tv.py)

// ---------------------------------------------------------------- textures --
const tex = {};
function grunge(key, base, dark, light, seed) {
  if (tex[key]) return tex[key];
  const c = K.makeCanvas(540, 960), x = c.getContext("2d"), r = rnd(seed);
  x.fillStyle = base; x.fillRect(0, 0, 540, 960);
  for (let i = 0; i < 160; i++) {
    const px = r() * 540, py = r() * 960, rad = 20 + r() * 140, d = r() < 0.55;
    const gr = x.createRadialGradient(px, py, 0, px, py, rad);
    gr.addColorStop(0, d ? dark : light); gr.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = gr; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  const id = x.getImageData(0, 0, 540, 960), dd = id.data;
  for (let i = 0; i < dd.length; i += 4) { const n = (r() - 0.5) * 34; dd[i] += n; dd[i + 1] += n; dd[i + 2] += n; }
  x.putImageData(id, 0, 0);
  x.lineCap = "round";
  for (let i = 0; i < 90; i++) {   // scuffs and fibres
    const px = r() * 540, py = r() * 960, a = r() * Math.PI, l = 6 + r() * 50;
    x.strokeStyle = r() < 0.5 ? "rgba(0,0,0,0.22)" : "rgba(255,240,210,0.07)"; x.lineWidth = 0.6 + r();
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return (tex[key] = c);
}
const BG = {
  olive: () => grunge("olive", "#2a3022", "rgba(8,12,4,0.35)", "rgba(110,120,70,0.10)", 3),
  char: () => grunge("char", "#232320", "rgba(0,0,0,0.4)", "rgba(120,110,90,0.08)", 5),
  cream: () => grunge("cream", "#e3d6b8", "rgba(120,90,50,0.16)", "rgba(255,250,235,0.25)", 7),
  black: () => grunge("black", "#141412", "rgba(0,0,0,0.5)", "rgba(90,80,60,0.08)", 9),
  mustard: () => grunge("mustard", "#3b3a1c", "rgba(10,10,0,0.4)", "rgba(200,180,60,0.10)", 11),
};

// ---------------------------------------------------------------- retro footage --
// Real footage, pixelated + Bayer-dithered into a 4-colour palette. Cached per frame and size.
const PAL = {
  duo: [[18, 15, 12], [110, 12, 24], [200, 16, 46], [233, 220, 192]],
  cream: [[16, 17, 12], [62, 60, 44], [156, 148, 120], [239, 230, 210]],
  warm: null,
};
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v / 16 - 0.5));
const rcache = new Map();
function retro(name, lt, w, h, o = {}) {
  const n = K.A.footage[name];
  let i = Math.floor(Math.max(0, lt + (o.ss || 0)) * 30 * (o.speed || 1));
  i = o.loop === false ? Math.min(n - 1, i) : i % n;
  const px = o.px || 6, mode = o.mode || "duo";
  const key = `${name}|${i}|${w}|${h}|${px}|${mode}|${o.fx ?? ""}|${o.fy ?? ""}|${o.zoom || 1}`;
  if (rcache.has(key)) return rcache.get(key);
  const im = K.img(`../assets/footage/${name}/f${String(i + 1).padStart(4, "0")}.jpg`);
  if (!im) return null;
  const sw = Math.max(2, Math.ceil(w / px)), sh = Math.max(2, Math.ceil(h / px));
  const c = K.makeCanvas(sw, sh), x = c.getContext("2d");
  K.drawFit(x, im, 0, 0, sw, sh, { fx: o.fx, fy: o.fy, zoom: o.zoom });
  const id = x.getImageData(0, 0, sw, sh), d = id.data, P = PAL[mode];
  const con = o.contrast ?? 1.15;
  for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++) {
    const k = (y * sw + xx) * 4, b = BAYER[(y % 4) * 4 + (xx % 4)];
    if (!P) {   // "warm": real colour, posterised to 5 levels per channel, warmed
      for (let ch = 0; ch < 3; ch++) {
        let v = (d[k + ch] / 255 - 0.5) * con + 0.5 + b * 0.22;
        v = Math.round(clamp(v) * 4) / 4;
        d[k + ch] = v * 255 * [1.0, 0.93, 0.8][ch] + [10, 6, 0][ch];
      }
      continue;
    }
    let l = (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255;
    l = clamp((l - 0.5) * con + 0.5 + (o.lift || 0) + b * 0.28);
    const q = P[Math.min(3, Math.floor(l * 4))];
    d[k] = q[0]; d[k + 1] = q[1]; d[k + 2] = q[2];
  }
  x.putImageData(id, 0, 0);
  if (rcache.size > 500) rcache.delete(rcache.keys().next().value);
  rcache.set(key, c);
  return c;
}
function drawRetro(g, name, lt, x, y, w, h, o = {}) {
  const c = retro(name, lt, w, h, o);
  if (!c) return;
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(c, x, y, w, h); g.restore();
}

// ---------------------------------------------------------------- pixel type --
// Text rasterised once, then revealed / removed as a scatter of pixel blocks.
const tcache = new Map();
function textCanvas(text, size, color, font) {
  const key = `${text}|${size}|${color}|${font}`;
  if (tcache.has(key)) return tcache.get(key);
  const m = K.makeCanvas(10, 10).getContext("2d");
  m.font = `${font.weight || 700} ${size}px "${font.fam || "Pixelify Sans"}"`;
  const tw = Math.ceil(m.measureText(text).width) + 16, th = Math.ceil(size * 1.3);
  const c = K.makeCanvas(tw, th), x = c.getContext("2d");
  x.font = m.font; x.textBaseline = "middle"; x.textAlign = "left";
  if (font.shadow !== false) { x.fillStyle = "rgba(0,0,0,0.55)"; x.fillText(text, 8 + size * 0.05, th / 2 + size * 0.07); }
  x.fillStyle = color; x.fillText(text, 8, th / 2);
  const blk = Math.max(4, Math.round(size / 11)), cols = Math.ceil(tw / blk), rows = Math.ceil(th / blk), r = rnd(text.length * 31 + size);
  const order = Array.from({ length: cols * rows }, (_, i) => i).sort(() => r() - 0.5);
  const rank = new Float32Array(cols * rows); order.forEach((v, i) => (rank[v] = i / order.length));
  const e = { c, tw, th, blk, cols, rows, rank };
  tcache.set(key, e);
  return e;
}
// o: {text, x, y, size, color, at, out, align, fam, weight, jitter}
function pix(g, o, t) {
  const pin = win(o.at, o.at + (o.dur || 0.32), t);
  if (pin <= 0) return;
  const pout = o.out != null ? win(o.out, o.out + 0.25, t) : 0;
  if (pout >= 1) return;
  const e = textCanvas(o.text, o.size, o.color || CREAM, { fam: o.fam, weight: o.weight, shadow: o.shadow });
  let x = o.x - (o.align === "left" ? 8 : o.align === "right" ? e.tw - 8 : e.tw / 2), y = o.y - e.th / 2;
  if (o.jitter) { const r = rnd(Math.floor(t * 18) + o.text.length); x += (r() - 0.5) * o.jitter; y += (r() - 0.5) * o.jitter; }
  g.save();
  if (o.rot) { g.translate(o.x, o.y); g.rotate(o.rot); g.translate(-o.x, -o.y); }
  if (pin >= 1 && pout <= 0) { g.drawImage(e.c, x, y); g.restore(); return; }
  const r = rnd(7);
  for (let i = 0; i < e.rank.length; i++) {
    const vis = e.rank[i] < pin && e.rank[i] >= pout;
    if (!vis) continue;
    const cx = (i % e.cols) * e.blk, cy = Math.floor(i / e.cols) * e.blk;
    const fly = (1 - pin) * 40 * (r() - 0.5) + pout * 50 * (r() - 0.5);
    g.drawImage(e.c, cx, cy, e.blk, e.blk, x + cx + fly, y + cy + fly * 0.4, e.blk, e.blk);
  }
  g.restore();
}
function bar(g, x, y, w, h, at, t, color = RED, out) {   // red highlight bar that wipes in
  const p = outExpo(win(at, at + 0.3, t)), o = out != null ? win(out, out + 0.2, t) : 0;
  if (p <= 0 || o >= 1) return;
  g.save(); g.fillStyle = color; g.globalAlpha = 1 - o;
  g.fillRect(x - w / 2, y - h / 2, w * p, h);
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x - w / 2, y + h / 2 - 6, w * p, 6);
  g.restore();
}

// ---------------------------------------------------------------- pixel sprites --
function sprite(g, rows, x, y, s, cols) {
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
    const ch = rows[j][i]; if (ch === "." || ch === " ") continue;
    g.fillStyle = cols[ch]; g.fillRect(Math.round(x + i * s), Math.round(y + j * s), Math.ceil(s), Math.ceil(s));
  }
}
const TROPHY = [
  "..yyyyyyyyyy..", ".yyYYYYYYYYyy.", "yy.yYYYYYYy.yy", "y..yYYYYYYy..y", "yy.yYYYYYYy.yy",
  ".yyyYYYYYYyyy.", "...yYYYYYYy...", "....yYYYYy....", ".....yYYy.....", "......yy......",
  "......yy......", "....yyyyyy....", "...kkkkkkkk...", "...kYYYYYYk...", "...kkkkkkkk...",
];
const HEART = [".rr..rr.", "rrrrrrrr", "rRrrrrrr", "rrrrrrrr", ".rrrrrr.", "..rrrr..", "...rr..."];
const ARROW = ["k.......", "kk......", "kck.....", "kcck....", "kccck...", "kcccck..", "kccccck.", "kcccckkk", "kckcck..", "kk.kcck.", "k...kck.", "....kk.."];
const WARN = ["....kk....", "...kyyk...", "...kyyk...", "..kyykyk..", "..kykkyk..", ".kyykkyyk.", ".kyykkyyk.", "kyyyyyyyyk", "kyyyykyyyk", "kkkkkkkkkk"];
const SP = { y: YEL, Y: "#f4d96a", k: INK, r: RED, R: "#ff5a6e", c: CREAM };

// ---------------------------------------------------------------- props --
function bulbs(g, t, n = 3, a = 1) {   // hanging yellow lights, swaying
  for (let i = 0; i < n; i++) {
    const bx = [120, 470, 930, 760][i], len = [150, 90, 130, 60][i];
    const sw = Math.sin(t * 1.3 + i * 1.7) * 0.05, ex = bx + Math.sin(sw) * len, ey = Math.cos(sw) * len;
    g.save(); g.globalAlpha = a;
    g.strokeStyle = "rgba(10,10,8,0.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, -DY); g.lineTo(ex, ey); g.stroke();
    const gl = g.createRadialGradient(ex, ey + 18, 0, ex, ey + 18, 140);
    gl.addColorStop(0, "rgba(240,220,90,0.35)"); gl.addColorStop(1, "rgba(240,220,90,0)");
    g.fillStyle = gl; g.fillRect(ex - 140, ey - 122, 280, 280);
    g.fillStyle = "#f2e35a"; g.fillRect(ex - 15, ey, 30, 34); g.fillStyle = "#fffbc0"; g.fillRect(ex - 8, ey + 6, 12, 14);
    g.restore();
  }
}
function spot(g, x, y, r, a = 1, col = "245,232,190") {
  const gl = g.createRadialGradient(x, y, 0, x, y, r);
  gl.addColorStop(0, `rgba(${col},${0.42 * a})`); gl.addColorStop(0.55, `rgba(${col},${0.14 * a})`); gl.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gl; g.fillRect(x - r, y - r, r * 2, r * 2);
}
function cone(g, x, top, bottom, wTop, wBot, a, col = "232,197,71") {
  const gr = g.createLinearGradient(0, top, 0, bottom);
  gr.addColorStop(0, `rgba(${col},${0.5 * a})`); gr.addColorStop(1, `rgba(${col},${0.08 * a})`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - wTop / 2, top); g.lineTo(x + wTop / 2, top); g.lineTo(x + wBot / 2, bottom); g.lineTo(x - wBot / 2, bottom); g.closePath(); g.fill();
}
function tv(g, x, y, w, t, screen) {   // the real boombox TV with a picture in its CRT
  const im = K.object("fk_tv"); if (!im) return;
  const h = w * im.height / im.width, x0 = x - w / 2, y0 = y - h / 2;
  const sx = x0 + TV.x * w, sy = y0 + TV.y * h, sw = TV.w * w, sh = TV.h * h;
  g.save(); K.shadow(g, 40, 24, 0.55, "0,0,0"); g.drawImage(im, x0, y0, w, h); K.noShadow(g);
  g.save(); K.rr(g, sx + 4, sy + 4, sw - 8, sh - 8, sw * 0.06); g.clip();
  g.fillStyle = "#0d0f0e"; g.fillRect(sx, sy, sw, sh);
  if (screen) screen(g, sx, sy, sw, sh);
  g.fillStyle = "rgba(0,0,0,0.18)";
  for (let yy = sy; yy < sy + sh; yy += 5) g.fillRect(sx, yy, sw, 2);   // scanlines
  const vg = g.createRadialGradient(sx + sw / 2, sy + sh / 2, sh * 0.25, sx + sw / 2, sy + sh / 2, sh * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.6)"); g.fillStyle = vg; g.fillRect(sx, sy, sw, sh);
  const gl = g.createLinearGradient(sx, sy, sx + sw * 0.6, sy + sh * 0.6);
  gl.addColorStop(0, "rgba(255,255,255,0.12)"); gl.addColorStop(0.5, "rgba(255,255,255,0)"); g.fillStyle = gl; g.fillRect(sx, sy, sw, sh);
  g.restore(); g.restore();
  return { sx, sy, sw, sh, h };
}
function monitor(g, x, y, w, t, screen) {   // drawn beige CRT monitor (pixel style)
  const h = w * 0.82, sh = h * 0.72, sw = w * 0.8;
  g.save();
  g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(x - w / 2 + 10, y - h / 2 + 14, w, h);
  g.fillStyle = "#d9cfb4"; g.fillRect(x - w / 2, y - h / 2, w, h);
  g.fillStyle = "#b7ab8c"; g.fillRect(x - w / 2, y + h / 2 - h * 0.14, w, h * 0.14);
  g.fillStyle = "#efe6d2"; g.fillRect(x - w / 2, y - h / 2, w, 6);
  g.fillStyle = "#2b2a24"; g.fillRect(x - sw / 2 - 6, y - h / 2 + h * 0.07 - 6, sw + 12, sh + 12);
  g.save(); g.beginPath(); g.rect(x - sw / 2, y - h / 2 + h * 0.07, sw, sh); g.clip();
  g.fillStyle = "#0d0f0e"; g.fillRect(x - sw / 2, y - h / 2 + h * 0.07, sw, sh);
  if (screen) screen(g, x - sw / 2, y - h / 2 + h * 0.07, sw, sh);
  g.fillStyle = "rgba(0,0,0,0.2)"; for (let yy = y - h / 2 + h * 0.07; yy < y - h / 2 + h * 0.07 + sh; yy += 4) g.fillRect(x - sw / 2, yy, sw, 1.5);
  g.restore();
  g.fillStyle = RED; g.fillRect(x + w / 2 - w * 0.12, y + h / 2 - h * 0.09, w * 0.06, h * 0.04);
  g.restore();
}
function popup(g, o, t) {   // Windows-95 style dialog in the palette
  const p = o.at != null ? win(o.at, o.at + 0.12, t) : 1, q = o.out != null ? win(o.out, o.out + 0.12, t) : 0;
  if (p <= 0 || q >= 1) return;
  const s = (p < 1 ? 0.6 + 0.4 * p : 1) * (1 - 0.4 * q);
  g.save(); g.translate(o.x, o.y); g.scale(s, s); g.translate(-o.w / 2, -o.h / 2);
  g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(12, 14, o.w, o.h);
  g.fillStyle = "#d8cfb8"; g.fillRect(0, 0, o.w, o.h);
  g.fillStyle = "#fffaf0"; g.fillRect(0, 0, o.w, 4); g.fillRect(0, 0, 4, o.h);
  g.fillStyle = "#6e6754"; g.fillRect(0, o.h - 4, o.w, 4); g.fillRect(o.w - 4, 0, 4, o.h);
  g.fillStyle = RED; g.fillRect(8, 8, o.w - 16, 46);
  K.font(g, 26, 400, "Press Start 2P"); g.fillStyle = CREAM; g.textBaseline = "middle"; g.textAlign = "left";
  g.fillText(o.title, 22, 33);
  g.fillStyle = "#d8cfb8"; g.fillRect(o.w - 52, 14, 34, 34); g.fillStyle = INK; K.font(g, 24, 400, "Press Start 2P"); g.textAlign = "center"; g.fillText("x", o.w - 35, 33);
  if (o.body) o.body(g, o.w, o.h, t);
  g.restore();
}
function loading(g, x, y, w, p, h = 46) {   // red segmented loading bar
  g.save();
  g.fillStyle = CREAM; g.fillRect(x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12);
  g.fillStyle = INK; g.fillRect(x - w / 2, y - h / 2, w, h);
  const seg = 18, n = Math.floor((w - 8) / seg), on = Math.floor(n * clamp(p));
  g.fillStyle = RED;
  for (let i = 0; i < on; i++) g.fillRect(x - w / 2 + 4 + i * seg, y - h / 2 + 5, seg - 4, h - 10);
  g.restore();
}
function bubble(g, x, y, w, h, tailX, a = 1) {   // pixel speech bubble
  g.save(); g.globalAlpha = a;
  g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(x - w / 2 + 10, y - h / 2 + 12, w, h);
  g.fillStyle = CREAM; g.fillRect(x - w / 2, y - h / 2, w, h);
  g.fillStyle = INK; g.fillRect(x - w / 2, y - h / 2, w, 6); g.fillRect(x - w / 2, y + h / 2 - 6, w, 6); g.fillRect(x - w / 2, y - h / 2, 6, h); g.fillRect(x + w / 2 - 6, y - h / 2, 6, h);
  sprite(g, ["kccccck", ".kcccck", "..kccck", "...kcck", "....kck", ".....kk"], tailX, y + h / 2 - 6, 8, SP);
  g.restore();
}
function jar(g, x, y, w, h, t, inside) {   // glass bell jar hanging on a chain
  const top = y - h / 2;
  g.save();
  g.strokeStyle = "#1b1b16"; g.lineWidth = 6; g.setLineDash([14, 8]); g.beginPath(); g.moveTo(x, -DY); g.lineTo(x, top - 30); g.stroke(); g.setLineDash([]);
  g.fillStyle = RED; g.beginPath(); g.arc(x, top - 22, 20, 0, 7); g.fill(); g.fillStyle = "#3a0a10"; g.beginPath(); g.arc(x, top - 22, 9, 0, 7); g.fill();
  const path = () => { g.beginPath(); g.moveTo(x - w / 2, y + h / 2); g.lineTo(x - w / 2, top + w / 2); g.arc(x, top + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y + h / 2); g.closePath(); };
  g.save(); path(); g.clip(); inside(g, x - w / 2, top, w, h);
  const gl = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gl.addColorStop(0, "rgba(220,255,250,0.30)"); gl.addColorStop(0.18, "rgba(220,255,250,0.05)"); gl.addColorStop(0.75, "rgba(220,255,250,0.0)"); gl.addColorStop(0.92, "rgba(220,255,250,0.22)");
  g.fillStyle = gl; g.fillRect(x - w / 2, top, w, h);
  g.restore();
  g.strokeStyle = "rgba(225,250,245,0.55)"; g.lineWidth = 5; path(); g.stroke();
  g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 10; g.lineCap = "round";
  g.beginPath(); g.arc(x, top + w / 2, w / 2 - 34, Math.PI * 1.12, Math.PI * 1.35); g.stroke();
  g.beginPath(); g.moveTo(x - w / 2 + 34, top + w / 2 + 40); g.lineTo(x - w / 2 + 34, y + h / 2 - 60); g.stroke();
  g.fillStyle = "#1c1c18"; g.fillRect(x - w / 2 - 24, y + h / 2 - 8, w + 48, 30);
  g.restore();
}

// ---------------------------------------------------------------- scenes --
const SCENES = ["hook", "stock", "pace", "caps", "pov", "fix", "outro"];
const START = { hook: 0, stock: C.s_stock, pace: C.s_pace, caps: C.s_caps, pov: C.s_pov, fix: C.s_fix, outro: C.s_outro };
const S = {};
const SCENE_BG = { hook: "olive", stock: "char", pace: "cream", caps: "black", pov: "olive", fix: "black", outro: "mustard" };

S.hook = (g, t) => {
  bulbs(g, t, 3);
  spot(g, 540, 780, 640, 0.8);
  // the AI edit, on a real retro TV
  const pin = spring(win(0.0, 0.7, t));
  const r = tv(g, 540, 820 + 500 * (1 - pin), 980, t, (g2, sx, sy, sw, sh) => {
    const lt = t * (t < C.h_spot ? 1 : 0.15);
    drawRetro(g2, "fk_applause", lt, sx, sy, sw, sh, { mode: "warm", px: 5 });
    g2.fillStyle = RED; g2.fillRect(sx + 18, sy + 18, 180, 44);
    K.font(g2, 22, 400, "Press Start 2P"); g2.fillStyle = CREAM; g2.textBaseline = "middle"; g2.textAlign = "left"; g2.fillText("AI EDIT", sx + 32, sy + 41);
    if (Math.floor(t * 2) % 2) { g2.fillStyle = CREAM; g2.beginPath(); g2.arc(sx + sw - 40, sy + 40, 12, 0, 7); g2.fill(); }
  });
  pix(g, { text: "MOST AI EDITS", x: 540, y: 300, size: 96, color: CREAM, at: 0.05, out: C.h_why - 0.1 }, t);
  pix(g, { text: "LOOK FAKE.", x: 540, y: 420, size: 132, color: RED, at: C.h_fake - 0.05, out: C.h_why - 0.1, jitter: t > C.h_fake && t < C.h_fake + 0.4 ? 10 : 0 }, t);
  // detector pop-up
  popup(g, { x: 540, y: 1180, w: 820, h: 300, at: C.h_spot - 0.05, out: C.h_why - 0.15, title: "FAKE_SCAN.EXE",
    body: (g2, w, h, tt) => {
      sprite(g2, WARN, 36, 92, 9, SP);
      K.font(g2, 34, 400, "VT323"); g2.fillStyle = INK; g2.textAlign = "left"; g2.textBaseline = "middle";
      const p = win(C.h_spot, C.h_second + 0.25, tt);
      g2.font = `400 44px "VT323"`; g2.fillText(p < 1 ? "scanning edit..." : "AI EDIT DETECTED", 150, 112);
      g2.fillText(`time: ${(lerp(0, 1.0, p)).toFixed(1)} s`, 150, 158);
      loading(g2, w / 2, 236, w - 90, p);
    } }, t);
  if (t > C.h_second + 0.25 && t < C.h_why) {   // FAKE stamp
    const s = 1 + 0.6 * (1 - outExpo(win(C.h_second + 0.25, C.h_second + 0.45, t)));
    g.save(); g.translate(720, 690); g.rotate(-0.18); g.scale(s, s);
    g.strokeStyle = RED; g.lineWidth = 10; g.strokeRect(-170, -62, 340, 124);
    K.font(g, 86, 700, "Pixelify Sans"); g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("FAKE", 0, 6);
    g.restore();
  }
  // here's why
  if (t > C.h_why - 0.15) {
    g.fillStyle = `rgba(16,16,14,${0.85 * win(C.h_why - 0.15, C.h_why + 0.05, t)})`; g.fillRect(0, 0, W, H);
    pix(g, { text: "HERE'S WHY", x: 540, y: 880, size: 120, color: CREAM, at: C.h_why - 0.05 }, t);
    bar(g, 540, 990, 560, 26, C.h_why + 0.1, t);
  }
  return { z: 1 + 0.04 * win(0, 5, t) };
};

function numeral(g, n, t, at, x = 150, y = 270, col = RED) {
  pix(g, { text: String(n), x, y, size: 210, color: col, at, fam: "Press Start 2P", weight: 400 }, t);
}

S.stock = (g, t) => {
  g.fillStyle = RED_D; g.fillRect(860, -100, 120, 1300 * outExpo(win(C.s_stock, C.s_stock + 0.5, t)));   // red slab
  bulbs(g, t, 2, 0.8);
  numeral(g, 1, t, C.st_one - 0.05);
  pix(g, { text: "GENERIC", x: 300, y: 250, size: 84, color: CREAM, at: C.st_generic - 0.05, align: "left" }, t);
  bar(g, 520, 350, 640, 92, C.st_footage - 0.08, t);
  pix(g, { text: "STOCK FOOTAGE", x: 520, y: 350, size: 66, color: CREAM, at: C.st_footage, shadow: false }, t);
  // one monitor -> 3x3 -> 5x5, all playing the same clip in sync
  const lt = t - C.s_stock;
  const g3 = outQuint(win(C.st_same - 0.1, C.st_same + 0.55, t)), g5 = outQuint(win(C.st_everyone - 0.05, C.st_everyone + 0.5, t));
  const cells = [];
  // the 3x3 grid shrinks away as the 5x5 grid grows in from the centre, so the screen is never empty
  if (g3 > 0 && g5 < 1) for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) cells.push({ x: 540 + (i - 1) * 310 * g3, y: 880 + (j - 1) * 262 * g3, w: lerp(780, 290, g3) * (1 - 0.4 * g5), k: j * 3 + i, d: 0, fade: 1 - g5 });
  if (g5 > 0) for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) cells.push({ x: 540 + (i - 2) * 196, y: 880 + (j - 2) * 166, w: 182, k: j * 5 + i, d: Math.hypot(i - 2, j - 2), g5: true });
  if (g3 <= 0) cells.push({ x: 540, y: 880, w: 780 * spring(win(C.st_generic - 0.2, C.st_generic + 0.5, t)), k: 0, d: 0 });
  for (const c of cells) {
    if (c.w < 10) continue;
    const appear = c.g5 ? clamp(g5 * 3 - c.d * 0.5) : (c.fade ?? 1);
    if (appear <= 0) continue;
    g.save(); g.globalAlpha = clamp(appear * 2);
    monitor(g, c.x, c.y, c.w * (0.85 + 0.15 * appear), t, (g2, sx, sy, sw, sh) => drawRetro(g2, "fk_stock", lt, sx, sy, sw, sh, { mode: "duo", px: c.w > 400 ? 6 : 4 }));
    g.restore();
  }
  if (t > C.st_everyone) {
    const s = 1 + 0.5 * (1 - outExpo(win(C.st_everyone + 0.15, C.st_everyone + 0.35, t)));
    g.save(); g.translate(540, 1320); g.rotate(-0.05); g.scale(s, s);
    g.fillStyle = YEL; g.fillRect(-330, -56, 660, 112); g.fillStyle = INK; g.fillRect(-330, 44, 660, 12);
    K.font(g, 50, 700, "Pixelify Sans"); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("EVERYONE USES IT", 0, 2);
    g.restore();
  }
  return { z: 1 + 0.05 * win(C.s_stock, C.s_pace, t) };
};

S.pace = (g, t) => {
  g.fillStyle = "#16150f"; g.fillRect(0, 1450, W, 600);   // dark floor, like the reference's road
  numeral(g, 2, t, C.pa_two - 0.05, 150, 260, RED);
  pix(g, { text: "ROBOTIC", x: 300, y: 230, size: 92, color: INK, at: C.pa_robotic - 0.05, align: "left", shadow: false }, t);
  bar(g, 560, 340, 560, 84, C.pa_robotic + 0.4, t);
  pix(g, { text: "PACING", x: 560, y: 340, size: 70, color: CREAM, at: C.pa_robotic + 0.5, shadow: false }, t);
  // the metronome drives everything: one cut per tick, all the same length
  const P = 0.56, t0 = C.pa_robotic + 0.3, k = Math.max(0, Math.floor((t - t0) / P)), ph = ((t - t0) / P) % 1;
  const clips = ["fk_editor", "fk_meeting", "fk_tired", "fk_timeline", "fk_stock", "fk_applause"];
  const clip = t < t0 ? "fk_editor" : clips[k % clips.length];
  const big = outQuint(win(C.pa_metronome - 0.15, C.pa_metronome + 0.4, t));
  const tvIn = spring(win(C.s_pace, C.s_pace + 0.6, t));
  g.save(); g.globalAlpha = 1 - big * 0.65;
  tv(g, 540 - 600 * (1 - tvIn), 700, 900, t, (g2, sx, sy, sw, sh) => {
    if (clip === "fk_tired") drawRetro(g2, clip, ph * P + k * 0.3, sx + sw * 0.22, sy, sw * 0.56, sh, { mode: "cream", px: 5 });
    else drawRetro(g2, clip, ph * P + k * 0.3, sx, sy, sw, sh, { mode: "cream", px: 5 });
    if (ph < 0.12 && t > t0) { g2.fillStyle = `rgba(239,230,210,${0.5 * (1 - ph / 0.12)})`; g2.fillRect(sx, sy, sw, sh); }
  });
  g.restore();
  // timeline with identical cuts
  const tlY = 1110, tlx = 90, tlw = 900;
  if (t > C.s_pace + 0.2) {
    const a = outCubic(win(C.s_pace + 0.2, C.s_pace + 0.6, t));
    g.save(); g.globalAlpha = a * (1 - big * 0.65);
    g.fillStyle = INK; g.fillRect(tlx - 10, tlY - 60, tlw + 20, 120);
    const n = 8, cw = tlw / n, scroll = ((t - t0) / P) * cw;
    for (let i = -1; i < n + 1; i++) {
      const x = tlx + i * cw - (scroll % cw);
      if (x + cw < tlx || x > tlx + tlw) continue;
      g.fillStyle = [RED, "#9c9478", "#5a5544"][(i + Math.floor(scroll / cw) + 3) % 3];
      g.fillRect(Math.max(tlx, x + 3), tlY - 46, Math.min(cw - 6, tlx + tlw - x - 3), 92);
    }
    g.fillStyle = YEL; g.fillRect(tlx + tlw * 0.5 - 3, tlY - 74, 6, 148);   // playhead
    if (t > C.pa_same - 0.1) {
      K.font(g, 40, 400, "VT323"); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
      for (let i = 0; i < 4; i++) {
        const p = win(C.pa_same - 0.1 + i * 0.12, C.pa_same + 0.1 + i * 0.12, t);
        if (p <= 0) continue;
        g.globalAlpha = a * p * (1 - big * 0.65);
        g.fillText("0.56s", tlx + cw * (1.5 + i * 2), tlY + 100);
      }
    }
    g.restore();
  }
  // pixel metronome
  const mx = lerp(840, 540, big), my = lerp(1290, 900, big), ms = lerp(7, 15, big);
  const ang = Math.sin(((t - t0) / P) * Math.PI) * 0.55 * (t > t0 ? 1 : 0);
  const mIn = spring(win(C.pa_robotic - 0.1, C.pa_robotic + 0.5, t));
  if (mIn > 0) {
    g.save(); g.translate(mx, my); g.scale(mIn, mIn);
    g.fillStyle = "rgba(0,0,0,0.4)"; g.beginPath(); g.moveTo(-14 * ms, 16 * ms); g.lineTo(-5 * ms, -18 * ms); g.lineTo(5 * ms, -18 * ms); g.lineTo(14 * ms, 16 * ms); g.closePath(); g.fill();
    g.translate(-6, -6);
    g.fillStyle = RED; g.beginPath(); g.moveTo(-14 * ms, 16 * ms); g.lineTo(-5 * ms, -18 * ms); g.lineTo(5 * ms, -18 * ms); g.lineTo(14 * ms, 16 * ms); g.closePath(); g.fill();
    g.fillStyle = CREAM; g.fillRect(-10 * ms, 10 * ms, 20 * ms, 4 * ms);
    g.save(); g.translate(0, 9 * ms); g.rotate(ang);
    g.fillStyle = INK; g.fillRect(-ms * 0.7, -24 * ms, ms * 1.4, 24 * ms);
    g.fillStyle = YEL; g.fillRect(-ms * 2.2, -17 * ms, ms * 4.4, ms * 3);
    g.restore();
    g.restore();
  }
  if (big > 0) pix(g, { text: "TICK. TICK. CUT.", x: 540, y: 1380, size: 64, color: INK, at: C.pa_metronome + 0.15, shadow: false }, t);
  return { z: 1 + 0.04 * win(C.s_pace, C.s_caps, t) };
};

const SHOUT = ["THIS", "IS", "SO", "CRAZY", "YOU", "WON'T", "BELIEVE", "IT", "WAIT", "FOR", "IT"];
S.caps = (g, t) => {
  g.fillStyle = RED_D; g.fillRect(0, 980, W * outExpo(win(C.s_caps, C.s_caps + 0.4, t)), 220);
  spot(g, 540, 820, 700, 0.6);
  numeral(g, 3, t, C.ca_three - 0.05);
  pix(g, { text: "CAPTIONS", x: 300, y: 230, size: 92, color: CREAM, at: C.ca_captions - 0.05, align: "left" }, t);
  bar(g, 560, 340, 560, 84, C.ca_shout - 0.1, t);
  pix(g, { text: "THAT SHOUT", x: 560, y: 340, size: 62, color: CREAM, at: C.ca_shout, shadow: false }, t);
  // a real phone, upright, playing a real vlog
  const ph = K.A.objects.phone, im = K.object("phone");
  const pin = spring(win(C.s_caps, C.s_caps + 0.6, t)), shake = t > C.ca_bouncing ? (rnd(Math.floor(t * 20))() - 0.5) * 8 : 0;
  if (im && ph && ph.screen) {
    const S2 = ph.screen, pw = 620, phh = pw * im.height / im.width;
    g.save(); g.translate(540 + shake, 900 + 700 * (1 - pin));
    g.rotate((90 - S2.ang) * Math.PI / 180 + Math.PI);
    K.shadow(g, 40, 30, 0.6, "0,0,0"); g.drawImage(im, -pw / 2, -phh / 2, pw, phh); K.noShadow(g);
    const L = S2.len * pw * 0.985, Wd = S2.wid * pw * 0.97;
    g.translate(-pw / 2 + S2.cx * pw, -phh / 2 + S2.cy * pw); g.rotate(S2.ang * Math.PI / 180 + Math.PI / 2);
    g.save(); K.rr(g, -Wd / 2, -L / 2, Wd, L, Wd * 0.12); g.clip();
    drawRetro(g, "fk_creator", t - C.s_caps + 2, -Wd / 2, -L / 2, Wd, L, { mode: "warm", px: 3, fx: 0.62 });
    g.restore();
    g.restore();
  }
  // the shouting captions: every word yellow, every word bouncing
  const chaos = win(C.ca_bouncing - 0.2, C.ca_every2, t), flood = win(C.ca_every2 - 0.1, C.ca_yellow + 0.3, t);
  if (t > C.ca_captions) {
    const n = Math.floor((t - C.ca_captions) * 5.5);
    const r = rnd(n * 7 + 3);
    const words = 1 + Math.floor(chaos * 3 + flood * 14);
    for (let i = 0; i < words; i++) {
      const wd = SHOUT[(n + i) % SHOUT.length];
      const bt = ((t - C.ca_captions) * 5.5) % 1;
      const bounce = 1 + 0.35 * Math.exp(-bt * 6) * Math.cos(bt * 18);
      const x = i === 0 ? 540 : 160 + r() * 760, y = i === 0 ? 1080 : 300 + r() * 1100;
      g.save(); g.translate(x, y); g.rotate((r() - 0.5) * (0.2 + chaos * 0.5)); g.scale(bounce * (1 + chaos * 0.3), bounce * (1 + chaos * 0.3));
      K.font(g, 96 - Math.min(i, 8) * 4, 900, "Anton"); g.textAlign = "center"; g.textBaseline = "middle";
      g.lineWidth = 12; g.strokeStyle = INK; g.strokeText(wd, 0, 0);
      g.fillStyle = YEL; g.fillText(wd, 0, 0);
      g.restore();
    }
  }
  // red X: shut it off
  const xp = win(C.ca_yellow + 0.25, C.ca_yellow + 0.42, t);
  if (xp > 0) {
    g.fillStyle = `rgba(10,10,8,${0.55 * xp})`; g.fillRect(0, 0, W, H);
    g.save(); g.translate(540, 900); g.scale(1 + 0.8 * (1 - xp), 1 + 0.8 * (1 - xp)); g.rotate(0.06);
    g.strokeStyle = RED; g.lineWidth = 60; g.lineCap = "square";
    g.beginPath(); g.moveTo(-300, -300); g.lineTo(300, 300); g.moveTo(300, -300); g.lineTo(-300, 300); g.stroke();
    g.restore();
  }
  return { z: 1 + 0.05 * win(C.s_caps, C.s_pov, t) };
};

const SAYS = "synergy innovative game-changer unlock your potential level up your content next level viral strategy best tips ever";
S.pov = (g, t) => {
  spot(g, 540, 900, 760, 0.9);
  numeral(g, 4, t, C.po_four - 0.05);
  pix(g, { text: "NO POINT", x: 300, y: 230, size: 92, color: CREAM, at: C.po_point - 0.08, align: "left" }, t);
  bar(g, 560, 340, 470, 84, C.po_view - 0.12, t);
  pix(g, { text: "OF VIEW", x: 560, y: 340, size: 66, color: CREAM, at: C.po_view - 0.04, shadow: false }, t);
  const drop = outQuint(win(C.s_pov - 0.05, C.s_pov + 0.6, t)), sw = Math.sin(t * 1.4) * 6;
  g.save(); g.translate(sw, -500 * (1 - drop));
  jar(g, 420, 930, 560, 720, t, (g2, x, y, w, h) => {
    g2.fillStyle = "#1a1c14"; g2.fillRect(x, y, w, h);
    drawRetro(g2, "fk_presenter", t - C.s_pov, x - 120, y + 90, w + 240, h - 90, { mode: "cream", px: 5, fx: 0.5, zoom: 1.6, fy: 0.35 });
  });
  g.restore();
  // speech bubble: says everything, means nothing
  const bIn = spring(win(C.po_point, C.po_point + 0.5, t));
  if (bIn > 0) {
    const bx = 790, by = 600, bw = 380 * bIn, bh = 300 * bIn;
    bubble(g, bx, by, bw, bh, bx - 150, 1);
    g.save(); g.beginPath(); g.rect(bx - bw / 2 + 14, by - bh / 2 + 14, bw - 28, bh - 28); g.clip();
    const every = win(C.po_everything - 0.1, C.po_everything + 0.7, t), noth = win(C.po_nothing - 0.05, C.po_nothing + 0.3, t);
    if (every <= 0) {
      if (Math.floor(t * 3) % 3 !== 0) { K.font(g, 90, 700, "Pixelify Sans"); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("...", bx, by - 10); }
    } else if (noth < 1) {
      K.font(g, 34, 400, "VT323"); g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "top";
      const lines = K.wrap(g, (SAYS + " " + SAYS).toUpperCase(), bw - 50);
      const scroll = (t - C.po_everything) * 160;
      lines.forEach((ln, i) => { const yy = by - bh / 2 + 26 + i * 34 - scroll * every; if (yy > by - bh / 2 - 40 && yy < by + bh / 2) g.fillText(ln, bx - bw / 2 + 26, yy); });
      if (noth > 0) { g.globalAlpha = noth; drawRetro(g, "fk_static", t, bx - bw / 2, by - bh / 2, bw, bh, { mode: "cream", px: 4 }); }
    } else {
      drawRetro(g, "fk_static", t, bx - bw / 2, by - bh / 2, bw, bh, { mode: "cream", px: 4 });
      K.font(g, 90, 700, "Pixelify Sans"); g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("=0", bx, by);
    }
    g.restore();
  }
  pix(g, { text: "SAYS EVERYTHING", x: 760, y: 1330, size: 50, color: CREAM, at: C.po_everything - 0.05 }, t);
  if (t > C.po_nothing) { bar(g, 760, 1410, 440, 70, C.po_nothing - 0.05, t); pix(g, { text: "MEANS NOTHING", x: 760, y: 1410, size: 44, color: CREAM, at: C.po_nothing + 0.05, shadow: false }, t); }
  return { z: 1 + 0.04 * win(C.s_pov, C.s_fix, t) };
};

S.fix = (g, t) => {
  const you = win(C.fx_more2 - 0.1, C.fx_you + 0.2, t);
  // "the fix isn't more AI"
  pix(g, { text: "THE FIX ISN'T", x: 540, y: 300, size: 80, color: CREAM, at: C.s_fix + 0.02, out: C.fx_more2 - 0.15 }, t);
  popup(g, { x: 540, y: 640, w: 820, h: 300, at: C.s_fix + 0.25, out: C.fx_more2 - 0.15, title: "MORE_AI.EXE", body: (g2, w, h) => {
    sprite(g2, WARN, 40, 100, 10, SP); g2.font = `400 64px "VT323"`; g2.fillStyle = INK; g2.textAlign = "left"; g2.textBaseline = "middle"; g2.fillText("add more AI?", 170, 150); g2.font = `400 40px "VT323"`; g2.fillText("[ yes ]   [ yes ]", 170, 225);
  } }, t);
  if (t > C.fx_ai && t < C.fx_more2) {
    const p = outExpo(win(C.fx_ai, C.fx_ai + 0.2, t));
    g.strokeStyle = RED; g.lineWidth = 30; g.beginPath(); g.moveTo(150, 760); g.lineTo(150 + 780 * p, 520); g.stroke();
    pix(g, { text: "NOPE", x: 780, y: 880, size: 70, color: RED, at: C.fx_ai + 0.15 }, t);
  }
  // "it's more you": a spotlight on one real person, filming with their own camera
  if (you > 0) {
    cone(g, 540, -DY, 1000, 140, 900, you);
    const r = 330 * outCubic(you);
    g.save(); g.beginPath(); g.arc(540, 640, r, 0, 7); g.clip();
    drawRetro(g, "fk_filmcam", t - C.fx_more2 + 1, 540 - 420, 640 - 330, 840, 660, { mode: "warm", px: 4, fx: 0.4 });
    g.restore();
    g.strokeStyle = CREAM; g.lineWidth = 8; g.beginPath(); g.arc(540, 640, r, 0, 7); g.stroke();
    pix(g, { text: "IT'S MORE", x: 540, y: 190, size: 76, color: CREAM, at: C.fx_more2 - 0.05 }, t);
    bar(g, 540, 1040, 360, 120, C.fx_you - 0.08, t);
    pix(g, { text: "YOU.", x: 540, y: 1040, size: 110, color: CREAM, at: C.fx_you, shadow: false }, t);
  }
  // three cards: your footage / timing / opinion
  const cards = [["FOOTAGE", "fk_filmcam", C.fx_footage, 0.35], ["TIMING", "fk_adjust", C.fx_timing, 0.5], ["OPINION", "fk_creator", C.fx_opinion, 0.62]];
  cards.forEach(([label, clip, at, fx], i) => {
    const p = spring(win(at - 0.12, at + 0.5, t));
    if (p <= 0) return;
    const x = 200 + i * 340, y = 1250 + 300 * (1 - p), w = 300, h = 300;
    g.save(); g.translate(x, y); g.rotate((i - 1) * 0.05 * p);
    g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(-w / 2 + 10, -h / 2 + 12, w, h);
    g.fillStyle = CREAM; g.fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle = RED; g.fillRect(-w / 2, -h / 2, w, 60);
    K.font(g, 20, 400, "Press Start 2P"); g.fillStyle = CREAM; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("YOUR", 0, -h / 2 + 31);
    drawRetro(g, clip, t - at + 1, -w / 2 + 14, -h / 2 + 72, w - 28, 150, { mode: "warm", px: 3, fx });
    K.font(g, 44, 700, "Pixelify Sans"); g.fillStyle = INK; g.fillText(label, 0, h / 2 - 40);
    g.restore();
  });
  return { z: 1 + 0.04 * win(C.s_fix, C.s_outro, t) };
};

S.outro = (g, t) => {
  const taste = win(C.ou_you - 0.1, C.ou_you + 0.4, t), end = win(C.ou_follow - 0.15, C.ou_follow + 0.4, t);
  cone(g, 540, -DY, 1300, 200, 1000, 0.6 + 0.4 * taste);
  // AI does the clicking: real fingers on a real keyboard, a pixel cursor clicking away
  const kIn = outQuint(win(C.s_outro - 0.05, C.s_outro + 0.5, t)), kOut = outQuint(taste);
  const fx = lerp(lerp(-900, 90, kIn), 90, 0), fy = lerp(560, 360, kOut), fw = lerp(900, 520, kOut), fh = fw * 0.5;
  g.save(); g.globalAlpha = 1 - end;
  g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(fx + (900 - fw) / 2 * kOut + 12, fy - fh / 2 + 14, fw, fh);
  g.fillStyle = CREAM; g.fillRect(fx + (900 - fw) / 2 * kOut - 10, fy - fh / 2 - 10, fw + 20, fh + 20);
  drawRetro(g, "fk_keys", t - C.s_outro, fx + (900 - fw) / 2 * kOut, fy - fh / 2, fw, fh, { mode: "warm", px: 4 });
  g.restore();
  if (taste < 1) {
    pix(g, { text: "LET AI DO", x: 540, y: 960, size: 84, color: CREAM, at: C.s_outro + 0.1, out: C.ou_you - 0.1 }, t);
    bar(g, 540, 1080, 620, 96, C.ou_clicking - 0.12, t, RED, C.ou_you - 0.1);
    pix(g, { text: "THE CLICKING", x: 540, y: 1080, size: 64, color: CREAM, at: C.ou_clicking - 0.02, out: C.ou_you - 0.1, shadow: false }, t);
    for (let i = 0; i < 5; i++) {   // the cursor clicks
      const ct = C.s_outro + 0.4 + i * 0.32; if (t < ct) continue;
      const cx = 220 + ((i * 197) % 640), cy = 470 + ((i * 113) % 200);
      const p = win(ct, ct + 0.35, t);
      g.strokeStyle = `rgba(232,197,71,${1 - p})`; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 10 + 50 * p, 0, 7); g.stroke();
      if (i === Math.min(4, Math.floor((t - C.s_outro - 0.4) / 0.32))) sprite(g, ARROW, cx - 4, cy - 4, 7, SP);
    }
  }
  // you keep the taste
  if (taste > 0) {
    const p = spring(win(C.ou_you, C.ou_you + 0.7, t));
    const tx = 540, ty = lerp(1400, 860, p) - end * 160, s = 16 * (1 + end * 0.35);
    spot(g, tx, ty + 60, 420, p);
    sprite(g, TROPHY, tx - 7 * s, ty - 7 * s, s, SP);
    if (t > C.ou_taste) for (let i = 0; i < 8; i++) {   // sparkle pixels
      const a = i / 8 * Math.PI * 2 + t, rr = 200 + 30 * Math.sin(t * 3 + i);
      g.fillStyle = i % 2 ? YEL : CREAM; g.fillRect(tx + Math.cos(a) * rr, ty + Math.sin(a) * rr * 0.8, 12, 12);
    }
    pix(g, { text: "YOU KEEP", x: 540, y: 1140 - end * 860, size: 80, color: CREAM, at: C.ou_you, out: C.ou_follow - 0.15 }, t);
    bar(g, 540, 1260, 460, 100, C.ou_taste - 0.1, t, RED, C.ou_follow - 0.15);
    pix(g, { text: "THE TASTE", x: 540, y: 1260, size: 70, color: CREAM, at: C.ou_taste, out: C.ou_follow - 0.15, shadow: false }, t);
  }
  if (end > 0) {
    bulbs(g, t, 3, end);
    pix(g, { text: "FOLLOW FOR MORE", x: 540, y: 1180, size: 70, color: CREAM, at: C.ou_follow - 0.05 }, t);
    bar(g, 540, 1300, 640, 110, C.ou_editing - 0.4, t);
    pix(g, { text: "VIBE EDITING", x: 540, y: 1300, size: 80, color: CREAM, at: C.ou_editing - 0.3, shadow: false }, t);
    sprite(g, HEART, 870, 1240, 10, SP);
  }
  return { z: 1 + 0.03 * win(C.s_outro, C.end, t) };
};

// ---------------------------------------------------------------- transitions --
// Alternating glitch slices and pixel mosaics at each scene change.
const tmp = K.makeCanvas(W, H), tg = tmp.getContext("2d");
const mos = K.makeCanvas(W, H), mg = mos.getContext("2d");
function glitch(g, t, k, amt) {
  tg.clearRect(0, 0, W, H); tg.drawImage(g.canvas, 0, 0);
  const r = rnd(Math.floor(t * 30) * 13 + k);
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const y = r() * H, h = 20 + r() * 140, dx = (r() - 0.5) * 220 * amt;
    g.drawImage(tmp, 0, y, W, h, dx, y, W, h);
    if (r() < 0.4) { g.fillStyle = `rgba(200,16,46,${0.25 * amt})`; g.fillRect(0, y, W, h * 0.3); }
  }
  g.save(); g.globalAlpha = 0.35 * amt; g.globalCompositeOperation = "screen";
  const st = K.footage("fk_static", t, 1, true); if (st) g.drawImage(st, 0, 0, W, H);
  g.restore();
}
function mosaic(g, amt) {
  const b = Math.max(1, Math.round(4 + amt * 60));
  const sw = Math.ceil(W / b), sh = Math.ceil(H / b);
  mg.imageSmoothingEnabled = true; mg.clearRect(0, 0, sw, sh); mg.drawImage(g.canvas, 0, 0, sw, sh);
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(mos, 0, 0, sw, sh, 0, 0, W, H); g.restore();
}

function frame(g, t) {
  let i = 0;
  while (i < SCENES.length - 1 && t >= START[SCENES[i + 1]]) i++;
  const name = SCENES[i], ts = START[name];
  g.save();
  // per-scene camera: a slow push-in; a quick settle as each scene lands
  const land = 1 - outCubic(win(ts, ts + 0.35, t));
  g.drawImage(BG[SCENE_BG[name]](), 0, 0, W, H);
  const tn = i < SCENES.length - 1 ? START[SCENES[i + 1]] : C.end;
  const z = (1 + 0.045 * win(ts, tn, t)) * (1 + 0.06 * land);
  g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2 - 30 * land + DY);
  S[name](g, t);
  g.restore();
  // grit on top: vignette, grain, faint static
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.62)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const sf = K.footage("fk_static", t * 0.7, 1, true);
  if (sf) { g.save(); g.globalAlpha = 0.05; g.globalCompositeOperation = "screen"; g.drawImage(sf, 0, 0, W, H); g.restore(); }
  K.grain(g, t, 0.09);
  // scene-change transition
  let moving = land > 0.3, speed = land * 0.6;
  for (let k = 1; k < SCENES.length; k++) {
    const b = START[SCENES[k]], d = t - b;
    if (d > -0.16 && d < 0.22) {
      const amt = 1 - Math.abs(d) / (d < 0 ? 0.16 : 0.22);
      if (k % 2) { glitch(g, t, k, amt); moving = true; speed = Math.max(speed, amt * 0.6); }
      else { mosaic(g, amt); if (amt > 0.1) moving = false; }   // pixel blocks stay crisp
    }
  }
  K.captions(g, t, { y: 1560, size: 40, weight: 500, family: "Pixelify Sans", color: CREAM, hi: RED, hiText: CREAM, radius: 0, shadow: "rgba(0,0,0,0.8)", maxW: 880 });
  return { moving, speed };
}

K.run(frame, ['700 40px "Pixelify Sans"', '500 40px "Pixelify Sans"', '40px "Press Start 2P"', '40px "VT323"', '40px "Anton"']);
})();

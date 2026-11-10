// 2D overlay layer: headlines, cards, chips, tags, labels, end card. Everything is a function of time.
import { rr } from './ads.js';

export const W = 1080, H = 1920;
export const COL = { w: '#ffffff', g: '#F5C561', o: '#FDA84C', r: '#E8675C', c: '#6BD8F3' };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const out3 = (x) => 1 - Math.pow(1 - x, 3);
const inOut = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const back = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);

// ---------- headline ----------
export function parseHead(s) {
  const runs = []; const re = /\[(g|o|r|c)\](.*?)\[\/\1\]/g; let last = 0, m;
  while ((m = re.exec(s))) { if (m.index > last) runs.push({ t: s.slice(last, m.index), c: 'w' }); runs.push({ t: m[2], c: m[1] }); last = re.lastIndex; }
  if (last < s.length) runs.push({ t: s.slice(last), c: 'w' });
  // split into words keeping colour
  const words = []; for (const r of runs) for (const [i, w] of r.t.split(' ').entries()) { if (w) words.push({ t: w, c: r.c, sp: i > 0 || words.length > 0 }); }
  return words;
}
const headCache = new Map();
function layoutHead(g, s, maxW) {
  const key = s; if (headCache.has(key)) return headCache.get(key);
  const words = parseHead(s); let size = 88, lines;
  for (; size >= 60; size -= 4) {
    g.font = `800 ${size}px Inter`; lines = [[]]; let x = 0; const space = g.measureText(' ').width;
    for (const w of words) {
      const ww = g.measureText(w.t).width, add = (lines.at(-1).length ? space : 0) + ww;
      if (x + add > maxW && lines.at(-1).length) { lines.push([]); x = 0; }
      const lx = lines.at(-1).length ? x + space : 0; lines.at(-1).push({ ...w, x: lx }); x = lx + ww;
    }
    if (lines.length <= 2) break;
  }
  const res = { size, lines }; headCache.set(key, res); return res;
}
export function drawHead(g, s, alpha, dy, blur) {
  if (!s || alpha <= 0) return;
  const L = layoutHead(g, s, W - 126);
  g.save(); g.globalAlpha = alpha; g.font = `800 ${L.size}px Inter`; g.textBaseline = 'alphabetic';
  if (blur > 0.05) g.filter = `blur(${blur.toFixed(1)}px)`;
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 22; g.shadowOffsetY = 3;
  L.lines.forEach((ln, i) => { const y = 177 + L.size * 0.73 + i * L.size * 1.04 + dy; for (const w of ln) { g.fillStyle = COL[w.c]; g.fillText(w.t, 63 + w.x, y); } });
  g.restore();
}
// beats: [{t0, head}], hide: function(t) -> bool
export function drawScrim(g) { const gr = g.createLinearGradient(0, 0, 0, 560); gr.addColorStop(0, 'rgba(0,0,0,0.62)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 560); }
export function drawHeadlines(g, beats, t) {
  let i = -1; for (let k = 0; k < beats.length; k++) if (t >= beats[k].t0 - 0.03) i = k;
  if (i < 0) i = 0;
  const cur = beats[i], prev = i > 0 ? beats[i - 1] : null, sw = cur.t0 - 0.03;
  const same = prev && prev.head === cur.head;
  if (prev && !same && t - sw < 0.167) { const k = seg(t, sw, sw + 0.167); drawHead(g, prev.head, 1 - k, -6 * k, 3 * k); }
  if (i === 0 || same) { drawHead(g, cur.head, i === 0 ? out3(seg(t, 0, 0.12)) : 1, 0, 0); return; }
  const k = out3(seg(t, sw + 0.1, sw + 0.2)); drawHead(g, cur.head, k, 9 * (1 - k), 2 * (1 - k));
}

// ---------- small parts ----------
export function drawHandle(g, a = 1) {
  g.save(); g.globalAlpha = 0.85 * a; g.fillStyle = '#fff'; g.font = '500 21px "JetBrains Mono"'; g.textAlign = 'right';
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 8; g.fillText('IdeaBro Studio', W - 57, 146); g.restore();
}
export function drawIllus(g, a = 1, y = 1405) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.font = '700 17px Inter'; g.letterSpacing = '2.5px';
  const txt = 'ILLUSTRATION', w = g.measureText(txt).width + 56;
  g.fillStyle = 'rgba(12,13,17,0.55)'; rr(g, 63, y, w, 38, 8); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(80, y + 26); g.lineTo(92, y + 14); g.stroke();
  g.fillStyle = 'rgba(235,235,240,0.9)'; g.fillText(txt, 102, y + 26); g.restore();
}
export function drawSource(g, text, a = 1, y = 1470) {
  if (!text || a <= 0) return;
  g.save(); g.globalAlpha = a; g.letterSpacing = '2px'; g.font = '700 16px Inter'; g.fillStyle = 'rgba(200,200,208,0.85)';
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 10; g.fillText('SOURCE', 66, y);
  const sw = g.measureText('SOURCE').width; g.letterSpacing = '0px'; g.font = '600 19px Inter'; g.fillStyle = '#fff'; g.fillText(text, 66 + sw + 16, y); g.restore();
}

// odometer-style rolling text. p in 0..1
export function drawRoll(g, str, x, y, p, size) {
  const chars = [...str]; let cx = x; let di = 0; const nd = chars.filter((c) => /\d/.test(c)).length;
  for (const ch of chars) {
    const w = g.measureText(ch).width;
    if (/\d/.test(ch)) {
      const d = +ch, k = out3(clamp(p * 1.35 - (nd - 1 - di) * 0.06)); di++;
      const v = (d + 10 * (1 - k) * 2) % 10, base = Math.floor(v), f = v - base;   // rolls through ~2 turns
      g.save(); g.beginPath(); g.rect(cx - 2, y - size * 0.95, w + 4, size * 1.15); g.clip();
      const moving = k < 0.999;
      g.globalAlpha *= moving ? 0.85 : 1;
      g.fillText(String(base % 10), cx, y - f * size * 1.05);
      g.fillText(String((base + 1) % 10), cx, y + (1 - f) * size * 1.05);
      g.restore();
    } else g.fillText(ch, cx, y);
    cx += w;
  }
  return cx;
}

function glass(g, x, y, w, h, accent) {
  g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30;
  g.fillStyle = 'rgba(14,15,19,0.84)'; rr(g, x, y, w, h, 14); g.fill(); g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1.5; rr(g, x, y, w, h, 14); g.stroke();
  if (accent) { g.fillStyle = COL[accent]; rr(g, x, y + 6, 6, h - 12, 3); g.fill(); }
}
const capsLabel = (g, txt, x, y, col = 'rgba(190,190,198,0.95)', size = 17) => { g.save(); g.font = `700 ${size}px Inter`; g.letterSpacing = '2.5px'; g.fillStyle = col; g.fillText(txt, x, y); g.restore(); };

// ---------- cards ----------
// o: {type:'data', label, source, items:[{label, value, op}], accent}
export function drawCard(g, o, lt, dur) {
  const a = out3(seg(lt, 0, 0.3)) * (1 - seg(lt, dur - 0.2, dur)); if (a <= 0) return;
  const dy = 24 * (1 - out3(seg(lt, 0, 0.35)));
  g.save(); g.globalAlpha = a; g.translate(0, dy);
  const p = seg(lt, 0.15, (o.roll ?? 0.9) + 0.15);
  if (o.type === 'data') {
    const x = 63, y = o.y ?? 1490, w = W - 126, h = 196;
    glass(g, x, y, w, h, o.accent ?? 'g');
    capsLabel(g, o.label, x + 34, y + 44);
    if (o.source) { g.save(); g.textAlign = 'right'; g.font = '600 18px Inter'; g.fillStyle = '#fff'; g.fillText(o.source, x + w - 30, y + 44);
      const sw = g.measureText(o.source).width; g.letterSpacing = '2px'; g.font = '700 15px Inter'; g.fillStyle = 'rgba(190,190,198,0.9)'; g.fillText('SOURCE', x + w - 44 - sw, y + 44); g.restore(); }
    const n = o.items.length, colW = (w - 68) / n;
    o.items.forEach((it, i) => {
      const ix = x + 34 + i * colW;
      if (it.label) capsLabel(g, it.label, ix, y + 92, 'rgba(170,170,180,0.95)', 15);
      g.font = `800 ${it.size ?? 52}px Inter`; g.fillStyle = it.c ? COL[it.c] : '#fff';
      const pi = clamp(p * 1.2 - i * 0.12);
      const ex = drawRoll(g, it.value, ix, y + 160, pi, it.size ?? 52);
      if (it.unit) { g.font = '700 26px Inter'; g.fillStyle = 'rgba(230,230,235,0.9)'; g.fillText(it.unit, ex + 8, y + 160); }
      if (it.op) { g.font = '600 40px Inter'; g.fillStyle = 'rgba(200,200,210,0.8)'; g.fillText(it.op, ix - 44, y + 154); }
    });
  } else if (o.type === 'chip') {      // counter chip with optional progress track
    const x = 63, y = o.y ?? 1500, w = o.w ?? 760, h = 150;
    glass(g, x, y, w, h, o.accent ?? 'r');
    capsLabel(g, o.label, x + 34, y + 42);
    const v = o.from + (o.to - o.from) * out3(seg(lt, o.at0 ?? 0.2, (o.at0 ?? 0.2) + (o.count ?? 1.2)));
    const str = o.fmt ? o.fmt(v) : String(Math.round(v));
    g.font = '800 64px Inter'; g.fillStyle = o.accent ? COL[o.accent] : '#fff'; g.fillText(str, x + 34, y + 118);
    const vw = g.measureText(str).width;
    if (o.unit) { g.font = '800 30px Inter'; g.fillStyle = '#fff'; g.fillText(o.unit, x + 44 + vw, y + 118); }
    if (o.track) {
      const tx = x + 330, tw = w - 380, ty = y + 100, k = (v - o.from) / (o.to - o.from);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(tx, ty - 2, tw, 4);
      g.fillStyle = COL[o.accent ?? 'r']; g.fillRect(tx, ty - 2, tw * k, 4);
      g.beginPath(); g.arc(tx + tw * k, ty, 9, 0, 7); g.fill();
      g.font = '600 18px Inter'; g.fillStyle = 'rgba(200,200,210,0.85)'; g.fillText(o.track[0], tx, ty + 34);
      g.textAlign = 'right'; g.fillText(o.track[1], tx + tw, ty + 34); g.textAlign = 'left';
    }
  } else if (o.type === 'quote') {
    const x = 63, y = o.y ?? 1470, w = W - 126;
    g.font = '700 30px Inter'; const lines = wrap(g, o.text, w - 110);
    const h = 70 + lines.length * 40 + 40;
    glass(g, x, y, w, h, 'c');
    g.fillStyle = COL.c; g.font = '900 70px Inter'; g.fillText('“', x + 30, y + 76);
    g.font = '700 30px Inter'; g.fillStyle = '#fff'; lines.forEach((l, i) => g.fillText(l, x + 84, y + 58 + i * 40));
    capsLabel(g, o.by, x + 84, y + 58 + lines.length * 40 + 18, 'rgba(180,180,190,0.95)', 15);
  }
  g.restore();
}
function wrap(g, text, maxW) { const out = []; let line = ''; for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); return out; }

// floating label pinned to a 3D point (screen pos given)
export function drawFloat(g, o, lt, dur, sx, sy) {
  const a = out3(seg(lt, 0, 0.25)) * (1 - seg(lt, dur - 0.2, dur)); if (a <= 0) return;
  const s = back(seg(lt, 0, 0.35), 2);
  g.save(); g.globalAlpha = a; g.translate(sx, sy); g.scale(s, s);
  g.font = `800 ${o.size ?? 30}px Inter`; g.letterSpacing = '1px';
  const tw = g.measureText(o.text).width, h = (o.size ?? 30) * 1.7, w = tw + 44;
  const col = COL[o.c ?? 'g'];
  g.fillStyle = o.fill ? col : 'rgba(10,11,15,0.72)'; rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill();
  g.strokeStyle = col; g.lineWidth = 3; rr(g, -w / 2, -h / 2, w, h, h / 2); g.stroke();
  g.fillStyle = o.fill ? '#14161c' : col; g.textAlign = 'center'; g.fillText(o.text, 0, (o.size ?? 30) * 0.36);
  g.restore();
}

// ---------- end card ----------
export function drawEnd(g, lt) {
  const bgA = out3(seg(lt, 0, 0.35));
  g.save(); g.globalAlpha = bgA;
  const bg = g.createRadialGradient(W / 2, 760, 50, W / 2, 900, 1300); bg.addColorStop(0, '#1a2140'); bg.addColorStop(0.55, '#0c1022'); bg.addColorStop(1, '#05060c');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // drifting particles
  for (let i = 0; i < 26; i++) {
    const sx = ((i * 397) % 1000) / 1000 * W, sy = ((i * 613) % 1000) / 1000 * H, sp = 10 + (i % 5) * 6;
    const y = (sy - lt * sp + H) % H, s = 6 + (i % 4) * 3;
    g.fillStyle = i % 3 ? 'rgba(255,255,255,0.12)' : 'rgba(245,197,97,0.35)';
    g.save(); g.translate(sx, y); g.rotate(i + lt * 0.3); g.fillRect(-s / 2, -s / 2, s, s); g.restore();
  }
  g.restore();
  // bulb mark
  const bk = seg(lt, 0.35, 0.85); if (bk > 0) {
    const s = back(bk, 1.8); g.save(); g.translate(W / 2, 600); g.scale(s, s); g.globalAlpha = clamp(bk * 3);
    const glow = g.createRadialGradient(0, -10, 10, 0, -10, 260); glow.addColorStop(0, 'rgba(245,170,60,0.55)'); glow.addColorStop(1, 'rgba(245,170,60,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(0, -10, 260, 0, 7); g.fill();
    const gb = g.createRadialGradient(-30, -60, 10, 0, -30, 130); gb.addColorStop(0, '#fff3d6'); gb.addColorStop(0.5, '#f7c25a'); gb.addColorStop(1, '#e0892a');
    g.fillStyle = gb; g.beginPath(); g.arc(0, -40, 112, Math.PI * 0.78, Math.PI * 0.22); g.lineTo(46, 92); g.lineTo(-46, 92); g.closePath(); g.fill();
    g.fillStyle = '#d9dce3'; for (let i = 0; i < 3; i++) { rr(g, -50, 100 + i * 24, 100, 18, 9); g.fill(); }
    g.fillStyle = '#9aa0ab'; rr(g, -26, 172, 52, 20, 10); g.fill();
    g.strokeStyle = '#7a4310'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-30, 40); g.lineTo(-14, -6); g.lineTo(0, 30); g.lineTo(14, -6); g.lineTo(30, 40); g.stroke();
    g.restore();
  }
  const txt = (s, font, col, y, t0, track = 0) => { const k = out3(seg(lt, t0, t0 + 0.45)); if (k <= 0) return;
    g.save(); g.globalAlpha = k; g.font = font; g.fillStyle = col; g.textAlign = 'center'; if (track) g.letterSpacing = track + 'px'; g.fillText(s, W / 2, y + 30 * (1 - k)); g.restore(); };
  txt('AI & Advertising', '800 104px Inter', '#ffffff', 920, 0.7);
  txt('by IdeaBro Studio', '700 40px "JetBrains Mono"', COL.g, 990, 0.85);
  txt('Make, target and scale ads with AI.', '500 38px Inter', 'rgba(220,224,235,0.85)', 1080, 1.0);
  // CTA pill
  const ck = seg(lt, 1.25, 1.65); if (ck > 0) {
    const s = back(ck, 2.2), w = 680, h = 124; g.save(); g.globalAlpha = clamp(ck * 3); g.translate(W / 2, 1220); g.scale(s, s);
    g.shadowColor = 'rgba(245,170,60,0.55)'; g.shadowBlur = 60; g.fillStyle = '#F5B24A'; rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill(); g.shadowBlur = 0;
    g.fillStyle = '#15120c'; g.font = '800 46px Inter'; g.textAlign = 'center'; g.fillText('Join the course  →', 0, 16); g.restore();
  }
  // "Link in bio" typed
  const tk = seg(lt, 1.8, 2.4), full = 'Link in bio'; if (tk > 0) {
    g.save(); g.font = '600 40px Inter'; g.fillStyle = 'rgba(255,255,255,0.9)'; g.textAlign = 'center';
    const n = Math.round(full.length * tk); g.fillText(full.slice(0, n) + (tk < 1 && Math.floor(lt * 4) % 2 ? '|' : ''), W / 2, 1370); g.restore();
  }
  // Like / Share / Follow light up one by one
  const icons = [['Like', '#ff5470'], ['Share', '#7c9cff'], ['Follow', '#F5B24A']];
  icons.forEach(([lab, col], i) => {
    const a = seg(lt, 1.5, 1.8); if (a <= 0) return;
    const on = seg(lt, 2.5 + i * 0.3, 2.65 + i * 0.3), x = W / 2 + (i - 1) * 190, y = 1520;
    g.save(); g.globalAlpha = a;
    g.fillStyle = on > 0 ? col : 'rgba(255,255,255,0.08)'; g.globalAlpha = a * (0.35 + 0.65 * on); g.beginPath(); g.arc(x, y, 50 * (1 + 0.15 * Math.sin(Math.PI * on)), 0, 7); g.fill();
    g.globalAlpha = a; g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 50, 0, 7); g.stroke();
    g.fillStyle = '#fff'; g.font = '600 26px Inter'; g.textAlign = 'center'; g.fillText(lab, x, y + 92);
    // tiny glyphs
    g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 5;
    if (i === 0) { g.beginPath(); g.moveTo(x, y + 18); g.bezierCurveTo(x - 34, y - 6, x - 18, y - 30, x, y - 12); g.bezierCurveTo(x + 18, y - 30, x + 34, y - 6, x, y + 18); g.fill(); }
    if (i === 1) { g.beginPath(); g.moveTo(x - 22, y + 2); g.lineTo(x + 22, y - 18); g.lineTo(x + 6, y + 22); g.lineTo(x, y + 6); g.closePath(); g.fill(); }
    if (i === 2) { g.beginPath(); g.arc(x - 6, y - 10, 11, 0, 7); g.fill(); g.beginPath(); g.arc(x - 6, y + 22, 20, Math.PI, 0); g.fill(); g.fillRect(x + 14, y - 4, 18, 5); g.fillRect(x + 20.5, y - 10.5, 5, 18); }
    g.restore();
  });
}

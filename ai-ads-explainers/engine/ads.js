// Procedural ad creatives (fictional brands only), drawn into canvases for screens, feeds and walls.
export const BRANDS = ['NOVA', 'KORA', 'Brewly', 'LUMI', 'Zest&Co', 'ARCA', 'Halo', 'Mitti', 'Velo', 'Saffron'];
export const HEADS = ['Made for you', 'Your size is back', 'New season. New you.', 'Taste the weekend', 'Ready when you are',
  'Aapke liye, sirf aaj', 'Feel the rush', 'Cool down, Mumbai', 'Back in stock', 'Built for Monday', 'Treat yourself', 'One sip. Pure joy'];
export const PALETTES = [
  ['#f7ead6', '#f1bd76', '#2a1c10', '#e59a3a'],
  ['#e8f1ff', '#7fb2ff', '#0d1b33', '#2f6fe0'],
  ['#ffe8e3', '#ff8f7a', '#3a120c', '#e0503a'],
  ['#e9f8ef', '#6fd39a', '#0e2a1b', '#1f9d5b'],
  ['#f3ecff', '#b79bff', '#1d1238', '#6f4ce0'],
  ['#fff6d6', '#ffd24d', '#2b2205', '#e0a800'],
  ['#e6fbff', '#5fd6ea', '#06262c', '#119bb3'],
  ['#1d1f26', '#3a3f4d', '#f5f1ea', '#f0a53a'],
];

export function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

export function product(g, kind, cx, cy, s, c1, c2, c3) {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(0, 150, 120, 16, 0, 0, 7); g.fill();
  if (kind === 0) {           // bottle
    g.fillStyle = c3; rr(g, -30, -165, 60, 62, 10); g.fill(); rr(g, -16, -108, 32, 24, 4); g.fill();
    g.fillStyle = c1; rr(g, -92, -86, 184, 236, 32); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.3)'; rr(g, -76, -70, 20, 190, 10); g.fill();
    g.fillStyle = c2; rr(g, -52, 6, 104, 56, 8); g.fill();
  } else if (kind === 1) {    // can
    g.fillStyle = c1; rr(g, -70, -150, 140, 300, 22); g.fill();
    g.fillStyle = c3; g.fillRect(-70, -150, 140, 14); g.fillRect(-70, 136, 140, 14);
    g.fillStyle = c2; rr(g, -50, -40, 100, 80, 10); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(-56, -130, 14, 260);
  } else if (kind === 2) {    // headphones
    g.strokeStyle = c3; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.arc(0, 10, 105, Math.PI, 0); g.stroke();
    g.fillStyle = c1; rr(g, -138, 0, 64, 120, 26); g.fill(); rr(g, 74, 0, 64, 120, 26); g.fill();
    g.fillStyle = c2; rr(g, -128, 14, 44, 92, 18); g.fill(); rr(g, 84, 14, 44, 92, 18); g.fill();
  } else if (kind === 3) {    // sneaker
    g.fillStyle = c1; g.beginPath(); g.moveTo(-150, 60); g.quadraticCurveTo(-150, -30, -80, -50); g.lineTo(-20, -40);
    g.quadraticCurveTo(40, 10, 140, 20); g.quadraticCurveTo(170, 40, 160, 70); g.lineTo(-150, 70); g.fill();
    g.fillStyle = c3; g.fillRect(-152, 62, 314, 22);
    g.strokeStyle = c2; g.lineWidth = 8; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-70 + i * 22, -40 + i * 6); g.lineTo(-52 + i * 22, -10 + i * 6); g.stroke(); }
  } else {                    // car
    g.fillStyle = c1; g.beginPath(); g.moveTo(-170, 60); g.lineTo(-160, 10); g.quadraticCurveTo(-90, -10, -60, -55);
    g.lineTo(60, -55); g.quadraticCurveTo(110, -10, 165, 5); g.lineTo(172, 60); g.closePath(); g.fill();
    g.fillStyle = 'rgba(200,230,255,0.75)'; g.beginPath(); g.moveTo(-50, -45); g.lineTo(52, -45); g.lineTo(88, -8); g.lineTo(-82, -8); g.fill();
    g.fillStyle = c3; for (const x of [-100, 105]) { g.beginPath(); g.arc(x, 62, 34, 0, 7); g.fill(); }
    g.fillStyle = '#bbb'; for (const x of [-100, 105]) { g.beginPath(); g.arc(x, 62, 14, 0, 7); g.fill(); }
  }
  g.restore();
}

// Draw one ad creative filling (w, h). i picks brand/headline/palette/product deterministically.
export function drawAd(g, w, h, i, o = {}) {
  const P = PALETTES[(o.pal ?? i) % PALETTES.length], brand = o.brand ?? BRANDS[i % BRANDS.length];
  const head = o.head ?? HEADS[(i * 5 + 3) % HEADS.length], kind = o.kind ?? (i % 5);
  const k = Math.min(w / 512, h / 400);
  g.save();
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, P[0]); bg.addColorStop(1, P[1]);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (o.scene === 'snow') {   // mountain backdrop
    const sk = g.createLinearGradient(0, 0, 0, h * 0.6); sk.addColorStop(0, '#9fb6d6'); sk.addColorStop(1, '#e9f0fa'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6d7f9c'; g.beginPath(); g.moveTo(0, h * 0.55); g.lineTo(w * 0.3, h * 0.22); g.lineTo(w * 0.55, h * 0.48); g.lineTo(w * 0.78, h * 0.18); g.lineTo(w, h * 0.5); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(w * 0.3, h * 0.22); g.lineTo(w * 0.36, h * 0.3); g.lineTo(w * 0.24, h * 0.3); g.fill();
    g.beginPath(); g.moveTo(w * 0.78, h * 0.18); g.lineTo(w * 0.85, h * 0.27); g.lineTo(w * 0.71, h * 0.27); g.fill();
    g.fillStyle = '#f4f7fb'; g.fillRect(0, h * 0.62, w, h);
  } else if (o.scene === 'city') {
    const sk = g.createLinearGradient(0, 0, 0, h * 0.6); sk.addColorStop(0, '#f2a65a'); sk.addColorStop(1, '#ffd9a0'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3b3550'; for (let b = 0; b < 9; b++) { const bw = w / 9, bh = h * (0.18 + ((b * 37) % 11) / 30); g.fillRect(b * bw, h * 0.62 - bh, bw - 4 * k, bh); }
    g.fillStyle = '#4a4a55'; g.fillRect(0, h * 0.62, w, h); g.fillStyle = '#f5d76e'; for (let x = 0; x < w; x += 60 * k) g.fillRect(x, h * 0.8, 30 * k, 6 * k);
  }
  if (!o.scene) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(w * 0.5, h * 0.38, w * 0.36, 0, 7); g.fill(); }
  product(g, kind, w * 0.5, o.scene ? h * 0.6 : h * 0.38, k * (o.scene ? 0.95 : 1.05), P[3], P[0], P[2]);
  g.fillStyle = P[2]; g.textAlign = 'center';
  g.font = `800 ${Math.round(26 * k)}px Inter`; if (o.scene) { g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.fillText(brand.toUpperCase(), 20 * k, 34 * k); g.textAlign = 'center'; } else g.fillText(brand.toUpperCase(), w / 2, h * 0.08 + 18 * k);
  if (!o.noText) {
    g.font = `800 ${Math.round(46 * k)}px Inter`;
    const words = head.split(' '), lines = []; let line = '';
    for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (g.measureText(tst).width > w * 0.86 && line) { lines.push(line); line = wd; } else line = tst; }
    lines.push(line);
    const y0 = o.scene ? h * 0.24 : h * 0.72;
    if (o.scene) { g.fillStyle = 'rgba(255,255,255,0.0)'; }
    g.fillStyle = o.scene ? '#ffffff' : P[2];
    if (o.scene) { g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 12 * k; }
    lines.forEach((l, j) => g.fillText(l, w / 2, y0 + j * 52 * k));
    g.shadowBlur = 0;
    g.fillStyle = P[2]; rr(g, w * 0.27, h * 0.86, w * 0.46, 56 * k, 28 * k); g.fill();
    g.fillStyle = P[0]; g.font = `700 ${Math.round(24 * k)}px Inter`; g.fillText(o.cta ?? 'Shop now', w / 2, h * 0.86 + 37 * k);
  }
  g.textAlign = 'left';
  g.restore();
}

// A dull, generic "old" ad
export function drawDullAd(g, w, h) {
  const k = w / 512;
  g.fillStyle = '#8b8d91'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#a3a5a9'; rr(g, 40 * k, 60 * k, w - 80 * k, h * 0.5, 20 * k); g.fill();
  product(g, 0, w / 2, h * 0.34, k * 0.95, '#8e9095', '#9da0a4', '#76787c');
  g.fillStyle = '#c3c5c8'; g.textAlign = 'center'; g.font = `800 ${Math.round(64 * k)}px Inter`; g.fillText('BIG SALE', w / 2, h * 0.7);
  g.fillStyle = '#b0b2b5'; g.font = `500 ${Math.round(26 * k)}px Inter`; g.fillText('Everything 10% off', w / 2, h * 0.75);
  g.textAlign = 'left';
}

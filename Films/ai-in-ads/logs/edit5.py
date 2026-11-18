import re
s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
# --- S5: real adverts, one a beat, each blurring away under the next
a=s.index("  // posters: the winner first, then a new one every beat, pasted over")
b=s.index("  cast(g);\n  lattice(g, cam, -1.0, -0.56")
s=s[:a]+"""  // posters: the winner first, then a new one every beat, pasted over; the one beneath blurs and fades
  const first = 37.9, every = beat(1);
  const n = t < 40.0 ? 0 : 1 + Math.floor((t - 40.0) / every);
  const at = (m) => (m === 0 ? first : 40.0 + (m - 1) * every);
  for (let m = Math.max(0, n - 1); m <= n; m++) {
    const a = t - at(m); if (a < 0) continue;
    const press = clamp(a / 0.35), gone = m < n ? clamp((t - at(n)) / 0.45) : 0;
    puppet(0.6 * (1 - EASE.out(press)) + 0.7 * gone, (x) => advert(x, m, 0, -0.085, lerp(1.06, 1, EASE.out(press))), { alpha: lerp(0.4, 1, press) * (1 - gone) });
  }
  puppet(0.3, (x) => {   // birds cross the morning
    for (let j = 0; j < 3; j++) { const bt = lt - 0.6 - j * 0.7; if (bt < 0) continue; const bx = -1.1 + bt * 0.42, by = -0.42 + j * 0.05 + 0.02 * Math.sin(bt * 2), fl = Math.sin(bt * 15 + j) * 0.018;
      x.strokeStyle = PALETTE.ink; x.lineWidth = 0.005; x.beginPath(); x.moveTo(bx - 0.025, by - fl); x.quadraticCurveTo(bx - 0.01, by - 0.004, bx, by); x.quadraticCurveTo(bx + 0.01, by - 0.004, bx + 0.025, by - fl); x.stroke(); }
  });
"""+s[b:]
rep("// ---------------------------------------------------------------- S6: she hums the refrain (45-52.5)","""// Adverts (never real brands or copy): a product cut-out and one word, set in the machine's sans; every one different
const AD_WORDS = ['MORE', 'NOW', 'NEXT', 'YOURS', 'FAST', 'AGAIN', 'MORE'];
function cutWord(x, str, cx, cy, px, role = 'text', weight = 800) {
  const T = x.getTransform(), sc = Math.hypot(T.a, T.b);
  const mg0 = document.createElement('canvas').getContext('2d'); mg0.font = typeFont(TYPE, role, px * sc, { weight });
  const w = mg0.measureText(str).width / sc, h = px * 1.3;
  const mask = Object.assign(document.createElement('canvas'), { width: Math.ceil(w * sc) + 4, height: Math.ceil(h * sc) + 4 }), mg = mask.getContext('2d');
  mg.font = typeFont(TYPE, role, px * sc, { weight }); mg.textBaseline = 'middle'; mg.textAlign = 'center'; mg.fillStyle = '#000';
  mg.fillText(str, mask.width / 2, mask.height / 2 + px * sc * 0.04);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.drawImage(mask, cx - mask.width / sc / 2, cy - mask.height / sc / 2, mask.width / sc, mask.height / sc); x.restore();
}
function product(x, kind, cx, cy, s) {
  const ink = PALETTE.ink; x.fillStyle = ink; x.strokeStyle = ink;
  if (kind === 0 || kind === 6) {   // a trainer
    x.beginPath(); x.moveTo(cx - 0.2 * s, cy + 0.08 * s); x.lineTo(cx - 0.2 * s, cy - 0.05 * s); x.quadraticCurveTo(cx - 0.14 * s, cy - 0.08 * s, cx - 0.08 * s, cy - 0.06 * s);
    x.lineTo(cx - 0.02 * s, cy - 0.01 * s); x.bezierCurveTo(cx + 0.08 * s, cy + 0.0 * s, cx + 0.2 * s, cy + 0.02 * s, cx + 0.23 * s, cy + 0.07 * s); x.lineTo(cx + 0.23 * s, cy + 0.08 * s); x.closePath(); x.fill();
    x.fillRect(cx - 0.21 * s, cy + 0.08 * s, 0.45 * s, 0.035 * s);
    cut(x, (c) => { for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(cx - 0.06 * s + i * 0.028 * s, cy - 0.035 * s + i * 0.014 * s, 0.007 * s, 0, TAU); c.fill(); }
      c.lineWidth = 0.008 * s; c.beginPath(); c.moveTo(cx - 0.16 * s, cy + 0.05 * s); c.quadraticCurveTo(cx, cy + 0.07 * s, cx + 0.14 * s, cy + 0.03 * s); c.stroke(); c.fillRect(cx - 0.21 * s, cy + 0.098 * s, 0.45 * s, 0.006 * s); });
  } else if (kind === 1) {          // a bottle
    x.fillRect(cx - 0.03 * s, cy - 0.15 * s, 0.06 * s, 0.05 * s); x.fillRect(cx - 0.02 * s, cy - 0.1 * s, 0.04 * s, 0.04 * s);
    x.beginPath(); x.roundRect(cx - 0.075 * s, cy - 0.07 * s, 0.15 * s, 0.21 * s, 0.03 * s); x.fill();
    cut(x, (c) => { c.fillRect(cx - 0.055 * s, cy - 0.0 * s, 0.11 * s, 0.07 * s); c.fillRect(cx - 0.05 * s, cy - 0.055 * s, 0.006 * s, 0.17 * s); });
    x.fillRect(cx - 0.04 * s, cy + 0.02 * s, 0.08 * s, 0.012 * s); x.fillRect(cx - 0.03 * s, cy + 0.042 * s, 0.06 * s, 0.008 * s);
  } else if (kind === 2) {          // a phone
    x.beginPath(); x.roundRect(cx - 0.06 * s, cy - 0.13 * s, 0.12 * s, 0.25 * s, 0.02 * s); x.fill();
    cut(x, (c) => { c.beginPath(); c.roundRect(cx - 0.05 * s, cy - 0.11 * s, 0.1 * s, 0.2 * s, 0.01 * s); c.fill(); });
    x.beginPath(); x.arc(cx, cy - 0.01 * s, 0.03 * s, 0, TAU); x.fill(); x.fillRect(cx - 0.025 * s, cy + 0.04 * s, 0.05 * s, 0.01 * s);
  } else if (kind === 3) {          // headphones
    x.lineWidth = 0.022 * s; x.beginPath(); x.arc(cx, cy, 0.11 * s, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
    for (const d of [-1, 1]) { x.beginPath(); x.roundRect(cx + d * 0.11 * s - 0.03 * s, cy - 0.02 * s, 0.06 * s, 0.11 * s, 0.025 * s); x.fill(); }
    cut(x, (c) => { for (const d of [-1, 1]) { c.beginPath(); c.arc(cx + d * 0.11 * s, cy + 0.035 * s, 0.012 * s, 0, TAU); c.fill(); } });
  } else if (kind === 4) {          // a watch
    x.fillRect(cx - 0.03 * s, cy - 0.17 * s, 0.06 * s, 0.34 * s);
    x.beginPath(); x.arc(cx, cy, 0.075 * s, 0, TAU); x.fill();
    cut(x, (c) => { c.beginPath(); c.arc(cx, cy, 0.06 * s, 0, TAU); c.fill(); for (let i = 0; i < 5; i++) c.fillRect(cx - 0.022 * s, cy - 0.15 * s + i * 0.018 * s, 0.044 * s, 0.005 * s); });
    x.lineWidth = 0.008 * s; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx, cy - 0.045 * s); x.moveTo(cx, cy); x.lineTo(cx + 0.035 * s, cy + 0.01 * s); x.stroke();
  } else {                          // a takeaway cup
    x.beginPath(); x.moveTo(cx - 0.075 * s, cy - 0.1 * s); x.lineTo(cx + 0.075 * s, cy - 0.1 * s); x.lineTo(cx + 0.055 * s, cy + 0.14 * s); x.lineTo(cx - 0.055 * s, cy + 0.14 * s); x.closePath(); x.fill();
    x.fillRect(cx - 0.085 * s, cy - 0.125 * s, 0.17 * s, 0.03 * s);
    cut(x, (c) => { c.fillRect(cx - 0.07 * s, cy - 0.02 * s, 0.14 * s, 0.01 * s); c.fillRect(cx - 0.066 * s, cy + 0.05 * s, 0.132 * s, 0.01 * s); });
  }
}
function advert(x, m, cx, cy, sx) {
  x.save(); x.translate(cx, cy); x.scale(sx, 1);
  x.fillStyle = 'rgba(43,26,18,0.3)'; x.fillRect(-0.56, -0.25, 1.12, 0.5);
  x.fillStyle = 'rgba(43,26,18,0.35)'; x.fillRect(-0.56, -0.25, 1.12, 0.03); x.fillRect(-0.56, 0.22, 1.12, 0.03);
  const r = rng(4200 + m), left = m % 2 === 0;
  product(x, m % 6 === 0 && m ? 6 : m % 6, left ? -0.28 : 0.3, 0.0, 1.25 + r() * 0.2);
  x.fillStyle = PALETTE.ink; x.fillRect(left ? -0.02 : -0.5, -0.17, 0.5, 0.17);
  cutWord(x, AD_WORDS[m % AD_WORDS.length], left ? 0.23 : -0.25, -0.085, 0.12);
  for (let i = 0; i < 2; i++) x.fillRect(left ? -0.02 : -0.5, 0.04 + i * 0.05, 0.3 + r() * 0.18, 0.016);
  x.restore();
}

// ---------------------------------------------------------------- S6: she hums the refrain (45-52.5)""")
# --- S6 and S7: her refrain plate, lit as she hums; the machine raises its stamp over it
rep("""  const lamp = [0.32, 0.18];
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 }], t);
  shadows(cam, lamp);""","""  const lamp = [0.32, 0.18], pl = EASE.out(clamp((t - CUES.s6 - 0.1) / 0.6));
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 }, ...lyricLamps(-0.05, -0.17, 0.5, t, 0.8 * pl)], t);
  shadows(cam, lamp);
  if (pl > 0) puppet(0.8 * (1 - pl), (x) => { lyricPlate(x, -0.05, -0.17, 0.5); rod(x, -0.05, -0.12, 0.02, 0.7, 0.002); }, { alpha: clamp(pl * 1.5) });""")
rep("""  const tl = EASE.out(clamp((t - CUES.title) / 0.6));
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 }, { x: -0.02, y: -0.27, r: 0.42, i: 0.9 * tl, col: '255,200,96', hot: '255,244,205', steady: true }], t);
  shadows(cam, lamp);""","""  const tl = EASE.out(clamp((t - CUES.title) / 0.6));
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 }, ...lyricLamps(-0.05, -0.17, 0.5, t, 0.8), { x: -0.02, y: 0.47, r: 0.35, i: 0.0 * tl }], t);
  shadows(cam, lamp);
  puppet(0.0, (x) => { lyricPlate(x, -0.05, -0.17, 0.5); rod(x, -0.05, -0.12, 0.02, 0.7, 0.002); });""")
rep("const tx = lerp(0.5, -0.04, raise) + lerp(0, 0.66, lower), ty = lerp(0.18, -0.22, raise) + lerp(0, 0.52, lower);","const tx = lerp(0.5, -0.05, raise) + lerp(0, 0.67, lower), ty = lerp(0.18, -0.255, raise) + lerp(0, 0.555, lower);")
# the title: below the window, carved into the dark wall's light (a strip of lit paper under the frame)
rep("""  const pt = pressOn(t, CUES.title);
  if (pt) puppet(pt.depth, (x) => plaque(x, 'REFRAIN', -0.02, -0.27, 0.11, { weight: 600, gold: true, tracking: 0.18 }), { alpha: pt.alpha, noHide: true });
  cast(g);
  room(g, cam, -0.62, -0.42, 1.24, 0.84);
  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);
  warmVignette(g, 0.55);""","""  cast(g);
  room(g, cam, -0.62, -0.42, 1.24, 0.84);
  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);
  warmVignette(g, 0.55);
  if (t > CUES.title) {   // the title on the dark wall under the window, in the lamp's colour
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = EASE.out(clamp((t - CUES.title) / 0.8));
    const px = S.u * 0.05 * cam.z / 0.9; g.font = typeFont(TYPE, 'display', px, { weight: 600 }); g.letterSpacing = `${(px * 0.3).toFixed(1)}px`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f0c470';
    const yy = S.H / 2 + (0.49 - cam.y) * S.u * cam.z; g.fillText('REFRAIN', S.W / 2 + px * 0.15, yy); g.restore();
  }""")
# --- the score, S1: the count finishes at 5.0 on a chord; quiet until the sweep
rep("""  permute(ctx, out, 0.12, 2.5, beat(0.5), 1, 0.3);
  permute(ctx, out, 2.5, 5.0, beat(0.25), 2, 0.28);
  permute(ctx, out, 5.0, CUES.burst - 0.1, beat(0.125), 3, 0.24);
  for (const h of HITS()) tick(ctx, out, h, 0.12);""","""  permute(ctx, out, 0.12, 2.5, beat(0.5), 1, 0.3);
  permute(ctx, out, 2.5, 4.0, beat(0.25), 2, 0.28);
  permute(ctx, out, 4.0, CUES.done - 0.04, beat(0.125), 3, 0.24);
  for (const m of [55, 62, 67, 71, 74]) sample(ctx, out, 'clavi', CUES.done, { note: m, vel: 0.8, gain: 0.3 });
  for (const h of HITS()) tick(ctx, out, h, 0.12);
  cello(ctx, out, CUES.done, CUES.burst, ['G2'], 0.18);""")
open('film.html','w').write(s); print('part 2 ok')

s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:70]); s=s.replace(a,b)
# 1. heads: a curved profile (skull, brow, nose, lips, chin)
rep("""  const head = [[-0.06, -0.05], [-0.07, -0.13], [-0.03, -0.19], [0.03, -0.19], [0.055, -0.14], [0.058, -0.115], [0.078, -0.098], [0.058, -0.085]];
  const m = (p.mouth || 0) * 0.018;
  head.push([0.06, -0.072], [0.052, -0.066 + m * 0.2], [0.064, -0.058 + m], [0.05, -0.035 + m], [0.0, -0.03], [-0.04, -0.035]);
  shape(x, head.map(([a, b]) => [a * k, b * k]), ink);""","""  const m = (p.mouth || 0) * 0.012;
  x.beginPath(); x.moveTo(-0.012 * k, -0.036 * k);
  x.bezierCurveTo(-0.072 * k, -0.05 * k, -0.08 * k, -0.168 * k, -0.012 * k, -0.19 * k);
  x.bezierCurveTo(0.03 * k, -0.198 * k, 0.054 * k, -0.17 * k, 0.055 * k, -0.138 * k);
  x.lineTo(0.06 * k, -0.127 * k); x.quadraticCurveTo(0.057 * k, -0.112 * k, 0.077 * k, -0.097 * k);
  x.lineTo(0.06 * k, -0.086 * k); x.lineTo(0.063 * k, -0.078 * k); x.lineTo(0.054 * k, -0.072 * k + m * 0.3);
  x.lineTo(0.062 * k, -0.066 * k + m); x.quadraticCurveTo(0.061 * k, -0.045 * k + m, 0.034 * k, -0.04 * k + m * 0.5);
  x.quadraticCurveTo(0.012 * k, -0.033 * k, -0.012 * k, -0.036 * k); x.closePath(); x.fillStyle = ink; x.fill();""")
# 2. the woman's jeogori and chima: curves, a white collar band cut through
rep("""      const sk = p.seated ? [[-0.2, 0], [-0.13, -0.22], [0.06, -0.24], [0.2, -0.02], [0.24, 0]] : [[-0.16, 0], [-0.09, -0.46], [0.04, -0.47], [0.13, -0.05], [0.16, 0]];
      shape(x, sk.map(([a, b]) => [a * k, b * k]), dye);
      const top = p.seated ? -0.24 : -0.47;
      shape(x, [[-0.09 * k, top * k], [-0.08 * k, (top - 0.16) * k], [0.05 * k, (top - 0.17) * k], [0.07 * k, top * k]], hide);
      cut(x, (c) => { for (let i = 0; i < 5; i++) { c.beginPath(); c.arc((-0.06 + i * 0.03) * k, (top + 0.03 - i * 0.012) * k, 0.008 * k, 0, Math.PI); c.fill(); } });""","""      const top = p.seated ? -0.24 : -0.47;
      x.beginPath();
      if (p.seated) { x.moveTo(-0.22 * k, 0); x.bezierCurveTo(-0.2 * k, -0.12 * k, -0.12 * k, -0.2 * k, -0.07 * k, top * k); x.lineTo(0.05 * k, top * k); x.bezierCurveTo(0.12 * k, -0.16 * k, 0.24 * k, -0.08 * k, 0.27 * k, 0); }
      else { x.moveTo(-0.17 * k, 0); x.bezierCurveTo(-0.15 * k, -0.2 * k, -0.1 * k, -0.38 * k, -0.075 * k, top * k); x.lineTo(0.045 * k, top * k); x.bezierCurveTo(0.08 * k, -0.36 * k, 0.15 * k, -0.18 * k, 0.17 * k, 0); }
      x.closePath(); x.fillStyle = dye; x.fill();
      cut(x, (c) => { for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo((-0.13 + i * 0.07) * k, -0.004 * k); c.quadraticCurveTo((-0.09 + i * 0.06) * k, (top * 0.5) * k, (-0.05 + i * 0.03) * k, (top + 0.04) * k); c.lineWidth = 0.004 * k; c.stroke(); } });
      x.beginPath(); x.moveTo(-0.085 * k, top * k); x.quadraticCurveTo(-0.09 * k, (top - 0.1) * k, -0.05 * k, (top - 0.165) * k);
      x.lineTo(0.03 * k, (top - 0.17) * k); x.quadraticCurveTo(0.075 * k, (top - 0.08) * k, 0.07 * k, top * k); x.closePath(); x.fillStyle = hide; x.fill();
      cut(x, (c) => { c.lineWidth = 0.009 * k; c.beginPath(); c.moveTo(-0.03 * k, (top - 0.165) * k); c.lineTo(0.035 * k, (top - 0.07) * k); c.stroke(); });   // the white collar band (dongjeong)
      x.fillStyle = dye; x.fillRect(0.02 * k, (top - 0.06) * k, 0.012 * k, 0.09 * k);   // the coat string (goreum)""")
# 3. S1: a bigger counter
rep("plaque(x, n, -0.42, -0.24, 0.13, { weight: 600, gold: t > CUES.burst - 0.25 })","plaque(x, n, -0.36, -0.2, 0.2, { weight: 600, gold: t > CUES.burst - 0.25 })")
rep("plaque(x, 'versions of one advert', -0.42, -0.08, 0.05, { weight: 600 })","plaque(x, 'versions of one advert', -0.36, 0.02, 0.062, { weight: 600 })")
# 4. plaque: tracking set before measuring
rep("""  x.textAlign = 'center'; x.textBaseline = 'middle';
  const w = x.measureText(str).width + px * 1.1, h = px * 1.45;""","""  x.textAlign = 'center'; x.textBaseline = 'middle';
  if (o.tracking) x.letterSpacing = `${(o.tracking * px).toFixed(2)}px`;
  const w = x.measureText(str).width + px * 1.1, h = px * 1.45;""")
rep("""  if (o.tracking) x.letterSpacing = `${(o.tracking * px).toFixed(4)}px`;
  x.fillText(str, cx, cy + px * 0.04);""","""  x.fillText(str, cx + (o.tracking ? o.tracking * px / 2 : 0), cy + px * 0.04);""")
# 5. S3: bigger singers, plates close above-right
rep("puppet(0.0, (x) => singer(x, s.kind, s.x - 0.1, 0.4, 0.62, {","puppet(0.0, (x) => singer(x, s.kind, s.x - 0.12, 0.4, 0.78, {")
rep("""      plate(x, s.x + 0.27, -0.33, 0.36, verseNotes(s.salt), PALETTE.ink);
      plate(x, s.x + 0.27, -0.17, 0.36, REFRAIN_NOTES, PALETTE.gold);
      rod(x, s.x + 0.27, -0.12, s.x + 0.3, 0.7, 0.002);""","""      plate(x, s.x + 0.3, -0.36, 0.34, verseNotes(s.salt), PALETTE.ink);
      plate(x, s.x + 0.3, -0.21, 0.34, REFRAIN_NOTES, PALETTE.gold);
      rod(x, s.x + 0.3, -0.16, s.x + 0.33, 0.7, 0.002);""")
rep("const cam = { x: lerp(tx, SINGERS[4].x + 0.27, pushK), y: lerp(0.02, -0.17, pushK), z: lerp(0.95, 2.6, pushK) };","const cam = { x: lerp(tx, SINGERS[4].x + 0.3, pushK), y: lerp(0.02, -0.21, pushK), z: lerp(0.95, 2.6, pushK) };")
# 6. S4: trails read as trails (a faint dotted path, more slips)
rep("      const n = 7, speed = 0.32;","""      x.save(); x.globalAlpha = 0.35 * (1 - conv); x.fillStyle = PALETTE.ink;
      for (let d = 0; d < 1; d += 0.035) { const [dx, dy] = pt(d); x.fillRect(dx - 0.002, dy - 0.002, 0.004, 0.004); }
      x.restore();
      const n = 11, speed = 0.3;""")
# 7. S7: the stamp held clear above her head, then lowered to the machine's side
rep("const tx = lerp(0.5, -0.04, raise) + lerp(0, 0.3, lower), ty = lerp(0.18, -0.17, raise) + lerp(0, 0.38, lower);","const tx = lerp(0.5, -0.04, raise) + lerp(0, 0.66, lower), ty = lerp(0.18, -0.22, raise) + lerp(0, 0.52, lower);")
open('film.html','w').write(s)
print('ok')

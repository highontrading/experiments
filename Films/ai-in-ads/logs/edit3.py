s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:70]); s=s.replace(a,b)
# carved letters: cut from a mask the size of the plaque (the light comes through; contrast measured on the frame)
rep("""  x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
  x.fillText(str, cx + (o.tracking ? o.tracking * px / 2 : 0), cy + px * 0.04);
  x.globalCompositeOperation = 'source-over';""","""  const T = x.getTransform(), sc = Math.hypot(T.a, T.b), mw = Math.max(2, Math.ceil(w * sc)), mh = Math.max(2, Math.ceil(h * sc));
  const mask = Object.assign(document.createElement('canvas'), { width: mw, height: mh }), mg = mask.getContext('2d');
  mg.font = typeFont(TYPE, o.role || 'display', px * sc, { weight: o.weight ?? 600 }); mg.textAlign = 'center'; mg.textBaseline = 'middle';
  if (o.tracking) mg.letterSpacing = `${(o.tracking * px * sc).toFixed(2)}px`;
  mg.fillStyle = '#000'; mg.fillText(str, mw / 2 + (o.tracking ? o.tracking * px * sc / 2 : 0), mh / 2 + px * 0.04 * sc);
  x.globalCompositeOperation = 'destination-out'; x.drawImage(mask, cx - w / 2, cy - h / 2, w, h);
  x.globalCompositeOperation = 'source-over';""")
rep("const px = S.u * 0.038; g.font = typeFont(TYPE, 'text', px, { weight: 500 });","const px = S.u * 0.052; g.font = typeFont(TYPE, 'text', px, { weight: 500 });")
# S3: the singers walk in procession, lift their heads on the refrain, the refrain plate lights note by note
rep("""  for (const s of SINGERS) lamps.push({ x: s.x + 0.3, y: -0.21, r: 0.26, i: 0.85 + 0.4 * pushK, col: '255,196,80', hot: '255,240,190', steady: true });   // the refrain is lit""","""  const walk = 0.3 * lt / 15, rf = refrainGlow(t);
  for (const s of SINGERS) {
    lamps.push({ x: s.x + 0.3 + walk, y: -0.21, r: 0.26, i: 0.85 + 0.4 * pushK, col: '255,196,80', hot: '255,240,190', steady: true });   // the refrain is lit
    if (Math.abs(s.x - cam.x) > 1.6) continue;
    for (const [i, gl] of rf.entries()) if (gl > 0.04) { const [hx, hy] = plateHole(s.x + 0.3 + walk, -0.21, 0.34, i, REFRAIN_NOTES); lamps.push({ x: hx, y: hy, r: 0.05, i: 1.4 * gl, col: '255,214,120', hot: '255,248,220', steady: true }); }
  }""")
rep("""    const ph = (t * BPM / 60) / 3;   // one sway per bar
    const mouth = 0.5 + 0.5 * Math.sin(t * 7.5 + n);
    puppet(0.0, (x) => singer(x, s.kind, s.x - 0.12, 0.4, 0.78, { t, mouth: mouth * 0.9, nod: -0.08 + 0.05 * Math.sin(ph * TAU + n), armLift: 0.35 + 0.08 * Math.sin(ph * TAU) }));""","""    const ph = (t * BPM / 60) / 3;   // one sway per bar
    const mouth = 0.5 + 0.5 * Math.sin(t * 7.5 + n), up = Math.max(...rf) > 0.2 ? 1 : 0;
    const step = t * TAU * 0.9 + n, bob = -0.007 * Math.abs(Math.sin(step));
    const lift = EASE.inOut(clamp(refrainOn(t)));
    puppet(0.0, (x) => singer(x, s.kind, s.x - 0.12 + walk, 0.4 + bob, 0.78, { t, mouth: mouth * 0.9, nod: lerp(0.06, -0.2, lift) + 0.04 * Math.sin(ph * TAU + n), armLift: lerp(0.2, 0.55, lift) + 0.06 * Math.sin(step) }));""")
rep("""      plate(x, s.x + 0.3, -0.36, 0.34, verseNotes(s.salt), PALETTE.ink);
      plate(x, s.x + 0.3, -0.21, 0.34, REFRAIN_NOTES, PALETTE.gold);
      rod(x, s.x + 0.3, -0.16, s.x + 0.33, 0.7, 0.002);""","""      plate(x, s.x + 0.3 + walk, -0.36, 0.34, verseNotes(s.salt), PALETTE.ink);
      plate(x, s.x + 0.3 + walk, -0.21, 0.34, REFRAIN_NOTES, PALETTE.gold);
      rod(x, s.x + 0.3 + walk, -0.16, s.x + 0.33 + walk, 0.7, 0.002);""")
# helpers: where each note hole sits, and how bright it is when its note sounds
rep("function verseNotes(salt, n = 13)","""function plateHole(cx, cy, w, i, notes) { const h = w * 0.3; return [cx - w * 0.38 + w * 0.76 * i / (notes.length - 1), cy + h * 0.3 - (notes[i] - 72) / 14 * h * 0.62]; }
function refrainTimes() { return [CUES.burst, CUES.refrain2, CUES.s6]; }
function refrainGlow(t) {
  return REFRAIN_NOTES.map((_, i) => Math.max(0, ...refrainTimes().map((t0) => { const at = t0 + beat(R[i][0]); return t >= at ? Math.exp(-(t - at) * 3.2) : 0; })));
}
function refrainOn(t) { return Math.max(...refrainTimes().map((t0) => clamp((t - t0) / 0.6) * clamp((t0 + beat(10.5) - t) / 0.8))); }
function verseNotes(salt, n = 13)""")
open('film.html','w').write(s); print('ok')

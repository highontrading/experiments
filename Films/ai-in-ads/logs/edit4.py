s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
# --- type: the Hangul refrain (Noto Serif KR, OFL, a subset of the ten syllables)
rep("    mono: null,\n  },","    mono: { family: 'Noto Serif KR Arirang', files: { 700: 'fonts/NotoSerifKR-arirang.ttf' } },   // the refrain's Hangul only\n  },")
rep("text: ['Arirang · Korean folk song'] },","text: ['Korean folk song'], mono: ['아리랑 아리랑 아라리요'] },")
# --- cues and narration
rep("s1: 0, burst: bar3(3),","s1: 0, done: 5.0, sweep: 7.0, burst: bar3(3),")
rep("title: 58.0, end: DURATION,","title: 59.3, end: DURATION,")
rep("{ id: 'VO1', at: 4.7, dur: 2.52 },","{ id: 'VO1', at: 5.3, dur: 2.52 },")
rep("{ id: 'VO2', at: 9.2, dur: 2.86 },","{ id: 'VO2', at: 9.0, dur: 3.41 },")
rep("{ id: 'VO8', at: 38.4, dur: 3.33 },","{ id: 'VO8', at: 38.3, dur: 2.86 },")
# --- S1: the count lands at 5.0 and holds gold; the arm rests, then sweeps the stack off the desk
rep("""  const out = []; let t = 0.12, gap = beat(1);
  while (t < CUES.burst - 0.08) { out.push(t); t += gap; gap = Math.max(0.055, gap * (t < 2.5 ? 1 : 0.86)); }
  return out;""","""  const out = []; let t = 0.12, gap = beat(1);
  while (t < CUES.done - 0.07) { out.push(t); t += gap; gap = Math.max(0.05, gap * (t < 2.5 ? 1 : 0.78)); }
  out.push(CUES.done); return out;""")
rep("""  const h = HITS(), i = lastHit(t);
  if (i < 0) return 0.16 * (1 - EASE.in(clamp(t / 0.12)));""","""  const h = HITS(), i = lastHit(t);
  if (i < 0) return 0.16 * (1 - EASE.in(clamp(t / 0.12)));
  if (i === h.length - 1) return 0.07 * EASE.out(clamp((t - CUES.done) / 0.7)) - 0.05 * EASE.in(clamp((t - CUES.sweep) / 0.3));""")
rep("""  const deskY = 0.33, tx = 0.32, lift = stampPose(t);""","""  const deskY = 0.33, sweep = EASE.in(clamp((t - CUES.sweep) / 0.42)), tx = 0.32 - 0.8 * sweep, lift = stampPose(t);""")
rep("""    for (let j = 0; j < 6; j++) x.fillRect(tx - 0.11 + (j % 2) * 0.004, deskY - 0.012 - j * 0.006, 0.22, 0.004);
  });""","""    if (t < CUES.sweep + 0.12) for (let j = 0; j < 6; j++) x.fillRect(0.21 + (j % 2) * 0.004, deskY - 0.012 - j * 0.006, 0.22, 0.004);
  });
  if (t > CUES.sweep + 0.12) puppet(0.1, (x) => {          // the stack, swept off: slips fly left
    const a = t - CUES.sweep - 0.12;
    for (let j = 0; j < 40; j++) { const r = rng(7000 + j); slip(x, 0.3 - (0.9 + r() * 1.4) * a, deskY - 0.03 - (0.2 + r() * 0.8) * a + 0.3 * a * a, 0.08, a * (r() - 0.5) * 12, 7100 + j, 0.95); }
  });""")
rep("  const fast = i >= 0 && (h[i + 1] ?? 99) - h[i] < 0.16;","  const fast = i >= 0 && i < h.length - 1 && (h[i + 1] ?? 99) - h[i] < 0.16;")
rep("gold: t > CUES.burst - 0.25 })","gold: t >= CUES.done })")
rep("""  room(g, cam, -2.5, -0.48, 5, 0.96);
  lattice(g, cam, -2.5, -0.48, 5, 0.96, { cw: 0.21, ch: 0.24, bar: 0.009, frame: 0.0 });
  warmVignette(g, 0.5);""","""  warmVignette(g, 0.5);   // the machine's wall has no lattice: only homes have windows""")
rep("flash(g, S, i >= 0 && h[i] > CUES.burst - 0.2 ? 0.12 * Math.exp(-since * 10) : 0);","flash(g, S, i === h.length - 1 ? 0.14 * Math.exp(-since * 9) : 0);")
# --- S2: the first singer presses onto the paper before the song's cut
rep("""  cast(g);
  room(g, cam, -0.62, -0.42, 1.24, 0.84);
  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);
  warmVignette(g, 0.55);
}

// ---------------------------------------------------------------- S3""","""  if (t > 10.7) { const e = EASE.out(clamp((t - 10.7) / 1.5)); puppet(0.85 * (1 - e), (x) => singer(x, 'scholar', -0.22, 0.4, 0.78, { t, mouth: 0.15, nod: 0.06 }), { alpha: clamp(e * 1.6) }); }
  cast(g);
  room(g, cam, -0.62, -0.42, 1.24, 0.84);
  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);
  warmVignette(g, 0.55);
}

// ---------------------------------------------------------------- S3""")
# --- the refrain plate: the Hangul lyric, the same for everyone, lit syllable by syllable
rep("function plateHole(cx, cy, w, i, notes)","""const LYRIC = ['아', '리', '랑', ' ', '아', '리', '랑', ' ', '아', '라', '리', '요'];
const SYL_NOTE = [0, 1, 2, 4, 5, 6, 8, 9, 10, 11];          // the note each syllable is sung on
function lyricSlots(cx, cy, w) { const out = []; LYRIC.forEach((c, i) => { if (c !== ' ') out.push([cx - w * 0.41 + w * 0.82 * (i + 0.5) / LYRIC.length, cy]); }); return out; }
function sylGlow(t) { const g = refrainGlow(t); return SYL_NOTE.map((n) => g[n]); }
function lyricLamps(cx, cy, w, t, base = 0.9) {
  const L = [{ x: cx, y: cy, r: w * 0.62, i: base, col: '255,196,80', hot: '255,240,190', steady: true }];
  sylGlow(t).forEach((gl, i) => { if (gl > 0.04) { const [sx, sy] = lyricSlots(cx, cy, w)[i]; L.push({ x: sx, y: sy, r: w * 0.09, i: 1.5 * gl, col: '255,214,120', hot: '255,250,226', steady: true }); } });
  return L;
}
function lyricPlate(x, cx, cy, w) {
  const h = w * 0.22;
  shape(x, [[cx - w / 2 + h * 0.3, cy - h / 2], [cx + w / 2 - h * 0.3, cy - h / 2], [cx + w / 2, cy], [cx + w / 2 - h * 0.3, cy + h / 2], [cx - w / 2 + h * 0.3, cy + h / 2], [cx - w / 2, cy]], PALETTE.gold);
  x.strokeStyle = PALETTE.ink; x.lineWidth = w * 0.01; x.stroke();
  const T = x.getTransform(), sc = Math.hypot(T.a, T.b), gs = w * 0.82 / LYRIC.length * 1.02, px = Math.max(6, Math.round(gs * sc));
  const mask = Object.assign(document.createElement('canvas'), { width: Math.ceil(px * 1.5), height: Math.ceil(px * 1.5) }), mg = mask.getContext('2d');
  mg.font = typeFont(TYPE, 'mono', px, { weight: 700 }); mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillStyle = '#000';
  x.save(); x.globalCompositeOperation = 'destination-out';
  let k = 0;
  for (const c of LYRIC) { if (c === ' ') continue; const [sx, sy] = lyricSlots(cx, cy, w)[k++];
    mg.clearRect(0, 0, mask.width, mask.height); mg.fillText(c, mask.width / 2, mask.height / 2 + px * 0.04);
    x.drawImage(mask, sx - gs * 0.75, sy - gs * 0.75, gs * 1.5, gs * 1.5); }
  x.restore();
}
function plateHole(cx, cy, w, i, notes)""")
rep("""    if (Math.abs(s.x - cam.x) > 1.6) continue;
    for (const [i, gl] of rf.entries()) if (gl > 0.04) { const [hx, hy] = plateHole(s.x + 0.3 + walk, -0.21, 0.34, i, REFRAIN_NOTES); lamps.push({ x: hx, y: hy, r: 0.05, i: 1.4 * gl, col: '255,214,120', hot: '255,248,220', steady: true }); }""","""    if (Math.abs(s.x - cam.x) > 1.6) continue;
    lamps.push(...lyricLamps(s.x + 0.33 + walk, -0.21, 0.5, t, 0).slice(1));""")
rep("    lamps.push({ x: s.x + 0.3 + walk, y: -0.21, r: 0.26, i: 0.85 + 0.4 * pushK, col: '255,196,80', hot: '255,240,190', steady: true });   // the refrain is lit","    lamps.push({ x: s.x + 0.33 + walk, y: -0.21, r: 0.32, i: 0.85 + 0.4 * pushK, col: '255,196,80', hot: '255,240,190', steady: true });   // the refrain is lit")
rep("""      plate(x, s.x + 0.3 + walk, -0.36, 0.34, verseNotes(s.salt), PALETTE.ink);
      plate(x, s.x + 0.3 + walk, -0.21, 0.34, REFRAIN_NOTES, PALETTE.gold);
      rod(x, s.x + 0.3 + walk, -0.16, s.x + 0.33 + walk, 0.7, 0.002);""","""      plate(x, s.x + 0.33 + walk, -0.35, 0.5, verseNotes(s.salt, 17), PALETTE.ink);
      lyricPlate(x, s.x + 0.33 + walk, -0.21, 0.5);
      rod(x, s.x + 0.33 + walk, -0.16, s.x + 0.36 + walk, 0.7, 0.002);""")
rep("const cam = { x: lerp(tx, SINGERS[4].x + 0.3, pushK), y: lerp(0.02, -0.21, pushK), z: lerp(0.95, 2.6, pushK) };","const cam = { x: lerp(tx, SINGERS[4].x + 0.33 + 0.3, pushK), y: lerp(0.02, -0.21, pushK), z: lerp(0.95, 2.4, pushK) };")
rep("lowerThird(g, 'Arirang · Korean folk song', clamp((t - 13.0) / 0.4) * clamp((17.0 - t) / 0.4));","lowerThird(g, 'Arirang', 'Korean folk song', clamp((t - 13.0) / 0.4) * clamp((17.0 - t) / 0.4));")
rep("""function lowerThird(g, str, a) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  const px = S.u * 0.052; g.font = typeFont(TYPE, 'text', px, { weight: 500 }); g.textBaseline = 'middle';
  const w = g.measureText(str).width, x0 = S.W * 0.07, y0 = S.H * 0.84;
  g.fillStyle = 'rgba(24,14,8,0.86)'; g.fillRect(x0 - px * 0.7, y0 - px * 0.95, w + px * 1.4, px * 1.9);
  g.fillStyle = PALETTE.gold; g.fillRect(x0 - px * 0.7, y0 - px * 0.95, px * 0.12, px * 1.9);
  g.fillStyle = '#f2e2bf'; g.fillText(str, x0, y0 + px * 0.04);
  g.restore();
}""","""function lowerThird(g, name, sub, a) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  const px = S.u * 0.072, ps = S.u * 0.04, x0 = S.W * 0.07, y0 = S.H * 0.8;
  g.font = typeFont(TYPE, 'display', px, { weight: 600 }); const w1 = g.measureText(name).width;
  g.font = typeFont(TYPE, 'text', ps, { weight: 500 }); const w2 = g.measureText(sub).width, w = Math.max(w1, w2);
  g.fillStyle = 'rgba(24,14,8,0.88)'; g.fillRect(x0 - px * 0.5, y0 - px * 0.95, w + px, px * 1.05 + ps * 1.9);
  g.fillStyle = PALETTE.gold; g.fillRect(x0 - px * 0.5, y0 - px * 0.95, px * 0.08, px * 1.05 + ps * 1.9);
  g.textBaseline = 'alphabetic';
  g.font = typeFont(TYPE, 'display', px, { weight: 600 }); g.fillStyle = '#f2e2bf'; g.fillText(name, x0, y0);
  g.font = typeFont(TYPE, 'text', ps, { weight: 500 }); g.fillStyle = '#e8c890'; g.fillText(sub, x0, y0 + ps * 1.45);
  g.restore();
}""")
open('film.html','w').write(s); print('part 1 ok')

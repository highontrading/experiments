s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
# lattice: framed open panels (holes) where a plate sits, so no bar ever crosses its words
rep("""  for (let i = 1; i < cols; i++) g.fillRect(x0 + i * w / cols - bar / 2, y0, bar, h);
  for (let j = 1; j < rows; j++) g.fillRect(x0, y0 + j * h / rows - bar / 2, w, bar);""","""  const holes = o.holes || [];
  const spans = (a, b, cuts) => { let seg = [[a, b]]; for (const [c0, c1] of cuts) seg = seg.flatMap(([p, q]) => (c1 <= p || c0 >= q ? [[p, q]] : [[p, c0], [c1, q]].filter(([u, v]) => v - u > 1e-4))); return seg; };
  for (let i = 1; i < cols; i++) { const bx = x0 + i * w / cols; for (const [p, q] of spans(y0, y0 + h, holes.filter((H) => bx > H[0] - bar && bx < H[2] + bar).map((H) => [H[1], H[3]]))) g.fillRect(bx - bar / 2, p, bar, q - p); }
  for (let j = 1; j < rows; j++) { const by = y0 + j * h / rows; for (const [p, q] of spans(x0, x0 + w, holes.filter((H) => by > H[1] - bar && by < H[3] + bar).map((H) => [H[0], H[2]]))) g.fillRect(p, by - bar / 2, q - p, bar); }
  for (const [a, b, c, d] of holes) { g.fillRect(a - bar, b - bar, c - a + 2 * bar, bar); g.fillRect(a - bar, d, c - a + 2 * bar, bar); g.fillRect(a - bar, b, bar, d - b); g.fillRect(c, b, bar, d - b); }""")
# deeper gold dye: the lit letters stand out of the plate
rep("""  shape(x, [[cx - w / 2 + h * 0.3, cy - h / 2], [cx + w / 2 - h * 0.3, cy - h / 2], [cx + w / 2, cy], [cx + w / 2 - h * 0.3, cy + h / 2], [cx - w / 2 + h * 0.3, cy + h / 2], [cx - w / 2, cy]], PALETTE.gold);
  x.strokeStyle = PALETTE.ink; x.lineWidth = w * 0.01; x.stroke();""","""  shape(x, [[cx - w / 2 + h * 0.3, cy - h / 2], [cx + w / 2 - h * 0.3, cy - h / 2], [cx + w / 2, cy], [cx + w / 2 - h * 0.3, cy + h / 2], [cx - w / 2 + h * 0.3, cy + h / 2], [cx - w / 2, cy]], '#a86c16');
  x.strokeStyle = PALETTE.ink; x.lineWidth = w * 0.014; x.stroke();""")
# S3: plates fixed on the paper in open panels; singers pass under them; far plates lift off the paper
rep("const walk = 0.3 * lt / 15, rf = refrainGlow(t);","const walk = 0.12 * lt / 15, rf = refrainGlow(t), PX = (s) => s.x + 0.44, RY = -0.115, VY = -0.345;\n  const away = (s) => clamp((Math.abs(PX(s) - cam.x) - 0.42 / cam.z) / (0.36 / cam.z));")
rep("""    lamps.push({ x: s.x + 0.36 + walk, y: -0.2, r: 0.38, i: 0.85 + 0.4 * pushK, col: '255,196,80', hot: '255,240,190', steady: true });   // the refrain is lit""","""    lamps.push({ x: PX(s), y: RY, r: 0.38, i: (0.85 + 0.4 * pushK) * (1 - 0.6 * away(s)), col: '255,196,80', hot: '255,240,190', steady: true });   // the refrain is lit""")
rep("    lamps.push(...lyricLamps(s.x + 0.36 + walk, -0.2, 0.62, t, 0).slice(1));","    lamps.push(...lyricLamps(PX(s), RY, 0.62, t, 0).slice(1).map((L) => ({ ...L, i: L.i * (1 - away(s)) })));")
rep("    if (vk > 0) lamps.push({ x: s.x + 0.33 + walk, y: -0.35, r: 0.3, i: 0.7 * vk, steady: true });","    if (vk > 0) lamps.push({ x: PX(s), y: VY, r: 0.3, i: 0.7 * vk, steady: true });")
rep("""    puppet(0.0, (x) => {
      plate(x, s.x + 0.33 + walk, -0.35, 0.5, verseNotes(s.salt, 17), PALETTE.ink);
      lyricPlate(x, s.x + 0.36 + walk, -0.2, 0.62);
      rod(x, s.x + 0.33 + walk, -0.16, s.x + 0.36 + walk, 0.7, 0.002);
    });""","""    const aw = away(s);
    if (aw < 0.999) puppet(0.8 * aw, (x) => {
      plate(x, PX(s), VY, 0.56, verseNotes(s.salt, 17), PALETTE.ink);
      lyricPlate(x, PX(s), RY, 0.62);
    }, { alpha: 1 - aw });""")
rep("const cam = { x: lerp(tx, SINGERS[4].x + 0.36 + 0.3 * lt / 15, pushK), y: lerp(0.02, -0.25, pushK), z: lerp(0.95, 1.75, pushK) };",
    "const cam = { x: lerp(tx, SINGERS[4].x + 0.36, pushK), y: lerp(0.02, -0.17, pushK), z: lerp(0.95, 1.75, pushK) };")
rep("  lattice(g, cam, -0.75, -0.46, 7.25, 0.92, { cw: 0.13, ch: 0.23 });\n  for (let n = 0; n <= 5; n++) { g.save(); view(g, cam); g.fillStyle = '#24150d'; g.fillRect(-0.75 + n * 1.25 - 0.03, -0.5, 0.06, 1.0); g.restore(); }   // posts between panels",
    "  lattice(g, cam, -0.75, -0.46, 7.25, 0.92, { cw: 0.13, ch: 0.23, holes: SINGERS.map((s) => [PX(s) - 0.33, -0.43, PX(s) + 0.33, -0.035]) });")
# S6/S7: her refrain in an open panel, the title in another; she is a little smaller so her head clears it
for a,b in [("...lyricLamps(-0.06, -0.165, 0.8, t, 0.8 * pl)]","...lyricLamps(-0.06, -0.13, 0.74, t, 0.8 * pl)]"),
            ("...lyricLamps(-0.06, -0.165, 0.8, t, 0.8 + 0.3 * Math.exp(-(((t - 58.2) / 0.5) ** 2))), { x: -0.06, y: -0.335,","...lyricLamps(-0.06, -0.13, 0.74, t, 0.8 + 0.3 * Math.exp(-(((t - 58.2) / 0.5) ** 2))), { x: -0.06, y: -0.335,")]:
    rep(a,b)
rep("lyricPlate(x, -0.06, -0.165, 0.8); rod(x, -0.06, -0.08, 0.02, 0.7, 0.002); }","lyricPlate(x, -0.06, -0.13, 0.74); }",2)
W0="puppet(0.0, (x) => singer(x, 'woman', -0.12, 0.36, 0.7, { t, seated: true, mouth: hum, nod: -0.12 + 0.06 * Math.sin(ph * TAU), armLift: 0.1, tremor: 0.7 }));"
assert s.count(W0)==2
k=s.index("function machineListens"); j=s.index(W0,k)
s=s[:j]+"puppet(0.0, (x) => singer(x, 'woman', -0.12, 0.36, 0.6, { t, seated: true, mouth: hum, nod: -0.12 + 0.06 * Math.sin(ph * TAU) - 0.12 * EASE.inOut(clamp((t - CUES.title) / 1.2)), armLift: 0.1, tremor: 0.7 }));"+s[j+len(W0):]
s=s.replace(W0,W0.replace("0.36, 0.7,","0.36, 0.6,"))
rep("  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);\n  warmVignette(g, 0.55);\n}\n\n// ---------------------------------------------------------------- S7",
    "  lattice(g, cam, -0.62, -0.42, 1.24, 0.84, { holes: [[-0.45, -0.225, 0.33, -0.035]] });\n  warmVignette(g, 0.55);\n}\n\n// ---------------------------------------------------------------- S7")
rep("  lattice(g, cam, -0.62, -0.42, 1.24, 0.84);\n  warmVignette(g, 0.55);\n  // (the title",
    "  lattice(g, cam, -0.62, -0.42, 1.24, 0.84, { holes: [[-0.45, -0.225, 0.33, -0.035], [-0.3, -0.395, 0.18, -0.275]] });\n  warmVignette(g, 0.55);\n  // (the title")
rep("ty = lerp(0.18, -0.295, raise) + lerp(0, 0.595, lower);","ty = lerp(0.18, -0.255, raise) + lerp(0, 0.555, lower);")
# S1: the words under the counter, larger
rep("plaque(x, 'versions of one advert', -0.24, 0.02, 0.062,","plaque(x, 'versions of one advert', -0.22, 0.03, 0.078,")
open('film.html','w').write(s); print('ok')

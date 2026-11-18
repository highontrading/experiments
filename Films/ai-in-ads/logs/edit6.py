s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
# red: the push-in ends centred on the girl's refrain plate, inside a longer screen
rep("const cam = { x: lerp(tx, SINGERS[4].x + 0.33 + 0.3, pushK), y: lerp(0.02, -0.21, pushK), z: lerp(0.95, 1.85, pushK) };",
    "const cam = { x: lerp(tx, SINGERS[4].x + 0.33 + 0.3 * lt / 15, pushK), y: lerp(0.02, -0.25, pushK), z: lerp(0.95, 1.75, pushK) };")
rep("  lattice(g, cam, -0.75, -0.46, 6.5, 0.92, { cw: 0.13, ch: 0.23 });\n  for (let n = 0; n <= 5; n++)","  lattice(g, cam, -0.75, -0.46, 7.25, 0.92, { cw: 0.13, ch: 0.23 });\n  for (let n = 0; n <= 5; n++)")
rep("  room(g, cam, -0.75, -0.46, 6.5, 0.92);","  room(g, cam, -0.75, -0.46, 7.25, 0.92);")
# the singer in view lights her verse while the verses play
rep("    lamps.push(...lyricLamps(s.x + 0.33 + walk, -0.21, 0.5, t, 0).slice(1));","""    lamps.push(...lyricLamps(s.x + 0.33 + walk, -0.21, 0.5, t, 0).slice(1));
    const vk = clamp((t - CUES.verse1) / 0.3) * clamp((CUES.refrain2 - t) / 0.3) * Math.max(0, 1 - Math.abs(s.x + 0.2 - cam.x) / 0.7);
    if (vk > 0) lamps.push({ x: s.x + 0.33 + walk, y: -0.35, r: 0.3, i: 0.7 * vk, steady: true });""")
# lower third: a larger second line
rep("const px = S.u * 0.072, ps = S.u * 0.04, x0 = S.W * 0.07, y0 = S.H * 0.8;","const px = S.u * 0.08, ps = S.u * 0.052, x0 = S.W * 0.07, y0 = S.H * 0.78;")
# S1: the machine lower in the frame (its head inside)
rep("  const sx = 0.78, sy = -0.12;","  const sx = 0.78, sy = 0.0;")
# S4: the winner grows into the advert the billboard will hold
rep("""    const w = clamp((t - CUES.converge - 1.5) / 2.0);
    if (w > 0) slip(x, 0, -0.58 + 0.0 * w, lerp(0.03, 0.2, EASE.out(w)), 0.02 * Math.sin(t * 2), 7777, 1);""","""    const w = EASE.inOut(clamp((t - CUES.converge - 0.8) / 3.4));
    if (w > 0) { x.save(); x.translate(0, lerp(-0.58, -0.02, w)); const sc = lerp(0.05, 0.62, w); x.scale(sc, sc); advert(x, 0, 0, 0, 1); x.restore(); }""")
# S5: the poster beneath goes quicker (no ghosted words)
rep("const press = clamp(a / 0.35), gone = m < n ? clamp((t - at(n)) / 0.45) : 0;","const press = clamp(a / 0.3), gone = m < n ? clamp((t - at(n)) / 0.18) : 0;")
# S6/S7: her refrain plate, larger
for old,new in [("...lyricLamps(-0.05, -0.17, 0.5, t, 0.8 * pl)]","...lyricLamps(-0.06, -0.165, 0.8, t, 0.8 * pl)]"),
                ("...lyricLamps(-0.05, -0.17, 0.5, t, 0.8),","...lyricLamps(-0.06, -0.165, 0.8, t, 0.8),")]:
    rep(old,new)
rep("lyricPlate(x, -0.05, -0.17, 0.5); rod(x, -0.05, -0.12, 0.02, 0.7, 0.002); }",
    "lyricPlate(x, -0.06, -0.165, 0.8); rod(x, -0.06, -0.08, 0.02, 0.7, 0.002); }", 2)
rep("const tx = lerp(0.5, -0.05, raise) + lerp(0, 0.67, lower), ty = lerp(0.18, -0.255, raise) + lerp(0, 0.555, lower);",
    "const tx = lerp(0.5, -0.06, raise) + lerp(0, 0.68, lower), ty = lerp(0.18, -0.265, raise) + lerp(0, 0.565, lower);")
open('film.html','w').write(s); print('ok')

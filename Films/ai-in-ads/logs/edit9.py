s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
# S7: the stamp travels above her refrain, then leaves to the right before it drops
rep("const tx = lerp(0.5, -0.06, raise) + lerp(0, 0.68, lower), ty = lerp(0.18, -0.255, raise) + lerp(0, 0.555, lower);",
    "const tx = lerp(0.56, -0.06, raise) + lerp(0, 0.7, Math.sqrt(lower)), ty = lerp(-0.29, -0.262, raise) + lerp(0, 0.6, lower * lower);")
# S1: margins: the counter group inward, the machine inward
rep("plaque(x, n, -0.24, -0.2, 0.2,","plaque(x, n, -0.13, -0.17, 0.19,")
rep("plaque(x, 'versions of one advert', -0.22, 0.03, 0.078,","plaque(x, 'versions of one advert', -0.13, 0.04, 0.07,")
rep("  const sx = 0.78, sy = 0.0;","  const sx = 0.71, sy = 0.03;")
rep("const deskY = 0.33, sweep = EASE.in(clamp((t - CUES.sweep) / 0.42)), tx = 0.32 - 0.8 * sweep, lift = stampPose(t);",
    "const deskY = 0.33, sweep = EASE.in(clamp((t - CUES.sweep) / 0.42)), tx = 0.37 - 0.85 * sweep, lift = stampPose(t);")
rep("for (let j = 0; j < 6; j++) x.fillRect(0.21 + (j % 2) * 0.004,","for (let j = 0; j < 6; j++) x.fillRect(0.26 + (j % 2) * 0.004,")
rep("slip(x, 0.3 - (0.9 + r() * 1.4) * a,","slip(x, 0.35 - (0.9 + r() * 1.4) * a,")
# S3: larger plates, and a plate fades before the frame edge can cut it
rep("PX = (s) => s.x + 0.44, RY = -0.115, VY = -0.345;","PX = (s) => s.x + 0.5, RY = -0.12, VY = -0.335;")
rep("const away = (s) => clamp((Math.abs(PX(s) - cam.x) - 0.6 / cam.z) / (0.32 / cam.z));","const away = (s) => clamp((Math.abs(PX(s) - cam.x) - (0.889 / cam.z - 0.44)) / 0.15);")
rep("lamps.push(...lyricLamps(PX(s), RY, 0.62, t, 0)","lamps.push(...lyricLamps(PX(s), RY, 0.8, t, 0)")
rep("""      plate(x, PX(s), VY, 0.56, verseNotes(s.salt, 17), PALETTE.ink);
      lyricPlate(x, PX(s), RY, 0.62);""","""      plate(x, PX(s), VY, 0.66, verseNotes(s.salt, 17), PALETTE.ink);
      lyricPlate(x, PX(s), RY, 0.8);""")
rep("holes: SINGERS.map((s) => [PX(s) - 0.33, -0.43, PX(s) + 0.33, -0.035]) });","holes: SINGERS.map((s) => [PX(s) - 0.42, -0.445, PX(s) + 0.42, -0.02]) });")
rep("lamps.push({ x: PX(s), y: RY, r: 0.38,","lamps.push({ x: PX(s), y: RY, r: 0.46,")
open('film.html','w').write(s); print('ok')

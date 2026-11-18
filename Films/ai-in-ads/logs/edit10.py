s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
# her refrain plate further left in its panel; the stamp stops over its right half, the arm above its top edge
rep("...lyricLamps(-0.06, -0.13, 0.74, t, 0.8 * pl)]","...lyricLamps(-0.14, -0.13, 0.74, t, 0.8 * pl)]")
rep("...lyricLamps(-0.06, -0.13, 0.74, t, 0.8 + 0.3","...lyricLamps(-0.14, -0.13, 0.74, t, 0.8 + 0.3")
rep("lyricPlate(x, -0.06, -0.13, 0.74); }","lyricPlate(x, -0.14, -0.13, 0.74); }",2)
rep("lattice(g, cam, -0.62, -0.42, 1.24, 0.84, { holes: [[-0.45, -0.225, 0.33, -0.035]] });","lattice(g, cam, -0.62, -0.42, 1.24, 0.84, { holes: [[-0.53, -0.225, 0.25, -0.035]] });")
rep("{ holes: [[-0.45, -0.225, 0.33, -0.035], [-0.3, -0.395, 0.18, -0.275]] });","{ holes: [[-0.53, -0.225, 0.25, -0.035], [-0.38, -0.395, 0.1, -0.275]] });")
rep("plaque(x, 'REFRAIN', -0.06, -0.335, 0.068,","plaque(x, 'REFRAIN', -0.14, -0.335, 0.068,")
rep("{ x: -0.06, y: -0.335, r: 0.3, i: 0.9 * tl,","{ x: -0.14, y: -0.335, r: 0.3, i: 0.9 * tl,")
rep("const tx = lerp(0.56, -0.06, raise) + lerp(0, 0.7, Math.sqrt(lower)), ty = lerp(-0.29, -0.262, raise) + lerp(0, 0.6, lower * lower);",
    "const tx = lerp(0.56, 0.02, raise) + lerp(0, 0.62, Math.sqrt(lower)), ty = lerp(-0.3, -0.27, raise) + lerp(0, 0.6, lower * lower);")
# S3: the plate the camera pushes into never fades
rep("const away = (s) => clamp((Math.abs(PX(s) - cam.x) - (0.889 / cam.z - 0.44)) / 0.15);","const away = (s) => clamp((Math.abs(PX(s) - cam.x) - (0.889 / Math.min(cam.z, 0.95) - 0.44)) / 0.15);")
# S2: the cut lands on a lit window, the flare brings it to full
rep("const lampI = t < CUES.lampFlare ? 0.18 : 0.18 + 0.85 * EASE.out(flare) * ov;","const lampI = t < CUES.lampFlare ? 0.45 : 0.45 + 0.6 * EASE.out(flare) * ov;")
open('film.html','w').write(s); print('ok')

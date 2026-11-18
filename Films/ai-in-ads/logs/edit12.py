s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
# the ending: the lamp dies; only the refrain stays lit. No title card, no empty panel.
rep("""  const tl = EASE.out(clamp((t - CUES.title) / 0.6));
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 }, ...lyricLamps(-0.14, -0.13, 0.74, t, 0.8 + 0.3 * Math.exp(-(((t - 58.2) / 0.5) ** 2))), { x: -0.14, y: -0.335, r: 0.3, i: 0.9 * tl, col: '255,200,96', hot: '255,244,205', steady: true }], t);""",
"""  const dim = 1 - 0.94 * EASE.inOut(clamp((t - 59.6) / 2.2));   // the lamp gutters out; the refrain keeps its light
  paper(g, cam, [{ x: lamp[0], y: lamp[1], r: 1.25, i: 0.95 * dim }, ...lyricLamps(-0.14, -0.13, 0.74, t, 0.8 + 0.3 * Math.exp(-(((t - 58.2) / 0.5) ** 2)) + 0.25 * (1 - dim))], t, { base: '#140d08' });""")
rep("""  const pt = pressOn(t, CUES.title);
  if (pt) puppet(pt.depth, (x) => plaque(x, 'REFRAIN', -0.14, -0.335, 0.068, { weight: 600, tracking: 0.16 }), { alpha: pt.alpha, noHide: true });
""","")
rep("{ holes: [[-0.53, -0.225, 0.25, -0.035], [-0.38, -0.395, 0.1, -0.275]] });","{ holes: [[-0.53, -0.225, 0.25, -0.035]] });")
# the machine 15 % smaller, inside the window
rep("bend: -1, s: 1.05 }","bend: -1, s: 0.9 }")
rep("const sx = lerp(1.25, 0.46, enter), sy = -0.08;","const sx = lerp(1.2, 0.47, enter), sy = 0.0;")
open('film.html','w').write(s); print('ok')

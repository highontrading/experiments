s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:70]); s=s.replace(a,b)
rep("plaque(x, n, -0.36, -0.2, 0.2,","plaque(x, n, -0.24, -0.2, 0.2,")
rep("plaque(x, 'versions of one advert', -0.36, 0.02, 0.062,","plaque(x, 'versions of one advert', -0.24, 0.02, 0.062,")
rep("""  const lamps = SINGERS.map((s, n) => ({ x: s.x + 0.25, y: 0.12, r: 0.95, i: 0.85 + 0.1 * Math.sin(n * 2.1) }));""","""  const lamps = SINGERS.map((s, n) => ({ x: s.x + 0.25, y: 0.12, r: 0.95, i: 0.8 + 0.1 * Math.sin(n * 2.1) }));
  for (const s of SINGERS) lamps.push({ x: s.x + 0.3, y: -0.21, r: 0.26, i: 0.85 + 0.4 * pushK, col: '255,196,80', hot: '255,240,190', steady: true });   // the refrain is lit""")
rep("const px = S.u * 0.034; g.font = typeFont(TYPE, 'text', px, { weight: 500 });","const px = S.u * 0.038; g.font = typeFont(TYPE, 'text', px, { weight: 500 });")
open('film.html','w').write(s); print('ok')

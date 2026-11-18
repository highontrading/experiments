s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
rep("  for (const [n, s] of SINGERS.entries()) {\n    if (Math.abs(s.x - cam.x) > 1.6) continue;","  for (const [n, s] of SINGERS.entries()) {\n    if (n !== kk) continue;   // one singer to a shot")
rep("if (near > 0) puppet(0.9 - 0.4 * near, (x) => automaton(x, { sx: lerp(1.45, 1.2, near), sy: -0.06, tx: lerp(1.2, 0.95, near), ty: 0.2, tilt: 0, spin: t * 6, bend: -1, s: 0.9 }), { alpha: 0.5 * near });",
    "if (near > 0) puppet(0.9 - 0.4 * near, (x) => automaton(x, { sx: lerp(0.78, 0.62, near), sy: -0.06, tx: lerp(0.62, 0.46, near), ty: 0.28, tilt: 0, spin: t * 6, bend: -1, s: 0.9 }), { alpha: near });")
rep("const sx = lerp(1.2, 0.47, enter), sy = -0.06;","const sx = lerp(0.62, 0.47, enter), sy = -0.06;")
rep("const tx = lerp(0.5, -0.08, raise)","const tx = lerp(lerp(0.46, 0.4, enter), -0.08, raise)")
rep("ty = lerp(-0.27, -0.25, raise)","ty = lerp(lerp(0.28, -0.1, enter), -0.25, raise)")
rep("const depth = lerp(0.35, 0.06, enter);","const depth = lerp(0.5, 0.06, enter);")
open('film.html','w').write(s); print('ok')

import json
s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
rep("const sx = lerp(1.3, 0.58, enter), sy = -0.08;","const sx = lerp(1.25, 0.46, enter), sy = -0.08;")
rep("const tx = lerp(0.56, 0.02, raise) + lerp(0, 0.62, Math.sqrt(lower)), ty = lerp(-0.3, -0.27, raise) + lerp(0, 0.6, lower * lower);",
    "const tx = lerp(0.5, 0.02, raise) + lerp(0, 0.34, Math.sqrt(lower)), ty = lerp(-0.27, -0.245, raise) + lerp(0, 0.365, lower * lower);")
rep("const cam = { x: lerp(-0.02, 0.0, back), y: lerp(0.05, -0.02, back), z: lerp(1.25, 1.03, back) };","const cam = { x: lerp(0.0, 0.0, back), y: lerp(0.03, -0.02, back), z: lerp(1.1, 0.98, back) };")
# S6 ends where S7 begins (same window, same framing at the cut)
rep("const cam = { x: lerp(0.0, -0.08, EASE.inOut(k)), y: lerp(0.0, 0.05, EASE.inOut(k)), z: lerp(0.95, 1.25, EASE.inOut(k)) };","const cam = { x: lerp(0.0, 0.0, EASE.inOut(k)), y: lerp(0.0, 0.03, EASE.inOut(k)), z: lerp(0.95, 1.1, EASE.inOut(k)) };")
rep("z: lerp(0.95, 1.75, pushK) };","z: lerp(0.95, 1.62, pushK) };")
rep("const L = [{ x: cx, y: cy, r: w * 0.62, i: base,","const L = [{ x: cx, y: cy, r: w * 0.9, i: base,")
rep("for (const h of HITS()) tick(ctx, out, h, 0.12);","for (const h of HITS()) tick(ctx, out, h, 0.08);")
open('film.html','w').write(s)
p='audio/mix.json'; d=json.load(open(p))
for l in d['layers']:
    if l['file'].endswith('/stamp.wav') or (l['file'].endswith('gears.wav') and l['at']<1): l['gain_db']-=1.5
json.dump(d,open(p,'w'),indent=1)
print('ok')

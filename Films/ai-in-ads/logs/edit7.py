import json
s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
rep("    lamps.push(...lyricLamps(s.x + 0.33 + walk, -0.21, 0.5, t, 0).slice(1));","    lamps.push(...lyricLamps(s.x + 0.36 + walk, -0.2, 0.62, t, 0).slice(1));")
rep("lamps.push({ x: s.x + 0.33 + walk, y: -0.21, r: 0.32, i: 0.85 + 0.4 * pushK,","lamps.push({ x: s.x + 0.36 + walk, y: -0.2, r: 0.38, i: 0.85 + 0.4 * pushK,")
rep("      lyricPlate(x, s.x + 0.33 + walk, -0.21, 0.5);","      lyricPlate(x, s.x + 0.36 + walk, -0.2, 0.62);")
rep("const cam = { x: lerp(tx, SINGERS[4].x + 0.33 + 0.3 * lt / 15, pushK),","const cam = { x: lerp(tx, SINGERS[4].x + 0.36 + 0.3 * lt / 15, pushK),")
rep("const px = S.u * 0.08, ps = S.u * 0.052, x0 = S.W * 0.07, y0 = S.H * 0.78;","const px = S.u * 0.08, ps = S.u * 0.066, x0 = S.W * 0.07, y0 = S.H * 0.76;")
# ending: a shorter pull-back, the refrain brightens as the machine withdraws, the title carved in the window
rep("const cam = { x: lerp(-0.02, 0.0, back), y: lerp(0.05, 0.0, back), z: lerp(1.25, 0.9, back) };","const cam = { x: lerp(-0.02, 0.0, back), y: lerp(0.05, -0.02, back), z: lerp(1.25, 1.03, back) };")
rep("...lyricLamps(-0.06, -0.165, 0.8, t, 0.8), { x: -0.02, y: 0.47, r: 0.35, i: 0.0 * tl }], t);","...lyricLamps(-0.06, -0.165, 0.8, t, 0.8 + 0.3 * Math.exp(-(((t - 58.2) / 0.5) ** 2))), { x: -0.06, y: -0.335, r: 0.3, i: 0.9 * tl, col: '255,200,96', hot: '255,244,205', steady: true }], t);")
a=s.index("  if (t > CUES.title) {   // the title on the dark wall under the window")
b=s.index("}", s.index("g.fillText('REFRAIN'", a)); b=s.index("}", b+1)
s=s[:a]+"""  // (the title is pressed onto the paper above her refrain: see the plaque in the shadow layer)
"""+s[b+1:]
rep("""  puppet(0.0, (x) => { lyricPlate(x, -0.06, -0.165, 0.8); rod(x, -0.06, -0.08, 0.02, 0.7, 0.002); });""","""  puppet(0.0, (x) => { lyricPlate(x, -0.06, -0.165, 0.8); rod(x, -0.06, -0.08, 0.02, 0.7, 0.002); });
  const pt = pressOn(t, CUES.title);
  if (pt) puppet(pt.depth, (x) => plaque(x, 'REFRAIN', -0.06, -0.335, 0.068, { weight: 600, tracking: 0.16 }), { alpha: pt.alpha, noHide: true });""")
rep("ty = lerp(0.18, -0.265, raise) + lerp(0, 0.565, lower);","ty = lerp(0.18, -0.295, raise) + lerp(0, 0.595, lower);")
# billboard: the winner is already up at the dissolve
rep("  const first = 37.9, every = beat(1);","  const first = 37.05, every = beat(1);")
rep("const AD_WORDS = ['MORE', 'NOW', 'NEXT', 'YOURS', 'FAST', 'AGAIN', 'MORE'];","const AD_WORDS = ['MORE', 'NOW', 'NEXT', 'YOURS', 'FAST', 'AGAIN', 'ONLY'];")
# a quieter opening
rep("permute(ctx, out, 0.12, 2.5, beat(0.5), 1, 0.3);","permute(ctx, out, 0.12, 2.5, beat(0.5), 1, 0.24);")
rep("permute(ctx, out, 2.5, 4.0, beat(0.25), 2, 0.28);","permute(ctx, out, 2.5, 4.0, beat(0.25), 2, 0.22);")
rep("permute(ctx, out, 4.0, CUES.done - 0.04, beat(0.125), 3, 0.24);","permute(ctx, out, 4.0, CUES.done - 0.04, beat(0.125), 3, 0.19);")
open('film.html','w').write(s)
p='audio/mix.json'; d=json.load(open(p))
for l in d['layers']:
    if l['file'].endswith('/stamp.wav'): l['gain_db']-=2
    if l['file'].endswith('paste.wav') and abs(l['at']-37.9)<0.01: l['at']=37.1
    if l['file'].endswith('rodtap.wav') and abs(l['at']-59.3)<0.01: l['at']=59.3
d['out']='audio/mix-v5.wav'; json.dump(d,open(p,'w'),indent=1)
print('ok')

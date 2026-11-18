import json
s=open('film.html').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80]); s=s.replace(a,b)
rep("""  const stop = (k) => SINGERS[k].x + 0.19, kk = Math.min(4, Math.floor(lt / 1.7)), uu = lt - 1.7 * kk;
  const tx = kk >= 4 ? stop(4) : lerp(stop(kk), stop(kk + 1), EASE.inOut(clamp((uu - 1.0) / 0.7)));""","""  // a hard cut every two beats, singer to singer: the refrain plate sits on the same spot of the screen in every shot
  const stop = (k) => SINGERS[k].x + 0.19, kk = Math.min(4, Math.floor(lt / beat(2))), tx = stop(kk);""")
rep("y: lerp(0.02, -0.17, pushK), z: lerp(0.95, 1.62, pushK) };","y: lerp(0.02, -0.15, pushK), z: lerp(0.95, 1.62, pushK) };")
# S6: the machine's shadow far off the paper, soft, at the right edge from 49 s
rep("""  const ph = (t * BPM / 60) / 3, hum = 0.15 + 0.15 * Math.sin(t * 5.2);
  puppet(0.0, (x) => singer(x, 'woman', -0.12, 0.36, 0.6, { t, seated: true, mouth: hum, nod: -0.12 + 0.06 * Math.sin(ph * TAU), armLift: 0.1, tremor: 0.7 }));""","""  const ph = (t * BPM / 60) / 3, hum = 0.15 + 0.15 * Math.sin(t * 5.2);
  const near = EASE.inOut(clamp((t - 49.0) / 3.5));
  if (near > 0) puppet(0.9 - 0.4 * near, (x) => automaton(x, { sx: lerp(1.45, 1.2, near), sy: -0.06, tx: lerp(1.2, 0.95, near), ty: 0.2, tilt: 0, spin: t * 6, bend: -1, s: 0.9 }), { alpha: 0.5 * near });
  puppet(0.0, (x) => singer(x, 'woman', -0.12, 0.36, 0.6, { t, seated: true, mouth: hum, nod: -0.12 + 0.06 * Math.sin(ph * TAU), armLift: 0.1, tremor: 0.7 }));""")
rep("const enter = EASE.out(clamp((t - CUES.s7) / 1.2));","const enter = EASE.out(clamp((t - CUES.s7) / 1.2)), from = 1.2;")
# S7: a longer hold over the refrain, then lower
rep("const lower = EASE.inOut(clamp((t - 57.0) / 2.0));","const lower = EASE.inOut(clamp((t - 57.6) / 1.8));")
open('film.html','w').write(s)
p='audio/mix.json'; d=json.load(open(p))
d['layers']=[l for l in d['layers'] if not (l['file'].endswith('rodtap.wav') and 13 < l['at'] < 20)]
for k in range(1,5): d['layers'].append(dict(file='assets/sound/rodtap.wav',at=round(12.5+k*60/72*2,3),gain_db=-13,bus='foley',pan=0.1*(-1)**k))
d['layers'].append(dict(file='assets/sound/gears.wav',at=49.2,gain_db=-20,bus='sfx',pan=0.6,fade_in=0.8))
json.dump(d,open(p,'w'),indent=1)
print('ok')

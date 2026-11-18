import json
p='engine/world.mjs'; s=open(p).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
# speed: no point-light shadow (six renders a frame)
rep("deskLight.castShadow = true; deskLight.shadow.mapSize.set(512, 512); desk.add(deskLight);","desk.add(deskLight);")
# the flaps swing the way the camera travels (in at 21 s, out at 36 s), never into the lens
rep("      const dir = camera.position.z > -7.7 ? -1 : 1;","      const dir = t < 30 ? 1 : -1;")
# the ending: a monitor on the empty desk wakes and shows an advert to the empty chair; the film holds 3 s after the page
rep("  const chairSeat =","""  const mon = new THREE.Group(); mon.position.set(-0.05, 1.1, -0.15); mon.rotation.y = 0.35; desk.add(mon);
  const monBody = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.32, 0.03, 2, 0.01), std('#141516', 0.4, 0.5)); monBody.position.y = 0.26; mon.add(monBody);
  const monStand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.05), std('#141516', 0.4, 0.5)); monStand.position.y = 0.06; mon.add(monStand);
  const monScr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.28), new THREE.MeshBasicMaterial({ map: phoneOff })); monScr.position.set(0, 0.26, 0.016); mon.add(monScr);
  T.monitor = { mat: monScr.material, ad: cellTex(atlas, 4), off: phoneOff };
  const chairSeat =""")
rep("    // the desk lamp breathes a little","""    // the desk monitor wakes at 56.4 s: an advert for nobody, to an empty chair
    const mm = t < 56.4 ? T.monitor.off : T.monitor.ad; if (T.monitor.mat.map !== mm) { T.monitor.mat.map = mm; T.monitor.mat.needsUpdate = true; }
    if (t >= 56.4) { const i = (4 + Math.floor((t - 56.4) / 1.5)) % 8; T.monitor.ad.offset.set((i % 4) * 0.25, 0.5 - Math.floor(i / 4) * 0.5); }
    // the desk lamp breathes a little""")
rep("    [60, [6.95, 1.36, 3.3], [7.95, 1.12, 2.05], 30],","    [62, [6.95, 1.36, 3.3], [7.95, 1.18, 2.05], 30],")
open(p,'w').write(s)
f='film.html'; s=open(f).read()
for a,b in [("const DURATION = 60;","const DURATION = 62;"),
            ("    display: { family: 'Instrument Serif', pkg: 'instrument-serif', version: '5.3.0', cap: 0.72, weights: [400], styles: ['normal'] },\n","    display: null,\n"),
            ("  { chapter: 'C4', from: CUES.desk, to: CUES.end, draw: carousel, action: 'the empty help desk; the page goes unanswered',",
             "  { chapter: 'C4', from: CUES.desk, to: CUES.end, draw: carousel, action: 'the PA pages the passenger; nobody comes; the desk monitor wakes and shows an advert to the empty chair',")]:
    assert s.count(a)==1,a[:50]; s=s.replace(a,b)
open(f,'w').write(s)
m='audio/mix.json'; d=json.load(open(m)); d['duration']=62
for l in d['layers']:
    f_=l['file']
    if f_.endswith('backhall.wav'): l['gain_db']=-11
    if f_.endswith('servo.wav'): l['gain_db']=-8
    if f_.endswith('belt.wav') and 35<l['at']<36: l['gain_db']=-13
    if f_.endswith('thud.wav'): l['gain_db']-=3
    if f_.endswith('terminal.wav') and l['at']>30: l['length']=26.6
    if f_.endswith('belt.wav') and l['at']>50: l['length']=11.0
d['layers'].append(dict(file='assets/sound/buzz.wav',at=56.4,gain_db=-10,bus='foley',pan=0.3))
d['out']='audio/mix-v2.wav'; json.dump(d,open(m,'w'),indent=1)
print('ok')

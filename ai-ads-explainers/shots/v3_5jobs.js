// V3 "5 Ad Jobs AI Rewrote": fast listicle.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (a, b) => (lt) => clamp((lt - a) / (b - a));
const pulse = (...ts) => (lt) => Math.max(0, ...ts.map((t0) => (lt >= t0 ? Math.exp(-6 * (lt - t0)) : 0)));
export default (TL) => {
  const B = TL.beats, T = (i, o = 0) => B[i].t0 + o;
  const W = (i, word) => { const w = B[i].words.find((x) => x[0].toLowerCase().includes(word)); return w ? w[1] : B[i].t0; };
  return [
    { from: 0, scene: 'studio', P: { ripple: seg(0.1, 2.2), badges: true }, cam: { p0: [0, 2.0, 9], p1: [0, 1.9, -4], l0: [0, 1.7, -2], l1: [0, 1.7, -16], fov: 46 } },
    { from: 1, scene: 'grid', P: { obj: 'bottle', stages: [[0, 'wire'], [1.4, 'clay'], [2.8, 'final']] }, cut: 'impact',
      ov: [{ type: 'data', atT: W(1, 'nba') - 0.2, label: 'NBA FINALS AD · JUN 2025', source: 'NPR, 23 Jun 2025', accent: 'c', items: [{ label: 'MADE WITH', value: 'Veo 3', c: 'c' }, { label: 'TIME', value: '~2', unit: 'DAYS' }] }] },
    { from: 2, scene: 'wall', P: { spread: seg(0.2, 3.4), dimRest: seg(2.8, 3.6) }, cam: { p0: [0, 1.5, 3.4], p1: [0, 1.0, 16], fov: 40 }, cut: 'impact',
      ov: [{ type: 'float', anchor: 'center', off: [0, 0.95, 0], text: 'WINNER', c: 'g', fill: true, atT: W(2, 'human') }] },
    { from: 3, scene: 'city', P: { mode: 'shops', shopsOn: seg(0.6, 5.6) }, cam: { p0: [-10, 3.2, 10], p1: [6, 3.2, 8], l0: [-7, 2.4, -2], l1: [7, 2.4, -2], fov: 44 }, cut: 'impact',
      ov: [{ type: 'data', atT: W(3, 'two') - 0.2, label: '#NOTJUSTACADBURYAD · 2021', source: 'WPP case study', accent: 'g', items: [{ label: 'LOCAL STORES', value: '2,000+', c: 'g' }] }] },
    { from: 4, scene: 'servers', P: { packet: seg(0.2, 5.5) }, cut: 'impact',
      ov: [{ type: 'data', atT: W(4, 'sixty') - 0.2, label: 'META · AI-POWERED AD TOOLS', source: 'Meta Q3 2025 earnings call', accent: 'g', items: [{ label: 'ANNUAL RUN RATE', value: '$60B+', c: 'g', size: 64 }] }] },
    { from: 5, scene: 'wall', P: { select: seg(0.6, 2.2) }, cam: { p0: [0, -1, 14], p1: [0, -1, 10], l0: [0, 0.5, 0], l1: [0, 0.8, 0], fov: 46 }, cut: 'impact',
      ov: [{ type: 'data', atT: W(5, 'forty') - 0.2, label: 'VIDEO ADS BUILT WITH GEN AI · 2026', source: 'IAB, Jul 2025', accent: 'g', items: [{ label: 'EXPECTED SHARE', value: '~40%', c: 'g', size: 64 }] }] },
    { from: 6, scene: 'desk', P: { orbOnly: true, orbPulse: pulse(0.2, W(6, 'taste') - T(6)) }, cam: { p0: [0.8, 0.9, 3.8], p1: [0.3, 0.75, 2.6], l0: [0, 0.3, 0.4], l1: [0, 0.3, 0.4], fov: 32 } },
    { from: 7, scene: 'arena', P: { screen: 'holiday', static: (lt) => (Math.sin(lt * 8) > 0.7 ? 0.8 : 0) }, fx: { glitch: (lt) => (Math.sin(lt * 8) > 0.7 ? 0.9 : 0.06) },
      cam: { p0: [0, 6.2, 14], p1: [0, 6.0, 12] }, sfx: [{ t: 0.3, s: 'glitch', g: 0.5 }],
      ov: [{ type: 'float', anchor: 'screenTop', off: [-3.0, -3.4, 0], text: 'BACKLASH 2024', c: 'r', fill: true, at: 0.6 }, { type: 'float', anchor: 'screenTop', off: [3.0, -5.0, 0], text: 'BACKLASH 2025', c: 'r', fill: true, at: 1.4 },
           { type: 'source', text: 'Coca-Cola holiday campaigns, 2024 & 2025', at: 0.4 }] },
    { from: 8, scene: 'desk', P: { ad: 0, orbPulse: pulse(0.3) }, cam: { p0: [0.4, 1.4, 6.0], p1: [0.1, 1.3, 5.0] } },
    { from: 9, end: true },
  ];
};

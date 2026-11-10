// V2 "100 Milliseconds": POV inside one scroll.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (a, b) => (lt) => clamp((lt - a) / (b - a));
const pulse = (...ts) => (lt) => Math.max(0, ...ts.map((t0) => (lt >= t0 ? Math.exp(-6 * (lt - t0)) : 0)));
export default (TL) => {
  const B = TL.beats, T = (i, o = 0) => B[i].t0 + o;
  const W = (i, word) => { const w = B[i].words.find((x) => x[0].toLowerCase().includes(word)); return w ? w[1] : B[i].t0; };
  const s0 = 0, s2 = T(2) - 0.06;
  return [
    { from: 0, scene: 'desk', P: { scroll: (lt) => lt * 260, timer: (lt) => (lt < T(1) - s0 ? 0 : Math.min(100, (lt - (T(1) - s0)) * 70)) },
      cam: { p0: [0.2, 1.3, 6.8], p1: [-0.1, 1.3, 4.6] },
      ov: [{ type: 'chip', atT: T(1), label: 'TIME TO SHOW YOU AN AD', from: 0, to: 100, count: 1.4, unit: ' ms', accent: 'g', track: ['0 ms', '~100 ms'], w: 954 }] },
    { from: 2, scene: 'desk', P: { scroll: () => 1500, timer: () => 0 }, cam: { p0: [-0.2, 1.35, 3.6], p1: [-0.3, 1.4, 3.0], l0: [-0.4, 1.2, 0.3], l1: [-0.4, 1.25, 0.3], fov: 30 },
      fx: { flash: (lt) => Math.max(0, 0.7 - lt * 5) }, cut: 'rewind' },
    { from: 3, scene: 'servers', P: { packet: seg(0.3, 7.5) },
      ov: [{ type: 'chip', at: 0.2, label: 'AUCTION CLOCK', from: 0, to: 12, count: 6.5, unit: ' ms', accent: 'g', track: ['0 ms', '~100 ms'], w: 954, until: T(5) - T(3) },
           { type: 'float', anchor: 'packet', off: [0, 0.35, 0], text: 'SCREEN FREE', c: 'g', at: 0.5, untilT: T(4) },
           { type: 'float', anchor: 'packet', off: [0, 0.35, 0], text: 'BID REQUEST', c: 'c', fill: true, atT: W(4, 'bid') }] },
    { from: 5, scene: 'wall', P: { select: seg(0.6, 2.2) }, cam: { p0: [0, 0.5, 15], p1: [0, 0.2, 10], l0: [0, 1.0, 0], l1: [0, 1.2, 0], fov: 46 },
      ov: [{ type: 'float', anchor: [0, 1.5, 0], off: [-2.8, 3.0, 0], text: 'CLICK?', c: 'g', atT: W(5, 'click') },
           { type: 'float', anchor: [0, 1.5, 0], off: [2.6, 1.0, 0], text: 'BUY?', c: 'o', atT: W(5, 'buy') },
           { type: 'float', anchor: [0, 1.5, 0], off: [-1.2, -2.6, 0], text: 'SKIP?', c: 'r', atT: W(5, 'skip') }] },
    { from: 6, scene: 'grid', P: { obj: 'bars', barAt: 0.4, spin: 0 }, cam: { p0: [0.6, 2.4, 7.4], p1: [0.2, 2.2, 6.6], l0: [0, 1.4, 0], l1: [0, 1.5, 0] },
      ov: [{ type: 'float', anchor: 'bar0', off: [0, 0.2, 0.3], text: 'BID A', c: 'w', at: 0.7 }, { type: 'float', anchor: 'bar1', off: [0, 0.2, 0.3], text: 'BID B', c: 'w', at: 0.95 },
           { type: 'float', anchor: 'bar2', off: [0, 0.25, 0.3], text: 'WINS', c: 'g', fill: true, atT: W(6, 'wins') }] },
    { from: 7, scene: 'city', P: { mode: 'board', board: () => ({ a: 'snow', b: 'city', k: 0 }) }, cam: { p0: [0, 3, 26], p1: [0, 8, 16] } },
    { from: 8, scene: 'city', P: { mode: 'board', board: (lt) => ({ a: 'snow', b: 'city', k: clamp((lt - (W(8, 'city') - T(8))) / 0.7) }) },
      cam: { p0: [-3, 10, 8], p1: [-1.5, 11.5, 4], l0: [0, 14, -14], l1: [0, 14, -14], fov: 50 },
      ov: [{ type: 'float', anchor: 'boardTop', off: [-3.5, 0.6, 0], text: 'VIEWER A', c: 'c', atT: W(8, 'snowy') }, { type: 'float', anchor: 'boardTop', off: [3.5, 0.6, 0], text: 'VIEWER B', c: 'o', atT: W(8, 'city') },
           { type: 'source', text: 'Wall Street Journal, via Campaign Asia, Jun 2025', at: 0.4 }] },
    { from: 9, scene: 'city', P: { mode: 'shops', shopsOn: seg(1.2, 7.0) }, cam: { p0: [-9, 3.0, 9], p1: [7, 3.2, 8], l0: [-6, 2.4, -2], l1: [8, 2.4, -2], fov: 44 },
      ov: [{ type: 'data', atT: W(9, 'two') - 0.2, label: '#NOTJUSTACADBURYAD · 2021', source: 'WPP case study', accent: 'g', items: [{ label: 'LOCAL STORES FEATURED', value: '2,000+', c: 'g' }] }] },
    { from: 10, scene: 'desk', P: { scroll: () => 560, timer: (lt) => Math.min(100, 88 + lt * 12), orbPulse: pulse(0.6), ad: 2 }, cam: { p0: [-0.1, 1.35, 3.8], p1: [-0.3, 1.3, 3.2], l0: [-0.4, 1.25, 0.3], l1: [-0.4, 1.25, 0.3], fov: 30 }, cut: 'ding' },
    { from: 11, scene: 'city', P: { mode: 'board', board: () => ({ a: 'city', b: 'city', k: 0 }), cityGlow: (lt) => 0.8 + 0.6 * seg(0, 3)(lt) }, cam: { p0: [0, 10, 26], p1: [6, 24, 40], l0: [0, 9, -12], l1: [0, 6, -22], fov: 50 } },
    { from: 12, scene: 'servers', P: {}, cam: { p0: [0, 1.6, 2], p1: [0, 1.7, -10], l0: [0, 1.6, -25], l1: [0, 1.6, -30] },
      ov: [{ type: 'data', atT: W(12, 'sixty') - 0.2, label: 'META · AI-POWERED AD TOOLS', source: 'Meta Q3 2025 earnings call', accent: 'g', items: [{ label: 'ANNUAL REVENUE RUN RATE', value: '$60B+', c: 'g', size: 64 }] }] },
    { from: 13, scene: 'grid', P: { obj: 'bottle', stages: [[0, 'wire'], [2.2, 'clay'], [4.2, 'final']] },
      ov: [{ type: 'float', anchor: 'left', off: [0, 0.2, 0], text: 'PRODUCT IMAGE', c: 'w', atT: W(13, 'image') }, { type: 'float', anchor: 'right', off: [0, -0.4, 0], text: 'BUDGET', c: 'g', atT: W(13, 'budget') },
           { type: 'float', anchor: 'top', off: [0, 0.45, 0], text: 'AI BUILDS THE AD', c: 'c', fill: true, atT: W(13, 'builds') }, { type: 'source', text: 'Wall Street Journal, via Campaign Asia, Jun 2025', at: 0.4 }] },
    { from: 14, scene: 'desk', P: { scroll: (lt) => 900 + lt * 140, ad: 5 }, fx: { glitch: (lt) => (lt > 0.4 && lt < 0.55 ? 0.8 : 0) }, cam: { p0: [0.6, 1.5, 6.2], p1: [0.1, 1.3, 4.8] },
      ov: [{ type: 'float', anchor: 'phoneTop', off: [-0.9, 0.2, 0], text: 'ADVERTISER?', c: 'o', atT: W(14, 'advertiser') }, { type: 'float', anchor: 'orb', off: [0.3, 0.6, 0], text: 'ALGORITHM?', c: 'c', atT: W(14, 'algorithm') }] },
    { from: 16, end: true },
  ];
};

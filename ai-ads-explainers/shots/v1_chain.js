// V1 "The 2-Day Ad": deep-dive through the ad-making chain.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (a, b) => (lt) => clamp((lt - a) / (b - a));
const pulse = (...ts) => (lt) => Math.max(0, ...ts.map((t0) => (lt >= t0 ? Math.exp(-6 * (lt - t0)) : 0)));
export default (TL) => {
  const B = TL.beats, T = (i, o = 0) => B[i].t0 + o;            // absolute time of a beat
  const W = (i, word) => { const w = B[i].words.find((x) => x[0].toLowerCase().includes(word)); return w ? w[1] : B[i].t0; };
  return [
    { from: 0, scene: 'arena', P: { screen: 'court' } },
    { from: 1, scene: 'arena', P: { screen: 'ad', ad: 6, kind: 1, head: 'One sip. Pure joy' }, cam: { p0: [-3.5, 5.2, 9], p1: [-2.2, 5.4, 7], l0: [0, 5.2, -9], l1: [0, 5.3, -9], fov: 38 },
      ov: [{ type: 'data', atT: W(1, 'two') - 0.1, label: 'AI-MADE AD · NBA FINALS 2025', source: 'NPR, 23 Jun 2025', accent: 'g',
        items: [{ label: 'TIME TO MAKE', value: '2', unit: 'DAYS' }, { label: 'AI COST', value: '<$2,000', c: 'g' }] }] },
    { from: 2, scene: 'grid', P: { obj: 'camera', lightsOff: seg(0.9, 2.0), spin: 0.12 }, cam: { p0: [0, 2.2, 7.5], p1: [0.6, 2.0, 6.4], l0: [0, 1.6, 0], l1: [0, 1.6, 0] },
      sfx: [{ t: 1.05, s: 'thud', g: 0.5 }, { t: 1.85, s: 'thud', g: 0.5 }] },
    { from: 3, scene: 'studio', P: { ripple: () => 1 }, cam: { p0: [6, 6.5, 12], p1: [3, 5.5, 8], l0: [0, 0.8, -4], l1: [0, 0.8, -6], fov: 46 },
      ov: [{ type: 'chip', at: 0.3, label: 'BRIEF → ON AIR  (TRADITIONAL)', from: 0, to: 1, count: 2.6, fmt: () => 'MONTHS', accent: 'r', track: ['BRIEF', 'ON AIR'], w: 954 }] },
    { from: 4, scene: 'studio', P: { off: seg(0.2, 1.6) }, cam: { p0: [0, 2.2, 10], p1: [0, 2.0, 8.6], l0: [0, 1.4, 0], l1: [0, 1.3, -2], fov: 44 }, sfx: [{ t: 0.3, s: 'down', g: 0.6 }] },
    { from: 5, scene: 'studio', P: { badges: true, ripple: () => 1 }, cam: { p0: [0, 2.0, 8], p1: [0, 1.9, -15], l0: [0, 1.7, -2], l1: [0, 1.7, -22], fov: 46 } },
    { from: 7, scene: 'grid', P: { obj: 'bottle', stages: [[0, 'wire'], [1.0, 'clay'], [T(8) - T(7) + 0.3, 'final']] },
      ov: [{ type: 'float', anchor: 'top', off: [0, 0.4, 0], text: 'PROMPT → SHOT', c: 'c', at: 0.3 },
           { type: 'float', anchor: 'left', off: [-0.3, -1.4, 0], text: '"amber bottle, studio light"', c: 'w', size: 24, atT: T(8) + 0.2 }] },
    { from: 9, scene: 'wall', P: { select: seg(0.8, 2.4) }, cam: { p0: [0, -1, 13], p1: [0, -1, 9], l0: [0, 0.5, 0], l1: [0, 0.8, 0], fov: 46 },
      ov: [{ type: 'data', atT: W(9, 'three') - 0.15, label: 'THE NBA AD · GOOGLE VEO 3', source: 'NPR, 23 Jun 2025', accent: 'g',
        items: [{ label: 'GENERATIONS', value: '300-400' }, { label: 'CLIPS KEPT', value: '15', c: 'g' }] }] },
    { from: 10, scene: 'wall', P: { spread: seg(0.4, 6.5) }, cam: { p1: [0, 0.4, 24], fov: 40 },
      ov: [{ type: 'float', anchor: 'center', off: [0, 0.95, 0], text: 'ONE AD', c: 'g', at: 0.4, until: 2.6 },
           { type: 'float', anchor: [0, 1.5, 0], off: [-2.6, 4.2, 0], text: 'HEADLINE', c: 'c', atT: W(11, 'headline') },
           { type: 'float', anchor: [0, 1.5, 0], off: [2.4, 2.4, 0], text: 'COLOUR', c: 'o', atT: W(11, 'colour') },
           { type: 'float', anchor: [0, 1.5, 0], off: [-1.6, -3.4, 0], text: 'LANGUAGE', c: 'g', atT: W(11, 'language') }] },
    { from: 12, scene: 'servers', P: { packet: seg(0.2, 7.5) },
      ov: [{ type: 'float', anchor: 'packet', off: [0, 0.35, 0], text: 'YOUR SCREEN', c: 'g', at: 0.4, until: 2.8 },
           { type: 'chip', atT: T(13) + 0.1, label: 'AUCTION CLOCK', from: 0, to: 100, count: 3.6, unit: ' ms', accent: 'g', track: ['0 ms', '100 ms'], w: 954 }] },
    { from: 14, scene: 'arena', P: { screen: 'holiday' }, fx: { red: (lt) => clamp(lt / 0.15) * 0.85 }, cam: { p0: [0, 6.2, 13], p1: [0, 6.0, 12] }, cut: 'impact' },
    { from: 15, scene: 'arena', P: { screen: 'holiday', static: (lt) => (Math.sin(lt * 9) > 0.6 ? 0.8 : 0) }, fx: { glitch: (lt) => (Math.sin(lt * 9) > 0.6 ? 0.9 : 0.08) },
      cam: { p0: [3.5, 5.6, 8.5], p1: [2.5, 5.8, 7], l0: [0, 5.4, -9], l1: [0, 5.6, -9], fov: 40 },
      ov: [{ type: 'source', text: 'Coca-Cola holiday campaigns, 2024 & 2025', at: 0.4 },
           { type: 'float', anchor: 'screenTop', off: [-3.0, -3.6, 0], text: 'BACKLASH', c: 'r', fill: true, atT: W(15, 'noticed') }], sfx: [{ t: 0.4, s: 'glitch', g: 0.5 }] },
    { from: 16, scene: 'studio', P: { ripple: seg(0.3, 2.4) }, cam: { p0: [0, 12, 10], p1: [0, 10, 4], l0: [0, 0, -6], l1: [0, 0, -9], fov: 50 } },
    { from: 17, scene: 'wall', P: { spread: () => 1 }, cam: { p0: [0, 0.5, 6], p1: [0, 0.3, 26], l0: [0, 1.5, 0], l1: [0, 1.0, 0], fov: 42 },
      ov: [{ type: 'data', at: 0.25, label: "COCA-COLA'S 2025 AI HOLIDAY AD", source: 'TheWrap, 2025', accent: 'g', roll: 1.6,
        items: [{ label: 'CLIPS', value: '70,000', size: 50 }, { label: 'AI SPECIALISTS', value: '5', size: 50 }, { label: 'DAYS', value: '30', size: 50 }] }] },
    { from: 18, scene: 'studio', P: { ripple: () => 1, badges: true }, cam: { p0: [0, 3.0, 9], p1: [0, 9, 16], l0: [0, 1.3, -2], l1: [0, 0.6, -6], fov: 46 } },
    { from: 19, scene: 'desk', P: { ad: 0, orbPulse: pulse(0.3, 2.6) }, ov: [{ type: 'float', anchor: 'orb', off: [0.1, 0.55, 0], text: 'MAKES', c: 'c', at: 0.4 }, { type: 'float', anchor: 'phoneTop', off: [0, 0.35, 0], text: 'YOU DECIDE', c: 'g', fill: true, atT: W(19, 'humans') }] },
    { from: 20, scene: 'desk', P: { orbOnly: true, orbPulse: pulse(0.2) }, cam: { p0: [0.6, 0.9, 3.6], p1: [0.3, 0.8, 2.6], l0: [0, 0.3, 0.4], l1: [0, 0.3, 0.4], fov: 32 } },
    { from: 21, end: true },
  ];
};

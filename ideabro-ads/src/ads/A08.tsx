import React from 'react';
import {AbsoluteFill} from 'remotion';
import vo from '../data/vo/A08.json';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, Vo, EndCard, CapGold, voWords, Crop, fadeUp, popIn, rnd, clamp} from '../lib';

// A08 · Hinglish · Diwali campaign in one night — gold festive serif, sparkles, warm grade, Jeet VO
const AT = 0.3;
const ws = voWords('A08', AT, vo);
const w = (i: number) => ws[i].s - 0.08;
export const dur = AT + vo.dur + 0.7 + 3.4;
const END = AT + vo.dur + 0.7;
const CUTS: [number, any, number?][] = [
  [0, 'stock/g_diya-thali.mp4', 0],
  [4, 'stock/g_sparkler-closeup.mp4', 0],
  [9, 'studio/img/i01.jpg'],
  [11, 'studio/img/i02.jpg'],
  [13, 'studio/img/i27.jpg'],
  [16, 'product'],
  [23, 'studio/img/i01.jpg'],
];

const Sparkles: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 46}).map((_, i) => {
        const x = rnd(i * 3.3) * W, y0 = rnd(i * 7.1) * H, sp = 30 + rnd(i) * 60;
        const y = (y0 - t * sp + H) % H;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (2 + rnd(i * 2) * 3) + i));
        const s = 4 + rnd(i * 5) * 8;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#FFD98A', opacity: tw * 0.8, boxShadow: `0 0 ${s * 3}px ${s}px rgba(255,190,90,0.55)`}} />;
      })}
    </AbsoluteFill>
  );
};

export const A08: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{background: '#120a04'}}>
      {CUTS.map(([wi, m, from], k) => {
        const a = k === 0 ? 0 : w(wi), b = k + 1 < CUTS.length ? w(CUTS[k + 1][0]) : END;
        return (
          <Win key={k} a={a} b={b}>
            {m === 'product' ? (
              <AbsoluteFill>
                <KB src="stock/i_bokeh-warm.mp4" a={a} b={b} z0={1.1} z1={1.2} />
                <AbsoluteFill style={{background: 'rgba(30,12,0,0.35)'}} />
                <div style={{position: 'absolute', left: 250, top: 470, width: 580, height: 820, padding: 14, borderRadius: 26, background: 'linear-gradient(160deg,#F7DE9A,#B9852E)', boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 80px rgba(255,180,80,0.35)', ...popIn(t, a + 0.05, 0.4)}}>
                  <Crop src="studio/img/i46.jpg" x={0.02} y={0} w={0.46} h={1} style={{borderRadius: 16, filter: 'sepia(0.25) saturate(1.2) brightness(1.03)'}} />
                </div>
              </AbsoluteFill>
            ) : (
              <KB src={m} a={a} b={b} from={from || 0} z0={1.03} z1={1.12} style={{filter: 'sepia(0.18) saturate(1.15)'}} />
            )}
          </Win>
        );
      })}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(18,10,4,0.55) 0%, rgba(18,10,4,0) 30%, rgba(18,10,4,0) 50%, rgba(18,10,4,0.6) 78%)'}} />
      <Sparkles />
      <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.6 - 190, height: 380, background: 'radial-gradient(ellipse at 50% 50%, rgba(25,12,2,0.72) 0%, rgba(25,12,2,0.45) 45%, rgba(25,12,2,0) 75%)'}} />
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 600, fontSize: 28, letterSpacing: '0.34em', color: '#F2C76E', ...fadeUp(t, 0.1)}}>THE DIWALI EDIT · MADE WITH AI</div>
      <CapGold words={ws} y={0.6} maxChars={16} size={100} />
      <EndCard at={END} theme="gold" sub="Festive campaigns, bina studio, bina shoot." />
      <Grain o={0.05} />
      <Vo id="A08" at={AT} />
      <Music src="M4_festive.mp3" vol={0.55} words={ws} end={dur} fadeOut={0.8} />
      <Sfx n="chime" at={0.05} vol={0.4} />
      {CUTS.slice(1).map(([wi], i) => <Sfx key={i} n="chime" at={w(wi) - 0.05} vol={0.16} rate={1 + i * 0.06} />)}
      <Sfx n="ui" at={END} vol={0.45} />
    </AbsoluteFill>
  );
};

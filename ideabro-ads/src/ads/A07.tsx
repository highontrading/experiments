import React from 'react';
import {AbsoluteFill} from 'remotion';
import vo from '../data/vo/A07.json';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, Vo, EndCard, CapKinetic, voWords, Crop, fadeUp, popIn, Bug} from '../lib';

// A07 · Hinglish · D2C founders: "Shoot ka budget nahi hai? Koi baat nahi." — kinetic UGC captions, Jeet VO
const AT = 0.3;
const ws = voWords('A07', AT, vo);
const w = (i: number) => ws[i].s - 0.08;
export const dur = AT + vo.dur + 0.6 + 3.4;
const END = AT + vo.dur + 0.6;
// [wordIndex, media, from or crop]
const CUTS: [number, any, number?][] = [
  [0, 'stock/f_tape-seal-box-vertical.mp4', 0],
  [3, 'stock/a_studio-softboxes-wide.mp4', 0],
  [8, 'studio/v04.mp4', 2],
  [11, ['studio/img/i46.jpg', 0, 0, 0.5, 1]],
  [15, ['studio/img/i46.jpg', 0.5, 0, 0.5, 0.5]],
  [18, ['studio/img/i47.jpg', 0.2, 0, 0.6, 1]],
  [20, 'studio/img/i40.jpg'],
  [21, 'studio/v10.mp4', 0.3],
  [23, 'studio/v12.mp4', 0.3],
  [25, 'studio/v14.mp4', 1.5],
  [27, 'studio/v08.mp4', 0.3],
];

export const A07: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {CUTS.map(([wi, m, from], k) => {
        const a = k === 0 ? 0 : w(wi), b = k + 1 < CUTS.length ? w(CUTS[k + 1][0]) : END;
        return (
          <Win key={k} a={a} b={b}>
            {Array.isArray(m) ? (
              <AbsoluteFill style={{transform: `scale(${1.02 + 0.06 * Math.min(1, (t - a) / (b - a))})`}}><Crop src={m[0]} x={m[1]} y={m[2]} w={m[3]} h={m[4]} /></AbsoluteFill>
            ) : (
              <KB src={m} a={a} b={b} from={from || 0} z0={1.02} z1={1.1} style={k === 1 ? {filter: 'grayscale(0.6) brightness(0.8)'} : undefined} />
            )}
          </Win>
        );
      })}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 75%)'}} />
      <Win a={0} b={w(3)}>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...popIn(t, 0.05, 0.3)}}>
          <span style={{fontFamily: F.mont, fontWeight: 900, fontSize: 44, color: '#111', background: '#FFE14D', padding: '12px 28px', borderRadius: 12, letterSpacing: '0.04em'}}>FOR D2C FOUNDERS</span>
        </div>
      </Win>
      <Win a={w(3)} b={w(8)}>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontFamily: F.mont, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.6)', ...fadeUp(t, w(3))}}>STUDIO · CREW · MODELS · ₹₹₹</div>
      </Win>
      <CapKinetic words={ws} y={0.6} maxChars={14} size={84} />
      <EndCard at={END} theme="yellow" sub="Ek product photo se poora campaign. Bina shoot ke." />
      <Grain o={0.04} />
      <Vo id="A07" at={AT} />
      <Music src="M5_desi.mp3" vol={0.5} words={ws} end={dur} fadeOut={0.6} />
      {CUTS.slice(1).map(([wi], i) => <Sfx key={i} n="swoosh" at={w(wi) - 0.05} vol={0.22} rate={1 + (i % 3) * 0.1} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

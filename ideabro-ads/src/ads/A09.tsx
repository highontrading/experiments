import React from 'react';
import {AbsoluteFill} from 'remotion';
import vo from '../data/vo/A09.json';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, Vo, EndCard, CapBoxed, voWords, Crop, fadeUp, popIn, clamp, eo, Bug} from '../lib';

// A09 · Hinglish · Freelancers: "Client ko shoot nahi chahiye. Client ko result chahiye." — white boxed captions, Jeet VO
const AT = 0.3;
const ws = voWords('A09', AT, vo);
const w = (i: number) => ws[i].s - 0.08;
export const dur = AT + vo.dur + 0.6 + 3.4;
const END = AT + vo.dur + 0.6;
const CUTS: [number, any, number?][] = [
  [0, 'stock/h_freelancer-cafe-typing.mp4', 0],
  [4, 'stock/a_photographer-strobes.mp4', 0],
  [9, 'studio/v02.mp4', 4],
  [11, ['studio/img/i46.jpg', 0, 0, 0.5, 1]],
  [13, 'studio/v04.mp4', 3],
  [15, ['studio/img/i45.jpg', 0.1, 0, 0.8, 1]],
  [18, 'studio/v14.mp4', 1.5],
  [23, 'stock/h_freelancer-coffee-laptop.mp4', 0],
];

export const A09: React.FC = () => {
  const {t} = useT();
  const strike = eo(clamp((t - w(7)) / 0.3));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {CUTS.map(([wi, m, from], k) => {
        const a = k === 0 ? 0 : w(wi), b = k + 1 < CUTS.length ? w(CUTS[k + 1][0]) : END;
        return (
          <Win key={k} a={a} b={b}>
            {Array.isArray(m) ? (
              <AbsoluteFill style={{transform: `scale(${1.02 + 0.06 * Math.min(1, (t - a) / (b - a))})`}}><Crop src={m[0]} x={m[1]} y={m[2]} w={m[3]} h={m[4]} /></AbsoluteFill>
            ) : (
              <KB src={m} a={a} b={b} from={from || 0} z0={1.02} z1={1.1} style={k === 1 ? {filter: 'grayscale(1) brightness(0.75)'} : undefined} />
            )}
          </Win>
        );
      })}
      <Win a={w(4)} b={w(9)}>
        <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: F.anton, fontSize: 210, color: '#fff', ...fadeUp(t, w(4))}}>
          <span style={{position: 'relative'}}>
            SHOOT
            <span style={{position: 'absolute', left: -20, right: -20, top: '52%', height: 22, background: '#E5484D', transform: `scaleX(${strike}) rotate(-4deg)`, transformOrigin: 'left'}} />
          </span>
        </div>
      </Win>
      <Win a={w(9)} b={w(13)}>
        <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: F.anton, fontSize: 210, color: '#FFE14D', textShadow: '0 6px 30px rgba(0,0,0,0.5)', ...popIn(t, w(11), 0.3)}}>RESULT</div>
      </Win>
      <Win a={w(23)} b={END}>
        <div style={{position: 'absolute', top: 330, left: 60, right: 60, display: 'flex', justifyContent: 'center', ...popIn(t, w(23) + 0.2, 0.35)}}>
          <div style={{background: 'rgba(15,15,15,0.85)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 10}}>
            <span style={{fontFamily: F.mono, fontSize: 26, color: '#FFE14D', letterSpacing: '0.12em'}}>MODULE 11 · CAPSTONE</span>
            <span style={{fontFamily: F.tight, fontWeight: 700, fontSize: 46, color: '#fff', letterSpacing: '-0.02em'}}>Pricing and pitching AI ad services</span>
          </div>
        </div>
      </Win>
      <CapBoxed words={ws} y={0.62} maxChars={22} size={58} />
      <EndCard at={END} theme="dark" sub="Shoots, films aur ad sets deliver karo, ek fraction of the cost par." />
      <Grain o={0.04} />
      <Vo id="A09" at={AT} />
      <Music src="M1_punchy.mp3" vol={0.42} words={ws} end={dur} fadeOut={0.5} />
      <Sfx n="swoosh" at={w(7)} vol={0.4} rate={1.3} />
      <Sfx n="impact" at={w(11)} vol={0.45} rate={1.2} />
      {CUTS.slice(2).map(([wi], i) => <Sfx key={i} n="tick" at={w(wi)} vol={0.35} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

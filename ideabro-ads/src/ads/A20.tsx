import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, EndCard, Crop, fadeUp, popIn, clamp, eo, lerp} from '../lib';

// A20 · "Who is this for?" — six personas, Swiss grid, black on paper with one red accent
const P = [
  {t: 'D2C founders', d: 'Make your own launch, festive and sale ads without an agency.', m: ['studio/img/i46.jpg', 0, 0, 0.5, 1]},
  {t: 'Marketers', d: 'Feed Meta the volume of fresh creative it needs, every week.', m: ['studio/img/i45.jpg', 0.1, 0, 0.8, 1]},
  {t: 'Designers & creatives', d: 'Add photo and video production to the skills you already have.', m: ['studio/img/i49.jpg', 0, 0, 1, 1]},
  {t: 'Freelancers & agencies', d: 'Offer shoots, films and ad sets to clients at a fraction of the cost.', m: 'studio/v02.mp4'},
  {t: 'Content creators', d: 'Pitch brands with campaign-level work and new services.', m: ['studio/img/i38.jpg', 0, 0, 1, 1]},
  {t: 'Students', d: 'Build a portfolio that gets you hired in advertising.', m: ['studio/img/i50.jpg', 0, 0, 1, 1]},
] as any[];
const P0 = 1.4, PL = 1.75;
const GRID = P0 + P.length * PL;
const END = GRID + 2.4;
export const dur = END + 3.4;
const RED = '#E5484D';

const Thumb: React.FC<{m: any; at: number}> = ({m, at}) => (Array.isArray(m) ? <Crop src={m[0]} x={m[1]} y={m[2]} w={m[3]} h={m[4]} /> : <Media src={m} at={at} from={4} />);

export const A20: React.FC = () => {
  const {t} = useT();
  const k = Math.floor((t - P0) / PL);
  return (
    <AbsoluteFill style={{background: '#F4F2EE'}}>
      {/* swiss grid lines */}
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 2px, transparent 2px)', backgroundSize: '180px 100%'}} />
      <Win a={0} b={P0}>
        <div style={{position: 'absolute', top: 520, left: 70, right: 70, fontFamily: F.tight, fontWeight: 800, fontSize: 150, color: '#0b0b0b', lineHeight: 0.95, letterSpacing: '-0.045em', ...fadeUp(t, 0.05, 0.4)}}>
          Who is<br />this <span style={{color: RED}}>for?</span>
        </div>
      </Win>
      {k >= 0 && k < P.length && (
        <>
          <div style={{position: 'absolute', top: 290, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 30, color: '#0b0b0b'}}>
            <span>0{k + 1} / 06</span>
            <span style={{color: RED}}>●</span>
          </div>
          <div key={'h' + k} style={{position: 'absolute', top: 360, left: 70, right: 70, fontFamily: F.tight, fontWeight: 800, fontSize: 118, color: '#0b0b0b', lineHeight: 0.95, letterSpacing: '-0.045em', ...fadeUp(t, P0 + k * PL, 0.3, 40)}}>{P[k].t}</div>
          <div key={'d' + k} style={{position: 'absolute', top: 640, left: 70, right: 160, fontFamily: F.inter, fontWeight: 500, fontSize: 44, color: '#333', lineHeight: 1.25, ...fadeUp(t, P0 + k * PL + 0.12, 0.3, 20)}}>{P[k].d}</div>
          <div key={'m' + k} style={{position: 'absolute', top: 880, left: 70, right: 70, height: 760, overflow: 'hidden', clipPath: `inset(0 ${(1 - eo(clamp((t - P0 - k * PL - 0.1) / 0.4))) * 100}% 0 0)`}}>
            <div style={{width: '100%', height: '100%', transform: `scale(${lerp(1.06, 1, eo(clamp((t - P0 - k * PL) / PL)))})`}}><Thumb m={P[k].m} at={P0 + k * PL} /></div>
          </div>
        </>
      )}
      <Win a={GRID} b={END}>
        <AbsoluteFill style={{background: '#F4F2EE'}}>
          <div style={{position: 'absolute', top: 300, left: 70, right: 70, fontFamily: F.tight, fontWeight: 800, fontSize: 96, color: '#0b0b0b', letterSpacing: '-0.04em', lineHeight: 0.98, ...fadeUp(t, GRID)}}>
            Which one <span style={{color: RED}}>are you?</span>
          </div>
          {P.map((p, i) => (
            <div key={i} style={{position: 'absolute', left: 70 + (i % 2) * 480, top: 560 + Math.floor(i / 2) * 370, width: 460, height: 350, ...popIn(t, GRID + 0.15 + i * 0.07, 0.3)}}>
              <div style={{width: '100%', height: 270, overflow: 'hidden'}}><Thumb m={p.m} at={GRID} /></div>
              <div style={{fontFamily: F.tight, fontWeight: 700, fontSize: 32, color: '#0b0b0b', marginTop: 12, letterSpacing: '-0.02em'}}>{p.t}</div>
            </div>
          ))}
        </AbsoluteFill>
      </Win>
      <EndCard at={END} theme="light" sub="If you make ads, or want to, this course is for you." />
      <Grain o={0.03} />
      <Music src="M2_tick.mp3" offset={8} vol={0.6} end={dur} fadeOut={0.7} fadeIn={0.4} />
      {P.map((_, i) => <Sfx key={i} n="swoosh" at={P0 + i * PL - 0.06} vol={0.3} rate={1.1} />)}
      {P.map((_, i) => <Sfx key={'p' + i} n="pop" at={GRID + 0.15 + i * 0.07} vol={0.3} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

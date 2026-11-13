import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, KB, Win, Grain, Sfx, Music, EndCard, fadeUp, clamp, eo} from '../lib';

// A16 · "What our students say" — real quotes from the course page, glass quote cards
const Q = [
  {q: 'IdeaBro didn’t just teach me tools. It rewired how I think about ideas. My client work is now at a completely different level.', n: 'Aryan Sinha', r: 'Brand Designer', i: 'AS', bg: 'studio/v05.mp4', from: 6},
  {q: 'I went from copying trends to setting them. The cohort gave me the language and systems to lead creative direction with confidence.', n: 'Ketan Parikh', r: 'Content Creator', i: 'KP', bg: 'studio/v12.mp4', from: 0.5},
  {q: 'The way they blend taste, AI tools, and creative strategy is unlike anything in the market. This is the creative school the internet was missing.', n: 'Sonam Gautam', r: 'Freelancer & Studio Founder', i: 'SG', bg: 'studio/v14.mp4', from: 2},
];
const Q0 = 1.3, QL = 4.6;
const END = Q0 + Q.length * QL;
export const dur = END + 3.4;

export const A16: React.FC = () => {
  const {t} = useT();
  const k = Math.max(0, Math.min(Q.length - 1, Math.floor((t - Q0) / QL)));
  const a = Q0 + k * QL;
  const q = Q[k];
  const words = q.q.split(' ');
  return (
    <AbsoluteFill style={{background: '#0b0b0b'}}>
      <Win a={0} b={Q0}>
        <AbsoluteFill style={{background: '#F4F2EE', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 130, color: '#0b0b0b', textAlign: 'center', lineHeight: 1, ...fadeUp(t, 0.05, 0.4)}}>What our<br />students say</div>
        </AbsoluteFill>
      </Win>
      <Win a={Q0} b={END}>
        <KB key={k} src={q.bg} a={a} b={a + QL} from={q.from} z0={1.15} z1={1.22} style={{filter: 'blur(6px) brightness(0.55)'}} />
        <div key={'c' + k} style={{position: 'absolute', left: 60, right: 60, top: 420, padding: '70px 64px 60px', borderRadius: 40, background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(22px)', ...fadeUp(t, a, 0.4, 40)}}>
          <div style={{fontFamily: F.serif, fontSize: 220, lineHeight: 0.5, color: '#FFE14D', height: 90}}>“</div>
          <div style={{fontFamily: F.tight, fontWeight: 600, fontSize: 54, lineHeight: 1.22, color: '#fff', letterSpacing: '-0.015em'}}>
            {words.map((w, i) => (
              <span key={i} style={{opacity: clamp((t - a - 0.2 - i * 0.055) / 0.12) * 0.75 + 0.25}}>{w} </span>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 50}}>
            <div style={{width: 96, height: 96, borderRadius: 48, background: '#FFE14D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.tight, fontWeight: 800, fontSize: 36, color: '#111'}}>{q.i}</div>
            <div>
              <div style={{fontFamily: F.tight, fontWeight: 700, fontSize: 40, color: '#fff'}}>{q.n}</div>
              <div style={{fontFamily: F.inter, fontSize: 30, color: 'rgba(255,255,255,0.7)'}}>{q.r}</div>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
          {Q.map((_, i) => <div key={i} style={{width: i === k ? 60 : 18, height: 18, borderRadius: 9, background: i === k ? '#fff' : 'rgba(255,255,255,0.4)'}} />)}
        </div>
      </Win>
      <EndCard at={END} theme="light" sub="Taste, AI tools and creative strategy in one course." />
      <Grain o={0.04} />
      <Music src="M3_lux.mp3" offset={4} vol={0.5} end={dur} fadeOut={0.8} />
      {Q.map((_, i) => <Sfx key={i} n="swoosh" at={Q0 + i * QL - 0.06} vol={0.3} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

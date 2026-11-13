import React from 'react';
import {AbsoluteFill} from 'remotion';
import vo from '../data/vo/A14.json';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, Vo, EndCard, CapBoxed, voWords, fadeUp, eo, clamp, Crop, BigStack} from '../lib';

// A14 · "4 rules for AI ads that don't look like AI" — listicle, giant outlined numerals, boxed captions, VO
const AT = 0.3;
const ws = voWords('A14', AT, vo);
const w = (i: number) => ws[i].s - 0.1;
export const dur = AT + vo.dur + 0.5 + 3.4;
const END = AT + vo.dur + 0.5;
const RULES = [
  {n: '01', t: 'Art direction', a: 10, src: 'studio/v11.mp4', from: 1},
  {n: '02', t: 'Product accuracy', a: 19, src: 'studio/v10.mp4', from: 0.3},
  {n: '03', t: 'Brand consistency', a: 28, src: 'monday', from: 0},
  {n: '04', t: 'The human touch', a: 35, src: 'studio/v02.mp4', from: 4},
];

export const A14: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{background: '#0b0b0b'}}>
      <Win a={0} b={w(10)}>
        <KB src="studio/v14.mp4" a={0} b={w(10)} from={1} />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.5)'}} />
        <BigStack y={430} size={300} lines={[{t: '4 rules', at: 0.1, color: '#fff'}]} />
        <div style={{position: 'absolute', left: 74, top: 760, right: 74, fontFamily: F.tight, fontWeight: 700, fontSize: 64, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.08, ...fadeUp(t, 0.5)}}>
          for AI ads that don’t look like AI.
        </div>
      </Win>
      {RULES.map((r, k) => {
        const a = w(r.a), b = k + 1 < RULES.length ? w(RULES[k + 1].a) : w(39);
        const ina = eo(clamp((t - a) / 0.4));
        return (
          <Win key={k} a={a} b={b}>
            {r.src === 'monday' ? (
              <AbsoluteFill style={{background: '#EFE9DF'}}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{position: 'absolute', left: 40 + (i % 2) * 510, top: 520 + Math.floor(i / 2) * 640, width: 490, height: 620, borderRadius: 16, overflow: 'hidden', ...fadeUp(t, a + 0.1 + i * 0.1)}}>
                    <Crop src={['studio/img/i46.jpg', 'studio/img/i46.jpg', 'studio/img/i46.jpg', 'studio/img/i45.jpg'][i]} x={[0, 0.5, 0.5, 0.2][i]} y={[0, 0, 0.5, 0][i]} w={[0.5, 0.5, 0.5, 0.6][i]} h={[1, 0.5, 0.5, 1][i]} />
                  </div>
                ))}
              </AbsoluteFill>
            ) : (
              <KB src={r.src} a={a} b={b} from={r.from} />
            )}
            <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 32%, rgba(0,0,0,0) 50%)'}} />
            <div style={{position: 'absolute', left: 66, top: 250, fontFamily: F.anton, fontSize: 250, lineHeight: 1, color: 'transparent', WebkitTextStroke: '4px #fff', opacity: ina, transform: `translateX(${(1 - ina) * -60}px)`}}>{r.n}</div>
            <div style={{position: 'absolute', left: 74, top: 520, fontFamily: F.tight, fontWeight: 800, fontSize: 84, color: '#fff', letterSpacing: '-0.03em', ...fadeUp(t, a + 0.15)}}>{r.t}</div>
          </Win>
        );
      })}
      <Win a={w(39)} b={END}>
        <AbsoluteFill style={{background: '#F4F2EE'}} />
        <BigStack y={720} size={200} align="center" color="#0b0b0b" lines={[{t: 'Learn', at: w(39)}, {t: 'all four.', at: w(40)}]} />
      </Win>
      <Win a={w(10)} b={w(39)}>
        <CapBoxed words={ws.slice(10, 39)} y={0.62} maxChars={24} size={52} />
      </Win>
      <EndCard at={END} theme="light" sub="Art direction, product accuracy, brand consistency, the human touch." />
      <Grain o={0.04} />
      <Vo id="A14" at={AT} />
      <Music src="M3_lux.mp3" vol={0.45} words={ws} end={Math.min(dur, 24)} fadeOut={1} />
      {RULES.map((r, i) => <Sfx key={i} n="impact" at={w(r.a)} vol={0.3} rate={1.3} />)}
      <Sfx n="stamp" at={w(39)} vol={0.5} />
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import vo from '../data/vo/A04.json';
import {F, W, H, useT, Media, KB, Win, Grain, Vignette, Sfx, Music, Vo, EndCard, CapSerif, voWords, rnd, prog, lerp, SAFE} from '../lib';

// A04 · Manifesto: "Anyone can press generate. Few can direct." — editorial serif, black, deep VO
const AT = 0.4;
const ws = voWords('A04', AT, vo);
const w = (i: number) => ws[i].s - 0.1;
export const dur = AT + vo.dur + 0.5 + 3.4;
const END = AT + vo.dur + 0.5;

const SHOTS: [number, string, number][] = [
  // [startWordIndex, src, fromSec]
  [4, 'studio/v13.mp4', 13], [7, 'studio/v03.mp4', 20], [11, 'studio/v09.mp4', 2.5],
  [15, 'studio/v11.mp4', 1], [16, 'studio/v12.mp4', 0.5], [17, 'studio/v08.mp4', 0.3], [18, 'studio/img/i24.jpg', 0], [19, 'studio/v01.mp4', 3.5],
];
const GEN = SAFE;

export const A04: React.FC = () => {
  const {t, f} = useT();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* "anyone can press generate": a flicker of interchangeable images, desaturated and soft */}
      <Win a={0} b={w(4)}>
        <AbsoluteFill style={{opacity: 0.38, filter: 'grayscale(0.85) blur(2px) contrast(0.9)'}}>
          {Array.from({length: 12}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: (i % 3) * 360, top: Math.floor(i / 3) * 480, width: 360, height: 480, overflow: 'hidden'}}>
              <Media src={GEN[Math.floor(rnd(i * 13 + Math.floor(f / 3)) * GEN.length)]} />
            </div>
          ))}
        </AbsoluteFill>
      </Win>
      {SHOTS.map(([wi, src, from], k) => {
        const a = w(wi), b = k + 1 < SHOTS.length ? w(SHOTS[k + 1][0]) : END;
        return (
          <Win key={k} a={a} b={b}>
            <KB src={src} a={a} b={b} from={from} z0={1.02} z1={1.1} />
            <AbsoluteFill style={{background: 'rgba(0,0,0,0.32)'}} />
          </Win>
        );
      })}
      <Vignette o={0.6} />
      <CapSerif words={ws.slice(0, 24)} y={0.46} maxChars={16} size={128} />
      <Win a={w(24)} b={END}>
        <AbsoluteFill style={{background: '#000', opacity: Math.min(1, (t - w(24)) / 0.25)}} />
        <CapSerif words={ws.slice(24)} y={0.46} size={140} />
      </Win>
      <EndCard at={END} theme="dark" sub="Learn to direct AI, not just prompt it." />
      <Grain o={0.08} />
      <Vo id="A04" at={AT} />
      <Music src="bed_v2.mp3" offset={24} vol={0.55} words={ws} end={dur} fadeOut={0.8} />
      <Sfx n="impact" at={w(4)} vol={0.5} />
      {SHOTS.slice(3).map(([wi], i) => <Sfx key={i} n="tick" at={w(wi)} vol={0.5} rate={0.9 + i * 0.05} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

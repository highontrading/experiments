import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F, W, H, useT, KB, Win, Grain, Sfx, Music, EndCard, CapGlitch, fadeUp, popIn, clamp, eo, rnd, lerp, SAFE, Word} from '../lib';

// A19 · "Feeds are full of AI ads that all look the same" — glitch captions over degraded sameness, then clean direction
const CLEAN = 8.7;
const G: Word[] = [
  {w: 'Feeds', s: 0.3, e: 0.6}, {w: 'are', s: 0.6, e: 0.8}, {w: 'full', s: 0.8, e: 1.0}, {w: 'of', s: 1.0, e: 1.1}, {w: 'AI', s: 1.1, e: 1.4}, {w: 'ads.', s: 1.4, e: 2.4},
  {w: 'They', s: 2.5, e: 2.8}, {w: 'all', s: 2.8, e: 3.1}, {w: 'look', s: 3.1, e: 3.4}, {w: 'the', s: 3.4, e: 3.5}, {w: 'same.', s: 3.5, e: 4.6},
  {w: 'Same', s: 4.7, e: 5.0}, {w: 'glow.', s: 5.0, e: 5.8}, {w: 'Same', s: 5.9, e: 6.2}, {w: 'faces.', s: 6.2, e: 7.0}, {w: 'Same', s: 7.1, e: 7.4}, {w: 'scroll.', s: 7.4, e: 8.6},
];
const SHOTS: [string, number, string][] = [['drive/d13.mp4', 7, 'light'], ['studio/v13.mp4', 13, 'styling'], ['drive/d20.mp4', 9, 'composition'], ['studio/v11.mp4', 1, 'restraint']];
const S0 = CLEAN + 1.7, SL = 1.1;
const LINE = S0 + SHOTS.length * SL;
const END = LINE + 2.0;
export const dur = END + 3.4;

export const A19: React.FC = () => {
  const {t, f} = useT();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Win a={0} b={CLEAN}>
        <AbsoluteFill style={{filter: `saturate(2.2) contrast(1.25) hue-rotate(${(rnd(Math.floor(f / 4)) - 0.5) * 40}deg)`}}>
          {Array.from({length: 15}).map((_, i) => {
            const src = SAFE[Math.floor(rnd(i * 7 + Math.floor(f / 5)) * SAFE.length)];
            const jx = rnd(f + i) > 0.92 ? (rnd(f * i) - 0.5) * 60 : 0;
            return (
              <div key={i} style={{position: 'absolute', left: (i % 3) * 360 + jx, top: Math.floor(i / 3) * 384, width: 360, height: 384, overflow: 'hidden', imageRendering: 'pixelated' as any}}>
                <Img src={staticFile(src)} style={{width: 40, height: 43, transform: 'scale(9)', transformOrigin: '0 0', objectFit: 'cover', imageRendering: 'pixelated' as any}} />
              </div>
            );
          })}
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 6px)'}} />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)'}} />
        {rnd(f * 1.3) > 0.88 && <AbsoluteFill style={{background: rnd(f) > 0.5 ? 'rgba(255,0,80,0.18)' : 'rgba(0,230,255,0.15)', transform: `translateY(${(rnd(f * 3) - 0.5) * 300}px)`, height: 220}} />}
        <CapGlitch words={G} y={0.48} maxChars={14} size={110} />
      </Win>
      <Win a={CLEAN} b={S0}>
        <AbsoluteFill style={{background: '#F4F2EE', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 120, color: '#0b0b0b', textAlign: 'center', lineHeight: 1, ...fadeUp(t, CLEAN + 0.1, 0.5)}}>
            This is what<br />direction looks like.
          </div>
        </AbsoluteFill>
      </Win>
      {SHOTS.map(([src, from, lab], i) => (
        <Win key={i} a={S0 + i * SL} b={S0 + (i + 1) * SL}>
          <KB src={src} a={S0 + i * SL} b={S0 + (i + 1) * SL} from={from} z0={1.0} z1={1.06} />
          <div style={{position: 'absolute', top: 300, left: 70, fontFamily: F.mono, fontSize: 32, color: '#fff', background: 'rgba(0,0,0,0.45)', padding: '8px 18px', borderRadius: 6, ...fadeUp(t, S0 + i * SL + 0.05, 0.2)}}>0{i + 1} · {lab}</div>
        </Win>
      ))}
      <Win a={LINE} b={END}>
        <AbsoluteFill style={{background: '#F4F2EE', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.tight, fontWeight: 800, fontSize: 112, color: '#0b0b0b', textAlign: 'center', lineHeight: 0.96, letterSpacing: '-0.045em'}}>
            <div style={fadeUp(t, LINE + 0.05)}>Don’t add</div>
            <div style={fadeUp(t, LINE + 0.25)}>to the noise.</div>
            <div style={{...fadeUp(t, LINE + 0.7), fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 150, letterSpacing: 0, marginTop: 10}}>Direct it.</div>
          </div>
        </AbsoluteFill>
      </Win>
      <EndCard at={END} theme="light" sub="AI ads that look shot, not generated." />
      <Grain o={0.05} />
      <Music src="M6_glitch.mp3" vol={0.7} end={dur} fadeOut={1} />
      {G.filter((_, i) => i % 3 === 0).map((w, i) => <Sfx key={i} n="glitch" at={w.s} vol={0.45} rate={0.9 + i * 0.07} />)}
      <Sfx n="swoosh" at={CLEAN - 0.05} vol={0.4} />
      {SHOTS.map((_, i) => <Sfx key={'s' + i} n="tick" at={S0 + i * SL} vol={0.45} />)}
      <Sfx n="stamp" at={LINE + 0.7} vol={0.4} />
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

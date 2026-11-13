import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, KB, Win, Grain, Sfx, Music, EndCard, fadeUp, popIn, clamp, eo, lerp} from '../lib';

// A18 · "POV: you're the director now" — camera viewfinder HUD over studio shots
const SHOTS: [string, number, string][] = [
  ['drive/d15.mp4', 4, 'No crew.'],
  ['drive/d18.mp4', 4.5, 'No location scout.'],
  ['drive/d20.mp4', 5, 'No reshoots.'],
  ['drive/d19.mp4', 2, 'Just your taste.'],
  ['drive/d12.mp4', 7, 'Every take,'],
  ['drive/d14.mp4', 7.5, 'a keeper.'],
];
const S0 = 2.0, SL = 1.7;
const OUT = S0 + SHOTS.length * SL;
const END = OUT + 0.2;
export const dur = END + 3.4;

const tc = (t: number) => {
  const s = Math.floor(t), fr = Math.floor((t - s) * 24);
  return `00:00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
};

export const A18: React.FC = () => {
  const {t, f} = useT();
  const k = Math.floor((t - S0) / SL);
  const sh = SHOTS[Math.max(0, Math.min(SHOTS.length - 1, k))];
  const a = S0 + Math.max(0, k) * SL;
  const cut = t >= S0 && t - a < 0.07;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Win a={0} b={S0}>
        <KB src="stock/b_camera-op-neon-set.mp4" a={0} b={S0} z0={1.05} z1={1.12} style={{filter: 'brightness(0.6)'}} />
      </Win>
      {t >= S0 && t < OUT && (
        <AbsoluteFill key={k}>
          <KB src={sh[0]} a={a} b={a + SL} from={sh[1]} z0={1.3} z1={1.35} style={{filter: 'blur(26px) brightness(0.45)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 960 - 470, height: 940, overflow: 'hidden'}}>
            <KB src={sh[0]} a={a} b={a + SL} from={sh[1]} z0={1.0} z1={1.06} />
          </div>
        </AbsoluteFill>
      )}
      {t < OUT && (
        <>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
          {/* corner brackets */}
          {[[60, 260, 0], [W - 60, 260, 90], [W - 60, 1660, 180], [60, 1660, 270]].map(([x, y, r], i) => (
            <div key={i} style={{position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120, transform: `rotate(${r}deg)`}}>
              <div style={{position: 'absolute', left: 60, top: 60, width: 70, height: 5, background: '#fff'}} />
              <div style={{position: 'absolute', left: 60, top: 60, width: 5, height: 70, background: '#fff'}} />
            </div>
          ))}
          <div style={{position: 'absolute', top: 300, left: 110, display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.mono, fontSize: 34, color: '#fff'}}>
            <div style={{width: 26, height: 26, borderRadius: 13, background: '#ff3b30', opacity: f % 30 < 18 ? 1 : 0.2}} /> REC
          </div>
          <div style={{position: 'absolute', top: 300, right: 110, fontFamily: F.mono, fontSize: 34, color: '#fff'}}>{tc(t)}</div>
          <div style={{position: 'absolute', top: 360, left: 110, fontFamily: F.mono, fontSize: 26, color: 'rgba(255,255,255,0.8)'}}>{t >= S0 ? `SCENE 0${Math.min(6, k + 1)} · TAKE 01` : 'STANDBY'}</div>
          {/* focus square */}
          <div style={{position: 'absolute', left: W / 2 - 110, top: 820 - 110, width: 220, height: 220, border: '3px solid rgba(255,255,255,0.85)', transform: `scale(${t >= S0 ? lerp(1.25, 1, eo(clamp((t - a) / 0.3))) : 1})`}} />
          <div style={{position: 'absolute', top: 1500, left: 110, right: 110, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 28, color: '#fff'}}>
            <span>ISO 400</span><span>1/50</span><span>f/2.8</span><span>4K · 24p</span><span style={{color: '#FFE14D'}}>AI</span>
          </div>
          {/* battery */}
          <div style={{position: 'absolute', top: 362, right: 110, width: 70, height: 30, border: '3px solid #fff', borderRadius: 5, padding: 3}}><div style={{width: '80%', height: '100%', background: '#fff'}} /></div>
        </>
      )}
      <Win a={0} b={S0}>
        <div style={{position: 'absolute', top: 1010, left: 80, right: 80, textAlign: 'center', fontFamily: F.tight, fontWeight: 800, fontSize: 104, color: '#fff', lineHeight: 0.98, letterSpacing: '-0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.5)'}}>
          <div style={fadeUp(t, 0.1)}>POV:</div>
          <div style={fadeUp(t, 0.45)}>you’re the director now.</div>
        </div>
      </Win>
      {t >= S0 && t < OUT && (
        <div key={'l' + k} style={{position: 'absolute', top: 1060, left: 80, right: 80, textAlign: 'center', fontFamily: F.tight, fontWeight: 800, fontSize: 96, color: '#fff', letterSpacing: '-0.035em', textShadow: '0 4px 30px rgba(0,0,0,0.55)', ...popIn(t, a + 0.05, 0.25)}}>{sh[2]}</div>
      )}
      {cut && <AbsoluteFill style={{background: '#fff', opacity: 0.7}} />}
      <EndCard at={END} theme="dark" sub="No crew, no location, no reshoots. Just you, directing." />
      <Grain o={0.06} />
      <Music src="bed_v3.mp3" offset={40} vol={0.7} end={dur} fadeOut={0.7} fadeIn={0.2} />
      <Sfx n="rec" at={0.15} vol={0.6} />
      {SHOTS.map((_, i) => <Sfx key={i} n="tick" at={S0 + i * SL} vol={0.6} rate={0.8} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

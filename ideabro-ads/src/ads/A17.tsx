import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, Win, Grain, Sfx, Music, EndCard, fadeUp, popIn, clamp, eo, lerp, SAFE} from '../lib';

// A17 · Launch price: $99 → $29, yellow/black sale type (Bebas), inclusions tick in
const INC = ['11 modules · 41 lessons', 'Product, model, video, sound, UGC & Meta ad workflows', 'Prompt library for ad photos and video', 'Brief, storyboard & campaign templates', 'Capstone campaign for your portfolio', 'Lifetime access + every future update'];
const STRIKE = 1.5, SLAM = 2.2, LIST = 3.6, LI = 0.62;
const LINE = LIST + INC.length * LI + 0.6;
const END = LINE + 1.6;
export const dur = END + 3.2;

export const A17: React.FC = () => {
  const {t} = useT();
  const strike = eo(clamp((t - STRIKE) / 0.3));
  const slam = clamp((t - SLAM) / 0.18);
  const toList = eo(clamp((t - (LIST - 0.3)) / 0.4));
  return (
    <AbsoluteFill style={{background: '#FFE14D'}}>
      {/* moving strip of studio work */}
      <div style={{position: 'absolute', top: 1560, left: 0, display: 'flex', gap: 18, transform: `translateX(${-t * 160}px)`}}>
        {[...SAFE, ...SAFE].slice(0, 22).map((s, i) => (
          <div key={i} style={{width: 260, height: 340, borderRadius: 16, overflow: 'hidden', flex: 'none'}}><Media src={s} /></div>
        ))}
      </div>
      <Win a={0} b={END}>
        <div style={{position: 'absolute', top: 270, left: 70, fontFamily: F.bebas, fontSize: 72, color: '#0b0b0b', letterSpacing: '0.04em', whiteSpace: 'nowrap', ...fadeUp(t, 0.05)}}>LAUNCH PRICE · AI & ADVERTISING</div>
        <div style={{position: 'absolute', top: lerp(400, 390, toList), left: 70, fontFamily: F.bebas, color: '#0b0b0b', lineHeight: 0.86, transform: `scale(${lerp(1, 0.55, toList)})`, transformOrigin: 'left top'}}>
          <div style={{position: 'relative', fontSize: 380, opacity: lerp(1, 0.45, slam), ...popIn(t, 0.25, 0.3)}}>
            $99
            <div style={{position: 'absolute', left: -10, top: '48%', height: 30, width: `${strike * 104}%`, background: '#E5484D', transform: 'rotate(-8deg)'}} />
          </div>
          {t >= SLAM && <div style={{fontSize: 520, transform: `scale(${lerp(2.2, 1, eo(slam))})`, transformOrigin: 'left center', opacity: slam}}>$29</div>}
        </div>
        {t >= SLAM && (
          <div style={{position: 'absolute', top: lerp(1250, 905, toList), left: 70, fontFamily: F.bebas, fontSize: 96, color: '#0b0b0b', background: '#0b0b0b', ...fadeUp(t, SLAM + 0.2)}}>
            <span style={{color: '#FFE14D', padding: '0 24px'}}>70% OFF · ONE-TIME</span>
          </div>
        )}
        <div style={{position: 'absolute', top: 1040, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 16}}>
          {INC.map((s, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(t, LIST + i * LI, 0.25, 20)}}>
              <div style={{width: 46, height: 46, borderRadius: 23, background: '#0b0b0b', color: '#FFE14D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.tight, fontWeight: 800, fontSize: 30, flex: 'none'}}>✓</div>
              <span style={{fontFamily: F.tight, fontWeight: 700, fontSize: 40, color: '#0b0b0b', letterSpacing: '-0.015em', lineHeight: 1.1}}>{s}</span>
            </div>
          ))}
        </div>
        <Win a={LINE} b={END}>
          <AbsoluteFill style={{background: '#0b0b0b', alignItems: 'center', justifyContent: 'center', opacity: clamp((t - LINE) / 0.15)}}>
            <div style={{fontFamily: F.bebas, fontSize: 170, color: '#FFE14D', textAlign: 'center', lineHeight: 0.92, ...popIn(t, LINE + 0.05, 0.3)}}>Shoot-quality ads,<br /><span style={{color: '#fff'}}>without the shoot.</span></div>
          </AbsoluteFill>
        </Win>
      </Win>
      <EndCard at={END} theme="yellow" sub="One payment. Lifetime access. Every future update." />
      <Grain o={0.035} />
      <Music src="M1_punchy.mp3" vol={0.75} end={dur} fadeOut={0.4} />
      <Sfx n="swoosh" at={STRIKE} vol={0.6} rate={1.3} />
      <Sfx n="impact" at={SLAM} vol={0.7} />
      <Sfx n="cash" at={SLAM + 0.1} vol={0.5} />
      {INC.map((_, i) => <Sfx key={i} n="tick" at={LIST + i * LI} vol={0.5} rate={1 + i * 0.05} />)}
      <Sfx n="impact" at={LINE} vol={0.35} rate={1.25} />
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

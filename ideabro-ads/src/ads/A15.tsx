import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, KB, Win, Grain, Sfx, Music, EndCard, fadeUp, clamp, eo, eio, prog, lerp} from '../lib';

// A15 · Luxury editorial: three magazine covers, all made with AI (serif masthead, cover lines)
const COVERS = [
  {src: 'studio/img/i27.jpg', kicker: 'THE AI ISSUE', line: 'Luxury editorials, without the editorial budget.', no: '01'},
  {src: 'studio/img/i01.jpg', kicker: 'COUTURE, DIRECTED', line: 'Consistent models, outfits and poses for every look.', no: '02'},
  {src: 'studio/img/i24.jpg', kicker: 'FINE JEWELLERY', line: 'Macro detail that still sells the real product.', no: '03'},
];
const CL = 3.9;
const OUT = COVERS.length * CL;
const END = OUT + 2.4;
export const dur = END + 3.4;

export const A15: React.FC = () => {
  const {t} = useT();
  const i = Math.min(COVERS.length - 1, Math.floor(t / CL));
  const a = i * CL;
  const c = COVERS[i];
  const flip = i > 0 ? eio(clamp((t - a) / 0.45)) : 1;
  return (
    <AbsoluteFill style={{background: '#0c0b0a', perspective: 2400}}>
      <Win a={0} b={OUT}>
        <AbsoluteFill style={{transformOrigin: 'left center', transform: `rotateY(${(1 - flip) * -70}deg)`, opacity: lerp(0.4, 1, flip)}}>
          <KB key={i} src={c.src} a={a} b={a + CL} z0={1.02} z1={1.09} />
          <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 80%)'}} />
          <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', fontFamily: F.corm, fontWeight: 600, fontSize: 176, letterSpacing: '0.035em', color: '#fff', lineHeight: 1}}>IDEABRO</div>
          <div style={{position: 'absolute', top: 480, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', fontFamily: F.inter, fontWeight: 500, fontSize: 24, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.85)'}}>
            <span>NO. {c.no}</span>
            <span>MADE WITH AI</span>
            <span>2026</span>
          </div>
          <div style={{position: 'absolute', left: 70, right: 200, top: 880, ...fadeUp(t, a + 0.35, 0.4)}}>
            <div style={{fontFamily: F.inter, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', color: '#fff'}}>{c.kicker}</div>
            <div style={{fontFamily: F.corm, fontStyle: 'italic', fontWeight: 600, fontSize: 76, lineHeight: 1.02, color: '#fff', marginTop: 14}}>{c.line}</div>
          </div>
        </AbsoluteFill>
      </Win>
      <Win a={OUT} b={END}>
        <AbsoluteFill style={{background: '#0c0b0a', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{textAlign: 'center', fontFamily: F.corm, fontStyle: 'italic', fontWeight: 600, fontSize: 104, color: '#F3EBDD', lineHeight: 1.02, ...fadeUp(t, OUT + 0.1, 0.5)}}>
            Every cover here
            <br />
            was made with AI.
          </div>
          <div style={{marginTop: 40, fontFamily: F.inter, fontWeight: 600, fontSize: 30, letterSpacing: '0.24em', color: 'rgba(243,235,221,0.7)', ...fadeUp(t, OUT + 0.7, 0.4)}}>DIRECTED, NOT GENERATED</div>
        </AbsoluteFill>
      </Win>
      <EndCard at={END} theme="paper" sub="Luxury editorials and lookbooks, made with AI and directed by you." />
      <Grain o={0.05} />
      <Music src="M3_lux.mp3" vol={0.6} end={dur} fadeOut={0.8} />
      {COVERS.map((_, k) => <Sfx key={k} n="swoosh" at={k * CL - 0.05} vol={k ? 0.35 : 0.2} rate={0.8} />)}
      <Sfx n="ui" at={END} vol={0.45} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, EndCard, Typed, fadeUp, popIn, clamp, eo, prog, lerp} from '../lib';

// A03 · "From a brief at midnight to a live ad by morning" — six steps from the site, HUD clock, terminal captions
const STEPS = [
  {n: '01', k: 'Brief', time: '11:58 PM', line: 'Read the brief. Find the audience. Pick the angle.', img: 'studio/img/i48.jpg'},
  {n: '02', k: 'Concept', time: '12:41 AM', line: 'Hero, post-workout, breakfast. One idea, many frames.', img: 'studio/img/i49.jpg'},
  {n: '03', k: 'Visuals', time: '02:15 AM', line: 'Studio packshots from one product photo.', img: 'studio/img/i46.jpg'},
  {n: '04', k: 'Motion', time: '03:47 AM', line: 'Stills into scroll-stopping video.', img: 'studio/img/i47.jpg'},
  {n: '05', k: 'Edit', time: '05:20 AM', line: 'Cut, caption, end card. Every ratio.', img: 'studio/img/i50.jpg'},
  {n: '06', k: 'Launch', time: '06:58 AM', line: 'Live on Meta before the first coffee.', img: 'studio/img/i45.jpg'},
];
const S0 = 2.8, SL = 2.1;
const OUT = S0 + STEPS.length * SL;
const END = OUT + 2.2;
export const dur = END + 3.4;

const sky = (p: number) => {
  // night -> dawn
  const c0 = [6, 8, 18], c1 = [242, 176, 120];
  const m = (i: number) => Math.round(lerp(c0[i], c1[i], p));
  return `rgb(${m(0)},${m(1)},${m(2)})`;
};

export const A03: React.FC = () => {
  const {t, f} = useT();
  const k = Math.max(0, Math.min(STEPS.length - 1, Math.floor((t - S0) / SL)));
  const s = STEPS[k];
  const a = S0 + k * SL;
  const dawn = clamp((t - S0) / (OUT - S0));
  return (
    <AbsoluteFill style={{background: `linear-gradient(to bottom, ${sky(dawn * 0.6)} 0%, ${sky(dawn)} 100%)`}}>
      <Win a={0} b={S0}>
        <KB src="stock/d_night-office-desk.mp4" a={0} b={S0} z0={1.0} z1={1.08} style={{filter: 'brightness(0.55)'}} />
        <div style={{position: 'absolute', top: 560, left: 70, right: 70, fontFamily: F.tight, fontWeight: 800, fontSize: 104, color: '#fff', lineHeight: 0.98, letterSpacing: '-0.04em'}}>
          <div style={fadeUp(t, 0.1)}>From a brief</div>
          <div style={fadeUp(t, 0.35)}>at midnight</div>
          <div style={{...fadeUp(t, 1.2), color: '#FFC978'}}>to a live ad</div>
          <div style={{...fadeUp(t, 1.45), color: '#FFC978'}}>by morning.</div>
        </div>
      </Win>
      {t >= S0 && t < OUT && (
        <>
          {/* HUD clock */}
          <div style={{position: 'absolute', top: 280, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <span key={k} style={{fontFamily: F.mono, fontWeight: 500, fontSize: 92, color: '#fff', letterSpacing: '-0.02em', ...fadeUp(t, a, 0.2, 14)}}>{s.time}</span>
            <span style={{fontFamily: F.mono, fontSize: 30, color: 'rgba(255,255,255,0.7)'}}>{s.n} / 06</span>
          </div>
          {/* progress */}
          <div style={{position: 'absolute', top: 400, left: 70, right: 70, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3}}>
            <div style={{width: `${((t - S0) / (OUT - S0)) * 100}%`, height: '100%', background: '#FFC978', borderRadius: 3}} />
          </div>
          <div key={'c' + k} style={{position: 'absolute', top: 460, left: 70, right: 70, height: 640, borderRadius: 26, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', ...popIn(t, a, 0.3)}}>
            <div style={{width: '100%', height: '100%', transform: `scale(${lerp(1.0, 1.08, prog(t, a, a + SL))})`}}><Media src={s.img} /></div>
          </div>
          <div key={'k' + k} style={{position: 'absolute', top: 1140, left: 70, right: 70}}>
            <div style={{fontFamily: F.tight, fontWeight: 800, fontSize: 84, color: '#fff', letterSpacing: '-0.035em', ...fadeUp(t, a + 0.1, 0.25)}}>{s.k}</div>
            <div style={{marginTop: 10, fontSize: 38, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3}}>
              <Typed text={`> ${s.line}`} at={a + 0.25} cps={48} />
            </div>
          </div>
        </>
      )}
      <Win a={OUT} b={END}>
        <KB src="stock/j_sunrise-city-skyline.mp4" a={OUT} b={END} z0={1.0} z1={1.08} />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)'}} />
        <div style={{position: 'absolute', top: 620, left: 70, right: 70, fontFamily: F.tight, fontWeight: 800, fontSize: 100, color: '#fff', lineHeight: 0.98, letterSpacing: '-0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.35)'}}>
          <div style={fadeUp(t, OUT + 0.1)}>One night.</div>
          <div style={fadeUp(t, OUT + 0.4)}>One campaign.</div>
          <div style={{...fadeUp(t, OUT + 0.9), fontFamily: F.mono, fontWeight: 500, fontSize: 40, letterSpacing: 0, marginTop: 30}}>The whole workflow, in 11 modules.</div>
        </div>
      </Win>
      <EndCard at={END} theme="dark" sub="From a brief at midnight to a live ad by morning." />
      <Grain o={0.05} />
      <Music src="M2_tick.mp3" vol={0.75} end={dur} fadeOut={0.7} fadeIn={0.2} />
      <Sfx n="tick" at={0.1} vol={0.5} />
      {STEPS.map((_, i) => (
        <React.Fragment key={i}>
          <Sfx n="beep" at={S0 + i * SL} vol={0.3} rate={0.9 + i * 0.05} />
          <Sfx n="typing" at={S0 + i * SL + 0.25} vol={0.22} />
        </React.Fragment>
      ))}
      <Sfx n="chime" at={OUT} vol={0.35} />
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

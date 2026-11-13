import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, Win, Grain, Sfx, Music, EndCard, Crop, fadeUp, clamp, eo, prog, lerp} from '../lib';

// A12 · The curriculum as an album: "AI & Advertising — The Complete Sessions" (vinyl, tracklist type)
const SIDES = [
  {s: 'SIDE A', n: 'The Image', art: ['studio/img/i46.jpg', 0, 0, 0.5, 1], tracks: [['01', 'AI in advertising: the new playbook', 4], ['02', 'Briefs, strategy and the big idea', 4], ['03', 'AI product photography', 4], ['04', 'Models, styling and virtual sets', 4]]},
  {s: 'SIDE B', n: 'Motion & Sound', art: 'studio/v14.mp4', tracks: [['05', 'AI video ads and campaign films', 4], ['06', 'Sound, voice and music', 4], ['07', 'AI UGC and brand ambassadors', 3]]},
  {s: 'SIDE C', n: 'The Agency Standard', art: ['studio/img/i45.jpg', 0.1, 0, 0.8, 1], tracks: [['08', 'Meta ads: statics, variations, testing', 4], ['09', 'Editing, end cards and brand kits', 4], ['10', 'Hybrid ads: real shoot + AI', 3], ['11', 'Capstone: your full campaign', 3]]},
] as any[];
const S0 = 1.2, TR = 1.05;
const starts: number[] = [];
let acc = S0;
SIDES.forEach((sd) => { starts.push(acc); acc += 0.5 + sd.tracks.length * TR; });
const END = acc + 0.8;
export const dur = END + 3.4;

export const A12: React.FC = () => {
  const {t} = useT();
  const si = Math.max(0, starts.filter((s) => t >= s).length - 1);
  const sd = SIDES[si];
  const a = starts[si];
  const rot = t * 200;
  const pull = eo(clamp((t - 0.2) / 0.7));
  return (
    <AbsoluteFill style={{background: '#14110F'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(255,214,140,0.12), rgba(0,0,0,0) 60%)'}} />
      {/* record */}
      <div style={{position: 'absolute', left: 170 + pull * 230, top: 300, width: 620, height: 620, borderRadius: '50%', background: 'repeating-radial-gradient(circle, #0d0d0d 0px, #0d0d0d 3px, #1d1d1d 4px, #0d0d0d 6px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', transform: `rotate(${rot}deg)`}}>
        <div style={{position: 'absolute', left: 210, top: 210, width: 200, height: 200, borderRadius: '50%', background: '#FFE14D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.tight, fontWeight: 800, fontSize: 26, color: '#111', textAlign: 'center', lineHeight: 1.05}}>IDEABRO<br />STUDIO</div>
        <div style={{position: 'absolute', left: 300, top: 300, width: 20, height: 20, borderRadius: 10, background: '#14110F'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 30deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 20%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 70%)'}} />
      </div>
      {/* sleeve */}
      <div style={{position: 'absolute', left: 90, top: 300, width: 620, height: 620, boxShadow: '0 30px 70px rgba(0,0,0,0.6)', overflow: 'hidden', background: '#000'}}>
        {Array.isArray(sd.art) ? <Crop src={sd.art[0]} x={sd.art[1]} y={sd.art[2]} w={sd.art[3]} h={sd.art[4]} /> : <Media src={sd.art} at={a} from={1} />}
        <div style={{position: 'absolute', left: 30, bottom: 26, fontFamily: F.tight, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 2px 14px rgba(0,0,0,0.6)'}}>AI & Advertising</div>
      </div>
      <div style={{position: 'absolute', left: 90, top: 960, right: 90}}>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.1em', color: '#FFE14D', ...fadeUp(t, 0.3)}}>THE COMPLETE SESSIONS · 11 TRACKS · 41 LESSONS</div>
        <div key={si} style={{marginTop: 34, display: 'flex', alignItems: 'baseline', gap: 22, ...fadeUp(t, a, 0.3)}}>
          <span style={{fontFamily: F.mono, fontSize: 30, color: 'rgba(255,255,255,0.55)'}}>{sd.s}</span>
          <span style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 72, color: '#fff'}}>{sd.n}</span>
        </div>
        <div style={{marginTop: 22, borderTop: '2px solid rgba(255,255,255,0.15)'}}>
          {sd.tracks.map(([n, name, l]: any, i: number) => {
            const ta = a + 0.5 + i * TR;
            const on = t >= ta && t < ta + TR;
            return (
              <div key={n} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '18px 0', borderBottom: '2px solid rgba(255,255,255,0.1)', ...fadeUp(t, a + 0.15 + i * 0.08, 0.3, 14)}}>
                <span style={{fontFamily: F.mono, fontSize: 30, color: on ? '#FFE14D' : 'rgba(255,255,255,0.45)', width: 60}}>{n}</span>
                <span style={{flex: 1, fontFamily: F.tight, fontWeight: on ? 700 : 500, fontSize: 40, color: on ? '#fff' : 'rgba(255,255,255,0.72)', letterSpacing: '-0.015em'}}>{name}</span>
                <span style={{fontFamily: F.mono, fontSize: 26, color: 'rgba(255,255,255,0.45)'}}>{l} lessons</span>
              </div>
            );
          })}
        </div>
      </div>
      <EndCard at={END} theme="dark" sub="11 modules · 41 lessons · self-paced · lifetime access" />
      <Grain o={0.07} />
      <Music src="M8_vinyl.mp3" vol={0.6} end={dur} fadeOut={0.7} />
      <Sfx n="needle" at={0.15} vol={0.6} />
      {starts.map((s, i) => <Sfx key={i} n="needle" at={s} vol={0.25} rate={1.1} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

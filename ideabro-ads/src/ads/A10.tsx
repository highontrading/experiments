import React from 'react';
import {AbsoluteFill} from 'remotion';
import vo from '../data/vo/A10.json';
import {F, W, H, useT, Media, Win, Grain, Sfx, Music, Vo, EndCard, CapMarker, voWords, Crop, popIn, clamp, eo, rnd} from '../lib';

// A10 · Hinglish · Students: "Portfolio khaali hai?" — paper scrapbook, taped polaroids, marker captions, Jeet VO
const AT = 0.3;
const ws = voWords('A10', AT, vo);
const w = (i: number) => ws[i].s - 0.08;
export const dur = AT + vo.dur + 0.7 + 3.4;
const END = AT + vo.dur + 0.7;

const Polaroid: React.FC<{x: number; y: number; w: number; h: number; r: number; at: number; children: React.ReactNode; label?: string}> = ({x, y, w: pw, h, r, at, children, label}) => {
  const {t} = useT();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: pw, height: h + (label ? 90 : 30), background: '#fff', padding: 16, boxShadow: '0 14px 30px rgba(0,0,0,0.18)', transform: `rotate(${r}deg)`, ...popIn(t, at, 0.3)}}>
      <div style={{width: '100%', height: h, overflow: 'hidden', background: '#ddd'}}>{children}</div>
      {label && <div style={{fontFamily: F.marker, fontSize: 40, color: '#222', textAlign: 'center', marginTop: 14}}>{label}</div>}
      <div style={{position: 'absolute', top: -22, left: '50%', width: 150, height: 44, marginLeft: -75, background: 'rgba(255,225,77,0.75)', transform: `rotate(${-r * 1.5 + 3}deg)`}} />
    </div>
  );
};

export const A10: React.FC = () => {
  const {t} = useT();
  const s1 = w(6), s2 = w(14), s3 = w(18), s4 = w(21);
  return (
    <AbsoluteFill style={{background: '#F3EBDD'}}>
      {/* ruled paper */}
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(to bottom, rgba(70,110,180,0.12) 2px, transparent 2px)', backgroundSize: '100% 74px', backgroundPosition: '0 40px'}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, left: 110, width: 3, background: 'rgba(229,72,77,0.35)'}} />
      <Win a={0} b={s1}>
        <Polaroid x={180} y={300} w={720} h={520} r={-3} at={0.05}><Media src="stock/h_student-studying-night.mp4" at={0} /></Polaroid>
        <div style={{position: 'absolute', left: 150, top: 950, width: 780, height: 220, border: '6px dashed rgba(0,0,0,0.35)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.marker, fontSize: 64, color: 'rgba(0,0,0,0.4)', ...popIn(t, w(3), 0.3)}}>PORTFOLIO: empty</div>
      </Win>
      <Win a={s1} b={s2}>
        <Polaroid x={100} y={290} w={440} h={360} r={-5} at={s1} label="brief"><Media src="studio/img/i48.jpg" /></Polaroid>
        <Polaroid x={560} y={340} w={420} h={400} r={4} at={w(8)} label="frames"><Crop src="studio/img/i46.jpg" x={0} y={0} w={0.5} h={1} /></Polaroid>
        <Polaroid x={300} y={800} w={460} h={280} r={-2} at={w(12)} label="launch"><Crop src="studio/img/i45.jpg" x={0.25} y={0} w={0.5} h={1} /></Polaroid>
        {/* doodle arrows */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <path d="M 500 700 C 540 760, 580 760, 620 720" stroke="#E5484D" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={300} strokeDashoffset={300 * (1 - eo(clamp((t - w(9)) / 0.4)))} />
          <path d="M 780 860 C 780 920, 740 940, 700 940" stroke="#E5484D" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={300} strokeDashoffset={300 * (1 - eo(clamp((t - w(12)) / 0.4)))} />
        </svg>
      </Win>
      <Win a={s2} b={END}>
        {[['studio/img/i46.jpg', 0, 0, 0.5, 1], ['studio/img/i49.jpg', 0, 0, 1, 1], ['studio/img/i45.jpg', 0.2, 0, 0.6, 1], ['studio/img/i47.jpg', 0.2, 0, 0.6, 1], ['studio/img/i50.jpg', 0, 0, 1, 1], ['studio/img/i46.jpg', 0.5, 0.5, 0.5, 0.5]].map((c: any, i) => (
          <Polaroid key={i} x={130 + (i % 2) * 430} y={290 + Math.floor(i / 2) * 300} w={390} h={220} r={(rnd(i * 3) - 0.5) * 8} at={(i < 2 ? s2 : s3) + (i % 2) * 0.12 + (i >= 2 ? (Math.floor(i / 2) - 1) * 0.2 : 0)}>
            <Crop src={c[0]} x={c[1]} y={c[2]} w={c[3]} h={c[4]} />
          </Polaroid>
        ))}
        <div style={{position: 'absolute', top: 260, right: 90, fontFamily: F.marker, fontSize: 52, color: '#E5484D', transform: 'rotate(6deg)', ...popIn(t, s2 + 0.2, 0.3)}}>CASE STUDY ✓</div>
        {t >= s4 && (
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <ellipse cx={540} cy={700} rx={500} ry={470} stroke="#E5484D" strokeWidth={10} fill="none" strokeDasharray={3400} strokeDashoffset={3400 * (1 - eo(clamp((t - s4) / 0.7)))} transform="rotate(-4 540 700)" />
          </svg>
        )}
      </Win>
      <CapMarker words={ws} y={0.665} maxChars={18} size={80} />
      <EndCard at={END} theme="paper" sub="Capstone: brief se launch tak ek full campaign. Wahi tumhara portfolio." />
      <Grain o={0.05} />
      <Vo id="A10" at={AT} />
      <Music src="M5_desi.mp3" offset={2} vol={0.45} words={ws} end={dur} fadeOut={0.6} />
      {[0.05, s1, w(8), w(12), s2, s3].map((a, i) => <Sfx key={i} n="pop" at={a} vol={0.4} rate={0.9 + i * 0.05} />)}
      <Sfx n="swoosh" at={s4} vol={0.35} rate={0.8} />
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

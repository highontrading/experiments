import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, EndCard, Typed, Crop, fadeUp, popIn, clamp, eo, prog, lerp, rnd} from '../lib';

// A13 · "This ad was made with what you'll learn" — rewind, then prompt → frame → variations → motion → edit → export (desktop UI)
const REW = 1.7;
const STEPS = [2.4, 5.2, 8.0, 10.2, 12.4, 14.6];
const OUT = 17.0;
const END = OUT + 1.8;
export const dur = END + 3.4;

const Win95: React.FC<{title: string; at: number; x: number; y: number; w: number; h: number; children: React.ReactNode; dark?: boolean}> = ({title, at, x, y, w, h, children, dark}) => {
  const {t} = useT();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, overflow: 'hidden', background: dark ? '#1b1b1d' : '#fbfbfa', boxShadow: '0 30px 80px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', ...popIn(t, at, 0.3)}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', background: dark ? '#262628' : '#ececeb', borderBottom: '1px solid rgba(0,0,0,0.08)'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
        <span style={{marginLeft: 16, fontFamily: F.mono, fontSize: 24, color: dark ? '#ddd' : '#333'}}>{title}</span>
      </div>
      <div style={{position: 'absolute', top: 64, left: 0, right: 0, bottom: 0}}>{children}</div>
    </div>
  );
};
const Label: React.FC<{n: string; t: string; at: number}> = ({n, t: txt, at}) => {
  const {t} = useT();
  return (
    <div style={{position: 'absolute', top: 290, left: 60, display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(t, at, 0.25)}}>
      <span style={{fontFamily: F.mono, fontSize: 28, color: '#111', background: '#FFE14D', padding: '6px 14px', borderRadius: 6}}>{n}</span>
      <span style={{fontFamily: F.tight, fontWeight: 800, fontSize: 56, color: '#fff', letterSpacing: '-0.03em'}}>{txt}</span>
    </div>
  );
};

export const A13: React.FC = () => {
  const {t, f} = useT();
  const step = STEPS.filter((s) => t >= s).length - 1;
  return (
    <AbsoluteFill style={{background: '#0e0e10'}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 2px, transparent 2px)', backgroundSize: '44px 44px'}} />
      {/* the finished ad first, then rewind */}
      <Win a={0} b={STEPS[0]}>
        <AbsoluteFill style={{filter: t > REW ? `blur(${(t - REW) * 6}px) brightness(${1 - (t - REW) * 0.8})` : 'none'}}>
          <Crop src="studio/img/i45.jpg" x={0.15} y={0} w={0.7} h={1} />
        </AbsoluteFill>
        <div style={{position: 'absolute', top: 300, left: 60, right: 60, fontFamily: F.tight, fontWeight: 800, fontSize: 84, color: '#fff', lineHeight: 1, letterSpacing: '-0.035em', textShadow: '0 4px 30px rgba(0,0,0,0.5)', ...fadeUp(t, 0.1)}}>
          This ad was made with what you’ll learn.
        </div>
        {t > REW && (
          <div style={{position: 'absolute', top: 900, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 64, color: '#fff', opacity: f % 10 < 6 ? 1 : 0.3}}>◀◀ REWIND</div>
        )}
      </Win>
      {t >= STEPS[0] && t < OUT && (
        <>
          {step === 0 && <Label n="01" t="The brief" at={STEPS[0]} />}
          {step === 1 && <Label n="02" t="The prompt" at={STEPS[1]} />}
          {step === 2 && <Label n="03" t="Variations" at={STEPS[2]} />}
          {step === 3 && <Label n="04" t="Motion" at={STEPS[3]} />}
          {step === 4 && <Label n="05" t="The edit" at={STEPS[4]} />}
          {step === 5 && <Label n="06" t="Export & launch" at={STEPS[5]} />}
          {step === 0 && (
            <Win95 title="brief.txt" at={STEPS[0]} x={60} y={420} w={W - 120} h={760}>
              <div style={{padding: 44, fontSize: 38, lineHeight: 1.55, color: '#222'}}>
                <Typed text={'Brand: monday. Orange Juice\nObjective: awareness and trial for a natural morning boost\nAudience: gym-goers and morning-routine people, 18–35\nAngle: Fresh Energy'} at={STEPS[0] + 0.3} cps={52} />
              </div>
            </Win95>
          )}
          {step === 1 && (
            <>
              <Win95 title="prompt" at={STEPS[1]} x={60} y={420} w={W - 120} h={260} dark>
                <div style={{padding: '34px 40px', fontSize: 36, lineHeight: 1.45, color: '#eee'}}>
                  <Typed text="cold-pressed orange juice bottle on travertine, morning sun, leaf shadows, studio packshot" at={STEPS[1] + 0.2} cps={45} />
                </div>
              </Win95>
              <Win95 title="frame_001.png" at={STEPS[1] + 1.4} x={160} y={720} w={W - 320} h={900}>
                <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - eo(prog(t, STEPS[1] + 1.6, STEPS[1] + 2.4))) * 100}% 0)`}}>
                  <Crop src="studio/img/i46.jpg" x={0} y={0} w={0.5} h={1} />
                </div>
              </Win95>
            </>
          )}
          {step === 2 &&
            [['studio/img/i46.jpg', 0, 0, 0.5, 1], ['studio/img/i46.jpg', 0.5, 0, 0.5, 0.5], ['studio/img/i46.jpg', 0.5, 0.5, 0.5, 0.5], ['studio/img/i47.jpg', 0.25, 0, 0.5, 1]].map((c: any, i) => (
              <Win95 key={i} title={`var_0${i + 1}.png`} at={STEPS[2] + i * 0.25} x={60 + (i % 2) * 490} y={420 + Math.floor(i / 2) * 640} w={470} h={620}>
                <Crop src={c[0]} x={c[1]} y={c[2]} w={c[3]} h={c[4]} />
              </Win95>
            ))}
          {step === 3 && (
            <Win95 title="image → video" at={STEPS[3]} x={60} y={420} w={W - 120} h={1100} dark>
              <AbsoluteFill style={{transform: `scale(${lerp(1, 1.18, prog(t, STEPS[3], STEPS[4]))}) rotate(${lerp(0, 1.5, prog(t, STEPS[3], STEPS[4]))}deg)`}}>
                <Crop src="studio/img/i47.jpg" x={0.2} y={0} w={0.6} h={1} />
              </AbsoluteFill>
              <div style={{position: 'absolute', left: 30, right: 30, bottom: 30, height: 10, background: 'rgba(255,255,255,0.25)', borderRadius: 5}}>
                <div style={{width: `${prog(t, STEPS[3], STEPS[4]) * 100}%`, height: '100%', background: '#fff', borderRadius: 5}} />
              </div>
            </Win95>
          )}
          {step === 4 && (
            <Win95 title="edit · monday_launch" at={STEPS[4]} x={60} y={420} w={W - 120} h={760} dark>
              <Crop src="studio/img/i50.jpg" x={0.1} y={0.05} w={0.8} h={0.75} />
              <div style={{position: 'absolute', top: 0, bottom: 0, width: 4, background: '#FFE14D', left: `${lerp(10, 90, prog(t, STEPS[4], STEPS[5]))}%`}} />
            </Win95>
          )}
          {step === 5 && (
            <>
              <Win95 title="export" at={STEPS[5]} x={60} y={420} w={W - 120} h={300}>
                <div style={{padding: '36px 44px', display: 'flex', flexDirection: 'column', gap: 22}}>
                  {['9:16 · Reels', '4:5 · Feed', '1:1 · Square'].map((r, i) => {
                    const p = prog(t, STEPS[5] + 0.2 + i * 0.25, STEPS[5] + 1.1 + i * 0.25);
                    return (
                      <div key={r} style={{display: 'flex', alignItems: 'center', gap: 20}}>
                        <span style={{fontFamily: F.mono, fontSize: 28, width: 260, color: '#222'}}>{r}</span>
                        <div style={{flex: 1, height: 16, background: '#e6e6e6', borderRadius: 8}}><div style={{width: `${p * 100}%`, height: '100%', background: '#111', borderRadius: 8}} /></div>
                        <span style={{fontFamily: F.mono, fontSize: 26, width: 70, color: '#222'}}>{p >= 1 ? '✓' : `${Math.round(p * 100)}%`}</span>
                      </div>
                    );
                  })}
                </div>
              </Win95>
              <div style={{position: 'absolute', left: 290, top: 770, width: 500, height: 900, borderRadius: 50, overflow: 'hidden', border: '10px solid #222', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', ...popIn(t, STEPS[5] + 1.0, 0.35)}}>
                <Crop src="studio/img/i45.jpg" x={0.355} y={0.03} w={0.29} h={0.94} />
              </div>
            </>
          )}
        </>
      )}
      <Win a={OUT} b={END}>
        <AbsoluteFill style={{background: '#0e0e10', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.tight, fontWeight: 800, fontSize: 104, color: '#fff', textAlign: 'center', lineHeight: 0.98, letterSpacing: '-0.04em', ...fadeUp(t, OUT + 0.05)}}>
            Every step<br />is a <span style={{color: '#FFE14D'}}>module.</span>
          </div>
        </AbsoluteFill>
      </Win>
      <EndCard at={END} theme="dark" sub="Brief, prompt, variations, motion, edit, launch." />
      <Grain o={0.04} />
      <Music src="bed_v3.mp3" offset={30} vol={0.6} end={dur} fadeOut={0.7} fadeIn={0.3} />
      <Sfx n="whip" at={REW} vol={0.5} rate={0.7} />
      {STEPS.map((s, i) => <Sfx key={i} n="pop" at={s} vol={0.4} />)}
      <Sfx n="typing" at={STEPS[0] + 0.3} vol={0.3} />
      <Sfx n="typing" at={STEPS[1] + 0.2} vol={0.3} />
      <Sfx n="shimmer" at={STEPS[1] + 1.5} vol={0.3} />
      {[0, 1, 2, 3].map((i) => <Sfx key={'v' + i} n="bubble" at={STEPS[2] + i * 0.25} vol={0.3} />)}
      <Sfx n="ding" at={STEPS[5] + 1.0} vol={0.4} />
      <Sfx n="impact" at={OUT} vol={0.35} rate={1.2} />
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

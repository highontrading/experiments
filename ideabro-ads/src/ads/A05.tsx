import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, EndCard, fadeUp, popIn, clamp, eo, prog, lerp, back} from '../lib';

// A05 · "Real shoot or AI?" — 4-round quiz, game-show chips, countdown, reveal stamp
const R0 = 1.8, RL = 3.4;
const ROUNDS = ['studio/img/i38.jpg', 'studio/img/i40.jpg', 'studio/img/i27.jpg', 'studio/img/i16.jpg'];
const REV = R0 + ROUNDS.length * RL;
export const dur = REV + 2.6 + 3.4;

const Btn: React.FC<{label: string; on: boolean; dim: boolean}> = ({label, on, dim}) => (
  <div style={{width: 420, height: 130, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mont, fontWeight: 900, fontSize: 56, letterSpacing: '0.02em', background: on ? '#FFE14D' : 'rgba(255,255,255,0.92)', color: '#0b0b0b', opacity: dim ? 0.35 : 1, transform: `scale(${on ? 1.06 : 1})`, boxShadow: '0 14px 40px rgba(0,0,0,0.35)'}}>{label}</div>
);

export const A05: React.FC = () => {
  const {t} = useT();
  const r = Math.floor((t - R0) / RL);
  const a = R0 + r * RL;
  const reveal = a + 2.1;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Win a={0} b={R0}>
        <KB src={ROUNDS[0]} a={0} b={R0} z0={1.2} z1={1.25} style={{filter: 'blur(18px) brightness(0.55)'}} />
        <div style={{position: 'absolute', top: 640, left: 60, right: 60, textAlign: 'center', fontFamily: F.mont, fontWeight: 900, fontSize: 120, lineHeight: 1, color: '#fff', textTransform: 'uppercase', ...popIn(t, 0.05, 0.35)}}>
          Real shoot
          <div style={{color: '#FFE14D', fontSize: 150, margin: '14px 0'}}>or AI?</div>
        </div>
        <div style={{position: 'absolute', top: 1080, left: 0, right: 0, textAlign: 'center', fontFamily: F.tight, fontWeight: 600, fontSize: 46, color: '#fff', ...fadeUp(t, 0.6)}}>4 rounds. Keep score.</div>
      </Win>
      {r >= 0 && r < ROUNDS.length && (
        <>
          <KB key={r} src={ROUNDS[r]} a={a} b={a + RL} z0={1.03} z1={1.1} />
          <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 75%)'}} />
          <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...fadeUp(t, a, 0.25)}}>
            <span style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '0.18em', color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '12px 24px', borderRadius: 999}}>ROUND {r + 1} / 4</span>
          </div>
          <div style={{position: 'absolute', top: 370, left: 0, right: 0, textAlign: 'center', fontFamily: F.mont, fontWeight: 900, fontSize: 76, color: '#fff', textTransform: 'uppercase', textShadow: '0 4px 24px rgba(0,0,0,0.6)', ...fadeUp(t, a + 0.1, 0.25)}}>Real or AI?</div>
          {/* countdown ring */}
          {t < reveal && (
            <div style={{position: 'absolute', top: 500, left: W / 2 - 70, width: 140, height: 140}}>
              <svg width={140} height={140}>
                <circle cx={70} cy={70} r={60} stroke="rgba(255,255,255,0.25)" strokeWidth={10} fill="rgba(0,0,0,0.35)" />
                <circle cx={70} cy={70} r={60} stroke="#FFE14D" strokeWidth={10} fill="none" strokeDasharray={377} strokeDashoffset={377 * prog(t, a + 0.3, reveal)} transform="rotate(-90 70 70)" strokeLinecap="round" />
              </svg>
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mont, fontWeight: 900, fontSize: 64, color: '#fff'}}>{Math.max(1, 3 - Math.floor((t - a - 0.3) / 0.6))}</div>
            </div>
          )}
          <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, ...fadeUp(t, a + 0.2, 0.3)}}>
            <Btn label="REAL" on={false} dim={t >= reveal} />
            <Btn label="AI" on={t >= reveal} dim={false} />
          </div>
          {t >= reveal && (
            <div style={{position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div style={{border: '8px solid #FFE14D', color: '#FFE14D', fontFamily: F.mont, fontWeight: 900, fontSize: 64, padding: '10px 34px', borderRadius: 16, transform: `rotate(-6deg) scale(${lerp(1.8, 1, eo(clamp((t - reveal) / 0.18)))})`, opacity: clamp((t - reveal) / 0.1), background: 'rgba(0,0,0,0.45)', textTransform: 'uppercase'}}>
                AI · made in our studio
              </div>
            </div>
          )}
        </>
      )}
      <Win a={REV} b={REV + 2.6}>
        <AbsoluteFill style={{background: '#0b0b0b'}}>
          {ROUNDS.map((s, i) => (
            <div key={i} style={{position: 'absolute', left: 60 + (i % 2) * 490, top: 560 + Math.floor(i / 2) * 520, width: 470, height: 500, borderRadius: 18, overflow: 'hidden', ...popIn(t, REV + i * 0.08, 0.3)}}>
              <Media src={s} />
            </div>
          ))}
          <div style={{position: 'absolute', top: 300, left: 60, right: 60, textAlign: 'center', fontFamily: F.mont, fontWeight: 900, fontSize: 82, color: '#fff', textTransform: 'uppercase', lineHeight: 1.02, ...fadeUp(t, REV + 0.3)}}>
            All four were <span style={{color: '#FFE14D'}}>AI.</span>
          </div>
          <div style={{position: 'absolute', top: 1620, left: 60, right: 60, textAlign: 'center', fontFamily: F.tight, fontWeight: 600, fontSize: 44, color: 'rgba(255,255,255,0.8)', ...fadeUp(t, REV + 0.8)}}>How many did you get? Tell us in the comments.</div>
        </AbsoluteFill>
      </Win>
      <EndCard at={REV + 2.6} theme="light" sub="Learn to make ads people can’t tell apart." />
      <Grain o={0.04} />
      <Music src="M7_quiz.mp3" vol={0.6} end={dur} fadeOut={0.6} />
      <Sfx n="ding" at={0.1} vol={0.4} />
      {ROUNDS.map((_, i) => {
        const ra = R0 + i * RL;
        return (
          <React.Fragment key={i}>
            <Sfx n="swoosh" at={ra - 0.05} vol={0.3} />
            {[0, 1, 2].map((k) => <Sfx key={k} n="beep" at={ra + 0.3 + k * 0.6} vol={0.35} rate={1 + k * 0.05} />)}
            <Sfx n="stamp" at={ra + 2.1} vol={0.55} />
            <Sfx n="ding" at={ra + 2.15} vol={0.35} />
          </React.Fragment>
        );
      })}
      <Sfx n="impact" at={REV} vol={0.35} rate={1.2} />
      <Sfx n="ui" at={REV + 2.6} vol={0.5} />
    </AbsoluteFill>
  );
};

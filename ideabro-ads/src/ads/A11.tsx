import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, Grain, Sfx, Music, EndCard, Crop, clamp, eo, back, lerp} from '../lib';

// A11 · Hinglish · client chat: "kal subah tak 20 ad variations chahiye" — chat-bubble captions, no VO
type Msg = {at: number; me: boolean; text?: string; imgs?: [string, number, number, number, number][]};
const M: Msg[] = [
  {at: 0.4, me: false, text: 'Diwali sale ke liye 20 ad variations chahiye'},
  {at: 1.9, me: false, text: 'Kal subah tak. Ho jayega?'},
  {at: 3.4, me: true, text: 'Ho jayega.'},
  {at: 4.8, me: false, text: 'Shoot kab rakhein? Studio book karun?'},
  {at: 6.5, me: true, text: 'Shoot ki zarurat hi nahi.'},
  {at: 7.9, me: true, imgs: [['studio/img/i46.jpg', 0, 0, 0.5, 1], ['studio/img/i47.jpg', 0.2, 0, 0.6, 1], ['studio/img/i46.jpg', 0.5, 0.5, 0.5, 0.5], ['studio/img/i45.jpg', 0.1, 0, 0.8, 1]]},
  {at: 9.3, me: true, imgs: [['studio/img/i01.jpg', 0, 0, 1, 1], ['studio/img/i02.jpg', 0, 0.1, 1, 0.8], ['studio/img/i27.jpg', 0, 0, 1, 1], ['studio/img/i37.jpg', 0, 0, 1, 1]]},
  {at: 10.9, me: false, text: 'Bhai ye sab AI hai??'},
  {at: 12.4, me: true, text: 'Haan. Directed by me.'},
  {at: 13.8, me: false, text: 'Kaise seekha?'},
  {at: 15.2, me: true, text: 'AI & Advertising. Ek course, poora workflow.'},
];
const END = 17.4;
export const dur = END + 3.4;

const Bubble: React.FC<{m: Msg}> = ({m}) => {
  const {t} = useT();
  const a = clamp((t - m.at) / 0.25);
  const style: React.CSSProperties = {alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: 760, transform: `scale(${back(a)})`, transformOrigin: m.me ? 'right bottom' : 'left bottom', opacity: clamp(a * 3)};
  if (m.imgs)
    return (
      <div style={{...style, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: 560, padding: 8, background: '#111', borderRadius: 30}}>
        {m.imgs.map((c, i) => (
          <div key={i} style={{height: 260, borderRadius: 22, overflow: 'hidden'}}><Crop src={c[0]} x={c[1]} y={c[2]} w={c[3]} h={c[4]} /></div>
        ))}
      </div>
    );
  return (
    <div style={{...style, background: m.me ? '#111' : '#ECECEC', color: m.me ? '#fff' : '#111', fontFamily: F.inter, fontWeight: 500, fontSize: 44, lineHeight: 1.25, padding: '24px 34px', borderRadius: 40, borderBottomRightRadius: m.me ? 10 : 40, borderBottomLeftRadius: m.me ? 40 : 10}}>{m.text}</div>
  );
};

export const A11: React.FC = () => {
  const {t, f} = useT();
  const shown = M.filter((m) => t >= m.at);
  const next = M.find((m) => m.at > t);
  const typing = next && !next.me && next.at - t < 0.9;
  // scroll so the latest message stays in the safe area
  const heightOf = (m: Msg) => (m.imgs ? 560 : m.text!.length > 26 ? 170 : 115) + 22;
  const total = shown.reduce((s, m) => s + heightOf(m), 0) + (typing ? 120 : 0);
  const target = Math.max(0, total - 920);
  const prev = shown.slice(0, -1).reduce((s, m) => s + heightOf(m), 0) + (typing ? 120 : 0);
  const last = shown[shown.length - 1];
  const sc = last ? lerp(Math.max(0, prev - 920), target, eo(clamp((t - last.at) / 0.3))) : 0;
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      {/* header */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 290, background: '#F7F7F7', borderBottom: '2px solid #E6E6E6', display: 'flex', alignItems: 'flex-end', padding: '0 50px 34px', gap: 26, zIndex: 2}}>
        <div style={{width: 96, height: 96, borderRadius: 48, background: '#D97757', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.tight, fontWeight: 700, fontSize: 40}}>RK</div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span style={{fontFamily: F.tight, fontWeight: 700, fontSize: 44, color: '#111'}}>Client · Brand Manager</span>
          <span style={{fontFamily: F.inter, fontSize: 30, color: '#3a9c5a'}}>{typing ? 'typing…' : 'online'}</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 330, left: 50, right: 50, display: 'flex', flexDirection: 'column', gap: 22, transform: `translateY(${-sc}px)`}}>
        {shown.map((m, i) => <Bubble key={i} m={m} />)}
        {typing && (
          <div style={{alignSelf: 'flex-start', background: '#ECECEC', borderRadius: 40, padding: '30px 38px', display: 'flex', gap: 14}}>
            {[0, 1, 2].map((k) => <div key={k} style={{width: 20, height: 20, borderRadius: 10, background: '#888', opacity: 0.4 + 0.6 * Math.abs(Math.sin((f / 6) + k))}} />)}
          </div>
        )}
      </div>
      {/* input bar */}
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 210, background: '#F7F7F7', borderTop: '2px solid #E6E6E6', zIndex: 2}}>
        <div style={{margin: '34px 50px', height: 92, borderRadius: 46, background: '#fff', border: '2px solid #E1E1E1', fontFamily: F.inter, fontSize: 34, color: '#999', display: 'flex', alignItems: 'center', padding: '0 36px'}}>Message</div>
      </div>
      <EndCard at={END} theme="light" sub="Ye skill tum bhi seekh sakte ho. Ek course, poora workflow." />
      <Grain o={0.02} />
      <Music src="M5_desi.mp3" vol={0.45} end={dur} fadeOut={0.6} />
      {M.map((m, i) => <Sfx key={i} n={m.me ? 'msg_out' : 'msg_in'} at={m.at} vol={0.55} />)}
      <Sfx n="ui" at={END} vol={0.5} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, Media, KB, Win, Grain, Sfx, Music, EndCard, BigStack, fadeUp, clamp, eo, prog, lerp, Crop} from '../lib';

// A01 · "The shoot is optional" — old way vs AI way split screen (site's comparison table)
const ROWS = [
  {k: 'Product photos', old: 'pd/old/00_1946_photographer_studio_lights.jpg', oldT: 'Book a studio, photographer and stylist', ai: 'studio/v10.mp4', aiFrom: 0.3, aiT: 'Generate scenes from one product photo'},
  {k: 'Models', old: 'pd/old/01_1940_model_studio_shoot.jpg', oldT: 'Cast, book and pay per day', ai: 'studio/v08.mp4', aiFrom: 0.2, aiT: 'Consistent AI models you direct'},
  {k: 'Video ads', old: 'pd/old/02_1946_film_crew_cameras.jpg', oldT: 'Crew, location, edit suite', ai: 'studio/v01.mp4', aiFrom: 3.5, aiT: 'Image-to-video, voiceover, edit'},
  {k: 'Turnaround', old: 'pd/old/05_1950_typewriter.jpg', oldT: 'Days to weeks', ai: 'studio/v14.mp4', aiFrom: 1.5, aiT: 'The same day'},
  {k: 'New variations', old: 'pd/old/08_1946_photo_prints_review.jpg', oldT: 'Another shoot', ai: 'monday', aiFrom: 0, aiT: 'Another prompt'},
];
const T0 = 1.6, ROW = 2.3;
export const dur = T0 + ROWS.length * ROW + 2.6 + 3.4;

const Half: React.FC<{top: boolean; src: string; from: number; label: string; text: string; a: number}> = ({top, src, from, label, text, a}) => {
  const {t} = useT();
  const p = prog(t, a, a + ROW);
  const slide = eo(clamp((t - a) / 0.3));
  const monday = src === 'monday';
  const k = Math.floor((t - a) * 5) % 4;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: top ? 0 : H / 2, height: H / 2, overflow: 'hidden', transform: `translateX(${(1 - slide) * (top ? -W : W)}px)`}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.05, 1.13, p)})`, filter: top ? 'grayscale(1) contrast(1.15) brightness(0.9) sepia(0.15)' : 'none'}}>
        {monday ? (
          <Crop src="studio/img/i46.jpg" x={[0, 0.5, 0.5, 0][k]} y={[0, 0, 0.5, 0][k]} w={[0.5, 0.5, 0.5, 0.5][k]} h={[1, 0.5, 0.5, 1][k]} />
        ) : (
          <Media src={src} at={a} from={from} />
        )}
      </div>
      <div style={{position: 'absolute', inset: 0, background: top ? 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55) 30%, rgba(0,0,0,0) 60%)' : 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0) 40%)'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: top ? 300 : 70, display: 'flex', flexDirection: 'column', gap: 14, ...fadeUp(t, a + 0.15, 0.3, 20)} as any}>
        <span style={{alignSelf: 'flex-start', fontFamily: F.mono, fontSize: 26, letterSpacing: '0.12em', color: top ? '#111' : '#000', background: top ? '#d8d2c4' : '#FFE14D', padding: '8px 16px', borderRadius: 6}}>{label}</span>
        <span style={{fontFamily: F.tight, fontWeight: 700, fontSize: 52, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.08, textShadow: '0 2px 18px rgba(0,0,0,0.5)'}}>{text}</span>
      </div>
    </div>
  );
};

export const A01: React.FC = () => {
  const {t} = useT();
  const rowIdx = Math.floor((t - T0) / ROW);
  const row = ROWS[rowIdx];
  const endT = T0 + ROWS.length * ROW;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* hook: finished output first, then the claim */}
      <Win a={0} b={T0}>
        <KB src="studio/v13.mp4" a={0} b={T0} from={13} z0={1.0} z1={1.12} />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.28)'}} />
        <BigStack y={560} size={190} lines={[{t: 'The shoot', at: 0.05}, {t: 'is optional.', at: 0.3, color: '#FFE14D'}]} />
      </Win>
      {row && t >= T0 && t < endT && (
        <>
          <Half key={'o' + rowIdx} top src={row.old} from={0} label="THE OLD WAY" text={row.oldT} a={T0 + rowIdx * ROW} />
          <Half key={'a' + rowIdx} top={false} src={row.ai} from={row.aiFrom} label="THE AI WAY" text={row.aiT} a={T0 + rowIdx * ROW} />
          <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 66, height: 132, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px'}}>
            <span style={{fontFamily: F.anton, fontSize: 96, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.01em', ...fadeUp(t, T0 + rowIdx * ROW, 0.25, 30)}}>{row.k}</span>
            <span style={{fontFamily: F.mono, fontSize: 30, color: 'rgba(255,255,255,0.55)'}}>0{rowIdx + 1}/0{ROWS.length}</span>
          </div>
        </>
      )}
      <Win a={endT} b={endT + 2.6}>
        <KB src="studio/v09.mp4" a={endT} b={endT + 2.6} from={2.5} z0={1.0} z1={1.1} />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.35)'}} />
        <BigStack y={700} size={150} align="center" lines={[{t: 'Directed', at: endT + 0.1}, {t: 'by you.', at: endT + 0.35, color: '#FFE14D'}]} />
      </Win>
      <EndCard at={endT + 2.6} theme="dark" sub="Shoot-quality ads, without the shoot." />
      <Grain o={0.05} />
      <Music src="M1_punchy.mp3" vol={0.75} end={dur} fadeOut={0.3} />
      <Sfx n="impact" at={0} vol={0.55} />
      {ROWS.map((_, i) => <Sfx key={i} n="swoosh" at={T0 + i * ROW - 0.08} vol={0.45} rate={1 + i * 0.04} />)}
      <Sfx n="impact" at={endT} vol={0.35} rate={1.2} />
      <Sfx n="ui" at={endT + 2.6} vol={0.6} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import vo from '../data/vo/A02.json';
import {F, W, H, useT, Media, Win, Grain, Sfx, Music, Vo, EndCard, CapHighlight, voWords, Crop, popIn, fadeUp, clamp, eo, prog, lerp, back, Box} from '../lib';

// A02 · "One photo. Whole campaign." — monday. case study, yellow highlight captions, VO
const AT = 0.3;
const ws = voWords('A02', AT, vo);
const w = (i: number) => ws[i].s;
export const dur = AT + vo.dur + 0.6 + 3.4;
const END = AT + vo.dur + 0.6;

// monday tiles: [src, x, y, w, h] crops
const HERO: [string, number, number, number, number] = ['studio/img/i46.jpg', 0, 0, 0.5, 1];
const TILES: [string, number, number, number, number][] = [
  ['studio/img/i45.jpg', 0, 0, 1, 1], ['studio/img/i46.jpg', 0.5, 0, 0.5, 0.5], ['studio/img/i47.jpg', 0.15, 0, 0.7, 1],
  ['studio/img/i48.jpg', 0, 0, 1, 1], HERO, ['studio/img/i46.jpg', 0.5, 0.5, 0.5, 0.5],
  ['studio/img/i49.jpg', 0, 0, 1, 1], ['studio/img/i50.jpg', 0, 0, 1, 1], ['studio/img/i45.jpg', 0.2, 0.1, 0.6, 0.8],
];
const Tile: React.FC<{c: [string, number, number, number, number]; style?: React.CSSProperties}> = ({c, style}) => (
  <Crop src={c[0]} x={c[1]} y={c[2]} w={c[3]} h={c[4]} style={{borderRadius: 18, boxShadow: '0 18px 50px rgba(0,0,0,0.25)', ...style}} />
);

export const A02: React.FC = () => {
  const {t} = useT();
  const gridIn = w(5);
  const fullA = w(14), full = [w(14), w(16), w(18), w(19), w(20)];
  const varA = w(20);
  return (
    <AbsoluteFill style={{background: '#EFE9DF'}}>
      {/* 1. one photo -> 2. grid */}
      <Win a={0} b={fullA - 0.1}>
        {(() => {
          const g = eo(prog(t, gridIn, gridIn + 0.5));
          const cw = lerp(640, 300, g), ch = lerp(860, 400, g);
          const els: React.ReactNode[] = [];
          TILES.forEach((c, i) => {
            if (i === 4) return;
            const col = i % 3, row = Math.floor(i / 3);
            const x = 60 + col * 330, y = 420 + row * 430;
            const a = gridIn + 0.1 + i * 0.07;
            els.push(<Box key={i} x={x} y={y} w={300} h={400} style={{overflow: 'visible', ...popIn(t, a, 0.3)}}><Tile c={c} /></Box>);
          });
          const x = lerp((W - cw) / 2, 390, g), y = lerp(430, 850, g);
          return (
            <>
              {els}
              <Box x={x} y={y} w={cw} h={ch} style={{overflow: 'visible', transform: `rotate(${lerp(-3, 0, g)}deg) scale(${back(clamp(t / 0.4))})`}}>
                <div style={{width: '100%', height: '100%', background: '#fff', padding: lerp(18, 8, g), borderRadius: 14, boxShadow: '0 30px 80px rgba(0,0,0,0.3)'}}>
                  <Crop src={HERO[0]} x={HERO[1]} y={HERO[2]} w={HERO[3]} h={HERO[4]} style={{borderRadius: 8}} />
                </div>
              </Box>
            </>
          );
        })()}
      </Win>
      {/* 3. full-bleed showcase */}
      {full.map((a, i) => {
        const b = i + 1 < full.length ? full[i + 1] : varA;
        const srcs: React.ReactNode[] = [
          <Crop key="p" src="studio/img/i46.jpg" x={0.04} y={0} w={0.42} h={1} />,
          <Crop key="l" src="studio/img/i46.jpg" x={0.5} y={0.5} w={0.5} h={0.5} />,
          <Media key="m" src="studio/img/i38.jpg" />,
          <Crop key="mo" src="studio/img/i47.jpg" x={0.3} y={0} w={0.4} h={1} />,
        ];
        if (i >= 4) return null;
        return (
          <Win key={i} a={a - 0.1} b={b - 0.1}>
            <AbsoluteFill style={{transform: `scale(${lerp(1.02, 1.1, prog(t, a, b))})`}}>{srcs[i]}</AbsoluteFill>
          </Win>
        );
      })}
      {/* 4. twenty variations */}
      <Win a={varA - 0.1} b={END}>
        <AbsoluteFill style={{background: '#111'}}>
          {Array.from({length: 20}).map((_, i) => {
            const c = TILES[i % TILES.length];
            const col = i % 4, row = Math.floor(i / 4);
            const hue = [0, 8, -8, 14, -14][i % 5];
            return (
              <Box key={i} x={40 + col * 255} y={575 + row * 268} w={235} h={250} style={{overflow: 'visible', ...popIn(t, varA + i * 0.06, 0.25)}}>
                <Tile c={c} style={{borderRadius: 12, filter: `hue-rotate(${hue}deg) saturate(${1 + (i % 3) * 0.1})`}} />
              </Box>
            );
          })}
          <div style={{position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center', fontFamily: F.anton, fontSize: 130, lineHeight: 1, color: '#FFE14D', ...fadeUp(t, varA, 0.3)}}>
            {String(Math.min(20, Math.max(1, Math.round(lerp(1, 20, eo(prog(t, varA, varA + 1.3))))))).padStart(2, '0')} / 20
          </div>
          <Win a={w(28) - 0.1} b={END}>
            <AbsoluteFill style={{background: 'rgba(0,0,0,0.78)'}}>
              <Box x={60} y={420} w={W - 120} h={620} style={{borderRadius: 18, ...popIn(t, w(28), 0.35)}}><Media src="studio/img/i50.jpg" /></Box>
            </AbsoluteFill>
          </Win>
        </AbsoluteFill>
      </Win>
      <CapHighlight words={ws} y={0.165} maxChars={20} size={60} />
      <EndCard at={END} theme="yellow" sub="Turn one product photo into a whole campaign." />
      <Grain o={0.04} />
      <Vo id="A02" at={AT} />
      <Music src="M3_lux.mp3" vol={0.5} words={ws} end={dur} fadeOut={0.6} />
      <Sfx n="pop" at={0.05} vol={0.5} />
      {TILES.map((_, i) => <Sfx key={i} n="pop" at={gridIn + 0.1 + i * 0.07} vol={0.35} rate={0.95 + i * 0.03} />)}
      {full.slice(0, 4).map((a, i) => <Sfx key={'s' + i} n="swoosh" at={a - 0.12} vol={0.3} />)}
      {Array.from({length: 10}).map((_, i) => <Sfx key={'b' + i} n="bubble" at={varA + i * 0.12} vol={0.25} rate={0.9 + i * 0.04} />)}
      <Sfx n="ui" at={END} vol={0.6} />
    </AbsoluteFill>
  );
};

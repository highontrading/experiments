import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, W, H, useT, KB, Win, Grain, Sfx, Music, EndCard, fadeUp, clamp, eo, ei, prog, lerp} from '../lib';

// A06 · Itemized receipt: the old way vs the AI way (thermal receipt, Space Mono)
type Line = [string, string];
const OLD: Line[] = [['STUDIO BOOKING', '✓'], ['PHOTOGRAPHER + ASSISTANT', '✓'], ['STYLIST + HAIR & MAKEUP', '✓'], ['MODELS (PER DAY)', '✓'], ['CREW + LOCATION', '✓'], ['EDIT SUITE', '✓'], ['MUSIC LICENCE', '✓']];
const OLD_T: Line[] = [['TURNAROUND', 'DAYS–WEEKS'], ['NEW VARIATION', 'ANOTHER SHOOT']];
const NEW: Line[] = [['ONE PRODUCT PHOTO', '✓'], ['YOUR TASTE', '✓'], ['AI & ADVERTISING', '$29']];
const NEW_T: Line[] = [['TURNAROUND', 'SAME DAY'], ['NEW VARIATION', 'ANOTHER PROMPT']];
const P1 = 0.6, TEAR = 8.2, P2 = 9.0, STAMP = 14.6;
export const dur = 16.8 + 3.4;

const Receipt: React.FC<{a: number; title: string; sub: string; items: Line[]; tot: Line[]; total: string; leave?: number; stamp?: number}> = ({a, title, sub, items, tot, total, leave, stamp}) => {
  const {t} = useT();
  const all = [...items, ['—', ''] as Line, ...tot, ['—', ''] as Line, ['TOTAL', total] as Line];
  const lineAt = (i: number) => a + 0.9 + i * 0.42;
  const printed = all.filter((_, i) => t >= lineAt(i)).length;
  const h = 330 + printed * 72 + 120;
  const lv = leave ? ei(prog(t, leave, leave + 0.6)) : 0;
  return (
    <div style={{position: 'absolute', left: (W - 820) / 2, top: 300, width: 820, transform: `translateY(${lv * 1600}px) rotate(${lv * 18}deg)`}}>
      <div style={{position: 'relative', background: '#FBF8F1', height: h, boxShadow: '0 40px 90px rgba(0,0,0,0.5)', padding: '56px 56px 0', fontFamily: F.spacemono, color: '#1a1a1a', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 18px),97.5% 100%,95% calc(100% - 18px),92.5% 100%,90% calc(100% - 18px),87.5% 100%,85% calc(100% - 18px),82.5% 100%,80% calc(100% - 18px),77.5% 100%,75% calc(100% - 18px),72.5% 100%,70% calc(100% - 18px),67.5% 100%,65% calc(100% - 18px),62.5% 100%,60% calc(100% - 18px),57.5% 100%,55% calc(100% - 18px),52.5% 100%,50% calc(100% - 18px),47.5% 100%,45% calc(100% - 18px),42.5% 100%,40% calc(100% - 18px),37.5% 100%,35% calc(100% - 18px),32.5% 100%,30% calc(100% - 18px),27.5% 100%,25% calc(100% - 18px),22.5% 100%,20% calc(100% - 18px),17.5% 100%,15% calc(100% - 18px),12.5% 100%,10% calc(100% - 18px),7.5% 100%,5% calc(100% - 18px),2.5% 100%,0 calc(100% - 18px))'}}>
        <div style={{textAlign: 'center', fontWeight: 700, fontSize: 46, letterSpacing: '0.06em'}}>{title}</div>
        <div style={{textAlign: 'center', fontSize: 28, marginTop: 10, opacity: 0.7}}>{sub}</div>
        <div style={{borderTop: '3px dashed #1a1a1a', margin: '30px 0 18px', opacity: 0.6}} />
        {all.slice(0, printed).map(([k, v], i) =>
          k === '—' ? (
            <div key={i} style={{borderTop: '3px dashed #1a1a1a', margin: '22px 0', opacity: 0.6}} />
          ) : (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: k === 'TOTAL' ? 46 : 32, fontWeight: k === 'TOTAL' ? 700 : 400, lineHeight: '72px'}}>
              <span>{k}</span>
              <span>{v}</span>
            </div>
          )
        )}
      </div>
      {stamp !== undefined && t >= stamp && (
        <div style={{position: 'absolute', right: 60, bottom: 120, border: '10px solid #D93A3A', color: '#D93A3A', fontFamily: F.spacemono, fontWeight: 700, fontSize: 92, padding: '6px 34px', borderRadius: 12, letterSpacing: '0.1em', transform: `rotate(-12deg) scale(${lerp(2, 1, eo(clamp((t - stamp) / 0.16)))})`, opacity: 0.88 * clamp((t - stamp) / 0.08)}}>PAID</div>
      )}
    </div>
  );
};

export const A06: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{background: '#121212'}}>
      <AbsoluteFill style={{opacity: 0.55}}>
        <Win a={0} b={P2}>
          <KB src="pd/old/00_1946_photographer_studio_lights.jpg" a={0} b={P2} style={{filter: 'grayscale(1) blur(10px) brightness(0.5)'}} />
        </Win>
        <Win a={P2} b={dur}>
          <KB src="studio/v10.mp4" a={P2} b={dur} from={0.3} style={{filter: 'blur(14px) brightness(0.55)'}} />
        </Win>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 160, left: 60, right: 60, textAlign: 'center', fontFamily: F.tight, fontWeight: 800, fontSize: 60, color: '#fff', letterSpacing: '-0.02em'}}>
        <Win a={0} b={P2}><span style={fadeUp(t, 0.1)}>What one campaign used to need</span></Win>
        <Win a={P2} b={dur}><span style={fadeUp(t, P2)}>What it needs now</span></Win>
      </div>
      <Win a={0} b={TEAR + 0.7}>
        <Receipt a={P1} title="CAMPAIGN SHOOT" sub="THE OLD WAY · 1 LOOK" items={OLD} tot={OLD_T} total="A LOT" leave={TEAR} />
      </Win>
      <Win a={P2} b={dur}>
        <Receipt a={P2} title="AI CAMPAIGN" sub="THE AI WAY · EVERY LOOK" items={NEW} tot={NEW_T} total="$29" stamp={STAMP} />
      </Win>
      <EndCard at={16.8} theme="paper" sub="Shoot-quality ads, without the shoot." />
      <Grain o={0.05} />
      <Music src="M8_vinyl.mp3" vol={0.5} end={dur} fadeOut={0.6} />
      <Sfx n="receipt" at={P1 + 0.6} vol={0.5} />
      <Sfx n="receipt" at={P1 + 3.0} vol={0.45} rate={1.1} />
      <Sfx n="tear" at={TEAR} vol={0.7} />
      <Sfx n="receipt" at={P2 + 0.6} vol={0.5} />
      <Sfx n="stamp" at={STAMP} vol={0.8} />
      <Sfx n="cash" at={STAMP + 0.15} vol={0.45} />
      <Sfx n="ui" at={16.8} vol={0.5} />
    </AbsoluteFill>
  );
};

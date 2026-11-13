import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import {TL, AS, FPS, clamp, prog, easeOut, easeIn, easeInOut, easeOutBack, lerp, rnd, within} from './lib';

const BLACK = '#000';
const WHITE = '#fff';
const CAPTION_FONT = "'Inter Tight', 'Helvetica Neue', Arial, sans-serif";
const LT_FONT = "'Poppins', 'Inter Tight', Arial, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

// ---------- fonts ----------
const FONTS: [string, string, string, string][] = [
  ['Inter Tight', '500', 'normal', 'InterTight-500-normal.woff2'],
  ['Inter Tight', '600', 'normal', 'InterTight-600-normal.woff2'],
  ['Inter Tight', '700', 'normal', 'InterTight-700-normal.woff2'],
  ['Poppins', '400', 'normal', 'Poppins-400-normal.woff2'],
  ['Poppins', '700', 'normal', 'Poppins-700-normal.woff2'],
  ['JetBrains Mono', '400', 'normal', 'JetBrainsMono-400-normal.woff2'],
  ['JetBrains Mono', '500', 'normal', 'JetBrainsMono-500-normal.woff2'],
  ['Instrument Serif', '400', 'italic', 'InstrumentSerif-400-italic.woff2'],
];
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(
      FONTS.map(([fam, w, st, file]) => {
        const f = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: w, style: st});
        return f.load().then((ff) => (document as any).fonts.add(ff));
      })
    ).then(() => continueRender(handle));
  }, [handle]);
};

// ---------- layout context ----------
type L = {W: number; H: number; V: boolean; m: number; t: number; f: number};
const useL = (): L => {
  const {width: W, height: H} = useVideoConfig();
  const f = useCurrentFrame();
  return {W, H, V: H > W, m: Math.min(W, H), t: f / FPS, f};
};

// ---------- captions ----------
const Caption: React.FC<{card: any; l: L}> = ({card, l}) => {
  const {t} = l;
  const fs = l.V ? 60 : 44;
  const style = card.style;
  const big = style === 'big';
  const color = style === 'fade' || style === 'big' || style === 'gap' ? BLACK : WHITE;
  const words = card.words.map((w: any, i: number) => {
    const age = t - w.s;
    let op = 0, dy = 0, col = color;
    if (age >= 0) {
      if (style === 'rise' || style === 'dot') {
        op = clamp(age / (2 / FPS));
        dy = (1 - easeOut(clamp(age / (5 / FPS)))) * 0.18;
      } else if (style === 'over') {
        op = 1;
        dy = (1 - easeOut(clamp(age / (4 / FPS)))) * 0.1;
      } else {
        const p = easeOut(clamp(age / (6 / FPS)));
        op = lerp(0.12, 1, p);
      }
    }
    return (
      <span key={i} style={{display: 'inline-block', opacity: op, transform: `translateY(${dy}em)`, color: col, marginRight: i < card.words.length - 1 ? '0.26em' : 0}}>
        {w.t}
      </span>
    );
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        mixBlendMode: style === 'dot' ? 'difference' : 'normal',
      }}
    >
      <div
        style={{
          fontFamily: CAPTION_FONT,
          fontWeight: big ? 700 : 600,
          fontSize: big ? fs * 2.1 : fs,
          letterSpacing: '-0.03em',
          lineHeight: 1.12,
          textAlign: 'center',
          maxWidth: l.W * 0.84,
          textShadow: style === 'over' ? '0 0 0.35em rgba(0,0,0,0.55), 0 0 0.08em rgba(0,0,0,0.6)' : 'none',
          whiteSpace: 'pre-wrap',
        }}
      >
        {words}
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC<{l: L; filter?: (c: any) => boolean}> = ({l, filter}) => {
  const active = TL.cards.filter((c: any) => l.t >= c.words[0].s && l.t < c.e && (!filter || filter(c)));
  return (
    <>
      {active.map((c: any, i: number) => (
        <Caption key={i} card={c} l={l} />
      ))}
    </>
  );
};

// ---------- media helpers ----------
const Cover: React.FC<{src: string; video?: boolean; from?: number; style?: React.CSSProperties; scale?: number}> = ({src, video, from = 0, style, scale = 1}) => {
  const s: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, ...style};
  if (video) {
    return (
      <Sequence from={from} layout="none">
        <OffthreadVideo src={staticFile(src)} muted style={s} />
      </Sequence>
    );
  }
  return <Img src={staticFile(src)} style={s} />;
};

const Fit: React.FC<{src: string; video?: boolean; from?: number; aspect: number; frameAspect: number}> = ({src, video, from = 0, aspect, frameAspect}) => {
  const close = Math.abs(aspect / frameAspect - 1) < 0.18;
  if (close) return <Cover src={src} video={video} from={from} />;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(28px) brightness(0.45)', transform: 'scale(1.15)'}}>
        <Cover src={src} video={video} from={from} />
      </AbsoluteFill>
      <AbsoluteFill>
        <Cover src={src} video={video} from={from} style={{objectFit: 'contain'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const frameAspectFor = (l: L, a: number) => (l.V ? clamp(a, 0.75, 1.0) : a < 1.2 ? 16 / 9 : clamp(a, 1.3, 1.9));

// ---------- strobe ----------
const Strobe: React.FC<{l: L}> = ({l}) => {
  const imgs: string[] = AS.strobe;
  const end = TL.strobe[1];
  const idx = Math.min(imgs.length - 1, Math.floor(l.f / 2));
  const side = l.m;
  const outP = prog(l.t, end - 0.32, end);
  const local = (l.f % 2) / 2;
  const sc = lerp(1.04, 1.0, local) * lerp(1, 0.9, easeIn(outP));
  return (
    <AbsoluteFill style={{background: BLACK, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: side, height: side, overflow: 'hidden', opacity: 1 - easeIn(outP), transform: `scale(${sc})`}}>
        <Img src={staticFile(imgs[idx])} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- film frame (projector look) ----------
const tornPath = (seed: number) => {
  const pts: string[] = [];
  const N = 46;
  const j = (k: number) => rnd(seed + k) * 0.55 + (rnd(seed + k * 3.1) > 0.85 ? 0.5 : 0);
  for (let i = 0; i <= N; i++) pts.push(`${(i / N) * 100}% ${j(i)}%`);
  for (let i = 0; i <= N; i++) pts.push(`${100 - j(100 + i) * 0.6}% ${(i / N) * 100}%`);
  for (let i = N; i >= 0; i--) pts.push(`${(i / N) * 100}% ${100 - j(200 + i)}%`);
  for (let i = N; i >= 0; i--) pts.push(`${j(300 + i) * 0.6}% ${(i / N) * 100}%`);
  return `polygon(${pts.join(',')})`;
};
const TORN = tornPath(7);

const Grain: React.FC<{f: number; opacity?: number}> = ({f, opacity = 0.09}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id={`g${f}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 97} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#g${f})`} />
  </svg>
);

const FilmFrame: React.FC<{l: L; aspect: number; children: React.ReactNode; lower?: any; push?: number}> = ({l, aspect, children, lower, push = 0}) => {
  const maxW = l.V ? l.W * 0.86 : l.W * 0.66;
  const maxH = l.V ? l.H * 0.6 : l.H * 0.72;
  let w = maxW, h = maxW / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  const wx = (rnd(l.f * 1.7) - 0.5) * 3;
  const wy = (rnd(l.f * 2.3 + 9) - 0.5) * 3;
  const left = (l.W - w) / 2 + wx;
  const top = (l.H - h) / 2 + wy;
  const sp = h * 0.27;
  const showCode = l.f % 41 < 2 || l.f % 67 < 1;
  const scratchX = left + w + l.W * 0.045 + (rnd(l.f) - 0.5) * 4;
  const ltScale = Math.min(1.15, w / (l.V ? 700 : 900));
  return (
    <AbsoluteFill>
      {/* sprocket hole */}
      <div
        style={{
          position: 'absolute',
          left: left - sp * 0.62,
          top: top + h * 0.3,
          width: sp * 0.78,
          height: sp,
          borderRadius: sp * 0.16,
          border: `${Math.max(2, l.m * 0.0022)}px solid rgba(214,196,160,0.75)`,
          boxShadow: 'inset 0 0 6px rgba(255,240,200,0.25)',
        }}
      />
      {showCode && (
        <div
          style={{
            position: 'absolute',
            left: left - sp * 0.95,
            top: top + h * 0.12,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: MONO,
            fontSize: l.m * 0.016,
            letterSpacing: '0.5em',
            color: 'rgba(200,200,190,0.55)',
          }}
        >
          K O D A K  5 2 7 5 A
        </div>
      )}
      <div style={{position: 'absolute', left: scratchX, top: top - h * 0.05, width: 1.5, height: h * 1.1, background: `rgba(220,220,220,${0.15 + rnd(l.f * 5) * 0.45})`}} />
      <div style={{position: 'absolute', left, top, width: w, height: h, clipPath: TORN, overflow: 'hidden', background: '#111'}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + push})`}}>{children}</div>
        <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.45)'}} />
        <Grain f={l.f} />
        {lower && (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%', background: 'linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0))'}} />
        )}
        {lower && (
          <div style={{position: 'absolute', left: w * 0.05, bottom: h * 0.07, color: WHITE, fontFamily: LT_FONT, transformOrigin: 'left bottom', transform: `scale(${ltScale})`}}>
            <div style={{fontWeight: 700, fontSize: 46, letterSpacing: '-0.01em', lineHeight: 1.1}}>{lower.title}</div>
            <div style={{fontWeight: 400, fontSize: 23, opacity: 0.92, marginTop: 6}}>{lower.l2}</div>
            <div style={{fontWeight: 400, fontSize: 23, opacity: 0.92}}>{lower.l3}</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------- film burn flash ----------
const Flash: React.FC<{l: L; at: number[]}> = ({l, at}) => {
  if (!within(l.t, [at[0] - 0.01, at[1]])) return null;
  const p = prog(l.t, at[0], at[1]);
  const bp = easeOut(clamp(p / 0.55));
  const white = p < 0.28 ? 0 : p < 0.42 ? (p - 0.28) / 0.14 : p < 0.78 ? 1 : 1 - (p - 0.78) / 0.22;
  const size = Math.max(l.W, l.H) * 2.4;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: lerp(-size * 0.95, -size * 0.32, bp),
          top: lerp(-size * 0.85, -size * 0.3, bp),
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,252,244,1) 40%, rgba(240,228,206,0.95) 47%, rgba(255,160,80,0.55) 51%, rgba(70,200,225,0.5) 54%, rgba(0,0,0,0) 60%)',
          filter: 'blur(6px)',
          opacity: clamp(p / 0.12) * (p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1),
        }}
      />
      <AbsoluteFill style={{background: '#fffdf8', opacity: white}} />
    </AbsoluteFill>
  );
};

// ---------- eras ----------
const Eras: React.FC<{l: L}> = ({l}) => {
  const [a, b, c, d] = TL.eraCuts;
  const e = AS.eras;
  let item: any, start: number, endT: number;
  if (l.t < b) [item, start, endT] = [e.print, a, b];
  else if (l.t < c) [item, start, endT] = [e.television, b, c];
  else [item, start, endT] = [{feed: true, aspect: 16 / 9}, c, d];
  const push = 0.06 * prog(l.t, start, endT);
  return (
    <AbsoluteFill style={{background: BLACK}}>
      <FilmFrame l={l} aspect={frameAspectFor(l, item.aspect)} push={push}>
        {item.feed ? <Feed l={l} start={start} /> : <Fit src={item.src} video={item.video} from={Math.round(start * FPS)} aspect={item.aspect} frameAspect={frameAspectFor(l, item.aspect)} />}
      </FilmFrame>
      <Captions l={l} />
    </AbsoluteFill>
  );
};

const Feed: React.FC<{l: L; start: number}> = ({l, start}) => {
  const imgs: string[] = AS.feed;
  const el = l.t - start;
  return (
    <AbsoluteFill style={{background: '#0d0d0d', flexDirection: 'row', gap: '1.2%', padding: '0 1.2%'}}>
      {[0, 1, 2].map((c) => {
        const y = -(el * (0.55 + c * 0.18)) + (c % 2 ? -0.35 : 0);
        return (
          <div key={c} style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
            {Array.from({length: 7}).map((_, i) => (
              <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${(i * 0.78 + y) * 100}%`, height: '74%', borderRadius: 8, overflow: 'hidden'}}>
                <Img src={staticFile(imgs[(i * 3 + c * 2) % imgs.length])} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- old playbook collage -> explode -> dot -> iris ----------
const OLD_SLOTS = [
  [0, 0, 1.0, 1.0, -2], [1.02, -0.2, 0.9, 1.15, 3], [0.12, -1.02, 1.05, 0.8, -6], [-1.05, -0.55, 1.0, 0.85, 8],
  [-1.0, 0.6, 0.95, 1.0, -9], [0.15, 1.0, 1.1, 0.85, 6], [1.15, 0.95, 0.85, 0.95, -4], [-2.0, 0.05, 0.85, 1.05, 12], [2.05, 0.2, 0.9, 0.9, -12],
];
const OldCollage: React.FC<{l: L}> = ({l}) => {
  const tiles: any[] = AS.old;
  const T = l.m * (l.V ? 0.25 : 0.2);
  const ex = TL.oldCollage[1];
  const ep = easeOut(clamp((l.t - ex) / 0.4));
  const drift = Math.max(0, l.t - ex - 0.4) * 0.06;
  return (
    <>
      {tiles.slice(0, OLD_SLOTS.length).map((tile, i) => {
        const appear = TL.oldTiles[i];
        if (l.t < appear) return null;
        const [sx, sy0, sw, sh, rot] = OLD_SLOTS[i];
        const sy = sy0 * (l.V ? 1.35 : 1);
        const k = 1 + ep * (l.V ? 1.05 : 1.45) + drift;
        const x = l.W / 2 + sx * T * k - (sw * T) / 2;
        const y = l.H / 2 + sy * T * k - (sh * T) / 2;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: sw * T, height: sh * T, transform: `rotate(${rot * ep + rot * drift * 0.5}deg)`, boxShadow: '0 8px 30px rgba(0,0,0,0.5)'}}>
            <Img src={staticFile(tile)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        );
      })}
    </>
  );
};

const Dot: React.FC<{l: L}> = ({l}) => {
  const [r0, r1] = TL.dotRise;
  if (l.t < r0) return null;
  const grow = prog(l.t, r1, r1 + 0.22);
  const iris = easeIn(prog(l.t, TL.iris[0], TL.iris[1]));
  const rise = easeInOut(prog(l.t, r0 + 0.1, r1));
  const y = lerp(l.H / 2 + l.m * 0.28, l.H / 2, rise);
  const appear = easeOut(prog(l.t, r0, r0 + 0.15));
  const base = l.m * 0.012 * appear;
  const rWord = l.m * (l.V ? 0.16 : 0.11);
  const rFull = Math.hypot(l.W, l.H) * 0.62;
  const r = lerp(lerp(base, rWord, easeOutBack(grow)), rFull, iris);
  return (
    <div
      style={{
        position: 'absolute',
        left: l.W / 2 - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: WHITE,
        boxShadow: `0 0 ${l.m * 0.03}px ${l.m * 0.012}px rgba(255,255,255,0.65)`,
      }}
    />
  );
};

// ---------- tools pop + whip ----------
const TOOLS: [string, string, string][] = [
  ['ChatGPT', '#10A37F', WHITE], ['Claude', '#D97757', WHITE], ['Gemini', '#4C8DF6', WHITE], ['Midjourney', '#151515', WHITE],
  ['Veo', '#CFF56A', BLACK], ['Kling', '#7C5CFF', WHITE], ['Runway', '#E5484D', WHITE], ['ElevenLabs', '#F2C94C', BLACK],
];
const Tools: React.FC<{l: L}> = ({l}) => {
  const [a, whip] = TL.tools;
  if (l.t < a || l.t > whip + 0.7) return null;
  const fs = l.V ? 40 : 34;
  return (
    <>
      {TOOLS.map(([name, bg, fg], i) => {
        const ti = TL.toolTimes[i];
        if (l.t < ti) return null;
        const ang = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2 + 0.3;
        const rx = l.V ? l.W * 0.3 : l.W * 0.27;
        const ry = l.V ? l.H * 0.17 : l.H * 0.29;
        const cx = l.W / 2 + Math.cos(ang) * rx;
        const cy = l.H / 2 + Math.sin(ang) * ry;
        const sc = easeOutBack(clamp((l.t - ti) / (8 / FPS)));
        const wp = clamp((l.t - whip - i * 0.025) / 0.42);
        const dx = easeIn(wp) * l.W * 1.3;
        const v = 3 * wp * wp * l.W * 1.3 * (1 / 0.42) / FPS; // px per frame
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: cx + dx,
              top: cy,
              transform: `translate(-50%,-50%) scale(${sc}) scaleX(${1 + v / 260})`,
              filter: v > 2 ? `blur(${Math.min(18, v / 9)}px)` : 'none',
              background: bg,
              color: fg,
              fontFamily: CAPTION_FONT,
              fontWeight: 700,
              fontSize: fs,
              letterSpacing: '-0.02em',
              padding: '0.5em 0.8em',
              borderRadius: '0.55em',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </div>
        );
      })}
    </>
  );
};

// ---------- studio collage ----------
const StudioCollage: React.FC<{l: L}> = ({l}) => {
  const tiles: any[] = AS.studioTiles;
  const slots = l.V ? AS.studioSlotsV : AS.studioSlotsH;
  return (
    <>
      {tiles.map((tile, i) => {
        const at = TL.studioTiles[i];
        if (l.t < at) return null;
        const s = slots[tile.slot];
        const w = s[2] * l.W, h = s[3] * l.H;
        return (
          <div key={i} style={{position: 'absolute', left: s[0] * l.W - w / 2, top: s[1] * l.H - h / 2, width: w, height: h, overflow: 'hidden', zIndex: i}}>
            <Cover src={tile.src} video={tile.video} from={Math.round(at * FPS)} />
          </div>
        );
      })}
    </>
  );
};

// ---------- gap split ----------
const GapSplit: React.FC<{l: L}> = ({l}) => {
  const a = TL.gapSplit;
  const p1 = easeOut(prog(l.t, a, a + 4 / FPS));
  const p2 = easeInOut(prog(l.t, a + 3 / FPS, a + 8 / FPS));
  const p3 = easeIn(prog(l.t, a + 6 / FPS, a + 10 / FPS));
  const bars: number[][] = [];
  const cw = lerp(0, l.W * 0.12, p1) + p2 * l.W * 0.25 + p3 * l.W;
  bars.push([l.W / 2 - cw / 2, cw]);
  const bw = l.W * 0.16 * p2 * (1 - p3);
  const bx = lerp(l.W, l.W * 0.12, p2);
  if (p2 > 0 && p3 < 1) bars.push([bx, bw]);
  return (
    <>
      {bars.map(([x, w], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: 0, width: w, height: l.H, background: WHITE, mixBlendMode: 'difference'}} />
      ))}
    </>
  );
};

const GapWord: React.FC<{l: L}> = ({l}) => {
  const a = TL.gapSplit;
  if (l.t < a || l.t >= TL.dotBetween) return null;
  const fs = l.V ? 60 : 44;
  const off = easeOut(prog(l.t, a, a + 5 / FPS)) * l.W * 0.07;
  const half = (side: 'l' | 'r') => (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${side === 'l' ? -off : off}px)`, clipPath: side === 'l' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)'}}>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 600, fontSize: fs, letterSpacing: '-0.03em', color: BLACK}}>gap</div>
    </AbsoluteFill>
  );
  return (
    <>
      {half('l')}
      {half('r')}
    </>
  );
};

// ---------- dot ring ----------
const Ring: React.FC<{l: L}> = ({l}) => {
  const a = TL.dotBetween, rin = TL.ringIn, merge = TL.ringMerge, endT = TL.blackWords;
  if (l.t < a || l.t >= endT) return null;
  const glow = (r: number) => `0 0 ${r * 0.9}px ${r * 0.25}px rgba(255,255,255,0.55)`;
  const fade = 1 - prog(l.t, merge + 0.25, endT - 0.05);
  const rc = l.m * (l.V ? 0.11 : 0.075) * easeOutBack(prog(l.t, a, a + 6 / FPS)) * (0.4 + 0.6 * fade);
  const out: React.ReactNode[] = [
    <div key="c" style={{position: 'absolute', left: l.W / 2 - rc, top: l.H / 2 - rc, width: rc * 2, height: rc * 2, borderRadius: '50%', background: WHITE, boxShadow: glow(rc), opacity: fade}} />,
  ];
  if (l.t >= rin) {
    const fly = easeOut(prog(l.t, rin, rin + 0.4));
    const shrink = easeIn(prog(l.t, rin + 0.4, merge));
    const R0 = l.m * (l.V ? 0.36 : 0.33);
    const R = lerp(Math.max(l.W, l.H) * 0.9, R0, fly) * (1 - shrink);
    const rot = (l.t - rin) * 0.9 + shrink * 2.2;
    const rd = l.m * 0.045 * (1 - shrink * 0.45);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + rot;
      const x = l.W / 2 + Math.cos(ang) * R, y = l.H / 2 + Math.sin(ang) * R;
      out.push(<div key={i} style={{position: 'absolute', left: x - rd, top: y - rd, width: rd * 2, height: rd * 2, borderRadius: '50%', background: WHITE, boxShadow: glow(rd), opacity: fade}} />);
    }
  }
  return <>{out}</>;
};

// ---------- proof (studio work in projector frame) ----------
const Proof: React.FC<{l: L}> = ({l}) => {
  const clip = TL.proofClips.find((c: any) => l.t >= c.s && l.t < c.e) || TL.proofClips[TL.proofClips.length - 1];
  const media = AS.proof[clip.key];
  let content: React.ReactNode;
  const fa = frameAspectFor(l, media.aspect);
  if (media.images) {
    const k = Math.floor((l.t - clip.s) * FPS / 5) % media.images.length;
    content = <Fit src={media.images[k]} aspect={media.aspect} frameAspect={fa} />;
  } else content = <Fit src={media.src} video from={Math.round(clip.s * FPS)} aspect={media.aspect} frameAspect={fa} />;
  const push = 0.05 * prog(l.t, clip.s, clip.e);
  return (
    <AbsoluteFill style={{background: BLACK}}>
      <FilmFrame l={l} aspect={fa} lower={clip} push={push}>
        {content}
      </FilmFrame>
    </AbsoluteFill>
  );
};

// ---------- fork lines ----------
const Fork: React.FC<{l: L}> = ({l}) => {
  const a = TL.forkDraw, sp = TL.forkSplit, re = TL.forkRetract;
  if (l.t < a) return null;
  const g0 = l.V ? l.H * 0.055 : l.H * 0.12;
  const g1 = l.V ? l.H * 0.11 : l.H * 0.2;
  const bx = l.W * (l.V ? 0.5 : 0.55);
  const dd = g1 - g0;
  const path = (sgn: number) => {
    const y0 = l.H / 2 + sgn * g0, y1 = l.H / 2 + sgn * g1;
    return `M ${-20} ${y0} L ${bx} ${y0} L ${bx + dd} ${y1} L ${l.W + 40} ${y1}`;
  };
  const total = bx + 20 + Math.hypot(dd, dd) + (l.W + 40 - bx - dd);
  const firstLen = (bx * 0.86 + 20) / total;
  const draw = easeOut(prog(l.t, a, a + 0.7)) * firstLen;
  const split = easeInOut(prog(l.t, sp, sp + 0.65));
  const head = draw + split * (1 - firstLen);
  const tail = easeIn(prog(l.t, re, re + 1.1));
  const len = Math.max(0, head - tail);
  const sw = l.m * 0.0085;
  return (
    <svg width={l.W} height={l.H} style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 ${sw * 1.4}px rgba(255,255,255,0.85))`}}>
      {[-1, 1].map((s) => (
        <path key={s} d={path(s)} pathLength={1} fill="none" stroke={WHITE} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len} 2`} strokeDashoffset={-tail} />
      ))}
    </svg>
  );
};

// ---------- logo + url ----------
const Logo: React.FC<{l: L}> = ({l}) => {
  const [a] = TL.logo;
  const p = easeOut(prog(l.t, a, a + 13 / FPS));
  const mh = l.m * (l.V ? 0.17 : 0.14);
  return (
    <AbsoluteFill style={{background: BLACK, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: mh * 0.32, clipPath: `inset(-10% ${(1 - p) * 100}% -10% -10%)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: mh * 0.28}}>
          <Img src={staticFile('brand/logo_mark.png')} style={{height: mh}} />
          <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, color: WHITE, fontSize: mh * 0.42, lineHeight: 0.98, letterSpacing: '-0.035em'}}>
            Ideabro
            <br />
            Studio
          </div>
        </div>
        <div style={{fontFamily: MONO, fontWeight: 500, color: WHITE, fontSize: mh * 0.19, border: `${Math.max(2, mh * 0.016)}px solid ${WHITE}`, borderRadius: 999, padding: `${mh * 0.06}px ${mh * 0.18}px`, letterSpacing: '0.01em'}}>
          join AI in Advertising
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Url: React.FC<{l: L}> = ({l}) => (
  <AbsoluteFill style={{background: BLACK, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: MONO, color: WHITE, fontSize: l.V ? 44 : 34, textAlign: 'center', lineHeight: 1.45, letterSpacing: '-0.01em'}}>
      {l.V ? (
        <>
          community.ideabrostudio.com
          <br />
          /courses/ai-and-advertising
        </>
      ) : (
        'community.ideabrostudio.com/courses/ai-and-advertising'
      )}
    </div>
  </AbsoluteFill>
);

// ---------- main ----------
export const Trailer: React.FC = () => {
  useFonts();
  const l = useL();
  const t = l.t;
  const scenes: React.ReactNode[] = [];

  if (t < TL.strobe[1]) {
    scenes.push(<Strobe key="strobe" l={l} />, <Captions key="c" l={l} />);
  } else if (t < TL.eras[0]) {
    scenes.push(<AbsoluteFill key="bg" style={{background: BLACK}} />, <Captions key="c" l={l} />);
  } else if (t < TL.eras[1]) {
    scenes.push(<Eras key="eras" l={l} />);
  } else if (t < TL.iris[1]) {
    scenes.push(
      <AbsoluteFill key="bg" style={{background: BLACK}}>
        <OldCollage l={l} />
        <Dot l={l} />
        <Captions l={l} filter={(c) => c.style !== 'fade'} />
      </AbsoluteFill>
    );
  } else if (t < TL.gapSplit + 10 / FPS) {
    scenes.push(
      <AbsoluteFill key="white" style={{background: WHITE}}>
        {within(t, TL.studioCollage) && <StudioCollage l={l} />}
        <Tools l={l} />
        <Captions l={l} filter={(c) => c.style !== 'gap' && c.style !== 'dot'} />
        <GapWord l={l} />
        {t >= TL.gapSplit && <GapSplit l={l} />}
      </AbsoluteFill>
    );
  } else if (t < TL.proof[0]) {
    scenes.push(
      <AbsoluteFill key="dark" style={{background: BLACK}}>
        <Ring l={l} />
        <Captions l={l} />
      </AbsoluteFill>
    );
  } else if (t < TL.flash3[0] + 0.15) {
    scenes.push(<Proof key="proof" l={l} />);
  } else if (t < TL.logo[0]) {
    scenes.push(
      <AbsoluteFill key="fork" style={{background: BLACK}}>
        <Fork l={l} />
        <Captions l={l} />
      </AbsoluteFill>
    );
  } else if (t < TL.url[0]) {
    scenes.push(<Logo key="logo" l={l} />);
  } else {
    scenes.push(<Url key="url" l={l} />);
  }

  return (
    <AbsoluteFill style={{background: BLACK, overflow: 'hidden'}}>
      {scenes}
      <Flash l={l} at={TL.flash1} />
      <Flash l={l} at={TL.flash2} />
      <Flash l={l} at={TL.flash3} />
    </AbsoluteFill>
  );
};
